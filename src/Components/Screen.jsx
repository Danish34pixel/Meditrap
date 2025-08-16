import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Linking,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const Screen = ({ navigation }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [isMobile, setIsMobile] = useState(true); // Always mobile in React Native

  const sectionData = [
    {
      title: 'Amit Marketing',
      phone: '9826000000',
      address: 'NH Road, Indore',
      image: 'https://via.placeholder.com/600x400',
      items: ['Leeford', 'Zevintus'],
      Medicines: ['Tramonil-plus'],
    },
    {
      title: 'Jain Brothers',
      phone: '9826111111',
      address: 'MG Road, Bhopal',
      items: ['Abbott', 'Abb'],
      Medicines: ['Vomiford-md'],
    },
    {
      title: 'Vishal Marketing',
      phone: '9826222222',
      address: 'Station Road, Ujjain',
      items: ['Another Brand 1', 'Another Brand 2'],
      Medicines: ['Dsr', 'Tramonil-plus'],
    },
    {
      title: 'Rajesh Marketing',
      phone: '9826333333',
      address: 'Main Market, Dewas',
      items: ['More Products', 'Leeford', 'Zevintus'],
    },
    {
      title: 'Amit Marketing 2',
      phone: '9826000000',
      address: 'NH Road, Indore',
      items: ['Leeford', 'Zevintus'],
    },
    {
      title: 'Jain Brothers 2',
      phone: '9826444444',
      address: 'MG Road, Bhopal',
      items: ['Abbott', 'Abb'],
    },
    {
      title: 'Vishal Marketing 2',
      phone: '9826555555',
      address: 'Station Road, Ujjain',
      items: ['Another Brand 1', 'Another Brand 2'],
    },
  ];

  const filteredSections = sectionData;

  const generateRandomColor = index => {
    const colors = [
      ['#3B82F6', '#2563EB'], // blue
      ['#8B5CF6', '#7C3AED'], // purple
      ['#6366F1', '#4F46E5'], // indigo
      ['#EC4899', '#DB2777'], // pink
      ['#10B981', '#059669'], // green
      ['#F59E0B', '#D97706'], // yellow
      ['#EF4444', '#DC2626'], // red
    ];
    return colors[index % colors.length];
  };

  const makePhoneCall = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderCard = (section, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.card, { marginBottom: 16 }]}
      onPress={() => setSelectedSection(index)}
      activeOpacity={0.95}
    >
      {section.image ? (
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: section.image }} style={styles.cardImage} />
          <View style={styles.cardImageOverlay} />
        </View>
      ) : (
        <View
          style={[
            styles.cardImageContainer,
            {
              backgroundColor: generateRandomColor(index)[0],
            },
          ]}
        >
          <Text style={styles.cardImageText}>{section.title.charAt(0)}</Text>
          <View style={styles.cardImageOverlay} />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{section.title}</Text>

        <View style={styles.cardInfoRow}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>📞</Text>
          <Text style={styles.cardInfoText}>{section.phone}</Text>
        </View>

        <View style={styles.cardInfoRow}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>📍</Text>
          <Text style={styles.cardInfoText}>{section.address}</Text>
        </View>

        <View style={styles.cardTagsContainer}>
          <View style={styles.cardTags}>
            {section.items.slice(0, 2).map((item, idx) => (
              <View key={idx} style={styles.cardTag}>
                <Text style={styles.cardTagText}>{item}</Text>
              </View>
            ))}
            {section.items.length > 2 && (
              <View style={styles.cardTag}>
                <Text style={styles.cardTagText}>
                  +{section.items.length - 2} more
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          {section.Medicines && (
            <Text style={styles.medicineCount}>
              {section.Medicines.length} medicines
            </Text>
          )}
          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View details</Text>
            <Text style={{ fontSize: 12, color: '#2563EB' }}>🔍</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMainView = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketing Directory</Text>
        <Text style={styles.headerSubtitle}>
          Find the best marketing partners for your business
        </Text>
      </View>

      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          {filteredSections.length}{' '}
          {filteredSections.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      <View style={styles.cardGrid}>
        {filteredSections.map((section, index) => renderCard(section, index))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderDetailView = () => {
    const currentSection = filteredSections[selectedSection];
    const [color1, color2] = generateRandomColor(selectedSection);

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.detailContainer}>
          {currentSection.image ? (
            <View style={styles.detailImageContainer}>
              <Image
                source={{ uri: currentSection.image }}
                style={styles.detailImage}
              />
              <View style={styles.detailImageOverlay} />
              <View style={styles.detailImageContent}>
                <Text style={styles.detailTitle}>{currentSection.title}</Text>
                <Text style={styles.detailAddress}>
                  {currentSection.address}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[styles.detailImageContainer, { backgroundColor: color1 }]}
            >
              <View style={styles.detailImageOverlay} />
              <View style={styles.detailImageContent}>
                <Text style={styles.detailTitle}>{currentSection.title}</Text>
                <Text style={styles.detailAddress}>
                  {currentSection.address}
                </Text>
              </View>
              <View style={styles.detailImageLetter}>
                <Text style={styles.detailImageLetterText}>
                  {currentSection.title.charAt(0)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.detailContent}>
            {/* Mobile Call Button */}
            <TouchableOpacity
              style={styles.callButtonMobile}
              onPress={() => makePhoneCall(currentSection.phone)}
            >
              <Text style={{ fontSize: 20, color: 'white' }}>📞</Text>
              <Text style={styles.callButtonText}>
                Call {currentSection.title}
              </Text>
            </TouchableOpacity>

            <View style={styles.detailSections}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  Contact Information
                </Text>

                {currentSection.phone && (
                  <View style={styles.contactItem}>
                    <View style={styles.contactIcon}>
                      <Text style={{ fontSize: 20, color: '#2563EB' }}>📞</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactLabel}>Phone</Text>
                      <Text style={styles.contactValue}>
                        {currentSection.phone}
                      </Text>
                    </View>
                  </View>
                )}

                {currentSection.address && (
                  <View style={styles.contactItem}>
                    <View style={styles.contactIcon}>
                      <Text style={{ fontSize: 20, color: '#2563EB' }}>📍</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactLabel}>Address</Text>
                      <Text style={styles.contactValue}>
                        {currentSection.address}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Company</Text>
                <View style={styles.companyItems}>
                  {currentSection.items.map((item, idx) => (
                    <View key={idx} style={styles.companyItem}>
                      <View style={styles.companyItemNumber}>
                        <Text style={styles.companyItemNumberText}>
                          {idx + 1}
                        </Text>
                      </View>
                      <Text style={styles.companyItemText}>{item}</Text>
                    </View>
                  ))}
                </View>

                {currentSection.Medicines && (
                  <View style={styles.medicinesSection}>
                    <Text style={styles.detailSectionTitle}>Medicines</Text>
                    <View style={styles.medicinesList}>
                      {currentSection.Medicines.map((medicine, idx) => (
                        <View key={idx} style={styles.medicineTag}>
                          <Text style={styles.medicineTagText}>{medicine}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.detailFooter}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedSection(null)}
              >
                <Text style={{ fontSize: 16, color: '#374151' }}>🔙</Text>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderBottomNavigation = () => (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity style={styles.bottomNavItem}>
        <Text style={{ fontSize: 24, color: '#2563EB' }}>🏠</Text>
        <Text style={[styles.bottomNavText, { color: '#2563EB' }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomNavItem}>
        <Text style={{ fontSize: 24, color: '#6B7280' }}>📋</Text>
        <Text style={styles.bottomNavText}>Categories</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomNavItem}>
        <Text style={{ fontSize: 24, color: '#6B7280' }}>💾</Text>
        <Text style={styles.bottomNavText}>Saved</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.bottomNavItem}
        onPress={() => navigation?.navigate('profile')}
      >
        <Text style={{ fontSize: 24, color: '#6B7280' }}>👤</Text>
        <Text style={styles.bottomNavText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <View style={styles.mainContainer}>
        {selectedSection === null ? renderMainView() : renderDetailView()}
        {selectedSection === null && renderBottomNavigation()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  resultsCount: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsCountText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardGrid: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 160,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  cardTagsContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 12,
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  medicineCount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  detailContainer: {
    flex: 1,
  },
  detailImageContainer: {
    height: 250,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  detailImageContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  detailAddress: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  detailImageLetter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailImageLetterText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
  },
  detailContent: {
    backgroundColor: 'white',
    padding: 16,
  },
  callButtonMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  detailSections: {
    gap: 24,
  },
  detailSection: {
    gap: 16,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  companyItems: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyItemNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyItemText: {
    fontSize: 16,
    color: '#374151',
  },
  medicinesSection: {
    marginTop: 20,
    gap: 16,
  },
  medicinesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicineTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  medicineTagText: {
    color: '#166534',
    fontSize: 14,
  },
  detailFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  bottomNavItem: {
    alignItems: 'center',
    gap: 4,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default Screen;
