"""
Verify that the model correctly detects the 5 classes
This script helps verify the model is working with the 5 classes
"""
import os
import sys
sys.path.append(os.path.dirname(__file__))

from model_loader import load_trained_model
import torch

# Model path
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models', 'oral_cancer_model')
MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_masked.pth')

# The 5 classes the model was trained on
EXPECTED_CLASSES = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
CLASS_LABELS = {
    '0': 'calculus',
    '1': 'cancers',
    '2': 'gingivitis',
    '3': 'ulcers',
    '4': 'olp'
}

def verify_model_classes():
    """Verify the model has 5 output classes"""
    print("=" * 60)
    print("Verifying Model Classes")
    print("=" * 60)
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model file not found: {MODEL_PATH}")
        return False
    
    try:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = load_trained_model(MODEL_PATH, device=device)
        
        # Check model output size
        # Create a dummy input tensor (batch_size=1, channels=3, height=224, width=224)
        dummy_input = torch.randn(1, 3, 224, 224).to(device)
        
        model.eval()
        with torch.no_grad():
            output = model(dummy_input)
        
        num_classes = output.shape[1]
        
        print(f"\n✅ Model loaded successfully")
        print(f"   Device: {device}")
        print(f"   Model output shape: {output.shape}")
        print(f"   Number of output classes: {num_classes}")
        
        if num_classes != 5:
            print(f"\n❌ ERROR: Model has {num_classes} output classes, expected 5!")
            print(f"   The model should output probabilities for 5 classes:")
            for idx, class_name in CLASS_LABELS.items():
                print(f"      Class {idx}: {class_name}")
            return False
        
        print(f"\n✅ Model has correct number of classes (5)")
        print(f"\n📋 Expected Classes:")
        for idx, class_name in CLASS_LABELS.items():
            print(f"   Class {idx}: {class_name}")
        
        print(f"\n✅ Model is ready to detect images from these 5 classes")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Error verifying model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    verify_model_classes()

