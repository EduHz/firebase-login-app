import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useNavigation, useLayoutEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export default function HomeScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Perfil' });
  }, [navigation]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    };
    cargarDatos();
  }, [user]);

  const pickAndUpload = async () => {
    if (!user) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (res.canceled) return;
    setLoading(true);
    try {
      const fotoRef = ref(storage, `fotos_perfil/${user.uid}`);
      await deleteObject(fotoRef).catch(() => {});
      const img = await fetch(res.assets[0].uri);
      const blob = await img.blob();
      await uploadBytes(fotoRef, blob);
      const newURL = await getDownloadURL(fotoRef);
      await updateDoc(doc(db, 'usuarios', user.uid), { fotoURL: newURL });
      setUserData((prev: any) => ({ ...prev, fotoURL: newURL }));
      setMessage('Foto actualizada');
      setIsError(false);
    } catch (e) {
      setIsError(true);
      setMessage('No se pudo actualizar la foto');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    navigation.replace('Login');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Button title="Registrarse" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {userData.username}</Text>
      {userData.fotoURL && <Image source={{ uri: userData.fotoURL }} style={styles.preview} />}
      <Text>Correo: {user.email}</Text>
      <Text>Edad: {userData.edad} años</Text>
      <Button title="Cambiar foto" onPress={pickAndUpload} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {message ? <Text style={{ color: isError ? 'red' : 'green', marginTop: 10 }}>{message}</Text> : null}
      <Button title="Cerrar sesión" onPress={logout} />
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
  preview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
