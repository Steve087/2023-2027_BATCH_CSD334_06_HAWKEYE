import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VideoAnalysisResult, DataPoint, AnalysisResult } from '../types';

// We use the Gemini 3 Flash model for speed and multimodal capabilities.
const MODEL_NAME = "gemini-3-flash-preview";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeVideoForAnomalies = async (file: File): Promise<VideoAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToBase64(file);

  const prompt = `
    You are an AI video security analyst. 
    Analyze the provided video for any anomalies, unusual events, or safety concerns.
    
    Return a JSON object containing:
    1. A list of anomalies with start_time (seconds), end_time (seconds), description, and severity.
    2. A brief summary of the video content and findings.
    
    If no anomalies are found, return an empty list.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      anomalies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            startTime: { type: Type.NUMBER, description: "Start time of anomaly in seconds" },
            endTime: { type: Type.NUMBER, description: "End time of anomaly in seconds" },
            description: { type: Type.STRING, description: "Description of the event" },
            severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
          },
          required: ["startTime", "endTime", "description", "severity"]
        }
      },
      summary: { type: Type.STRING }
    },
    required: ["anomalies", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as VideoAnalysisResult;
  } catch (error) {
    console.error("Gemini Video Analysis Failed:", error);
    throw error;
  }
};

export const analyzeDataForAnomalies = async (data: DataPoint[], numericColumns: string[]): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Serialize data for the prompt
  const dataString = JSON.stringify(data);

  const prompt = `
    You are an AI data analyst.
    Analyze the provided JSON data for anomalies based on the following numeric columns: ${numericColumns.join(', ')}.
    
    The data represents a time-series or sequential records.
    Look for outliers, sudden spikes/drops, or inconsistent patterns.
    
    Return a JSON object containing:
    1. A list of anomalies with the index of the row (0-based), reason, severity (low, medium, high), and confidence (0-1).
    2. A brief summary of the data trends and findings.
    
    Data:
    ${dataString}
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      anomalies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            index: { type: Type.INTEGER, description: "Index of the row in the provided data" },
            reason: { type: Type.STRING, description: "Explanation of why this is an anomaly" },
            severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" }
          },
          required: ["index", "reason", "severity", "confidence"]
        }
      },
      summary: { type: Type.STRING }
    },
    required: ["anomalies", "summary"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Data Analysis Failed:", error);
    throw error;
  }
};