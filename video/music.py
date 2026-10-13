"""Synthesize the soundtrack for the Allan下南洋 short (no samples, pure numpy).

Each shot gets a mood; a mood is a chord progression plus an instrument mix.
Ambient effects (rain, sea, plane cabin, phone ring, bike bell, chimes) follow the storyboard.
Usage: python3 music.py out.wav
"""
import sys, json, numpy as np, wave

SR = 44100
BPM = 76
BEAT = 60 / BPM
BAR = BEAT * 4

# shot name, duration, mood  (must match SHOTS in anim.js)
SHOTS = [
    ('open', 12, 'calm'), ('ch1', 4, 'card'), ('office', 14, 'thoughtful'), ('fork', 7, 'hope'),
    ('goodbye', 9, 'tender'), ('flight', 11, 'hope'), ('dorm', 12, 'tender'), ('dawn', 9, 'calm'),
    ('rain', 14, 'sad'), ('ch2', 4, 'card'), ('newbike', 11, 'bright'), ('ride', 14, 'bright'),
    ('fountain', 14, 'bright'), ('call', 16, 'sad'), ('haze', 7, 'tender'), ('ch3', 4, 'card'),
    ('kindness', 22, 'warm'), ('deepavali', 9, 'warm'), ('seaback', 11, 'swell'), ('xmas', 9, 'sad'),
    ('phonecall', 7, 'thoughtful'), ('ch4', 4, 'card'), ('family', 13, 'bright'), ('puzzle', 13, 'bright'),
    ('byebike', 11, 'tender'), ('farewell', 11, 'tender'), ('home', 12, 'calm'), ('medal', 18, 'finale'),
]
CINE = '--cinematic' in sys.argv
if CINE:
    SHOTS = [
        ('lake', 22, 'calm'), ('taipei', 20, 'thoughtful'), ('depart', 20, 'hope'), ('dorm', 18, 'tender'),
        ('rain', 18, 'sad'), ('ride', 24, 'hope'), ('fountain', 16, 'warm'), ('call', 18, 'sad'),
        ('haze', 12, 'tender'), ('deepavali', 22, 'warm'), ('strait', 20, 'swell'), ('xmas', 14, 'sad'),
        ('beach', 20, 'tender'), ('lastride', 18, 'swell'), ('farewell', 16, 'tender'), ('home', 22, 'finale'),
    ]
SUNNY = '--sunny' in sys.argv
if SUNNY:
    SHOTS = [
        ('sky', 18, 'hope'), ('plane', 18, 'bright'), ('arrive', 18, 'hope'), ('team', 20, 'warm'),
        ('food', 18, 'bright'), ('bike', 22, 'bright'), ('village', 18, 'warm'), ('fountain', 20, 'hope'),
        ('water', 18, 'bright'), ('deepavali', 18, 'warm'), ('rainbow', 20, 'tender'), ('family', 22, 'bright'),
        ('puzzle', 18, 'hope'), ('farewell', 20, 'warm'), ('home', 32, 'finale'),
    ]
if '--allan' in sys.argv:
    SUNNY = True
    SHOTS = [
        ('title', 18, 'hope'), ('decide', 18, 'thoughtful'), ('plane', 16, 'bright'), ('arrive', 18, 'hope'),
        ('worry', 14, 'tender'), ('team', 18, 'warm'), ('food', 16, 'bright'), ('bike', 24, 'bright'),
        ('village', 16, 'warm'), ('fountain', 18, 'hope'), ('water', 16, 'bright'), ('deepavali', 16, 'warm'),
        ('rainbow', 18, 'tender'), ('family', 24, 'bright'), ('puzzle', 20, 'warm'), ('home', 30, 'finale'),
    ]
TOTAL = sum(d for _, d, _ in SHOTS)
N = int(TOTAL * SR) + SR
L = np.zeros(N); Rc = np.zeros(N)

