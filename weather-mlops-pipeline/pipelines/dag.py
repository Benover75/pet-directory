# pipelines/dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from src.ingest.fetch_weather import fetch_weather
from src.preprocess.clean_weather import clean_weather
from src.preprocess.feature_engineering import add_features
from src.train.train_model import train

dag = DAG('weather_pipeline', start_date=datetime(2023, 1, 1), schedule_interval='@daily')

with dag:
    t1 = PythonOperator(task_id='fetch_weather', python_callable=fetch_weather)
    t2 = PythonOperator(task_id='clean_data', python_callable=clean_weather)
    t3 = PythonOperator(task_id='feature_engineering', python_callable=add_features)
    t4 = PythonOperator(task_id='train_model', python_callable=train)

    t1 >> t2 >> t3 >> t4
