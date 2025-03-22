import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    MODEL_PATH = 'updated_model/best.pt'
