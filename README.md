# SaltChat

Stateless Node.js/TypeScript service for server-to-server SaltHub chat requests. It uses Express, strict Zod validation, a provider interface, and a mock provider by default. There is no database or Redis dependency.

## Installation and development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Production commands:

```bash
pnpm build
pnpm start
```

Quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Environment variables

- `PORT` (default `3000`)
- `SERVICE_NAME` (default `saltchat`)
- `SERVICE_SECRET` (required; shared only by SaltHub backend and SaltChat)
- `ALLOWED_ORIGINS` (comma-separated browser origins; empty means no browser origins)
- `AI_PROVIDER` (`mock`, `openai`, `claude`, or `openai-compatible`; default `mock`)
- `AI_API_KEY` (required when `AI_PROVIDER` is not `mock`)
- `AI_MODEL` (optional; defaults to `gpt-4o-mini`, or `claude-sonnet-4-5` for Claude)
- `AI_BASE_URL` (optional; used by OpenAI-compatible providers, default `https://api.openai.com/v1`)

Provider credentials and request formatting stay inside provider adapters. For example, Claude can be selected with:

```env
AI_PROVIDER=claude
AI_API_KEY=your-anthropic-api-key
AI_MODEL=claude-sonnet-4-5
```

For OpenAI-compatible services such as a gateway or self-hosted endpoint:

```env
AI_PROVIDER=openai-compatible
AI_API_KEY=your-api-key
AI_BASE_URL=https://your-provider.example/v1
AI_MODEL=your-model
```

## API

Health is public:

```bash
curl http://localhost:3000/health
```

Chat is server-only and requires the service key:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -H 'X-Service-Key: replace-with-a-long-random-server-secret' \
  -d '{"message":"How do I create a quote?","conversation_id":null,"context":{"page":"/dashboard"},"user":{"id":"firebase-user-id","email":"user@example.com","display_name":"User Name","role":"admin","department":"Strategy","client_ids":[]}}'
```

The SaltHub backend must send `X-Service-Key` and must never expose that value to the browser. It does not need to send any provider key.

## Vercel deployment

Import this repository into Vercel. The included `vercel.json` exposes `api/index.ts` as the function entrypoint. Configure the required environment variables in the Vercel project settings, especially `SERVICE_SECRET`; do not commit `.env`.

The configured rate limiter is intentionally in-memory. It is suitable as a basic per-instance guard, but it is not globally consistent across multiple Vercel/serverless instances. Replace the limiter store with Redis or another shared store before relying on it for global quotas.

`trust proxy` is set to one proxy hop for Vercel. If the service is placed behind another proxy chain, review that setting so the client IP cannot be spoofed through forwarded headers.

## Adding an AI provider

Implement `AiProvider` in `src/providers`, add a server-only configuration value in `src/config/env.ts`, and select it in `createProvider` in `src/services/chat.service.ts`. Keep provider credentials and provider-specific request formatting inside that adapter; controllers and routes should remain unchanged.
