// Activity/History Screen
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { usePrint } from '../../contexts/PrintContext';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { recentJobs } = usePrint();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Print Activity</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {recentJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={[
              styles.jobIcon,
              { backgroundColor: job.fileType === 'pdf' ? '#FFF3E0' : '#E3F2FD' }
            ]}>
              <MaterialIcons
                name={job.fileType === 'pdf' ? 'picture-as-pdf' : 'description'}
                size={28}
                color={job.fileType === 'pdf' ? '#F57C00' : '#1976D2'}
              />
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.jobName} numberOfLines={1}>{job.fileName}</Text>
              <Text style={styles.jobMeta}>
                {formatDate(job.createdAt)} • {job.totalPages} pages
              </Text>
              <Text style={styles.jobDetails}>
                {job.colorMode === 'color' ? 'Color' : 'B&W'} • {job.paperSize.toUpperCase()} • {job.copies} {job.copies > 1 ? 'copies' : 'copy'}
              </Text>
            </View>
            <View style={styles.jobRight}>
              <Text style={styles.jobPrice}>₹{job.totalCost.toFixed(2)}</Text>
              <View style={styles.jobStatus}>
                <Text style={styles.jobStatusText}>Success</Text>
              </View>
            </View>
          </View>
        ))}
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
  headerTitle: {
    ...theme.typography.pageTitle,
    color: theme.textPrimary,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 12,
    ...theme.shadow.small,
  },
  jobIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  jobDetails: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  jobRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  jobStatus: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
  },
});
