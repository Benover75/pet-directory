# src/preprocess/clean_weather.py
import pandas as pd
import json
import os
import yaml

config = yaml.safe_load(open("config/config.yaml"))
RAW_PATH = config['data']['raw_path']
CLEAN_PATH = config['data']['processed_path']


def clean_weather():
    """Clean and preprocess weather data for Cranston, RI"""
    print("🧹 Cleaning weather data...")
    
    with open(RAW_PATH, "r") as f:
        lines = f.readlines()
    
    records = [json.loads(line) for line in lines]
    df = pd.json_normalize(records)
    
    # Select relevant columns including comprehensive weather data
    selected_columns = [
        "timestamp", "name", 
        "main.temp_celsius", "main.temp_fahrenheit",
        "main.feels_like_celsius", "main.feels_like_fahrenheit",
        "main.temp_min_celsius", "main.temp_min_fahrenheit",
        "main.temp_max_celsius", "main.temp_max_fahrenheit",
        "main.humidity", "main.pressure", "main.pressure_inhg",
        "wind.speed", "wind.speed_mph", "wind.speed_kmh", "wind.deg",
        "visibility", "visibility_km", "visibility_mi",
        "weather_description", "weather_main", "weather_icon",
        "sys.sunrise_time", "sys.sunset_time",
        "clouds.all"
    ]
    
    # Filter columns that exist in the data
    available_columns = [col for col in selected_columns if col in df.columns]
    df = df[available_columns]
    
    # Rename columns for clarity
    column_mapping = {
        "timestamp": "timestamp",
        "name": "city",
        "main.temp_celsius": "temperature_celsius",
        "main.temp_fahrenheit": "temperature_fahrenheit", 
        "main.feels_like_celsius": "feels_like_celsius",
        "main.feels_like_fahrenheit": "feels_like_fahrenheit",
        "main.temp_min_celsius": "temp_min_celsius",
        "main.temp_min_fahrenheit": "temp_min_fahrenheit",
        "main.temp_max_celsius": "temp_max_celsius",
        "main.temp_max_fahrenheit": "temp_max_fahrenheit",
        "main.humidity": "humidity",
        "main.pressure": "pressure_hpa",
        "main.pressure_inhg": "pressure_inhg",
        "wind.speed": "wind_speed_ms",
        "wind.speed_mph": "wind_speed_mph",
        "wind.speed_kmh": "wind_speed_kmh",
        "wind.deg": "wind_direction",
        "visibility": "visibility_m",
        "visibility_km": "visibility_km",
        "visibility_mi": "visibility_mi",
        "weather_description": "weather_description",
        "weather_main": "weather_main",
        "weather_icon": "weather_icon",
        "sys.sunrise_time": "sunrise_time",
        "sys.sunset_time": "sunset_time",
        "clouds.all": "cloud_coverage"
    }
    
    df = df.rename(columns=column_mapping)
    
    # Ensure required columns exist, fill with NaN if missing
    required_columns = ["timestamp", "city", "temperature_celsius", "temperature_fahrenheit", "humidity", "wind_speed"]
    for col in required_columns:
        if col not in df.columns:
            df[col] = None
    
    # Save cleaned data
    df.to_csv(CLEAN_PATH, index=False)
    
    print(f"✅ Data cleaned successfully!")
    print(f"📊 Records processed: {len(df)}")
    print(f"📍 Location: {df['city'].iloc[0] if len(df) > 0 else 'Unknown'}")
    print(f"🌡️  Temperature range: {df['temperature_celsius'].min():.1f}°C to {df['temperature_celsius'].max():.1f}°C")
    print(f"💧 Humidity range: {df['humidity'].min():.0f}% to {df['humidity'].max():.0f}%")

if __name__ == "__main__":
    clean_weather()


