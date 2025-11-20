
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, Zap, ShoppingBag, Eye, BookOpen, BrainCircuit, HeartPulse, UserCircle, Link as LinkIcon, Calendar, CheckSquare, Watch, LogOut, Mic, MessageSquare, X, Send, ClipboardCheck } from 'lucide-react';
import { getAuthUser, logout } from '../services/authService';
import { executeQuickAction } from '../services/geminiService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getAuthUser();
  
  // FAB State
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickResponse, setQuickResponse] = useState('');

  const navItems = [
    { path: '/', icon: Home, label: 'Protocol' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/bio-sync', icon: HeartPulse, label: 'Bio-Sync' },
    { path: '/dashboard', icon: Activity, label: 'Metrics' },
    { path: '/review', icon: ClipboardCheck, label: 'Review' },
    { path: '/vision', icon: Eye, label: 'Vision' },
    { path: '/shifters', icon: Zap, label: 'Shifters' },
    { path: '/customization', icon: ShoppingBag, label: 'Customize' },
    { path: '/assistant', icon: BrainCircuit, label: 'AI Chat' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  const externalLinks = [
      { name: 'Tasks', icon: CheckSquare, url: 'https://tasks.google.com' },
      { name: 'Calendar', icon: Calendar, url: 'https://calendar.google.com' },
      { name: 'Fit', icon: Watch, url: 'https://fit.google.com' }
  ];

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  const handleQuickAction = async () => {
      if(!quickInput.trim()) return;
      setQuickResponse("Processing...");
      const res = await executeQuickAction(quickInput);
      setQuickResponse(res);
      setQuickInput('');
      setTimeout(() => {
          if(res.includes("Done")) setShowFabMenu(false);
      }, 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#050507] text-gray-100 font-sans overflow-hidden selection:bg-neon-cyan selection:text-black">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 border-r border-glass-border bg-black/60 backdrop-blur-xl fixed h-full z-20">
        <div className="p-8 flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-blue-600 rounded-full shadow-[0_0_15px_rgba(0,243,255,0.3)]" />
            <h1 className="hidden lg:block font-mono font-bold text-xl tracking-tight text-white">
              NeuroFlow
            </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-lg shadow-white/5' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-neon-cyan' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="hidden lg:block font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Integrations Section */}
          <div className="mt-8 pt-8 border-t border-white/5">
             <p className="hidden lg:block px-4 text-[10px] font-bold text-gray-600 uppercase mb-3 tracking-widest">Quick Links</p>
             {externalLinks.map(link => (
                 <a 
                    key={link.name} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
                 >
                    <link.icon className="w-5 h-5 group-hover:text-neon-purple transition-colors" />
                    <span className="hidden lg:block font-medium text-sm">{link.name}</span>
                 </a>
             ))}
          </div>
        </nav>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-glass-border hidden lg:block bg-black/20">
            {user && (
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-white/10" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-neon-cyan truncate font-mono">Lv. 5 Operator</p>
                        </div>
                     </div>
                     <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 transition-colors">
                         <LogOut className="w-4 h-4" />
                     </button>
                </div>
            )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-glass-border z-50 flex justify-between px-6 py-4 pb-safe">
         {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-xl transition-all ${isActive ? 'text-neon-cyan bg-white/10' : 'text-gray-500'}`}
              >
                <item.icon className="w-6 h-6" />
              </Link>
            );
          })}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-20 lg:pl-64 min-h-screen relative overflow-y-auto scroll-smooth">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0 mix-blend-overlay fixed" />
        <div className="relative z-10 p-6 md:p-12 pb-24 md:pb-10 max-w-7xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Global AI FAB */}
      <div className="fixed bottom-24 md:bottom-10 right-6 md:right-10 z-40">
        {showFabMenu && (
            <div className="absolute bottom-16 right-0 w-80 bg-[#0a0a0c] border border-glass-border rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-neon-cyan uppercase tracking-wider">Neural Command</h3>
                    <button onClick={() => setShowFabMenu(false)}><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="min-h-[80px] bg-white/5 rounded-2xl mb-4 p-4 text-sm text-gray-300 font-mono flex items-center justify-center text-center">
                    {quickResponse || "System Ready."}
                </div>
                <div className="flex gap-2">
                    <input 
                        autoFocus
                        type="text" 
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickAction()}
                        placeholder="Type command..."
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-cyan outline-none transition-colors"
                    />
                    <button onClick={handleQuickAction} className="p-3 bg-neon-cyan text-black rounded-xl hover:bg-white transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
        <button 
            onClick={() => setShowFabMenu(!showFabMenu)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all duration-300 hover:scale-110 ${showFabMenu ? 'bg-white text-black rotate-45' : 'bg-neon-cyan text-black'}`}
        >
            {showFabMenu ? <X className="w-6 h-6" /> : <BrainCircuit className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default Layout;
