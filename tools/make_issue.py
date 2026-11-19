"""Markdown body for the weekly approval issue. Usage: python tools/make_issue.py <sha> <post-dir-name>..."""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sha, names = sys.argv[1], sys.argv[2:]
repo = "battwiseco/battwise"
raw = lambda d, p: f"https://raw.githubusercontent.com/{repo}/{sha}/posts/{d}/{p}"
blob = lambda d, p: f"https://github.com/{repo}/blob/{sha}/posts/{d}/{p}"

out = ["Haftalık onay paketi. Hepsi uygunsa bu issue'ya **onay** yaz; gönderiler kuyruğa girer ve issue kapanır.",
       "Düzeltme varsa gönderi numarasıyla yaz (örn. `003 slayt 6 çıksın`); bir sonraki oturumda uygulanır.", "",
       f"<!-- posts: {' '.join(names)} -->", ""]
for name in names:
    d = ROOT / "posts" / name
    meta = json.loads((d / "post.json").read_text(encoding="utf-8"))
    md = (d / "caption.md").read_text(encoding="utf-8")
    title = md.splitlines()[0].lstrip("# ")
    out += [f"## {title}", f"**{meta['publish_at'][:16].replace('T', ' ')} TR** · {meta['type']}", ""]
    if meta["type"] == "reel":
        out += [f"[![cover]({raw(name, meta.get('cover', 'out/cover.jpg'))})]({blob(name, meta['media'][0])})", "", f"▶ [Videoyu izle]({blob(name, meta['media'][0])})", ""]
    else:
        out += [" ".join(f'<img src="{raw(name, m)}" width="180">' for m in meta["media"]), ""]
    cap = (d / meta.get("caption_file", "caption.txt")).read_text(encoding="utf-8").strip()
    out += ["<details><summary>Caption</summary>", "", "```", cap, "```", "</details>", ""]
    qs = re.findall(r"- \[ \] (.+)", md)
    if qs:
        out += ["**Teknik kontrol:**"] + [f"- {q}" for q in qs] + [""]
print("\n".join(out))
