"""
compare_models.py — Compare accuracy of two model weight files
Usage: python compare_models.py

Loads both model_weights.pth (current) and the new model,
runs predictions on test images in uploads/ folder,
and prints a side-by-side comparison.
"""

import os
import sys
import torch
from PIL import Image
from pathlib import Path
from inference import DentalDiseasePredictor

# ── Model paths ──────────────────────────────────────────────
MODEL_CURRENT = "model_weights.pth"
MODEL_NEW     = "best_model_masked_new.pth (2)"   # folder-format pth

# ── Test images: put sample images in uploads/ or specify paths ──
TEST_IMAGE_DIR = "uploads"

def get_test_images():
    """Collect test images from uploads/ folder"""
    images = []
    if os.path.isdir(TEST_IMAGE_DIR):
        for f in os.listdir(TEST_IMAGE_DIR):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                images.append(os.path.join(TEST_IMAGE_DIR, f))
    return images


def run_predictions(model_path, images):
    """Load model and run predictions on all images"""
    print(f"\nLoading: {model_path}")
    try:
        predictor = DentalDiseasePredictor(model_path)
    except Exception as e:
        print(f"  ERROR loading model: {e}")
        return None

    results = {}
    for img_path in images:
        try:
            image = Image.open(img_path).convert('RGB')
            result = predictor.predict(image, return_probabilities=True)
            results[img_path] = result
        except Exception as e:
            results[img_path] = {'error': str(e)}
    return results


def print_comparison(images, results_current, results_new):
    """Print side-by-side comparison table"""
    print("\n" + "=" * 90)
    print(f"{'IMAGE':<30} {'CURRENT MODEL':<28} {'NEW MODEL':<28}")
    print(f"{'':30} {'Class | Confidence':28} {'Class | Confidence':28}")
    print("=" * 90)

    agree = 0
    total = 0

    for img in images:
        name = os.path.basename(img)[:28]
        cur  = results_current.get(img, {}) if results_current else {}
        new  = results_new.get(img, {}) if results_new else {}

        cur_class = cur.get('predicted_class', 'ERROR')
        cur_conf  = f"{cur.get('confidence', 0):.1f}%" if 'predicted_class' in cur else 'N/A'
        new_class = new.get('predicted_class', 'ERROR')
        new_conf  = f"{new.get('confidence', 0):.1f}%" if 'predicted_class' in new else 'N/A'

        match = "✓" if cur_class == new_class else "✗"
        if cur_class != 'ERROR' and new_class != 'ERROR':
            total += 1
            if cur_class == new_class:
                agree += 1

        cur_str = f"{cur_class} | {cur_conf}"
        new_str = f"{new_class} | {new_conf}"
        print(f"{name:<30} {cur_str:<28} {new_str:<28} {match}")

    print("=" * 90)
    if total > 0:
        print(f"\nAgreement: {agree}/{total} images ({agree/total*100:.1f}%)")

    # Confidence comparison
    if results_current and results_new:
        cur_confs = [r.get('confidence', 0) for r in results_current.values() if 'confidence' in r]
        new_confs = [r.get('confidence', 0) for r in results_new.values() if 'confidence' in r]
        if cur_confs and new_confs:
            avg_cur = sum(cur_confs) / len(cur_confs)
            avg_new = sum(new_confs) / len(new_confs)
            print(f"\nAverage confidence — Current: {avg_cur:.1f}%  |  New: {avg_new:.1f}%")
            if avg_new > avg_cur:
                print(f"  → New model is MORE confident by {avg_new - avg_cur:.1f}%")
            elif avg_cur > avg_new:
                print(f"  → Current model is MORE confident by {avg_cur - avg_new:.1f}%")
            else:
                print("  → Same average confidence")


def main():
    print("=" * 90)
    print("  MODEL COMPARISON: Current vs New")
    print("=" * 90)

    # Check model files exist
    for path in [MODEL_CURRENT, MODEL_NEW]:
        exists = os.path.exists(path)
        size = ""
        if exists and os.path.isfile(path):
            size = f"({os.path.getsize(path)/1024/1024:.1f} MB)"
        elif exists:
            size = "(folder-format pth)"
        print(f"  {'✓' if exists else '✗'} {path} {size}")

    # Get test images
    images = get_test_images()
    if not images:
        print(f"\n⚠  No test images found in '{TEST_IMAGE_DIR}/'")
        print("   Add .jpg/.jpeg/.png images to uploads/ folder and re-run.")
        print("\n   Quick test with a single image:")
        print("   python compare_models.py path/to/image.jpg")

        # If image path passed as argument
        if len(sys.argv) > 1:
            images = [sys.argv[1]]
        else:
            return

    print(f"\n  Test images: {len(images)}")
    for img in images:
        print(f"    - {img}")

    # Run predictions
    results_current = run_predictions(MODEL_CURRENT, images)
    results_new     = run_predictions(MODEL_NEW, images)

    # Print comparison
    print_comparison(images, results_current, results_new)

    # Recommendation
    print("\n" + "=" * 90)
    print("RECOMMENDATION:")
    if results_current and results_new:
        cur_confs = [r.get('confidence', 0) for r in results_current.values() if 'confidence' in r]
        new_confs = [r.get('confidence', 0) for r in results_new.values() if 'confidence' in r]
        if cur_confs and new_confs:
            avg_cur = sum(cur_confs) / len(cur_confs)
            avg_new = sum(new_confs) / len(new_confs)
            if avg_new > avg_cur + 2:
                print("  → Use NEW model (higher confidence)")
                print(f"     To switch: rename/copy '{MODEL_NEW}' to 'model_weights.pth'")
            elif avg_cur > avg_new + 2:
                print("  → Keep CURRENT model (higher confidence)")
            else:
                print("  → Models perform similarly. Keep current unless new model has better training metrics.")
    print("=" * 90)


if __name__ == '__main__':
    main()
