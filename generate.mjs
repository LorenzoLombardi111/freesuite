#!/usr/bin/env node
// Freesuite hub regenerator.
//
// Single source of truth: tools.json (categories + tool entries with all metadata).
// Re-running this script deterministically rebuilds every tool-dependent file.
//
// Run: `node generate.mjs` from the build-freesuite dir.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const { categories: CATEGORIES, tools: TOOLS } = JSON.parse(fs.readFileSync(`${ROOT}/tools.json`, 'utf8'));

// Shared CSS block used in every per-tool page and the catalog index.
const CSS = `*{box-sizing:border-box;margin:0;padding:0}:root{--bg:#faf9f6;--surface:#f4f2ee;--border:#e8e4dd;--text-primary:#1a1917;--text-secondary:#6b6760;--text-muted:#9e9b96;--accent:#C49A2A;--accent-hover:#A8831F;--shadow:0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);--font-body:"Lora",Georgia,serif;--font-ui:"DM Sans",-apple-system,system-ui,sans-serif}html.dark{--bg:#141412;--surface:#1e1c1a;--border:#2e2b27;--text-primary:#f0ede8;--text-secondary:#9e9b96;--text-muted:#6b6760;--accent:#D4A835;--accent-hover:#C49A2A;--shadow:0 1px 3px rgba(0,0,0,.3),0 2px 8px rgba(0,0,0,.2)}html,body{background:var(--bg);color:var(--text-primary);font-family:var(--font-body);font-size:15px;line-height:1.7;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}.header{position:sticky;top:0;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid var(--border);background:var(--bg);z-index:10}.brand{font-family:var(--font-ui);font-size:16px;font-weight:700;color:var(--accent)}.brand-mark{display:inline-block;width:18px;height:18px;margin-right:8px;vertical-align:-3px}.theme-toggle{font-family:var(--font-ui);font-size:13px;font-weight:500;background:var(--surface);color:var(--text-secondary);border:1px solid var(--border);border-radius:20px;padding:6px 14px;cursor:pointer}.theme-toggle:hover{background:var(--border);color:var(--text-primary)}.breadcrumb{max-width:880px;margin:24px auto 0;padding:0 24px;font-family:var(--font-ui);font-size:13px;color:var(--text-muted)}.breadcrumb a{color:var(--accent);font-weight:500}.breadcrumb a:hover{text-decoration:underline}.page-hero{max-width:880px;margin:0 auto;padding:24px 24px 32px}.page-hero h1{font-family:var(--font-ui);font-size:36px;font-weight:700;line-height:1.15;letter-spacing:-.02em;margin-bottom:16px}.page-hero p{font-family:var(--font-ui);font-size:18px;color:var(--text-secondary);line-height:1.5;max-width:720px}@media (max-width:640px){.page-hero h1{font-size:28px}.page-hero p{font-size:16px}}main{max-width:880px;margin:0 auto;padding:0 24px 64px}.launch-cta{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:20px 24px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:40px}.launch-cta-text{flex:1;min-width:200px}.launch-cta-label{font-family:var(--font-ui);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px}.launch-cta-url{font-family:var(--font-ui);font-size:15px;font-weight:600;color:var(--text-primary)}.launch-btn{font-family:var(--font-ui);font-size:14px;font-weight:600;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:10px 24px;cursor:pointer;transition:all .15s ease;text-decoration:none;display:inline-block}.launch-btn:hover{background:var(--accent-hover)}.content h2{font-family:var(--font-ui);font-size:22px;font-weight:700;margin:40px 0 14px;letter-spacing:-.01em}.content h3{font-family:var(--font-ui);font-size:17px;font-weight:600;margin:24px 0 8px}.content p{margin-bottom:16px;color:var(--text-secondary)}.content strong{color:var(--text-primary);font-weight:600}.content a{color:var(--accent);font-weight:500}.content a:hover{text-decoration:underline}.content ul,.content ol{padding-left:24px;margin-bottom:16px;color:var(--text-secondary)}.content li{margin-bottom:6px}.faq{margin-top:48px}.faq h2{font-family:var(--font-ui);font-size:22px;font-weight:700;margin-bottom:16px;letter-spacing:-.01em}.faq details{border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--bg)}.faq summary{font-family:var(--font-ui);font-size:15px;font-weight:500;padding:14px 18px;cursor:pointer;color:var(--text-primary);list-style:none;position:relative;padding-right:40px}.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-muted);transition:transform .15s ease}.faq details[open] summary::after{transform:translateY(-50%) rotate(45deg)}.faq details[open] summary{border-bottom:1px solid var(--border)}.faq details p{padding:14px 18px;margin:0;color:var(--text-secondary);font-family:var(--font-body);font-size:15px}.related{margin-top:48px;padding:24px;background:var(--surface);border-radius:10px}.related h2{font-family:var(--font-ui);font-size:16px;font-weight:600;margin-bottom:12px}.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}.related-grid a{font-family:var(--font-ui);font-size:13px;color:var(--text-secondary);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;transition:all .15s ease}.related-grid a:hover{background:var(--border);color:var(--accent)}.related-grid a .rn{font-weight:600;color:var(--text-primary);display:block;margin-bottom:2px;font-size:13px}.related-grid a:hover .rn{color:var(--accent)}.footer{border-top:1px solid var(--border);padding:32px 24px;text-align:center;font-family:var(--font-ui);font-size:12px;color:var(--text-muted)}.footer a{color:var(--accent);font-weight:500}`;

