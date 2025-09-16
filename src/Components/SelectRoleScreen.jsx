// SelectRoleScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { Package, ShoppingCart, Users, Stethoscope } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const rolesData = [
  {
    id: 'Stockist',
    name: 'Stockist',
    Icon: Package,
    gradient: ['#10B981', '#14B8A6'], // emerald -> teal
    description: 'Manage inventory',
  },
  {
    id: 'Purchaser',
    name: 'Purchaser',
    Icon: ShoppingCart,
    gradient: ['#60A5FA', '#6366F1'], // blue -> indigo
    description: 'Handle procurement',
  },
  {
    id: 'Staff',
    name: 'Staff',
    Icon: Users,
    gradient: ['#A78BFA', '#F472B6'], // purple -> pink
    description: 'Team operations',
  },
  {
    id: 'Medical Owner',
    name: 'Medical Owner',
    Icon: Stethoscope,
    gradient: ['#FB923C', '#F43F5E'], // orange -> red
    description: 'Clinic management',
  },
];

export default function SelectRoleScreen() {
  const [selectedRole, setSelectedRole] = useState('Purchaser');
  const navigation = useNavigation();

  // keep small animated values per card
  const scaleMapRef = useRef(
    rolesData.reduce((acc, r) => {
      acc[r.id] = new Animated.Value(1);
      return acc;
    }, {}),
  );

  const handleRoleSelect = async roleId => {
    setSelectedRole(roleId);
    try {
      await AsyncStorage.setItem('selectedRole', roleId);
    } catch (e) {
      // ignore persist errors
      console.warn('AsyncStorage set error', e);
    }

    // immediate navigation for Staff
    if (roleId === 'Staff') {
      // assuming your navigator has a "Staffs" route
      navigation.navigate('Staffs');
      return;
    }
  };

  const handleConfirm = async () => {
    try {
      await AsyncStorage.setItem('selectedRole', selectedRole);
    } catch (e) {
      console.warn('Could not persist role', e);
    }

    if (selectedRole === 'Purchaser') {
      navigation.navigate('Purchaser');
      return;
    }
    if (selectedRole === 'Stockist') {
      navigation.navigate('AdminCreateStockist');
      return;
    }
    if (selectedRole === 'Medical Owner') {
      navigation.navigate('Signup');
      return;
    }

    navigation.navigate('Dashboard');
  };

  const pressIn = id => {
    Animated.spring(scaleMapRef.current[id], {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 7,
      tension: 100,
    }).start();
  };
  const pressOut = id => {
    Animated.spring(scaleMapRef.current[id], {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 100,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* background soft circles */}
      <View style={styles.bgContainer} pointerEvents="none">
        <View style={[styles.circle, styles.circleBlue]} />
        <View style={[styles.circle, styles.circlePurple]} />
        <View style={[styles.circle, styles.circleEmerald]} />
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoPill}>
            <View style={styles.logoInner} />
          </View>

          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Choose your primary function to get started
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {rolesData.map(role => {
            const isActive = selectedRole === role.id;
            const scale = scaleMapRef.current[role.id];
            return (
              <Pressable
                key={role.id}
                onPress={() => handleRoleSelect(role.id)}
                onPressIn={() => pressIn(role.id)}
                onPressOut={() => pressOut(role.id)}
                style={styles.roleWrapper}
              >
                <Animated.View
                  style={[
                    styles.roleCard,
                    isActive ? styles.activeCard : styles.inactiveCard,
                    { transform: [{ scale }] },
                  ]}
                >
                  {/* glow / gradient bar */}
                  <LinearGradient
                    colors={role.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.iconContainer,
                      isActive ? { elevation: 6 } : null,
                    ]}
                  >
                    <role.Icon
                      size={26}
                      color={isActive ? '#fff' : '#374151'}
                    />
                    {isActive && <View style={styles.pingTopRight} />}
                    {isActive && <View style={styles.pingBottomLeft} />}
                  </LinearGradient>

                  <View style={styles.textWrap}>
                    <Text
                      style={[
                        styles.roleName,
                        isActive ? styles.roleNameActive : null,
                      ]}
                    >
                      {role.name}
                    </Text>
                    <Text
                      style={[
                        styles.roleDesc,
                        isActive ? styles.roleDescActive : null,
                      ]}
                    >
                      {role.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.indicator,
                      isActive ? styles.indicatorActive : null,
                    ]}
                  >
                    {isActive && <View style={styles.innerPulse} />}
                  </View>
                </Animated.View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.confirmWrap}>
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            style={styles.confirmButton}
          >
            <LinearGradient
              colors={['#2563EB', '#7C3AED']} // blue -> indigo
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              <Text style={styles.confirmText}>CONFIRM ROLE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.pagination}>
          <View style={styles.activeDot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const CARD_WIDTH = (width - 64) / 2; // adjust spacing

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // slate-50 like
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.08,
  },
  circleBlue: {
    top: 60,
    left: 40,
    backgroundColor: '#60A5FA',
  },
  circlePurple: {
    bottom: 60,
    right: 40,
    backgroundColor: '#A78BFA',
  },
  circleEmerald: {
    top: '45%',
    left: '45%',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#34D399',
    opacity: 0.04,
  },

  card: {
    width: '100%',
    maxWidth: 820,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPill: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'linear-gradient(90deg,#2563EB,#7C3AED)', // fallback visual; LinearGradient used in runtime for gradients
    marginBottom: 8,
  },
  logoInner: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    // mimic gradient text by using dark color
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  roleWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  roleCard: {
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  activeCard: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.2)',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  inactiveCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(156,163,175,0.12)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textWrap: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleNameActive: {
    color: '#111827',
  },
  roleDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  roleDescActive: {
    color: '#6B7280',
  },
  indicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(156,163,175,0.2)',
    transform: [{ scale: 0 }],
  },
  indicatorActive: {
    backgroundColor: 'transparent',
    transform: [{ scale: 1 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.95,
  },

  pingTopRight: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  pingBottomLeft: {
    position: 'absolute',
    bottom: -6,
    left: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  confirmWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  confirmButton: {
    borderRadius: 999,
    overflow: 'hidden',
    minWidth: 180,
    alignSelf: 'center',
  },
  confirmGradient: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginHorizontal: 4,
    opacity: 0.95,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
});
