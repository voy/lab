import os
import datetime
import requests
from zoneinfo import ZoneInfo
from astral import LocationInfo
from astral.sun import sun
from playwright.sync_api import sync_playwright
from google.cloud import storage

# --- CONFIGURATION ---
LAT, LON = 52.5200, 13.4050  # Berlin
TIMEZONE = ZoneInfo("Europe/Berlin")
BUCKET_NAME = os.getenv("BUCKET_NAME")
FEED_ID = os.getenv("FEED_ID")
IS_CLOUD = os.getenv('CLOUD_RUN_JOB')

SYMBOL_CZ = {
    'clearsky': 'Jasno',
    'fair': 'Skoro jasno',
    'partlycloudy': 'Polojasno',
    'cloudy': 'Zataženo',
    'fog': 'Mlha',
    'lightrainshowers': 'Přeháňky',
    'rainshowers': 'Přeháňky',
    'heavyrainshowers': 'Silné přeháňky',
    'lightrain': 'Slabý déšť',
    'rain': 'Déšť',
    'heavyrain': 'Silný déšť',
    'lightsleet': 'Déšť se sněhem',
    'sleet': 'Déšť se sněhem',
    'heavysleet': 'Silné klouzání',
    'lightsnowshowers': 'Sněhové přeháňky',
    'snowshowers': 'Sněhové přeháňky',
    'lightsnow': 'Slabé sněžení',
    'snow': 'Sněžení',
    'heavysnow': 'Silné sněžení',
    'thunder': 'Bouřka',
    'lightrainandthunder': 'Déšť s bouřkou',
    'rainandthunder': 'Déšť s bouřkou',
    'heavyrainandthunder': 'Silná bouřka',
}

def symbol_to_cz(symbol_code):
    base = symbol_code.replace('_day', '').replace('_night', '').replace('_polartwilight', '')
    return SYMBOL_CZ.get(base, base.replace('_', ' ').capitalize())

def get_forecast_slot_for_date(timeseries, target_date, target_hour):
    """Find the forecast entry closest to target_hour on target_date."""
    best, best_diff = None, float('inf')
    for entry in timeseries:
        t = datetime.datetime.fromisoformat(entry['time'].replace('Z', '+00:00'))
        t_local = t.astimezone(TIMEZONE)
        if t_local.date() != target_date:
            continue
        diff = abs(t_local.hour - target_hour)
        if diff < best_diff:
            best_diff = diff
            best = entry
    return best

