import { createContext, useContext, useState } from "react";
import type { AuthContextType, AuthProviderProps } from "../interface";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));

  function login(token: string, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setToken(token);
    setUserId(userId);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  }

  return <AuthContext.Provider value={{ token, userId, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
