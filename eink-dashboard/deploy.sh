#!/usr/bin/env bash
# GCP E-Ink Dashboard — setup + deploy (idempotent)
# Prerequisites (one-time manual steps):
#   1. Create a GCP project and enable billing
#   2. Run: gcloud auth login && gcloud config set project $PROJ
#   3. Run: gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
#             cloudscheduler.googleapis.com storage.googleapis.com \
#             containerregistry.googleapis.com --project=$PROJ
#
# Usage: PROJ=my-gcp-project BUCKET_NAME=my-eink-bucket ./deploy.sh
set -euo pipefail

[ -f .env ] && set -a && source .env && set +a

[ -n "${PROJ:-}"                    ] || err "PROJ is not set"
[ -n "${BUCKET_NAME:-}"             ] || err "BUCKET_NAME is not set"
[ -n "${FEED_ID:-}"                 ] || err "FEED_ID is not set"
[ -n "${SCHILDKROETE_USERNAME:-}"   ] || err "SCHILDKROETE_USERNAME is not set"
[ -n "${SCHILDKROETE_PASSWORD:-}"   ] || err "SCHILDKROETE_PASSWORD is not set"

REGION=europe-west1
IMAGE=gcr.io/${PROJ}/eink-processor
SA=eink-sa@${PROJ}.iam.gserviceaccount.com

echo "==> Creating GCS bucket (skip if exists)..."
gcloud storage buckets describe gs://${BUCKET_NAME} --project=${PROJ} &>/dev/null || \
gcloud storage buckets create gs://${BUCKET_NAME} \
    --project=${PROJ} \
    --location=${REGION} \
    --uniform-bucket-level-access

echo "==> Creating service account (skip if exists)..."
gcloud iam service-accounts describe ${SA} --project=${PROJ} &>/dev/null || {
    gcloud iam service-accounts create eink-sa \
        --project=${PROJ} \
        --display-name="E-Ink Dashboard SA"
    echo "    Waiting for SA to propagate..."
    sleep 10
}

echo "==> Granting IAM roles..."
gcloud storage buckets add-iam-policy-binding gs://${BUCKET_NAME} \
    --member="serviceAccount:${SA}" \
    --role="roles/storage.objectAdmin"

gcloud storage buckets add-iam-policy-binding gs://${BUCKET_NAME} \
    --member="allUsers" \
    --role="roles/storage.objectViewer"

gcloud projects add-iam-policy-binding ${PROJ} \
    --member="serviceAccount:${SA}" \
    --role="roles/run.invoker"

echo "==> Building image locally (uses layer cache)..."
docker build --platform linux/amd64 -t ${IMAGE} .

echo "==> Pushing image..."
docker push ${IMAGE}

echo "==> Deploying Cloud Run Job..."
gcloud run jobs deploy eink-update \
    --image ${IMAGE} \
    --region ${REGION} \
    --service-account ${SA} \
    --memory 1Gi \
    --max-retries 1 \
    --project ${PROJ} \
    --set-env-vars BUCKET_NAME=${BUCKET_NAME},FEED_ID=${FEED_ID},SCHILDKROETE_USERNAME=${SCHILDKROETE_USERNAME},SCHILDKROETE_PASSWORD=${SCHILDKROETE_PASSWORD},BIRTHDAYS_GIST_URL=${BIRTHDAYS_GIST_URL}

echo "==> Creating/updating Cloud Scheduler trigger..."
JOB_URI="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJ}/jobs/eink-update:run"
gcloud scheduler jobs describe eink-hourly --location=${REGION} --project=${PROJ} &>/dev/null \
    && gcloud scheduler jobs update http eink-hourly \
        --schedule="0 * * * *" \
        --uri="${JOB_URI}" \
        --message-body='{}' \
        --oauth-service-account-email=${SA} \
        --location=${REGION} \
        --project=${PROJ} \
    || gcloud scheduler jobs create http eink-hourly \
        --schedule="0 * * * *" \
        --uri="${JOB_URI}" \
        --message-body='{}' \
        --oauth-service-account-email=${SA} \
        --location=${REGION} \
        --project=${PROJ}

echo "==> Done."
echo "    Run manually: gcloud run jobs execute eink-update --region=${REGION} --project=${PROJ}"
echo "    Dashboard:    https://storage.googleapis.com/${BUCKET_NAME}/dashboard.png"
