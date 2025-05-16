import { useState, useEffect, useRef } from 'react';

type Decision = {
  id: number;
  gender: string;
  professionalAppearance: string;
  skills: number;
  experience: number;
  recommendations: number;
  imageUrl: string;
  decision: 'hired' | 'rejected';
  viewTime: number;
  timeStamp: number;
};

type ParticipantData = {
  gender: string;
  age: string;
  startTime: number | null;
  decisions: Decision[];
};



// Main application component
export default function HiringStudyApp() {
  // Application states

  const [participantData, setParticipantData] = useState<ParticipantData>({
    gender: '',
    age: '',
    startTime: null,
    decisions: []
  });

  const [stage, setStage] = useState('consent'); // consent, survey, instructions, game, completion

  const [currentCvIndex, setCurrentCvIndex] = useState(0);
  const [hiresRemaining, setHiresRemaining] = useState(4);
  const [timeSpent, setTimeSpent] = useState(0);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState<Partial<{ gender: string; age: string }>>({});
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewStartTime = useRef<number | null>(null);

  // Constants
  const TOTAL_CVS = 12; // Updated
  const TOTAL_HIRES = 4;

  // Simulated CV data - this would be replaced with your actual data
  const candidateImages = [
    '/images/cv1.jpg',
    '/images/cv2.jpg',
    '/images/cv3.jpg',
    '/images/cv4.jpg',
    '/images/cv5.jpg',
    '/images/cv6.jpg',
    '/images/cv7.jpg',
    '/images/cv8.jpg',
    '/images/cv9.jpg',
    '/images/cv10.jpg',
    '/images/cv11.jpg',
    '/images/cv12.jpg',
  ];

  const [cvData] = useState(() =>
    candidateImages.map((imageUrl, index) => ({
      id: index + 1,
      gender: index % 2 === 0 ? 'male' : 'female',
      professionalAppearance: index % 3 === 0 ? 'low' : index % 3 === 1 ? 'medium' : 'high',
      skills: Math.floor(Math.random() * 3) + 3,
      experience: Math.floor(Math.random() * 3) + 2,
      recommendations: Math.floor(Math.random() * 3) + 2,
      imageUrl,
      viewTime: 0
    }))
  );

  // Start timer when viewing a CV
  useEffect(() => {
    if (stage === 'game') {
      viewStartTime.current = Date.now();
      timerRef.current = setInterval(() => {
        if (viewStartTime.current !== null) {
          setTimeSpent(Date.now() - viewStartTime.current);
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentCvIndex, stage]);

  // Save participant data when study is completed
  useEffect(() => {
    if (stage === 'completion') {
      saveStudyData();
    }
  }, [stage]);

  // Move to survey stage after consent
  const handleConsentSubmit = () => {
    setStage('survey');
    setParticipantData({
      ...participantData,
      startTime: Date.now()
    });
  };

  // Handle survey submission
  const handleSurveySubmit = () => {
    // Simple validation
    const newErrors: Partial<{ gender: string; age: string }> = {};
    if (!gender) newErrors.gender = 'Please select a gender';
    if (!age) newErrors.age = 'Please select an age range';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setParticipantData({
      ...participantData,
      gender,
      age
    });
    
    setStage('instructions');
  };

  // Start the game after instructions
  const handleStartGame = () => {
    setStage('game');
  };

  // Handle hiring decision
  const handleHire = () => {
    recordDecision(true);
    setHiresRemaining(hiresRemaining - 1);
    
    if (hiresRemaining <= 1 || currentCvIndex >= TOTAL_CVS - 1) {
      setStage('completion');
    } else {
      moveToNextCV();
    }
  };

  // Handle rejection decision
  const handleReject = () => {
    recordDecision(false);
    
    if (currentCvIndex >= TOTAL_CVS - 1 || (TOTAL_CVS - currentCvIndex - 1) <= hiresRemaining) {
      // End if we've seen all CVs or remaining CVs equal hires needed
      setStage('completion');
    } else {
      moveToNextCV();
    }
  };

  // Record participant's decision
  const recordDecision = (hired: boolean) => {
    const viewTime = viewStartTime.current !== null ? Date.now() - viewStartTime.current : 0;
    const decision: Decision = {
      ...cvData[currentCvIndex],
      decision: hired ? 'hired' : 'rejected',
      viewTime: viewTime,
      timeStamp: Date.now()
    };

    
    setParticipantData(prev => ({
      ...prev,
      decisions: [...prev.decisions, decision]
    }));
  };

  // Move to next CV
  const moveToNextCV = () => {
    setCurrentCvIndex(currentCvIndex + 1);
    viewStartTime.current = Date.now();
    setTimeSpent(0);
  };

  // Save study data (would connect to your data storage)
  const saveStudyData = () => {
    console.log('Study data:', participantData);
    // In a real implementation, you would send this data to your backend
    localStorage.setItem('studyData', JSON.stringify(participantData));
    
    // You could also send this to a server endpoint
    // fetch('https://your-api-endpoint.com/data', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(participantData)
    // });
  };

  // Function to render star ratings
  const renderStars = (count: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-5 h-5 ${i < count ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Format time in seconds
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Hiring Simulation Study</h1>
          {stage === 'game' && (
            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium text-gray-500">
                Candidates: <span className="font-bold">{currentCvIndex + 1}/{TOTAL_CVS}</span>
              </div>
              <div className="text-sm font-medium text-gray-500">
                Positions to Fill: <span className="font-bold">{hiresRemaining}</span>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        {/* Consent Form */}
        {stage === 'consent' && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Informed Consent</h2>
            
            <div className="mb-6 text-gray-700 border p-4 rounded-md h-64 overflow-y-auto">
              <p className="mb-4">You are invited to participate in a research study on decision-making in hiring processes. This study is being conducted as part of a thesis project at [University Name].</p>
              
              <p className="mb-4">In this study, you will be asked to:</p>
              <ul className="list-disc pl-5 mb-4">
                <li>Complete a brief demographic questionnaire</li>
                <li>Participate in a simulated hiring task</li>
                <li>Evaluate a series of candidate profiles</li>
              </ul>
              
              <p className="mb-4">The study will take approximately 10-15 minutes to complete. Your participation is entirely voluntary, and you may withdraw at any time without penalty.</p>
              
              <p className="mb-4">All data collected will be kept confidential and used solely for research purposes. No personally identifying information will be collected or stored.</p>
              
              <p className="mb-4">By clicking "I Agree" below, you confirm that you are at least 18 years of age and voluntarily agree to participate in this research study.</p>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleConsentSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                I Agree to Participate
              </button>
            </div>
          </div>
        )}
        
        {/* Survey Form */}
        {stage === 'survey' && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Demographic Information</h2>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Gender
              </label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Age Range
              </label>
              <select 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select age range</option>
                <option value="18-24">18-24 years</option>
                <option value="25-34">25-34 years</option>
                <option value="35-44">35-44 years</option>
                <option value="45-54">45-54 years</option>
                <option value="55-64">55-64 years</option>
                <option value="65+">65 years or older</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleSurveySubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        {stage === 'instructions' && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Study Instructions</h2>
            
            <div className="mb-6 space-y-4 text-gray-700">
              <p>Welcome to our hiring simulation study! In this activity, you will play the role of a hiring manager for a company.</p>
              
              <p>You will review <strong>15 candidate profiles</strong> for a position and must select <strong>5 candidates</strong> to hire.</p>
              
              <p>For each candidate, you will see:</p>
              <ul className="list-disc pl-5">
                <li>A professional photo</li>
                <li>Skills rating (1-5 stars)</li>
                <li>Experience rating (1-5 stars)</li>
                <li>Recommendations rating (1-5 stars)</li>
              </ul>
              
              <p>After viewing each profile, you'll decide whether to hire the candidate or pass. Once you make a decision, you cannot go back.</p>
              
              <p>Remember: You need to hire exactly 5 people. Choose carefully!</p>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleStartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Start Hiring Simulation
              </button>
            </div>
          </div>
        )}
        
        {/* CV Viewer */}
        {stage === 'game' && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
            {/*
            <div className="flex justify-end mb-2 text-sm text-gray-500">
              Time viewing: {formatTime(timeSpent)}s
            </div>
            */}
            
            <div className="flex flex-col items-center mb-6">
              <div className="mb-4 rounded-full overflow-hidden border-4 border-gray-200">
                <img 
                  src={cvData[currentCvIndex].imageUrl} 
                  alt="Candidate" 
                  className="w-36 h-36 object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-800">Candidate #{cvData[currentCvIndex].id}</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-gray-700">Skills</span>
                {renderStars(cvData[currentCvIndex].skills)}
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-gray-700">Experience</span>
                {renderStars(cvData[currentCvIndex].experience)}
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="font-medium text-gray-700">Recommendations</span>
                {renderStars(cvData[currentCvIndex].recommendations)}
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={handleReject}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Pass
              </button>
              
              <button 
                onClick={handleHire}
                disabled={hiresRemaining <= 0}
                className={`${
                  hiresRemaining > 0 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                Hire ({hiresRemaining} left)
              </button>
            </div>
          </div>
        )}
        
        {/* Completion Screen */}
        {stage === 'completion' && (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">Thank You!</h2>
            
            <div className="mb-6 text-gray-700">
              <p className="mb-4">Thank you for participating in our hiring simulation study. Your responses have been recorded.</p>
              
              <p className="mb-4">You hired {participantData.decisions.filter(d => d.decision === 'hired').length} candidates out of {participantData.decisions.length} reviewed.</p>
              
              <p>Your participation contributes to important research on decision-making processes in hiring. The data collected will be analyzed as part of a thesis project on factors influencing hiring decisions.</p>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Exit Study
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Research Study | University Department</p>
        </div>
      </footer>
    </div>
  );
}
