import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './src/Components/Dashboard';
import SelectRoleScreen from './src/Components/SelectRoleScreen';
import Login from './src/Components/Login';
import Signup from './src/Components/Signup';
import Profile from './src/Components/Profile';
import AdminPanel from './src/Components/AdminPanel';
import AdminCreateStockist from './src/Components/AdminCreateStockist';
import AdminCreateCompany from './src/Components/AdminCreateCompany';
import AdminCreateMedicine from './src/Components/AdminCreateMedicine';
import StaffListScreen from './src/Components/StaffListScreen';
import StaffDetailsScreen from './src/Components/StaffDetailsScreen';
import PurchaserScreen from './src/Components/PurchaserScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="selectRole">
        <Stack.Screen
          name="selectRole"
          component={SelectRoleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="dashboard" component={Dashboard} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="signup" component={Signup} />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ title: 'Signup' }}
        />
        <Stack.Screen name="profile" component={Profile} />
        <Stack.Screen
          name="adminPanel"
          component={AdminPanel}
          options={{ title: 'Admin Panel' }}
        />
        <Stack.Screen
          name="adminCreateStockist"
          component={AdminCreateStockist}
          options={{ title: 'Create Stockist' }}
        />
        <Stack.Screen
          name="adminCreateCompany"
          component={AdminCreateCompany}
          options={{ title: 'Create Company' }}
        />
        <Stack.Screen
          name="adminCreateMedicine"
          component={AdminCreateMedicine}
          options={{ title: 'Create Medicine' }}
        />
        {/* Alias routes with capitalized names used by SelectRoleScreen */}
        <Stack.Screen
          name="AdminCreateStockist"
          component={AdminCreateStockist}
          options={{ title: 'Create Stockist' }}
        />
        <Stack.Screen
          name="AdminCreateCompany"
          component={AdminCreateCompany}
          options={{ title: 'Create Company' }}
        />
        <Stack.Screen
          name="AdminCreateMedicine"
          component={AdminCreateMedicine}
          options={{ title: 'Create Medicine' }}
        />
        <Stack.Screen
          name="Staffs"
          component={StaffListScreen}
          options={{ title: 'Staff' }}
        />
        <Stack.Screen
          name="StaffDetails"
          component={StaffDetailsScreen}
          options={{ title: 'Staff Details' }}
        />
        <Stack.Screen
          name="Purchaser"
          component={PurchaserScreen}
          options={{ title: 'Purchaser' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
