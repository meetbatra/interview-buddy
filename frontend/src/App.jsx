import { useState } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import InterviewPage from './components/InterviewPage';
import SummaryPage from './components/SummaryPage';

function App() {
  const [step, setStep] = useState('upload');
  const [sessionId, setSessionId] = useState(null);
  const [firstQuestion, setFirstQuestion] = useState('');

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
          />
        )}
        
        {step === 'interview' && (
          <InterviewPage sessionId={sessionId} firstQuestion={firstQuestion} />
        )}
        
        {step === 'summary' && (
          <SummaryPage />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;