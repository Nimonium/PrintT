// Print Context - Manage Print Jobs and Flow with Firebase (Base64 Mode)
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ref, set } from "firebase/database";
import { PrintJob, PrintContextType } from '../types';
import { mockRecentJobs, calculatePrintCost } from '../services/mockData';
import { database } from '../services/firebase';
import { useAuth } from './AuthContext';

const PrintContext = createContext<PrintContextType | undefined>(undefined);

/**
 * Helper: Convert URI/Blob to Base64
 */
const uriToBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Strip prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const PrintProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentJob, setCurrentJob] = useState<PrintJob | null>(null);
  const [recentJobs] = useState<PrintJob[]>(mockRecentJobs);
  const [loading, setLoading] = useState(false);

  const uploadDocument = async (file: any) => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const fileName = file.name || `doc_${timestamp}`;
      
      let base64Data = '';
      if (file.uri && !file.uri.startsWith('mock://')) {
        console.log("Converting upload to Base64...");
        base64Data = await uriToBase64(file.uri);
      } else {
        base64Data = 'mock_base64_data';
      }
      
      const newJob: any = { // Using any to allow 'fileData' field
        id: 'job_' + timestamp,
        userId: user?.id || 'guest',
        fileName: fileName,
        fileSize: file.size || 2.4,
        fileUrl: '', // No URL since we use Base64
        fileData: base64Data,
        fileType: file.type || 'pdf',
        colorMode: 'bw',
        paperSize: 'a4',
        copies: 1,
        highQuality: false,
        totalPages: file.pages || 12,
        totalCost: 0,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      newJob.totalCost = calculatePrintCost(
        newJob.totalPages,
        newJob.colorMode,
        newJob.copies,
        newJob.highQuality
      );
      
      setCurrentJob(newJob);
      console.log('Document prepared (Base64):', fileName);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePrintSettings = (settings: Partial<PrintJob>) => {
    if (!currentJob) return;
    const updatedJob = { ...currentJob, ...settings, updatedAt: new Date() };
    updatedJob.totalCost = calculatePrintCost(
      updatedJob.totalPages,
      updatedJob.colorMode,
      updatedJob.copies,
      updatedJob.highQuality
    );
    setCurrentJob(updatedJob);
  };

  const processPayment = async () => {
    if (!currentJob) throw new Error('No current job');
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentJob({ ...currentJob, status: 'paid', updatedAt: new Date() });
    } finally {
      setLoading(false);
    }
  };

  const submitJobToFirebase = async (): Promise<string> => {
    if (!currentJob) throw new Error('No current job');
    
    setLoading(true);
    try {
      const jobId = currentJob.id;
      
      // Save TO RTDB as 'pending'. Pilot will generate hardware/delivery OTPs.
      await set(ref(database, `print_jobs/${jobId}`), {
        status: "pending",
        userId: currentJob.userId,
        file_data: (currentJob as any).fileData,
        file_name: currentJob.fileName,
        user_phone: user?.phoneNumber || "none",
        printer_id: 'printer_001',
        created_at: Date.now(),
        settings: {
          colorMode: currentJob.colorMode,
          copies: currentJob.copies,
          pages: currentJob.totalPages
        }
      });
      
      setCurrentJob({ ...currentJob, status: 'pending' });
      return jobId;
    } finally {
      setLoading(false);
    }
  };


  const completePrint = async () => {
    if (!currentJob) throw new Error('No current job');
    setLoading(true);
    try {
      await set(ref(database, `print_jobs/${currentJob.id}/status`), 'completed');
      setCurrentJob({ ...currentJob, status: 'completed', completedAt: new Date(), updatedAt: new Date() });
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentJob = () => setCurrentJob(null);

  return (
    <PrintContext.Provider value={{ currentJob, recentJobs, loading, uploadDocument, updatePrintSettings,        processPayment,
        generateOTP: submitJobToFirebase,
        completePrint,
        clearCurrentJob,
 }}>
      {children}
    </PrintContext.Provider>
  );
};

export const usePrint = () => {
  const context = useContext(PrintContext);
  if (!context) throw new Error('usePrint must be used within PrintProvider');
  return context;
};
