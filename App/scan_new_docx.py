# scan_new_docx.py
"""
Script to extract and print the text content of VetsReady_Engineering_Addendum.docx for review.
"""
import os
from docx import Document

DOCX_PATH = os.path.join(os.path.dirname(__file__), 'VetsReady_Engineering_Addendum.docx')

def print_docx_content(docx_path):
    doc = Document(docx_path)
    for para in doc.paragraphs:
        if para.text.strip():
            print(para.text)

if __name__ == '__main__':
    print_docx_content(DOCX_PATH)
