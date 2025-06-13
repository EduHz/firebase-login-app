import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Actividades() {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Stack.Screen options={{ title: 'Actividades' }} />
      <Text>Pantalla de actividades</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
