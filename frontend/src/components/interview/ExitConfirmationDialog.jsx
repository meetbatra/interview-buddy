import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ExitConfirmationDialog = ({ show, onConfirm, onCancel }) => {
  return (
    <Dialog open={show} onOpenChange={onCancel}>
      <DialogContent className="bg-gray-800/95 backdrop-blur-sm border-red-500/50 shadow-2xl text-white max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <DialogTitle className="text-red-400 font-mono text-lg">⚠️ Exit Interview?</DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogDescription asChild>
          <div className="text-gray-300 font-mono text-sm space-y-3">
            <p className="text-yellow-400">$ warning: interview session in progress</p>
            <p>If you exit now, you'll lose all current progress and will need to start over from the beginning.</p>
            <p className="text-blue-400">Continue with the interview to save your progress.</p>
          </div>
        </DialogDescription>
        
        <DialogFooter className="flex space-x-3 justify-end">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExitConfirmationDialog;
