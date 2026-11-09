# build.py: assemble story/shots.json from the chapter files. Usage: python3 story/build.py
import json, os, sys, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shotlib import S, W, HERE
ENDS = {1: 177.0, 2: 338.15, 3: None, 4: None, 5: None}   # chapter end times (start of the next chapter's first word)
TOTAL = 879.9                                              # voiceover 878.4 s + 1.5 s tail
done = []
for n in range(1, 6):
    if os.path.exists(os.path.join(HERE, f'build_ch{n}.py')): importlib.import_module(f'build_ch{n}'); done.append(n)
last = done[-1]; end_all = TOTAL if last == 5 else ENDS[last]
d = {"title": "24 Hours in the Life of an Airliner", "duration": end_all, "shots": [], "music": [], "sfx": []}
cnt = {}
for i, s in enumerate(S):
    end = S[i + 1]['start'] if i + 1 < len(S) else end_all
    cnt[s['ch']] = cnt.get(s['ch'], 0) + 1
    sh = {"id": f"c{s['ch']}_{cnt[s['ch']]:02d}", "start": s['start'], "end": round(end, 2), "line": ' '.join(x['word'] for x in W if s['start'] - 0.05 <= x['start'] < end - 0.05), "scene": s['scene'], "bars": None,
          "in": {"type": s['tin'], "dur": 0.4} if s['tin'] != 'cut' else {"type": "cut"}, "sfx": s['sfx'], "params": s['params'], "notes": ""}
    if s['amb']: sh['amb'] = {"name": s['amb'], "gain": -26 if s['amb'] in ('roomtone', 'murmur', 'hum') else -24}
    d['shots'].append(sh)
json.dump(d, open(os.path.join(HERE, 'shots.json'), 'w'), indent=1)
bad = [(a['id'], a['start'], a['end']) for a in d['shots'] if a['end'] - a['start'] < 0.7]
print(f"chapters {done}: {len(d['shots'])} shots, ends {end_all}s; too short: {bad}")
