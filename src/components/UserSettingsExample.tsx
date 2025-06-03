import React, { useState } from 'react';
import UserSettings from './UserSettings';
import { Settings } from 'lucide-react';

/**
 * Example component demonstrating how to use the UserSettings component
 */
const UserSettingsExample: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">User Settings Example</h1>
        
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span>Open Settings</span>
        </button>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <UserSettings onClose={() => setShowSettings(false)} />
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">How to Use UserSettings</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">Basic Usage:</h3>
              <pre className="bg-gray-800 rounded p-3 overflow-x-auto">
                <code>{`import UserSettings from './components/UserSettings';

// In your component
<UserSettings onClose={() => setShowSettings(false)} />`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Account settings with password management</li>
                <li>Email notifications preferences</li>
                <li>Privacy and security settings</li>
                <li>About section with app information</li>
                <li>Password strength indicator</li>
                <li>Toggle password visibility</li>
                <li>Form validation</li>
                <li>Smooth animations with Framer Motion</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Integration with UserSessionManager:</h3>
              <p>
                The component automatically integrates with the UserSessionManager through the 
                UserSessionContext to handle password updates and retrieve user information.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Customization:</h3>
              <p>
                The component uses Tailwind CSS classes and follows the app's dark theme. 
                You can customize the styling by modifying the className props or extending 
                the component with additional props.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsExample;