"""
EXPORT MODEL FROM GOOGLE COLAB TO USE IN FLASK API
===================================================
Copy and paste this code into your Colab notebook AFTER training.
This will export your trained model with all necessary files.
"""

# ==========================================
# STEP 1: Load your best trained model
# ==========================================
# Make sure you've already run:
# model.load_state_dict(torch.load('best_model_masked.pth'))
# model.eval()

import torch
import json
import os
from google.colab import files

# ==========================================
# STEP 2: Create export directory
# ==========================================
export_dir = '/content/exported_model'
os.makedirs(export_dir, exist_ok=True)
os.makedirs(f'{export_dir}/models', exist_ok=True)

print("=" * 60)
print("🚀 EXPORTING MODEL FROM COLAB")
print("=" * 60)

# ==========================================
# STEP 3: Save model weights (state_dict)
# ==========================================
model_weights_path = f'{export_dir}/models/model_weights.pth'
torch.save(model.state_dict(), model_weights_path)
print(f"\n✅ Model weights saved: {model_weights_path}")

# ==========================================
# STEP 4: Save class labels mapping
# ==========================================
class_labels = {str(i): class_name for i, class_name in enumerate(CLASSES)}
class_labels_path = f'{export_dir}/models/class_labels.json'

with open(class_labels_path, 'w') as f:
    json.dump(class_labels, f, indent=2)

print(f"✅ Class labels saved: {class_labels_path}")
print(f"   Classes: {CLASSES}")

# ==========================================
# STEP 5: Create model info JSON
# ==========================================
model_info = {
    "model_name": "EfficientNet-B3",
    "num_classes": NUM_CLASSES,
    "classes": CLASSES,
    "input_size": [224, 224],
    "preprocessing": {
        "circular_mask": True,
        "resize": 256,
        "center_crop": 224,
        "normalize": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
    },
    "diseases": {
        "calculus": "Dental Calculus (Tartar)",
        "cancers": "Oral Cancer",
        "gingivitis": "Gingivitis",
        "ulcers": "Oral Ulcers",
        "olp": "Oral Lichen Planus (OLP)"
    }
}

model_info_path = f'{export_dir}/models/model_info.json'
with open(model_info_path, 'w') as f:
    json.dump(model_info, f, indent=2)

print(f"✅ Model info saved: {model_info_path}")

# ==========================================
# STEP 6: Verify files
# ==========================================
print("\n" + "=" * 60)
print("📦 VERIFYING EXPORTED FILES")
print("=" * 60)

files_to_check = [
    (model_weights_path, "Model Weights"),
    (class_labels_path, "Class Labels"),
    (model_info_path, "Model Info")
]

all_exist = True
for file_path, name in files_to_check:
    if os.path.exists(file_path):
        size = os.path.getsize(file_path) / (1024 * 1024)  # Size in MB
        print(f"✅ {name:20s}: {os.path.basename(file_path)} ({size:.2f} MB)")
    else:
        print(f"❌ {name:20s}: NOT FOUND!")
        all_exist = False

if not all_exist:
    print("\n❌ Some files are missing! Please check the export process.")
else:
    print("\n✅ All files exported successfully!")

# ==========================================
# STEP 7: Download files to your computer
# ==========================================
print("\n" + "=" * 60)
print("📥 DOWNLOADING FILES")
print("=" * 60)
print("\nFiles will be downloaded to your computer...")

# Download model weights
print("1. Downloading model_weights.pth...")
files.download(model_weights_path)

# Download class labels
print("2. Downloading class_labels.json...")
files.download(class_labels_path)

# Download model info
print("3. Downloading model_info.json...")
files.download(model_info_path)

print("\n" + "=" * 60)
print("✅ EXPORT COMPLETE!")
print("=" * 60)

print("\n📋 NEXT STEPS:")
print("1. Create folder: backend/models/exported_model/models/")
print("2. Place downloaded files in that folder:")
print("   - model_weights.pth")
print("   - class_labels.json")
print("   - model_info.json")
print("3. Start Flask API:")
print("   cd backend/models")
print("   python flask_api.py")
print("4. Upload image from Flutter app - model will detect the class!")



