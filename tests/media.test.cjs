const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../site/nu545/exam3');
const context={window:{}};vm.createContext(context);
for(const file of ['js/data/course.js','js/data/media.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const L=context.window.L;

test('one complete local narrated film per chapter, all course disclosures resolve',()=>{
  assert.equal(L.MEDIA_FILMS.length,7);assert.equal(L.MEDIA_SAMPLE,null);
  for(let ch=21;ch<=27;ch++){
    const films=L.MEDIA_FILMS.filter(f=>f.chapters.includes(ch));assert.equal(films.length,1);
    const f=films[0];assert.equal(f.voice,'AI Voice Generator · Clear');
    for(const field of ['src','poster','captions','transcriptSrc']){
      assert.ok(!f[field].includes('://'));assert.ok(fs.statSync(path.join(root,f[field])).size>100);
    }
    for(const s of f.sources){assert.ok(L.SOURCES[s],s);assert.ok(L.SOURCE_HTML[s],s)}
    const probe=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path.join(root,f.src)]));
    const video=probe.streams.find(s=>s.codec_type==='video'),audio=probe.streams.find(s=>s.codec_type==='audio');
    assert.equal(video.codec_name,'h264');assert.equal(video.width,1280);assert.equal(video.height,720);assert.equal(audio.codec_name,'aac');
    const duration=+probe.format.duration;assert.ok(duration>40&&duration<80);
    assert.equal(f.stages[0].start,0);for(let i=1;i<f.stages.length;i++)assert.ok(f.stages[i].start>f.stages[i-1].start&&f.stages[i].start<duration);
    const vtt=fs.readFileSync(path.join(root,f.captions),'utf8');assert.ok(vtt.startsWith('WEBVTT'));
    const seconds=s=>{const [h,m,sec]=s.split(':').map(Number);return h*3600+m*60+sec};
    let lastEnd=0,count=0;for(const match of vtt.matchAll(/(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})/g)){
      const start=seconds(match[1]),end=seconds(match[2]);assert.ok(start>=lastEnd-.001);assert.ok(end>start&&end<=duration+.08);lastEnd=end;count++;
    }assert.ok(count>=15);
  }
});

test('film addition leaves the editorial bank, forms and persistent namespace unchanged',()=>{
  const previous={window:{}};vm.createContext(previous);
  vm.runInContext(cp.execFileSync('git',['show','HEAD:site/nu545/exam3/js/data/course.js'],{encoding:'utf8'}),previous);
  for(const key of ['ITEMS','CONCEPTS','FORMS','BOSSES','CONTENT_REVISION','BANK_SHA256'])assert.equal(JSON.stringify(L[key]),JSON.stringify(previous.window.L[key]),key);
  const store=fs.readFileSync(path.join(root,'js/core/store.js'),'utf8');assert.ok(store.includes('nu545-exam3-progress-v1'));
});