// Vercel Web Analytics script injection for static HTML
const ANALYTICS_SCRIPT = `<script>
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;

const today = new Date().toISOString().slice(0, 10);

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// -------- Per-tool landing pages --------
function generateToolPage(tool) {
    const cat = CATEGORIES[tool.category];
    const url = `https://freesuite.app/tools/${tool.slug}`;
    const toolUrl = `https://${tool.domain}/`;
    const relatedTools = tool.related.map(s => TOOLS.find(t => t.slug === s)).filter(Boolean);

    const breadcrumbLd = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Freesuite', item: 'https://freesuite.app/' },
            { '@type': 'ListItem', position: 2, name: cat.label, item: `https://freesuite.app${cat.url}` },
            { '@type': 'ListItem', position: 3, name: tool.title, item: url }
        ]
    };
    const softwareLd = {
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        name: tool.domain, url: toolUrl, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
        description: tool.metaDesc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    };
    const faqLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: tool.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${escapeHtml(tool.seoTitle)} | Freesuite</title>
    <meta name="description" content="${escapeHtml(tool.metaDesc)}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#faf9f6">
    <link rel="canonical" href="${url}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(tool.seoTitle)} | Freesuite">
    <meta property="og:description" content="${escapeHtml(tool.metaDesc)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://freesuite.app/og-image.svg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(tool.seoTitle)}">
    <meta name="twitter:description" content="${escapeHtml(tool.metaDesc)}">
    <meta name="twitter:image" content="https://freesuite.app/og-image.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(softwareLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
    <style>${CSS}</style>
    ${ANALYTICS_SCRIPT}
</head>
<body>

<header class="header" role="banner"><a class="brand" href="/" aria-label="Freesuite home"><svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="26" height="26" rx="5" fill="#C49A2A"/><rect x="36" y="2" width="26" height="26" rx="5" fill="currentColor"/><rect x="2" y="36" width="26" height="26" rx="5" fill="currentColor"/><rect x="36" y="36" width="26" height="26" rx="5" fill="#C49A2A"/></svg>Freesuite</a><button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode"><span id="themeLabel">Dark</span></button></header>

<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Freesuite</a> &rsaquo; <a href="${cat.url}">${escapeHtml(cat.label)}</a> &rsaquo; ${escapeHtml(tool.title)}</nav>

<section class="page-hero">
    <h1>${escapeHtml(tool.h1)}</h1>
    <p>${escapeHtml(tool.hero)}</p>
</section>

