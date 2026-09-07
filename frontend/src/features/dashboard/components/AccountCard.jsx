import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. Import useNavigate
import { accountsService } from '../../../service/accounts.service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DepositButton from './DepositButton';

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

function truncateId(id) {
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function AccountCard({ account }) {
  const navigate = useNavigate(); // 👈 2. Hook initialize kiya
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchBalance() {
    setLoading(true);
    setError('');
    accountsService.getAccountBalance(account._id)
      .then((res) => setBalance(res.data.balance))
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBalance();
  }, [account._id]);

  const statusColor = {
    ACTIVE: 'text-emerald-400',
    FROZEN: 'text-amber-400',
    CLOSED: 'text-red-400',
  }[account.status] || 'text-zinc-400';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-zinc-500 text-xs font-mono">{truncateId(account._id)}</p>
          <p className={`text-sm font-medium mt-1 ${statusColor}`}>{account.status}</p>
        </div>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">{account.currency}</span>
      </div>

      <div>
        <p className="text-zinc-500 text-xs uppercase tracking-wide">Balance</p>
        {loading ? (
          <LoadingSpinner label="" />
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <p className="text-2xl font-bold text-white mt-1">
            {formatCurrency(balance, account.currency)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(account._id)}
        className="text-xs text-blue-400 hover:text-blue-300 text-left transition-colors"
      >
        Copy account ID
      </button>

      {/* Buttons Row */}
      <div className="flex items-center gap-2 mt-2">
        <DepositButton accountId={account._id} onDeposited={fetchBalance} />
        
        {/* 👇 History Button with type="button" and proper navigate */}
        <button
          type="button"
          onClick={() => navigate(`/account/${account._id}/history`)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 px-3 rounded-lg border border-zinc-700 transition-colors"
        >
          History
        </button>
      </div>
    </div>
  );
}