from datetime import datetime
import statistics

def process_heart_rate_data(raw_data, period):
    """
    Process heart rate data from Fitbit API
    
    Args:
        raw_data (dict): Raw data from Fitbit API
        period (str): Time period (day, week, month, 3month)
    
    Returns:
        list: Processed data
    """
    processed_data = []
    
    # Extract heart rate data based on period
    if period == 'day':
        # For a single day, we'll use intraday data at the highest resolution available
        try:
            intraday_data = raw_data['activities-heart-intraday']['dataset']
            base_date = raw_data['activities-heart'][0]['dateTime']
            
            # Check if we have detailed intraday data directly
            if len(intraday_data) > 0:
                # Return individual data points for more granular visualization
                # Group data points by 1-minute intervals to prevent overloading the chart
                minute_groups = {}
                
                for point in intraday_data:
                    time_str = point['time']
                    minute_key = time_str[:5]  # Get HH:MM part
                    
                    if minute_key not in minute_groups:
                        minute_groups[minute_key] = []
                    
                    minute_groups[minute_key].append(point['value'])
                
                # Create one data point per minute with stats
                for minute, values in minute_groups.items():
                    # Get hour and minute for better display
                    hour_min = minute.split(':')
                    hour = int(hour_min[0])
                    hour_12 = hour % 12 or 12  # Convert to 12-hour format
                    am_pm = 'AM' if hour < 12 else 'PM'
                    
                    processed_data.append({
                        'time': f"{hour_12}:{hour_min[1]} {am_pm}",
                        'rawTime': minute,  # For sorting
                        'date': base_date,
                        'avg': round(statistics.mean(values)),
                        'min': min(values),
                        'max': max(values),
                        'values': values
                    })
                
                # Sort by raw time
                processed_data.sort(key=lambda x: x['rawTime'])
                
                # Also add original raw data points for potential high-resolution display
                if len(intraday_data) > 0:
                    processed_data_full = []
                    for idx, point in enumerate(intraday_data):
                        time_str = point['time']
                        hour_min_sec = time_str.split(':')
                        hour = int(hour_min_sec[0])
                        hour_12 = hour % 12 or 12
                        am_pm = 'AM' if hour < 12 else 'PM'
                        
                        processed_data_full.append({
                            'time': f"{hour_12}:{hour_min_sec[1]}:{hour_min_sec[2]} {am_pm}",
                            'rawTime': time_str,
                            'date': base_date,
                            'value': point['value'],  # Raw heart rate value
                            'avg': point['value'],    # For visualization compatibility
                            'timestamp': idx  # For sorting and animation
                        })
                    
                    # Include the raw data if there are fewer than 1000 points,
                    # otherwise stick with the minute-aggregated data
                    if len(processed_data_full) <= 1000:
                        processed_data = processed_data_full
            else:
                # Fallback to hourly organization if no detailed data
                hours = {}
                for point in intraday_data:
                    time_obj = datetime.strptime(point['time'], '%H:%M:%S')
                    hour = time_obj.hour
                    
                    if hour not in hours:
                        hours[hour] = []
                    
                    hours[hour].append(point['value'])
                
                # Calculate stats for each hour
                for hour, values in hours.items():
                    if values:
                        hour_12 = hour % 12 or 12  # Convert to 12-hour format
                        am_pm = 'AM' if hour < 12 else 'PM'
                        
                        processed_data.append({
                            'time': f"{hour_12}:00 {am_pm}",
                            'date': base_date,
                            'avg': round(statistics.mean(values)),
                            'min': min(values),
                            'max': max(values),
                            'values': values
                        })
        except (KeyError, IndexError) as e:
            # Handle missing data
            print(f"Error processing intraday heart rate data: {e}")
            pass
    else:
        # For longer periods, we'll use daily summaries
        try:
            for day in raw_data['activities-heart']:
                date = day['dateTime']
                
                # Check if heart rate zones are available
                if 'value' in day and 'heartRateZones' in day['value']:
                    zones = day['value']['heartRateZones']
                    resting_hr = day['value'].get('restingHeartRate', 0)
                    
                    # Get max and min from zones
                    out_of_range = next((z for z in zones if z['name'] == 'Out of Range'), {})
                    max_hr = 0
                    for zone in zones:
                        if 'max' in zone and zone['max'] > max_hr:
                            max_hr = zone['max']
                    
                    min_hr = out_of_range.get('min', 0)
                    
                    processed_data.append({
                        'date': date,
                        'restingHeartRate': resting_hr,
                        'min': min_hr,
                        'max': max_hr
                    })
        except (KeyError, IndexError):
            # Handle missing data
            pass
    
    return processed_data

