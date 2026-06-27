import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// Import the actual Vesper screens
import ChatScreen from '../../../../screens/ChatScreen';
import { PLAYBOARD_DATA } from '../../../../playboard-registry/data';

export function generateStaticParams() {
  return PLAYBOARD_DATA.screens.map(s => ({ plane: s.plane, slug: s.slug }));
}

export default function DemoScreenRouter() {
  const { plane, slug } = useLocalSearchParams();

  if (plane === 'end-user' && slug === 'chat') {
    return <ChatScreen />;
  }

  // Placeholder for other screens or un-implemented ones
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#888' }}>Mockup for {plane}/{slug}</Text>
      <Text style={{ color: '#555', marginTop: 8 }}>(아직 구현된 React 컴포넌트가 연결되지 않았습니다)</Text>
    </View>
  );
}
