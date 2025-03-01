#\!/bin/bash
sed -i '172,178c\
  useEffect(() => {\
    // Always fetch data, even when not authenticated\
    // When not authenticated, it will use mock data\
    fetchHeartData();\
  }, [period, date]);' /mnt/c/Users/alask/source/repos/fitbit-dashboard/frontend/src/pages/HeartTab.js
