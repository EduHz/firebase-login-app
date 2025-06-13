import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, db, storage } from '../../firebase';

export default function HomeScreen() {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState<any>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [edad, setEdad] = useState('');
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'usuarios', u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } else {
        setUserData(null);
      }
    });
    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
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
          return;
        }

        // 1. Creás el usuario
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        // 2. Subís la foto
        const storageRef = ref(storage, `fotos_perfil/${uid}`);
        const img = await fetch(foto.uri);
        const blob = await img.blob();
        await uploadBytes(storageRef, blob);
        const fotoURL = await getDownloadURL(storageRef);

        // 3. Guardás el doc
        await setDoc(doc(db, 'usuarios', uid), {
          email,
          username,
          edad: parseInt(edad, 10),
          fotoURL,
        });

        // 4. Te logueás de nuevo (por si no lo hizo automáticamente)
        await signInWithEmailAndPassword(auth, email, password);

        // 5. Cargas manualmente la data al state
        const snap = await getDoc(doc(db, 'usuarios', uid));
        if (snap.exists()) {
          setUserData(snap.data());
          setUser(userCred.user);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickAndUpload = async () => {
    if (!user) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5 });
    if (res.canceled) return;
    setLoading(true);
    try {
      const fotoRef = ref(storage, `fotos_perfil/${user.uid}`);
      await deleteObject(fotoRef).catch(() => { });
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
  };

  if (!user) {
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
        {loading ? <ActivityIndicator style={{ marginBottom: 10 }} /> : null}
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

  if (!userData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Inicio' }} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  imagePicker: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