def get_data():
    print("Gathering data...")
    headers = {'User-Agent': 'EinkDashboard/1.0'}

    weather_url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={LAT}&lon={LON}"
    print(f"  Fetching weather: {weather_url}")
    w_res = requests.get(weather_url, headers=headers, timeout=10)
    print(f"  Weather response: HTTP {w_res.status_code}")
    w_res.raise_for_status()
    timeseries = w_res.json()['properties']['timeseries']
    print(f"  Got {len(timeseries)} forecast entries")

    now_local = datetime.datetime.now(TIMEZONE)
    print(f"  Local time: {now_local.isoformat()}")

    # expires_at: hour at which the slot is replaced by the next one
    slot_defs = [("Ráno", 7, 12), ("Poledne", 12, 15), ("Odpoledne", 15, 19), ("Večer", 19, 24)]
    today = now_local.date()
    tomorrow = today + datetime.timedelta(days=1)

    # Build 8 candidates (today + tomorrow), keep future ones, take first 4
    candidates = []
    for day_offset, date in [(0, today), (1, tomorrow)]:
        for label, hour, expires_at in slot_defs:
            candidates.append((date, label, hour, expires_at, day_offset == 1))

    forecast = []
    for date, label, hour, expires_at, is_tomorrow in candidates:
        if len(forecast) == 4:
            break
        # Skip slots that have expired (next slot's time has arrived)
        if date == today and now_local.hour >= expires_at:
            continue
        entry = get_forecast_slot_for_date(timeseries, date, hour)
        if entry:
            t_local = datetime.datetime.fromisoformat(entry['time'].replace('Z', '+00:00')).astimezone(TIMEZONE)
            temp = round(entry['data']['instant']['details']['air_temperature'])
            summary = entry['data'].get('next_1_hours') or entry['data'].get('next_6_hours') or {}
            symbol = summary.get('summary', {}).get('symbol_code', 'cloudy')
            precip = summary.get('details', {}).get('probability_of_precipitation') or 0
            forecast.append({"label": label, "time": t_local.strftime("%H:%M"), "temp": temp, "symbol": symbol, "desc": symbol_to_cz(symbol), "precip": precip, "tomorrow": is_tomorrow})
            print(f"  {'[zítra] ' if is_tomorrow else ''}{label}: {temp}°C, {symbol}, {precip}% precip")

    # Czech name day + date string
    name_day = ""
    date_str = datetime.date.today().strftime("%-d. %-m. %Y")
    day_of_week = ""
    print("  Fetching name day...")
    try:
        local_date = now_local.strftime("%Y-%m-%d")
        n_res = requests.get(f"https://svatkyapi.cz/api/day/{local_date}", timeout=5)
        print(f"  Name day response: HTTP {n_res.status_code}")
        if n_res.status_code == 200:
            n_data = n_res.json()
            name_day = n_data.get('name', '')
            day_of_week = n_data.get('dayInWeek', '').capitalize()
            month_gen = n_data.get('month', {}).get('genitive', '')
            day_num = n_data.get('dayNumber', '')
            year = n_data.get('year', '')
            if month_gen:
                date_str = f"{day_num}. {month_gen} {year}"
            print(f"  Name day: {name_day}, date: {date_str}")
    except Exception as e:
        print(f"  Name day API failed: {e}")

    # Daylight
    city = LocationInfo("Berlin", "DE", "Europe/Berlin", LAT, LON)
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    s = sun(city.observer, date=today, tzinfo=TIMEZONE)
    s_yesterday = sun(city.observer, date=yesterday, tzinfo=TIMEZONE)
    sunrise = s['sunrise'].strftime("%H:%M")
    sunset = s['sunset'].strftime("%H:%M")
    total_secs = int((s['sunset'] - s['sunrise']).total_seconds())
    total_h, total_rem = divmod(total_secs, 3600)
    total_m = total_rem // 60
    diff_secs = total_secs - int((s_yesterday['sunset'] - s_yesterday['sunrise']).total_seconds())
    diff_m = round(diff_secs / 60)
    diff_str = f"+{diff_m}m" if diff_m >= 0 else f"{diff_m}m"

    return {
        "forecast": forecast,
        "name": name_day,
        "day_of_week": day_of_week,
        "sunrise": sunrise,
        "sunset": sunset,
        "daylight": f"{total_h}h {total_m}m ({diff_str})",
        "date": date_str,
    }


def build_forecast_table(forecast):
    rows_html = ""
    divider_inserted = False
    for f in forecast:
        if f.get("tomorrow") and not divider_inserted:
            rows_html += '<tr class="divider-row"><td colspan="5"><span>Zítra</span></td></tr>'
            divider_inserted = True
        icon_url = f"https://raw.githubusercontent.com/metno/weathericons/main/weather/png/{f['symbol']}.png"
        precip_val = int(f["precip"]) if f.get("precip") is not None else 0
        rows_html += f"""
        <tr>
            <td class="col-label">
                <span class="label-name">{f['label']}</span>
                <span class="label-time">{f['time']}</span>
            </td>
            <td class="col-icon"><img class="row-icon" src="{icon_url}"></td>
            <td class="col-temp">{f['temp']}°</td>
            <td class="col-desc">{f['desc']}</td>
            <td class="col-precip"><div><span class="icon">water_drop</span>{precip_val}%</div></td>
        </tr>"""
    return rows_html


