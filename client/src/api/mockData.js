/**
 * Offline Mock Fallback Provider
 * Ensures the Personal Finance Tracker functions seamlessly in cloud environments
 * (such as Streamlit Community Cloud or static previews) where a live Node.js/MongoDB
 * instance is not directly running.
 */

const STORAGE_KEY_TXNS = 'pft_mock_transactions';
const STORAGE_KEY_BUDGETS = 'pft_mock_budgets';

const INITIAL_TRANSACTIONS = [
  { _id: 'tx1', title: 'Monthly Salary', type: 'income', category: 'Salary', amount: 95000, date: '2026-11-01', description: 'Primary software engineering salary' },
  { _id: 'tx2', title: 'Freelance UI Design', type: 'income', category: 'Freelancing', amount: 24000, date: '2026-11-02', description: 'Fintech client dashboard prototype' },
  { _id: 'tx3', title: 'Apartment Rent & Maintenance', type: 'expense', category: 'Bills', amount: 22000, date: '2026-11-03', description: 'Monthly flat rent and building society dues' },
  { _id: 'tx4', title: 'Organic Supermarket Groceries', type: 'expense', category: 'Food', amount: 7800, date: '2026-11-04', description: 'Weekly family vegetables, dairy and essentials' },
  { _id: 'tx5', title: 'Metro Smart Card & Fuel', type: 'expense', category: 'Transportation', amount: 3400, date: '2026-11-05', description: 'Commute expenses' },
  { _id: 'tx6', title: 'Full Stack Masterclass', type: 'expense', category: 'Education', amount: 4500, date: '2026-11-06', description: 'Professional certification course' },
  { _id: 'tx7', title: 'Weekend Dining & Cinema', type: 'expense', category: 'Entertainment', amount: 3200, date: '2026-11-07', description: 'Dinner with colleagues' },
  { _id: 'tx8', title: 'Winter Apparel & Footwear', type: 'expense', category: 'Shopping', amount: 6200, date: '2026-11-08', description: 'Winter clothing essentials' },
  { _id: 'tx9', title: 'Routine Health Check & Pharmacy', type: 'expense', category: 'Healthcare', amount: 2100, date: '2026-11-09', description: 'Vitamins and blood tests' },
];

const INITIAL_BUDGETS = [
  { _id: 'bg1', category: 'Food', limitAmount: 10000, monthlyLimit: 10000, actualSpent: 7800, percentage: 78 },
  { _id: 'bg2', category: 'Bills', limitAmount: 25000, monthlyLimit: 25000, actualSpent: 22000, percentage: 88 },
  { _id: 'bg3', category: 'Shopping', limitAmount: 8000, monthlyLimit: 8000, actualSpent: 6200, percentage: 77.5 },
  { _id: 'bg4', category: 'Transportation', limitAmount: 5000, monthlyLimit: 5000, actualSpent: 3400, percentage: 68 },
  { _id: 'bg5', category: 'Entertainment', limitAmount: 5000, monthlyLimit: 5000, actualSpent: 3200, percentage: 64 },
  { _id: 'bg6', category: 'Education', limitAmount: 6000, monthlyLimit: 6000, actualSpent: 4500, percentage: 75 },
  { _id: 'bg7', category: 'Healthcare', limitAmount: 4000, monthlyLimit: 4000, actualSpent: 2100, percentage: 52.5 },
];

function getStoredTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

function saveStoredTransactions(txns) {
  try {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
  } catch {}
}

