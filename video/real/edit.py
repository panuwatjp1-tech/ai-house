"""ตัดต่อคลิปขายของแบบภาพจริง (จาก Google Flow / Meta AI / มือถือ)

โฟลเดอร์งาน เช่น video/real/harness/ ต้องมี
  shots/shot1.mp4 ... shotN.mp4   คลิปจาก Flow (แนวตั้ง)
  vo/vo01.mp3 ... voNN.mp3        เสียงพากย์ทีละช็อต
  script.json                     [{"sub": "ซับบรรทัด 1|บรรทัด 2"}, ...] ตามลำดับช็อต
                                  ใส่ "start" (วินาทีเริ่ม) และ "len" (ความยาว) ต่อช็อตได้
                                  {"cta": "ข้อความปิดท้าย"} ใส่ในช็อตสุดท้ายได้
ใช้งาน: python3 edit.py harness   -> harness/out/<ชื่อ>.mp4
- ตัดแต่ละช็อตให้ยาวเท่าเสียงพากย์ + 0.6 วินาที
- เสียงจากคลิปเดิมลดเหลือ 15% เป็นเสียงบรรยากาศ
- ซับไตเติล ลายน้ำ "ภนว | AI Guide" และป้าย "ภาพจำลองด้วย AI"
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
JOB = os.path.join(HERE, sys.argv[1])
W, H = 1080, 1920
FONT = os.path.join(HERE, '..', 'ppe', 'fonts', 'Kanit-Bold.ttf')
WM = os.path.join(HERE, '..', 'ppe', 'watermark.png')
script = json.load(open(f'{JOB}/script.json'))
os.makedirs(f'{JOB}/out', exist_ok=True); os.makedirs(f'{JOB}/tmp', exist_ok=True)
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))

def overlay(i, item):
    """ภาพโปร่งใสขนาดเต็มจอ: ซับ + ป้าย AI + ข้อความปิดท้าย"""
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 54); fs = ImageFont.truetype(FONT, 30); fc = ImageFont.truetype(FONT, 76)
    lines = item['sub'].split('|')
    y = H - 360 - 72 * (len(lines) - 1)
    for ln in lines:
        w = d.textlength(ln, font=f)
        d.rounded_rectangle([(W - w) / 2 - 28, y - 10, (W + w) / 2 + 28, y + 70], 22, fill=(10, 10, 20, 175))
        d.text(((W - w) / 2, y), ln, font=f, fill='white')
        y += 84
    d.rounded_rectangle([36, 44, 36 + d.textlength('ภาพจำลองด้วย AI', font=fs) + 36, 98], 18, fill=(0, 0, 0, 140))
    d.text((54, 50), 'ภาพจำลองด้วย AI', font=fs, fill=(255, 255, 255, 230))
    if item.get('cta'):
        w = d.textlength(item['cta'], font=fc)
        d.rounded_rectangle([(W - w) / 2 - 40, 230, (W + w) / 2 + 40, 350], 40, fill=(255, 210, 63, 240), outline=(27, 27, 27), width=5)
        d.text(((W - w) / 2, 244), item['cta'], font=fc, fill=(27, 27, 27))
    p = f'{JOB}/tmp/ov{i}.png'; im.save(p); return p

parts = []
for i, item in enumerate(script, 1):
    shot, vo = f'{JOB}/shots/shot{i}.mp4', f'{JOB}/vo/vo{i:02d}.mp3'
    st = item.get('start', 0)
    L = min(item.get('len', max(dur(vo) + 0.6, 3.0)), dur(shot) - st)
    out = f'{JOB}/tmp/part{i}.mp4'
    fc = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30[v];"
          f"[v][2:v]overlay=0:0[v2];[v2][3:v]overlay=W-w-30:H-h-40[vout];"
          f"[0:a]volume=0.15,apad[a0];[1:a]adelay=200|200,apad[a1];[a0][a1]amix=inputs=2:duration=first:normalize=0[aout]")
    has_audio = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', shot], capture_output=True, text=True).stdout.strip()
    if not has_audio: fc = fc.replace('[0:a]volume=0.15,apad[a0];', 'anullsrc=r=44100:cl=stereo[a0];')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(st), '-i', shot, '-i', vo, '-i', overlay(i, item), '-i', WM,
                    '-filter_complex', fc, '-map', '[vout]', '-map', '[aout]', '-t', f'{L:.2f}',
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '44100', '-ac', '2', out], check=True)
    parts.append(out); print('ช็อต', i, round(L, 1), 'วินาที')

lst = f'{JOB}/tmp/list.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
name = f'{JOB}/out/{os.path.basename(JOB)}.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', name], check=True)
print('เสร็จ:', name, round(dur(name), 1), 'วินาที')
