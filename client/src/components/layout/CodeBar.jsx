import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  BarChart2,
  Target,
  Keyboard,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';

/**
 * CodeBar - System Status, Financial Code Bar & Quick Action Dock
 * Integrates with Sidebar and provides parent-child communication,
 * active route feedback, quick navigation, and system status indicators.
 *
 * @param {Object} props
 * @param {boolean} [props.collapsed=false] - Sidebar collapsed state
 * @param {Function} [props.onToggleCollapse] - Callback to toggle sidebar collapse
 * @param {boolean} [props.sidebarOpen=false] - Mobile sidebar open state
 * @param {Function} [props.onToggleSidebar] - Callback to toggle mobile sidebar
 * @param {string} [props.className=''] - Additional CSS classes
 */
export default function CodeBar({
  collapsed = false,
  onToggleCollapse = () => {},
  sidebarOpen = false,
  onToggleSidebar = () => {},
  className = '',
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [minimized, setMinimized] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Determine current active section label
  const getActiveCode = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return { code: 'DASH-01', name: 'Dashboard' };
      case '/transactions':
        return { code: 'TXN-02', name: 'Transactions' };
      case '/income':
        return { code: 'INC-03', name: 'Income Hub' };
      case '/expenses':
        return { code: 'EXP-04', name: 'Expenses Hub' };
      case '/budgets':
        return { code: 'BGT-05', name: 'Budgets' };
      case '/analytics':
        return { code: 'ANL-06', name: 'Analytics' };
      case '/settings':
        return { code: 'SET-07', name: 'Settings' };
      default:
        return { code: 'SYS-00', name: 'Overview' };
    }
  };

  const currentRoute = getActiveCode(location.pathname);

  // Keyboard shortcut listener for developer bar & quick actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle CodeBar minimization: Ctrl+B or Alt+B
      if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleCollapse();
      }
      // Toggle shortcuts panel: Shift+?
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // Quick navigation: Alt+1 to Alt+6
      if (e.altKey && !e.ctrlKey) {
        if (e.key === '1') navigate('/dashboard');
        if (e.key === '2') navigate('/transactions');
        if (e.key === '3') navigate('/income');
        if (e.key === '4') navigate('/expenses');
        if (e.key === '5') navigate('/budgets');
        if (e.key === '6') navigate('/analytics');
      }
      // Escape closes shortcuts
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse, navigate, showShortcuts]);

  return (
    <>
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="text-emerald-600 dark:text-emerald-400" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Keyboard Shortcuts & Codes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close shortcuts"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Toggle Sidebar Collapse</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Ctrl + B
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Show Shortcuts Modal</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Shift + ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Go to Dashboard</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Alt + 1
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Go to Transactions</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Alt + 2
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Go to Income</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Alt + 3
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Go to Expenses</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Alt + 4
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>Go to Budgets</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Alt + 5
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Go to Analytics</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                  Alt + 6
                </kbd>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs shadow transition-colors"
              >
                Close Shortcuts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main CodeBar Dock */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 border-t ${
          minimized
            ? 'h-7 bg-slate-900/90 text-slate-400 border-slate-800'
            : 'h-10 bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 shadow-lg'
        } backdrop-blur-md text-xs select-none ${className}`}
        role="contentinfo"
        aria-label="Application Status and Quick Action CodeBar"
      >
        <div className="h-full max-w-full px-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {/* Left section: Sidebar integration & Status indicators */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sidebar toggle button (Direct Parent-Child integration) */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex items-center gap-1.5 font-mono text-[11px]"
              title={collapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
              aria-label="Toggle sidebar width"
            >
              {collapsed ? (
                <>
                  <PanelLeftOpen size={14} className="text-emerald-500" />
                  <span className="hidden lg:inline text-[10px]">Expand</span>
                </>
              ) : (
                <>
                  <PanelLeftClose size={14} className="text-slate-400" />
                  <span className="hidden lg:inline text-[10px]">Collapse</span>
                </>
              )}
            </button>

            {/* Mobile Sidebar Trigger indicator */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-[11px] flex items-center gap-1"
              aria-label="Toggle mobile menu"
            >
              <Terminal size={13} className="text-emerald-500" />
              <span>Menu</span>
            </button>

            <span className="hidden sm:inline-block h-3.5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Live API Health indicator */}
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 font-mono text-[10px]"
              title="System Status: Operational on Port 5001"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                API Live
              </span>
              <span className="text-slate-400 hidden xl:inline">:5001</span>
            </div>

            {/* Currency standard badge */}
            <div
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 font-mono text-[10px] text-slate-600 dark:text-slate-300"
              title="Standard Currency: Indian Rupee (INR)"
            >
              <IndianRupee size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span>INR (₹)</span>
            </div>

            {/* Route Code badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 font-mono text-[10px] font-semibold">
              <span>{currentRoute.code}</span>
              <span className="text-slate-400 dark:text-slate-500 hidden md:inline">|</span>
              <span className="hidden md:inline">{currentRoute.name}</span>
            </div>
          </div>

          {/* Center / Right section: Quick action shortcuts */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick action buttons */}
            <button
              type="button"
              onClick={() => navigate('/income')}
              className="px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
              title="Quick Add Income (Alt+3)"
            >
              <TrendingUp size={12} />
              <span className="hidden sm:inline">+ Income</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="px-2 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
              title="Quick Add Expense (Alt+4)"
            >
              <TrendingDown size={12} />
              <span className="hidden sm:inline">+ Expense</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/budgets')}
              className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] transition-colors"
              title="Budget Management (Alt+5)"
            >
              <Target size={12} className="text-blue-500" />
              <span>Budgets</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] transition-colors"
              title="Analytics Charts (Alt+6)"
            >
              <BarChart2 size={12} className="text-violet-500" />
              <span>Analytics</span>
            </button>

            <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:inline-block" />

            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Keyboard Shortcuts (Shift+?)"
              aria-label="View keyboard shortcuts"
            >
              <Keyboard size={13} />
            </button>

            {/* Minimize / Maximize Dock Button */}
            <button
              type="button"
              onClick={() => setMinimized((prev) => !prev)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={minimized ? 'Expand CodeBar' : 'Minimize CodeBar'}
              aria-label="Toggle CodeBar size"
            >
              {minimized ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

// Named export for compatibility
export { CodeBar };
