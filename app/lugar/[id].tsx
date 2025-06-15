import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { db } from '../../firebase';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LugarDetalle() {
  const colorScheme = useColorScheme() ?? 'light';
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lugar, setLugar] = useState<any | null>(null);
  const [isFav, setIsFav] = useState(false);

  const user = getAuth().currentUser;

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'lugares', id));
      if (snap.exists()) setLugar({ id: snap.id, ...snap.data() });
    };
    cargar();
  }, [id]);

  useEffect(() => {
    const checkFav = async () => {
      if (!user || !id) return;
      const favRef = doc(db, 'usuarios', user.uid, 'favoritos', id);
      const favSnap = await getDoc(favRef);
      setIsFav(favSnap.exists());
    };
    checkFav();
  }, [user, id]);

  const toggleFav = async () => {
    if (!user || !lugar) {
      Alert.alert('Iniciá sesión', 'Tenés que iniciar sesión para manejar favoritos.');
      return;
    }
    const favRef = doc(db, 'usuarios', user.uid, 'favoritos', lugar.id);
    if (isFav) {
      await deleteDoc(favRef);
      setIsFav(false);
      Alert.alert('Quitado de favoritos');
    } else {
      await setDoc(favRef, lugar);
      setIsFav(true);
      Alert.alert('Agregado a favoritos');
    }
  };

  if (!lugar) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}> 
        <Stack.Screen options={{ title: 'Detalle' }} />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const lat = parseFloat(lugar?.coordenadas?.lat ?? 0);
  const lng = parseFloat(lugar?.coordenadas?.lng ?? 0);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors[colorScheme].background }]}> 
      <Stack.Screen options={{ title: lugar.nombre }} />
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: '#f90', marginBottom: 10 }}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.nombre}>{lugar.nombre}</Text>
      <Text style={styles.descripcion}>{lugar.descripcion}</Text>
      <Text style={styles.direccion}>📍 {lugar.direccion}</Text>

      <TouchableOpacity onPress={toggleFav} style={styles.favoritoBtn}>
        <Text style={styles.favoritoTxt}>{isFav ? '💔 Quitar de favoritos' : '❤️ Agregar a favoritos'}</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Horarios:</Text>
      {lugar.horarios ? (
        Object.entries(lugar.horarios).map(([dia, horario]) => (
          <Text key={dia}>{`${dia}: ${horario}`}</Text>
        ))
      ) : (
        <Text>No disponibles</Text>
      )}

      {lat && lng ? (
        <MapView
          style={styles.mapa}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: lat, longitude: lng }} title={lugar.nombre} />
        </MapView>
      ) : (
        <Text style={{ marginTop: 20 }}>Ubicación no disponible</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  direccion: {
    fontSize: 12,
    color: '#999',
  },
  favoritoBtn: {
    backgroundColor: '#f90',
    padding: 10,
    borderRadius: 8,
    marginVertical: 12,
  },
  favoritoTxt: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitulo: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapa: {
    marginTop: 20,
    height: 200,
    borderRadius: 10,
  },
});
