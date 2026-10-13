/* 主角 Allan：直接使用上傳的角色設定圖（去背後的剪紙偶），配角以同樣的粗黑描邊漫畫風格繪製。 */
const SPR = {};
const SPRITES = ['stand', 'wave', 'front', 'threeq', 'side', 'back', 'x_smile', 'x_laugh', 'x_think', 'x_surprised', 'x_explain', 'x_worried', 'x_cry', 'x_wink', 'x_talk'];
const spritesReady = Promise.all(SPRITES.map(n => new Promise(res => { const im = new Image(); im.onload = () => { SPR[n] = im; res(); }; im.src = 'sprites/' + n + '.png'; })));

/* full-body puppet: bottom-centre at (x,y), height h */
function allanFull(x, y, h, o = {}) {
  const im = SPR[o.pose || 'front'], t = o.t || 0; if (!im) return;
  const w = h * im.width / im.height;
  let dy = 0, rot = 0, sx = 1, sy = 1 + Math.sin(t * 2.4 + (o.ph || 0)) * .008;
  if (o.walk) { const p = t * (o.pace || 7); dy = -Math.abs(Math.sin(p)) * h * .025; rot = Math.sin(p) * .035; sy = 1 - Math.abs(Math.cos(p)) * .012; }
  if (o.hop) { dy = -Math.abs(Math.sin(t * 6 + (o.ph || 0))) * h * .07; }
  if (o.sway) rot += Math.sin(t * 2) * o.sway;
  P(() => { X.translate(x, y + dy); X.rotate(rot + (o.rot || 0)); X.scale((o.flip ? -1 : 1) * sx, sy); X.globalAlpha = o.alpha ?? 1;
    if (o.shadow !== false) { X.fillStyle = 'rgba(30,40,80,.22)'; ell(0, -dy + 2, w * .42, h * .025); X.fill(); }
    X.drawImage(im, -w / 2, -h, w, h); });
}
/* expression bust: bottom-centre at (x, y=H by default), height h */
function allanBust(name, x, h, o = {}) {
  const im = SPR['x_' + name], t = o.t || 0; if (!im) return;
  const w = h * im.width / im.height, y = o.y ?? H;
  const bob = Math.sin(t * 2.2 + (o.ph || 0)) * h * .006 + (o.nod ? Math.abs(Math.sin(t * 7)) * h * .012 : 0) + (o.shake ? Math.sin(t * 30) * h * .004 : 0);
  P(() => { X.translate(x, y + bob); X.rotate(o.rot || Math.sin(t * 1.3) * .012); if (o.flip) X.scale(-1, 1); X.globalAlpha = o.alpha ?? 1; X.drawImage(im, -w / 2, -h, w, h * 1.002); });
}
/* talking: alternate two busts like limited animation (mouth flaps) */
function allanTalk(x, h, t, a = 'talk', b = 'smile', o = {}) { allanBust(Math.floor(t * 5) % 2 ? a : b, x, h, { ...o, t }); }
/* waving half-body: the raised forearm rotates around the elbow */
const ARM = [[0, 460], [300, 460], [300, 640], [350, 800], [345, 880], [275, 1010], [170, 1010], [110, 800], [0, 730]], PIVOT = [300, 975];
function allanWave(x, y, h, o = {}) {
  const im = SPR.wave, t = o.t || 0; if (!im) return;
  const s = h / im.height, ang = Math.sin(t * (o.speed || 8)) * .14;
  P(() => { X.translate(x, y + Math.sin(t * 2.2) * h * .005); if (o.flip) X.scale(-1, 1); X.scale(s, s); X.translate(-im.width / 2, -im.height);
    P(() => { X.beginPath(); X.rect(-50, -50, im.width + 100, im.height + 100); X.moveTo(ARM[0][0], ARM[0][1]); ARM.slice(1).forEach(p => X.lineTo(p[0], p[1])); X.closePath(); X.clip('evenodd'); X.drawImage(im, 0, 0); });
    P(() => { X.translate(PIVOT[0], PIVOT[1]); X.rotate(ang); X.translate(-PIVOT[0], -PIVOT[1]); X.beginPath(); X.moveTo(ARM[0][0], ARM[0][1]); ARM.slice(1).forEach(p => X.lineTo(p[0], p[1])); X.closePath(); X.clip(); X.drawImage(im, 0, 0); });
  });
}
/* Allan riding 阿強一號: upper body from the side view on the saddle, pedalling legs drawn */
function allanBike(x, y, s, t, o = {}) {
  const im = SPR.side; if (!im) return; const spin = t * (o.speed ?? 8);
  P(() => { X.translate(x, y); X.scale(s, s);
    X.fillStyle = 'rgba(30,40,80,.2)'; ell(0, 2, 130, 10); X.fill();
    const OL = '#1e1a1a';
    const wheel = wx => P(() => { X.translate(wx, -50); ell(0, 0, 50, 50); X.lineWidth = 11; X.strokeStyle = OL; X.stroke(); X.lineWidth = 7; X.strokeStyle = '#3a3a44'; X.stroke(); X.lineWidth = 2; X.strokeStyle = '#b8c0cc'; X.rotate(spin); for (let i = 0; i < 12; i++) { X.rotate(Math.PI / 6); X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 44); X.stroke(); } ell(0, 0, 7, 7); X.fillStyle = '#d8d8e0'; X.fill(); X.lineWidth = 2.5; X.strokeStyle = OL; X.stroke(); });
    wheel(-78); wheel(78);
    const frame = (c, w) => { X.strokeStyle = c; X.lineWidth = w; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(-78, -50); X.lineTo(-12, -52); X.lineTo(-34, -124); X.lineTo(-78, -50); X.moveTo(-12, -52); X.lineTo(48, -122); X.lineTo(-34, -124); X.moveTo(48, -122); X.lineTo(78, -50); X.moveTo(48, -122); X.lineTo(44, -148); X.lineTo(70, -152); X.stroke(); };
    frame(OL, 12); frame('#2e2e38', 7); X.strokeStyle = '#ff8a3a'; X.lineWidth = 3.5; X.beginPath(); X.moveTo(-6, -62); X.lineTo(40, -114); X.stroke();
    // legs (khaki) + orange sneakers
    const ped = spin * .6;
    [0, Math.PI].forEach((ph, j) => { const px = -12 + Math.cos(ped + ph) * 19, py = -52 + Math.sin(ped + ph) * 19, kx = (px - 30) / 2 + 22, ky = (py - 150) / 2 - 12;
      P(() => { X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = OL; X.lineWidth = 32; X.beginPath(); X.moveTo(-30, -150); X.lineTo(kx, ky); X.lineTo(px, py); X.stroke(); X.strokeStyle = j ? '#a8916a' : '#c8b088'; X.lineWidth = 25; X.stroke();
        X.beginPath(); X.ellipse(px + 10, py + 4, 20, 10, 0, 0, 7); X.fillStyle = '#ff8a3a'; X.fill(); X.lineWidth = 3; X.strokeStyle = OL; X.stroke(); X.fillStyle = '#fff'; X.fillRect(px + 2, py + 1, 14, 3); }); });
    X.beginPath(); X.roundRect(-58, -140, 46, 12, 5); X.fillStyle = '#2e2e38'; X.fill(); X.lineWidth = 2.5; X.strokeStyle = OL; X.stroke();
    // upper body from the side sprite (crop above the hips)
    const cropH = im.height * .6, dh = 300, dw = dh * im.width / cropH;
    P(() => { X.translate(-14, -148); X.rotate(.12); X.drawImage(im, 0, 0, im.width, cropH, -dw * .55, -dh, dw, dh); });
    // arm to handlebar
    P(() => { X.lineCap = 'round'; X.strokeStyle = OL; X.lineWidth = 22; X.beginPath(); X.moveTo(10, -330 + 95); X.lineTo(62, -150); X.stroke(); X.strokeStyle = '#f2c4a0'; X.lineWidth = 16; X.stroke(); ell(64, -148, 12, 12); X.fillStyle = '#f2c4a0'; X.fill(); X.lineWidth = 3; X.strokeStyle = OL; X.stroke(); });
  });
}

