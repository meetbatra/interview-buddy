import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import { getNextQuestion } from '../api/interviewApi';

export const useInterviewLogic = (sessionId, firstQuestion, firstQuestionAudioUrl, onClose) => {
  // Get auth token
  const { token } = useAuthStore();
  
  // State management - Reverted to original approach
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const hasPlayedFirstQuestion = useRef(false);

  // Animation effect for mounting
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle animated close
  const handleClose = () => {
    if (isInterviewComplete) {
      setIsClosing(true);
      setTimeout(() => {
        onClose(true); // Pass true for completed interview
      }, 300);
      return;
    }
    setShowExitConfirmation(true);
  };

  // Confirm exit and close
  const confirmExit = () => {
    setShowExitConfirmation(false);
    setIsClosing(true);
    setTimeout(() => {
      onClose(false); // Pass false for quit/incomplete interview
    }, 300);
  };

  // Cancel exit
  const cancelExit = () => {
    setShowExitConfirmation(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showExitConfirmation) {
          cancelExit();
        } else {
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showExitConfirmation]);

  // Handle space key for mic control
  useEffect(() => {
    const handleSpaceKey = (event) => {
      if (event.code === 'Space' && !isInterviewComplete && !isAudioPlaying && !isProcessingResponse) {
        // Prevent default behavior (page scroll)
        event.preventDefault();
        
        if (isMicEnabled) {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording();
          }
        }
      }
    };

    document.addEventListener('keydown', handleSpaceKey);
    return () => {
      document.removeEventListener('keydown', handleSpaceKey);
    };
  }, [isRecording, isMicEnabled, isInterviewComplete, isAudioPlaying, isProcessingResponse]);

  // Initialize first question
  useEffect(() => {
    if (firstQuestion && !hasPlayedFirstQuestion.current) {
      hasPlayedFirstQuestion.current = true;
      setMessages([{ 
        id: `msg-${Date.now()}-first-question`,
        type: 'question', 
        text: firstQuestion, 
        timestamp: new Date() 
      }]);
      speakQuestion(firstQuestion, firstQuestionAudioUrl);
    }
  }, [firstQuestion]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserResponse(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsMicEnabled(true);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsMicEnabled(true);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakQuestion = async (questionText, audioUrl = null) => {
    console.log('speakQuestion called with:', { questionText, audioUrl });
    setIsAudioPlaying(true);
    setIsMicEnabled(false);

    try {
      if (audioUrl) {
        console.log('Using Murf audio:', audioUrl);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          console.log('Murf audio ended');
          setIsAudioPlaying(false);
          setIsMicEnabled(true);
          audioRef.current = null;
        };

        audio.onerror = () => {
          console.error('Murf audio playback failed, falling back to Web Speech API');
          fallbackToWebSpeech(questionText);
        };

        await audio.play();
      } else {
        console.log('No audioUrl provided, using Web Speech API');
        fallbackToWebSpeech(questionText);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      fallbackToWebSpeech(questionText);
    }
  };

  const fallbackToWebSpeech = (questionText) => {
    console.log('Using Web Speech API fallback for:', questionText);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        console.log('Web Speech API ended');
        setIsAudioPlaying(false);
        setIsMicEnabled(true);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.log('No speech synthesis support');
      setIsAudioPlaying(false);
      setIsMicEnabled(true);
    }
  };

  const handleUserResponse = async (transcript) => {
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'answer',
      text: transcript,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessingResponse(true);

    try {
      const response = await getNextQuestion(sessionId, transcript, currentQuestionIndex, token);
      const data = response.data;

      if (data.success) {
        if (data.isComplete) {
          setIsProcessingResponse(false);
          const completionMessage = {
            id: `msg-${Date.now()}-completion`,
            type: 'system',
            text: "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completionMessage]);
          
          // Play completion message with Murf TTS
          setTimeout(() => {
            speakQuestion(
              "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.",
              null // No audio URL, will use text-to-speech
            );
            
            // Set interview complete after a short delay to allow the message to play
            setTimeout(() => {
              setIsInterviewComplete(true);
            }, 3000);
          }, 500);
        } else {
          setIsProcessingResponse(false);
          const nextQuestion = {
            id: `msg-${Date.now()}-question`,
            type: 'question',
            text: data.nextQuestion,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextQuestion]);
          setCurrentQuestionIndex(prev => prev + 1);
          
          setTimeout(() => {
            speakQuestion(data.nextQuestion, data.audioUrl);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      setIsProcessingResponse(false);
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'system',
        text: "Sorry, there was an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsMicEnabled(true);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording && isMicEnabled) {
      setIsRecording(true);
      setIsMicEnabled(false);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    setIsAudioPlaying(false);
    setIsMicEnabled(true);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return {
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
  };
};
