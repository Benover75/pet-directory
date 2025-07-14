# weather_mlops_pipeline/utils/database.py
import sqlite3
import pandas as pd
import json
import yaml
from datetime import datetime
import os
from pathlib import Path

config = yaml.safe_load(open("config/config.yaml"))
DB_PATH = "data/weather.db"

def init_database():
    """Initialize the SQLite database with weather tables"""
    # Create data directory if it doesn't exist
    Path(os.path.dirname(DB_PATH)).mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create weather_data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            city TEXT,
            temperature_celsius REAL,
            temperature_fahrenheit REAL,
            feels_like_celsius REAL,
            feels_like_fahrenheit REAL,
            temp_min_celsius REAL,
            temp_min_fahrenheit REAL,
            temp_max_celsius REAL,
            temp_max_fahrenheit REAL,
            humidity INTEGER,
            pressure_hpa REAL,
            pressure_inhg REAL,
            wind_speed_ms REAL,
            wind_speed_mph REAL,
            wind_speed_kmh REAL,
            wind_direction INTEGER,
            visibility_m REAL,
            visibility_km REAL,
            visibility_mi REAL,
            weather_description TEXT,
            weather_main TEXT,
            weather_icon TEXT,
            sunrise_time TEXT,
            sunset_time TEXT,
            cloud_coverage INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes for better query performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON weather_data(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_city ON weather_data(city)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_temperature ON weather_data(temperature_celsius)')
    
    conn.commit()
    conn.close()
    print(f"✅ Database initialized at {DB_PATH}")

def insert_weather_data(weather_data):
    """Insert weather data into the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO weather_data (
                timestamp, city, temperature_celsius, temperature_fahrenheit,
                feels_like_celsius, feels_like_fahrenheit,
                temp_min_celsius, temp_min_fahrenheit,
                temp_max_celsius, temp_max_fahrenheit,
                humidity, pressure_hpa, pressure_inhg,
                wind_speed_ms, wind_speed_mph, wind_speed_kmh, wind_direction,
                visibility_m, visibility_km, visibility_mi,
                weather_description, weather_main, weather_icon,
                sunrise_time, sunset_time, cloud_coverage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            weather_data.get('timestamp'),
            weather_data.get('name'),
            weather_data.get('main', {}).get('temp_celsius'),
            weather_data.get('main', {}).get('temp_fahrenheit'),
            weather_data.get('main', {}).get('feels_like_celsius'),
            weather_data.get('main', {}).get('feels_like_fahrenheit'),
            weather_data.get('main', {}).get('temp_min_celsius'),
            weather_data.get('main', {}).get('temp_min_fahrenheit'),
            weather_data.get('main', {}).get('temp_max_celsius'),
            weather_data.get('main', {}).get('temp_max_fahrenheit'),
            weather_data.get('main', {}).get('humidity'),
            weather_data.get('main', {}).get('pressure'),
            weather_data.get('main', {}).get('pressure_inhg'),
            weather_data.get('wind', {}).get('speed'),
            weather_data.get('wind', {}).get('speed_mph'),
            weather_data.get('wind', {}).get('speed_kmh'),
            weather_data.get('wind', {}).get('deg'),
            weather_data.get('visibility'),
            weather_data.get('visibility_km'),
            weather_data.get('visibility_mi'),
            weather_data.get('weather_description'),
            weather_data.get('weather_main'),
            weather_data.get('weather_icon'),
            weather_data.get('sys', {}).get('sunrise_time'),
            weather_data.get('sys', {}).get('sunset_time'),
            weather_data.get('clouds', {}).get('all')
        ))
        
        conn.commit()
        return cursor.lastrowid
        
    except Exception as e:
        print(f"❌ Error inserting data: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

def get_latest_weather():
    """Get the most recent weather data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM weather_data 
        ORDER BY timestamp DESC 
        LIMIT 1
    ''')
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        columns = [description[0] for description in cursor.description]
        return dict(zip(columns, row))
    return None

def get_weather_history(limit=100):
    """Get weather history with optional limit"""
    conn = sqlite3.connect(DB_PATH)
    
    query = f'''
        SELECT * FROM weather_data 
        ORDER BY timestamp DESC 
        LIMIT {limit}
    '''
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    return df

def get_weather_by_date_range(start_date, end_date):
    """Get weather data for a specific date range"""
    conn = sqlite3.connect(DB_PATH)
    
    query = '''
        SELECT * FROM weather_data 
        WHERE timestamp BETWEEN ? AND ?
        ORDER BY timestamp ASC
    '''
    
    df = pd.read_sql_query(query, conn, params=[start_date, end_date])
    conn.close()
    
    return df

def get_weather_statistics():
    """Get comprehensive weather statistics"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    stats = {}
    
    # Basic counts
    cursor.execute('SELECT COUNT(*) FROM weather_data')
    stats['total_records'] = cursor.fetchone()[0]
    
    cursor.execute('SELECT MIN(timestamp), MAX(timestamp) FROM weather_data')
    time_range = cursor.fetchone()
    stats['date_range'] = {'start': time_range[0], 'end': time_range[1]}
    
    # Temperature statistics
    cursor.execute('''
        SELECT 
            AVG(temperature_celsius) as avg_temp,
            MIN(temperature_celsius) as min_temp,
            MAX(temperature_celsius) as max_temp,
            AVG(temperature_fahrenheit) as avg_temp_f,
            MIN(temperature_fahrenheit) as min_temp_f,
            MAX(temperature_fahrenheit) as max_temp_f
        FROM weather_data
    ''')
    temp_stats = cursor.fetchone()
    stats['temperature'] = {
        'avg_celsius': temp_stats[0],
        'min_celsius': temp_stats[1],
        'max_celsius': temp_stats[2],
        'avg_fahrenheit': temp_stats[3],
        'min_fahrenheit': temp_stats[4],
        'max_fahrenheit': temp_stats[5]
    }
    
    # Humidity statistics
    cursor.execute('''
        SELECT 
            AVG(humidity) as avg_humidity,
            MIN(humidity) as min_humidity,
            MAX(humidity) as max_humidity
        FROM weather_data
    ''')
    humidity_stats = cursor.fetchone()
    stats['humidity'] = {
        'average': humidity_stats[0],
        'minimum': humidity_stats[1],
        'maximum': humidity_stats[2]
    }
    
    # Wind statistics
    cursor.execute('''
        SELECT 
            AVG(wind_speed_ms) as avg_wind_ms,
            MAX(wind_speed_ms) as max_wind_ms,
            AVG(wind_speed_mph) as avg_wind_mph,
            MAX(wind_speed_mph) as max_wind_mph
        FROM weather_data
    ''')
    wind_stats = cursor.fetchone()
    stats['wind'] = {
        'avg_speed_ms': wind_stats[0],
        'max_speed_ms': wind_stats[1],
        'avg_speed_mph': wind_stats[2],
        'max_speed_mph': wind_stats[3]
    }
    
    conn.close()
    return stats

def export_to_csv(filename=None):
    """Export all weather data to CSV"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/weather_export_{timestamp}.csv"
    
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query('SELECT * FROM weather_data ORDER BY timestamp DESC', conn)
    conn.close()
    
    df.to_csv(filename, index=False)
    print(f"✅ Weather data exported to {filename}")
    return filename

def clear_old_data(days_to_keep=30):
    """Clear weather data older than specified days"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        DELETE FROM weather_data 
        WHERE timestamp < datetime('now', '-{} days')
    '''.format(days_to_keep))
    
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    print(f"🗑️  Deleted {deleted_count} old weather records (older than {days_to_keep} days)")
    return deleted_count

def get_database_info():
    """Get database information and statistics"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get table info
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    # Get record count
    cursor.execute("SELECT COUNT(*) FROM weather_data")
    record_count = cursor.fetchone()[0]
    
    # Get database size
    db_size = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
    
    conn.close()
    
    return {
        'database_path': DB_PATH,
        'tables': [table[0] for table in tables],
        'total_records': record_count,
        'database_size_mb': round(db_size / (1024 * 1024), 2)
    }

if __name__ == "__main__":
    # Initialize database when run directly
    init_database()
    print("Database module ready!") 