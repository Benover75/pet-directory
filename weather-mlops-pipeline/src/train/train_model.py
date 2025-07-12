# src/train/train_model.py
import pandas as pd
import pickle
import yaml
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

config = yaml.safe_load(open("config/config.yaml"))
CLEAN_PATH = config['data']['processed_path']
MODEL_PATH = config['model']['path']

def train():
    df = pd.read_csv(CLEAN_PATH)
    
    # Check if we have enough data
    if len(df) < 2:
        print("Warning: Not enough data for training. Need at least 2 samples.")
        return
    
    # Use comprehensive features for better prediction
    feature_columns = ['hour', 'humidity', 'wind_speed_ms', 'pressure_hpa', 'visibility_km']
    available_features = [col for col in feature_columns if col in df.columns]
    
    if len(available_features) < 2:
        print(f"Warning: Not enough features available. Using basic features.")
        available_features = ['hour', 'humidity', 'wind_speed_ms']
    
    X = df[available_features]
    y = df['temperature_celsius']
    mask = X.notnull().all(axis=1)  & y.notnull() # Use Celsius for consistency
    X = X[mask]
    y = y[mask]
    
    # Use smaller test size if we have limited data
    test_size = min(0.2, 1.0 / len(df)) if len(df) > 2 else 0.5
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    model = LinearRegression().fit(X_train, y_train)
    
    # Create models directory if it doesn't exist
    import os
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"Model trained successfully with {len(X_train)} training samples")
    print(f"Model saved to {MODEL_PATH}")

if __name__ == '__main__':
    train()



