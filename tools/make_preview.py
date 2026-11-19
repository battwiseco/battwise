"""Build a one-page weekly approval preview: python tools/make_preview.py 002 003 004 > review/week.html
Shows every slide / video, caption, schedule, sources and open engineer-review questions."""
import html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ids = sys.argv[1:]
out = ROOT / "review" / "index.html"
out.parent.mkdir(exist_ok=True)

cards = []
for pid in ids:
    d = next((ROOT / "posts").glob(f"{pid}-*"))
    meta = json.loads((d / "post.json").read_text(encoding="utf-8"))
    md = (d / "caption.md").read_text(encoding="utf-8")
    title = md.splitlines()[0].lstrip("# ")
    cap = (d / meta.get("caption_file", "caption.txt")).read_text(encoding="utf-8")
    review = re.findall(r"- \[ \] (.+)", md)
    srcs = re.findall(r"^- (.+)$", md.split("## Sources", 1)[1].split("##", 1)[0], re.M) if "## Sources" in md else []
    rel = lambda p: f"../posts/{d.name}/{p}"
    if meta["type"] == "reel":
        media = f'<video src="{rel(meta["media"][0])}" poster="{rel(meta.get("cover", ""))}" controls playsinline></video>'
    else:
        media = '<div class="strip">' + "".join(f'<img src="{rel(m)}" loading="lazy">' for m in meta["media"]) + "</div>"
    cards.append(f"""
<section>
  <h2>{html.escape(title)}</h2>
  <p class="when">{meta['publish_at'][:16].replace('T', ' ')} TR · {meta['type']} · status: <b>{meta['status']}</b></p>
  {media}
  <h3>Caption</h3><pre>{html.escape(cap)}</pre>
  {'<h3>Teknik kontrol</h3><ul class="q">' + ''.join(f'<li>{html.escape(r)}</li>' for r in review) + '</ul>' if review else ''}
  <h3>Sources</h3><ul class="s">{''.join(f'<li>{html.escape(s)}</li>' for s in srcs)}</ul>
</section>""")

out.write_text(f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>battwise · haftalık onay</title>
<style>
body{{margin:0;background:#07131F;color:#EAF8F3;font:16px/1.5 system-ui,sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px 80px}}
h1{{font-size:28px}} section{{border-top:1px solid #23435a;padding:24px 0}}
h2{{margin:0;font-size:22px}} .when{{color:#9CBACB;margin:4px 0 16px}}
.strip{{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}} .strip img{{height:420px;border-radius:10px}}
video{{height:640px;max-width:100%;border-radius:12px;background:#000}}
pre{{white-space:pre-wrap;background:#0d2232;padding:14px;border-radius:10px;font:15px/1.5 system-ui}}
.q li{{color:#FFC933}} .s li{{color:#9CBACB;font-size:14px;word-break:break-all}}
</style></head><body><main>
<h1>battwise · haftalık onay ({', '.join(ids)})</h1>
<p>Onay için sohbete <b>"onay"</b> yaz. Düzeltme varsa gönderi numarasıyla yaz (örn. "003 slayt 6: ...").</p>
{''.join(cards)}
</main></body></html>""", encoding="utf-8")
print(out)
