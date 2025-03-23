import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

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

    # Ensure GEMINI_API_KEY is properly loaded from environment
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    # Add a default response for when API isn't working
    DEFAULT_AI_RESPONSE = """
    I couldn't access the AI at the moment. 
    
    Here's some general information about animal footprints:
    
    Animal footprints, or tracks, provide valuable information about wildlife presence and behavior. They can help identify:
    - Which species are in an area
    - Movement patterns and habitat use
    - Population density
    - Predator-prey relationships
    
    Tracking animals through their footprints is an ancient skill still used by wildlife researchers, hunters, and nature enthusiasts today.
    """
