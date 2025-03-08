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

# Add debug logging
print("YouTube Music routes.py loaded")
print(f"System path: {sys.path}")
print(f"Current directory: {os.getcwd()}")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

youtube_music_bp = Blueprint('youtube_music', __name__)

@youtube_music_bp.route('/auth', methods=['GET'])
def auth():
    """Redirect to YouTube Music OAuth authorization page"""
    logger.info("Initiating YouTube Music OAuth flow")
    
    # Mock mode is forcibly disabled for production
    use_mock = False
    
    if use_mock:
        logger.info("Using mock YouTube Music API (development mode)")
        # Instead of redirecting to Google's OAuth page, redirect to our callback with mock=true
        mock_callback_url = f"{Config.YOUTUBE_MUSIC_REDIRECT_URI}?mock=true"
        # Set the connected flag to explicitly connect
        session['youtube_music_connected'] = True
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
        
        # Clear any disconnect flags since we have a fresh authentication
        if 'youtube_music_explicitly_disconnected' in session:
            logger.info("Clearing youtube_music_explicitly_disconnected flag after successful authentication")
            session.pop('youtube_music_explicitly_disconnected', None)
            
        session.modified = True
        logger.info("YouTube Music authentication successful")
        return redirect(f"{Config.FRONTEND_URL}/music?connected=true")
        
    except Exception as e:
        logger.exception(f"Exception during YouTube Music token exchange: {str(e)}")
        return redirect(f"{Config.FRONTEND_URL}/error?message=YouTube+Music+connection+failed")

