import sys
import os
from flask import Blueprint, jsonify, request, session, current_app
import requests
from datetime import datetime, timedelta
import time
import hashlib
import json
from functools import wraps
import threading
import asyncio
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

# BLE connection and data management
bluetooth_connected = False
bluetooth_hr_data = {}
bluetooth_lock = threading.Lock()
bluetooth_device = None
bluetooth_thread = None
FITBIT_HR_SERVICE_UUID = "180d"  # Heart Rate service UUID
FITBIT_HR_CHARACTERISTIC_UUID = "2a37"  # Heart Rate Measurement characteristic UUID
FITBIT_DEVICE_NAME_PREFIX = "Charge 6"  # Device name prefix for Fitbit Charge 6


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
        # Add more detailed logging for troubleshooting
        if response.status_code == 401:
            current_app.logger.error("Authentication error - token may be invalid or missing required scopes")
            # Check token scopes
            token = session.get('oauth_token')
            if token and 'scope' in token:
                scopes = token['scope'].split(' ')
                current_app.logger.error(f"Token scopes: {scopes}")
                if 'heartrate' not in scopes:
                    current_app.logger.error("CRITICAL: 'heartrate' scope is missing from token!")
    
    # Cache successful responses
    if response.status_code == 200:
        # Log a sample of the response for debugging
        try:
            response_json = response.json()
            cache_response(url, response_json, params)
            
            # Debug log the structure of the response if it's a heart rate request
            if 'heart' in url:
                current_app.logger.info("Analyzing heart rate response structure:")
                
                if 'activities-heart' in response_json:
                    heart_data = response_json['activities-heart']
                    current_app.logger.info(f"Heart data entries: {len(heart_data)}")
                    
                    # Log first entry as sample
                    if heart_data and len(heart_data) > 0:
                        current_app.logger.info(f"Sample heart entry: {heart_data[0]}")
                    else:
                        current_app.logger.warning("Heart data array is empty!")
                    
                    # Check for intraday data
                    if 'activities-heart-intraday' in response_json:
                        intraday = response_json['activities-heart-intraday']
                        dataset = intraday.get('dataset', [])
                        current_app.logger.info(f"Intraday data points: {len(dataset)}")
                        
                        # Log first few points if available
                        if dataset and len(dataset) > 0:
                            current_app.logger.info(f"Sample intraday points: {dataset[:3]}")
                        else:
                            current_app.logger.warning("Intraday dataset is empty!")
                    else:
                        current_app.logger.warning("No intraday data found in response!")
                else:
                    current_app.logger.warning("Unexpected response format - no activities-heart field")
            
            return response_json, response.status_code
        except Exception as e:
            current_app.logger.error(f"Error processing response JSON: {str(e)}")
            return response.json() if response.status_code == 200 else response.text, response.status_code
    
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


def validate_date_param(date_str):
    """
    Validate the date parameter for API requests
    - Rejects future dates
    - Ensures proper format
    - Falls back to today's date if invalid
    
    Returns: A valid date string in YYYY-MM-DD format
    """
    today = datetime.now()
    try:
        # Parse the provided date
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        
        # If the date is in the future, use today's date instead
        if date_obj.date() > today.date():
            current_app.logger.warning(f"Future date requested: {date_str}, using today's date instead")
            return today.strftime('%Y-%m-%d')
        
        # Valid date, return as is
        return date_str
    except (ValueError, TypeError):
        # Invalid date format, use today's date
        current_app.logger.warning(f"Invalid date format: {date_str}, using today's date instead")
        return today.strftime('%Y-%m-%d')

