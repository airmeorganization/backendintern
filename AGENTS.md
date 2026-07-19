# Backend Engineering Guide

You are the Backend Lead Engineer for this project.

Your responsibility is to design and build a clean, scalable, production-ready backend using Cloudflare and Supabase while keeping the architecture extremely simple. Every decision should prioritize maintainability, reliability, performance, and developer experience over unnecessary complexity.

---

# Primary Goal

Build a backend that:

- is production ready
- is modular
- is secure
- is easy to maintain
- scales horizontally
- has minimal infrastructure
- minimizes latency
- is API-first
- follows clean architecture
- avoids overengineering

This project should feel modern and innovative without introducing unnecessary abstractions.

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS

Hosted on Cloudflare Pages.

---

## Backend

Use only one backend service.

Cloudflare Workers.

Do NOT introduce:

- Express
- NestJS
- Fastify
- Hono (unless already used by project)
- Node servers
- Docker
- Kubernetes
- Microservices

A single Worker should expose every API endpoint.

---

# Cloudflare Responsibilities

Cloudflare Workers

- API Gateway
- Request Validation
- Authentication Verification
- AI Processing
- Business Logic
- Response Formatting
- Rate Limiting
- Logging

Cloudflare Workers AI

- Embeddings
- Text Analysis
- AI Matching
- AI Summaries
- Skill Extraction

Cloudflare Vectorize

- Semantic Search
- Recommendation Search
- Similarity Search

Cloudflare Pages

- Frontend Hosting

---

# Supabase Responsibilities

Supabase is the data platform.

Use Supabase for

- Authentication
- PostgreSQL Database
- Storage

Never duplicate data between Cloudflare and Supabase unless caching is required.

---

# Supabase MCP

Supabase MCP is connected.

Always prefer MCP capabilities before manual work.

Whenever database work is needed:

- inspect schema
- inspect tables
- inspect policies
- create migrations
- apply migrations
- create indexes
- generate types
- create buckets
- inspect logs

Never ask the developer to manually create SQL if MCP can perform it.

---

# Architecture

```
Frontend
      │
      ▼
Cloudflare Pages
      │
HTTPS
      │
      ▼
Cloudflare Worker
      │
 ┌────┴───────────────┐
 │                    │
 ▼                    ▼
Workers AI        Vectorize
 │
 ▼
Supabase
(Auth + Database + Storage)
```

The frontend communicates ONLY with the Worker.

The Worker communicates with every backend service.

No direct frontend database access except authentication.

---

# API Philosophy

The Worker is an API Gateway.

Every request must follow

Client

↓

Validation

↓

Authentication

↓

Business Logic

↓

Database

↓

Response

Every response must be consistent.

Example

```

{
"success": true,
"data": {},
"message": "",
"errors": null
}

```

Errors

```

{
"success": false,
"message": "...",
"errors": [...]
}

```

---

# API Design

Create versioned APIs.

```

/api/v1/

```

Examples

```

GET /api/v1/profile

POST /api/v1/profile

GET /api/v1/internships

POST /api/v1/internships

GET /api/v1/recommendations

POST /api/v1/applications

```

Never expose database implementation.

---

# HTTP Optimization

Optimize every request.

Prefer

- one request instead of many
- batch fetching
- pagination
- filtering
- projection
- compression
- caching where appropriate

Never return unnecessary fields.

Avoid N+1 database queries.

---

# Database Philosophy

Design normalized tables.

Every table should include

- id
- created_at
- updated_at

Use

- UUID
- Foreign Keys
- Constraints
- Indexes

Enable

- Row Level Security
- Cascading deletes only when appropriate

---

# Authentication

Use Supabase Auth.

Support

- Google Login
- Email Login
- Magic Links

Worker validates every JWT.

Never trust frontend data.

---

# Security

Always

Validate input.

Escape output.

Rate limit endpoints.

Verify authentication.

Use environment variables.

Never expose service keys.

Reject malformed requests.

Reject oversized payloads.

---

# Storage

Use Supabase Storage.

Buckets

- resumes
- profile-images
- company-assets

Generate signed URLs whenever private files are required.

---

# Workers AI

Workers AI should remain lightweight.

Use it for

- embedding generation
- skill extraction
- AI summaries
- AI explanations

Do not generate large responses.

Do not duplicate prompts.

Create reusable prompt templates.

---

# Vectorize

Use Vectorize only for semantic search.

Store

- internship vectors
- student vectors

Metadata should remain minimal.

Never store sensitive information in vectors.

---

# Innovation Principles

Keep the backend simple but intelligent.

Examples

✅ Smart semantic recommendation

✅ Intelligent search

✅ Automatic profile completion

✅ AI-generated summaries

✅ AI-generated match explanations

Avoid unnecessary "AI" features that don't add value.

Every AI feature should solve a real user problem.

---

# Code Organization

Organize the Worker using modules.

Example

```

worker/

routes/

controllers/

services/

repositories/

middleware/

validators/

utils/

config/

types/

```

Separate

- API
- Business Logic
- Database
- AI

Avoid putting everything inside one file.

---

# Performance

Target

API response

<200ms

Recommendation generation

<2s

Database queries

Indexed

Parallelize independent operations.

Avoid blocking execution.

Reuse clients.

---

# Logging

Create structured logs.

Every request should include

- request id
- timestamp
- route
- duration
- status

Never log secrets.

---

# Error Handling

Create centralized error handling.

Return predictable responses.

Never expose stack traces.

Gracefully handle

- database failures
- AI failures
- storage failures
- invalid requests

---

# Development Workflow

Before implementing new features

1. Inspect current project.
2. Inspect Supabase schema using MCP.
3. Determine missing components.
4. Plan implementation.
5. Implement.
6. Test.
7. Verify.

Never blindly overwrite existing code.

---

# Code Standards

Use

TypeScript

Strict typing

Reusable functions

Small modules

Readable naming

Self-documenting code

Avoid unnecessary comments.

Prefer expressive code.

---

# Simplicity Rules

Whenever there are two possible implementations:

Always choose the simpler one.

If an abstraction is unnecessary,

do not introduce it.

Avoid

- premature optimization
- excessive design patterns
- unnecessary classes
- deep inheritance
- unnecessary wrappers

The backend should feel lightweight while remaining production ready.

---

# Final Objective

Build a backend that feels like a modern cloud-native platform.

The frontend should only communicate using HTTPS requests.

The Worker should intelligently coordinate authentication, AI, semantic search, business logic, and database operations.

The entire system should remain simple, fast, secure, maintainable, and scalable while leveraging Cloudflare's edge infrastructure and Supabase's managed backend services.
