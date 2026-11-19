"""Synthesize the reel sound kit in code (original, no licensing): reels/public/sfx/*.wav, 48 kHz.

whoosh.wav  scene transition   pop.wav  chart bar / list item
stamp.wav   MYTH/FACT stamp    pad.wav  40 s ambient bed (mixed low under voice)
Usage: .venv-tts/Scripts/python tools/sfx.py
"""
import pathlib
import numpy as np
import soundfile as sf

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent.parent / "reels/public/sfx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda s: np.arange(int(SR * s)) / SR


def lowpass(x, a):
    """one-pole low-pass, a may be an array (time-varying)"""
    a = np.broadcast_to(a, x.shape)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc); y[i] = acc
    return y


def norm(x, peak):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def stereo(x, width=0.0):
    return np.stack([x * (1 - width), x * (1 + width)], axis=1) if width else np.stack([x, x], axis=1)


# whoosh: noise through a sweeping low-pass, rise then fall
t = t_(0.55)
env = np.sin(np.pi * np.clip(t / 0.55, 0, 1)) ** 2
cut = 0.02 + 0.25 * env
w = lowpass(rng.standard_normal(len(t)), cut) * env
sf.write(OUT / "whoosh.wav", stereo(norm(w, 0.5)), SR)

# pop: short pitched blip with fast decay
t = t_(0.14)
f = 900 * np.exp(-t * 18) + 500
p = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 32)
sf.write(OUT / "pop.wav", stereo(norm(p, 0.45)), SR)

# stamp: low thump + noisy click
t = t_(0.45)
thump = np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 9)
click = lowpass(rng.standard_normal(len(t)), 0.35) * np.exp(-t * 60)
sf.write(OUT / "stamp.wav", stereo(norm(thump + 0.5 * click, 0.8)), SR)

# pad: soft evolving chord (A minor add9 -> F major 7), slow fades, 40 s
L = 40.0; t = t_(L)
chords = [[110.0, 164.81, 220.0, 261.63, 329.63, 493.88], [87.31, 130.81, 174.61, 220.0, 261.63, 329.63]]
seg = 8.0  # seconds per chord
pad = np.zeros_like(t)
for k in range(int(L / seg) + 1):
    notes = chords[k % 2]
    start = k * seg - 1.5
    e = np.clip((t - start) / 2.0, 0, 1) * np.clip((start + seg + 3.0 - t) / 2.0, 0, 1)
    for j, fr in enumerate(notes):
        det = 1 + 0.002 * np.sin(2 * np.pi * 0.1 * t + j)
        pad += e * (np.sin(2 * np.pi * fr * det * t) + 0.3 * np.sin(2 * np.pi * 2 * fr * t)) / (1 + j * 0.4)
pad *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.05 * t)
pad = lowpass(pad, 0.08)
fade = np.clip(t / 1.5, 0, 1) * np.clip((L - t) / 2.0, 0, 1)
L_ = norm(pad * fade, 0.5)
R_ = np.roll(L_, int(SR * 0.012))  # tiny delay for width
sf.write(OUT / "pad.wav", np.stack([L_, R_], axis=1), SR)
print("wrote", sorted(p.name for p in OUT.glob("*.wav")))
