# src/deploy/app.py
from fastapi import FastAPI, HTTPException
import pickle
import yaml
from src.utils.database import (
    get_latest_weather, get_weather_history, get_weather_statistics,
    get_database_info, export_to_csv, clear_old_data
)

config = yaml.safe_load(open("config/config.yaml"))
MODEL_PATH = config['model']['path']

app = FastAPI(
    title="Weather MLOps API",
    description="Comprehensive weather data collection and prediction API for Cranston, RI",
    version="2.0.0"
)

# Load model if it exists
try:
    model = pickle.load(open(MODEL_PATH, 'rb'))
except FileNotFoundError:
    model = None
    print("⚠️  Model not found. Train the model first to enable predictions.")

@app.get("/predict")
def predict(
    hour: int, 
    humidity: float, 
    wind_speed: float,
    pressure: float = 0.0,
    visibility: float = 0.0
):
    """Predict temperature based on weather conditions"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available. Please train the model first.")
    
    # Use available features
    features = [hour, humidity, wind_speed]
    if pressure > 0:
        features.append(pressure)
    if visibility > 0:
        features.append(visibility)
    
    prediction_celsius = model.predict([features])[0]
    prediction_fahrenheit = (prediction_celsius * 9/5) + 32
    
    return {
        "predicted_temperature_celsius": round(prediction_celsius, 1),
        "predicted_temperature_fahrenheit": round(prediction_fahrenheit, 1),
        "features_used": len(features),
        "location": "Cranston, RI (02920)"
    }

@app.get("/weather_summary")
def weather_summary():
    """Get current weather summary for Cranston, RI"""
    try:
        from src.ingest.fetch_weather import fetch_weather
        weather_data = fetch_weather()
        
        return {
            "location": "Cranston, RI (02920)",
            "timestamp": weather_data.get("timestamp"),
            "temperature": {
                "celsius": weather_data["main"].get("temp_celsius"),
                "fahrenheit": weather_data["main"].get("temp_fahrenheit")
            },
            "feels_like": {
                "celsius": weather_data["main"].get("feels_like_celsius"),
                "fahrenheit": weather_data["main"].get("feels_like_fahrenheit")
            },
            "humidity": weather_data["main"].get("humidity"),
            "wind": {
                "speed_ms": weather_data["wind"].get("speed"),
                "speed_mph": weather_data["wind"].get("speed_mph"),
                "direction": weather_data["wind"].get("deg")
            },
            "pressure": {
                "hpa": weather_data["main"].get("pressure"),
                "inhg": weather_data["main"].get("pressure_inhg")
            },
            "visibility": {
                "km": weather_data.get("visibility_km"),
                "miles": weather_data.get("visibility_mi")
            },
            "conditions": weather_data.get("weather_description"),
            "sunrise": weather_data["sys"].get("sunrise_time"),
            "sunset": weather_data["sys"].get("sunset_time")
        }
    except Exception as e:
        return {"error": f"Failed to fetch weather data: {str(e)}"}

@app.get("/database/info")
def database_info():
    """Get database information and statistics"""
    return get_database_info()

@app.get("/database/latest")
def get_latest():
    """Get the most recent weather data from database"""
    latest = get_latest_weather()
    if latest is None:
        raise HTTPException(status_code=404, detail="No weather data found in database")
    return latest

@app.get("/database/history")
def get_history(limit: int = 100):
    """Get weather history from database"""
    if limit > 1000:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 1000 records")
    
    df = get_weather_history(limit)
    return {
        "records": df.to_dict('records'),
        "total_records": len(df),
        "limit": limit
    }

@app.get("/database/statistics")
def get_statistics():
    """Get comprehensive weather statistics from database"""
    return get_weather_statistics()

@app.post("/database/export")
def export_data():
    """Export all weather data to CSV"""
    try:
        filename = export_to_csv()
        return {
            "message": "Data exported successfully",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.delete("/database/cleanup")
def cleanup_old_data(days_to_keep: int = 30):
    """Clean up old weather data"""
    if days_to_keep < 1:
        raise HTTPException(status_code=400, detail="Days to keep must be at least 1")
    
    deleted_count = clear_old_data(days_to_keep)
    return {
        "message": f"Cleanup completed",
        "deleted_records": deleted_count,
        "days_kept": days_to_keep
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    db_info = get_database_info()
    return {
        "status": "healthy",
        "database": {
            "connected": True,
            "records": db_info['total_records'],
            "size_mb": db_info['database_size_mb']
        },
        "model_loaded": model is not None,
        "location": "Cranston, RI (02920)"
    }
