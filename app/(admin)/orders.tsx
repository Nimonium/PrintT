// Admin Orders Management Screen
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

const ADMIN = '#7C3AED';

const ALL_ORDERS = [
  { id: 'PX-9921', customer: 'Marcus Thorne', status: 'pending', pages: 42, type: 'Delivery', agent: 'Unassigned', location: 'Main Library', printer: 'PRT-001' },
  { id: 'PX-9918', customer: 'Sarah Jenkins', status: 'printing', pages: 12, type: 'ATM Pickup', agent: 'Auto', location: 'South Wing Hub', printer: 'PRT-042' },
  { id: 'PX-9905', customer: 'Elena Rodriguez', status: 'delivery', pages: 156, type: 'Delivery', agent: 'Marcus Thorne', location: 'Logistics Annex', printer: 'PRT-089' },
  { id: 'PX-9892', customer: 'David Kim', status: 'completed', pages: 5, type: 'ATM Pickup', agent: 'Elena Rodriguez', location: 'Admin Block B', printer: 'PRT-112' },
];

type FilterType = 'all' | 'pending' | 'active' | 'completed';

export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [orders, setOrders] = useState(ALL_ORDERS);

  const filtered = orders.filter((o) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return o.status === 'pending';
    if (activeFilter === 'active') return o.status === 'printing' || o.status === 'delivery';
    if (activeFilter === 'completed') return o.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'printing': return ADMIN;
      case 'delivery': return theme.success;
      case 'completed': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDING';
      case 'printing': return 'PRINTING';
      case 'delivery': return 'OUT FOR DELIVERY';
      case 'completed': return 'COMPLETED';
      default: return status.toUpperCase();
    }
  };

  const handleViewDetails = (order: typeof ALL_ORDERS[0]) => {
    const statusLabel = getStatusLabel(order.status);
    const timestamp = new Date().toLocaleString();
    const msg = `Order: #${order.id}\nCustomer: ${order.customer}\nType: ${order.type}\nPages: ${order.pages}\nStatus: ${statusLabel}\nAgent: ${order.agent}\nPrinter: ${order.printer}\nLocation: ${order.location}\nTimestamp: ${timestamp}`;
    if (Platform.OS === 'web') {
      alert(`📋 Order Details\n\n${msg}`);
    } else {
      Alert.alert(`Order #${order.id}`, msg, [
        {
          text: 'Change Status',
          onPress: () => handleChangeStatus(order),
        },
        { text: 'Close' },
      ]);
    }
  };

  const handleChangeStatus = (order: typeof ALL_ORDERS[0]) => {
    const nextMap: Record<string, string> = {
      pending: 'printing',
      printing: 'delivery',
      delivery: 'completed',
    };
    const next = nextMap[order.status];
    if (!next) {
      if (Platform.OS === 'web') {
        alert('This order is already completed.');
      } else {
        Alert.alert('Already Completed', 'This order is already completed.');
      }
      return;
    }
    const label = getStatusLabel(next);
    if (Platform.OS === 'web') {
      const ok = window.confirm(`Move order #${order.id} to ${label}?`);
      if (ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
      }
    } else {
      Alert.alert('Change Status', `Move order #${order.id} to ${label}?`, [
        {
          text: 'Confirm',
          onPress: () =>
            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleReassign = (order: typeof ALL_ORDERS[0]) => {
    const agentNames = ['Marcus Thorne', 'Elena Rodriguez', 'David Miller'];
    const msg = `Reassign Order #${order.id}\nCurrent agent: ${order.agent}\n\nAvailable agents:\n1. Marcus Thorne (Online, 2.1 km)\n2. Elena Rodriguez (Online, 3.5 km)\n3. David Miller (Active, 4.2 km)`;
    if (Platform.OS === 'web') {
      const choice = prompt(`${msg}\n\nEnter agent number (1-3):`);
      const idx = parseInt(choice ?? '0') - 1;
      const agent = agentNames[idx] ?? agentNames[0];
      if (choice) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, agent } : o)));
        alert(`✓ Reassigned!\n\nOrder #${order.id} assigned to ${agent}`);
      }
    } else {
      Alert.alert('Reassign Order', msg, [
        {
          text: 'Marcus Thorne',
          onPress: () => {
            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, agent: 'Marcus Thorne' } : o)));
            Alert.alert('Reassigned', `Order #${order.id} assigned to Marcus Thorne.`);
          },
        },
        {
          text: 'Elena Rodriguez',
          onPress: () => {
            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, agent: 'Elena Rodriguez' } : o)));
            Alert.alert('Reassigned', `Order #${order.id} assigned to Elena Rodriguez.`);
          },
        },
        {
          text: 'David Miller',
          onPress: () => {
            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, agent: 'David Miller' } : o)));
            Alert.alert('Reassigned', `Order #${order.id} assigned to David Miller.`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders Management</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filter, activeFilter === f.key && styles.filterActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color={theme.textTertiary} />
              <Text style={styles.emptyText}>No {activeFilter !== 'all' ? activeFilter : ''} orders</Text>
            </View>
          ) : (
            filtered.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.customerName}>{order.customer}</Text>
                <Text style={styles.orderType}>Type: {order.type}</Text>
                <Text style={styles.agentText}>Agent: {order.agent}</Text>

                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="description" size={16} color={ADMIN} />
                    <Text style={styles.metaText}>{order.pages} Pages</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="print" size={16} color={ADMIN} />
                    <Text style={styles.metaText}>{order.printer}</Text>
                  </View>
                </View>

                <View style={styles.orderActions}>
                  <Pressable
                    style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.8 }]}
                    onPress={() => handleViewDetails(order)}
                  >
                    <MaterialIcons name="visibility" size={16} color="#FFF" />
                    <Text style={styles.primaryActionText}>View Details</Text>
                  </Pressable>
                  {order.status !== 'completed' && (
                    <Pressable
                      style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.8 }]}
                      onPress={() => handleReassign(order)}
                    >
                      <MaterialIcons name="swap-horiz" size={16} color={theme.textPrimary} />
                      <Text style={styles.secondaryActionText}>Reassign</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))
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
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filter: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterActive: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.full,
    backgroundColor: ADMIN,
    borderWidth: 1,
    borderColor: ADMIN,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  filterTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  ordersList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textTransform: 'capitalize',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 3,
  },
  orderType: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  agentText: {
    fontSize: 12,
    color: theme.textTertiary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.medium,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ADMIN,
    paddingVertical: 11,
    borderRadius: theme.borderRadius.medium,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.backgroundSecondary,
    paddingVertical: 11,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textPrimary,
  },
});
