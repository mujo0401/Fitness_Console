import os
import time
import requests
from flask import Blueprint, jsonify, request, redirect, session, current_app
from functools import wraps
from werkzeug.exceptions import HTTPException
from urllib.parse import urlencode
import json
import logging

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

def refresh_token_if_needed():
    """Refresh the Google Fit token if it's expired"""
    if 'google_fit_token' not in session:
        return False
    
    token_info = session['google_fit_token']
    
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
            
            response = requests.post(token_url, data=payload)
            
            if response.status_code == 200:
                new_token_info = response.json()
                # Update token information but preserve refresh token
                new_token_info['refresh_token'] = refresh_token
                new_token_info['expires_at'] = time.time() + new_token_info.get('expires_in', 3600)
                session['google_fit_token'] = new_token_info
                logger.info("Successfully refreshed Google Fit token")
                return True
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
        
        # Return simplified profile data
        return jsonify({
            "userId": profile_data.get('id'),
            "displayName": profile_data.get('name'),
            "email": profile_data.get('email'),
            "picture": profile_data.get('picture')
        })
        
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        return jsonify({"error": f"Failed to get user profile: {str(e)}"}), 500

@google_fit_bp.route('/heart-rate')
@login_required
def get_heart_rate():
    """Get heart rate data from Google Fit"""
    if not refresh_token_if_needed():
        return jsonify({"error": "Failed to refresh token"}), 401
        
    token_info = session['google_fit_token']
    access_token = token_info.get('access_token')
    
    # Get parameters from request
    start_time = request.args.get('start_time', int(time.time() - 86400))  # Default to last 24 hours
    end_time = request.args.get('end_time', int(time.time()))
    
    # Convert to nanoseconds for Google Fit API
    start_time_nanos = int(start_time) * 1000000000
    end_time_nanos = int(end_time) * 1000000000
    
    headers = {
        'Authorization': f"Bearer {access_token}",
        'Content-Type': 'application/json'
    }
    
    # Prepare data source for heart rate
    data_source = "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm"
    
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
                                            heart_rate_data.append({
                                                "timestamp": timestamp,
                                                "value": heart_rate
                                            })
        
        return jsonify(heart_rate_data)
        
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
        
        # Process the response to extract activity values
        activity_data = []
        
        if 'bucket' in data:
            for bucket in data['bucket']:
                day_data = {
                    "date": time.strftime('%Y-%m-%d', time.localtime(int(bucket['startTimeMillis']) / 1000)),
                    "steps": 0,
                    "calories": 0,
                    "activeMinutes": 0
                }
                
                if 'dataset' in bucket:
                    for dataset in bucket['dataset']:
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
                
                activity_data.append(day_data)
        
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
    logger.info("Checking Google Fit connection status")
    logger.info(f"Session keys: {list(session.keys())}")
    logger.info(f"Google Fit token in session: {'google_fit_token' in session}")
    logger.info(f"Google Fit oauth state: {session.get('google_fit_oauth_state')}")
    
    is_connected = 'google_fit_token' in session and session.get('google_fit_oauth_state') == 'authenticated'
    
    # Also verify the token is valid
    if is_connected and not refresh_token_if_needed():
        is_connected = False
        logger.info("Token refresh failed, setting connected to false")
    
    logger.info(f"Final connection status: {is_connected}")
    return jsonify({
        "connected": is_connected
    })

@google_fit_bp.route('/disconnect')
def disconnect():
    """Disconnect from Google Fit by removing the token from session"""
    if 'google_fit_token' in session:
        # Get token info
        token_info = session['google_fit_token']
        access_token = token_info.get('access_token')
        
        try:
            # Revoke the token
            revoke_url = 'https://oauth2.googleapis.com/revoke'
            requests.post(revoke_url, params={'token': access_token}, 
                         headers={'Content-Type': 'application/x-www-form-urlencoded'})
        except Exception as e:
            logger.error(f"Error revoking token: {str(e)}")
        
        # Remove from session regardless of revocation success
        session.pop('google_fit_token', None)
        session.pop('google_fit_oauth_state', None)
    
    return jsonify({"success": True, "message": "Disconnected from Google Fit"})