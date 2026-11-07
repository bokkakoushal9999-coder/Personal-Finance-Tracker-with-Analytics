import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';

export default function Settings() {
  const { user, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError('Name and email cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });
      if (res.data?.user) {
        // Persist updated user
        const token = localStorage.getItem('pft_token');
        login(token, res.data.user);
      }
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/profile', {
        password: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⚙️</span> Settings & Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account credentials, preferences, and display options
        </p>
      </div>

      {/* Preferences Section: Theme & Currency */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>🎨</span> Application Preferences
        </h2>

        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800">
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">Color Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Switch between Light and Dark interface modes
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <span>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
            <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">Toggle</span>
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">Active Currency</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Default currency display for accounts and reports
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-sm rounded-lg border border-emerald-200 dark:border-emerald-800">
            INR (₹) Indian Rupee
          </span>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>👤</span> Profile Information
        </h2>

        <Alert message={profileError} type="error" onDismiss={() => setProfileError('')} />
        <Alert message={profileSuccess} type="success" onDismiss={() => setProfileSuccess('')} />

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? <Spinner size="sm" /> : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="card space-y-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>🔒</span> Security & Password
        </h2>

        <Alert message={passwordError} type="error" onDismiss={() => setPasswordError('')} />
        <Alert message={passwordSuccess} type="success" onDismiss={() => setPasswordSuccess('')} />

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={passwordLoading} className="btn-primary">
              {passwordLoading ? <Spinner size="sm" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Demo Credentials Info Box */}
      <div className="card bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          💡 Demo Account Notice
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Logged in as <strong>{user?.name}</strong> ({user?.email}). This account includes 6 months of historical transactions and category budgets. All changes are saved directly to your MongoDB database.
        </p>
      </div>
    </div>
  );
}

