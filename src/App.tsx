import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './pages/Home';
import RecruitmentStages from './pages/RecruitmentStages';
import InterviewQA from './pages/InterviewQA';
import DressGuide from './pages/DressGuide';
import OneStepProgram from './pages/OneStepProgram';
import Profile from './pages/Profile';
import Navigation from './components/Navigation';

function App() {
  const [user, setUser] = useState<null | object>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3EF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D71920] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2C2C2C] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggleAuth={() => setShowLogin(false)} />
    ) : (
      <Signup onToggleAuth={() => setShowLogin(true)} />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'recruitment':
        return <RecruitmentStages />;
      case 'interview':
        return <InterviewQA />;
      case 'dress':
        return <DressGuide />;
      case 'onestep':
        return <OneStepProgram />;
      case 'profile':
        return <Profile />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div>
      {renderPage()}
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
