import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import LugaresScreen from './screens/LugaresScreen';
import ActividadesScreen from './screens/ActividadesScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Perfil" component={ProfileScreen} />
      <ProfileStack.Screen name="Login" component={LoginScreen} />
      <ProfileStack.Screen name="Forgot" component={ForgotPasswordScreen} options={{ title: 'Recuperar contraseña' }} />
    </ProfileStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="Inicio"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Lugares"
          component={LugaresScreen}
          options={{ tabBarIcon: ({ color, size }) => <FontAwesome name="map" color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Actividades"
          component={ActividadesScreen}
          options={{ tabBarIcon: ({ color, size }) => <FontAwesome name="list" color={color} size={size} /> }}
        />
        <Tab.Screen
          name="PerfilTab"
          component={ProfileStackScreen}
          options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <FontAwesome name="user" color={color} size={size} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
