// components/MapComponent.web.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface MapComponentProps {
  deliveryPartnerLocation: { latitude: number; longitude: number };
  userLocation: { latitude: number; longitude: number };
  style?: any;
}

export default function MapComponent({ deliveryPartnerLocation, userLocation, style }: MapComponentProps) {
  return (
    <View style={[styles.webMapPlaceholder, style]}>
      <View style={styles.webMapContent}>
        <MaterialIcons name="map" size={64} color={theme.textTertiary} />
        <Text style={styles.webMapText}>Live Map View</Text>
        <Text style={styles.webMapSubtext}>Available on mobile app</Text>
      </View>
      
      {/* Simulated markers for web */}
      <View style={[styles.deliveryMarker, styles.webDeliveryMarker]}>
        <MaterialIcons name="directions-bike" size={20} color="#FFF" />
      </View>
      <View style={[styles.userMarker, styles.webUserMarker]}>
        <MaterialIcons name="home" size={20} color="#FFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webMapContent: {
    alignItems: 'center',
    gap: 8,
  },
  webMapText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  webMapSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  webDeliveryMarker: {
    position: 'absolute',
    top: 80,
    left: 100,
  },
  webUserMarker: {
    position: 'absolute',
    bottom: 80,
    right: 100,
  },
  deliveryMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    ...theme.shadow.large,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    ...theme.shadow.medium,
  },
});
