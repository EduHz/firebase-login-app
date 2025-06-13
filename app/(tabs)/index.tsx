import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Inicio() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Inicio' }} />
      <Text>Pantalla de inicio</Text>
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
