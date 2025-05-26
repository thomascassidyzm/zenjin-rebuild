import React, { useState } from 'react';

/**
 * OTP Authentication Component
 * APML-Compliant implementation of OTPAuthenticationInterface.apml
 * Interface-first design with clear state machine
 */

type OTPAuthState = 'EMAIL_ENTRY' | 'OTP_VERIFICATION' | 'AUTHENTICATED' | 'ERROR';

interface OTPAuthenticationProps {
  onAuthenticated: () => void;
  onSendOTP: (email: string) => Promise<{success: boolean, error?: string}>;
  onVerifyOTP: (email: string, code: string) => Promise<{success: boolean, error?: string}>;
}

// Email Entry Form Component - moved outside to prevent re-creation
interface EmailEntryFormProps {
  email: string;
  setEmail: (email: string) => void;
  onEmailSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EmailEntryForm: React.FC<EmailEntryFormProps> = ({
  email,
  setEmail,
  onEmailSubmit,
  isLoading,
  error
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-white mb-2">Sign In</h3>
      <p className="text-gray-400 text-sm">
        Enter your email to receive a verification code
      </p>
    </div>

    {error && (
      <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    )}

    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="your@email.com"
        disabled={isLoading}
        autoComplete="email"
        autoFocus
      />
    </div>

    <button
      onClick={() => onEmailSubmit(email)}
      disabled={isLoading || !email.trim()}
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Sending Code...
        </div>
      ) : (
        'Send Verification Code'
      )}
    </button>
  </div>
);

// OTP Verification Form Component - moved outside to prevent re-creation
interface OTPVerificationFormProps {
  email: string;
  otpCode: string;
  setOtpCode: (code: string) => void;
  onOTPSubmit: (code: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  onBackToEmail: () => void;
  isLoading: boolean;
  error: string | null;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  email,
  otpCode,
  setOtpCode,
  onOTPSubmit,
  onResendOTP,
  onBackToEmail,
  isLoading,
  error
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
      <p className="text-gray-400 text-sm mb-4">
        We sent a 6-digit code to <span className="text-indigo-400">{email}</span>
      </p>
    </div>

    {error && (
      <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    )}

    <div>
      <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
        Verification Code
      </label>
      <input
        id="otp"
        type="text"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="000000"
        maxLength={6}
        disabled={isLoading}
        autoComplete="one-time-code"
        autoFocus
      />
    </div>

    <button
      onClick={() => onOTPSubmit(otpCode)}
      disabled={isLoading || otpCode.length !== 6}
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Verifying...
        </div>
      ) : (
        'Verify Code'
      )}
    </button>

    <div className="text-center space-y-2">
      <button
        onClick={onResendOTP}
        disabled={isLoading}
        className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50"
      >
        Didn't receive it? Send again
      </button>
      <br />
      <button
        onClick={onBackToEmail}
        disabled={isLoading}
        className="text-gray-400 hover:text-gray-300 text-sm disabled:opacity-50"
      >
        ← Use different email
      </button>
    </div>
  </div>
);

// Error State Component - moved outside to prevent re-creation
interface ErrorStateProps {
  error: string | null;
  onReset: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onReset }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
    </div>

    <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
      <p className="text-red-300 text-sm">{error}</p>
    </div>

    <button
      onClick={onReset}
      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
    >
      Try Again
    </button>
  </div>
);

const OTPAuthentication: React.FC<OTPAuthenticationProps> = ({
  onAuthenticated,
  onSendOTP,
  onVerifyOTP
}) => {
  // State Machine Implementation
  const [currentState, setCurrentState] = useState<OTPAuthState>('EMAIL_ENTRY');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interface Implementation
  const showEmailForm = () => currentState === 'EMAIL_ENTRY';
  const showOTPForm = () => currentState === 'OTP_VERIFICATION';
  const isAuthenticated = () => currentState === 'AUTHENTICATED';
  const hasError = () => error !== null;

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // State Transitions
  const onEmailSubmit = async (email: string): Promise<void> => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setCurrentState('ERROR');
      return;
    }

    setIsLoading(true);
    setError(null);
    // Immediate transition to OTP_VERIFICATION as per interface contract
    setCurrentState('OTP_VERIFICATION');

    try {
      const result = await onSendOTP(email);
      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        setCurrentState('ERROR');
      }
      // Stay in OTP_VERIFICATION if successful
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
      setCurrentState('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (code: string): Promise<void> => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setCurrentState('ERROR');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onVerifyOTP(email, code);
      if (result.success) {
        setCurrentState('AUTHENTICATED');
        onAuthenticated();
        console.log('✅ OTP Authentication: User authenticated successfully');
      } else {
        setError(result.error || 'Invalid verification code');
        setCurrentState('ERROR');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
      setCurrentState('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOTP = async (): Promise<void> => {
    setOtpCode('');
    await onEmailSubmit(email);
  };

  const onBackToEmail = (): void => {
    setCurrentState('EMAIL_ENTRY');
    setOtpCode('');
    setError(null);
  };

  const onReset = (): void => {
    setCurrentState('EMAIL_ENTRY');
    setEmail('');
    setOtpCode('');
    setError(null);
  };

  // State Machine Renderer
  const renderCurrentState = () => {
    switch (currentState) {
      case 'EMAIL_ENTRY':
        return (
          <EmailEntryForm
            email={email}
            setEmail={setEmail}
            onEmailSubmit={onEmailSubmit}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'OTP_VERIFICATION':
        return (
          <OTPVerificationForm
            email={email}
            otpCode={otpCode}
            setOtpCode={setOtpCode}
            onOTPSubmit={onOTPSubmit}
            onResendOTP={onResendOTP}
            onBackToEmail={onBackToEmail}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'ERROR':
        return <ErrorState error={error} onReset={onReset} />;
      case 'AUTHENTICATED':
        return null; // Component should unmount after onAuthenticated() callback
      default:
        return (
          <EmailEntryForm
            email={email}
            setEmail={setEmail}
            onEmailSubmit={onEmailSubmit}
            isLoading={isLoading}
            error={error}
          />
        );
    }
  };

  return (
    <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">Z</span>
        </div>
      </div>
      
      {renderCurrentState()}
    </div>
  );
};

export default OTPAuthentication;