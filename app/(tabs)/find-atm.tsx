// Find ATM Screen - Interactive Map with Location Finder
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../constants/theme';

interface ATMLocation {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hours: string;
  status: 'available' | 'busy' | 'offline';
  features: string[];
}

const MOCK_ATM_LOCATIONS: ATMLocation[] = [
  {
    id: 'atm1',
    name: 'Downtown Station (A2)',
    address: '123 Main St, Los Angeles, CA 90012',
    distance: 0.6,
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    hours: 'Open 24/7',
    status: 'available',
    features: ['Color Printing', 'High Speed', 'Stapling'],
  },
  {
    id: 'atm2',
    name: 'University Campus (B4)',
    address: '456 College Ave, Los Angeles, CA 90024',
    distance: 1.2,
    coordinates: { latitude: 34.0689, longitude: -118.4452 },
    hours: 'Mon-Fri 7AM-10PM',
    status: 'available',
    features: ['Student Discount', 'Binding', 'Scanning'],
  },
  {
    id: 'atm3',
    name: 'Shopping Mall (C7)',
    address: '789 Market Blvd, Los Angeles, CA 90045',
    distance: 2.3,
    coordinates: { latitude: 33.9416, longitude: -118.4085 },
    hours: 'Open 10AM-9PM',
    status: 'busy',
    features: ['Color Printing', 'Lamination'],
  },
  {
    id: 'atm4',
    name: 'Airport Terminal (D1)',
    address: '1 World Way, Los Angeles, CA 90045',
    distance: 3.8,
    coordinates: { latitude: 33.9425, longitude: -118.4081 },
    hours: 'Open 24/7',
    status: 'available',
    features: ['Express Service', 'Multiple Currencies'],
  },
  {
    id: 'atm5',
    name: 'Business District (E3)',
    address: '555 Finance St, Los Angeles, CA 90071',
    distance: 4.5,
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    hours: 'Mon-Fri 6AM-8PM',
    status: 'offline',
    features: ['High Volume', 'Professional Binding'],
  },
];

export default function FindATMScreen() {
  const insets = useSafeAreaInsets();
  const [atmLocations, setAtmLocations] = useState<ATMLocation[]>(MOCK_ATM_LOCATIONS);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedATM, setSelectedATM] = useState<ATMLocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy'>('all');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        // Sort ATMs by distance from user
        sortATMsByDistance(location);
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const sortATMsByDistance = (location: Location.LocationObject) => {
    // In a real app, calculate actual distances
    const sorted = [...atmLocations].sort((a, b) => a.distance - b.distance);
    setAtmLocations(sorted);
  };

  const handleGetDirections = (atm: ATMLocation) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
      default: 'https://',
    });
    
    const url = Platform.select({
      ios: `${scheme}?q=${atm.coordinates.latitude},${atm.coordinates.longitude}&ll=${atm.coordinates.latitude},${atm.coordinates.longitude}`,
      android: `${scheme}${atm.coordinates.latitude},${atm.coordinates.longitude}?q=${atm.name}`,
      default: `https://www.google.com/maps/search/?api=1&query=${atm.coordinates.latitude},${atm.coordinates.longitude}`,
    });

    Linking.openURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'offline': return '#EF4444';
      default: return theme.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const filteredATMs = atmLocations.filter((atm) => {
    if (filterStatus === 'all') return true;
    return atm.status === filterStatus;
  });

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Find PrintT ATM</Text>
          <Text style={styles.headerSubtitle}>
            {filteredATMs.length} location{filteredATMs.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
        <Pressable
          style={styles.locationButton}
          onPress={requestLocationPermission}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <MaterialIcons name="my-location" size={24} color={theme.primary} />
          )}
        </Pressable>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          <Pressable
            style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
              All ({atmLocations.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filterStatus === 'available' && styles.filterChipActive]}
            onPress={() => setFilterStatus('available')}
          >
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.filterText, filterStatus === 'available' && styles.filterTextActive]}>
              Available ({atmLocations.filter(a => a.status === 'available').length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, filterStatus === 'busy' && styles.filterChipActive]}
            onPress={() => setFilterStatus('busy')}
          >
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.filterText, filterStatus === 'busy' && styles.filterTextActive]}>
              Busy ({atmLocations.filter(a => a.status === 'busy').length})
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* ATM List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredATMs.map((atm) => (
          <Pressable
            key={atm.id}
            style={[
              styles.atmCard,
              selectedATM?.id === atm.id && styles.atmCardSelected,
            ]}
            onPress={() => setSelectedATM(selectedATM?.id === atm.id ? null : atm)}
          >
            {/* ATM Header */}
            <View style={styles.atmHeader}>
              <View style={styles.atmIconContainer}>
                <MaterialIcons name="print" size={28} color={theme.primary} />
              </View>
              <View style={styles.atmMainInfo}>
                <View style={styles.atmTitleRow}>
                  <Text style={styles.atmName}>{atm.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(atm.status)}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(atm.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(atm.status) }]}>
                      {getStatusText(atm.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.atmMetaRow}>
                  <MaterialIcons name="location-on" size={14} color={theme.textSecondary} />
                  <Text style={styles.atmDistance}>{atm.distance.toFixed(1)} km away</Text>
                  <View style={styles.metaDivider} />
                  <MaterialIcons name="schedule" size={14} color={theme.textSecondary} />
                  <Text style={styles.atmHours}>{atm.hours}</Text>
                </View>
              </View>
            </View>

            {/* ATM Address */}
            <Text style={styles.atmAddress}>{atm.address}</Text>

            {/* Features */}
            {selectedATM?.id === atm.id && (
              <View style={styles.expandedContent}>
                <View style={styles.featuresSection}>
                  <Text style={styles.featuresLabel}>Features:</Text>
                  <View style={styles.featuresList}>
                    {atm.features.map((feature, index) => (
                      <View key={index} style={styles.featureChip}>
                        <MaterialIcons name="check-circle" size={14} color="#10B981" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => handleGetDirections(atm)}
                  >
                    <MaterialIcons name="directions" size={20} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Get Directions</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={() => {
                      // In real app, save as favorite
                    }}
                  >
                    <MaterialIcons name="bookmark-border" size={20} color={theme.primary} />
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        ))}

        {filteredATMs.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="location-off" size={64} color={theme.textTertiary} />
            <Text style={styles.emptyTitle}>No ATMs found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters or enable location</Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filtersList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContainer: {
    flex: 1,
  },
  atmCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  atmCardSelected: {
    borderColor: theme.primary,
    borderWidth: 2,
    ...theme.shadow.medium,
  },
  atmHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  atmIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  atmMainInfo: {
    flex: 1,
  },
  atmTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  atmName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.small,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  atmMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  atmDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: theme.border,
    marginHorizontal: 2,
  },
  atmHours: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  atmAddress: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 16,
  },
  featuresSection: {
    gap: 8,
  },
  featuresLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.small,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.medium,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  secondaryButton: {
    width: 48,
    backgroundColor: '#E3F2FD',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
