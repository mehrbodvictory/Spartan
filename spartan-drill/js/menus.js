/* ######## loadout.js ######## */
/* ===================== loadout.js ===================== */
/* ---------- loadout screen laid out like a modern shooter: numbered loadout tabs on top, a slot grid on the left (primary, quick picks, secondary, melee,
   field upgrade, tactical, lethal, three perks) and a detail panel on the right with a rendered weapon preview, stats and the options of the selected slot.
   Weapon previews are drawn at run time from the game's own weapon models (no image files). ---------- */
const LSL={cur:0,sel:'p',slots:[]};
try{LSL.slots=JSON.parse(localStorage.getItem('sd-slots'))||[];LSL.cur=+localStorage.getItem('sd-slot')||0}catch(e){}
const CLS={AR:'ASSAULT RIFLE',MVR:'ASSAULT RIFLE',TRB:'ASSAULT RIFLE',TUR:'ASSAULT RIFLE',SMG:'SUBMACHINE GUN',VMP:'SUBMACHINE GUN',BR:'BATTLE RIFLE',SG:'SHOTGUN',MG:'PISTOL',MP:'MACHINE PISTOL',CT:'PISTOL',CY:'SHOTGUN',SN:'SNIPER RIFLE',RL:'LAUNCHER',RG:'SPECIAL'};
const WDS={AR:'Full-auto rifle. Reliable all-rounder with a steady rate of fire.',TRB:'Three-round burst assault rifle. Tight, accurate bursts; two bursts kill. Unlocks at level 22.',TUR:'Fast firing automatic rifle with a turbine core. Light and mobile, best at medium range. Unlocks at level 26.',MVR:'Slow firing, hard hitting assault rifle. Three body shots kill. Excellent accuracy and range, heavy kick.',SMG:'Light submachine gun. Very fast firing, best up close.',BR:'Semi-auto battle rifle. Heavy hits at range.',SG:'Pump shotgun. Devastating at close range.',MG:'Six-shot magnum revolver. Slow, powerful, accurate.',MP:'Fully automatic machine pistol. Extreme close-range volume.'};
CLS.CY='LIGHT MACHINE GUN';CLS.RG='SPECIAL';CLS.MG='REVOLVER';
Object.assign(WDS,{VMP:'Ultra-fast submachine gun with a huge magazine. Low damage per bullet, shreds at close range.',CY:'60 round light machine gun with a drum magazine. Heavy suppressive fire, slow reload. Unlocks at level 34.',CT:'Classic .45 pistol. Reliable, accurate, quick to draw. Unlocks at level 12.',RG:'Experimental energy pistol. Explosive bolts with a splash, two shots kill. Unlocks at level 30.'});
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
;
/* ######## customize.js ######## */
/* ===================== customize.js ===================== */
/* ---------- Customize weapon: replaces the old Weapon mastery menu. Opened with the "Customize weapon" button in the loadout screen (or the Camos button in the Zombies menu).
   Layout like the reference: crumb and CAMOS title top left, CHALLENGES / WEAPON PRESTIGE tabs on top, a big preview of the weapon with the selected camo in the middle (cycle the
   view with Preview weapon: side, three quarter, top, front), the camo name, lock state and requirement with progress on the right, and rows of camo tiles at the bottom grouped into
   Military / Special / Mastery (Multiplayer) or Undead / Special / Mastery (Zombies) with a Multiplayer / Zombies switch. Every camo, from either track, works in both modes. ---------- */
const CU={k:'AR',tab:'ch',track:'mp',sel:null,view:0,img:{},tiles:{}};
const CU_VIEWS=[['SIDE',[1,.06,0]],['THREE QUARTER',[.75,.5,.85]],['TOP',[.02,1,.06]],['FRONT',[.05,.12,1]],['REAR',[-.05,.18,-1]],['UNDERSIDE',[.5,-.9,.3]]];
let cuRen=null;
function cuPreview(k,cn,view){const key=k+'|'+(cn||'')+'|'+view+'|'+attsFor(k).join(',')+'|'+(typeof gfxQ!='undefined'?1:0);if(CU.img[key]!=null)return CU.img[key];
 try{if(!cuRen){cuRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});cuRen.setSize(1100,460,false);cuRen.setPixelRatio(1);cuRen.setClearColor(0,0)}
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x3a4a5e,.95));const d1=new THREE.DirectionalLight(0xffffff,1);d1.position.set(4,6,3);sc.add(d1);const d2=new THREE.DirectionalLight(0x88aaff,.55);d2.position.set(-4,1,-4);sc.add(d2);
  const rm=cn?camoRm(k,cn):undefined,g=buildGun(k,rm);try{attApply(g,k,attsFor(k),1)}catch(e){}sc.add(g);const bb=new THREE.Box3().setFromObject(g),ct=bb.getCenter(new THREE.Vector3()),sp=bb.getBoundingSphere(new THREE.Sphere()),fov=24,
   cam=new THREE.PerspectiveCamera(fov,1100/460,.05,60),dist=sp.radius/Math.sin(THREE.MathUtils.degToRad(fov/2))*.78,dv=new THREE.Vector3(...CU_VIEWS[view][1]).normalize();
  /* the camera looks along -x for the side view so the muzzle points left, like the reference */
  cam.position.copy(ct).addScaledVector(dv,dist);cam.up.set(0,view==2?0:1,view==2?-1:0);cam.lookAt(ct);cuRen.render(sc,cam);return CU.img[key]=cuRen.domElement.toDataURL('image/png')}catch(e){return CU.img[key]=''}}
