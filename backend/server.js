import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import doctorRoutes from "./src/routes/doctorRoutes.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import patientRoutes from "./src/routes/patientRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import availabilityRoutes from "./src/routes/availabilityRoutes.js";
import billRoutes from "./src/routes/billRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import hospitalRoutes from "./src/routes/hospitalRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import walletRoutes from "./src/routes/walletRoutes.js";
import aiScanRoutes from "./src/routes/aiScanRoutes.js";
import scanQARoutes from "./src/routes/scanQARoutes.js";
// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://10.0.2.2:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  
  // Join room based on user type and ID
  socket.on('join', (data) => {
    const { userId, userType } = data;
    const room = `${userType}_${userId}`;
    socket.join(room);
    console.log(`👤 ${userType} ${userId} joined room: ${room}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io available globally for notifications
global.io = io;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "DentalCare+ Mobile App Backend API",
    version: "1.0.0",
    status: "running"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Doctor routes (for mobile app to get list of doctors)
app.use("/api/doctors", doctorRoutes);

// Appointment routes (for booking appointments)
app.use("/api/appointments", appointmentRoutes);

// Service routes (for getting available services)
app.use("/api/services", serviceRoutes);

// Admin routes (for web app admin panel)
app.use("/api/admins", adminRoutes);

// Patient routes (for web app - doctors viewing patients)
app.use("/api/patients", patientRoutes);

// Message routes (for chat/messaging between doctors and patients)
app.use("/api/messages", messageRoutes);

// Availability routes (for doctors to set their available dates/times)
app.use("/api/availability", availabilityRoutes);

// Bill routes (for billing and payment management)
app.use("/api/bills", billRoutes);

// Review routes (for doctor reviews and ratings)
app.use("/api/reviews", reviewRoutes);

// Notification routes (for patient notifications)
app.use("/api/notifications", notificationRoutes);

// Hospital routes (for hospital management and search)
app.use("/api/hospitals", hospitalRoutes);

// Health routes (for health tips, scores, and activities)
app.use("/api/health", healthRoutes);

// Wallet routes (for wallet balance, top-up, and payments)
app.use("/api/wallet", walletRoutes);

// AI Scan routes (for teeth scan image analysis)
app.use("/api/ai-scan", aiScanRoutes);

// Scan Q&A routes (for dentist-patient Q&A after scan processing)
app.use("/api/scan-qa", scanQARoutes);

// Health check (keep existing endpoint for server health)
app.get("/api/health-check", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  console.error("   Error stack:", err.stack);
  console.error("   Request path:", req.path);
  console.error("   Request method:", req.method);
  
  const errorResponse = {
    message: "Internal server error",
  };
  
  // Include error details in development or when ALLOW_DB_FAILURE is set
  if (process.env.NODE_ENV === "development" || process.env.ALLOW_DB_FAILURE === 'true') {
    errorResponse.error = err.message;
    errorResponse.stack = err.stack;
    errorResponse.details = "Check backend console logs for more information";
  }
  
  res.status(500).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server with port retry logic
let PORT = parseInt(process.env.PORT) || 4000;

function startServer(port) {
  // Listen on 0.0.0.0 to allow connections from emulator (10.0.2.2) and network
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📡 API URL: http://localhost:${port}/api`);
    console.log(`📱 Android Emulator URL: http://10.0.2.2:${port}/api`);
    console.log(`🔔 Socket.io enabled for real-time notifications`);
    console.log(`💚 Health check: http://localhost:${port}/api/health`);
    console.log(`✅ Server is accessible from Android emulator`);
  });

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`❗ Port ${port} already in use. Trying another port...`);
      startServer(port + 1); // Try next port
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(PORT);
