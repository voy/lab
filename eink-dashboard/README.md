# eink-dashboard

Generates a 480×800px greyscale PNG for an e-ink display. Runs locally or on Google Cloud Run (triggered by Cloud Scheduler), uploading the result to a public GCS bucket.

## What it shows

**Header**
- Day of week + date in Czech (e.g. *Pondělí 9. března 2026*)
- Name day from [svatkyapi.cz](https://svatkyapi.cz)

**Weather forecast** — 4-row table (data from [met.no](https://api.met.no))
- Ráno (07:00), Poledne (12:00), Odpoledne (15:00), Večer (19:00)
- Each slot shows: weather icon, temperature, Czech description, precipitation probability
- Slots always show the *next* occurrence — if 12:00 has passed, it shows tomorrow's 12:00

**Footer**
- Sunrise, day length (with ±diff vs yesterday), sunset

## Running locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
python main.py
# output: dashboard.png
```

## Layout toggle

In `create_screenshot()` there is a `SPACIOUS` flag:

```python
SPACIOUS = True  # False = compact, True = larger rows/icons
```

## Cloud deployment

Set the `BUCKET_NAME` environment variable. The script detects it's running on Cloud Run via `K_SERVICE` or `GOOGLE_CLOUD_PROJECT` and uploads to GCS instead of saving locally.

## Dependencies

| Package | Purpose |
|---|---|
| `requests` | API calls |
| `astral` | Sunrise/sunset calculation |
| `playwright` | Headless Chromium screenshot |
| `google-cloud-storage` | GCS upload |
