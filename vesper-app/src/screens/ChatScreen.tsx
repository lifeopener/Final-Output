import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import { supabase } from '../lib/supabase';

// Helper for generating UUIDs manually for MVP if react-native-uuid isn't installed
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const VESPER_USER = {
  _id: 2,
  name: 'Vesper AI',
  avatar: 'https://cdn-icons-png.flaticon.com/512/8649/8649595.png', // Temporary robot icon
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        _id: 1,
        text: '안녕하세요. 당신의 투자 여정을 함께할 Vesper입니다. 무엇이든 물어보세요.',
        createdAt: new Date(),
        user: VESPER_USER,
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    setIsLoading(true);

    const userMessage = newMessages[0].text;
    const botMessageId = generateUUID();

    // Create an empty bot message placeholder
    const botMessagePlaceholder: IMessage = {
      _id: botMessageId,
      text: '...',
      createdAt: new Date(),
      user: VESPER_USER,
    };
    setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessagePlaceholder]));

    try {
      // Prepare message history for the API
      // Note: In MVP, we just send the latest user message. 
      // For full RAG, we'd send history.
      const apiMessages = [
        { role: 'user', content: userMessage }
      ];

      // Replace with your actual Supabase Function URL if remote, or local IP if local testing
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
      
      const functionUrl = `${supabaseUrl}/functions/v1/chat`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // Handle server-sent events (SSE) streaming for React Native
      // React Native fetch doesn't fully support readable streams out of the box in the same way browsers do.
      // For MVP, we will try to read the full text, or if using a polyfill, read the stream.
      // Since it's MVP, if streaming fails, we fallback to reading full text.
      
      const text = await response.text();
      // Update the placeholder with the actual response
      setMessages((previousMessages) =>
        previousMessages.map((msg) =>
          msg._id === botMessageId ? { ...msg, text: text } : msg
        )
      );

    } catch (error) {
      console.warn('Backend fetch failed, using local fallback mock:', error);
      
      // NFR-003 / Fallback: 로컬 위로 템플릿 반환
      // Simulate network delay for realistic UI feeling
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = "지금 많이 힘드시군요. 제가 항상 곁에 있겠습니다. (로컬 Fallback 응답)\n\n※ 현재 로컬 백엔드 서버(Docker) 또는 API 키가 설정되지 않아 로컬 오프라인 모드로 동작 중입니다.";
      
      setMessages((previousMessages) =>
        previousMessages.map((msg) =>
          msg._id === botMessageId
            ? { ...msg, text: mockResponse }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vesper</Text>
      </View>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1, // User ID
          }}
          isTyping={isLoading}
          alwaysShowSend
          renderUsernameOnMessage
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark theme (NFR-000)
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
