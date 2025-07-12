# src/ingest/fetch_weather.py
import requests, json
from datetime import datetime
import os
from pathlib import Path
import yaml
import time
from src.utils.database import init_database, insert_weather_data

config = yaml.safe_load(open("config/config.yaml"))

URL = f"{config['api']['base_url']}?zip={config['api']['zipcode']},{config['api']['country_code']}&appid={config['api']['key']}&units=metric"
RAW_PATH = config['data']['raw_path']
MAX_SAMPLES = config['api']['max_samples']
SAMPLE_INTERVAL = config['api']['sample_interval']

Path(os.path.dirname(RAW_PATH)).mkdir(parents=True, exist_ok=True)

# Initialize database
init_database()

def fetch_weather():
    """Fetch comprehensive weather data for Cranston, RI (02920)"""
    response = requests.get(URL)
    if response.status_code == 200:
        data = response.json()
        data["timestamp"] = datetime.utcnow().isoformat()
        
        # Add both Celsius and Fahrenheit temperatures
        if 'main' in data and 'temp' in data['main']:
            temp_celsius = data['main']['temp']
            temp_fahrenheit = (temp_celsius * 9/5) + 32
            data['main']['temp_celsius'] = temp_celsius
            data['main']['temp_fahrenheit'] = temp_fahrenheit
            
            # Add feels like temperatures in both units
            if 'feels_like' in data['main']:
                feels_like_celsius = data['main']['feels_like']
                feels_like_fahrenheit = (feels_like_celsius * 9/5) + 32
                data['main']['feels_like_celsius'] = feels_like_celsius
                data['main']['feels_like_fahrenheit'] = feels_like_fahrenheit
            
            # Add min/max temperatures in both units
            if 'temp_min' in data['main']:
                temp_min_celsius = data['main']['temp_min']
                temp_min_fahrenheit = (temp_min_celsius * 9/5) + 32
                data['main']['temp_min_celsius'] = temp_min_celsius
                data['main']['temp_min_fahrenheit'] = temp_min_fahrenheit
                
            if 'temp_max' in data['main']:
                temp_max_celsius = data['main']['temp_max']
                temp_max_fahrenheit = (temp_max_celsius * 9/5) + 32
                data['main']['temp_max_celsius'] = temp_max_celsius
                data['main']['temp_max_fahrenheit'] = temp_max_fahrenheit
        
        # Add wind speed in different units
        if 'wind' in data and 'speed' in data['wind']:
            wind_speed_ms = data['wind']['speed']  # meters per second
            wind_speed_mph = wind_speed_ms * 2.237  # miles per hour
            wind_speed_kmh = wind_speed_ms * 3.6    # kilometers per hour
            data['wind']['speed_mph'] = wind_speed_mph
            data['wind']['speed_kmh'] = wind_speed_kmh
        
        # Add pressure in different units
        if 'main' in data and 'pressure' in data['main']:
            pressure_hpa = data['main']['pressure']  # hectopascals
            pressure_inhg = pressure_hpa * 0.02953   # inches of mercury
            data['main']['pressure_inhg'] = pressure_inhg
        
        # Add visibility in different units
        if 'visibility' in data:
            visibility_m = data['visibility']  # meters
            visibility_km = visibility_m / 1000  # kilometers
            visibility_mi = visibility_m * 0.000621371  # miles
            data['visibility_km'] = visibility_km
            data['visibility_mi'] = visibility_mi
        
        # Add sunrise/sunset times in readable format
        if 'sys' in data:
            if 'sunrise' in data['sys']:
                sunrise_time = datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M:%S')
                data['sys']['sunrise_time'] = sunrise_time
            if 'sunset' in data['sys']:
                sunset_time = datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M:%S')
                data['sys']['sunset_time'] = sunset_time
        
        # Add weather description and icon
        if 'weather' in data and len(data['weather']) > 0:
            weather_info = data['weather'][0]
            data['weather_description'] = weather_info.get('description', '')
            data['weather_main'] = weather_info.get('main', '')
            data['weather_icon'] = weather_info.get('icon', '')
        
        # Save to JSON file (for backward compatibility)
        with open(RAW_PATH, "a") as f:
            json.dump(data, f)
            f.write("\n")
        
        # Save to database
        record_id = insert_weather_data(data)
        if record_id:
            print(f"💾 Saved to database (ID: {record_id})")
        
        # Print comprehensive weather summary
        print(f"✅ Weather data fetched for {data.get('name', 'Cranston')}, RI")
        print(f"   🌡️  Temperature: {temp_celsius:.1f}°C / {temp_fahrenheit:.1f}°F")
        print(f"   💧 Humidity: {data['main'].get('humidity', 'N/A')}%")
        print(f"   💨 Wind: {data['wind'].get('speed', 'N/A')} m/s ({data['wind'].get('speed_mph', 'N/A'):.1f} mph)")
        print(f"   🌤️  Conditions: {data.get('weather_description', 'N/A')}")
        print(f"   👁️  Visibility: {data.get('visibility_km', 'N/A'):.1f} km")
        print(f"   📊 Pressure: {data['main'].get('pressure', 'N/A')} hPa ({data['main'].get('pressure_inhg', 'N/A'):.2f} inHg)")
        
        return data
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}")

def fetch_multiple_samples():
    """Fetch multiple weather samples with intervals"""
    print(f"🌤️  Starting weather data collection for Cranston, RI (02920)")
    print(f"📊 Target: {MAX_SAMPLES} samples every {SAMPLE_INTERVAL} seconds")
    print("=" * 60)
    
    # Clear existing data
    if os.path.exists(RAW_PATH):
        os.remove(RAW_PATH)
        print("🗑️  Cleared existing weather data")
    
    samples_collected = 0
    
    try:
        while samples_collected < MAX_SAMPLES:
            try:
                fetch_weather()
                samples_collected += 1
                print(f"📈 Sample {samples_collected}/{MAX_SAMPLES} collected")
                
                if samples_collected < MAX_SAMPLES:
                    print(f"⏳ Waiting {SAMPLE_INTERVAL} seconds before next sample...")
                    time.sleep(SAMPLE_INTERVAL)
                    
            except Exception as e:
                print(f"❌ Error fetching sample {samples_collected + 1}: {e}")
                time.sleep(SAMPLE_INTERVAL)
                continue
                
    except KeyboardInterrupt:
        print(f"\n⏹️  Data collection stopped by user. Collected {samples_collected} samples.")
    
    print(f"\n🎉 Weather data collection completed!")
    print(f"📁 Data saved to: {RAW_PATH}")
    print(f"📊 Total samples collected: {samples_collected}")

if __name__ == "__main__":
    fetch_multiple_samples()


