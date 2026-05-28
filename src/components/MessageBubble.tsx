import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';

interface Props {
  message: Message;
}

interface CoachingSection {
  label: string;
  content: string;
  color: string;
}

function parseCoachingResponse(text: string): CoachingSection[] | null {
  const sections = [
    { key: '**Spiegelung:**', label: 'Spiegelung', color: '#4a9eff' },
    { key: '**Muster:**', label: 'Muster', color: '#e67e22' },
    { key: '**Realität:**', label: 'Realität', color: '#2ecc71' },
    { key: '**Frage:**', label: 'Frage', color: '#9b59b6' },
    { key: '**Handlung:**', label: 'Handlung', color: '#e74c3c' },
  ];

  const found: CoachingSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const { key, label, color } = sections[i];
    const startIdx = text.indexOf(key);
    if (startIdx === -1) continue;

    const contentStart = startIdx + key.length;
    const nextSectionIdx = sections
      .slice(i + 1)
      .map(s => text.indexOf(s.key))
      .filter(idx => idx > startIdx)
      .sort((a, b) => a - b)[0] ?? text.length;

    const content = text.slice(contentStart, nextSectionIdx).trim();
    if (content) {
      found.push({ label, content, color });
    }
  }

  return found.length >= 3 ? found : null;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (!isUser) {
    const sections = parseCoachingResponse(message.content);

    if (sections) {
      return (
        <View style={styles.assistantContainer}>
          {sections.map((section) => (
            <View key={section.label} style={[styles.sectionCard, { borderLeftColor: section.color }]}>
              <Text style={[styles.sectionLabel, { color: section.color }]}>
                {section.label}
              </Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.assistantContainer}>
        <View style={styles.assistantBubble}>
          <Text style={styles.assistantText}>{message.content}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.userContainer}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.content}</Text>
        {message.hasAudio && (
          <Text style={styles.audioIndicator}>
            {'🎤'} {message.audioDuration ? `${message.audioDuration.toFixed(1)}s` : ''}
          </Text>
        )}
      </View>
      <Text style={[styles.timestamp, styles.userTimestamp]}>
        {new Date(message.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    alignItems: 'flex-end',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userBubble: {
    backgroundColor: '#1a3a5c',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userText: {
    color: '#e8f4ff',
    fontSize: 15,
    lineHeight: 22,
  },
  audioIndicator: {
    color: '#7ab3e0',
    fontSize: 11,
    marginTop: 4,
  },
  assistantContainer: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  assistantBubble: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '90%',
    borderLeftWidth: 2,
    borderLeftColor: '#4a9eff',
  },
  assistantText: {
    color: '#d0d0d0',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#111122',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4a9eff',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionContent: {
    color: '#c8c8d8',
    fontSize: 14,
    lineHeight: 21,
  },
  timestamp: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
    marginLeft: 4,
  },
  userTimestamp: {
    marginLeft: 0,
    marginRight: 4,
  },
});
