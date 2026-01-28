# force_resize_logos_jpgs_1024.py
"""
Force resize all .jpg images in App/Images/Logos to exactly 1024x1024 px, ignoring aspect ratio.
- Overwrites original .jpg files.
"""
import os
from PIL import Image

IMAGES_DIR = os.path.join(os.path.dirname(__file__), 'Images', 'Logos')
TARGET_SIZE = (1024, 1024)

def process_jpgs():
    for fname in os.listdir(IMAGES_DIR):
        if fname.lower().endswith('.jpg'):
            fpath = os.path.join(IMAGES_DIR, fname)
            with Image.open(fpath) as img:
                img = img.convert('RGB')
                # Force resize to exactly 1024x1024, ignoring aspect ratio
                img = img.resize(TARGET_SIZE, Image.LANCZOS)
                img.save(fpath, quality=90, optimize=True)
                print(f'Force-resized {fname} to {TARGET_SIZE}')

if __name__ == '__main__':
    process_jpgs()
