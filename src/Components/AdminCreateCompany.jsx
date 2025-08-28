import React, { useState, useEffect } from 'react';
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

export default function AdminCreateCompany({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    stockists: [], // array of stockist IDs
  });
  const [loading, setLoading] = useState(false);

  const setField = (path, value) => {
    setForm(f => ({ ...f, [path]: value }));
  };

  const [stockistsList, setStockistsList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://10.0.2.2:5000/api/stockist');
        const data = await res.json();
        if (data && data.data) setStockistsList(data.data);
      } catch (err) {
        console.warn('Could not load stockists', err);
      }
    })();
  }, []);

  const toggleStockist = id => {
    setForm(f => ({
      ...f,
      stockists: f.stockists.includes(id)
        ? f.stockists.filter(s => s !== id)
        : [...f.stockists, id],
    }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:5000/api/company', {
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
        Alert.alert('Success', 'Company created');
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
        <Text style={styles.heading}>Create Company</Text>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={form.name}
          onChangeText={t => setField('name', t)}
        />
        <Text style={{ marginTop: 8, marginBottom: 6, fontWeight: '600' }}>
          Assign to stockists (optional)
        </Text>
        {stockistsList.map(s => (
          <TouchableOpacity
            key={s._id}
            style={styles.stockistRow}
            onPress={() => toggleStockist(s._id)}
          >
            <Text style={{ flex: 1 }}>{s.name}</Text>
            <Text>{form.stockists.includes(s._id) ? '✓' : ''}</Text>
          </TouchableOpacity>
        ))}
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
  stockistRow: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
