import os
import re
import json
from dotenv import load_dotenv
load_dotenv()
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
SCHILDKROETE_USERNAME = os.getenv("SCHILDKROETE_USERNAME")
SCHILDKROETE_PASSWORD = os.getenv("SCHILDKROETE_PASSWORD")
BIRTHDAYS_GIST_URL = os.getenv("BIRTHDAYS_GIST_URL")

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

def login_schildkroete():
    """Log in and return an authenticated requests.Session."""
    login_url = "https://bestellung.schildkroete-berlin.de/login/?next=/kunden/"
    session = requests.Session()
    # Fetch login page to get the CSRF token
    resp = session.get(login_url, timeout=10)
    resp.raise_for_status()
    from html.parser import HTMLParser
    class CSRFParser(HTMLParser):
        token = None
        def handle_starttag(self, tag, attrs):
            if tag == "input":
                d = dict(attrs)
                if d.get("name") == "csrfmiddlewaretoken":
                    self.token = d.get("value")
    parser = CSRFParser()
    parser.feed(resp.text)
    csrf = parser.token
    print(f"  CSRF token: {csrf[:8]}..." if csrf else "  No CSRF token found")
    payload = {
        "username": SCHILDKROETE_USERNAME,
        "password": SCHILDKROETE_PASSWORD,
        "csrfmiddlewaretoken": csrf,
        "next": "/kunden/",
    }
    resp = session.post(login_url, data=payload, timeout=10, headers={"Referer": login_url})
    resp.raise_for_status()
    print(f"  Login POST → {resp.url}")
    return session


def strip_allergens(text):
    # "An allen Grundschulen: Rosinenbrötchen (G1, M) aus ..." → "Rosinenbrötchen"
    text = re.sub(r'^An allen Grundschulen:\s*(.+?)(?:\s*\([A-Z].*|\s+aus\b.*|\s+vom\b.*)', r'\1', text)
    # Remove parenthetical allergen codes like (E1, G1, M) or (S2)
    text = re.sub(r'\s*\([A-Z][A-Z0-9]*(?:,\s*[A-Z][A-Z0-9]*)*\)', '', text)
    return re.sub(r'  +', ' ', text).strip()


def _load_birthdays():
    raw = None
    local = os.path.join(os.path.dirname(__file__), "birthdays.json")
    if os.path.exists(local):
        with open(local) as f:
            raw = json.load(f)
    elif BIRTHDAYS_GIST_URL:
        print("  Fetching birthdays from gist...")
        raw = requests.get(BIRTHDAYS_GIST_URL, timeout=5).json()
    if not raw:
        return []
    result = []
    for b in raw:
        date_of_birth_str = b.get("dateOfBirth")
        if date_of_birth_str:
            result.append(dict(b, date_of_birth=datetime.date.fromisoformat(date_of_birth_str)))
    return result

BIRTHDAYS = _load_birthdays()

_CZ_MONTHS_GEN = [
    "ledna", "února", "března", "dubna", "května", "června",
    "července", "srpna", "září", "října", "listopadu", "prosince",
]

def get_upcoming_birthdays(today, n=2, birthdays_list=None):
    if birthdays_list is None:
        birthdays_list = BIRTHDAYS
    result = []
    for b in birthdays_list:
        date_of_birth = b["date_of_birth"]
        try:
            next_bday = date_of_birth.replace(year=today.year)
        except ValueError:
            next_bday = date_of_birth.replace(year=today.year, day=28)
        if next_bday < today:
            try:
                next_bday = date_of_birth.replace(year=today.year + 1)
            except ValueError:
                next_bday = date_of_birth.replace(year=today.year + 1, day=28)
        days_until = (next_bday - today).days
        age = next_bday.year - date_of_birth.year
        is_today = days_until == 0
        result.append({"name": b["name"], "date": next_bday, "days_until": days_until, "age": age, "is_today": is_today})
    result.sort(key=lambda x: x["days_until"])
    return result[:n]

