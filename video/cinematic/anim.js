/* Allan下南洋 · 電影感動漫版（約 5 分鐘）
 * 風格：逆光剪影、邊緣光、夕陽水面倒影、景深模糊、光暈、膠片顆粒、電影黑邊。
 * renderFrame(T) 為決定性函式。
 */
const W = 1280, H = 720, FPS = 24, BAR = 54;
const cv = document.getElementById('c'), X = cv.getContext('2d');

/* ───────── utils ───────── */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const eio = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const RND = (() => { const r = rng(11); return Array.from({ length: 8000 }, r); })();
const rnd = i => RND[((Math.floor(i) % 8000) + 8000) % 8000];
const P = fn => { X.save(); fn(); X.restore(); };
const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); };
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
function vgrad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / (stops.length - 1), s)); return g; }
const VOICE = '"LXGW WenKai TC", "WenQuanYi Zen Hei", serif', DISP = '"Noto Serif TC", "WenQuanYi Zen Hei", serif';

const CACHE = {};
function cached(key, w, h, draw) { if (!CACHE[key]) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); CACHE[key] = c; } return CACHE[key]; }
const BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; const BX = BUF.getContext('2d');
const SMALL = document.createElement('canvas'); SMALL.width = 320; SMALL.height = 180; const SX = SMALL.getContext('2d');
const GRAIN = [0, 1, 2, 3].map(k => cached('grain' + k, 640, 360, (c, w, h) => { const d = c.createImageData(w, h); const r = rng(k * 99 + 5); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); }));

/* ───────── atmosphere ───────── */
function skyFill(stops, y0 = 0, y1 = H) { X.fillStyle = vgrad(X, y0, y1, stops); X.fillRect(0, y0, W, y1 - y0); }
function glow(x, y, r, col, a = 1) { P(() => { X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.25, rgba(col, a * .35)); g.addColorStop(1, rgba(col, 0)); X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); }); }
function sunDisc(x, y, r, core = '#fff4d6', halo = '#ffb35a', a = 1) { glow(x, y, r * 14, halo, .45 * a); glow(x, y, r * 5, '#ffd9a0', .55 * a); P(() => { X.globalAlpha = a; X.fillStyle = core; ell(X, x, y, r, r); X.fill(); }); glow(x, y, r * 1.8, '#ffffff', .6 * a); }
function rays(x, y, col, a, t, n = 9, spread = 1.2, dir = Math.PI / 2, len = 1100) {
  P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const ang = dir - spread / 2 + spread * (i + .5) / n + Math.sin(t * .2 + i) * .02, w = .02 + rnd(i * 7) * .05; const g = X.createRadialGradient(x, y, 0, x, y, len); g.addColorStop(0, rgba(col, a * (.5 + rnd(i) * .5))); g.addColorStop(1, rgba(col, 0)); X.fillStyle = g; X.beginPath(); X.moveTo(x, y); X.arc(x, y, len, ang - w, ang + w); X.closePath(); X.fill(); } });
}
/* painterly cloud bank, lit from below by the sun */
function cloudBank(key, seed, w, h, lit, shade, n = 7) {
  return cached(key, w, h, (c) => {
    const r = rng(seed); c.filter = 'blur(1.2px)';
    for (let k = 0; k < n; k++) {
      const cx = r() * w, cy = h * (.3 + r() * .45), cw = 120 + r() * 260, ch = 30 + r() * 50;
      for (let i = 0; i < 26; i++) {
        const px = cx + (r() - .5) * cw, py = cy + (r() - .4) * ch * (1 - Math.abs(r() - .5)), pr = 14 + r() * 34 * (1 - Math.abs(px - cx) / cw);
        const g = c.createLinearGradient(0, py - pr, 0, py + pr); g.addColorStop(0, shade); g.addColorStop(.55, mix(shade, lit, .5)); g.addColorStop(1, lit);
        c.fillStyle = g; ell(c, px, py, pr * 1.5, pr); c.fill();
      }
    }
  });
}
function drift(img, y, speed, t, a = 1) { const x = -((t * speed) % img.width); P(() => { X.globalAlpha = a; X.drawImage(img, x, y); X.drawImage(img, x + img.width, y); }); }
function ridge(y, amp, freq, seed, col, blur = 0, hz = H) { P(() => { if (blur) X.filter = `blur(${blur}px)`; X.fillStyle = col; X.beginPath(); X.moveTo(0, hz); for (let x = 0; x <= W; x += 8) X.lineTo(x, y - amp * (Math.sin(x * freq + seed) * .5 + Math.sin(x * freq * 2.3 + seed * 2) * .3 + rnd(x / 8 + seed * 50) * .15)); X.lineTo(W, hz); X.fill(); }); }
function treeline(y, col, seed, scale = 1, blur = 0) { P(() => { if (blur) X.filter = `blur(${blur}px)`; X.fillStyle = col; X.beginPath(); X.moveTo(0, y + 30); for (let x = -20; x <= W + 20; x += 14 * scale) { const hh = (10 + rnd(x + seed) * 26) * scale; X.lineTo(x, y - hh); X.lineTo(x + 7 * scale, y - hh * .7); } X.lineTo(W, y + 30); X.fill(); }); }
function palmS(x, base, h, lean, col, sway = 0) { P(() => { X.strokeStyle = col; X.fillStyle = col; X.lineCap = 'round'; X.lineWidth = h * .03; X.beginPath(); X.moveTo(x, base); X.quadraticCurveTo(x + lean * .4, base - h * .55, x + lean, base - h); X.stroke(); const tx = x + lean, ty = base - h;
    for (let i = 0; i < 11; i++) { const a = -Math.PI * .5 + (i - 5) * .3 + Math.sin(sway * .8 + i) * .04, L = h * (.32 + rnd(i * 5 + x) * .1), droop = (Math.abs(i - 5) / 5) * .9 + .25;
      const ex = tx + Math.sin(a + Math.PI / 2) * L * (i < 5 ? -1 : 1) * .0 + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .6 + droop * L * .8;
      const cx = tx + Math.cos(a) * L * .55, cy = ty + Math.sin(a) * L * .7 - L * .1;
      X.lineWidth = h * .012; X.beginPath(); X.moveTo(tx, ty); X.quadraticCurveTo(cx, cy, ex, ey); X.stroke();
      X.lineWidth = h * .006; for (let k = 2; k < 14; k++) { const q = k / 14, px = (1 - q) * (1 - q) * tx + 2 * (1 - q) * q * cx + q * q * ex, py = (1 - q) * (1 - q) * ty + 2 * (1 - q) * q * cy + q * q * ey, ll = L * .16 * (1 - q * .6); X.beginPath(); X.moveTo(px, py); X.lineTo(px - ll * .35, py + ll); X.moveTo(px, py); X.lineTo(px + ll * .35, py + ll); X.stroke(); } }
    ell(X, tx, ty + 4, h * .03, h * .03); X.fill(); }); }
function birds(t, n, y0, col, speed, seed, size = 1) { P(() => { X.strokeStyle = col; X.lineCap = 'round'; for (let i = 0; i < n; i++) { const k = seed * 37 + i; const x = ((rnd(k) * W + t * speed * (.7 + rnd(k + 1) * .6)) % (W + 120)) - 60, y = y0 + rnd(k + 2) * 110 + Math.sin(t * .8 + i) * 8, f = Math.sin(t * 5 + i * 1.7) * 5 * size, w = (9 + rnd(k + 3) * 6) * size; X.lineWidth = 1.8 * size; X.beginPath(); X.moveTo(x - w, y - f); X.quadraticCurveTo(x - w * .4, y - 3 * size, x, y); X.quadraticCurveTo(x + w * .4, y - 3 * size, x + w, y - f); X.stroke(); } }); }
function motes(t, n, col, seed, area = [0, 0, W, H], size = 3, a = .9) { P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const k = seed * 13 + i; const x = area[0] + ((rnd(k) * area[2] + Math.sin(t * .4 + i) * 40 + t * 6) % area[2]), y = area[1] + ((rnd(k + 1) * area[3] - t * (4 + rnd(k + 2) * 10)) % area[3] + area[3]) % area[3], tw = .4 + .6 * Math.abs(Math.sin(t * (1 + rnd(k + 3)) + i)); const r = size * (.6 + rnd(k + 4)); const g = X.createRadialGradient(x, y, 0, x, y, r * 5); g.addColorStop(0, rgba(col, a * tw)); g.addColorStop(.2, rgba(col, a * tw * .5)); g.addColorStop(1, rgba(col, 0)); X.fillStyle = g; X.fillRect(x - r * 5, y - r * 5, r * 10, r * 10); } }); }
function bokeh(t, n, cols, seed, yr = [60, 500], rmin = 8, rmax = 30, a = .5) { P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const k = seed * 19 + i; const x = rnd(k) * W, y = yr[0] + rnd(k + 1) * (yr[1] - yr[0]), r = rmin + rnd(k + 2) * (rmax - rmin), c = cols[i % cols.length], f = .6 + .4 * Math.sin(t * (.5 + rnd(k + 3)) + i); const g = X.createRadialGradient(x, y, r * .2, x, y, r); g.addColorStop(0, rgba(c, a * f * .7)); g.addColorStop(.85, rgba(c, a * f * .45)); g.addColorStop(1, rgba(c, 0)); X.fillStyle = g; ell(X, x, y, r, r); X.fill(); } }); }
function rainfall(t, n, a, slant = -6, len = 26) { P(() => { X.strokeStyle = `rgba(210,225,240,${a})`; X.lineWidth = 1.4; for (let i = 0; i < n; i++) { const x = ((rnd(i) * (W + 100) + t * slant * 20) % (W + 100) + W + 100) % (W + 100) - 50, y = ((rnd(i + 3000) * H + t * 1300) % (H + 60)) - 30; X.beginPath(); X.moveTo(x, y); X.lineTo(x + slant, y + len); X.stroke(); } }); }

