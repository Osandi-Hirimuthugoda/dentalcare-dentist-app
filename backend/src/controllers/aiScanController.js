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

// Flask API Configuration
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5000';

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
    // Log file details for debugging
    console.log('📁 File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname,
      extension: path.extname(file.originalname)
    });
    
    // Very lenient file type checking - accept if EITHER extension OR mimetype suggests it's an image
    const allowedExtensions = /\.(jpeg|jpg|png|gif|bmp|webp)$/i;
    const isImageMimeType = /^image\//i.test(file.mimetype);
    
    const extname = allowedExtensions.test(path.extname(file.originalname));
    
    // Accept if extension matches OR mimetype starts with "image/"
    if (extname || isImageMimeType) {
      console.log('✅ File accepted:', file.originalname, '- Extension:', extname, 'MIME:', isImageMimeType);
      return cb(null, true);
    } else {
      console.error('❌ File rejected:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname)
      });
      cb(new Error(`Only image files are allowed. Received MIME: ${file.mimetype || 'unknown'}, Extension: ${path.extname(file.originalname)}`));
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

// Check if Flask API service is available
const checkFlaskService = async () => {
  try {
    const url = new URL(`${FLASK_API_URL}/health`);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };
    
    return new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            console.log('🔍 Flask API health check response:', data);
            const json = JSON.parse(data);
            const isAvailable = json.model_exists === true;
            if (isAvailable) {
              console.log('✅ Flask API service is available and model is loaded');
            } else {
              console.log('⚠️  Flask API service is available but model is not loaded');
            }
            resolve(isAvailable);
          } catch (error) {
            console.log(`⚠️  Failed to parse Flask API health check: ${error.message}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`❌ Flask API service connection error: ${error.message}`);
        console.log(`   Make sure Flask API is running on ${FLASK_API_URL}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log(`⏱️  Flask API service health check timeout`);
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.log(`❌ Error checking Flask API service: ${error.message}`);
    return false;
  }
};

// Call Flask API for model prediction
const callFlaskAPI = async (imagePath) => {
  try {
    console.log(`📤 Sending image to Flask API: ${FLASK_API_URL}/predict`);
    console.log(`   Image path: ${imagePath}`);
    
    // Check if image file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Create form data with image file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    const url = new URL(`${FLASK_API_URL}/predict`);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: 'POST',
      headers: formData.getHeaders(),
      timeout: 60000  // 60 seconds timeout for model inference
    };
    
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              console.error(`❌ Flask API returned status ${res.statusCode}`);
              console.error(`   Response: ${data.substring(0, 200)}`);
              reject(new Error(`Flask API error: ${res.statusCode} - ${data.substring(0, 100)}`));
              return;
            }
            
            const result = JSON.parse(data);
            
            console.log('📥 Flask API response received');
            console.log(`   Full response:`, JSON.stringify(result, null, 2));
            
            // Extract prediction - handle different possible response formats
            let predictedClass = result.prediction || result.predicted_class || null;
            let diseaseName = result.disease_name || null;
            let confidence = result.confidence || 0;
            let allProbabilities = result.all_probabilities || {};
            
            // If prediction is missing, try to get from other fields
            if (!predictedClass && result.predicted_class) {
              predictedClass = result.predicted_class;
            }
            
            // Validate predicted class is one of the 5 trained classes
            const validClasses = ['calculus', 'cancers', 'gingivitis', 'ulcers', 'olp'];
            if (predictedClass && !validClasses.includes(predictedClass)) {
              console.warn(`⚠️  Predicted class '${predictedClass}' is not in valid classes: ${validClasses}`);
              // Try to normalize the class name
              predictedClass = predictedClass.toLowerCase();
              if (!validClasses.includes(predictedClass)) {
                console.error(`❌ Invalid predicted class: ${predictedClass}`);
                predictedClass = null;
              }
            }
            
            if (!predictedClass) {
              throw new Error('Flask API did not return a valid predicted class');
            }
            
            console.log(`   ✅ Extracted Prediction: ${predictedClass}`);
            console.log(`   ✅ Disease Name: ${diseaseName}`);
            console.log(`   ✅ Confidence: ${confidence}%`);
            
            // Get disease name if not provided
            if (!diseaseName) {
              diseaseName = getDiseaseName(predictedClass);
            }
            
            // Map to expected format for mobile app
            const detectedConditions = [{
              type: predictedClass === 'cancers' ? 'oral_cancer' : 'oral_disease',
              name: diseaseName,
              modelClassName: predictedClass,
              severity: predictedClass === 'cancers' ? 'High' : getSeverityFromConfidence(confidence),
              description: `${diseaseName} detected by AI model with ${confidence}% confidence.`,
              recommendation: getRecommendation(predictedClass),
              urgency: predictedClass === 'cancers' ? 'Critical' : 'Moderate',
              confidence: `${confidence}%`
            }];
            
            // Add other conditions with lower probabilities if significant
            Object.entries(allProbabilities).forEach(([className, prob]) => {
              if (className !== predictedClass && prob > 10) { // Show if > 10% confidence
                detectedConditions.push({
                  type: className === 'cancers' ? 'oral_cancer' : 'oral_disease',
                  name: getDiseaseName(className),
                  modelClassName: className,
                  severity: 'Low',
                  description: `${getDiseaseName(className)} - ${prob}% confidence.`,
                  recommendation: 'Consult a dental professional for evaluation.',
                  urgency: 'Low',
                  confidence: `${prob}%`
                });
              }
            });
            
            const analysis = {
              detectedConditions: detectedConditions,
              confidenceScores: {
                [predictedClass]: confidence
              },
              healthScore: calculateHealthScore(predictedClass, confidence),
              hasOralCancer: predictedClass === 'cancers',
              hasOralDiseases: predictedClass !== 'cancers',
              modelVersion: 'EfficientNet-B3-Flask',
              timestamp: new Date().toISOString()
            };
            
            console.log('✅ Converted Flask API response to analysis format');
            console.log(`   ✅ Detected class from model: ${predictedClass}`);
            console.log(`   ✅ Disease name: ${diseaseName}`);
            console.log(`   ✅ Confidence: ${confidence}%`);
            
            resolve(analysis);
          } catch (error) {
            console.error(`❌ Failed to parse Flask API response: ${error.message}`);
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
    console.error('❌ Error calling Flask API:', error.message);
    throw error;
  }
};

