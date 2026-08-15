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

for (const file of filesToUpdate) {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        content = content.replace(/dark:text-rose-600 dark:text-rose-400/g, "dark:text-rose-400");
        content = content.replace(/dark:text-blue-600 dark:text-blue-400/g, "dark:text-blue-400");
        content = content.replace(/dark:text-amber-600 dark:text-amber-400/g, "dark:text-amber-400");
        content = content.replace(/dark:text-emerald-600 dark:text-emerald-400/g, "dark:text-emerald-400");
        content = content.replace(/shadow-sm dark:shadow-none dark:shadow-none/g, "shadow-sm dark:shadow-none");
        
        fs.writeFileSync(fullPath, content, 'utf8');
    }
}
