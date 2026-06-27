import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PLAYBOARD_DATA } from '../../../playboard-registry/data';
import { getScreenCountsByStatus, getWorkItemCountsByStatus } from '../../../playboard-registry/derived';
import { Link } from 'expo-router';

export default function PlayBoardIndex() {
  const data = PLAYBOARD_DATA;
  const screenCounts = getScreenCountsByStatus(data);
  const workCounts = getWorkItemCountsByStatus(data);

  return (
    <View style={styles.container}>
      {/* 타일 1: 히어로 */}
      <View style={styles.tile}>
        <Text style={styles.heroTitle}>Vesper PlayBoard</Text>
        <Text style={styles.heroSubtitle}>기획·구현 단일 진실 공급원 (SoT)</Text>
      </View>

      {/* 타일 2: 요약 */}
      <View style={styles.tile}>
        <Text style={styles.sectionTitle}>현황 요약</Text>
        <View style={styles.grid}>
          <Link href="/(playboard)/implement-summary" style={styles.card}>
            <Text style={styles.cardTitle}>화면 현황</Text>
            {Object.entries(screenCounts).map(([status, count]) => (
              <Text key={status} style={styles.cardText}>{status}: {count}건</Text>
            ))}
          </Link>
          <Link href="/(playboard)/plan" style={styles.card}>
            <Text style={styles.cardTitle}>작업 현황</Text>
            {Object.entries(workCounts).map(([status, count]) => (
              <Text key={status} style={styles.cardText}>{status}: {count}건</Text>
            ))}
          </Link>
        </View>
      </View>

      {/* 타일 3: 제어 영역 요약 */}
      <View style={styles.tile}>
        <Text style={styles.sectionTitle}>제어 영역 요약</Text>
        <View style={styles.grid}>
          {data.controlAreas.map(area => {
            const covered = data.screens.filter(s => s.engineering.controlAreaNotes[area.area]).length;
            return (
              <Link key={area.area} href={`/(playboard)/control-area/${area.area}`} style={styles.card}>
                <Text style={styles.cardTitle}>{area.area}</Text>
                <Text style={styles.cardText}>대응 화면: {covered} / {data.screens.length}</Text>
              </Link>
            );
          })}
        </View>
      </View>
      
      {/* 타일 4: 흐름 진입 */}
      <View style={styles.tile}>
        <Text style={styles.sectionTitle}>흐름 시나리오</Text>
        <View style={styles.grid}>
          {data.flows.map(flow => (
            <Link key={flow.id} href={`/(playboard)/scenario/${flow.id}`} style={styles.card}>
              <Text style={styles.cardTitle}>{flow.title}</Text>
              <Text style={styles.cardText}>{flow.description}</Text>
            </Link>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24, paddingBottom: 40 },
  tile: { backgroundColor: '#1E1E1E', padding: 24, borderRadius: 8 },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  heroSubtitle: { fontSize: 16, color: '#AAA', marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { flex: 1, minWidth: 200, backgroundColor: '#2D2D2D', padding: 16, borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#AAA' },
});
