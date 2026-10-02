const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../site/nu545/exam4'),ctx={window:{}};vm.createContext(ctx);
for(const f of ['js/data/course.js','js/data/media.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const L=ctx.window.L;
test('all six chapter-first films have local Clear narration, controls assets and exact source disclosures',()=>{
 assert.equal(L.MEDIA_FILMS.length,6);assert.equal(L.MEDIA_SAMPLE,null);
 for(let ch=28;ch<=33;ch++){
  const found=L.MEDIA_FILMS.filter(f=>f.chapters.includes(ch));assert.equal(found.length,1);const f=found[0];
  assert.equal(f.voice,'AI Voice Generator · Clear');assert.equal(f.stages.length,4);
  for(const k of ['src','poster','captions','transcriptSrc','animationSource','scriptSrc','timingSrc','attributionSrc'])assert.ok(fs.statSync(path.join(root,f[k])).size>100,k);
  assert.ok(f.sources.every(s=>L.SOURCES[s]&&L.SOURCE_HTML[s]));
  const p=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path.join(root,f.src)]));
  const v=p.streams.find(x=>x.codec_type==='video'),a=p.streams.find(x=>x.codec_type==='audio');
  assert.equal(v.codec_name,'h264');assert.equal(v.width,1280);assert.equal(v.height,720);assert.equal(v.r_frame_rate,'24/1');assert.equal(a.codec_name,'aac');
  const duration=+p.format.duration;assert.ok(Math.abs(duration-f.duration)<.12);assert.ok(duration>40&&duration<80);
  for(let n=0;n<4;n++)assert.ok(f.stages[n].start>=0&&f.stages[n].start<duration&&(n===0||f.stages[n].start>f.stages[n-1].start));
  const vtt=fs.readFileSync(path.join(root,f.captions),'utf8');assert.ok(vtt.startsWith('WEBVTT'));
  const seconds=s=>{const [h,m,t]=s.split(':').map(Number);return h*3600+m*60+t};let end=0,count=0;
  for(const m of vtt.matchAll(/(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})/g)){const s=seconds(m[1]),e=seconds(m[2]);assert.ok(s>=end-.001&&e>s&&e<=duration+.08);end=e;count++;}assert.ok(count>=15);
 }
});
test('original art stays unchanged and credited with version-specific licenses',()=>{
 const figures=JSON.parse(fs.readFileSync(path.join(root,'media/figures.json')));assert.equal(figures.length,5);assert.equal(L.ACADEMIC_FIGURES.length,9);
 for(const f of figures){assert.ok(f.credit&&f.url&&f.licenseUrl&&f.alterations);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.src))).digest('hex'),f.sha256);}
 assert.equal(figures.find(f=>f.file==='hemostasis.jpg').license,'CC BY 3.0');assert.ok(!fs.existsSync(path.join(root,'media/figures/hemostasis.webp')));
 const script=JSON.parse(fs.readFileSync(path.join(root,'media/animation-source/chapter-film-scripts.json')));assert.ok(!script['33'].transcript.includes('fatigue'));
 for(const f of L.MEDIA_FILMS)assert.equal(fs.readFileSync(path.join(root,f.transcriptSrc),'utf8').trim().replace(/\s+/g,' '),script[String(f.chapters[0])].transcript.replace(/\s+/g,' '));
});
