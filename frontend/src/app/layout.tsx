import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { PersonaProvider } from "../components/PersonaSwitcher";
import { AuthProvider } from "../lib/auth";
import { LiveRefresh } from "../components/LiveRefresh";

export const metadata: Metadata = {
  title: "OpsPulse AI — AI-Powered Operational Intelligence & Decision Support",
  description: "Enterprise Operations Control Tower, ML SLA Risk Scoring, Root Cause Decomposition, and Autonomous AI Operations Analyst for High-Volume Commerce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <PersonaProvider>
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
            <LiveRefresh />
          </PersonaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
