"""battwise publisher — official Instagram Graph API, stdlib only.

IG_API=unified (default): Instagram API with Unified Login, graph.facebook.com.
  IG_TOKEN = non-expiring system-user token generated for @battwise.co; IG_USER_ID = its IG account id.
IG_API=instagram: Instagram API with Instagram Login, graph.instagram.com (60-day tokens).

Runs in GitHub Actions on a schedule. Publishes every post whose post.json has
status "approved" and publish_at <= now, then marks it "published".

Env:
  IG_TOKEN          access token (GitHub secret)
  IG_USER_ID        Instagram account id (unified mode)
  MEDIA_BASE_URL    public base URL of the repo files, e.g. https://raw.githubusercontent.com/<owner>/<repo>/<sha>
  IG_EXPECT_USER    safety check, must match the account username (default battwise.co)
  GRAPH_VERSION     e.g. v24.0
  DRY_RUN=1         print what would happen, publish nothing
"""
import datetime as dt, json, os, pathlib, sys, time, urllib.parse, urllib.request, urllib.error

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "posts"
TOKEN = os.environ.get("IG_TOKEN", "")
BASE = os.environ.get("MEDIA_BASE_URL", "").rstrip("/")
EXPECT = os.environ.get("IG_EXPECT_USER", "battwise.co")
VER = os.environ.get("GRAPH_VERSION", "v27.0")
IG_USER_ID = os.environ.get("IG_USER_ID", "")
DRY = os.environ.get("DRY_RUN") == "1"
MODE = os.environ.get("IG_API", "unified")
API = f"https://graph.{'instagram' if MODE == 'instagram' else 'facebook'}.com/{VER}"


def call(method, path, **params):
    params["access_token"] = TOKEN
    data = urllib.parse.urlencode(params).encode()
    url = f"{API}/{path}"
    if method == "GET":
        req = urllib.request.Request(f"{url}?{data.decode()}")
    else:
        req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace").replace(TOKEN, "***")
        raise RuntimeError(f"{method} {path} -> {e.code}: {body}") from None


def wait_ready(container_id, timeout=600):
    t0 = time.time()
    while time.time() - t0 < timeout:
        st = call("GET", container_id, fields="status_code,status").get("status_code")
        if st == "FINISHED":
            return
        if st in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"container {container_id} status {st}")
        time.sleep(10)
    raise RuntimeError(f"container {container_id} not ready after {timeout}s")


def url_for(post_dir, rel):
    return f"{BASE}/posts/{post_dir.name}/{rel}"


def publish(post_dir, meta, uid):
    caption = (post_dir / meta.get("caption_file", "caption.txt")).read_text(encoding="utf-8").strip()
    kind = meta["type"]
    media = meta["media"]
    if kind == "carousel":
        children = []
        for rel in media:
            c = call("POST", f"{uid}/media", image_url=url_for(post_dir, rel), is_carousel_item="true")
            children.append(c["id"])
        for c in children:
            wait_ready(c)
        parent = call("POST", f"{uid}/media", media_type="CAROUSEL", children=",".join(children), caption=caption)["id"]
    elif kind == "reel":
        params = dict(media_type="REELS", video_url=url_for(post_dir, media[0]), caption=caption, share_to_feed="true")
        if meta.get("cover"):
            params["cover_url"] = url_for(post_dir, meta["cover"])
        parent = call("POST", f"{uid}/media", **params)["id"]
    elif kind == "story":
        rel = media[0]
        key = "video_url" if rel.endswith(".mp4") else "image_url"
        parent = call("POST", f"{uid}/media", media_type="STORIES", **{key: url_for(post_dir, rel)})["id"]
    elif kind == "image":
        parent = call("POST", f"{uid}/media", image_url=url_for(post_dir, media[0]), caption=caption)["id"]
    else:
        raise ValueError(f"unknown type {kind}")
    wait_ready(parent, timeout=900)
    pub = call("POST", f"{uid}/media_publish", creation_id=parent)
    info = call("GET", pub["id"], fields="permalink")
    return pub["id"], info.get("permalink", "")


def whoami():
    if MODE == "unified":
        me = call("GET", IG_USER_ID, fields="id,username")
        return me.get("id"), me.get("username")
    if MODE == "facebook":  # token is a Page token: me = the Page
        ig = call("GET", "me", fields="instagram_business_account{id,username}").get("instagram_business_account") or {}
        return ig.get("id"), ig.get("username")
    me = call("GET", "me", fields="user_id,username")
    return me.get("user_id"), me.get("username")


def main():
    now = dt.datetime.now(dt.timezone.utc)
    due = []
    for pj in sorted(POSTS.glob("*/post.json")):
        meta = json.loads(pj.read_text(encoding="utf-8"))
        when = dt.datetime.fromisoformat(meta["publish_at"])
        if meta.get("status") == "approved" and when <= now:
            due.append((pj, meta))
    if os.environ.get("CHECK_ONLY") == "1":
        uid, username = whoami()
        print(f"token ok: @{username} (ig id {uid}), {len(due)} post(s) due"); return
    if not due:
        print("nothing due"); return
    if not TOKEN or not BASE:
        sys.exit("IG_TOKEN and MEDIA_BASE_URL are required")
    uid, username = whoami()
    if username != EXPECT:
        sys.exit(f"token belongs to @{username}, expected @{EXPECT}; refusing to publish")
    failed = False
    for pj, meta in due:
        print(f"publishing {pj.parent.name} ({meta['type']})")
        if DRY:
            print("  dry run, skipped"); continue
        try:
            mid, link = publish(pj.parent, meta, uid)
            meta.update(status="published", media_id=mid, permalink=link, published_at=now.isoformat(timespec="seconds"))
            print("  ok", link)
        except Exception as e:  # keep going with other posts, fail the run at the end
            meta.update(status="failed", error=str(e)[:500])
            print("  FAILED", e); failed = True
        pj.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
