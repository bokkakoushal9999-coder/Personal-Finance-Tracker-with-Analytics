# Personal Finance Tracker — Implementation Tasks

**Deadline:** November 6, 2026  
**Stack:** MERN (MongoDB · Express · React · Node)  
**Server port:** 5001 (set in `server/.env`)  
**Last full audit:** November 6, 2026

---

## Audit — Bugs Found & Fixed

| # | File | Bug | Severity | Status |
|---|------|-----|----------|--------|
| B-01 | `analyticsController.js` | `getDashboard` declared twice; second copy required non-existent `../utils/insightsHelper` — would crash `analyticsRoutes` on startup | 🔴 Critical | ✅ Fixed — duplicate removed; `insightsHelper.js` now exists, `getInsights` wired to route |
| B-02 | `analyticsController.js` | `getMonthlyAnalytics` returned `{ month: 'Jan', expense }` — string label, no `year`, wrong key | 🔴 Critical | ✅ Fixed — returns `{ month: number, year: number, income, expenses }` |
| B-03 | `Transactions.jsx` | `setTotal(res.data?.totalCount …)` — server sends `total`, not `totalCount`; pagination count showed wrong value | 🟡 Minor | ✅ Fixed — reads `res.data?.total` first |
| B-04 | `SavingsLineChart.jsx` | Chart X-axis used raw numeric `d.month` (e.g. `11`) as label | 🟡 Minor | ✅ Fixed — converts to `"Nov 2026"` same as `IncomeExpenseChart` |
| B-05 | `BalanceAreaChart.jsx` | Same issue — raw numeric month on X-axis | 🟡 Minor | ✅ Fixed |

---

## Spec vs Implementation — Inconsistencies

| Area | spec/design.md says | Actual implementation | Impact |
|------|---------------------|----------------------|--------|
| Middleware export | `middleware/auth.js` exporting `auth` | `middleware/authMiddleware.js` exporting `{ protect }` | None — `server.js` correctly imports the real file |
| Route filenames | `routes/auth.js` etc. | `routes/authRoutes.js` etc. | None — `server.js` correctly imports the real files |
| JWT payload key | `{ userId }` | `{ id: userId }` in `authController`; `authMiddleware` reads `decoded.id \|\| decoded.userId` | None — both are handled |
| Categories (spec) | Income: Salary, Freelance, Investment, Gift, Other | Actual: Salary, Freelancing, Business, Scholarship, Other | ⚠️ Different — frontend and backend both use `formatters.js` list; consistent within the app |
| Categories (spec) | Expense: Food, Transport, Housing… | Actual: Food, Transportation, Education, Shopping, Entertainment, Healthcare, Bills, Other | ⚠️ Different — consistent within the app |
| Currency | Spec implies USD ($) | Actual uses INR (₹) with `en-IN` locale | ✅ Consistent — formatted via `formatters.js` |
| Server port | `PORT=5000` in `.env` example | Actual `.env` has `PORT=5001` | ✅ Works — Vite proxy (`vite.config.js`) must match |
| Vite proxy target | Should point to server port | Need to verify | See task below |

---

## Phase 1 — Project Setup ✅

- [x] `requirements.md` — project requirements
- [x] `design.md` — technical architecture
- [x] `tasks.md` — implementation checklist
- [x] `.kiro/steering/coding-standards.md`
- [x] `.kiro/steering/security.md`
- [x] `server/` — Express project scaffolded
- [x] `client/` — Vite + React project scaffolded

---

## Phase 2 — Backend ✅

