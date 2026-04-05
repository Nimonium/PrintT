// Print Pilot Profile
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function PilotProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const confirmAndSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth-otp');
    } catch (error) {
      console.error('Sign out error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to sign out. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        confirmAndSignOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: confirmAndSignOut },
        ]
      );
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="electric-bike" size={48} color="#FFF" />
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={theme.success} />
            </View>
          </View>
          <Text style={styles.name}>{user?.displayName || user?.phoneNumber || 'Pilot Alex'}</Text>
          <Text style={styles.role}>Elite Delivery Specialist</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹12,480.50</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <View style={styles.statChange}>
              <MaterialIcons name="trending-up" size={14} color={theme.success} />
              <Text style={styles.changeText}>+12%</Text>
            </View>
          </View>
          <View style={styles.statCardSmall}>
            <Text style={styles.statValue}>1,248</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCardSmall}>
            <Text style={styles.statValue}>4.98 ★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identity & Equipment</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="fingerprint" size={20} color={theme.textSecondary} />
              <Text style={styles.infoLabel}>Pilot ID</Text>
              <Text style={styles.infoValue}>PX-PLT-001</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="electric-bike" size={20} color={theme.textSecondary} />
              <Text style={styles.infoLabel}>Vehicle</Text>
              <Text style={styles.infoValue}>Hyper-Flow E-Bike</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color={theme.textSecondary} />
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phoneNumber || '+1 555-010-8888'}</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Settings</Text>
          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuItem}
              onPress={() => alert('Notification Settings\n\nConfigure:\n• New order alerts\n• Delivery updates\n• Payment notifications\n• System announcements')}
            >
              <View style={styles.menuIcon}>
                <MaterialIcons name="notifications" size={24} color={theme.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>Notification Settings</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => alert('Payout Methods\n\nCurrent method: Bank Transfer\n\nAccount: **** 4567\nNext payout: Weekly on Friday\nPending: ₹482.50')}
            >
              <View style={styles.menuIcon}>
                <MaterialIcons name="account-balance-wallet" size={24} color={theme.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>Payout Methods</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => alert('Help & Support\n\n24/7 Support Line: +1-555-PILOT (74568)\n\nCommon topics:\n• Delivery guidelines\n• OTP verification\n• Payment issues\n• Vehicle maintenance')}
            >
              <View style={styles.menuIcon}>
                <MaterialIcons name="help" size={24} color={theme.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color={theme.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadow.medium,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.small,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  statCard: {
    flex: 2,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.success,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.success,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: 'monospace',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.large,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.error,
  },
});
