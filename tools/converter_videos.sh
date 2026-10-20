#!/usr/bin/env bash
# Converte as gravacoes de tools/capturar_midias.js no padrao do site.
# Requer ffmpeg e python3. Uso: bash tools/converter_videos.sh
set -euo pipefail
cd "$(dirname "$0")/../assets/projects"
for d in */; do
  d=${d%/}
  if [ -f "$d/cover.jpg" ]; then
    ffmpeg -y -loglevel error -i "$d/cover.jpg" -vf scale=800:500 -q:v 4 "$d/cover-800.jpg"
  fi
  [ -f "$d/raw.webm" ] || continue
  S=$(python3 -c "import json;j=json.load(open('$d/clip.json'));print(max(0,round(j['start']-0.3,2)))")
  T=$(python3 -c "import json;j=json.load(open('$d/clip.json'));print(round(j['end']-j['start']+0.4,2))")
  ffmpeg -y -loglevel error -ss "$S" -t "$T" -i "$d/raw.webm" \
    -vf "fps=24,scale=960:600:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 30 -movflags +faststart -an "$d/preview.mp4"
  ffmpeg -y -loglevel error -ss "$S" -t "$T" -i "$d/raw.webm" \
    -vf "setpts=PTS/1.2,fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" "$d/demo.gif"
  rm -f "$d/raw.webm" "$d/clip.json"
  echo "[OK] $d: preview.mp4 $(du -h "$d/preview.mp4" | cut -f1), demo.gif $(du -h "$d/demo.gif" | cut -f1)"
done
