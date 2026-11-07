import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import SavingsLineChart from '../components/charts/SavingsLineChart';
import BalanceAreaChart from '../components/charts/BalanceAreaChart';
import { formatCurrency } from '../utils/formatters';

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Analytics() {
  const now = new Date();
  const [range, setRange] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly' | 'custom'
  const [customStart, setCustomStart] = useState(
    new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState(now.toISOString().split('T')[0]);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let trendQuery = `?range=${range}`;
        let catQuery = `?range=${range}`;
        if (range === 'custom') {
          trendQuery += `&startDate=${customStart}&endDate=${customEnd}`;
          catQuery += `&startDate=${customStart}&endDate=${customEnd}`;
        } else {
          catQuery += `&month=${selectedMonth}&year=${selectedYear}`;
        }

        const [trendRes, catRes, sumRes] = await Promise.all([
          api.get(`/analytics/monthly${trendQuery}`),
          api.get(`/analytics/categories${catQuery}`),
          api.get(`/analytics/summary?month=${selectedMonth}&year=${selectedYear}`),
        ]);

        const rawTrends = trendRes.data?.trends || trendRes.data?.months || (Array.isArray(trendRes.data) ? trendRes.data : []);
        setMonthlyTrend(rawTrends);

        const rawCats = catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []);
        setCategories(rawCats);

        setSummary(sumRes.data?.data || sumRes.data || { income: 0, expenses: 0, balance: 0, savingsRate: 0 });
      } catch (err) {
        setError('Failed to load analytics records from server');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range, customStart, customEnd, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📈</span> Financial Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deep-dive cash flow intelligence and category distributions
          </p>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['weekly', 'monthly', 'yearly', 'custom'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  range === r
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input text-xs py-1"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                className="input text-xs py-1"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          {range !== 'custom' && (
            <div className="flex items-center gap-2">
              <select
                className="input w-auto text-xs py-1.5"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {MONTH_NAMES_FULL.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                className="input w-20 text-xs py-1.5"
                min="2020"
                max="2035"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>

      <Alert message={error} type="error" onDismiss={() => setError('')} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Executive Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">
                  Income (Selected Month)
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary.income ?? summary.monthIncome ?? summary.totalIncome ?? 0)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">
                  Expenses (Selected Month)
                </p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(summary.expenses ?? summary.monthExpenses ?? summary.totalExpenses ?? 0)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">
                  Net Balance
                </p>
                <p className={`text-xl font-bold ${(summary.balance ?? summary.totalBalance ?? 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                  {formatCurrency(summary.balance ?? summary.totalBalance ?? 0)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">
                  Savings Rate
                </p>
                <p className={`text-xl font-bold ${(summary.savingsRate ?? 0) >= 20 ? 'text-purple-600 dark:text-purple-400' : 'text-amber-500'}`}>
                  {summary.savingsRate ?? 0}%
                </p>
              </div>
            </div>
          )}

          {/* 4 Interactive Recharts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Category Distribution (Pie) */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>🥧</span> 1. Expense Breakdown by Category
                </h2>
                <span className="text-xs text-gray-400 font-medium">Recharts Pie</span>
              </div>
              <CategoryPieChart data={categories} />
            </div>

            {/* Chart 2: Income vs Expenses (Bar) */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>📊</span> 2. Monthly Income vs Expenses
                </h2>
                <span className="text-xs text-gray-400 font-medium">Recharts Bar</span>
              </div>
              <IncomeExpenseChart data={monthlyTrend} />
            </div>

            {/* Chart 3: Savings Trends (Line) */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>📉</span> 3. Monthly Net Savings Trend
                </h2>
                <span className="text-xs text-gray-400 font-medium">Recharts Line</span>
              </div>
              <SavingsLineChart data={monthlyTrend} />
            </div>

            {/* Chart 4: Balance Trends (Area) */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>🌊</span> 4. Cumulative Balance Growth
                </h2>
                <span className="text-xs text-gray-400 font-medium">Recharts Area</span>
              </div>
              <BalanceAreaChart data={monthlyTrend} />
            </div>
          </div>

          {/* Category Breakdown Details Table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Detailed Category Spending Portfolio
              </h2>
              <span className="text-xs text-gray-400">{categories.length} categories active</span>
            </div>
            {categories.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No category expenditures in this timeframe</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold">Category</th>
                      <th className="text-right px-5 py-3 font-semibold">Amount Spent</th>
                      <th className="text-right px-5 py-3 font-semibold">Share of Outflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {categories.map((cat) => {
                      const amount = cat.total ?? cat.amount ?? cat.value ?? 0;
                      const totalSum = categories.reduce((sum, c) => sum + (c.total ?? c.amount ?? c.value ?? 0), 0);
                      const share = totalSum > 0 ? Math.round((amount / totalSum) * 100) : 0;
                      return (
                        <tr key={cat.category || cat.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                            {cat.category || cat.name}
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                            {formatCurrency(amount)}
                          </td>
                          <td className="px-5 py-3.5 text-right text-gray-600 dark:text-gray-400">
                            <span className="inline-block w-12">{share}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
