// MedicineRes.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

export default function MedicineRes() {
  const route = useRoute();
  const navigation = useNavigation();
  const { medicine, stockists } = route.params || {};

  const [selectedStockist, setSelectedStockist] = useState(null);
  const [searchQuery, setSearchQuery] = useState(medicine || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!medicine || !stockists || stockists.length === 0) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.noResultsBox}>
          <View style={styles.iconCircleRed}>
            <Icon name="x" size={40} color="#ef4444" />
          </View>
          <Text style={styles.noResultsTitle}>No Results Found</Text>
          <Text style={styles.noResultsText}>
            We couldn't find any stockists for your search. Please try searching
            for a different medicine.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const filteredStockists = stockists.filter(stockist =>
    stockist.Medicines?.some(med =>
      med.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const StockistCard = ({ stockist }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedStockist(stockist)}
    >
      {stockist.image ? (
        <Image source={{ uri: stockist.image }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Icon name="store" size={40} color="#fff" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{stockist.title}</Text>
        {stockist.phone && (
          <View style={styles.cardRow}>
            <Icon name="phone" size={16} color="#2563eb" />
            <Text style={styles.cardText}>{stockist.phone}</Text>
          </View>
        )}
        {stockist.address && (
          <View style={styles.cardRow}>
            <Icon name="map-pin" size={16} color="#2563eb" />
            <Text style={styles.cardText}>{stockist.address}</Text>
          </View>
        )}
        <View style={styles.cardRow}>
          <Icon name="pill" size={16} color="#2563eb" />
          <Text style={styles.cardText}>
            {stockist.Medicines?.length || 0} medicine(s) available
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading stockists...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4ff' }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Medicine Stockists</Text>
          <Text style={styles.headerSubtitle}>
            Showing stockists with{' '}
            <Text style={{ color: '#2563eb' }}>{medicine}</Text>
          </Text>
        </View>
        <View style={styles.searchBox}>
          <Icon
            name="search"
            size={18}
            color="#9ca3af"
            style={{ marginLeft: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Info box */}
      <View style={styles.infoBox}>
        <Icon name="pill" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={{ color: '#fff', flex: 1 }}>
          Supporting local stockists ensures you get authentic medicines and
          personalized service.
        </Text>
      </View>

      {/* Stockist list */}
      {filteredStockists.length > 0 ? (
        <FlatList
          data={filteredStockists}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <StockistCard stockist={item} />}
          contentContainerStyle={{ padding: 12 }}
        />
      ) : (
        <View style={styles.centerScreen}>
          <Text>No stockists found for "{searchQuery}"</Text>
        </View>
      )}

      {/* Stockist Details Modal */}
      <Modal visible={!!selectedStockist} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              onPress={() => setSelectedStockist(null)}
              style={styles.modalClose}
            >
              <Icon name="chevron-left" size={24} color="#000" />
            </TouchableOpacity>
            {selectedStockist && (
              <ScrollView>
                {selectedStockist.image && (
                  <Image
                    source={{ uri: selectedStockist.image }}
                    style={styles.modalImage}
                  />
                )}
                <Text style={styles.modalTitle}>{selectedStockist.title}</Text>
                <Text style={styles.modalSubtitle}>Contact Information</Text>
                {selectedStockist.phone && (
                  <Text>📞 {selectedStockist.phone}</Text>
                )}
                {selectedStockist.address && (
                  <Text>📍 {selectedStockist.address}</Text>
                )}
                <Text style={styles.modalSubtitle}>Available Medicines</Text>
                {selectedStockist.Medicines?.map((med, i) => (
                  <Text key={i}>💊 {med}</Text>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  noResultsBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  iconCircleRed: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  noResultsTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  noResultsText: { textAlign: 'center', color: '#4b5563', marginBottom: 12 },
  backButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
  header: {
    padding: 12,
    backgroundColor: '#f0f4ff',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { color: '#4b5563' },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 12,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 150 },
  cardImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardText: { marginLeft: 6, color: '#4b5563' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    maxHeight: '90%',
  },
  modalClose: { marginBottom: 8 },
  modalImage: { width: '100%', height: 180, borderRadius: 8 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  modalSubtitle: { fontWeight: 'bold', marginTop: 10 },
});
