import os
import csv
import zipfile
from PIL import Image, ImageDraw, ImageFont

# 1. Konfigürasyon
FONT_PATH = r"C:\Windows\Fonts\seguiemj.ttf" # Windows Emoji Font
OUTPUT_DIR = "achievements_package"
ACHIEVEMENTS = [
    {"name": "İlk Lokma", "emoji": "🍎", "xp": 1000, "desc": "Herhangi bir modda ilk yemi ye."},
    {"name": "Yapay Zeka Avcısı", "emoji": "🤖", "xp": 5000, "desc": "1P vs AI modunda yapay zekayı bir roundda yen."},
    {"name": "İnatçı Hayatta Kalan", "emoji": "🛡️", "xp": 5000, "desc": "Uzunluğun 3'ün altına düştükten sonra o roundu kazan."},
    {"name": "Gökkuşağı Gücü", "emoji": "🌈", "xp": 1000, "desc": "Bir Yakut (Ruby) yiyerek 'Beast Mode' aktif et."},
    {"name": "Dev Yılan", "emoji": "🐍", "xp": 5000, "desc": "Herhangi bir modda 50 birim uzunluğa ulaş."},
    {"name": "Sıfır Hata", "emoji": "🚫", "xp": 10000, "desc": "Bir maçı rakibine hiç round vermeden (5-0) kazan."},
    {"name": "Engel Tanımaz", "emoji": "🧱", "xp": 10000, "desc": "Macera modunda 5. rounda ulaş."},
    {"name": "Boyut Gezgini", "emoji": "🌀", "xp": 1000, "desc": "Macera modunda portalları 5 kez kullan."},
    {"name": "Robot Terbiye Edicisi", "emoji": "🏎️", "xp": 10000, "desc": "Hızlı Rekabetçi modunda AI'yı 5-0 yen."},
    {"name": "Son Saniye Kahramanı", "emoji": "⏱️", "xp": 5000, "desc": "Hızlı modda son 10 saniye içinde kazan."},
    {"name": "Büyük Dönüş", "emoji": "🔄", "xp": 20000, "desc": "Hızlı modda 4-0 gerideyken maçı 5-4 kazan."},
    {"name": "Beraberlik Yok", "emoji": "🤝", "xp": 10000, "desc": "Hızlı modda 'Ani Ölüm' (Sudden Death) zaferi kazan."},
    {"name": "Hayalet Geçiş", "emoji": "👻", "xp": 5000, "desc": "Boost etkisindeyken rakibin içinden geç."},
    {"name": "Şimşek Refleks", "emoji": "⚡", "xp": 10000, "desc": "Hızlı modda maçı 1 dakikadan kısa sürede bitir."},
    {"name": "Macera Tamamlandı", "emoji": "🧗", "xp": 10000, "desc": "Macera modunda maçı kazan."}
]

def create_icon(emoji, filename):
    size = 512
    # Create black background with deep blue/purple tint
    img = Image.new('RGB', (size, size), color=(10, 10, 20))
    draw = ImageDraw.Draw(img)
    
    try:
        # Load emoji font - Note: rendering emojis in Windows PIL can be tricky, 
        # normally we use better libraries but for simple output this is standard.
        font = ImageFont.truetype(FONT_PATH, 300)
        # Use simple text rendering (Black/White or system color)
        # Check if font supports the emoji
        draw.text((size//2, size//2), emoji, font=font, fill="white", anchor="mm", embedded_color=True)
    except Exception as e:
        print(f"Font issue for {emoji}: {e}")
        # Fallback to simple circle
        draw.ellipse([size//4, size//4, 3*size//4, 3*size//4], fill="white")

    img.save(os.path.join(OUTPUT_DIR, filename))

def generate_package():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    # Generate Icons and CSVs
    metadata_rows = []
    mapping_rows = []
    
    for i, ach in enumerate(ACHIEVEMENTS, 1):
        icon_filename = f"icon_{i}.png"
        create_icon(ach["emoji"], icon_filename)
        
        # Metadata: Name, Description, Incremental, Steps, State, XP, Order
        metadata_rows.append([ach["name"], ach["desc"], "False", "", "Revealed", ach["xp"], i])
        
        # Mapping: Name, IconFilename
        mapping_rows.append([ach["name"], icon_filename])
        
    # Write CSVs
    with open(os.path.join(OUTPUT_DIR, "AchievementsMetadata.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(metadata_rows)
        
    with open(os.path.join(OUTPUT_DIR, "AchievementsIconsMappings.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(mapping_rows)
        
    # ZIP it (No subdirectories inside ZIP)
    with zipfile.ZipFile("snake_achievements_v289.zip", "w") as z:
        for file in os.listdir(OUTPUT_DIR):
            z.write(os.path.join(OUTPUT_DIR, file), file)

if __name__ == "__main__":
    generate_package()
    print("Package snake_achievements_v289.zip created successfully.")
