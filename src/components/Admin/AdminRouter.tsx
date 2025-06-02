/**
 * Admin Router - Main admin navigation component
 * Routes between different admin sections
 */

import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import ContentManagement from './ContentManagement';
import UserManagement from './UserManagement';
import Analytics from './Analytics';

type AdminSection = 'dashboard' | 'content' | 'users' | 'analytics' | 'deployment' | 'database' | 'settings';

export const AdminRouter: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');

  const handleNavigate = (section: string) => {
    setCurrentSection(section as AdminSection);
  };

  const handleBack = () => {
    setCurrentSection('dashboard');
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      
      case 'content':
        return <ContentManagement onBack={handleBack} />;
      
      case 'users':
        return <UserManagement onBack={handleBack} />;
      
      case 'analytics':
        return <Analytics onBack={handleBack} />;
      
      case 'deployment':
        return (
          <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold mb-4">Content Deployment</h1>
            <p>Content deployment interface coming soon...</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        );
      
      case 'database':
        return (
          <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold mb-4">Database Management</h1>
            <p>Database management interface coming soon...</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        );
      
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold mb-4">System Settings</h1>
            <p>System settings interface coming soon...</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        );
      
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return <>{renderSection()}</>;
};

export default AdminRouter;