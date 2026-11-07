# Personal Finance Tracker with Analytics — Technical Design

## 1. MERN Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
│  React + Vite · React Router · Axios · Chart.js          │
│  Context API for state · Tailwind CSS for styling        │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST (JSON)
                           │ Bearer JWT in Authorization header
┌──────────────────────────▼──────────────────────────────┐
│                    SERVER (Node + Express)                │
│  Express Router · JWT Middleware · Mongoose ODM          │
│  bcrypt · express-validator · cors · dotenv              │
└──────────────────────────┬──────────────────────────────┘
                           │ Mongoose
┌──────────────────────────▼──────────────────────────────┐
│                  DATABASE (MongoDB)                       │
│  Collections: users · transactions · budgets             │
│  MongoDB Atlas (cloud) or local MongoDB                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Project Directory Structure

```
personal-finance-tracker/
├── requirements.md
├── design.md
├── tasks.md
├── .kiro/
│   └── steering/
│       ├── coding-standards.md
│       └── security.md
│
├── server/                         # Express backend
│   ├── package.json
│   ├── .env
│   ├── server.js                   # Entry point
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                 # JWT verify middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── budgets.js
│   │   └── analytics.js
│   └── controllers/
│       ├── authController.js
│       ├── transactionController.js
│       ├── budgetController.js
│       └── analyticsController.js
│
└── client/                         # React frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axios.js            # Axios instance with interceptors
        ├── context/
        │   └── AuthContext.jsx     # Auth state (user, token, login, logout)
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   ├── Sidebar.jsx
        │   │   └── PrivateRoute.jsx
        │   ├── common/
        │   │   ├── Spinner.jsx
        │   │   ├── Modal.jsx
        │   │   └── Alert.jsx
        │   └── charts/
        │       ├── IncomeExpenseChart.jsx
        │       └── CategoryPieChart.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Transactions.jsx
            ├── Budgets.jsx
            └── Analytics.jsx
```

---

## 3. Frontend Component Architecture

### 3.1 Routing (React Router v6)
```
/ (public)              → redirect to /dashboard or /login
/login                  → Login page
/register               → Register page
/dashboard              → Dashboard (private)
/transactions           → Transaction list + CRUD (private)
/budgets                → Budget management (private)
/analytics              → Analytics & charts (private)
```

### 3.2 State Management
- `AuthContext`: holds `user`, `token`, `login()`, `logout()`, `loading`.
- Component-level state (`useState`) for forms, modals, and filter state.
- Data fetching done directly in components using `useEffect` + Axios.

### 3.3 Component Hierarchy
```
App
├── AuthContext.Provider
│   ├── Navbar
│   ├── Sidebar (on authenticated pages)
│   └── Routes
│       ├── /login → Login
│       ├── /register → Register
│       └── PrivateRoute wrapper
│           ├── /dashboard → Dashboard
│           │   ├── SummaryCards (income, expense, balance)
│           │   ├── RecentTransactions
│           │   ├── IncomeExpenseChart
│           │   └── BudgetOverview
│           ├── /transactions → Transactions
│           │   ├── FilterBar
│           │   ├── TransactionTable
│           │   └── TransactionModal (add/edit)
│           ├── /budgets → Budgets
│           │   ├── BudgetCard (per budget)
│           │   └── BudgetModal (add/edit)
│           └── /analytics → Analytics
│               ├── MonthlyTrendChart
│               ├── CategoryPieChart
│               └── MonthlySummaryTable
```

---

## 4. Backend Architecture

### 4.1 Express App Structure
- `server.js` — creates Express app, registers middleware (cors, json parser), mounts routes, starts server.
- `config/db.js` — connects to MongoDB via Mongoose.
- `middleware/auth.js` — extracts Bearer token, verifies JWT, attaches `req.user`.
- `models/` — Mongoose schemas with validation.
- `routes/` — thin route files that call controllers.
- `controllers/` — business logic and DB queries.

### 4.2 Middleware Stack (per request)
```
Request → cors() → express.json() → route match → auth middleware (protected) → controller → response
```

---

## 5. MongoDB Database Schema

### 5.1 User Collection
```javascript
{
  _id: ObjectId,
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },           // bcrypt hash
  createdAt: { type: Date, default: Date.now }
}
```

### 5.2 Transaction Collection
```javascript
{
  _id:         ObjectId,
  userId:      { type: ObjectId, ref: 'User', required: true, index: true },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  amount:      { type: Number, required: true, min: 0.01 },
  category:    { type: String, required: true },
  description: { type: String, maxlength: 200, default: '' },
  date:        { type: Date, required: true, default: Date.now },
  createdAt:   { type: Date, default: Date.now }
}
// Index: { userId: 1, date: -1 }
```

