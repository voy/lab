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


if __name__ == "__main__":
    unittest.main()
