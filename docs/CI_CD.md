# CI/CD Pipeline & Branching Strategy

This document explains how code moves from a developer's machine to production for the
**SyncBoard** monorepo (`backend` = Express API, `frontend` = Next.js app).

---

## 1. Branching strategy — Git Flow

We use **Git Flow** because the project has two independently deployable apps and needs a
clear separation between "in progress" work, a stable staging line, and production releases.

```
main        ●───────────────●───────────────●──────────────▶  (production, tagged releases)
             \               \  ▲           / ▲
release/*     \               ●─┘           ●─┘   (release branches cut from develop)
               \             ▲
hotfix/*        ●───────────/    (branched from main, merged back to main AND develop)
                 \
develop     ●──●──●──●──●──●──●──●──●──●──●──●────────────▶  (staging, integration branch)
             \     \     \           \
feature/*     ●──●  ●──●  ●──●──●     ●──●   (branched from develop, PR'd back into develop)
```

### Branches

| Branch      | Purpose                                                              | Created from | Merges into      | Deploys to  |
|--------------|-----------------------------------------------------------------------|--------------|-------------------|-------------|
| `main`       | Always reflects what's live in **production**. Every commit is tagged. | —            | —                 | Production  |
| `develop`    | Integration branch. Always reflects what's on **staging**.            | `main`       | —                 | Staging     |
| `feature/*`  | One feature/fix in progress, e.g. `feature/kanban-drag-fix`.           | `develop`    | `develop` (via PR)| CI only     |
| `release/*`  | Stabilizes a set of features for a production release, e.g. `release/1.4.0`. | `develop` | `main` **and** `develop` | CI only, promotes to prod on merge |
| `hotfix/*`   | Urgent production fix, e.g. `hotfix/jwt-refresh-bug`.                  | `main`       | `main` **and** `develop` | CI only, promotes to prod on merge |

### Day-to-day workflow

1. **Start work:** branch off `develop`.

   ```bash
   git checkout develop
   git pull
   git checkout -b feature/task-drag-fix
   ```

2. **Push early, push often.** Every push runs `CI` (lint + typecheck + build) — see §2.
3. **Open a PR into `develop`.** The PR template (`.github/pull_request_template.md`) and
   required `CI status` check must pass before merge. Squash-merge to keep `develop` linear.
4. **`develop` auto-deploys to staging** on every merge (see §3) — QA/review happens there.
5. **Cutting a release:** when `develop` is ready to ship, branch `release/x.y.z` off
   `develop`, do final fixes/version bumps there, then PR it into `main`.
6. **Merging into `main` auto-deploys to production** and should be tagged:

   ```bash
   git checkout main
   git pull
   git tag v1.4.0
   git push --tags
   ```

7. **Back-merge the release into `develop`** so staging doesn't lose the release's fixes:

   ```bash
   git checkout develop
   git merge main
   git push
   ```

8. **Hotfixes** follow the same pattern but branch from `main` directly, and must be
   merged back into **both** `main` and `develop` once shipped.

### Recommended branch protection rules (configure in GitHub → Settings → Branches)

- `main` and `develop`: require a PR before merging, require the `CI status` check to pass,
  require branches to be up to date before merging, disallow force-push and deletion.
- `main` additionally: require at least 1 approving review; restrict who can push directly.
- Turn on the **`production`** GitHub Environment's "required reviewers" protection rule
  (Settings → Environments → production) so deploys to prod need manual approval even if CI
  is green — this is the safety valve for `main`.

---

## 2. Continuous Integration — `.github/workflows/ci.yml`

Runs on:

- Every push to any branch **except** `main`/`develop` (fast feedback while you work).
- Every pull request targeting `main` or `develop` (the merge gate).

What it does:

1. **`changes`** — uses `dorny/paths-filter` to detect whether `backend/**` and/or
   `frontend/**` changed, so we don't waste time building an app that didn't change.
2. **`backend`** (if backend changed) — `npm ci` → `npm run lint` → `npm run typecheck` →
   `npm run build`, and uploads `backend/dist` as a build artifact.