### 5.3 Budget Collection
```javascript
{
  _id:         ObjectId,
  userId:      { type: ObjectId, ref: 'User', required: true },
  category:    { type: String, required: true },
  month:       { type: Number, required: true, min: 1, max: 12 },
  year:        { type: Number, required: true },
  limitAmount: { type: Number, required: true, min: 1 },
  createdAt:   { type: Date, default: Date.now }
}
// Unique index: { userId: 1, category: 1, month: 1, year: 1 }
```

---

## 6. API Endpoint Documentation

### Auth Routes — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| GET | `/me` | Yes | Get current user profile |

**POST /api/auth/register** — Body: `{ name, email, password }`  
Response 201: `{ token, user: { _id, name, email } }`

**POST /api/auth/login** — Body: `{ email, password }`  
Response 200: `{ token, user: { _id, name, email } }`

---

### Transaction Routes — `/api/transactions`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List transactions (with filters & pagination) |
| POST | `/` | Yes | Create transaction |
| PUT | `/:id` | Yes | Update transaction |
| DELETE | `/:id` | Yes | Delete transaction |

**GET /api/transactions** — Query params: `type`, `category`, `startDate`, `endDate`, `search`, `page` (default 1), `limit` (default 20)  
Response 200: `{ transactions: [...], total, page, pages }`

**POST /api/transactions** — Body: `{ type, amount, category, description?, date? }`  
Response 201: `{ transaction }`

---

### Budget Routes — `/api/budgets`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List all budgets with actual spending |
| POST | `/` | Yes | Create budget |
| PUT | `/:id` | Yes | Update budget limit |
| DELETE | `/:id` | Yes | Delete budget |

**GET /api/budgets** — Query params: `month`, `year`  
Response 200: `{ budgets: [{ ...budget, actualSpent, percentage }] }`

---

### Analytics Routes — `/api/analytics`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/summary` | Yes | Current month totals |
| GET | `/monthly` | Yes | Last 6 months income/expense |
| GET | `/categories` | Yes | Expense by category (current month) |

**GET /api/analytics/summary** — Query params: `month`, `year`  
Response 200: `{ income, expenses, balance, savingsRate }`

**GET /api/analytics/monthly**  
Response 200: `{ months: [{ month, year, income, expenses }] }` (last 6)

**GET /api/analytics/categories** — Query params: `month`, `year`  
Response 200: `{ categories: [{ category, total }] }`

---

## 7. Authentication Workflow

```
1. Client sends POST /api/auth/login { email, password }
2. Server looks up user by email
3. Server compares password with bcrypt.compare()
4. If valid → sign JWT: { userId: user._id } with 7d expiry
5. Return { token, user } to client
6. Client stores token in localStorage
7. Client attaches token to every request: Authorization: Bearer <token>
8. Server middleware (auth.js) extracts token from header
9. jwt.verify() decodes token, attaches req.user = { userId }
10. Controller uses req.user.userId to scope all DB queries
```

---

## 8. Data Flow Diagrams

### Add Transaction Flow
```
User fills form → POST /api/transactions
→ auth middleware verifies JWT
→ express-validator validates body
→ transactionController.create() saves to MongoDB
→ returns 201 { transaction }
→ React updates transaction list state
→ Dashboard re-fetches summary totals
```

### Dashboard Load Flow
```
User navigates to /dashboard
→ Dashboard component mounts
→ useEffect fires 3 parallel requests:
    GET /api/analytics/summary
    GET /api/analytics/monthly
    GET /api/transactions?limit=5
→ State updates with data
→ SummaryCards, Charts, RecentTransactions render
```

---

## 9. Error Handling

### Server-Side
- All controllers wrapped in try/catch.
- Validation errors return 400 with `{ errors: [{ msg, field }] }`.
- Auth errors return 401 `{ message: 'Unauthorized' }`.
- Not-found errors return 404 `{ message: 'Resource not found' }`.
- Server errors return 500 `{ message: 'Server error' }`.

### Client-Side
- Axios interceptor catches 401 → clears token → redirects to `/login`.
- Form validation before submission (required fields, amount > 0).
- Error messages displayed in `Alert` component near the form.
- Loading spinners shown while requests are in-flight.

---

## 10. Security Practices

- Passwords hashed with bcrypt (salt rounds: 10).
- JWT secret stored in `.env` (never committed).
- CORS restricted to frontend origin in production.
- All user-scoped queries filter by `userId` from JWT (not from request body).
- `express-validator` sanitizes and validates all inputs.
- `.env` added to `.gitignore`.
