import { Leaf } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin12345");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <form onSubmit={submit} className="grid w-full max-w-md gap-5 rounded-md border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-forest text-white">
            <Leaf size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-black">Admin Login</h1>
            <p className="text-sm text-ink/60">Manage blogs and media.</p>
          </div>
        </div>
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="grid gap-2">
          <span className="label">Password</span>
          <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button className="btn-primary">Login</button>
      </form>
    </main>
  );
}
