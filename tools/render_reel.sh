#!/usr/bin/env bash
# Usage: tools/render_reel.sh <composition-id> <post-dir> <cover-frame>
# Renders reels/<comp> to <post>/out/reel.mp4 (H.264, 30fps, mixed voice+sound or silent AAC) + cover.jpg
set -euo pipefail
COMP=$1; POST=$2; COVER=${3:-60}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT/$POST/out"
cd "$ROOT/reels"
npx remotion render src/index.tsx "$COMP" "$ROOT/$POST/out/raw.mp4" --codec=h264 --crf=18 --log=error
npx remotion still src/index.tsx "$COMP" "$ROOT/$POST/out/cover.png" --frame="$COVER" --log=error
cd "$ROOT/$POST/out"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 raw.mp4 | grep -q .; then
  # voice + sound mixed by Remotion: normalise loudness for Instagram (~-14 LUFS)
  ffmpeg -y -loglevel error -i raw.mp4 -map 0:v -map 0:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart reel.mp4
else
  ffmpeg -y -loglevel error -i raw.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -shortest -c:v copy -c:a aac -b:a 128k -movflags +faststart reel.mp4
fi
ffmpeg -y -loglevel error -i cover.png -q:v 2 cover.jpg
rm -f raw.mp4 cover.png
echo "done $POST"
