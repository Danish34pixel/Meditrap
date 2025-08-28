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

export default function AdminCreateMedicine({ navigation }) {
  const [form, setForm] = useState({ name: '', company: '', stockists: [] });
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [stockistsList, setStockistsList] = useState([]);

  const setField = (path, value) => {
    setForm(f => ({ ...f, [path]: value }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.0.2.2:5000/api/medicine/quick', {
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
        Alert.alert('Success', 'Medicine created');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const cRes = await fetch('http://10.0.2.2:5000/api/company');
        const cData = await cRes.json();
        if (cData && cData.data) setCompanies(cData.data);
      } catch (err) {
        console.warn('Could not load companies', err);
      }
      try {
        const sRes = await fetch('http://10.0.2.2:5000/api/stockist');
        const sData = await sRes.json();
        if (sData && sData.data) setStockistsList(sData.data);
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Create Medicine</Text>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={form.name}
          onChangeText={t => setField('name', t)}
        />
        <Text style={{ marginTop: 8, marginBottom: 6, fontWeight: '600' }}>
          Select Company
        </Text>
        {companies.map(c => (
          <TouchableOpacity
            key={c._id}
            style={styles.stockistRow}
            onPress={() => setField('company', c._id)}
          >
            <Text style={{ flex: 1 }}>{c.name}</Text>
            <Text>{form.company === c._id ? '✓' : ''}</Text>
          </TouchableOpacity>
        ))}

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
