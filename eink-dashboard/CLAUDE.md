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
- `BIRTHDAYS_GIST_URL` — raw URL to private gist with birthday data

## Visual changes

After every change that affects the rendered output (HTML, CSS, layout, data displayed), you MUST:

1. Run `uv run main.py` to regenerate `dashboard.png`
2. Read and visually inspect `dashboard.png`
3. Identify any issues — misalignment, cramped spacing, illegible text, visual clutter
4. Fix them and repeat until the result looks clean and easy to read

The display is 480×800px, grayscale, e-ink. Prioritise clarity and contrast.
