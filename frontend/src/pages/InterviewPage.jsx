import { useInterviewLogic } from '../hooks/useInterviewLogic';
import TerminalHeader from '../components/interview/TerminalHeader';
import ChatMessages from '../components/interview/ChatMessages';
import TerminalControls from '../components/interview/TerminalControls';
import ExitConfirmationDialog from '../components/interview/ExitConfirmationDialog';

const InterviewPage = ({ sessionId, firstQuestion, firstQuestionAudioUrl, onClose }) => {
  const {
    // State
    messages,
    isRecording,
    isMicEnabled,
    isAudioPlaying,
    currentQuestionIndex,
    isInterviewComplete,
    isVisible,
    isClosing,
    showExitConfirmation,
    isProcessingResponse,
    
    // Refs
    messagesEndRef,
    
    // Functions
    handleClose,
    confirmExit,
    cancelExit,
    startRecording,
    stopRecording,
    stopTTS,
    formatTime
  } = useInterviewLogic(sessionId, firstQuestion, firstQuestionAudioUrl, onClose);

  return (
    <div 
      className={`fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible && !isClosing 
          ? 'opacity-100' 
          : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !showExitConfirmation) {
          handleClose();
        }
      }}
    >
      <div 
        className={`w-full max-w-5xl h-[85vh] bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-600 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          isVisible && !isClosing 
            ? 'scale-100 translate-y-0' 
            : 'scale-95 translate-y-4'
        }`}
      >
        <TerminalHeader 
          currentQuestionIndex={currentQuestionIndex}
          isInterviewComplete={isInterviewComplete}
          isVisible={isVisible}
          isClosing={isClosing}
          onClose={handleClose}
        />

        <ChatMessages 
          messages={messages}
          isAudioPlaying={isAudioPlaying}
          isVisible={isVisible}
          isClosing={isClosing}
          formatTime={formatTime}
          ref={messagesEndRef}
        />

        <TerminalControls 
          isVisible={isVisible}
          isClosing={isClosing}
          isAudioPlaying={isAudioPlaying}
          isRecording={isRecording}
          isMicEnabled={isMicEnabled}
          isInterviewComplete={isInterviewComplete}
          isProcessingResponse={isProcessingResponse}
          onStopTTS={stopTTS}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onClose={handleClose}
        />
      </div>

      <ExitConfirmationDialog 
        show={showExitConfirmation}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </div>
  );
};

export default InterviewPage;
