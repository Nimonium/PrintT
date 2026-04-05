import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { database, auth } from '../../services/firebase';
import { theme } from '../../constants/theme';
import { format } from 'date-fns';

export default function PilotHistoryScreen() {
  const insets = useSafeAreaInsets();
  const pilot = auth.currentUser;
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pilot) return;

    // Fetch jobs where this pilot is assigned
    const jobsRef = ref(database, 'print_jobs');
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const myHistory = Object.entries(data)
          .map(([id, val]: [string, any]) => ({ id, ...val }))
          .filter(job => job.pilot_id === pilot.uid && (job.status === 'completed' || job.status === 'cancelled'))
          .sort((a, b) => (b.completed_at || 0) - (a.completed_at || 0));
        
        setHistory(myHistory);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pilot]);

  const handleViewReceipt = (orderId: string) => {
    alert(`Receipt for Order ${orderId}\n\nThis view would show detailed earnings breakdown and customer info.`);
  };

  const totalEarnings = history
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => sum + (item.settings?.pages * 2 || 0), 0); // Mock earning: ₹2 per page

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery History</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
          <Text style={styles.summaryValue}>₹{totalEarnings.toFixed(2)}</Text>
          <View style={styles.changeBadge}>
            <MaterialIcons name="local-shipping" size={12} color={theme.success} />
            <Text style={styles.changeText}>{history.length} Jobs Total</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} /> : (
          <View style={styles.historyList}>
            {history.map((item) => (
              <Pressable
                key={item.id}
                style={styles.historyCard}
                onPress={() => handleViewReceipt(item.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons 
                      name={item.status === 'completed' ? 'check-circle' : 'cancel'} 
                      size={32} 
                      color={item.status === 'completed' ? theme.success : theme.error} 
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'completed' ? '#D1FAE5' : '#FEE2E2' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: item.status === 'completed' ? theme.success : theme.error }
                        ]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dateText}>
                      {item.completed_at ? format(item.completed_at, 'MMM dd, yyyy • HH:mm') : 'Unknown Date'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>File</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{item.file_name}</Text>
                  </View>
                  {item.status === 'completed' && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pages</Text>
                        <Text style={styles.detailValue}>{item.settings?.pages || 0}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pilot Earnings</Text>
                        <Text style={[styles.detailValue, styles.earningValue]}>₹{(item.settings?.pages * 2 || 0).toFixed(2)}</Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <MaterialIcons name="receipt-long" size={16} color={theme.primary} />
                  <Text style={styles.receiptText}>Tap to view receipt</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.success,
  },
  historyList: {
    marginTop: 24,
    gap: 16,
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  cardDetails: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  earningValue: {
    color: theme.success,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  receiptText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
});
