"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Activity, Sparkles, FileCode2, ExternalLink } from "lucide-react";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-900 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Live Status */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500 group-hover:text-blue-600 dark:text-blue-400 transition-colors" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px] tracking-tight text-slate-900 dark:text-slate-100 font-sans">OpsPulse<span className="text-blue-500 font-normal">.ai</span></span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-800 font-medium tracking-wide">Enterprise</span>
              </div>
            </div>
          </Link>

          {/* Incident Alert Ticker */}
          <div className="hidden lg:flex items-center gap-2 border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 px-3 py-1 rounded-full text-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wide">Incident Active: BLR-01 Congestion (94.6% Util)</span>
          </div>
        </div>

        {/* Persona Switcher & Fast Links */}
        <div className="flex items-center gap-3">


          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                <div className="flex flex-col text-right">
                  <span className="text-[13px] font-medium text-slate-800 dark:text-slate-200">{user.full_name}</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{user.role.replace("_", " ")}</span>
                </div>
                <ThemeToggle />
                <button 
                  onClick={logout}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-3 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Sign In
              </button>
            )}

          </div>
        </div>

      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};
