import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import useInterviewStore from "../../stores/interviewStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { startInterview } from "../../api/interviewApi";

const BioForm = ({
  resumeFile,
  bio,
  setBio,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const { token, isAuthenticated } = useAuthStore();
  const { setSessionData } = useInterviewStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError("Please log in to start an interview.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume.");
      return;
    }
    if (!bio || bio.trim() === "") {
      setError("Please enter your bio.");
      return;
    }
    setLoading(true);
    try {
      const result = await startInterview(resumeFile, bio, token);
      if (result && result.data.sessionId && result.data.firstQuestion) {
        console.log(result.data);
        
        // Store session data in Zustand store
        setSessionData(
          result.data.sessionId, 
          result.data.firstQuestion, 
          result.data.audioUrl || ''
        );
        
        // Navigate to interview page
        navigate('/interview');
      } else {
        setError("Failed to start interview. Please try again.");
      }
    } catch (err) {
      console.error('Interview start error:', err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else {
        setError("Error starting interview. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Authentication notice for non-logged in users */}
      {!isAuthenticated && (
        <div className="p-3 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Login required:</strong> Please log in to start an interview and save your progress.
          </p>
        </div>
      )}
      
      <div>
        <label htmlFor="bio" className="block mb-2 font-medium text-gray-300">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Enter a short bio about yourself"
          disabled={loading}
          className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
        />
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono cursor-pointer"
      >
        {loading ? "Starting Interview..." : "Start Interview"}
      </Button>
    </form>
  );
};

export default BioForm;