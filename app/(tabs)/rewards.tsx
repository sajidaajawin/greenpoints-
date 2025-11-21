import React, { useState } from 'react';
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
import { useUserData } from '@/hooks/useUserData';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'product' | 'voucher';
  imageUrl: string;
  originalPrice?: number;
  discountPercent?: number;
  available: boolean;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    title: '10% Off Eco Store',
    description: 'Get 10% discount on all eco-friendly products at participating stores',
    pointsCost: 50,
    category: 'discount',
    imageUrl: 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=400',
    discountPercent: 10,
    available: true,
  },
  {
    id: '2',
    title: 'Bamboo Water Bottle',
    description: 'Sustainable bamboo water bottle with stainless steel interior',
    pointsCost: 150,
    category: 'product',
    imageUrl: 'https://images.pexels.com/photos/6621374/pexels-photo-6621374.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 25,
    available: true,
  },
  {
    id: '3',
    title: 'Coffee Shop Voucher',
    description: 'Free coffee at participating eco-friendly coffee shops',
    pointsCost: 75,
    category: 'voucher',
    imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 5,
    available: true,
  },
  {
    id: '4',
    title: 'Reusable Shopping Bags Set',
    description: 'Set of 3 organic cotton reusable shopping bags',
    pointsCost: 100,
    category: 'product',
    imageUrl: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 15,
    available: true,
  },
  {
    id: '5',
    title: '20% Off Green Cleaning',
    description: 'Save 20% on eco-friendly cleaning products',
    pointsCost: 80,
    category: 'discount',
    imageUrl: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=400',
    discountPercent: 20,
    available: true,
  },
  {
    id: '6',
    title: 'Solar Power Bank',
    description: 'Portable solar-powered phone charger for outdoor adventures',
    pointsCost: 200,
    category: 'product',
    imageUrl: 'https://images.pexels.com/photos/159397/solar-panel-array-power-sun-electricity-159397.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 35,
    available: true,
  },
  {
    id: '7',
    title: 'Plant-Based Meal Voucher',
    description: 'Free plant-based meal at participating restaurants',
    pointsCost: 120,
    category: 'voucher',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 18,
    available: true,
  },
  {
    id: '8',
    title: 'Seed Starter Kit',
    description: 'Organic herb garden starter kit with seeds and biodegradable pots',
    pointsCost: 90,
    category: 'product',
    imageUrl: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalPrice: 12,
    available: true,
  },
];

export default function RewardsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'discount' | 'product' | 'voucher'>('all');
  const { userData, redeemReward } = useUserData();

  const categories = [
    { key: 'all' as const, label: 'All', icon: 'apps-outline' },
    { key: 'discount' as const, label: 'Discounts', icon: 'pricetag-outline' },
    { key: 'product' as const, label: 'Products', icon: 'cube-outline' },
    { key: 'voucher' as const, label: 'Vouchers', icon: 'ticket-outline' },
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? mockRewards 
    : mockRewards.filter(reward => reward.category === selectedCategory);

  const handleRedeemReward = (reward: Reward) => {
    if (userData.totalPoints < reward.pointsCost) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.pointsCost - userData.totalPoints} more points to redeem this reward. Keep recycling!`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Are you sure you want to redeem "${reward.title}" for ${reward.pointsCost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            redeemReward(reward.pointsCost);
            Alert.alert(
              '🎉 Reward Redeemed!',
              `Congratulations! You've successfully redeemed "${reward.title}". Check your email for redemption details.`,
              [{ text: 'Awesome!' }]
            );
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return 'pricetag';
      case 'product': return 'cube';
      case 'voucher': return 'ticket';
      default: return 'gift';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return '#F59E0B';
      case 'product': return '#8B5CF6';
      case 'voucher': return '#EF4444';
      default: return '#22C55E';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#10B981']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Rewards Store</Text>
        <Text style={styles.headerSubtitle}>
          Redeem your points for eco-friendly rewards
        </Text>
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={24} color="#FFFFFF" />
          <Text style={styles.pointsText}>{userData.totalPoints} Points Available</Text>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.key ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Rewards Grid */}
      <ScrollView style={styles.rewardsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.rewardsGrid}>
          {filteredRewards.map((reward) => {
            const canAfford = userData.totalPoints >= reward.pointsCost;
            return (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardImageContainer}>
                  <Image source={{ uri: reward.imageUrl }} style={styles.rewardImage} />
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(reward.category) }]}>
                    <Ionicons
                      name={getCategoryIcon(reward.category) as any}
                      size={12}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
                
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardTitle} numberOfLines={2}>
                    {reward.title}
                  </Text>
                  <Text style={styles.rewardDescription} numberOfLines={3}>
                    {reward.description}
                  </Text>
                  
                  <View style={styles.rewardFooter}>
                    <View style={styles.priceContainer}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.pointsCost}>{reward.pointsCost}</Text>
                      {reward.originalPrice && (
                        <Text style={styles.originalPrice}>${reward.originalPrice}</Text>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.redeemButton,
                        !canAfford && styles.redeemButtonDisabled,
                      ]}
                      onPress={() => handleRedeemReward(reward)}
                      disabled={!canAfford}
                    >
                      <Text
                        style={[
                          styles.redeemButtonText,
                          !canAfford && styles.redeemButtonTextDisabled,
                        ]}
                      >
                        {canAfford ? 'Redeem' : 'Need More'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  categoryContainer: {
    paddingVertical: 16,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#22C55E',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  rewardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  rewardCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  rewardImageContainer: {
    position: 'relative',
    height: 120,
  },
  rewardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    padding: 12,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 12,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  originalPrice: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  redeemButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  redeemButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  redeemButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redeemButtonTextDisabled: {
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 20,
  },
});