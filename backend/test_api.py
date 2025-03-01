import requests
import json

API_BASE_URL = 'http://localhost:5000/api'

def test_endpoint(endpoint, params=None):
    url = f"{API_BASE_URL}{endpoint}"
    try:
        print(f"Testing endpoint: {url}")
        if params:
            print(f"Parameters: {params}")
        
        response = requests.get(url, params=params)
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            try:
                print(f"Response: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response text: {response.text[:200]}...")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

def main():
    print("Testing Fitbit Dashboard API")
    print("============================")
    
    # Test basic endpoints
    test_endpoint('/status')
    test_endpoint('/auth/token')
    
    # Test heart rate endpoint with various parameters
    test_endpoint('/fitbit/heart-rate', {'period': 'day', 'date': '2023-06-01'})
    test_endpoint('/fitbit/heart-rate', {'period': 'week', 'date': '2023-06-01'})
    
    # Test sleep endpoint
    test_endpoint('/fitbit/sleep', {'period': 'day', 'date': '2023-06-01'})
    
    # Test activity endpoint
    test_endpoint('/fitbit/activity', {'period': 'day', 'date': '2023-06-01'})

if __name__ == "__main__":
    main()