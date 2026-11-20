/* ######## loadout.js ######## */
/* ===================== loadout.js ===================== */
/* Loadout editor with live weapon inspection and cached renders for the weapon catalog. */
var LSL={cur:0,sel:'p',view:'weapons',slots:[]};
try{LSL.slots=JSON.parse(localStorage.getItem('sd-slots'))||[];LSL.cur=+localStorage.getItem('sd-slot')||0}catch(e){}
var CLS={AR:'ASSAULT RIFLE',MVR:'ASSAULT RIFLE',TRB:'ASSAULT RIFLE',TUR:'ASSAULT RIFLE',SMG:'SUBMACHINE GUN',VMP:'SUBMACHINE GUN',BR:'BATTLE RIFLE',SG:'SHOTGUN',MG:'PISTOL',MP:'MACHINE PISTOL',CT:'PISTOL',CY:'SHOTGUN',SN:'SNIPER RIFLE',RL:'LAUNCHER',RG:'SPECIAL'};
var WDS={AR:'Full-auto rifle. Reliable all-rounder with a steady rate of fire.',TRB:'Three-round burst assault rifle. Tight, accurate bursts; two bursts kill. Unlocks at level 22.',TUR:'Fast firing automatic rifle with a turbine core. Light and mobile, best at medium range. Unlocks at level 26.',MVR:'Slow firing, hard hitting assault rifle. Three body shots kill. Excellent accuracy and range, heavy kick.',SMG:'Light submachine gun. Very fast firing, best up close.',BR:'Semi-auto battle rifle. Heavy hits at range.',SG:'Pump shotgun. Devastating at close range.',MG:'Six-shot magnum revolver. Slow, powerful, accurate.',MP:'Fully automatic machine pistol. Extreme close-range volume.'};
CLS.CY='LIGHT MACHINE GUN';CLS.RG='SPECIAL';CLS.MG='REVOLVER';
Object.assign(CLS,{VA:'ASSAULT RIFLE',BP:'PUMP SHOTGUN',KTS:'TACTICAL SHOTGUN',RD:'SUBMACHINE GUN',HC:'HEAVY PISTOL',OH:'MARKSMAN RIFLE',TEA:'POWER WEAPON',SW:'ASSAULT RIFLE',LT:'SUBMACHINE GUN',PD:'MARKSMAN RIFLE'});
Object.assign(WDS,{
 TEA:'Hold fire to pour a scalding stream. Vent after overheating. Effective within 38 metres in Multiplayer.',
 SW:'A compact bullpup with rear-fed magazines and low horizontal recoil. Unlocks at level 21.',
 LT:'A fast submachine gun with a top-mounted cassette. Excels in close quarters. Unlocks at level 28.',
 PD:'A deliberate semi-auto rifle with narrow spread and a short nine-round magazine. Unlocks at level 38.',
 VA:'Hard-hitting automatic rifle with a 30-round magazine. Best in short bursts at mid-range.',
 BP:'Deliberate pump action with a tight pattern and five shells. The slow follow-up rewards a clean first shot.',
 KTS:'Fast semi-auto shotgun with eight shells and a wide pattern for close quarters.',
 RD:'A compact automatic with a 48-round drum. Strong in tight spaces and slow to reload.',
 HC:'Seven-shot, high-recoil sidearm that rewards precise shots.',
 OH:'Single-shot bolt action with open sights. Hand-load one round after each shot.'
});
Object.assign(WDS,{VMP:'Ultra-fast submachine gun with a huge magazine. Low damage per bullet, shreds at close range.',CY:'60 round light machine gun with a drum magazine. Heavy suppressive fire, slow reload. Unlocks at level 34.',CT:'Classic .45 pistol. Reliable, accurate, quick to draw. Unlocks at level 12.',RG:'Experimental energy pistol. Explosive bolts with a splash, two shots kill. Unlocks at level 30.'});
/* ---------- weapon preview renderer: one extra small WebGL context, images cached as data URLs ---------- */
var WIMG={};var wRen=null;
function previewRenderer(width=640,height=300){
 if(!wRen){wRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});wRen.setSize(640,300,false);wRen.setPixelRatio(1);wRen.setClearColor(0,0);wRen.outputEncoding=THREE.sRGBEncoding;wRen.toneMapping=THREE.ACESFilmicToneMapping;wRen.toneMappingExposure=.84;wRen.shadowMap.type=THREE.PCFSoftShadowMap}
 if(wRen.domElement.width!==width||wRen.domElement.height!==height)wRen.setSize(width,height,false);
 return wRen;
}
function previewGun(key,attachments,camo){
 const model=buildGun(key,camo);attApply(model,key,attachments,1);
 model.traverse(o=>{if(o.userData.laserBeam)o.visible=false});
 return model;
}
function previewBounds(model){
 model.updateWorldMatrix(true,true);
 const bounds=new THREE.Box3(),part=new THREE.Box3();
 model.traverseVisible(o=>{if(o.isMesh){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bounds.union(part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld))}});
 return bounds;
}
function wImg(k){const ak=k+'|'+attsFor(k).join(',');if(WIMG[ak]!=null)return WIMG[ak];try{previewRenderer();
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x4a5566,1.0));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(4,5,2);sc.add(dl);const dl2=new THREE.DirectionalLight(0x99aacc,.4);dl2.position.set(-4,2,-3);sc.add(dl2);
 const g=previewGun(k,attsFor(k));sc.add(g);const bb=previewBounds(g),ct=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()),hw=Math.max(sz.z*.56,sz.y*1.15),hh=hw*300/640,cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,.01,30);
 cam.position.set(ct.x+6,ct.y,ct.z);cam.lookAt(ct.x,ct.y,ct.z);wRen.render(sc,cam);return WIMG[ak]=wRen.domElement.toDataURL('image/png')}catch(e){return WIMG[ak]=''}}
/* ---------- 3D previews of the non-gun items: the same models the game uses, rendered once and cached ---------- */
var OIMG={};
function objImg(id,fn){if(OIMG[id]!=null)return OIMG[id];try{previewRenderer();
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x4a5566,1.0));const d1=new THREE.DirectionalLight(0xffffff,.95);d1.position.set(3,5,4);sc.add(d1);const d2=new THREE.DirectionalLight(0x99aacc,.45);d2.position.set(-4,1,-3);sc.add(d2);
 const g=fn();sc.add(g);const bb=new THREE.Box3().setFromObject(g),ct=bb.getCenter(new THREE.Vector3()),sp=bb.getBoundingSphere(new THREE.Sphere()),fov=24,cam=new THREE.PerspectiveCamera(fov,640/300,.01,40),dist=sp.radius/Math.sin(THREE.MathUtils.degToRad(fov/2))*.8;
 cam.position.copy(ct).addScaledVector(new THREE.Vector3(.55,.35,1).normalize(),dist);cam.lookAt(ct);wRen.render(sc,cam);return OIMG[id]=wRen.domElement.toDataURL('image/png')}catch(e){return OIMG[id]=''}}
function objBuild(id){const M=c=>new THREE.MeshLambertMaterial({color:c}),g=new THREE.Group(),
 cy=(r,h,x,y,z,m,rt)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rt==null?r:rt,r,h,16),m);e.position.set(x,y,z);g.add(e);return e},
 sp=(r,x,y,z,m,sx,sy,sz)=>{const e=new THREE.Mesh(sg,m);e.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));e.position.set(x,y,z);g.add(e);return e},
 tr=(R,t,x,y,z,m,rx)=>{const e=new THREE.Mesh(new THREE.TorusGeometry(R,t,8,24),m);e.position.set(x,y,z);e.rotation.x=rx==null?Math.PI/2:rx;g.add(e);return e},
 bx=(w,h,d,x,y,z,m,rz)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);if(rz)e.rotation.z=rz;g.add(e);return e};
 if(id=='katana'){const k=buildKatana();k.visible=true;const w=new THREE.Group();w.add(k);w.rotation.z=-Math.PI/2.5;return w}
 if(id=='fists'){const gl=M(0x151515),gl2=M(0x2a2c32),sl=M(0x3d6ad6);for(const s of[-1,1]){const h=mkFpHand(s,gl,gl2);h.scale.setScalar(2.6);h.rotation.set(Math.PI*.5,0,s*.15);h.position.set(s*.16,0,0);g.add(h);cy(.045,.3,s*.16,-.02,-.2,sl).rotation.x=Math.PI/2.4}return g}
 if(id=='nfists'){for(const s of[-1,1]){const h=mkNitroFist(s);h.scale.setScalar(2.2);h.rotation.set(Math.PI*.5,0,s*.15);h.position.set(s*.2,0,0);g.add(h)}return g}
 if(id=='frag'){const o=M(0x4a5a30),d=M(0x2a3320),st=M(0x8a9098);sp(.04,0,0,0,o,1,1.25,1);for(let i=-3;i<=3;i++){tr(.04*Math.sqrt(Math.max(.05,1-Math.pow(i/3.4,2))),.003,0,i*.0125,0,d)}for(let i=0;i<8;i++){const a=i*.785;bx(.004,.09,.004,Math.cos(a)*.0405,0,Math.sin(a)*.0405,d)}cy(.011,.03,0,.054,0,st);bx(.012,.006,.05,.012,.066,0,st);tr(.012,.0022,.03,.06,0,st,0);return g}
 if(id=='impact'){const o=M(0x555a60),r=M(0xc0392b);sp(.04,0,0,0,o,1,1.1,1);tr(.04,.006,0,.003,0,r);tr(.036,.004,0,.022,0,r);const c=new THREE.Mesh(new THREE.ConeGeometry(.012,.03,12),M(0x2a2a2e));c.position.y=.054;g.add(c);cy(.006,.02,0,.07,0,M(0xe8e8e0));return g}
 if(id=='flash'){const o=M(0xb8bcc2),d=M(0x2a2c30),st=M(0x8a9098);cy(.028,.12,0,0,0,o);cy(.03,.016,0,.062,0,d);cy(.03,.016,0,-.062,0,d);tr(.029,.003,0,.02,0,d);tr(.029,.003,0,-.02,0,d);bx(.012,.006,.05,.012,.076,0,st);tr(.012,.0022,.03,.07,0,st,0);cy(.01,.016,0,.07,0,st);return g}
 if(id=='adren'){const gl=new THREE.MeshBasicMaterial({color:0x3fd0c9}),b=M(0x2a3a44),st=M(0xcfd6de);cy(.018,.12,0,0,0,b);cy(.014,.1,0,.0,.0,gl);cy(.02,.02,0,.07,0,st);cy(.007,.04,0,.095,0,st);cy(.003,.05,0,-.1,0,st,.001);const n=new THREE.Mesh(new THREE.ConeGeometry(.003,.04,8),st);n.position.y=-.115;n.rotation.x=Math.PI;g.add(n);cy(.022,.012,0,-.066,0,M(0x1b2830));tr(.019,.003,0,.03,0,st);g.rotation.z=Math.PI/3;return g}
 return g}
var oTag=id=>{const u=objImg(id,()=>objBuild(id));return u?`<img src="${u}" alt="">`:''};
var IMG_M={get Katana(){return oTag('katana')},get Fists(){return oTag('fists')},get 'Nitrogen Fists'(){return oTag('nfists')}},IMG_G={get Frag(){return oTag('frag')},get Impact(){return oTag('impact')}},IMG_T={toString:()=>oTag('flash')};
function loadoutSlot(id,label,summary=''){
 const selected=LSL.sel===id;
 return `<button type="button" class="ls ${selected?'sel':''}" data-slot="${id}" aria-pressed="${selected}"><span>${label}</span>${summary?`<b>${summary}</b>`:''}</button>`;
}
function statBar(n,v){return `<div class="sb"><span>${n}</span><i><em style="width:${Math.max(4,Math.min(100,v*100))}%"></em></i></div>`}
function attChips(a){return Object.keys(A).filter(k=>attachmentFits(a==='pa'?L.p:L.s,k)).filter(k=>typeof ATT_ONLY=='undefined'||!ATT_ONLY[k]||(a=='pa'&&L.p==ATT_ONLY[k])).map(k=>chip(a,k,k,A[k].t,L[a].includes(k))).join('')}
function weaponCard(k,slot){
 const active=L[slot]===k,locked=!unlocked(k),className=CLS[k]||'Weapon';
 return `<button type="button" class="c arsenal-card ${active?'on':''} ${locked?'lk':''}" data-a="${slot}" data-v="${k}" aria-pressed="${active}">
  <span class="arsenal-model"><img data-model="${k}" alt=""></span>
  <span class="arsenal-card-text"><b>${W[k].n}</b><small>${locked?'Unlocks at level '+UNL[k]+(prof.tok>0?' · use token':''):className}</small></span>
  ${active?'<span class="arsenal-equipped">Equipped</span>':''}
 </button>`;
}
function weaponPicker(slot){
 const k=L[slot],shown=k==='SMG'&&slot==='p'&&L.pa.includes('Dual Wield')?'DS':k;
 const a=slot==='p'?'pa':'sa',weapon=shown&&W[shown],effective=k&&eff(shown,L[a].filter(x=>x!=='Dual Wield'));
 return `${weapon?`<section class="arsenal-feature" aria-label="Equipped weapon">
  <div class="arsenal-stage">
   <canvas data-loadout-preview="${shown}" width="640" height="300" role="img" aria-label="3D preview of ${weapon.n}"></canvas>
   <div class="arsenal-view" aria-label="Preview controls">
    <button type="button" data-rotate="-1" aria-label="Rotate left">‹</button>
    <button type="button" data-preview-view="model" aria-pressed="true">Model</button>
    ${shown==='DS'?'':'<button type="button" data-preview-view="sight" aria-pressed="false">Sights</button>'}
    <button type="button" data-rotate="1" aria-label="Rotate right">›</button>
   </div>
  </div>
  <div class="arsenal-details">
   <div class="arsenal-class">${CLS[shown]||'SMG'}</div>
   <h3>${weapon.n}</h3>
   <p>${WDS[shown]||WDS[k]||desc(weapon)}</p>
   <div class="arsenal-stats"><div><span>Damage</span><b>${Math.round(effective.d)}${effective.pel>1?' × '+effective.pel:''}</b></div><div><span>Fire rate</span><b>${Math.round(60/effective.r)} <small>RPM</small></b></div><div><span>Magazine</span><b>${effective.m}</b></div></div>
   <div class="arsenal-actions"><button type="button" data-cust="${slot}">Customize</button>${slot==='s'?`<button type="button" class="c arsenal-remove" data-a="s" data-v="${k}">Remove</button>`:''}</div>
  </div>
 </section>`:''}
 <section class="arsenal-catalog"><div class="segmented" aria-label="Weapon options">
  <button data-arsenal-tab="weapons" aria-pressed="${LSL.view==='weapons'}">Browse ${slot==='p'?'primary':'secondary'} weapons</button>
  ${weapon?`<button data-arsenal-tab="attachments" aria-pressed="${LSL.view==='attachments'}">Attachments <small>${L[a].length} / ${LIM[a]}</small></button>`:''}
 </div>${weapon&&LSL.view==='attachments'?`<div class="row arsenal-attachments">${attChips(a)}</div>`:
   `<div class="arsenal-grid">${(slot==='p'?PRI:SEC).map(x=>weaponCard(x,slot)).join('')}</div>`}</section>`;
}
function detailHtml(){
 const s=LSL.sel;
 if(s==='p'||s==='s')return weaponPicker(s);
 if(s=='me'){const m=MEL[melName()];return `<div class="dh"><h3>${m.n}</h3></div><p class="dd">${m.desc}</p><div class="dimg meleei">${IMG_M[melName()]}</div><div class="stats">${statBar('Damage',m.d/100)+statBar('Reach',m.reach/3.2)+statBar('Speed',1-m.cd+.45)}</div>
  <p class="dd">Tap <kbd>V</kbd> for a quick strike with your weapon. Hold <kbd>V</kbd> to draw this melee weapon and hit far harder.</p><h4>Melee weapons</h4><div class="row">${Object.keys(MEL).map(k=>chip('me',MEL[k].n,MEL[k].n,MEL[k].desc,melName()==k)).join('')}</div>`}
 if(s=='f'){
  const item=typeof eqSlot==='function'?eqSlot(1):null;
  return `<div class="dh"><h3>Extra equipment</h3></div><p class="dd">${item?.n?item.n+' · press <kbd>X</kbd> to use it.':'This slot is available with Danger Zone or Strategist.'}</p>`;
 }
 if(s=='t'){const name=typeof tacName==='function'?tacName(1):'Flashbang';return `<div class="dh"><h3>${name||'None'}</h3></div><p class="dd">${name?'Press <kbd>Q</kbd> to use your tactical equipment.':'No tactical equipment equipped.'}</p><div class="dimg meleei">${name==='Flashbang'?IMG_T:name?oTag(name):''}</div>`}
 if(s=='l')return `<div class="dh"><h3>${L.g||'None'}</h3></div><p class="dd">${L.g?GR[L.g]?.t||'':'No grenade equipped.'}</p><div class="dimg meleei">${L.g?IMG_G[L.g]||oTag(L.g):''}</div><h4>Lethal equipment</h4><div class="row">${Object.keys(GR).map(k=>chip('g',k,k,GR[k].t,L.g==k)).join('')}</div>`;
 if(s=='q')return `<div class="dh"><h3>Presets</h3></div><div class="row">${Object.keys(PRE).map(k=>chip('preset',k,k,PD[k],0)).join('')}</div>`;
 if(s==='k')return `<div class="dh"><h3>Perks</h3></div><p class="dd">${L.pk.length} of 3 equipped</p><div class="row">${Object.keys(K).map(k=>chip('pk',k,k,K[k].t||K[k],L.pk.includes(k))).join('')}</div>`;
 return '';
}

