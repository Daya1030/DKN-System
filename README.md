# DKN-Frontend (React + Vite)

This repository is a minimal React + TypeScript frontend scaffold for the DKN platform.

Quick start:

```bash
cd "c:/Users/asus/Desktop/Mobile web/DKN-Frontend"
npm install
npm run dev
```

Notes:
- The app uses a demo `AuthContext` to switch roles (Consultant, Knowledge Champion, Administrator).
- Replace `src/api.ts` with real REST adapters for documents, projects, search, governance, and analytics.
- The UI is intentionally minimal to serve as a starting point.

Routes included in this scaffold:

- `/` — Home
- `/projects` — Projects list
- `/projects/:id` — Project detail (linked documents + recommendations)
- `/documents` — Documents list
- `/documents/:id` — Document detail (version history + recommendations)
- `/communities` — Communities
- `/analytics` — Analytics dashboard (mocked)
- `/notifications` — Notifications feed
- `/governance` — Governance / audit logs (requires role: Administrator or KnowledgeChampion)
- `/admin` — Admin console (Administrator only)

For non-technical users (quick guide):

1. Open your browser at `http://localhost:5175`.
2. Click the ? help button (top-right) for step-by-step instructions.
3. Sign in with your name using the sign-in input (top-right) — the site will remember your name.
4. Use the navigation to browse Projects and Documents; click any item to open details.
5. If a page says "Access denied", change your role using the role selector (top-right) or ask your administrator.

If you'd like, I can also add a guided first-run tour or larger UI polish to make it even friendlier.
