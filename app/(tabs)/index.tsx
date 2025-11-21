import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/components/AuthProvider';

export default function QRCodeScreen() {
  const { user } = useAuthContext();
  const [qrSize, setQrSize] = useState(250);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleQRPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shareQRCode = async () => {
    try {
      await Share.share({
        message: 'Check out Green Points - the eco-friendly recycling app! Join me in making a difference for our planet. 🌱',
        title: 'Green Points App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const showInstructions = () => {
    Alert.alert(
      'How to Use',
      '1. Find a Green Points recycling machine\n2. Show this QR code to the machine scanner\n3. Wait for the green light activation\n4. Deposit your recyclables\n5. Earn points automatically!\n\nPlastic bottles = 5 points\nAluminum cans = 1 point',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#10B981']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Your QR Code</Text>
        <Text style={styles.headerSubtitle}>
          Show this to any Green Points machine
        </Text>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={24} color="#FFFFFF" />
          <Text style={styles.userName}>{user?.full_name}</Text>
        </View>
      </LinearGradient>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <View style={styles.qrContainer}>
          <TouchableOpacity
            onPress={handleQRPress}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.qrWrapper,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Image
                source={require('@/assets/images/Qr 0.png')}
                style={{
                  width: qrSize,
                  height: qrSize,
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>
          
          <View style={styles.qrBorder} />
          <View style={styles.scanLine} />
        </View>

        <Text style={styles.qrInstructions}>
          Show this universal QR code to any Green Points machine
        </Text>

        <View style={styles.pointsInfo}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsItem}>
              <Ionicons name="wine-outline" size={24} color="#22C55E" />
              <Text style={styles.pointsText}>Plastic = 5 pts</Text>
            </View>
            <View style={styles.pointsItem}>
              <Ionicons name="cafe-outline" size={24} color="#22C55E" />
              <Text style={styles.pointsText}>Aluminum = 1 pt</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={showInstructions}>
          <Ionicons name="help-circle-outline" size={24} color="#22C55E" />
          <Text style={styles.actionButtonText}>How to Use</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareQRCode}>
          <Ionicons name="share-outline" size={24} color="#22C55E" />
          <Text style={styles.actionButtonText}>Share App</Text>
        </TouchableOpacity>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          <Text style={styles.statusText}>Ready to Scan</Text>
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
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  qrSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  qrBorder: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderWidth: 2,
    borderColor: '#22C55E',
    borderRadius: 30,
    opacity: 0.3,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#22C55E',
    opacity: 0.6,
  },
  qrInstructions: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  pointsInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pointsItem: {
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  statusBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
});