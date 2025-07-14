# run_pipeline.py
from weather_mlops_pipeline.ingest.fetch_weather import fetch_weather
from weather_mlops_pipeline.preprocess.clean_weather import clean_weather
from weather_mlops_pipeline.preprocess.feature_engineering import add_features
from weather_mlops_pipeline.train.train_model import train
from weather_mlops_pipeline.train.evaluate import evaluate

fetch_weather()
clean_weather()
add_features()
train()
evaluate()
