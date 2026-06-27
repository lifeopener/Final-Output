import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { PLAYBOARD_DATA } from '../../../playboard-registry/data';

export default function UXFlowOverview() {
  const { flow } = useLocalSearchParams();
  const data = PLAYBOARD_DATA;
  const flowData = data.flows.find(f => f.id === flow);

  if (!flowData) return <Text style={{ color: 'red' }}>Flow Not Found</Text>;

  const flowScreens = flowData.screens.map(key => {
    const [plane, slug] = key.split('/');
    return data.screens.find(s => s.plane === plane && s.slug === slug);
  }).filter(Boolean) as any[];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>데스크톱 흐름 오버뷰: {flowData.title}</Text>
      <Text style={styles.description}>{flowData.description} ({flowScreens.length}개 화면)</Text>

      {/* 썸네일 스트립 Placeholder */}
      <View style={styles.strip}>
        {flowScreens.map((screen, i) => (
          <View key={screen.slug} style={styles.stripItem}>
            <View style={styles.miniThumb} />
            <Text style={{color: '#AAA', fontSize: 10, marginTop: 4}}>{i+1}. {screen.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.content}>
        {flowScreens.map((screen, idx) => (
          <View key={screen.slug} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.stepText}>{flowData.isSequential ? `${idx + 1}단계` : '예외 케이스'} · {screen.designSpecType}</Text>
              <Link href={`/(playboard)/screens/${screen.plane}/${screen.slug}`} style={styles.link}>화면 데모</Link>
            </View>
            <Text style={styles.screenTitle}>{screen.title}</Text>
            <Text style={styles.flowNote}>{screen.flowNote}</Text>
            
            <Link href={`/(playboard)/screens/${screen.plane}/${screen.slug}`} style={styles.captureLink}>
              <View style={styles.captureLarge}>
                <Text style={{color: '#666'}}>클릭하여 원본 비율 화면 보기</Text>
              </View>
            </Link>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  description: { fontSize: 16, color: '#AAA', marginTop: 8, marginBottom: 24 },
  strip: { flexDirection: 'row', gap: 16, marginBottom: 32, overflow: 'scroll' },
  stripItem: { alignItems: 'center' },
  miniThumb: { width: 80, height: 50, backgroundColor: '#333', borderRadius: 4 },
  content: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  card: { backgroundColor: '#1E1E1E', padding: 24, borderRadius: 8, marginBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stepText: { color: '#888', fontWeight: 'bold' },
  link: { color: '#2196F3', textDecorationLine: 'underline' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  flowNote: { color: '#AAA', marginVertical: 8 },
  captureLink: { marginTop: 16 },
  captureLarge: { height: 500, backgroundColor: '#2D2D2D', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
});
