// PaymentProcessorUtils.ts - Utility functions

/**
 * Generates a unique ID with a specified prefix
 * @param prefix - Prefix for the ID
 * @returns A unique ID with the specified prefix
 */
export function generateUniqueId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${randomStr}`;
}

/**
 * Formats a date as an ISO string
 * @param date - Date to format
 * @returns ISO string representation of the date
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Formats a currency amount
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted currency amount
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Masks a PAN (Primary Account Number) for display purposes
 * @param pan - PAN to mask
 * @returns Masked PAN
 */
export function maskPAN(pan: string): string {
  if (pan.length < 4) {
    return '****';
  }
  
  const lastFour = pan.slice(-4);
  const maskedPart = '*'.repeat(pan.length - 4);
  
  return `${maskedPart}${lastFour}`;
}

/**
 * Calculates the refund eligibility window end date
 * @param paymentDate - Date of payment
 * @param windowDays - Refund window in days
 * @returns End date of refund eligibility window
 */
export function calculateRefundWindowEndDate(
  paymentDate: Date,
  windowDays: number
): Date {
  const endDate = new Date(paymentDate);
  endDate.setDate(endDate.getDate() + windowDays);
  return endDate;
}

/**
 * Checks if a payment is within the refund window
 * @param paymentDate - Date of payment
 * @param windowDays - Refund window in days
 * @returns Whether the payment is within the refund window
 */
export function isWithinRefundWindow(
  paymentDate: Date,
  windowDays: number
): boolean {
  const currentDate = new Date();
  const endDate = calculateRefundWindowEndDate(paymentDate, windowDays);
  return currentDate <= endDate;
}