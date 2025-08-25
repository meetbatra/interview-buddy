import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, AlertTriangle } from "lucide-react";

const StrengthWeaknessItem = ({ items, type, icon: Icon, bgColor, textColor }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="italic">No {type.toLowerCase()} identified yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className={`p-3 rounded-lg ${bgColor} border-l-4 ${textColor}`}>
          <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const StrengthWeakness = ({ strengths = [], weaknesses = [] }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Strengths */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StrengthWeaknessItem 
            items={strengths}
            type="Strengths"
            icon={ThumbsUp}
            bgColor="bg-green-500/20"
            textColor="border-green-400 text-green-200"
          />
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StrengthWeaknessItem 
            items={weaknesses}
            type="Areas for improvement"
            icon={AlertTriangle}
            bgColor="bg-orange-500/20"
            textColor="border-orange-400 text-orange-200"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StrengthWeakness;