const loadoutPreview={key:'',scene:null,model:null,cam:null,center:null,radius:1,angle:.28,pitch:.20,view:'model'};
let loadoutThumbObserver,loadoutFrame=0;
function loadoutPaint(){
 loadoutFrame=0;
 const canvas=$('#p-load.on [data-loadout-preview]');if(!canvas)return;
 const key=canvas.dataset.loadoutPreview,camo=passFinish(key)||prof.camo[key]||'',attachments=key==='DS'?[]:attsFor(key);
 const modelKey=[key,camo,attachments.join(',')].join('|'),p=loadoutPreview;
 if(!p.scene){
  p.scene=new THREE.Scene();
  p.scene.add(new THREE.HemisphereLight(0xffeed6,0x4a535c,.70));
  const light=new THREE.DirectionalLight(0xffeedc,1.13),edge=new THREE.DirectionalLight(0xbddef5,.9);
  light.position.set(3,5,2);edge.position.set(-3,1,-4);p.scene.add(light,edge);
  p.cam=new THREE.PerspectiveCamera(34,640/300,.014,20);
 }
 try{
  if(p.key!==modelKey){
   if(p.model)p.scene.remove(p.model);
   p.model=previewGun(key,attachments,camo?camoRm(key,camo):undefined);p.scene.add(p.model);
   const sphere=previewBounds(p.model).getBoundingSphere(new THREE.Sphere());
   p.center=sphere.center;p.radius=sphere.radius;p.key=modelKey;
   p.angle=.24;p.pitch=.25;p.view='model';
  }
  const cam=p.cam,s=p.model.userData.sight;
  if(p.view==='sight'&&s){
   const x=s.xt||0;cam.position.set(x,s.yt,s.zr-.24);cam.lookAt(x,s.yt,s.zr+.6);
  }else{
   const distance=p.radius*(1.77+.75*Math.abs(Math.sin(p.pitch)))+.065;
   cam.position.copy(p.center).add(V(Math.cos(p.angle)*Math.cos(p.pitch),Math.sin(p.pitch),Math.sin(p.angle)*Math.cos(p.pitch)).multiplyScalar(distance));
   cam.lookAt(p.center);
  }
  previewRenderer().render(p.scene,cam);
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,640,300);ctx.drawImage(wRen.domElement,0,0,640,300);
  for(const b of canvas.parentElement.querySelectorAll('[data-preview-view]'))b.setAttribute('aria-pressed',String(b.dataset.previewView===p.view));
 }catch(e){
  const img=wImg(key);if(img)canvas.style.backgroundImage='url('+img+')';
 }
}
function queueLoadoutPaint(){if(!loadoutFrame)loadoutFrame=requestAnimationFrame(loadoutPaint)}
function prepareLoadoutModels(){
 const pane=$('#p-load.on');if(!pane||!pane.closest('#menu')?.getClientRects().length)return;
 loadoutThumbObserver?.disconnect();
 const pictures=[...pane.querySelectorAll('img[data-model]:not([src])')];
 const queue=[],drawNext=()=>{
  if(!pane.classList.contains('on')||!pane.getClientRects().length)return;
  const img=queue.shift();if(!img)return;
  if(img.isConnected){const url=wImg(img.dataset.model);if(url)img.src=url}
  if(queue.length)requestAnimationFrame(drawNext);
 };
 if(typeof IntersectionObserver==='function'){
  loadoutThumbObserver=new IntersectionObserver(entries=>{
   const started=queue.length>0;
   for(const e of entries)if(e.isIntersecting){loadoutThumbObserver.unobserve(e.target);queue.push(e.target)}
   if(!started&&queue.length)requestAnimationFrame(drawNext);
  },{root:pane,rootMargin:'85px'});
  for(const img of pictures)loadoutThumbObserver.observe(img);
 }else{queue.push(...pictures);if(queue.length)requestAnimationFrame(drawNext)}
 const canvas=pane.querySelector('[data-loadout-preview]');
 if(canvas&&!canvas.dataset.interactive){
  canvas.dataset.interactive='1';
  let drag;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{
   if(!drag||drag.id!==e.pointerId)return;
   const p=loadoutPreview;p.view='model';p.angle+=(e.clientX-drag.x)*.012;p.pitch=cl(p.pitch+(e.clientY-drag.y)*.010,-1.25,1.25);
   drag.x=e.clientX;drag.y=e.clientY;queueLoadoutPaint();
  });
  canvas.addEventListener('lostpointercapture',()=>{drag=null});
 }
 if(canvas)queueLoadoutPaint();
}

function ldRender(){
 const e=$('#ld');if(!e)return;sanitizeMe();
 const prev=document.activeElement,focus=e.contains(prev)&&prev.tagName==='BUTTON'?['slot','lt','a','previewView','rotate','cust','arsenalTab'].find(k=>prev.dataset[k]!=null):null;
 const pv=focus&&prev.dataset[focus],v=focus==='a'?prev.dataset.v:null;
 const tabs=Array.from({length:6},(_,i)=>`<button type="button" class="lt ${LSL.cur===i?'on':''}" data-lt="${i}" aria-pressed="${LSL.cur===i}" aria-label="Loadout ${i+1}">${String(i+1).padStart(2,'0')}</button>`).join('');
 const primary=L.p==='SMG'&&L.pa.includes('Dual Wield')?'DS':L.p;
 const tabsData=[['p','Primary',W[primary]?.n||'None'],['s','Secondary',W[L.s]?.n||'None'],['me','Melee',MEL[melName()].n],
  ['l','Lethal',L.g||'None'],['t','Tactical'],['f','Extra gear'],['k','Perks',L.pk.length+' / 3'],['q','Presets']];
 if(typeof skSel==='function')tabsData.push(['ks','Killstreaks']);
 e.innerHTML=`<div class="arsenal">
  <header class="arsenal-header panel-head">
   <div><h2>Loadout</h2><div class="lo-tabs" aria-label="Saved loadouts">${tabs}</div></div>
   <div class="arsenal-budget"><span>Loadout points</span><strong id="loadoutPoints" role="status">${cost()} <small>/ 10</small></strong><meter min="0" max="10" value="${cost()}" aria-label="Loadout points used"></meter></div>
  </header>
  <div class="arsenal-slots" aria-label="Loadout slots">${tabsData.map(row=>loadoutSlot(...row)).join('')}</div>
  <div class="arsenal-content ${LSL.sel==='p'||LSL.sel==='s'?'':'arsenal-equipment'}">${detailHtml()}</div>
 </div>`;
 if(focus){
  const next=[...e.querySelectorAll('button')].find(b=>b.dataset[focus]===pv&&(focus!=='a'||b.dataset.v===v));
  next?.focus({preventScroll:true});
 }
 prepareLoadoutModels();
}
function sanitizeMe(){if(!MEL[L.me])L.me='Katana'}
function slotStore(){try{LSL.slots[LSL.cur]=Object.assign(LSL.slots[LSL.cur]||{},{L:JSON.parse(JSON.stringify(menuLoadoutSnapshot||L))});localStorage.setItem('sd-slots',JSON.stringify(LSL.slots));localStorage.setItem('sd-slot',LSL.cur)}catch(e){}}
/* every redraw of the loadout also refreshes the screen and saves into the active slot */
{const _ui=ui;ui=function(){sanitizeMe();_ui();ldRender();slotStore()}}
document.addEventListener('click',e=>{
 const m=e.target.closest('.c[data-a="me"]');if(m){e.stopImmediatePropagation();L.me=m.dataset.v;ui();return}
 const t=e.target.closest('.lt');if(t){const i=+t.dataset.lt;if(i==LSL.cur)return;slotStore();LSL.cur=i;const s=LSL.slots[i];if(s&&s.L)L=Object.assign({p:'AR',s:null,pa:[],sa:[],g:'Frag',pk:[],me:'Katana'},JSON.parse(JSON.stringify(s.L)));try{sanitize()}catch(er){}ui();return}
 if(e.target.closest('#nav [data-p="load"]')){requestAnimationFrame(()=>{if($('#p-load.on'))ldRender()});return}
 const stage=e.target.closest('.arsenal-view button');
 if(stage){
  if(stage.dataset.rotate){loadoutPreview.angle+=Number(stage.dataset.rotate)*Math.PI/6;loadoutPreview.view='model'}
  else loadoutPreview.view=stage.dataset.previewView;
  queueLoadoutPaint();return;
 }
 const view=e.target.closest('[data-arsenal-tab]');
 if(view){LSL.view=view.dataset.arsenalTab;ldRender();$('#ld [data-arsenal-tab="'+LSL.view+'"]').focus({preventScroll:true});return}
 const b=e.target.closest('.ls');if(b&&b.dataset.slot!=='ks'){LSL.sel=b.dataset.slot;LSL.view='weapons';ldRender()}},true);
/* a saved loadout that predates the melee slot gets the katana */
try{sanitizeMe()}catch(e){}

ldRender();
;
/* ######## customize.js ######## */
/* ===================== customize.js ===================== */
/* ---------- Customize weapon: replaces the old Weapon mastery menu. Opened with the "Customize weapon" button in the loadout screen (or the Camos button in the Zombies menu).
   Layout like the reference: crumb and CAMOS title top left, CHALLENGES / WEAPON PRESTIGE tabs on top, a big preview of the weapon with the selected camo in the middle (cycle the
   view with Preview weapon: side, three quarter, top, front), the camo name, lock state and requirement with progress on the right, and rows of camo tiles at the bottom grouped into
   Military / Special / Mastery (Multiplayer) or Undead / Special / Mastery (Zombies) with a Multiplayer / Zombies switch. Every camo, from either track, works in both modes. ---------- */
var CU={k:'AR',tab:'ch',track:'mp',sel:null,view:0,img:{},tiles:{}};
var CU_VIEWS=[['SIDE',[1,.06,0]],['THREE QUARTER',[.75,.5,.85]],['TOP',[.02,1,.06]],['FRONT',[.05,.12,1]],['REAR',[-.05,.18,-1]],['UNDERSIDE',[.5,-.9,.3]]];
var cuRen=null;
function cuPreview(k,cn,view){const key=k+'|'+(cn||'')+'|'+view+'|'+attsFor(k).join(',')+'|'+(typeof gfxQ!='undefined'?1:0);if(CU.img[key]!=null)return CU.img[key];
 try{if(!cuRen){cuRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});cuRen.setSize(1100,460,false);cuRen.setPixelRatio(1);cuRen.setClearColor(0,0)}
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x3a4a5e,.95));const d1=new THREE.DirectionalLight(0xffffff,1);d1.position.set(4,6,3);sc.add(d1);const d2=new THREE.DirectionalLight(0x88aaff,.55);d2.position.set(-4,1,-4);sc.add(d2);
  const rm=cn?camoRm(k,cn):undefined,g=buildGun(k,rm);try{attApply(g,k,attsFor(k),1)}catch(e){}sc.add(g);const bb=new THREE.Box3().setFromObject(g),ct=bb.getCenter(new THREE.Vector3()),sp=bb.getBoundingSphere(new THREE.Sphere()),fov=24,
   cam=new THREE.PerspectiveCamera(fov,1100/460,.05,60),dist=sp.radius/Math.sin(THREE.MathUtils.degToRad(fov/2))*.78,dv=new THREE.Vector3(...CU_VIEWS[view][1]).normalize();
  /* the camera looks along -x for the side view so the muzzle points left, like the reference */
  cam.position.copy(ct).addScaledVector(dv,dist);cam.up.set(0,view==2?0:1,view==2?-1:0);cam.lookAt(ct);cuRen.render(sc,cam);return CU.img[key]=cuRen.domElement.toDataURL('image/png')}catch(e){return CU.img[key]=''}}
function cuTile(k,c){const key=c.n+(c.anim?'a':'');if(c.anim)return null;if(!CU.tiles[c.n]){try{const t=tx[c.n]||(tx[c.n]=camoTex(c.c,c.s));CU.tiles[c.n]=t.image.toDataURL('image/png')}catch(e){CU.tiles[c.n]=''}}return CU.tiles[c.n]}
var cuNeed=(k,c,z)=>{const w=wd(k),m=/^(\d+)/.exec(c.rq||'');if(c.pr)return[w.p,+(c.rq.match(/\d+/)||[1])[0]];if(c.rq&&/zombie kills$/.test(c.rq)&&m)return[w.z||0,+m[1]];if(c.rq&&/ kills$/.test(c.rq)&&m)return[w.k,+m[1]];if(/^reach round/.test(c.rq||''))return[prof.zbest||0,+c.rq.match(/\d+/)[0]];return[c.ok?1:0,1]};
function cuList(){const k=CU.k,z=CU.track=='zm',L=z?zcamos(k):camos(k),n=L.length;return{all:L,groups:z?[['UNDEAD',L.slice(0,6)],['SPECIAL',L.slice(6,9)],['MASTERY',L.slice(9)]]:[['MILITARY',L.slice(0,6)],['SPECIAL',L.slice(6,9)],['MASTERY',L.slice(9)]]}}
function custOpen(k,track){CU.k=W[k]?k:'AR';if(track)CU.track=track;CU.tab='ch';CU.sel=prof.camo[CU.k]||null;CU.view=0;showMenuPanel('cust');custRender();$('#p-cust h2')?.focus({preventScroll:true})}
function custBack(){openMenuPanel(CU.back||'load')}
function custRender(){const e=$('#p-cust');if(!e)return;const k=CU.k,w=wd(k),{all,groups}=cuList(),eq=prof.camo[k]||'',cur=CU.sel&&all.find(c=>c.n==CU.sel)||null,tr=prof.trk;
 const nameTxt=cur?cur.n:eq&&all.some(c=>c.n==eq)?eq:'DEFAULT';let info='';
 if(CU.tab=='ch'){if(cur){const[a,b]=cuNeed(k,cur),ok=cur.ok;info=`<h3>${cur.n.toUpperCase()}</h3><p class="st ${ok?'ok':'lk'}">${ok?'UNLOCKED':'LOCKED'}</p><p class="rq">${ok?(eq==cur.n?'Equipped on this weapon.':'Select it to equip it on this weapon.'):'Requirement: '+cur.rq}</p>${ok?'':`<div class="pg"><i style="width:${Math.min(100,a/b*100)}%"></i><span>${Math.min(a,b)} / ${b}</span></div>`}`}
  else info=`<h3>DEFAULT</h3><p class="st ok">${eq?'':'EQUIPPED'}</p><p class="rq">The weapon's standard finish.</p>`}
 else info=`<h3>WEAPON PRESTIGE</h3><p class="st ${w.p?'ok':'lk'}">PRESTIGE ${w.p} / 3</p><p class="rq">Reach weapon level 20 (${wlv(k)} / 20), then prestige it to earn Ember, Frost and Aurora.</p>${wlv(k)==20&&w.p<3?'<button class="big" data-cupr="1">Prestige weapon</button>':''}`;
 const tile=(c)=>{const img=cuTile(k,c),sel=cur&&cur.n==c.n,isEq=eq==c.n,t=tr==k+':'+c.n;return `<button class="ct ${sel?'sel':''} ${c.ok?'':'lk'} ${c.anim?'an':''}" data-cut="${c.n}" title="${c.n}${c.ok?'':' (locked)'}"><span class="sw" style="${img?`background-image:url(${img})`:`--c:${c.c}`}"></span>${c.ok?'':'<u>🔒</u>'}${isEq?'<em>EQUIPPED</em>':''}${t?'<em class="tk">TRACKED</em>':''}</button>`};
 const nextLocked=all.find(c=>!c.ok),tc=all.filter(c=>c.ok).length;
 e.innerHTML=`<div class="cu"><div class="cu-top"><div class="cu-crumb"><button class="text-button back-link" data-cuact="back">Back to ${app==='zm'?'Play':'Loadout'}</button><h2 tabindex="-1">Weapon camos</h2></div>
  <div class="cu-tabs"><button data-cutab="ch" class="${CU.tab=='ch'?'on':''}">CHALLENGES</button><button data-cutab="pr" class="${CU.tab=='pr'?'on':''}">WEAPON PRESTIGE</button></div>
  <div class="cu-wsel"><button data-cuw="-1">‹</button><span>${nm(k)} <i>Lv ${wlv(k)}${w.p?' ★'+w.p:''}</i></span><button data-cuw="1">›</button></div></div>
  <div class="cu-main"><div class="cu-stage"><img src="${cuPreview(k,CU.tab=='ch'?(cur?cur.n:eq||''):(eq||''),CU.view)}" alt=""><b>${CU_VIEWS[CU.view][0]}</b></div><aside class="cu-info">${info}</aside></div>
  <div class="cu-bot"><div class="cu-modes"><button data-cutr="mp" class="${CU.track=='mp'?'on':''}">MULTIPLAYER</button><button data-cutr="zm" class="${CU.track=='zm'?'on':''}">ZOMBIES</button></div>
  <div class="cu-groups">${groups.map(([n,l],gi)=>`<div class="cg"><h4>${n}</h4><div class="cr">${gi==0?`<button class="ct ${!cur?'sel':''}" data-cut="" title="Default"><span class="sw" style="--c:#2a3036"></span>${eq?'':'<em>EQUIPPED</em>'}</button>`:''}${l.map(tile).join('')}</div></div>`).join('')}</div>
  <div class="cu-btns"><button data-cuact="track">TRACK NEXT CAMO (${tc}/${all.length})</button><button data-cuact="view">PREVIEW WEAPON</button><button data-cuact="weap">WEAPONS</button></div>${tr?`<p class="cu-trk">Tracking: ${tr.split(':')[1]} on ${nm(tr.split(':')[0])}</p>`:''}</div></div>`}
function custWeapons(){const e=$('#p-cust');const keys=Object.keys(W);e.querySelector('.cu-main').innerHTML=`<div class="cu-wlist">${keys.map(x=>`<button class="${x==CU.k?'on':''}" data-cuw2="${x}"><b>${nm(x)}</b><i>Lv ${wlv(x)}</i></button>`).join('')}</div>`}
document.addEventListener('click',e=>{const t=e.target;
 const op=t.closest('[data-cust]');if(op){e.stopImmediatePropagation();CU.back='load';custOpen(op.dataset.cust=='s'?L.s||L.p:L.p,'mp');return}
 const zc=t.closest('#nav button[data-p="cust"]');if(zc){CU.back='zplay';custOpen(CU.k,'zm');return}
 const pn=t.closest('#p-cust');if(!pn)return;
 const a=t.closest('[data-cuact]');if(a){const v=a.dataset.cuact;if(v=='back')custBack();else if(v=='view'){CU.view=(CU.view+1)%CU_VIEWS.length;custRender()}else if(v=='weap')custWeapons();else if(v=='track'){const{all}=cuList(),nx=all.find(c=>!c.ok);prof.trk=nx?CU.k+':'+nx.n:'';if(nx)CU.sel=nx.n;save();custRender()}return}
 const tab=t.closest('[data-cutab]');if(tab){CU.tab=tab.dataset.cutab;custRender();return}
 const w=t.closest('[data-cuw]');if(w){const ks=Object.keys(W),i=(ks.indexOf(CU.k)+ +w.dataset.cuw+ks.length)%ks.length;CU.k=ks[i];CU.sel=prof.camo[CU.k]||null;custRender();return}
 const w2=t.closest('[data-cuw2]');if(w2){CU.k=w2.dataset.cuw2;CU.sel=prof.camo[CU.k]||null;custRender();return}
 const tr=t.closest('[data-cutr]');if(tr){CU.track=tr.dataset.cutr;CU.sel=prof.camo[CU.k]||null;custRender();return}
 const pr=t.closest('[data-cupr]');if(pr){wpres(CU.k);custRender();return}
 const c=t.closest('[data-cut]');if(c){const n=c.dataset.cut,{all}=cuList(),cm=all.find(x=>x.n==n);if(!n){prof.camo[CU.k]='';CU.sel=null;save();custRender();return}
  CU.sel=n;if(cm&&cm.ok){prof.camo[CU.k]=n;save()}custRender()}},true);
