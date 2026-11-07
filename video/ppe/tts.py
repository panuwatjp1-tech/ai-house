"""สร้างเสียงพากย์ทีละบรรทัด แยกเสียงตามตัวละคร

lines.json รับได้ 2 แบบ (ใช้ปนกันได้):
  "ข้อความ"                          -> ใช้เสียงผู้บรรยาย (narrator)
  {"who": "ghost", "text": "ข้อความ"} -> ใช้เสียงของตัวละครใน characters.json

ใช้งาน:  python3 tts.py <ep>        เช่น  python3 tts.py ep5
API key: ตัวแปร ELEVENLABS_API_KEY หรือไฟล์ .key ข้างสคริปต์นี้
"""
import json, sys, os, subprocess, time, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
EP = sys.argv[1]
MODEL = sys.argv[2] if len(sys.argv) > 2 else 'eleven_v4'
CHARS = json.load(open(f'{ROOT}/characters.json'))
KEY = os.environ.get('ELEVENLABS_API_KEY') or open(f'{ROOT}/.key').read().strip()
OUT = f'{ROOT}/{EP}/vo'
os.makedirs(OUT, exist_ok=True)

lines = [x if isinstance(x, dict) else {'who': 'narrator', 'text': x}
         for x in json.load(open(f'{ROOT}/{EP}/lines.json'))]
unknown = {l['who'] for l in lines} - set(CHARS)
if unknown: sys.exit(f'ไม่มีตัวละครนี้ใน characters.json: {unknown}')

durs = []
for i, l in enumerate(lines, 1):
    path = f'{OUT}/vo{i:02d}.mp3'
    if not os.path.exists(path):
        voice = CHARS[l['who']]['voice_id']
        body = json.dumps({'text': l['text'], 'model_id': MODEL}).encode()
        for attempt in range(4):
            try:
                req = urllib.request.Request(
                    f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128',
                    data=body, headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
                open(path, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
                break
            except Exception as e:
                print('retry', i, e); time.sleep(5)
        else:
            sys.exit(f'สร้างเสียงบรรทัด {i} ไม่สำเร็จ')
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))
    durs.append(d)
    print(i, CHARS[l['who']]['name'], round(d, 2), l['text'])
json.dump(durs, open(f'{OUT}/durs.json', 'w'))
json.dump([l['who'] for l in lines], open(f'{OUT}/speakers.json', 'w'))
print('total', round(sum(durs), 2))
