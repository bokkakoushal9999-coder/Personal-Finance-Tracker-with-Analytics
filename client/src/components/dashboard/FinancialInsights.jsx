import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function FinancialInsights({ insightsData }) {
  if (!insightsData) return null;

  const { insights = [], alerts = [], suggestions = [], healthScore = 75 } = insightsData;

  return (
    <div className="card space-y-4">
      {/* Header with Health Score */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💡</span> Rule-Based Financial Insights & Alerts
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Automated financial health audit calculated from your active records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Financial Health:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              healthScore >= 75
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : healthScore >= 50
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {healthScore}/100
          </span>
        </div>
      </div>

      {/* Overspending / Warning Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={`alert-${idx}`}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                alert.severity === 'danger'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
              }`}
            >
              <span className="text-base leading-none">⚠️</span>
              <div>
                <p className="font-semibold">{alert.message}</p>
                {alert.overage && (
                  <p className="mt-0.5 opacity-90">
                    Exceeded target by <strong>{formatCurrency(alert.overage)}</strong>. Consider rebalancing category allocations.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((item, idx) => (
          <div
            key={`insight-${idx}`}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {item.title}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.message}
            </p>
          </div>
        ))}
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Actionable Optimization Recommendations
          </p>
          <div className="space-y-2">
            {suggestions.map((sug, idx) => (
              <div
                key={`sug-${idx}`}
                className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200"
              >
                <span className="text-base leading-none">💡</span>
                <div>
                  <span className="font-bold">{sug.title}: </span>
                  <span>{sug.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