/* water: mirrored copy of what is above y0 (taken from BUF) with ripple distortion */
function water(y0, y1, t, o = {}) {
  BX.clearRect(0, 0, W, H); BX.drawImage(cv, 0, 0);
  const amp = o.amp ?? 5;
  for (let y = y0; y < y1; y += 2) {
    const d = y - y0, sy = y0 - d * (o.squash ?? .9) - 1; if (sy < 0) break;
    const off = Math.sin(t * 1.3 + y * .18) * amp * (.3 + d / (y1 - y0)) + Math.sin(t * 2.1 + y * .05) * amp * .4;
    X.drawImage(BUF, 0, sy, W, 2, off, y, W, 2);
  }
  X.fillStyle = vgrad(X, y0, y1, [[0, rgba(o.tint || '#1a1830', .18)], [1, rgba(o.deep || '#0b0d18', .78)]]); X.fillRect(0, y0, W, y1 - y0);
  // horizontal ripple lines
  P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const yy = y0 + Math.pow(rnd(i + 70), 1.6) * (y1 - y0), w = 30 + rnd(i) * 160, x = ((rnd(i + 9) * W + t * 8) % W); X.fillStyle = `rgba(255,220,180,${.04 + rnd(i + 3) * .06})`; X.fillRect(x, yy, w, 1.2); } });
  if (o.sunX != null) { // glitter column
    P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 260; i++) { const k = i * 3; const dd = Math.pow(rnd(k), 1.3), yy = y0 + dd * (y1 - y0), spread = 18 + dd * (o.spread || 230), xx = o.sunX + (rnd(k + 1) - .5) * 2 * spread * (.4 + rnd(k + 2) * .6); const tw = Math.max(0, Math.sin(t * (2 + rnd(k + 2) * 3) + i)); X.fillStyle = rgba(o.glint || '#ffd9a0', .55 * tw * (1 - dd * .5)); X.fillRect(xx, yy, 6 + rnd(k + 4) * 22 * (1 - dd * .3), 1.6 + dd * 1.2); } });
    glow(o.sunX, y0 + 6, 260, o.glint || '#ffb35a', .25);
  }
}
function pebbles(key, y0, light = '#ffb875', base = '#2b2433') {
  const img = cached(key, W, H - y0, (c, w, h) => { const r = rng(42); for (let i = 0; i < 1300; i++) { const yy = Math.pow(r(), .8) * h, sc = .35 + yy / h * 1.4; const xx = W / 2 + (r() - .5) * (260 + yy * 2.6); const rx = (6 + r() * 12) * sc, ry = rx * (.45 + r() * .2); c.fillStyle = mix(base, '#4a3a44', r() * .6); ell(c, xx, yy, rx, ry); c.fill(); const g = c.createLinearGradient(0, yy - ry, 0, yy + ry * .3); g.addColorStop(0, rgba(light, .55 * (1 - yy / h * .5))); g.addColorStop(1, rgba(light, 0)); c.fillStyle = g; ell(c, xx, yy - ry * .25, rx * .8, ry * .6); c.fill(); } });
  X.drawImage(img, 0, y0);
}
function reeds(t, side, base, h, col, blur, n = 14, seed = 1, cattail = true) {
  P(() => { if (blur) X.filter = `blur(${blur}px)`; X.fillStyle = col; X.strokeStyle = col;
    for (let i = 0; i < n; i++) { const k = seed * 23 + i; const bx = side < 0 ? rnd(k) * 220 - 30 : W - rnd(k) * 220 + 30, hh = h * (.5 + rnd(k + 1) * .6), sw = Math.sin(t * 1.2 + i * .7) * 14 * (hh / h) + side * 18 * rnd(k + 2);
      X.beginPath(); X.moveTo(bx - 4, base); X.quadraticCurveTo(bx + sw * .4, base - hh * .5, bx + sw, base - hh); X.quadraticCurveTo(bx + sw * .4 + 3, base - hh * .5, bx + 4, base); X.fill();
      if (cattail && i % 3 === 0) { ell(X, bx + sw * .98, base - hh * .92, 4.5, 16, sw * .004); X.fill(); X.lineWidth = 1.5; X.beginPath(); X.moveTo(bx + sw, base - hh * 1.0); X.lineTo(bx + sw * 1.02, base - hh * 1.08); X.stroke(); } } });
}
function windStreaks(t, col, a, seed = 3) { P(() => { X.globalCompositeOperation = 'lighter'; X.lineCap = 'round'; for (let i = 0; i < 4; i++) { const k = seed * 5 + i, ph = ((t * .25 + rnd(k)) % 1); const y = 300 + rnd(k + 1) * 330, x0 = -300 + ph * 1900; const g = X.createLinearGradient(x0 - 300, 0, x0 + 300, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); X.strokeStyle = g; X.lineWidth = 1.6; X.beginPath(); X.moveTo(x0 - 300, y + 30); X.bezierCurveTo(x0 - 100, y - 30, x0 + 100, y + 40, x0 + 300, y - 10); X.stroke(); } }); }
function butterfly(x, y, s, t, col = '#ffe680') { glow(x, y, 40 * s, col, .5); P(() => { X.translate(x, y); X.scale(s, s); const f = Math.abs(Math.sin(t * 12)) * .8 + .2; X.fillStyle = rgba(col, .95); [-1, 1].forEach(d => { ell(X, d * 9 * f, -3, 9 * f, 7, d * .5); X.fill(); ell(X, d * 7 * f, 6, 6 * f, 5, -d * .4); X.fill(); }); }); }

/* ───────── people (rim-lit silhouettes) ─────────
 * light: -1 = light from the left, 1 = from the right, 0 = from behind (centre rim)
 */
