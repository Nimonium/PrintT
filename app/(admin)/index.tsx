import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, onValue } from "firebase/database";
import { database, auth } from '../../services/firebase';
import { theme } from '../../constants/theme';

export default function AdminDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    pending: 0,
    printing: 0,
    delivery: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  // 1. Listen for ALL Jobs in Realtime Database
  useEffect(() => {
    const jobsRef = ref(database, 'print_jobs');
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jobList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
          timestamp: val.created_at ? new Date(val.created_at).toLocaleTimeString() : 'N/A'
        })).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

        setJobs(jobList);

        // 2. Update Metrics
        setMetrics({
          pending: jobList.filter(j => j.status === 'pending').length,
          printing: jobList.filter(j => j.status === 'assigned' || j.status === 'printing').length,
          delivery: jobList.filter(j => j.status === 'ready_for_delivery').length,
          completed: jobList.filter(j => j.status === 'completed').length
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B'; // Amber
      case 'assigned': 
      case 'printing': return '#3B82F6'; // Blue
      case 'ready_for_delivery': return '#8B5CF6'; // Purple
      case 'completed': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const MetricCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <MaterialIcons name={icon} size={20} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color: color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Monitoring</Text>
        <Pressable onPress={() => auth.signOut()}><MaterialIcons name="power-settings-new" size={24} color="#EF4444" /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard title="PENDING" value={metrics.pending} icon="hourglass-top" color="#F59E0B" />
          <MetricCard title="PRINTING" value={metrics.printing} icon="print" color="#3B82F6" />
          <MetricCard title="DELIVERY" value={metrics.delivery} icon="local-shipping" color="#8B5CF6" />
          <MetricCard title="COMPLETED" value={metrics.completed} icon="verified" color="#10B981" />
        </View>

        {/* Live Feed Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>LIVE JOB FEED</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>REALTIME</Text>
            </View>
          </View>

          {loading ? <ActivityIndicator size="small" color={theme.primary} /> : (
            <View>
              {jobs.map((item, index) => (
                <View key={item.id} style={[styles.tableRow, index % 2 === 0 && { backgroundColor: '#F8FAFC' }]}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowId}>#{item.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.rowPhone}>{item.user_phone}</Text>
                  </View>
                  
                  <View style={styles.rowStatusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.rowTime}>
                    <Text style={styles.timeText}>{item.timestamp}</Text>
                    {item.pilot_id && <Text style={styles.pilotId}>Pilot: {item.pilot_id.slice(0,5)}</Text>}
                  </View>
                </View>
              ))}
              {jobs.length === 0 && <Text style={styles.emptyText}>No orders tracked today.</Text>}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  metricCard: { width: '47%', padding: 20, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', borderLeftWidth: 4, elevation: 2 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  metricTitle: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  metricValue: { fontSize: 28, fontWeight: '900' },
  tableContainer: { padding: 24 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  tableTitle: { fontSize: 14, fontWeight: '900', color: '#334155' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F1F5F9', padding: 6, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowInfo: { flex: 1.5, gap: 4 },
  rowId: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  rowPhone: { fontSize: 12, color: '#64748B' },
  rowStatusContainer: { flex: 2, alignItems: 'center' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  rowTime: { flex: 1.2, alignItems: 'flex-end', gap: 4 },
  timeText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  pilotId: { fontSize: 9, color: '#94A3B8', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', padding: 40, color: '#94A3B8' }
});
