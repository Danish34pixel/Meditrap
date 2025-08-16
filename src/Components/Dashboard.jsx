import React from 'react';
import { ScrollView } from 'react-native';
import Nav from './Nav';
import Screen from './Screen';

import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Nav navigation={navigation} />
      <Screen navigation={navigation} />
    </ScrollView>
  );
};

export default Dashboard;
