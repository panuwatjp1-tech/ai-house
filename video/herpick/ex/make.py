# Her Pick การ์ตูน: "วันแต่งเต็ม vs วันหน้าสด" (วาดด้วย PIL ไม่ใช้เครดิต)
import os, math, subprocess, random, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..')
W, H, FPS = 1080, 1920, 30
FONT = os.path.join(ROOT, 'ppe', 'fonts', 'Kanit-Bold.ttf')
WM = Image.open(os.path.join(ROOT, 'ppe', 'watermark.png')).convert('RGBA')
SFX = os.path.join(ROOT, 'ppe', 'sfx'); MAS = os.path.join(ROOT, 'herpick', 'mascot')
F = lambda s: ImageFont.truetype(FONT, s)
dur = lambda p: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
os.makedirs(f'{HERE}/tmp', exist_ok=True); os.makedirs(f'{HERE}/out', exist_ok=True)
random.seed(3)

SC = [  # pose, bg, sub, sfx
 dict(pose='wave', bg='room', sub='วันที่แต่งหน้าจัดเต็ม|ปัดแก้มเป๊ะ ผมสวยทุกเส้น', sfx='magic'),
 dict(pose='think', bg='street', sub='ออกไปทั้งวัน...|ไม่เจอคนรู้จักสักคน', sfx='wait'),
 dict(pose='point', bg='store', sub='วันที่หน้าสด ผมยุ่ง|ออกไปซื้อของแป๊บเดียว...', sfx='pop', plain=True),
 dict(pose='surprised', bg='store', sub='เจอแฟนเก่า!|แถมมากับแฟนใหม่อีก!', sfx='crash', plain=True, ex=True),
 dict(pose='wave', bg='end', sub='ใครเคยเป็นแบบนี้บ้าง|เมนต์มาเล่าหน่อย!', sfx='pop', end=True),
]
GAP = 0.45
for i, s in enumerate(SC, 1):
    s['vo'] = f'{HERE}/vo/vo{i:02d}.mp3'; s['len'] = dur(s['vo']) + GAP + 0.25

# ---------- พื้นหลัง ----------
def grad(c1, c2):
    a = np.linspace(0, 1, H)[:, None, None]; g = (np.array(c1) * (1 - a) + np.array(c2) * a).astype(np.uint8)
    return Image.fromarray(np.repeat(g, W, axis=1), 'RGB')
def bg_room():
    im = grad((255, 214, 230), (255, 236, 244)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([90, 260, 520, 760], 30, fill=(190, 230, 255), outline=(255, 255, 255), width=18)
    d.line([305, 260, 305, 760], fill=(255, 255, 255), width=12); d.line([90, 510, 520, 510], fill=(255, 255, 255), width=12)
    for k in range(14):  # ไฟประดับ
        x = 80 + k * 70; y = 200 + int(30 * math.sin(k * 0.9)); d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=(255, 230, 120))
    d.rounded_rectangle([640, 330, 1000, 820], 40, fill=(255, 255, 255))  # โต๊ะเครื่องแป้ง+กระจก
    d.ellipse([690, 360, 950, 640], fill=(220, 240, 255), outline=(255, 190, 210), width=14)
    d.rectangle([0, 1380, W, H], fill=(250, 200, 215))
    return im
def bg_street():
    im = grad((140, 205, 255), (215, 240, 255)); d = ImageDraw.Draw(im)
    for x, w, h, c in [(0, 260, 900, (250, 220, 200)), (240, 220, 700, (255, 200, 210)), (440, 300, 1000, (210, 225, 250)), (720, 360, 820, (240, 230, 180))]:
        d.rectangle([x, 1300 - h, x + w, 1300], fill=c)
        for wy in range(1300 - h + 60, 1260, 120):
            for wx in range(x + 30, x + w - 50, 80): d.rectangle([wx, wy, wx + 44, wy + 60], fill=(255, 255, 255))
    d.rectangle([0, 1300, W, H], fill=(205, 205, 215)); d.rectangle([0, 1300, W, 1340], fill=(170, 170, 185))
    return im