/* supporting cast — caricature style with thick black outline */
const OL = '#1e1a1a';
const SK = { light: ['#ffd9be', '#f0b896'], tan: ['#e8b48a', '#c88e64'], brown: ['#c48a5e', '#a06a44'], deep: ['#9a6644', '#7a4c30'] };
function ol(lw) { X.lineWidth = lw; X.strokeStyle = OL; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); }
function fo(c, lw) { X.fillStyle = c; X.fill(); ol(lw); }
function pal(x, y, h, o = {}) {
  const t = o.t || 0, sk = SK[o.skin || 'light'], lw = Math.max(2.5, h * .013), r = h * .19;
  const hop = o.hop ? Math.abs(Math.sin(t * 6 + (o.ph || 0))) * h * .07 : 0, br = Math.sin(t * 2.3 + (o.ph || 0)) * h * .004;
  P(() => { X.translate(x, y - hop); if (o.flip) X.scale(-1, 1);
    X.fillStyle = 'rgba(30,40,80,.2)'; ell(0, hop + 2, h * .2, h * .028); X.fill();
    const bodyTop = -h + r * 1.85, hip = -h * .36;
    // legs / dress
    if (o.dress) { X.beginPath(); X.moveTo(-h * .12, bodyTop + h * .02); X.lineTo(h * .12, bodyTop + h * .02); X.lineTo(h * .2, -h * .1); X.quadraticCurveTo(0, -h * .07, -h * .2, -h * .1); X.closePath(); fo(o.dress, lw); [-1, 1].forEach(sd => { X.beginPath(); X.roundRect(sd * h * .07 - h * .03, -h * .11, h * .06, h * .1, h * .02); fo(sk[0], lw * .8); X.beginPath(); X.ellipse(sd * h * .07, -h * .01, h * .05, h * .022, 0, 0, 7); fo(o.shoe || '#ff7a5a', lw * .8); }); if (o.sash) { X.beginPath(); X.moveTo(-h * .11, bodyTop + h * .03); X.lineTo(-h * .04, bodyTop + h * .03); X.lineTo(h * .17, -h * .18); X.lineTo(h * .13, -h * .14); X.closePath(); fo(o.sash, lw * .8); } }
    else { [-1, 1].forEach(sd => { X.beginPath(); X.roundRect(sd * h * .055 - h * .045, hip, h * .09, -hip - h * .02, h * .03); fo(o.pants || '#3a4a7a', lw); X.beginPath(); X.ellipse(sd * h * .06 + h * .01, -h * .015, h * .06, h * .025, 0, 0, 7); fo(o.shoe || '#5a3a2a', lw * .8); });
      X.beginPath(); X.roundRect(-h * .13, bodyTop, h * .26, hip - bodyTop + h * .04, h * .06); fo(o.top || '#5aa6ec', lw); X.beginPath(); X.moveTo(-h * .05, bodyTop + 1); X.lineTo(0, bodyTop + h * .06); X.lineTo(h * .05, bodyTop + 1); fo('#ffffff', lw * .7); }
    // arms
    const wv = Math.sin(t * 9 + (o.ph || 0)) * .3;
    const ang = { down: [.15, -.15], wave: [.15, -2.5 + wv], cheer: [2.6 - wv * .5, -2.6 + wv * .5], hold: [-.6, .6], clap: [-.9 + Math.abs(wv), .9 - Math.abs(wv)] }[o.pose || 'down'];
    [-1, 1].forEach((sd, i) => P(() => { X.translate(sd * h * .12, bodyTop + h * .05); X.rotate(ang[i]); X.beginPath(); X.roundRect(-h * .035, 0, h * .07, h * .25, h * .035); fo(o.dress || o.top || '#5aa6ec', lw); ell(0, h * .26, h * .04, h * .04); fo(sk[0], lw * .8); if (o.holdItem && i === 1) P(() => { X.translate(0, h * .28); o.holdItem(h); }); }));
    // head
    P(() => { X.translate(0, -h + r * .95);
      const hs = o.hair || 'short', hc = o.hairC || '#2a1e1e';
      if (hs === 'hijab') { X.beginPath(); X.moveTo(-r * 1.15, 0); X.bezierCurveTo(-r * 1.2, -r * 1.5, r * 1.2, -r * 1.5, r * 1.15, 0); X.bezierCurveTo(r * 1.3, r * 1.1, r * .6, r * 1.45, 0, r * 1.5); X.bezierCurveTo(-r * .6, r * 1.45, -r * 1.3, r * 1.1, -r * 1.15, 0); fo(o.hijabC || '#ff7aa8', lw); }
      if (hs === 'long') { X.beginPath(); X.moveTo(-r * 1.05, -r * .2); X.lineTo(-r * 1.1, r * 1.5); X.lineTo(r * 1.1, r * 1.5); X.lineTo(r * 1.05, -r * .2); X.closePath(); fo(hc, lw); }
      if (hs === 'pigtails') [-1, 1].forEach(sd => { X.beginPath(); X.ellipse(sd * r * 1.15, r * .4 + Math.sin(t * 6 + sd) * r * .05, r * .3, r * .55, sd * .3, 0, 7); fo(hc, lw); ell(sd * r * .98, -r * .05, r * .14, r * .14); fo('#ff7aa8', lw * .7); });
      if (hs === 'bun') { ell(0, -r * 1.05, r * .38, r * .3); fo(hc, lw); }
      // ears + face
      if (hs !== 'hijab') [-1, 1].forEach(sd => { ell(sd * r * .98, r * .1, r * .17, r * .22); fo(sk[0], lw * .8); });
      ell(0, 0, r, r * 1.02); fo(sk[0], lw);
      X.save(); ell(0, 0, r, r * 1.02); X.clip(); X.fillStyle = sk[1]; ell(-r * .9, r * .3, r * .5, r * 1.1); X.fill(); X.restore(); ell(0, 0, r, r * 1.02); ol(lw);
      // hair front
      X.fillStyle = hc;
      if (hs === 'short' || hs === 'cap') { X.beginPath(); X.moveTo(-r * 1.02, -r * .05); X.bezierCurveTo(-r * 1.05, -r * 1.3, r * 1.05, -r * 1.3, r * 1.02, -r * .05); X.quadraticCurveTo(r * .7, -r * .5, r * .2, -r * .45); X.quadraticCurveTo(-r * .3, -r * .62, -r * 1.02, -r * .05); fo(hc, lw); }
      if (hs === 'long' || hs === 'pigtails' || hs === 'bun') { X.beginPath(); X.moveTo(-r * 1.05, r * .2); X.bezierCurveTo(-r * 1.1, -r * 1.3, r * 1.1, -r * 1.3, r * 1.05, r * .2); X.quadraticCurveTo(r * .8, -r * .5, 0, -r * .45); X.quadraticCurveTo(-r * .8, -r * .5, -r * 1.05, r * .2); fo(hc, lw); }
      if (hs === 'hijab') { X.beginPath(); X.moveTo(-r * 1.0, -r * .1); X.bezierCurveTo(-r * .9, -r * 1.25, r * .9, -r * 1.25, r * 1.0, -r * .1); X.quadraticCurveTo(0, -r * .7, -r * 1.0, -r * .1); fo(o.hijabC || '#ff7aa8', lw); }
      if (hs === 'cap') { X.beginPath(); X.moveTo(-r * 1.02, -r * .25); X.bezierCurveTo(-r, -r * 1.35, r, -r * 1.35, r * 1.02, -r * .25); X.closePath(); fo(o.capC || '#e84a3a', lw); X.beginPath(); X.ellipse(r * .2, -r * .28, r * 1.05, r * .2, 0, 0, 7); fo(o.capC || '#e84a3a', lw); }
      // face
      const ex = o.expr || 'smile', blink = ((t + (o.ph || 0)) % 3.9) > 3.78;
      [-1, 1].forEach(sd => { const ex_ = sd * r * .36, ey = r * .02;
        if (ex === 'happy' || blink) { X.beginPath(); X.moveTo(ex_ - r * .14, ey + r * .04); X.quadraticCurveTo(ex_, ey - r * .12, ex_ + r * .14, ey + r * .04); ol(lw * 1.1); }
        else { ell(ex_, ey, r * .1, r * .14); X.fillStyle = OL; X.fill(); ell(ex_ - r * .03, ey - r * .05, r * .04, r * .04); X.fillStyle = '#fff'; X.fill(); }
        X.beginPath(); X.moveTo(ex_ - r * .16, ey - r * .26); X.quadraticCurveTo(ex_, ey - r * .34, ex_ + r * .16, ey - r * .26); ol(lw * .8);
        X.fillStyle = 'rgba(255,110,110,.32)'; ell(sd * r * .55, r * .32, r * .17, r * .1); X.fill(); });
      if (o.teary) { X.fillStyle = '#8ad0ff'; [-1, 1].forEach(sd => { const k = (t * 1.2 + (sd > 0 ? .5 : 0)) % 1; ell(sd * r * .42, r * (.2 + k * .5), r * .05, r * .08); X.fill(); }); }
      X.beginPath(); X.moveTo(r * .02, r * .12); X.quadraticCurveTo(r * .1, r * .25, r * -.04, r * .28); ol(lw * .7);
      if (ex === 'grin' || ex === 'happy' || (o.talk && Math.sin(t * 13) > 0)) { X.beginPath(); X.moveTo(-r * .26, r * .45); X.quadraticCurveTo(0, r * .5, r * .26, r * .45); X.quadraticCurveTo(0, r * .85, -r * .26, r * .45); fo('#c84a4a', lw * .8); }
      else { X.beginPath(); X.moveTo(-r * .22, r * .48); X.quadraticCurveTo(0, r * .64, r * .22, r * .48); ol(lw * .9); }
      if (o.bindi) { ell(0, -r * .32, r * .05, r * .05); X.fillStyle = '#d8304a'; X.fill(); }
      if (o.glasses) { X.lineWidth = lw * .8; X.strokeStyle = OL; [-1, 1].forEach(sd => { X.beginPath(); X.roundRect(sd * r * .36 - r * .22, -r * .17, r * .44, r * .36, r * .1); X.stroke(); }); }
      if (o.mustache) { X.fillStyle = OL; X.beginPath(); X.ellipse(-r * .12, r * .38, r * .14, r * .05, .2, 0, 7); X.ellipse(r * .12, r * .38, r * .14, r * .05, -.2, 0, 7); X.fill(); }
    });
  });
}
function figurineToy(x, y, s, t = 0) { P(() => { X.translate(x, y - Math.abs(Math.sin(t * 3)) * 4 * s); X.scale(s, s); const lw = 3.5; X.beginPath(); X.roundRect(-24, -58, 48, 56, 12); fo('#ff9ab8', lw); X.beginPath(); X.roundRect(-11, -56, 22, 18, 4); fo('#7ab8f0', 2.5); X.beginPath(); X.moveTo(-38, -70); X.bezierCurveTo(-46, -146, 46, -146, 38, -70); X.lineTo(42, -40); X.lineTo(-42, -40); X.closePath(); fo('#7a5ab8', lw); ell(0, -94, 34, 32); fo('#ffe6d4', lw); X.beginPath(); X.moveTo(-36, -102); X.bezierCurveTo(-34, -142, 34, -142, 36, -102); X.bezierCurveTo(14, -118, -14, -118, -36, -102); fo('#7a5ab8', lw); X.beginPath(); X.roundRect(-32, -138, 64, 13, 6); fo('#ff5a6a', lw); X.lineWidth = 3; X.strokeStyle = OL; ell(-13, -94, 12, 12); X.stroke(); ell(13, -94, 12, 12); X.stroke(); X.fillStyle = OL; ell(-13, -94, 3, 4); X.fill(); ell(13, -94, 3, 4); X.fill(); X.beginPath(); X.arc(0, -78, 8, .2, Math.PI - .2); ol(2.5); }); }
function thought(x, y, text, k, o = {}) { if (k <= 0) return; P(() => { const s = backE(clamp(k)); X.translate(x, y); X.scale(s, s); X.font = `700 ${o.fs || 26}px ${VOICE}`; const w = X.measureText(text).width + 46, h = (o.fs || 26) * 1.9; X.beginPath(); X.roundRect(-w / 2, -h / 2, w, h, h / 2); X.fillStyle = '#ffffff'; X.fill(); ol(3.5); if (o.tail !== false) { [[o.tx || -30, h / 2 + 14, 9], [(o.tx || -30) * 1.5, h / 2 + 34, 6]].forEach(([a, b, r]) => { ell(a, b, r, r); X.fillStyle = '#fff'; X.fill(); ol(3); }); } X.fillStyle = OL; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(text, 0, 2); }); }
function speech(x, y, text, k, o = {}) { if (k <= 0) return; P(() => { const s = backE(clamp(k)); X.translate(x, y); X.scale(s, s); X.font = `700 ${o.fs || 28}px ${VOICE}`; const w = X.measureText(text).width + 44, h = (o.fs || 28) * 1.9; X.beginPath(); X.roundRect(-w / 2, -h, w, h, 18); X.fillStyle = o.fill || '#ffffff'; X.fill(); ol(3.5); const tx = o.tx ?? 0; X.beginPath(); X.moveTo(tx - 14, -3); X.lineTo(tx + (o.tail ?? 20), 26); X.lineTo(tx + 14, -3); X.fillStyle = o.fill || '#ffffff'; X.fill(); ol(3.5); X.fillRect(tx - 12, -8, 24, 7); X.fillStyle = OL; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(text, 0, -h / 2 + 2); }); }
function heart(x, y, s, c = '#ff6a8a') { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.moveTo(0, 8); X.bezierCurveTo(-18, -6, -10, -20, 0, -10); X.bezierCurveTo(10, -20, 18, -6, 0, 8); fo(c, 2); }); }
