import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    MODEL_PATH = 'path/to/your/fine-tuned/model'
