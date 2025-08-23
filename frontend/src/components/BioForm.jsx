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
        <label htmlFor="bio" className="block mb-2 font-medium">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Enter a short bio about yourself"
          disabled={loading}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Starting Interview..." : "Start Interview"}
      </Button>
    </form>
  );
};

export default BioForm;