/* ===================== loadout.js ===================== */
/* ---------- loadout screen laid out like a modern shooter: numbered loadout tabs on top, a slot grid on the left (primary, quick picks, secondary, melee,
   field upgrade, tactical, lethal, three perks) and a detail panel on the right with a rendered weapon preview, stats and the options of the selected slot.
   Weapon previews are drawn at run time from the game's own weapon models (no image files). ---------- */
const LSL={cur:0,sel:'p',slots:[]};
try{LSL.slots=JSON.parse(localStorage.getItem('sd-slots'))||[];LSL.cur=+localStorage.getItem('sd-slot')||0}catch(e){}
const CLS={AR:'ASSAULT RIFLE',MVR:'ASSAULT RIFLE',SMG:'SUBMACHINE GUN',VMP:'SUBMACHINE GUN',BR:'BATTLE RIFLE',SG:'SHOTGUN',MG:'PISTOL',MP:'MACHINE PISTOL',CT:'PISTOL',CY:'SHOTGUN',SN:'SNIPER RIFLE',RL:'LAUNCHER',RG:'SPECIAL'};
const WDS={AR:'Full-auto rifle. Reliable all-rounder with a steady rate of fire.',MVR:'Full-auto assault rifle. Excellent accuracy and range, offset by its slower mobility and rate of fire.',SMG:'Light submachine gun. Very fast firing, best up close.',BR:'Semi-auto battle rifle. Heavy hits at range.',SG:'Pump shotgun. Devastating at close range.',MG:'Six-shot magnum revolver. Slow, powerful, accurate.',MP:'Fully automatic machine pistol. Extreme close-range volume.'};
const PERKC=['#c0392b','#2e86de','#27ae60'];
const nm_=k=>W[k]?W[k].n:k;
/* ---------- weapon preview renderer: one extra small WebGL context, images cached as data URLs ---------- */
const WIMG={};let wRen=null;
function wImg(k){const ak=k+'|'+attsFor(k).join(',');if(WIMG[ak]!=null)return WIMG[ak];try{if(!wRen){wRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});wRen.setSize(640,300,false);wRen.setPixelRatio(1);wRen.setClearColor(0,0)}
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x4a5566,1.0));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(4,5,2);sc.add(dl);const dl2=new THREE.DirectionalLight(0x99aacc,.4);dl2.position.set(-4,2,-3);sc.add(dl2);
 const g=buildGun(k);try{attApply(g,k,attsFor(k),1)}catch(e){}sc.add(g);const bb=new THREE.Box3().setFromObject(g),ct=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()),hw=Math.max(sz.z*.56,sz.y*1.15),hh=hw*300/640,cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,.01,30);
 cam.position.set(ct.x+6,ct.y,ct.z);cam.lookAt(ct.x,ct.y,ct.z);wRen.render(sc,cam);return WIMG[ak]=wRen.domElement.toDataURL('image/png')}catch(e){return WIMG[ak]=''}}
