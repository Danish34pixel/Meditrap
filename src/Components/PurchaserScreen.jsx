import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import QRCode from 'react-native-qrcode-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiUrl } from './config/api';

export default function PurchaserScreen() {
  const [purchasers, setPurchasers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    address: '',
    contactNo: '',
    aadharImage: null, // { uri, name, type }
    photo: null, // { uri, name, type }
  });
  const [aadharPreview, setAadharPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPurchasers();
  }, []);

  const fetchPurchasers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl('/api/purchaser'));
      setPurchasers(Array.isArray(res.data?.data) ? res.data.data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch purchasers');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async field => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('ImagePicker Error', res.errorMessage || 'Unknown error');
        return;
      }

      const asset = res.assets && res.assets[0];
      if (!asset) return;

      const file = {
        uri: asset.uri,
        name: asset.fileName || `photo-${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      };

      if (field === 'photo') {
        setForm(f => ({ ...f, photo: file }));
        setPhotoPreview(asset.uri);
      } else {
        setForm(f => ({ ...f, aadharImage: file }));
        setAadharPreview(asset.uri);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', String(err));
    }
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      address: '',
      contactNo: '',
      aadharImage: null,
      photo: null,
    });
    setAadharPreview(null);
    setPhotoPreview(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.aadharImage || !form.photo) {
      setError('Aadhar image and photo are required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('address', form.address);
      formData.append('contactNo', form.contactNo);
      formData.append('aadharImage', {
        uri: form.aadharImage.uri,
        name: form.aadharImage.name,
        type: form.aadharImage.type,
      });
      formData.append('photo', {
        uri: form.photo.uri,
        name: form.photo.name,
        type: form.photo.type,
      });

      await axios.post(apiUrl('/api/purchaser'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      resetForm();
      setFormVisible(false);
      setSuccessMessage('Purchaser added successfully!');
      fetchPurchasers();
      // auto-hide success
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to add purchaser');
    } finally {
      setSubmitting(false);
    }
  };

  // Derive frontend base from apiUrl('/') if possible (strip /api)
  const deriveFrontendBase = () => {
    try {
      const maybe = apiUrl('/');
      if (!maybe) return '';
      let b = maybe.replace(/\/+$/, '');
      b = b.replace(/\/api$/, '');
      return b;
    } catch (e) {
      return '';
    }
  };
  const frontendBase = deriveFrontendBase();

  // Render purchaser card
  const renderCard = ({ item: p }) => {
    const photoUri = p.photo ? p.photo : null;

    const qrValue = frontendBase
      ? `${frontendBase}/purchaser/${p._id}`
      : `/purchaser/${p._id}`;

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.profile}>
            <View style={styles.avatarWrap}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarPlaceholder}>🧑‍💼</Text>
              )}
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{p.fullName}</Text>
              <Text style={styles.address}>{p.address}</Text>
              <View style={styles.contactBadge}>
                <Text style={styles.contactEmoji}>📱</Text>
                <Text style={styles.contactText}>{p.contactNo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.idBox}>
            <Text style={styles.idLabel}>ID</Text>
            <Text style={styles.idMono}>{p._id}</Text>
          </View>
        </View>

        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>QR Code</Text>
          <View style={styles.qrBox}>
            <QRCode value={qrValue} size={120} />
          </View>
          <Text style={styles.qrCaption}>Scan to view profile</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#e6f4ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Success message */}
        {successMessage ? (
          <View style={styles.successBanner}>
            <View style={styles.successLeft}>
              <Text style={{ fontSize: 22 }}>✅</Text>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.successTitle}>{successMessage}</Text>
                <Text style={styles.successSub}>
                  QR code has been generated for the new purchaser.
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSuccessMessage('')}>
              <Text style={styles.successClose}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Purchasers list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧑‍💼 Purchasers</Text>
            <Text style={styles.sectionCount}>Total: {purchasers.length}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={styles.loadingText}>Loading purchasers...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : purchasers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text>No purchasers found. Add your first purchaser below!</Text>
            </View>
          ) : (
            <FlatList
              data={purchasers}
              keyExtractor={i => i._id}
              renderItem={renderCard}
              horizontal={false}
              numColumns={1}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>

        {/* Add Purchaser Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>➕ Add New Purchaser</Text>

            {!formVisible && (
              <TouchableOpacity
                style={styles.addAnotherBtn}
                onPress={() => {
                  setFormVisible(true);
                  setSuccessMessage('');
                  setError(null);
                }}
              >
                <Text style={styles.addAnotherText}>Add Another</Text>
              </TouchableOpacity>
            )}
          </View>

          {formVisible ? (
            <>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    value={form.fullName}
                    onChangeText={t => setForm(f => ({ ...f, fullName: t }))}
                    placeholder="Enter full name"
                    style={styles.input}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Contact Number *</Text>
                  <TextInput
                    value={form.contactNo}
                    onChangeText={t => setForm(f => ({ ...f, contactNo: t }))}
                    placeholder="Enter contact number"
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  value={form.address}
                  onChangeText={t => setForm(f => ({ ...f, address: t }))}
                  placeholder="Enter complete address"
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.input,
                    { minHeight: 80, textAlignVertical: 'top' },
                  ]}
                />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Purchaser Photo *</Text>
                  <TouchableOpacity
                    style={styles.fileBtn}
                    onPress={() => pickImage('photo')}
                  >
                    <Text style={styles.fileBtnText}>Choose Photo</Text>
                  </TouchableOpacity>
                  {photoPreview && (
                    <Image
                      source={{ uri: photoPreview }}
                      style={styles.preview}
                    />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Aadhar Image *</Text>
                  <TouchableOpacity
                    style={styles.fileBtn}
                    onPress={() => pickImage('aadhar')}
                  >
                    <Text style={styles.fileBtnText}>Choose Aadhar</Text>
                  </TouchableOpacity>
                  {aadharPreview && (
                    <Image
                      source={{ uri: aadharPreview }}
                      style={styles.previewAadhar}
                    />
                  )}
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    submitting ? { backgroundColor: '#7dd3fc' } : null,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <ActivityIndicator color="#fff" />
                      <Text style={[styles.submitText, { marginLeft: 8 }]}>
                        Adding Purchaser...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitText}>Add Purchaser</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetBtn} onPress={resetForm}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.successView}>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text style={styles.successTitle}>
                Purchaser Added Successfully!
              </Text>
              <Text style={{ color: '#065f46', marginTop: 6 }}>
                QR code has been generated and the purchaser is now listed
                above.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  successBanner: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successLeft: { flexDirection: 'row', alignItems: 'center' },
  successTitle: { color: '#065f46', fontWeight: '700' },
  successSub: { color: '#065f46', fontSize: 12 },
  successClose: { color: '#065f46', fontSize: 22, fontWeight: '700' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#075985' },
  sectionCount: { color: '#0ea5e9', fontWeight: '600' },

  loadingRow: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flexDirection: 'row',
  },
  loadingText: { marginLeft: 12, color: '#0ea5e9' },

  errorBox: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: { color: '#b91c1c' },

  emptyBox: { alignItems: 'center', padding: 20 },

  cardWrapper: { alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6f2fb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  profile: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 96,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { fontSize: 36 },
  info: { flex: 1 },
  name: { color: '#075985', fontSize: 18, fontWeight: '700' },
  address: { color: '#475569', marginTop: 6 },
  contactBadge: {
    marginTop: 8,
    backgroundColor: '#e0f2fe',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactEmoji: { marginRight: 6 },
  contactText: { color: '#0f172a', fontWeight: '600' },

  idBox: {
    marginTop: 12,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  idLabel: { fontSize: 11, color: '#94a3b8' },
  idMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#475569',
  },

  qrCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f2fb',
  },
  qrTitle: { color: '#075985', fontWeight: '600', marginBottom: 8 },
  qrBox: { marginBottom: 6 },

  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#075985' },
  addAnotherBtn: {
    backgroundColor: '#0369a1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addAnotherText: { color: '#fff', fontWeight: '700' },

  label: { fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f0f9ff',
  },

  fileBtn: {
    backgroundColor: '#38bdf8',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  fileBtnText: { color: '#fff', fontWeight: '700' },
  preview: { width: 80, height: 80, borderRadius: 40, marginTop: 8 },
  previewAadhar: { width: 160, height: 100, borderRadius: 8, marginTop: 8 },

  formActions: { flexDirection: 'row', marginTop: 12 },
  submitBtn: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  submitText: { color: '#fff', fontWeight: '800' },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: { color: '#0369a1', fontWeight: '700' },

  successView: { alignItems: 'center', paddingVertical: 20 },
});
