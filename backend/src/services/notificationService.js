import nodemailer from "nodemailer";
import { getProfessionalEmailTemplate } from "../utils/emailTemplates.js";

// Note: If you want to use Twilio, you'd need to install it: npm install twilio
// import twilio from "twilio";

// Configure transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email notification via Gmail
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email plain text content
 * @param {string} html - Email HTML content
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"DentalCare+" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log("📧 Email sent successfully via Gmail: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email via Gmail:", error.message);
    return false;
  }
};

/**
 * Send an SMS notification
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS message content
 */
export const sendSMS = async (phone, message) => {
  try {
    // If you have Twilio credentials in .env, you can uncomment this:
    /*
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    */
    
    console.log(`📱 SMS Sent (Logic defined): To ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
    return false;
  }
};

/**
 * Send a professional styled email
 * @param {Object} options - Email options
 */
export const sendProfessionalEmail = async ({ to, subject, userName, message, imageUrl, actionText, actionUrl }) => {
  const html = getProfessionalEmailTemplate({ userName, message, imageUrl, actionText, actionUrl });
  const text = `${message}\n\nVisit: ${actionUrl}`;
  
  return await sendEmail(to, subject, text, html);
};

