# Online Banking System — Frontend

React single-page app for the Online Banking System. Talks to the Spring Boot API documented in
[../backend/README.md](../backend/README.md).

The full design and build spec lives in [INSTRUCTIONS.md](INSTRUCTIONS.md); this file is just how
to run it.

| | |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | react-router-dom 6 |
| HTTP | axios |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | react-hot-toast |
| Runs on | http://localhost:5173 |

---

## 1. Install

```bash
npm install
```

## 2. Configuration

One variable, in `.env.development` (already committed, since it holds nothing secret):

```
VITE_API_BASE_URL=/api
```

`/api` is a **relative** path on purpose. The Vite dev server proxies it to
`http://localhost:8080`, so the browser only ever talks to one origin and CORS never comes into
play during development. The proxy is configured in [vite.config.js](vite.config.js).

Only change this if you deploy the frontend separately from the API, in which case set it to the
full backend URL and make sure that origin is listed in the backend's `app.cors.allowed-origins`.

Vite only exposes variables prefixed `VITE_`, and it inlines them at build time — so never put a
secret in one. Anything here ships to the browser in plain text.

## 3. Run

**Start the backend first** — the app is useless without it.

```bash
npm run dev
```

Then open http://localhost:5173. Register a new account, or sign in as the seeded administrator
(`admin@obs.com` / `Admin@123` unless you changed it).

## 4. Build

```bash
npm run build
```

Outputs to `dist/`. Preview the production build locally with `npm run preview`.

The build warns that one chunk is over 500 kB — that is Recharts, and it is expected. Splitting it
out is not worth the complexity at this size.

---

## Structure

```
src/
├── components/
│   ├── ui/            Button, Input, Card, Badge, Modal, Pagination, DataTable, states
│   ├── layout/        Sidebar, Topbar, Page
│   ├── dashboard/     BankCard, StatTile, BalanceChart, TransactionRow
│   └── transactions/  TransactionDetailModal
├── pages/
│   ├── auth/          Login, Register
│   ├── user/          Dashboard, MoneyForm, Transfer, TransactionHistory, Profile, Notifications
│   └── admin/         AdminDashboard, AdminUsers, AdminAccounts, AdminTransactions
├── layouts/           AppLayout (shared shell for user and admin)
├── routes/            AppRoutes, ProtectedRoute, PublicOnlyRoute
├── services/          api + one module per API area
├── context/           AuthContext
└── utils/             formatters, validators
```

## Pages

| Route | Guard | Purpose |
|---|---|---|
| `/login`, `/register` | Public only | Signed-in users are redirected away |
| `/dashboard` | Auth | Card, quick actions, recent transactions, balance chart, income/expense |
| `/deposit`, `/withdraw` | Auth | Same component, one flag — withdraw caps the amount at the balance |
| `/transfer` | Auth | Account-number and UPI tabs, payee confirmation, confirm dialog |
| `/transactions` | Auth | Filters, date range, debounced search, pagination, detail modal |
| `/profile` | Auth | Account details, personal info, change password |
| `/notifications` | Auth | Mark read, delete |
| `/admin/*` | Admin | Stats, users, accounts, full ledger |

## How the plumbing works

**One axios instance** ([services/api.js](src/services/api.js)) holds every cross-cutting concern:
it attaches the bearer token, unwraps the `{ success, message, data }` envelope so no component
ever sees it, and normalises every failure into `{ message, errorCode, errors }`. A 401 clears the
session rather than leaving a half-signed-in UI.

**Auth state** ([context/AuthContext.jsx](src/context/AuthContext.jsx)) rehydrates from
`localStorage` and checks the token's `exp` before the first render of any guarded route. The
guards deliberately wait on `loading` — redirecting during rehydration is the classic bug here, and
it makes every hard refresh on `/dashboard` bounce to the login screen.

**Backend validation errors** arrive as an `errors` map keyed by field name and are rendered
inline on the matching input. The client-side rules in [utils/validators.js](src/utils/validators.js)
mirror the server's, but they are a convenience only — the server validates everything again.

**Formatting is centralised** in [utils/formatters.js](src/utils/formatters.js). Amounts render as
`₹1,52,340.00` with Indian grouping, and the `+`/`-` sign comes from the backend's `direction`
field rather than being re-derived in the UI.

## Conventions worth keeping

- Every data-driven view implements four states: loading (skeletons shaped like the content),
  empty, error with a retry, and success.
- Account numbers are masked to the last four digits unless the user explicitly reveals them.
- Submit buttons disable while a request is in flight, so a transfer cannot be double-submitted.
- Destructive and irreversible actions go through a confirmation dialog.
- Icon-only buttons carry an `aria-label`; credit and debit are distinguished by sign and icon, not
  colour alone.

## Troubleshooting

**"Cannot reach the server. Is the backend running?"** — exactly what it says. Start the backend on
port 8080.

**401 on every request right after signing in** — the backend restarted with a different
`JWT_SECRET`, invalidating tokens issued by the previous run. Sign in again.

**Blank page after `npm run build` on a static host** — a SPA needs all unknown paths rewritten to
`index.html`, otherwise deep links like `/dashboard` 404 on refresh.
