# src/preprocess/feature_engineeering.py
import pandas as pd
import yaml
from datetime import datetime

config = yaml.safe_load(open("config/config.yaml"))
CLEAN_PATH = config['data']['processed_path']

def add_features():
    """
    Add engineered features to the cleaned weather data.
    Currently extracts hour from timestamp for time-based modeling.
    """
    # Read the cleaned data
    df = pd.read_csv(CLEAN_PATH)
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Extract hour from timestamp
    df['hour'] = df['timestamp'].dt.hour
    
    # Save the enhanced dataset
    df.to_csv(CLEAN_PATH, index=False)
    print(f"Features added successfully. Dataset saved to {CLEAN_PATH}")
    print(f"Added features: hour (0-23)")
    print(f"Dataset shape: {df.shape}")

if __name__ == "__main__":
    add_features()
