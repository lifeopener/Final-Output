import React from 'react';
import { Slot } from 'expo-router';
import { View, StyleSheet, ScrollView } from 'react-native';
import PlayBoardNav from '../../components/playboard/PlayBoardNav';

export default function PlayBoardLayout() {
  if (!__DEV__) {
    // In production, we might want to hide PlayBoard or protect it behind an admin login
    // For now, MVP just hides it via conditional rendering or returns 404
  }

  return (
    <View style={styles.container}>
      <PlayBoardNav />
      <ScrollView style={styles.content}>
        <Slot />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
