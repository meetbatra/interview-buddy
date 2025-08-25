import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const SummaryCard = ({ summary }) => {
  return (
    <Card className="w-full bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <FileText className="w-5 h-5 text-blue-400" />
          Interview Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {summary?.split('\n').filter(line => line.trim()).map((line, index) => (
            <p key={index} className="text-gray-200 leading-relaxed">
              {line.trim()}
            </p>
          )) || (
            <p className="text-gray-400 italic">
              No summary available. The interview may still be processing.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
