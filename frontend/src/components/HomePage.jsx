import { useState } from 'react';
import logo from "@/assets/logo.png";
import ResumeUpload from "./ResumeUpload";
import BioForm from "./BioForm";
import CodeEditor from "./CodeEditor";

const HomePage = ({ 
  setSessionId, 
  setStep, 
  setFirstQuestion 
}) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [bio, setBio] = useState('');

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-center">
      <div className="flex items-center justify-center w-full h-full md:justify-between">
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="relative">
            <img 
              src={logo} 
              alt="Interview Buddy Logo"
              className="h-80 w-80 lg:h-[450px] lg:w-[450px] xl:h-[500px] xl:w-[500px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="relative flex items-center justify-center flex-1">
          <div className="absolute inset-0 flex items-center justify-center md:hidden">
            <div className="relative opacity-20">
              <img 
                src={logo} 
                alt="Interview Buddy Logo"
                className="h-72 w-72 object-contain"
              />
            </div>
          </div>

          <div className="relative z-10 w-full max-w-lg">
            <CodeEditor>
              <ResumeUpload setResumeFile={setResumeFile} />
              <BioForm
                resumeFile={resumeFile}
                bio={bio}
                setBio={setBio}
                setSessionId={setSessionId}
                setStep={setStep}
                setFirstQuestion={setFirstQuestion}
              />
            </CodeEditor>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
