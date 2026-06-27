import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import StatusBadge from './StatusBadge';
import { ScreenRegistry } from '../../playboard-registry/models';

interface ScreenCardProps {
  screen: ScreenRegistry;
  compact?: boolean;
}

export default function ScreenCard({ screen, compact }: ScreenCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.thumbnailPlaceholder}>
        <Text style={styles.thumbnailText}>{screen.slug} Thumbnail</Text>
        {compact && (
          <View style={styles.overlayBadge}>
            <StatusBadge status={screen.status} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        {!compact && (
          <View style={styles.metaRow}>
            <Text style={styles.planeText}>{screen.plane.toUpperCase()} · {screen.designSpecType}</Text>
            <StatusBadge status={screen.status} />
          </View>
        )}
        <Text style={styles.title}>{screen.title}</Text>
        <Text style={styles.route}>{screen.route}</Text>
        
        <View style={styles.linksRow}>
          <Link href={`/spec/${screen.plane}/${screen.slug}`} style={styles.link}>기술 스펙</Link>
          <Link href={`/screens/${screen.plane}/${screen.slug}`} style={styles.link}>화면 데모</Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  thumbnailPlaceholder: {
    height: 120,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailText: { color: '#888' },
  overlayBadge: { position: 'absolute', top: 8, right: 8 },
  content: { padding: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  planeText: { color: '#AAA', fontSize: 12 },
  title: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  route: { color: '#888', fontSize: 12, marginBottom: 12 },
  linksRow: { flexDirection: 'row', gap: 16 },
  link: { color: '#2196F3', fontSize: 14 },
});
