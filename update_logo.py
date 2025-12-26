from PIL import Image, ImageDraw
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
logo_path = os.path.join(script_dir, 'public', 'Logo.png')

# Logoyu yukle
logo = Image.open(logo_path).convert('RGBA')
width, height = logo.size

# Gradient arka plan olustur (yesil-teal - logoya uyumlu)
background = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(background)

# Kirli beyaz/bej gradient
for y in range(height):
    # Koyu bej (#D8CFC0) -> Daha koyu bej (#C4B8A5) gradient
    r = int(216 + (196 - 216) * y / height)
    g = int(207 + (184 - 207) * y / height)
    b = int(192 + (165 - 192) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

# Yuvarlak köşeler için maske (rounded corners)
corner_radius = width // 6
mask = Image.new('L', (width, height), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([(0, 0), (width, height)], radius=corner_radius, fill=255)

# Arka plana maske uygula
background.putalpha(mask)

# Logoyu arka planın üzerine koy
result = Image.alpha_composite(background, logo)

# Kaydet
output_path = os.path.join(script_dir, 'public', 'Logo_new.png')
result.save(output_path, 'PNG')

# icon.ico için 256x256 boyutunda kaydet
icon_path = os.path.join(script_dir, 'icon_new.ico')
icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
icons = [result.resize(size, Image.Resampling.LANCZOS) for size in icon_sizes]
icons[0].save(icon_path, format='ICO', sizes=[(s[0], s[1]) for s in icon_sizes])

print(f"✓ Yeni logo oluşturuldu: {output_path}")
print(f"✓ Yeni icon oluşturuldu: {icon_path}")