def detect_abnormal_rhythms(heart_rate_data):
    """
    Detect potentially abnormal heart rhythms
    
    Args:
        heart_rate_data (list): Processed heart rate data
        
    Returns:
        list: Abnormal events with timestamps
    """
    abnormal_events = []
    
    # In a real application, this would involve more sophisticated analysis
    # For this example, we'll use some simple heuristics
    
    for entry in heart_rate_data:
        values = entry.get('values', [])
        
        if not values:
            continue
        
        # Check for rapid changes in heart rate
        for i in range(1, len(values)):
            change = abs(values[i] - values[i-1])
            
            # Flag sudden changes greater than 30 BPM
            if change > 30:
                abnormal_events.append({
                    'date': entry.get('date', ''),
                    'time': entry.get('time', ''),
                    'type': 'Sudden change',
                    'value': f"Change of {change} BPM",
                    'severity': 'Medium' if change < 40 else 'High'
                })
        
        # Check for unusually high or low values
        max_val = max(values)
        min_val = min(values)
        
        if max_val > 150:  # Unusually high heart rate
            abnormal_events.append({
                'date': entry.get('date', ''),
                'time': entry.get('time', ''),
                'type': 'High heart rate',
                'value': f"{max_val} BPM",
                'severity': 'Medium' if max_val < 180 else 'High'
            })
            
        if min_val < 45:  # Unusually low heart rate
            abnormal_events.append({
                'date': entry.get('date', ''),
                'time': entry.get('time', ''),
                'type': 'Low heart rate',
                'value': f"{min_val} BPM",
                'severity': 'Medium' if min_val > 40 else 'High'
            })
    
    return abnormal_events

