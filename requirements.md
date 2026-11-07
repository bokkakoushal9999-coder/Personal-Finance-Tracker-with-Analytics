# Personal Finance Tracker with Analytics — Requirements

## 1. Project Overview

A full-stack web application built on the MERN stack (MongoDB, Express.js, React.js, Node.js) that enables users to track personal income and expenses, manage budgets, and visualize financial data through interactive analytics dashboards. Targeted at college students and individuals who need a simple but powerful tool to understand their spending habits.

**Deadline:** November 6, 2026  
**Stack:** MongoDB · Express.js · React.js · Node.js  
**Authentication:** JWT-based stateless auth

---

## 2. Functional Requirements

### 2.1 Authentication
- FR-AUTH-01: Users can register with name, email, and password.
- FR-AUTH-02: Users can log in with email and password.
- FR-AUTH-03: Authenticated users receive a JWT token valid for 7 days.
- FR-AUTH-04: Protected routes return 401 if the token is missing or invalid.
- FR-AUTH-05: Users can log out (token cleared client-side).
- FR-AUTH-06: Passwords are hashed using bcrypt before storage.

### 2.2 Transaction Management
- FR-TXN-01: Users can add an income or expense transaction with: amount, category, description, date, and type (income/expense).
- FR-TXN-02: Users can edit any of their existing transactions.
- FR-TXN-03: Users can delete a transaction.
- FR-TXN-04: Users can view a paginated list of all their transactions.
- FR-TXN-05: Users can filter transactions by type (income/expense), category, and date range.
- FR-TXN-06: Users can search transactions by description keyword.
- FR-TXN-07: Each transaction belongs to exactly one user (data isolation).

### 2.3 Budget Management
- FR-BUD-01: Users can create a budget for a specific category and month/year.
- FR-BUD-02: Users can set a spending limit (amount) for each budget.
- FR-BUD-03: Users can view all budgets with current spending vs. limit.
- FR-BUD-04: Users can edit or delete a budget.
- FR-BUD-05: The system calculates and displays the percentage of budget used.
- FR-BUD-06: A visual indicator (progress bar) shows budget utilization.

### 2.4 Analytics & Reporting
- FR-ANA-01: Dashboard shows total income, total expenses, and net balance for the current month.
- FR-ANA-02: A bar or line chart shows income vs. expenses over the last 6 months.
- FR-ANA-03: A pie/doughnut chart shows expense breakdown by category.
- FR-ANA-04: Users can view monthly summaries (income, expense, savings rate).
- FR-ANA-05: Recent transactions (last 5) are shown on the dashboard.
- FR-ANA-06: Budget utilization summary is shown on the dashboard.

### 2.5 Categories
- FR-CAT-01: Predefined expense categories: Food, Transport, Housing, Entertainment, Health, Education, Shopping, Utilities, Other.
- FR-CAT-02: Predefined income categories: Salary, Freelance, Investment, Gift, Other.

---

## 3. Non-Functional Requirements

- NFR-01 **Performance:** API responses should return within 500ms for typical queries.
- NFR-02 **Security:** All passwords hashed; JWTs signed with a secret; CORS configured.
- NFR-03 **Scalability:** MongoDB schema supports adding new categories without migration.
- NFR-04 **Usability:** Responsive UI that works on mobile (375px) and desktop (1440px).
- NFR-05 **Maintainability:** Code organized in feature-based folders; clear separation of concerns.
- NFR-06 **Reliability:** Input validation on both client and server; meaningful error messages.
- NFR-07 **Availability:** Application runs locally for demo without external dependencies beyond MongoDB Atlas or local MongoDB.

---

## 4. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | new user | register an account | I can start tracking my finances |
| US-02 | returning user | log in securely | I can access my private financial data |
| US-03 | logged-in user | add an income transaction | I can record money I received |
| US-04 | logged-in user | add an expense transaction | I can record money I spent |
| US-05 | logged-in user | edit a transaction | I can correct mistakes |
| US-06 | logged-in user | delete a transaction | I can remove incorrect entries |
| US-07 | logged-in user | filter transactions by category | I can see spending in a specific area |
| US-08 | logged-in user | create a monthly budget | I can plan my spending |
| US-09 | logged-in user | see how much of my budget I've used | I can avoid overspending |
| US-10 | logged-in user | see a chart of income vs expenses | I can understand my financial trend |
| US-11 | logged-in user | see expense breakdown by category | I can identify where I spend most |
| US-12 | logged-in user | view a financial summary dashboard | I can get a quick overview of my finances |

---

## 5. Acceptance Criteria

### AC-01: User Registration
- Given a valid name, email, and password (min 6 chars), when I submit the form, then I am registered and redirected to the dashboard.
- Given an already-registered email, when I submit, then I see "Email already in use."
- Given an invalid email format, when I submit, then I see a validation error.

### AC-02: User Login
- Given valid credentials, when I log in, then I receive a JWT and am redirected to the dashboard.
- Given invalid credentials, when I log in, then I see "Invalid email or password."

### AC-03: Add Transaction
- Given I fill all required fields, when I submit, then the transaction appears in my list and the dashboard totals update.
- Given I leave amount empty, when I submit, then I see "Amount is required."

### AC-04: Budget Tracking
- Given I create a budget of $500 for Food in November, when I add $300 of Food expenses, then the budget shows 60% used.
- Given spending exceeds budget, then the progress bar turns red.

### AC-05: Analytics
- Given I have transactions for the last 6 months, when I view analytics, then the trend chart shows the correct monthly totals.

---

## 6. Authentication Requirements

- Passwords must be at least 6 characters.
- JWT tokens expire after 7 days.
- Token is stored in `localStorage` on the client.
- All `/api/*` routes except `/api/auth/register` and `/api/auth/login` require a valid Bearer token.
- Server validates token on every protected request via Express middleware.

---

## 7. Transaction Management Requirements

- Amount must be a positive number.
- Date defaults to today if not provided.
- Category must be one of the predefined values.
- Type must be `income` or `expense`.
- Description is optional (max 200 characters).
- Transactions are sorted by date descending by default.

---

## 8. Analytics and Reporting Requirements

- Monthly summary aggregates are computed server-side using MongoDB aggregation pipelines.
- Charts are rendered using Chart.js via react-chartjs-2.
- Data for the last 6 months is always available on the analytics page.
- All analytics queries are scoped to the authenticated user.

---

## 9. Budget Management Requirements

- A budget is defined by: userId, category, month (1–12), year, and limitAmount.
- One budget per category per month per user (enforced by unique index).
- Actual spending is computed dynamically by summing expense transactions matching category + month + year.
- Budget progress is: `(actualSpent / limitAmount) * 100`.
- Over-budget budgets are highlighted in red.
