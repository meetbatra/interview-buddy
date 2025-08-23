import { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import BioForm from './components/BioForm';
import logo from "@/assets/logo.png";

function App() {
  const [step, setStep] = useState('upload')
  const [sessionId, setSessionId] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [bio, setBio] = useState('')
  const [firstQuestion, setFirstQuestion] = useState('')

  return (
    <div className="min-h-screen bg-gray-400 flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        {step === 'upload' && (
          <div className="flex justify-between w-full p-30">
            <img src={logo} className="h-120 rounded-full opacity-70"></img>
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg space-y-6">
              <ResumeUpload setResumeFile={setResumeFile} />
              <BioForm
                resumeFile={resumeFile}
                bio={bio}
                setBio={setBio}
                setSessionId={setSessionId}
                setStep={setStep}
                setFirstQuestion={setFirstQuestion}
              />
            </div>
          </div>
        )}
        {step === 'interview' && (
          <div>
            {/* <ChatWindow sessionId={sessionId} firstQuestion={firstQuestion} /> */}
            <div>ChatWindow Placeholder (sessionId: {sessionId}, firstQuestion: {firstQuestion})</div>
          </div>
        )}
        {step === 'summary' && (
          <div>
            {/* <Summary /> */}
            <div>Summary Placeholder</div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App