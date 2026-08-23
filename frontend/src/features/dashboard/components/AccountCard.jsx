import { useEffect, useState } from 'react';
import { getAccountBalance } from '../../../api/accounts';
import LoadingSpinner from '../../../components/LoadingSpinner';

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

function truncateId(id) {
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export default function AccountCard({ account }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getAccountBalance(account._id)
      .then((data) => {
        if (!cancelled) setBalance(data.balance);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
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
    </div>
  );
}
