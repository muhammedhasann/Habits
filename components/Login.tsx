
import React, { useState } from 'react';
import { BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            onLoginSuccess();
        } catch (error) {
            console.error("Login failed", error);
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

            <div className="z-10 max-w-md w-full p-8 flex flex-col items-center text-center">
                {/* Logo */}
                <div className="mb-8 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-neon-cyan to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,243,255,0.4)]">
                        <BrainCircuit className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black border border-glass-border px-2 py-1 rounded-lg text-[10px] text-neon-cyan font-mono font-bold">
                        v3.0
                    </div>
                </div>

                <h1 className="text-5xl font-mono font-bold text-white mb-4 tracking-tighter">
                    NeuroFlow
                </h1>
                <p className="text-gray-400 text-lg mb-10 max-w-xs leading-relaxed">
                    The Operating System for your Mind. Optimize sleep, focus, and performance.
                </p>

                <div className="space-y-4 w-full">
                    <div className="flex flex-col gap-3 text-left text-sm text-gray-500 mb-6 px-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-neon-cyan" /> AI-Powered Habit Optimization
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-neon-cyan" /> Gemini 3 Pro Analysis
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-neon-cyan" /> Bio-Sync Wearable Integration
                        </div>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                    >
                        {loading ? (
                            <span className="animate-pulse">Connecting Neural Link...</span>
                        ) : (
                            <>
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                Continue with Google
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                            </>
                        )}
                    </button>
                    
                    <p className="text-xs text-gray-600 mt-6">
                        By initiating connection, you agree to the Neural Protocol Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
