import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleSendEmail = async () => {
    if (!email) {
      setMessage('Ingresá tu correo.');
      setIsError(true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Te enviamos un correo para restablecer tu contraseña.');
      setIsError(false);
    } catch (error) {
      setMessage('No se pudo enviar el correo. Verificá el email.');
      setIsError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Recuperar contraseña' }} />
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Button title="Enviar correo de recuperación" onPress={handleSendEmail} />
      {!!message && (
        <Text style={{ color: isError ? 'red' : 'green', marginTop: 10 }}>{message}</Text>
      )}
      <Button title="Volver al inicio" onPress={() => router.replace('/')} />
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
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
});
