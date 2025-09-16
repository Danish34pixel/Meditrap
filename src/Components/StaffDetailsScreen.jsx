// StaffDetailsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { apiUrl } from './config/api';

export default function StaffDetailsScreen() {
  const route = useRoute();
  // expects route.params.id (if you navigate: navigation.navigate('StaffDetails',{ id }))
  const id = route?.params?.id;
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to derive frontend base from apiUrl('/') by removing '/api' if present
  const deriveFrontendBase = () => {
    try {
      const maybe = apiUrl('/'); // example: https://example.com/api/
      if (!maybe) return 'https://your-frontend-domain.com';
      // remove trailing slashes
      let b = maybe.replace(/\/+$/, '');
      // if contains '/api' at end, strip it
      b = b.replace(/\/api$/, '');
      return b;
    } catch (e) {
      return 'https://your-frontend-domain.com';
    }
  };

  const frontendBase = deriveFrontendBase();

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) {
        Alert.alert('Error', 'No staff id provided');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(apiUrl(`/api/staff/${id}`));
        const d = await res.json().catch(() => ({}));
        if (res.ok && alive) setStaff(d.data || null);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (!staff)
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Staff not found</Text>
      </View>
    );

  // Determine image src: if starts with http(s) use as-is, else prefix with frontendBase
  const safeImage = img => {
    if (!img) return null;
    try {
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      return `${frontendBase}${img}`;
    } catch (e) {
      return `${frontendBase}${img}`;
    }
  };

  const qrUrl = `${frontendBase}/staff/${staff._id}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: safeImage(staff.image) }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{staff.fullName}</Text>
            {staff.contact ? (
              <Text style={styles.text}>{staff.contact}</Text>
            ) : null}
            {staff.email ? (
              <Text style={styles.text}>{staff.email}</Text>
            ) : null}
            {staff.address ? (
              <Text style={styles.text}>{staff.address}</Text>
            ) : null}
          </View>

          <View style={styles.qrWrap}>
            <QRCode value={qrUrl} size={140} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identity Card</Text>

          <View style={styles.idCard}>
            <Image
              source={{ uri: safeImage(staff.image) }}
              style={styles.idPhoto}
              resizeMode="cover"
            />
            <View style={styles.idInfo}>
              <Text style={styles.idName}>{staff.fullName}</Text>
              {staff.contact ? (
                <Text style={styles.idText}>{staff.contact}</Text>
              ) : null}
              {staff.email ? (
                <Text style={styles.idText}>{staff.email}</Text>
              ) : null}
            </View>
            <View style={styles.smallQr}>
              <QRCode value={qrUrl} size={90} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photo: {
    width: 112,
    height: 112,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
    paddingHorizontal: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  text: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 2,
  },
  qrWrap: {
    marginLeft: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  idCard: {
    borderWidth: 1,
    borderColor: '#E6E9EE',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  idInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  idName: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  idText: {
    color: '#6B7280',
    fontSize: 13,
  },
  smallQr: {
    marginLeft: 8,
  },
  center: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  notFound: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
