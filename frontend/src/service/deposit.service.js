import api from './api';

export const depositService = {
  createDepositRequest: (data) => api.post('/deposits', data),
  getMyDepositRequests: () => api.get('/deposits/my'),

  // Admin audit lists
  getPendingRequests: () => api.get('/deposits/pending'),
  getApprovedRequests: () => api.get('/deposits/approved'),
  getRejectedRequests: () => api.get('/deposits/rejected'),

  // Admin actions (matching router POST format)
  approveRequest: (requestId) => api.post(`/deposits/${requestId}/approve`),
  rejectRequest: (requestId) => api.post(`/deposits/${requestId}/reject`),
};