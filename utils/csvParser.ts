import Papa from 'papaparse';
import { DataPoint } from '../types';

export const parseCSV = (file: File): Promise<DataPoint[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV Parsing warning:", results.errors);
        }
        resolve(results.data as DataPoint[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
