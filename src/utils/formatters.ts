/**
 * Formats a number as currency with the specified locale and currency code
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param currencyCode - The currency code to use (default: 'INR')
 * @param minimumFractionDigits - The minimum number of fraction digits (default: 0)
 * @param maximumFractionDigits - The maximum number of fraction digits (default: 0)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  locale: string = 'en-US',
  currencyCode: string = 'INR',
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 0
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
};

/**
 * Formats a date as a string with the specified locale and options
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - The options to use for formatting (default: { dateStyle: 'medium' })
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formats a number with the specified locale and options
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - The options to use for formatting
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};
