import { apiRequest } from './client';

export async function getAccounts() {
  return apiRequest('/accounts/');
}

export async function createAccount() {
  return apiRequest('/accounts/', { method: 'POST' });
}

export async function getAccountBalance(accountId) {
  return apiRequest(`/accounts/balance/${accountId}`);
}
