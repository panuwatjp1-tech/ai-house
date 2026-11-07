import sys, subprocess, os, json
ROOT = os.path.dirname(os.path.abspath(__file__))
from playwright.sync_api import sync_playwright

EP = os.environ.get('EP')
BASE = f'{ROOT}/{EP}' if EP else ROOT
D = json.load(open(f'{BASE}/D.json')) if EP else [6.0, 5.4, 4.2, 3.6, 4.2, 3.8, 10.0, 4.4, 4.2, 3.4, 4.0, 2.2, 5.6, 5.0]
HTML = f'{BASE}/ep.html' if EP else f'{ROOT}/scene.html'
FPS = 30
os.makedirs(f'{BASE}/out', exist_ok=True)

def page_setup(p):
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 540, 'height': 960}, device_scale_factor=2)
    pg.goto('file://'+HTML)
    pg.on('pageerror', lambda e: print('PAGEERR', e))
    pg.evaluate('render(1,3,6)')
    pg.evaluate('document.fonts.ready.then(()=>1)')
    pg.wait_for_timeout(500)
    return b, pg

def still(pg, n, t, path):
    pg.evaluate(f'render({n},{t},{D[n-1]})')
    pg.screenshot(path=path, type='jpeg', quality=92)

def scene(pg, n):
    d = D[n-1]; frames = round(d * FPS)
    tmp = f'{BASE}/out/s{n:02d}.tmp.mp4'; fin = f'{BASE}/out/s{n:02d}.mp4'
    ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp], stdin=subprocess.PIPE)
    for f in range(frames):
        pg.evaluate(f'render({n},{f / FPS},{d})')
        ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
    ff.stdin.close()
    if ff.wait() == 0:
        os.replace(tmp, fin); print('scene', n, 'ok', frames, flush=True)

if __name__ == '__main__':
    mode = sys.argv[1]
    with sync_playwright() as p:
        b, pg = page_setup(p)
        if mode == 'stills':
            os.makedirs(f'{BASE}/stills', exist_ok=True)
            for spec in sys.argv[2:]:
                n, t = spec.split(':'); still(pg, int(n), float(t), f'{BASE}/stills/s{int(n):02d}_{t}.jpg')
        else:
            for n in [int(x) for x in sys.argv[2:]]:
                scene(pg, n)
        b.close()
