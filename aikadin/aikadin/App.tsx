import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation';

// This ensures that the app scales correctly on various devices and respects safe areas
export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
      <StatusBar style="auto" />
        <RootNavigator />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
