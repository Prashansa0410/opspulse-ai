"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { Activity, Sparkles, FileCode2, ExternalLink } from "lucide-react";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Live Status */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-mono">OpsPulse<span className="text-blue-500 font-sans font-normal">.AI</span></span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 font-semibold">Enterprise</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">AI Operational Intelligence Tower</p>
            </div>
          </Link>

          {/* Incident Alert Ticker */}
          <div className="hidden lg:flex items-center gap-2 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-full text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-rose-300 font-medium font-mono text-[11px]">INCIDENT ACTIVE: BLR-01 Congestion (94.6% Util)</span>
          </div>
        </div>

        {/* Persona Switcher & Fast Links */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <PersonaSwitcher />
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/ai-analyst"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium hover:brightness-110 shadow-md shadow-blue-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Analyst</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.full_name}</span>
                  <span className="text-[10px] text-blue-400">{user.role}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
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