C = {
    'Am': [57, 60, 64], 'F': [53, 57, 60], 'C': [52, 55, 60], 'G': [55, 59, 62], 'Dm': [53, 57, 62],
    'E': [56, 59, 64], 'Em': [55, 59, 64], 'Fmaj7': [53, 57, 60, 64], 'Cadd9': [48, 55, 62, 64],
}
MOODS = {
    'calm':       dict(prog=['Am', 'F', 'C', 'G'], pad=.16, piano=.20, sub=2, marimba=0, shaker=0, bass=.10),
    'thoughtful': dict(prog=['Am', 'F', 'C', 'E'], pad=.14, piano=.22, sub=2, marimba=0, shaker=0, bass=.10),
    'hope':       dict(prog=['C', 'G', 'Am', 'F'], pad=.14, piano=.22, sub=2, marimba=.06, shaker=0, bass=.12),
    'tender':     dict(prog=['Fmaj7', 'C', 'Dm', 'G'], pad=.16, piano=.22, sub=2, marimba=0, shaker=0, bass=.10),
    'sad':        dict(prog=['Am', 'Dm', 'E', 'Am'], pad=.18, piano=.18, sub=1, marimba=0, shaker=0, bass=.08),
    'bright':     dict(prog=['C', 'G', 'Am', 'F'], pad=.10, piano=.16, sub=4, marimba=.14, shaker=.05, bass=.14),
    'warm':       dict(prog=['F', 'G', 'Em', 'Am'], pad=.12, piano=.16, sub=4, marimba=.16, shaker=.06, bass=.14),
    'swell':      dict(prog=['F', 'G', 'Em', 'Am'], pad=.22, piano=.22, sub=2, marimba=0, shaker=0, bass=.14),
    'finale':     dict(prog=['F', 'G', 'Em', 'Am', 'F', 'G', 'Cadd9', 'Cadd9'], pad=.22, piano=.24, sub=2, marimba=.08, shaker=0, bass=.16),
    'card':       None,
}

def hz(m): return 440 * 2 ** ((m - 69) / 12)

