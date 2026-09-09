import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { key: 'about', label: 'About Us' },
    { key: 'login', label: 'Login' },
    { key: 'register', label: 'Register' },
  ];

  return (
    <div className="w-full h-full bg-zinc-900 text-white flex flex-col md:p-6 gap-2">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 md:p-0 md:mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
          BL
        </div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight">Banking Ledger</h2>
      </div>

      {/* Menu items: row on mobile, column on desktop */}
      <div className="flex flex-row md:flex-col gap-1 md:gap-2 px-2 pb-2 md:p-0 overflow-x-auto md:overflow-visible border-t border-zinc-800 md:border-0 pt-2 md:pt-0">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`whitespace-nowrap text-center md:text-left px-3 md:px-4 py-2 md:py-2.5 rounded-md transition-colors font-medium text-sm md:text-base ${
              activeTab === item.key
                ? 'bg-blue-600 text-white'
                : 'text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {item.label}
          </button>
        ))}

        {isAuthenticated && (
          <button
            onClick={() => navigate('/dashboard')}
            className="whitespace-nowrap text-center md:text-left px-3 md:px-4 py-2 md:py-2.5 rounded-md transition-colors font-medium text-emerald-400 hover:bg-zinc-800 text-sm md:text-base md:mt-2"
          >
            Dashboard →
          </button>
        )}
      </div>
    </div>
  );
}