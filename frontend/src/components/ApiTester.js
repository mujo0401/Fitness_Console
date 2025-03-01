// Create this as a new file: src/components/ApiTester.js
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const ApiTester = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Test the API connection
      const response = await axios.get('http://localhost:5000/api/test', {
        withCredentials: true
      });
      
      setTestResult(response.data);
    } catch (err) {
      console.error('API test failed:', err);
      setError(`API test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Test the auth token endpoint
      const response = await axios.get('http://localhost:5000/api/auth/token', {
        withCredentials: true
      });
      
      setTestResult(response.data);
    } catch (err) {
      console.error('Auth token test failed:', err);
      setError(`Auth token test failed: ${err.message}`);
      
      // Show more details if it's an axios error
      if (err.response) {
        setError(prev => `${prev}\nStatus: ${err.response.status}\nDetails: ${JSON.stringify(err.response.data)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLoginUrl = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Get the login URL
      const response = await axios.get('http://localhost:5000/api/auth/login', {
        withCredentials: true
      });
      
      setTestResult(response.data);
    } catch (err) {
      console.error('Get login URL failed:', err);
      setError(`Get login URL failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>API Tester</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={testApi}>
          Test API Connection
        </Button>
        <Button variant="outlined" onClick={testAuthEndpoint}>
          Test Auth Endpoint
        </Button>
        <Button variant="outlined" onClick={getLoginUrl}>
          Get Login URL
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1, my: 2 }}>
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
            {error}
          </Typography>
        </Box>
      )}
      
      {testResult && (
        <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, my: 2 }}>
          <Typography variant="body2">
            Test Result: {JSON.stringify(testResult, null, 2)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApiTester;