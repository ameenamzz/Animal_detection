from flask import Blueprint, render_template, request, jsonify, current_app
from app.models import predict_footprint
import logging
import os
import google.generativeai as genai

logger = logging.getLogger(__name__)
main = Blueprint('main', __name__)

# Configure Gemini API (add your API key to config.py or environment variables)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or app.config.get('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/detector', methods=['GET', 'POST'])
def detector():
    if request.method == 'POST':
        try:
            if 'file' not in request.files:
                logger.error("No file part in request")
                return jsonify({'error': 'No file part'})
            
            file = request.files['file']
            if file.filename == '':
                logger.error("No selected file")
                return jsonify({'error': 'No selected file'})
            
            if file:
                logger.info(f"Processing file: {file.filename}")
                result = predict_footprint(file)
                return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error in detector route: {str(e)}")
            return jsonify({'error': 'Server error occurred'})
    
    return render_template('detector.html')

@main.route('/get_ai_help', methods=['POST'])
def get_ai_help():
    data = request.get_json()
    detections = data.get('detections', [])
    
    # Create enhanced prompt for Gemini
    prompt = "I've detected the following animal footprints:\n"
    for detection in detections:
        prompt += f"- {detection['species']} (confidence: {detection['confidence']})\n"
    
    prompt += """
Based on these detected animal footprints, please provide the following information in a well-formatted response:

1. **Danger Assessment**: On a scale of 1-5 (where 1 is harmless and 5 is extremely dangerous), how dangerous is this animal to humans? Explain your rating.

2. **Animal Description**: Provide a brief but informative description of the animal.

3. **Habitat & Diet**: Describe the typical habitat and diet of this animal.

4. **Safety Information**: If a person encounters this animal in the wild, what are the recommended safety protocols? Please provide specific, actionable advice for maintaining safety.

Format your response with clear headings and organize the information in a readable way.
"""
    
    try:
        # Configure the Gemini API
        genai.configure(api_key=current_app.config['GEMINI_API_KEY'])
        
        # Initialize Gemini model with proper model name
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt)
        
        # Format the response with markdown for better display
        formatted_response = response.text
        
        # Return formatted response
        return jsonify({
            "response": formatted_response,
            "success": True
        })
    except Exception as e:
        # Use current_app instead of app for logging
        current_app.logger.error(f"Error generating AI response: {str(e)}")
        return jsonify({
            "response": f"Sorry, I couldn't generate a response at this time. Error: {str(e)}",
            "success": False
        })
