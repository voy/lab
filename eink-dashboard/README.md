# eink-dashboard

Generates a 480×800px greyscale PNG for an e-ink display, updated hourly via Google Cloud Run. The image is served from a public GCS bucket at an unguessable UUID path.

## What it shows

**Header** — day of week + date in Czech, name day from [svatkyapi.cz](https://svatkyapi.cz)

**Weather forecast** — 4 time slots (data from [met.no](https://api.met.no)):
- Ráno (07:00), Poledne (12:00), Odpoledne (15:00), Večer (19:00)
- Each slot: weather icon, temperature, Czech description, precipitation %
- Always shows the *next* occurrence — if 12:00 has passed, shows tomorrow's

**Footer** — sunrise, day length (with ±diff vs yesterday), sunset

## Architecture

```
Cloud Scheduler (hourly)
  → Cloud Run Job
      fetches weather + name day APIs
      renders HTML → PNG via headless Chromium
      uploads to GCS
  → GCS bucket (public-read)
      ← e-ink device polls every hour
```

## Local development

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
python main.py
# output: dashboard.png
```

Runs locally without any GCP credentials — saves `dashboard.png` to disk.

## GCP deployment

### Prerequisites (one-time, manual)

1. Create a GCP project and enable billing
2. `gcloud auth login && gcloud config set project $PROJ`
3. Enable APIs:
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
     cloudscheduler.googleapis.com storage.googleapis.com \
     containerregistry.googleapis.com --project=$PROJ
   ```
4. Authenticate Docker: `gcloud auth configure-docker gcr.io`

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
PROJ=your-gcp-project-id
BUCKET_NAME=your-bucket-name
FEED_ID=your-uuid   # generate with: python3 -c "import uuid; print(uuid.uuid4())"
```

`.env` is gitignored and never committed.

### First deploy

```bash
./deploy.sh
```

Sets up the bucket, service account, IAM roles, builds + pushes the Docker image, deploys the Cloud Run Job, and creates the hourly Cloud Scheduler trigger.

### Redeploy (after code changes)

```bash
./redeploy.sh
```

Rebuilds the image using local Docker layer cache (fast — only the code layer rebuilds), pushes, updates the job, and triggers a test run.

## Dependencies

| Package | Purpose |
|---|---|
| `requests` | API calls |
| `astral` | Sunrise/sunset calculation |
| `playwright` | Headless Chromium screenshot |
| `google-cloud-storage` | GCS upload |
