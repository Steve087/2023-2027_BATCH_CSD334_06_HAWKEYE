export interface DataPoint {
  [key: string]: string | number;
}

export interface Anomaly {
  index: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface VideoAnomaly {
  startTime: number; // in seconds
  endTime: number; // in seconds
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface AnalysisResult {
  anomalies: Anomaly[];
  summary: string;
}

export interface VideoAnalysisResult {
  anomalies: VideoAnomaly[];
  summary: string;
}
