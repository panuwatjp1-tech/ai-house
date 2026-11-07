"""ประกอบคลิปทั้งตอนในคำสั่งเดียว: python3 build.py ep7

ต้องมีใน epN/: lines.json, ep.html, cues.json, vo/vo01.mp3 ... (ครบทุกบรรทัด)
ไม่บังคับ: extra.json {"ฉาก": วินาทีเพิ่ม} สำหรับฉากที่มีแอ็กชันหลังพูดจบ
ผลลัพธ์: epN/out/PPE_ghost_EPN.mp4
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
EP = sys.argv[1]
B = f'{ROOT}/{EP}'
lines = json.load(open(f'{B}/lines.json'))
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
missing = [i for i in range(1, len(lines) + 1) if not os.path.exists(f'{B}/vo/vo{i:02d}.mp3')]
if missing: sys.exit(f'ยังไม่มีเสียงพากย์บรรทัด {missing}')

d = [dur(f'{B}/vo/vo{i:02d}.mp3') for i in range(1, len(lines) + 1)]
extra = {int(k): v for k, v in json.load(open(f'{B}/extra.json')).items()} if os.path.exists(f'{B}/extra.json') else {}
D = [round(x + 0.8 + extra.get(i, 0), 1) for i, x in enumerate(d, 1)]
json.dump(D, open(f'{B}/D.json', 'w')); json.dump(d, open(f'{B}/vo/durs.json', 'w'))
print('ความยาวรวม', round(sum(D), 1), 'วินาที')

os.makedirs(f'{B}/out', exist_ok=True)
n = len(D); chunks = [list(range(1, n + 1))[i::3] for i in range(3)]
env = dict(os.environ, EP=EP)
procs = [subprocess.Popen([sys.executable, f'{ROOT}/render.py', 'video'] + [str(s) for s in c], env=env) for c in chunks if c]
if any(p.wait() for p in procs): sys.exit('เรนเดอร์ไม่สำเร็จ')

name = f'PPE_ghost_{EP.upper()}.mp4'
subprocess.run([sys.executable, 'mix.py', f'{EP}/vo', name], cwd=ROOT, env=env, check=True)
print('เสร็จ:', f'{B}/out/{name}')
