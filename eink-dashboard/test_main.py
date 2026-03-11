import datetime
import unittest

from main import (
    strip_allergens, build_lunch_html, parse_lunch_html, lunch_target_date, _meal_html,
    symbol_to_cz, get_forecast_slot_for_date, build_forecast_table,
)


# ---------------------------------------------------------------------------
# HTML fixture helpers
# ---------------------------------------------------------------------------

def _day_cells(meal, ordered, closed=False):
    """Return the four td cells (menu, allergen, price, order) for one day column."""
    if closed:
        return (
            '<td class="menu-cell day-closed">Karfreitag</td>',
            '<td class="menu-allergens day-closed"></td>',
            '<td class="menu-price day-closed"></td>',
            '<td class="order-button-cell day-closed"></td>',
        )
    status = "1" if ordered else "0"
    return (
        f'<td class="menu-cell">{meal}</td>',
        '<td class="menu-allergens"></td>',
        '<td class="menu-price"></td>',
        f'<td class="order-button-cell"><form data-order-status="{status}"></form></td>',
    )


def make_panel(child_name, days):
    """
    Build a minimal panel-mealplan HTML fragment.

    days: list of 5 items (Mon–Fri), each one of:
      - str              → meal text, not ordered
      - ("ordered", str) → meal text, ordered
      - "closed"         → day-closed
    """
    cols = [_day_cells(*((d[1], True) if isinstance(d, tuple) else (d, False, True) if d == "closed" else (d, False)))
            for d in days]
    menu_row    = "<tr><td rowspan='4' class='head menu-meal'>Menü 1</td>" + "".join(c[0] for c in cols) + "</tr>"
    allergen_row = "<tr>" + "".join(c[1] for c in cols) + "</tr>"
    price_row   = "<tr>" + "".join(c[2] for c in cols) + "</tr>"
    order_row   = "<tr>" + "".join(c[3] for c in cols) + "</tr>"
    last_row    = "<tr class='last-row'><td colspan='6'></td></tr>"
    return f"""
    <div class="panel panel-default panel-mealplan">
      <div class="panel-heading">
        <span class="childname">{child_name}</span>
      </div>
      <div class="panel-body">
        <table class="table food-order">
          <tbody>
            {menu_row}
            {allergen_row}
            {price_row}
            {order_row}
            {last_row}
          </tbody>
        </table>
      </div>
    </div>"""


def make_page(*panels):
    return "<html><body>" + "".join(panels) + "</body></html>"


# ---------------------------------------------------------------------------
# strip_allergens
# ---------------------------------------------------------------------------

class TestStripAllergens(unittest.TestCase):

    def test_single_code(self):
        self.assertEqual(strip_allergens("Milch (M)"), "Milch")

    def test_multiple_codes(self):
        self.assertEqual(
            strip_allergens("Linsenbolognese (S2) mit Weizennudeln (G1), rohes Gemüse"),
            "Linsenbolognese mit Weizennudeln, rohes Gemüse",
        )

    def test_no_allergens(self):
        self.assertEqual(strip_allergens("rohes Gemüse"), "rohes Gemüse")

    def test_an_allen_grundschulen_before_aus(self):
        text = "An allen Grundschulen: Rosinenbrötchen (G1, M) aus unserer gläsernen Backstube Endorphina Backkunst"
        self.assertEqual(strip_allergens(text), "Rosinenbrötchen")

    def test_an_allen_grundschulen_no_trailing_text(self):
        # allergen immediately followed by end of string — should still extract name
        text = "An allen Grundschulen: Muffin (G1, M)"
        self.assertEqual(strip_allergens(text), "Muffin")

    def test_extra_whitespace_cleaned_up(self):
        result = strip_allergens("Hackbällchen (E1, G1) , Soße (S2)")
        self.assertNotIn("  ", result)


# ---------------------------------------------------------------------------
# lunch_target_date
# ---------------------------------------------------------------------------

