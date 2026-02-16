import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL_SERVICE || !EMAIL_USER || !EMAIL_PASSWORD) {
  throw new Error('Email configuration is missing in environment variables');
}

// Create a transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Send a welcome email to a new user
 * @param email User's email address
 * @param name User's name (optional)
 */
export const sendWelcomeEmail = async (email: string, name?: string): Promise<void> => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Welcome to changebag!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to changebag!</h2>
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for joining changebag! We're excited to have you as part of our community.</p>
          <p>With changebag, you can create, sponsor, and claim tote bags for various causes that matter to you.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The changebag Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

/**
 * Send a generic email
 * @param to Recipient email address
 * @param subject Email subject
 * @param htmlContent HTML content of the email
 */
export const sendEmail = async (to: string, subject: string, htmlContent: string): Promise<void> => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default {
  sendWelcomeEmail,
  sendEmail,
};
