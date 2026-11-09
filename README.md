# Stickman Studio

Code-rendered stick-figure videos (GrowKaz Stickman toolkit + custom sets/templates), plus the scripts behind them.

- `growkaz-stickman-studio/`: the renderer (`render.mjs`), engine, audio tools, and one folder per video in `projects/`.
- `scripts/`: narration scripts and ElevenLabs-ready versions.

## Setup on a new machine
```bash
cd growkaz-stickman-studio
npm install
npx playwright install chromium
pip install numpy scipy faster-whisper
python3 tools/doctor.py
```
Needs Node 18+, Python 3.9+, ffmpeg.

## Render a project
```bash
node render.mjs --project projects/airliner-24h --sheet --scale 0.4                   # contact sheet
node render.mjs --project projects/airliner-24h --from 0 --to 30 --scale 0.5          # preview clip
node render.mjs --project projects/airliner-24h                                       # full render -> build/video_silent.mp4
python3 audio/mix.py --project projects/airliner-24h                                  # sound + final MP4 -> out/
```

## Projects
| Project | Format | Status |
|---|---|---|
| planes-35000ft | 16:9 720p, Arctic Glass | done |
| turbulence-short | 9:16 1080p, captions | done |
| langley-wrights | 9:16 1080p, Retro Print, captions | done |
| airliner-24h | 16:9 720p, Arctic Glass, 14:38 | chapter 1 of 5 built (data-driven templates in `scenes/templates.js`, shot data from `story/build_ch*.py`) |
