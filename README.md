# Command Hub

React admin dashboard for Command Hub. It monitors Discord slash-command interactions and lets administrators configure commands and guilds against the existing Express backend.

## Development

You need Node.js 20+ and npm.

```sh
git clone <this-repository-url>
cd command-hub-frontend
npm i
npm run dev
```

By default the app calls the Express backend. The Vite dev server proxies `/api` to `http://localhost:3000`.

```sh
npm run dev
```

Start the Express backend separately on port 3000. The dashboard talks to it through the `/api` proxy — there is no mock data layer.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite / TanStack Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
