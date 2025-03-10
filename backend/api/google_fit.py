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
            logger.info(f"CRITICAL: Received explicit date parameter: '{date_param}'")
            try:
                # Check if the date is in the future
                date_obj = datetime.strptime(date_param, '%Y-%m-%d')
                logger.info(f"Successfully parsed date parameter to: {date_obj.strftime('%Y-%m-%d')}")
                
                if date_obj.date() > today.date():
                    logger.warning(f"Future date requested: {date_param}, using today instead")
                    date_obj = today
            except ValueError as e:
                logger.error(f"Could not parse date '{date_param}': {str(e)}")
                date_obj = today
        else:
            # If no date provided, use today
            logger.info("No date parameter provided, using today's date")
            date_obj = today
            
        # IMPORTANT: Capture the precise date we're looking for
        requested_date_str = date_obj.strftime('%Y-%m-%d')
        logger.info(f"Requested date (as string): '{requested_date_str}'")
        
        # For start time, go back 2 hours before midnight of the requested day
        # This ensures we don't miss any data due to timezone issues
        start_date = datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0) - timedelta(hours=2)
        
        # For end time, always include a few hours of the next day to capture all data
        # Set end time based on whether we're requesting today, yesterday, or an older date
        if date_obj.date() == today.date():
            # For today, use current time plus a small buffer to ensure we get latest data
            end_date = today + timedelta(minutes=5)  # Add 5 minutes buffer
            logger.info(f"Using current time for today's data: {end_date}")
        elif date_obj.date() == (today.date() - timedelta(days=1)):
            # For yesterday, extend to the current time to include overnight data
            end_date = today + timedelta(minutes=5)  # Add 5 minutes buffer
            logger.info(f"Yesterday's data requested - extending to current time: {end_date}")
        else:
            # For older dates, extend 24 hours past the end of day to ensure we get all data
            next_day = date_obj + timedelta(days=1)
            end_date = datetime(next_day.year, next_day.month, next_day.day, 0, 0, 0) + timedelta(hours=2)
            logger.info(f"Historical data requested - extending to: {end_date}")
        
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
    
    # Add a timestamp to prevent caching issues
    request_timestamp = request.args.get('_ts', str(int(time.time())))
    logger.info(f"Request timestamp: {request_timestamp}")
    
    # Parse and validate date parameter
    start_time, end_time, date_str = parse_date_param(date_param)
    
    # Generate a unique request ID for debugging
    request_id = f"{date_str}_{period}_{int(time.time())}"
    logger.info(f"Request ID: {request_id} - Fetching heart rate data for date: {date_str}, period: {period}")
    
    # Check if today's date - always extend to current time for today
    today_date = datetime.now().strftime('%Y-%m-%d')
    is_today = date_str == today_date
    logger.info(f"Today's date: {today_date}, Requested date: {date_str}, Is today: {is_today}")
    
    if is_today:
        # Always use current time as the end time for today
        current_time = datetime.now()
        end_time = int(current_time.timestamp())
        logger.info(f"Today's data requested - extending end time to current time: {current_time}")
    
    # For multi-day periods, adjust the start time
    if period == 'week':
        start_time = end_time - (7 * 86400)  # 7 days in seconds
    elif period == 'month':
        start_time = end_time - (30 * 86400)  # 30 days in seconds
    
    logger.info(f"Fetching Google Fit heart rate data for period {period} from {start_time} to {end_time}")
    logger.info(f"Date string parameter: {date_param}, Parsed date: {date_str}")
    logger.info(f"Date range: {datetime.fromtimestamp(start_time)} to {datetime.fromtimestamp(end_time)}")
    
    # Clear any previous data from cache
    current_app.config.setdefault('GOOGLE_FIT_DATA_CACHE', {})
    cache_key = f"heart_rate_{date_str}_{period}"
    if cache_key in current_app.config['GOOGLE_FIT_DATA_CACHE']:
        logger.info(f"Clearing cached data for {cache_key}")
        del current_app.config['GOOGLE_FIT_DATA_CACHE'][cache_key]
    
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
    
    # Use different approach based on is_today flag
    # Always use the aggregate endpoint for consistent behavior
    logger.info("Using aggregate endpoint for heart rate data")
    api_url = f"{current_app.config['GOOGLE_FIT_API_BASE_URL']}/users/me/dataset:aggregate"
    use_raw_endpoint = False
    
    # Create body for request (needed for aggregate endpoint)
    body = {
        "aggregateBy": [{
            "dataTypeName": "com.google.heart_rate.bpm",
            "dataSourceId": data_source
        }],
        "bucketByTime": {"durationMillis": 15000},  # 15-second intervals for higher resolution
        "startTimeMillis": int(start_time) * 1000,
        "endTimeMillis": int(end_time) * 1000
    }
    
    try:
        # Use the correct API URL based on which endpoint we're using
        if use_raw_endpoint:
            # For raw data endpoint
            response = requests.get(api_url, headers=headers)
        else:
            # For aggregate endpoint
            response = requests.post(api_url, headers=headers, json=body)
        
        if response.status_code != 200:
            logger.error(f"Failed to get heart rate data: {response.text}")
            return jsonify({"error": "Failed to get heart rate data"}), response.status_code
            
        data = response.json()
        
        # Log a sample of the raw response for debugging
        if data and 'bucket' in data and data['bucket']:
            sample_bucket = data['bucket'][0]
            logger.info(f"Sample bucket structure: {json.dumps(sample_bucket, indent=2)[:500]}")
            
            # Check if we have points in the dataset
            if 'dataset' in sample_bucket:
                for dataset in sample_bucket['dataset']:
                    if 'point' in dataset and dataset['point']:
                        sample_point = dataset['point'][0]
                        logger.info(f"Sample point structure: {json.dumps(sample_point, indent=2)}")
                        
                        # Log time format info
                        if 'startTimeNanos' in sample_point:
                            start_time_nanos = sample_point['startTimeNanos']
                            start_time_millis = int(int(start_time_nanos) / 1000000)
                            logger.info(f"Point time format: nanos={start_time_nanos}, millis={start_time_millis}")
                        
                        if 'startTimeMillis' in sample_point:
                            logger.info(f"Point has direct startTimeMillis: {sample_point['startTimeMillis']}")
                        break
            
            # Additional diagnostics for heartrate data
            heart_rate_data_points = 0
            unique_bucket_times = set()
            unique_point_times = set()
            
            for bucket in data['bucket'][:10]:  # Check first 10 buckets
                bucket_time = bucket.get('startTimeMillis')
                if bucket_time:
                    unique_bucket_times.add(bucket_time)
                
                if 'dataset' in bucket:
                    for dataset in bucket['dataset']:
                        if 'point' in dataset:
                            for point in dataset['point']:
                                heart_rate_data_points += 1
                                point_time = point.get('startTimeMillis') or point.get('startTimeNanos')
                                if point_time:
                                    unique_point_times.add(point_time)
            
            logger.info(f"First 10 buckets diagnostics: {heart_rate_data_points} points, {len(unique_bucket_times)} unique bucket times, {len(unique_point_times)} unique point times")
        
        # Process the response to extract heart rate values
        heart_rate_data = []
        requested_date_start = datetime.fromtimestamp(start_time).replace(hour=0, minute=0, second=0)
        requested_date_end = requested_date_start + timedelta(days=1)
        logger.info(f"Filtering data for date range: {requested_date_start} to {requested_date_end}")
        
        if 'bucket' in data:
            for bucket in data['bucket']:
                if 'dataset' in bucket:
                    for dataset in bucket['dataset']:
                        if 'point' in dataset:
                            for point in dataset['point']:
                                if 'value' in point:
                                    for value in point['value']:
                                        if 'fpVal' in value:  # Heart rate value
                                            # CRITICAL CHANGE: Google Fit has several ways of representing time
                                            # 1. Check for startTimeMillis (milliseconds since epoch)
                                            # 2. Check for startTimeNanos (nanoseconds since epoch)
                                            # 3. Fall back to bucket time as last resort
                                            
                                            if 'startTimeMillis' in point:
                                                # Direct millisecond timestamp
                                                timestamp = int(int(point['startTimeMillis']) / 1000)  # Convert to seconds
                                                logger.debug(f"Using point startTimeMillis: {point['startTimeMillis']}")
                                            elif 'startTimeNanos' in point:
                                                # Nanosecond timestamp (common in Google Fit)
                                                timestamp = int(int(point['startTimeNanos']) / 1000000000)  # Convert to seconds
                                                logger.debug(f"Using point startTimeNanos: {point['startTimeNanos']}")
                                            else:
                                                # Last resort - bucket time 
                                                timestamp = int(int(bucket['startTimeMillis']) / 1000)
                                                logger.debug(f"Falling back to bucket time: {bucket['startTimeMillis']}")
                                            
                                            heart_rate = value['fpVal']
                                            
                                            # Log the timestamp details for debugging
                                            logger.debug(f"Point timestamp: {timestamp}, Value: {heart_rate}")
                                            
                                            # Convert timestamp to readable time format
                                            time_obj = datetime.fromtimestamp(timestamp)
                                            time_str = time_obj.strftime('%I:%M:%S %p')  # 12-hour format with AM/PM
                                            point_date_str = time_obj.strftime('%Y-%m-%d')
                                            
                                            # CRITICAL: Check if this point belongs to the requested date
                                            # When viewing a specific day's data, only include points from that day
                                            if period == 'day' and point_date_str != date_str and not is_today:
                                                # Skip points that don't match the requested date (unless today)
                                                # We include all points for today regardless of date to get real-time updates
                                                logger.debug(f"Skipping point with date {point_date_str} - doesn't match requested date {date_str}")
                                                continue
                                                
                                            # Add extra debug logging for today's request to verify filtering
                                            if is_today and point_date_str != date_str:
                                                logger.info(f"Including non-today point in today's request: date={point_date_str}, time={time_str}, value={heart_rate}")
                                            
                                            # Format for consistency with Fitbit API
                                            heart_rate_data.append({
                                                "timestamp": timestamp,
                                                "value": heart_rate,
                                                "time": time_str,
                                                "date": point_date_str,
                                                "source": "googleFit"  # Add source for tracking
                                            })
        
        # Log data counts by date for debugging
        date_counts = {}
        for point in heart_rate_data:
            date = point['date']
            if date not in date_counts:
                date_counts[date] = 0
            date_counts[date] += 1
        
        logger.info(f"Heart rate data points by date: {date_counts}")
        
        # Check if we have data
        if not heart_rate_data:
            logger.warning(f"No heart rate data found for period {period} from {start_time} to {end_time}")
            # Current date check for better error messaging
            today_date = datetime.now().strftime('%Y-%m-%d')
            requested_date = datetime.fromtimestamp(start_time).strftime('%Y-%m-%d')
            is_today = (requested_date == today_date)
            
            if is_today:
                logger.info("Request is for current day data. This is normal if no data exists for today yet.")
        
        # For today's data, always add a current time marker to extend the chart
        if is_today:
            # Check if we already have recent data
            current_time = datetime.now()
            current_timestamp = int(current_time.timestamp())
            current_time_str = current_time.strftime('%I:%M:%S %p')
            
            # Get the latest data point timestamp
            latest_timestamp = 0
            if heart_rate_data:
                latest_timestamp = max(point['timestamp'] for point in heart_rate_data)
            
            # Only add a current time marker if the most recent data is more than 5 minutes old
            time_gap = current_timestamp - latest_timestamp
            if time_gap > 300:  # 5 minutes in seconds
                logger.info(f"Adding current time marker at {current_time_str}")
                
                # If there's existing data, use the last value as an approximation
                last_value = 70  # Default value if no data
                if heart_rate_data:
                    # Find the most recent value
                    last_value = heart_rate_data[-1]['value']
                
                # Add current time marker with the last known value
                heart_rate_data.append({
                    "timestamp": current_timestamp,
                    "value": last_value,  # Use last known value
                    "time": current_time_str,
                    "date": current_time.strftime('%Y-%m-%d'),
                    "source": "googleFit",
                    "isCurrentMarker": True  # Flag to identify this as current time marker
                })
                
                # Log the addition
                logger.info(f"Added current time marker with value {last_value}")
            else:
                logger.info(f"Recent data exists (within 5 minutes), not adding current time marker")
        
        # Check if we have data for the full day (or at least past noon)
        latest_time = "00:00:00"
        if heart_rate_data:
            for point in heart_rate_data:
                if point.get('time', '') > latest_time:
                    latest_time = point['time']
            
            # Log the time range of data
            earliest_time = heart_rate_data[0]['time'] if heart_rate_data else "unknown"
            logger.info(f"Heart rate data time range: {earliest_time} to {latest_time}")
        
        # IMPORTANT: Apply strict date filtering if we're still seeing incorrect dates
        # This is a final safety check to ensure we only return data for the requested date
        if period == 'day' and not is_today:
            # Filter to keep only data from the requested date
            filtered_data = [point for point in heart_rate_data if point['date'] == date_str]
            logger.info(f"Strict date filtering applied: {len(heart_rate_data)} points -> {len(filtered_data)} points")
            
            # Replace with filtered data
            heart_rate_data = filtered_data
        
        # Format the response to match the Fitbit API format
        response_data = {
            'data': heart_rate_data,
            'period': period,
            'start_date': datetime.fromtimestamp(start_time).strftime('%Y-%m-%d'),
            'end_date': datetime.fromtimestamp(end_time).strftime('%Y-%m-%d'),
            'current_time': datetime.now().strftime('%I:%M:%S %p'),  # Add current time for client reference
            'data_points_count': len(heart_rate_data),
            'date_counts': date_counts,
            'time_range': {
                'start': datetime.fromtimestamp(start_time).strftime('%Y-%m-%d %I:%M:%S %p'),
                'end': datetime.fromtimestamp(end_time).strftime('%Y-%m-%d %I:%M:%S %p'),
            },
            'requested_date': date_str  # Include the explicitly requested date for reference
        }
        
        # Log detailed information about the response
        logger.info(f"Returning {len(heart_rate_data)} heart rate data points across {len(date_counts)} days")
        logger.info(f"Time range: {response_data['time_range']['start']} to {response_data['time_range']['end']}")
        
        return jsonify(response_data)
        
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
    
    # Get date parameter from frontend (in YYYY-MM-DD format)
    date_param = request.args.get('date')
    period = request.args.get('period', 'day')
    
    # Add a timestamp to prevent caching issues
    request_timestamp = request.args.get('_ts', str(int(time.time())))
    logger.info(f"Request timestamp: {request_timestamp}")
    
    # Parse and validate date parameter
    start_time, end_time, date_str = parse_date_param(date_param)
    
    # Always log the exact requested date for debugging
    logger.info(f"CRITICAL - Activity data explicitly requested for - date_param: {date_param}, parsed as: {date_str}")
    logger.info(f"Activity data request for period: {period}, using date range: {datetime.fromtimestamp(start_time)} to {datetime.fromtimestamp(end_time)}")
    
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    
    # Create body for request - get steps, calories, and active minutes
    body = {
        "aggregateBy": [
            {
                "dataTypeName": "com.google.step_count.delta"
            },
            {
                "dataTypeName": "com.google.calories.expended"
            },
            {
                "dataTypeName": "com.google.active_minutes"
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
                # CRITICAL: Always use the requested date, not the bucket date
                # This ensures we're returning data for the day the user actually requested
                day_data = {
                    "date": date_str,  # Use the explicitly requested date
                    "dateTime": date_str,  # Add dateTime field for frontend compatibility
                    "steps": 0,
                    "calories": 0,
                    "activeMinutes": 0
                }
                
                bucket_date = time.strftime('%Y-%m-%d', time.localtime(int(bucket['startTimeMillis']) / 1000))
                logger.info(f"Processing bucket with date {bucket_date}, looking for data on {date_str}")
                
                # More lenient date filtering - allow adjacent dates to handle timezone boundaries
                # Convert dates to datetime objects for comparison
                bucket_datetime = datetime.strptime(bucket_date, '%Y-%m-%d')
                requested_datetime = datetime.strptime(date_str, '%Y-%m-%d')
                
                # Calculate the difference in days
                date_diff = abs((bucket_datetime - requested_datetime).days)
                
                # Accept the bucket if it's the requested date OR within 1 day (for timezone edge cases)
                if date_diff > 1:
                    logger.info(f"Skipping bucket from {bucket_date} - too far from requested date {date_str}")
                    continue
                
                logger.info(f"Including bucket from {bucket_date} for requested date {date_str} (diff: {date_diff} days)")
                    
                if 'dataset' in bucket:
                    for dataset in bucket['dataset']:
                        logger.info(f"Processing dataset: {dataset.get('dataSourceId', 'unknown')}")
                        if 'point' in dataset:
                            for point in dataset['point']:
                                if 'value' in point:
                                    for value in point['value']:
                                        if ('step_count' in dataset['dataSourceId'] or 
                                            'estimated_steps' in dataset['dataSourceId'] or
                                            'aggregated' in dataset['dataSourceId']) and 'intVal' in value:
                                            day_data['steps'] += value['intVal']
                                            logger.info(f"Added {value['intVal']} steps, total now: {day_data['steps']}")
                                        elif 'calories' in dataset['dataSourceId'] and 'fpVal' in value:
                                            # Google Fit often reports total burned calories including BMR (basal metabolic rate)
                                            # To get active calories only, we need to scale this value
                                            calories_value = value['fpVal']
                                            # If the value seems too large for the step count (typical range: ~40-50 calories per 1000 steps)
                                            if calories_value > day_data['steps'] * 0.1 and day_data['steps'] > 0:
                                                # Scale down to a more realistic value - max ~0.05 calories per step
                                                scaled_calories = min(calories_value, day_data['steps'] * 0.05)
                                                day_data['calories'] += scaled_calories
                                            else:
                                                day_data['calories'] += calories_value
                                            logger.info(f"Added {value['fpVal']} calories, total now: {day_data['calories']}")
                                        elif 'active_minutes' in dataset['dataSourceId'] and 'intVal' in value:
                                            day_data['activeMinutes'] += value['intVal']
                                            logger.info(f"Added {value['intVal']} active minutes, total now: {day_data['activeMinutes']}")
                
                # Calculate distance based on steps (approximation if not available)
                day_data['distance'] = round(day_data['steps'] / 2000, 2)  # Rough approximation: 2000 steps ≈ 1 mile
                
                logger.info(f"Processed activity data for {day_data['date']}: {day_data}")
                activity_data.append(day_data)
        
        # Format the response to match the heart rate API format
        response_data = {
            'data': activity_data,
            'period': period,  # Use the requested period
            'start_date': time.strftime('%Y-%m-%d', time.localtime(int(start_time))),
            'end_date': time.strftime('%Y-%m-%d', time.localtime(int(end_time))),
            'data_points_count': len(activity_data),
            'requested_date': date_str,  # Include the explicitly requested date
            'time_range': {
                'start': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(start_time))),
                'end': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(end_time))),
            }
        }
        
        # CRITICAL FIX: If we have no data, don't return an empty array which triggers "No data found" message
        # Instead, add a single day with zero values so the frontend displays the day with zeros
        if not activity_data and period == 'day':
            logger.info("Adding default zero-value entry to prevent 'No data found' message")
            response_data['data'] = [{
                'date': date_str,
                'dateTime': date_str,
                'steps': 0,
                'calories': 0,
                'distance': 0,
                'floors': 0,
                'activeMinutes': 0,
                'is_placeholder': True  # Mark as placeholder so frontend knows this is synthetic data
            }]
        
        logger.info(f"Returning {len(activity_data)} activity data points")
        return jsonify(response_data)
        
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
    
    # Get date parameter and period from request
    date_param = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    period = request.args.get('period', 'day')  # day, week, month
    
    # Add timestamp for cache busting
    _ts = request.args.get('_ts', str(int(time.time())))
    logger.info(f"Sleep data requested for period: {period}, date: {date_param}, timestamp: {_ts}")
    
    # Parse and validate date parameter
    start_time, end_time, date_str = parse_date_param(date_param)
    
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    
    # Sleep API endpoint for sessions
    api_url = f"{current_app.config['GOOGLE_FIT_API_BASE_URL']}/users/me/sessions"
    
    # Convert to UTC for RFC3339 format
    from datetime import timezone
    
    # Format dates according to Google API requirements
    # Must be in RFC3339 format in UTC
    start_datetime = datetime.fromtimestamp(start_time).replace(tzinfo=timezone.utc)
    end_datetime = datetime.fromtimestamp(end_time).replace(tzinfo=timezone.utc)
    
    start_time_str = start_datetime.strftime('%Y-%m-%dT%H:%M:%S.000Z')
    end_time_str = end_datetime.strftime('%Y-%m-%dT%H:%M:%S.000Z')
    
    logger.info(f"Fetching sleep data from {start_time_str} to {end_time_str}")
    
    params = {
        'startTime': start_time_str,
        'endTime': end_time_str,
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
            logger.info(f"Found {len(data['session'])} sleep sessions")
            
            for session in data['session']:
                # Calculate session time in local timezone
                session_date = datetime.fromtimestamp(int(session.get('startTimeMillis', 0)) / 1000).strftime('%Y-%m-%d')
                start_time = datetime.fromtimestamp(int(session.get('startTimeMillis', 0)) / 1000).strftime('%H:%M')
                end_time = datetime.fromtimestamp(int(session.get('endTimeMillis', 0)) / 1000).strftime('%H:%M')
                
                # Calculate duration in minutes
                duration_minutes = int((int(session.get('endTimeMillis', 0)) - int(session.get('startTimeMillis', 0))) / 1000 / 60)
                
                # Create a sleep entry in the format expected by the frontend
                sleep_entry = {
                    "date": session_date,
                    "startTime": start_time,
                    "endTime": end_time,
                    "durationMinutes": duration_minutes,
                    "efficiency": 85,  # Default value - Google Fit doesn't provide this
                    "deepSleepMinutes": int(duration_minutes * 0.20),  # Estimated - 20% of total sleep
                    "lightSleepMinutes": int(duration_minutes * 0.60),  # Estimated - 60% of total sleep
                    "remSleepMinutes": int(duration_minutes * 0.20),  # Estimated - 20% of total sleep
                    "awakeDuringNight": 0,  # Google Fit doesn't track this
                    "deepSleepPercentage": 20,  # Estimated percentage
                    "lightSleepPercentage": 60,  # Estimated percentage
                    "remSleepPercentage": 20,  # Estimated percentage
                    "score": 75,  # Default value
                    "source": "googleFit"
                }
                
                sleep_data.append(sleep_entry)
                logger.info(f"Added sleep entry for {session_date}: {start_time} - {end_time}, {duration_minutes} minutes")
        
        # CRITICAL FIX: If we have no data, don't return an empty array which triggers "No data found" message
        # Instead, add a single day with zero values so the frontend displays the day with zeros
        if not sleep_data and period == 'day':
            logger.info("No sleep data found, creating empty placeholder entry")
            sleep_data = [{
                "date": date_str,
                "startTime": "00:00",
                "endTime": "00:00",
                "durationMinutes": 0,
                "efficiency": 0,
                "deepSleepMinutes": 0,
                "lightSleepMinutes": 0,
                "remSleepMinutes": 0,
                "awakeDuringNight": 0,
                "deepSleepPercentage": 0,
                "lightSleepPercentage": 0,
                "remSleepPercentage": 0,
                "score": 0,
                "source": "googleFit",
                "is_placeholder": True  # Mark as placeholder
            }]
        
        # Format response to match our API format
        response_data = {
            'data': sleep_data,
            'period': period,
            'start_date': datetime.fromtimestamp(start_time).strftime('%Y-%m-%d'),
            'end_date': datetime.fromtimestamp(end_time).strftime('%Y-%m-%d'),
            'requested_date': date_str
        }
        
        return jsonify(response_data)
        
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