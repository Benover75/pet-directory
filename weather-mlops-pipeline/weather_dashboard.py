#!/usr/bin/env python3
"""
Weather Dashboard for Cranston, RI (02920)
Displays comprehensive weather data and analytics
"""

import pandas as pd
import json
import yaml
from datetime import datetime
import os

def load_config():
    """Load configuration from config.yaml"""
    return yaml.safe_load(open("config/config.yaml"))

def load_weather_data():
    """Load and process weather data from database"""
    try:
        from weather_mlops_pipeline.utils.database import get_weather_history, get_database_info
        
        # Check if database exists and has data
        db_info = get_database_info()
        if db_info['total_records'] == 0:
            print("❌ No weather data found in database. Run the pipeline first.")
            return None
        
        # Load recent data from database
        df = get_weather_history(limit=1000)
        print(f"📊 Loaded {len(df)} records from database")
        return df
        
    except Exception as e:
        print(f"❌ Error loading data from database: {e}")
        return None

def display_weather_summary(df):
    """Display comprehensive weather summary"""
    if df is None or len(df) == 0:
        print("❌ No weather data available")
        return
    
    print("🌤️  WEATHER DASHBOARD - CRANSTON, RI (02920)")
    print("=" * 60)
    
    # Latest weather data
    latest = df.iloc[-1]
    print(f"📍 Location: {latest['city']}")
    print(f"🕒 Last Updated: {latest['timestamp']}")
    print()
    
    # Temperature Summary
    print("🌡️  TEMPERATURE DATA")
    print("-" * 30)
    print(f"Current: {latest['temperature_celsius']:.1f}°C / {latest['temperature_fahrenheit']:.1f}°F")
    if 'feels_like_celsius' in latest and pd.notna(latest['feels_like_celsius']):
        print(f"Feels Like: {latest['feels_like_celsius']:.1f}°C / {latest['feels_like_fahrenheit']:.1f}°F")
    if 'temp_min_celsius' in latest and pd.notna(latest['temp_min_celsius']):
        print(f"Min: {latest['temp_min_celsius']:.1f}°C / {latest['temp_min_fahrenheit']:.1f}°F")
    if 'temp_max_celsius' in latest and pd.notna(latest['temp_max_celsius']):
        print(f"Max: {latest['temp_max_celsius']:.1f}°C / {latest['temp_max_fahrenheit']:.1f}°F")
    print()
    
    # Atmospheric Conditions
    print("💨 ATMOSPHERIC CONDITIONS")
    print("-" * 30)
    print(f"Humidity: {latest['humidity']:.0f}%")
    if 'pressure_hpa' in latest and pd.notna(latest['pressure_hpa']):
        print(f"Pressure: {latest['pressure_hpa']:.0f} hPa ({latest['pressure_inhg']:.2f} inHg)")
    if 'wind_speed_ms' in latest and pd.notna(latest['wind_speed_ms']):
        print(f"Wind Speed: {latest['wind_speed_ms']:.1f} m/s ({latest['wind_speed_mph']:.1f} mph)")
    if 'wind_direction' in latest and pd.notna(latest['wind_direction']):
        print(f"Wind Direction: {latest['wind_direction']:.0f}°")
    print()
    
    # Visibility and Conditions
    print("👁️  VISIBILITY & CONDITIONS")
    print("-" * 30)
    if 'visibility_km' in latest and pd.notna(latest['visibility_km']):
        print(f"Visibility: {latest['visibility_km']:.1f} km ({latest['visibility_mi']:.1f} miles)")
    if 'weather_description' in latest and pd.notna(latest['weather_description']):
        print(f"Weather: {latest['weather_description']}")
    if 'cloud_coverage' in latest and pd.notna(latest['cloud_coverage']):
        print(f"Cloud Coverage: {latest['cloud_coverage']:.0f}%")
    print()
    
    # Sun Times
    if 'sunrise_time' in latest and pd.notna(latest['sunrise_time']):
        print("🌅 SUN TIMES")
        print("-" * 30)
        print(f"Sunrise: {latest['sunrise_time']}")
        print(f"Sunset: {latest['sunset_time']}")
        print()

def display_statistics(df):
    """Display weather statistics"""
    if df is None or len(df) == 0:
        return
    
    print("📊 WEATHER STATISTICS")
    print("=" * 60)
    print(f"Total Records: {len(df)}")
    print(f"Data Collection Period: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print()
    
    # Temperature Statistics
    if 'temperature_celsius' in df.columns:
        temp_stats = df['temperature_celsius'].describe()
        print("🌡️  TEMPERATURE STATISTICS (°C)")
        print("-" * 35)
        print(f"Mean: {temp_stats['mean']:.1f}°C")
        print(f"Min: {temp_stats['min']:.1f}°C")
        print(f"Max: {temp_stats['max']:.1f}°C")
        print(f"Std Dev: {temp_stats['std']:.1f}°C")
        print()
    
    # Humidity Statistics
    if 'humidity' in df.columns:
        humidity_stats = df['humidity'].describe()
        print("💧 HUMIDITY STATISTICS (%)")
        print("-" * 30)
        print(f"Mean: {humidity_stats['mean']:.0f}%")
        print(f"Min: {humidity_stats['min']:.0f}%")
        print(f"Max: {humidity_stats['max']:.0f}%")
        print()
    
    # Wind Statistics
    if 'wind_speed_ms' in df.columns:
        wind_stats = df['wind_speed_ms'].describe()
        print("💨 WIND SPEED STATISTICS (m/s)")
        print("-" * 35)
        print(f"Mean: {wind_stats['mean']:.1f} m/s")
        print(f"Min: {wind_stats['min']:.1f} m/s")
        print(f"Max: {wind_stats['max']:.1f} m/s")
        print()

def display_recent_data(df, num_records=5):
    """Display recent weather records"""
    if df is None or len(df) == 0:
        return
    
    print("📈 RECENT WEATHER DATA")
    print("=" * 60)
    
    recent = df.tail(num_records)
    for idx, row in recent.iterrows():
        timestamp = pd.to_datetime(row['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
        temp_c = row['temperature_celsius']
        temp_f = row['temperature_fahrenheit']
        humidity = row['humidity']
        
        print(f"{timestamp} | {temp_c:.1f}°C/{temp_f:.1f}°F | {humidity:.0f}% humidity")

def main():
    """Main dashboard function"""
    print("🚀 Loading Weather Dashboard...")
    print()
    
    # Load data
    df = load_weather_data()
    
    # Display dashboard sections
    display_weather_summary(df)
    display_statistics(df)
    display_recent_data(df)
    
    print("=" * 60)
    print("🎉 Dashboard complete! Run the pipeline to get fresh data.")
    print("💡 Use 'python run_pipeline.py' to collect new weather data")

if __name__ == "__main__":
    main() 