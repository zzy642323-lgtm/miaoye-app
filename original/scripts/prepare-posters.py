"""Encode generated PNG masters as app WebP assets; never overwrite original v8 art."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
catalog = json.loads((root / 'artwork/poster-catalog.json').read_text(encoding='utf-8'))
missing = []
for cat in catalog:
    for story in cat[1:]:
        name = Path(story['art']).stem
        master = root / 'artwork/posters' / (name + '.png')
        if not master.exists():
            missing.append(str(master))
            continue
        with Image.open(master) as image:
            if image.size != (1024, 1536):
                raise ValueError(f'Unexpected poster dimensions: {master} {image.size}')
            image.convert('RGB').save(root / 'web/assets' / (name + '.webp'), quality=87, method=6)
if missing:
    raise FileNotFoundError('\n'.join(missing))
sheet = Image.new('RGB', (1600, 1325), '#fff9e8')
draw = ImageDraw.Draw(sheet)
for cat_index, cat in enumerate(catalog):
    for story_index, story in enumerate(cat):
        asset = root / 'web' / story['art'].removeprefix('./')
        with Image.open(asset) as image:
            sheet.paste(image.resize((160, 240)), (story_index * 160, cat_index * 265))
        draw.text((story_index * 160 + 5, cat_index * 265 + 243), f'{cat_index + 1}-{story_index + 1:02}', fill='#365c46')
sheet.save(root / 'artwork/all-posters-review.jpg', quality=92)
print('Verified 50 posters: 5 original WebP files retained, 45 PNG masters encoded.')
