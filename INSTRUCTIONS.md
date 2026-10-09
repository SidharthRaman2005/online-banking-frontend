# Online Banking System — Frontend Instructions

Authoritative build spec for the React frontend. The API contracts in `../backend/INSTRUCTIONS.md`
are the single source of truth — this document never redefines them, it only consumes them.

**Do not start this until backend Modules 1–5 are built and Postman-tested.** Building UI against
endpoints that do not exist yet is the fastest way to lose a week.

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (JSX) |
| Routing | react-router-dom v6 |
| HTTP | axios (single configured instance) |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Icons | lucide-react |
| Forms | react-hook-form |
| Toasts | react-hot-toast |
| Fonts | Poppins (headings) + Inter (body), via Google Fonts |

Setup:

```bash
npm create vite@latest . -- --template react
npm install react-router-dom axios recharts lucide-react react-hook-form react-hot-toast
npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
```

`vite.config.js` — proxy the API in dev so there are no CORS surprises:

```js
server: { proxy: { '/api': 'http://localhost:8080' } }
```

Then `VITE_API_BASE_URL=/api` in `.env.development`. Commit `.env.example`, never `.env`.

---

## 2. Design System

Derived from the two reference dashboards: white app shell on a soft background, emerald green as the
brand colour, amber as the single accent, generous rounding, soft shadows, no hard borders anywhere.

### 2.1 Tokens (`tailwind.config.js` → `theme.extend`)

```js
colors: {
  brand: {
    50:'#ECFDF5', 100:'#D1FAE5', 200:'#A7F3D0', 300:'#6EE7B7',
    400:'#34D399', 500:'#10B981', 600:'#059669', 700:'#047857',
    800:'#065F46', 900:'#064E3B',
  },
  accent: { 100:'#FEF3C7', 300:'#FCD34D', 500:'#F59E0B', 600:'#D97706' },
  ink:    { 900:'#0F172A', 700:'#334155', 500:'#64748B', 300:'#94A3B8' },
  surface:{ DEFAULT:'#FFFFFF', alt:'#F8FAFC', line:'#E2E8F0', page:'#F1F5F9' },
  state:  { success:'#16A34A', danger:'#DC2626', warn:'#F59E0B', info:'#2563EB' },
},
borderRadius: { xl:'16px', '2xl':'20px', '3xl':'28px' },
boxShadow: {
  card:  '0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)',
  float: '0 12px 40px rgba(15,23,42,.10)',
},
fontFamily: {
  display: ['Poppins','sans-serif'],
  sans:    ['Inter','sans-serif'],
},
```

Fixed usage rules — follow them and the app looks like one product:

| Element | Rule |
|---|---|
| Page background | `bg-surface-page` |
| Cards / panels | `bg-white rounded-2xl shadow-card p-6`, **no border** |
| Section heading | `font-display font-semibold text-xl text-ink-900` |
| Body text | `text-sm text-ink-700` |
| Muted / labels | `text-xs text-ink-500` |
| Money (large) | `font-display font-semibold tabular-nums` |
| Primary button | `bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 py-2.5 font-medium` |
| Secondary button | `bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl px-5 py-2.5` |
| Danger button | `bg-state-danger/10 text-state-danger hover:bg-state-danger/15` |
| "See All" link | `text-sm text-accent-600 hover:text-accent-500 font-medium` |
| Input | `bg-surface-alt rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-400 outline-none` |
| Credit amount | `text-state-success` prefixed `+ ₹` |
| Debit amount | `text-ink-900` prefixed `- ₹` |
| Status chip | pill, `bg-brand-50 text-brand-700` (SUCCESS) / `bg-red-50 text-state-danger` (FAILED) |
| Icon tile | `w-10 h-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center` |

Amber is the accent, not a second brand colour. Use it for "See All" links, the chart tooltip badge,
and highlighted savings-style progress — nowhere else.

### 2.2 Layout

