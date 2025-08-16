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
import Icon from 'react-native-vector-icons/Feather'; // or lucide-react-native
// import { User, Building2, Mail, Phone, MapPin, FileText, Image as ImageIcon, LogOut } from "lucide-react-native"

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    medicalName: 'Sample Medical Store',
    ownerName: 'John Doe',
    address: '123 Medical Street, City',
    email: 'john@medicalstore.com',
    contactNo: '+91 98765 43210',
    drugLicenseNo: 'DL123456789',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading profile data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    // Simulate logout
    navigation.navigate('login');
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
      </View>

      {/* Location & License */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location & License</Text>
        <Text>Store Address: {user.address}</Text>
        <Text>Drug License No: {user.drugLicenseNo}</Text>
      </View>

      {/* License Image */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Drug License Image</Text>
        {user.drugLicenseImage ? (
          <Image
            source={{
              uri: user.drugLicenseImage.startsWith('http')
                ? user.drugLicenseImage
                : `${API_BASE}${user.drugLicenseImage}`,
            }}
            style={styles.licenseImage}
            resizeMode="contain"
          />
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
});

export default Profile;
