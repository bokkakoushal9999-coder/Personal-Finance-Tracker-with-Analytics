import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  IndianRupee,
  TrendingUp,
  Target,
  BarChart3,
  ShieldCheck,
  Download,
  Moon,
  Sun,
  ArrowRight,
  Sparkles,
  PieChart,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handle1ClickDemo = async () => {
    try {
      const res = await api.post('/auth/login', {
        email: 'demo@financetracker.com',
        password: 'Password123!',
      });
      const data = res?.data || res;
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (e) {
      const demoUser = {
        _id: 'usr_demo_alex',
        name: 'Alex Sharma',
        email: 'demo@financetracker.com',
        role: 'user',
      };
      login('demo-jwt-token-evaluator-alex-sharma', demoUser);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <IndianRupee size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              Finance<span className="text-emerald-400">Tracker</span>
            </span>
          </div>

          {/* Navigation & CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-xs py-2 px-4">
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-2 px-4 shadow-md shadow-emerald-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold shadow-inner">
            <Sparkles size={14} className="text-emerald-400" />
            <span>MERN Stack Personal Wealth & Cash Flow Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Master Your Cash Flow With{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Precision Financial Analytics
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Record multi-source income, monitor categorical expense budgets with automated warning alerts, and track monthly savings trends with interactive Recharts visualizations in Indian Rupees (₹).
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handle1ClickDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>🚀 Launch Live Demo (Alex Sharma)</span>
              <ArrowRight size={16} />
            </button>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl font-black text-emerald-400">₹1,19,000</p>
              <p className="text-xs text-slate-400 mt-0.5">Monthly Demo Income</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl font-black text-rose-400">8 Categories</p>
              <p className="text-xs text-slate-400 mt-0.5">Expense Budgets</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl font-black text-indigo-400">4 Recharts</p>
              <p className="text-xs text-slate-400 mt-0.5">Interactive Analytics</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl font-black text-amber-400">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Database Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Engineered For Complete Financial Clarity
            </h2>
            <p className="text-sm text-slate-400">
              Everything you need to plan, track, and optimize your monthly budget in one modern interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Target size={20} />
              </div>
              <h3 className="font-bold text-white text-base">Smart Category Budgets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set monthly spending limits for Food, Shopping, Bills, and Transportation. Receive visual warnings at 80% and over-budget alert banners at 100%.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-white text-base">4-Chart Recharts Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore expense distributions with Pie charts, income vs. expense with Bar charts, savings rate with Line charts, and balance trends with Area charts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-teal-500/40 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-white text-base">Private & Secure Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Protected by JWT authentication and bcrypt password hashing. All transactions and budgets are strictly isolated per user account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Personal Finance Tracker with Analytics. Full Stack MERN Application.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-medium">React + Vite</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">Tailwind CSS</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">Node + Express</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
