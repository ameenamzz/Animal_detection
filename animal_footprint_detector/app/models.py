from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch
import logging

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
    logger.error(f"Error loading model and processor: {e}")
    model = None
    processor = None

def predict_footprint(image_file):
    if model is None or processor is None:
        return {"error": "Model or processor not loaded"}

    try:
        image = Image.open(image_file).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        
        return {
            "animal": model.config.id2label[predicted_class_idx],
            "confidence": logits.softmax(dim=-1)[0][predicted_class_idx].item()
        }
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        return {"error": "Error processing image"}
