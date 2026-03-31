const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];

const replacements = [
  // Backgrounds & borders
  { from: /bg-\[#0D0F14\]/g, to: 'bg-slate-50' },
  { from: /bg-\[#111827\]/g, to: 'bg-white' },
  { from: /bg-\[#0B0C10\]/g, to: 'bg-slate-100' },
  { from: /hover:bg-\[#1F2937\]/g, to: 'hover:bg-slate-100' },
  { from: /hover:bg-\[#374151\]/g, to: 'hover:bg-slate-200' },
  { from: /border-\[#1F2937\]/g, to: 'border-slate-200' },
  { from: /border-\[#111827\]/g, to: 'border-slate-100' },
  { from: /border-\[#374151\]/g, to: 'border-slate-300' },
  
  // Text colors
  { from: /text-\[#E5E7EB\]/g, to: 'text-slate-900' },
  { from: /hover:text-white/g, to: 'hover:text-slate-900' },
  // Let's keep gray-400 as is initially, but we map specific grays if needed. 
  
  // Brand color (Indigo #4F46E5 -> Green #166534)
  { from: /text-\[#4F46E5\]/g, to: 'text-[#166534]' },
  { from: /bg-\[#4F46E5\]/g, to: 'bg-[#166534]' },
  { from: /border-\[#4F46E5\]/g, to: 'border-[#166534]' },
  { from: /hover:text-\[#4338CA\]/g, to: 'hover:text-[#14532D]' },
  { from: /hover:bg-\[#3730A3\]/g, to: 'hover:bg-[#14532D]' },
  { from: /accent-\[#4F46E5\]/g, to: 'accent-[#166534]' },
  
  // Opacities
  { from: /bg-\[#4F46E5\]\/10/g, to: 'bg-[#166534]/10' },
  { from: /bg-\[#4F46E5\]\/15/g, to: 'bg-[#166534]/15' },
  { from: /bg-\[#4F46E5\]\/20/g, to: 'bg-[#166534]/20' },
  { from: /bg-\[#4F46E5\]\/30/g, to: 'bg-[#166534]/30' },
  { from: /border-\[#4F46E5\]\/30/g, to: 'border-[#166534]/30' },
  { from: /border-\[#4F46E5\]\/20/g, to: 'border-[#166534]/20' },
  { from: /text-\[#4F46E5\]\/30/g, to: 'text-[#166534]/30' },
  { from: /text-\[#4F46E5\]\/70/g, to: 'text-[#166534]/70' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.from.test(content)) {
          content = content.replace(rule.from, rule.to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Done!');
