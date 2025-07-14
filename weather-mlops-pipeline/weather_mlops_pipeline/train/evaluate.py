# weather_mlops_pipeline/train/evaluate.py
import pandas as pd
import pickle
import yaml
from sklearn.metrics import mean_squared_error

config = yaml.safe_load(open("config/config.yaml"))
CLEAN_PATH = config['data']['processed_path']
MODEL_PATH = config['model']['path']

def evaluate():
    df = pd.read_csv(CLEAN_PATH)
    
    # Check if we have enough data
    if len(df) < 1:
        print("Warning: Not enough data for evaluation.")
        return
    
    # Use comprehensive features for evaluation
    feature_columns = ['hour', 'humidity', 'wind_speed_ms', 'pressure_hpa', 'visibility_km']
    available_features = [col for col in feature_columns if col in df.columns]
    
    if len(available_features) < 2:
        print(f"Warning: Not enough features available. Using basic features.")
        available_features = ['hour', 'humidity', 'wind_speed_ms']
    
    X = df[available_features]
    y = df['temperature_celsius']  # Use Celsius for consistency
    
    # Check if model exists
    import os
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}. Please train the model first.")
        return
    
    model = pickle.load(open(MODEL_PATH, 'rb'))
    preds = model.predict(X)
    mse = mean_squared_error(y, preds)
    
    print(f"Evaluation Results:")
    print(f"Dataset size: {len(df)} samples")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"Root Mean Squared Error: {mse**0.5:.2f}")
    
    # Show some predictions vs actual
    print(f"\nSample predictions:")
    for i in range(min(3, len(df))):
        print(f"Actual: {y.iloc[i]:.1f}°C, Predicted: {preds[i]:.1f}°C")

if __name__ == '__main__':
    evaluate()


