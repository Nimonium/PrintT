// Help & FAQ Screen
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: 'How do I print my document?',
      answer: 'Upload your document, select print settings, make payment, and you\'ll receive a 6-digit OTP. Enter this OTP at any PrintT ATM to collect your prints.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, DOCX, JPG, and PNG files up to 50MB in size.',
    },
    {
      question: 'How long is my OTP valid?',
      answer: 'Your print OTP is valid for 5 minutes after payment. Make sure to print within this time.',
    },
    {
      question: 'What if my OTP expires?',
      answer: 'If your OTP expires, you can request a new one from the Activity screen. Your payment is saved.',
    },
    {
      question: 'Where can I find PrintT ATMs?',
      answer: 'Use the "Find ATM" tab to see all nearby PrintT locations on the map.',
    },
    {
      question: 'Is my document stored after printing?',
      answer: 'No. For your privacy, all documents are automatically deleted immediately after successful printing.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept UPI, credit/debit cards, and digital wallets like Google Pay and PhonePe.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Help */}
        <View style={styles.quickHelp}>
          <MaterialIcons name="support-agent" size={48} color={theme.primary} />
          <Text style={styles.quickHelpTitle}>Need immediate help?</Text>
          <Text style={styles.quickHelpText}>
            Contact our support team 24/7
          </Text>
          <View style={styles.contactButtons}>
            <Pressable style={styles.contactButton}>
              <MaterialIcons name="email" size={20} color={theme.primary} />
              <Text style={styles.contactButtonText}>Email Us</Text>
            </Pressable>
            <Pressable style={styles.contactButton}>
              <MaterialIcons name="phone" size={20} color={theme.primary} />
              <Text style={styles.contactButtonText}>Call</Text>
            </Pressable>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.faqsTitle}>Frequently Asked Questions</Text>
        
        {faqs.map((faq, index) => (
          <Pressable
            key={index}
            style={styles.faqCard}
            onPress={() => toggleFAQ(index)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <MaterialIcons
                name={expandedIndex === index ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.textSecondary}
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </Pressable>
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
  quickHelp: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 24,
    marginTop: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.border,
  },
  quickHelpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  quickHelpText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.medium,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  faqsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
