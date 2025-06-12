import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function HomeScreen() {
  const auth = getAuth();
  const router = useRouter();
  const user = auth.currentUser;

  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        router.replace('/');
      }
    };
    cargarDatos();
  }, [user, router]);

  const handleLogout = () => {
    auth.signOut();
    router.replace('/');
  };

  const cambiarFotoPerfil = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled || !user) return;

    setLoading(true);
    try {
      const manip = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7 }
      );
      const response = await fetch(manip.uri);
      const blob = await response.blob();

      const fotoRef = ref(storage, `fotos_perfil/${user.uid}`);
      await deleteObject(fotoRef).catch(() => {});
      await uploadBytes(fotoRef, blob);
      const nuevaURL = await getDownloadURL(fotoRef);
      await updateDoc(doc(db, 'usuarios', user.uid), { fotoURL: nuevaURL });
      setUserData((prev: any) => ({ ...prev, fotoURL: nuevaURL }));
      setMessage('Foto de perfil actualizada con éxito.');
      setIsError(false);
    } catch (error) {
      setMessage('No se pudo actualizar la foto.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userData) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Inicio' }} />
      <Text style={styles.title}>Bienvenido, {userData.username} 👋</Text>
      <Text>Correo: {user.email}</Text>
      <Text>Edad: {userData.edad} años</Text>
      {userData.fotoURL && (
        <Image source={{ uri: userData.fotoURL }} style={styles.avatar} />
      )}
      <Button title="Cambiar foto" onPress={cambiarFotoPerfil} />
      {loading && <Text style={styles.message}>Cambiando foto...</Text>}
      {!!message && (
        <Text style={[styles.message, { color: isError ? 'red' : 'green' }]}>{message}</Text>
      )}
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 10,
  },
  message: {
    marginTop: 10,
  },
});
