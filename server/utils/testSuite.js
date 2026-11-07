const http = require('http');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/transactions', require('../routes/transactionRoutes'));
app.use('/api/budgets', require('../routes/budgetRoutes'));
app.use('/api/analytics', require('../routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Personal Finance Tracker API is running' });
});

async function runTests() {
  console.log('==================================================');
  console.log(' Starting Personal Finance Tracker Full Integration Tests');
  console.log('==================================================');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[Test Server] Running on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('\n--- 1. Testing Health Endpoint ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(healthData.status === 'ok', 'Health status is ok');

    // 2. Auth: Register
    console.log('\n--- 2. Testing Auth Registration ---');
    const testEmail = `tester_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Tester',
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Registration returns 201 Created');
    assert(Boolean(regData.token), 'Registration returns JWT token');
    assert(regData.user.email === testEmail, 'User email matches registered email');

    // 3. Auth: Login
    console.log('\n--- 3. Testing Auth Login ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@financetracker.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Demo login returns 200 OK');
    assert(Boolean(loginData.token), 'Demo login returns valid JWT');
    const demoToken = loginData.token;

    // 4. Auth: Profile (/me)
    console.log('\n--- 4. Testing Protected Profile (/auth/me) ---');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Protected /me returns 200 OK');
    assert(meData.user.email === 'demo@financetracker.com', 'Returns demo user email');

    // 5. Transactions: List and Pagination
    console.log('\n--- 5. Testing Transactions List & Pagination ---');
    const txnsRes = await fetch(`${baseUrl}/transactions?limit=5&page=1`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    const txnsData = await txnsRes.json();
    assert(txnsRes.status === 200, 'GET /transactions returns 200 OK');
    assert(Array.isArray(txnsData.transactions), 'Returns transactions array');
    assert(txnsData.total > 0, `Total transactions recorded: ${txnsData.total}`);
    assert(txnsData.pages >= 1, `Total pages calculated: ${txnsData.pages}`);
    assert(txnsData.transactions.length <= 5, 'Limit 5 respected');

    // 6. Transactions: Create Expense
    console.log('\n--- 6. Testing Create Transaction (Expense) ---');
    const newTxnRes = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        type: 'expense',
        amount: 85.50,
        category: 'Food',
        description: 'Test Dinner Out',
        date: new Date().toISOString(),
      }),
    });
    const createdTxn = await newTxnRes.json();
    assert(newTxnRes.status === 201, 'POST /transactions returns 201 Created');
    assert(createdTxn.amount === 85.50, 'Transaction amount saved correctly');
    assert(createdTxn.category === 'Food', 'Transaction category saved correctly');

    // 7. Transactions: Update
    console.log('\n--- 7. Testing Update Transaction ---');
    const updateTxnRes = await fetch(`${baseUrl}/transactions/${createdTxn._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        amount: 95.00,
        description: 'Updated Dinner Out',
      }),
    });
    const updatedTxn = await updateTxnRes.json();
    assert(updateTxnRes.status === 200, 'PUT /transactions/:id returns 200 OK');
    assert(updatedTxn.amount === 95.00, 'Updated transaction amount reflects change');
    assert(updatedTxn.description === 'Updated Dinner Out', 'Updated description reflects change');

    // 8. Transactions: Delete
    console.log('\n--- 8. Testing Delete Transaction ---');
    const deleteTxnRes = await fetch(`${baseUrl}/transactions/${createdTxn._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert(deleteTxnRes.status === 200, 'DELETE /transactions/:id returns 200 OK');

    // 9. Budgets: List Enriched Budgets
    console.log('\n--- 9. Testing Budgets List & Calculation ---');
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const budgetsRes = await fetch(`${baseUrl}/budgets?month=${curMonth}&year=${curYear}`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    const budgetsData = await budgetsRes.json();
    assert(budgetsRes.status === 200, 'GET /budgets returns 200 OK');
    assert(Array.isArray(budgetsData.budgets), 'Budgets response contains array');
    if (budgetsData.budgets.length > 0) {
      const sampleB = budgetsData.budgets[0];
      assert(typeof sampleB.actualSpent === 'number', 'Enriched actualSpent is calculated');
      assert(typeof sampleB.percentage === 'number', 'Enriched percentage is calculated');
    }

    // 10. Budgets: Create / Update / Delete Budget
    console.log('\n--- 10. Testing Budget Management Lifecycle ---');
    const testBudgetRes = await fetch(`${baseUrl}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({
        category: 'Education',
        month: 12,
        year: 2029,
        limitAmount: 400,
      }),
    });
    const createdBudget = await testBudgetRes.json();
    assert(testBudgetRes.status === 201, 'POST /budgets returns 201 Created');

    const updateBudgetRes = await fetch(`${baseUrl}/budgets/${createdBudget._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({ limitAmount: 500 }),
    });
    assert(updateBudgetRes.status === 200, 'PUT /budgets/:id returns 200 OK');

    const deleteBudgetRes = await fetch(`${baseUrl}/budgets/${createdBudget._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert(deleteBudgetRes.status === 200, 'DELETE /budgets/:id returns 200 OK');

    // 11. Analytics: Summary
    console.log('\n--- 11. Testing Analytics Summary ---');
    const summaryRes = await fetch(`${baseUrl}/analytics/summary?month=${curMonth}&year=${curYear}`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    const summaryData = await summaryRes.json();
    assert(summaryRes.status === 200, 'GET /analytics/summary returns 200 OK');
    assert(typeof summaryData.income === 'number', 'Summary has numeric income');
    assert(typeof summaryData.expenses === 'number', 'Summary has numeric expenses');
    assert(typeof summaryData.balance === 'number', 'Summary has numeric balance');
    assert(typeof summaryData.savingsRate === 'number', 'Summary has numeric savingsRate');

    // 12. Analytics: Monthly Trend
    console.log('\n--- 12. Testing Analytics Monthly Trend ---');
    const monthlyRes = await fetch(`${baseUrl}/analytics/monthly`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    const monthlyData = await monthlyRes.json();
    assert(monthlyRes.status === 200, 'GET /analytics/monthly returns 200 OK');
    assert(Array.isArray(monthlyData.months), 'Monthly returns months array');
    assert(monthlyData.months.length === 6, 'Monthly returns 6 months of historical trend');

    // 13. Analytics: Categories Breakdown
    console.log('\n--- 13. Testing Analytics Categories Breakdown ---');
    const catRes = await fetch(`${baseUrl}/analytics/categories?month=${curMonth}&year=${curYear}`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    const catData = await catRes.json();
    assert(catRes.status === 200, 'GET /analytics/categories returns 200 OK');
    assert(Array.isArray(catData.categories), 'Categories returns array breakdown');

  } catch (err) {
    console.error('Fatal Test Error:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log('\n==================================================');
    console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

