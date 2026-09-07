import { useCallback, useEffect, useState } from 'react';
import { depositService } from '../../../service/deposit.service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DashboardNav from '../../dashboard/components/DashboardNav';

export default function RejectedDeposits() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await depositService.getRejectedRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRejected();
  }, [fetchRejected]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <DashboardNav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Rejected Deposits</h1>
            <p className="text-zinc-500 text-sm">Audit log of all declined deposit requests</p>
          </div>
          <span className="bg-rose-950/80 text-rose-400 border border-rose-800 text-xs px-3 py-1 rounded-full font-mono font-semibold">
            {requests.length} Rejected
          </span>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg p-4 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-400">No rejected deposits found</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-white font-medium">
                  {req.user?.name} ({req.user?.email})
                </p>
                <p className="text-zinc-500 text-xs font-mono mt-1">
                  Account: {req.account?._id || req.account}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-zinc-400 font-bold font-mono">₹{req.amount}</p>
                  {req.reviewedAt && (
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Rejected on: {new Date(req.reviewedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="bg-rose-950 text-rose-400 border border-rose-800 text-xs px-2.5 py-1 rounded-md font-semibold">
                  REJECTED
                </span>
                {req.reviewedBy && (
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    By: {req.reviewedBy.name || 'Admin'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}