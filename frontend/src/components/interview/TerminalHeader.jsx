import { Button } from "@/components/ui/button";

const TerminalHeader = ({ 
  currentQuestionIndex, 
  isInterviewComplete, 
  isVisible, 
  isClosing, 
  onClose 
}) => {
  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-gray-800/90 border-b border-gray-600 transition-all duration-500 ease-out ${
      isVisible && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-green-400 font-mono text-sm">~/interview-session</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <div className="flex items-center space-x-4">
        <span className={`text-sm font-mono ${
          isInterviewComplete ? 'text-green-400' : 'text-gray-400'
        }`}>
          {isInterviewComplete ? 'Interview Complete ✓' : `Question ${currentQuestionIndex + 1}/10`}
        </span>
        {!isInterviewComplete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-900 transition-colors font-mono"
          >
            exit
          </Button>
        )}
      </div>
    </div>
  );
};

export default TerminalHeader;
