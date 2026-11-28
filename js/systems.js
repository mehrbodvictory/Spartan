/* Rear and front mounting profiles for the physical sights. Profiles are in millimetres
   relative to the sightline. The model's mounting coordinates are supplied by its builder. */
const IRON_SIGHTS={
 AR:{rear:[[-25,11],[-17,9],[-11,-9],[11,-9],[17,9],[25,11]],front:[[-14,7],[-12,-7],[12,-7],[14,7]]},
 SMG:{rear:[[0,16],[11,12],[16,0],[11,-12],[0,-16],[-11,-12],[-16,0],[-11,12],[0,16]],front:[[-14,3],[-8,-8],[8,-8],[14,3]]},
 BR:{rear:[[-24,8],[-12,8],[-12,-8],[12,-8],[12,8],[24,8]],front:[[-18,4],[-18,-10],[18,-10],[18,4]]},
 SG:{rear:[[-15,-12],[-7,-12],[0,-5],[7,-12],[15,-12]],front:[[-10,-11],[-5,-7],[5,-7],[10,-11]]},
 MG:{rear:[[-20,6],[-10,6],[-7,-5],[7,-5],[10,6],[20,6]],front:[[-10,-10],[0,-5],[10,-10]]},
 MP:{rear:[[-16,3],[-16,-11],[16,-11],[16,3]],front:[[-12,-1],[-12,-9],[12,-9],[12,-1]]},
 VA:{rear:[[-17,-9],[-17,8],[-9,16],[9,16],[17,8],[17,-9],[9,-16],[-9,-16],[-17,-9]],front:[[-17,5],[-13,10],[-9,-8],[9,-8],[13,10],[17,5]]},
 BP:{rear:[[-24,6],[-19,-11],[19,-11],[24,6]],front:[[-15,0],[-12,-10],[0,-13],[12,-10],[15,0]]},
 KTS:{rear:[[-24,5],[-16,11],[-9,-6],[0,-12],[9,-6],[16,11],[24,5]],front:[[-13,8],[-10,-2],[0,-9],[10,-2],[13,8]]},
 RD:{rear:[[-20,-7],[-15,-17],[15,-17],[20,-7],[20,10],[13,13],[-13,13],[-20,10],[-20,-7]],front:[[-15,-6],[-9,-12],[9,-12],[15,-6]]},
 AN:{rear:[[-23,5],[-14,5],[-8,-9],[8,-9],[14,5],[23,5]],front:[[-13,1],[-8,-10],[8,-10],[13,1]]},
 HC:{rear:[[-24,8],[-12,8],[-12,-6],[12,-6],[12,8],[24,8]],front:[[-13,-3],[-7,-10],[7,-10],[13,-3]]},
 OH:{rear:[[-23,4],[-16,8],[-10,-4],[0,-13],[10,-4],[16,8],[23,4]],front:[[-11,7],[-6,-10],[6,-10],[11,7]]},
 RL:{rear:[[-16,-13],[-16,23],[-8,23],[8,23],[16,23],[16,-13],[-16,-13]],front:[[-17,6],[-12,12],[-6,-8],[6,-8],[12,12],[17,6]]},
 SN:{rear:[[-17,7],[-11,7],[-8,-7],[8,-7],[11,7],[17,7]],front:[[-11,3],[-7,-11],[7,-11],[11,3]]},
 VMP:{rear:[[-19,-8],[-19,5],[-12,14],[0,18],[12,14],[19,5],[19,-8]],front:[[-18,4],[-13,10],[-10,2],[-9,-11],[9,-11],[10,2],[13,10],[18,4]]},
 CY:{rear:[[-30,3],[-22,15],[-15,15],[-15,-12],[15,-12],[15,15],[22,15],[30,3]],front:[[-21,6],[-17,12],[-12,-11],[12,-11],[17,12],[21,6]]},
 RG:{rear:[[0,22],[15,13],[22,0],[15,-13],[0,-20],[-15,-13],[-22,0],[-15,13],[0,22]],front:[[-19,3],[-14,-12],[0,-17],[14,-12],[19,3]]},
 KEY:{rear:[[-11,-4],[-9,6],[-5,10],[5,10],[9,6],[11,-4]],front:[[-8,-5],[0,-8],[8,-5]]},
 ULT:{rear:[[-18,4],[-11,2],[-9,-8],[9,-8],[11,2],[18,4]],front:[[-12,-4],[12,-4]]},
 CT:{rear:[[-19,4],[-9,4],[-9,-6],[9,-6],[9,4],[19,4]],front:[[-8,-13],[8,-13]]},
 MVR:{rear:[[-15,-10],[-15,9],[-8,15],[8,15],[15,9],[15,-10],[8,-16],[-8,-16],[-15,-10]],front:[[-18,-2],[-14,7],[-9,-10],[9,-10],[14,7],[18,-2]]},
 TUR:{rear:[[-22,11],[-15,14],[-15,-12],[-7,-17],[7,-17],[15,-12],[15,14],[22,11]],front:[[-18,6],[-18,-5],[-12,-11],[12,-11],[18,-5],[18,6]]},
 TRB:{rear:[[-14,11],[0,17],[14,11],[14,-8],[0,-14],[-14,-8],[-14,11]],front:[[-13,7],[-9,-10],[0,-14],[9,-10],[13,7]]},
 DS:{rear:[[-14,9],[-20,2],[-14,-10],[14,-10],[20,2],[14,9]],front:[[-14,10],[-10,-10],[10,-10],[14,10]]},
 TEA:{rear:[[-25,4],[-19,12],[-13,-8],[-7,-15],[7,-15],[13,-8],[19,12],[25,4]],front:[[-18,3],[-13,14],[-9,-12],[9,-12],[13,14],[18,3]]},
 MNG:{rear:[[-26,9],[-22,-8],[-17,-15],[17,-15],[22,-8],[26,9]],front:[[-20,11],[-20,-10],[0,-15],[20,-10],[20,11]]},
 GL:{rear:[[-19,-11],[-19,21],[-12,21],[-12,-5],[12,-5],[12,21],[19,21],[19,-11]],front:[[-16,4],[-10,-6],[0,-11],[10,-6],[16,4]]},
 FT:{rear:[[-23,13],[-26,5],[-19,-10],[0,-17],[19,-10],[26,5],[23,13]],front:[[-19,1],[-14,-8],[-7,-12],[7,-12],[14,-8],[19,1]]}
};

function mkSights(g,key,{yt,yb,yf,zr,zf,xt=0}){
 const profile=IRON_SIGHTS[key];
 if(!profile)return;
 const palette=mkSights.palette||(mkSights.palette={
  steel:new THREE.MeshLambertMaterial({color:0x283239}),
  trim:new THREE.MeshLambertMaterial({color:0x535c62})
 });
 const mount=new THREE.Group();
 mount.name=key+' iron sights';mount.position.x=xt;mount.userData.ironSights=key;g.add(mount);
 const place=(geo,x,y,z,m,rz=0)=>{
  const part=new THREE.Mesh(geo,m);part.position.set(x,y,z);part.rotation.z=rz;
  part.userData.sightPart=true;
  mount.add(part);return part;
 };
 const box=(w,h,d,x,y,z,m=palette.steel,rz=0)=>{
  const part=place(bg,x,y,z,m,rz);part.userData.lxB=1;part.scale.set(w,h,d);
 };
 const trace=(points,z,thickness,depth)=>{
  for(let i=1;i<points.length;i++){
   const [x,y]=points[i-1],[u,v]=points[i],dx=(u-x)*.001,dy=(v-y)*.001;
   box(Math.hypot(dx,dy)+thickness*.7,thickness,depth,(x+u)*.0005,yt+(y+v)*.0005,z,palette.steel,Math.atan2(dy,dx));
  }
 };
 const base=(points,z,y,width)=>{
  const top=yt+Math.min(...points.map(p=>p[1]))*.001;
  box(width,.008,.021,0,y+.003,z,palette.trim);
  if(top>y+.006)box(.013,top-y,.013,0,(top+y)/2,z);
 };
 base(profile.rear,zr,yb,.041);base(profile.front,zf,yf,.028);
 trace(profile.rear,zr,key==='SG'?.003:.0045,.012);
 trace(profile.front,zf,.0036,.011);
 if(key==='RL'||key==='GL')for(const offset of [.015,.007,-.007])for(const side of [-1,1])box(.006,.002,.013,side*.013,yt+offset,zr,palette.trim);
 const h=Math.max(.009,yt-yf-.004);
 box(.0045,h,.007,0,yt-h/2-.002,zf);
 g.userData.sight={xt,yt,zr};
}

/* ######## systems.js ######## */
/* ===================== juice.js ===================== */
/* ---------- juice: particles, shake, sounds, medals, best scores ---------- */
var pts=[],mc={},sw={x:0,y:0},muz=new THREE.PointLight(0xffc060,0,12);muz.position.set(.2,-.15,-1);C.add(muz);
const burstCapacity=320,burstPool=[],burstMatrix=new THREE.Matrix4(),burstMaterials=new Map();
const burstMesh=R.capabilities.isWebGL2||R.extensions.has('ANGLE_instanced_arrays')?
 new THREE.InstancedMesh(bg,new THREE.MeshBasicMaterial({color:0xffffff}),burstCapacity):null;
if(burstMesh){
 burstMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 burstMesh.setColorAt(0,new THREE.Color(0xffffff));
 burstMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
 burstMesh.count=0;burstMesh.visible=false;burstMesh.frustumCulled=false;S.add(burstMesh);
}
var shake=0,flashL=0,fk=0,streak=0,lastKillT=-9;
function burst(p,n,col,sp,life,sz){
 if(pts.length>=burstCapacity||n<=0)return;
 const color=mc[col]||(mc[col]=new THREE.Color(col));
 for(let i=0;i<n&&pts.length<burstCapacity;i++){
  const part=burstPool.pop()||{p:V(),v:V()};
  part.p.copy(p);part.s=sz*(.5+Math.random());
  part.v.set(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(sp*(.3+Math.random()));
  part.l=part.life=life;part.color=color;
  if(burstMesh){
   burstMesh.setMatrixAt(pts.length,burstMatrix.makeScale(part.s,part.s,part.s).setPosition(part.p));
   burstMesh.setColorAt(pts.length,color);
  }else{
   if(!burstMaterials.has(color))burstMaterials.set(color,new THREE.MeshBasicMaterial({color}));
   const mesh=part.mesh||(part.mesh=new THREE.Mesh(bg));
   mesh.material=burstMaterials.get(color);mesh.position.copy(part.p);mesh.scale.setScalar(part.s);S.add(mesh);
  }
  pts.push(part);
 }
 if(burstMesh){
  burstMesh.count=pts.length;burstMesh.visible=true;
  burstMesh.instanceMatrix.needsUpdate=true;burstMesh.instanceColor.needsUpdate=true;
 }
}
function noise(d,f,v){try{ac=ac||new AudioContext();const n=ac.sampleRate*d,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=f;g.gain.value=v*vol;s.connect(fl).connect(g).connect(PlayerAudio.output(ac));s.start()}catch(e){}}
/* every weapon has its own synthesized shot: n = noise layers [dur, filter, freq, vol, delay, Q, decay], o = tone layers [wave, f0, f1, dur, vol, delay] */
var GS={
 AR:{n:[[.09,'lowpass',4200,.32],[.03,'highpass',3000,.2]],o:[['square',230,90,.07,.1]]},
 MVR:{n:[[.2,'lowpass',2300,.5,0,.7,1.3],[.04,'highpass',2600,.28],[.34,'lowpass',700,.22,.05,.7,2.4]],o:[['sawtooth',150,42,.17,.24],['sine',80,32,.2,.3]]},
 SMG:{n:[[.05,'lowpass',6500,.22],[.02,'highpass',4500,.14]],o:[['triangle',420,200,.04,.1]]},
 BR:{n:[[.14,'lowpass',3000,.42],[.03,'highpass',2400,.3],[.2,'bandpass',900,.16,.04]],o:[['square',140,48,.13,.16],['sine',70,30,.15,.2]]},
 SG:{n:[[.3,'lowpass',1500,.62,0,.7,1.2],[.14,'bandpass',2600,.3,.03],[.35,'lowpass',500,.25,.06,.7,2.2]],o:[['sine',75,32,.28,.34]]},
 MG:{n:[[.22,'lowpass',3800,.5],[.03,'highpass',3200,.35],[.45,'lowpass',900,.22,.05,.7,2.5]],o:[['sine',120,38,.25,.3],['triangle',900,300,.05,.1]]},
 MP:{n:[[.04,'lowpass',5200,.2],[.02,'bandpass',3500,.18,0,3]],o:[['sawtooth',560,250,.04,.12]]},
 SN:{n:[[.07,'highpass',2800,.42],[.7,'lowpass',650,.34,.02,.7,2.8],[.2,'bandpass',1800,.22,.12,1.2,2]],o:[['sine',95,28,.4,.34],['square',1400,300,.04,.1]]},
 RL:{n:[[.7,'lowpass',500,.55,0,.7,1.1],[.5,'bandpass',1300,.2,.1,.8,1.8]],o:[['sawtooth',110,34,.5,.2],['sine',55,26,.45,.3]]},
 VMP:{n:[[.055,'lowpass',2300,.26],[.02,'highpass',5200,.1]],o:[['triangle',320,120,.05,.12],['sine',900,500,.02,.03]]},
 CY:{n:[[.13,'lowpass',2300,.42],[.03,'highpass',2000,.22],[.18,'lowpass',600,.2,.03,.7,2]],o:[['square',105,55,.1,.18],['sine',60,30,.12,.2]]},
 CT:{n:[[.1,'lowpass',4800,.4],[.025,'highpass',3600,.3],[.18,'bandpass',1100,.14,.03]],o:[['square',210,75,.09,.14],['triangle',1600,600,.02,.06,.01]]},
 SW:{n:[[.085,'bandpass',3080,.49],[.16,'lowpass',790,.21,.01]],o:[['triangle',155,57,.11,.1]]},
 LT:{n:[[.057,'bandpass',4200,.45],[.081,'highpass',1190,.19,.009]],o:[['sine',144,86,.066,.08]]},
 PD:{n:[[.14,'lowpass',1450,.62],[.045,'bandpass',2420,.26],[.16,'highpass',1330,.15,.088]],o:[['triangle',133,36,.17,.2]]},
 VA:{n:[[.09,'bandpass',3350,.43],[.18,'lowpass',870,.23,.018]],o:[['triangle',188,63,.13,.12]]},
 BP:{n:[[.28,'lowpass',1300,.63],[.09,'bandpass',2300,.31],[.06,'bandpass',1250,.12,.29],[.035,'highpass',2200,.12,.45]],o:[['sine',69,29,.25,.33]]},
 KTS:{n:[[.19,'lowpass',1880,.6],[.065,'bandpass',2950,.29],[.03,'bandpass',1650,.14,.1]],o:[['sine',91,41,.17,.23]]},
 RD:{n:[[.08,'bandpass',2500,.34],[.035,'highpass',4050,.2]],o:[['triangle',265,118,.062,.12]]},
 HC:{n:[[.2,'lowpass',2100,.57],[.035,'highpass',4050,.32],[.22,'lowpass',615,.16,.045]],o:[['sawtooth',147,42,.13,.18]]},
 OH:{n:[[.045,'highpass',3500,.51],[.33,'lowpass',695,.37,.025],[.17,'bandpass',1850,.2,.045]],o:[['sine',105,32,.21,.27]]},
 MNG:{n:[[.05,'lowpass',5000,.2],[.02,'highpass',3000,.12]],o:[['square',300,160,.04,.08]]},
 GL:{n:[[.25,'lowpass',900,.4],[.1,'bandpass',1800,.2,.03]],o:[['sine',100,40,.25,.3],['square',200,60,.1,.1]]},
 FT:{n:[[.25,'bandpass',1400,.3,0,.5,.6],[.2,'lowpass',500,.25]],o:[['sawtooth',90,60,.2,.08]]}};
function snd(p,a,context,output){try{const audio=context||(ac??=new AudioContext()),bus=output||PlayerAudio.output(audio);const t=audio.currentTime,v=(a==null?1:a)*vol;
 for(const n of p.n||[]){const len=Math.max(8,audio.sampleRate*n[0]|0),b=audio.createBuffer(1,len,audio.sampleRate),d=b.getChannelData(0),ex=n[6]||1.6;for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,ex);
  const s=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();s.buffer=b;f.type=n[1];f.frequency.value=n[2];f.Q.value=n[5]||.7;g.gain.value=n[3]*v;s.connect(f).connect(g).connect(bus);s.start(t+(n[4]||0))}
 for(const o of p.o||[]){const os=audio.createOscillator(),g=audio.createGain(),dl=o[5]||0;os.type=o[0];os.frequency.setValueAtTime(o[1],t+dl);os.frequency.exponentialRampToValueAtTime(Math.max(20,o[2]),t+dl+o[3]);g.gain.setValueAtTime(o[4]*v,t+dl);g.gain.exponentialRampToValueAtTime(.0001,t+dl+o[3]);os.connect(g).connect(bus);os.start(t+dl);os.stop(t+dl+o[3]+.03)}}catch(e){}}
function gunSnd(w){if(w.pap&&typeof papSnd=='function'&&mode=='Zombies'){if(w.k=='RG')pew();return papSnd(w,w.k=='RG')}if(w.k==='KEY')return keyshooterSound();if(w.k=='TEA')return;if(w.k=='RG')return pew();if(GS[w.k])return snd(GS[w.k]);noise(w.pel>1?.22:.1,w.pel>1?1800:3500,.3);beep(w.pel>1?90:140,.08,'sine',.12)}
/* Match notifications sit below the scoreboard. Kill medals appear below the crosshair. */
let activeNote=null;
function positionNotes(){
 const bar=$('#tbar'),rect=bar?.firstChild?bar.getBoundingClientRect():null;
 document.documentElement.style.setProperty('--ntop',((rect?.height?rect.bottom:34)+12)+'px');
}
(function(){
 const hud=$('#hud');if(!hud)return;
 const notes=document.createElement('div');notes.id='notes';hud.appendChild(notes);
 const points=document.createElement('div');points.id='pts';hud.appendChild(points);
 addEventListener('resize',positionNotes);
})();
var ntKind=t=>/\bflag\b|captur|zone|hill|hardpoint|domination|objective|secured|contested/i.test(t)?'obj':/ready|streak|uav|airstrike|nuke|care package|available|earned|unlocked|prestige|level/i.test(t)?'streak':/warning|danger|low|died|eliminated|lost/i.test(t)?'warn':'info';
function dismissNote(){
 if(!activeNote)return;
 const {el,timer}=activeNote;activeNote=null;
 clearTimeout(timer);el.classList.add('out');
 setTimeout(()=>el.remove(),350);
}
function ntShow(html,kind,secs,key,card){
 const box=$('#notes');if(!box)return;
 if(activeNote?.key!==key){
  dismissNote();
  positionNotes();
  const el=document.createElement('div');
  el.className='nt '+kind+(card?' card':'');
  el.innerHTML=(card?'':'<i></i>')+html;
  box.appendChild(el);activeNote={el,key,timer:0};
 }
 clearTimeout(activeNote.timer);
 activeNote.timer=setTimeout(dismissNote,secs*1000);
}
var esc_=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function msg(t,s){t=String(t==null?'':t);if(!t)return;
 if(/^(\+\d+ Kill|Headshot!|Double Kill!|Triple Kill!|Overkill!|Killing Spree!)/i.test(t)){const p=$('#pts');if(!p)return;p.textContent='';const e=document.createElement('div');e.className='pt'+(/Headshot/i.test(t)?' hs':t[0]=='+'?'':' multi');e.textContent=t;p.appendChild(e);setTimeout(()=>e.remove(),1150);return}
 ntShow('<span>'+esc_(t)+'</span>',ntKind(t),Math.max(1.6,Math.min(4,(s||2)+.4)),t,0)}
function popup(t,sub){
 if(typeof t!=='string'||typeof sub!=='string')return;
 t=t.slice(0,120);sub=sub.slice(0,180);
 ntShow('<strong>'+esc_(t)+'</strong><em>'+esc_(sub)+'</em>',ntKind(t+' '+sub),4,'p:'+t+sub,1);
 beep(880,.12,'triangle',.05);setTimeout(()=>beep(1320,.16,'triangle',.045),100);
};

function floatTxt(p,t,c){const q=p.clone().project(C);if(q.z>1)return;const e=document.createElement('div');e.className='ft';e.textContent=t;e.style.cssText=`left:${(q.x*.5+.5)*innerWidth}px;top:${(-q.y*.5+.5)*innerHeight}px;color:${c}`;$('#hud').appendChild(e);setTimeout(()=>e.remove(),800)}
function juiceHit(b,d,head){b.fl=.08;burst(V(b.x,head?1.75:1,b.z),head?9:5,head?0xffd24a:0xffffff,4,.3,.07);floatTxt(V(b.x+(Math.random()-.5)*.6,2.2,b.z),Math.round(d)+(head?'!':''),head?'#ffd24a':'#ffffff')}
function juiceKill(b,head){burst(V(b.x,1,b.z),26,0xb5452e,7,.9,.18);burst(V(b.x,1.4,b.z),8,0x62e0f0,5,.7,.1);shake=Math.max(shake,.3);beep(1200,.12,'triangle',.07);setTimeout(()=>beep(1700,.14,'triangle',.06),70);
 streak=t0-lastKillT<3.5?streak+1:1;lastKillT=t0;const m=['','Headshot!','Double Kill!','Triple Kill!','Overkill!','Killing Spree!'];msg(streak>1?m[Math.min(streak,5)]:head?m[1]:'+1 Kill',1.3)}
function juiceReset(){if(burstMesh){burstMesh.count=0;burstMesh.visible=false}else for(const p of pts)S.remove(p.mesh);burstPool.push(...pts);pts.length=0;streak=0;lastKillT=-9;shake=0;const h=$('#hint');h.style.opacity=1;setTimeout(()=>h.style.opacity=0,11000);msg(practiceSession?'Static and moving targets from 10 to 50 m':MODES[mode]||'First to 15 kills',3)}
function juiceTick(dt){
 shake*=Math.exp(-9*dt);
 if(shake>.01){
  const weight=shake*shk;
  C.position.x+=weight*(Math.sin(t0*57)*.025+Math.sin(t0*89)*.008);
  C.position.y+=weight*(Math.sin(t0*72)*.026+Math.sin(t0*103)*.006);
  C.rotation.z+=weight*Math.sin(t0*66)*.017;
 }
 fk*=Math.exp(-10*dt);
 const targetFov=fovBase*(1-ST.ads*ST.zoom)+fk*2.4+(P.sprG||0)*3.8;
 C.fov+=(splitCameraFov(targetFov,C.aspect)-C.fov)*Math.min(1,dt*10);C.updateProjectionMatrix();
 flashL*=Math.exp(-28*dt);muz.intensity=flashL*3;sw.x*=Math.exp(-8*dt);sw.y*=Math.exp(-8*dt);gun.rotation.y=sw.x;gun.rotation.z=sw.x*.5+sw.y*.3+rlRoll();
 hudCrosshair.style.setProperty('--crosshair-recoil-scale',(tg?.85:1)+kick*30);
 if(P.hp<P.mhp*.35&&!P.dead)dmA=Math.max(dmA,.22+.12*Math.sin(t0*6));
 for(const b of bots)if(b.fl>0){b.fl-=dt;for(const c of b.m.children)if(c.material&&c.material.emissive)c.material.emissive.setHex(b.fl>0?0x999999:0)}
 if(pts.length){
  let count=0,compacted=false;
  for(let i=0;i<pts.length;i++){
   const part=pts[i];part.l-=dt;
   if(part.l<=0){if(part.mesh)S.remove(part.mesh);burstPool.push(part);compacted=true;continue}
   part.v.y-=16*dt;part.p.addScaledVector(part.v,dt);
   if(part.p.y<.05){part.p.y=.05;part.v.multiplyScalar(.4);part.v.y=0}
   const scale=part.s*Math.min(1,part.l/part.life*1.6);
   if(burstMesh){
    burstMesh.setMatrixAt(count,burstMatrix.makeScale(scale,scale,scale).setPosition(part.p));
    if(compacted)burstMesh.setColorAt(count,part.color);
   }else{part.mesh.position.copy(part.p);part.mesh.scale.setScalar(scale)}
   pts[count++]=part;
  }
  pts.length=count;
  if(burstMesh){
   burstMesh.count=count;burstMesh.visible=count>0;
   burstMesh.instanceMatrix.needsUpdate=true;
   if(compacted)burstMesh.instanceColor.needsUpdate=true;
  }
 }}
function endGame(t){if(over)return;if(netOn&&isHost&&mode!='Private')mpEnd(t);over=1;run=0;paused=0;won=t=='Victory';document.exitPointerLock&&document.exitPointerLock();const sc=mode=='Slayer'?Math.max(0,3000-Math.round(t0*10)):kills*100+(mode=='Survival'?wave*50:mode=='Zombies'&&zq?zq.r*200:0),k='sd-best-'+mode+(sel.map===JUPITER_MAP?LEGACY_JUPITER_MAP:sel.map);let best=0,nb='';try{if(!window.SD_MOD_SESSION){best=+localStorage.getItem(k)||0;if(sc>best){localStorage.setItem(k,sc);nb=' · New best!'}}}catch(e){}
 const xp=awardXP();
 passFinishMatch(t);
 if(!window.SD_MOD_SESSION&&mode!='Zombies'&&mode!='Survival'){chEv('matches');if(won)chEv('wins')}
 saveCombatRecord(t);clearSquadMarks();arenaSoundCaptions.clear();finStart(t,sc,nb,xp);resetLifeLoadouts();sdGameRuntime?.end(t,sc)}

/* ===================== features.js ===================== */
/* ---------- Call of Duty x Halo features: melee, radar, killstreaks, power weapons, pickups, XP ranks, kill feed ---------- */
W.RL={n:'Rocket Launcher',d:1,r:1.1,m:2,sp:.002,rc:8,pel:1,au:0,rl:2.5,len:.7,col:0x7a3a2a,ex:{R:7,d:140,imp:0,w:'RL'}};
W.SN={n:'Sniper Rifle',d:110,r:.9,m:4,sp:.0005,rc:6,pel:1,au:0,rl:3,len:.8,col:0x2a2f4a};
var PN={RL:'Rocket Launcher',SN:'Sniper Rifle',OS:'Overshield',HP:'Health',AM:'Ammo'},PC={RL:0xff5a3a,SN:0xb080ff,OS:0x62e0f0,HP:0x7bd86b,AM:0xffd24a};
var pk=[],ks=0,q=[],uav=0,mxp=0,mn=0,src='';
function featReset(){for(const p of pk)S.remove(p.m);pk=[];ks=0;q=[];uav=0;mxp=0;mUps=[];mCost=need();mn=0;$('#kf').innerHTML='';
 for(const t of mode=='Zombies'||practiceSession?[]:['RL','SN','OS','HP','AM','AM']){const[x,z]=spawnPt(0),m=new THREE.Group(),b=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:PC[t]}));b.scale.setScalar(.6);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,6,8),new THREE.MeshBasicMaterial({color:PC[t],transparent:true,opacity:.18}));beam.position.y=3;m.add(b,beam);m.position.set(x,1,z);S.add(m);pk.push({t,x,z,m,b,on:1,rt:0,col:'#'+PC[t].toString(16).padStart(6,'0')})}}
function giveOS(){if(!P.os)P.msh+=50;P.os=20;P.sh=P.msh}
function grab(p){const t=p.t;p.on=0;p.m.visible=false;p.rt=t=='RL'||t=='SN'?45:25;beep(900,.12,'triangle',.08);msg(PN[t],1.2);
 if(t=='OS')giveOS();else if(t=='HP')P.hp=Math.min(P.mhp,P.hp+30);else if(t=='AM'){for(const w of wp)if(!w.pw){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}}
 else{let i=wp.findIndex(w=>w.k==t);if(i<0){wp.push({k:t,...eff(t,[]),pw:1,mag:0,res:0});i=wp.length-1}const w=wp[i];w.mag=w.m;w.res=w.m*2;cur=i;rel=0;setGun()}}
function feed(t){const e=document.createElement('div');e.textContent=t;$('#kf').prepend(e);while($('#kf').children.length>4)$('#kf').lastChild.remove();setTimeout(()=>e.remove(),4500)}
function featKill(b,head){ks++;if(PK('Quick Fix')&&run&&!P.dead){const heal=P.hp<P.mhp||P.sh<P.msh;P.hp=P.mhp;P.sh=P.msh;if(heal){beep(740,.07,'sine',.07);beep(1100,.1,'sine',.06);const f=$('#flash');if(f){f.style.transition='none';f.style.background='rgba(70,255,140,.35)';f.style.opacity=1;requestAnimationFrame(()=>{f.style.transition='opacity .5s';f.style.opacity=0})}msg('QUICK FIX',1)}}wkill(srcK);const x=killXP(head);feed(`You ▸ ${b.hb?b.nm:b.net?names[b.id]:b.nm||'Grunt'}  [${src}]${head?' ★':''}${x?'  +'+x:''}`);
 if(typeof skAward=='function')skAward()}
var melee;
function dirInd(b){if(!b)return;lastDir.set(P.x-b.x,0,P.z-b.z).normalize();const r=Math.atan2(b.x-P.x,b.z-P.z)-(yaw+Math.PI),e=$('#di');e.style.transform=`rotate(${r}rad)`;e.style.animation='none';void e.offsetWidth;e.style.animation='di 1s forwards'}
let radarTerrain=null,radarTerrainRevision=-1;
const radarPixelsPerMeter=4;
function drawRadarTerrain(c,scale){
 indexCollisions();
 if(radarTerrainRevision!==collisionRevision){
  radarTerrain||=document.createElement('canvas');
  const m=radarPixelsPerMeter,size=Math.ceil(H*2*m),g=radarTerrain.getContext('2d');
  if(radarTerrain.width!==size||radarTerrain.height!==size)radarTerrain.width=radarTerrain.height=size;
  else g.clearRect(0,0,size,size);
  if(MAPS[sel.map].swim)drawQuarryRiverOnMap(g,x=>(x+H)*m,z=>(z+H)*m,m);
  for(const b of bx){
   if(b.h<=.9||(b.y0||0)>=2.5)continue;
   g.fillStyle=b.h>3?'rgba(150,165,175,.6)':b.h>1.5?'rgba(110,125,135,.55)':'rgba(85,100,110,.5)';
   g.fillRect((b.x0+H)*m,(b.z0+H)*m,(b.x1-b.x0)*m,(b.z1-b.z0)*m);
  }
  radarTerrainRevision=collisionRevision;
 }
 c.save();c.beginPath();c.arc(75,75,72,0,7);c.clip();
 c.translate(75,75);c.rotate(yaw);
 c.drawImage(radarTerrain,-(P.x+H)*scale,-(P.z+H)*scale,H*2*scale,H*2*scale);
 c.restore();
}
function radar(){const c=$('#rd').getContext('2d'),R0=(uav>0||(typeof SK!='undefined'&&(SK.prT>0||SK.advT>0)))?70:28,k=72/R0,s=Math.sin(yaw),co=Math.cos(yaw);c.clearRect(0,0,150,150);c.fillStyle='rgba(8,20,26,.65)';c.beginPath();c.arc(75,75,73,0,7);c.fill();c.strokeStyle=uav>0?'#62e0f0':'#62e0f044';c.beginPath();c.arc(75,75,36,0,7);c.stroke();drawRadarTerrain(c,k);
 const dot=(x,z,col,r)=>{const dx=x-P.x,dz=z-P.z,px=75+(dx*co-dz*s)*k,py=75-(-dx*s-dz*co)*k;if(Math.hypot(px-75,py-75)>70)return;c.fillStyle=col;c.fillRect(px-r,py-r,r*2,r*2)};
 for(const p of pk)if(p.on)dot(p.x,p.z,p.col,2);for(const f of flags)dot(f.x,f.z,f.team=='A'?'#62a8ff':'#ff5a3a',4);for(const z of zones)dot(z.x,z.z,z.o=='A'?'#62a8ff':z.o=='B'?'#ff5a3a':'#cccccc',4);if(typeof kcTags!='undefined')for(const g of kcTags)dot(g.x,g.z,g.red?'#ff3030':'#ffd21a',3);if(typeof skRadar=='function')skRadar(dot,(x,z)=>{const dx=x-P.x,dz=z-P.z;return[75+(dx*co-dz*s)*k,75-(-dx*s-dz*co)*k]},c);else for(const b of bots)if(b.al)dot(b.x,b.z,ally(b)?'#62e0f0':'#ff5a3a',3);for(const mark of ST.pings)dot(mark.m.position.x,mark.m.position.z,mark.color,3);c.fillStyle='#62e0f0';c.beginPath();c.moveTo(75,68);c.lineTo(70,80);c.lineTo(80,80);c.fill()}
function featTick(dt){uav-=dt;if(P.os>0){P.os-=dt;if(P.os<=0){P.msh-=50;P.sh=Math.min(P.sh,P.msh)}}
 for(const p of pk){if(p.on){p.m.rotation.y+=dt*2;p.m.position.y=1+Math.sin(t0*3)*.15;if(!P.dead&&Math.hypot(P.x-p.x,P.z-p.z)<1.3&&P.y<2.5)grab(p)}else{p.rt-=dt;if(p.rt<=0){p.on=1;p.m.visible=true}}}
 const w=cw();if(w&&w.pw&&w.mag<=0&&w.res<=0&&rel<=0){wp.splice(cur,1);cur=0;setGun()}
 ksHud();radar();camoFx()}

/* ===================== vmp.js ===================== */
/* ---------- VMP: very fast SMG with a custom model (long mag, top rail, toothed muzzle drum, gold accents) ---------- */
W.VMP={n:'VMP-X',d:24,r:.042,m:36,sp:.03,rc:.5,pel:1,au:1,rl:1.8,len:.55,col:0x23262b};PRI.push('VMP');
var vmpG=new THREE.Group(),dk=new THREE.MeshLambertMaterial({color:0x15171a}),gd=new THREE.MeshLambertMaterial({color:0xc9a94d});
var bp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;vmpG.add(p);return p};
bp(0,.06,.035,.38,0,.072,-.27,dk);mkSights(vmpG,'VMP',{yt:.125,yb:.09,yf:.09,zr:-.12,zf:-.44});bp(0,.084,.03,.18,0,.03,-.32,gd);
bp(new THREE.CylinderGeometry(.02,.022,.12,10),0,0,0,0,0,-.6,dk,Math.PI/2);bp(new THREE.CylinderGeometry(.05,.05,.07,12),0,0,0,0,0,-.5,dk,Math.PI/2);
bp(0,.06,.11,.2,0,-.01,.1,dk);bp(0,.04,.12,.05,0,-.1,-.08,dk,.25);vmpG.userData.mag=[bp(0,.04,.22,.065,0,-.2,-.15,dk,.12),bp(0,.042,.025,.067,0,-.13,-.15,gd,.12)];

/* ===================== raygun.js ===================== */
/* ---------- RayGun: retro sci-fi blaster secondary. One click = one big red beam with splash damage. 20 rounds max. ---------- */
W.CY={n:'Coyote',d:26,r:.085,m:60,sp:.018,rc:1.3,pel:1,au:1,rl:4.2,len:.7,col:0x2e3238};PRI.push('CY');
W.RG={n:'RayGun',d:48,r:.38,m:20,rs:0,sp:.002,rc:3.5,pel:1,au:0,rl:1.6,len:.45,col:0xb02a22,ex:{R:3.2,d:62,imp:0,w:'RG',c:0xff2a14}};SEC.push('RG');W.CT={n:'1911',d:30,r:.16,m:8,sp:.006,rc:2.2,pel:1,au:0,rl:1.5,len:.32,col:0x1d2128};SEC.push('CT');
var rgG=new THREE.Group(),rm=new THREE.MeshLambertMaterial({color:W.RG.col}),rgSteel=new THREE.MeshLambertMaterial({color:0x9aa0a6}),rgBrass=new THREE.MeshLambertMaterial({color:0xc9a94d}),rgGlow=new THREE.MeshBasicMaterial({color:0xff3030}),rgGauge=new THREE.MeshBasicMaterial({color:0xffb454});
var rp=(g,x,y,z,m,rx,ry,rz,glow)=>{const p=new THREE.Mesh(g,m);p.position.set(x,y,z);p.rotation.set(rx||0,ry||0,rz||0);if(glow)p.userData.glow=1;rgG.add(p);return p},
 rbx=(w,h,d,x,y,z,m,rx)=>{const p=rp(bg,x,y,z,m,rx);p.scale.set(w,h,d)},cy=(a,b,h)=>new THREE.CylinderGeometry(a,b,h,12),tor=(r,t)=>new THREE.TorusGeometry(r,t,6,14),P2=Math.PI/2;
rp(new THREE.SphereGeometry(.075,16,12),0,.015,.03,rm);rbx(.06,.06,.22,0,-.01,-.06,rm);rbx(.018,.05,.16,0,.062,-.1,rm,.15);
rp(cy(.045,.045,.012),-.07,.015,.03,rgGauge,0,0,P2,1);rbx(.004,.03,.004,-.077,.02,.03,rgSteel,0);
rp(cy(.004,.004,.09),-.062,.052,.02,rgBrass,0,0,1.05);rp(cy(.004,.004,.09),.062,.052,.02,rgBrass,0,0,-1.05);rp(cy(.0035,.0035,.07),-.04,.088,.0,rgBrass,P2,0,.5);rp(cy(.0035,.0035,.07),.04,.088,.0,rgBrass,P2,0,-.5);
rp(cy(.032,.032,.22),0,.012,-.22,rgGlow,P2,0,0,1);for(const z of[-.15,-.22,-.29])rp(tor(.043,.008),0,.012,z,rgBrass);
rp(cy(.012,.012,.16),0,.012,-.38,rgSteel,P2);rp(cy(.06,.022,.12),0,.012,-.46,rm,-P2);rp(tor(.058,.005),0,.012,-.515,rgBrass);rp(new THREE.SphereGeometry(.012,8,6),0,.012,-.54,rgGlow,0,0,0,1);
rbx(.045,.15,.06,0,-.115,.03,rm,-.25);for(let i=0;i<5;i++){const y=-.07-.025*i;rbx(.048,.008,.064,0,y,.03-(y+.115)*.25,rgSteel,-.25)}
mkSights(rgG,'RG',{yt:.17,yb:.086,yf:.052,zr:.043,zf:-.36});rbx(.01,.012,.1,0,-.075,-.1,rgSteel);rbx(.01,.045,.012,0,-.098,-.145,rgSteel);
rgG.position.set(0,.02,.05);
{const cell=new THREE.Mesh(bg,rgGlow),cap=new THREE.Mesh(bg,rgBrass);cell.scale.set(.045,.07,.045);cell.position.set(0,.1,.085);cap.scale.set(.05,.014,.05);cap.position.set(0,.14,.085);cell.userData.glow=cap.userData.glow=1;rgG.add(cell,cap);rgG.userData.mag=[cell,cap]}
/* red beam + blaster sound */
var bmG=new THREE.CylinderGeometry(1,1,1,10);
function rgBeam(o,d,len,raw){const s=raw?o.clone():o.clone().add(d.clone().multiplyScalar(.7)).add(V(0,-.12,0)),e=o.clone().add(d.clone().multiplyScalar(len)),mid=s.clone().add(e).multiplyScalar(.5),L=s.distanceTo(e),dir=e.clone().sub(s).normalize();
 for(const[r,c,op]of[[.1,0xff1a0a,.6],[.04,0xffe2c8,.95]]){const m=new THREE.Mesh(bmG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op}));m.position.copy(mid);m.scale.set(r,L,r);m.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(m);fx.push({m,l:.16,fade:op,r})}}
function pew(a=1,context,output){try{const audio=context||(ac??=new AudioContext());const t=audio.currentTime,out=audio.createGain();out.gain.value=vol*a*.6;out.connect(output||PlayerAudio.output(audio));
 const env=(g,t0,at,pk,hold,dec)=>{g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(pk,t0+at);g.gain.setValueAtTime(pk,t0+at+hold);g.gain.exponentialRampToValueAtTime(.0001,t0+at+hold+dec)},
 nb=pew.nb&&pew.nb.sampleRate==audio.sampleRate?pew.nb:(pew.nb=(()=>{const n=audio.sampleRate*.5|0,b=audio.createBuffer(1,n,audio.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b})());
 /* peh: a soft lip-pop */
 {const s=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();s.buffer=nb;f.type='bandpass';f.frequency.value=1900;f.Q.value=1.3;env(g,t,.002,.55,0,.045);s.connect(f);f.connect(g);g.connect(out);s.start(t);s.stop(t+.06);
  const o=audio.createOscillator(),og=audio.createGain();o.type='sine';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(150,t+.05);env(og,t,.002,.5,0,.05);o.connect(og);og.connect(out);o.start(t);o.stop(t+.07)}
 /* shoe: a breathy swish that falls from bright to dark */
 {const s=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();s.buffer=nb;f.type='bandpass';f.Q.value=2.2;f.frequency.setValueAtTime(3400,t+.02);f.frequency.exponentialRampToValueAtTime(1000,t+.22);env(g,t+.02,.03,.34,.03,.17);s.connect(f);f.connect(g);g.connect(out);s.start(t+.02);s.stop(t+.3)}
 /* euw: a sawtooth through two moving formants (oo to ee-oh to oo) while its pitch falls from a shriek to a growl */
 {const t0=t+.05,o=audio.createOscillator(),f1=audio.createBiquadFilter(),f2=audio.createBiquadFilter(),g=audio.createGain(),mix=audio.createGain();o.type='sawtooth';o.frequency.setValueAtTime(1100,t0);o.frequency.exponentialRampToValueAtTime(420,t0+.12);o.frequency.exponentialRampToValueAtTime(150,t0+.4);
  f1.type='bandpass';f1.Q.value=5;f1.frequency.setValueAtTime(330,t0);f1.frequency.linearRampToValueAtTime(720,t0+.13);f1.frequency.linearRampToValueAtTime(360,t0+.38);
  f2.type='bandpass';f2.Q.value=6;f2.frequency.setValueAtTime(2300,t0);f2.frequency.linearRampToValueAtTime(1000,t0+.16);f2.frequency.linearRampToValueAtTime(760,t0+.38);
  mix.gain.value=1.6;o.connect(f1);o.connect(f2);f1.connect(mix);f2.connect(mix);env(g,t0,.012,.6,.1,.27);mix.connect(g);g.connect(out);o.start(t0);o.stop(t0+.45);
  const b=audio.createOscillator(),bg=audio.createGain();b.type='sine';b.frequency.setValueAtTime(560,t0);b.frequency.exponentialRampToValueAtTime(75,t0+.4);env(bg,t0,.01,.3,.08,.3);b.connect(bg);bg.connect(out);b.start(t0);b.stop(t0+.45);
  const c=audio.createOscillator(),cg=audio.createGain();c.type='triangle';c.frequency.setValueAtTime(3600,t0);c.frequency.exponentialRampToValueAtTime(900,t0+.14);env(cg,t0,.004,.1,0,.14);c.connect(cg);cg.connect(out);c.start(t0);c.stop(t0+.2)}}catch(e){}}

/* ===================== worldgun.js ===================== */
/* ---------- weapons held by bots and other players: 3D model in their hands, muzzle flash, tracers from the barrel, positional shot sounds ---------- */
var WG={AR:[.95,0x3a4a52,1,0xb8651f],SMG:[.6,0x5a4a40,0,0x222222],BR:[.95,0x2f4a3a,1,0x222222],SG:[.9,0x6a5a2a,1,0x222222],VMP:[.65,0x23262b,1,0x222222],MG:[.5,0x1b2027,0,0x222222],CT:[.35,0x1d2128,0,0x222222],MP:[.4,0x3a3a4a,0,0x222222],CY:[1,0x2e3238,1,0x222222],RL:[1.1,0x7a3a2a,1,0x222222],SN:[1.2,0x2a2f4a,1,0x222222],RG:[.55,0xb02a22,0,0xff3030]};
var fMat=new THREE.MeshBasicMaterial({color:0xffe08a}),fMatR=new THREE.MeshBasicMaterial({color:0xff4040}),BOTGUNS=['AR','SMG','BR','SG','VMP','MG','MP','RG','CY','CT','AN'];
Object.assign(WG,{VA:[.94,W.VA.col,1],BP:[.82,W.BP.col,1],KTS:[.76,W.KTS.col,1],RD:[.62,W.RD.col,1],HC:[.42,W.HC.col,0],OH:[1.07,W.OH.col,1]});
BOTGUNS.push('VA','BP','KTS','RD','HC','OH');
/* magazine per weapon: [width, height, depth, y, z (fraction of gun length), tilt, colour]. Light colours so they read against the dark bodies */
/* pump-action shotgun modelled on the reference picture: ventilated rib barrel, magazine tube with end cap, ribbed wooden pump, steel receiver with brown plate, trigger guard, wooden stock. Built along +z (muzzle at z=.9); the pump pieces are returned in userData.pump so they can slide */
function mkSG(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),steel=rm||M(0x555a62),wood=M(0x9a602b),dwood=M(0x5c3a1c),gm=M(0x2b3037),blk=M(0x14171a),rib=M(0x424950),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.062,.09,.24,0,0,.04,steel);box(.066,.028,.08,0,.02,.09,blk);box(.066,.04,.05,0,-.005,-.03,M(0x7a3f2b));
 box(.04,.04,.78,0,.036,.51,gm);box(.022,.01,.7,0,.061,.5,blk);for(let i=0;i<12;i++)box(.03,.012,.016,0,.066,.2+i*.05,rib);
 box(.05,.05,.024,0,.036,.894,blk);
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,.56,10),M(0x3a4047));t.rotation.x=Math.PI/2;t.position.set(0,-.012,.38);g.add(t);box(.044,.044,.03,0,-.012,.675,blk);
 const pump=[box(.074,.066,.26,0,-.016,.36,wood),box(.076,.07,.02,0,-.016,.49,dwood)];for(const z of[.27,.31,.35,.39,.43])pump.push(box(.078,.012,.012,0,-.016,z,dwood));
 box(.012,.012,.09,0,-.068,.02,gm);box(.012,.034,.012,0,-.05,.062,gm);box(.012,.034,.012,0,-.05,-.025,gm);box(.008,.026,.008,0,-.05,.02,steel);
 box(.052,.08,.15,0,-.035,-.15,wood,-.08);box(.048,.115,.3,0,-.07,-.3,wood,-.14);box(.05,.135,.018,0,-.105,-.46,M(0x2a2018),-.14);box(.01,.02,.016,0,-.135,-.37,M(0xaaaaaa));
 mkSights(g,'SG',{yt:.098,yb:.066,yf:.066,zr:.23,zf:.885});g.userData.a={r:[0,-.1,-.06],l:[0,-.075,.36],m:[0,-.1,.08]};g.userData.mags=[];g.userData.pump=pump;return g}
/* Coyote: LMG modelled on the reference picture: blocky muzzle device with two bores, striped shroud, forward handle, big drum magazine and an open-frame stock around an energy tube. Built along +z, muzzle at z=.95 */
function mkCY(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),body=rm||M(0x2e3238),dk=M(0x24282d),md=M(0x3a3f46),lt=M(0x6a6f75),tan=M(0xc9a46a),blk=M(0x0b0b0c),
  box=(w,h,d,x,y,z,m,rx,ry)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;g.add(o);return o},
  cyl=(r,h,x,y,z,m,ax)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);if(ax)o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o};
 box(.1,.12,.44,0,0,.1,body);box(.125,.07,.62,0,.095,.42,md);for(const z of[.28,.46,.64])box(.04,.008,.2,0,.134,z,tan,0,.6);
 box(.1,.09,.5,0,-.012,.55,dk);box(.04,.03,.42,0,-.07,.58,lt);box(.02,.05,.02,0,-.1,.42,lt);box(.02,.05,.02,0,-.1,.6,lt);box(.025,.02,.2,0,-.125,.51,lt);
 box(.15,.15,.16,0,0,.87,md);box(.045,.05,.012,-.035,0,.957,blk);box(.045,.05,.012,.035,0,.957,blk);mkSights(g,'CY',{yt:.205,yb:.13,yf:.13,zr:.14,zf:.745});
 box(.05,.14,.07,0,-.13,0,dk,.25);box(.012,.012,.1,0,-.085,.12,dk);box(.012,.035,.012,0,-.07,.17,dk);box(.012,.035,.012,0,-.07,-.05,dk);
 box(.03,.03,.38,0,.08,-.3,dk);box(.03,.03,.34,0,-.06,-.28,dk,-.12);box(.035,.2,.03,0,0,-.47,dk);cyl(.02,.3,0,.01,-.3,M(0xd9b0c4),1);
 box(.1,.05,.1,0,-.095,.3,dk);
 const drum=cyl(.085,.2,0,-.19,.28,md),cap=cyl(.075,.025,0,-.3,.298,dk);drum.rotation.x=cap.rotation.x=-.18;
 g.userData.a={r:[0,-.13,0],l:[0,-.115,.51],m:[0,-.19,.28]};g.userData.mags=[drum,cap];return g}
/* 1911: single-stack semi-auto pistol modelled on the reference picture: blued slide with rear serrations, spur hammer, beavertail, checkered wood grips with screws, trigger guard. Built along +z, muzzle at z=.35 */
function mk1911(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),sl=rm||M(0x1d2128),fr=M(0x2a2f36),wood=M(0x7b3f1d),dwood=M(0x5a2c12),blk=M(0x0c0d0f),steel=M(0x8a9098),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.032,.04,.33,0,.036,.17,sl);box(.034,.004,.3,0,.056,.17,blk);for(let i=0;i<6;i++)box(.034,.034,.006,0,.038,.012+i*.014,blk);
 box(.024,.022,.03,0,.03,.345,fr);mkSights(g,'CT',{yt:.077,yb:.058,yf:.058,zr:.03,zf:.33});
 box(.03,.028,.24,0,.0,.13,fr);box(.034,.01,.1,0,.0,.2,fr);
 box(.03,.1,.052,0,-.07,.0,fr,.26);box(.007,.092,.046,.0185,-.07,.0,wood,.26);box(.007,.092,.046,-.0185,-.07,.0,wood,.26);for(const s of[-1,1])box(.008,.016,.016,s*.0195,-.045,.0,dwood,.26);
 box(.028,.016,.05,0,.018,-.035,fr,-.2);box(.01,.02,.016,0,.054,-.022,sl,.5);
 box(.01,.01,.075,0,-.03,.083,fr);box(.01,.03,.01,0,-.015,.12,fr);box(.006,.02,.008,0,-.018,.063,steel);box(.004,.012,.03,.017,.014,.07,steel);
 const mg=[box(.026,.02,.05,0,-.125,-.012,blk,.26),box(.024,.04,.042,0,-.1,-.004,fr,.26)];
 g.userData.a={r:[0,-.056,-.004],l:[0,-.103,.008],m:[0,-.11,-.008]};g.userData.mags=mg;return g}
/* Revolver: 6 inch blued double-action modelled on the reference picture: vented rib barrel with underlug, ramp front sight, fluted cylinder, spur hammer, walnut grips with gold medallion */
function mkRV(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),bl=rm||M(0x1b2027),fr=M(0x242a32),wood=M(0x6a3d1c),dw=M(0x4a2810),blk=M(0x0b0c0e),gold=M(0xd4b24c),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.026,.032,.34,0,.044,.36,bl);box(.014,.01,.34,0,.066,.36,blk);for(let i=0;i<5;i++)box(.016,.012,.03,0,.07,.24+i*.06,fr);box(.026,.03,.27,0,.013,.34,bl);box(.014,.014,.04,0,.018,.505,blk);
 mkSights(g,'MG',{yt:.1,yb:.078,yf:.071,zr:.012,zf:.5});box(.028,.036,.012,0,.043,.535,fr);
 box(.034,.075,.15,0,.03,.07,fr);box(.03,.016,.16,0,.07,.07,bl);
 const cy=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.06,12),bl);cy.rotation.x=Math.PI/2;cy.position.set(0,.036,.11);g.add(cy);
 for(let i=0;i<6;i++){const a=i/6*6.283,f=box(.007,.012,.062,Math.sin(a)*.037,.036+Math.cos(a)*.037,.11,blk);f.rotation.z=-a}
 box(.01,.04,.018,0,.07,-.035,fr,-.55);box(.006,.03,.014,0,.05,-.02,fr,-.3);
 box(.034,.108,.062,0,-.065,-.042,wood,.3);box(.01,.08,.012,.0,-.07,-.075,bl,.3);for(const s of[-1,1])box(.006,.016,.016,s*.0195,-.05,-.042,gold,.3);for(const s of[-1,1])box(.004,.09,.05,s*.0185,-.07,-.042,dw,.3);
 box(.01,.01,.09,0,-.03,.068,fr);box(.01,.034,.01,0,-.016,.112,fr);box(.006,.022,.008,0,-.012,.05,blk);box(.014,.016,.03,0,.008,.0,fr);
 g.userData.a={r:[0,-.062,-.05],l:[0,-.108,-.04],m:[0,.036,.11]};g.userData.mags=[];return g}
/* iron sights: thin, not blocky. ap = rear aperture (two uprights + top and bottom bar, hole in the middle) with a front post inside protective ears;
   otherwise a rear notch (two thin blocks with a gap) with a front blade. yt is the height of the sight line (aperture centre / top of the notch and blade tip),
   yb the surface the rear sight stands on, yf the surface the front sight stands on, zr / zf the positions along the gun. Coordinates are in the group's own space. */
function modelWeapon(k,finish,g){
 const build=MODELS[k]||({MG:mkRV,CT:mk1911,SG:mkSG,CY:mkCY,MVR:mkMVR})[k]||MODELS.AR;
 return build(g,finish);
}
const weaponTemplates=new Map();
function gunCopy(template){
 const nodes=new Map();
 function copy(original){
  const node=original.isMesh?new THREE.Mesh(original.geometry,original.material):new THREE.Group();
  nodes.set(original,node);
  node.name=original.name;node.position.copy(original.position);node.quaternion.copy(original.quaternion);node.scale.copy(original.scale);
  node.visible=original.visible;node.castShadow=original.castShadow;node.receiveShadow=original.receiveShadow;node.frustumCulled=original.frustumCulled;
  node.userData={...original.userData};
  for(const child of original.children)node.add(copy(child));
  return node;
 }
 const model=copy(template);
 for(const property of ['mags','pump','units','breakAction','rotors','keyReload','keyGlow'])if(template.userData[property])model.userData[property]=template.userData[property].map(node=>nodes.get(node));
 return model;
}
function buildGun(k,finish){
 const key=k+'|'+(finish?.uuid||'');
 let template=weaponTemplates.get(key);
 if(!template){
  template=modelWeapon(k,finish,new THREE.Group());
  const data=template.userData;
  if(!data.authored)weldModel(template);
  data.fit=holdFit(template);
  if(LX.mergeRig){
   data.mountBounds=attMuzzle(template,1);
   LX.mergeRig(template,{hip:[...(data.mags||[]),...(data.pump||[]),...(data.breakAction||[]),...(data.rotors||[]),...(data.keyReload||[]),...(data.keyGlow||[])]});
  }
  if(weaponTemplates.size>=100)weaponTemplates.delete(weaponTemplates.keys().next().value);
  weaponTemplates.set(key,template);
 }
 return gunCopy(template);
}
/* where a held weapon sits on a character: scaled so the distance from the stock (or grip, for pistols) to the foregrip is within the arm's reach, stock in the shoulder pocket for rifles, arms extended for pistols */
function holdFit(g){const bb=new THREE.Box3().setFromObject(g),A=g.userData.a||{},rz=(A.r||[0,0,0])[2],lz=(A.l||[0,0,rz+.4])[2],minz=bb.min.z,len=Math.max(.2,bb.max.z-minz),s=Math.min(1,.62/Math.max(.3,lz-minz),1.0/len),stock=minz<-.18;return{s,gz:stock?.1-minz*s:.46-rz*s,mz:bb.max.z}}
function setHeld(b,k,cm,at,pap=0){cm=typeof cm==='string'?cm:'';at=Array.isArray(at)?at:[];const ak=at.join(','),charm=b.net&&!b.hb?peerLooks.get(b.id)?.charm:'';if(!hasOwn(W,k)||(b.wk==k&&b.hg&&(b.cm||'')==cm&&(b.at||'')==ak&&b.papStage===pap&&b.charm===charm))return;if(b.hg)b.m.remove(b.hg);b.wk=k;b.cm=cm;b.at=ak;b.charm=charm;b.papStage=pap;b.hg=buildGun(k,pap?zPapMat(pap):camoRm(k,cm));b.hold=b.hg.userData.fit;if(at&&at.length&&typeof attApply=='function')try{attApply(b.hg,k,at,1)}catch(e){}addPassCharm(b.hg,charm);b.hg.position.set(.12,1.3,.18);b.m.add(b.hg)}
function weaponMuzzleLocal(model){
 const data=model.userData;
 if(data.barrelExit)return data.barrelExit;
 if(!data.muzzleBase){
  const source=data.muzzle||attMuzzle(model,1);
  data.muzzleBase={x:source.x||0,y:Number.isFinite(source.y)?source.y:0,
   z:Number.isFinite(source.z??source.tip)?source.z??source.tip:0};
 }
 return data.muzzleBase;
}
function weaponMuzzleWorld(model,hand=0){
 const barrel=model.userData.units?.[hand]||model;
 const point=weaponMuzzleLocal(barrel);
 barrel.updateWorldMatrix(true,false);
 return barrel.localToWorld(V(point.x,point.y,point.z+.012));
}
function muzzle(b,hand=0,k=b.wk){
 if(b.hg&&b.wk===k)return weaponMuzzleWorld(b.hg,hand);
 const l=(WG[k]||WG.AR)[0],r=b.m.rotation.y,ox=.12,oz=.18+l*1.05,s=Math.sin(r),c=Math.cos(r);
 return V(b.x+ox*c+oz*s,(b.y||0)+1.36-.3*(b.pc||0)-.42*(b.psl||0)-1.05*(b.pp||0),b.z-ox*s+oz*c);
}
function muzzleFlash(p,k){const m=new THREE.Mesh(sg,k=='RG'?fMatR:fMat);m.scale.setScalar(W[k]?.pel>1?.22:.13);m.position.copy(p);S.add(m);fx.push({m,l:.05})}
function otherSnd(k,p,pap=0){const v=Math.max(0,1-p.distanceTo(C.position)/55);if(v<.06)return;arenaSoundCaption('Gunfire',p.x,p.z);if(pap)return papSnd({...W[k],k,pap},k==='RG',v);if(k==='KEY')return keyshooterSound(v*.85);if(k=='RG')return pew(v);if(GS[k])return snd(GS[k],v*.8);noise(k=='SG'?.22:.1,k=='SG'?1800:3500,.3*v);beep(k=='SG'?90:140,.08,'sine',.12*v)}
function remoteShot(b,k,end,col,hand=0,pap=0){const mz=muzzle(b,hand,k),dv=end.clone().sub(mz),L=dv.length();if(L<.1)return;b.viewShot=t0;dv.divideScalar(L);if(k=='RG'){rgBeam(mz,dv,L,1);rgImpact(end)}else if(k==='KEY'){jupiterRemoteVolley(mz,dv,L,pap);if(b.hg?.userData.keyGlow)b.hg.userData.keyPulse=t0}else if(k=='TEA'&&typeof teaBeam=='function'){teaBeam(mz,dv,L,1);JX.tea&&JX.tea(end,W.TEA.ex)}else tr(mz,dv,L,col||PASS_TRACERS[peerLooks.get(b.id)?.tracer]?.color||0xffd27a,.07,1);muzzleFlash(mz,k);otherSnd(k,mz,pap)}
function falloff(w,d){return w.pw||w.k=='RG'?1:Math.max(w.pel>1?.4:.45,1-d/(w.pel>1?30:140))}

/* ===================== anim.js ===================== */
/* ---------- animation + movement: character rig with IK arms, first-person hands, reload animations, mantling, wall jumps ---------- */
var fpG=new THREE.Group(),fpAnchors=null;gun.add(fpG);fpG.visible=false;
var eas=t=>t*t*(3-2*t),rlP=()=>rel>0&&cw()?1-rel/(relT||cw().rl):-1;
function reloadPresentation(p){
 if(p<0)return 0;
 const raise=eas(cl(p/.22,0,1)),lower=eas(cl((1-p)/.24,0,1));
 return raise*lower*(.82+.18*Math.sin(Math.PI*p));
}
const rlBell=()=>reloadPresentation(rlP());
var rlRot=()=>(cw()?.k==='AN'?.18:.42)*rlBell(),rlRoll=()=>(cw()?.k==='AN'?.16:-.3)*rlBell(),
 rlX=()=>(cw()?.k==='AN'?-.024:.1)*rlBell(),rlY=()=>(cw()?.k==='AN'?-.035:.03)*rlBell()-(P.mt?.12*Math.sin(Math.PI*P.mt.t/P.mt.d):0);
/* two-bone arm: upper arm and forearm groups meshes hang along -y; ik() points them so the hand reaches H */
const ikDelta=V(),ikDirection=V(),ikPlane=V(),ikElbow=V(),ikAxis=V(),ikDown=V(0,-1,0);
function ik(S0,H0,hint,arm){
 if(arm.hand)arm.hand.quaternion.identity();
 const L1=arm.L1,L2=arm.L2,d=ikDelta.subVectors(H0,S0);
 const raw=d.length(),dist=cl(raw,Math.abs(L1-L2)+.014,L1+L2-.003);
 const dir=raw>.0001?ikDirection.copy(d).multiplyScalar(1/raw):ikDirection.set(0,-1,0);
 const a=(L1*L1-L2*L2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,L1*L1-a*a));
 const pr=ikPlane.copy(hint).addScaledVector(dir,-hint.dot(dir));
 if(pr.lengthSq()<1e-6)pr.set(1,0,0).addScaledVector(dir,-dir.x);
 const elbow=ikElbow.copy(S0).addScaledVector(dir,a).addScaledVector(pr.normalize(),h);
 arm.up.position.copy(S0);arm.up.quaternion.setFromUnitVectors(ikDown,ikAxis.subVectors(elbow,S0).normalize());
 arm.fo.position.copy(elbow);
 arm.fo.quaternion.setFromUnitVectors(ikDown,ikAxis.copy(S0).addScaledVector(dir,dist).sub(elbow).normalize());
}
/* Align the opening of the hand with the grip, then solve for the wrist at the exact contact point. */
const gripX=V(),gripY=V(),gripZ=V(),gripWrist=V(),gripShoulder=V(),gripElbow=V(),gripMatrix=new THREE.Matrix4(),gripTurn=new THREE.Quaternion();
function gripArm(shoulder,point,hint,arm,axis,side,wristDirection){
 if(!arm.hand){ik(shoulder,point,hint,arm);return}
 const x=gripX.copy(axis).normalize();
 const y=wristDirection?gripY.copy(wristDirection):gripY.subVectors(shoulder,point);
 y.addScaledVector(x,-y.dot(x));
 if(y.lengthSq()<.0001)y.copy(hint).addScaledVector(x,-hint.dot(x));
 y.normalize();
 const z=gripZ.crossVectors(x,y);
 if(!wristDirection&&z.x*side>0){x.negate();z.negate()}
 gripTurn.setFromRotationMatrix(gripMatrix.makeBasis(x,y,z));
 const size=arm.hand.scale.x,wrist=gripWrist.set(0,-.088*size,.03*size).applyQuaternion(gripTurn).negate().add(point);
 const reach=arm.L1+arm.L2-.006,distance=shoulder.distanceTo(wrist);
 if(arm.firstPerson&&distance>reach)shoulder=gripShoulder.copy(shoulder).lerp(wrist,1-reach/distance);
 // A pistol fixes the wrist direction as well as the grip point. Keep the elbow
 // behind the wrist so the forearm meets the back of the glove.
 const elbowHint=wristDirection?gripElbow.copy(y).addScaledVector(hint,.5):hint;
 ik(shoulder,wrist,elbowHint,arm);
 arm.hand.quaternion.copy(arm.fo.quaternion).invert().multiply(gripTurn);
}
/* ---------- reload 2.0 ----------
   Each weapon reloads in its own way and the part being loaded really travels with the left hand:
   mag     magazine is pulled out, dropped, a fresh one is fetched from the belt, pushed in and slapped home
   shell   shotgun shells are fetched one at a time and pushed into the port under the receiver, then the pump is racked
   rocket  a rocket is fetched and slid into the rear of the launcher
   Poses are in the local space of the host group (camera-held gun for the player, world gun for bots). fz = -1 / +1 is the gun's forward axis. */
var RLK={CT:'mag',CY:'mag',AR:'mag',SMG:'mag',BR:'mag',VMP:'mag',SN:'mag',MG:'mag',MP:'mag',RG:'mag',SG:'shell',RL:'rocket',BP:'shell',KTS:'shell',OH:'round'};
const shellLoadStart=.08,shellLoadEnd=.82,shellSeat=.88;
var mb=m=>m.userData.b0||(m.userData.b0={x:m.position.x,y:m.position.y,z:m.position.z,rx:m.rotation.x});
const localTurn=new THREE.Quaternion();
function toLoc(m,v,host){
 const point=v.clone(),chain=[];
 for(let parent=m.parent;parent&&parent!==host;parent=parent.parent)chain.push(parent);
 for(let i=chain.length-1;i>=0;i--){
  const {quaternion,scale}=chain[i];
  point.applyQuaternion(localTurn.copy(quaternion).invert()).divide(scale);
 }
 return point;
}
function slotC(mags,host){
 if(mags.c)return mags.c;
 const center=V();
 for(const m of mags){
  const b=mb(m),point=V(b.x,b.y,b.z);
  for(let parent=m.parent;parent&&parent!==host;parent=parent.parent){
   parent.updateMatrix();point.applyMatrix4(parent.matrix);
  }
  center.add(point);
 }
 return mags.c=center.divideScalar(mags.length);
}
function rlPose(kind,p,A,fz,n,mags,host,pl,cycles){
 const bk=-fz,L0=V(...A.l),o={h:L0.clone(),mo:V(0,0,0),mr:0,mv:1,pv:0,pp:V(0,0,0),pu:V(0,0,bk*(pl||0)),ev:0,cy:0};
 if(p<0){o.h.add(o.pu);return o}
 const M0=mags.length?slotC(mags,host):V(...A.m),Pq=M0.clone().add(V(-.12,-.28,bk*.26));
 if(kind=='mag'){const HO=V(...(A.ho||[0,-.05,0])),D=V(...(A.pd||[0,-.3,0])),Mh=M0.clone().add(HO),Dh=Mh.clone().add(D),Eh=Dh.clone().add(V(-.12,D.y>0?.06:-.1,bk*.04)),carry=h=>{o.h.copy(h);o.mo.copy(h).sub(Mh);o.cy=1};
  if(p<.14)o.h.copy(L0).lerp(Mh,eas(p/.14));
  else if(p<.3)carry(Mh.clone().lerp(Dh,eas((p-.14)/.16)));
  else if(p<.4)carry(Dh.clone().lerp(Eh,eas((p-.3)/.1)));
  else if(p<.58){const t=(p-.4)/.1;const swing=eas(cl((p-.4)/.18,0,1));o.h.copy(Eh).lerp(Pq,swing);o.h.x-=.063*Math.sin(Math.PI*swing);if(t<1){o.mo.copy(Eh).sub(Mh).add(V(-.06*t,-2*t*t,0));o.mr=1.4*t}else o.mv=0}
  else if(p<.66){o.h.copy(Pq);o.mo.copy(Pq).sub(Mh);o.cy=1}
  else if(p<.84){
   const t=eas((p-.66)/.18),loaded=Pq.clone().lerp(Dh,t);
   loaded.x-=.070*Math.sin(Math.PI*t);
   loaded.z+=fz*.047*Math.sin(Math.PI*t);
   carry(loaded);
  }
  else if(p<.91){
   const seat=cl((p-.84)/.07,0,1);
   carry(Dh.clone().lerp(Mh,seat*seat));
  }
  else{
   const release=eas((p-.91)/.09);
   o.h.copy(Mh).lerp(L0,release);o.h.y-=.036*Math.sin(Math.PI*release);
  }
  o.ev=(p>.3?1:0)+(p>.86?1:0)}
 else if(kind=='shell'){const Mh=M0.clone().add(V(0,-.03,0)),c0=shellLoadStart,c1=shellLoadEnd,cs=(c1-c0)/n;
  if(p<c0)o.h.copy(L0).lerp(Mh,eas(p/c0));
  else if(p<c1){const x=(p-c0)/cs,c=Math.floor(x),u=x-c;o.ev=c;
   if(u<.28)o.h.copy(Mh).lerp(Pq,eas(u/.28));
   else if(u<.4){o.h.copy(Pq);o.pv=1;o.pp.copy(Pq)}
   else if(u<.75){o.h.copy(Pq).lerp(Mh,eas((u-.4)/.35));o.pv=1;o.pp.copy(o.h)}
   else if(u<shellSeat){o.h.copy(Mh);const t=(u-.75)/(shellSeat-.75);o.pp.copy(Mh).add(V(0,.03*t,fz*.05*t));o.pv=t<.8?1:0;o.ev=c+1}
   else{o.h.copy(Mh);o.ev=c+1}
   if(o.pv)o.pp.add(V(0,.02,fz*.03))}
  else{const t=(p-c1)/(1-c1),pl2=!cycles||t<.35?0:.11*Math.sin(Math.PI*Math.min(1,(t-.35)/.6));o.pu=V(0,0,bk*pl2);o.h.copy(Mh).lerp(L0,t<.3?eas(t/.3):1).add(o.pu);o.ev=n}}
 else if(kind==='round'){
  const bolt=M0.clone().add(V(-fz*.04,-.013,bk*.058));
  const slide=eas(cl((p-.08)/.18,0,1))*(1-eas(cl((p-.73)/.18,0,1)));
  o.pu.z=bk*.092*slide;
  if(p<.26)o.h.copy(L0).lerp(bolt,eas(p/.16)).add(o.pu);
  else if(p<.43)o.h.copy(bolt).add(o.pu).lerp(Pq,eas((p-.26)/.17));
  else if(p<.68){o.h.copy(Pq).lerp(M0,eas((p-.43)/.25));o.pp.copy(o.h).add(V(0,.017,fz*.028));o.pv=1}
  else if(p<.91)o.h.copy(M0).lerp(bolt,eas((p-.68)/.13)).add(o.pu);
  else o.h.copy(bolt).lerp(L0,eas((p-.91)/.09));
 }
 else{const Rs=M0.clone().add(V(-.07,-.1,bk*.34)),Rm=M0.clone().add(V(0,0,fz*.2));
  if(p<.15)o.h.copy(L0).lerp(Pq,eas(p/.15));
  else if(p<.3){o.h.copy(Pq);o.pv=1}
  else if(p<.55){o.h.copy(Pq).lerp(Rs,eas((p-.3)/.25));o.pv=1}
  else if(p<.8){const t=eas((p-.55)/.25);o.h.copy(Rs).lerp(Rm,t);o.pv=t<.88?1:0}
  else o.h.copy(Rm).lerp(L0,eas((p-.8)/.2));
  if(o.pv)o.pp.copy(o.h).add(V(0,.02,fz*.16));o.ev=(p>.55?1:0)+(p>.8?1:0)}
 return o}
function mkProp(kind,fz){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),cyl=(r,h,c,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),M(c));m.rotation.x=Math.PI/2;m.position.z=z;g.add(m)};
 if(kind=='shell'){cyl(.02,.075,0xc23b2c,.01);cyl(.0215,.025,0xc9a94d,-.04)}
 else if(kind==='round'){cyl(.01,.057,0xc9a94d,.006);cyl(.012,.009,0xb19042,-.025);cyl(.006,.024,0x9a694c,.044)}
 else{cyl(.032,.34,0x9aa0a6,0);const n=new THREE.Mesh(new THREE.ConeGeometry(.032,.1,10),M(0xc0392b));n.rotation.x=Math.PI/2;n.position.z=.22;g.add(n);for(let i=0;i<3;i++){const f=new THREE.Mesh(bg,M(0x5a5f66));f.scale.set(.07,.008,.06);f.position.z=-.15;f.rotation.z=i*1.047;g.add(f)}}
 g.rotation.y=fz<0?Math.PI:0;g.userData.kind=kind;g.visible=false;return g}
function propFor(host,kind,fz){let pr=host.userData.prop;if(kind!='shell'&&kind!='rocket'&&kind!='round'){if(pr)pr.visible=false;return null}
 if(!pr||pr.userData.kind!=kind){if(pr)host.remove(pr);pr=mkProp(kind,fz);host.add(pr);host.userData.prop=pr}return pr}
/* keep the hand inside the arm's reach; whatever it carries (mag, shell, rocket) is shifted by the same amount so it never floats free of the hand */
function clampHand(o,S0,tw,q,R){const d=tw(o.h).sub(S0),L=d.length();if(L<=R)return;const sc=tw(V(1,0,0)).sub(tw(V(0,0,0))).length()||1,dv=d.multiplyScalar((R/L-1)/sc).applyQuaternion(q.clone().invert());o.h.add(dv);if(o.cy)o.mo.add(dv);if(o.pv)o.pp.add(dv)}
function applyRl(o,mags,pump,host,kind,fz){
 const active=o.pv||o.mr||!o.mv||o.mo.lengthSq()||o.pu.lengthSq();
 const model=host===gun?fpG:host;
 if(!active&&model.userData.restored)return;
 model.userData.restored=!active;
 for(const m of mags){const b=mb(m),d=toLoc(m,o.mo,host);m.position.set(b.x+d.x,b.y+d.y,b.z+d.z);m.rotation.x=b.rx+o.mr;m.visible=!!o.mv}
 if(host===gun){const gm=typeof attFpModel=='function'&&cw()?attFpModel(cw().k):null,G=gm&&gm.children.find(c=>c.userData.att&&c.userData.mg),pv=G&&G.userData.mg;if(pv){const b=pv.userData.mb,d=toLoc({parent:gm},o.mo,host);pv.position.set(b.x+d.x,b.y+d.y,b.z+d.z);pv.rotation.x=o.mr;pv.visible=!!o.mv}}
 for(const m of pump){const b=mb(m),d=toLoc(m,o.pu,host);m.position.set(b.x+d.x,b.y+d.y,b.z+d.z)}
 const pr=propFor(host,kind,fz);if(pr){pr.visible=!!o.pv;if(o.pv)pr.position.copy(o.pp)}}
// The break-action hand targets live in model space so they follow the same hinge and strip in both rigs.
function annihilatorHandPose(model,progress){
 animateAnnihilatorReload(model,progress);
 const p=Math.max(0,progress),[barrel,,strip]=model.userData.breakAction,A=model.userData.a;
 const r=V(...A.r),rest=V(...A.l),l=rest.clone(),rightAxis=V(0,1,.24);
 const axis=V(.06,1,-.09),side=V(.112,-.124,.025),clear=V(.147,-.121,.046);
 const fore=V(.057,.014,.087).applyQuaternion(barrel.quaternion).add(barrel.position);
 const stripGrip=V(.056,-.019,-.002).applyQuaternion(strip.quaternion).add(strip.position);
 const fetch=V(.229,-.305,-.047);
 const step=(a,b,c,d)=>l.copy(a).lerp(b,eas(cl((p-c)/(d-c),0,1)));
 if(p<.09)step(rest,side,0,.09);
 else if(p<.18)step(side,fore,.09,.18);
 else if(p<.315)l.copy(fore);
 else if(p<.385)step(fore,clear,.315,.385);
 else if(p<.5)step(clear,fetch,.385,.5);
 else if(p<.53)step(fetch,stripGrip,.50,.53);
 else if(p<.75)l.copy(stripGrip);
 else if(p<.82)step(stripGrip,clear,.75,.82);
 else if(p<.902)step(clear,fore,.82,.902);
 else if(p<.906)l.copy(fore);
 else step(fore,rest,.906,1);
 const release=eas(cl(p/.13,0,1))*eas(cl((1-p)/.13,0,1));
 axis.lerp(V(.14,.64,.64),release);
 const load=eas(cl((p-.45)/.085,0,1))*eas(cl((.82-p)/.085,0,1));
 axis.lerp(V(.31,.93,-.29),load);
 return {r,l,rightAxis,axis,wristDirection:V(0,0,-1)};
}

const usesPistolGrip=(weapon,key)=>weapon.sidearm||['CT','MG','MP','DS'].includes(key);
function pistolSupport(anchors,direction){
 const [x,y,z]=anchors.r;
 return [x-.039,y-.048,z+direction*.032];
}
function gripPistol(shoulder,point,hint,arm,rotation,side,direction,support=true){
 const axis=V(support&&side<0?.27:0,1,direction*.24).multiplyScalar(side*direction).applyQuaternion(rotation);
 const wristDirection=V(0,0,-direction).applyQuaternion(rotation);
 gripArm(shoulder,point,hint,arm,axis,side,wristDirection);
}

const authoredGrip={AN:annihilatorHandPose,KEY:(model,progress)=>keyshooterReloadPose(model,progress)};
function gripAuthoredWeapon(pose,transform,rotate,right,left,shoulderR,shoulderL,hintR,hintL){
 const orientation=right.firstPerson?-1:1;
 if(pose.wristDirection){
  const wristDirection=rotate(pose.wristDirection);
  gripArm(shoulderR,transform(pose.r),hintR,right,rotate(pose.rightAxis.multiplyScalar(orientation)),1,wristDirection);
  gripArm(shoulderL,transform(pose.l),hintL,left,rotate(pose.axis.multiplyScalar(-orientation)),-1,wristDirection);
 }else{
  gripArm(shoulderR,transform(pose.r),hintR,right,rotate(pose.rightAxis),1);
  gripArm(shoulderL,transform(pose.l),hintL,left,rotate(pose.axis),-1);
 }
}

/* first-person arms (children of the camera) */
var fpArm;
var curAnch=()=>fpAnchors,curMags=()=>fpG.userData.mags||[];
var pf=1;var _sht=shoot;shoot=function(){const w=cw();_sht();if(w.k=='SG'||w.pumpAction)pf=0};
function fpShoulder(side){
 const ads=ST.ads||0;
 return side>0?V(.285-.018*ads,-.56-.024*ads,.095):V(-.278+.055*ads,-.57-.018*ads,.09);
}
function hideFP(){for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=false;const pr=gun.userData.prop;if(pr)pr.visible=false}
function fpUpdate(dt){const w=cw(),vis=run&&!P.dead&&!over&&w,k=vis&&w.k;for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=!!vis;if(!vis){const pr=gun.userData.prop;if(pr)pr.visible=false;return}
 const p=rlP();
 fpArm.r.hand.scale.setScalar(k==='AN'?.81:k==='KEY'?.91:1);
 fpArm.l.hand.scale.setScalar(k==='AN'?.78:k==='KEY'?.88:1);
 if(authoredGrip[k]){
  if(p>=0)FOL.player(w,k,p,0);else FOL.reset();
  P.ev=0;const q=gun.quaternion;fpG.updateMatrix();
  gripAuthoredWeapon(authoredGrip[k](fpG,p),point=>point.applyMatrix4(fpG.matrix).applyQuaternion(q).add(gun.position),
   axis=>axis.applyQuaternion(fpG.quaternion).applyQuaternion(q),fpArm.r,fpArm.l,
   fpShoulder(1),fpShoulder(-1),V(.50,-1,.22),V(-.62,-1,.23));
  return;
 }
 if(pf<1)pf=Math.min(1,pf+dt/Math.max(.35,w.r*.9));
 const anchors=curAnch(k),pistol=usesPistolGrip(w,k),support=pistol&&k!=='DS';
 const A=support?{...anchors,l:pistolSupport(anchors,-1)}:anchors,R0=V(...A.r),kind=RLK[k]||'mag',mg=curMags(k),pm=fpG.userData.pump||[],cycles=kind==='shell'&&pm.length>0,
  pl=cycles&&p<0&&pf<1?.1*Math.sin(Math.PI*cl((pf-.12)/.7,0,1)):0,
  o=rlPose(kind,p,A,-1,p>=0&&reloadPlan?.weapon===w?reloadPlan.steps:cl(w.m-w.mag,1,k==='SG'?6:12),mg,gun,pl,cycles);
 if(p>=0){FOL.player(w,k,p,o.ev);P.ev=o.ev}else{P.ev=0;FOL.reset()}
 const q=gun.quaternion,gp=gun.position,tw=a=>a.clone().applyQuaternion(q).add(gp);
 
 const shoulder=fpShoulder(-1),normalGrip=tw(p<0?o.h:V(...A.l)),reach=shoulder.distanceTo(normalGrip);
 // The support shoulder rolls forward when a long weapon is carried away from the eye.
 const supportReach=fpArm.l.L1+fpArm.l.L2-.14;
 if(reach>supportReach)shoulder.lerp(normalGrip,1-supportReach/reach);
 clampHand(o,shoulder,tw,q,supportReach+.08);applyRl(o,mg,pm,gun,kind,-1);
 if(k==='RG'&&p<0)for(const mag of mg)mag.visible=ST.ads<=.2;
 if(pistol){
  gripPistol(fpShoulder(1),tw(R0),V(.48,-1,.27),fpArm.r,q,1,-1,support);
  gripPistol(shoulder,tw(o.h),V(-.4,-1,.3),fpArm.l,q,-1,-1,support);
 }else{
  gripArm(fpShoulder(1),tw(R0),V(.48,-1,.27),fpArm.r,V(0,1,-.24).applyQuaternion(q),1);
  gripArm(shoulder,tw(o.h),V(-.4,-1,.3),fpArm.l,V(0,0,1).applyQuaternion(q),-1);
 }
}
/* Equip the same geometry used by other players, the arsenal and wall buys. */
setGun=function(){
 const k=cw().k,fit=applyCamo(k),l=WG[k]?.[0]||.6;
 gun.remove(fpG);
 fpG=buildGun(k,fit);fpG.userData.camo=myCamo(k);
 if(mode!=='Zombies')addPassCharm(fpG,passExtra('charm'));
 fpG.rotation.y=Math.PI;
 const pz=fpG.userData.viewOffset??(['SG','CY','MVR'].includes(k)?-.12:-.14+.1*l);
 fpG.position.z=pz;gun.add(fpG);
 const {a}=fpG.userData,flip=([x,y,z])=>[-x,y,-z],position=v=>{const a=flip(v);a[2]+=pz;return a};
 fpAnchors={r:position(a.r),l:position(a.l),m:position(a.m),pd:a.pd&&flip(a.pd),ho:a.ho&&flip(a.ho)};
 gf.material.color.setHex(k==='KEY'?0x8cefff:k==='RG'?0xff4040:0xffdd66);gf.visible=false;muzzleFlashUntil=-1;
 gun.position.copy(FP_REST);pf=1;
};
/* third-person character: armoured body, legs that walk, two IK arms holding the weapon */
/* a human built from tapered limbs and spheres: head with face, ears and hair or helmet, neck, oval torso, tactical vest, jointed arms and legs, boots.
   Human characters use the operator roster. Undead have a separate mesh and material palette.
   v2: every limb is BAKED once into a few merged meshes per material (HV.cache, shared by every person), so a detailed soldier costs only a handful of draw calls:
   plate carrier with pouches, radio and hydration pack, belt kit, cargo pants with pockets and a thigh holster, knee pads, laced boots, gloves with knuckle guards and curled fingers, a watch,
   a face with eyes (white, iris, pupil, lids), brows, nose, lips, ears, stubble or beard, three hair styles, a helmet with night-vision mount and goggles, a comms headset and boom mic, shades, face paint.
   Zombies get torn clothes, wounds, exposed ribs, sunken glowing eyes, teeth, a hanging jaw and claws; rig.setGlow(on) lights their eyes and an aura (the Big Ben step of the London easter egg). */
var HV={cache:{},m:{},geo:null,aTex:null};
HV.G=function(){if(HV.geo)return HV.geo;const T=THREE;return HV.geo={bx:new T.BoxGeometry(1,1,1),cy:new T.CylinderGeometry(1,1,1,10),cu:new T.CylinderGeometry(1,.82,1,10),sp:new T.SphereGeometry(1,12,8),ss:new T.SphereGeometry(1,8,5),hm:new T.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.55)}};
HV.merge=function(parts){let nv=0,ni=0;for(const p of parts){nv+=p.g.attributes.position.count;ni+=p.g.index?p.g.index.count:p.g.attributes.position.count}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint16Array(ni),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),nm=new THREE.Matrix3(),v=new THREE.Vector3();let vo=0,io=0;
 for(const p of parts){if(p.q)q.copy(p.q);else{e.set(p.rx,p.ry,p.rz);q.setFromEuler(e)}pos.set(p.x,p.y,p.z);sc.set(p.sx,p.sy,p.sz);m.compose(pos,q,sc);nm.getNormalMatrix(m);const pa=p.g.attributes.position,na=p.g.attributes.normal,ua=p.g.attributes.uv;
  for(let i=0;i<pa.count;i++){v.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(m);P[(vo+i)*3]=v.x;P[(vo+i)*3+1]=v.y;P[(vo+i)*3+2]=v.z;v.set(na.getX(i),na.getY(i),na.getZ(i)).applyMatrix3(nm).normalize();N[(vo+i)*3]=v.x;N[(vo+i)*3+1]=v.y;N[(vo+i)*3+2]=v.z;U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
  if(p.g.index){for(let i=0;i<p.g.index.count;i++)I[io++]=p.g.index.getX(i)+vo}else for(let i=0;i<pa.count;i++)I[io++]=vo+i;vo+=pa.count}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(new THREE.BufferAttribute(I,1));g.computeBoundingSphere();return g};
/* bake(key, build): build(a, rod) is called once per key; a(slot, geometry, sx,sy,sz, x,y,z, rx,ry,rz) adds one part, rod(slot, x0,y0,z0, x1,y1,z1, r) adds a thin cylinder between two points */
HV.bake=function(key,build){let c=HV.cache[key];if(c)return c;const by={},up=new THREE.Vector3(0,1,0),d=new THREE.Vector3();
 const a=(s,g,sx,sy,sz,x,y,z,rx,ry,rz)=>{(by[s]||(by[s]=[])).push({g,sx,sy,sz,x,y,z,rx:rx||0,ry:ry||0,rz:rz||0})},
  rod=(s,x0,y0,z0,x1,y1,z1,r)=>{d.set(x1-x0,y1-y0,z1-z0);const L=d.length(),q=new THREE.Quaternion().setFromUnitVectors(up,d.normalize());(by[s]||(by[s]=[])).push({g:HV.G().cy,sx:r,sy:L,sz:r,x:(x0+x1)/2,y:(y0+y1)/2,z:(z0+z1)/2,q})};
 build(a,rod,HV.G());c=HV.cache[key]={};for(const s in by)c[s]=HV.merge(by[s]);return c};
HV.put=function(parent,key,build,M){const c=HV.bake(key,build),out=[];for(const s in c){const e=new THREE.Mesh(c[s],M[s]||M.dk);e.castShadow=true;parent.add(e);out.push(e)}return out};
HV.auraTex=()=>LX.effectTextures().glow;
var hvR=(sx,sy,sz,r)=>(typeof LX!='undefined'&&LX.rb)?LX.rb(sx,sy,sz,r):HV.G().bx;
/* ---- head ---- */
HV.zombieHead=function(a,rod,G){const {bx,sp,ss,hm}=G;
  a('skin',sp,.105,.125,.115,0,.11,0);a('skin',sp,.09,.06,.1,0,.03,.03);
  for(const s of[-1,1]){a('dk',ss,.03,.027,.018,s*.04,.13,.098);a('skin',ss,.018,.032,.02,s*.108,.11,0);a('hair',bx,.05,.012,.014,s*.04,.165,.1,0,0,-s*.25)}
  a('dk',bx,.02,.04,.03,0,.1,.12);a('wound',ss,.034,.024,.012,.07,.07,.085);a('bone',bx,.02,.012,.006,.072,.074,.094);a('blood',ss,.05,.03,.012,-.04,.19,.07,-.4,0,0);
  a('hair',hm,.1,.108,.112,0,.122,-.008);a('skin',ss,.04,.03,.01,-.03,.2,.05,-.5,0,0);for(const s of[-1,1])a('bone',bx,.012,.012,.006,s*.02,.052,.118);
  for(let i=0;i<6;i++)a('bone',bx,.01,.014,.008,(i-2.5)*.016,.066,.116)};
/* ---- torso ---- */
HV.zombieTorso=function(v){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;
 a('am',cu,.235,.34,.15,0,.42,0);a('am',cu,.2,.26,.13,0,.14,0);for(const s of[-1,1])a('am',sp,.088,.088,.088,s*.276,.52,0);a('am',cy,.26,.05,.15,0,.575,0);
 a('skin',cy,.05,.1,.05,0,.63,0);a('am',cy,.066,.03,.06,0,.585,0);
 const R=(i)=>((Math.sin(i*91.7+v.var*13.1)*43758.5)%1+1)%1;
  for(let i=0;i<9;i++)a('am',bx,.035+R(i)*.03,.09+R(i+9)*.12,.012,-.2+i*.05,.0-R(i+3)*.06,.13,0,0,(R(i+5)-.5)*.4);
  a('wound',sp,.075,.09,.02,-.07,.34,.14);for(let i=0;i<3;i++)a('bone',bx,.1-i*.01,.012,.014,-.07,.3+i*.04,.152,0,0,.05);
  a('blood',sp,.06,.05,.016,.1,.2,.13);a('wound',sp,.05,.06,.02,.09,.55,-.1);for(let i=0;i<6;i++)a('skin',ss,.014,.014,.014,0,.1+i*.075,-.13);
  a('blood',sp,.04,.07,.02,.16,.4,.1,0,.6,0);a('bone',bx,.012,.06,.012,.0,.5,-.125,0,0,.2)}};
/* ---- belt kit (moves with the crouch) ---- */
HV.hip=function(v){return(a,rod,G)=>{const{bx,cy}=G;a('pants',cy,.19,.2,.12,0,.96,0);a('dk',cy,.2,.045,.13,0,1.03,0);
 if(!v.zb){a('metal',bx,.035,.032,.012,0,1.03,.131);for(const s of[-1,1])a('vest2',bx,.06,.075,.05,s*.16,1.0,.06);a('vest2',bx,.13,.07,.04,0,1.0,-.125);a('strap',bx,.01,.07,.006,0,.99,.14)}else a('am',bx,.07,.1,.01,.1,1.0,.12,0,0,.5)}};
/* ---- legs: upper (thigh + knee) and lower (shin + boot) ---- */
HV.legU=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;a('pants',cu,.088,.46,.088,0,-.23,0);a('pants',sp,.076,.076,.076,0,-.46,0);
 if(!v.zb){a('pants2',bx,.035,.13,.085,s*.094,-.24,0);a('pants2',bx,.037,.03,.09,s*.095,-.185,0);a('metal',ss,.007,.007,.007,s*.113,-.195,0);a('strap',cy,.092,.02,.092,0,-.38,0);a('metal',bx,.012,.016,.006,0,-.38,.092);
  if(s<0){a('vest2',bx,.04,.19,.08,-.1,-.3,.03);a('dk',bx,.032,.05,.05,-.1,-.2,.03);a('strap',bx,.008,.1,.006,-.1,-.19,.075,0,0,0)}else a('vest2',bx,.04,.1,.08,.1,-.3,0)}
 else{a('wound',ss,.04,.05,.02,s*.07,-.16,.07);a('pants2',bx,.03,.1,.01,s*.05,-.4,.088,0,0,s*.3)}}};
HV.legL=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;
 if(!v.zb||!v.bare){a('pants',cu,.068,.44,.068,0,-.22,0);a('boots',cy,.076,.1,.076,0,-.36,0);a('pants',sp,.078,.05,.078,0,-.31,0);a('boots',hvR(.12,.1,.27,.02),.12,.1,.27,0,-.43,.05);a('boots',ss,.055,.04,.07,0,-.445,.16);a('dk',bx,.126,.028,.29,0,-.475,.05);
  if(!v.zb){for(let i=0;i<3;i++)a('strap',bx,.04,.005,.01,0,-.34-i*.018,.078);a('vest',hvR(.1,.13,.05,.015),.1,.13,.05,0,-.03,.07);a('metal',ss,.006,.006,.006,.022,-.36,.078)}
  else{for(let i=0;i<4;i++)a('pants2',bx,.02,.07,.01,(i-1.5)*.03,-.36,.07,0,0,(i%2?.3:-.3))}}
 else{a('pants',cu,.068,.22,.068,0,-.11,0);for(let i=0;i<5;i++)a('pants',bx,.02,.08,.01,(i-2)*.027,-.24,.066,0,0,(i%2?.4:-.4));a('skin',cu,.055,.22,.055,0,-.33,0);a('skin',hvR(.1,.06,.24,.02),.1,.06,.24,0,-.44,.06);for(let i=0;i<5;i++)a('bone',bx,.014,.014,.03,(i-2)*.02,-.445,.19);a('wound',ss,.03,.04,.012,s*.03,-.28,.05)}}};
/* ---- arms (the group structure is the old one: up at the shoulder, fo at the elbow, both hang along -y) ---- */
HV.armU=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;a('am',cu,.063,.36,.063,0,-.18,0);a('am',sp,.07,.07,.07,0,0,0);
 if(!v.zb)a('patch',bx,.004,.045,.04,s*.064,-.09,0);else{a('wound',ss,.03,.04,.014,0,-.12,.05);for(let i=0;i<3;i++)a('am',bx,.02,.07,.01,(i-1)*.03,-.34,.05,0,0,(i-1)*.2)}}};
HV.armF=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;
 if(!v.zb){a('am',sp,.055,.055,.055,0,0,0);a('vest',cy,.062,.07,.062,0,0,0);a('am',cu,.052,.28,.052,0,-.15,0);a('dk',cy,.046,.035,.046,0,-.29,0);a('glove',cy,.044,.07,.044,0,-.33,0);
  a('strap',bx,.05,.012,.05,0,-.36,0);
  if(s>0){a('dk',cy,.048,.022,.048,0,-.275,0);a('metal',cy,.05,.004,.05,0,-.264,0)}}
 else{a('skin',sp,.055,.055,.055,0,0,0);a('skin',cu,.05,.34,.05,0,-.19,0);for(let i=0;i<3;i++)a('am',bx,.02,.07,.012,(i-1)*.03,-.04,.045,0,0,(i-1)*.25);a('wound',ss,.03,.04,.014,0,-.2,.04);
  a('skin',hvR(.075,.07,.04,.012),.075,.07,.04,0,-.39,0);for(let i=0;i<5;i++){const x=-.03+i*.015;a('skin',bx,.011,.06,.014,x,-.45,.01+Math.abs(i-2)*.004,.0,0,(i-2)*.12);a('bone',bx,.008,.016,.01,x+(i-2)*.003,-.485,.012)}}}};
function mkArm2(parent,v,s,M){
 const up=new THREE.Group(),fo=new THREE.Group();
 if(v.zb){
  HV.put(up,'auz'+s,HV.armU(v,s),M);
  HV.put(fo,'afz'+s,HV.armF(v,s),M);
 }
 let hand;
 if(!v.zb){
  const keyed=v.style==='keywarden',bare=v.style==='meridian',key=(keyed?'keywarden-grasp':bare?'meridian-grasp':'grasp')+s;
  if(!HV[key]){
   const model=keyed?new THREE.Group():bare?meridianGlove(-s,s===-1,M):mkFpHand(-s,M.glove,M.dk,s===-1,M.dk);
   if(keyed)HV.put(model,key,keywardenHand(-s),M);
   if(LX.mergeRig)LX.mergeRig(model);
   HV[key]=model;
  }
  hand=HV[key].clone();hand.scale.setScalar(.71);hand.position.y=-.36;fo.add(hand);
 }
 parent.add(up,fo);return{up,fo,L1:.36,L2:.36,hand};
}
function mkHuman(m,o={}){o=o||{};
 if(o.zombie&&mode==='Zombies'&&MAPS[sel.map]?.lockbox)return lockboxZombie(m,o);
 m.rotation.order='YXZ';HV.G();
 const pk=palette=>palette[Math.random()*palette.length|0],zb=!!o.zombie;
 const style=zb?null:operatorId(o.operator);
 const sh_=(n,c)=>HV.m[n]||(HV.m[n]=new THREE.MeshLambertMaterial({color:c}));
 const palette=(name,color)=>sh_(name+'-'+color,color);
 const skin=o.skin??pk([0xf7d7ba,0xeab992,0xd6a37c,0xb98059,0x9c6b48]);
 const M={skin:palette('skin',skin),vest:palette('vest',pk([0x2b2f26,0x23262b,0x3b3a2c,0x2d3433]))};
 if(style){
  Object.assign(M,operatorMaterials(style));
  M.am=M.pants=M.fabric;M.pants2=M.armor;
 }else{
  const pants=o.pants??pk([0x3a3f2f,0x2f3238,0x4a4638]);
  M.pants=palette('pants',pants);
  M.pants2=sh_('pants2-'+pants,new THREE.Color(pants).multiplyScalar(.82).getHex());
  M.am=palette('shirt',o.shirt??0xb5452e);
  M.hair=palette('hair',o.hair??pk([0x4a3626,0x6a4a30,0x3a3a3a,0x9a7a40,0xb8a46c]));
 }
 M.vest2=sh_('vest2',0x23261f);M.boots=sh_('boots',0x1c1a18);M.dk=sh_('dk',0x15171a);M.glove=sh_('glove',0x15151a);M.strap=sh_('strap',0x3a3d33);
 M.metal=sh_('metal',0x9aa0a6);
 M.patch=sh_('patch',0xe8e2d0);M.bone=sh_('bone',0xd8d0b8);M.blood=sh_('blood',0x5a0f0f);M.wound=sh_('wound',0x3a0c0c);
 const eyeM=zb?new THREE.MeshBasicMaterial({color:o.eye||0xff2a2a}):null;if(zb)M.eye=eyeM;
 const v={style,zb,var:zb?Math.random()*3|0:0,bare:zb&&Math.random()<.45};
 const sh=new THREE.Group();sh.position.y=1;m.add(sh);
 const hip=HV.put(m,zb?'hip-zombie':style+'-pelvis',zb?HV.hip(v):style==='keywarden'?keywardenHip:style==='meridian'?meridianPelvis:operatorPelvis,M);HV.put(sh,style?'operator-torso-'+style:'z-torso-'+v.var,style?operatorTorso(style):HV.zombieTorso(v),M);
 const head=new THREE.Group();head.position.set(0,style&&style!=='recruit'?.602:.68,0);sh.add(head);HV.put(head,style?'operator-head-'+style:'z-head',style?operatorHead(style):HV.zombieHead,M);
 if(zb){const eg=HV.G().ss;for(const s of[-1,1]){const e=new THREE.Mesh(eg,eyeM);e.scale.set(.02,.018,.012);e.position.set(s*.04,.13,.105);head.add(e)}}
 let jaw=null;if(zb){jaw=new THREE.Group();jaw.position.set(0,.05,.02);head.add(jaw);HV.put(jaw,'jaw',(a,rod,G)=>{a('skin',G.bx,.11,.04,.12,0,-.02,.05);a('blood',G.bx,.08,.02,.08,0,0,.05);for(let i=0;i<6;i++)a('bone',G.bx,.01,.014,.008,(i-2.5)*.016,.006,.108)},M)}
 const leg=(x,s)=>{const l=new THREE.Group(),sg_=new THREE.Group();l.position.set(x,.98,0);if(zb)HV.put(l,'lu'+(zb?'z':'h')+s,HV.legU(v,s),M);sg_.position.set(0,-.46,0);if(zb)HV.put(sg_,'ll'+(zb?'z'+v.bare:'h')+s,HV.legL(v,s),M);l.add(sg_);m.add(l);return[l,sg_]};
 const[legL,shinL]=leg(-.1,-1),[legR,shinR]=leg(.1,1),armR=mkArm2(m,v,-1,M),armL=mkArm2(m,v,1,M);
 if(style)for(const [side,arm,leg,shin] of [[1,armR,legR,shinR],[-1,armL,legL,shinL]]){
  for(const [part,target] of [['arm',arm.up],['forearm',arm.fo],['leg',leg],['shin',shin]])
   HV.put(target,style+'-'+part+side,operatorGear(style,side,part),M);
 }
 m.userData.operator=style;
 const rig={hip,legL,legR,shinL,shinR,armR,armL,sh,head,jaw,keywarden:style==='keywarden',mat:{skin:M.skin,am:M.am,pants:M.pants,hair:M.hair,vest:M.vest},eyeM};
 /* zombies: eyes that can glow yellow with an aura (rig.setGlow), used by the Big Ben step of the London easter egg */
 if(zb){const tx=HV.auraTex(),mk=(sc,op,y,z)=>{const s_=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,color:0xffd21a,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s_.scale.set(sc,sc,1);s_.position.set(0,y,z);s_.visible=false;s_.userData.op=op;return s_},
  hs=mk(.55,.95,.13,.1),bs=mk(2.3,.3,.95,0);head.add(hs);m.add(bs);const base=eyeM.color.getHex();let gl=0;
  rig.setGlow=(on,t)=>{if(on){if(!gl){gl=1;eyeM.color.setRGB(2.6,2.1,.15);hs.visible=bs.visible=true}const p=.85+.15*Math.sin((t||0)*7);hs.material.opacity=hs.userData.op*p;bs.material.opacity=bs.userData.op*(.8+.2*Math.sin((t||0)*4+1));hs.scale.setScalar(.55*(.95+.1*Math.sin((t||0)*7)))}
   else if(gl){gl=0;eyeM.color.setHex(base);hs.visible=bs.visible=false}};rig.glowing=()=>!!gl}
 return rig}
/* shoulder position follows the leaning / twisting upper body so the arms stay attached */
var shPos=(r,side)=>V(side*.285,.486*r.sh.scale.y,0).applyEuler(r.sh.rotation).add(r.sh.position);
var angD=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b)),falls=[];
/* ---------- ragdoll: dead players, bots and zombies get thrown by the hit, tumble, collide with walls, land ON the highest thing under them
   and go limp (floppy spring-driven legs, head and arms). b.rag holds the state; bodyFall() is used for humans, zombies call ragStart() themselves ---------- */
var spr_=(l,tg,k,c,dt)=>{l.v+=(k*(tg-l.a)-c*l.v)*dt;l.a+=l.v*dt},mkL=()=>({a:0,v:0});
function ragStart(b,dx,dz,st){if(b.rag)return;const h=Math.hypot(dx,dz)||1;if(h<.001||isNaN(h)){const q=Math.random()*6.28;dx=Math.sin(q);dz=Math.cos(q)}else{dx/=h;dz/=h}st=st==null?3.2:st;
 const fw=b.m.rotation.y,fwd=dx*Math.sin(fw)+dz*Math.cos(fw)>0.15,sg=fwd?1:-1,R=Math.random,
 r={x:b.m.position.x,y:b.m.position.y||0,z:b.m.position.z,vx:dx*st*(.8+R()*.6),vz:dz*st*(.8+R()*.6),vy:3+R()*1.4,pit:b.m.rotation.x||0,wp:sg*(4.5+R()*3),tg:sg*Math.PI/2,roll:0,wr:(R()-.5)*3,wy:(R()-.5)*5,land:0,t:0,lie:0,
  L:{lx:mkL(),rx:mkL(),ls:mkL(),rs:mkL(),hx:mkL(),hz:mkL(),sx:mkL(),lz:mkL(),rz:mkL()},H:[0,1].map(()=>({x:0,y:0,z:0,vx:(R()-.5)*8,vy:R()*6,vz:(R()-.5)*8}))};
 for(const k in r.L)r.L[k].v=(R()-.5)*9;b.rag=r;b.m.visible=true}
function ragReset(b){if(!b.rag&&b.m.rotation.z===0)return;b.rag=null;b.m.rotation.x=b.m.rotation.z=0;b.m.position.y=0;const g=b.rig;if(g){g.legL.rotation.z=g.legR.rotation.z=0;if(g.head)g.head.rotation.set(0,0,0);g.sh.rotation.set(0,0,0);g.sh.position.y=1}}
function ragTick(b,dt){const r=b.rag;if(!r)return;r.t+=dt;const g=b.rig,m=b.m,o=r;
 const air=r.y>gnd({x:r.x,z:r.z,y:r.y})+.3+.02||r.vy>0;
 if(air||r.t<.05){r.vy-=24*dt;r.y+=r.vy*dt;const px=r.x,pz=r.z;mv(o,r.vx*dt,r.vz*dt,.4);if(Math.abs(o.x-px-r.vx*dt)>1e-4)r.vx*=-.2;if(Math.abs(o.z-pz-r.vz*dt)>1e-4)r.vz*=-.2;
  if(Math.abs(r.pit)<Math.abs(r.tg))r.pit+=r.wp*dt;if(Math.abs(r.pit)>Math.abs(r.tg))r.pit=r.tg}
 const gy=gnd({x:r.x,z:r.z,y:r.y})+.3*Math.abs(Math.sin(r.pit))+(0);
 if(r.y<=gy){if(!r.land&&r.vy<-1){r.land=1;for(const k in r.L)r.L[k].v+=(Math.random()-.5)*10;for(const h of r.H){h.vx+=(Math.random()-.5)*9;h.vy+=Math.random()*5;h.vz+=(Math.random()-.5)*9}}
  const bnc=r.vy<-5&&!r.bn;r.y=gy;if(bnc){r.vy=-r.vy*.22;r.bn=1}else r.vy=0;const f=Math.exp(-6*dt);r.vx*=f;r.vz*=f;mv(o,r.vx*dt,r.vz*dt,.4);r.pit+=(r.tg-r.pit)*Math.min(1,dt*12)}
 r.wy*=Math.exp(-2.5*dt);r.wr*=Math.exp(-2.5*dt);m.rotation.y+=r.wy*dt*(Math.abs(r.vx)+Math.abs(r.vz)>.3?1:.2);r.roll+=r.wr*dt;r.roll*=Math.exp(-1.2*dt);
 m.rotation.x=r.pit;m.rotation.z=r.roll;m.position.set(r.x,r.y-(r.sink||0),r.z);
 if(!g)return;const L=r.L,s=Math.sign(r.tg)||1;
 spr_(L.lx,.25,38,5,dt);spr_(L.rx,-.15,38,5,dt);spr_(L.ls,.45*(s>0?1:.5),30,5,dt);spr_(L.rs,.2,30,5,dt);spr_(L.hx,s>0?.5:-.3,34,4.5,dt);spr_(L.hz,.25,30,4,dt);spr_(L.sx,-.08,30,5,dt);spr_(L.lz,.2,30,5,dt);spr_(L.rz,-.22,30,5,dt);
 g.legL.rotation.x=L.lx.a;g.legR.rotation.x=L.rx.a;g.legL.rotation.z=L.lz.a;g.legR.rotation.z=L.rz.a;g.shinL.rotation.x=Math.max(0,L.ls.a);g.shinR.rotation.x=Math.max(0,L.rs.a);
 if(g.head)g.head.rotation.set(L.hx.a,0,L.hz.a);g.sh.rotation.set(L.sx.a,0,0);g.sh.position.y=1;if(g.jaw)g.jaw.rotation.x=.5;
 g.lean=L.sx.a;g.tw=0;g.bob=0;
 for(let i=0;i<2;i++){const sd=i?1:-1,h=r.H[i],tx=sd*.12-h.x*0,ty=-.1;h.vx+=(40*(tx*.0-h.x)-5*h.vx)*dt;h.vy+=(40*(ty*.0-h.y)-5*h.vy)*dt+(-4)*dt;h.vz+=(40*(0-h.z)-5*h.vz)*dt;h.x=Math.max(-.35,Math.min(.35,h.x+h.vx*dt*.1));h.y=Math.max(-.3,Math.min(.2,h.y+h.vy*dt*.1));h.z=Math.max(-.35,Math.min(.35,h.z+h.vz*dt*.1))}
 const sL=shPos(g,-1),sR=shPos(g,1),H=r.H;ik(sR,V(sR.x+.1+H[1].x,sR.y-.6+H[1].y,sR.z+.04+H[1].z),V(.6,-1,-.3),g.armR);ik(sL,V(sL.x-.1+H[0].x,sL.y-.6+H[0].y,sL.z+.04+H[0].z),V(-.6,-1,-.3),g.armL)}
/* killed bots tumble instead of vanishing; zombies start their own in zDamage */
function bodyFall(b,dx,dz){if(b.zom)return;if(dx==null){dx=b.x-P.x;dz=b.z-P.z}ragStart(b,dx,dz);b.fall=0;if(!falls.includes(b))falls.push(b)}
function fallTick(dt){for(let i=falls.length-1;i>=0;i--){const b=falls[i];if(b.fall==null){falls.splice(i,1);continue}b.fall+=dt;ragTick(b,dt);if(b.fall>2.4){b.m.visible=false;ragReset(b);b.fall=null;falls.splice(i,1)}}}
function updatePlayerNameplate(b){
 let tag=b.nameplate;
 if(!b.al||!b.nm){if(tag)tag.visible=false;return}
 if(!tag){
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=64;
  const ctx=canvas.getContext('2d');
  ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.strokeStyle='#10151c';ctx.lineWidth=6;ctx.lineJoin='round';
  ctx.strokeText(b.nm,192,32,370);ctx.fillStyle='#fff';ctx.fillText(b.nm,192,32,370);
  const texture=new THREE.CanvasTexture(canvas);
  tag=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));
  tag.scale.set(2.9,.48,1);b.m.add(tag);b.nameplate=tag;
  const release=()=>{b.m.removeEventListener('removed',release);b.m.remove(tag);texture.dispose();tag.material.dispose();b.nameplate=null};
  b.m.addEventListener('removed',release);
 }
 tag.visible=true;tag.position.y=2.25-(b.pc||0)*.4-(b.pp||0)*1.1;
 tag.material.color.setHex(ally(b)?0x70b9ff:0xff6868);
}
// The stance foot travels back at ground speed. The swing foot lifts before it comes forward.
const gaitAnkle=V(),gaitKnee=V(),gaitAxis=V(),gaitBend=V(),gaitLocal=V(),gaitTurn=new THREE.Quaternion();
function operatorFoot(leg,shin,x,y,z){
 const length=.46;
 gaitAnkle.set(x,y-leg.position.y,z);
 const distance=Math.min(length*2-.002,Math.max(.20,gaitAnkle.length()));
 gaitAxis.copy(gaitAnkle).normalize();gaitAnkle.copy(gaitAxis).multiplyScalar(distance);
 gaitBend.set(0,0,1).addScaledVector(gaitAxis,-gaitAxis.z).normalize();
 gaitKnee.copy(gaitAxis).multiplyScalar(distance*.5).addScaledVector(gaitBend,Math.sqrt(length*length-distance*distance*.25));
 leg.quaternion.setFromUnitVectors(ikDown,gaitLocal.copy(gaitKnee).normalize());
 gaitTurn.setFromUnitVectors(ikDown,gaitLocal.subVectors(gaitAnkle,gaitKnee).normalize());
 shin.quaternion.copy(leg.quaternion).invert().multiply(gaitTurn);
}
function operatorStride(speed){return .80+cl(speed/8,0,1)*.71}
function operatorWalk(rig,phase,speed,forward=1,lateral=0){
 const weight=cl(speed/.85,0,1),stride=operatorStride(speed),strideStep=stride*.27*weight;
 const roll=Math.sin(phase*Math.PI*2)*weight;
 const clearance=.069+cl(speed/8,0,1)*.16;
 const compress=weight*(.018+cl(speed/9,0,1)*.080)*(.78+.22*Math.cos(phase*Math.PI*4));
 for(const [leg,shin,side,offset] of [[rig.legL,rig.shinL,-1,0],[rig.legR,rig.shinR,1,.5]]){
  const cycle=(phase+offset)%1,contact=.59;
  const swing=cl((cycle-contact)/(1-contact),0,1);
  const travel=cycle<contact?1-2*cycle/contact:-1+2*eas(swing);
  const lift=Math.sin(swing*Math.PI)**1.5*clearance*weight;
  leg.position.y=.98-compress+roll*side*.008;
  operatorFoot(leg,shin,side*.018+travel*strideStep*lateral*.78,.059+lift,side*.017+travel*strideStep*forward);
 }
 return compress;
}
function operatorShoulderRecoil(b,w){
 if(b.visualRecoil!=null)return Math.min(1,b.visualRecoil);
 const elapsed=t0-(b.viewShot??-1);
 if(elapsed<0||elapsed>.42)return 0;
 const stroke=elapsed/(w.rc>5?.042:.031);
 return Math.min(1,(w.rc||2)*.14)*stroke*Math.exp(1-stroke);
}

function animBot(b,dt){
 const r=b.rig,g=b.hg;if(!r)return;
 const mdx=b.x-(b.px??b.x),mdz=b.z-(b.pz??b.z),distance=Math.hypot(mdx,mdz);
 const stepTime=Math.max(dt,.001),sp=Math.min(9,distance/stepTime);
 b.px=b.x;b.pz=b.z;
 const tgt=b.tyaw??b.m.rotation.y;
 if(b.ry==null)b.ry=tgt;
 b.ry+=angD(tgt,b.ry)*(1-Math.exp(-dt*(b.zom?8:13)));b.m.rotation.y=b.ry;
 const swimming=!b.zom&&b.y<-.66&&MAPS[sel.map].swim,zb=!!b.zom,sh=r.sh,id=b.i*1.7;
 const blend=1-Math.exp(-dt*13),cos=Math.cos(b.ry),sin=Math.sin(b.ry);
 b.moveSpeed=(b.moveSpeed||0)+(sp-(b.moveSpeed||0))*blend;
 const speed=zb?sp:b.moveSpeed,mvf=Math.min(1,speed/3.4),run=b.poseRun??speed>3.7;
 b.forward=(b.forward??1)+((distance>.0003?(mdx*sin+mdz*cos)/distance:b.forward??1)-(b.forward??1))*blend;
 b.lateral=(b.lateral||0)+((distance>.0003?(mdx*cos-mdz*sin)/distance:0)-(b.lateral||0))*blend;
 const rate=swimming?3.5+speed:zb?speed*1.05:speed/operatorStride(speed)*Math.PI*2;
 b.ph=((b.ph||0)+rate*dt)%(Math.PI*2);
 const ph=b.ph,s=Math.sin(ph),c=Math.cos(ph);
 const za=zb&&typeof zAtkPose=='function'?zAtkPose(b,dt):null;
 const lean=za?.vault?za.lean:(zb?(run?.5:.3):.025+(swimming?.32:.12)*mvf)-(b.fl>0?b.fl*.70:0)+(za?.lean||0);
 const twS=-s*(zb?.22:.11)*mvf+(za?.tw||0);
 let bob=Math.cos(ph*2)*.012*mvf+(za?.bob||0);
 if(zb||swimming){
  const stride=s*(zb?(run?.94:.59):.39)*mvf;
  r.legL.rotation.set(stride,0,0);r.legR.rotation.set(-stride*(zb?.76:1)-(zb?.074*mvf:0),0,0);
  r.shinL.rotation.set(Math.max(0,c)*(zb?.61:.51)*mvf,0,0);
  r.shinR.rotation.set(Math.max(0,-c)*(zb?.43:.51)*mvf,0,0);
  r.legL.position.y=r.legR.position.y=.98+Math.abs(c)*.013*mvf;
 }else{
  bob-=operatorWalk(r,ph/(Math.PI*2),speed,b.forward,b.lateral);
 }
 const breath=Math.sin(t0*1.7+id);
 const bank=zb?s*.12*mvf+Math.sin(t0*.9+id)*.03:-b.lateral*.07*mvf+s*.026*mvf;
 sh.rotation.set(lean+breath*(zb?.037:.011),twS,bank);sh.position.y=1+bob;sh.scale.y=1+.005*breath;
 r.lean=lean;r.tw=twS;r.bob=bob;
 if(r.head)r.head.rotation.set(zb?.25+Math.sin(t0*2.1+id)*.08:-lean*.62,zb?Math.sin(t0*1.3+id)*.25:-twS*.50,zb?.2+Math.sin(t0*.8+id)*.1:-bank*.55);
 if(za&&r.head){r.head.rotation.x+=za.hx;r.head.rotation.y+=za.hy}
 if(za?.vault)lockboxVaultLegs(b,r);
 /* stance and air poses for other players: crouch, slide, jump (legs tucked), prone / dive (whole body tilts, see netTick), looking up and down */
 r.dr=0;if(!zb&&(b.net||b.sa)){const T=b.st||0,tk=Math.min(1,dt*11),up=(k,v)=>{b[k]=(b[k]||0)+(v-(b[k]||0))*tk};up('pc',T==1?1:0);up('psl',T==3?1:0);up('pj',b.aj&&T!=2&&T!=4?1:0);up('pp',T==2||T==4?1:0);up('pis',cl(b.pi||0,-1.2,1.2));
  const pc=b.pc,psl=b.psl,pj=b.pj*(1-pc*.5),w=Math.min(1,pc+psl+pj),dr=.3*pc+.42*psl,mix=(w0,a,bb,j)=>w0*(1-w)+a*pc+bb*psl+j*pj;
  if(w>.01){r.legL.rotation.x=mix(r.legL.rotation.x,-1.0,-1.25,-.6);r.legR.rotation.x=mix(r.legR.rotation.x,-.75,-.85,-.1);r.shinL.rotation.x=mix(r.shinL.rotation.x,1.5,.15,1.05);r.shinR.rotation.x=mix(r.shinR.rotation.x,1.3,1.5,.85)}
  r.dr=dr;r.legL.position.y-=dr;r.legR.position.y-=dr;sh.position.y-=dr;r.bob-=dr;
  sh.rotation.x+=.14*pc-.5*psl+.07*pj-b.pis*.22;
  if(r.head)r.head.rotation.x+=-b.pis*.55;
  if(g)g.userData.pis=b.pis;
 }
 if(!zb)for(const piece of r.hip)piece.position.y=(r.legL.position.y+r.legR.position.y)*.5-.98;
 const sL=shPos(r,-1),sR=shPos(r,1);
 if(zb){const sw=Math.sin(t0*3+id)*.07,lg=b.lunge>0?.22:0;if(lg)b.lunge-=dt;const ay=run?s*.3:sw;let aR=[.02,-.12+ay,.58+lg+(run?.1:0)],aL=[-.02,-.12-ay,.58+lg];if(za){aR=za.R;aL=za.L}
  ik(sR,V(sR.x+aR[0],sR.y+aR[1],sR.z+aR[2]),za?V(za.hR[0],za.hR[1],za.hR[2]):V(.6,-1,-.3),r.armR);ik(sL,V(sL.x+aL[0],sL.y+aL[1],sL.z+aL[2]),za?V(za.hL[0],za.hL[1],za.hL[2]):V(-.6,-1,-.3),r.armL);if(r.jaw)r.jaw.rotation.x=za?za.jaw:.2+.18*Math.sin(t0*5+id)+(lg?.3:0);return}
 if(!g)return;
 const w=W[b.wk]||W.AR,A=g.userData.a||{r:[0,-.1,.1],l:[0,-.05,.5],m:[0,-.15,.3]};let rp=-1;
 if(b.net){if(b.rlOn){b.rlt=(b.rlt||0)+dt;rp=Math.min(1,b.rlt/Math.max(.4,w.rl))}else b.rlt=0}else if(b.rl>0)rp=1-b.rl/Math.max(.4,w.rl);
 const bell=reloadPresentation(rp),recoil=operatorShoulderRecoil(b,w),H3=hold3(b,run,id,dt);
 g.position.set(.12+H3[0]+s*.014*mvf,1.36+H3[1]+r.bob*.57-.043*bell,(b.hold?b.hold.gz:.18)+H3[2]-.074*recoil);
 g.scale.setScalar(b.hold?b.hold.s:1);
 g.rotation.set(-.46*bell-(b.net?(b.pis||0)*.6:0)+H3[3]-.16*recoil,H3[4]+twS*.25,.28*bell+H3[5]+recoil*.045);
 const q=g.quaternion,tw=point=>point.clone().multiplyScalar(g.scale.x).applyQuaternion(q).add(g.position);
 if(authoredGrip[b.wk]){
  gripAuthoredWeapon(authoredGrip[b.wk](g,rp),tw,axis=>axis.applyQuaternion(q),r.armR,r.armL,sR,sL,V(.62,-1,-.28),V(-.73,-1,-.3));
  return;
 }
 const R0=V(...A.r),kind=RLK[b.wk]||'mag',mg=g.userData.mags||[],pm=g.userData.pump||[],
  pistol=usesPistolGrip(w,b.wk),support=pistol&&b.wk!=='DS',
  o=rlPose(kind,rp,support?{...A,l:pistolSupport(A,1)}:A,1,4,mg,g,0,pm.length>0);
 clampHand(o,sL,tw,q,.7);applyRl(o,mg,pm,g,kind,1);
 if(pistol){
  gripPistol(sR,tw(R0),V(.6,-1,-.3),r.armR,q,1,1,support);
  gripPistol(sL,tw(o.h),V(-.6,-1,-.3),r.armL,q,-1,1,support);
 }else{
  gripArm(sR,tw(R0),V(.6,-1,-.3),r.armR,V(0,1,.24).applyQuaternion(q),1);
  gripArm(sL,tw(o.h),V(-.6,-1,-.3),r.armL,V(0,0,1).applyQuaternion(q),-1);
 }
}
/* movement: walk 7, sprint 10.5 with Shift (forward only), smoothed acceleration, mantle ledges while airborne, kick off walls with a fresh jump press */
function phys(dt,f,s,spd){const map=MAPS[sel.map],maxHeight=(map.ceilingY??Infinity)-1.85;
 if(P.mt){if(P.mt.ty<=maxHeight){P.mx=P.mz=0;mantleStep(dt);return}P.mt=null}
 if(map.swim&&quarrySwim(dt,f,s))return;
 const spc=key.Space&&!ST.sj,jp=spc&&!P.jh;P.jh=!!spc;P.coy=P.on?.11:Math.max(0,(P.coy||0)-dt);P.jb=jp?.13:Math.max(0,(P.jb||0)-dt);const n=Math.hypot(f,s)||1,cy=Math.cos(yaw),sy=Math.sin(yaw);const ac_=Math.min(1,dt*(P.on?((f||s)?12:16):6.5));P.mx=(P.mx||0)+((-sy*f+cy*s)/n*spd-(P.mx||0))*ac_;P.mz=(P.mz||0)+((-cy*f-sy*s)/n*spd-(P.mz||0))*ac_;let dx=P.mx*dt,dz=P.mz*dt;
 if(P.wvx||P.wvz){dx+=P.wvx*dt;dz+=P.wvz*dt;const k=Math.exp(-4.5*dt);P.wvx*=k;P.wvz*=k;if(Math.hypot(P.wvx,P.wvz)<.3)P.wvx=P.wvz=0}
 mv(P,dx,dz,.4);
 if((spc||P.jb>0)&&(P.on||P.coy>0)&&P.vy<=1.5){P.vy=PK('Spring Legs')?9.4:7.6;P.on=0;P.coy=0;P.jb=0;P.jv=1;if(typeof feelJump=='function')feelJump()}else if(jp&&!P.on)tryWall();
 if(P.jv&&!spc&&!P.on&&P.vy>3.4)P.vy-=P.vy*Math.min(1,dt*9);
 P.vy-=(sdGameRuntime?.gravity()??20)*dt;P.y+=P.vy*dt;
 if(P.y>maxHeight){P.y=maxHeight;P.vy=Math.min(0,P.vy);P.jb=0;P.coy=0}
 const g=gnd(P,maxHeight);if(P.y<=g){P.lvy=P.vy;P.y=g;P.vy=0;P.on=1;P.wj=0;P.jv=0}else P.on=0;
 if(!P.on&&key.KeyW&&P.vy<5&&t0>=(P.mcd||0))tryMantle(maxHeight)}
function tryMantle(maxHeight=Infinity){const fx_=-Math.sin(yaw),fz_=-Math.cos(yaw),px=P.x+fx_*.65,pz=P.z+fz_*.65;
 indexCollisions();
 for(const b of collisionCells.get(collisionKey(px,pz))||emptyCollisionCell){const up=b.h-P.y;if(b.collisionRemoved||up<.55||up>1.45||b.h>maxHeight||(mode=='Zombies'&&b.h>2.6)||(b.y0||0)>P.y+1.2||px<b.x0-.05||px>b.x1+.05||pz<b.z0-.05||pz>b.z1+.05)continue;
  const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,hx=Math.max(0,(b.x1-b.x0)/2-.3),hz=Math.max(0,(b.z1-b.z0)/2-.3),tx=cl(P.x+fx_,cx-hx,cx+hx),tz=cl(P.z+fz_,cz-hz,cz+hz);
  const room=MAPS[sel.map].playerRoom;if(room&&(Math.abs(tx)>room-.4||Math.abs(tz)>room-.4))continue;
  const ceiling=collisionCells.get(collisionKey(tx,tz))||emptyCollisionCell;
  if(ceiling.some(o=>o!==b&&!o.collisionRemoved&&tx>o.x0-.35&&tx<o.x1+.35&&tz>o.z0-.35&&tz<o.z1+.35&&(o.y0||0)<b.h+1.7&&o.h>b.h+.05))continue;
  P.mt={sx:P.x,sy:P.y,sz:P.z,tx,ty:b.h,tz,t:0,d:.42};P.vy=0;P.wvx=P.wvz=0;beep(300,.1,'triangle',.05);return}}
function mantleStep(dt){const m=P.mt;m.t+=dt;const k=Math.min(1,m.t/m.d),e=eas(Math.min(1,k/.55)),h=eas(Math.max(0,(k-.35)/.65));P.y=m.sy+(m.ty-m.sy)*e;P.x=m.sx+(m.tx-m.sx)*h;P.z=m.sz+(m.tz-m.sz)*h;P.vy=0;P.on=0;
 if(k>=1){P.x=m.tx;P.y=m.ty;P.z=m.tz;P.on=1;P.mt=null;P.mcd=t0+.4;P.wj=0;shake=Math.max(shake,.15)}}
function tryWall(){if(mode=='Zombies'||(P.wj||0)>=3||t0<(P.wcd||0))return;
 indexCollisions();
 for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const qx=P.x+dx*.55,qz=P.z+dz*.55;
  for(const b of collisionCells.get(collisionKey(qx,qz))||emptyCollisionCell){if(!b.collisionRemoved&&qx>b.x0&&qx<b.x1&&qz>b.z0&&qz<b.z1&&(b.y0||0)<P.y+1&&b.h>P.y+.9){P.vy=7.2;P.wvx=-dx*7;P.wvz=-dz*7;P.wj=(P.wj||0)+1;P.wcd=t0+.25;shake=Math.max(shake,.2);beep(420,.09,'triangle',.05);return}}}}

/* ===================== pvp.js ===================== */
/* ---------- simulated PvP (bots fight each other), Team Deathmatch, Capture the Flag, popups, killstreak panel; solo and private matches ---------- */
var ts={},lastBot=null,ksC='',flags=[],cs={A:0,B:0},myTeam='A',mpTeams={},obText='',fcc=0,zones=[],ds={A:0,B:0},dtk=0,zcc=0;
var teamMode=()=>mode=='Team Deathmatch'||mode=='Kill Confirmed'||mode=='Capture the Flag'||mode=='Domination'||mode=='Hardpoint',pTeam=()=>sdGameRuntime?.team()??(teamMode()?myTeam:'p'),ally=b=>mode=='Zombies'?!b.zom:teamMode()&&b.team==pTeam(),hl=()=>PK('Hardline')?1:0,tmOf=e=>e===P?pTeam():e.team,fl=t=>flags.find(f=>f.team==t),tn=t=>t=='A'?'Blue':'Red';
var hname=()=>netOn?myName:'You',feedAll=t=>{feed(t);if(netOn&&isHost)netSend({t:'feed',s:t})};
function leader(){const c=[{nm:hname(),k:kills,me:1},...bots.map(b=>({nm:b.nm,k:b.k||0}))];return c.reduce((a,b)=>b.k>a.k?b:a)}
function clearFlags(){for(const f of flags){S.remove(f.m);S.remove(f.ring)}flags=[];clearZones()}
var PBOTS=null;var botN=d=>PBOTS==null?d:PBOTS;
function setupBots(){if(typeof botNameReset=='function')botNameReset();kcReset();ts={};lastBot=null;clearFlags();cs={A:0,B:0};ds={A:0,B:0};dtk=0;if(practiceSession)return practiceSetup();const cli=netOn&&!isHost,mk=(n,team,role)=>{if(cli)return;const b=addBot(60,1);b.team=team;b.nm=typeof botName=='function'?botName(n,b):n;b.k=0;b.cf=null;b.role=role;b.ox=(Math.random()-.5)*12;b.oz=(Math.random()-.5)*12;if(team==='A'||team==='B')markOperatorTeam(b.rig,team);spawn(b)};
 if(mode=='Slayer'||mode=='One in the Chamber')for(let i=0;i<botN(6);i++)mk((netOn?'Bot ':'Fighter ')+(i+1),'b'+i);
 if(mode=='Time Attack')for(let i=0;i<botN(8);i++)mk((netOn?'Bot ':'Fighter ')+(i+1),'b'+i);
 if(teamMode()){const hc=t=>Object.values(mpTeams).filter(x=>x==t).length;let nA=netOn?Math.max(0,5-hc('A')):4,nB=netOn?Math.max(0,5-hc('B')):5;if(PBOTS!=null){let cA=hc('A')+(netOn?0:1),cB=hc('B');nA=nB=0;for(let i=0;i<PBOTS;i++){if(cA+nA<=cB+nB)nA++;else nB++}}
  for(let i=0;i<nA;i++)mk((netOn?'Blue ':'Ally ')+(i+1),'A',i%2?'def':'atk');for(let i=0;i<nB;i++)mk((netOn?'Red ':'Enemy ')+(i+1),'B',i%2?'def':'atk');if(mode=='Capture the Flag')setupFlags();if(mode=='Domination')setupZones();if(mode=='Hardpoint')setupHP()}}
function freeNear(x,z){for(let r=0;r<40;r+=2)for(let a=0;a<6.3;a+=.7){const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(Math.abs(px)<H-3&&Math.abs(pz)<H-3&&!bx.some(b=>b.h>.5&&(b.y0||0)<2&&px>b.x0-2&&px<b.x1+2&&pz>b.z0-2&&pz<b.z1+2)&&(!MAPS[sel.map].inside||MAPS[sel.map].inside(px,pz))&&(typeof navOK!='function'||navOK(px,pz)))return[px,pz]}return[x,z]}
function setupFlags(){const fb=MAPS[sel.map].fb||[[-H*.7,0],[H*.7,0]];flags=['A','B'].map((team,i)=>{const[hx,hz]=freeNear(...fb[i]),col=team=='A'?0x3d6ad6:0xd9432e,m=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,3.4,8),new THREE.MeshLambertMaterial({color:0xdddddd})),cloth=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:col})),ring=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.05,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.4}));
 pole.position.y=1.7;cloth.scale.set(1.3,.8,.05);cloth.position.set(.7,3,0);m.add(pole,cloth);m.position.set(hx,0,hz);ring.position.set(hx,.05,hz);S.add(m,ring);return{team,hx,hz,x:hx,z:hz,st:'home',by:null,byk:'',dt:0,m,ring}})}
function retFlag(f,e){f.st='home';f.x=f.hx;f.z=f.hz;f.by=null;feedAll(`${tn(f.team)} flag returned${e?' by '+(e===P?hname():e.nm):''}`)}
function ctfGoal(b){const tm=b.team,EF=fl(tm=='A'?'B':'A'),OF=fl(tm);if(b.cf)return OF.st=='home'?[OF.hx,OF.hz]:[OF.x,OF.z];
 if(OF.st!='home'&&(b.role=='def'||Math.hypot(OF.x-b.x,OF.z-b.z)<30))return[OF.x,OF.z];
 if(b.role=='atk')return EF.st=='carried'&&tmOf(EF.by)==tm?[OF.hx+b.ox*.5,OF.hz+b.oz*.5]:[EF.x,EF.z];return[OF.hx+b.ox,OF.hz+b.oz]}
function ctfTick(dt){for(const f of flags){if(f.st=='carried'){const e=f.by;if(e===P?P.dead:!e.al){f.st='dropped';f.dt=0;e.cf=null;feedAll(tn(f.team)+' flag dropped')}else{f.x=e.x;f.z=e.z}}else if(f.st=='dropped'){f.dt+=dt;if(f.dt>15)retFlag(f)}
  f.m.position.set(f.x,0,f.z);f.m.visible=!(f.st=='carried'&&f.by===P)}
 for(const e of[...(P.dead?[]:[P]),...bots.filter(b=>b.al)]){const tm=tmOf(e),OF=fl(tm),EF=fl(tm=='A'?'B':'A');
  if(!e.cf&&EF.st!='carried'&&Math.hypot(e.x-EF.x,e.z-EF.z)<1.8){EF.st='carried';EF.by=e;e.cf=EF;feedAll(`${e===P?hname():e.nm} took the ${tn(EF.team)} flag`);if(e===P)msg('You have the flag! Bring it home',2.5)}
  if(OF.st=='dropped'&&Math.hypot(e.x-OF.x,e.z-OF.z)<1.8)retFlag(OF,e);
  if(e.cf&&OF.st=='home'&&Math.hypot(e.x-OF.hx,e.z-OF.hz)<2.5){cs[tm]++;retFlag(e.cf);e.cf=null;if(e===P)bonusXP(.12)}}
 if(netOn&&isHost){fcc+=dt;if(fcc>.12){fcc=0;netSend({t:'f',cs,f:flags.map(f=>[f.st,+f.x.toFixed(1),+f.z.toFixed(1),f.by?(f.by===P?myId:f.by.net?f.by.id:'b'+f.by.i):''])})}}}
/* ---------- Domination: three zones, hold them to score, first team to 350 ---------- */
function clearZones(){for(const z of zones)S.remove(z.m);zones=[]}
function setupZones(){clearZones();const zp=MAPS[sel.map].zn||[[-H*.62,0],[0,0],[H*.62,0]];
 zones=zp.map(([zx,zz],i)=>{const[x,z]=freeNear(zx,zz),m=new THREE.Group(),R0=5.5,mt=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.28,depthWrite:false}),
  base=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.06,40),mt(0xcccccc)),fill=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.1,40),mt(0xcccccc)),beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,9,10),mt(0xcccccc)),
  cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.font='700 100px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('ABC'[i],64,70);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true}));
  base.position.y=.05;fill.position.y=.07;beam.position.y=4.5;sp.position.y=9.6;sp.scale.set(3,3,1);m.add(base,fill,beam,sp);m.position.set(x,0,z);S.add(m);
  const o={n:'ABC'[i],x,z,r:R0,m,base,fill,beam,o:'',cp:0,a:0,b:0};zoneVis(o);return o})}
function zoneVis(z){const col=z.o=='A'?0x62a8ff:z.o=='B'?0xff5a3a:0xcccccc,s=Math.max(.001,Math.abs(z.cp));z.base.material.color.setHex(col);z.beam.material.color.setHex(col);z.fill.material.color.setHex(z.cp>0?0x62a8ff:0xff5a3a);z.fill.scale.set(s,1,s);z.fill.visible=Math.abs(z.cp)>.01}
function domTick(dt){const ents=[...(P.dead?[]:[P]),...bots.filter(b=>b.al)];
 for(const z of zones){let a=0,b=0;for(const e of ents)if(Math.hypot(e.x-z.x,e.z-z.z)<z.r&&(e.y||0)<4){if(tmOf(e)=='A')a++;else b++}
  z.a=a;z.b=b;if(a&&!b)z.cp=Math.min(1,z.cp+dt*.22*Math.min(a,3));else if(b&&!a)z.cp=Math.max(-1,z.cp-dt*.22*Math.min(b,3));
  let o=z.o;if(z.cp>=1)o='A';else if(z.cp<=-1)o='B';else if((o=='A'&&z.cp<=0)||(o=='B'&&z.cp>=0))o='';
  if(o!=z.o){z.o=o;if(o&&o==pTeam())bonusXP(.02)}
  zoneVis(z)}
 dtk+=dt;while(dtk>=2){dtk-=2;for(const z of zones)if(z.o)ds[z.o]++}
 if(netOn&&isHost){zcc+=dt;if(zcc>.15){zcc=0;netSend({t:'z',ds,z:zones.map(z=>[z.o,+z.cp.toFixed(2)])})}}}
/* ---------- Hardpoint: one scoring zone with a visible perimeter that moves to the next location every 60 seconds. A team scores 1 point per second while at least one of its players is inside
   and nobody from the other team is. First to 250 wins. ---------- */
var hpIdx=0,hpTL=60,hpS=0,hpPos=[];
function hpMake(x,z,idx){const R0=7,mt=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,side:THREE.DoubleSide}),m=new THREE.Group(),
 ring=new THREE.Mesh(new THREE.RingGeometry(R0-.45,R0,64),mt(0xffffff,.9)),base=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.05,48),mt(0xffffff,.16)),wall=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,2.2,48,1,true),mt(0xffffff,.12)),beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,12,10),mt(0xffffff,.3)),
 cv=document.createElement('canvas');cv.width=256;cv.height=96;const g=cv.getContext('2d');g.font='700 70px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('HARDPOINT',128,50);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true}));ring.rotation.x=-Math.PI/2;ring.position.y=.1;base.position.y=.04;wall.position.y=1.1;beam.position.y=6;sp.position.y=13;sp.scale.set(6,2.25,1);m.add(ring,base,wall,beam,sp);m.position.set(x,0,z);S.add(m);
 const o={n:'HP',x,z,r:R0,m,base,fill:ring,beam,wall,ring,o:'',cp:0,a:0,b:0,idx,st:''};hpVis(o);return o}
function hpVis(z){const col=z.st=='A'?0x62a8ff:z.st=='B'?0xff5a3a:z.st=='c'?0xffd24a:0xffffff;for(const k of['ring','base','wall','beam'])z[k].material.color.setHex(col)}
function hpPlace(i){clearZones();hpPos=MAPS[sel.map].zn||[[-H*.62,0],[0,0],[H*.62,0]];hpIdx=i%hpPos.length;const[x,z]=freeNear(hpPos[hpIdx][0],hpPos[hpIdx][1]);zones=[hpMake(x,z,hpIdx)]}
function setupHP(){hpTL=60;hpS=0;hpPlace(Math.random()*3|0)}
function hpApply(h){if(!zones[0]||zones[0].idx!=h.i){clearZones();zones=[hpMake(h.x,h.z,h.i)]}const z=zones[0];z.st=h.st;z.o=h.st=='A'||h.st=='B'?h.st:'';hpTL=h.tl;hpVis(z)}
function hpTick(dt){const z=zones[0];if(!z)return;const ents=[...(P.dead?[]:[P]),...bots.filter(b=>b.al)];let a=0,b=0;for(const e of ents)if(Math.hypot(e.x-z.x,e.z-z.z)<z.r&&(e.y||0)<4){if(tmOf(e)=='A')a++;else b++}
 const st=a&&b?'c':a?'A':b?'B':'';if(st!=z.st){z.st=st;z.o=st=='A'||st=='B'?st:'';hpVis(z)}
 z.a=a;z.b=b;hpS+=dt;while(hpS>=1){hpS-=1;if(a&&!b)ds.A++;else if(b&&!a)ds.B++}
 const pre=hpTL;hpTL-=dt;if(Math.floor(pre)!=Math.floor(hpTL)&&hpTL<=5&&hpTL>0)beep(700,.08,'square',.05);
 if(hpTL<=0){hpTL=60;hpPlace(hpIdx+1)}
 if(netOn&&isHost){zcc+=dt;if(zcc>.15){zcc=0;const q=zones[0];netSend({t:'z',ds,z:[[q.o,0]],hp:{i:hpIdx,x:q.x,z:q.z,tl:+hpTL.toFixed(1),st:q.st}})}}}
/* bots head for the zone that is nearest and not already theirs; defenders also stay on zones their team owns */
function domGoal(b){if(!zones.length)return null;if(b.zi==null||t0>(b.zr||0)){b.zr=t0+3+Math.random()*3;const tm=b.team;b.zi=zones.map((z,i)=>({i,s:Math.hypot(z.x-b.x,z.z-b.z)+(z.o==tm?(b.role=='def'?0:60):0)+Math.random()*25})).sort((p,q)=>p.s-q.s)[0].i}
 const z=zones[b.zi];return[z.x+b.ox*.3,z.z+b.oz*.3]}
function target(b){let best=null,bd=1e9;for(const t of bots){if(t===b||!t.al||t.team==b.team)continue;const d=Math.hypot(t.x-b.x,t.z-b.z);if(d<bd){bd=d;best=t}}
 if(!P.dead&&b.team!=pTeam()&&Math.hypot(P.x-b.x,P.z-b.z)<bd)best=P;return best}
function botHit(t,d,by,head){takeDmg(t,d,by);t.fl=.08;if(t.hp<=0){t.al=0;t.dc=(t.dc||0)+1;bodyFall(t);t.rt=2.5;burst(V(t.x,1,t.z),20,0xb5452e,6,.8,.15);by.k=(by.k||0)+1;ts[by.team]=(ts[by.team]||0)+1;feed(`${by.nm} ▸ ${t.nm}`);announce(t,by,head)}}
function botScoreOnMe(){const b=lastBot;lastBot=null;if(b&&!b.net){b.k=(b.k||0)+1;ts[b.team]=(ts[b.team]||0)+1;feed(`${b.nm} ▸ You`)}}
function updBots(dt){if(practiceSession||netOn&&!isHost||sdGameRuntime?.aiDisabled())return;for(const b of bots){if(b.net||b.zom||sdGameRuntime?.aiIdle(b))continue;
 if(!b.al){if(b.rt>0&&mode!='Survival'){b.rt-=dt;if(b.rt<=0)spawn(b)}continue}
 if(b.stun>0){b.stun-=dt;continue}
 if(b.sh<b.msh&&t0-b.lh>4)b.sh=Math.min(b.msh,b.sh+40*dt);if(b.rl>0)b.rl-=dt;
 b.ts=(b.ts||0)-dt;if(b.ts<=0||!b.tg||(b.tg===P?P.dead:!b.tg.al)){b.ts=.5;b.tg=target(b)}
 const t=b.tg,g=mode=='Capture the Flag'?ctfGoal(b):mode=='Domination'||mode=='Hardpoint'?domGoal(b):mode=='Kill Confirmed'?kcGoal(b):null,td=t?Math.hypot(t.x-b.x,t.z-b.z):1e9,obj=g&&td>=(b.cf?7:20);if(!t&&!g)continue;
 const mt=obj?{x:g[0],z:g[1]}:t,dx=mt.x-b.x,dz=mt.z-b.z,dd=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
 b.ot-=dt;if(b.ot<=0){b.ot=1+Math.random()*1.5;b.off=(Math.random()-.5)*2.2||1}
 const h=obj?ang+b.off*.45:ang+(dd>16?b.off*.3:dd<7?Math.PI+b.off*.3:Math.sign(b.off)*1.4),sp=(obj?4.2:3.4)*Math.min(b.df,1.6)*(b.sm||1),px=b.x,pz=b.z;
 if(obj||dd>14||!navLos(b.x,b.z,mt.x,mt.z)){if(!(obj&&dd<2.5))navMove(b,dt,mt.x,mt.z,sp)}
 else{mv(b,Math.sin(h)*sp*dt,Math.cos(h)*sp*dt,.45);if(Math.hypot(b.x-px,b.z-pz)<sp*dt*.3&&dd>2.5){b.off=(Math.random()<.5?-1:1)*2.5;b.ot=.8}}
 if(MAPS[sel.map].swim)quarryBotDepth(b,dt);
 b.m.position.set(b.x,b.y,b.z);b.m.rotation.y=t?Math.atan2(t.x-b.x,t.z-b.z):ang;b.cd-=dt;
 if(t&&b.cd<=0&&!(b.rl>0)&&td<45&&!sdGameRuntime?.aiPassive(b)){const o=V(b.x,b.y+1.5,b.z),tv=V(t.x,(t.y||0)+1.2,t.z).sub(o),D=tv.length();tv.divideScalar(D);
  if(castW(o,tv,D)>=D-.1){const w=W[b.wk]||W.AR;b.am=(b.am==null||b.amk!=b.wk?w.m:b.am)-1;b.amk=b.wk;if(b.am<=0){b.rl=w.rl;b.am=w.m;FOL.bot(b,w)}b.bn=(b.bn||0)-1;b.cd=w.r*(.9+Math.random()*.3)+(b.bn<=0?.45+Math.random()*.7:0);if(b.bn<=0)b.bn=w.burst?w.burst:w.au?3+(Math.random()*5|0):1;{b.viewShot=t0;const mz=muzzle(b),tp=V(t.x,(t.y||0)+1.2,t.z),ev=tp.clone().sub(mz),L2=ev.length();ev.divideScalar(L2);if(b.wk=='RG'){rgBeam(mz,ev,L2,1);rgImpact(mz.clone().add(ev.clone().multiplyScalar(L2)))}else{tr(mz,ev,L2,b.team==='A'?0x62a8ff:0xff5a3a,.08,1);if(b.wk=='RL'&&JX.explode)JX.explode(mz.clone().add(ev.clone().multiplyScalar(L2)),W.RL.ex)}muzzleFlash(mz,b.wk);otherSnd(b.wk,mz);if(netOn&&isHost)netSend({t:'bsh',i:b.i,w:b.wk,x:+tp.x.toFixed(1),y:+tp.y.toFixed(1),z:+tp.z.toFixed(1)})}
   const ch=Math.max(.12,.5-td/110)*Math.min(1.3,b.df)*(b.hm||1);let n=0;for(let i=0;i<(w.pel||1);i++)if(Math.random()<ch)n++;if(n){const dm=n*(w.d+(w.ex?w.ex.d*.7:0))*falloff(w,td);if(t===P)hurt(dm*(typeof ST!='undefined'?(ST.prone?.7:ST.crouch?.85:1):1),b);else if(t.net)netSend({t:'hit',to:t.id,d:dm,bot:b.i});else botHit(t,dm,b)}}}}}
function pvpTick(dt){
 const goal=sdGameRuntime?.scoreLimit()??(window.SD_MOD_SESSION?modRules.scoreLimit:undefined);
 if(mode=='Capture the Flag'){const target=goal??3;ctfTick(dt);const A=fl('A'),B=fl('B'),st=f=>f.st=='home'?'safe':f.st=='dropped'?'dropped':'taken';setObjectiveText(`Blue ${cs.A} - ${cs.B} Red  ·  first to ${target}  ·  Blue flag ${st(A)}  ·  Red flag ${st(B)}`);const w=cs.A>=target?'A':cs.B>=target?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Hardpoint'){const target=goal??250;hpTick(dt);const z=zones[0];setObjectiveText(`Blue ${ds.A} – ${ds.B} Red  ·  first to ${target}  ·  Hardpoint ${hpIdx+1}/${hpPos.length}  ·  moves in ${Math.max(0,Math.ceil(hpTL))}s  ·  `+(z?z.st=='c'?'CONTESTED':z.st=='A'?'BLUE HOLDING':z.st=='B'?'RED HOLDING':'EMPTY':''));const w=ds.A>=target?'A':ds.B>=target?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Domination'){const target=goal??350;domTick(dt);setObjectiveText(`Blue ${ds.A} – ${ds.B} Red  ·  first to ${target}  ·  `+zones.map(z=>z.n+' '+(z.o?z.o=='A'?'blue':'red':'open')).join('  ·  '));const w=ds.A>=target?'A':ds.B>=target?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Kill Confirmed'){const target=goal??KC_WIN;kcTick(dt);setObjectiveText(`Blue ${kc.A} – ${kc.B} Red  ·  first to ${target} confirms  ·  tags ${kcTags.length}`);const w=kc.A>=target?'A':kc.B>=target?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Team Deathmatch'){const target=goal??50;setObjectiveText(`Blue ${ts.A||0}  ·  Red ${ts.B||0}   (first to ${target})`);const w=(ts.A||0)>=target?'A':(ts.B||0)>=target?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(window.SD_MOD_SESSION&&modRules.base==='Gun Game'){
  setObjectiveText(`${modRules.name}  ·  Weapon ${GG.i+1} / ${GG.lad.length}  ·  ${W[GG.lad[GG.i]].n}`);
  if(bots.some(bot=>bot.k>=GG.lad.length))endGame('Defeat');
  return;
 }
 const target=goal??20,l=leader();setObjectiveText(`${window.SD_MOD_SESSION?modRules.name||'Slayer':'Slayer'}  ·  Leader ${l.nm} ${l.k} / ${target}`);if(l.k>=target)endGame(l.me?'Victory':l.nm+' wins')}
;
/* ######## weapons.js ######## */
/* ===================== weapons.js ===================== */
/* ---------- MVR-67: full-auto assault rifle (unlocked from the start). Excellent accuracy and range, offset by a slower rate of fire.
   Model built from boxes: bronze receiver and M-LOK handguard, black lower, flip-up sights on a top rail, vented muzzle brake,
   amber magazine and an angular folding-style stock with a cheek riser. Built along +z, muzzle at z=.98 ---------- */
W.MVR={n:'MVR-67',d:40,r:.14,m:24,sp:.005,rc:1.6,pel:1,au:1,rl:2.5,len:.7,col:0x8f6e3e};
PRI.splice(1,0,'MVR');WG.MVR=[1,0x8f6e3e,1,0xffb060];RLK.MVR='mag';BOTGUNS.push('MVR');
function mkMVR(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),tan=rm||M(0x8f6e3e),blk=M(0x15171a),dk=M(0x24272c),gr=M(0x3a3e44),amber=M(0xc8782a),steel=M(0x8a9098),
  box=(w,h,d,x,y,z,m,rx,ry)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;g.add(o);return o};
 /* receiver */
 box(.088,.108,.5,0,.002,.15,tan);box(.092,.03,.34,0,.045,.16,dk);box(.07,.07,.34,0,-.07,.1,blk);box(.09,.02,.08,0,-.03,.34,blk);
 box(.012,.05,.07,.048,.0,.32,blk);box(.012,.03,.05,.048,.02,.1,gr);box(.01,.05,.016,-.049,.02,.02,gr);
 /* ejection port and charging handle */
 box(.004,.04,.1,.045,.03,.1,blk);box(.022,.02,.05,0,.062,-.04,gr);box(.01,.03,.014,.05,.0,.04,steel);
 /* handguard with M-LOK slots, vents and a rail */
 box(.082,.098,.44,0,.004,.62,tan);box(.084,.03,.44,0,.044,.62,dk);for(let i=0;i<5;i++){box(.086,.012,.04,0,-.012,.46+i*.075,blk);box(.012,.03,.045,.044,.014,.46+i*.075,blk);box(.012,.03,.045,-.044,.014,.46+i*.075,blk)}
 box(.07,.02,.4,0,-.052,.62,blk);box(.03,.03,.1,0,-.07,.7,dk,0);
 /* top rail with teeth */
 box(.03,.02,.92,0,.074,.42,blk);for(let i=0;i<14;i++)box(.034,.008,.012,0,.086,-.02+i*.066,dk);
 /* barrel, gas block and muzzle brake */
 box(.03,.03,.2,0,.01,.94,dk);box(.045,.045,.05,0,.01,.78,gr);box(.054,.056,.12,0,.01,1.0,blk);for(let i=0;i<3;i++){box(.058,.012,.014,0,.012,.96+i*.035,tan)}box(.02,.02,.012,0,.01,1.066,dk);
 /* flip-up sights: rear with an aperture, front with a post */
 mkSights(g,'MVR',{yt:.138,yb:.086,yf:.086,zr:.0,zf:.77});
 /* grips */
 box(.046,.15,.06,0,-.15,-.06,blk,.3);box(.05,.02,.07,0,-.225,-.09,dk,.3);box(.012,.1,.05,.026,-.14,-.06,gr,.3);box(.012,.1,.05,-.026,-.14,-.06,gr,.3);
 box(.012,.012,.1,0,-.1,.14,dk);box(.012,.04,.012,0,-.085,.2,dk);box(.012,.04,.012,0,-.085,.08,dk);
 box(.05,.02,.07,0,-.056,.5,gr);box(.034,.06,.1,0,-.09,.52,blk);
 /* amber magazine */
 const mg=[box(.046,.2,.08,0,-.17,.2,amber,.12),box(.05,.02,.088,0,-.275,.188,dk,.12)];
 box(.052,.2,.02,0,-.17,.255,blk,.12);
 /* stock: hinge, skeletal arms, cheek riser and butt pad */
 box(.06,.1,.04,0,0,-.13,dk);box(.04,.025,.26,0,.03,-.28,blk);box(.04,.025,.22,0,-.05,-.26,blk,.12);box(.044,.05,.16,0,.062,-.3,gr);box(.05,.13,.04,0,-.01,-.42,dk);box(.056,.03,.05,0,.062,-.42,blk);
 g.userData.a={r:[0,-.14,-.05],l:[0,-.09,.62],m:[0,-.17,.2]};g.userData.mags=mg;return g}
;
/* ######## models.js ######## */
/* ===================== models.js ===================== */
/* ---------- detailed weapon models for the guns that used to be five blocks: KN-115, SMG, Battle Rifle, Machine Pistol, Sniper Rifle, Rocket Launcher and RayGun.
   Every model is built to be seen from any side (both flanks, top, underside, front and back): rounded barrels, trigger guards and triggers, ejection ports, rails,
   vents, stocks with pads, magazines with base plates, charging handles. Camo material rm replaces the body parts. Built along +z, muzzle at about z = length. ---------- */
function gunKit(g,rm){const cache={},M=c=>cache[c]||(cache[c]=new THREE.MeshLambertMaterial({color:c})),E=c=>cache['e'+c]||(cache['e'+c]=new THREE.MeshBasicMaterial({color:c})),
 add=(m,x,y,z,rx,ry,rz)=>{m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m};
 return{M,E,body:rm,
  box:(w,h,d,x,y,z,mat,rx,ry,rz)=>{const m=new THREE.Mesh(bg,mat);m.scale.set(w,h,d);return add(m,x,y,z,rx,ry,rz)},
  cyl:(r,len,x,y,z,mat,rf,seg)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rf==null?r:rf,r,len,seg||14),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  cylY:(r,h,x,y,z,mat,rx,rz,rt)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt==null?r:rt,r,h,12),mat);return add(m,x,y,z,rx,0,rz)},
  cone:(r,len,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,len,10),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  sph:(r,x,y,z,mat,sx,sy,sz)=>{const m=new THREE.Mesh(sg,mat);m.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));return add(m,x,y,z)},
  ring:(r,t,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,16),mat);return add(m,x,y,z)}}}
var MODELS={};
MODELS.SMG=function(g,rm,key='SMG'){const k=gunKit(g,rm),M=k.M,body=rm||M(0x5a4a40),dk=M(0x17181b),gm=M(0x2d2f34),steel=M(0x8a9098),mags=[];
 k.box(.07,.095,.34,0,0,.18,body);k.box(.066,.022,.3,0,.056,.18,gm);k.box(.004,.034,.09,.036,.01,.14,dk);k.box(.014,.014,.04,.038,.025,.07,steel);
 k.cyl(.04,.28,0,.005,.48,gm);for(let i=0;i<5;i++){k.box(.082,.012,.02,0,.005,.38+i*.045,dk);k.box(.012,.05,.02,.04,.005,.38+i*.045,dk);k.box(.012,.05,.02,-.04,.005,.38+i*.045,dk)}
 k.cyl(.014,.14,0,.005,.66,dk);k.cyl(.022,.08,0,.005,.7,dk);k.cyl(.026,.02,0,.005,.745,gm);
 k.box(.05,.012,.28,0,.068,.3,gm);k.box(.04,.12,.04,0,-.1,.08,dk,.3);k.box(.045,.02,.05,0,-.165,.04,gm,.3);k.box(.05,.008,.08,0,-.052,.2,gm);k.box(.004,.026,.07,0,-.066,.205,dk);k.box(.01,.026,.01,0,-.068,.225,steel);
 mags.push(k.box(.036,.2,.062,0,-.17,.24,dk,.04));mags.push(k.box(.04,.016,.066,0,-.274,.236,gm,.04));k.box(.03,.09,.036,0,-.082,.42,gm);k.cylY(.016,.07,0,-.12,.4,dk);
 k.box(.014,.014,.2,.025,.01,-.18,steel);k.box(.014,.014,.2,-.025,.01,-.18,steel);k.box(.06,.1,.02,0,-.01,-.29,gm);k.box(.07,.02,.04,0,.05,-.29,dk);k.box(.014,.12,.014,.03,-.03,-.22,steel,.3);k.box(.014,.12,.014,-.03,-.03,-.22,steel,.3);
 g.userData.a={r:[0,-.12,.06],l:[0,-.1,.42],m:[0,-.17,.24]};g.userData.mags=mags;mkSights(g,key,{yt:.118,yb:.0785,yf:.0785,zr:.1,zf:.54});return g};
/* ---- Battle Rifle: long rounded handguard, flash hider, thumbhole-style stock, straight 20 round magazine, rear leaf sight ---- */
MODELS.BR=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x2f4a3a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),wood=M(0x4a3a2a),mags=[];
 k.box(.078,.108,.46,0,0,.2,body);k.box(.072,.028,.42,0,.06,.2,gm);k.box(.004,.04,.1,.04,.012,.16,dk);k.box(.016,.014,.05,.042,.03,.07,steel);
 k.cyl(.04,.46,0,.002,.68,body);for(let i=0;i<6;i++){k.box(.012,.04,.024,.04,.01,.5+i*.07,dk);k.box(.012,.04,.024,-.04,.01,.5+i*.07,dk)}k.cyl(.043,.02,0,.002,.46,gm);k.cyl(.043,.02,0,.002,.9,gm);
 k.cyl(.015,.22,0,.004,1.0,dk);k.cyl(.024,.12,0,.004,1.08,gm);for(let i=0;i<3;i++)k.box(.054,.008,.018,0,.004,1.04+i*.03,dk);k.cyl(.02,.014,0,.004,1.15,dk);
 k.box(.04,.018,.4,0,.078,.52,gm);k.box(.036,.03,.034,0,.075,.18,gm);k.box(.04,.12,.05,0,-.1,.05,dk,.32);k.box(.05,.02,.06,0,-.165,0,gm,.32);k.box(.008,.03,.1,0,-.07,.14,steel);k.box(.01,.028,.012,0,-.07,.17,steel);
 mags.push(k.box(.04,.15,.1,0,-.13,.24,gm,.05));mags.push(k.box(.044,.016,.104,0,-.215,.236,dk,.05));
 k.box(.06,.12,.05,0,.01,-.02,gm);k.box(.05,.09,.36,0,.0,-.26,wood);k.box(.05,.06,.2,0,-.085,-.16,wood,.05);k.box(.054,.13,.04,0,-.02,-.46,dk);k.box(.044,.04,.15,0,.075,-.28,wood);
 k.box(.024,.05,.034,0,.063,.9,gm);k.box(.034,.012,.034,0,.04,.9,dk);
 g.userData.a={r:[0,-.12,.04],l:[0,-.07,.68],m:[0,-.13,.24]};g.userData.mags=mags;mkSights(g,'BR',{yt:.12,yb:.0885,yf:.0885,zr:.06,zf:.9});return g};
/* ---- Machine Pistol: boxy slide with serrations, short barrel, extended stick magazine, folding stabiliser, small front grip ---- */
MODELS.MP=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x3a3a4a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),mags=[];
 k.box(.052,.07,.34,0,.02,.14,body);k.box(.056,.014,.3,0,.062,.14,gm);for(let i=0;i<6;i++)k.box(.058,.05,.01,0,.025,.03+i*.016,dk);k.box(.004,.03,.08,.027,.03,.15,dk);
 k.box(.044,.04,.28,0,-.034,.17,gm);k.cyl(.012,.1,0,.03,.37,dk);k.cyl(.018,.05,0,.03,.4,gm);
 k.box(.04,.11,.052,0,-.09,.02,dk,.22);k.box(.044,.014,.06,0,-.15,-.01,gm,.22);k.box(.006,.022,.07,0,-.058,.12,dk);k.box(.01,.022,.01,0,-.058,.14,steel);k.box(.03,.014,.065,0,-.04,.075,gm);
 mags.push(k.box(.032,.19,.052,0,-.14,.17,dk,.02));mags.push(k.box(.036,.014,.056,0,-.24,.168,gm,.02));k.box(.024,.07,.03,0,-.07,.3,gm);k.cylY(.014,.05,0,-.1,.28,dk);
 k.box(.012,.012,.14,.02,.03,-.02,steel);k.box(.012,.012,.14,-.02,.03,-.02,steel);k.box(.05,.05,.014,0,.03,-.1,gm);
 g.userData.a={r:[0,-.1,.02],l:[0,-.08,.3],m:[0,-.14,.17]};g.userData.mags=mags;mkSights(g,'MP',{yt:.1,yb:.0765,yf:.0765,zr:.05,zf:.34});return g};
/* ---- Sniper Rifle: heavy barrel with muzzle brake, bolt with ball handle, full length stock with cheek rest, scope with lens caps, folded bipod ---- */
MODELS.SN=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x2a2f4a),dk=M(0x111316),gm=M(0x2b2e33),steel=M(0x8a9098),lens=k.E(0x6ab0ff),mags=[];
 k.box(.07,.1,.5,0,0,.22,body);k.box(.066,.024,.46,0,.06,.22,gm);k.box(.004,.034,.1,.036,.02,.2,dk);k.cyl(.007,.1,.07,.03,.12,steel);k.sph(.018,.07,.03,.06,steel);
 k.cyl(.024,.7,0,.012,.8,dk);k.cyl(.034,.4,0,.012,.52,body);k.cyl(.022,.1,0,.012,1.18,gm);for(let i=0;i<3;i++)k.box(.054,.006,.016,0,.012,1.14+i*.032,dk);k.cyl(.026,.012,0,.012,1.1,gm);
 /* scope on two rings: tube, bells, lens, turrets */
 k.cyl(.027,.34,0,.11,.36,gm);k.cyl(.036,.1,0,.11,.2,gm,.027);k.cyl(.04,.1,0,.11,.52,gm,.027);k.cyl(.033,.006,0,.11,.2,lens);k.cyl(.036,.006,0,.11,.57,lens);k.cylY(.01,.04,0,.14,.36,dk);k.cylY(.01,.04,.034,.11,.36,dk,0,Math.PI/2);
 for(const z of[.26,.46]){k.box(.01,.05,.024,.02,.075,z,gm);k.box(.01,.05,.024,-.02,.075,z,gm);k.box(.05,.012,.024,0,.052,z,dk)}
 k.box(.04,.12,.052,0,-.1,.04,dk,.3);k.box(.05,.018,.06,0,-.165,0,gm,.3);k.box(.008,.03,.1,0,-.066,.16,steel);
 mags.push(k.box(.04,.12,.07,0,-.1,.28,dk,.04));mags.push(k.box(.044,.014,.074,0,-.165,.278,gm,.04));
 k.box(.06,.12,.06,0,.0,-.04,gm);k.box(.05,.11,.4,0,.0,-.28,body);k.box(.04,.04,.24,0,.07,-.27,body);k.box(.06,.16,.04,0,-.02,-.5,dk);k.box(.044,.07,.18,0,-.075,-.2,body,.1);
 for(const s of[-1,1]){k.cylY(.006,.18,s*.04,-.05,.62,steel,.55,s*.18);k.box(.012,.02,.02,s*.036,-.025,.6,dk)}
 k.box(.064,.014,.044,.018,.066,.115,gm);k.box(.072,.014,.033,.027,.027,.89,gm);
 mkSights(g,'SN',{xt:.058,yt:.145,yb:.074,yf:.035,zr:.115,zf:.89});
 g.userData.a={r:[0,-.12,.04],l:[0,-.07,.72],m:[0,-.1,.28]};g.userData.mags=mags;return g};
/* ---- Rocket Launcher: shoulder tube with flared rear, loaded warhead, sights, two grips, vents, strap rings ---- */
MODELS.RL=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x7a3a2a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),red=M(0xc0392b),oli=M(0x4a5030);
 k.cyl(.07,.98,0,0,.42,body);k.cyl(.078,.12,0,0,.0,gm,.1);k.cyl(.1,.06,0,0,-.08,gm,.078);k.cyl(.076,.06,0,0,.92,gm);k.cyl(.065,.02,0,0,.95,dk);
 k.cone(.05,.16,0,0,1.07,red);k.cyl(.05,.12,0,0,.96,oli,.05);for(const a of[0,1.571,3.142,4.712])k.box(.006,.012,.06,Math.cos(a)*.05,Math.sin(a)*.05,.93,gm);
 for(let i=0;i<4;i++)k.ring(.072,.006,0,0,.2+i*.2,steel).rotation.y=0;
 k.box(.1,.04,.18,0,.085,.25,dk);k.box(.06,.012,.1,0,.09,.5,gm);
 k.box(.044,.14,.06,0,-.12,.2,dk,.3);k.box(.05,.02,.07,0,-.195,.17,gm,.3);k.box(.006,.03,.1,0,-.085,.27,steel);k.box(.01,.03,.012,0,-.085,.31,steel);
 k.box(.04,.1,.04,0,-.12,.62,dk);k.box(.05,.02,.07,0,-.18,.62,gm);for(let i=0;i<5;i++)k.box(.012,.016,.04,.07,.02,.12+i*.07,dk);
 k.box(.12,.14,.04,0,0,-.12,gm);k.box(.13,.16,.02,0,0,-.16,dk);k.cylY(.016,.03,.07,.05,.4,steel,0,Math.PI/2);k.cylY(.016,.03,-.07,.05,.4,steel,0,Math.PI/2);
 g.userData.a={r:[0,-.12,.2],l:[0,-.11,.62],m:[0,0,-.04]};g.userData.mags=[];mkSights(g,'RL',{yt:.154,yb:.102,yf:.059,zr:.177,zf:.91});return g};
/* ---- RayGun: rounded alien pistol, fins, glowing emitter and cell, brass fittings ---- */
/* Keep the original geometry for the VMP and RayGun. */
for(const [key,source,size,receiver,anchor,muzzle] of [
 ['VMP',vmpG,[.08,.1,.42],[0,0,-.25],{r:[0,-.1,-.08],l:[0,-.06,-.38],m:[0,-.2,-.15]},[0,0,-.58]],
 ['RG',rgG,[.06,.06,.22],[0,-.01,-.06],{r:[0,-.095,.08],l:[-.02,-.15,.09],m:[0,-.14,0],pd:[0,.24,0],ho:[0,0,0]},[0,0,-.56]]
]){
 const body=new THREE.MeshLambertMaterial({color:W[key].col});
 const flip=([x,y,z])=>[-x,y,-z],rotate=new THREE.Matrix4().makeRotationY(Math.PI);
 MODELS[key]=(g,finish)=>{
  source.updateMatrix();
  const staticPose=new THREE.Matrix4().multiplyMatrices(rotate,source.matrix),copies=new Map();
  for(const part of source.children){
   const m=part.material,keep=part.userData.sightPart||part.userData.glow;
   const mesh=new THREE.Mesh(part.geometry,keep?m:(finish||(m===rm?body:m)));
   part.updateMatrix();
   new THREE.Matrix4().multiplyMatrices(staticPose,part.matrix).decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.userData={...part.userData};g.add(mesh);copies.set(part,mesh);
  }
  const base=new THREE.Mesh(bg,finish||body);
  base.position.set(...flip(receiver));base.scale.set(...size);g.add(base);
  const {xt,yt,zr}=source.userData.sight,[x,y,z]=flip(muzzle);
  g.userData.a=Object.fromEntries(Object.entries(anchor).map(([name,value])=>[name,flip(value)]));
  g.userData.mags=source.userData.mag.map(part=>copies.get(part));
  g.userData.sight={xt:-(xt+source.position.x),yt:yt+source.position.y,zr:-(zr+source.position.z)};
  g.userData.muzzle={x,y,z};g.userData.viewOffset=0;
  return g;
 };
}
var weldMat=new THREE.MeshLambertMaterial({color:0x24272c});
function weldModel(g,boxOf){
 if(!boxOf){
  g.updateWorldMatrix(true,true);const inverse=g.matrixWorld.clone().invert(),transform=new THREE.Matrix4(),bounds=new THREE.Box3();
  boxOf=m=>{if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bounds.copy(m.geometry.boundingBox).applyMatrix4(transform.multiplyMatrices(inverse,m.matrixWorld));return{min:bounds.min.toArray(),max:bounds.max.toArray()}};
 }
 const skip=new Set([...(g.userData.mags||[]),...(g.userData.pump||[])]),ms=[];g.traverse(m=>{if(m.isMesh&&!m.userData.att&&!m.userData.weld&&!skip.has(m))ms.push(m)});const n=ms.length;if(n<2||n>160)return;
 const bs=ms.map(boxOf).filter(box=>[...box.min,...box.max].every(Number.isFinite));
 const count=bs.length;if(count<2)return;
 const par=[...Array(count).keys()],f=i=>par[i]==i?i:(par[i]=f(par[i])),eps=.004,gap=(a,b)=>{let d2=0;for(let k=0;k<3;k++){const d=Math.max(0,a.min[k]-b.max[k],b.min[k]-a.max[k]);d2+=d*d}return Math.sqrt(d2)};
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)if(gap(bs[i],bs[j])<=eps)par[f(i)]=f(j);
 for(let guard=0;guard<60;guard++){const cnt={};for(let i=0;i<count;i++)cnt[f(i)]=(cnt[f(i)]||0)+1;const roots=Object.keys(cnt);if(roots.length<2)break;const main=+roots.sort((a,b)=>cnt[b]-cnt[a])[0];
  let best=null;for(let i=0;i<count;i++){if(f(i)==main)continue;for(let j=0;j<count;j++){if(f(j)!=main)continue;const d=gap(bs[i],bs[j]);if(!best||d<best.d)best={d,i,j}}}if(!best)break;
  const a=bs[best.i],b=bs[best.j],p=[],q=[];for(let k=0;k<3;k++){const lo=Math.max(a.min[k],b.min[k]),hi=Math.min(a.max[k],b.max[k]);if(lo<=hi){p[k]=q[k]=(lo+hi)/2}else if(a.max[k]<b.min[k]){p[k]=a.max[k];q[k]=b.min[k]}else{p[k]=a.min[k];q[k]=b.max[k]}}
  const th=.018,s=new THREE.Mesh(bg,weldMat);s.userData.weld=1;s.scale.set(Math.abs(p[0]-q[0])+th,Math.abs(p[1]-q[1])+th,Math.abs(p[2]-q[2])+th);s.position.set((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2);g.add(s);par[f(best.i)]=f(best.j)}}
;

/* ===================== TUR-9 "Cyclone": full-auto assault rifle (uses the original turbine model) ===================== */
/* The original TRB-3 model, now the Cyclone: angular gunmetal body, long top rail with a flip-up ring sight and a swept fin at the front, vented handguard, a big round turbine housing with a brass core on both sides
   behind the receiver, a slab stock, an angled magazine on struts and a flash hider. Built along +z, muzzle at about z = .95. Fully automatic, fast and light. */
W.TUR={n:'TUR-9 Cyclone',d:22,r:.068,m:36,sp:.011,rc:.8,pel:1,au:1,rl:2.2,len:.75,col:0x6a6d6f};
PRI.splice(3,0,'TUR');WG.TUR=[.95,0x6a6d6f,1,0xffcc70];RLK.TUR='mag';BOTGUNS.push('TUR');
MODELS.TUR=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x6c6f70),dk=M(0x1d1f22),gr=M(0x3a3d41),steel=M(0x9aa0a6),brass=M(0xb08a3a),blk=M(0x111214),bolt=M(0xc9c4b0);
 /* receiver, handguard and top rail */
 k.box(.078,.1,.5,0,0,.1,body);k.box(.088,.082,.34,0,-.004,.52,body);k.box(.06,.02,.7,0,.06,.24,dk);for(let i=0;i<14;i++)k.box(.062,.007,.016,0,.073,-.08+i*.047,blk);
 /* slanted vents on both sides of the handguard */
 for(const sx of[-1,1])for(let i=0;i<3;i++)k.box(.006,.05,.018,sx*.045,.004,.42+i*.07,blk,0,0,.5);
 /* ejection port, charging slot, side plates */
 k.box(.006,.04,.12,.04,.02,.1,blk);k.box(.006,.03,.09,-.04,.02,.12,gr);k.box(.02,.02,.05,.0,.075,.02,gr);
 /* front fin: a swept blade standing on the rail at the muzzle end of the handguard */
 for(const sx of[-1,1])k.box(.008,.045,.15,sx*.05,.02,.6,body,-.35);k.box(.012,.02,.12,0,.065,.58,gr);
 /* barrel, sleeve and flash hider */
 k.cyl(.016,.24,0,.006,.84,steel);k.cyl(.024,.06,0,.006,.73,gr);k.cyl(.022,.075,0,.006,.955,dk);for(let i=0;i<3;i++)k.cyl(.0235,.006,0,.006,.925+i*.02,steel);
 /* flip-up ring sight at the back, post at the front */
 mkSights(g,'TUR',{yt:.112,yb:.074,yf:.061,zr:-.02,zf:.7});
 /* turbine housing: a big disc seen from either side, brass core, bolts */
 k.cylY(.07,.108,0,-.02,-.14,body,0,Math.PI/2);k.cylY(.04,.116,0,-.02,-.14,brass,0,Math.PI/2);
 for(const sx of[-1,1]){k.cylY(.05,.01,sx*.057,-.02,-.14,gr,0,Math.PI/2);k.cylY(.014,.012,sx*.062,-.02,-.14,steel,0,Math.PI/2);for(let i=0;i<6;i++){const a=i*Math.PI/3;k.cylY(.006,.008,sx*.06,-.02+Math.sin(a)*.059,-.14+Math.cos(a)*.059,bolt,0,Math.PI/2)}}
 /* slab stock with pad */
 k.box(.07,.13,.12,0,.0,-.29,dk);k.box(.076,.15,.03,0,-.005,-.365,blk);k.box(.05,.03,.1,0,.075,-.27,gr);
 /* pistol grip, trigger and guard */
 k.box(.046,.15,.062,0,-.13,.04,dk,.35);k.box(.05,.02,.07,0,-.205,.01,gr,.35);k.box(.01,.04,.012,0,-.07,.12,steel,.2);k.box(.012,.012,.1,0,-.095,.16,dk);k.box(.012,.04,.012,0,-.075,.21,dk);
 /* angled magazine on two struts */
 const mg=[k.box(.044,.21,.082,0,-.19,.3,gr,-.22),k.box(.05,.02,.09,0,-.295,.325,blk,-.22)];k.box(.012,.12,.014,.026,-.1,.22,steel,.5);k.box(.012,.12,.014,-.026,-.1,.22,steel,.5);
 g.userData.a={r:[0,-.13,.04],l:[0,-.05,.55],m:[0,-.19,.3]};g.userData.mags=mg;return g};

/* ===================== TRB-3 "Turbine": 3-round burst assault rifle ===================== */
/* Rebuilt from the reference image: a bullpup in brushed steel. Big rounded carry handle loop over the receiver with the aperture sight in its rear posts, a tall front post on the long barrel,
   a vented muzzle brake, a sawtooth-textured handguard panel on both sides, pistol grip with the magazine BEHIND it, and a slab butt pad. Built along +z, muzzle at about z = 1.0. 3 rounds per trigger pull. */
W.TRB={n:'TRB-3 Turbine',d:36,r:.055,m:36,sp:.004,rc:.95,pel:1,au:0,burst:3,bd:.14,rl:2.1,len:.75,col:0x9a9ea3};
PRI.splice(2,0,'TRB');WG.TRB=[1,0x9a9ea3,1,0xffcc70];RLK.TRB='mag';BOTGUNS.push('TRB');
MODELS.TRB=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x959a9f),dk=M(0x2a2c2f),blk=M(0x121315),gr=M(0x55595e),steel=M(0xb4b9be);
 /* main body: long slab, lower rear block, tapered nose */
 k.box(.084,.1,.62,0,-.012,0,body);k.box(.078,.082,.22,0,-.016,.39,body);k.box(.07,.06,.1,0,-.03,.53,body,.1);k.box(.088,.12,.1,0,-.02,-.3,dk);
 /* ejection housing, rear dark block and charging slot */
 k.box(.09,.07,.14,0,-.05,-.22,dk);k.box(.006,.045,.1,.043,.0,-.1,blk);k.box(.006,.03,.08,-.043,.0,-.1,gr);
 /* carry handle: a rounded loop. Top bar, two sloped corners at each end, a rear post pair holding the aperture and a front post */
 k.box(.05,.028,.5,0,.168,.0,body);k.box(.054,.012,.5,0,.186,.0,gr);
 k.box(.05,.03,.07,0,.15,.27,body,.7);k.box(.05,.03,.07,0,.15,-.27,body,-.7);
 for(const sx of[-1,1]){k.box(.01,.14,.04,sx*.036,.1,.33,body);k.box(.01,.1,.045,sx*.036,.11,.3,body)}k.box(.05,.016,.04,0,.172,.33,body);
 for(const sx of[-1,1]){k.box(.01,.13,.05,sx*.036,.1,-.305,body);k.box(.01,.06,.05,sx*.036,.13,-.28,gr)}
 /* aperture rear sight between the rear posts and a tall front post on the barrel */
 mkSights(g,'TRB',{yt:.098,yb:.052,yf:.046,zr:-.29,zf:.9});
 /* the loop's inner rail and a thin top rail strip */
 k.box(.034,.008,.44,0,.148,.0,blk);
 /* sawtooth textured panel on the lower handguard, both sides */
 for(const sx of[-1,1]){k.box(.008,.04,.3,sx*.043,-.035,.36,gr);for(let i=0;i<7;i++)k.box(.01,.034,.022,sx*.046,-.026,.22+i*.04,blk,0,0,sx*.55)}
 /* rails on the handguard sides */
 k.box(.09,.012,.22,0,.036,.4,gr);for(let i=0;i<5;i++)k.box(.092,.006,.014,0,.045,.3+i*.045,blk);
 /* barrel, gas block, sleeve and a vented muzzle brake */
 k.cyl(.014,.45,0,.028,.78,steel);k.box(.03,.03,.05,0,.026,.55,dk);k.cyl(.022,.06,0,.028,.6,dk);
 k.cyl(.02,.1,0,.028,.955,dk);for(let i=0;i<4;i++)k.cyl(.0215,.006,0,.028,.92+i*.022,steel);for(let i=0;i<3;i++)k.box(.044,.006,.016,0,.028,.93+i*.025,blk);
 /* pistol grip with trigger and guard, magazine behind the grip (bullpup) */
 k.box(.048,.15,.064,0,-.135,.12,dk,.3);k.box(.052,.02,.07,0,-.21,.095,gr,.3);k.box(.01,.045,.012,0,-.075,.19,steel,.15);k.box(.012,.012,.1,0,-.1,.235,dk);k.box(.012,.045,.012,0,-.078,.285,dk);
 const mg=[k.box(.046,.2,.082,0,-.18,-.1,gr,.08),k.box(.052,.02,.09,0,-.285,-.108,blk,.08)];k.box(.05,.04,.1,0,-.08,-.1,dk);
 /* butt pad and cheek riser */
 k.box(.078,.14,.03,0,-.016,-.375,blk);k.box(.05,.03,.12,0,.065,-.26,dk);
 g.userData.a={r:[0,-.135,.12],l:[0,-.03,.42],m:[0,-.18,-.1]};g.userData.mags=mg;return g};
var BST={n:0};

/* Custom hard-surface parts. Station profiles follow the weapon's +Z axis. */
function weaponLoft(stations){
 const contours=stations.map(([z,width,bottom,top,cut=.008])=>{
  const x=width*.5,b=Math.min(cut,x*.8,(top-bottom)*.42);
  return [[-x+b,bottom,z],[x-b,bottom,z],[x,bottom+b,z],[x,top-b,z],
   [x-b,top,z],[-x+b,top,z],[-x,top-b,z],[-x,bottom+b,z]];
 });
 const pos=[],uv=[],idx=[];
 function face(points,coords){
  const start=pos.length/3;
  for(const point of points)pos.push(...point);
  for(const coordinate of coords)uv.push(...coordinate);
  for(let i=1;i<points.length-1;i++)idx.push(start,start+i,start+i+1);
 }
 for(let i=0;i<contours.length-1;i++){
  const a=contours[i],b=contours[i+1];
  for(let j=0;j<8;j++){
   const next=(j+1)%8,u=j/8,v=(j+1)/8;
   face([a[j],a[next],b[next],b[j]],[[a[j][2],u],[a[j][2],v],[b[j][2],v],[b[j][2],u]]);
  }
 }
 for(const contour of [contours[0].slice().reverse(),contours.at(-1)])face(contour,contour.map(([x,y])=>[x,y]));
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setIndex(idx);geometry.computeVertexNormals();
 return geometry;
}
MODELS.AR=function(g,finish){
 const k=gunKit(g,finish),M=k.M;
 const receiver=finish||M(0x434b50),polymer=M(0x22282b),rubber=M(0x151a1a);
 const steel=M(0x59636a),black=M(0x2d3438),bronze=M(0x73583e),copper=M(0x914f2d);
 const shell=(material,stations,x=0,y=0,z=0)=>{
  const m=new THREE.Mesh(weaponLoft(stations),material);
  m.position.set(x,y,z);g.add(m);return m;
 };
 shell(receiver,[[-.095,.053,-.044,.056,.009],[-.065,.071,-.056,.065,.012],[.162,.073,-.060,.063,.014],[.295,.069,-.069,.058,.010],[.334,.065,-.057,.046,.010]]);
 shell(black,[[-.076,.049,.042,.063,.008],[-.011,.065,.045,.084,.008],[.146,.068,.050,.081,.009],[.246,.060,.049,.077,.007],[.292,.052,.045,.068,.007]]);
 shell(black,[[-.093,.053,-.048,.056,.009],[-.074,.061,-.058,.055,.010],[-.054,.061,-.058,.053,.010]]);
 shell(polymer,[[.228,.065,-.037,.041,.009],[.282,.086,-.048,.052,.015],[.495,.087,-.052,.054,.017],[.661,.076,-.047,.054,.015],[.690,.061,-.039,.036,.009]]);
 shell(receiver,[[.288,.063,-.052,-.014,.008],[.320,.081,-.082,-.028,.013],[.577,.080,-.079,-.025,.014],[.665,.067,-.063,-.021,.010]]);
 shell(black,[[.258,.048,.042,.061,.007],[.292,.051,.049,.069,.008],[.693,.049,.042,.064,.007],[.715,.036,.037,.054,.006]]);
 for(let i=0;i<11;i++)k.box(.048,.007,.016,0,.070,.305+i*.034,i%3===0?steel:black);
 for(const side of [-1,1]){
  for(let i=0;i<7;i++){
   const z=.334+i*.046;
   k.box(.005,.009,.028,side*.043,.024,z,rubber,-.23);
   k.box(.004,.005,.020,side*.042,-.034,z+.014,steel,.18);
  }
  for(const z of [-.043,.081,.244,.284]){
   k.cylY(.0042,.0025,side*.037,-.027,z,z===.081?bronze:steel,0,Math.PI/2);
   k.box(.001,.0011,.006,side*.039,-.027,z,rubber);
  }
  k.box(.005,.009,.085,side*.034,.043,-.008,black);
 }
 shell(rubber,[[.055,.033,.013,.039,.005],[.070,.045,.010,.044,.006],[.199,.045,.010,.044,.006],[.215,.037,.013,.039,.006]],-.017);
 k.box(.007,.022,.123,.034,.028,.128,steel);
 k.box(.024,.012,.060,.043,.041,.146,black);
 k.box(.022,.013,.037,.057,.041,.133,steel);
 for(let i=0;i<4;i++)k.box(.004,.004,.009,.068,.041,.118+i*.009,rubber);
 k.cyl(.012,.27,0,.001,.840,black,.012,20);
 k.cyl(.018,.122,0,.036,.748,black,.014,18);
 k.cyl(.019,.054,0,.001,.743,steel,.018,18);
 shell(black,[[.941,.040,-.021,.021,.006],[.967,.051,-.027,.027,.008],[1.064,.052,-.026,.025,.009],[1.089,.043,-.022,.022,.006]]);
 k.cyl(.016,.013,0,0,1.088,steel,.016,20);
 k.cyl(.011,.002,0,0,1.096,rubber,.011,18);
 for(const side of [-1,1])for(let i=0;i<2;i++)k.box(.003,.009,.023,side*.026,.007,.992+i*.038,rubber);

 shell(polymer,[[-.490,.045,-.089,.022,.007],[-.458,.051,-.090,.029,.010],[-.376,.055,-.060,.040,.011],[-.195,.056,-.029,.046,.010],[-.124,.047,-.036,.043,.008],[-.079,.050,-.044,.049,.008]]);
 shell(rubber,[[-.506,.046,-.088,.017,.009],[-.498,.055,-.095,.026,.010],[-.471,.054,-.092,.028,.010]]);
 for(let i=0;i<8;i++)k.box(.056,.003,.010,0,-.081+i*.013,-.498,black,.10);
 shell(black,[[-.444,.027,-.051,.010,.006],[-.425,.033,-.049,.015,.006],[-.237,.037,-.035,.015,.007]],0,.042);
 shell(polymer,[[-.080,.029,-.135,-.048,.005],[-.041,.039,-.173,-.054,.007],[.030,.044,-.153,-.045,.011],[.055,.039,-.084,-.042,.006]]);
 for(const side of [-1,1])for(let i=0;i<7;i++)k.box(.003,.004,.026,side*.021,-.089-i*.009,.002-i*.006,rubber,0,side*.22,.18);
 k.box(.012,.009,.090,0,-.103,.092,black);
 k.box(.012,.038,.009,0,-.087,.137,black,-.12);
 k.box(.005,.027,.012,0,-.077,.090,steel,-.26);

 const mags=[
  shell(finish||copper,[[.079,.036,-.245,-.208,.006],[.103,.045,-.265,-.151,.008],[.143,.045,-.253,-.056,.008],[.210,.044,-.213,-.046,.008],[.244,.039,-.153,-.048,.006],[.251,.032,-.09,-.052,.005]]),
  shell(black,[[.081,.037,-.249,-.232,.006],[.096,.044,-.268,-.242,.006],[.112,.046,-.267,-.241,.006],[.141,.043,-.252,-.230,.006]])
 ];
 for(const side of [-1,1])for(let i=0;i<3;i++){
  mags.push(k.box(.002,.011,.074,side*.023,-.105-i*.034,.185-i*.019,bronze,-.47));
 }
 const mag=new THREE.Group();
 mag.position.set(0,-.153,.177);
 g.add(mag);g.updateMatrixWorld(true);
 for(const panel of mags)mag.attach(panel);
 mkSights(g,'AR',{yt:.117,yb:.081,yf:.064,zr:.106,zf:.750});
 g.userData.a={r:[0,-.112,.003],l:[0,-.068,.514],m:[0,-.152,.180],pd:[0,-.22,-.055],ho:[0,-.04,-.01]};
 g.userData.mags=[mag];
 g.userData.muzzle={x:0,y:0,z:1.099};
 g.userData.viewOffset=-.032;
 return g;
};

const weaponDecals=new Map();
function weaponDecal(label){
 if(weaponDecals.has(label))return weaponDecals.get(label);
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=64;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#eee5d8';ctx.font='bold 29px monospace';ctx.fillText(label,4,31);
 ctx.fillStyle='#dbab72';
 ctx.fillRect(5,42,25,5);ctx.fillRect(33,42,6,5);
 ctx.fillStyle='#d5d2c7';ctx.font='13px monospace';ctx.fillText('SPARTAN  /  ARMORY',45,49);
 const map=new THREE.CanvasTexture(canvas);map.encoding=THREE.sRGBEncoding;map.anisotropy=2;
 const mat=new THREE.MeshBasicMaterial({map,alphaTest:.4,toneMapped:false});
 weaponDecals.set(label,mat);return mat;
}
const armorTextures=new Map();
function armoryTexture(surface){
 if(armorTextures.has(surface))return armorTextures.get(surface);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),image=ctx.createImageData(128,128);
 let seed=3128;
 const random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
 for(let y=0;y<128;y++){
  const grain=random(),ridge=Math.sin(y*.61+Math.sin(y*.14)*2);
  for(let x=0;x<128;x++){
   const noise=random();
   const shade=surface==='wood'?176+28*ridge+22*grain+noise*23:
    surface==='steel'?185+31*grain+noise*32:203+noise*36+((x+y)%3?0:-13);
   image.data.set([shade,shade,shade,255],(y*128+x)*4);
  }
 }
 ctx.putImageData(image,0,0);
 if(surface==='steel')for(let i=0;i<26;i++){
  ctx.fillStyle=i%2?'#fff4':'#1112';ctx.fillRect(random()*128,random()*128,5+random()*32,1);
 }
 const tex=new THREE.CanvasTexture(canvas);
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(surface==='wood'?3:5,1);
 tex.anisotropy=2;
 armorTextures.set(surface,tex);return tex;
}
function weaponKit(g,finish,paint,alloy=0x69737a){
 const k=gunKit(g),M=(color,roughness,metalness,surface)=>{
  const mat=new THREE.MeshLambertMaterial({color,map:surface?armoryTexture(surface):null});
  if(mat.isMeshStandardMaterial){mat.roughness=roughness;mat.metalness=metalness;mat.envMapIntensity=.52}
  return mat;
 };
 const body=finish||M(paint,.55,.23,'coating'),frame=M(0x343a40,.5,.51,'steel'),steel=M(alloy,.39,.56,'steel');
 const rubber=M(0x202226,.88,.02,'coating'),recess=M(0x11161d,.86,.19),trim=M(0xb99864,.46,.55,'steel');
 const mount=(geometry,material,x=0,y=0,z=0)=>{
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);g.add(mesh);return mesh;
 };
 const solid=(material,...stations)=>mount(weaponLoft(stations),material);
 const tube=(material,x,y,sections,sides=16)=>{
  const geometry=new THREE.LatheGeometry(sections.map(([z,r])=>new THREE.Vector2(r,z)),sides);
  geometry.rotateX(Math.PI/2);
  return mount(geometry,material,x,y);
 };
 const bore=(y,tip,outer,inner,material=frame,length=.065,sides=16)=>{
  const rear=tip-length;
  const shell=tube(material,0,y,[[rear,outer*.79],[rear+.012,outer],[tip-.006,outer],[tip,outer*.85],[tip,inner],
   [tip-.008,inner*.9],[rear,inner*.87]],sides);
  tube(recess,0,y,[[rear+.001,inner*.94],[rear+.001,0]],sides);
  return shell;
 };
 const web=(material,x,width,outline,cutouts=[],bevel=.003)=>{
  const trace=(path,points)=>{
   path.moveTo(...points[0]);
   for(const point of points.slice(1))path.lineTo(...point);
   path.closePath();return path;
  };
  const shape=trace(new THREE.Shape(),outline);
  shape.holes=cutouts.map(points=>trace(new THREE.Path(),points));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:3});
  geo.translate(0,0,-width/2);geo.rotateY(-Math.PI/2);
  return mount(geo,material,x);
 };
 const pin=(x,y,z,r=.005,material=steel)=>k.cylY(r,.004,x,y,z,material,0,Math.PI*.5,r*.89);
 const rod=(material,r,a,b)=>{
  const start=V(...a),end=V(...b),vector=end.clone().sub(start),mesh=mount(new THREE.CylinderGeometry(r,r,vector.length(),10),material);
  mesh.position.copy(start).lerp(end,.5);
  mesh.quaternion.setFromUnitVectors(V(0,1,0),vector.normalize());return mesh;
 };
 const rail=(z0,z1,y,width=.039)=>{
  solid(frame,[z0,width,y-.006,y+.008],[z0+.012,width,y-.009,y+.01],[z1-.012,width,y-.009,y+.01],[z1,width*.8,y-.006,y+.004]);
  for(let z=z0+.022;z<z1-.012;z+=.026)solid(steel,[z-.007,width*.96,y+.006,y+.011,.003],[z+.007,width*.96,y+.006,y+.011,.003]);
 };
 const grip=(z,material=rubber)=>{
  // Cross-sections through the grip, swept back at the heel.
  const geo=weaponLoft([[.033,.041,-.033,.029,.012],[.016,.039,-.033,.028,.012],[-.027,.038,-.026,.036,.012],[-.102,.038,-.011,.051,.013],[-.122,.039,-.006,.06,.013]].reverse());
  geo.rotateX(-Math.PI/2);geo.translate(0,-.058,z);
  const handle=mount(geo,material);
  for(let i=0;i<5;i++){
   const y=-.087-i*.015;
   k.box(.028,.003,.008,0,y,z+.041-i*.002,frame,-.22);
  }
  return handle;
 };
 const guard=(z,y=-.053,length=.124)=>{
  web(frame,0,.016,[[z-.021,y],[z+length,y],[z+length-.005,y-.06],[z+length-.025,y-.079],[z+.005,y-.079],[z-.021,y-.051]],
   [[[z+.006,y-.014],[z+length-.019,y-.014],[z+length-.023,y-.053],[z+length-.036,y-.064],[z+.016,y-.064],[z+.005,y-.045]]],.0025);
  web(steel,0,.009,[[z+.037,y+.003],[z+.052,y+.002],[z+.067,y-.03],[z+.059,y-.043],[z+.05,y-.037],[z+.053,y-.029]],[],.0015);
 };
 const mark=(label,side,y,z,width=.083,height=.026)=>{
  const mesh=mount(new THREE.PlaneGeometry(width,height),weaponDecal(label),side,y,z);
  mesh.rotation.y=Math.sign(side)*Math.PI*.5;
 };
 const moving=(parts,center,name)=>{
  const part=new THREE.Group();part.name=name;part.position.set(...center);g.add(part);
  for(const mesh of parts){mesh.position.sub(part.position);part.add(mesh)}
  return [part];
 };
 g.userData.authored=true;
 return {...k,body,frame,steel,rubber,recess,trim,M,solid,tube,bore,web,pin,rod,rail,grip,guard,mark,moving};
}

MODELS.VA=function(g,finish){
 const k=weaponKit(g,finish,0xa18d6d),{body,frame,steel,rubber,trim,solid,tube,web,pin,rod,rail,grip,guard,mark,moving}=k;
 // A slim action and a separate floating fore-end leave the fluted barrel visible.
 solid(frame,[-.152,.066,-.055,.048],[-.096,.077,-.067,.063],[.11,.083,-.055,.065],[.33,.079,-.073,.061],[.395,.065,-.066,.036]);
 solid(body,[-.129,.074,.012,.051],[-.077,.089,-.013,.071],[.067,.09,-.02,.071],[.101,.091,-.015,.067],[.102,.062,.018,.064],
  [.245,.062,.019,.065],[.246,.087,-.025,.071],[.347,.082,-.023,.063],[.393,.066,-.018,.034]);
 solid(steel,[.102,.079,.006,.039],[.122,.082,-.009,.046],[.218,.082,-.009,.046],[.238,.07,.006,.039]);
 solid(frame,[.316,.057,-.061,-.028],[.41,.067,-.065,-.031],[.65,.055,-.049,-.022],[.727,.044,-.034,-.01]);
 const slots=Array.from({length:4},(_,i)=>{
  const z=.417+i*.065;return [[z,-.024],[z+.043,-.013],[z+.047,.01],[z+.01,.002]];
 });
 for(const side of [-1,1]){
  const x=side*.035;
  web(body,x,.012,[[.324,.049],[.642,.049],[.735,.006],[.687,-.048],[.343,-.053]],slots);
  pin(side*.046,-.034,.376);pin(side*.045,-.031,.668);
 }
 rail(-.1,.644,.072);
 tube(steel,0,.026,[[.236,.025],[.383,.022],[.714,.014],[.887,.014]],18);
 k.bore(.026,.94,.024,.011,frame,.08,12);
 // Adjustable stock with a diagonal brace and a textured shoulder pad.
 solid(frame,[-.43,.055,-.031,.056],[-.4,.064,-.026,.068],[-.28,.061,.008,.074],[-.137,.058,-.018,.051]);
 web(body,0,.044,[[-.438,-.094],[-.428,.02],[-.174,.045],[-.126,-.006],[-.294,-.033],[-.393,-.101]],
  [[[-.398,-.066],[-.386,-.015],[-.222,.024],[-.211,.003],[-.335,-.026]]],.005);
 solid(rubber,[-.477,.053,-.097,.038],[-.467,.071,-.109,.053],[-.429,.068,-.098,.051],[-.416,.059,-.085,.039]);
 rod(trim,.008,[-.026,-.02,-.344],[-.026,.035,-.205]);
 grip(.007);guard(.007);
 const mag=solid(frame,[.145,.053,-.273,-.215],[.176,.056,-.284,-.133],[.217,.06,-.271,-.071],[.269,.058,-.189,-.043],[.296,.048,-.092,-.048]);
 const cap=solid(rubber,[.148,.057,-.28,-.257],[.175,.061,-.291,-.269],[.228,.061,-.282,-.259],[.233,.046,-.276,-.264]);
 const ribs=[];
 for(const side of [-1,1])for(const z of [.181,.203,.23,.25])ribs.push(web(steel,side*.029,.003,[[z,-.25],[z+.007,-.242],[z+.045,-.097],[z+.036,-.098]],[],.001));
 g.userData.mags=moving([mag,cap,...ribs],[0,-.173,.222],'Curved magazine');
 mark('VANGUARD',-.046,.028,-.008,.13,.031);
 mkSights(g,'VA',{yt:.137,yb:.082,yf:.081,zr:-.052,zf:.635});
 g.userData.a={r:[0,-.113,.001],l:[0,-.058,.539],m:[0,-.173,.222]};
 g.userData.muzzle={y:.026,z:.94};return g;
};

MODELS.BP=function(g,finish){
 const k=weaponKit(g,finish,0x516c7b,0x828884),{body,frame,steel,rubber,solid,tube,web,pin,rod,grip,guard,mark,moving}=k;
 const wood=k.M(0x986951,.66,.04,'wood'),edge=k.M(0x4e352e,.73,.07);
 solid(frame,[-.145,.05,-.046,.038],[-.107,.075,-.067,.055],[.042,.08,-.069,.071],[.23,.075,-.051,.063],[.262,.06,-.045,.039]);
 solid(body,[-.132,.074,-.034,.035],[-.085,.09,-.06,.066],[.007,.094,-.06,.076],[.008,.069,-.031,.071],
  [.148,.069,-.026,.068],[.15,.088,-.053,.064],[.22,.075,-.047,.055],[.247,.064,-.033,.034]);
 solid(steel,[.016,.069,.012,.041],[.026,.077,.005,.05],[.154,.078,.005,.05],[.189,.067,.014,.043]);
 web(frame,0,.06,[[-.455,-.129],[-.438,-.025],[-.161,.03],[-.11,.002],[-.134,-.049],[-.332,-.104]],
  [[[-.4,-.092],[-.385,-.052],[-.184,-.004],[-.167,-.017],[-.334,-.073]]]);
 solid(body,[-.419,.051,-.047,.004],[-.39,.059,-.049,.018],[-.272,.053,-.02,.038],[-.234,.038,-.021,.029]);
 solid(rubber,[-.477,.055,-.125,-.026],[-.465,.071,-.138,-.018],[-.44,.07,-.127,-.018],[-.427,.059,-.112,-.031]);
 grip(-.067);guard(-.067,-.056,.125);
 tube(frame,0,.038,[[.133,.026],[.258,.025],[.302,.023],[.746,.02],[.808,.022]],20);
 tube(steel,0,-.023,[[.16,.019],[.691,.018],[.707,.024],[.738,.024],[.748,.02],[.75,0]],16);
 web(frame,0,.017,[[.224,.053],[.77,.049],[.802,.058],[.799,.07],[.235,.076]],
  Array.from({length:7},(_,i)=>{
   const z=.264+i*.075;return [[z,.055],[z+.048,.053],[z+.052,.065],[z+.006,.067]];
  }),.0017);
 k.bore(.038,.824,.025,.016,frame,.075,18);
 const slide=solid(wood,[.258,.062,-.056,-.004,.014],[.285,.084,-.074,.006,.018],[.48,.086,-.074,.006,.02],[.537,.078,-.064,.001,.016],[.56,.062,-.053,-.009,.013]);
 const strips=[];
 for(let i=0;i<7;i++){
  const z=.297+i*.032;
  strips.push(solid(edge,[z,.085,-.075,-.037,.015],[z+.006,.085,-.075,-.038,.015]));
 }
 for(const side of [-1,1])strips.push(rod(frame,.0045,[side*.031,-.018,.178],[side*.034,-.019,.462]));
 g.userData.pump=moving([slide,...strips],[0,-.034,.415],'Pump and action bars');
 for(const side of [-1,1])for(const z of [-.089,.202])pin(side*.045,-.025,z);
 mark('BREAKWATER',-.046,-.008,.046,.104,.027);
 mkSights(g,'BP',{yt:.101,yb:.074,yf:.07,zr:.082,zf:.775});
 g.userData.a={r:[0,-.112,-.067],l:[0,-.074,.407],m:[0,-.051,.151]};
 g.userData.muzzle={y:.038,z:.824};return g;
};

MODELS.KTS=function(g,finish){
 const k=weaponKit(g,finish,0x69715e,0x858a77),{body,frame,steel,rubber,trim,solid,tube,web,pin,rail,grip,guard,mark}=k;
 solid(frame,[-.155,.047,-.058,.034],[-.106,.071,-.075,.062],[.1,.074,-.072,.072],[.258,.067,-.055,.063],[.318,.064,-.038,.041]);
 const port=[[[.042,.003],[.153,.004],[.194,.021],[.169,.042],[.067,.044]]];
 web(body,.036,.013,[[-.134,.029],[-.067,.067],[.19,.073],[.284,.034],[.261,-.064],[-.083,-.069]],port);
 web(body,-.036,.011,[[-.134,.035],[-.095,.041],[.182,.059],[.285,.032],[.261,-.054],[-.082,-.066]]);
 tube(steel,0,.033,[[.015,.023],[.285,.022],[.332,.021],[.706,.021],[.746,.024]],16);
 k.bore(.038,.766,.031,.018,frame,.07,10);
 tube(frame,0,-.033,[[.203,.019],[.596,.019],[.627,.022],[.69,.025],[.707,.022],[.708,0]],14);
 const drilling=Array.from({length:5},(_,i)=>{
  const z=.324+i*.053;return [[z,-.037],[z+.036,-.034],[z+.047,-.016],[z+.01,-.018]];
 });
 for(const side of [-1,1]){
  web(body,side*.032,.013,[[.231,-.012],[.527,.008],[.657,-.02],[.597,-.071],[.265,-.085]],drilling);
  pin(side*.045,-.053,.278);pin(side*.045,-.041,.567);
 }
 solid(rubber,[.26,.059,-.082,-.053],[.334,.074,-.09,-.054],[.547,.062,-.078,-.042],[.61,.042,-.064,-.04]);
 rail(-.085,.286,.071);
 web(frame,0,.041,[[-.435,-.116],[-.405,.017],[-.127,.041],[-.09,.006],[-.165,-.025],[-.369,-.117]],
  [[[-.39,-.08],[-.373,-.021],[-.162,.018],[-.193,-.004]]]);
 solid(body,[-.395,.056,-.021,.037],[-.374,.062,-.02,.046],[-.241,.058,-.012,.053],[-.216,.047,-.01,.047]);
 solid(rubber,[-.454,.047,-.111,.012],[-.447,.068,-.124,.027],[-.421,.071,-.122,.022],[-.408,.053,-.108,.006]);
 grip(-.047);guard(-.047,-.055,.132);pin(.045,-.029,-.085,.009,trim);
 mark('KESTREL',-.044,-.006,.115,.125,.031);
 mkSights(g,'KTS',{yt:.114,yb:.082,yf:.055,zr:-.054,zf:.699});
 g.userData.a={r:[0,-.113,-.047],l:[0,-.087,.43],m:[0,-.066,.131]};
 g.userData.muzzle={y:.038,z:.766};return g;
};

MODELS.RD=function(g,finish){
 const k=weaponKit(g,finish,0x76524a,0x7b7870),{body,frame,steel,recess,trim,solid,tube,web,pin,rail,grip,guard,mark,moving}=k;
 solid(frame,[-.168,.05,-.055,.038],[-.12,.072,-.066,.064],[.02,.082,-.07,.064],[.214,.077,-.066,.058],[.314,.062,-.035,.047],[.36,.053,-.029,.021]);
 solid(body,[-.167,.062,-.044,.036],[-.132,.08,-.051,.066],[.042,.085,-.054,.072],[.043,.061,-.022,.065],
  [.181,.061,-.019,.062],[.183,.08,-.05,.063],[.291,.075,-.034,.061],[.341,.063,-.029,.036]);
 solid(steel,[.048,.077,-.003,.037],[.073,.082,-.012,.046],[.175,.081,-.011,.045],[.195,.067,.007,.034]);
 web(frame,0,.051,[[-.389,-.107],[-.368,.013],[-.158,.034],[-.125,-.01],[-.218,-.039],[-.334,-.106]],
  [[[-.344,-.072],[-.33,-.027],[-.19,.009],[-.181,-.005],[-.269,-.032]]]);
 solid(body,[-.396,.064,-.109,-.012],[-.383,.073,-.117,.016],[-.36,.071,-.113,.022],[-.346,.061,-.098,.007]);
 grip(-.055,body);guard(-.055,-.053,.127);rail(-.112,.31,.072,.033);
 tube(steel,0,.027,[[.233,.026],[.341,.025],[.372,.018],[.51,.015],[.566,.018]],18);
 k.bore(.027,.628,.027,.014,frame,.095,12);
 solid(body,[.272,.052,-.09,-.034],[.32,.068,-.113,-.043],[.37,.074,-.118,-.045],[.478,.063,-.087,-.025],[.508,.048,-.067,-.016]);
 for(const side of [-1,1])for(const z of [.337,.395,.452])pin(side*.035,-.065,z,.005,trim);
 const drum=tube(frame,0,-.156,[[.16,0],[.16,.074],[.17,.091],[.192,.1],[.252,.1],[.267,.091],[.272,.076],[.272,0]],24);
 const cap=tube(trim,0,-.156,[[.25,.095],[.261,.097],[.27,.085],[.276,.081],[.276,.067],[.272,.066]],24);
 const inner=tube(steel,0,-.156,[[.271,0],[.271,.062],[.279,.055],[.282,.027],[.29,.022],[.29,0]],16);
 const collar=solid(recess,[.156,.056,-.106,-.083],[.166,.069,-.105,-.044],[.26,.07,-.107,-.044],[.283,.059,-.095,-.046]);
 const fasteners=[];
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,x=Math.sin(a)*.071,y=-.156+Math.cos(a)*.071;
  fasteners.push(k.box(.006,.019,.006,x,y,.277,frame,0,0,-a));
 }
 g.userData.mags=moving([drum,cap,inner,collar,...fasteners],[0,-.156,.219],'Ringed drum');
 mark('RIPTIDE',-.043,.016,-.027,.10,.027);pin(.046,-.027,.009,.007,trim);
 mkSights(g,'RD',{yt:.112,yb:.082,yf:.052,zr:-.07,zf:.442});
 g.userData.a={r:[0,-.11,-.055],l:[0,-.101,.429],m:[0,-.156,.219]};
 g.userData.muzzle={y:.027,z:.628};return g;
};

WG.AN=[.42,0x3f4a54,0,0x20262c];
GS.AN={n:[[.19,'lowpass',690,.54],[.14,'bandpass',2070,.48,0,.66,1.2],[.065,'highpass',4700,.18,.018]]};
RLK.AN='break';
WG.ULT=[1.05,0x47505d,1,0xffad56];
GS.ULT={n:[[.11,'lowpass',620,.31,0,1.3],[.075,'bandpass',2620,.25,0,.86,1.2],[.045,'highpass',4700,.18,.016]]};
MODELS.ULT=function(g,finish){
 const k=gunKit(g,finish),body=finish||k.M(0x343d49),black=k.M(0x161921),steel=k.M(0x78828d);
 const brass=k.M(0xd98e36),light=k.E(0xffa13e),cold=k.E(0x84def4);
 const box=(parent,material,w,h,d,x,y,z)=>{
  const part=new THREE.Mesh(bg,material);part.scale.set(w,h,d);part.position.set(x,y,z);parent.add(part);return part;
 };
 const cylinder=(parent,r,d,x,y,z,material)=>{
  const part=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d,18),material);
  part.rotation.x=Math.PI/2;part.position.set(x,y,z);parent.add(part);return part;
 };
 box(g,black,.202,.195,.45,0,.023,.032);
 box(g,body,.235,.136,.24,0,.048,.071);
 box(g,brass,.217,.036,.21,0,.106,.057);
 box(g,steel,.142,.044,.24,0,.092,-.115);
 box(g,black,.05,.125,.066,0,-.075,-.12).rotation.x=-.20;
 box(g,black,.139,.032,.105,-.012,-.086,.367);
 box(g,steel,.06,.046,.086,0,-.089,.32);
 const drum=box(g,body,.242,.135,.253,0,-.124,-.015);
 const feed=box(g,black,.234,.028,.237,0,-.061,.001);
 for(let i=0;i<5;i++)box(g,brass,.022,.022,.037,.121,-.044,-.088+i*.04);
 for(const side of [-1,1]){
  box(g,body,.047,.101,.28,side*.109,.022,.179);
  box(g,light,.012,.019,.153,side*.135,.052,.171);
  box(g,steel,.032,.031,.167,side*.108,.089,.285);
 }
 const rotor=new THREE.Group();rotor.position.y=.036;g.add(rotor);
 cylinder(rotor,.097,.145,0,0,.232,black);
 cylinder(rotor,.094,.059,0,0,.615,steel);
 cylinder(rotor,.099,.025,0,0,.689,black);
 cylinder(rotor,.026,.55,0,0,.511,brass);
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3,x=.064*Math.cos(a),y=.064*Math.sin(a);
  cylinder(rotor,.022,.52,x,y,.509,steel);
  cylinder(rotor,.026,.087,x,y,.736,black);
  cylinder(rotor,.011,.003,x,y,.781,cold);
 }
 mkSights(g,'ULT',{yt:.133,yb:.108,yf:.113,zr:-.1,zf:.211});
 g.userData.a={r:[0,-.067,-.12],l:[0,-.086,.36],m:[0,-.124,-.015]};
 g.userData.mags=[drum,feed];g.userData.rotors=[rotor];g.userData.muzzle={x:0,y:.037,z:.79};
 return g;
};

MODELS.AN=function(g,finish){
 buildAnnihilatorModel(THREE,g,finish);
 return g;
};

MODELS.HC=function(g,finish){
 const k=weaponKit(g,finish,0x89949c,0x9ba3a5),{body,frame,steel,rubber,recess,trim,solid,tube,web,pin,guard,mark,moving}=k;
 // The scalloped slide surrounds a real shoulder at the front of the barrel.
 solid(steel,[-.091,.044,.004,.064],[-.071,.054,.001,.079],[.203,.053,.008,.077],[.335,.047,.006,.066],[.396,.039,.016,.055]);
 solid(body,[-.082,.044,.026,.067],[-.06,.063,.015,.084],[.043,.068,.012,.086],[.05,.058,.018,.081],[.169,.058,.018,.081],
  [.173,.064,.013,.086],[.275,.063,.017,.082],[.34,.06,.023,.072],[.395,.046,.024,.059],[.406,.037,.029,.052]);
 solid(frame,[-.127,.026,-.019,.015,.008],[-.099,.043,-.038,.019],[-.035,.056,-.068,.02],
  [.105,.053,-.051,.013],[.293,.051,-.032,.015],[.355,.038,-.021,.01],[.368,.033,-.01,.01]);
 tube(steel,0,.044,[[.06,.018],[.376,.018],[.4,.023],[.414,.021]],16);
 k.bore(.044,.421,.026,.014,steel,.042,14);
 for(const side of [-1,1]){
  const x=side*.033;
  for(let i=0;i<6;i++){
   const z=-.056+i*.016;
   web(recess,x,.0015,[[z,.03],[z+.006,.03],[z+.017,.073],[z+.011,.075]],[],.0008);
  }
  web(frame,side*.028,.003,[[.235,.037],[.342,.036],[.374,.055],[.259,.06]],
   [[[.255,.04],[.276,.04],[.292,.052],[.27,.053]],[[.299,.04],[.322,.04],[.339,.051],[.315,.053]]],.001);
  web(rubber,side*.024,.007,[[-.112,-.041],[-.029,-.046],[.003,-.072],[-.032,-.161],[-.108,-.183],[-.135,-.152]],[],.004);
  pin(side*.034,-.072,-.067,.007,trim);pin(side*.034,-.143,-.095,.006,trim);
  for(let i=0;i<4;i++)web(steel,side*.032,.001,[[-.113,-.123+i*.016],[-.053,-.113+i*.016],[-.056,-.116+i*.016],[-.113,-.127+i*.016]],[],.001);
 }
 web(frame,0,.017,[[-.142,-.146],[-.113,-.038],[-.02,-.042],[.014,-.064],[-.031,-.167],[-.115,-.184]],[],.007);
 guard(-.023,-.038,.132);
 const mag=solid(steel,[-.128,.033,-.179,-.147],[-.11,.043,-.184,-.092],[-.052,.043,-.175,-.057],[-.027,.04,-.106,-.044]);
 const foot=solid(rubber,[-.133,.04,-.186,-.169],[-.123,.052,-.193,-.17],[-.039,.049,-.176,-.161],[-.027,.033,-.167,-.153]);
 g.userData.mags=moving([mag,foot],[0,-.144,-.065],'Heel release magazine');
 mark('MONARCH',-.034,.049,.226,.102,.026);
 mkSights(g,'HC',{yt:.107,yb:.086,yf:.079,zr:-.034,zf:.278});
 g.userData.a={r:[0,-.096,-.067],l:[0,-.138,-.028],m:[0,-.144,-.065]};
 g.userData.muzzle={y:.044,z:.421};return g;
};

MODELS.OH=function(g,finish){
 const k=weaponKit(g,finish,0x94674b,0x81908d),{frame,steel,rubber,trim,solid,tube,web,pin,rod,mark,moving}=k;
 const body=finish||k.M(0x986949,.68,.05,'wood');
 // Raised cheek comb and sculpted wrist form one continuous stock.
 solid(body,[-.48,.055,-.129,.004,.013],[-.43,.067,-.132,.016,.017],[-.326,.066,-.103,.037,.017],[-.278,.068,-.082,.041,.021],
  [-.181,.061,-.062,.032,.018],[-.086,.045,-.086,.022,.017],[-.024,.049,-.102,.016,.018],
  [.08,.061,-.084,.014,.022],[.168,.068,-.063,.011,.024],[.385,.063,-.068,.012,.022],[.533,.057,-.06,.015,.02],
  [.62,.044,-.048,.008,.016],[.657,.033,-.035,.002,.013]);
 solid(rubber,[-.488,.059,-.129,.004],[-.479,.068,-.137,.009],[-.451,.063,-.127,.011]);
 solid(frame,[-.35,.065,.015,.037,.011],[-.318,.071,.003,.052,.014],[-.225,.069,-.001,.055,.013],[-.189,.046,.008,.039,.012]);
 tube(steel,0,.035,[[-.078,.023],[.036,.033],[.243,.034],[.325,.027],[.43,.019],[.65,.016],[1.031,.013]],18);
 solid(frame,[.043,.06,-.013,.054],[.095,.063,-.017,.064],[.26,.063,-.017,.063],[.303,.052,-.001,.047]);
 web(body,.027,.003,[[-.127,-.008],[-.029,-.022],[.006,-.061],[-.039,-.081],[-.109,-.046]],[],.002);
 k.bore(.035,1.072,.019,.009,frame,.074,14);
 for(const side of [-1,1]){
  web(frame,side*.029,.004,[[.259,.004],[.51,.006],[.575,-.011],[.54,-.041],[.288,-.048]],
   [[ [.328,-.019],[.495,-.012],[.507,-.022],[.346,-.035] ]],.002);
  for(const z of [.277,.538])pin(side*.035,-.025,z,.005,trim);
 }
 k.guard(-.023,-.045,.129);
 // The bolt handle and polished carrier travel together on each reload.
 const cylinder=tube(steel,0,.038,[[.052,.017],[.052,.025],[.091,.025],[.103,.03],[.157,.03],[.163,.022],[.235,.021],[.237,0]],16);
 const handle=rod(steel,.007,[.018,.036,.109],[.056,.015,.106]);
 const stem=rod(steel,.007,[.056,.015,.106],[.076,-.014,.09]);
 const knob=k.sph(.014,.076,-.014,.09,frame,.97,1,1.15);
 g.userData.pump=moving([cylinder,handle,stem,knob],[0,.038,.14],'Bolt carrier and handle');
 mark('OUTRIDER',-.035,-.012,.199,.119,.027);
 mkSights(g,'OH',{yt:.103,yb:.064,yf:.051,zr:.295,zf:.976});
 g.userData.a={r:[0,-.076,-.032],l:[0,-.066,.486],m:[.023,.066,.181]};
 g.userData.muzzle={y:.035,z:1.072};return g;
};

/* Distinct operator meshes share the animation rig, hitboxes and materials within each kit. */
const OPERATORS={
 recruit:{name:'Field Scout',tone:0x424a40,plate:0x686d58,trim:0xbc9e71,optic:0x526a63},
 breaker:{name:'Bulwark',tone:0x262725,plate:0x464845,trim:0x9b7655,optic:0x573c34},
 peregrine:{name:'Peregrine',tone:0x564d3f,plate:0x76735f,trim:0xa39071,optic:0x58665c},
 lantern:{name:'Lantern',tone:0x524033,plate:0x6f5441,trim:0xba8a59,optic:0x66574a},
 surveyor:{name:'Surveyor',tone:0x3c4a41,plate:0x5a5b49,trim:0xa2a47c,optic:0x746b48},
 crosswind:{name:'Crosswind',tone:0x49464b,plate:0x666066,trim:0x9e8285,optic:0x4e6562},
 machinist:{name:'Machinist',tone:0x43423c,plate:0x626465,trim:0xb89762,optic:0x77553a},
 meridian:{name:'WarPaint',tone:0x65685c,plate:0x1a2026,trim:0x4a504f,optic:0x31516b},
 bellwatch:{name:'Belfry Sentinel',tone:0x30383d,plate:0x4b5252,trim:0xab8256,optic:0x607c7b},
 estatewarden:{name:'Estate Warden',tone:0x47343a,plate:0x485852,trim:0xaa9280,optic:0x7a686f},
 keywarden:{name:'Keywarden',tone:0x703c23,plate:0x977349,trim:0xd6ab5e,optic:0x86bac4}
};
const ZQUEST_OPERATORS={bellwatch:'London',estatewarden:'Hollow Estate',keywarden:JUPITER_MAP};
function operatorId(value){return typeof value==='string'&&hasOwn(OPERATORS,value)?value:'recruit'}
const botOperators=Object.keys(OPERATORS);
function botOperator(index){return botOperators[index%botOperators.length]}

let uniformWeave=null;
function operatorWeave(){
 if(uniformWeave)return uniformWeave;
 const side=16,pixels=new Uint8Array(side*side*4);
 for(let y=0;y<side;y++)for(let x=0;x<side;x++){
  const n=(x+y*side)*4,thread=212+((x+y)%2)*17+((x*9+y*11)%12);
  pixels.set([thread,thread,thread,255],n);
 }
 uniformWeave=new THREE.DataTexture(pixels,side,side,THREE.RGBAFormat);
 uniformWeave.wrapS=uniformWeave.wrapT=THREE.RepeatWrapping;
 uniformWeave.repeat.set(3,3);uniformWeave.minFilter=uniformWeave.magFilter=THREE.LinearFilter;
 uniformWeave.needsUpdate=true;
 return uniformWeave;
}
/* Operator builders are loaded after the shared rig. */

/* Original modular weapons. The attachment mounts, reload parts and grip points use this geometry in every view. */
Object.assign(IRON_SIGHTS,{
 SW:{rear:[[-20,10],[-15,-14],[15,-14],[20,10]],front:[[-17,4],[-9,-9],[9,-9],[17,4]]},
 LT:{rear:[[-20,8],[-13,16],[13,16],[20,8],[13,-13],[-13,-13],[-20,8]],front:[[-16,7],[-9,-11],[9,-11],[16,7]]},
 PD:{rear:[[-25,11],[-17,-10],[0,-16],[17,-10],[25,11]],front:[[-15,6],[-10,-8],[0,-12],[10,-8],[15,6]]}
});
Object.assign(WG,{SW:[.85,W.SW.col,1],LT:[.61,W.LT.col,1],PD:[.98,W.PD.col,1]});
BOTGUNS.push('SW','LT','PD');

MODELS.SW=function(g,finish){
 const k=weaponKit(g,finish,0x927a5f,0x747d80),{body,frame,steel,rubber,recess,solid,tube,web,pin,rail,grip,guard,mark,moving}=k;
 const seal=k.M(0x51524f,.67,.1),witness=k.M(0xc88b55,.45,.42);
 // A stepped ceramic shell wraps a steel receiver. The step in the shell is the ejection recess.
 solid(frame,[-.361,.068,-.064,.052],[-.324,.078,-.091,.078],[-.169,.087,-.078,.081],[-.013,.08,-.059,.068],
  [.109,.083,-.054,.069],[.204,.077,-.062,.061],[.29,.063,-.048,.047]);
 solid(body,[-.342,.076,-.071,.051],[-.29,.105,-.092,.088],[-.18,.105,-.079,.092],[-.133,.099,-.074,.092],
  [-.124,.081,-.062,.074],[.014,.081,-.056,.075],[.023,.098,-.063,.085],[.154,.096,-.057,.078],[.222,.076,-.047,.061]);
 solid(steel,[-.151,.09,.016,.048],[-.119,.096,.008,.058],[-.017,.095,.008,.055],[.012,.08,.016,.044]);
 web(recess,.045,.003,[[-.119,.025],[-.022,.024],[-.014,.037],[-.099,.045]],[],.0018);
 solid(rubber,[-.386,.062,-.064,.032],[-.38,.081,-.085,.049],[-.35,.093,-.105,.072],[-.33,.096,-.103,.075],[-.318,.09,-.084,.059]);
 solid(seal,[-.318,.094,.045,.077],[-.286,.107,.059,.096],[-.161,.106,.059,.093],[-.123,.091,.06,.082]);
 const cooling=Array.from({length:4},(_,i)=>{
  const z=.245+i*.076;return [[z,-.009],[z+.037,-.008],[z+.052,.024],[z+.016,.028]];
 });
 for(const side of [-1,1]){
  web(body,side*.034,.012,[[.162,.049],[.271,.058],[.518,.063],[.61,.034],[.617,-.018],[.559,-.046],[.189,-.06]],cooling,.003);
  web(seal,side*.038,.006,[[.196,-.028],[.218,-.046],[.543,-.036],[.574,-.027],[.552,-.014],[.225,-.018]],[],.003);
  pin(side*.049,-.014,.181,.006,steel);pin(side*.045,-.026,.549,.005,witness);
  web(seal,side*.052,.002,[[-.31,-.042],[-.29,-.063],[-.192,-.052],[-.166,-.038],[-.181,-.031],[-.282,-.044]],[],.0015);
  web(witness,side*.053,.001,[[-.287,-.014],[-.246,-.013],[-.239,-.009],[-.284,-.01]],[],.001);
  for(const z of [-.302,-.215])pin(side*.053,-.028,z,.004);
 }
 solid(rubber,[.179,.06,-.058,-.028],[.276,.064,-.065,-.027],[.402,.075,-.067,-.024],[.548,.062,-.051,-.021],[.595,.053,-.041,-.018]);
 tube(steel,0,.025,[[.137,.027],[.205,.026],[.262,.018],[.584,.015],[.652,.019]],18);
 k.bore(.025,.722,.032,.013,frame,.093,12);
 tube(steel,0,.025,[[.66,.032],[.664,.033],[.673,.033],[.678,.032]],12);
 rail(-.16,.573,.086,.043);
 grip(.075);guard(.075,-.055,.129);
 const mag=solid(frame,[-.225,.051,-.164,-.07],[-.202,.057,-.205,-.075],[-.164,.06,-.21,-.066],[-.122,.056,-.19,-.057],[-.103,.047,-.075,-.056]);
 const cap=solid(seal,[-.208,.051,-.205,-.186],[-.197,.064,-.217,-.191],[-.142,.064,-.213,-.185],[-.12,.053,-.199,-.181]);
 const wells=[];
 for(const side of [-1,1]){
  wells.push(web(recess,side*.029,.002,[[-.185,-.188],[-.16,-.189],[-.145,-.1],[-.176,-.105]],[],.002));
  for(let i=0;i<3;i++)wells.push(k.box(.003,.013,.024,side*.032,-.16+i*.018,-.168+i*.002,witness,-.15));
 }
 g.userData.mags=moving([mag,cap,...wells],[0,-.147,-.163],'Rear-feed magazine');
 mark('SWITCHBACK',-.053,.013,-.223,.118,.031);
 mkSights(g,'SW',{yt:.14,yb:.098,yf:.088,zr:-.116,zf:.559});
 g.userData.a={r:[0,-.114,.072],l:[0,-.064,.365],m:[0,-.147,-.163]};
 g.userData.muzzle={x:0,y:.025,z:.722};return g;
};

MODELS.LT=function(g,finish){
 const k=weaponKit(g,finish,0x406e63,0x8e9f9a),{body,frame,steel,rubber,recess,trim,solid,tube,web,pin,rod,rail,grip,guard,mark,moving}=k;
 const polymer=k.M(0x355052,.64,.2),amber=k.M(0xcca776,.53,.44);
 // Two compact channels carry the barrel and the detachable cassette above it.
 solid(frame,[-.192,.061,-.04,.035],[-.13,.074,-.06,.063],[.02,.078,-.073,.065],[.173,.068,-.058,.058],
  [.274,.061,-.043,.053],[.313,.053,-.036,.045],[.357,.054,-.031,.037]);
 for(const side of [-1,1]){
  web(body,side*.029,.011,[[.132,.034],[.344,.052],[.393,.021],[.369,-.031],[.253,-.067],[.156,-.06]],
   [[[.176,.014],[.237,.028],[.274,.026],[.231,-.024],[.192,-.03]],
    [[.268,-.021],[.311,.027],[.346,.031],[.353,.013],[.306,-.023],[.276,-.041]]],.003);
  pin(side*.04,-.05,.168,.006,steel);pin(side*.04,-.018,.37,.005,trim);
  rod(steel,.006,[side*.027,.028,-.11],[side*.03,.028,-.282]);
  rod(frame,.011,[side*.028,-.049,-.121],[side*.032,-.036,-.271]);
 }
 solid(body,[-.142,.075,-.045,.04],[-.117,.087,-.055,.062],[-.02,.086,-.068,.066],[.143,.075,-.058,.057],[.17,.07,-.047,.048]);
 solid(rubber,[-.32,.051,-.063,.048],[-.309,.071,-.073,.063],[-.28,.075,-.06,.058],[-.258,.055,-.049,.049]);
 solid(polymer,[.161,.054,-.064,-.025],[.211,.065,-.07,-.027],[.293,.065,-.068,-.028],[.35,.041,-.048,-.021]);
 for(const side of [-1,1]){
  web(polymer,side*.042,.004,[[-.107,.018],[-.069,.053],[.122,.047],[.134,.028],[.103,.004],[-.097,-.005]],[],.002);
  for(let i=0;i<4;i++){
   const z=.025+i*.022;web(recess,side*.045,.001,[[z,.021],[z+.005,.019],[z+.016,.032],[z+.011,.034]],[],.001);
  }
 }
 grip(.032);guard(.032,-.059,.1);
 tube(steel,0,.022,[[.138,.028],[.229,.023],[.332,.017],[.438,.015]],16);
 k.bore(.022,.49,.027,.012,frame,.081,10);
 tube(amber,0,.022,[[.421,.025],[.423,.03],[.432,.03],[.433,.028]],10);
 const shell=solid(polymer,[-.069,.04,.071,.104],[-.051,.058,.063,.119],[-.007,.059,.067,.121],[.199,.059,.064,.117],[.241,.05,.068,.107],[.261,.045,.077,.098]);
 const end=solid(steel,[-.064,.055,.064,.104],[-.052,.063,.06,.115],[-.024,.066,.063,.119],[-.012,.058,.067,.116]);
 const cassette=[shell,end];
 for(const side of [-1,1]){
  cassette.push(web(recess,side*.03,.003,[[.043,.082],[.217,.082],[.231,.101],[.055,.106]],[],.0015));
  for(let i=0;i<7;i++){
   const z=.059+i*.021;
   cassette.push(k.box(.003,.013,.013,side*.033,.094,z,i===0?steel:amber,.4));
  }
 }
 g.userData.mags=moving(cassette,[0,.09,.112],'Top-mounted cassette');
 rail(-.192,-.08,.085,.034);
 solid(frame,[.269,.04,.042,.067],[.29,.049,.052,.078],[.355,.043,.042,.074]);
 mark('LATTICE',-.046,.022,-.04,.091,.025);
 mkSights(g,'LT',{yt:.155,yb:.096,yf:.073,zr:-.142,zf:.345});
 g.userData.a={r:[0,-.116,.027],l:[0,-.068,.263],m:[0,.09,.112],pd:[0,.18,.02],ho:[0,.037,0]};
 g.userData.muzzle={x:0,y:.022,z:.49};return g;
};

MODELS.PD=function(g,finish){
 const k=weaponKit(g,finish,0x546981,0x788a96),{body,frame,steel,rubber,recess,trim,solid,tube,web,pin,rod,rail,grip,guard,mark,moving}=k;
 const copper=k.M(0xb47753,.43,.61);
 // Thicker around the chamber, then necked down to the floating barrel and thin fore-end.
 solid(frame,[-.207,.061,-.02,.051],[-.166,.078,-.033,.066],[.037,.086,-.051,.072],[.21,.087,-.06,.067],
  [.27,.078,-.052,.057],[.313,.058,-.027,.048]);
 solid(body,[-.187,.073,-.018,.056],[-.129,.091,-.031,.079],[-.002,.091,-.037,.085],[.095,.093,-.042,.082],
  [.096,.062,-.008,.077],[.214,.062,-.014,.075],[.217,.085,-.037,.073],[.264,.077,-.032,.063],[.305,.056,-.012,.051]);
 solid(steel,[.097,.077,.008,.061],[.124,.089,.001,.068],[.186,.089,.002,.068],[.213,.078,.01,.057]);
 rod(steel,.006,[.042,.042,.177],[.065,.046,.153]);
 k.sph(.012,.065,.046,.153,rubber,1.2,.91,1);
 solid(frame,[.262,.044,-.053,-.014],[.315,.054,-.058,-.023],[.478,.056,-.061,-.031],[.622,.047,-.048,-.023],[.68,.046,-.029,-.013]);
 const slots=Array.from({length:4},(_,i)=>{
  const z=.327+i*.073;return [[z,0],[z+.047,-.004],[z+.055,.022],[z+.012,.028]];
 });
 for(const side of [-1,1]){
  web(body,side*.026,.011,[[.276,.05],[.459,.062],[.598,.058],[.692,.029],[.673,-.022],[.318,-.057]],slots,.003);
  pin(side*.04,-.039,.319,.005,trim);pin(side*.034,-.017,.653,.005,steel);
  web(recess,side*.044,.002,[[-.115,-.017],[-.101,-.024],[.06,-.021],[.078,-.013],[.067,-.008],[-.105,-.008]],[],.0015);
  pin(side*.047,.024,-.133,.006,copper);
 }
 tube(steel,0,.028,[[.126,.032],[.281,.03],[.344,.022],[.424,.02],[.64,.017],[.754,.016]],20);
 k.bore(.028,.79,.032,.013,frame,.096,12);
 for(const [z,r] of [[.704,.03],[.725,.032],[.748,.032]])tube(copper,0,.028,[[z,r-.002],[z+.003,r],[z+.007,r],[z+.009,r-.001]],12);
 rail(-.165,.351,.084,.041);
 rail(.53,.665,.052,.038);
 // A skeleton with an adjustable cheek rest and exposed hinge at the shoulder.
 web(frame,0,.033,[[-.371,-.116],[-.357,.02],[-.208,.053],[-.133,.022],[-.158,-.026],[-.235,-.065],[-.329,-.113]],
  [[[-.335,-.075],[-.315,.011],[-.184,.02],[-.201,-.015],[-.253,-.042]]],.004);
 for(const side of [-1,1]){
  rod(steel,.005,[side*.018,-.082,-.328],[side*.02,.012,-.199]);
  pin(side*.024,-.023,-.334,.011,copper);
 }
 solid(rubber,[-.397,.056,-.116,-.014],[-.386,.075,-.124,.014],[-.357,.079,-.119,.023],[-.342,.067,-.098,.021]);
 solid(body,[-.348,.061,.011,.042],[-.325,.076,.014,.061],[-.215,.077,.027,.069],[-.193,.053,.033,.059]);
 grip(-.016);guard(-.016,-.053,.131);
 const mag=solid(frame,[.086,.042,-.138,-.072],[.11,.052,-.162,-.052],[.186,.055,-.158,-.043],[.226,.046,-.104,-.037]);
 const cap=solid(steel,[.094,.042,-.154,-.134],[.115,.061,-.173,-.146],[.198,.063,-.167,-.145],[.217,.046,-.149,-.134]);
 const foot=solid(rubber,[.111,.059,-.176,-.167],[.191,.063,-.17,-.159]);
 g.userData.mags=moving([mag,cap,foot],[0,-.113,.153],'Short magazine');
 mark('PENDULUM',-.047,.022,.026,.112,.029);
 mkSights(g,'PD',{yt:.142,yb:.095,yf:.064,zr:-.126,zf:.601});
 g.userData.a={r:[0,-.115,-.021],l:[0,-.061,.426],m:[0,-.113,.153]};
 g.userData.muzzle={x:0,y:.028,z:.79};return g;
};

/* Cosmetic mounts are separate from the shared weapon geometry and never change collision or handling. */
const passCharmTemplates=new Map();
function passCharmModel(id){
 if(passCharmTemplates.has(id))return gunCopy(passCharmTemplates.get(id));
 const g=new THREE.Group(),c=PASS_CHARMS[id]?.color;
 if(!c)return g;
 const {M,E,box,ring,cylY}=gunKit(g),gold=M(c),metal=M(0x4d585d),dark=M(0x202423);
 ring(.01,.0024,0,0,0,metal);
 box(.005,.024,.006,0,-.022,0,metal);
 switch(id){
  case 'key':
   ring(.013,.003,0,-.035,0,gold);
   box(.009,.037,.009,0,-.062,0,gold);
   box(.016,.007,.009,.006,-.072,0,gold);
   box(.02,.007,.009,.006,-.08,0,gold);
   break;
  case 'gyro':
   ring(.021,.004,0,-.052,0,gold);
   ring(.015,.003,0,-.052,0,metal).rotation.y=Math.PI*.47;
   const axis=cylY(.004,.039,0,-.052,0,gold);
   axis.rotation.z=.57;
   break;
  case 'lantern':
   box(.028,.037,.026,0,-.055,0,dark);
   box(.017,.023,.029,0,-.055,0,E(c));
   for(const side of [-1,1])box(.031,.005,.03,0,-.055+side*.017,0,gold);
   break;
  case 'crown':{
   ring(.023,.003,0,-.055,0,gold);
   ring(.023,.003,0,-.055,0,metal).rotation.y=1.5;
   const core=new THREE.Mesh(new THREE.OctahedronGeometry(.017,0),E(0x76e6db));
   core.scale.set(.7,1.28,.7);core.position.y=-.055;g.add(core);
   for(const side of [-1,1])box(.006,.033,.011,side*.015,-.055,0,gold,0,side*.39);
   break;
  }
  case 'prism':{
   const point=new THREE.Mesh(new THREE.OctahedronGeometry(.022,0),gold);
   point.scale.set(.65,1,.61);point.position.y=-.055;point.rotation.z=.21;g.add(point);
   ring(.019,.0025,0,-.055,0,metal).rotation.y=.73;
   break;
  }
 }
 g.userData.charm=true;
 g.traverse(node=>{node.userData.charm=true;node.castShadow=false});
 passCharmTemplates.set(id,g);
 return gunCopy(g);
}
function addPassCharm(model,id){
 if(!id)return;
 const charm=passCharmModel(id),hold=model.userData.a.r;
 charm.position.set(.063,.012,hold[2]+.13);
 model.add(charm);
}

WG.TEA=[.6,0xb8733a,0,0xffb040];
GS.TEA={n:[[.3,'bandpass',1200,.4,0,.9,1.8],[.2,'lowpass',520,.35,.04],[.06,'highpass',4800,.12]],o:[['sine',170,70,.2,.3]]};
RLK.TEA='mag';
/* the model: riveted copper boiler with a teapot lid on top, brass bands, a pressure gauge, a glowing sight-glass tube, a curved brass spout-nozzle with a glowing amber mouth, copper pipes,
   a mahogany stock with a brass butt plate, a leather pistol grip, and a teacup on a saucer as the magazine */
MODELS.TEA=function(g,rm){const k=gunKit(g,rm),M=k.M,E=k.E,cop=rm||M(0xb8733a),brass=M(0xc9a23a),mah=M(0x4a2616),leather=M(0x1d130c),por=M(0xf4efe4),blue=M(0x2b4f9e),dk=M(0x15171a),gun=M(0x2a2d31),steel=M(0x8a9098),amb=E(0xffa530),cream=E(0xfff0c8),mags=[];
 /* boiler: a long copper drum with domed ends, three brass bands and a ring of rivets on each */
 k.cyl(.088,.42,0,.15,.2,cop,.088,22);k.sph(.088,0,.15,.41,cop,1,1,.6);k.sph(.088,0,.15,-.01,cop,1,1,.6);
 for(const z of[.06,.2,.34]){k.cyl(.093,.022,0,.15,z,brass,.093,22);for(let i=0;i<10;i++){const a=i/10*6.283;k.sph(.007,Math.cos(a)*.094,.15+Math.sin(a)*.094,z,steel)}}
 /* the teapot lid on top of the boiler: filler neck, porcelain dome, gold knob, a tiny whistle */
 k.cylY(.05,.03,0,.245,.2,brass);k.cylY(.04,.02,0,.265,.2,por);k.sph(.045,0,.275,.2,por,1,.62,1);k.sph(.014,0,.31,.2,brass);k.cylY(.011,.05,.045,.28,.13,brass);k.sph(.014,.045,.31,.13,brass);
 for(let i=0;i<8;i++){const a=i/8*6.283;k.box(.008,.012,.008,Math.cos(a)*.052,.262,.2+Math.sin(a)*.052,blue)}
 /* pressure gauge on the left, with an emissive face and a needle */
 k.cylY(.045,.02,.1,.15,.13,brass,0,Math.PI/2);k.cylY(.037,.022,.104,.15,.13,cream,0,Math.PI/2);k.box(.003,.03,.003,.109,.152,.13,dk,.9);for(let i=0;i<7;i++){const a=-1.2+i*.4;k.box(.002,.008,.002,.11,.15+Math.cos(a)*.032,.13+Math.sin(a)*.032,dk,a)}k.sph(.007,.11,.15,.13,brass);
 /* sight-glass tube with glowing tea and brass fittings */
 k.cylY(.011,.13,-.098,.14,.3,amb);k.cylY(.016,.02,-.098,.2,.3,brass);k.cylY(.016,.02,-.098,.08,.3,brass);k.cylY(.007,.02,-.092,.2,.3,brass,0,Math.PI/2);k.cylY(.007,.02,-.092,.08,.3,brass,0,Math.PI/2);
 /* frame under the boiler, trigger group, leather pistol grip with a brass backstrap */
 k.box(.072,.07,.32,0,.035,.2,gun);k.box(.06,.012,.28,0,.075,.2,steel);k.box(.1,.03,.1,0,.0,.06,gun);
 k.box(.046,.125,.058,0,-.072,.075,leather,.32);k.box(.012,.12,.06,.0,-.07,.045,brass,.32);k.box(.05,.016,.07,0,-.14,.055,brass,.32);
 k.box(.006,.032,.1,0,-.005,.13,steel);k.box(.007,.034,.012,0,-.012,.095,steel);k.box(.005,.026,.008,0,-.003,.12,steel);
 /* mahogany stock, brass butt plate and a small crest */
 k.box(.056,.1,.2,0,.045,-.13,mah);k.box(.056,.085,.12,0,.02,-.26,mah,-.14);k.box(.058,.11,.014,0,.0,-.332,brass,-.14);k.box(.058,.014,.2,0,.098,-.13,brass);k.box(.003,.05,.05,.029,.04,-.13,blue);k.box(.004,.03,.03,.0305,.04,-.13,brass);
 /* the nozzle: a curved teapot spout in tapering copper and brass sections, a heat sleeve and a glowing amber mouth */
 k.cyl(.052,.1,0,.15,.47,cop,.042,18);k.cyl(.042,.14,0,.152,.59,cop,.034,16);k.cyl(.034,.14,0,.158,.72,brass,.03,14);k.cyl(.03,.1,0,.166,.84,brass,.034,14);
 k.cyl(.046,.016,0,.168,.9,brass,.052,14);k.cyl(.036,.02,0,.168,.912,E(0xffb040),.036,14);k.cyl(.022,.025,0,.168,.92,dk,.022,10);
 for(let i=0;i<8;i++){const a=i/8*6.283;k.box(.007,.007,.05,Math.cos(a)*.044,.152+Math.sin(a)*.044,.62,dk)}
 /* copper pipes from the boiler to the nozzle, with elbows, and a valve wheel */
 for(const s of[-1,1]){k.cyl(.008,.34,s*.062,.2,.55,cop);k.sph(.012,s*.062,.2,.38,brass);k.sph(.012,s*.062,.2,.72,brass);k.cylY(.008,.04,s*.062,.18,.38,cop)}
 k.ring(.026,.005,0,.215,.4,brass);for(let i=0;i<4;i++){const a=i*Math.PI/2;k.box(.004,.05,.004,0,.215,.4,brass,0,0,a)}k.cyl(.007,.04,0,.215,.38,brass);
 /* teacup magazine on its saucer, with a blue band, a gold rim, tea inside and a handle */
 mags.push(k.cylY(.034,.075,0,-.02,.3,por,0,0,.054),k.cylY(.078,.012,0,-.06,.3,por),k.cylY(.056,.012,0,.005,.3,blue),k.cylY(.055,.004,0,.026,.3,brass),k.cylY(.047,.004,0,.021,.3,E(0xb5651d)),k.ring(.022,.006,.063,-.012,.3,por));
 k.box(.052,.016,.052,0,.018,.3,gun);
 /* a lamp that shows the cannon is hot */
 k.sph(.01,0,.083,.44,amb);
 k.box(.047,.012,.03,.085,.207,.09,brass);k.box(.085,.014,.027,.069,.219,.52,brass);
 mkSights(g,'TEA',{xt:.104,yt:.258,yb:.213,yf:.225,zr:.09,zf:.52});
 g.userData.a={r:[0,-.07,.075],l:[0,-.02,.36],m:[0,-.05,.3]};g.userData.mags=mags;g.userData.muzzle={x:0,y:.168,z:.933};return g};
;

/* All silhouettes are baked into the existing animated joints. Models stay in
   the same coordinate system as the studio and network avatars. */
// Stations are [height, width, back, front, corner radius] in metres.
function operatorSoftVolume(stations){
 const sides=18,positions=[],texels=[],faces=[];
 for(const [row,[y,width,back,front]] of stations.entries()){
  for(let side=0;side<=sides;side++){
   const angle=side*Math.PI*2/sides,c=Math.cos(angle),s=Math.sin(angle);
   const round=value=>Math.sign(value)*Math.pow(Math.abs(value),.76);
   positions.push(width*.5*round(c),y,(front+back)*.5+(front-back)*.5*round(s));
   texels.push(side/sides,y*2);
   if(row<stations.length-1&&side<sides){
    const i=row*(sides+1)+side,j=i+sides+1;
    faces.push(i,j,i+1,i+1,j,j+1);
   }
  }
 }
 for(const end of [0,stations.length-1]){
  const [y,,back,front]=stations[end],center=positions.length/3;
  positions.push(0,y,(front+back)*.5);texels.push(.5,y*2);
  for(let side=0;side<sides;side++){
   const rim=end*(sides+1)+side;
   if(end===0)faces.push(center,rim,rim+1);
   else faces.push(center,rim+1,rim);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(texels,2));
 geometry.setIndex(faces);geometry.computeVertexNormals();
 return geometry;
}
function operatorPanel(a,material,stations,offset=[0,0,0],roll=0,pitch=0,yaw=0){
 const soft=['fabric','skin','palm','wrap','wrapShade'].includes(material);
 const geometry=soft?operatorSoftVolume(stations):weaponLoft(stations.map(([y,width,back,front,round])=>[y,width,-front,-back,round]));
 if(!soft)geometry.rotateX(-Math.PI/2);
 a(material,geometry,1,1,1,...offset,pitch,yaw,roll);
}

const operatorEquipment={
 recruit:{helmet:'patrol',plate:.33,pockets:3,radio:1},
 breaker:{helmet:'assault',plate:.40,pockets:3,radio:1,heavy:true},
 peregrine:{helmet:'recon',plate:.27,pockets:2,radio:1,soft:true,low:true},
 lantern:{helmet:'respirator',plate:.35,pockets:3,filter:true,pack:true},
 surveyor:{helmet:'cap',plate:.29,pockets:2,radio:1,soft:true,low:true},
 crosswind:{helmet:'hood',plate:.275,pockets:2,soft:true},
 machinist:{helmet:'service',plate:.37,pockets:3,radio:1,pack:true},
 bellwatch:{helmet:'bell',plate:.34,pockets:3,badge:true,heavy:true},
 estatewarden:{helmet:'hood',plate:.30,pockets:2,soft:true,badge:true,pack:true}
};

function operatorBlock(a,mat,w,h,d,x,y,z,rx=0,ry=0,rz=0){
 a(mat,hvR(w,h,d,Math.min(w,h,d)*.24),w,h,d,x,y,z,rx,ry,rz);
}

// Smooth cross sections let the cloth gather at a joint without adding a second layer over it.
// Each section gives height, half width, rear and front depth, then an optional lateral offset.
function meridianProfile(sections,shape=1,fold=0){
 const y0=sections[0][0],y1=sections[sections.length-1][0];
 const sample=(height,i,j,t)=>{
  const before=sections[Math.max(0,i-1)],left=sections[i],right=sections[j],after=sections[Math.min(sections.length-1,j+1)];
  const value=k=>{
   const a=left[k]||0,b=right[k]||0;
   const slopeA=(b-(before[k]||0))/(right[0]-before[0])*(right[0]-left[0]);
   const slopeB=((after[k]||0)-a)/(after[0]-left[0])*(right[0]-left[0]);
   return a+(slopeA+(3*(b-a)-2*slopeA-slopeB+(2*(a-b)+slopeA+slopeB)*t)*t)*t;
  };
  return [height,value(1),value(2),value(3),value(4)];
 };
 return (u,v)=>{
  const y=y0+(y1-y0)*v;
  const j=Math.max(1,sections.findIndex(section=>section[0]>=y-1e-8)),i=j-1;
  const [height,w,back,front,x]=sample(y,i,j,(y-sections[i][0])/(sections[j][0]-sections[i][0]));
  const angle=u*Math.PI*2,s=Math.sin(angle),c=Math.cos(angle);
  const gather=fold*Math.sin(v*Math.PI)*(
   Math.sin(v*39+Math.sin(angle)*2.8)*.6+Math.sin(v*62-angle*4)*.27+Math.sin(v*23+angle*7)*.13);
  const round=n=>Math.sign(n)*Math.pow(Math.abs(n),shape);
  return [x+round(c)*(w+gather),height,(front+back)*.5+round(s)*((front-back)*.5+gather)];
 };
}
function meridianSurface(a,material,point,{rows=20,cols=22,loop=false,reverse=false,uvHeight=1,offset=[0,0,0],yaw=0,roll=0}={}){
 const positions=[],uvs=[],faces=[];
 for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
  const u=col/cols,v=row/rows;
  positions.push(...point(u,v));uvs.push(u,v*uvHeight);
  if(row<rows&&col<cols){
   const i=row*(cols+1)+col,j=i+cols+1;
   faces.push(...(reverse?[i,j,i+1,i+1,j,j+1]:[i,i+1,j,i+1,j+1,j]));
  }
 }
 if(loop)for(const row of [0,rows]){
  const start=row*(cols+1),center=positions.length/3,p=point(0,row/rows),q=point(.5,row/rows);
  positions.push((p[0]+q[0])*.5,p[1],(p[2]+q[2])*.5);uvs.push(.5,row/rows*uvHeight);
  for(let col=0;col<cols;col++){
   const i=start+col;
   faces.push(...(row===0?[center,i,i+1]:[center,i+1,i]));
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.setIndex(faces);geometry.computeVertexNormals();
 if(loop){
  const normals=geometry.getAttribute('normal');
  for(let row=0;row<=rows;row++){
   const first=row*(cols+1),last=first+cols;
   const n=V().fromBufferAttribute(normals,first).add(V().fromBufferAttribute(normals,last)).normalize();
   normals.setXYZ(first,n.x,n.y,n.z);normals.setXYZ(last,n.x,n.y,n.z);
  }
 }
 a(material,geometry,1,1,1,...offset,0,yaw,roll);
}
function meridianVolume(a,material,sections,{shape=1,fold=0,offset,yaw,roll}={}){
 const surface=meridianProfile(sections,shape,fold);
 meridianSurface(a,material,surface,{rows:sections.length*3,cols:32,loop:true,reverse:true,
  uvHeight:(sections[sections.length-1][0]-sections[0][0])*2,offset,yaw,roll});
 return surface;
}
function meridianSeam(a,material,path,r=.0025){
 const curve=new THREE.CatmullRomCurve3(path.map(p=>V(...p)));
 a(material,new THREE.TubeGeometry(curve,Math.max(8,path.length*3),r,5,false),1,1,1,0,0,0);
}
function meridianPouch(a,x,y,z,w,h,d,roll=0,yaw=0){
 meridianVolume(a,'canvas',[
  [-h*.50,w*.34,-d*.29,d*.25],[-h*.42,w*.47,-d*.48,d*.47],
  [-h*.11,w*.50,-d*.50,d*.52],[h*.34,w*.48,-d*.49,d*.44],[h*.50,w*.37,-d*.39,d*.39]
 ],{shape:.5,fold:.0011,offset:[x,y,z],roll,yaw});
 meridianVolume(a,'armor',[
  [h*.22,w*.42,-d*.28,d*.52],[h*.31,w*.52,-d*.42,d*.63],
  [h*.47,w*.53,-d*.46,d*.56],[h*.55,w*.43,-d*.36,d*.36]
 ],{shape:.54,offset:[x,y,z],roll,yaw});
 const seam=new THREE.Group();
 seam.position.set(x,y,z);seam.rotation.set(0,yaw,roll);seam.updateMatrix();
 const path=points=>points.map(point=>V(...point).applyMatrix4(seam.matrix).toArray());
 meridianSeam(a,'thread',path([[-w*.37,-h*.37,d*.40],[-w*.39,h*.14,d*.45],[-w*.35,h*.28,d*.58]]),.0015);
 meridianSeam(a,'thread',path([[w*.37,-h*.37,d*.40],[w*.39,h*.14,d*.45],[w*.35,h*.28,d*.58]]),.0015);
 meridianSeam(a,'seamShade',path([[-w*.45,h*.262,d*.42],[0,h*.274,d*.62],[w*.45,h*.262,d*.42]]),.0019);
}
function meridianTorso(a,rod,G){
 meridianVolume(a,'skin',[
  [.285,.159,-.108,.125],[.353,.204,-.110,.135],[.413,.249,-.110,.119],
  [.465,.272,-.101,.110],[.495,.265,-.085,.094],[.525,.233,-.076,.079],
  [.547,.156,-.067,.076],[.582,.068,-.055,.059],[.679,.054,-.050,.052]
 ]);
 meridianVolume(a,'fabric',[
  [-.047,.156,-.092,.117],[.023,.162,-.107,.121],[.105,.153,-.109,.119],
  [.197,.166,-.117,.130],[.293,.185,-.127,.153],[.380,.205,-.129,.152],
  [.445,.230,-.119,.134],[.491,.217,-.101,.108],[.524,.174,-.083,.086]
 ],{shape:.83,fold:.0035});
 for(const side of [-1,1]){
  const armhole=[[side*.158,.521,.050],[side*.194,.483,.084],[side*.219,.434,.075],
   [side*.205,.371,.071],[side*.179,.320,-.021],[side*.194,.400,-.095],[side*.176,.481,-.086],[side*.151,.522,-.056]];
  meridianSeam(a,'canvas',armhole,.006);
  meridianSeam(a,'thread',armhole.map(([x,y,z])=>[x*.975,y,z+.001]),.0015);
  meridianSeam(a,'seamShade',[[side*.142,.015,.067],[side*.145,.098,.075],[side*.151,.190,.091],[side*.167,.273,.108]],.0026);
 }
 meridianSeam(a,'seamShade',[[0,.013,.121],[.001,.114,.128],[.007,.232,.148],[.001,.447,.127]],.005);
 meridianSeam(a,'thread',[[.008,.025,.124],[.010,.108,.129],[.016,.228,.149],[.010,.430,.138]],.0018);
 meridianPouch(a,.093,.232,.148,.088,.121,.041,.06,-.20);
 meridianPouch(a,-.108,.111,.132,.073,.147,.042,-.23,.27);
 meridianPouch(a,.104,.325,-.124,.114,.226,.061,.25,Math.PI);
 meridianPouch(a,-.078,.297,-.132,.091,.179,.049,-.20,Math.PI);

 // Flat woven harness curves around the body. Both stitched edges follow the same path.
 const harness=new THREE.CatmullRomCurve3([
  V(-.126,.093,.115),V(-.062,.196,.159),V(.030,.308,.170),V(.129,.414,.138),
  V(.171,.499,.064),V(.166,.520,-.012),V(.139,.475,-.089),V(.071,.365,-.141),V(-.026,.200,-.136)
 ]);
 const strap=(u,v)=>{
  const p=harness.getPoint(v),t=harness.getTangent(v);
  const across=V(t.y,-t.x,0).normalize(),width=.055+.012*Math.sin(v*Math.PI);
  return p.addScaledVector(across,(u-.5)*width).toArray();
 };
 meridianSurface(a,'canvas',strap,{cols:4,rows:34});
 meridianSurface(a,'canvas',(u,v)=>strap(1-u,v),{cols:4,rows:34});
 for(const u of [.08,.92]){
  meridianSeam(a,'thread',Array.from({length:18},(_,i)=>strap(u,i/17)),.002);
 }
 a('blackMetal',new THREE.TorusGeometry(.020,.0035,7,20),.89,1.17,.9,.010,.286,.174,0,0,-.66);
 rod('blackMetal',-.002,.273,.177,.023,.298,.178,.0028);
 rod('thread',-.061,.187,.162,-.032,.220,.169,.0022);

 meridianVolume(a,'wrapShade',[
  [.495,.099,-.072,.098],[.531,.115,-.082,.117],[.578,.085,-.073,.094],
  [.618,.083,-.067,.078],[.645,.062,-.055,.066]
 ],{fold:.005});
 const scarf=(u,v)=>{
  const t=u*2-1,width=.021+.113*Math.pow(v,.76),x=-.065+.081*v+t*width;
  const y=.301+.276*v+.31*Math.pow(Math.abs(t),3)*(1-v)*(.49+.5*u)+.029*t*v;
  const z=.158-.044*v-.084*t*t+.056*Math.sin(Math.PI*v)*(1-t*t);
  const wrinkle=(.009*Math.sin(v*36+t*4)+.007*Math.sin(v*18-t*7))*Math.sin(Math.PI*u);
  return [x,y+wrinkle*.40,z+wrinkle];
 };
 meridianSurface(a,'wrap',scarf,{rows:32,cols:30});
 meridianSurface(a,'wrapShade',(u,v)=>{
  const p=scarf(1-u,v);p[2]-=.003;return p;
 },{rows:32,cols:30});
 for(const side of [0,1])meridianSeam(a,'wrapShade',Array.from({length:11},(_,i)=>scarf(side,i/10)),.0031);
 for(const [center,start,end] of [[.35,.24,.92],[.56,.47,1],[.72,.59,.96]]){
  const fold=Array.from({length:10},(_,i)=>{
   const t=i/9,p=scarf(center+.15*Math.sin(t*2.4),start+(end-start)*t);
   p[2]+=.0018;return p;
  });
  meridianSeam(a,'wrapEdge',fold,.0016);
 }
 for(const side of [-1,1]){
  meridianSeam(a,'wrapEdge',[[side*.082,.557,.056],[side*.092,.564,.013],[side*.078,.579,-.065],[side*.017,.595,-.075]],.0027);
 }
 a('blackMetal',G.ss,.005,.005,.003,.118,.261,.173);
}

let meridianPaint;
function meridianSkullPaint(){
 if(meridianPaint)return meridianPaint;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const g=canvas.getContext('2d'),chalk=g.createLinearGradient(0,88,0,438);
 chalk.addColorStop(0,'#b9bdb0');chalk.addColorStop(.44,'#d5d2ba');chalk.addColorStop(1,'#a49b83');
 g.fillStyle=chalk;
 g.beginPath();g.moveTo(64,96);g.bezierCurveTo(134,77,205,59,235,82);g.lineTo(253,72);
 g.bezierCurveTo(335,52,388,72,445,99);g.lineTo(425,135);g.lineTo(445,241);
 g.lineTo(402,252);g.lineTo(360,289);g.lineTo(346,360);g.lineTo(307,393);
 g.lineTo(286,412);g.lineTo(210,408);g.lineTo(165,370);g.lineTo(143,293);g.lineTo(61,249);
 g.lineTo(88,213);g.closePath();g.fill();
 const charcoal='#302e2c';
 g.fillStyle=charcoal;
 for(const side of [-1,1]){
  g.save();g.translate(256,0);g.scale(side,1);
  g.beginPath();g.moveTo(34,161);g.quadraticCurveTo(78,139,111,145);g.lineTo(150,165);g.lineTo(158,195);
  g.quadraticCurveTo(129,225,92,229);g.lineTo(57,214);g.quadraticCurveTo(47,209,34,161);g.fill();
  g.beginPath();g.moveTo(78,276);g.lineTo(152,258);g.lineTo(106,309);g.lineTo(83,305);g.closePath();g.fill();
  for(const [x,y,h] of [[15,336,64],[40,331,51],[66,322,42]]){
   g.beginPath();g.moveTo(x-4,y);g.lineTo(x+8,y-3);g.lineTo(x+3,y+h);g.lineTo(x-4,y+h-10);g.fill();
  }
  g.restore();
 }
 g.beginPath();g.moveTo(249,220);g.lineTo(266,224);g.lineTo(281,286);g.lineTo(258,277);
 g.lineTo(230,286);g.lineTo(239,242);g.fill();
 g.lineWidth=10;g.strokeStyle=charcoal;g.beginPath();g.moveTo(151,317);g.quadraticCurveTo(244,352,368,310);g.stroke();
 g.globalCompositeOperation='source-atop';
 for(let i=0;i<2700;i++){
  const x=(i*31.41+i*i*1.71)%512,y=(i*10.7+i*i*.66)%512;
  g.fillStyle=i%4===0?'rgba(46,38,31,.18)':'rgba(217,198,158,.14)';
  g.fillRect(x,y,1+i%4,1+i%3);
 }
 g.lineWidth=2;g.strokeStyle='rgba(77,61,50,.46)';
 for(const [x,y] of [[142,110],[341,105],[145,279],[351,301],[262,380]]){
  g.beginPath();g.moveTo(x,y);g.lineTo(x+6,y+19);g.lineTo(x+3,y+23);g.lineTo(x+12,y+39);g.stroke();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;texture.anisotropy=4;
 return meridianPaint=new THREE.MeshLambertMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
}
const meridianHeadProfile=[
 [0,.035,-.039,.051],[.017,.054,-.064,.069],[.042,.074,-.079,.084],[.076,.081,-.088,.097],
 [.111,.088,-.099,.105],[.145,.088,-.101,.101],[.167,.088,-.100,.103],[.202,.086,-.094,.100],
 [.237,.064,-.071,.076],[.258,.030,-.032,.046]
];
function meridianHead(a,rod,G){
 const profile=meridianProfile(meridianHeadProfile,.84);
 const skin=(u,v)=>{
  const p=profile(u,v),x=p[0],y=p[1];
  const front=Math.max(0,Math.sin(u*Math.PI*2));
  const cheek=.007*Math.exp(-((Math.abs(x)-.048)**2/.00051+(y-.101)**2/.0012));
  const socket=.008*Math.exp(-((Math.abs(x)-.042)**2/.00027+(y-.145)**2/.00012));
  const nose=.015*Math.exp(-(x*x/.00023+(y-.121)**2/.0008));
  p[2]+=(cheek-socket+nose)*front*front;return p;
 };
 meridianSurface(a,'skin',skin,{rows:48,cols:48,loop:true,reverse:true});
 meridianSurface(a,'skullPaint',(u,v)=>{
  const p=skin(.063+u*.374,(.013+v*.203)/.258);
  p[2]+=.0015;return p;
 },{rows:40,cols:36,reverse:true});
 for(const side of [-1,1]){
  a('skin',G.sp,.014,.030,.016,side*.086,.117,-.022,.12,0,-side*.12);
  a('leather',G.sp,.006,.015,.009,side*.096,.119,-.018,.25);
  a('eye',G.sp,.015,.0061,.0030,side*.041,.145,.088,0,side*.43,-side*.06);
  a('seamShade',G.sp,.0047,.0051,.0021,side*.040,.145,.091);
  a('thread',G.ss,.0011,.0011,.0007,side*.039,.147,.093);
  meridianSeam(a,'seamShade',[[side*.024,.146,.096],[side*.039,.151,.093],[side*.054,.148,.083]],.0018);
 }
 const cap=meridianVolume(a,'wrap',[
  [.174,.088,-.108,.103],[.183,.095,-.112,.106],[.204,.097,-.113,.108],[.229,.090,-.110,.103],
  [.255,.074,-.093,.086],[.275,.049,-.064,.058],[.284,.015,-.024,.025],[.285,.004,-.012,.009]
 ],{shape:1.03,fold:.0022});
 const hem=meridianVolume(a,'wrapShade',[
  [.176,.092,-.110,.105],[.180,.096,-.113,.108],[.192,.097,-.115,.110],[.196,.095,-.114,.109]
 ],{fold:.0013});
 for(const v of [.23,.79])meridianSeam(a,'wrapEdge',Array.from({length:30},(_,i)=>hem(i/29,v)),.0013);
 for(const u of [.10,.40,.62,.87]){
  const seam=Array.from({length:14},(_,i)=>{
   const p=cap(u,.19+i*.056);p[0]+=.0009*Math.cos(u*Math.PI*2);p[2]+=.0009*Math.sin(u*Math.PI*2);return p;
  });
  meridianSeam(a,'wrapEdge',seam,.0012);
 }
 meridianVolume(a,'wrapShade',[
  [-.054,.007,-.008,.010],[-.037,.014,-.013,.012],[-.005,.020,-.020,.015],[.011,.010,-.012,.010]
 ],{offset:[-.025,.183,-.107],roll:-.31,fold:.002});
 meridianSeam(a,'wrap',[[.002,.180,-.116],[.030,.170,-.126],[.045,.138,-.119]],.008);
}
function meridianBaredArm(side,part,length){
 return (a,rod,G)=>{
  const upper=part==='arm',proportions=upper?[
   [-1.12,.034,-.032,.032,-.006],[-.94,.056,-.053,.047,-.008],[-.78,.059,-.057,.056,-.007],
   [-.53,.068,-.070,.075,-.003],[-.31,.080,-.075,.082,.004],[-.13,.086,-.083,.083,.012],
   [.02,.078,-.075,.073,.008],[.102,.061,-.066,.058,-.013],[.169,.041,-.050,.043,-.029],[.197,.008,-.008,.014,-.049]
  ]:[
   [-1.06,.024,-.023,.023,.001],[-.98,.033,-.032,.032,.002],[-.86,.039,-.038,.041,.003],[-.66,.042,-.048,.050,0],
   [-.44,.053,-.058,.057,-.006],[-.21,.056,-.061,.055,-.007],[-.04,.053,-.055,.047,-.007],
   [.09,.040,-.043,.032,-.008],[.15,.014,-.015,.013,-.007]
  ];
  const skin=meridianVolume(a,'skin',proportions.map(([y,w,b,f,x])=>[y*length,w,b,f,side*x]));
  const paint=(from,to,edge)=>{
   const center=side>0?.09:.43,span=upper?.28:1;
   meridianSurface(a,'fieldPaint',(u,v)=>{
    const angle=center+(u-.5)*span,lift=.053*Math.sin(u*Math.PI*2)+.009*Math.sin(u*Math.PI*6+edge);
    const p=skin(angle,from+(to-from)*v+lift),rad=angle*Math.PI*2;
    p[0]+=.0012*Math.cos(rad);p[2]+=.0012*Math.sin(rad);
    return p;
   },{rows:5,cols:16,reverse:true});
  };
  if(upper){
   paint(.53,.59,2);paint(.65,.72,1);
   if(side<0)meridianVolume(a,'canvas',[
    [-.70*length,.063,-.061,.066,-.006*side],[-.64*length,.071,-.066,.072,-.003*side],
    [-.54*length,.073,-.073,.079,-.003*side],[-.51*length,.067,-.069,.077,-.003*side]
   ],{fold:.0012});
  }else{
   paint(.35,.421,1);paint(.493,.553,2);
   const cuff=meridianVolume(a,'canvas',[
    [-1.05*length,.042,-.041,.041],[-.96*length,.044,-.043,.045],
    [-.84*length,.048,-.047,.050],[-.72*length,.053,-.053,.054]
   ],{shape:.88,fold:.0019});
   for(const v of [.10,.24,.87]){
    const edge=Array.from({length:19},(_,i)=>cuff(i/18,v));
    meridianSeam(a,'gloveThread',edge,.0012);
   }
   meridianVolume(a,'armor',[
    [-1.00*length,.024,-.055,-.029],[-.94*length,.032,-.065,-.027],
    [-.78*length,.039,-.077,-.031],[-.68*length,.035,-.076,-.039],[-.63*length,.021,-.066,-.042]
   ],{shape:.67,offset:[side*.011,0,0],yaw:side*.33});
   for(const x of [-.025,.020])a('blackMetal',G.ss,.0036,.004,.0025,x,-.77*length,-.075);
   const cuffEdge=Array.from({length:12},(_,i)=>{
    const p=cuff(.49+i*.040,.29+i*.47/11);
    p[2]-=.0015;return p;
   });
   meridianSeam(a,'blackMetal',cuffEdge,.0022);
  }
 };
}
function meridianPelvis(a,rod,G){
 meridianVolume(a,'fabric',[
  [.795,.076,-.079,.061],[.846,.118,-.094,.077],[.919,.161,-.108,.102],
  [.979,.169,-.114,.110],[1.049,.155,-.095,.109]
 ],{shape:.84,fold:.0034});
 const belt=meridianVolume(a,'leather',[
  [.951,.168,-.117,.119],[.959,.173,-.121,.124],[.994,.168,-.117,.123],[1.002,.163,-.112,.121]
 ],{shape:.78});
 for(const y of [.18,.80])meridianSeam(a,'thread',Array.from({length:25},(_,i)=>belt(i/24,y)),.0017);
 for(const t of [.07,.17,.32,.43,.63,.78,.92]){
  const [x,,z]=belt(t,.47),angle=t*Math.PI*2;
  operatorBlock(a,'canvas',.019,.064,.008,x+.003*Math.cos(angle),.976,z+.003*Math.sin(angle),0,Math.PI*.5-angle);
 }
 const buckle=[[-.035,.962,.127],[-.035,.987,.129],[.021,.988,.131],[.021,.962,.128],[-.035,.962,.127]];
 meridianSeam(a,'blackMetal',buckle,.004);
 rod('blackMetal',-.033,.977,.131,.011,.976,.132,.003);
 for(let i=0;i<4;i++)a('seamShade',G.ss,.0028,.0028,.0015,.032+i*.013,.975,.125-i*.001);
 meridianPouch(a,.151,.936,-.075,.065,.098,.047,.18,1.85);
}
function meridianLeg(side,part){
 return (a,rod,G)=>{
  if(part==='leg'){
   const thigh=meridianVolume(a,'fabric',[
    [-.481,.052,-.060,.057],[-.425,.060,-.059,.070],[-.358,.067,-.065,.068],
    [-.281,.075,-.068,.076],[ -.188,.085,-.079,.084,side*.005],
    [-.090,.092,-.092,.081,side*.001],[.036,.080,-.085,.068,-side*.009]
   ],{shape:.90,fold:.0055});
   const outside=side>0?.025:.475;
   meridianSeam(a,'seamShade',Array.from({length:14},(_,i)=>{
    const p=thigh(outside,i/13);p[0]+=.0015*side;return p;
   }),.002);
   if(side>0){
    meridianPouch(a,side*.069,-.186,.039,.090,.180,.057,-side*.15,side*1.05);
   }else{
    const band=meridianVolume(a,'canvas',[
     [-.296,.078,-.072,.079],[-.285,.081,-.076,.082],[-.258,.084,-.077,.085],[-.25,.079,-.073,.080]
    ],{shape:.9});
    meridianSeam(a,'thread',Array.from({length:22},(_,i)=>band(i/21,.81)),.0016);
    meridianPouch(a,side*.046,-.118,.077,.061,.111,.028,-.14,-.42);
    a('blackMetal',G.ss,.011,.012,.003,side*.062,-.267,.079);
   }
  }else{
   meridianVolume(a,'fabric',[
    [-.351,.046,-.050,.047],[-.260,.052,-.055,.049],[-.163,.064,-.069,.058],
    [-.077,.069,-.071,.071],[-.005,.062,-.057,.072],[.058,.045,-.043,.052]
   ],{shape:.93,fold:.0058});
   const boot=meridianVolume(a,'bootLeather',[
    [-.465,.066,-.081,.179],[-.449,.074,-.084,.181],[-.425,.072,-.080,.171],
    [-.406,.066,-.075,.150],[-.375,.057,-.068,.101],[-.329,.055,-.057,.071],
    [-.272,.057,-.063,.057],[-.195,.064,-.068,.061],[-.160,.064,-.068,.060]
   ],{shape:.81,fold:.0023});
   meridianVolume(a,'sole',[
    [-.479,.069,-.084,.184],[-.476,.073,-.087,.188],[-.458,.076,-.088,.187],[-.449,.072,-.084,.181]
   ],{shape:.67});
   meridianVolume(a,'canvas',[
    [-.192,.063,-.067,.065],[-.177,.069,-.072,.067],[-.155,.070,-.072,.067],[-.144,.065,-.067,.060]
   ],{shape:.88,fold:.0013});
   for(const u of [.10,.39,.60,.90]){
    const points=Array.from({length:12},(_,i)=>{
     const p=boot(u,.06+i*.076);p[0]+=.002*Math.cos(u*Math.PI*2);p[2]+=.002*Math.sin(u*Math.PI*2);return p;
    });
    meridianSeam(a,'bootThread',points,.0014);
   }
   const kneepad=(u,v)=>{
    const t=u*2-1,y=-.157+.208*v+(.033-.047*v)*t*t;
    const w=.035+.026*Math.sin(v*Math.PI)+.004*v;
    return [w*t,y,.068+.036*Math.sin(v*Math.PI*.83)-.032*t*t+.007*Math.sin(v*9)*(1-t*t)];
   };
   meridianVolume(a,'canvas',[
    [-.105,.061,-.072,.075],[-.092,.071,-.077,.077],[-.070,.074,-.076,.083],[-.058,.070,-.074,.084]
   ],{shape:.84});
   meridianSurface(a,'armor',kneepad,{rows:18,cols:18});
   for(const u of [0,1])meridianSeam(a,'edge',Array.from({length:13},(_,i)=>kneepad(u,i/12)),.0021);
   meridianSeam(a,'seamShade',[kneepad(.18,.57),kneepad(.34,.52),kneepad(.66,.52),kneepad(.82,.57)],.0017);
   for(const u of [.16,.84]){
    const [x,y,z]=kneepad(u,.74);
    a('blackMetal',G.ss,.004,.004,.0024,x,y,z+.001);
   }
   for(let i=0;i<5;i++){
    const l=boot(.35,.21+i*.079),r=boot(.15,.27+i*.079);
    a('blackMetal',G.ss,.0038,.0032,.0028,l[0],l[1],l[2]+.002);
    a('blackMetal',G.ss,.0038,.0032,.0028,r[0],r[1],r[2]+.002);
    meridianSeam(a,'bootThread',[[l[0],l[1],l[2]+.003],[0,(l[1]+r[1])*.5,Math.max(l[2],r[2])+.014],[r[0],r[1],r[2]+.003]],.0019);
   }
   for(const s of [-1,1])for(let i=0;i<7;i++){
    const z=-.066+i*.035,x=s*(.066+.003*Math.sin(i*.5));
    a('sole',G.bx,.015,.012,.015,x,-.476,z,0,s*.20,s*.12);
   }
  }
 };
}

let meridianCamoTexture;
function meridianCamo(){
 if(meridianCamoTexture)return meridianCamoTexture;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=384;
 const ctx=canvas.getContext('2d'),palette=['#a09d90','#878479','#aead9f','#777b73','#b5b0a4'];
 ctx.fillStyle=palette[0];ctx.fillRect(0,0,384,384);
 for(let i=0;i<149;i++){
  const x=(i*71+i*i*3)%384,y=(i*31+i*i*2)%384,w=6*(2+i%6),h=4*(1+i%8);
  ctx.fillStyle=palette[i%palette.length];
  for(const dx of [0,-384])for(const dy of [0,-384]){
   ctx.fillRect(x+dx,y+dy,w,h);
   ctx.fillRect(x+6+dx,y-4+dy,Math.max(5,w-14),h+10);
  }
 }
 for(let i=0;i<15400;i++){
  ctx.fillStyle=i%2?'rgba(33,32,28,.10)':'rgba(217,211,185,.19)';
  ctx.fillRect((i*13.97+i*i*.203)%384,(i*27.9+i*i*.101)%384,1+i%3,1);
 }
 for(let row=0;row<384;row+=4){
  ctx.fillStyle='rgba(29,31,28,.075)';ctx.fillRect(0,row,384,1);
 }
 const map=new THREE.CanvasTexture(canvas);map.encoding=THREE.sRGBEncoding;
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(3.5,2.2);map.anisotropy=4;
 return meridianCamoTexture=map;
}

function operatorTorso(id){
 if(id==='keywarden')return keywardenTorso;
 if(id==='meridian')return meridianTorso;
 return (a,rod,G)=>{
  const gear=operatorEquipment[id],plate=gear.plate,bodyWidth=gear.heavy?1.09:gear.low?.93:1;
  const plated=!['crosswind','surveyor','lantern'].includes(id);
  operatorPanel(a,'fabric',[
   [-.072,.282,-.075,.087,.042],[-.026,.318,-.105,.095,.052],[.109,.305,-.109,.109,.062],
   [.23,.322,-.123,.131,.068],[.396,.404,-.126,.144,.079],[.492,.444,-.110,.126,.079],
   [.535,.366,-.091,.100,.071],[.572,.22,-.068,.077,.052]
  ].map(([y,w,b,f,r])=>[y,w*bodyWidth,b,f,r]));
  // Short overlapping shoulder fabric prevents gaps at the ragdoll and aim extremes.
  for(const side of [-1,1])operatorPanel(a,'fabric',[
   [-.067,.082,-.067,.068,.037],[.005,.148,-.071,.077,.054],[.058,.127,-.059,.068,.048]
  ],[side*.218,.465,-.004],-side*.42);
  operatorPanel(a,'stitch',[
   [.525,.175,-.075,.098,.033],[.557,.176,-.081,.091,.032],[.606,.133,-.069,.073,.031],[.642,.114,-.060,.061,.027]
  ]);
  operatorPanel(a,'fabric',[[.59,.113,-.047,.064,.026],[.677,.099,-.041,.055,.024],[.704,.103,-.046,.056,.022]]);
  if(plated)operatorPanel(a,'stitch',[
   [.119,plate*.81,-.132,.15,.043],[.182,plate*1.04,-.143,.173,.049],
   [.432,plate*1.08,-.144,.174,.055],[.497,plate*.77,-.10,.115,.045]
  ]);
  if(plated)operatorPanel(a,'armor',[
   [.223,plate*.88,.119,.169,.024],[.269,plate,.129,.196,.034],[.424,plate*.89,.126,.188,.031],
   [.478,plate*.58,.112,.149,.025]
  ]);
  for(const side of [-1,1]){
   rod('stitch',side*plate*.43,.352,.145,side*.139,.509,.039,.022);
   rod('stitch',side*.144,.511,.038,side*.124,.424,-.135,.023);
   operatorBlock(a,'trim',.024,.049,.016,side*.143,.437,.151,-.29,0,side*.12);
   operatorBlock(a,'stitch',.113,.030,.022,side*.139,.174,.121,0,side*-.63,0);
  }
  for(let i=0;i<gear.pockets;i++){
   const x=(i-(gear.pockets-1)/2)*.092+(id==='crosswind'?.06:0),z=(plated?.192:.152)-Math.abs(x)*.1;
   const y=plated?.211:.176;
   const height=gear.heavy?.149:.123;
   operatorBlock(a,'stitch',.072,height+.018,.080,x,y,z,-.085,0,.018*x);
   operatorBlock(a,'fabric',.071,height,.063,x,y+.003,z+.02,-.085,0,0);
   operatorBlock(a,'armor',.072,.028,.067,x,y+.018+height*.43,z+.023,-.11,0,0);
   operatorBlock(a,'trim',.012,.021,.009,x,y+.012+height*.25,z+.057,0,0,0);
  }
  // Carrier webbing, medical pouch, harness fasteners and back equipment.
  if(plated)for(let i=0;i<4;i++)operatorBlock(a,'stitch',.20,.007,.008,0,.294+i*.026,.192,0,0,0);
  operatorPanel(a,'armor',[
   [.188,.20,-.211,-.098,.035],[.232,gear.pack?.282:.243,-.239,-.117,.038],
   [.405,gear.pack?.286:.249,-.235,-.111,.045],[.475,.17,-.205,-.099,.033]
  ]);
  for(const side of [-1,1])rod('stitch',side*.09,.244,-.239,side*.098,.413,-.236,.011);
  if(gear.radio){
   operatorBlock(a,'stitch',.069,.142,.047,-.136,.361,-.174,-.1,0,0);
   operatorBlock(a,'armor',.046,.108,.061,-.136,.373,-.190,-.1,0,0);
   rod('stitch',-.16,.418,-.185,-.19,.694,-.169,.006);
   rod('stitch',-.135,.382,-.197,-.15,.508,-.086,.005);
  }
  if(gear.badge){
   const ring=new THREE.TorusGeometry(.044,.004,7,20);
   a('trim',ring,1,1,1,-.085,.428,.184,0,0,-.14);
   rod('trim',-.085,.426,.189,-.078,.452,.189,.003);
   rod('trim',-.085,.426,.189,-.105,.417,.189,.003);
  }else{
   operatorBlock(a,'trim',.059,.021,.006,-.096,.43,.181,0,0,-.04);
   operatorBlock(a,'stitch',.038,.006,.007,-.102,.43,.184,0,0,-.04);
  }
  operatorFieldKit(id,a,rod,G);
 };
}

function operatorFieldKit(id,a,rod,G){
 const block=(mat,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>operatorBlock(a,mat,w,h,d,x,y,z,rx,ry,rz);
 switch(id){
 case 'breaker':
  operatorPanel(a,'armor',[[.055,.235,.116,.182,.021],[.110,.315,.128,.205,.033],[.197,.350,.129,.204,.034],[.233,.323,.134,.201,.034]]);
  for(const side of [-1,1]){
   block('armor',.052,.211,.118,side*.169,.334,-.057,0,-side*.12,-side*.12);
   block('trim',.034,.137,.018,side*.176,.377,.150,-.16,side*.22,-side*.17);
  }
  break;
 case 'peregrine':
  rod('trim',-.168,.092,-.030,.095,.552,.099,.013);
  block('armor',.051,.080,.044,.129,.310,.194,0,-.20,.53);
  block('stitch',.146,.181,.062,.060,.326,-.243,.10,.13,-.09);
  break;
 case 'lantern':
  rod('stitch',0,.113,.139,0,.509,.097,.006);
  for(const side of [-1,1])operatorPanel(a,'armor',[[.247,.073,.106,.152,.016],[.340,.112,.104,.159,.021],
   [.404,.102,.077,.137,.019],[.464,.063,.062,.112,.015]], [side*.104,0,0],side*.13,0,side*.18);
  for(const side of [-1,1]){
   a('armor',G.cy,.046,.297,.047,side*.102,.322,-.240,.12,0,-side*.084);
   for(const y of [.23,.42])a('stitch',G.cy,.050,.023,.050,side*.105,y,-.252,.1,0,-side*.08);
   rod('trim',side*.102,.466,-.235,side*.164,.505,-.033,.017);
   rod('stitch',side*.164,.505,-.033,side*.118,.59,.074,.012);
  }
  break;
 case 'surveyor':
  operatorPanel(a,'fabric',[[.151,.286,-.124,.140,.055],[.242,.358,-.138,.148,.062],
   [.428,.425,-.133,.138,.078],[.498,.377,-.107,.115,.073]]);
  rod('stitch',.121,.44,.108,-.072,.265,.148,.009);
  block('fabric',.104,.324,.084,.150,.244,-.076,.11,.42,-.1);
  block('trim',.071,.177,.045,-.140,.222,.091,-.14,-.49,.19);
  for(const y of [.306,.344,.385])rod('stitch',-.105,y,.181,.11,y-.018,.188,.004);
  break;
 case 'crosswind':
  operatorPanel(a,'fabric',[[.145,.073,.168,.217,.016],[.159,.099,.169,.222,.023],
   [.348,.095,.151,.210,.017],[.452,.080,.121,.166,.017]], [0,.027,.008],-.39);
  block('stitch',.097,.054,.048,.091,.347,.209,-.12,0,-.39);
  break;
 case 'machinist':
  block('stitch',.230,.259,.104,0,.356,-.239,.06,0,0);
  for(let i=0;i<7;i++)block('armor',.180,.012,.038,0,.254+i*.030,-.301,.06,0,0);
  block('trim',.110,.055,.028,.096,.396,.161,-.17,.24,-.16);
  rod('stitch',.108,.397,.168,.208,.531,-.028,.010);
  break;
 case 'bellwatch':
  a('armor',G.cy,.060,.021,.060,0,.397,.196,Math.PI/2);
  a('trim',G.cy,.047,.010,.047,0,.397,.209,Math.PI/2);
  a('stitch',G.cy,.039,.012,.039,0,.397,.216,Math.PI/2);
  rod('trim',0,.397,.226,-.016,.410,.226,.003);
  rod('trim',0,.397,.226,.021,.385,.226,.003);
  break;
 case 'estatewarden':
  for(const side of [-1,1])operatorPanel(a,'fabric',[
   [-.218,.115,-.236,-.160,.022],[-.136,.140,-.230,-.149,.027],[.027,.125,-.213,-.135,.027],[.117,.113,-.211,-.137,.030]
  ],[side*.073,0,0],side*.21);
  rod('trim',-.114,.543,.046,-.194,.277,-.131,.009);
  rod('trim',.140,.543,.066,.176,.31,-.118,.009);
  break;
 }
}

function operatorHead(id){
 if(id==='keywarden')return keywardenHead;
 if(id==='meridian')return meridianHead;
 return (a,rod,G)=>{
  const {helmet,filter,heavy,low}=operatorEquipment[id];
  operatorPanel(a,'skin',[
   [.011,.087,-.052,.066,.024],[.043,.138,-.072,.093,.030],[.075,.169,-.078,.109,.043],
   [.121,.173,-.09,.106,.045],[.165,.171,-.093,.101,.044],[.211,.155,-.079,.077,.042],[.228,.101,-.058,.057,.032]
  ]);
  operatorPanel(a,'stitch',[
   [.006,.093,-.051,.071,.022],[.037,.143,-.076,.100,.034],[.087,.182,-.091,.118,.044],
   [.122,.170,-.082,.109,.034]
  ]);
  if(helmet==='cap'||helmet==='hood'){
   const cap=helmet==='cap';
   operatorPanel(a,'fabric',[
    [.043,cap?.181:.205,-.103,.048,.048],[.121,.213,-.114,.072,.055],[.18,.221,-.116,.100,.057],
    [.224,.201,-.108,.091,.058],[.268,.153,-.082,.069,.050],[.284,.084,-.047,.041,.027]
   ]);
   if(cap)operatorPanel(a,'armor',[[.157,.176,.056,.133,.032],[.172,.215,.051,.168,.036],[.186,.217,.050,.159,.032]]);
   else for(const side of [-1,1])rod('stitch',side*.09,.072,.060,side*.087,.212,.079,.009);
  }else{
   const width=heavy?.255:low?.213:.233,top=helmet==='bell'?.292:.269;
   operatorPanel(a,'armor',[
    [.108,width*.82,-.107,.055,.042],[.137,width,-.129,.106,.058],[.174,width*.98,-.133,.125,.060],
    [.211,width*.92,-.124,.102,.059],[top-.017,width*.76,-.101,.079,.056],[top,width*.51,-.069,.046,.038]
   ]);
   for(const side of [-1,1]){
    operatorBlock(a,'stitch',.025,.104,.086,side*width*.445,.113,-.047,.19,0,0);
    operatorBlock(a,'armor',.016,.074,.071,side*width*.505,.114,-.049,.19,0,0);
    rod('stitch',side*.102,.13,-.013,side*.078,.037,.052,.007);
    for(const dy of [-.012,.014])operatorBlock(a,'trim',.008,.007,.033,side*width*.544,.115+dy,-.046,.16,0,0);
   }
   if(helmet==='recon'||helmet==='service')rod('stitch',-.091,.159,-.068,-.132,.324,-.088,.005);
  }
  if(filter||helmet==='assault'){
   operatorPanel(a,'armor',[[.016,.092,.071,.107,.018],[.045,.161,.070,.131,.032],[.096,.164,.069,.126,.034],[.124,.127,.082,.111,.024]]);
   for(const side of [-1,1]){
    if(filter){
     a('stitch',G.cy,.032,.042,.032,side*.056,.060,.118,Math.PI/2,side*.34);
     a('trim',G.cy,.026,.010,.026,side*.061,.060,.140,Math.PI/2,side*.34);
    }else for(let i=0;i<3;i++)operatorBlock(a,'stitch',.025,.005,.009,side*.049,.047+i*.012,.129,0,side*.34,0);
   }
  }
  const visorY=.138;
  for(const side of [-1,1]){
   operatorPanel(a,'stitch',[
    [-.025,.061,-.006,.018,.010],[-.014,.077,-.010,.026,.015],[.011,.080,-.012,.028,.015],[.024,.064,-.007,.019,.010]
   ],[side*.041,visorY,.108],-side*.065,0,side*.18);
   operatorPanel(a,'optic',[
    [-.011,.057,.014,.023,.009],[-.006,.068,.015,.029,.010],[.011,.066,.012,.027,.010],[.015,.054,.012,.023,.009]
   ],[side*.041,visorY+.001,.114],-side*.065,0,side*.18);
  }
  operatorBlock(a,'stitch',.025,.013,.016,0,visorY+.006,.127);
  if(helmet==='service'){
   const glass=new THREE.SphereGeometry(.03,14,8);
   a('stitch',G.cy,.037,.031,.037,-.050,.142,.151,Math.PI/2);
   a('optic',glass,1,.69,.22,-.050,.142,.171);
  }
  if(helmet==='bell'){
   operatorPanel(a,'trim',[[.216,.124,.067,.103,.016],[.224,.167,.061,.110,.023],[.235,.141,.060,.099,.021]]);
   for(const side of [-1,1])rod('trim',side*.069,.225,.068,side*.086,.208,-.093,.004);
  }
  if(helmet==='patrol'||helmet==='service')rod('stitch',.108,.094,-.014,.036,.053,.122,.0045);
 };
}

function operatorPelvis(a,rod,G){
 operatorPanel(a,'fabric',[
  [.801,.169,-.067,.074,.039],[.859,.228,-.088,.082,.052],[.929,.307,-.113,.100,.059],
  [.996,.314,-.107,.105,.056],[1.049,.279,-.089,.090,.047]
 ]);
 operatorPanel(a,'stitch',[[.938,.285,-.111,.108,.046],[.951,.325,-.117,.112,.05],[1.003,.321,-.114,.115,.05],[1.014,.290,-.095,.101,.046]]);
 operatorBlock(a,'armor',.057,.043,.019,.004,.975,.116);
 operatorBlock(a,'trim',.027,.015,.006,.004,.975,.130);
 for(const side of [-1,1]){
  operatorBlock(a,'armor',.077,.098,.078,side*.153,.932,-.013,0,side*.16,side*.11);
  operatorBlock(a,'stitch',.069,.071,.084,side*.089,.924,-.094,0,0,side*.06);
 }
}

const operatorLimbProfiles={
 arm:[[.07,.060,-.049,.055],[.015,.145,-.073,.079],[-.18,.155,-.076,.087],[-.44,.137,-.071,.071],[-.72,.119,-.066,.062],[-.94,.108,-.050,.053],[-1.045,.097,-.048,.045]],
 forearm:[[.06,.089,-.044,.037],[-.05,.123,-.059,.062],[-.23,.131,-.059,.062],[-.46,.122,-.054,.054],[-.72,.102,-.048,.047],[-.94,.085,-.041,.045],[-1.035,.079,-.039,.039]],
 leg:[[.03,.137,-.062,.071],[-.12,.169,-.090,.086],[-.38,.154,-.078,.081],[-.64,.141,-.062,.070],[-.90,.116,-.058,.074],[-1.04,.106,-.050,.062]],
 shin:[[.06,.099,-.053,.071],[-.025,.115,-.063,.081],[-.29,.126,-.068,.070],[-.51,.112,-.057,.054],[-.82,.095,-.050,.063],[-.98,.094,-.053,.073]]
};
const operatorSectionLengths={arm:.36,forearm:.36,leg:.46,shin:.46};
function operatorGear(id,side,part,length=operatorSectionLengths[part]){
 if(id==='keywarden')return keywardenLimb(side,part,length);
 if(id==='meridian')return part==='arm'||part==='forearm'?meridianBaredArm(side,part,length):meridianLeg(side,part);
 const kit=operatorEquipment[id],scale=length/operatorSectionLengths[part],width=kit.heavy?1.07:kit.low?.95:1;
 return (a,rod,G)=>{
  operatorPanel(a,'fabric',operatorLimbProfiles[part].map(([y,w,b,f])=>[y*length,w*width,b*width,f*width,Math.min(w*.29,.039)]).reverse());
  const y=part==='arm'?-.072*scale:part==='forearm'?-.205*scale:part==='leg'?-.228:-.04;
  const pad=(w,h,d,x,y,z,roll=0)=>operatorBlock(a,'armor',w*width,h,d,x,y,z,0,0,roll);
  if(part==='arm'){
   if(!kit.soft){
    operatorPanel(a,'armor',[[-.096,.081,.034,.086,.022],[-.062,.115,.04,.105,.029],[.011,.123,.04,.113,.036],[.041,.088,.046,.090,.026]], [side*.028,y+.038,0],side*.125);
   }
   operatorBlock(a,'stitch',.075,.046,.009,side*.023,y-.04,.092,0,0,side*.12);
   operatorBlock(a,'trim',.046,.013,.010,side*.022,y-.038,.099,0,0,side*.12);
   if(kit.heavy)for(const dy of [-.030,.044])pad(.107,.053,.023,side*.045,y+dy,.091,side*.10);
  }else if(part==='forearm'){
   operatorPanel(a,'stitch',[[-1.035*length,.083,-.047,.047,.022],[-.918*length,.096,-.049,.049,.023],[-.86*length,.097,-.045,.048,.023]]);
   if(!kit.soft)pad(id==='machinist'?.11:.090,.141*scale,.028,side*.021,y,-.063,-side*.085);
   else operatorBlock(a,'stitch',.054,.101*scale,.008,side*.024,y,-.059,0,0,side*.10);
   if(kit.heavy||kit.radio)operatorBlock(a,'trim',.020,.074*scale,.010,side*.014,y,-.083,0,0,side*.11);
   if(id==='machinist')for(let i=0;i<4;i++)pad(.068,.011,.027,side*.011,y+(.037-i*.022)*scale,-.085,side*.11);
   for(const yy of [-.092,.096])rod('stitch',-.032,y+yy*scale,-.057,.046,y+yy*scale,-.05,.004);
  }else if(part==='leg'){
   operatorBlock(a,'stitch',.069,.133,.019,side*.046,y,.078,0,side*.28,-side*.16);
   if(!kit.low)pad(kit.heavy?.105:.079,.154,.030,side*.051,y+.026,.089,side*.16);
   rod('stitch',side*.074,.005,.043,side*.059,-.395,.048,.003);
  }else{
   pad(.120,.116,.039,0,y,.085,0);
   operatorBlock(a,'stitch',.090,.028,.015,0,y-.064,.089);
   operatorPanel(a,'stitch',[
    [-.475,.110,-.071,.173,.033],[-.454,.129,-.075,.195,.038],[-.411,.126,-.072,.185,.040],
    [-.370,.105,-.064,.119,.035],[-.305,.097,-.056,.066,.027]
   ]);
   operatorBlock(a,'stitch',.132,.025,.266,0,-.471,.060);
   for(const yy of [-.410,-.390,-.366])rod('trim',-.034,yy,.109,.032,yy+.004,.108,.0032);
  }
 };
}

let operatorKeyGeometry;
function operatorKey(a,material,x,y,z,sx,sy,sz,roll=0,yaw=0,pitch=0){
 operatorKeyGeometry??=jupiterKeyMesh(0xffca57,0x452c11).geometry;
 a(material,operatorKeyGeometry,sx,sy,sz,x,y,z,pitch,yaw,roll);
}
function keywardenTorso(a){
 for(const side of [-1,1]){
  operatorKey(a,'armor',side*.125,.263,.009,.246,.278,.63,-side*.38,side*.23);
  operatorKey(a,'fabric',side*.129,.276,-.078,.210,.254,.35,side*.58,Math.PI-side*.32);
  operatorKey(a,'trim',side*.206,.476,.038,.161,.135,.48,side*1.02,side*.34);
  operatorKey(a,'stitch',side*.041,.504,-.014,.109,.130,.56,-side*.4,side*.56);
 }
 operatorKey(a,'trim',0,.265,.087,.333,.299,.48,0);
 operatorKey(a,'fabric',0,.265,-.105,.277,.250,.34,.25,Math.PI);
 operatorKey(a,'armor',0,.493,.090,.212,.169,.35,Math.PI*.5);
 operatorKey(a,'trim',0,.576,.015,.102,.116,.59,0,0,.14);
}
function keywardenHead(a){
 operatorKey(a,'trim',0,.137,.044,.273,.173,.67,0,0,-.11);
 operatorKey(a,'armor',0,.161,-.054,.251,.163,.59,.14,Math.PI,-.14);
 for(const side of [-1,1]){
  operatorKey(a,'fabric',side*.087,.135,-.003,.087,.161,.45,-side*.21,side*.83);
  operatorKey(a,'armor',side*.061,.207,.112,.081,.074,.22,side*1.23,side*.18);
  operatorKey(a,'optic',side*.038,.219,.135,.066,.039,.23,side*1.34,side*.12);
 }
 operatorKey(a,'armor',0,.018,.093,.141,.063,.33,Math.PI*.5);
}
function keywardenHip(a){
 for(const side of [-1,1]){
  operatorKey(a,'armor',side*.081,.931,-.010,.184,.121,.62,side*.59,side*.55);
  operatorKey(a,'trim',side*.066,.972,.068,.136,.079,.41,side*1.24);
  operatorKey(a,'fabric',side*.085,.961,-.071,.105,.10,.45,side*.5,Math.PI-side*.42);
 }
 operatorKey(a,'trim',0,.931,.088,.109,.079,.32,.15);
}
function keywardenLimb(side,part,length){
 const joint=part==='arm'||part==='leg',shin=part==='shin',size=shin||part==='leg'?1.12:1;
 return a=>{
  operatorKey(a,'armor',0,-length*.425,0,.159*size,length*.321,.52,.09*side,.21*side);
  operatorKey(a,'trim',side*.034,-length*.47,.057,.166*size,length*.32,.24,-side*.18,side*.12);
  operatorKey(a,'fabric',-side*.019,-length*.60,-.046,.139*size,length*.27,.35,side*.21,Math.PI-side*.33);
  operatorKey(a,joint?'trim':'armor',side*.026,-length*.12,.028,.160*size,length*.19,.46,side*.66,side*.72);
  operatorKey(a,'stitch',0,-length*.83,.010,.112*size,length*.17,.45,-side*.38,side*.58);
  if(shin)for(const offset of [-.034,.034]){
   operatorKey(a,'trim',offset,-length+.019,.075,.119,.143,.36,side*.07,side*.09,-Math.PI/2);
  }
 };
}
function keywardenHand(side){
 return a=>{
  operatorKey(a,'armor',0,-.058,0,.118,.058,.33,Math.PI,.2);
  operatorKey(a,'trim',0,-.067,-.025,.126,.054,.25,Math.PI,Math.PI);
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.021;
   operatorKey(a,i%2===0?'armor':'trim',x,-.117,.023,.052,.044-.004*Math.abs(i-1),.28,.10*(i-1.5),0,.69);
   operatorKey(a,'fabric',x,-.130,.056,.039,.028,.21,.10*(i-1.5),0,1.30);
  }
  operatorKey(a,'trim',-side*.043,-.065,.039,.064,.051,.34,side*.62,side*.26,.56);
 };
}

function operatorFinger(path){
 const vertices=[],texels=[],faces=[],sides=10;
 for(let row=0;row<path.length;row++){
  const [x,y,z,r]=path[row],before=path[Math.max(0,row-1)],after=path[Math.min(path.length-1,row+1)];
  const tangent=V(after[0]-before[0],after[1]-before[1],after[2]-before[2]).normalize();
  const right=V(1,0,0).addScaledVector(tangent,-tangent.x).normalize(),up=right.clone().cross(tangent);
  for(let col=0;col<sides;col++){
   const angle=col*Math.PI*2/sides,point=V(x,y,z).addScaledVector(right,Math.cos(angle)*r).addScaledVector(up,Math.sin(angle)*r*.81);
   vertices.push(point.x,point.y,point.z);texels.push(col/sides,row/(path.length-1));
   if(row<path.length-1){
    const left=row*sides+col,next=row*sides+(col+1)%sides;
    faces.push(left,left+sides,next,next,left+sides,next+sides);
   }
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(texels,2));
 geometry.setIndex(faces);geometry.computeVertexNormals();
 return geometry;
}

function operatorGlove(side,trigger,fingerless){
 return (a,rod)=>{
  operatorPanel(a,'palm',[
   [-.110,.075,-.025,.029,.022],[-.097,.087,-.032,.032,.028],[-.069,.094,-.033,.032,.032],
   [-.045,.086,-.031,.031,.028],[-.019,.066,-.031,.025,.023],[.014,.071,-.026,.023,.021]
  ]);
  operatorPanel(a,'trim',[
   [-.096,.072,-.040,-.026,.007],[-.084,.078,-.044,-.029,.009],
   [-.058,.067,-.043,-.030,.009],[-.037,.054,-.033,-.026,.006]
  ]);
  operatorPanel(a,'stitch',[[-.026,.071,-.030,.028,.024],[-.017,.076,-.032,.031,.024],[.012,.075,-.029,.027,.023]]);
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.0217,tip=[.001,.0,.011,.022][i],r=[.011,.012,.011,.009][i];
   const index=trigger&&((side>0&&i===0)||(side<0&&i===3));
   const path=[
    [x,-.087,-.009,r*.84],[x,-.102,-.007,r*1.04],[x*1.057,-.124+tip*.24,-.004,r],
    [x*1.07,-.149+tip*.5,index?.004:.014,r*.93],[x*1.09,-.155+tip*.64,index?.020:.040,r*.85],
    [x*1.1,-.145+tip*.77,index?.041:.057,r*.77],[x*1.1,-.131+tip*.82,index?.055:.062,r*.57],
    [x*1.1,-.127+tip*.82,index?.057:.061,.001]
   ];
   a('palm',operatorFinger(fingerless?path.slice(0,5):path),1,1,1,0,0,0);
   if(fingerless)a('finger',operatorFinger(path.slice(4)),1,1,1,0,0,0);
   rod('stitch',x-r*.62,-.115+tip*.25,-.014,x+r*.62,-.115+tip*.25,-.014,.0014);
  }
  const x=-side*.040;
  const thumb=[[x*.63,-.052,.008,.008],[x*.91,-.065,.013,.016],[x*1.17,-.076,.027,.013],
   [x*1.12,-.087,.045,.011],[x*.94,-.098,.053,.010],[x*.71,-.103,.056,.007],[x*.58,-.104,.055,.001]];
  a('palm',operatorFinger(fingerless?thumb.slice(0,4):thumb),1,1,1,0,0,0);
  if(fingerless)a('finger',operatorFinger(thumb.slice(3)),1,1,1,0,0,0);
  for(const x of [-.026,.026])rod('stitch',x,-.041,-.031,x*.87,-.090,-.038,.0015);
 };
}

function meridianGlove(side,trigger,M){
 const model=new THREE.Group(),build=operatorGlove(side,trigger,true);
 HV.put(model,'warpaint-glove-'+side+'-'+trigger,(a,rod,G)=>{
  build(a,rod);
  meridianVolume(a,'palm',[
   [-.023,.033,-.026,.025],[-.011,.039,-.033,.031],[.007,.041,-.035,.034],
   [.022,.033,-.028,.027],[.031,.024,-.021,.020]
  ],{shape:.89});
  const back=meridianVolume(a,'trim',[
   [-.103,.036,-.040,-.024],[-.093,.045,-.046,-.030],[-.063,.047,-.048,-.030],
   [-.039,.035,-.043,-.029],[-.031,.024,-.033,-.027]
  ],{shape:.79,fold:.0011,roll:side*.035});
  for(const u of [.59,.91]){
   meridianSeam(a,'stitch',Array.from({length:9},(_,i)=>{
    const p=back(u,.12+i*.095);p[2]-=.001;return p;
   }),.0011);
  }
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.0213,y=-.102+Math.abs(i-1.25)*.004;
   meridianSeam(a,'trim',[[x-.006,y+.003,-.031],[x,y,-.033],[x+.007,y+.004,-.030]],.0023);
  }
  meridianSeam(a,'stitch',[[-.022,-.021,-.031],[0,-.022,-.034],[.021,-.020,-.031]],.0016);
  a('trim',G.ss,.012,.007,.002,side*.022,-.019,-.033);
 },{palm:M.gloveLeather,trim:M.glovePad,stitch:M.gloveThread,finger:M.skin});
 return model;
}

let warPaintSkinMap;
function meridianSkinTexture(){
 if(warPaintSkinMap)return warPaintSkinMap;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#e2d8cf';ctx.fillRect(0,0,128,128);
 for(let i=0;i<1700;i++){
  const x=(i*23.71+i*i*.14)%128,y=(i*13.12+i*i*.63)%128;
  ctx.fillStyle=i%3===0?'rgba(84,52,37,.16)':'rgba(255,243,229,.16)';
  ctx.fillRect(x,y,1+i%2,1);
 }
 const map=new THREE.CanvasTexture(canvas);map.encoding=THREE.sRGBEncoding;
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);map.anisotropy=3;
 return warPaintSkinMap=map;
}

function operatorMaterials(id){
 const kit=OPERATORS[id],keyed=id==='keywarden',meridian=id==='meridian',shared=(part,color,options={},roughness=.73,metalness=.06)=>{
  const key=part+'-'+id;
  return HV.m[key]||(HV.m[key]=LX.pbr?
   new THREE.MeshStandardMaterial({color,...options,roughness,metalness,envMapIntensity:.64}):
   new THREE.MeshLambertMaterial({color,...options}));
 };
 return {
  fabric:shared('fabric',kit.tone,keyed?{}:{map:meridian?meridianCamo():operatorWeave()},keyed?.49:.92,keyed?.55:.03),
  armor:shared('armor',kit.plate,{},keyed?.39:.58,keyed?.68:.20),
  trim:shared('trim',kit.trim,{},keyed?.30:.65,keyed?.59:.15),
  stitch:shared('stitch',keyed?0x4e3828:0x252522,{},.78,keyed?.43:.02),
  optic:shared('optic',kit.optic,keyed?{emissive:0x203238,emissiveIntensity:.35}:{},.24,.19),
  ...(meridian?{
   skin:shared('skin',0x9f6149,{map:meridianSkinTexture()},.79,0),wrap:shared('wrap',0x1d3450,{map:operatorWeave()},.96,0),
   wrapEdge:shared('wrapEdge',0x263d54,{},.95,0),wrapShade:shared('wrapShade',0x132638,{map:operatorWeave()},.96,0),
   fieldPaint:shared('fieldPaint',0x182a41,{},.91,0),canvas:shared('canvas',0x2a2e2c,{map:operatorWeave()},.96,0),
   leather:shared('leather',0x4c3a28,{map:operatorWeave()},.86,0),blackMetal:shared('blackMetal',0x333734,{},.54,.35),
   seamShade:shared('seamShade',0x26271f,{},.95,0),thread:shared('thread',0x646653,{},.98,0),
   edge:shared('edge',0x42494a,{},.66,.17),bootLeather:shared('bootLeather',0x191e22,{map:operatorWeave()},.76,0),
   bootThread:shared('bootThread',0x535956,{},.91,0),
   gloveLeather:shared('gloveLeather',0x1b2023,{map:operatorWeave()},.89,0),
   glovePad:shared('glovePad',0x30363a,{map:operatorWeave()},.81,0),
   gloveThread:shared('gloveThread',0x55564b,{},.93,0),sole:shared('sole',0x181b1b,{},.98,0),
   eye:shared('eye',0x9a8e78),skullPaint:meridianSkullPaint()
  }:null)
 };
}
const operatorTeamMaterials=new Map();
function markOperatorTeam(rig,team){
 if(team!=='A'&&team!=='B')return;
 let material=operatorTeamMaterials.get(team);
 if(!material){
  material=new THREE.MeshLambertMaterial({color:team==='A'?0x57b8ff:0xff6251,
   emissive:team==='A'?0x11496e:0x671c13,emissiveIntensity:.6});
  operatorTeamMaterials.set(team,material);
 }
 for(const arm of [rig.armL,rig.armR]){
  const band=new THREE.Mesh(rig.keywarden?operatorKeyGeometry:HV.G().cy,material);
  band.scale.set(...(rig.keywarden?[.047,.043,.19]:[.09,.048,.094]));
  band.position.set(0,-.227,rig.keywarden?.077:0);arm.up.add(band);
 }
}
function operatorViewGear(id,side,part,length){
 if(part==='hand')return keywardenHand(side);
 return operatorGear(id,side,part,length);
}

/* ######## gfx.js ######## */
/* ===================== gfx.js ===================== */
/* ---------- graphics: PBR materials, procedural textures, merged level geometry with baked contact shading, shadows, animated sky, window facades, flickering lights.
   Textures, materials, the environment map and post-processing come from lumen.js (LX).
   Map boxes are [x,z,w,d,h,y0,colour,kind]: kind is a texture (brick stucco plank concrete asphalt grass shingle tile metal sand rust cobble), 'glass' / 'glow', or 'n' for collision only.
   Visual-only extras (map._v and map.deco) are [x,z,w,d,h,y0,colour,shape,texture] with shape b box, e glow box, g glass box, s sphere, c cylinder, k cone. ---------- */
var gfxQ=LX.q,skyM=null,gfxL=[],gt_=0;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
const SHS=2048;
sun.shadow.mapSize.set(SHS,SHS);{const k=sun.shadow.camera;k.left=k.bottom=-46;k.right=k.top=46;k.near=1;k.far=150}sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;S.add(sun.target);
function setGfx(q){gfxQ=q;LX.setQuality(q);sun.castShadow=q!='low'}setGfx(gfxQ);
/* the shadow texel in world units (used to keep shadow edges from shimmering) */
var SH_TEXEL=92/SHS;

/* ---------- surfaces ---------- */
var TS={brick:2.4,stucco:3,plank:1.6,concrete:3,asphalt:4,grass:4,shingle:1.8,tile:2,metal:2,sand:3.2,rust:2,cobble:2.2};
function gTex(kind){return LX.tex(kind).map}
/* normal strength per kind and metalness for the metallic ones */
var KP={brick:[1.5,0],stucco:[.8,0],plank:[1,0],concrete:[.95,0],asphalt:[1,0],grass:[.7,0],shingle:[1.2,0],tile:[.6,.05],metal:[.7,.8],sand:[.7,0],rust:[1,.5],cobble:[1.5,0]};
var GM={};
function gMat(kind,col){const k=kind+col;if(GM[k])return GM[k];let m;
 if(!LX.pbr){m=kind=='glow'?new THREE.MeshBasicMaterial({color:col}):kind=='glass'||kind=='glassL'?new THREE.MeshLambertMaterial({color:col,emissive:0x0a1626}):kind=='flat'||kind=='foliage'?new THREE.MeshLambertMaterial({color:col}):new THREE.MeshLambertMaterial({color:col,map:gTex(kind),vertexColors:true})}
 else{const S_=THREE.MeshStandardMaterial;
  if(kind=='glow')m=LX.patch(new S_({color:0x111111,emissive:col,emissiveIntensity:2.6,roughness:.5,metalness:0}));
  else if(kind=='glass')m=LX.patch(new S_({color:col,emissive:0x0a1626,emissiveIntensity:.7,metalness:.9,roughness:.05,envMapIntensity:2,transparent:true,opacity:.7}));
  else if(kind=='glassL')m=LX.patch(new S_({color:0x2a2418,emissive:col,emissiveIntensity:1.9,metalness:.2,roughness:.12,envMapIntensity:1.2}));
  else if(kind=='flat')m=LX.patch(new S_({color:col,roughness:.78,metalness:.02,envMapIntensity:.6}));
  else if(kind=='foliage')m=LX.patch(new S_({color:col,roughness:.72,metalness:0,envMapIntensity:.5}),{sway:true});
  else{const t=LX.tex(kind),p=KP[kind]||[1,0];m=LX.patch(new S_({color:col,map:t.map,normalMap:t.normalMap,roughness:1,metalness:p[1],normalScale:new THREE.Vector2(p[0],p[0]),vertexColors:true,envMapIntensity:.75}),{macro:true,packed:true})}}
 return GM[k]=m}
function texKind(w,d,h,y0,col){const c=new THREE.Color(col),lum=c.r*.3+c.g*.59+c.b*.11,t=h-y0,th=Math.min(w,d);
 if(t<.3)return c.g>c.r*1.1&&c.g>c.b*1.1?'grass':lum<.32?'asphalt':'concrete';
 if(y0>=2.5&&t<1.6)return 'shingle';if(h>3.2&&th<2)return 'brick';
 if(c.r>c.g*1.05&&c.g>c.b*1.1&&lum<.55)return 'plank';if(t<=1.8&&th<.5)return 'plank';
 if(h>=2.2)return lum>.5?'stucco':'brick';return 'concrete'}
/* box with tiled UVs and baked contact shading, appended to a merged geometry accumulator.
   ao = world height of the box's base: side vertices darken toward it (a cheap stand-in for ambient occlusion where a wall meets the ground or a ledge) */
function addBox(a,x,yc,z,sx,sy,sz,ts,ao){const tintColor=a.color;a=a.bucket(x,z);ts=a.modTileSize??ts;const hx=sx/2,hy=sy/2,hz=sz/2,F=[[[0,1,0],[[-hx,hy,-hz],[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz]],sx,sz,1],[[0,-1,0],[[-hx,-hy,hz],[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz]],sx,sz,.5],[[0,0,1],[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],sx,sy,.93],[[0,0,-1],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],sx,sy,.86],[[1,0,0],[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],sz,sy,.96],[[-1,0,0],[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],sz,sy,.88]],
 tint=.94+Math.random()*.1,c=a.c;
 for(const[n,vs,w,h,fs]of F){const b=a.p.length/3,side=n[1]==0;for(let i=0;i<4;i++){a.p.push(x+vs[i][0],yc+vs[i][1],z+vs[i][2]);a.n.push(n[0],n[1],n[2]);
   let v=fs*tint;if(ao!=null&&side){const q=Math.min(1,Math.max(0,(yc+vs[i][1]-ao)/1.4));v=fs*tint*(.55+.45*q*q*(3-2*q))}
   c.push(v*tintColor.r,v*tintColor.g,v*tintColor.b)}
  a.u.push(0,0,w/ts,0,w/ts,h/ts,0,h/ts);a.i.push(b,b+1,b+2,b,b+2,b+3)}}
var cyHi=new THREE.CylinderGeometry(1,1,1,20),coHi=new THREE.ConeGeometry(1,1,20),sgHi=new THREE.SphereGeometry(1,20,14);
/* lumpy tree crowns: a few variants of a noisy sphere with smooth radial normals */
var leafG=[0,1,2].map(i=>{const g=new THREE.SphereGeometry(1,18,13),p=g.attributes.position,n=g.attributes.normal;let sd=i*977+5;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,ph=[r()*6,r()*6,r()*6,r()*6];
 for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k),z=p.getZ(k),l=1+.17*(Math.sin(x*3.1+ph[0])*Math.cos(z*2.7+ph[1])+.6*Math.sin(y*4.3+x*2+ph[2])+.4*Math.sin(z*5.7+y*3+ph[3]))*.7,L=Math.hypot(x,y,z)||1;p.setXYZ(k,x*l,y*l,z*l);n.setXYZ(k,x/L,y/L,z/L)}
 p.needsUpdate=true;n.needsUpdate=true;return g});
var isLeaf=col=>{const c=new THREE.Color(col);return c.g>c.r*1.06&&c.g>c.b*1.12};
function gfxVis(e,acc,details,materialAt=gMat){
 if(!e)return;const[x,z,w,d,h,y0=0,col,sh,tex]=e,t=h-y0,yc=(h+y0)/2;
 if(!sh||sh=='b'){const k=tex||texKind(w,d,h,y0,col);addBox(acc(k,col),x,yc,z,w,t,d,TS[k]||2,y0)}
 else if(sh=='e')addBox(acc('glow',col),x,yc,z,w,t,d,1);
 else if(sh=='g')addBox(acc('glass',col),x,yc,z,w,t,d,1);
 else{const style=tex==='glow'||tex==='glass'?tex:null,leaf=!style&&sh!='c'&&isLeaf(col),geo=sh=='s'?(leaf&&LX.pbr?leafG[(Math.abs(x*7+z*3)|0)%3]:sgHi):sh=='c'?cyHi:coHi,m=new THREE.Mesh(geo,materialAt(tex||style||(leaf?'foliage':'flat'),col,x,z,style||(leaf?'foliage':'flat')));m.scale.set(w/2,sh=='s'?t/2:t,d/2);m.position.set(x,sh=='s'?yc:y0+t/2,z);if(sh=='s'&&leaf)m.rotation.y=(x*1.7+z)%6.28;m.castShadow=true;m.receiveShadow=true;details.push(m)}}
/* Group repeated geometry within view-sized regions. Each group carries its own conservative
   bounds so Three r128 can cull both the color draw and the shadow draw. */
function drawMapDetails(details,root){
 const groups=new Map(),bounds=new THREE.Box3(),transformed=new THREE.Box3();
 for(const mesh of details){
  const {x,z}=mesh.position;
  const key=mesh.geometry.id+'/'+mesh.material.id+'/'+Math.floor(x/32)+'/'+Math.floor(z/32);
  let group=groups.get(key);
  if(!group)groups.set(key,group=[]);
  group.push(mesh);
 }
 for(const group of groups.values()){
  if(group.length<3){for(const mesh of group)root.add(mesh);continue}
  const source=group[0];
  const geometry=source.geometry.clone();
  const batch=new THREE.InstancedMesh(geometry,source.material,group.length);
  geometry.computeBoundingBox();
  bounds.makeEmpty();
  for(let i=0;i<group.length;i++){
   const mesh=group[i];
   mesh.updateMatrix();
   batch.setMatrixAt(i,mesh.matrix);
   transformed.copy(geometry.boundingBox).applyMatrix4(mesh.matrix);
   if(mesh.material.userData.lxFl?.sway)transformed.expandByScalar(.09*Math.max(mesh.scale.x,mesh.scale.z));
   bounds.union(transformed);
  }
  geometry.boundingSphere=bounds.getBoundingSphere(new THREE.Sphere());
  batch.instanceMatrix.needsUpdate=true;
  batch.castShadow=batch.receiveShadow=batch.frustumCulled=true;
  root.add(batch);
 }
}
/* windows, frames, sills and a cornice on every tall building of maps flagged facade; on night and dusk maps a share of the windows are lit */
function facade(list,acc,mapName){const lp={'Hollow Estate':.4,London:.08,Canyon:.18,Decay:.16,Boomtown:.1}[mapName]||0,gl=acc('glass',0x2a3a4a),gL=acc('glassL',0xffb14a),fr=acc('plank',0xe8e4d8),co=acc('concrete',0x55524c),sl=acc('concrete',0x8a867c);
 for(const[x,z,w,d,h,y0,,kind]of list){if(kind=='n'||(y0||0)>0||h<2.4||w<3.5||d<3.5||h>14)continue;const rows=h>5.2?2:1;
  for(const sd of[[1,0],[-1,0],[0,1],[0,-1]]){const L=sd[0]?d:w,n=Math.max(1,Math.floor(L/3.2));for(let i=0;i<n;i++){const t=((i+.5)/n-.5)*L;for(let r=0;r<rows;r++){const yy=1.9+r*2.5;if(yy+.7>h-.3)continue;
    const cx=sd[0]?x+sd[0]*(w/2+.03):x+t,cz=sd[1]?z+sd[1]*(d/2+.03):z+t,lit=Math.random()<lp;addBox(lit?gL:gl,cx,yy,cz,sd[0]?.06:1.2,1.4,sd[0]?1.2:.06,1);addBox(fr,cx,yy,cz,sd[0]?.04:1.45,1.65,sd[0]?1.45:.04,1.6);
    addBox(sl,sd[0]?x+sd[0]*(w/2+.12):cx,yy-.88,sd[1]?z+sd[1]*(d/2+.12):cz,sd[0]?.28:1.7,.1,sd[0]?1.7:.28,1.2)}}}
  addBox(co,x,h+.15,z,w+.5,.3,d+.5,3,h)}}

/* free GPU memory of a map that is being replaced (materials are cached and shared, geometry and sky textures are not) */
function gfxDispose(g){try{g.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&o.geometry!==sg&&o.geometry!==bg&&o.geometry!==sgHi&&o.geometry!==cyHi&&o.geometry!==coHi&&!leafG.includes(o.geometry))o.geometry.dispose();
 const m=o.material;if(m&&o.userData.mapResources){for(const resource of o.userData.mapResources)resource.dispose();m.dispose()}});}catch(e){}}
/* build everything visible for a map: ground, sky, merged textured boxes, extras, lights */
function gfxMap(M,list){
 LX.setMap(sel.map);
 hemi.intensity=(M.hemi||.85)*(LX.pbr?.55:1);hemi.color.setHex(M.hemiC||0xffffff);hemi.groundColor.setHex(M.hemiG||0x445566);sun.intensity=(M.sunI==null?.7:M.sunI)*(LX.pbr?1.2:1);sun.color.setHex(M.sunC||0xffffff);
 gfxMapGeometry(M,list,mapG,sel.map);
 gfxSky(M);
 gfxL=[];for(const[x,y,z,col,I,dist]of M.lights||[]){const l=new THREE.PointLight(col,I,dist);l.position.set(x,y,z);mapG.add(l);gfxL.push({l,b:I,p:Math.random()*6})}
}
function gfxMapGeometry(M,list,root,mapName){
 const gk=M.gt||(M.skyk=='night'?'concrete':'grass'),gs=TS[gk]||4,GS=M.groundSpan??(M.H*2+(M.open?360:0));let gm;
 if(M.modMapPatch?.ground){
  const surface=M.modMapPatch.ground,ts=surface.tileSize||gs;
  surface.texture.repeat.set(GS/ts,GS/ts);
  gm=modPaintMaterial(surface,M.gr,false);
 }else if(LX.pbr){const t=LX.texRep(gk,GS/gs,GS/gs);gm=LX.patch(new THREE.MeshStandardMaterial({color:M.gr,map:t.map,normalMap:t.normalMap,roughness:1,metalness:0,normalScale:new THREE.Vector2(.9,.9),envMapIntensity:.5}),{macro:true,packed:true})}
 else{const gt=gTex(gk).clone();gt.needsUpdate=true;gt.repeat.set(GS/gs,GS/gs);gm=new THREE.MeshLambertMaterial({color:M.gr,map:gt})}
 if(M.groundVertexColors)gm.vertexColors=true;
 const f=new THREE.Mesh(M.groundGeometry?M.groundGeometry():new THREE.PlaneGeometry(GS,GS),gm);
 if(!M.groundGeometry)f.rotation.x=-Math.PI/2;
 f.receiveShadow=true;if(!M.modMapPatch?.ground)f.userData.mapResources=[gm.map,gm.normalMap].filter(Boolean);root.add(f);
 const H=M.H;
 const details=[],accs=new Map(),surfaces=new Map(),white=new THREE.Color(0xffffff);
 const materialAt=(kind,color,x,z,fallback=kind)=>{
  const edit=M.modMapPatch;
  const replacement=edit&&modPaintAt(edit,kind,x,z);
  return replacement?modPaintMaterial(replacement,color,false):gMat(fallback,color);
 };
 const acc=(kind,color)=>!M.modMapPatch?mapSurface(kind,color,null):({color:TS[kind]?new THREE.Color(color):white,bucket(x,z){
  const edit=M.modMapPatch,replacement=edit&&modPaintAt(edit,kind,x,z);
  return mapSurface(kind,color,replacement).bucket(x,z);
 }});
 const mapSurface=(kind,color,replacement)=>{
  const surface=kind+'/'+color+(replacement?'/'+replacement.id:'');
  let writer=surfaces.get(surface);
  if(!writer){
   // Opaque textured boxes of the same surface share a material. Vertex colors retain
   // their individual paints and contact shading, with sectors for conservative culling.
   const shared=Boolean(TS[kind]);
   const mat=replacement?modPaintMaterial(replacement,shared?0xffffff:color,true):gMat(kind,shared?0xffffff:color);
   writer={color:shared?new THREE.Color(color):white,bucket(x,z){
    const key=shared?kind+'/'+Math.floor(x/32)+'/'+Math.floor(z/32)+(replacement?'/'+replacement.id:''):surface;
    let batch=accs.get(key);
    if(!batch)accs.set(key,batch={mat,p:[],n:[],u:[],i:[],c:[],modTileSize:replacement?.tileSize});
    return batch;
   }};
   surfaces.set(surface,writer);
  }
  return writer;
 };
 for(const e of list){const[x,z,w,d,h,y0=0,col,kind]=e;if(kind=='n'||kind==='invisible')continue;const c=col==null?new THREE.Color(M.bc).offsetHSL(0,0,(h-2)*.025).getHex():col;
  if(kind=='glass'||kind=='glow'){addBox(acc(kind,c),x,(h+y0)/2,z,w,h-y0,d,1);continue}const k=kind||texKind(w,d,h,y0,c);addBox(acc(k,c),x,(h+y0)/2,z,w,h-y0,d,TS[k]||2,y0)}
 /* terrain (dunes, hills, rock mounds) is scenery only and has no collision, so it must never reach into the playable area: any big landform whose footprint overlaps the arena bounds is pushed out past the fence, or dropped if it cannot be moved */
 const tclip=e=>{const tb=M.tb;if(!tb||!e||e[7]!='s')return e;let[x,z,w,d,,y0=0]=e;if(Math.max(w,d)<9||y0>0)return e;const mg=3,L=tb[0]-mg,Rr=tb[2]+mg,T=tb[1]-mg,Bm=tb[3]+mg;
  const pl=(x+w/2)-L,pr=Rr-(x-w/2),pt=(z+d/2)-T,pb=Bm-(z-d/2);if(pl<=0||pr<=0||pt<=0||pb<=0)return e;
  const m=Math.min(pl,pr,pt,pb),o=e.slice();if(m==pl)o[0]=x-pl;else if(m==pr)o[0]=x+pr;else if(m==pt)o[1]=z-pt;else o[1]=z+pb;return o};
 for(const e of M._v||[])gfxVis(tclip(e),acc,details,materialAt);
 if(M.deco)for(const e of M.deco())gfxVis(tclip(e),acc,details,materialAt);
 if(M.facade)facade(list,acc,mapName);
 if(M.modMapPatch?.models.length)modBuildMapModels(M.modMapPatch,root);
 drawMapDetails(details,root);
 if(!M.open)for(const[x,z,w,d]of[[0,-H-1,2*H+4,2],[0,H+1,2*H+4,2],[-H-1,0,2,2*H],[H+1,0,2,2*H]])addBox(acc('brick',M.bc),x,5,z,w,10,d,TS.brick,0);
 for(const a of accs.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(a.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(a.c,3));g.setIndex(a.i);const m=new THREE.Mesh(g,a.mat);m.castShadow=m.receiveShadow=true;root.add(m)}
 // World geometry is immutable between map builds.
 for(const mesh of root.children)if(mesh.isMesh){
  mesh.updateMatrix();mesh.matrixAutoUpdate=false;
 }
}

/* every frame: sky follows the camera, lamps flicker, and the sun's shadow window glides in whole shadow texels so shadow edges stay rock steady while you move */
function gfxTick(dt){gt_+=dt;LX.tick(dt);if(skyM)skyM.position.copy(C.position);
 const d=skyDir(),cx=C.position.x,cz=C.position.z,Lx=d[0]*60,Ly=Math.max(14,d[1]*60+8),Lz=d[2]*60,ll=Math.hypot(Lx,Ly,Lz),dx=Lx/ll,dy=Ly/ll,dz=Lz/ll,rl=Math.hypot(dz,dx)||1,rx=dz/rl,rz=-dx/rl,ux=rz*dy,uy=-rz*dx+rx*dz,uz=-rx*dy;
 const a=cx*rx+cz*rz,b=cx*ux+cz*uz,aS=Math.round(a/SH_TEXEL)*SH_TEXEL,bS=Math.round(b/SH_TEXEL)*SH_TEXEL,px=cx+(aS-a)*rx+(bS-b)*ux,py=(bS-b)*uy,pz=cz+(aS-a)*rz+(bS-b)*uz;
 sun.target.position.set(px,py,pz);sun.position.set(px+Lx,py+Ly,pz+Lz);sun.target.updateMatrixWorld();
 for(const o of gfxL)o.l.intensity=o.b*(.84+.1*Math.sin(gt_*(7+o.p)+o.p*9)+.06*Math.sin(gt_*23+o.p)+(Math.random()<.008?-.45:0))}

;
/* ######## sky.js ######## */
/* ===================== sky.js ===================== */
/* ---------- a different skybox for every map, drawn at run time on a 1024 x 512 canvas (zenith at the top, horizon in the middle, the horizon colour equals the fog colour so the world fades into it).
   Each map also has its own sun (or moon) direction: the visible disc sits where the light really comes from, so shadows agree with the sky.
   Blockfort: bright medieval day, big cumulus, forested hills, flocks of birds.      Pillars: Mediterranean noon, wispy cirrus, sea haze, pale mountains.
   Canyon: sunset with a huge low sun and long glowing cloud streaks.                  Suburbia: friendly summer sky, small clouds and a jet contrail.
   Boomtown: ochre dust storm, thick dust bands, a dark storm wall, smoke columns.     Rust: bleached desert noon, heat haze, mesas, an oil flare plume.
   Decay: heavy green-grey overcast, smoke columns and a ruined skyline.              Hollow Estate: night with a huge moon, stars, thin moonlit cloud, bats and a red horizon glow. ---------- */
var SKY_SUN={Blockfort:[.45,.75,-.35],Pillars:[-.2,.92,.3],Canyon:[-.86,.2,.3],Suburbia:[.3,.7,.5],Boomtown:[.6,.5,-.4],Rust:[.1,.85,-.5],Decay:[-.3,.45,.2],London:[.38,.6,.5],'Dry Dock':[.55,.3,-.45],'Hollow Estate':[-.5,.55,.4],Shardworks:[-.61,.39,-.44],'Practice Range':[.19,.85,-.49]};
const skyDirections=new Map();
function skyDir(key=sel.map){
 if(!skyDirections.has(key)){
  const d=SKY_SUN[key]||[.45,.7,.3],length=Math.hypot(...d);
  skyDirections.set(key,d.map(v=>v/length));
 }
 return skyDirections.get(key);
}
function gfxSky(M){
 skyM=makeMapSky(M,sel.map,true);
 mapG.add(skyM);
}
function makeMapSky(M,name,refreshEnvironment=false){const W=1024,Hh=512,c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d'),hz='#'+new THREE.Color(M.sky).getHexString(),hy=Hh/2;let sd=M.skySeed||name.length*977+13;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const sdir=skyDir(name),phi0=Math.atan2(sdir[2],-sdir[0]),sx=((phi0<0?phi0+Math.PI*2:phi0)/(Math.PI*2))*W,sy=Math.acos(sdir[1])/Math.PI*Hh;
 const grad=(stops)=>{const gr=g.createLinearGradient(0,0,0,Hh);for(const[p,col]of stops)gr.addColorStop(p,col);g.fillStyle=gr;g.fillRect(0,0,W,Hh)};
 /* wrap helper: things near the left / right seam are drawn twice so the sphere has no visible seam */
 const wrap=(x,w,fn)=>{fn(x);if(x-w<0)fn(x+W);if(x+w>W)fn(x-W)};
 const glow=(x,y,r,stops)=>{wrap(x,r,xx=>{const rg=g.createRadialGradient(xx,y,0,xx,y,r);for(const[p,col]of stops)rg.addColorStop(p,col);g.fillStyle=rg;g.fillRect(xx-r,y-r,r*2,r*2)})};
 const puff=(x,y,w,h,a,col,shade)=>{wrap(x,w,xx=>{for(let i=0;i<14;i++){const px=xx+(rnd()-.5)*w,py=y+(rnd()-.5)*h*.6,r=(.18+rnd()*.28)*Math.max(w,h*2)*.5;const rg=g.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,col.replace('A',a));rg.addColorStop(1,col.replace('A',0));g.fillStyle=rg;g.beginPath();g.arc(px,py,r,0,7);g.fill()}if(shade)for(let i=0;i<6;i++){const px=xx+(rnd()-.5)*w*.9,py=y+h*.28+(rnd()-.5)*h*.3,r=(.15+rnd()*.2)*w*.4;const rg=g.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,shade.replace('A',a*.8));rg.addColorStop(1,shade.replace('A',0));g.fillStyle=rg;g.beginPath();g.arc(px,py,r,0,7);g.fill()}})};
 const streak=(x,y,len,th,a,col)=>{wrap(x,len,xx=>{g.save();g.translate(xx,y);g.rotate((rnd()-.5)*.12);for(let i=0;i<8;i++){const r=g.createRadialGradient((rnd()-.5)*len*.7,0,0,(rnd()-.5)*len*.7,0,len*.5);r.addColorStop(0,col.replace('A',a));r.addColorStop(1,col.replace('A',0));g.fillStyle=r;g.save();g.scale(1,th/len);g.beginPath();g.arc(0,0,len*.5,0,7);g.fill();g.restore()}g.restore()})};
 const sil=(col,fn)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,hy);for(let x=0;x<=W;x+=4)g.lineTo(x,hy-fn(x));g.lineTo(W,hy);g.closePath();g.fill()};
 const ridge=(amp,f1,f2,ph)=>x=>Math.max(0,amp*(.55+.3*Math.sin(x*f1+ph)+.18*Math.sin(x*f2+ph*2.3)+.1*Math.sin(x*f1*5.1+ph)));
 const bird=(x,y,s)=>{g.strokeStyle='rgba(10,12,16,.75)';g.lineWidth=1.3;g.beginPath();g.moveTo(x-s,y+s*.2);g.quadraticCurveTo(x-s*.4,y-s*.5,x,y);g.quadraticCurveTo(x+s*.4,y-s*.5,x+s,y+s*.2);g.stroke()};
 const stars=(n,a)=>{for(let i=0;i<n;i++){g.fillStyle=`rgba(255,255,255,${(a||1)*(.25+rnd()*.75)})`;const s=rnd()<.06?2:1;g.fillRect(rnd()*W,Math.pow(rnd(),1.4)*hy*.95,s,s)}};
 const column=(x,w,h,col,a)=>{wrap(x,w*3,xx=>{for(let i=0;i<26;i++){const t=i/26,px=xx+Math.sin(t*5+x)*w*(.4+t*2),py=hy-2-t*h,r=w*(.7+t*2.4);const rg=g.createRadialGradient(px,py,0,px,py,r);rg.addColorStop(0,col.replace('A',a*(1-t*.6)));rg.addColorStop(1,col.replace('A',0));g.fillStyle=rg;g.beginPath();g.arc(px,py,r,0,7);g.fill()}})};
 const haze=(col,top,a)=>{const gr=g.createLinearGradient(0,hy-top,0,hy+2);gr.addColorStop(0,col.replace('A',0));gr.addColorStop(1,col.replace('A',a));g.fillStyle=gr;g.fillRect(0,hy-top,W,top+2)};
 if(name===JUPITER_MAP){jupiterSky(g,W,Hh,grad,stars,glow,wrap,rnd);}
 else if(name=='Blockfort'){grad([[0,'#1d57c4'],[.22,'#3f86e2'],[.4,'#78b2ee'],[.5,hz],[1,hz]]);glow(sx,sy,220,[[0,'rgba(255,250,225,1)'],[.06,'rgba(255,244,200,.95)'],[.18,'rgba(255,236,170,.4)'],[1,'rgba(255,230,160,0)']]);
  for(let i=0;i<20;i++)puff(rnd()*W,hy*(.35+rnd()*.5),150+rnd()*230,60+rnd()*60,.92,'rgba(255,255,255,A)','rgba(150,165,190,A)');
  sil('#7f98b4',ridge(34,.015,.04,1));sil('#5f7e68',ridge(20,.03,.07,4));for(let i=0;i<60;i++){const x=rnd()*W;g.fillStyle='#44624a';g.beginPath();g.moveTo(x,hy);g.lineTo(x+4,hy-12-rnd()*8);g.lineTo(x+8,hy);g.fill()}
  g.fillStyle='#52586a';for(const x of[130,640]){g.fillRect(x,hy-30,22,30);g.fillRect(x-2,hy-34,26,5);g.beginPath();g.moveTo(x+4,hy-34);g.lineTo(x+11,hy-52);g.lineTo(x+18,hy-34);g.fill();g.fillRect(x+30,hy-24,14,24)}
  for(let k=0;k<3;k++){const bx=rnd()*W,by=hy*(.4+rnd()*.3);for(let i=0;i<7;i++)bird(bx+i*14+rnd()*8,by+Math.abs(i-3)*5+rnd()*5,5+rnd()*2)}haze('rgba(200,225,240,A)',46,.75)}
 else if(name=='Pillars'){grad([[0,'#0d5fc7'],[.2,'#2a86de'],[.38,'#7cc0ee'],[.5,hz],[1,hz]]);glow(sx,sy,260,[[0,'rgba(255,255,240,1)'],[.05,'rgba(255,252,225,.95)'],[.2,'rgba(255,246,200,.35)'],[1,'rgba(255,240,190,0)']]);
  for(let i=0;i<16;i++)streak(rnd()*W,hy*(.1+rnd()*.55),280+rnd()*340,10+rnd()*14,.5,'rgba(255,255,255,A)');for(let i=0;i<5;i++)puff(rnd()*W,hy*(.55+rnd()*.25),120+rnd()*120,40,.7,'rgba(255,255,255,A)','rgba(190,205,225,A)');
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc((sx+W*.5)%W,hy*.28,13,0,7);g.fill();g.fillStyle='#2a86de';g.beginPath();g.arc((sx+W*.5)%W+6,hy*.28-3,12,0,7);g.fill();
  sil('#a9a3c4',ridge(46,.012,.03,2));sil('#8a86ae',ridge(26,.02,.06,5));g.fillStyle='#6fb4d6';g.fillRect(0,hy-3,W,5);haze('rgba(190,220,240,A)',54,.85)}
 else if(name=='Canyon'){grad([[0,'#16204e'],[.16,'#3a2f78'],[.3,'#a04a7a'],[.42,'#f08a58'],[.5,hz],[1,hz]]);glow(sx,Math.max(sy,hy*.78),380,[[0,'rgba(255,245,200,1)'],[.05,'rgba(255,224,150,.95)'],[.18,'rgba(255,170,90,.55)'],[.5,'rgba(255,110,60,.18)'],[1,'rgba(255,90,50,0)']]);
  for(let i=0;i<22;i++)streak(rnd()*W,hy*(.35+rnd()*.5),300+rnd()*420,12+rnd()*18,.55,rnd()<.5?'rgba(255,170,120,A)':'rgba(255,110,130,A)');for(let i=0;i<8;i++)streak(rnd()*W,hy*(.1+rnd()*.3),260+rnd()*200,10,.35,'rgba(255,200,200,A)');stars(60,.35);
  sil('#7a3a4a',ridge(40,.014,.05,3));sil('#4a2a3a',ridge(24,.03,.08,6));for(let k=0;k<2;k++){const bx=rnd()*W,by=hy*.5+rnd()*40;for(let i=0;i<5;i++)bird(bx+i*16,by+Math.abs(i-2)*6,6)}haze('rgba(255,170,110,A)',60,.6)}
 else if(name=='Suburbia'){grad([[0,'#3a8ee6'],[.25,'#62aef0'],[.42,'#a0d4f6'],[.5,hz],[1,hz]]);glow(sx,sy,200,[[0,'rgba(255,255,235,1)'],[.06,'rgba(255,250,215,.95)'],[.2,'rgba(255,245,200,.3)'],[1,'rgba(255,240,190,0)']]);
  for(let i=0;i<14;i++)puff(rnd()*W,hy*(.25+rnd()*.6),70+rnd()*120,30+rnd()*30,.95,'rgba(255,255,255,A)','rgba(170,190,215,A)');g.save();g.translate(W*.3,hy*.3);g.rotate(-.18);const cg=g.createLinearGradient(0,0,320,0);cg.addColorStop(0,'rgba(255,255,255,0)');cg.addColorStop(.15,'rgba(255,255,255,.7)');cg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cg;g.fillRect(0,-2,320,4);g.fillStyle='#fff';g.fillRect(-2,-1.5,6,3);g.restore();
  sil('#7aa08a',ridge(10,.04,.1,2));for(let i=0;i<80;i++){const x=rnd()*W,h=8+rnd()*10;g.fillStyle=rnd()<.5?'#4f7a52':'#5e8a58';g.beginPath();g.arc(x,hy-h*.3,h*.55,0,7);g.fill()}haze('rgba(210,235,250,A)',34,.7)}
 else if(name=='Boomtown'){grad([[0,'#7a5a3a'],[.18,'#a8794a'],[.34,'#d19a5e'],[.5,hz],[1,hz]]);glow(sx,sy,200,[[0,'rgba(255,240,200,.9)'],[.1,'rgba(255,220,160,.55)'],[.4,'rgba(240,190,120,.2)'],[1,'rgba(230,180,110,0)']]);
  for(let i=0;i<26;i++)streak(rnd()*W,hy*(.15+rnd()*.8),300+rnd()*500,14+rnd()*22,.45,rnd()<.5?'rgba(215,160,95,A)':'rgba(140,100,60,A)');
  sil('rgba(96,64,40,.85)',x=>26+30*Math.pow(Math.max(0,Math.sin(x*.012+.6)),2)+10*Math.sin(x*.07));column(W*.22,12,150,'rgba(60,44,34,A)',.7);column(W*.7,10,120,'rgba(70,52,40,A)',.6);haze('rgba(225,185,125,A)',90,.9)}
 else if(name=='Rust'){grad([[0,'#4b86c8'],[.2,'#8cb2d6'],[.38,'#dbd0b4'],[.5,hz],[1,hz]]);glow(sx,sy,320,[[0,'rgba(255,255,248,1)'],[.05,'rgba(255,252,232,.97)'],[.2,'rgba(255,246,208,.5)'],[.6,'rgba(255,236,190,.12)'],[1,'rgba(255,230,180,0)']]);
  for(let i=0;i<8;i++)streak(rnd()*W,hy*(.1+rnd()*.6),260+rnd()*300,8+rnd()*10,.4,'rgba(255,255,255,A)');
  sil('#c7b08a',ridge(30,.011,.04,1));g.fillStyle='#b5a07c';for(const[x,w,h]of[[200,70,34],[300,50,24],[760,90,40],[880,60,28]]){g.fillRect(x,hy-h,w,h);g.fillRect(x+6,hy-h-5,w-12,6)}sil('#a8946e',ridge(14,.03,.08,3));column(W*.52,7,170,'rgba(32,26,22,A)',.75);glow(W*.52,hy-8,26,[[0,'rgba(255,170,70,.9)'],[1,'rgba(255,130,40,0)']]);haze('rgba(235,215,170,A)',70,.9)}
 else if(name=='Decay'){grad([[0,'#3a4644'],[.2,'#586664'],[.38,'#8a9894'],[.5,hz],[1,hz]]);
  for(let i=0;i<34;i++)puff(rnd()*W,hy*(.12+rnd()*.78),220+rnd()*340,70+rnd()*80,.55,'rgba(74,84,82,A)','rgba(40,48,46,A)');for(let i=0;i<14;i++)puff(rnd()*W,hy*(.2+rnd()*.7),180+rnd()*240,50+rnd()*50,.4,'rgba(170,182,176,A)');
  glow(sx,sy,180,[[0,'rgba(240,244,230,.55)'],[.3,'rgba(220,230,215,.2)'],[1,'rgba(210,220,205,0)']]);
  for(const x of[W*.15,W*.4,W*.63,W*.86])column(x,9,200,'rgba(40,44,42,A)',.7);
  g.fillStyle='#3a4240';for(let x=0;x<W;x+=11){const h=10+rnd()*(rnd()<.2?70:34);g.fillRect(x,hy-h,9+rnd()*8,h);if(rnd()<.25)g.fillRect(x+2,hy-h-12-rnd()*18,2,14)}sil('#4a5452',ridge(10,.05,.1,2));haze('rgba(150,165,160,A)',60,.8)}
 else if(name=='Dry Dock'){grad([[0,'#2a2f5a'],[.18,'#5a4a7a'],[.34,'#c0668a'],[.46,'#f09a5a'],[.5,hz],[1,hz]]);
  glow(sx,sy,380,[[0,'rgba(255,244,214,1)'],[.06,'rgba(255,214,150,.95)'],[.2,'rgba(255,160,90,.45)'],[1,'rgba(255,120,60,0)']]);
  for(let i=0;i<14;i++)streak(rnd()*W,hy*(.08+rnd()*.4),320+rnd()*320,8+rnd()*10,.42,'rgba(255,170,120,A)');
  for(let i=0;i<22;i++)puff(rnd()*W,hy*(.3+rnd()*.5),150+rnd()*240,50+rnd()*60,.9,'rgba(255,196,150,A)','rgba(120,80,120,A)');
  sil('#3a3050',ridge(7,.04,.09,2));g.fillStyle='#2a2438';for(let x=0;x<W;x+=9){const h=5+rnd()*(rnd()<.2?26:10);g.fillRect(x,hy-h,6+rnd()*8,h)}
  g.strokeStyle='#241e30';g.lineWidth=3;for(const px of[.18,.62,.86]){const cx=W*px;g.beginPath();g.moveTo(cx,hy);g.lineTo(cx,hy-58);g.lineTo(cx+46,hy-58);g.lineTo(cx+46,hy-46);g.moveTo(cx+10,hy);g.lineTo(cx+10,hy-58);g.stroke();g.fillStyle='#241e30';g.fillRect(cx-5,hy-64,60,5)}
  g.fillStyle='#241e30';g.beginPath();g.moveTo(W*.4,hy);g.lineTo(W*.4+10,hy-12);g.lineTo(W*.4+120,hy-12);g.lineTo(W*.4+140,hy);g.fill();g.fillRect(W*.4+30,hy-30,34,18);g.fillRect(W*.4+78,hy-22,22,10);
  for(let k=0;k<3;k++){const bx=rnd()*W,by=hy*(.4+rnd()*.3);for(let i=0;i<5;i++)bird(bx+i*14+rnd()*8,by+Math.abs(i-2)*5+rnd()*5,5+rnd()*2)}
  haze('rgba(255,170,120,A)',60,.7)}
 else if(name=='London'){grad([[0,'#2a6fd0'],[.2,'#4f98e6'],[.38,'#93c4f0'],[.5,hz],[1,hz]]);
  glow(sx,sy,320,[[0,'rgba(255,253,238,1)'],[.05,'rgba(255,247,216,.95)'],[.2,'rgba(255,238,196,.38)'],[1,'rgba(255,232,186,0)']]);
  for(let i=0;i<12;i++)streak(rnd()*W,hy*(.06+rnd()*.42),300+rnd()*320,8+rnd()*10,.38,'rgba(255,255,255,A)');
  for(let i=0;i<26;i++)puff(rnd()*W,hy*(.28+rnd()*.52),150+rnd()*250,56+rnd()*64,.92,'rgba(255,255,255,A)','rgba(146,162,196,A)');
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.beginPath();g.moveTo(W*.08,hy*.62);g.lineTo(W*.46,hy*.4);g.stroke();g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=6;g.beginPath();g.moveTo(W*.08,hy*.62);g.lineTo(W*.46,hy*.4);g.stroke();
  sil('#8fa9c4',ridge(7,.05,.11,2));
  g.fillStyle='#7e97b2';for(let x=0;x<W;x+=7){const h=6+rnd()*(rnd()<.15?34:16);g.fillRect(x,hy-h,5+rnd()*6,h)}
  g.fillStyle='#6f89a6';g.beginPath();g.moveTo(W*.7,hy);g.lineTo(W*.7+9,hy-82);g.lineTo(W*.7+18,hy);g.fill();g.fillRect(W*.3,hy-30,10,30);g.beginPath();g.moveTo(W*.3-2,hy-30);g.lineTo(W*.3+5,hy-46);g.lineTo(W*.3+12,hy-30);g.fill();
  g.strokeStyle='#6f89a6';g.lineWidth=2;g.beginPath();g.arc(W*.52,hy-30,28,0,7);g.stroke();for(let i=0;i<12;i++){const a=i/12*6.283;g.beginPath();g.moveTo(W*.52,hy-30);g.lineTo(W*.52+Math.cos(a)*28,hy-30+Math.sin(a)*28);g.stroke()}
  for(let k=0;k<4;k++){const bx=rnd()*W,by=hy*(.4+rnd()*.3);for(let i=0;i<5;i++)bird(bx+i*14+rnd()*8,by+Math.abs(i-2)*5+rnd()*5,5+rnd()*2)}
  haze('rgba(222,234,246,A)',70,.78)}
 else if(name==='Classic Crossroads'){
  grad([[0,'#305e92'],[.27,'#7299b6'],[.42,'#b7c6c4'],[.5,hz],[1,hz]]);
  glow(sx,sy,210,[[0,'rgba(255,247,219,1)'],[.08,'rgba(255,242,207,.94)'],[.28,'rgba(255,222,178,.36)'],[1,'rgba(255,216,169,0)']]);
  for(let i=0;i<12;i++)streak(rnd()*W,hy*(.22+rnd()*.52),155+rnd()*220,5+rnd()*8,.48,'rgba(255,245,226,A)');
  sil('#92a1a9',ridge(57,.01,.035,2));
  sil('#748482',ridge(29,.02,.055,5));
  haze('rgba(207,218,210,A)',39,.72);
 }
 else if(name==='Shardworks'){
  grad([[0,'#286382'],[.25,'#56869a'],[.40,'#8faeac'],[.5,hz],[1,hz]]);
  glow(sx,sy,260,[[0,'rgba(255,249,211,1)'],[.045,'rgba(255,235,186,.98)'],[.18,'rgba(252,209,153,.38)'],[1,'rgba(230,165,109,0)']]);
  for(let i=0;i<12;i++)streak(rnd()*W,hy*(.26+rnd()*.61),210+rnd()*250,9+rnd()*12,.38,'rgba(255,227,185,A)');
  const terraces=(offset,amplitude)=>x=>{
   const t=x/W*Math.PI*2;
   const land=.5+.31*Math.sin(t*4+offset)+.16*Math.cos(t*9-offset);
   return 9+Math.floor(Math.max(0,land)*amplitude/6)*6;
  };
  sil('#aaa692',terraces(.3,49));
  sil('#8d8d78',terraces(2.7,35));
  sil('#736f62',terraces(4.1,23));
  haze('rgba(229,197,150,A)',43,.75);
 }else if(name==='Practice Range'){
  grad([[0,'#2664a4'],[.25,'#498ec8'],[.425,'#9bc8e1'],[.5,hz],[1,hz]]);
  glow(sx,sy,168,[[0,'rgba(255,255,244,1)'],[.06,'rgba(255,253,224,.94)'],[.18,'rgba(255,250,219,.32)'],[1,'rgba(239,246,240,0)']]);
  for(const [x,y,w] of [[.08,.66,130],[.32,.45,158],[.57,.64,101],[.8,.7,175],[.98,.32,120]])
   puff(x*W,y*hy,w,38,.78,'rgba(255,255,255,A)','rgba(144,183,210,A)');
  const hills=(offset,amplitude)=>x=>{
   const t=x/W*Math.PI*2;
   return amplitude*(.54+.27*Math.sin(3*t+offset)+.17*Math.sin(7*t-offset));
  };
  sil('#84a6ae',hills(.55,53));sil('#64888d',hills(2.5,39));sil('#577678',hills(5,22));
  haze('rgba(198,230,236,A)',37,.64);
 }else{grad([[0,'#02040a'],[.2,'#070c1c'],[.4,'#0f1a30'],[.5,hz],[1,hz]]);stars(380,1);
  glow(sx,sy,260,[[0,'rgba(235,242,255,.9)'],[.1,'rgba(190,205,255,.45)'],[.4,'rgba(130,150,220,.15)'],[1,'rgba(110,130,200,0)']]);
  g.save();g.beginPath();g.arc(sx,sy,34,0,7);g.clip();const mg=g.createRadialGradient(sx-8,sy-8,2,sx,sy,36);mg.addColorStop(0,'#fbfdff');mg.addColorStop(1,'#c9d4ea');g.fillStyle=mg;g.fillRect(sx-40,sy-40,80,80);g.fillStyle='rgba(120,135,170,.4)';for(let i=0;i<9;i++){g.beginPath();g.arc(sx+(rnd()-.5)*50,sy+(rnd()-.5)*50,2+rnd()*7,0,7);g.fill()}g.restore();
  for(let i=0;i<12;i++)streak(rnd()*W,hy*(.15+rnd()*.7),260+rnd()*320,10+rnd()*14,.32,'rgba(150,170,220,A)');
  glow(W*.5,hy,420,[[0,'rgba(190,40,30,.5)'],[.5,'rgba(110,20,30,.2)'],[1,'rgba(80,10,20,0)']]);
  sil('#05070c',ridge(26,.02,.05,3));for(let i=0;i<40;i++){const x=rnd()*W,h=14+rnd()*30;g.fillStyle='#05070c';g.beginPath();g.moveTo(x-3,hy);g.lineTo(x,hy-h);g.lineTo(x+3,hy);g.fill()}
  for(let i=0;i<9;i++){const bx=rnd()*W,by=hy*(.3+rnd()*.5);g.strokeStyle='rgba(5,5,10,.9)';g.lineWidth=2;g.beginPath();g.moveTo(bx-8,by+2);g.quadraticCurveTo(bx-3,by-6,bx,by);g.quadraticCurveTo(bx+3,by-6,bx+8,by+2);g.stroke()}haze('rgba(40,50,80,A)',50,.6)}
 const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;
 const material=LX.pbr?LX.skyMat(LX.FX[name]||LX.FXD,sdir,tex):
  new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide,fog:false,depthWrite:false});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(180,48,24),material);
 // Draw the sky after opaque geometry so depth rejects covered sky pixels.
 sky.renderOrder=100;sky.frustumCulled=false;sky.userData.mapResources=[tex];
 if(LX.pbr&&refreshEnvironment)LX.setEnv(c);
 return sky;
}
