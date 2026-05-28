import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatScreen } from '../screens/ChatScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AppSettings, Conversation } from '../types';

const Tab = createBottomTabNavigator();

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onOpenConversation?: (conversation: Conversation) => void;
}

export function AppNavigator({ settings, onSettingsChange, onOpenConversation }: Props) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0a0a0f',
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#4a9eff',
          headerTitleStyle: { fontWeight: '300', letterSpacing: 3, fontSize: 16 },
          tabBarStyle: {
            backgroundColor: '#0f0f1a',
            borderTopWidth: 1,
            borderTopColor: '#1a1a2e',
            height: 60,
            paddingBottom: 6,
          },
          tabBarActiveTintColor: '#4a9eff',
          tabBarInactiveTintColor: '#444',
          tabBarLabelStyle: { fontSize: 11, letterSpacing: 0.5 },
        }}
      >
        <Tab.Screen
          name="Chat"
          options={{
            headerTitle: 'JARVIS',
            tabBarLabel: 'Coach',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20, lineHeight: 24 }}>◎</Text>
            ),
          }}
        >
          {() => <ChatScreen settings={settings} />}
        </Tab.Screen>

        <Tab.Screen
          name="History"
          options={{
            headerTitle: 'VERLAUF',
            tabBarLabel: 'Verlauf',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20, lineHeight: 24 }}>☰</Text>
            ),
          }}
        >
          {() => (
            <HistoryScreen
              onOpenConversation={onOpenConversation ?? (() => undefined)}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Settings"
          options={{
            headerTitle: 'EINSTELLUNGEN',
            tabBarLabel: 'Einstellungen',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 20, lineHeight: 24 }}>⚙</Text>
            ),
          }}
        >
          {() => (
            <SettingsScreen
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
