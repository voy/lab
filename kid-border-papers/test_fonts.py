"""Regression test for the tofu-box bug: the phone separator must have a glyph
in the embedded font, otherwise it renders as an empty rectangle (as U+202F did).

Run:  uv run --with pytest --with pymupdf --with dateparser --with parsedatetime pytest -q
"""

import fitz

from core import THINSP

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"


def test_phone_separator_has_glyph_in_arial():
    font = fitz.Font(fontfile=ARIAL)
    assert font.has_glyph(ord(THINSP)), \
        "phone separator has no glyph in Arial -> would render as a tofu box"
