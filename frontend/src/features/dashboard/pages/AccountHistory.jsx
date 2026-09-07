import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accountsService } from '../../../service/accounts.service'; // 👈 Tumhari service import karo
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function AccountHistory() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError('');
      try {
        // 👇 Service function call karo
        const res = await accountsService.getAccountLedgerHistory(accountId);
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    if (accountId) {
      fetchHistory();
    }
  }, [accountId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-zinc-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to Accounts
        </button>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg p-4 text-sm mb-6">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Account Info Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Passbook / Statement</span>
                <h1 className="text-2xl font-bold font-mono text-white mt-1">
                  Account: {data.accountNumber || accountId}
                </h1>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-zinc-500">Current Balance</span>
                <p className="text-2xl font-bold text-emerald-400 font-mono">
                  ₹{Number(data.balance || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="font-semibold text-white text-sm">Ledger Entries</h2>
                <span className="text-xs text-zinc-400">{data.entries?.length || 0} Records</span>
              </div>

              {!data.entries || data.entries.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  No transactions found for this account.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase bg-zinc-950/40">
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-mono">
                      {data.entries.map((entry) => {
                        const isCredit = entry.type === 'CREDIT';
                        return (
                          <tr key={entry._id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="py-4 px-4 font-sans">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-md font-semibold tracking-wide ${
                                  isCredit
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                    : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                }`}
                              >
                                {entry.type}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-zinc-400 text-xs font-mono">
                              {entry.transection?._id ? `${entry.transection._id.slice(0, 12)}...` : 'Direct Ledger Entry'}
                            </td>
                            <td className="py-4 px-4 text-zinc-400 text-xs font-sans">
                              {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td
                              className={`py-4 px-4 text-right font-bold text-base ${
                                isCredit ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isCredit ? '+' : '-'}₹{Number(entry.amount).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}