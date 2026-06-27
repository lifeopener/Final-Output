import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PLAYBOARD_DATA } from '../../playboard-registry/data';
import SortableMatrixTable from '../../components/playboard/SortableMatrixTable';

export default function PlayBoardImplementSummary() {
  const data = PLAYBOARD_DATA;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>구현 통계 매트릭스</Text>
      <Text style={styles.description}>
        산출물 화면 단위로 제어 영역(Control Area)의 정책 반영 여부를 확인합니다.
        (● = 대응 요점 기재 완료, · = 해당 없음 혹은 미해소 갭)
      </Text>
      
      <SortableMatrixTable data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  description: { fontSize: 14, color: '#AAA', marginBottom: 16 },
});