<main>

    <div class="launch-cta">
        <div class="launch-cta-text">
            <div class="launch-cta-label">Launch the tool</div>
            <div class="launch-cta-url">${escapeHtml(tool.domain)}</div>
        </div>
        <a class="launch-btn" href="${toolUrl}" target="_blank" rel="noopener">Open ${escapeHtml(tool.title)} &rarr;</a>
    </div>

    <article class="content">

        <h2>Features</h2>
        <ul>
            ${tool.features.map(f => `<li>${escapeHtml(f)}</li>`).join('\n            ')}
        </ul>

        <h2>How it works</h2>
        <ol>
            ${tool.howItWorks.map(s => `<li>${escapeHtml(s)}</li>`).join('\n            ')}
        </ol>

        <h2>Common use cases</h2>
        <ul>
            ${tool.useCases.map(c => `<li>${escapeHtml(c)}</li>`).join('\n            ')}
        </ul>

        <h2>How it compares</h2>
        <p>${escapeHtml(tool.comparison)}</p>

        <h2>Privacy</h2>
        <p>${escapeHtml(tool.privacyNote)}</p>

    </article>

    <section class="faq" id="faq">
        <h2>Frequently asked questions</h2>
        ${tool.faqs.map(([q, a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('\n        ')}
    </section>

    <aside class="related">
        <h2>Related tools</h2>
        <div class="related-grid">
            ${relatedTools.map(r => `<a href="/tools/${r.slug}"><span class="rn">${escapeHtml(r.title)}</span>${escapeHtml(r.domain)}</a>`).join('\n            ')}
            <a href="${cat.url}"><span class="rn">All ${escapeHtml(cat.label)} tools &rarr;</span>browse the category</a>
        </div>
    </aside>

</main>

<footer class="footer"><a href="/">&larr; Back to Freesuite</a> &middot; <a href="${cat.url}">${escapeHtml(cat.label)}</a> &middot; <a href="/tools/">All tool guides</a></footer>
<script>(function(){const r=document.documentElement,l=document.getElementById('themeLabel');function a(t){r.classList.toggle('dark',t==='dark');if(l)l.textContent=t==='dark'?'Light':'Dark'}const s=localStorage.getItem('suite_theme'),p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;a(s||(p?'dark':'light'));document.getElementById('themeToggle').addEventListener('click',()=>{const n=r.classList.contains('dark')?'light':'dark';localStorage.setItem('suite_theme',n);a(n)})})();</script>
</body>
</html>
`;
}

// -------- /tools/ catalog index --------
function generateToolsIndex() {
    const byCategory = {};
    for (const t of TOOLS) {
        if (!byCategory[t.category]) byCategory[t.category] = [];
        byCategory[t.category].push(t);
    }

    const itemListLd = {
        '@context': 'https://schema.org', '@type': 'ItemList', name: 'Freesuite tool guides',
        numberOfItems: TOOLS.length,
        itemListElement: TOOLS.map((t, i) => ({
            '@type': 'ListItem', position: i + 1,
            item: { '@type': 'SoftwareApplication', name: t.domain, url: `https://freesuite.app/tools/${t.slug}`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', description: t.metaDesc }
        }))
    };
    const breadcrumbLd = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Freesuite', item: 'https://freesuite.app/' },
            { '@type': 'ListItem', position: 2, name: 'Tool guides', item: 'https://freesuite.app/tools/' }
        ]
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>All Freesuite Tools — ${TOOLS.length}+ Free Browser Tool Guides | Freesuite</title>
    <meta name="description" content="Complete directory of ${TOOLS.length}+ Freesuite tools with detailed guides. PDF, images, text, developer, productivity, utilities. All free, browser-based.">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#faf9f6">
    <link rel="canonical" href="https://freesuite.app/tools/">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:type" content="website">
    <meta property="og:title" content="All Freesuite Tools — ${TOOLS.length}+ Free Browser Tool Guides">
    <meta property="og:description" content="Directory of ${TOOLS.length}+ Freesuite tools with detailed guides. All free, browser-based, no signup.">
    <meta property="og:url" content="https://freesuite.app/tools/">
    <meta property="og:image" content="https://freesuite.app/og-image.svg">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
    <style>${CSS}.tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}.tools-grid a{display:block;padding:16px 18px;background:var(--bg);border:1px solid var(--border);border-radius:10px;transition:all .15s ease}.tools-grid a:hover{border-color:var(--accent);box-shadow:var(--shadow);transform:translateY(-1px)}.tools-grid .tn{font-family:var(--font-ui);font-size:15px;font-weight:600;color:var(--text-primary);display:block;margin-bottom:2px}.tools-grid .td{font-family:var(--font-ui);font-size:11px;color:var(--text-muted)}.tools-grid .tm{font-family:var(--font-ui);font-size:13px;color:var(--text-secondary);line-height:1.5;margin-top:4px;display:block}.cat-section{margin-bottom:40px}.cat-section h2{font-family:var(--font-ui);font-size:20px;font-weight:700;margin-bottom:6px;letter-spacing:-.01em;display:flex;align-items:baseline;gap:10px}.cat-section .cat-count{font-family:var(--font-ui);font-size:12px;font-weight:500;color:var(--text-muted);background:var(--surface);padding:2px 8px;border-radius:10px}.cat-section p{font-size:14px;color:var(--text-secondary);margin-bottom:16px}.cat-section p a{color:var(--accent);font-weight:500}</style>
    ${ANALYTICS_SCRIPT}
