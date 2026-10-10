/* Allan下南洋 · 陽光版（90 年代賽璐璐動畫風格，約 5 分鐘）
 * 只收錄溫暖、正面的回憶；台詞皆節錄自部落格原文。
 */
const ALLAN = { glasses: true };
const TAN = { base: '#f6cfae', sh: '#e2a481', blush: '#ff9a8a' };          // 後期曬黑一點
const BROWN = { base: '#c98a5e', sh: '#a06a44', blush: '#e07a6a' };
const DEEP = { base: '#a8714c', sh: '#82543a', blush: '#d06a5a' };
const NAVYHAIR = HAIR, BLACKHAIR = { base: '#2a2228', sh: '#16101a', hi: '#6a5a7a', rim: '#ffd0b0' };
const WOMANHAIR = { base: '#3a2430', sh: '#22121c', hi: '#8a6a8a', rim: '#ffd0e0' };
const outfit = (top, topSh, extra = {}) => ({ ...OUTFIT.allan, top, topSh, ...extra });
const BLUE = OUTFIT.allan;

function streetGround(y, c = '#d8c8a4') { X.fillStyle = vgrad(y, H, [c, mix(c, '#8a7a5a', .3)]); X.fillRect(0, y, W, H - y); }
function road(y, t, off = 0) { X.fillStyle = '#9a9aa6'; X.fillRect(0, y, W, H - y); X.fillStyle = '#ffffff'; for (let i = -1; i < 12; i++) X.fillRect(((i * 160 - off) % 1920 + 1920) % 1920 - 160, y + (H - y) * .5, 90, 6); }
function speedLines(t, a = .5) { P(() => { X.strokeStyle = `rgba(255,255,255,${a})`; for (let i = 0; i < 40; i++) { const y = rnd(i) * H, x = ((rnd(i + 3) * W - t * 1600) % (W + 400) + W + 400) % (W + 400) - 200; X.lineWidth = 1 + rnd(i + 5) * 3; X.beginPath(); X.moveTo(x, y); X.lineTo(x + 160 + rnd(i + 9) * 200, y); X.stroke(); } }); }
function rainbow(cx, cy, r, a) { P(() => { X.globalAlpha = a; ['#ff6a6a', '#ffa04a', '#ffe06a', '#7ad86a', '#5ab0ff', '#7a7aff', '#b47aff'].forEach((c, i) => { X.strokeStyle = rgba(c, .55); X.lineWidth = 16; X.beginPath(); X.arc(cx, cy, r - i * 16, Math.PI, 0); X.stroke(); }); }); }
function kolam(cx, cy, g, sx = 1, sy = .35) { P(() => { X.translate(cx, cy); X.scale(sx, sy); const cols = ['#ff4a6a', '#ffa03a', '#ffe04a', '#4ac86a', '#4aa0ff', '#b46aff']; for (let ring = 0; ring < 6; ring++) { if (g * 6 < ring) continue; const n = 8 + ring * 4, rr = 40 + ring * 48; for (let i = 0; i < n; i++) P(() => { X.rotate(i * Math.PI * 2 / n + ring * .2); X.beginPath(); X.ellipse(0, -rr, 14 + ring * 2, 26 + ring * 3, 0, 0, 7); fillInk(cols[(ring + i) % 6], 3); }); } ell(0, 0, 30, 30); fillInk('#ffe04a', 3); }); }
function stall(x, base, s, label, c = '#ff6a5a') { P(() => { X.translate(x, base); X.scale(s, s); X.beginPath(); X.rect(-150, -110, 300, 110); fillInk('#c8935e', 3); X.fillStyle = '#a8784a'; X.fillRect(-150, -40, 300, 40); X.beginPath(); X.moveTo(-180, -170); X.lineTo(180, -170); X.lineTo(160, -120); X.lineTo(-160, -120); X.closePath(); fillInk(c, 3); for (let i = 0; i < 8; i++) { X.fillStyle = i % 2 ? '#ffffff' : c; X.beginPath(); X.moveTo(-160 + i * 40, -120); X.lineTo(-140 + i * 40, -100); X.lineTo(-120 + i * 40, -120); X.fill(); } X.font = `900 26px ${DISP}`; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText(label, 0, -136); X.fillStyle = '#5a3a2a'; X.fillRect(-150, -170, 10, 170); X.fillRect(140, -170, 10, 170); }); }
function drinkCup(x, y, s, c) { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.moveTo(-14, -40); X.lineTo(14, -40); X.lineTo(10, 0); X.lineTo(-10, 0); X.closePath(); fillInk(c, 2.5); X.fillStyle = 'rgba(255,255,255,.6)'; X.fillRect(-8, -34, 4, 26); X.strokeStyle = '#ffffff'; X.lineWidth = 3; X.beginPath(); X.moveTo(4, -40); X.lineTo(10, -60); X.stroke(); }); }
function cake(x, y, s, t) { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.roundRect(-70, -60, 140, 60, 10); fillInk('#ffffff', 3); X.fillStyle = '#ff9ab8'; X.fillRect(-70, -60, 140, 16); for (let i = 0; i < 5; i++) { X.beginPath(); X.roundRect(-50 + i * 24, -96, 8, 36, 3); fillInk(['#5ab0ff', '#ffd36b', '#7ad86a'][i % 3], 2); const fl = 1 + Math.sin(t * 12 + i) * .15; X.fillStyle = '#ffb030'; ell(-46 + i * 24, -104, 5, 9 * fl); X.fill(); X.fillStyle = '#fff6c0'; ell(-46 + i * 24, -102, 2.4, 5 * fl); X.fill(); } }); }
function hornbill(x, y, s, t) { P(() => { X.translate(x, y); X.scale(-s, s); const f = Math.sin(t * 8) * .5; X.beginPath(); X.ellipse(0, 0, 40, 16, 0, 0, 7); fillInk('#2a2a36', 3); X.beginPath(); X.moveTo(34, -6); X.quadraticCurveTo(80, -4, 92, 10); X.quadraticCurveTo(70, 8, 34, 6); X.closePath(); fillInk('#ffd23a', 3); X.beginPath(); X.moveTo(36, -8); X.quadraticCurveTo(60, -22, 76, -6); X.closePath(); fillInk('#ff6a3a', 2.5); [-1, 1].forEach(d => { X.beginPath(); X.moveTo(-10, 0); X.quadraticCurveTo(-20, d * 50 * (.4 + f), 20, d * 60 * (.4 + f)); X.lineTo(10, 0); X.closePath(); fillInk('#2a2a36', 3); }); X.beginPath(); X.moveTo(-36, 0); X.lineTo(-70, -6); X.lineTo(-70, 10); X.closePath(); fillInk('#ffffff', 2.5); ell(28, -4, 3, 3); X.fillStyle = '#fff'; X.fill(); }); }
function hen(x, y, s, t, chicks = 4) { P(() => { X.translate(x, y); X.scale(s, s); const b = Math.abs(Math.sin(t * 6)) * 3; X.beginPath(); X.ellipse(0, -30 - b, 34, 26, 0, 0, 7); fillInk('#c8783a', 3); ell(26, -58 - b, 14, 14); fillInk('#c8783a', 3); X.beginPath(); X.moveTo(38, -58 - b); X.lineTo(48, -54 - b); X.lineTo(38, -50 - b); fillInk('#ffc83a', 2); ell(22, -72 - b, 6, 6); fillInk('#ff4a4a', 2); for (let i = 0; i < chicks; i++) { const cx = -60 - i * 36, bb = Math.abs(Math.sin(t * 8 + i)) * 4; ell(cx, -12 - bb, 12, 11); fillInk('#ffe05a', 2.5); ell(cx + 8, -24 - bb, 7, 7); fillInk('#ffe05a', 2.5); } }); }
function kidsSplash(x, y, t) { for (let i = 0; i < 3; i++) person(x + i * 70, y + (i % 2) * 10, 120, { t: t + i, hair: i === 1 ? 'pigtails' : 'short', skin: BROWN, expr: 'happy', arms: [2.6 - Math.sin(t * 5 + i) * .3, -2.6 + Math.sin(t * 5 + i) * .3], outfit: outfit(['#ff8a5a', '#ffd36b', '#7ad86a'][i], '#c8783a', { pants: '#4a6ac8' }), noBlink: true }); P(() => { X.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 30; i++) { const k = ((t * 1.5 + i / 30) % 1); ell(x - 20 + rnd(i) * 200, y - 20 - Math.sin(k * Math.PI) * 60, 4, 4); X.fill(); } }); }

