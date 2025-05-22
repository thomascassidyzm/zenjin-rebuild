import React from 'react';
import { PlayerCard } from './PlayerCard';

const PlayerCardDemo = () => {
  // Style for the background
  const style = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif'
  };

  // Demo question with different boundary levels
  const [boundaryLevel, setBoundaryLevel] = React.useState(3);
  const [feedback, setFeedback] = React.useState(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  // Questions for different boundary levels
  const questions = [
    {
      id: "add-2-2-001",
      text: "What is 2 + 2?",
      correctAnswer: "4",
      distractor: "5",
      boundaryLevel: 1, // Obvious distinction
      factId: "add-2-2"
    },
    {
      id: "mult-6-8-001",
      text: "What is 6 × 8?",
      correctAnswer: "48",
      distractor: "64",
      boundaryLevel: 2, // Clear distinction
      factId: "mult-6-8"
    },
    {
      id: "mult-7-8-001",
      text: "What is 7 × 8?",
      correctAnswer: "56",
      distractor: "54",
      boundaryLevel: 3, // Moderate distinction
      factId: "mult-7-8"
    },
    {
      id: "mult-7-8-002",
      text: "What is 7 × 8?",
      correctAnswer: "56",
      distractor: "57",
      boundaryLevel: 4, // Subtle distinction
      factId: "mult-7-8"
    },
    {
      id: "sqrt-64-001",
      text: "What is √64?",
      correctAnswer: "8",
      distractor: "±8",
      boundaryLevel: 5, // Very subtle distinction
      factId: "sqrt-64"
    }
  ];

  // Get current question based on boundary level
  const currentQuestion = questions.find(q => q.boundaryLevel === boundaryLevel);

  // Handle answer selection
  const handleAnswerSelected = (response) => {
    setFeedback(response);
    setShowFeedback(true);
    
    // Hide feedback after 3 seconds
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  return (
    <div style={style}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', textAlign: 'center' }}>
        Zenjin Maths - PlayerCard Demo
      </h1>
      
      <div style={{ maxWidth: '500px', width: '100%', marginBottom: '2rem' }}>
        <PlayerCard 
          initialQuestion={currentQuestion}
          onAnswerSelected={handleAnswerSelected}
        />
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '1rem', 
        borderRadius: '10px',
        marginTop: '1rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Boundary Level Selector</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {[1, 2, 3, 4, 5].map(level => (
            <button 
              key={level}
              onClick={() => setBoundaryLevel(level)}
              style={{
                padding: '0.5rem 1rem',
                background: level === boundaryLevel ? '#6c5ce7' : '#2d3436',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Level {level}
            </button>
          ))}
        </div>
        
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          <p><strong>Level 1:</strong> Obvious distinctions (e.g., 2+2=4 vs 2+2=5)</p>
          <p><strong>Level 2:</strong> Clear distinctions (e.g., 6×8=48 vs 6×8=64)</p>
          <p><strong>Level 3:</strong> Moderate distinctions (e.g., 7×8=56 vs 7×8=54)</p>
          <p><strong>Level 4:</strong> Subtle distinctions (e.g., 7×8=56 vs 7×8=57)</p>
          <p><strong>Level 5:</strong> Very subtle distinctions (e.g., √64=8 vs √64=±8)</p>
        </div>
      </div>
      
      {showFeedback && feedback && (
        <div style={{ 
          background: feedback.isCorrect ? 'rgba(46, 213, 115, 0.2)' : 'rgba(235, 77, 75, 0.2)', 
          padding: '1rem', 
          borderRadius: '10px',
          marginTop: '1rem',
          maxWidth: '500px',
          width: '100%',
          border: `2px solid ${feedback.isCorrect ? 'rgba(46, 213, 115, 0.5)' : 'rgba(235, 77, 75, 0.5)'}`
        }}>
          <h2 style={{ marginBottom: '0.5rem' }}>
            {feedback.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </h2>
          <p>You selected: <strong>{feedback.selectedAnswer}</strong></p>
          <p>Response time: <strong>{feedback.responseTime}ms</strong></p>
          <p>First attempt: <strong>{feedback.isFirstAttempt ? 'Yes' : 'No'}</strong></p>
        </div>
      )}
      
      <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>
        Zenjin Maths App - Implementing Distinction-Based Learning
      </div>
    </div>
  );
};

export default PlayerCardDemo;
