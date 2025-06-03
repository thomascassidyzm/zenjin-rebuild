import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, X, AlertCircle, User, Bell, Shield, Info } from 'lucide-react';
import { useUserSession } from '../contexts/UserSessionContext';

interface UserSettingsProps {
  onClose?: () => void;
}

type TabType = 'account' | 'notifications' | 'privacy' | 'about';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const { state: sessionState, updatePassword } = useUserSession();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  
  // Account settings state
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(false);
  
  // Privacy settings state
  const [shareProgress, setShareProgress] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const currentUser = sessionState?.user;

  useEffect(() => {
    // Check if user has a password set
    // This would typically come from the user metadata or a separate API call
    if (currentUser?.userType === 'registered' && currentUser?.email) {
      // For now, assume registered users with email have passwords
      setHasPassword(true);
    }
  }, [currentUser]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const validatePasswordForm = (): boolean => {
    if (hasPassword && !currentPassword) {
      setError('Please enter your current password');
      return false;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return false;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call the password update method
      const success = await updatePassword(
        hasPassword ? currentPassword : null,
        newPassword
      );
      
      if (success) {
        setSuccess(hasPassword ? 'Password changed successfully!' : 'Password set successfully!');
        setHasPassword(true);
        
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error('Password update failed');
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Account Information</h3>
        <div className="space-y-2">
          <div>
            <span className="text-gray-500 text-sm">Email:</span>
            <span className="text-white ml-2">{currentUser?.email || 'Not set'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Account Type:</span>
            <span className="text-white ml-2 capitalize">{currentUser?.userType || 'Anonymous'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Subscription:</span>
            <span className="text-white ml-2">{currentUser?.subscriptionTier || 'Free'}</span>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          {hasPassword ? 'Change Password' : 'Set Password'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg flex items-center">
            <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Current Password (only if user has password) */}
          {hasPassword && (
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                disabled={isLoading}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.label === 'Weak' ? 'text-red-400' :
                    passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full ${passwordStrength.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-400 flex items-center">
                <X className="w-3 h-3 mr-1" />
                Passwords do not match
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="mt-1 text-xs text-green-400 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Passwords match
              </p>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handlePasswordUpdate}
            disabled={isLoading || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Updating...
              </div>
            ) : (
              hasPassword ? 'Change Password' : 'Set Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Progress Updates</p>
              <p className="text-gray-400 text-sm">Receive weekly progress summaries</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Achievement Notifications</p>
              <p className="text-gray-400 text-sm">Get notified when you earn new achievements</p>
            </div>
            <input
              type="checkbox"
              checked={achievementNotifications}
              onChange={(e) => setAchievementNotifications(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Learning Reminders</p>
              <p className="text-gray-400 text-sm">Daily reminders to continue learning</p>
            </div>
            <input
              type="checkbox"
              checked={reminderNotifications}
              onChange={(e) => setReminderNotifications(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Share Progress</p>
              <p className="text-gray-400 text-sm">Allow friends to see your learning progress</p>
            </div>
            <input
              type="checkbox"
              checked={shareProgress}
              onChange={(e) => setShareProgress(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white">Analytics</p>
              <p className="text-gray-400 text-sm">Help improve Zenjin by sharing usage data</p>
            </div>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Two-Factor Authentication</p>
              <p className="text-gray-400 text-sm">Add an extra layer of security</p>
            </div>
            <span className="text-gray-500 text-sm">Coming soon</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Active Sessions</p>
              <p className="text-gray-400 text-sm">Manage your active sessions</p>
            </div>
            <span className="text-gray-500 text-sm">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">About Zenjin Maths</h3>
        <div className="space-y-3 text-gray-300">
          <p>Version: 2.0.0</p>
          <p>Build: {process.env.REACT_APP_BUILD_VERSION || 'Development'}</p>
          <p className="text-sm">
            Zenjin Maths is an innovative learning platform designed to make mathematics 
            engaging and fun for learners of all ages.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Legal</h3>
        <div className="space-y-2">
          <button className="text-indigo-400 hover:text-indigo-300 text-sm">
            Terms of Service
          </button>
          <br />
          <button className="text-indigo-400 hover:text-indigo-300 text-sm">
            Privacy Policy
          </button>
          <br />
          <button className="text-indigo-400 hover:text-indigo-300 text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'about':
        return renderAboutSettings();
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-indigo-400 border-indigo-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserSettings;