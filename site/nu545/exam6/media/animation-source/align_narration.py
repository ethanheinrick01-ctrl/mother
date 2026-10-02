"""Align the exact written scripts with local Whisper word timings.

Run Whisper on the bundled completed Clear MP3 files first. Pass its output
directory as the command argument. This does not call a remote API.
Recognition is a timing aid; the caption text remains the approved source-bound
script, including medical spellings. Review stage changes against the audio.
"""
import bisect, difflib, json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MEDIA = HERE.parent
SCRIPTS = json.loads((HERE / 'chapter-film-scripts.json').read_text())

def letters(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())

def stamp(t):
    ms = round(t * 1000)
    return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}'

def align(ch, asrdir):
    script = SCRIPTS[str(ch)]
    words = []
    for stage, part in enumerate(script['stages']):
        words.extend(dict(text=w,stage=stage) for w in part['text'].split())
    recognized = json.loads((asrdir/f'ch{ch}-clear.json').read_text())
    asrwords = [w for s in recognized['segments'] for w in s['words']]
    original = ''.join(letters(w['text']) for w in words)
    heard = ''.join(letters(w['word']) for w in asrwords)
    matcher = difflib.SequenceMatcher(None, original, heard, autojunk=False)
    assert matcher.ratio() > .9, (ch,'Recognition differs from script',matcher.ratio())
    char_times = []
    for w in asrwords:
        n = len(letters(w['word']))
        char_times.extend(w['start']+(w['end']-w['start'])*i/max(n,1) for i in range(n))
    mapping = {}
    for a,b,n in matcher.get_matching_blocks():
        for i in range(n):mapping[a+i] = char_times[b+i]
    offsets = sorted(mapping)
    def when(pos):
        i = bisect.bisect_left(offsets, pos)
        if i == len(offsets):return mapping[offsets[-1]]
        if i == 0:return mapping[offsets[0]]
        lo,hi = offsets[i-1],offsets[i]
        return mapping[lo]+(mapping[hi]-mapping[lo])*(pos-lo)/max(hi-lo,1)
    k=0
    for w in words:
        n=len(letters(w['text']))
        w.update(start=round(when(k),3),end=round(when(k+n-1)+.06,3))
        k+=n
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(MEDIA/'audio'/f'ch{ch}-clear.mp3')]))
    stages=[]
    for i,s in enumerate(script['stages']):
        stages.append(dict(start=0 if i==0 else next(w['start'] for w in words if w['stage']==i),title=s['title'],text=s['text']))
    cues=[]; group=[]
    for i,w in enumerate(words):
        group.append(w)
        last=i==len(words)-1
        if len(group)>=9 or w['text'].endswith(('.','?')) or last:
            end=min(duration,group[-1]['end'])
            if not last:end=min(end,words[i+1]['start']-.03)
            a=max(0,group[0]['start'])
            end=max(a+.05,end)
            text=' '.join(v['text'] for v in group)
            if len(text)>54:
                half=len(group)//2
                text=' '.join(v['text'] for v in group[:half])+'\n'+' '.join(v['text'] for v in group[half:])
            cues.append(f'{stamp(a)} --> {stamp(end)}\n{text}')
            group=[]
    (MEDIA/f'ch{ch}-academic.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(cues)+'\n')
    (MEDIA/f'ch{ch}-academic.txt').write_text('\n\n'.join(s['text'] for s in stages)+'\n')
    timed=dict(title=script['title'],sources=script['sources'],stages=stages,words=words,duration=duration,recognitionAgreement=round(matcher.ratio(),4))
    (HERE/f'ch{ch}-timing.json').write_text(json.dumps(timed,indent=2)+'\n')
    print(ch,duration,[s['start'] for s in stages],timed['recognitionAgreement'])

if __name__=='__main__':
    for ch in range(40,46):align(ch,Path(sys.argv[1]))
