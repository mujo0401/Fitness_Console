import os
import time
import requests
from flask import Blueprint, jsonify, request, redirect, session, current_app
from functools import wraps
from werkzeug.exceptions import HTTPException
from urllib.parse import urlencode
import json
import logging
from datetime import datetime, timedelta

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

google_fit_bp = Blueprint('google_fit', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'google_fit_token' not in session:
            return jsonify({"error": "Not logged in to Google Fit"}), 401
        return f(*args, **kwargs)
    return decorated_function

def check_required_scopes(token_info):
    """Check if token has all required scopes for fitness data"""
    required_scopes = [
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.activity.read'
    ]
    
    if not token_info or 'scope' not in token_info:
        logger.error("Token does not contain scope information")
        return False
        
    scopes = token_info.get('scope', '').split(' ')
    logger.info(f"Token scopes: {scopes}")
    
    for scope in required_scopes:
        if scope not in scopes:
            logger.error(f"Missing required scope: {scope}")
            return False
            
    return True

def refresh_token_if_needed():
    """Refresh the Google Fit token if it's expired"""
    if 'google_fit_token' not in session:
        logger.error("No Google Fit token in session")
        return False
    
    token_info = session['google_fit_token']
    
    # Force session persistence
    session.modified = True
    
    # Check if token has required scopes
    has_required_scopes = check_required_scopes(token_info)
    if not has_required_scopes:
        logger.error("Token missing required scopes - this can prevent activity data from being returned")
        # Log what scopes are present vs what's required for better diagnosis
        if 'scope' in token_info:
            scopes = token_info.get('scope', '').split(' ')
            required = ['https://www.googleapis.com/auth/fitness.heart_rate.read', 'https://www.googleapis.com/auth/fitness.activity.read']
            logger.error(f"Current scopes: {scopes}")
            logger.error(f"Required scopes: {required}")
            logger.error(f"Missing scopes: {[s for s in required if s not in scopes]}")
        return False
    
    # Check if token is expired
    if token_info.get('expires_at', 0) < time.time():
        logger.info("Google Fit token expired, refreshing...")
        try:
            refresh_token = token_info.get('refresh_token')
            if not refresh_token:
                logger.error("No refresh token available")
                return False
                
            client_id = current_app.config['GOOGLE_FIT_CLIENT_ID']
            client_secret = current_app.config['GOOGLE_FIT_CLIENT_SECRET']
            token_url = current_app.config['GOOGLE_FIT_TOKEN_URL']
            
            payload = {
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            logger.info(f"Refreshing token with client ID: {client_id}")
            response = requests.post(token_url, data=payload)
            
            if response.status_code == 200:
                new_token_info = response.json()
                # Update token information but preserve refresh token
                new_token_info['refresh_token'] = refresh_token
                new_token_info['expires_at'] = time.time() + new_token_info.get('expires_in', 3600)
                session['google_fit_token'] = new_token_info
                
                # Force session save
                session.modified = True
                
                logger.info("Successfully refreshed Google Fit token")
                
                # Verify the new token has required scopes
                return check_required_scopes(new_token_info)
            else:
                logger.error(f"Failed to refresh token: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return False
    
    return True

@google_fit_bp.route('/auth')
def auth():
    """Initiate Google Fit OAuth flow"""
    # Build the authorization URL
    client_id = current_app.config['GOOGLE_FIT_CLIENT_ID']
    redirect_uri = current_app.config['GOOGLE_FIT_REDIRECT_URI']
    auth_url = current_app.config['GOOGLE_FIT_AUTH_URL']
    scopes = current_app.config['GOOGLE_FIT_SCOPES']
    
    logger.info(f"Google Fit Client ID: {client_id}")
    logger.info(f"Google Fit Redirect URI: {redirect_uri}")
    
    # Check if client ID is available
    if not client_id:
        logger.error("Google Fit Client ID is not configured")
        return jsonify({"error": "Google Fit Client ID is not configured"}), 500
    
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': ' '.join(scopes),
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"{auth_url}?{urlencode(params)}"
    
    # Store the state in the session for later validation
    session['google_fit_oauth_state'] = 'pending'
    
    logger.info(f"Redirecting to Google Fit auth URL: {auth_url}")
    return redirect(auth_url)

@google_fit_bp.route('/callback')
def callback():
    """Handle the OAuth callback from Google Fit"""
    logger.info("Google Fit callback received")
    logger.info(f"Request args: {request.args}")
    
    error = request.args.get('error')
    if error:
        logger.error(f"OAuth error: {error}")
        return jsonify({"error": f"Authorization failed: {error}"}), 400
        
    code = request.args.get('code')
    if not code:
        logger.error("No authorization code received")
        return jsonify({"error": "No authorization code received"}), 400
        
    try:
        # Exchange the authorization code for an access token
        client_id = current_app.config['GOOGLE_FIT_CLIENT_ID']
        client_secret = current_app.config['GOOGLE_FIT_CLIENT_SECRET']
        token_url = current_app.config['GOOGLE_FIT_TOKEN_URL']
        redirect_uri = current_app.config['GOOGLE_FIT_REDIRECT_URI']
        
        payload = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }
        
        response = requests.post(token_url, data=payload)
        
        if response.status_code != 200:
            logger.error(f"Token exchange failed: {response.text}")
            return jsonify({"error": f"Token exchange failed: {response.status_code}"}), 400
            
        token_info = response.json()
        
        # Add expiration time
        token_info['expires_at'] = time.time() + token_info.get('expires_in', 3600)
        
        # Store token in session
        session['google_fit_token'] = token_info
        session['google_fit_oauth_state'] = 'authenticated'
        
        logger.info("Successfully authenticated with Google Fit")
        
        # Redirect to the frontend
        frontend_url = current_app.config['FRONTEND_URL']
        return redirect(f"{frontend_url}?google_fit_connected=true")
        
    except Exception as e:
        logger.error(f"Error during callback: {str(e)}")
        return jsonify({"error": f"Authorization failed: {str(e)}"}), 500

@google_fit_bp.route('/profile')
@login_required
def get_profile():
    """Get user profile information from Google Fit"""
    if not refresh_token_if_needed():
        return jsonify({"error": "Failed to refresh token"}), 401
        
    token_info = session['google_fit_token']
    access_token = token_info.get('access_token')
    
    headers = {
        'Authorization': f"Bearer {access_token}"
    }
    
    try:
        # Get user profile from Google's userinfo endpoint
        response = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to get user profile: {response.text}")
            return jsonify({"error": "Failed to get user profile"}), response.status_code
            
        profile_data = response.json()
        
        # Return simplified profile data with user field for consistency with Fitbit API
        return jsonify({
            "user": {
                "userId": profile_data.get('id'),
                "displayName": profile_data.get('name'),
                "fullName": profile_data.get('name'),
                "email": profile_data.get('email'),
                "avatar": profile_data.get('picture'),
                "picture": profile_data.get('picture')
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        return jsonify({"error": f"Failed to get user profile: {str(e)}"}), 500

# Function to parse date parameter from frontend
def parse_date_param(date_param):
    """Parse date parameter and return start/end time in unix timestamp"""
    today = datetime.now()
    
    try:
        # If date parameter is provided, use it
        if date_param:
            # Check if the date is in the future
            date_obj = datetime.strptime(date_param, '%Y-%m-%d')
            if date_obj.date() > today.date():
                logger.warning(f"Future date requested: {date_param}, using today instead")
                date_obj = today
        else:
            # If no date provided, use today
            date_obj = today
            
        # Set start time to beginning of the day (midnight)
        start_date = datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0)
        
        # Set end time based on whether we're requesting today or a past date
        if date_obj.date() == today.date():
            # For today, use current time plus a small buffer to ensure we get latest data
            end_date = today + timedelta(minutes=5)  # Add 5 minutes buffer
            logger.info(f"Using current time for today's data: {end_date}")
        else:
            # For past dates, use end of day
            end_date = datetime(date_obj.year, date_obj.month, date_obj.day, 23, 59, 59)
        
        # Convert to Unix timestamps
        start_time = int(start_date.timestamp())
        end_time = int(end_date.timestamp())
        
        logger.info(f"Date range: {start_date} to {end_date}")
        return start_time, end_time, date_obj.strftime('%Y-%m-%d')
    except ValueError:
        logger.error(f"Invalid date format: {date_param}")
        # Use today as fallback
        today_start = datetime(today.year, today.month, today.day, 0, 0, 0)
        today_end = today  # Use current time for today
        logger.info(f"Using today as fallback: {today_start} to {today_end}")
        return int(today_start.timestamp()), int(today_end.timestamp()), today.strftime('%Y-%m-%d')

@google_fit_bp.route('/heart-rate')
@login_required
def get_heart_rate():
    """Get heart rate data from Google Fit"""
    if not refresh_token_if_needed():
        return jsonify({"error": "Failed to refresh token"}), 401
    
    # Get date parameter from frontend (in YYYY-MM-DD format)
    date_param = request.args.get('date')
    period = request.args.get('period', 'day')
    
    # Parse and validate date parameter
    start_time, end_time, date_str = parse_date_param(date_param)
    
    # Check if we have data past 6 AM. If not, request a full day of data.
    # This is a workaround for the Google Fit API sometimes only returning partial day data
    if datetime.fromtimestamp(end_time).hour < 12:
        # Use current time as the end time to get as much data as possible
        current_time = datetime.now()
        end_time = int(current_time.timestamp())
    
    # For multi-day periods, adjust the start time
    if period == 'week':
        start_time = end_time - (7 * 86400)  # 7 days in seconds
    elif period == 'month':
        start_time = end_time - (30 * 86400)  # 30 days in seconds
    
    logger.info(f"Fetching Google Fit heart rate data for period {period} from {start_time} to {end_time}")
    
    token_info = session['google_fit_token']
    access_token = token_info.get('access_token')
    
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    
    # Prepare data source for heart rate
    data_source = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm"
    
    # Log the time range for debugging
    start_datetime = datetime.fromtimestamp(start_time)
    end_datetime = datetime.fromtimestamp(end_time)
    logger.info(f"Requesting data from {start_datetime} to {end_datetime}")
    
    # Create body for request
    body = {
        "aggregateBy": [{
            "dataTypeName": "com.google.heart_rate.bpm",
            "dataSourceId": data_source
        }],
        "bucketByTime": {"durationMillis": 60000},  # 1-minute intervals
        "startTimeMillis": int(start_time) * 1000,
        "endTimeMillis": int(end_time) * 1000
    }
    
    try:
        api_url = f"{current_app.config['GOOGLE_FIT_API_BASE_URL']}/users/me/dataset:aggregate"
        response = requests.post(api_url, headers=headers, json=body)
        
        if response.status_code != 200:
            logger.error(f"Failed to get heart rate data: {response.text}")
            return jsonify({"error": "Failed to get heart rate data"}), response.status_code
            
        data = response.json()
        
        # Process the response to extract heart rate values
        heart_rate_data = []
        
        if 'bucket' in data:
            for bucket in data['bucket']:
                if 'dataset' in bucket:
                    for dataset in bucket['dataset']:
                        if 'point' in dataset:
                            for point in dataset['point']:
                                if 'value' in point:
                                    for value in point['value']:
                                        if 'fpVal' in value:  # Heart rate value
                                            timestamp = int(int(bucket['startTimeMillis']) / 1000)  # Convert to seconds
                                            heart_rate = value['fpVal']
                                            
                                            # Convert timestamp to readable time format
                                            time_obj = datetime.fromtimestamp(timestamp)
                                            time_str = time_obj.strftime('%I:%M:%S %p')  # 12-hour format with AM/PM
                                            date_str = time_obj.strftime('%Y-%m-%d')
                                            
                                            # Format for consistency with Fitbit API
                                            heart_rate_data.append({
                                                "timestamp": timestamp,
                                                "value": heart_rate,
                                                "time": time_str,
                                                "date": date_str
                                            })
        
        # Check if we have data
        if not heart_rate_data:
            logger.warning(f"No heart rate data found for period {period} from {start_time} to {end_time}")
            # Current date check for better error messaging
            today_date = datetime.now().strftime('%Y-%m-%d')
            requested_date = datetime.fromtimestamp(start_time).strftime('%Y-%m-%d')
            is_today = (requested_date == today_date)
            
            if is_today:
                logger.info("Request is for current day data. This is normal if no data exists for today yet.")
            
        # Check if we have data for the full day (or at least past noon)
        latest_time = "00:00:00"
        if heart_rate_data:
            for point in heart_rate_data:
                if point.get('time', '') > latest_time:
                    latest_time = point['time']
            
            # Log the time range of data
            earliest_time = heart_rate_data[0]['time'] if heart_rate_data else "unknown"
            logger.info(f"Heart rate data time range: {earliest_time} to {latest_time}")
            
            # Check if data stops early in the day
            is_am_pm_format = "AM" in latest_time or "PM" in latest_time
            if is_am_pm_format:
                is_morning = "AM" in latest_time
                if is_morning:
                    logger.warning(f"Google Fit data appears to be truncated - only received morning data until {latest_time}")
            else:
                time_parts = latest_time.split(':')
                if len(time_parts) > 0 and int(time_parts[0]) < 12:
                    logger.warning(f"Google Fit data appears to be truncated - only received data until {latest_time}")
        
        # For empty data on current day, create a placeholder with current time
        if not heart_rate_data and date_str == datetime.now().strftime('%Y-%m-%d'):
            current_time = datetime.now()
            now_str = current_time.strftime('%I:%M:%S %p')  # 12-hour format with AM/PM
            logger.info(f"Adding placeholder data point for current time: {now_str}")
            
            # Add a placeholder point with metadata
            heart_rate_data.append({
                "timestamp": int(current_time.timestamp()),
                "value": 0,  # Empty value
                "time": now_str,
                "date": date_str,
                "placeholder": True,  # Flag to identify this as placeholder
                "message": "No heart rate data available yet for today. Please check back later."
            })
            
        # Format the response to match the Fitbit API format
        return jsonify({
            'data': heart_rate_data,
            'period': period,
            'start_date': datetime.fromtimestamp(start_time).strftime('%Y-%m-%d'),
            'end_date': datetime.fromtimestamp(end_time).strftime('%Y-%m-%d')
        })
        
    except Exception as e:
        logger.error(f"Error getting heart rate data: {str(e)}")
        return jsonify({"error": f"Failed to get heart rate data: {str(e)}"}), 500

@google_fit_bp.route('/activity')
@login_required
def get_activity():
    """Get activity data from Google Fit"""
    if not refresh_token_if_needed():
        return jsonify({"error": "Failed to refresh token"}), 401
        
    token_info = session['google_fit_token']
    access_token = token_info.get('access_token')
    
    # Get parameters from request
    start_time = request.args.get('start_time', int(time.time() - 604800))  # Default to last week
    end_time = request.args.get('end_time', int(time.time()))
    
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    
    # Create body for request - get steps, calories, and active minutes
    body = {
        "aggregateBy": [
            {
                "dataTypeName": "com.google.step_count.delta",
                "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            },
            {
                "dataTypeName": "com.google.calories.expended",
                "dataSourceId": "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended"
            },
            {
                "dataTypeName": "com.google.active_minutes",
                "dataSourceId": "derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes"
            }
        ],
        "bucketByTime": {"durationMillis": 86400000},  # Daily buckets
        "startTimeMillis": int(start_time) * 1000,
        "endTimeMillis": int(end_time) * 1000
    }
    
    try:
        api_url = f"{current_app.config['GOOGLE_FIT_API_BASE_URL']}/users/me/dataset:aggregate"
        response = requests.post(api_url, headers=headers, json=body)
        
        if response.status_code != 200:
            logger.error(f"Failed to get activity data: {response.text}")
            return jsonify({"error": "Failed to get activity data"}), response.status_code
            
        data = response.json()
        
        # Log the raw data structure for debugging
        logger.info(f"Google Fit activity response structure: {json.dumps(data, indent=2)[:500]}...")
        
        # Process the response to extract activity values
        activity_data = []
        
        if 'bucket' in data:
            for bucket in data['bucket']:
                day_data = {
                    "date": time.strftime('%Y-%m-%d', time.localtime(int(bucket['startTimeMillis']) / 1000)),
                    "steps": 0,
                    "calories": 0,
                    "activeMinutes": 0,
                    "dateTime": time.strftime('%Y-%m-%d', time.localtime(int(bucket['startTimeMillis']) / 1000))  # Add dateTime field for frontend compatibility
                }
                
                if 'dataset' in bucket:
                    for dataset in bucket['dataset']:
                        logger.info(f"Processing dataset: {dataset.get('dataSourceId', 'unknown')}")
                        if 'point' in dataset:
                            for point in dataset['point']:
                                if 'value' in point:
                                    for value in point['value']:
                                        if dataset['dataSourceId'].endswith('estimated_steps') and 'intVal' in value:
                                            day_data['steps'] += value['intVal']
                                        elif dataset['dataSourceId'].endswith('merge_calories_expended') and 'fpVal' in value:
                                            day_data['calories'] += value['fpVal']
                                        elif dataset['dataSourceId'].endswith('merge_active_minutes') and 'intVal' in value:
                                            day_data['activeMinutes'] += value['intVal']
                
                # Calculate distance based on steps (approximation if not available)
                day_data['distance'] = round(day_data['steps'] / 1300, 2)  # Rough approximation: 1300 steps ≈ 1 km
                
                logger.info(f"Processed activity data for {day_data['date']}: {day_data}")
                activity_data.append(day_data)
        
        logger.info(f"Returning {len(activity_data)} activity data points")
        return jsonify(activity_data)
        
    except Exception as e:
        logger.error(f"Error getting activity data: {str(e)}")
        return jsonify({"error": f"Failed to get activity data: {str(e)}"}), 500

@google_fit_bp.route('/sleep')
@login_required
def get_sleep():
    """Get sleep data from Google Fit"""
    if not refresh_token_if_needed():
        return jsonify({"error": "Failed to refresh token"}), 401
        
    token_info = session['google_fit_token']
    access_token = token_info.get('access_token')
    
    # Get parameters from request
    start_time = request.args.get('start_time', int(time.time() - 604800))  # Default to last week
    end_time = request.args.get('end_time', int(time.time()))
    
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    
    # Sleep API endpoint
    api_url = f"{current_app.config['GOOGLE_FIT_API_BASE_URL']}/users/me/sessions"
    params = {
        'startTime': time.strftime('%Y-%m-%dT%H:%M:%S.%fZ', time.gmtime(int(start_time))),
        'endTime': time.strftime('%Y-%m-%dT%H:%M:%S.%fZ', time.gmtime(int(end_time))),
        'activityType': 72  # Sleep activity type in Google Fit
    }
    
    try:
        response = requests.get(api_url, headers=headers, params=params)
        
        if response.status_code != 200:
            logger.error(f"Failed to get sleep data: {response.text}")
            return jsonify({"error": "Failed to get sleep data"}), response.status_code
            
        data = response.json()
        
        # Process the response to extract sleep sessions
        sleep_data = []
        
        if 'session' in data:
            for session in data['session']:
                sleep_session = {
                    "startTime": int(session.get('startTimeMillis', 0) / 1000),
                    "endTime": int(session.get('endTimeMillis', 0) / 1000),
                    "name": session.get('name', 'Sleep'),
                    "duration": int((int(session.get('endTimeMillis', 0)) - int(session.get('startTimeMillis', 0))) / 1000 / 60)  # Duration in minutes
                }
                sleep_data.append(sleep_session)
        
        return jsonify(sleep_data)
        
    except Exception as e:
        logger.error(f"Error getting sleep data: {str(e)}")
        return jsonify({"error": f"Failed to get sleep data: {str(e)}"}), 500

@google_fit_bp.route('/status')
def connection_status():
    """Check if the user is connected to Google Fit"""
    logger.info("=== GOOGLE FIT STATUS ENDPOINT CALLED ===")
    logger.info(f"Session keys: {list(session.keys())}")
    
    # Check for force reconnect parameter
    force_reconnect = request.args.get('force_reconnect', 'false').lower() == 'true'
    logger.info(f"Force reconnect requested: {force_reconnect}")
    
    # Check for explicit disconnection
    if session.get('google_fit_explicitly_disconnected') == True and not force_reconnect:
        logger.info("Google Fit explicitly disconnected flag is set - reporting not connected")
        return jsonify({"connected": False})
    
    # If force reconnect, clear any disconnect flags
    if force_reconnect:
        logger.info("Force reconnect requested - clearing disconnect flag")
        session.pop('google_fit_explicitly_disconnected', None)
        session.modified = True
    
    # Check for token presence
    is_connected = 'google_fit_token' in session and session.get('google_fit_oauth_state') == 'authenticated'
    logger.info(f"Token present: {'google_fit_token' in session}")
    logger.info(f"OAuth state: {session.get('google_fit_oauth_state')}")
    
    # If force reconnect and in development, just return connected
    if force_reconnect and os.environ.get('FLASK_ENV') == 'development':
        logger.info("Development mode with force_reconnect - assuming connected")
        return jsonify({"connected": True})
    
    # For regular checks, verify the token is valid (unless force_reconnect)
    if is_connected and not force_reconnect:
        token_valid = refresh_token_if_needed()
        if not token_valid:
            is_connected = False
            logger.info("Token refresh failed, setting connected to false")
    
    logger.info(f"Final connection status: {is_connected}")
    return jsonify({
        "connected": is_connected
    })

@google_fit_bp.route('/disconnect')
def disconnect():
    """Disconnect from Google Fit by removing the token from session"""
    logger.info("Google Fit disconnect endpoint called")
    
    if 'google_fit_token' in session:
        # Get token info
        token_info = session['google_fit_token']
        access_token = token_info.get('access_token')
        
        try:
            # Revoke the token
            revoke_url = 'https://oauth2.googleapis.com/revoke'
            requests.post(revoke_url, params={'token': access_token}, 
                         headers={'Content-Type': 'application/x-www-form-urlencoded'})
            logger.info("Google token revocation API call completed")
        except Exception as e:
            logger.error(f"Error revoking token: {str(e)}")
        
        # Remove from session regardless of revocation success
        session.pop('google_fit_token', None)
        session.pop('google_fit_oauth_state', None)
    
    # Set explicit disconnect flag to prevent auto-reconnection
    session['google_fit_explicitly_disconnected'] = True
    session.modified = True
    logger.info("Set google_fit_explicitly_disconnected flag")
    
    logger.info("Google Fit disconnected successfully")
    return jsonify({"success": True, "message": "Disconnected from Google Fit"})