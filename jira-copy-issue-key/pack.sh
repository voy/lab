#!/bin/sh
set -e

cd "$(dirname "$0")"

mkdir -p dist

zip -r dist/jira-copy-issue-key.zip \
  manifest.json \
  popup/ \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png

echo "Created dist/jira-copy-issue-key.zip"