function figure(x, y, h, o = {}) {
  const t = o.t || 0, u = h / 8, walk = o.walk ? Math.sin(t * (o.pace || 5)) : 0, wind = Math.sin(t * 2.3) * (o.wind ?? 1);
  const C = o.colors || {};
  const dk = (c, d) => c ? mix(c, '#07060a', o.dark ?? .55) : d;
  const col = { skin: dk(C.skin, '#1a1216'), hair: '#060509', shirt: dk(C.shirt, '#1c1a22'), pants: dk(C.pants, '#121018'), dress: dk(C.dress, '#1c1a22'), shoe: '#08070a' };
  const parts = (pick) => {
    // legs
    if (o.sit) { X.fillStyle = pick('pants'); X.beginPath(); X.roundRect(-.7 * u, -3.4 * u, 1.4 * u, .9 * u, .3 * u); X.fill(); }
    else if (o.dress) { X.fillStyle = pick('dress'); X.beginPath(); X.moveTo(-.85 * u, -6.2 * u); X.lineTo(.85 * u, -6.2 * u); X.lineTo((1.25 + wind * .06) * u, -1.2 * u); X.lineTo(-1.25 * u, -1.2 * u); X.closePath(); X.fill(); X.fillStyle = pick('skin'); [-.35, .35].forEach((lx, i) => { const lift = o.walk ? Math.max(0, (i ? -walk : walk)) * .35 * u : 0; X.fillRect(lx * u - .14 * u, -1.3 * u, .28 * u, 1.3 * u - lift); }); }
    else { [-1, 1].forEach((sd, i) => { const lift = o.walk ? Math.max(0, sd * walk) * .5 * u : 0, sw = o.walk ? sd * walk * .12 * u : 0; X.fillStyle = pick('pants'); X.beginPath(); X.moveTo(sd * .02 * u, -3.9 * u); X.lineTo(sd * .74 * u, -3.9 * u); X.quadraticCurveTo(sd * .7 * u + sw * .5, -2 * u, sd * .52 * u + sw, -.25 * u - lift); X.lineTo(sd * .12 * u + sw, -.25 * u - lift); X.quadraticCurveTo(sd * .08 * u + sw * .5, -2 * u, sd * .02 * u, -3.2 * u); X.closePath(); X.fill(); X.fillStyle = pick('shoe'); X.beginPath(); X.ellipse(sd * .32 * u + sw, -.15 * u - lift, .26 * u, .16 * u, 0, 0, 7); X.fill(); }); }
    // torso
    if (!o.dress) {
      X.fillStyle = pick('shirt'); X.beginPath(); X.moveTo(-.3 * u, -6.85 * u); X.quadraticCurveTo(-.95 * u, -6.75 * u, -1.12 * u, -6.15 * u); X.quadraticCurveTo(-1.05 * u, -5 * u, -.98 * u, -3.55 * u);
      if (o.flap !== false) { X.lineTo(.6 * u, -3.45 * u); X.lineTo((1.35 + wind * .25) * u, -3.1 * u + wind * .1 * u); } else X.lineTo(1.0 * u, -3.62 * u);
      X.lineTo(1.0 * u, -3.65 * u); X.quadraticCurveTo(1.05 * u, -5 * u, 1.12 * u, -6.15 * u); X.quadraticCurveTo(.95 * u, -6.75 * u, .3 * u, -6.85 * u); X.closePath(); X.fill();
    }
    // arms
    const arm = (sd) => { const swing = o.walk ? -sd * walk * .25 : 0; let ax = sd * .92 * u, ay = -6.15 * u; X.save(); X.translate(ax, ay); const pose = (o.arms && o.arms[sd < 0 ? 0 : 1]) ?? (.08 * sd + swing); X.rotate(pose); X.fillStyle = pick(o.dress ? 'dress' : 'shirt'); X.beginPath(); X.roundRect(-.27 * u, -.15 * u, .54 * u, 1.45 * u, .26 * u); X.fill(); X.translate(0, 1.3 * u); X.rotate((o.elbow && o.elbow[sd < 0 ? 0 : 1]) || 0); X.fillStyle = pick('skin'); X.beginPath(); X.roundRect(-.19 * u, 0, .38 * u, 1.3 * u, .18 * u); X.fill(); ell(X, 0, 1.35 * u, .21 * u, .24 * u); X.fill(); X.restore(); };
    arm(-1); arm(1);
    // neck + head
    X.fillStyle = pick('skin'); X.fillRect(-.16 * u, -6.95 * u, .32 * u, .6 * u);
    X.save(); X.translate(0, -7.45 * u); if (o.look) X.rotate(o.look);
    ell(X, 0, 0, .48 * u, .56 * u); X.fill();
    X.fillStyle = pick('hair');
    if (o.hair === 'long' || o.hair === 'pigtails') { X.beginPath(); X.moveTo(-.55 * u, -.1 * u); X.bezierCurveTo(-.6 * u, -.8 * u, .6 * u, -.8 * u, .55 * u, -.1 * u); X.lineTo((.55 + wind * .05) * u, (o.hair === 'long' ? 1.4 : .3) * u); X.lineTo(-.55 * u, (o.hair === 'long' ? 1.4 : .3) * u); X.closePath(); X.fill(); if (o.hair === 'pigtails') [-1, 1].forEach(sd => { ell(X, sd * .7 * u, .25 * u + Math.sin(t * 6 + sd) * .05 * u, .18 * u, .38 * u, sd * .3 + wind * .1); X.fill(); }); }
    else if (o.hair === 'bun') { ell(X, 0, -.05 * u, .52 * u, .6 * u); X.fill(); ell(X, 0, .45 * u, .28 * u, .22 * u); X.fill(); }
    else { ell(X, 0, -.06 * u, .56 * u, .58 * u); X.fill(); X.beginPath(); for (let i = 0; i < 13; i++) { const a = -Math.PI * 1.08 + i * Math.PI * 1.16 / 12, r1 = .5 * u, r2 = (.66 + rnd(i * 7 + 3) * .2) * u; const sx = Math.cos(a) * r1, sy = Math.sin(a) * r1 - .08 * u; X.moveTo(sx - .1 * u, sy); X.lineTo(Math.cos(a) * r2 + wind * .06 * u, Math.sin(a) * r2 - .08 * u); X.lineTo(sx + .1 * u, sy); } X.fill(); X.beginPath(); X.moveTo(-.5 * u, .1 * u); X.lineTo(-.46 * u, .42 * u); X.lineTo(.46 * u, .42 * u); X.lineTo(.5 * u, .1 * u); X.fill(); }
    if (o.profile) { X.fillStyle = pick('skin'); X.beginPath(); X.moveTo(o.profile * .44 * u, -.05 * u); X.lineTo(o.profile * .6 * u, .12 * u); X.lineTo(o.profile * .44 * u, .22 * u); X.fill(); }
    X.restore();
    if (o.extra) o.extra(pick, u);
  };
  P(() => {
    X.translate(x, y); if (o.flip) X.scale(-1, 1);
    // ground shadow
    if (o.shadow !== false) { X.fillStyle = 'rgba(0,0,0,.35)'; ell(X, (o.shadowDx || 0) * u, 0, 1.2 * u, .18 * u); X.fill(); }
    const L = o.light ?? 0, rim = o.rim || '#ffcf8a', rw = (o.rimW ?? Math.max(1.5, h / 140)) * 1.25;
    if (o.rimA !== 0) { P(() => { X.globalAlpha = o.rimA ?? 1; if (L === 0) { [[-rw, 0], [rw, 0], [0, -rw]].forEach(([dx, dy]) => P(() => { X.translate(dx, dy); parts(() => rim); })); } else P(() => { X.translate(L * rw, -rw * .4); parts(() => rim); }); }); }
    parts(k => col[k] ? (o.tone ? mix(col[k], o.tone, o.toneK ?? .35) : col[k]) : col.shirt);
  });
}
/* side-view seated person (desk / phone / bed) */
function sideSit(x, y, h, o = {}) {
  const t = o.t || 0, u = h / 8, rim = o.rim || '#8fd3ff', dark = o.dark || '#141420';
  const parts = (c) => { X.fillStyle = c;
    X.beginPath(); X.roundRect(-.2 * u, -3.4 * u, 2.2 * u, .7 * u, .3 * u); X.fill(); X.beginPath(); X.roundRect(1.6 * u, -3.3 * u, .6 * u, 3.3 * u, .25 * u); X.fill(); X.beginPath(); X.ellipse(2.1 * u, -.1 * u, .45 * u, .18 * u, 0, 0, 7); X.fill();
    X.beginPath(); X.moveTo(-.7 * u, -3.4 * u); X.quadraticCurveTo(-.9 * u, -5.2 * u, -.3 * u, -6.4 * u); X.lineTo(.6 * u, -6.3 * u); X.quadraticCurveTo(.9 * u, -5 * u, .7 * u, -3.4 * u); X.closePath(); X.fill();
    const tp = o.arm === 'type' ? Math.sin(t * 18) * .04 : 0;
    X.save(); X.translate(.2 * u, -6 * u); X.rotate(o.arm === 'phone' ? -2.2 : o.arm === 'type' ? -.9 + tp : -.2); X.beginPath(); X.roundRect(-.2 * u, 0, .4 * u, 1.5 * u, .2 * u); X.fill(); X.translate(0, 1.45 * u); X.rotate(o.arm === 'phone' ? 2.6 : o.arm === 'type' ? .9 : .6); X.beginPath(); X.roundRect(-.16 * u, 0, .32 * u, 1.4 * u, .16 * u); X.fill(); X.restore();
    X.fillRect(-.05 * u, -6.9 * u, .32 * u, .6 * u);
    X.save(); X.translate(.15 * u, -7.4 * u); X.rotate(o.bow || 0); ell(X, 0, 0, .5 * u, .56 * u); X.fill(); X.beginPath(); X.moveTo(.45 * u, -.1 * u); X.lineTo(.62 * u, .1 * u); X.lineTo(.45 * u, .2 * u); X.fill();
    X.beginPath(); for (let i = 0; i < 8; i++) { const a = -Math.PI * 1.15 + i * .2; X.moveTo(Math.cos(a) * .45 * u, Math.sin(a) * .45 * u - .1 * u); X.lineTo(Math.cos(a) * .75 * u, Math.sin(a) * .72 * u - .12 * u); X.lineTo(Math.cos(a + .15) * .45 * u, Math.sin(a + .15) * .45 * u - .1 * u); } X.fill(); ell(X, -.08 * u, -.12 * u, .5 * u, .5 * u); X.fill(); X.restore(); };
  P(() => { X.translate(x, y); if (o.flip) X.scale(-1, 1); P(() => { X.translate(1.8, -1); parts(rim); }); parts(dark); });
}
/* bicycle + rider, side view, rim-lit */
function rider(x, y, s, t, o = {}) {
  const spin = t * (o.speed ?? 5), rim = o.rim || '#ffcf8a', dark = o.dark || '#121016';
  const parts = (c) => { X.strokeStyle = c; X.fillStyle = c; X.lineCap = 'round'; X.lineJoin = 'round';
    [-70, 70].forEach(wx => { X.lineWidth = 7; ell(X, wx, -46, 44, 44); X.stroke(); X.lineWidth = 1.2; X.save(); X.translate(wx, -46); X.rotate(spin); for (let i = 0; i < 12; i++) { X.rotate(Math.PI / 6); X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 42); X.stroke(); } X.restore(); });
    X.lineWidth = 6; X.beginPath(); X.moveTo(-70, -46); X.lineTo(-10, -48); X.lineTo(-30, -112); X.lineTo(-70, -46); X.moveTo(-10, -48); X.lineTo(44, -110); X.lineTo(-30, -112); X.moveTo(44, -110); X.lineTo(70, -46); X.moveTo(44, -110); X.lineTo(40, -130); X.lineTo(58, -134); X.stroke();
    X.beginPath(); X.roundRect(-50, -124, 40, 9, 4); X.fill();
    if (!o.empty) {
      const ped = spin * .55;
      [0, Math.PI].forEach(ph => { const px = -10 + Math.cos(ped + ph) * 17, py = -48 + Math.sin(ped + ph) * 17; X.lineWidth = 15; X.beginPath(); X.moveTo(-30, -126); X.lineTo((px - 30) / 2 + 16, (py - 126) / 2 - 6); X.lineTo(px, py); X.stroke(); });
      X.beginPath(); X.moveTo(-44, -126); X.quadraticCurveTo(-30, -200, 4, -218); X.lineTo(22, -206); X.quadraticCurveTo(-4, -170, -12, -126); X.closePath(); X.fill();
      X.lineWidth = 12; X.beginPath(); X.moveTo(10, -206); X.lineTo(52, -140); X.stroke();
      ell(X, 18, -246, 18, 20); X.fill(); X.beginPath(); for (let i = 0; i < 7; i++) { const a = -Math.PI * 1.2 + i * .25; X.moveTo(18 + Math.cos(a) * 16, -248 + Math.sin(a) * 16); X.lineTo(18 + Math.cos(a) * 27 - 4, -248 + Math.sin(a) * 25); X.lineTo(18 + Math.cos(a + .15) * 16, -248 + Math.sin(a + .15) * 16); } X.fill();
    } };
  P(() => { X.translate(x, y); X.scale(s * (o.dir || 1), s); X.fillStyle = 'rgba(0,0,0,.3)'; ell(X, 0, 2, 110, 8); X.fill(); P(() => { X.translate(o.rimDx ?? -2, -1.5); parts(rim); }); parts(dark); });
}
function figurineSil(x, y, s, rim = '#ffd59a', dark = '#1a1420') { const parts = c => { X.fillStyle = c; X.beginPath(); X.roundRect(-14, -34, 28, 34, 8); X.fill(); ell(X, 0, -50, 22, 21); X.fill(); X.beginPath(); X.moveTo(-24, -52); X.lineTo(-28, -26); X.lineTo(28, -26); X.lineTo(24, -52); X.fill(); X.fillRect(-20, -78, 40, 8); X.lineWidth = 2.5; X.strokeStyle = c; ell(X, -8, -50, 7, 7); X.stroke(); ell(X, 8, -50, 7, 7); X.stroke(); }; P(() => { X.translate(x, y); X.scale(s, s); P(() => { X.translate(1.5, -1); parts(rim); }); parts(dark); }); }

/* ───────── titles ───────── */
function subtitle(text, a, who) {
  if (a <= 0 || !text) return;
  P(() => {
    X.globalAlpha = a; X.font = `400 31px ${VOICE}`; X.textAlign = 'center'; X.textBaseline = 'middle';
    const lines = []; let line = ''; for (const ch of text) { if (X.measureText(line + ch).width > 1040 && line && !'」』，。！？…、'.includes(ch)) { lines.push(line); line = ch; } else line += ch; } if (line) lines.push(line);
    const lh = 42, base = H - BAR - 26 - (lines.length - 1) * lh;
    X.shadowColor = 'rgba(0,0,0,.85)'; X.shadowBlur = 12;
    if (who) { X.font = `400 19px ${VOICE}`; X.fillStyle = 'rgba(255,214,160,.9)'; X.fillText('— ' + who, W / 2, base - 36); X.font = `400 31px ${VOICE}`; }
    X.fillStyle = '#fbf6ea'; lines.forEach((l, i) => X.fillText(l, W / 2, base + i * lh));
  });
}
function caption(date, place, a) { if (a <= 0) return; P(() => { X.globalAlpha = a * .92; X.shadowColor = 'rgba(0,0,0,.8)'; X.shadowBlur = 10; X.textBaseline = 'top'; X.font = `400 17px "DejaVu Sans Mono", monospace`; X.fillStyle = '#ffd9a0'; X.fillText(date, 44, BAR + 24); X.font = `400 22px ${VOICE}`; X.fillStyle = '#fbf6ea'; X.fillText(place, 44, BAR + 48); }); }
function chapterTitle(n, title, t) { const a = eout(inv(.6, 2.2, t)) * (1 - inv(5.5, 7, t)); if (a <= 0) return; P(() => { X.globalAlpha = a; X.textAlign = 'center'; X.shadowColor = 'rgba(0,0,0,.7)'; X.shadowBlur = 24; X.font = `400 24px ${VOICE}`; X.fillStyle = '#ffd9a0'; X.fillText(n, W / 2, H / 2 - 64); X.font = `900 68px ${DISP}`; X.fillStyle = '#fbf6ea'; X.fillText(title, W / 2, H / 2 + 10); X.globalAlpha = a * .7; X.fillStyle = '#ffd9a0'; X.fillRect(W / 2 - 40 * a, H / 2 + 44, 80 * a, 1.5); }); }

