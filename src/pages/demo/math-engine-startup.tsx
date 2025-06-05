import React, { useState } from 'react';
import MathEngineStartup from '../../components/MathEngineStartup';

const MathEngineStartupDemo: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [userName, setUserName] = useState('Alex');
  const [useAvatar, setUseAvatar] = useState(false);

  const handleComplete = () => {
    setShowAnimation(false);
    alert('Animation complete! Ready to start the math challenge.');
  };

  const restartAnimation = () => {
    setShowAnimation(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Math Engine Startup Animation Demo</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                User Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                placeholder="Enter user name"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={useAvatar}
                  onChange={(e) => setUseAvatar(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                />
                <span>Use avatar image</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Animation Phases</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              <div>
                <strong className="text-white">Welcome Phase (0-1s):</strong> Displays user avatar with pulsing effect and welcome message
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              <div>
                <strong className="text-white">Engine Startup (1-2s):</strong> Three cylindrical engines spin up with energy flow animations
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              <div>
                <strong className="text-white">Calculation Phase (2-3s):</strong> Equations converge into a triple helix pattern
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              <div>
                <strong className="text-white">Compression (3s+):</strong> Everything compresses into three pulsing dots
              </div>
            </li>
          </ol>
        </div>

        <button
          onClick={restartAnimation}
          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          Start Animation
        </button>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Smooth 60fps animations with CSS and Canvas</li>
            <li>Particle system for floating equations</li>
            <li>3D rotating cylinders with energy flow</li>
            <li>Triple helix formation with converging particles</li>
            <li>Mobile responsive design</li>
            <li>Respects prefers-reduced-motion</li>
          </ul>
        </div>
      </div>

      {showAnimation && (
        <MathEngineStartup
          userName={userName}
          userAvatar={useAvatar ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userName : undefined}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default MathEngineStartupDemo;