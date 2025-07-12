# tests/test_ingest.py
def test_api_response():
    from src.ingest.fetch_weather import fetch_weather
    assert fetch_weather() is None
