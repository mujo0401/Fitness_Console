# Fitness_Console

## API Keys Setup

### Google Places API
This application uses the Google Places API for finding nearby grocery stores when using the Shopping Cart tab. 

To set up your Google API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API
   - Distance Matrix API

4. Create an API key from the "Credentials" section
5. For better security, restrict the API key to only the APIs you are using

6. Add this API key to the environment variables:
   - For local development, add it to a `.env` file in the root directory:
     ```
     GOOGLE_API_KEY=your_google_api_key_here
     ```
   - For deployment on Render, add it to the environment variables in your service settings

### Open Food Facts API
The Open Food Facts API is used for searching food ingredients and doesn't require an API key.