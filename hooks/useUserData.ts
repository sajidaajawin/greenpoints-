import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecyclingActivity {
  id: string;
  type: 'bottle' | 'can';
  points: number;
  timestamp: number;
}

export interface UserData {
  totalItemsRecycled: number;
  totalPoints: number;
  co2Saved: number;
  streakDays: number;
  recentActivity: RecyclingActivity[];
  lastRecycleDate?: number;
}

const STORAGE_KEY = '@greenpoints_userdata';

const defaultUserData: UserData = {
  totalItemsRecycled: 0,
  totalPoints: 0,
  co2Saved: 0,
  streakDays: 0,
  recentActivity: [],
};

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(defaultUserData);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async (data: UserData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const addRecycledItem = (type: 'bottle' | 'can', points: number) => {
    const now = Date.now();
    const today = new Date(now).toDateString();
    const lastRecycleDay = userData.lastRecycleDate 
      ? new Date(userData.lastRecycleDate).toDateString() 
      : null;

    // Calculate streak
    let newStreakDays = userData.streakDays;
    if (lastRecycleDay !== today) {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000).toDateString();
      if (lastRecycleDay === yesterday) {
        newStreakDays += 1;
      } else if (lastRecycleDay !== today) {
        newStreakDays = 1;
      }
    }

    const newActivity: RecyclingActivity = {
      id: now.toString(),
      type,
      points,
      timestamp: now,
    };

    const newUserData: UserData = {
      totalItemsRecycled: userData.totalItemsRecycled + 1,
      totalPoints: userData.totalPoints + points,
      co2Saved: userData.co2Saved + (type === 'bottle' ? 0.15 : 0.12), // kg CO2 per item
      streakDays: newStreakDays,
      recentActivity: [newActivity, ...userData.recentActivity].slice(0, 20),
      lastRecycleDate: now,
    };

    saveUserData(newUserData);
  };

  const resetUserData = () => {
    saveUserData(defaultUserData);
  };

  const redeemReward = (pointsCost: number) => {
    const newUserData: UserData = {
      ...userData,
      totalPoints: userData.totalPoints - pointsCost,
    };
    saveUserData(newUserData);
  };

  return {
    userData,
    addRecycledItem,
    resetUserData,
    redeemReward,
  };
}