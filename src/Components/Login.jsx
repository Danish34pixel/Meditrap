// Login.js
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Image,
  Easing,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* --- put styles FIRST so it's in scope everywhere --- */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '600', color: '#111827', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: { flex: 1, color: '#111827' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  remember: { fontSize: 14, color: '#374151' },
  forgot: { fontSize: 14, color: '#3b82f6' },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
  },
  signupLink: { color: '#3b82f6', marginTop: 4 },
});

/* memoized input so focus doesn't get stolen */
const InputField = memo(function InputField({
  icon: Icon,
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showPasswordToggle = false,
  onTogglePassword,
  ...rest
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon color="#6b7280" size={20} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={String(value ?? '')}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          returnKeyType="next"
          {...rest}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={onTogglePassword}>
            {secureTextEntry ? (
              <Eye size={20} color="#6b7280" />
            ) : (
              <EyeOff size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default function Login() {
  const navigation = useNavigation();
  const API_BASE = 'http://10.0.2.2:5000';
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(isVisible, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      if (!form.email || !form.password) {
        setMessage('Please enter both email and password.');
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage(json.message || 'Login failed. Check credentials.');
        setIsLoading(false);
        return;
      }

      // support multiple response shapes
      const token =
        json.token || json.data?.token || (json.user && json.token) || null;
      const user = json.user || json.data?.user || json.user || json;

      try {
        if (token) await AsyncStorage.setItem('token', token);
        if (user) await AsyncStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        // ignore storage errors
      }

      setMessage('Login successful!');
      setTimeout(() => navigation.navigate('dashboard'), 600);
    } catch (e) {
      setMessage(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#eff6ff', '#ffffff', '#ecfdf5']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: isVisible,
            transform: [
              {
                translateY: isVisible.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/images/cd774852582f4e41232a6ebd5886e0bc-removebg-preview.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your MedTrap account</Text>
          </View>

          <InputField
            icon={Mail}
            label="Email Address"
            placeholder="Enter your email address"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <InputField
            icon={Lock}
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(s => !s)}
          />

          <View style={styles.row}>
            <Text style={styles.remember}>Remember me</Text>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {message !== '' && (
            <View
              style={[
                styles.messageBox,
                message.includes('successful')
                  ? styles.successBox
                  : styles.errorBox,
              ]}
            >
              {message.includes('successful') ? (
                <CheckCircle
                  size={20}
                  color="green"
                  style={{ marginRight: 8 }}
                />
              ) : (
                <AlertCircle size={20} color="red" style={{ marginRight: 8 }} />
              )}
              <Text
                style={{
                  color: message.includes('successful') ? 'green' : 'red',
                }}
              >
                {message}
              </Text>
            </View>
          )}

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text>New to MedTrap?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('signup')}>
              <Text style={styles.signupLink}>Create your account</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              🔒 Protected by industry-standard security measures
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}
