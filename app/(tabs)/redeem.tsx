import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

interface PartnerStore {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  category: string;
  min_points_required: number;
  discount_percentage?: number;
  address: string;
  phone?: string;
  website?: string;
  is_active: boolean;
}

export default function RedeemScreen() {
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchUserProfile } = useAuthContext();

  useEffect(() => {
    fetchPartnerStores();
  }, []);

  const fetchPartnerStores = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_stores')
        .select('*')
        .eq('is_active', true)
        .order('min_points_required', { ascending: true });

      if (error) throw error;
      setPartnerStores(data || []);
    } catch (error) {
      console.error('Error fetching partner stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (store: PartnerStore) => {
    if (!user) return;

    if (user.total_points < store.min_points_required) {
      Alert.alert(
        'Insufficient Points',
        `You need ${store.min_points_required - user.total_points} more points to redeem at ${store.name}. Keep recycling!`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Points',
      `Redeem ${store.min_points_required} points at ${store.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              // Update user points
              const { error } = await supabase
                .from('users')
                .update({ 
                  total_points: user.total_points - store.min_points_required 
                })
                .eq('id', user.id);

              if (error) throw error;

              // Record redemption
              await supabase
                .from('redemptions')
                .insert([
                  {
                    user_id: user.id,
                    partner_store_id: store.id,
                    points_used: store.min_points_required,
                    status: 'pending',
                  }
                ]);

              await fetchUserProfile(user.id);

              Alert.alert(
                '🎉 Redemption Successful!',
                `You've successfully redeemed ${store.min_points_required} points at ${store.name}. Show this confirmation to the store staff.`,
                [{ text: 'Great!' }]
              );
            } catch (error) {
              console.error('Redemption error:', error);
              Alert.alert('Error', 'Failed to process redemption. Please try again.');
            }
          },
        },
      ]
    );
  };

  const canRedeem = (store: PartnerStore) => {
    return user && user.total_points >= store.min_points_required;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading partner stores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#10B981']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Redeem Points</Text>
        <Text style={styles.headerSubtitle}>
          Use your points at partner stores
        </Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={24} color="#FFFFFF" />
          <Text style={styles.pointsText}>{user?.total_points || 0} Points Available</Text>
        </View>
      </LinearGradient>

      {/* Partner Stores */}
      <ScrollView style={styles.storesContainer} showsVerticalScrollIndicator={false}>
        {partnerStores.length === 0 ? (
          <View style={styles.noStoresContainer}>
            <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
            <Text style={styles.noStoresTitle}>No Partner Stores Yet</Text>
            <Text style={styles.noStoresText}>
              We're working on adding partner stores to your area. Check back soon!
            </Text>
          </View>
        ) : (
          partnerStores.map((store) => (
            <View key={store.id} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={styles.storeLogoContainer}>
                  <Image 
                    source={{ uri: store.logo_url }} 
                    style={styles.storeLogo}
                    defaultSource={require('@/assets/images/icon.png')}
                  />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeCategory}>{store.category}</Text>
                  <Text style={styles.storeDescription} numberOfLines={2}>
                    {store.description}
                  </Text>
                </View>
              </View>

              <View style={styles.storeDetails}>
                <View style={styles.storeAddress}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={styles.addressText}>{store.address}</Text>
                </View>
                
                {store.phone && (
                  <View style={styles.storeContact}>
                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                    <Text style={styles.contactText}>{store.phone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.storeFooter}>
                <View style={styles.pointsRequired}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.pointsRequiredText}>
                    {store.min_points_required} points required
                  </Text>
                  {store.discount_percentage && (
                    <Text style={styles.discountText}>
                      {store.discount_percentage}% off
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    !canRedeem(store) && styles.redeemButtonDisabled,
                  ]}
                  onPress={() => handleRedeem(store)}
                  disabled={!canRedeem(store)}
                >
                  <Text
                    style={[
                      styles.redeemButtonText,
                      !canRedeem(store) && styles.redeemButtonTextDisabled,
                    ]}
                  >
                    {canRedeem(store) ? 'Redeem' : 'Need More Points'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
    textAlign: 'center',
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noStoresContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noStoresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noStoresText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  storeCard: {
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
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  storeLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  storeDetails: {
    marginBottom: 16,
  },
  storeAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  storeContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsRequiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  discountText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
    marginLeft: 8,
  },
  redeemButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  redeemButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redeemButtonTextDisabled: {
    color: '#9CA3AF',
  },
});