/* ---------- 3D previews of the non-gun items: the same models the game uses, rendered once and cached ---------- */
const OIMG={};
function objImg(id,fn){if(OIMG[id]!=null)return OIMG[id];try{if(!wRen){wRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});wRen.setSize(640,300,false);wRen.setPixelRatio(1);wRen.setClearColor(0,0)}
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
 if(id=='frag'){const o=M(0x4a5a30),d=M(0x2a3320),st=M(0x8a9098);sp(.04,0,0,0,o,1,1.25,1);for(let i=-3;i<=3;i++){tr(.04*Math.sqrt(Math.max(.05,1-Math.pow(i/3.4,2))),.003,0,i*.0125,0,d)}for(let i=0;i<8;i++){const a=i*.785;bx(.004,.09,.004,Math.cos(a)*.0405,0,Math.sin(a)*.0405,d)}cy(.011,.03,0,.054,0,st);bx(.012,.006,.05,.012,.066,0,st);tr(.012,.0022,.03,.06,0,st,0);return g}
 if(id=='impact'){const o=M(0x555a60),r=M(0xc0392b);sp(.04,0,0,0,o,1,1.1,1);tr(.04,.006,0,.003,0,r);tr(.036,.004,0,.022,0,r);const c=new THREE.Mesh(new THREE.ConeGeometry(.012,.03,12),M(0x2a2a2e));c.position.y=.054;g.add(c);cy(.006,.02,0,.07,0,M(0xe8e8e0));return g}
 if(id=='flash'){const o=M(0xb8bcc2),d=M(0x2a2c30),st=M(0x8a9098);cy(.028,.12,0,0,0,o);cy(.03,.016,0,.062,0,d);cy(.03,.016,0,-.062,0,d);tr(.029,.003,0,.02,0,d);tr(.029,.003,0,-.02,0,d);bx(.012,.006,.05,.012,.076,0,st);tr(.012,.0022,.03,.07,0,st,0);cy(.01,.016,0,.07,0,st);return g}
 if(id=='adren'){const gl=new THREE.MeshBasicMaterial({color:0x3fd0c9}),b=M(0x2a3a44),st=M(0xcfd6de);cy(.018,.12,0,0,0,b);cy(.014,.1,0,.0,.0,gl);cy(.02,.02,0,.07,0,st);cy(.007,.04,0,.095,0,st);cy(.003,.05,0,-.1,0,st,.001);const n=new THREE.Mesh(new THREE.ConeGeometry(.003,.04,8),st);n.position.y=-.115;n.rotation.x=Math.PI;g.add(n);cy(.022,.012,0,-.066,0,M(0x1b2830));tr(.019,.003,0,.03,0,st);g.rotation.z=Math.PI/3;return g}
 return g}
const oTag=id=>{const u=objImg(id,()=>objBuild(id));return u?`<img src="${u}" alt="">`:''};
const IMG_M={get Katana(){return oTag('katana')},get Fists(){return oTag('fists')}},IMG_G={get Frag(){return oTag('frag')},get Impact(){return oTag('impact')}},IMG_F={toString:()=>oTag('adren')},IMG_T={toString:()=>oTag('flash')};
function ring(lv,mx){const p=Math.min(1,lv/mx),c=2*Math.PI*17;return `<span class="ring"><svg viewBox="0 0 40 40" width="42" height="42"><circle cx="20" cy="20" r="17" fill="none" stroke="#23424c" stroke-width="3"/><circle cx="20" cy="20" r="17" fill="none" stroke="var(--cy)" stroke-width="3" stroke-dasharray="${(c*p).toFixed(1)} ${c}" transform="rotate(-90 20 20)"/></svg><b>${lv}</b><i>/${mx}</i></span>`}
const wlvS=k=>typeof wlv=='function'?wlv(k):1;
const perkN=i=>L.pk[i]||null;
function slotHtml(id,cls,label,name,body,extra){return `<button class="ls ${cls} ${LSL.sel==id?'sel':''}" data-slot="${id}"><u>${label}</u>${body||''}<b>${name}</b>${extra||''}</button>`}
function statBar(n,v){return `<div class="sb"><span>${n}</span><i><em style="width:${Math.max(4,Math.min(100,v*100))}%"></em></i></div>`}
function wStats(k){const w=W[k],dps=w.d*(w.pel||1)/w.r;return statBar('Damage',Math.min(1,w.d*(w.pel>1?2.2:1)/50))+statBar('Fire rate',Math.min(1,(60/w.r)/900))+statBar('Accuracy',Math.min(1,1/(1+w.sp*22)))+statBar('Control',Math.min(1,1.15/w.rc))+statBar('Magazine',Math.min(1,w.m/40))}
function attChips(a){return Object.keys(A).map(k=>chip(a,k,k,A[k].t,L[a].includes(k))).join('')}
function detailWeapon(k,isP){const w=W[k];return `<div class="dh"><em>${CLS[k]||'WEAPON'}</em><h3>${w.n}</h3>${ring(wlvS(k),20)}</div><p class="dd">${WDS[k]||desc(w)}</p><div class="dimg">${wImg(k)?`<img src="${wImg(k)}" alt="">`:''}</div><div class="stats">${wStats(k)}</div>
 <div class="row"><button class="big cust" data-cust="${isP?'p':'s'}">Customize weapon</button></div><h4>${isP?'Primary':'Secondary'} weapons</h4><div class="row">${(isP?PRI:SEC).map(x=>chip(isP?'p':'s',x,W[x].n,desc(W[x]),(isP?L.p:L.s)==x)).join('')}</div>
 <h4>Attachments (up to ${isP?3:2})</h4><div class="row">${attChips(isP?'pa':'sa')}</div>`}
