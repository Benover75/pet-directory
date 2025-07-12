# 🌤️ Weather MLOps Pipeline - Cranston, RI (02920)

A comprehensive weather data collection, analysis, and prediction pipeline for Cranston, Rhode Island.

## 🚀 Features

### 📊 **Comprehensive Weather Data Collection**
- **Temperature**: Current, feels like, min/max in both Celsius & Fahrenheit
- **Atmospheric**: Humidity, pressure (hPa & inHg), visibility (km & miles)
- **Wind**: Speed (m/s, mph, km/h) and direction
- **Conditions**: Weather description, cloud coverage, sunrise/sunset times
- **Location**: Precise coordinates for Cranston, RI (02920)

### 🤖 **Advanced Machine Learning**
- Multi-feature prediction model (temperature, humidity, wind, pressure, visibility)
- Real-time model training and evaluation
- Both Celsius and Fahrenheit temperature predictions
- Comprehensive model performance metrics

### 🌐 **API Endpoints**
- `/predict` - Temperature prediction with multiple features
- `/weather_summary` - Real-time comprehensive weather data
- `/docs` - Interactive API documentation

### 📈 **Data Analytics**
- Weather dashboard with statistics and trends
- Historical data analysis
- Real-time data visualization
- Comprehensive weather reporting

## 🛠️ Installation & Setup

> **Security Note:**
> - This project is public. **Never commit real API keys or secrets to the repository.**
> - Set your own OpenWeather API key in `config/config.yaml` (replace `your-api-key-here`) or use an environment variable.
> - For production, use environment variables or a private config file not tracked by git.

### Prerequisites
- Python 3.8+
- OpenWeather API key (free at [openweathermap.org](https://openweathermap.org/api))

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd weather-mlops-pipeline

# Install dependencies
pip install -r requirements.txt

# Run the complete pipeline
python run_pipeline.py
```

## 🎯 Usage

### **Run the Complete Pipeline (Recommended)**
```bash
python run_pipeline.py
```

### **Option 2: Individual Components**
```bash
# Collect weather data (100 samples, 30-second intervals)
python -c "from src.ingest.fetch_weather import fetch_multiple_samples; fetch_multiple_samples()"

# View weather dashboard
python weather_dashboard.py

# Start API server
uvicorn src.deploy.app:app --reload
```

### **Option 3: API Usage**
```bash
# Get weather prediction
curl "http://localhost:8000/predict?hour=14&humidity=65&wind_speed=3.2&pressure=1013&visibility=10"

# Get current weather summary
curl "http://localhost:8000/weather_summary"
```

## 📁 Project Structure

```
weather-mlops-pipeline/
├── config/
│   └── config.yaml          # Configuration settings
├── data/
│   ├── raw/                 # Raw weather data (JSON)
│   ├── processed/           # Cleaned data (CSV)
│   └── models/              # Trained models
├── src/
│   ├── ingest/
│   │   └── fetch_weather.py # Weather data collection
│   ├── preprocess/
│   │   ├── clean_weather.py # Data cleaning
│   │   └── feature_engineering.py # Feature extraction
│   ├── train/
│   │   ├── train_model.py   # Model training
│   │   └── evaluate.py      # Model evaluation
│   ├── deploy/
│   │   └── app.py          # FastAPI application
│   └── utils/
│       ├── helpers.py       # Utility functions
│       └── logger.py        # Logging utilities
├── pipelines/
│   └── dag.py              # Airflow DAG
├── test/                    # Unit tests
├── weather_dashboard.py     # Weather dashboard
├── run_pipeline.py          # Main pipeline script
└── requirements.txt         # Python dependencies
```

## 🌡️ Weather Data Collected

| Category | Metrics | Units |
|----------|---------|-------|
| **Temperature** | Current, Feels Like, Min, Max | °C, °F |
| **Atmospheric** | Humidity, Pressure | %, hPa, inHg |
| **Wind** | Speed, Direction | m/s, mph, km/h, degrees |
| **Visibility** | Distance | km, miles |
| **Conditions** | Description, Cloud Coverage | text, % |
| **Time** | Sunrise, Sunset | HH:MM:SS |

## 🤖 Machine Learning Model

- **Algorithm**: Linear Regression
- **Features**: Hour, Humidity, Wind Speed, Pressure, Visibility
- **Target**: Temperature (Celsius & Fahrenheit)
- **Evaluation**: Mean Squared Error (MSE), Root MSE
- **Output**: Temperature predictions in both units

## 🔧 Configuration

Edit `config/config.yaml` to customize:
- API settings and location
- Data collection parameters
- Model configuration
- File paths

## 📊 API Endpoints

### GET `/predict`
Predict temperature based on weather conditions.

**Parameters:**
- `hour` (int): Hour of day (0-23)
- `humidity` (float): Humidity percentage
- `wind_speed` (float): Wind speed in m/s
- `pressure` (float, optional): Pressure in hPa
- `visibility` (float, optional): Visibility in km

**Response:**
```json
{
  "predicted_temperature_celsius": 22.5,
  "predicted_temperature_fahrenheit": 72.5,
  "features_used": 5,
  "location": "Cranston, RI (02920)"
}
```

### GET `/weather_summary`
Get comprehensive current weather data.

**Response:**
```json
{
  "location": "Cranston, RI (02920)",
  "timestamp": "2025-07-11T23:54:40.283241",
  "temperature": {
    "celsius": 22.36,
    "fahrenheit": 72.25
  },
  "feels_like": {
    "celsius": 22.95,
    "fahrenheit": 73.31
  },
  "humidity": 88,
  "wind": {
    "speed_ms": 4.63,
    "speed_mph": 10.35,
    "direction": 160
  },
  "pressure": {
    "hpa": 1017,
    "inhg": 30.03
  },
  "visibility": {
    "km": 10.0,
    "miles": 6.21
  },
  "conditions": "broken clouds",
  "sunrise": "06:41:09",
  "sunset": "20:21:13"
}
```

## 🧪 Testing

```bash
# Run all tests
python -m pytest test/

# Run specific test
python -m pytest test/test_ingest.py
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker build -t weather-mlops .
docker run -p 8000:8000 weather-mlops
```

### Production Deployment
```bash
# Start production server
uvicorn src.deploy.app:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📈 Monitoring & Analytics

- **Weather Dashboard**: `python weather_dashboard.py`
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API documentation at http://localhost:8000/docs
- Review the weather dashboard: `python weather_dashboard.py`
- Check the logs in the console output

---

**🌤️ Happy Weather Forecasting!** 🌤️
