# resize_all_jpgs_1024.py
"""
Resize all .jpg images in App/Images to 1024x1024 px, maintaining aspect ratio (with padding if needed).
- Overwrites original .jpg files.
"""
import os
from PIL import Image, ImageOps

IMAGES_DIR = os.path.join(os.path.dirname(__file__), 'Images')
TARGET_SIZE = (1024, 1024)

def process_jpgs():
    for fname in os.listdir(IMAGES_DIR):
        if fname.lower().endswith('.jpg'):
            fpath = os.path.join(IMAGES_DIR, fname)
            with Image.open(fpath) as img:
                img = img.convert('RGB')
                # Resize with padding to fit 1024x1024
                img = ImageOps.pad(img, TARGET_SIZE, color=(255,255,255), centering=(0.5,0.5))
                img.save(fpath, quality=90, optimize=True)
                print(f'Resized {fname} to {TARGET_SIZE}')

if __name__ == '__main__':
    process_jpgs()
