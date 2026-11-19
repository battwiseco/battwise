# battwise — content playbook

Instagram **@battwise.co**: batteries & charging, explained simply. English, global audience (US/EU first).
Faceless. Every post is original: graphics drawn in code, charts redrawn from published data, sources on the last slide.
A battery engineer reviews each weekly batch.

## Weekly calendar (publish 18:30 Europe/Istanbul = `T18:30:00+03:00`)

| Day | Format | Pillar |
|---|---|---|
| Mon | Carousel | Myth or fact |
| Tue | Reel (15–35 s) | By the numbers |
| Wed | Carousel | How it works |
| Thu | Reel | Myth or fact |
| Fri | Carousel | Buying guide (once a month: news breakdown) |

Weeks 1–2: these 4–5 posts only. Later weeks may add a Saturday story (poll/quiz) once stories are supported by the pipeline.

Pillars and goals: Myth or fact → shares (DM) · How it works → saves · Buying guide → saves (+ affiliate later) · By the numbers → watch time · News breakdown → trust.
Topics span phone, laptop, e-bike, EV, home storage, power stations. Never repeat a topic already in `posts/registry.csv`.

## Hard rules (check every post)

- Every technical claim has a **primary source** (manufacturer doc, peer-reviewed paper, government/agency data, Battery University). Open the source and verify the number before using it. List sources on the last slide and in `caption.md`.
- No logos, press photos, film/TV/sport footage, celebrity faces, screenshots of other posts. Brand names only as text.
- Charts are redrawn from data, never copied.
- No music. Reels carry an AI voiceover + code-made sound (see Reel audio below); caption ends with "🎙️ AI voiceover." before the hashtags. No health or investment claims. No build instructions for high-voltage packs. No employer or confidential data.
- No affiliate links, no #ad content until told otherwise.
- Caption: hook first line, 3–5 topical hashtags at the end, keywords written naturally for search. One call to action per post.
- Uncertain safety claim → leave it out and add a question to the engineer-review list.

## Visual identity

Dark navy background, teal→lime gradient accent, yellow bolt, off-white text. Fonts Space Grotesk (headings) + Inter (body), OFL.
Carousels: 1080×1350, `brand/battwise.css` + `brand/frame.js` (adds header, counter, footer). Copy the structure of `posts/003-lfp-vs-nmc/slides.html`.
Reels: 1080×1920, 30 fps, Remotion in `reels/src` using `brand.tsx` (`Frame`, `Stack`, `Tag`, `Hl`, `useIn`). Copy `reels/src/EvCold.tsx`. First 2 seconds = hook. Keep content between y 280 and y 1500.

## Reel audio

Every reel has a voiceover and sound design; never a silent reel.
1. Write `reels/voice/<composition>.json`: `{"voice": "af_heart", "speed": 1.1, "lines": {"<scene>": "spoken text", ...}}`. Spell numbers as words, short sentences, same facts as on screen.
2. `VIRTUAL_ENV=.venv-tts .venv-tts/Scripts/python tools/voice.py <composition>` → `reels/public/vo/<composition>/*.wav` + `durations.json` (local only; one-time setup is in the script header). Commit the wavs.
3. Build the root with `<Bed total={N} />` and one `<Scene comp line from dur>` per scene (brand.tsx). Each scene must be at least voice length + 0.7 s (≈ 21 frames); keep the reel ≤ 35 s. Add `<Sfx name="pop" at={..} />` on chart bars and `<Sfx name="stamp" />` on MYTH/FACT stamps.
4. `tools/render_reel.sh` keeps the mixed audio and normalises it to about −14 LUFS. Check the cover frame is not on a scene cut.

## Post folder layout

```
posts/<NNN>-<slug>/
  slides.html          (carousel)   or a Remotion composition registered in reels/src/index.tsx (reel)
  caption.txt          exact caption published
  caption.md           title, schedule, caption, sources (with URLs + what each supports), "## Engineer review (open)" with "- [ ] question" items, licenses
  post.json            {"id","type":"carousel"|"reel","publish_at","status":"draft","caption_file":"caption.txt","media":[...],"cover"?, "render"?}
```

Carousel `media`: `["out/01.jpg", ...]` one per slide. Reel: `"media": ["out/reel.mp4"], "cover": "out/cover.jpg", "render": {"composition": "<id>", "cover_frame": <frame showing the hook>}`.
Add a row to `posts/registry.csv` with status `draft`.

## Pipeline (automatic)

1. Push drafts to `main` → GitHub Action `render-review` renders JPEGs/MP4s and opens a **weekly-review** issue.
2. Owner comments `onay` → `approve` marks them `approved`.
3. `publish` (every 15 min) posts approved items at `publish_at` through the official Instagram API.

Never set `status` to `approved` yourself. Never touch secrets, workflows or published posts.