def bg_store():
    im = grad((235, 255, 248), (250, 255, 252)); d = ImageDraw.Draw(im)
    d.rectangle([0, 170, W, 280], fill=(60, 190, 150)); d.text((60, 188), 'MINI MART 24 ชม.', font=F(60), fill='white')
    cols = [(255, 120, 120), (255, 200, 80), (120, 190, 255), (160, 220, 120), (255, 150, 210)]
    for row in range(5):
        y = 360 + row * 200; d.rectangle([40, y + 150, W - 40, y + 168], fill=(180, 180, 190))
        for k in range(12):
            x = 60 + k * 82; hh = 90 + (k * 37 + row * 11) % 50
            d.rounded_rectangle([x, y + 150 - hh, x + 66, y + 150], 10, fill=cols[(k + row) % 5])
    d.rectangle([0, 1420, W, H], fill=(225, 230, 228))
    return im
def bg_end():
    im = grad((255, 120, 170), (255, 200, 225)); d = ImageDraw.Draw(im)
    for k in range(30):
        x, y, r = random.randint(0, W), random.randint(300, 1700), random.randint(14, 34); heart(d, x, y, r, (255, 255, 255, 90))
    return im
def heart(d, x, y, r, fill):
    d.ellipse([x - r, y - r, x, y], fill=fill); d.ellipse([x, y - r, x + r, y], fill=fill)
    d.polygon([(x - r, y - r / 2), (x + r, y - r / 2), (x, y + r)], fill=fill)
BG = {k: f().convert('RGBA') for k, f in [('room', bg_room), ('street', bg_street), ('store', bg_store), ('end', bg_end)]}

# ---------- ตัวละคร ----------
MH = 1150
def load(n):
    im = Image.open(f'{MAS}/{n}.png').convert('RGBA'); return im.resize((int(im.width * MH / im.height), MH), Image.LANCZOS)
POSE = {}
for p in ['wave', 'point', 'think', 'surprised']:
    for m in ['open', 'half', 'closed']:
        if os.path.exists(f'{MAS}/{p}_{m}.png'): POSE[(p, m)] = load(f'{p}_{m}')
def plain(im):  # โหมดหน้าสด: สีซีดลงนิด
    a = im.split()[3]; c = ImageEnhance.Color(im.convert('RGB')).enhance(0.55); c = ImageEnhance.Brightness(c).enhance(0.97)
    c = c.convert('RGBA'); c.putalpha(a); return c
PLAIN = {k: plain(v) for k, v in POSE.items()}

def rms_env(path, total):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'])
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; n = int(total * FPS); hop = 16000 // FPS
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) if i * hop < len(x) else 0 for i in range(n)])
    return e / (e.max() + 1e-6)

