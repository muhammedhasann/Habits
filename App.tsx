
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
import { getUserData, saveUserData } from './services/integrationService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const auth = isAuthenticated();
    setIsLoggedIn(auth);
    
    if (auth) {
      // Strict check for daily plan using new data service
      const log = getUserData<any>(`log-${today}`);
      if (!log) {
          setShowBriefing(true);
      } else {
          if (!log.plan) setShowBriefing(true);
      }
    }
  }, [today, isLoggedIn]);

  const handleBriefingComplete = (plan: { mit: string; top3: string[] }) => {
      const current = getUserData<any>(`log-${today}`) || { date: today, completedHabitIds: [] };
      
      current.plan = { ...plan, quote: "Action expresses priorities." };
      saveUserData(`log-${today}`, current);
      setShowBriefing(false);
      // Force update
      window.location.href = '/#/';
  };

  const handleLoginSuccess = () => {
      setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
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
