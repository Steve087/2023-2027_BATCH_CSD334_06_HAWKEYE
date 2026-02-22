import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Scatter
} from 'recharts';
import { DataPoint, Anomaly } from '../types';

interface ChartsProps {
  data: DataPoint[];
  anomalies: Anomaly[];
  selectedColumn: string;
}

export const AnalysisChart: React.FC<ChartsProps> = ({ data, anomalies, selectedColumn }) => {
  // Merge anomalies into data for visualization
  const chartData = data.map((point, index) => {
    const anomaly = anomalies.find((a) => a.index === index);
    return {
      ...point,
      index,
      isAnomaly: !!anomaly,
      anomalySeverity: anomaly?.severity,
      anomalyReason: anomaly?.reason,
    };
  });

  // Custom tooltip to show anomaly details
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded shadow-lg text-sm">
          <p className="font-bold text-white mb-1">{`Row: ${label}`}</p>
          <p className="text-cyan-300 mb-1">{`${selectedColumn}: ${payload[0].value}`}</p>
          {dataPoint.isAnomaly && (
            <div className="mt-2 border-t border-slate-600 pt-2">
              <p className="text-red-400 font-bold flex items-center gap-1">
                ⚠ Anomaly Detected
              </p>
              <p className="text-slate-300 italic max-w-xs">{dataPoint.anomalyReason}</p>
              <p className="text-slate-400 text-xs mt-1">Severity: {dataPoint.anomalySeverity}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-slate-400 text-sm font-medium mb-4 flex justify-between">
        <span>Trend Analysis: {selectedColumn}</span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-500">
          Red dots indicate anomalies
        </span>
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="index" 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={selectedColumn} 
            stroke="#06b6d4" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 6, fill: "#22d3ee" }}
          />
          <Scatter 
            data={chartData.filter(d => d.isAnomaly)} 
            fill="#ef4444" 
            dataKey={selectedColumn}
            shape="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
