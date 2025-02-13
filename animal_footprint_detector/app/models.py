from ultralytics import YOLO
from PIL import Image
import logging
import traceback
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load YOLO model
MODEL_PATH = "footprint_classification/yolov8_classification/weights/best.pt"

try:
    model = YOLO(MODEL_PATH)
    logger.info(f"Loaded YOLO model from {MODEL_PATH}")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}\n{traceback.format_exc()}")
    model = None

def predict_footprint(image_file):
    if model is None:
        logger.error("Model not loaded")
        return {"error": "Model not loaded"}

    try:
        # Log the image file details
        logger.info(f"Processing image: {image_file.filename}")
        
        # Open and process the image
        image = Image.open(image_file)
        logger.info(f"Image opened successfully. Size: {image.size}, Mode: {image.mode}")

        # Perform prediction
        results = model.predict(image, task='classify')
        logger.info("Prediction completed successfully")

        # Process results
        predictions = []
        for r in results:
            # Get probabilities
            probs = r.probs.data.cpu().numpy()
            
            # Get top prediction
            top_idx = np.argmax(probs)
            top_prob = float(probs[top_idx])
            top_class = str(r.names[top_idx])
            
            logger.info(f"Top prediction: {top_class} with confidence {top_prob:.2%}")
            
            return {
                "animal": top_class,
                "confidence": top_prob
            }

    except Exception as e:
        error_msg = f"Error processing image: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return {"error": f"Error processing image: {str(e)}"}