@bp.route('/heart-rate', methods=['GET'])
@rate_limit()
def get_heart_rate():
    """Get heart rate data for a given time period"""
    # Extra verbose logging for debugging
    current_app.logger.info("=== HEART RATE ENDPOINT CALLED ===")
    
    # Check authentication
    token = session.get('oauth_token')
    if token:
        current_app.logger.info(f"Token found in session. Expires at: {token.get('expires_at', 'unknown')}")
        if 'scope' in token:
            scopes = token['scope'].split(' ')
            current_app.logger.info(f"Token scopes: {scopes}")
            if 'heartrate' not in scopes:
                current_app.logger.error("CRITICAL: 'heartrate' scope is missing from token!")
                return jsonify({
                    'error': 'Missing required scope',
                    'details': 'The heartrate scope is required but missing. Please reconnect your Fitbit account.'
                }), 403
    else:
        current_app.logger.error("No OAuth token found in session!")
        return jsonify({'error': 'Not authenticated'}), 401
    
    headers = get_fitbit_headers()
    
    if not headers:
        current_app.logger.error("No valid headers - authentication failed")
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get query parameters
    period = request.args.get('period', 'day')  # day, week, month, 3month
    date_param = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # Validate and normalize date parameter
    validated_date = validate_date_param(date_param)
    if validated_date != date_param:
        current_app.logger.info(f"Date parameter was changed from {date_param} to {validated_date}")
    
    # Calculate start and end dates based on period
    end_date = datetime.strptime(validated_date, '%Y-%m-%d')
    
    # Set the date range based on period
    if period == 'day':
        start_date = end_date
    elif period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    elif period == '3month':
        start_date = end_date - timedelta(days=90)
    else:
        return jsonify({'error': 'Invalid period'}), 400
    
    # Set detail level based on period to avoid timeouts with large datasets
    if period == '3month':
        # For 3-month period, use 1-minute resolution to avoid timeout and excessive data
        detail_level = '1min'
        current_app.logger.info(f"Using reduced detail level {detail_level} for {period} to prevent timeouts")
    else:
        # For shorter periods, use highest resolution possible
        detail_level = '1sec'  # Request second-by-second data for maximum detail
        current_app.logger.info(f"Using detailed level {detail_level} for period {period}")
    
    # Format dates for API
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    
    # Check if we have cached BlueTooth data for this request
    if period == 'day' and bluetooth_connected and bluetooth_hr_data:
        # Try to use BLE data if available for this date
        bluetooth_date = datetime.now().strftime('%Y-%m-%d')
        if bluetooth_date == validated_date:
            with bluetooth_lock:
                if bluetooth_hr_data:
                    current_app.logger.info(f"Using local Bluetooth heart rate data for {validated_date}")
                    filtered_data = []
                    for timestamp, data in bluetooth_hr_data.items():
                        if data.get('date') == validated_date:
                            filtered_data.append(data)
                    
                    # Process the data
                    ble_data = {"activities-heart-intraday": {"dataset": filtered_data}}
                    processed_data = process_heart_rate_data(ble_data, period)
                    
                    # If we have data, return it
                    if processed_data and len(processed_data) > 0:
                        return jsonify({
                            'data': processed_data,
                            'source': 'bluetooth',
                            'period': period,
                            'start_date': start_str,
                            'end_date': end_str
                        })
    
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
    
    # Check if we got any data
    if not processed_data or len(processed_data) == 0:
        current_app.logger.warning(f"No heart rate data found for {start_str} to {end_str}")
        return jsonify({
            'data': [],
            'period': period,
            'start_date': start_str,
            'end_date': end_str,
            'warning': 'No heart rate data available for the requested period.'
        })
    
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
    # Add detailed logging for debugging
    current_app.logger.info("=== FITBIT STATUS ENDPOINT CALLED ===")
    current_app.logger.info(f"Session keys: {list(session.keys())}")
    
    # Check for force reconnect parameter
    force_reconnect = request.args.get('force_reconnect', 'false').lower() == 'true'
    if force_reconnect:
        current_app.logger.info("Force reconnect requested - clearing any disconnect flags")
        session.pop('fitbit_explicitly_disconnected', None)
        session.modified = True
    
    # Debug the force reconnect
    current_app.logger.info(f"force_reconnect parameter: {force_reconnect}")
    current_app.logger.info(f"Disconnect flag present: {'fitbit_explicitly_disconnected' in session}")
    
    # Check disconnect flag first
    if session.get('fitbit_explicitly_disconnected') == True and not force_reconnect:
        current_app.logger.info("Fitbit explicitly disconnected flag is set - reporting not connected")
        return jsonify({'connected': False})
    
    # Get OAuth token and validate
    token = session.get('oauth_token')
    if not token:
        # For auto-reconnect testing in development only!
        if os.environ.get('FLASK_ENV') == 'development' and force_reconnect:
            current_app.logger.info("Development mode with force_reconnect - creating test token")
            return jsonify({'connected': True})
        
        current_app.logger.info("No OAuth token in session")
        return jsonify({'connected': False})
    
    # Token exists, make a simple request to verify it
    headers = get_fitbit_headers()
    
    # Skip verification if force_reconnect to speed things up
    if force_reconnect:
        current_app.logger.info("Force reconnect - skipping token verification, assuming connected")
        return jsonify({'connected': True})
    
    # Verify token with API call
    current_app.logger.info("Verifying token with Fitbit API")
    url = f"{current_app.config['FITBIT_API_BASE_URL']}/1/user/-/profile.json"
    try:
        data, status_code = fitbit_request(url, headers)
        
        if status_code == 200:
            current_app.logger.info("Token verification successful - connected")
            return jsonify({'connected': True})
        else:
            current_app.logger.error(f"Token verification failed with status {status_code}")
            # Only clear token if it's actually invalid, not just a temporary service issue
            if status_code == 401:
                session.pop('oauth_token', None)
            return jsonify({'connected': False})
    except Exception as e:
        current_app.logger.error(f"Exception during token verification: {str(e)}")
        # Don't clear token on network/transient errors
        return jsonify({'connected': False})


