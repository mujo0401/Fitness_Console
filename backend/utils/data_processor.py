from datetime import datetime
import statistics
import math

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
    
    # Extract heart rate data handling both intraday and multi-day data
    try:
        # First get any available intraday data (this is higher resolution data)
        has_intraday_data = False
        
        # Check if we have intraday data available
        if 'activities-heart-intraday' in raw_data and 'dataset' in raw_data['activities-heart-intraday']:
            intraday_data = raw_data['activities-heart-intraday']['dataset']
            if intraday_data and len(intraday_data) > 0:
                has_intraday_data = True
                base_date = raw_data['activities-heart'][0]['dateTime'] if 'activities-heart' in raw_data and raw_data['activities-heart'] else ''
                
                # Process full intraday dataset when available - this gives the most detailed view
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
                
                # If there are too many points, downsample by grouping by minutes
                # This helps with performance while still preserving the data distribution
                if len(processed_data_full) > 5000:
                    print(f"Downsampling large dataset with {len(processed_data_full)} points")
                    # Group by minutes
                    minute_groups = {}
                    for point in intraday_data:
                        time_str = point['time']
                        minute_key = time_str[:5]  # Get HH:MM part
                        
                        if minute_key not in minute_groups:
                            minute_groups[minute_key] = []
                        
                        minute_groups[minute_key].append(point['value'])
                    
                    # Create one data point per minute with stats
                    processed_data_minutes = []
                    for minute, values in minute_groups.items():
                        # Get hour and minute for better display
                        hour_min = minute.split(':')
                        hour = int(hour_min[0])
                        hour_12 = hour % 12 or 12  # Convert to 12-hour format
                        am_pm = 'AM' if hour < 12 else 'PM'
                        
                        processed_data_minutes.append({
                            'time': f"{hour_12}:{hour_min[1]} {am_pm}",
                            'rawTime': minute,  # For sorting
                            'date': base_date,
                            'avg': round(statistics.mean(values)),
                            'min': min(values),
                            'max': max(values),
                            'values': values,
                            'count': len(values)  # How many original data points
                        })
                    
                    # Sort by raw time
                    processed_data_minutes.sort(key=lambda x: x['rawTime'])
                    processed_data = processed_data_minutes
                    print(f"Downsampled to {len(processed_data_minutes)} minute-grouped points")
                else:
                    # Use full resolution data
                    processed_data = processed_data_full
                    print(f"Using full resolution data with {len(processed_data_full)} points")
        
        # If no intraday data or if we have a multi-day period, also process daily summaries
        if not has_intraday_data or period != 'day':
            if 'activities-heart' in raw_data:
                for day in raw_data['activities-heart']:
                    date = day['dateTime']
                    
                    # For multi-day periods, we'll check if each day has intraday data
                    day_intraday_data = None
                    if period != 'day' and 'intraday' in day:
                        day_intraday_data = day['intraday'].get('dataset', [])
                    
                    # If we have intraday data for this day, process it (for multi-day requests)
                    if day_intraday_data and len(day_intraday_data) > 0:
                        for idx, point in enumerate(day_intraday_data):
                            time_str = point['time']
                            hour_min_sec = time_str.split(':')
                            hour = int(hour_min_sec[0])
                            hour_12 = hour % 12 or 12
                            am_pm = 'AM' if hour < 12 else 'PM'
                            
                            processed_data.append({
                                'time': f"{hour_12}:{hour_min_sec[1]}:{hour_min_sec[2]} {am_pm}",
                                'rawTime': time_str,
                                'date': date,
                                'value': point['value'],
                                'avg': point['value'],
                                'timestamp': idx
                            })
                    else:
                        # Otherwise use daily summary
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
                            
                            # Only add day summaries if we don't have intraday data (to avoid duplicates)
                            if not has_intraday_data or date != base_date:
                                processed_data.append({
                                    'date': date,
                                    'restingHeartRate': resting_hr,
                                    'min': min_hr,
                                    'max': max_hr,
                                    'is_daily_summary': True
                                })
    except (KeyError, IndexError) as e:
        # Handle missing data
        print(f"Error processing heart rate data: {e}")
        pass
    
    return processed_data