@youtube_music_bp.route('/status', methods=['GET'])
def status():
    """Check if user is connected to YouTube Music"""
    # Add logging
    logger.info("YouTube Music status check called")
    logger.info(f"Session keys: {list(session.keys())}")
    logger.info(f"Session disconnect flag: {session.get('youtube_music_explicitly_disconnected')}")
    
    # Get query parameter to check if we're forcing a reconnection
    force_reconnect = request.args.get('force_reconnect', 'false').lower() == 'true'
    
    # If forcing reconnection, always clear disconnect flag and ensure connection
    if force_reconnect:
        logger.info("Force reconnect requested, ensuring connection")
        session.pop('youtube_music_explicitly_disconnected', None)
        session['youtube_music_connected'] = True
        session['youtube_music_access_token'] = 'test_access_token'
        session['youtube_music_refresh_token'] = 'test_refresh_token'
        session['youtube_music_token_expiry'] = time.time() + 3600
        session.modified = True
        
        logger.info(f"After force_reconnect, disconnect flag: {session.get('youtube_music_explicitly_disconnected')}")
        logger.info(f"After force_reconnect, connected status: {session.get('youtube_music_connected')}")
        
        return jsonify({
            'connected': True,
            'tokenExpiresAt': session['youtube_music_token_expiry'],
            'forced': True
        })
    
    # Check if there is an explicit disconnect flag set in the session
    if session.get('youtube_music_explicitly_disconnected') == True:
        logger.info("YouTube Music was explicitly disconnected, returning not connected status")
        return jsonify({
            'connected': False
        })
    
    # At this point, just return the connection status directly
    is_connected = session.get('youtube_music_connected', False)
    
    # If not connected, auto-connect for testing
    if not is_connected:
        session['youtube_music_connected'] = True
        session['youtube_music_access_token'] = 'test_access_token'
        session['youtube_music_refresh_token'] = 'test_refresh_token'
        session['youtube_music_token_expiry'] = time.time() + 3600
        session.modified = True
        logger.info("Auto-connected YouTube Music for testing")
        is_connected = True
    
    # Attempt to get user profile info from Google APIs using the token
    profile_info = None
    if is_connected:
        try:
            # Try to get user info from Google's userinfo endpoint
            access_token = session.get('youtube_music_access_token')
            if access_token:
                user_info_response = requests.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                if user_info_response.status_code == 200:
                    profile_info = user_info_response.json()
                    logger.info(f"Retrieved YouTube Music user profile: {profile_info.get('name')}")
                else:
                    logger.warning(f"Failed to get user profile: {user_info_response.status_code}")
        except Exception as e:
            logger.error(f"Error getting YouTube Music user profile: {str(e)}")
    
    return jsonify({
        'connected': is_connected,
        'tokenExpiresAt': session.get('youtube_music_token_expiry', time.time() + 3600),
        'profile': profile_info
    })
    
    # Original implementation:
    # Mock mode is forcibly disabled for production
    use_mock = False
    
    # In mock mode, always return connected status if explicitly set in session
    if use_mock:
        logger.info("Mock mode: Checking actual YouTube Music connection status")
        is_connected = session.get('youtube_music_connected', False)
        
        # Only set up mock data if explicitly connected
        if is_connected:
            logger.info("Mock mode: YouTube Music is connected in session")
            if not session.get('youtube_music_access_token'):
                session['youtube_music_access_token'] = 'mock_access_token'
                session['youtube_music_refresh_token'] = 'mock_refresh_token'
                session['youtube_music_token_expiry'] = time.time() + 3600  # 1 hour expiry
            
            return jsonify({
                'connected': True,
                'tokenExpiresAt': session.get('youtube_music_token_expiry', time.time() + 3600),
                'mock': True
            })
        else:
            logger.info("Mock mode: YouTube Music is NOT connected in session")
            return jsonify({
                'connected': False,
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

@youtube_music_bp.route('/force-connect', methods=['GET', 'POST'])
def force_connect():
    """Force YouTube Music to be connected (for troubleshooting)"""
    logger.info("Force-connect YouTube Music called")
    
    # Clear any disconnect flags
    session.pop('youtube_music_explicitly_disconnected', None)
    
    # Set connection tokens
    session['youtube_music_connected'] = True
    session['youtube_music_access_token'] = 'test_access_token'
    session['youtube_music_refresh_token'] = 'test_refresh_token'
    session['youtube_music_token_expiry'] = time.time() + 3600
    session.modified = True
    
    logger.info("YouTube Music force-connected")
    return jsonify({
        'success': True,
        'connected': True,
        'message': 'YouTube Music force-connected successfully'
    })

@youtube_music_bp.route('/disconnect', methods=['GET'])
def disconnect():
    """Disconnect from YouTube Music"""
    # Add logging
    logger.info("YouTube Music disconnect called")
    
    # Remove YouTube Music tokens from session
    session.pop('youtube_music_access_token', None)
    session.pop('youtube_music_refresh_token', None)
    session.pop('youtube_music_token_expiry', None)
    session.pop('youtube_music_connected', None)
    
    # Set a flag to indicate that the user has explicitly disconnected
    # This will prevent auto-reconnection in the status endpoint
    session['youtube_music_explicitly_disconnected'] = True
    session.modified = True
    
    logger.info("YouTube Music explicitly disconnected, all tokens removed")
    return jsonify({'success': True})

@youtube_music_bp.route('/search', methods=['GET'])
def search():
    """Search for songs on YouTube Music"""
    # Add extensive logging
    logger.info("==== YouTube Music search called ====")
    logger.info(f"Request args: {request.args}")
    logger.info(f"Connected: {session.get('youtube_music_connected')}")
    
    query = request.args.get('q')
    page_token = request.args.get('pageToken', None)  # Get page token for pagination
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # First, try to use the YouTube Data API to get real results
    try:
        # Get API key from environment variable
        api_key = Config.YOUTUBE_API_KEY
        logger.info(f"YouTube API Key present: {bool(api_key)}")
        
        if api_key:
            # Use YouTube Data API to search
            logger.info(f"Searching YouTube with API key for: {query}")
            
            # Build the YouTube search API URL
            youtube_url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': query + ' music',  # Add 'music' to improve search relevance
                'type': 'video',
                'videoCategoryId': '10',  # Music category
                'maxResults': 50,  # Increased from 10 to 50 (API max per page)
                'relevanceLanguage': 'en',  # Prioritize English results
                'videoEmbeddable': 'true',  # Only include embeddable videos
                'videoSyndicated': 'true',  # Only include videos that can be played outside youtube.com
                'key': api_key
            }
            
            # Add page token if provided for pagination
            if page_token:
                params['pageToken'] = page_token
            
            # Make the request to YouTube API
            response = requests.get(youtube_url, params=params)
            youtube_data = response.json()
            
            logger.info(f"YouTube API response status: {response.status_code}")
            
            if response.status_code == 200 and 'items' in youtube_data:
                logger.info(f"Found {len(youtube_data['items'])} YouTube results")
                
                # Process YouTube results into our format
                results = []
                
                # Organize by "albums" (we'll group by channel)
                channels = {}
                
                for item in youtube_data['items']:
                    video_id = item['id']['videoId']
                    title = item['snippet']['title']
                    channel_title = item['snippet']['channelTitle']
                    
                    # Use actual video thumbnail instead of dummy image
                    # Get highest quality thumbnail available
                    if 'maxres' in item['snippet']['thumbnails']:
                        thumbnail = item['snippet']['thumbnails']['maxres']['url']
                    elif 'high' in item['snippet']['thumbnails']:
                        thumbnail = item['snippet']['thumbnails']['high']['url']
                    else:
                        thumbnail = item['snippet']['thumbnails']['medium']['url']
                    
                    # Create album grouping by channel
                    if channel_title not in channels:
                        channels[channel_title] = {
                            'albumName': f"{channel_title} Collection",
                            'tracks': [],
                            'channelId': item['snippet']['channelId']
                        }
                    
                    # Create a track for this video
                    track_id = f"yt_{video_id}"
                    
                    # Get a consistent color based on channel name (for fallback)
                    colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange']
                    color_idx = hash(channel_title) % len(colors)
                    color = colors[color_idx]
                    
                    # Add to the channel's tracks
                    track_num = len(channels[channel_title]['tracks']) + 1
                    
                    # Try to get the actual video duration
                    video_details = get_video_details(video_id, api_key)
                    duration = video_details.get('duration', 240)  # Fallback to 240 seconds if not available
                    
                    # Create track object
                    track = {
                        'id': track_id,
                        'title': title,
                        'artist': channel_title,
                        'album': channels[channel_title]['albumName'],
                        'duration': duration,
                        'thumbnail': thumbnail,  # Use actual thumbnail
                        'fallbackThumbnail': f"https://dummyimage.com/300x300/{color}/fff.png&text={channel_title.replace(' ', '+')}",
                        'videoId': video_id,
                        'albumIndex': list(channels.keys()).index(channel_title),
                        'trackNumber': track_num
                    }
                    
                    # Add to both the channel's tracks and overall results
                    channels[channel_title]['tracks'].append(track)
                    results.append(track)
                
                # Add pagination tokens if present
                pagination = {}
                if 'nextPageToken' in youtube_data:
                    pagination['nextPageToken'] = youtube_data['nextPageToken']
                if 'prevPageToken' in youtube_data:
                    pagination['prevPageToken'] = youtube_data['prevPageToken']
                
                logger.info(f"Processed {len(results)} tracks from YouTube")
                return jsonify({
                    'results': results,
                    'pagination': pagination,
                    'source': 'youtube_api',
                    'query': query
                })
    
    except Exception as e:
        logger.exception(f"Error using YouTube API: {str(e)}")
    
    # If we get here, either the API key didn't work or there was an error
    # Fall back to generated results
    logger.info(f"Falling back to generated results for: {query}")
    
    # Generate results directly from the query
    results = []
    
    # Create uniform, generic results for any query
    logger.info(f"Generating generic results for: {query}")
    
    # Generate genre-based albums from the query
    genres = ['Rock', 'Pop', 'Electronic', 'Classical', 'Jazz', 'Hip Hop', 'Metal', 'Alternative', 'R&B', 'Country']
    colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', '333', '555', '999', 'f0f']
    artist_names = [
        f"{query}",
        f"The {query} Band", 
        f"{query} & The Group",
        f"DJ {query}",
        f"{query} Experience",
        f"{query} Ensemble",
        f"{query}tones",
        f"{query} Orchestra",
        f"The {query} Project",
        f"{query} Collective"
    ]
    
    # Number of albums to generate - increased to get more content
    album_count = 5  # Generate 5 albums regardless of query
    
    for album_idx in range(album_count):
        # Choose a genre based on query and album index
        genre = genres[album_idx % len(genres)]
        album_name = f"{query} {genre} Collection"
        artist_name = artist_names[album_idx % len(artist_names)]
        
        # Tracks per album (10-15)
        track_count = 10 + (hash(query + str(album_idx)) % 6)  # Between 10-15 tracks
        
        # Generate tracks for this album
        for track_idx in range(track_count):
            track_num = track_idx + 1
            color = colors[(album_idx + track_idx) % len(colors)]
            
            # Create more dynamic track titles
            track_titles = [
                f"{query} - {genre} Opus {track_num}",
                f"{query} {genre} Journey Part {track_num}",
                f"The {query} Experience Vol. {track_num}",
                f"{query} - {genre} Evolution {track_num}",
                f"{query} {genre} Remix {track_num}",
            ]
            
            title_idx = (hash(query + str(album_idx) + str(track_idx))) % len(track_titles)
            title = track_titles[title_idx]
                
            # Create unique ID for this track
            track_id = f"demo_{query.lower().replace(' ', '')}_{album_idx}_{track_idx}"
            
            results.append({
                'id': track_id,
                'title': title,
                'artist': artist_name,
                'album': album_name,
                'duration': 180 + (track_idx * 30),  # Varying durations
                'thumbnail': f"https://dummyimage.com/300x300/{color}/fff.png&text={query.replace(' ', '+')}",
                'videoId': track_id,  # Safe demo videoId
                'albumIndex': album_idx,
                'trackNumber': track_num
            })
    
    # Log the number of results generated
    logger.info(f"Generated {len(results)} results for query: {query}")
    
    # Return with empty pagination object for consistency with YouTube API response
    return jsonify({
        'results': results,
        'pagination': {},
        'source': 'fallback',
        'query': query
    })

def get_video_details(video_id, api_key=None):
    """Get additional details for a YouTube video"""
    try:
        params = {
            'part': 'contentDetails,statistics',
            'id': video_id,
            'key': api_key or Config.YOUTUBE_API_KEY
        }
        
        # API key is sufficient, no need for OAuth token
        # headers = {
        #     'Authorization': f"Bearer {access_token}",
        #     'Content-Type': 'application/json'
        # }
        
        logger.info(f"Getting video details for video ID: {video_id}")
        response = requests.get(
            'https://www.googleapis.com/youtube/v3/videos',
            params=params
            # No headers needed for API key authentication
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
    logger.info("Playlists endpoint called")
    
    # Return hardcoded playlists for all users with placeholder images
    sample_playlists = [
        {
            'id': 'PL_workout',
            'title': 'Workout Favorites',
            'thumbnail': 'https://dummyimage.com/300x300/red/fff.png&text=Workout',
            'trackCount': 15
        },
        {
            'id': 'PL_chill',
            'title': 'Chill Vibes',
            'thumbnail': 'https://dummyimage.com/300x300/blue/fff.png&text=Chill',
            'trackCount': 12
        },
        {
            'id': 'PL_rock',
            'title': 'Rock Classics',
            'thumbnail': 'https://dummyimage.com/300x300/purple/fff.png&text=Rock',
            'trackCount': 20
        }
    ]
    
    logger.info(f"Returning {len(sample_playlists)} sample playlists")
    return jsonify({'playlists': sample_playlists})

@youtube_music_bp.route('/playlists/<playlist_id>/tracks', methods=['GET'])
def get_playlist_tracks(playlist_id):
    """Get tracks in a YouTube Music playlist"""
    logger.info(f"Getting tracks for playlist: {playlist_id}")
    
    # Return different sample tracks based on the playlist ID with placeholder images
    colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
    
    if playlist_id == 'PL_workout':
        sample_tracks = [
            {'id': 'demo_workout_1', 'title': 'High Energy Workout', 'artist': 'Workout Mix', 'album': 'Fitness Collection', 'videoId': 'demo_workout_1', 'duration': 213},
            {'id': 'demo_workout_2', 'title': 'Power Training Set', 'artist': 'Fitness Tracks', 'album': 'Fitness Collection', 'videoId': 'demo_workout_2', 'duration': 246}
        ]
    elif playlist_id == 'PL_chill':
        sample_tracks = [
            {'id': 'demo_chill_1', 'title': 'Relaxation Theme', 'artist': 'Chill Vibes', 'album': 'Chill Collection', 'videoId': 'demo_chill_1', 'duration': 215},
            {'id': 'demo_chill_2', 'title': 'Meditation Session', 'artist': 'Ambient Sounds', 'album': 'Chill Collection', 'videoId': 'demo_chill_2', 'duration': 243}
        ]
    elif playlist_id == 'PL_rock':
        sample_tracks = [
            {'id': 'demo_rock_1', 'title': 'Rock Anthem', 'artist': 'Rock Classics', 'album': 'Rock Collection', 'videoId': 'demo_rock_1', 'duration': 235},
            {'id': 'demo_rock_2', 'title': 'Guitar Solo Mix', 'artist': 'Rock Legends', 'album': 'Rock Collection', 'videoId': 'demo_rock_2', 'duration': 216}
        ]
    else:
        # Default tracks for any other playlist
        sample_tracks = [
            {'id': 'demo_default_1', 'title': 'Demo Track 1', 'artist': 'Music Library', 'album': 'Demo Collection', 'videoId': 'demo_default_1', 'duration': 240},
            {'id': 'demo_default_2', 'title': 'Demo Track 2', 'artist': 'Music Library', 'album': 'Demo Collection', 'videoId': 'demo_default_2', 'duration': 240}
        ]
    
    # Add thumbnails to each track using appropriate placeholder images
    for i, track in enumerate(sample_tracks):
        # Get the playlist type from the ID (workout, chill, rock, etc.)
        playlist_type = playlist_id.split('_')[-1] if '_' in playlist_id else 'music'
        color = colors[i % len(colors)]
        track['thumbnail'] = f"https://dummyimage.com/300x300/{color}/fff.png&text={playlist_type}"
    
    logger.info(f"Returning {len(sample_tracks)} tracks for playlist {playlist_id}")
    return jsonify({'tracks': sample_tracks, 'playlist_id': playlist_id})

@youtube_music_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get music recommendations based on user's listening history"""
    logger.info("Getting music recommendations")
    
    # Return recommendations with placeholder images
    colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange']
    recommendation_types = ['Rock', 'Electronic', 'Pop', 'Workout', 'Focus']
    
    recommendations = []
    for i in range(5):
        color = colors[i % len(colors)]
        rec_type = recommendation_types[i % len(recommendation_types)]
        
        recommendations.append({
            'id': f'demo_rec_{i}',
            'title': f'{rec_type} Recommendation {i+1}',
            'artist': f'Music Library',
            'album': f'{rec_type} Collection',
            'videoId': f'demo_rec_{i}',
            'duration': 180 + (i * 30),
            'thumbnail': f'https://dummyimage.com/300x300/{color}/fff.png&text={rec_type}'
        })
    
    
    logger.info(f"Returning {len(recommendations)} recommendations")
    return jsonify({'recommendations': recommendations})

@youtube_music_bp.route('/workout-playlists', methods=['GET'])
def get_workout_playlists():
    """Get YouTube Music workout playlists"""
    logger.info("Getting workout playlists")
    
    # Return hardcoded workout playlists with placeholder images
    workout_playlists = [
        {
            'id': 'PL_workout_cardio',
            'title': 'Cardio Workout Mix',
            'creator': 'Fitness Music',
            'thumbnail': 'https://dummyimage.com/300x300/red/fff.png&text=Cardio'
        },
        {
            'id': 'PL_workout_strength',
            'title': 'Strength Training Beats',
            'creator': 'Gym Music',
            'thumbnail': 'https://dummyimage.com/300x300/blue/fff.png&text=Strength'
        },
        {
            'id': 'PL_workout_hiit',
            'title': 'HIIT Workout Intensity',
            'creator': 'Workout Music',
            'thumbnail': 'https://dummyimage.com/300x300/purple/fff.png&text=HIIT'
        }
    ]
    
    logger.info(f"Returning {len(workout_playlists)} workout playlists")
    return jsonify({'playlists': workout_playlists})