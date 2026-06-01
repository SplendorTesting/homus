import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import EditAppointmentScreen from '../screens/EditAppointmentScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientProfileScreen from '../screens/ClientProfileScreen';
import AddClientScreen from '../screens/AddClientScreen';
import EditClientScreen from '../screens/EditClientScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const CalendarStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();

function CalendarNavigator() {
  return (
    <CalendarStack.Navigator screenOptions={{ headerShown: false }}>
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
      <CalendarStack.Screen name="AddAppointment" component={AddAppointmentScreen} options={{ presentation: 'modal' }} />
      <CalendarStack.Screen name="EditAppointment" component={EditAppointmentScreen} />
    </CalendarStack.Navigator>
  );
}

function ClientsNavigator() {
  return (
    <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientsStack.Screen name="ClientsList" component={ClientsScreen} />
      <ClientsStack.Screen name="ClientProfile" component={ClientProfileScreen} />
      <ClientsStack.Screen name="AddClient" component={AddClientScreen} options={{ presentation: 'modal' }} />
      <ClientsStack.Screen name="EditClient" component={EditClientScreen} />
    </ClientsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Clients') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Главная' }} />
      <Tab.Screen name="Calendar" component={CalendarNavigator} options={{ tabBarLabel: 'Календарь' }} />
      <Tab.Screen name="Clients" component={ClientsNavigator} options={{ tabBarLabel: 'Клиенты' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Ещё' }} />
    </Tab.Navigator>
  );
}