class TestLunchTargetDate(unittest.TestCase):

    def _d(self, iso):
        return datetime.date.fromisoformat(iso)

    def _t(self, iso, hour):
        return lunch_target_date(self._d(iso), hour)

    # --- before noon on a school day: show today ---

    def test_monday_before_noon_shows_today(self):
        date, label = self._t("2026-03-09", 10)
        self.assertEqual(date, self._d("2026-03-09"))
        self.assertEqual(label, "Dnes")

    def test_friday_before_noon_shows_today(self):
        date, label = self._t("2026-03-13", 9)
        self.assertEqual(date, self._d("2026-03-13"))
        self.assertEqual(label, "Dnes")

    def test_exactly_noon_switches_to_tomorrow(self):
        date, label = self._t("2026-03-09", 12)
        self.assertEqual(date, self._d("2026-03-10"))
        self.assertEqual(label, "Zítra")

    # --- after noon on a school day: show next school day ---

    def test_monday_after_noon_shows_tuesday(self):
        date, label = self._t("2026-03-09", 13)
        self.assertEqual(date, self._d("2026-03-10"))
        self.assertEqual(label, "Zítra")

    def test_thursday_after_noon_shows_friday(self):
        date, label = self._t("2026-03-12", 14)
        self.assertEqual(date, self._d("2026-03-13"))
        self.assertEqual(label, "Zítra")

    def test_friday_after_noon_shows_monday_with_day_label(self):
        date, label = self._t("2026-03-13", 13)
        self.assertEqual(date, self._d("2026-03-16"))
        self.assertEqual(label, "Pondělí")

    # --- weekend: always show next Monday ---

    def test_saturday_shows_monday(self):
        date, label = self._t("2026-03-14", 10)
        self.assertEqual(date, self._d("2026-03-16"))
        self.assertEqual(label, "Pondělí")

    def test_sunday_shows_monday(self):
        date, label = self._t("2026-03-15", 22)
        self.assertEqual(date, self._d("2026-03-16"))
        self.assertEqual(label, "Pondělí")


# ---------------------------------------------------------------------------
# parse_lunch_html
# ---------------------------------------------------------------------------

class TestParseLunchHtml(unittest.TestCase):

    def test_ordered_meal_returned(self):
        html = make_page(make_panel("Müller, Max", [
            "Suppe", ("ordered", "Linsenbolognese"), "Pasta", "Fisch", "Pizza"
        ]))
        result = parse_lunch_html(html, target_weekday=1)  # Tuesday
        self.assertEqual(result["max"], "Linsenbolognese")

    def test_nothing_ordered_returns_none(self):
        html = make_page(make_panel("Müller, Max", [
            "Suppe", "Linsenbolognese", "Pasta", "Fisch", "Pizza"
        ]))
        result = parse_lunch_html(html, target_weekday=1)
        self.assertIsNone(result["max"])

    def test_closed_day_returns_zavreno(self):
        html = make_page(make_panel("Müller, Max", [
            "Suppe", "closed", "Pasta", "Fisch", "Pizza"
        ]))
        result = parse_lunch_html(html, target_weekday=1)
        self.assertEqual(result["max"], "zavřeno")

    def test_allergens_stripped_from_meal(self):
        html = make_page(make_panel("Müller, Max", [
            "Suppe", ("ordered", "Fischstäbchen (G1, F), Erbsen (M)"), "x", "x", "x"
        ]))
        result = parse_lunch_html(html, target_weekday=1)
        self.assertNotIn("(G1", result["max"])
        self.assertIn("Fischstäbchen", result["max"])

    def test_two_children_parsed(self):
        html = make_page(
            make_panel("Müller, Max", ["x", ("ordered", "Pasta"), "x", "x", "x"]),
            make_panel("Müller, Moritz",   ["x", "x", "x", ("ordered", "Suppe"), "x"]),
        )
        result = parse_lunch_html(html, target_weekday=1)
        self.assertEqual(result["max"], "Pasta")
        result = parse_lunch_html(html, target_weekday=3)
        self.assertEqual(result["moritz"], "Suppe")

    def test_monday_column(self):
        html = make_page(make_panel("Müller, Max", [
            ("ordered", "Montag-Essen"), "x", "x", "x", "x"
        ]))
        self.assertEqual(parse_lunch_html(html, 0)["max"], "Montag-Essen")

    def test_friday_column(self):
        html = make_page(make_panel("Müller, Max", [
            "x", "x", "x", "x", ("ordered", "Freitag-Essen")
        ]))
        self.assertEqual(parse_lunch_html(html, 4)["max"], "Freitag-Essen")


