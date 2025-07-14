"""
Airflow DAG definition for the Weather ML pipeline.
This file is robust to environments without Airflow installed.
"""

try:
from airflow import DAG
from airflow.operators.python import PythonOperator
except ImportError:
    DAG = None
    PythonOperator = None

from datetime import datetime
from weather_mlops_pipeline.ingest.fetch_weather import fetch_weather
from weather_mlops_pipeline.preprocess.clean_weather import clean_weather
from weather_mlops_pipeline.preprocess.feature_engineering import add_features
from weather_mlops_pipeline.train.train_model import train

if DAG and PythonOperator:
dag = DAG('weather_pipeline', start_date=datetime(2023, 1, 1), schedule_interval='@daily')

with dag:
    t1 = PythonOperator(task_id='fetch_weather', python_callable=fetch_weather)
    t2 = PythonOperator(task_id='clean_data', python_callable=clean_weather)
    t3 = PythonOperator(task_id='feature_engineering', python_callable=add_features)
    t4 = PythonOperator(task_id='train_model', python_callable=train)
        _ = t1 >> t2 >> t3 >> t4
