// Login.js
import React, { useState, useEffect } from 'react';
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

export default function Login() {
  const navigation = useNavigation();
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

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setMessage('');

    // Simulate login process
    setTimeout(() => {
      if (form.email && form.password) {
        setMessage('Login successful!');
        setTimeout(() => navigation.navigate('dashboard'), 1000);
      } else {
        setMessage('Please enter both email and password.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const InputField = ({
    icon: Icon,
    label,
    name,
    placeholder,
    secureTextEntry,
    showPasswordToggle = false,
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon color="#6b7280" size={20} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={showPasswordToggle ? !showPassword : secureTextEntry}
          value={form[name]}
          onChangeText={value => handleChange(name, value)}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#eff6ff', '#ffffff', '#ecfdf5']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
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

          {/* Input Fields */}
          <InputField
            icon={Mail}
            label="Email Address"
            name="email"
            placeholder="Enter your email address"
          />
          <InputField
            icon={Lock}
            label="Password"
            name="password"
            placeholder="Enter your password"
            secureTextEntry
            showPasswordToggle
          />

          {/* Remember me + Forgot password */}
          <View style={styles.row}>
            <Text style={styles.remember}>Remember me</Text>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
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

          {/* Message */}
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

          {/* Create Account */}
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text>New to MedTrap?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('signup')}>
              <Text style={styles.signupLink}>Create your account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 5,
  },
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
  input: {
    flex: 1,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  remember: {
    fontSize: 14,
    color: '#374151',
  },
  forgot: {
    fontSize: 14,
    color: '#3b82f6',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
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
  signupLink: {
    color: '#3b82f6',
    marginTop: 4,
  },
});
