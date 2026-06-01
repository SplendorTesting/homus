import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, fonts } from '../theme/colors';

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

const stackOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};

function CalendarNavigator() {
  return (
    <CalendarStack.Navigator screenOptions={stackOptions}>
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
      <CalendarStack.Screen name="AddAppointment" component={AddAppointmentScreen} options={{ animation: 'slide_from_bottom' }} />
      <CalendarStack.Screen name="EditAppointment" component={EditAppointmentScreen} />
    </CalendarStack.Navigator>
  );
}

function ClientsNavigator() {
  return (
    <ClientsStack.Navigator screenOptions={stackOptions}>
      <ClientsStack.Screen name="ClientsList" component={ClientsScreen} />
      <ClientsStack.Screen name="ClientProfile" component={ClientProfileScreen} />
      <ClientsStack.Screen name="AddClient" component={AddClientScreen} options={{ animation: 'slide_from_bottom' }} />
      <ClientsStack.Screen name="EditClient" component={EditClientScreen} />
    </ClientsStack.Navigator>
  );
}

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarOverlay} />
      <View style={styles.tabBarBorder} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: { paddingTop: 8 },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'sparkles' : 'sparkles-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Clients') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeDot} />}
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Обзор' }} />
      <Tab.Screen name="Calendar" component={CalendarNavigator} options={{ tabBarLabel: 'Календарь' }} />
      <Tab.Screen name="Clients" component={ClientsNavigator} options={{ tabBarLabel: 'Клиенты' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Ещё' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 86,
    paddingBottom: 26,
    paddingTop: 0,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12,12,14,0.82)',
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  tabLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: -10,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
