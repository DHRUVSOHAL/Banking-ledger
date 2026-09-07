import api from "./api";

export const accountsService = {
  getAccounts: () => api.get("/api/accounts"),

  getAccountBalance: (accountId) => api.get(`/api/accounts/balance/${accountId}`),

  createAccount: () => api.post("/api/accounts"),
  getAccountLedgerHistory: (accountId) => api.get(`/api/accounts/${accountId}/history`),
};