```
┌────────────┬─────────────────────────────────────────────┐
│            │  Topbar: search · notifications · avatar    │
│  Sidebar   ├──────────────────────┬──────────────────────┤
│  240px     │  Main column         │  Right rail 340px    │
│  fixed     │  (card, actions,     │  (chart, income/     │
│            │   transactions)      │   expense, spend)    │
└────────────┴──────────────────────┴──────────────────────┘
```

- App shell: `min-h-screen bg-surface-page p-4 lg:p-6`, inner shell
  `bg-white rounded-3xl shadow-float overflow-hidden`.
- Sidebar: logo top, nav middle, promo card + user chip pinned bottom.
- Active nav item: `bg-brand-600 text-white rounded-xl`. Inactive: `text-ink-500 hover:bg-brand-50
  hover:text-brand-700`. Every item has a lucide icon at `size={18}`.
- Grid gap `24px`. Card internal spacing on a 4px scale.

### 2.3 Signature components

**Bank card** — the visual anchor of the dashboard. `aspect-[1.6/1] rounded-2xl` with
`bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800`, plus a soft amber radial blob at the
top-left at ~30% opacity. Shows: bank name, chip glyph, masked number `•••• •••• •••• 2431`, holder
name, expiry, "Balance ₹1,02,300.00", network mark. **Only the last 4 digits of the account number
are ever rendered.** A copy-to-clipboard button reveals the full number on explicit click.

**Stat tile** — tinted pastel card (`bg-brand-50` / `bg-accent-100` / `bg-blue-50`), label in
`text-xs text-ink-500`, value in `font-display text-2xl`, optional delta with a trend arrow, optional
mini sparkline on the right.

**Transaction row** — `[icon tile] [title + subtitle] ........ [amount]`. Title = counterparty name or
transaction type; subtitle = category/description + relative time. Icon per type: `ArrowDownLeft`
(deposit), `ArrowUpRight` (withdraw), `Send` (transfer). Rows are separated by whitespace, not rules.

**Data table (admin)** — `bg-surface-alt` header row, `text-xs uppercase tracking-wide text-ink-500`,
row height 64px, hover `bg-surface-alt`, status pills in the status column, a `MoreVertical` action
menu at the right edge.

### 2.4 Responsive

- `<768px`: sidebar becomes a slide-in drawer behind a hamburger; right rail stacks under main;
  tables switch to stacked cards (never horizontal-scroll a table on mobile).
- `768–1279px`: sidebar collapses to a 72px icon rail; two columns.
- `≥1280px`: full three-column layout as drawn.

### 2.5 Accessibility (cheap marks, do not skip)

- Every icon-only button gets `aria-label`.
- Never encode meaning in colour alone — credit/debit also carry a `+`/`-` sign and an icon.
- Visible focus ring on all interactive elements (`focus-visible:ring-2 ring-brand-400`).
- Modals: focus trapped, `Esc` closes, background scroll locked.
- Body text ≥14px; check contrast of `ink-500` on `surface-alt` (it passes; `ink-300` on white does
  not — use it for decorative text only).

---

## 3. Folder Structure

```
frontend/src/
├── main.jsx
├── App.jsx
├── index.css                  Tailwind directives + font imports
├── assets/
├── components/
│   ├── ui/                    Button, Input, Select, Modal, Card, Badge, Spinner,
│   │                          EmptyState, Pagination, Skeleton, ConfirmDialog
│   ├── layout/                Sidebar, Topbar, AppShell, MobileDrawer
│   ├── dashboard/             BankCard, StatTile, BalanceChart, TransactionRow,
│   │                          QuickActions, SpendBreakdown
│   └── transactions/          TransactionList, TransactionFilters, TransactionDetailModal
├── pages/
│   ├── auth/                  Login.jsx, Register.jsx
│   ├── user/                  Dashboard, Profile, Deposit, Withdraw, Transfer,
│   │                          TransactionHistory, Notifications
│   └── admin/                 AdminDashboard, AdminUsers, AdminAccounts, AdminTransactions
├── layouts/                   UserLayout.jsx, AdminLayout.jsx, AuthLayout.jsx
├── routes/                    AppRoutes.jsx, ProtectedRoute.jsx, AdminRoute.jsx
├── services/                  api.js, authService, userService, transactionService,
│                              upiService, adminService
├── context/                   AuthContext.jsx
├── hooks/                     useAuth, useApi, useDebounce, usePagination
└── utils/                     formatCurrency, formatDate, maskAccountNumber, validators, constants
```

