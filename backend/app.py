from flask import Flask, jsonify, send_from_directory, session
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from api import auth, fitbit, apple_fitness
from config import Config
from datetime import timedelta
from flask_session import Session
from flask_session_fix import apply_session_fix

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize Flask app
app = Flask(__name__, static_folder='static')
app.config.from_object(Config)

# Configure session
app.secret_key = app.config['SECRET_KEY']
# Set secure cookie settings
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = None  # IMPORTANT: Must be None (not 'None') for cross-site cookies
app.config['SESSION_COOKIE_PATH'] = '/'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True

# Configure server-side session
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flask_session')
app.config['SESSION_USE_SIGNER'] = True

# Ensure session directory exists
if not os.path.exists(app.config['SESSION_FILE_DIR']):
    os.makedirs(app.config['SESSION_FILE_DIR'])

# Initialize Flask-Session
Session(app)

# Apply session fix
apply_session_fix(app)

# Enable CORS with specific configurations
CORS(app, 
     supports_credentials=True, 
     origins=[app.config['FRONTEND_URL']],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', app.config['FRONTEND_URL'])
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Register blueprints
app.register_blueprint(auth.bp, url_prefix='/api/auth')
app.register_blueprint(fitbit.bp, url_prefix='/api/fitbit')
app.register_blueprint(apple_fitness.bp, url_prefix='/api/apple-fitness')

# Route for checking API status
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'version': '1.0.0',
        'session_active': 'oauth_token' in session,
        'session_keys': list(session.keys()) if session else []
    })

# Add debug route to check session contents
@app.route('/api/debug-session', methods=['GET'])
def debug_session():
    return jsonify({
        'session_exists': bool(session),
        'session_keys': list(session.keys()) if session else [],
        'has_oauth_token': 'oauth_token' in session,
        'has_oauth_state': 'oauth_state' in session,
        'has_apple_fitness_token': 'apple_fitness_access_token' in session,
        'session_id': session.sid if hasattr(session, 'sid') else None
    })

# Add a test route to verify API is working
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'API is working correctly'
    })

# Define static folder for serving frontend files
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

# Serve frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.logger.info("Starting Flask app...")
    app.logger.info(f"FITBIT_CLIENT_ID: {app.config['FITBIT_CLIENT_ID']}")
    app.logger.info(f"FITBIT_REDIRECT_URI: {app.config['FITBIT_REDIRECT_URI']}")
    app.logger.info(f"APPLE_FITNESS_CLIENT_ID: {app.config['APPLE_FITNESS_CLIENT_ID']}")
    app.logger.info(f"APPLE_FITNESS_REDIRECT_URI: {app.config['APPLE_FITNESS_REDIRECT_URI']}")
    app.logger.info(f"CORS configured to allow origin: {app.config['FRONTEND_URL']}")
    app.run(host='0.0.0.0', port=5000, debug=True)