function detailHtml(){const s=LSL.sel;
 if(s=='p')return detailWeapon(L.p,1);
 if(s=='s'){if(!L.s)return `<div class="dh"><em>PISTOL</em><h3>None</h3></div><p class="dd">No secondary weapon equipped.</p><div class="row">${SEC.map(x=>chip('s',x,W[x].n,desc(W[x]),0)).join('')}</div>`;return detailWeapon(L.s,0)+`<div class="row"><button class="c" data-a="s" data-v="${L.s}"><b>Remove secondary</b><i>Frees 1 point</i></button></div>`}
 if(s=='me'){const m=MEL[melName()];return `<div class="dh"><em>MELEE</em><h3>${m.n}</h3></div><p class="dd">${m.desc}</p><div class="dimg meleei">${IMG_M[melName()]}</div><div class="stats">${statBar('Damage',m.d/100)+statBar('Reach',m.reach/3.2)+statBar('Speed',1-m.cd+.45)}</div>
  <p class="dd">Tap <kbd>V</kbd> for a quick strike with your weapon. Hold <kbd>V</kbd> to draw this melee weapon and hit far harder.</p><h4>Melee weapons</h4><div class="row">${Object.keys(MEL).map(k=>chip('me',k,MEL[k].n,MEL[k].desc,melName()==k)).join('')}</div>`}
 if(s=='f')return `<div class="dh"><em>FIELD UPGRADE</em><h3>Adrenaline</h3></div><p class="dd">Press <kbd>X</kbd>: 6 seconds of extra speed and a full shield. 45 second recharge. Always equipped.</p><div class="dimg meleei">${IMG_F}</div>`;
 if(s=='t')return `<div class="dh"><em>TACTICAL</em><h3>Flashbang</h3></div><p class="dd">Press <kbd>Q</kbd>: blinds and stuns enemies who see it go off. You start with 2. Always equipped.</p><div class="dimg meleei">${IMG_T}</div>`;
 if(s=='l')return `<div class="dh"><em>LETHAL</em><h3>${L.g||'None'}</h3></div><p class="dd">${L.g?GR[L.g].t:'No grenade equipped.'}</p><div class="dimg meleei">${L.g?IMG_G[L.g]||IMG_G.Frag:''}</div><h4>Lethal equipment</h4><div class="row">${Object.keys(GR).map(k=>chip('g',k,k,GR[k].t,L.g==k)).join('')}</div>`;
 if(s=='q')return `<div class="dh"><em>QUICK PICKS</em><h3>Presets</h3></div><p class="dd">Replace everything with a ready-made class, then fine tune it.</p><div class="row">${Object.keys(PRE).map(k=>chip('preset',k,k,PD[k],0)).join('')}</div>`;
 if(s[0]=='k'){return `<div class="dh"><em>PERKS</em><h3>Choose up to 3</h3></div><p class="dd">Perks are shared between the three slots; every perk you pick fills the next free slot.</p><div class="row">${Object.keys(K).map(k=>chip('pk',k,k,K[k],L.pk.includes(k))).join('')}</div>`}
 return ''}
