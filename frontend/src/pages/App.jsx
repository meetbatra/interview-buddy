import { Routes, Route } from 'react-router-dom';
import AnimatedBackground from '../components/shared/AnimatedBackground';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import InterviewPage from './InterviewPage';
import ReportPage from './ReportPage';

function App() {

  return (
    <div className="min-h-screen relative flex flex-col">
      <AnimatedBackground />
      
      {/* Sticky Header */}
      <Header />
      
      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex items-center justify-center px-6">
              <HomePage />
            </div>
          } />
          <Route path="/login" element={
            <div className="flex-1 flex items-center justify-center px-6">
              <LoginPage />
            </div>
          } />
          <Route path="/signup" element={
            <div className="flex-1 flex items-center justify-center px-6">
              <SignupPage />
            </div>
          } />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/report" element={
            <div className="flex-1 overflow-y-auto">
              <ReportPage />
            </div>
          } />
        </Routes>
      </main>
      
      {/* Sticky Footer */}
      <Footer />
    </div>
  );
}

export default App;