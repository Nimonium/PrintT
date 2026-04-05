// Authentication Screen - Phone + OTP
import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, verifyOTP, loading } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  
  const otpInputs = useRef<(TextInput | null)[]>([]);

  const handleSendOTP = async () => {
    setError('');
    
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await signIn('+91' + phoneNumber);
      setStep('otp');
      setTimeout(() => otpInputs.current[0]?.focus(), 100);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
      console.error('Sign in error:', error);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    setError('');
    
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    try {
      await verifyOTP(otpCode);
      router.replace('/(tabs)');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      otpInputs.current[0]?.focus();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="print" size={48} color={theme.primary} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Smart printing at your fingertips</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Phone Step */}
          {step === 'phone' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      setError('');
                    }}
                    editable={!loading}
                    autoFocus
                  />
                </View>
                <Text style={styles.hint}>
                  Enter any 10-digit number for demo
                </Text>
              </View>

              <Pressable
                style={[styles.primaryButton, (loading || phoneNumber.length !== 10) && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading || phoneNumber.length !== 10}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <View style={styles.form}>
              <View style={styles.otpHeader}>
                <View style={styles.demoNotice}>
                  <MaterialIcons name="info" size={20} color={theme.secondary} />
                  <Text style={styles.demoText}>DEMO MODE - No SMS sent</Text>
                </View>
                <Text style={styles.otpInfo}>Enter any 4-digit code to continue</Text>
                <Text style={styles.otpPhone}>+91 {phoneNumber}</Text>
                <Pressable 
                  style={styles.quickFillButton}
                  onPress={() => {
                    setOtp(['1', '2', '3', '4']);
                    setTimeout(() => handleVerifyOTP(), 300);
                  }}
                >
                  <Text style={styles.quickFillText}>Quick Fill: 1234</Text>
                </Pressable>
              </View>

              <View style={styles.otpContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <Pressable
                    key={index}
                    onPress={() => otpInputs.current[index]?.focus()}
                  >
                    <TextInput
                      ref={(ref) => (otpInputs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        otp[index] && styles.otpInputFilled,
                      ]}
                      maxLength={1}
                      keyboardType="number-pad"
                      value={otp[index]}
                      onChangeText={(value) => handleOTPChange(value, index)}
                      onKeyPress={(e) => handleOTPKeyPress(e, index)}
                      editable={!loading}
                      selectTextOnFocus
                      autoComplete="off"
                    />
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={[styles.primaryButton, (loading || otp.join('').length !== 4) && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 4}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.resendButton}
                onPress={() => {
                  setStep('phone');
                  setOtp(['', '', '', '']);
                  setError('');
                }}
                disabled={loading}
              >
                <Text style={styles.resendText}>Change phone number</Text>
              </Pressable>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginTop: 32,
    marginBottom: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...theme.typography.pageTitle,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginLeft: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.border,
    paddingLeft: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textSecondary,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    paddingRight: 16,
    color: theme.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: theme.textTertiary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.large,
    gap: 8,
    ...theme.shadow.medium,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: '#FFF',
  },
  otpHeader: {
    alignItems: 'center',
    gap: 4,
  },
  otpInfo: {
    ...theme.typography.body,
    color: theme.textSecondary,
  },
  otpPhone: {
    ...theme.typography.cardTitle,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  demoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickFillButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.secondary,
    borderRadius: 8,
  },
  quickFillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpInput: {
    width: 56,
    height: 64,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.border,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.textPrimary,
  },
  otpInputFilled: {
    borderColor: theme.primary,
    backgroundColor: '#FFF',
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: theme.primary,
    fontWeight: '500',
  },
});
