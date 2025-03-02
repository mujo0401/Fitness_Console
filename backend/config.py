import os
from datetime import timedelta

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-for-testing-only')
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_SECURE = True  
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = None 
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
  
    # Fitbit API configuration
    FITBIT_CLIENT_ID = os.environ.get('FITBIT_CLIENT_ID', '')
    FITBIT_CLIENT_SECRET = os.environ.get('FITBIT_CLIENT_SECRET', '')
    FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize'
    FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token'
    FITBIT_API_BASE_URL = 'https://api.fitbit.com'
    
    # Apple Fitness API configuration
    APPLE_FITNESS_CLIENT_ID = os.environ.get('APPLE_FITNESS_CLIENT_ID', '')
    APPLE_FITNESS_CLIENT_SECRET = os.environ.get('APPLE_FITNESS_CLIENT_SECRET', '')
    APPLE_FITNESS_TEAM_ID = os.environ.get('APPLE_FITNESS_TEAM_ID', '')
    APPLE_FITNESS_KEY_ID = os.environ.get('APPLE_FITNESS_KEY_ID', '')
    APPLE_FITNESS_PRIVATE_KEY = os.environ.get('APPLE_FITNESS_PRIVATE_KEY', '')
    APPLE_FITNESS_PRIVATE_KEY_PATH = os.environ.get('APPLE_FITNESS_PRIVATE_KEY_PATH', '')
    APPLE_FITNESS_AUTH_URL = 'https://appleid.apple.com/auth/authorize'
    APPLE_FITNESS_TOKEN_URL = 'https://appleid.apple.com/auth/token'
    APPLE_FITNESS_API_BASE_URL = 'https://api.apple-fitness.apple.com' 

    # For development, use localhost. For production, use your actual domain
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://fitness-console-gtxc.onrender.com')
    FITBIT_REDIRECT_URI = os.environ.get('FITBIT_REDIRECT_URI', 'http://localhost:5000/api/auth/callback')
    APPLE_FITNESS_REDIRECT_URI = os.environ.get('APPLE_FITNESS_REDIRECT_URI', 'http://localhost:5000/api/apple-fitness/callback')

    # Requested scopes from Fitbit API
    FITBIT_SCOPES = [
        'activity',
        'heartrate', 
        'location', 
        'nutrition', 
        'profile', 
        'settings', 
        'sleep', 
        'weight'
    ]   

    # Requested scopes from Apple Fitness API
    APPLE_FITNESS_SCOPES = [
        'name',
        'email',
        'fitness',
        'activity',
        'workout',
      'vitalsigns'
    ]    # Google API configuration
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
    
    # DoorDash API configuration
    DOORDASH_API_KEY = os.environ.get('DOORDASH_API_KEY', '')
    DOORDASH_API_BASE_URL = os.environ.get('DOORDASH_API_BASE_URL', 'https://api.doordash.com')
    DOORDASH_CLIENT_ID = os.environ.get('DOORDASH_CLIENT_ID', '')
    DOORDASH_CLIENT_SECRET = os.environ.get('DOORDASH_CLIENT_SECRET', '')
    DOORDASH_MOCK_API_ENABLED = os.environ.get('DOORDASH_MOCK_API_ENABLED', 'True') == 'True'
    
    # Spoonacular API configuration
    SPOONACULAR_API_KEY = os.environ.get("SPOONACULAR_API_KEY", "")
    SPOONACULAR_API_BASE_URL = "https://api.spoonacular.com"
    SPOONACULAR_CACHE_ENABLED = os.environ.get("SPOONACULAR_CACHE_ENABLED", "True") == "True"
    SPOONACULAR_CACHE_TIMEOUT = int(os.environ.get("SPOONACULAR_CACHE_TIMEOUT", "3600"))  # Default 1 hour cache