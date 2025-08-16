import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function StockistResult() {
  const route = useRoute();
  const navigation = useNavigation();
  const { company, stockists } = route.params || {};
  const [selectedStockist, setSelectedStockist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStockists, setFilteredStockists] = useState([]);

  useEffect(() => {
    if (stockists) {
      setFilteredStockists(stockists);
    }
  }, [stockists]);

  useEffect(() => {
    if (stockists) {
      const filtered = stockists.filter(
        stockist =>
          stockist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (stockist.address &&
            stockist.address.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredStockists(filtered);
    }
  }, [searchTerm, stockists]);

  if (!company || !stockists || stockists.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="business" size={48} color="#2563eb" />
        <Text style={styles.noResultsTitle}>No Results Found</Text>
        <Text style={styles.noResultsText}>
          Please try searching for a different company or stockist.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStockistCard = (stockist, index) => (
    <TouchableOpacity
      key={index}
      style={styles.card}
      onPress={() => setSelectedStockist(index)}
    >
      {stockist.image ? (
        <Image source={{ uri: stockist.image }} style={styles.cardImage} />
      ) : (
        <View style={styles.noImage}>
          <Icon name="image" size={48} color="#d1d5db" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{stockist.title}</Text>
        {stockist.phone && (
          <View style={styles.cardRow}>
            <Icon name="call" size={16} color="#2563eb" style={styles.icon} />
            <Text style={styles.cardText}>{stockist.phone}</Text>
          </View>
        )}
        {stockist.address && (
          <View style={styles.cardRow}>
            <Icon
              name="location"
              size={16}
              color="#2563eb"
              style={styles.icon}
            />
            <Text style={styles.cardText}>{stockist.address}</Text>
          </View>
        )}
        <View style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (selectedStockist !== null) {
    const stockist = stockists[selectedStockist];
    return (
      <ScrollView style={styles.detailsContainer}>
        {stockist.image ? (
          <Image source={{ uri: stockist.image }} style={styles.detailsImage} />
        ) : (
          <View style={[styles.detailsImage, { backgroundColor: '#2563eb' }]} />
        )}
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>{stockist.title}</Text>
          <TouchableOpacity
            onPress={() => setSelectedStockist(null)}
            style={styles.closeButton}
          >
            <Icon name="close" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        {stockist.phone && (
          <View style={styles.detailRow}>
            <Icon name="call" size={20} color="#2563eb" style={styles.icon} />
            <Text style={styles.detailText}>{stockist.phone}</Text>
          </View>
        )}
        {stockist.address && (
          <View style={styles.detailRow}>
            <Icon
              name="location"
              size={20}
              color="#2563eb"
              style={styles.icon}
            />
            <Text style={styles.detailText}>{stockist.address}</Text>
          </View>
        )}
        {stockist.items && stockist.items.length > 0 && (
          <View style={styles.itemsList}>
            <Text style={styles.itemsTitle}>Available Items</Text>
            {stockist.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemNumber}>{idx + 1}</Text>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={() => setSelectedStockist(null)}
        >
          <Icon name="arrow-back" size={18} color="#fff" />
          <Text style={styles.backToListText}>Back to Stockists</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Stockists <Text style={{ color: '#2563eb' }}>{company}</Text>
        </Text>
        {filteredStockists.length > 0 && (
          <Text style={styles.locationCount}>
            {filteredStockists.length}{' '}
            {filteredStockists.length === 1 ? 'location' : 'locations'} found
          </Text>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search stockists by name or address..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {filteredStockists.map(renderStockistCard)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', padding: 16 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  locationCount: {
    marginTop: 4,
    fontSize: 14,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: { height: 150, width: '100%' },
  noImage: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  icon: { marginRight: 6 },
  cardText: { fontSize: 14, color: '#4b5563' },
  detailsButton: {
    marginTop: 8,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: { color: '#1d4ed8', fontWeight: '500' },
  detailsContainer: { flex: 1, backgroundColor: '#fff' },
  detailsImage: { height: 200, width: '100%' },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  detailsTitle: { fontSize: 22, fontWeight: 'bold' },
  closeButton: {
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderRadius: 20,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  detailText: { fontSize: 16, color: '#374151' },
  itemsList: { padding: 16 },
  itemsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemNumber: {
    backgroundColor: '#bfdbfe',
    color: '#1e40af',
    fontWeight: 'bold',
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    marginRight: 8,
  },
  itemText: { fontSize: 16, color: '#374151' },
  backToListButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  backToListText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  noResultsTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
  noResultsText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  backButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontWeight: '500' },
});
