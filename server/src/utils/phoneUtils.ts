/**
 * Indian mobile normalization for OTP / user records.
 * Stored format: E.164 (+91XXXXXXXXXX). MSG91 expects digits only: 91XXXXXXXXXX.
 */

const IN_MOBILE = /^[6-9]\d{9}$/;

/**
 * Normalize user input to +91XXXXXXXXXX, or null if not a valid Indian mobile.
 */
export function normalizeIndianMobile(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  let d = input.replace(/\D/g, '');
  if (!d.length) return null;

  while (d.startsWith('0')) d = d.slice(1);

  if (d.startsWith('91')) {
    if (d.length === 12) {
      d = d.slice(2);
    } else if (d.length > 12) {
      d = d.slice(-10);
    }
  }

  if (d.length > 10) d = d.slice(-10);

  if (d.length !== 10 || !IN_MOBILE.test(d)) return null;
  return `+91${d}`;
}

/** MSG91: international format without + */
export function formatMobileForMSG91(e164India: string): string {
  const digits = e164India.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 10 && IN_MOBILE.test(digits)) return `91${digits}`;
  return digits;
}
