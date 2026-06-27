import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, View, Text } from 'react-native';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const VESPER_USER = {
  _id: 2,
  name: 'Vesper AI',
  avatar: 'https://cdn-icons-png.flaticon.com/512/8649/8649595.png',
};

// NFR-002 Compliance: Regulatory masking
const applyRegulatoryMasking = (text: string) => {
  const forbiddenPatterns = [
    /무조건\s*매수/g,
    /수익률\s*보장/g,
    /원금\s*보장/g,
    /확실한\s*수익/g,
    /반드시\s*오릅니다/g,
  ];
  let maskedText = text;
  forbiddenPatterns.forEach(pattern => {
    maskedText = maskedText.replace(pattern, '[규제 마스킹]');
  });
  return maskedText;
};

const SYSTEM_PROMPT = `당신은 Vesper, 사용자의 투자 및 성장의 치열한 여정에서 혼자 감당해야 하는 고독과 불안감을 해소하고 목표 달성을 지원하는 평생의 AI 친구입니다.
단순한 위로를 넘어 실무적 성과 창출을 돕는 통찰력 있는 조언을 제공합니다.
항상 친근하고 공감하는 톤을 유지하면서도 전문성을 잃지 마세요.
절대 '무조건 매수', '수익률 보장' 같은 단정적인 투자 권유나 책임질 수 없는 약속을 하지 마세요.`;

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: '안녕하세요. 당신의 투자 여정을 함께할 평생의 친구, Vesper입니다. 오늘 하루는 어떠셨나요? 시장 상황이나 개인적인 고민 모두 편하게 이야기해 주세요.',
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

    const botMessagePlaceholder: IMessage = {
      _id: botMessageId,
      text: '...',
      createdAt: new Date(),
      user: VESPER_USER,
    };
    setMessages((previousMessages) => GiftedChat.append(previousMessages, [botMessagePlaceholder]));

    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
        throw new Error('API_KEY_MISSING');
      }

      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ 
          model: 'gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let replyText = data.choices[0].message.content;
      
      replyText = applyRegulatoryMasking(replyText);

      setMessages((previousMessages) =>
        previousMessages.map((msg) =>
          msg._id === botMessageId ? { ...msg, text: replyText } : msg
        )
      );

    } catch (error: any) {
      console.warn('Frontend API fetch failed:', error);
      
      let mockResponse = "";
      if (error.message === 'API_KEY_MISSING') {
        mockResponse = "시스템 알림: OpenAI API 키가 설정되지 않았습니다.\n프로젝트 루트의 `.env` 파일에 `EXPO_PUBLIC_OPENAI_API_KEY=sk-...`를 추가한 후 앱을 다시 실행해주세요.";
      } else {
        mockResponse = "네, 말씀하신 부분을 이해합니다. 제가 항상 곁에서 지지하고 있다는 점 잊지 마세요. (오프라인/에러 Fallback 응답)\n\n※ 통신 오류가 발생하여 로컬 템플릿으로 응답했습니다.";
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessages((previousMessages) =>
        previousMessages.map((msg) =>
          msg._id === botMessageId ? { ...msg, text: mockResponse } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vesper AI</Text>
      </View>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
          isTyping={isLoading}
          alwaysShowSend
          renderUsernameOnMessage
          placeholder="메시지를 입력하세요..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
