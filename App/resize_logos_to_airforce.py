# resize_logos_to_airforce.py
"""
Resize all military logo images to match the exact size of Air Force.png.
- Overwrites all logo images (Army, Coast Guard, Marine, Navy, Space Force) to match Air Force.png size.
- Converts to PNG for consistency.
"""
import os
from PIL import Image

IMAGES_DIR = os.path.join(os.path.dirname(__file__), 'Images')
LOGO_BASENAMES = [
    'Air Force', 'Army', 'Coast Guard', 'Marine', 'Navy', 'Space Force'
]

def get_logo_path(basename):
    for ext in ('.png', '.jpg', '.jpeg'):
        path = os.path.join(IMAGES_DIR, f'{basename}{ext}')
        if os.path.exists(path):
            return path
    return None

def main():
    airforce_path = get_logo_path('Air Force')
    if not airforce_path:
        print('Air Force logo not found!')
        return
    with Image.open(airforce_path) as ref_img:
        ref_size = ref_img.size
        for name in LOGO_BASENAMES:
            logo_path = get_logo_path(name)
            if logo_path:
                with Image.open(logo_path) as img:
                    img = img.convert('RGBA')
                    resized = img.resize(ref_size, Image.LANCZOS)
                    out_path = os.path.join(IMAGES_DIR, f'{name}.png')
                    resized.save(out_path, format='PNG', optimize=True)
                    print(f'Resized {name} to {ref_size} and saved as {out_path}')
            else:
                print(f'Logo not found: {name}')

if __name__ == '__main__':
    main()
