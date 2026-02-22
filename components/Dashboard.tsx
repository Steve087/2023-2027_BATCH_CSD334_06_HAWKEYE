import React, { useState, useEffect } from 'react';
import { DataPoint, Anomaly, AnalysisStatus } from '../types';
import { AnalysisChart } from './Charts';
import { analyzeDataForAnomalies } from '../services/geminiService';
import { AlertCircle, CheckCircle2, Loader2, Play, RefreshCw, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  data: DataPoint[];
  fileName: string;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, fileName, onReset }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [numericColumns, setNumericColumns] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (data.length > 0) {
      // Identify numeric columns for visualization
      const keys = Object.keys(data[0]);
      const numCols = keys.filter(key => typeof data[0][key] === 'number');
      setNumericColumns(numCols);
      if (numCols.length > 0) setSelectedColumn(numCols[0]);
    }
  }, [data]);

  const handleAnalyze = async () => {
    if (numericColumns.length === 0) {
      setErrorMsg("No numeric columns found to analyze.");
      return;
    }

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg('');
    
    try {
      // Send data to Gemini
      const result = await analyzeDataForAnomalies(data, numericColumns);
      setAnomalies(result.anomalies);
      setSummary(result.summary);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Analysis failed. Please check your API key.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

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
            <span className="text-slate-400 text-sm font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {fileName} ({data.length} rows)
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
        
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
            >
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <span className="text-slate-500 text-sm">Select column to visualize</span>
          </div>

          {status !== AnalysisStatus.COMPLETED && status !== AnalysisStatus.ANALYZING && (
            <button
              onClick={handleAnalyze}
              className="group relative flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Run Analysis
            </button>
          )}

           {status === AnalysisStatus.ANALYZING && (
            <button disabled className="flex items-center gap-2 bg-slate-800 text-slate-400 font-semibold py-2 px-6 rounded-lg cursor-not-allowed">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with Gemini...
            </button>
          )}
        </div>

        {/* Error Message */}
        {status === AnalysisStatus.ERROR && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnalysisChart 
              data={data} 
              anomalies={anomalies} 
              selectedColumn={selectedColumn} 
            />

            {/* Analysis Summary */}
            {status === AnalysisStatus.COMPLETED && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  AI Summary
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {summary}
                </p>
              </div>
            )}
          </div>

          {/* Anomaly List Sidepanel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900">
              <h3 className="text-white font-medium flex items-center justify-between">
                <span>Detected Anomalies</span>
                {status === AnalysisStatus.COMPLETED && (
                  <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full border border-red-900/50">
                    {anomalies.length} Found
                  </span>
                )}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {status === AnalysisStatus.IDLE && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Click "Run Analysis" to detect anomalies.
                </div>
              )}

              {status === AnalysisStatus.ANALYZING && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                  </div>
                  <p className="text-xs animate-pulse">Processing data...</p>
                </div>
              )}

              {status === AnalysisStatus.COMPLETED && anomalies.length === 0 && (
                <div className="text-center py-10 text-green-500 text-sm">
                  No significant anomalies detected.
                </div>
              )}

              {anomalies.map((anomaly, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg hover:border-slate-700 transition-colors group">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-slate-500 text-xs font-mono">Row #{anomaly.index}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      anomaly.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                      anomaly.severity === 'medium' ? 'bg-orange-900/30 text-orange-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-snug">{anomaly.reason}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-600 rounded-full" 
                        style={{ width: `${anomaly.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {Math.round(anomaly.confidence * 100)}% Conf.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};