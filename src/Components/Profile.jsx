// src/Components/Profile.jsx
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
import Icon from 'react-native-vector-icons/Feather';

const API_BASE = 'http://10.0.2.2:5000';

function getAddress(u) {
  if (!u) return null;
  if (typeof u.address === 'string' && u.address.trim())
    return u.address.trim();
  const a = u.address || {};
  const line = [a.street, a.city, a.state, a.pincode]
    .filter(Boolean)
    .join(', ');
  return line || null;
}

function getLicenseImageUri(u) {
  if (!u) return null;
  const img = u.drugLicenseImage;
  if (!img) return null;

  let uri = null;
  if (typeof img === 'string') uri = img;
  if (typeof img === 'object') uri = img.url || img.path || img.uri || null;

  if (!uri) return null;
  if (/^https?:\/\//i.test(uri)) return uri;
  if (uri.startsWith('/')) return `${API_BASE}${uri}`;
  return uri;
}

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    navigation.reset({ index: 0, routes: [{ name: 'login' }] });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const res = await fetch(`${API_BASE}/api/owner/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data || json.user || json);
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(json.data || json.user || json),
        );
      } else {
        setError(`Failed to refresh: ${res.status}`);
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

  const address = getAddress(user);
  const licenseUri = getLicenseImageUri(user);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      {!!error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Store Information</Text>
        <Text>Medical Store Name: {user.medicalName || '-'}</Text>
        <Text>Owner Name: {user.ownerName || '-'}</Text>
        <Text>Email: {user.email || '-'}</Text>
        <Text>Contact Number: {user.contactNo || '-'}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location & License</Text>
        <Text>Store Address: {address || 'Not provided'}</Text>
        <Text>Drug License No: {user.drugLicenseNo || 'Not provided'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Drug License Image</Text>
        {licenseUri ? (
          <Image
            source={{ uri: licenseUri }}
            style={styles.licenseImage}
            resizeMode="contain"
          />
        ) : (
          <Text>No image uploaded</Text>
        )}
      </View>

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
