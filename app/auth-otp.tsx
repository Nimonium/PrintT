import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { setupRecaptcha } from '../services/phoneAuth';

export default function AuthOTPScreen() {
  const router = useRouter();
  const { signIn, verifyOTP, loading } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  // Initialize reCAPTCHA on mount for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      setupRecaptcha('recaptcha-container');
    }
  }, []);


  
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setError('');
      await signIn(phoneNumber);
      setStep('otp');
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
    }
  };


  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent pasting multiple digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-verify when all digits entered (6 digits for Firebase)
    if (newOtp.every(digit => digit) && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    try {
      setError('');
      await verifyOTP(otpCode);
      router.replace('/role-selection');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="print" size={48} color={theme.primary} />
        </View>
        <Text style={styles.appName}>PrintT</Text>
        <Text style={styles.subtitle}>Smart printing at your fingertips</Text>
      </View>

      <View style={styles.content}>
        {step === 'phone' ? (
          // Phone Number Entry
          <View style={styles.formContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                placeholderTextColor={theme.textTertiary}
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                autoFocus
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={theme.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </Pressable>

            {/* Hidden reCAPTCHA container */}
            <View nativeID="recaptcha-container" />



            <Text style={styles.demoHint}>
              💡 Demo Mode: Any 10-digit number works
            </Text>
          </View>
        ) : (
          // OTP Entry
          <View style={styles.formContainer}>
            <Text style={styles.otpTitle}>Enter OTP</Text>
            <Text style={styles.otpSubtitle}>
              Code sent to +91 {phoneNumber}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={otpRefs[index]}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    error && styles.otpInputError,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={16} color={theme.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setStep('phone');
                setOtp(['', '', '', '', '', '']);
                setError('');
              }}
            >
              <Text style={styles.secondaryButtonText}>Change Number</Text>
            </Pressable>

            <Text style={styles.demoHint}>
              💡 Demo Mode: Use code 456789
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 56,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.large,
    marginTop: 24,
    gap: 8,
    ...theme.shadow.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,

    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 2,
    borderColor: theme.border,
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: theme.primary,
    backgroundColor: '#E3F2FD',
  },
  otpInputError: {
    borderColor: theme.error,
    backgroundColor: '#FEE2E2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: theme.error,
    fontWeight: '500',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  demoHint: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 11,
    color: theme.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
