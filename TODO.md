# Command Hub frontend work log

Rules for this pass: do not change the Express backend, do not use mock data, keep the existing UI, and render whatever the API actually returns.

## Done

- [x] Inspect frontend vs backend shapes
- [x] Remove Lovable references
- [x] Vite proxy `/api` and `/health` to `http://localhost:3000`
- [x] Delete mock API (`src/api/mock`, `VITE_USE_MOCK`)
- [x] Auth: login/me return `{ id, email }`; wrap for the UI; logout accepts `200 { ok: true }`
- [x] Stats: `GET /api/stats` as returned
- [x] Interactions list: `{ data, pagination }` + `page`/`limit` (backend does not filter)
- [x] Interaction detail: include `aiSummary` / `aiTags` when present
- [x] Commands: `GET/PUT /api/commands` with `hello`/`notify` names and injected `guildId`
- [x] Guilds: `channelId` may be null; webhook is write-only

## In progress

- [ ] Start frontend + backend together and confirm login, dashboard, interactions, commands, guilds use live data

## Not in the backend (no UI added)

- Bot invite URL — contract only, route does not exist
- Manual action retry — contract only, route does not exist
- Flagged keyword field — computed in rules, not stored or returned
