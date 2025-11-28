"""
Python Flask service for CNN model inference
This service handles image preprocessing and model prediction for the trained PyTorch EfficientNet-B3 model
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import io
import os
import sys
import json
import torch

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

# Import model loader
from model_loader import (
    load_trained_model,
    preprocess_image_for_model,
    predict_with_model
)

app = Flask(__name__)
CORS(app)

# Model paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'oral_cancer_model')
MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_masked.pth')
CLASS_LABELS_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'class_labels.json')

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"🔧 Using device: {device}")

# Load model (lazy loading)
model = None
class_labels = None

def load_model():
    """Load the trained PyTorch CNN model"""
    global model, class_labels
    
    if model is not None:
        return model
    
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"❌ Model file not found at {MODEL_PATH}")
            print(f"   Please place your trained model (best_model_masked.pth) in:")
            print(f"   {MODEL_DIR}/")
            return None
        
        # Load PyTorch model
        print(f"📦 Loading PyTorch model from {MODEL_PATH}...")
        model = load_trained_model(MODEL_PATH, device=device)
        print(f"✅ Model loaded successfully on {device}")
        
        # Load class labels - MUST match the 5 classes from training
        if os.path.exists(CLASS_LABELS_PATH):
            with open(CLASS_LABELS_PATH, 'r') as f:
                class_labels = json.load(f)
            print(f"✅ Loaded class labels from file: {class_labels}")
        else:
            # Default class labels matching the training - MUST match training order
            # These are the 5 classes: calculus, cancers, gingivitis, ulcers, olp
            class_labels = {
                '0': 'calculus',
                '1': 'cancers',
                '2': 'gingivitis',
                '3': 'ulcers',
                '4': 'olp'
            }
            print(f"⚠️  Using default class labels: {class_labels}")
            print(f"   Class mapping:")
            print(f"     0 -> calculus")
            print(f"     1 -> cancers")
            print(f"     2 -> gingivitis")
            print(f"     3 -> ulcers")
            print(f"     4 -> olp")
            print(f"   ⚠️  Make sure these match your training exactly!")
        
        # Verify we have exactly 5 classes
        if len(class_labels) != 5:
            print(f"❌ ERROR: Expected 5 classes, got {len(class_labels)}")
            raise ValueError(f"Model expects 5 classes, but class_labels has {len(class_labels)} entries")
        
        # Verify all 5 expected classes are present
        expected_class_names = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
        actual_class_names = list(class_labels.values())
        for expected in expected_class_names:
            if expected not in actual_class_names:
                print(f"❌ ERROR: Missing class '{expected}' in class_labels!")
                print(f"   Expected: {expected_class_names}")
                print(f"   Got: {actual_class_names}")
                raise ValueError(f"Missing class '{expected}' in class_labels")
        
        print(f"✅ Verified: All 5 classes present in class_labels")
        
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None

def format_results(predictions, class_labels):
    """
    Format model predictions into structured results
    
    This function takes the model's raw prediction output and:
    1. Gets the class with highest probability (model's detection)
    2. Returns that class name directly from the model output
    3. Maps it to disease name for display
    
    NO THRESHOLDS OR FILTERING - Uses model output directly
    
    Args:
        predictions: NumPy array of prediction probabilities from model (5 classes)
        class_labels: Dictionary mapping class indices to class names
        
    Returns:
        Dictionary with detectedConditions containing the detected class from model
    """
    # Map class indices to class names
    # class_labels maps: '0'->'calculus', '1'->'cancers', '2'->'gingivitis', '3'->'ulcers', '4'->'olp'
    class_names = {int(k): v for k, v in class_labels.items()}
    
    # Verify predictions array has 5 values (one for each class)
    if len(predictions) != 5:
        print(f"❌ ERROR: Model should return 5 predictions (one per class), got {len(predictions)}")
        raise ValueError(f"Expected 5 predictions, got {len(predictions)}")
    
    # Get the class with highest probability - THIS IS THE MODEL'S DETECTION
    # No thresholds, no filtering - just use what the model says
    top_idx = np.argmax(predictions)  # Model's detected class index (0-4)
    top_class_name = class_names.get(top_idx, f'Class_{top_idx}')  # Model's detected class name
    top_confidence = float(predictions[top_idx]) * 100
    
    # Verify detected class is one of the 5 expected classes
    expected_classes = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
    if top_class_name not in expected_classes:
        print(f"❌ ERROR: Detected class '{top_class_name}' is not in expected classes!")
        print(f"   Expected: {expected_classes}")
        print(f"   Got: {top_class_name}")
        print(f"   Class index: {top_idx}")
        print(f"   Class names mapping: {class_names}")
        raise ValueError(f"Detected class '{top_class_name}' is not one of the 5 expected classes")
    
    print(f"\n{'='*60}")
    print(f"🔍 MODEL OUTPUT - Direct from model:")
    print(f"{'='*60}")
    print(f"   Model detected class index: {top_idx}")
    print(f"   Model detected class name: {top_class_name}")
    print(f"   Model confidence: {top_confidence:.2f}%")
    print(f"   (No thresholds or filtering - using model output directly)")
    
    detected_conditions = []
    confidence_scores = {}
    
    # Check if detected class is cancers (for hasOralCancer flag)
    has_oral_cancer = (top_class_name == 'cancers')
    
    # Disease mapping based on the 5 classes from your training
    # Maps model class names to user-friendly display names and details
    disease_mapping = {
        'calculus': {
            'displayName': 'Dental Calculus (Tartar)',
            'type': 'oral_disease',
            'severity': 'Moderate',
            'description': 'Dental calculus (tartar) detected. Hardened plaque buildup on teeth.',
            'recommendation': 'Professional dental cleaning (scaling) required. Improve oral hygiene routine.'
        },
        'cancers': {
            'displayName': 'Oral Cancer',
            'type': 'oral_cancer',
            'severity': 'High',
            'description': 'Potential oral cancer detected. Immediate medical attention required.',
            'recommendation': 'Please consult an oral oncologist immediately for further evaluation and biopsy.',
            'urgency': 'Critical'
        },
        'gingivitis': {
            'displayName': 'Gingivitis',
            'type': 'oral_disease',
            'severity': 'Moderate',
            'description': 'Gingivitis detected. Gum inflammation and early stage periodontal disease.',
            'recommendation': 'Professional dental cleaning and improved oral hygiene routine.'
        },
        'ulcers': {
            'displayName': 'Oral Ulcers',
            'type': 'oral_disease',
            'severity': 'Low-Moderate',
            'description': 'Oral ulcers detected in oral cavity.',
            'recommendation': 'May require medication. Consult dentist if persistent or painful.'
        },
        'olp': {
            'displayName': 'Oral Lichen Planus (OLP)',
            'type': 'oral_disease',
            'severity': 'Moderate-High',
            'description': 'Oral Lichen Planus (OLP) detected. Chronic inflammatory condition.',
            'recommendation': 'Consult a dentist or oral medicine specialist for proper diagnosis and treatment.'
        }
    }
    
    # Process the model's detected class - use it directly, no filtering
    disease_info = disease_mapping.get(top_class_name, {})
    
    # Create condition from model's detected class - ALWAYS create this
    if disease_info:
        display_name = disease_info.get('displayName', top_class_name.title())
        print(f"   ✅ Mapped to disease: {top_class_name} -> {display_name}")
    else:
        display_name = top_class_name.title()
        print(f"   ⚠️  No mapping found, using class name: {top_class_name}")
    
    # ALWAYS create condition with model's detected class
    condition = {
        'type': disease_info.get('type', 'oral_disease') if disease_info else 'oral_disease',
        'name': display_name,  # Disease name
        'modelClassName': top_class_name,  # THIS IS THE MODEL'S DETECTED CLASS - MUST BE RETURNED
        'severity': disease_info.get('severity', 'Moderate') if disease_info else 'Moderate',
        'description': disease_info.get('description', f'{display_name} detected.') if disease_info else f'{display_name} detected.',
        'recommendation': disease_info.get('recommendation', 'Consult a dental professional.') if disease_info else 'Consult a dental professional.',
        'urgency': disease_info.get('urgency', 'Moderate') if disease_info else 'Moderate'
    }
    
    # ALWAYS append the condition - this is the model's detected class
    detected_conditions.append(condition)
    
    # Store confidence (for internal use)
    if top_class_name == 'cancers':
        confidence_scores['oralCancer'] = top_confidence
    else:
        confidence_scores[top_class_name] = top_confidence
    
    print(f"\n✅ format_results: Created condition from model output")
    print(f"   ✅ Model detected class: {top_class_name}")
    print(f"   ✅ Disease name: {display_name}")
    print(f"   ✅ Condition added to list")
    print(f"   Total conditions: {len(detected_conditions)}")
    
    # CRITICAL: Verify condition was created
    if len(detected_conditions) == 0:
        print("   ❌ CRITICAL ERROR: No conditions created! This should never happen.")
        raise ValueError("Failed to create condition from model output")
    
    # Verify the condition has the model class name
    if detected_conditions[0].get('modelClassName') != top_class_name:
        print(f"   ❌ ERROR: Condition class name mismatch!")
        print(f"      Expected: {top_class_name}")
        print(f"      Got: {detected_conditions[0].get('modelClassName')}")
    
    # Calculate health score
    health_score = 100
    for condition in detected_conditions:
        severity = condition.get('severity', 'Low')
        if severity == 'High' or condition.get('urgency') == 'Critical':
            health_score -= 40
        elif severity == 'Moderate-High':
            health_score -= 30
        elif severity == 'Moderate':
            health_score -= 20
        elif severity == 'Low-Moderate':
            health_score -= 10
    
    health_score = max(0, health_score)
    
    # Determine if oral diseases detected (excluding cancer)
    has_oral_diseases = any(
        cond.get('type') == 'oral_disease' 
        for cond in detected_conditions
    )
    
    # Verify we have the model's detected class
    if not detected_conditions:
        print("❌ ERROR: No condition created from model output!")
        # This should never happen, but create from model output
        detected_conditions.append({
            'type': 'oral_disease',
            'name': top_class_name.title(),
            'modelClassName': top_class_name,  # Model's detected class
            'severity': 'Moderate',
            'description': f'Model detected: {top_class_name}',
            'recommendation': 'Consult a dental professional.',
            'urgency': 'Moderate'
        })
    
    # CRITICAL: Ensure we have at least one condition with model's detected class
    if len(detected_conditions) == 0:
        print("❌ CRITICAL: detected_conditions is empty before returning!")
        print(f"   Top class name: {top_class_name}")
        print(f"   Top index: {top_idx}")
        # Force create condition from model output
        detected_conditions.append({
            'type': 'oral_cancer' if top_class_name == 'cancers' else 'oral_disease',
            'name': disease_mapping.get(top_class_name, {}).get('displayName', top_class_name.title()),
            'modelClassName': top_class_name,  # Model's detected class
            'severity': 'High' if top_class_name == 'cancers' else 'Moderate',
            'description': f'Model detected: {top_class_name}',
            'recommendation': 'Consult a dental professional.',
            'urgency': 'Critical' if top_class_name == 'cancers' else 'Moderate'
        })
        print(f"   ✅ Force-created condition: {top_class_name}")
    
    result = {
        'detectedConditions': detected_conditions,  # MUST contain model's detected class
        'confidenceScores': confidence_scores,
        'healthScore': health_score,
        'hasOralCancer': has_oral_cancer,
        'hasOralDiseases': has_oral_diseases and not has_oral_cancer,
        'modelVersion': 'EfficientNet-B3-v1.0',
        'timestamp': None  # Will be set by Node.js
    }
    
    # Verify result before returning
    if not result.get('detectedConditions') or len(result['detectedConditions']) == 0:
        print("❌ CRITICAL ERROR: Result has no detectedConditions!")
        raise ValueError("Result must contain detectedConditions from model")
    
    print(f"\n✅ format_results: Returning result")
    print(f"   ✅ Detected conditions: {len(detected_conditions)}")
    print(f"   ✅ First condition class: {detected_conditions[0].get('modelClassName')}")
    print(f"   ✅ First condition name: {detected_conditions[0].get('name')}")
    
    return result

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_loaded = model is not None
    model_exists = os.path.exists(MODEL_PATH)
    
    response = {
        'status': 'ok',
        'model_loaded': model_loaded,
        'model_exists': model_exists,
        'model_path': MODEL_PATH if model_exists else None
    }
    
    if not model_exists:
        print(f"⚠️  Health check: Model file not found at {MODEL_PATH}")
    elif not model_loaded:
        print(f"⚠️  Health check: Model file exists but not loaded yet")
    else:
        print(f"✅ Health check: Model loaded and ready")
    
    return jsonify(response)

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'Empty image file'}), 400
        
        # Load model if not loaded
        if model is None:
            loaded_model = load_model()
            if loaded_model is None:
                return jsonify({
                    'error': 'Model not found or failed to load',
                    'model_path': MODEL_PATH
                }), 500
        
        # Read image bytes
        image_bytes = image_file.read()
        print(f"📸 Received image: {len(image_bytes)} bytes")
        
        # Preprocess image using the model's preprocessing pipeline (same as training)
        try:
            print("🔄 Preprocessing image (applying circular mask, resize, normalize)...")
            preprocessed_tensor = preprocess_image_for_model(image_bytes, apply_circular_mask=True)
            print(f"✅ Image preprocessed. Tensor shape: {preprocessed_tensor.shape}")
        except Exception as e:
            print(f"❌ Image preprocessing failed: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Image preprocessing failed: {str(e)}'}), 400
        
        # Make prediction using trained PyTorch model
        try:
            print(f"\n{'='*60}")
            print(f"🔬 MODEL INFERENCE - Getting output from model...")
            print(f"{'='*60}")
            
            # Call the model to get predictions
            predictions = predict_with_model(model, preprocessed_tensor, device=device)
            
            # Verify predictions are valid
            if predictions is None or len(predictions) == 0:
                raise ValueError("Model returned empty predictions")
            
            if len(predictions) != 5:
                raise ValueError(f"Model should return 5 predictions, got {len(predictions)}")
            
            print(f"✅ Model output received:")
            print(f"   Prediction shape: {predictions.shape}")
            print(f"   Sum of probabilities: {np.sum(predictions):.4f}")
            print(f"   Raw predictions: {predictions}")
            
            # Show all 5 class predictions from model
            class_names_debug = {int(k): v for k, v in class_labels.items()}
            print("\n📊 MODEL OUTPUT - All 5 Class Probabilities:")
            print("-" * 60)
            for idx, prob in enumerate(predictions):
                class_name = class_names_debug.get(idx, f'Class_{idx}')
                confidence = float(prob) * 100
                marker = " 👈 MODEL DETECTED THIS" if idx == np.argmax(predictions) else ""
                print(f"   Class {idx} ({class_name:12s}): {confidence:6.2f}%{marker}")
            print("-" * 60)
            
            # Get model's detected class (highest probability)
            # This is the class the model thinks the image belongs to (one of 5 classes)
            top_idx = np.argmax(predictions)  # Model's choice - index 0-4
            top_confidence = float(predictions[top_idx]) * 100
            
            # Map index to class name using class_labels
            class_names = {int(k): v for k, v in class_labels.items()}
            top_class = class_names.get(top_idx, f'Class_{top_idx}')
            
            # Verify the detected class is one of the 5 expected classes
            expected_classes = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
            if top_class not in expected_classes:
                print(f"❌ ERROR: Model detected class '{top_class}' which is not in expected classes!")
                print(f"   Expected classes: {expected_classes}")
                print(f"   Detected class: {top_class}")
                print(f"   Class index: {top_idx}")
                print(f"   Class labels mapping: {class_names}")
                raise ValueError(f"Detected class '{top_class}' is not one of the 5 expected classes")
            
            print(f"\n🎯 MODEL DETECTED CLASS (from 5 classes):")
            print(f"   Class Index: {top_idx} (0-4)")
            print(f"   Class Name: {top_class}")
            print(f"   Confidence: {top_confidence:.1f}%")
            print(f"   ✅ This is one of the 5 trained classes")
            print(f"   (Using this class name directly from model output)")
            print(f"{'='*60}\n")
            
        except Exception as e:
            import traceback
            print(f"❌ Model prediction failed: {e}")
            traceback.print_exc()
            return jsonify({'error': f'Model prediction failed: {str(e)}'}), 500
        
        # Format results using model output
        print("\n📊 Formatting results from model output...")
        results = format_results(predictions, class_labels)
        results['timestamp'] = __import__('datetime').datetime.now().isoformat()
        results['usingRealModel'] = True  # Indicate that real model was used
        
        # Verify results contain detected conditions from model
        print(f"\n✅ Results from model:")
        print(f"   Detected Conditions: {len(results.get('detectedConditions', []))}")
        
        if results.get('detectedConditions') and len(results['detectedConditions']) > 0:
            for i, cond in enumerate(results['detectedConditions']):
                print(f"   Condition {i+1}:")
                print(f"      - Model Class: {cond.get('modelClassName', 'Unknown')}")
                print(f"      - Disease Name: {cond.get('name', 'Unknown')}")
                print(f"      - Type: {cond.get('type', 'Unknown')}")
        else:
            print("   ❌ ERROR: No conditions in results from format_results!")
            print("   This should not happen. Model should have detected a class.")
            # Emergency: use model's top prediction directly
            top_idx = np.argmax(predictions)
            class_names = {int(k): v for k, v in class_labels.items()}
            top_class = class_names.get(top_idx, f'Class_{top_idx}')
            disease_mapping_fallback = {
                'calculus': 'Dental Calculus (Tartar)',
                'cancers': 'Oral Cancer',
                'gingivitis': 'Gingivitis',
                'ulcers': 'Oral Ulcers',
                'olp': 'Oral Lichen Planus (OLP)'
            }
            results['detectedConditions'] = [{
                'type': 'oral_cancer' if top_class == 'cancers' else 'oral_disease',
                'name': disease_mapping_fallback.get(top_class, top_class.title()),
                'modelClassName': top_class,  # Model's detected class
                'severity': 'High' if top_class == 'cancers' else 'Moderate',
                'description': f'Model detected: {disease_mapping_fallback.get(top_class, top_class)}',
                'recommendation': 'Consult a dental professional for proper diagnosis.',
                'urgency': 'Critical' if top_class == 'cancers' else 'Moderate'
            }]
            print(f"   ✅ Created condition directly from model: {top_class}")
        
        print(f"   Health Score: {results['healthScore']}")
        print(f"   Has Oral Cancer: {results['hasOralCancer']}")
        print(f"   Has Oral Diseases: {results['hasOralDiseases']}")
        print(f"\n📤 Sending response to client...")
        
        # Verify that we have detected conditions before sending response
        if not results.get('detectedConditions') or len(results['detectedConditions']) == 0:
            print("❌ CRITICAL ERROR: No detected conditions in results!")
            print("   Results keys:", list(results.keys()))
            print("   This should never happen. Check format_results function.")
            return jsonify({
                'success': False,
                'error': 'Model prediction failed - no conditions detected',
                'analysis': results
            }), 500
        
        # Log the final response - THIS IS WHAT GETS SENT TO THE USER
        top_condition = results['detectedConditions'][0]
        detected_class_name = top_condition.get('modelClassName', 'Unknown')
        disease_name = top_condition.get('name', 'Unknown')
        
        print(f"\n{'='*60}")
        print(f"📤 FINAL RESPONSE - Sending to user:")
        print(f"{'='*60}")
        print(f"   ✅ Detected Class Name: {detected_class_name}")
        print(f"      (This is one of the 5 classes: calculus, cancers, gingivitis, ulcers, olp)")
        print(f"   ✅ Disease Name: {disease_name}")
        print(f"   ✅ Type: {top_condition.get('type', 'Unknown')}")
        print(f"   ✅ Severity: {top_condition.get('severity', 'Unknown')}")
        print(f"   Total Conditions: {len(results['detectedConditions'])}")
        
        # Verify the detected class is one of the 5 expected classes
        expected_classes = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
        if detected_class_name not in expected_classes:
            print(f"   ⚠️  WARNING: Detected class '{detected_class_name}' is not in expected classes!")
            print(f"      Expected: {expected_classes}")
        else:
            print(f"   ✅ Verified: '{detected_class_name}' is a valid class from the 5 trained classes")
        
        # Verify response will contain the model's detected class
        if not detected_class_name or detected_class_name == 'Unknown':
            print(f"   ❌ ERROR: Detected class name is missing or invalid!")
            print(f"      Condition data: {top_condition}")
            raise ValueError("Detected class name is missing in response")
        
        print(f"{'='*60}\n")
        
        response_data = {
            'success': True,
            'analysis': results,  # Contains detectedConditions with modelClassName
            'modelUsed': 'EfficientNet-B3 (Trained Model)',
            'detectedClass': detected_class_name,  # Model's detected class (calculus, cancers, etc.)
            'diseaseName': disease_name  # Disease name for display
        }
        
        # Final verification before sending
        if 'detectedConditions' not in results or len(results['detectedConditions']) == 0:
            print("❌ CRITICAL: Response data missing detectedConditions!")
            raise ValueError("Response must contain detectedConditions")
        
        if not results['detectedConditions'][0].get('modelClassName'):
            print("❌ CRITICAL: Response missing modelClassName!")
            raise ValueError("Response must contain modelClassName")
        
        print(f"✅ Response verified - contains model detected class: {detected_class_name}")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    print("🚀 Starting Python AI Service...")
    print(f"📁 Model directory: {MODEL_DIR}")
    print(f"📄 Model path: {MODEL_PATH}")
    
    if os.path.exists(MODEL_PATH):
        print("📦 Loading trained model...")
        loaded = load_model()
        if loaded is not None:
            print("✅ Trained model loaded successfully!")
            print(f"   Model will process images and detect: calculus, cancers, gingivitis, ulcers, olp")
        else:
            print("❌ Failed to load model")
    else:
        print(f"⚠️  Model not found at {MODEL_PATH}")
        print("   Please place your trained model file (best_model_masked.pth) in:")
        print(f"   {MODEL_DIR}/")
        print("   Service will not be able to process images until model is placed.")
    
    # Run Flask app
    port = int(os.environ.get('PYTHON_SERVICE_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

