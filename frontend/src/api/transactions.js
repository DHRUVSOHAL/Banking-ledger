import { apiRequest } from './client';

export async function createTransfer({ fromAccount, toAccount, amount, idempotencyKey }) {
  return apiRequest('/transections/', {
    method: 'POST',
    body: JSON.stringify({ fromAccount, toAccount, amount, idempotencyKey }),
  });
}
