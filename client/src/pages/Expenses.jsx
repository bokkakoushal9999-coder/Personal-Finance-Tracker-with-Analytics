import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import { EXPENSE_CATEGORIES, formatCurrency, formatDate } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/exportCsv';

function ExpenseFormModal({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
    }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please provide a title or expense description');
      return;
    }
    const num = parseFloat(form.amount);
    if (isNaN(num) || num <= 0) {
      setError('Amount must be a positive number greater than 0');
      return;
    }

    setSaving(true);
    try {
      if (initial?._id) {
        await api.put(`/transactions/${initial._id}`, {
          ...form,
          amount: num,
          type: 'expense',
        });
      } else {
        await api.post('/transactions', {
          ...form,
          amount: num,
          type: 'expense',
        });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert message={error} type="error" onDismiss={() => setError('')} />

      <div>
        <label className="label">Expense Title / Merchant</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Supermarket Grocery, Electric Bill, Movie Night"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {EXPENSE_CATEGORIES.map((c) => (
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
          value={form.date ? form.date.split('T')[0] : ''}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="label">Description (Optional)</label>
        <textarea
          rows={2}
          className="input"
          placeholder="Payment method, receipt notes..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner size="sm" /> : initial?._id ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: 'expense' });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/transactions?${params.toString()}`);
      const list = res.data?.transactions || (Array.isArray(res.data) ? res.data : []);
      setExpenses(list.filter((t) => t.type === 'expense'));
    } catch (err) {
      setError('Failed to load expense records');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/transactions/${deletingId}`);
      setDeletingId(null);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense record');
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const highestSingleExpense = expenses.reduce((max, item) => Math.max(max, item.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>❤️</span> Expense Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor, budget, and curb unnecessary spending
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportTransactionsToCSV(expenses, 'expense_records.csv')}
            className="btn-secondary text-xs"
            title="Download CSV report"
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="btn-primary text-xs"
          >
            + Add Expense
          </button>
        </div>
      </div>

      <Alert message={error} type="error" onDismiss={() => setError('')} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50">
          <p className="text-xs font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
            Total Outflow Recorded
          </p>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Expense Entries
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {expenses.length} records
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Largest Single Expense
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(highestSingleExpense)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              className="input text-sm"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <select
              className="input text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Expense Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="input text-sm"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🏷️</p>
            <p className="font-medium text-gray-600 dark:text-gray-300">No expense records found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or record an expense.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-5 py-3.5 font-semibold">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Title</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Category</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Amount</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {expenses.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{t.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge-expense">{t.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      -{formatCurrency(t.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingItem(t);
                          setModalOpen(true);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(t._id)}
                        className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-slate-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          title={editingItem ? 'Edit Expense Record' : 'Record New Expense'}
          onClose={() => setModalOpen(false)}
        >
          <ExpenseFormModal
            initial={editingItem}
            onSave={() => {
              setModalOpen(false);
              fetchExpenses();
            }}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal title="Confirm Delete" onClose={() => setDeletingId(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this expense record? This action cannot be undone and will update your budget calculations.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeletingId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete Expense
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

