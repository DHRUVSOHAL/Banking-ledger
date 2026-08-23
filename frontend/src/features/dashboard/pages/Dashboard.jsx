import { useCallback, useEffect, useState } from 'react';
import { getAccounts } from '../../../api/accounts';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DashboardNav from '../components/DashboardNav';
import AccountCard from '../components/AccountCard';
import CreateAccountButton from '../components/CreateAccountButton';

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAccounts();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Accounts</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Balances are derived from the immutable ledger
            </p>
          </div>
          <CreateAccountButton onCreated={fetchAccounts} />
        </div>

        {loading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && accounts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-400">No accounts yet</p>
            <p className="text-zinc-600 text-sm mt-1">Create your first account to get started</p>
          </div>
        )}

        {!loading && accounts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard key={account._id} account={account} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
