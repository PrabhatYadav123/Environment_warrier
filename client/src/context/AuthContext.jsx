import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("ew_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ew_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ew_token", data.token);
    localStorage.setItem("ew_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("ew_token");
    localStorage.removeItem("ew_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout, setUser, setToken }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