def process_sleep_data(raw_data, period):
    """
    Process sleep data from Fitbit API
    
    Args:
        raw_data (dict): Raw data from Fitbit API
        period (str): Time period (day, week, month)
    
    Returns:
        list: Processed data
    """
    processed_data = []
    
    if period == 'day':
        # Process a single day's sleep data
        if 'sleep' in raw_data:
            for sleep_record in raw_data['sleep']:
                # Extract date and basic info
                date = sleep_record.get('dateOfSleep', '')
                
                # Convert time formats to 12-hour format
                start_time = sleep_record.get('startTime', '')
                if start_time:
                    start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    start_hour = start_dt.hour % 12 or 12
                    start_ampm = 'AM' if start_dt.hour < 12 else 'PM'
                    formatted_start = f"{start_hour}:{start_dt.minute:02d} {start_ampm}"
                else:
                    formatted_start = ''
                
                end_time = sleep_record.get('endTime', '')
                if end_time:
                    end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                    end_hour = end_dt.hour % 12 or 12
                    end_ampm = 'AM' if end_dt.hour < 12 else 'PM'
                    formatted_end = f"{end_hour}:{end_dt.minute:02d} {end_ampm}"
                else:
                    formatted_end = ''
                
                # Extract sleep data
                duration_ms = sleep_record.get('duration', 0)  # in milliseconds
                duration_min = duration_ms / 60000  # convert to minutes
                
                efficiency = sleep_record.get('efficiency', 0)
                
                # Get summary data
                summary = sleep_record.get('levels', {}).get('summary', {})
                
                deep_minutes = summary.get('deep', {}).get('minutes', 0)
                light_minutes = summary.get('light', {}).get('minutes', 0)
                rem_minutes = summary.get('rem', {}).get('minutes', 0)
                wake_minutes = summary.get('wake', {}).get('minutes', 0)
                
                # Calculate percentages
                total_sleep_minutes = deep_minutes + light_minutes + rem_minutes
                if total_sleep_minutes > 0:
                    deep_percent = round((deep_minutes / total_sleep_minutes) * 100)
                    light_percent = round((light_minutes / total_sleep_minutes) * 100)
                    rem_percent = round((rem_minutes / total_sleep_minutes) * 100)
                else:
                    deep_percent = light_percent = rem_percent = 0
                
                # Create processed record
                sleep_entry = {
                    'date': date,
                    'startTime': formatted_start,
                    'endTime': formatted_end,
                    'durationMinutes': round(duration_min),
                    'efficiency': efficiency,
                    'deepSleepMinutes': deep_minutes,
                    'lightSleepMinutes': light_minutes,
                    'remSleepMinutes': rem_minutes,
                    'awakeDuringNight': wake_minutes,
                    'deepSleepPercentage': deep_percent,
                    'lightSleepPercentage': light_percent,
                    'remSleepPercentage': rem_percent,
                    'score': sleep_record.get('sleep_score', {}).get('total_score', 0)
                }
                
                processed_data.append(sleep_entry)
    else:
        # Process multiple days of sleep data
        if 'sleep' in raw_data:
            # Group sleep data by date
            sleep_by_date = {}
            
            for sleep_record in raw_data['sleep']:
                date = sleep_record.get('dateOfSleep', '')
                
                if date not in sleep_by_date:
                    sleep_by_date[date] = []
                
                sleep_by_date[date].append(sleep_record)
            
            # Process each date
            for date, records in sleep_by_date.items():
                total_duration = 0
                total_efficiency = 0
                total_deep = 0
                total_light = 0
                total_rem = 0
                total_wake = 0
                total_score = 0
                score_count = 0
                
                for record in records:
                    duration_ms = record.get('duration', 0)
                    total_duration += duration_ms
                    
                    total_efficiency += record.get('efficiency', 0)
                    
                    summary = record.get('levels', {}).get('summary', {})
                    
                    total_deep += summary.get('deep', {}).get('minutes', 0)
                    total_light += summary.get('light', {}).get('minutes', 0)
                    total_rem += summary.get('rem', {}).get('minutes', 0)
                    total_wake += summary.get('wake', {}).get('minutes', 0)
                    
                    if 'sleep_score' in record and 'total_score' in record['sleep_score']:
                        total_score += record['sleep_score']['total_score']
                        score_count += 1
                
                # Calculate averages
                avg_duration_min = (total_duration / 60000) if records else 0  # convert to minutes
                avg_efficiency = total_efficiency / len(records) if records else 0
                avg_score = total_score / score_count if score_count > 0 else 0
                
                # Calculate percentages
                total_sleep_minutes = total_deep + total_light + total_rem
                if total_sleep_minutes > 0:
                    deep_percent = round((total_deep / total_sleep_minutes) * 100)
                    light_percent = round((total_light / total_sleep_minutes) * 100)
                    rem_percent = round((total_rem / total_sleep_minutes) * 100)
                else:
                    deep_percent = light_percent = rem_percent = 0
                
                # Create processed record
                sleep_entry = {
                    'date': date,
                    'durationMinutes': round(avg_duration_min),
                    'efficiency': round(avg_efficiency),
                    'deepSleepMinutes': total_deep,
                    'lightSleepMinutes': total_light,
                    'remSleepMinutes': total_rem,
                    'awakeDuringNight': total_wake,
                    'deepSleepPercentage': deep_percent,
                    'lightSleepPercentage': light_percent,
                    'remSleepPercentage': rem_percent,
                    'score': round(avg_score)
                }
                
                processed_data.append(sleep_entry)
    
    # Sort by date
    processed_data.sort(key=lambda x: x['date'])
    return processed_data

