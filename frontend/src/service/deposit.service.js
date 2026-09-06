import api from "./api";

export const depositService = {
  createRequest: ({ accountId, amount, idempotencyKey }) =>
    api.post("/deposit-requests", { accountId, amount, idempotencyKey }),

  getMyRequests: () => api.get("/deposit-requests/my"),

  getPendingRequests: () => api.get("/deposit-requests/pending"),

  approveRequest: (requestId) => api.post(`/deposit-requests/${requestId}/approve`),

  rejectRequest: (requestId) => api.post(`/deposit-requests/${requestId}/reject`),
};