</head>
<body>

<header class="header" role="banner"><a class="brand" href="/" aria-label="Freesuite home"><svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="26" height="26" rx="5" fill="#C49A2A"/><rect x="36" y="2" width="26" height="26" rx="5" fill="currentColor"/><rect x="2" y="36" width="26" height="26" rx="5" fill="currentColor"/><rect x="36" y="36" width="26" height="26" rx="5" fill="#C49A2A"/></svg>Freesuite</a><button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode"><span id="themeLabel">Dark</span></button></header>

<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Freesuite</a> &rsaquo; Tool guides</nav>

<section class="page-hero">
    <h1>All Freesuite Tools</h1>
    <p>Complete directory of every Freesuite tool with detailed guides, use cases, and comparisons. ${TOOLS.length}+ browser-based tools across documents, PDF, images, text, developer utilities, productivity, and more.</p>
</section>

<main>
${Object.entries(byCategory).map(([catKey, tools]) => {
    const cat = CATEGORIES[catKey];
    return `    <section class="cat-section">
        <h2>${escapeHtml(cat.label)}<span class="cat-count">${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}</span></h2>
        <p>See the <a href="${cat.url}">${escapeHtml(cat.label)} category overview</a> for context and comparisons.</p>
        <div class="tools-grid">
            ${tools.map(t => `<a href="/tools/${t.slug}"><span class="tn">${escapeHtml(t.title)}</span><span class="td">${escapeHtml(t.domain)}</span><span class="tm">${escapeHtml(t.metaDesc.split('.')[0])}.</span></a>`).join('\n            ')}
        </div>
    </section>`;
}).join('\n\n')}
</main>

