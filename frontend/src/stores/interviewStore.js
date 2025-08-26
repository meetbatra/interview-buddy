import { create } from 'zustand';

const useInterviewStore = create((set, get) => ({
  // State
  sessionId: null,
  firstQuestion: '',
  firstQuestionAudioUrl: '',
  
  // Actions
  setSessionData: (sessionId, firstQuestion, firstQuestionAudioUrl) => 
    set({ sessionId, firstQuestion, firstQuestionAudioUrl }),
  
  clearSession: () => 
    set({ sessionId: null, firstQuestion: '', firstQuestionAudioUrl: '' }),
  
  // Demo session
  setDemoSession: () => 
    set({ sessionId: '68ab36cb2607973454fa10af' })
}));

export default useInterviewStore;