// Helper functions
function getDiseaseName(className) {
  const diseaseNames = {
    'calculus': 'Dental Calculus (Tartar)',
    'cancers': 'Oral Cancer',
    'gingivitis': 'Gingivitis',
    'ulcers': 'Oral Ulcers',
    'olp': 'Oral Lichen Planus (OLP)'
  };
  return diseaseNames[className] || className;
}

function getSeverityFromConfidence(confidence) {
  if (confidence >= 80) return 'High';
  if (confidence >= 60) return 'Moderate';
  return 'Low';
}

function getRecommendation(className) {
  const recommendations = {
    'calculus': 'Professional dental cleaning recommended. Maintain good oral hygiene.',
    'cancers': 'URGENT: Please consult an oral oncologist immediately for further evaluation and biopsy.',
    'gingivitis': 'Professional dental cleaning and improved oral hygiene routine recommended.',
    'ulcers': 'Consult a dental professional for proper diagnosis and treatment.',
    'olp': 'Consult an oral medicine specialist for proper diagnosis and treatment.'
  };
  return recommendations[className] || 'Consult a dental professional for proper diagnosis and treatment.';
}

function calculateHealthScore(className, confidence) {
  if (className === 'cancers') return 40;
  if (className === 'gingivitis') return 75;
  if (className === 'ulcers') return 70;
  if (className === 'olp') return 65;
  if (className === 'calculus') return 80;
  return 85;
}

// GET /api/ai-scan/health - Check if AI (Flask) service is reachable and model is loaded
export const getAiScanHealth = async (req, res) => {
  try {
    const url = new URL(`${FLASK_API_URL}/health`);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };
    const data = await new Promise((resolve, reject) => {
      const httpReq = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve(body));
      });
      httpReq.on('error', reject);
      httpReq.on('timeout', () => { httpReq.destroy(); reject(new Error('timeout')); });
      httpReq.end();
    });
    const json = JSON.parse(data);
    return res.status(200).json({
      backend: 'ok',
      aiService: FLASK_API_URL,
      ai: json,
      message: json.model_loaded
        ? 'AI model is loaded and ready for predictions.'
        : json.model_exists
          ? 'AI service is up but model failed to load. Check AI container logs.'
          : 'AI service is up but model_weights.pth is missing. Add it to backend/models/ and rebuild or mount the volume.'
    });
  } catch (err) {
    return res.status(503).json({
      backend: 'ok',
      aiService: FLASK_API_URL,
      ai: null,
      error: err.message,
      message: 'Cannot reach AI service. Ensure the AI container is running (docker-compose: dentalcare-ai-model) and FLASK_API_URL is correct.'
    });
  }
};

