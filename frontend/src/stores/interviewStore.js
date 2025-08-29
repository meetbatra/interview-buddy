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
    set({ sessionId: null, firstQuestion: '', firstQuestionAudioUrl: '' })
}));

export default useInterviewStore;
