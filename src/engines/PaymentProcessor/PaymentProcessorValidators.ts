// PaymentProcessorValidators.ts - Input validators

import { PaymentDetails } from './PaymentProcessorTypes';

/**
 * Validates payment details
 * @param details - Payment details to validate
 * @returns Error message if validation fails, null if validation succeeds
 */
export function validatePaymentDetails(details: PaymentDetails): string | null {
  // Validate required fields
  if (!details.method) {
    return 'Payment method is required';
  }

  if (details.amount <= 0) {
    return 'Payment amount must be greater than 0';
  }

  if (!details.currency) {
    return 'Currency is required';
  }

  // Validate payment method
  const validMethods = ['card', 'paypal', 'applepay', 'googlepay'];
  if (!validMethods.includes(details.method)) {
    return `Invalid payment method: ${details.method}. Valid methods are: ${validMethods.join(', ')}`;
  }

  // Validate method-specific details
  switch (details.method) {
    case 'card':
      return validateCardDetails(details);
    case 'paypal':
      return validatePayPalDetails(details);
    case 'applepay':
    case 'googlepay':
      return validateDigitalWalletDetails(details);
    default:
      return null;
  }
}

/**
 * Validates card payment details
 * @param details - Payment details to validate
 * @returns Error message if validation fails, null if validation succeeds
 */
function validateCardDetails(details: PaymentDetails): string | null {
  if (!details.methodDetails.token) {
    return 'Card token is required';
  }

  if (!details.methodDetails.lastFour) {
    return 'Card last four digits are required';
  }

  if (details.methodDetails.lastFour.length !== 4 || !/^\d{4}$/.test(details.methodDetails.lastFour)) {
    return 'Card last four digits must be a 4-digit number';
  }

  if (!details.methodDetails.expiryMonth || !details.methodDetails.expiryYear) {
    return 'Card expiry date is required';
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  if (
    details.methodDetails.expiryMonth < 1 ||
    details.methodDetails.expiryMonth > 12
  ) {
    return 'Invalid expiry month';
  }

  if (details.methodDetails.expiryYear < currentYear) {
    return 'Card has expired';
  }

  if (
    details.methodDetails.expiryYear === currentYear &&
    details.methodDetails.expiryMonth < currentMonth
  ) {
    return 'Card has expired';
  }

  return null;
}

/**
 * Validates PayPal payment details
 * @param details - Payment details to validate
 * @returns Error message if validation fails, null if validation succeeds
 */
function validatePayPalDetails(details: PaymentDetails): string | null {
  if (!details.methodDetails.token) {
    return 'PayPal token is required';
  }

  if (!details.billingInfo?.email) {
    return 'Email is required for PayPal payments';
  }

  return null;
}

/**
 * Validates digital wallet (Apple Pay, Google Pay) payment details
 * @param details - Payment details to validate
 * @returns Error message if validation fails, null if validation succeeds
 */
function validateDigitalWalletDetails(details: PaymentDetails): string | null {
  if (!details.methodDetails.token) {
    return `${details.method} token is required`;
  }

  return null;
}

/**
 * Validates a refund reason
 * @param reason - Refund reason to validate
 * @returns Error message if validation fails, null if validation succeeds
 */
export function validateRefundReason(reason: string): string | null {
  if (!reason || reason.trim().length === 0) {
    return 'Refund reason is required';
  }

  if (reason.length < 5) {
    return 'Refund reason must be at least 5 characters long';
  }

  if (reason.length > 500) {
    return 'Refund reason must be at most 500 characters long';
  }

  return null;
}