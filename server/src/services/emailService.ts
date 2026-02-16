import nodemailer from 'nodemailer';
import { generateOTP } from '../utils/otpUtils';

// Track recently sent emails to prevent duplicates
const recentEmails = new Map<string, number>();

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to prevent duplicate emails
const preventDuplicateEmails = (email: string): boolean => {
  const now = Date.now();
  const lastSent = recentEmails.get(email);
  
  if (lastSent && now - lastSent < 5000) {
    console.log(`DUPLICATE PREVENTION: Email to ${email} was already sent in the last 5 seconds. Skipping.`);
    return true; // Skip sending
  }
  
  // Update the timestamp for this email
  recentEmails.set(email, now);
  
  // Clean up old entries every 100 emails to prevent memory leaks
  if (recentEmails.size > 100) {
    const fiveMinutesAgo = now - 300000;
    for (const [key, timestamp] of recentEmails.entries()) {
      if (timestamp < fiveMinutesAgo) {
        recentEmails.delete(key);
      }
    }
  }
  
  return false; // Continue sending
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  try {
    // Check for duplicate emails
    if (preventDuplicateEmails(email)) {
      return true; // Pretend we sent it successfully
    }
    
    console.log(`SENDING EMAIL: Preparing to send email to ${email} with OTP ${otp}`);
    
    const mailOptions = {
      from: '"changebag" <noreply@changebag.com>',
      to: email,
      subject: 'Verify Your Tote Claim',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Thank you for claiming a tote! Please use the following verification code to complete your claim:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`EMAIL SENT SUCCESSFULLY: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`ERROR SENDING EMAIL to ${email}:`, error);
    throw error;
  }
};

/**
 * Send an approval email to the sponsor
 * @param email Sponsor's email address
 * @param data Sponsorship data including organization name, cause title, etc.
 */
export const sendLogoApprovalEmail = async (
  email: string, 
  data: {
    organizationName: string;
    causeTitle: string;
  }
) => {
  try {
    // Check for duplicate emails
    if (preventDuplicateEmails(email)) {
      return true;
    }
    
    console.log(`SENDING APPROVAL EMAIL: Preparing to send email to ${email}`);
    
    const mailOptions = {
      from: '"changebag" <noreply@changebag.com>',
      to: email,
      subject: 'Congratulations! Your Logo Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations, ${data.organizationName}!</h2>
          <p>Your logo for the <strong>${data.causeTitle}</strong> campaign has been approved.</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <p style="margin-top: 0;"><strong>What happens next?</strong></p>
            <ul>
              <li>Your logo will now appear on the campaign page</li>
              <li>Your logo will be printed on the tote bags as per your specifications</li>
              <li>You'll receive updates as the campaign progresses</li>
            </ul>
          </div>
          
          <p>Thank you for your support of this important cause!</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The changebag Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`APPROVAL EMAIL SENT SUCCESSFULLY: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`ERROR SENDING APPROVAL EMAIL to ${email}:`, error);
    throw error;
  }
};

/**
 * Send a rejection email to the sponsor with a reupload link
 * @param email Sponsor's email address
 * @param data Sponsorship data including ID, organization name, cause title, rejection reason
 */
export const sendLogoRejectionEmail = async (
  email: string, 
  data: {
    sponsorshipId: string;
    organizationName: string;
    causeTitle: string;
    rejectionReason: string;
  }
) => {
  try {
    // Check for duplicate emails
    if (preventDuplicateEmails(email)) {
      return true;
    }
    
    console.log(`SENDING REJECTION EMAIL: Preparing to send email to ${email}`);
    
    // Create a secure reupload link
    const reuploadLink = `https://changebag.org/sponsor/logo-reupload/${data.sponsorshipId}`;
    
    const mailOptions = {
      from: '"changebag" <noreply@changebag.com>',
      to: email,
      subject: 'Action Required: Your Logo Needs Revision',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Logo Update Required</h2>
          <p>Dear ${data.organizationName},</p>
          
          <p>Thank you for your support of the <strong>${data.causeTitle}</strong> campaign.</p>
          
          <p>We've reviewed your submitted logo and unfortunately, we're unable to approve it in its current form.</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <p style="margin-top: 0;"><strong>Reason for rejection:</strong></p>
            <p>${data.rejectionReason}</p>
          </div>
          
          <p><strong>What to do next:</strong></p>
          <p>Please upload a revised logo that addresses the issues mentioned above using the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${reuploadLink}"
              style="background-color: #0070f3; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;"
            >
              Upload New Logo
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The changebag Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`REJECTION EMAIL SENT SUCCESSFULLY: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`ERROR SENDING REJECTION EMAIL to ${email}:`, error);
    throw error;
  }
};

/**
 * Send a campaign completion email to the sponsor
 * @param email Sponsor's email address
 * @param data Sponsorship data including organization name, cause title, etc.
 */
export const sendCampaignCompletionEmail = async (
  email: string, 
  data: {
    organizationName: string;
    causeTitle: string;
    totalAmount: number;
    toteQuantity: number;
    distributionStartDate: Date;
    distributionEndDate: Date;
  }
) => {
  try {
    // Check for duplicate emails
    if (preventDuplicateEmails(email)) {
      return true;
    }
    
    console.log(`SENDING CAMPAIGN COMPLETION EMAIL: Preparing to send email to ${email}`);
    
    // Format dates
    const startDate = new Date(data.distributionStartDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const endDate = new Date(data.distributionEndDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // Format currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(data.totalAmount);
    
    const mailOptions = {
      from: '"changebag" <noreply@changebag.com>',
      to: email,
      subject: 'Campaign Completed: Thank You for Your Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Campaign Successfully Completed</h2>
          <p>Dear ${data.organizationName},</p>
          
          <p>We're pleased to inform you that your sponsorship campaign for <strong>${data.causeTitle}</strong> has been successfully completed!</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <p style="margin-top: 0;"><strong>Campaign Summary:</strong></p>
            <ul>
              <li>Campaign: <strong>${data.causeTitle}</strong></li>
              <li>Total Contribution: <strong>${formattedAmount}</strong></li>
              <li>Number of Totes: <strong>${data.toteQuantity}</strong></li>
              <li>Distribution Period: <strong>${startDate}</strong> to <strong>${endDate}</strong></li>
            </ul>
          </div>
          
          <p>Your support has made a significant impact on this cause. The tote bags featuring your logo have been distributed as planned, raising awareness for both your organization and the cause you've supported.</p>
          
          <p>We hope this partnership has been valuable for your organization, and we look forward to potential future collaborations.</p>
          
          <p>If you'd like to receive a detailed impact report or have any questions about your completed campaign, please contact our support team.</p>
          
          <p>Thank you again for your generous support!</p>
          
          <p>Best regards,<br>The changebag Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`CAMPAIGN COMPLETION EMAIL SENT SUCCESSFULLY: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`ERROR SENDING CAMPAIGN COMPLETION EMAIL to ${email}:`, error);
    throw error;
  }
};

