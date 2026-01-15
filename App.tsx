
import React, { useState, useEffect } from 'react';
import { GenerationStatus, GeneratedImage } from './types';
import { QUBITS_BRAND_NAME } from './constants';
import { generateQubitsImage } from './services/geminiService';

const INSPIRATIONS = [
  { label: "🚀 Mars Base", prompt: "A massive Qubits colony on Mars with red dust storms and glass domes" },
  { label: "🌊 Deep Sea", prompt: "An underwater Qubits research station surrounded by glowing jellyfish" },
  { label: "🌲 Magic Forest", prompt: "A giant Qubits treehouse in a misty ancient forest with fireflies" },
  { label: "🧊 Crystal Cave", prompt: "Qubits structures inside a giant amethyst geode cave" }
];

const LOADING_MESSAGES = [
  "Analyzing your build...",
  "Planning the world architecture...",
  "Rendering cinematic lighting...",
  "Perfecting the geometry...",
  "Finalizing the masterpiece..."
];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [qubitsPhoto, setQubitsPhoto] = useState<string | null>(null);
  const [includeHumans, setIncludeHumans] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  useEffect(() => {
    let interval: number;
    if (status === GenerationStatus.GENERATING) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQubitsPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) {
      setErrorMessage('Please describe the world or pick an inspiration!');
      return;
    }

    setStatus(GenerationStatus.GENERATING);
    setErrorMessage('');

    try {
      const imageUrl = await generateQubitsImage(activePrompt, qubitsPhoto || undefined, includeHumans);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: activePrompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newImage, ...prev]);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error) {
      setStatus(GenerationStatus.ERROR);
      setErrorMessage('The AI is a bit busy. Please wait a few seconds and try again!');
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `qubits-world-${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const iframeCode = `<iframe src="${window.location.href}" width="100%" height="900px" style="border:none; border-radius: 24px;"></iframe>`;

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-slate-900 selection:bg-blue-100 antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 ring-2 ring-blue-50">Q</div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-slate-800 uppercase italic leading-none">Qubits AI</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Official Creator</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${includeHumans ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            <i className={`fas ${includeHumans ? 'fa-user' : 'fa-shield-halved'}`}></i>
            {includeHumans ? 'Human Mode' : 'Privacy Mode'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px]">1</span>
              Source Photo
            </h2>
            <div className="relative group">
              {qubitsPhoto ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 group">
                  <img src={qubitsPhoto} className="w-full h-full object-cover" alt="Source" />
                  <button onClick={() => setQubitsPhoto(null)} className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-md font-bold text-xs uppercase tracking-widest">
                    Replace Photo
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-slate-100 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-blue-50 transition-all hover:border-blue-200 group">
                  <i className="fas fa-cloud-arrow-up text-slate-300 text-3xl mb-4 group-hover:scale-110 transition-transform"></i>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Your Qubits Build</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              )}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-700 uppercase block mb-0.5">Include People</span>
                <p className="text-[9px] text-slate-400 font-medium">Add yourself to the scene?</p>
              </div>
              <button onClick={() => setIncludeHumans(!includeHumans)} className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${includeHumans ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${includeHumans ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px]">2</span>
              Environment
            </h2>
            <textarea className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-28 text-sm text-slate-800 placeholder:text-slate-300" placeholder="Where should we build today?" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <div className="mt-6 flex flex-wrap gap-2">
              {INSPIRATIONS.map((item) => (
                <button key={item.label} onClick={() => { setPrompt(item.prompt); handleGenerate(item.prompt); }} className="text-[10px] font-black bg-slate-100 hover:bg-slate-900 hover:text-white px-4 py-2.5 rounded-xl transition-all active:scale-95">{item.label}</button>
              ))}
            </div>
            <button onClick={() => handleGenerate()} disabled={status === GenerationStatus.GENERATING} className={`w-full mt-8 py-5 rounded-2xl font-black text-white uppercase tracking-[0.25em] shadow-2xl transition-all transform active:scale-95 ${status === GenerationStatus.GENERATING ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
              {status === GenerationStatus.GENERATING ? 'Building Render...' : 'Generate Scene'}
            </button>
          </section>
        </div>

        {/* Results */}
        <div className="lg:col-span-7">
          {!history[0] && status !== GenerationStatus.GENERATING ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[48px] border border-slate-100 p-12 text-center shadow-inner relative overflow-hidden group">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 rotate-3 relative z-10 shadow-sm">
                 <i className="fas fa-wand-magic-sparkles text-blue-400 text-4xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4 italic">Your Vision Awaits</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Upload a photo and describe a world. AI handles the rest.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {history[0] && (
                <div className="bg-white p-6 rounded-[56px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-50">
                  <div className="relative aspect-square rounded-[44px] overflow-hidden bg-slate-50 ring-1 ring-slate-100 shadow-inner">
                    <img src={history[0].url} className="w-full h-full object-cover" alt="Result" />
                    {status === GenerationStatus.GENERATING && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center">
                        <div className="relative w-20 h-20 mb-8">
                           <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                           <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="font-black text-slate-900 text-sm uppercase tracking-[0.3em] mb-3">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-8 px-6 pb-6 text-center sm:text-left">
                    <div className="flex-1 truncate">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.4em] block mb-3">Professional Render</span>
                      <p className="text-slate-900 font-bold text-base italic leading-tight">"{history[0].prompt}"</p>
                    </div>
                    <button onClick={() => downloadImage(history[0].url, history[0].id)} className="bg-slate-900 text-white px-10 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-xl w-full sm:w-auto">Save to Device</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Admin Tools Drawer for easy Shopify setup */}
      <footer className="mt-auto py-12 px-8 bg-white border-t border-slate-100 flex flex-col items-center gap-6">
        <button 
          onClick={() => setShowEmbedCode(!showEmbedCode)}
          className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-code"></i> Shopify Integration Helper
        </button>
        
        {showEmbedCode && (
          <div className="max-w-xl w-full bg-slate-900 p-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-4">Paste this into your Shopify HTML:</h4>
            <code className="block bg-slate-800 p-4 rounded-xl text-blue-400 text-[11px] break-all border border-slate-700">
              {iframeCode}
            </code>
            <p className="text-slate-500 text-[9px] mt-4 uppercase font-bold tracking-widest leading-relaxed">
              Note: Deployment must be live for this to work. Open your Vercel URL first.
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-10 opacity-50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gemini 2.5 Engine</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official {QUBITS_BRAND_NAME}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
