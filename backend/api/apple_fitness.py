from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for
import requests
import urllib.parse
import base64
import json
import secrets
import datetime

import time

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
    
    # In a real application, you would load your private key from a secure location
    # For this example, we're assuming the private key is stored in a file or environment variable
    # private_key = current_app.config.get('APPLE_FITNESS_PRIVATE_KEY')
    
    # For example purposes, returning a placeholder
    # In real implementation, you would use PyJWT to sign with your private key:
    # client_secret = jwt.encode(payload, private_key, algorithm='ES256', headers=headers)
    
    # Placeholder - in real implementation this would be a properly signed JWT
    return "apple_client_secret_placeholder"

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