def add(buf_l, buf_r, start, sig, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[:N - i] * gain
    buf_l[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * 1.414
    buf_r[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * 1.414

def env(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.exp(-t / d_tau)
    at = int(a * SR)
    if at > 0: e[:at] *= np.linspace(0, 1, at)
    return e

def piano(m, dur=2.4, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = sum((1 / k ** 1.6) * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (0.9 + k * 0.7)) for k in range(1, 7))
    return s * env(n, 0.004, 1.6) * vel

def marimba(m, dur=0.8):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
    return s * env(n, 0.002, 10)

def pad(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in notes:
        for det in (-0.12, 0.0, 0.12):
            f = hz(m + det)
            s += sum((1 / k) * np.sin(2 * np.pi * f * k * t + k) for k in range(1, 6)) * 0.3
    a = int(min(1.2, dur / 3) * SR); r = int(min(1.4, dur / 3) * SR)
    e = np.ones(n); e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r)
    lfo = 1 + 0.08 * np.sin(2 * np.pi * 0.2 * t)
    return s * e * lfo / (len(notes) * 3)

def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * 2 * t)) * env(n, 0.01, dur * 0.7)

rng = np.random.default_rng(3)
def noise(dur): return rng.standard_normal(int(dur * SR))
def lowpass(x, a):
    y = np.empty_like(x); acc = 0.0
    # vectorised one-pole via cumulative filter in chunks
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)

def shaker(dur=0.08):
    x = noise(dur); x = x - lowpass(x, 0.6)
    return x * env(len(x), 0.002, 0.025)

def chime(m, dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return s * env(n, 0.002, 1.1)

# ── music ──
if CINE:
    for k in MOODS:
        if MOODS[k]: MOODS[k] = dict(MOODS[k], marimba=0, shaker=0, sub=min(MOODS[k]['sub'], 2), piano=MOODS[k]['piano'] * .85, pad=MOODS[k]['pad'] * 1.25)
PL = np.zeros(N); PR = np.zeros(N)
t0 = 0.0
for i, (name, d, mood) in enumerate(SHOTS):
    M = MOODS[mood]
    if M is None:  # chapter card: a bell + low pad
        for k, m in enumerate([76, 81, 84]):
            add(L, Rc, t0 + 0.2 + k * 0.35, chime(m), pan=(k - 1) * 0.4, gain=0.12)
        add(L, Rc, t0, pad([45, 52, 57], d + 0.6), gain=0.16)
        t0 += d; continue
    bars = int(np.ceil(d / BAR)) + 1
    for b in range(bars):
        bt = t0 + b * BAR
        if bt >= t0 + d: break
        chord = C[M['prog'][b % len(M['prog'])]]
        seg = min(BAR, t0 + d - bt) + 1.0
        add(L, Rc, bt, pad([n - 12 for n in chord] + [chord[0]], seg + 0.5), gain=M['pad'])
        add(L, Rc, bt, bass(chord[0] - 24, min(BAR, seg)), gain=M['bass'])
        steps = 4 * M['sub']
        arp = chord + [chord[0] + 12, chord[1] + 12] + chord[::-1]
        for s_ in range(steps):
            st = bt + s_ * BAR / steps
            if st >= t0 + d + 0.2: break
            note = arp[s_ % len(arp)] + 12
            add(PL, PR, st, piano(note, vel=0.9 if s_ % M['sub'] == 0 else 0.6), pan=0.3 * np.sin(s_), gain=M['piano'])
            if M['marimba'] and s_ % 2 == 1:
                add(L, Rc, st, marimba(arp[(s_ * 3) % len(arp)] + 24), pan=-0.3, gain=M['marimba'])
            if M['shaker']:
                add(L, Rc, st + BAR / steps / 2, shaker(), pan=0.5, gain=M['shaker'] * (1.3 if s_ % 2 else 0.8))
    if mood == 'finale':  # rising chimes at the end
        for k, m in enumerate([72, 76, 79, 84, 88]):
            add(L, Rc, t0 + 2.0 + k * 0.5, chime(m), pan=(k - 2) * 0.3, gain=0.10)
    t0 += d

# piano bus with echo (longer tails in the cinematic cut)
L += PL; Rc += PR
taps = [(0.37, 0.32, 1), (0.74, 0.2, -1), (1.11, 0.12, 1), (1.6, 0.07, -1)] if CINE else [(0.37, 0.12, 1)]
for dt, g, side in taps:
    k = int(dt * SR)
    src_l, src_r = (PR, PL) if side < 0 else (PL, PR)
    L[k:] += lowpass(src_l[:-k], 0.5) * g; Rc[k:] += lowpass(src_r[:-k], 0.5) * g
# ── ambience / sfx ──
starts = {}; acc = 0.0
for name, d, _ in SHOTS: starts[name] = (acc, d); acc += d
def ambience(name, kind, gain, a=None, b=None):
    s0, d = starts[name]; a = 0 if a is None else a; b = d if b is None else b
    dur = b - a; x = noise(dur)
    if kind == 'rain': x = x - lowpass(x, 0.85); x = lowpass(x, 0.3)
    if kind == 'sea':
        x = lowpass(x, 0.97); tt = np.arange(len(x)) / SR; x *= 0.6 + 0.4 * np.sin(2 * np.pi * tt / 6.5) ** 2
    if kind == 'cabin': x = lowpass(lowpass(x, 0.98), 0.9)
    if kind == 'street': x = lowpass(x, 0.95)
    fade = int(0.8 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    add(L, Rc, s0 + a, x, gain=gain)

if SUNNY:
    ambience('family', 'sea', 0.08); ambience('plane', 'cabin', 0.12); ambience('home', 'cabin', 0.12, 0, 15)
    for k, tt in enumerate([3.0, 3.25]): add(L, Rc, starts['bike'][0] + tt, chime(93 - k * 5, 1.4), pan=0.4, gain=0.14)
    for k, m_ in enumerate([84, 88, 91, 96]): add(L, Rc, starts['rainbow'][0] + 1 + k * .3, chime(m_), gain=0.08)
elif CINE:
    ambience('lake', 'sea', 0.07); ambience('strait', 'sea', 0.10); ambience('beach', 'sea', 0.10); ambience('lastride', 'sea', 0.05)
    ambience('rain', 'rain', 0.18); ambience('xmas', 'rain', 0.08); ambience('depart', 'cabin', 0.18, 9.5, 20); ambience('home', 'cabin', 0.2, 0, 9)
else:
  ambience('open', 'sea', 0.10); ambience('seaback', 'sea', 0.10, 3.6)
  ambience('rain', 'rain', 0.16); ambience('flight', 'cabin', 0.22, 0, 5.5); ambience('home', 'cabin', 0.22, 0, 6.5)
  ambience('xmas', 'street', 0.05)

  def ring(dur=0.35):
      n = int(dur * SR); t = np.arange(n) / SR
      s = (np.sign(np.sin(2 * np.pi * 1180 * t)) + np.sign(np.sin(2 * np.pi * 1480 * t))) * 0.5 * (np.sin(2 * np.pi * 22 * t) > 0)
      return lowpass(s, 0.5) * env(n, 0.005, 2)
  for k in range(3): add(L, Rc, starts['phonecall'][0] + 0.4 + k * 0.7, ring(), gain=0.10)

  def bell():
      return sum(chime(m, 1.6) for m in (88, 93)) * 0.5
  add(L, Rc, starts['newbike'][0] + 3.0, bell(), pan=0.4, gain=0.18)
  add(L, Rc, starts['byebike'][0] + 5.6, bell(), pan=0.4, gain=0.14)

  def click():
      x = noise(0.06); return (x - lowpass(x, 0.7)) * env(len(x), 0.001, 0.01)
  for k in range(1, 5): add(L, Rc, starts['flight'][0] + k * 1.3, click(), gain=0.35)

# fade in / out + gentle limiter
fi = int(1.5 * SR); L[:fi] *= np.linspace(0, 1, fi); Rc[:fi] *= np.linspace(0, 1, fi)
end = int(TOTAL * SR); fo = int(4 * SR)
for B in (L, Rc): B[end - fo:end] *= np.linspace(1, 0, fo); B[end:] = 0
mix = np.stack([L, Rc], 1)[:end]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix /= max(1e-9, np.abs(mix).max()) / 0.89
pcm = (mix * 32767).astype('<i2')
with wave.open([a for a in sys.argv[1:] if not a.startswith('--')][0], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', TOTAL, 's')