def detect_abnormal_rhythms(heart_rate_data):
    """
    Detect potentially abnormal heart rhythms using advanced analysis algorithms
    
    Args:
        heart_rate_data (list): Processed heart rate data
        
    Returns:
        list: Abnormal events with timestamps and detailed classification
    """
    abnormal_events = []
    
    # Implement more sophisticated analysis algorithms backed by medical research
    # These algorithms detect various cardiac arrhythmias and anomalies
    
    for entry in heart_rate_data:
        values = entry.get('values', [])
        
        if not values or len(values) < 2:
            continue
        
        # Calculate heart rate variability metrics
        rr_intervals = []  # Time between consecutive beats in ms
        for i in range(1, len(values)):
            if values[i-1] > 0 and values[i] > 0:
                # Convert BPM to milliseconds between beats
                rr_prev = 60000 / values[i-1]  
                rr_curr = 60000 / values[i]
                rr_intervals.append(abs(rr_curr - rr_prev))
        
        # Skip if insufficient RR intervals for analysis
        if len(rr_intervals) < 3:
            continue
            
        # Calculate RMSSD (Root Mean Square of Successive Differences)
        rmssd = calculate_rmssd(rr_intervals)
        
        # Calculate time-domain HRV metrics
        sdnn = calculate_sdnn(rr_intervals)  # Standard deviation of NN intervals
        
        # Calculate pNN50 (percentage of adjacent NN intervals that differ by more than 50 ms)
        differences = [abs(rr_intervals[i] - rr_intervals[i-1]) for i in range(1, len(rr_intervals))]
        pnn50 = 100 * sum(1 for diff in differences if diff > 50) / len(differences) if differences else 0
        
        # Tachycardia detection (persistent high heart rate)
        consecutive_high = 0
        for val in values:
            if val > 100:  # Resting HR consistently above 100 BPM
                consecutive_high += 1
            else:
                consecutive_high = 0
                
            # Detect sustained tachycardia (high heart rate for 5+ consecutive readings)
            if consecutive_high >= 5:
                abnormal_events.append({
                    'date': entry.get('date', ''),
                    'time': entry.get('time', ''),
                    'type': 'Tachycardia',
                    'value': f"{val} BPM sustained",
                    'severity': 'Medium' if val < 120 else 'High',
                    'details': 'Sustained elevated heart rate at rest',
                    'hrv_metrics': {'rmssd': round(rmssd, 2), 'sdnn': round(sdnn, 2), 'pnn50': round(pnn50, 2)}
                })
                break
                
        # Bradycardia detection (persistent low heart rate)
        consecutive_low = 0
        for val in values:
            if val < 50:  # Consistently below 50 BPM
                consecutive_low += 1
            else:
                consecutive_low = 0
                
            # Detect sustained bradycardia (low heart rate for 5+ consecutive readings)
            if consecutive_low >= 5:
                abnormal_events.append({
                    'date': entry.get('date', ''),
                    'time': entry.get('time', ''),
                    'type': 'Bradycardia',
                    'value': f"{val} BPM sustained",
                    'severity': 'Medium' if val > 40 else 'High',
                    'details': 'Sustained low heart rate',
                    'hrv_metrics': {'rmssd': round(rmssd, 2), 'sdnn': round(sdnn, 2), 'pnn50': round(pnn50, 2)}
                })
                break
                
        # Check for rapid changes in heart rate (potential arrythmia)
        for i in range(1, len(values)):
            change = abs(values[i] - values[i-1])
            
            # Flag sudden changes greater than 30 BPM
            if change > 30:
                abnormal_events.append({
                    'date': entry.get('date', ''),
                    'time': entry.get('time', ''),
                    'type': 'Sudden change',
                    'value': f"Change of {change} BPM",
                    'severity': 'Medium' if change < 40 else 'High',
                    'details': 'Rapid change in heart rate may indicate ectopic beats or arrhythmia',
                    'hrv_metrics': {'rmssd': round(rmssd, 2), 'sdnn': round(sdnn, 2), 'pnn50': round(pnn50, 2)}
                })
        
        # Heart Rate Variability Analysis for potential arrhythmias
        if sdnn < 20 and len(rr_intervals) > 10:
            # Low HRV can indicate cardiac stress or autonomic dysfunction
            abnormal_events.append({
                'date': entry.get('date', ''),
                'time': entry.get('time', ''),
                'type': 'Low HRV',
                'value': f"SDNN: {round(sdnn, 2)} ms",
                'severity': 'Medium',
                'details': 'Low heart rate variability may indicate reduced cardiac autonomic function',
                'hrv_metrics': {'rmssd': round(rmssd, 2), 'sdnn': round(sdnn, 2), 'pnn50': round(pnn50, 2)}
            })
            
        # Detect potential Atrial Fibrillation using HRV analysis
        if len(rr_intervals) > 20:
            # Poincaré plot analysis
            sd1, sd2 = calculate_poincare_metrics(rr_intervals)
            sd_ratio = sd1/sd2 if sd2 != 0 else 0
            
            # Irregularity metrics
            cov_rr = (statistics.stdev(rr_intervals) / statistics.mean(rr_intervals)) * 100 if rr_intervals else 0
            
            # Potential AFib detection based on RR irregularity and Poincaré plot metrics
            if cov_rr > 15 and sd_ratio > 0.8:
                abnormal_events.append({
                    'date': entry.get('date', ''),
                    'time': entry.get('time', ''),
                    'type': 'Potential AFib',
                    'value': f"High irregularity (COV: {round(cov_rr, 2)}%)",
                    'severity': 'High',
                    'details': 'Irregular rhythm pattern suggestive of atrial fibrillation',
                    'hrv_metrics': {
                        'rmssd': round(rmssd, 2), 
                        'sdnn': round(sdnn, 2), 
                        'pnn50': round(pnn50, 2),
                        'sd1': round(sd1, 2),
                        'sd2': round(sd2, 2)
                    }
                })
        
        # Ectopic beat detection
        potential_ectopics = detect_ectopic_beats(values, rr_intervals)
        if potential_ectopics > 3:
            abnormal_events.append({
                'date': entry.get('date', ''),
                'time': entry.get('time', ''),
                'type': 'Ectopic Beats',
                'value': f"{potential_ectopics} detected",
                'severity': 'Medium' if potential_ectopics < 10 else 'High',
                'details': 'Potential premature ventricular or atrial contractions',
                'hrv_metrics': {'rmssd': round(rmssd, 2), 'sdnn': round(sdnn, 2), 'pnn50': round(pnn50, 2)}
            })
            
    return abnormal_events

