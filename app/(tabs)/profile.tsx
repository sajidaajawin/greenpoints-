import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/components/AuthProvider';

export default function ProfileScreen() {
  const { user, signOut } = useAuthContext();
  const animatedValues = useRef({
    totalItems: new Animated.Value(0),
    totalPoints: new Animated.Value(0),
    co2Saved: new Animated.Value(0),
  }).current;

  useEffect(() => {
    if (user) {
      Animated.parallel([
        Animated.timing(animatedValues.totalItems, {
          toValue: user.total_items,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues.totalPoints, {
          toValue: user.total_points,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValues.co2Saved, {
          toValue: user.co2_saved,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [user]);

  const getBadges = () => {
    if (!user) return [];
    const badges = [];
    if (user.total_items >= 10) badges.push({ icon: 'leaf', name: 'Eco Warrior', color: '#22C55E' });
    if (user.total_items >= 50) badges.push({ icon: 'medal', name: 'Champion', color: '#F59E0B' });
    if (user.total_items >= 100) badges.push({ icon: 'trophy', name: 'Legend', color: '#8B5CF6' });
    if (user.total_points >= 200) badges.push({ icon: 'star', name: 'Redeemer', color: '#EF4444' });
    return badges;
  };

  const getLevel = () => {
    if (!user) return 1;
    return Math.floor(user.total_points / 100) + 1;
  };

  const getProgressToNextLevel = () => {
    if (!user) return 0;
    const currentLevelPoints = (getLevel() - 1) * 100;
    const nextLevelPoints = getLevel() * 100;
    const progress = (user.total_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);
    return Math.max(0, Math.min(1, progress));
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#10B981']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F9FF']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.welcomeText}>{user.full_name}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {getLevel()}</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${getProgressToNextLevel() * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {user.total_points % 100}/100 points to next level
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Ionicons name="recycle" size={32} color="#22C55E" />
            <Animated.Text style={styles.statNumber}>
              {animatedValues.totalItems}
            </Animated.Text>
            <Text style={styles.statLabel}>Items Recycled</Text>
          </View>
          <View style={[styles.statCard, styles.secondaryCard]}>
            <Ionicons name="star" size={32} color="#F59E0B" />
            <Animated.Text style={styles.statNumber}>
              {animatedValues.totalPoints}
            </Animated.Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>
        
        <View style={[styles.statCard, styles.fullWidthCard]}>
          <View style={styles.co2Header}>
            <Ionicons name="leaf" size={32} color="#10B981" />
            <View>
              <Animated.Text style={styles.co2Number}>
                {animatedValues.co2Saved}
              </Animated.Text>
              <Text style={styles.co2Unit}>kg CO₂ saved</Text>
            </View>
          </View>
          <Text style={styles.co2Description}>
            Equivalent to planting {Math.floor(user.co2_saved / 0.06)} tree seedlings! 🌱
          </Text>
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Badges</Text>
        <View style={styles.badgesContainer}>
          {getBadges().map((badge, index) => (
            <View key={index} style={[styles.badge, { backgroundColor: badge.color }]}>
              <Ionicons name={badge.icon as any} size={24} color="#FFFFFF" />
              <Text style={styles.badgeText}>{badge.name}</Text>
            </View>
          ))}
          {getBadges().length === 0 && (
            <View style={styles.noBadges}>
              <Ionicons name="medal-outline" size={48} color="#9CA3AF" />
              <Text style={styles.noBadgesText}>
                Start recycling to earn your first badge!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Account Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.accountContainer}>
          <TouchableOpacity style={styles.accountItem}>
            <Ionicons name="person-outline" size={24} color="#6B7280" />
            <Text style={styles.accountText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountItem}>
            <Ionicons name="notifications-outline" size={24} color="#6B7280" />
            <Text style={styles.accountText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountItem}>
            <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
            <Text style={styles.accountText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.accountItem, styles.signOutItem]} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={[styles.accountText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    width: '100%',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
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
  primaryCard: {
    flex: 1,
  },
  secondaryCard: {
    flex: 1,
  },
  fullWidthCard: {
    width: '100%',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  co2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  co2Number: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  co2Unit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  co2Description: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noBadges: {
    alignItems: 'center',
    padding: 32,
    width: '100%',
  },
  noBadgesText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  accountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  accountText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#EF4444',
  },
});