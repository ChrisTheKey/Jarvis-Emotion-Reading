import { getApiErrorMessage } from '../../src/services/anthropicService';

describe('getApiErrorMessage', () => {
  it('returns German message for missing API key', () => {
    const err = new Error('API_KEY_MISSING');
    expect(getApiErrorMessage(err)).toContain('API-Key');
  });

  it('returns German message for invalid API key', () => {
    const err = new Error('API_KEY_INVALID');
    expect(getApiErrorMessage(err)).toContain('ungültig');
  });

  it('returns German message for rate limiting', () => {
    const err = new Error('RATE_LIMITED');
    expect(getApiErrorMessage(err)).toContain('warten');
  });

  it('returns API error code for generic API errors', () => {
    const err = new Error('API_ERROR:503:Service Unavailable');
    expect(getApiErrorMessage(err)).toContain('503');
  });

  it('returns fallback for unknown error', () => {
    const err = new Error('SOME_UNKNOWN');
    const msg = getApiErrorMessage(err);
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('handles non-Error objects', () => {
    const msg = getApiErrorMessage('string error');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });
});
