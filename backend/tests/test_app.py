import unittest
import json
import sys
import os
from unittest.mock import patch, MagicMock

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import app


class TestApp(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_status_endpoint(self):
        """Test the status endpoint returns online status"""
        response = self.client.get('/api/status')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'online')
        
    @patch('backend.api.fitbit.fitbit_request')
    def test_heart_rate_endpoint(self, mock_fitbit_request):
        """Test the heart rate endpoint with mocked Fitbit API"""
        # Mock session
        with patch('backend.api.fitbit.session') as mock_session:
            mock_session.get.return_value = {'access_token': 'test_token'}
            
            # Mock Fitbit API response
            mock_response = {
                'activities-heart': [{
                    'dateTime': '2023-01-01',
                    'value': {'restingHeartRate': 70}
                }],
                'activities-heart-intraday': {
                    'dataset': [
                        {'time': '00:00:00', 'value': 68},
                        {'time': '00:01:00', 'value': 69}
                    ]
                }
            }
            mock_fitbit_request.return_value = (mock_response, 200)
            
            # Test endpoint
            response = self.client.get('/api/fitbit/heart-rate?period=day&date=2023-01-01')
            data = json.loads(response.data)
            
            self.assertEqual(response.status_code, 200)
            self.assertTrue('data' in data)
            
    def test_test_endpoint(self):
        """Test the test endpoint returns correct message"""
        response = self.client.get('/api/test')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'API is working correctly')


if __name__ == '__main__':
    unittest.main()