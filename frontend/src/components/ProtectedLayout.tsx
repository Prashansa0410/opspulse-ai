"use client";

import { useAuth } from "../lib/auth";
import { LoginModal } from "./LoginModal";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mounted } = useAuth();

  // Show nothing while checking auth to avoid flash of content
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090d16]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium tracking-wide">Loading OpsPulse...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-[#090d16] items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover">
        {/* Render only the login modal without the background app */}
        <LoginModal isOpen={true} />
      </div>
    );
  }

  return <>{children}</>;
}
