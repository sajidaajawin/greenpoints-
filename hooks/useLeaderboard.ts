import { useState, useEffect } from 'react';

export interface LeaderboardUser {
  id: string;
  name: string;
  itemsRecycled: number;
  points: number;
  level: number;
  co2Saved: number;
}

// Mock leaderboard data for demonstration
const generateMockUsers = (): LeaderboardUser[] => {
  const names = [
    'EcoEmily', 'GreenGary', 'RecycleRyan', 'PlanetPaul', 'NatureNancy',
    'EarthEthan', 'ClimateClara', 'SustainableSam', 'EcoAlex', 'GreenGrace',
    'RecycleBob', 'PlanetPete', 'EarthEllie', 'NatureNick', 'ClimateCarl',
  ];

  return names.map((name, index) => {
    const itemsRecycled = Math.floor(Math.random() * 200) + 50;
    const points = itemsRecycled * (Math.floor(Math.random() * 5) + 5);
    return {
      id: `user-${index}`,
      name,
      itemsRecycled,
      points,
      level: Math.floor(points / 100) + 1,
      co2Saved: Math.round(itemsRecycled * 0.135 * 100) / 100,
    };
  }).sort((a, b) => b.points - a.points);
};

export function useLeaderboard() {
  const [allTimeLeaderboard] = useState<LeaderboardUser[]>(generateMockUsers());

  const getLeaderboard = (timeFrame: 'daily' | 'weekly' | 'allTime'): LeaderboardUser[] => {
    switch (timeFrame) {
      case 'daily':
        // For daily, show a subset with lower numbers
        return allTimeLeaderboard.map(user => ({
          ...user,
          itemsRecycled: Math.floor(user.itemsRecycled * 0.1),
          points: Math.floor(user.points * 0.1),
          co2Saved: Math.round(user.co2Saved * 0.1 * 100) / 100,
        })).sort((a, b) => b.points - a.points);
      
      case 'weekly':
        // For weekly, show a subset with moderate numbers
        return allTimeLeaderboard.map(user => ({
          ...user,
          itemsRecycled: Math.floor(user.itemsRecycled * 0.4),
          points: Math.floor(user.points * 0.4),
          co2Saved: Math.round(user.co2Saved * 0.4 * 100) / 100,
        })).sort((a, b) => b.points - a.points);
      
      case 'allTime':
      default:
        return allTimeLeaderboard;
    }
  };

  return {
    getLeaderboard,
  };
}