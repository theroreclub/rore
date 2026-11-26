import fs from 'fs';
import path from 'path';

const products = [
  { slug: 'cyber-acid-wash-hoodie', name: 'Cyber Acid Wash Hoodie', tag: 'STREETWEAR', c1: '#111827', c2: '#374151', accent: '#38bdf8' },
  { slug: 'obsidian-cargo-pants', name: 'Obsidian Tactical Cargos', tag: 'CARGO PANTS', c1: '#0f172a', c2: '#1e293b', accent: '#f59e0b' },
  { slug: 'vintage-boxy-tee', name: 'Raw Edge Boxy Tee', tag: 'HEAVYWEIGHT', c1: '#1c1917', c2: '#292524', accent: '#a8a29e' },
  { slug: 'heavyweight-crewneck', name: 'Monolith Heavy Crewneck', tag: 'ESSENTIALS', c1: '#18181b', c2: '#27272a', accent: '#cbd5e1' },
  
  { slug: 'shibuya-ghost-tee', name: 'Shibuya Ghost Tee', tag: '渋谷 // 幽霊', c1: '#2e1065', c2: '#3b0764', accent: '#e879f9' },
  { slug: 'neo-tokyo-mecha-hoodie', name: 'Neo-Tokyo Mecha Hoodie', tag: '機甲 // 01', c1: '#022c22', c2: '#064e3b', accent: '#34d399' },
  { slug: 'redline-division-tee', name: 'Redline Division Tee', tag: '限界突破', c1: '#450a0a', c2: '#7f1d1d', accent: '#f87171' },
  { slug: 'hollow-mask-acid-wash-tee', name: 'Hollow Mask Acid Tee', tag: '虚 // HOLLOW', c1: '#172554', c2: '#1e3a8a', accent: '#60a5fa' },
  
  { slug: 'tactical-crossbody-bag', name: 'Tactical Crossbody Bag', tag: 'MODULAR GEAR', c1: '#1e1b4b', c2: '#312e81', accent: '#818cf8' },
  { slug: 'kanji-distressed-cap', name: 'Kanji Distressed Cap', tag: 'HEADWEAR', c1: '#141414', c2: '#262626', accent: '#e11d48' },
  { slug: 'industrial-chain-choker', name: 'Industrial Chain Choker', tag: 'HARDWARE', c1: '#18181b', c2: '#3f3f46', accent: '#d4d4d8' },
  { slug: 'ribbed-knit-beanie', name: 'Folded Ribbed Beanie', tag: 'HEADWEAR', c1: '#09090b', c2: '#18181b', accent: '#f43f5e' }
];

const targetDir = path.resolve('public/images/products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const p of products) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="grad-${p.slug}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.c1}" />
      <stop offset="100%" stop-color="${p.c2}" />
    </linearGradient>
    <pattern id="grid-${p.slug}" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="600" height="600" fill="url(#grad-${p.slug})" />
  <rect width="600" height="600" fill="url(#grid-${p.slug})" />
  
  <!-- Outer border accent -->
  <rect x="20" y="20" width="560" height="560" fill="none" stroke="${p.accent}" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="8 4" />
  
  <!-- Brand logo mark -->
  <text x="40" y="60" fill="#9ca3af" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="3">RORE CLUB // 2026</text>
  <circle cx="550" cy="55" r="5" fill="${p.accent}" />

  <!-- Center Graphic Silhouette -->
  <g transform="translate(300, 290)">
    <circle r="130" fill="none" stroke="${p.accent}" stroke-width="2" stroke-opacity="0.3" />
    <circle r="105" fill="${p.accent}" fill-opacity="0.08" />
    <!-- Stylized apparel hanger / streetwear icon -->
    <path d="M -60 -10 L 0 -50 L 60 -10 L 45 60 L -45 60 Z" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linejoin="round" />
    <path d="M 0 -50 C 0 -65, 20 -65, 20 -75 C 20 -85, -5 -85, -5 -75" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Tag Pill -->
  <g transform="translate(50, 440)">
    <rect width="180" height="28" rx="14" fill="${p.accent}" fill-opacity="0.2" stroke="${p.accent}" stroke-width="1" />
    <text x="90" y="18" fill="${p.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle">${p.tag}</text>
  </g>

  <!-- Product Name -->
  <text x="50" y="505" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800">${p.name}</text>
  <text x="50" y="530" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">LIMITED EDITION DROP • 100% COMBED COTTON</text>
</svg>`;

  fs.writeFileSync(path.join(targetDir, `${p.slug}.svg`), svg);
}

console.log(`Successfully generated ${products.length} placeholder SVGs in ${targetDir}`);
