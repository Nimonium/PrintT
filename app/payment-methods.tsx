// Payment Methods Screen
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAddCard = () => {
    Alert.alert('Add Card', 'Card payment integration coming soon');
  };

  const paymentMethods = [
    {
      id: 1,
      type: 'UPI',
      icon: 'account-balance',
      label: 'UPI Apps',
      description: 'PhonePe, Google Pay, Paytm',
      color: '#4C1D95',
      bgColor: '#F3E8FF',
      isDefault: true,
    },
    {
      id: 2,
      type: 'Card',
      icon: 'credit-card',
      label: 'Saved Cards',
      description: 'No cards saved',
      color: '#1E40AF',
      bgColor: '#DBEAFE',
      isDefault: false,
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Manage your payment methods for faster checkout
        </Text>

        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={[styles.methodIcon, { backgroundColor: method.bgColor }]}>
              <MaterialIcons name={method.icon as any} size={28} color={method.color} />
            </View>
            <View style={styles.methodContent}>
              <View style={styles.methodHeader}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={handleAddCard}>
          <MaterialIcons name="add-circle-outline" size={24} color={theme.primary} />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </Pressable>

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialIcons name="lock" size={20} color={theme.textSecondary} />
          <Text style={styles.infoText}>
            Your payment information is encrypted and secure
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
  description: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.large,
    padding: 16,
    marginBottom: 12,
    ...theme.shadow.small,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
  },
  methodDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.large,
    paddingVertical: 18,
    gap: 12,
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    gap: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
