// Send Feedback Screen
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export default function FeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedType, setSelectedType] = useState<string>('general');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const feedbackTypes = [
    { id: 'bug', icon: 'bug-report', label: 'Bug Report' },
    { id: 'feature', icon: 'lightbulb', label: 'Feature Request' },
    { id: 'general', icon: 'chat', label: 'General Feedback' },
  ];

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted successfully. We appreciate your input!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Send Feedback</Text>
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
          We'd love to hear from you! Help us improve PrintT.
        </Text>

        {/* Feedback Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Feedback Type</Text>
          <View style={styles.typeContainer}>
            {feedbackTypes.map((type) => (
              <Pressable
                key={type.id}
                style={[styles.typeCard, selectedType === type.id && styles.typeCardActive]}
                onPress={() => setSelectedType(type.id)}
              >
                <MaterialIcons
                  name={type.icon as any}
                  size={24}
                  color={selectedType === type.id ? theme.primary : theme.textSecondary}
                />
                <Text style={[styles.typeLabel, selectedType === type.id && styles.typeLabelActive]}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.label}>How would you rate your experience?</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <MaterialIcons
                  name={star <= rating ? 'star' : 'star-border'}
                  size={40}
                  color={star <= rating ? '#F59E0B' : theme.textTertiary}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Feedback Text */}
        <View style={styles.section}>
          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us what you think..."
            multiline
            numberOfLines={6}
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
          <MaterialIcons name="send" size={20} color="#FFF" />
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 16,
    gap: 8,
  },
  typeCardActive: {
    borderColor: theme.primary,
    backgroundColor: '#F0F9FF',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  typeLabelActive: {
    color: theme.primary,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  textArea: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 15,
    color: theme.textPrimary,
    minHeight: 150,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.large,
    gap: 8,
    marginTop: 8,
    ...theme.shadow.medium,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
