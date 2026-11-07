import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, IndianRupee, Menu } from 'lucide-react';

/**
 * Navbar Component
 * Global top navigation bar with brand logo, mobile navigation trigger,
 * theme toggle, and authenticated user profile / logout actions.
 *
 * @param {Object} props
 * @param {Function} [props.onToggleMobileSidebar] - Mobile sidebar toggle callback
 */
export default function Navbar({ onToggleMobileSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-16 transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>
          )}

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <IndianRupee size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block">
                Finance<span className="text-emerald-600 dark:text-emerald-400">Tracker</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated && user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {user.email}
                </p>
              </div>
              <div className="h-8 w-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                title="Log out of account"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Named export for compatibility
export { Navbar };
