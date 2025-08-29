import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,
  BarChart3,
  Award,
  Calendar,
  Activity
} from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
    pink: "text-pink-400"
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-white/60 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-white/10 ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ScoreCard = ({ title, score, maxScore = 10, color = "blue" }) => {
  const percentage = (score / maxScore) * 100;
  
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/80">{title}</span>
        <span className="text-sm font-medium text-white">{score}/{maxScore}</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2 bg-white/20" 
        style={{
          background: 'rgba(255, 255, 255, 0.2)'
        }}
      />
      <style jsx>{`
        .bg-blue-500 { background-color: #3b82f6; }
        .bg-green-500 { background-color: #10b981; }
        .bg-purple-500 { background-color: #8b5cf6; }
        .bg-orange-500 { background-color: #f59e0b; }
      `}</style>
    </div>
  );
};

const RecentSessionCard = ({ session, index }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOverallScore = (scores) => {
    if (!scores) return 0;
    return ((scores.technical + scores.communication + scores.confidence) / 3).toFixed(1);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">
          {index + 1}
        </div>
        <div>
          <p className="text-white font-medium">Interview #{session.id.slice(-6)}</p>
          <p className="text-white/60 text-sm">
            {formatDate(session.date)} at {formatTime(session.date)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {session.duration && (
          <div className="flex items-center gap-1 text-white/60 text-sm">
            <Clock className="w-3 h-3" />
            <span>{session.duration}m</span>
          </div>
        )}
        
        {session.completed ? (
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-green-500/20 text-green-400 border-green-400/30"
            >
              {getOverallScore(session.scores)}/10
            </Badge>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
        ) : (
          <Badge 
            variant="secondary" 
            className="bg-orange-500/20 text-orange-400 border-orange-400/30"
          >
            Incomplete
          </Badge>
        )}
      </div>
    </div>
  );
};

const PerformanceOverview = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-white">
        <p>No performance data available</p>
      </div>
    );
  }

  const {
    totalInterviews,
    completedInterviews,
    averageScores,
    recentSessions,
    completionRate,
    averageDuration
  } = data;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Interviews"
          value={totalInterviews}
          subtitle="All time"
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={completedInterviews}
          subtitle={`${completionRate}% completion rate`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Average Score"
          value={`${averageScores.overall}/10`}
          subtitle="Overall performance"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Avg Duration"
          value={`${averageDuration}m`}
          subtitle="Per interview"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Scores */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Skill Breakdown
            </CardTitle>
            <p className="text-white/60 text-sm">Average scores across all interviews</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreCard
              title="Technical Skills"
              score={averageScores.technical}
              color="blue"
            />
            <ScoreCard
              title="Communication"
              score={averageScores.communication}
              color="green"
            />
            <ScoreCard
              title="Confidence"
              score={averageScores.confidence}
              color="purple"
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Performance Insights
            </CardTitle>
            <p className="text-white/60 text-sm">Key metrics and achievements</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/80">Completion Rate</span>
              <span className="text-white font-medium">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/80">Best Skill</span>
              <span className="text-white font-medium">
                {averageScores.communication >= averageScores.technical && averageScores.communication >= averageScores.confidence
                  ? 'Communication'
                  : averageScores.technical >= averageScores.confidence
                  ? 'Technical'
                  : 'Confidence'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-white/80">Total Practice Time</span>
              <span className="text-white font-medium">{Math.round(averageDuration * completedInterviews / 60)}h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Recent Interview Sessions
          </CardTitle>
          <p className="text-white/60 text-sm">Your latest {recentSessions.length} interview attempts</p>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <RecentSessionCard key={session.id} session={session} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No interviews yet</p>
              <p className="text-sm">Start your first interview to see your progress here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOverview;
