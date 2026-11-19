"""Render every draft post (carousel slides.html or Remotion reel) and print their ids.

A reel's post.json carries {"render": {"composition": "<remotion id>", "cover_frame": 80}}.
Usage: python tools/render_pending.py            (renders all drafts)
"""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
done = []
for pj in sorted((ROOT / "posts").glob("*/post.json")):
    meta = json.loads(pj.read_text(encoding="utf-8"))
    if meta.get("status") != "draft":
        continue
    d = pj.parent
    if (d / "slides.html").exists():
        subprocess.run([sys.executable, str(ROOT / "tools/render_carousel.py"), str(d)], check=True)
    elif meta.get("render", {}).get("composition"):
        r = meta["render"]
        subprocess.run(["bash", str(ROOT / "tools/render_reel.sh"), r["composition"], f"posts/{d.name}", str(r.get("cover_frame", 60))], check=True, cwd=ROOT)
    else:
        print(f"skip {d.name}: nothing to render", file=sys.stderr)
        continue
    done.append(d.name)
print(" ".join(done))
