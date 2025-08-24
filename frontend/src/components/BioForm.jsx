import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { startInterview } from "../api/interviewApi";

const BioForm = ({
  resumeFile,
  bio,
  setBio,
  setSessionId,
  setStep,
  setFirstQuestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      const result = await startInterview(resumeFile, bio);
      if (result && result.data.sessionId && result.data.firstQuestion) {
        console.log(result.data);
        setSessionId(result.data.sessionId);
        setFirstQuestion(result.data.firstQuestion);
        setStep("interview");
      } else {
        setError("Failed to start interview. Please try again.");
      }
    } catch (err) {
      setError("Error starting interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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