import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import OnboardingStack from './OnboardingStack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import VirtualTryOnScreen from '../screens/virtualTryOn/VirtualTryOnScreen';
import AddClothingScreen from '../screens/wardrobe/AddClothingScreen';
import OutfitDetailsScreen from '../screens/wardrobe/OutfitDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="OnboardingStack"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="OnboardingStack" component={OnboardingStack} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
        <Stack.Screen name="AddClothing" component={AddClothingScreen} />
        <Stack.Screen name="OutfitDetails" component={OutfitDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 