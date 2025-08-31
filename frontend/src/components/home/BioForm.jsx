import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAuthStore from "../../stores/authStore";
import useInterviewStore from "../../stores/interviewStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { startInterview } from "../../api/interviewApi";

const BioForm = ({
  resumeFile,
  bio,
  setBio,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const { token, isAuthenticated } = useAuthStore();
  const { setSessionData } = useInterviewStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please log in to start an interview.");
      return;
    }

    if (!resumeFile) {
      toast.error("Please upload your resume.");
      return;
    }
    if (!bio || bio.trim() === "") {
      toast.error("Please enter your bio.");
      return;
    }
    setLoading(true);
    onLoadingChange?.(true);
    try {
      const result = await startInterview(resumeFile, bio, token);
      if (result && result.data.sessionId && result.data.firstQuestion) {
        
        // Store session data in Zustand store
        setSessionData(
          result.data.sessionId, 
          result.data.firstQuestion, 
          result.data.audioUrl || ''
        );
        
        toast.success("Interview started successfully!");
        
        // Navigate to interview page
        navigate('/interview');
      } else {
        toast.error("Failed to start interview. Please try again.");
      }
    } catch (err) {
      console.error('Interview start error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      if (err.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data?.error || "Invalid request. Please check your resume and bio.");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(err.response?.data?.error || "Error starting interview. Please try again.");
      }
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
            {/* Authentication notice for non-logged in users */}
      {!isAuthenticated && (
        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-300">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <strong>Login required:</strong> Please log in to start an interview and save your progress.
          </AlertDescription>
        </Alert>
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