import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageService } from '../services/storageService';
import { Conversation } from '../types';

interface Props {
  onOpenConversation: (conversation: Conversation) => void;
}

export function HistoryScreen({ onOpenConversation }: Props) {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    const all = await storageService.getAllConversations();
    setConversations(all.sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  useFocusEffect(useCallback(() => {
    loadConversations();
  }, [loadConversations]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert(
      'Gespräch löschen',
      `"${title}" endgültig löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteConversation(id);
            loadConversations();
          },
        },
      ]
    );
  }, [loadConversations]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Alle Gespräche löschen',
      'Gesamten Verlauf unwiderruflich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alle löschen',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAllConversations();
            setConversations([]);
          },
        },
      ]
    );
  }, []);

  if (conversations.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>{'◯'}</Text>
        <Text style={styles.emptyTitle}>Keine Gespräche</Text>
        <Text style={styles.emptyText}>Gespräche werden hier gespeichert, sobald du den Verlauf aktiviert hast.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4a9eff" />}
        ListHeaderComponent={
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>Alle löschen</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onOpenConversation(item)}
            onLongPress={() => handleDelete(item.id, item.title)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardCount}>{item.messages.length} Nachrichten</Text>
            </View>
            <Text style={styles.cardDate}>
              {new Date(item.updatedAt).toLocaleDateString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  empty: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: { color: '#2a2a4e', fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#555', fontSize: 18, marginBottom: 8 },
  emptyText: { color: '#333', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  list: { padding: 12 },
  clearButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  clearButtonText: { color: '#c0392b', fontSize: 13 },
  card: {
    backgroundColor: '#111122',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 2,
    borderLeftColor: '#2a2a5e',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: '#c8c8d8', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  cardCount: { color: '#444', fontSize: 12 },
  cardDate: { color: '#444', fontSize: 12 },
  separator: { height: 8 },
});
