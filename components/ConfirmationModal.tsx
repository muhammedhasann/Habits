
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0a0c] border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] relative overflow-hidden transform scale-100 transition-all">
        
        {/* Warning Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_10px_#ef4444]" />

        <div className="flex items-start gap-4">
            <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-900/20 transition-all"
                    >
                        Confirm Action
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
