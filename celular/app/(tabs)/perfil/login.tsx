import { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, db, storage } from '../../../firebase';

export default function LoginScreen() {
  const auth = getAuth(app);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [edad, setEdad] = useState('');
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (!res.canceled) {
      setFoto(res.assets[0]);
    }
  };

  const handleAuth = async () => {
    setMessage('');
    setIsError(false);
    setLoading(true);
    try {
      if (isRegistering) {
        if (!foto) {
          setIsError(true);
          setMessage('Seleccioná una foto de perfil');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const storageRef = ref(storage, `fotos_perfil/${userCred.user.uid}`);
        const img = await fetch(foto.uri);
        const blob = await img.blob();
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
      router.replace('/perfil');
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isRegistering ? 'Registrarse' : 'Iniciar sesión' }} />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {isRegistering && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Edad"
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text>{foto ? 'Cambiar foto' : 'Seleccionar foto'}</Text>
          </TouchableOpacity>
          {foto && <Image source={{ uri: foto.uri }} style={styles.preview} />}
        </>
      )}
      {message ? (
        <Text style={{ color: isError ? 'red' : 'green', marginBottom: 10 }}>{message}</Text>
      ) : null}
      {loading ? (
        <ActivityIndicator style={{ marginBottom: 10 }} />
      ) : null}
      <Button title={isRegistering ? 'Crear cuenta' : 'Ingresar'} onPress={handleAuth} />
      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={{ marginTop: 10 }}>
        <Text>{isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}</Text>
      </TouchableOpacity>
      {!isRegistering && (
        <TouchableOpacity onPress={() => router.push('/forgot')} style={{ marginTop: 10 }}>
          <Text style={{ color: 'blue' }}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      )}
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
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  imagePicker: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
});
