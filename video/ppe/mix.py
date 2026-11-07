import subprocess, itertools, sys
import os, json
EP = os.environ.get('EP'); BASE = f'{EP}/' if EP else ''
D = json.load(open(f'{BASE}D.json')) if EP else [6.0, 5.4, 4.2, 3.6, 4.2, 3.8, 10.0, 4.4, 4.2, 3.4, 4.0, 2.2, 5.6, 5.0]
N = len(D)
S = [0] + list(itertools.accumulate(D)); TOTAL = S[-1]
VO = sys.argv[1] if len(sys.argv) > 1 else f'{BASE}vo'
OUTNAME = sys.argv[2] if len(sys.argv) > 2 else 'PPE_ghost_clip.mp4'
st = lambda n, t: S[min(n-1, len(S)-1)] + t

sfx_ep1 = [  # (file, time, volume)
    ('wind', st(1, 0), .5),
    *[('pop', st(2, 1.6 + i*.55), .6) for i in range(4)],
    *[('pop', st(3, 2.0 + i*.4), .55) for i in range(3)],
    ('pop', st(4, .2), .5),
    ('flicker', st(5, .8), .45), ('wind', st(5, 1.0), .6),
    ('possess', st(6, .35), .8),
    ('whoosh', st(7, 2.4), .5),
    *[('pop', st(7, x), .7) for x in (3.64, 4.34, 5.62, 6.52)], ('chime', st(7, 7.82), .6),
    ('whoosh', st(8, 1.2), .5), ('thud', st(8, 1.85), .8), ('whoosh', st(8, 2.1), .5), ('thud', st(8, 2.75), .8),
    ('fall', st(9, 1.3), .6), ('bonk', st(9, 2.55), .95),
    ('confused', st(10, .2), .6),
    ('whoosh', st(11, .2), .4), ('chime', st(11, 1.0), .35),
    ('wait', st(12, 0), .8),
    ('chime', st(13, 2.2), .55),
    ('whoosh', st(14, 0), .5), ('chime', st(14, 1.0), .45),
]

sfx = [(f, st(n, t), v) for n, t, f, v in json.load(open(f'{BASE}cues.json'))] if EP else sfx_ep1
OUT = f'{BASE}out'
open(f'{OUT}/list.txt', 'w').write(''.join(f"file 's{n:02d}.mp4'\n" for n in range(1, N+1)))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', f'{OUT}/list.txt', '-c', 'copy', f'{OUT}/video.mp4'], check=True)

inputs = ['-i', f'{OUT}/video.mp4', '-stream_loop', '-1', '-i', os.environ.get('MUSIC', 'sfx/music.mp3')]
fil = []
for n in range(1, N+1):
    inputs += ['-i', f'{VO}/vo{n:02d}.mp3']
    fil.append(f'[{n+1}:a]aresample=44100,adelay={int(st(n, .25)*1000)}:all=1,volume=1.6[v{n}]')
base = N + 2
for i, (f, t, vol) in enumerate(sfx):
    inputs += ['-i', f'sfx/{f}.mp3']
    fil.append(f'[{base+i}:a]aresample=44100,adelay={int(t*1000)}:all=1,volume={vol}[x{i}]')
fil.append(''.join(f'[v{n}]' for n in range(1, N+1)) + f'amix=inputs={N}:normalize=0,apad,atrim=0:{TOTAL},asplit=2[vo][vosc]')
wn = next((n for n, t, f, v in json.load(open(f'{BASE}cues.json')) if f == 'wait'), None) if EP else 12
w0, w1 = (S[wn-1], S[wn]) if wn else (-1, -1)
fil.append(f"[1:a]aresample=44100,atrim=0:{TOTAL},volume='if(between(t,{w0},{w1}),0.02,0.22)':eval=frame,afade=t=out:st={TOTAL-1.5}:d=1.5[mu]")
fil.append('[mu][vosc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[mud]')
fil.append(''.join(f'[x{i}]' for i in range(len(sfx))) + f'amix=inputs={len(sfx)}:normalize=0,apad,atrim=0:{TOTAL}[fx]')
fil.append('[vo][mud][fx]amix=inputs=3:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
cmd = ['ffmpeg', '-y', '-v', 'error'] + inputs + ['-filter_complex', ';'.join(fil), '-map', '0:v', '-map', '[a]',
       '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', '-t', str(TOTAL), f'{OUT}/tmp_final.mp4']
subprocess.run(cmd, check=True)
import os; os.replace(f'{OUT}/tmp_final.mp4', f'{OUT}/{OUTNAME}')
print('done', TOTAL)
