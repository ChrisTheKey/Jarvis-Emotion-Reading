import React, { useState, useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { VoiceMetadata } from '../types';

interface Props {
  onTranscriptReady: (text: string, metadata: VoiceMetadata) => void;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscriptReady, onRecordingStart, onRecordingEnd, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const startTimeRef = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording) return;
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Berechtigung erforderlich', 'Mikrofon-Zugriff wird für Spracheingabe benötigt.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      startPulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRecordingStart?.();
    } catch {
      Alert.alert('Fehler', 'Aufnahme konnte nicht gestartet werden.');
    }
  }, [disabled, isRecording, startPulse, onRecordingStart]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !recordingRef.current) return;

    setIsRecording(false);
    stopPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRecordingEnd?.();

    const duration = (Date.now() - startTimeRef.current) / 1000;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const status = await recordingRef.current.getStatusAsync();

      const voiceMetadata: VoiceMetadata = {
        duration,
        speechRate: duration < 3 ? 'fast' : duration > 15 ? 'slow' : 'normal',
        recordingQuality: 'good',
      };

      if (status.isDoneRecording) {
        // In production: send audio to transcription API (Whisper etc.)
        // For now: show input dialog with metadata attached
        Alert.prompt(
          'Spracheingabe',
          `Aufnahme: ${duration.toFixed(1)}s\nBitte tippe deine Nachricht ein (Transkription-API nicht konfiguriert):`,
          [
            { text: 'Abbrechen', style: 'cancel' },
            {
              text: 'Senden',
              onPress: (text?: string) => {
                if (text && text.trim()) {
                  onTranscriptReady(text.trim(), voiceMetadata);
                }
              },
            },
          ],
          'plain-text',
        );
      }
    } catch {
      Alert.alert('Fehler', 'Aufnahme konnte nicht verarbeitet werden.');
    } finally {
      recordingRef.current = null;
    }
  }, [isRecording, stopPulse, onRecordingEnd, onTranscriptReady]);

  return (
    <TouchableOpacity
      onPressIn={startRecording}
      onPressOut={stopRecording}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          isRecording && styles.buttonActive,
          disabled && styles.buttonDisabled,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Text style={styles.icon}>{isRecording ? '⏹' : '🎙'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#c0392b',
    borderColor: '#e74c3c',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 20,
  },
});
