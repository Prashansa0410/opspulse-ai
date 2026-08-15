"use client";

import React, { createContext, useContext, useState } from "react";
import { PersonaType } from "../lib/types";
import { ShieldCheck, UserCheck, BarChart3, Briefcase } from "lucide-react";

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  persona: "EXECUTIVE",
  setPersona: () => {},
});

export const usePersona = () => useContext(PersonaContext);

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<PersonaType>("EXECUTIVE");

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const PersonaSwitcher: React.FC = () => {
  const { persona, setPersona } = usePersona();

  const personas: { id: PersonaType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "EXECUTIVE", label: "Executive", icon: <Briefcase className="w-3.5 h-3.5" />, desc: "High-level KPIs & Revenue Risk" },
    { id: "OPS_MANAGER", label: "Ops Manager", icon: <ShieldCheck className="w-3.5 h-3.5" />, desc: "Warehouse & Carrier bottlenecks" },
    { id: "BUSINESS_MANAGER", label: "Business Lead", icon: <UserCheck className="w-3.5 h-3.5" />, desc: "Customer cohorts & GMV impact" },
    { id: "DATA_ANALYST", label: "Data Analyst", icon: <BarChart3 className="w-3.5 h-3.5" />, desc: "SQL schemas & ML metrics" },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
      {personas.map((p) => {
        const active = persona === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            title={p.desc}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            {p.icon}
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
};
