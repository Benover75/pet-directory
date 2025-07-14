import kfp
from kfp import dsl

@dsl.component(base_image="python:3.11-slim", packages_to_install=["pandas", "pyyaml", "requests"])
def fetch_weather_component() -> str:
    import sys, os
    sys.path.append("/app")
    from weather_mlops_pipeline.ingest.fetch_weather import fetch_weather
    fetch_weather()
    return "fetch_completed"

@dsl.component(base_image="python:3.11-slim", packages_to_install=["pandas", "numpy", "pyyaml"])
def clean_weather_component(fetch_task: str) -> str:
    import sys, os
    sys.path.append("/app")
    from weather_mlops_pipeline.preprocess.clean_weather import clean_weather
    clean_weather()
    return "clean_completed"

@dsl.component(base_image="python:3.11-slim", packages_to_install=["pandas", "numpy", "scikit-learn", "pyyaml"])
def feature_engineering_component(clean_task: str) -> str:
    import sys, os
    sys.path.append("/app")
    from weather_mlops_pipeline.preprocess.feature_engineering import add_features
    add_features()
    return "features_completed"

@dsl.component(base_image="python:3.11-slim", packages_to_install=["pandas", "numpy", "scikit-learn", "joblib", "pyyaml"])
def train_model_component(features_task: str) -> str:
    import sys, os
    sys.path.append("/app")
    from weather_mlops_pipeline.train.train_model import train
    train()
    return "train_completed"

@dsl.component(base_image="python:3.11-slim", packages_to_install=["pandas", "numpy", "scikit-learn", "matplotlib", "seaborn", "pyyaml"])
def evaluate_model_component(train_task: str) -> str:
    import sys, os
    sys.path.append("/app")
    from weather_mlops_pipeline.train.evaluate import evaluate
    evaluate()
    return "evaluate_completed"

@dsl.pipeline(
    name="Weather ML Pipeline",
    description="A comprehensive Kubeflow pipeline for weather data collection, preprocessing, and ML model training"
)
def weather_ml_pipeline():
    fetch = fetch_weather_component()
    clean = clean_weather_component(fetch_task=fetch.output)
    features = feature_engineering_component(clean_task=clean.output)
    train = train_model_component(features_task=features.output)
    evaluate = evaluate_model_component(train_task=train.output)

if __name__ == "__main__":
    kfp.compiler.Compiler().compile(weather_ml_pipeline, "weather_ml_pipeline.yaml") 