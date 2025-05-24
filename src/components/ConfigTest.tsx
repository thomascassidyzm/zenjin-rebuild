import React, { useEffect, useState } from 'react';

export const ConfigTest: React.FC = () => {
  const [configStatus, setConfigStatus] = useState<any>({ loading: true });

  useEffect(() => {
    // Test the /api/config endpoint directly
    fetch('/api/config')
      .then(res => {
        console.log('Config endpoint response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Config endpoint data:', data);
        setConfigStatus({
          loading: false,
          success: true,
          data
        });
      })
      .catch(error => {
        console.error('Config endpoint error:', error);
        setConfigStatus({
          loading: false,
          success: false,
          error: error.message
        });
      });
  }, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h3 className="font-bold mb-2">Config Endpoint Test</h3>
      {configStatus.loading && <p>Loading...</p>}
      {!configStatus.loading && configStatus.success && (
        <div>
          <p className="text-green-400">✓ Endpoint accessible</p>
          <p>URL: {configStatus.data.supabaseUrl || '[NOT SET]'}</p>
          <p>Key: {configStatus.data.supabaseAnonKey ? '[SET]' : '[NOT SET]'}</p>
          <p>Configured: {configStatus.data.configured ? 'Yes' : 'No'}</p>
        </div>
      )}
      {!configStatus.loading && !configStatus.success && (
        <p className="text-red-400">✗ Error: {configStatus.error}</p>
      )}
    </div>
  );
};