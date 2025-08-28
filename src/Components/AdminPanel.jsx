import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminPanel({ navigation }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setIsAdmin(user && user.role === 'admin');
      } catch (err) {
        console.warn('AdminPanel: could not read user from storage', err);
      }
    })();
  }, []);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Admin Panel</Text>
        <Text style={styles.notice}>
          You must be an admin to access this page.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Admin Panel</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('adminCreateStockist')}
      >
        <Text style={styles.buttonText}>Create Stockist</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('adminCreateCompany')}
      >
        <Text style={styles.buttonText}>Create Company</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('adminCreateMedicine')}
      >
        <Text style={styles.buttonText}>Create Medicine</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1F2937',
  },
  notice: { color: '#6B7280' },
  button: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: { color: 'white', fontWeight: '600', textAlign: 'center' },
});
