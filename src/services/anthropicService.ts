import { Message, VoiceMetadata } from '../types';
import { buildSystemPromptWithVoice } from '../config/systemPrompt';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface AnthropicConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
}

interface AnthropicResponseContent {
  type: string;
  text: string;
}

interface AnthropicResponse {
  content: AnthropicResponseContent[];
}

export async function sendMessageToJarvis(
  messages: Message[],
  config: AnthropicConfig,
  voiceMetadata?: VoiceMetadata,
): Promise<string> {
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new Error('API_KEY_MISSING');
  }

  const systemPrompt = buildSystemPromptWithVoice(voiceMetadata);

  const apiMessages = messages
    .filter(m => m.content.trim().length > 0)
    .map(m => ({
      role: m.role,
      content: m.content,
    }));

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens ?? 1024,
      system: systemPrompt,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) throw new Error('API_KEY_INVALID');
    if (response.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(`API_ERROR:${response.status}:${errorBody}`);
  }

  const data = await response.json() as AnthropicResponse;

  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text;
  }

  throw new Error('INVALID_RESPONSE');
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'API_KEY_MISSING':
        return 'Kein API-Key konfiguriert. Bitte in den Einstellungen eintragen.';
      case 'API_KEY_INVALID':
        return 'API-Key ungültig. Bitte in den Einstellungen prüfen.';
      case 'RATE_LIMITED':
        return 'Zu viele Anfragen. Bitte kurz warten.';
      default:
        if (error.message.startsWith('API_ERROR:')) {
          return `API-Fehler: ${error.message.split(':')[1]}`;
        }
        return 'Verbindungsfehler. Bitte Internetverbindung prüfen.';
    }
  }
  return 'Unbekannter Fehler.';
}
