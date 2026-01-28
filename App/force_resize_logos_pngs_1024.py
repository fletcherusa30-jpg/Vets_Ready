# force_resize_logos_pngs_1024.py
"""
Force resize all .png images in App/Images/Logos to exactly 1024x1024 px, ignoring aspect ratio.
- Overwrites original .png files.
"""
import os
from PIL import Image

IMAGES_DIR = os.path.join(os.path.dirname(__file__), 'Images', 'Logos')
TARGET_SIZE = (1024, 1024)

def process_pngs():
    for fname in os.listdir(IMAGES_DIR):
        if fname.lower().endswith('.png'):
            fpath = os.path.join(IMAGES_DIR, fname)
            with Image.open(fpath) as img:
                img = img.convert('RGBA')
                # Force resize to exactly 1024x1024, ignoring aspect ratio
                img = img.resize(TARGET_SIZE, Image.LANCZOS)
                img.save(fpath, optimize=True)
                print(f'Force-resized {fname} to {TARGET_SIZE}')

if __name__ == '__main__':
    process_pngs()
