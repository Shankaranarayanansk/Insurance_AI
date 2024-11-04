import nodemailer from 'nodemailer';

const createTransporter = () => {
  // Validate required environment variables
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production', // Secure in production
      minVersion: 'TLSv1.2' // Enforce minimum TLS version
    },
    debug: process.env.NODE_ENV === 'development' // Enable debug logs in development
  });
};

const sendEmail = async ({ to, subject, html, cc, bcc, attachments }) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    
    const mailOptions = {
      from: `"InsureAI" <${process.env.SMTP_USER}>`,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments
    };

    // Remove undefined fields
    Object.keys(mailOptions).forEach(key => 
      mailOptions[key] === undefined && delete mailOptions[key]
    );

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default sendEmail;