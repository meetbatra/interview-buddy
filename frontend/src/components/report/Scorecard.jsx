import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, Zap } from "lucide-react";

const ScoreItem = ({ icon: Icon, label, score, maxScore = 10, color }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="font-medium text-white">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 bg-white/20 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage >= 80 ? 'bg-green-400' : 
              percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="font-bold text-lg min-w-[3rem] text-center text-white">
          {score}/{maxScore}
        </span>
      </div>
    </div>
  );
};

const Scorecard = ({ scores }) => {
  const defaultScores = {
    technical: 0,
    communication: 0,
    confidence: 0
  };

  const finalScores = { ...defaultScores, ...scores };

  return (
    <Card className="w-full bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Performance Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreItem 
          icon={TrendingUp}
          label="Technical Skills"
          score={finalScores.technical}
          color="bg-blue-500"
        />
        <ScoreItem 
          icon={MessageSquare}
          label="Communication"
          score={finalScores.communication}
          color="bg-green-500"
        />
        <ScoreItem 
          icon={Zap}
          label="Confidence"
          score={finalScores.confidence}
          color="bg-purple-500"
        />
        
        {/* Overall Score */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Overall Score</span>
            <span className="text-2xl font-bold text-blue-400">
              {Math.round((finalScores.technical + finalScores.communication + finalScores.confidence) / 3 * 10) / 10}/10
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Scorecard;
