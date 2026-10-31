import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import type { AppConfig } from '../src/config/env';
import type { AiProvider } from '../src/providers/ai-provider.interface';

const config: AppConfig = {
  port: 3000,
  serviceName: 'saltchat',
  serviceSecret: 'test-secret',
  allowedOrigins: ['https://salt.example'],
  aiProvider: 'mock',
  openAiModel: 'gpt-4o-mini',
  nodeEnv: 'test',
};

const validBody = {
  message: 'How do I create a quote?',
  conversation_id: null,
  context: { page: '/dashboard' },
  user: { id: 'firebase-user-id', email: 'user@example.com', display_name: 'User Name', role: 'admin', department: 'Strategy', client_ids: [] },
};

function appWithProvider(provider?: AiProvider) {
  return createApp(config, provider);
}

describe('SaltChat API', () => {
  it('returns health without authentication', async () => {
    const response = await request(appWithProvider()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'saltchat' });
  });

  it('accepts a valid chat request', async () => {
    const response = await request(appWithProvider()).post('/api/chat').set('X-Service-Key', config.serviceSecret).send(validBody);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Mock response for: How do I create a quote?', conversation_id: null });
  });

  it('rejects invalid chat requests with the standard validation error', async () => {
    const response = await request(appWithProvider()).post('/api/chat').set('X-Service-Key', config.serviceSecret).send({ ...validBody, message: '   ', unexpected: true });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.request_id).toBeTruthy();
  });

  it.each([undefined, 'wrong-secret'])('rejects missing or invalid credentials', async (secret) => {
    const requestBuilder = request(appWithProvider()).post('/api/chat');
    if (secret) requestBuilder.set('X-Service-Key', secret);
    const response = await requestBuilder.send(validBody);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns a predictable response after the rate limit is exceeded', async () => {
    const app = appWithProvider();
    for (let i = 0; i < 30; i += 1) await request(app).post('/api/chat').set('X-Service-Key', config.serviceSecret).send(validBody);
    const response = await request(app).post('/api/chat').set('X-Service-Key', config.serviceSecret).send(validBody);
    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
  });

  it('maps provider failures to PROVIDER_ERROR', async () => {
    const provider: AiProvider = { generateResponse: async () => { throw new Error('provider down'); } };
    const response = await request(appWithProvider(provider)).post('/api/chat').set('X-Service-Key', config.serviceSecret).send(validBody);
    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('PROVIDER_ERROR');
  });
});