/* the weapon preview opens in a different view each time Preview weapon is pressed; double click is kept as a harmless alias for click */
;
/* ######## haptics.js ######## */
/* ===================== haptics.js ===================== */
/* ---------- controller vibration, on a gamepad (dual rumble) and in VR (the controller that holds the weapon pulses when you fire, both pulse when you are hurt).
   Triggers: every shot (strength follows the weapon's kick), taking damage, explosions near you (by distance), melee swings, reloads, grenades, kills, death, armor plates,
   field upgrade, landing hard. Settings: Controller vibration On / Off. ---------- */
var HAP={on:1,last:0};try{HAP.on=localStorage.getItem('sdrill-vib')=='0'?0:1}catch(e){}
function hapPad(){return gpGet()}
function haptic(strong,ms,weak,hand){if(!HAP.on)return;strong=Math.max(0,Math.min(1,strong));weak=weak==null?strong*.65:Math.max(0,Math.min(1,weak));
 try{if(typeof xrS!='undefined'&&xrS){const hs=hand=='left'?['left']:hand=='both'?['left','right']:['right'];for(const h of hs){const c=typeof vrHand=='function'?vrHand(h):null,gp=c&&c.userData.gp;if(!gp)continue;const ha=gp.hapticActuators&&gp.hapticActuators[0];
    if(ha&&ha.pulse)ha.pulse(strong,ms);else if(gp.vibrationActuator&&gp.vibrationActuator.playEffect)gp.vibrationActuator.playEffect('dual-rumble',{startDelay:0,duration:ms,strongMagnitude:strong,weakMagnitude:weak})}return}
  const p=hapPad();if(!p)return;const va=p.vibrationActuator;if(va&&va.playEffect)va.playEffect('dual-rumble',{startDelay:0,duration:ms,strongMagnitude:strong,weakMagnitude:weak});else if(p.hapticActuators&&p.hapticActuators[0]&&p.hapticActuators[0].pulse)p.hapticActuators[0].pulse(strong,ms)}catch(e){}}
/* hooks */
{const _gs=gunSnd;gunSnd=function(w){_gs.apply(this,arguments);const n=performance.now();if(n-HAP.last<25)return;HAP.last=n;const rc=w&&w.rc||1,heavy=w&&(w.k=='RL'||w.k=='SN'||w.k=='SG'||w.k=='CY');haptic(Math.min(1,.18+rc*.3+(heavy?.35:0)),heavy?110:48,Math.min(1,.12+rc*.2),'right')}}
{const _h=hurt;hurt=function(d,b){const was=P.dead;_h.apply(this,arguments);if(!was)haptic(Math.min(1,.35+(d||0)/70),130,.8,'both')}}
{const _b=boom;boom=function(p,g){_b.apply(this,arguments);if(g&&g.tac)return;const D=p.distanceTo(C.position),v=1/(1+D*.14);if(v>.12)haptic(Math.min(1,v*1.3),Math.round(160+v*260),v,'both')}}
{const _m=melee;melee=function(){const t=mn;_m.apply(this,arguments);if(mn!=t)haptic(.55,90,.7,'right')}}
{const _rb=rifleBash;rifleBash=function(){const t=mn;_rb.apply(this,arguments);if(mn!=t)haptic(.35,70,.4,'right')}}
{const _sr=startRel;startRel=function(){_sr.apply(this,arguments);haptic(.14,60,.2,'right');setTimeout(()=>haptic(.22,45,.3,'right'),700)}}
{const _tg=throwG;throwG=function(){const g=gc;_tg.apply(this,arguments);if(gc!=g)haptic(.3,80,.4,'right')}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!was)haptic(1,420,1,'both')}}
{const _fk=featKill;featKill=function(){_fk.apply(this,arguments);haptic(.3,55,.55,'right')}}
{const _fu=actField;actField=function(){const n=ST.fieldCd;_fu.apply(this,arguments);if(ST.fieldCd>n)haptic(.5,220,.5,'both')}}
/* settings control */
{const l=document.createElement('label');l.innerHTML='Controller vibration<select id="vib"><option value="1">On</option><option value="0">Off</option></select>';const s=document.querySelector('#p-set');if(s){const g=document.querySelector('#gq');g&&g.parentElement?g.parentElement.after(l):s.appendChild(l);const v=l.querySelector('select');v.value=HAP.on?'1':'0';v.onchange=()=>{HAP.on=+v.value;try{localStorage.setItem('sdrill-vib',v.value)}catch(e){}if(HAP.on)haptic(.6,120,.6,'both')}}}
/* ---------- every setting is in BOTH the main Settings panel and the pause menu, always in sync and saved on this device ----------
   Aim assist, Look sensitivity, Field of view, Brightness, Volume, Screen shake, Graphics, Motion blur, FPS limit and counter, Controller vibration and VR mode. ---------- */
{const q=s=>document.querySelector(s),sv=(k,v)=>{try{localStorage.setItem(k,String(v))}catch(e){}},ld=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
 const SP=q('#p-set'),PC=q('#pause .card'),EX=q('#exit');
 const mkSel=(label,id,opts)=>{const l=document.createElement('label');l.innerHTML=label+'<select id="'+id+'">'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select>';return l};
 const mkRng=(label,id,min,max,step)=>{const l=document.createElement('label');l.innerHTML=label+'<input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'">';return l};
 const OO=[['1','On'],['0','Off']];
 /* ties several controls together: change any of them and all show the same value and set() runs */
 const link=(ids,set,init)=>{const els=ids.map(i=>q('#'+i)).filter(Boolean),apply=v=>{set(v);for(const e of els)e.value=String(v)};for(const e of els)e.addEventListener(e.type=='range'?'input':'change',()=>apply(e.value));if(init!=null)for(const e of els)e.value=String(init);return apply};
 /* Count rendered game frames, including the intervals skipped by the limiter. */
 const fe=document.createElement('div');fe.id='fpsc';document.body.appendChild(fe);let fOn=0,fLast=0,fAcc=0,fN=0,fWorst=0;
 const resetFps=()=>{fLast=fAcc=fN=fWorst=0;if(fOn)fe.textContent='… FPS'};
 const countFrame=t=>{if(fLast){const d=t-fLast;fAcc+=d;fN++;if(d>fWorst)fWorst=d;if(fAcc>=500){const f=fN*1000/fAcc;fe.innerHTML='<b>'+Math.round(f)+'</b> FPS<small>'+(fAcc/fN).toFixed(1)+' ms · worst '+fWorst.toFixed(0)+' ms</small>';fAcc=fN=fWorst=0}}fLast=t};
 document.addEventListener('visibilitychange',resetFps);
 const fcRead=()=>{const a=String(ld('sdrill-fpscol','125,255,176')).split(',').map(n=>Math.max(0,Math.min(255,+n|0)));return a.length==3?a:[125,255,176]},fc=fcRead();
 const fcApply=()=>{const c='rgb('+fc[0]+','+fc[1]+','+fc[2]+')';fe.style.color=c;fe.style.borderColor='rgba('+fc[0]+','+fc[1]+','+fc[2]+',.4)';for(const w of document.querySelectorAll('.fcsw'))w.style.background=c;for(const w of document.querySelectorAll('.fcv'))w.textContent=fc.join(' · ')};
 let fcPv=0;const fcPreview=()=>{if(fOn)return;fe.style.display='block';fe.innerHTML='<b>60</b> FPS<small>16.7 ms · worst 18 ms</small>';clearTimeout(fcPv);fcPv=setTimeout(()=>{if(!fOn)fe.style.display='none'},1800)};
 const fpsSet=v=>{fOn=+v?1:0;fe.style.display=fOn?'block':'none';onGameRender=fOn?countFrame:null;resetFps()};
 /* --- build the missing controls --- */
 const gq=q('#gq'),brL=q('#br')&&q('#br').parentElement,vlOld=q('#vl'),skOld=q('#sk');
 const gqOpts=gq?[...gq.options].map(o=>[o.value,o.textContent]):[['high','Ultra'],['med','Medium'],['low','Low']];
 const mbl=mkSel('Motion blur','mbl',OO),mbl2=mkSel('Motion blur','mbl2',OO),fps=mkSel('FPS counter','fps',OO),fps2=mkSel('FPS counter','fps2',OO),vib2=mkSel('Controller vibration','vib2',OO),gq2=mkSel('Graphics','gq2',gqOpts),
  vl3=mkRng('Master volume','vl3',0,1,.05),sk3=mkRng('Screen shake','sk3',0,1,.1);
 const fpsLimitRows=['fpsLimit','fpsLimit2'].map(id=>{
  const row=mkRng('FPS limit ',id,fpsLimitMin,fpsLimitUnlimited,1),value=document.createElement('span');
  const input=row.querySelector('input');
  input.setAttribute('aria-label','FPS limit');
  row.insertBefore(value,input);
  return {row,value,input};
 });
 const [limitMain,limitPause]=fpsLimitRows;
 const mkRgb=sfx=>{const d=document.createElement('div');d.className='rgbrow';d.innerHTML='FPS counter colour <span class="fcsw"></span><div class="rgb3"><input id="fpcr'+sfx+'" class="cr" type="range" min="0" max="255" step="1" aria-label="Red"><input id="fpcg'+sfx+'" class="cg" type="range" min="0" max="255" step="1" aria-label="Green"><input id="fpcb'+sfx+'" class="cb" type="range" min="0" max="255" step="1" aria-label="Blue"></div><em class="fcv"></em>';return d},rgbM=mkRgb(''),rgbP=mkRgb('2');
 const vrL2=mkSel('VR headset mode','vrm2',[['0','Off'],['1','On (enter VR when a match starts)']]);vrL2.id='vrL2';vrL2.style.display='none';
 if(SP){if(brL){brL.after(vl3);vl3.after(sk3)}else{SP.appendChild(vl3);SP.appendChild(sk3)}const anchor=gq&&gq.parentElement;if(anchor)anchor.after(mbl,limitMain.row,fps,rgbM);else SP.append(mbl,limitMain.row,fps,rgbM)}
 if(PC&&EX)EX.before(gq2,mbl2,limitPause.row,fps2,rgbP,vib2,vrL2);
 /* --- values: restore what was saved, then link every pair --- */
 vol=PlayerAudio.master;shk=+ld('sdrill-shk',shk);
 link(['vl','vl3'],v=>PlayerAudio.set('master',v),vol);link(['sk','sk3'],v=>{shk=+v;sv('sdrill-shk',v)},shk);
 PlayerAudio.subscribe((name,value)=>{
  if(name!=='master')return;
  vol=value;
  for(const id of ['vl','vl3'])q('#'+id).value=value;
 });
 SP.insertAdjacentHTML('beforeend',PlayerAudio.controls());
 EX.insertAdjacentHTML('beforebegin',PlayerAudio.controls());
 PlayerAudio.bind(SP);PlayerAudio.bind(PC);
 if(gq){gq.onchange=null;link(['gq','gq2'],v=>setGfx(v),gq.value||gfxQ)}else link(['gq2'],v=>setGfx(v),gfxQ);
 link(['mbl','mbl2'],v=>{LX.mblur=+v;sv('sdrill-mblur',v)},LX.mblur?1:0);
 const savedLimit=Number(ld('sdrill-fps-limit',fpsLimitUnlimited));
 const limit=Number.isInteger(savedLimit)&&savedLimit>=fpsLimitMin&&savedLimit<=fpsLimitUnlimited?savedLimit:fpsLimitUnlimited;
 const applyLimit=link(['fpsLimit','fpsLimit2'],v=>{
  setFrameLimit(v);resetFps();sv('sdrill-fps-limit',v);
  const label=+v===fpsLimitUnlimited?'Unlimited':v+' FPS';
  for(const {input,value} of fpsLimitRows){value.textContent='· '+label;input.setAttribute('aria-valuetext',label)}
 },limit);
 applyLimit(limit);
 const fv0=ld('sdrill-fps','0');link(['fps','fps2'],v=>{fpsSet(v);sv('sdrill-fps',v)},fv0);fpsSet(+fv0);
 for(const[i,id]of[[0,'fpcr'],[1,'fpcg'],[2,'fpcb']])link([id,id+'2'],v=>{fc[i]=Math.max(0,Math.min(255,+v|0));sv('sdrill-fpscol',fc.join(','));fcApply();fcPreview()},fc[i]);fcApply();
 const vb=q('#vib');if(vb)vb.onchange=null;link(['vib','vib2'],v=>{HAP.on=+v;sv('sdrill-vib',v);if(HAP.on&&typeof haptic=='function')haptic(.6,120,.6,'both')},HAP.on?1:0);
 link(['vrm','vrm2'],v=>{vrMode=+v;sv('sd-vr',v)},null);
 /* every time the pause menu opens: bring the controls up to date (the VR option only exists on devices with a headset) */
 const _sp=showPause;showPause=function(){_sp.apply(this,arguments);const vl=q('#vrL'),m=q('#vrm'),m2=q('#vrm2');if(vl&&m2){vrL2.style.display=vl.style.display;if(m)m2.value=m.value}const g=q('#gq'),g2=q('#gq2');if(g&&g2)g2.value=g.value;const b=q('#br'),b2=q('#br2');if(b&&b2)b2.value=b.value;const v=q('#vl');if(v)v.value=String(vol);const k=q('#sk');if(k)k.value=String(shk)}}
;
/* ######## oitc.js ######## */
/* ===================== oitc.js ===================== */
/* ---------- One in the Chamber: everyone spawns with a pistol holding a single bullet and three lives. Any hit kills (you and the bots), each kill earns one bullet back, melee kills as well,
   and with no bullets left you still have your melee. Run out of lives and you are out. Last one standing wins. In private matches the host's bots take part, the other players are
   tracked through an 'oi' message when someone runs out of lives. The bot count comes from the private match slider. ---------- */
var OI={on:0,lives:3};
var oiMode=()=>mode=='One in the Chamber';
{const _s=startGame;startGame=function(){if(!netOn)PBOTS=null;_s.apply(this,arguments);OI.on=oiMode()?1:0;if(!OI.on)return;OI.lives=3;OI.sent=0;
  /* one pistol, one bullet, a pocket of nothing else */
  wp=[{k:'CT',...eff('CT',[]),d:999}];wp[0].m=8;wp[0].mag=1;wp[0].res=0;wp[0].rs=0;cur=0;rel=0;gc=0;ST.tN=0;setGun();
  for(const b of bots){if(b.net)continue;b.mhp=b.hp=1;b.msh=b.sh=0;b.dc=0;setHeld(b,'CT')}msg('One in the Chamber · 3 lives',2.5)}}
function oiBullet(){const w=cw();if(!w)return;const n_=performance.now();if(n_-(OI.bt||0)<80)return;OI.bt=n_;w.mag=Math.min(w.m,w.mag+1);beep(1200,.08,'triangle',.06);msg('+1 bullet · '+w.mag+' in the chamber',1.4)}
{const _fk=featKill;featKill=function(){_fk.apply(this,arguments);if(OI.on)oiBullet()}}
{const _h=hurt;hurt=function(d,b){if(OI.on&&d>0&&!P.dead){P.sh=0;P.hp=0;d=1e4}_h.call(this,d,b)}}
{const _sr=startRel;startRel=function(){if(OI.on)return;_sr.apply(this,arguments)}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!OI.on||was)return;OI.lives--;if(OI.lives<=0){if(netOn&&!OI.sent){OI.sent=1;netSend({t:'oi',out:myId})}setTimeout(()=>endGame(netOn?'Eliminated':'Out of lives'),1400)}}}
{const _r=respawn;respawn=function(){_r.apply(this,arguments);if(OI.on&&wp[0]){wp[0].mag=1;wp[0].res=0;msg('Lives left: '+OI.lives,1.4)}}}
/* bots that used their three lives stay dead */
{const _sp=spawn;spawn=function(b){if(OI.on&&!b.net&&(b.dc||0)>=3){b.al=0;b.out=1;b.m.visible=false;b.rt=1e9;return}_sp.apply(this,arguments)}}
function oiTick(dt){const aiLeft=bots.filter(b=>!b.net&&!b.out).length,humans=bots.filter(b=>b.net&&!b.hb&&!b.out).length,left=aiLeft+humans;
 $('#ob').textContent=`Lives ${Math.max(0,OI.lives)} · Kills ${kills} · Opponents left ${left}`;
 if(P.dead&&OI.lives<=0)return;
 if(!netOn||isHost){if(left==0&&OI.lives>0)endGame('Victory');else if(netOn&&OI.lives<=0&&left<=1&&!over)endGame(left==1?(bots.find(b=>b.net&&!b.hb&&!b.out)||{nm:'A player'}).nm+' wins':'Defeat')}}

/* private match: the bot slider is shown for every mode except players-only free-for-all and zombies */
{const sl=$('#pbots'),pm=$('#pmode');if(sl){sl.oninput=()=>{$('#pbv').textContent=sl.value};const upd=()=>{const L_=$('#pbL');if(L_&&pm&&pm.value=='Private')L_.style.opacity=.45;else if(L_)L_.style.opacity=1};if(pm)pm.addEventListener('change',upd);upd()}}
;

