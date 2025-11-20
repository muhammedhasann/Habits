
import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
    isOpen: boolean;
    videoId: string | null;
    title: string;
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoId, title, onClose }) => {
    if (!isOpen || !videoId) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0a0c] border border-glass-border w-full max-w-4xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col relative">
                
                {/* Header */}
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Player */}
                <div className="relative pt-[56.25%] bg-black">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/40 text-xs text-gray-500 text-center">
                    Protocol Instruction from Neural Database
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
