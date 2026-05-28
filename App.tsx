import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { storageService } from './src/services/storageService';
import { AppSettings, Conversation, DEFAULT_SETTINGS } from './src/types';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storageService.getSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const handleOpenConversation = useCallback((_conversation: Conversation) => {
    // Navigation to chat with loaded conversation would go here
    // For simplicity: navigate to Chat tab
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#4a9eff" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0a0a0f" />
      <AppNavigator
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onOpenConversation={handleOpenConversation}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
