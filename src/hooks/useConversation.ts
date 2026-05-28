import { useState, useCallback, useRef } from 'react';
import { Message, Conversation, AppSettings, VoiceMetadata } from '../types';
import { sendMessageToJarvis, getApiErrorMessage } from '../services/anthropicService';
import { storageService } from '../services/storageService';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function generateTitle(firstMessage: string): string {
  return firstMessage.length > 40
    ? firstMessage.slice(0, 40) + '…'
    : firstMessage;
}

export function useConversation(settings: AppSettings) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string>(generateId());

  const sendMessage = useCallback(async (
    content: string,
    voiceMetadata?: VoiceMetadata,
  ) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      hasAudio: !!voiceMetadata,
      audioDuration: voiceMetadata?.duration,
      voiceMetadata,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToJarvis(
        updatedMessages,
        {
          apiKey: settings.apiKey,
          model: settings.model,
          maxTokens: 1024,
        },
        voiceMetadata,
      );

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      if (settings.saveHistory) {
        const conversation: Conversation = {
          id: conversationIdRef.current,
          title: generateTitle(content),
          messages: finalMessages,
          createdAt: messages.length === 0 ? Date.now() : finalMessages[0].timestamp,
          updatedAt: Date.now(),
        };
        await storageService.saveConversation(conversation);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, settings]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    conversationIdRef.current = generateId();
  }, []);

  const loadConversation = useCallback((conversation: Conversation) => {
    setMessages(conversation.messages);
    conversationIdRef.current = conversation.id;
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    loadConversation,
  };
}
