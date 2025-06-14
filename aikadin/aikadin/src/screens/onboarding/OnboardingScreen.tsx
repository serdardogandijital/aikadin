import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { auth, db } from '../../services/firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [existingUser, setExistingUser] = useState(false);

  useEffect(() => {
    // Firebase auth temporarily disabled
    const loadUserProfile = async () => {
      try {
        // Check AsyncStorage for existing profile
        const profileStr = await AsyncStorage.getItem('userProfile');
        if (profileStr) {
          const userData = JSON.parse(profileStr);
          setExistingUser(true);
          setAnswers(userData);
        }
        setInitialLoad(false);
      } catch (error) {
        console.error('Profil yükleme hatası:', error);
        setInitialLoad(false);
      }
    };

    loadUserProfile();
  }, [navigation]);

  const questions = [
    {
      id: 'name',
      question: 'Adınız nedir?',
      type: 'text',
      placeholder: 'Adınızı girin'
    },
    {
      id: 'age',
      question: 'Yaşınız?',
      type: 'number',
      placeholder: 'Yaşınızı girin'
    },
    {
      id: 'height',
      question: 'Boyunuz? (cm)',
      type: 'number',
      placeholder: 'Örnek: 170'
    },
    {
      id: 'weight',
      question: 'Kilonuz? (kg)',
      type: 'number',
      placeholder: 'Örnek: 65'
    },
    {
      id: 'style',
      question: 'Hangi stil size uygun?',
      type: 'select',
      options: ['Casual', 'Formal', 'Sport', 'Vintage', 'Bohemian', 'Minimalist']
    },
    {
      id: 'colors',
      question: 'Favori renkleriniz?',
      type: 'multiselect',
      options: ['Siyah', 'Beyaz', 'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Mor', 'Turuncu', 'Pembe', 'Gri']
    },
    {
      id: 'bodyType',
      question: 'Vücut tipiniz?',
      type: 'select',
      options: ['İnce', 'Normal', 'Atletik', 'Kaslı', 'Tombul']
    }
  ];

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    // Skip to main app
    navigation.replace('Main', { screen: 'Home' });
  };

  const completeOnboarding = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(answers));
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Firebase disabled - just navigate to main app
      navigation.navigate('Main', { screen: 'Home' });
    } catch (e) {
      console.error('Profil kaydetme hatası:', e);
      Alert.alert('Hata', 'Profil kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  if (initialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (existingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Hoş geldin!</Text>
          <Text style={styles.subtitle}>Profil bilgilerin zaten mevcut.</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleSkip}
            >
              <Text style={styles.buttonText}>Ana Sayfaya Git</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => setExistingUser(false)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Profili Güncelle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const q = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepText}>
          {currentStep + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{q.question}</Text>

        {q.type === 'text' && (
          <TextInput
            style={styles.textInput}
            placeholder={q.placeholder}
            value={answers[q.id] || ''}
            onChangeText={(text) => handleAnswer(q.id, text)}
            placeholderTextColor={theme.colors.text.hint}
          />
        )}

        {q.type === 'number' && (
          <TextInput
            style={styles.textInput}
            placeholder={q.placeholder}
            value={answers[q.id] || ''}
            onChangeText={(text) => handleAnswer(q.id, text)}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.text.hint}
          />
        )}

        {q.type === 'select' && (
          <View style={styles.optionsContainer}>
            {q.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  answers[q.id] === option && styles.selectedOption
                ]}
                onPress={() => handleAnswer(q.id, option)}
              >
                <Text style={[
                  styles.optionText,
                  answers[q.id] === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {q.type === 'multiselect' && (
          <View style={styles.optionsContainer}>
            {q.options?.map((option, index) => {
              const isSelected = answers[q.id]?.includes(option);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => {
                    const currentAnswers = answers[q.id] || [];
                    if (isSelected) {
                      handleAnswer(q.id, currentAnswers.filter((item: string) => item !== option));
                    } else {
                      handleAnswer(q.id, [...currentAnswers, option]);
                    }
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Geri</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.primary.contrastText} />
          ) : (
            <Text style={styles.buttonText}>
              {currentStep === questions.length - 1 ? 'Tamamla' : 'İleri'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.grey[200],
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
    borderRadius: 2,
  },
  stepText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  question: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
    lineHeight: 28,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.paper,
  },
  optionsContainer: {
    gap: theme.spacing.sm,
  },
  optionButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
    backgroundColor: theme.colors.background.paper,
  },
  selectedOption: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  optionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: theme.colors.primary.dark,
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
  },
  buttonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600' as const,
    color: theme.colors.primary.contrastText,
  },
  secondaryButtonText: {
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
});

export default OnboardingScreen;
 