#!/usr/bin/env python3
"""Writes config.json from environment variables. Used by the GitHub Actions workflow."""
import json
import os
from pathlib import Path

Path(__file__).parent.joinpath("config.json").write_text(json.dumps({
    "FIRST_NAME":       os.environ["FIRST_NAME"],
    "LAST_NAME":        os.environ["LAST_NAME"],
    "BIRTH_DATE":       os.environ["BIRTH_DATE"],
    "PHONE":            os.environ["PHONE"],
    "EMAIL":            os.environ["EMAIL"],
    "GENDER":           os.environ["GENDER"],
    "INSURANCE_NAME":   os.environ.get("INSURANCE_NAME", ""),
    "TELEGRAM_TOKEN":   os.environ["TELEGRAM_TOKEN"],
    "TELEGRAM_CHAT_ID": os.environ["TELEGRAM_CHAT_ID"],
}))
