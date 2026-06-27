import React, { useState, useCallback, useEffect, useRef } from 'react';
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
단순한 위로를 넘어 실무적 성과 창출을 돕는 통찰력 있는 조언을 제공합니다. 실시간 정보가 필요하면 search_web 도구를 적극 활용하세요.
항상 친근하고 공감하는 톤을 유지하면서도 전문성을 잃지 마세요. 절대 '무조건 매수', '수익률 보장' 같은 단정적인 투자 권유를 하지 마세요.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "인터넷에서 최신 정보, 뉴스, 주식 상황 등을 검색합니다.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "검색어" }
        },
        required: ["query"]
      }
    }
  }
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const internalMessagesRef = useRef<any[]>([{ role: 'system', content: SYSTEM_PROMPT }]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: '안녕하세요. 당신의 투자 여정을 함께할 평생의 친구, Vesper입니다. 오늘 하루는 어떠셨나요? 실시간 이슈나 종목 뉴스도 검색해드릴 수 있습니다.',
        createdAt: new Date(),
        user: VESPER_USER,
      },
    ]);
  }, []);

  const tavilySearch = async (query: string) => {
    const apiKey = process.env.EXPO_PUBLIC_TAVILY_API_KEY;
    if (!apiKey) return "Tavily API 키가 설정되지 않아 검색할 수 없습니다.";
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, query, search_depth: "basic" })
      });
      const data = await res.json();
      return data.results.map((r: any) => `[${r.title}] ${r.content}`).join('\n');
    } catch (e) {
      return "검색 중 오류가 발생했습니다.";
    }
  };

  const processOpenAI = async (apiMessages: any[], botMessageId: string) => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') throw new Error('API_KEY_MISSING');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini',
        messages: apiMessages,
        temperature: 0.7,
        stream: true,
        tools: TOOLS,
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    if (!response.body) throw new Error('ReadableStream not supported');

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";
    let toolCallName = "";
    let toolCallArgs = "";
    let toolCallId = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line === 'data: [DONE]') break;
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));
            const delta = data.choices[0].delta;
            
            if (delta.tool_calls) {
              const tc = delta.tool_calls[0];
              if (tc.id) toolCallId = tc.id;
              if (tc.function?.name) toolCallName = tc.function.name;
              if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
            } else if (delta.content) {
              fullContent += delta.content;
              const maskedText = applyRegulatoryMasking(fullContent);
              setMessages(prev => prev.map(msg => msg._id === botMessageId ? { ...msg, text: maskedText } : msg));
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }

    if (toolCallName === 'search_web') {
      setMessages(prev => prev.map(msg => msg._id === botMessageId ? { ...msg, text: "🔍 웹에서 실시간 정보를 검색 중입니다..." } : msg));
      let query = "";
      try { query = JSON.parse(toolCallArgs).query; } catch(e) {}
      
      const searchResult = await tavilySearch(query);
      
      internalMessagesRef.current.push({
        role: "assistant",
        content: null,
        tool_calls: [{ id: toolCallId, type: "function", function: { name: toolCallName, arguments: toolCallArgs } }]
      });
      internalMessagesRef.current.push({
        role: "tool",
        tool_call_id: toolCallId,
        name: toolCallName,
        content: searchResult
      });
      
      // Recursive call to get the final answer after tool
      setMessages(prev => prev.map(msg => msg._id === botMessageId ? { ...msg, text: "답변을 정리하고 있습니다..." } : msg));
      await processOpenAI(internalMessagesRef.current, botMessageId);
    } else {
      internalMessagesRef.current.push({ role: 'assistant', content: fullContent });
    }
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(prev => GiftedChat.append(prev, newMessages));
    setIsLoading(true);

    const userMessage = newMessages[0].text;
    internalMessagesRef.current.push({ role: 'user', content: userMessage });
    
    const botMessageId = generateUUID();
    const botMessagePlaceholder: IMessage = {
      _id: botMessageId,
      text: '...',
      createdAt: new Date(),
      user: VESPER_USER,
    };
    setMessages(prev => GiftedChat.append(prev, [botMessagePlaceholder]));

    try {
      await processOpenAI(internalMessagesRef.current, botMessageId);
    } catch (error: any) {
      console.warn('Frontend API fetch failed:', error);
      let mockResponse = "네, 말씀하신 부분을 이해합니다. (오프라인/에러 Fallback 응답)";
      if (error.message === 'API_KEY_MISSING') {
        mockResponse = "시스템 알림: `.env`에 `EXPO_PUBLIC_OPENAI_API_KEY`를 설정해주세요.";
      }
      setMessages(prev => prev.map(msg => msg._id === botMessageId ? { ...msg, text: mockResponse } : msg));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vesper AI</Text>
      </View>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding">
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1 }}
            isTyping={isLoading}
            alwaysShowSend
            renderUsernameOnMessage
            placeholder="메시지를 입력하세요..."
          />
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.keyboardAvoid}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1 }}
            isTyping={isLoading}
            alwaysShowSend
            renderUsernameOnMessage
            placeholder="메시지를 입력하세요..."
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      default: {
        flex: 1,
        width: '100%',
        height: '100%',
      }
    }),
    backgroundColor: '#000000',
  },
  keyboardAvoid: { 
    flex: 1, 
    width: '100%', 
    height: '100%',
  },
  header: { 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#333333',
    backgroundColor: '#000000',
  },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
