import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg text-xs space-y-1">
        <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="font-medium flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
          <span>Net Balance:</span>
          <span className="font-semibold">{formatCurrency(val)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function BalanceAreaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No balance trend data available
      </div>
    );
  }

  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Calculate cumulative balance if not already provided
  let runningBalance = 0;
  const chartData = data.map((d) => {
    const inc = d.income || 0;
    const exp = d.expenses ?? d.expense ?? 0;
    const diff = inc - exp;
    runningBalance = d.balance !== undefined ? d.balance : runningBalance + diff;
    const label = typeof d.month === 'number'
      ? `${MONTH_NAMES[d.month - 1]} ${d.year || ''}`.trim()
      : (d.period || d.month || 'Period');
    return {
      period: label,
      Balance: runningBalance,
    };
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            formatter={(val) => (
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {val}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="Balance"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#balanceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

