import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, onValue, update } from "firebase/database";
import { database } from '../services/firebase';
import { theme } from '../constants/theme';
import MapComponent from '../components/MapComponent';

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams();
  
  const [jobData, setJobData] = useState<any>(null);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // 1. Listen to the specific JOB in Realtime Database
  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const jobRef = ref(database, `print_jobs/${jobId}`);
    const unsubscribe = onValue(jobRef, (snapshot) => {
      const data = snapshot.val();
      setJobData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [jobId]);

  // 2. Handle Delivery OTP Verification
  const handleVerifyDelivery = async () => {
    if (!jobData || !deliveryOtpInput) return;
    
    setVerifying(true);
    try {
      if (deliveryOtpInput === jobData.delivery_otp) {
        // Success: Update status to 'completed'
        await update(ref(database, `print_jobs/${jobId}`), {
          status: 'completed',
          completed_at: Date.now()
        });
        Alert.alert('Success', 'Delivery Confirmed! Your document is now completed.', [
          { text: 'Back to Home', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', 'Invalid Delivery OTP. Please check with your Print Pilot.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!jobData) {
    return (
      <View style={styles.errorContainer}>
        <Text>Job not found: {jobId}</Text>
        <Pressable onPress={() => router.back()}><Text>Go Back</Text></Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><MaterialIcons name="arrow-back-ios" size={20} /></Pressable>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.mapContainer}>
          <MapComponent 
            deliveryPartnerLocation={{ latitude: 28.6139, longitude: 77.2090 }}
            userLocation={{ latitude: 28.6145, longitude: 77.2095 }}
            style={styles.map}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <View style={styles.statusRow}>
            <MaterialIcons 
              name={jobData.status === 'completed' ? 'check-circle' : 'hourglass-empty'} 
              size={24} 
              color={theme.primary} 
            />
            <Text style={styles.statusText}>{jobData.status.toUpperCase()}</Text>
          </View>
          
          {/* ASSIGNED STATE UI */}
          {jobData.status === 'assigned' && (
            <View style={styles.messageBox}>
              <MaterialIcons name="info" size={20} color={theme.primary} />
              <Text style={styles.messageText}>A Print Pilot is preparing your document.</Text>
            </View>
          )}

          {/* READY FOR DELIVERY STATE UI */}
          {jobData.status === 'ready_for_delivery' && (
            <View style={styles.deliveryContainer}>
              <Text style={styles.deliveryTitle}>Enter Delivery OTP</Text>
              <Text style={styles.deliverySub}>Provided by your Print Pilot upon arrival</Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="4-digit OTP"
                keyboardType="number-pad"
                maxLength={4}
                value={deliveryOtpInput}
                onChangeText={setDeliveryOtpInput}
              />
              
              <Pressable 
                style={[styles.verifyButton, verifying && { opacity: 0.7 }]}
                onPress={handleVerifyDelivery}
                disabled={verifying}
              >
                {verifying ? <ActivityIndicator color="#FFF" /> : <Text style={styles.verifyText}>Verify & Complete</Text>}
              </Pressable>
            </View>
          )}

          {jobData.status === 'completed' && (
            <View style={[styles.messageBox, { backgroundColor: '#E8F5E9' }]}>
              <MaterialIcons name="check" size={20} color="#2E7D32" />
              <Text style={[styles.messageText, { color: '#2E7D32' }]}>Job Completed successfully!</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailItem}>File: {jobData.file_name}</Text>
          <Text style={styles.detailItem}>Phone: {jobData.user_phone}</Text>
          {jobData.pilot_id && <Text style={styles.detailItem}>Pilot ID: {jobData.pilot_id.slice(0,8)}...</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { height: 250, backgroundColor: '#E2E8F0' },
  map: { flex: 1 },
  card: { margin: 16, padding: 20, backgroundColor: '#FFF', borderRadius: 12, elevation: 2 },
  statusLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  statusText: { fontSize: 20, fontWeight: '800', color: theme.primary },
  messageBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#E0F2FE', padding: 16, borderRadius: 8 },
  messageText: { flex: 1, fontSize: 14, color: '#0369A1', fontWeight: '600' },
  deliveryContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  deliveryTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  deliverySub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16 },
  otpInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 20, textAlign: 'center', fontWeight: '700', color: theme.primary, marginBottom: 16 },
  verifyButton: { backgroundColor: theme.primary, padding: 14, borderRadius: 8, alignItems: 'center' },
  verifyText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  detailsCard: { marginHorizontal: 16, padding: 16, backgroundColor: '#FFF', borderRadius: 12, gap: 8 },
  detailItem: { fontSize: 14, color: '#475569' }
});
