import api from "./api";

export const authService = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
  forgetPassword: (email) => api.post("/api/auth/forget-password", { email }),
  verifyOtp: ({ otp }) => api.post("/api/auth/verify-otp", { otp }), // ✅ Fixed
  resetPassword: (newPassword) => api.post("/api/auth/reset-password", { newPassword }),
};