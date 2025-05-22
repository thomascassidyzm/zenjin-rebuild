import React, { useState, useEffect } from 'react';
import { 
  useFeedbackSystem, 
  FeedbackTarget, 
  FeedbackOptions 
} from './FeedbackSystem';

/**
 * Interactive demo component for the FeedbackSystem
 */
const FeedbackSystemDemo: React.FC = () => {
  // Use the FeedbackSystem hook
  const {
    showCorrectFeedback,
    showIncorrectFeedback,
    showNeutralFeedback,
    showTimeoutFeedback,
    showCustomFeedback,
    cancelFeedback
  } = useFeedbackSystem();
  
  // State for demo elements
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [feedbackResult, setFeedbackResult] = useState<any>(null);
  
  // Demo configuration
  const [config, setConfig] = useState({
    intensity: 0.8,
    duration: 1500,
    animation: 'default',
    sound: false,
    haptic: false
  });
  
  // Update a single config property
  const updateConfig = (key: string, value: any) => {
    setConfig({
      ...config,
      [key]: value
    });
  };
  
  // Get current options based on config
  const getCurrentOptions = (): FeedbackOptions => {
    return {
      intensity: config.intensity,
      duration: config.duration,
      animation: config.animation === 'default' ? undefined : config.animation,
      sound: config.sound,
      haptic: config.haptic
    };
  };
  
  // Handle showing feedback
  const handleShowFeedback = (type: string, targetId: string) => {
    const target: FeedbackTarget = { id: targetId };
    const options = getCurrentOptions();
    let result;
    
    switch (type) {
      case 'correct':
        result = showCorrectFeedback(target, options);
        break;
      case 'incorrect':
        result = showIncorrectFeedback(target, options);
        break;
      case 'neutral':
        result = showNeutralFeedback(target, options);
        break;
      case 'timeout':
        result = showTimeoutFeedback(target, options);
        break;
      default:
        result = showCustomFeedback(target, type, options);
    }
    
    setFeedbackResult(result);
  };
  
  // Handle cancelling feedback
  const handleCancelFeedback = (targetId: string) => {
    const target: FeedbackTarget = { id: targetId };
    const result = cancelFeedback(target);
    setFeedbackResult({ success: result, action: 'cancel', target: targetId });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">FeedbackSystem Demo</h1>
        <p className="text-gray-400">
          Interactive demonstration of the FeedbackSystem component for the Zenjin Maths App
        </p>
      </header>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          className={`px-4 py-2 ${activeTab === 'basic' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Demo
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'advanced' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced Options
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'integration' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('integration')}
        >
          Integration Example
        </button>
      </div>
      
      {/* Basic Demo Tab */}
      {activeTab === 'basic' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Feedback Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Correct Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Correct Feedback</h3>
              <div 
                id="demo-correct"
                className="bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center cursor-pointer"
                onClick={() => handleShowFeedback('correct', 'demo-correct')}
              >
                Click for correct feedback
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Green glow with subtle positive animation
              </p>
            </div>
            
            {/* Incorrect Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Incorrect Feedback</h3>
              <div 
                id="demo-incorrect"
                className="bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center cursor-pointer"
                onClick={() => handleShowFeedback('incorrect', 'demo-incorrect')}
              >
                Click for incorrect feedback
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Red glow with shake animation
              </p>
            </div>
            
            {/* Neutral Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Neutral Feedback</h3>
              <div 
                id="demo-neutral"
                className="bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center cursor-pointer"
                onClick={() => handleShowFeedback('neutral', 'demo-neutral')}
              >
                Click for neutral feedback
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Blue/gray neutral state with gentle pulse
              </p>
            </div>
            
            {/* Timeout Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Timeout Feedback</h3>
              <div 
                id="demo-timeout"
                className="bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center cursor-pointer"
                onClick={() => handleShowFeedback('timeout', 'demo-timeout')}
              >
                Click for timeout feedback
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Pulsing blue with attention-grabbing animation
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <button 
              className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
              onClick={() => {
                handleCancelFeedback('demo-correct');
                handleCancelFeedback('demo-incorrect');
                handleCancelFeedback('demo-neutral');
                handleCancelFeedback('demo-timeout');
              }}
            >
              Cancel All Feedback
            </button>
          </div>
        </div>
      )}
      
      {/* Advanced Options Tab */}
      {activeTab === 'advanced' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Advanced Feedback Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Configuration</h3>
              
              {/* Intensity Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Intensity: {Math.round(config.intensity * 10)}/10
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1"
                  value={config.intensity}
                  onChange={(e) => updateConfig('intensity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Duration Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Duration: {config.duration}ms
                </label>
                <input 
                  type="range" 
                  min="500" 
                  max="3000" 
                  step="100"
                  value={config.duration}
                  onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Animation Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Animation Type
                </label>
                <select 
                  className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
                  value={config.animation}
                  onChange={(e) => updateConfig('animation', e.target.value)}
                >
                  <option value="default">Default (based on feedback type)</option>
                  <option value="glow">Glow</option>
                  <option value="shake">Shake</option>
                  <option value="pulse">Pulse</option>
                  <option value="bounce">Bounce</option>
                  <option value="fade">Fade</option>
                </select>
              </div>
              
              {/* Additional Options */}
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={config.sound}
                    onChange={() => updateConfig('sound', !config.sound)}
                  />
                  <span>Sound Effects</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={config.haptic}
                    onChange={() => updateConfig('haptic', !config.haptic)}
                  />
                  <span>Haptic Feedback</span>
                </label>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Test Area</h3>
              <div 
                id="advanced-demo"
                className="bg-gray-700 rounded-lg p-4 h-40 flex items-center justify-center cursor-pointer mb-4"
              >
                <div className="text-center">
                  <div className="mb-2">Click a button below to test</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button 
                      className="px-3 py-1 bg-green-600 rounded-md text-sm"
                      onClick={() => handleShowFeedback('correct', 'advanced-demo')}
                    >
                      Correct
                    </button>
                    <button 
                      className="px-3 py-1 bg-red-600 rounded-md text-sm"
                      onClick={() => handleShowFeedback('incorrect', 'advanced-demo')}
                    >
                      Incorrect
                    </button>
                    <button 
                      className="px-3 py-1 bg-blue-600 rounded-md text-sm"
                      onClick={() => handleShowFeedback('neutral', 'advanced-demo')}
                    >
                      Neutral
                    </button>
                    <button 
                      className="px-3 py-1 bg-blue-800 rounded-md text-sm"
                      onClick={() => handleShowFeedback('timeout', 'advanced-demo')}
                    >
                      Timeout
                    </button>
                    <button 
                      className="px-3 py-1 bg-gray-600 rounded-md text-sm"
                      onClick={() => handleCancelFeedback('advanced-demo')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Current Options Display */}
              <div className="text-sm text-gray-400">
                <div className="font-medium mb-1">Current Options:</div>
                <pre className="bg-gray-900 p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(getCurrentOptions(), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Integration Example Tab */}
      {activeTab === 'integration' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Integration with PlayerCard</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium mb-3">Example Integration</h3>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="mb-4">
                <div id="player-card" className="border border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    </div>
                    <div className="text-sm text-gray-400">Level 3</div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-medium">What is 7 × 8?</h4>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <div 
                      id="answer-circle-1"
                      className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        handleShowFeedback('correct', 'answer-circle-1');
                        handleShowFeedback('correct', 'player-card');
                      }}
                    >
                      56
                    </div>
                    <div 
                      id="answer-circle-2"
                      className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        handleShowFeedback('incorrect', 'answer-circle-2');
                        handleShowFeedback('incorrect', 'player-card');
                      }}
                    >
                      54
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-400">
                  Click on an answer to see the integrated feedback
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Integration Code Example:</h4>
                <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-xs">
{`// In your PlayerCard component
import { useFeedbackSystem } from './FeedbackSystem';

const PlayerCard = () => {
  const { 
    showCorrectFeedback, 
    showIncorrectFeedback 
  } = useFeedbackSystem();
  
  const handleAnswerSelected = (response) => {
    const target = { 
      id: response.isCorrect ? 'answer-circle-1' : 'answer-circle-2',
      type: 'circle'
    };
    
    // Show feedback on the selected answer
    if (response.isCorrect) {
      showCorrectFeedback(target, {
        duration: 1200,
        intensity: 0.8,
        sound: true
      });
      
      // Also show feedback on the card itself
      showCorrectFeedback({ id: 'player-card', type: 'card' }, {
        duration: 1200,
        intensity: 0.6,
        animation: 'glow'
      });
    } else {
      showIncorrectFeedback(target, {
        duration: 1500,
        intensity: 0.9,
        animation: 'shake',
        sound: true
      });
      
      // Also show feedback on the card itself
      showIncorrectFeedback({ id: 'player-card', type: 'card' }, {
        duration: 1500,
        intensity: 0.7,
        animation: 'shake'
      });
    }
  };
  
  // Rest of component...
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Results Display */}
      {feedbackResult && (
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Last Feedback Result</h2>
          <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(feedbackResult, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Documentation */}
      <div className="mt-8 text-gray-400">
        <h2 className="text-xl font-semibold text-white mb-2">About FeedbackSystem</h2>
        <p className="mb-2">
          The FeedbackSystem provides visual and interactive feedback for user actions throughout the Zenjin Maths App.
          It supports the distinction-based learning principles by providing clear, immediate feedback that reinforces
          the boundaries between correct and incorrect concepts.
        </p>
        <p>
          This demo showcases the different feedback types, customization options, and integration possibilities
          with other components like the PlayerCard.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSystemDemo;
