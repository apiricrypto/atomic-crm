---
name: satno-llm-router
description: Route SATNO AI workloads across multiple LLM providers based on privacy, reliability, latency, cost, modality, and task type. Use when SATNO CRM, Bale Market, Tender Radar, voice/support agents, engineering assistants, or internal automations need to choose an LLM provider, add fallback behavior, compare free/paid APIs, or avoid sending sensitive data to unsuitable services.
---

# SATNO LLM Router

## Objective
Select the safest and most appropriate LLM provider for each SATNO workload without locking the system to one vendor.

## Core rule
Provider choice is a routing decision, not a product-wide constant.

Evaluate:
1. data sensitivity
2. task type
3. modality
4. latency target
5. expected volume
6. cost ceiling
7. provider availability
8. regional/legal constraints
9. model quality required

## Privacy classes

### P0 — Public / non-sensitive
Examples:
- public tender text
- public product descriptions
- public website content
- generic coding tasks

May use vetted free-tier providers if their terms are acceptable.

### P1 — Internal operational
Examples:
- internal notes
- non-sensitive process data
- draft summaries

Prefer providers with clear data handling and configurable retention.

### P2 — Sensitive business/customer
Examples:
- CRM customer data
- financial records
- contracts
- personal identifiers
- private staff data

Do not route to free-tier APIs unless their terms, retention, training use, and regional requirements have been explicitly reviewed and approved.
Prefer paid enterprise/API plans or local/self-hosted inference.

## Task routing guidance

### Extraction / classification / tagging
Preferred characteristics:
- fast
- deterministic
- inexpensive
- JSON-friendly

Candidate providers:
- Groq
- OpenRouter with a stable open-weight model
- Cloudflare Workers AI

### Reasoning / complex analysis
Preferred characteristics:
- stronger reasoning model
- larger context
- lower hallucination rate

Candidate providers:
- NVIDIA NIM
- OpenRouter
- Gemini
- Mistral

### Multimodal
Candidate providers:
- Gemini
- selected OpenRouter models
- NVIDIA NIM multimodal models
- Cloudflare Workers AI multimodal models

### Coding / refactoring
Candidate providers:
- Codestral / Mistral
- code-focused OpenRouter models
- NVIDIA NIM code-capable models

### Privacy-sensitive workloads
Preferred:
- self-hosted/local model
- approved paid API with contractual privacy terms
- Ollama/local runtime when quality is sufficient

## Fallback policy
Implement provider fallback in tiers:
1. primary
2. secondary compatible provider
3. safe degradation mode
4. human review

Never silently route sensitive data to a weaker-privacy provider just because the primary provider fails.

## Provider abstraction
Expose a common internal interface such as:
- generateText
- generateStructured
- embed
- analyzeImage
- transcribe
- classify

Normalize:
- model name
- base URL
- auth
- timeout
- retries
- token limits
- structured output handling
- error mapping

## Configuration
Keep provider config outside source code:
- API keys in environment variables/secrets
- model names in config
- routing rules in versioned policy
- no hard-coded credentials

## Observability
For every routed request, log:
- provider
- model
- task class
- privacy class
- latency
- success/failure
- fallback used
- token/usage estimate where available

Do not log sensitive prompt content by default.

## SATNO default policy

### Bale Market
Default:
- fast extraction/classification provider
- fallback to OpenRouter or NVIDIA
- public-source messages can use P0 routing

### Tender Radar
Default:
- fast text model for extraction
- stronger reasoning model only for scoring/explanations
- public tender text is generally P0

### SATNO CRM
Default:
- P2 by default for customer/financial/staff data
- use local or approved private API route
- free-tier providers only for public/non-sensitive CRM tooling tasks

### Voice/support agent
Separate:
- speech-to-text
- reasoning
- text-to-speech
Use the lowest-latency provider that meets privacy requirements.

## Verification
Before production use:
1. verify provider terms
2. verify region availability
3. verify rate limits
4. test timeout/fallback
5. test structured output
6. test sensitive-data guardrail
7. test cost/usage logging

## Failure modes
- provider quota exceeded
- model removed/renamed
- output schema drift
- region restriction
- latency spikes
- privacy terms change

Treat provider metadata as time-sensitive and re-check before relying on it.
