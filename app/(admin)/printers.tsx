// Admin Printers Management Screen
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const ADMIN = '#7C3AED';

export default function AdminPrintersScreen() {
  const insets = useSafeAreaInsets();

  const handleAddPrinter = () => {
    if (Platform.OS === 'web') {
      const method = window.confirm('Add New Printer\n\nClick OK to scan QR code, or Cancel to enter manually');
      if (method) {
        alert('📷 QR Code Scanner\n\nPosition the QR code within the camera frame. The printer details will be automatically detected and configured.\n\nSupported formats:\n• QR Code (recommended)\n• Barcode\n• NFC tag');
      } else {
        const serialNumber = prompt('Enter Printer Serial Number:');
        if (!serialNumber) return;
        const location = prompt('Enter Printer Location:');
        if (!location) return;
        const model = prompt('Enter Printer Model:', 'HP LaserJet Pro');
        if (!model) return;
        alert(`✓ Printer Added Successfully!\n\nSerial: ${serialNumber}\nLocation: ${location}\nModel: ${model}\n\nThe printer has been added to the network and is now ready for configuration. Network settings and permissions can be adjusted in the edit menu.`);
      }
    } else {
      Alert.alert(
        'Add New Printer',
        'Choose a method to add printer:',
        [
          {
            text: 'Scan QR Code',
            onPress: () => Alert.alert(
              '📷 QR Scanner',
              'Position the QR code within the camera frame. The printer details will be automatically detected and configured.\n\nSupported formats:\n• QR Code (recommended)\n• Barcode\n• NFC tag'
            )
          },
          {
            text: 'Manual Entry',
            onPress: () => Alert.alert(
              'Manual Entry',
              'Serial Number: ________\nLocation/Zone: ________\nModel: ________\nIP Address: __.__.__.___\n\nIn production, this would open a form to enter all printer configuration details including network settings, permissions, and maintenance schedule.'
            )
          },
          {
            text: 'Auto-Detect',
            onPress: () => Alert.alert(
              '🔍 Network Scan',
              'Scanning local network for available printers...\n\nFound devices:\n• HP-PRO-A4 (192.168.1.105)\n• Canon-MX920 (192.168.1.108)\n• Brother-HL2340 (192.168.1.112)\n\nSelect a device to configure.'
            )
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const printers = [
    { id: 'PRT-001', location: 'Main Library', status: 'online' },
    { id: 'PRT-042', location: 'South Wing Hub', status: 'offline' },
    { id: 'PRT-089', location: 'Logistics Annex', status: 'online' },
    { id: 'PRT-112', location: 'Admin Block B', status: 'warning' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.success;
      case 'offline': return theme.textSecondary;
      case 'warning': return theme.warning;
      default: return theme.textSecondary;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Printer Fleet</Text>
        <Pressable 
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
          ]}
          onPress={handleAddPrinter}
        >
          <MaterialIcons name="add" size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.printersList}>
          {printers.map((printer) => (
            <View key={printer.id} style={styles.printerCard}>
              <View style={styles.printerHeader}>
                <View>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(printer.status) }]} />
                    <Text style={styles.statusLabel}>{printer.status.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.printerId}>{printer.id}</Text>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={14} color={theme.textSecondary} />
                    <Text style={styles.location}>{printer.location}</Text>
                  </View>
                </View>
                <View style={styles.qrIcon}>
                  <MaterialIcons name="qr-code-2" size={32} color={theme.primary} />
                </View>
              </View>

              <View style={styles.printerActions}>
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => alert(`Edit ${printer.id}\n\nCurrent Location: ${printer.location}\nStatus: ${printer.status.toUpperCase()}\n\nUpdate:\n• Location/Zone\n• Maintenance Schedule\n• Access Permissions\n• Network Settings`)}
                >
                  <MaterialIcons name="edit" size={18} color={theme.textSecondary} />
                </Pressable>
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => alert(`${printer.id} Statistics\n\nToday:\n• 248 jobs completed\n• 3,124 pages printed\n• 94.2% uptime\n• Avg speed: 42 ppm\n\nInk Levels:\n• Black: ${printer.status === 'warning' ? '12%' : '78%'}\n• Color: ${printer.status === 'warning' ? '8%' : '65%'}\n\nLast maintenance: ${new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`)}
                >
                  <MaterialIcons name="bar-chart" size={18} color={theme.textSecondary} />
                </Pressable>
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => alert(`Remove ${printer.id}?\n\nLocation: ${printer.location}\nStatus: ${printer.status.toUpperCase()}\n\n⚠️ Warning: This will:\n• Remove from network\n• Cancel pending jobs\n• Disable remote access\n\nThis action cannot be undone.`)}
                >
                  <MaterialIcons name="delete" size={18} color={theme.error} />
                </Pressable>
              </View>
            </View>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ADMIN,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.medium,
  },
  printersList: {
    marginTop: 24,
    gap: 16,
  },
  printerCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  printerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  printerId: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  qrIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printerActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.backgroundSecondary,
  },
});
