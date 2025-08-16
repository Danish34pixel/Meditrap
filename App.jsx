import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './src/Components/Dashboard';
import Login from './src/Components/Login';
import Signup from './src/Components/Signup';
import Profile from './src/Components/Profile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="dashboard" component={Dashboard} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="signup" component={Signup} />
        <Stack.Screen name="profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
