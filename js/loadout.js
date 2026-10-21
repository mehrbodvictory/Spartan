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
function wImg(k){if(WIMG[k]!=null)return WIMG[k];try{if(!wRen){wRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});wRen.setSize(640,300,false);wRen.setPixelRatio(1);wRen.setClearColor(0,0)}
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x4a5566,1.0));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(4,5,2);sc.add(dl);const dl2=new THREE.DirectionalLight(0x99aacc,.4);dl2.position.set(-4,2,-3);sc.add(dl2);
 const g=buildGun(k);sc.add(g);const bb=new THREE.Box3().setFromObject(g),ct=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()),hw=Math.max(sz.z*.56,sz.y*1.15),hh=hw*300/640,cam=new THREE.OrthographicCamera(-hw,hw,hh,-hh,.01,30);
 cam.position.set(ct.x+6,ct.y,ct.z);cam.lookAt(ct.x,ct.y,ct.z);wRen.render(sc,cam);return WIMG[k]=wRen.domElement.toDataURL('image/png')}catch(e){return WIMG[k]=''}}
const IMG_M={Katana:'<svg viewBox="0 0 200 60"><path d="M10 40 Q90 10 190 8 L186 14 Q100 22 14 46Z" fill="#dfe6ee"/><rect x="2" y="38" width="22" height="10" rx="3" fill="#c9a94d" transform="rotate(-14 2 40)"/></svg>',
 Fists:'<svg viewBox="0 0 120 80"><rect x="20" y="22" width="70" height="40" rx="14" fill="#dfe6ee"/><rect x="26" y="14" width="14" height="18" rx="6" fill="#dfe6ee"/><rect x="44" y="10" width="14" height="20" rx="6" fill="#dfe6ee"/><rect x="62" y="12" width="14" height="19" rx="6" fill="#dfe6ee"/><rect x="78" y="16" width="14" height="18" rx="6" fill="#dfe6ee"/><rect x="84" y="44" width="26" height="14" rx="6" fill="#cfd6de"/></svg>'};
const IMG_G={Frag:'<svg viewBox="0 0 60 80"><ellipse cx="30" cy="48" rx="20" ry="24" fill="#cfd6de"/><rect x="24" y="12" width="12" height="10" fill="#9aa4ae"/><path d="M36 14 q12 -4 14 6" stroke="#9aa4ae" stroke-width="3" fill="none"/></svg>',
 Impact:'<svg viewBox="0 0 60 80"><circle cx="30" cy="44" r="22" fill="#cfd6de"/><circle cx="30" cy="44" r="9" fill="#ff7a3a"/></svg>'};
const IMG_F='<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="26" fill="none" stroke="#cfd6de" stroke-width="5"/><path d="M40 20 L48 40 L40 60 L32 40Z" fill="#cfd6de"/></svg>',
 IMG_T='<svg viewBox="0 0 60 80"><rect x="18" y="14" width="24" height="56" rx="8" fill="#cfd6de"/><rect x="24" y="6" width="12" height="10" fill="#9aa4ae"/></svg>';
function ring(lv,mx){const p=Math.min(1,lv/mx),c=2*Math.PI*17;return `<span class="ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#23424c" stroke-width="3"/><circle cx="20" cy="20" r="17" fill="none" stroke="var(--cy)" stroke-width="3" stroke-dasharray="${(c*p).toFixed(1)} ${c}" transform="rotate(-90 20 20)"/></svg><b>${lv}</b><i>/${mx}</i></span>`}
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
