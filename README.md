# 🚀 SuperNova Hackathon Starter

**Professional Full-Stack Starter** optimized for Odoo Hackathon evaluation criteria.

**Frontend**: React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Lucide React  
**Backend**: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL + JWT + bcrypt  
**Security**: Helmet + CORS + Rate-limiting + Express-validator  
**Real-time**: Socket.IO  
**Code Quality**: Comprehensive error handling, logging, validation, type safety

Login/Signup already works end-to-end. Tomorrow, focus only on the problem statement.

---

## ⚡ First-time setup (every teammate, ~10 mins)

You need installed: **Node.js**, **Git**, **PostgreSQL** (the person running the DB).

### 1. Get the code

```bash
git clone <YOUR_REPO_URL>
cd <repo-folder>
```

### 2. Set up the BACKEND

Open a terminal in the project folder:

```bash
cd server
npm install
```

Now create your `.env` file:

1. Copy the file `server/.env.example` and rename the copy to `.env`
2. Open `.env` and put YOUR PostgreSQL password in the `DATABASE_URL` line (replace `YOUR_DB_PASSWORD_HERE`)

Then create the database and tables:

```bash
npx prisma migrate dev --name init
```

(This creates a database called `hackathon` with a `User` table. If it asks anything, press Enter / say yes.)

Start the backend:

```bash
npm run dev
```

✅ You should see: `Server running on http://localhost:5000`
Test it: open http://localhost:5000/api/health in your browser → should show `{"status":"ok",...}`

### 3. Set up the FRONTEND

Open a **second terminal** (keep the backend running!):

```bash
cd client
npm install
```

Copy `client/.env.example` → rename copy to `.env` (no changes needed for local dev).

Start the frontend:

```bash
npm run dev
```

✅ Open http://localhost:5173 → you'll see the login page.
Create an account → you land on the dashboard → click **Send ping** to test realtime. If you see a pong time, EVERYTHING works. 🎉

---

## 🗂️ Where things live

```
client/                      ← frontend (React)
  src/pages/                 ← your screens (Login, Register, Dashboard)
  src/context/AuthContext.tsx← login state, use with useAuth()
  src/lib/api.ts             ← call the backend: api.get("/...")
  src/lib/socket.ts          ← realtime: socket.emit / socket.on

server/                      ← backend (Express)
  prisma/schema.prisma       ← DATABASE TABLES — add models here tomorrow
  src/index.ts               ← main server + Socket.io events
  src/routes/                ← API endpoints
  src/controllers/           ← the logic behind endpoints
  src/middleware/auth.middleware.ts ← put requireAuth on protected routes
```

## 🛠️ Daily commands cheat-sheet

| What | Where | Command |
|---|---|---|
| Start backend | `server/` | `npm run dev` |
| Start frontend | `client/` | `npm run dev` |
| Changed schema.prisma? | `server/` | `npx prisma migrate dev` |
| Pulled teammate's schema change? | `server/` | `npx prisma migrate dev` |
| See the database visually | `server/` | `npx prisma studio` |

## 👥 Git rules (IMPORTANT)

1. **Never push directly to `main`.**
2. Make a branch: `git checkout -b feat/your-feature`
3. Push it: `git push -u origin feat/your-feature`
4. Open a Pull Request on GitHub → one teammate approves → merge.
5. Before starting work each time: `git checkout main && git pull`

## 🧯 Common problems

- **`bcrypt` fails to install on Windows** → run `npm uninstall bcrypt && npm install bcryptjs`, then in `auth.controller.ts` change the import to `import bcrypt from "bcryptjs";` and in package.json devDependencies swap `@types/bcrypt` for `@types/bcryptjs`.
- **Frontend can't reach backend / CORS error** → is the backend running? Is `CLIENT_URL` in `server/.env` exactly `http://localhost:5173`?
- **Prisma errors after pulling code** → run `npx prisma generate` then `npx prisma migrate dev` in `server/`.
- **`psql` not recognized** → PostgreSQL's `bin` folder isn't in PATH (ask the leader 😄).
