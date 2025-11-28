import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import FormData from "form-data";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "dentalcare_secret_key_change_in_production";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/teeth-scans';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'teeth-scan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
    }
  }
});

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Simulate CNN model processing for oral cancer and diseases detection
const simulateCNNProcessing = (imagePath) => {
  // In a real implementation, this would call a trained CNN model
  // For now, we simulate the model's output based on image analysis
  
  // Simulate processing delay (CNN models take time to process)
  const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
  
  // Simulate detection results
  // In production, this would be the actual CNN model output
  const hasOralCancer = Math.random() < 0.15; // 15% chance of detecting oral cancer
  const hasOralDiseases = Math.random() < 0.40; // 40% chance of detecting oral diseases
  
  const detectedConditions = [];
  const confidenceScores = {};
  
  // Oral Cancer Detection
  if (hasOralCancer) {
    const cancerTypes = [
      'Squamous Cell Carcinoma',
      'Oral Leukoplakia (Pre-cancerous)',
      'Erythroplakia (Pre-cancerous)'
    ];
    const cancerType = cancerTypes[Math.floor(Math.random() * cancerTypes.length)];
    const confidence = (Math.random() * 20 + 75).toFixed(1); // 75-95% confidence
    
    detectedConditions.push({
      type: 'oral_cancer',
      name: cancerType,
      severity: 'High',
      confidence: `${confidence}%`,
      description: 'Potential oral cancer detected. Immediate medical attention required.',
      recommendation: 'Please consult an oral oncologist immediately for further evaluation and biopsy.',
      urgency: 'Critical'
    });
    
    confidenceScores.oralCancer = parseFloat(confidence);
  } else {
    confidenceScores.oralCancer = (Math.random() * 10 + 85).toFixed(1); // 85-95% confidence for no cancer
  }
  
  // Oral Diseases Detection
  if (hasOralDiseases) {
    const diseases = [
      {
        name: 'Gingivitis',
        severity: 'Moderate',
        confidence: (Math.random() * 15 + 80).toFixed(1),
        description: 'Gum inflammation detected. Early stage periodontal disease.',
        recommendation: 'Professional dental cleaning and improved oral hygiene routine.'
      },
      {
        name: 'Periodontitis',
        severity: 'Moderate-High',
        confidence: (Math.random() * 15 + 75).toFixed(1),
        description: 'Advanced gum disease with potential bone loss.',
        recommendation: 'Immediate periodontal treatment required. Consult a periodontist.'
      },
      {
        name: 'Tooth Decay (Cavities)',
        severity: 'Moderate',
        confidence: (Math.random() * 15 + 80).toFixed(1),
        description: 'Multiple cavities detected in teeth.',
        recommendation: 'Dental fillings or root canal treatment may be needed.'
      },
      {
        name: 'Oral Thrush (Candidiasis)',
        severity: 'Moderate',
        confidence: (Math.random() * 15 + 75).toFixed(1),
        description: 'Fungal infection detected in oral cavity.',
        recommendation: 'Antifungal medication and improved oral hygiene.'
      },
      {
        name: 'Oral Ulcers',
        severity: 'Low-Moderate',
        confidence: (Math.random() * 15 + 70).toFixed(1),
        description: 'Multiple ulcers detected in oral cavity.',
        recommendation: 'May require medication. Consult dentist if persistent.'
      }
    ];
    
    // Select 1-3 diseases randomly
    const numDiseases = Math.floor(Math.random() * 3) + 1;
    const selectedDiseases = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < numDiseases && i < diseases.length; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * diseases.length);
      } while (usedIndices.has(index));
      usedIndices.add(index);
      selectedDiseases.push(diseases[index]);
    }
    
    selectedDiseases.forEach(disease => {
      detectedConditions.push({
        type: 'oral_disease',
        name: disease.name,
        severity: disease.severity,
        confidence: `${disease.confidence}%`,
        description: disease.description,
        recommendation: disease.recommendation,
        urgency: disease.severity.includes('High') ? 'High' : 'Moderate'
      });
    });
    
    confidenceScores.oralDiseases = parseFloat(selectedDiseases[0].confidence);
  } else {
    // No diseases detected
    detectedConditions.push({
      type: 'healthy',
      name: 'Good Oral Health',
      severity: 'Low',
      confidence: '92%',
      description: 'No significant oral diseases detected. Maintain good oral hygiene.',
      recommendation: 'Continue regular dental checkups every 6 months.',
      urgency: 'Low'
    });
    
    confidenceScores.oralDiseases = 92.0;
  }
  
  // Calculate overall health score
  let healthScore = 100;
  detectedConditions.forEach(condition => {
    if (condition.severity === 'High' || condition.urgency === 'Critical') {
      healthScore -= 40;
    } else if (condition.severity === 'Moderate-High') {
      healthScore -= 30;
    } else if (condition.severity === 'Moderate') {
      healthScore -= 20;
    } else if (condition.severity === 'Low-Moderate') {
      healthScore -= 10;
    }
  });
  healthScore = Math.max(0, healthScore);
  
  return {
    detectedConditions,
    confidenceScores,
    healthScore: Math.round(healthScore),
    hasOralCancer,
    hasOralDiseases: hasOralDiseases && !hasOralCancer, // Don't count cancer as disease
    processingTime: Math.round(processingTime),
    modelVersion: 'CNN-v1.0',
    timestamp: new Date().toISOString()
  };
};