def calculate_rmssd(rr_intervals):
    """Calculate Root Mean Square of Successive Differences (RMSSD)"""
    if not rr_intervals or len(rr_intervals) < 2:
        return 0
        
    # Calculate differences between adjacent RR intervals
    differences = [abs(rr_intervals[i] - rr_intervals[i-1]) for i in range(1, len(rr_intervals))]
    
    # Calculate mean of squared differences
    mean_squared_diff = sum(diff**2 for diff in differences) / len(differences)
    
    # Return the square root
    return math.sqrt(mean_squared_diff)

def calculate_sdnn(rr_intervals):
    """Calculate Standard Deviation of NN (normal-to-normal) intervals"""
    if not rr_intervals:
        return 0
    try:
        return statistics.stdev(rr_intervals)
    except statistics.StatisticsError:
        return 0

def calculate_poincare_metrics(rr_intervals):
    """
    Calculates Poincaré plot metrics SD1 and SD2
    SD1 represents short-term variability
    SD2 represents long-term variability
    """
    if len(rr_intervals) < 2:
        return 0, 0
        
    # Create scatter plot coordinates
    x = rr_intervals[:-1]  # RRn
    y = rr_intervals[1:]   # RRn+1
    
    # Calculate SD1 and SD2 using ellipse fitting method
    sd1 = math.sqrt(statistics.variance([y[i] - x[i] for i in range(len(x))]) / 2)
    sd2 = math.sqrt(statistics.variance([y[i] + x[i] for i in range(len(x))]) / 2)
    
    return sd1, sd2

