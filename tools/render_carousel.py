"""Render a battwise carousel (slides.html) to 1080x1350 PNGs with headless Chrome.

Usage: python tools/render_carousel.py posts/001-overnight-charging
Output: <post>/out/01.png ... and 01.jpg ... (Instagram API accepts JPEG only)
"""
import os, pathlib, re, shutil, subprocess, sys

CHROME_CANDIDATES = [
    os.environ.get("CHROME", ""),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    shutil.which("google-chrome") or "", shutil.which("chromium") or "", shutil.which("chromium-browser") or "",
]

def main():
    post = pathlib.Path(sys.argv[1]).resolve()
    html = post / "slides.html"
    n = len(re.findall(r'<section class="slide"', html.read_text(encoding="utf-8")))
    out = post / "out"
    out.mkdir(exist_ok=True)
    chrome = next(c for c in CHROME_CANDIDATES if c and pathlib.Path(c).exists())
    for i in range(1, n + 1):
        png = out / f"{i:02d}.png"
        subprocess.run([
            chrome, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
            "--force-device-scale-factor=1", "--window-size=1080,1350",
            "--allow-file-access-from-files", "--virtual-time-budget=3000",
            f"--screenshot={png}", f"{html.as_uri()}?s={i}",
        ], check=True, capture_output=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(png), "-q:v", "2", str(png.with_suffix(".jpg"))], check=True)
        print("rendered", png.name, "+ jpg")

if __name__ == "__main__":
    main()
