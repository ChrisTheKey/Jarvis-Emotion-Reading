import { JARVIS_SYSTEM_PROMPT, buildSystemPromptWithVoice } from '../../src/config/systemPrompt';
import { VoiceMetadata } from '../../src/types';

describe('JARVIS_SYSTEM_PROMPT', () => {
  it('contains core coaching instructions', () => {
    expect(JARVIS_SYSTEM_PROMPT).toContain('Coach');
    expect(JARVIS_SYSTEM_PROMPT).toContain('Spiegelung');
    expect(JARVIS_SYSTEM_PROMPT).toContain('Handlung');
  });

  it('does not contain absolute emotion statements', () => {
    expect(JARVIS_SYSTEM_PROMPT).not.toContain('Du bist wütend');
    expect(JARVIS_SYSTEM_PROMPT).not.toContain('Du bist traurig');
  });

  it('mandates uncertainty in emotional assessments', () => {
    expect(JARVIS_SYSTEM_PROMPT).toContain('Hypothes');
  });
});

describe('buildSystemPromptWithVoice', () => {
  it('returns base prompt when no metadata provided', () => {
    const prompt = buildSystemPromptWithVoice(undefined);
    expect(prompt).toBe(JARVIS_SYSTEM_PROMPT);
  });

  it('appends voice context when metadata is provided', () => {
    const meta: VoiceMetadata = {
      duration: 8.5,
      speechRate: 'fast',
      pauseCount: 3,
      recordingQuality: 'good',
    };
    const prompt = buildSystemPromptWithVoice(meta);
    expect(prompt).toContain('VOICE-METADATEN');
    expect(prompt).toContain('8.5s');
    expect(prompt).toContain('schnell');
    expect(prompt).toContain('3');
  });

  it('adds uncertainty instruction to voice-augmented prompt', () => {
    const meta: VoiceMetadata = { duration: 5 };
    const prompt = buildSystemPromptWithVoice(meta);
    expect(prompt).toContain('Hypothese');
  });

  it('notes poor recording quality', () => {
    const meta: VoiceMetadata = { duration: 3, recordingQuality: 'poor' };
    const prompt = buildSystemPromptWithVoice(meta);
    expect(prompt).toContain('eingeschränkt');
  });
});
