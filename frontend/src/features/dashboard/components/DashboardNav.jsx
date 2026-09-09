import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function DashboardNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Accounts' },
    { to: '/transfer', label: 'Transfer' },
  ];

  const adminLinks = [
    { to: '/admin/deposits', label: 'Pending' },
    { to: '/admin/approved', label: 'Approved' },
    { to: '/admin/rejected', label: 'Rejected' },
  ];

  const linkClasses = (to) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      location.pathname === to
        ? 'bg-blue-600 text-white'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`;

  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-bold text-white tracking-tight">
            Banking Ledger
          </Link>

          {/* Desktop nav - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClasses(to)}>
                {label}
              </Link>
            ))}

            {user?.systemUser && (
              <>
                <span className="text-zinc-700 mx-1">|</span>
                {adminLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className={linkClasses(to)}>
                    {label}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm hidden sm:inline">{user?.name}</span>
          <button
            type="button"
            onClick={logout}
            className="hidden md:inline-block text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          >
            Logout
          </button>

          {/* Hamburger button - mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-zinc-400 hover:text-white p-2 rounded-md hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-4 pb-4">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={linkClasses(to)} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}

          {user?.systemUser && (
            <>
              <span className="text-zinc-700 border-t border-zinc-800 my-1 pt-1 text-xs uppercase px-3">
                Admin
              </span>
              {adminLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={linkClasses(to)} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
            </>
          )}

          <div className="border-t border-zinc-800 mt-2 pt-2">
            <span className="text-zinc-400 text-sm px-3 block sm:hidden mb-1">{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="w-full text-left text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}