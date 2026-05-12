"""
Image normalization for conjunctiva anemia screening.
Handles lighting variation and white balance correction.
"""

import cv2
import numpy as np

def normalize_lighting(image):
    """
    Apply color normalization/white balance to the image.
    Uses Grey World assumption or similar technique.
    """
    # Convert to float for calculations
    img_float = image.astype(np.float32)
    
    # Calculate average color
    avg_color = np.mean(img_float, axis=(0, 1))
    
    # Target average is neutral (grey)
    # We scale each channel to make the average color balanced
    target_avg = np.mean(avg_color)
    scales = target_avg / (avg_color + 1e-6)
    
    # Apply scales
    normalized = img_float * scales
    
    # Clip and convert back to uint8
    normalized = np.clip(normalized, 0, 255).astype(np.uint8)
    
    return normalized

def preprocess_for_inference(image_path, target_size=(224, 224)):
    """
    Load, normalize, and resize image for model input.
    """
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")
    
    # Convert BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Normalize lighting
    img = normalize_lighting(img)
    
    # Resize
    img = cv2.resize(img, target_size)
    
    return img
