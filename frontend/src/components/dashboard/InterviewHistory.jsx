import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useInterviewStore from '../../stores/interviewStore';
import { getInterviewHistory } from '../../api/dashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  Eye,
  Loader2
} from "lucide-react";
import { toast } from 'sonner';

const SessionCard = ({ session, onViewReport }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOverallScore = (scores) => {
    if (!scores) return 0;
    return ((scores.technical + scores.communication + scores.confidence) / 3).toFixed(1);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400 bg-green-500/20 border-green-400/30';
    if (score >= 6) return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
    return 'text-red-400 bg-red-500/20 border-red-400/30';
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-medium mb-1">
              Interview Session
            </h3>
            <p className="text-white/60 text-sm flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {formatDate(session.date)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {session.duration && (
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Clock className="w-3 h-3" />
                <span>{session.duration}m</span>
              </div>
            )}
            
            {session.completed ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-400" />
            )}
          </div>
        </div>

        {session.completed && session.scores ? (
          <div className="space-y-3">
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Overall Score</span>
              <Badge 
                className={`${getScoreColor(getOverallScore(session.scores))} font-medium`}
              >
                {getOverallScore(session.scores)}/10
              </Badge>
            </div>

            {/* Individual Scores */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Technical</span>
                <span className="text-white">{session.scores.technical}/10</span>
              </div>
              <Progress 
                value={(session.scores.technical / 10) * 100} 
                className="h-1.5 bg-white/20"
              />
              
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Communication</span>
                <span className="text-white">{session.scores.communication}/10</span>
              </div>
              <Progress 
                value={(session.scores.communication / 10) * 100} 
                className="h-1.5 bg-white/20"
              />
              
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Confidence</span>
                <span className="text-white">{session.scores.confidence}/10</span>
              </div>
              <Progress 
                value={(session.scores.confidence / 10) * 100} 
                className="h-1.5 bg-white/20"
              />
            </div>

            {/* Summary Preview */}
            {session.summary && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
                  {session.summary}
                </p>
              </div>
            )}

            {/* View Report Button */}
            <Button
              onClick={() => onViewReport(session.id)}
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-white hover:bg-white/10 border border-white/20 cursor-pointer"
            >
              <Eye className="w-3 h-3 mr-2" />
              View Full Report
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 mx-auto text-orange-400 mb-2" />
            <p className="text-white/80 text-sm mb-1">Interview Incomplete</p>
            <p className="text-white/60 text-xs">
              {session.questionCount > 0 
                ? `${session.questionCount} questions answered`
                : 'No questions answered'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const InterviewHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { setSessionData } = useInterviewStore();

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInterviewHistory(token, page, 6); // 6 per page for better layout
      setSessions(response.data.sessions);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching interview history:', err);
      setError('Failed to load interview history');
      toast.error('Failed to load interview history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const handleViewReport = (sessionId) => {
    // Set the session ID and navigate to report page
    setSessionData(sessionId, '', '');
    navigate('/report');
  };

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
    // Scroll to top of the page when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-white mb-4" />
            <p className="text-white/80">Loading interview history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto text-red-400 mb-4" />
            <p className="text-red-200 mb-4">{error}</p>
            <Button 
              onClick={() => fetchHistory()} 
              variant="outline"
              className="border-red-400/30 text-red-200 hover:bg-red-500/20"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Interview History
          </CardTitle>
          <p className="text-white/60 text-sm">
            {pagination.totalCount} total interview{pagination.totalCount !== 1 ? 's' : ''} 
            {pagination.totalCount > 0 && ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
          </p>
        </CardHeader>
      </Card>

      {/* Sessions Grid */}
      {sessions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onViewReport={handleViewReport}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-white/80 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-white/30 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Interviews Yet</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                You haven't completed any interviews yet. Start your first interview to see your history and track your progress.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                Start Your First Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewHistory;
