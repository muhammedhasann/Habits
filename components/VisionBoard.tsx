import React, { useState } from 'react';
import { Video, Image as ImageIcon, Loader2, Play, Eye } from 'lucide-react';
import { generateImage, generateVideo } from '../services/geminiService';
import { VisionItem } from '../types';

const VisionBoard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<VisionItem[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [aspect, setAspect] = useState<'16:9' | '9:16'>('16:9');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    const newItem: VisionItem = {
        id: Date.now().toString(),
        type: mediaType,
        prompt,
        url: '',
        timestamp: Date.now()
    };

    try {
        if (mediaType === 'image') {
            newItem.url = await generateImage(prompt, '16:9');
        } else {
            newItem.url = await generateVideo(prompt, aspect);
        }
        setItems(prev => [newItem, ...prev]);
    } catch (e) {
        alert("Generation failed. If using Video, ensure API key is selected.");
    } finally {
        setIsLoading(false);
        setPrompt('');
    }
  };

  return (
    <div className="space-y-8">
       <div>
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">Visualization Station</h2>
            <p className="text-gray-400">Manifest your goals. Generate visual anchors using Veo & Imagen.</p>
        </div>

        {/* Generator */}
        <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your goal (e.g., 'Standing on top of a mountain holding a trophy, cinematic lighting')"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                     <div className="flex bg-white/5 rounded-lg p-1">
                        <button 
                            onClick={() => setMediaType('image')}
                            className={`p-2 rounded-md transition-all ${mediaType === 'image' ? 'bg-neon-cyan text-black' : 'text-gray-400'}`}
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setMediaType('video')}
                            className={`p-2 rounded-md transition-all ${mediaType === 'video' ? 'bg-neon-cyan text-black' : 'text-gray-400'}`}
                        >
                            <Video className="w-5 h-5" />
                        </button>
                     </div>
                     {mediaType === 'video' && (
                        <select 
                            value={aspect} 
                            onChange={(e) => setAspect(e.target.value as any)}
                            className="bg-white/5 text-gray-300 border-white/10 rounded-lg px-2 py-2 outline-none"
                        >
                            <option value="16:9">Landscape</option>
                            <option value="9:16">Portrait</option>
                        </select>
                     )}
                     <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Manifest"}
                    </button>
                </div>
            </div>
            {mediaType === 'video' && <p className="text-xs text-gray-500 mt-2">Note: Video generation takes ~1 minute. Please wait.</p>}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-glass-border">
                    {item.type === 'image' ? (
                        <img src={item.url} alt={item.prompt} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="relative w-full h-64 bg-black">
                            <video 
                                src={item.url} 
                                controls 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium truncate">{item.prompt}</p>
                        <p className="text-neon-cyan text-xs uppercase mt-1">{item.type}</p>
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-600 border border-dashed border-gray-800 rounded-2xl">
                    <Eye className="w-12 h-12 mb-4 opacity-20" />
                    <p>No visions generated yet.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default VisionBoard;