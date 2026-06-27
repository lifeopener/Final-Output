import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

interface DiagramModalProps {
  mermaidCode: string;
  title: string;
}

export default function DiagramModal({ mermaidCode, title }: DiagramModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.previewBtn} onPress={() => setIsOpen(true)}>
        <Text style={styles.previewText}>{title} (다이어그램 보기)</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent={true} animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeBtn}>닫기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollArea}>
              <Text style={styles.mermaidText}>{mermaidCode}</Text>
              <Text style={styles.note}>* Mermaid 렌더링은 웹 기반 뷰어가 필요하여 현재 원시 코드로 출력됩니다.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  previewBtn: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewText: {
    color: '#FFF',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    width: '100%',
    maxWidth: 800,
    maxHeight: '90%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: '#F44336',
    fontSize: 16,
  },
  scrollArea: {
    padding: 16,
  },
  mermaidText: {
    color: '#AEEA00',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  note: {
    marginTop: 16,
    color: '#888',
    fontSize: 12,
  },
});
