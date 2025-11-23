import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server with port retry logic
let PORT = parseInt(process.env.PORT) || 4000;

function startServer(port) {
  // Listen on 0.0.0.0 to allow connections from emulator (10.0.2.2) and network
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📍 API URL: http://localhost:${port}/api`);
    console.log(`📍 Android Emulator URL: http://10.0.2.2:${port}/api`);
    console.log(`🌐 Health check: http://localhost:${port}/api/health`);
    console.log(`✅ Server is accessible from Android emulator`);
  });

  server.on("error", (err) => {
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
