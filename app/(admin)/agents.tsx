// Admin Agents Management Screen
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

import { ref, onValue, set, push } from 'firebase/database';
import { database } from '../../services/firebase';

const ADMIN = '#7C3AED';

const AGENTS = [
  {
    id: 'PLT-001',
    name: 'Marcus Thorne',
    phone: '+1 (555) 012-3456',
    status: 'active',
    activeOrders: 4,
    rating: 4.92,
    zone: 'Zone 7 - Delta',
    vehicle: 'E-Bike',
    earnings: '₹1,284.50',
    deliveries: 248,
  },
  {
    id: 'PLT-002',
    name: 'Elena Rodriguez',
    phone: '+1 (555) 019-8877',
    status: 'active',
    activeOrders: 2,
    rating: 4.85,
    zone: 'Zone 3 - Alpha',
    vehicle: 'Scooter',
    earnings: '₹982.00',
    deliveries: 192,
  },
  {
    id: 'PLT-003',
    name: 'Jin-Soo Park',
    phone: '+1 (555) 044-2211',
    status: 'offline',
    activeOrders: 0,
    rating: 4.70,
    zone: 'Zone 5 - Beta',
    vehicle: 'E-Bike',
    earnings: '₹654.20',
    deliveries: 134,
  },
  {
    id: 'PLT-004',
    name: 'David Miller',
    phone: '+1 (555) 088-9900',
    status: 'active',
    activeOrders: 7,
    rating: 4.98,
    zone: 'Zone 2 - Core',
    vehicle: 'Motorcycle',
    earnings: '₹2,108.75',
    deliveries: 412,
  },
  {
    id: 'PLT-005',
    name: 'Priya Sharma',
    phone: '+1 (555) 033-5500',
    status: 'break',
    activeOrders: 0,
    rating: 4.88,
    zone: 'Zone 1 - Central',
    vehicle: 'E-Bike',
    earnings: '₹1,540.00',
    deliveries: 307,
  },
];

type FilterType = 'all' | 'active' | 'offline' | 'break';

