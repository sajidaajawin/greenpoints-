import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/AuthProvider';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'allTime';

interface LeaderboardUser {
  id: string;
  full_name: string;
  total_items: number;
  total_points: number;
  co2_saved: number;
}

export default function LeaderboardScreen() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('weekly');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  const timeFrameOptions: { key: TimeFrame; label: string }[] = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
    { key: 'allTime', label: 'All Time' },
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTimeFrame]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('id, full_name, total_items, total_points, co2_saved')
        .order('total_points', { ascending: false })
        .limit(50);

      // For demo purposes, we'll show all-time data for all timeframes
      // In a real app, you'd filter by date ranges
      
      const { data, error } = await query;
      
      if (error) throw error;
      setLeaderboardData(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#F59E0B'; // Gold
      case 2: return '#9CA3AF'; // Silver
      case 3: return '#CD7C2F'; // Bronze
      default: return '#22C55E'; // Green
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal';
      default: return 'chevron-forward';
    }
  };

  const getUserRank = () => {
    if (!user) return null;
    const userIndex = leaderboardData.findIndex(u => u.id === user.id);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#10B981']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          Compete with other eco warriors
        </Text>
      </LinearGradient>

      {/* Time Frame Selector */}
      <View style={styles.timeFrameContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeFrameScroll}>
          {timeFrameOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.timeFrameButton,
                selectedTimeFrame === option.key && styles.timeFrameButtonActive,
              ]}
              onPress={() => setSelectedTimeFrame(option.key)}
            >
              <Text
                style={[
                  styles.timeFrameText,
                  selectedTimeFrame === option.key && styles.timeFrameTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leaderboard List */}
      <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : (
          leaderboardData.map((leaderUser, index) => {
            const rank = index + 1;
            const isCurrentUser = user?.id === leaderUser.id;
            
            return (
              <View 
                key={leaderUser.id} 
                style={[
                  styles.leaderboardItem,
                  isCurrentUser && styles.currentUserItem,
                ]}
              >
                {/* Rank */}
                <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) }]}>
                  {rank <= 3 ? (
                    <Ionicons
                      name={getRankIcon(rank) as any}
                      size={20}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text style={styles.rankNumber}>{rank}</Text>
                  )}
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitial}>
                      {leaderUser.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
                      {leaderUser.full_name} {isCurrentUser && '(You)'}
                    </Text>
                    <Text style={styles.userLevel}>
                      Level {Math.floor(leaderUser.total_points / 100) + 1}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{leaderUser.total_items}</Text>
                    <Text style={styles.statLabelSmall}>Items</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{leaderUser.total_points}</Text>
                    <Text style={styles.statLabelSmall}>Points</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Your Position */}
      <View style={styles.yourPositionContainer}>
        <View style={styles.yourPosition}>
          <Ionicons name="person-circle" size={24} color="#22C55E" />
          <Text style={styles.yourPositionText}>
            Your Position: #{getUserRank() || 'N/A'}
          </Text>
        </View>
      </View>
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
  },
  timeFrameContainer: {
    paddingVertical: 16,
  },
  timeFrameScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  timeFrameButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeFrameButtonActive: {
    backgroundColor: '#22C55E',
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeFrameTextActive: {
    color: '#FFFFFF',
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#22C55E',
  },
  userLevel: {
    fontSize: 12,
    color: '#6B7280',
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabelSmall: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  yourPositionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  yourPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    gap: 8,
  },
  yourPositionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
  },
});