import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { PLAYBOARD_DATA } from '../../../playboard-registry/data';

export function generateStaticParams() {
  return PLAYBOARD_DATA.flows.map(f => ({ flow: f.id }));
}

export default function MobileFlowCarousel() {
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
      <Text style={styles.title}>모바일 UX 오버뷰: {flowData.title}</Text>
      <Text style={styles.description}>{flowData.description}</Text>
      <Link href={`/(playboard)/ux-flow/${flowData.id}`} style={styles.link}>데스크톱 오버뷰로 가기</Link>

      <ScrollView horizontal style={styles.carousel} contentContainerStyle={styles.carouselContent}>
        {flowScreens.map((screen, idx) => (
          <View key={screen.slug} style={styles.phoneContainer}>
            <View style={styles.phoneBezel}>
              {Platform.OS === 'web' ? (
                <iframe 
                  src={`/screens/${screen.plane}/${screen.slug}`} 
                  style={{ width: 375, height: 812, border: 'none', transform: 'scale(0.8)', transformOrigin: 'top left' }}
                />
              ) : (
                <View style={styles.mobilePlaceholder}>
                  <Text style={{color: '#888'}}>Native View Placeholder</Text>
                </View>
              )}
            </View>
            <Text style={styles.screenTitle}>{idx + 1}. {screen.title}</Text>
            <Link href={`/(playboard)/spec/${screen.plane}/${screen.slug}`} style={styles.link}>기술 스펙</Link>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  description: { fontSize: 16, color: '#AAA', marginTop: 8, marginBottom: 8 },
  link: { color: '#2196F3', textDecorationLine: 'underline', marginBottom: 24 },
  carousel: { marginTop: 16 },
  carouselContent: { gap: 40, paddingRight: 40 },
  phoneContainer: { alignItems: 'center' },
  phoneBezel: { 
    width: 375 * 0.8, // accounting for iframe scale 
    height: 812 * 0.8, 
    borderRadius: 32, 
    borderWidth: 8, 
    borderColor: '#333', 
    backgroundColor: '#000',
    overflow: 'hidden',
    marginBottom: 16
  },
  mobilePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
});
