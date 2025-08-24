import { useState } from 'react';
import AnimatedBackground from '../components/shared/AnimatedBackground';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import HomePage from './HomePage';
import InterviewPage from './InterviewPage';
import SummaryPage from './SummaryPage';

function App() {
  const [step, setStep] = useState('upload');
  const [sessionId, setSessionId] = useState(null);
  const [firstQuestion, setFirstQuestion] = useState('');
  const [firstQuestionAudioUrl, setFirstQuestionAudioUrl] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const handleStartInterview = () => {
    setShowInterviewModal(true);
  };

  const handleCloseInterview = (isCompleted = false) => {
    setShowInterviewModal(false);
    if (isCompleted) {
      setStep('summary'); // Move to summary only if interview was completed
    } else {
      // Reset state and go back to upload page if interview was quit
      setStep('upload');
      setSessionId(null);
      setFirstQuestion('');
      setFirstQuestionAudioUrl('');
    }
  };

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      <AnimatedBackground />
      
      <Header />

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 overflow-hidden">
        {step === 'upload' && (
          <HomePage
            setSessionId={setSessionId}
            setStep={setStep}
            setFirstQuestion={setFirstQuestion}
            setFirstQuestionAudioUrl={setFirstQuestionAudioUrl}
            onStartInterview={handleStartInterview}
          />
        )}
        
        {step === 'summary' && (
          <SummaryPage />
        )}
      </main>

      <Footer />

      {/* Interview Modal */}
      {showInterviewModal && sessionId && firstQuestion && (
        <InterviewPage 
          sessionId={sessionId} 
          firstQuestion={firstQuestion}
          firstQuestionAudioUrl={firstQuestionAudioUrl}
          onClose={handleCloseInterview}
        />
      )}
    </div>
  );
}

export default App;