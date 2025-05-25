import React, { useState } from 'react';
import { UserAuthChoice } from '../interfaces/LaunchInterfaceInterface';

interface AuthFormProps {
  mode: UserAuthChoice.SIGN_IN | UserAuthChoice.SIGN_UP;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
  onAuthAction: (email: string, password: string, displayName?: string) => Promise<boolean>;
}

/**
 * Authentication Form Component
 * Handles both Sign In and Sign Up with proper validation
 */
const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSuccess,
  onError,
  onBack,
  onAuthAction
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isSignUp = mode === UserAuthChoice.SIGN_UP;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (isSignUp && !validatePassword(password)) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (isSignUp && !displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setValidationErrors({});

    try {
      const success = await onAuthAction(
        email.trim(),
        password,
        isSignUp ? displayName.trim() : undefined
      );

      if (success) {
        onSuccess();
      } else {
        onError(`${isSignUp ? 'Registration' : 'Sign in'} failed. Please try again.`);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name Field (Sign Up only) */}
      {isSignUp && (
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              validationErrors.displayName ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your display name"
            disabled={isLoading}
          />
          {validationErrors.displayName && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.displayName}</p>
          )}
        </div>
      )}

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
          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            validationErrors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your email"
          disabled={isLoading}
          autoComplete="email"
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            validationErrors.password ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder={isSignUp ? "Create a password (8+ characters)" : "Enter your password"}
          disabled={isLoading}
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            {isSignUp ? 'Creating Account...' : 'Signing In...'}
          </div>
        ) : (
          isSignUp ? 'Create Account' : 'Sign In'
        )}
      </button>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Back to Options
      </button>

      {/* Terms and Privacy */}
      {isSignUp && (
        <p className="text-gray-500 text-sm text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      )}
    </form>
  );
};

export default AuthForm;