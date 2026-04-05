// Role Selection Screen - Choose User Type
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

type Role = 'user' | 'pilot' | 'admin';

interface RoleOption {
  id: Role;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  route: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'user',
    icon: 'person',
    title: 'User',
    description: 'Upload files and print instantly at PrintT ATM or request delivery.',
    color: '#0D47A1',
    bgColor: '#E3F2FD',
    route: '/(tabs)',
  },
  {
    id: 'pilot',
    icon: 'electric-bike',
    title: 'Print Pilot',
    description: 'Accept print delivery requests, collect printed documents from printers, and deliver them securely.',
    color: '#047857',
    bgColor: '#D1FAE5',
    route: '/(pilot)',
  },
  {
    id: 'admin',
    icon: 'admin-panel-settings',
    title: 'Admin',
    description: 'Manage printers, monitor orders, and control the PrintT system.',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    route: '/(admin)',
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleRoleSelect = (role: RoleOption) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appRole', role.id);
    }
    router.replace(role.route as any);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="print" size={40} color={theme.primary} />
        </View>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose how you want to use PrintT</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rolesContainer}>
          {ROLES.map((role) => (
            <Pressable
              key={role.id}
              style={({ pressed }) => [
                styles.roleCard,
                { borderColor: role.color },
                pressed && styles.roleCardPressed,
              ]}
              onPress={() => handleRoleSelect(role)}
            >
              <View style={[styles.iconContainer, { backgroundColor: role.bgColor }]}>
                <MaterialIcons name={role.icon} size={48} color={role.color} />
              </View>

              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>

              <View style={[styles.continueButton, { backgroundColor: role.color }]}>
                <Text style={styles.continueButtonText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <MaterialIcons name="info-outline" size={16} color={theme.textTertiary} />
          <Text style={styles.footerText}>
            You can switch roles anytime from your profile settings.
          </Text>
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
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    borderWidth: 2,
    borderColor: theme.border,
    gap: 20,
    ...theme.shadow.medium,
  },
  roleCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  roleContent: {
    gap: 8,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.medium,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    paddingHorizontal: 4,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: theme.textTertiary,
    lineHeight: 16,
  },
});
