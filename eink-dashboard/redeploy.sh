#!/usr/bin/env bash
# Rebuild image, update Cloud Run Job, and trigger a test run.
# Usage: PROJ=my-gcp-project BUCKET_NAME=my-eink-bucket ./redeploy.sh
set -euo pipefail

err() { echo "ERROR: $*" >&2; exit 1; }

[ -f .env ] && set -a && source .env && set +a

[ -n "${PROJ:-}"                    ] || err "PROJ is not set"
[ -n "${BUCKET_NAME:-}"             ] || err "BUCKET_NAME is not set"
[ -n "${FEED_ID:-}"                 ] || err "FEED_ID is not set"
[ -n "${SCHILDKROETE_USERNAME:-}"   ] || err "SCHILDKROETE_USERNAME is not set"
[ -n "${SCHILDKROETE_PASSWORD:-}"   ] || err "SCHILDKROETE_PASSWORD is not set"

REGION=${REGION:-europe-west1}
IMAGE=gcr.io/${PROJ}/eink-processor

echo "==> Building image locally (uses layer cache)..."
docker build --platform linux/amd64 -t ${IMAGE} .

echo "==> Pushing image..."
docker push ${IMAGE}

echo "==> Updating Cloud Run Job..."
gcloud run jobs update eink-update \
    --image ${IMAGE} \
    --region ${REGION} \
    --project ${PROJ} \
    --set-env-vars BUCKET_NAME=${BUCKET_NAME},FEED_ID=${FEED_ID},SCHILDKROETE_USERNAME=${SCHILDKROETE_USERNAME},SCHILDKROETE_PASSWORD=${SCHILDKROETE_PASSWORD},BIRTHDAYS_GIST_URL=${BIRTHDAYS_GIST_URL}

echo "==> Triggering job (streaming logs)..."
gcloud run jobs execute eink-update \
    --region ${REGION} \
    --project ${PROJ} \
    --wait

echo "==> Done. https://storage.googleapis.com/${BUCKET_NAME}/${FEED_ID}/dashboard.png"