---

## 4. API Layer

`services/api.js` — one axios instance, two interceptors, and that is the only place a token or a raw
URL is ever mentioned.

```js
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,                       // unwrap the { success, message, data } envelope here
  err => {
    const status = err.response?.status;
    if (status === 401) { logoutAndRedirect('/login'); }
    if (status === 403) { toast.error("You don't have access to that"); }
    return Promise.reject(err.response?.data ?? { message: 'Network error' });
  }
);
```

Because the interceptor unwraps and normalises errors, every component's catch block gets a
`{ message, errorCode, errors }` object regardless of what went wrong. Map `errors` straight onto
react-hook-form field errors so backend validation surfaces inline.

Service functions are thin and named after the use case — `transactionService.transfer(payload)`,
never a raw `api.post('/transactions/transfer')` inside a component.

**Storage note.** `localStorage` is the pragmatic choice for this project and is what the spec
assumes. It is readable by any XSS on the page — httpOnly cookies would be the production answer.
Write that sentence in your report; knowing the trade-off is the point.

---

## 5. Auth & Routing

`AuthContext` holds `{ user, token, loading, login, register, logout, isAuthenticated, isAdmin }`.

- On mount, rehydrate from `localStorage` and decode the JWT `exp`. If expired, clear it and treat the
  user as logged out **before** the first render — otherwise a protected page flashes into view and
  then bounces.
- Expose `loading` and render a full-page spinner while rehydrating. `ProtectedRoute` must not
  redirect during `loading` or a refresh on `/dashboard` will kick the user to `/login` every time.
  This is the single most common bug in this exact project.

Route map:

| Path | Guard |
|---|---|
| `/login`, `/register` | public; redirect to `/dashboard` if already authenticated |
| `/dashboard`, `/profile`, `/deposit`, `/withdraw`, `/transfer`, `/transactions`, `/notifications` | `ProtectedRoute` |
| `/admin`, `/admin/users`, `/admin/accounts`, `/admin/transactions` | `AdminRoute` (auth + `role === 'ADMIN'`) |
| `*` | NotFound |

`ProtectedRoute` preserves the attempted URL (`state: { from: location }`) and returns the user there
after login.

---

## 6. Pages

### Login
Centred card on a `bg-gradient-to-br from-brand-400 to-brand-600` page. Email + password, show/hide
toggle, submit button with a loading state, link to Register. On error, one inline banner using the
backend message — never a raw status code. Never say "wrong password" if the backend said "invalid
email or password"; mirror the backend's wording.

### Register
Username, email, password, confirm password. Client validation mirrors the backend rules exactly
(username 3–20 `[a-zA-Z0-9._]`, valid email, password 8–64 with a letter and a digit, confirm
matches). Client validation is UX, not security — the backend still validates everything.

On success: show a success screen with the generated account number and UPI ID before redirecting to
login. This is the moment the user learns their UPI ID; do not bury it.

### Dashboard (`GET /api/user/dashboard` — one call)
Left column: `BankCard`, quick actions (Deposit / Withdraw / Transfer), Recent Transactions (5 rows +
"See All").
Right rail: balance-trend area chart with a month selector, Income and Expense stat tiles, and a
spend-by-type breakdown.

Chart: Recharts `AreaChart`, brand-600 stroke, gradient fill `brand-400 → transparent`, no vertical
grid lines, horizontal grid `#E2E8F0` dashed, custom amber tooltip badge matching the reference.

