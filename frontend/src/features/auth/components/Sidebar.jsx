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
    <div className="w-full h-full bg-zinc-900 text-white flex flex-col p-6 gap-2">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
          BL
        </div>
        <h2 className="text-xl font-bold tracking-tight">Banking Ledger</h2>
      </div>

      {menuItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveTab(item.key)}
          className={`text-left px-4 py-2.5 rounded-md transition-colors font-medium ${
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
          className="text-left px-4 py-2.5 rounded-md transition-colors font-medium text-emerald-400 hover:bg-zinc-800 mt-2"
        >
          Go to Dashboard →
        </button>
      )}
    </div>
  );
}
