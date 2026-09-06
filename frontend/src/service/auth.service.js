import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forget-password", { email }),
  verifyOtp: ({ email, otp }) => api.post("/auth/verify-otp", { email, otp }),
  resetPassword: (newPassword) => api.post("/auth/reset-password", { newPassword }),
};