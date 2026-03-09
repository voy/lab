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
BUCKET_NAME = os.getenv("BUCKET_NAME", "your-eink-bucket-name")
IS_CLOUD = os.getenv('K_SERVICE') or os.getenv('GOOGLE_CLOUD_PROJECT')

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

def get_forecast_slot(timeseries, target_hour, now_local):
    """Find the forecast entry for target_hour on today, or tomorrow if that hour has passed."""
    target_date = now_local.date()
    if now_local.hour >= target_hour:
        target_date += datetime.timedelta(days=1)

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
    headers = {'User-Agent': 'EinkDashboard/1.0 (admin@example.com)'}

    weather_url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={LAT}&lon={LON}"
    w_res = requests.get(weather_url, headers=headers, timeout=10)
    timeseries = w_res.json()['properties']['timeseries']

    now_local = datetime.datetime.now(TIMEZONE)

    slots = [("Ráno", 7), ("Poledne", 12), ("Odpoledne", 15), ("Večer", 19)]
    forecast = []
    for label, hour in slots:
        entry = get_forecast_slot(timeseries, hour, now_local)
        if entry:
            t_local = datetime.datetime.fromisoformat(entry['time'].replace('Z', '+00:00')).astimezone(TIMEZONE)
            temp = round(entry['data']['instant']['details']['air_temperature'])
            summary = entry['data'].get('next_1_hours') or entry['data'].get('next_6_hours') or {}
            symbol = summary.get('summary', {}).get('symbol_code', 'cloudy')
            precip = summary.get('details', {}).get('probability_of_precipitation') or 0
            forecast.append({"label": label, "time": t_local.strftime("%H:%M"), "temp": temp, "symbol": symbol, "desc": symbol_to_cz(symbol), "precip": precip})

    # Czech name day + date string
    name_day = ""
    date_str = datetime.date.today().strftime("%-d. %-m. %Y")
    day_of_week = ""
    try:
        n_res = requests.get("https://svatkyapi.cz/api/day", timeout=5)
        if n_res.status_code == 200:
            n_data = n_res.json()
            name_day = n_data.get('name', '')
            day_of_week = n_data.get('dayInWeek', '').capitalize()
            month_gen = n_data.get('month', {}).get('genitive', '')
            day_num = n_data.get('dayNumber', '')
            year = n_data.get('year', '')
            if month_gen:
                date_str = f"{day_num}. {month_gen} {year}"
    except Exception as e:
        print(f"Name day API failed: {e}")

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
    for f in forecast:
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
    print("Creating screenshot...")
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
        img_bytes = page.screenshot(type='png')
        browser.close()
    return img_bytes


def main():
    try:
        data = get_data()
        img = create_screenshot(data)

        if not IS_CLOUD:
            with open("dashboard.png", "wb") as f:
                f.write(img)
            print("Success! dashboard.png saved locally.")
        else:
            client = storage.Client()
            bucket = client.bucket(BUCKET_NAME)
            blob = bucket.blob("dashboard.png")
            blob.cache_control = "no-store, max-age=0"
            blob.upload_from_string(img, content_type='image/png')
            blob.make_public()
            print("Success! Uploaded to Cloud Storage.")

    except Exception as e:
        print(f"Error occurred: {e}")


if __name__ == "__main__":
    main()
