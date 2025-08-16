import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MapPin, Phone, ChevronLeft, X, Package } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import tailwind from 'tailwind-rn';

export default function CompanyResult() {
  const route = useRoute();
  const navigation = useNavigation();
  const { company, stockists } = route.params || {};
  const [selectedStockist, setSelectedStockist] = useState(null);

  if (!company || !stockists || stockists.length === 0) {
    return (
      <View style={tailwind('flex-1 items-center justify-center bg-blue-50')}>
        <View
          style={tailwind(
            'p-8 bg-white rounded-xl shadow-lg max-w-sm w-11/12 items-center',
          )}
        >
          <Package size={48} color="#3B82F6" style={tailwind('mb-6')} />
          <Text style={tailwind('text-3xl font-bold text-gray-800 mb-4')}>
            No Results Found
          </Text>
          <Text style={tailwind('text-lg text-gray-600 text-center')}>
            Please try searching for a different company.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tailwind('mt-8 bg-blue-600 rounded-lg px-6 py-3')}
          >
            <Text style={tailwind('text-white font-medium text-center')}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const StockistCard = ({ stockist, index }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      exiting={FadeOut}
      style={tailwind('bg-white rounded-xl shadow-lg overflow-hidden m-2 w-72')}
    >
      <TouchableOpacity onPress={() => setSelectedStockist(index)}>
        {stockist.image && (
          <View style={{ height: 180 }}>
            <Image
              source={{ uri: stockist.image }}
              style={{ width: '100%', height: '100%' }}
            />
            <View style={tailwind('absolute inset-0 bg-black opacity-40')} />
          </View>
        )}
        <View style={tailwind('p-5')}>
          <Text style={tailwind('text-xl font-bold text-gray-800 mb-2')}>
            {stockist.title}
          </Text>

          {stockist.address && (
            <View style={tailwind('flex-row items-start mt-3')}>
              <MapPin size={16} color="#4B5563" style={tailwind('mr-2 mt-1')} />
              <Text style={tailwind('text-sm text-gray-600 flex-1')}>
                {stockist.address}
              </Text>
            </View>
          )}

          {stockist.phone && (
            <View style={tailwind('flex-row items-center mt-3')}>
              <Phone size={16} color="#4B5563" style={tailwind('mr-2')} />
              <Text style={tailwind('text-sm text-gray-600')}>
                {stockist.phone}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={tailwind('mt-4 pt-4 border-t border-gray-100')}
          >
            <Text style={tailwind('text-blue-600 text-center font-medium')}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const StockistDetails = ({ stockist }) => (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={tailwind('bg-white rounded-xl shadow-xl overflow-hidden')}
    >
      <View style={{ position: 'relative' }}>
        {stockist.image ? (
          <Image
            source={{ uri: stockist.image }}
            style={{ width: '100%', height: 250 }}
          />
        ) : (
          <View style={tailwind('bg-blue-600 p-6')}>
            <Text style={tailwind('text-3xl font-bold text-white')}>
              {stockist.title}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => setSelectedStockist(null)}
          style={tailwind('absolute top-4 right-4 bg-white rounded-full p-2')}
        >
          <X size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <View style={tailwind('p-6')}>
        {stockist.address && (
          <View style={tailwind('flex-row mb-4')}>
            <MapPin size={20} color="#2563EB" style={tailwind('mr-3 mt-1')} />
            <View>
              <Text style={tailwind('font-semibold text-gray-700')}>
                Address
              </Text>
              <Text style={tailwind('text-gray-600')}>{stockist.address}</Text>
            </View>
          </View>
        )}
        {stockist.phone && (
          <View style={tailwind('flex-row mb-4')}>
            <Phone size={20} color="#2563EB" style={tailwind('mr-3 mt-1')} />
            <View>
              <Text style={tailwind('font-semibold text-gray-700')}>Phone</Text>
              <Text style={tailwind('text-gray-600')}>{stockist.phone}</Text>
            </View>
          </View>
        )}

        {stockist.medicines && stockist.medicines.length > 0 && (
          <View style={tailwind('mt-6')}>
            <Text style={tailwind('text-xl font-bold mb-4 text-gray-800')}>
              Available Medicines
            </Text>
            {stockist.medicines.map((medicine, idx) => (
              <View key={idx} style={tailwind('flex-row mb-2')}>
                <View
                  style={tailwind(
                    'bg-blue-100 rounded-full h-6 w-6 items-center justify-center mr-3',
                  )}
                >
                  <Text style={tailwind('text-blue-800 font-medium')}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={tailwind('text-gray-700')}>{medicine}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => setSelectedStockist(null)}
          style={tailwind(
            'mt-8 bg-blue-600 rounded-lg px-6 py-3 flex-row items-center justify-center',
          )}
        >
          <ChevronLeft size={18} color="white" style={tailwind('mr-2')} />
          <Text style={tailwind('text-white font-medium')}>
            Back to All Stockists
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <ScrollView style={tailwind('flex-1 bg-blue-50 p-4')}>
      <View style={tailwind('bg-white rounded-xl shadow-md p-6 mb-8')}>
        <Text style={tailwind('text-3xl font-bold text-gray-800')}>
          <Text style={tailwind('text-blue-600')}>{company}</Text> Stockists
        </Text>
        <Text style={tailwind('mt-2 text-gray-600')}>
          {stockists.length} locations found
        </Text>
      </View>

      {selectedStockist === null ? (
        stockists.map((s, i) => <StockistCard key={i} stockist={s} index={i} />)
      ) : (
        <StockistDetails stockist={stockists[selectedStockist]} />
      )}
    </ScrollView>
  );
}
