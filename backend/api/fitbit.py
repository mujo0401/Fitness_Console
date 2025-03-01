import sys
import os
from flask import Blueprint, jsonify, request, session, current_app
import requests
from datetime import datetime, timedelta
import time
import hashlib
import json
from functools import wraps
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.data_processor import process_heart_rate_data, detect_abnormal_rhythms, process_sleep_data, process_activity_data

bp = Blueprint('fitbit', __name__)

# Simple in-memory cache
cache = {}
# Default cache expiration in seconds (30 minutes)
CACHE_EXPIRATION = 1800

# Rate limiting variables
REQUEST_LIMIT = 150  # Fitbit allows 150 requests per hour
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds
request_timestamps = []


def rate_limit():
    """Decorator for rate limiting requests to Fitbit API"""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # For now, disable the rate limit to help troubleshooting
            # Just execute the function directly
            return f(*args, **kwargs)
        return wrapped
    return decorator


def get_fitbit_headers():
    """Get headers with OAuth token for Fitbit API requests"""
    token = session.get('oauth_token')
    
    if not token:
        return None
    
    return {
        'Authorization': f"Bearer {token.get('access_token')}",
        'Accept': 'application/json'
    }


def get_cache_key(url, params=None):
    """Generate a cache key from the URL and parameters"""
    key_parts = [url]
    if params:
        for k, v in sorted(params.items()):
            key_parts.append(f"{k}={v}")
    
    key_string = '|'.join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()


def get_cached_response(url, params=None):
    """Get response from cache if available and not expired"""
    # Temporarily disable caching for troubleshooting
    return None


def cache_response(url, response_data, params=None):
    """Cache the response data with current timestamp"""
    cache_key = get_cache_key(url, params)
    cache[cache_key] = {
        'data': response_data,
        'timestamp': time.time()
    }


def fitbit_request(url, headers, params=None):
    """Make a request to Fitbit API with caching"""
    # Temporary debugging
    current_app.logger.info(f"Making request to: {url}")
    current_app.logger.info(f"With headers: {headers}")
    
    # Make actual request
    response = requests.get(url, headers=headers, params=params)
    
    # Log response for debugging
    current_app.logger.info(f"Response status: {response.status_code}")
    
    if response.status_code != 200:
        current_app.logger.error(f"Error response: {response.text}")
    
    # Cache successful responses
    if response.status_code == 200:
        cache_response(url, response.json(), params)
    
    return response.json() if response.status_code == 200 else response.text, response.status_code


@bp.route('/profile', methods=['GET'])
@rate_limit()
def get_profile():
    """Get the user's Fitbit profile"""
    headers = get_fitbit_headers()
    
    if not headers:
        return jsonify({'error': 'Not authenticated'}), 401
    
    url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/profile.json"
    data, status_code = fitbit_request(url, headers)
    
    if status_code != 200:
        return jsonify({
            'error': 'Failed to fetch profile',
            'details': data
        }), status_code
    
    return jsonify(data)


@bp.route('/debug-heart', methods=['GET'])
@rate_limit()
def debug_heart():
    """Debug endpoint for heart rate data"""
    try:
        token = session.get('oauth_token')
        if not token:
            return jsonify({'error': 'Not authenticated'}), 401
            
        # Make a test request to Fitbit API for heart rate data
        headers = {
            'Authorization': f'Bearer {token["access_token"]}',
            'Accept-Language': 'en_US'
        }
        
        # Try to get today's heart rate data
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        url = f'https://api.fitbit.com/1/user/-/activities/heart/date/{date}/1d.json'
        
        data, status_code = fitbit_request(url, headers)
        
        return jsonify({
            'status_code': status_code,
            'data': data if status_code == 200 else None,
            'scopes': token.get('scope', '').split(' ')
        })
    except Exception as e:
        current_app.logger.error(f"Debug heart error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/heart-rate', methods=['GET'])
@rate_limit()
def get_heart_rate():
    """Get heart rate data for a given time period"""
    headers = get_fitbit_headers()
    
    if not headers:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'day')  # day, week, month, 3month
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # Calculate start and end dates based on period
    end_date = datetime.strptime(date, '%Y-%m-%d')
    
    if period == 'day':
        start_date = end_date
        detail_level = '1sec'  # Get the highest available resolution for a single day
    elif period == 'week':
        start_date = end_date - timedelta(days=7)
        detail_level = '1min'
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
        detail_level = '5min'
    elif period == '3month':
        start_date = end_date - timedelta(days=90)
        detail_level = '15min'
    else:
        return jsonify({'error': 'Invalid period'}), 400
    
    # Format dates for API
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    
    # Make request to Fitbit API
    url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/heart/date/{start_str}/{end_str}/{detail_level}.json"
    params = {}
    heart_rate_data, status_code = fitbit_request(url, headers, params)
    
    if status_code != 200:
        return jsonify({
            'error': 'Failed to fetch heart rate data',
            'details': heart_rate_data
        }), status_code
    
    # Process the data
    processed_data = process_heart_rate_data(heart_rate_data, period)
    
    # Detect abnormal rhythms
    if period in ['day', 'week']:
        abnormal_events = detect_abnormal_rhythms(processed_data)
        return jsonify({
            'data': processed_data,
            'abnormal_events': abnormal_events,
            'period': period,
            'start_date': start_str,
            'end_date': end_str
        })
    
    return jsonify({
        'data': processed_data,
        'period': period,
        'start_date': start_str,
        'end_date': end_str
    })


