// Print-Xpress Type Definitions

export interface User {
  id: string;
  phoneNumber: string;
  displayName?: string;
  createdAt: Date;
}

export interface PrintJob {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  fileType: string;
  
  // Print Settings
  colorMode: 'bw' | 'color';
  paperSize: string;
  copies: number;
  pageRange?: string;
  highQuality: boolean;
  
  // Calculated
  totalPages: number;
  totalCost: number;
  
  // Status
  status: 'pending' | 'paid' | 'printing' | 'completed' | 'failed';
  otp?: string;
  otpExpiresAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // ATM Info
  atmId?: string;
  atmName?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface PrintContextType {
  currentJob: PrintJob | null;
  recentJobs: PrintJob[];
  loading: boolean;
  
  // Actions
  uploadDocument: (file: any) => Promise<void>;
  updatePrintSettings: (settings: Partial<PrintJob>) => void;
  processPayment: () => Promise<void>;
  generateOTP: () => Promise<string>;
  completePrint: () => Promise<void>;
  
  // Reset
  clearCurrentJob: () => void;
}

export interface ATMLocation {
  id: string;
  name: string;
  distance: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

export interface PrintSettings {
  colorMode: 'bw' | 'color';
  paperSize: string;
  copies: number;
  pageRange?: string;
  highQuality: boolean;
}
