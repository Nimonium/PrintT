// Print Pilot – Active Delivery Workflow Screen
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ref, update } from 'firebase/database';
import { database } from '../../services/firebase';
import { theme } from '../../constants/theme';

const STEPS = [
  { label: 'Navigate to Printer', sub: 'In progress — Arriving at 14:42' },
  { label: 'Enter Print OTP', sub: 'Awaiting arrival at hub' },
  { label: 'Collect Documents', sub: 'Verify batch' },
  { label: 'Start Delivery', sub: 'Head to customer location' },
  { label: 'Navigate to Customer', sub: 'Follow route guidance' },
  { label: 'Receive Delivery OTP', sub: 'Customer provides OTP' },
  { label: 'Complete', sub: 'Mark order delivered' },
];

export default function ActiveWorkflowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string; pickup?: string; delivery?: string }>();

  const orderId = params.orderId ?? 'PX-1024';
  const pickup = params.pickup ?? 'Downtown ATM';
  const delivery = params.delivery ?? '123 College Ave';

  const [currentStep, setCurrentStep] = useState(0);
  const [otp, setOtp] = useState('');

  const advanceStep = () => {
    if (currentStep >= STEPS.length - 1) {
      handleComplete();
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleNavigatePrinter = () => {
    const msg = `Opening navigation to:\n${pickup}\n\nETA: 4 mins (1.2 km)\n\nFollow the route guidance and arrive safely.`;
    if (Platform.OS === 'web') {
      alert(`🗺️ Navigate to Printer\n\n${msg}`);
    } else {
      Alert.alert('Navigate to Printer', msg, [
        { text: 'Open Maps', onPress: advanceStep },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleEnterOTP = () => {
    const printOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(printOtp);
    const msg = `Enter this OTP at the PrintT ATM:\n\n${printOtp}\n\nValid for 5 minutes. Collect the documents after the printer finishes.`;
    if (Platform.OS === 'web') {
      alert(`🔑 Print OTP\n\n${msg}`);
      advanceStep();
    } else {
      Alert.alert('Print OTP', msg, [
        { text: 'Entered OTP', onPress: advanceStep },
        { text: 'Back', style: 'cancel' },
      ]);
    }
  };

  const handleCollect = () => {
    const msg = `Confirm collection of documents for order #${orderId}.\n\nCustomer: ${delivery}\nBatch: #2940\n\nEnsure all pages are present before proceeding.`;
    if (Platform.OS === 'web') {
      const ok = window.confirm(msg);
      if (ok) advanceStep();
    } else {
      Alert.alert('Collect Documents', msg, [
        { text: 'Collected', onPress: advanceStep },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleStartDelivery = () => {
    const msg = `Starting delivery to:\n${delivery}\n\nMake sure documents are secure. Navigate safely.`;
    if (Platform.OS === 'web') {
      alert(`🚴 Start Delivery\n\n${msg}`);
      advanceStep();
    } else {
      Alert.alert('Start Delivery', msg, [
        { text: 'Start', onPress: advanceStep },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleNavigateCustomer = () => {
    const msg = `Opening navigation to customer:\n${delivery}\n\nETA: 8 mins (2.4 km)`;
    if (Platform.OS === 'web') {
      alert(`🗺️ Navigate to Customer\n\n${msg}`);
      advanceStep();
    } else {
      Alert.alert('Navigate to Customer', msg, [
        { text: 'Open Maps', onPress: advanceStep },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleReceiveDeliveryOTP = () => {
    const msg = `Ask the customer for their 4-digit delivery OTP and enter it here to confirm delivery.\n\nOrder: #${orderId}\nCustomer location: ${delivery}`;
    if (Platform.OS === 'web') {
      const enteredOtp = prompt('Enter customer delivery OTP:');
      if (enteredOtp && enteredOtp.length >= 4) {
        alert('✓ OTP Verified!\n\nDelivery confirmed. Proceed to complete the order.');
        advanceStep();
      } else if (enteredOtp !== null) {
        alert('Invalid OTP. Ask the customer to check their app.');
      }
    } else {
      Alert.alert('Delivery OTP', msg, [
        {
          text: 'Verify OTP',
          onPress: () => {
            Alert.alert('OTP Verified', '✓ Delivery OTP confirmed!', [
              { text: 'Complete', onPress: advanceStep },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleComplete = async () => {
    try {
      await update(ref(database, `print_jobs/${orderId}`), {
        status: 'completed',
        completed_at: Date.now()
      });
    } catch (e) {
      console.error('Failed to complete order:', e);
    }
    const msg = `Order #${orderId} completed successfully!\n\nDelivered to: ${delivery}\nDocuments: Collected & Delivered\n\nEarnings for this order: ₹4.80\n\nGreat work! The order has been marked as delivered.`;
    if (Platform.OS === 'web') {
      alert(`✅ Order Completed!\n\n${msg}`);
      router.back();
    } else {
      Alert.alert('Order Completed! ✅', msg, [
        { text: 'Done', onPress: () => router.back() },
      ]);
    }
  };

  const getStepAction = () => {
    switch (currentStep) {
      case 0: return { label: 'Navigate to Printer', icon: 'directions', action: handleNavigatePrinter };
      case 1: return { label: 'Enter Print OTP', icon: 'pin', action: handleEnterOTP };
      case 2: return { label: 'Collect Documents', icon: 'inventory-2', action: handleCollect };
      case 3: return { label: 'Start Delivery', icon: 'electric-bike', action: handleStartDelivery };
      case 4: return { label: 'Navigate to Customer', icon: 'directions', action: handleNavigateCustomer };
      case 5: return { label: 'Enter Delivery OTP', icon: 'lock-open', action: handleReceiveDeliveryOTP };
      case 6: return { label: 'Complete Order', icon: 'check-circle', action: handleComplete };
      default: return { label: 'Continue', icon: 'arrow-forward', action: advanceStep };
    }
  };

  const stepAction = getStepAction();

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerSub}>ACTIVE MISSION</Text>
          <Text style={styles.headerTitle}>Delivery in Progress</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Badge */}
        <View style={styles.orderBadge}>
          <MaterialIcons name="local-shipping" size={16} color={theme.primary} />
          <Text style={styles.orderBadgeText}>Order #{orderId}</Text>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapCard}>
          <LinearGradient
            colors={['#e8f4f8', '#c8e6f0']}
            style={styles.mapGradient}
          >
            {/* Simplified map visual */}
            <View style={styles.mapContent}>
              <View style={styles.mapRoute}>
                <View style={[styles.mapPin, { backgroundColor: theme.primary }]}>
                  <MaterialIcons name="print" size={14} color="#FFF" />
                </View>
                <View style={styles.mapDashedLine} />
                <View style={[styles.mapPin, { backgroundColor: theme.success }]}>
                  <MaterialIcons name="home" size={14} color="#FFF" />
                </View>
              </View>
              <View style={styles.mapGrid}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={styles.mapGridLine} />
                ))}
              </View>
            </View>
          </LinearGradient>
          {/* ETA overlay */}
          <View style={styles.etaOverlay}>
            <View>
              <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
              <Text style={styles.etaValue}>
                4 mins <Text style={styles.etaSub}>(1.2 km)</Text>
              </Text>
            </View>
            <View style={styles.etaBtn}>
              <MaterialIcons name="near-me" size={22} color="#FFF" />
            </View>
          </View>
        </View>

        {/* Primary Action Button */}
        <Pressable
          style={({ pressed }) => [styles.primaryActionBtn, pressed && { opacity: 0.85 }]}
          onPress={stepAction.action}
        >
          <MaterialIcons name={stepAction.icon as any} size={20} color="#FFF" />
          <Text style={styles.primaryActionText}>{stepAction.label}</Text>
        </Pressable>

        {/* Secondary Action */}
        {currentStep === 1 && (
          <Pressable style={styles.secondaryActionBtn} onPress={handleEnterOTP}>
            <MaterialIcons name="qr-code-scanner" size={18} color={theme.textPrimary} />
            <Text style={styles.secondaryActionText}>Scan QR Instead</Text>
          </Pressable>
        )}

        {/* Workflow Track */}
        <View style={styles.workflowCard}>
          <View style={styles.workflowHeader}>
            <Text style={styles.workflowTitle}>Workflow Track</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                Step {Math.min(currentStep + 1, STEPS.length)} of {STEPS.length}
              </Text>
            </View>
          </View>

          <View style={styles.stepsList}>
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isPending = index > currentStep;

              return (
                <View key={index} style={styles.stepRow}>
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <View style={[styles.connector, isCompleted && styles.connectorDone]} />
                  )}

                  {/* Step dot */}
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.stepDotDone,
                      isActive && styles.stepDotActive,
                      isPending && styles.stepDotPending,
                    ]}
                  >
                    {isCompleted ? (
                      <MaterialIcons name="check" size={12} color="#FFF" />
                    ) : isActive ? (
                      <View style={styles.stepDotInner} />
                    ) : null}
                  </View>

                  {/* Step text */}
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isActive && styles.stepLabelActive,
                        isCompleted && styles.stepLabelDone,
                        isPending && styles.stepLabelPending,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {(isActive || isCompleted) && (
                      <Text style={styles.stepSub}>
                        {isCompleted ? 'Completed' : step.sub}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          {[
            { label: 'EFFICIENCY', value: '94%', icon: 'speed', color: theme.success },
            { label: 'SPEED', value: '24 km/h', icon: 'electric-bike', color: theme.primary },
            { label: 'NEXT SLOT', value: '15:10', icon: 'schedule', color: theme.warning },
          ].map((m, i) => (
            <View key={i} style={styles.metricCard}>
              <MaterialIcons name={m.icon as any} size={20} color={m.color} />
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Route Details */}
        <View style={styles.routeCard}>
          <Text style={styles.routeCardTitle}>Route Details</Text>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: theme.primary }]} />
            <View>
              <Text style={styles.routePointLabel}>PICKUP</Text>
              <Text style={styles.routePointValue}>{pickup}</Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: theme.success }]} />
            <View>
              <Text style={styles.routePointLabel}>DELIVERY</Text>
              <Text style={styles.routePointValue}>{delivery}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },

  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.primary}15`,
    borderWidth: 1,
    borderColor: `${theme.primary}30`,
  },
  orderBadgeText: { fontSize: 13, fontWeight: '700', color: theme.primary },

  mapCard: {
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    height: 200,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 14,
    ...theme.shadow.small,
  },
  mapGradient: { flex: 1 },
  mapContent: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  mapGrid: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.15,
  },
  mapGridLine: {
    width: '10%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#4A90E2',
    aspectRatio: 1,
  },
  mapRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    zIndex: 10,
  },
  mapPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.medium,
  },
  mapDashedLine: {
    flex: 1,
    width: 120,
    height: 3,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.primary,
    opacity: 0.6,
  },
  etaOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...theme.shadow.small,
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  etaValue: { fontSize: 18, fontWeight: '700', color: theme.primary },
  etaSub: { fontSize: 13, fontWeight: '400', color: theme.textSecondary },
  etaBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.primary,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 10,
    ...theme.shadow.medium,
  },
  primaryActionText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.backgroundSecondary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryActionText: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },

  workflowCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 4,
    marginBottom: 16,
    ...theme.shadow.small,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workflowTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  stepBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  stepBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  stepsList: { position: 'relative', gap: 0 },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingBottom: 20,
    position: 'relative',
  },

  connector: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: 0,
    width: 2,
    backgroundColor: theme.border,
  },
  connectorDone: { backgroundColor: theme.success },

  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    flexShrink: 0,
  },
  stepDotActive: { backgroundColor: theme.primary },
  stepDotDone: { backgroundColor: theme.success },
  stepDotPending: { backgroundColor: theme.border, borderWidth: 2, borderColor: theme.border },
  stepDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },

  stepContent: { flex: 1, paddingTop: 2 },
  stepLabel: { fontSize: 14, fontWeight: '600' },
  stepLabelActive: { color: theme.primary, fontWeight: '700' },
  stepLabelDone: { color: theme.success },
  stepLabelPending: { color: theme.textTertiary },
  stepSub: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },

  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  metricValue: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  metricLabel: { fontSize: 9, fontWeight: '700', color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },

  routeCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
    ...theme.shadow.small,
  },
  routeCardTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  routePointLabel: { fontSize: 10, fontWeight: '700', color: theme.textTertiary, letterSpacing: 0.8 },
  routePointValue: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  routeDivider: { height: 1, backgroundColor: theme.border, marginLeft: 24 },
});
