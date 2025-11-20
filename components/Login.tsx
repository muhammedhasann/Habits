
import React, { useState } from 'react';
import { BrainCircuit, CheckCircle2, ArrowRight, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerUser } from '../services/authService';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            onLoginSuccess();
        } catch (error) {
            setError("Google connection failed. Try email.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            if (mode === 'signup') {
                if (!formData.name) {
                    setError("Name is required.");
                    setLoading(false);
                    return;
                }
                await registerUser(formData.name, formData.email, formData.password);
            } else {
                await loginWithEmail(formData.email, formData.password);
            }
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050507] relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-neon-cyan/10 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[100px] rounded-full animate-pulse-slow" />
            </div>

            <div className="z-10 max-w-md w-full p-8 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-neon-cyan to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,243,255,0.4)]">
                        <BrainCircuit className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black border border-glass-border px-2 py-1 rounded-lg text-[10px] text-neon-cyan font-mono font-bold">
                        v3.0
                    </div>
                </div>

                <h1 className="text-4xl font-mono font-bold text-white mb-2 tracking-tighter text-center">
                    NeuroFlow
                </h1>
                <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">
                    The Operating System for your Mind.
                </p>

                <div className="bg-glass-bg border border-glass-border rounded-3xl p-8 w-full shadow-2xl backdrop-blur-xl">
                    {/* Tabs */}
                    <div className="flex mb-6 bg-black/40 rounded-xl p-1">
                        <button 
                            onClick={() => { setMode('login'); setError(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-neon-cyan text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => { setMode('signup'); setError(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-neon-cyan text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white text-sm focus:border-neon-cyan outline-none transition-colors"
                                        placeholder="Dr. Andrew Huberman"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white text-sm focus:border-neon-cyan outline-none transition-colors"
                                    placeholder="user@neuroflow.ai"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white text-sm focus:border-neon-cyan outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-xs">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-neon-cyan to-blue-500 text-black font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {mode === 'login' ? 'Access System' : 'Initialize Account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-[1px] bg-white/10 flex-1" />
                        <span className="text-[10px] text-gray-500 uppercase">Or continue with</span>
                        <div className="h-[1px] bg-white/10 flex-1" />
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3 border border-white/10"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