// Check if Python service is available
const checkPythonService = async () => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
  try {
    const url = new URL(`${pythonServiceUrl}/health`);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: 'GET',
      timeout: 5000  // Increased timeout
    };
    
    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const isAvailable = json.model_loaded === true;
            if (isAvailable) {
              console.log('✅ Python service is available and model is loaded');
            } else {
              console.log('⚠️  Python service is available but model is not loaded');
              console.log(`   Model path: ${json.model_path || 'Not specified'}`);
            }
            resolve(isAvailable);
          } catch (error) {
            console.log(`⚠️  Failed to parse Python service health check: ${error.message}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`❌ Python service connection error: ${error.message}`);
        console.log(`   Make sure Python service is running on ${pythonServiceUrl}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log(`⏱️  Python service health check timeout`);
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.log(`❌ Error checking Python service: ${error.message}`);
    return false;
  }
};

// Call Python service for model prediction
const callPythonService = async (imagePath) => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
  
  try {
    console.log(`📤 Sending image to Python service: ${pythonServiceUrl}/predict`);
    console.log(`   Image path: ${imagePath}`);
    
    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Create form data with image file
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const url = new URL(`${pythonServiceUrl}/predict`);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: 'POST',
      headers: formData.getHeaders(),
      timeout: 60000  // Increased timeout for model inference
    };
    
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              console.error(`❌ Python service returned status ${res.statusCode}`);
              console.error(`   Response: ${data.substring(0, 200)}`);
              reject(new Error(`Python service error: ${res.statusCode} - ${data.substring(0, 100)}`));
              return;
            }
            
            const result = JSON.parse(data);
            
            console.log('📥 Python service response received');
            console.log(`   Success: ${result.success}`);
            console.log(`   Has analysis: ${!!result.analysis}`);
            
            if (result.success && result.analysis) {
              const analysis = result.analysis;
              console.log('✅ Received valid response from Python service');
              console.log(`   Analysis keys: ${Object.keys(analysis).join(', ')}`);
              
              // Verify detectedConditions exists
              if (analysis.detectedConditions && analysis.detectedConditions.length > 0) {
                const topCondition = analysis.detectedConditions[0];
                console.log(`   ✅ Detected class from model: ${topCondition.modelClassName || 'Missing!'}`);
                console.log(`   ✅ Disease name: ${topCondition.name || 'Missing!'}`);
              } else {
                console.log(`   ⚠️  WARNING: No detectedConditions in analysis!`);
                console.log(`   Analysis keys: ${Object.keys(analysis).join(', ')}`);
              }
              
              resolve(analysis);
            } else {
              console.error(`❌ Invalid response from Python service:`, result);
              reject(new Error(result.error || 'Invalid response from Python service'));
            }
          } catch (error) {
            console.error(`❌ Failed to parse Python service response: ${error.message}`);
            console.error(`   Response data: ${data.substring(0, 500)}`);
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`❌ Request error: ${error.message}`);
        reject(new Error(`Request failed: ${error.message}`));
      });
      
      req.on('timeout', () => {
        console.error(`⏱️  Request timeout after 60 seconds`);
        req.destroy();
        reject(new Error('Request timeout - model inference took too long'));
      });
      
      formData.pipe(req);
    });
  } catch (error) {
    console.error('❌ Error calling Python service:', error.message);
    throw error;
  }
};

