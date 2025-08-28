import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
        <Progress 
          value={percentage} 
          className="w-24 h-2 bg-white/20"
          style={{
            '--progress-background': percentage >= 80 ? '#4ade80' : 
                                   percentage >= 60 ? '#facc15' : '#f87171'
          }}
        />
        <Badge 
          variant="secondary" 
          className={`font-bold min-w-[3rem] text-center ${
            percentage >= 80 ? 'bg-green-500/20 text-green-400 border-green-400/50' : 
            percentage >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50' : 
            'bg-red-500/20 text-red-400 border-red-400/50'
          }`}
        >
          {score}/{maxScore}
        </Badge>
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
            <Badge 
              variant="outline" 
              className="text-2xl font-bold text-blue-400 border-blue-400/50 bg-blue-500/10 px-4 py-2"
            >
              {Math.round((finalScores.technical + finalScores.communication + finalScores.confidence) / 3 * 10) / 10}/10
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Scorecard;
