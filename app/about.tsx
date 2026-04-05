// About Screen
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const socialLinks = [
    { icon: 'language', label: 'Website', url: 'https://printxpress.com' },
    { icon: 'email', label: 'Contact', url: 'mailto:support@printxpress.com' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & App Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="print" size={64} color={theme.primary} />
          </View>
          <Text style={styles.appName}>PrintT</Text>
          <Text style={styles.tagline}>Upload. Pay. Print.</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About PrintT</Text>
          <Text style={styles.description}>
            PrintT is a revolutionary self-service printing solution that allows you to 
            upload documents, configure print settings, make secure payments, and collect your 
            prints instantly at any PrintT ATM using a secure OTP.
          </Text>
          <Text style={styles.description}>
            Our mission is to make printing accessible, affordable, and convenient for everyone, 
            anywhere, anytime.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            {[
              'Upload PDF, DOCX, and image files',
              'Flexible print settings (color, size, copies)',
              'Secure payment integration',
              'Time-limited OTP for privacy',
              'Auto-delete files after printing',
              'Find nearby PrintT ATMs',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color={theme.secondary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get in Touch</Text>
          {socialLinks.map((link, index) => (
            <Pressable
              key={index}
              style={styles.linkButton}
              onPress={() => openLink(link.url)}
            >
              <MaterialIcons name={link.icon as any} size={20} color={theme.primary} />
              <Text style={styles.linkText}>{link.label}</Text>
              <MaterialIcons name="open-in-new" size={16} color={theme.textTertiary} style={{ marginLeft: 'auto' }} />
            </Pressable>
          ))}
        </View>

        {/* Legal */}
        <View style={styles.legalSection}>
          <Pressable style={styles.legalLink}>
            <Text style={styles.legalText}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.legalDivider}>•</Text>
          <Pressable style={styles.legalLink}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </Pressable>
        </View>

        <Text style={styles.copyright}>
          © 2026 PrintT. All rights reserved.
        </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadow.medium,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    color: theme.textTertiary,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: theme.textPrimary,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.primary,
  },
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
    gap: 12,
  },
  legalLink: {
    paddingVertical: 8,
  },
  legalText: {
    fontSize: 13,
    color: theme.textSecondary,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    fontSize: 13,
    color: theme.textTertiary,
  },
  copyright: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: 'center',
  },
});
