import { View, Text, StyleSheet } from 'react-native';

export default function Lugares() {
  return (
    <View style={styles.container}>
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
