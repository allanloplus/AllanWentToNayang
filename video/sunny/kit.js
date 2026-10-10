/* 90 年代賽璐璐動畫風格角色與場景工具組（陽光版）
 * 角色：深藍描邊、雙色塊陰影、大眼睛（漸層虹膜＋兩點高光）、分層髮束與藍色髮光。
 */
const W = 1280, H = 720, FPS = 24;
const cv = document.getElementById('c'), X = cv.getContext('2d');

/* ───────── utils ───────── */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const eio = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const backE = k => { const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const RND = (() => { const r = rng(5); return Array.from({ length: 8000 }, r); })();
const rnd = i => RND[((Math.floor(i) % 8000) + 8000) % 8000];
const P = fn => { X.save(); fn(); X.restore(); };
const ell = (x, y, rx, ry, rot = 0) => { X.beginPath(); X.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); };
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
function vgrad(y0, y1, stops) { const g = X.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / (stops.length - 1), s)); return g; }
const VOICE = '"LXGW WenKai TC", "WenQuanYi Zen Hei", serif', DISP = '"Noto Serif TC", "WenQuanYi Zen Hei", serif';
const LINE = '#2a2246';
function ink(lw) { X.lineWidth = lw; X.strokeStyle = LINE; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); }
function fillInk(c, lw) { X.fillStyle = c; X.fill(); if (lw) ink(lw); }
const CACHE = {};
function cached(key, w, h, draw) { if (!CACHE[key]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); CACHE[key] = c; } return CACHE[key]; }

