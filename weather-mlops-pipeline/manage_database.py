#!/usr/bin/env python3
"""
Database Management Tool for Weather MLOps Pipeline
Manage SQLite database operations for weather data
"""

import argparse
import sys
from weather_mlops_pipeline.utils.database import (
    init_database, get_database_info, get_weather_statistics,
    get_weather_history, export_to_csv, clear_old_data,
    get_latest_weather
)

def show_database_info():
    """Display database information"""
    print("📊 DATABASE INFORMATION")
    print("=" * 50)
    
    info = get_database_info()
    print(f"Database Path: {info['database_path']}")
    print(f"Tables: {', '.join(info['tables'])}")
    print(f"Total Records: {info['total_records']:,}")
    print(f"Database Size: {info['database_size_mb']} MB")
    
    if info['total_records'] > 0:
        stats = get_weather_statistics()
        print(f"\n📈 DATA STATISTICS")
        print("-" * 30)
        print(f"Date Range: {stats['date_range']['start']} to {stats['date_range']['end']}")
        print(f"Temperature Range: {stats['temperature']['min_celsius']:.1f}°C to {stats['temperature']['max_celsius']:.1f}°C")
        print(f"Humidity Range: {stats['humidity']['minimum']:.0f}% to {stats['humidity']['maximum']:.0f}%")
        print(f"Average Wind Speed: {stats['wind']['avg_speed_mph']:.1f} mph")

def show_latest_weather():
    """Display latest weather data"""
    print("🌤️  LATEST WEATHER DATA")
    print("=" * 50)
    
    latest = get_latest_weather()
    if latest:
        print(f"Location: {latest['city']}")
        print(f"Timestamp: {latest['timestamp']}")
        print(f"Temperature: {latest['temperature_celsius']:.1f}°C / {latest['temperature_fahrenheit']:.1f}°F")
        print(f"Humidity: {latest['humidity']:.0f}%")
        print(f"Wind Speed: {latest['wind_speed_ms']:.1f} m/s ({latest['wind_speed_mph']:.1f} mph)")
        print(f"Conditions: {latest['weather_description']}")
        print(f"Pressure: {latest['pressure_hpa']:.0f} hPa")
        print(f"Visibility: {latest['visibility_km']:.1f} km")
    else:
        print("❌ No weather data found")

def show_recent_records(limit=10):
    """Display recent weather records"""
    print(f"📈 RECENT WEATHER RECORDS (Last {limit})")
    print("=" * 60)
    
    df = get_weather_history(limit=limit)
    if len(df) > 0:
        for idx, row in df.iterrows():
            print(f"{row['timestamp']} | {row['temperature_celsius']:.1f}°C | {row['humidity']:.0f}% | {row['weather_description']}")
    else:
        print("❌ No weather data found")

def export_data():
    """Export data to CSV"""
    print("📤 EXPORTING DATA TO CSV")
    print("=" * 30)
    
    try:
        filename = export_to_csv()
        print(f"✅ Data exported successfully to: {filename}")
    except Exception as e:
        print(f"❌ Export failed: {e}")

def cleanup_data(days):
    """Clean up old data"""
    print(f"🗑️  CLEANING UP DATA (Keeping last {days} days)")
    print("=" * 50)
    
    try:
        deleted_count = clear_old_data(days)
        print(f"✅ Cleanup completed. Deleted {deleted_count} records.")
    except Exception as e:
        print(f"❌ Cleanup failed: {e}")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Weather Database Management Tool")
    parser.add_argument("command", choices=[
        "info", "latest", "recent", "export", "cleanup", "init"
    ], help="Command to execute")
    parser.add_argument("--limit", type=int, default=10, help="Number of recent records to show")
    parser.add_argument("--days", type=int, default=30, help="Days to keep when cleaning up")
    
    args = parser.parse_args()
    
    try:
        if args.command == "info":
            show_database_info()
        elif args.command == "latest":
            show_latest_weather()
        elif args.command == "recent":
            show_recent_records(args.limit)
        elif args.command == "export":
            export_data()
        elif args.command == "cleanup":
            cleanup_data(args.days)
        elif args.command == "init":
            init_database()
            print("✅ Database initialized successfully")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 