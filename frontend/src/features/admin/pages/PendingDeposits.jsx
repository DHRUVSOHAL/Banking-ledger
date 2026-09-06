import { useCallback, useEffect, useState } from 'react';
import { depositService } from '../../../service/deposit.service';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DashboardNav from '../../dashboard/components/DashboardNav';

export default function PendingDeposits() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await depositService.getPendingRequests();
      setRequests(res.data.requests || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleApprove(requestId) {
    setActionLoadingId(requestId);
    setError('');
    try {
      await depositService.approveRequest(requestId);
      await fetchRequests();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(requestId) {
    setActionLoadingId(requestId);
    setError('');
    try {
      await depositService.rejectRequest(requestId);
      await fetchRequests();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardNav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Pending Deposit Requests</h1>
        <p className="text-zinc-500 text-sm mb-6">Approve or reject user deposit requests</p>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg p-4 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-400">No pending requests</p>
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
                  Account: {req.account?._id}
                </p>
                <p className="text-emerald-400 font-bold mt-1">₹{req.amount}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req._id)}
                  disabled={actionLoadingId === req._id}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-md"
                >
                  {actionLoadingId === req._id ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  disabled={actionLoadingId === req._id}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-md"
                >
                  {actionLoadingId === req._id ? '...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}