@bp.route('/disconnect', methods=['GET', 'POST'])
@rate_limit()
def disconnect():
    """Disconnect from Fitbit by removing the token from session"""
    current_app.logger.info("Fitbit disconnect endpoint called")
    
    # Remove all Fitbit-related tokens from session
    session.pop('oauth_token', None)
    session.pop('oauth_state', None)
    session.pop('token_acquired_at', None)
    session.pop('token_refreshed_at', None)
    
    # Set a flag to indicate that the user has explicitly disconnected
    # This will prevent auto-reconnection in the status endpoint
    session['fitbit_explicitly_disconnected'] = True
    session.modified = True
    
    current_app.logger.info("Fitbit explicitly disconnected, all tokens removed")
    return jsonify({'success': True, 'message': 'Disconnected from Fitbit'})


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


# Bluetooth Low Energy (BLE) implementation for direct connection to Fitbit Charge 6
async def handle_heart_rate_notification(sender, data):
    """Process heart rate notifications from the Fitbit device"""
    # Heart rate data format according to BLE GATT standard
    # First byte: Flags
    # - Bit 0: Heart Rate Value Format (0: UINT8, 1: UINT16)
    # - Bit 1: Sensor Contact Status (0: Not supported or not detected, 1: Supported and detected)
    # - Bit 2: Sensor Contact Support (0: Not supported, 1: Supported)
    # - Bit 3: Energy Expended Status (0: Not present, 1: Present)
    # - Bit 4: RR-Interval (0: Not present, 1: Present)
    # Second byte: Heart Rate Value (UINT8 or UINT16 depending on bit 0 of flags)
    
    flags = data[0]
    value_format = flags & 0x01  # Get bit 0 (Heart Rate Value Format)
    
    if value_format == 0:
        # UINT8 format
        heart_rate = data[1]
    else:
        # UINT16 format (little endian)
        heart_rate = int.from_bytes(data[1:3], byteorder='little')
    
    timestamp = datetime.now().isoformat()
    
    with bluetooth_lock:
        # Store only 3600 data points (1 hour at 1 per second)
        while len(bluetooth_hr_data) >= 3600:
            oldest_timestamp = min(bluetooth_hr_data.keys())
            bluetooth_hr_data.pop(oldest_timestamp)
        
        bluetooth_hr_data[timestamp] = {
            'value': heart_rate,
            'time': datetime.now().strftime('%H:%M:%S'),
            'date': datetime.now().strftime('%Y-%m-%d')
        }
    
    current_app.logger.info(f"BLE Heart Rate: {heart_rate} BPM")


async def connect_to_fitbit_ble():
    """Connect to Fitbit Charge 6 via Bluetooth LE"""
    global bluetooth_connected, bluetooth_device
    
    # Import bleak inside the function to avoid loading it in environments where it's not available
    try:
        from bleak import BleakScanner, BleakClient
    except ImportError:
        current_app.logger.error("Bleak package not installed. Cannot use Bluetooth connectivity.")
        return False
    
    try:
        current_app.logger.info("Scanning for Fitbit Charge 6...")
        devices = await BleakScanner.discover()
        
        fitbit_device = None
        for device in devices:
            if device.name and FITBIT_DEVICE_NAME_PREFIX in device.name:
                current_app.logger.info(f"Found Fitbit device: {device.name} ({device.address})")
                fitbit_device = device
                break
        
        if not fitbit_device:
            current_app.logger.error("No Fitbit device found")
            return False
        
        current_app.logger.info(f"Connecting to {fitbit_device.name}...")
        client = BleakClient(fitbit_device.address)
        
        await client.connect()
        current_app.logger.info("Connected to Fitbit device")
        
        # Discover services and characteristics
        services = await client.get_services()
        hr_service = None
        
        for service in services:
            if service.uuid.lower().startswith(FITBIT_HR_SERVICE_UUID):
                hr_service = service
                current_app.logger.info(f"Found Heart Rate service: {service.uuid}")
                break
        
        if not hr_service:
            current_app.logger.error("Heart Rate service not found")
            await client.disconnect()
            return False
        
        # Find the Heart Rate Measurement characteristic
        hr_characteristic = None
        for char in hr_service.characteristics:
            if char.uuid.lower().startswith(FITBIT_HR_CHARACTERISTIC_UUID):
                hr_characteristic = char
                current_app.logger.info(f"Found Heart Rate characteristic: {char.uuid}")
                break
        
        if not hr_characteristic:
            current_app.logger.error("Heart Rate characteristic not found")
            await client.disconnect()
            return False
        
        # Subscribe to notifications
        await client.start_notify(hr_characteristic.uuid, handle_heart_rate_notification)
        current_app.logger.info("Subscribed to Heart Rate notifications")
        
        bluetooth_device = client
        bluetooth_connected = True
        
        # Keep the connection active
        while bluetooth_connected:
            await asyncio.sleep(1)
        
        # Cleanup when disconnection is requested
        if bluetooth_device:
            await bluetooth_device.disconnect()
            bluetooth_device = None
            current_app.logger.info("Disconnected from Fitbit device")
        
        return True
        
    except Exception as e:
        current_app.logger.error(f"Error connecting to Fitbit via BLE: {str(e)}")
        bluetooth_connected = False
        if bluetooth_device:
            try:
                await bluetooth_device.disconnect()
            except:
                pass
            bluetooth_device = None
        return False


