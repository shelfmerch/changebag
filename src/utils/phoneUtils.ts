/** Matches server `normalizeIndianMobile` — must stay in sync for OTP flows. */

const IN_MOBILE = /^[6-9]\d{9}$/;

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