<footer class="footer"><a href="/">&larr; Back to Freesuite</a> &middot; <a href="/about">About</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></footer>
<script>(function(){const r=document.documentElement,l=document.getElementById('themeLabel');function a(t){r.classList.toggle('dark',t==='dark');if(l)l.textContent=t==='dark'?'Light':'Dark'}const s=localStorage.getItem('suite_theme'),p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;a(s||(p?'dark':'light'));document.getElementById('themeToggle').addEventListener('click',()=>{const n=r.classList.contains('dark')?'light':'dark';localStorage.setItem('suite_theme',n);a(n)})})();</script>
</body>
</html>
`;
}

// -------- Marker-based replacement helper --------
// Replaces content between <!-- GEN:KEY START --> and <!-- GEN:KEY END --> markers.
function replaceBetween(content, key, replacement) {
    const re = new RegExp(`(<!-- GEN:${key} START -->)[\\s\\S]*?(<!-- GEN:${key} END -->)`, 'g');
    if (!re.test(content)) {
        console.warn(`  ⚠ marker GEN:${key} not found — skipping`);
        return content;
    }
    // Reset regex state, do actual replace
    return content.replace(new RegExp(`(<!-- GEN:${key} START -->)[\\s\\S]*?(<!-- GEN:${key} END -->)`, 'g'),
        `$1\n${replacement}\n        $2`);
}

// -------- Main index.html: tool grid + JSON-LD ItemList --------
function mainIndexToolCards() {
    // Category order matches the current visible layout
    const order = ['documents', 'pdf', 'images', 'text', 'developer', 'productivity', 'utilities'];
    const sections = order.map(catKey => {
        const cat = CATEGORIES[catKey];
        const tools = TOOLS.filter(t => t.category === catKey);
        const icons = { documents: '&#x1f4c4;', pdf: '&#x1f4c1;', images: '&#x1f5bc;', text: '&#x270f;', developer: '&#x1f527;', productivity: '&#x23f1;', utilities: '&#x1f6e0;' };
        const leads = {
            documents: 'Write, present, and crunch numbers without opening a Google or Microsoft account.',
            pdf: 'Merge, convert, and handle PDFs entirely in your browser. Files never leave your device.',
            images: 'Compress and crop images locally, with no upload to third-party servers.',
            text: 'Count, transform, and generate text with instant, client-side tools.',
            developer: 'Format, validate, convert, and test — the everyday bits of dev life, in one click.',
            productivity: 'Focus timers, habit streaks, typing drills, and more to keep a workday moving.',
            utilities: 'Day-to-day odds and ends: QR codes, passwords, conversions, memes.'
        };
        return `    <section class="category" id="${catKey}">
        <h2><span class="cat-icon" aria-hidden="true">${icons[catKey]}</span> ${escapeHtml(cat.label)} <span class="category-count">${tools.length} tools</span></h2>
        <p class="category-lead">${leads[catKey]} See all <a href="${cat.url}">free ${cat.label.toLowerCase()} tools</a>.</p>
        <div class="tools">
            ${tools.map(t => `<a class="tool" href="https://${t.domain}/" target="_blank" rel="noopener"><span class="tool-name">${escapeHtml(t.title)}</span><span class="tool-domain">${escapeHtml(t.domain)}</span><span class="tool-desc">${escapeHtml(t.cardDesc || t.metaDesc.split('.')[0] + '.')}</span></a>`).join('\n            ')}
        </div>
    </section>`;
    });
    return sections.join('\n\n');
}

function mainIndexItemListJsonLd() {
    return JSON.stringify({
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: 'Free Browser Tools by Freesuite', numberOfItems: TOOLS.length,
        itemListElement: TOOLS.map((t, i) => ({
            '@type': 'ListItem', position: i + 1,
            item: { '@type': 'SoftwareApplication', name: t.domain, url: `https://${t.domain}/`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', description: t.metaDesc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
        }))
    });
}

function updateMainIndex() {
    const file = `${ROOT}/index.html`;
    let html = fs.readFileSync(file, 'utf8');
    html = replaceBetween(html, 'TOOL_CARDS', mainIndexToolCards());
    html = replaceBetween(html, 'ITEMLIST_JSONLD', `    <script type="application/ld+json">${mainIndexItemListJsonLd()}</script>`);
    fs.writeFileSync(file, html);
    console.log('✓ index.html: tool cards + ItemList regenerated');
}

