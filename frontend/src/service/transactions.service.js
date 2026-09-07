import api from "./api";

export const transactionsService = {
  createTransfer: (data) => api.post("/api/transactions", data), // 👈 path fixed
};