@bp.route('/sleep', methods=['GET'])
@rate_limit()
def get_sleep():
    """Get sleep data for a given time period"""
    headers = get_fitbit_headers()
    
    if not headers:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'day')  # day, week, month
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # Calculate start and end dates based on period
    end_date = datetime.strptime(date, '%Y-%m-%d')
    
    if period == 'day':
        # For a day, we get the data for that specific date
        start_date = end_date
    elif period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    else:
        return jsonify({'error': 'Invalid period'}), 400
    
    # Format dates for API
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    
    # Make request to Fitbit API
    params = {'period': period, 'date': date}
    if period == 'day':
        url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/sleep/date/{date}.json"
    else:
        url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/sleep/date/{start_str}/{end_str}.json"
    
    sleep_data, status_code = fitbit_request(url, headers, params)
    
    if status_code != 200:
        return jsonify({
            'error': 'Failed to fetch sleep data',
            'details': sleep_data
        }), status_code
    
    # Process the data
    processed_data = process_sleep_data(sleep_data, period)
    
    return jsonify({
        'data': processed_data,
        'period': period,
        'start_date': start_str,
        'end_date': end_str
    })


@bp.route('/activity', methods=['GET'])
@rate_limit()
def get_activity():
    """Get activity data for a given time period"""
    headers = get_fitbit_headers()
    
    if not headers:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'day')  # day, week, month
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # Calculate start and end dates based on period
    end_date = datetime.strptime(date, '%Y-%m-%d')
    
    if period == 'day':
        # For a day, we get the data for that specific date
        start_date = end_date
    elif period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    else:
        return jsonify({'error': 'Invalid period'}), 400
    
    # Format dates for API
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    
    # Different API endpoints for activity data
    activity_data = {}
    params = {'period': period, 'date': date}
    
    if period == 'day':
        # For a single day, get summary and intraday data
        url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/date/{date}.json"
        
        # Add intraday steps data if available
        steps_url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/steps/date/{date}/1d/15min.json"
        steps_data, steps_status = fitbit_request(steps_url, headers, params)
        
        main_data, main_status = fitbit_request(url, headers, params)
        
        if main_status == 200:
            activity_data = main_data
            if steps_status == 200:
                activity_data['activities-steps-intraday'] = steps_data.get('activities-steps-intraday', {})
    else:
        # For longer periods, get time series data
        urls = {
            'activities-steps': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/steps/date/{start_str}/{end_str}.json",
            'activities-calories': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/calories/date/{start_str}/{end_str}.json",
            'activities-distance': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/distance/date/{start_str}/{end_str}.json",
            'activities-floors': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/floors/date/{start_str}/{end_str}.json",
            'activities-minutesSedentary': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/minutesSedentary/date/{start_str}/{end_str}.json",
            'activities-minutesLightlyActive': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/minutesLightlyActive/date/{start_str}/{end_str}.json",
            'activities-minutesFairlyActive': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/minutesFairlyActive/date/{start_str}/{end_str}.json",
            'activities-minutesVeryActive': f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/activities/minutesVeryActive/date/{start_str}/{end_str}.json"
        }
        
        # Make API calls for each activity metric
        for metric, url in urls.items():
            metric_data, status_code = fitbit_request(url, headers, params)
            if status_code == 200:
                activity_data[metric] = metric_data.get(metric, [])
    
    # Process the data
    processed_data = process_activity_data(activity_data, period)
    
    return jsonify({
        'data': processed_data,
        'period': period,
        'start_date': start_str,
        'end_date': end_str
    })


@bp.route('/status', methods=['GET'])
@rate_limit()
def get_status():
    """Check if the user is connected to Fitbit"""
    token = session.get('oauth_token')
    
    if not token:
        return jsonify({'connected': False})
    
    headers = get_fitbit_headers()
    
    # Make a simple API request to check if token is valid
    url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/profile.json"
    data, status_code = fitbit_request(url, headers)
    
    if status_code == 200:
        return jsonify({'connected': True})
    else:
        # Token might be invalid, clear it
        session.pop('oauth_token', None)
        return jsonify({'connected': False})


@bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear the cache (admin endpoint)"""
    global cache
    cache = {}
    return jsonify({'message': 'Cache cleared successfully'})


@bp.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics (admin endpoint)"""
    return jsonify({
        'cache_size': len(cache),
        'cache_keys': list(cache.keys())
    })