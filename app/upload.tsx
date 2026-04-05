// Upload Document Screen
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../constants/theme';
import { usePrint } from '../contexts/PrintContext';

export default function UploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uploadDocument, loading } = usePrint();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhoneStorage = async () => {
    try {
      setIsProcessing(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      const file = result.assets && result.assets[0];
      if (!file) {
        setIsProcessing(false);
        return;
      }

      // Simulate real-time scanning/processing
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const fileName = file.name || 'document';
      const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
      
      // Extract exact page count for PDF
      let exactPages: number | null = null;
      if (file.mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        try {
          const response = await fetch(file.uri);
          const text = await response.text();
          
          let foundCount = 0;
          // First try to find /Count n
          const countMatches = text.match(/\/Count\s+(\d+)/g);
          if (countMatches && countMatches.length > 0) {
            const counts = countMatches.map(m => parseInt(m.match(/\d+/)![0], 10));
            // The largest /Count usually represents the root Pages dictionary
            foundCount = Math.max(...counts);
          }
          
          if (foundCount > 0 && foundCount < 1000) {
            exactPages = foundCount;
          } else {
            // Fallback to counting /Type /Page
            const typePageMatches = text.match(/\/Type\s*\/Page\b/gi);
            if (typePageMatches && typePageMatches.length > 0) {
              exactPages = typePageMatches.length;
            }
          }
        } catch (e) {
          console.log("PDF parse error:", e);
        }
      }

      // Final page count
      // For images, default to 1. For docs/pdfs where parsing failed, default to 1.
      let estimatedPages = exactPages || 1;
      // If it's a huge file and we couldn't parse it, maybe add more pages, 
      // but the user specifically said they provided 1 page, so we should trust '1' as a better fallback.
      if (!exactPages && !isImage && file.size && file.size > 2 * 1024 * 1024) estimatedPages = 1; 

      const fileData = {
        name: fileName,
        size: file.size ? file.size / (1024 * 1024) : 0,
        uri: file.uri,
        type: (file.mimeType || '').includes('pdf') ? 'pdf' : (isImage ? 'image' : 'doc'),
        pages: estimatedPages,
      };

      await uploadDocument(fileData);
      setIsProcessing(false);
      router.push('/settings');
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const handleCameraScan = async () => {
    try {
      setIsProcessing(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permission.granted) {
        setIsProcessing(false);
        Alert.alert('Permission Required', 'Camera access is needed to scan documents');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      const image = result.assets && result.assets[0];
      if (!image) {
        setIsProcessing(false);
        return;
      }

      const fileData = {
        name: `Scanned_${new Date().getTime()}.jpg`,
        size: image.fileSize ? image.fileSize / (1024 * 1024) : 0.5,
        uri: image.uri,
        type: 'image',
        pages: 1,
      };

      await uploadDocument(fileData);
      setIsProcessing(false);
      router.push('/settings');
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to scan document. Please try again.');
    }
  };

  const handleCloudDrive = async () => {
    setIsProcessing(true);
    // Simulate cloud drive selection
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Cloud Drive',
        'Select cloud storage provider:',
        [
          {
            text: 'Google Drive',
            onPress: async () => {
              setIsProcessing(true);
              // Mock cloud file
              const fileData = {
                name: 'Document_from_Drive.pdf',
                size: 1.8,
                uri: 'cloud://drive/file.pdf',
                type: 'pdf',
                pages: 1,
              };
              await uploadDocument(fileData);
              setIsProcessing(false);
              router.push('/settings');
            },
          },
          {
            text: 'Dropbox',
            onPress: async () => {
              Alert.alert('Coming Soon', 'Dropbox integration will be available soon');
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }, 300);
  };

  const handleUpload = async (source: string) => {
    if (isProcessing || loading) return;

    switch (source) {
      case 'phone':
        await handlePhoneStorage();
        break;
      case 'camera':
        await handleCameraScan();
        break;
      case 'cloud':
        await handleCloudDrive();
        break;
      default:
        Alert.alert('Error', 'Unknown upload source');
    }
  };

  const uploadOptions = [
    {
      id: 'phone',
      icon: 'smartphone',
      title: 'Phone Storage',
      description: 'Files, Downloads, Gallery',
      color: '#1976D2',
      bgColor: '#E3F2FD',
    },
    {
      id: 'camera',
      icon: 'document-scanner',
      title: 'Camera Scan',
      description: 'Scan physical documents',
      color: '#388E3C',
      bgColor: '#E8F5E9',
    },
    {
      id: 'cloud',
      icon: 'cloud-upload',
      title: 'Cloud Drive',
      description: 'Google Drive, Dropbox, iCloud',
      color: '#7B1FA2',
      bgColor: '#F3E5F5',
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Document</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <MaterialIcons name="print" size={64} color={theme.primary} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Select Source</Text>
          <Text style={styles.instructionsText}>
            Choose how you want to upload your document for printing.
          </Text>
        </View>

        {/* Upload Options */}
        <View style={styles.optionsContainer}>
          {uploadOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.optionCard, (loading || isProcessing) && styles.optionCardDisabled]}
              onPress={() => handleUpload(option.id)}
              disabled={loading || isProcessing}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
                <MaterialIcons name={option.icon as any} size={32} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {(loading || isProcessing) ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Supported Formats */}
        <View style={styles.formatsContainer}>
          <Text style={styles.formatsLabel}>Supported Formats</Text>
          <View style={styles.formatsList}>
            {['PDF', 'DOCX', 'JPG', 'PNG'].map((format) => (
              <View key={format} style={styles.formatChip}>
                <Text style={styles.formatText}>{format}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructions: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  formatsContainer: {
    marginTop: 'auto',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  formatsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  formatsList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  formatChip: {
    alignItems: 'center',
  },
  formatText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textTertiary,
  },
});
