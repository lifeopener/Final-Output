import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PLAYBOARD_DATA } from '../../../../playboard-registry/data';
import StatusBadge from '../../../../components/playboard/StatusBadge';
import { Link } from 'expo-router';

export default function ControlAreaDetail() {
  const { area } = useLocalSearchParams();
  const data = PLAYBOARD_DATA;
  const areaData = data.controlAreas.find(c => c.area === area);

  if (!areaData) return <Text style={{ color: 'red' }}>Area Not Found: 404</Text>;

  const coveredScreens = data.screens.filter(s => s.engineering.controlAreaNotes[areaData.area]);
  const relatedWorkItems = data.workItems.filter(w => areaData.workItems.includes(w.id));

  return (
    <ScrollView style={styles.container}>
      {/* 1. 개요 */}
      <View style={styles.section}>
        <Text style={styles.label}>제어 영역</Text>
        <Text style={styles.title}>{areaData.area}</Text>
        <Text style={styles.goal}>목표: {areaData.goal}</Text>
        <Text style={styles.summary}>{areaData.summary}</Text>
      </View>

      {/* 2. 확정 정책 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>확정 정책 (결정 잠김)</Text>
        <View style={styles.grid}>
          {areaData.policies.map((p, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.policyStatement}>{i+1}. {p.statement}</Text>
              <Text style={styles.policyDetail}>{p.detail}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 3. 운영 결정값 + 기준 문서 */}
      <View style={styles.sectionRow}>
        <View style={styles.half}>
          <Text style={styles.sectionTitle}>운영 결정값</Text>
          {areaData.decisions.length === 0 ? <Text style={styles.empty}>고정된 결정값 없음</Text> : null}
          {areaData.decisions.map((d, i) => (
            <Text key={i} style={styles.textRow}>• {d.name}: {d.value}</Text>
          ))}
        </View>
        <View style={styles.half}>
          <Text style={styles.sectionTitle}>기준 문서</Text>
          <View style={styles.callout}>
            <Text style={styles.calloutText}>PlayBoard 싱크 규칙: 문서와 레지스트리는 항상 같은 PR에서 양방향 갱신 필수</Text>
          </View>
          {areaData.standards.map((s, i) => (
            <Text key={i} style={styles.textRow}>• {s.title} ({s.path})</Text>
          ))}
        </View>
      </View>

      {/* 4. 대응 화면 + 관련 작업 */}
      <View style={styles.sectionRow}>
        <View style={styles.half}>
          <Text style={styles.sectionTitle}>대응 화면</Text>
          {coveredScreens.map(s => (
            <View key={s.slug} style={styles.card}>
              <Link href={`/spec/${s.plane}/${s.slug}`} style={styles.link}>{s.title}</Link>
              <Text style={styles.textRow}>{s.engineering.controlAreaNotes[areaData.area]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.half}>
          <Text style={styles.sectionTitle}>관련 작업</Text>
          {relatedWorkItems.map(w => (
            <View key={w.id} style={styles.card}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.textRow}>{w.id}</Text>
                <StatusBadge status={w.status} />
              </View>
              <Text style={styles.textRow}>{w.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. 미해소 갭 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>미해소 갭</Text>
        <View style={styles.gapBox}>
          {areaData.gaps.length === 0 ? <Text style={styles.empty}>모든 갭 해소 완료</Text> : null}
          {areaData.gaps.map((g, i) => (
            <Text key={i} style={styles.gapText}>• {g}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionRow: { flexDirection: 'row', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
  half: { flex: 1, minWidth: 300 },
  label: { color: '#888', fontSize: 14 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  goal: { fontSize: 18, color: '#4CAF50', fontWeight: 'bold', marginBottom: 8 },
  summary: { fontSize: 16, color: '#AAA' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { flex: 1, minWidth: 250, backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', marginBottom: 8 },
  policyStatement: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  policyDetail: { color: '#AAA', fontSize: 14 },
  textRow: { color: '#CCC', fontSize: 14, marginBottom: 4 },
  empty: { color: '#666', fontStyle: 'italic' },
  callout: { backgroundColor: '#311B92', padding: 12, borderRadius: 8, marginBottom: 12 },
  calloutText: { color: '#B39DDB', fontWeight: 'bold' },
  link: { color: '#2196F3', textDecorationLine: 'underline', marginBottom: 8, fontSize: 16 },
  gapBox: { backgroundColor: '#3E2723', padding: 16, borderRadius: 8 },
  gapText: { color: '#FFB300', fontSize: 16, marginBottom: 4 },
});
