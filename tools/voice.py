"""Generate voiceover lines for a reel with Kokoro-82M (Apache 2.0, runs locally, $0).

Script file: reels/voice/<composition>.json  ->  {"voice": "am_michael", "speed": 1.05, "lines": {"hook": "text", ...}}
Output:      reels/public/vo/<composition>/<key>.wav  (24 kHz mono) + durations.json (seconds per line)

Usage: .venv-tts/Scripts/python tools/voice.py <composition-id> [--only key1,key2]
Setup once: uv venv -p 3.12 .venv-tts && uv pip install -p .venv-tts kokoro soundfile numpy
"""
import json, pathlib, sys
import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = pathlib.Path(__file__).resolve().parent.parent
comp = sys.argv[1]
only = set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None
spec = json.loads((ROOT / "reels/voice" / f"{comp}.json").read_text(encoding="utf-8"))
out = ROOT / "reels/public/vo" / comp
out.mkdir(parents=True, exist_ok=True)
dur_file = out / "durations.json"
durations = json.loads(dur_file.read_text()) if dur_file.exists() else {}

voice = spec.get("voice", "am_michael")
pipe = KPipeline(lang_code=voice[0])  # 'a' = American English, 'b' = British
for key, text in spec["lines"].items():
    if only and key not in only:
        continue
    chunks = [a for _, _, a in pipe(text, voice=voice, speed=spec.get("speed", 1.0))]
    audio = np.concatenate([np.asarray(c) for c in chunks])
    sf.write(out / f"{key}.wav", audio, 24000)
    durations[key] = round(len(audio) / 24000, 2)
    print(f"{key}: {durations[key]}s  {text}")
dur_file.write_text(json.dumps(durations, indent=2) + "\n")
