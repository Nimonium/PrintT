// Notifications Settings Screen
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState({
    printComplete: true,
    printReady: true,
    paymentConfirm: true,
    promotions: false,
    nearbyATM: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationGroups = [
    {
      title: 'Print Updates',
      items: [
        {
          key: 'printComplete' as const,
          icon: 'check-circle',
          label: 'Print Completed',
          description: 'When your document is printed',
        },
        {
          key: 'printReady' as const,
          icon: 'print',
          label: 'Print Ready',
          description: 'When your print job is ready at ATM',
        },
      ],
    },
    {
      title: 'Payments',
      items: [
        {
          key: 'paymentConfirm' as const,
          icon: 'payment',
          label: 'Payment Confirmation',
          description: 'Transaction receipts and confirmations',
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          key: 'promotions' as const,
          icon: 'local-offer',
          label: 'Promotions & Offers',
          description: 'Special deals and discounts',
        },
        {
          key: 'nearbyATM' as const,
          icon: 'location-on',
          label: 'Nearby ATM Alerts',
          description: 'When you are near a PrintT ATM',
        },
      ],
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {notificationGroups.map((group, index) => (
          <View key={index} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, itemIndex) => (
                <View
                  key={item.key}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 && styles.settingItemBorder,
                  ]}
                >
                  <MaterialIcons name={item.icon as any} size={24} color={theme.textSecondary} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggleSetting(item.key)}
                    trackColor={{ false: '#D1D5DB', true: theme.secondary }}
                    thumbColor="#FFF"
                  />
                </View>
              ))}
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
  group: {
    marginTop: 24,
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
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
});
