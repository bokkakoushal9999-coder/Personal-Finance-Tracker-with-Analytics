/**
 * Generates rule-based financial insights and actionable recommendations
 * based on actual user transactions and budgets.
 */
function generateFinancialInsights(transactions, budgets, currentMonth, currentYear) {
  const insights = [];
  const alerts = [];
  const suggestions = [];

  // 1. Separate current month and all-time data
  const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startOfCurrentMonth && d <= endOfCurrentMonth;
  });

  const monthIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? (monthlySavings / monthIncome) * 100 : 0;

  // 2. Spending by category for current month
  const categoryExpenses = {};
  monthlyTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);
  const highestCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Metric 1: Highest Spending Category
  if (highestCategory) {
    const percentOfTotal = monthExpense > 0 ? Math.round((highestCategory[1] / monthExpense) * 100) : 0;
    insights.push({
      type: 'highest_expense',
      title: 'Top Spending Category',
      category: highestCategory[0],
      amount: highestCategory[1],
      percentage: percentOfTotal,
      message: `Your highest expenditure this month is on ${highestCategory[0]} (₹${highestCategory[1].toLocaleString('en-IN')}), accounting for ${percentOfTotal}% of total expenses.`,
      severity: percentOfTotal > 40 ? 'warning' : 'info',
    });
  }

  // Metric 2: Monthly Savings Rate
  if (monthIncome > 0) {
    let rateStatus = 'neutral';
    let rateMsg = '';

    if (savingsRate >= 30) {
      rateStatus = 'success';
      rateMsg = `Outstanding! You are saving ${Math.round(savingsRate)}% of your income this month, exceeding the 20% rule.`;
    } else if (savingsRate >= 15) {
      rateStatus = 'good';
      rateMsg = `Good job! You have saved ${Math.round(savingsRate)}% of your income this month. Keep building your reserves.`;
    } else if (savingsRate > 0) {
      rateStatus = 'warning';
      rateMsg = `You are saving ${Math.round(savingsRate)}% of your income. Aim to bring savings up towards at least 20%.`;
    } else {
      rateStatus = 'danger';
      rateMsg = `Deficit Alert: Expenses exceed income by ₹${Math.abs(monthlySavings).toLocaleString('en-IN')}. Spending rate is unsustainable.`;
    }

    insights.push({
      type: 'savings_rate',
      title: 'Monthly Savings Rate',
      savingsRate: Math.round(savingsRate),
      amount: monthlySavings,
      status: rateStatus,
      message: rateMsg,
    });
  }

  // Metric 3: Budget Overspending & Warning Alerts
  budgets.forEach((b) => {
    const spent = categoryExpenses[b.category] || 0;
    const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;

    if (pct > 100) {
      alerts.push({
        type: 'budget_exceeded',
        category: b.category,
        limit: b.monthlyLimit,
        spent,
        overage: spent - b.monthlyLimit,
        percentage: Math.round(pct),
        message: `Over Budget: You exceeded your ₹${b.monthlyLimit.toLocaleString('en-IN')} limit for ${b.category} by ₹${(spent - b.monthlyLimit).toLocaleString('en-IN')} (${Math.round(pct)}%).`,
        severity: 'danger',
      });
    } else if (pct >= 80) {
      alerts.push({
        type: 'budget_warning',
        category: b.category,
        limit: b.monthlyLimit,
        spent,
        remaining: b.monthlyLimit - spent,
        percentage: Math.round(pct),
        message: `Budget Alert: ${b.category} spending is at ${Math.round(pct)}% of your ₹${b.monthlyLimit.toLocaleString('en-IN')} limit with ₹${(b.monthlyLimit - spent).toLocaleString('en-IN')} left.`,
        severity: 'warning',
      });
    }
  });

  // Metric 4: Actionable Reduction Suggestions
  // Check discretionary categories: Entertainment, Shopping, Food
  const discretionaryTotal =
    (categoryExpenses['Entertainment'] || 0) +
    (categoryExpenses['Shopping'] || 0);

  if (monthExpense > 0 && discretionaryTotal / monthExpense > 0.3) {
    const discPct = Math.round((discretionaryTotal / monthExpense) * 100);
    suggestions.push({
      title: 'Trim Discretionary Purchases',
      category: 'Shopping & Entertainment',
      message: `Discretionary spending (Shopping & Entertainment) represents ${discPct}% of your expenses (₹${discretionaryTotal.toLocaleString('en-IN')}). Consider curbing spontaneous orders to boost your emergency fund.`,
    });
  }

  if (categoryExpenses['Bills'] && categoryExpenses['Bills'] > monthIncome * 0.4 && monthIncome > 0) {
    suggestions.push({
      title: 'High Fixed Utility Overhead',
      category: 'Bills',
      message: 'Your recurring bills and utilities take more than 40% of income. Review active subscriptions or utility tariffs for potential savings.',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Automate Wealth Creation',
      category: 'Savings',
      message: 'Maintain momentum by automatically transferring 15% to 20% of your salary into a high-yield savings or diversified index fund at the start of each month.',
    });
  }

  // Health Score Calculation (0-100)
  let healthScore = 70; // baseline
  if (savingsRate >= 30) healthScore += 20;
  else if (savingsRate >= 15) healthScore += 10;
  else if (savingsRate < 0) healthScore -= 25;

  if (alerts.some((a) => a.severity === 'danger')) healthScore -= 15;
  if (alerts.some((a) => a.severity === 'warning')) healthScore -= 5;
  if (monthIncome > monthExpense && monthIncome > 0) healthScore += 10;

  healthScore = Math.max(10, Math.min(100, healthScore));

  return {
    insights,
    alerts,
    suggestions,
    healthScore,
    monthlySummary: {
      income: monthIncome,
      expense: monthExpense,
      savings: monthlySavings,
      savingsRate: Math.round(savingsRate),
    },
  };
}

module.exports = { generateFinancialInsights };

