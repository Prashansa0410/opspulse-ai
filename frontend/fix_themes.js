const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    "anomalies/page.tsx",
    "approvals/page.tsx",
    "carriers/page.tsx",
    "data-quality/page.tsx",
    "root-cause/page.tsx",
    "simulations/page.tsx",
    "sla-risk/page.tsx",
    "system-health/page.tsx",
    "tower/page.tsx",
    "warehouses/page.tsx"
];

const replacements = {
    "bg-\\[\\#111827\\]/90": "bg-white dark:bg-[#111827]/90",
    "bg-\\[\\#111827\\](?!/90)": "bg-white dark:bg-[#111827]",
    "bg-slate-900/90": "bg-neutral-50 dark:bg-slate-900/90",
    "bg-slate-900/80": "bg-neutral-50 dark:bg-slate-900/80",
    "bg-slate-900(?!/)": "bg-neutral-100 dark:bg-slate-900",
    "bg-slate-800/40": "bg-neutral-100 dark:bg-slate-800/40",
    "bg-slate-800(?!/|\\])": "bg-neutral-200 dark:bg-slate-800",
    "bg-slate-950(?!/|\\])": "bg-white dark:bg-slate-950",
    "border-slate-800/90": "border-neutral-200 dark:border-slate-800/90",
    "border-slate-800(?!/)": "border-neutral-200 dark:border-slate-800",
    "border-slate-700(?!/)": "border-neutral-300 dark:border-slate-700",
    "text-slate-400": "text-neutral-600 dark:text-slate-400",
    "text-slate-300": "text-neutral-700 dark:text-slate-300",
    "text-slate-200": "text-neutral-800 dark:text-slate-200",
    "text-white(?!-)": "text-neutral-900 dark:text-white"
};

function applyReplacements(content) {
    let result = content;
    for (const [oldRegex, newText] of Object.entries(replacements)) {
        // use negative lookbehind if supported, or just ignore ones already starting with dark:
        // Node.js supports negative lookbehind
        const regex = new RegExp(`(?<!dark:)${oldRegex}`, 'g');
        result = result.replace(regex, newText);
    }

    result = result.replace(/bg-blue-600 hover:brightness-110 text-neutral-900 dark:text-white/g, "bg-blue-600 hover:brightness-110 text-white");
    result = result.replace(/bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-neutral-900 dark:text-white/g, "bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white");
    result = result.replace(/bg-blue-600 hover:bg-blue-500 text-neutral-900 dark:text-white/g, "bg-blue-600 hover:bg-blue-500 text-white");
    result = result.replace(/bg-indigo-600 hover:bg-indigo-500 text-neutral-900 dark:text-white/g, "bg-indigo-600 hover:bg-indigo-500 text-white");
    result = result.replace(/bg-emerald-600 hover:bg-emerald-500 text-neutral-900 dark:text-white/g, "bg-emerald-600 hover:bg-emerald-500 text-white");
    result = result.replace(/bg-rose-600 hover:bg-rose-500 text-neutral-900 dark:text-white/g, "bg-rose-600 hover:bg-rose-500 text-white");

    return result;
}

const basePath = "/Users/prashansa/.gemini/antigravity/scratch/opspulse-ai/frontend/src/app";

for (const file of filesToUpdate) {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const newContent = applyReplacements(content);
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
}
