/* Allan下南洋 · 動漫短片（約 5 分鐘）
 * 全部以 Canvas 2D 程式繪製；renderFrame(t) 是決定性的，同一個 t 永遠畫出同一格。
 * 角色：Allan（短黑髮、細框眼鏡、藍色 polo，會隨時間曬黑）、亮晶晶（雙馬尾小學生）、老婆、
 *       馬來同事（頭巾）、印度裔同事（紗麗）、尼泊爾夥伴、阿強一號（黑色登山車）、阿拉蕾公仔。
 */
const W = 1280, H = 720, FPS = 24;
const cv = document.getElementById('c'), X = cv.getContext('2d');

/* ───────── utils ───────── */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const eio = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(7), RND = Array.from({ length: 4000 }, R);
const rnd = i => RND[((i % 4000) + 4000) % 4000];

const INK = '#3b2b25', VOICE = '"LXGW WenKai TC", "WenQuanYi Zen Hei", sans-serif', DISP = '"Noto Serif TC", "WenQuanYi Zen Hei", serif';
const SKIN = '#f6d3b5', SKIN_SH = '#e7b590';

function P(fn) { X.save(); fn(); X.restore(); }
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); }
function fillStroke(fill, lw = 4, stroke = INK) { if (fill) { X.fillStyle = fill; X.fill(); } if (lw) { X.lineWidth = lw; X.strokeStyle = stroke; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); } }
function ell(x, y, rx, ry, rot = 0) { X.beginPath(); X.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); }
function grad(y0, y1, stops) { const g = X.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function mixHex(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = [16, 8, 0].map(s => Math.round(lerp(pa >> s & 255, pb >> s & 255, k))); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); }

