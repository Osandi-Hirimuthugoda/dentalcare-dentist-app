/**
 * Professional HTML Email Template for DentalCare+
 * @param {Object} options - Template options
 * @param {string} options.userName - Name of the recipient
 * @param {string} options.message - Main message body
 * @param {string} [options.imageUrl] - Optional image URL to display
 * @param {string} [options.actionText] - Text for the call-to-action button
 * @param {string} [options.actionUrl] - URL for the call-to-action button
 * @returns {string} - HTML string
 */
export const getProfessionalEmailTemplate = ({ 
  userName, 
  message, 
  imageUrl, 
  actionText = "View in App", 
  actionUrl = "https://dentalcare-app.com" 
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DentalCare+ Notification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f4f7f9;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .header {
          background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1a73e8;
        }
        .message {
          font-size: 16px;
          margin-bottom: 30px;
          color: #555555;
        }
        .image-container {
          margin: 25px 0;
          text-align: center;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px dashed #dee2e6;
        }
        .image-container img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .action-button {
          display: inline-block;
          padding: 14px 30px;
          background-color: #1a73e8;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin-top: 10px;
          text-align: center;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #eeeeee;
        }
        .footer p {
          margin: 5px 0;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-links a {
          margin: 0 10px;
          color: #1a73e8;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DentalCare+</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${userName}!</div>
          <div class="message">
            ${message}
          </div>
          
          ${imageUrl ? `
          <div class="image-container">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Review Attachment:</p>
            <img src="${imageUrl}" alt="Scan Result">
          </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${actionUrl}" class="action-button">${actionText}</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing DentalCare+ for your oral health journey.</p>
          <p>© 2026 DentalCare+ Inc. All rights reserved.</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
          <div class="social-links">
            <a href="#">Support</a> | <a href="#">Privacy Policy</a> | <a href="#">Unsubscribe</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
