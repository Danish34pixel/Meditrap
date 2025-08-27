import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather'; // or lucide-react-native
// import { User, Building2, Mail, Phone, MapPin, FileText, Image as ImageIcon, LogOut } from "lucide-react-native"

const Profile = () => {
  const navigation = useNavigation();
  // start with no user — we'll load from AsyncStorage or API
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = 'http://10.0.2.2:5000'; // emulator -> host

  useEffect(() => {
    // Load cached user or fetch from API if token present
    const loadProfile = async () => {
      setLoading(true);
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Remove leftover sample data if present
            if (
              parsed.medicalName === 'Sample Medical Store' &&
              (parsed.ownerName === 'John Doe' ||
                parsed.email === 'john@medicalstore.com')
            ) {
              await AsyncStorage.removeItem('user');
              // don't set the sample as the active user
            } else {
              setUser(parsed);
            }
          } catch (e) {
            // malformed stored user — ignore
            setUser(null);
          }
        }

        if (token) {
          // fetch latest profile
          const res = await fetch(`${API_BASE}/api/user/me`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const json = await res.json();
            // support multiple response shapes: { data: { ... } } or { user: { ... } } or direct
            const profile =
              json && (json.data || json.user)
                ? json.data || json.user
                : json || null;
            if (profile) {
              setUser(profile);
              await AsyncStorage.setItem('user', JSON.stringify(profile));
            }
          } else {
            // ignore fetch errors but set message
            const text = await res.text();
            setError(`Failed to fetch profile: ${res.status} ${text}`);
          }
        }
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    // Simulate logout
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('user');
    navigation.navigate('login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No token available to refresh profile');
        setRefreshing(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/user/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setUser(json.data);
          await AsyncStorage.setItem('user', JSON.stringify(json.data));
        }
      } else {
        const text = await res.text();
        setError(`Failed to refresh: ${res.status} ${text}`);
      }
    } catch (e) {
      setError(e.message || 'Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.authCard}>
          <Icon name="user" size={32} color="#ca8a04" />
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authText}>
            Please log in to view your profile.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="user" size={48} color="#2563eb" />
        </View>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <Text style={styles.headerSubtitle}>
          Manage your medical store information
        </Text>
      </View>

      {loading && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text>Loading your profile...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Store Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Store Information</Text>
        <Text>Medical Store Name: {user.medicalName}</Text>
        <Text>Owner Name: {user.ownerName}</Text>
        <Text>Email: {user.email}</Text>
        <Text>Contact Number: {user.contactNo}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location & License */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location & License</Text>
        <Text>
          Store Address:{' '}
          {user.address
            ? typeof user.address === 'string'
              ? user.address
              : `${user.address.street || ''} ${user.address.city || ''} ${
                  user.address.state || ''
                } ${user.address.pincode || ''}`.trim()
            : 'Not provided'}
        </Text>
        <Text>Drug License No: {user.drugLicenseNo || 'Not provided'}</Text>
      </View>

      {/* License Image */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Drug License Image</Text>
        {user.drugLicenseImage ? (
          (() => {
            const img = user.drugLicenseImage;
            let uri = null;
            if (typeof img === 'string') {
              uri = img.startsWith('http') ? img : `${API_BASE}${img}`;
            } else if (img && typeof img === 'object') {
              uri = img.url || img.path || img.uri || null;
              if (uri && !uri.startsWith('http'))
                uri = uri.startsWith('/') ? `${API_BASE}${uri}` : uri;
            }

            if (uri) {
              return (
                <Image
                  source={{ uri }}
                  style={styles.licenseImage}
                  resizeMode="contain"
                />
              );
            }

            // fallback: show local file path if available
            if (img && img.path) {
              return (
                <Image source={{ uri: img.path }} style={styles.licenseImage} />
              );
            }

            return <Text>No image uploaded</Text>;
          })()
        ) : (
          <Text>No image uploaded</Text>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0fdf4' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  authCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  authTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  authText: { textAlign: 'center', color: '#666' },
  loginButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
  },
  loginButtonText: { color: 'white', fontWeight: 'bold' },
  header: { alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#dbeafe',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2563eb' },
  headerSubtitle: { color: '#555' },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  errorCard: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: '#b91c1c' },
  licenseImage: { width: '100%', height: 200, backgroundColor: 'white' },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: 'white', marginLeft: 8, fontWeight: 'bold' },
  refreshButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  refreshText: { color: '#3730a3', fontWeight: '600' },
});

export default Profile;
