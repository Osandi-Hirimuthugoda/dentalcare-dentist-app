import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sendProfessionalEmail } from "./src/services/notificationService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./.env") });

async function testProfessionalEmail() {
  console.log("Sending professional test email...");
  
  const result = await sendProfessionalEmail({
    to: process.env.EMAIL_USER, // Send to self for testing
    subject: "Your Dental Scan Results are Ready!",
    userName: "Chathuli",
    message: "Your dentist has reviewed your recent oral scan. There are some important updates regarding your dental calculus treatment plan. Please check the details below and log in to the app for the full report.",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800", // Sample professional dental image
    actionText: "View Full Report",
    actionUrl: "http://localhost:3000/reports"
  });

  if (result) {
    console.log("✅ Professional email sent successfully!");
  } else {
    console.log("❌ Failed to send email.");
  }
}

testProfessionalEmail();
