// Default Print Settings Screen
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export default function PrintSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [paperSize, setPaperSize] = useState('a4');
  const [quality, setQuality] = useState(true);

  const handleSave = () => {
    Alert.alert('Success', 'Default print settings saved');
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Default Print Settings</Text>
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
          Set your preferred default settings for all print jobs
        </Text>

        {/* Color Mode */}
        <View style={styles.section}>
          <Text style={styles.label}>Print Color</Text>
          <View style={styles.segmentedControl}>
            <Pressable
              style={[styles.segment, colorMode === 'bw' && styles.segmentActive]}
              onPress={() => setColorMode('bw')}
            >
              <Text style={[styles.segmentText, colorMode === 'bw' && styles.segmentTextActive]}>
                B&W
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segment, colorMode === 'color' && styles.segmentActive]}
              onPress={() => setColorMode('color')}
            >
              <Text style={[styles.segmentText, colorMode === 'color' && styles.segmentTextActive]}>
                Color
              </Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>Black & White prints are more economical</Text>
        </View>

        {/* Paper Size */}
        <View style={styles.section}>
          <Text style={styles.label}>Page Size</Text>
          <View style={styles.optionsContainer}>
            {['a4', 'a5', 'letter', 'legal'].map((size) => (
              <Pressable
                key={size}
                style={[styles.option, paperSize === size && styles.optionActive]}
                onPress={() => setPaperSize(size)}
              >
                <MaterialIcons
                  name={paperSize === size ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={20}
                  color={paperSize === size ? theme.primary : theme.textTertiary}
                />
                <Text style={[styles.optionText, paperSize === size && styles.optionTextActive]}>
                  {size.toUpperCase()} {size === 'a4' && '(Standard)'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quality */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>High Quality Print</Text>
              <Text style={styles.toggleDescription}>Enhanced resolution and clarity</Text>
            </View>
            <Pressable
              style={[styles.toggle, quality && styles.toggleActive]}
              onPress={() => setQuality(!quality)}
            >
              <View style={[styles.toggleThumb, quality && styles.toggleThumbActive]} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Defaults</Text>
        </Pressable>
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
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.borderRadius.small,
  },
  segmentActive: {
    backgroundColor: '#FFF',
    ...theme.shadow.small,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  segmentTextActive: {
    color: theme.primary,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 8,
    marginLeft: 4,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionActive: {
    borderColor: theme.primary,
    backgroundColor: '#F0F9FF',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  optionTextActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    ...theme.shadow.small,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    marginTop: 16,
    ...theme.shadow.medium,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
