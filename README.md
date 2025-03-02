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

### Instacart Integration

The application now includes integration with Instacart for grocery delivery services. This allows users to:
- Find nearby stores available through Instacart
- Add grocery items to cart
- Submit orders for delivery through Instacart

#### Configuration

To use the Instacart integration:

1. **For development/testing:** 
   - The application includes a mock Instacart API that simulates interactions with the real API
   - This is enabled by default with `INSTACART_MOCK_API_ENABLED=True`

2. **For production use with real Instacart API:**
   - Obtain an API key from Instacart's Partner API program
   - Add these settings to your `.env` file:
     ```
     INSTACART_API_KEY=your_instacart_api_key
     INSTACART_API_BASE_URL=https://api.instacart.com
     INSTACART_MOCK_API_ENABLED=False
     ```

#### Features

- **Store Locator:** Finds nearby grocery stores that work with Instacart
- **Product Search:** Allows users to search for groceries available at selected stores  
- **Cart Management:** Add items to cart with quantities and view nutritional information
- **Checkout Process:** Place orders through Instacart's delivery network with real-time delivery estimates

#### Performance Optimizations

The grocery browsing feature has been optimized for performance:
- Virtualized lists for efficient rendering of large product catalogs
- Lazy loading of images (only loads when visible)
- Debounced search to reduce API calls
- Memoized components to prevent unnecessary re-renders