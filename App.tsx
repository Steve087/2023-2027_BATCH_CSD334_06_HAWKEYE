import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { VideoDashboard } from './components/VideoDashboard';

type AppState = 'IDLE' | 'VIDEO_VIEW';

function App() {
  const [viewState, setViewState] = useState<AppState>('IDLE');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    try {
      // Strict validation for Video files
      const isVideo = file.type.startsWith('video/') || 
                      file.name.toLowerCase().endsWith('.mp4') || 
                      file.name.toLowerCase().endsWith('.mov') || 
                      file.name.toLowerCase().endsWith('.avi');

      if (isVideo) {
        setVideoFile(file);
        setViewState('VIDEO_VIEW');
      } else {
        alert("Invalid file type. Please upload a video file (MP4, MOV, or AVI).");
        handleReset();
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process file.");
      handleReset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setViewState('IDLE');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-medium">Processing video upload...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      {viewState === 'IDLE' && (
        <Hero onFileUpload={handleFileUpload} />
      )}
      
      {viewState === 'VIDEO_VIEW' && videoFile && (
        <VideoDashboard 
          videoFile={videoFile} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
}

export default App;