export default function AdminAgentsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<any[]>([]);

  // Real-time listener for agents
  useEffect(() => {
    const agentsRef = ref(database, 'agents');
    const unsubscribe = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const agentList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAgents(agentList);
      } else {
        // Seed default agents if none exist
        AGENTS.forEach(async (a) => {
          await set(ref(database, `agents/${a.id}`), a);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const filtered = agents.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = agents.filter((a) => a.status === 'active').length;
  const offlineCount = agents.filter((a) => a.status === 'offline').length;
  const breakCount = agents.filter((a) => a.status === 'break').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.success;
      case 'offline': return theme.textTertiary;
      case 'break': return theme.warning;
      default: return theme.textTertiary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'offline': return 'Offline';
      case 'break': return 'On Break';
      default: return status;
    }
  };

  const handleTrack = (agent: typeof AGENTS[0]) => {
    const msg = `📍 Live Location\n\nAgent: ${agent.name}\nZone: ${agent.zone}\nVehicle: ${agent.vehicle}\n\nActive Orders: ${agent.activeOrders}\nStatus: ${getStatusLabel(agent.status)}\n\nLast updated: just now`;
    if (Platform.OS === 'web') {
      alert(`Track – ${agent.name}\n\n${msg}`);
    } else {
      Alert.alert(`Track – ${agent.name}`, msg);
    }
  };

  const handleAssign = (agent: typeof AGENTS[0]) => {
    const msg = `Assign new order to ${agent.name}?\n\nAvailable orders:\n• #PX-9930 – 18 pages (1.2 km)\n• #PX-9931 – 42 pages (3.4 km)\n• #PX-9932 – 8 pages (0.8 km)\n\nSelect an order to assign.`;
    if (Platform.OS === 'web') {
      alert(`Assign Order – ${agent.name}\n\n${msg}`);
    } else {
      Alert.alert(`Assign Order – ${agent.name}`, msg, [
        { text: '#PX-9930 (1.2km)', onPress: () => Alert.alert('Assigned', `Order #PX-9930 assigned to ${agent.name}`) },
        { text: '#PX-9931 (3.4km)', onPress: () => Alert.alert('Assigned', `Order #PX-9931 assigned to ${agent.name}`) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleRemove = (agent: typeof AGENTS[0]) => {
    const msg = `Remove ${agent.name} from the fleet?\n\nID: ${agent.id}\nActive Orders: ${agent.activeOrders}\n\n⚠️ This will revoke their access. Active orders will be reassigned.`;
    const performRemove = async () => {
      await set(ref(database, `agents/${agent.id}`), null);
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(msg);
      if (ok) {
        performRemove();
      }
    } else {
      Alert.alert('Remove Agent', msg, [
        { text: 'Remove', style: 'destructive', onPress: performRemove },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleAddAgent = () => {
    if (Platform.OS === 'web') {
      const name = prompt('Full Name:');
      if (!name) return;
      const phone = prompt('Phone Number:');
      if (!phone) return;
      const zone = prompt('Assigned Zone:', 'Zone 7 - Delta');
      if (!zone) return;
      
      const newAgentRef = push(ref(database, 'agents'));
      set(newAgentRef, {
        name,
        phone,
        status: 'offline', // default
        activeOrders: 0,
        rating: 5.0,
        zone,
        vehicle: 'E-Bike',
        earnings: '₹0.00',
        deliveries: 0,
      });

      alert(`✓ Agent Added\n\nName: ${name}\nPhone: ${phone}\nZone: ${zone}\n\nAgent is now in the system.`);
    } else {
      Alert.alert('Add New Agent', 'Cannot add via native currently. Use web dashboard.');
    }
  };

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: agents.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'break', label: 'On Break', count: breakCount },
    { key: 'offline', label: 'Offline', count: offlineCount },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Agent Management</Text>
          <Text style={styles.subtitle}>{activeCount} active · {agents.length} total</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
          onPress={handleAddAgent}
        >
          <MaterialIcons name="person-add" size={22} color="#FFF" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={20} color={theme.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID or zone…"
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={18} color={theme.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Summary chips */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Active', count: activeCount, color: theme.success },
          { label: 'On Break', count: breakCount, color: theme.warning },
          { label: 'Offline', count: offlineCount, color: theme.textTertiary },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryChip, { borderColor: s.color }]}>
            <View style={[styles.summaryDot, { backgroundColor: s.color }]} />
            <Text style={[styles.summaryLabel, { color: s.color }]}>{s.count} {s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
              {f.label} ({f.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 90, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="group-off" size={48} color={theme.textTertiary} />
            <Text style={styles.emptyText}>No agents found</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((agent) => (
              <View key={agent.id} style={styles.card}>
                {/* Avatar + name */}
                <View style={styles.cardTop}>
                  <View style={styles.avatarWrap}>
                    <View style={[styles.avatar, { backgroundColor: `${getStatusColor(agent.status)}20` }]}>
                      <MaterialIcons name="person" size={28} color={getStatusColor(agent.status)} />
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(agent.status) }]} />
                  </View>

                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.agentPhone}>{agent.phone}</Text>
                    <View style={styles.agentMeta}>
                      <MaterialIcons name="location-on" size={12} color={theme.textTertiary} />
                      <Text style={styles.agentZone}>{agent.zone}</Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(agent.status)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(agent.status) }]}>
                      {getStatusLabel(agent.status)}
                    </Text>
                  </View>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{agent.activeOrders}</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{agent.rating}★</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{agent.deliveries}</Text>
                    <Text style={styles.statLabel}>Delivered</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{agent.earnings}</Text>
                    <Text style={styles.statLabel}>Earned</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.btn, styles.btnSecondary]}
                    android_ripple={{ color: `${theme.primary}20` }}
                    onPress={() => handleTrack(agent)}
                  >
                    <MaterialIcons name="my-location" size={16} color={ADMIN} />
                    <Text style={styles.btnSecondaryText}>Track</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.btn,
                      styles.btnPrimary,
                      agent.status === 'offline' && styles.btnDisabled,
                    ]}
                    android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                    onPress={() => agent.status !== 'offline' && handleAssign(agent)}
                    disabled={agent.status === 'offline'}
                  >
                    <MaterialIcons name="assignment" size={16} color={agent.status === 'offline' ? theme.textTertiary : '#FFF'} />
                    <Text style={[styles.btnPrimaryText, agent.status === 'offline' && { color: theme.textTertiary }]}>
                      Assign
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.btnIcon}
                    android_ripple={{ color: '#FECACA' }}
                    onPress={() => handleRemove(agent)}
                  >
                    <MaterialIcons name="person-remove" size={18} color={theme.error} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: theme.textPrimary },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ADMIN,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.medium,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: theme.textPrimary },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFF',
    height: 20,
  },
  summaryDot: { width: 5, height: 5, borderRadius: 2.5 },
  summaryLabel: { fontSize: 9, fontWeight: '700', lineHeight: 12 },

  filtersScroll: { marginTop: 10, maxHeight: 44 },
  filtersContent: { paddingHorizontal: 20, gap: 8, paddingRight: 20, alignItems: 'center', height: 44 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: ADMIN,
    borderColor: ADMIN,
  },
  filterChipText: { fontSize: 12, fontWeight: '600', color: theme.textSecondary, lineHeight: 16 },
  filterChipTextActive: { color: '#FFF' },

  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: theme.textSecondary },

  list: { gap: 14 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.large,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow.small,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },

  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },

  agentInfo: { flex: 1 },
  agentName: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  agentPhone: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
  agentMeta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  agentZone: { fontSize: 12, color: theme.textTertiary },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    marginBottom: 14,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '600', color: theme.textTertiary, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 28, backgroundColor: theme.border },

  actions: { flexDirection: 'row', gap: 8 },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.medium,
  },
  btnPrimary: { flex: 1, backgroundColor: ADMIN },
  btnSecondary: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  btnDisabled: { backgroundColor: theme.backgroundSecondary },
  btnPrimaryText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  btnSecondaryText: { fontSize: 13, fontWeight: '700', color: ADMIN },

  btnIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});
