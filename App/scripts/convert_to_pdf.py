#!/usr/bin/env python3
"""
Convert Markdown to PDF using markdown and weasyprint
"""
import sys
from pathlib import Path
import markdown
from weasyprint import HTML, CSS
from io import BytesIO

def convert_markdown_to_pdf(md_path: str, pdf_path: str):
    """Convert a markdown file to PDF"""
    print(f"Converting {md_path} to PDF...")

    try:
        # Read markdown content
        with open(md_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        # Convert markdown to HTML
        md = markdown.Markdown(extensions=['extra', 'codehilite', 'tables', 'toc'])
        html_content = md.convert(md_content)

        # Create complete HTML document with styling
        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Vets Ready - Master Application Guide</title>
            <style>
                @page {{
                    size: letter;
                    margin: 1in;
                    @top-center {{
                        content: "Vets Ready - Master Application Guide";
                        font-size: 10pt;
                        color: #666;
                    }}
                    @bottom-right {{
                        content: "Page " counter(page) " of " counter(pages);
                        font-size: 10pt;
                        color: #666;
                    }}
                }}
                body {{
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #333;
                }}
                h1 {{
                    color: #1e40af;
                    font-size: 24pt;
                    margin-top: 24pt;
                    margin-bottom: 12pt;
                    border-bottom: 2px solid #1e40af;
                    padding-bottom: 6pt;
                    page-break-after: avoid;
                }}
                h2 {{
                    color: #2563eb;
                    font-size: 18pt;
                    margin-top: 18pt;
                    margin-bottom: 10pt;
                    page-break-after: avoid;
                }}
                h3 {{
                    color: #3b82f6;
                    font-size: 14pt;
                    margin-top: 14pt;
                    margin-bottom: 8pt;
                    page-break-after: avoid;
                }}
                h4 {{
                    color: #60a5fa;
                    font-size: 12pt;
                    margin-top: 12pt;
                    margin-bottom: 6pt;
                }}
                pre {{
                    background-color: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    padding: 12pt;
                    font-family: 'Courier New', monospace;
                    font-size: 9pt;
                    overflow-x: auto;
                    page-break-inside: avoid;
                }}
                code {{
                    background-color: #f3f4f6;
                    padding: 2pt 4pt;
                    border-radius: 2px;
                    font-family: 'Courier New', monospace;
                    font-size: 10pt;
                }}
                table {{
                    border-collapse: collapse;
                    width: 100%;
                    margin: 12pt 0;
                    page-break-inside: avoid;
                }}
                th, td {{
                    border: 1px solid #d1d5db;
                    padding: 8pt;
                    text-align: left;
                }}
                th {{
                    background-color: #1e40af;
                    color: white;
                    font-weight: bold;
                }}
                tr:nth-child(even) {{
                    background-color: #f9fafb;
                }}
                ul, ol {{
                    margin: 8pt 0;
                    padding-left: 24pt;
                }}
                li {{
                    margin: 4pt 0;
                }}
                blockquote {{
                    border-left: 4px solid #2563eb;
                    padding-left: 12pt;
                    margin-left: 0;
                    color: #4b5563;
                    font-style: italic;
                }}
                hr {{
                    border: none;
                    border-top: 1px solid #d1d5db;
                    margin: 24pt 0;
                }}
                .toc {{
                    background-color: #f9fafb;
                    border: 1px solid #d1d5db;
                    padding: 12pt;
                    margin-bottom: 24pt;
                }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """

        # Convert HTML to PDF
        print("Generating PDF from HTML...")
        HTML(string=full_html).write_pdf(pdf_path)

        print(f"✅ PDF successfully created: {pdf_path}")
        return True

    except Exception as e:
        print(f"❌ Error converting to PDF: {e}")
        import traceback
        traceback.print_exc()
if __name__ == "__main__":
    # Paths
    md_file = r"c:\Dev\Vets Ready\App\VETS_READY_MASTER_APPLICATION_GUIDE.md"
    pdf_file = r"c:\Dev\Vets Ready\App\VETS_READY_MASTER_APPLICATION_GUIDE.pdf"

    # Convert
    success = convert_markdown_to_pdf(md_file, pdf_file)

    sys.exit(0 if success else 1)
