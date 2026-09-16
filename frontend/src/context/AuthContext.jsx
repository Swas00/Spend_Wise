import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, getProfile } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("spendwise-user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("spendwise-token") || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync token and verify user on mount or token change
  useEffect(() => {
    let active = true;

    async function verifySession() {
      const savedToken = localStorage.getItem("spendwise-token");
      if (!savedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { user: profileUser } = await getProfile();
        if (active) {
          setUser(profileUser);
          localStorage.setItem("spendwise-user", JSON.stringify(profileUser));
        }
      } catch (err) {
        console.warn("Session verification failed:", err.message);
        if (active) {
          localStorage.removeItem("spendwise-token");
          localStorage.removeItem("spendwise-user");
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem("spendwise-token", data.token);
    localStorage.setItem("spendwise-user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    localStorage.setItem("spendwise-token", data.token);
    localStorage.setItem("spendwise-user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("spendwise-token");
    localStorage.removeItem("spendwise-user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
