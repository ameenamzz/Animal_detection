from ultralytics import YOLO
from PIL import Image
import logging
import traceback
import numpy as np
import io
import base64
import os
from pathlib import Path

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

        # Create a temporary directory for saving results if it doesn't exist
        save_dir = Path('runs/classify/predict')
        save_dir.mkdir(parents=True, exist_ok=True)

        # Perform prediction
        results = model.predict(image, task='classify', save=True)
        logger.info("Prediction completed successfully")

        # Get the path to the saved image
        save_path = Path('runs') / 'classify' / 'predict' / image_file.filename
        
        # Check if the file exists
        if not save_path.exists():
            logger.warning(f"Processed image not found at {save_path}, using original image")
            # If the processed image doesn't exist, use the original image
            output_image = image
        else:
            output_image = Image.open(save_path)

        # Convert the output image to base64 for sending to frontend
        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # Process results
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
                "confidence": top_prob,
                "processed_image": img_str
            }

    except Exception as e:
        error_msg = f"Error processing image: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return {"error": f"Error processing image: {str(e)}"}