export function handleOfflineMock(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // 1. Auth Login
  if (url.includes('/auth/login') && method === 'post') {
    let body = {};
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {}

    const demoUser = {
      _id: 'usr_demo_alex',
      name: 'Alex Sharma',
      email: body?.email || 'demo@financetracker.com',
      role: 'user',
    };

    return {
      status: 200,
      data: {
        token: 'demo-jwt-token-evaluator-alex-sharma',
        user: demoUser,
      },
    };
  }

  // 2. Auth Register
  if (url.includes('/auth/register') && method === 'post') {
    let body = {};
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {}

    const newUser = {
      _id: 'usr_' + Date.now(),
      name: body?.name || 'Evaluator User',
      email: body?.email || 'user@example.com',
      role: 'user',
    };

    return {
      status: 201,
      data: {
        token: 'demo-jwt-token-evaluator-' + Date.now(),
        user: newUser,
      },
    };
  }

  // 3. Auth Me
  if (url.includes('/auth/me')) {
    const savedUser = localStorage.getItem('pft_user');
    const user = savedUser ? JSON.parse(savedUser) : {
      _id: 'usr_demo_alex',
      name: 'Alex Sharma',
      email: 'demo@financetracker.com',
      role: 'user',
    };
    return { status: 200, data: { user } };
  }

  const txns = getStoredTransactions();

  // 4. Analytics Summary
  if (url.includes('/analytics/summary')) {
    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expenses = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Number(((balance / income) * 100).toFixed(1)) : 0;

    return {
      status: 200,
      data: {
        income,
        expenses,
        balance,
        savingsRate,
        monthIncome: income,
        monthExpenses: expenses,
        totalBalance: balance,
      },
    };
  }

  // 5. Analytics Monthly Trends
  if (url.includes('/analytics/monthly')) {
    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expenses = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

    return {
      status: 200,
      data: {
        months: [
          { month: 'Jun', income: 88000, expenses: 48000, savings: 40000 },
          { month: 'Jul', income: 92000, expenses: 52000, savings: 40000 },
          { month: 'Aug', income: 95000, expenses: 49000, savings: 46000 },
          { month: 'Sep', income: 110000, expenses: 54000, savings: 56000 },
          { month: 'Oct', income: 115000, expenses: 51000, savings: 64000 },
          { month: 'Nov', income: income || 119000, expenses: expenses || 49200, savings: (income - expenses) || 69800 },
        ],
      },
    };
  }

  // 6. Analytics Category Breakdown
  if (url.includes('/analytics/categories')) {
    const expenses = txns.filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((s, t) => s + Number(t.amount || 0), 0);
    const catMap = {};
    expenses.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount || 0);
    });

    const categories = Object.keys(catMap).map((cat) => ({
      category: cat,
      amount: catMap[cat],
      percentage: totalExp > 0 ? Number(((catMap[cat] / totalExp) * 100).toFixed(1)) : 0,
    }));

    return { status: 200, data: { categories } };
  }

  // 7. Analytics Insights
  if (url.includes('/analytics/insights')) {
    return {
      status: 200,
      data: {
        data: {
          highestSpendingCategory: { category: 'Bills', amount: 22000 },
          savingsRate: 58.7,
          budgetAlerts: [
            { category: 'Bills', message: 'You have spent 88% of your Bills budget limit.' },
          ],
          recommendations: [
            'Great job! Your savings rate of 58.7% exceeds the 20% target.',
            'Bills is your largest expense at ₹22,000. Review utilities and recurring subscriptions.',
            'Emergency fund trajectory: You have saved ₹69,800 this month.',
          ],
        },
      },
    };
  }

  // 8. Transactions CRUD
  if (url.includes('/transactions')) {
    if (method === 'post') {
      let body = {};
      try {
        body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      } catch {}

      const newTx = {
        _id: 'tx_' + Date.now(),
        title: body.title || 'New Record',
        amount: Number(body.amount || 0),
        type: body.type || 'expense',
        category: body.category || 'Other',
        date: body.date || new Date().toISOString().split('T')[0],
        description: body.description || '',
      };

      const updated = [newTx, ...txns];
      saveStoredTransactions(updated);
      return { status: 201, data: newTx };
    }

    if (method === 'delete') {
      const id = url.split('/transactions/')[1];
      const updated = txns.filter((t) => t._id !== id);
      saveStoredTransactions(updated);
      return { status: 200, data: { message: 'Transaction deleted' } };
    }

    // GET /transactions with filters
    let filtered = [...txns];
    if (url.includes('type=')) {
      const typeMatch = url.match(/type=([^&]+)/);
      if (typeMatch && typeMatch[1] && typeMatch[1] !== 'all') {
        filtered = filtered.filter((t) => t.type === typeMatch[1]);
      }
    }

    return {
      status: 200,
      data: {
        transactions: filtered,
        totalTransactions: filtered.length,
        totalPages: 1,
        currentPage: 1,
      },
    };
  }

  // 9. Budgets
  if (url.includes('/budgets')) {
    if (method === 'post' || method === 'put') {
      let body = {};
      try {
        body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      } catch {}
      return { status: 200, data: { ...body, _id: 'bg_' + Date.now() } };
    }
    return { status: 200, data: { budgets: INITIAL_BUDGETS } };
  }

  return null;
}