### 2.1 Foundation
- [x] `server/server.js` — clean single-copy: cors, morgan, 4 route groups, error handlers, `connectDB().then(listen)`
- [x] `server/config/db.js` — Mongoose connection with exit on failure
- [x] `server/.env` — `PORT=5001`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`
- [x] `server/middleware/authMiddleware.js` — JWT verify, `User.findById` lookup, attaches full `req.user` document
- [x] `server/middleware/errorMiddleware.js` — `notFound` + `errorHandler` (CastError, duplicate key, ValidationError)
- [x] `server/utils/insightsHelper.js` — rule-based financial insights (health score, alerts, suggestions)
- [x] `server/utils/seedData.js` — seed script for demo data

### 2.2 Models
- [x] `server/models/User.js` — name, email, password; bcrypt `pre('save')` hook; `matchPassword()`
- [x] `server/models/Transaction.js` — userId, type, amount, category, description, **title**, date; compound index
- [x] `server/models/Budget.js` — userId, category, month, year, limitAmount, monthlyLimit; unique index

### 2.3 Auth (`authRoutes.js` + `authController.js`)
- [x] `POST /api/auth/register` — validate, hash, create user, return JWT
- [x] `POST /api/auth/login` — validate, compare, return JWT
- [x] `GET /api/auth/me` — current user (protected)
- [x] `PUT /api/auth/profile` — update name/email/password (protected)

### 2.4 Transactions (`transactionRoutes.js` + `transactionController.js`)
- [x] `GET /api/transactions` — `{ transactions, total, page, pages }`, full filter + pagination
- [x] `GET /api/transactions/:id` — single transaction with ownership check
- [x] `POST /api/transactions` — create (supports `title` field)
- [x] `PUT /api/transactions/:id` — update own transaction
- [x] `DELETE /api/transactions/:id` — delete own transaction

### 2.5 Budgets (`budgetRoutes.js` + `budgetController.js`)
- [x] `GET /api/budgets?month&year` — `{ budgets: [...] }` enriched with `actualSpent`, `percentage`, `isOverBudget`
- [x] `POST /api/budgets` — create, duplicate-check, returns `{ ...budget, budget }`
- [x] `PUT /api/budgets/:id` — update `limitAmount` + `monthlyLimit`
- [x] `DELETE /api/budgets/:id` — ownership check + delete

### 2.6 Analytics (`analyticsRoutes.js` + `analyticsController.js`)
- [x] `GET /api/analytics/summary?month&year` — `{ income, expenses, balance, savingsRate, month, year }`
- [x] `GET /api/analytics/monthly` — `{ months: [{ month: number, year: number, income, expenses }] }`
- [x] `GET /api/analytics/categories?month&year` — `{ categories: [{ category, total }] }`
- [x] `GET /api/analytics/insights` — rule-based insights via `insightsHelper.generateFinancialInsights`

---

## Phase 3 — Frontend ✅

### 3.1 Foundation
- [x] `services/api.js` — Axios base instance with Bearer interceptor and 401 redirect
- [x] `api/axios.js` — second Axios instance (same config; both used by different pages)
- [x] `context/AuthContext.jsx` — user/token state; `login()`, `register()`, `logout()`; localStorage persistence
- [x] `context/ThemeContext.jsx` — dark/light mode with `toggleTheme()`
- [x] `App.jsx` — React Router v6, `AppLayout` with collapsible sidebar, `ThemeProvider` + `AuthProvider`
- [x] `index.css` — Tailwind directives, dark mode, `.btn-*`, `.card`, `.input`, `.badge-*` component layer
- [x] `utils/formatters.js` — `formatCurrency()` (INR), `formatDate()`, `INCOME_CATEGORIES`, `EXPENSE_CATEGORIES`
- [x] `utils/exportCsv.js` — CSV export with blob download

### 3.2 Layout
- [x] `Navbar.jsx` — logo, user avatar, mobile sidebar toggle, logout
- [x] `Sidebar.jsx` — 7 nav items, collapsible, mobile overlay
- [x] `CodeBar.jsx` — bottom bar (mobile navigation aid)
- [x] `PrivateRoute.jsx` — redirects to `/login` when unauthenticated
- [x] `Spinner.jsx`, `Modal.jsx`, `Alert.jsx` — reusable UI primitives

### 3.3 Auth Pages
- [x] `Login.jsx` — controlled form, error display, spinner
- [x] `Register.jsx` — name + email + password + confirm, client-side validation
- [x] `LandingPage.jsx` — public landing page at `/`

### 3.4 Dashboard (`Dashboard.jsx`)
- [x] 5 executive summary cards (Balance, Income, Expenses, Savings, Budget utilization)
- [x] Quick Add modal (add income/expense directly from dashboard)
- [x] `IncomeExpenseChart` — Recharts Bar (6-month trend)
- [x] `CategoryPieChart` — Recharts Doughnut
- [x] `FinancialInsights` — health score + rule-based alerts + suggestions
- [x] Recent transactions feed (last 5)
- [x] Budget utilization progress bars

### 3.5 Transactions (`Transactions.jsx`)
- [x] Table with date, title, category, type badge, amount
- [x] Add/Edit via `TransactionForm` modal
- [x] Delete confirmation modal
- [x] Filters: type, category, date range, keyword search
- [x] Pagination (prev/next)
- [x] CSV export

### 3.6 Income (`Income.jsx`)
- [x] Income-only filtered view of transactions
- [x] Summary cards: total revenue, count, highest payout
- [x] Add/Edit/Delete with confirmation modal
- [x] Filter by category, sort by date/amount
- [x] CSV export

### 3.7 Expenses (`Expenses.jsx`)
- [x] Expense-only filtered view (mirrors Income page structure)

### 3.8 Budgets (`Budgets.jsx`)
- [x] Month/year selector
- [x] 4 aggregate summary cards (total budget, spent, remaining, utilization %)
- [x] Over-budget banner when any category is exceeded
- [x] `BudgetCard` — progress bar with green/amber/red thresholds (80%/100%)
- [x] Add/Edit/Delete with confirmation modals

### 3.9 Analytics (`Analytics.jsx`)
- [x] Timeframe tabs: Weekly / Monthly / Yearly / Custom date range
- [x] Month/year picker
- [x] 4 stat cards (income, expenses, balance, savings rate)
- [x] **Chart 1** — Recharts Pie: expense by category
- [x] **Chart 2** — Recharts Bar: income vs expenses (6 months)
- [x] **Chart 3** — Recharts Line: net savings trend *(X-axis label fixed)*
- [x] **Chart 4** — Recharts Area: cumulative balance *(X-axis label fixed)*
- [x] Detailed category spending portfolio table

### 3.10 Settings (`Settings.jsx`)
- [x] Dark/light theme toggle
- [x] Profile update (name + email)
- [x] Password change
- [x] Demo account info box

---

## Phase 4 — Build & Integration ✅

- [x] Server `npm install` — all dependencies installed
- [x] Client `npm install --ignore-scripts` + esbuild postinstall
- [x] Client `npm run build` — Vite build succeeds (2167 modules, 6 chunks)
- [x] All 4 server route files verified to `require()` without errors

---

## Phase 5 — Remaining Actions Before Demo

### Critical — Must Do
- [ ] **Check Vite proxy port** — open `client/vite.config.js`, confirm `target: 'http://localhost:5001'` matches server `.env` `PORT=5001`
- [ ] **Start server** — `npm run dev` in `server/` — confirm `MongoDB Connected` log
- [ ] **Start client** — `npm run dev` in `client/` — confirm Vite serves on port 5173

### Manual Test Checklist
- [ ] Register new account → redirects to dashboard
- [ ] Login with valid credentials; invalid shows error
- [ ] Quick Add (dashboard) — add income and expense; cards update
- [ ] Transactions — add, edit, delete; filters and search work; pagination works; CSV exports
- [ ] Income page — add income; summary cards update
- [ ] Expenses page — add expense; category appears in Analytics pie
- [ ] Budgets — create budget; add expense in that category; progress bar updates; exceed limit → red + banner
- [ ] Analytics — all 4 charts render; X-axis shows "Nov 2026" not "11"; timeframe tabs switch
- [ ] Settings — toggle dark mode; update name; change password
- [ ] Logout → redirect to `/login`; back-button doesn't re-enter dashboard
- [ ] Responsive check — sidebar collapses on mobile width, cards stack

### Optional Polish
- [ ] Seed demo data with `npm run seed` in `server/` for a richer demo presentation
- [ ] Verify `LandingPage.jsx` renders correctly at `/` for first impression

---

## MVP Completion Status

| Feature | Status |
|---------|--------|
| User registration & login (JWT) | ✅ Done |
| Protected routes + 401 auto-redirect | ✅ Done |
| Add / Edit / Delete transactions | ✅ Done |
| Dedicated Income & Expenses pages | ✅ Done |
| Transaction filters, search, pagination, CSV export | ✅ Done |
| Dashboard with 5 cards + charts | ✅ Done |
| Rule-based financial insights engine | ✅ Done |
| Budget creation + live progress tracking | ✅ Done |
| Analytics page with 4 Recharts visualizations | ✅ Done |
| Dark mode + settings page | ✅ Done |
| Production build passing (2167 modules) | ✅ Done |

---

## Deferred (Post-MVP)

- Automated unit / integration tests
- Email verification on register
- Recurring / scheduled transactions
- Multi-currency support
- Transaction attachments / receipts