def _czech_age(years):
    if years == 1: return "1 rok"
    if 2 <= years <= 4: return f"{years} roky"
    return f"{years} let"  # 5, 12, 23, 40 … all take "let"

def _czech_days(days):
    if days == 0: return "dnes!"
    if days == 1: return "zítra"
    if 2 <= days <= 4: return f"za {days} dny"
    return f"za {days} dní"

_CZ_DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"]

def lunch_target_date(today, hour):
    """Return (target_date, label) for the relevant lunch day."""
    if today.weekday() < 5 and hour < 12:
        return today, "Dnes"
    candidate = today + datetime.timedelta(days=1)
    while candidate.weekday() >= 5:
        candidate += datetime.timedelta(days=1)
    diff = (candidate - today).days
    label = "Zítra" if diff == 1 and today.weekday() < 5 else _CZ_DAYS[candidate.weekday()]
    return candidate, label


def parse_lunch_html(html, target_weekday):
    """Parse the meal-plan page HTML and return {first_name: meal_or_status}."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    result = {}
    for panel in soup.find_all("div", class_="panel-mealplan"):
        childname = panel.find("span", class_="childname").get_text(strip=True)
        first_name = childname.split(",")[-1].strip().lower()

        rows = panel.find("table", class_="food-order").find("tbody").find_all("tr", recursive=False)

        ordered_meal = None
        day_closed = False
        for i, row in enumerate(rows):
            meal_cells = row.find_all("td", class_="menu-cell")
            if not meal_cells or target_weekday >= len(meal_cells):
                continue
            cell = meal_cells[target_weekday]
            if "day-closed" in cell.get("class", []):
                day_closed = True
                break
            meal_text = strip_allergens(cell.get_text(" ", strip=True))

            order_row = rows[i + 3] if i + 3 < len(rows) else None
            if order_row:
                order_cells = order_row.find_all("td", class_="order-button-cell")
                if target_weekday < len(order_cells):
                    form = order_cells[target_weekday].find("form")
                    if form and form.get("data-order-status") == "1":
                        ordered_meal = meal_text
                        break

        result[first_name] = "zavřeno" if day_closed else ordered_meal
    return result


def get_lunch_data(session):
    now = datetime.datetime.now(TIMEZONE)
    target, day_label = lunch_target_date(now.date(), now.hour)
    year, week, _ = target.isocalendar()
    url = f"https://bestellung.schildkroete-berlin.de/kunden/essen/{year}/{week}/"
    print(f"  Fetching lunch data: {url} (weekday col {target.weekday()})")
    resp = session.get(url, timeout=10)
    resp.raise_for_status()
    result = parse_lunch_html(resp.text, target.weekday())
    for name, meal in result.items():
        print(f"  {name}: {meal[:60] if meal else 'nothing ordered'}")
    return result, day_label


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
    slot_defs = [("Ráno", 7, 12), ("Pol.", 12, 15), ("Odpo.", 15, 19), ("Večer", 19, 24)]
    today = now_local.date()
    tomorrow = today + datetime.timedelta(days=1)

    # Always show all 4 slots; if today's slot has expired, show tomorrow's with a badge
    forecast = []
    for label, hour, expires_at in slot_defs:
        is_tomorrow = now_local.hour >= expires_at
        date = tomorrow if is_tomorrow else today
        entry = get_forecast_slot_for_date(timeseries, date, hour)
        if entry:
            t_local = datetime.datetime.fromisoformat(entry['time'].replace('Z', '+00:00')).astimezone(TIMEZONE)
            temp = round(entry['data']['instant']['details']['air_temperature'])
            summary = entry['data'].get('next_1_hours') or entry['data'].get('next_6_hours') or {}
            symbol = summary.get('summary', {}).get('symbol_code', 'cloudy')
            precip_block = entry['data'].get('next_1_hours') or entry['data'].get('next_6_hours') or {}
            precip = precip_block.get('details', {}).get('precipitation_amount') or 0
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
    dawn_str = s['dawn'].strftime("%H:%M")
    dusk_str = s['dusk'].strftime("%H:%M")

    birthdays = get_upcoming_birthdays(today, n=3)

    return {
        "forecast": forecast,
        "name": name_day,
        "day_of_week": day_of_week,
        "dawn": dawn_str,
        "dusk": dusk_str,
        "date": date_str,
        "birthdays": birthdays,
    }


def build_daylight_svg(today):
    year = today.year
    city = LocationInfo("Berlin", "DE", "Europe/Berlin", LAT, LON)
    days = []
    d = datetime.date(year, 1, 1)
    while d.year == year:
        s = sun(city.observer, date=d, tzinfo=TIMEZONE)
        days.append((
            s['sunrise'].hour + s['sunrise'].minute / 60,
            s['sunset'].hour + s['sunset'].minute / 60,
        ))
        d += datetime.timedelta(days=1)
    n = len(days)
    W, H = 220, 50
    HOUR_MIN, HOUR_MAX = 3, 22

    def xp(i): return round(i / (n - 1) * W, 1)
    def yp(h): return round(H - (h - HOUR_MIN) / (HOUR_MAX - HOUR_MIN) * H, 1)

    def build_curve(values, reverse=False):
        idxs = range(n - 1, -1, -1) if reverse else range(n)
        pts = []
        prev_i = None
        for i in idxs:
            if prev_i is not None and abs(values[i] - values[prev_i]) > 0.5:
                # DST jump — insert vertical step at this x before the new value
                pts.append((xp(i), yp(values[prev_i])))
            pts.append((xp(i), yp(values[i])))
            prev_i = i
        return pts

    sunrises = [days[i][0] for i in range(n)]
    sunsets  = [days[i][1] for i in range(n)]
    pts = build_curve(sunrises) + build_curve(sunsets, reverse=True)
    poly = " ".join(f"{x},{y}" for x, y in pts)

    durations = [days[i][1] - days[i][0] for i in range(n)]
    summer_i = durations.index(max(durations))
    winter_i = durations.index(min(durations))

    def triangle(cx, tip_y, size, point_up):
        # point_up=True → tip points up (summer peak), False → tip points down (winter trough)
        half = size / 2
        if point_up:
            return f"{cx},{tip_y} {cx - half},{tip_y + size} {cx + half},{tip_y + size}"
        else:
            return f"{cx},{tip_y} {cx - half},{tip_y - size} {cx + half},{tip_y - size}"

    s_size = 5
    summer_x = xp(summer_i)
    summer_tip = yp(days[summer_i][1]) - 2
    winter_x = xp(winter_i)
    winter_tip = yp(days[winter_i][0]) + 2

    today_i = (today - datetime.date(year, 1, 1)).days
    today_x = xp(today_i)
    today_y1 = yp(days[today_i][1])
    today_y2 = yp(days[today_i][0])

    return (
        f'<svg width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" style="display:block">'
        f'<polygon points="{poly}" fill="#bbb"/>'
        f'<polygon points="{triangle(summer_x, summer_tip, s_size, True)}" fill="black" opacity="0.5"/>'
        f'<polygon points="{triangle(winter_x, winter_tip, s_size, False)}" fill="black" opacity="0.5"/>'
        f'<line x1="{today_x}" y1="{today_y1}" x2="{today_x}" y2="{today_y2}" stroke="black" stroke-width="1.5"/>'
        f'</svg>'
    )


def build_birthday_html(birthdays):
    items = ""
    for b in birthdays:
        day_str = f"{b['date'].day}."
        month_str = _CZ_MONTHS_GEN[b['date'].month - 1]
        age_html = f'<span class="bday-age">{_czech_age(b["age"])}</span>' if b["age"] is not None else '<span class="bday-age"></span>'
        is_today = b.get("is_today")
        today_class = " bday-today" if is_today else ""
        icon = "celebration" if is_today else "cake"
        items += f"""
        <div class="bday-item{today_class}">
            <span class="icon bday-icon">{icon}</span>
            <span class="bday-name">{b['name']}</span>
            <span class="bday-date"><span class="bday-day">{day_str}</span><span class="bday-month">{month_str}</span></span>
            {age_html}
            <span class="bday-days">{_czech_days(b['days_until'])}</span>
        </div>"""
    return items


def build_forecast_table(forecast):
    rows_html = ""
    for f in forecast:
        icon_url = f"https://raw.githubusercontent.com/metno/weathericons/main/weather/png/{f['symbol']}.png"
        precip_val = f["precip"] if f.get("precip") else 0
        tomorrow_badge = '<span class="tomorrow-badge">Zítra</span>' if f.get("tomorrow") else ""
        rows_html += f"""
        <tr>
            <td class="col-label">
                {tomorrow_badge}
                <span class="label-name">{f['label']}</span>
                <span class="label-time">{f['time']}</span>
            </td>
            <td class="col-icon"><img class="row-icon" src="{icon_url}"></td>
            <td class="col-temp">{f['temp']}°</td>
            <td class="col-desc">{f['desc']}</td>
            <td class="col-precip"><div><span class="icon">water_drop</span><span class="precip-val">{precip_val}</span> <span class="precip-unit">mm</span></div></td>
        </tr>"""
    return rows_html


def _meal_html(meal):
    if not meal:
        return '<span style="opacity:0.4">nic neobjednáno</span>'
    return ", ".join(f"<nobr>{p.strip()}</nobr>" for p in meal.split(","))


def build_lunch_html(lunch, day_label):
    header = f'<span class="lunch-header">{day_label}</span>'
    items = list(lunch.items())
    # Collapse to one row if all kids have the same meal
    if len(items) > 1 and len({meal for _, meal in items}) == 1:
        name_label = " &<br>".join(name.capitalize() for name, _ in items)
        return header + f'<span class="lunch-name">{name_label}</span><span class="lunch-meal">{_meal_html(items[0][1])}</span>', False
    rows = ""
    for name, meal in items:
        rows += f'<span class="lunch-name">{name.capitalize()}</span><span class="lunch-meal">{_meal_html(meal)}</span>'
    is_split = len(items) > 1
    return header + rows, is_split


def create_screenshot(data):
    print("Creating screenshot (launching Chromium)...")
    rows_html = build_forecast_table(data['forecast'])
    birthday_html = build_birthday_html(data.get('birthdays', []))
    lunch_html, lunch_split = build_lunch_html(data.get('lunch', {}), data.get('lunch_label', ''))
    daylight_svg = build_daylight_svg(datetime.date.today())
    lunch_class = "lunch lunch-split" if lunch_split else "lunch"

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
                display: grid;
                grid-template-rows: auto auto auto 1fr auto auto;
                padding: 16px 18px;
                gap: 14px;
                box-sizing: border-box;
                filter: grayscale(1);
                overflow: hidden;
            }}
            .header {{
                border-bottom: 4px solid black;
                padding-bottom: 10px;
                text-align: center;
            }}
            .date {{ font-size: 28px; font-weight: bold; }}
            .svatek {{ font-size: 21px; margin-top: 5px; }}
            .svatek span {{ font-weight: bold; }}

            table {{
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }}
            tr {{ border-bottom: 1px solid #ccc; }}
            td {{ padding: 17px 4px; vertical-align: middle; }}
            .col-label {{
                width: 90px;
                line-height: 1;
            }}
            .label-name {{
                display: block;
                font-size: 13px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
            }}
            .tomorrow-badge {{
                display: inline-block;
                margin-bottom: 4px;
                font-size: 8px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
                border: 1.5px solid black;
                border-radius: 3px;
                padding: 1px 3px;
                vertical-align: middle;
                position: relative; top: -1px;
                opacity: 0.55;
            }}
            .label-time {{
                display: block;
                font-size: 13px; font-weight: 400;
                opacity: 0.5; margin-top: 5px;
            }}
            .col-icon {{ width: 48px; text-align: center; }}
            .row-icon {{
                width: 44px; height: 44px;
                filter: contrast(800%) brightness(35%);
                display: block; margin: 0 auto;
            }}
            .col-temp {{
                font-size: 28px; font-weight: 600;
                width: 70px; text-align: right;
                padding-right: 12px;
            }}
            .col-desc {{
                font-size: 14px; line-height: 1.4;
                color: black;
            }}
            .col-precip {{ vertical-align: middle; width: 84px; }}
            .col-precip div {{
                font-size: 22px; color: black; font-weight: 600;
                white-space: nowrap;
                display: flex; align-items: center; gap: 2px;
            }}
            .precip-unit {{ font-size: 14px; opacity: 0.5; align-self: flex-end; margin-bottom: 2px; }}
            .col-precip .icon {{ font-size: 22px; line-height: 0; position: relative; top: 0.5px; }}
            .precip-val {{ display: inline-block; min-width: 2.2ch; text-align: right; font-variant-numeric: tabular-nums; }}


            .bday-item {{
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 5px 0;
                font-size: 15px;
            }}
            .bday-icon {{ font-size: 20px; opacity: 0.75; width: 28px; text-align: center; flex-shrink: 0; }}
            .bday-today .bday-icon {{ font-size: 24px; opacity: 1; }}
            .bday-name {{ font-weight: 700; width: 105px; }}
            .bday-date {{ flex: 1; }}
            .bday-day {{ display: inline-block; width: 26px; text-align: right; }}
            .bday-month {{ padding-left: 3px; }}
            .bday-age {{ font-weight: 600; width: 60px; text-align: right; }}
            .bday-days {{ font-size: 14px; width: 75px; text-align: right; }}
            .bday-today {{ background: black; color: white; border-radius: 8px; margin: 0 -6px; padding: 5px 6px; }}

            .lunch {{
                grid-row: 5;
                display: grid;
                grid-template-columns: max-content 1fr;
                column-gap: 16px;
                row-gap: 4px;
                align-items: baseline;
            }}
            .lunch-header {{
                grid-column: 1 / -1;
                font-size: 12px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 1px;
                opacity: 0.4;
                padding: 4px 0 6px;
                border-bottom: 1px solid #ccc;
            }}
            .lunch-name {{
                font-size: 14px; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
            }}
            .lunch-meal {{
                font-size: 14px; line-height: 1.35;
                overflow-wrap: break-word; min-width: 0;
            }}
            .lunch-split .lunch-name {{ font-size: 12px; }}
            .lunch-split .lunch-meal {{ font-size: 12px; }}
            .footer {{
                grid-row: 6;
                border-top: 3px solid black;
                padding-top: 10px;
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
            .sun-val {{ font-weight: bold; font-size: 26px; }}
            .sun-label {{ font-size: 14px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.3px; }}
            .sun-graph {{ flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 10px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="date">{data['day_of_week']} {data['date']}</div>
            <div class="svatek">Svátek: <span>{data['name']}</span></div>
        </div>

        <table>
            {rows_html}
        </table>

        <div class="birthdays">
            {birthday_html}
        </div>

        <div class="{lunch_class}">
            {lunch_html}
        </div>

        <div class="footer">
            <div class="sun-row">
                <div class="sun-item">
                    <span class="sun-val">{data['dawn']}</span>
                    <span class="sun-label">svítání</span>
                </div>
                <div class="sun-graph">
                    {daylight_svg}
                </div>
                <div class="sun-item">
                    <span class="sun-val">{data['dusk']}</span>
                    <span class="sun-label">soumrak</span>
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
        if SCHILDKROETE_USERNAME and SCHILDKROETE_PASSWORD:
            try:
                session = login_schildkroete()
                data['lunch'], data['lunch_label'] = get_lunch_data(session)
            except Exception as e:
                print(f"  Lunch data failed: {e}")
                data['lunch'] = {}
                data['lunch_label'] = ""
        else:
            data['lunch'] = {}
            data['lunch_label'] = ""
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
