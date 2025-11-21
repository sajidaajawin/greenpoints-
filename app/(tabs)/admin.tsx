import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Machine {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'maintenance' | 'full';
  last_emptied: string;
  total_items_processed: number;
}

interface AdminStats {
  totalUsers: number;
  totalMachines: number;
  totalItemsProcessed: number;
  totalPointsAwarded: number;
}

export default function AdminScreen() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'machines' | 'stores' | 'users'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalMachines: 0,
    totalItemsProcessed: 0,
    totalPointsAwarded: 0,
  });
  const [machines, setMachines] = useState<Machine[]>([]);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    min_points_required: '200',
  });

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const { data: users } = await supabase.from('users').select('total_points, total_items');
      const { data: machinesData } = await supabase.from('recycling_machines').select('*');
      
      const totalUsers = users?.length || 0;
      const totalPointsAwarded = users?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0;
      const totalItemsProcessed = users?.reduce((sum, u) => sum + (u.total_items || 0), 0) || 0;
      
      setStats({
        totalUsers,
        totalMachines: machinesData?.length || 0,
        totalItemsProcessed,
        totalPointsAwarded,
      });

      setMachines(machinesData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleAddStore = async () => {
    try {
      const { error } = await supabase
        .from('partner_stores')
        .insert([
          {
            ...newStore,
            min_points_required: parseInt(newStore.min_points_required),
            logo_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=100',
            is_active: true,
          }
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Partner store added successfully!');
      setShowAddStoreModal(false);
      setNewStore({
        name: '',
        description: '',
        category: '',
        address: '',
        min_points_required: '200',
      });
    } catch (error) {
      console.error('Error adding store:', error);
      Alert.alert('Error', 'Failed to add partner store');
    }
  };

  const updateMachineStatus = async (machineId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('recycling_machines')
        .update({ status })
        .eq('id', machineId);

      if (error) throw error;
      
      fetchAdminData();
      Alert.alert('Success', 'Machine status updated');
    } catch (error) {
      console.error('Error updating machine:', error);
      Alert.alert('Error', 'Failed to update machine status');
    }
  };

  if (!user?.is_admin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Ionicons name="shield-outline" size={64} color="#EF4444" />
        <Text style={styles.unauthorizedTitle}>Access Denied</Text>
        <Text style={styles.unauthorizedText}>
          You don't have admin privileges to access this section.
        </Text>
      </View>
    );
  }

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={32} color="#22C55E" />
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="hardware-chip" size={32} color="#3B82F6" />
          <Text style={styles.statNumber}>{stats.totalMachines}</Text>
          <Text style={styles.statLabel}>Machines</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="recycle" size={32} color="#10B981" />
          <Text style={styles.statNumber}>{stats.totalItemsProcessed}</Text>
          <Text style={styles.statLabel}>Items Processed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.totalPointsAwarded}</Text>
          <Text style={styles.statLabel}>Points Awarded</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderMachines = () => (
    <ScrollView style={styles.tabContent}>
      {machines.map((machine) => (
        <View key={machine.id} style={styles.machineCard}>
          <View style={styles.machineHeader}>
            <Text style={styles.machineName}>{machine.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: machine.status === 'active' ? '#22C55E' : machine.status === 'full' ? '#EF4444' : '#F59E0B' }
            ]}>
              <Text style={styles.statusText}>{machine.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.machineLocation}>{machine.location}</Text>
          <Text style={styles.machineStats}>
            Items processed: {machine.total_items_processed}
          </Text>
          <View style={styles.machineActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => updateMachineStatus(machine.id, 'active')}
            >
              <Text style={styles.actionButtonText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.maintenanceButton]}
              onPress={() => updateMachineStatus(machine.id, 'maintenance')}
            >
              <Text style={styles.actionButtonText}>Maintenance</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderStores = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddStoreModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Partner Store</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#10B981']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage Green Points system</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: 'analytics' },
          { key: 'machines', label: 'Machines', icon: 'hardware-chip' },
          { key: 'stores', label: 'Stores', icon: 'storefront' },
          { key: 'users', label: 'Users', icon: 'people' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#22C55E' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'machines' && renderMachines()}
      {activeTab === 'stores' && renderStores()}

      {/* Add Store Modal */}
      <Modal
        visible={showAddStoreModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Partner Store</Text>
            <TouchableOpacity onPress={() => setShowAddStoreModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Store Name</Text>
              <TextInput
                style={styles.input}
                value={newStore.name}
                onChangeText={(text) => setNewStore({ ...newStore, name: text })}
                placeholder="Enter store name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newStore.description}
                onChangeText={(text) => setNewStore({ ...newStore, description: text })}
                placeholder="Enter store description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={newStore.category}
                onChangeText={(text) => setNewStore({ ...newStore, category: text })}
                placeholder="e.g., Restaurant, Retail, Services"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={newStore.address}
                onChangeText={(text) => setNewStore({ ...newStore, address: text })}
                placeholder="Enter store address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Minimum Points Required</Text>
              <TextInput
                style={styles.input}
                value={newStore.min_points_required}
                onChangeText={(text) => setNewStore({ ...newStore, min_points_required: text })}
                placeholder="200"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddStore}>
              <Text style={styles.submitButtonText}>Add Store</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 4,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#F0FDF4',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#22C55E',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  machineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  machineLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  machineStats: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  machineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  maintenanceButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});