import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageService } from '../services/storageService';
import { AppSettings, AVAILABLE_MODELS, DEFAULT_SETTINGS, CoachingModel } from '../types';

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsScreen({ settings, onSettingsChange }: Props) {
  const insets = useSafeAreaInsets();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(settings.apiKey);
  }, [settings.apiKey]);

  const handleSaveApiKey = useCallback(async () => {
    await storageService.saveApiKey(apiKey.trim());
    const updated: AppSettings = { ...settings, apiKey: apiKey.trim() };
    onSettingsChange(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [apiKey, settings, onSettingsChange]);

  const handleToggle = useCallback(
    async (key: keyof AppSettings, value: boolean) => {
      const updated: AppSettings = { ...settings, [key]: value };
      onSettingsChange(updated);
      const { apiKey: _k, ...rest } = updated;
      await storageService.saveSettings(rest);
    },
    [settings, onSettingsChange],
  );

  const handleModelSelect = useCallback(
    async (model: CoachingModel) => {
      const updated: AppSettings = { ...settings, model };
      onSettingsChange(updated);
      const { apiKey: _k, ...rest } = updated;
      await storageService.saveSettings(rest);
    },
    [settings, onSettingsChange],
  );

  const handleReset = useCallback(() => {
    Alert.alert(
      'Zurücksetzen',
      'Alle Einstellungen auf Standard zurücksetzen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            await storageService.saveApiKey('');
            const defaults: AppSettings = { ...DEFAULT_SETTINGS, apiKey: '' };
            onSettingsChange(defaults);
            setApiKey('');
            await storageService.saveSettings(DEFAULT_SETTINGS);
          },
        },
      ],
    );
  }, [onSettingsChange]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      <Text style={styles.sectionHeader}>API-KONFIGURATION</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Anthropic API-Key</Text>
        <Text style={styles.hint}>Erhältlich auf console.anthropic.com</Text>
        <View style={styles.keyRow}>
          <TextInput
            style={styles.keyInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-ant-..."
            placeholderTextColor="#444"
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowKey(!showKey)}
          >
            <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonSuccess]}
          onPress={handleSaveApiKey}
        >
          <Text style={styles.saveButtonText}>
            {saved ? '✓ Gespeichert' : 'Speichern'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>MODELL</Text>
      <View style={styles.card}>
        {AVAILABLE_MODELS.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={styles.modelOption}
            onPress={() => handleModelSelect(m.value)}
          >
            <View style={styles.modelDot}>
              {settings.model === m.value && <View style={styles.modelDotInner} />}
            </View>
            <Text
              style={[
                styles.modelLabel,
                settings.model === m.value && styles.modelLabelActive,
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionHeader}>VERHALTEN</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Spracheingabe</Text>
            <Text style={styles.toggleHint}>Mikrofon-Aufnahme aktivieren</Text>
          </View>
          <Switch
            value={settings.voiceEnabled}
            onValueChange={(v) => handleToggle('voiceEnabled', v)}
            trackColor={{ false: '#1a1a2e', true: '#1a5a9f' }}
            thumbColor={settings.voiceEnabled ? '#4a9eff' : '#333'}
          />
        </View>
        <View style={[styles.toggleRow, { marginTop: 16 }]}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Verlauf speichern</Text>
            <Text style={styles.toggleHint}>Gespräche lokal auf Gerät</Text>
          </View>
          <Switch
            value={settings.saveHistory}
            onValueChange={(v) => handleToggle('saveHistory', v)}
            trackColor={{ false: '#1a1a2e', true: '#1a5a9f' }}
            thumbColor={settings.saveHistory ? '#4a9eff' : '#333'}
          />
        </View>
      </View>

      <Text style={styles.sectionHeader}>ÜBER DIE APP</Text>
      <View style={styles.card}>
        <Text style={styles.aboutText}>Jarvis Coach v1.0.0</Text>
        <Text style={styles.aboutText}>Powered by Anthropic Claude</Text>
        <Text style={styles.aboutHint}>
          Emotionale Einschätzungen sind Hypothesen, keine Diagnosen. Die App ersetzt keine
          Therapie oder professionelle Beratung.
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Einstellungen zurücksetzen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    color: '#444',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#111122',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    color: '#c8c8d8',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    color: '#555',
    fontSize: 12,
    marginBottom: 12,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyInput: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e8e8f0',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#1a3a6e',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonSuccess: {
    backgroundColor: '#1a5a3a',
  },
  saveButtonText: {
    color: '#4a9eff',
    fontWeight: '600',
    fontSize: 15,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3e',
    gap: 12,
  },
  modelDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#2a2a5e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4a9eff',
  },
  modelLabel: {
    color: '#666',
    fontSize: 14,
  },
  modelLabelActive: {
    color: '#c8c8d8',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    color: '#c8c8d8',
    fontSize: 15,
  },
  toggleHint: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
  aboutText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  aboutHint: {
    color: '#444',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  resetButton: {
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    color: '#c0392b',
    fontSize: 13,
  },
});
