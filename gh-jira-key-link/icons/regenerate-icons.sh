#!/bin/sh
# Regenerate extension icons: white link glyph on GitHub-dark to Jira-purple gradient
set -e

cd "$(dirname "$0")"

cat > /tmp/gh-jira-key-link-icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#24292f"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
  </defs>
  <rect width="24" height="24" rx="4" fill="url(#g)"/>
  <g fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </g>
</svg>
EOF

for size in 16 48 128; do
  rsvg-convert -w ${size} -h ${size} /tmp/gh-jira-key-link-icon.svg -o icon${size}.png
  echo "Generated icon${size}.png"
done

rm /tmp/gh-jira-key-link-icon.svg
