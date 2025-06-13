import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, router } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword() {
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const handleSend = async () => {
    if (!email) {
      setMessage('Ingresá tu correo');
      setIsError(true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Te enviamos un correo para restablecer tu contraseña');
      setIsError(false);
    } catch (e) {
      setMessage('No se pudo enviar el correo');
      setIsError(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Stack.Screen options={{ title: 'Recuperar contraseña' }} />
      <TextInput
        style={[styles.input, { borderColor: Colors[colorScheme].icon }]}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Button title="Enviar" onPress={handleSend} color={Colors[colorScheme].tint} />
      {message ? (
        <Text style={{ color: isError ? 'red' : 'green', marginTop: 10 }}>{message}</Text>
      ) : null}
      <Button title="Volver" onPress={() => router.replace('/perfil')} color={Colors[colorScheme].tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#19647E',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
});
