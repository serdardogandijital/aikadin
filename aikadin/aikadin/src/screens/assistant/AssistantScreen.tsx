import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import apiService from '../../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { auth, db } from '../../services/firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface UserPreference {
  key: string;
  value: string;
}

const AssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadWelcomeMessages();
    loadUserProfile();
    loadChatHistory();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Firebase disabled - load from AsyncStorage
      const profileStr = await AsyncStorage.getItem('userProfile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setUserProfile(profile);
        
        // Extract preferences from profile
        const preferences: UserPreference[] = [];
        
        if (profile.style) preferences.push({ key: 'style', value: profile.style });
        if (profile.bodyType) preferences.push({ key: 'bodyType', value: profile.bodyType });
        if (profile.height) preferences.push({ key: 'height', value: `${profile.height} cm` });
        if (profile.weight) preferences.push({ key: 'weight', value: `${profile.weight} kg` });
        if (profile.favoriteColors && profile.favoriteColors.length > 0) {
          preferences.push({ key: 'favoriteColors', value: profile.favoriteColors.join(', ') });
        }
        
        setUserPreferences(preferences);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem('chatHistory');
      if (historyStr) {
        const history = JSON.parse(historyStr);
        // Convert string dates back to Date objects
        const formattedHistory = history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setChatHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (updatedMessages: Message[]) => {
    try {
      // Only save the last 50 messages to prevent storage issues
      const messagesToSave = updatedMessages.slice(-50);
      await AsyncStorage.setItem('chatHistory', JSON.stringify(messagesToSave));
      setChatHistory(messagesToSave);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const loadWelcomeMessages = () => {
    const welcomeMessages: Message[] = [
      {
        id: '1',
        text: 'Merhaba! Ben Aikadin AI moda asistanınızım. Size nasıl yardımcı olabilirim?',
        sender: 'ai',
        timestamp: new Date()
      },
      {
        id: '2',
        text: 'Size şunlarda yardımcı olabilirim:\n• Günlük kombin önerileri\n• Özel etkinlik kıyafetleri\n• Renk uyumları\n• Stil tavsiyeleri\n• Sezon trendleri',
        sender: 'ai',
        timestamp: new Date()
      }
    ];
    setMessages(welcomeMessages);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Build context with user profile and preferences
      let systemPrompt = 'Sen Aikadin moda asistanısın. Kullanıcılara moda, stil, kıyafet ve kombin konularında yardımcı olursun. ';
      
      // Add user profile context if available
      if (userProfile) {
        systemPrompt += 'Kullanıcı profili: ';
        systemPrompt += `İsim: ${userProfile.name || 'Kullanıcı'}, `;
        
        if (userPreferences.length > 0) {
          systemPrompt += 'Kullanıcı tercihleri: ';
          userPreferences.forEach((pref, index) => {
            systemPrompt += `${pref.key}: ${pref.value}`;
            if (index < userPreferences.length - 1) systemPrompt += ', ';
          });
          systemPrompt += '. ';
        }
      }
      
      // Add personalization instructions
      systemPrompt += 'Bu bilgilere göre kişiselleştirilmiş moda önerileri ver. Önerilerinde kullanıcının vücut tipine, stiline ve tercih ettiği renklere uygun tavsiyeler sun. Kullanıcının sorularına özel ve detaylı cevaplar ver. Cevaplarını Türkçe ve samimi bir dille yaz.';
      
      // Include recent chat history for context
      const recentMessages = [...chatHistory, ...messages].slice(-10);
      
      const contextMessages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...recentMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: inputText.trim()
        }
      ];

      const aiResponse = await apiService.callOpenAI(contextMessages);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Save chat history
      saveChatHistory(finalMessages);
      
    } catch (error) {
      console.error('AI response error:', error);
      Alert.alert(
        'Hata',
        'AI yanıtı alınamadı. Lütfen daha sonra tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.aiMessage
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.aiMessageTime
          ]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.header}>
          <MaterialIcons name="assistant" size={24} color={theme.colors.primary.main} />
          <Text style={styles.headerTitle}>AI Moda Asistanı</Text>
          {userProfile && (
            <Text style={styles.headerSubtitle}>Merhaba {userProfile.name || 'Kullanıcı'}!</Text>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <LoadingSpinner text="AI düşünüyor..." size="small" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Moda ile ilgili sorunuzu yazın..."
            placeholderTextColor={theme.colors.text.hint}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={
                !inputText.trim() || isLoading
                  ? theme.colors.text.hint
                  : theme.colors.primary.contrastText
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.background.paper,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  userMessage: {
    backgroundColor: theme.colors.primary.main,
  },
  aiMessage: {
    backgroundColor: theme.colors.neutral[100],
  },
  messageText: {
    fontSize: theme.fontSizes.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.primary.contrastText,
  },
  aiMessageText: {
    color: theme.colors.text.primary,
  },
  messageTime: {
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.xs,
  },
  userMessageTime: {
    color: theme.colors.primary.contrastText,
    opacity: 0.8,
  },
  aiMessageTime: {
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.background.paper,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.default,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
  },
});

export default AssistantScreen; 