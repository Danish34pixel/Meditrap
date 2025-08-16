import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const navigation = useNavigation();
  const floatAnim = useRef(new Animated.Value(0)).current;

  const handleLoginClick = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  return (
    <View style={styles.container}>
      {/* Floating Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        <Text style={styles.logoText}>DK Pharma</Text>
      </Animated.View>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Committed to healthcare innovation and excellence
      </Text>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginClick}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  tagline: {
    fontSize: 18,
    color: '#2c5282',
    textAlign: 'center',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
  },
});
