#!/bin/sh
set -e

cd "$(dirname "$0")"

mkdir -p dist

zip -r dist/gh-jira-key-link.zip \
  manifest.json \
  content.js \
  styles.css \
  popup/ \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png

echo "Created dist/gh-jira-key-link.zip"
