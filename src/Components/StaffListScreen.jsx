import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiUrl } from './config/api';
import StaffCard from './StaffCard'; // must be RN component
import StaffModal from './StaffModal'; // must be RN component

export default function StaffListScreen() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/staff'));
        const data = await res.json().catch(() => ({}));
        if (res.ok && alive && data?.data) setStaffs(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const openCreate = () => {
    // navigate to your create screen (ensure route registered)
    navigation.navigate('AdminCreateStaff');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('StaffDetails', { id: item._id })}
    >
      <StaffCard staff={item} onOpen={st => setSelected(st)} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Staff</Text>
        <TouchableOpacity onPress={openCreate}>
          <Text style={styles.create}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 12 }} />
      ) : (
        <>
          {staffs.length === 0 ? (
            <Text style={styles.empty}>No staff found</Text>
          ) : (
            <FlatList
              data={staffs}
              keyExtractor={i => i._id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </>
      )}

      {selected && (
        <StaffModal staff={selected} onClose={() => setSelected(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  create: {
    color: '#059669',
    fontWeight: '600',
  },
  sep: {
    height: 12,
  },
  empty: {
    color: '#6B7280',
    marginTop: 12,
  },
});
