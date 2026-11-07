import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const executeLogin = async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', credentials);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please provide both email and password');
      return;
    }
    await executeLogin(form);
  };

  const handleDemoLogin = async () => {
    const demoCredentials = {
      email: 'demo@financetracker.com',
      password: 'Password123!',
    };
    setForm(demoCredentials);
    await executeLogin(demoCredentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-emerald-500/20 mb-3">
            ₹
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Finance<span className="text-emerald-400">Tracker</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Personal Finance Tracker with Cash Flow Analytics
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to access your financial dashboard
            </p>
          </div>

          <Alert message={error} type="error" onDismiss={() => setError('')} />

          {/* Quick Demo Login Pill */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🚀</span> 1-Click Demo Account Login (Alex Sharma)
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0" htmlFor="password">Password</label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-bold shadow-md shadow-emerald-500/20"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
              Register now
            </Link>
          </p>

          {/* Seed Info footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            <strong>Sample Credentials:</strong><br />
            Email: <code className="text-emerald-600 dark:text-emerald-400">demo@financetracker.com</code><br />
            Password: <code className="text-emerald-600 dark:text-emerald-400">Password123!</code>
          </div>
        </div>
      </div>
    </div>
  );
}
