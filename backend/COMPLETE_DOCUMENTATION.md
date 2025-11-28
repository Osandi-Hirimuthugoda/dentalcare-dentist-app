# 🦷 DentalCare+ AI Model - Complete Documentation

## 📋 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Model Setup](#model-setup)
3. [How the Model Works](#how-the-model-works)
4. [Model Class Detection](#model-class-detection)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Status & Next Steps](#status--next-steps)

---

## 🚀 Quick Start Guide

### ✅ Step 1: Dependencies Installed
All Python dependencies are now installed! ✅

### 📁 Step 2: Place Your Model File

Copy your trained model file to:
```
backend/models/oral_cancer_model/best_model_masked.pth
```

**How to do it:**
1. Find your `best_model_masked.pth` file (from training)
2. Copy it to: `backend\models\oral_cancer_model\best_model_masked.pth`

### 🚀 Step 3: Start Python Service

#### Option 1: Using Batch File (Easiest)
Double-click: `backend/START_PYTHON_SERVICE.bat`

#### Option 2: Using Command Line
```powershell
cd backend
py python-service/app.py
```

You should see:
```
🔧 Using device: cpu
📦 Loading PyTorch model from .../best_model_masked.pth...
✅ Model loaded successfully
🚀 Starting Python AI Service...
 * Running on http://0.0.0.0:5000
```

### ✅ Step 4: Verify Service

Open a new terminal and run:
```powershell
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_exists": true
}
```

### 🎯 Next Steps

Once the Python service is running:
1. Start your Node.js backend (it will automatically detect Python service)
2. Mobile app can now upload images and get real AI predictions!

---

## 📁 Model Setup

### Model File Location

Place your trained CNN model files in:
```
backend/models/oral_cancer_model/
```

### Setup Steps

#### Step 1: Place Model Files

Copy your trained model to:
```
backend/models/oral_cancer_model/best_model_masked.pth
```

**Important:** The file must be named exactly `best_model_masked.pth`

#### Step 2: Install Python Dependencies

```bash
cd backend
pip install -r python-service/requirements.txt
```

Or install manually:
```bash
pip install torch torchvision numpy Pillow opencv-python flask flask-cors
```

This installs:
- PyTorch & torchvision (for EfficientNet-B3)
- Flask (for API service)
- Other dependencies

#### Step 3: Update Model Path (if needed)

Edit `backend/python-service/app.py` and update:
- `MODEL_PATH` - path to your model file
- `target_size` - input image size (default: 224x224)
- `class_labels` - your model's class labels

#### Step 4: Start Python Service

```bash
cd backend
python python-service/app.py
```

The service will run on `http://localhost:5000`

#### Step 5: Configure Node.js Backend (Optional)

If Python service runs on different port, set environment variable:
```bash
export PYTHON_SERVICE_URL=http://localhost:5000
```

Or add to `.env`:
```
PYTHON_SERVICE_URL=http://localhost:5000
```

### Directory Structure

```
backend/
├── models/
│   ├── oral_cancer_model/
│   │   └── best_model_masked.pth  ← YOUR MODEL GOES HERE
│   ├── class_labels.json          ← Already configured
│   └── SETUP_INSTRUCTIONS.md
├── python-service/
│   ├── app.py                     ← Flask API service
│   ├── model_loader.py            ← Model loading utilities
│   ├── test_model.py              ← Test script
│   ├── verify_model_classes.py    ← Verification script
│   └── requirements.txt
└── src/
    └── controllers/
        └── aiScanController.js    ← Node.js controller (auto-detects Python service)
```

### Model Details

Your trained model:
- **Architecture**: EfficientNet-B3
- **Framework**: PyTorch
- **Classes**: 5 classes
  - Index 0: `calculus` - Dental calculus/tartar
  - Index 1: `cancers` - Oral cancer ⚠️
  - Index 2: `gingivitis` - Gum inflammation
  - Index 3: `ulcers` - Oral ulcers
  - Index 4: `olp` - Oral Lichen Planus
- **Input**: 224x224 RGB images
- **Preprocessing**: 
  - Circular mask (as in training)
  - ImageNet normalization

---

## 🔬 How the Model Works

### Complete Flow

#### 1. Image Upload (Mobile App → Node.js)
```
Mobile App → Uploads image → Node.js Backend
```

#### 2. Node.js Backend
```
Node.js receives image → Checks Python service → Sends image to Python service
```

#### 3. Python Service - Image Processing
```
Python Service receives image → Preprocesses image → Runs model → Returns results
```

#### 4. Results Display
```
Python Service → Node.js → Mobile App → Shows disease names
```

### Detailed Processing Steps

#### Step 1: Image Preprocessing (Same as Training)

When an image is uploaded, it goes through **exactly the same preprocessing** as during training:

1. **Load Image**
   - Convert to RGB format
   - Handle different image formats (JPEG, PNG)

2. **Apply Circular Mask**
   - Creates circular mask (as in training)
   - Focuses on center area of image
   - Removes background noise

3. **Resize & Crop**
   - Resize to 256x256
   - Center crop to 224x224 (model input size)

4. **Normalize**
   - ImageNet normalization:
     - Mean: [0.485, 0.456, 0.406]
     - Std: [0.229, 0.224, 0.225]
   - Converts to tensor format

#### Step 2: Model Inference

1. **Load Model**
   - EfficientNet-B3 architecture
   - 5 output classes
   - Loads trained weights from `best_model_masked.pth`

2. **Run Prediction**
   - Image tensor → Model → Output probabilities
   - Gets probability scores for each class:
     - calculus
     - cancers
     - gingivitis
     - ulcers
     - olp

3. **Apply Softmax**
   - Converts raw outputs to probabilities
   - All probabilities sum to 100%

#### Step 3: Format Results

1. **Get Top Prediction**
   - Uses `np.argmax()` to find highest probability class
   - This is the model's detected class (one of 5)

2. **Map to Disease Names**
   - Maps class names to user-friendly names:
     - `calculus` → "Dental Calculus (Tartar)"
     - `cancers` → "Oral Cancer"
     - `gingivitis` → "Gingivitis"
     - `ulcers` → "Oral Ulcers"
     - `olp` → "Oral Lichen Planus (OLP)"

3. **Calculate Health Score**
   - Starts at 100
   - Deducts points based on severity:
     - High/Critical: -40
     - Moderate-High: -30
     - Moderate: -20
     - Low-Moderate: -10

### Example Output

#### Input: Image of teeth with gingivitis

#### Processing:
```
Image → Preprocess → Model → [0.05, 0.02, 0.85, 0.05, 0.03]
                              calculus cancers gingivitis ulcers olp
```

#### Output:
```json
{
  "detectedConditions": [{
    "modelClassName": "gingivitis",
    "name": "Gingivitis",
    "type": "oral_disease",
    "severity": "Moderate",
    "description": "Gingivitis detected. Gum inflammation...",
    "recommendation": "Professional dental cleaning..."
  }],
  "healthScore": 80,
  "hasOralCancer": false,
  "hasOralDiseases": true
}
```

---

## 🎯 Model Class Detection

### The 5 Classes

The model was trained on these 5 classes:

1. **Class 0: calculus** → Disease: "Dental Calculus (Tartar)"
2. **Class 1: cancers** → Disease: "Oral Cancer"
3. **Class 2: gingivitis** → Disease: "Gingivitis"
4. **Class 3: ulcers** → Disease: "Oral Ulcers"
5. **Class 4: olp** → Disease: "Oral Lichen Planus (OLP)"

### How Detection Works

#### Step 1: Image Upload
- User uploads an image via mobile app
- Image is sent to backend API endpoint: `/api/ai-scan/teeth-scan`

#### Step 2: Python Service Processing
- Backend forwards image to Python service: `http://localhost:5000/predict`
- Python service:
  1. Preprocesses image (circular mask, resize, normalize)
  2. Runs model inference
  3. Gets 5 prediction probabilities (one for each class)
  4. Finds highest probability → This is the detected class

#### Step 3: Class Detection
```python
# Model returns 5 probabilities: [prob_class0, prob_class1, prob_class2, prob_class3, prob_class4]
predictions = [0.05, 0.85, 0.05, 0.03, 0.02]
#                ↑     ↑     ↑     ↑     ↑
#            calculus cancers gingivitis ulcers olp

# Get index with highest probability
top_idx = np.argmax(predictions)  # Returns 1

# Map index to class name
class_names = {0: 'calculus', 1: 'cancers', 2: 'gingivitis', 3: 'ulcers', 4: 'olp'}
detected_class = class_names[top_idx]  # Returns 'cancers'
```

#### Step 4: Response
```json
{
  "success": true,
  "analysis": {
    "detectedConditions": [{
      "modelClassName": "cancers",  // ← This is the detected class from 5 classes
      "name": "Oral Cancer",
      "type": "oral_cancer"
    }]
  },
  "detectedClass": "cancers",  // ← Also at top level
  "diseaseName": "Oral Cancer"
}
```

### Important Notes

- **No thresholds**: The system uses the model's highest probability class directly
- **No filtering**: All model outputs are used as-is
- **Always returns**: The system always returns the detected class (one of 5)
- **Class name is required**: The `modelClassName` field must be one of: calculus, cancers, gingivitis, ulcers, olp

---

## 🧪 Testing & Verification

### Test Your Trained Model

After placing your model file, test if it's working:

```powershell
cd backend
py python-service/test_model.py
```

**Expected output:**
```
==================================================
Testing Trained Model
==================================================
✅ Model file found: .../best_model_masked.pth

📦 Loading model...
   Using device: cpu
✅ Model loaded successfully!

🧪 Testing with dummy image...
   Preprocessing image...
   ✅ Preprocessed. Shape: torch.Size([1, 3, 224, 224])
   Running prediction...
   ✅ Prediction complete!

📊 Prediction Results:
--------------------------------------------------
   calculus        :  20.00%
   cancers         :  20.00%
   gingivitis      :  20.00%
   ulcers          :  20.00%
   olp             :  20.00%
--------------------------------------------------
🎯 Top Prediction: calculus (20.00%)
==================================================
✅ Model test completed successfully!
```

### Verify Model Has 5 Classes

```powershell
cd backend\python-service
py verify_model_classes.py
```

**Expected output:**
```
✅ Model has correct number of classes (5)
📋 Expected Classes:
   Class 0: calculus
   Class 1: cancers
   Class 2: gingivitis
   Class 3: ulcers
   Class 4: olp
```

### Test with an Image

```powershell
# Start Python service
cd backend
START_PYTHON_SERVICE.bat

# In another terminal, test with image
curl -X POST http://localhost:5000/predict -F "image=@test_image.jpg"
```

### Check Console Logs

When image is uploaded, you should see:

**Python Service Console:**
```
📊 MODEL OUTPUT - All 5 Class Probabilities:
------------------------------------------------------------
   Class 0 (calculus    ):   5.00%
   Class 1 (cancers     ):  85.00% 👈 MODEL DETECTED THIS
   Class 2 (gingivitis  ):   5.00%
   Class 3 (ulcers      ):   3.00%
   Class 4 (olp         ):   2.00%
------------------------------------------------------------

🎯 MODEL DETECTED CLASS (from 5 classes):
   ✅ Class Index: 1 (0-4)
   ✅ Class Name: cancers
   ✅ Confidence: 85.0%
   ✅ Verified: This is one of the 5 trained classes
```

**Node.js Backend Console:**
```
✅ Model Detected Class: cancers
✅ Disease Name: Oral Cancer
✅ Verified: 'cancers' is a valid class from the 5 trained classes
```

**Flutter Console:**
```
🔍 Detected class name from model: cancers
📋 Disease name: Oral Cancer
```

### Verification Checklist

- ✅ Model file exists and can be loaded
- ✅ Model architecture matches (EfficientNet-B3, 5 classes)
- ✅ Image preprocessing works (circular mask, normalization)
- ✅ Model can make predictions
- ✅ Output format is correct
- ✅ Class name is returned in response

---

## 🐛 Troubleshooting

### Model file not found?

- Check path: `backend/models/oral_cancer_model/best_model_masked.pth`
- Verify file exists and is readable
- Make sure file is named exactly `best_model_masked.pth`

### Model not loading?

- Check model file path in `app.py`
- Verify model format is supported
- Check Python dependencies are installed
- Check error message for details

### Python service not responding?

- Check if service is running: `curl http://localhost:5000/health`
- Check port is not in use
- Review Python service logs
- Check firewall settings

### Port 5000 already in use?

- Change port in `python-service/app.py`: `port = 5001`
- Update Node.js `.env`: `PYTHON_SERVICE_URL=http://localhost:5001`

### Python not found?

- Use `py` command instead of `python`
- Or use: `py -m pip install ...`

### Node.js can't connect to Python service?

- Verify `PYTHON_SERVICE_URL` environment variable
- Check firewall settings
- Ensure Python service is running

### Model not detecting classes?

1. **Check model file exists:**
   ```
   backend/models/oral_cancer_model/best_model_masked.pth
   ```

2. **Verify model has 5 output classes:**
   ```powershell
   py backend/python-service/verify_model_classes.py
   ```

3. **Check Python service is running:**
   ```powershell
   curl http://localhost:5000/health
   ```

4. **Check class labels mapping:**
   - Should be: `{'0': 'calculus', '1': 'cancers', '2': 'gingivitis', '3': 'ulcers', '4': 'olp'}`
   - Must match training order exactly

### No class name in response?

1. Check Python service console logs
2. Look for `🎯 MODEL DETECTED CLASS` message
3. Verify `modelClassName` field in response
4. Check Flutter app logs for `🔍 Detected class name from model`

### Wrong class detected?

1. Verify model was trained correctly
2. Check if image preprocessing matches training
3. Test with training images to verify model works
4. Check class labels mapping matches training

### Import errors?

```bash
pip install torch torchvision flask flask-cors numpy Pillow
```

### CUDA/GPU issues?

- Model automatically uses CPU if CUDA unavailable
- Check logs: `🔧 Using device: cpu`

---

## ✅ Status & Next Steps

### Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Python Service | ✅ Ready | Port 5000, waits for model file |
| Node.js Backend | ✅ Ready | Dependencies installed |
| Model File | ⏳ Pending | Need to place `best_model_masked.pth` |
| Mobile App | ✅ Ready | Can connect when backend is running |

### How to Start Everything

#### Terminal 1: Python Service
```powershell
cd backend
py python-service/app.py
```

#### Terminal 2: Node.js Backend
```powershell
cd backend
npm start
```

#### Terminal 3: Mobile App
```powershell
cd mobile
flutter run
```

### Next Steps

1. ✅ Place model file in `backend\models\oral_cancer_model\`
2. ✅ Restart Python service
3. ✅ Start Node.js backend (`npm start`)
4. ✅ Test image upload from mobile app

### Verification

#### Check Python Service:
```powershell
curl http://localhost:5000/health
```

#### Check Node.js Backend:
```powershell
curl http://localhost:4000/api/health-check
```

---

## 🚀 Production Deployment

For production:

1. Use process manager (PM2, supervisor) for Python service
2. Set up reverse proxy (nginx) if needed
3. Use GPU if available for faster inference
4. Consider model optimization (quantization, pruning)
5. Monitor service health with `/health` endpoint

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all dependencies are installed
4. Check that model file is in correct location
5. Ensure Python service is running before starting Node.js backend

---

**Last Updated:** 2024
**Model Version:** EfficientNet-B3-v1.0
**Classes:** 5 (calculus, cancers, gingivitis, ulcers, olp)

