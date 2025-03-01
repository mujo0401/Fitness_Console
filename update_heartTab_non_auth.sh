#\!/bin/bash
sed -i '424,451c\
  /* Remove the "not authenticated" special case - we will now always show data */' /mnt/c/Users/alask/source/repos/fitbit-dashboard/frontend/src/pages/HeartTab.js
chmod +x /mnt/c/Users/alask/source/repos/fitbit-dashboard/update_heartTab_non_auth.sh
/mnt/c/Users/alask/source/repos/fitbit-dashboard/update_heartTab_non_auth.sh
echo "Updated HeartTab.js to remove authentication blocking message"