/* ───────── sky & scenery (anime background art) ───────── */
const SKY = ['#1f6fd0', '#3d8fe6', '#73b6f2', '#b5dcfa'];
function sky(stops = SKY, y1 = H) { X.fillStyle = vgrad(0, y1, stops); X.fillRect(0, 0, W, y1); }
function cumulus(key, seed, w, h, o = {}) {
  return cached(key, w, h, (c) => {
    const r = rng(seed), lit = o.lit || '#ffffff', shade = o.shade || '#c8d4f4', blush = o.blush || '#f7d4e6';
    const puffs = []; const n = o.n || 34, baseY = h * .78;
    for (let i = 0; i < n; i++) { const px = w * (.08 + r() * .84), dist = Math.abs(px - w / 2) / (w / 2), pr = (h * .16 + r() * h * .2) * (1 - dist * .55), py = baseY - pr * .6 - r() * h * .45 * (1 - dist); puffs.push([px, py, pr]); }
    puffs.sort((a, b) => a[1] - b[1]);
    const clip = () => { c.beginPath(); c.rect(0, 0, w, baseY + 4); c.clip(); };
    c.save(); clip();
    c.fillStyle = shade; puffs.forEach(([x, y, pr]) => { c.beginPath(); c.arc(x, y, pr, 0, 7); c.fill(); });
    c.fillStyle = lit; puffs.forEach(([x, y, pr]) => { c.beginPath(); c.arc(x + pr * .14, y - pr * .16, pr * .86, 0, 7); c.fill(); });
    const g = c.createLinearGradient(0, baseY - h * .25, 0, baseY); g.addColorStop(0, rgba(blush, 0)); g.addColorStop(1, rgba(blush, .85));
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.restore();
  });
}
function clouds(t, set = 'a', y = 60, speed = 6, scale = 1) {
  const defs = { a: [[120, 1, 560, 260], [780, 2, 640, 300], [1400, 3, 520, 240]], b: [[0, 7, 700, 320], [900, 8, 560, 250]], c: [[200, 11, 420, 180], [700, 12, 380, 160], [1150, 13, 460, 200]] }[set];
  defs.forEach(([x0, seed, w, h], i) => { const img = cumulus('cu' + set + seed, seed, w, h); const span = W + w + 200; const x = ((x0 - t * speed * (1 + i * .15)) % span + span) % span - w; X.drawImage(img, x, y + i * 18 * scale, w * scale, h * scale); });
}
function sunFlare(x, y, t, a = 1) {
  P(() => { X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(x, y, 0, x, y, 420); g.addColorStop(0, `rgba(255,250,225,${.95 * a})`); g.addColorStop(.12, `rgba(255,240,200,${.45 * a})`); g.addColorStop(1, 'rgba(255,240,200,0)'); X.fillStyle = g; X.fillRect(x - 420, y - 420, 840, 840);
    X.strokeStyle = `rgba(255,250,230,${.35 * a})`; X.lineWidth = 2; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283 + t * .05, l = 90 + (i % 3) * 60; X.beginPath(); X.moveTo(x + Math.cos(an) * 30, y + Math.sin(an) * 30); X.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); X.stroke(); }
    const dx = W / 2 - x, dy = H / 2 - y; [[.5, 28, '#a8e0ff'], [.9, 16, '#ffd0f0'], [1.3, 44, '#c8ffd8'], [1.7, 22, '#fff0b0']].forEach(([k, r, c]) => { const fx = x + dx * k, fy = y + dy * k; X.fillStyle = rgba(c, .16 * a); X.beginPath(); for (let j = 0; j < 6; j++) X.lineTo(fx + Math.cos(j * Math.PI / 3) * r, fy + Math.sin(j * Math.PI / 3) * r); X.fill(); }); });
}
function sparkle(x, y, r, t, c = '#ffffff') { P(() => { X.translate(x, y); X.rotate(t); X.fillStyle = c; X.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .22 : r; X.lineTo(Math.cos(i * Math.PI / 4) * rr, Math.sin(i * Math.PI / 4) * rr); } X.fill(); }); }
function sparkles(t, n, area, seed = 1, c = '#ffffff', size = 10) { for (let i = 0; i < n; i++) { const k = seed * 17 + i, ph = (t * (.6 + rnd(k) * .8) + rnd(k + 1)) % 1; const s = Math.sin(ph * Math.PI); if (s <= 0) continue; sparkle(area[0] + rnd(k + 2) * area[2], area[1] + rnd(k + 3) * area[3], size * s * (.5 + rnd(k + 4)), t + i, c); } }
function hibiscus(x, y, s, rot, c = '#ff5a6a') { P(() => { X.translate(x, y); X.rotate(rot); X.scale(s, s); X.fillStyle = c; for (let k = 0; k < 5; k++) { X.rotate(Math.PI * 2 / 5); ell(0, -10, 7, 10); X.fill(); } X.fillStyle = '#ffe07a'; ell(0, 0, 3, 3); X.fill(); }); }
function petals(t, n = 30, seed = 1, colors = ['#ff6a7a', '#ffb0c8', '#ffd36b', '#ffffff']) { for (let i = 0; i < n; i++) { const k = seed * 31 + i; const y = ((rnd(k) * H + t * (40 + rnd(k + 1) * 50)) % (H + 80)) - 40; const x = (rnd(k + 2) * W + Math.sin(t * 1.1 + i) * 40 - t * 20 % W + W) % W; hibiscus(x, y, .6 + rnd(k + 3) * .6, t * (rnd(k + 4) - .5) * 3 + i, colors[i % colors.length]); } }
function birds(t, n, y0, c = '#ffffff', speed = 40, seed = 3, size = 1) { P(() => { X.strokeStyle = c; X.lineCap = 'round'; for (let i = 0; i < n; i++) { const k = seed * 37 + i; const x = ((rnd(k) * W + t * speed * (.7 + rnd(k + 1) * .6)) % (W + 120)) - 60, y = y0 + rnd(k + 2) * 120 + Math.sin(t + i) * 8, f = Math.sin(t * 6 + i * 1.7) * 6 * size, w = (11 + rnd(k + 3) * 6) * size; X.lineWidth = 2.6 * size; X.beginPath(); X.moveTo(x - w, y - f); X.quadraticCurveTo(x - w * .4, y - 4 * size, x, y); X.quadraticCurveTo(x + w * .4, y - 4 * size, x + w, y - f); X.stroke(); } }); }
function hills(y, amp, freq, seed, col, shade) { X.fillStyle = col; X.beginPath(); X.moveTo(0, H); for (let x = 0; x <= W; x += 10) X.lineTo(x, y - amp * (Math.sin(x * freq + seed) * .6 + Math.sin(x * freq * 2.7 + seed) * .25 + .2)); X.lineTo(W, H); X.fill(); if (shade) { X.fillStyle = shade; X.beginPath(); X.moveTo(0, H); for (let x = 0; x <= W; x += 10) X.lineTo(x, y + 14 - amp * .4 * (Math.sin(x * freq * 1.3 + seed + 1) * .5 + .3)); X.lineTo(W, H); X.fill(); } }
function palm(x, base, h, lean, sway = 0, o = {}) {
  const trunk = o.trunk || '#9a6a48', trunkSh = o.trunkSh || '#6e4a34', leaf = o.leaf || '#3fa65a', leafSh = o.leafSh || '#24764a';
  P(() => {
    X.lineCap = 'round'; X.strokeStyle = trunkSh; X.lineWidth = h * .055; X.beginPath(); X.moveTo(x, base); X.quadraticCurveTo(x + lean * .4, base - h * .55, x + lean, base - h); X.stroke();
    X.strokeStyle = trunk; X.lineWidth = h * .03; X.beginPath(); X.moveTo(x + h * .012, base); X.quadraticCurveTo(x + lean * .4 + h * .012, base - h * .55, x + lean + h * .01, base - h); X.stroke();
    const tx = x + lean, ty = base - h;
    for (let i = 0; i < 10; i++) { const a = -Math.PI * .5 + (i - 4.5) * .34 + Math.sin(sway + i) * .05, L = h * (.36 + rnd(i * 5 + x) * .08), droop = (Math.abs(i - 4.5) / 4.5) * .9 + .2;
      const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .55 + droop * L * .75, cx = tx + Math.cos(a) * L * .55, cy = ty + Math.sin(a) * L * .7 - L * .15;
      [[leafSh, 0], [leaf, -2]].forEach(([c, off]) => { X.fillStyle = c; X.beginPath(); X.moveTo(tx, ty + off); for (let k = 0; k <= 12; k++) { const q = k / 12, px = (1 - q) * (1 - q) * tx + 2 * (1 - q) * q * cx + q * q * ex, py = (1 - q) * (1 - q) * ty + 2 * (1 - q) * q * cy + q * q * ey, wdt = L * .1 * Math.sin(q * Math.PI) * (k % 2 ? 1.4 : .8); X.lineTo(px, py - wdt + off); } for (let k = 12; k >= 0; k--) { const q = k / 12, px = (1 - q) * (1 - q) * tx + 2 * (1 - q) * q * cx + q * q * ex, py = (1 - q) * (1 - q) * ty + 2 * (1 - q) * q * cy + q * q * ey, wdt = L * .1 * Math.sin(q * Math.PI) * (k % 2 ? 1.4 : .8); X.lineTo(px, py + wdt * .6 + off); } X.fill(); }); }
    X.fillStyle = '#7a5a2a'; [[-8, 6], [6, 8], [0, 12]].forEach(([dx, dy]) => { ell(tx + dx, ty + dy, h * .02, h * .02); X.fill(); });
  });
}
function sea(y, t, c1 = '#2fb6d8', c2 = '#1a7fc0') { X.fillStyle = vgrad(y, H, [c1, c2]); X.fillRect(0, y, W, H - y); P(() => { X.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 90; i++) { const yy = y + 6 + Math.pow(rnd(i), 1.5) * (H - y), w = 10 + rnd(i + 3) * 40 * (1 + (yy - y) / 200), x = (rnd(i + 9) * W + t * 12 * (rnd(i + 5) - .5) * 4 + W) % W; if (Math.sin(t * 2 + i) > .2) X.fillRect(x, yy, w, 2); } }); }
function factory(x, base, s, o = {}) {
  P(() => { X.translate(x, base); X.scale(s, s);
    X.beginPath(); X.rect(-380, -200, 760, 200); fillInk('#f3ead6', 3); X.fillStyle = '#d9cdb2'; X.fillRect(-380, -60, 760, 60);
    X.beginPath(); X.rect(-380, -210, 760, 34); fillInk('#3a78c8', 3);
    X.fillStyle = '#f0884a'; X.fillRect(-130, -176, 20, 176);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 10; c++) { const wx = -350 + c * 70 + (c > 3 ? 22 : 0), wy = -150 + r * 66; X.beginPath(); X.rect(wx, wy, 46, 36); fillInk('#8ec8ec', 2.5); X.fillStyle = 'rgba(255,255,255,.7)'; X.beginPath(); X.moveTo(wx + 6, wy + 30); X.lineTo(wx + 20, wy + 6); X.lineTo(wx + 26, wy + 6); X.lineTo(wx + 12, wy + 30); X.fill(); }
    X.font = `900 24px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText(o.sign || '巴里文打工廠', 0, -186);
  });
}
function grassField(y, c1 = '#7cc95a', c2 = '#5aa844') { X.fillStyle = vgrad(y, H, [c1, c2]); X.fillRect(0, y, W, H - y); X.strokeStyle = rgba('#3f8a34', .5); X.lineWidth = 2; for (let i = 0; i < 120; i++) { const gx = rnd(i) * W, gy = y + 10 + rnd(i + 1) * (H - y); X.beginPath(); X.moveTo(gx, gy); X.lineTo(gx - 3, gy - 8); X.moveTo(gx, gy); X.lineTo(gx + 3, gy - 9); X.stroke(); } }
function paddy(y, t) { X.fillStyle = vgrad(y, H, ['#9ad65a', '#5fb03e']); X.fillRect(0, y, W, H - y); X.strokeStyle = 'rgba(60,130,40,.5)'; X.lineWidth = 2; for (let i = 0; i < 20; i++) { const yy = y + i * i * 1.4 + 4; if (yy > H) break; X.beginPath(); for (let xx = 0; xx <= W; xx += 30) X.lineTo(xx, yy + Math.sin(xx * .02 + t * 1.5 + i) * 2); X.stroke(); } }
function kampung(x, base, s) { P(() => { X.translate(x, base); X.scale(s, s); X.fillStyle = '#6a4a32'; [-60, -20, 20, 60].forEach(px => X.fillRect(px - 4, -44, 8, 44)); X.beginPath(); X.rect(-82, -116, 164, 74); fillInk('#c8935e', 3); X.fillStyle = '#a8784a'; X.fillRect(-82, -60, 164, 18); X.beginPath(); X.moveTo(-104, -112); X.lineTo(0, -178); X.lineTo(104, -112); X.closePath(); fillInk('#b0483a', 3); [-48, 22].forEach(wx => { X.beginPath(); X.rect(wx, -102, 28, 32); fillInk('#ffe6a8', 2); }); }); }

/* ───────── anime head (3/4 view facing right; flip with dir:-1) ─────────
 * Units: the head is about 230 units tall; scale with s.
 */
const SKIN = { base: '#ffe1cc', sh: '#f4b49c', blush: '#ff9a9a' };
const HAIR = { base: '#2b3266', sh: '#1a1d42', hi: '#7a8fd8', rim: '#a8d8ff' };
function eye(cx, cy, w, h, far, o) {
  const lx = (o.lookX || 0) * w * .18, ly = (o.lookY || 0) * h * .14;
  const ex = o.expr;
  if (o.blink || ex === 'happy') {
    X.beginPath(); if (ex === 'happy') { X.moveTo(cx - w * .5, cy + h * .12); X.quadraticCurveTo(cx, cy - h * .38, cx + w * .5, cy + h * .08); } else { X.moveTo(cx - w * .5, cy + h * .05); X.quadraticCurveTo(cx, cy + h * .22, cx + w * .5, cy + h * .02); }
    ink(4.5); return;
  }
  const open = ex === 'surprised' ? 1.12 : 1;
  const top = cy - h * .5 * open, bot = cy + h * .5;
  // sclera
  X.save(); X.beginPath(); X.moveTo(cx - w * .5, cy - h * .05); X.bezierCurveTo(cx - w * .3, top, cx + w * .35, top - h * .02, cx + w * .52, cy - h * .2); X.bezierCurveTo(cx + w * .5, cy + h * .3, cx + w * .2, bot, cx - w * .05, bot); X.bezierCurveTo(cx - w * .35, bot, cx - w * .5, cy + h * .2, cx - w * .5, cy - h * .05); X.closePath();
  X.fillStyle = '#ffffff'; X.fill(); X.clip();
  // iris
  const ix = cx + lx + (far ? w * .04 : 0), iy = cy + ly + h * .06, irx = w * (far ? .34 : .36), iry = h * .42;
  const g = X.createLinearGradient(0, iy - iry, 0, iy + iry); g.addColorStop(0, o.iris1 || '#2a1214'); g.addColorStop(.55, o.iris2 || '#7a3524'); g.addColorStop(1, o.iris3 || '#d27a3e');
  ell(ix, iy, irx, iry); X.fillStyle = g; X.fill(); X.lineWidth = 2; X.strokeStyle = '#1a0a0a'; X.stroke();
  ell(ix, iy + iry * .05, irx * .46, iry * .5); X.fillStyle = '#140808'; X.fill();
  X.fillStyle = 'rgba(0,0,0,.18)'; X.fillRect(cx - w, top - 2, w * 2, h * .22); // lid shadow
  X.restore();
  // highlights
  X.fillStyle = '#ffffff'; ell(ix - irx * .38, iy - iry * .38, irx * .34, iry * .26); X.fill(); ell(ix + irx * .42, iy + iry * .45, irx * .14, iry * .1); X.fill();
  if (o.teary) { X.fillStyle = 'rgba(190,230,255,.85)'; ell(ix, bot - h * .08, w * .4, h * .08); X.fill(); X.fillStyle = '#fff'; ell(ix - w * .12, bot - h * .1, w * .06, h * .04); X.fill(); }
  // upper lid / lashes
  X.beginPath(); X.moveTo(cx - w * .52, cy - h * .02); X.bezierCurveTo(cx - w * .3, top - h * .04, cx + w * .3, top - h * .06, cx + w * .56, cy - h * .22); X.lineTo(cx + w * .66, cy - h * .3);
  X.lineWidth = far ? 5 : 6; X.strokeStyle = '#1a1230'; X.lineCap = 'round'; X.stroke();
  X.beginPath(); X.moveTo(cx + w * .1, bot + 1); X.quadraticCurveTo(cx + w * .35, bot - h * .05, cx + w * .48, cy + h * .2); X.lineWidth = 2; X.stroke();
}
function animeHead(x, y, s, o = {}) {
  const t = o.t || 0, skin = o.skin || SKIN, hair = o.hairC || HAIR, wind = Math.sin(t * 2.2) * (o.wind ?? 1);
  const blink = !o.noBlink && (((t + (o.ph || 0)) % 4.1) > 3.95);
  P(() => {
    X.translate(x, y); X.scale(s * (o.dir || 1), s); X.rotate(o.tilt || 0);
    const style = o.hair || 'allan';
    // back hair
    if (style === 'long') { X.beginPath(); X.moveTo(-96, -40); X.bezierCurveTo(-130, 60, -110, 180, -60 + wind * 10, 260); X.lineTo(80 + wind * 12, 250); X.bezierCurveTo(110, 160, 110, 40, 90, -40); X.closePath(); fillInk(hair.base, 3.5); X.fillStyle = hair.sh; X.beginPath(); X.moveTo(-60, 40); X.quadraticCurveTo(-90, 160, -50 + wind * 10, 250); X.lineTo(-20, 250); X.quadraticCurveTo(-40, 140, -30, 40); X.fill(); }
    if (style === 'pigtails') { [-1, 1].forEach(sd => { P(() => { X.translate(sd * 96, 0); X.rotate(sd * .25 + wind * .06); X.beginPath(); X.moveTo(-18, 0); X.bezierCurveTo(-40, 70, -20, 140, sd * 6, 170); X.bezierCurveTo(20, 140, 40, 70, 18, 0); X.closePath(); fillInk(hair.base, 3); }); ell(sd * 92, -4, 12, 12); fillInk('#ff7aa8', 2.5); }); }
    if (style === 'hijab') { X.beginPath(); X.moveTo(-110, -30); X.bezierCurveTo(-120, -150, 120, -150, 110, -30); X.bezierCurveTo(130, 80, 110, 170, 60, 200); X.lineTo(-90, 200); X.bezierCurveTo(-130, 120, -125, 40, -110, -30); X.closePath(); fillInk(o.hijabC || '#e86a9a', 3.5); X.fillStyle = mix(o.hijabC || '#e86a9a', '#5a2040', .3); X.beginPath(); X.moveTo(-100, 40); X.quadraticCurveTo(-110, 140, -70, 196); X.lineTo(-40, 196); X.quadraticCurveTo(-80, 120, -70, 40); X.fill(); }
    if (style === 'bun') { ell(-70, -70, 46, 40); fillInk(hair.base, 3); }
    if (style !== 'hijab') { ell(-6, -36, 100, 96); fillInk(hair.base, 3.5); if (style === 'allan' || style === 'short' || style === 'cap') { X.beginPath(); X.moveTo(-100, -30); X.bezierCurveTo(-118, 30, -110 + wind * 4, 80, -84 + wind * 6, 112); X.lineTo(-70, 70); X.lineTo(-58, 100); X.bezierCurveTo(-56, 60, -40, 20, -30, -20); X.closePath(); fillInk(hair.base, 3); X.fillStyle = hair.sh; X.beginPath(); X.moveTo(-96, 0); X.bezierCurveTo(-106, 40, -96, 70, -84 + wind * 6, 106); X.lineTo(-76, 60); X.fill(); } }
    // neck
    X.beginPath(); X.moveTo(-34, 90); X.lineTo(-30, 170); X.lineTo(26, 170); X.lineTo(28, 96); X.closePath(); fillInk(skin.base, 3); X.fillStyle = skin.sh; X.beginPath(); X.moveTo(-32, 96); X.lineTo(28, 100); X.lineTo(26, 128); X.quadraticCurveTo(-2, 118, -31, 140); X.fill();
    // ear
    if (style !== 'hijab') { ell(-72, 18, 17, 26, -.15); fillInk(skin.base, 3); X.beginPath(); X.moveTo(-74, 6); X.quadraticCurveTo(-64, 18, -72, 32); X.lineWidth = 2; X.strokeStyle = skin.sh; X.stroke(); }
    // face
    X.beginPath(); X.moveTo(-80, -30); X.bezierCurveTo(-86, 36, -66, 84, -22, 108); X.bezierCurveTo(0, 120, 20, 124, 34, 118); X.bezierCurveTo(58, 100, 74, 70, 78, 42); X.bezierCurveTo(82, 22, 86, 2, 84, -30); X.closePath();
    X.fillStyle = skin.base; X.fill();
    X.save(); X.clip(); X.fillStyle = skin.sh; X.beginPath(); X.moveTo(-90, -30); X.lineTo(-48, -30); X.bezierCurveTo(-60, 20, -54, 70, -6, 112); X.lineTo(-90, 120); X.fill();
    X.fillStyle = rgba(skin.sh, .9); X.beginPath(); X.moveTo(-90, -40); X.lineTo(90, -40); X.lineTo(90, -6); X.bezierCurveTo(40, 4, -20, -2, -90, 0); X.fill(); X.restore();
    X.beginPath(); X.moveTo(-82, 10); X.bezierCurveTo(-82, 50, -66, 84, -22, 108); X.bezierCurveTo(0, 120, 20, 124, 34, 118); X.bezierCurveTo(58, 100, 74, 70, 78, 42); X.bezierCurveTo(82, 22, 86, 2, 84, -20); ink(3.5);
    // blush (90s hatching)
    if (o.blush !== false) { X.strokeStyle = rgba(skin.blush, .7); X.lineWidth = 2; for (let i = 0; i < 4; i++) { X.beginPath(); X.moveTo(-40 + i * 8, 62); X.lineTo(-46 + i * 8, 72); X.stroke(); X.beginPath(); X.moveTo(52 + i * 6, 58); X.lineTo(48 + i * 6, 66); X.stroke(); } X.fillStyle = rgba(skin.blush, .22); ell(-28, 66, 22, 9); X.fill(); ell(60, 62, 14, 7); X.fill(); }
    // eyes + brows
    const eo = { ...o, blink, expr: o.expr };
    eye(-16, 18, 46, 50, false, eo); eye(52, 14, 32, 48, true, eo);
    const bu = o.expr === 'surprised' ? -8 : o.expr === 'happy' ? -2 : 0, by = o.lookY < 0 ? -4 : 0;
    X.beginPath(); X.moveTo(-44, -16 + bu + by); X.quadraticCurveTo(-18, -26 + bu + by, 8, -20 + bu + by); ink(4);
    X.beginPath(); X.moveTo(38, -20 + bu + by); X.quadraticCurveTo(54, -26 + bu + by, 70, -20 + bu + by); ink(3.5);
    // nose
    X.beginPath(); X.moveTo(74, 34); X.lineTo(80, 54); X.lineTo(72, 58); X.lineWidth = 2.5; X.strokeStyle = mix(skin.sh, '#7a3a3a', .4); X.stroke();
    // mouth
    const ex = o.expr || 'smile', talk = o.talk ? Math.abs(Math.sin(t * 13)) : 0;
    if (ex === 'grin' || ex === 'happy' || talk > .3) { const oh = ex === 'grin' || ex === 'happy' ? 14 : 4 + talk * 10; X.beginPath(); X.moveTo(28, 82); X.quadraticCurveTo(46, 84, 62, 78); X.quadraticCurveTo(50, 82 + oh * 1.4, 34, 84 + oh * .6); X.closePath(); fillInk('#b8404a', 2.5); X.fillStyle = '#ff8a8a'; ell(46, 88 + oh * .4, 10, oh * .3); X.fill(); }
    else if (ex === 'surprised') { ell(44, 86, 8, 10); fillInk('#b8404a', 2.5); }
    else { X.beginPath(); X.moveTo(30, 84); X.quadraticCurveTo(46, 90, 60, 80); ink(2.5); }
    // glasses (Allan)
    if (o.glasses) { X.lineWidth = 2.6; X.strokeStyle = '#4a3a3a'; X.beginPath(); X.roundRect(-46, -6, 64, 50, 14); X.stroke(); X.beginPath(); X.roundRect(30, -8, 44, 48, 12); X.stroke(); X.beginPath(); X.moveTo(18, 8); X.quadraticCurveTo(24, 2, 30, 6); X.stroke(); X.beginPath(); X.moveTo(-46, 8); X.lineTo(-74, 2); X.stroke();
      X.strokeStyle = 'rgba(255,255,255,.55)'; X.lineWidth = 3; X.beginPath(); X.moveTo(-30, 36); X.lineTo(-14, 0); X.moveTo(40, 32); X.lineTo(52, 2); X.stroke(); }
    if (o.bindi) { X.fillStyle = '#d8304a'; ell(10, -12, 4, 4); X.fill(); }
    // front hair
    if (style === 'hijab') { X.beginPath(); X.moveTo(-84, -20); X.bezierCurveTo(-80, -90, 70, -100, 88, -24); X.bezierCurveTo(60, -50, -40, -56, -84, -20); fillInk(o.hijabC || '#e86a9a', 3); X.beginPath(); X.moveTo(-86, -20); X.bezierCurveTo(-96, 60, -74, 110, -26, 132); ink(3); X.beginPath(); X.moveTo(88, -24); X.bezierCurveTo(96, 40, 80, 100, 40, 128); ink(3); return; }
    const locks = style === 'allan' ? [
      [-50, -124, -2.85, 34, 22], [-10, -134, -2.65, 32, 22],
      [-92, -40, 1.75, 84, 34], [-74, -70, 1.6, 88, 40], [-44, -86, 1.45, 92, 44], [-10, -92, 1.3, 94, 44], [24, -88, 1.12, 88, 42], [54, -76, .95, 76, 38], [80, -58, .8, 56, 30], [92, -36, .7, 34, 20]
    ] : style === 'pigtails' || style === 'long' || style === 'bun' ? [
      [-80, -60, 1.95, 80, 40], [-44, -84, 1.6, 84, 44], [-6, -90, 1.4, 84, 44], [30, -86, 1.2, 80, 42], [64, -70, .95, 64, 36], [86, -44, .75, 40, 24]
    ] : [[-80, -60, 1.9, 70, 38], [-40, -86, 1.55, 76, 42], [0, -92, 1.35, 76, 42], [40, -84, 1.1, 70, 40], [74, -60, .85, 52, 30]];
    if (style === 'cap') { X.beginPath(); X.moveTo(-98, -30); X.bezierCurveTo(-96, -150, 100, -150, 98, -30); X.closePath(); fillInk(o.capC || '#e85a4a', 3.5); X.beginPath(); X.moveTo(60, -40); X.quadraticCurveTo(140, -40, 160, -20); X.quadraticCurveTo(120, -10, 60, -24); X.closePath(); fillInk(o.capC || '#e85a4a', 3); }
    locks.forEach(([bx, by, ang, len, wd], i) => {
      const a = ang + (len > 80 ? wind * .03 : wind * .06) * (i % 2 ? 1 : -1), tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len, nx = -Math.sin(a) * wd / 2, ny = Math.cos(a) * wd / 2, bend = (i % 2 ? 14 : -10);
      X.beginPath(); X.moveTo(bx - nx, by - ny); X.quadraticCurveTo((bx + tx) / 2 - nx * .6 + bend, (by + ty) / 2 - ny * .6, tx, ty); X.quadraticCurveTo((bx + tx) / 2 + nx * .6 + bend * .5, (by + ty) / 2 + ny * .6, bx + nx, by + ny); X.closePath(); fillInk(i % 3 === 1 ? hair.sh : hair.base, 3);
    });
    // highlight band (90s glossy hair)
    if (style !== 'cap') { X.save(); ell(-6, -36, 100, 96); X.clip(); X.strokeStyle = hair.hi; X.lineWidth = 7; X.lineCap = 'round'; X.fillStyle = hair.hi; X.beginPath(); const a0 = -2.55, a1 = -.95; for (let i = 0; i <= 20; i++) { const a = a0 + (a1 - a0) * i / 20; X.lineTo(-6 + Math.cos(a) * 78, -36 + Math.sin(a) * 74); } for (let i = 20; i >= 0; i--) { const a = a0 + (a1 - a0) * i / 20, r = 60 - (i % 2) * 10; X.lineTo(-6 + Math.cos(a) * r, -36 + Math.sin(a) * (r - 2)); } X.closePath(); X.fill(); X.restore();
      X.strokeStyle = rgba(hair.rim, .85); X.lineWidth = 3; X.beginPath(); X.arc(-6, -36, 98, -1.3, -.2); X.stroke(); }
  });
}

/* ───────── bodies ───────── */
const OUTFIT = { allan: { top: '#5aa6ec', topSh: '#3a7cc4', collar: '#ffffff', pants: '#2e3a66', pantsSh: '#1e2648', shoe: '#5a3a2a' } };
/* bust: head + shoulders, for close-ups. x,y = chin point */
function bust(x, y, s, o = {}) {
  const c = o.outfit || OUTFIT.allan, t = o.t || 0;
  P(() => { X.translate(x, y); X.scale(s * (o.dir || 1), s);
    X.beginPath(); X.moveTo(-60, 150); X.bezierCurveTo(-170, 170, -240, 220, -260, 420); X.lineTo(250, 420); X.bezierCurveTo(240, 230, 170, 170, 70, 150); X.closePath(); fillInk(c.top, 4);
    X.fillStyle = c.topSh; X.beginPath(); X.moveTo(-60, 152); X.bezierCurveTo(-170, 172, -240, 222, -258, 420); X.lineTo(-120, 420); X.bezierCurveTo(-130, 300, -110, 220, -40, 170); X.fill();
    if (o.hood) { X.beginPath(); X.moveTo(-110, 160); X.bezierCurveTo(-140, 120, -60, 120, -20, 150); X.lineTo(80, 150); X.bezierCurveTo(140, 130, 170, 160, 130, 190); X.bezierCurveTo(60, 240, -60, 240, -110, 160); fillInk(c.top, 3.5); X.fillStyle = c.topSh; X.beginPath(); X.moveTo(-100, 168); X.bezierCurveTo(-40, 220, 60, 222, 120, 188); X.lineTo(110, 200); X.bezierCurveTo(50, 236, -50, 236, -100, 168); X.fill(); }
    else { X.beginPath(); X.moveTo(-50, 146); X.lineTo(4, 214); X.lineTo(-62, 196); X.closePath(); fillInk(c.collar, 3); X.beginPath(); X.moveTo(60, 146); X.lineTo(4, 214); X.lineTo(76, 192); X.closePath(); fillInk(c.collar, 3); X.beginPath(); X.moveTo(4, 214); X.lineTo(4, 330); ink(2.5); [250, 296].forEach(by => { ell(4, by, 5, 5); fillInk('#ffffff', 2); }); X.fillStyle = '#ffd36b'; ell(110, 250, 12, 12); X.fill(); }
    if (o.strap) { X.beginPath(); X.moveTo(-150, 180); X.lineTo(160, 420); X.lineTo(200, 420); X.lineTo(-120, 168); X.closePath(); fillInk('#8a6a4a', 3); }
    animeHead(0, -70, 1.3, { ...o, dir: 1 });
    if (o.hand) o.hand();
  });
}
/* full figure: x,y = feet; h = height in px */
function person(x, y, h, o = {}) {
  const t = o.t || 0, k = h / 6.1, s = k / 230, c = o.outfit || OUTFIT.allan, skin = o.skin || SKIN;
  const walk = o.walk ? Math.sin(t * (o.pace || 7) + (o.ph || 0)) : 0, hop = o.hop ? Math.abs(Math.sin(t * 6 + (o.ph || 0))) * k * .25 : 0;
  const bob = o.walk ? Math.abs(walk) * k * .05 : Math.sin(t * 2 + (o.ph || 0)) * k * .01;
  P(() => { X.translate(x, y - hop - bob); if (o.dir === -1) X.scale(-1, 1);
    X.fillStyle = 'rgba(40,60,100,.22)'; ell(0, hop + bob, k * .9, k * .14); X.fill();
    const hipY = -2.75 * k, shY = -4.75 * k, lw = Math.max(2, k * .03);
    // legs
    const leg = (sd) => { const sw = sd * walk * .35, lift = o.walk ? Math.max(0, -sd * walk) * k * .25 : 0; P(() => { X.translate(sd * .26 * k, hipY); X.rotate(sw); X.beginPath(); X.roundRect(-.25 * k, 0, .5 * k, 2.68 * k - lift, .2 * k); fillInk(o.dress ? skin.base : c.pants, lw); if (!o.dress) { X.fillStyle = c.pantsSh; X.fillRect(-.22 * k, .1 * k, .16 * k, 2.5 * k - lift); } X.beginPath(); X.ellipse(.1 * k, 2.7 * k - lift, .34 * k, .16 * k, 0, 0, 7); fillInk(c.shoe || '#6a4a3a', lw); }); };
    leg(-1); leg(1);
    // torso / dress
    if (o.dress) { X.beginPath(); X.moveTo(-.6 * k, shY); X.lineTo(.6 * k, shY); X.lineTo(1.0 * k + walk * .05 * k, -1.0 * k); X.quadraticCurveTo(0, -.85 * k, -1.0 * k, -1.0 * k); X.closePath(); fillInk(o.dress, lw); X.fillStyle = mix(o.dress, '#2a2246', .25); X.beginPath(); X.moveTo(-.6 * k, shY); X.lineTo(-.2 * k, shY); X.lineTo(-.45 * k, -1.0 * k); X.lineTo(-1.0 * k, -1.0 * k); X.fill(); if (o.sash) { X.beginPath(); X.moveTo(-.55 * k, shY); X.lineTo(-.2 * k, shY); X.lineTo(.9 * k, -2.2 * k); X.lineTo(.7 * k, -1.8 * k); X.closePath(); fillInk(o.sash, lw * .8); } }
    else { X.beginPath(); X.moveTo(-.3 * k, shY - .12 * k); X.quadraticCurveTo(-.82 * k, shY - .08 * k, -.86 * k, shY + .35 * k); X.quadraticCurveTo(-.68 * k, (shY + hipY) / 2, -.66 * k, hipY + .15 * k); X.lineTo(.66 * k, hipY + .15 * k); X.quadraticCurveTo(.68 * k, (shY + hipY) / 2, .86 * k, shY + .35 * k); X.quadraticCurveTo(.82 * k, shY - .08 * k, .3 * k, shY - .12 * k); X.closePath(); fillInk(c.top, lw); X.fillStyle = c.topSh; X.beginPath(); X.moveTo(-.72 * k, shY); X.lineTo(-.4 * k, shY); X.lineTo(-.3 * k, hipY + .1 * k); X.lineTo(-.62 * k, hipY + .1 * k); X.fill(); X.beginPath(); X.moveTo(-.25 * k, shY - .05 * k); X.lineTo(0, shY + .35 * k); X.lineTo(.25 * k, shY - .05 * k); fillInk(c.collar || '#fff', lw * .8); }
    // arms: o.arms = [leftAngle, rightAngle] (0 = down), o.elbow bends
    const def = o.walk ? [walk * .4, -walk * .4] : [.12, -.12];
    const A = o.arms || def, E = o.elbow || [0, 0];
    [-1, 1].forEach((sd, i) => P(() => { X.translate(sd * .74 * k, shY + .3 * k); X.rotate(A[i]); X.beginPath(); X.roundRect(-.21 * k, -.2 * k, .42 * k, 1.25 * k, .2 * k); fillInk(o.dress || c.top, lw); X.translate(0, 1.0 * k); X.rotate(E[i]); X.beginPath(); X.roundRect(-.15 * k, 0, .3 * k, 1.0 * k, .14 * k); fillInk(skin.base, lw); ell(0, 1.08 * k, .19 * k, .2 * k); fillInk(skin.base, lw); if (o.holdR && i === 1) P(() => { X.translate(0, 1.15 * k); o.holdR(k); }); }));
    animeHead(.02 * k, -5.45 * k, s, { ...o, dir: 1 });
  });
}
/* bicycle (阿強一號) with optional rider, side view facing right */
function bike(x, y, s, t, o = {}) {
  const spin = t * (o.speed ?? 6);
  P(() => { X.translate(x, y); X.scale(s * (o.dir || 1), s);
    X.fillStyle = 'rgba(40,60,100,.2)'; ell(0, 2, 120, 10); X.fill();
    const wheel = wx => P(() => { X.translate(wx, -48); ell(0, 0, 48, 48); X.lineWidth = 10; X.strokeStyle = '#2a2a36'; X.stroke(); X.lineWidth = 3; X.strokeStyle = LINE; ell(0, 0, 53, 53); X.stroke(); X.lineWidth = 2; X.strokeStyle = '#a8b0c0'; X.rotate(spin); for (let i = 0; i < 12; i++) { X.rotate(Math.PI / 6); X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 42); X.stroke(); } ell(0, 0, 6, 6); fillInk('#c8c8d0', 2); });
    wheel(-74); wheel(74);
    X.lineCap = 'round'; X.lineJoin = 'round';
    const frame = (c, w) => { X.strokeStyle = c; X.lineWidth = w; X.beginPath(); X.moveTo(-74, -48); X.lineTo(-10, -50); X.lineTo(-32, -118); X.lineTo(-74, -48); X.moveTo(-10, -50); X.lineTo(46, -116); X.lineTo(-32, -118); X.moveTo(46, -116); X.lineTo(74, -48); X.moveTo(46, -116); X.lineTo(42, -140); X.lineTo(64, -144); X.stroke(); };
    frame(LINE, 11); frame('#2a2a36', 7); X.strokeStyle = '#ff8a3a'; X.lineWidth = 3; X.beginPath(); X.moveTo(-4, -60); X.lineTo(38, -108); X.stroke();
    X.beginPath(); X.roundRect(-54, -132, 44, 11, 5); fillInk('#2a2a36', 2.5);
    P(() => { X.translate(-10, -50); X.rotate(spin * .6); X.lineWidth = 5; X.strokeStyle = '#6a6a7a'; X.beginPath(); X.moveTo(-20, 0); X.lineTo(20, 0); X.stroke(); });
    if (o.face) { ell(66, -136, 9, 7); fillInk('#fffbe0', 2); }
    if (o.rider) {
      const r = o.rider, k = 62, ped = spin * .6, c = OUTFIT.allan, skin = SKIN;
      [0, Math.PI].forEach((ph, j) => { const px = -10 + Math.cos(ped + ph) * 18, py = -50 + Math.sin(ped + ph) * 18, kx = (px - 32) / 2 + 18, ky = (py - 132) / 2 - 10; P(() => { X.lineCap = 'round'; X.strokeStyle = LINE; X.lineWidth = 26; X.beginPath(); X.moveTo(-32, -132); X.lineTo(kx, ky); X.lineTo(px, py); X.stroke(); X.strokeStyle = j ? c.pantsSh : c.pants; X.lineWidth = 21; X.stroke(); X.fillStyle = '#6a4a3a'; ell(px + 8, py + 4, 16, 8); X.fill(); }); });
      X.beginPath(); X.moveTo(-50, -126); X.quadraticCurveTo(-46, -200, -10, -236); X.lineTo(26, -224); X.quadraticCurveTo(0, -180, -6, -126); X.closePath(); fillInk(c.top, 3); X.fillStyle = c.topSh; X.beginPath(); X.moveTo(-50, -126); X.quadraticCurveTo(-46, -200, -10, -236); X.lineTo(-4, -226); X.quadraticCurveTo(-30, -190, -30, -126); X.fill();
      P(() => { X.lineCap = 'round'; X.strokeStyle = LINE; X.lineWidth = 19; X.beginPath(); X.moveTo(6, -220); X.lineTo(36, -176); X.lineTo(58, -146); X.stroke(); X.strokeStyle = c.top; X.lineWidth = 15; X.beginPath(); X.moveTo(6, -220); X.lineTo(30, -184); X.stroke(); X.strokeStyle = skin.base; X.beginPath(); X.moveTo(30, -184); X.lineTo(58, -146); X.stroke(); });
      animeHead(8, -282, .3, { ...r, t, dir: 1 });
    }
  });
}
function figurine(x, y, s, t = 0) { P(() => { X.translate(x, y); X.scale(s, s); X.translate(0, -Math.abs(Math.sin(t * 3)) * 3); X.beginPath(); X.roundRect(-24, -58, 48, 56, 12); fillInk('#ff9ab8', 3); X.beginPath(); X.roundRect(-11, -56, 22, 18, 4); fillInk('#7ab8f0', 2); X.beginPath(); X.moveTo(-38, -70); X.bezierCurveTo(-46, -146, 46, -146, 38, -70); X.lineTo(42, -40); X.lineTo(-42, -40); X.closePath(); fillInk('#7a5ab8', 3); ell(0, -94, 34, 32); fillInk('#ffe6d4', 3); X.beginPath(); X.moveTo(-36, -102); X.bezierCurveTo(-34, -142, 34, -142, 36, -102); X.bezierCurveTo(14, -118, -14, -118, -36, -102); fillInk('#7a5ab8', 3); X.beginPath(); X.roundRect(-32, -138, 64, 13, 6); fillInk('#ff5a6a', 3); X.lineWidth = 3; X.strokeStyle = '#2a2a3a'; ell(-13, -94, 12, 12); X.stroke(); ell(13, -94, 12, 12); X.stroke(); X.fillStyle = '#2a2a3a'; ell(-13, -94, 3, 4); X.fill(); ell(13, -94, 3, 4); X.fill(); X.beginPath(); X.arc(0, -78, 8, .2, Math.PI - .2); ink(2.5); }); }

/* ───────── text ───────── */
function subtitle(text, a, who) {
  if (a <= 0 || !text) return;
  P(() => { X.globalAlpha = a; X.font = `700 32px ${VOICE}`; X.textAlign = 'center'; X.textBaseline = 'middle';
    const lines = []; let line = ''; for (const ch of text) { if (X.measureText(line + ch).width > 1060 && line && !'」』，。！？…、'.includes(ch)) { lines.push(line); line = ch; } else line += ch; } if (line) lines.push(line);
    const lh = 44, base = H - 40 - (lines.length - 1) * lh;
    if (who) { X.font = `700 20px ${VOICE}`; X.lineWidth = 5; X.strokeStyle = 'rgba(30,30,70,.85)'; X.strokeText(who, W / 2, base - 38); X.fillStyle = '#ffe07a'; X.fillText(who, W / 2, base - 38); X.font = `700 32px ${VOICE}`; }
    lines.forEach((l, i) => { X.lineWidth = 7; X.strokeStyle = 'rgba(30,30,70,.85)'; X.strokeText(l, W / 2, base + i * lh); X.fillStyle = '#ffffff'; X.fillText(l, W / 2, base + i * lh); });
  });
}
function caption(date, place, a) { if (a <= 0) return; P(() => { X.globalAlpha = a; X.font = `700 22px ${VOICE}`; const w = Math.max(X.measureText(place).width, 120) + 40; X.fillStyle = 'rgba(255,255,255,.88)'; X.beginPath(); X.roundRect(30, 28, w, 70, 35); X.fill(); X.lineWidth = 3; X.strokeStyle = '#3a78c8'; X.stroke(); X.textBaseline = 'top'; X.font = `600 16px "DejaVu Sans Mono", monospace`; X.fillStyle = '#3a78c8'; X.fillText(date, 50, 38); X.font = `700 22px ${VOICE}`; X.fillStyle = '#2a2246'; X.fillText(place, 50, 60); }); }
function chapter(n, title, t) { const a = eout(inv(.4, 1.4, t)) * (1 - inv(4.6, 5.6, t)); if (a <= 0) return; P(() => { X.globalAlpha = a; X.textAlign = 'center'; X.textBaseline = 'middle'; X.font = `700 26px ${VOICE}`; X.lineWidth = 6; X.strokeStyle = 'rgba(30,60,120,.8)'; X.strokeText(n, W / 2, 140); X.fillStyle = '#ffe07a'; X.fillText(n, W / 2, 140); X.font = `900 72px ${DISP}`; X.lineWidth = 10; X.strokeText(title, W / 2, 210); X.fillStyle = '#ffffff'; X.fillText(title, W / 2, 210); }); }
function post(f) {
  P(() => { X.globalCompositeOperation = 'soft-light'; X.fillStyle = vgrad(0, H, ['rgba(255,240,200,.35)', 'rgba(255,200,170,.25)']); X.fillRect(0, 0, W, H); });
  const g = X.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(20,30,80,.22)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
}
