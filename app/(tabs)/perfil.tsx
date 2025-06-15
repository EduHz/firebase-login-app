// app/(tabs)/perfil/index.tsx

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, db, storage } from '../../firebase';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const ACCENT = '#F8B551';

export default function HomeScreen() {
  const auth = getAuth(app);
  const [user, setUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState<any>(null);
  const colorScheme = useColorScheme() ?? 'light';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [edad, setEdad] = useState('');
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [viewFavs, setViewFavs] = useState(false);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'usuarios', u.uid));
        if (snap.exists()) setUserData(snap.data());
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
    if (!res.canceled) setFoto(res.assets[0]);
  };

  const handleAuth = async () => {
    setMessage('');
    setIsError(false);
    setLoading(true);
    try {
      if (isRegistering) {
        if (!foto) throw new Error('Seleccioná una foto de perfil');

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        // Subir foto
        const storageRef = ref(storage, `fotos_perfil/${uid}`);
        const img = await fetch(foto.uri);
        const blob = await img.blob();
        await uploadBytes(storageRef, blob);
        const fotoURL = await getDownloadURL(storageRef);

        // Guardar datos
        await setDoc(doc(db, 'usuarios', uid), {
          email,
          username,
          edad: parseInt(edad, 10),
          fotoURL,
        });

        // Loguear
        await signInWithEmailAndPassword(auth, email, password);
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
    setLoading(true);
    try {
      const fotoRef = ref(storage, `fotos_perfil/${user.uid}`);
      await deleteObject(fotoRef).catch(() => {});
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });
      if (res.canceled) throw new Error();
      const img = await fetch(res.assets[0].uri);
      const blob = await img.blob();
      await uploadBytes(fotoRef, blob);
      const newURL = await getDownloadURL(fotoRef);
      await updateDoc(doc(db, 'usuarios', user.uid), { fotoURL: newURL });
      setUserData((prev: any) => ({ ...prev, fotoURL: newURL }));
      setMessage('Foto actualizada');
      setIsError(false);
    } catch {
      setIsError(true);
      setMessage('No se pudo actualizar la foto');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
  };

  const cargarFavoritos = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, 'usuarios', user.uid, 'favoritos'));
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setFavoritos(docs);
  };

  useEffect(() => {
    if (viewFavs) {
      cargarFavoritos();
    }
  }, [viewFavs, user]);

  // ---------- LOGIN / REGISTRO ----------
  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.loginTitle}>Bienvenido Viajero</Text>

        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Eva"
          placeholderTextColor="rgba(255,255,255,0.7)"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="rgba(255,255,255,0.7)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {isRegistering && (
          <>
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="gandalf123"
              placeholderTextColor="rgba(255,255,255,0.7)"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Edad</Text>
            <TextInput
              style={styles.input}
              placeholder="28"
              placeholderTextColor="rgba(255,255,255,0.7)"
              keyboardType="numeric"
              value={edad}
              onChangeText={(text) => setEdad(text.replace(/[^0-9]/g, ''))}
            />

            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
              <Text style={styles.pickButtonText}>
                {foto ? 'Cambiar foto' : 'Seleccionar foto'}
              </Text>
            </TouchableOpacity>

            {foto && <Image source={{ uri: foto.uri }} style={styles.previewSmall} />}
          </>
        )}

        {message ? (
          <Text style={[styles.message, isError && styles.error]}>{message}</Text>
        ) : null}

        {loading && <ActivityIndicator color="#fff" style={{ marginVertical: 10 }} />}

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>
            {isRegistering ? 'CREAR CUENTA' : 'INGRESAR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.toggleText}>
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- CARGANDO DATOS PERFIL ----------
  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  // ---------- PERFIL (USUARIO LOGUEADO) ----------
  if (viewFavs) {
    return (
      <View style={styles.profileContainer}>
        <Stack.Screen options={{ headerShown: false }} />

        <TouchableOpacity onPress={() => setViewFavs(false)} style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
          <Text style={{ color: '#fff' }}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.profileTitle}>Mis favoritos</Text>

        {favoritos.length === 0 ? (
          <Text style={styles.profileText}>No tienes favoritos</Text>
        ) : (
          <FlatList
            data={favoritos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/lugar/${item.id}`)}>
                <Text style={styles.profileText}>{item.nombre}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.profileContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.card}>
        <Text style={styles.profileTitle}>Bienvenido, {userData.username}</Text>

        {userData.fotoURL && (
          <Image
            source={{ uri: userData.fotoURL }}
            style={styles.profileImage}
          />
        )}

        <Text style={styles.profileText}>Correo: {user.email}</Text>
        <Text style={styles.profileText}>Edad: {userData.edad} años</Text>

        <TouchableOpacity style={styles.profileButton} onPress={() => setViewFavs(true)}>
          <Text style={styles.profileButtonText}>VER FAVORITOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={pickAndUpload}>
          <Text style={styles.profileButtonText}>CAMBIAR FOTO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton} onPress={logout}>
          <Text style={styles.profileButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ——— LOGIN / REGISTRO ———
  loginContainer: {
    flex: 1,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginTitle: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 32,
    fontWeight: '600',
  },
  label: {
    alignSelf: 'flex-start',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    paddingHorizontal: 12,
    color: '#fff',
    marginBottom: 20,
  },
  pickButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  previewSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  message: {
    color: '#fff',
    marginBottom: 10,
  },
  error: {
    color: '#FF6B6B',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleText: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 12,
  },

  // ——— LOADING ———
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ——— PERFIL ———
  profileContainer: {
    flex: 1,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: ACCENT,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: ACCENT,
    marginBottom: 16,
  },
  profileText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  profileButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: ACCENT,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
