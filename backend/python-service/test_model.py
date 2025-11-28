"""
Test script to verify the trained model is working correctly
Run this after placing your model file to test it
"""
import os
import sys
sys.path.append(os.path.dirname(__file__))

from model_loader import load_trained_model, preprocess_image_for_model, predict_with_model
import torch
from PIL import Image
import numpy as np

# Model path
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'oral_cancer_model')
MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_masked.pth')

# Class labels
CLASS_LABELS = {
    '0': 'calculus',
    '1': 'cancers',
    '2': 'gingivitis',
    '3': 'ulcers',
    '4': 'olp'
}

def test_model():
    """Test if the model loads and can make predictions"""
    print("=" * 50)
    print("Testing Trained Model")
    print("=" * 50)
    
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found at: {MODEL_PATH}")
        print("   Please place your best_model_masked.pth file in:")
        print(f"   {MODEL_DIR}/")
        return False
    
    print(f"✅ Model file found: {MODEL_PATH}")
    
    # Load model
    try:
        print("\n📦 Loading model...")
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"   Using device: {device}")
        
        model = load_trained_model(MODEL_PATH, device=device)
        print("✅ Model loaded successfully!")
        
        # Test with a dummy image (or provide path to test image)
        print("\n🧪 Testing with dummy image...")
        # Create a dummy RGB image (224x224)
        dummy_image = Image.new('RGB', (224, 224), color='white')
        
        # Convert to bytes
        from io import BytesIO
        img_bytes = BytesIO()
        dummy_image.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        image_bytes = img_bytes.read()
        
        # Preprocess
        print("   Preprocessing image...")
        preprocessed_tensor = preprocess_image_for_model(image_bytes, apply_circular_mask=True)
        print(f"   ✅ Preprocessed. Shape: {preprocessed_tensor.shape}")
        
        # Predict
        print("   Running prediction...")
        predictions = predict_with_model(model, preprocessed_tensor, device=device)
        print(f"   ✅ Prediction complete!")
        
        # Show results
        print("\n📊 Prediction Results:")
        print("-" * 50)
        for idx, prob in enumerate(predictions):
            class_name = CLASS_LABELS.get(str(idx), f'Class_{idx}')
            confidence = float(prob) * 100
            print(f"   {class_name:15s}: {confidence:6.2f}%")
        
        # Top prediction
        top_idx = np.argmax(predictions)
        top_class = CLASS_LABELS.get(str(top_idx), f'Class_{top_idx}')
        top_confidence = float(predictions[top_idx]) * 100
        print("-" * 50)
        print(f"🎯 Top Prediction: {top_class} ({top_confidence:.2f}%)")
        print("=" * 50)
        print("✅ Model test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_model()



