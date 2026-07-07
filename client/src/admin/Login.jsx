import { Leaf, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-green-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>

        {/* Logo & Title */}
        <div className="mb-6 text-center">
          <span className="inline-grid h-14 w-14 place-items-center rounded-xl bg-forest text-white shadow-md mb-3">
            <Leaf size={26} />
          </span>
          <h1 className="text-2xl font-black">Environment Warrior</h1>
          <p className="text-sm text-ink/50 mt-1">
            Admin Portal — Authorized Access Only
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={submit}
          className="grid gap-5 rounded-xl border border-ink/10 bg-white p-7 shadow-soft"
        >
          <div>
            <h2 className="text-xl font-black">Welcome back 👋</h2>
            <p className="text-sm text-ink/50 mt-0.5">
              Sign in to manage your content
            </p>
          </div>

          {/* Email */}
          <label className="grid gap-2">
            <span className="label">Email Address</span>
            <input
              className="field"
              type="email"
              placeholder="admin@envwarrior.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </label>

          {/* Password */}
          <label className="grid gap-2">
            <span className="label">Password</span>
            <input
              className="field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </label>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">
              ❌ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>

          {/* Footer note */}
          <p className="text-center text-xs text-ink/40">
            🔒 Secure admin access. Contact your administrator if you need help.
          </p>
        </form>
      </div>
    </main>
  );
}
