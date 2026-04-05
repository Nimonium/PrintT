import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from './firebase';

// Extend window type for recaptchaVerifier and confirmationResult
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

/**
 * STEP 1: Setup reCAPTCHA
 */
export function setupRecaptcha(containerId: string = 'recaptcha-container') {
  if (typeof window === 'undefined') return;
  if (window.recaptchaVerifier) return;

  const el = document.getElementById(containerId);
  if (!el) {
    console.warn(`reCAPTCHA container with ID "${containerId}" not found in DOM yet.`);
    return;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: 'invisible',
      callback: () => console.log('reCAPTCHA solved'),
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined as any;
        }
      }
    }
  );
}

/**
 * STEP 2: Send SMS OTP
 */
export async function sendSmsOtp(phoneNumber: string) {
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : "+91" + cleanNumber;

  try {
    if (typeof window === 'undefined') return false;
    setupRecaptcha('recaptcha-container');
    
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = confirmationResult;
    return true;
  } catch (error: any) {
    console.error("Firebase sendSmsOtp Error:", error.message);
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (e) {}
      window.recaptchaVerifier = undefined as any;
    }
    throw error;
  }
}

/**
 * STEP 3: Verify OTP
 */
export async function verifySmsOtp(otpEntered: string) {
  try {
    if (typeof window === 'undefined' || !window.confirmationResult) {
      throw new Error("No pending confirmation found.");
    }
    const result = await window.confirmationResult.confirm(otpEntered);
    return result.user;
  } catch (error: any) {
    console.error("OTP Verification Error:", error.message);
    throw error;
  }
}

/**
 * Helper: Convert file to Base64 (stripping metadata prefix)
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip metadata prefix (e.g., data:application/pdf;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * STEP 4: Submit print job (Direct to Realtime Database as Base64)
 */
export async function submitPrintJob(file: File, userPhone: string) {
  try {
    console.log("Converting file to Base64...");
    const base64String = await fileToBase64(file);
    
    const timestamp = Date.now();
    const jobId = `job_${timestamp}`;

    // Save directly to Realtime Database as 'pending'
    await set(ref(database, `print_jobs/${jobId}`), {
      status: "pending",
      file_data: base64String,
      file_name: file.name,
      user_phone: userPhone,
      created_at: timestamp
    });

    console.log("Job saved directly to Database (Base64). Pending Pilot assignment.");
    return { jobId };


  } catch (error) {
    console.error("Job submission failed:", error);
    throw error;
  }
}
