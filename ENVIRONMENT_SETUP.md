# Environment Setup Guide

This guide explains how to set up and switch between development and production environments for the Fitness Console application.

## Spotify Integration Setup

This application now uses the Spotify API for accessing music data, playlists, and playback control. To set up the Spotify integration:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account or create one if you don't have it
3. Create a new application
   - Provide a name (e.g., "Fitness Console")
   - Provide a description
   - Select "Web API" as the type of app
   - Click "Create"
   
4. Once created, you'll see your Client ID. Click "Show Client Secret" to reveal your Client Secret
5. Set up the redirect URI:
   - Click "Edit Settings"
   - Add your redirect URIs:
     - For development: `http://localhost:5000/api/spotify/callback`
     - For production: `https://fitness-console-gtxc.onrender.com/api/spotify/callback`
   - Save the changes

6. Add these credentials to your environment:
   - Update the `.env.development` file in the `/backend` directory for local development:
     ```
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     ```
   - Update the `.env.production` file for production:
     ```
     SPOTIFY_CLIENT_ID=your_client_id_here
     SPOTIFY_CLIENT_SECRET=your_client_secret_here
     ```

7. Restart your application to apply these changes

## Environment Configuration Files

The application uses different environment configuration files for development and production:

- **`.env`** - Main configuration file that controls which environment is active (development or production)
- **`.env.development`** - Development-specific configuration (local environment)
- **`.env.production`** - Production-specific configuration (deployed environment)

## Fitbit Developer Portal Setup

For your application to work correctly in both environments, you need to configure the Fitbit Developer Portal with the appropriate callback URLs:

1. Go to [Fitbit Developer Portal](https://dev.fitbit.com/apps)
2. Select your application
3. Add **both** callback URLs:
   - For development: `http://localhost:5000/api/auth/callback`
   - For production: `https://fitness-console-gtxc.onrender.com/api/auth/callback`

This setup allows your application to work in both development and production modes without needing to change the Fitbit Developer Portal settings.

## Running in Development Mode

Use the development scripts:

- Windows: `scripts/dev.bat`
- Linux/Mac: `scripts/dev.sh`

These scripts will:
1. Set the environment to development
2. Load the configuration from `.env.development`
3. Start the backend and frontend servers in development mode

## Running in Production Mode

Use the production scripts:

- Windows: `scripts/prod.bat`
- Linux/Mac: `scripts/prod.sh`

These scripts will:
1. Set the environment to production
2. Load the configuration from `.env.production`
3. Start the backend and frontend servers in production mode

## How to Switch Environments Manually

If you need to switch between environments manually:

1. Edit the `.env` file in the backend directory:
   ```
   # For local development
   FLASK_ENV=development

   # For production deployment
   #FLASK_ENV=production
   ```

2. Uncomment the appropriate line and comment out the other one.

## Debugging Environment Issues

If you're experiencing environment-related issues:

1. Check the `/api/status` endpoint to verify which environment is active
2. Verify the correct redirect URLs in the response from `/api/auth/login`
3. Check the server logs for any environment-related warnings or errors

Remember to restart the application after making changes to the environment configuration.