const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { generateFinancialInsights } = require('../utils/insightsHelper');

// GET /api/analytics/summary?month=&year=
// Response: { income, expenses, balance, savingsRate, month, year }
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year  = parseInt(req.query.year)  || now.getFullYear();

    // authMiddleware resolves the full User document, so req.user._id is already an ObjectId
    const userId    = req.user._id;
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id:   '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let income   = 0;
    let expenses = 0;
    result.forEach((item) => {
      if (item._id === 'income')  income   = item.total;
      if (item._id === 'expense') expenses = item.total;
    });

    const balance     = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return res.status(200).json({
      income:      Number(income.toFixed(2)),
      expenses:    Number(expenses.toFixed(2)),
      balance:     Number(balance.toFixed(2)),
      savingsRate: Number(savingsRate.toFixed(2)),
      month,
      year,
    });
  } catch (error) {
    console.error('getSummary error:', error.message);
    return res.status(500).json({ message: 'Server error fetching summary' });
  }
};

// GET /api/analytics/monthly
// Response: { months: [{ month: number, year: number, income: number, expenses: number }] }
// month is numeric 1–12 so the frontend can index MONTH_NAMES[month - 1]
const getMonthlyAnalytics = async (req, res) => {
  try {
    const now    = new Date();
    const userId = req.user._id;

    // Last 6 months, oldest first
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    const startDate = new Date(months[0].year, months[0].month - 1, 1);
    const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year:  { $year:  '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const monthlyData = months.map(({ month, year }) => {
      const incomeEntry  = result.find(
        (r) => r._id.month === month && r._id.year === year && r._id.type === 'income'
      );
      const expenseEntry = result.find(
        (r) => r._id.month === month && r._id.year === year && r._id.type === 'expense'
      );

      const income   = incomeEntry  ? Number(incomeEntry.total.toFixed(2))  : 0;
      const expenses = expenseEntry ? Number(expenseEntry.total.toFixed(2)) : 0;

      return { month, year, income, expenses };
    });

    return res.status(200).json({ months: monthlyData });
  } catch (error) {
    console.error('getMonthlyAnalytics error:', error.message);
    return res.status(500).json({ message: 'Server error fetching monthly trend' });
  }
};

// GET /api/analytics/categories?month=&year=
// Response: { categories: [{ category, total }], month, year }
const getCategoryAnalytics = async (req, res) => {
  try {
    const now   = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year  = parseInt(req.query.year)  || now.getFullYear();

    const userId    = req.user._id;
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id:   '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categories = result.map((item) => ({
      category: item._id,
      total:    Number(item.total.toFixed(2)),
    }));

    return res.status(200).json({ categories, month, year });
  } catch (error) {
    console.error('getCategoryAnalytics error:', error.message);
    return res.status(500).json({ message: 'Server error fetching category breakdown' });
  }
};

const getInsights = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [transactions, budgets] = await Promise.all([
      Transaction.find({ userId }).lean(),
      Budget.find({ userId, month: currentMonth, year: currentYear }).lean(),
    ]);

    const insightsData = generateFinancialInsights(transactions, budgets, currentMonth, currentYear);
    return res.status(200).json({ success: true, data: insightsData });
  } catch (error) {
    console.error('getInsights error:', error.message);
    return res.status(500).json({ message: 'Server error calculating insights' });
  }
};

module.exports = {
  getSummary,
  getMonthlyAnalytics,
  getMonthlyTrend:      getMonthlyAnalytics,   // alias kept for any existing imports
  getCategoryAnalytics,
  getCategoryBreakdown: getCategoryAnalytics,  // alias kept for any existing imports
  getInsights,
};
