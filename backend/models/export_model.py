"""
Complete Model Export Script for Dental Disease Detection Model
Exports trained PyTorch model in multiple formats with all necessary files
"""

import os
import json
import shutil
import zipfile
from datetime import datetime
from pathlib import Path
import torch
import torch.nn as nn
from torchvision.models import efficientnet_b3

# Model Configuration
CLASSES = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']
NUM_CLASSES = 5
MODEL_NAME = 'dental_disease_detector'
VERSION = '1.0.0'

# Define the model architecture (must match training)
class CustomEfficientNet(nn.Module):
    def __init__(self, num_classes):
        super(CustomEfficientNet, self).__init__()
        self.model = efficientnet_b3(weights='EfficientNet_B3_Weights.IMAGENET1K_V1')
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(self.model.classifier[1].in_features, num_classes)
        )

    def forward(self, x):
        return self.model(x)


def export_model(model_path, output_dir='exported_model'):
    """
    Export the trained model with all necessary files
    
    Args:
        model_path: Path to the trained model weights (.pth file)
        output_dir: Directory to save exported files
    """
    print("=" * 60)
    print("🚀 Starting Model Export Process")
    print("=" * 60)
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Create subdirectories
    models_dir = output_path / 'models'
    models_dir.mkdir(exist_ok=True)
    
    # Load the trained model
    print(f"\n📦 Loading model from: {model_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # Initialize model architecture
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"🔧 Device: {device}")
    
    model = CustomEfficientNet(NUM_CLASSES)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    # 1. Save model weights only (.pth)
    print("\n1️⃣  Saving model weights (.pth)...")
    weights_path = models_dir / 'model_weights.pth'
    torch.save(model.state_dict(), weights_path)
    print(f"   ✅ Saved: {weights_path}")
    
    # 2. Save full model (architecture + weights)
    print("\n2️⃣  Saving full model (.pth)...")
    full_model_path = models_dir / 'model_full.pth'
    torch.save({
        'model_state_dict': model.state_dict(),
        'num_classes': NUM_CLASSES,
        'classes': CLASSES,
        'version': VERSION,
        'export_date': datetime.now().isoformat()
    }, full_model_path)
    print(f"   ✅ Saved: {full_model_path}")
    
    # 3. Save class names as JSON
    print("\n3️⃣  Saving class names (JSON)...")
    class_labels = {str(i): class_name for i, class_name in enumerate(CLASSES)}
    class_labels_path = models_dir / 'class_labels.json'
    with open(class_labels_path, 'w') as f:
        json.dump(class_labels, f, indent=2)
    print(f"   ✅ Saved: {class_labels_path}")
    
    # 4. Create model info file
    print("\n4️⃣  Creating model info file...")
    model_info = {
        'model_name': MODEL_NAME,
        'version': VERSION,
        'num_classes': NUM_CLASSES,
        'classes': CLASSES,
        'architecture': 'EfficientNet-B3',
        'input_size': [224, 224],
        'normalization': {
            'mean': [0.485, 0.456, 0.406],
            'std': [0.229, 0.224, 0.225]
        },
        'preprocessing': {
            'circular_mask': True,
            'resize': 256,
            'center_crop': 224,
            'normalization': 'ImageNet'
        },
        'export_date': datetime.now().isoformat(),
        'description': 'Dental Disease Detection Model - 5 Classes',
        'diseases': {
            'calculus': 'Dental Calculus (Tartar)',
            'cancers': 'Oral Cancer',
            'gingivitis': 'Gingivitis',
            'ulcers': 'Oral Ulcers',
            'olp': 'Oral Lichen Planus (OLP)'
        }
    }
    info_path = models_dir / 'model_info.json'
    with open(info_path, 'w') as f:
        json.dump(model_info, f, indent=2)
    print(f"   ✅ Saved: {info_path}")
    
    # 5. Save model architecture for reference
    print("\n5️⃣  Saving model architecture...")
    arch_path = models_dir / 'model_architecture.txt'
    with open(arch_path, 'w') as f:
        f.write(f"Model Architecture: CustomEfficientNet\n")
        f.write(f"Base Model: EfficientNet-B3\n")
        f.write(f"Number of Classes: {NUM_CLASSES}\n")
        f.write(f"Classes: {', '.join(CLASSES)}\n")
        f.write(f"\nModel Structure:\n")
        f.write(str(model))
    print(f"   ✅ Saved: {arch_path}")
    
    print("\n" + "=" * 60)
    print("✅ Model Export Completed Successfully!")
    print("=" * 60)
    print(f"\n📁 All files saved to: {output_path.absolute()}")
    
    return output_path


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python export_model.py <path_to_model.pth> [output_directory]")
        print("\nExample:")
        print("  python export_model.py best_model_masked.pth exported_model")
        sys.exit(1)
    
    model_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'exported_model'
    
    try:
        export_model(model_path, output_dir)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)



