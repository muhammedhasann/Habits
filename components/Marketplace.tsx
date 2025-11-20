
import React, { useState, useEffect } from 'react';
import { Layers, Lock, Unlock, Check, Layout, Palette } from 'lucide-react';
import { MARKETPLACE_ITEMS } from '../constants';
import { getGamificationState } from '../services/integrationService';
import { GamificationState } from '../types';

const Marketplace: React.FC = () => {
    const [gamification, setGamification] = useState<GamificationState>({ xp: 0, level: 1, streak: 0, badges: [], unlockedItems: [] });

    useEffect(() => {
        setGamification(getGamificationState());
    }, []);

    const equipItem = (item: typeof MARKETPLACE_ITEMS[0]) => {
        if (gamification.unlockedItems.includes(item.id)) return;

        // Everything is free now, just toggle unlock state
        const newState = {
            ...gamification,
            unlockedItems: [...gamification.unlockedItems, item.id]
        };
        setGamification(newState);
        localStorage.setItem('neuroflow-gamification', JSON.stringify(newState));
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">Customization Hub</h2>
                    <p className="text-gray-400">Personalize your interface. All modules unlocked.</p>
                </div>
                <div className="text-right bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Operator Level</p>
                    <p className="text-2xl font-bold text-neon-cyan font-mono">LVL {gamification.level}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MARKETPLACE_ITEMS.map((item) => {
                    const isEquipped = gamification.unlockedItems.includes(item.id);

                    return (
                        <div key={item.id} className={`
                            relative p-1 rounded-2xl transition-all duration-300 group
                            ${isEquipped ? 'bg-neon-cyan/20' : 'bg-white/5'}
                        `}>
                            <div className="bg-[#050507] rounded-xl p-6 h-full flex flex-col border border-white/5 group-hover:border-neon-cyan/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${isEquipped ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-gray-400'}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                        isEquipped ? 'text-neon-cyan bg-neon-cyan/10' : 'text-gray-500 bg-white/5'
                                    }`}>
                                        {item.type}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-1">{item.description}</p>

                                <button
                                    onClick={() => equipItem(item)}
                                    disabled={isEquipped}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                        isEquipped
                                        ? 'bg-green-500/10 text-green-500 cursor-default'
                                        : 'bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                                    }`}
                                >
                                    {isEquipped ? (
                                        <> <Check className="w-4 h-4" /> Active </>
                                    ) : (
                                        <>
                                            <Unlock className="w-3 h-3" /> Activate Module
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Marketplace;
