import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import FinancialInsights from '../components/dashboard/FinancialInsights';
import {
  formatCurrency,
  formatDate,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  PlusCircle,
  ArrowRight,
  Receipt,
  PieChart as PieChartIcon,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function QuickAddModal({ onSave, onCancel }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setSaving(true);
    try {
      await api.post('/transactions', {
        title: title.trim(),
        amount: num,
        type,
        category,
        date,
      });
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert message={error} type="error" onDismiss={() => setError('')} />

      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            type === 'expense'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <TrendingDown size={14} />
          <span>Expense</span>
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            type === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <TrendingUp size={14} />
          <span>Income</span>
        </button>
      </div>

      <div>
        <label className="label">Title / Note</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Cafe, Freelance payment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Date</label>
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner size="sm" /> : 'Add Record'}
        </button>
      </div>
    </form>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sumRes, monRes, catRes, txnRes, budRes, insRes] = await Promise.all([
        api.get(`/analytics/summary?month=${currentMonth}&year=${currentYear}`),
        api.get('/analytics/monthly'),
        api.get(`/analytics/categories?month=${currentMonth}&year=${currentYear}`),
        api.get('/transactions?limit=6&page=1'),
        api.get(`/budgets?month=${currentMonth}&year=${currentYear}`),
        api.get('/analytics/insights').catch(() => ({ data: null })),
      ]);

      setSummary(sumRes.data?.data || sumRes.data || { income: 0, expenses: 0, balance: 0, savingsRate: 0 });
      setMonthly(monRes.data?.months || monRes.data?.trends || (Array.isArray(monRes.data) ? monRes.data : []));
      setCategories(catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []));
      setRecentTxns(txnRes.data?.transactions || (Array.isArray(txnRes.data) ? txnRes.data : []));
      setBudgets(budRes.data?.budgets || (Array.isArray(budRes.data) ? budRes.data : []));
      if (insRes.data?.data) {
        setInsightsData(insRes.data.data);
      }
    } catch (err) {
      setError('Failed to load dashboard metrics from database');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate totals
  const income = summary?.income ?? summary?.monthIncome ?? summary?.totalIncome ?? 0;
  const expenses = summary?.expenses ?? summary?.monthExpenses ?? summary?.totalExpenses ?? 0;
  const balance = summary?.balance ?? summary?.totalBalance ?? (income - expenses);
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.limitAmount ?? b.monthlyLimit ?? 0), 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (b.actualSpent ?? b.spent ?? 0), 0);
  const budgetUtilization = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Financial Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time cash flow overview for {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/analytics" className="btn-secondary text-xs flex items-center gap-1.5">
            <PieChartIcon size={14} />
            <span>Full Analytics</span>
          </Link>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            <span>Quick Add Record</span>
          </button>
        </div>
      </div>

      <Alert message={error} type="error" onDismiss={() => setError('')} />

      {/* 5 Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Balance */}
        <div className="card border-l-4 border-l-blue-500 space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Balance
            </span>
            <Wallet size={18} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {formatCurrency(balance)}
          </p>
          <p className="text-[11px] text-gray-400">Net accumulated reserve</p>
        </div>

        {/* Total Income */}
        <div className="card border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Month Income
            </span>
            <TrendingUp size={18} />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(income)}
          </p>
          <p className="text-[11px] text-gray-400">Total revenue inflows</p>
        </div>

        {/* Total Expenses */}
        <div className="card border-l-4 border-l-rose-500 space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Month Expenses
            </span>
            <TrendingDown size={18} />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(expenses)}
          </p>
          <p className="text-[11px] text-gray-400">Total debits & bills</p>
        </div>

        {/* Monthly Savings */}
        <div className="card border-l-4 border-l-indigo-500 space-y-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Savings
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold">
                {savingsRate}%
              </span>
              <PiggyBank size={18} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(savings)}
          </p>
          <p className="text-[11px] text-gray-400">Net surplus saved</p>
        </div>

        {/* Monthly Budget */}
        <div className="card border-l-4 border-l-amber-500 space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Budget
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold">
                {budgetUtilization}%
              </span>
              <Target size={18} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {formatCurrency(totalBudgetLimit)}
          </p>
          <p className="text-[11px] text-gray-400">
            Spent: {formatCurrency(totalBudgetSpent)}
          </p>
        </div>
      </div>

      {/* Rule-Based Financial Insights Section */}
      {insightsData && (
        <FinancialInsights insightsData={insightsData} />
      )}

      {/* Charts Row: Monthly Overview & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              <span>Income vs Expenses (6 Months)</span>
            </h2>
            <Link to="/analytics" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <span>Analyze</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <IncomeExpenseChart data={monthly} />
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <PieChartIcon size={18} className="text-purple-500" />
              <span>Expense Distribution</span>
            </h2>
            <Link to="/expenses" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <span>Expenses</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <CategoryPieChart data={categories} />
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Receipt size={18} className="text-blue-500" />
              <span>Recent Transactions</span>
            </h2>
            <Link to="/transactions" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {recentTxns.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No transactions recorded yet</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {recentTxns.slice(0, 5).map((txn) => (
                <div key={txn._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`badge-${txn.type}`}>
                      {txn.type}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {txn.title || txn.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(txn.date)} · <span className="font-medium text-gray-600 dark:text-gray-300">{txn.category}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold whitespace-nowrap ${
                      txn.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {txn.type === 'income' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Budget Utilization */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Target size={18} className="text-amber-500" />
              <span>Active Budget Status</span>
            </h2>
            <Link to="/budgets" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
              <span>Manage Budgets</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No budgets set for this month</p>
          ) : (
            <div className="space-y-3.5">
              {budgets.slice(0, 5).map((b) => {
                const limit = b.limitAmount ?? b.monthlyLimit ?? 0;
                const spent = b.actualSpent ?? b.spent ?? 0;
                const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                const displayPct = Math.min(pct, 100);

                const barColor =
                  pct >= 100 ? 'bg-rose-500' :
                  pct >= 80  ? 'bg-amber-500' :
                               'bg-emerald-500';

                return (
                  <div key={b._id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-700 dark:text-gray-200">{b.category}</span>
                      <span className={pct >= 100 ? 'text-rose-600 font-bold' : 'text-gray-500 dark:text-gray-400'}>
                        {formatCurrency(spent)} / {formatCurrency(limit)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${displayPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      {quickAddOpen && (
        <Modal
          title="Quick Record Transaction"
          onClose={() => setQuickAddOpen(false)}
        >
          <QuickAddModal
            onSave={() => {
              setQuickAddOpen(false);
              fetchDashboardData();
            }}
            onCancel={() => setQuickAddOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
