# shotlib.py: helpers shared by the chapter files (build_ch*.py). Run build.py to assemble story/shots.json.
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, '..', 'timeline', 'words.json')))['words']
def w(word, after=0):
    for x in W:
        if x['start'] >= after - 0.05 and x['word'].lower().strip('.,:;!?"').startswith(word): return x['start']
    raise SystemExit('word not found: %s after %s' % (word, after))
def cut(word, after=0): return round(w(word, after) - 0.15, 2)
S = []          # all shots, in order: dict(ch, start, scene, params, sfx, amb, tin)
CH = {'n': 1}
def chapter(n): CH['n'] = n
def shot(start, scene, params, sfx=(), amb=None, tin='cut'):
    S.append(dict(ch=CH['n'], start=start, scene=scene, params=params, sfx=[dict(at=a, name=n, gain=g) for a, n, g in sfx], amb=amb, tin=tin))
