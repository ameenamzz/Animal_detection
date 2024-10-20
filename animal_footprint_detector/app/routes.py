from flask import Blueprint, render_template, request, jsonify
from app.models import predict_footprint

main = Blueprint('main', __name__)

@main.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        
        if file:
            result = predict_footprint(file)
            return jsonify(result)
    
    return render_template('index.html')
