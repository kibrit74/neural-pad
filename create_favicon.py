from PIL import Image
import os
import cairosvg
from io import BytesIO

# Dosya yolunu mutlak yol olarak belirt
script_dir = os.path.dirname(os.path.abspath(__file__))
svg_path = os.path.join(script_dir, 'logo.svg')

# SVG'yi PNG'ye dönüştür
png_data = cairosvg.svg2png(url=svg_path, output_width=256, output_height=256)
logo = Image.open(BytesIO(png_data))

# RGBA modunda olduğundan emin ol
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

# favicon.png oluştur (32x32)
favicon_32 = logo.resize((32, 32), Image.Resampling.LANCZOS)
favicon_32.save(os.path.join(script_dir, 'favicon.png'), 'PNG')

# favicon.ico oluştur (16x16 ve 32x32 boyutları)
favicon_16 = logo.resize((16, 16), Image.Resampling.LANCZOS)
favicon_16.save(os.path.join(script_dir, 'favicon.ico'), format='ICO')

print("✓ favicon.png ve favicon.ico oluşturuldu!")
