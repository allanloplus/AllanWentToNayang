"""Build the keepsake page.

src/page.html  - page body (artifact fragment, no <html>/<head>)
src/maps.json  - map outlines (Natural Earth, pre-projected)
src/urls.json  - blog post index -> path on allanlo-go.blogspot.com

Outputs:
  index.html     - standalone page (open locally or via GitHub Pages)
  dist/page.html - fragment used for the claude.ai Artifact
"""
import json, os, re
root = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(root, 'src/page.html'), encoding='utf-8').read()
maps = json.load(open(os.path.join(root, 'src/maps.json')))
urls = json.load(open(os.path.join(root, 'src/urls.json')))
for k in maps:
    maps[k] = {x: maps[k][x] for x in ('w', 'h', 'land', 'borders', 'bbox', 'k', 'sx')}
body = src.replace('__MAPS__', json.dumps(maps, separators=(',', ':'))).replace('__URLS__', json.dumps(urls, separators=(',', ':')))
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
open(os.path.join(root, 'dist/page.html'), 'w', encoding='utf-8').write(body)
title = re.search(r'<title>.*?</title>', body).group(0)
doc = ('<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       + body.replace(title, title, 1).split('<style>')[0]
       + '<style>' + body.split('<style>', 1)[1].split('</style>', 1)[0] + '</style>\n</head>\n<body>\n'
       + body.split('</style>', 1)[1] + '\n</body>\n</html>\n')
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(doc)
print('ok', len(doc))
