import axios from 'axios';

const MSG91_AUTH_KEY = "383885AfgFYzqZxpF634ff2e2P1";
const MSG91_SENDER_ID = "SHELF";
const MSG91_OTP_TEMPLATE_ID = "670e1516d6fc055ee21c5e42";
const PHONE = "918090929644";
const OTP = "123456";

async function runSmsTest() {
  console.log('Testing MSG91 Delivery methods...');
  
  // Method 1: The official v5 OTP API
  try {
    console.log('\n--- METHOD 1: api.msg91.com/api/v5/otp ---');
    const param1 = new URLSearchParams({
      authkey: MSG91_AUTH_KEY,
      mobile: PHONE,
      otp: OTP,
      template_id: MSG91_OTP_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
    });
    const url1 = `https://api.msg91.com/api/v5/otp?${param1.toString()}`;
    const res1 = await axios.get(url1);
    console.log('Response:', res1.data);
  } catch (err: any) {
    console.log('Error 1:', err.response?.data || err.message);
  }

  // Method 2: The legacy control.msg91.com flow
  try {
    console.log('\n--- METHOD 2: control.msg91.com/api/v5/flow/ ---');
    const url2 = 'https://control.msg91.com/api/v5/flow/';
    const res2 = await axios.post(url2, {
      flow_id: MSG91_OTP_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      mobiles: PHONE,
      var1: OTP
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authkey': MSG91_AUTH_KEY
      }
    });
    console.log('Response:', res2.data);
  } catch (err: any) {
    console.log('Error 2:', err.response?.data || err.message);
  }

  // Method 3: The nested recipients flow
  try {
    console.log('\n--- METHOD 3: api.msg91.com/api/v5/flow/ with recipients ---');
    const url3 = 'https://api.msg91.com/api/v5/flow/';
    const res3 = await axios.post(url3, {
      template_id: MSG91_OTP_TEMPLATE_ID,
      sender: MSG91_SENDER_ID,
      recipients: [
        {
          mobiles: PHONE,
          VAR1: OTP,
          var1: OTP,
          OTP: OTP,
          otp: OTP
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      }
    });
    console.log('Response:', res3.data);
  } catch (err: any) {
    console.log('Error 3:', err.response?.data || err.message);
  }
}

runSmsTest();