/* ---------- the pause menu always has EVERY setting: whatever other parts of the game add to the main Settings panel (Killcam, Chat, weapon hold animations,
   threat indicators, enemy footstep audio, ...) is mirrored into the pause menu too, kept in sync both ways, and the original control's own handler still runs ---------- */
{const q=s=>document.querySelector(s),mirrors=[];
 const keyOf=l=>{let t='';for(const n of l.childNodes)if(n.nodeType==3)t+=n.textContent;t=t.trim();return t||l.textContent.trim().slice(0,40)};
 const pull=()=>{for(const m of mirrors){const[c,cc,l,cp]=m;if(c.type=='checkbox')cc.checked=c.checked;else cc.value=c.value;cp.style.display=l.style.display}};
 const mirrorRest=()=>{const SP=q('#p-set'),PC=q('#pause .card'),EX=q('#exit');if(!SP||!PC||!EX)return;const have=new Set([...PC.querySelectorAll('label,.rgbrow')].map(keyOf));
  for(const l of SP.querySelectorAll('label')){const k=keyOf(l);if(!k||have.has(k)||l.dataset.mir)continue;const c=l.querySelector('select,input');if(!c)continue;l.dataset.mir='1';have.add(k);
   const cp=l.cloneNode(true);cp.removeAttribute('id');const cc=cp.querySelector('select,input');cc.removeAttribute('id');if(c.type=='checkbox')cc.checked=c.checked;else cc.value=c.value;cp.style.display=l.style.display;
   const ev=c.type=='range'?'input':'change';
   cc.addEventListener(ev,()=>{if(c.type=='checkbox')c.checked=cc.checked;else c.value=cc.value;c.dispatchEvent(new Event(ev,{bubbles:true}))});
   c.addEventListener(ev,()=>{if(c.type=='checkbox')cc.checked=c.checked;else cc.value=c.value});
   EX.before(cp);mirrors.push([c,cc,l,cp])}};
 addEventListener('load',mirrorRest);const _sp3=showPause;showPause=function(){mirrorRest();_sp3.apply(this,arguments);pull()}}

/* Player identity. Peers exchange card IDs and bounded shape layers. */
const IDR_CARDS = {
 field: {name:'Field Issue', ink:'#84d2cc', shade:'#244842', art:'M190 58 248 8H316L252 58ZM244 58 291 16H344L298 58Z'},
 breach: {name:'Breach Point', ink:'#ffb175', shade:'#753a29', art:'M179 58 213 9H235L213 38H252L233 58ZM240 58 276 0H310L283 39H320L301 58Z'},
 iron: {name:'Iron Standard', ink:'#ffda86', shade:'#76572d', art:'M222 3H310V31L265 56 222 31ZM236 10H296V27L265 45 236 27Z M244 14H286L265 36Z'},
 sight: {name:'Clear Sight', ink:'#9ad7ff', shade:'#254c78', art:'M260 4A26 26 0 1 0 260 56 26 26 0 1 0 260 4ZM260 11A19 19 0 1 1 260 49 19 19 0 1 1 260 11Z M258 0H262V21H258ZM258 39H262V60H258ZM230 28H251V32H230ZM269 28H290V32H269Z'},
 zero: {name:'Absolute Zero', ink:'#c3e9ff', shade:'#274a70', art:'M200 58 231 13 246 29 269 1 315 58H290L269 27 251 52 234 32 218 58Z M178 58 195 34 208 50 201 58Z'},
 summit: {name:'High Ground', ink:'#d7eb85', shade:'#535d30', art:'M182 58 218 34 233 42 272 4 325 58H309L272 18 251 48 239 47 226 58Z M255 58 273 34 293 58Z'},
 dominion: {name:'Dominion', ink:'#f9cf78', shade:'#714221', art:'M219 15 244 29 265 7 286 29 311 15 301 42H229ZM233 48H297V54H233Z M259 30 265 23 271 30 265 37Z'},
 ribbons: {name:'Ribbon Rack', ink:'#f4a9c8', shade:'#6a3857', art:'M216 2H238V37L227 49 216 37ZM247 2H271V44L259 58 247 44ZM280 2H302V37L291 49 280 37Z'},
 laurels: {name:'Laureate', ink:'#c4b3ff', shade:'#513a77', art:'M254 55C228 51 218 31 223 11 233 16 236 26 233 34 239 32 244 37 243 43 251 44 253 49 254 55ZM270 55C296 51 306 31 301 11 291 16 288 26 291 34 285 32 280 37 281 43 273 44 271 49 270 55ZM262 9 269 22 282 24 273 34 275 47 262 41 249 47 251 34 242 24 255 22Z'}
};
const IDR_SHAPES = [
 ['Shield','M9 8H91V56Q91 76 50 96 9 76 9 56Z'],
 ['Chevron','M4 78 50 14 96 78H71L50 48 29 78Z'],
 ['Diamond','M50 3 97 50 50 97 3 50Z'],
 ['Circle','M50 4a46 46 0 1 0 0 92 46 46 0 1 0 0-92Z'],
 ['Ring','M50 4a46 46 0 1 0 0 92 46 46 0 1 0 0-92Zm0 15a31 31 0 1 1 0 62 31 31 0 1 1 0-62Z'],
 ['Star','M50 4 64 32 95 37 73 59 78 92 50 77 22 92 27 59 5 37 36 32Z'],
 ['Lightning','M56 3 16 58H46L40 98 85 40H57L66 3Z'],
 ['Wing','M1 19 96 47 77 69 24 53 21 45 63 50 9 35Z'],
 ['Crescent','M75 11a44 44 0 1 0 0 78C43 95 25 68 29 49 32 29 48 15 75 11Z'],
 ['Flame','M52 4c12 23 39 36 39 57a41 41 0 0 1-82 0c0-15 11-28 18-37 1 16 8 21 12 21-1-17 5-29 13-41Zm2 55c-5 10-15 19-15 25a14 14 0 0 0 28 0c0-9-7-15-13-25Z'],
 ['Crosshair','M42 5H58V31H42ZM42 69H58V95H42ZM5 42H31V58H5ZM69 42H95V58H69ZM50 40 60 50 50 60 40 50Z'],
 ['Bar','M4 35H96V65H4Z']
];
const IDR_COLORS = [
 ['Ivory','#f2f3e8'], ['Graphite','#222c3a'], ['Amber','#ffbc57'], ['Ember','#ff7657'],
 ['Crimson','#e74462'], ['Cobalt','#7098fa'], ['Ice','#8fe8ff'], ['Mint','#65deb7'],
 ['Olive','#adc86b'], ['Violet','#ad91f4'], ['Pink','#f288bc'], ['Steel','#afbecc']
];
const IDR_PRESETS = {
 aegis: {name:'Aegis', layers:[[0,7,50,50,94,0,100],[0,1,50,50,77,0,100],[1,0,50,48,52,0,100]]},
 comet: {name:'Comet', layers:[[2,5,50,50,94,0,100],[6,0,50,50,63,14,100]]},
 eclipse: {name:'Eclipse', layers:[[3,9,50,50,86,0,100],[8,1,50,50,75,-22,100],[5,0,63,37,26,0,100]]},
 sunburst: {name:'Sunburst', layers:[[5,3,50,50,99,0,100],[4,2,50,50,58,0,100],[3,0,50,50,23,0,100]]},
 sentinel: {name:'Sentinel', layers:[[0,5,50,50,90,0,100],[0,1,50,50,75,0,100],[10,6,50,49,51,0,100]]},
 wings: {name:'Night Wings', layers:[[7,11,30,47,62,-19,100],[7,11,70,47,62,161,100],[2,1,50,52,54,0,100],[2,6,50,50,29,0,100]]}
};
const IDR_DEFAULT = {card:'field', emblem:'aegis'};
const IDR_MAX_LAYERS = 8;
const IDR_RANGES = [
 {slot:2, name:'Position X', min:0, max:100, unit:'%'},
 {slot:3, name:'Position Y', min:0, max:100, unit:'%'},
 {slot:4, name:'Size', min:10, max:100, unit:'%'},
 {slot:5, name:'Rotation', min:-180, max:180, unit:'°'},
 {slot:6, name:'Opacity', min:20, max:100, unit:'%'}
];
const IDR_BOUNDS = [{min:0,max:IDR_SHAPES.length-1}, {min:0,max:IDR_COLORS.length-1}, ...IDR_RANGES];

function idrLayers(value){
 if(!Array.isArray(value)||!value.length||value.length>IDR_MAX_LAYERS)return null;
 if(!value.every(layer=>Array.isArray(layer)&&layer.length===IDR_BOUNDS.length&&
   IDR_BOUNDS.every(({min,max},i)=>Number.isInteger(layer[i])&&layer[i]>=min&&layer[i]<=max)))return null;
 return value.map(layer=>layer.slice());
}
function idrRead(value){
 const card=typeof value?.card==='string'&&hasOwn(IDR_CARDS,value.card)?value.card:IDR_DEFAULT.card;
 const layers=value?.emblem==='custom'?idrLayers(value.layers):null;
 const operator=operatorId(value?.operator);
 const extras={operator,charm:idrExtra('charm',value?.charm),title:idrExtra('title',value?.title),tracer:idrExtra('tracer',value?.tracer)};
 if(layers)return {card,emblem:'custom',layers,...extras};
 const emblem=typeof value?.emblem==='string'&&hasOwn(IDR_PRESETS,value.emblem)?value.emblem:IDR_DEFAULT.emblem;
 return {card,emblem,...extras};
}
let idrSaved={...IDR_DEFAULT}, idrDraft=null, idrLayer=0, idrTab='gear';
function idrLocal(){
 const look=idrRead({...idrSaved,operator:passOperator(),charm:passExtra('charm'),title:passExtra('title'),tracer:passExtra('tracer')});
 if(!idrEmblemUnlocked(look.emblem)){look.emblem=IDR_DEFAULT.emblem;delete look.layers}
 if(!idrCardProgress(look.card).unlocked)look.card=IDR_DEFAULT.card;
 return look;
}
function idrCardProgress(id){
 const challenge=CHC.find(c=>c[5].includes(id));
 if(!challenge){
  const tier=passRewardTier('card',id);
  return tier?{unlocked:passOwns('card',id),title:'Battle Pass · Tier '+tier,progress:Math.min(tier,passTier()),goal:tier}:{unlocked:true};
 }
 const index=challenge[5].indexOf(id);
 const progress=Math.min(CHST.c[challenge[2]]||0,challenge[3][index]);
 return {
  unlocked:(CHST.tier[challenge[0]]||0)>index,
  title:challenge[1]+' '+CH_TIERS[index], progress, goal:challenge[3][index]
 };
}
function idrCommit(look){
 idrSaved=look;
 let wrote=true;
 try{localStorage.setItem('sd-identity',JSON.stringify(look))}catch(e){wrote=false}
 if(net&&app==='mp'){
  netSend({t:'identity',look:idrLocal()});
  lobbyList();
 }
 return wrote;
}
function idrEmblemArt(layers){
 return '<svg class="idr-mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'+layers.map(([shape,color,x,y,size,angle,opacity])=>
  '<path fill="'+IDR_COLORS[color][1]+'" fill-rule="evenodd" d="'+IDR_SHAPES[shape][1]+'" transform="translate('+x+' '+y+') rotate('+angle+') scale('+(size/100)+') translate(-50 -50)" opacity="'+opacity/100+'"/>'
 ).join('')+'</svg>';
}
function idrCardArt(card){
 return '<svg class="idr-card-art" viewBox="0 0 320 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'+
  '<path d="M124 60 165 0H188L147 60ZM160 60 201 0H282L241 60ZM274 60 315 0H320V60Z" fill="currentColor" opacity=".12"/>'+
  '<path d="M142 60 183 0M146 60 187 0M274 60 315 0M278 60 319 0M8 8H52M8 52H34" fill="none" stroke="currentColor" opacity=".44"/>'+
  (card.composition?'<g fill="currentColor" fill-rule="evenodd" opacity=".77">'+card.composition+'</g>':
  '<path d="'+card.art+'" fill="currentColor" fill-rule="evenodd" opacity=".77"/>')+'</svg>';
}
function idrPlate(look, name, detail=''){
 const card=IDR_CARDS[look.card], custom=look.emblem==='custom';
 const emblem=custom?'Custom emblem':IDR_PRESETS[look.emblem].name;
 const layers=custom?look.layers:IDR_PRESETS[look.emblem].layers,title=PASS_TITLES[look.title]?.name;
 return '<span class="idr-plate" title="'+esc(card.name+' · '+emblem+(title?' · '+title:''))+'" style="--idr-ink:'+card.ink+';--idr-shade:'+card.shade+'">'+
  idrCardArt(card)+'<span class="idr-badge">'+idrEmblemArt(layers)+'</span>'+
  '<span class="idr-plate-text"><strong>'+esc(name)+'</strong><small>'+esc(detail||(title?card.name+' · '+title:card.name))+'</small></span></span>';
}
function idrBoardName(row, suffix=''){
 return row.look?idrPlate(row.look,row.nm+suffix):esc(row.nm+suffix);
}
function idrPreview(){
 $('#idr-equipped').innerHTML=idrPlate(idrLocal(),$('#nm').value.trim()||'Player');
}
function idrRenderCards(){
 const equipped=idrLocal().card;
 const cards=Object.entries(IDR_CARDS).map(([id,card])=>{
  const p=idrCardProgress(id),selected=id===equipped;
  const label=selected?'Equipped':p.unlocked?'Equip calling card':p.title+' · '+p.progress.toLocaleString()+' / '+p.goal.toLocaleString();
  return '<button class="idr-card-choice" data-idr-card="'+id+'" aria-pressed="'+selected+'"'+(p.unlocked?'':' disabled')+'>'+
   '<span class="idr-art-frame" style="--idr-ink:'+card.ink+';--idr-shade:'+card.shade+'">'+idrCardArt(card)+(p.unlocked?'':'<span class="idr-lock">Locked</span>')+'</span>'+
   '<span class="idr-choice-caption"><strong>'+card.name+'</strong><small>'+label+'</small></span></button>';
 }).join('');
 return '<div class="idr-list-head"><h3>Calling cards</h3><button class="idr-button" data-idr-action="challenges">View challenges</button></div><div class="idr-card-grid">'+cards+'</div>';
}
function idrEmblemUnlocked(id){return !passRewardTier('emblem',id)||passOwns('emblem',id)}
function idrRenderEmblems(){
 const equipped=idrLocal().emblem;
 const presets=Object.entries(IDR_PRESETS);
 if(idrSaved.layers)presets.push(['custom',{name:'Custom emblem',layers:idrSaved.layers}]);
 return '<div class="idr-list-head"><h3>Emblems</h3><button class="idr-button" data-idr-action="creator">'+(idrSaved.layers?'Edit custom emblem':'Create custom emblem')+'</button></div>'+
  '<div class="idr-emblem-grid">'+presets.map(([id,emblem])=>{
   const selected=id===equipped, unlocked=idrEmblemUnlocked(id);
   return '<button class="idr-emblem-choice" data-idr-emblem="'+id+'" aria-pressed="'+selected+'"'+(unlocked?'':' disabled')+'><span class="idr-badge">'+
    idrEmblemArt(emblem.layers)+'</span><strong>'+emblem.name+'</strong><small>'+(selected?'Equipped':unlocked?'Equip emblem':'Battle Pass reward')+'</small></button>';
  }).join('')+'</div>';
}
function idrOptions(entries, selected){
 return entries.map(([name],i)=>'<option value="'+i+'"'+(selected===i?' selected':'')+'>'+name+'</option>').join('');
}
function idrRenderCreator(){
 if(!idrDraft)idrDraft=idrLayers(idrSaved.layers||IDR_PRESETS.aegis.layers);
 const layer=idrDraft[idrLayer],count=idrDraft.length,full=count===IDR_MAX_LAYERS;
 const layerList=idrDraft.map(([shape],i)=>'<button class="idr-button" data-idr-layer="'+i+'" aria-pressed="'+(i===idrLayer)+'">'+(i+1)+' · '+IDR_SHAPES[shape][0]+'</button>').reverse().join('');
 const controls=IDR_RANGES.map(({slot,name,min,max,unit})=>'<label>'+name+' <output for="idr-'+slot+'">'+layer[slot]+unit+'</output>'+
  '<input id="idr-'+slot+'" type="range" data-idr-value="'+slot+'" min="'+min+'" max="'+max+'" value="'+layer[slot]+'"></label>').join('');
 return '<div class="idr-editor"><div class="idr-editor-preview"><h3>Emblem preview</h3><div id="idr-draft-art" class="idr-draft-art" role="img" aria-label="Custom emblem preview">'+idrEmblemArt(idrDraft)+'</div>'+
  '<div class="idr-editor-actions"><button class="idr-button" data-idr-action="use-preset">Load preset</button><select aria-label="Preset to load" id="idr-template">'+
  Object.entries(IDR_PRESETS).filter(([id])=>idrEmblemUnlocked(id)).map(([id,preset])=>'<option value="'+id+'">'+preset.name+'</option>').join('')+'</select></div>'+
  '<button class="idr-button idr-save" data-idr-action="save">Save and equip</button></div>'+
  '<div class="idr-editor-tools"><div class="idr-list-head"><h3>Layers <small>'+count+' / '+IDR_MAX_LAYERS+'</small></h3><button class="idr-button" data-idr-action="add"'+(full?' disabled':'')+'>Add layer</button></div>'+
  '<div class="idr-layer-list" role="group" aria-label="Layers, front to back">'+layerList+'</div>'+
  '<div class="idr-editor-actions"><button class="idr-button" data-idr-action="forward"'+(idrLayer===count-1?' disabled':'')+'>Move forward</button>'+
  '<button class="idr-button" data-idr-action="backward"'+(idrLayer===0?' disabled':'')+'>Move backward</button>'+
  '<button class="idr-button" data-idr-action="duplicate"'+(full?' disabled':'')+'>Duplicate</button>'+
  '<button class="idr-button" data-idr-action="delete"'+(count===1?' disabled':'')+'>Delete layer</button></div>'+
  '<div class="idr-layer-fields"><label>Shape<select data-idr-value="0">'+idrOptions(IDR_SHAPES,layer[0])+'</select></label>'+
  '<label>Color <span id="idr-swatch" style="background:'+IDR_COLORS[layer[1]][1]+'" aria-hidden="true"></span><select data-idr-value="1">'+idrOptions(IDR_COLORS,layer[1])+'</select></label>'+
  controls+'</div></div></div>';
}
function idrRender(focus){
 const panel=$('#p-identity'), pos=panel.scrollTop;
 idrPreview();
 $('#locker-category').value=idrTab==='gear'?lockerGroup:idrTab==='creator'?'emblems':idrTab;
 const editor=panel.querySelector('[data-idr-tab="creator"]');
 editor.setAttribute('aria-pressed',String(idrTab==='creator'));
 editor.textContent=idrTab==='creator'?'Back to emblems':'Emblem editor';
 $('#idr-content').innerHTML=idrTab==='creator'?idrRenderCreator():idrTab==='emblems'?idrRenderEmblems():idrTab==='gear'?passLocker():idrRenderCards();
 if(focus)panel.querySelector(focus+':not(:disabled)')?.focus({preventScroll:true});
 panel.scrollTop=pos;
}
function idrEdit(action){
 const count=idrDraft.length;
 switch(action){
  case 'add':
   idrDraft.push([2,2,50,50,30,0,100]);
   idrLayer=count;
   break;
  case 'duplicate':
   idrDraft.splice(idrLayer+1,0,idrDraft[idrLayer].slice());
   idrLayer++;
   break;
  case 'delete':
   idrDraft.splice(idrLayer,1);
   idrLayer=Math.min(idrLayer,idrDraft.length-1);
   break;
  case 'forward':
  case 'backward':{
   const next=idrLayer+(action==='forward'?1:-1);
   [idrDraft[next],idrDraft[idrLayer]]=[idrDraft[idrLayer],idrDraft[next]];
   idrLayer=next;
   break;
  }
  case 'use-preset':
   idrDraft=idrLayers(IDR_PRESETS[$('#idr-template').value].layers);
   idrLayer=idrDraft.length-1;
   break;
 }
 idrRender('[data-idr-layer="'+idrLayer+'"]');
}
{
 const panel=$('#p-identity'),status=$('#idr-status');
 const equip=(look,message)=>{status.textContent=idrCommit(look)?message:message+' Browser storage is unavailable.'};
 $$('#nav [data-p=identity]').forEach(b=>b.addEventListener('click',()=>idrRender()));
 $('#nm').addEventListener('input',()=>{if(panel.classList.contains('on'))idrPreview()});
 panel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||button.disabled)return;
  const {idrTab:tab,idrCard:card,idrEmblem:emblem,idrLayer:layer,idrAction:action}=button.dataset;
  status.textContent='';
  if(button.dataset.lockerView){
   const type=button.dataset.lockerView,id=type==='emote'?Number(button.dataset.gearId):button.dataset.gearId;
   lockerSelection=[type,id];
   idrRender('[data-locker-view="'+type+'"][data-gear-id="'+id+'"]');return;
  }
  if(button.dataset.gear){passEquip(button.dataset.gear,button.dataset.gearId);return}
  if(tab){idrTab=idrTab===tab?'emblems':tab;idrRender();return}
  if(card&&idrCardProgress(card).unlocked){
   equip({...idrSaved,card},IDR_CARDS[card].name+' equipped.');
   idrRender('[data-idr-card="'+card+'"]');
  }else if(emblem&&idrEmblemUnlocked(emblem)){
   equip({...idrSaved,emblem},(emblem==='custom'?'Custom emblem':IDR_PRESETS[emblem].name)+' equipped.');
   idrRender('[data-idr-emblem="'+emblem+'"]');
  }else if(layer!==undefined){
   idrLayer=Number(layer);
   idrRender('[data-idr-layer="'+layer+'"]');
  }else if(action==='pass'){
   const nav=$('#nav [data-p=pass]');nav.click();nav.focus();
  }else if(action==='challenges'){
   const nav=$('#nav [data-p=chal]');
   nav.click();nav.focus();
  }else if(action==='creator'){
   idrTab='creator';idrRender('[data-idr-tab="creator"]');
  }else if(action==='save'){
   equip({...idrSaved,emblem:'custom',layers:idrLayers(idrDraft)},'Custom emblem saved and equipped.');
   idrPreview();
  }else if(action)idrEdit(action);
 });
 $('#locker-category').addEventListener('change',event=>{
  const key=event.target.value;
  idrTab=key==='cards'||key==='emblems'?key:'gear';
  if(idrTab==='gear')lockerGroup=key;
  status.textContent='';idrRender();
 });
 const update=event=>{
  const input=event.target, field=input.dataset.idrValue;
  if(field===undefined)return;
  const slot=Number(field),value=Number(input.value);
  idrDraft[idrLayer][slot]=value;
  $('#idr-draft-art').innerHTML=idrEmblemArt(idrDraft);
  if(slot===0)panel.querySelector('[data-idr-layer="'+idrLayer+'"]').textContent=(idrLayer+1)+' · '+IDR_SHAPES[value][0];
  if(slot===1)$('#idr-swatch').style.background=IDR_COLORS[value][1];
  if(slot>=2)input.previousElementSibling.value=value+IDR_RANGES[slot-2].unit;
  status.textContent='';
 };
 panel.addEventListener('input',e=>{if(e.target.type==='range')update(e)});
 panel.addEventListener('change',e=>{if(e.target.tagName==='SELECT')update(e)});
}

