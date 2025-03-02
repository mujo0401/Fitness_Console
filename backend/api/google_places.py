import os
import requests
import sys
import json
from flask import Blueprint, jsonify, request

# Add the parent directory to sys.path to allow absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

# Create blueprint
google_places_bp = Blueprint('google_places', __name__)

# API configuration from Config class
GOOGLE_API_KEY = Config.GOOGLE_API_KEY
INSTACART_API_KEY = Config.INSTACART_API_KEY
INSTACART_API_BASE_URL = Config.INSTACART_API_BASE_URL
INSTACART_MOCK_API_ENABLED = Config.INSTACART_MOCK_API_ENABLED

@google_places_bp.route('/nearby', methods=['GET'])
def nearby_places():
    """
    Proxy endpoint for Google Places API - Nearby Search
    This protects our API key by not exposing it in frontend code
    """
    try:
        # Get parameters from request
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        place_type = request.args.get('type', 'grocery_or_supermarket')
        radius = request.args.get('radius', '5000')
        
        # Validate required parameters
        if not all([lat, lng]):
            return jsonify({
                'error': 'Missing required parameters: lat and lng are required'
            }), 400
            
        # Construct Google Places API URL
        base_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
        url = f'{base_url}?location={lat},{lng}&radius={radius}&type={place_type}&key={GOOGLE_API_KEY}'
        
        # Make request to Google Places API
        response = requests.get(url)
        
        # Check if request was successful
        if response.status_code != 200:
            return jsonify({
                'error': f'Google Places API returned status code: {response.status_code}',
                'message': response.text
            }), response.status_code
            
        # Return Google Places API response
        return jsonify(response.json())
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@google_places_bp.route('/details', methods=['GET'])
def place_details():
    """
    Proxy endpoint for Google Places API - Place Details
    Used to get additional details about a specific place
    """
    try:
        # Get place_id from request
        place_id = request.args.get('place_id')
        
        # Validate required parameters
        if not place_id:
            return jsonify({
                'error': 'Missing required parameter: place_id'
            }), 400
            
        # Construct Google Places API URL
        base_url = 'https://maps.googleapis.com/maps/api/place/details/json'
        url = f'{base_url}?place_id={place_id}&fields=name,rating,formatted_address,formatted_phone_number,opening_hours,website,price_level,photos&key={GOOGLE_API_KEY}'
        
        # Make request to Google Places API
        response = requests.get(url)
        
        # Check if request was successful
        if response.status_code != 200:
            return jsonify({
                'error': f'Google Places API returned status code: {response.status_code}',
                'message': response.text
            }), response.status_code
            
        # Return Google Places API response
        return jsonify(response.json())
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
@google_places_bp.route('/photo', methods=['GET'])
def place_photo():
    """
    Proxy endpoint for Google Places API - Photo
    Used to get photos for places without exposing the API key
    """
    try:
        # Get photo reference from request
        photo_reference = request.args.get('photoreference')
        max_width = request.args.get('maxwidth', '400')
        max_height = request.args.get('maxheight', '')
        
        # Validate required parameters
        if not photo_reference:
            return jsonify({
                'error': 'Missing required parameter: photoreference'
            }), 400
            
        # Construct Google Places API URL
        base_url = 'https://maps.googleapis.com/maps/api/place/photo'
        url = f'{base_url}?photoreference={photo_reference}&key={GOOGLE_API_KEY}&maxwidth={max_width}'
        
        if max_height:
            url += f'&maxheight={max_height}'
            
        # Make request to Google Places API - this returns the actual image, not JSON
        response = requests.get(url, stream=True)
        
        # Check if request was successful
        if response.status_code != 200:
            return jsonify({
                'error': f'Google Places API returned status code: {response.status_code}',
                'message': response.text
            }), response.status_code
            
        # Return the photo with appropriate headers
        headers = {
            'Content-Type': response.headers.get('Content-Type', 'image/jpeg')
        }
        
        return response.content, 200, headers
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

