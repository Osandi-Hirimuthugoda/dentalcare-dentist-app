"""
Inference Script for Dental Disease Detection Model
Includes proper preprocessing with circular masking
"""

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image, ImageDraw
import json
import os
from pathlib import Path
from torchvision.models import efficientnet_b3


# Model Configuration
NUM_CLASSES = 5
CLASSES = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp']


class CircularMask:
    """Apply circular mask to image (must match training preprocessing)"""
    def __call__(self, img):
        # img is a PIL Image
        width, height = img.size
        mask = Image.new('L', (width, height), 0)  # 'L' for grayscale mask
        draw = ImageDraw.Draw(mask)
        
        # Draw a white circle in the center, inscribed in the smaller dimension
        diameter = min(width, height)
        
        # Calculate top-left and bottom-right coordinates for the ellipse (circle) to be centered
        left = (width - diameter) / 2
        top = (height - diameter) / 2
        right = left + diameter
        bottom = top + diameter
        
        draw.ellipse((left, top, right, bottom), fill=255)
        
        img_masked = Image.new('RGB', (width, height), (0, 0, 0))  # Black background
        
        # Ensure image is RGB before pasting
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img_masked.paste(img, (0, 0), mask)  # Paste original image using the circular mask
        return img_masked


class CustomEfficientNet(nn.Module):
    """Model architecture matching training"""
    def __init__(self, num_classes):
        super(CustomEfficientNet, self).__init__()
        self.model = efficientnet_b3(weights='EfficientNet_B3_Weights.IMAGENET1K_V1')
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(self.model.classifier[1].in_features, num_classes)
        )

    def forward(self, x):
        return self.model(x)


class DentalDiseasePredictor:
    """Main prediction class"""
    
    def __init__(self, model_path, device=None):
        """
        Initialize the predictor
        
        Args:
            model_path: Path to model weights file (.pth)
            device: Device to run inference on (default: auto-detect)
        """
        self.device = device if device else torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Load class labels if available
        model_dir = Path(model_path).parent
        class_labels_path = model_dir / 'class_labels.json'
        if class_labels_path.exists():
            with open(class_labels_path, 'r') as f:
                class_labels_dict = json.load(f)
                self.classes = [class_labels_dict[str(i)] for i in range(len(class_labels_dict))]
        else:
            self.classes = CLASSES
        
        print(f"Classes: {self.classes}")
        
        # Define preprocessing transforms (MUST match training)
        self.transform = transforms.Compose([
            CircularMask(),  # Apply circular mask first
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # ImageNet stats
        ])
        
        # Load model
        print(f"Loading model from: {model_path}")
        self.model = CustomEfficientNet(len(self.classes))
        
        # Try loading full model dict first, then state dict
        checkpoint = torch.load(model_path, map_location=self.device)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            print("here1")
            self.model.load_state_dict(checkpoint['model_state_dict'])
        elif isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
            print("here2")
            self.model.load_state_dict(checkpoint['state_dict'])
        else:
            print("here3")
            self.model.load_state_dict(checkpoint)
        
        self.model.eval()
        print("Model loaded successfully!")
    
    def preprocess_image(self, image_path):
        """
        Preprocess image for inference
        
        Args:
            image_path: Path to image file or PIL Image
            
        Returns:
            Preprocessed tensor ready for model
        """
        if isinstance(image_path, str):
            image = Image.open(image_path).convert('RGB')
        else:
            image = image_path
        
        # Apply preprocessing (circular mask + normalization)
        image_tensor = self.transform(image)
        image_tensor = image_tensor.unsqueeze(0)  # Add batch dimension
        return image_tensor.to(self.device)
    
    def predict(self, image_path, return_probabilities=False):
        """
        Predict disease class from image
        
        Args:
            image_path: Path to image file or PIL Image
            return_probabilities: If True, return all class probabilities
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Preprocess image
            image_tensor = self.preprocess_image(image_path)
            print("🔄 Preprocessing image finished...")
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(image_tensor)
                print("Outputs:", outputs)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                print("Probabilities:", probabilities)
                
                # Get predicted class
                predicted_idx = torch.argmax(probabilities, dim=1).item()
                print("Predicted Index:", predicted_idx)
                confidence = probabilities[0][predicted_idx].item()
                print("Confidence:", confidence)
                predicted_class = self.classes[predicted_idx]
                print("Predicted Class:", predicted_class)
            
            result = {
                'predicted_class': predicted_class,
                'confidence': round(confidence * 100, 2),
                'class_index': int(predicted_idx)
            }
            
            if return_probabilities:
                all_probs = {}
                for i, class_name in enumerate(self.classes):
                    all_probs[class_name] = round(probabilities[0][i].item() * 100, 2)
                result['all_probabilities'] = all_probs
            
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'predicted_class': None,
                'confidence': 0.0
            }
    
    def predict_batch(self, image_paths, return_probabilities=False):
        """
        Predict for multiple images
        
        Args:
            image_paths: List of image paths
            return_probabilities: If True, return all class probabilities
            
        Returns:
            List of prediction results
        """
        results = []
        for image_path in image_paths:
            result = self.predict(image_path, return_probabilities)
            result['image_path'] = image_path
            results.append(result)
        return results


def main():
    """Example usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Dental Disease Detection Inference')
    parser.add_argument('--model', type=str, required=True, help='Path to model weights file')
    parser.add_argument('--image', type=str, required=True, help='Path to image file')
    parser.add_argument('--device', type=str, default=None, help='Device to use (cuda/cpu)')
    parser.add_argument('--probabilities', action='store_true', help='Show all class probabilities')
    
    args = parser.parse_args()
    
    # Initialize predictor
    predictor = DentalDiseasePredictor(args.model, device=args.device)
    
    # Run prediction
    print(f"\n🔍 Predicting: {args.image}")
    result = predictor.predict(args.image, return_probabilities=args.probabilities)
    
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
        return
    
    # Display results
    print("\n" + "=" * 60)
    print("📊 PREDICTION RESULTS")
    print("=" * 60)
    print(f"Predicted Class: {result['predicted_class']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Class Index: {result['class_index']}")
    
    if 'all_probabilities' in result:
        print("\nAll Class Probabilities:")
        for class_name, prob in result['all_probabilities'].items():
            marker = " 👈" if class_name == result['predicted_class'] else ""
            print(f"  {class_name:15s}: {prob:6.2f}%{marker}")
    
    print("=" * 60)


if __name__ == '__main__':
    main()



