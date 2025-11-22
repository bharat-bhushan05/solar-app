<!-- .github/copilot-instructions.md -->
# Quick AI assistant instructions — Solar System app

This file provides focused, actionable guidance so an AI coding agent can be productive immediately in this repository.

1. Project overview
- Node.js + Express web app that serves a static front-end (`index.html`) and a small API implemented in `app.js`.
- Data is stored in MongoDB via `mongoose` (schema is declared inline in `app.js`).
- App listens on port `3000` (see `app.js` and `package.json` `start` script).

2. Key files and what they contain
- `app.js`: Express server, MongoDB connection (reads `process.env.MONGO_*` variables), endpoints: `POST /planet`, `GET /`, `GET /os`, `GET /live`, `GET /ready`.
- `app-controller.js`: client-side logic (vanilla JS) that calls `/os` and `/planet`. Look for fetch payload format: `{ id: <number> }`.
- `app-test.js`: Mocha + Chai HTTP tests which POST to `/planet` with `{ id: <n> }` and assert returned fields (id, name). Also tests `/os`, `/live`, `/ready`.
- `package.json`: scripts: `start` (`node app.js`), `test` (mocha with `mocha-junit-reporter`), `coverage` (nyc + mocha). Use these exact commands for CI and local runs.
- `Dockerfile`: Node 18 image, installs packages and sets placeholder env vars `MONGO_URI`, `MONGO_USERNAME`, `MONGO_PASSWORD`. Containers expect those env vars to be provided at runtime.
- `kubernetes/`: contains `development`, `staging`, `production` manifests — these likely wire env vars and services for deployment. Inspect the `deployment.yaml` files when updating deployment behavior.

3. Environment & runtime considerations (explicit)
- The server expects a reachable MongoDB. Environment variables used:
  - `MONGO_URI` — full connection string
  - `MONGO_USERNAME`, `MONGO_PASSWORD` — credentials (optional depending on the DB)
- Tests in `app-test.js` use the real Express app exported from `app.js` and will attempt DB queries. To run tests reliably in CI, either:
  - Provide a test MongoDB instance and seed it with expected planet documents (IDs 1..8), or
  - Mock `mongoose` or the model in tests (the code currently does not mock DB calls).

4. Patterns & conventions specific to this repo
- Inline Mongoose model: the `planets` model is created inside `app.js` (not in a separate `models/` directory). When editing DB models, update `app.js` accordingly.
- Tests rely on numeric `id` values for planets (e.g., 1 -> Mercury). The front-end sends `id` as a number in the POST payload.
- Static front-end assets are served from the repository root (see `express.static(path.join(__dirname, '/'))` in `app.js`). Keep `index.html` and `images/` at repo root if changing assets.

5. Useful commands (copyable)
- Install deps: `npm install`
- Run app locally: `npm start` (starts on port 3000)
- Run tests: `npm test` (mocha; honors timeouts and reporter configured in `package.json`)
- Collect coverage: `npm run coverage` (uses `nyc` — see `nyc` config in `package.json`)

6. Quick debugging tips
- If endpoints return empty bodies during tests, confirm the test DB contains seeded planet documents.
- To inspect runtime env inside a running container, ensure `NODE_ENV` and `MONGO_*` values are set — `/os` endpoint returns `env` and hostname useful for pod/container troubleshooting.

7. When making changes, check these places
- If you add/rename API endpoints: update `app-test.js` tests and `app-controller.js` client calls.
- If you move the Mongoose schema to a `models/` file, update `app.js` to `require()` it instead of redefining.
- If you change static file serving, confirm `index.html` paths and `images/` references still resolve.

8. Examples (concrete snippets found in repo)
- Test POST payload (from `app-test.js`):
  - `{ "id": 1 }` expecting `name: "Mercury"` in response.
- Front-end fetch example (from `app-controller.js`):
  - `fetch('/planet', { method: 'POST', body: JSON.stringify({ id: <value> }), headers: {'Content-type':'application/json'} })`

9. Non-goals / assumptions
- Do not assume a local MongoDB exists; CI must either provide one or tests must be adapted to mock the DB.
- There is no separate build step for the front-end — it's plain HTML/JS served statically.

If any part of this summary is unclear or you'd like more detail (for example, a suggested DB-seeding script or a small `models/planet.js` refactor), tell me which area to expand and I will update this file.
