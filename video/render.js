const {chromium}=require('playwright'); const fs=require('fs');
const [,, outDir, workers='4'] = process.argv;
(async()=>{ const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const probe=await b.newPage(); await probe.goto('http://localhost:8766/video/index.html?render=1',{waitUntil:'networkidle'}); await probe.evaluate(()=>window.ready);
 const total=await probe.evaluate(()=>Math.round(window.TOTAL*window.FPS)); await probe.close();
 const W=+workers, per=Math.ceil(total/W); const t0=Date.now();
 await Promise.all([...Array(W).keys()].map(async w=>{ const p=await b.newPage({viewport:{width:1280,height:720}});
   await p.goto('http://localhost:8766/video/index.html?render=1',{waitUntil:'networkidle'}); await p.evaluate(()=>window.ready);
   for(let f=w*per; f<Math.min(total,(w+1)*per); f+=12){
     const batch=await p.evaluate(([a,b])=>{const out=[];for(let f=a;f<b;f++){window.renderFrame(f/window.FPS);out.push(document.getElementById('c').toDataURL('image/jpeg',.9).slice(23));}return out;},[f,Math.min(f+12,(w+1)*per,total)]);
     batch.forEach((d,i)=>fs.writeFileSync(`${outDir}/f${String(f+i).padStart(5,'0')}.jpg`,Buffer.from(d,'base64')));
     if(w===0 && f%480===0) console.log('frame',f,'/',per,((Date.now()-t0)/1000).toFixed(0)+'s');
   } }));
 console.log('done',total,'frames',((Date.now()-t0)/1000).toFixed(0)+'s'); await b.close(); })();
