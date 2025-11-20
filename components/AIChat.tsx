import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Search, Brain, Image as ImageIcon, Video, Zap, Volume2, 
  Loader2, ChevronDown, PlayCircle, Globe
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AIModelMode, ChatMessage } from '../types';
import { 
  generateTextResponse, 
  generateImage, 
  generateVideo, 
  generateSpeech, 
  transcribeAudio,
  decodeAudioData 
} from '../services/geminiService';

const AIChat: React.FC = () => {
  const [mode, setMode] = useState<AIModelMode>(AIModelMode.SMART_CHAT);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: "I am NeuroFlow Core. I can assist with tasks, analyze deep problems, generate visuals, or research the web for you. How shall we proceed?", 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9'); // Default for Video
  const [imgAspectRatio, setImgAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // --- Handlers ---

  const handleSend = async () => {
    if (!input.trim() && !isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', timestamp: Date.now() };

      if (mode === AIModelMode.ARTIST) {
        const imgUrl = await generateImage(userMsg.text || '', imgAspectRatio);
        aiMsg.imageUrl = imgUrl;
        aiMsg.text = "Visual generated successfully.";
      } 
      else if (mode === AIModelMode.DIRECTOR) {
        // Inform user
        const tempMsg = { ...aiMsg, text: "🎬 Generating video... this takes a moment. Please verify your key if prompted." };
        setMessages(prev => [...prev, tempMsg]);
        
        const videoUrl = await generateVideo(userMsg.text || '', aspectRatio);
        
        // Update the specific message
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, videoUrl, text: "Render complete." } : m));
        setIsLoading(false);
        return; // Exit early as we handled state update
      } 
      else if (mode === AIModelMode.SPEAKER) {
        const audioBase64 = await generateSpeech(userMsg.text || '');
        aiMsg.audioData = audioBase64;
        aiMsg.text = "Audio generated.";
        await playAudio(audioBase64);
      } 
      else {
        // Text / Think / Search
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text || '' }]
        }));
        
        const { text, groundingLinks } = await generateTextResponse(mode, userMsg.text || '', history);
        aiMsg.text = text;
        aiMsg.isThinking = (mode === AIModelMode.DEEP_THINK);
        aiMsg.groundingLinks = groundingLinks;
      }

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: `Error: ${error instanceof Error ? error.message : 'Something went wrong.'}`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop logic would go here in full implementation
      setIsRecording(false);
      return;
    }
    
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' }); // Usually webm in Chrome
        const reader = new FileReader();
        reader.onloadend = async () => {
           const base64 = (reader.result as string).split(',')[1];
           // Transcribe using Flash
           setIsLoading(true);
           try {
               const text = await transcribeAudio(base64, 'audio/webm');
               setInput(text || '');
           } catch(e) {
               console.error(e);
           } finally {
               setIsLoading(false);
           }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setTimeout(() => {
          mediaRecorder.stop();
          setIsRecording(false);
      }, 5000); // Record for 5 seconds max for this demo
    } catch (err) {
      console.error("Mic error", err);
      setIsRecording(false);
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioBuffer = await decodeAudioData(base64, audioCtxRef.current);
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);
    source.start();
  };

  // --- Render Helpers ---
  const getModeIcon = (m: AIModelMode) => {
    switch(m) {
        case AIModelMode.FAST_CHAT: return <Zap className="w-4 h-4 text-yellow-400" />;
        case AIModelMode.SMART_CHAT: return <Brain className="w-4 h-4 text-neon-cyan" />;
        case AIModelMode.DEEP_THINK: return <Brain className="w-4 h-4 text-neon-purple" />;
        case AIModelMode.RESEARCH: return <Globe className="w-4 h-4 text-blue-400" />;
        case AIModelMode.ARTIST: return <ImageIcon className="w-4 h-4 text-pink-400" />;
        case AIModelMode.DIRECTOR: return <Video className="w-4 h-4 text-red-400" />;
        case AIModelMode.SPEAKER: return <Volume2 className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-glass-bg border border-glass-border rounded-2xl overflow-hidden relative">
      {/* Header / Mode Selector */}
      <div className="p-4 border-b border-glass-border flex justify-between items-center bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
            <div className="bg-white/5 p-2 rounded-lg">
                {getModeIcon(mode)}
            </div>
            <div className="relative group">
                <button className="flex items-center gap-2 text-white font-medium hover:text-neon-cyan transition-colors">
                    {mode} <ChevronDown className="w-4 h-4" />
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-glass-border rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {Object.values(AIModelMode).map((m) => (
                        <button 
                            key={m} 
                            onClick={() => setMode(m)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                            {getModeIcon(m)} {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Extra Configs based on mode */}
        {mode === AIModelMode.ARTIST && (
            <div className="flex gap-2 text-xs">
                {['1:1', '16:9', '9:16'].map((r) => (
                    <button key={r} onClick={() => setImgAspectRatio(r as any)} className={`px-2 py-1 rounded ${imgAspectRatio === r ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400'}`}>{r}</button>
                ))}
            </div>
        )}
        {mode === AIModelMode.DIRECTOR && (
            <div className="flex gap-2 text-xs">
                <button onClick={() => setAspectRatio('16:9')} className={`px-2 py-1 rounded ${aspectRatio === '16:9' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400'}`}>16:9</button>
                <button onClick={() => setAspectRatio('9:16')} className={`px-2 py-1 rounded ${aspectRatio === '9:16' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400'}`}>9:16</button>
            </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                        ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-tr-sm' 
                        : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm'
                }`}>
                    {/* Visual Content */}
                    {msg.imageUrl && <img src={msg.imageUrl} alt="Generated" className="rounded-lg mb-3 max-w-full shadow-lg" />}
                    {msg.videoUrl && <video src={msg.videoUrl} controls className="rounded-lg mb-3 w-full shadow-lg" />}
                    {msg.audioData && (
                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg mb-2">
                            <PlayCircle className="w-8 h-8 text-green-400 cursor-pointer" onClick={() => msg.audioData && playAudio(msg.audioData)} />
                            <div className="h-1 bg-gray-700 w-32 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 w-1/2" />
                            </div>
                        </div>
                    )}

                    {/* Text Content */}
                    {msg.isThinking && (
                        <div className="text-xs text-neon-purple mb-2 font-mono flex items-center gap-2 opacity-80">
                            <Brain className="w-3 h-3 animate-pulse" /> Thinking process applied (32k budget)
                        </div>
                    )}
                    
                    <div className="prose prose-invert prose-sm">
                        <ReactMarkdown>{msg.text || ''}</ReactMarkdown>
                    </div>

                    {/* Grounding Links */}
                    {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-gray-500 mb-1">Sources:</p>
                            <div className="flex flex-wrap gap-2">
                                {msg.groundingLinks.map((link, i) => (
                                    <a key={i} href={link.uri} target="_blank" rel="noreferrer" className="text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10 text-blue-300 truncate max-w-[200px]">
                                        {link.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                    <span className="text-sm text-gray-400 animate-pulse">Processing Neural Request...</span>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-glass-border bg-black/40 backdrop-blur-xl">
        <div className="flex gap-3 items-end">
            <button 
                onClick={handleMicClick}
                className={`p-3 rounded-xl border transition-colors ${
                    isRecording 
                    ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
            >
                <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder={`Ask ${mode}... (Shift+Enter for new line)`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-neon-cyan/50 placeholder-gray-600 resize-none h-12 max-h-32"
                    style={{ minHeight: '48px' }}
                />
            </div>
            <button 
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && mode !== AIModelMode.ARTIST && mode !== AIModelMode.DIRECTOR)}
                className="p-3 rounded-xl bg-neon-cyan text-black font-bold hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
        <div className="mt-2 flex justify-between px-1">
             <p className="text-[10px] text-gray-600 font-mono">Powered by Gemini 3 Pro & 2.5 Flash</p>
             {mode === AIModelMode.DIRECTOR && <p className="text-[10px] text-red-400 font-mono">Veo Key Required</p>}
        </div>
      </div>
    </div>
  );
};

export default AIChat;