def create_screenshot(data):
    print("Creating screenshot (launching Chromium)...")
    SPACIOUS = True  # set to False to revert to compact layout
    rows_html = build_forecast_table(data['forecast'])
    table_class = "spacious" if SPACIOUS else ""

    html_content = f"""
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=block" rel="stylesheet">
        <style>
            * {{ box-sizing: border-box; margin: 0; padding: 0; }}
            .icon {{
                font-family: 'Material Symbols Outlined';
                font-weight: normal;
                font-style: normal;
                line-height: 1;
                display: inline-block;
                vertical-align: middle;
            }}
            body {{
                background: white; color: black;
                font-family: 'Inter', sans-serif;
                width: 480px; height: 800px;
                display: flex; flex-direction: column;
                padding: 20px;
                gap: 14px;
                filter: grayscale(1);
            }}
            .header {{
                border-bottom: 4px solid black;
                padding-bottom: 10px;
                text-align: center;
            }}
            .date {{ font-size: 32px; font-weight: bold; }}
            .svatek {{ font-size: 21px; margin-top: 5px; }}
            .svatek span {{ font-weight: bold; }}

            table {{
                width: 100%;
                border-collapse: collapse;
            }}
            tr {{ border-bottom: 1px solid #ccc; }}
            tr:last-child {{ border-bottom: none; }}
            td {{ padding: 10px 4px; vertical-align: middle; }}
            .col-label {{
                width: 110px;
                line-height: 1;
            }}
            .label-name {{
                display: block;
                font-size: 13px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
            }}
            .divider-row td {{
                padding: 4px 0 2px;
                border-bottom: 1px solid #ccc;
            }}
            .divider-row span {{
                font-size: 10px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 1px;
                opacity: 0.4;
            }}
            .label-time {{
                display: block;
                font-size: 13px; font-weight: 400;
                opacity: 0.5; margin-top: 5px;
            }}
            .col-icon {{ width: 48px; text-align: center; }}
            .row-icon {{
                width: 44px; height: 44px;
                filter: contrast(400%) brightness(70%);
                display: block; margin: 0 auto;
            }}
            .col-temp {{
                font-size: 28px; font-weight: 600;
                width: 70px; text-align: right;
                padding-right: 12px;
            }}
            .col-desc {{
                font-size: 12px; line-height: 1.4;
                color: #333;
            }}
            .spacious {{ margin: 0 4px; }}
            .spacious td {{ padding: 18px 6px; }}
            .spacious .col-label {{ width: 125px; }}
            .spacious .row-icon {{ width: 64px; height: 64px; }}
            .spacious .col-icon {{ width: 72px; }}
            .spacious .label-name {{ font-size: 15px; }}
            .spacious .label-time {{ font-size: 14px; }}
            .spacious .col-temp {{ font-size: 38px; padding-right: 16px; }}
            .spacious .col-desc {{ font-size: 14px; padding-left: 4px; }}
            .spacious .col-precip div {{ font-size: 13px; }}
            .spacious .col-precip .icon {{ font-size: 15px; }}

            .col-precip {{ vertical-align: middle; }}
            .col-precip div {{
                font-size: 11px; color: #555;
                white-space: nowrap;
                display: flex; align-items: center; gap: 2px;
            }}
            .col-precip .icon {{ font-size: 13px; line-height: 0; position: relative; top: 0.5px; }}

            .footer {{
                border-top: 3px solid black;
                padding-top: 10px;
                margin-top: auto;
            }}
            .sun-row {{
                display: flex;
                justify-content: space-between;
            }}
            .sun-item {{
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
            }}
            .sun-val {{ font-weight: bold; font-size: 24px; }}
            .sun-label {{ font-size: 12px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.3px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="date">{data['day_of_week']} {data['date']}</div>
            <div class="svatek">Svátek: <span>{data['name']}</span></div>
        </div>

        <table class="{table_class}">
            {rows_html}
        </table>

        <div class="footer">
            <div class="sun-row">
                <div class="sun-item">
                    <span class="sun-val">{data['sunrise']}</span>
                    <span class="sun-label">východ</span>
                </div>
                <div class="sun-item">
                    <span class="sun-val">{data['daylight']}</span>
                    <span class="sun-label">délka dne</span>
                </div>
                <div class="sun-item">
                    <span class="sun-val">{data['sunset']}</span>
                    <span class="sun-label">západ</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 480, 'height': 800})
        page.set_content(html_content)
        page.evaluate("document.fonts.ready")
        print("  Rendering page...")
        img_bytes = page.screenshot(type='png')
        browser.close()
    print(f"  Screenshot size: {len(img_bytes)} bytes")
    return img_bytes


def main():
    print(f"Starting. IS_CLOUD={bool(IS_CLOUD)}, BUCKET_NAME={BUCKET_NAME}")
    try:
        data = get_data()
        img = create_screenshot(data)

        if not IS_CLOUD:
            with open("dashboard.png", "wb") as f:
                f.write(img)
            print("Done. dashboard.png saved locally.")
        else:
            print(f"Uploading to gs://{BUCKET_NAME}/{FEED_ID}/dashboard.png ...")
            client = storage.Client()
            bucket = client.bucket(BUCKET_NAME)
            blob = bucket.blob(f"{FEED_ID}/dashboard.png")
            blob.cache_control = "no-store, max-age=0"
            blob.upload_from_string(img, content_type='image/png')
            print(f"Done. https://storage.googleapis.com/{BUCKET_NAME}/{FEED_ID}/dashboard.png")

    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
