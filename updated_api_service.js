// Heart rate data API calls
export const heartRateService = {
  // Get heart rate data for a specific period (with debouncing)
  getHeartRateData: debounce(async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching heart rate data for ${period} on ${date}`);
      const response = await apiClient.get(`/fitbit/heart-rate`, {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded when fetching heart rate data. Please try again later.');
      }
      console.error('Error fetching heart rate data:', error);
      throw error;
    }
  }, 300), // 300ms debounce

  // Get test mock data that works even without authentication
  getTestMockHeartRateData: async () => {
    try {
      console.log('Fetching test mock heart rate data');
      const response = await apiClient.get('/fitbit/test-mock');
      return response.data;
    } catch (error) {
      console.error('Error fetching test mock data:', error);
      throw error;
    }
  }
};
