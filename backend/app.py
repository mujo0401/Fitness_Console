from flask import Flask, jsonify, send_from_directory, session, request
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

# Initialize Flask app with no static folder initially
app = Flask(__name__)
app.config.from_object(Config)

# Configure session
app.secret_key = app.config['SECRET_KEY']
# Set secure cookie settings
app.config['SESSION_COOKIE_SECURE'] = True  # Must be True when SameSite=None for Chrome to accept the cookie
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
# Allow both local and production frontend
allowed_origins = [
    'http://localhost:3000',
    'https://fitness-console-gtxc.onrender.com'
]
CORS(app, 
     supports_credentials=True, 
     origins=allowed_origins,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.set('Access-Control-Allow-Origin', origin)
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

# Add a simple root route for testing
@app.route('/ping')
def ping():
    return jsonify({"message": "pong"})

# Define the path to the static files directory
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.logger.info(f"Static directory path: {STATIC_DIR}")

# List files in the static directory for debugging
try:
    app.logger.info(f"Static directory contents: {os.listdir(STATIC_DIR)}")
    static_dir_files = os.listdir(os.path.join(STATIC_DIR, 'static'))
    app.logger.info(f"Static/static directory contents: {static_dir_files}")
except Exception as e:
    app.logger.error(f"Error listing static directory: {str(e)}")

# Serve specific static files
@app.route('/static/js/<path:filename>')
def serve_js(filename):
    try:
        return send_from_directory(os.path.join(STATIC_DIR, 'static', 'js'), filename)
    except Exception as e:
        app.logger.error(f"Error serving JS file: {str(e)}")
        return jsonify({"error": str(e)}), 404

@app.route('/static/css/<path:filename>')
def serve_css(filename):
    try:
        return send_from_directory(os.path.join(STATIC_DIR, 'static', 'css'), filename)
    except Exception as e:
        app.logger.error(f"Error serving CSS file: {str(e)}")
        return jsonify({"error": str(e)}), 404

@app.route('/static/media/<path:filename>')
def serve_media(filename):
    try:
        return send_from_directory(os.path.join(STATIC_DIR, 'static', 'media'), filename)
    except Exception as e:
        app.logger.error(f"Error serving media file: {str(e)}")
        return jsonify({"error": str(e)}), 404

# Serve other static files
@app.route('/static/<path:filename>')
def serve_static_files(filename):
    try:
        app.logger.info(f"Serving static file: {filename}")
        return send_from_directory(os.path.join(STATIC_DIR, 'static'), filename)
    except Exception as e:
        app.logger.error(f"Error serving static file {filename}: {str(e)}")
        return jsonify({"error": str(e)}), 404

# Serve root files like manifest.json, robots.txt, etc.
@app.route('/<path:filename>')
def serve_root_files(filename):
    # Skip API routes
    if filename.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
        
    try:
        if os.path.exists(os.path.join(STATIC_DIR, filename)):
            app.logger.info(f"Serving root file: {filename}")
            return send_from_directory(STATIC_DIR, filename)
        else:
            app.logger.info(f"Root file not found, serving index.html: {filename}")
            return send_from_directory(STATIC_DIR, 'index.html')
    except Exception as e:
        app.logger.error(f"Error serving root file {filename}: {str(e)}")
        return jsonify({"error": str(e)}), 404

# Serve frontend in production
@app.route('/', defaults={'path': ''})
def serve_index(path):
    try:
        app.logger.info("Serving index.html")
        return send_from_directory(STATIC_DIR, 'index.html')
    except Exception as e:
        app.logger.error(f"Error serving index.html: {str(e)}")
        return jsonify({"error": str(e)}), 404

if __name__ == '__main__':
    app.logger.info("Starting Flask app...")
    app.logger.info(f"FITBIT_CLIENT_ID: {app.config['FITBIT_CLIENT_ID']}")
    app.logger.info(f"FITBIT_REDIRECT_URI: {app.config['FITBIT_REDIRECT_URI']}")
    app.logger.info(f"APPLE_FITNESS_CLIENT_ID: {app.config['APPLE_FITNESS_CLIENT_ID']}")
    app.logger.info(f"APPLE_FITNESS_REDIRECT_URI: {app.config['APPLE_FITNESS_REDIRECT_URI']}")
    app.logger.info(f"CORS configured to allow origins: {allowed_origins}")
    app.run(host='0.0.0.0', port=5000, debug=True)