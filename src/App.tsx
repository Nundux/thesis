import React from 'react';
import ClaudeComponent from './hiring-bias-application'; // Make sure the filename matches!

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Hiring Bias Game</h1>
      <ClaudeComponent />
    </div>
  );
}

export default App;