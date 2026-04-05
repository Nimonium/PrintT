// Admin – Add New Printer Screen
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const ADMIN = '#7C3AED';
const ADMIN_DARK = '#5B21B6';
const ZONES = ['Zone 1 - Central', 'Zone 2 - Core', 'Zone 3 - Alpha', 'Zone 5 - Beta', 'Zone 7 - Delta'];
const MODELS = ['HP LaserJet Pro M404n', 'Canon imageCLASS LBP6030', 'Brother HL-L2340D', 'Epson EcoTank L3250', 'Samsung Xpress M2020'];

export default function AdminAddPrinterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    else if (serialNumber.trim().length < 4) newErrors.serialNumber = 'Enter a valid serial number';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!selectedZone) newErrors.zone = 'Select a zone';
    if (!selectedModel) newErrors.model = 'Select a model';
    if (ipAddress && !/^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress.trim())) {
      newErrors.ipAddress = 'Enter a valid IP address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      const printerID = `PRT-${Math.floor(100 + Math.random() * 900)}`;
      const msg = `Printer added successfully!\n\nID: ${printerID}\nSerial: ${serialNumber}\nLocation: ${location}\nZone: ${selectedZone}\nModel: ${selectedModel}${ipAddress ? `\nIP: ${ipAddress}` : ''}`;

      if (Platform.OS === 'web') {
        alert(`✓ ${msg}`);
        router.back();
      } else {
        Alert.alert('✓ Printer Added', msg, [{ text: 'Done', onPress: () => router.back() }]);
      }
    }, 1200);
  };

  const handleScanQR = () => {
    const generated = `PRT-SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setSerialNumber(generated);
    if (Platform.OS !== 'web') {
      Alert.alert('QR Scanned', `Serial number detected:\n${generated}`);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Printer</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 32, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Method selector */}
          <View style={styles.methodRow}>
            <Pressable style={styles.methodCard} onPress={handleScanQR}>
              <View style={styles.methodIconWrap}>
                <MaterialIcons name="qr-code-scanner" size={28} color={ADMIN} />
              </View>
              <Text style={styles.methodTitle}>Scan QR</Text>
              <Text style={styles.methodSub}>Auto-fill via QR</Text>
            </Pressable>
            <Pressable
              style={[styles.methodCard, styles.methodCardActive]}
              onPress={() => {}}
            >
              <View style={[styles.methodIconWrap, styles.methodIconActive]}>
                <MaterialIcons name="edit" size={28} color="#FFF" />
              </View>
              <Text style={[styles.methodTitle, { color: ADMIN }]}>Manual Entry</Text>
              <Text style={styles.methodSub}>Fill in details</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Device Information</Text>

            {/* Serial Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Serial Number *</Text>
              <View style={[styles.inputRow, errors.serialNumber ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. PRT-SN-A8F3D2"
                  placeholderTextColor={theme.textTertiary}
                  value={serialNumber}
                  onChangeText={(v) => { setSerialNumber(v); setErrors((e) => ({ ...e, serialNumber: '' })); }}
                  autoCapitalize="characters"
                  returnKeyType="next"
                />
                <Pressable onPress={handleScanQR}>
                  <MaterialIcons name="qr-code-scanner" size={20} color={ADMIN} />
                </Pressable>
              </View>
              {errors.serialNumber ? <Text style={styles.errorText}>{errors.serialNumber}</Text> : null}
            </View>

            {/* Model */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Printer Model *</Text>
              <View style={styles.chipGrid}>
                {MODELS.map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.chip, selectedModel === m && styles.chipActive]}
                    onPress={() => { setSelectedModel(m); setErrors((e) => ({ ...e, model: '' })); }}
                  >
                    <Text style={[styles.chipText, selectedModel === m && styles.chipTextActive]} numberOfLines={1}>
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
            </View>
          </View>

          {/* Location */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Location & Zone</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Physical Location *</Text>
              <View style={[styles.inputRow, errors.location ? styles.inputError : null]}>
                <MaterialIcons name="location-on" size={18} color={theme.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Main Library – Ground Floor"
                  placeholderTextColor={theme.textTertiary}
                  value={location}
                  onChangeText={(v) => { setLocation(v); setErrors((e) => ({ ...e, location: '' })); }}
                  returnKeyType="next"
                />
              </View>
              {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Zone *</Text>
              <View style={styles.chipGrid}>
                {ZONES.map((z) => (
                  <Pressable
                    key={z}
                    style={[styles.chip, selectedZone === z && styles.chipActive]}
                    onPress={() => { setSelectedZone(z); setErrors((e) => ({ ...e, zone: '' })); }}
                  >
                    <Text style={[styles.chipText, selectedZone === z && styles.chipTextActive]}>{z}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.zone ? <Text style={styles.errorText}>{errors.zone}</Text> : null}
            </View>
          </View>

          {/* Network */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Network (Optional)</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>IP Address</Text>
              <View style={[styles.inputRow, errors.ipAddress ? styles.inputError : null]}>
                <MaterialIcons name="wifi" size={18} color={theme.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 192.168.1.105"
                  placeholderTextColor={theme.textTertiary}
                  value={ipAddress}
                  onChangeText={(v) => { setIpAddress(v); setErrors((e) => ({ ...e, ipAddress: '' })); }}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
              {errors.ipAddress ? <Text style={styles.errorText}>{errors.ipAddress}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={[styles.inputRow, styles.textarea]}
                placeholder="Any additional setup notes…"
                placeholderTextColor={theme.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <Text style={styles.submitText}>Adding Printer…</Text>
              : (
                <>
                  <MaterialIcons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.submitText}>Add Printer to Fleet</Text>
                </>
              )}
          </Pressable>

          <Text style={styles.hint}>
            * Required fields. The printer will be added to the network and set to OFFLINE until connectivity is confirmed.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${ADMIN}10`,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary },

  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.borderRadius.large,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: theme.border,
    gap: 6,
  },
  methodCardActive: {
    borderColor: ADMIN,
    backgroundColor: `${ADMIN}08`,
  },
  methodIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${ADMIN}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  methodIconActive: { backgroundColor: ADMIN },
  methodTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  methodSub: { fontSize: 11, color: theme.textTertiary },

  formSection: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ADMIN,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.backgroundSecondary,
  },
  inputError: { borderColor: theme.error },
  input: { flex: 1, fontSize: 14, color: theme.textPrimary },
  textarea: {
    minHeight: 80,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  errorText: { fontSize: 12, color: theme.error, marginTop: 4 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.backgroundSecondary,
    maxWidth: '80%',
  },
  chipActive: { backgroundColor: ADMIN, borderColor: ADMIN },
  chipText: { fontSize: 12, fontWeight: '600', color: theme.textSecondary },
  chipTextActive: { color: '#FFF' },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: ADMIN,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.large,
    marginTop: 8,
    marginBottom: 16,
    ...theme.shadow.medium,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  hint: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