/* ───────── post ───────── */
function post(f, o = {}) {
  // bloom
  SX.clearRect(0, 0, 320, 180); SX.filter = 'brightness(1.1) contrast(2.2) blur(5px)'; SX.drawImage(cv, 0, 0, 320, 180); SX.filter = 'none';
  P(() => { X.globalCompositeOperation = 'screen'; X.globalAlpha = o.bloom ?? .42; X.drawImage(SMALL, 0, 0, W, H); });
  // grade
  if (o.grade) P(() => { X.globalCompositeOperation = 'soft-light'; X.fillStyle = vgrad(X, 0, H, o.grade); X.fillRect(0, 0, W, H); });
  // vignette
  const g = X.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 820); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${o.vig ?? .55})`); X.fillStyle = g; X.fillRect(0, 0, W, H);
  // grain
  P(() => { X.globalCompositeOperation = 'overlay'; X.globalAlpha = .09; X.drawImage(GRAIN[f % 4], 0, 0, W, H); });
}

/* ───────── storyboard ───────── */
const SUNSET = ['#1d2347', '#4a3f6e', '#9a5d78', '#e88a5c', '#ffcf86'];
const SHOTS = [
 { d: 22, name: 'lake', grade: ['#3b2a6a', '#ff9a50'], draw(t) {
    const z = 1 + t * .003; X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-W / 2, -H / 2);
    skyFill(SUNSET, 0, 330);
    drift(cloudBank('lakeC1', 3, 1600, 260, '#ffb07a', '#4a3a6a', 8), 20, 6, t, .95);
    drift(cloudBank('lakeC2', 9, 1700, 200, '#ffd29a', '#6a4a7a', 6), 160, 10, t, .9);
    sunDisc(640, 318, 30);
    ridge(332, 26, .006, 2, '#3a3358', 2); treeline(334, '#221d36', 5, 1, 1);
    rays(640, 318, '#ffcf8a', .07, t, 11, 1.6, Math.PI / 2 + Math.PI, 900);
    water(336, 600, t, { sunX: 640, squash: .85 });
    // ducks
    [[300, 452, 1], [250, 520, 1.15]].forEach(([dx, dy, s], i) => { const x = dx + Math.sin(t * .3 + i) * 8; P(() => { X.strokeStyle = 'rgba(255,210,170,.35)'; X.lineWidth = 1.2; for (let r = 0; r < 3; r++) { const rr = ((t * 14 + r * 18) % 54) * s; X.globalAlpha = 1 - rr / 54 / s; ell(X, x, dy + 4, rr * 1.6, rr * .35); X.stroke(); } X.globalAlpha = 1; X.fillStyle = '#16121c'; ell(X, x, dy, 22 * s, 8 * s); X.fill(); ell(X, x + 14 * s, dy - 9 * s, 6 * s, 6 * s); X.fill(); X.beginPath(); X.moveTo(x + 19 * s, dy - 9 * s); X.lineTo(x + 26 * s, dy - 7 * s); X.lineTo(x + 19 * s, dy - 6 * s); X.fill(); }); });
    pebbles('lakeP', 540);
    X.fillStyle = vgrad(X, 530, 560, [rgba('#0b0d18', 0), rgba('#0b0d18', .6)]); X.fillRect(0, 530, W, 30);
    const k = eio(inv(0, 20, t)); figure(lerp(640, 652, k), lerp(690, 600, k), lerp(250, 190, k), { t, walk: true, pace: 3.2, rim: '#ffcf8a', light: 0, colors: { shirt: '#3a3640', pants: '#2a2a36' }, rimW: 2.4 });
    reeds(t, -1, 720, 380, '#0b0a10', 3, 16, 1); reeds(t, 1, 720, 420, '#0b0a10', 3, 18, 2);
    reeds(t, -1, 720, 240, '#14121a', 0, 8, 5, false);
    butterfly(200 + Math.sin(t * .7) * 40, 300 + Math.cos(t * .9) * 20, 1, t); butterfly(260 + Math.sin(t * .5 + 2) * 50, 370 + Math.cos(t * .6) * 30, .8, t + 1.3);
    birds(t, 5, 150, 'rgba(30,20,40,.8)', 18, 2);
    windStreaks(t, '#ffe2b0', .5);
    motes(t, 30, '#ffd27a', 4, [0, 330, W, 330], 2.2, .7);
    const a = eout(inv(2, 5, t)) * (1 - inv(15.5, 17.5, t));
    P(() => { X.globalAlpha = a; X.textAlign = 'center'; X.shadowColor = 'rgba(40,10,0,.7)'; X.shadowBlur = 30; X.font = `900 92px ${DISP}`; X.fillStyle = '#fff6e6'; X.fillText('Allan 下南洋', W / 2, 210); X.font = `400 26px ${VOICE}`; X.fillStyle = '#ffe2b8'; X.fillText('二〇一四 — 二〇一七 · 一段奇幻之旅', W / 2, 262); });
  }, subs: [[9.5, 15.2, '「這一切，有一天都會變成『曾經』。」', 'Allan，2014'], [16, 19.6, '「讓五年之後再回頭看這一切，會覺得一切都很踏實。」', 'Allan，部落格第一篇']] },

 { d: 20, name: 'taipei', grade: ['#10204a', '#3a6aa0'], bloom: .5, draw(t) {
    const stand = t > 9.4;
    X.fillStyle = '#070b16'; X.fillRect(0, 0, W, H);
    // window with city at night
    P(() => { X.beginPath(); X.rect(stand ? 160 : 520, 70, stand ? 960 : 700, 470); X.clip();
      skyFill(['#0a1430', '#1d2a55', '#3b3a6a', '#6a4a6a'], 70, 540);
      P(() => { X.filter = 'blur(3px)'; X.fillStyle = '#0e1426'; for (let i = 0; i < 26; i++) { const bx = rnd(i) * W, bh = 80 + rnd(i + 30) * 220; X.fillRect(bx, 540 - bh, 40 + rnd(i + 60) * 60, bh); } X.fillStyle = '#121a30'; X.beginPath(); const tx = 900; for (let i = 0; i < 8; i++) X.rect(tx - 30 + i * 2, 540 - 60 - i * 34, 60 - i * 4, 34); X.rect(tx - 4, 540 - 400, 8, 80); X.fill(); });
      bokeh(t, 70, ['#ffd27a', '#ff9a6a', '#8fd3ff', '#fff2c8', '#ff6a8a'], 7, [260, 540], 3, 12, .9);
      bokeh(t, 18, ['#ffd27a', '#8fd3ff'], 8, [150, 520], 18, 44, .25);
      glow(900, 150, 30, '#8fd3ff', .5);
    });
    X.strokeStyle = '#05070e'; X.lineWidth = 14; X.strokeRect(stand ? 160 : 520, 70, stand ? 960 : 700, 470);
    if (!stand) {
      // desk + monitor glow
      X.fillStyle = '#0b0e18'; X.fillRect(80, 470, 620, 26); X.fillRect(100, 496, 18, 170); X.fillRect(660, 496, 18, 170);
      X.fillStyle = '#0d1020'; X.fillRect(380, 300, 230, 150); X.fillStyle = '#9fdcff'; X.fillRect(388, 308, 214, 134);
      for (let l = 0; l < 9; l++) { X.fillStyle = ['rgba(20,60,90,.7)', 'rgba(20,90,70,.7)'][l % 2]; X.fillRect(400 + (l % 3) * 10, 318 + l * 13, 40 + rnd(l) * 120, 5); }
      glow(495, 375, 420, '#7cc8ff', .35);
      sideSit(300, 660, 300, { t, arm: 'type', rim: '#a8e2ff', dark: '#0c0f1c', flip: false });
      X.fillStyle = '#0d1020'; X.fillRect(480, 450, 40, 22);
    } else {
      figure(640, 690, 330, { t, rim: '#9fc8ff', light: 0, colors: { shirt: '#2a3044', pants: '#1a1e2c' }, rimW: 2, flap: false, wind: 0 });
    }
  }, cap: ['2014', '台北 · 二十年的資訊人生'], chapter: ['第一章', '提起勇氣'], subs: [[1.5, 5.4, '「資訊工程根本不是我的本科，但我卻靠這項專業混口飯吃過了20年。」', 'Allan'], [5.6, 9.2, '「年輕時沒懂，懂的時候卻沒有勇氣回頭。」', 'Allan'], [10, 13.6, '「就怕來個大轉彎，跌倒失去了所有。」', 'Allan'], [14, 17.6, '「仍有夢想，仍未放棄。」', 'Allan']] },

 { d: 20, name: 'depart', grade: ['#4a3a6a', '#ffb070'], draw(t) {
    if (t < 9.5) {
      skyFill(['#3a3f6e', '#a06a8a', '#f2a07a', '#ffd9a0'], 0, 470);
      sunDisc(980, 430, 24, '#fff4d6', '#ffb35a', .9);
      drift(cloudBank('depC', 21, 1600, 220, '#ffc89a', '#6a5080', 6), 90, 8, t, .8);
      // plane taking off
      const k = inv(1, 9, t); P(() => { const px = lerp(200, 1100, k), py = lerp(460, 200, k * k); X.translate(px, py); X.rotate(-.18 - k * .1); X.fillStyle = '#1a1622'; X.beginPath(); X.ellipse(0, 0, 90, 12, 0, 0, 7); X.fill(); X.beginPath(); X.moveTo(-10, 0); X.lineTo(-40, 40); X.lineTo(-20, 40); X.lineTo(20, 2); X.fill(); X.beginPath(); X.moveTo(-70, -4); X.lineTo(-96, -38); X.lineTo(-82, -38); X.lineTo(-56, -6); X.fill(); }); glow(lerp(200, 1100, k) - 60, lerp(460, 200, k * k) + 10, 50, '#ff8a6a', .4);
      X.fillStyle = '#2a2236'; X.fillRect(0, 470, W, 30); X.fillStyle = '#ffd9a0'; for (let i = 0; i < 30; i++) { glow(i * 46 + 10, 486, 8, '#ffd27a', .8); }
      // glass wall mullions + floor reflection
      X.fillStyle = '#0c0a12'; for (let i = 0; i < 7; i++) X.fillRect(i * 214 - 6, 0, 14, 560); X.fillRect(0, 0, W, 40);
      X.fillStyle = vgrad(X, 500, H, ['#1a1420', '#0a080e']); X.fillRect(0, 500, W, 220);
      P(() => { X.globalAlpha = .25; X.scale(1, -1); X.translate(0, -1000); X.drawImage(cv, 0, 0, W, 500, 0, 0, W, 500); });
      figure(560, 680, 300, { t, rim: '#ffcf8a', light: 0, colors: { shirt: '#3a3640', pants: '#24242e' }, rimW: 2.2, arms: [.08, -.35], elbow: [0, .2], extra: (pick, u) => { X.fillStyle = pick('pants'); X.beginPath(); X.roundRect(1.3 * u, -2.6 * u, 1.3 * u, 2.4 * u, .2 * u); X.fill(); X.fillRect(1.85 * u, -3.1 * u, .2 * u, .6 * u); } });
      figure(450, 680, 165, { t: t + 1, rim: '#ffcf8a', light: 0, hair: 'pigtails', dress: true, colors: { dress: '#5a3a4a', skin: '#2a1f22' }, rimW: 2, arms: [.08, t > 3 ? -2.6 + Math.sin(t * 6) * .1 : .1], wind: .4 });
    } else {
      const k = inv(9.5, 18, t);
      skyFill(['#2a4a8a', '#6a8ac0', '#f2c49a', '#ffe2b8'], 0, H);
      sunDisc(880, 300, 26, '#fffbe8', '#ffd08a', 1);
      for (let L = 0; L < 3; L++) drift(cloudBank('sea' + L, 40 + L, 1800, 320, ['#ffe2c0', '#ffd0a0', '#f8b88a'][L], ['#8a9ac8', '#a0a8d0', '#b8b0d0'][L], 9), 330 + L * 80, 14 + L * 16, t, 1);
      // window frame + wing
      P(() => { X.fillStyle = '#0d0b12'; X.beginPath(); X.rect(0, 0, W, H); X.roundRect(250, 70, 780, 560, 180); X.fill('evenodd'); X.fillStyle = vgrad(X, 500, 640, ['#3a3448', '#141018']); X.beginPath(); X.moveTo(240, 640); X.lineTo(720, 540); X.lineTo(820, 528); X.lineTo(830, 538); X.lineTo(760, 560); X.lineTo(260, 690); X.fill(); X.strokeStyle = 'rgba(255,220,180,.5)'; X.lineWidth = 1.5; X.beginPath(); X.moveTo(240, 640); X.lineTo(720, 540); X.lineTo(820, 528); X.stroke(); });
      glow(640, 360, 600, '#ffd9a0', .08);
    }
  }, cap: ['2014.10.01', '華航 11:40 · 單程'], subs: [[1.2, 4.6, '「爸爸，拍天上的雲給我看！」', '亮晶晶'], [4.9, 9.2, '「只盼我最愛的家人平安，等著我結束這段旅程歸來相聚。」', 'Allan'], [10, 17.6, '「所以我很努力地，在飛機上拍各種形狀的雲。」', 'Allan']] },

 { d: 18, name: 'dorm', grade: ['#102040', '#40508a'], bloom: .5, draw(t) {
    X.fillStyle = '#0a0f1e'; X.fillRect(0, 0, W, H);
    P(() => { X.beginPath(); X.rect(700, 90, 420, 330); X.clip(); skyFill(['#0c1838', '#1d2c5a', '#3a3a6a'], 90, 420); for (let i = 0; i < 60; i++) { X.fillStyle = `rgba(255,250,230,${.3 + .7 * Math.abs(Math.sin(t * (.4 + rnd(i)) + i))})`; X.fillRect(700 + rnd(i + 5) * 420, 90 + rnd(i + 50) * 220, 1.6, 1.6); }
      glow(1040, 160, 120, '#bcd4ff', .35); X.fillStyle = '#f4f0dc'; X.beginPath(); X.arc(1040, 160, 26, 0, 7); X.fill(); X.fillStyle = '#1d2c5a'; X.beginPath(); X.arc(1052, 152, 24, 0, 7); X.fill();
      P(() => { X.fillStyle = '#070a16'; X.translate(880, 420); X.fillRect(-100, -70, 200, 70); X.beginPath(); X.arc(0, -70, 60, Math.PI, 0); X.fill(); [-140, 140].forEach(mx => { X.fillRect(mx - 9, -200, 18, 200); X.beginPath(); X.moveTo(mx - 13, -200); X.lineTo(mx, -236); X.lineTo(mx + 13, -200); X.fill(); }); }); treeline(420, '#050812', 2, 1.2); });
    X.strokeStyle = '#050710'; X.lineWidth = 16; X.strokeRect(700, 90, 420, 330); X.lineWidth = 8; X.beginPath(); X.moveTo(910, 90); X.lineTo(910, 420); X.stroke();
    // moonlight beam
    P(() => { X.globalCompositeOperation = 'lighter'; X.fillStyle = vgrad(X, 420, 720, [rgba('#7a9ad8', .22), rgba('#7a9ad8', 0)]); X.beginPath(); X.moveTo(700, 420); X.lineTo(1120, 420); X.lineTo(900, 720); X.lineTo(300, 720); X.fill(); });
    motes(t, 40, '#cfe0ff', 6, [400, 420, 700, 300], 1.4, .6);
    // desk + lamp
    X.fillStyle = '#0c0f1c'; X.fillRect(170, 470, 440, 22); X.fillRect(190, 492, 16, 180); X.fillRect(570, 492, 16, 180);
    glow(470, 400, 260, '#ffb35a', .55); X.fillStyle = '#1a1420'; X.beginPath(); X.moveTo(440, 380); X.lineTo(500, 380); X.lineTo(490, 410); X.lineTo(450, 410); X.fill(); X.fillRect(466, 410, 6, 60); glow(470, 410, 50, '#ffe2a8', .9);
    // photo frame
    X.fillStyle = '#1a1420'; X.fillRect(250, 400, 90, 70); X.fillStyle = '#5a4a3a'; X.fillRect(258, 408, 74, 54); glow(295, 435, 50, '#ffcf8a', .2);
    const k = eout(inv(1.5, 5, t)); figurineSil(lerp(260, 400, k), lerp(560, 470, k) - Math.sin(k * Math.PI) * 60, 1.1);
    if (t > 5) motes(t, 12, '#ffe2a8', 9, [330, 380, 160, 100], 1.6, .8);
    figure(lerp(140, 120, k), 700, 300, { t, rim: '#9fb8ff', light: 1, colors: { shirt: '#2a3354', pants: '#151a2a' }, flap: false, wind: .2, arms: [.08, -.9 + k * .7], elbow: [0, -.4], profile: 1 });
  }, cap: ['2014.10.01', '巴里文打 · 台幹宿舍'], subs: [[1, 5.2, '「到宿舍第一件事，阿拉蕾擺好。」', 'Allan'], [5.6, 11.4, '「未來的日子就靠這張笑臉，調整起起伏伏的心情了。」', 'Allan'], [11.8, 17.6, '「因為看到阿拉蕾，我就會想起家裡3個小鬼的笑容。」', 'Allan']] },

 { d: 18, name: 'rain', grade: ['#1a2a3a', '#4a6a7a'], draw(t) {
    // outside world, blurred
    P(() => { X.filter = 'blur(6px)'; skyFill(['#2a3440', '#4a5560', '#6a6a6a'], 0, H); treeline(470, '#1a2228', 3, 1.4); for (let i = 0; i < 6; i++) palmS(100 + i * 230, 480, 260 + (i % 2) * 70, (i % 2 ? 14 : -10), '#141c22', t); X.fillStyle = '#1a2026'; X.fillRect(0, 470, W, 250); });
    bokeh(t, 22, ['#ffcf8a', '#fff2c8', '#ff9a6a'], 3, [380, 520], 10, 26, .7);
    if ((t % 6.3) > 6.1) { X.fillStyle = 'rgba(220,230,255,.4)'; X.fillRect(0, 0, W, H); }
    rainfall(t, 160, .25);
    // droplets on glass
    for (let i = 0; i < 140; i++) { const k = i * 5, slide = rnd(k + 3) > .8 ? (t * 30 * rnd(k + 4)) % 400 : 0; const x = rnd(k) * W, y = (rnd(k + 1) * H + slide) % H, r = 2 + rnd(k + 2) * 6; P(() => { const g = X.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.6, 'rgba(160,180,190,.15)'); g.addColorStop(1, 'rgba(20,30,40,.35)'); X.fillStyle = g; ell(X, x, y, r, r * 1.15); X.fill(); }); }
    // window frame inside
    X.fillStyle = '#080a0e'; X.fillRect(0, 0, 90, H); X.fillRect(W - 90, 0, 90, H); X.fillRect(0, 610, W, 110); X.fillRect(630, 0, 18, 620);
    figure(940, 720, 360, { t, rim: '#b8c8d8', light: -1, colors: { shirt: '#1e2630', pants: '#141820' }, rimW: 1.6, flap: false, wind: 0, look: -.08 });
    figurineSil(300, 612, .7, '#b8c8d8');
    // calendar page
    const days = ['10 / 10　雙十節，照常上班', '10 / 22　屠妖節，工廠放假四天', '11 / 30　離家滿兩個月'], idx = Math.min(2, Math.floor(t / 6));
    P(() => { X.globalAlpha = eout(inv(idx * 6 + .5, idx * 6 + 1.5, t)) * (1 - inv(idx * 6 + 5.2, idx * 6 + 5.9, t)); X.font = `400 22px ${VOICE}`; X.fillStyle = '#e8eef2'; X.shadowColor = '#000'; X.shadowBlur = 8; X.textAlign = 'right'; X.fillText(days[idx], 1150, 120); });
  }, cap: ['2014.10 — 11', '工廠 · 雨季'], subs: [[.8, 5.6, '「人在海外，上不上班都不能回家，沒差的。」', 'Allan'], [6.4, 11.6, '「只能守著工廠，想念大海另一端的家人……」', 'Allan'], [12.4, 17.6, '「離家完整2個月，真的想家了。」', 'Allan']] },

 { d: 24, name: 'ride', grade: ['#6a4a7a', '#ffc880'], draw(t) {
    const dawn = inv(0, 14, t);
    skyFill([mix('#2a2e5a', '#6a8ac8', dawn), mix('#8a5a7a', '#f2c4a0', dawn), mix('#f29a6a', '#ffe8c0', dawn)], 0, 420);
    const sy = lerp(420, 260, dawn); sunDisc(300, sy, 30, '#fff4d6', '#ffb35a', 1);
    rays(300, sy, '#ffd9a0', .1, t, 13, 2.2, 0, 1400);
    drift(cloudBank('rideC', 31, 1700, 220, '#ffcf9a', '#7a6a9a', 6), 60, 5, t, .7);
    const off = t * 80;
    P(() => { X.translate(-(off * .1) % 400, 0); ridge(400, 40, .004, 7, rgba(mix('#5a5a8a', '#8aa0c0', dawn), 1), 3); });
    P(() => { X.translate(-(off * .3) % 1400, 0); for (let i = 0; i < 6; i++) { const x = i * 300; if (i % 2) palmS(x, 430, 200, 10, '#3a3a52', t); else { X.fillStyle = '#3a3a52'; X.fillRect(x, 400, 90, 30); X.beginPath(); X.moveTo(x - 14, 404); X.lineTo(x + 45, 370); X.lineTo(x + 104, 404); X.fill(); } } for (let i = 6; i < 12; i++) { const x = i * 300 - 1800 + 1800; if (i % 2) palmS(x, 430, 200, 10, '#3a3a52', t); } });
    // paddy with mist
    X.fillStyle = vgrad(X, 420, H, ['#5a6a5a', '#2a3a2a', '#141c14']); X.fillRect(0, 420, W, 300);
    P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const yy = 430 + i * i * .9; X.fillStyle = `rgba(255,210,170,${.08 - i * .003})`; X.fillRect(0, yy, W, 1.5); } });
    water(500, 600, t, { sunX: 300, squash: .3, amp: 2, spread: 120 });
    P(() => { X.filter = 'blur(10px)'; X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { X.fillStyle = 'rgba(255,220,200,.12)'; ell(X, ((i * 260 - off * .5) % 1600 + 1600) % 1600 - 150, 470 + (i % 3) * 20, 260, 30); X.fill(); } });
    birds(t, 9, 200, 'rgba(255,240,230,.85)', 30, 4, 1.2);
    // raised bund road
    X.fillStyle = '#100c12'; X.fillRect(0, 600, W, 120);
    const rx = lerp(1100, 380, eio(inv(0, 22, t)));
    rider(rx, 606, .95, t, { speed: 9, rim: '#ffcf8a', dir: -1, rimDx: -2.4 });
    reeds(t, -1, 720, 130, '#07060a', 4, 22, 9, false); reeds(t, 1, 720, 150, '#07060a', 4, 22, 10, false);
    motes(t, 25, '#ffd27a', 7, [0, 300, W, 300], 1.8, .6);
  }, cap: ['2015.05.03', '清晨 5:15 · 前往太平湖'], chapter: ['第二章', '奇幻之旅'], subs: [[7.2, 12, '「海外第一個置產：一台腳踏車。我叫它阿強一號。」', 'Allan'], [12.4, 17, '「騎了將近60公里，同事說我有夠無聊。」', 'Allan'], [17.4, 21.6, '「其實，就是給自己一個目標。雖然很遠，出發就對了。」', 'Allan']] },

 { d: 16, name: 'fountain', grade: ['#6a4a3a', '#ffd090'], draw(t) {
    skyFill(['#5a7aa8', '#c8a8a0', '#ffcf96'], 0, 440); sunDisc(1000, 300, 32);
    drift(cloudBank('fC', 51, 1700, 220, '#ffd9a8', '#8a7aa0', 6), 40, 6, t, .8);
    // factory silhouette
    X.fillStyle = '#3a3040'; X.fillRect(160, 260, 900, 190); X.fillStyle = '#2a2232'; X.fillRect(160, 250, 900, 22); for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) { X.fillStyle = rgba('#ffcf8a', .25 + .2 * rnd(c + r * 12)); X.fillRect(190 + c * 72, 300 + r * 60, 40, 28); }
    X.fillStyle = vgrad(X, 440, H, ['#3a3a2a', '#1a1a14']); X.fillRect(0, 440, W, 280);
    // young trees in a row
    for (let i = 0; i < 9; i++) { const tx = 80 + i * 140, g = eout(inv(4 + i * .5, 6 + i * .5, t)); if (g <= 0) continue; X.fillStyle = '#1a1612'; X.fillRect(tx - 3, 450 - 70 * g, 6, 70 * g); X.fillStyle = rgba('#2a3a1a', 1); ell(X, tx, 440 - 80 * g, 40 * g, 36 * g); X.fill(); glow(tx + 20 * g, 430 - 90 * g, 30 * g, '#ffcf8a', .25); }
    // fountain
    P(() => { X.translate(640, 600); X.fillStyle = '#1e1a1e'; ell(X, 0, 0, 220, 40); X.fill(); X.fillRect(-20, -110, 40, 110); ell(X, 0, -112, 60, 12); X.fill();
      X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 140; i++) { const k = ((t * .9 + i / 140) % 1), ang = (rnd(i) - .5) * 2.6, v = 120 + rnd(i + 1) * 90; const x = Math.sin(ang) * k * 190, y = -112 - Math.sin(k * Math.PI) * v + k * 80; X.fillStyle = `rgba(255,220,170,${(1 - k) * .8})`; ell(X, x, y, 2.4, 3.2); X.fill(); }
      glow(0, -160, 180, '#ffd9a0', .25); });
    [[330, 640, 170, 'tudung'], [430, 650, 175, null], [880, 650, 180, 'long']].forEach(([x, y, hh, hr], i) => figure(x, y, hh, { t: t + i, rim: '#ffcf8a', light: 1, hair: hr === 'tudung' ? 'bun' : hr, dress: hr === 'tudung', colors: { shirt: '#2a3550', dress: '#3a3550' }, rimW: 1.8, flap: false, wind: .2 }));
    figure(1080, 700, 290, { t, rim: '#ffcf8a', light: 1, colors: { shirt: '#2a3a60', pants: '#1a1c28' }, rimW: 2.2, look: -.05 });
    motes(t, 30, '#ffe0a0', 3, [0, 200, W, 400], 2, .7);
  }, cap: ['2015.10', '二十多年的老工廠'], subs: [[.8, 5.4, '「剛來工廠時，這個噴水池荒廢已久。」', 'Allan'], [5.8, 10.6, '「我喜歡稱這噴水池為工廠的『活水』。」', 'Allan'], [11, 15.6, '「在廠區種了100棵樹。多年後再回來，可以很驕傲地說，這排樹是我任內種的。」', 'Allan']] },

 { d: 18, name: 'call', grade: ['#0a1430', '#2a4a8a'], bloom: .55, draw(t) {
    X.fillStyle = '#05070f'; X.fillRect(0, 0, W, H);
    P(() => { X.beginPath(); X.rect(760, 110, 380, 300); X.clip(); skyFill(['#0a1430', '#1a2850'], 110, 410); glow(1010, 190, 90, '#c8d8ff', .4); X.fillStyle = '#eef0ff'; X.beginPath(); X.arc(1010, 190, 30, 0, 7); X.fill(); treeline(410, '#03050c', 4, 1.4); });
    X.strokeStyle = '#020308'; X.lineWidth = 14; X.strokeRect(760, 110, 380, 300);
    X.fillStyle = '#0b0e1c'; X.fillRect(120, 520, 680, 90); X.fillRect(120, 470, 140, 60);
    const ph = t < 12;
    if (ph) { glow(540, 330, 300, '#8fc8ff', .45); sideSit(380, 610, 320, { t, arm: 'phone', rim: '#a8d8ff', dark: '#0a0d18', bow: t > 8 ? .18 : 0 }); X.fillStyle = '#cfefff'; X.fillRect(452, 330, 10, 22); }
    else { sideSit(380, 610, 320, { t, arm: 'rest', rim: '#6a8ac8', dark: '#0a0d18', bow: .25 }); }
    // clock
    P(() => { X.fillStyle = '#0a0a12'; X.fillRect(880, 520, 150, 60); X.font = `700 40px "DejaVu Sans Mono", monospace`; X.fillStyle = '#ff4a4a'; X.shadowColor = '#ff2a2a'; X.shadowBlur = 18; X.fillText(t < 12 ? '23:40' : '3:00', 892, 566); });
  }, cap: ['2015.09.01', '又得回去工作崗位了'], subs: [[1, 4.6, '「爸爸，為什麼你要在國外工作？」', '亮晶晶'], [5, 8.4, '「為什麼是你去，不是別人去？」', '亮晶晶'], [8.8, 11.8, '「3年好久，你和我們一起生活，我那時候幾年級？」', '亮晶晶'], [12.6, 17.6, '「我語塞了，然後，我失眠了……」', 'Allan']] },

 { d: 12, name: 'haze', grade: ['#4a6a9a', '#ffe0b0'], draw(t) {
    skyFill(['#3a6ab0', '#7aa8d8', '#d8e8f0'], 0, 480);
    drift(cloudBank('hzC', 61, 1700, 300, '#fff4e0', '#8aa0c8', 8), 60, 8, t, .95);
    sunDisc(820, 160, 26, '#ffffff', '#ffe8b0', .9); rays(820, 160, '#fff4d8', .12, t, 15, 2.6, Math.PI / 2, 1300);
    X.fillStyle = vgrad(X, 470, H, ['#4a6a4a', '#1a2a1a']); X.fillRect(0, 470, W, 250); treeline(480, '#2a3a2a', 9, 1.2);
    figure(560, 690, 330, { t, rim: '#ffeec8', light: 1, colors: { shirt: '#3a5a8a', pants: '#20283a' }, look: -.25, wind: .6, rimW: 2.2 });
    birds(t, 6, 160, 'rgba(30,30,40,.7)', 40, 6);
    const hz = 1 - eio(inv(1.5, 6, t)); X.fillStyle = `rgba(150,145,135,${hz * .93})`; X.fillRect(0, 0, W, H);
  }, cap: ['2015.10.29', '煙霾終於過去了'], subs: [[6, 11.6, '「沒想到有一天我抬頭看到藍天，會感動到想哭……」', 'Allan']] },

 { d: 22, name: 'deepavali', grade: ['#3a1a2a', '#ff9a50'], bloom: .55, draw(t) {
    X.fillStyle = '#0c0810'; X.fillRect(0, 0, W, H);
    bokeh(t, 40, ['#ffb35a', '#ff6a4a', '#ffd27a', '#ff4a8a'], 12, [60, 330], 14, 40, .35);
    // kolam on floor (perspective)
    P(() => { X.translate(640, 560); X.scale(1, .32); const g = eout(inv(.5, 8, t)); const cols = ['#d8414b', '#f2a24e', '#ffd36b', '#5fb37a', '#6aa3d8', '#b46ad8'];
      for (let ring = 0; ring < 7; ring++) { if (g * 7 < ring) continue; const n = 8 + ring * 4, rr = 40 + ring * 50; for (let i = 0; i < n; i++) P(() => { X.rotate(i * Math.PI * 2 / n + ring * .2); X.fillStyle = rgba(cols[(ring + i) % 6], .85); ell(X, 0, -rr, 14 + ring * 2, 28 + ring * 3); X.fill(); }); } });
    // oil lamps around
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, lx = 640 + Math.cos(a) * 470, ly = 560 + Math.sin(a) * 150; X.fillStyle = '#2a1a10'; ell(X, lx, ly, 14, 6); X.fill(); const fl = 1 + Math.sin(t * 11 + i) * .15; glow(lx, ly - 14, 70 * fl, '#ff9a3a', .55); X.fillStyle = '#fff0b0'; ell(X, lx, ly - 14, 3.5, 9 * fl); X.fill(); }
    // people: saree women, colleagues, Allan
    [[190, 520, 240, 'bun', '#6a1a3a'], [330, 530, 230, 'long', '#4a1a5a'], [960, 530, 235, 'bun', '#5a2a1a'], [1100, 520, 245, null, null]].forEach(([x, y, hh, hr, dc], i) => figure(x, y, hh, { t: t + i, rim: '#ffb060', light: i < 2 ? 1 : -1, hair: hr, dress: !!dc, colors: { dress: dc || '#333', shirt: '#2a2a3a' }, rimW: 2, flap: false, wind: .2, arms: i === 0 ? [.1, -2.4 + Math.sin(t * 3) * .1] : undefined }));
    figure(800, 690, 300, { t, rim: '#ffb060', light: 0, colors: { shirt: '#24304a', pants: '#14161e' }, rimW: 2.2, wind: .3 });
    // sparkler
    if (t > 10) { const sx = 190 + 40, sy = 520 - 240 * .95; for (let i = 0; i < 40; i++) { const a = rnd(i + Math.floor(t * 24) * 40) * 6.28, r = rnd(i * 3 + Math.floor(t * 24)) * 40; P(() => { X.globalCompositeOperation = 'lighter'; X.strokeStyle = 'rgba(255,230,160,.8)'; X.lineWidth = 1; X.beginPath(); X.moveTo(sx, sy); X.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); X.stroke(); }); } glow(sx, sy, 60, '#fff0c0', .8); }
    motes(t, 30, '#ffc070', 8, [0, 200, W, 400], 2, .7);
  }, cap: ['2016', '有人情味的工廠'], chapter: ['第三章', '活水'], subs: [[7.4, 11.2, '「同事放一杯飲料在我桌上，說看我很悶。我突然紅了眼眶……」', 'Allan'], [11.4, 14.6, '「同是天涯淪落人，你們離鄉的苦悶，我懂！」', 'Allan'], [14.8, 19.6, '「我把公司大廳開放給印度裔員工，布置他們屠妖節的圖騰。」', 'Allan']] },

 { d: 20, name: 'strait', grade: ['#3a2a5a', '#ff9040'], draw(t) {
    const z = 1 + t * .004; X.translate(W / 2, H * .6); X.scale(z, z); X.translate(-W / 2, -H * .6);
    skyFill(['#1a1d40', '#4a3a6a', '#c0607a', '#ff9a5a', '#ffd08a'], 0, 380);
    drift(cloudBank('stC1', 71, 1800, 260, '#ff9a6a', '#3a2a5a', 8), 30, 4, t, .9); drift(cloudBank('stC2', 77, 1800, 200, '#ffc890', '#6a4a6a', 6), 170, 7, t, .85);
    sunDisc(760, 360, 44, '#fff4d6', '#ff9a4a', 1); rays(760, 360, '#ffc070', .08, t, 12, 2.4, -Math.PI / 2, 900);
    water(380, H, t, { sunX: 760, spread: 300 });
    birds(t, 7, 170, 'rgba(25,15,30,.85)', 20, 8);
    // rocks
    X.fillStyle = '#0d0a10'; X.beginPath(); X.moveTo(0, H); X.lineTo(0, 560); X.bezierCurveTo(120, 520, 260, 520, 380, 560); X.bezierCurveTo(470, 590, 520, 640, 560, H); X.fill();
    P(() => { X.globalCompositeOperation = 'lighter'; X.strokeStyle = 'rgba(255,170,100,.4)'; X.lineWidth = 2; X.beginPath(); X.moveTo(40, 548); X.bezierCurveTo(150, 518, 260, 520, 380, 560); X.stroke(); });
    // seated figure from behind
    figure(200, 548, 250, { t, sit: true, rim: '#ffb870', light: 1, colors: { shirt: '#8a7a78', pants: '#1a1820' }, dark: .45, rimW: 2.6, arms: [.35, -.35], elbow: [-.5, .5], wind: .5 });
    windStreaks(t, '#ffd0a0', .4, 7); motes(t, 20, '#ffd27a', 5, [0, 300, W, 300], 1.8, .6);
  }, cap: ['2016.07.24', '望著麻六甲海峽'], subs: [[.8, 5.6, '「25週年廠慶，我真的看到了當地員工發自內心的笑容。」', 'Allan'], [6, 11.6, '「回想這1年10個月的委屈、孤獨與辛苦，真的是不足為外人道。」', 'Allan'], [12, 17.6, '「我的堅持和承諾，有了一個讓我自己都很感動的展現。」', 'Allan']] },

 { d: 14, name: 'xmas', grade: ['#0a1428', '#4a3a6a'], bloom: .6, draw(t) {
    X.fillStyle = '#060912'; X.fillRect(0, 0, W, H);
    P(() => { X.filter = 'blur(2px)'; for (let i = 0; i < 7; i++) { const x = i * 200 - 40; X.fillStyle = ['#121a2e', '#1a1a2e', '#14202a'][i % 3]; X.fillRect(x, 120 + (i % 2) * 30, 196, 340); for (let w = 0; w < 2; w++) for (let r = 0; r < 2; r++) if (rnd(i * 4 + w + r * 2) > .35) { X.fillStyle = 'rgba(255,200,120,.75)'; X.fillRect(x + 30 + w * 90, 170 + r * 100 + (i % 2) * 30, 56, 60); } } });
    for (let i = 0; i < 7; i++) { for (let b = 0; b < 12; b++) { const x = i * 200 - 40 + b * 17, y = 130 + (i % 2) * 30 + Math.sin(b * .5) * 10; glow(x, y, 14, ['#ff5a5a', '#5aff9a', '#ffd25a', '#8ab4ff'][(b + i) % 4], .7 * (.6 + .4 * Math.sin(t * 3 + b + i))); } }
    P(() => { glow(1010, 90, 140, '#ff3a3a', .3); X.fillStyle = '#d8414b'; X.font = `900 34px ${DISP}`; X.shadowColor = '#ff4040'; X.shadowBlur = 20; X.fillText('OLD TOWN', 920, 102); });
    // wet road reflection
    X.fillStyle = '#0a0c14'; X.fillRect(0, 460, W, 260);
    P(() => { X.globalAlpha = .45; X.translate(0, 920); X.scale(1, -1); X.filter = 'blur(4px)'; X.drawImage(cv, 0, 0, W, 460, 0, 0, W, 460); });
    X.fillStyle = vgrad(X, 460, H, [rgba('#0a0c14', .2), rgba('#0a0c14', .85)]); X.fillRect(0, 460, W, 260);
    rainfall(t, 110, .3, -3, 18);
    const k = inv(0, 14, t); figure(lerp(700, 560, k), lerp(640, 600, k), lerp(240, 205, k), { t, walk: true, pace: 2.6, rim: '#ffb0a0', light: 0, colors: { shirt: '#1a2032', pants: '#10121a' }, rimW: 1.8, flap: false, wind: .2 });
  }, cap: ['2016.12.24', '一個人的平安夜'], subs: [[.8, 5.6, '「連續9天，宿舍只有我一人。機票都訂好了，計畫卻趕不上變化。」', 'Allan'], [6, 9.6, '「在異鄉街頭一個人毫無目的閒逛，真的有些心酸。」', 'Allan'], [10, 13.6, '六天後，一通電話：2017年3月1日，回台北報到。', '']] },

 { d: 20, name: 'beach', grade: ['#4a2a5a', '#ffa060'], draw(t) {
    skyFill(['#2a2a5a', '#7a4a7a', '#e87a6a', '#ffc080'], 0, 400);
    drift(cloudBank('bC', 81, 1800, 240, '#ffb080', '#5a3a6a', 7), 50, 5, t, .9);
    sunDisc(900, 392, 40); ridge(402, 30, .008, 4, '#2a1d36', 1); palmS(1150, 410, 260, -30, '#120c18', t); palmS(1240, 410, 200, -10, '#120c18', t + 1);
    water(404, 560, t, { sunX: 900, spread: 200, squash: .7 });
    // wet sand
    X.fillStyle = vgrad(X, 560, H, ['#3a2a30', '#1a1218']); X.fillRect(0, 560, W, 160);
    P(() => { X.globalAlpha = .3; X.translate(0, 1120); X.scale(1, -1); X.drawImage(cv, 0, 400, W, 160, 0, 400, W, 160); });
    // foam lines
    P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const y = 560 + Math.sin(t * .8 + i * 2) * 8 + i * 10; X.strokeStyle = `rgba(255,220,200,${.25 - i * .06})`; X.lineWidth = 2; X.beginPath(); for (let x = 0; x <= W; x += 20) X.lineTo(x, y + Math.sin(x * .01 + t + i) * 4); X.stroke(); } });
    figure(560, 600, 180, { t: t * 1.6, walk: false, rim: '#ffc080', light: 1, hair: 'pigtails', dress: true, colors: { dress: '#3a2030' }, rimW: 2, arms: [-2.6 + Math.sin(t * 4) * .2, 2.6 - Math.sin(t * 4) * .2], shadow: false });
    P(() => { X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 20; i++) { const k = ((t * 1.3 + i / 20) % 1); X.fillStyle = `rgba(255,220,180,${(1 - k) * .7})`; ell(X, 560 + (rnd(i) - .5) * 80 * k, 590 - Math.sin(k * Math.PI) * 50, 2, 2); X.fill(); } });
    figure(400, 640, 250, { t, rim: '#ffc080', light: 1, hair: 'long', dress: true, colors: { dress: '#2a2030' }, rimW: 2.2, wind: .6 });
    figure(250, 690, 310, { t, rim: '#ffc080', light: 1, colors: { shirt: '#20283a', pants: '#14141c' }, rimW: 2.4, wind: .5, look: .05 });
    motes(t, 20, '#ffd27a', 6, [0, 300, W, 300], 1.8, .6);
  }, cap: ['2017.01.14', '我的私房景點 · 家人第一次來到南洋'], chapter: ['第四章', '終於結束的起點'], subs: [[7.4, 12.4, '「帶老婆和亮晶晶，來可戲水的海灘，看麻六甲海峽的夕陽。」', 'Allan'], [12.8, 17.6, '「上一次跟老婆一起搭飛機，是18年前，度蜜月。」', 'Allan']] },

 { d: 18, name: 'lastride', grade: ['#5a2a4a', '#ff9050'], draw(t) {
    skyFill(['#2a2050', '#8a4a6a', '#f07a50', '#ffc070'], 0, 450);
    sunDisc(820, 430, 50, '#fff0d0', '#ff8a3a', 1); rays(820, 430, '#ffb060', .07, t, 10, 2, -Math.PI / 2, 900);
    drift(cloudBank('lrC', 91, 1800, 220, '#ff9a70', '#4a2a5a', 7), 60, 5, t, .9);
    birds(t, 12, 150, 'rgba(255,230,210,.75)', 22, 9, 1.1);
    X.fillStyle = vgrad(X, 450, H, ['#3a2030', '#120a10']); X.fillRect(0, 450, W, 270);
    water(452, 560, t, { sunX: 820, squash: .4, amp: 2, spread: 150 });
    for (let i = 0; i < 6; i++) palmS(60 + i * 240, 470, 230 + (i % 2) * 80, (i % 2 ? 16 : -12), '#0e0810', t);
    X.fillStyle = '#0a060a'; X.fillRect(0, 590, W, 130);
    if (t < 8.5) rider(lerp(-120, 760, eio(inv(0, 8, t))), 596, .95, t, { speed: t < 7.5 ? 8 : 0, rim: '#ffb070', dir: 1, rimDx: 2.4 });
    else { rider(760, 596, .95, 0, { speed: 0, empty: true, rim: '#ffb070', rimDx: 2.4 }); const k = eio(inv(10.5, 17.5, t)); figure(lerp(660, 300, k), lerp(600, 640, k), lerp(240, 280, k), { t, walk: k > 0 && k < 1, pace: 3, rim: '#ffb070', light: 1, colors: { shirt: '#202838', pants: '#14141c' }, rimW: 2.2, flip: true, profile: k > 0 ? 0 : 1 }); }
    motes(t, 24, '#ffd27a', 2, [0, 300, W, 300], 1.8, .6);
  }, cap: ['2017.02.20', '和阿強一號的最後一程'], subs: [[.8, 6.6, '「上山下海，晨曦、午後豔陽、黃昏景象，都有我和阿強一號在南洋的足跡。」', 'Allan'], [9, 17.6, '「這2年多，多虧有阿強一號的陪伴。美麗的結局，美麗的回憶。」', 'Allan']] },

 { d: 16, name: 'farewell', grade: ['#3a2a4a', '#ffb070'], bloom: .5, draw(t) {
    skyFill(['#2a2a5a', '#7a5a8a', '#f0a080', '#ffd8a0'], 0, 470);
    sunDisc(1100, 440, 30, '#fff4d6', '#ffb35a', .8);
    X.fillStyle = '#1e1824'; X.fillRect(140, 250, 1000, 220); X.fillStyle = '#16121a'; X.fillRect(140, 240, 1000, 22);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 14; c++) { X.fillStyle = rgba('#ffcf8a', .35 + .3 * rnd(c * 3 + r)); X.fillRect(170 + c * 68, 290 + r * 70, 38, 30); }
    for (let i = 0; i < 10; i++) glow(170 + i * 110, 240, 40, '#ffd27a', .4);
    X.fillStyle = vgrad(X, 470, H, ['#2a2230', '#0e0a12']); X.fillRect(0, 470, W, 250);
    const crew = [['bun', 1], [null, 0], ['long', 0], [null, 0], ['bun', 1], ['long', 0], [null, 0]];
    crew.forEach(([hr, dr], i) => figure(150 + i * 165 + (i > 2 ? 150 : 0), 650 - (i % 2) * 20, 230 + (i % 3) * 12, { t: t + i * .7, rim: '#ffc890', light: 1, hair: hr, dress: !!dr, colors: { shirt: '#24304a', dress: '#2a2a40' }, rimW: 2, flap: false, wind: .3, arms: [.08, (i % 2 ? -2.7 : -2.5) + Math.sin(t * 5 + i) * .25], elbow: [0, -.2] }));
    figure(640, 700, 300, { t, rim: '#ffc890', light: 1, colors: { shirt: '#24304a', pants: '#14161e' }, rimW: 2.4, wind: .3, arms: [.08, -2.6 + Math.sin(t * 4) * .2] });
    motes(t, 40, '#ffd27a', 11, [0, 100, W, 500], 2.2, .8);
  }, cap: ['2017.02.24', '最後一天'], subs: [[.8, 6.4, '「2年5個月的緣分，走到了最後一天……再見，南洋的朋友們！」', 'Allan'], [6.8, 13.6, '「最後一夜，我用馬來西亞的天氣來想你。」', 'Allan']] },

 { d: 22, name: 'home', grade: ['#2a3a6a', '#ffc890'], draw(t) {
    if (t < 9) {
      skyFill(['#0a1430', '#1a2a5a', '#3a4a7a'], 0, H);
      for (let i = 0; i < 80; i++) { X.fillStyle = `rgba(255,250,235,${.3 + .7 * Math.abs(Math.sin(t * .5 + i))})`; X.fillRect(rnd(i + 200) * W, rnd(i + 300) * 360, 1.6, 1.6); }
      glow(900, 160, 160, '#c8d8ff', .3); X.fillStyle = '#f4f0dc'; X.beginPath(); X.arc(900, 160, 30, 0, 7); X.fill();
      for (let L = 0; L < 3; L++) drift(cloudBank('nC' + L, 120 + L, 1800, 320, ['#a8b8e0', '#8898c8', '#6a7ab0'][L], ['#1a2450', '#141c40', '#101634'][L], 9), 360 + L * 70, 10 + L * 12, t, 1);
      P(() => { X.fillStyle = '#05060c'; X.beginPath(); X.rect(0, 0, W, H); X.roundRect(250, 70, 780, 560, 180); X.fill('evenodd'); });
      figurineSil(330, 660, 1.3, '#a8c0ff', '#0a0c16');
    } else {
      const k = inv(9, 20, t);
      skyFill([mix('#1a2a5a', '#6a9ad0', k), mix('#6a5a8a', '#f2c8a0', k), mix('#ff9a6a', '#ffe8c0', k)], 0, 430);
      sunDisc(640, lerp(470, 330, k), 34, '#fff4d6', '#ffb35a', 1); rays(640, lerp(470, 330, k), '#ffd9a0', .1, t, 13, 2.6, -Math.PI / 2, 1000);
      drift(cloudBank('hC', 131, 1800, 240, '#ffd0a0', '#6a5a8a', 7), 80, 6, t, .9);
      ridge(436, 60, .005, 3, '#3a3a5a', 2); ridge(440, 30, .01, 8, '#22223a', 1);
      water(442, H, t, { sunX: 640, spread: 260 });
      reeds(t, -1, 720, 300, '#08070c', 3, 14, 3); reeds(t, 1, 720, 320, '#08070c', 3, 14, 4);
      motes(t, 30, '#ffd27a', 12, [0, 300, W, 300], 2, .7);
      const a = eout(inv(12.5, 14.5, t));
      P(() => { X.globalAlpha = a; X.textAlign = 'center'; X.shadowColor = 'rgba(40,10,0,.7)'; X.shadowBlur = 30; X.font = `400 34px ${VOICE}`; X.fillStyle = '#fff6e6'; X.fillText('「這一切，終於都成了『曾經』。」', W / 2, 210); X.globalAlpha = eout(inv(16, 18, t)); X.font = `900 64px ${DISP}`; X.fillText('Allan 下南洋', W / 2, 300); X.font = `400 20px ${VOICE}`; X.fillStyle = '#ffe2b8'; X.fillText('原作：「Allan下南洋」部落格 2014–2017　·　引文皆為 Allan 原文　·　繪製與配樂：Claude', W / 2, 346); });
    }
  }, cap: ['2017.02.25', 'PEN → TPE · 回家'], subs: [[.8, 8.6, '「阿拉蕾，我們2年多的奇幻旅行到了終點，收拾滿滿的祝福要回家了。」', 'Allan'], [9.4, 11.4, '「謝謝所有馬來西亞的朋友。」', 'Allan']] },
];

let acc = 0; SHOTS.forEach(s => { s.start = acc; acc += s.d; });
const TOTAL = acc;

function renderFrame(T) {
  const s = SHOTS.find(x => T >= x.start && T < x.start + x.d) || SHOTS[SHOTS.length - 1];
  const t = T - s.start, f = Math.round(T * FPS);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none'; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.shadowBlur = 0;
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  P(() => s.draw(t));
  post(f, { grade: s.grade, bloom: s.bloom });
  // cross-fade from black / to black
  const fade = Math.max(1 - inv(0, 1.0, t), inv(s.d - .9, s.d, t)); if (fade > 0) { X.fillStyle = `rgba(0,0,0,${fade})`; X.fillRect(0, 0, W, H); }
  // letterbox
  X.fillStyle = '#000'; X.fillRect(0, 0, W, BAR); X.fillRect(0, H - BAR, W, BAR);
  if (s.chapter) chapterTitle(s.chapter[0], s.chapter[1], t);
  if (s.cap) caption(s.cap[0], s.cap[1], eout(inv(1, 2, t)) * (1 - inv(s.d - 1.4, s.d - .6, t)));
  (s.subs || []).forEach(([a, b, txt, who]) => subtitle(txt, inv(a, a + .5, t) * (1 - inv(b - .5, b, t)), who));
}

window.TOTAL = TOTAL; window.FPS = FPS; window.SHOTS = SHOTS.map(s => ({ name: s.name, start: s.start, d: s.d }));
window.renderFrame = renderFrame;
window.ALLTEXT = SHOTS.flatMap(s => [...(s.subs || []).map(x => x[2] + (x[3] || '')), ...(s.cap || []), ...(s.chapter || [])]).join('') + 'Allan下南洋二〇一四一七段奇幻之旅這切終於都成了曾經原作部落格引文皆為原文繪製與配樂—';
window.ready = (async () => { await Promise.all([`400 31px ${VOICE}`, `900 60px ${DISP}`].map(f => document.fonts.load(f, window.ALLTEXT))); await document.fonts.ready; return true; })();
if (!/render/.test(location.search)) { let t0 = null; const st = +(new URLSearchParams(location.search).get('t') || 0); window.ready.then(() => { const loop = ts => { if (t0 === null) t0 = ts; renderFrame((st + (ts - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }); }
