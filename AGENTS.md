# AGENTS.md

## Architecture
- Persian luxury store (farsi UI). Two Node processes:
  - `server/` — Express API (`node --watch index.js`), SQLite via built-in `node:sqlite` (requires Node >= 22.5; DB auto-created at `server/data/zari.db`, gitignored). Seeds itself on boot when empty (`seedIfEmpty`).
  - `zari-luxury-store/` — Vite + React 19 frontend on port 5173, proxies `/api/*` to the backend (`API_URL` env, default `127.0.0.1:4000`). All frontend API calls use relative `/api` paths — no CORS config needed in dev.
- No external services/credentials. Shipping constants (`SHIPPING_FEE`, `FREE_SHIPPING_THRESHOLD`, in Toman) come from env; defaults in `server/.env.example`.

## Base44 dev environment
- Run: `docker compose -f docker-compose.base44.yml up -d` (both services use `node:22` with the repo bind-mounted; `npm ci` runs at container start).
- Web entry: host port 3000 → Vite 5173. Backend not exposed to the host; reached via the Vite proxy.
- Health: `curl http://localhost:3000/api/health` (returns product count; seeded = 12 products). Web healthcheck hits `/`.
- Vite `allowedHosts: true` already set in `vite.config.js`, so the preview hostname works out of the box.
- Backend changes hot-reload via `node --watch`; frontend via Vite HMR. After compose/env/dependency changes, recreate containers.
- DB state lives in `server/data/zari.db` inside the bind mount; it survives restarts. Delete it to re-seed.
