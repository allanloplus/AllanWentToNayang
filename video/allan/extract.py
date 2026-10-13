"""Cut Allan's character sheets into transparent sprites.

Background = near-white pixels connected to the image (or panel) border.
Enclosed whites (eyes, glasses glare, sneaker stripes) are kept.
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

def cutout(rgb, thr=232):
    a = np.asarray(rgb).astype(np.int16)
    white = (a.min(axis=2) >= thr)
    lab, n = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    alpha = (~bg).astype(np.uint8) * 255
    al = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    out = rgb.convert('RGBA'); out.putalpha(al)
    return out, ~bg

def save_components(path, prefix, min_area=40000, names=None):
    im = Image.open(path).convert('RGB')
    out, fg = cutout(im)
    lab, n = ndi.label(ndi.binary_closing(fg, iterations=6))
    objs = ndi.find_objects(lab)
    comps = [(sl, (lab[sl] == i + 1).sum()) for i, sl in enumerate(objs)]
    comps = [c for c in comps if c[1] > min_area]
    comps.sort(key=lambda c: c[0][1].start)
    for k, (sl, area) in enumerate(comps):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        crop = out.crop((max(0, x0 - 4), max(0, y0 - 4), min(im.width, x1 + 4), min(im.height, y1 + 4)))
        name = names[k] if names and k < len(names) else f'{prefix}{k}'
        crop.save(f'sprites/{name}.png'); print(name, crop.size)

save_components('ref-poses.jpg', 'pose', names=['stand', 'wave'])
save_components('ref-turnaround.jpg', 'turn', names=['front', 'threeq', 'side', 'back'])

# expressions: 3x3 panels separated by black rules
im = Image.open('ref-expressions.jpg').convert('RGB'); a = np.asarray(im)
dark = a.max(axis=2) < 90
cols = np.where(dark.mean(axis=0) > .6)[0]; rows = np.where(dark.mean(axis=1) > .6)[0]
def groups(idx):
    g = []; 
    for i in idx:
        if g and i - g[-1][-1] <= 3: g[-1].append(i)
        else: g.append([i])
    return [(x[0], x[-1]) for x in g]
cg, rg = groups(cols), groups(rows)
print('rules', cg, rg)
xs = [0] + [c for g in cg for c in g] + [im.width]; ys = [0] + [r for g in rg for r in g] + [im.height]
xb = [(xs[i] + 6, xs[i + 1] - 6) for i in range(0, len(xs), 2)]; yb = [(ys[i] + 6, ys[i + 1] - 6) for i in range(0, len(ys), 2)]
names = ['smile', 'laugh', 'think', 'surprised', 'explain', 'worried', 'cry', 'wink', 'talk']
k = 0
for (y0, y1) in yb:
    for (x0, x1) in xb:
        if y1 - y0 < 200 or x1 - x0 < 200: continue
        panel = im.crop((x0, y0, x1, y1))
        # make the bottom edge not count as background border (bust is cut there)
        pad = Image.new('RGB', (panel.width + 2, panel.height + 2), 'white'); pad.paste(panel, (1, 1))
        a2 = np.asarray(pad).copy(); a2[-2:, :, :] = 0  # seal bottom
        out, fg = cutout(Image.fromarray(a2))
        out = out.crop((1, 1, panel.width + 1, panel.height + 1))
        o = np.asarray(out).copy(); o[-2:, :, 3] = o[-4:-2, :, 3].max(axis=0); out = Image.fromarray(o)
        bb = out.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox(); out = out.crop(bb)
        out.save(f'sprites/x_{names[k]}.png'); print(names[k], out.size); k += 1
