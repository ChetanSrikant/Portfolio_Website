import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
await mkdir('tmp/audit',{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await mkdtemp(tmpdir()+'/portfolio-audit-');
const child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=9241','--user-data-dir='+profile,'--no-first-run','about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;try {
let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://127.0.0.1:9241/json')).json();break;}catch{await sleep(250);}}
ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();let errors=[],failed=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){pending.get(m.id)?.(m.result);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown'||m.method==='Log.entryAdded')errors.push(m.params);if(m.method==='Network.responseReceived'&&m.params.response.status>=400)failed.push({url:m.params.response.url,status:m.params.response.status});if(m.method==='Network.loadingFailed')failed.push(m.params);};
const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
const run=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}))?.result?.value;
await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Network.enable');
await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.audit={cls:0,lcp:0,long:[]};new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)audit.cls+=e.value})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>audit.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>audit.long.push(e.duration))).observe({type:'longtask',buffered:true});`});
const results=[];
if(process.env.AUDIT_EXTRA){
 const extra={};await send('Emulation.setDeviceMetricsOverride',{width:375,height:900,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:4173/'});await sleep(3500);
 extra.ctaHit=await run(`(()=>{const b=document.querySelector('button[class*="primaryAction"]');const r=b.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {button:{x:r.x,y:r.y,w:r.width,h:r.height},hit:e?.outerHTML,covered:!b.contains(e)}})()`);
 await run(`document.querySelector('button[aria-controls="primary-navigation-links"]').click()`);extra.menu=await run(`({expanded:document.querySelector('button[aria-controls]').getAttribute('aria-expanded'),links:getComputedStyle(document.getElementById('primary-navigation-links')).visibility})`);
 await send('Page.navigate',{url:'http://127.0.0.1:4173/projects'});await sleep(3000);await run(`document.querySelector('article[role="button"]').click()`);await sleep(500);extra.projectTabs=[];for(let i=0;i<4;i++){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});extra.projectTabs.push(await run('document.activeElement.textContent.trim()'));}
 extra.repository=await run(`document.querySelector('[role="dialog"] a')?.href`);extra.errors=errors;
 await writeFile('tmp/audit/extra.json',JSON.stringify(extra,null,2));console.log(JSON.stringify(extra));await send('Browser.close');ws.close();child.kill();process.exit(0);
}
if(process.env.AUDIT_DETAIL){
 const detail={};const nav=async route=>{await send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await sleep(3500);};
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await nav('/');
 await run(`document.querySelector('button[class*="primaryAction"]').click()`);await sleep(2000);
 detail.workCTA=await run(`({y:scrollY,visible: [...document.querySelectorAll('h2')].filter(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<innerHeight}).map(e=>e.innerText),navHidden:document.querySelector('nav').getAttribute('aria-hidden')})`);
 await run(`scrollTo({top:0,behavior:'instant'});document.querySelector('button[class*="secondaryAction"]').click()`);await sleep(2000);detail.contactCTA=await run(`({y:scrollY,visible:[...document.querySelectorAll('h2')].filter(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<innerHeight}).map(e=>e.innerText),text:document.elementFromPoint(600,450)?.innerText?.slice(0,250)})`);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav('/beyond#right-now');detail.reducedBeyond=await run(`({stacking:document.querySelector('[data-stacking]').dataset.stacking,carousel:document.querySelector('[data-animated]').dataset.animated})`);
 await nav('/');await run(`document.querySelector('button[class*="primaryAction"]').click()`);detail.reducedScrollStart=await run('scrollY');await sleep(150);detail.reducedScroll150ms=await run('scrollY');await sleep(1500);detail.reducedScrollEnd=await run('scrollY');
 await nav('/work');await run(`document.querySelector('button[class*="evidenceCard"]').click()`);await sleep(600);detail.modalTabs=[];
 for(let i=0;i<6;i++){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});detail.modalTabs.push(await run(`({text:document.activeElement.innerText||document.activeElement.getAttribute('aria-label'),inside:!!document.activeElement.closest('[role="dialog"]'),outline:getComputedStyle(document.activeElement).outline})`));}
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(400);detail.escapeCloses=await run(`!document.querySelector('[role="dialog"]')`);
 await nav('/missing-page');detail.moves=[];for(const label of ['Beam Saber','Shield','Rifle','Boomerang','Lifter','Hold Pose','Reset view']){detail.moves.push(await run(`(()=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!b)return {label:${JSON.stringify(label)},found:false};b.focus();return {label:${JSON.stringify(label)},disabled:b.disabled,outline:getComputedStyle(b).outline}})()`));await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(400);}
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await nav('/');await run(`document.getElementById('gundam-wrapper').scrollIntoView({behavior:'instant'})`);await sleep(4000);
 detail.frames=await run(`new Promise(resolve=>{const a=[];let last=performance.now(),start=last;function f(t){a.push(t-last);last=t;if(t-start<3000)requestAnimationFrame(f);else resolve({count:a.length,over33:a.filter(x=>x>33.4).length,max:Math.max(...a),mean:a.reduce((x,y)=>x+y,0)/a.length})}requestAnimationFrame(f)})`);
 const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('tmp/audit/gundam-stage.png',Buffer.from(shot.data,'base64'));
 detail.errors=errors;detail.failed=failed;await writeFile('tmp/audit/interactions.json',JSON.stringify(detail,null,2));console.log(JSON.stringify(detail));await send('Browser.close');ws.close();child.kill();process.exit(0);
}
for(const route of ['/','/about','/work','/projects','/beyond','/credentials','/missing-page']){
 errors=[];failed=[];await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://127.0.0.1:4173'+route});await sleep(4500);
 if(!await run('Boolean(document.querySelector("main"))'))throw new Error('Portfolio main content not loaded: '+route);
 const entry={route,data:await run(`({title:document.title,text:document.body.innerText.slice(0,14000),audit:window.audit,links:[...document.querySelectorAll('a')].map(a=>({text:a.innerText||a.getAttribute('aria-label'),href:a.getAttribute('href')})),headings:[...document.querySelectorAll('h1,h2')].map(e=>({text:e.innerText,y:e.getBoundingClientRect().top+scrollY})),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,size:e.encodedBodySize,duration:e.duration})),missingAlt:[...document.images].filter(e=>!e.hasAttribute('alt')).map(e=>e.src)})`),sizes:[]};
 for(const width of [320,375,768,1024,1440,2560]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await sleep(250);
 entry.sizes.push(await run(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(e).position!=='absolute'}).slice(0,8).map(e=>({tag:e.tagName,class:e.className,text:e.innerText?.slice(0,70)}))})`));
 if(width===375||width===1440){await run('scrollTo({top:0,behavior:"instant"})');await sleep(400);const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile('tmp/audit/'+(route.slice(1)||'home')+'-'+width+'.png',Buffer.from(shot.data,'base64'));}
 }
 await run(`scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`);await sleep(1500);
 entry.bottom=await run(`({broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),height:document.documentElement.scrollHeight,buttons:[...document.querySelectorAll('button')].map(e=>({text:e.innerText,label:e.getAttribute('aria-label'),pressed:e.getAttribute('aria-pressed')}))})`);
 entry.errors=errors;entry.failed=failed;results.push(entry);console.log(route,JSON.stringify({sizes:entry.sizes.map(s=>[s.width,s.scrollWidth]),errors:errors.length,failed:failed.length}));
}
await writeFile('tmp/audit/results.json',JSON.stringify(results,null,2));
await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await send('Emulation.setCPUThrottlingRate',{rate:4});
await send('Page.navigate',{url:'http://127.0.0.1:4173/'});await sleep(20000);
await writeFile('tmp/audit/throttled.json',JSON.stringify(await run(`({audit:window.audit,text:document.body.innerText.slice(0,3000),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,size:e.encodedBodySize,duration:e.duration}))})`),null,2));
console.log('throttled complete');await send('Browser.close');
}finally{ws?.close();child.kill();}
