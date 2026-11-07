# ระบบวาดคลิป "ผีเฝ้าไซต์" (ภนว | AI Guide)

ตัวละครวาดด้วยโค้ด หน้าตาจึงเหมือนเดิมทุกฉาก เสียงแยกตามตัวละครจาก ElevenLabs

| ไฟล์ | หน้าที่ |
|---|---|
| `lib.js` | ตัวละคร (`person`, `ghost`), UI, ลายน้ำ, ไอคอน PPE |
| `bg1.js` | ฉากไซต์ก่อสร้าง (`background`, `shrine`) |
| `characters.json` | ตัวละคร เสียง สีซับ หน้าตา |
| `tts.py` | สร้างเสียงพากย์ด้วย API key (ทางเลือก) |
| `render.py` | เรนเดอร์ฉาก (`stills` ภาพนิ่ง / `video` วิดีโอ) |
| `mix.py` | รวมฉาก + เสียงพากย์ + เพลง + เอฟเฟกต์ |
| `build.py` | ทำทุกขั้นในคำสั่งเดียว |
| `sfx/` | เสียงเอฟเฟกต์และเพลง (music.mp3 แนวผี, music_sport.mp3 แนวกีฬา) |
| `epN/` | แต่ละตอน: lines.json, ep.html, cues.json, vo/, extra.json |

ต้องมี: python3, playwright, google-chrome, ffmpeg, Pillow, ฟอนต์ Kanit (อยู่ใน `fonts/`)
