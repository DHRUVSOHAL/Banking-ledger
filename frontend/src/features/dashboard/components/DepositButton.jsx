import { useState } from 'react';
import { depositService } from '../../../service/deposit.service';

export default function DepositButton({ accountId, onDeposited }) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await depositService.createRequest({
        accountId,
        amount: parsedAmount,
        idempotencyKey,
      });
      setSuccess(res.data.message || 'Deposit submitted');
      setAmount('');
      onDeposited?.(); // parent ko batao balance refresh karne ke liye
      setTimeout(() => {
        setShowForm(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="text-xs text-emerald-400 hover:text-emerald-300 text-left transition-colors"
      >
        + Deposit funds
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-1">
      <input
        type="number"
        min="1"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        autoFocus
        className="bg-zinc-800 border border-zinc-700 text-white rounded-md p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-emerald-400 text-xs">{success}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded-md"
        >
          {loading ? 'Sending...' : 'Request'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}