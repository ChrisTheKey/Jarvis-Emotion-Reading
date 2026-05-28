export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  hasAudio?: boolean;
  audioDuration?: number;
  voiceMetadata?: VoiceMetadata;
}

export interface VoiceMetadata {
  duration: number;
  averageAmplitude?: number;
  peakAmplitude?: number;
  pauseCount?: number;
  speechRate?: 'slow' | 'normal' | 'fast' | 'unknown';
  recordingQuality?: 'good' | 'fair' | 'poor';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  coachingStyle: 'balanced' | 'direct' | 'gentle';
  voiceEnabled: boolean;
  saveHistory: boolean;
  language: 'de' | 'en';
}

export type CoachingModel =
  | 'claude-opus-4-8'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001';

export const AVAILABLE_MODELS: { label: string; value: CoachingModel }[] = [
  { label: 'Claude Opus 4 (Tiefste Analyse)', value: 'claude-opus-4-8' },
  { label: 'Claude Sonnet 4 (Ausgewogen)', value: 'claude-sonnet-4-6' },
  { label: 'Claude Haiku 4 (Schnell)', value: 'claude-haiku-4-5-20251001' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'claude-sonnet-4-6',
  coachingStyle: 'balanced',
  voiceEnabled: true,
  saveHistory: true,
  language: 'de',
};
