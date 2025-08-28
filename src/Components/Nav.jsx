import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Icon components (you can replace these with actual icon libraries like react-native-vector-icons)
const SearchIcon = () => <Text style={styles.icon}>🔍</Text>;
const MenuIcon = () => <Text style={styles.icon}>☰</Text>;
const CloseIcon = () => <Text style={styles.icon}>✖</Text>;
const HomeIcon = () => <Text style={styles.icon}>🏠</Text>;
const InfoIcon = () => <Text style={styles.icon}>ℹ️</Text>;
const PhoneIcon = () => <Text style={styles.icon}>📞</Text>;
const LoginIcon = () => <Text style={styles.icon}>🔐</Text>;
const UserPlusIcon = () => <Text style={styles.icon}>👤➕</Text>;
const UserIcon = () => <Text style={styles.icon}>👤</Text>;
const ChevronDownIcon = () => <Text style={styles.icon}>▼</Text>;

function Nav({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterType, setFilterType] = useState('company');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedStockists, setSelectedStockists] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userToken, setUserToken] = useState(null);

  const [sectionData, setSectionData] = useState([]);
  // sectionData will come from backend (stockists) — each item should include name/title, phone, address, companies, medicines
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resStockist, resMedicine, resCompany] = await Promise.all([
          fetch('http://10.0.2.2:5000/api/stockist'),
          fetch('http://10.0.2.2:5000/api/medicine'),
          fetch('http://10.0.2.2:5000/api/company'),
        ]);

        const [jsonStockist, jsonMedicine, jsonCompany] = await Promise.all([
          resStockist.json(),
          resMedicine.json(),
          resCompany.json(),
        ]);

        const medicines = (jsonMedicine && jsonMedicine.data) || [];
        const companies = (jsonCompany && jsonCompany.data) || [];

        if (mounted && jsonStockist && jsonStockist.data) {
          const mapped = jsonStockist.data.map(s => {
            const medsForStockist = medicines
              .filter(m =>
                Array.isArray(m.stockists)
                  ? m.stockists.some(st =>
                      String(st.stockist || st).includes(String(s._id)),
                    )
                  : false,
              )
              .map(m => (m.name ? m.name : m.brandName || ''))
              .filter(Boolean);

            const companyIds = new Set(
              medicines
                .filter(m =>
                  Array.isArray(m.stockists)
                    ? m.stockists.some(st =>
                        String(st.stockist || st).includes(String(s._id)),
                      )
                    : false,
                )
                .map(m =>
                  m.company && (m.company._id || m.company)
                    ? String(m.company._id || m.company)
                    : null,
                )
                .filter(Boolean),
            );

            const companiesForStockist = companies
              .filter(c => companyIds.has(String(c._id)))
              .map(c => (c.name ? c.name : c.shortName || ''))
              .filter(Boolean);

            const items = (s.companies || companiesForStockist)
              .map(c => {
                if (typeof c === 'string') {
                  const found = companies.find(
                    co => String(co._id) === c || co.id === c,
                  );
                  return found ? found.name || found.shortName || c : c;
                }
                if (c && (c.name || c.shortName)) return c.name || c.shortName;
                return '';
              })
              .filter(Boolean);

            const meds = (s.medicines || medsForStockist)
              .map(m =>
                typeof m === 'string'
                  ? m
                  : m && (m.name || m.brandName)
                  ? m.name || m.brandName
                  : '',
              )
              .filter(Boolean);

            return {
              _id: s._id,
              title: s.name,
              phone: s.phone,
              address: s.address
                ? `${s.address.street || ''}, ${s.address.city || ''}`
                : '',
              items,
              Medicines: meds,
            };
          });
          setSectionData(mapped);
          console.warn('Nav: loaded stockists ->', mapped.length);
        }
      } catch (err) {
        console.warn('Nav: failed to load stockists', err);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Check for token on component mount
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setUserToken(token);
    } catch (error) {
      console.error('Error reading token:', error);
    }
  };

  // Get all unique items for each filter type
  const getAllItems = type => {
    if (type === 'company') {
      const allCompanies = new Set();
      sectionData.forEach(section =>
        section.items?.forEach(item => allCompanies.add(item)),
      );
      return Array.from(allCompanies);
    } else if (type === 'stockist') {
      return sectionData.map(section => section.title);
    } else if (type === 'medicine') {
      const allMedicines = new Set();
      sectionData.forEach(section =>
        section.Medicines?.forEach(med => allMedicines.add(med)),
      );
      return Array.from(allMedicines);
    }
    return [];
  };

  // Handle filter type change
  const handleFilterTypeChange = newType => {
    setFilterType(newType);
    setSearchQuery('');
    setSelectedStockists([]);
    setShowAllResults(true);
    setShowFilterModal(false);

    // Show all items of the selected type
    const allItems = getAllItems(newType);
    if (newType === 'stockist') {
      setSelectedStockists(sectionData);
    } else if (newType === 'company') {
      const companyStockists = [];
      allItems.forEach(company => {
        const stockists = sectionData.filter(
          section => section.items && section.items.includes(company),
        );
        companyStockists.push(...stockists);
      });
      setSelectedStockists([...new Set(companyStockists)]);
    } else if (newType === 'medicine') {
      const medicineStockists = [];
      allItems.forEach(medicine => {
        const stockists = sectionData.filter(
          section => section.Medicines && section.Medicines.includes(medicine),
        );
        medicineStockists.push(...stockists);
      });
      setSelectedStockists([...new Set(medicineStockists)]);
    }
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    let resultSet = new Set();

    if (filterType === 'company') {
      sectionData.forEach(section =>
        section.items?.forEach(item => {
          if (item.toLowerCase().includes(query)) {
            resultSet.add(item);
          }
        }),
      );
    } else if (filterType === 'stockist') {
      sectionData.forEach(section => {
        if (section.title.toLowerCase().includes(query)) {
          resultSet.add(section.title);
        }
      });
    } else if (filterType === 'medicine') {
      sectionData.forEach(section =>
        section.Medicines?.forEach(med => {
          if (med.toLowerCase().includes(query)) {
            resultSet.add(med);
          }
        }),
      );
    }

    const results = [...resultSet];
    setSuggestions(results);
    setShowSuggestions(query.length > 0 && results.length > 0);
  }, [searchQuery, filterType]);

  const handleSuggestionClick = suggestion => {
    setIsLoading(true);
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    // Simulate a small delay for better UX
    setTimeout(() => {
      let stockists = [];
      if (filterType === 'stockist') {
        stockists = sectionData.filter(section => section.title === suggestion);
      } else if (filterType === 'company') {
        stockists = sectionData.filter(
          section => section.items && section.items.includes(suggestion),
        );
      } else if (filterType === 'medicine') {
        stockists = sectionData.filter(
          section =>
            section.Medicines && section.Medicines.includes(suggestion),
        );
      }
      setSelectedStockists(stockists);
      setShowAllResults(false);
      setIsLoading(false);
    }, 300);
  };

  const handleSearchChange = text => {
    setSearchQuery(text);
    if (text === '') {
      setShowAllResults(true);
      // Show all items of current filter type
      const allItems = getAllItems(filterType);
      if (filterType === 'stockist') {
        setSelectedStockists(sectionData);
      } else if (filterType === 'company') {
        const companyStockists = [];
        allItems.forEach(company => {
          const stockists = sectionData.filter(
            section => section.items && section.items.includes(company),
          );
          companyStockists.push(...stockists);
        });
        setSelectedStockists([...new Set(companyStockists)]);
      } else if (filterType === 'medicine') {
        const medicineStockists = [];
        allItems.forEach(medicine => {
          const stockists = sectionData.filter(
            section =>
              section.Medicines && section.Medicines.includes(medicine),
          );
          medicineStockists.push(...stockists);
        });
        setSelectedStockists([...new Set(medicineStockists)]);
      }
    }
  };

  const clearResults = () => {
    setSearchQuery('');
    setSelectedStockists([]);
    setShowSuggestions(false);
    setShowAllResults(false);
  };

  const handleLoginClick = () => navigation.navigate('login');
  const handleSignupClick = () => navigation.navigate('signup');
  const handleProfileClick = () => navigation.navigate('profile');

  // Filter type options with icons
  const filterOptions = [
    { value: 'medicine', label: 'Medicine', icon: '💊' },
    { value: 'company', label: 'Company', icon: '🏢' },
    { value: 'stockist', label: 'Stockist', icon: '🏪' },
  ];

  // Navigation links
  const navLinks = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'About', icon: <InfoIcon /> },
    { label: 'Contact', icon: <PhoneIcon /> },
  ];

  // Initialize with all companies on component mount
  useEffect(() => {
    handleFilterTypeChange('company');
  }, []);

  // When sectionData loads or changes, initialize selectedStockists so the UI shows results
  useEffect(() => {
    if (!sectionData || sectionData.length === 0) return;

    // If we already have selectedStockists populated and not empty, keep it
    if (selectedStockists && selectedStockists.length > 0) return;

    // Populate based on current filterType
    const allItems = getAllItems(filterType);
    if (filterType === 'stockist') {
      setSelectedStockists(sectionData);
    } else if (filterType === 'company') {
      const companyStockists = [];
      allItems.forEach(company => {
        const stockists = sectionData.filter(
          section => section.items && section.items.includes(company),
        );
        companyStockists.push(...stockists);
      });
      setSelectedStockists([...new Set(companyStockists)]);
    } else if (filterType === 'medicine') {
      const medicineStockists = [];
      allItems.forEach(medicine => {
        const stockists = sectionData.filter(
          section => section.Medicines && section.Medicines.includes(medicine),
        );
        medicineStockists.push(...stockists);
      });
      setSelectedStockists([...new Set(medicineStockists)]);
    }
    setShowAllResults(true);
  }, [sectionData]);

  const renderStockistCard = ({ item, index }) => (
    <View key={index} style={styles.stockistCard}>
      <Text style={styles.stockistTitle}>{item.title}</Text>

      <View style={styles.stockistInfo}>
        <View style={styles.infoRow}>
          <PhoneIcon />
          <Text style={styles.infoLabel}>Phone: </Text>
          <Text style={styles.infoValue}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.infoLabel}>Address: </Text>
          <Text style={styles.infoValue}>{item.address}</Text>
        </View>
      </View>

      {filterType === 'company' && item.items && (
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={styles.companyIcon}>🏢</Text>
            <Text style={styles.itemsTitle}>Companies:</Text>
          </View>
          <View style={styles.tagsContainer}>
            {item.items.map((company, companyIdx) => (
              <View
                key={companyIdx}
                style={[
                  styles.tag,
                  styles.companyTag,
                  searchQuery &&
                    company.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    styles.highlightedCompanyTag,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    styles.companyTagText,
                    searchQuery &&
                      company
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) &&
                      styles.highlightedCompanyTagText,
                  ]}
                >
                  {company}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {filterType === 'medicine' && item.Medicines && (
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={styles.medicineIcon}>💊</Text>
            <Text style={styles.itemsTitle}>Medicines:</Text>
          </View>
          <View style={styles.tagsContainer}>
            {item.Medicines.map((medicine, medIdx) => (
              <View
                key={medIdx}
                style={[
                  styles.tag,
                  styles.medicineTag,
                  searchQuery &&
                    medicine
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) &&
                    styles.highlightedMedicineTag,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    styles.medicineTagText,
                    searchQuery &&
                      medicine
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) &&
                      styles.highlightedMedicineTagText,
                  ]}
                >
                  {medicine}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {filterType === 'stockist' && (
        <View style={styles.stockistDetails}>
          {item.items && (
            <View style={styles.itemsContainer}>
              <View style={styles.itemsHeader}>
                <Text style={styles.companyIcon}>🏢</Text>
                <Text style={styles.itemsTitle}>Companies:</Text>
              </View>
              <View style={styles.tagsContainer}>
                {item.items.map((company, companyIdx) => (
                  <View
                    key={companyIdx}
                    style={[styles.tag, styles.companyTag]}
                  >
                    <Text style={[styles.tagText, styles.companyTagText]}>
                      {company}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {item.Medicines && (
            <View style={styles.itemsContainer}>
              <View style={styles.itemsHeader}>
                <Text style={styles.medicineIcon}>💊</Text>
                <Text style={styles.itemsTitle}>Medicines:</Text>
              </View>
              <View style={styles.tagsContainer}>
                {item.Medicines.map((medicine, medIdx) => (
                  <View key={medIdx} style={[styles.tag, styles.medicineTag]}>
                    <Text style={[styles.tagText, styles.medicineTagText]}>
                      {medicine}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollView}>
        {/* Header section */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoTextD}>D</Text>
              <Text style={styles.logoTextK}>K</Text>
              <View style={styles.logoBackground}>
                <View style={styles.logoInner}>
                  {/* You can replace this with an actual Image component */}
                  <Text style={styles.logoPlaceholder}>🏥</Text>
                </View>
              </View>
            </View>
            <View style={styles.logoText}>
              <Text style={styles.logoTitle}>MedTrap</Text>
              <Text style={styles.logoSubtitle}>Medical Solutions</Text>
            </View>
          </View>

          {/* Mobile menu button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <MenuIcon />
          </TouchableOpacity>
        </View>

        {/* Mobile menu modal */}
        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.mobileMenu}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsMenuOpen(false)}
              >
                <CloseIcon />
              </TouchableOpacity>

              <ScrollView>
                <View style={styles.navLinks}>
                  {navLinks.map((link, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.navLink}
                      onPress={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      <Text style={styles.navLinkText}>{link.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.authButtons}>
                  {userToken ? (
                    <TouchableOpacity
                      style={[styles.authButton, styles.profileButton]}
                      onPress={() => {
                        setIsMenuOpen(false);
                        handleProfileClick();
                      }}
                    >
                      <UserIcon />
                      <Text style={styles.authButtonText}>Profile</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.authButton, styles.loginButton]}
                        onPress={() => {
                          setIsMenuOpen(false);
                          handleLoginClick();
                        }}
                      >
                        <LoginIcon />
                        <Text style={styles.authButtonText}>Login</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.authButton, styles.signupButton]}
                        onPress={() => {
                          setIsMenuOpen(false);
                          handleSignupClick();
                        }}
                      >
                        <UserPlusIcon />
                        <Text style={styles.authButtonText}>Sign Up</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Search section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <SearchIcon />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search for ${filterType}...`}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
              {searchQuery && (
                <TouchableOpacity onPress={clearResults}>
                  <CloseIcon />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.filterButtonText}>
                {filterOptions.find(opt => opt.value === filterType)?.icon}{' '}
                {filterOptions.find(opt => opt.value === filterType)?.label}
              </Text>
              <ChevronDownIcon />
            </TouchableOpacity>
          </View>

          {/* Filter Modal */}
          <Modal
            visible={showFilterModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFilterModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowFilterModal(false)}
            >
              <View style={styles.filterModal}>
                <Text style={styles.filterModalTitle}>Select Filter Type</Text>
                {filterOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filterType === option.value &&
                        styles.selectedFilterOption,
                    ]}
                    onPress={() => handleFilterTypeChange(option.value)}
                  >
                    <Text style={styles.filterOptionIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterType === option.value &&
                          styles.selectedFilterOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsHeader}>
                Click on any suggestion to see detailed results
              </Text>
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => index.toString()}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 260 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  let phone = null;
                  let additionalInfo = '';

                  if (filterType === 'stockist') {
                    const stockist = sectionData.find(
                      section => section.title === item,
                    );
                    phone = stockist ? stockist.phone : null;
                    additionalInfo = stockist
                      ? `${stockist.items?.length || 0} companies, ${
                          stockist.Medicines?.length || 0
                        } medicines`
                      : '';
                  } else if (filterType === 'company') {
                    const stockists = sectionData.filter(
                      section => section.items && section.items.includes(item),
                    );
                    additionalInfo = `Available at ${
                      stockists.length
                    } stockist${stockists.length > 1 ? 's' : ''}`;
                  } else if (filterType === 'medicine') {
                    const stockists = sectionData.filter(
                      section =>
                        section.Medicines && section.Medicines.includes(item),
                    );
                    additionalInfo = `Available at ${
                      stockists.length
                    } stockist${stockists.length > 1 ? 's' : ''}`;
                  }

                  return (
                    <TouchableOpacity
                      style={styles.suggestion}
                      onPress={() => handleSuggestionClick(item)}
                    >
                      <Text style={styles.suggestionIcon}>
                        {filterType === 'medicine'
                          ? '💊'
                          : filterType === 'company'
                          ? '🏢'
                          : '🏪'}
                      </Text>
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionTitle}>{item}</Text>
                        {additionalInfo && (
                          <Text style={styles.suggestionInfo}>
                            {additionalInfo}
                          </Text>
                        )}
                      </View>
                      {phone && (
                        <Text style={styles.suggestionPhone}>{phone}</Text>
                      )}
                      <Text style={styles.suggestionArrow}>→</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </View>

        {/* Results Display */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>
            Debug: sectionData = {sectionData.length} stockists
          </Text>
        </View>

        {selectedStockists.length > 0 && (
          <View style={styles.resultsSection}>
            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading results...</Text>
              </View>
            )}

            {/* Search Result Counter */}
            {searchQuery && (
              <View style={styles.searchResultHeader}>
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <View>
                    <Text style={styles.searchResultTitle}>
                      Search Results for "{searchQuery}"
                    </Text>
                    <Text style={styles.searchResultCount}>
                      {selectedStockists.length} result
                      {selectedStockists.length > 1 ? 's' : ''} found
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.showAllButton}
                  onPress={() => {
                    setSearchQuery('');
                    handleFilterTypeChange(filterType);
                  }}
                >
                  <Text style={styles.showAllButtonText}>
                    Show All{' '}
                    {filterType === 'stockist'
                      ? 'Stockists'
                      : filterType === 'company'
                      ? 'Companies'
                      : 'Medicines'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {searchQuery ? (
                  <>
                    Search Results for "{searchQuery}"{'\n'}
                    <Text style={styles.resultsSubtitle}>
                      {filterType === 'stockist' && 'Stockist Details'}
                      {filterType === 'company' &&
                        'Stockists with this Company'}
                      {filterType === 'medicine' &&
                        'Stockists with this Medicine'}
                    </Text>
                  </>
                ) : (
                  <>
                    {filterType === 'stockist' && 'All Stockists'}
                    {filterType === 'company' && 'All Companies'}
                    {filterType === 'medicine' && 'All Medicines'}
                  </>
                )}
              </Text>
              <Text style={styles.resultsCount}>
                {searchQuery
                  ? `Found ${selectedStockists.length} result${
                      selectedStockists.length > 1 ? 's' : ''
                    }`
                  : `Showing ${selectedStockists.length} stockists`}
              </Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearResults}
              >
                <Text style={styles.clearButtonText}>Clear Results</Text>
              </TouchableOpacity>
            </View>

            {/* Results List */}
            <FlatList
              data={selectedStockists}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderStockistCard}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Quick stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>🏥</Text>
              </View>
              <View>
                <Text style={styles.statTitle}>Stockists</Text>
                <Text style={styles.statSubtitle}>Find verified stockists</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>💊</Text>
              </View>
              <View>
                <Text style={styles.statTitle}>Medicines</Text>
                <Text style={styles.statSubtitle}>Search all medicines</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Text style={styles.statEmoji}>🏢</Text>
              </View>
              <View>
                <Text style={styles.statTitle}>Companies</Text>
                <Text style={styles.statSubtitle}>Browse pharma companies</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoTextD: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    position: 'absolute',
    zIndex: 10,
    left: 12,
  },
  logoTextK: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    position: 'absolute',
    zIndex: 10,
    right: 16,
  },
  logoBackground: {
    width: 64,
    height: 64,
    backgroundColor: '#DBEAFE',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoInner: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  logoPlaceholder: {
    fontSize: 20,
  },
  logoText: {
    marginLeft: 12,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -4,
  },
  menuButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileMenu: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: width - 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  navLinks: {
    marginTop: 10,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginVertical: 4,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  authButtons: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  profileButton: {
    backgroundColor: '#7C3AED',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
  },
  signupButton: {
    backgroundColor: '#10B981',
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  filterModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#F8FAFC',
  },
  selectedFilterOption: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  filterOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  selectedFilterOptionText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    maxHeight: 300,
  },
  suggestionsHeader: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  suggestionInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  suggestionPhone: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  suggestionArrow: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
  },
  resultsSection: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF8FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  searchResultHeader: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchResultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  searchResultCount: {
    fontSize: 14,
    color: '#2563EB',
  },
  showAllButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  showAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#3B82F6',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stockistCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  stockistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  stockistInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#2563EB',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  medicineIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  companyTag: {
    backgroundColor: '#DBEAFE',
  },
  medicineTag: {
    backgroundColor: '#D1FAE5',
  },
  highlightedCompanyTag: {
    backgroundColor: '#BFDBFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  highlightedMedicineTag: {
    backgroundColor: '#A7F3D0',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  companyTagText: {
    color: '#1D4ED8',
  },
  medicineTagText: {
    color: '#047857',
  },
  highlightedCompanyTagText: {
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  highlightedMedicineTagText: {
    color: '#065F46',
    fontWeight: 'bold',
  },
  stockistDetails: {
    gap: 12,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statEmoji: {
    fontSize: 24,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  icon: {
    fontSize: 18,
  },
});

export default Nav;
