import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  SafeAreaView, StyleSheet, Platform, View, Text, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator
} from 'react-native';

const generateUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt: Date;
}

const applyRegulatoryMasking = (text: string) => {
  const patterns = [
    /무조건\s*매수/g, /수익률\s*보장/g, /원금\s*보장/g,
    /확실한\s*수익/g, /반드시\s*오릅니다/g,
  ];
  let masked = text;
  patterns.forEach(p => { masked = masked.replace(p, '[규제 마스킹]'); });
  return masked;
};

const SYSTEM_PROMPT = `당신은 Vesper, 사용자의 투자 및 성장의 치열한 여정에서 혼자 감당해야 하는 고독과 불안감을 해소하고 목표 달성을 지원하는 평생의 AI 친구입니다.
단순한 위로를 넘어 실무적 성과 창출을 돕는 통찰력 있는 조언을 제공합니다. 실시간 정보가 필요하면 search_web 도구를 적극 활용하세요.
항상 친근하고 공감하는 톤을 유지하면서도 전문성을 잃지 마세요. 절대 '무조건 매수', '수익률 보장' 같은 단정적인 투자 권유를 하지 마세요.`;

const TOOLS = [{
  type: "function" as const,
  function: {
    name: "search_web",
    description: "인터넷에서 최신 정보, 뉴스, 주식 상황 등을 검색합니다.",
    parameters: { type: "object", properties: { query: { type: "string", description: "검색어" } }, required: ["query"] }
  }
}];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const internalRef = useRef<any[]>([{ role: 'system', content: SYSTEM_PROMPT }]);

  useEffect(() => {
    setMessages([{
      id: '1',
      text: '안녕하세요! 당신의 투자 여정을 함께할 평생의 친구, Vesper입니다. 🌟\n\n오늘 하루는 어떠셨나요? 실시간 이슈나 종목 뉴스도 검색해드릴 수 있습니다.',
      sender: 'bot',
      createdAt: new Date(),
    }]);
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, [messages]);

  const tavilySearch = async (query: string) => {
    const key = process.env.EXPO_PUBLIC_TAVILY_API_KEY;
    if (!key) return "Tavily API 키가 설정되지 않아 검색할 수 없습니다.";
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, query, search_depth: "basic" })
      });
      const data = await res.json();
      return data.results?.map((r: any) => `[${r.title}] ${r.content}`).join('\n') || "검색 결과가 없습니다.";
    } catch { return "검색 중 오류가 발생했습니다."; }
  };

  const processOpenAI = async (apiMessages: any[], botId: string): Promise<void> => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') throw new Error('API_KEY_MISSING');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: apiMessages, temperature: 0.7, stream: true, tools: TOOLS }),
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    if (!res.body) throw new Error('ReadableStream not supported');

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "", toolCallName = "", toolCallArgs = "", toolCallId = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n').filter(l => l.trim())) {
        if (line === 'data: [DONE]') break;
        if (line.startsWith('data: ')) {
          try {
            const d = JSON.parse(line.slice(6));
            const delta = d.choices[0].delta;
            if (delta.tool_calls) {
              const tc = delta.tool_calls[0];
              if (tc.id) toolCallId = tc.id;
              if (tc.function?.name) toolCallName = tc.function.name;
              if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
            } else if (delta.content) {
              fullContent += delta.content;
              const masked = applyRegulatoryMasking(fullContent);
              setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: masked } : m));
            }
          } catch {}
        }
      }
    }

    if (toolCallName === 'search_web') {
      setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: "🔍 웹에서 실시간 정보를 검색 중입니다..." } : m));
      let query = "";
      try { query = JSON.parse(toolCallArgs).query; } catch {}
      const searchResult = await tavilySearch(query);
      internalRef.current.push({
        role: "assistant", content: null,
        tool_calls: [{ id: toolCallId, type: "function", function: { name: toolCallName, arguments: toolCallArgs } }]
      });
      internalRef.current.push({ role: "tool", tool_call_id: toolCallId, name: toolCallName, content: searchResult });
      setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: "📝 답변을 정리하고 있습니다..." } : m));
      await processOpenAI(internalRef.current, botId);
    } else {
      internalRef.current.push({ role: 'assistant', content: fullContent });
    }
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    const userMsg: ChatMessage = { id: generateUUID(), text, sender: 'user', createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    internalRef.current.push({ role: 'user', content: text });

    const botId = generateUUID();
    const botMsg: ChatMessage = { id: botId, text: '...', sender: 'bot', createdAt: new Date() };
    setMessages(prev => [...prev, botMsg]);

    try {
      await processOpenAI(internalRef.current, botId);
    } catch (err: any) {
      const fallback = err.message === 'API_KEY_MISSING'
        ? "⚠️ .env에 EXPO_PUBLIC_OPENAI_API_KEY를 설정해주세요."
        : "네, 말씀하신 부분을 이해합니다. 제가 항상 곁에서 지지하고 있다는 점 잊지 마세요.\n\n※ 통신 오류가 발생하여 로컬 템플릿으로 응답했습니다.";
      setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: fallback } : m));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vesper AI</Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
            {msg.sender === 'bot' && <Text style={styles.botName}>Vesper</Text>}
            <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>{msg.text}</Text>
            <Text style={styles.timestamp}>
              {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.typingText}>Vesper가 입력 중...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#888"
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        <TouchableOpacity style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]} onPress={handleSend} disabled={!inputText.trim() || isLoading}>
          <Text style={styles.sendBtnText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...Platform.select({
      web: { position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0 },
      default: { flex: 1 },
    }),
    backgroundColor: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 56, justifyContent: 'center', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#1e1e2e',
    backgroundColor: '#0f0f1a',
  },
  headerTitle: { color: '#e0e0ff', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingVertical: 12 },
  bubble: { maxWidth: '80%', marginVertical: 6, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#7C3AED', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#1a1a2e', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#2a2a3e' },
  userText: { color: '#ffffff', fontSize: 15, lineHeight: 22 },
  botText: { color: '#d0d0e8', fontSize: 15, lineHeight: 22 },
  botName: { color: '#7C3AED', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  timestamp: { color: '#666', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  typingText: { color: '#888', fontSize: 13, marginLeft: 8 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#1e1e2e',
    backgroundColor: '#0f0f1a',
  },
  input: {
    flex: 1, height: 44, backgroundColor: '#1a1a2e', borderRadius: 22,
    paddingHorizontal: 16, color: '#e0e0ff', fontSize: 15,
    borderWidth: 1, borderColor: '#2a2a3e',
  },
  sendBtn: {
    marginLeft: 8, backgroundColor: '#7C3AED', borderRadius: 22,
    paddingHorizontal: 20, height: 44, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