function ldRender(){const e=$('#ld');if(!e)return;sanitizeMe();
 const pw=L.p,sw=L.s,tabs=[0,1,2,3,4,5].map(i=>`<button class="lt ${LSL.cur==i?'on':''}" data-lt="${i}">${(i<9?'0':'')+(i+1)}${i==LSL.cur?' - '+(LSL.slots[i]&&LSL.slots[i].nm||'CUSTOM LOADOUT '+(i+1)):''}</button>`).join('');
 const wImgT=k=>`<span class="wi">${wImg(k)?`<img src="${wImg(k)}" alt="">`:''}</span>`,pk=i=>{const n=perkN(i),c=PERKC[i];return slotHtml('k'+i,'perk',`PERK ${i+1}`,n||'Empty',`<span class="hex" style="--hc:${c}">${n?n[0]:'+'}</span>`)};
 e.innerHTML=`<div class="lo"><div class="lo-tabs"><kbd>LB</kbd>${tabs}<kbd>RB</kbd></div><div class="lo-main"><div class="lo-grid">
  ${slotHtml('p','w4',`${CLS[pw]||'PRIMARY'} <s>|</s> ${nm_(pw)}`,nm_(pw),wImgT(pw),ring(wlvS(pw),20))}
  ${slotHtml('q','w2 qp','QUICK PICKS','Presets','<span class="ico">★</span>')}
  ${slotHtml('s','w3',sw?CLS[sw]||'SECONDARY':'SECONDARY',sw?nm_(sw):'None',sw?wImgT(sw):'',sw?ring(wlvS(sw),20):'')}
  ${slotHtml('me','w3',`MELEE <s>|</s> ${MEL[melName()].n.toUpperCase()}`,MEL[melName()].n,`<span class="wi mi">${IMG_M[melName()]}</span>`)}
  ${slotHtml('f','w2','FIELD UPGRADE','Adrenaline',`<span class="wi mi">${IMG_F}</span>`)}
  ${slotHtml('t','w2','TACTICAL','Flashbang',`<span class="wi mi">${IMG_T}</span>`)}
  ${slotHtml('l','w2','LETHAL',L.g||'None',`<span class="wi mi">${L.g?IMG_G[L.g]||IMG_G.Frag:''}</span>`)}
  ${pk(0)}${pk(1)}${pk(2)}
  ${typeof skSel=='function'?slotHtml('ks','w6','KILLSTREAKS',skSel().map(i=>STK[i].n).join(' · '),`<span class="ksrow">${skSel().map(i=>`<span class="ksi">${skTag(i)}</span>`).join('')}</span>`):''}
 </div><aside class="lo-side">${detailHtml()}</aside></div></div>`;
 $('#pts').textContent=cost()+' / 10 points'}
function sanitizeMe(){if(!MEL[L.me])L.me='Katana'}
function slotStore(){try{LSL.slots[LSL.cur]=Object.assign(LSL.slots[LSL.cur]||{},{L:JSON.parse(JSON.stringify(L))});localStorage.setItem('sd-slots',JSON.stringify(LSL.slots));localStorage.setItem('sd-slot',LSL.cur)}catch(e){}}
/* every redraw of the loadout also refreshes the screen and saves into the active slot */
{const _ui=ui;ui=function(){sanitizeMe();_ui();ldRender();slotStore()}}
document.addEventListener('click',e=>{
 const m=e.target.closest('.c[data-a="me"]');if(m){e.stopImmediatePropagation();L.me=m.dataset.v;ui();return}
 const t=e.target.closest('.lt');if(t){const i=+t.dataset.lt;if(i==LSL.cur)return;slotStore();LSL.cur=i;const s=LSL.slots[i];if(s&&s.L)L=Object.assign({p:'AR',s:null,pa:[],sa:[],g:'Frag',pk:[],me:'Katana'},JSON.parse(JSON.stringify(s.L)));try{sanitize()}catch(er){}ui();return}
 const b=e.target.closest('.ls');if(b){LSL.sel=b.dataset.slot;ldRender()}},true);
/* a saved loadout that predates the melee slot gets the katana */
try{sanitizeMe()}catch(e){}

ldRender();
