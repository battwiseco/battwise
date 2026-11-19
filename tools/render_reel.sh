#!/usr/bin/env bash
# Usage: tools/render_reel.sh <composition-id> <post-dir> <cover-frame>
# Renders reels/<comp> to <post>/out/reel.mp4 (H.264, 30fps, silent AAC track) + cover.jpg
set -euo pipefail
COMP=$1; POST=$2; COVER=${3:-60}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT/$POST/out"
cd "$ROOT/reels"
npx remotion render src/index.tsx "$COMP" "$ROOT/$POST/out/raw.mp4" --codec=h264 --crf=18 --log=error
npx remotion still src/index.tsx "$COMP" "$ROOT/$POST/out/cover.png" --frame="$COVER" --log=error
cd "$ROOT/$POST/out"
ffmpeg -y -loglevel error -i raw.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -shortest -c:v copy -c:a aac -b:a 128k -movflags +faststart reel.mp4
ffmpeg -y -loglevel error -i cover.png -q:v 2 cover.jpg
rm -f raw.mp4 cover.png
echo "done $POST"
