
import React, { useState, useEffect } from 'react';
import { User, Clock, Target, Save, CheckCircle } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '../services/integrationService';
import { UserProfile } from '../types';

const ProfileSettings: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        chronotype: 'Lark',
        mainGoal: 'Productivity',
        onboarded: false
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setProfile(getUserProfile());
    }, []);

    const handleSave = () => {
        saveUserProfile({ ...profile, onboarded: true });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
             <div>
                <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">Neural Profile</h2>
                <p className="text-gray-400">Calibrate the AI to your biological rhythm.</p>
            </div>

            <div className="bg-glass-bg border border-glass-border rounded-2xl p-8 space-y-6">
                
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 font-medium">
                        <User className="w-4 h-4 text-neon-cyan" /> Operator Name
                    </label>
                    <input 
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan outline-none"
                        placeholder="Enter name..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 font-medium">
                        <Clock className="w-4 h-4 text-neon-cyan" /> Chronotype
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {['Lark', 'Third Bird', 'Owl'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setProfile({...profile, chronotype: type as any})}
                                className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                                    profile.chronotype === type 
                                    ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan' 
                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        * Lark (Early Riser), Owl (Night Owl), Third Bird (Intermediate).
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300 font-medium">
                        <Target className="w-4 h-4 text-neon-cyan" /> Prime Objective
                    </label>
                    <select 
                        value={profile.mainGoal}
                        onChange={(e) => setProfile({...profile, mainGoal: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan outline-none"
                    >
                        <option value="Productivity">Max Productivity</option>
                        <option value="Health">Biological Optimization</option>
                        <option value="Learning">Deep Learning & Skill Acquisition</option>
                        <option value="Mental Health">Mental Clarity & Peace</option>
                    </select>
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-gradient-to-r from-neon-cyan to-blue-600 rounded-xl text-black font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    {saved ? <CheckCircle className="w-6 h-6" /> : <Save className="w-6 h-6" />}
                    {saved ? "System Updated" : "Save Configuration"}
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
