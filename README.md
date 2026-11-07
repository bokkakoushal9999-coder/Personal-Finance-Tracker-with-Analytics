# Personal Finance Tracker with Analytics

A complete, production-ready full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed for comprehensive personal financial planning, cash flow tracking, budget monitoring, and automated rule-based cash flow analytics.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Security
- **JWT-Based Authentication**: Secure stateless token issuance and verification.
- **Password Encryption**: Sensitive passwords hashed using `bcryptjs` with salt rounds.
- **Route Protection**: Dedicated React Router `<PrivateRoute>` and Express `authMiddleware` guarding all financial APIs.
- **Strict Data Privacy**: All transactions, budgets, and analytical metrics are isolated strictly to the authenticated `userId`.
- **1-Click Demo Login**: Pre-configured evaluator account for instant, seamless testing without manual registration.

### 2. 📊 Executive Financial Dashboard
- **5 Summary Metric Cards**: Total Balance, Month Income, Month Expenses, Monthly Savings (with savings rate %), and Monthly Budget utilization.
- **Quick-Add Transaction Modal**: Instant logging of Income or Expense entries directly from the dashboard.
- **Interactive Visualizations**: 6-month historical Income vs. Expense comparison (Recharts Bar) and real-time Expense Category distribution (Recharts Pie).
- **Recent Transactions Feed**: Live stream of the latest inflow and outflow records with status badges.
- **Active Budget Utilization**: Visual progress bars with dynamic warning flags when approaching or exceeding limits.

### 3. 💚 Dedicated Income Management (`/income`)
- Complete CRUD operations: Add, Edit, Delete, and View income history.
- Categorization tailored for earnings:
  - `Salary`
  - `Freelancing`
  - `Business`
  - `Scholarship`
  - `Other`
- Real-time search by title or description, category filtering, and multi-field sorting (Date, Amount).
- One-click CSV export for offline financial records.

### 4. ❤️ Dedicated Expense Management (`/expenses`)
- Complete CRUD operations: Add, Edit, Delete, and View expenses.
- Standardized expense categories:
  - `Food`
  - `Transportation`
  - `Education`
  - `Shopping`
  - `Entertainment`
  - `Healthcare`
  - `Bills`
  - `Other`
- Multi-criteria filtering, search, sorting, and CSV export.
- Confirmation dialogs before deletion to avoid accidental record loss.

### 5. 🎯 Budget Management (`/budgets`)
- Category-wise monthly budget allocations.
- Dynamic spending calculations via MongoDB aggregation pipelines (`$match`, `$group`).
- Visual progress bars with adaptive threshold coloring:
  - 🟢 **Healthy**: `< 80%` of budget spent.
  - 🟡 **Warning**: `80% - 99%` approaching monthly limit.
  - 🔴 **Over Budget**: `≥ 100%` budget exceeded (triggers prominent alert banners).
- Month and Year selector for reviewing historical budget adherence.

### 6. 📈 Recharts Analytics Dashboard (`/analytics`)
Features four interactive Recharts powered entirely by database aggregation:
1. **Pie Chart**: Expense distribution by category with responsive tooltips and legend.
2. **Bar Chart**: Monthly Income versus Expenses side-by-side comparison.
3. **Line Chart**: Monthly net savings trends with baseline zero reference line.
4. **Area Chart**: Cumulative net balance growth with smooth gradient fill.
- **Timeframe Filters**: `Weekly`, `Monthly`, `Yearly`, and `Custom date range`.
- **Detailed Category Spending Portfolio**: Complete breakdown table showing exact amounts and percentage share of total outflow.

### 7. 💡 Rule-Based Financial Insights Engine
- **Financial Health Score (0-100)**: Computed based on savings rate, budget discipline, and positive net cash flow.
- **Highest Spending Category**: Identifies top expenditure area and its proportion of total monthly spending.
- **Savings Rate Intelligence**: Contextual evaluations against the recommended 20% savings rule.
- **Overspending Alerts**: Automatic warnings for exceeded category budgets.
- **Actionable Suggestions**: Rule-based recommendations to curb discretionary spending (e.g. Shopping, Entertainment) and automate emergency funds.