def start_bluetooth_connection():
    """Start BLE connection in a background thread"""
    global bluetooth_thread, bluetooth_connected
    
    if bluetooth_thread and bluetooth_thread.is_alive():
        current_app.logger.info("Bluetooth connection already running")
        return jsonify({"status": "already_running"})
    
    def run_bluetooth_loop():
        """Run the asyncio event loop for Bluetooth operations"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(connect_to_fitbit_ble())
    
    bluetooth_connected = False
    bluetooth_thread = threading.Thread(target=run_bluetooth_loop, daemon=True)
    bluetooth_thread.start()
    
    return jsonify({"status": "connecting"})


def stop_bluetooth_connection():
    """Stop the BLE connection"""
    global bluetooth_connected
    
    if not bluetooth_connected:
        return jsonify({"status": "not_connected"})
    
    bluetooth_connected = False
    return jsonify({"status": "disconnecting"})


@bp.route('/bluetooth/connect', methods=['POST'])
def connect_bluetooth():
    """API endpoint to start Bluetooth connection to Fitbit"""
    return start_bluetooth_connection()


@bp.route('/bluetooth/disconnect', methods=['POST'])
def disconnect_bluetooth():
    """API endpoint to stop Bluetooth connection to Fitbit"""
    return stop_bluetooth_connection()


@bp.route('/bluetooth/status', methods=['GET'])
def bluetooth_status():
    """Get current Bluetooth connection status"""
    return jsonify({
        "connected": bluetooth_connected,
        "data_points": len(bluetooth_hr_data) if bluetooth_hr_data else 0,
        "latest_reading": list(bluetooth_hr_data.values())[-1] if bluetooth_hr_data else None
    })


@bp.route('/bluetooth/heart-rate', methods=['GET'])
def get_bluetooth_heart_rate():
    """Get heart rate data collected via Bluetooth"""
    # Get query parameters
    period = request.args.get('period', 'day')  # day, hour, minute
    
    with bluetooth_lock:
        if not bluetooth_hr_data:
            return jsonify({
                'error': 'No Bluetooth heart rate data available',
                'connected': bluetooth_connected
            }), 404
            
        # Filter data based on period
        now = datetime.now()
        filtered_data = []
        
        for timestamp, data in bluetooth_hr_data.items():
            data_time = datetime.fromisoformat(timestamp)
            
            if period == 'minute' and (now - data_time).total_seconds() <= 60:
                filtered_data.append(data)
            elif period == 'hour' and (now - data_time).total_seconds() <= 3600:
                filtered_data.append(data)
            elif period == 'day' and (now - data_time).total_seconds() <= 86400:
                filtered_data.append(data)
        
    # Process the data similar to API data
    processed_data = process_heart_rate_data({"activities-heart-intraday": {"dataset": filtered_data}}, period)
    
    # Check if data should be processed for abnormal rhythms
    if period in ['minute', 'hour']:
        abnormal_events = detect_abnormal_rhythms(processed_data)
        return jsonify({
            'data': processed_data,
            'abnormal_events': abnormal_events,
            'period': period,
            'source': 'bluetooth',
            'connected': bluetooth_connected
        })
    
    return jsonify({
        'data': processed_data,
        'period': period,
        'source': 'bluetooth',
        'connected': bluetooth_connected
    })
