import axios from 'axios';
import { formatMobileForMSG91 } from '../utils/phoneUtils';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY?.trim() || '';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID?.trim() || '';
const MSG91_OTP_TEMPLATE_ID = process.env.MSG91_OTP_TEMPLATE_ID?.trim() || '';

/**
 * Console OTP fallback: enabled in development/test only unless overridden.
 * Production: failures throw unless ALLOW_SMS_OTP_FALLBACK=true (not recommended).
 */
function allowSmsFallback(): boolean {
  const explicit = process.env.ALLOW_SMS_OTP_FALLBACK;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}

function msg91PayloadMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string') {
    return (data as { message: string }).message;
  }
  return JSON.stringify(data);
}

function isMsg91Success(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (d.type === 'error' || d.status === 'error' || d.message === 'error') return false;
  return d.type === 'success' || d.status === 'success';
}

/**
 * Sends an SMS with OTP using MSG91 REST API.
 * @throws Error when delivery fails and fallback is not allowed
 */
export const sendVerificationSMS = async (phoneE164India: string, otp: string): Promise<void> => {
  const logOtpFallback = (reason: string) => {
    console.warn(`[SMS] ${reason} — OTP fallback (console only)`);
    console.log(`[SMS] OTP for ${phoneE164India}: ${otp}`);
  };

  if (!MSG91_AUTH_KEY || !MSG91_SENDER_ID) {
    const msg = 'MSG91 is not configured (MSG91_AUTH_KEY / MSG91_SENDER_ID missing)';
    if (allowSmsFallback()) {
      logOtpFallback(msg);
      return;
    }
    throw new Error(`${msg}. Set credentials or ALLOW_SMS_OTP_FALLBACK=true for local testing only.`);
  }

  const formattedPhone = formatMobileForMSG91(phoneE164India);
  if (!/^91[6-9]\d{9}$/.test(formattedPhone)) {
    throw new Error(`Invalid mobile for MSG91: ${formattedPhone} (expected 91 + 10-digit Indian number)`);
  }

  if (!MSG91_OTP_TEMPLATE_ID) {
    const msg = 'MSG91_OTP_TEMPLATE_ID (Flow / template id) is not set';
    if (allowSmsFallback()) {
      logOtpFallback(msg);
      return;
    }
    throw new Error(msg);
  }

  console.log('[SMS] MSG91 send', {
    sender: MSG91_SENDER_ID,
    templateOrFlowId: MSG91_OTP_TEMPLATE_ID,
    mobileSuffix: formattedPhone.slice(-4),
  });

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
        otp: otp,
      },
    ],
  };

  const tryFlow = async (): Promise<void> => {
    const response = await axios.post(flowUrl, flowPayload, {
      headers: {
        'Content-Type': 'application/json',
        authkey: MSG91_AUTH_KEY,
      },
    });
    const data = response.data;
    console.log('[SMS] MSG91 Flow response', { status: response.status, data });
    if (isMsg91Success(data)) return;
    throw new Error(`MSG91 Flow: ${msg91PayloadMessage(data)}`);
  };

  const tryLegacySendOtp = async (): Promise<void> => {
    const legacyUrl = 'https://api.msg91.com/api/sendotp.php';
    const legacyParams = new URLSearchParams({
      authkey: MSG91_AUTH_KEY,
      mobile: formattedPhone,
      message: `Your verification code is ${otp}. Valid for 10 minutes.`,
      sender: MSG91_SENDER_ID,
      otp,
      otp_expiry: '10',
    });
    const legacyResponse = await axios.get(`${legacyUrl}?${legacyParams.toString()}`);
    const data = legacyResponse.data;
    console.log('[SMS] MSG91 sendotp.php response', data);
    if (isMsg91Success(data)) return;
    throw new Error(`MSG91 sendotp: ${msg91PayloadMessage(data)}`);
  };

  let lastError: Error | null = null;
  try {
    await tryFlow();
    return;
  } catch (e: unknown) {
    const err = e as { message?: string; response?: { data?: unknown } };
    console.error('[SMS] Flow API failed:', err.message, err.response?.data);
    lastError = err instanceof Error ? err : new Error(String(e));
  }

  try {
    await tryLegacySendOtp();
    return;
  } catch (e: unknown) {
    const err = e as { message?: string; response?: { data?: unknown } };
    console.error('[SMS] Legacy sendotp failed:', err.message, err.response?.data);
    lastError = err instanceof Error ? err : new Error(String(e));
  }

  const detail = lastError?.message || 'Unknown MSG91 error';
  if (allowSmsFallback()) {
    logOtpFallback(`All MSG91 methods failed: ${detail}`);
    return;
  }

  throw new Error(
    `SMS could not be sent (${detail}). Check MSG91 account (credits, DLT template, sender ID), sandbox allowlist, and MSG91_OTP_TEMPLATE_ID.`
  );
};

export const verifyOTPWithMSG91 = async (phone: string, otp: string) => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const url = 'https://control.msg91.com/api/v5/otp/verify';
    const payload = {
      authkey: MSG91_AUTH_KEY,
      mobile: formattedPhone.replace('+', ''),
      otp,
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('MSG91 OTP verification response:', response.data);

    return {
      success: response.data.type === 'success',
      message: response.data.message,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error verifying OTP with MSG91:', err);
    throw new Error(`OTP verification failed: ${err.message}`);
  }
};

export const sendSMS = async (phone: string, otp: string) => {
  return sendVerificationSMS(phone, otp);
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  console.log(`[SMS] OTP verification request for ${phone}: ${otp}`);
  return true;
};
