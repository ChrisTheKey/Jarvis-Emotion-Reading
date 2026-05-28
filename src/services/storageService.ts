import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Conversation, AppSettings, DEFAULT_SETTINGS } from '../types';

const CONVERSATIONS_KEY = 'jarvis_conversations';
const SETTINGS_KEY = 'jarvis_settings';
const API_KEY_SECURE_KEY = 'jarvis_api_key';

export const storageService = {
  async saveConversation(conversation: Conversation): Promise<void> {
    const existing = await this.getAllConversations();
    const idx = existing.findIndex(c => c.id === conversation.id);
    if (idx >= 0) {
      existing[idx] = conversation;
    } else {
      existing.unshift(conversation);
    }
    // Keep max 50 conversations
    const trimmed = existing.slice(0, 50);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed));
  },

  async getAllConversations(): Promise<Conversation[]> {
    const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Conversation[];
    } catch {
      return [];
    }
  },

  async deleteConversation(id: string): Promise<void> {
    const existing = await this.getAllConversations();
    const filtered = existing.filter(c => c.id !== id);
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered));
  },

  async clearAllConversations(): Promise<void> {
    await AsyncStorage.removeItem(CONVERSATIONS_KEY);
  },

  async saveApiKey(apiKey: string): Promise<void> {
    await SecureStore.setItemAsync(API_KEY_SECURE_KEY, apiKey);
  },

  async getApiKey(): Promise<string> {
    const key = await SecureStore.getItemAsync(API_KEY_SECURE_KEY);
    return key ?? '';
  },

  async saveSettings(settings: Omit<AppSettings, 'apiKey'>): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  async getSettings(): Promise<AppSettings> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const apiKey = await this.getApiKey();
    if (!raw) return { ...DEFAULT_SETTINGS, apiKey };
    try {
      const saved = JSON.parse(raw) as Partial<AppSettings>;
      return { ...DEFAULT_SETTINGS, ...saved, apiKey };
    } catch {
      return { ...DEFAULT_SETTINGS, apiKey };
    }
  },
};