def detect_ectopic_beats(heart_rates, rr_intervals):
    """
    Detect potential ectopic beats (premature ventricular contractions or atrial contractions)
    based on RR interval patterns
    """
    if len(rr_intervals) < 3:
        return 0
        
    ectopic_count = 0
    
    # Analyze consecutive intervals for characteristic ectopic patterns
    for i in range(2, len(rr_intervals)):
        # PVC typically shows a short-long pattern:
        # A premature beat followed by a compensatory pause
        if (rr_intervals[i-1] < 0.8 * rr_intervals[i-2] and 
            rr_intervals[i] > 1.2 * rr_intervals[i-2]):
            ectopic_count += 1
            
    return ectopic_count

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
    print(f"ACTIVITY DATA PROCESSING START: period={period}, raw_data_keys={list(raw_data.keys() if raw_data else [])}")
    processed_data = []
    
    # If raw_data is None, create an empty dict to prevent errors
    if raw_data is None:
        raw_data = {}
        print("CRITICAL: raw_data is None, using empty dict instead")
    
    if period == 'day':
        # Process a single day's activity data
        try:
            activities = raw_data.get('activities', [])
            summary = raw_data.get('summary', {})
            dateTime = raw_data.get('dateTime', '')
            
            # If dateTime is missing, use current date as fallback
            if not dateTime:
                dateTime = datetime.now().strftime('%Y-%m-%d')
                print(f"CRITICAL: Missing dateTime, using current date as fallback: {dateTime}")
            
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
                    # Estimate distance in miles based on steps (rough approximation: 2000 steps ≈ 1 mile)
                    distance = round(steps_count / 2000, 2)
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
                print(f"CRITICAL: Using summary data for activity: dateTime={dateTime}")
                print(f"CRITICAL: Summary data: steps={summary.get('steps', 0)}, calories={summary.get('caloriesOut', 0)}")
                
                # Dump the full summary for debugging
                print(f"CRITICAL: Full summary data: {summary}")
                
                # Check distances data specifically (common issue area)
                distances = summary.get('distances', [])
                print(f"CRITICAL: Distances data: {distances}")
                
                # Check activity details
                activities = raw_data.get('activities', [])
                print(f"CRITICAL: Activities list length: {len(activities)}")
                if activities:
                    print(f"CRITICAL: First activity: {activities[0]}")
                
                # Check and log if there's any fitness data in the summary
                if summary.get('steps', 0) > 0 or summary.get('caloriesOut', 0) > 0:
                    print(f"CRITICAL: Found non-zero activity data in summary!")
                else:
                    print(f"CRITICAL: All summary data is ZERO for activity!")
                
                processed_data.append({
                    'dateTime': dateTime,
                    'date': dateTime,  # Add date field for consistency
                    'steps': summary.get('steps', 0),
                    'calories': summary.get('caloriesOut', 0),
                    'distance': summary.get('distances', [{}])[0].get('distance', 0),
                    'floors': summary.get('floors', 0),
                    'activeMinutes': summary.get('fairlyActiveMinutes', 0) + summary.get('veryActiveMinutes', 0)
                })
        except Exception as e:
            print(f"CRITICAL ERROR processing activity data: {e}")
            import traceback
            print(traceback.format_exc())
    else:
        # Process multiple days of activity data
        try:
            print(f"CRITICAL: Processing multi-day activity data, period={period}")
            steps_data = raw_data.get('activities-steps', [])
            print(f"CRITICAL: Found {len(steps_data)} days of step data")
            
            # Log all available dates for debugging
            available_dates = [day.get('dateTime', '') for day in steps_data]
            print(f"CRITICAL: Available dates: {available_dates}")
            
            # Process each day
            for day_data in steps_data:
                date = day_data.get('dateTime', '')
                steps = int(day_data.get('value', 0))
                print(f"CRITICAL: Processing day {date}, steps={steps}")
                
                # Find corresponding data for other metrics
                calories = 0
                for cal_data in raw_data.get('activities-calories', []):
                    if cal_data.get('dateTime') == date:
                        calories = int(cal_data.get('value', 0))
                        print(f"CRITICAL: Found calories={calories} for {date}")
                        break
                
                distance = 0
                for dist_data in raw_data.get('activities-distance', []):
                    if dist_data.get('dateTime') == date:
                        distance = float(dist_data.get('value', 0))
                        print(f"CRITICAL: Found distance={distance} for {date}")
                        break
                
                floors = 0
                for floor_data in raw_data.get('activities-floors', []):
                    if floor_data.get('dateTime') == date:
                        floors = int(floor_data.get('value', 0))
                        print(f"CRITICAL: Found floors={floors} for {date}")
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