# eink-dashboard

Python script that generates a 480×800 PNG for an e-ink display, uploaded to GCS.

## Running locally

```sh
uv run main.py
```

Uses `uv pip install <pkg>` to add packages (no pyproject.toml, uses requirements.txt + .venv).

## Key dependencies

- `playwright` — renders the HTML dashboard to PNG
- `beautifulsoup4` — parses the Schildkröte lunch HTML
- `python-dotenv` — loads `.env` for local runs (credentials not needed in Cloud Run)

## Env vars (see .env.example)

- `BUCKET_NAME`, `FEED_ID` — GCS upload target
- `SCHILDKROETE_USERNAME`, `SCHILDKROETE_PASSWORD` — login for lunch scraping
