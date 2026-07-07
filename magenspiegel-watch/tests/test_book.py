import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent))
import book


class TestLogging(unittest.TestCase):
    def test_log_prints_message_with_timestamp(self):
        with patch("builtins.print") as mock_print:
            book.log("hello world")
        printed = mock_print.call_args[0][0]
        self.assertIn("hello world", printed)

    def test_tg_sends_telegram_message_when_configured(self):
        book.CONFIG = {"TELEGRAM_TOKEN": "abc123", "TELEGRAM_CHAT_ID": "999"}
        fake_response = MagicMock()
        fake_response.__enter__.return_value = fake_response
        fake_response.read.return_value = b"{}"
        with patch("book.urlopen", return_value=fake_response) as mock_urlopen:
            book.tg("test message")
        request = mock_urlopen.call_args[0][0]
        self.assertIn("api.telegram.org/botabc123/sendMessage", request.full_url)
        body = json.loads(request.data)
        self.assertEqual(body["chat_id"], "999")
        self.assertEqual(body["text"], "test message")

    def test_tg_noop_when_not_configured(self):
        book.CONFIG = {}
        with patch("book.urlopen") as mock_urlopen:
            book.tg("test message")
        mock_urlopen.assert_not_called()


from datetime import datetime, timezone

SAMPLE_OPENING = {
    "kdSet": [{"kid": "26", "lid": "180916920727371776"}],
    "displayStringNames": "",
    "duration": 30,
    "durationSearch": 30,
    "displayStringTime": "08:45",
    "date": "2026-07-14T06:45:00.000Z",
}


class TestPayloadBuilders(unittest.TestCase):
    def setUp(self):
        book.CONFIG = {
            "FIRST_NAME": "Erika",
            "LAST_NAME": "Musterfrau",
            "BIRTH_DATE": "1990-05-17",
            "PHONE": "+49 30 1234567",
            "EMAIL": "erika@example.com",
            "GENDER": "F",
            "INSURANCE_NAME": "Techniker Krankenkasse",
        }

    @patch("book.datetime")
    def test_build_reserve_payload(self, mock_datetime):
        mock_datetime.now.return_value = datetime(2026, 7, 7, 12, 0, 0, tzinfo=timezone.utc)
        mock_datetime.side_effect = lambda *a, **kw: datetime(*a, **kw)
        payload = book.build_reserve_payload(SAMPLE_OPENING)
        self.assertEqual(payload["instance"], book.INSTANCE_ID)
        self.assertEqual(payload["terminSucheIdent"], book.TERMIN_SUCHE_IDENT)
        self.assertEqual(payload["dateAppointment"], "2026-07-14T06:45:00.000Z")
        self.assertEqual(payload["duration"], 30)
        self.assertEqual(payload["doctorIds"], ["26"])
        self.assertEqual(payload["dateExpiry"], "2026-07-07T12:10:00.000Z")

    def test_build_book_payload(self):
        payload = book.build_book_payload(SAMPLE_OPENING, "reservation-id-123")
        appt = payload["otkAppointment"]
        self.assertEqual(appt["instance"], book.INSTANCE_ID)
        self.assertEqual(appt["eventType"], "OtkAppointment")
        self.assertEqual(appt["terminSucheIdent"], book.TERMIN_SUCHE_IDENT)
        self.assertEqual(appt["start"], "2026-07-14T06:45:00.000Z")
        self.assertEqual(appt["end"], "2026-07-14T07:15:00.000Z")
        self.assertEqual(appt["kdSet"], SAMPLE_OPENING["kdSet"])
        self.assertEqual(appt["strategy"], "autoconfirm")
        self.assertEqual(appt["reservationId"], "reservation-id-123")
        self.assertEqual(appt["bookedOver"], "a-d")
        self.assertEqual(appt["schemaVersion"], book.SCHEMA_VERSION)
        personal = appt["patientData"]["personal"]
        self.assertEqual(personal["fname"], "Erika")
        self.assertEqual(personal["lname"], "Musterfrau")
        self.assertEqual(personal["birthdate"], "1990-05-17T00:00:00.000Z")
        self.assertEqual(personal["phone"], "+49 30 1234567")
        self.assertEqual(personal["gender"], "F")
        self.assertEqual(appt["patientData"]["insurance"], {"type": "gkv", "name": "Techniker Krankenkasse"})
        self.assertEqual(payload["otkAttachments"], None)


if __name__ == "__main__":
    unittest.main()
