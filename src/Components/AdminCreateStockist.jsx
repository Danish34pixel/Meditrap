import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminCreateStockist({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: { street: '', city: '', state: '', pincode: '' },
    licenseNumber: '',
    licenseExpiry: '',
  });
  const [loading, setLoading] = useState(false);

  const setField = (path, value) => {
    if (path.startsWith('address.')) {
      const key = path.split('.')[1];
      setForm(f => ({ ...f, address: { ...f.address, [key]: value } }));
    } else {
      setForm(f => ({ ...f, [path]: value }));
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:5000/api/stockist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', JSON.stringify(data));
      } else {
        Alert.alert('Success', 'Stockist created');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Create Stockist</Text>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={form.name}
          onChangeText={t => setField('name', t)}
        />
        <TextInput
          placeholder="Contact Person"
          style={styles.input}
          value={form.contactPerson}
          onChangeText={t => setField('contactPerson', t)}
        />
        <TextInput
          placeholder="Phone"
          style={styles.input}
          value={form.phone}
          onChangeText={t => setField('phone', t)}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={form.email}
          onChangeText={t => setField('email', t)}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Street"
          style={styles.input}
          value={form.address.street}
          onChangeText={t => setField('address.street', t)}
        />
        <TextInput
          placeholder="City"
          style={styles.input}
          value={form.address.city}
          onChangeText={t => setField('address.city', t)}
        />
        <TextInput
          placeholder="State"
          style={styles.input}
          value={form.address.state}
          onChangeText={t => setField('address.state', t)}
        />
        <TextInput
          placeholder="Pincode"
          style={styles.input}
          value={form.address.pincode}
          onChangeText={t => setField('address.pincode', t)}
          keyboardType="number-pad"
        />
        <TextInput
          placeholder="License Number"
          style={styles.input}
          value={form.licenseNumber}
          onChangeText={t => setField('licenseNumber', t)}
        />
        <TextInput
          placeholder="License Expiry (YYYY-MM-DD)"
          style={styles.input}
          value={form.licenseExpiry}
          onChangeText={t => setField('licenseExpiry', t)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F8FAFC', flexGrow: 1 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
});