/* Season 1. Currency, the purchase and the one-time tier grants are saved together. */
const PASS_PRICE=1000,PASS_XP=300,PASS_PAGE_SIZE=10;
const PASS_CHAPTERS=[
 ['Outpost','84d2cb','254e4b','Field Notes','Dispatch','Perimeter','Last Patrol','Relay','Gatehouse','Survey Flag','Watchtower','Sandbar','Checkpoint'],
 ['Foundry','ffb358','684628','Hot Metal','Anvil','Slag Run','Night Shift','Forge Mark','Crane Hook','Friction','Smelter','Ingot','Kiln Door'],
 ['Downpour','a6d8ff','254970','Rain Line','Harbor Watch','Runoff','Floodgate','Pressure Gauge','Breakwater Bell','Sounding','Monsoon','Tidal Bend','Raincheck'],
 ['Overgrowth','c7e287','405733','Underbrush','Canopy','Seed Vault','Fernbank','Thorn Hook','Root System','Night Bloom','Greenhouse','Bark Trace','Deep Moss'],
 ['Transit','f7c287','714238','Junction','Switchyard','Platform Nine','Last Train','Rail Spike','Overpass','Route Marker','Dead End','Track Dust','Final Stop'],
 ['Highland','f3a8ab','754153','Snowline','North Face','Ridge Walk','Cold Front','Summit Cairn','Slope Guide','Wind Flag','Base Camp','Glacier Cut','Whiteout'],
 ['Nightshift','b8a6ff','4e3977','Curfew','Back Door','Midnight Run','Moonless','Black Star','Shadow Signal','Watch Lamp','After Hours','Moon Track','Last Light'],
 ['Seabed','80e1d5','295765','Deep Channel','Sound Check','Sunken Beacon','Undertow','Diving Bell','Depth Mark','Beacon Lens','Pressure Lock','Salt Flats','Dusk Current'],
 ['Dead Air','e3accd','764963','Lost Signal','Ghost Frequency','Off Grid','Silent Tower','Signal Coil','Carrier Wave','Dish Array','Waveform','Interference','Last Broadcast'],
 ['Horizon','ffe0a3','765335','Long View','First Dawn','Outer Rim','North of Now','Rising Sun','Waymark','Polar Track','Starboard','Solar Flare','End of the Line']
];
const PASS_SPECIAL={
 1:{premium:['operator','breaker'],free:['card','signal']},
 3:{premium:['blueprint','ember'],free:['emblem','compass']},
 4:{premium:['emote',8]},
 5:{free:['camo','tideline']},
 6:{premium:['card','afterglow']},
 8:{premium:['charm','key']},
 10:{premium:['bux',200]},
 12:{premium:['operator','lantern']},
 13:{free:['title','courier']},
 15:{free:['emote',9]},
 19:{premium:['blueprint','cloud']},
 20:{premium:['camo','fracture']},
 23:{premium:['tracer','crimson']},
 26:{premium:['operator','surveyor']},
 27:{free:['charm','gyro']},
 29:{premium:['bux',200]},
 32:{premium:['emblem','vector']},
 39:{premium:['title','keeper']},
 42:{premium:['operator','peregrine']},
 45:{premium:['blueprint','circuit']},
 49:{premium:['bux',200]},
 52:{premium:['charm','lantern']},
 57:{premium:['operator','crosswind']},
 60:{premium:['tracer','glacier']},
 63:{premium:['blueprint','undertow']},
 68:{free:['title','pathfinder']},
 73:{premium:['bux',200]},
 77:{premium:['emote',10]},
 82:{premium:['operator','machinist']},
 86:{premium:['charm','prism']},
 89:{premium:['blueprint','dusk']},
 91:{premium:['tracer','sunflare']},
 94:{premium:['title','standard']},
 97:{premium:['bux',200]},
 100:{premium:['operator','meridian'],bonus:[['title','ascendant'],['charm','crown']]}
};
const PASS_CHARMS={
 key:{name:'Bunker Key',color:0xecb672},
 gyro:{name:'Mini Gyro',color:0x96ccc4},
 lantern:{name:'Signal Lamp',color:0xfca851},
 prism:{name:'Star Prism',color:0xc3a0ff},
 crown:{name:'Apex Transponder',color:0xf1d38d}
};
const PASS_TITLES={
 courier:{name:'Night Courier'},keeper:{name:'Signal Keeper'},
 pathfinder:{name:'Trail Surveyor'},standard:{name:'Keeper of the Standard'},ascendant:{name:'Beyond the Horizon'}
};
const PASS_TRACERS={
 crimson:{name:'Scarlet Wake',color:0xff4a83},
 glacier:{name:'Glacier Line',color:0x67d6ff},
 sunflare:{name:'Solar Filament',color:0xffb54c}
};
const PASS_EXTRAS={charm:PASS_CHARMS,title:PASS_TITLES,tracer:PASS_TRACERS};
function idrExtra(type,value){return typeof value==='string'&&hasOwn(PASS_EXTRAS[type],value)?value:''}
const PASS_TRACK=[];
const PASS_FINISHES={
 tideline:{name:'Tideline',type:'camo',colors:['#3b615b','#273943','#7bad9d']},
 fracture:{name:'Pyrite Fracture',type:'camo',colors:['#363038','#151922','#ad8452']},
 ember:{name:'Kilnwork',type:'blueprint',weapon:'AR',colors:['#43312b','#1a2024','#d96544'],parts:['Compensator','Quickdraw Grip']},
 cloud:{name:'Whitecap',type:'blueprint',weapon:'VA',colors:['#aab5b8','#384c59','#7be0d1'],parts:['Compensator','Fast Hands']},
 circuit:{name:'Burnt Circuit',type:'blueprint',weapon:'SW',colors:['#5b4233','#202733','#f1a05c'],parts:['Compensator','Laser Sight'],pattern:3},
 undertow:{name:'Blue Trench',type:'blueprint',weapon:'LT',colors:['#2c535a','#1b394e','#a3e7dd'],parts:['Laser Sight','Fast Hands'],pattern:5},
 dusk:{name:'Dusk Engine',type:'blueprint',weapon:'PD',colors:['#615467','#302c4c','#f2b3ca'],parts:['Long Barrel','Compensator'],pattern:8}
};
Object.assign(IDR_CARDS,{
 signal:{name:'Signal Fire',ink:'#f79465',shade:'#64434c',art:'M197 59 213 53 229 39 245 41 265 16 276 33 290 31 313 59Z M256 8 267 1 279 6 268 13Z'},
 afterglow:{name:'Afterglow',ink:'#e9a4ea',shade:'#633859',art:'M203 58 215 52H315L325 58ZM216 47H321L310 43H227ZM231 39H304L295 35H240ZM246 30H290L284 26H253ZM257 20H279L268 9Z'}
});
Object.assign(IDR_PRESETS,{
 compass:{name:'Wayfinder',layers:[[4,7,50,50,96,0,100],[10,6,50,50,82,0,100],[2,2,50,50,36,15,100]]},
 vector:{name:'Split Vector',layers:[[2,9,39,50,70,0,100],[2,3,61,50,70,0,100],[6,0,50,50,64,14,100]]}
});
function passChapterArt(chapter,slot){
 const symbol=IDR_SHAPES[(chapter*3+slot*5)%IDR_SHAPES.length][1],echo=IDR_SHAPES[(chapter*7+slot+3)%IDR_SHAPES.length][1];
 const x=211+slot*6,y=7-slot*2;
 return '<g transform="translate('+x+' '+y+') scale(.5)"><path d="'+symbol+'"/>'+
  '<path transform="translate(64 21) scale(.65)" opacity=".42" d="'+echo+'"/></g>'+
  '<path d="M166 '+(49-slot*3)+'H213L237 33M232 55H312" fill="none" stroke="currentColor" opacity=".62"/>';
}
function passAddReward(chapter,slot,free=false){
 const [,ink,shade,...names]=PASS_CHAPTERS[chapter];
 const name=free?names[(slot+3)%names.length]+' Patch':names[slot],id='s1-'+(free?'free-':'')+(chapter*10+slot+1);
 if(free){
  const symbol=(chapter*4+slot)%IDR_SHAPES.length,tone=(chapter+slot*2)%IDR_COLORS.length;
  IDR_PRESETS[id]={name,layers:[[3,tone,50,50,94,0,100],[4,1,50,50,72,chapter*13,100],[symbol,(tone+5)%IDR_COLORS.length,50,49,57,slot*7-45,100]]};
  return ['emblem',id];
 }
 if(slot<4||slot===7||slot===9){
  IDR_CARDS[id]={name,ink:'#'+ink,shade:'#'+shade,composition:passChapterArt(chapter,slot)};
  return ['card',id];
 }
 if(slot!==8){
  const tone=(chapter*3+slot)%IDR_COLORS.length,accent=(tone+4)%IDR_COLORS.length;
  IDR_PRESETS[id]={name,layers:[
   [(chapter+slot)%IDR_SHAPES.length,tone,50,50,96,(chapter%5-2)*14,100],
   [(chapter*2+slot+5)%IDR_SHAPES.length,1,50,50,74,(slot%3-1)*22,100],
   [(chapter*3+slot+2)%IDR_SHAPES.length,accent,50+(slot%3-1)*12,50-(chapter%3-1)*8,49,chapter*11-44,100]
  ]};
  return ['emblem',id];
 }
 PASS_FINISHES[id]={name,type:'camo',colors:['#'+shade,'#1b2731','#'+ink],pattern:chapter};
 return ['camo',id];
}
for(let i=0;i<100;i++){
 const chapter=Math.floor(i/10),slot=i%10,special=PASS_SPECIAL[i+1];
 PASS_TRACK.push({premium:special?.premium||passAddReward(chapter,slot),free:special?.free||((slot===1||slot===6)?passAddReward(chapter,slot,true):null),bonus:special?.bonus||[]});
}
function passRewardTier(type,id){
 return PASS_TRACK.findIndex(t=>[t.free,t.premium,...t.bonus].some(reward=>reward?.[0]===type&&reward[1]===id))+1;
}
try{
 const saved=JSON.parse(localStorage.getItem('sd-identity'));
 idrSaved={...idrRead(saved),layers:idrLayers(saved?.layers)};
}catch(e){}
const PASS_EMOTES={
 8:{name:'Ground Check',length:3.4,path:'<path d="M5 24h23M10 20l5-8 8 1 4 6M18 12l-3 7-5 4"/><circle cx="21" cy="6" r="3"/>'},
 9:{name:'Route Signal',length:3.2,path:'<circle cx="11" cy="9" r="3"/><path d="M11 13v9m0-7 13-6m-5-2 5 2-3 4M11 22l-4 6m4-6 4 6"/>'},
 10:{name:'Sparks',length:3.6,path:'<path d="M16 2v9m0 10v9M2 16h9m10 0h9M5 5l6 6m10 10 6 6M5 27l6-6m10-10 6-6"/>'}
};

