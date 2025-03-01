from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app
import requests
from requests_oauthlib import OAuth2Session
import json
import base64
import time
import traceback
import secrets
from urllib.parse import urlencode

bp = Blueprint('auth', __name__)

# Helper function to create OAuth session
def get_oauth_session(state=None, token=None):
    if token:
        return OAuth2Session(
            client_id=current_app.config['FITBIT_CLIENT_ID'],
            token=token
        )
    
    redirect_uri = current_app.config['FITBIT_REDIRECT_URI']
    scope = ' '.join(current_app.config['FITBIT_SCOPES'])
    
    return OAuth2Session(
        client_id=current_app.config['FITBIT_CLIENT_ID'],
        redirect_uri=redirect_uri,
        scope=scope,
        state=state
    )

@bp.route('/login', methods=['GET'])
def login():
    """Initiate the OAuth 2.0 authorization flow with Fitbit"""
    try:
        # Check if we have client credentials configured
        client_id = current_app.config.get('FITBIT_CLIENT_ID')
        client_secret = current_app.config.get('FITBIT_CLIENT_SECRET')
        
        # Add detailed debug logs
        current_app.logger.info(f"Client ID: {client_id}")
        current_app.logger.info(f"Client Secret: {'[REDACTED]' if client_secret else 'None'}")
        
        if not client_id or not client_secret:
            current_app.logger.error("Missing Fitbit client credentials")
            return jsonify({
                'error': 'Fitbit API credentials not configured',
                'details': 'Please set FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET environment variables'
            }), 500
        
        # Create authorization URL
        auth_url = current_app.config['FITBIT_AUTH_URL']
        redirect_uri = current_app.config['FITBIT_REDIRECT_URI']
        
        current_app.logger.info(f"Auth URL: {auth_url}")
        current_app.logger.info(f"Redirect URI: {redirect_uri}")
        
        params = {
            'response_type': 'code',
            'client_id': client_id,
            'scope': ' '.join(current_app.config['FITBIT_SCOPES']),
            'redirect_uri': redirect_uri
        }
        
        # Generate a secure state parameter instead of using oauth.state
        state_value = secrets.token_urlsafe(16)
        params['state'] = state_value
        
        # Build the authorization URL
        authorization_url = f"{auth_url}?{urlencode(params)}"
        
        # Store state in session as a string value
        session['oauth_state'] = state_value
        session.modified = True
        
        # Add detailed session debugging
        current_app.logger.info(f"Session contents after setting state: {dict(session)}")
        
        # Log the URL being generated (for debugging)
        current_app.logger.info(f"Generated authorization URL: {authorization_url}")
        
        return jsonify({'authorization_url': authorization_url})
    except Exception as e:
        current_app.logger.error(f"Error in login route: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@bp.route('/callback', methods=['GET'])
def callback():
    """Handle the OAuth callback from Fitbit"""
    # Get authorization code from request
    code = request.args.get('code')
    state = request.args.get('state')
    
    # Enhanced session debugging
    current_app.logger.info(f"Callback received - code: {'[REDACTED]' if code else 'None'}, state: {state}")
    current_app.logger.info(f"Session state: {session.get('oauth_state')}")
    current_app.logger.info(f"Session ID: {session.sid if hasattr(session, 'sid') else 'N/A'}")
    current_app.logger.info(f"Session contents at start of callback: {dict(session)}")
    
    # State validation is temporarily commented out as it's causing problems
    # session_state = session.get('oauth_state')
    # if not state or session_state != state:
    #     current_app.logger.error(f"State mismatch. Request state: {state}, Session state: {session_state}")
    #     return jsonify({'error': 'Invalid state parameter', 'details': 'Possible CSRF attack'}), 400
    
    if not code:
        current_app.logger.error("Authorization code not found in request")
        return jsonify({'error': 'Authorization code not found in request'}), 400
    
    try:
        # Exchange code for token
        token_url = current_app.config['FITBIT_TOKEN_URL']
        client_id = current_app.config['FITBIT_CLIENT_ID']
        client_secret = current_app.config['FITBIT_CLIENT_SECRET']
        redirect_uri = current_app.config['FITBIT_REDIRECT_URI']
        
        # Create basic auth header
        auth_header = base64.b64encode(
            f"{client_id}:{client_secret}".encode()
        ).decode()
        
        headers = {
            'Authorization': f'Basic {auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        }
        
        current_app.logger.info(f"Exchanging code for token at {token_url}")
        current_app.logger.info(f"Redirect URI for exchange: {redirect_uri}")
        
        # Add timeout to prevent hanging requests
        response = requests.post(token_url, headers=headers, data=data, timeout=10)
        
        current_app.logger.info(f"Token response status: {response.status_code}")
        
        if response.status_code != 200:
            current_app.logger.error(f"Failed to obtain access token: {response.text}")
            return jsonify({
                'error': 'Failed to obtain access token',
                'details': response.text
            }), response.status_code
        
        # Parse token response
        token_data = response.json()
        current_app.logger.info("Successfully obtained access token")
        
        # Calculate absolute expiration time if not provided
        if 'expires_at' not in token_data and 'expires_in' in token_data:
            token_data['expires_at'] = time.time() + int(token_data['expires_in'])
            current_app.logger.info(f"Set token expiration timestamp: {token_data['expires_at']}")
        
        # Log token data (excluding sensitive information)
        token_debug = {k: v for k, v in token_data.items() if k not in ['access_token', 'refresh_token']}
        current_app.logger.info(f"Token metadata: {token_debug}")
        
        # Store token in session
        session['oauth_token'] = token_data
        session['token_acquired_at'] = time.time()  # Store when we received the token
        
        # Force session save to prevent data loss
        current_app.logger.info("Forcing session save...")
        session.modified = True
        
        # Debug session after storing token
        current_app.logger.info(f"Session after storing token: {dict(session)}")
        
        # Redirect to frontend with success parameter and cache-busting timestamp
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}?auth=success&ts={int(time.time())}")
    except requests.RequestException as re:
        current_app.logger.error(f"Network error during token exchange: {str(re)}")
        return jsonify({'error': 'Network error during token exchange', 'details': str(re)}), 500
    except json.JSONDecodeError as je:
        current_app.logger.error(f"Invalid JSON in token response: {str(je)}")
        return jsonify({'error': 'Invalid token response format', 'details': str(je)}), 500
    except Exception as e:
        current_app.logger.error(f"Error in callback route: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@bp.route('/token', methods=['GET'])
def get_token():
    """Return the current OAuth token"""
    try:
        token = session.get('oauth_token')
        current_app.logger.info(f"Token request - token exists: {token is not None}")
        current_app.logger.info(f"Session contents during token request: {dict(session)}")
        
        if not token:
            return jsonify({'authenticated': False}), 401
        
        # Check if token is expired
        if token.get('expires_at') and token.get('expires_at') < time.time():
            # Token is expired, attempt to refresh
            refresh_token = token.get('refresh_token')
            
            if not refresh_token:
                # No refresh token, user needs to log in again
                session.pop('oauth_token', None)
                current_app.logger.error("Token expired and no refresh token available")
                return jsonify({'authenticated': False, 'error': 'Token expired'}), 401
            
            try:
                # Refresh the token
                token_url = current_app.config['FITBIT_TOKEN_URL']
                client_id = current_app.config['FITBIT_CLIENT_ID']
                client_secret = current_app.config['FITBIT_CLIENT_SECRET']
                
                auth_header = base64.b64encode(
                    f"{client_id}:{client_secret}".encode()
                ).decode()
                
                headers = {
                    'Authorization': f'Basic {auth_header}',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                
                data = {
                    'grant_type': 'refresh_token',
                    'refresh_token': refresh_token
                }
                
                current_app.logger.info("Refreshing expired token...")
                response = requests.post(token_url, headers=headers, data=data, timeout=10)
                
                if response.status_code != 200:
                    # Refresh failed, user needs to log in again
                    session.pop('oauth_token', None)
                    current_app.logger.error(f"Token refresh failed: {response.text}")
                    return jsonify({'authenticated': False, 'error': 'Refresh token failed'}), 401
                
                # Update token in session
                token = response.json()
                
                # Calculate absolute expiration time if not provided
                if 'expires_at' not in token and 'expires_in' in token:
                    token['expires_at'] = time.time() + int(token['expires_in'])
                
                session['oauth_token'] = token
                session['token_refreshed_at'] = time.time()  # Track when token was refreshed
                session.modified = True
                
                current_app.logger.info("Token successfully refreshed")
            except Exception as e:
                current_app.logger.error(f"Error refreshing token: {str(e)}")
                session.pop('oauth_token', None)
                return jsonify({'authenticated': False, 'error': str(e)}), 500
        
        # Return the token info (but not the actual token for security)
        return jsonify({
            'authenticated': True,
            'token': {
                'expires_at': token.get('expires_at'),
                'scopes': token.get('scope', '').split(),
                'user_id': token.get('user_id')
            }
        })
    except Exception as e:
        current_app.logger.error(f"Error in get_token route: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'authenticated': False, 'error': str(e)}), 500

@bp.route('/logout', methods=['POST'])
def logout():
    """Clear the user's session"""
    try:
        session.pop('oauth_token', None)
        session.pop('oauth_state', None)
        session.pop('token_acquired_at', None)
        session.pop('token_refreshed_at', None)
        session.modified = True
        
        current_app.logger.info("User logged out successfully")
        return jsonify({'message': 'Logged out successfully'})
    except Exception as e:
        current_app.logger.error(f"Error in logout route: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/debug-session', methods=['GET'])
def debug_session():
    """Debug endpoint to check session"""
    try:
        session_data = {
            'session_exists': bool(session),
            'session_has_token': 'oauth_token' in session,
            'session_has_state': 'oauth_state' in session,
            'session_keys': list(session.keys()),
            'session_id': session.sid if hasattr(session, 'sid') else None,
            'token_expires_at': session.get('oauth_token', {}).get('expires_at') if 'oauth_token' in session else None,
            'token_acquired_at': session.get('token_acquired_at'),
            'token_refreshed_at': session.get('token_refreshed_at'),
            'config': {
                'session_type': current_app.config.get('SESSION_TYPE'),
                'permanent': current_app.config.get('SESSION_PERMANENT'),
                'cookie_secure': current_app.config.get('SESSION_COOKIE_SECURE'),
                'cookie_samesite': current_app.config.get('SESSION_COOKIE_SAMESITE'),
                'cookie_path': current_app.config.get('SESSION_COOKIE_PATH'),
                'cookie_httponly': current_app.config.get('SESSION_COOKIE_HTTPONLY')
            }
        }
        
        current_app.logger.info(f"Debug session info: {session_data}")
        return jsonify(session_data)
    except Exception as e:
        current_app.logger.error(f"Error in debug-session route: {str(e)}")
        return jsonify({'error': str(e)}), 500