# ---------------------------------------------------------------------------
# build_lunch_html
# ---------------------------------------------------------------------------

class TestBuildLunchHtml(unittest.TestCase):

    def test_two_different_meals_show_both_names(self):
        html = build_lunch_html({"max": "Pasta", "moritz": "Suppe"}, "Zítra")
        self.assertIn("Max", html)
        self.assertIn("Moritz", html)
        self.assertIn("Pasta", html)
        self.assertIn("Suppe", html)

    def test_same_meal_collapsed_to_one_row(self):
        html = build_lunch_html({"max": "Pasta", "moritz": "Pasta"}, "Dnes")
        # Only one occurrence of the meal text
        self.assertEqual(html.count("Pasta"), 1)
        # Both names joined
        self.assertIn("Max", html)
        self.assertIn("Moritz", html)

    def test_none_shows_nic_neobjednano(self):
        html = build_lunch_html({"max": None}, "Dnes")
        self.assertIn("nic neobjednáno", html)

    def test_zavreno_shown_as_is(self):
        html = build_lunch_html({"max": "zavřeno"}, "Dnes")
        self.assertIn("zavřeno", html)

    def test_single_child(self):
        html = build_lunch_html({"max": "Pasta"}, "Zítra")
        self.assertIn("Max", html)
        self.assertNotIn("Moritz", html)

    def test_label_shown_in_html(self):
        html = build_lunch_html({"max": "Pasta"}, "Zítra")
        self.assertIn("Zítra", html)

    def test_label_shown_for_day_name(self):
        html = build_lunch_html({"max": "Pasta"}, "Pondělí")
        self.assertIn("Pondělí", html)

    def test_meal_html_wraps_only_after_comma(self):
        html = _meal_html("Fisch, rohes Gemüse, Frischobst")
        # Each segment wrapped in nobr
        self.assertIn("<nobr>Fisch</nobr>", html)
        self.assertIn("<nobr>rohes Gemüse</nobr>", html)
        # Segments joined with ", " so no leading space after wrap
        self.assertIn("</nobr>, <nobr>", html)

    def test_both_none_collapsed(self):
        html = build_lunch_html({"max": None, "moritz": None}, "Dnes")
        self.assertEqual(html.count("nic neobjednáno"), 1)


# ---------------------------------------------------------------------------
# symbol_to_cz
# ---------------------------------------------------------------------------

class TestSymbolToCz(unittest.TestCase):

    def test_known_symbol(self):
        self.assertEqual(symbol_to_cz("clearsky"), "Jasno")

    def test_day_suffix_stripped(self):
        self.assertEqual(symbol_to_cz("clearsky_day"), "Jasno")

    def test_night_suffix_stripped(self):
        self.assertEqual(symbol_to_cz("partlycloudy_night"), "Polojasno")

    def test_polartwilight_suffix_stripped(self):
        self.assertEqual(symbol_to_cz("fair_polartwilight"), "Skoro jasno")

    def test_unknown_symbol_falls_back_to_capitalized(self):
        self.assertEqual(symbol_to_cz("some_unknown_code"), "Some unknown code")

    def test_rain_and_thunder(self):
        self.assertEqual(symbol_to_cz("rainandthunder"), "Déšť s bouřkou")


