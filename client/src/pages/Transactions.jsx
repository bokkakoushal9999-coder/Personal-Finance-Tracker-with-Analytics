import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatDate,
} from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/exportCsv';

function TransactionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      type: 'expense',
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      description: '',
      date: new Date().toISOString().split('T')[0],
    }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type) => {
    const defaultCat = type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
    setForm({ ...form, type, category: defaultCat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      setError('Please provide a transaction title');
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
        await api.put(`/transactions/${initial._id}`, { ...form, amount: num });
      } else {
        await api.post('/transactions', { ...form, amount: num });
      }
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

      {/* Type toggle */}
      <div>
        <label className="label">Transaction Type</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              form.type === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            onClick={() => handleTypeChange('expense')}
          >
            ❤️ Expense
          </button>
          <button
            type="button"
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              form.type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            onClick={() => handleTypeChange('income')}
          >
            💚 Income
          </button>
        </div>
      </div>

      <div>
        <label className="label">Title / Note</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Grocery store, Salary payout, Electricity bill"
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
          placeholder="Payment details, memo or tags..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner size="sm" /> : initial?._id ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data?.transactions || []);
      setTotal(res.data?.total ?? res.data?.totalCount ?? res.data?.transactions?.length ?? 0);
      setPages(res.data?.pages || 1);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    setSuccess(editing ? 'Transaction updated successfully!' : 'Transaction created successfully!');
    fetchTransactions();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/transactions/${deletingId}`);
      setSuccess('Transaction deleted successfully!');
      setDeletingId(null);
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', startDate: '', endDate: '', search: '' });
    setPage(1);
  };

  const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💳</span> Transaction History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} total records recorded across all accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportTransactionsToCSV(transactions, 'all_transactions.csv')}
            className="btn-secondary text-xs"
            title="Download CSV file of transactions"
          >
            📥 Export CSV
          </button>
          <button
            className="btn-primary text-xs"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <Alert message={error} type="error" onDismiss={() => setError('')} />
      <Alert message={success} type="success" onDismiss={() => setSuccess('')} />

      {/* Filters Bar */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            name="type"
            className="input text-sm"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="income">💚 Income Only</option>
            <option value="expense">❤️ Expense Only</option>
          </select>
          <select
            name="category"
            className="input text-sm"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="date"
            name="startDate"
            className="input text-sm"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="From Date"
          />
          <input
            type="date"
            name="endDate"
            className="input text-sm"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="To Date"
          />
          <div className="flex gap-2 col-span-2 md:col-span-1">
            <input
              type="text"
              name="search"
              className="input text-sm flex-1"
              placeholder="Search memo..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button
              className="btn-secondary px-3"
              onClick={clearFilters}
              title="Reset Filters"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">💳</div>
            <p className="font-medium text-gray-700 dark:text-gray-300">No transactions match your search</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing filters or add a new record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="text-left px-5 py-3.5 font-semibold">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Title / Description</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Type</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Amount</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(txn.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{txn.title || txn.description || '—'}</p>
                      {txn.title && txn.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{txn.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">
                      {txn.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge-${txn.type}`}>{txn.type}</span>
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right font-semibold whitespace-nowrap ${
                        txn.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {txn.type === 'income' ? '+' : '-'}
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800"
                        onClick={() => {
                          setEditing({
                            ...txn,
                            date: new Date(txn.date).toISOString().split('T')[0],
                          });
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-slate-800"
                        onClick={() => setDeletingId(txn._id)}
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Page {page} of {pages}
          </span>
          <button
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          title={editing ? 'Edit Transaction' : 'Record New Transaction'}
        >
          <TransactionForm
            initial={editing}
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
        <Modal title="Confirm Transaction Deletion" onClose={() => setDeletingId(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this transaction record? This will permanently update your balance and budget tracking.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeletingId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