function passInteger(value,min,max){return Number.isInteger(value)?cl(value,min,max):min}
const passNew=()=>({xp:0,bux:PASS_PRICE,premium:false,grants:0,operator:'recruit',emote:7,finish:'',charm:'',title:'',tracer:'',blueprints:{}});
function passLoad(){
 try{
  const saved=JSON.parse(localStorage.getItem('sd-season-1'));
  if(!saved)return passNew();
  return {
   xp:passInteger(saved.xp,0,PASS_TRACK.length*PASS_XP),bux:passInteger(saved.bux,0,1000000),
   premium:saved.premium===true,grants:passInteger(saved.grants,0,5),operator:operatorId(saved.operator),
   emote:passInteger(saved.emote,7,10),charm:idrExtra('charm',saved.charm),title:idrExtra('title',saved.title),tracer:idrExtra('tracer',saved.tracer),finish:typeof saved.finish==='string'?saved.finish:'',
   blueprints:saved.blueprints&&typeof saved.blueprints==='object'?saved.blueprints:{}
  };
 }catch(e){return passNew()}
}
let pass=passLoad();
function passTier(state=pass){return Math.floor(state.xp/PASS_XP)}
function passOwns(type,id){
 return PASS_TRACK.some(({free,premium,bonus},tier)=>tier<passTier()&&
  (free?.[0]===type&&free[1]===id||pass.premium&&[premium,...bonus].some(([kind,key])=>kind===type&&key===id)));
}
function passExtra(type){return passOwns(type,pass[type])?pass[type]:''}
function passTracer(){return mode!=='Zombies'?PASS_TRACERS[passExtra('tracer')]?.color:undefined}
function lockerOwns(type,id){
 return type==='operator'&&(id==='recruit'||hasOwn(ZQUEST_OPERATORS,id)&&prof.zquest?.[id]===true)||passOwns(type,id);
}
function passOperator(){return lockerOwns('operator',pass.operator)?pass.operator:'recruit'}
function passEmote(){return mode!=='Zombies'&&passOwns('emote',pass.emote)?pass.emote:7}
function passGrant(draft){
 if(draft.premium){
  const count=PASS_TRACK.slice(0,passTier(draft)).filter(t=>t.premium[0]==='bux').length;
  draft.bux+=Math.max(0,count-draft.grants)*200;
  draft.grants=Math.max(count,draft.grants);
 }
 return draft;
}
function passSave(draft){
 try{localStorage.setItem('sd-season-1',JSON.stringify(draft))}catch(e){return false}
 pass=draft;return true;
}
function passFinishMatch(result){
 if(mode==='Zombies'||result==='Disconnected'||t0<15)return;
 const oldTier=passTier(),reward=25+(won?25:0);
 const earned=Math.min(500,70+Math.floor(t0/2)+kills*14+(won?75:0));
 const draft=passGrant({...pass,xp:Math.min(PASS_TRACK.length*PASS_XP,pass.xp+earned),bux:pass.bux+reward});
 if(!passSave(draft))return;
 MST.season={earned,reward,tiers:passTier()-oldTier};
}
/* Stormwatch uses the same renderer, locker, loadout and season ledger. */
let stormwatch=null,stormwatchHub=null;
function stormwatchGear(){
 const look=idrLocal(),{model,rig}=studioHuman(look.operator);
 function weapon(k,list=[]){
  const attachments=passAttachments(k,list);
  const blueprint=passWeaponData(k);
  const finish=blueprint?pass.blueprints[k]:passOwns('camo',pass.finish)?pass.finish:'';
  const normal=prof.camo[k],camo=finish?'pass/'+finish:allCamos(k).some(c=>c.ok&&c.n===normal)?normal:'';
  const skin=camoRm(k,camo),gun=buildGun(k,skin,true);
  gun.traverse(part=>{
   if(!part.isMesh)return;
   if(!part.geometry.boundingBox)part.geometry.computeBoundingBox();
   const {min,max}=part.geometry.boundingBox;
   if(min.toArray().some(n=>!Number.isFinite(n))||max.toArray().some(n=>!Number.isFinite(n))||
    part.position.toArray().some(n=>!Number.isFinite(n))||part.scale.toArray().some(n=>!Number.isFinite(n)))part.visible=false;
  });
  attApply(gun,k,attachments,1);
  addPassCharm(gun,look.charm);
  const barrel=attMuzzle(gun,1),muzzle=new THREE.Group();
  const exit=weaponMuzzleLocal(gun),tip=exit.z;
  muzzle.position.set(exit.x,exit.y,exit.z+.012);
  const fit=gun.userData.fit;
  if(!Number.isFinite(fit.s+fit.gz+fit.mz)){
   const anchor=gun.userData.a||{},rz=anchor.r?.[2]||0,lz=anchor.l?.[2]||rz+.4;
   const min=Number.isFinite(barrel.bb.min.z)?barrel.bb.min.z:rz-.25;
   const scale=Math.min(1,.62/Math.max(.3,lz-min),1/Math.max(.2,tip-min));
   gun.userData.fit={s:scale,gz:min<-.18?.1-min*scale:.46-rz*scale,mz:tip};
  }
  gun.add(muzzle);model.add(gun);
  return {k,model:gun,muzzle,stats:eff(k,attachments),icon:wImg(k),name:blueprint?.name||W[k].n,camo};
 }
 const weapons=[];
 if(hasOwn(W,L.p))weapons.push(weapon(L.p,L.pa));
 if(hasOwn(W,L.s))weapons.push(weapon(L.s,L.sa));
 const loot=['VA','KTS','LT','HC','PD','RD','BR','BP'].filter(k=>hasOwn(W,k)).map(k=>({k,name:W[k].n}));
 const avatar={m:model,rig,i:0,net:true,em:-1};
 const emote=passOwns('emote',pass.emote)?pass.emote:0;
 return {
  model,weapons,loot,weapon,operator:look.operator,
  teammate(id){
   const {model,rig}=studioHuman(operatorId(id)),mate={m:model,rig,i:11,net:true,em:-1};
   return {model,pose(pos,angle,moving,dt){
    Object.assign(mate,{x:pos.x,y:pos.y,z:pos.z,tyaw:angle+Math.PI,ry:angle+Math.PI});
    animBot(mate,Math.max(.001,dt));model.rotation.y-=angle;
   }};
  },
  canForge:key=>hasOwn(W,key),tracer:PASS_TRACERS[look.tracer]?.color,emoteLength:EMLEN[emote],
  profile:idrPlate(look,hname(),PASS_TITLES[look.title]?.name),
  pose(input,weapon,dt,grip){
   avatar.x=input.pos.x;avatar.y=input.pos.y;avatar.z=input.pos.z;
   avatar.tyaw=avatar.ry=input.yaw+Math.PI;
   avatar.pi=input.pitch;avatar.aj=!input.ground;
   avatar.hg=weapon?.model;avatar.wk=weapon?.k;avatar.hold=avatar.hg?.userData.fit;
   avatar.rlOn=input.reload>0;avatar.rlt=avatar.rlOn?Math.max(0,weapon.stats.rl-input.reload-dt):0;
   model.position.set(0,0,0);
   animBot(avatar,Math.max(.001,dt));
   model.rotation.y-=input.yaw;
   if(input.emote>0){
    const pose=emoPose(rig,emote,EMLEN[emote]-input.emote,EMLEN[emote]);
    model.position.y=pose.y;model.rotation.y+=pose.ry;
   }else{
    rig.legL.rotation.z=rig.legR.rotation.z=0;
    if(grip){
     const local=v=>V(-v.x,v.y,-v.z),axis=local(grip.axis);
     rig.sh.rotation.z=grip.phase*.10;
     gripArm(shPos(rig,1),local(grip.right),V(.62,-.68,-.19),rig.armR,axis,1);
     gripArm(shPos(rig,-1),local(grip.left),V(-.58,-.76,-.14),rig.armL,axis,-1);
    }else if(!weapon){
     ik(shPos(rig,1),V(.29,1.16,.27),V(.6,-.7,-.3),rig.armR);
     ik(shPos(rig,-1),V(-.27,1.16,.28),V(-.6,-.8,-.3),rig.armL);
    }
   }
   camoFx();
  }
 };
}
function stormwatchGoHome(focus=true){
 const home=$('#home'),menu=$('#menu');
 stormwatch?.close();stormwatch=null;stormwatchHub?.close();stormwatchHub=null;
 if(partyActive&&partyOperationOpen){partyOperationOpen=false;partyStatus()}
 document.body.classList.remove('stormwatch-open');home.inert=menu.inert=false;
 if(focus)$('#hsw').focus({preventScroll:true});
}
function stormwatchOpen(){
 if(stormwatchHub)return;
 const home=$('#home'),menu=$('#menu');
 home.inert=menu.inert=true;document.body.classList.add('stormwatch-open');
 const local=window.SD_SPLIT?.app==='sw';
 stormwatchHub=StormwatchHub.mount({
  name:$('#nm').value.trim()||'Operator',canEquip:key=>hasOwn(W,key),exit:stormwatchGoHome,
  ...(local?{local:true,exit:()=>parent.postMessage('stormwatch-exit-split',location.origin),connectSquad:stormwatchSplitAdapter}:
   {split:!partyActive&&location.protocol!=='file:'&&typeof BroadcastChannel==='function'?()=>launchSplit({app:'sw'}):null,
    connectSquad:partyActive?partyStormwatchAdapter:null}),
  clearMission(){stormwatch?.close();stormwatch=null},
  deploy(settings,back){
   let cleared=0,bonusAwarded=false;
   try{
    stormwatch=Stormwatch.mount({
     ...settings,hub:true,local,renderer:R,gear:stormwatchGear(),tier:passTier(),
     config:{sensitivity:+$('#sn').value,quality:local?'low':gfxQ,pad:PG.pref,vibration:!!HAP.on},
     award(wave,bonus){
      if(wave!==cleared+1||wave>5)return;
      const bonusEarned=bonus&&!bonusAwarded;
      const xp=100+wave*20+(bonusEarned?100:0)+(wave===5?200:0);
      const old=pass.xp,next=Math.min(PASS_TRACK.length*PASS_XP,old+xp);
      const saved=next===old||passSave(passGrant({...pass,xp:next}));
      cleared=wave;
      if(saved&&bonusEarned)bonusAwarded=true;
      return {saved,xp:saved?next-old:0,tier:passTier()};
     },
     leave(action){
      stormwatch?.close();stormwatch=null;
      if(action==='pass'){stormwatchGoHome();setApp('mp');openMenuPanel('pass');return}
      back();
     }
    });
   }catch(error){
    document.querySelector('#stormwatch-mode')?.remove();
    back();console.error('Stormwatch deployment',error);
   }
  }
 });
}
$('#hsw').disabled=!!window.SD_SPLIT;
$('#hsw').onclick=()=>stormwatchOpen();
const passMaterials=new Map();
function passCamoMaterial(k,name){
 if(typeof name!=='string'||!name.startsWith('pass/'))return;
 const id=name.slice(5),finish=hasOwn(PASS_FINISHES,id)&&PASS_FINISHES[id];
 if(!finish||(finish.weapon&&finish.weapon!==k))return;
 if(!passMaterials.has(id)){
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  const g=cv.getContext('2d'),[base,shadow,accent]=finish.colors;
  g.fillStyle=base;g.fillRect(0,0,128,128);
  g.fillStyle=shadow;
  if(id==='tideline'){
   for(let i=-1;i<9;i++){
    g.beginPath();g.moveTo(-4,i*18);g.bezierCurveTo(28,i*18-17,76,i*18+13,132,i*18-6);
    g.lineTo(132,i*18);g.bezierCurveTo(83,i*18+17,29,i*18-10,-4,i*18+10);g.fill();
   }
  }else if(id==='fracture'){
   for(let i=0;i<8;i++){
    const x=(i*43)%128,y=(i*29)%128;
    g.beginPath();g.moveTo(x-23,y-18);g.lineTo(x+24,y-7);g.lineTo(x+3,y+28);g.closePath();g.fill();
   }
  }else if(Number.isInteger(finish.pattern)){
   const variant=finish.pattern;
   g.lineWidth=1.7+(variant%3);
   for(let i=0;i<19;i++){
    const x=(i*(variant*4+19))%136,y=(i*(variant*6+23))%128,r=8+(i*(variant+2))%31;
    g.strokeStyle=i%3===0?accent:shadow;
    g.fillStyle=g.strokeStyle;g.beginPath();
    switch(variant%5){
     case 0:g.ellipse(x,y,r,r*.6,variant/4,0,Math.PI*2);g.stroke();break;
     case 1:g.moveTo(x-r,y+r);g.lineTo(x,y-r);g.lineTo(x+r,y+r);g.stroke();break;
     case 2:g.moveTo(x-r,y);g.lineTo(x,y-r);g.lineTo(x+r,y);g.lineTo(x,y+r);g.closePath();g.fill();break;
     case 3:g.moveTo(x-r,y+r);g.quadraticCurveTo(x+r,y+r,x+r,y-r);g.stroke();break;
     case 4:g.rect(x-r,y-r,r,r*.6);g.stroke();break;
    }
   }
  }else{
   for(let i=-3;i<8;i++){g.save();g.translate(i*27,0);g.transform(1,0,-.55,1,0,0);g.fillRect(0,0,id==='ember'?16:8,128);g.restore()}
  }
  g.fillStyle=accent;
  for(let i=0;i<10;i++){const x=(i*31)%126,y=(i*19)%126;g.fillRect(x,y,id==='fracture'?2:12,id==='fracture'?9:2)}
  const texture=new THREE.CanvasTexture(cv);
  passMaterials.set(id,new THREE.MeshLambertMaterial({map:texture,color:0xffffff}));
 }
 return passMaterials.get(id);
}
function passWeaponData(k){
 const id=pass.blueprints[k];
 if(typeof id==='string'&&PASS_FINISHES[id]?.weapon===k&&passOwns('blueprint',id))return PASS_FINISHES[id];
}
function passFinish(k){
 if(app!=='mp'||(run&&mode==='Zombies')||sel.mode==='Zombies')return '';
 const blueprint=pass.blueprints[k];
 if(passWeaponData(k))return 'pass/'+blueprint;
 return passOwns('camo',pass.finish)?'pass/'+pass.finish:'';
}
function passAttachments(k,list){
 if(mode==='Zombies')return list;
 const blueprint=passWeaponData(k);
 return blueprint?Array.from(new Set([...list,...blueprint.parts])):list;
}
function passName(type,id){
 switch(type){
  case 'operator':return OPERATORS[id].name;
  case 'card':return IDR_CARDS[id].name;
  case 'emblem':return IDR_PRESETS[id].name;
  case 'emote':return PASS_EMOTES[id].name;
  case 'camo':case 'blueprint':return PASS_FINISHES[id].name;
  case 'charm':case 'title':case 'tracer':return PASS_EXTRAS[type][id].name;
  case 'bux':return id+' Mehrbod Bux';
 }
}
const PASS_TYPE={operator:'Operator',card:'Calling card',emblem:'Emblem',emote:'Emote',camo:'Camo',blueprint:'Blueprint',charm:'Weapon charm',title:'Player title',tracer:'Tracer finish',bux:'Currency'};
let passPage=0,passPick=0,passLane='premium';
function passArt(type,id,detail=false){
 switch(type){
  case 'card':{
   const card=IDR_CARDS[id];
   return '<span class="idr-art-frame" style="--idr-ink:'+card.ink+';--idr-shade:'+card.shade+'">'+idrCardArt(card)+'</span>';
  }
  case 'emblem':return '<span class="idr-badge">'+idrEmblemArt(IDR_PRESETS[id].layers)+'</span>';
  case 'operator':return detail?studioMarkup(type,id):'<span class="pass-icon" aria-hidden="true">◈</span>';
  case 'camo':if(detail)return studioMarkup(type,id);return '<span class="pass-swatch" style="--sw-a:'+PASS_FINISHES[id].colors[0]+';--sw-b:'+PASS_FINISHES[id].colors[1]+';--sw-c:'+PASS_FINISHES[id].colors[2]+'"></span>';
  case 'blueprint':return detail?studioMarkup(type,id):'<span class="pass-icon" aria-hidden="true">⌁</span>';
  case 'emote':return detail?studioMarkup(type,id):'<svg class="pass-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'+PASS_EMOTES[id].path+'</svg>';
  case 'charm':return detail?studioMarkup(type,id):'<span class="pass-icon" aria-hidden="true">◇</span>';
  case 'title':return '<span class="pass-title-art">✦ '+PASS_TITLES[id].name+'</span>';
  case 'tracer':return '<span class="pass-tracer-art" style="--pass-tracer:#'+PASS_TRACERS[id].color.toString(16)+'"></span>';
  case 'bux':return '<span class="pass-icon pass-coin" aria-hidden="true">M</span>';
 }
}
function passRender(focus){
 const tier=passTier(),pos=pass.xp%PASS_XP,total=PASS_TRACK.length,pages=Math.ceil(total/PASS_PAGE_SIZE),start=passPage*PASS_PAGE_SIZE;
 const [type,id]=PASS_TRACK[passPick][passLane],earned=tier>passPick,ready=earned&&(passLane==='free'||pass.premium);
 const capstone=passPick===99&&passLane==='premium';
 const desc=capstone?'The Apex field kit includes the Apex Transponder charm and Beyond the Horizon title.':
  type==='blueprint'?W[PASS_FINISHES[id].weapon].n+' · '+PASS_FINISHES[id].parts.join(' + '):
  type==='bux'?'Added to your wallet when you earn this tier.':'Equip this reward in the Locker once unlocked.';
 function reward(item,index,lane){
  if(!item)return '<div class="pass-empty" aria-hidden="true"></div>';
  const [type,id]=item,ready=index<tier&&(lane==='free'||pass.premium),picked=index===passPick&&lane===passLane;
  return `<button class="pass-reward ${lane}${ready?' owned':''}" data-pass-tier="${index}" data-pass-lane="${lane}" aria-pressed="${picked}"
   aria-label="${(lane==='free'?'Free':'Premium')+' tier '+(index+1)+', '+PASS_TYPE[type]+' '+passName(type,id)+(ready?', unlocked':', locked')}">
   <span class="reward-art">${passArt(type,id)}</span><b>${passName(type,id)}</b>${ready?'<small aria-hidden="true">✓</small>':''}</button>`;
 }
 const section=$('#p-pass'),scroll=section.scrollTop,trackScroll=section.querySelector('.pass-track')?.scrollLeft||0;
 section.innerHTML=`<header class="panel-head pass-header"><div><p class="eyebrow">Season 01</p><h2>Battle Pass</h2></div>
  <div class="pass-wallet"><div><span>Mehrbod Bux</span><strong>${pass.bux.toLocaleString()}</strong></div>
  <button class="big${pass.premium?' alt':''}" data-pass-buy${pass.premium||pass.bux<PASS_PRICE?' disabled':''}>${pass.premium?'Premium active':'Unlock Premium · 1,000'}</button></div></header>
  <div class="pass-preview${capstone?' pass-capstone':''}"${capstone?' data-map-art="Dry Dock"':''}><div class="pass-preview-art">${passArt(type,id,true)}</div>
  <div class="pass-preview-info"><div class="mode-label"><i></i>${'Tier '+(passPick+1)+' · '+(passLane==='free'?'Free':'Premium')+' · '+PASS_TYPE[type]}</div>
  <h3>${passName(type,id)}</h3><p>${desc}</p><span class="pass-unlock">${ready?'Unlocked':earned?'Premium required':'Locked'}</span></div>
  <div class="pass-season"><span>After the Signal</span><button class="text-button" data-pass-final>Tier 100 reward <span aria-hidden="true">↗</span></button></div></div>
  <div class="pass-controls"><div class="pass-progress">
   <div><b>Tier ${tier} / ${total}</b><span>${tier===total?'Pass complete':pos+' / '+PASS_XP+' XP'}</span></div>
   <progress aria-label="XP to next Battle Pass tier" value="${tier===total?PASS_XP:pos}" max="${PASS_XP}"></progress>
  </div><div class="pass-page-tools">
   <button class="idr-button" aria-label="Previous chapter" data-pass-step="-1" ${passPage===0?'disabled':''}>‹</button>
   <select id="pass-page" aria-label="Reward chapter">${PASS_CHAPTERS.map(([name],i)=>`<option value="${i}"${i===passPage?' selected':''}>${name} · ${(i*10+1)+'–'+(i*10+10)}</option>`).join('')}</select>
   <button class="idr-button" aria-label="Next chapter" data-pass-step="1" ${passPage===pages-1?'disabled':''}>›</button>
  </div></div>
  <div class="pass-board"><div class="pass-lanes" aria-hidden="true"><span>Tier</span><b>Free</b><b>Premium</b></div>
   <ol class="pass-track" start="${start+1}">${PASS_TRACK.slice(start,start+PASS_PAGE_SIZE).map((r,i)=>{
     const index=start+i;
     return `<li class="${index<tier?'complete':''}"><b class="pass-tier">${index+1}</b>${reward(r.free,index,'free')}${reward(r.premium,index,'premium')}</li>`;
    }).join('')}</ol></div>
  <div class="pass-foot"><span>Earn XP in Multiplayer matches and Stormwatch waves.</span><span>Earn up to 1,000 Bux back on Premium.</span></div><p id="pass-note" role="status"></p>`;
 section.scrollTop=scroll;
 section.querySelector('.pass-track').scrollLeft=focus==='#pass-page'?0:trackScroll;
 if(focus){
  const target=section.querySelector(focus);
  target?.focus({preventScroll:true});
  if(target?.matches('[data-pass-tier]'))target.scrollIntoView({block:'nearest',inline:'nearest'});
 }
}
const LOCKER_GROUPS={
 operators:['Operators',['operator']],weapon:['Weapon finishes',['camo','blueprint']],
 emotes:['Emotes',['emote']],charms:['Weapon charms',['charm']],titles:['Player titles',['title']],tracers:['Tracer finishes',['tracer']]
};
let lockerGroup='operators',lockerSelection=['operator',null];
function lockerList(group){
 const types=LOCKER_GROUPS[group][1];
 if(types[0]==='operator')return Object.keys(OPERATORS).map(id=>['operator',id]);
 if(types[0]==='camo')return Object.entries(PASS_FINISHES).map(([id,f])=>[f.type,id]);
 if(types[0]==='emote')return Object.keys(PASS_EMOTES).map(id=>['emote',Number(id)]);
 return Object.keys(PASS_EXTRAS[types[0]]).map(id=>[types[0],id]);
}
function lockerEquipped(type,id){
 if(type==='operator')return passOperator()===id;
 if(type==='emote')return pass.emote===id&&passOwns(type,id);
 if(type==='camo')return pass.finish===id&&passOwns(type,id);
 if(type==='blueprint')return passWeaponData(PASS_FINISHES[id].weapon)===PASS_FINISHES[id];
 return passExtra(type)===id;
}
function passLocker(){
 const choices=lockerList(lockerGroup);
 if(lockerGroup==='operators')choices.sort((a,b)=>(passRewardTier(...a)||(a[1]==='recruit'?0:101))-(passRewardTier(...b)||(b[1]==='recruit'?0:101)));
 if(!choices.some(([t,id])=>t===lockerSelection[0]&&id===lockerSelection[1]))lockerSelection=choices.find(([t,id])=>lockerEquipped(t,id))||choices[0];
 const [type,id]=lockerSelection,active=lockerEquipped(type,id),ready=lockerOwns(type,id);
 const name=passName(type,id),tier=passRewardTier(type,id),quest=type==='operator'?ZQUEST_OPERATORS[id]:null;
 const lock=quest?'Complete the '+quest+' main quest':!pass.premium&&tier<=passTier()?'Premium required':'Unlock at tier '+tier;
 const detail=type==='blueprint'?W[PASS_FINISHES[id].weapon].n+' · '+PASS_FINISHES[id].parts.join(' + '):
  type==='emote'?'Emote wheel slot 8':type==='charm'?'Mounted on your weapon':type==='title'?'Displayed on your player card':
  type==='tracer'?'Bullet trail color':type==='camo'?'Multiplayer weapon finish':quest?quest+' quest reward':'Operator';
 const tiles=choices.map(([kind,key])=>{
  const equipped=lockerEquipped(kind,key),open=lockerOwns(kind,key),selected=kind===type&&key===id;
  return '<button class="pass-gear locker-tile" data-locker-view="'+kind+'" data-gear-id="'+key+'" aria-pressed="'+selected+'">'+
   (kind==='operator'?'<canvas data-operator-thumb="'+key+'" width="88" height="76" aria-hidden="true"></canvas>':passArt(kind,key))+'<b>'+passName(kind,key)+'</b><small>'+(equipped?'Equipped':open?'Owned':kind==='operator'&&hasOwn(ZQUEST_OPERATORS,key)?'Quest reward':'Tier '+passRewardTier(kind,key))+'</small></button>';
 }).join('');
 return '<div class="locker-showcase"><aside class="locker-feature"><div class="locker-model">'+passArt(type,id,true)+'</div>'+
  '<div class="locker-details"><span class="eyebrow">'+PASS_TYPE[type]+'</span><strong>'+name+'</strong><p>'+detail+'</p>'+
  '<button class="idr-button studio-primary" data-gear="'+type+'" data-gear-id="'+id+'"'+(!ready||active&&type==='operator'?' disabled':'')+'>'+
  (!ready?lock:active?(type==='operator'?'Equipped':'Unequip'):'Equip')+'</button></div></aside>'+
  '<div class="locker-catalog"><div class="pass-gear-grid">'+tiles+'</div></div></div>';
}
function passEquip(type,key){
 const id=type==='emote'?Number(key):key;
 if(!lockerOwns(type,id))return;
 const draft={...pass};
 if(type==='operator')draft.operator=id;
 if(type==='emote')draft.emote=pass.emote===id?7:id;
 if(hasOwn(PASS_EXTRAS,type))draft[type]=pass[type]===id?'':id;
 if(type==='camo')draft.finish=pass.finish===id?'':id;
 if(type==='blueprint'){
  const key=PASS_FINISHES[id].weapon;
  draft.blueprints={...pass.blueprints,[key]:pass.blueprints[key]===id?'':id};
 }
 if(!passSave(draft)){$('#idr-status').textContent='Browser storage is unavailable.';return}
 if((type==='operator'||hasOwn(PASS_EXTRAS,type))&&net){netSend({t:'identity',look:idrLocal()});lobbyList()}
 idrRender('[data-gear="'+type+'"][data-gear-id="'+id+'"]');
 $('#idr-status').textContent='Locker updated.';
}
$('#nav [data-p=pass]').addEventListener('click',()=>passRender());
$('#p-pass').addEventListener('click',event=>{
 const button=event.target.closest('button');
 if(!button||button.disabled)return;
 if(button.dataset.passTier!==undefined){
  passPick=Number(button.dataset.passTier);passLane=button.dataset.passLane;
  passRender('[data-pass-tier="'+passPick+'"][data-pass-lane="'+passLane+'"]');
 }else if(button.hasAttribute('data-pass-final')){
  passPick=PASS_TRACK.length-1;passPage=Math.floor(passPick/PASS_PAGE_SIZE);passLane='premium';
  passRender('[data-pass-final]');
  const track=$('#p-pass .pass-track');track.scrollLeft=track.scrollWidth;
 }else if(button.dataset.passStep){
  passPage+=Number(button.dataset.passStep);passPick=passPage*PASS_PAGE_SIZE;passLane='premium';
  passRender('#pass-page');
 }else if(button.hasAttribute('data-pass-buy')&&!pass.premium&&pass.bux>=PASS_PRICE){
  if(passSave(passGrant({...pass,premium:true,bux:pass.bux-PASS_PRICE}))){
   passRender();$('#pass-note').textContent='Premium active. Earned Premium rewards are in your Locker.';
  }else $('#pass-note').textContent='Browser storage is unavailable.';
 }
});
$('#p-pass').addEventListener('change',event=>{
 if(event.target.id!=='pass-page')return;
 passPage=Number(event.target.value);passPick=passPage*PASS_PAGE_SIZE;passLane='premium';
 passRender('#pass-page');
});

