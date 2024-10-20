# AI Animal Footprint Detector

This project is an AI-powered web application that detects and identifies animal footprints from uploaded images. It uses a machine learning model to analyze the footprint and provides the predicted animal along with a confidence score.

## Features

- Upload image of animal footprints
- AI-powered footprint detection and animal identification
- Interactive 3D particle animation background
- Responsive design with a dark theme

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Python 3.7+
- pip (Python package manager)
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/animal_footprint_detector.git
   cd animal_footprint_detector
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Start the Flask development server:
   ```
   python run.py
   ```

2. Open a web browser and navigate to `http://localhost:5000`

3. Upload an image of an animal footprint and click "Detect Footprint"

4. View the results, including the predicted animal and confidence score

## Project Structure

- `app/`: Main application directory
  - `static/`: Static files (CSS, JavaScript)
  - `templates/`: HTML templates
  - `__init__.py`: Flask application initialization
  - `routes.py`: Flask routes
- `models/`: Machine learning model files
- `run.py`: Script to run the Flask application


## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - The web framework used
- [Three.js](https://threejs.org/) - 3D library for creating the particle animation
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library
