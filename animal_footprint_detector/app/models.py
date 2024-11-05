from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch
import logging
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use a pre-trained ViT model
MODEL_NAME = "google/vit-base-patch16-224"

try:
    model = ViTForImageClassification.from_pretrained(MODEL_NAME)
    processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
    logger.info(f"Loaded model and processor from {MODEL_NAME}")
except Exception as e:
    logger.error(f"Error loading model and processor: {str(e)}\n{traceback.format_exc()}")
    model = None
    processor = None

def predict_footprint(image_file):
    if model is None or processor is None:
        logger.error("Model or processor not loaded")
        return {"error": "Model or processor not loaded"}

    try:
        # Log the image file details
        logger.info(f"Processing image: {image_file.filename}")
        
        # Open and verify the image
        image = Image.open(image_file)
        logger.info(f"Image opened successfully. Size: {image.size}, Mode: {image.mode}")
        
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")
            logger.info("Converted image to RGB mode")

        # Process image
        inputs = processor(images=image, return_tensors="pt")
        logger.info("Image processed successfully")
        
        # Get prediction
        with torch.no_grad():
            outputs = model(**inputs)
        
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        confidence = logits.softmax(dim=-1)[0][predicted_class_idx].item()
        
        predicted_animal = model.config.id2label[predicted_class_idx]
        logger.info(f"Prediction successful: {predicted_animal} with confidence {confidence:.2%}")
        
        return {
            "animal": predicted_animal,
            "confidence": confidence
        }
    except Exception as e:
        error_msg = f"Error processing image: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return {"error": f"Error processing image: {str(e)}"}
