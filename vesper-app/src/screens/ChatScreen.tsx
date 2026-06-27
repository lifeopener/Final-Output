import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet, Platform, View, Text, TextInput,
  Pressable, ScrollView, Animated,
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

// NFR-002 Compliance
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

const WELCOME_TEXT = '안녕하세요! 당신의 투자 여정을 함께할 평생의 친구, Vesper입니다. 🌟\n\n오늘 하루는 어떠셨나요? 실시간 이슈나 종목 뉴스도 검색해드릴 수 있어요.';

/* ── Animated Message Bubble ── */
function MessageBubble({ msg, index }: { msg: ChatMessage; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const isUser = msg.sender === 'user';

  return (
    <Animated.View style={[
      styles.msgRow,
      isUser ? styles.msgRowUser : styles.msgRowBot,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>V</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        {!isUser && <Text style={styles.botLabel}>Vesper</Text>}
        <Text style={isUser ? styles.userText : styles.botText}>{msg.text}</Text>
        <Text style={[styles.time, isUser && styles.timeUser]}>
          {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ── Typing Indicator ── */
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.msgRow}>
      <View style={styles.avatar}><Text style={styles.avatarText}>V</Text></View>
      <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.dotRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
}

/* ── Main ChatScreen ── */
export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const internalRef = useRef<any[]>([{ role: 'system', content: SYSTEM_PROMPT }]);

  useEffect(() => {
    setMessages([{
      id: '1', text: WELCOME_TEXT, sender: 'bot', createdAt: new Date(),
    }]);
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 150);
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
      setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: "🔍 웹에서 실시간 정보를 검색하고 있어요..." } : m));
      let query = "";
      try { query = JSON.parse(toolCallArgs).query; } catch {}
      const searchResult = await tavilySearch(query);
      internalRef.current.push({
        role: "assistant", content: null,
        tool_calls: [{ id: toolCallId, type: "function", function: { name: toolCallName, arguments: toolCallArgs } }]
      });
      internalRef.current.push({ role: "tool", tool_call_id: toolCallId, name: toolCallName, content: searchResult });
      setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: "📝 답변을 정리하고 있어요..." } : m));
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
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>V</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Vesper AI</Text>
            <Text style={styles.headerSub}>{isLoading ? '입력 중...' : '온라인'}</Text>
          </View>
        </View>
        <View style={styles.headerDot}>
          <View style={[styles.statusDot, isLoading ? styles.statusBusy : styles.statusOnline]} />
        </View>
      </View>

      {/* ── Messages ── */}
      <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        <View style={styles.dateChip}>
          <Text style={styles.dateChipText}>오늘</Text>
        </View>
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} index={i} />
        ))}
        {isLoading && <TypingIndicator />}
      </ScrollView>

      {/* ── Input Bar ── */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            onSubmitEditing={handleSend}
            editable={!isLoading}
            returnKeyType="send"
            blurOnSubmit={false}
            {...(Platform.OS === 'web' ? { onKeyPress: (e: any) => { if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) { e.preventDefault(); handleSend(); } } } : {})}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0c0c14',
    display: 'flex',
    flexDirection: 'column',
    minHeight: Platform.OS === 'web' ? '100vh' as any : undefined,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'web' ? {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
    } : {}),
  },

  // Header
  header: {
    flexShrink: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(12,12,20,0.95)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    ...(Platform.OS === 'web' ? { position: 'sticky' as any, top: 0, zIndex: 100, backdropFilter: 'blur(20px)' as any } : {}),
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8,
  },
  headerAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerTitle: { color: '#f0f0ff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#50E3C2', fontSize: 12, fontWeight: '500', marginTop: 1 },
  headerDot: { paddingRight: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusOnline: { backgroundColor: '#50E3C2' },
  statusBusy: { backgroundColor: '#FFD93D' },

  // Chat Area
  chatArea: { flex: 1, overflow: Platform.OS === 'web' ? 'hidden' as any : undefined },
  chatContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 },

  // Date Chip
  dateChip: {
    alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, marginBottom: 12,
  },
  dateChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' },

  // Message Row
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },

  // Avatar
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 2,
  },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Bubbles
  bubble: { maxWidth: '75%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: {
    backgroundColor: '#7C3AED', borderBottomRightRadius: 6,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  botBubble: {
    backgroundColor: '#1a1a2e', borderBottomLeftRadius: 6,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.15)',
  },
  userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  botText: { color: '#d8d8f0', fontSize: 15, lineHeight: 22 },
  botLabel: { color: '#7C3AED', fontSize: 11, fontWeight: '700', marginBottom: 3, letterSpacing: 0.5 },
  time: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeUser: { color: 'rgba(255,255,255,0.55)' },

  // Typing
  typingBubble: { paddingVertical: 14, paddingHorizontal: 18 },
  dotRow: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED' },

  // Input Bar
  inputBar: {
    flexShrink: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(12,12,20,0.95)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' as any } : {}),
  },
  inputWrapper: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'web' ? 10 : 8,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.15)',
    maxHeight: 120,
  },
  input: {
    color: '#e8e8ff', fontSize: 15, lineHeight: 20,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  sendBtnDisabled: { backgroundColor: 'rgba(124,58,237,0.3)', shadowOpacity: 0 },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