/**
 * Send an invoice email to the sponsor with PDF attachment
 * @param email Sponsor's email address
 * @param data Invoice data including organization name, cause title, invoice number, etc.
 * @param pdfPath Path to the generated PDF invoice
 */
export const sendInvoiceEmail = async (
  email: string, 
  data: {
    organizationName: string;
    causeTitle: string;
    invoiceNumber: string;
    total: number;
    currency: string;
  },
  pdfPath: string
) => {
  try {
    // Check for duplicate emails
    if (preventDuplicateEmails(email)) {
      return true;
    }
    
    console.log(`SENDING INVOICE EMAIL: Preparing to send invoice to ${email}`);
    
    // Format currency
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: data.currency === 'INR' ? 'INR' : 'USD'
    }).format(data.total);
    
    const mailOptions = {
      from: '"Changebag" <noreply@Changebag.org>',
      to: email,
      subject: `Invoice #${data.invoiceNumber} - ${data.causeTitle} Campaign`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Changebag</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Making a difference, one tote at a time</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Payment Confirmation & Invoice</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>${data.organizationName}</strong>,
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your generous sponsorship of the <strong>${data.causeTitle}</strong> campaign!
            </p>
            
            <!-- Payment Summary Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">Payment Summary</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p style="margin: 8px 0; color: #6b7280;"><strong>Invoice Number:</strong></p>
                  <p style="margin: 8px 0; color: #1f2937; font-weight: bold;">${data.invoiceNumber}</p>
                </div>
                <div>
                  <p style="margin: 8px 0; color: #6b7280;"><strong>Campaign:</strong></p>
                  <p style="margin: 8px 0; color: #1f2937; font-weight: bold;">${data.causeTitle}</p>
                </div>
                <div>
                  <p style="margin: 8px 0; color: #6b7280;"><strong>Total Amount:</strong></p>
                  <p style="margin: 8px 0; color: #059669; font-weight: bold; font-size: 18px;">${formattedAmount}</p>
                </div>
                <div>
                  <p style="margin: 8px 0; color: #6b7280;"><strong>Payment Status:</strong></p>
                  <p style="margin: 8px 0; color: #10b981; font-weight: bold;">✓ Paid</p>
                </div>
              </div>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Your payment has been successfully processed and your sponsorship is now active. Your logo will be featured on the campaign page and printed on the tote bags as specified.
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 25px;">
              Please find your detailed invoice attached to this email for your records.
            </p>
            
            <!-- Next Steps Card -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">What happens next?</h4>
              <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Your campaign will be reviewed by our team</li>
                <li style="margin-bottom: 8px;">Once approved, your logo will be added to the campaign page</li>
                <li style="margin-bottom: 8px;">You'll receive updates on campaign progress and distribution</li>
                <li style="margin-bottom: 8px;">You can track your campaign performance through your dashboard</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions about your invoice or sponsorship, please don't hesitate to contact our support team.
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              Thank you again for making a difference!
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #6b7280; margin: 0;">
                Best regards,<br>
                <strong>The Changebag Team</strong>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              For questions about this invoice, please contact support@changebag.org
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${data.invoiceNumber}.pdf`,
          path: pdfPath
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`INVOICE EMAIL SENT SUCCESSFULLY: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`ERROR SENDING INVOICE EMAIL to ${email}:`, error);
    throw error;
  }
}; 