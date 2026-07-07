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


def _fake_response(body: dict):
    resp = MagicMock()
    resp.__enter__.return_value = resp
    resp.read.return_value = json.dumps(body).encode()
    return resp


class TestHttpWrappers(unittest.TestCase):
    def setUp(self):
        book.CONFIG = {
            "FIRST_NAME": "Erika",
            "LAST_NAME": "Musterfrau",
            "BIRTH_DATE": "1990-05-17",
            "PHONE": "+49 30 1234567",
            "EMAIL": "erika@example.com",
            "GENDER": "F",
            "INSURANCE_NAME": "",
        }

    def test_fetch_openings_returns_list(self):
        with patch("book.urlopen", return_value=_fake_response({"status": 200, "openings": [SAMPLE_OPENING]})) as mock_urlopen:
            result = book.fetch_openings()
        self.assertEqual(result, [SAMPLE_OPENING])
        request = mock_urlopen.call_args[0][0]
        url = request if isinstance(request, str) else request.full_url
        self.assertIn("/api/opening", url)
        self.assertIn(f"terminSucheIdent={book.TERMIN_SUCHE_IDENT}", url)

    def test_fetch_openings_returns_empty_list_when_no_openings_key(self):
        with patch("book.urlopen", return_value=_fake_response({"status": 200})):
            result = book.fetch_openings()
        self.assertEqual(result, [])

    def test_reserve_slot_returns_reservation_on_success(self):
        with patch("book.urlopen", return_value=_fake_response({"reservation": {"_id": "res-1"}})) as mock_urlopen:
            result = book.reserve_slot(SAMPLE_OPENING)
        self.assertEqual(result, {"_id": "res-1"})
        request = mock_urlopen.call_args[0][0]
        self.assertIn("/api/reservation/reserve", request.full_url)
        body = json.loads(request.data)
        self.assertEqual(body["instance"], book.INSTANCE_ID)

    def test_reserve_slot_returns_none_when_slot_taken(self):
        with patch("book.urlopen", return_value=_fake_response({"reservation": None})):
            result = book.reserve_slot(SAMPLE_OPENING)
        self.assertIsNone(result)

    def test_book_slot_posts_and_returns_response(self):
        with patch("book.urlopen", return_value=_fake_response({"appointment": {"_id": "appt-1"}})) as mock_urlopen:
            result = book.book_slot(SAMPLE_OPENING, "res-1")
        self.assertEqual(result, {"appointment": {"_id": "appt-1"}})
        request = mock_urlopen.call_args[0][0]
        self.assertIn("/api/appointment/book", request.full_url)
        body = json.loads(request.data)
        self.assertEqual(body["otkAppointment"]["reservationId"], "res-1")

    def test_cancel_reservation_posts_expected_body(self):
        with patch("book.urlopen", return_value=_fake_response({"status": 200})) as mock_urlopen:
            book.cancel_reservation("res-1")
        request = mock_urlopen.call_args[0][0]
        self.assertIn("/api/reservation/cancel", request.full_url)
        body = json.loads(request.data)
        self.assertEqual(body, {"instance": book.INSTANCE_ID, "reservationId": "res-1"})

    def test_cancel_reservation_swallows_errors(self):
        with patch("book.urlopen", side_effect=Exception("network down")):
            book.cancel_reservation("res-1")  # must not raise


class TestEventLog(unittest.TestCase):
    def test_log_event_prints_json_line(self):
        with patch("builtins.print") as mock_print:
            book.log_event({"type": "detection", "n": 1})
        printed = mock_print.call_args[0][0]
        self.assertIn('"type": "detection"', printed)
        self.assertIn('"n": 1', printed)


import os
import tempfile


class TestMarkGithubOutput(unittest.TestCase):
    def test_noop_when_github_output_env_not_set(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("GITHUB_OUTPUT", None)
            book._mark_github_output("booked", "true")  # must not raise

    def test_writes_key_value_line_when_github_output_set(self):
        with tempfile.TemporaryDirectory() as tmp:
            output_path = Path(tmp) / "output.txt"
            with patch.dict(os.environ, {"GITHUB_OUTPUT": str(output_path)}):
                book._mark_github_output("booked", "true")
            self.assertEqual(output_path.read_text(), "booked=true\n")


class TestCmdCheck(unittest.TestCase):
    def setUp(self):
        patcher_tg = patch("book.tg")
        patcher_log = patch("book.log_event")
        self.mock_tg = patcher_tg.start()
        self.mock_log_event = patcher_log.start()
        self.addCleanup(patcher_tg.stop)
        self.addCleanup(patcher_log.stop)

    def test_no_openings_sends_no_notification(self):
        with patch("book.fetch_openings", return_value=[]):
            book.cmd_check()
        self.mock_tg.assert_not_called()
        self.mock_log_event.assert_not_called()

    def test_opening_check_failure_notifies_and_returns(self):
        with patch("book.fetch_openings", side_effect=Exception("timeout")):
            book.cmd_check()
        self.mock_tg.assert_called_once()
        self.assertIn("timeout", self.mock_tg.call_args[0][0])

    def test_successful_booking_reports_success_and_signals_github_output(self):
        with patch("book.fetch_openings", return_value=[SAMPLE_OPENING]), \
             patch("book.reserve_slot", return_value={"_id": "res-1"}), \
             patch("book.book_slot", return_value={"appointment": {"_id": "appt-1"}}), \
             patch("book.cancel_reservation") as mock_cancel, \
             patch("book._mark_github_output") as mock_mark:
            book.cmd_check()
        mock_cancel.assert_not_called()
        mock_mark.assert_called_once_with("booked", "true")
        messages = [c.args[0] for c in self.mock_tg.call_args_list]
        self.assertTrue(any("Booked" in m for m in messages))

    def test_reservation_lost_reports_and_does_not_book(self):
        with patch("book.fetch_openings", return_value=[SAMPLE_OPENING]), \
             patch("book.reserve_slot", return_value=None), \
             patch("book.book_slot") as mock_book:
            book.cmd_check()
        mock_book.assert_not_called()
        messages = [c.args[0] for c in self.mock_tg.call_args_list]
        self.assertTrue(any("taken" in m for m in messages))

    def test_booking_rejected_cancels_reservation_and_reports(self):
        with patch("book.fetch_openings", return_value=[SAMPLE_OPENING]), \
             patch("book.reserve_slot", return_value={"_id": "res-1"}), \
             patch("book.book_slot", return_value={"status": 400}), \
             patch("book.cancel_reservation") as mock_cancel, \
             patch("book._mark_github_output") as mock_mark:
            book.cmd_check()
        mock_cancel.assert_called_once_with("res-1")
        mock_mark.assert_not_called()
        messages = [c.args[0] for c in self.mock_tg.call_args_list]
        self.assertTrue(any("rejected" in m for m in messages))

    def test_unexpected_exception_cancels_reservation_and_reports(self):
        with patch("book.fetch_openings", return_value=[SAMPLE_OPENING]), \
             patch("book.reserve_slot", return_value={"_id": "res-1"}), \
             patch("book.book_slot", side_effect=Exception("boom")), \
             patch("book.cancel_reservation") as mock_cancel:
            book.cmd_check()
        mock_cancel.assert_called_once_with("res-1")
        messages = [c.args[0] for c in self.mock_tg.call_args_list]
        self.assertTrue(any("boom" in m for m in messages))


if __name__ == "__main__":
    unittest.main()
