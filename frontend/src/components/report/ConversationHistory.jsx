import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, User, Bot } from "lucide-react";

const MessageItem = ({ message, index }) => {
  const isQuestion = message.type === 'question' || message.type === 'system';
  const isAnswer = message.type === 'answer';
  
  if (!isQuestion && !isAnswer) return null;

  return (
    <div className={`flex gap-3 ${isAnswer ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isQuestion ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
      }`}>
        {isQuestion ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      
      <div className={`max-w-[80%] ${isAnswer ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg ${
          isQuestion 
            ? 'bg-blue-500/20 border border-blue-400/30 text-blue-100' 
            : 'bg-green-500/20 border border-green-400/30 text-green-100'
        }`}>
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        
        {message.timestamp && (
          <p className={`text-xs text-gray-400 mt-1 ${isAnswer ? 'text-right' : ''}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
      </div>
    </div>
  );
};

const ConversationHistory = ({ messages = [] }) => {
  const conversationMessages = messages.filter(msg => 
    msg.type === 'question' || msg.type === 'answer' || msg.type === 'system'
  );

  return (
    <Card className="w-full bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          Conversation History
        </CardTitle>
        <p className="text-sm text-gray-300 mt-1">
          Complete interview conversation ({conversationMessages.length} messages)
        </p>
      </CardHeader>
      <CardContent>
        {conversationMessages.length > 0 ? (
          <div className="space-y-4">
            {conversationMessages.map((message, index) => (
              <MessageItem key={message.id || index} message={message} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No conversation history</p>
            <p className="text-sm">The interview conversation will appear here once completed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;