function cuTile(k,c){const key=c.n+(c.anim?'a':'');if(c.anim)return null;if(!CU.tiles[c.n]){try{const t=tx[c.n]||(tx[c.n]=camoTex(c.c,c.s));CU.tiles[c.n]=t.image.toDataURL('image/png')}catch(e){CU.tiles[c.n]=''}}return CU.tiles[c.n]}
const cuNeed=(k,c,z)=>{const w=wd(k),m=/^(\d+)/.exec(c.rq||'');if(c.pr)return[w.p,+(c.rq.match(/\d+/)||[1])[0]];if(c.rq&&/zombie kills$/.test(c.rq)&&m)return[w.z||0,+m[1]];if(c.rq&&/ kills$/.test(c.rq)&&m)return[w.k,+m[1]];if(/^reach round/.test(c.rq||''))return[prof.zbest||0,+c.rq.match(/\d+/)[0]];return[c.ok?1:0,1]};
function cuList(){const k=CU.k,z=CU.track=='zm',L=z?zcamos(k):camos(k),n=L.length;return{all:L,groups:z?[['UNDEAD',L.slice(0,6)],['SPECIAL',L.slice(6,9)],['MASTERY',L.slice(9)]]:[['MILITARY',L.slice(0,6)],['SPECIAL',L.slice(6,9)],['MASTERY',L.slice(9)]]}}
function custOpen(k,track){CU.k=W[k]?k:'AR';if(track)CU.track=track;CU.tab='ch';CU.sel=prof.camo[CU.k]||null;CU.view=0;$$('#nav button').forEach(x=>x.classList.remove('on'));$$('.pn').forEach(p=>p.classList.toggle('on',p.id=='p-cust'));custRender()}
function custBack(){const b=document.querySelector('#nav button[data-p="'+(CU.back||'load')+'"]');if(b&&b.offsetParent!==null)b.click();else{const l=document.querySelector('#nav button[data-p="load"]');if(l)l.click()}}
function custRender(){const e=$('#p-cust');if(!e)return;const k=CU.k,w=wd(k),{all,groups}=cuList(),eq=prof.camo[k]||'',cur=CU.sel&&all.find(c=>c.n==CU.sel)||null,tr=prof.trk;
 const nameTxt=cur?cur.n:eq&&all.some(c=>c.n==eq)?eq:'DEFAULT';let info='';
 if(CU.tab=='ch'){if(cur){const[a,b]=cuNeed(k,cur),ok=cur.ok;info=`<h3>${cur.n.toUpperCase()}</h3><p class="st ${ok?'ok':'lk'}">${ok?'UNLOCKED':'LOCKED'}</p><p class="rq">${ok?(eq==cur.n?'Equipped on this weapon.':'Select it to equip it on this weapon.'):'Requirement: '+cur.rq}</p>${ok?'':`<div class="pg"><i style="width:${Math.min(100,a/b*100)}%"></i><span>${Math.min(a,b)} / ${b}</span></div>`}`}
  else info=`<h3>DEFAULT</h3><p class="st ok">${eq?'':'EQUIPPED'}</p><p class="rq">The weapon's standard finish.</p>`}
 else info=`<h3>WEAPON PRESTIGE</h3><p class="st ${w.p?'ok':'lk'}">PRESTIGE ${w.p} / 3</p><p class="rq">Reach weapon level 20 (${wlv(k)} / 20), then prestige it to earn Ember, Frost and Aurora.</p>${wlv(k)==20&&w.p<3?'<button class="big" data-cupr="1">Prestige weapon</button>':''}`;
 const tile=(c)=>{const img=cuTile(k,c),sel=cur&&cur.n==c.n,isEq=eq==c.n,t=tr==k+':'+c.n;return `<button class="ct ${sel?'sel':''} ${c.ok?'':'lk'} ${c.anim?'an':''}" data-cut="${c.n}" title="${c.n}${c.ok?'':' (locked)'}"><span class="sw" style="${img?`background-image:url(${img})`:`--c:${c.c}`}"></span>${c.ok?'':'<u>🔒</u>'}${isEq?'<em>EQUIPPED</em>':''}${t?'<em class="tk">TRACKED</em>':''}</button>`};
 const nextLocked=all.find(c=>!c.ok),tc=all.filter(c=>c.ok).length;
 e.innerHTML=`<div class="cu"><div class="cu-top"><button class="cu-back" data-cuact="back">‹</button><div class="cu-crumb"><small>CUSTOMIZE / ${nm(k).toUpperCase()}</small><h2>CAMOS</h2></div>
  <div class="cu-tabs"><button data-cutab="ch" class="${CU.tab=='ch'?'on':''}">CHALLENGES</button><button data-cutab="pr" class="${CU.tab=='pr'?'on':''}">WEAPON PRESTIGE</button></div>
  <div class="cu-wsel"><button data-cuw="-1">‹</button><span>${nm(k)} <i>Lv ${wlv(k)}${w.p?' ★'+w.p:''}</i></span><button data-cuw="1">›</button></div></div>
  <div class="cu-main"><div class="cu-stage"><img src="${cuPreview(k,CU.tab=='ch'?(cur?cur.n:eq||''):(eq||''),CU.view)}" alt=""><b>${CU_VIEWS[CU.view][0]}</b></div><aside class="cu-info">${info}</aside></div>
  <div class="cu-bot"><div class="cu-modes"><button data-cutr="mp" class="${CU.track=='mp'?'on':''}">MULTIPLAYER</button><button data-cutr="zm" class="${CU.track=='zm'?'on':''}">ZOMBIES</button></div>
  <div class="cu-groups">${groups.map(([n,l],gi)=>`<div class="cg"><h4>${n}</h4><div class="cr">${gi==0?`<button class="ct ${!cur?'sel':''}" data-cut="" title="Default"><span class="sw" style="--c:#2a3036"></span>${eq?'':'<em>EQUIPPED</em>'}</button>`:''}${l.map(tile).join('')}</div></div>`).join('')}</div>
  <div class="cu-btns"><button data-cuact="track">TRACK NEXT CAMO (${tc}/${all.length})</button><button data-cuact="view">PREVIEW WEAPON</button><button data-cuact="weap">WEAPONS</button></div>${tr?`<p class="cu-trk">Tracking: ${tr.split(':')[1]} on ${nm(tr.split(':')[0])}</p>`:''}</div></div>`}