### 8. 🎨 UI/UX & Preferences
- **Dark & Light Mode**: Seamless theme switching with persistent state via localStorage.
- **Indian Rupee (₹) Display**: All values formatted according to standard Indian numbering format (e.g. `₹75,000.00`).
- **Responsive Layout**: Clean desktop sidebar and mobile-friendly collapsible drawer.
- **User Settings (`/settings`)**: Profile updates (Name, Email), Password change form, and active preferences.

---

## 🚀 Demo Account Credentials

A pre-seeded demonstration account is populated with 6 months of historical transactions and category budgets:

| Field | Value |
|---|---|
| **Email** | `demo@financetracker.com` |
| **Password** | `Password123!` |
| **Name** | Alex Sharma |
| **1-Click Login** | Available on the login page via the **"1-Click Demo Account Login"** button |

*(All demo data is strictly simulated and does not represent real financial accounts).*

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom Dark Mode classes
- **Routing**: React Router DOM v6
- **Analytics & Charts**: Recharts
- **HTTP Client**: Axios (configured with auth bearer interceptors)

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation & Safety**: Clean input sanitization and schema validators

---

## 📁 Project Architecture

```
Personal Finance Tracker with Analytics/
├── client/                          # Frontend React + Vite application
│   ├── public/
│   │   └── favicon.svg              # Custom SVG currency favicon
│   ├── src/
│   │   ├── api/                     # Axios configuration & interceptors
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── charts/              # Recharts implementations
│   │   │   │   ├── BalanceAreaChart.jsx
│   │   │   │   ├── CategoryPieChart.jsx
│   │   │   │   ├── IncomeExpenseChart.jsx
│   │   │   │   └── SavingsLineChart.jsx
│   │   │   ├── common/              # Alert, Modal, Spinner widgets
│   │   │   ├── dashboard/           # FinancialInsights component
│   │   │   └── layout/              # Navbar, Sidebar, PrivateRoute
│   │   ├── context/                 # AuthContext & ThemeContext
│   │   ├── pages/                   # Dashboard, Income, Expenses, Budgets, Analytics, Settings, Login, Register
│   │   ├── utils/                   # Currency formatters & CSV export utilities
│   │   ├── App.jsx                  # Main routing tree
│   │   ├── index.css                # Tailwind directives & components
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js               # Proxy setup (/api -> http://localhost:5001)
├── server/                          # Backend Express + MongoDB application
│   ├── config/                      # MongoDB connection handler
│   ├── controllers/                 # authController, transactionController, budgetController, analyticsController
│   ├── middleware/                  # authMiddleware, errorMiddleware
│   ├── models/                      # User, Transaction, Budget schemas
│   ├── routes/                      # REST endpoints for auth, transactions, budgets, analytics
│   ├── utils/                       # seedData.js, insightsHelper.js, testSuite.js
│   ├── .env                         # Server environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── README.md
```

---

## 💻 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 1. Database Setup
Ensure MongoDB is running locally:
```bash
mongod --dbpath server/data/db --port 27017
```

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (pre-configured defaults):
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/personal_finance_tracker
   JWT_SECRET=finance_tracker_jwt_secret_key_production_grade_9988
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
4. Seed the demo database with 6 months of historical transactions & budgets:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   *The API will be available at `http://localhost:5001/api`.*

### 3. Frontend Setup
1. In a separate terminal, navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:5173`.*

### 4. Streamlit Deployment Setup
Run the application via Streamlit:
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```
*The Streamlit application will open at `http://localhost:8501`.*

---

## 🧪 Automated Integration Tests

A comprehensive integration test suite verifies all API endpoints and database integrity:

```bash
cd server
node utils/testSuite.js
```

**Results**:
- ✅ Health endpoint check
- ✅ User registration & token generation
- ✅ Demo account authentication
- ✅ Protected `/auth/me` user profile retrieval
- ✅ Transaction CRUD operations, filtering, and pagination
- ✅ Budget lifecycle and aggregation spending formulas
- ✅ Analytics summary, 6-month monthly trends, and category distribution
- **100% Pass Rate (38/38 tests passing)**

---

## 📄 License
This project is open-source and intended for academic demonstration and portfolio presentation.
