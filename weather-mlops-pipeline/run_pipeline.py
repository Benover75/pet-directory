# run_pipeline.py
from src.ingest.fetch_weather import fetch_weather
from src.preprocess.clean_weather import clean_weather
from src.preprocess.feature_engineering import add_features
from src.train.train_model import train
from src.train.evaluate import evaluate

fetch_weather()
clean_weather()
add_features()
train()
evaluate()
