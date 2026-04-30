# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `emotional-insight` (react-vite, web, path `/`)

Skeleton emotional-insight web app — designed to be redesigned later. Two-path intake:
- **Path A**: just write a reflection in a big text area and submit.
- **Path B**: toggle "Want to add more context for a deeper analysis?" and progressively disclose
  one structured field per screen (relationship → intensity → body → attachment → family → MBTI).

Attachment & family steps offer a "Help me figure this out" 3-question quiz that infers values
behaviorally and tags `attachment_source` as `quiz-inferred` vs `self-reported`.

Key files (easy to swap design):
- `src/index.css` — palette + ambient drift keyframe (warm-neutral skeleton)
- `src/components/AmbientBackground.tsx` — soft floating background orbs
- `src/data/options.ts` — all chip options, quiz questions, and "why we ask" copy
- `src/components/StepShell.tsx` — progress bar + back/skip/next nav for Path B
- `src/pages/intake.tsx` — full state machine for both paths
- `src/components/result/InsightView.tsx` — analysis renderer

Calls `POST /api/analyze`. Generated hook: `useAnalyzeReflection` from `@workspace/api-client-react`.

### `api-server` (express, path `/api`)

`POST /api/analyze` calls OpenAI (model `gpt-5.4`, JSON mode) with the system prompt at
`src/lib/systemPrompt.ts` (CBT/IFS/DBT/Polyvagal/Attachment/NVC). Validates with Zod from
`@workspace/api-zod`; passes through best-effort if validation fails.

Uses `setupReplitAIIntegrations` env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`.
