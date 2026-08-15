"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Activity, Sparkles, FileCode2, ExternalLink } from "lucide-react";
import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Live Status */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px] tracking-tight text-neutral-100 font-sans">OpsPulse<span className="text-blue-500 font-normal">.ai</span></span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.5 rounded text-neutral-400 border border-neutral-800 font-medium tracking-wide">Enterprise</span>
              </div>
            </div>
          </Link>

          {/* Incident Alert Ticker */}
          <div className="hidden lg:flex items-center gap-2 border border-neutral-800/80 bg-neutral-900/50 px-3 py-1 rounded-full text-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wide">Incident Active: BLR-01 Congestion (94.6% Util)</span>
          </div>
        </div>

        {/* Persona Switcher & Fast Links */}
        <div className="flex items-center gap-3">


          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-transparent hover:border-neutral-800 transition-all">
                <div className="flex flex-col text-right">
                  <span className="text-[13px] font-medium text-neutral-200">{user.full_name}</span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">{user.role.replace("_", " ")}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-1.5 hover:bg-neutral-900 rounded text-neutral-500 hover:text-neutral-300 transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-3 py-1.5 rounded bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors"
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
