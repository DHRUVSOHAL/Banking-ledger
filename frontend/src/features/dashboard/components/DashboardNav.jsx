import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Accounts' },
    { to: '/transfer', label: 'Transfer' },
  ];

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-bold text-white tracking-tight">
            Banking Ledger
          </Link>
          <nav className="flex gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {label}
              </Link>
            ))}

            {user?.systemUser && (
              <Link
                to="/admin/deposits"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/admin/deposits'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm hidden sm:inline">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}