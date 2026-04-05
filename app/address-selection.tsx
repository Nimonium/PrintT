// Address Selection Screen - Manage Delivery Addresses
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../constants/theme';

type AddressType = 'home' | 'hostel' | 'office' | 'other';

interface SavedAddress {
  id: string;
  type: AddressType;
  label: string;
  address: string;
  pincode: string;
  isDefault: boolean;
}

const MOCK_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    address: '123 Sunshine Blvd, Los Angeles, CA',
    pincode: '90001',
    isDefault: true,
  },
  {
    id: '2',
    type: 'hostel',
    label: 'College Hostel',
    address: '456 University Ave, Los Angeles, CA',
    pincode: '90024',
    isDefault: false,
  },
];

export default function AddressSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(MOCK_SAVED_ADDRESSES);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Manual entry fields
  const [manualAddress, setManualAddress] = useState('');
  const [manualPincode, setManualPincode] = useState('');
  const [manualType, setManualType] = useState<AddressType>('home');

  const handleDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to detect your address');
        setIsDetectingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const detectedAddress = address[0];
        const fullAddress = [
          detectedAddress.street,
          detectedAddress.city,
          detectedAddress.region,
        ].filter(Boolean).join(', ');

        // Show detected address in manual entry
        setManualAddress(fullAddress);
        setManualPincode(detectedAddress.postalCode || '');
        setShowManualEntry(true);
      }

      setIsDetectingLocation(false);
    } catch (error) {
      console.error('Location detection error:', error);
      Alert.alert('Error', 'Failed to detect location. Please enter manually.');
      setIsDetectingLocation(false);
      setShowManualEntry(true);
    }
  };

  const handleSelectAddress = (address: SavedAddress) => {
    // Pass selected address back to delivery screen
    router.back();
    // In real app, you'd use context or params to pass data
  };

  const handleSaveManualAddress = () => {
    if (!manualAddress.trim() || !manualPincode.trim()) {
      Alert.alert('Incomplete', 'Please fill in all address fields');
      return;
    }

    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      type: manualType,
      label: manualType.charAt(0).toUpperCase() + manualType.slice(1),
      address: manualAddress,
      pincode: manualPincode,
      isDefault: savedAddresses.length === 0,
    };

    setSavedAddresses([...savedAddresses, newAddress]);
    setShowManualEntry(false);
    setManualAddress('');
    setManualPincode('');
    Alert.alert('Success', 'Address saved successfully');
  };

  const getAddressIcon = (type: AddressType) => {
    switch (type) {
      case 'home': return 'home';
      case 'hostel': return 'apartment';
      case 'office': return 'business';
      default: return 'location-on';
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Select Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable 
            style={styles.actionCard}
            onPress={handleDetectLocation}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <MaterialIcons name="my-location" size={32} color={theme.primary} />
            )}
            <Text style={styles.actionTitle}>Detect Location</Text>
            <Text style={styles.actionSubtitle}>Use GPS</Text>
          </Pressable>

          <Pressable 
            style={styles.actionCard}
            onPress={() => setShowManualEntry(!showManualEntry)}
          >
            <MaterialIcons name="edit-location" size={32} color="#10B981" />
            <Text style={styles.actionTitle}>Manual Entry</Text>
            <Text style={styles.actionSubtitle}>Type address</Text>
          </Pressable>
        </View>

        {/* Manual Entry Form */}
        {showManualEntry && (
          <View style={styles.manualEntryCard}>
            <View style={styles.manualEntryHeader}>
              <MaterialIcons name="edit" size={20} color={theme.primary} />
              <Text style={styles.manualEntryTitle}>Enter Address</Text>
            </View>

            {/* Address Type */}
            <Text style={styles.inputLabel}>Address Type</Text>
            <View style={styles.typeSelector}>
              {(['home', 'hostel', 'office', 'other'] as AddressType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeButton,
                    manualType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setManualType(type)}
                >
                  <MaterialIcons 
                    name={getAddressIcon(type) as any} 
                    size={18} 
                    color={manualType === type ? '#FFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    manualType === type && styles.typeButtonTextActive,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Street Address */}
            <Text style={styles.inputLabel}>Street Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your complete address"
              placeholderTextColor={theme.textTertiary}
              value={manualAddress}
              onChangeText={setManualAddress}
              multiline
              numberOfLines={2}
            />

            {/* Pincode */}
            <Text style={styles.inputLabel}>Pincode</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pincode"
              placeholderTextColor={theme.textTertiary}
              value={manualPincode}
              onChangeText={setManualPincode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {/* Save Button */}
            <Pressable style={styles.saveButton} onPress={handleSaveManualAddress}>
              <MaterialIcons name="check" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Save Address</Text>
            </Pressable>
          </View>
        )}

        {/* Saved Addresses */}
        <View style={styles.savedSection}>
          <View style={styles.savedHeader}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{savedAddresses.length}</Text>
            </View>
          </View>

          {savedAddresses.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="location-off" size={48} color={theme.textTertiary} />
              <Text style={styles.emptyText}>No saved addresses</Text>
              <Text style={styles.emptySubtext}>Add your first address to continue</Text>
            </View>
          ) : (
            <View style={styles.addressList}>
              {savedAddresses.map((address) => (
                <Pressable
                  key={address.id}
                  style={[
                    styles.addressCard,
                    address.isDefault && styles.addressCardDefault,
                  ]}
                  onPress={() => handleSelectAddress(address)}
                >
                  <View style={styles.addressIcon}>
                    <MaterialIcons 
                      name={getAddressIcon(address.type) as any} 
                      size={24} 
                      color={address.isDefault ? theme.primary : theme.textSecondary} 
                    />
                  </View>

                  <View style={styles.addressContent}>
                    <View style={styles.addressLabelRow}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {address.address}
                    </Text>
                    <Text style={styles.addressPincode}>PIN: {address.pincode}</Text>
                  </View>

                  <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
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
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  actionSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  manualEntryCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  manualEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  manualEntryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.backgroundSecondary,
  },
  typeButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  input: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    padding: 14,
    fontSize: 15,
    color: theme.textPrimary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.medium,
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  savedSection: {
    marginBottom: 24,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  countBadge: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  addressList: {
    gap: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  addressCardDefault: {
    borderColor: theme.primary,
    borderWidth: 2,
    backgroundColor: '#F8FAFB',
  },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flex: 1,
    gap: 4,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.small,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  addressText: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  addressPincode: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textTertiary,
  },
});
