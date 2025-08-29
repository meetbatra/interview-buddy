import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useInterviewStore from '../stores/interviewStore';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getReport } from '../api/interviewApi';
import SummaryCard from '../components/report/SummaryCard';
import Scorecard from '../components/report/Scorecard';
import StrengthWeakness from '../components/report/StrengthWeakness';
import ConversationHistory from '../components/report/ConversationHistory';

const ReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { token, isAuthenticated } = useAuthStore();
  const { sessionId, clearSession } = useInterviewStore();

  // Redirect if no session or not authenticated
  useEffect(() => {
    if (!sessionId || !isAuthenticated) {
      navigate('/');
      return;
    }
  }, [sessionId, isAuthenticated, navigate]);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await getReport(sessionId, token);
        console.log(response.data);
        setReportData(response.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. This report does not belong to you.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && token) {
      fetchReportData();
    }
  }, [sessionId, token]);

  const handleBack = () => {
    clearSession();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-gray-300">Loading interview report...</p>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Report</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={handleBack} variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBack} 
              variant="outline"
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Interview Report</h1>
              <p className="text-gray-300 text-sm">Session ID: {sessionId}</p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <Tabs defaultValue="summary" className="pb-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger value="summary" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer">
              Summary
            </TabsTrigger>
            <TabsTrigger value="scores" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer">
              Scores
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="conversation" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer">
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-6">
            {reportData?.summary && <SummaryCard summary={reportData.summary} />}
          </TabsContent>
          
          <TabsContent value="scores" className="mt-6">
            {reportData?.scores && <Scorecard scores={reportData.scores} />}
          </TabsContent>
          
          <TabsContent value="feedback" className="mt-6">
            {(reportData?.strengths || reportData?.weaknesses) && (
              <StrengthWeakness 
                strengths={reportData?.strengths} 
                weaknesses={reportData?.weaknesses} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="conversation" className="mt-6">
            {reportData?.messages && <ConversationHistory messages={reportData.messages} />}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Interview Buddy - AI-Powered Interview Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
