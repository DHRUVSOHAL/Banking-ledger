import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const headingText = "You can Login to your account here";
  const [displayedHeading, setDisplayedHeading] = useState("");
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayedHeading("");
    setIsAnimationDone(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < headingText.length) {
        index++;
        setDisplayedHeading(headingText.slice(0, index));
      } else {
        clearInterval(timer);
        setIsAnimationDone(true);
      }
    }, 20);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });

      const isSystemAdmin = data?.user?.systemUser;
      const targetPath = isSystemAdmin ? "/admin/deposits" : "/dashboard";

      // Cookie write aur AuthContext sync hone ka 100ms buffer
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 100);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-4 select-text">
      <h1 className="text-4xl font-bold text-white mb-6 tracking-tight min-h-[48px] flex items-center">
        {displayedHeading}
        {displayedHeading.length < headingText.length && (
          <span className="animate-pulse bg-zinc-900 ml-1 inline-block w-0.5 h-7" />
        )}
      </h1>

      {isAnimationDone && (
        <div className="animate-fade-in transition-all duration-500">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-white font-medium text-sm">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-zinc-300 bg-white text-black rounded-md p-2 w-full h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white font-medium text-sm">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-zinc-300 bg-white text-black rounded-md p-2 w-full h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-md p-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium p-2.5 rounded-md transition-colors mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center mt-2">
              <Link
                to="/forgot-password"
                className="text-red-500 hover:text-red-400 text-sm font-semibold tracking-wide transition-colors duration-200 inline-block hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}