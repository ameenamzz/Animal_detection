from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import logging
import traceback
import numpy as np
import io
import base64
import os
from pathlib import Path
import cv2
import random
import colorsys

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define colors for different classes (for bounding boxes)
# Now using the same color algorithm as the frontend
def get_color(animal_name):
    """Generate a color for bounding boxes based on animal type and confidence"""
    # Generate vibrant colors with better visibility
    animals_colors = {
        "bear": (0, 50, 255),    # Red (BGR format)
        "cat": (0, 200, 0),      # Green 
        "dog": (255, 165, 0),    # Blue
        "fox": (0, 215, 255),    # Yellow
        "wolf": (128, 0, 128),   # Purple
        "deer": (255, 0, 255),   # Pink
        "rabbit": (0, 128, 128), # Brown
        "mongoose": (255, 0, 0)  # Blue
    }
    
    # Convert animal name to lowercase
    animal_lower = animal_name.lower()
    
    # Return predefined color if available, otherwise use the original hash algorithm
    if animal_lower in animals_colors:
        return animals_colors[animal_lower]
    
    # Original hash-based algorithm as fallback
    hash_value = 0
    for i, char in enumerate(animal_name):
        hash_value = ord(char) + ((hash_value << 5) - hash_value)
    
    h = abs(hash_value) % 360
    s = 80/100  # 80%
    l = 65/100  # 65%
    
    # Convert HSL to RGB
    r, g, b = colorsys.hls_to_rgb(h/360, l, s)
    # OpenCV uses BGR
    return (int(b*255), int(g*255), int(r*255))

# Load YOLO model
MODEL_PATH = "updated_model/best.pt"

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
        # Check if the model is a classification or detection model
        model_task = getattr(model, 'task', 'classify')  # Default to classify if task not found
        
        if model_task == 'detect':
            # For detection models, set conf threshold to control sensitivity
            conf_threshold = 0.25  # Minimum confidence threshold for detections
            
            # Don't save automatically, we'll create our own visualization
            results = model.predict(image, conf=conf_threshold, save=False)
            
            # Get the first result (should be only one image)
            if not results or len(results) == 0:
                # Convert original image to base64
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                
                return {
                    "detections": [{"animal": "Unknown", "confidence": 0.0}],
                    "processed_image": img_str,
                    "count": 0
                }
                
            r = results[0]
            
            # If no objects detected, return unknown
            if len(r.boxes) == 0:
                # Convert original image to base64
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                
                return {
                    "detections": [{"animal": "Unknown", "confidence": 0.0}],
                    "processed_image": img_str,
                    "count": 0
                }
            
            # Create a copy of the image to draw on
            output_image = image.copy()
            # Convert to numpy array for OpenCV processing (better drawing capabilities)
            img_np = np.array(output_image)
            
            # Convert RGB to BGR for OpenCV
            if len(img_np.shape) == 3 and img_np.shape[2] == 3:
                img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
            # Get all detections
            detections = []
            for i, box in enumerate(r.boxes):
                # Get box data
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = str(r.names[class_id])
                
                # Get bounding box coordinates (xmin, ymin, xmax, ymax)
                xyxy = box.xyxy[0].tolist()  # Convert to list for easier handling
                x1, y1, x2, y2 = map(int, xyxy)  # Convert to integers
                
                # Add to detections list
                detections.append({
                    "animal": class_name,
                    "confidence": confidence,
                    "box": [x1, y1, x2, y2]
                })
                
                # Get the same color as will be used in the frontend
                color = get_color(class_name)
                # Convert PIL color tuple (RGB) to OpenCV color (BGR)
                color_cv = (color[2], color[1], color[0])
                
                # Draw a thicker box with OpenCV
                box_thickness = 5
                cv2.rectangle(img_np, (x1, y1), (x2, y2), color_cv, box_thickness)
                
                # Prepare label text
                label = f"{class_name}: {confidence:.2f}"
                
                # Draw a thicker colored border instead of filled rectangle
                cv2.rectangle(
                    img_np, 
                    (x1, y1), 
                    (x2, y2), 
                    color,
                    3  # border thickness
                )
                
                # Add a colored background for the label
                text_width, text_height = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2
                )[0]
                label_y = y1 - 10 if y1 - 10 > text_height else y1 + 30
                
                # Draw label background with same color as border but with transparency
                overlay = img_np.copy()
                cv2.rectangle(
                    overlay, 
                    (x1, label_y - text_height - 10), 
                    (x1 + text_width + 10, label_y + 10), 
                    color, 
                    -1  # filled rectangle
                )
                # Apply transparency
                alpha = 0.7
                cv2.addWeighted(overlay, alpha, img_np, 1 - alpha, 0, img_np)
                
                # Draw label text with white color for better contrast
                cv2.putText(
                    img_np, 
                    label, 
                    (x1 + 5, label_y), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.8, 
                    (255, 255, 255), 
                    2
                )
            
            # Sort detections by confidence (highest first)
            detections = sorted(detections, key=lambda x: x["confidence"], reverse=True)
            
            # Log top detection
            if len(detections) > 0:
                top_detection = detections[0]
                logger.info(f"Top detection: {top_detection['animal']} with confidence {top_detection['confidence']:.2%}")
            
            # Convert back to PIL Image
            if len(img_np.shape) == 3 and img_np.shape[2] == 3:
                img_np = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
            output_image = Image.fromarray(img_np)
            
            # Convert processed image to base64
            buffered = io.BytesIO()
            output_image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            # Return all detections and the processed image
            return {
                "detections": detections,
                "processed_image": img_str,
                "count": len(detections)
            }
        else:
            # Handle classification model
            results = model.predict(image, task='classify', save=True)
            
            # Get the path to the saved image
            save_path = Path('runs') / (model_task if model_task in ('classify', 'detect') else 'classify') / 'predict' / image_file.filename
            
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
            
            # Handle the result
            for r in results:
                # Get probabilities
                probs = r.probs.data.cpu().numpy()
                
                # Get all predictions, sorted by confidence
                indices = np.argsort(probs)[::-1]
                
                detections = []
                for idx in indices[:5]:  # Get top 5 predictions
                    if probs[idx] > 0.01:  # Minimum threshold
                        detections.append({
                            "animal": str(r.names[idx]),
                            "confidence": float(probs[idx])
                        })
                
                return {
                    "detections": detections,
                    "processed_image": img_str,
                    "count": len(detections)
                }

            # If no valid results
            return {
                "detections": [{"animal": "Unknown", "confidence": 0.0}],
                "processed_image": img_str,
                "count": 0
            }

    except Exception as e:
        error_msg = f"Error processing image: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return {"error": f"Error processing image: {str(e)}"}
