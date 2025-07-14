# src/ingest/fetch_weather.py
import requests, json
from datetime import datetime, timezone
import os
from pathlib import Path
import yaml
import time
from weather_mlops_pipeline.utils.database import init_database, insert_weather_data

config = yaml.safe_load(open("config/config.yaml"))
RAW_PATH = config['data']['raw_path']
MAX_SAMPLES = config['api']['max_samples']
SAMPLE_INTERVAL = config['api']['sample_interval']
API_KEY = config['api']['key']
BASE_URL = config['api']['base_url']

Path(os.path.dirname(RAW_PATH)).mkdir(parents=True, exist_ok=True)

# Initialize database
init_database()

def is_api_key_valid():
    """Check if the API key is set and not the default placeholder."""
    if not API_KEY or API_KEY == "your-api-key-here":
        print("❌ ERROR: OpenWeatherMap API key is missing or not set in config/config.yaml.")
        print("   Please set your real API key in the config file under api.key.")
        return False
    return True

def fetch_weather_for_city(city_info):
    """Fetch weather for a single city dict from config."""
    if not is_api_key_valid():
        print(f"Skipping {city_info['name']}, {city_info['country_code']} due to missing API key.")
        return
    # Prefer lat/lon if available, else use city name and country code
    if city_info.get('latitude') and city_info.get('longitude'):
        url = f"{BASE_URL}?lat={city_info['latitude']}&lon={city_info['longitude']}&appid={API_KEY}&units=metric"
    else:
        url = f"{BASE_URL}?q={city_info['name']},{city_info['country_code']}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 401:
        print(f"❌ Unauthorized (401): Invalid API key for {city_info['name']}, {city_info['country_code']}. Check your API key in config/config.yaml.")
        return
    if response.status_code == 200:
        data = response.json()
        data["timestamp"] = datetime.now(timezone.utc).isoformat()
        data["city"] = city_info['name']
        data["country_code"] = city_info['country_code']
        data["latitude"] = city_info.get('latitude')
        data["longitude"] = city_info.get('longitude')
        data["zipcode"] = city_info.get('zipcode', None)
        # Add pressure in different units
        if 'main' in data and 'pressure' in data['main']:
            pressure_hpa = data['main']['pressure']
            pressure_inhg = pressure_hpa * 0.02953
            data['main']['pressure_inhg'] = pressure_inhg
        # Add visibility in different units
        if 'visibility' in data:
            visibility_m = data['visibility']
            visibility_km = visibility_m / 1000
            visibility_mi = visibility_m * 0.000621371
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
            print(f"💾 Saved to database (ID: {record_id}) for {city_info['name']}, {city_info['country_code']}")
        # Print summary
        print(f"✅ Weather data fetched for {city_info['name']}, {city_info['country_code']}")
    else:
        print(f"❌ Failed to fetch weather for {city_info['name']}, {city_info['country_code']} (status {response.status_code}) - {response.text}")

def fetch_weather():
    """Fetch weather for all cities in all countries from config."""
    for country in config.get('locations', []):
        for city in country.get('cities', []):
            fetch_weather_for_city(city)

def fetch_multiple_samples():
    """Fetch weather for all cities, multiple times (for time series)."""
    for i in range(MAX_SAMPLES):
        print(f"\n⏳ Sample {i+1}/{MAX_SAMPLES}")
        fetch_weather()
        if i < MAX_SAMPLES - 1:
            time.sleep(SAMPLE_INTERVAL)

def check_api_key():
    """Utility to check if the API key is valid by making a test request."""
    if not is_api_key_valid():
        return False
    # Use the first city in config for test
    for country in config.get('locations', []):
        for city in country.get('cities', []):
            if city.get('latitude') and city.get('longitude'):
                url = f"{BASE_URL}?lat={city['latitude']}&lon={city['longitude']}&appid={API_KEY}&units=metric"
            else:
                url = f"{BASE_URL}?q={city['name']},{city['country_code']}&appid={API_KEY}&units=metric"
            response = requests.get(url)
            if response.status_code == 401:
                print("❌ Unauthorized (401): Invalid API key. Please check your API key in config/config.yaml.")
                return False
            if response.status_code == 200:
                print("✅ API key is valid!")
                return True
            else:
                print(f"⚠️  Test request failed with status {response.status_code}: {response.text}")
                return False
    print("⚠️  No cities found in config to test API key.")
    return False

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "check-key":
        check_api_key()
    else:
        fetch_weather()


