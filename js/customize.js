/* ===================== customize.js ===================== */
/* ---------- Customize weapon: replaces the old Weapon mastery menu. Opened with the "Customize weapon" button in the loadout screen (or the Camos button in the Zombies menu).
   Layout like the reference: crumb and CAMOS title top left, CHALLENGES / WEAPON PRESTIGE tabs on top, a big preview of the weapon with the selected camo in the middle (cycle the
   view with Preview weapon: side, three quarter, top, front), the camo name, lock state and requirement with progress on the right, and rows of camo tiles at the bottom grouped into
   Military / Special / Mastery (Multiplayer) or Undead / Special / Mastery (Zombies) with a Multiplayer / Zombies switch. Every camo, from either track, works in both modes. ---------- */
const CU={k:'AR',tab:'ch',track:'mp',sel:null,view:0,img:{},tiles:{}};
const CU_VIEWS=[['SIDE',[1,.06,0]],['THREE QUARTER',[.75,.5,.85]],['TOP',[.02,1,.06]],['FRONT',[.05,.12,1]],['REAR',[-.05,.18,-1]],['UNDERSIDE',[.5,-.9,.3]]];
let cuRen=null;
function cuPreview(k,cn,view){const key=k+'|'+(cn||'')+'|'+view+'|'+(typeof gfxQ!='undefined'?1:0);if(CU.img[key]!=null)return CU.img[key];
 try{if(!cuRen){cuRen=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});cuRen.setSize(1100,460,false);cuRen.setPixelRatio(1);cuRen.setClearColor(0,0)}
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x3a4a5e,.95));const d1=new THREE.DirectionalLight(0xffffff,1);d1.position.set(4,6,3);sc.add(d1);const d2=new THREE.DirectionalLight(0x88aaff,.55);d2.position.set(-4,1,-4);sc.add(d2);
  const rm=cn?camoRm(k,cn):undefined,g=buildGun(k,rm);sc.add(g);const bb=new THREE.Box3().setFromObject(g),ct=bb.getCenter(new THREE.Vector3()),sp=bb.getBoundingSphere(new THREE.Sphere()),fov=24,
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
  <div class="cu-bot"><div class="cu-modes"><span class="dis">CO-OP CAMPAIGN</span><button data-cutr="mp" class="${CU.track=='mp'?'on':''}">MULTIPLAYER</button><button data-cutr="zm" class="${CU.track=='zm'?'on':''}">ZOMBIES</button></div>
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