const SHOTS = [
 { d: 18, name: 'sky', draw(t) {
    sky(); clouds(t, 'a', 160, 10, 1.05); clouds(t + 30, 'c', 30, 5, .8); sunFlare(1120, 80, t, .9);
    birds(t, 5, 120, '#ffffff', 30, 2, 1);
    const z = 1 + t * .004; X.translate(W * .35, H * .9); X.scale(z, z); X.translate(-W * .35, -H * .9);
    bust(440, 420, .9, { ...ALLAN, t, lookY: -1, lookX: .5, tilt: -.14, expr: t > 9 ? 'grin' : 'smile', strap: true, wind: 1.4 });
    sparkles(t, 10, [700, 100, 500, 300], 3);
    const a = eout(inv(1.2, 3, t)) * (1 - inv(8, 9.4, t));
    P(() => { X.globalAlpha = a; X.textAlign = 'center'; X.font = `900 86px ${DISP}`; X.lineWidth = 12; X.strokeStyle = 'rgba(30,70,150,.75)'; X.strokeText('Allan 下南洋', 900, 300); X.fillStyle = '#ffffff'; X.fillText('Allan 下南洋', 900, 300); X.font = `700 30px ${VOICE}`; X.lineWidth = 6; X.strokeText('陽光的記憶 · 2014–2017', 900, 356); X.fillStyle = '#ffe07a'; X.fillText('陽光的記憶 · 2014–2017', 900, 356); });
  }, subs: [[9.6, 13.6, '「提起勇氣，人生來個大轉彎。」', 'Allan'], [13.9, 17.6, '「仍有夢想，仍未放棄。」', 'Allan']] },

 { d: 18, name: 'plane', cap: ['2014.10.01', '華航 11:40 · 飛往檳城'], draw(t) {
    X.fillStyle = '#e8e2d6'; X.fillRect(0, 0, W, H);
    P(() => { X.beginPath(); X.roundRect(720, 70, 440, 520, 170); X.clip(); sky(['#2f86e0', '#6ab4f2', '#cfe8fb']); clouds(t, 'b', 300, 60, .9); clouds(t + 7, 'c', 440, 90, .9); sunFlare(1050, 160, t, .7); });
    X.beginPath(); X.roundRect(720, 70, 440, 520, 170); X.lineWidth = 22; X.strokeStyle = '#cfc8ba'; X.stroke(); X.lineWidth = 3; X.strokeStyle = LINE; X.stroke(); X.beginPath(); X.roundRect(700, 50, 480, 560, 186); ink(3);
    X.fillStyle = '#5a7ac8'; X.beginPath(); X.roundRect(-40, 300, 300, 460, 40); X.fill(); ink(3);
    const snap = t > 4 && (t % 2.2) < .12;
    bust(470, 440, .82, { ...ALLAN, t, lookX: 1, lookY: -.3, expr: t > 11 ? 'happy' : 'smile', hand: () => { P(() => { X.translate(250, -40); X.rotate(-.2); X.beginPath(); X.roundRect(-30, -56, 60, 112, 10); fillInk('#2a2a36', 3); X.fillStyle = '#8ad0ff'; X.fillRect(-24, -48, 48, 92); ell(-10, 60, 34, 30); fillInk(SKIN.base, 3); }); } });
    if (snap) { X.fillStyle = 'rgba(255,255,255,.6)'; X.fillRect(0, 0, W, H); }
    if (t > 4) sparkles(t, 6, [740, 100, 400, 400], 5, '#ffffff', 14);
  }, subs: [[1, 5.6, '亮晶晶傳LINE說：「爸爸，拍天上的雲給我看！」', ''], [6, 11, '「這個願望，比去東京迪士尼容易做到。」', 'Allan'], [11.4, 17.6, '「所以我很努力地，在飛機上拍各種形狀的雲！」', 'Allan']] },

 { d: 18, name: 'arrive', cap: ['2014.10.01', '巴里文打 · 正式報到'], draw(t) {
    sky(); clouds(t, 'a', 40, 6, .8); sunFlare(1150, 60, t, .7);
    hills(380, 60, .006, 2, '#7ab8a8', '#68a898'); factory(980, 420, .55);
    grassField(410);
    for (let i = 0; i < 6; i++) palm(60 + i * 250, 430 + (i % 2) * 10, 260 + (i % 2) * 40, (i % 2 ? 14 : -10), t + i);
    X.fillStyle = '#c8b894'; X.beginPath(); X.moveTo(0, 560); X.lineTo(W, 520); X.lineTo(W, 640); X.lineTo(0, 700); X.fill();
    if (t < 10) {
      const k = eio(inv(0, 9.5, t));
      person(lerp(150, 760, k), lerp(680, 620, k), 330, { ...ALLAN, t, walk: k < 1, expr: 'grin', arms: [.1, -.2], holdR: (kk) => { X.beginPath(); X.roundRect(-.3 * kk, -.1 * kk, .9 * kk, 1.2 * kk, .1 * kk); fillInk('#3a4a7a', 3); } });
    } else {
      sky(['#3d8fe6', '#8fc8f6']); clouds(t, 'c', 60, 8, 1); sunFlare(1100, 80, t, .8);
      bust(520, 470, .85, { ...ALLAN, t, expr: 'happy', lookY: -.2, hand: () => { figurine(240, 40, .9, t); ell(250, 70, 40, 34); fillInk(SKIN.base, 3); } });
      sparkles(t, 12, [700, 200, 400, 300], 8, '#fff6c8', 16);
    }
  }, subs: [[1, 5.6, '「2014年10月1日，正式開始旅外工作生活。」', 'Allan'], [10.4, 17.6, '「到宿舍第一件事，阿拉蕾擺好。看到阿拉蕾，我就會想起家裡3個小鬼的笑容！」', 'Allan']] },

 { d: 20, name: 'team', cap: ['2014–2015', '我的南洋夥伴們'], draw(t) {
    sky(); clouds(t, 'a', 30, 6, .9); sunFlare(160, 70, t, .7);
    factory(640, 420, 1.05); grassField(420, '#8ad06a', '#6ab04e');
    const crew = [
      [170, { hair: 'hijab', hijabC: '#ff7aa8', outfit: BLUE, expr: 'happy' }], [300, { hair: 'cap', capC: '#e85a4a', skin: BROWN, outfit: BLUE, expr: 'grin' }],
      [430, { hair: 'bun', skin: DEEP, dress: '#ff6a3a', sash: '#ffd36b', bindi: true, expr: 'smile' }], [850, { hair: 'long', hairC: WOMANHAIR, outfit: BLUE, expr: 'happy' }],
      [980, { hair: 'short', skin: DEEP, hairC: BLACKHAIR, outfit: BLUE, expr: 'grin' }], [1110, { hair: 'hijab', hijabC: '#5ab89a', outfit: BLUE, expr: 'smile' }]];
    crew.forEach(([x, o], i) => person(x, 640 + (i % 2) * 14, 260, { t: t + i * .7, ph: i, ...o, arms: [.12, (t > 2 + i * .4) ? -2.5 + Math.sin(t * 6 + i) * .3 : -.12], hop: t > 12 }));
    person(640, 700, 340, { ...ALLAN, t, expr: t > 12 ? 'happy' : 'grin', arms: [2.5 - Math.sin(t * 5) * .2, -2.5 + Math.sin(t * 5) * .2] });
    if (t > 12) petals(t - 12, 30, 2);
  }, subs: [[1, 7, '「每天面對的除了華人，還有馬來人、印度裔、尼泊爾、印尼、越南的夥伴……」', 'Allan'], [7.4, 12, '「不同膚色、不同語言、不同宗教，和他們一起工作、一起生活。」', 'Allan'], [12.4, 19.6, '「真的是一趟奇幻之旅！」', 'Allan']] },

 { d: 18, name: 'food', cap: ['2014.08 – 10', '南洋的味道'], draw(t) {
    sky(['#4a9ae8', '#9fd2f6']); clouds(t, 'c', 30, 6, .8);
    streetGround(470); stall(330, 520, 1.1, '榴槤 · DURIAN', '#4ab86a'); stall(980, 520, 1.1, 'APOM BALIK', '#ff6a5a');
    for (let i = 0; i < 6; i++) { P(() => { X.translate(240 + i * 36, 420); X.beginPath(); X.ellipse(0, 0, 18, 20, 0, 0, 7); fillInk('#b8b04a', 2.5); X.strokeStyle = '#7a7a2a'; X.lineWidth = 2; for (let k = 0; k < 6; k++) { X.beginPath(); X.moveTo(-12 + k * 5, -12); X.lineTo(-10 + k * 5, -18); X.stroke(); } }); }
    const ph = t < 9;
    bust(640, 470, .78, { ...ALLAN, t, skin: TAN, expr: ph ? (t < 3.5 ? 'surprised' : 'grin') : 'happy', sweat: t < 3.5, hand: () => {
      if (ph) { P(() => { X.translate(250, 0); X.rotate(.3); X.beginPath(); X.roundRect(-8, 0, 16, 90, 6); fillInk('#e8c890', 2.5); X.beginPath(); X.ellipse(0, -30, 30, 44, 0, 0, 7); fillInk('#fff2b0', 3); ell(0, 60, 34, 30); fillInk(TAN.base, 3); }); }
      else { P(() => { X.translate(250, -20); X.rotate(-.15); X.beginPath(); X.moveTo(0, -200); X.lineTo(-60, 60); X.lineTo(60, 60); X.closePath(); fillInk('#f6dc9a', 3); X.strokeStyle = 'rgba(180,120,40,.5)'; X.lineWidth = 2; for (let l = 1; l < 8; l++) { X.beginPath(); X.moveTo(-8 * l, -200 + l * 32); X.lineTo(8 * l, -200 + l * 32); X.stroke(); } ell(0, 70, 34, 30); fillInk(TAN.base, 3); }); } } });
    if (t > 3.6) sparkles(t, 8, [820, 150, 300, 300], 4, '#fff6c8', 14);
    if (!ph) P(() => { X.font = `900 34px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 7; X.strokeStyle = '#ffffff'; X.strokeText('Roti Tissue！', 960, 170); X.fillStyle = '#ff6a3a'; X.fillText('Roti Tissue！', 960, 170); });
  }, subs: [[.6, 4.6, '「我一直無法接受榴槤的臭味，但想到要在當地好幾年，強迫自己買了一顆。」', 'Allan'], [4.8, 8.8, '「放在冷凍庫當冰棒吃，還滿好吃的！」', 'Allan'], [9.2, 17.6, '紙巾一樣薄的 Roti Tissue、Apom Balik、叻沙、拉茶……每一樣都想試試看。', '']] },

 { d: 22, name: 'bike', cap: ['2015.02.26', '阿強一號登場'], draw(t) {
    if (t < 13) {
      sky(); clouds(t, 'a', 50, 18, .85); sunFlare(1100, 70, t, .7);
      const off = t * 140;
      P(() => { X.translate(-(off * .15) % 640, 0); hills(400, 70, .005, 4, '#7ab8a8', '#5ea08e'); P(() => { X.translate(640, 0); hills(400, 70, .005, 4, '#7ab8a8', '#5ea08e'); }); });
      paddy(410, t);
      for (let i = -1; i < 8; i++) { const x = ((i * 280 - off * .5) % 2240 + 2240) % 2240 - 200; if (i % 3 === 0) kampung(x, 440, .6); else palm(x, 450, 240 + (i % 2) * 50, 10, t + i); }
      birds(t, 7, 170, '#ffffff', 60, 4, 1.1);
      road(610, t, off);
      bike(lerp(-150, 640, eout(inv(0, 4, t))), 650, 1.05, t, { rider: { ...ALLAN, expr: 'grin', wind: 2 }, speed: 10 });
    } else {
      sky(['#2f86e0', '#7ab8f0']); clouds(t, 'c', 80, 40, 1); speedLines(t, .55);
      bust(560, 470, .82, { ...ALLAN, t, expr: 'happy', wind: 3, tilt: .05, skin: TAN });
      sparkles(t, 10, [800, 120, 400, 400], 6, '#ffffff', 16);
    }
  }, subs: [[1, 6.4, '「腳踏車行老闆說：『騎到開車要4小時的吉隆坡都沒問題！』」', 'Allan'], [6.8, 12.6, '「就老闆這句話，我把海外第一個置產帶回宿舍了——阿強一號！」', 'Allan'], [13.2, 17.8, '「上山下海，城市鄉村，都由阿強一號來陪伴！」', 'Allan'], [18, 21.6, '「雖然很遠，出發就對了！」', 'Allan']] },

 { d: 18, name: 'village', cap: ['2015.09', '吉打州的小村莊'], draw(t) {
    sky(); clouds(t, 'c', 40, 6, .9); sunFlare(200, 60, t, .7);
    hills(330, 50, .008, 6, '#6aa880', '#5a9870');
    X.fillStyle = '#6ab84e'; X.fillRect(0, 330, W, 390);
    kampung(240, 420, .9); kampung(1060, 400, .7);
    for (let i = 0; i < 5; i++) palm(80 + i * 300, 420, 230, (i % 2 ? 12 : -8), t + i);
    // stream
    X.fillStyle = vgrad(440, 520, ['#5ac0e8', '#3a9ad8']); X.beginPath(); X.moveTo(0, 450); X.bezierCurveTo(400, 430, 800, 480, W, 450); X.lineTo(W, 520); X.bezierCurveTo(800, 540, 400, 500, 0, 530); X.fill();
    P(() => { X.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 30; i++) if (Math.sin(t * 3 + i) > .3) X.fillRect(rnd(i) * W, 460 + rnd(i + 4) * 50, 20, 2); });
    kidsSplash(460, 520, t);
    X.fillStyle = '#d8c094'; X.fillRect(0, 590, W, 130);
    hen(lerp(1300, 300, inv(2, 17, t)), 640, .9, t);
    bike(1000, 690, .8, 0, { speed: 0, face: true });
    person(860, 700, 300, { ...ALLAN, skin: TAN, t, expr: t > 8 ? 'happy' : 'grin', arms: [.12, t > 10 ? -2.4 + Math.sin(t * 6) * .25 : -.12] });
    for (let i = 0; i < 6; i++) hibiscus(60 + i * 220, 600 + (i % 2) * 20, 1.2, i);
  }, subs: [[.8, 6, '「村莊房子傍著溪流，一群馬來小孩在溪裡戲水。」', 'Allan'], [6.2, 11.4, '「一隻母雞帶著一群小雞，在我眼前穿過馬路……這不就是桃花源？」', 'Allan'], [11.8, 17.6, '「總有不認識的馬來人，對我微笑、點頭。」', 'Allan']] },

 { d: 20, name: 'fountain', cap: ['2015.10', '工廠的活水'], draw(t) {
    sky(); clouds(t, 'a', 20, 5, .8); sunFlare(1150, 70, t, .8);
    factory(640, 400, 1.1); grassField(400, '#86d066', '#62b04c');
    const trees = Math.floor(clamp(inv(8, 15, t)) * 100);
    for (let i = 0; i < 10; i++) { const g = clamp((trees - i * 9) / 9); if (g <= 0) continue; const tx = 70 + i * 126, ty = 440; X.fillStyle = '#8a5a3a'; X.fillRect(tx - 5, ty - 60 * g, 10, 60 * g); X.beginPath(); X.ellipse(tx, ty - 76 * g, 44 * g, 38 * g, 0, 0, 7); fillInk('#4ab05a', 3); X.fillStyle = '#7ad86a'; ell(tx + 10 * g, ty - 88 * g, 22 * g, 16 * g); X.fill(); }
    const on = inv(2.5, 4, t);
    P(() => { X.translate(640, 590); X.beginPath(); X.ellipse(0, 0, 220, 46, 0, 0, 7); fillInk('#d8d0c0', 3); X.beginPath(); X.ellipse(0, -6, 196, 36, 0, 0, 7); fillInk(on > 0 ? '#6ac8f0' : '#b8a888', 2.5); X.beginPath(); X.roundRect(-22, -116, 44, 110, 10); fillInk('#e8e0d0', 3); X.beginPath(); X.ellipse(0, -118, 62, 14, 0, 0, 7); fillInk('#d8d0c0', 3);
      if (on > 0) { for (let i = 0; i < 40; i++) { const k = ((t * 1.1 + i / 40) % 1), ang = (i / 40 - .5) * 2.4; X.fillStyle = `rgba(200,240,255,${.95 - k * .5})`; ell(Math.sin(ang) * k * 160 * on, -118 - Math.sin(k * Math.PI) * 130 * on + k * 80, 5, 7); X.fill(); } rainbow(0, -60, 160, .5 * on); } });
    if (t > 4) { person(380, 640, 230, { t, hair: 'hijab', hijabC: '#ffb03a', outfit: BLUE, expr: 'happy', ph: 1 }); person(900, 650, 240, { t, skin: DEEP, hairC: BLACKHAIR, hair: 'short', outfit: BLUE, expr: 'grin', ph: 2 }); person(1010, 645, 230, { t, hair: 'long', hairC: WOMANHAIR, outfit: BLUE, expr: 'smile', ph: 3, arms: [.12, -2.5 + Math.sin(t * 6) * .3] }); }
    person(200, 700, 320, { ...ALLAN, skin: TAN, t, expr: t > 4 ? 'happy' : 'smile', arms: t > 4 ? [2.5 - Math.sin(t * 5) * .2, -2.5 + Math.sin(t * 5) * .2] : [.12, -.12] });
    if (t > 8) P(() => { X.font = `900 46px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 8; X.strokeStyle = '#2a6a3a'; X.strokeText(`種樹 ${trees} 棵`, 1080, 250); X.fillStyle = '#ffffff'; X.fillText(`種樹 ${trees} 棵`, 1080, 250); });
    if (on > 0) sparkles(t, 10, [440, 380, 400, 200], 9, '#ffffff', 12);
  }, subs: [[.6, 4, '「荒廢已久的噴水池，我先讓它噴出水。」', 'Allan'], [4.4, 8.6, '「看著員工下班後坐在石椅上聊天吃東西，覺得好欣慰。我喜歡稱它為工廠的『活水』。」', 'Allan'], [9, 15, '「在廠區種了100棵樹。」', 'Allan'], [15.2, 19.6, '「多年後再回來，可以很驕傲地說，這排樹是我任內種的。」', 'Allan']] },

 { d: 18, name: 'water', cap: ['2016.02.02', '請全廠喝水'], draw(t) {
    sky(); clouds(t, 'c', 30, 8, .9); sunFlare(1100, 60, t, .8);
    factory(640, 360, .9); X.fillStyle = '#c8c0b0'; X.fillRect(0, 360, W, 360);
    stall(640, 520, 1.15, '飲料攤 · AIR', '#ff8a3a');
    for (let i = 0; i < 9; i++) drinkCup(470 + i * 40, 470, .9, ['#ff8ab0', '#ffd36b', '#8ae0a0', '#ff6a5a', '#8ac8ff'][i % 5]);
    const crowd = [['hijab', '#ff7aa8', SKIN], ['cap', null, BROWN], ['short', null, DEEP], ['long', null, SKIN], ['hijab', '#7ac8ff', SKIN], ['bun', null, DEEP], ['short', null, SKIN], ['hijab', '#b48aff', SKIN], ['cap', null, BROWN], ['long', null, SKIN]];
    crowd.forEach(([h, hc, sk], i) => { const x = 70 + i * 128 + (i > 4 ? 0 : 0); person(x, 720 + (i % 2) * 12, 230, { t: t + i * .3, ph: i, hair: h, hijabC: hc, capC: '#3a78c8', skin: sk, hairC: h === 'long' || h === 'bun' ? WOMANHAIR : BLACKHAIR, outfit: BLUE, expr: 'happy', hop: t > 4, arms: [.12, t > 4 ? -2.6 + Math.sin(t * 7 + i) * .3 : -.2], holdR: t > 4 ? (k) => drinkCup(0, 0, k / 40, ['#ff8ab0', '#ffd36b', '#8ae0a0'][i % 3]) : null }); });
    if (t > 4) { P(() => { X.font = `900 38px ${VOICE}`; X.textAlign = 'center'; ['Terima kasih!', 'Thank you!', '謝謝！'].forEach((s, i) => { const k = ((t * .5 + i / 3) % 1); X.globalAlpha = Math.sin(k * Math.PI); X.lineWidth = 7; X.strokeStyle = '#ffffff'; X.strokeText(s, 200 + i * 440, 240 - k * 60); X.fillStyle = ['#ff6a3a', '#3a78c8', '#2a9a5a'][i]; X.fillText(s, 200 + i * 440, 240 - k * 60); }); }); }
  }, subs: [[.6, 4.6, '「突發奇想，把路邊攤叫來工廠，請200多個員工『喝水』！」', 'Allan'], [5, 11, '「一下午在工廠隨時有人跟我說謝謝，中、英、馬來語都有。」', 'Allan'], [11.4, 17.6, '「看到員工驚奇、笑得很開心，就是一整個『爽』！」', 'Allan']] },

 { d: 18, name: 'deepavali', cap: ['2016.10.25', 'Happy Deepavali！'], draw(t) {
    X.fillStyle = vgrad(0, H, ['#fff2d8', '#ffd8a8']); X.fillRect(0, 0, W, H);
    X.fillStyle = '#e8c890'; X.fillRect(0, 400, W, 320);
    for (let i = 0; i < 8; i++) { const lx = 80 + i * 160; X.strokeStyle = '#c8783a'; X.lineWidth = 2; X.beginPath(); X.moveTo(lx, 0); X.lineTo(lx, 70); X.stroke(); X.beginPath(); X.ellipse(lx, 90, 22, 26, 0, 0, 7); fillInk(['#ff5a6a', '#ffb03a', '#ffe04a'][i % 3], 2.5); }
    kolam(640, 560, eout(inv(.5, 8, t)), 1.15, .38);
    if (t < 10) {
      person(220, 600, 300, { t, hair: 'bun', skin: DEEP, dress: '#e8304a', sash: '#ffd36b', bindi: true, expr: 'happy', arms: [.12, -2.4 + Math.sin(t * 5) * .2] });
      person(360, 610, 290, { t, hair: 'long', hairC: WOMANHAIR, skin: BROWN, dress: '#7a3ad8', sash: '#ff9a3a', bindi: true, expr: 'smile', ph: 2 });
      person(950, 610, 290, { t, hair: 'short', skin: DEEP, hairC: BLACKHAIR, outfit: outfit('#ffffff', '#d8d8e8'), expr: 'grin', ph: 3 });
      person(1090, 690, 330, { ...ALLAN, skin: TAN, t, expr: 'happy', arms: [.12, -2.5 + Math.sin(t * 6) * .3] });
      P(() => { X.font = `900 64px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 10; X.strokeStyle = '#ffffff'; X.strokeText('Happy Deepavali!', 640, 210); X.fillStyle = '#e8304a'; X.fillText('Happy Deepavali!', 640, 210); });
    } else {
      X.fillStyle = '#ffe8c0'; X.fillRect(0, 0, W, H);
      P(() => { X.translate(640, 560); X.rotate(-.05); X.beginPath(); X.ellipse(0, 0, 380, 120, 0, 0, 7); fillInk('#4ab05a', 4); X.strokeStyle = '#2a8a3a'; X.lineWidth = 3; X.beginPath(); X.moveTo(-370, 0); X.lineTo(370, 0); X.stroke(); [[-200, -20, '#ffffff', 60], [-60, 10, '#e8a03a', 46], [80, -20, '#c84a2a', 40], [200, 20, '#ffd36b', 40], [-130, 50, '#7ac85a', 30]].forEach(([x, y, c, r]) => { X.beginPath(); X.ellipse(x, y, r, r * .6, 0, 0, 7); fillInk(c, 3); }); });
      bust(320, 470, .7, { ...ALLAN, skin: TAN, t, expr: 'happy', lookX: .6, lookY: .3 });
      sparkles(t, 8, [600, 200, 500, 200], 11, '#ffe07a', 14);
    }
  }, subs: [[.6, 5, '「我把公司大廳開放給印度裔員工，布置他們屠妖節的圖騰。」', 'Allan'], [5.2, 9.8, '「他們自發地一人一菜，邀請我一起慶祝。」', 'Allan'], [10.2, 17.6, '「第一次用芭蕉葉吃飯！印度食物真的好吃，我吃得好滿足。」', 'Allan']] },

 { d: 20, name: 'rainbow', cap: ['2016.12', '工廠的奇蹟'], draw(t) {
    if (t < 9.5) {
      sky(['#5a8ad0', '#9ac8f0', '#e8f4ff']); clouds(t, 'b', 20, 4, 1); rainbow(760, 560, 420, eout(inv(.5, 3, t)) * .9);
      factory(760, 520, .8); grassField(520);
      bust(300, 470, .78, { ...ALLAN, skin: TAN, t, lookY: -1, lookX: .8, expr: t > 4 ? 'happy' : 'surprised', tilt: -.1 });
      sparkles(t, 12, [500, 100, 700, 300], 12, '#ffffff', 14);
    } else {
      X.fillStyle = vgrad(0, H, ['#fff4e0', '#ffe0c8']); X.fillRect(0, 0, W, H);
      for (let i = 0; i < 10; i++) { X.fillStyle = ['#ff8ab0', '#ffd36b', '#8ac8ff'][i % 3]; X.beginPath(); X.moveTo(i * 140, 0); X.quadraticCurveTo(i * 140 + 70, 60, i * 140 + 140, 0); X.lineWidth = 3; X.strokeStyle = X.fillStyle; X.stroke(); ell(i * 140 + 70, 40, 18, 22); X.fill(); }
      [[160, { hair: 'hijab', hijabC: '#ff7aa8' }], [300, { hair: 'bun', skin: DEEP, bindi: true }], [980, { hair: 'long', hairC: WOMANHAIR }], [1120, { hair: 'short', skin: BROWN, hairC: BLACKHAIR }]].forEach(([x, o], i) => person(x, 700, 300, { t: t + i, ph: i, ...o, outfit: BLUE, expr: 'happy', talk: true, arms: [2.6 - Math.sin(t * 4 + i) * .2, -2.6 + Math.sin(t * 4 + i) * .2] }));
      cake(640, 690, 1.3, t);
      bust(640, 430, .62, { ...ALLAN, skin: TAN, t, expr: 'grin', teary: true });
      P(() => { X.font = `900 48px ${DISP}`; X.textAlign = 'center'; X.lineWidth = 8; X.strokeStyle = '#ffffff'; X.strokeText('Happy Birthday, Allan!', 640, 110); X.fillStyle = '#ff5a8a'; X.fillText('Happy Birthday, Allan!', 640, 110); });
      petals(t - 9.5, 26, 5);
    }
  }, subs: [[.6, 4.6, '「《海角七號》裡說：『難道，你不期待彩虹？』」', 'Allan'], [4.8, 9.2, '「烏雲密布的星期六早晨，我在工廠看到了奇蹟。」', 'Allan'], [10, 14.6, '「第一次在這麼多人面前被迫當主角，連馬來和印度裔作業員都跑來祝福我。」', 'Allan'], [15, 19.6, '「晚上又被敲房門，唱了一次生日快樂……謝謝你們，想哭了。」', 'Allan']] },

 { d: 22, name: 'family', cap: ['2017.01.14', '檳城 · 家人來了！'], draw(t) {
    sky(); clouds(t, 'a', 30, 6, .9); sunFlare(1120, 70, t, .9);
    hills(320, 50, .009, 3, '#4aa07a', '#3a9070'); sea(330, t);
    X.fillStyle = vgrad(520, H, ['#ffe8b8', '#f2d098']); X.beginPath(); X.moveTo(0, 520); X.bezierCurveTo(400, 500, 900, 540, W, 510); X.lineTo(W, H); X.lineTo(0, H); X.fill();
    P(() => { X.strokeStyle = 'rgba(255,255,255,.9)'; X.lineWidth = 4; X.beginPath(); for (let x = 0; x <= W; x += 20) X.lineTo(x, 516 + Math.sin(x * .02 + t * 2) * 5 + Math.sin(t) * 6); X.stroke(); });
    palm(80, 560, 300, 30, t); palm(1220, 560, 280, -40, t + 2);
    if (t < 13) {
      person(560, 600, 230, { t, hair: 'pigtails', dress: '#ff8ab0', expr: 'happy', outfit: outfit('#ff8ab0', '#d86a90', { shoe: '#ff5a7a' }), hop: true, arms: [2.6 - Math.sin(t * 5) * .3, -2.6 + Math.sin(t * 5) * .3] });
      P(() => { X.fillStyle = 'rgba(255,255,255,.95)'; for (let i = 0; i < 24; i++) { const k = ((t * 1.4 + i / 24) % 1); ell(560 + (rnd(i) - .5) * 160 * k, 580 - Math.sin(k * Math.PI) * 80, 5, 5); X.fill(); } });
      person(760, 640, 300, { t, hair: 'long', hairC: WOMANHAIR, dress: '#ffffff', expr: 'happy', arms: [.12, -2.4 + Math.sin(t * 4) * .2], wind: 2 });
      person(960, 680, 340, { ...ALLAN, skin: TAN, t, expr: 'happy', arms: [2.5 - Math.sin(t * 5) * .2, -2.5 + Math.sin(t * 5) * .2] });
    } else {
      X.fillStyle = vgrad(0, H, ['#ffe0a8', '#ffc890']); X.fillRect(0, 0, W, H); sunFlare(1000, 120, t, .6);
      bust(380, 480, .68, { ...ALLAN, skin: TAN, t, expr: 'happy' });
      bust(900, 520, .62, { t, hair: 'pigtails', expr: 'grin', outfit: outfit('#ff8ab0', '#d86a90', { collar: '#ffffff' }), hand: () => { P(() => { X.translate(-240, -120); X.rotate(-.3); X.beginPath(); X.moveTo(0, -220); X.lineTo(-70, 60); X.lineTo(70, 60); X.closePath(); fillInk('#f6dc9a', 3); ell(0, 70, 36, 30); fillInk(SKIN.base, 3); }); } });
      for (let i = 0; i < 6; i++) { const k = ((t * .4 + i / 6) % 1); heart(560 + i * 30, 360 - k * 200, 1 + rnd(i)); }
    }
  }, subs: [[.6, 6.4, '「我的私房景點：帶老婆和亮晶晶，來可以戲水的海灘！」', 'Allan'], [6.8, 12.6, '「這是第一次和亮晶晶一起搭飛機。上一次跟老婆一起搭飛機，是18年前，度蜜月。」', 'Allan'], [13.2, 21.6, '「實現老婆的願望：吃道地印度人摔的餅、拉的茶。」亮晶晶說：「Roti Tissue 真好吃！」', '']] },

 { d: 18, name: 'puzzle', cap: ['2017.02', '最後拼圖之旅'], draw(t) {
    sky(['#2f86e0', '#7ab8f0', '#cfe8fb']); clouds(t, 'c', 40, 8, 1); sunFlare(1100, 70, t, .8);
    hills(560, 260, .003, 5, '#5ab07a', '#4a9a6a');
    P(() => { X.strokeStyle = '#e8e0d0'; X.lineWidth = 10; X.beginPath(); X.moveTo(-40, 720); X.lineTo(700, 330); X.stroke(); X.strokeStyle = LINE; X.lineWidth = 2; X.stroke(); const k = (t * .05) % 1; P(() => { X.translate(lerp(60, 640, k), lerp(670, 360, k)); X.rotate(-.5); X.beginPath(); X.roundRect(-50, -34, 100, 50, 8); fillInk('#e84a4a', 3); X.fillStyle = '#bfe6ff'; X.fillRect(-40, -26, 26, 20); X.fillRect(-8, -26, 26, 20); X.fillRect(24, -26, 18, 20); }); });
    sea(600, t, '#4ac0e0', '#2a90c8');
    hornbill(lerp(1300, -100, inv(2, 16, t)), 200 + Math.sin(t * 2) * 30, 1.1, t);
    person(1000, 700, 340, { ...ALLAN, skin: TAN, t, expr: 'happy', lookY: -.5, arms: [.12, -2.4 + Math.sin(t * 5) * .25] });
    ['升旗山', '邦咯島犀鳥', '椰殼洞', '極樂寺'].forEach((s, i) => { const k = backE(clamp(inv(1 + i * 2.6, 1.8 + i * 2.6, t))); if (k <= 0) return; P(() => { X.translate(390 + i * 150, 90); X.scale(k, k); X.rotate((i % 2 ? .06 : -.06)); X.beginPath(); X.roundRect(-64, -40, 128, 80, 10); fillInk(['#ffd36b', '#8ae0a0', '#ff8ab0', '#8ac8ff'][i], 3); X.font = `700 22px ${VOICE}`; X.fillStyle = LINE; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(s, 0, 0); }); });
  }, subs: [[.6, 6.2, '「確定外派即將結束，我開始規劃『最後拼圖之旅』。」', 'Allan'], [6.6, 11.8, '「來馬來西亞2年多，檳城熟到不行，就是沒上過升旗山。」', 'Allan'], [12.2, 17.6, '「邦咯島最棒的是，四處可見珍貴的犀鳥！」', 'Allan']] },

 { d: 20, name: 'farewell', cap: ['2017.02.24', '滿滿的祝福'], draw(t) {
    sky(); clouds(t, 'a', 20, 5, .8); sunFlare(1150, 60, t, .8);
    factory(640, 380, 1.05); grassField(380, '#8ad06a', '#6ab04e');
    P(() => { X.beginPath(); X.roundRect(260, 150, 760, 66, 12); fillInk('#ffffff', 3); X.font = `900 36px ${DISP}`; X.textAlign = 'center'; X.fillStyle = '#e8304a'; X.fillText('Terima kasih, Allan! 謝謝你！', 640, 196); });
    const crew = [['hijab', '#ff7aa8', SKIN], ['cap', null, BROWN], ['bun', null, DEEP], ['long', null, SKIN], ['short', null, DEEP], ['hijab', '#5ab89a', SKIN], ['short', null, SKIN], ['hijab', '#b48aff', SKIN]];
    crew.forEach(([h, hc, sk], i) => { const x = 90 + i * 150 + (i > 3 ? 120 : 0); person(x, 600 + (i % 2) * 16, 250, { t: t + i * .4, ph: i, hair: h, hijabC: hc, capC: '#3a78c8', skin: sk, hairC: h === 'long' || h === 'bun' ? WOMANHAIR : BLACKHAIR, outfit: BLUE, expr: t > 12 ? 'grin' : 'happy', teary: t > 12, arms: [.12, -2.6 + Math.sin(t * 6 + i) * .3] }); });
    person(640, 700, 360, { ...ALLAN, skin: TAN, t, expr: 'happy', teary: t > 10, arms: [2.5 - Math.sin(t * 5) * .2, -2.5 + Math.sin(t * 5) * .2] });
    petals(t, 34, 7);
  }, subs: [[.6, 6, '「2017年2月24日，2年5個月的緣分，走到了最後一天。」', 'Allan'], [6.4, 12.6, '「謝謝所有馬來西亞的朋友。」', 'Allan'], [13, 19.6, '「美麗的結局，美麗的回憶！」', 'Allan']] },

 { d: 32, name: 'home', cap: ['2017.02.25', 'PEN → TPE · 回家'], draw(t) {
    if (t < 15) {
      X.fillStyle = '#e8e2d6'; X.fillRect(0, 0, W, H);
      P(() => { X.beginPath(); X.roundRect(700, 70, 460, 520, 170); X.clip(); sky(['#3a8ae0', '#8ac0f0', '#ffe0b0']); clouds(t, 'b', 330, 30, 1); clouds(t + 9, 'c', 460, 50, 1); sunFlare(980, 200, t, .9); });
      X.beginPath(); X.roundRect(700, 70, 460, 520, 170); X.lineWidth = 22; X.strokeStyle = '#cfc8ba'; X.stroke(); X.lineWidth = 3; X.strokeStyle = LINE; X.stroke();
      bust(440, 450, .8, { ...ALLAN, skin: TAN, t, expr: t > 7 ? 'happy' : 'smile', lookX: 1, hand: () => { figurine(240, 60, .95, t); ell(250, 80, 40, 34); fillInk(TAN.base, 3); } });
      sparkles(t, 8, [720, 100, 420, 420], 13, '#ffffff', 14);
    } else {
      const k = inv(15, 30, t);
      sky([mix('#2f86e0', '#4a9ae8', k), '#8ac8f6', '#ffe8c0']); clouds(t, 'a', 260, 8, 1.1); clouds(t + 20, 'c', 60, 4, .9); sunFlare(640, 330, t, 1);
      birds(t, 6, 200, '#ffffff', 25, 9, 1.2);
      petals(t - 15, 24, 11);
      const a1 = eout(inv(16, 18, t)), a2 = eout(inv(20, 22, t)), a3 = eout(inv(24.5, 26.5, t));
      P(() => { X.textAlign = 'center'; X.textBaseline = 'middle';
        X.globalAlpha = a1; X.font = `700 40px ${VOICE}`; X.lineWidth = 8; X.strokeStyle = 'rgba(30,70,150,.75)'; X.strokeText('「一步一腳印，總有春暖花開的時候。」', W / 2, 200); X.fillStyle = '#ffffff'; X.fillText('「一步一腳印，總有春暖花開的時候。」', W / 2, 200);
        X.globalAlpha = a2; X.font = `700 34px ${VOICE}`; X.strokeText('這一切，都成了最溫暖的『曾經』。', W / 2, 270); X.fillStyle = '#ffe07a'; X.fillText('這一切，都成了最溫暖的『曾經』。', W / 2, 270);
        X.globalAlpha = a3; X.font = `900 72px ${DISP}`; X.lineWidth = 12; X.strokeText('Allan 下南洋', W / 2, 470); X.fillStyle = '#ffffff'; X.fillText('Allan 下南洋', W / 2, 470);
        X.font = `700 20px ${VOICE}`; X.lineWidth = 5; const cr = '原作：「Allan下南洋」部落格 2014–2017　·　台詞皆為 Allan 原文　·　繪製與配樂：Claude'; X.strokeText(cr, W / 2, 530); X.fillStyle = '#ffffff'; X.fillText(cr, W / 2, 530); });
    }
  }, subs: [[1, 7.4, '「阿拉蕾，我們2年多的奇幻旅行到了終點……」', 'Allan'], [7.8, 14.6, '「收拾滿滿的祝福，要回家了！」', 'Allan']] },
];
function heart(x, y, s, c = '#ff6a8a') { P(() => { X.translate(x, y); X.scale(s, s); X.beginPath(); X.moveTo(0, 8); X.bezierCurveTo(-18, -6, -10, -20, 0, -10); X.bezierCurveTo(10, -20, 18, -6, 0, 8); fillInk(c, 2); }); }

let acc = 0; SHOTS.forEach(s => { s.start = acc; acc += s.d; });
const TOTAL = acc;
const CHAPTERS = { sky: ['2014', '提起勇氣，出發！'], team: ['2015', '奇幻之旅'], water: ['2016', '有人情味的工廠'], family: ['2017', '滿滿的祝福'] };
function renderFrame(T) {
  const s = SHOTS.find(x => T >= x.start && T < x.start + x.d) || SHOTS[SHOTS.length - 1];
  const t = T - s.start;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
  X.fillStyle = '#fff'; X.fillRect(0, 0, W, H);
  P(() => s.draw(t));
  post(Math.round(T * FPS));
  // soft white flash transitions (bright, anime-style)
  const f = Math.max(1 - inv(0, .5, t), inv(s.d - .5, s.d, t)); if (f > 0) { X.fillStyle = `rgba(255,255,250,${f})`; X.fillRect(0, 0, W, H); }
  if (s.cap) caption(s.cap[0], s.cap[1], eout(inv(.6, 1.4, t)) * (1 - inv(s.d - 1.2, s.d - .5, t)));
  if (CHAPTERS[s.name] && s.name !== 'sky') chapter(CHAPTERS[s.name][0], CHAPTERS[s.name][1], t);
  (s.subs || []).forEach(([a, b, txt, who]) => subtitle(txt, inv(a, a + .4, t) * (1 - inv(b - .4, b, t)), who));
}
window.TOTAL = TOTAL; window.FPS = FPS; window.SHOTS = SHOTS.map(s => ({ name: s.name, start: s.start, d: s.d }));
window.renderFrame = renderFrame;
window.ALLTEXT = SHOTS.flatMap(s => [...(s.subs || []).map(x => x[2] + (x[3] || '')), ...(s.cap || [])]).join('') + Object.values(CHAPTERS).flat().join('') + 'Allan下南洋陽光的記憶2014–2017一步一腳印總有春暖花開的時候這切都成了最溫暖曾經原作部落格台詞皆為原文繪製與配樂榴槤飲料攤種樹棵升旗山邦咯島犀鳥椰殼洞極樂寺謝謝你巴里文打工廠';
window.ready = (async () => { await Promise.all([`700 32px ${VOICE}`, `900 60px ${DISP}`].map(f => document.fonts.load(f, window.ALLTEXT))); await document.fonts.ready; return true; })();
if (!/render/.test(location.search)) { let t0 = null; const st = +(new URLSearchParams(location.search).get('t') || 0); window.ready.then(() => { const loop = ts => { if (t0 === null) t0 = ts; renderFrame((st + (ts - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }); }