def process_activity_data(raw_data, period):
    """
    Process activity data from Fitbit API
    
    Args:
        raw_data (dict): Raw data from Fitbit API
        period (str): Time period (day, week, month)
    
    Returns:
        list: Processed data
    """
    processed_data = []
    
    if period == 'day':
        # Process a single day's activity data
        try:
            activities = raw_data.get('activities', [])
            summary = raw_data.get('summary', {})
            dateTime = raw_data.get('dateTime', '')
            
            # Process the intraday time series data if available
            if 'activities-steps-intraday' in raw_data:
                steps_data = raw_data['activities-steps-intraday'].get('dataset', [])
                
                # Group data by hour
                hourly_data = {}
                for data_point in steps_data:
                    time_str = data_point.get('time', '')
                    if time_str:
                        hour = time_str.split(':')[0]
                        if hour not in hourly_data:
                            hourly_data[hour] = {
                                'steps': 0,
                                'count': 0
                            }
                        hourly_data[hour]['steps'] += data_point.get('value', 0)
                        hourly_data[hour]['count'] += 1
                
                # Create hourly entries
                for hour, data in hourly_data.items():
                    # Convert hour to 12-hour format with AM/PM
                    hour_int = int(hour)
                    hour_12 = hour_int % 12 or 12
                    ampm = 'AM' if hour_int < 12 else 'PM'
                    time_str = f"{hour_12}:00 {ampm}"
                    
                    # Calculate other metrics based on steps count for this hour
                    steps_count = data['steps']
                    # Estimate calories based on steps (rough approximation)
                    calories = int(steps_count * 0.04)
                    # Estimate distance in km based on steps (rough approximation: 1300 steps ≈ 1km)
                    distance = round(steps_count / 1300, 2)
                    # Estimate floors based on steps (rough approximation)
                    floors = int(steps_count / 500) if steps_count > 200 else 0
                    # Estimate active minutes based on steps
                    active_minutes = int(steps_count / 100) if steps_count > 100 else 0
                    
                    # Create hourly activity entry
                    processed_data.append({
                        'dateTime': dateTime,
                        'time': time_str,
                        'steps': data['steps'],
                        'calories': calories,
                        'distance': distance,
                        'floors': floors,
                        'activeMinutes': active_minutes
                    })
            else:
                # If no intraday data, use the summary data
                processed_data.append({
                    'dateTime': dateTime,
                    'steps': summary.get('steps', 0),
                    'calories': summary.get('caloriesOut', 0),
                    'distance': summary.get('distances', [{}])[0].get('distance', 0),
                    'floors': summary.get('floors', 0),
                    'activeMinutes': summary.get('fairlyActiveMinutes', 0) + summary.get('veryActiveMinutes', 0)
                })
        except Exception as e:
            print(f"Error processing activity data: {e}")
    else:
        # Process multiple days of activity data
        try:
            for day_data in raw_data.get('activities-steps', []):
                date = day_data.get('dateTime', '')
                steps = int(day_data.get('value', 0))
                
                # Find corresponding data for other metrics
                calories = 0
                for cal_data in raw_data.get('activities-calories', []):
                    if cal_data.get('dateTime') == date:
                        calories = int(cal_data.get('value', 0))
                        break
                
                distance = 0
                for dist_data in raw_data.get('activities-distance', []):
                    if dist_data.get('dateTime') == date:
                        distance = float(dist_data.get('value', 0))
                        break
                
                floors = 0
                for floor_data in raw_data.get('activities-floors', []):
                    if floor_data.get('dateTime') == date:
                        floors = int(floor_data.get('value', 0))
                        break
                
                # Active minutes
                sedentary = 0
                lightly_active = 0
                fairly_active = 0
                very_active = 0
                
                # Get activity minutes from raw data if available
                for min_data in raw_data.get('activities-minutesSedentary', []):
                    if min_data.get('dateTime') == date:
                        sedentary = int(min_data.get('value', 0))
                        break
                
                for min_data in raw_data.get('activities-minutesLightlyActive', []):
                    if min_data.get('dateTime') == date:
                        lightly_active = int(min_data.get('value', 0))
                        break
                
                for min_data in raw_data.get('activities-minutesFairlyActive', []):
                    if min_data.get('dateTime') == date:
                        fairly_active = int(min_data.get('value', 0))
                        break
                
                for min_data in raw_data.get('activities-minutesVeryActive', []):
                    if min_data.get('dateTime') == date:
                        very_active = int(min_data.get('value', 0))
                        break
                
                active_minutes = fairly_active + very_active
                
                processed_data.append({
                    'dateTime': date,
                    'steps': steps,
                    'calories': calories,
                    'distance': distance,
                    'floors': floors,
                    'activeMinutes': active_minutes,
                    'sedentaryMinutes': sedentary,
                    'lightActiveMinutes': lightly_active,
                    'moderateActiveMinutes': fairly_active,
                    'vigorousActiveMinutes': very_active
                })
        except Exception as e:
            print(f"Error processing activity data: {e}")
    
    # Sort by date/time
    if period == 'day':
        processed_data.sort(key=lambda x: x.get('time', ''))
    else:
        processed_data.sort(key=lambda x: x.get('dateTime', ''))
    
    return processed_data