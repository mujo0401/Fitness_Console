from datetime import datetime
import statistics

def process_apple_heart_rate_data(raw_data, period):
    """
    Process heart rate data from Apple Health API
    
    Args:
        raw_data (dict): Raw data from Apple Health API
        period (str): Time period (day, week, month, 3month)
    
    Returns:
        list: Processed data
    """
    processed_data = []
    
    # Extract heart rate data based on period
    if period == 'day':
        # For a single day, we'll use intraday data
        try:
            intraday_data = raw_data['heart_rate']['intraday']
            date = raw_data['heart_rate']['date']
            
            # Organize by hour for better visualization
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
                    processed_data.append({
                        'time': f"{hour}:00",
                        'date': date,
                        'avg': round(statistics.mean(values)),
                        'min': min(values),
                        'max': max(values),
                        'values': values
                    })
        except (KeyError, IndexError) as e:
            # Handle missing data
            print(f"Error processing Apple heart rate data: {e}")
    else:
        # For longer periods, we'll use daily summaries
        try:
            for day_data in raw_data['heart_rate']['data']:
                date = day_data['date']
                
                processed_data.append({
                    'date': date,
                    'restingHeartRate': day_data.get('resting', 0),
                    'min': day_data.get('min', 0),
                    'max': day_data.get('max', 0),
                    'avg': day_data.get('avg', 0)
                })
        except (KeyError, IndexError) as e:
            # Handle missing data
            print(f"Error processing Apple heart rate data: {e}")
    
    return processed_data

def process_apple_activity_data(raw_data, period):
    """
    Process activity data from Apple Health API
    
    Args:
        raw_data (dict): Raw data from Apple Health API
        period (str): Time period (day, week, month)
    
    Returns:
        list: Processed data
    """
    processed_data = []
    
    if period == 'day':
        # Process a single day's activity data
        try:
            intraday_data = raw_data['activity']['intraday']
            date = raw_data['activity']['date']
            
            # Process each hourly data point
            for data_point in intraday_data:
                time_str = data_point.get('time', '')
                if time_str:
                    # Convert time to 12-hour format
                    time_obj = datetime.strptime(time_str, '%H:%M:%S')
                    hour_12 = time_obj.hour % 12 or 12
                    ampm = 'AM' if time_obj.hour < 12 else 'PM'
                    formatted_time = f"{hour_12}:00 {ampm}"
                    
                    processed_data.append({
                        'dateTime': date,
                        'time': formatted_time,
                        'steps': data_point.get('steps', 0),
                        'calories': data_point.get('calories', 0),
                        'distance': data_point.get('distance', 0),
                        'floors': data_point.get('floors', 0),
                        'activeMinutes': 0  # This field might not be available in hourly data
                    })
        except Exception as e:
            print(f"Error processing Apple day activity data: {e}")
    else:
        # Process multiple days of activity data
        try:
            for day_data in raw_data['activity']['data']:
                processed_data.append({
                    'dateTime': day_data.get('dateTime', ''),
                    'steps': day_data.get('steps', 0),
                    'calories': day_data.get('calories', 0),
                    'distance': day_data.get('distance', 0),
                    'floors': day_data.get('floors', 0),
                    'activeMinutes': day_data.get('activeMinutes', 0),
                    'sedentaryMinutes': day_data.get('sedentaryMinutes', 0),
                    'lightActiveMinutes': day_data.get('lightActiveMinutes', 0),
                    'moderateActiveMinutes': day_data.get('moderateActiveMinutes', 0),
                    'vigorousActiveMinutes': day_data.get('vigorousActiveMinutes', 0)
                })
        except Exception as e:
            print(f"Error processing Apple multi-day activity data: {e}")
    
    # Sort by date/time
    if period == 'day':
        processed_data.sort(key=lambda x: x.get('time', ''))
    else:
        processed_data.sort(key=lambda x: x.get('dateTime', ''))
    
    return processed_data

def process_apple_workout_data(raw_data):
    """
    Process workout data from Apple Health API
    
    Args:
        raw_data (dict): Raw data from Apple Health API
    
    Returns:
        list: Processed workout data
    """
    processed_data = []
    
    try:
        for workout in raw_data.get('workouts', []):
            # Extract date and time
            start_date = workout.get('start_date', '')
            if start_date:
                date_obj = datetime.strptime(start_date, '%Y-%m-%dT%H:%M:%S')
                date = date_obj.strftime('%Y-%m-%d')
                
                # Format time for display
                hour = date_obj.hour % 12 or 12
                am_pm = 'AM' if date_obj.hour < 12 else 'PM'
                time = f"{hour}:{date_obj.minute:02d} {am_pm}"
            else:
                date = ''
                time = ''
            
            # Format duration
            duration_seconds = workout.get('duration', 0)
            duration_minutes = duration_seconds / 60
            
            # Create processed workout entry
            workout_entry = {
                'id': workout.get('id', ''),
                'date': date,
                'time': time,
                'type': workout.get('type', 'Unknown'),
                'duration': duration_minutes,
                'durationDisplay': workout.get('duration_display', f"{int(duration_minutes)} min"),
                'calories': workout.get('calories', 0),
                'distance': workout.get('distance'),
                'distanceUnit': workout.get('distance_unit', 'km'),
                'heartRate': workout.get('heart_rate', {})
            }
            
            processed_data.append(workout_entry)
    except Exception as e:
        print(f"Error processing Apple workout data: {e}")
    
    return processed_data