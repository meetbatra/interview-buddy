import { forwardRef } from 'react';

const ChatMessages = forwardRef(({ 
  messages, 
  isAudioPlaying, 
  isVisible, 
  isClosing,
  formatTime 
}, messagesEndRef) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/50 font-mono text-sm transition-all duration-700 ease-out ${
      isVisible && !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      {messages.map((message, index) => (
        <div 
          key={message.id} 
          className={`space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Terminal Prompt Line */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${
              message.type === 'question' 
                ? 'text-blue-400' 
                : message.type === 'answer'
                ? 'text-green-400'
                : 'text-yellow-400'
            }`}>
              {message.type === 'question' 
                ? '🤖 interviewer@ai:~$' 
                : message.type === 'answer'
                ? '👤 candidate@session:~$'
                : '💬 system@log:~$'
              }
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          {/* Message Content */}
          <div className={`pl-6 leading-relaxed ${
            message.type === 'question'
              ? 'text-blue-300 border-l-2 border-blue-500/30 pl-4'
              : message.type === 'answer'
              ? 'text-green-300 border-l-2 border-green-500/30 pl-4'
              : 'text-yellow-300 border-l-2 border-yellow-500/30 pl-4'
          }`}>
            {message.text}
          </div>
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isAudioPlaying && (
        <div className="space-y-1 opacity-70">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-blue-400">🤖 interviewer@ai:~$</span>
            <span className="text-xs text-gray-500">now</span>
          </div>
          <div className="pl-6 text-blue-300 border-l-2 border-blue-500/30">
            <span>generating audio response</span>
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
