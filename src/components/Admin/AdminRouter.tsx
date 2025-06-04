/**
 * Admin Router - Main admin navigation component
 * Routes between different admin sections
 */

import React, { useState } from 'react';
import { Upload, Database, Settings } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ContentManagementEnhanced from './ContentManagementEnhanced';
import SimpleCurriculumPlanner from './SimpleCurriculumPlanner';
import UserManagement from './UserManagement';
import Analytics from './Analytics';

type AdminSection = 'dashboard' | 'content' | 'curriculum' | 'users' | 'analytics' | 'deployment' | 'database' | 'settings';

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
        return <ContentManagementEnhanced onBack={handleBack} />;
      
      case 'curriculum':
        return <SimpleCurriculumPlanner onBack={handleBack} />;
      
      case 'users':
        return <UserManagement onBack={handleBack} />;
      
      case 'analytics':
        return <Analytics onBack={handleBack} />;
      
      case 'deployment':
        return (
          <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <div className="w-20 h-20 bg-blue-400/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Content Deployment</h1>
                <p className="text-gray-400 mb-8">Content deployment interface coming soon...</p>
                <button 
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all border border-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'database':
        return (
          <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <div className="w-20 h-20 bg-purple-400/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Database className="w-10 h-10 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Database Management</h1>
                <p className="text-gray-400 mb-8">Database management interface coming soon...</p>
                <button 
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all border border-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <div className="w-20 h-20 bg-gray-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">System Settings</h1>
                <p className="text-gray-400 mb-8">System settings interface coming soon...</p>
                <button 
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all border border-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <AdminDashboard onNavigate={handleNavigate} />;
    }
  };

  return <>{renderSection()}</>;
};

export default AdminRouter;