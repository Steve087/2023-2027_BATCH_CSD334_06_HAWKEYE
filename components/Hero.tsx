import React, { useRef } from 'react';
import { UploadCloud, Zap, ShieldCheck, Video, Eye } from 'lucide-react';

interface HeroProps {
  onFileUpload: (file: File) => void;
}

export const Hero: React.FC<HeroProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            HAWKEYE
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Next-generation video anomaly detection powered by 
            <span className="font-semibold text-cyan-400"> Gemini 3.0 Flash</span>. 
            Upload surveillance footage (MP4, MOV) for instant security analysis.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".mp4, .mov, .avi" 
              className="hidden" 
            />
            <button
              onClick={triggerUpload}
              className="rounded-md bg-cyan-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-6 h-6" />
              Upload Video Footage
            </button>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-800 pt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-slate-800 rounded-lg mb-4">
              <Eye className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Visual Intelligence</h3>
            <p className="mt-2 text-slate-400 text-sm">Understand context and safety hazards in video streams.</p>
          </div>
          <div className="flex flex-col items-center text-center">
             <div className="p-3 bg-slate-800 rounded-lg mb-4">
              <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Security Audits</h3>
            <p className="mt-2 text-slate-400 text-sm">Automated detection of suspicious activities.</p>
          </div>
           <div className="flex flex-col items-center text-center">
             <div className="p-3 bg-slate-800 rounded-lg mb-4">
              <Video className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Real-time Alerts</h3>
            <p className="mt-2 text-slate-400 text-sm">Visual overlay alerts synced to video playback timestamps.</p>
          </div>
        </div>
      </div>
    </div>
  );
};