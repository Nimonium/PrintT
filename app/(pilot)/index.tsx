import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, onValue, update, query, orderByChild, equalTo } from "firebase/database";
import { database, auth } from '../../services/firebase';
import { theme } from '../../constants/theme';

export default function PilotDashboard() {
  const router = useRouter();
  const pilot = auth.currentUser;
  
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Pending Jobs & Active Mission
  useEffect(() => {
    // A. All Pending Jobs
    const pendingQuery = query(ref(database, 'print_jobs'), orderByChild('status'), equalTo('pending'));
    const unsubscribePending = onValue(pendingQuery, (snapshot) => {
      const data = snapshot.val();
      const jobList = data ? Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val })) : [];
      setPendingJobs(jobList);
      setLoading(false);
    });

    // B. Any job assigned to THIS pilot
    if (pilot) {
      const allJobsRef = ref(database, 'print_jobs');
      const unsubscribeActive = onValue(allJobsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const myJob = Object.entries(data).find(([_, val]: [string, any]) => 
            val.pilot_id === pilot.uid && val.status !== 'completed'
          );
          setActiveJob(myJob ? { id: myJob[0], ...(myJob[1] as any) } : null);
        }
      });
      return () => {
        unsubscribePending();
        unsubscribeActive();
      };
    }

    return () => unsubscribePending();
  }, [pilot]);

  // 2. Accept Job Logic
  const handleAcceptJob = async (jobId: string) => {
    if (!pilot) return;
    
    // Generate simple 4-digit hardware_otp
    const hardwareOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      await update(ref(database, `print_jobs/${jobId}`), {
        status: 'assigned',
        pilot_id: pilot.uid,
        hardware_otp: hardwareOtp,
        accepted_at: Date.now()
      });
      Alert.alert('Mission Accepted', 'Please proceed to the nearest printer terminal.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept job.');
    }
  };

  if (activeJob) {
    // MISSION SCREEN
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionTitle}>ACTIVE MISSION</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{activeJob.status.toUpperCase()}</Text></View>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionLabel}>HARDWARE OTP</Text>
          <Text style={styles.otpValue}>{activeJob.hardware_otp || '----'}</Text>
          <Text style={styles.missionNote}>Enter this code into the Printer Terminal to begin printing.</Text>
        </View>

        <View style={[styles.card, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>MISSION DETAILS</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="description" size={20} color={theme.textSecondary} />
            <Text style={styles.detailText}>{activeJob.file_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={20} color={theme.textSecondary} />
            <Text style={styles.detailText}>{activeJob.user_phone}</Text>
          </View>
        </View>

        {activeJob.status === 'ready_for_delivery' && (
          <>
            <View style={styles.deliveryCard}>
              <MaterialIcons name="local-shipping" size={32} color="#FFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveryTitle}>Print Complete!</Text>
                <Text style={styles.deliveryNote}>Delivery OTP for User:</Text>
                <Text style={styles.deliveryOtpValue}>{activeJob.delivery_otp || '----'}</Text>
              </View>
            </View>

            <Pressable 
              style={styles.completeButton}
              onPress={async () => {
                try {
                  await update(ref(database, `print_jobs/${activeJob.id}`), {
                    status: 'completed',
                    completed_at: Date.now()
                  });
                  Alert.alert('Success', 'Mission completed. Great work!');
                } catch (error) {
                  Alert.alert('Error', 'Failed to complete mission.');
                }
              }}
            >
              <Text style={styles.completeButtonText}>Confirm Delivery & Complete Mission</Text>
            </Pressable>
          </>
        )}


        <View style={{ flex: 1 }} />
        <Text style={styles.footerText}>Always verify the identity before handover.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello {pilot?.displayName || 'Pilot'},</Text>
          <Text style={styles.subText}>{pilot?.phoneNumber || 'No phone'}</Text>
        </View>
        <Pressable onPress={() => auth.signOut()}><MaterialIcons name="logout" size={24} color={theme.primary} /></Pressable>
      </View>

      <Text style={styles.listTitle}>Available Jobs ({pendingJobs.length})</Text>

      {loading ? <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} /> : (
        <FlatList
          data={pendingJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View style={styles.jobInfo}>
                <View style={styles.jobIcon}><MaterialIcons name="description" size={24} color={theme.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobFileName} numberOfLines={1}>{item.file_name}</Text>
                  <Text style={styles.jobUser}>User: {item.user_phone}</Text>
                </View>
              </View>
              <Pressable style={styles.acceptButton} onPress={() => handleAcceptJob(item.id)}>
                <Text style={styles.acceptText}>Accept Job</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending jobs available.</Text>}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, backgroundColor: '#FFF' },
  welcomeText: { fontSize: 24, fontWeight: '800', color: theme.primary },
  subText: { fontSize: 14, color: '#64748B' },
  listTitle: { fontSize: 18, fontWeight: '700', padding: 24, paddingBottom: 0, color: '#334155' },
  jobCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  jobInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  jobIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  jobFileName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  jobUser: { fontSize: 13, color: '#64748B' },
  acceptButton: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  acceptText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 16 },
  
  // Mission UI
  missionHeader: { padding: 32, alignItems: 'center', backgroundColor: theme.primary },
  missionTitle: { fontSize: 14, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 8 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
  missionCard: { margin: 24, marginTop: -24, backgroundColor: '#FFF', borderRadius: 20, padding: 32, alignItems: 'center', elevation: 10 },
  missionLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 16 },
  otpValue: { fontSize: 56, fontWeight: '900', color: theme.primary, letterSpacing: 8, marginBottom: 20 },
  missionNote: { textAlign: 'center', color: '#475569', fontSize: 14, lineHeight: 20 },
  card: { marginHorizontal: 24, padding: 20, backgroundColor: '#FFF', borderRadius: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  detailText: { fontSize: 15, color: '#334155', fontWeight: '500' },
  deliveryCard: { margin: 24, backgroundColor: '#8B5CF6', borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20 },
  deliveryTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  deliveryNote: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  deliveryOtpValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  completeButton: { marginHorizontal: 24, marginTop: 12, backgroundColor: theme.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 4 },
  completeButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  footerText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginBottom: 32 }
});

