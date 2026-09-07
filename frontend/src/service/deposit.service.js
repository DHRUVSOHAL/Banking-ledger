import api from './api';

export const depositService = {
  createDepositRequest: (data) => api.post('/api/deposits', data),
  getMyDepositRequests: () => api.get('/api/deposits/my'),

  // Admin audit lists
  getPendingRequests: () => api.get('/api/deposits/pending'),
  getApprovedRequests: () => api.get('/api/deposits/approved'),
  getRejectedRequests: () => api.get('/api/deposits/rejected'),

  // Admin actions (matching router POST format)
  approveRequest: (requestId) => api.post(`/api/deposits/${requestId}/approve`),
  rejectRequest: (requestId) => api.post(`/api/deposits/${requestId}/reject`),
};