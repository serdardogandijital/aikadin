import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import VirtualTryOnScreen from '../screens/virtualTryOn/VirtualTryOnScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import AddClothingScreen from '../screens/wardrobe/AddClothingScreen';
import OutfitDetailsScreen from '../screens/wardrobe/OutfitDetailsScreen';
import NewsScreen from '../screens/news/NewsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  // Firebase auth temporarily disabled - bypass auth for development
  const skipAuth = true;
  
  return (
    <Stack.Navigator 
      initialRouteName={skipAuth ? "Main" : "Auth"}
      screenOptions={{
        headerShown: false,
      }}
    >
      {!skipAuth && <Stack.Screen name="Auth" component={AuthScreen} />}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="AddClothing" component={AddClothingScreen} />
      <Stack.Screen name="OutfitDetails" component={OutfitDetailsScreen} />
      <Stack.Screen name="News" component={NewsScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 