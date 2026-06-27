import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { PLAYBOARD_DATA } from '../playboard-registry/data';
import { getScreenCountsByStatus, getWorkItemCountsByStatus } from '../playboard-registry/derived';

export default function HubPage() {
  const data = PLAYBOARD_DATA;
  const screenCounts = getScreenCountsByStatus(data);
  const workCounts = getWorkItemCountsByStatus(data);

  const NAV_ITEMS = [
    { label: '💬 Vesper AI 채팅', href: '/chat', desc: 'AI 친구와 실시간 대화 · 웹 검색 · 투자 동반자' },
    { label: '📊 PlayBoard 상황판', href: '/(playboard)', desc: '기획·구현 단일 진실 공급원(SoT) 대시보드' },
    { label: '📋 실행 계획', href: '/(playboard)/plan', desc: '작업 항목별 진행 상태와 의존성 확인' },
    { label: '📅 일정표', href: '/(playboard)/schedule', desc: '페이즈별 타임라인 및 마일스톤' },
    { label: '📈 구현 통계', href: '/(playboard)/implement-summary', desc: '화면별 구현 상태 매트릭스' },
  ];

  const FLOW_ITEMS = data.flows.map(f => ({
    label: `🔀 ${f.title}`,
    href: `/(playboard)/scenario/${f.id}`,
    desc: f.description,
  }));

  const CONTROL_ITEMS = data.controlAreas.map(a => ({
    label: `🛡️ ${a.area}`,
    href: `/(playboard)/control-area/${a.area}`,
    desc: a.goal,
  }));

  return (
    <ScrollView style={styles.scrollRoot} contentContainerStyle={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌟</Text>
        <Text style={styles.heroTitle}>Vesper</Text>
        <Text style={styles.heroSub}>Action-Master AI Companion OS</Text>
        <Text style={styles.heroDesc}>
          투자 및 성장의 치열한 여정에서 함께하는 평생의 AI 친구
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Object.values(screenCounts).reduce((a, b) => a + b, 0)}</Text>
          <Text style={styles.statLabel}>화면</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Object.values(workCounts).reduce((a, b) => a + b, 0)}</Text>
          <Text style={styles.statLabel}>작업 항목</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workCounts['완료'] || 0}</Text>
          <Text style={styles.statLabel}>완료됨</Text>
        </View>
      </View>

      {/* Main Nav */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 페이지</Text>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href as any} style={styles.card}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </Link>
        ))}
      </View>

      {/* Flows */}
      {FLOW_ITEMS.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>흐름 시나리오</Text>
          {FLOW_ITEMS.map((item) => (
            <Link key={item.href} href={item.href as any} style={styles.cardSmall}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </Link>
          ))}
        </View>
      )}

      {/* Control Areas */}
      {CONTROL_ITEMS.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제어 영역</Text>
          <View style={styles.chipRow}>
            {CONTROL_ITEMS.map((item) => (
              <Link key={item.href} href={item.href as any} style={styles.chip}>
                <Text style={styles.chipText}>{item.label}</Text>
              </Link>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Vesper © 2026 · Built with Expo + React Native Web</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  container: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: {
    fontSize: 36, fontWeight: '800', color: '#f0f0ff',
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 14, fontWeight: '600', color: '#7C3AED',
    marginTop: 4, letterSpacing: 1,
  },
  heroDesc: {
    fontSize: 15, color: 'rgba(255,255,255,0.5)',
    marginTop: 12, textAlign: 'center', lineHeight: 22,
  },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  statNumber: {
    fontSize: 28, fontWeight: '800', color: '#7C3AED',
  },
  statLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#f0f0ff',
    marginBottom: 12,
  },

  // Cards
  card: {
    backgroundColor: '#141420',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardSmall: {
    backgroundColor: '#141420',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardLabel: {
    fontSize: 16, fontWeight: '700', color: '#e8e8ff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 18,
  },

  // Chips
  chipRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  chipText: {
    fontSize: 13, color: '#c4b5fd', fontWeight: '600',
  },

  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12, color: 'rgba(255,255,255,0.25)',
  },
});
