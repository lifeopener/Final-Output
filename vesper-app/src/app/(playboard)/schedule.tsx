import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PLAYBOARD_DATA } from '../../../playboard-registry/data';
import { calculateWaves } from '../../../playboard-registry/derived';
import StatusBadge from '../../../components/playboard/StatusBadge';

export default function PlayBoardSchedule() {
  const data = PLAYBOARD_DATA;
  const waves = calculateWaves(data);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>병렬 일정표 (Wave 파생)</Text>
      
      {waves.map(wave => (
        <View key={wave.index} style={styles.waveTile}>
          <Text style={styles.waveTitle}>Wave {wave.index} · 시작 예정: {wave.startDateEstimate} · {wave.items.length}건 병렬</Text>
          <View style={styles.grid}>
            {wave.items.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{item.id}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                
                {item.dependsOn.length > 0 ? (
                  <Text style={styles.dependsOn}>선행 대기: {item.dependsOn.join(', ')}</Text>
                ) : (
                  <Text style={styles.noDepends}>차단 선행 없음 — 즉시 착수 가능</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  waveTile: { marginBottom: 24 },
  waveTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { flex: 1, minWidth: 250, backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardId: { color: '#888', fontWeight: 'bold' },
  cardTitle: { fontSize: 16, color: '#FFF', marginBottom: 12 },
  dependsOn: { color: '#FF9800', fontSize: 12 },
  noDepends: { color: '#4CAF50', fontSize: 12 },
});
