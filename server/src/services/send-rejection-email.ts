import nodemailer from 'nodemailer';

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send a rejection email to the sponsor with a reupload link
 * @param email Sponsor's email address
 * @param sponsorshipData Sponsorship data including ID, organization name, cause title, rejection reason
 */
export const sendRejectionEmail = async (
  email: string, 
  sponsorshipData: {
    sponsorshipId: string;
    organizationName: string;
    causeTitle: string;
    rejectionReason: string;
  }
) => {
  try {
    console.log(`Sending rejection email to ${email}`);
    
    // Create a secure reupload link
    const reuploadLink = `https://changebag.org/sponsor/logo-reupload/${sponsorshipData.sponsorshipId}`;
    
    const mailOptions = {
      from: '"changebag" <noreply@changebag.com>',
      to: email,
      subject: 'Action Required: Your Logo Needs Revision',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Logo Update Required</h2>
          <p>Dear ${sponsorshipData.organizationName},</p>
          
          <p>Thank you for your support of the <strong>${sponsorshipData.causeTitle}</strong> campaign.</p>
          
          <p>We've reviewed your submitted logo and unfortunately, we're unable to approve it in its current form.</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <p style="margin-top: 0;"><strong>Reason for rejection:</strong></p>
            <p>${sponsorshipData.rejectionReason}</p>
          </div>
          
          <p><strong>What to do next:</strong></p>
          <p>Please click the button below to upload a revised logo that addresses the issues mentioned above:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reuploadLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Upload New Logo
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The changebag Team</p>
          
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser: ${reuploadLink}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent successfully: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending rejection email to ${email}:`, error);
    throw error;
  }
};