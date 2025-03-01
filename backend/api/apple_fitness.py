from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for
import requests
import urllib.parse
import base64
import json
import secrets
import datetime
import os
import time
from utils.apple_health_processor import process_apple_heart_rate_data, process_apple_activity_data, process_apple_workout_data

bp = Blueprint('apple_fitness', __name__, url_prefix='/api/apple-fitness')

@bp.route('/login', methods=['GET'])
def login():
    """Initiates the Apple Fitness OAuth 2.0 authorization flow."""
    # Generate and store state parameter for CSRF protection
    state = secrets.token_urlsafe(16)
    session['apple_fitness_oauth_state'] = state
    
    # Build authorization URL
    params = {
        'client_id': current_app.config['APPLE_FITNESS_CLIENT_ID'],
        'redirect_uri': current_app.config['APPLE_FITNESS_REDIRECT_URI'],
        'response_type': 'code',
        'scope': ' '.join(current_app.config['APPLE_FITNESS_SCOPES']),
        'response_mode': 'form_post',
        'state': state
    }
    
    auth_url = f"{current_app.config['APPLE_FITNESS_AUTH_URL']}?{urllib.parse.urlencode(params)}"
    
    return jsonify({
        'status': 'success',
        'authorization_url': auth_url
    })

@bp.route('/callback', methods=['GET', 'POST'])
def callback():
    """Handles the OAuth 2.0 callback from Apple Fitness."""
    # Check if an error was returned
    if request.args.get('error') or request.form.get('error'):
        error = request.args.get('error') or request.form.get('error')
        error_description = request.args.get('error_description') or request.form.get('error_description') or 'Unknown error'
        current_app.logger.error(f"Apple Fitness OAuth error: {error} - {error_description}")
        return redirect(f"{current_app.config['FRONTEND_URL']}?error=apple_fitness_auth_failed&message={error_description}")
    
    # Verify state parameter to prevent CSRF
    state = request.args.get('state') or request.form.get('state')
    stored_state = session.pop('apple_fitness_oauth_state', None)
    
    if not state or state != stored_state:
        current_app.logger.error("Apple Fitness OAuth state validation failed")
        return redirect(f"{current_app.config['FRONTEND_URL']}?error=apple_fitness_auth_failed&message=Invalid state parameter")
    
    # Get authorization code
    code = request.args.get('code') or request.form.get('code')
    if not code:
        current_app.logger.error("Apple Fitness OAuth callback missing code parameter")
        return redirect(f"{current_app.config['FRONTEND_URL']}?error=apple_fitness_auth_failed&message=Missing authorization code")
    
    # Exchange authorization code for access token
    try:
        # Generate client secret JWT
        client_secret = _generate_client_secret()
        
        token_data = {
            'client_id': current_app.config['APPLE_FITNESS_CLIENT_ID'],
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': current_app.config['APPLE_FITNESS_REDIRECT_URI']
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        token_response = requests.post(
            current_app.config['APPLE_FITNESS_TOKEN_URL'],
            data=token_data,
            headers=headers
        )
        
        token_response.raise_for_status()
        token_json = token_response.json()
        
        # Store tokens in session
        session['apple_fitness_access_token'] = token_json['access_token']
        session['apple_fitness_refresh_token'] = token_json.get('refresh_token')
        session['apple_fitness_id_token'] = token_json.get('id_token')
        session['apple_fitness_token_expires_at'] = time.time() + token_json['expires_in']
        
        # Store user info if available
        if 'id_token' in token_json:
            id_token = token_json['id_token']
            # For Apple, we need to parse the JWT token
            id_token_parts = id_token.split('.')
            if len(id_token_parts) == 3:
                # Decode the payload
                padded_payload = id_token_parts[1] + '=' * (4 - len(id_token_parts[1]) % 4)
                user_info = json.loads(base64.b64decode(padded_payload).decode('utf-8'))
                session['apple_fitness_user_info'] = user_info
        
        return redirect(f"{current_app.config['FRONTEND_URL']}?success=apple_fitness_connected")
        
    except requests.RequestException as e:
        current_app.logger.error(f"Error exchanging Apple Fitness authorization code for token: {str(e)}")
        return redirect(f"{current_app.config['FRONTEND_URL']}?error=apple_fitness_auth_failed&message=Failed to obtain access token")

def _generate_client_secret():
    """Generates a client secret JWT for Apple Authentication."""
    import jwt
    
    now = int(time.time())
    expiration_time = now + 3600  # 1 hour expiration
    
    headers = {
        'alg': 'ES256',
        'kid': current_app.config['APPLE_FITNESS_KEY_ID']
    }
    
    payload = {
        'iss': current_app.config['APPLE_FITNESS_TEAM_ID'],
        'iat': now,
        'exp': expiration_time,
        'aud': 'https://appleid.apple.com',
        'sub': current_app.config['APPLE_FITNESS_CLIENT_ID']
    }
    
    # Load private key from environment variable or file
    private_key_path = current_app.config.get('APPLE_FITNESS_PRIVATE_KEY_PATH')
    
    try:
        if private_key_path and os.path.exists(private_key_path):
            with open(private_key_path, 'r') as key_file:
                private_key = key_file.read()
        else:
            # Try to get from environment variable
            private_key = current_app.config.get('APPLE_FITNESS_PRIVATE_KEY', '')
            
        if not private_key:
            current_app.logger.error("Apple Fitness private key not found")
            return None
            
        # Sign JWT with private key
        client_secret = jwt.encode(payload, private_key, algorithm='ES256', headers=headers)
        return client_secret
    except Exception as e:
        current_app.logger.error(f"Error generating Apple client secret: {str(e)}")
        return None

@bp.route('/token', methods=['GET'])
def check_token():
    """Check if the user has a valid Apple Fitness token."""
    if 'apple_fitness_access_token' in session:
        # Check if token is expired
        if session.get('apple_fitness_token_expires_at', 0) > time.time():
            return jsonify({
                'authenticated': True,
                'expires_at': session.get('apple_fitness_token_expires_at')
            })
        else:
            # Try to refresh token
            try:
                refresh_token = session.get('apple_fitness_refresh_token')
                if refresh_token:
                    client_secret = _generate_client_secret()
                    
                    refresh_data = {
                        'client_id': current_app.config['APPLE_FITNESS_CLIENT_ID'],
                        'client_secret': client_secret,
                        'grant_type': 'refresh_token',
                        'refresh_token': refresh_token
                    }
                    
                    headers = {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                    
                    refresh_response = requests.post(
                        current_app.config['APPLE_FITNESS_TOKEN_URL'],
                        data=refresh_data,
                        headers=headers
                    )
                    
                    refresh_response.raise_for_status()
                    token_json = refresh_response.json()
                    
                    session['apple_fitness_access_token'] = token_json['access_token']
                    if 'refresh_token' in token_json:
                        session['apple_fitness_refresh_token'] = token_json['refresh_token']
                    session['apple_fitness_token_expires_at'] = time.time() + token_json['expires_in']
                    
                    return jsonify({
                        'authenticated': True,
                        'expires_at': session.get('apple_fitness_token_expires_at')
                    })
            except Exception as e:
                current_app.logger.error(f"Failed to refresh Apple Fitness token: {str(e)}")
                # Clear invalid tokens
                session.pop('apple_fitness_access_token', None)
                session.pop('apple_fitness_refresh_token', None)
                session.pop('apple_fitness_token_expires_at', None)
    
    return jsonify({
        'authenticated': False
    })

@bp.route('/status', methods=['GET'])
def status():
    """Check connection status to Apple Fitness."""
    if 'apple_fitness_access_token' in session and session.get('apple_fitness_token_expires_at', 0) > time.time():
        # In a real implementation, you would make a simple API call to verify the connection
        return jsonify({
            'connected': True,
            'service': 'Apple Fitness',
            'expires_at': session.get('apple_fitness_token_expires_at')
        })
    else:
        return jsonify({
            'connected': False,
            'service': 'Apple Fitness'
        })

@bp.route('/profile', methods=['GET'])
def profile():
    """Fetch user profile information from Apple Fitness."""
    if 'apple_fitness_access_token' not in session:
        return jsonify({'error': 'Not authenticated with Apple Fitness'}), 401
    
    try:
        # In a real implementation, you would make API calls to Apple Fitness
        # to get the actual user profile data
        
        # For example purposes, return the stored user info from the ID token
        user_info = session.get('apple_fitness_user_info', {})
        
        # If we have a valid access token but no user info, create a placeholder
        if not user_info and session.get('apple_fitness_token_expires_at', 0) > time.time():
            user_info = {
                'sub': 'apple_user_id',  # This would be the Apple user ID
                'email': 'user@example.com',  # This would be the user's email if requested
                'name': {
                    'firstName': 'Apple',
                    'lastName': 'User'
                }
            }
        
        # Format user info in a consistent structure
        user = {
            'user': {
                'fullName': f"{user_info.get('name', {}).get('firstName', '')} {user_info.get('name', {}).get('lastName', '')}",
                'userId': user_info.get('sub', ''),
                'email': user_info.get('email', ''),
                'source': 'Apple Fitness'
            }
        }
        
        return jsonify(user)
        
    except Exception as e:
        current_app.logger.error(f"Error fetching Apple Fitness profile: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile from Apple Fitness'}), 500

@bp.route('/logout', methods=['POST'])
def logout():
    """Logout from Apple Fitness."""
    # Remove Apple Fitness tokens from session
    session.pop('apple_fitness_access_token', None)
    session.pop('apple_fitness_refresh_token', None)
    session.pop('apple_fitness_id_token', None)
    session.pop('apple_fitness_token_expires_at', None)
    session.pop('apple_fitness_user_info', None)
    
    return jsonify({'success': True, 'message': 'Logged out from Apple Fitness'})

@bp.route('/heart-rate', methods=['GET'])
def heart_rate():
    """Fetch heart rate data from Apple HealthKit."""
    if 'apple_fitness_access_token' not in session:
        return jsonify({'error': 'Not authenticated with Apple Health'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'day')  # day, week, month
    date = request.args.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
    
    try:
        # Get access token
        access_token = session['apple_fitness_access_token']
        
        # Prepare request for Apple Health API
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Set the start and end date based on the period
        end_date = datetime.datetime.strptime(date, '%Y-%m-%d')
        
        if period == 'day':
            start_date = end_date
        elif period == 'week':
            start_date = end_date - datetime.timedelta(days=7)
        elif period == 'month':
            start_date = end_date - datetime.timedelta(days=30)
        elif period == '3month':
            start_date = end_date - datetime.timedelta(days=90)
        else:
            start_date = end_date
        
        # Format dates for API request
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Create request payload
        payload = {
            'start_date': start_date_str,
            'end_date': end_date_str,
            'types': ['heart_rate']
        }
        
        # Make API request to Apple Health
        # In a real implementation, you would use the actual Apple Health API endpoint
        api_url = f"{current_app.config['APPLE_FITNESS_API_BASE_URL']}/v1/health/data"
        
        # This is a placeholder. In a real implementation, you would make the actual API call:
        # response = requests.post(api_url, json=payload, headers=headers)
        # response.raise_for_status()
        # data = response.json()
        
        # For now, we'll mock some sample heart rate data
        # In a real implementation, this would be replaced with actual API call results
        if period == 'day':
            # Mock intraday heart rate data
            mock_data = {
                'heart_rate': {
                    'date': date,
                    'intraday': [
                        {'time': '00:00:00', 'value': 62},
                        {'time': '01:00:00', 'value': 58},
                        {'time': '02:00:00', 'value': 57},
                        {'time': '03:00:00', 'value': 56},
                        {'time': '04:00:00', 'value': 55},
                        {'time': '05:00:00', 'value': 58},
                        {'time': '06:00:00', 'value': 65},
                        {'time': '07:00:00', 'value': 72},
                        {'time': '08:00:00', 'value': 78},
                        {'time': '09:00:00', 'value': 82},
                        {'time': '10:00:00', 'value': 85},
                        {'time': '11:00:00', 'value': 87},
                        {'time': '12:00:00', 'value': 88},
                        {'time': '13:00:00', 'value': 87},
                        {'time': '14:00:00', 'value': 85},
                        {'time': '15:00:00', 'value': 84},
                        {'time': '16:00:00', 'value': 86},
                        {'time': '17:00:00', 'value': 88},
                        {'time': '18:00:00', 'value': 90},
                        {'time': '19:00:00', 'value': 86},
                        {'time': '20:00:00', 'value': 82},
                        {'time': '21:00:00', 'value': 77},
                        {'time': '22:00:00', 'value': 72},
                        {'time': '23:00:00', 'value': 68}
                    ],
                    'summary': {
                        'min': 55,
                        'max': 90,
                        'avg': 76,
                        'resting': 58
                    }
                }
            }
        else:
            # Mock daily heart rate summaries for longer periods
            mock_data = {
                'heart_rate': {
                    'data': []
                }
            }
            
            current_date = start_date
            while current_date <= end_date:
                date_str = current_date.strftime('%Y-%m-%d')
                
                # Generate random heart rate data
                mock_data['heart_rate']['data'].append({
                    'date': date_str,
                    'min': 55 + (hash(date_str) % 5),  # Random between 55-59
                    'max': 85 + (hash(date_str) % 15),  # Random between 85-99
                    'avg': 70 + (hash(date_str) % 10),  # Random between 70-79
                    'resting': 58 + (hash(date_str) % 4)  # Random between 58-61
                })
                
                current_date += datetime.timedelta(days=1)
        
        # Process the data using our data processor
        processed_data = process_apple_heart_rate_data(mock_data, period)
        
        return jsonify({
            'heart_rate': processed_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching heart rate data from Apple Health: {str(e)}")
        return jsonify({'error': 'Failed to fetch heart rate data from Apple Health'}), 500

@bp.route('/activity', methods=['GET'])
def activity():
    """Fetch activity data from Apple HealthKit."""
    if 'apple_fitness_access_token' not in session:
        return jsonify({'error': 'Not authenticated with Apple Health'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'day')  # day, week, month
    date = request.args.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
    
    try:
        # Get access token
        access_token = session['apple_fitness_access_token']
        
        # Prepare request for Apple Health API
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Set the start and end date based on the period
        end_date = datetime.datetime.strptime(date, '%Y-%m-%d')
        
        if period == 'day':
            start_date = end_date
        elif period == 'week':
            start_date = end_date - datetime.timedelta(days=7)
        elif period == 'month':
            start_date = end_date - datetime.timedelta(days=30)
        else:
            start_date = end_date
        
        # Format dates for API request
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Create request payload
        payload = {
            'start_date': start_date_str,
            'end_date': end_date_str,
            'types': ['steps', 'active_energy', 'distance', 'flights_climbed', 'exercise_time']
        }
        
        # Make API request to Apple Health
        # In a real implementation, you would use the actual Apple Health API endpoint
        api_url = f"{current_app.config['APPLE_FITNESS_API_BASE_URL']}/v1/health/data"
        
        # This is a placeholder. In a real implementation, you would make the actual API call:
        # response = requests.post(api_url, json=payload, headers=headers)
        # response.raise_for_status()
        # data = response.json()
        
        # For now, we'll mock some sample activity data
        # In a real implementation, this would be replaced with actual API call results
        if period == 'day':
            # Mock intraday activity data
            mock_data = {
                'activity': {
                    'date': date,
                    'intraday': [
                        {'time': '00:00:00', 'steps': 10, 'calories': 5, 'distance': 0.01, 'floors': 0},
                        {'time': '01:00:00', 'steps': 5, 'calories': 3, 'distance': 0.005, 'floors': 0},
                        {'time': '06:00:00', 'steps': 150, 'calories': 15, 'distance': 0.12, 'floors': 0},
                        {'time': '07:00:00', 'steps': 850, 'calories': 70, 'distance': 0.65, 'floors': 2},
                        {'time': '08:00:00', 'steps': 1200, 'calories': 95, 'distance': 0.92, 'floors': 3},
                        {'time': '09:00:00', 'steps': 750, 'calories': 60, 'distance': 0.58, 'floors': 1},
                        {'time': '12:00:00', 'steps': 1100, 'calories': 85, 'distance': 0.84, 'floors': 2},
                        {'time': '13:00:00', 'steps': 600, 'calories': 50, 'distance': 0.46, 'floors': 1},
                        {'time': '17:00:00', 'steps': 1500, 'calories': 120, 'distance': 1.15, 'floors': 3},
                        {'time': '18:00:00', 'steps': 1300, 'calories': 105, 'distance': 1.0, 'floors': 2},
                        {'time': '19:00:00', 'steps': 900, 'calories': 75, 'distance': 0.69, 'floors': 1},
                        {'time': '20:00:00', 'steps': 500, 'calories': 40, 'distance': 0.38, 'floors': 0},
                        {'time': '21:00:00', 'steps': 200, 'calories': 20, 'distance': 0.15, 'floors': 0},
                        {'time': '22:00:00', 'steps': 100, 'calories': 10, 'distance': 0.08, 'floors': 0}
                    ],
                    'summary': {
                        'steps': 9165,
                        'calories': 753,
                        'distance': 7.025,
                        'floors': 15,
                        'activeMinutes': 65
                    }
                }
            }
        else:
            # Mock daily activity summaries for longer periods
            mock_data = {
                'activity': {
                    'data': []
                }
            }
            
            current_date = start_date
            while current_date <= end_date:
                date_str = current_date.strftime('%Y-%m-%d')
                
                # Generate random activity data
                day_factor = hash(date_str) % 100  # Different factor for each day
                steps = 8000 + (day_factor * 50)  # Between 8000-13000 steps
                
                mock_data['activity']['data'].append({
                    'dateTime': date_str,
                    'steps': steps,
                    'calories': int(steps * 0.08),
                    'distance': round(steps / 1300, 2),
                    'floors': int(steps / 600),
                    'activeMinutes': int(steps / 140),
                    'sedentaryMinutes': 1440 - int(steps / 140),  # 24 hours minus active minutes
                    'lightActiveMinutes': int((steps / 140) * 0.6),
                    'moderateActiveMinutes': int((steps / 140) * 0.3),
                    'vigorousActiveMinutes': int((steps / 140) * 0.1)
                })
                
                current_date += datetime.timedelta(days=1)
        
        # Process the data using our data processor
        processed_data = process_apple_activity_data(mock_data, period)
        
        return jsonify({
            'activity': processed_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching activity data from Apple Health: {str(e)}")
        return jsonify({'error': 'Failed to fetch activity data from Apple Health'}), 500

@bp.route('/workouts', methods=['GET'])
def workouts():
    """Fetch workout data from Apple HealthKit."""
    if 'apple_fitness_access_token' not in session:
        return jsonify({'error': 'Not authenticated with Apple Health'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'week')  # day, week, month
    date = request.args.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
    
    try:
        # Get access token
        access_token = session['apple_fitness_access_token']
        
        # Prepare request for Apple Health API
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Set the start and end date based on the period
        end_date = datetime.datetime.strptime(date, '%Y-%m-%d')
        
        if period == 'day':
            start_date = end_date
        elif period == 'week':
            start_date = end_date - datetime.timedelta(days=7)
        elif period == 'month':
            start_date = end_date - datetime.timedelta(days=30)
        else:
            start_date = end_date
        
        # Format dates for API request
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        
        # Create request payload
        payload = {
            'start_date': start_date_str,
            'end_date': end_date_str,
            'types': ['workouts']
        }
        
        # Make API request to Apple Health
        # In a real implementation, you would use the actual Apple Health API endpoint
        api_url = f"{current_app.config['APPLE_FITNESS_API_BASE_URL']}/v1/health/workouts"
        
        # This is a placeholder. In a real implementation, you would make the actual API call:
        # response = requests.post(api_url, json=payload, headers=headers)
        # response.raise_for_status()
        # data = response.json()
        
        # For now, we'll mock some sample workout data
        # In a real implementation, this would be replaced with actual API call results
        mock_data = {
            'workouts': []
        }
        
        # Generate mock workout data across the date range
        workout_types = ['Running', 'Walking', 'Cycling', 'Swimming', 'Strength Training', 'HIIT', 'Yoga']
        
        current_date = start_date
        workout_count = 0
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            day_hash = hash(date_str)
            
            # Not every day has a workout
            if day_hash % 3 != 0:  # 2/3 of days have workouts
                # Might have 1-2 workouts per day
                num_workouts = 1 + (day_hash % 2)
                
                for i in range(num_workouts):
                    workout_type = workout_types[(day_hash + i) % len(workout_types)]
                    duration_minutes = 20 + ((day_hash + i) % 40)  # 20-60 minutes
                    
                    # Calculate calories based on workout type and duration
                    calories_per_minute = {
                        'Running': 10,
                        'Walking': 4,
                        'Cycling': 8,
                        'Swimming': 9,
                        'Strength Training': 6,
                        'HIIT': 12,
                        'Yoga': 3
                    }
                    calories_burned = int(duration_minutes * calories_per_minute.get(workout_type, 5))
                    
                    # Generate start time (between 6am and 8pm)
                    hour = 6 + ((day_hash + i) % 14)
                    minute = (day_hash + i) % 60
                    start_time = f"{hour:02d}:{minute:02d}:00"
                    
                    # For complete date-time string
                    start_datetime = f"{date_str}T{start_time}"
                    
                    # Generate mock heart rate data for the workout
                    avg_hr = 110 + ((day_hash + i) % 40)  # 110-150 bpm
                    max_hr = avg_hr + 20 + ((day_hash + i) % 20)  # 20-40 bpm higher than avg
                    
                    workout_data = {
                        'id': f"workout-{workout_count}",
                        'type': workout_type,
                        'start_date': start_datetime,
                        'duration': duration_minutes * 60,  # in seconds
                        'duration_display': f"{duration_minutes} min",
                        'calories': calories_burned,
                        'distance': round(duration_minutes * 0.15, 2) if workout_type in ['Running', 'Walking', 'Cycling'] else None,
                        'distance_unit': 'km' if workout_type in ['Running', 'Walking', 'Cycling'] else None,
                        'heart_rate': {
                            'avg': avg_hr,
                            'max': max_hr
                        }
                    }
                    
                    mock_data['workouts'].append(workout_data)
                    workout_count += 1
            
            current_date += datetime.timedelta(days=1)
        
        # Sort workouts by start date (most recent first)
        mock_data['workouts'].sort(key=lambda x: x['start_date'], reverse=True)
        
        # Process the data using our data processor
        processed_data = process_apple_workout_data(mock_data)
        
        return jsonify({
            'workouts': processed_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching workout data from Apple Health: {str(e)}")
        return jsonify({'error': 'Failed to fetch workout data from Apple Health'}), 500