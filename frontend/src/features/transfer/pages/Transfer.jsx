import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts } from '../../../api/accounts';
import { createTransfer } from '../../../api/transactions';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DashboardNav from '../../dashboard/components/DashboardNav';

export default function Transfer() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const data = await getAccounts();
      const active = (data.accounts || []).filter((a) => a.status === 'ACTIVE');
      setAccounts(active);
      if (active.length > 0) setFromAccount(active[0]._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedAmount = parseFloat(amount);
    if (!fromAccount || !toAccount) {
      setError('Please select both accounts');
      return;
    }
    if (fromAccount === toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const data = await createTransfer({
        fromAccount,
        toAccount,
        amount: parsedAmount,
        idempotencyKey,
      });
      setSuccess(data.message || 'Transfer completed successfully');
      setAmount('');
      setToAccount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardNav />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Transfer Money</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Send funds between accounts using double-entry ledger entries
        </p>

        {loadingAccounts ? (
          <LoadingSpinner />
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-400">You need at least one active account</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-sm font-medium">From Account</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a._id.slice(-8)} ({a.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-sm font-medium">To Account ID</label>
              <input
                type="text"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="Paste recipient account ID"
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-sm font-medium">Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-lg p-3 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium p-2.5 rounded-lg transition-colors mt-2"
            >
              {submitting ? 'Processing...' : 'Send Transfer'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
