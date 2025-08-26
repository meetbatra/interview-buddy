import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useInterviewStore from '../stores/interviewStore';
import logo from "@/assets/logo.png";
import ResumeUpload from "../components/home/ResumeUpload";
import BioForm from "../components/home/BioForm";
import CodeEditor from "../components/home/CodeEditor";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [bio, setBio] = useState('');
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useAuthStore();
  const { setDemoSession } = useInterviewStore();

  const handleDemoReport = () => {
    setDemoSession();
    navigate('/report');
  };

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
              {/* Welcome message for authenticated users */}
              {isAuthenticated && (
                <div className="mb-6 text-center">
                  <h2 className="text-white text-xl font-semibold">
                    Welcome back, {user?.username}! 👋
                  </h2>
                  <p className="text-white/70 text-sm mt-1">
                    Ready for your next interview practice session?
                  </p>
                </div>
              )}
              
              <CodeEditor>
                <ResumeUpload setResumeFile={setResumeFile} />
                <BioForm
                  resumeFile={resumeFile}
                  bio={bio}
                  setBio={setBio}
                />
              </CodeEditor>
              
              {/* Demo Button for Development */}
              <div className="mt-6 text-center">
                <Button 
                  onClick={handleDemoReport}
                  variant="outline"
                  className="text-sm text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  🔍 View Demo Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HomePage;
