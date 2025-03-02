from flask import Blueprint, jsonify, request, current_app
import requests
import json
import os
from functools import wraps
import time

# Create a Blueprint for Spoonacular API routes
spoonacular_bp = Blueprint('spoonacular', __name__)

# In-memory cache for API responses
# Format: { 'endpoint_params_hash': {'data': response_data, 'timestamp': time_added} }
api_cache = {}

def cache_response(timeout=3600):
    """
    Decorator to cache API responses
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate a cache key based on the request endpoint and params
            endpoint = request.endpoint
            params = dict(request.args)
            cache_key = f"{endpoint}_{json.dumps(params, sort_keys=True)}"
            
            # Check if cache is enabled
            if current_app.config.get('SPOONACULAR_CACHE_ENABLED', True):
                # Check if response is in cache and not expired
                if cache_key in api_cache:
                    cache_entry = api_cache[cache_key]
                    current_time = time.time()
                    
                    # If the cache entry is still valid
                    if current_time - cache_entry['timestamp'] < timeout:
                        return jsonify(cache_entry['data'])
            
            # If not in cache or cache disabled, call the original function
            response = f(*args, **kwargs)
            
            # Cache the response if caching is enabled
            if current_app.config.get('SPOONACULAR_CACHE_ENABLED', True):
                try:
                    response_data = response.get_json()
                    api_cache[cache_key] = {
                        'data': response_data,
                        'timestamp': time.time()
                    }
                except Exception as e:
                    current_app.logger.error(f"Error caching response: {e}")
            
            return response
        return decorated_function
    return decorator

@spoonacular_bp.route('/search/products', methods=['GET'])
@cache_response(timeout=current_app.config.get('SPOONACULAR_CACHE_TIMEOUT', 3600))
def search_grocery_products():
    """
    Search for grocery products using Spoonacular API
    """
    # Get API key from config
    api_key = current_app.config.get('SPOONACULAR_API_KEY')
    
    if not api_key:
        return jsonify({'error': 'Spoonacular API key not configured'}), 500
    
    # Get query parameters from request
    query = request.args.get('query', '')
    diet = request.args.get('diet', '')
    intolerances = request.args.get('intolerances', '')
    sort = request.args.get('sort', '')
    sort_direction = request.args.get('sortDirection', '')
    offset = request.args.get('offset', '0')
    number = request.args.get('number', '10')
    
    # Build the API request URL
    base_url = f"{current_app.config.get('SPOONACULAR_API_BASE_URL', 'https://api.spoonacular.com')}/food/products/search"
    
    # Prepare parameters
    params = {
        'apiKey': api_key,
        'query': query,
        'number': number,
        'offset': offset
    }
    
    # Add optional parameters if provided
    if diet:
        params['diet'] = diet
    if intolerances:
        params['intolerances'] = intolerances
    if sort:
        params['sort'] = sort
    if sort_direction:
        params['sortDirection'] = sort_direction
    
    try:
        # Make the API request
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Return the API response
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Spoonacular API request error: {e}")
        return jsonify({'error': f'Error contacting Spoonacular API: {str(e)}'}), 500

@spoonacular_bp.route('/products/<int:product_id>', methods=['GET'])
@cache_response(timeout=current_app.config.get('SPOONACULAR_CACHE_TIMEOUT', 3600))
def get_product_information(product_id):
    """
    Get detailed information about a specific product
    """
    # Get API key from config
    api_key = current_app.config.get('SPOONACULAR_API_KEY')
    
    if not api_key:
        return jsonify({'error': 'Spoonacular API key not configured'}), 500
    
    # Build the API request URL
    base_url = f"{current_app.config.get('SPOONACULAR_API_BASE_URL', 'https://api.spoonacular.com')}/food/products/{product_id}"
    
    # Prepare parameters
    params = {
        'apiKey': api_key
    }
    
    try:
        # Make the API request
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Return the API response
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Spoonacular API request error: {e}")
        return jsonify({'error': f'Error contacting Spoonacular API: {str(e)}'}), 500

@spoonacular_bp.route('/search/recipes', methods=['GET'])
@cache_response(timeout=current_app.config.get('SPOONACULAR_CACHE_TIMEOUT', 3600))
def search_recipes():
    """
    Search for recipes using Spoonacular API
    """
    # Get API key from config
    api_key = current_app.config.get('SPOONACULAR_API_KEY')
    
    if not api_key:
        return jsonify({'error': 'Spoonacular API key not configured'}), 500
    
    # Get query parameters from request
    query = request.args.get('query', '')
    cuisine = request.args.get('cuisine', '')
    diet = request.args.get('diet', '')
    intolerances = request.args.get('intolerances', '')
    type = request.args.get('type', '')
    include_nutrition = request.args.get('includeNutrition', 'false')
    offset = request.args.get('offset', '0')
    number = request.args.get('number', '10')
    
    # Build the API request URL
    base_url = f"{current_app.config.get('SPOONACULAR_API_BASE_URL', 'https://api.spoonacular.com')}/recipes/complexSearch"
    
    # Prepare parameters
    params = {
        'apiKey': api_key,
        'query': query,
        'number': number,
        'offset': offset,
        'addRecipeInformation': 'true',
        'fillIngredients': 'true',
        'addRecipeNutrition': include_nutrition
    }
    
    # Add optional parameters if provided
    if cuisine:
        params['cuisine'] = cuisine
    if diet:
        params['diet'] = diet
    if intolerances:
        params['intolerances'] = intolerances
    if type:
        params['type'] = type
    
    try:
        # Make the API request
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Return the API response
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Spoonacular API request error: {e}")
        return jsonify({'error': f'Error contacting Spoonacular API: {str(e)}'}), 500