3. **`frontend`** (if frontend changed) — `npm ci` → `npm run lint` → `npm run build`
   (Next.js type-checks as part of `build`).
4. **`ci-status`** — a single always-run job that fails if any of the above failed. Point
   your branch protection "required status check" at this job so it works no matter which
   workspace(s) triggered.

---

## 3. Continuous Deployment — `.github/workflows/deploy.yml`

Runs on every push to `develop` or `main` (i.e. after a PR merges).

| Push to   | GitHub Environment | Backend deploy target        | Frontend deploy target        |
|-----------|---------------------|-------------------------------|--------------------------------|
| `develop` | `staging`           | Render staging service        | Vercel preview (aliased to staging domain) |
| `main`    | `production`        | Render production service     | Vercel production              |

Flow: `resolve-env` picks the environment from the branch name → `build-backend` /
`build-frontend` re-verify lint/typecheck/build → `deploy-backend` / `deploy-frontend` run
only if the matching build job succeeded, scoped to that GitHub Environment's secrets.

### Why GitHub Environments?

Both `staging` and `production` deploy jobs reference secrets with the **same names**
(`RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, etc.), but each GitHub **Environment**
(Settings → Environments) stores its own value for that name. This keeps the workflow
YAML identical for both targets and lets you add manual-approval gates on `production`
without touching `staging`.

### Required setup (one-time)

1. **Create two GitHub Environments:** `staging` and `production`
   (repo → Settings → Environments → New environment).
2. **Backend (Render):**
   - Create two Render web services (e.g. `syncboard-api-staging`,
     `syncboard-api-production`), each with its own Mongo/Redis env vars.
   - In each service → Settings → Deploy Hook, copy the hook URL.
   - Add it as secret `RENDER_DEPLOY_HOOK_URL` in the matching GitHub Environment.
3. **Frontend (Vercel):**
   - Create a Vercel project linked to `frontend/` (or two projects if you prefer fully
     separate staging/production projects).
   - Generate a token: Vercel → Account Settings → Tokens.
   - Get org/project IDs: `vercel link` locally inside `frontend/`, then read
     `frontend/.vercel/project.json`.
   - Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` to **both** environments
     (same values are fine if using one Vercel project for both).
   - Optional: add repo **variable** `VERCEL_STAGING_ALIAS` (e.g. `staging.syncboard.app`)
     so every `develop` deploy aliases to a stable staging URL instead of a random preview URL.
4. **Frontend runtime env vars** (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, etc.) —
   set these directly in the Vercel project's Environment Variables UI per Vercel
   environment (Preview vs Production), not in GitHub. The CI build in this repo only
   needs placeholder values to type-check/build successfully.
5. **Protect `production`:** in Settings → Environments → `production`, enable
   "Required reviewers" so a human approves before the deploy job runs.

### Secrets/variables summary

| Name                      | Scope                | Used by            |
|---------------------------|-----------------------|--------------------|
| `RENDER_DEPLOY_HOOK_URL`  | Environment secret (staging & production) | `deploy-backend` |
| `VERCEL_TOKEN`            | Environment secret (staging & production) | `deploy-frontend` |
| `VERCEL_ORG_ID`           | Environment secret (staging & production) | `deploy-frontend` |
| `VERCEL_PROJECT_ID`       | Environment secret (staging & production) | `deploy-frontend` |
| `VERCEL_STAGING_ALIAS`    | Repo/Environment variable (optional)        | `deploy-frontend` |

---

## 4. Local equivalents

Before pushing, you can run exactly what CI runs:

```bash
# Backend
cd backend && npm ci && npm run lint && npm run typecheck && npm run build

# Frontend
cd frontend && npm ci && npm run lint && npm run build
```

---

## 5. Future improvements

- Add automated tests (Jest/Vitest + Supertest for backend, RTL/Playwright for frontend)
  and wire them into the `backend`/`frontend` CI jobs once they exist.
- Add a Dependabot or Renovate config for automated dependency PRs.
- Add a smoke-test job after deploy (hit `/api/v1/health`) that rolls back or alerts on
  failure.
