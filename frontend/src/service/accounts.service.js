import api from "./api";

export const accountsService = {
  getAccounts: () => api.get("/accounts"),

  getAccountBalance: (accountId) => api.get(`/accounts/balance/${accountId}`),

  createAccount: () => api.post("/accounts"),
};