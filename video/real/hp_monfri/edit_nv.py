# ตัดต่อแบบไม่มีเสียงพากย์: ซับ + หัวคลิป + ป้าย AI + ลายน้ำ + เสียงเดิมของคลิป
import json, os, subprocess
from PIL import Image, ImageDraw, ImageFont
HERE=os.path.dirname(os.path.abspath(__file__)); W,H=1080,1920
FONT=os.path.join(HERE,'..','..','ppe','fonts','Kanit-Bold.ttf'); WM=os.path.join(HERE,'..','..','ppe','watermark.png')
S=json.load(open(f'{HERE}/script.json')); os.makedirs(f'{HERE}/tmp',exist_ok=True); os.makedirs(f'{HERE}/out',exist_ok=True)
def ov(i,it):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    f=ImageFont.truetype(FONT,62); fs=ImageFont.truetype(FONT,30); fh=ImageFont.truetype(FONT,58); ft=ImageFont.truetype(FONT,50)
    # หัวคลิป
    hd=it['head']; w=d.textlength(hd,font=fh)
    d.rounded_rectangle([(W-w)/2-36,150,(W+w)/2+36,250],30,fill=(255,92,141,235)); d.text(((W-w)/2,160),hd,font=fh,fill='white')
    # ป้ายเวลา
    tg=it['tag']; w=d.textlength(tg,font=ft)
    d.rounded_rectangle([(W-w)/2-28,275,(W+w)/2+28,355],24,fill=(255,255,255,235)); d.text(((W-w)/2,280),tg,font=ft,fill=(40,30,60))
    lines=it['sub'].split('|'); y=H-420-84*(len(lines)-1)
    for ln in lines:
        w=d.textlength(ln,font=f); d.rounded_rectangle([(W-w)/2-30,y-10,(W+w)/2+30,y+82],24,fill=(15,10,25,185)); d.text(((W-w)/2,y),ln,font=f,fill='white'); y+=96
    t='ภาพจำลองด้วย AI'; d.rounded_rectangle([36,44,36+d.textlength(t,font=fs)+36,98],18,fill=(0,0,0,140)); d.text((54,50),t,font=fs,fill=(255,255,255,230))
    p=f'{HERE}/tmp/ov{i}.png'; im.save(p); return p
parts=[]
for i,it in enumerate(S,1):
    out=f'{HERE}/tmp/p{i}.mp4'
    fc=(f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30,eq=saturation=1.15:contrast=1.04[v];"
        f"[v][1:v]overlay=0:0[v2];[v2][2:v]overlay=W-w-30:H-h-40[vo];[0:a]loudnorm=I=-16:TP=-1.5,afade=t=in:d=0.15[ao]")
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(it['start']),'-t',str(it['len']),'-i',f'{HERE}/shots/shot{i}.mp4','-i',ov(i,it),'-i',WM,
        '-filter_complex',fc,'-map','[vo]','-map','[ao]','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-ar','44100','-ac','2',out],check=True)
    parts.append(out)
open(f'{HERE}/tmp/l.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{HERE}/tmp/l.txt','-c','copy',f'{HERE}/out/hp_monfri_v1.mp4'],check=True)
