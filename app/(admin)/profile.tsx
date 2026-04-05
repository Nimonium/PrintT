// Admin Profile Screen
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

const ADMIN = '#7C3AED';
const ADMIN_DARK = '#5B21B6';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth-otp');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const showSecuritySettings = () => {
    const lastLogin = new Date().toLocaleString();
    const message = `Two-Factor Authentication: ✓ Enabled\nBiometric Login: ✓ Enabled\nFirewall Status: 🟢 Active\n\n═══ Session Management ═══\n• Auto-logout: 30 minutes\n• Max concurrent sessions: 3\n• Last login: ${lastLogin}\n\n═══ Access Control ═══\n• IP Whitelist: Enabled\n• Failed login attempts: 0/5\n• Password strength: Strong\n\n═══ Quick Actions ═══\n• Force logout all sessions\n• Reset 2FA device\n• Review access logs`;
    
    if (Platform.OS === 'web') {
      alert('🔐 Security Settings\n\n' + message);
    } else {
      Alert.alert(
        '🔐 Security Settings',
        message,
        [
          { text: 'View Access Logs', onPress: () => Alert.alert('Access Logs', 'Viewing detailed access history...') },
          { text: 'Close' }
        ]
      );
    }
  };

  const showUserPermissions = () => {
    const message = `═══ Role Hierarchy ═══\n\n🔴 Admin (Full Access)\n• System configuration\n• User management\n• Financial reports\n• Database access\n• All operations\n\n🟡 Print Pilot (Limited)\n• Accept/reject orders\n• Delivery tracking\n• Earnings view\n• Customer contact\n• Basic navigation\n\n🟢 User (Basic)\n• Upload documents\n• Track orders\n• View history\n• Payment methods\n• Profile settings\n\n═══ Active Users ═══\nAdmins: 3 | Pilots: 156 | Users: 12,480`;
    
    if (Platform.OS === 'web') {
      alert('👥 User Permissions\n\n' + message);
    } else {
      Alert.alert(
        '👥 User Permissions',
        message,
        [
          { text: 'Manage Roles', onPress: () => Alert.alert('Role Management', 'Opening role configuration panel...') },
          { text: 'Close' }
        ]
      );
    }
  };

  const showAuditLogs = () => {
    const now = new Date();
    const logs = [
      { time: new Date(now.getTime() - 0), action: 'Admin Sarah logged in', icon: '✓' },
      { time: new Date(now.getTime() - 5 * 60000), action: 'Printer PRT-089 added', icon: '➕' },
      { time: new Date(now.getTime() - 10 * 60000), action: 'System settings updated', icon: '⚙️' },
      { time: new Date(now.getTime() - 15 * 60000), action: 'Agent permissions modified', icon: '🔐' },
      { time: new Date(now.getTime() - 30 * 60000), action: 'Database backup completed', icon: '💾' },
      { time: new Date(now.getTime() - 45 * 60000), action: 'Security scan passed', icon: '🛡️' },
    ];
    
    const logText = logs.map(log => 
      `${log.time.toLocaleTimeString()} ${log.icon}\n${log.action}`
    ).join('\n\n');
    
    const message = `═══ Recent Activity ═══\n\n${logText}\n\n═══ Export Options ═══\n• Export as CSV\n• Export as PDF\n• Email report\n\nTotal events today: 1,284\nCritical alerts: 0`;
    
    if (Platform.OS === 'web') {
      alert('📋 Audit Logs\n\n' + message);
    } else {
      Alert.alert(
        '📋 Audit Logs',
        message,
        [
          { text: 'Export CSV', onPress: () => Alert.alert('Export', 'Generating CSV report...') },
          { text: 'View All', onPress: () => Alert.alert('All Logs', 'Opening full audit log viewer...') },
          { text: 'Close' }
        ]
      );
    }
  };

  const showSystemConfiguration = () => {
    const message = `═══ Environment ═══\n• Status: 🟢 Production\n• API Version: 2.1.4\n• Database: PostgreSQL 14.2\n• Server: AWS us-east-1\n\n═══ Configuration ═══\n• Max file size: 50 MB\n• Session timeout: 30 min\n• Upload limit: 100/hour\n• Rate limit: 1000 req/min\n\n═══ Maintenance ═══\n• Backup schedule: Daily 2:00 AM\n• Maintenance window: Sun 3-5 AM\n• Auto-update: Enabled\n• Last deployment: ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\n═══ System Health ═══\n• CPU Usage: 42%\n• Memory: 68%\n• Disk Space: 74%\n• Active connections: 1,284`;
    
    if (Platform.OS === 'web') {
      alert('⚙️ System Configuration\n\n' + message);
    } else {
      Alert.alert(
        '⚙️ System Configuration',
        message,
        [
          { text: 'Edit Config', onPress: () => Alert.alert('Configuration', 'Opening configuration editor...') },
          { text: 'System Status', onPress: () => Alert.alert('Status', 'All systems operational ✓') },
          { text: 'Close' }
        ]
      );
    }
  };

  const handleMenuPress = (item: any) => {
    switch (item.label) {
      case 'Security Settings':
        showSecuritySettings();
        break;
      case 'User Permissions':
        showUserPermissions();
        break;
      case 'Audit Logs':
        showAuditLogs();
        break;
      case 'System Configuration':
        showSystemConfiguration();
        break;
      default:
        if (Platform.OS === 'web') {
          alert(item.label);
        } else {
          Alert.alert(item.label, 'This feature will be available soon.');
        }
    }
  };

  const stats = [
    { label: 'System Uptime', value: '99.9%' },
    { label: 'Active Nodes', value: '1,204' },
    { label: 'Total Revenue', value: '₹2.4M' },
  ];

  const menuItems = [
    { icon: 'security', label: 'Security Settings', description: 'Manage 2FA and access control' },
    { icon: 'admin-panel-settings', label: 'User Permissions', description: 'Configure role-based access' },
    { icon: 'history-edu', label: 'Audit Logs', description: 'Review system activity logs' },
    { icon: 'settings-suggest', label: 'System Configuration', description: 'Adjust environment parameters' },
  ];

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
            <MaterialIcons name="admin-panel-settings" size={48} color="#FFF" />
          </View>
          <Text style={styles.name}>Admin Sarah</Text>
          <Text style={styles.role}>System Administrator</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Pressable style={styles.infoCard}>
            <LinearGradient
              colors={[ADMIN, ADMIN_DARK]}
              style={styles.infoGradient}
            >
              <Text style={styles.infoLabel}>Admin ID</Text>
              <Text style={styles.infoValue}>PX-ADM-442</Text>
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>Central Hub</Text>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>+1 555-022-9999</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Pressable 
                key={index} 
                style={styles.menuItem}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuIcon}>
                  <MaterialIcons name={item.icon as any} size={24} color={theme.textSecondary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
              </Pressable>
            ))}
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
    backgroundColor: ADMIN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadow.medium,
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
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#D1FAE5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.success,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  statCard: {
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
    color: ADMIN,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.shadow.medium,
  },
  infoGradient: {
    padding: 24,
    gap: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
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
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: theme.textSecondary,
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
