/**
 * OTPAuthenticationInterface.ts
 * Generated from APML Interface Definition
 * Module: Authentication
 */


/**
 * Defines the contract for OTP (One-Time Password) authentication flow,
 * managing state transitions and user interactions for passwordless login.
 */
/**
 * Current state of OTP authentication flow
 */
export interface OTPAuthState {
}

/**
 * Complete state of OTP authentication
 */
export interface OTPAuthenticationState {
  /** Current state in the authentication flow */
  currentState: OTPAuthState;
  /** Email address for OTP delivery */
  email: string;
  /** Entered OTP code */
  otpCode?: string;
  /** Error message if any */
  error?: string;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Number of OTP verification attempts */
  attemptCount: number;
  /** Session token after successful authentication */
  sessionToken?: string;
}

/**
 * Error codes for OTPAuthenticationInterface
 */
export enum OTPAuthenticationErrorCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  OTP_SEND_FAILED = 'OTP_SEND_FAILED',
  INVALID_OTP = 'INVALID_OTP',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * OTPAuthenticationInterface
 */
export interface OTPAuthenticationInterface {
  /**
   * Request OTP code to be sent to email
   * @param email - Email address to send OTP
   * @returns Whether OTP was successfully sent
   * @throws INVALID_EMAIL if Invalid email address format
   * @throws OTP_SEND_FAILED if Failed to send OTP code
   * @throws NETWORK_ERROR if Network error during authentication
   */
  requestOTP(email: string): boolean;

  /**
   * Verify the entered OTP code
   * @param email - Email address
   * @param otpCode - OTP code to verify
   * @returns Result
   * @throws INVALID_OTP if Invalid or expired OTP code
   * @throws TOO_MANY_ATTEMPTS if Too many verification attempts
   * @throws SESSION_EXPIRED if OTP session has expired
   * @throws NETWORK_ERROR if Network error during authentication
   */
  verifyOTP(email: string, otpCode: string): { success: boolean; sessionToken: string };

  /**
   * Resend OTP code to the same email
   * @param email - Email address
   * @returns Whether OTP was successfully resent
   * @throws OTP_SEND_FAILED if Failed to send OTP code
   * @throws SESSION_EXPIRED if OTP session has expired
   * @throws NETWORK_ERROR if Network error during authentication
   */
  resendOTP(email: string): boolean;

  /**
   * Get current authentication state
   * @returns Current authentication state
   */
  getCurrentState(): OTPAuthenticationState;

  /**
   * Reset authentication flow to initial state
   * @returns Whether reset was successful
   */
  resetAuthentication(): boolean;

}

// Export default interface
export default OTPAuthenticationInterface;
