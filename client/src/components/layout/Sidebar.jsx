import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Settings,
  Menu,
  X,
  IndianRupee,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/expenses', label: 'Expenses', icon: TrendingDown },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/**
 * Sidebar Component
 * Supports both controlled and uncontrolled open states, desktop collapse mode,
 * responsive mobile drawer, route change auto-close, and keyboard accessibility.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen] - Controlled mobile drawer state
 * @param {Function} [props.onClose] - Callback when mobile drawer requests close
 * @param {boolean} [props.collapsed=false] - Whether desktop sidebar is compact (w-20)
 * @param {Function} [props.onToggleCollapse] - Callback to toggle desktop collapse mode
 * @param {string} [props.className=''] - Additional CSS classes
 */
export default function Sidebar({
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse = () => {},
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const location = useLocation();

  // Resolve whether sidebar is controlled externally or managing own state
  const isControlled = typeof isOpen === 'boolean';
  const mobileOpen = isControlled ? isOpen : internalOpen;

  const handleClose = () => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handleToggle = () => {
    if (isControlled && onClose) {
      if (isOpen) onClose();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  // Close mobile sidebar automatically whenever location (route) changes
  useEffect(() => {
    handleClose();
  }, [location.pathname]);

  // Handle Escape key to close mobile drawer for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
      collapsed ? 'justify-center px-2' : ''
    } ${
      isActive
        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm border border-emerald-200/60 dark:border-emerald-800/40'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  return (
    <>
      {/* Fallback floating button only rendered if uncontrolled on mobile */}
      {!isControlled && (
        <button
          type="button"
          className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm md:hidden text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          onClick={handleToggle}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-40 transform transition-all duration-200 flex flex-col justify-between overflow-y-auto ${
          collapsed ? 'md:w-20' : 'md:w-64'
        } w-64 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${className}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Top: Menu Items */}
        <div className="p-4 space-y-6">
          <div>
            {!collapsed ? (
              <p className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Menu
              </p>
            ) : (
              <div className="h-4" />
            )}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={linkClass}
                    onClick={handleClose}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                    {/* Tooltip on collapsed desktop view */}
                    {collapsed && (
                      <span className="hidden md:group-hover:block absolute left-full ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Badge */}
          {!collapsed ? (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <IndianRupee size={14} className="text-emerald-600" />
                <span>INR Currency Standard</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Real-time balance, rule-based alerts & budget trackers active.
              </p>
            </div>
          ) : (
            <div
              className="hidden md:flex justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-emerald-600 dark:text-emerald-400"
              title="INR (₹) Standard Active"
            >
              <IndianRupee size={16} />
            </div>
          )}
        </div>

        {/* Bottom: Desktop Collapse Toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 hidden md:block">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <>
                <PanelLeftClose size={18} />
                <span>Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

// Named export for compatibility
export { Sidebar };
