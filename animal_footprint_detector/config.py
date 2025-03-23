import os
from pathlib import Path

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    BASE_DIR = Path(__file__).parent
    MODEL_PATH = str(BASE_DIR / 'updated_model' / 'best.pt')
    
    # Add this method to help with debugging
    @classmethod
    def debug_info(cls):
        model_path = Path(cls.MODEL_PATH)
        return {
            "model_path": cls.MODEL_PATH,
            "model_exists": model_path.exists(),
            "base_dir": str(cls.BASE_DIR),
            "cwd": os.getcwd()
        }
