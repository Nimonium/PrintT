// Home Dashboard - PrintT
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { usePrint } from '../../contexts/PrintContext';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { recentJobs } = usePrint();

  const handleStartPrinting = () => {
    router.push('/upload');
  };

  const handleViewMap = () => {
    router.push('/(tabs)/find-atm');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="print" size={32} color={theme.primary} />
          </View>
          <Pressable style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
            <MaterialIcons name="person" size={24} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome back, {user?.displayName || 'User'}</Text>
          <Text style={styles.welcomeSubtitle}>Ready to print today?</Text>
        </View>

        {/* Main Action Card */}
        <Pressable onPress={handleStartPrinting} style={styles.heroCard}>
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <MaterialIcons name="upload-file" size={32} color="#FFF" />
              </View>
              <Text style={styles.heroTitle}>Upload Document</Text>
              <Text style={styles.heroDescription}>
                PDF, Word, or Images. Configure settings and pay instantly.
              </Text>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Start Printing</Text>
                <MaterialIcons name="arrow-forward" size={16} color={theme.primary} />
              </View>
            </View>
            <View style={styles.heroDecoration}>
              <MaterialIcons name="print" size={120} color="rgba(255,255,255,0.08)" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Nearest ATM */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearest PrintT</Text>
            <Pressable onPress={handleViewMap}>
              <Text style={styles.viewAll}>View Map</Text>
            </Pressable>
          </View>

          <View style={styles.atmCard}>
            <View style={styles.mapPreview}>
              <View style={styles.mapMarker}>
                <MaterialIcons name="print" size={16} color="#FFF" />
              </View>
            </View>
            <View style={styles.atmInfo}>
              <View style={styles.atmDetails}>
                <Text style={styles.atmName}>Downtown Station (A2)</Text>
                <View style={styles.atmMeta}>
                  <MaterialIcons name="location-on" size={12} color={theme.textSecondary} />
                  <Text style={styles.atmDistance}>0.4 miles away • Open 24/7</Text>
                </View>
              </View>
              <Pressable style={styles.directionsButton} onPress={handleViewMap}>
                <MaterialIcons name="directions" size={20} color={theme.secondary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Recent Prints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Prints</Text>
            <Pressable onPress={() => router.push('/(tabs)/activity')}>
              <Text style={styles.viewAll}>See All</Text>
            </Pressable>
          </View>

          {recentJobs.slice(0, 2).map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={[
                styles.jobIcon,
                { backgroundColor: job.fileType === 'pdf' ? '#FFF3E0' : '#E3F2FD' }
              ]}>
                <MaterialIcons
                  name={job.fileType === 'pdf' ? 'picture-as-pdf' : 'description'}
                  size={24}
                  color={job.fileType === 'pdf' ? '#F57C00' : '#1976D2'}
                />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobName} numberOfLines={1}>{job.fileName}</Text>
                <Text style={styles.jobMeta}>
                  {formatDate(job.createdAt)} • {job.totalPages} pages • ₹{job.totalCost.toFixed(2)}
                </Text>
              </View>
              <View style={styles.jobStatus}>
                <Text style={styles.jobStatusText}>Success</Text>
              </View>
            </View>
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    ...theme.typography.pageTitle,
    fontSize: 24,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    ...theme.typography.body,
    color: theme.textSecondary,
  },
  heroCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadow.medium,
  },
  heroGradient: {
    padding: 24,
    minHeight: 200,
    position: 'relative',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    maxWidth: 220,
    lineHeight: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary,
  },
  heroDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    fontSize: 18,
    color: theme.textPrimary,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.secondary,
  },
  atmCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  mapPreview: {
    width: '100%',
    height: 128,
    backgroundColor: '#E3F2FD',
    borderRadius: theme.borderRadius.medium,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    ...theme.shadow.medium,
  },
  atmInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atmDetails: {
    flex: 1,
  },
  atmName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  atmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  atmDistance: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  directionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: 12,
    color: theme.textSecondary,
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
