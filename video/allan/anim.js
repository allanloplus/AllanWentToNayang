/* Allan下南洋 · 主角版（以上傳的 Allan 角色設定圖為主角，約 5 分鐘） */
function streetGround(y, c = '#d8c8a4') { X.fillStyle = vgrad(y, H, [c, mix(c, '#8a7a5a', .3)]); X.fillRect(0, y, W, H - y); }
function road(y, off = 0) { X.fillStyle = '#9a9aa6'; X.fillRect(0, y, W, H - y); X.fillStyle = '#ffffff'; for (let i = -1; i < 12; i++) X.fillRect(((i * 160 - off) % 1920 + 1920) % 1920 - 160, y + (H - y) * .5, 90, 6); }
function speedLines(t, a = .5) { P(() => { X.strokeStyle = `rgba(255,255,255,${a})`; for (let i = 0; i < 40; i++) { const y = rnd(i) * H, x = ((rnd(i + 3) * W - t * 1600) % (W + 400) + W + 400) % (W + 400) - 200; X.lineWidth = 1 + rnd(i + 5) * 3; X.beginPath(); X.moveTo(x, y); X.lineTo(x + 160 + rnd(i + 9) * 200, y); X.stroke(); } }); }
function rainbow(cx, cy, r, a) { P(() => { X.globalAlpha = a; ['#ff6a6a', '#ffa04a', '#ffe06a', '#7ad86a', '#5ab0ff', '#7a7aff', '#b47aff'].forEach((c, i) => { X.strokeStyle = rgba(c, .55); X.lineWidth = 16; X.beginPath(); X.arc(cx, cy, r - i * 16, Math.PI, 0); X.stroke(); }); }); }
function kolam(cx, cy, g, sx = 1, sy = .35) { P(() => { X.translate(cx, cy); X.scale(sx, sy); const cols = ['#ff4a6a', '#ffa03a', '#ffe04a', '#4ac86a', '#4aa0ff', '#b46aff']; for (let ring = 0; ring < 6; ring++) { if (g * 6 < ring) continue; const n = 8 + ring * 4, rr = 40 + ring * 48; for (let i = 0; i < n; i++) P(() => { X.rotate(i * Math.PI * 2 / n + ring * .2); X.beginPath(); X.ellipse(0, -rr, 14 + ring * 2, 26 + ring * 3, 0, 0, 7); fo(cols[(ring + i) % 6], 3); }); } ell(0, 0, 30, 30); fo('#ffe04a', 3); }); }
function stall(x, base, s, label, c = '#ff6a5a') { P(() => { X.translate(x, base); X.scale(s, s); X.beginPath(); X.rect(-150, -110, 300, 110); fo('#c8935e', 3.5); X.fillStyle = '#a8784a'; X.fillRect(-150, -40, 300, 40); X.beginPath(); X.moveTo(-180, -170); X.lineTo(180, -170); X.lineTo(160, -120); X.lineTo(-160, -120); X.closePath(); fo(c, 3.5); X.font = `900 26px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText(label, 0, -136); X.fillStyle = '#5a3a2a'; X.fillRect(-150, -170, 10, 170); X.fillRect(140, -170, 10, 170); }); }
function drinkCup(x, y, s, c) { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.moveTo(-14, -40); X.lineTo(14, -40); X.lineTo(10, 0); X.lineTo(-10, 0); X.closePath(); fo(c, 3); X.strokeStyle = '#ffffff'; X.lineWidth = 3; X.beginPath(); X.moveTo(4, -40); X.lineTo(10, -60); X.stroke(); }); }
function cake(x, y, s, t) { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.roundRect(-70, -60, 140, 60, 10); fo('#ffffff', 3.5); X.fillStyle = '#ff9ab8'; X.fillRect(-68, -58, 136, 16); for (let i = 0; i < 5; i++) { X.beginPath(); X.roundRect(-50 + i * 24, -96, 8, 36, 3); fo(['#5ab0ff', '#ffd36b', '#7ad86a'][i % 3], 2.5); const fl = 1 + Math.sin(t * 12 + i) * .15; X.fillStyle = '#ffb030'; ell(-46 + i * 24, -104, 5, 9 * fl); X.fill(); } }); }
function hornbill(x, y, s, t) { P(() => { X.translate(x, y); X.scale(-s, s); const f = Math.sin(t * 8) * .5; X.beginPath(); X.ellipse(0, 0, 40, 16, 0, 0, 7); fo('#2a2a36', 3); X.beginPath(); X.moveTo(34, -6); X.quadraticCurveTo(80, -4, 92, 10); X.quadraticCurveTo(70, 8, 34, 6); X.closePath(); fo('#ffd23a', 3); X.beginPath(); X.moveTo(36, -8); X.quadraticCurveTo(60, -22, 76, -6); X.closePath(); fo('#ff6a3a', 2.5); [-1, 1].forEach(d => { X.beginPath(); X.moveTo(-10, 0); X.quadraticCurveTo(-20, d * 50 * (.4 + f), 20, d * 60 * (.4 + f)); X.lineTo(10, 0); X.closePath(); fo('#2a2a36', 3); }); X.beginPath(); X.moveTo(-36, 0); X.lineTo(-70, -6); X.lineTo(-70, 10); X.closePath(); fo('#ffffff', 2.5); }); }
function hen(x, y, s, t, chicks = 4) { P(() => { X.translate(x, y); X.scale(s, s); const b = Math.abs(Math.sin(t * 6)) * 3; X.beginPath(); X.ellipse(0, -30 - b, 34, 26, 0, 0, 7); fo('#c8783a', 3); ell(26, -58 - b, 14, 14); fo('#c8783a', 3); ell(22, -72 - b, 6, 6); fo('#ff4a4a', 2); for (let i = 0; i < chicks; i++) { const cx = -60 - i * 36, bb = Math.abs(Math.sin(t * 8 + i)) * 4; ell(cx, -12 - bb, 12, 11); fo('#ffe05a', 2.5); ell(cx + 8, -24 - bb, 7, 7); fo('#ffe05a', 2.5); } }); }
function officeRoom(win = true) { X.fillStyle = '#e8ecf0'; X.fillRect(0, 0, W, H); X.fillStyle = '#b8a890'; X.fillRect(0, 560, W, 160); if (win) { X.beginPath(); X.rect(760, 60, 460, 360); X.save(); X.clip(); sky(['#3d8fe6', '#a8d4f4']); X.fillStyle = '#7a90a8'; [[780, 300, 60, 120], [850, 250, 50, 170], [910, 320, 70, 100], [1100, 280, 60, 140], [1160, 330, 60, 90]].forEach(b => X.fillRect(...b)); X.fillStyle = '#6a8098'; X.translate(1010, 420); for (let i = 0; i < 8; i++) X.fillRect(-26 + i * 2, -40 - i * 30, 52 - i * 4, 30); X.fillRect(-4, -300, 8, 60); X.restore(); X.beginPath(); X.rect(760, 60, 460, 360); ol(10); X.beginPath(); X.moveTo(990, 60); X.lineTo(990, 420); ol(6); } }

const NAV = { dress: '#ffffff' };
const SHOTS = [
 { d: 18, name: 'title', draw(t) {
    sky(); clouds(t, 'a', 120, 9, 1); clouds(t + 30, 'c', 20, 4, .8); sunFlare(1130, 80, t, .9); birds(t, 5, 110, '#ffffff', 30, 2);
    X.fillStyle = vgrad(560, H, ['#8ad06a', '#62b04c']); X.beginPath(); X.moveTo(0, 600); X.quadraticCurveTo(640, 540, W, 600); X.lineTo(W, H); X.lineTo(0, H); X.fill();
    allanWave(380, H + 40, 640, { t });
    const a = eout(inv(1, 2.8, t));
    P(() => { X.globalAlpha = a; X.textAlign = 'center'; X.font = `900 92px ${DISP}`; X.lineWidth = 14; X.strokeStyle = OL; X.lineJoin = 'round'; X.strokeText('Allan 下南洋', 900, 290); X.fillStyle = '#ffffff'; X.fillText('Allan 下南洋', 900, 290); X.font = `700 32px ${VOICE}`; X.lineWidth = 8; X.strokeText('2014 – 2017 · 陽光的奇幻之旅', 900, 352); X.fillStyle = '#ffd23a'; X.fillText('2014 – 2017 · 陽光的奇幻之旅', 900, 352); });
    sparkles(t, 10, [700, 120, 500, 300], 3, '#ffffff', 14);
  }, subs: [[9, 13.4, '「仍有夢想，仍未放棄。」', 'Allan'], [13.6, 17.6, '「所以，Log該Log的，讓五年之後再回頭看這一切。」', 'Allan']] },

 { d: 18, name: 'decide', cap: ['2014', '台北 · 二十年的資訊人生'], draw(t) {
    officeRoom();
    X.fillStyle = '#9a7a5a'; X.fillRect(80, 520, 600, 22); X.fillRect(100, 542, 16, 120); X.fillRect(640, 542, 16, 120);
    [[140, 380], [330, 360]].forEach(([mx, my], i) => { X.beginPath(); X.roundRect(mx, my, 170, 120, 8); fo('#2a2f38', 4); X.fillStyle = '#12201a'; X.fillRect(mx + 10, my + 10, 150, 100); for (let l = 0; l < 7; l++) { X.fillStyle = ['#5fd38d', '#f2a24e', '#6aa3d8'][(l + i) % 3]; X.fillRect(mx + 20 + (l % 3) * 8, my + 20 + l * 12, 40 + rnd(l + i * 9) * 70, 5); } });
    if (t < 9.5) {
      allanBust('think', 900, 600, { t });
      ['高職 · 電工', '二專 · 工管', '大學 · 企管', 'MBA', '資訊工作 20 年', '大學講師 12 年'].forEach((s, i) => thought(170 + (i % 3) * 200, 120 + Math.floor(i / 3) * 80, s, inv(1 + i * .9, 1.4 + i * .9, t), { fs: 22 }));
    } else {
      allanBust(t < 13.5 ? 'explain' : 'laugh', 900, 600, { t, nod: t < 13.5 });
      sparkles(t, 8, [600, 100, 600, 300], 5, '#ffd23a', 18);
      if (t > 10) P(() => { X.textAlign = 'center'; X.font = `900 64px ${DISP}`; X.lineWidth = 10; X.strokeStyle = OL; X.lineJoin = 'round'; const s = backE(clamp(inv(10, 10.6, t))); X.translate(380, 200); X.scale(s, s); X.strokeText('人生大轉彎！', 0, 0); X.fillStyle = '#ffd23a'; X.fillText('人生大轉彎！', 0, 0); });
    }
  }, subs: [[1, 5, '「資訊工程根本不是我的本科，但我卻靠這項專業混口飯吃過了20年。」', 'Allan'], [5.2, 9.4, '「年輕時沒懂，懂的時候卻沒有勇氣回頭……」', 'Allan'], [9.8, 17.6, '「2014年，我決定提起勇氣，人生來個大轉彎！」', 'Allan']] },

 { d: 16, name: 'plane', cap: ['2014.10.01', '華航 11:40 · 飛往檳城'], draw(t) {
    X.fillStyle = '#e8e2d6'; X.fillRect(0, 0, W, H);
    P(() => { X.beginPath(); X.roundRect(740, 70, 420, 500, 160); X.clip(); sky(['#2f86e0', '#6ab4f2', '#cfe8fb']); clouds(t, 'b', 280, 60, .9); clouds(t + 7, 'c', 420, 90, .9); sunFlare(1050, 160, t, .7); });
    X.beginPath(); X.roundRect(740, 70, 420, 500, 160); X.lineWidth = 22; X.strokeStyle = '#cfc8ba'; X.stroke(); ol(4);
    allanBust(t < 5.5 ? 'smile' : t < 11 ? 'laugh' : 'wink', 430, 590, { t });
    speech(360, 150, '爸爸，拍天上的雲給我看！', inv(.8, 1.2, t) * (1 - inv(5, 5.4, t)), { fs: 26, fill: '#ffe4ef', tx: 120, tail: 40 });
    if (t > 6 && (t % 1.8) < .1) { X.fillStyle = 'rgba(255,255,255,.7)'; X.fillRect(0, 0, W, H); }
    if (t > 6) { P(() => { X.translate(680, 470); X.rotate(-.15); X.beginPath(); X.roundRect(-36, -64, 72, 128, 12); fo('#2a2a36', 4); X.fillStyle = '#8ad0ff'; X.fillRect(-28, -54, 56, 108); }); sparkles(t, 6, [760, 100, 380, 380], 5, '#ffffff', 14); }
  }, subs: [[1, 5.2, '亮晶晶傳LINE來的願望……', ''], [5.8, 10.6, '「這個願望，比去東京迪士尼容易做到！」', 'Allan'], [11, 15.6, '「所以我很努力地，在飛機上拍各種形狀的雲！」', 'Allan']] },

 { d: 18, name: 'arrive', cap: ['2014.10.01', '巴里文打 · 正式報到'], draw(t) {
    sky(); clouds(t, 'a', 40, 6, .8); sunFlare(1150, 60, t, .7);
    hills(380, 60, .006, 2, '#7ab8a8', '#68a898'); factory(980, 420, .55); grassField(410);
    for (let i = 0; i < 6; i++) palm(60 + i * 250, 430 + (i % 2) * 10, 260 + (i % 2) * 40, (i % 2 ? 14 : -10), t + i);
    X.fillStyle = '#d8c8a4'; X.beginPath(); X.moveTo(0, 590); X.lineTo(W, 540); X.lineTo(W, 650); X.lineTo(0, 710); X.fill();
    if (t < 9.5) { const k = eio(inv(0, 9, t)); allanFull(lerp(120, 760, k), lerp(700, 640, k), lerp(430, 380, k), { pose: k < 1 ? 'threeq' : 'front', walk: k < 1, t }); P(() => { const x = lerp(120, 760, k) + lerp(80, 72, k), fy = lerp(700, 640, k) + (k < 1 ? -Math.abs(Math.sin(t * 7)) * 6 : 0); X.translate(x, fy - 92); X.beginPath(); X.roundRect(0, 0, 66, 88, 9); fo('#3a4a7a', 3.5); X.beginPath(); X.roundRect(20, -14, 26, 16, 4); ol(3.5); }); }
    else { sky(['#3d8fe6', '#8fc8f6']); clouds(t, 'c', 60, 8, 1); sunFlare(1100, 80, t, .8); allanBust('smile', 470, 600, { t }); figurineToy(820, 600, 1.6, t); for (let i = 0; i < 4; i++) { const k = ((t * .5 + i / 4) % 1); heart(760 + i * 40, 380 - k * 160, 1.2); } sparkles(t, 8, [700, 150, 400, 300], 8, '#fff6c8', 16); }
  }, subs: [[1, 5.6, '「2014年10月1日，正式開始旅外工作生活。」', 'Allan'], [10, 17.6, '「到宿舍第一件事，阿拉蕾擺好。看到阿拉蕾，就會想起家裡3個小鬼的笑容！」', 'Allan']] },

 { d: 14, name: 'worry', cap: ['2014.10', '陌生的國度、陌生的領域'], draw(t) {
    X.fillStyle = vgrad(0, H, ['#fff4e0', '#ffe8c8']); X.fillRect(0, 0, W, H);
    factory(640, 470, .9);
    if (t < 7) { allanBust('worried', 640, 600, { t, shake: true }); P(() => { X.font = `900 70px ${DISP}`; X.fillStyle = '#5a8ad8'; X.textAlign = 'center'; ['?', '?', '?'].forEach((q, i) => X.fillText(q, 360 + i * 70 + Math.sin(t * 3 + i) * 6, 220 - i * 30)); }); }
    else { allanBust('explain', 640, 600, { t, nod: true }); sparkles(t, 8, [300, 100, 700, 300], 6, '#ffd23a', 16); }
  }, subs: [[.6, 6.8, '「在中年時，投入一個不是我專長的製造業管理領域……」', 'Allan'], [7.2, 13.6, '「已經踏出這一步，沒有回頭路了，只能往前走！」', 'Allan']] },

 { d: 18, name: 'team', cap: ['2014 – 2015', '我的南洋夥伴們'], chapter: ['2015', '奇幻之旅'], draw(t) {
    sky(); clouds(t, 'a', 30, 6, .9); sunFlare(160, 70, t, .7);
    factory(640, 400, 1.05); grassField(400, '#8ad06a', '#6ab04e');
    const crew = [[150, { hair: 'hijab', hijabC: '#ff7aa8' }], [290, { hair: 'cap', skin: 'brown', capC: '#e84a3a' }], [430, { hair: 'bun', skin: 'deep', dress: '#ff6a3a', sash: '#ffd36b', bindi: true }], [850, { hair: 'long' }], [990, { hair: 'short', skin: 'deep', mustache: true }], [1130, { hair: 'hijab', hijabC: '#5ab89a' }]];
    crew.forEach(([x, o], i) => pal(x, 660 + (i % 2) * 14, 280, { t, ph: i, top: '#5aa6ec', ...o, expr: t > 8 ? 'happy' : 'smile', pose: t > 1.5 + i * .4 ? 'wave' : 'down', hop: t > 10 }));
    allanFull(640, 700, 420, { pose: 'stand', t, hop: t > 10 });
    if (t > 10) petals(t - 10, 26, 2);
  }, subs: [[6.4, 11.4, '「每天面對華人、馬來人、印度裔、尼泊爾、印尼、越南的夥伴……」', 'Allan'], [11.8, 17.6, '「和他們一起工作、一起生活。真的是一趟奇幻之旅！」', 'Allan']] },

 { d: 16, name: 'food', cap: ['2014.08 – 10', '南洋的味道'], draw(t) {
    sky(['#4a9ae8', '#9fd2f6']); clouds(t, 'c', 30, 6, .8); streetGround(470);
    stall(260, 520, 1.05, '榴槤 · DURIAN', '#4ab86a'); stall(1020, 520, 1.05, 'ROTI · 拉茶', '#ff6a5a');
    for (let i = 0; i < 6; i++) P(() => { X.translate(170 + i * 36, 420); X.beginPath(); X.ellipse(0, 0, 18, 20, 0, 0, 7); fo('#b8b04a', 3); });
    const e = t < 3.6 ? 'surprised' : t < 8 ? 'laugh' : t < 12 ? 'wink' : 'laugh';
    allanBust(e, 640, 580, { t, nod: e === 'laugh' });
    if (t < 3.6) P(() => { X.strokeStyle = '#8ab04a'; X.lineWidth = 5; for (let i = 0; i < 3; i++) { X.beginPath(); for (let k = 0; k < 12; k++) X.lineTo(360 + i * 30 + Math.sin(t * 6 + k * .8 + i) * 10, 420 - k * 14); X.stroke(); } });
    if (t > 3.6 && t < 8) P(() => { X.translate(860, 420); X.rotate(.25); X.beginPath(); X.roundRect(-8, 0, 16, 90, 6); fo('#e8c890', 3); X.beginPath(); X.ellipse(0, -30, 30, 44, 0, 0, 7); fo('#fff2b0', 3.5); });
    if (t > 8) P(() => { X.translate(880, 440); X.rotate(-.12); X.beginPath(); X.moveTo(0, -260); X.lineTo(-70, 60); X.lineTo(70, 60); X.closePath(); fo('#f6dc9a', 4); X.strokeStyle = 'rgba(180,120,40,.5)'; X.lineWidth = 2; for (let l = 1; l < 9; l++) { X.beginPath(); X.moveTo(-7.5 * l, -260 + l * 34); X.lineTo(7.5 * l, -260 + l * 34); X.stroke(); } });
    if (t > 3.6) sparkles(t, 8, [740, 150, 300, 300], 4, '#fff6c8', 14);
  }, subs: [[.6, 3.6, '「我一直無法接受榴槤的臭味……」', 'Allan'], [3.8, 7.8, '「放在冷凍庫當冰棒吃，還滿好吃的！」', 'Allan'], [8.2, 15.6, '紙巾一樣薄的 Roti Tissue、Apom Balik、叻沙、拉茶……每一樣都想試試看！', '']] },

 { d: 24, name: 'bike', cap: ['2015.02.26', '阿強一號登場'], draw(t) {
    if (t < 14) {
      sky(); clouds(t, 'a', 50, 18, .85); sunFlare(1100, 70, t, .7);
      const off = t * 140;
      P(() => { X.translate(-(off * .15) % 640, 0); hills(400, 70, .005, 4, '#7ab8a8', '#5ea08e'); P(() => { X.translate(640, 0); hills(400, 70, .005, 4, '#7ab8a8', '#5ea08e'); }); });
      paddy(410, t);
      for (let i = -1; i < 8; i++) { const x = ((i * 280 - off * .5) % 2240 + 2240) % 2240 - 200; if (i % 3 === 0) kampung(x, 440, .6); else palm(x, 450, 240 + (i % 2) * 50, 10, t + i); }
      birds(t, 7, 170, '#ffffff', 60, 4, 1.1); road(620, off);
      allanBike(lerp(-200, 620, eout(inv(0, 4, t))), 668, .95, t, { speed: 10 });
      if (t > 4.5) P(() => { X.font = `900 34px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 8; X.strokeStyle = OL; const lx = lerp(-200, 620, eout(inv(0, 4, t))) + 150; X.strokeText('阿強一號', lx, 470); X.fillStyle = '#ff8a3a'; X.fillText('阿強一號', lx, 470); });
    } else {
      sky(['#2f86e0', '#7ab8f0']); clouds(t, 'c', 80, 40, 1); speedLines(t, .55);
      allanBust('laugh', 640, 600, { t, rot: -.05 });
      sparkles(t, 10, [880, 120, 380, 400], 6, '#ffffff', 16);
    }
  }, subs: [[.8, 6.6, '「腳踏車行老闆說：『騎到開車要4小時的吉隆坡都沒問題！』」', 'Allan'], [7, 13.6, '「就老闆這句話，我把海外第一個置產帶回宿舍了——阿強一號！」', 'Allan'], [14.2, 19, '「上山下海，城市鄉村，都由阿強一號來陪伴！」', 'Allan'], [19.4, 23.6, '「雖然很遠，出發就對了！」', 'Allan']] },

 { d: 16, name: 'village', cap: ['2015.09', '吉打州的小村莊'], draw(t) {
    sky(); clouds(t, 'c', 40, 6, .9); sunFlare(200, 60, t, .7);
    hills(330, 50, .008, 6, '#6aa880', '#5a9870'); X.fillStyle = '#6ab84e'; X.fillRect(0, 330, W, 390);
    kampung(240, 420, .9); kampung(1060, 400, .7); for (let i = 0; i < 5; i++) palm(80 + i * 300, 420, 230, (i % 2 ? 12 : -8), t + i);
    X.fillStyle = vgrad(440, 520, ['#5ac0e8', '#3a9ad8']); X.beginPath(); X.moveTo(0, 450); X.bezierCurveTo(400, 430, 800, 480, W, 450); X.lineTo(W, 520); X.bezierCurveTo(800, 540, 400, 500, 0, 530); X.fill();
    for (let i = 0; i < 3; i++) pal(380 + i * 80, 520 + (i % 2) * 8, 130, { t, ph: i, hair: i === 1 ? 'pigtails' : 'short', skin: 'brown', top: ['#ff8a5a', '#ffd36b', '#7ad86a'][i], pose: 'cheer', expr: 'happy' });
    P(() => { X.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 26; i++) { const k = ((t * 1.5 + i / 26) % 1); ell(360 + rnd(i) * 220, 500 - Math.sin(k * Math.PI) * 60, 4, 4); X.fill(); } });
    X.fillStyle = '#d8c094'; X.fillRect(0, 590, W, 130);
    hen(lerp(1300, 260, inv(1, 15, t)), 650, .9, t);
    allanFull(900, 700, 400, { pose: t < 8 ? 'threeq' : 'front', t });
    if (t > 9) speech(980, 260, '這不就是桃花源？', inv(9, 9.4, t), { fs: 28, tx: -40, tail: -30 });
  }, subs: [[.6, 5.6, '「村莊房子傍著溪流，一群馬來小孩在溪裡戲水。」', 'Allan'], [5.8, 10.6, '「一隻母雞帶著一群小雞，在我眼前穿過馬路……」', 'Allan'], [11, 15.6, '「總有不認識的馬來人，對我微笑、點頭。」', 'Allan']] },

 { d: 18, name: 'fountain', cap: ['2015.10', '工廠的活水'], draw(t) {
    sky(); clouds(t, 'a', 20, 5, .8); sunFlare(1150, 70, t, .8); factory(640, 400, 1.1); grassField(400, '#86d066', '#62b04c');
    const trees = Math.floor(clamp(inv(8, 14, t)) * 100);
    for (let i = 0; i < 10; i++) { const g = clamp((trees - i * 9) / 9); if (g <= 0) continue; const tx = 70 + i * 126, ty = 440; X.fillStyle = '#8a5a3a'; X.fillRect(tx - 5, ty - 60 * g, 10, 60 * g); X.beginPath(); X.ellipse(tx, ty - 76 * g, 44 * g, 38 * g, 0, 0, 7); fo('#4ab05a', 3); }
    const on = inv(2.5, 4, t);
    P(() => { X.translate(560, 600); X.beginPath(); X.ellipse(0, 0, 200, 44, 0, 0, 7); fo('#d8d0c0', 3.5); X.beginPath(); X.ellipse(0, -6, 176, 34, 0, 0, 7); fo(on > 0 ? '#6ac8f0' : '#b8a888', 3); X.beginPath(); X.roundRect(-22, -116, 44, 110, 10); fo('#e8e0d0', 3.5); X.beginPath(); X.ellipse(0, -118, 62, 14, 0, 0, 7); fo('#d8d0c0', 3.5);
      if (on > 0) { for (let i = 0; i < 40; i++) { const k = ((t * 1.1 + i / 40) % 1), ang = (i / 40 - .5) * 2.4; X.fillStyle = `rgba(200,240,255,${.95 - k * .5})`; ell(Math.sin(ang) * k * 150 * on, -118 - Math.sin(k * Math.PI) * 120 * on + k * 80, 5, 7); X.fill(); } rainbow(0, -60, 150, .5 * on); } });
    if (t > 4) { pal(300, 650, 240, { t, hair: 'hijab', hijabC: '#ffb03a', expr: 'happy', ph: 1 }); pal(820, 660, 250, { t, hair: 'short', skin: 'deep', expr: 'happy', ph: 2, pose: 'cheer' }); }
    allanFull(1040, 700, 420, { pose: t < 8 ? 'stand' : 'front', t, hop: t > 8.5 && t < 11 });
    if (t > 8) P(() => { X.font = `900 46px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 9; X.strokeStyle = OL; X.lineJoin = 'round'; X.strokeText(`種樹 ${trees} 棵`, 1060, 230); X.fillStyle = '#ffffff'; X.fillText(`種樹 ${trees} 棵`, 1060, 230); });
    if (on > 0) sparkles(t, 10, [380, 400, 360, 200], 9, '#ffffff', 12);
  }, subs: [[.6, 4.2, '「荒廢已久的噴水池，我先讓它噴出水來。」', 'Allan'], [4.4, 8.4, '「我喜歡稱這噴水池為工廠的『活水』。」', 'Allan'], [8.8, 17.6, '「種了100棵樹。多年後再回來，可以很驕傲地說，這排樹是我任內種的！」', 'Allan']] },

 { d: 16, name: 'water', cap: ['2016.02.02', '請全廠喝水'], chapter: ['2016', '有人情味的工廠'], draw(t) {
    sky(); clouds(t, 'c', 30, 8, .9); sunFlare(1100, 60, t, .8); factory(640, 360, .9); X.fillStyle = '#c8c0b0'; X.fillRect(0, 360, W, 360);
    stall(900, 520, 1.15, '飲料攤 · AIR', '#ff8a3a'); for (let i = 0; i < 9; i++) drinkCup(730 + i * 40, 470, .9, ['#ff8ab0', '#ffd36b', '#8ae0a0', '#ff6a5a', '#8ac8ff'][i % 5]);
    const crowd = [['hijab', '#ff7aa8', 'light'], ['cap', null, 'brown'], ['short', null, 'deep'], ['long', null, 'light'], ['hijab', '#7ac8ff', 'light'], ['bun', null, 'deep'], ['short', null, 'tan'], ['hijab', '#b48aff', 'light']];
    crowd.forEach(([h, hc, sk], i) => { const x = 80 + i * 160 + (i > 3 ? 0 : 0); if (x > 400 && x < 560) return; pal(x, 720 + (i % 2) * 10, 240, { t, ph: i, hair: h, hijabC: hc, capC: '#3a78c8', skin: sk, expr: 'happy', hop: t > 6, pose: t > 6 ? 'wave' : 'down', holdItem: t > 6 ? (hh) => drinkCup(0, 0, hh / 280, ['#ff8ab0', '#ffd36b', '#8ae0a0'][i % 3]) : null }); });
    allanFull(470, 720, 400, { pose: 'front', t, hop: t > 6 });
    if (t > 6) P(() => { X.font = `900 38px ${VOICE}`; X.textAlign = 'center'; ['Terima kasih!', 'Thank you!', '謝謝！'].forEach((s, i) => { const k = ((t * .5 + i / 3) % 1); X.globalAlpha = Math.sin(k * Math.PI); X.lineWidth = 8; X.strokeStyle = OL; X.strokeText(s, 200 + i * 440, 240 - k * 60); X.fillStyle = ['#ff8a3a', '#5ab0ff', '#7ad86a'][i]; X.fillText(s, 200 + i * 440, 240 - k * 60); }); });
  }, subs: [[6.4, 10.8, '「突發奇想，把路邊攤叫來工廠，請200多個員工『喝水』！」', 'Allan'], [11, 15.6, '「中、英、馬來語的謝謝，就是一整個『爽』！」', 'Allan']] },

 { d: 16, name: 'deepavali', cap: ['2016.10.25', 'Happy Deepavali！'], draw(t) {
    X.fillStyle = vgrad(0, H, ['#fff2d8', '#ffd8a8']); X.fillRect(0, 0, W, H); X.fillStyle = '#e8c890'; X.fillRect(0, 400, W, 320);
    for (let i = 0; i < 8; i++) { const lx = 80 + i * 160; X.strokeStyle = '#c8783a'; X.lineWidth = 2; X.beginPath(); X.moveTo(lx, 0); X.lineTo(lx, 70); X.stroke(); X.beginPath(); X.ellipse(lx, 90, 22, 26, 0, 0, 7); fo(['#ff5a6a', '#ffb03a', '#ffe04a'][i % 3], 3); }
    kolam(640, 570, eout(inv(.5, 7, t)), 1.15, .38);
    if (t < 8.5) {
      pal(200, 620, 300, { t, hair: 'bun', skin: 'deep', dress: '#e8304a', sash: '#ffd36b', bindi: true, expr: 'happy', pose: 'wave' });
      pal(340, 630, 290, { t, hair: 'long', skin: 'brown', dress: '#7a3ad8', sash: '#ff9a3a', bindi: true, expr: 'smile', ph: 2 });
      allanFull(1060, 710, 420, { pose: 'stand', t });
      P(() => { X.font = `900 64px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 11; X.strokeStyle = OL; X.lineJoin = 'round'; X.strokeText('Happy Deepavali!', 640, 210); X.fillStyle = '#ff5a6a'; X.fillText('Happy Deepavali!', 640, 210); });
    } else {
      X.fillStyle = '#ffe8c0'; X.fillRect(0, 0, W, H);
      P(() => { X.translate(780, 600); X.rotate(-.05); X.beginPath(); X.ellipse(0, 0, 360, 110, 0, 0, 7); fo('#4ab05a', 4.5); [[-200, -20, '#ffffff', 58], [-60, 10, '#e8a03a', 44], [80, -20, '#c84a2a', 38], [200, 20, '#ffd36b', 38]].forEach(([x, y, c, r]) => { X.beginPath(); X.ellipse(x, y, r, r * .6, 0, 0, 7); fo(c, 3.5); }); });
      allanBust('wink', 330, 560, { t });
      sparkles(t, 8, [600, 200, 500, 200], 11, '#ffd23a', 16);
    }
  }, subs: [[.6, 4.4, '「我把公司大廳開放給印度裔員工，布置他們屠妖節的圖騰。」', 'Allan'], [4.6, 8.4, '「他們一人一菜，邀請我一起慶祝。」', 'Allan'], [8.8, 15.6, '「第一次用芭蕉葉吃飯！印度食物真的好吃，我吃得好滿足！」', 'Allan']] },

 { d: 18, name: 'birthday', cap: ['2016.12', '工廠的彩虹與驚喜'], draw(t) {
    if (t < 7) { sky(['#5a8ad0', '#9ac8f0', '#e8f4ff']); clouds(t, 'b', 20, 4, 1); rainbow(760, 560, 420, eout(inv(.5, 3, t)) * .9); factory(760, 520, .8); grassField(520); allanBust(t < 2.5 ? 'surprised' : 'smile', 330, 560, { t }); sparkles(t, 12, [500, 100, 700, 300], 12, '#ffffff', 14); }
    else {
      X.fillStyle = vgrad(0, H, ['#fff4e0', '#ffe0c8']); X.fillRect(0, 0, W, H);
      for (let i = 0; i < 10; i++) { X.fillStyle = ['#ff8ab0', '#ffd36b', '#8ac8ff'][i % 3]; ell(i * 140 + 70, 40, 18, 22); X.fill(); }
      [[150, { hair: 'hijab', hijabC: '#ff7aa8' }], [300, { hair: 'bun', skin: 'deep', bindi: true }], [990, { hair: 'long' }], [1140, { hair: 'short', skin: 'brown' }]].forEach(([x, o], i) => pal(x, 720, 300, { t, ph: i, ...o, expr: 'happy', talk: true, pose: 'clap' }));
      allanBust(t < 12.5 ? 'cry' : 'laugh', 640, 560, { t });
      cake(640, 720, 1.4, t);
      P(() => { X.font = `900 50px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 9; X.strokeStyle = OL; X.lineJoin = 'round'; X.strokeText('Happy Birthday, Allan!', 640, 110); X.fillStyle = '#ff5a8a'; X.fillText('Happy Birthday, Allan!', 640, 110); });
      petals(t - 7, 24, 5);
    }
  }, subs: [[.6, 6.6, '「《海角七號》裡說：『難道，你不期待彩虹？』我在工廠看到了奇蹟。」', 'Allan'], [7.4, 12.2, '「第一次在這麼多人面前被迫當主角……」', 'Allan'], [12.6, 17.6, '「謝謝你們，想哭了……」（喜極而泣）', 'Allan']] },

 { d: 24, name: 'family', cap: ['2017.01.14', '檳城 · 家人來了！'], chapter: ['2017', '滿滿的祝福'], draw(t) {
    sky(); clouds(t, 'a', 30, 6, .9); sunFlare(1120, 70, t, .9);
    hills(320, 50, .009, 3, '#4aa07a', '#3a9070'); sea(330, t);
    X.fillStyle = vgrad(520, H, ['#ffe8b8', '#f2d098']); X.beginPath(); X.moveTo(0, 520); X.bezierCurveTo(400, 500, 900, 540, W, 510); X.lineTo(W, H); X.lineTo(0, H); X.fill();
    P(() => { X.strokeStyle = 'rgba(255,255,255,.9)'; X.lineWidth = 4; X.beginPath(); for (let x = 0; x <= W; x += 20) X.lineTo(x, 516 + Math.sin(x * .02 + t * 2) * 5 + Math.sin(t) * 6); X.stroke(); });
    palm(80, 560, 300, 30, t); palm(1220, 560, 280, -40, t + 2);
    if (t < 14) {
      pal(500, 620, 230, { t, hair: 'pigtails', dress: '#ff8ab0', expr: 'happy', pose: 'cheer', hop: true });
      P(() => { X.fillStyle = 'rgba(255,255,255,.95)'; for (let i = 0; i < 22; i++) { const k = ((t * 1.4 + i / 22) % 1); ell(500 + (rnd(i) - .5) * 160 * k, 600 - Math.sin(k * Math.PI) * 80, 5, 5); X.fill(); } });
      pal(690, 650, 300, { t, hair: 'long', dress: '#ffffff', expr: 'happy', pose: 'wave' });
      allanWave(980, H + 30, 470, { t, speed: 6 });
    } else {
      X.fillStyle = vgrad(0, H, ['#ffe0a8', '#ffc890']); X.fillRect(0, 0, W, H); sunFlare(1000, 120, t, .6);
      allanBust('laugh', 420, 560, { t, nod: true });
      pal(900, 720, 430, { t, hair: 'pigtails', top: '#ff8ab0', expr: 'happy', holdItem: (hh) => { P(() => { X.rotate(Math.PI); X.translate(0, 20); X.beginPath(); X.moveTo(0, -hh * .5); X.lineTo(-hh * .09, hh * .06); X.lineTo(hh * .09, hh * .06); X.closePath(); fo('#f6dc9a', 4); }); } });
      for (let i = 0; i < 6; i++) { const k = ((t * .4 + i / 6) % 1); heart(620 + i * 30, 380 - k * 200, 1 + rnd(i)); }
    }
  }, subs: [[6.4, 10.2, '「老婆和亮晶晶，第一次來到我在南洋的狗窩！」', 'Allan'], [10.4, 13.8, '「上一次跟老婆一起搭飛機，是18年前，度蜜月。」', 'Allan'], [14.4, 23.6, '「實現老婆的願望：吃道地的印度拋餅、拉茶。」亮晶晶說：「Roti Tissue 真好吃！」', '']] },

 { d: 20, name: 'farewell', cap: ['2017.02.24', '滿滿的祝福'], draw(t) {
    sky(); clouds(t, 'a', 20, 5, .8); sunFlare(1150, 60, t, .8); factory(640, 380, 1.05); grassField(380, '#8ad06a', '#6ab04e');
    P(() => { X.beginPath(); X.roundRect(260, 150, 760, 66, 12); fo('#ffffff', 4); X.font = `900 36px ${DISP}`; X.textAlign = 'center'; X.fillStyle = '#e8304a'; X.fillText('Terima kasih, Allan! 謝謝你！', 640, 196); });
    const crew = [['hijab', '#ff7aa8', 'light'], ['cap', null, 'brown'], ['bun', null, 'deep'], ['long', null, 'light'], ['short', null, 'deep'], ['hijab', '#5ab89a', 'light'], ['short', null, 'tan'], ['hijab', '#b48aff', 'light']];
    crew.forEach(([h, hc, sk], i) => { const x = 80 + i * 150 + (i > 3 ? 120 : 0); pal(x, 640 + (i % 2) * 16, 260, { t, ph: i, hair: h, hijabC: hc, capC: '#3a78c8', skin: sk, expr: 'happy', teary: t > 9, pose: 'wave' }); });
    if (t < 9) allanBust('cry', 640, 520, { t });
    else if (t < 14) allanFull(640, 710, 420, { pose: 'back', t, sway: .03 });
    else allanWave(640, H + 30, 480, { t });
    petals(t, 30, 7);
  }, subs: [[.6, 6, '「2017年2月24日，2年5個月的緣分，走到了最後一天。」', 'Allan'], [6.4, 13.6, '「謝謝所有馬來西亞的朋友，I\'ll miss you！」', 'Allan'], [14, 19.6, '「美麗的結局，美麗的回憶！」', 'Allan']] },

 { d: 30, name: 'home', cap: ['2017.02.25', 'PEN → TPE · 回家'], draw(t) {
    if (t < 13) {
      X.fillStyle = '#e8e2d6'; X.fillRect(0, 0, W, H);
      P(() => { X.beginPath(); X.roundRect(720, 70, 440, 500, 160); X.clip(); sky(['#3a8ae0', '#8ac0f0', '#ffe0b0']); clouds(t, 'b', 300, 30, 1); clouds(t + 9, 'c', 430, 50, 1); sunFlare(980, 200, t, .9); });
      X.beginPath(); X.roundRect(720, 70, 440, 500, 160); X.lineWidth = 22; X.strokeStyle = '#cfc8ba'; X.stroke(); ol(4);
      allanBust(t < 7 ? 'smile' : 'wink', 400, 580, { t }); figurineToy(630, 640, 1.3, t);
      sparkles(t, 8, [740, 100, 400, 400], 13, '#ffffff', 14);
    } else {
      const k = inv(13, 30, t);
      sky([mix('#2f86e0', '#4a9ae8', k), '#8ac8f6', '#ffe8c0']); clouds(t, 'a', 270, 8, 1.1); clouds(t + 20, 'c', 60, 4, .9); sunFlare(640, 330, t, 1); birds(t, 6, 200, '#ffffff', 25, 9, 1.2); petals(t - 13, 22, 11);
      allanFull(lerp(-150, 230, eout(inv(13, 16, t))), 720, 400, { pose: t < 16 ? 'threeq' : 'front', walk: t < 16, t });
      const a1 = eout(inv(15, 17, t)), a2 = eout(inv(19, 21, t)), a3 = eout(inv(23, 25, t));
      P(() => { X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineJoin = 'round';
        X.globalAlpha = a1; X.font = `700 40px ${VOICE}`; X.lineWidth = 9; X.strokeStyle = OL; X.strokeText('「一步一腳印，總有春暖花開的時候。」', 760, 180); X.fillStyle = '#ffffff'; X.fillText('「一步一腳印，總有春暖花開的時候。」', 760, 180);
        X.globalAlpha = a2; X.font = `700 34px ${VOICE}`; X.strokeText('這一切，都成了最溫暖的『曾經』。', 760, 250); X.fillStyle = '#ffd23a'; X.fillText('這一切，都成了最溫暖的『曾經』。', 760, 250);
        X.globalAlpha = a3; X.font = `900 72px ${DISP}`; X.lineWidth = 13; X.strokeText('Allan 下南洋', 760, 440); X.fillStyle = '#ffffff'; X.fillText('Allan 下南洋', 760, 440);
        X.font = `700 20px ${VOICE}`; X.lineWidth = 6; const cr = '原作：「Allan下南洋」部落格 2014–2017　·　台詞皆為 Allan 原文'; X.strokeText(cr, 760, 500); X.fillStyle = '#ffffff'; X.fillText(cr, 760, 500); });
    }
  }, subs: [[1, 6.8, '「阿拉蕾，我們2年多的奇幻旅行到了終點……」', 'Allan'], [7.2, 12.6, '「收拾滿滿的祝福，要回家了！」', 'Allan']] },
];

let acc = 0; SHOTS.forEach(s => { s.start = acc; acc += s.d; });
const TOTAL = acc;
function renderFrame(T) {
  const s = SHOTS.find(x => T >= x.start && T < x.start + x.d) || SHOTS[SHOTS.length - 1];
  const t = T - s.start;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
  X.fillStyle = '#fff'; X.fillRect(0, 0, W, H);
  P(() => s.draw(t));
  post(Math.round(T * FPS));
  const f = Math.max(1 - inv(0, .5, t), inv(s.d - .5, s.d, t)); if (f > 0) { X.fillStyle = `rgba(255,255,250,${f})`; X.fillRect(0, 0, W, H); }
  if (s.cap) caption(s.cap[0], s.cap[1], eout(inv(.6, 1.4, t)) * (1 - inv(s.d - 1.2, s.d - .5, t)));
  if (s.chapter) chapter(s.chapter[0], s.chapter[1], t);
  (s.subs || []).forEach(([a, b, txt, who]) => subtitle(txt, inv(a, a + .4, t) * (1 - inv(b - .4, b, t)), who));
}
window.TOTAL = TOTAL; window.FPS = FPS; window.SHOTS = SHOTS.map(s => ({ name: s.name, start: s.start, d: s.d }));
window.renderFrame = renderFrame;
window.ALLTEXT = SHOTS.flatMap(s => [...(s.subs || []).map(x => x[2] + (x[3] || '')), ...(s.cap || []), ...(s.chapter || [])]).join('') + 'Allan下南洋陽光的奇幻之旅2014–2017一步一腳印總有春暖花開的時候這切都成了最溫暖曾經原作部落格台詞皆為原文高職電工二專工管大學企管資訊工作年講師人生大轉彎爸爸拍天上雲給我看榴槤拉茶阿強一號種樹棵飲料攤謝謝你這不就是桃花源？巴里文打工廠';
window.ready = (async () => { await spritesReady; await Promise.all([`700 32px ${VOICE}`, `900 60px ${DISP}`].map(f => document.fonts.load(f, window.ALLTEXT))); await document.fonts.ready; return true; })();
if (!/render/.test(location.search)) { let t0 = null; const st = +(new URLSearchParams(location.search).get('t') || 0); window.ready.then(() => { const loop = ts => { if (t0 === null) t0 = ts; renderFrame((st + (ts - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }); }
