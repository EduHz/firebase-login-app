import { Stack } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MapView, { Marker } from 'react-native-maps';

import { db } from '../../firebase'; // ajustá si tu path es distinto
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const categoriasDisponibles = ['cafeterias', 'montanas', 'cervecerias'];

export default function Lugares() {
  const colorScheme = useColorScheme() ?? 'light';
  const [categoria, setCategoria] = useState('cafeterias');
  const [lugares, setLugares] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);

  const cargarLugares = async (cat: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'lugares'), where('categoria', '==', cat));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLugares(docs);
    } catch (error) {
      console.error('Error al cargar lugares:', error);
    }
    setLoading(false);
  };

  const agregarAFavoritos = async (lugar: any) => {
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('Iniciá sesión', 'Tenés que iniciar sesión para guardar favoritos.');
      return;
    }

    try {
      const ref = doc(db, 'usuarios', user.uid, 'favoritos', lugar.id);
      await setDoc(ref, lugar);
      Alert.alert('❤️ Favorito guardado', `${lugar.nombre} fue agregado a tus favoritos.`);
    } catch (error) {
      console.error('❌ Error al guardar favorito:', error);
    }
  };

  useEffect(() => {
    if (!seleccionado) {
      cargarLugares(categoria);
    }
  }, [categoria, seleccionado]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => setSeleccionado(item)}>
      <View style={styles.item}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.direccion}>{item.direccion}</Text>
      </View>
    </TouchableOpacity>
  );

  // Vista de detalle
  if (seleccionado) {
    const lat = parseFloat(seleccionado?.coordenadas?.lat ?? 0);
    const lng = parseFloat(seleccionado?.coordenadas?.lng ?? 0);

    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <Stack.Screen options={{ title: seleccionado.nombre }} />

        <TouchableOpacity onPress={() => setSeleccionado(null)}>
          <Text style={{ color: '#f90', marginBottom: 10 }}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.nombre}>{seleccionado.nombre}</Text>
        <Text style={styles.descripcion}>{seleccionado.descripcion}</Text>
        <Text style={styles.direccion}>📍 {seleccionado.direccion}</Text>

        <TouchableOpacity
          onPress={() => agregarAFavoritos(seleccionado)}
          style={styles.favoritoBtn}
        >
          <Text style={styles.favoritoTxt}>❤️ Agregar a favoritos</Text>
        </TouchableOpacity>

        <Text style={styles.subtitulo}>Horarios:</Text>
        {seleccionado.horarios ? (
          Object.entries(seleccionado.horarios).map(([dia, horario]) => (
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
            <Marker coordinate={{ latitude: lat, longitude: lng }} title={seleccionado.nombre} />
          </MapView>
        ) : (
          <Text style={{ marginTop: 20 }}>Ubicación no disponible</Text>
        )}
      </ScrollView>
    );
  }

  // Vista de lista
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Stack.Screen options={{ title: 'Lugares' }} />

      <View style={styles.categorias}>
        {categoriasDisponibles.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.botonCategoria, categoria === cat && styles.botonActivo]}
            onPress={() => setCategoria(cat)}
          >
            <Text style={styles.textoBoton}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f90" />
      ) : (
        <FlatList
          data={lugares}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categorias: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  botonCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  botonActivo: {
    backgroundColor: '#f90',
  },
  textoBoton: {
    fontWeight: '600',
    color: '#333',
  },
  lista: {
    paddingBottom: 20,
  },
  item: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
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
