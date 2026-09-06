import api from "./api";

export const transactionsService = {
  createTransfer: (data) => api.post("/transections", data), // 👈 path fixed
};