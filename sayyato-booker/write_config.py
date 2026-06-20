#!/usr/bin/env python3
"""Writes config.json from environment variables. Used by the GitHub Actions workflow."""
import json
import os
from pathlib import Path

Path(__file__).parent.joinpath("config.json").write_text(json.dumps({
    "EMAIL":            os.environ["EMAIL"],
    "PASSWORD":         os.environ["PASSWORD"],
    "API_BASE":         os.environ["API_BASE"],
    "CLUB_ID":          os.environ["CLUB_ID"],
    "PLAN_ID":          os.environ["PLAN_ID"],
    "DAYS_AHEAD":       int(os.environ.get("DAYS_AHEAD", "2")),
    "COURSES":          json.loads(os.environ["COURSES"]),
    "TELEGRAM_TOKEN":   os.environ["TELEGRAM_TOKEN"],
    "TELEGRAM_CHAT_ID": os.environ["TELEGRAM_CHAT_ID"],
    "SKIP_GIST_URL":      os.environ["SKIP_GIST_URL"],
    "HOLIDAYS_GIST_URL":  os.environ.get("HOLIDAYS_GIST_URL", ""),
    "OPENHOLIDAYS_BASE":  os.environ.get("OPENHOLIDAYS_BASE", "https://openholidaysapi.org"),
}))