# Instacart integration endpoints
@google_places_bp.route('/instacart/check-availability', methods=['GET'])
def check_instacart_availability():
    """
    Check if Instacart delivery is available for a given store and location
    """
    try:
        # Get parameters from request
        store_id = request.args.get('store_id')
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        
        # Validate required parameters
        if not all([store_id, lat, lng]):
            return jsonify({
                'error': 'Missing required parameters: store_id, lat, and lng are required'
            }), 400
        
        # Check if using mock API or real API
        if INSTACART_MOCK_API_ENABLED:
            # For demo purposes, we'll return mock data
            response_data = {
                'available': True,
                'delivery_estimate': {
                    'min_minutes': 30,
                    'max_minutes': 60,
                    'earliest_delivery_time': '2023-07-15T14:30:00Z',
                    'latest_delivery_time': '2023-07-15T20:00:00Z'
                },
                'service_fee': 3.99,
                'delivery_fee': 5.99,
                'minimum_order': 10.00,
                'store': {
                    'id': store_id,
                    'instacart_id': f'ic_{store_id}',
                    'name': request.args.get('store_name', 'Unknown Store'),
                    'delivery_available': True,
                    'pickup_available': True
                }
            }
        else:
            # In real implementation, make API call to Instacart
            if not INSTACART_API_KEY:
                return jsonify({
                    'error': 'Instacart API key is not configured. Check your .env file or environment variables.'
                }), 500
                
            # Construct Instacart API URL
            url = f"{INSTACART_API_BASE_URL}/v1/availability/check"
            
            # Headers for Instacart API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {INSTACART_API_KEY}'
            }
            
            # Payload for Instacart API
            payload = {
                'store_id': store_id,
                'location': {
                    'latitude': lat,
                    'longitude': lng
                }
            }
            
            # Make request to Instacart API
            response = requests.post(url, headers=headers, json=payload)
            
            # Check if request was successful
            if response.status_code != 200:
                return jsonify({
                    'error': f'Instacart API returned status code: {response.status_code}',
                    'message': response.text
                }), response.status_code
                
            # Return Instacart API response
            response_data = response.json()
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@google_places_bp.route('/instacart/submit-order', methods=['POST'])
def submit_instacart_order():
    """
    Submit an order to Instacart
    """
    try:
        # Get the order data from the request body
        order_data = request.json
        
        # Validate required data
        if not order_data:
            return jsonify({
                'error': 'No order data provided'
            }), 400
            
        required_fields = ['store_id', 'delivery_address', 'items']
        for field in required_fields:
            if field not in order_data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate totals for order
        subtotal = sum(item.get('price', 0) * item.get('quantity', 1) for item in order_data.get('items', []))
        tax = round(subtotal * 0.0825, 2)
        total = round(subtotal + tax + 9.98, 2)  # Adding delivery fee + service fee
                
        # Check if using mock API or real API
        if INSTACART_MOCK_API_ENABLED:
            # Get current timestamp for order ID
            import time
            timestamp = int(time.time())
            
            # For demo purposes, we'll return a mock response
            response_data = {
                'success': True,
                'order_id': f'order_{timestamp}',
                'estimated_delivery': {
                    'min_minutes': 30,
                    'max_minutes': 60,
                    'estimated_delivery_time': '2023-07-15T15:30:00Z'
                },
                'total': {
                    'subtotal': subtotal,
                    'delivery_fee': 5.99,
                    'service_fee': 3.99,
                    'tax': tax,
                    'total': total
                },
                'tracking_url': 'https://www.instacart.com/orders/tracking?id=mock_tracking_id',
                'status': 'processing'
            }
        else:
            # In real implementation, make API call to Instacart
            if not INSTACART_API_KEY:
                return jsonify({
                    'error': 'Instacart API key is not configured. Check your .env file or environment variables.'
                }), 500
                
            # Construct Instacart API URL
            url = f"{INSTACART_API_BASE_URL}/v1/orders"
            
            # Headers for Instacart API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {INSTACART_API_KEY}'
            }
            
            # Format the order data for Instacart API
            instacart_payload = {
                'store_id': order_data['store_id'],
                'delivery_address': order_data['delivery_address'],
                'items': [
                    {
                        'id': item.get('id'),
                        'name': item.get('name'),
                        'quantity': item.get('quantity', 1),
                        'unit': item.get('unit', 'each'),
                        'price': item.get('price', 0)
                    } 
                    for item in order_data.get('items', [])
                ],
                'delivery_instructions': order_data.get('delivery_instructions', ''),
                'contact_info': order_data.get('contact_info', {
                    'name': 'Customer',
                    'phone': '555-555-5555',
                    'email': 'customer@example.com'
                })
            }
            
            # Make request to Instacart API
            response = requests.post(url, headers=headers, json=instacart_payload)
            
            # Check if request was successful
            if response.status_code != 200 and response.status_code != 201:
                return jsonify({
                    'error': f'Instacart API returned status code: {response.status_code}',
                    'message': response.text
                }), response.status_code
                
            # Return Instacart API response
            response_data = response.json()
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@google_places_bp.route('/instacart/stores', methods=['GET'])
def get_instacart_stores():
    """
    Get a list of stores available through Instacart in a given area
    """
    try:
        # Get parameters from request
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        
        # Validate required parameters
        if not all([lat, lng]):
            return jsonify({
                'error': 'Missing required parameters: lat and lng are required'
            }), 400
        
        # These are the mock stores that would be available through Instacart
        mock_stores = [
            {
                'id': 'instacart_101',
                'name': 'Whole Foods Market',
                'logo_url': 'https://www.instacart.com/assets/retailers/whole_foods.png',
                'delivery_fee': 3.99,
                'min_order': 10.00,
                'delivery_time': '35-50 min',
                'rating': 4.8,
                'distance': 2.3
            },
            {
                'id': 'instacart_102',
                'name': 'Kroger',
                'logo_url': 'https://www.instacart.com/assets/retailers/kroger.png',
                'delivery_fee': 3.99,
                'min_order': 10.00,
                'delivery_time': '30-45 min',
                'rating': 4.6,
                'distance': 1.8
            },
            {
                'id': 'instacart_103',
                'name': 'Costco',
                'logo_url': 'https://www.instacart.com/assets/retailers/costco.png',
                'delivery_fee': 5.99,
                'min_order': 35.00,
                'delivery_time': '45-60 min',
                'rating': 4.7,
                'distance': 3.5
            },
            {
                'id': 'instacart_104',
                'name': 'Target',
                'logo_url': 'https://www.instacart.com/assets/retailers/target.png',
                'delivery_fee': 3.99,
                'min_order': 10.00,
                'delivery_time': '30-45 min',
                'rating': 4.5,
                'distance': 2.1
            },
            {
                'id': 'instacart_105',
                'name': 'Albertsons',
                'logo_url': 'https://www.instacart.com/assets/retailers/albertsons.png',
                'delivery_fee': 3.99,
                'min_order': 10.00,
                'delivery_time': '35-50 min',
                'rating': 4.4,
                'distance': 2.7
            },
            {
                'id': 'instacart_106',
                'name': 'Sprouts Farmers Market',
                'logo_url': 'https://www.instacart.com/assets/retailers/sprouts.png',
                'delivery_fee': 3.99,
                'min_order': 10.00,
                'delivery_time': '40-55 min',
                'rating': 4.7,
                'distance': 3.2
            }
        ]
        
        # Check if using mock API or real API
        if INSTACART_MOCK_API_ENABLED:
            # For demo purposes, we'll return the mock stores
            # Sort by distance
            mock_stores.sort(key=lambda x: x['distance'])
            
            stores = mock_stores
        else:
            # In real implementation, make API call to Instacart
            if not INSTACART_API_KEY:
                return jsonify({
                    'error': 'Instacart API key is not configured. Check your .env file or environment variables.'
                }), 500
                
            # Construct Instacart API URL
            url = f"{INSTACART_API_BASE_URL}/v1/stores/nearby"
            
            # Headers for Instacart API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {INSTACART_API_KEY}'
            }
            
            # Query parameters for Instacart API
            params = {
                'latitude': lat,
                'longitude': lng,
                'radius': 10,  # 10 mile radius
                'limit': 20    # Up to 20 stores
            }
            
            # Make request to Instacart API
            response = requests.get(url, headers=headers, params=params)
            
            # Check if request was successful
            if response.status_code != 200:
                return jsonify({
                    'error': f'Instacart API returned status code: {response.status_code}',
                    'message': response.text
                }), response.status_code
                
            # Return Instacart API response
            stores = response.json().get('stores', [])
        
        return jsonify({
            'stores': stores
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@google_places_bp.route('/instacart/products', methods=['GET'])
def search_instacart_products():
    """
    Search for products available through Instacart
    """
    try:
        # Get parameters from request
        store_id = request.args.get('store_id')
        query = request.args.get('query', '')
        
        # Validate required parameters
        if not store_id:
            return jsonify({
                'error': 'Missing required parameter: store_id'
            }), 400
        
        # Need to import time here for the mock product IDs
        import time
            
        # Generate some mock products based on the query
        mock_products = []
        
        if query:
            # Simulate finding products related to the query
            for i in range(1, 6):
                mock_products.append({
                    'id': f'product_{int(time.time())}_{i}',
                    'name': f'{query.title()} {["Organic", "Fresh", "Premium", "Natural", "Conventional"][i-1]}',
                    'price': round(3.99 + (i-1) * 1.5, 2),
                    'unit': 'each',
                    'image_url': f'https://via.placeholder.com/150?text={query.replace(" ", "+")}',
                    'description': f'Fresh {query} from local farmers',
                    'available': True,
                    'category': 'Produce',
                    'rating': round(4 + (0.2 * (i % 3)), 1),
                    'reviews_count': 10 + (i * 5)
                })
        else:
            # Return some default popular products
            popular_items = ['Bananas', 'Milk', 'Eggs', 'Bread', 'Apples', 'Chicken Breast', 'Avocado', 'Spinach']
            for i, item in enumerate(popular_items):
                mock_products.append({
                    'id': f'product_{int(time.time())}_{i}',
                    'name': item,
                    'price': round(2.99 + (i % 5) * 1.5, 2),
                    'unit': 'each',
                    'image_url': f'https://via.placeholder.com/150?text={item.replace(" ", "+")}',
                    'description': f'Fresh {item} from quality suppliers',
                    'available': True,
                    'category': 'Popular Items',
                    'rating': round(4 + (0.2 * (i % 3)), 1),
                    'reviews_count': 15 + (i * 8)
                })
        
        # Check if using mock API or real API
        if INSTACART_MOCK_API_ENABLED:
            # For demo purposes, we'll return mock products
            products = mock_products
        else:
            # In real implementation, make API call to Instacart
            if not INSTACART_API_KEY:
                return jsonify({
                    'error': 'Instacart API key is not configured. Check your .env file or environment variables.'
                }), 500
                
            # Construct Instacart API URL
            url = f"{INSTACART_API_BASE_URL}/v1/stores/{store_id}/products/search"
            
            # Headers for Instacart API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {INSTACART_API_KEY}'
            }
            
            # Query parameters for Instacart API
            params = {
                'q': query,
                'limit': 20    # Up to 20 products
            }
            
            # Make request to Instacart API
            response = requests.get(url, headers=headers, params=params)
            
            # Check if request was successful
            if response.status_code != 200:
                return jsonify({
                    'error': f'Instacart API returned status code: {response.status_code}',
                    'message': response.text
                }), response.status_code
                
            # Return Instacart API response
            products = response.json().get('products', [])
        
        return jsonify({
            'products': products,
            'store_id': store_id
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
