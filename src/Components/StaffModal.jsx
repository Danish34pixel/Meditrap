// StaffModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { apiUrl } from './config/api';

export default function StaffModal({ staff, onClose, visible = !!staff }) {
  const navigation = useNavigation();

  if (!staff) return null;

  // Try to derive frontend base from apiUrl('/') by removing '/api' if present
  const deriveFrontendBase = () => {
    try {
      const maybe = apiUrl('/'); // e.g. https://example.com/api/
      if (!maybe) return '';
      let b = maybe.replace(/\/+$/, '');
      b = b.replace(/\/api$/, '');
      return b;
    } catch (e) {
      return '';
    }
  };

  const frontendBase = deriveFrontendBase();
  const url = frontendBase
    ? `${frontendBase}/staff/${staff._id}`
    : `/staff/${staff._id}`;

  const safeImage = img => {
    if (!img) return null;
    try {
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      return `${frontendBase}${img}`;
    } catch (e) {
      return `${frontendBase}${img}`;
    }
  };

  const openFull = () => {
    // navigate to native Staff screen. Make sure route name matches your navigator.
    navigation.navigate('Staff', { id: staff._id });
    onClose && onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <View style={styles.row}>
            <Image
              source={{ uri: safeImage(staff.image) || undefined }}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.name}>{staff.fullName}</Text>
              {staff.contact ? (
                <Text style={styles.meta}>{staff.contact}</Text>
              ) : null}
              {staff.email ? (
                <Text style={styles.meta}>{staff.email}</Text>
              ) : null}
              {staff.address ? (
                <Text style={styles.meta}>{staff.address}</Text>
              ) : null}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.qrWrap}>
              <QRCode value={url} size={120} />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.openBtn} onPress={openFull}>
                <Text style={styles.openText}>Open Full</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  box: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    // shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    // elevation for Android
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    padding: 6,
  },
  closeText: {
    color: '#6B7280',
    fontWeight: '600',
  },

  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrWrap: {
    // keep QR on left
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  openBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  openText: {
    color: '#fff',
    fontWeight: '700',
  },
});
