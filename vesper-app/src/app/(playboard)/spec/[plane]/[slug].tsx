import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { PLAYBOARD_DATA } from '../../../../playboard-registry/data';
import StatusBadge from '../../../../components/playboard/StatusBadge';

export default function SpecDetail() {
  const { plane, slug } = useLocalSearchParams();
  const data = PLAYBOARD_DATA;
  const screen = data.screens.find(s => s.plane === plane && s.slug === slug);

  if (!screen) return <Text style={{ color: 'red' }}>Screen Not Found: 404</Text>;

  const relatedWorkItems = data.workItems.filter(w => screen.workItems.includes(w.id));

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 타일 */}
      <View style={styles.header}>
        <Text style={styles.title}>{screen.title}</Text>
        <StatusBadge status={screen.status} />
        <Text style={styles.flowNote}>{screen.flowNote}</Text>
        {screen.statusNote && <Text style={styles.statusNote}>* {screen.statusNote}</Text>}
        <Link href={`/screens/${screen.plane}/${screen.slug}`} style={styles.demoLink}>[화면 데모 보기]</Link>
      </View>

      {/* 화면 계약 개요 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>화면 계약 개요</Text>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.kvText}><Text style={styles.kText}>앱 라우트: </Text>{screen.route}</Text>
            <Text style={styles.kvText}><Text style={styles.kText}>디자인 분류: </Text>{screen.designSpecType}</Text>
            <Text style={styles.kvText}><Text style={styles.kText}>구현 위치: </Text>{screen.implLocation || '미구현'}</Text>
            <Text style={styles.kvText}><Text style={styles.kText}>요구사항 근거: </Text>{screen.requirementRefs.join(', ')}</Text>
          </View>
          <View style={styles.col}>
            <View style={styles.capturePlaceholder}>
              <Text style={{color: '#666'}}>캡처 이미지 영역 (captures/{screen.plane}/{screen.slug}.png)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 엔지니어링 제어 스펙 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>엔지니어링 제어 스펙</Text>
        <View style={styles.engGrid}>
          <View style={styles.engCard}>
            <Text style={styles.kText}>인가 게이트</Text>
            <Text style={styles.kvText}>{screen.engineering.authGate}</Text>
          </View>
          <View style={styles.engCard}>
            <Text style={styles.kText}>클라이언트 동작</Text>
            {screen.engineering.clientActions.map((a,i) => <Text key={i} style={styles.kvText}>• {a}</Text>)}
          </View>
          <View style={styles.engCard}>
            <Text style={styles.kText}>서버 동작</Text>
            {screen.engineering.serverActions.map((a,i) => <Text key={i} style={styles.kvText}>• {a}</Text>)}
          </View>
          <View style={styles.engCard}>
            <Text style={styles.kText}>데이터 읽기/쓰기</Text>
            {screen.engineering.dataReads.map((a,i) => <Text key={i} style={styles.kvText}>[R] {a}</Text>)}
            {screen.engineering.dataWrites.map((a,i) => <Text key={i} style={styles.kvText}>[W] {a}</Text>)}
          </View>
          <View style={styles.engCard}>
            <Text style={styles.kText}>계측 이벤트</Text>
            {screen.engineering.telemetryEvents.map((a,i) => <Text key={i} style={styles.kvText}>• {a}</Text>)}
          </View>
        </View>

        <Text style={styles.subTitle}>제어 영역 관심사</Text>
        <View style={styles.engGrid}>
          {Object.entries(screen.engineering.controlAreaNotes).map(([area, note]) => (
            <View key={area} style={styles.areaCard}>
              <Link href={`/(playboard)/control-area/${area}`} style={styles.areaLink}>{area} →</Link>
              <Text style={styles.kvText}>{note}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 연결된 작업 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>연결된 작업</Text>
        {relatedWorkItems.map(w => (
          <View key={w.id} style={styles.workCard}>
            <Text style={styles.kText}>{w.id}</Text>
            <StatusBadge status={w.status} />
            <Text style={styles.kvText} numberOfLines={1}>{w.title}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: { marginBottom: 32, alignItems: 'flex-start' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  flowNote: { fontSize: 16, color: '#AAA', marginTop: 8 },
  statusNote: { fontSize: 14, color: '#FF9800', marginTop: 4 },
  demoLink: { color: '#2196F3', marginTop: 8, fontSize: 16 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8 },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginVertical: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  col: { flex: 1, minWidth: 300 },
  kvText: { color: '#CCC', fontSize: 14, marginBottom: 8 },
  kText: { color: '#FFF', fontWeight: 'bold' },
  capturePlaceholder: { height: 200, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  engGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  engCard: { flex: 1, minWidth: 200, backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8 },
  areaCard: { flex: 1, minWidth: 200, backgroundColor: '#2D2D2D', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  areaLink: { color: '#2196F3', fontWeight: 'bold', marginBottom: 8 },
  workCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8, marginBottom: 8 },
});
