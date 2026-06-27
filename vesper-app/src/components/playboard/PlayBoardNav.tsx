import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link, usePathname } from 'expo-router';

export default function PlayBoardNav() {
  const pathname = usePathname();

  return (
    <View style={styles.navContainer}>
      <View style={styles.breadcrumbRow}>
        <Link href="/(playboard)" style={styles.brand}>PlayBoard</Link>
        <Text style={styles.slash}> / </Text>
        <Text style={styles.currentPath}>{pathname}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        <Link href="/(playboard)" style={[styles.tab, pathname === '/(playboard)' && styles.activeTab]}>상황판</Link>
        <Link href="/(playboard)/plan" style={[styles.tab, pathname === '/(playboard)/plan' && styles.activeTab]}>실행 계획</Link>
        <Link href="/(playboard)/schedule" style={[styles.tab, pathname === '/(playboard)/schedule' && styles.activeTab]}>일정표</Link>
        <Link href="/(playboard)/implement-summary" style={[styles.tab, pathname.includes('implement-summary') && styles.activeTab]}>구현 통계</Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    padding: 16,
    position: 'sticky' as any, // works in react-native-web
    top: 0,
    zIndex: 100,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brand: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  slash: { color: '#666', fontSize: 18 },
  currentPath: { color: '#AAA', fontSize: 14 },
  tabsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    color: '#888',
    fontSize: 16,
    marginRight: 16,
  },
  activeTab: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
