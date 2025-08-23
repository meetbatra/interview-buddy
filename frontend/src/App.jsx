import { useState } from 'react'

function App() {
  const [step, setStep] = useState('upload')
  const [sessionId, setSessionId] = useState(null)

  return (
    <>
      {step === 'upload' && <div>Resume & Bio Form</div>}
      {step === 'interview' && <div>Chat Window</div>}
      {step === 'summary' && <div>Summary Report</div>}
    </>
  )
}

export default App
