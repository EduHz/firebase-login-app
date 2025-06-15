import { Stack, router } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';


import { db } from '../../firebase'; // ajustá si tu path es distinto
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const categoriasDisponibles = ['cafeterias', 'montanas', 'cervecerias'];

export default function Lugares() {
  const colorScheme = useColorScheme() ?? 'light';
  const [categoria, setCategoria] = useState('cafeterias');
  const [lugares, setLugares] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    cargarLugares(categoria);
  }, [categoria]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => router.push(`/lugar/${item.id}`)}>
      <View style={styles.item}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.direccion}>{item.direccion}</Text>
      </View>
    </TouchableOpacity>
  );

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
});
