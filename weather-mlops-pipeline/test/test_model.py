# tests/test_model.py
def test_model_file():
    from src.train.train_model import train
    train()
    import os
    assert os.path.exists("data/models/weather_model.pkl")
