import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import os
import datetime
import difflib

URL = "https://www.va.gov/"
SNAPSHOT_FILE = "vagov_snapshot.html"
DIFF_FILE = "vagov_diff.txt"
EXTRACTED_FILE = "vagov_extracted.txt"

async def fetch_content():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(URL, wait_until="networkidle")
        content = await page.content()
        await browser.close()
        return content

def save_snapshot(content, filename):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

def load_snapshot(filename):
    if not os.path.exists(filename):
        return ""
    with open(filename, "r", encoding="utf-8") as f:
        return f.read()

def diff_snapshots(old, new):
    diff = difflib.unified_diff(
        old.splitlines(), new.splitlines(),
        fromfile="previous", tofile="current", lineterm=""
    )
    return "\n".join(diff)

def extract_text_from_html(html):
    soup = BeautifulSoup(html, "html.parser")
    # Try to extract the main content area; fallback to all text
    main = soup.find("main")
    if main:
        return main.get_text(separator="\n", strip=True)
    return soup.get_text(separator="\n", strip=True)

async def main():
    new_content = await fetch_content()
    old_content = load_snapshot(SNAPSHOT_FILE)
    if old_content != new_content:
        diff = diff_snapshots(old_content, new_content)
        timestamp = datetime.datetime.now().isoformat()
        print(f"[{timestamp}] VA.gov homepage updated!")
        if diff:
            with open(DIFF_FILE, "w", encoding="utf-8") as f:
                f.write(diff)
            print(f"Diff written to {DIFF_FILE}")
        save_snapshot(new_content, SNAPSHOT_FILE)
    # Always extract text for AI use
    extracted = extract_text_from_html(new_content)
    with open(EXTRACTED_FILE, "w", encoding="utf-8") as f:
        f.write(extracted)
    print(f"Extracted text written to {EXTRACTED_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
