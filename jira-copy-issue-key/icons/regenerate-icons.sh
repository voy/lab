#!/bin/sh
# Regenerate extension icons: bold white # on indigo-purple gradient
set -e

cd "$(dirname "$0")"

cat > /tmp/jira-key-icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="url(#g)"/>
  <text x="64" y="64"
    font-family="Helvetica, Arial, sans-serif"
    font-weight="bold"
    font-size="90"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central">#</text>
</svg>
EOF

for size in 16 48 128; do
  magick -background none /tmp/jira-key-icon.svg -resize ${size}x${size} icon${size}.png
  echo "Generated icon${size}.png"
done

rm /tmp/jira-key-icon.svg
