import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from 'lucide-react';

const TerminalControls = ({ 
  isVisible,
  isClosing,
  isAudioPlaying,
  isRecording,
  isMicEnabled,
  isInterviewComplete,
  onStopTTS,
  onStartRecording,
  onStopRecording,
  onClose
}) => {
  return (
    <div className={`border-t border-gray-600 bg-gray-800/50 p-4 transition-all duration-700 ease-out ${
      isVisible && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      <div className="flex items-center justify-between">
        {/* Status Bar */}
        <div className="flex items-center space-x-4 font-mono text-xs">
          {isAudioPlaying && (
            <div className="flex items-center space-x-2 text-blue-400">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>audio.playing</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onStopTTS}
                className="text-xs px-2 py-1 h-6 font-mono border-gray-600 text-gray-300 hover:text-white"
              >
                stop
              </Button>
            </div>
          )}
          {!isAudioPlaying && !isMicEnabled && !isInterviewComplete && (
            <div className="text-yellow-400">
              <span>status: </span>
              <span className="text-gray-300">waiting_for_audio</span>
            </div>
          )}
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>mic.recording</span>
            </div>
          )}
          {isMicEnabled && !isRecording && !isAudioPlaying && (
            <div className="text-green-400">
              <span>mic.ready</span>
            </div>
          )}
        </div>

        {/* Mic Control */}
        {!isInterviewComplete && (
          <div className="flex items-center space-x-3">
            <Button
              size="lg"
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={!isMicEnabled || isAudioPlaying}
              className={`w-14 h-14 rounded-full border-2 font-mono ${
                isRecording 
                  ? 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30' 
                  : isMicEnabled 
                  ? 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30' 
                  : 'bg-gray-600/20 border-gray-500 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}

        {/* Interview Complete */}
        {isInterviewComplete && (
          <Button 
            onClick={onClose}
            className="bg-blue-600/20 border border-blue-500 text-blue-400 hover:bg-blue-600/30 font-mono"
          >
            ./view_summary.sh
          </Button>
        )}
      </div>
      
      <div className="text-center mt-3 text-xs text-gray-500 font-mono">
        {!isInterviewComplete && (
          isMicEnabled 
            ? "$ press [SPACE] or click mic to record response" 
            : isAudioPlaying
            ? "$ audio stream active... please wait"
            : "$ initializing next prompt..."
        )}
      </div>
    </div>
  );
};

export default TerminalControls;
