"use client";

import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await api.login({ username, password });
      login(access_token);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "exec" | "ops" | "data") => {
    const usr = `${role}@opspulse.ai`;
    const pwd = "demo123";
    setUsername(usr);
    setPassword(pwd);
    
    setError("");
    setLoading(true);
    try {
      const { access_token } = await api.login({ username: usr, password: pwd });
      login(access_token);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            &times;
          </button>
        )}

        <h2 className="text-2xl font-semibold mb-6 text-white text-center">
          Sign In to OpsPulse
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="border-t border-slate-700/50 pt-6">
          <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-wider font-semibold">
            Or Use 1-Click Demo Roles
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemoLogin("exec")}
              className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg transition-colors text-slate-200"
            >
              Log in as <strong>Executive</strong>
            </button>
            <button
              onClick={() => handleDemoLogin("ops")}
              className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg transition-colors text-slate-200"
            >
              Log in as <strong>Operations Manager</strong>
            </button>
            <button
              onClick={() => handleDemoLogin("data")}
              className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg transition-colors text-slate-200"
            >
              Log in as <strong>Data Analyst</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
