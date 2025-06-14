import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  VirtualTryOn: undefined;
  AddClothing: undefined;
  OutfitDetails: { outfitId: string };
  News: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Assistant: undefined;
  Profile: undefined;
  News: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 