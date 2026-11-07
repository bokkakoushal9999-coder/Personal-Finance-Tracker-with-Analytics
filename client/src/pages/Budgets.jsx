import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import { EXPENSE_CATEGORIES, formatCurrency } from '../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function BudgetForm({ initial, onSave, onCancel, existingCategories = [] }) {
  const now = new Date();
  const [form, setForm] = useState(
    initial
      ? {
          category: initial.category,
          month: initial.month,
          year: initial.year,
          limitAmount: initial.limitAmount ?? initial.monthlyLimit,
        }
      : {
          category: EXPENSE_CATEGORIES[0],
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          limitAmount: '',
        }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const availableCategories = initial
    ? [initial.category]
    : EXPENSE_CATEGORIES.filter((c) => !existingCategories.includes(c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(form.limitAmount);
    if (isNaN(limitNum) || limitNum < 1) {
      setError('Budget limit must be at least ₹1');
      return;
    }

    setSaving(true);
    try {
      if (initial?._id) {
        await api.put(`/budgets/${initial._id}`, {
          limitAmount: limitNum,
          monthlyLimit: limitNum,
        });
      } else {
        await api.post('/budgets', {
          ...form,
          limitAmount: limitNum,
          monthlyLimit: limitNum,
        });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert message={error} type="error" onDismiss={() => setError('')} />

      {!initial && (
        <>
          <div>
            <label className="label">Expense Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {availableCategories.length === 0 ? (
                <option value="">All expense categories already budgeted</option>
              ) : (
                availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Month</label>
              <select
                className="input"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Target Year</label>
              <input
                type="number"
                className="input"
                min="2020"
                max="2035"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="label">Monthly Limit (₹)</label>
        <input
          type="number"
          step="1"
          min="1"
          className="input"
          placeholder="e.g. 15000"
          value={form.limitAmount}
          onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving || (!initial && availableCategories.length === 0)} className="btn-primary">
          {saving ? <Spinner size="sm" /> : initial?._id ? 'Update Budget' : 'Save Budget'}
        </button>
      </div>
    </form>
  );
}

function BudgetCard({ budget, onEdit, onDelete }) {
  const limit = budget.limitAmount ?? budget.monthlyLimit ?? 0;
  const spent = budget.actualSpent ?? budget.spent ?? 0;
  const remaining = limit - spent;
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const displayPct = Math.min(pct, 100);

  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  let statusText = 'Healthy';

  if (pct >= 100) {
    barColor = 'bg-rose-500';
    badgeColor = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    statusText = 'Limit Exceeded';
  } else if (pct >= 80) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    statusText = 'Near Limit';
  }

  return (
    <div className={`card space-y-4 border ${pct >= 100 ? 'border-rose-200 dark:border-rose-900/60 shadow-rose-50/50' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{budget.category}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {MONTH_NAMES[budget.month - 1]} {budget.year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {pct}% · {statusText}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${displayPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Spent: {formatCurrency(spent)}</span>
          <span>Limit: {formatCurrency(limit)}</span>
        </div>
      </div>

      {/* Remaining / Over limit indicator */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="text-xs">
          {remaining >= 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Remaining: <strong>{formatCurrency(remaining)}</strong>
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              Overspent by: <strong>{formatCurrency(Math.abs(remaining))}</strong>
            </span>
          )}
        </div>
        <div className="space-x-2">
          <button
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Budgets() {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/budgets?month=${viewMonth}&year=${viewYear}`);
      const list = data?.budgets || (Array.isArray(data) ? data : []);
      setBudgets(list);
    } catch (err) {
      setError('Failed to load budgets for selected period');
    } finally {
      setLoading(false);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    setSuccess(editing ? 'Budget updated successfully!' : 'Budget created successfully!');
    fetchBudgets();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/budgets/${deletingId}`);
      setSuccess('Budget deleted successfully');
      setDeletingId(null);
      fetchBudgets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const existingCategories = budgets.map((b) => b.category);

  // Compute Overall Totals for this month
  const totalLimit = budgets.reduce((sum, b) => sum + (b.limitAmount ?? b.monthlyLimit ?? 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.actualSpent ?? b.spent ?? 0), 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const overBudgetCount = budgets.filter((b) => (b.actualSpent ?? b.spent ?? 0) > (b.limitAmount ?? b.monthlyLimit ?? 0)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🎯</span> Monthly Budgets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Set and track spending boundaries for {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="input w-auto text-sm"
            value={viewMonth}
            onChange={(e) => setViewMonth(parseInt(e.target.value))}
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            className="input w-24 text-sm"
            min="2020"
            max="2035"
            value={viewYear}
            onChange={(e) => setViewYear(parseInt(e.target.value))}
          />
          <button
            className="btn-primary text-xs"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            + Set Budget
          </button>
        </div>
      </div>

      <Alert message={error} type="error" onDismiss={() => setError('')} />
      <Alert message={success} type="success" onDismiss={() => setSuccess('')} />

      {/* Over budget banner warning if any category exceeded */}
      {overBudgetCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-rose-800 dark:text-rose-200 text-sm">
              Overspending Alert in {overBudgetCount} {overBudgetCount === 1 ? 'Category' : 'Categories'}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              Expenses have exceeded the allocated monthly target. Review category cards below to optimize spending.
            </p>
          </div>
        </div>
      )}

      {/* Aggregate Utilization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalLimit)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Spent
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Remaining Budget
          </p>
          <p className={`text-2xl font-bold mt-1 ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Overall Utilization
          </p>
          <p className={`text-2xl font-bold mt-1 ${overallPct >= 100 ? 'text-rose-600' : overallPct >= 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {overallPct}%
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">🎯</div>
          <p className="font-medium text-gray-700 dark:text-gray-300">No budgets defined for this month</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a category budget to receive live spending warnings and progress tracking.
          </p>
          <button
            className="btn-primary mt-4 text-xs"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={() => {
                setEditing(b);
                setModalOpen(true);
              }}
              onDelete={() => setDeletingId(b._id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {modalOpen && (
        <Modal
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          title={editing ? `Edit Budget — ${editing.category}` : 'Set Monthly Budget'}
        >
          <BudgetForm
            initial={editing}
            existingCategories={existingCategories}
            onSave={handleSave}
            onCancel={() => {
              setModalOpen(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal title="Confirm Budget Removal" onClose={() => setDeletingId(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this category budget? This will remove the spending threshold and alerts for this category.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeletingId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete Budget
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
