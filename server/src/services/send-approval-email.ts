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
 * Send an approval email to the sponsor
 * @param email Sponsor's email address
 * @param sponsorshipData Sponsorship data including organization name, cause title, etc.
 */
export const sendApprovalEmail = async (
  email: string, 
  sponsorshipData: {
    organizationName: string;
    causeTitle: string;
    logoUrl: string;
  }
) => {
  try {
    console.log(`Attempting to send approval email to ${email}`);
    console.log('Email configuration:', {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER ? '***' : 'not set',
      pass: process.env.EMAIL_PASSWORD ? '***' : 'not set'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"changebag" <noreply@changebag.com>',
      to: email,
      subject: 'Congratulations! Your Logo Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations, ${sponsorshipData.organizationName}!</h2>
          <p>Your logo for the <strong>${sponsorshipData.causeTitle}</strong> campaign has been approved.</p>
          
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

    console.log('Sending email with options:', {
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`Approval email sent successfully: MessageID ${info.messageId} to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending approval email to ${email}:`, error);
    // Don't throw the error, just log it and return false
    return false;
  }
};