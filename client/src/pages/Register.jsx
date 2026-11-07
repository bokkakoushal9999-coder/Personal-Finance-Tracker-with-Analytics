import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Please provide a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters long';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Create your account to start managing your finances
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Create your account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Join to manage income, track expenses, and view cash flow analytics
            </p>
          </div>

          <Alert message={error} type="error" onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="input"
                placeholder="e.g. Rahul Verma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="rahul@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-bold shadow-md shadow-emerald-500/20"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Complete Registration'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
