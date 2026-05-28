import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageBubble } from '../components/MessageBubble';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useConversation } from '../hooks/useConversation';
import { AppSettings, VoiceMetadata } from '../types';

interface Props {
  settings: AppSettings;
}

const WELCOME_MESSAGE = `Guten Tag. Ich bin Jarvis, dein persönlicher Coach.

Was beschäftigt dich gerade? Sei präzise – je konkreter du bist, desto direkter kann ich dir helfen.`;

export function ChatScreen({ settings }: Props) {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, error, sendMessage, clearConversation } = useConversation(settings);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage]);

  const handleVoiceTranscript = useCallback(async (text: string, metadata: VoiceMetadata) => {
    await sendMessage(text, metadata);
  }, [sendMessage]);

  const handleNewConversation = useCallback(() => {
    Alert.alert(
      'Neues Gespräch',
      'Aktuelles Gespräch beenden und neu starten?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Neu starten', style: 'destructive', onPress: clearConversation },
      ]
    );
  }, [clearConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const showApiKeyWarning = !settings.apiKey;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {showApiKeyWarning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            {'⚠'} Kein API-Key konfiguriert — Einstellungen öffnen
          </Text>
        </View>
      )}

      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>J A R V I S</Text>
          <Text style={styles.welcomeSubtitle}>Persönlicher Coach</Text>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>{WELCOME_MESSAGE}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: 8 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4a9eff" size="small" />
          <Text style={styles.loadingText}>Jarvis denkt…</Text>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        {settings.voiceEnabled && (
          <VoiceRecorder
            onTranscriptReady={handleVoiceTranscript}
            disabled={isLoading || showApiKeyWarning}
          />
        )}
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Schreib Jarvis…"
          placeholderTextColor="#555"
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          editable={!showApiKeyWarning}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newButton} onPress={handleNewConversation}>
          <Text style={styles.newIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  warningBanner: {
    backgroundColor: '#2c1a00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#5a3800',
  },
  warningText: {
    color: '#ffaa33',
    fontSize: 13,
    textAlign: 'center',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeTitle: {
    color: '#4a9eff',
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 8,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: '#444',
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#111122',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#4a9eff',
    width: '100%',
  },
  welcomeText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 22,
  },
  listContent: {
    paddingTop: 12,
  },
  errorBanner: {
    backgroundColor: '#2c0a0a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#5a1a1a',
  },
  errorText: {
    color: '#ff6666',
    fontSize: 13,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    color: '#4a9eff',
    fontSize: 13,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#0f0f1a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#e8e8f0',
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a5a9f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1a1a2e',
    opacity: 0.5,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newIcon: {
    color: '#888',
    fontSize: 22,
    fontWeight: '300',
  },
});
