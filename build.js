// Newbutton Models site builder. Reads content/site.json, models/*.md and journal/*.md and writes the full site to dist/.
const fs = require('fs'), path = require('path');
let yaml = null; try { yaml = require('js-yaml'); } catch (e) { }
let sharp = null; try { sharp = require('sharp'); } catch (e) { console.log('sharp not available: using original photos'); }
const R = process.cwd(), O = path.join(R, 'dist');
const rj = f => { try { return JSON.parse(fs.readFileSync(path.join(R, f), 'utf8')); } catch (e) { return {}; } };
const S = rj('content/site.json');
const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const g = (o, k, d) => (o && o[k] !== undefined && o[k] !== null && o[k] !== '') ? o[k] : d;
const on = (o, k, d) => (o && typeof o[k] === 'boolean') ? o[k] : d;
const U = p => String(p || '').replace(/^\/+/, '');
const FP = { top: '50% 0%', upper: '50% 20%', center: '50% 50%', bottom: '50% 100%' }, fp = k => FP[k] || FP.upper;
const hl = s => E(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
const inl = s => E(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
const md = s => String(s || '').split(/\n{2,}/).map(b => { b = b.trim(); if (!b) return ''; if (/^#{1,3} /.test(b)) return '<h3>' + inl(b.replace(/^#+ /, '')) + '</h3>'; if (/^[-*] /.test(b)) return '<ul>' + b.split('\n').map(l => '<li>' + inl(l.replace(/^[-*] /, '')) + '</li>').join('') + '</ul>'; return '<p>' + inl(b).replace(/\n/g, '<br>') + '</p>'; }).join('');
const slugify = n => (n || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const strip = v => v.trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
const fix = v => v instanceof Date ? v.toISOString().slice(0, 10) : Array.isArray(v) ? v.map(fix) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x)])) : v;
function fm(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/); if (!m) return null;
  if (yaml) { try { const o = fix(yaml.load(m[1]) || {}); o.__body = raw.slice(m[0].length).trim(); return o; } catch (e) { console.log('Could not read a content file: ' + e.message); return null; } }
  const L = m[1].split('\n'), o = {}; let i = 0;
  while (i < L.length) {
    const c = L[i].indexOf(':'); if (c === -1) { i++; continue; }
    const k = L[i].slice(0, c).trim(), rest = L[i].slice(c + 1).trim();
    if (rest === '') { const a = []; let j = i + 1; while (j < L.length && /^\s*-\s/.test(L[j])) { a.push(strip(L[j].replace(/^\s*-\s*/, ''))); j++; } o[k] = a; i = j; }
    else { o[k] = strip(rest); i++; }
  }
  o.__body = raw.slice(m[0].length).trim(); return o;
}
const B = S.brand || {}, L = S.look || {}, P = S.pages || {}, N = S.nav || {}, H = S.home || {}, SC = S.scouting || {}, AB = S.about || {}, BR = S.brands || {}, CA = S.casting || {}, PR = S.press || {}, C = S.contact || {}, F = S.features || {}, SE = S.seo || {}, AN = S.announcement || {};
const name = g(B, 'name', 'Newbutton Models'), email = g(C, 'email', 'info@newbuttonmodels.com'), site = String(g(SE, 'site_url', 'https://newbuttonmodels.com')).replace(/\/$/, '');
const DEF = { models: 1, journal: 0, scouting: 1, brands: 1, casting: 0, press: 0, about: 1, faq: 0, contact: 1 }, en = k => on(P, k, !!DEF[k]);
const T = v => v === true || String(v) === 'true';
const PRE = { black: { bg: '#000000', surface: '#111111', text: '#f5f5f5', dim: '#8d8d8d', accent: '#c8ac7a', line: '#1f1f1f' }, charcoal: { bg: '#121212', surface: '#1b1b1b', text: '#f2f2f2', dim: '#8f8f8f', accent: '#c8ac7a', line: '#262626' }, midnight: { bg: '#05070d', surface: '#0b0f19', text: '#eef0f5', dim: '#8f96a8', accent: '#b8c4e0', line: '#1a2030' } };
const pr = PRE[L.preset] || PRE.black, col = k => g(L, k, pr[k]);
const FONTS = { montserrat: [['Montserrat:wght@400..800', 'Archivo:wght@400..600'], "'Montserrat',system-ui,sans-serif", "'Archivo',system-ui,sans-serif"], bodoni: [['Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700', 'Archivo:wght@400..600'], "'Bodoni Moda',Georgia,serif", "'Archivo',system-ui,sans-serif"], syne: [['Syne:wght@500..800', 'Manrope:wght@400..700'], "'Syne',sans-serif", "'Manrope',system-ui,sans-serif"], shoulders: [['Big+Shoulders+Display:wght@600..900', 'Archivo+Narrow:wght@400..600'], "'Big Shoulders Display',Impact,sans-serif", "'Archivo Narrow',system-ui,sans-serif"], instrument: [['Instrument+Serif:ital@0;1', 'Geist:wght@400..600'], "'Instrument Serif',Georgia,serif", "'Geist',system-ui,sans-serif"] };
const fo = FONTS[L.font_pair] || FONTS.montserrat;
const fontLink = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=' + fo[0].join('&family=') + '&display=swap" rel="stylesheet">';
const tickWords = [...(AN.text ? [{ t: AN.text, l: AN.link }] : []), ...(H.ticker || []).filter(Boolean).map(t => ({ t }))];
const TK = on(F, 'ticker', true) && tickWords.length > 0, FT = S.footer || {};
const vars = `:root{--tk:${TK ? 26 : 0}px;--bg:${col('bg')};--sf:${col('surface')};--tx:${col('text')};--dm:${col('dim')};--ac:${col('accent')};--ln:${col('line')};--fh:${fo[1]};--fb:${fo[2]};--lh:${+g(B, 'logo_height', 58)}px}`;
let TTP = ''; try { TTP = fs.readFileSync(path.join(R, 'images/brand/tiktok-path.txt'), 'utf8'); } catch (e) { }
const IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".7" fill="currentColor"/></svg>';
const TT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="' + TTP + '"/></svg>';
const link = (v, base) => { v = String(v || '').trim().replace(/^@/, ''); return !v ? '' : /^https?:/.test(v) ? v : base + v; };
const soc = (ig, tt, hideIg, hideTt) => {
  const a = []; const i = link(ig, 'https://instagram.com/'), t = link(tt, 'https://tiktok.com/@');
  if (i && on(C, 'show_instagram', true) && !hideIg) a.push(`<a class="ic" href="${E(i)}" target="_blank" rel="noopener" aria-label="Instagram">${IG}</a>`);
  if (t && on(C, 'show_tiktok', true) && !hideTt) a.push(`<a class="ic" href="${E(t)}" target="_blank" rel="noopener" aria-label="TikTok">${TT}</a>`);
  return a.join('');
};
const th = new Map();
async function thumb(src, w) {
  w = w || 1000; if (!src) return ''; const s = U(src), key = s + w; if (th.has(key)) return th.get(key);
  let out = s; const inp = path.join(R, s);
  if (sharp && fs.existsSync(inp)) { const nm = 'thumbs/' + w + '-' + s.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.jpg'; try { fs.mkdirSync(path.join(O, 'thumbs'), { recursive: true }); await sharp(inp).rotate().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(O, nm)); out = nm; } catch (e) { } }
  th.set(key, out); return out;
}
const NAV = [['models', 'Models', 'models/'], ['journal', 'Journal', 'journal/'], ['scouting', 'Get Scouted', 'scouting/'], ['brands', 'For Brands', 'brands/'], ['casting', 'Casting', 'casting/'], ['press', 'Press', 'press/'], ['about', 'About', 'about/'], ['faq', 'FAQ', 'faq/'], ['contact', 'Contact', 'contact/']].filter(x => en(x[0]));
function shell(o) {
  const r = '../'.repeat(o.depth || 0), home = r || './', full = U(g(B, 'logo', 'images/brand/logo-full.svg'));
  const ogimg = o.img ? site + '/' + U(o.img) : site + '/' + U(g(SE, 'share_image', 'images/brand/share.png'));
  const items = tickWords.map(x => x.l ? `<a href="${E(x.l)}">${E(x.t)}</a>` : `<span>${E(x.t)}</span>`).join(''), half = items.repeat(3);
  const loc = g(C, 'location', ''), mail = on(C, 'show_email', true) ? `<a class="fe" href="mailto:${E(email)}">${E(email)}</a>` : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(o.t)}</title><meta name="description" content="${E(o.d || g(SE, 'description', ''))}"><meta property="og:title" content="${E(o.t)}"><meta property="og:description" content="${E(o.d || g(SE, 'description', ''))}"><meta property="og:image" content="${E(ogimg)}"><meta property="og:type" content="website"><meta name="theme-color" content="${col('bg')}"><link rel="icon" href="${r}favicon.png"><link rel="apple-touch-icon" href="${r}favicon-192.png">${fontLink}<style>${vars}</style><link rel="stylesheet" href="${r}styles.css"></head><body>
${TK ? `<div class="tkb"><div style="animation-duration:${+g(H, 'ticker_speed', 40)}s">${half}${half}</div></div>` : ''}
<header class="hd" id="hd"><a href="${home}" aria-label="${E(name)}"><img class="lm" src="${r + full}" alt="${E(name)}"></a><div class="hr">${on(F, 'shortlist', true) ? `<a class="slk" href="${r}brands/" data-slc hidden>Shortlist <b>0</b></a>` : ''}<button class="mn" id="mo" aria-label="Open menu">Menu</button></div></header>
<div class="ov" id="ov" aria-hidden="true"><div class="oh"><a href="${home}"><img class="lm" src="${r + full}" alt=""></a><button class="mn x" id="mc" aria-label="Close menu">&times;</button></div><nav><a href="${home}">${E(g(N, 'home', 'Home'))}</a>${NAV.map(x => `<a href="${r + x[2]}">${E(g(N, x[0], x[1]))}</a>`).join('')}</nav><div class="of">${soc(C.instagram, C.tiktok)}</div></div>
<main>${o.body}</main>
<footer class="ft"><div class="wr">${mail}<div class="fb"><div class="so">${soc(C.instagram, C.tiktok)}</div>${on(FT, 'show_location', true) && loc ? `<p>${E(loc)}</p>` : ''}${on(FT, 'show_copyright', true) ? `<p>${E(g(FT, 'copyright', '© ' + new Date().getFullYear() + ' Newbutton Management'))}</p>` : ''}</div></div></footer>
<script src="${r}main.js"></script></body></html>`;
}
const head = (label, title, intro) => `<div class="wr sh"><div><p class="eb">${E(label)}</p><h2>${hl(title)}</h2></div>${intro ? `<p class="lead dm">${E(intro)}</p>` : ''}</div>`;
const sec = (inner, cls) => `<section class="sec rv ${cls || ''}">${inner}</section>`;
function fields(list, extra) { return list.map(f => `<div class="fd"><label>${E(f[1])}</label>${f[2] === 'select' ? `<select name="${f[0]}" data-l="${E(f[1])}" required><option value="">Select</option>${f[3].map(o => `<option>${E(o)}</option>`).join('')}</select>` : f[2] === 'text' ? `<textarea name="${f[0]}" data-l="${E(f[1])}" rows="3"></textarea>` : `<input name="${f[0]}" data-l="${E(f[1])}" type="${f[2] || 'text'}"${f[4] ? '' : ' required'}>`}</div>`).join(''); }
async function main() {
  fs.rmSync(O, { recursive: true, force: true }); fs.mkdirSync(O, { recursive: true });
  ['images', 'admin', 'favicon.png', 'favicon-192.png', 'favicon-512.png', 'styles.css', 'main.js'].forEach(f => { if (fs.existsSync(path.join(R, f))) fs.cpSync(path.join(R, f), path.join(O, f), { recursive: true }); });
  const w = (f, h) => { const p = path.join(O, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, h); };
  // models
  const used = new Set(), md0 = path.join(R, 'models');
  let models = fs.existsSync(md0) ? fs.readdirSync(md0).filter(f => f.endsWith('.md')).map(f => fm(fs.readFileSync(path.join(md0, f), 'utf8'))).filter(m => m && m.name && String(m.active) !== 'false') : [];
  models = models.map(m => { let s = slugify(m.name) || 'model', u = s, n = 2; while (used.has(u)) u = s + '-' + n++; used.add(u); const gal = Array.isArray(m.images) ? m.images.filter(Boolean) : []; return { ...m, slug: u, gender: String(m.gender || 'women').toLowerCase(), photos: [...new Set([m.image, ...gal].filter(Boolean))], ord: m.order !== undefined && m.order !== '' ? +m.order : 999, feat: T(m.featured) }; });
  models.sort((a, b) => a.ord - b.ord || a.name.localeCompare(b.name));
  for (const m of models) { m.t0 = await thumb(m.photos[0]); m.t1 = m.photos[1] ? await thumb(m.photos[1]) : ''; }
  const card = (m, r) => { const url = r + 'models/' + m.slug + '/'; return `<article class="mc" data-g="${E(m.gender)}" data-c="${E(m.category || '')}"><a class="fr" href="${url}" aria-label="${E(m.name)}">${m.t0 ? `<img class="a" src="${r + m.t0}" alt="${E(m.name)}" loading="lazy" style="object-position:${fp(m.focus)}">` : `<span class="ph">${E(m.name[0])}</span>`}${m.t1 && on(F, 'hover_second_photo', true) ? `<img class="b" src="${r + m.t1}" alt="" loading="lazy" style="object-position:${fp(m.focus)}">` : ''}</a>${on(F, 'shortlist', true) ? `<button class="sb" data-s="${E(m.slug)}" data-n="${E(m.name)}" data-u="models/${E(m.slug)}/" aria-label="Shortlist ${E(m.name)}">+</button>` : ''}<div class="cp"><a href="${url}"><strong>${E(m.name)}</strong></a><span>${E(m.category || '')}</span></div></article>`; };
  // journal
  const jd = path.join(R, 'journal');
  let posts = fs.existsSync(jd) ? fs.readdirSync(jd).filter(f => f.endsWith('.md')).map(f => { const p = fm(fs.readFileSync(path.join(jd, f), 'utf8')); if (p) p.slug = slugify(p.title) || f.replace(/\.md$/, ''); return p; }).filter(p => p && p.title && !T(p.draft)) : [];
  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  for (const p of posts) p.t0 = p.cover ? await thumb(p.cover) : '';
  const fd = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
  const pcard = (p, r) => `<a class="pc" href="${r}journal/${p.slug}/"><div class="fr wide">${p.t0 ? `<img src="${r + p.t0}" alt="" loading="lazy" style="object-position:${fp(p.focus || 'center')}">` : ''}</div><p class="eb">${fd(p.date)}</p><h3>${E(p.title)}</h3><p class="dm">${E(p.excerpt || '')}</p></a>`;
  // HOME
  const hs = []; for (const i of (H.hero_images || [])) { const t = await thumb(i.image || i, 2000); if (t) hs.push(`<img src="${t}" alt="" ${hs.length ? '' : 'class="on"'}>`); }
  const feat = (models.some(m => m.feat) ? models.filter(m => m.feat) : models).slice(0, +g(H, 'featured_count', 8));
  const tick = (H.ticker || []).filter(Boolean); let home = `<section class="hero"><div class="hs">${hs.join('')}</div><div class="hc wr"><p class="eb">${E(g(H, 'eyebrow', ''))}</p><h1>${hl(g(H, 'headline', 'Newbutton *Models*'))}</h1><p class="lead">${E(g(H, 'tagline', 'Discovering and nurturing the next generation of iconic talent.'))}</p><div class="gc"><a href="models/?g=women">${E(g(H, 'women_label', 'Women'))}</a><a href="models/?g=men">${E(g(H, 'men_label', 'Men'))}</a></div></div></section>`;
  home += sec(`${head(g(H, 'board_label', 'Current roster'), g(H, 'board_title', 'The Board'))}<div class="wr"><div class="grid">${feat.length ? feat.map(m => card(m, '')).join('') : '<p class="dm">New faces coming soon.</p>'}</div><p class="mt"><a class="bt o" href="models/">${E(g(H, 'all_label', 'View all models'))}</a></p></div>`);
  if (en('scouting')) home += sec(`<div class="wr"><div class="cta"><p class="eb">${E(g(SC, 'label', 'Apply now'))}</p><h2>${hl(g(H, 'scout_title', 'Become a *new face*'))}</h2><p class="lead dm">${E(g(SC, 'intro', ''))}</p><a class="bt" href="scouting/">${E(g(N, 'scouting', 'Get Scouted'))}</a></div></div>`);
  if (en('journal') && posts.length) home += sec(`${head('Journal', g(H, 'journal_title', 'The *Journal*'))}<div class="wr gp">${posts.slice(0, 3).map(p => pcard(p, '')).join('')}</div>`);
  if (en('brands')) home += sec(`<div class="wr"><div class="cta"><p class="eb">${E(g(BR, 'label', 'Book talent'))}</p><h2>${hl(g(H, 'brands_title', 'Work with *us*'))}</h2><p class="lead dm">${E(g(BR, 'intro', ''))}</p><a class="bt" href="brands/">${E(g(N, 'brands', 'For Brands'))}</a></div></div>`);
  w('index.html', shell({ t: g(SE, 'title', name), d: g(SE, 'description', ''), body: home }));
  // MODELS
  const cats = [...new Set(models.map(m => m.category).filter(Boolean))];
  w('models/index.html', shell({ depth: 1, t: 'Models | ' + name, body: sec(`${head(g(H, 'board_label', 'Current roster'), g(H, 'board_title', 'The Board'))}<div class="wr"><div class="flt"><button data-f="g" data-v="" class="on">All</button><button data-f="g" data-v="women">Women</button><button data-f="g" data-v="men">Men</button>${cats.map(c => `<button data-f="c" data-v="${E(c)}">${E(c)}</button>`).join('')}</div><div class="grid" id="grid">${models.map(m => card(m, '../')).join('') || '<p class="dm">New faces coming soon.</p>'}</div></div>`, 'top') }));
  for (const m of models) {
    const r = '../../', abs = site + '/models/' + m.slug + '/', L2 = S.labels || {};
    const full = async p => r + await thumb(p, 1800), tb = async (p, w) => r + await thumb(p, w);
    const mainP = m.photos[0];
    let jobs = (Array.isArray(m.jobs) ? m.jobs : []).filter(j => j && Array.isArray(j.photos) && j.photos.filter(Boolean).length && j.show !== false);
    if (!jobs.length && m.photos.length) jobs = [{ title: 'Portfolio', photos: m.photos }];
    const J = []; for (const j of jobs) { const ph = j.photos.filter(Boolean); J.push({ title: j.title || 'Job', meta: [j.client, j.date].filter(Boolean).join(' / '), cover: await tb(ph[0], 900), full: await Promise.all(ph.map(full)), n: ph.length }); }
    const pol = []; for (const p of (Array.isArray(m.polaroids) ? m.polaroids : []).filter(Boolean)) pol.push({ t: await tb(p, 700), f: await full(p) });
    const cci = []; for (const p of (Array.isArray(m.comp_card_images) ? m.comp_card_images : []).filter(Boolean)) cci.push({ t: await tb(p, 900), f: await full(p) });
    const pdf = m.comp_card ? r + U(m.comp_card) : '', tabs = [];
    if (on(F, 'jobs', true) && !T(m.hide_jobs) && J.length) tabs.push(['jobs', g(L2, 'jobs', 'Jobs'), `<div class="jg">${J.map((j, i) => `<a class="jc" href="${j.full[0]}" data-lbg="j${i}" data-cap="${E(j.title)}"><div class="fr"><img src="${j.cover}" alt="${E(j.title)}" loading="lazy" style="object-position:${fp(m.focus)}"></div><strong>${E(j.title)}</strong><span>${E(j.meta)}${j.meta ? ' / ' : ''}${j.n} photo${j.n > 1 ? 's' : ''}</span></a>${j.full.slice(1).map(u => `<a hidden href="${u}" data-lbg="j${i}" data-cap="${E(j.title)}"></a>`).join('')}`).join('')}</div>`]);
    if (on(F, 'polaroids', true) && !T(m.hide_polaroids) && pol.length) tabs.push(['pol', g(L2, 'polaroids', 'Polaroids'), `<div class="pg">${pol.map(p => `<a class="po" href="${p.f}" data-lbg="pol" data-cap="Polaroids"><div class="pf"><img src="${p.t}" alt="" loading="lazy" style="object-position:${fp(m.focus)}"></div></a>`).join('')}</div>`]);
    if (on(F, 'comp_card', true) && !T(m.hide_comp_card) && (cci.length || pdf)) tabs.push(['cc', g(L2, 'comp', 'Comp card'), `<div class="cg">${cci.map(p => `<a class="cf" href="${p.f}" data-lbg="cc" data-cap="Comp card"><img src="${p.t}" alt="Comp card" loading="lazy"></a>`).join('')}</div>${pdf ? `<p class="mt"><a class="bt" href="${pdf}" target="_blank" rel="noopener">Download PDF</a></p>` : ''}`]);
    const rows = on(F, 'stats', true) ? [['Category', m.category], ['Height', m.height], ['City', m.city]].filter(x => x[1]) : [];
    const sb = soc(m.instagram, m.tiktok, T(m.hide_instagram), T(m.hide_tiktok));
    const mainT = mainP ? await tb(mainP, 1200) : '', mainF = mainP ? await full(mainP) : '';
    const book = on(F, 'book_button', true) && !T(m.hide_book) ? `<a class="bt" href="mailto:${E(email)}?subject=${encodeURIComponent('Booking enquiry: ' + m.name)}&body=${encodeURIComponent('Hello, I would like to enquire about booking ' + m.name + ' (' + abs + ').')}">${E(g(L2, 'book', 'Book this model'))}</a>` : '';
    const sl = on(F, 'shortlist', true) && !T(m.hide_shortlist) ? `<button class="bt o" data-s="${E(m.slug)}" data-n="${E(m.name)}" data-u="models/${E(m.slug)}/" data-t="1">Add to shortlist</button>` : '';
    const body = `<section class="wr mp"><div class="mph">${mainP ? `<a class="fr big" href="${mainF}" data-lbg="main" data-cap="${E(m.name)}"><img src="${mainT}" alt="${E(m.name)}" style="object-position:${fp(m.focus)}"></a>` : `<div class="fr big"><span class="ph">${E(m.name[0])}</span></div>`}</div><div class="mi"><p class="eb"><a href="../">All models</a></p><h1>${E(m.name)}</h1>${rows.map(x => `<div class="rw"><span class="dm">${x[0]}</span><span>${E(x[1])}</span></div>`).join('')}${m.bio && on(F, 'bio', true) && !T(m.hide_bio) ? `<div class="bio">${md(m.bio)}</div>` : ''}${book || sl ? `<div class="ba">${book}${sl}</div>` : ''}${sb ? `<div class="so">${sb}</div>` : ''}</div></section>${tabs.length ? `<section class="wr sec tabs">${tabs.length > 1 ? `<div class="tb">${tabs.map((t, i) => `<button data-tab="${t[0]}" class="${i ? '' : 'on'}">${E(t[1])}</button>`).join('')}</div>` : ''}${tabs.map((t, i) => `<div class="pn" data-pane="${t[0]}"${i ? ' hidden' : ''}>${t[2]}</div>`).join('')}</section>` : ''}`;
    w('models/' + m.slug + '/index.html', shell({ depth: 2, t: m.name + ' | ' + name, d: [m.category, m.height, m.city].filter(Boolean).join(', ') + ' | ' + name, img: mainP, body }));
    w('models/' + m.slug + '.html', `<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${m.slug}/"><link rel="canonical" href="${abs}">`);
  }
  // SCOUTING
  const gl = ['Female', 'Male', 'Other'];
  if (en('scouting')) w('scouting/index.html', shell({ depth: 1, t: g(SC, 'title', 'Get Scouted') + ' | ' + name, body: sec(`${head(g(SC, 'label', 'Apply now'), g(SC, 'title', 'Get Scouted'), g(SC, 'intro', ''))}<div class="wr"><form class="fm" data-mail="${E(email)}" data-subject="Get Scouted" data-note="${E(g(SC, 'note', 'Please attach two unedited photos (one close-up, one full length) before sending.'))}">${fields([['name', 'Full name'], ['email', 'Email', 'email'], ['gender', 'Gender', 'select', gl], ['height', 'Height', 'text', 0, 1], ['city', 'City'], ['about', 'Tell us about yourself', 'text', 0, 1]])}<p class="dm">${E(g(SC, 'note', 'Please attach two unedited photos (one close-up, one full length) before sending.'))}</p><button class="bt">${E(g(SC, 'button', 'Submit Application'))}</button><p class="dm sm">${E(g(SC, 'subnote', 'This opens your email app with your details pre-filled.'))}</p></form></div>`, 'top') }));
  // BRANDS
  if (en('brands')) w('brands/index.html', shell({ depth: 1, t: g(BR, 'title', 'For Brands') + ' | ' + name, body: sec(`${head(g(BR, 'label', 'Book talent'), g(BR, 'title', 'For Brands'), g(BR, 'intro', ''))}<div class="wr"><div id="shortlist" class="slb"></div><form class="fm" data-mail="${E(email)}" data-subject="Booking enquiry" data-note="" data-sl="1">${fields([['name', 'Your name'], ['company', 'Company or brand'], ['email', 'Email', 'email'], ['dates', 'Dates and location', 'text', 0, 1], ['brief', 'About the project', 'text']])}<button class="bt">${E(g(BR, 'button', 'Send enquiry'))}</button><p class="dm sm">${E(g(BR, 'note', 'This opens your email app with your enquiry pre-filled.'))}</p></form></div>`, 'top') }));
  // ABOUT (+ team)
  if (en('about')) { const tm = (S.team || []).filter(t => t && t.name && t.show !== false), tt = []; for (const t of tm) tt.push({ ...t, t0: t.photo ? await thumb(t.photo) : '' }); const ap = AB.photo ? await thumb(AB.photo, 1400) : '';
    w('about/index.html', shell({ depth: 1, t: g(AB, 'title', 'About Us') + ' | ' + name, body: sec(`${head(g(AB, 'label', 'Who we are'), g(AB, 'title', 'About Us'), g(AB, 'intro', ''))}<div class="wr">${ap ? `<div class="fr wide mb"><img src="../${ap}" alt=""></div>` : ''}<div class="two">${(AB.blocks || []).map(b => `<div><h3>${E(b.title)}</h3>${md(b.text)}</div>`).join('')}</div>${en('team') && tt.length ? `<h2 class="mt">${E(g(AB, 'team_title', 'Team'))}</h2><div class="grid">${tt.map(t => `<div class="mc"><div class="fr">${t.t0 ? `<img src="../${t.t0}" alt="${E(t.name)}" loading="lazy" style="object-position:${fp(t.focus)}">` : `<span class="ph">${E(t.name[0])}</span>`}</div><div class="cp"><strong>${E(t.name)}</strong><span>${E(t.title)}</span></div></div>`).join('')}</div>` : ''}</div>`, 'top') })); }
  // CASTING / PRESS / FAQ / CONTACT
  if (en('casting')) w('casting/index.html', shell({ depth: 1, t: g(CA, 'title', 'Casting') + ' | ' + name, body: sec(`${head(g(CA, 'label', 'Open calls'), g(CA, 'title', 'Casting'), g(CA, 'intro', ''))}<div class="wr">${(CA.items || []).filter(x => x.show !== false).map(x => `<div class="li"><p class="eb">${E(x.date || '')}${x.location ? ' / ' + E(x.location) : ''}</p><h3>${E(x.title)}</h3>${md(x.details)}</div>`).join('') || '<p class="dm">No open calls right now.</p>'}</div>`, 'top') }));
  if (en('press')) w('press/index.html', shell({ depth: 1, t: g(PR, 'title', 'Press') + ' | ' + name, body: sec(`${head(g(PR, 'label', 'In the press'), g(PR, 'title', 'Press'), g(PR, 'intro', ''))}<div class="wr">${(PR.items || []).filter(x => x.show !== false).map(x => `<a class="li" ${x.link ? `href="${E(x.link)}" target="_blank" rel="noopener"` : ''}><p class="eb">${E(x.outlet || '')} ${x.date ? '/ ' + E(x.date) : ''}</p><h3>${E(x.headline)}</h3></a>`).join('') || '<p class="dm">Coming soon.</p>'}</div>`, 'top') }));
  if (en('faq')) w('faq/index.html', shell({ depth: 1, t: 'FAQ | ' + name, body: sec(`${head('Questions', g(S.faq_page, 'title', 'FAQ'))}<div class="wr">${(S.faq || []).filter(x => x.show !== false).map(x => `<details><summary>${E(x.q)}</summary>${md(x.a)}</details>`).join('')}</div>`, 'top') }));
  if (en('contact')) w('contact/index.html', shell({ depth: 1, t: g(C, 'title', 'Contact') + ' | ' + name, body: sec(`${head(g(C, 'label', 'Get in touch'), g(C, 'title', 'Contact'), g(C, 'text', ''))}<div class="wr">${on(C, 'show_email', true) ? `<p class="big"><a href="mailto:${E(email)}">${E(email)}</a></p>` : ''}<p class="dm">${E(g(C, 'location', ''))}</p><div class="so">${soc(C.instagram, C.tiktok)}</div></div>`, 'top') }));
  // JOURNAL
  if (en('journal')) {
    w('journal/index.html', shell({ depth: 1, t: 'Journal | ' + name, body: sec(`${head('News and stories', g(H, 'journal_title', 'The *Journal*'))}<div class="wr gp">${posts.map(p => pcard(p, '../')).join('') || '<p class="dm">Stories coming soon.</p>'}</div>`, 'top') }));
    for (const p of posts) w('journal/' + p.slug + '/index.html', shell({ depth: 2, t: p.title + ' | ' + name, d: p.excerpt, img: p.cover, body: `<article class="wr post top"><p class="eb">${fd(p.date)}${(p.tags || []).length ? ' / ' + p.tags.map(E).join(', ') : ''}</p><h1>${E(p.title)}</h1>${p.t0 ? `<div class="fr wide"><img src="../../${p.t0}" alt="" style="object-position:${fp(p.focus || 'center')}"></div>` : ''}<div class="pb">${md(p.__body)}</div></article>` }));
  }
  w('404.html', '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#f4f1ea;font:16px system-ui;text-align:center"><div><h1 style="font-weight:400">Page not found</h1><p><a href="/" style="color:#d8c3a5">Back to the homepage</a></p></div>');
  console.log('Built ' + models.length + ' model page(s) and ' + posts.length + ' journal post(s). Sharp: ' + (sharp ? 'on' : 'off'));
}
main().catch(e => { console.error(e); process.exit(1); });
