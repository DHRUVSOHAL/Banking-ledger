import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../../service/auth.service"; // ✅ Correct relative path

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 1. Send OTP
  async function handleSendOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authService.forgetPassword(email);
      setMessage(res.data.message || "OTP sent successfully!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // 2. Verify OTP
  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ otp });
      setMessage(res.data.message || "OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  // 3. Reset Password & Auto Login
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authService.resetPassword(newPassword);
      setMessage(res.data.message || "Password updated!");
      
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {step === 1 && "Reset Password"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "Create New Password"}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          {step === 1 && "Enter your registered email to receive a reset code."}
          {step === 2 && `We've sent a 6-digit verification code to ${email}.`}
          {step === 3 && "Enter your new password to secure your account."}
        </p>

        {message && (
          <p className="text-emerald-400 text-sm bg-emerald-950/40 border border-emerald-800 rounded-md p-2.5 mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-md p-2.5 mb-4">
            {error}
          </p>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-300 text-sm font-medium block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? "Sending OTP..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-300 text-sm font-medium block mb-1">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 text-center text-xl tracking-widest font-mono rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-300 text-sm font-medium block mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? "Updating..." : "Update Password & Login"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}