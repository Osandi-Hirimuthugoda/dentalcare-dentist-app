"""
Test Script to Verify Model Works After Download
Tests inference, API endpoints, and model loading
"""

import os
import sys
import json
import requests
from pathlib import Path
from PIL import Image
import numpy as np
from inference import DentalDiseasePredictor

# Configuration
MODEL_PATH = 'models/model_weights.pth'
TEST_IMAGE_PATH = 'test_image.jpg'  # User needs to provide a test image
API_URL = 'http://localhost:5000'


def test_model_loading():
    """Test 1: Model Loading"""
    print("\n" + "=" * 60)
    print("TEST 1: Model Loading")
    print("=" * 60)
    
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"❌ Model file not found: {MODEL_PATH}")
            return False
        
        print(f"✅ Model file exists: {MODEL_PATH}")
        print(f"📦 Loading model...")
        
        predictor = DentalDiseasePredictor(MODEL_PATH)
        
        print(f"✅ Model loaded successfully!")
        print(f"   Device: {predictor.device}")
        print(f"   Classes: {predictor.classes}")
        print(f"   Number of classes: {len(predictor.classes)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False


def test_class_labels():
    """Test 2: Class Labels"""
    print("\n" + "=" * 60)
    print("TEST 2: Class Labels")
    print("=" * 60)
    
    try:
        class_labels_path = 'models/class_labels.json'
        
        if not os.path.exists(class_labels_path):
            print(f"⚠️  Class labels file not found: {class_labels_path}")
            return False
        
        with open(class_labels_path, 'r') as f:
            class_labels = json.load(f)
        
        print(f"✅ Class labels loaded successfully!")
        print(f"   Classes: {list(class_labels.values())}")
        
        expected_classes = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
        actual_classes = list(class_labels.values())
        
        if set(expected_classes) == set(actual_classes):
            print(f"✅ All expected classes present!")
            return True
        else:
            print(f"⚠️  Class mismatch!")
            print(f"   Expected: {expected_classes}")
            print(f"   Actual: {actual_classes}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_model_info():
    """Test 3: Model Info"""
    print("\n" + "=" * 60)
    print("TEST 3: Model Info")
    print("=" * 60)
    
    try:
        info_path = 'models/model_info.json'
        
        if not os.path.exists(info_path):
            print(f"⚠️  Model info file not found: {info_path}")
            return False
        
        with open(info_path, 'r') as f:
            info = json.load(f)
        
        print(f"✅ Model info loaded successfully!")
        print(f"   Model Name: {info.get('model_name', 'N/A')}")
        print(f"   Version: {info.get('version', 'N/A')}")
        print(f"   Architecture: {info.get('architecture', 'N/A')}")
        print(f"   Input Size: {info.get('input_size', 'N/A')}")
        print(f"   Number of Classes: {info.get('num_classes', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_inference(image_path):
    """Test 4: Inference"""
    print("\n" + "=" * 60)
    print("TEST 4: Inference")
    print("=" * 60)
    
    try:
        if not os.path.exists(image_path):
            print(f"⚠️  Test image not found: {image_path}")
            print(f"   Skipping inference test...")
            return None
        
        print(f"📸 Loading test image: {image_path}")
        predictor = DentalDiseasePredictor(MODEL_PATH)
        
        print(f"🔍 Running prediction...")
        result = predictor.predict(image_path, return_probabilities=True)
        
        if 'error' in result:
            print(f"❌ Prediction error: {result['error']}")
            return False
        
        print(f"✅ Prediction successful!")
        print(f"   Predicted Class: {result['predicted_class']}")
        print(f"   Confidence: {result['confidence']}%")
        print(f"   Class Index: {result['class_index']}")
        
        if 'all_probabilities' in result:
            print(f"\n   All Probabilities:")
            for class_name, prob in result['all_probabilities'].items():
                marker = " 👈" if class_name == result['predicted_class'] else ""
                print(f"      {class_name:15s}: {prob:6.2f}%{marker}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_health():
    """Test 5: API Health Check"""
    print("\n" + "=" * 60)
    print("TEST 5: API Health Check")
    print("=" * 60)
    
    try:
        print(f"🔍 Checking API at: {API_URL}")
        response = requests.get(f"{API_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API is healthy!")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Model Loaded: {data.get('model_loaded', False)}")
            print(f"   Model Exists: {data.get('model_exists', False)}")
            print(f"   Device: {data.get('device', 'N/A')}")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"⚠️  API server is not running at {API_URL}")
        print(f"   Start the API server first: python flask_api.py")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_api_predict(image_path):
    """Test 6: API Predict Endpoint"""
    print("\n" + "=" * 60)
    print("TEST 6: API Predict Endpoint")
    print("=" * 60)
    
    try:
        if not os.path.exists(image_path):
            print(f"⚠️  Test image not found: {image_path}")
            print(f"   Skipping API predict test...")
            return None
        
        print(f"📸 Uploading test image: {image_path}")
        
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{API_URL}/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction successful!")
            print(f"   Predicted Class: {data.get('prediction', 'N/A')}")
            print(f"   Disease Name: {data.get('disease_name', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 0)}%")
            print(f"   Class Index: {data.get('class_index', 'N/A')}")
            return True
        else:
            print(f"❌ API returned status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"⚠️  API server is not running at {API_URL}")
        print(f"   Start the API server first: python flask_api.py")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def create_test_image():
    """Create a simple test image if none exists"""
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"\n📸 Creating test image: {TEST_IMAGE_PATH}")
        # Create a simple RGB test image
        img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        img.save(TEST_IMAGE_PATH)
        print(f"✅ Test image created!")
        return True
    return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 DENTAL DISEASE DETECTION MODEL - TEST SUITE")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Model Loading
    results['model_loading'] = test_model_loading()
    
    # Test 2: Class Labels
    results['class_labels'] = test_class_labels()
    
    # Test 3: Model Info
    results['model_info'] = test_model_info()
    
    # Test 4: Inference
    test_image = sys.argv[1] if len(sys.argv) > 1 else TEST_IMAGE_PATH
    if not os.path.exists(test_image):
        create_test_image()
    
    results['inference'] = test_inference(test_image)
    
    # Test 5: API Health (optional - only if API is running)
    results['api_health'] = test_api_health()
    
    # Test 6: API Predict (optional - only if API is running)
    if results['api_health'] is not False:
        results['api_predict'] = test_api_predict(test_image)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    
    for test_name, result in results.items():
        if result is True:
            status = "✅ PASS"
        elif result is False:
            status = "❌ FAIL"
        else:
            status = "⚠️  SKIPPED"
        print(f"   {test_name:20s}: {status}")
    
    print(f"\n   Total: {len(results)} tests")
    print(f"   Passed: {passed}")
    print(f"   Failed: {failed}")
    print(f"   Skipped: {skipped}")
    
    if failed == 0:
        print("\n🎉 All critical tests passed!")
        return 0
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the errors above.")
        return 1


if __name__ == '__main__':
    sys.exit(main())