### Deposit / Withdraw
Single amount input with a `₹` prefix, quick-amount chips (₹500 / ₹1,000 / ₹5,000 / ₹10,000),
optional description, current balance displayed above, projected balance after the operation
displayed live below. Confirm dialog before submit. On success: toast, refetch the dashboard, reset
the form. Withdraw disables submit when `amount > balance` and shows "Insufficient balance" inline
— but still handles the backend's 400, because balance can change between render and submit.

### Transfer
Tabs: **Account Number** | **UPI ID**.

UPI tab: on blur, call `GET /api/upi/resolve` and show a payee confirmation strip
("Paying **rahul** · rahul@obs") with a green check. Do not enable submit until the payee resolves.
Account-number tab has no resolve endpoint — validate the 10-digit format client-side and let the
backend 404 handle the rest.

Always show a confirmation modal restating payee, amount, and resulting balance before sending. A
transfer is irreversible in this system; make the user look at it once.

### Transaction History
Filter chips (All / Deposits / Withdrawals / Transfers), optional date range, paginated list, row
click opens a detail modal (reference, timestamp, type, amount, both parties, status, balance after).
Debounce the search input by 400ms. Empty state: illustration + "No transactions yet" + a Deposit CTA.

### Profile
Two cards: **Account Details** (read-only — account number with copy button, UPI ID with copy button,
created date, status) and **Personal Information** (editable username and email). A separate Change
Password card with current / new / confirm fields. State plainly in the account card that the UPI ID
is permanent and does not change with the username.

### Admin pages
Reuse the same shell with an admin sidebar. Dashboard = four stat tiles + a recent-activity table.
Users / Accounts / Transactions = searchable, filterable, paginated tables styled per §2.3. Deactivate
is a destructive action: red confirm dialog naming the user, and it must be reversible from the same
screen.

---

## 7. Formatting Rules

Put these in `utils/` and use them everywhere — no inline formatting in JSX.

- **Currency:** `new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2 })`
  → `₹1,52,340.00` (Indian grouping, matching the backend's rupee amounts).
- **Amount sign:** prefix `+` for CREDIT, `-` for DEBIT, using the `direction` field the backend
  already returns. Never re-derive direction on the client.
- **Dates:** `10 Aug 2026, 8:42 PM`. Relative ("2 hours ago") only for items under 24h old.
- **Account number:** `•••• 3357` by default; full value only after an explicit reveal/copy click.
- Amounts always render with 2 decimals and `tabular-nums` so columns align.

---

## 8. Required States

Every data-driven view implements all four. A screen that only handles the happy path is not done.

1. **Loading** — skeletons shaped like the final content, not a centred spinner.
2. **Empty** — icon + one-line explanation + the action that fixes it.
3. **Error** — the backend `message` + a Retry button. Never a blank screen.
4. **Success** — the content.

Every submit button disables while in flight and shows a spinner. Double-submitting a transfer must
be impossible.

---

## 9. Build Order

1. Vite + Tailwind + tokens + fonts; render a static Dashboard with hardcoded data until it matches
   the reference visually. Design first, wire second — it is much faster than restyling live data.
2. `api.js`, `AuthContext`, routing, guards.
3. Login + Register against the real backend.
4. AppShell (Sidebar, Topbar) + the real Dashboard.
5. Deposit + Withdraw.
6. Transfer (both tabs) + UPI resolve.
7. Transaction History + filters + pagination.
8. Profile + Change Password.
9. Admin pages.
10. Notifications (only if the backend module was built).
11. Polish pass: responsive check at 375 / 768 / 1440, all four states on every page, keyboard-only
    walkthrough of the transfer flow.

---

## 10. Definition of Done

- Every page works on a hard refresh at its own URL (no auth flash, no bounce to `/login`).
- No `console.log`, no unused imports, no hardcoded `localhost:8080` outside `.env`.
- No balance, account number, or token appears in a URL or query string.
- A `USER` account navigating to `/admin` is redirected, not shown a broken page.
- Logging out clears the token and makes the back button unable to reach a protected page.
- Every backend error code from `../backend/INSTRUCTIONS.md` §9 renders as readable text somewhere in
  the UI — test each one by triggering it deliberately.
