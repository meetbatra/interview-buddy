import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import { getNextQuestion, transcribeAudio, endInterview } from '../api/interviewApi';

export const useInterviewLogic = (sessionId, firstQuestion, firstQuestionAudioUrl, onClose) => {
  // Get auth token
  const { token } = useAuthStore();
  
  // State management
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
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const hasPlayedFirstQuestion = useRef(false);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

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

  // Space key handler for recording
  useEffect(() => {
    const handleSpaceKey = (event) => {
      if (event.code === 'Space' && !isInterviewComplete && !isAudioPlaying && !isProcessingResponse) {
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

  // Timer countdown effect
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            setIsTimerActive(false);
            if (isRecording && mediaRecorderRef.current) {
              stopRecording();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerActive, timeRemaining, isRecording]);

  // MediaRecorder initialization
  useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          } 
        });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = []; // Clear chunks
          
          // Send audio to backend for transcription
          await processAudioTranscription(audioBlob);
        };

        setIsMicEnabled(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setIsMicEnabled(false);
      }
    };

    initializeMediaRecorder();

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Process audio transcription
  const processAudioTranscription = async (audioBlob) => {
    setIsProcessingResponse(true);
    try {
      const response = await transcribeAudio(sessionId, audioBlob, token);
      
      if (response.data.success && response.data.transcript) {
        await handleUserResponse(response.data.transcript);
      } else {
        console.error('Transcription failed:', response.data);
        setIsProcessingResponse(false);
        setIsMicEnabled(true);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setIsProcessingResponse(false);
      setIsMicEnabled(true);
    }
  };

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

  const speakQuestion = async (questionText, audioUrl = null) => {
    // Stop any ongoing recording before starting audio
    if (isRecording && mediaRecorderRef.current) {
      setIsRecording(false);
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.log('Error stopping recording before audio:', error);
      }
    }
    
    setIsAudioPlaying(true);
    setIsMicEnabled(false);

    try {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsAudioPlaying(false);
          setIsMicEnabled(true);
          audioRef.current = null;
        };

        audio.onerror = () => {
          fallbackToWebSpeech(questionText);
        };

        await audio.play();
      } else {
        fallbackToWebSpeech(questionText);
      }
    } catch (error) {
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
        setIsAudioPlaying(false);
        setIsMicEnabled(true);
      };

      speechSynthesis.speak(utterance);
    } else {
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

    try {
      const response = await getNextQuestion(sessionId, transcript, currentQuestionIndex, token);
      const data = response.data;

      if (data.success) {
        if (data.isComplete) {
          // Call the end interview endpoint to get the final message and audio
          try {
            const endResponse = await endInterview(sessionId, token);
            const endData = endResponse.data;
            
            if (endData.success) {
              setIsProcessingResponse(false);
              const completionMessage = {
                id: `msg-${Date.now()}-completion`,
                type: 'system',
                text: endData.finalMessage,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, completionMessage]);
              
              // Play completion message with Murf TTS audio from backend
              setTimeout(() => {
                speakQuestion(endData.finalMessage, endData.audioUrl);
                
                // Set interview complete after a short delay to allow the message to play
                setTimeout(() => {
                  setIsInterviewComplete(true);
                }, 3000);
              }, 500);
            } else {
              // Fallback to local message if endpoint fails
              setIsProcessingResponse(false);
              const completionMessage = {
                id: `msg-${Date.now()}-completion`,
                type: 'system',
                text: "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, completionMessage]);
              
              setTimeout(() => {
                speakQuestion(
                  "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.",
                  null
                );
                
                setTimeout(() => {
                  setIsInterviewComplete(true);
                }, 3000);
              }, 500);
            }
          } catch (endError) {
            console.error('Error ending interview:', endError);
            // Fallback to local message if endpoint fails
            setIsProcessingResponse(false);
            const completionMessage = {
              id: `msg-${Date.now()}-completion`,
              type: 'system',
              text: "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, completionMessage]);
            
            setTimeout(() => {
              speakQuestion(
                "Thank you for your time! You can see your results by clicking the button at the bottom right of this dialog.",
                null
              );
              
              setTimeout(() => {
                setIsInterviewComplete(true);
              }, 3000);
            }, 500);
          }
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

  // View report
  const viewReport = () => {
    onClose(true); // Navigate to report
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording && isMicEnabled) {
      setIsRecording(true);
      audioChunksRef.current = []; // Clear previous chunks
      setCurrentTranscript('Recording...'); // Show recording status
      
      // Automatically start 5-minute timer on first recording
      if (!isTimerActive) {
        setTimeRemaining(300); // 5 minutes = 300 seconds
        setIsTimerActive(true);
      }
      
      try {
        mediaRecorderRef.current.start();
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      setCurrentTranscript('Processing...');
      
      // Stop timer when user manually stops recording
      setIsTimerActive(false);
      setTimeRemaining(0);
      
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsMicEnabled(true);
        setCurrentTranscript('');
      }
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

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining > 120) return 'text-green-600'; // Green for >2 minutes
    if (timeRemaining > 60) return 'text-yellow-600'; // Yellow for >1 minute
    return 'text-red-600'; // Red for <=1 minute
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
    currentTranscript,
    timeRemaining,
    isTimerActive,
    
    // Refs
    messagesEndRef,
    
    // Functions
    handleClose,
    viewReport,
    confirmExit,
    cancelExit,
    startRecording,
    stopRecording,
    stopTTS,
    formatTime,
    formatTimer,
    getTimerColor
  };
};
