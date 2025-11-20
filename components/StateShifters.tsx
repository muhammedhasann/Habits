
import React, { useState } from 'react';
import { STATE_SHIFTERS } from '../constants';
import { Zap, Wind, Flame, Eye, Battery, Brain, Ban, Move, Layers, PlayCircle } from 'lucide-react';
import VideoModal from './VideoModal';

const getIcon = (title: string) => {
  if (title.includes('Cold')) return <Zap className="text-cyan-400" />;
  if (title.includes('Heat')) return <Flame className="text-orange-400" />;
  if (title.includes('Oxygen') || title.includes('Breath')) return <Wind className="text-blue-400" />;
  if (title.includes('Visual') || title.includes('Optic')) return <Eye className="text-green-400" />;
  if (title.includes('Nap') || title.includes('NSDR')) return <Battery className="text-purple-400" />;
  if (title.includes('Digital') || title.includes('Rule')) return <Ban className="text-red-400" />;
  if (title.includes('Motion') || title.includes('Squats')) return <Move className="text-yellow-400" />;
  return <Brain className="text-white" />;
};

const StateShifters: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean, videoId: string | null, title: string }>({
      isOpen: false, videoId: null, title: ''
  });

  const openVideo = (e: React.MouseEvent, id: string | undefined, title: string) => {
      e.stopPropagation();
      if(id) setVideoModal({ isOpen: true, videoId: id, title });
  };

  return (
    <div className="space-y-8">
      <VideoModal 
         isOpen={videoModal.isOpen}
         videoId={videoModal.videoId}
         title={videoModal.title}
         onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
      />

      <div>
        <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">State Shifters</h2>
        <p className="text-gray-400">On-demand protocols to modulate biology and psychology.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATE_SHIFTERS.map((shifter) => (
          <div
            key={shifter.id}
            onClick={() => setActive(shifter.id === active ? null : shifter.id)}
            className={`
              relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group
              ${active === shifter.id 
                ? 'bg-white/10 border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.15)]' 
                : 'bg-glass-bg border-glass-border hover:border-white/30'
              }
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${active === shifter.id ? 'scale-110' : ''} transition-transform duration-300`}>
                {getIcon(shifter.title)}
              </div>
              {active === shifter.id && (
                <div className="text-xs font-mono text-neon-cyan animate-pulse">ACTIVE</div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{shifter.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{shifter.description}</p>
            
            <div className="flex justify-between items-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Layers className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-mono text-gray-300">{shifter.benefit}</span>
                </div>

                {shifter.videoId && (
                    <button 
                        onClick={(e) => openVideo(e, shifter.videoId, shifter.title)}
                        className="p-2 bg-white/10 rounded-full hover:bg-neon-cyan hover:text-black transition-colors text-gray-400"
                        title="Watch Guide"
                    >
                        <PlayCircle className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 ${active === shifter.id ? 'opacity-100' : 'group-hover:opacity-20'} transition-opacity pointer-events-none`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StateShifters;