/* ───────── text ───────── */
function wrapLines(text, maxW) {
  const out = []; let line = '';
  for (const ch of text) { if (X.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; }
  if (line) out.push(line); return out;
}
function subtitle(text, a, who) {
  if (a <= 0 || !text) return;
  P(() => {
    X.globalAlpha = a; X.font = `400 34px ${VOICE}`; const lines = wrapLines(text, 1040);
    const lh = 48, h = lines.length * lh + 30, y0 = H - 34 - h;
    const g = X.createLinearGradient(0, y0 - 40, 0, H); g.addColorStop(0, 'rgba(10,18,22,0)'); g.addColorStop(.45, 'rgba(10,18,22,.62)'); g.addColorStop(1, 'rgba(10,18,22,.8)');
    X.fillStyle = g; X.fillRect(0, y0 - 40, W, H - y0 + 40);
    X.textAlign = 'center'; X.textBaseline = 'middle';
    if (who) { X.font = `700 22px ${VOICE}`; X.fillStyle = '#f2a24e'; X.fillText(who, W / 2, y0 + 2); }
    X.font = `400 34px ${VOICE}`;
    lines.forEach((l, i) => { const y = y0 + 22 + (who ? 18 : 0) + i * lh; X.lineWidth = 6; X.strokeStyle = 'rgba(0,0,0,.55)'; X.strokeText(l, W / 2, y); X.fillStyle = '#fbf6ea'; X.fillText(l, W / 2, y); });
  });
}
function tag(date, place, a) {
  if (a <= 0) return;
  P(() => {
    X.globalAlpha = a; X.font = `700 22px ${VOICE}`; const w = Math.max(X.measureText(place).width, 150) + 44;
    X.fillStyle = 'rgba(14,27,33,.78)'; rr(28, 26, w, 78, 10); X.fill();
    X.fillStyle = '#f2a24e'; X.fillRect(28, 26, 6, 78);
    X.font = `600 18px "DejaVu Sans Mono", monospace`; X.fillStyle = '#e6c27a'; X.textBaseline = 'top'; X.fillText(date, 48, 38);
    X.font = `700 24px ${VOICE}`; X.fillStyle = '#fbf6ea'; X.fillText(place, 48, 64);
  });
}
function bubble(x, y, text, o = {}) {
  P(() => {
    const fs = o.fs || 28; X.font = `700 ${fs}px ${VOICE}`; const lines = wrapLines(text, o.max || 360);
    const w = Math.max(...lines.map(l => X.measureText(l).width)) + 40, h = lines.length * fs * 1.35 + 26;
    const s = o.pop == null ? 1 : back(clamp(o.pop)); if (s <= 0) return;
    X.translate(x, y); X.scale(s, s);
    const tx = o.tail || 0;
    X.beginPath(); X.roundRect(-w / 2, -h, w, h, o.think ? h / 2 : 18);
    X.fillStyle = o.fill || '#fffdf6'; X.fill(); X.lineWidth = 3.5; X.strokeStyle = INK; X.stroke();
    if (o.think) { [[tx * .4, 14, 9], [tx * .7, 30, 6]].forEach(([a, b, r]) => { ell(a, b, r, r); fillStroke('#fffdf6', 3); }); }
    else { X.beginPath(); X.moveTo(-14 + tx * .3, -2); X.lineTo(tx, 26); X.lineTo(14 + tx * .3, -2); X.fillStyle = o.fill || '#fffdf6'; X.fill(); X.stroke(); X.fillRect(-12 + tx * .3, -8, 24, 8); }
    X.fillStyle = INK; X.textAlign = 'center'; X.textBaseline = 'middle';
    lines.forEach((l, i) => X.fillText(l, 0, -h + 13 + fs * .68 + i * fs * 1.35));
  });
}
function bigText(text, x, y, size, color, a = 1, font = DISP, weight = 900) {
  P(() => { X.globalAlpha = a; X.font = `${weight} ${size}px ${font}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = size / 8; X.strokeStyle = 'rgba(10,18,22,.6)'; X.strokeText(text, x, y); X.fillStyle = color; X.fillText(text, x, y); });
}

/* ───────── manga fx ───────── */
function sparkle(x, y, r, t, c = '#fff6c8') { P(() => { X.translate(x, y); X.rotate(t * 2); X.fillStyle = c; X.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * .3 : r; X.lineTo(Math.cos(i * Math.PI / 4) * rr_, Math.sin(i * Math.PI / 4) * rr_); } X.fill(); }); }
function speedLines(cx, cy, t, a = .5, n = 60) { P(() => { X.globalAlpha = a; X.strokeStyle = '#fff'; for (let i = 0; i < n; i++) { const ang = rnd(i) * 6.283, r0 = 260 + rnd(i + 99) * 140 + Math.sin(t * 9 + i) * 30; X.lineWidth = 1 + rnd(i + 7) * 3; X.beginPath(); X.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); X.lineTo(cx + Math.cos(ang) * 1400, cy + Math.sin(ang) * 1400); X.stroke(); } }); }
function sweat(x, y, s = 1) { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.moveTo(0, -16); X.quadraticCurveTo(12, 4, 0, 8); X.quadraticCurveTo(-12, 4, 0, -16); fillStroke('#bfe6ff', 2.5); }); }
function exclaim(x, y, s = 1) { P(() => { X.translate(x, y); X.scale(s, s); X.fillStyle = '#d8414b'; X.strokeStyle = INK; X.lineWidth = 3; X.beginPath(); X.moveTo(-7, -40); X.lineTo(7, -40); X.lineTo(3, -6); X.lineTo(-3, -6); X.closePath(); X.fill(); X.stroke(); ell(0, 6, 6, 6); X.fill(); X.stroke(); }); }
function heart(x, y, s, c = '#ff6b81') { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.moveTo(0, 8); X.bezierCurveTo(-18, -6, -10, -20, 0, -10); X.bezierCurveTo(10, -20, 18, -6, 0, 8); fillStroke(c, 2); }); }
function hibiscus(x, y, s, rot, c = '#d8414b') { P(() => { X.translate(x, y); X.rotate(rot); X.scale(s, s); X.fillStyle = c; for (let k = 0; k < 5; k++) { X.rotate(Math.PI * 2 / 5); ell(0, -11, 7, 11); X.fill(); } X.fillStyle = '#ffd36b'; ell(0, 0, 3, 3); X.fill(); }); }
function petals(t, n = 40, seed = 1, colors = ['#d8414b', '#f2a24e', '#ffd36b', '#fbf6ea']) { for (let i = 0; i < n; i++) { const k = seed * 31 + i; const y = ((rnd(k) * H + t * (50 + rnd(k + 1) * 60)) % (H + 80)) - 40; const x = rnd(k + 2) * W + Math.sin(t * 1.3 + i) * 30; hibiscus(x, y, .7 + rnd(k + 3) * .7, t * (rnd(k + 4) - .5) * 3 + i, colors[i % colors.length]); } }
function vignette(a = .45) { const g = X.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 820); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); X.fillStyle = g; X.fillRect(0, 0, W, H); }
function tears(x, y, t, s = 1) { for (let i = 0; i < 3; i++) { const k = ((t * 1.2 + i / 3) % 1); P(() => { X.globalAlpha = 1 - k; X.translate(x, y + k * 40 * s); X.scale(s * .7, s * .7); X.beginPath(); X.moveTo(0, -10); X.quadraticCurveTo(8, 4, 0, 8); X.quadraticCurveTo(-8, 4, 0, -10); fillStroke('#bfe6ff', 2); }); } }

/* ───────── characters ───────── */
/* Allan: x,y = between the feet. s = scale (1 → ~300px tall). */
function allan(x, y, s, o = {}) {
  const t = o.t || 0, pose = o.pose || 'stand', expr = o.expr || 'normal';
  const tan = o.tan || 0, skin = mixHex(SKIN, '#c98b5e', tan), skinSh = mixHex(SKIN_SH, '#a86c43', tan);
  const shirt = o.shirt || '#2f6fb5';
  P(() => {
    X.translate(x, y); X.scale(s * (o.dir || 1), s);
    const bob = pose === 'walk' ? Math.abs(Math.sin(t * 8)) * -5 : Math.sin(t * 2.2) * 1.6;
    if (o.shadow !== false) { X.fillStyle = 'rgba(0,0,0,.18)'; ell(0, 2, 60, 10); X.fill(); }
    X.translate(0, bob);
    // legs
    const legSw = pose === 'walk' ? Math.sin(t * 8) * 14 : 0;
    if (pose === 'ridebody') { /* legs drawn by bike() */ }
    else if (pose !== 'sit') {
      [[-20, legSw], [20, -legSw]].forEach(([lx, sw]) => { P(() => { X.translate(lx, -78); X.rotate(sw * Math.PI / 180); rr(-13, 0, 26, 74, 10); fillStroke('#2b3550'); rr(-16, 66, 34, 16, 8); fillStroke('#4a3226'); }); });
    } else {
      [[-22], [22]].forEach(([lx]) => { rr(lx - 14, -78, 28, 40, 10); fillStroke('#2b3550'); rr(lx - 14, -44, 28, 44, 10); fillStroke('#2b3550'); rr(lx - 16, -8, 34, 14, 7); fillStroke('#4a3226'); });
    }
    // torso
    rr(-50, -178, 100, 108, 30); fillStroke(shirt);
    if (o.logo !== false && shirt === '#2f6fb5') { X.fillStyle = '#e6c27a'; ell(24, -146, 7, 7); X.fill(); }
    X.beginPath(); X.moveTo(-22, -176); X.lineTo(0, -152); X.lineTo(22, -176); fillStroke('#f5f1e6', 3);
    if (o.tie) { X.beginPath(); X.moveTo(0, -156); X.lineTo(-8, -124); X.lineTo(0, -102); X.lineTo(8, -124); X.closePath(); fillStroke('#a33b3b', 3); }
    // arms
    const arm = (side, ang, len = 74, hand = true, bend = 0) => P(() => {
      X.translate(side * 46, -166); X.rotate(ang * Math.PI / 180);
      rr(-13, -4, 26, len * .55, 12); fillStroke(shirt);
      X.translate(0, len * .5); X.rotate(bend * Math.PI / 180);
      rr(-11, -6, 22, len * .5, 10); fillStroke(skin);
      if (hand) { ell(0, len * .5 - 2, 12, 12); fillStroke(skin, 3.5); }
    });
    const w = Math.sin(t * 10) * 20;
    const poses = {
      stand: [[-1, 12], [1, -12]], walk: [[-1, 12 + legSw], [1, -12 + legSw]], sit: [[-1, 22], [1, -22]],
      wave: [[-1, 12], [1, -150 + w, 74, true, -10]], cheer: [[-1, 150 + w * .4], [1, -150 - w * .4]],
      phone: [[-1, 12], [1, -40, 74, true, -140]], photo: [[-1, -30, 74, true, 60], [1, 30, 74, true, -60]],
      hold: [[-1, -18, 74, true, 50], [1, 18, 74, true, -50]], bow: [[-1, -22, 74, true, 40], [1, 22, 74, true, -40]],
      hug: [[-1, -60, 74, true, 70], [1, 60, 74, true, -70]], type: [[-1, -30, 74, true, 45 + Math.sin(t * 20) * 8], [1, 30, 74, true, -45 + Math.cos(t * 20) * 8]],
      chin: [[-1, 12], [1, -20, 74, true, -150]], ridebody: []
    };
    (poses[pose] || poses.stand).forEach(a => arm(...a));
    // head
    P(() => {
      X.translate(0, -240); if (pose === 'bow') X.rotate(.12);
      if (o.headTilt) X.rotate(o.headTilt);
      ell(-58, 6, 10, 14); fillStroke(skin, 3.5); ell(58, 6, 10, 14); fillStroke(skin, 3.5);
      X.beginPath(); X.moveTo(-58, -10); X.bezierCurveTo(-62, 50, -30, 68, 0, 68); X.bezierCurveTo(30, 68, 62, 50, 58, -10); X.bezierCurveTo(56, -64, -56, -64, -58, -10); fillStroke(skin);
      // hair
      X.beginPath(); X.moveTo(-62, 2); X.bezierCurveTo(-70, -60, -30, -84, 6, -80); X.bezierCurveTo(48, -80, 70, -50, 62, 2);
      X.lineTo(52, -14); X.lineTo(44, -30); X.lineTo(30, -22); X.lineTo(22, -38); X.lineTo(6, -26); X.lineTo(-6, -40); X.lineTo(-20, -26); X.lineTo(-34, -36); X.lineTo(-44, -18); X.lineTo(-54, -24); X.closePath();
      fillStroke('#1e1a1c');
      X.strokeStyle = 'rgba(255,255,255,.18)'; X.lineWidth = 3; X.beginPath(); X.moveTo(-30, -64); X.quadraticCurveTo(-6, -72, 20, -66); X.stroke();
      if (tan > .3) { X.fillStyle = `rgba(150,80,40,${(tan - .3) * .25})`; ell(0, 30, 50, 30); X.fill(); }
      face(expr, t, o);
      // glasses
      X.lineWidth = 3; X.strokeStyle = '#2a2a33'; [-24, 24].forEach(gx => { rr(gx - 19, 2, 38, 26, 7); X.stroke(); }); X.beginPath(); X.moveTo(-5, 12); X.lineTo(5, 12); X.stroke();
      X.beginPath(); X.moveTo(-43, 10); X.lineTo(-56, 6); X.moveTo(43, 10); X.lineTo(56, 6); X.stroke();
      if (o.sweat) sweat(56, -22, .9);
      if (o.blushBig) { X.fillStyle = 'rgba(255,120,120,.45)'; ell(-36, 40, 14, 7); X.fill(); ell(36, 40, 14, 7); X.fill(); }
    });
    if (o.prop) o.prop();
  });
}
function face(expr, t, o) {
  const blink = (t % 3.7) > 3.58 && !['smile', 'closed', 'grin', 'cry'].includes(expr);
  X.lineCap = 'round';
  // brows
  X.strokeStyle = '#1e1a1c'; X.lineWidth = 4.5;
  const browUp = { sad: [6, -4], teary: [5, -3], shock: [-6, -6], determined: [-4, 6], cry: [8, -4], worried: [6, -3] }[expr] || [0, 0];
  X.beginPath(); X.moveTo(-38, -6 + browUp[1]); X.lineTo(-12, -8 - browUp[0]); X.moveTo(38, -6 + browUp[1]); X.lineTo(12, -8 - browUp[0]); X.stroke();
  // eyes
  const eye = (ex) => {
    if (blink || expr === 'closed') { X.beginPath(); X.moveTo(ex - 9, 16); X.quadraticCurveTo(ex, 20, ex + 9, 16); X.stroke(); return; }
    if (expr === 'smile' || expr === 'grin') { X.lineWidth = 4; X.beginPath(); X.moveTo(ex - 10, 18); X.quadraticCurveTo(ex, 6, ex + 10, 18); X.stroke(); return; }
    if (expr === 'cry') { X.lineWidth = 4; X.beginPath(); X.moveTo(ex - 10, 12); X.lineTo(ex + 10, 18); X.moveTo(ex - 10, 20); X.lineTo(ex + 10, 16); X.stroke(); return; }
    if (expr === 'shock') { X.fillStyle = '#1e1a1c'; ell(ex, 15, 4, 4); X.fill(); return; }
    X.fillStyle = '#1e1a1c'; ell(ex, 15, 7.5, 10); X.fill(); X.fillStyle = '#fff'; ell(ex + 2.5, 11, 3, 3.5); X.fill(); ell(ex - 2.5, 19, 1.5, 1.5); X.fill();
    if (expr === 'teary' || expr === 'sad') { X.fillStyle = 'rgba(160,215,255,.85)'; ell(ex, 23, 8, 3.5); X.fill(); }
  };
  X.lineWidth = 4; eye(-24); eye(24);
  if (expr === 'teary' || expr === 'cry') tears(-26, 30, t, 1);
  if (expr === 'cry') tears(26, 30, t + .4, 1);
  // blush
  X.fillStyle = 'rgba(255,130,120,.28)'; ell(-38, 38, 10, 5); X.fill(); ell(38, 38, 10, 5); X.fill();
  // mouth
  X.lineWidth = 3.5; X.strokeStyle = '#6b3b2e';
  const talk = o.talk ? Math.abs(Math.sin(t * 14)) : 0;
  X.beginPath();
  if (expr === 'grin') { X.moveTo(-16, 42); X.quadraticCurveTo(0, 64, 16, 42); X.closePath(); fillStroke('#7a2f2f', 3, '#6b3b2e'); }
  else if (expr === 'shock') { ell(0, 50, 7, 9 + talk * 3); fillStroke('#7a2f2f', 3, '#6b3b2e'); }
  else if (['sad', 'cry', 'worried'].includes(expr)) { X.moveTo(-10, 52); X.quadraticCurveTo(0, 44, 10, 52); X.stroke(); }
  else if (talk > .2) { ell(0, 48, 9, 3 + talk * 7); fillStroke('#7a2f2f', 3, '#6b3b2e'); }
  else if (expr === 'determined') { X.moveTo(-10, 48); X.lineTo(10, 48); X.stroke(); }
  else { X.moveTo(-12, 44); X.quadraticCurveTo(0, 54, 12, 44); X.stroke(); }
}

/* generic people: hair = short | long | tudung | pigtails | bun | cap */
function person(x, y, s, o = {}) {
  const t = o.t || 0, skin = o.skin || SKIN, top = o.top || '#6aa3d8', expr = o.expr || 'smile';
  P(() => {
    X.translate(x, y); X.scale(s * (o.dir || 1), s);
    const bob = Math.sin(t * 2.4 + (o.ph || 0)) * 1.6 + (o.hop ? -Math.abs(Math.sin(t * 7 + (o.ph || 0))) * 10 : 0);
    X.fillStyle = 'rgba(0,0,0,.16)'; ell(0, 2, 50, 9); X.fill(); X.translate(0, bob);
    if (o.dress) { X.beginPath(); X.moveTo(-36, -168); X.lineTo(36, -168); X.lineTo(54, -20); X.lineTo(-54, -20); X.closePath(); fillStroke(o.dress); [-16, 16].forEach(lx => { rr(lx - 9, -22, 18, 22, 6); fillStroke(skin, 3); }); }
    else { [-18, 18].forEach(lx => { rr(lx - 12, -80, 24, 76, 10); fillStroke(o.pants || '#3a3f55'); rr(lx - 14, -10, 30, 14, 7); fillStroke('#4a3226'); }); }
    if (!o.dress) { rr(-44, -170, 88, 100, 28); fillStroke(top); }
    if (o.sash) { X.beginPath(); X.moveTo(-40, -164); X.lineTo(40, -90); X.lineTo(40, -76); X.lineTo(-44, -150); X.closePath(); fillStroke(o.sash, 3); }
    const wv = Math.sin(t * 10 + (o.ph || 0)) * 22;
    const armA = { wave: [12, -150 + wv], cheer: [150 + wv * .4, -150 - wv * .4], hold: [-30, 30], down: [12, -12], offer: [12, -70] }[o.pose || 'down'];
    [[-1, armA[0]], [1, armA[1]]].forEach(([sd, a]) => P(() => { X.translate(sd * 40, -158); X.rotate(a * Math.PI / 180); rr(-11, -4, 22, 66, 10); fillStroke(o.dress || top); ell(0, 66, 11, 11); fillStroke(skin, 3); }));
    P(() => {
      X.translate(0, -226);
      if (o.hair === 'tudung') { X.beginPath(); X.moveTo(-64, 10); X.bezierCurveTo(-70, -70, 70, -70, 64, 10); X.bezierCurveTo(70, 70, 40, 92, 0, 96); X.bezierCurveTo(-40, 92, -70, 70, -64, 10); fillStroke(o.hairC || '#c25b7a'); }
      if (o.hair === 'long' || o.hair === 'pigtails' || o.hair === 'bun') { X.beginPath(); X.moveTo(-58, 0); X.bezierCurveTo(-66, -70, 66, -70, 58, 0); X.lineTo(62, o.hair === 'long' ? 80 : 30); X.lineTo(-62, o.hair === 'long' ? 80 : 30); X.closePath(); fillStroke(o.hairC || '#2a1d1a'); }
      if (o.hair === 'pigtails') { [-1, 1].forEach(sd => { ell(sd * 66, 20, 16, 30, sd * .3); fillStroke(o.hairC || '#2a1d1a'); ell(sd * 54, -4, 7, 7); fillStroke('#ff7aa2', 3); }); }
      if (o.hair === 'bun') { ell(0, -62, 22, 18); fillStroke(o.hairC || '#2a1d1a'); }
      X.beginPath(); X.moveTo(-54, -6); X.bezierCurveTo(-58, 46, -28, 62, 0, 62); X.bezierCurveTo(28, 62, 58, 46, 54, -6); X.bezierCurveTo(52, -56, -52, -56, -54, -6); fillStroke(skin);
      if (o.hair === 'tudung') { X.beginPath(); X.moveTo(-54, -2); X.bezierCurveTo(-50, -54, 50, -54, 54, -2); X.bezierCurveTo(30, -26, -30, -26, -54, -2); fillStroke(o.hairC || '#c25b7a'); }
      else if (o.hair === 'short' || !o.hair || o.hair === 'cap') { X.beginPath(); X.moveTo(-58, 4); X.bezierCurveTo(-64, -60, 64, -60, 58, 4); X.lineTo(44, -18); X.lineTo(20, -10); X.lineTo(0, -24); X.lineTo(-24, -10); X.lineTo(-46, -20); X.closePath(); fillStroke(o.hairC || '#221a18'); }
      else { X.beginPath(); X.moveTo(-56, 6); X.bezierCurveTo(-60, -58, 60, -58, 56, 6); X.bezierCurveTo(30, -18, 10, -26, -4, -14); X.bezierCurveTo(-20, -24, -40, -14, -56, 6); fillStroke(o.hairC || '#2a1d1a'); }
      if (o.hair === 'cap') { X.beginPath(); X.moveTo(-58, -14); X.bezierCurveTo(-56, -66, 56, -66, 58, -14); X.closePath(); fillStroke(o.capC || '#d8414b'); rr(10, -22, 64, 12, 6); fillStroke(o.capC || '#d8414b'); }
      if (o.bindi) { X.fillStyle = '#d8414b'; ell(0, -2, 3.5, 3.5); X.fill(); }
      if (o.mustache) { X.fillStyle = '#221a18'; X.beginPath(); X.ellipse(-8, 40, 10, 4, .2, 0, 6.3); X.ellipse(8, 40, 10, 4, -.2, 0, 6.3); X.fill(); }
      face(expr, t + (o.ph || 0), o);
    });
  });
}
/* Allan on 阿強一號 */
function bike(x, y, s, t, o = {}) {
  P(() => {
    X.translate(x, y); X.scale(s * (o.dir || 1), s);
    const spin = t * (o.speed ?? 6);
    const wheel = (wx) => P(() => { X.translate(wx, -46); ell(0, 0, 46, 46); X.lineWidth = 9; X.strokeStyle = '#1b1b1f'; X.stroke(); X.lineWidth = 2; X.strokeStyle = '#7d8790'; ell(0, 0, 38, 38); X.stroke(); X.rotate(spin); for (let i = 0; i < 8; i++) { X.rotate(Math.PI / 4); X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 38); X.stroke(); } X.fillStyle = '#444'; ell(0, 0, 5, 5); X.fill(); });
    X.fillStyle = 'rgba(0,0,0,.18)'; ell(0, 2, 110, 10); X.fill();
    wheel(-70); wheel(70);
    X.lineWidth = 8; X.strokeStyle = '#26262c'; X.lineCap = 'round'; X.lineJoin = 'round';
    X.beginPath(); X.moveTo(-70, -46); X.lineTo(-10, -48); X.lineTo(-30, -112); X.lineTo(-70, -46); X.moveTo(-10, -48); X.lineTo(44, -110); X.lineTo(-30, -112); X.moveTo(44, -110); X.lineTo(70, -46); X.moveTo(44, -110); X.lineTo(40, -132); X.stroke();
    X.strokeStyle = '#f2a24e'; X.lineWidth = 4; X.beginPath(); X.moveTo(-6, -58); X.lineTo(36, -104); X.stroke();
    X.lineWidth = 6; X.strokeStyle = '#26262c'; X.beginPath(); X.moveTo(28, -136); X.lineTo(56, -136); X.stroke();
    rr(-50, -126, 40, 10, 5); fillStroke('#26262c', 2);
    P(() => { X.translate(-10, -48); X.rotate(spin * .7); X.lineWidth = 4; X.strokeStyle = '#555'; X.beginPath(); X.moveTo(-18, 0); X.lineTo(18, 0); X.stroke(); });
    if (o.face) { X.fillStyle = '#fffbe0'; ell(60, -124, 9, 7); X.fill(); X.strokeStyle = INK; X.lineWidth = 2; X.stroke(); X.fillStyle = INK; ell(62, -125, 2.2, 2.6); X.fill(); }
    if (o.label) { X.font = `700 20px ${VOICE}`; X.fillStyle = '#f2a24e'; X.textAlign = 'center'; X.fillText('阿強一號', 6, -76); }
    if (o.rider) {
      const ped = spin * .7;
      P(() => { // rider legs pedaling
        [0, Math.PI].forEach(ph => { const px = -10 + Math.cos(ped + ph) * 18, py = -48 + Math.sin(ped + ph) * 18; X.lineWidth = 22; X.strokeStyle = '#2b3550'; X.lineCap = 'round'; X.beginPath(); X.moveTo(-34, -128); X.lineTo((px - 34) / 2 + 14, (py - 128) / 2 - 8); X.lineTo(px, py); X.stroke(); X.fillStyle = '#4a3226'; ell(px + 6, py + 4, 15, 7); X.fill(); });
      });
      allan(-30, -116, .62, { ...o.rider, pose: 'ridebody', shadow: false, t });
      P(() => { X.lineWidth = 18; X.strokeStyle = o.rider.shirt || '#2f6fb5'; X.lineCap = 'round'; X.beginPath(); X.moveTo(-14, -210); X.lineTo(36, -140); X.stroke(); X.fillStyle = mixHex(SKIN, '#c98b5e', o.rider.tan || 0); ell(42, -136, 9, 9); X.fill(); X.lineWidth = 3; X.strokeStyle = INK; X.stroke(); });
    }
  });
}
/* 阿拉蕾公仔 — small figurine with purple hair and big round glasses */
function figurine(x, y, s, t = 0, o = {}) {
  P(() => {
    X.translate(x, y); X.scale(s, s); X.translate(0, Math.sin(t * 3) * (o.bounce ? 4 : 0));
    rr(-26, -60, 52, 58, 14); fillStroke('#f08aa8', 3);
    rr(-12, -58, 24, 20, 4); fillStroke('#6aa3d8', 2.5);
    [-12, 12].forEach(lx => { rr(lx - 8, -8, 16, 10, 4); fillStroke('#fff', 2.5); });
    X.beginPath(); X.moveTo(-40, -70); X.bezierCurveTo(-48, -150, 48, -150, 40, -70); X.lineTo(44, -40); X.lineTo(-44, -40); X.closePath(); fillStroke('#6b4a9b', 3);
    ell(0, -96, 36, 34); fillStroke('#fbe0c8', 3);
    X.beginPath(); X.moveTo(-38, -104); X.bezierCurveTo(-36, -146, 36, -146, 38, -104); X.bezierCurveTo(14, -122, -14, -122, -38, -104); fillStroke('#6b4a9b', 3);
    rr(-34, -142, 68, 14, 6); fillStroke('#d8414b', 3);
    X.lineWidth = 3.5; X.strokeStyle = '#2a2a33'; ell(-14, -96, 13, 13); X.stroke(); ell(14, -96, 13, 13); X.stroke();
    X.fillStyle = '#2a2a33'; ell(-14, -96, 3.5, 4.5); X.fill(); ell(14, -96, 3.5, 4.5); X.fill();
    X.strokeStyle = '#6b3b2e'; X.lineWidth = 3; X.beginPath(); X.arc(0, -78, 9, .2, Math.PI - .2); X.stroke();
  });
}

/* ───────── scenery ───────── */
function sky(stops) { X.fillStyle = grad(0, H, stops); X.fillRect(0, 0, W, H); }
function cloud(x, y, s, c = '#fff', a = 1) { P(() => { X.globalAlpha = a; X.fillStyle = c; X.translate(x, y); X.scale(s, s); [[-50, 0, 40], [-10, -18, 50], [40, -4, 42], [80, 8, 30], [0, 12, 48]].forEach(([a_, b, r]) => { ell(a_, b, r, r * .8); X.fill(); }); }); }
function palm(x, base, h, lean, c = '#0f1a1e', sway = 0) {
  X.strokeStyle = c; X.fillStyle = c; X.lineCap = 'round';
  X.lineWidth = h * .045; X.beginPath(); X.moveTo(x, base); X.quadraticCurveTo(x + lean * .5, base - h * .5, x + lean, base - h); X.stroke();
  const tx = x + lean, ty = base - h;
  for (let i = 0; i < 8; i++) { const a = -Math.PI + i * Math.PI / 7 + Math.sin(sway + i) * .05; X.lineWidth = h * .028; X.beginPath(); X.moveTo(tx, ty); X.quadraticCurveTo(tx + Math.cos(a) * h * .3, ty + Math.sin(a) * h * .2 - 10, tx + Math.cos(a) * h * .45, ty + Math.sin(a) * h * .1 + h * .14); X.stroke(); }
}
function egrets(t, n = 7, y0 = 160, c = 'rgba(255,255,255,.9)', speed = 40, seed = 3) {
  X.strokeStyle = c; X.lineWidth = 2.4; X.lineCap = 'round';
  for (let i = 0; i < n; i++) { const k = seed * 17 + i; const x = ((rnd(k) * W + t * speed * (.7 + rnd(k + 1) * .6)) % (W + 100)) - 50, y = y0 + rnd(k + 2) * 120 + Math.sin(t + i) * 6, f = Math.sin(t * 6 + i) * 6, w = 12 + rnd(k + 3) * 6;
    X.beginPath(); X.moveTo(x - w, y - f); X.quadraticCurveTo(x - w * .4, y - 4, x, y); X.quadraticCurveTo(x + w * .4, y - 4, x + w, y - f); X.stroke(); }
}
function sun(x, y, r, a = 1) { P(() => { X.globalAlpha = a; const g = X.createRadialGradient(x, y, r * .3, x, y, r * 4); g.addColorStop(0, 'rgba(255,220,150,.7)'); g.addColorStop(1, 'rgba(255,220,150,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H); X.fillStyle = '#ffd796'; ell(x, y, r, r); X.fill(); }); }
function sea(y, t, top = '#8a4a34', bot = '#0e1b21', glintX = W * .68) {
  X.fillStyle = grad(y, H, [top, '#2c3640', bot]); X.fillRect(0, y, W, H - y);
  for (let i = 0; i < 26; i++) { const yy = y + 4 + i * i * .5; if (yy > H) break; const w = 160 - i * 4 + Math.sin(t * 1.4 + i) * 10; if (w <= 0) continue; X.fillStyle = `rgba(255,205,140,${.5 - i * .017})`; X.fillRect(glintX - w / 2 + Math.sin(t * 1.9 + i * 1.7) * 8, yy, w, 2 + i * .06); }
}
function stars(t, n = 120, a = 1) { for (let i = 0; i < n; i++) { X.fillStyle = `rgba(255,250,230,${a * (.3 + .7 * Math.abs(Math.sin(t * (.5 + rnd(i)) + i)))})`; X.fillRect(rnd(i + 500) * W, rnd(i + 900) * H * .6, 2, 2); } }
function rain(t, n = 220, a = .6) { X.strokeStyle = `rgba(200,225,240,${a})`; X.lineWidth = 2; for (let i = 0; i < n; i++) { const x = (rnd(i) * (W + 200) - t * 260) % (W + 200); const y = (rnd(i + 3000) * H + t * 1400) % (H + 60) - 30; X.beginPath(); X.moveTo((x + W + 200) % (W + 200), y); X.lineTo((x + W + 200) % (W + 200) - 8, y + 28); X.stroke(); } }
function mosque(x, base, s, c) { P(() => { X.translate(x, base); X.scale(s, s); X.fillStyle = c; X.fillRect(-90, -60, 180, 60); X.beginPath(); X.arc(0, -60, 54, Math.PI, 0); X.fill(); X.fillRect(-2, -134, 4, 22); X.beginPath(); X.arc(0, -138, 6, 0, 7); X.fill(); [-120, 120].forEach(mx => { X.fillRect(mx - 9, -170, 18, 170); X.beginPath(); X.moveTo(mx - 13, -170); X.lineTo(mx, -200); X.lineTo(mx + 13, -170); X.fill(); }); }); }
function kampung(x, base, s, wall = '#8b5a3c', roof = '#5b3a2a') { P(() => { X.translate(x, base); X.scale(s, s); [-60, -20, 20, 60].forEach(px => { X.fillStyle = '#4a3226'; X.fillRect(px - 3, -40, 6, 40); }); rr(-80, -110, 160, 72, 4); fillStroke(wall, 3); X.beginPath(); X.moveTo(-100, -106); X.lineTo(0, -170); X.lineTo(100, -106); X.closePath(); fillStroke(roof, 3); X.fillStyle = '#f6d58f'; rr(-50, -96, 28, 32, 3); X.fill(); rr(22, -96, 28, 32, 3); X.fill(); }); }
function paddy(y, t, c1 = '#5f8f3e', c2 = '#4f7d33') { X.fillStyle = c1; X.fillRect(0, y, W, H - y); X.strokeStyle = c2; X.lineWidth = 2; for (let i = 0; i < 18; i++) { const yy = y + i * i * 1.6 + 6; if (yy > H) break; X.beginPath(); for (let xx = 0; xx <= W; xx += 40) X.lineTo(xx, yy + Math.sin(xx * .02 + t + i) * 2); X.stroke(); } }
function factory(x, base, s, o = {}) {
  P(() => {
    X.translate(x, base); X.scale(s, s);
    rr(-360, -190, 720, 190, 6); fillStroke('#efe6d2', 4); X.fillStyle = '#2d5d8f'; X.fillRect(-360, -190, 720, 34); X.strokeStyle = INK; X.lineWidth = 4; X.strokeRect(-360, -190, 720, 34);
    X.fillStyle = '#e8743b'; X.fillRect(-120, -156, 18, 156);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 10; c++) { const wx = -330 + c * 66 + (c > 3 ? 20 : 0), wy = -134 + r * 62; rr(wx, wy, 44, 34, 3); fillStroke(o.night ? '#f6d58f' : '#9cc3dc', 3); }
    X.font = `900 26px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText(o.sign || 'PARIT BUNTAR 工廠', 0, -164);
  });
}
function shrine(x, base, s) { P(() => { X.translate(x, base); X.scale(s, s); X.fillStyle = '#8a8a8a'; X.fillRect(-30, -50, 60, 50); rr(-46, -120, 92, 72, 4); fillStroke('#c8343c', 3.5); X.beginPath(); X.moveTo(-62, -116); X.lineTo(0, -160); X.lineTo(62, -116); X.closePath(); fillStroke('#d8a25a', 3.5); X.fillStyle = '#3a1a14'; rr(-26, -108, 52, 50, 3); X.fill(); X.fillStyle = '#ffd36b'; ell(0, -84, 8, 10); X.fill(); }); }
function incense(x, y, t, n = 3) { for (let i = 0; i < n; i++) { X.strokeStyle = '#8b5a3c'; X.lineWidth = 2; X.beginPath(); X.moveTo(x + i * 6 - 6, y); X.lineTo(x + i * 6 - 6, y - 30); X.stroke(); X.strokeStyle = 'rgba(220,220,220,.5)'; X.beginPath(); for (let k = 0; k < 20; k++) X.lineTo(x + i * 6 - 6 + Math.sin(t * 2 + k * .5 + i) * k * .7, y - 30 - k * 5); X.stroke(); } }
function room(wall = '#e9dfc9', floor = '#b88a5e') { X.fillStyle = wall; X.fillRect(0, 0, W, H * .72); X.fillStyle = floor; X.fillRect(0, H * .72, W, H * .28); X.fillStyle = 'rgba(0,0,0,.08)'; X.fillRect(0, H * .72 - 10, W, 10); }
function windowFrame(x, y, w, h, inside) { P(() => { X.save(); rr(x, y, w, h, 6); X.clip(); inside(); X.restore(); rr(x, y, w, h, 6); fillStroke(null, 10, '#6b4a33'); X.lineWidth = 6; X.beginPath(); X.moveTo(x + w / 2, y); X.lineTo(x + w / 2, y + h); X.moveTo(x, y + h / 2); X.lineTo(x + w, y + h / 2); X.stroke(); }); }
function desk(x, y, w) { rr(x, y, w, 20, 4); fillStroke('#8b5a3c'); X.fillStyle = '#6b4a33'; X.fillRect(x + 16, y + 20, 16, 120); X.fillRect(x + w - 32, y + 20, 16, 120); }
function phoneFrame(x, y, w, h, inside) { P(() => { rr(x - 12, y - 12, w + 24, h + 24, 34); fillStroke('#1b1b1f', 4); X.save(); rr(x, y, w, h, 22); X.clip(); inside(); X.restore(); }); }
function regionMap(t, from, to, p, label = true) {
  const r = window.REGION; X.fillStyle = '#16303a'; X.fillRect(0, 0, W, H);
  const sc = 0.56, ox = W / 2 - r.w * sc / 2 + 60, oy = 50;
  P(() => { X.translate(ox, oy); X.scale(sc, sc); X.fillStyle = '#2b5056'; X.strokeStyle = '#3d6a70'; X.lineWidth = 2; const pth = new Path2D(r.land); X.fill(pth); X.stroke(pth); });
  const pr = (lon, lat) => [ox + (lon - r.bbox[0]) * r.k * r.sx * sc, oy + (r.bbox[3] - lat) * r.sx * sc];
  const A = pr(...from), B = pr(...to), C = [(A[0] + B[0]) / 2 + 140, (A[1] + B[1]) / 2 - 80];
  const q = k => [lerp(lerp(A[0], C[0], k), lerp(C[0], B[0], k), k), lerp(lerp(A[1], C[1], k), lerp(C[1], B[1], k), k)];
  X.setLineDash([10, 10]); X.strokeStyle = '#e6c27a'; X.lineWidth = 3; X.beginPath(); for (let k = 0; k <= p; k += .01) X.lineTo(...q(k)); X.stroke(); X.setLineDash([]);
  [[A, '#f2a24e'], [B, '#d8414b']].forEach(([pt, c]) => { X.fillStyle = c; ell(pt[0], pt[1], 10, 10); X.fill(); X.strokeStyle = '#0e1b21'; X.lineWidth = 3; X.stroke(); });
  if (label) { X.font = `700 30px ${VOICE}`; X.fillStyle = '#fbf6ea'; X.fillText(from[2], A[0] + 18, A[1] + 10); X.fillText(to[2], B[0] + 18, B[1] + 10); }
  const a = q(clamp(p)), b = q(clamp(p + .01)); P(() => { X.translate(...a); X.rotate(Math.atan2(b[1] - a[1], b[0] - a[0])); X.fillStyle = '#fbf6ea'; X.beginPath(); X.moveTo(26, 0); X.lineTo(-18, -14); X.lineTo(-10, 0); X.lineTo(-18, 14); X.closePath(); X.fill(); X.fillRect(-6, -26, 10, 52); });
}
function planeWindow(t, outside) { X.fillStyle = '#d9d4ca'; X.fillRect(0, 0, W, H); P(() => { X.save(); rr(380, 90, 520, 470, 200); X.clip(); outside(); X.restore(); rr(380, 90, 520, 470, 200); fillStroke(null, 18, '#bfb8aa'); rr(366, 76, 548, 498, 214); fillStroke(null, 6, '#a8a092'); }); }
function chapter(n, title, year, p) {
  X.fillStyle = '#0e1b21'; X.fillRect(0, 0, W, H);
  const a = eout(inv(0, .3, p)) * (1 - inv(.85, 1, p));
  P(() => { X.globalAlpha = a * .9; X.font = `900 300px ${DISP}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = 2.5; X.strokeStyle = '#f2a24e'; X.strokeText(year, W / 2 + (1 - eout(inv(0, .5, p))) * 80, H / 2 - 20); });
  bigText(n, W / 2, H / 2 - 70, 40, '#e6c27a', a, VOICE, 700);
  bigText(title, W / 2, H / 2 + 20, 84, '#fbf6ea', a);
}

/* ───────── storyboard ─────────
 * Each shot: d (seconds), draw(t, p) with local time t and progress p, subs [[from, to, text, who]], tag [date, place].
 */
const SHOTS = [
 { d: 12, name: 'open', draw(t, p) {
    sky(['#0b1820', '#26303f', '#7a4a3e', '#e48b45']); stars(t, 140, 1 - p * .6);
    sun(W * .7, 470, 70, .9); sea(480, t);
    X.fillStyle = '#0b1418'; X.beginPath(); X.moveTo(0, 480); for (let i = 0; i <= 30; i++) X.lineTo(i * 18, 470 - Math.abs(Math.sin(i * 1.3)) * 10 - (i < 8 ? (8 - i) * 4 : 0)); X.lineTo(540, 480); X.fill();
    palm(70, 482, 300, 20, '#0b1418', t); palm(190, 482, 220, -14, '#0b1418', t + 1); palm(330, 482, 170, 10, '#0b1418', t + 2);
    egrets(t, 9, 120, 'rgba(255,240,220,.85)', 30);
    const a = eout(inv(1.5, 4, t)); bigText('Allan 下南洋', W / 2 + 130, 250, 104, '#fbf6ea', a);
    bigText('2014 — 2017 · 一段奇幻之旅', W / 2 + 130, 340, 30, '#e6c27a', eout(inv(3.5, 5.5, t)), VOICE, 700);
    vignette(.5);
  }, subs: [[6.5, 11.6, '「這一切，有一天都會變成『曾經』。」', 'Allan · 2014']] },

 { d: 4, name: 'ch1', draw: (t, p) => chapter('第一章', '提起勇氣', '2014', p) },

 { d: 14, name: 'office', tag: ['2014.01.01', '台北 · 辦公室'], draw(t, p) {
    room('#dfe4e6', '#9a8a78');
    windowFrame(700, 70, 520, 330, () => { X.fillStyle = grad(70, 400, ['#9fc2dc', '#f2d2b0']); X.fillRect(700, 70, 520, 330);
      X.fillStyle = '#6f8597'; [[720, 300, 60, 100], [790, 260, 50, 140], [850, 310, 70, 90], [1100, 280, 60, 120], [1160, 320, 60, 80], [1040, 300, 50, 100]].forEach(b => X.fillRect(...b));
      P(() => { X.fillStyle = '#5b7083'; X.translate(980, 400); for (let i = 0; i < 8; i++) { X.fillRect(-26 + i * 2, -40 - i * 30, 52 - i * 4, 30); } X.fillRect(-4, -300, 8, 60); }); });
    desk(80, 420, 620);
    [[130, 250], [300, 230], [470, 250]].forEach(([mx, my], i) => { rr(mx, my, 150, 110, 6); fillStroke('#2a2f38'); X.fillStyle = '#0f1a14'; X.fillRect(mx + 8, my + 8, 134, 94); for (let l = 0; l < 7; l++) { X.fillStyle = ['#5fd38d', '#f2a24e', '#6aa3d8'][(l + i) % 3]; X.fillRect(mx + 16 + (l % 3) * 8, my + 16 + l * 12, 40 + rnd(l + i * 9) * 70 * clamp((t * 3 - l) / 2), 5); } X.fillStyle = '#2a2f38'; X.fillRect(mx + 66, my + 110, 18, 30); });
    const stand = inv(9.5, 10.5, t);
    allan(390, 560 - stand * 0, .95, { t, pose: stand > 0 ? 'stand' : 'type', expr: t < 5 ? 'normal' : t < 9.5 ? 'worried' : 'determined', shirt: '#e9eef2', tie: true, logo: false });
    if (t > 2.2 && t < 9.3) { const items = ['高職 電工', '二專 工管', '大學 企管', 'MBA', '資訊工作 20 年', '大學講師 12 年']; items.forEach((s, i) => { const k = inv(2.2 + i * .7, 2.8 + i * .7, t); if (k > 0) bubble(260 + (i % 3) * 165, 170 + Math.floor(i / 3) * 66, s, { pop: k, fs: 22, think: true, tail: 0 }); }); }
    if (t > 10.5) { sparkle(330, 260, 18, t); sparkle(470, 240, 12, t + 1); }
  }, subs: [[1, 5, '「資訊工程根本不是我的本科，但我卻靠這項專業混口飯吃過了20年。」', 'Allan'], [5.2, 9.6, '「年輕時沒懂，懂的時候卻沒有勇氣回頭，就怕來個大轉彎跌倒失去了所有。」', 'Allan'], [10, 13.8, '「仍有夢想，仍未放棄。」', 'Allan']] },

 { d: 7, name: 'fork', draw(t, p) {
    sky(['#8fc1e3', '#f6e2c0']); cloud(200 + t * 10, 120, 1, '#fff', .9); cloud(900 - t * 6, 90, .8, '#fff', .8);
    X.fillStyle = '#7fb069'; X.fillRect(0, 430, W, 290);
    X.fillStyle = '#c9b48a'; X.beginPath(); X.moveTo(560, 430); X.lineTo(720, 430); X.lineTo(900, 720); X.lineTo(380, 720); X.fill();
    X.beginPath(); X.moveTo(700, 430); X.lineTo(760, 430); X.lineTo(1280, 560); X.lineTo(1280, 640); X.fill();
    P(() => { X.translate(640, 520); X.fillStyle = '#6b4a33'; X.fillRect(-8, -200, 16, 200);
      [[-1, 'IT · 20 年', '#9aa7b1', -200], [1, '南洋 →', '#f2a24e', -150]].forEach(([d, s, c, yy]) => { P(() => { X.translate(0, yy); X.rotate(d * .05); X.beginPath(); X.moveTo(0, -24); X.lineTo(d * 170, -24); X.lineTo(d * 200, 0); X.lineTo(d * 170, 24); X.lineTo(0, 24); X.closePath(); fillStroke(c); X.font = `700 30px ${VOICE}`; X.fillStyle = '#1b1b1f'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(s, d * 90, 2); }); }); });
    const k = eio(inv(1.5, 6.5, t));
    allan(lerp(470, 1060, k), lerp(640, 590, k), lerp(.8, .55, k), { t, pose: k > 0 && k < 1 ? 'walk' : 'stand', expr: 'determined', dir: 1, prop: () => { rr(56, -110, 54, 70, 8); fillStroke('#2b3550'); X.fillStyle = '#e6c27a'; X.fillRect(70, -122, 26, 12); } });
  }, subs: [[.6, 6.8, '「提起勇氣，人生來個大轉彎……」', 'Allan']] },

 { d: 9, name: 'goodbye', tag: ['2014.10.01', '台北 · 出發的早晨'], draw(t, p) {
    room('#f1e3cf', '#c49a6c'); X.fillStyle = '#8b5a3c'; rr(980, 160, 200, 400, 6); X.fill(); X.fillStyle = '#e6c27a'; ell(1150, 370, 8, 8); X.fill();
    person(220, 610, .95, { t, hair: 'long', dress: '#d77b8f', expr: 'worried', pose: 'down', ph: .3 });
    person(370, 630, .62, { t, hair: 'pigtails', dress: '#ff9fb6', expr: t > 3 ? 'normal' : 'smile', pose: t > 4.5 ? 'wave' : 'down', talk: t > 2 && t < 5, ph: 1 });
    person(480, 640, .55, { t, hair: 'bun', dress: '#9bd0a8', expr: 'smile', pose: 'wave', ph: 2 });
    person(580, 650, .5, { t, hair: 'long', dress: '#f2c46a', expr: 'smile', pose: 'wave', ph: 3 });
    allan(850, 640, .95, { t, pose: t > 6 ? 'wave' : 'stand', expr: t > 6 ? 'teary' : 'smile', dir: -1, prop: () => { rr(-130, -110, 54, 70, 8); fillStroke('#2b3550'); } });
    if (t > 2 && t < 5.5) bubble(380, 360, '爸爸，拍天上的雲給我看！', { pop: inv(2, 2.4, t), fs: 26, tail: -10 });
  }, subs: [[2, 5.5, '亮晶晶要的禮物，比去東京迪士尼容易做到。', ''], [6, 8.8, '「只盼我最愛的家人，等著我結束這段旅程歸來相聚。」', 'Allan']] },

 { d: 11, name: 'flight', draw(t, p) {
    if (t < 5.5) {
      planeWindow(t, () => { sky(['#5d9bd6', '#bfe0f6']); for (let i = 0; i < 6; i++) cloud(((i * 260 - t * 90) % 1500 + 1500) % 1500 - 100, 380 + (i % 3) * 50, 1.3 + (i % 2) * .4, '#fff', .95); X.fillStyle = '#e8eef3'; X.beginPath(); X.moveTo(380, 470); X.lineTo(900, 400); X.lineTo(900, 440); X.lineTo(380, 520); X.fill(); });
      allan(230, 760, 1.1, { t, pose: 'photo', expr: 'smile', dir: 1, shadow: false });
      if ((t % 1.3) < .1 && t > 1) { X.fillStyle = 'rgba(255,255,255,.6)'; X.fillRect(0, 0, W, H); }
      if (t > 1.4) bubble(980, 200, '咔嚓！給亮晶晶的雲', { pop: inv(1.4, 1.8, t), fs: 24 });
    } else {
      const k = eio(inv(5.8, 10.6, t)); regionMap(t, [121.23, 25.08, '台北'], [100.28, 5.30, '檳城'], k);
      X.font = `600 22px "DejaVu Sans Mono", monospace`; X.fillStyle = '#e6c27a'; X.fillText('TPE → PEN · 約 2,850 km', 60, 680);
    }
  }, tag: ['2014.10.01', '華航 11:40 起飛'], subs: [[.4, 5.2, '「我很努力地在飛機上拍各種形狀的雲！」', 'Allan'], [6, 10.8, '第三次飛往大馬。這一次，是單程。', '']] },

 { d: 12, name: 'dorm', tag: ['2014.10.01', '巴里文打 · 台幹宿舍'], draw(t, p) {
    room('#e7dcc4', '#a3784f');
    windowFrame(760, 80, 420, 300, () => { X.fillStyle = grad(80, 380, ['#1a2a44', '#4a3d5a', '#c86d4a']); X.fillRect(760, 80, 420, 300); stars(t, 30); mosque(980, 380, .9, '#1a1c2a'); X.fillStyle = '#fbe7b0'; X.beginPath(); X.arc(1110, 140, 26, 0, 7); X.fill(); X.fillStyle = '#1a2a44'; X.beginPath(); X.arc(1122, 132, 24, 0, 7); X.fill(); });
    desk(380, 470, 420); rr(420, 360, 150, 110, 8); fillStroke('#cfc6b2'); X.fillStyle = '#89a7c2'; X.fillRect(432, 372, 126, 86); [0, 1, 2].forEach(i => person(455 + i * 38, 455, .16, { t, hair: i ? 'pigtails' : 'long', dress: ['#ff9fb6', '#9bd0a8', '#f2c46a'][i] }));
    const k = eout(inv(2, 4, t));
    allan(250, 640, 1, { t, pose: t < 4.2 ? 'hold' : 'stand', expr: t > 5 ? 'smile' : 'normal', dir: 1 });
    figurine(lerp(320, 680, k), lerp(520, 470, k) - Math.sin(k * Math.PI) * 120, .8, t, { bounce: t > 4.5 });
    if (t > 4.6) { sparkle(640, 330, 14, t); sparkle(720, 350, 10, t + 1); for (let i = 0; i < 3; i++) heart(560 + i * 80, 300 - ((t * 30 + i * 40) % 120), .9); }
  }, subs: [[1, 5.6, '「到宿舍第一件事，阿拉蕾擺好。」', 'Allan'], [6, 11.6, '「看到阿拉蕾，我就會想起家裡3個小鬼的笑容！」', 'Allan']] },

 { d: 9, name: 'dawn', tag: ['2014.10.02', '上班第一天 · 清晨 7:00'], draw(t, p) {
    sky(['#2b3d5a', '#a87a7a', '#f2c48a']); sun(1050, 470, 50, .8);
    mosque(1000, 470, 1.1, '#3a3346');
    for (let i = 0; i < 4; i++) { const r = ((t * 60 + i * 60) % 240); X.strokeStyle = `rgba(255,240,210,${.5 * (1 - r / 240)})`; X.lineWidth = 3; X.beginPath(); X.arc(1000, 280, r, Math.PI * 1.1, Math.PI * 1.9); X.stroke(); }
    X.fillStyle = '#6f8f4e'; X.fillRect(0, 470, W, 250); factory(420, 470, .9);
    shrine(820, 640, 1); incense(820, 535, t);
    allan(660, 650, .9, { t, pose: 'bow', expr: 'closed', dir: 1 });
  }, subs: [[.5, 4.4, '清晨，可蘭經的誦讀聲從清真寺飄進窗口。', ''], [4.6, 8.8, '「入境隨俗，來拜這塊地的主人：神明，我來報到了。」', 'Allan']] },

 { d: 14, name: 'rain', draw(t, p) {
    room('#cfd3cf', '#8b8b80');
    windowFrame(120, 70, 640, 400, () => { X.fillStyle = grad(70, 470, ['#3f4a55', '#6f7c84']); X.fillRect(120, 70, 640, 400); X.fillStyle = '#2f3a3e'; for (let i = 0; i < 6; i++) palm(170 + i * 120, 470, 200 + (i % 2) * 60, (i % 2 ? 10 : -12), '#2f3a3e', t); rain(t, 160, .7); if ((t % 5) > 4.85) { X.fillStyle = 'rgba(255,255,255,.5)'; X.fillRect(120, 70, 640, 400); } });
    const days = [['10', '10', '雙十節 · 照常上班'], ['10', '22', '屠妖節 · 工廠放假 4 天'], ['11', '30', '離家滿 2 個月']];
    const idx = Math.min(2, Math.floor(t / 4.6));
    P(() => { X.translate(980, 120); rr(-110, 0, 220, 230, 10); fillStroke('#fbf6ea'); X.fillStyle = '#d8414b'; X.fillRect(-110, 0, 220, 50); X.strokeRect(-110, 0, 220, 50);
      X.textAlign = 'center'; X.font = `700 26px ${VOICE}`; X.fillStyle = '#fff'; X.fillText(days[idx][0] + ' 月', 0, 34);
      X.font = `900 110px ${DISP}`; X.fillStyle = INK; X.fillText(days[idx][1], 0, 162); X.font = `700 20px ${VOICE}`; X.fillText(days[idx][2], 0, 210);
      const fl = (t % 4.6) / 4.6; if (fl > .9 && idx < 2) { X.globalAlpha = 1 - (fl - .9) * 10; X.fillStyle = '#fbf6ea'; X.fillRect(-110, 50 - (fl - .9) * 1500, 220, 180); } });
    allan(980, 660, .95, { t, pose: 'stand', expr: idx === 2 ? 'teary' : 'sad', dir: -1 });
    rr(560, 470, 150, 16, 4); fillStroke('#8b5a3c'); X.fillStyle = '#6b4a33'; X.fillRect(575, 486, 12, 90); X.fillRect(683, 486, 12, 90);
    figurine(635, 470, .45, t);
  }, tag: ['2014.10 – 11', '工廠辦公室'], subs: [[.4, 4.4, '「台灣的雙十連假，我還要上班。人在海外，上不上班都不能回家，沒差的。」', 'Allan'], [4.7, 9, '「只能守著工廠，想念大海另一端的家人……」', 'Allan'], [9.3, 13.8, '「離家完整2個月，真的想家了！」', 'Allan']] },

 { d: 4, name: 'ch2', draw: (t, p) => chapter('第二章', '奇幻之旅', '2015', p) },

 { d: 11, name: 'newbike', tag: ['2015.02.26', '海外第一個置產'], draw(t, p) {
    sky(['#7fb6de', '#f6e2c0']); X.fillStyle = '#c8b48d'; X.fillRect(0, 500, W, 220);
    rr(80, 150, 560, 350, 8); fillStroke('#e9dfc9'); X.fillStyle = '#d8414b'; X.fillRect(80, 150, 560, 60); X.font = `900 34px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText('KEDAI BASIKAL 腳踏車行', 360, 192);
    const k = back(clamp(inv(.5, 2, t)));
    bike(820, 610, .95 * k, 0, { face: t > 3, label: t > 3 });
    if (t > 2) { speedLines(820, 520, t, .25 * (1 - inv(2, 4, t))); for (let i = 0; i < 6; i++) sparkle(700 + rnd(i) * 260, 380 + rnd(i + 5) * 160, 10 + rnd(i + 9) * 10, t + i); }
    allan(460, 620, .95, { t, pose: t > 5.5 ? 'cheer' : 'stand', expr: t > 3 ? 'grin' : 'shock', dir: 1 });
    person(250, 620, .85, { t, hair: 'short', top: '#9bbf6a', expr: 'smile', talk: t > .5 && t < 3, ph: 1 });
    if (t > .5 && t < 3.5) bubble(250, 300, '騎到吉隆坡都沒問題！', { pop: inv(.5, .9, t), fs: 24 });
    if (t > 3) bigText('RM 560', 980, 260, 60, '#f2a24e', inv(3, 3.5, t));
  }, subs: [[3.4, 7.2, '「就老闆這句話，我把海外第一個置產的東西帶回宿舍了！」', 'Allan'], [7.4, 10.8, '「上山下海，城市鄉村，都由阿強一號來陪伴！」', 'Allan']] },

 { d: 14, name: 'ride', tag: ['2015.05.03', '清晨 5:15 → 太平湖'], draw(t, p) {
    const dawn = inv(0, 9, t);
    sky([mixHex('#1d2b47', '#7fb6de', dawn), mixHex('#6b4a6a', '#f6d8b0', dawn), mixHex('#e48b45', '#f6e8c8', dawn)]);
    sun(1000, lerp(520, 220, dawn), 50, .9);
    if (t < 10) {
      const off = t * 160;
      X.fillStyle = '#6e8c7a'; X.beginPath(); X.moveTo(0, 420); for (let x = 0; x <= W; x += 40) X.lineTo(x, 360 + Math.sin((x + off * .2) * .006) * 40); X.lineTo(W, 420); X.fill();
      paddy(420, t);
      for (let i = -1; i < 6; i++) { const x = ((i * 300 - off * .6) % 1800 + 1800) % 1800 - 200; if (i % 3 === 0) kampung(x, 440, .7); else palm(x, 440, 220 + (i % 2) * 60, 10, '#24402e', t); }
      egrets(t, 6, 160, 'rgba(255,255,255,.9)', 50);
      X.fillStyle = '#7d756b'; X.fillRect(0, 600, W, 120); X.strokeStyle = '#f3e4b8'; X.setLineDash([60, 50]); X.lineDashOffset = off; X.lineWidth = 6; X.beginPath(); X.moveTo(0, 660); X.lineTo(W, 660); X.stroke(); X.setLineDash([]);
      bike(560, 640, .9, t, { rider: { t, expr: t > 6 ? 'smile' : 'determined', tan: .2 }, speed: 10 });
      const km = Math.round(clamp(t / 9.6) * 60);
      P(() => { X.fillStyle = 'rgba(14,27,33,.75)'; rr(1040, 30, 210, 90, 12); X.fill(); X.font = `900 54px ${DISP}`; X.fillStyle = '#f2a24e'; X.textAlign = 'right'; X.fillText(km, 1170, 98); X.font = `700 24px ${VOICE}`; X.fillStyle = '#fbf6ea'; X.fillText('km', 1226, 96); });
    } else {
      X.fillStyle = '#6e8c9a'; X.beginPath(); X.moveTo(0, 360); [[200, 250], [420, 320], [640, 220], [900, 330], [1280, 260]].forEach(p_ => X.lineTo(...p_)); X.lineTo(W, 420); X.lineTo(0, 420); X.fill();
      X.fillStyle = grad(400, H, ['#9cc3dc', '#5d8fae']); X.fillRect(0, 400, W, 320);
      [[180, 420], [1080, 430]].forEach(([tx, ty]) => { X.fillStyle = '#4a3226'; X.fillRect(tx - 10, ty - 160, 20, 160); X.fillStyle = '#4f7d33'; ell(tx, ty - 190, 200, 70); X.fill(); X.fillStyle = 'rgba(79,125,51,.35)'; ell(tx, ty + 120, 200, 50); X.fill(); });
      X.fillStyle = '#7fb069'; X.fillRect(0, 600, W, 120);
      bike(450, 650, .8, 0, { speed: 0 });
      allan(720, 660, .85, { t, pose: 'cheer', expr: 'grin', tan: .2 });
      bigText('60 km！', 900, 200, 80, '#f2a24e', inv(10, 10.5, t));
    }
  }, subs: [[.5, 5, '「同事說我有夠無聊。」', 'Allan'], [5.2, 9.8, '「其實，就是給自己一個目標，雖然很遠，出發就對了。」', 'Allan'], [10.2, 13.8, '「得為自己排解一下思鄉的心情。」', 'Allan']] },

 { d: 14, name: 'fountain', tag: ['2015.10', '20 多年的老工廠'], draw(t, p) {
    const life = inv(4, 6, t);
    sky([mixHex('#a7a99f', '#7fb6de', life), mixHex('#d7d2c2', '#f6e8c8', life)]);
    factory(640, 420, 1.2); X.fillStyle = mixHex('#a09a7a', '#7fb069', life); X.fillRect(0, 420, W, 300);
    // trees grow
    const trees = Math.floor(clamp(inv(7.5, 12, t)) * 100);
    for (let i = 0; i < 12; i++) { const g = clamp((trees - i * 8) / 8); if (g <= 0) continue; const tx = 60 + i * 105, ty = 450; X.fillStyle = '#6b4a33'; X.fillRect(tx - 4, ty - 50 * g, 8, 50 * g); X.fillStyle = '#4f8a3a'; ell(tx, ty - 60 * g, 34 * g, 30 * g); X.fill(); X.lineWidth = 3; X.strokeStyle = INK; X.stroke(); }
    // fountain
    P(() => { X.translate(640, 600); ell(0, 0, 200, 46); fillStroke('#b8b0a0'); ell(0, -6, 176, 36); fillStroke(life > 0 ? '#7fc4e0' : '#8a8070', 3);
      rr(-22, -110, 44, 104, 8); fillStroke('#cfc6b2'); ell(0, -112, 60, 14); fillStroke('#b8b0a0', 3);
      if (life > 0) { for (let i = 0; i < 26; i++) { const k = ((t * 1.2 + i / 26) % 1); const ang = (i / 26 - .5) * 2.4; X.fillStyle = `rgba(190,230,255,${.9 - k * .6})`; ell(Math.sin(ang) * k * 150 * life, -112 - Math.sin(k * Math.PI) * 120 * life + k * 70, 5, 7); X.fill(); } } });
    if (t > 6) { person(360, 650, .62, { t, hair: 'tudung', hairC: '#7aa6c2', top: '#2f6fb5', expr: 'smile', ph: 1 }); person(920, 650, .62, { t, hair: 'short', skin: '#a8714c', top: '#2f6fb5', mustache: true, expr: 'smile', ph: 2 }); person(1040, 655, .6, { t, hair: 'long', top: '#2f6fb5', expr: 'smile', ph: 3, pose: 'wave' }); }
    allan(220, 680, .82, { t, pose: t > 6 ? 'cheer' : 'chin', expr: t > 6 ? 'grin' : 'worried', tan: .3 });
    if (t > 7.5) bigText(`種樹 ${trees} 棵`, 1060, 200, 48, '#fbf6ea', 1);
  }, subs: [[.4, 3.9, '剛來的時候，這個噴水池荒廢已久。', ''], [4.2, 7.4, '「我喜歡稱這噴水池為工廠的『活水』。」', 'Allan'], [7.8, 13.8, '「多年後再回來，可以很驕傲地說，這排樹是我任內種的。」', 'Allan']] },

 { d: 16, name: 'call', tag: ['2015.09.01', '又得回去工作崗位了'], draw(t, p) {
    if (t < 11.5) {
      X.fillStyle = '#0e1b21'; X.fillRect(0, 0, W, H);
      phoneFrame(80, 70, 520, 580, () => { room('#f6e7d0', '#d6b48a'); person(340, 640, 1.15, { t, hair: 'pigtails', dress: '#ff9fb6', expr: t > 6 ? 'worried' : 'normal', talk: (t > 1 && t < 4.5) || (t > 5 && t < 9.5), ph: 1 }); });
      phoneFrame(680, 70, 520, 580, () => { room('#d8cfbb', '#8b6a4e'); X.fillStyle = '#1a2a44'; X.fillRect(980, 100, 200, 160); allan(940, 700, 1.15, { t, expr: t < 4.5 ? 'normal' : t < 9.6 ? 'shock' : 'sad', shadow: false, tan: .3, sweat: t > 6 }); });
      if (t > 1 && t < 4.5) bubble(340, 210, '爸爸為什麼你要在國外工作？', { pop: inv(1, 1.3, t), fs: 26, max: 420 });
      if (t > 5 && t < 9.5) bubble(340, 210, '為什麼是你去，不是別人去？', { pop: inv(5, 5.3, t), fs: 26, max: 420 });
      if (t > 9.6) bigText('……', 940, 220, 80, '#fbf6ea', inv(9.6, 10, t));
    } else {
      X.fillStyle = '#101824'; X.fillRect(0, 0, W, H); X.fillStyle = '#2a3346'; X.fillRect(0, 470, W, 250);
      rr(160, 430, 760, 120, 20); fillStroke('#3d4a66'); rr(160, 400, 220, 60, 20); fillStroke('#e9e4d8');
      allan(520, 600, .8, { t, pose: 'sit', expr: 'sad', shadow: false });
      P(() => { X.fillStyle = '#0a0f16'; rr(980, 330, 200, 90, 10); X.fill(); X.font = `700 60px "DejaVu Sans Mono", monospace`; X.fillStyle = '#ff5050'; X.textAlign = 'center'; X.fillText('3:00', 1080, 395); });
    }
  }, subs: [[1, 4.5, '亮晶晶剛升小四。', ''], [5, 9.5, '「3年好久，你和我們一起生活，我那時候幾年級？」', '亮晶晶'], [11.6, 15.8, '「我語塞了，然後我失眠了……」', 'Allan']] },

 { d: 7, name: 'haze', tag: ['2015.10.29', '煙霾終於過去了'], draw(t, p) {
    sky(['#5d9bd6', '#bfe0f6']); cloud(300, 160, 1.2); cloud(900, 120, 1);
    X.fillStyle = '#7fb069'; X.fillRect(0, 520, W, 200); factory(640, 520, .9);
    allan(640, 700, 1, { t, expr: t > 3 ? 'teary' : 'shock', headTilt: -.15, tan: .35 });
    const haze = 1 - eio(inv(1, 3.5, t)); X.fillStyle = `rgba(160,155,140,${haze * .92})`; X.fillRect(0, 0, W, H);
    if (t > 3.5) for (let i = 0; i < 5; i++) sparkle(200 + i * 220, 120 + (i % 2) * 60, 12, t + i);
  }, subs: [[3, 6.8, '「沒想到有一天，我抬頭看到藍天，會感動到想哭……」', 'Allan']] },

 { d: 4, name: 'ch3', draw: (t, p) => chapter('第三章', '活水', '2016', p) },

 { d: 22, name: 'kindness', draw(t, p) {
    X.fillStyle = '#fbf6ea'; X.fillRect(0, 0, W, H);
    const panels = [[20, 20, 610, 330, 0], [650, 20, 610, 330, 5.5], [20, 370, 610, 330, 11], [650, 370, 610, 330, 16.5]];
    panels.forEach(([px, py, pw, ph, st], i) => {
      const k = eout(inv(st, st + .6, t)); if (k <= 0) return; const lt = t - st;
      P(() => { X.globalAlpha = k; X.translate(0, (1 - k) * 40); X.save(); rr(px, py, pw, ph, 4); X.clip();
        if (i === 0) { X.fillStyle = '#e9dfc9'; X.fillRect(px, py, pw, ph); desk(px + 40, py + 230, 520); P(() => { X.translate(px + 380, py + 230); rr(-24, -80, 48, 80, 8); fillStroke('#f2c46a'); X.fillStyle = '#fff'; X.fillRect(-4, -110, 8, 34); }); allan(px + 180, py + 370, .72, { t, expr: lt > 2 ? 'teary' : 'sad', tan: .45 }); person(px + 520, py + 360, .6, { t, hair: 'tudung', hairC: '#5a8f7b', top: '#2f6fb5', expr: 'smile', pose: 'offer' }); }
        if (i === 1) { X.fillStyle = '#f6d8a8'; X.fillRect(px, py, pw, ph); person(px + 140, py + 360, .62, { t, hair: 'bun', skin: '#9a6040', dress: '#e26a2c', sash: '#ffd36b', bindi: true, expr: 'smile', pose: 'offer', ph: 1 }); person(px + 280, py + 360, .6, { t, hair: 'short', skin: '#8a5636', top: '#2f6fb5', mustache: true, expr: 'grin', ph: 2 }); P(() => { X.translate(px + 330, py + 230); ell(0, 0, 50, 20); fillStroke('#c8902e'); X.fillStyle = '#a8551e'; ell(0, -6, 40, 12); X.fill(); for (let s = 0; s < 3; s++) { X.strokeStyle = 'rgba(255,255,255,.6)'; X.lineWidth = 3; X.beginPath(); for (let q = 0; q < 10; q++) X.lineTo(-20 + s * 20 + Math.sin(t * 3 + q * .6 + s) * 5, -20 - q * 6); X.stroke(); } }); allan(px + 490, py + 370, .72, { t, expr: 'grin', tan: .45 }); bubble(px + 210, py + 90, '呷！', { pop: inv(.5, .8, lt), fs: 34 }); }
        if (i === 2) { X.fillStyle = '#2a2f45'; X.fillRect(px, py, pw, ph); X.fillStyle = '#f6d58f'; for (let l = 0; l < 6; l++) { ell(px + 60 + l * 100, py + 40, 8, 8); X.fill(); } [0, 1, 2].forEach(n => person(px + 90 + n * 120, py + 370, .58, { t, hair: 'cap', capC: ['#d8414b', '#2f6fb5', '#7a5a2a'][n], skin: '#b07a52', top: ['#e2e2d0', '#9bbf6a', '#d77b8f'][n], expr: 'grin', pose: 'cheer', ph: n })); allan(px + 500, py + 370, .72, { t, pose: 'cheer', expr: 'grin', tan: .45 }); P(() => { X.translate(px + 470, py + 240); rr(-40, 0, 80, 50, 4); fillStroke('#c8902e'); X.font = `900 18px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText('BEER', 0, 32); }); bigText('Cheers!', px + 300, py + 60, 46, '#f2a24e', 1); }
        if (i === 3) { X.fillStyle = '#9fd0e8'; X.fillRect(px, py, pw, ph); X.fillStyle = '#c8b48d'; X.fillRect(px, py + 250, pw, 80); P(() => { X.translate(px + 300, py + 250); rr(-90, -70, 180, 70, 6); fillStroke('#d8414b'); X.fillStyle = '#fbf6ea'; X.fillRect(-100, -110, 200, 20); X.strokeRect(-100, -110, 200, 20); [-50, 0, 50].forEach(b => { rr(b - 18, -130, 36, 30, 6); fillStroke(['#ffb3c1', '#ffd36b', '#9fe0a8'][(b + 50) / 50], 2.5); }); }); for (let n = 0; n < 7; n++) person(px + 40 + n * 85 + (n > 2 ? 140 : 0) * 0, py + 360, .42, { t, hair: ['tudung', 'short', 'long', 'cap', 'tudung', 'short', 'bun'][n], hairC: ['#c25b7a', null, null, null, '#5a8f7b', null, null][n], skin: [SKIN, '#9a6040', SKIN, '#b07a52', SKIN, '#8a5636', SKIN][n], top: '#2f6fb5', expr: 'grin', hop: true, ph: n }); bigText('請全廠 200 多人喝水！', px + 300, py + 50, 36, '#0e1b21', 1, VOICE, 700); }
        X.restore(); rr(px, py, pw, ph, 4); fillStroke(null, 6, '#1b1b1f'); });
    });
  }, tag: ['2016', '有人情味的工廠'], subs: [[.6, 5.3, '「馬來同事放一杯飲料在我桌上，說看我很悶。轉頭進辦公室，突然紅了眼眶……」', 'Allan'], [6, 10.8, '「印度裔的員工提著很香的咖哩叫住我，心裡暖暖的。」', 'Allan'], [11.4, 16.2, '「同是天涯淪落人，你們離鄉的苦悶，我懂！」', 'Allan'], [16.8, 21.8, '「看到員工笑得很開心，就是一整個『爽』！」', 'Allan']] },

 { d: 9, name: 'deepavali', tag: ['2016.10.25', '公司大廳 · 屠妖節'], draw(t, p) {
    X.fillStyle = '#d8c7a6'; X.fillRect(0, 0, W, H); X.fillStyle = '#c4b08c'; X.fillRect(0, 300, W, 420);
    P(() => { X.translate(640, 470); X.scale(1, .45); const g = eout(inv(.3, 5, t)); const cols = ['#d8414b', '#f2a24e', '#ffd36b', '#5fb37a', '#6aa3d8', '#b46ad8'];
      for (let ring = 0; ring < 6; ring++) { const n = 8 + ring * 4, rr_ = 40 + ring * 46; if (g * 6 < ring) continue; for (let i = 0; i < n; i++) { P(() => { X.rotate(i * Math.PI * 2 / n + ring * .2); X.fillStyle = cols[(ring + i) % 6]; ell(0, -rr_, 14 + ring * 2, 26 + ring * 3); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 3; X.stroke(); }); } } X.fillStyle = '#ffd36b'; ell(0, 0, 30, 30); X.fill(); });
    for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2, lx = 640 + Math.cos(ang) * 400, ly = 470 + Math.sin(ang) * 170; X.fillStyle = '#c8902e'; ell(lx, ly, 16, 8); X.fill(); X.fillStyle = `rgba(255,${180 + Math.sin(t * 9 + i) * 40},80,.95)`; X.beginPath(); X.moveTo(lx, ly - 30 - Math.sin(t * 11 + i) * 4); X.quadraticCurveTo(lx + 8, ly - 10, lx, ly - 6); X.quadraticCurveTo(lx - 8, ly - 10, lx, ly - 30); X.fill(); }
    person(200, 470, .7, { t, hair: 'bun', skin: '#9a6040', dress: '#c2185b', sash: '#ffd36b', bindi: true, expr: 'smile', pose: 'wave', ph: 1 });
    person(1080, 480, .7, { t, hair: 'long', skin: '#8a5636', dress: '#7b3fa0', sash: '#f2a24e', bindi: true, expr: 'smile', ph: 2 });
    allan(1180, 700, .8, { t, expr: 'smile', tan: .5, dir: -1 });
    if (t > 5) bigText('Happy Deepavali!', 640, 120, 64, '#d8414b', inv(5, 5.6, t), VOICE, 700);
  }, subs: [[.6, 4.8, '「我把公司大廳開放給印度裔員工，布置他們屠妖節的圖騰。」', 'Allan'], [5, 8.8, '「就只是想在屬於他們的節日，表達公司的祝賀之意而已。」', 'Allan']] },

 { d: 11, name: 'seaback', tag: ['2016.07.24', '望著麻六甲海峽'], draw(t, p) {
    if (t < 3.6) { X.fillStyle = '#2f6fb5'; X.fillRect(0, 0, W, H); bigText('25 週年廠慶', 640, 300, 96, '#fbf6ea', eout(inv(0, .5, t))); petals(t, 50, 4); for (let n = 0; n < 9; n++) person(120 + n * 130, 720, .55, { t, hair: ['tudung', 'short', 'long', 'cap', 'tudung', 'bun', 'short', 'long', 'tudung'][n], skin: [SKIN, '#9a6040', SKIN, '#b07a52', SKIN, '#8a5636', SKIN, SKIN, SKIN][n], top: '#fbf6ea', expr: 'grin', pose: 'cheer', ph: n }); return; }
    sky(['#24324a', '#8c5a5a', '#f0a050']); sun(820, 420, 60); sea(430, t, '#9a5a3a', '#14232b', 820);
    X.fillStyle = '#2a2420'; X.beginPath(); X.moveTo(0, 720); X.lineTo(0, 560); X.quadraticCurveTo(200, 520, 420, 580); X.quadraticCurveTo(560, 610, 640, 720); X.fill();
    P(() => { X.translate(300, 560); X.scale(.9, .9); // Allan from behind, sitting
      rr(-50, -110, 100, 100, 30); fillStroke('#fbf6ea'); rr(-16, -126, 32, 24, 8); fillStroke(mixHex(SKIN, '#c98b5e', .55), 3); ell(-58, -164, 9, 13); fillStroke(mixHex(SKIN, '#c98b5e', .55), 3); ell(58, -164, 9, 13); fillStroke(mixHex(SKIN, '#c98b5e', .55), 3); ell(0, -172, 60, 62); fillStroke('#1e1a1c'); X.strokeStyle = 'rgba(255,255,255,.16)'; X.lineWidth = 3; X.beginPath(); X.arc(0, -180, 40, -2.6, -1.2); X.stroke(); });
    egrets(t, 5, 200, 'rgba(255,240,220,.8)', 25);
  }, subs: [[.3, 3.4, '「不是活動的內容，而是我真的看到當地員工發自內心的笑容。」', 'Allan'], [3.8, 10.8, '「回想這1年10個月的委屈、孤獨與辛苦……我的堅持和承諾，有了一個讓我自己都很感動的展現。」', 'Allan']] },

 { d: 9, name: 'xmas', tag: ['2016.12.24', '一個人的平安夜'], draw(t, p) {
    X.fillStyle = '#121a2a'; X.fillRect(0, 0, W, H); stars(t, 40, .6);
    const off = t * 40;
    for (let i = -1; i < 7; i++) { const x = i * 220 - (off % 220); rr(x, 180, 210, 360, 4); fillStroke(['#3a4a6a', '#4a3a5a', '#3a5a5a'][((i % 3) + 3) % 3], 3); for (let w = 0; w < 2; w++) for (let r = 0; r < 2; r++) { X.fillStyle = (i + w + r) % 3 ? '#f6d58f' : '#3a3a4a'; rr(x + 30 + w * 90, 220 + r * 100, 60, 60, 4); X.fill(); } X.strokeStyle = '#ffd36b'; X.lineWidth = 2; X.beginPath(); for (let b = 0; b < 10; b++) X.lineTo(x + b * 21, 186 + Math.sin(b) * 6); X.stroke(); for (let b = 0; b < 10; b++) { X.fillStyle = ['#d8414b', '#5fd38d', '#ffd36b'][b % 3]; X.globalAlpha = .5 + .5 * Math.sin(t * 5 + b + i); ell(x + b * 21, 190 + Math.sin(b) * 6, 4, 4); X.fill(); X.globalAlpha = 1; } }
    X.fillStyle = '#2a2a33'; X.fillRect(0, 540, W, 180);
    P(() => { X.fillStyle = '#d8414b'; rr(780, 100, 260, 60, 10); X.fill(); X.font = `900 34px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText('OLD TOWN', 910, 142); });
    allan(560, 690, .85, { t, pose: 'walk', expr: 'sad', tan: .55 });
    for (let i = 0; i < 20; i++) { X.fillStyle = 'rgba(255,255,255,.0)'; }
  }, subs: [[.5, 4.4, '「連續9天，宿舍只有我一人。機票都訂好了，計畫卻趕不上變化。」', 'Allan'], [4.6, 8.8, '「在異鄉街頭一個人毫無目的閒逛，真的有些心酸。」', 'Allan']] },

 { d: 7, name: 'phonecall', tag: ['2016.12.30', '最後一個上班日'], draw(t, p) {
    room('#dfe4e6', '#9a8a78'); desk(240, 430, 800);
    P(() => { const sh = t < 2.5 ? Math.sin(t * 60) * 6 : 0; X.translate(760 + sh, 430); rr(-60, -50, 120, 50, 10); fillStroke('#2a2f38'); if (t >= 2.5) return; rr(-70, -76, 140, 28, 12); fillStroke('#2a2f38'); });
    if (t < 2.5) { bigText('RING!', 760, 270, 56, '#d8414b', 1); exclaim(840, 320, 1); }
    allan(500, 650, .95, { t, pose: t > 2.5 ? 'phone' : 'stand', expr: t > 2.5 ? (t > 4.5 ? 'teary' : 'shock') : 'normal', tan: .55, talk: t > 3 && t < 4.5 });
    if (t > 2.6) bubble(980, 260, '2017/3/1 回台北總公司報到。', { pop: inv(2.6, 3, t), fs: 26 });
  }, subs: [[3, 6.8, '「在完全沒預期的狀況之下，將結束這趟奇幻之旅。一則以喜，一則以憂。」', 'Allan']] },

 { d: 4, name: 'ch4', draw: (t, p) => chapter('第四章', '終於結束的起點', '2017', p) },

 { d: 13, name: 'family', tag: ['2017.01.13', '檳城機場 · 接機'], draw(t, p) {
    X.fillStyle = '#e9eef2'; X.fillRect(0, 0, W, H); X.fillStyle = '#9fc2dc'; X.fillRect(0, 60, W, 380); X.strokeStyle = '#c9d4dc'; X.lineWidth = 10; for (let i = 0; i < 7; i++) { X.beginPath(); X.moveTo(i * 220, 60); X.lineTo(i * 220, 440); X.stroke(); }
    P(() => { X.translate(900 - t * 30, 330); X.fillStyle = '#fbf6ea'; rr(-260, -30, 520, 60, 30); X.fill(); X.fillStyle = '#d8414b'; X.beginPath(); X.moveTo(180, -30); X.lineTo(230, -110); X.lineTo(260, -110); X.lineTo(240, -30); X.fill(); });
    X.fillStyle = '#c9c2b4'; X.fillRect(0, 440, W, 280);
    if (t < 7) { const k = eio(inv(.5, 3, t)); person(lerp(1180, 760, k), 660, .9, { t, hair: 'long', dress: '#d77b8f', expr: 'grin', pose: 'wave' }); person(lerp(1280, 640, k), 680, .66, { t, hair: 'pigtails', dress: '#ff9fb6', expr: 'grin', pose: 'cheer', hop: k >= 1 }); allan(360, 680, .95, { t, pose: k >= 1 ? 'hug' : 'wave', expr: k >= 1 ? 'cry' : 'grin', tan: .6 }); if (k >= 1) for (let i = 0; i < 5; i++) heart(420 + i * 60, 260 - ((t * 40 + i * 30) % 100), 1.1); }
    else { X.fillStyle = '#e9c27a'; X.fillRect(0, 0, W, H); P(() => { X.translate(640, 380); X.rotate(-.1); X.beginPath(); X.moveTo(0, -260); X.lineTo(-90, 120); X.lineTo(90, 120); X.closePath(); fillStroke('#f6dfa0'); X.strokeStyle = 'rgba(160,110,40,.4)'; X.lineWidth = 2; for (let l = 0; l < 10; l++) { X.beginPath(); X.moveTo(-9 * l, -260 + l * 38); X.lineTo(9 * l, -260 + l * 38); X.stroke(); } }); person(330, 700, .8, { t, hair: 'pigtails', dress: '#ff9fb6', expr: 'grin', pose: 'cheer' }); allan(960, 700, .9, { t, expr: 'grin', tan: .6, dir: -1 }); bubble(330, 300, 'Roti Tissue 真好吃！', { pop: inv(7.3, 7.7, t), fs: 26 }); }
  }, subs: [[.6, 6.6, '老婆和亮晶晶，第一次來到他在南洋的「狗窩」。', ''], [7, 12.8, '「上一次跟老婆一起搭飛機，是18年前，度蜜月。」', 'Allan']] },

 { d: 13, name: 'puzzle', tag: ['2017.02', '最後拼圖之旅'], draw(t, p) {
    X.fillStyle = '#16303a'; X.fillRect(0, 0, W, H);
    const pcs = [['升旗山', '#7fb6de', 0], ['邦咯島 · 犀鳥', '#5fb3a0', 1], ['椰殼洞', '#8a7a66', 2], ['極樂寺', '#d8414b', 3]];
    pcs.forEach(([name, c, i]) => { const k = back(clamp(inv(.5 + i * 2.2, 1.4 + i * 2.2, t))); if (k <= 0) return; const gx = 290 + (i % 2) * 350, gy = 40 + Math.floor(i / 2) * 250, sx = lerp([-300, 1500, -300, 1500][i], gx, k);
      P(() => { X.translate(sx, gy); rr(0, 0, 340, 230, 16); fillStroke(c, 5, '#0e1b21'); X.save(); rr(0, 0, 340, 230, 16); X.clip(); X.translate(0, -15);
        if (i === 0) { X.fillStyle = '#4f7d33'; X.beginPath(); X.moveTo(0, 260); X.lineTo(170, 40); X.lineTo(340, 260); X.fill(); X.strokeStyle = '#e9e4d8'; X.lineWidth = 6; X.beginPath(); X.moveTo(60, 260); X.lineTo(200, 60); X.stroke(); rr(120, 120 - (t * 20 % 60), 40, 26, 4); fillStroke('#d8414b', 3); }
        if (i === 1) { X.fillStyle = '#e9d9a8'; X.fillRect(0, 190, 340, 70); X.fillStyle = '#2f7a5a'; ell(260, 190, 100, 70); X.fill(); P(() => { X.translate(120 + Math.sin(t * 2) * 40, 90); X.fillStyle = '#1b1b1f'; ell(0, 0, 34, 14); X.fill(); X.fillStyle = '#ffd36b'; X.beginPath(); X.moveTo(30, -6); X.lineTo(70, 4); X.lineTo(30, 8); X.fill(); X.fillStyle = '#d8414b'; ell(36, -12, 10, 6); X.fill(); X.strokeStyle = '#1b1b1f'; X.lineWidth = 6; X.beginPath(); X.moveTo(-10, 0); X.lineTo(-30, -30 + Math.sin(t * 10) * 20); X.stroke(); }); }
        if (i === 2) { X.fillStyle = '#3a2f26'; X.beginPath(); X.ellipse(170, 260, 150, 200, 0, Math.PI, 0); X.fill(); X.fillStyle = '#d9c9a8'; for (let s = 0; s < 6; s++) { X.beginPath(); X.moveTo(40 + s * 50, 60 + (s % 2) * 20); X.lineTo(52 + s * 50, 140); X.lineTo(64 + s * 50, 60 + (s % 2) * 20); X.fill(); } }
        if (i === 3) { X.fillStyle = '#1a1c2a'; X.fillRect(0, 0, 340, 260); for (let l = 0; l < 6; l++) { X.fillStyle = '#f6d58f'; rr(130 + l * 4, 40 + l * 30, 80 - l * 8, 26, 3); X.fill(); } for (let l = 0; l < 14; l++) { X.fillStyle = `rgba(255,${100 + l * 8},80,${.6 + .4 * Math.sin(t * 4 + l)})`; ell(20 + l * 23, 230 + Math.sin(l) * 8, 7, 9); X.fill(); } }
        X.restore(); X.font = `700 28px ${VOICE}`; X.fillStyle = '#fbf6ea'; X.textAlign = 'center'; X.lineWidth = 6; X.strokeStyle = '#0e1b21'; X.strokeText(name, 170, 212); X.fillText(name, 170, 212); });
    });
    if (t > 10) bigText('拼圖完成！', 1120, 300, 54, '#f2a24e', inv(10, 10.5, t));
  }, subs: [[.6, 5.6, '「來馬來西亞2年多，檳城都熟到不行，就是沒去過升旗山。」', 'Allan'], [5.8, 12.8, '確定外派即將結束，他把還沒去過的地方，一塊一塊補齊。', '']] },

 { d: 11, name: 'byebike', tag: ['2017.02.20', '再見，阿強一號'], draw(t, p) {
    sky(['#2b3d5a', '#c06a4a', '#f2b060']); sun(900, 450, 60); paddy(450, t, '#4f6f3a', '#3f5f2f'); for (let i = 0; i < 5; i++) palm(80 + i * 290, 460, 200 + (i % 2) * 70, 12, '#1a2420', t);
    egrets(t, 8, 150, 'rgba(255,240,220,.85)', 30);
    X.fillStyle = '#5a5248'; X.fillRect(0, 600, W, 120);
    if (t < 5.5) { bike(lerp(-200, 640, eout(inv(0, 4, t))), 650, .9, t, { rider: { t, expr: 'smile', tan: .65 }, speed: t < 4 ? 8 : 0 }); }
    else { bike(820, 650, .85, 0, { face: true, speed: 0 }); allan(540, 660, .9, { t, expr: 'teary', tan: .65, pose: 'wave' }); if (t > 7) bubble(820, 380, '謝謝你，夥伴。', { pop: inv(7, 7.4, t), fs: 26 }); }
  }, subs: [[.6, 5.2, '「上山下海，晨曦、午後豔陽、黃昏景象，都有我和阿強一號在南洋的足跡。」', 'Allan'], [5.6, 10.8, '「這2年多，多虧有阿強一號的陪伴。美麗的結局，美麗的回憶！」', 'Allan']] },

 { d: 11, name: 'farewell', tag: ['2017.02.24', '最後一天'], draw(t, p) {
    sky(['#7fb6de', '#f6e8c8']); factory(640, 420, 1.1); X.fillStyle = '#7fb069'; X.fillRect(0, 420, W, 300);
    P(() => { X.fillStyle = '#fbf6ea'; rr(240, 200, 800, 70, 8); X.fill(); X.strokeStyle = INK; X.lineWidth = 4; X.stroke(); X.font = `900 38px ${DISP}`; X.fillStyle = '#d8414b'; X.textAlign = 'center'; X.fillText('Terima kasih, Allan! 謝謝你！', 640, 248); });
    const crew = [['tudung', '#c25b7a', SKIN], ['short', null, '#9a6040'], ['long', null, SKIN], ['cap', null, '#b07a52'], ['tudung', '#5a8f7b', SKIN], ['bun', null, '#8a5636'], ['short', null, SKIN], ['tudung', '#7aa6c2', SKIN]];
    crew.forEach(([h, hc, sk], n) => { if (n === 4) return; person(110 + n * 150 + (n > 4 ? 0 : 0), 690, .62, { t, hair: h, hairC: hc, skin: sk, top: '#2f6fb5', expr: t > 6 ? 'teary' : 'grin', pose: 'wave', ph: n }); });
    allan(110 + 4 * 150, 700, .82, { t, expr: t > 6 ? 'cry' : 'grin', tan: .65, pose: 'wave' });
    P(() => { X.globalAlpha = .8; petals(t, 14, 9); });
  }, subs: [[.5, 5.4, '「2年5個月的緣分，走到了最後一天……」', 'Allan'], [5.8, 10.8, '「再見，南洋的朋友們！最後一夜，我用馬來西亞的天氣來想你。」', 'Allan']] },

 { d: 12, name: 'home', tag: ['2017.02.25', 'PEN → TPE'], draw(t, p) {
    if (t < 6.5) {
      planeWindow(t, () => { sky(['#e48b45', '#f6c27a', '#bfe0f6']); for (let i = 0; i < 6; i++) cloud(((i * 260 + t * 70) % 1500) - 100, 400 + (i % 3) * 40, 1.3, '#ffe9cf', .95); });
      allan(240, 780, 1.1, { t, expr: 'closed', tan: .65, shadow: false, pose: 'hold' }); figurine(250, 600, .7, t);
    } else { const k = eio(inv(6.8, 11.5, t)); regionMap(t, [100.28, 5.30, '檳城'], [121.23, 25.08, '台北 · 家'], k); }
  }, subs: [[.5, 6.3, '「阿拉蕾，我們2年多的奇幻旅行到了終點，收拾滿滿的祝福要回家了。」', 'Allan'], [6.8, 11.8, '「謝謝所有馬來西亞的朋友。I\'ll miss you.」', 'Allan']] },

 { d: 18, name: 'medal', draw(t, p) {
    const g = X.createRadialGradient(W / 2, 200, 50, W / 2, 360, 800); g.addColorStop(0, '#1f4250'); g.addColorStop(1, '#0e1b21'); X.fillStyle = g; X.fillRect(0, 0, W, H);
    const drop = eout(inv(.3, 2, t)); const ang = t * 1.4 + (1 - drop) * 6;
    P(() => { X.translate(W / 2 - 250, lerp(-400, 0, drop));
      X.fillStyle = '#e6c27a'; X.beginPath(); X.moveTo(-70, 0); X.lineTo(70, 0); X.lineTo(70, 160); X.lineTo(0, 200); X.lineTo(-70, 160); X.fill(); X.fillStyle = '#d8414b'; X.fillRect(-46, 0, 92, 150); X.fillStyle = '#f2a24e'; X.fillRect(-16, 0, 32, 175);
      X.translate(0, 340); X.scale(Math.cos(ang), 1);
      const front = Math.cos(ang) >= 0;
      X.fillStyle = '#a8812f'; ell(0, 0, 150, 150); X.fill(); const gg = X.createRadialGradient(-40, -50, 20, 0, 0, 150); gg.addColorStop(0, '#fbe6a8'); gg.addColorStop(.5, '#e6c27a'); gg.addColorStop(1, '#8e6a22'); X.fillStyle = gg; ell(0, 0, 138, 138); X.fill();
      X.strokeStyle = '#7a5a1c'; X.lineWidth = 2; ell(0, 0, 100, 100); X.stroke();
      if (front) { X.fillStyle = '#f6dc96'; ell(0, 20, 40, 40); X.fill(); X.fillStyle = '#c9a24f'; X.fillRect(-98, 22, 196, 60); X.save(); ell(0, 0, 99, 99); X.clip(); X.fillStyle = '#c9a24f'; X.fillRect(-100, 22, 200, 80); X.restore(); X.strokeStyle = '#5a4012'; X.lineWidth = 3; ell(-26, 58, 14, 14); X.stroke(); ell(26, 58, 14, 14); X.stroke(); X.beginPath(); X.moveTo(-26, 58); X.lineTo(-6, 36); X.lineTo(18, 36); X.lineTo(26, 58); X.stroke(); X.font = `900 20px ${DISP}`; X.fillStyle = '#5a4012'; X.textAlign = 'center'; X.fillText('2014 — 2017', 0, -40); X.font = `700 16px ${VOICE}`; X.fillText('南洋奇幻之旅', 0, -66); }
      else { X.scale(-1, 1); X.font = `900 54px ${DISP}`; X.fillStyle = '#5a4012'; X.textAlign = 'center'; X.fillText('878', 0, 10); X.font = `700 18px ${VOICE}`; X.fillText('個南洋的日子', 0, 44); X.fillText('一步一腳印', 0, -46); }
    });
    if (t > 2) P(() => { X.globalAlpha = .55; petals(t - 2, 22, 12); });
    const a1 = eout(inv(3, 4.5, t)), a2 = eout(inv(6.5, 8, t)), a3 = eout(inv(10, 11.5, t));
    P(() => { X.textAlign = 'left'; X.globalAlpha = a1; X.font = `700 26px ${VOICE}`; X.fillStyle = '#e6c27a'; X.fillText('人生勳章', 660, 180);
      X.font = `900 56px ${DISP}`; X.fillStyle = '#fbf6ea'; X.fillText('南洋奇幻之旅', 660, 250);
      X.globalAlpha = a2; X.font = `400 30px ${VOICE}`; X.fillStyle = '#fbf6ea'; ['878 天 · 357 篇日誌', '100 棵樹 · 200 多位夥伴', '一台叫阿強一號的腳踏車'].forEach((l, i) => X.fillText(l, 660, 320 + i * 48));
      X.globalAlpha = a3; X.font = `700 34px ${VOICE}`; X.fillStyle = '#f2a24e'; X.fillText('「這一切，終於都成了『曾經』。」', 660, 510); });
    const end = eout(inv(14.5, 16, t)); if (end > 0) { X.fillStyle = `rgba(8,14,18,${end * .92})`; X.fillRect(0, 0, W, H); bigText('Allan 下南洋', 640, 300, 70, '#fbf6ea', end); P(() => { X.globalAlpha = end; X.font = `400 24px ${VOICE}`; X.fillStyle = '#93a9ad'; X.textAlign = 'center'; X.fillText('原作：「Allan下南洋」部落格 2014–2017 · 引文皆為 Allan 原文', 640, 380); X.fillText('角色、分鏡、繪製與配樂：Claude', 640, 420); }); }
  } },
];

let acc = 0; SHOTS.forEach(s => { s.start = acc; acc += s.d; });
const TOTAL = acc;

function renderFrame(T) {
  const s = SHOTS.find(x => T >= x.start && T < x.start + x.d) || SHOTS[SHOTS.length - 1];
  const t = T - s.start, p = t / s.d;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
  X.clearRect(0, 0, W, H);
  P(() => s.draw(t, p));
  if (s.tag) tag(s.tag[0], s.tag[1], eout(inv(.2, .8, t)) * (1 - inv(s.d - .6, s.d - .1, t)));
  (s.subs || []).forEach(([a, b, txt, who]) => { const al = inv(a, a + .35, t) * (1 - inv(b - .35, b, t)); subtitle(txt, al, who); });
  // cut fades
  const f = Math.max(1 - inv(0, .35, t), inv(s.d - .35, s.d, t)) * (s.name === 'open' && t < .35 ? 1 : 1);
  if (f > 0) { X.fillStyle = `rgba(0,0,0,${f})`; X.fillRect(0, 0, W, H); }
  // letterbox film grain-ish line
  X.fillStyle = 'rgba(0,0,0,1)';
}

window.TOTAL = TOTAL; window.FPS = FPS; window.SHOTS = SHOTS.map(s => ({ name: s.name, start: s.start, d: s.d }));
window.renderFrame = renderFrame;
window.ALLTEXT = SHOTS.flatMap(s => [...(s.subs || []).map(x => x[2] + (x[3] || '')), ...(s.tag || [])]).join('') + '0123456789第一二三四章提起勇氣奇幻之旅活水終於結束的起點高職電工二專工管大學企管資訊工作年講師南洋爸爸拍天上雲給我看咔嚓！亮晶晶腳踏車行騎到吉隆坡都沒問題種樹棵為什麼你要在國外是去不別人呷請全廠多喝水週年廠慶謝謝你夥伴拼圖完成升旗山邦咯島犀鳥椰殼洞極樂寺台北家檳城約人生勳章天篇日誌樹位一台叫阿強號的這切都成了曾經原作角色分鏡繪製與配樂引文皆為原文部落格Roti Tissue真好吃總公司報到';
window.ready = (async () => { await Promise.all([`400 34px ${VOICE}`, `700 34px ${VOICE}`, `900 60px ${DISP}`].map(f => document.fonts.load(f, window.ALLTEXT))); await document.fonts.ready; return true; })();
if (!/render/.test(location.search)) {
  let t0 = null; const q = new URLSearchParams(location.search); const startAt = +(q.get('t') || 0);
  window.ready.then(() => { const loop = ts => { if (t0 === null) t0 = ts; const T = (startAt + (ts - t0) / 1000) % TOTAL; renderFrame(T); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
}
