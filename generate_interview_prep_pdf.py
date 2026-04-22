from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parent
SOURCE_PATH = ROOT / "interview_prep_smartsplit.md"
OUTPUT_PATH = ROOT / "SmartSplit_AI_Interview_Prep.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCenter",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=16,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=10,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0f766e"),
            spaceBefore=6,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyJustify",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            leftIndent=14,
            firstLineIndent=-8,
            textColor=colors.HexColor("#1f2937"),
            spaceAfter=4,
        )
    )
    return styles


def escape_text(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def parse_markdown_to_story(text: str, styles):
    story = []

    for raw_line in text.splitlines():
        line = raw_line.rstrip()

        if not line:
            story.append(Spacer(1, 0.08 * inch))
            continue

        escaped = escape_text(line)

        if line.startswith("# "):
            story.append(Paragraph(escape_text(line[2:].strip()), styles["TitleCenter"]))
            continue

        if line.startswith("## "):
            story.append(Paragraph(escape_text(line[3:].strip()), styles["SectionHeading"]))
            continue

        if line.startswith("### "):
            story.append(Paragraph(escape_text(line[4:].strip()), styles["SubHeading"]))
            continue

        if line.startswith("- "):
            story.append(Paragraph(f"• {escape_text(line[2:].strip())}", styles["BulletBody"]))
            continue

        if line[:2].isdigit() and ". " in line[:4]:
            story.append(Paragraph(escaped, styles["BodyJustify"]))
            continue

        story.append(Paragraph(escaped, styles["BodyJustify"]))

    return story


def add_page_numbers(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawRightString(A4[0] - 40, 20, f"Page {doc.page}")
    canvas.restoreState()


def main():
    styles = build_styles()
    source_text = SOURCE_PATH.read_text(encoding="utf-8")
    story = parse_markdown_to_story(source_text, styles)

    document = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=34,
        title="SmartSplit AI Interview Preparation",
        author="OpenAI Codex",
    )

    document.build(story, onFirstPage=add_page_numbers, onLaterPages=add_page_numbers)
    print(f"Created PDF: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
