# SATNO CRM AI Gateway

## Architecture

The React/Vite client never stores third-party LLM API keys.

Client flow:

```
SATNO CRM
   |
   v
src/lib/aiGateway.ts
   |
   v
trusted /api/ai backend or serverless proxy
   |
   +--> local/private model for P2 data
   +--> vetted external provider for P0/P1 data
```

## Privacy classes

- P0: public/non-sensitive data
- P1: internal operational data
- P2: customer, finance, staff, authentication, contracts, personal identifiers

P2 is routed to `ollama-local` by default and has no automatic fallback to free public providers.

## Current route policy

- extraction/classification: Groq -> OpenRouter -> NVIDIA NIM
- reasoning: NVIDIA NIM -> OpenRouter
- multimodal: Gemini -> OpenRouter -> NVIDIA NIM
- coding: Mistral -> OpenRouter -> NVIDIA NIM
- P2 sensitive data: local/private only

## Production requirement

The `/api/ai` endpoint must enforce the routing policy again on the server. Client-supplied routing metadata must be treated as advisory, not trusted authorization.

Provider keys belong only in server-side secrets/environment variables.