// -------- Category landing pages: tool grid + ItemList JSON-LD --------
function updateCategoryPages() {
    for (const [catKey, cat] of Object.entries(CATEGORIES)) {
        const slug = cat.url.replace('/', '');
        const file = `${ROOT}/pages/${slug}.html`;
        if (!fs.existsSync(file)) { console.warn(`  ⚠ ${file} not found`); continue; }
        let html = fs.readFileSync(file, 'utf8');
        const tools = TOOLS.filter(t => t.category === catKey);

        const gridHtml = tools.map(t => `<a class="tool" href="https://${t.domain}/" target="_blank" rel="noopener"><span class="tool-name">${escapeHtml(t.title)}</span><span class="tool-domain">${escapeHtml(t.domain)}</span><span class="tool-desc">${escapeHtml(t.cardDesc || t.metaDesc.split('.')[0] + '.')}</span></a>`).join('\n        ');

        const itemListLd = JSON.stringify({
            '@context': 'https://schema.org', '@type': 'ItemList',
            name: `Free ${cat.label} Tools`, numberOfItems: tools.length,
            itemListElement: tools.map((t, i) => ({
                '@type': 'ListItem', position: i + 1,
                item: { '@type': 'SoftwareApplication', name: t.name, url: `https://${t.domain}/`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', description: t.metaDesc, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }
            }))
        });

        html = replaceBetween(html, 'CAT_TOOL_GRID', gridHtml);
        html = replaceBetween(html, 'CAT_ITEMLIST_JSONLD', `    <script type="application/ld+json">${itemListLd}</script>`);
        fs.writeFileSync(file, html);
        console.log(`✓ ${slug}.html: tool grid + ItemList regenerated (${tools.length} tools)`);
    }
}

// -------- sitemap.xml --------
function regenerateSitemap() {
    const file = `${ROOT}/sitemap.xml`;
    const staticEntries = [
        ['/', 1.0, 'weekly'],
        ['/about', 0.8, 'monthly'],
        ['/privacy', 0.3, 'yearly'],
        ['/terms', 0.3, 'yearly'],
        ['/tools/', 0.8, 'weekly'],
        ['/google-docs-alternative', 0.8, 'monthly'],
        ['/notion-alternative', 0.8, 'monthly'],
        ['/smallpdf-alternative', 0.8, 'monthly']
    ];
    const catEntries = Object.values(CATEGORIES).map(c => [c.url, 0.9, 'weekly']);
    const toolEntries = TOOLS.map(t => [`/tools/${t.slug}`, 0.7, 'monthly']);
    const allEntries = [...staticEntries, ...catEntries, ...toolEntries];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(([p, pr, cf]) => `    <url>
        <loc>https://freesuite.app${p}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${cf}</changefreq>
        <priority>${pr}</priority>
    </url>`).join('\n')}
</urlset>
`;
    fs.writeFileSync(file, xml);
    console.log(`✓ sitemap.xml: ${allEntries.length} URLs`);
}

// -------- sw.js --------
function regenerateSw() {
    const file = `${ROOT}/sw.js`;
    const current = fs.readFileSync(file, 'utf8');
    // Bump cache version
    const versionMatch = current.match(/const CACHE_NAME = 'freesuite-v(\d+)'/);
    const newVersion = versionMatch ? parseInt(versionMatch[1]) + 1 : 1;

    const staticAssets = [
        "'/'", "'/index.html'", "'/manifest.json'", "'/favicon.svg'", "'/favicon.png'", "'/apple-touch-icon.png'", "'/og-image.svg'", "'/404.html'",
        "'/pages/about.html'", "'/pages/privacy.html'", "'/pages/terms.html'",
        "'/pages/google-docs-alternative.html'", "'/pages/notion-alternative.html'", "'/pages/smallpdf-alternative.html'",
        "'/pages/tools/index.html'"
    ];
    const catAssets = Object.values(CATEGORIES).map(c => `'/pages${c.url}.html'`);
    const toolAssets = TOOLS.map(t => `'/pages/tools/${t.slug}.html'`);
    const allAssets = [...staticAssets, ...catAssets, ...toolAssets];

    const sw = `const CACHE_NAME = 'freesuite-v${newVersion}';
const ASSETS = [
  ${allAssets.join(',\n  ')}
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('fonts.g')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
`;
    fs.writeFileSync(file, sw);
    console.log(`✓ sw.js: cache bumped to v${newVersion}, ${allAssets.length} precache entries`);
}

// -------- vercel.json: rewrites --------
function regenerateVercelRewrites() {
    const file = `${ROOT}/vercel.json`;
    const config = JSON.parse(fs.readFileSync(file, 'utf8'));
    const staticRewrites = [
        { source: '/about', destination: '/pages/about.html' },
        { source: '/privacy', destination: '/pages/privacy.html' },
        { source: '/terms', destination: '/pages/terms.html' },
        { source: '/tools', destination: '/pages/tools/index.html' },
        { source: '/tools/', destination: '/pages/tools/index.html' },
        { source: '/google-docs-alternative', destination: '/pages/google-docs-alternative.html' },
        { source: '/notion-alternative', destination: '/pages/notion-alternative.html' },
        { source: '/smallpdf-alternative', destination: '/pages/smallpdf-alternative.html' }
    ];
    const catRewrites = Object.values(CATEGORIES).map(c => ({
        source: c.url, destination: `/pages${c.url}.html`
    }));
    const toolRewrites = TOOLS.map(t => ({
        source: `/tools/${t.slug}`, destination: `/pages/tools/${t.slug}.html`
    }));
    config.rewrites = [...catRewrites, ...staticRewrites, ...toolRewrites];
    fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
    console.log(`✓ vercel.json: ${config.rewrites.length} rewrites`);
}

// -------- llms.txt: per-tool directory --------
function regenerateLlms() {
    const file = `${ROOT}/llms.txt`;
    let text = fs.readFileSync(file, 'utf8');

    // Rebuild the "Categories and tools" section from tools.json
    const categoriesSection = Object.entries(CATEGORIES).map(([catKey, cat]) => {
        const tools = TOOLS.filter(t => t.category === catKey);
        return `### ${cat.label} (${tools.length})
${tools.map(t => `- [${t.name}](https://${t.domain}/) — ${t.metaDesc.split('.')[0]}`).join('\n')}`;
    }).join('\n\n');

    text = text.replace(
        /## Categories and tools\n\n[\s\S]*?(?=\n## )/m,
        `## Categories and tools\n\n${categoriesSection}\n\n`
    );

    // Rebuild the "Per-tool deep-dive guides" section
    const toolGuidesSection = `## Per-tool deep-dive guides

Every tool has a dedicated page with features, use cases, FAQ, and comparisons to alternatives. Browseable catalog at /tools/.

${TOOLS.map(t => `- [/tools/${t.slug}](https://freesuite.app/tools/${t.slug})`).join('\n')}`;

    text = text.replace(
        /## Per-tool deep-dive guides\n\n[\s\S]*?(?=\n## )/m,
        toolGuidesSection + '\n\n'
    );

    fs.writeFileSync(file, text);
    console.log(`✓ llms.txt: ${TOOLS.length} tools synced into both sections`);
}

// -------- Main driver --------
console.log(`Regenerating freesuite hub from tools.json (${TOOLS.length} tools)\n`);

// 1. Per-tool pages
fs.mkdirSync(`${ROOT}/pages/tools`, { recursive: true });
let toolCount = 0;
for (const tool of TOOLS) {
    fs.writeFileSync(`${ROOT}/pages/tools/${tool.slug}.html`, generateToolPage(tool));
    toolCount++;
}
console.log(`✓ ${toolCount} per-tool landing pages`);

// 2. /tools/ catalog index
fs.writeFileSync(`${ROOT}/pages/tools/index.html`, generateToolsIndex());
console.log(`✓ /tools/ catalog index`);

// 3. Main index.html (tool cards + ItemList)
updateMainIndex();

// 4. Category landing pages (tool grids + ItemList)
updateCategoryPages();

// 5. sitemap.xml
regenerateSitemap();

// 6. sw.js
regenerateSw();

// 7. vercel.json
regenerateVercelRewrites();

// 8. llms.txt
regenerateLlms();

console.log(`\nDone. ${TOOLS.length} tools synced across all files.`);
console.log('Next: git add -A && git commit && git push');
