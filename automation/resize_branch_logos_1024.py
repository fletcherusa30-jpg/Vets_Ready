# Resize Branch Logo JPGs to 1024x1024
# This script will resize all JPGs in rally-forge-frontend/public/assets/branch-logos to 1024x1024
# Requires Python and Pillow (pip install pillow)

import os
from PIL import Image

logo_dir = r"C:\Dev\Rally Forge\rally-forge-frontend\public\assets\branch-logos"
size = (1024, 1024)

for filename in os.listdir(logo_dir):
    if filename.lower().endswith(".jpg"):
        path = os.path.join(logo_dir, filename)
        img = Image.open(path)
        img = img.convert("RGB")
        img = img.resize(size, Image.LANCZOS)
        img.save(path)
        print(f"Resized {filename} to 1024x1024")

