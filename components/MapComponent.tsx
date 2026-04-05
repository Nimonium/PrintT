// components/MapComponent.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface MapComponentProps {
  deliveryPartnerLocation: { latitude: number; longitude: number };
  userLocation: { latitude: number; longitude: number };
  style?: any;
}

export default function MapComponent({ deliveryPartnerLocation, userLocation, style }: MapComponentProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style]}
      initialRegion={{
        latitude: (deliveryPartnerLocation.latitude + userLocation.latitude) / 2,
        longitude: (deliveryPartnerLocation.longitude + userLocation.longitude) / 2,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {/* Delivery Partner Marker */}
      <Marker coordinate={deliveryPartnerLocation}>
        <View style={styles.deliveryMarker}>
          <MaterialIcons name="directions-bike" size={20} color="#FFF" />
        </View>
      </Marker>

      {/* User Location Marker */}
      <Marker coordinate={userLocation}>
        <View style={styles.userMarker}>
          <MaterialIcons name="home" size={20} color="#FFF" />
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
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
