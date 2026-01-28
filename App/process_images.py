# process_images.py
"""
Script to standardize and optimize images in App/Images for app use.
- Military logos resized to 256x256 px, transparent PNG if possible
- All other images checked for quality, resized to max 1024x1024 px if needed
- All images optimized for web/app (format, compression)
"""
import os
from PIL import Image, ImageOps

IMAGES_DIR = os.path.join(os.path.dirname(__file__), 'Images')
LOGO_NAMES = [
    'Air Force.jpg', 'Army.jpg', 'Coast Guard.jpg', 'Marine.jpg', 'Navy.jpg', 'Space Force.jpg'
]
LOGO_SIZE = (256, 256)
MAX_PHOTO_SIZE = (1024, 1024)

# Helper to optimize and save image
def save_optimized(img, out_path, is_logo=False):
    if is_logo:
        # Convert to RGBA for transparency, white->transparent
        img = img.convert('RGBA')
        datas = img.getdata()
        newData = []
        for item in datas:
            if item[:3] == (255, 255, 255):
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        img.putdata(newData)
        img.save(out_path.replace('.jpg', '.png'), format='PNG', optimize=True)
    else:
        img.save(out_path, quality=90, optimize=True)

def process_images():
    for fname in os.listdir(IMAGES_DIR):
        fpath = os.path.join(IMAGES_DIR, fname)
        if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        img = Image.open(fpath)
        if fname in LOGO_NAMES:
            # Standardize logo size and transparency
            img = ImageOps.contain(img, LOGO_SIZE)
            save_optimized(img, fpath, is_logo=True)
        else:
            # For other images, check size and quality
            if img.size[0] > MAX_PHOTO_SIZE[0] or img.size[1] > MAX_PHOTO_SIZE[1]:
                img = ImageOps.contain(img, MAX_PHOTO_SIZE)
            save_optimized(img, fpath)
    print('All images processed and optimized.')

if __name__ == '__main__':
    process_images()
