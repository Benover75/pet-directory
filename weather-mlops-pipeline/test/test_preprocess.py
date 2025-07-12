# tests/test_preprocess.py
def test_clean_output():
    from src.preprocess.clean_weather import clean_weather
    clean_weather()
    import os
    assert os.path.exists("data/processed/weather_clean.csv")
