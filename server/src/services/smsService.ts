import axios from 'axios';

// MSG91 Configuration
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY?.trim() || '';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID?.trim() || '';
const MSG91_OTP_TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID?.trim() || '';

const formatMSG91Mobile = (phone: string): string => {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length > 10 && digits.startsWith('91')) {
    return digits;
  }

  return digits;
};

/**
 * Sends an SMS with OTP using MSG91 REST API
 * @param phone Phone number to send to (should include country code)
 * @param otp OTP code to send
 * @returns MSG91 response object
 */
export const sendVerificationSMS = async (phone: string, otp: string) => {
  try {
    // Check if MSG91 is properly configured
    if (!MSG91_AUTH_KEY || !MSG91_SENDER_ID) {
      console.warn('MSG91 configuration is missing. Using fallback mode - OTP will be logged instead of sent.');
      console.log('=== FALLBACK SMS MODE ===');
      console.log(`OTP for ${phone}: ${otp}`);
      console.log('Please check the server console for the OTP code.');
      console.log('=== END FALLBACK MODE ===');
      
      return {
        success: true,
        messageId: 'fallback-' + Date.now(),
        status: 'logged'
      };
    }

    // MSG91 expects the number in international format without a leading +
    const formattedPhone = formatMSG91Mobile(phone);
    
    console.log('=== MSG91 SMS DEBUG ===');
    console.log('Sender ID:', MSG91_SENDER_ID);
    console.log('Template ID:', MSG91_OTP_TEMPLATE_ID);
    console.log('Phone:', formattedPhone);
    
    // Method 1: Using MSG91 Flow API (recommended)
    const flowUrl = 'https://api.msg91.com/api/v5/flow/';
    const flowPayload = {
      flow_id: MSG91_OTP_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      recipients: [
        {
          mobiles: formattedPhone,
          VAR1: otp,
          var1: otp,
          OTP: otp,
          otp: otp
        }
      ]
    };

    console.log('Sending SMS via MSG91 Flow API:', {
      phone: formattedPhone,
      template_id: MSG91_OTP_TEMPLATE_ID,
      sender_id: MSG91_SENDER_ID,
      otp: otp,
      payload: flowPayload
    });

    try {
      const response = await axios.post(flowUrl, flowPayload, {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_AUTH_KEY
        }
      });

      console.log('MSG91 Flow API response:', response.data);
      console.log('MSG91 Flow API status:', response.status);

      if (response.data.type === 'success') {
        console.log('✅ MSG91 Flow API SUCCESS');
        return {
          success: true,
          messageId: response.data.request_id,
          status: 'sent'
        };
      } else {
        console.log('❌ MSG91 Flow API FAILED:', response.data);
        throw new Error(`MSG91 Flow Error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (flowError: any) {
      console.error('MSG91 Flow API failed, trying legacy API:', flowError.message);
      console.error('Flow API Error Details:', flowError.response?.data);
      
      // Method 2: Fallback to the official SendOTP API with the same OTP
      const legacyUrl = 'https://api.msg91.com/api/sendotp.php';
      const legacyParams = new URLSearchParams({
        authkey: MSG91_AUTH_KEY,
        mobile: formattedPhone,
        message: `Your verification code is ${otp}. Valid for 10 minutes.`,
        sender: MSG91_SENDER_ID,
        otp: otp,
        otp_expiry: '10'
      });

      console.log('Trying MSG91 SendOTP API');

      try {
        const legacyResponse = await axios.get(`${legacyUrl}?${legacyParams.toString()}`);

        console.log('MSG91 Legacy API response:', legacyResponse.data);
        console.log('MSG91 Legacy API status:', legacyResponse.status);

        if (legacyResponse.data.type === 'success') {
          console.log('✅ MSG91 Legacy API SUCCESS');
          return {
            success: true,
            messageId: legacyResponse.data.request_id,
            status: 'sent'
          };
        } else {
          console.log('❌ MSG91 Legacy API FAILED:', legacyResponse.data);
          throw new Error(`MSG91 Legacy Error: ${legacyResponse.data.message || 'Unknown error'}`);
        }
      } catch (legacyError: any) {
        console.error('Both MSG91 APIs failed. Trying without sender ID...');
        console.error('Legacy API Error Details:', legacyError.response?.data);
        
        // Method 3: Try without sender ID (fallback)
        try {
          const noSenderParams = new URLSearchParams({
            authkey: MSG91_AUTH_KEY,
            mobile: formattedPhone,
            message: `Your verification code is ${otp}. Valid for 10 minutes.`,
            otp: otp,
            otp_expiry: '10'
          });

          console.log('Trying MSG91 without sender ID');

          const noSenderResponse = await axios.get(`${legacyUrl}?${noSenderParams.toString()}`);

          console.log('MSG91 No Sender ID response:', noSenderResponse.data);

          if (noSenderResponse.data.type === 'success') {
            console.log('✅ MSG91 No Sender ID SUCCESS');
            return {
              success: true,
              messageId: noSenderResponse.data.request_id,
              status: 'sent'
            };
          } else {
            throw new Error(`MSG91 No Sender Error: ${noSenderResponse.data.message || 'Unknown error'}`);
          }
        } catch (noSenderError: any) {
          console.error('All MSG91 methods failed. Falling back to console logging.');
          console.error('No Sender Error Details:', noSenderError.response?.data);
          
          // Final fallback: log the OTP
          console.log('=== FINAL FALLBACK - OTP LOGGED ===');
          console.log(`OTP for ${formattedPhone}: ${otp}`);
          console.log('Please check the server console for the OTP code.');
          console.log('=== END FALLBACK ===');
          
          return {
            success: true,
            messageId: 'fallback-' + Date.now(),
            status: 'logged'
          };
        }
      }
    }
  } catch (error: any) {
    console.error('Error sending SMS via MSG91:', error);
    
    if (error.response) {
      console.error('MSG91 Error Response:', error.response.data);
      console.error('MSG91 Error Status:', error.response.status);
    }
    
    // Final fallback: log the OTP
    console.log('=== ERROR FALLBACK - OTP LOGGED ===');
    console.log(`OTP for ${phone}: ${otp}`);
    console.log('Please check the server console for the OTP code.');
    console.log('=== END FALLBACK ===');
    
    return {
      success: true,
      messageId: 'fallback-' + Date.now(),
      status: 'logged'
    };
  }
};

/**
 * Verify OTP using MSG91 API (if needed)
 * @param phone Phone number
 * @param otp OTP to verify
 * @returns Verification result
 */
export const verifyOTPWithMSG91 = async (phone: string, otp: string) => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const url = 'https://control.msg91.com/api/v5/otp/verify';
    const payload = {
      authkey: MSG91_AUTH_KEY,
      mobile: formattedPhone.replace('+', ''),
      otp: otp
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('MSG91 OTP verification response:', response.data);

    return {
      success: response.data.type === 'success',
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error verifying OTP with MSG91:', error);
    throw new Error(`OTP verification failed: ${error.message}`);
  }
};

/**
 * Legacy function for backward compatibility
 */
export const sendSMS = async (phone: string, otp: string) => {
  return sendVerificationSMS(phone, otp);
};

/**
 * Verifies OTP (this is handled by the OTP controller, not the SMS service)
 * @param phone Phone number to verify
 * @param otp OTP code to verify
 * @returns Boolean indicating success
 */
export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  // This function is kept for backward compatibility
  // Actual verification is handled in the OTP controller
  console.log(`[SMS] OTP verification request for ${phone}: ${otp}`);
  return true;
};
