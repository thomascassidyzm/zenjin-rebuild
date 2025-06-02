/**
 * AdminEntryPoint Component
 * Provides conditional access to admin interface from main app navigation
 * 
 * Implements main_app_admin_integration_interface.apml contracts:
 * - admin_entry_point_interface rendering logic
 * - visibility rules based on admin status
 * - visual states for different interaction modes
 */

import React from 'react';
import { UserSessionState } from '../interfaces/UserSessionManagerInterface';

interface AdminEntryPointProps {
  userSession: UserSessionState;
  onAdminClick: () => void;
  position?: 'header' | 'sidebar' | 'floating';
  style?: {
    color?: string;
    hoverColor?: string;
    activeColor?: string;
  };
}

const AdminEntryPoint: React.FC<AdminEntryPointProps> = ({
  userSession,
  onAdminClick,
  position = 'header',
  style
}) => {
  // Visibility rules from APML interface definition
  const isAdmin = userSession.user?.userType === 'authenticated' && 
                  userSession.user?.metadata?.admin_access?.is_admin === true;
  
  const isAuthenticated = userSession.isAuthenticated;
  
  // Hide admin entry if user is not authenticated or not an admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Visual states from APML interface definition
  const getVisualState = () => {
    const defaultState = {
      text: 'Admin',
      icon: '⚙️',
      color: style?.color || 'text-gray-600'
    };
    
    return defaultState;
  };

  const visualState = getVisualState();

  // Render based on position
  if (position === 'header') {
    return (
      <button
        onClick={onAdminClick}
        className={`px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 ${
          visualState.color
        } hover:${style?.hoverColor || 'text-gray-900'} hover:bg-gray-800`}
        aria-label="Access admin interface"
        title="Admin Interface"
      >
        <span className="text-lg">{visualState.icon}</span>
        <span className="hidden sm:inline text-sm">{visualState.text}</span>
      </button>
    );
  }

  if (position === 'sidebar') {
    return (
      <div className="border-t border-gray-700 pt-2 mt-2">
        <button
          onClick={onAdminClick}
          className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            visualState.color
          } hover:${style?.hoverColor || 'text-white'} hover:bg-gray-700`}
          role="menuitem"
          aria-label="Access admin interface"
        >
          <span className="text-lg">{visualState.icon}</span>
          <span className="text-sm">{visualState.text}</span>
        </button>
      </div>
    );
  }

  if (position === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onAdminClick}
          className={`w-12 h-12 rounded-full bg-gray-800 ${
            visualState.color
          } hover:${style?.hoverColor || 'text-white'} hover:bg-gray-700 shadow-lg transition-all duration-200 flex items-center justify-center`}
          aria-label="Access admin interface"
          title="Admin Interface"
        >
          <span className="text-lg">{visualState.icon}</span>
        </button>
      </div>
    );
  }

  return null;
};

export default AdminEntryPoint;