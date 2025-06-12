import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { app, db, storage } from '../firebase';

const auth = getAuth(app);

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [edad, setEdad] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const manip = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7 }
      );
      setPhotoUri(manip.uri);
    }
  };

  const handleAuth = async () => {
    setMessage('');
    try {
      if (isRegistering) {
        if (!photoUri) {
          setIsError(true);
          setMessage('Seleccioná una foto de perfil.');
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `fotos_perfil/${userCred.user.uid}`);
        await uploadBytes(storageRef, blob);
        const fotoURL = await getDownloadURL(storageRef);
        await setDoc(doc(db, 'usuarios', userCred.user.uid), {
          email,
          username,
          edad: parseInt(edad),
          fotoURL,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/home');
    } catch (err: any) {
      setIsError(true);
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isRegistering ? 'Registrarse' : 'Ingresar' }} />
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {isRegistering && (
        <>
          <TextInput
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            placeholder="Edad"
            keyboardType="number-pad"
            value={edad}
            onChangeText={setEdad}
            style={styles.input}
          />
          <Button title="Seleccionar foto" onPress={pickImage} />
          {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
        </>
      )}
      <Button title={isRegistering ? 'Crear cuenta' : 'Ingresar'} onPress={handleAuth} />
      <TouchableOpacity
        onPress={() => {
          setIsRegistering(!isRegistering);
          setMessage('');
          setPhotoUri(null);
        }}
        style={styles.switch}
      >
        <Text>{isRegistering ? 'Inicia sesión' : 'Regístrate'}</Text>
      </TouchableOpacity>
      {!isRegistering && (
        <TouchableOpacity onPress={() => router.push('/forgot')}>
          <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      )}
      {!!message && <Text style={{ color: isError ? 'red' : 'green', marginTop: 10 }}>{message}</Text>}
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
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
    alignSelf: 'center',
  },
  switch: {
    marginTop: 10,
    alignItems: 'center',
  },
  link: {
    marginTop: 10,
    color: 'blue',
    textAlign: 'center',
  },
});
