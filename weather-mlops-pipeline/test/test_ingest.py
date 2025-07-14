# tests/test_ingest.py
def test_api_response():
    from weather_mlops_pipeline.ingest.fetch_weather import fetch_weather
    assert fetch_weather() is None