function custWeapons(){const e=$('#p-cust');const keys=Object.keys(W);e.querySelector('.cu-main').innerHTML=`<div class="cu-wlist">${keys.map(x=>`<button class="${x==CU.k?'on':''}" data-cuw2="${x}"><b>${nm(x)}</b><i>Lv ${wlv(x)}</i></button>`).join('')}</div>`}
document.addEventListener('click',e=>{const t=e.target;
 const op=t.closest('[data-cust]');if(op){e.stopImmediatePropagation();CU.back='load';custOpen(op.dataset.cust=='s'?L.s||L.p:L.p,'mp');return}
 const zc=t.closest('#nav button[data-p="cust"]');if(zc){CU.back='zplay';setTimeout(()=>custOpen(CU.k,'zm'),0);return}
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
const HAP={on:1,last:0};try{HAP.on=localStorage.getItem('sdrill-vib')=='0'?0:1}catch(e){}
function hapPad(){try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const p of l)if(p&&p.connected&&(p.vibrationActuator||(p.hapticActuators&&p.hapticActuators.length)))return p}catch(e){}return null}
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
;
/* ######## oitc.js ######## */
/* ===================== oitc.js ===================== */
/* ---------- One in the Chamber: everyone spawns with a pistol holding a single bullet and three lives. Any hit kills (you and the bots), each kill earns one bullet back, melee kills as well,
   and with no bullets left you still have your melee. Run out of lives and you are out. Last one standing wins. In private matches the host's bots take part, the other players are
   tracked through an 'oi' message when someone runs out of lives. The bot count comes from the private match slider. ---------- */
const OI={on:0,lives:3};
const oiMode=()=>mode=='One in the Chamber';
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
