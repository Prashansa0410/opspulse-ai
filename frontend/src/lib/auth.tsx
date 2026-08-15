"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "./api";

export interface User {
  sub: string;
  email: string;
  role: "EXECUTIVE" | "OPS_MANAGER" | "DATA_ANALYST";
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem("opspulse_token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<User & { exp: number }>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            sub: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            full_name: decoded.full_name,
          });
          api.setToken(storedToken);
        } else {
          localStorage.removeItem("opspulse_token");
        }
      } catch (e) {
        localStorage.removeItem("opspulse_token");
      }
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<User>(newToken);
      localStorage.setItem("opspulse_token", newToken);
      setToken(newToken);
      setUser({
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        full_name: decoded.full_name,
      });
      api.setToken(newToken);
    } catch (e) {
      console.error("Invalid token");
    }
  };

  const logout = () => {
    localStorage.removeItem("opspulse_token");
    setToken(null);
    setUser(null);
    api.setToken(null);
    window.location.href = "/";
  };

  if (!mounted) {
    return null; // Avoid SSR hydration mismatch
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
