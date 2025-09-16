import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiUrl } from './config/api';
import axios from 'axios';

export default function StaffCreateScreen() {
  const [form, setForm] = useState({
    fullName: '',
    contact: '',
    email: '',
    address: '',
  });
  const [image, setImage] = useState(null);
  const [aadhar, setAadhar] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async setter => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'ImagePicker error');
        return;
      }

      const asset = res.assets && res.assets[0];
      if (!asset) return;

      // asset.uri, asset.fileName, asset.type
      setter({
        uri: asset.uri,
        name: asset.fileName || `photo-${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      });
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', String(err));
    }
  };

  const submit = async () => {
    if (!image || !aadhar) {
      Alert.alert('Missing files', 'Please attach image and aadhar card.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('contact', form.contact);
      fd.append('email', form.email);
      fd.append('address', form.address);

      // On React Native append a file object that has uri, name, type
      fd.append('image', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      });

      fd.append('aadharCard', {
        uri: aadhar.uri,
        name: aadhar.name,
        type: aadhar.type,
      });

      let data = {};
      try {
        const resp = await axios.post(apiUrl('/api/staff'), fd, {
          headers: {
            // Let axios/React Native set the correct multipart headers.
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        data = resp.data || {};

        const id = data?.data?._id;
        Alert.alert('Success', 'Staff created');
        if (id) navigation.navigate('Staff', { id });
        else navigation.navigate('Staffs');
      } catch (err) {
        // axios error shape: err.response?.data
        const msg =
          err?.response?.data?.message || err?.message || 'Request failed';
        Alert.alert('Error', String(msg));
      }
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Create Staff</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={form.fullName}
          onChangeText={t => setForm(f => ({ ...f, fullName: t }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Contact"
          value={form.contact}
          keyboardType="phone-pad"
          onChangeText={t => setForm(f => ({ ...f, contact: t }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          keyboardType="email-address"
          onChangeText={t => setForm(f => ({ ...f, email: t }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={form.address}
          onChangeText={t => setForm(f => ({ ...f, address: t }))}
        />

        <View style={styles.fileRow}>
          <View style={styles.fileBox}>
            <Text style={styles.fileLabel}>Image (photo)</Text>
            <TouchableOpacity
              style={styles.fileBtn}
              onPress={() => pickImage(setImage)}
            >
              <Text style={styles.fileBtnText}>Choose</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image.uri }} style={styles.preview} />
            )}
          </View>

          <View style={styles.fileBox}>
            <Text style={styles.fileLabel}>Aadhar Card (image)</Text>
            <TouchableOpacity
              style={styles.fileBtn}
              onPress={() => pickImage(setAadhar)}
            >
              <Text style={styles.fileBtnText}>Choose</Text>
            </TouchableOpacity>
            {aadhar && (
              <Image source={{ uri: aadhar.uri }} style={styles.preview} />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Staff</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  fileRow: {
    flexDirection: 'column',
    gap: 12,
  },
  fileBox: {
    marginBottom: 12,
  },
  fileLabel: {
    marginBottom: 6,
    color: '#4B5563',
  },
  fileBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  fileBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  preview: {
    width: 120,
    height: 80,
    marginTop: 8,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
