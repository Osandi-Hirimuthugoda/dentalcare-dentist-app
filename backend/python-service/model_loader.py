"""
Model loader for the trained PyTorch EfficientNet-B3 dental CNN model
"""
import torch
import torch.nn as nn
from torchvision.models import efficientnet_b3
from PIL import Image, ImageDraw
import torchvision.transforms as transforms

class CircularMask:
    """Circular mask preprocessing as used in training"""
    def __call__(self, img):
        # img is a PIL Image
        width, height = img.size
        mask = Image.new('L', (width, height), 0)  # 'L' for grayscale mask
        draw = ImageDraw.Draw(mask)
        # Draw a white circle in the center, inscribed in the smaller dimension
        diameter = min(width, height)
        # Calculate top-left and bottom-right coordinates for the ellipse (circle)
        left = (width - diameter) / 2
        top = (height - diameter) / 2
        right = left + diameter
        bottom = top + diameter
        draw.ellipse((left, top, right, bottom), fill=255)

        img_masked = Image.new('RGB', (width, height), (0, 0, 0))  # Create a black background
        # Ensure image is RGB before pasting
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img_masked.paste(img, (0, 0), mask)  # Paste original image using the circular mask
        return img_masked

class CustomEfficientNet(nn.Module):
    """Custom EfficientNet-B3 model matching the training architecture"""
    def __init__(self, num_classes=5):
        super(CustomEfficientNet, self).__init__()
        self.model = efficientnet_b3(weights='EfficientNet_B3_Weights.IMAGENET1K_V1')
        self.model.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(self.model.classifier[1].in_features, num_classes)
        )

    def forward(self, x):
        return self.model(x)

def load_trained_model(model_path, device='cpu'):
    """
    Load the trained PyTorch model
    
    Args:
        model_path: Path to the saved model file (best_model_masked.pth)
        device: Device to load model on ('cpu' or 'cuda')
    
    Returns:
        Loaded model in evaluation mode
    """
    num_classes = 5  # calculus, cancers, gingivitis, ulcers, olp
    
    # Initialize model with same architecture as training
    model = CustomEfficientNet(num_classes=num_classes)
    
    # Load trained weights
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()  # Set to evaluation mode
    model.to(device)
    
    return model

def preprocess_image_for_model(image_bytes, apply_circular_mask=True):
    """
    Preprocess image exactly as done during training
    
    Args:
        image_bytes: Image file bytes
        apply_circular_mask: Whether to apply circular mask (default: True)
    
    Returns:
        Preprocessed tensor ready for model input
    """
    from io import BytesIO
    
    # Load image
    image = Image.open(BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply circular mask (as in training)
    if apply_circular_mask:
        circular_mask = CircularMask()
        image = circular_mask(image)
    
    # Apply validation transforms (same as training)
    val_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  # ImageNet normalization
    ])
    
    # Apply transforms
    image_tensor = val_transforms(image)
    
    # Add batch dimension
    image_tensor = image_tensor.unsqueeze(0)
    
    return image_tensor

def predict_with_model(model, preprocessed_tensor, device='cpu'):
    """
    Make prediction using the loaded model
    
    Args:
        model: Loaded PyTorch model
        preprocessed_tensor: Preprocessed image tensor
        device: Device to run inference on
    
    Returns:
        Prediction probabilities as numpy array
    """
    model.eval()
    with torch.no_grad():
        tensor = preprocessed_tensor.to(device)
        outputs = model(tensor)
        # Apply softmax to get probabilities
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        return probabilities[0].cpu().numpy()



