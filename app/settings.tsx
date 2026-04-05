// Print Configuration Screen - Fixed Custom Range Implementation
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { usePrint } from '../contexts/PrintContext';

type ColorMode = 'bw' | 'color';
type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal';
type PageRangeMode = 'all' | 'custom';

const PAGE_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (Standard)', price: 1.0 },
  { value: 'A3', label: 'A3 (Large)', price: 2.0 },
  { value: 'Letter', label: 'Letter (8.5" x 11")', price: 1.0 },
  { value: 'Legal', label: 'Legal (8.5" x 14")', price: 1.5 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentJob, updatePrintSettings } = usePrint();
  
  const [colorMode, setColorMode] = useState<ColorMode>('bw');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [pageSizeModalVisible, setPageSizeModalVisible] = useState(false);
  const [copies, setCopies] = useState(1);
  const [pageRangeMode, setPageRangeMode] = useState<PageRangeMode>('all');
  const [customPageRange, setCustomPageRange] = useState('');
  const [pageRangeError, setPageRangeError] = useState('');
  const [validatedPageCount, setValidatedPageCount] = useState(0);
  const [highQuality, setHighQuality] = useState(true);
  const [pageCountModalVisible, setPageCountModalVisible] = useState(false);
  const [tempPageCount, setTempPageCount] = useState('');

  // Pure function - no state updates
  const parsePageRange = (rangeString: string, totalPages: number): { pages: number; error: string } => {
    if (!rangeString.trim()) {
      return { pages: 0, error: 'Please enter a page range' };
    }

    try {
      const ranges = rangeString.split(',').map(r => r.trim()).filter(r => r);
      let totalPagesCount = 0;
      const seenPages = new Set<number>();

      for (const range of ranges) {
        // Check for invalid characters
        if (!/^[\d\s-]+$/.test(range)) {
          return { pages: 0, error: 'Only numbers, hyphens, and commas allowed' };
        }

        if (range.includes('-')) {
          // Range format: "1-5"
          const parts = range.split('-');
          if (parts.length !== 2) {
            return { pages: 0, error: `Invalid range format: ${range}` };
          }

          const start = parseInt(parts[0].trim());
          const end = parseInt(parts[1].trim());

          if (isNaN(start) || isNaN(end)) {
            return { pages: 0, error: `Invalid numbers in range: ${range}` };
          }

          if (start < 1) {
            return { pages: 0, error: 'Page numbers must start from 1' };
          }

          if (end > totalPages) {
            return { pages: 0, error: `Page ${end} exceeds document pages (${totalPages})` };
          }

          if (start > end) {
            return { pages: 0, error: `Invalid range: ${start}-${end} (start > end)` };
          }

          // Add pages from range
          for (let i = start; i <= end; i++) {
            seenPages.add(i);
          }
        } else {
          // Single page
          const page = parseInt(range.trim());

          if (isNaN(page)) {
            return { pages: 0, error: `Invalid page number: ${range}` };
          }

          if (page < 1) {
            return { pages: 0, error: 'Page numbers must be at least 1' };
          }

          if (page > totalPages) {
            return { pages: 0, error: `Page ${page} exceeds document pages (${totalPages})` };
          }

          seenPages.add(page);
        }
      }

      return { pages: seenPages.size, error: '' };
    } catch (error) {
      console.error('Page range parsing error:', error);
      return { pages: 0, error: 'Invalid format. Use: 1-5, 7, 10-12' };
    }
  };

  // Validate and update page count when custom range changes
  useEffect(() => {
    if (!currentJob) return;

    if (pageRangeMode === 'custom') {
      const result = parsePageRange(customPageRange, currentJob.totalPages);
      setPageRangeError(result.error);
      setValidatedPageCount(result.pages);
    } else {
      setPageRangeError('');
      setValidatedPageCount(currentJob.totalPages);
    }
  }, [customPageRange, pageRangeMode, currentJob]);

  // Calculate pages to print
  const getPagesToPrint = (): number => {
    if (!currentJob) return 0;
    
    if (pageRangeMode === 'all') {
      return currentJob.totalPages;
    }

    // For custom mode, use validated count
    return validatedPageCount;
  };

  // Calculate price in real-time
  const calculatePrice = () => {
    if (!currentJob) return { total: 0, breakdown: { base: 0, size: 0, quality: 0, copies: 0 }, perPage: 0, pages: 0 };
    
    const pagesToPrint = getPagesToPrint();
    if (pagesToPrint === 0) return { total: 0, breakdown: { base: 0, size: 0, quality: 0, copies: 0 }, perPage: 0, pages: 0 };

    // Base price per page (in Rupees)
    const basePrice = colorMode === 'bw' ? 2.00 : 10.00;
    
    // Page size multiplier
    const sizeOption = PAGE_SIZE_OPTIONS.find(opt => opt.value === pageSize);
    const sizeMultiplier = sizeOption?.price || 1.0;
    
    // Quality multiplier
    const qualityMultiplier = highQuality ? 1.2 : 1.0;
    
    // Calculate breakdown
    const baseTotal = basePrice * pagesToPrint;
    const sizeAdjustment = baseTotal * (sizeMultiplier - 1);
    const qualityAdjustment = baseTotal * (qualityMultiplier - 1);
    const copiesMultiplier = copies;
    
    const subtotal = baseTotal * sizeMultiplier * qualityMultiplier;
    const total = subtotal * copiesMultiplier;
    
    return {
      total,
      breakdown: {
        base: baseTotal,
        size: sizeAdjustment,
        quality: qualityAdjustment,
        copies: copiesMultiplier,
      },
      perPage: (subtotal / pagesToPrint),
      pages: pagesToPrint,
    };
  };

  const priceInfo = calculatePrice();

  if (!currentJob) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={64} color={theme.textTertiary} />
          <Text style={styles.emptyText}>No document selected</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handlePageRangeModeChange = (mode: PageRangeMode) => {
    setPageRangeMode(mode);
    if (mode === 'all') {
      setCustomPageRange('');
      setPageRangeError('');
      setValidatedPageCount(currentJob.totalPages);
    }
  };

  const handleCustomRangeChange = (text: string) => {
    setCustomPageRange(text);
    // Validation happens in useEffect
  };

  const handleCorrectPageCount = () => {
    const count = parseInt(tempPageCount);
    if (!isNaN(count) && count > 0) {
      updatePrintSettings({ totalPages: count });
      setPageCountModalVisible(false);
    }
  };

  const handleProceed = () => {
    // Final validation before proceeding
    if (pageRangeMode === 'custom' && (pageRangeError || validatedPageCount === 0)) {
      return;
    }

    if (priceInfo.total === 0) {
      return;
    }

    updatePrintSettings({
      colorMode: colorMode === 'bw' ? 'bw' : 'color',
      paperSize: pageSize.toLowerCase() as any,
      copies,
      highQuality,
    });
    router.push('/delivery');
  };

  const isValidForProceed = priceInfo.total > 0 && (pageRangeMode === 'all' || (pageRangeMode === 'custom' && !pageRangeError && validatedPageCount > 0));

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Print Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Info */}
        <View style={styles.documentCard}>
          <View style={styles.documentIcon}>
            <MaterialIcons 
              name={currentJob.fileType === 'pdf' ? 'picture-as-pdf' : 'description'} 
              size={24} 
              color={theme.primary} 
            />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={1}>
              {currentJob.fileName}
            </Text>
            <Text style={styles.documentDetails}>
              {currentJob.totalPages} pages • {currentJob.fileSize.toFixed(1)} MB
            </Text>
          </View>
          <Pressable 
            style={styles.editButton}
            onPress={() => {
              setTempPageCount(currentJob.totalPages.toString());
              setPageCountModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={20} color={theme.primary} />
          </Pressable>
        </View>

        {/* Color Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Print Color</Text>
          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleButton,
                colorMode === 'bw' && styles.toggleButtonActive,
              ]}
              onPress={() => setColorMode('bw')}
            >
              <MaterialIcons 
                name="contrast" 
                size={20} 
                color={colorMode === 'bw' ? theme.primary : theme.textSecondary} 
              />
              <Text style={[
                styles.toggleButtonText,
                colorMode === 'bw' && styles.toggleButtonTextActive,
              ]}>
                B&W (₹2/pg)
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                colorMode === 'color' && styles.toggleButtonActive,
              ]}
              onPress={() => setColorMode('color')}
            >
              <MaterialIcons 
                name="palette" 
                size={20} 
                color={colorMode === 'color' ? theme.primary : theme.textSecondary} 
              />
              <Text style={[
                styles.toggleButtonText,
                colorMode === 'color' && styles.toggleButtonTextActive,
              ]}>
                Color (₹10/pg)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Page Size */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Page Size</Text>
          <Pressable 
            style={styles.selectContainer}
            onPress={() => setPageSizeModalVisible(true)}
          >
            <View style={styles.selectContent}>
              <MaterialIcons name="aspect-ratio" size={20} color={theme.textSecondary} />
              <Text style={styles.selectValue}>
                {PAGE_SIZE_OPTIONS.find(opt => opt.value === pageSize)?.label}
              </Text>
            </View>
            <MaterialIcons name="expand-more" size={24} color={theme.textTertiary} />
          </Pressable>
        </View>

        {/* Page Range */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Page Range</Text>
          
          <View style={styles.rangeToggleContainer}>
            <Pressable
              style={[
                styles.rangeToggleButton,
                pageRangeMode === 'all' && styles.rangeToggleButtonActive,
              ]}
              onPress={() => handlePageRangeModeChange('all')}
            >
              <Text style={[
                styles.rangeToggleText,
                pageRangeMode === 'all' && styles.rangeToggleTextActive,
              ]}>
                All Pages ({currentJob.totalPages})
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.rangeToggleButton,
                pageRangeMode === 'custom' && styles.rangeToggleButtonActive,
              ]}
              onPress={() => handlePageRangeModeChange('custom')}
            >
              <Text style={[
                styles.rangeToggleText,
                pageRangeMode === 'custom' && styles.rangeToggleTextActive,
              ]}>
                Custom Range
              </Text>
            </Pressable>
          </View>

          {/* Custom Range Input - Accordion Style */}
          {pageRangeMode === 'custom' && (
            <View style={styles.customRangeContainer}>
              <View style={styles.customRangeCard}>
                <View style={styles.customRangeHeader}>
                  <MaterialIcons name="edit" size={18} color={theme.primary} />
                  <Text style={styles.customRangeTitle}>Enter Page Range</Text>
                </View>

                <TextInput
                  style={[
                    styles.customRangeInput,
                    pageRangeError && styles.customRangeInputError,
                  ]}
                  placeholder="Example: 1-5, 7, 10-12"
                  placeholderTextColor={theme.textTertiary}
                  value={customPageRange}
                  onChangeText={handleCustomRangeChange}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Error Message */}
                {pageRangeError ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{pageRangeError}</Text>
                  </View>
                ) : customPageRange && validatedPageCount > 0 ? (
                  <View style={styles.successContainer}>
                    <MaterialIcons name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.successText}>
                      {validatedPageCount} {validatedPageCount === 1 ? 'page' : 'pages'} selected
                    </Text>
                  </View>
                ) : null}

                {/* Helper Examples */}
                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesLabel}>Valid formats:</Text>
                  <View style={styles.examplesList}>
                    <View style={styles.exampleItem}>
                      <MaterialIcons name="check" size={14} color="#10B981" />
                      <Text style={styles.exampleText}>Single page: 3</Text>
                    </View>
                    <View style={styles.exampleItem}>
                      <MaterialIcons name="check" size={14} color="#10B981" />
                      <Text style={styles.exampleText}>Range: 1-5</Text>
                    </View>
                    <View style={styles.exampleItem}>
                      <MaterialIcons name="check" size={14} color="#10B981" />
                      <Text style={styles.exampleText}>Multiple: 1-3, 7, 10-12</Text>
                    </View>
                  </View>
                  <Text style={styles.maxPagesNote}>
                    Maximum: {currentJob.totalPages} pages
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Copies */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Number of Copies</Text>
          <View style={styles.counterContainer}>
            <Pressable
              style={[styles.counterButton, copies <= 1 && styles.counterButtonDisabled]}
              onPress={() => setCopies(Math.max(1, copies - 1))}
              disabled={copies <= 1}
            >
              <MaterialIcons 
                name="remove" 
                size={24} 
                color={copies <= 1 ? theme.textTertiary : theme.primary} 
              />
            </Pressable>
            <View style={styles.counterValueContainer}>
              <Text style={styles.counterValue}>{copies}</Text>
              <Text style={styles.counterLabel}>copies</Text>
            </View>
            <Pressable
              style={[styles.counterButton, copies >= 10 && styles.counterButtonDisabled]}
              onPress={() => setCopies(Math.min(10, copies + 1))}
              disabled={copies >= 10}
            >
              <MaterialIcons 
                name="add" 
                size={24} 
                color={copies >= 10 ? theme.textTertiary : theme.primary} 
              />
            </Pressable>
          </View>
        </View>

        {/* High Quality */}
        <Pressable
          style={styles.qualityCard}
          onPress={() => setHighQuality(!highQuality)}
        >
          <View style={styles.qualityContent}>
            <MaterialIcons name="high-quality" size={24} color={highQuality ? theme.primary : theme.textSecondary} />
            <View style={styles.qualityTextContainer}>
              <Text style={styles.qualityLabel}>High Quality Print</Text>
              <Text style={styles.qualityDescription}>Enhanced resolution (+20%)</Text>
            </View>
          </View>
          <View style={[styles.switch, highQuality && styles.switchActive]}>
            <View style={[styles.switchThumb, highQuality && styles.switchThumbActive]} />
          </View>
        </Pressable>

        {/* Price Breakdown */}
        {priceInfo.pages > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Price Calculation</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                {priceInfo.pages} pages × ₹{priceInfo.perPage.toFixed(2)}/page
              </Text>
              <Text style={styles.breakdownValue}>₹{(priceInfo.perPage * priceInfo.pages).toFixed(2)}</Text>
            </View>
            {copies > 1 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>× {copies} copies</Text>
                <Text style={styles.breakdownValue}>×{copies}</Text>
              </View>
            )}
            {highQuality && (
              <View style={styles.breakdownHighlight}>
                <MaterialIcons name="auto-awesome" size={14} color="#F59E0B" />
                <Text style={styles.breakdownHighlightText}>High quality active</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>
              ₹{priceInfo.total.toFixed(2)}
            </Text>
            {priceInfo.pages > 0 && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  {priceInfo.pages} {priceInfo.pages === 1 ? 'page' : 'pages'}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Pressable 
          style={[
            styles.proceedButton,
            !isValidForProceed && styles.proceedButtonDisabled,
          ]} 
          onPress={handleProceed}
          disabled={!isValidForProceed}
        >
          <Text style={styles.proceedButtonText}>Continue to Delivery</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>

      {/* Page Size Modal */}
      <Modal
        visible={pageSizeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPageSizeModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setPageSizeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Page Size</Text>
              <Pressable onPress={() => setPageSizeModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>
            
            <View style={styles.modalOptions}>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    pageSize === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setPageSize(option.value as PageSize);
                    setPageSizeModalVisible(false);
                  }}
                >
                  <View style={styles.modalOptionContent}>
                    <Text style={[
                      styles.modalOptionText,
                      pageSize === option.value && styles.modalOptionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <View style={styles.modalOptionPriceBadge}>
                      <Text style={styles.modalOptionPriceText}>×{option.price.toFixed(1)}</Text>
                    </View>
                  </View>
                  {pageSize === option.value && (
                    <MaterialIcons name="check-circle" size={24} color={theme.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Page Count Correction Modal */}
      <Modal
        visible={pageCountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPageCountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <Text style={styles.modalTitle}>Correct Page Count</Text>
            <Text style={styles.modalSubTitle}>Enter the actual number of pages in your document.</Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempPageCount}
              onChangeText={setTempPageCount}
              keyboardType="number-pad"
              autoFocus
              placeholder="Number of pages"
            />
            
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => setPageCountModalVisible(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonPrimary]} 
                onPress={handleCorrectPageCount}
              >
                <Text style={styles.modalButtonTextPrimary}>Update</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFF',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  emptyButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.medium,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: theme.borderRadius.large,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  documentDetails: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.small,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF',
    ...theme.shadow.small,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  toggleButtonTextActive: {
    fontWeight: '700',
    color: theme.primary,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  rangeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeToggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  rangeToggleButtonActive: {
    borderColor: theme.primary,
    backgroundColor: '#E3F2FD',
  },
  rangeToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  rangeToggleTextActive: {
    color: theme.primary,
    fontWeight: '700',
  },
  customRangeContainer: {
    marginTop: 12,
  },
  customRangeCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  customRangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  customRangeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  customRangeInput: {
    backgroundColor: theme.backgroundSecondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.border,
    fontSize: 15,
    color: theme.textPrimary,
  },
  customRangeInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  examplesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  examplesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  examplesList: {
    gap: 6,
    marginBottom: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exampleText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: 'monospace',
  },
  maxPagesNote: {
    fontSize: 11,
    color: theme.textTertiary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  counterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.backgroundSecondary,
  },
  counterButtonDisabled: {
    opacity: 0.3,
  },
  counterValueContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  counterLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  qualityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
  },
  qualityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  qualityTextContainer: {
    flex: 1,
  },
  qualityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  qualityDescription: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  switch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.backgroundSecondary,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: theme.primary,
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    ...theme.shadow.small,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  breakdownCard: {
    backgroundColor: '#F8FAFB',
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  breakdownHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.small,
  },
  breakdownHighlightText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: 24,
    paddingTop: 16,
    ...theme.shadow.large,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.primary,
  },
  priceBadge: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.large,
    gap: 8,
    ...theme.shadow.medium,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalContentSmall: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 24,
    ...theme.shadow.large,
  },
  modalSubTitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: theme.primary,
  },
  modalButtonSecondary: {
    backgroundColor: theme.backgroundSecondary,
  },
  modalButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  modalOptions: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.border,
  },
  modalOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: '#E3F2FD',
  },
  modalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  modalOptionTextSelected: {
    color: theme.primary,
    fontWeight: '700',
  },
  modalOptionPriceBadge: {
    backgroundColor: theme.backgroundSecondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.small,
  },
  modalOptionPriceText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});
