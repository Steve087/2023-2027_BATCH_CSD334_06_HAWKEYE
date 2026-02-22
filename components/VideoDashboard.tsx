import React, { useState, useRef, useEffect } from 'react';
import { VideoAnomaly, AnalysisStatus } from '../types';
import { analyzeVideoForAnomalies } from '../services/geminiService';
import { Loader2, AlertTriangle, CheckCircle2, Play, RefreshCw, AlertOctagon } from 'lucide-react';

interface VideoDashboardProps {
  videoFile: File;
  onReset: () => void;
}

export const VideoDashboard: React.FC<VideoDashboardProps> = ({ videoFile, onReset }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [anomalies, setAnomalies] = useState<VideoAnomaly[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  
  // FIXED: Use state for the URL so it updates if the file changes
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Create Object URL safely when file changes
  useEffect(() => {
    if (!videoFile) return;
    
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    // Cleanup function to avoid memory leaks
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  // 2. Auto-analyze when component mounts
  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg('');
    try {
      const result = await analyzeVideoForAnomalies(videoFile);
      setAnomalies(result.anomalies);
      setSummary(result.summary);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Video analysis failed.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeAnomaly = anomalies.find(
    (a) => currentTime >= a.startTime && currentTime <= a.endTime
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              HAWKEYE
            </div>
            <span className="text-slate-600 text-sm">|</span>
            <span className="text-slate-400 text-sm font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Video Analysis
            </span>
          </div>
          <button 
            onClick={onReset}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Upload New File
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Status Messages */}
        {status === AnalysisStatus.ANALYZING && (
          <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-800 rounded-lg flex items-center gap-3 text-cyan-400 animate-pulse">
            <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            <p>Analyzing video frames with Gemini 3.0 Flash. This may take a moment...</p>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`relative rounded-xl overflow-hidden bg-black border-2 transition-colors duration-300 ${activeAnomaly ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'border-slate-800'}`}>
              
              {/* Red Overlay Alert */}
              {activeAnomaly && (
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-center pointer-events-none">
                   <div className="bg-red-600/90 text-white px-6 py-2 rounded-full font-bold tracking-wider flex items-center gap-2 shadow-lg animate-bounce">
                     <AlertOctagon className="w-5 h-5" />
                     ANOMALY DETECTED
                   </div>
                </div>
              )}

              {activeAnomaly && (
                <div className="absolute inset-0 border-[6px] border-red-500/50 pointer-events-none z-10 animate-pulse"></div>
              )}
              
              {/* FIXED: Added Checks for videoUrl */}
              {videoUrl && (
                <video 
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full aspect-video object-contain"
                  controls
                  autoPlay 
                  muted // Browsers often block autoplay unless muted
                  onTimeUpdate={handleTimeUpdate}
                />
              )}
            </div>

            {/* Current Status Footer */}
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
               <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${activeAnomaly ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`}></div>
                 <span className={`font-mono ${activeAnomaly ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                   {formatTime(currentTime)}
                 </span>
               </div>
               {activeAnomaly ? (
                 <p className="text-red-400 font-semibold">{activeAnomaly.description}</p>
               ) : (
                 <p className="text-slate-500 text-sm">System Normal</p>
               )}
            </div>

            {/* Summary */}
            {status === AnalysisStatus.COMPLETED && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Video Analysis Summary
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {summary}
                </p>
              </div>
            )}
          </div>

          {/* Anomalies List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900">
              <h3 className="text-white font-medium flex items-center justify-between">
                <span>Timeline Events</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full border border-slate-700">
                  {anomalies.length} Detected
                </span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {anomalies.length === 0 && status === AnalysisStatus.COMPLETED && (
                <div className="text-center py-10 text-green-500 text-sm">
                  No anomalies found in video.
                </div>
              )}

              {anomalies.map((anomaly, idx) => {
                const isActive = currentTime >= anomaly.startTime && currentTime <= anomaly.endTime;
                return (
                  <button 
                    key={idx} 
                    onClick={() => seekTo(anomaly.startTime)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-red-950/30 border-red-500/50 shadow-lg' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg"></div>
                    )}
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-xs font-mono flex items-center gap-1 ${isActive ? 'text-red-400' : 'text-slate-500'}`}>
                        <Play className="w-3 h-3" />
                        {formatTime(anomaly.startTime)} - {formatTime(anomaly.endTime)}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        anomaly.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                        anomaly.severity === 'medium' ? 'bg-orange-900/30 text-orange-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className={`text-sm leading-snug ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {anomaly.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};