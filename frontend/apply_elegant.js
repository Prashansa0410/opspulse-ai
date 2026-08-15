const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    "page.tsx",
    "ai-analyst/page.tsx",
    "anomalies/page.tsx",
    "approvals/page.tsx",
    "carriers/page.tsx",
    "data-quality/page.tsx",
    "root-cause/page.tsx",
    "simulations/page.tsx",
    "sla-risk/page.tsx",
    "system-health/page.tsx",
    "tower/page.tsx",
    "warehouses/page.tsx",
    "../components/MetricCard.tsx",
    "../components/Navbar.tsx",
    "../components/Sidebar.tsx"
];

const basePath = "/Users/prashansa/.gemini/antigravity/scratch/opspulse-ai/frontend/src/app";

// These replacements will make the UI minimal and elegant as requested.
const replacements = [
    // Change neutral borders and backgrounds to slate for the requested cool gray
    { old: /neutral-/g, newText: "slate-" },
    // Revert some cases where we want white or specific colors
    { old: /bg-slate-50(?!.*dark:)/g, newText: "bg-white" },
    { old: /bg-slate-100(?!.*dark:)/g, newText: "bg-slate-50" },
    
    // Fix specific hardcoded dark blocks (like health matrix) that missed the dark: prefix earlier
    { old: /bg-rose-950\/40/g, newText: "bg-rose-50 dark:bg-rose-950/40" },
    { old: /bg-amber-950\/40/g, newText: "bg-amber-50 dark:bg-amber-950/40" },
    { old: /text-rose-300/g, newText: "text-rose-700 dark:text-rose-300" },
    { old: /text-amber-300/g, newText: "text-amber-700 dark:text-amber-300" },
    { old: /text-rose-400/g, newText: "text-rose-600 dark:text-rose-400" },
    { old: /text-amber-400/g, newText: "text-amber-600 dark:text-amber-400" },
    { old: /text-emerald-400/g, newText: "text-emerald-600 dark:text-emerald-400" },
    { old: /text-blue-400/g, newText: "text-blue-600 dark:text-blue-400" },
    { old: /border-rose-900\/60/g, newText: "border-rose-200 dark:border-rose-900/60" },
    { old: /border-amber-900\/60/g, newText: "border-amber-200 dark:border-amber-900/60" },
    
    // Fix the terminal stream look
    { old: /bg-slate-950\/80/g, newText: "bg-slate-50 dark:bg-slate-950/80" },
    { old: /bg-slate-950\/90/g, newText: "bg-slate-50 dark:bg-slate-950/90" },
    
    // Table styling in tower
    { old: /divide-slate-800\/80/g, newText: "divide-slate-100 dark:divide-slate-800/80" },
    
    // Clean up shadow overload
    { old: /shadow-sm/g, newText: "shadow-sm dark:shadow-none" },
    { old: /shadow-sm dark:shadow-none dark:shadow-none/g, newText: "shadow-sm dark:shadow-none" },
];

for (const file of filesToUpdate) {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        for (const rule of replacements) {
            content = content.replace(rule.old, rule.newText);
        }
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
