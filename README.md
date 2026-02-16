# SVAR React Gantt + Next.js

An interactive Gantt chart in a Next.js app — built with the open-source [SVAR React Gantt](https://svar.dev/react/gantt/) widget, TypeScript, and SQLite.

## Quick Start

```
git clone https://github.com/svar-widgets/react-gantt-demo-nextjs.git
cd react-gantt-demo-nextjs
npm install
npm run dev
```

Open http://localhost:3000.

## Branches

Each branch shows a different stage of the integration:

- [`basic`](https://github.com/svar-widgets/react-gantt-demo-nextjs/tree/basic) — client-side only, no backend
- [`backend`](https://github.com/svar-widgets/react-gantt-demo-nextjs/tree/backend) — adds REST API + SQLite persistence
- [`main`](https://github.com/svar-widgets/react-gantt-demo-nextjs/tree/main) — full demo (same as `backend` for now)

## Features

- Gantt chart with toolbar, editor widget, and task dependencies
- Row reordering and drag-and-drop
- Task hierarchy (parent-child) with summary and milestone types
- REST API routes backed by SQLite (better-sqlite3)
- Handles Next.js specifics: CSS imports, SSR hydration, full-page layout

## Related

- [SVAR React Gantt docs](https://docs.svar.dev/react/gantt/)
- [Next.js integration guide](https://docs.svar.dev/react/gantt/category/nextjs)
- [Source code and issues](https://github.com/svar-widgets/react-gantt)
