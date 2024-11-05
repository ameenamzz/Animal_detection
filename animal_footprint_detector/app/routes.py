from flask import Blueprint, render_template, request, jsonify
from app.models import predict_footprint
import logging

logger = logging.getLogger(__name__)
main = Blueprint('main', __name__)

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
