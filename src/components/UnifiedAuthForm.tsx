import React, { useState } from 'react';

/**
 * Unified Authentication Form
 * APML-Compliant implementation of UnifiedAuthInterface.apml
 * 
 * Single form supporting both OTP and email/password authentication
 */

export enum AuthMode {
  EMAIL_ENTRY = 'EMAIL_ENTRY',
  VERIFY_OTP = 'VERIFY_OTP',
  SECURE_PROGRESS = 'SECURE_PROGRESS'
}

interface UnifiedAuthFormProps {
  mode: AuthMode;
  onSuccess: () => void;
  onCancel: () => void;
  onSendOTP: (email: string) => Promise<boolean>;
  onVerifyOTP: (email: string, otp: string) => Promise<boolean>;
  onLoginWithPassword: (email: string, password: string) => Promise<boolean>;
  currentUser?: any;
}

const UnifiedAuthForm: React.FC<UnifiedAuthFormProps> = ({
  mode,
  onSuccess,
  onCancel,
  onSendOTP,
  onVerifyOTP,
  onLoginWithPassword,
  currentUser
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 UnifiedAuthForm: Sending OTP to', email);
      const success = await onSendOTP(email);
      console.log('🔍 UnifiedAuthForm: OTP send result:', success);
      if (success) {
        console.log('🔍 UnifiedAuthForm: Setting otpSent to true');
        setOtpSent(true);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('🔍 UnifiedAuthForm: OTP send error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onLoginWithPassword(email, password);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid email or password. Try OTP instead?');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onVerifyOTP(email, otp);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid code. Please check and try again.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setOtpSent(false);
    await handleSendOTP();
  };

  // OTP Verification Mode
  if (mode === AuthMode.VERIFY_OTP || otpSent) {
    return (
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
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="000000"
            maxLength={6}
            disabled={isLoading}
            autoComplete="one-time-code"
          />
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.length !== 6}
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
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50"
          >
            Didn't receive it? Send again
          </button>
          <br />
          <button
            onClick={() => { setOtpSent(false); setOtp(''); setError(null); }}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-300 text-sm disabled:opacity-50"
          >
            ← Use different email
          </button>
        </div>
      </div>
    );
  }

  // Email Entry Mode (Default)
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          {mode === AuthMode.SECURE_PROGRESS ? 'Secure Your Progress' : 'Sign In or Sign Up'}
        </h3>
        <p className="text-gray-400 text-sm">
          {mode === AuthMode.SECURE_PROGRESS 
            ? 'Add email authentication to access your progress from any device'
            : 'Enter your email and choose how you\'d like to continue'
          }
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Email Field */}
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
            placeholder="Enter your email"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        {/* Password Field (Optional) */}
        {mode !== AuthMode.SECURE_PROGRESS && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter password or leave blank for OTP"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* OTP Button (Always Available) */}
        <button
          onClick={handleSendOTP}
          disabled={isLoading || !email}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Sending Code...
            </div>
          ) : (
            mode === AuthMode.SECURE_PROGRESS ? 'Send Verification Code' : 'Send Code to Email'
          )}
        </button>

        {/* Password Button (Only if password entered and not in secure progress mode) */}
        {mode !== AuthMode.SECURE_PROGRESS && password && (
          <button
            onClick={handlePasswordLogin}
            disabled={isLoading || !email || !password}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In with Password
          </button>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Back to Options
      </button>

      {/* Help Text */}
      <p className="text-gray-500 text-xs text-center">
        {mode === AuthMode.SECURE_PROGRESS 
          ? 'Your existing progress will be preserved and accessible from any device'
          : 'New to Zenjin Maths? We\'ll create your account automatically'
        }
      </p>
    </div>
  );
};

export default UnifiedAuthForm;