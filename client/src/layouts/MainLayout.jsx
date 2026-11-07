import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Budgets', to: '/budgets' },
  { label: 'Analytics', to: '/analytics' },
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return children;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <Link to="/dashboard" className="brand">
            FinanceFlow
          </Link>
        </div>

        <nav className="nav">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="user-area">
          <span className="user-pill">{user.name}</span>
          <button type="button" className="button ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="page-container">{children}</main>
    </div>
  );
}
