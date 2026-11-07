import json, os, urllib.request, time
ROOT = os.path.dirname(os.path.abspath(__file__))
KEY = os.environ.get('ELEVENLABS_API_KEY') or open(f'{ROOT}/.key').read().strip()
OUT = f'{ROOT}/sfx'; os.makedirs(OUT, exist_ok=True)

SFX = {
    'grind': ("machine making strange grinding rattling noise, malfunction, clunking", 3.0),
    'andon': ("factory andon call chime melody, short electronic alert tune", 2.0),
    'steps': ("person running quickly on factory floor", 1.5),

    'conveyor': ("factory conveyor belt running with rollers rattling and motor hum, packaging line", 6.0),
    'alarm': ("industrial machine jam alarm buzzer beeping", 2.5),
    'freeze': ("time stop sound effect, deep whoosh with sudden silence and shimmering freeze", 2.0),
    'rewind': ("VHS tape rewinding fast, cartoon rewind squeal", 2.5),
    'estop': ("heavy emergency stop button press clunk then machine winding down", 2.0),
    'lock': ("padlock snapping shut click with metal tag jingle", 1.0),
    'paper': ("paper sheet rustling and flipping", 1.0),
    'stamp': ("rubber stamp thump on paper", 0.6),

    'fanfare': ("short triumphant sports broadcast fanfare, brass trumpets", 3.0),
    'cheer': ("stadium crowd cheering and applauding", 3.0),
    'buzzer': ("game show wrong answer buzzer, comedic", 1.2),
    'drumroll': ("snare drum roll building suspense", 3.0),
    'grinder': ("angle grinder cutting steel, sparks", 2.5),
    'ouch': ("cartoon ouch yelp with comedic boing, hopping", 1.5),
    'stars': ("cartoon dizzy birds tweeting and stars spinning after head bonk", 2.0),
    'aww': ("crowd groaning aww in disappointment", 1.5),
    'ding': ("score card flip ding, game show", 0.6),

    'amulet': ("small metal amulet pendants rattling and jingling on a necklace", 1.5),
    'crash': ("heavy steel I-beam slamming onto gravel ground, loud metallic crash with rumble", 2.0),
    'gust': ("strong sudden wind gust blowing dust, whooshing", 3.0),
    'craneEngine': ("diesel mobile crane engine revving and winch hoisting, outdoor", 4.0),
    'magic': ("mystical golden shimmer sparkle, magical chime glow", 2.0),
    'sad': ("soft melancholic single piano note with gentle reverb", 3.0),
    'creak': ("steel wire rope sling creaking and swinging under load", 2.0),

    'phone': ("old mobile phone ringing, short cartoon ringtone", 2.0),
    'factory': ("steel fabrication workshop ambience: welding arc buzz, grinder, metal clanks, overhead crane hum", 8.0),
    'craneBeep': ("overhead crane warning beeping alarm, industrial", 2.0),
    'ting': ("tiny metallic ting of a spark bouncing off plastic safety glasses", 0.6),
    'gulp': ("cartoon nervous gulp swallow", 0.8),
    'whistle': ("short sharp security guard whistle blow", 1.0),
    'run': ("cartoon fast running footsteps scramble", 1.5),

    'wind': ("eerie cold night wind gust howling softly, spooky ambience", 4.0),
    'flicker': ("fluorescent floodlight buzzing and flickering electrical crackle", 2.5),
    'possess': ("cartoon spooky ghost possession sting, eerie whoosh with low ghostly moan", 2.5),
    'pop': ("short bright cartoon pop with a tiny boing, item equip sound", 0.6),
    'thud': ("cartoon soft bonk thud of a helmet put on a head", 0.6),
    'bonk': ("loud metal pipe hitting a plastic hard hat, cartoon clang bonk with ringing", 1.5),
    'fall': ("cartoon falling whistle descending, short", 1.2),
    'wait': ("cartoon record scratch then dramatic comedic stop sting", 1.5),
    'chime': ("cheerful success chime, bright positive jingle", 1.5),
    'whoosh': ("quick soft cartoon whoosh transition", 0.6),
    'confused': ("cartoon confused question boing, comedic", 1.0),
}

def post(url, body, path):
    for a in range(4):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(),
                headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
            open(path, 'wb').write(urllib.request.urlopen(req, timeout=300).read()); print('ok', path); return
        except Exception as e:
            print('retry', path, e, getattr(e, 'read', lambda: b'')()[:300]); time.sleep(5)

for k, (t, d) in SFX.items():
    p = f'{OUT}/{k}.mp3'
    if not os.path.exists(p):
        post('https://api.elevenlabs.io/v1/sound-generation', {'text': t, 'duration_seconds': d, 'prompt_influence': 0.5}, p)

p = f'{OUT}/music_sport.mp3'
if not os.path.exists(p):
    post('https://api.elevenlabs.io/v1/music', {
        'prompt': "Instrumental only, no vocals. Upbeat funny sports TV broadcast theme for a comedic animated video: bouncy brass stabs, funky bass, snare marching drums, playful xylophone, energetic game-show competition vibe, steady tempo, consistent energy, loop friendly.",
        'music_length_ms': 64000}, p)
