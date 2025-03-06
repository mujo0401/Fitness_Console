from flask import Blueprint, jsonify, request, redirect, session, url_for
import os
import requests
from urllib.parse import urlencode
import json
import time
import logging
import sys
import os

# Add the parent directory to path to make absolute imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from config import Config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

youtube_music_bp = Blueprint('youtube_music', __name__, url_prefix='/api/youtube-music')

@youtube_music_bp.route('/auth', methods=['GET'])
def auth():
    """Redirect to YouTube Music OAuth authorization page"""
    logger.info("Initiating YouTube Music OAuth flow")
    
    # Check if we're using mock mode for development
    use_mock = os.environ.get('YOUTUBE_MUSIC_MOCK_ENABLED', 'True') == 'True'
    
    if use_mock:
        logger.info("Using mock YouTube Music API (development mode)")
        # Instead of redirecting to Google's OAuth page, redirect to our callback with mock=true
        mock_callback_url = f"{Config.YOUTUBE_MUSIC_REDIRECT_URI}?mock=true"
        return jsonify({'authorization_url': mock_callback_url})
    
    # Log all configuration values for debugging
    logger.info(f"YOUTUBE_MUSIC_CLIENT_ID: {Config.YOUTUBE_MUSIC_CLIENT_ID}")
    logger.info(f"YOUTUBE_MUSIC_REDIRECT_URI: {Config.YOUTUBE_MUSIC_REDIRECT_URI}")
    logger.info(f"YOUTUBE_OAUTH_AUTH_URL: {Config.YOUTUBE_OAUTH_AUTH_URL}")
    logger.info(f"YOUTUBE_MUSIC_SCOPES: {Config.YOUTUBE_MUSIC_SCOPES}")
    
    auth_params = {
        'client_id': Config.YOUTUBE_MUSIC_CLIENT_ID,
        'redirect_uri': Config.YOUTUBE_MUSIC_REDIRECT_URI,
        'response_type': 'code',
        'scope': ' '.join(Config.YOUTUBE_MUSIC_SCOPES),
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"{Config.YOUTUBE_OAUTH_AUTH_URL}?{urlencode(auth_params)}"
    logger.info(f"Redirecting to YouTube Music auth URL: {auth_url}")
    
    # For debugging, print the final URL
    logger.info(f"Full authorization URL: {auth_url}")
    
    return jsonify({'authorization_url': auth_url})

@youtube_music_bp.route('/callback', methods=['GET'])
def callback():
    """Handle the OAuth callback from YouTube Music"""
    code = request.args.get('code')
    error = request.args.get('error')
    mock = request.args.get('mock')
    
    # Check if this is a mock auth callback
    if mock == 'true':
        logger.info("Received mock YouTube Music authentication")
        # Create a mock token response
        session['youtube_music_access_token'] = 'mock_access_token'
        session['youtube_music_refresh_token'] = 'mock_refresh_token'
        session['youtube_music_token_expiry'] = time.time() + 3600  # 1 hour expiry
        session['youtube_music_connected'] = True
        
        logger.info("YouTube Music mock authentication successful")
        return redirect(f"{Config.FRONTEND_URL}/music?connected=true")
    
    if error:
        logger.error(f"OAuth error: {error}")
        return redirect(f"{Config.FRONTEND_URL}/error?message=YouTube+Music+authentication+failed")
    
    if not code:
        logger.error("No authorization code received")
        return redirect(f"{Config.FRONTEND_URL}/error?message=No+authorization+code+received")
    
    try:
        # Exchange authorization code for tokens
        token_data = {
            'code': code,
            'client_id': Config.YOUTUBE_MUSIC_CLIENT_ID,
            'client_secret': Config.YOUTUBE_MUSIC_CLIENT_SECRET,
            'redirect_uri': Config.YOUTUBE_MUSIC_REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(Config.YOUTUBE_OAUTH_TOKEN_URL, data=token_data)
        tokens = response.json()
        
        if 'error' in tokens:
            logger.error(f"Token error: {tokens['error']}")
            return redirect(f"{Config.FRONTEND_URL}/error?message=Failed+to+exchange+token:+{tokens['error']}")
        
        # Save tokens in session
        session['youtube_music_access_token'] = tokens['access_token']
        session['youtube_music_refresh_token'] = tokens.get('refresh_token')
        session['youtube_music_token_expiry'] = time.time() + tokens['expires_in']
        session['youtube_music_connected'] = True
        
        logger.info("YouTube Music authentication successful")
        return redirect(f"{Config.FRONTEND_URL}/music?connected=true")
        
    except Exception as e:
        logger.exception(f"Exception during YouTube Music token exchange: {str(e)}")
        return redirect(f"{Config.FRONTEND_URL}/error?message=YouTube+Music+connection+failed")

@youtube_music_bp.route('/status', methods=['GET'])
def status():
    """Check if user is connected to YouTube Music"""
    # Check if we're using mock mode for development
    use_mock = os.environ.get('YOUTUBE_MUSIC_MOCK_ENABLED', 'True') == 'True'
    
    # In mock mode, always return connected status
    if use_mock:
        logger.info("Mock mode: Returning connected status for YouTube Music")
        # If not already set, set up mock session data
        if not session.get('youtube_music_connected'):
            session['youtube_music_access_token'] = 'mock_access_token'
            session['youtube_music_refresh_token'] = 'mock_refresh_token'
            session['youtube_music_token_expiry'] = time.time() + 3600  # 1 hour expiry
            session['youtube_music_connected'] = True
        
        return jsonify({
            'connected': True,
            'tokenExpiresAt': session.get('youtube_music_token_expiry', time.time() + 3600),
            'mock': True
        })
    
    # Regular OAuth checking
    is_connected = session.get('youtube_music_connected', False)
    token_expiry = session.get('youtube_music_token_expiry', 0)
    
    # Check if token is expired
    if is_connected and token_expiry < time.time():
        # Token expired, try to refresh
        refresh_token = session.get('youtube_music_refresh_token')
        if refresh_token:
            try:
                refreshed = refresh_youtube_music_token(refresh_token)
                is_connected = refreshed
            except Exception as e:
                logger.exception(f"Failed to refresh token: {str(e)}")
                is_connected = False
        else:
            is_connected = False
    
    return jsonify({
        'connected': is_connected,
        'tokenExpiresAt': token_expiry if is_connected else None
    })

def refresh_youtube_music_token(refresh_token):
    """Refresh the YouTube Music access token"""
    token_data = {
        'refresh_token': refresh_token,
        'client_id': Config.YOUTUBE_MUSIC_CLIENT_ID,
        'client_secret': Config.YOUTUBE_MUSIC_CLIENT_SECRET,
        'grant_type': 'refresh_token'
    }
    
    response = requests.post(Config.YOUTUBE_OAUTH_TOKEN_URL, data=token_data)
    tokens = response.json()
    
    if 'error' in tokens:
        logger.error(f"Token refresh error: {tokens['error']}")
        return False
    
    # Update session with new token
    session['youtube_music_access_token'] = tokens['access_token']
    session['youtube_music_token_expiry'] = time.time() + tokens['expires_in']
    session['youtube_music_connected'] = True
    
    # Some token responses might include a new refresh token
    if 'refresh_token' in tokens:
        session['youtube_music_refresh_token'] = tokens['refresh_token']
    
    return True

@youtube_music_bp.route('/disconnect', methods=['GET'])
def disconnect():
    """Disconnect from YouTube Music"""
    # Remove YouTube Music tokens from session
    session.pop('youtube_music_access_token', None)
    session.pop('youtube_music_refresh_token', None)
    session.pop('youtube_music_token_expiry', None)
    session.pop('youtube_music_connected', None)
    
    return jsonify({'success': True})

@youtube_music_bp.route('/search', methods=['GET'])
def search():
    """Search for songs on YouTube Music"""
    # Check if we're using mock mode
    use_mock = os.environ.get('YOUTUBE_MUSIC_MOCK_ENABLED', 'True') == 'True'
    
    if not use_mock and not session.get('youtube_music_connected'):
        return jsonify({'error': 'Not connected to YouTube Music'}), 401
    
    # Check if token needs refresh (for non-mock mode)
    if not use_mock and session.get('youtube_music_token_expiry', 0) < time.time():
        refresh_token = session.get('youtube_music_refresh_token')
        if not refresh_token or not refresh_youtube_music_token(refresh_token):
            return jsonify({'error': 'Failed to refresh token'}), 401
    
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # For mock mode, return sample data
    if use_mock:
        logger.info(f"Mock mode: Returning sample search results for query: {query}")
        
        # Sample music search results
        mock_results = [
            {
                'id': 'dQw4w9WgXcQ',
                'title': f'Rick Astley - Never Gonna Give You Up (Official Music Video) - {query}',
                'artist': 'Rick Astley',
                'duration': 213,
                'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                'videoId': 'dQw4w9WgXcQ'
            },
            {
                'id': 'L_jWHffIx5E',
                'title': f'Smash Mouth - All Star - {query}',
                'artist': 'Smash Mouth',
                'duration': 238,
                'thumbnail': 'https://i.ytimg.com/vi/L_jWHffIx5E/hqdefault.jpg',
                'videoId': 'L_jWHffIx5E'
            },
            {
                'id': 'pXRviuL6vMY',
                'title': f'twenty one pilots: Stressed Out [OFFICIAL VIDEO] - {query}',
                'artist': 'twenty one pilots',
                'duration': 264,
                'thumbnail': 'https://i.ytimg.com/vi/pXRviuL6vMY/hqdefault.jpg',
                'videoId': 'pXRviuL6vMY'
            },
            {
                'id': 'fJ9rUzIMcZQ',
                'title': f'Queen - Bohemian Rhapsody (Official Video) - {query}',
                'artist': 'Queen Official',
                'duration': 355,
                'thumbnail': 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
                'videoId': 'fJ9rUzIMcZQ'
            },
            {
                'id': 'SDTZ7iX4vTQ',
                'title': f'Foster The People - Pumped Up Kicks (Official Video) - {query}',
                'artist': 'Foster The People',
                'duration': 255,
                'thumbnail': 'https://i.ytimg.com/vi/SDTZ7iX4vTQ/hqdefault.jpg',
                'videoId': 'SDTZ7iX4vTQ'
            }
        ]
        
        return jsonify({'results': mock_results, 'mock': True})
    
    # Real API implementation for non-mock mode
    try:
        access_token = session.get('youtube_music_access_token')
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        # YouTube Data API v3 search endpoint
        params = {
            'part': 'snippet',
            'maxResults': 20,
            'q': f"{query} music",
            'type': 'video',
            'videoCategoryId': '10',  # Music category
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/search',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        # Format the response
        if 'items' in data:
            results = []
            for item in data['items']:
                video_id = item['id']['videoId']
                title = item['snippet']['title']
                thumbnail = item['snippet']['thumbnails']['high']['url']
                channel = item['snippet']['channelTitle']
                
                # Get additional details for each video
                video_details = get_video_details(video_id, access_token)
                
                results.append({
                    'id': video_id,
                    'title': title,
                    'artist': channel,
                    'duration': video_details.get('duration', 0),
                    'thumbnail': thumbnail,
                    'videoId': video_id
                })
            
            return jsonify({'results': results})
        else:
            return jsonify({'error': 'No results found', 'data': data}), 404
            
    except Exception as e:
        logger.exception(f"Error searching YouTube Music: {str(e)}")
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

def get_video_details(video_id, access_token):
    """Get additional details for a YouTube video"""
    try:
        params = {
            'part': 'contentDetails,statistics',
            'id': video_id,
            'key': Config.YOUTUBE_API_KEY
        }
        
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/videos',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        if 'items' in data and data['items']:
            duration_iso = data['items'][0]['contentDetails']['duration']
            # Parse ISO 8601 duration format
            duration_seconds = parse_iso_duration(duration_iso)
            
            return {
                'duration': duration_seconds,
                'views': data['items'][0]['statistics'].get('viewCount', 0)
            }
            
        return {'duration': 0, 'views': 0}
        
    except Exception as e:
        logger.exception(f"Error getting video details: {str(e)}")
        return {'duration': 0, 'views': 0}

def parse_iso_duration(duration_iso):
    """Parse ISO 8601 duration format to seconds"""
    # Simple parsing for PT#M#S format
    try:
        duration = 0
        
        # Remove PT prefix
        time_str = duration_iso[2:]
        
        # Handle hours
        if 'H' in time_str:
            h_pos = time_str.find('H')
            hours = int(time_str[:h_pos])
            duration += hours * 3600
            time_str = time_str[h_pos+1:]
        
        # Handle minutes
        if 'M' in time_str:
            m_pos = time_str.find('M')
            minutes = int(time_str[:m_pos])
            duration += minutes * 60
            time_str = time_str[m_pos+1:]
        
        # Handle seconds
        if 'S' in time_str:
            s_pos = time_str.find('S')
            seconds = int(time_str[:s_pos])
            duration += seconds
        
        return duration
    except:
        return 0

@youtube_music_bp.route('/playlists', methods=['GET'])
def get_playlists():
    """Get user's YouTube Music playlists"""
    # Check if we're using mock mode
    use_mock = os.environ.get('YOUTUBE_MUSIC_MOCK_ENABLED', 'True') == 'True'
    
    if not use_mock and not session.get('youtube_music_connected'):
        return jsonify({'error': 'Not connected to YouTube Music'}), 401
    
    # Check if token needs refresh (for non-mock mode)
    if not use_mock and session.get('youtube_music_token_expiry', 0) < time.time():
        refresh_token = session.get('youtube_music_refresh_token')
        if not refresh_token or not refresh_youtube_music_token(refresh_token):
            return jsonify({'error': 'Failed to refresh token'}), 401
    
    # For mock mode, return sample data
    if use_mock:
        logger.info("Mock mode: Returning sample playlists")
        
        # Sample playlists
        mock_playlists = [
            {
                'id': 'PL_mock1',
                'title': 'Workout Favorites',
                'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
                'trackCount': 42
            },
            {
                'id': 'PL_mock2',
                'title': 'Chill Vibes',
                'thumbnail': 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg',
                'trackCount': 23
            },
            {
                'id': 'PL_mock3',
                'title': 'Cardio Mix',
                'thumbnail': 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
                'trackCount': 18
            },
            {
                'id': 'PL_mock4',
                'title': 'Running Playlist',
                'thumbnail': 'https://i.ytimg.com/vi/pXRviuL6vMY/mqdefault.jpg',
                'trackCount': 27
            },
            {
                'id': 'PL_mock5',
                'title': 'Focus & Concentration',
                'thumbnail': 'https://i.ytimg.com/vi/SDTZ7iX4vTQ/mqdefault.jpg',
                'trackCount': 30
            }
        ]
        
        return jsonify({'playlists': mock_playlists, 'mock': True})
    
    # Real API implementation for non-mock mode
    try:
        access_token = session.get('youtube_music_access_token')
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        # Get user's playlists
        params = {
            'part': 'snippet,contentDetails',
            'mine': 'true',
            'maxResults': 50,
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/playlists',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        # Format the response
        if 'items' in data:
            playlists = []
            for item in data['items']:
                playlist_id = item['id']
                title = item['snippet']['title']
                thumbnail = item['snippet'].get('thumbnails', {}).get('medium', {}).get('url', '')
                item_count = item['contentDetails']['itemCount']
                
                playlists.append({
                    'id': playlist_id,
                    'title': title,
                    'thumbnail': thumbnail,
                    'trackCount': item_count
                })
            
            return jsonify({'playlists': playlists})
        else:
            return jsonify({'error': 'Failed to retrieve playlists', 'data': data}), 404
            
    except Exception as e:
        logger.exception(f"Error getting playlists: {str(e)}")
        return jsonify({'error': f'Failed to get playlists: {str(e)}'}), 500

@youtube_music_bp.route('/playlists/<playlist_id>/tracks', methods=['GET'])
def get_playlist_tracks(playlist_id):
    """Get tracks in a YouTube Music playlist"""
    # Check if we're using mock mode
    use_mock = os.environ.get('YOUTUBE_MUSIC_MOCK_ENABLED', 'True') == 'True'
    
    if not use_mock and not session.get('youtube_music_connected'):
        return jsonify({'error': 'Not connected to YouTube Music'}), 401
    
    # Check if token needs refresh (for non-mock mode)
    if not use_mock and session.get('youtube_music_token_expiry', 0) < time.time():
        refresh_token = session.get('youtube_music_refresh_token')
        if not refresh_token or not refresh_youtube_music_token(refresh_token):
            return jsonify({'error': 'Failed to refresh token'}), 401
    
    # For mock mode, return sample data based on playlist ID
    if use_mock:
        logger.info(f"Mock mode: Returning sample tracks for playlist: {playlist_id}")
        
        # Sample playlist tracks - different tracks depending on the playlist_id
        mock_tracks = []
        
        if playlist_id == 'PL_mock1':  # Workout Favorites
            mock_tracks = [
                {
                    'id': 'dQw4w9WgXcQ',
                    'title': 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
                    'artist': 'Rick Astley',
                    'duration': 213,
                    'thumbnail': 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                    'videoId': 'dQw4w9WgXcQ'
                },
                {
                    'id': 'btPJPFnesV4',
                    'title': 'Survivor - Eye Of The Tiger (Official Music Video)',
                    'artist': 'Survivor Official',
                    'duration': 246,
                    'thumbnail': 'https://i.ytimg.com/vi/btPJPFnesV4/hqdefault.jpg',
                    'videoId': 'btPJPFnesV4'
                },
                {
                    'id': 'VZ2xc_d8uUw',
                    'title': 'Eminem - Till I Collapse [HD]',
                    'artist': 'EmTrillEmz',
                    'duration': 298,
                    'thumbnail': 'https://i.ytimg.com/vi/VZ2xc_d8uUw/hqdefault.jpg',
                    'videoId': 'VZ2xc_d8uUw'
                }
            ]
        elif playlist_id == 'PL_mock2':  # Chill Vibes
            mock_tracks = [
                {
                    'id': 'XXYlFuWEuKI',
                    'title': 'The Weeknd - Save Your Tears (Official Music Video)',
                    'artist': 'The Weeknd',
                    'duration': 215,
                    'thumbnail': 'https://i.ytimg.com/vi/XXYlFuWEuKI/hqdefault.jpg',
                    'videoId': 'XXYlFuWEuKI'
                },
                {
                    'id': 'U3ASj1L6_sY',
                    'title': 'Billie Eilish - everything i wanted',
                    'artist': 'Billie Eilish',
                    'duration': 243,
                    'thumbnail': 'https://i.ytimg.com/vi/U3ASj1L6_sY/hqdefault.jpg',
                    'videoId': 'U3ASj1L6_sY'
                }
            ]
        else:  # Default tracks for other playlists
            mock_tracks = [
                {
                    'id': 'fJ9rUzIMcZQ',
                    'title': 'Queen - Bohemian Rhapsody (Official Video)',
                    'artist': 'Queen Official',
                    'duration': 355,
                    'thumbnail': 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
                    'videoId': 'fJ9rUzIMcZQ'
                },
                {
                    'id': 'SDTZ7iX4vTQ',
                    'title': 'Foster The People - Pumped Up Kicks (Official Video)',
                    'artist': 'Foster The People',
                    'duration': 255,
                    'thumbnail': 'https://i.ytimg.com/vi/SDTZ7iX4vTQ/hqdefault.jpg',
                    'videoId': 'SDTZ7iX4vTQ'
                }
            ]
        
        return jsonify({'tracks': mock_tracks, 'mock': True, 'playlist_id': playlist_id})
    
    # Real API implementation for non-mock mode
    try:
        access_token = session.get('youtube_music_access_token')
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        # Get playlist items
        params = {
            'part': 'snippet',
            'maxResults': 50,
            'playlistId': playlist_id,
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/playlistItems',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        # Format the response
        if 'items' in data:
            tracks = []
            for item in data['items']:
                video_id = item['snippet']['resourceId']['videoId']
                title = item['snippet']['title']
                thumbnail = item['snippet'].get('thumbnails', {}).get('high', {}).get('url', '')
                channel = item['snippet'].get('videoOwnerChannelTitle', '')
                
                # Get video details
                video_details = get_video_details(video_id, access_token)
                
                tracks.append({
                    'id': video_id,
                    'title': title,
                    'artist': channel,
                    'duration': video_details.get('duration', 0),
                    'thumbnail': thumbnail,
                    'videoId': video_id
                })
            
            return jsonify({'tracks': tracks})
        else:
            return jsonify({'error': 'Failed to retrieve playlist tracks', 'data': data}), 404
            
    except Exception as e:
        logger.exception(f"Error getting playlist tracks: {str(e)}")
        return jsonify({'error': f'Failed to get playlist tracks: {str(e)}'}), 500

@youtube_music_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get music recommendations based on user's listening history"""
    if not session.get('youtube_music_connected'):
        return jsonify({'error': 'Not connected to YouTube Music'}), 401
    
    # Check if token needs refresh
    if session.get('youtube_music_token_expiry', 0) < time.time():
        refresh_token = session.get('youtube_music_refresh_token')
        if not refresh_token or not refresh_youtube_music_token(refresh_token):
            return jsonify({'error': 'Failed to refresh token'}), 401
    
    try:
        access_token = session.get('youtube_music_access_token')
        
        # Get user's watch history playlist
        # This is a simplified approach - real recommendations would use
        # more sophisticated algorithms and YouTube's recommendation API
        user_likes = get_liked_videos(access_token)
        
        if user_likes:
            # Use a sample of liked videos to get recommendations
            sample_video_ids = [video['id'] for video in user_likes[:5]]
            recommendations = []
            
            # Get related videos for each sample video
            for video_id in sample_video_ids:
                related = get_related_videos(video_id, access_token)
                recommendations.extend(related)
            
            # Remove duplicates
            unique_recommendations = []
            seen_ids = set()
            for video in recommendations:
                if video['id'] not in seen_ids:
                    seen_ids.add(video['id'])
                    unique_recommendations.append(video)
            
            return jsonify({'recommendations': unique_recommendations[:20]})
        else:
            # Fallback to popular music videos
            return get_popular_music_videos(access_token)
            
    except Exception as e:
        logger.exception(f"Error getting recommendations: {str(e)}")
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

def get_liked_videos(access_token):
    """Get user's liked videos"""
    try:
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        # Get videos from Liked videos playlist (auto-generated by YouTube)
        params = {
            'part': 'snippet',
            'myRating': 'like',
            'maxResults': 50,
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/videos',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        if 'items' in data:
            videos = []
            for item in data['items']:
                video_id = item['id']
                title = item['snippet']['title']
                thumbnail = item['snippet'].get('thumbnails', {}).get('high', {}).get('url', '')
                channel = item['snippet']['channelTitle']
                
                # Get video details
                video_details = get_video_details(video_id, access_token)
                
                videos.append({
                    'id': video_id,
                    'title': title,
                    'artist': channel,
                    'duration': video_details.get('duration', 0),
                    'thumbnail': thumbnail,
                    'videoId': video_id
                })
            
            return videos
        else:
            return []
            
    except Exception as e:
        logger.exception(f"Error getting liked videos: {str(e)}")
        return []

def get_related_videos(video_id, access_token):
    """Get related videos for a specific video"""
    try:
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        params = {
            'part': 'snippet',
            'relatedToVideoId': video_id,
            'type': 'video',
            'videoCategoryId': '10',  # Music category
            'maxResults': 10,
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/search',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        if 'items' in data:
            videos = []
            for item in data['items']:
                related_id = item['id']['videoId']
                title = item['snippet']['title']
                thumbnail = item['snippet'].get('thumbnails', {}).get('high', {}).get('url', '')
                channel = item['snippet']['channelTitle']
                
                # Get video details
                video_details = get_video_details(related_id, access_token)
                
                videos.append({
                    'id': related_id,
                    'title': title,
                    'artist': channel,
                    'duration': video_details.get('duration', 0),
                    'thumbnail': thumbnail,
                    'videoId': related_id
                })
            
            return videos
        else:
            return []
            
    except Exception as e:
        logger.exception(f"Error getting related videos: {str(e)}")
        return []

def get_popular_music_videos(access_token):
    """Get popular music videos as a fallback"""
    try:
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        params = {
            'part': 'snippet',
            'chart': 'mostPopular',
            'videoCategoryId': '10',  # Music category
            'maxResults': 20,
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/videos',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        if 'items' in data:
            videos = []
            for item in data['items']:
                video_id = item['id']
                title = item['snippet']['title']
                thumbnail = item['snippet'].get('thumbnails', {}).get('high', {}).get('url', '')
                channel = item['snippet']['channelTitle']
                
                # Get video details
                video_details = get_video_details(video_id, access_token)
                
                videos.append({
                    'id': video_id,
                    'title': title,
                    'artist': channel,
                    'duration': video_details.get('duration', 0),
                    'thumbnail': thumbnail,
                    'videoId': video_id
                })
            
            return jsonify({'popular': videos})
        else:
            return jsonify({'error': 'Failed to get popular music videos'}), 404
            
    except Exception as e:
        logger.exception(f"Error getting popular music videos: {str(e)}")
        return jsonify({'error': f'Failed to get popular music videos: {str(e)}'}), 500

@youtube_music_bp.route('/workout-playlists', methods=['GET'])
def get_workout_playlists():
    """Get YouTube Music workout playlists"""
    if not session.get('youtube_music_connected'):
        return jsonify({'error': 'Not connected to YouTube Music'}), 401
    
    # Check if token needs refresh
    if session.get('youtube_music_token_expiry', 0) < time.time():
        refresh_token = session.get('youtube_music_refresh_token')
        if not refresh_token or not refresh_youtube_music_token(refresh_token):
            return jsonify({'error': 'Failed to refresh token'}), 401
    
    try:
        access_token = session.get('youtube_music_access_token')
        headers = {
            'Authorization': f"Bearer {access_token}",
            'Content-Type': 'application/json'
        }
        
        # Search for workout playlists
        params = {
            'part': 'snippet',
            'maxResults': 20,
            'q': 'workout motivation playlist',
            'type': 'playlist',
            'key': Config.YOUTUBE_API_KEY
        }
        
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/search',
            params=params,
            headers=headers
        )
        
        data = response.json()
        
        if 'items' in data:
            playlists = []
            for item in data['items']:
                playlist_id = item['id']['playlistId']
                title = item['snippet']['title']
                thumbnail = item['snippet'].get('thumbnails', {}).get('high', {}).get('url', '')
                channel = item['snippet']['channelTitle']
                
                playlists.append({
                    'id': playlist_id,
                    'title': title,
                    'creator': channel,
                    'thumbnail': thumbnail
                })
            
            return jsonify({'playlists': playlists})
        else:
            return jsonify({'error': 'Failed to find workout playlists', 'data': data}), 404
            
    except Exception as e:
        logger.exception(f"Error getting workout playlists: {str(e)}")
        return jsonify({'error': f'Failed to get workout playlists: {str(e)}'}), 500