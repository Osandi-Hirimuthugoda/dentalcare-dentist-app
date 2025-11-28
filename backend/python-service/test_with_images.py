"""
Test script to test the model with training images from each class
This will help verify that the correct disease names are displayed for each class
"""
import os
import sys
sys.path.append(os.path.dirname(__file__))

from model_loader import load_trained_model, preprocess_image_for_model, predict_with_model
import torch
from PIL import Image
import numpy as np
from io import BytesIO

# Model path
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'oral_cancer_model')
MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_masked.pth')

# Class labels - 5 classes
CLASS_LABELS = {
    '0': 'calculus',
    '1': 'cancers',
    '2': 'gingivitis',
    '3': 'ulcers',
    '4': 'olp'
}

# Disease names mapping for the 5 classes
DISEASE_NAMES = {
    'calculus': 'Dental Calculus (Tartar)',
    'cancers': 'Oral Cancer',
    'gingivitis': 'Gingivitis',
    'ulcers': 'Oral Ulcers',
    'olp': 'Oral Lichen Planus (OLP)'
}

def test_with_image(image_path, expected_class=None):
    """Test model with a specific image"""
    print(f"\n{'='*60}")
    print(f"Testing with image: {os.path.basename(image_path)}")
    if expected_class:
        print(f"Expected class: {expected_class} -> {DISEASE_NAMES.get(expected_class, 'Unknown')}")
    print(f"{'='*60}")
    
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found at: {MODEL_PATH}")
        return False
    
    try:
        # Load model
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = load_trained_model(MODEL_PATH, device=device)
        
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        
        # Convert to bytes
        img_bytes = BytesIO()
        image.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        image_bytes = img_bytes.read()
        
        # Preprocess
        preprocessed_tensor = preprocess_image_for_model(image_bytes, apply_circular_mask=True)
        
        # Predict
        predictions = predict_with_model(model, preprocessed_tensor, device=device)
        
        # Get top prediction
        top_idx = np.argmax(predictions)
        top_class = CLASS_LABELS.get(str(top_idx), f'Class_{top_idx}')
        top_confidence = float(predictions[top_idx]) * 100
        detected_disease = DISEASE_NAMES.get(top_class, top_class)
        
        # Show all predictions
        print("\n📊 All Class Predictions:")
        print("-" * 60)
        for idx, prob in enumerate(predictions):
            class_name = CLASS_LABELS.get(str(idx), f'Class_{idx}')
            confidence = float(prob) * 100
            disease_name = DISEASE_NAMES.get(class_name, class_name)
            marker = " 👈" if idx == top_idx else ""
            print(f"   {class_name:12s} -> {disease_name:30s}: {confidence:6.2f}%{marker}")
        
        print("-" * 60)
        print(f"\n🎯 Detected Class: {top_class}")
        print(f"📋 Disease Name: {detected_disease}")
        print(f"📊 Confidence: {top_confidence:.2f}%")
        
        # Verify if expected class matches
        if expected_class:
            if top_class == expected_class:
                print(f"✅ CORRECT! Detected class matches expected class.")
            else:
                print(f"⚠️  MISMATCH! Expected '{expected_class}' but got '{top_class}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_all_classes(test_images_dir):
    """Test with images from all 5 classes"""
    print("\n" + "="*60)
    print("Testing Model with Training Images from All 5 Classes")
    print("="*60)
    
    # Expected class folders (adjust these paths based on your training data structure)
    class_folders = {
        'calculus': 'calculus',
        'cancers': 'cancers',
        'gingivitis': 'gingivitis',
        'ulcers': 'ulcers',
        'olp': 'olp'
    }
    
    if not os.path.exists(test_images_dir):
        print(f"\n⚠️  Test images directory not found: {test_images_dir}")
        print("\nTo test with training images:")
        print("1. Create a test_images folder")
        print("2. Add subfolders for each class: calculus, cancers, gingivitis, ulcers, olp")
        print("3. Add sample images from each class")
        print("4. Run: python test_with_images.py <path_to_test_images>")
        return
    
    # Test each class
    for class_name, folder_name in class_folders.items():
        class_dir = os.path.join(test_images_dir, folder_name)
        if os.path.exists(class_dir):
            print(f"\n{'='*60}")
            print(f"Testing Class: {class_name} -> {DISEASE_NAMES[class_name]}")
            print(f"{'='*60}")
            
            # Get first image from this class folder
            images = [f for f in os.listdir(class_dir) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            if images:
                test_image_path = os.path.join(class_dir, images[0])
                test_with_image(test_image_path, expected_class=class_name)
            else:
                print(f"⚠️  No images found in {class_dir}")
        else:
            print(f"⚠️  Class folder not found: {class_dir}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Test with specific directory
        test_images_dir = sys.argv[1]
        test_all_classes(test_images_dir)
    else:
        # Test with single image or show instructions
        print("\n" + "="*60)
        print("Model Test Script - Test with Training Images")
        print("="*60)
        print("\nUsage:")
        print("  python test_with_images.py <image_path>")
        print("  python test_with_images.py <test_images_directory>")
        print("\nExample:")
        print("  python test_with_images.py test_images/calculus/image1.jpg")
        print("  python test_with_images.py test_images/")
        print("\n" + "="*60)
        
        # Check if model exists and can be loaded
        if os.path.exists(MODEL_PATH):
            print(f"\n✅ Model found: {MODEL_PATH}")
            print("\nTo test with a specific image:")
            print("  python test_with_images.py path/to/image.jpg")
        else:
            print(f"\n❌ Model not found: {MODEL_PATH}")
            print("   Please place your trained model file first.")

