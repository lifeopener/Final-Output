import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';
import { PlayBoardSoT, ScreenRegistry } from '../../playboard-registry/models';
import { Link } from 'expo-router';

interface MatrixProps {
  data: PlayBoardSoT;
}

type SortKey = 'title' | 'status' | string;

export default function SortableMatrixTable({ data }: MatrixProps) {
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDesc, setSortDesc] = useState(false);

  const areas = data.controlAreas.map(c => c.area);
  
  const sortedScreens = [...data.screens].sort((a, b) => {
    let valA: any = a.title;
    let valB: any = b.title;

    if (sortKey === 'status') {
      const rank = (s: string) => data.statusOrder.indexOf(s as any);
      valA = rank(a.status);
      valB = rank(b.status);
    } else if (sortKey !== 'title') {
      // It's a control area
      valA = a.engineering.controlAreaNotes[sortKey] ? 1 : 0;
      valB = b.engineering.controlAreaNotes[sortKey] ? 1 : 0;
    }

    if (valA === valB) {
      return a.title.localeCompare(b.title);
    }
    
    const cmp = valA > valB ? 1 : -1;
    return sortDesc ? -cmp : cmp;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return '↕';
    return sortDesc ? '▼' : '▲';
  };

  return (
    <ScrollView horizontal style={styles.scroll}>
      <View>
        {/* Header */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.cell, styles.headerCell, { width: 200 }]} onPress={() => handleSort('title')}>
            <Text style={styles.headerText}>화면 {getSortIcon('title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cell, styles.headerCell]} onPress={() => handleSort('status')}>
            <Text style={styles.headerText}>상태 {getSortIcon('status')}</Text>
          </TouchableOpacity>
          {areas.map(area => (
            <TouchableOpacity key={area} style={[styles.cell, styles.headerCell]} onPress={() => handleSort(area)}>
              <Text style={styles.headerText}>{area} {getSortIcon(area)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rows */}
        {sortedScreens.map(screen => (
          <View key={screen.slug} style={styles.row}>
            <View style={[styles.cell, { width: 200 }]}>
              <Link href={`/spec/${screen.plane}/${screen.slug}`} style={styles.link}>
                {screen.title} ({screen.plane})
              </Link>
            </View>
            <View style={styles.cell}>
              <StatusBadge status={screen.status} />
            </View>
            {areas.map(area => {
              const hasNote = !!screen.engineering.controlAreaNotes[area];
              return (
                <View key={area} style={[styles.cell, styles.centerCell]}>
                  <Text style={styles.dot}>{hasNote ? '●' : '·'}</Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.footerCell, { width: 200 }]}>
            <Text style={styles.footerText}>Total: {data.screens.length}</Text>
          </View>
          <View style={[styles.cell, styles.footerCell]} />
          {areas.map(area => {
            const count = data.screens.filter(s => !!s.engineering.controlAreaNotes[area]).length;
            return (
              <View key={area} style={[styles.cell, styles.centerCell, styles.footerCell]}>
                <Text style={styles.footerText}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cell: {
    padding: 12,
    width: 120,
    justifyContent: 'center',
  },
  centerCell: {
    alignItems: 'center',
  },
  headerCell: {
    backgroundColor: '#2D2D2D',
  },
  headerText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  dot: {
    color: '#FFF',
    fontSize: 18,
  },
  footerCell: {
    backgroundColor: '#2D2D2D',
  },
  footerText: {
    color: '#AAA',
    fontWeight: 'bold',
  },
});
