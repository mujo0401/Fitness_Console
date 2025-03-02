import os
import requests
from flask import Blueprint, jsonify, request
from ..config import Config

# Create blueprint
google_places_bp = Blueprint('google_places', __name__)

# Google Places API Key - from environment variable
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY') or Config.GOOGLE_API_KEY

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
        if response.status_code \!= 200:
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