def ex_couple(t):
    im = Image.new('RGBA', (460, 700), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # ผู้ชาย
    d.rounded_rectangle([40, 250, 200, 640], 60, fill=(70, 110, 190)); d.ellipse([55, 90, 185, 220], fill=(255, 215, 185))
    d.chord([50, 80, 190, 190], 180, 360, fill=(40, 30, 30)); d.rectangle([60, 630, 100, 690], fill=(40, 40, 60)); d.rectangle([140, 630, 180, 690], fill=(40, 40, 60))
    # แฟนใหม่
    d.ellipse([245, 110, 395, 300], fill=(60, 40, 35)); d.rounded_rectangle([250, 260, 400, 640], 60, fill=(255, 140, 180))
    d.ellipse([265, 110, 375, 230], fill=(255, 220, 195)); d.rectangle([270, 630, 305, 690], fill=(255, 220, 195)); d.rectangle([345, 630, 380, 690], fill=(255, 220, 195))
    for ex_, ey in [(120, 160), (320, 175)]:  # หน้า: ตา แก้ม ยิ้ม
        d.ellipse([ex_-30, ey-8, ex_-16, ey+8], fill=(40, 30, 30)); d.ellipse([ex_+16, ey-8, ex_+30, ey+8], fill=(40, 30, 30))
        d.arc([ex_-24, ey+4, ex_+24, ey+40], 20, 160, fill=(200, 80, 90), width=6)
        d.ellipse([ex_-46, ey+12, ex_-28, ey+26], fill=(255, 170, 170)); d.ellipse([ex_+28, ey+12, ex_+46, ey+26], fill=(255, 170, 170))
    d.line([190, 420, 270, 420], fill=(255, 215, 185), width=26)  # จับมือ
    r = 34 + 6 * math.sin(t * 8); heart(d, 230, 60, r, (255, 70, 110))
    return im

def caption(d, sub, a):
    f = F(64); lines = sub.split('|'); y = 1520
    for ln in lines:
        w = d.textlength(ln, font=f)
        d.rounded_rectangle([(W - w) / 2 - 34, y - 12, (W + w) / 2 + 34, y + 86], 28, fill=(25, 15, 40, int(200 * a)))
        d.text(((W - w) / 2, y - 2), ln, font=f, fill=(255, 255, 255, int(255 * a))); y += 104
def header(d):
    t = 'วันแต่งเต็ม vs วันหน้าสด'; f = F(60); w = d.textlength(t, font=f)
    d.rounded_rectangle([(W - w) / 2 - 40, 1720 - 1720 + 40, (W + w) / 2 + 40, 140], 34, fill=(255, 92, 141, 240)); d.text(((W - w) / 2, 50), t, font=f, fill='white')

def frame(s, t, env, idx):
    T = s['len']; im = BG[s['bg']].copy(); d = ImageDraw.Draw(im, 'RGBA')
    e = env[min(idx, len(env) - 1)]; m = 'open' if e > 0.45 else ('half' if e > 0.18 else 'closed')
    pose = s['pose']; src = PLAIN if s.get('plain') else POSE
    ch = src.get((pose, m)) or src[(pose, 'open')]
    pop = min(1, t / 0.25); sc = 0.85 + 0.15 * (1 - (1 - pop) ** 3); bob = 10 * math.sin(t * 4)
    zoom = 1.0; sx = 0
    if s.get('ex'):
        zoom = 1 + 0.12 * min(1, t / 0.3); sx = int(18 * math.sin(t * 60) * max(0, 1 - t / 0.8))
    cw, chh = int(ch.width * sc), int(ch.height * sc); c = ch.resize((cw, chh), Image.BILINEAR)
    cx = W // 2 - (200 if s.get('ex') else 0)
    im.alpha_composite(c, (cx - cw // 2 + sx, int(1560 - chh + bob)))
    if s.get('ex'):
        cp = ex_couple(t); k = min(1, t / 0.35); x = int(W - 40 - cp.width * 0.9 + (1 - k) * 500)
        cp = cp.resize((int(cp.width * 0.9), int(cp.height * 0.9))); im.alpha_composite(cp, (x, 760))
        if t < 0.35: d.rectangle([0, 0, W, H], fill=(255, 255, 255, int(160 * (1 - t / 0.35))))
        for k2, (x2, y2) in enumerate([(150, 420), (330, 360)]):
            d.text((x2, y2 + 6 * math.sin(t * 10 + k2)), '!', font=F(150), fill=(255, 60, 90))
    if pose == 'wave' and s['bg'] == 'room':
        for k in range(8):
            a = (math.sin(t * 6 + k) + 1) / 2; x = 200 + (k * 137) % 700; y = 500 + (k * 211) % 600
            r = 10 + 18 * a; d.polygon([(x, y - r * 2), (x + r / 2, y), (x, y + r * 2), (x - r / 2, y)], fill=(255, 255, 255, int(230 * a)))
            d.polygon([(x - r * 2, y), (x, y + r / 2), (x + r * 2, y), (x, y - r / 2)], fill=(255, 255, 255, int(230 * a)))
    if s['bg'] == 'street':  # ใบไม้ปลิวเหงาๆ
        for k in range(5):
            x = (W + 100 - (t * 260 + k * 260) % (W + 200)); y = 900 + 80 * math.sin(t * 2 + k)
            d.ellipse([x, y, x + 34, y + 18], fill=(150, 190, 90))
        d.rounded_rectangle([690, 420, 930, 560], 50, fill=(255, 255, 255, 235)); d.text((735, 420), '...', font=F(110), fill=(120, 120, 140))
    if s.get('plain'):
        t2 = 'โหมดหน้าสด'; f = F(44); w = d.textlength(t2, font=f)
        d.rounded_rectangle([60, 310, 60 + w + 50, 390], 26, fill=(255, 255, 255, 235)); d.text((85, 315), t2, font=f, fill=(110, 110, 130))
        if not s.get('ex'):  # หยดเหงื่อ
            for k, (x, y) in enumerate([(cx + 150, 520), (cx + 190, 600)]):
                yy = y + (t * 80 + k * 40) % 60; d.ellipse([x, yy, x + 26, yy + 40], fill=(130, 200, 255, 220))
    if s.get('end'):
        t2 = 'แท็กเพื่อนที่เคยโดน!'; f = F(70); w = d.textlength(t2, font=f); a = min(1, t / 0.4)
        d.rounded_rectangle([(W - w) / 2 - 40, 270, (W + w) / 2 + 40, 380], 40, fill=(255, 210, 63, int(245 * a)), outline=(30, 30, 30, int(255 * a)), width=5)
        d.text(((W - w) / 2, 280), t2, font=f, fill=(30, 30, 30, int(255 * a)))
    if zoom != 1:
        z = im.resize((int(W * zoom), int(H * zoom)), Image.BILINEAR); ox = (z.width - W) // 2; oy = (z.height - H) // 2
        im = z.crop((ox, oy, ox + W, oy + H)); d = ImageDraw.Draw(im, 'RGBA')
    header(d); caption(d, s['sub'], min(1, t / 0.2))
    im.alpha_composite(WM, (W - WM.width - 30, H - WM.height - 40))
    return im.convert('RGB')

# ---------- เรนเดอร์ภาพ ----------
total = sum(s['len'] for s in SC)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', f'{HERE}/tmp/video.mp4'], stdin=subprocess.PIPE)
for s in SC:
    env = rms_env(s['vo'], s['len']); env = np.concatenate([np.zeros(int(0.25 * FPS)), env])  # เสียงเริ่มที่ 0.25 วิ
    for i in range(int(s['len'] * FPS)):
        p.stdin.write(frame(s, i / FPS, env, i).tobytes())
p.stdin.close(); p.wait()

# ---------- เพลงประกอบ (สังเคราะห์เอง) ----------
sr = 44100; n = int(total * sr) + sr; mus = np.zeros(n, np.float32)
def pluck(f, L, amp):
    t = np.arange(int(L * sr)) / sr; return amp * np.exp(-t * 5) * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t))
chords = [[261.6, 329.6, 392.0], [196.0, 246.9, 293.7], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6]]
beat = 60 / 112
for b in range(int(total / beat) + 2):
    ch = chords[(b // 4) % 4]; st = int(b * beat * sr)
    for k, f in enumerate([ch[0] / 2] if b % 2 == 0 else []): seg = pluck(f, 0.6, 0.35); mus[st:st + len(seg)] += seg[:max(0, n - st)]
    f = ch[(b * 2) % 3] * 2; seg = pluck(f, 0.4, 0.22); mus[st:st + len(seg)] += seg[:max(0, n - st)]
    st2 = st + int(beat / 2 * sr); f = ch[(b * 2 + 1) % 3] * 2; seg = pluck(f, 0.3, 0.15); mus[st2:st2 + len(seg)] += seg[:max(0, n - st2)]
mus = (mus / np.abs(mus).max() * 0.9 * 32767).astype(np.int16)
import wave
with wave.open(f'{HERE}/tmp/music.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(mus.tobytes())

# ---------- รวมเสียง ----------
inputs = ['-i', f'{HERE}/tmp/video.mp4', '-i', f'{HERE}/tmp/music.wav']; fc = []; labs = []; t0 = 0; k = 2
for i, s in enumerate(SC):
    inputs += ['-i', s['vo'], '-i', f"{SFX}/{s['sfx']}.mp3"]
    ms = int((t0 + 0.25) * 1000); fc.append(f'[{k}:a]adelay={ms}|{ms},volume=1.5[v{i}]'); labs.append(f'[v{i}]')
    ms2 = int(t0 * 1000); fc.append(f'[{k+1}:a]adelay={ms2}|{ms2},volume=0.45[s{i}]'); labs.append(f'[s{i}]')
    t0 += s['len']; k += 2
fc.append(f'[1:a]volume=0.16,afade=t=out:st={total-1.2:.2f}:d=1.2[m]'); labs.append('[m]')
fc.append(''.join(labs) + f'amix=inputs={len(labs)}:duration=longest:normalize=0,atrim=0:{total:.2f},loudnorm=I=-15:TP=-1.5[a]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc), '-map', '0:v', '-map', '[a]',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest', f'{HERE}/out/hp_ex_v1.mp4'], check=True)
print('เสร็จ', round(total, 1), 'วินาที')
