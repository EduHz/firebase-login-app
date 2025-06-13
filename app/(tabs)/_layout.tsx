import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="lugares"
        options={{ title: 'Lugares', tabBarIcon: ({ color, size }) => <FontAwesome name="map" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="actividades"
        options={{ title: 'Actividades', tabBarIcon: ({ color, size }) => <FontAwesome name="list" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <FontAwesome name="user" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
