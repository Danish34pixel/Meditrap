import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// Minimal presentational card used by StaffListScreen
export default function StaffCard({ staff, onOpen }) {
  const safeImage = img => {
    if (!img) return null;
    try {
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      return img;
    } catch (e) {
      return img;
    }
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onOpen && onOpen(staff)}
    >
      <Image
        source={
          safeImage(staff?.image) ? { uri: safeImage(staff.image) } : undefined
        }
        style={styles.photo}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>
          {staff?.fullName || staff?.name || 'Unknown'}
        </Text>
        {staff?.contact ? (
          <Text style={styles.meta}>{staff.contact}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
  },
  meta: {
    color: '#6B7280',
    marginTop: 4,
  },
});
