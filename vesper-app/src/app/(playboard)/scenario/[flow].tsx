import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { PLAYBOARD_DATA } from '../../../../playboard-registry/data';
import StatusBadge from '../../../../components/playboard/StatusBadge';

export default function ScenarioWalkthrough() {
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
      <Text style={styles.title}>{flowData.title}</Text>
      <Text style={styles.description}>{flowData.description}</Text>
      <View style={styles.links}>
        <Link href={`/(playboard)/ux-flow/${flowData.id}`} style={styles.link}>데스크톱 오버뷰 보기</Link>
        <Link href={`/(playboard)/mobile-flow/${flowData.id}`} style={styles.link}>모바일 캐러셀 보기</Link>
      </View>

      {flowScreens.map((screen, idx) => (
        <View key={screen.slug} style={styles.row}>
          {/* Left: Capture */}
          <View style={styles.leftCol}>
            <Text style={styles.stepHeader}>{flowData.isSequential ? `${idx + 1}단계` : '예외 케이스'}</Text>
            <View style={styles.capturePlaceholder}>
              <Text style={{color: '#666'}}>{screen.slug} Capture</Text>
            </View>
          </View>
          
          {/* Right: Spec */}
          <View style={styles.rightCol}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.screenTitle}>{screen.title}</Text>
              <StatusBadge status={screen.status} />
            </View>
            <Text style={styles.route}>{screen.route}</Text>
            <Text style={styles.flowNote}>{screen.flowNote}</Text>
            
            <View style={styles.actionBox}>
              <Text style={styles.kText}>클라이언트 동작</Text>
              {screen.engineering.clientActions.map((a: string, i: number) => <Text key={i} style={styles.kvText}>• {a}</Text>)}
              <Text style={[styles.kText, {marginTop: 8}]}>서버 동작</Text>
              {screen.engineering.serverActions.map((a: string, i: number) => <Text key={i} style={styles.kvText}>• {a}</Text>)}
            </View>
            
            <Link href={`/(playboard)/spec/${screen.plane}/${screen.slug}`} style={styles.link}>기술 스펙 상세 →</Link>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  description: { fontSize: 16, color: '#AAA', marginTop: 8, marginBottom: 16 },
  links: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  link: { color: '#2196F3', textDecorationLine: 'underline' },
  row: { flexDirection: 'row', gap: 24, marginBottom: 40, flexWrap: 'wrap' },
  leftCol: { flex: 1, minWidth: 300 },
  rightCol: { flex: 1, minWidth: 300, backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8 },
  stepHeader: { color: '#888', fontWeight: 'bold', marginBottom: 8 },
  capturePlaceholder: { height: 400, backgroundColor: '#2D2D2D', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  route: { color: '#666', fontSize: 12, marginBottom: 8 },
  flowNote: { color: '#AAA', marginBottom: 16 },
  actionBox: { backgroundColor: '#121212', padding: 12, borderRadius: 8, marginBottom: 16 },
  kText: { color: '#FFF', fontWeight: 'bold', marginBottom: 4 },
  kvText: { color: '#CCC', fontSize: 14 },
});
