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
    let usr = "";
    let pwd = "";
    if (role === "exec") {
      usr = "exec@opspulse.ai";
      pwd = "Executive123!";
    } else if (role === "ops") {
      usr = "ops@opspulse.ai";
      pwd = "OpsManager123!";
    } else if (role === "data") {
      usr = "analyst@opspulse.ai";
      pwd = "DataAnalyst123!";
    }
    
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-900 rounded p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300"
          >
            &times;
          </button>
        )}

        <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100 text-center tracking-tight">
          Sign In to OpsPulse
        </h2>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 p-3 rounded mb-4 text-xs font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-[11px] font-mono text-neutral-500 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-300 dark:border-neutral-800 rounded px-3 py-2 text-neutral-900 dark:text-neutral-200 text-sm focus:border-neutral-400 dark:focus:border-neutral-600 outline-none transition-colors"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-neutral-500 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-300 dark:border-neutral-800 rounded px-3 py-2 text-neutral-900 dark:text-neutral-200 text-sm focus:border-neutral-400 dark:focus:border-neutral-600 outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 font-bold py-2 px-4 rounded text-sm transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="border-t border-neutral-200 dark:border-neutral-900 pt-6">
          <p className="text-[10px] text-neutral-500 mb-3 text-center uppercase tracking-wider font-mono">
            Or Use 1-Click Demo Roles
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemoLogin("exec")}
              className="text-xs font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 py-2 rounded transition-colors text-neutral-700 dark:text-neutral-300"
            >
              Log in as <strong>Executive</strong>
            </button>
            <button
              onClick={() => handleDemoLogin("ops")}
              className="text-xs font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 py-2 rounded transition-colors text-neutral-700 dark:text-neutral-300"
            >
              Log in as <strong>Operations Manager</strong>
            </button>
            <button
              onClick={() => handleDemoLogin("data")}
              className="text-xs font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 py-2 rounded transition-colors text-neutral-700 dark:text-neutral-300"
            >
              Log in as <strong>Data Analyst</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
