import React, { useState } from 'react';
import { backendAPIClient } from '../services/BackendAPIClient';

interface TestResults {
  anonymousUserCreation: boolean;
  stateRetrieval: boolean;
  stateUpdate: boolean;
  errors: string[];
}

export const BackendTester: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const runBackendTests = async () => {
    setIsLoading(true);
    setResults(null);
    setUserInfo(null);

    try {
      const testResults = await backendAPIClient.testBackendConnection();
      setResults(testResults);
      
      // Store user info for display
      const currentUser = backendAPIClient.getCurrentUser();
      setUserInfo(currentUser);
      
    } catch (error) {
      setResults({
        anonymousUserCreation: false,
        stateRetrieval: false,
        stateUpdate: false,
        errors: [error instanceof Error ? error.message : String(error)]
      });
    }

    setIsLoading(false);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Backend API Tester</h2>
      
      <button
        onClick={runBackendTests}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium mb-6"
      >
        {isLoading ? 'Testing Backend...' : 'Run Backend Tests'}
      </button>

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Test Results:</h3>
          
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${getStatusColor(results.anonymousUserCreation)}`}>
              <span>{getStatusIcon(results.anonymousUserCreation)}</span>
              <span>Anonymous User Creation</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${getStatusColor(results.stateRetrieval)}`}>
              <span>{getStatusIcon(results.stateRetrieval)}</span>
              <span>User State Retrieval</span>
            </div>
            
            <div className={`flex items-center space-x-2 ${getStatusColor(results.stateUpdate)}`}>
              <span>{getStatusIcon(results.stateUpdate)}</span>
              <span>User State Update</span>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <h4 className="text-red-800 font-medium mb-2">Errors:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {results.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {userInfo && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <h4 className="text-green-800 font-medium mb-2">Created User Info:</h4>
              <div className="text-green-700 text-sm space-y-1">
                <div><strong>ID:</strong> {userInfo.user.id}</div>
                <div><strong>Anonymous ID:</strong> {userInfo.user.anonymousId}</div>
                <div><strong>Display Name:</strong> {userInfo.user.displayName}</div>
                <div><strong>Subscription:</strong> {userInfo.user.subscriptionTier}</div>
                <div><strong>Expires At:</strong> {new Date(userInfo.user.expiresAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h4 className="text-blue-800 font-medium mb-2">Next Steps:</h4>
            <div className="text-blue-700 text-sm">
              {results.anonymousUserCreation && results.stateRetrieval && results.stateUpdate ? (
                <p>🎉 All backend services are working! Ready to integrate with the frontend.</p>
              ) : (
                <p>Some tests failed. Check the errors above and fix the backend configuration.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};