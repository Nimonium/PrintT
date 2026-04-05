// Profile Screen
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  const confirmAndSignOut = async () => {
    try {
      await signOut();
      // Navigate directly to auth-otp screen after sign out
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
      // Web doesn't support Alert.alert, use confirm
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
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: confirmAndSignOut,
          },
        ]
      );
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Profile Settings', onPress: () => router.push('/profile-settings') },
        { icon: 'phone', label: 'Phone Number', value: user?.phoneNumber },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications', label: 'Notifications', onPress: () => router.push('/notifications') },
        { icon: 'print', label: 'Default Print Settings', onPress: () => router.push('/print-settings') },
        { icon: 'payment', label: 'Payment Methods', onPress: () => router.push('/payment-methods') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help', label: 'Help & FAQ', onPress: () => router.push('/help') },
        { icon: 'feedback', label: 'Send Feedback', onPress: () => router.push('/feedback') },
        { icon: 'info', label: 'About', onPress: () => router.push('/about') },
      ],
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color={theme.textSecondary} />
          </View>
          <Text style={styles.profileName}>{user?.displayName || user?.phoneNumber || 'User'}</Text>
          <Text style={styles.profilePhone}>{user?.phoneNumber ? (user.displayName ? user.phoneNumber : '') : ''}</Text>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, index) => (
          <View key={index} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <MaterialIcons name={item.icon as any} size={24} color={theme.textSecondary} />
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.value ? (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  ) : (
                    <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={20} color={theme.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>Version 1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFF',
    ...theme.shadow.medium,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupItems: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  settingValue: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.error,
  },
  version: {
    fontSize: 13,
    color: theme.textTertiary,
    textAlign: 'center',
    marginTop: 24,
  },
});