// Process teeth scan image with AI/CNN model
export const processTeethScan = async (req, res) => {
  try {
    // Verify authentication
    const user = getUserFromToken(req);
    if (!user || user.role !== "patient") {
      return res.status(401).json({ message: "Unauthorized. Patient authentication required." });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const imagePath = req.file.path;
    
    console.log(`🔬 Processing teeth scan image: ${imagePath} for patient: ${user.id}`);
    
    let analysisResults;
    let usingRealModel = false;
    
    // Try to use Python service with real model
    try {
      console.log('🔍 Checking Python service availability...');
      const pythonServiceAvailable = await checkPythonService();
      
      if (pythonServiceAvailable) {
        console.log('✅ Python service available! Calling trained CNN model...');
        try {
          analysisResults = await callPythonService(imagePath);
          usingRealModel = true;
          
          console.log('\n✅ Successfully processed image with trained model');
          console.log('📊 Model Output Summary:');
          console.log(`   - Detected conditions: ${analysisResults.detectedConditions?.length || 0}`);
          
          if (analysisResults.detectedConditions && analysisResults.detectedConditions.length > 0) {
            const topCondition = analysisResults.detectedConditions[0];
            const detectedClass = topCondition.modelClassName || 'Unknown';
            const diseaseName = topCondition.name || 'Unknown';
            
            console.log(`   ✅ Model Detected Class: ${detectedClass}`);
            console.log(`   ✅ Disease Name: ${diseaseName}`);
            console.log(`   ✅ Type: ${topCondition.type || 'Unknown'}`);
            
            // Verify it's one of the 5 classes
            const validClasses = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp'];
            if (validClasses.includes(detectedClass)) {
              console.log(`   ✅ Verified: '${detectedClass}' is a valid class from the 5 trained classes`);
            } else {
              console.log(`   ⚠️  Warning: '${detectedClass}' is not in expected classes: ${validClasses}`);
            }
          } else {
            console.log('   ⚠️  WARNING: No detected conditions in model output!');
            console.log('   This should not happen. Model should always detect a class.');
          }
        } catch (callError) {
          console.error('❌ Error calling Python service:', callError.message);
          console.error('   Stack:', callError.stack);
          console.log('⚠️  Falling back to simulation mode');
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          analysisResults = simulateCNNProcessing(imagePath);
        }
      } else {
        // Fall back to simulation
        console.log('⚠️  Python service not available, using simulation mode');
        console.log('   To use real trained model:');
        console.log('   1. Make sure model file exists: backend/models/oral_cancer_model/best_model_masked.pth');
        console.log('   2. Install Python dependencies: pip install -r backend/python-service/requirements.txt');
        console.log('   3. Start Python service: cd backend && START_PYTHON_SERVICE.bat');
        console.log('   4. Or manually: cd backend/python-service && python app.py');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get simulated CNN model results
        analysisResults = simulateCNNProcessing(imagePath);
      }
    } catch (error) {
      // If Python service fails, fall back to simulation
      console.error('❌ Python service error, falling back to simulation:', error.message);
      console.error('   Stack:', error.stack);
      await new Promise(resolve => setTimeout(resolve, 1500));
      analysisResults = simulateCNNProcessing(imagePath);
    }
    
    // Add timestamp if not present
    if (!analysisResults.timestamp) {
      analysisResults.timestamp = new Date().toISOString();
    }
    
    // Clean up uploaded file after processing (optional - you might want to keep it)
    // fs.unlinkSync(imagePath);
    
    console.log(`\n✅ AI Scan completed for patient ${user.id}`);
    console.log('📊 Final Results Summary:');
    console.log(`   - Using Real Model: ${usingRealModel ? 'YES ✅' : 'NO ⚠️ (Simulation)'}`);
    console.log(`   - Has Oral Cancer: ${analysisResults.hasOralCancer || false}`);
    console.log(`   - Has Oral Diseases: ${analysisResults.hasOralDiseases || false}`);
    console.log(`   - Health Score: ${analysisResults.healthScore || 'N/A'}`);
    console.log(`   - Detected Conditions: ${analysisResults.detectedConditions?.length || 0}`);
    console.log(`   - Model Version: ${analysisResults.modelVersion || 'Unknown'}`);
    
    if (analysisResults.detectedConditions && analysisResults.detectedConditions.length > 0) {
      const topCondition = analysisResults.detectedConditions[0];
      console.log(`\n🎯 Model Detection Result:`);
      console.log(`   - Detected Class: ${topCondition.modelClassName || 'Unknown'}`);
      console.log(`   - Disease Name: ${topCondition.name || 'Unknown'}`);
      console.log(`   - This will be sent to mobile app`);
    } else {
      console.log(`\n⚠️  WARNING: No detected conditions in results!`);
      console.log(`   Results keys: ${Object.keys(analysisResults).join(', ')}`);
    }
    
    if (usingRealModel) {
      console.log(`\n🎯 Using trained CNN model: ${analysisResults.modelVersion || 'EfficientNet-B3'}`);
      console.log(`   Model output is being used (not simulation)`);
    } else {
      console.log(`\n⚠️  Using simulation mode - real model not available`);
      console.log(`   To use real model:`);
      console.log(`   1. Make sure model file exists: backend/models/oral_cancer_model/best_model_masked.pth`);
      console.log(`   2. Start Python service: cd backend && START_PYTHON_SERVICE.bat`);
    }
    
    // Verify analysisResults contains detectedConditions before sending
    if (!analysisResults.detectedConditions || analysisResults.detectedConditions.length === 0) {
      console.log('⚠️  WARNING: analysisResults missing detectedConditions!');
      console.log('   Analysis results keys:', Object.keys(analysisResults));
      console.log('   This should not happen. Check Python service response.');
    } else {
      const topCondition = analysisResults.detectedConditions[0];
      console.log(`\n📤 Sending response to mobile app:`);
      console.log(`   ✅ Detected Class: ${topCondition.modelClassName || 'Missing!'}`);
      console.log(`   ✅ Disease Name: ${topCondition.name || 'Missing!'}`);
      console.log(`   ✅ Total Conditions: ${analysisResults.detectedConditions.length}`);
    }
    
    const response = {
      success: true,
      message: "Image processed successfully",
      analysis: analysisResults,  // Contains detectedConditions with modelClassName
      imageUrl: `/uploads/teeth-scans/${req.file.filename}`,
      usingRealModel: usingRealModel
    };
    
    // Add detected class at top level for easy access
    if (analysisResults.detectedConditions && analysisResults.detectedConditions.length > 0) {
      response.detectedClass = analysisResults.detectedConditions[0].modelClassName;
      response.diseaseName = analysisResults.detectedConditions[0].name;
      console.log(`   ✅ Added to response: detectedClass=${response.detectedClass}, diseaseName=${response.diseaseName}`);
    }
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error("❌ Error processing teeth scan:", error);
    
    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "Failed to process image. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

