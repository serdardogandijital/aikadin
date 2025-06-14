import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import Toast from 'react-native-toast-message';
import { RootNavigator } from './aikadin/src/navigation';
import ErrorBoundary from './aikadin/src/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
          <Toast />
        </SafeAreaProvider>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

registerRootComponent(App);
export default App; 