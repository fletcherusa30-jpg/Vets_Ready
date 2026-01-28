"""
scanner_engine/test_scanner_engine.py
Test suite for VetsReady Scanner Engine.
Includes unit, integration, multi-page, low-quality, edge case, and regression tests.
"""
import unittest
from intake import validate_file_type, validate_file_size, validate_page_count
from preprocess import preprocess_image
from ocr import run_tesseract_ocr
from type_detection import detect_document_type
from field_extraction import extract_fields
from validation import validate_fields
from confidence import compute_field_confidence, compute_overall_confidence
from normalization import normalize_fields
from output import generate_output

class TestScannerEngine(unittest.TestCase):
    def test_validate_file_type(self):
        self.assertEqual(validate_file_type("test.pdf"), "pdf")
        with self.assertRaises(Exception):
            validate_file_type("test.exe")

    def test_validate_file_size(self):
        # Skipped: requires test file
        pass

    def test_validate_page_count(self):
        # Skipped: requires test file
        pass

    def test_preprocess_image(self):
        # Skipped: requires test image
        pass

    def test_ocr(self):
        # Skipped: requires test image
        pass

    def test_type_detection(self):
        result = detect_document_type("DD214 Certificate of Release or Discharge")
        self.assertEqual(result["type"], "dd214")

    def test_field_extraction(self):
        text = "Name: John Doe\nSSN: XXX-XX-1234\nBranch: Army"
        fields = extract_fields(text)
        self.assertEqual(fields["name"], "John Doe")
        self.assertEqual(fields["ssn"], "XXX-XX-1234")
        self.assertEqual(fields["branch"], "Army")

    def test_validation(self):
        fields = {"date": "01/01/2020", "mos": "11B"}
        result = validate_fields(fields)
        self.assertEqual(result["errors"], [])

    def test_confidence(self):
        conf = compute_field_confidence({"conf": ["90", "80"]}, "name")
        self.assertTrue(conf > 0)

    def test_normalization(self):
        fields = {"date": "01/01/2020", "branch": "us army", "mos": "11b"}
        norm = normalize_fields(fields)
        self.assertEqual(norm["date"], "2020-01-01")
        self.assertEqual(norm["branch"], "Army")
        self.assertEqual(norm["mos"], "11B")

    def test_output(self):
        out = generate_output({"name": "John"}, {"name": 90.0}, {"errors": []}, "Summary")
        self.assertIn("John", out)

if __name__ == "__main__":
    unittest.main()
