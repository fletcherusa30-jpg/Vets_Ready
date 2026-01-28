#!/usr/bin/env python3
"""
Convert Markdown to PDF using reportlab
"""
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor
import re

def convert_markdown_to_pdf(md_path: str, pdf_path: str):
    """Convert a markdown file to PDF"""
    print(f"Converting {md_path} to PDF...")

    try:
        # Read markdown content
        with open(md_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        print("Setting up PDF document...")

        # Create PDF
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )

        # Define styles
        styles = getSampleStyleSheet()

        # Custom styles
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            alignment=TA_CENTER,
            textColor=HexColor('#1e40af'),
            spaceAfter=30
        ))

        styles.add(ParagraphStyle(
            name='CustomH1',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12
        ))

        styles.add(ParagraphStyle(
            name='CustomH2',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=HexColor('#2563eb'),
            spaceAfter=10,
            spaceBefore=10
        ))

        styles.add(ParagraphStyle(
            name='CustomH3',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=HexColor('#3b82f6'),
            spaceAfter=8,
            spaceBefore=8
        ))

        # Build story
        story = []

        # Title page
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph("🎖️ VETS READY", styles['CustomTitle']))
        story.append(Paragraph("MASTER APPLICATION GUIDE", styles['CustomTitle']))
        story.append(Paragraph("& WORKFLOW DOCUMENTATION", styles['CustomTitle']))
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph("Complete Technical Specification", styles['CustomH2']))
        story.append(Paragraph("Architecture & Flow Charts", styles['CustomH2']))
        story.append(Spacer(1, 1*inch))
        story.append(Paragraph("Version 2.0 | January 26, 2026", styles['Normal']))
        story.append(PageBreak())

        # Process content
        lines = md_content.split('\n')
        in_code_block = False
        code_lines = []

        print("Processing content...")
        for i, line in enumerate(lines):
            if i % 100 == 0:
                print(f"  Processing line {i}/{len(lines)}...")

            # Skip HTML comments and horizontal rules
            if line.strip().startswith('<!--') or line.strip() == '---':
                continue

            # Code blocks
            if line.strip().startswith('```'):
                if in_code_block:
                    # End of code block
                    code_text = '\n'.join(code_lines)
                    if code_text.strip():
                        story.append(Paragraph(f'<font name="Courier" size="8">{code_text[:1000]}</font>', styles['Normal']))
                    story.append(Spacer(1, 0.1*inch))
                    code_lines = []
                    in_code_block = False
                else:
                    # Start of code block
                    in_code_block = True
                continue

            if in_code_block:
                code_lines.append(line.replace('<', '&lt;').replace('>', '&gt;'))
                continue

            line = line.strip()
            if not line:
                continue

            # Headings
            if line.startswith('# '):
                story.append(Spacer(1, 0.2*inch))
                text = line[2:].replace('&', '&amp;')
                story.append(Paragraph(text, styles['CustomH1']))
                story.append(Spacer(1, 0.1*inch))
            elif line.startswith('## '):
                story.append(Spacer(1, 0.15*inch))
                text = line[3:].replace('&', '&amp;')
                story.append(Paragraph(text, styles['CustomH2']))
                story.append(Spacer(1, 0.08*inch))
            elif line.startswith('### '):
                story.append(Spacer(1, 0.1*inch))
                text = line[4:].replace('&', '&amp;')
                story.append(Paragraph(text, styles['CustomH3']))
                story.append(Spacer(1, 0.05*inch))
            # Skip table rows and list markers for simplicity
            elif line.startswith('|') or line.startswith('-'):
                continue
            # Regular text
            elif line:
                try:
                    # Clean up markdown formatting
                    text = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
                    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
                    text = re.sub(r'`(.+?)`', r'<font name="Courier">\1</font>', text)
                    # Limit line length
                    if len(text) > 500:
                        text = text[:500] + '...'
                    story.append(Paragraph(text, styles['BodyText']))
                    story.append(Spacer(1, 0.05*inch))
                except Exception as e:
                    # Skip problematic lines
                    pass

        print("Building PDF...")
        doc.build(story)

        file_size = Path(pdf_path).stat().st_size
        print(f"✅ PDF successfully created: {pdf_path}")
        print(f"📄 File size: {file_size / 1024:.1f} KB ({file_size / (1024*1024):.1f} MB)")
        return True

    except Exception as e:
        print(f"❌ Error converting to PDF: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    md_file = r"c:\Dev\Vets Ready\App\VETS_READY_MASTER_APPLICATION_GUIDE.md"
    pdf_file = r"c:\Dev\Vets Ready\App\VETS_READY_MASTER_APPLICATION_GUIDE.pdf"

    success = convert_markdown_to_pdf(md_file, pdf_file)
    sys.exit(0 if success else 1)