# ---------------------------------------------------------------------------
# get_forecast_slot_for_date
# ---------------------------------------------------------------------------

def _make_entry(iso_utc, temp=10):
    return {
        "time": iso_utc,
        "data": {
            "instant": {"details": {"air_temperature": temp}},
            "next_1_hours": {"summary": {"symbol_code": "cloudy"}, "details": {"probability_of_precipitation": 0}},
        },
    }


class TestGetForecastSlotForDate(unittest.TestCase):

    def _date(self, iso):
        return datetime.date.fromisoformat(iso)

    def test_returns_closest_entry(self):
        timeseries = [
            _make_entry("2026-03-12T06:00:00Z", temp=5),
            _make_entry("2026-03-12T12:00:00Z", temp=10),
            _make_entry("2026-03-12T18:00:00Z", temp=8),
        ]
        result = get_forecast_slot_for_date(timeseries, self._date("2026-03-12"), target_hour=13)
        self.assertEqual(result["data"]["instant"]["details"]["air_temperature"], 10)

    def test_ignores_wrong_date(self):
        timeseries = [
            _make_entry("2026-03-11T12:00:00Z", temp=5),
            _make_entry("2026-03-12T12:00:00Z", temp=10),
        ]
        result = get_forecast_slot_for_date(timeseries, self._date("2026-03-12"), target_hour=12)
        self.assertEqual(result["data"]["instant"]["details"]["air_temperature"], 10)

    def test_returns_none_if_no_entries_for_date(self):
        timeseries = [_make_entry("2026-03-11T12:00:00Z")]
        result = get_forecast_slot_for_date(timeseries, self._date("2026-03-12"), target_hour=12)
        self.assertIsNone(result)

    def test_exact_hour_match(self):
        timeseries = [
            _make_entry("2026-03-12T07:00:00Z", temp=3),
            _make_entry("2026-03-12T08:00:00Z", temp=99),
        ]
        result = get_forecast_slot_for_date(timeseries, self._date("2026-03-12"), target_hour=7)
        self.assertEqual(result["data"]["instant"]["details"]["air_temperature"], 3)


# ---------------------------------------------------------------------------
# build_forecast_table
# ---------------------------------------------------------------------------

def _forecast_entry(label, temp, symbol="cloudy", precip=0, tomorrow=False):
    return {"label": label, "time": "07:00", "temp": temp, "symbol": symbol,
            "desc": "Zataženo", "precip": precip, "tomorrow": tomorrow}


class TestBuildForecastTable(unittest.TestCase):

    def test_renders_temperature(self):
        html = build_forecast_table([_forecast_entry("Ráno", 12)])
        self.assertIn("12°", html)

    def test_renders_label(self):
        html = build_forecast_table([_forecast_entry("Večer", 5)])
        self.assertIn("Večer", html)

    def test_renders_precipitation(self):
        html = build_forecast_table([_forecast_entry("Ráno", 10, precip=40)])
        self.assertIn("40%", html)

    def test_zitra_divider_inserted_before_first_tomorrow(self):
        entries = [
            _forecast_entry("Odpo.", 10, tomorrow=False),
            _forecast_entry("Ráno", 6, tomorrow=True),
            _forecast_entry("Pol.", 9, tomorrow=True),
        ]
        html = build_forecast_table(entries)
        self.assertIn("divider-row", html)
        self.assertIn("Zítra", html)
        # Divider appears only once
        self.assertEqual(html.count("divider-row"), 1)

    def test_no_divider_without_tomorrow_entries(self):
        html = build_forecast_table([_forecast_entry("Ráno", 10), _forecast_entry("Pol.", 12)])
        self.assertNotIn("divider-row", html)

    def test_icon_url_uses_symbol(self):
        html = build_forecast_table([_forecast_entry("Ráno", 10, symbol="clearsky_day")])
        self.assertIn("clearsky_day.png", html)


if __name__ == "__main__":
    unittest.main()
