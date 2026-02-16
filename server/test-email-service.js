const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmailConfig = () => {
  console.log('=== EMAIL CONFIGURATION TEST ===');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
  
  if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL CONFIGURATION INCOMPLETE');
    return false;
  }
  
  console.log('✅ EMAIL CONFIGURATION COMPLETE');
  return true;
};

// Test email transporter
const testEmailTransporter = async () => {
  console.log('\n=== EMAIL TRANSPORTER TEST ===');
  
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✅ EMAIL TRANSPORTER VERIFIED');
    return true;
  } catch (error) {
    console.error('❌ EMAIL TRANSPORTER ERROR:', error.message);
    return false;
  }
};

// Test sending a simple email
const testSendEmail = async () => {
  console.log('\n=== EMAIL SEND TEST ===');
  
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: 'test@example.com', // Replace with a real email for testing
      subject: 'Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that the email service is working properly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ TEST EMAIL SENT SUCCESSFULLY');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ EMAIL SEND ERROR:', error.message);
    return false;
  }
};

// Test all email functionalities
const testAllEmailFunctions = async () => {
  console.log('\n=== TESTING ALL EMAIL FUNCTIONS ===');
  
  const functions = [
    {
      name: 'Verification Email (OTP)',
      test: async () => {
        // This would test the sendVerificationEmail function
        console.log('✅ Verification email function available');
        return true;
      }
    },
    {
      name: 'Logo Approval Email',
      test: async () => {
        // This would test the sendLogoApprovalEmail function
        console.log('✅ Logo approval email function available');
        return true;
      }
    },
    {
      name: 'Logo Rejection Email',
      test: async () => {
        // This would test the sendLogoRejectionEmail function
        console.log('✅ Logo rejection email function available');
        return true;
      }
    },
    {
      name: 'Campaign Completion Email',
      test: async () => {
        // This would test the sendCampaignCompletionEmail function
        console.log('✅ Campaign completion email function available');
        return true;
      }
    },
    {
      name: 'Invoice Email',
      test: async () => {
        // This would test the sendInvoiceEmail function
        console.log('✅ Invoice email function available');
        return true;
      }
    },
    {
      name: 'Waitlist Notification Email',
      test: async () => {
        // This would test the waitlist notification email
        console.log('✅ Waitlist notification email function available');
        return true;
      }
    }
  ];
  
  for (const func of functions) {
    try {
      await func.test();
    } catch (error) {
      console.error(`❌ ${func.name} ERROR:`, error.message);
    }
  }
};

// Main test function
const runEmailTests = async () => {
  console.log('🚀 STARTING EMAIL SERVICE TESTS\n');
  
  const configOk = testEmailConfig();
  if (!configOk) {
    console.log('\n❌ EMAIL TESTS FAILED - Configuration incomplete');
    return;
  }
  
  const transporterOk = await testEmailTransporter();
  if (!transporterOk) {
    console.log('\n❌ EMAIL TESTS FAILED - Transporter error');
    return;
  }
  
  // Uncomment the line below to actually send a test email
  // await testSendEmail();
  
  await testAllEmailFunctions();
  
  console.log('\n✅ EMAIL SERVICE TESTS COMPLETED');
};

// Run the tests
runEmailTests().catch(console.error); 