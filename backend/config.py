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
    
    # Google Fit API configuration
    GOOGLE_FIT_CLIENT_ID = os.environ.get('GOOGLE_FIT_CLIENT_ID', '')
    GOOGLE_FIT_CLIENT_SECRET = os.environ.get('GOOGLE_FIT_CLIENT_SECRET', '')
    GOOGLE_FIT_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'
    GOOGLE_FIT_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_FIT_API_BASE_URL = 'https://www.googleapis.com/fitness/v1'
    
    # YouTube Music API configuration
    YOUTUBE_MUSIC_CLIENT_ID = os.environ.get('YOUTUBE_MUSIC_CLIENT_ID', '')
    YOUTUBE_MUSIC_CLIENT_SECRET = os.environ.get('YOUTUBE_MUSIC_CLIENT_SECRET', '')
    YOUTUBE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'
    YOUTUBE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
    # Always disable mock mode for YouTube Music in production
    YOUTUBE_MUSIC_MOCK_ENABLED = False

    # For development, use localhost. For production, use your actual domain
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://fitness-console-gtxc.onrender.com')
    FITBIT_REDIRECT_URI = os.environ.get('FITBIT_REDIRECT_URI', 'http://localhost:5000/api/auth/callback')
    APPLE_FITNESS_REDIRECT_URI = os.environ.get('APPLE_FITNESS_REDIRECT_URI', 'http://localhost:5000/api/apple-fitness/callback')
    GOOGLE_FIT_REDIRECT_URI = os.environ.get('GOOGLE_FIT_REDIRECT_URI', 'http://localhost:5000/api/google-fit/callback')
    YOUTUBE_MUSIC_REDIRECT_URI = os.environ.get('YOUTUBE_MUSIC_REDIRECT_URI', 'http://localhost:5000/api/youtube-music/callback')

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
    ]
    
    # Requested scopes from Google Fit API
    GOOGLE_FIT_SCOPES = [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.location.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
    
    # Requested scopes from YouTube Music API
    YOUTUBE_MUSIC_SCOPES = [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtubepartner',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
    
    # Google API configuration
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