/* Local split screen uses the same match rules and packet handlers as a private match. */
const sdSplit=window.SD_SPLIT;
function splitPads(){
 try{return [...(navigator.getGamepads?.()||[])].filter(g=>g?.connected&&g.axes.length>=4)}catch(e){return []}
}
function launchSplit(settings){
 StormwatchHub.launchLocal(settings,new URL(location.href));
}
class SplitEvents{
 constructor(){this.events=new Map()}
 on(name,fn){if(!this.events.has(name))this.events.set(name,[]);this.events.get(name).push(fn);return this}
 emit(name,value){for(const fn of this.events.get(name)||[])fn(value)}
}
class SplitLink extends SplitEvents{
 constructor(owner,peer){super();this.owner=owner;this.peer=peer;this.open=false;this.timer=0}
 accept(){if(this.open)return;clearInterval(this.timer);this.open=true;this.emit('open')}
 send(packet){if(this.open)this.owner.post('data',this.peer,packet)}
 close(notify=true){
  clearInterval(this.timer);
  const existed=this.owner.links.delete(this.peer);
  if(!existed)return;
  this.open=false;
  if(notify)this.owner.post('close',this.peer);
  queueMicrotask(()=>this.emit('close'));
 }
}
class SplitPeer extends SplitEvents{
 constructor(id){
  super();
  this.host=!!id;this.id=id||'local-seat-2';this.links=new Map();this.open=false;
  this.channel=new BroadcastChannel('spartan-split:'+sdSplit.room);
  this.channel.onmessage=event=>this.receive(event.data);
  queueMicrotask(()=>{this.open=true;this.emit('open',this.id)});
 }
 post(type,to,packet){this.channel.postMessage({type,from:this.id,to,packet})}
 receive({type,from,to,packet}){
  if(to!==this.id||from===this.id)return;
  let link=this.links.get(from);
  if(type==='join'&&this.host){
   if(!link){link=new SplitLink(this,from);this.links.set(from,link);this.emit('connection',link)}
   this.post('accepted',from);link.accept();
  }else if(type==='accepted'&&link){
   link.accept();
  }else if(type==='data'&&link?.open){
   link.emit('data',packet);
  }else if(type==='close'&&link){
   link.close(false);
  }
 }
 connect(id){
  if(this.links.has(id))return this.links.get(id);
  const link=new SplitLink(this,id);
  this.links.set(id,link);
  link.timer=setInterval(()=>this.post('join',id),350);
  this.post('join',id);return link;
 }
 reconnect(){}
 destroy(){this.open=false;for(const link of this.links.values())link.close();this.channel.close()}
}
function stormwatchSplitAdapter(update){
 const host=sdSplit.seat===1,hostId='local-stormwatch-host',guestId='local-seat-2';
 const peer=new SplitPeer(host?hostId:undefined),listeners=new Set();
 const names=new Map([[hostId,'Player 1'],[guestId,'Player 2']]);
 let link=null,round=0,starting=false;
 const notify=(data,id)=>{for(const fn of listeners)fn(data,id)};
 const status=()=>update({room:'local',isHost:host,connected:!!link?.open,starting,publicRoom:false,
  message:!link?.open?'Connecting both local seats…':host?'Player 1 chooses the operation.':'Waiting for Player 1 to deploy.',
  members:[...names].map(([id,name])=>({id,name,host:id===hostId}))});
 function attach(connection){
  if(connection.peer!==(host?guestId:hostId)){connection.close(false);return}
  link=connection;
  connection.on('open',status);
  connection.on('close',()=>{if(link===connection){link=null;starting=false;notify({type:host?'left':'lost'},connection.peer);status()}});
  peerPackets(connection,'type',data=>{
   if(data.type==='launch'&&!host&&Number.isSafeInteger(data.round)&&data.round>round&&data.spec){
    round=data.round;starting=true;notify(data,connection.peer);status();
   }else if(starting&&data.round===round&&data.type!=='launch'&&
     (!host||['pose','action','withdraw'].includes(data.type)))notify(data,connection.peer);
  },()=>connection.close());
 }
 peer.on('connection',attach);
 if(!host)peer.on('open',()=>attach(peer.connect(hostId)));
 return {id:peer.id,host,room:'local',size:2,names,status,
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)},
  send(data){sendPeerPacket(link,data)},direct(id,data){if(id===link?.peer)sendPeerPacket(link,data)},
  launch(spec){
   if(!host||!link?.open||starting)return false;
   starting=true;
   const data={type:'launch',round:++round,spec:{...spec,seed:crypto.getRandomValues(new Uint32Array(1))[0]}};
   sendPeerPacket(link,data);notify(data,peer.id);status();return true;
  },
  returns(){starting=false;status()},close(){listeners.clear();peer.destroy()}
 };
}
function bootSplitSeat(){
 document.body.classList.add('split-seat');
 if(sdSplit.app==='sw'){stormwatchOpen();return}
 $('#split-start').closest('.split-entry').hidden=true;
 $('#host').disabled=$('#join').disabled=true;
 $('#leave').hidden=true;
 const appMode=sdSplit.app==='zm'?'zm':'mp';
 setApp(appMode);
 const name=$('#nm');
 if(!localStorage.getItem('sdrill-name')){name.value='Player '+sdSplit.seat;profileHeading()}
 $('#nav button.'+appMode+'[data-p=priv]').click();
 if(sdSplit.seat===1){
  if([...$('#pmode').options].some(o=>o.value===sdSplit.mode))$('#pmode').value=sdSplit.mode;
  if([...$('#pm').options].some(o=>o.value===sdSplit.map))$('#pm').value=sdSplit.map;
  $('#pbots').value=passInteger(Number(sdSplit.bots),0,12);
  $('#pbots').dispatchEvent(new Event('input'));
  hostMatch(sdSplit.room.slice(0,5).toUpperCase());
  const wait=setInterval(()=>{
   if(conns.some(c=>c.vf)&&Object.keys(names).length>=2){clearInterval(wait);hostStart()}
  },150);
  addEventListener('pagehide',()=>clearInterval(wait),{once:true});
 }else{
  $('#jc').value=sdSplit.room.slice(0,5).toUpperCase();
  joinMatch();
 }
}
addEventListener('sd-ready',()=>{
 if(sdSplit){bootSplitSeat();return}
 if(new URLSearchParams(location.search).get('openStormwatch')==='1'){
  const url=new URL(location.href);url.searchParams.delete('openStormwatch');history.replaceState(null,'',url);
  stormwatchOpen();
 }
 const button=$('#split-start'),help=$('#split-help');
 if(typeof BroadcastChannel!=='function'){help.textContent='Local split screen needs a browser with BroadcastChannel support.';return}
 const update=()=>{
  const count=splitPads().length;
  button.disabled=count<2;
  help.textContent=count<2?'Connect two controllers and press a button on each.':'Two controllers ready. The selected host mode and map apply to both players.';
 };
 addEventListener('gamepadconnected',update);addEventListener('gamepaddisconnected',update);
 setInterval(()=>{if($('#p-priv.on')&&$('#menu').style.display!=='none')update()},750);
 button.onclick=()=>launchSplit({map:$('#pm').value,mode:$('#pmode').value,bots:$('#pbots').value,app});
 update();
});

/* Live menu studio. Only the visible showroom is drawn and it shares the arsenal renderer. */
const studio={scene:null,camera:null,content:null,key:'',yaw:.28,pitch:.07,last:0,entered:0,dirty:false};
const studioMotion=matchMedia('(prefers-reduced-motion:reduce)');
function studioMarkup(type,id){
 const label=passName(type,id)+' live preview';
 return '<div class="studio-stage"><canvas data-studio="'+type+'" data-studio-id="'+id+'" aria-label="'+esc(label)+'"></canvas>'+
  '<div class="studio-orbit"><button class="idr-button" data-orbit="-1" aria-label="Rotate left">‹</button><button class="idr-button" data-orbit="1" aria-label="Rotate right">›</button></div></div>';
}
function studioPane(){
 if(fin||R.xr?.isPresenting)return null;
 return $('#menu').style.display==='block'&&$('#menu .pn.on')||$('#home').style.display==='block'&&$('#home');
}
/* The staging bay and operators share a camera, lights and depth buffer. */
let lobbyBay=null;
function buildLobbyBay(){
 const bay=new THREE.Group(),shell=mkBake(MK.rnd(481));
 const steel=0x232b31,edges=0x3e4d54,bulkhead=0x182026,concrete=0x283338;
 const dark=0x10171d,amber=0xbf8439,cool=0xa8dbe1;
 const floorHeight=-.083;
 const beam=(x,y,z,w,h,d,color,roll=0)=>shell.box(x,y,z,w,h,d,color,'m',0,0,roll);
 const strut=(ax,ay,az,bx,by,bz,width,color)=>shell.rod(ax,ay,az,bx,by,bz,width,width,color,'m',4);

 // Steel decking, cable trenches and two painted clearance lanes.
 shell.bot(0,floorHeight-.26,-7,18,.22,27,concrete,'s');
 const deck=new THREE.InstancedMesh(new THREE.BoxGeometry(4.02,.06,4.02),gMat('metal',0x273139),28);
 const tileTransform=new THREE.Matrix4();
 deck.receiveShadow=true;
 let tile=0;
 for(let row=0;row<7;row++){
  const z=4-row*4.06;
  for(const x of [-6.1,-2.04,2.04,6.1]){
   deck.setMatrixAt(tile++,tileTransform.makeTranslation(x,floorHeight-.03,z));
   beam(x,floorHeight+.002,z+1.91,3.72,.004,.032,0x556267);
  }
  for(const x of [-2.4,2.4]){
   shell.box(x,floorHeight+.003,z,.05,.005,3.5,amber,'s');
   shell.box(x,floorHeight+.006,z-1.6,.08,.01,.22,0xa8d2ce,'e');
  }
 }
 deck.instanceMatrix.needsUpdate=true;
 bay.add(deck);
 for(const x of [-3.16,3.16]){
  beam(x,-.075,-6,.31,.026,22,dark);
  for(let z=-16;z<5;z+=.21)beam(x,-.059,z,.25,.023,.036,edges);
 }

 // Receding portal frames, ribs and warm ceiling fixtures.
 for(const [depth,z] of [-2.75,-6.8,-10.85,-14.9].entries()){
  for(const side of [-1,1]){
   const x=side*4.65;
   beam(x,2.1,z,.48,4.35,.52,bulkhead);
   beam(x-side*.23,2.06,z+.32,.12,4.3,.3,edges);
   beam(x,4.16,z,1.12,.26,.63,edges,side*.51);
   beam(x-side*.58,4.39,z,1.25,.22,.56,steel,side*.46);
   beam(x,.47,z+.37,.57,.94,.18,steel);
   for(let i=0;i<3;i++)beam(x,.2+i*.16,z+.477,.40,.038,.019,amber,-.24);
   shell.box(x-side*.26,1.66,z+.385,.15,.13,.035,0xe9b665,'e');
   for(const y of [.51,2.31,3.7])shell.cyl(x+side*.125,y-.045,z+.285,.047,.047,.12,dark,'m',8,Math.PI/2);
  }
  beam(0,4.66,z,8.7,.4,.56,bulkhead);
  beam(0,4.42,z,7.7,.12,.28,edges);
  for(const x of [-2.88,2.88]){
   beam(x,4.32,z+.17,1.97,.12,.31,steel);
   shell.box(x,4.245,z+.18,1.82,.035,.14,depth%2?0x9fd0db:0xffcc83,'e');
  }
 }
 shell.bot(0,4.95,-8.5,19,.23,26,bulkhead,'m');

 // Catwalks, service walls and a deeper loading door behind the bay.
 for(const side of [-1,1]){
  const x=side*6.85,rail=side*4.96;
  shell.bot(x,0,-7.7,.38,5.3,24,bulkhead,'s');
  beam(side*5.77,2.68,-8.4,1.89,.16,17,steel);
  beam(rail,3.5,-8.4,.077,.082,17,amber);
  beam(rail,3.07,-8.4,.064,.063,17,edges);
  for(let z=-16.2;z<=-.4;z+=1.23){
   beam(rail,3.13,z,.071,.86,.076,edges);
   if(Math.round(z*10)%2===0)strut(side*5.8,2.63,z,side*6.63,1.78,z,.09,steel);
  }
  for(const z of [-2.3,-4.9,-7.5,-9.95,-12.55]){
   beam(side*6.53,1.5,z,.16,2.65,2.37,concrete);
   beam(side*6.45,1.13,z,.22,.27,2.32,dark);
  }
  for(const z of [-.95,-6.8,-12.15]){
   const cx=side*(z===-.95?5.45:4.97);
   shell.bot(cx,-.075,z,1.16,.72,1.24,0x4b5550,'s');
   beam(cx,.63,z,1.19,.10,1.28,steel);
   for(const offset of [-.41,.41])beam(cx+offset,.3,z+.63,.14,.58,.08,edges);
   shell.box(cx,.48,z+.67,.20,.13,.025,amber,'s');
  }
 }
 shell.bot(0,0,-18.95,16,5.4,.51,bulkhead,'s');
 beam(0,1.86,-18.62,7.26,3.72,.14,dark);
 for(let i=0;i<9;i++){
  const y=.3+i*.39;
  beam(0,y,-18.5,6.91,.33,.18,i%2===0?0x394955:0x34434b);
  beam(0,y+.182,-18.352,6.9,.032,.075,0x496775);
 }
 for(const side of [-1,1]){
  beam(side*3.58,2.03,-18.15,.52,4.23,.61,steel);
  shell.box(side*3.285,1.93,-17.83,.081,3.59,.045,cool,'e');
  shell.box(side*3.58,4.28,-17.79,.48,.104,.081,0xf1af67,'e');
 }
 beam(0,4.22,-18.03,7.78,.35,.78,steel);
 shell.box(0,4.16,-17.59,6.22,.048,.05,cool,'e');
 for(const x of [-2.42,2.42]){
  beam(x,5.06,-8.35,1.18,.22,13.5,dark);
  beam(x,4.9,-8.35,.95,.19,13.5,steel);
  for(let z=-14;z<=-2;z+=.21)beam(x,4.791,z,.82,.04,.059,edges);
 }

 for(const part of shell.build(bay)){
  part.castShadow=false;part.receiveShadow=true;
  part.updateMatrix();part.matrixAutoUpdate=false;
 }
 const blue=new THREE.PointLight(0x4fc9ef,2,21,1.43);
 blue.position.set(.73,2.74,-14.6);
 const work=new THREE.PointLight(0xffa64f,2.15,12,1.32);
 work.position.set(-2.83,3.69,-3.2);
 const edgeLight=new THREE.SpotLight(0xffcd86,1.85,10,Math.PI/6,.86,1.37);
 edgeLight.position.set(.62,3.47,-1.29);
 edgeLight.target.position.set(.7,.25,.22);
 bay.add(blue,work,edgeLight,edgeLight.target);
 return bay;
}

