import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PLAYBOARD_DATA } from '../../../playboard-registry/data';
import DiagramModal from '../../../components/playboard/DiagramModal';
import StatusBadge from '../../../components/playboard/StatusBadge';

export default function PlayBoardPlan() {
  const data = PLAYBOARD_DATA;

  // Generate Mermaid DAG
  let mermaid = 'graph TD\n';
  data.workItems.forEach(item => {
    mermaid += `  ${item.id}["${item.id} - ${item.title}"]\n`;
    item.dependsOn.forEach(dep => {
      mermaid += `  ${dep} --> ${item.id}\n`;
    });
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실행 계획 (작업 DAG)</Text>
      
      <DiagramModal title="의존성 DAG" mermaidCode={mermaid} />

      {data.phaseOrder.map(phase => {
        const itemsInPhase = data.workItems.filter(w => w.phase === phase);
        if (itemsInPhase.length === 0) return null;

        return (
          <View key={phase} style={styles.phaseTile}>
            <Text style={styles.phaseTitle}>{phase}</Text>
            {itemsInPhase.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemId}>{item.id}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <StatusBadge status={item.status} />
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  phaseTile: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, marginTop: 16 },
  phaseTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  itemId: { color: '#888', width: 60 },
  itemTitle: { color: '#FFF', flex: 1 },
});
