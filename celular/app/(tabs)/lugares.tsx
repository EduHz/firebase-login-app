import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Lugares() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Lugares' }} />
      <Text>Pantalla de lugares</Text>
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
