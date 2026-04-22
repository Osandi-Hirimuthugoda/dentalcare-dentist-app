"""
Flask API for Dental Disease Detection Model
Provides REST API endpoints for teeth scan image analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import torch
from PIL import Image
import io
import base64
from pathlib import Path
from inference import DentalDiseasePredictor

# Configuration
MODEL_PATH = 'model_weights.pth'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global predictor instance
predictor = None


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_model():
    """Load the model on startup"""
    global predictor
    try:
        if os.path.exists(MODEL_PATH):
            print(f"Model loaded from: {MODEL_PATH}")
            predictor = DentalDiseasePredictor(MODEL_PATH)
            print("Model loaded successfully!")
            return True
        else:
            print(f"❌ Model file not found: {MODEL_PATH}")
            return False
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor is not None,
        'model_exists': os.path.exists(MODEL_PATH),
        'device': str(predictor.device) if predictor else 'N/A'
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict dental disease from uploaded image
    
    Request:
        - file: Image file (multipart/form-data)
        OR
        - image: Base64 encoded image (JSON)
    
    Response:
        {
            "success": true,
            "prediction": "gingivitis",
            "disease_name": "Gingivitis",
            "confidence": 95.5,
            "class_index": 2,
            "all_probabilities": {...}
        }
    """
    try:
        # Check if model is loaded
        if predictor is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Please check server logs.'
            }), 500
        
        # Get image from request
        image = None
        
        # Option 1: File upload
        if 'file' in request.files:
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No file selected'
                }), 400
            
            if not allowed_file(file.filename):
                return jsonify({
                    'success': False,
                    'error': f'Invalid file type. Allowed: {ALLOWED_EXTENSIONS}'
                }), 400
            
            # Read image from file
            image = Image.open(file.stream).convert('RGB')
        
        # Option 2: Base64 encoded image
        elif request.is_json and 'image' in request.json:
            image_data = request.json['image']
            
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        else:
            return jsonify({
                'success': False,
                'error': 'No image provided. Send as file or base64 encoded.'
            }), 400
        
        # Run prediction
        result = predictor.predict(image, return_probabilities=True)
        
        if 'error' in result:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
        
        # Format response
        response = {
            'success': True,
            'prediction': result['predicted_class'],
            'disease_name': result['predicted_class'].capitalize(),
            'confidence': result['confidence'],
            'class_index': result['class_index']
        }
        
        if 'all_probabilities' in result:
            response['all_probabilities'] = result['all_probabilities']
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/classes', methods=['GET'])
def get_classes():
    """Get list of disease classes"""
    if predictor is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'success': True,
        'classes': predictor.classes,
        'num_classes': len(predictor.classes)
    })


@app.route('/', methods=['GET'])
def index():
    """API information endpoint"""
    return jsonify({
        'name': 'Dental Disease Detection API',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/predict': 'POST - Predict disease from image',
            '/classes': 'GET - Get list of disease classes'
        },
        'model_loaded': predictor is not None
    })


if __name__ == '__main__':
    print("=" * 60)
    print("DENTAL DISEASE DETECTION API")
    print("=" * 60)
    
    # Load model on startup
    model_loaded = load_model()
    
    if not model_loaded:
      print("\nWARNING: Model not loaded!")
      print("   The API will start but predictions will fail.")
      print(f"   Please ensure {MODEL_PATH} exists in this directory.")
    
    print("\nStarting Flask API server...")
    print("   URL: http://localhost:5000")
    print("   Endpoints:")
    print("      GET  /health  - Health check")
    print("      POST /predict - Predict disease")
    print("      GET  /classes - Get disease classes")
    print("\n   Press Ctrl+C to stop")
    print("=" * 60 + "\n")
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)
