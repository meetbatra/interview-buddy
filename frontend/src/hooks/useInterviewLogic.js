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
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Refs
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const hasPlayedFirstQuestion = useRef(false);
  const transcriptRef = useRef('');
  const shouldKeepRecording = useRef(false); // Track if we want continuous recording
  const restartTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(0);

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

  // Navigate to report (only called from "view summary" button)
  const viewReport = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(true); // Pass true for completed interview to show report
    }, 300);
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

  // Enhanced speech recognition initialization
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Enhanced configuration for continuous recording
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update last speech time when we get any result
        lastSpeechTimeRef.current = Date.now();

        // Clear any existing silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }

        // Update the transcript ref with final results
        if (finalTranscript) {
          transcriptRef.current = transcriptRef.current + finalTranscript;
          setCurrentTranscript(transcriptRef.current); // Update state for UI
        } else if (interimTranscript) {
          // Show interim results in UI
          setCurrentTranscript(transcriptRef.current + interimTranscript);
        }

        // Extended silence detection for longer responses
        if (finalTranscript.trim() && shouldKeepRecording.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (isRecording && shouldKeepRecording.current) {
              // Stop recording after extended silence period
              stopRecording();
            }
          }, 6000); // Increased to 6 seconds of silence
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific errors
        if (event.error === 'no-speech') {
          console.log('No speech detected, will restart if needed');
        } else if (event.error === 'audio-capture') {
          console.log('Audio capture failed');
          setIsRecording(false);
          shouldKeepRecording.current = false;
          setIsMicEnabled(true);
        } else if (event.error === 'not-allowed') {
          console.log('Microphone permission denied');
          setIsRecording(false);
          shouldKeepRecording.current = false;
          setIsMicEnabled(false);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        
        // Clear any pending timeouts
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }

        // Only restart if we should keep recording and we're still in recording mode
        if (shouldKeepRecording.current && isRecording && isMicEnabled) {
          restartTimeoutRef.current = setTimeout(() => {
            try {
              if (shouldKeepRecording.current && recognitionRef.current) {
                console.log('Auto-restarting speech recognition for continuous capture...');
                recognitionRef.current.start();
              }
            } catch (error) {
              console.error('Error restarting recognition:', error);
              // If restart fails multiple times, stop recording
              setIsRecording(false);
              shouldKeepRecording.current = false;
            }
          }, 50); // Reduced delay for faster restart
        } else {
          setIsRecording(false);
          shouldKeepRecording.current = false;
        }
      };
    }

    return () => {
      // Cleanup timeouts
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      if (recognitionRef.current) {
        shouldKeepRecording.current = false;
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping recognition on cleanup:', error);
        }
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

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

  // Stop recording when mic is disabled
  useEffect(() => {
    if (!isMicEnabled && isRecording && recognitionRef.current) {
      shouldKeepRecording.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition when mic disabled:', error);
      }
    }
  }, [isMicEnabled, isRecording]);

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
    if (isRecording && recognitionRef.current) {
      shouldKeepRecording.current = false;
      setIsRecording(false);
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition before audio:', error);
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
      console.log('Starting continuous recording...');
      setIsRecording(true);
      shouldKeepRecording.current = true;
      
      // Clear any previous transcript
      transcriptRef.current = '';
      setCurrentTranscript('');
      lastSpeechTimeRef.current = Date.now();
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsRecording(false);
        shouldKeepRecording.current = false;
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      console.log('Stopping continuous recording...');
      shouldKeepRecording.current = false;
      setIsRecording(false);
      
      // Clear any pending timeouts
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      // Stop recognition gracefully
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
      
      // Send the accumulated transcript
      setTimeout(() => {
        const finalText = transcriptRef.current.trim();
        
        if (finalText) {
          handleUserResponse(finalText);
          transcriptRef.current = ''; // Clear after sending
          setCurrentTranscript(''); // Clear UI
        } else {
          setIsMicEnabled(true);
        }
      }, 300); // Slightly longer delay to ensure recognition has fully stopped
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all timeouts and stop recognition
      shouldKeepRecording.current = false;
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping recognition on cleanup:', error);
        }
      }
    };
  }, []);

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
    currentTranscript, // This will show live transcript during recording
    
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
    formatTime
  };
};