function studioInit(){
 studio.scene=new THREE.Scene();studio.camera=new THREE.PerspectiveCamera(34,1,.01,80);
 const ambient=new THREE.HemisphereLight(0xffead8,0x4f5359,.77),key=new THREE.DirectionalLight(0xffe5bf,1.12);
 const rim=new THREE.DirectionalLight(0xc3ddf6,.98),fill=new THREE.DirectionalLight(0xe4edf6,.24);
 key.position.set(3.4,4.3,3.8);rim.position.set(-4,1.8,-3);fill.position.set(-2,1.1,3.2);
 key.castShadow=true;key.shadow.mapSize.set(768,768);
 key.shadow.camera.left=key.shadow.camera.bottom=-2.1;
 key.shadow.camera.right=key.shadow.camera.top=2.1;
 key.shadow.camera.near=.1;key.shadow.camera.far=12;key.shadow.camera.updateProjectionMatrix();key.shadow.normalBias=.015;
 studio.scene.add(ambient,key,rim,fill);
}
const studioBase={
 geo:new THREE.LatheGeometry([[0,-.063],[.426,-.063],[.449,-.055],[.453,-.037],[.422,-.019],[.403,-.008],[0,-.008]].map(p=>new THREE.Vector2(...p)),44),
 ring:new THREE.TorusGeometry(.382,.0035,8,44),
 mat:new THREE.MeshLambertMaterial({color:0x252629,...(LX.pbr?{roughness:.43,metalness:.62}:{})}),
 on:new THREE.MeshBasicMaterial({color:0xca9060}),
 shadeGeo:new THREE.PlaneGeometry(1.6,1.6),
 shadeMat:null
};
function studioPad(x,z){
 const g=new THREE.Group(),base=new THREE.Mesh(studioBase.geo,studioBase.mat),rim=new THREE.Mesh(studioBase.ring,studioBase.on);
 if(!studioBase.shadeMat){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,8,32,32,32);
  gradient.addColorStop(0,'rgba(0,0,0,.85)');gradient.addColorStop(.55,'rgba(0,0,0,.52)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  studioBase.shadeMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false});
 }
 const shadow=new THREE.Mesh(studioBase.shadeGeo,studioBase.shadeMat);
 base.receiveShadow=true;
 shadow.rotation.x=-Math.PI/2;shadow.position.y=-.064;
 rim.position.y=-.006;rim.rotation.x=-Math.PI/2;g.position.set(x,0,z);g.add(shadow,base,rim);
 return g;
}
function studioHuman(id){
 const model=new THREE.Group(),rig=mkHuman(model,{operator:id,skin:0xc49a78,shirt:0x6a8d91});
 return {model,rig};
}
function lobbySeats(){
 const players=[{nm:$('#nm').value.trim()||'Player',look:idrLocal()}];
 if(net)for(const [id,nm] of Object.entries(names)){
  if(id!==myId)players.push({nm,look:peerLooks.get(id)||IDR_DEFAULT});
  if(players.length===4)break;
 }
 return players;
}
function studioBuild(type,id){
 const content=new THREE.Group(),hosts=[];
 const operator=(key,x,z,phase)=>{
  const actor=studioHuman(key);
  actor.model.position.set(x,0,z);content.add(actor.model,studioPad(x,z));
  actor.model.traverse(node=>{if(node.isMesh&&node.visible)node.castShadow=node.receiveShadow=true});
  hosts.push({...actor,phase});
 };
 let size=1.18,center=V(0,.93,0);
 if(type==='party'){
  if(!lobbyBay)lobbyBay=buildLobbyBay();
  content.add(lobbyBay);
  const players=lobbySeats(),count=players.length,layouts={1:[[0,0]],2:[[-.66,.14],[.72,-.22]],3:[[0,.28],[-1.23,-.2],[1.23,-.2]],4:[[-.49,.25],[.62,.02],[-1.48,-.47],[1.6,-.52]]};
  const positions=layouts[count];
  for(const [i,player] of players.entries()){
   const [x,z]=positions[i];
   operator(operatorId(player.look.operator),x,z,i*1.8);
  }
  size=count>2?1.87:count===2?1.43:1.18;
 }else if(type==='operator'||type==='emote'){
  operator(type==='operator'?operatorId(id):passOperator(),0,0,0);
 }else{
  const finish=PASS_FINISHES[id],weapon=finish?.weapon||L.p;
  const item=type==='charm'?passCharmModel(id):previewGun(weapon,finish?.parts||[],passCamoMaterial(weapon,'pass/'+id));
  content.add(item);
  const bounds=previewBounds(item),sphere=bounds.getBoundingSphere(new THREE.Sphere());
  center=sphere.center;size=Math.max(.025,sphere.radius);
 }
 return {content,hosts,center,size};
}
function studioIdle(time,actor,emote){
 const {rig,model,phase}=actor,t=time+phase,yaw=Math.sin(t*.85)*.10;
 if(emote!==null){
  const duration=EMLEN[emote],p=emoPose(rig,emote,t%(duration+.5),duration);
  model.position.y=p.y;model.rotation.y=p.ry;rig.sh.rotation.x=0;return;
 }
 const wave=Math.sin(t*1.7),weight=Math.sin(t*.46)*.019;
 rig.sh.rotation.set(.025+wave*.013,.086+yaw*.66,-.045+weight);
 rig.head.rotation.set(-.031,yaw*.57-.085,.017);
 const shoulder=side=>V(side*.287,.496,0).applyEuler(rig.sh.rotation).add(rig.sh.position);
 ik(shoulder(1),V(.23,.799+wave*.011,.135),V(.68,-.15,-.54),rig.armR);
 ik(shoulder(-1),V(-.235,.79-wave*.009,.061),V(-.66,-.22,-.55),rig.armL);
 rig.legL.rotation.set(.074,0,-.101);rig.legR.rotation.set(-.102,0,.082);
 rig.shinL.rotation.x=.035;rig.shinR.rotation.x=-.022;
 model.rotation.y=-.25+phase*.043+yaw*.5;
}
const studioThumbnails=new Map();
let thumbStudio=null;
function studioThumbnail(pane,renderer){
 const thumb=pane.querySelector('[data-operator-thumb]:not([data-rendered])');
 if(!thumb)return;
 const {operatorThumb:id}=thumb.dataset;
 let source=studioThumbnails.get(id);
 if(!source){
  if(!thumbStudio){
   const scene=new THREE.Scene();
   for(const light of studio.scene.children.filter(node=>node.isLight)){
    const fill=light.clone();fill.castShadow=false;scene.add(fill);
   }
   thumbStudio={scene,camera:new THREE.PerspectiveCamera(33,1,.01,8)};
  }
  const {scene,camera}=thumbStudio,actor=studioHuman(id);
  studioIdle(0,{...actor,phase:0},null);actor.model.rotation.y=.36;
  camera.aspect=renderer.domElement.width/renderer.domElement.height;camera.updateProjectionMatrix();
  camera.position.set(.36,1.59,1.48);camera.lookAt(0,1.45,0);
  scene.add(actor.model);renderer.render(scene,camera);scene.remove(actor.model);
  source=document.createElement('canvas');source.width=thumb.width;source.height=thumb.height;
  const image=renderer.domElement,h=image.height,w=Math.min(image.width,h*thumb.width/thumb.height);
  source.getContext('2d').drawImage(image,(image.width-w)/2,0,w,h,0,0,thumb.width,thumb.height);
  studioThumbnails.set(id,source);
 }
 thumb.getContext('2d').drawImage(source,0,0);
 thumb.dataset.rendered='1';
}
function studioFrame(now,pane){
 const canvas=pane.id==='p-lobby'?$('#lobby-canvas'):pane.querySelector('[data-studio]');
 if(!canvas)return false;
 const {studio:type,studioId:id}=canvas.dataset;
 const party=type==='party';
 if(party&&typeof mkBake!=='function')return false;
 const key=type+'|'+id+(party?'|'+lobbyStudioKey:type==='emote'?'|'+passOperator():'');
 const changed=key!==studio.key||studio.canvas!==canvas;
 if(!changed&&!studio.dirty&&now-studio.last<(gfxQ==='low'?67:40))return false;
 if(!studio.scene)studioInit();
 if(key!==studio.key){
  if(studio.content)studio.scene.remove(studio.content);
  Object.assign(studio,studioBuild(type,id));
  studio.scene.add(studio.content);studio.entered=now;studio.key=key;
  studio.scene.background=party?new THREE.Color(0x131c25):null;
  studio.scene.fog=party?new THREE.FogExp2(0x14222c,.048):null;
  studio.yaw=party?.135:type==='operator'||type==='emote'?.32:1.17;
  studio.pitch=party?.083:.086;
 }
 studio.last=now;studio.canvas=canvas;
 const width=canvas.clientWidth,height=canvas.clientHeight;
 if(width<=3||height<=3)return false;
 const limit=gfxQ==='low'?520:party&&gfxQ==='high'?960:830,scale=Math.min(1,limit/Math.max(width,height));
 const w=Math.round(width*scale),h=Math.round(height*scale);
 const resize=canvas.width!==w||canvas.height!==h;
 if(studioMotion.matches&&!changed&&!resize&&!studio.dirty&&!pane.querySelector('[data-operator-thumb]:not([data-rendered])'))return false;
 studio.dirty=false;
 if(canvas.width!==w)canvas.width=w;
 if(canvas.height!==h)canvas.height=h;
 const time=studioMotion.matches?1.3:(now-studio.entered)/1000,emote=type==='emote'?Number(id):null;
 for(const actor of studio.hosts)studioIdle(time,actor,emote);
 const camera=studio.camera,aspect=w/h,narrow=width<=640;
 const partyFraming=narrow?1.075:height<=520?1.23:1.12;
 const dist=studio.size*(3.4+Math.max(0,1.08-aspect)*1.95)*(party?partyFraming:1);
 const sway=party&&!studioMotion.matches?Math.sin(time*.39)*.082:0;
 const yaw=studio.yaw+sway,pitch=studio.pitch;
 camera.aspect=aspect;camera.near=Math.min(.03,dist*.12);
 if(party)camera.setViewOffset(w,h,narrow?0:-w*(studio.hosts.length>2?.145:.191),narrow?h*.07:0,w,h);
 else camera.clearViewOffset();
 camera.updateProjectionMatrix();
 camera.position.copy(studio.center).add(V(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(dist));
 camera.lookAt(studio.center);
 if(studio.failed)return false;
 try{
  const renderer=previewRenderer(w,h);
  renderer.shadowMap.enabled=gfxQ==='high'&&studio.hosts.length>0;
  renderer.render(studio.scene,camera);
 }catch(e){
  studio.failed=true;canvas.setAttribute('aria-label','3D preview unavailable on this device');return false;
 }
 const renderer=wRen;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(renderer.domElement,0,0,w,h);
 studioThumbnail(pane,renderer);
 return true;
}
{
 let drag=null;
 const menu=$('#menu');
 menu.addEventListener('pointerdown',e=>{
  if(e.target.matches('canvas[data-studio]:not([data-studio=party])')&&e.button===0){
   drag={canvas:e.target,id:e.pointerId,x:e.clientX,y:e.clientY};e.target.setPointerCapture(e.pointerId);
  }
 });
 menu.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  studio.yaw+=(e.clientX-drag.x)*.012;studio.pitch=cl(studio.pitch+(e.clientY-drag.y)*.012,-.85,.9);studio.dirty=true;
  drag.x=e.clientX;drag.y=e.clientY;
 });
 menu.addEventListener('lostpointercapture',()=>{drag=null});
 menu.addEventListener('click',e=>{
  const turn=e.target.closest('[data-orbit]');
  if(turn){studio.yaw+=Number(turn.dataset.orbit)*.55;studio.dirty=true}
 });
}

let lobbyStudioKey='';
function lobbyStageRender(){
 const section=$('#p-lobby');
 if(!section.classList.contains('on')||app!=='mp')return;
 const focus=section.contains(document.activeElement)?document.activeElement.dataset.lobby:null;
 chRoll();
 const players=lobbySeats(),daily=chActive().d,done=daily.filter(([id])=>CHST.done['d:'+id]).length;
 lobbyStudioKey=players.map(p=>operatorId(p.look.operator)).join('|');
 const privateLobby=!!net&&!partyActive,code=$('#code').textContent.trim(),peerCount=Object.keys(names).length;
 const selectedMode=privateLobby&&isHost?$('#pmode').value:sel.rm?'Random mode':sel.mode;
 const selectedMap=privateLobby&&isHost?$('#pm').value:sel.rp?'Random map':sel.map;
 const title=selectedMode==='Private'?'Players-only FFA':selectedMode==='?'?'Random mode':selectedMode;
 const waiting=!!net&&!isHost,action=waiting?(partyActive?'Waiting for leader':'Waiting for host'):privateLobby?'Start match':partyActive?'Find match with party':'Find match';
 const label=partyActive?'Party · '+peerCount+'/4':privateLobby?'Private lobby':'Multiplayer';
 section.innerHTML=`<div class="lobby-summary">
  <div class="deploy-copy"><div class="mode-label"><i></i> ${label}</div>
   <h2>${esc(waiting&&privateLobby?'Private match':title)}</h2><p>${esc(waiting?'Waiting for the '+(partyActive?'leader':'host')+' to deploy.':selectedMap==='?'?'Random map':selectedMap)}</p>
   <div class="deploy-actions"><button class="big action-arrow" data-initial-focus data-lobby="deploy"${waiting||privateLobby&&peerCount<2?' disabled':''}>${action}</button>
   <button class="big alt" data-lobby="${privateLobby?'priv':'play'}">${privateLobby?'Lobby settings':'Match setup'}</button></div>
   ${privateLobby&&isHost&&code?`<p class="deploy-record">Match code · ${esc(code)}</p>`:''}
  </div>
  <div class="lobby-roster">${players.map((p,i)=>idrPlate(idrRead(p.look),p.nm,i===0?'You':'In party')).join('')}</div></div>
  <div class="lobby-links">
   ${!net&&!window.SD_SPLIT?`<button data-lobby="training"><span><b>Basic training</b><small>${trainingComplete()?'Replay the movement and weapons drills':'Learn movement, shooting and weapon handling'}</small></span><span aria-hidden="true">↗</span></button>`:''}
   ${!net&&!window.SD_SPLIT?'<button data-lobby="practice"><span><b>Practice range</b><small>Test your loadout on moving targets</small></span><span aria-hidden="true">↗</span></button>':''}
   <button data-lobby="priv"><span><b>Private match</b><small>Online lobbies and local split screen</small></span><span aria-hidden="true">↗</span></button>
   <button data-lobby="record"><span><b>Combat record</b><small>Results and stats from recent matches</small></span><span aria-hidden="true">↗</span></button>
   <button data-lobby="chal"><span><b>Daily challenges</b><small>${done} / ${daily.length} completed</small></span><span aria-hidden="true">↗</span></button>
   <button data-lobby="pass"><span><b>After the Signal</b><small>Battle Pass · Tier ${passTier()} of ${PASS_TRACK.length}</small></span><span aria-hidden="true">↗</span></button>
  </div>`;
 if(focus)section.querySelector('[data-lobby="'+focus+'"]:not(:disabled)')?.focus({preventScroll:true});
}
$('#nav [data-p=lobby]').addEventListener('click',lobbyStageRender);
$('#p-lobby').addEventListener('click',e=>{
 const action=e.target.closest('[data-lobby]')?.dataset.lobby;
 if(!action)return;
 if(action==='deploy')return $(net&&!partyActive?'#startnet':'#go').click();
 if(action==='training'||action==='practice')return $('#'+action+'-start').click();
 openMenuPanel(action);
});
$('#nm').addEventListener('input',lobbyStageRender);
