import { Button } from "@/components/ui/button";

const ExitConfirmationDialog = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg border border-red-500/50 shadow-2xl max-w-md w-full p-6 animate-in fade-in scale-in-95 duration-200">
        {/* Dialog Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-red-400 font-mono text-lg">⚠️ Exit Interview?</h3>
        </div>
        
        {/* Dialog Content */}
        <div className="text-gray-300 font-mono text-sm space-y-3 mb-6">
          <p className="text-yellow-400">$ warning: interview session in progress</p>
          <p>If you exit now, you'll lose all current progress and will need to start over from the beginning.</p>
          <p className="text-blue-400">Continue with the interview to save your progress.</p>
        </div>
        
        {/* Dialog Actions */}
        <div className="flex space-x-3 justify-end">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="border-gray-600 text-gray-600 bg-gray-300 hover:bg-gray-200 hover:border-gray-500 font-mono"
          >
            Continue Interview
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/30 font-mono"
          >
            Exit & Start Over
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationDialog;