// Process teeth scan image with AI/CNN model
export const processTeethScan = async (req, res) => {
  console.log("🚀 AI Scan endpoint hit!");
  console.log("   Method:", req.method);
  console.log("   Path:", req.path);
  console.log("   Has file:", !!req.file);
  console.log("   File details:", req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  } : "No file");
  
  try {
    // Verify authentication (optional when ALLOW_DB_FAILURE is true)
    const user = getUserFromToken(req);
    const allowWithoutAuth = process.env.ALLOW_DB_FAILURE === 'true';
    
    console.log("   User:", user ? user.id : "anonymous");
    console.log("   Allow without auth:", allowWithoutAuth);
    
    if (!allowWithoutAuth && (!user || user.role !== "patient")) {
      console.log("   ❌ Authentication failed");
      return res.status(401).json({ message: "Unauthorized. Patient authentication required." });
    }
    
    if (!req.file) {
      console.log("   ❌ No file provided");
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const imagePath = req.file.path;
    const userId = user?.id || 'anonymous';
    
    console.log(`🔬 Processing teeth scan image: ${imagePath} for user: ${userId}`);
    
    let analysisResults;
    let usingRealModel = false;
    
    // Try to use Flask API with real model
    try {
      console.log('🔍 Checking Flask API service availability...');
      const flaskServiceAvailable = await checkFlaskService();
      
      if (flaskServiceAvailable) {
        console.log('✅ Flask API service available! Calling trained model...');
        try {
          analysisResults = await callFlaskAPI(imagePath);
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
          }
        } catch (callError) {
          console.error('❌ Error calling Flask API:', callError.message);
          console.error('   Stack:', callError.stack);
          console.log('⚠️  Falling back to simulation mode');
          // Fall back to simulation
          await new Promise(resolve => setTimeout(resolve, 1500));
          analysisResults = getMockAnalysis();
        }
      } else {
        // Fall back to simulation
        console.log('⚠️  Flask API service not available, using simulation mode');
        console.log('   To use real trained model:');
        console.log('   1. Make sure Flask API is running: cd backend/models && python flask_api.py');
        console.log('   2. Flask API should run on: http://localhost:5000');
        console.log('   3. Set FLASK_API_URL in .env if using different port');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        analysisResults = getMockAnalysis();
      }
    } catch (error) {
      // If Flask API fails, fall back to simulation
      console.error('❌ Flask API error, falling back to simulation:', error.message);
      await new Promise(resolve => setTimeout(resolve, 1500));
      analysisResults = getMockAnalysis();
    }
    
    // Add timestamp if not present
    if (!analysisResults.timestamp) {
      analysisResults.timestamp = new Date().toISOString();
    }
    
    console.log(`\n✅ AI Scan completed for user ${userId}`);
    console.log('📊 Final Results Summary:');
    console.log(`   - Using Real Model: ${usingRealModel ? 'YES ✅' : 'NO ⚠️ (Simulation)'}`);
    console.log(`   - Has Oral Cancer: ${analysisResults.hasOralCancer || false}`);
    console.log(`   - Has Oral Diseases: ${analysisResults.hasOralDiseases || false}`);
    console.log(`   - Health Score: ${analysisResults.healthScore || 'N/A'}`);
    console.log(`   - Detected Conditions: ${analysisResults.detectedConditions?.length || 0}`);
    
    if (analysisResults.detectedConditions && analysisResults.detectedConditions.length > 0) {
      const topCondition = analysisResults.detectedConditions[0];
      console.log(`\n🎯 Model Detection Result:`);
      console.log(`   - Detected Class: ${topCondition.modelClassName || 'Unknown'}`);
      console.log(`   - Disease Name: ${topCondition.name || 'Unknown'}`);
    }
    
    const response = {
      success: true,
      message: "Image processed successfully",
      analysis: analysisResults,
      imageUrl: `/uploads/teeth-scans/${req.file.filename}`,
      usingRealModel: usingRealModel
    };
    
    // Add detected class at top level for easy access
    if (analysisResults.detectedConditions && analysisResults.detectedConditions.length > 0) {
      response.detectedClass = analysisResults.detectedConditions[0].modelClassName;
      response.diseaseName = analysisResults.detectedConditions[0].name;
    }
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error("❌ Error processing teeth scan:", error);
    console.error("   Error stack:", error.stack);
    
    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("   Failed to delete file:", unlinkError.message);
      }
    }
    
    // Provide detailed error in development
    const errorResponse = {
      message: "Failed to process image. Please try again.",
    };
    
    if (process.env.NODE_ENV === "development" || process.env.ALLOW_DB_FAILURE === 'true') {
      errorResponse.error = error.message;
      errorResponse.details = "Check backend console logs for more information";
    }
    
    res.status(500).json(errorResponse);
  }
};

// Mock analysis for fallback (when Flask API is not available)
function getMockAnalysis() {
  return {
    detectedConditions: [{
      type: 'oral_disease',
      name: 'Dental Analysis',
      modelClassName: 'unknown',
      severity: 'Moderate',
      description: 'AI analysis feature is currently being set up. Please consult a dental professional for accurate diagnosis.',
      recommendation: 'This is a frontend-only demonstration. Backend AI processing will be available soon.',
      urgency: 'Moderate',
      confidence: '0%'
    }],
    confidenceScores: {},
    healthScore: 80,
    hasOralCancer: false,
    hasOralDiseases: true,
    modelVersion: 'Simulation-Mode',
    timestamp: new Date().toISOString()
  };
}

