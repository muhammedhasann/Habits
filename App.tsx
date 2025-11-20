
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HabitTracker from './components/HabitTracker';
import Dashboard from './components/Dashboard';
import StateShifters from './components/StateShifters';
import AIChat from './components/AIChat';
import SmartJournal from './components/SmartJournal';
import VisionBoard from './components/VisionBoard';
import BioSync from './components/BioSync';
import ProfileSettings from './components/ProfileSettings';
import Marketplace from './components/Marketplace';
import ReviewModule from './components/ReviewModule';
import DailyBriefingModal from './components/DailyBriefingModal';
import Login from './components/Login';
import { isAuthenticated } from './services/authService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const auth = isAuthenticated();
    setIsLoggedIn(auth);
    
    if (auth) {
      // Strict check for daily plan
      const log = localStorage.getItem(`log-${today}`);
      if (!log) {
          setShowBriefing(true);
      } else {
          const parsed = JSON.parse(log);
          if (!parsed.plan) setShowBriefing(true);
      }
    }
  }, [today]);

  const handleBriefingComplete = (plan: { mit: string; top3: string[] }) => {
      const saved = localStorage.getItem(`log-${today}`);
      const current = saved ? JSON.parse(saved) : { date: today, completedHabitIds: [] };
      
      current.plan = { ...plan, quote: "Action expresses priorities." };
      localStorage.setItem(`log-${today}`, JSON.stringify(current));
      setShowBriefing(false);
      // We force a reload to ensure all components pick up the new plan state immediately
      window.location.reload(); 
  };

  if (!isLoggedIn) {
      return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <Layout>
        {/* Modal sits outside routes to block everything */}
        <DailyBriefingModal isOpen={showBriefing} onComplete={handleBriefingComplete} />
        
        <Routes>
          <Route path="/" element={<HabitTracker />} />
          <Route path="/journal" element={<SmartJournal />} />
          <Route path="/bio-sync" element={<BioSync />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review" element={<ReviewModule />} />
          <Route path="/vision" element={<VisionBoard />} />
          <Route path="/shifters" element={<StateShifters />} />
          <Route path="/customization" element={<Marketplace />} />
          <Route path="/assistant" element={<AIChat />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
