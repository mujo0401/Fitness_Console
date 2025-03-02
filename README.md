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

### DoorDash Integration

The application now includes integration with DoorDash for food delivery services. This allows users to:
- Find nearby restaurants and grocery stores available through DoorDash
- Add food items to cart
- Submit orders for delivery through DoorDash

#### Configuration

To use the DoorDash integration:

1. **For development/testing:** 
   - The application includes a mock DoorDash API that simulates interactions with the real API
   - This is enabled by default with `DOORDASH_MOCK_API_ENABLED=True`

2. **For production use with real DoorDash API:**
   - Obtain API credentials from DoorDash's Developer portal: https://developer.doordash.com/
   - Add these settings to your `.env` file:
     ```
     DOORDASH_API_KEY=your_doordash_api_key
     DOORDASH_CLIENT_ID=your_doordash_client_id
     DOORDASH_CLIENT_SECRET=your_doordash_client_secret
     DOORDASH_API_BASE_URL=https://api.doordash.com
     DOORDASH_MOCK_API_ENABLED=False
     ```

#### Features

- **Store & Restaurant Locator:** Finds nearby food establishments that work with DoorDash
- **Menu Search:** Search for ready-to-eat meals and groceries available at selected locations
- **Cart Management:** Add items to cart with quantities and view nutritional information
- **Checkout Process:** Place orders through DoorDash's delivery network with real-time delivery estimates

#### Performance Optimizations

The food browsing feature has been optimized for performance:
- Virtualized lists for efficient rendering of large menus and product catalogs
- Lazy loading of images (only loads when visible)
- Debounced search to reduce API calls
- Memoized components to prevent unnecessary re-renders

### Spoonacular API Integration

The application uses the Spoonacular API for recipe and ingredient data:

1. Sign up for a free API key at: https://spoonacular.com/food-api/console#Dashboard
2. Add the API key to your backend/.env file:
   ```
   SPOONACULAR_API_KEY=your_spoonacular_api_key
   SPOONACULAR_CACHE_ENABLED=True
   SPOONACULAR_CACHE_TIMEOUT=3600
   ```