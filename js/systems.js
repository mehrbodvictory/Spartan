/* ===================== juice.js ===================== */
/* ---------- juice: particles, shake, sounds, medals, best scores ---------- */
const pts=[],mc={},sw={x:0,y:0},muz=new THREE.PointLight(0xffc060,0,12);muz.position.set(.2,-.15,-1);C.add(muz);
let shake=0,flashL=0,fk=0,streak=0,lastKillT=-9;
function burst(p,n,col,sp,life,sz){for(let i=0;i<n&&pts.length<320;i++){const m=new THREE.Mesh(bg,mc[col]||(mc[col]=new THREE.MeshBasicMaterial({color:col})));const s=sz*(.5+Math.random());m.scale.setScalar(s);m.position.copy(p);S.add(m);
 pts.push({m,v:V(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(sp*(.3+Math.random())),l:life,L:life,s})}}
function noise(d,f,v){try{ac=ac||new AudioContext();const n=ac.sampleRate*d,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=f;g.gain.value=v*vol;s.connect(fl).connect(g).connect(ac.destination);s.start()}catch(e){}}
function gunSnd(w){if(w.k=='RG')return pew();noise(w.pel>1?.22:.1,w.pel>1?1800:3500,.3);beep(w.pel>1?90:140,.08,'sine',.12)}
function msg(t,s){const e=$('#ms');e.textContent=t;msT=s||2;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
function floatTxt(p,t,c){const q=p.clone().project(C);if(q.z>1)return;const e=document.createElement('div');e.className='ft';e.textContent=t;e.style.cssText=`left:${(q.x*.5+.5)*innerWidth}px;top:${(-q.y*.5+.5)*innerHeight}px;color:${c}`;$('#hud').appendChild(e);setTimeout(()=>e.remove(),800)}
function juiceHit(b,d,head){b.fl=.08;burst(V(b.x,head?1.75:1,b.z),head?9:5,head?0xffd24a:0xffffff,4,.3,.07);floatTxt(V(b.x+(Math.random()-.5)*.6,2.2,b.z),Math.round(d)+(head?'!':''),head?'#ffd24a':'#ffffff')}
function juiceKill(b,head){burst(V(b.x,1,b.z),26,0xb5452e,7,.9,.18);burst(V(b.x,1.4,b.z),8,0x62e0f0,5,.7,.1);shake=Math.max(shake,.3);beep(1200,.12,'triangle',.07);setTimeout(()=>beep(1700,.14,'triangle',.06),70);
 streak=t0-lastKillT<3.5?streak+1:1;lastKillT=t0;const m=['','Headshot!','Double Kill!','Triple Kill!','Overkill!','Killing Spree!'];msg(streak>1?m[Math.min(streak,5)]:head?m[1]:'+1 Kill',1.3)}
function juiceReset(){for(const p of pts)S.remove(p.m);pts.length=0;streak=0;lastKillT=-9;shake=0;const h=$('#hint');h.style.opacity=1;setTimeout(()=>h.style.opacity=0,11000);msg(MODES[mode]||'First to 15 kills',3)}
function juiceTick(dt){
 shake*=Math.exp(-7*dt);if(shake>.01){C.position.x+=(Math.random()-.5)*shake*shk*.25;C.position.y+=(Math.random()-.5)*shake*shk*.25;C.rotation.z=(Math.random()-.5)*shake*shk*.06}
 fk*=Math.exp(-10*dt);C.fov+=(fovBase*(1-ST.ads*ST.zoom)+fk*4+(P.spr||0)*5-C.fov)*Math.min(1,dt*10);C.updateProjectionMatrix();
 flashL*=Math.exp(-28*dt);muz.intensity=flashL*3;sw.x*=Math.exp(-8*dt);sw.y*=Math.exp(-8*dt);gun.rotation.y=sw.x;gun.rotation.z=sw.x*.5+sw.y*.3+rlRoll();
 $('#cx').style.transform=`scale(${(tg?.85:1)+kick*30})`;if(P.hp<P.mhp*.35&&!P.dead)dmA=Math.max(dmA,.22+.12*Math.sin(t0*6));
 for(const b of bots)if(b.fl>0){b.fl-=dt;for(const c of b.m.children)if(c.material&&c.material.emissive)c.material.emissive.setHex(b.fl>0?0x999999:0)}
 for(let i=pts.length-1;i>=0;i--){const p=pts[i];p.l-=dt;p.v.y-=16*dt;p.m.position.addScaledVector(p.v,dt);if(p.m.position.y<.05){p.m.position.y=.05;p.v.multiplyScalar(.4);p.v.y=0}p.m.scale.setScalar(p.s*Math.min(1,p.l/p.L*1.6));if(p.l<=0){S.remove(p.m);pts.splice(i,1)}}}
function endGame(t){if(over)return;if(netOn&&isHost&&mode!='Private')mpEnd(t);over=1;run=0;paused=0;won=t=='Victory';document.exitPointerLock&&document.exitPointerLock();const sc=mode=='Slayer'?Math.max(0,3000-Math.round(t0*10)):kills*100+(mode=='Survival'?wave*50:mode=='Zombies'&&zq?zq.r*200:0),k='sd-best-'+mode+sel.map;let best=0,nb='';try{best=+localStorage.getItem(k)||0;if(sc>best){localStorage.setItem(k,sc);nb=' · New best!'}}catch(e){}
 finStart(t,sc,nb,awardXP())}

/* ===================== features.js ===================== */
/* ---------- Call of Duty x Halo features: melee, radar, killstreaks, power weapons, pickups, XP ranks, kill feed ---------- */
W.RL={n:'Rocket Launcher',d:1,r:1.1,m:2,sp:.002,rc:8,pel:1,au:0,rl:2.5,len:.7,col:0x7a3a2a,ex:{R:7,d:140,imp:0,w:'RL'}};
W.SN={n:'Sniper Rifle',d:110,r:.9,m:4,sp:.0005,rc:6,pel:1,au:0,rl:3,len:.8,col:0x2a2f4a};
const PN={RL:'Rocket Launcher',SN:'Sniper Rifle',OS:'Overshield',HP:'Health',AM:'Ammo'},PC={RL:0xff5a3a,SN:0xb080ff,OS:0x62e0f0,HP:0x7bd86b,AM:0xffd24a},TITLES=['Recruit','Private','Corporal','Sergeant','Lieutenant','Captain','Major','Colonel','General','Spartan'];
let pk=[],ks=0,q=[],uav=0,mxp=0,mn=0,src='';
function featReset(){for(const p of pk)S.remove(p.m);pk=[];ks=0;q=[];uav=0;mxp=0;mUps=[];mCost=need();mn=0;$('#kf').innerHTML='';
 for(const t of mode=='Zombies'?[]:['RL','SN','OS','HP','AM','AM']){const[x,z]=spawnPt(0),m=new THREE.Group(),b=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:PC[t]}));b.scale.setScalar(.6);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,6,8),new THREE.MeshBasicMaterial({color:PC[t],transparent:true,opacity:.18}));beam.position.y=3;m.add(b,beam);m.position.set(x,1,z);S.add(m);pk.push({t,x,z,m,b,on:1,rt:0,col:'#'+PC[t].toString(16).padStart(6,'0')})}}
function giveOS(){if(!P.os)P.msh+=50;P.os=20;P.sh=P.msh}
function grab(p){const t=p.t;p.on=0;p.m.visible=false;p.rt=t=='RL'||t=='SN'?45:25;beep(900,.12,'triangle',.08);msg(PN[t],1.2);
 if(t=='OS')giveOS();else if(t=='HP')P.hp=Math.min(P.mhp,P.hp+30);else if(t=='AM'){for(const w of wp)if(!w.pw){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}}
 else{let i=wp.findIndex(w=>w.k==t);if(i<0){wp.push({k:t,...eff(t,[]),pw:1,mag:0,res:0});i=wp.length-1}const w=wp[i];w.mag=w.m;w.res=w.m*2;cur=i;rel=0;setGun()}}
function feed(t){const e=document.createElement('div');e.textContent=t;$('#kf').prepend(e);while($('#kf').children.length>4)$('#kf').lastChild.remove();setTimeout(()=>e.remove(),4500)}
function featKill(b,head){ks++;wkill(srcK);const x=killXP(head);feed(`You ▸ ${b.hb?b.nm:b.net?names[b.id]:b.nm||'Grunt'}  [${src}]${head?' ★':''}  +${x}`);
 if(typeof skAward=='function')skAward()}
function useStreak(i){i=i||0;if(mode=='Zombies')return zUse();if(q.length<=i||P.dead)return;const s=q.splice(i,1)[0];beep(500,.2,'sine',.1);
 if(s=='UAV'){uav=20;msg('UAV online',1.5)}else if(s=='Shield Boost'){giveOS();msg('Shield Boost!',1.5)}
 else carpetBomb()}
/* knife: one-shots early zombies, then needs more and more swings as the rounds climb (never fully useless) */
function zMel(b){const r=zq?zq.r:1;if(r<=2)return 9999;const hp=isFinite(b.mhp)&&b.mhp<1e8?b.mhp:zHp(r)*(b.big?3:1),n=Math.min(20,1+(r-2)*.6);return Math.ceil(hp/n)}
function melee(){if(t0<mn||P.dead)return;mn=t0+.55;src='Melee';srcK='';if(typeof katSwing=='function')katSwing();else gun.position.z=-1.05;noise(.12,2200,.25);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));mv(P,f.x*.7,f.z*.7,.4);kick+=.025;shake=Math.max(shake,.25);let n=0;
 for(const b of bots){if(!b.al||ally(b))continue;const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);if(D<3.1&&(dx*f.x+dz*f.z)/D>.2){hitBot(b,mode=='Zombies'?zMel(b):100,0);beep(1400,.06,'square',.05);if(++n>=3)break}}}
function dirInd(b){if(!b)return;lastDir.set(P.x-b.x,0,P.z-b.z).normalize();const r=Math.atan2(b.x-P.x,b.z-P.z)-(yaw+Math.PI),e=$('#di');e.style.transform=`rotate(${r}rad)`;e.style.animation='none';void e.offsetWidth;e.style.animation='di 1s forwards'}
function radar(){const c=$('#rd').getContext('2d'),R0=(uav>0||(typeof SK!='undefined'&&(SK.prT>0||SK.advT>0)))?70:28,k=72/R0,s=Math.sin(yaw),co=Math.cos(yaw);c.clearRect(0,0,150,150);c.fillStyle='rgba(8,20,26,.65)';c.beginPath();c.arc(75,75,73,0,7);c.fill();c.strokeStyle=uav>0?'#62e0f0':'#62e0f044';c.beginPath();c.arc(75,75,36,0,7);c.stroke();
 c.save();c.beginPath();c.arc(75,75,72,0,7);c.clip();for(const b of bx){if(b.h<=.9||(b.y0||0)>=2.5)continue;const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,rr=Math.hypot(b.x1-b.x0,b.z1-b.z0)/2;if(Math.hypot(cx-P.x,cz-P.z)>R0*1.45+rr)continue;c.fillStyle=b.h>3?'rgba(150,165,175,.6)':b.h>1.5?'rgba(110,125,135,.55)':'rgba(85,100,110,.5)';c.beginPath();let f0=1;for(const[x,z]of[[b.x0,b.z0],[b.x1,b.z0],[b.x1,b.z1],[b.x0,b.z1]]){const dx=x-P.x,dz=z-P.z,px=75+(dx*co-dz*s)*k,py=75-(-dx*s-dz*co)*k;f0?c.moveTo(px,py):c.lineTo(px,py);f0=0}c.closePath();c.fill()}c.restore();
 const dot=(x,z,col,r)=>{const dx=x-P.x,dz=z-P.z,px=75+(dx*co-dz*s)*k,py=75-(-dx*s-dz*co)*k;if(Math.hypot(px-75,py-75)>70)return;c.fillStyle=col;c.fillRect(px-r,py-r,r*2,r*2)};
 for(const p of pk)if(p.on)dot(p.x,p.z,p.col,2);for(const f of flags)dot(f.x,f.z,f.team=='A'?'#62a8ff':'#ff5a3a',4);for(const z of zones)dot(z.x,z.z,z.o=='A'?'#62a8ff':z.o=='B'?'#ff5a3a':'#cccccc',4);if(typeof skRadar=='function')skRadar(dot,(x,z)=>{const dx=x-P.x,dz=z-P.z;return[75+(dx*co-dz*s)*k,75-(-dx*s-dz*co)*k]},c);else for(const b of bots)if(b.al)dot(b.x,b.z,ally(b)?'#62e0f0':'#ff5a3a',3);c.fillStyle='#62e0f0';c.beginPath();c.moveTo(75,68);c.lineTo(70,80);c.lineTo(80,80);c.fill()}
function featTick(dt){uav-=dt;if(P.os>0){P.os-=dt;if(P.os<=0){P.msh-=50;P.sh=Math.min(P.sh,P.msh)}}
 for(const p of pk){if(p.on){p.m.rotation.y+=dt*2;p.m.position.y=1+Math.sin(t0*3)*.15;if(!P.dead&&Math.hypot(P.x-p.x,P.z-p.z)<1.3&&P.y<2.5)grab(p)}else{p.rt-=dt;if(p.rt<=0){p.on=1;p.m.visible=true}}}
 const w=cw();if(w&&w.pw&&w.mag<=0&&w.res<=0&&rel<=0){wp.splice(cur,1);cur=0;setGun()}
 ksHud();radar();camoFx()}

/* ===================== vmp.js ===================== */
/* ---------- VMP: very fast SMG with a custom model (long mag, top rail, toothed muzzle drum, gold accents) ---------- */
W.VMP={n:'VMP-X',d:24,r:.042,m:36,sp:.03,rc:.5,pel:1,au:1,rl:1.8,len:.55,col:0x23262b};PRI.push('VMP');
const vmpG=new THREE.Group(),dk=new THREE.MeshLambertMaterial({color:0x15171a}),gd=new THREE.MeshLambertMaterial({color:0xc9a94d});
const bp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;vmpG.add(p);return p};
bp(0,.06,.035,.38,0,.072,-.27,dk);mkSights(vmpG,{st:'vmp',ap:1,yt:.125,yb:.09,yf:.09,zr:-.12,zf:-.44});bp(0,.084,.03,.18,0,.03,-.32,gd);
bp(new THREE.CylinderGeometry(.02,.022,.12,10),0,0,0,0,0,-.6,dk,Math.PI/2);bp(new THREE.CylinderGeometry(.05,.05,.07,12),0,0,0,0,0,-.5,dk,Math.PI/2);
bp(0,.06,.11,.2,0,-.01,.1,dk);bp(0,.04,.12,.05,0,-.1,-.08,dk,.25);vmpG.userData.mag=[bp(0,.04,.22,.065,0,-.2,-.15,dk,.12),bp(0,.042,.025,.067,0,-.13,-.15,gd,.12)];
vmpG.visible=false;gun.add(vmpG);
/* ---------- KN-115: original AK-style rifle model (tri-prong muzzle, rail handguard, gas tube, curved copper mag, angular stock) ---------- */
W.AR.n='KN-115';
const knG=new THREE.Group(),dk2=new THREE.MeshLambertMaterial({color:0x2b2e33}),cu=new THREE.MeshLambertMaterial({color:0xb8651f}),tealM=new THREE.MeshLambertMaterial({color:0x3fd0c9});
const kp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;knG.add(p);return p},cyl=(r,l)=>new THREE.CylinderGeometry(r,r,l,10);
kp(0,.06,.025,.32,0,.062,-.2,dk);kp(0,.078,.012,.2,0,.03,-.2,tealM);
kp(0,.062,.1,.12,0,-.005,.04,dk2);kp(0,.066,.13,.26,0,-.012,.2,dk2);kp(0,.07,.17,.04,0,-.022,.34,dk2);kp(0,.05,.03,.24,0,.07,.18,dk);
kp(0,.085,.085,.3,0,-.005,-.53,dk2);kp(0,.05,.02,.28,0,.05,-.53,dk);kp(0,.07,.035,.24,0,-.07,-.53,dk);kp(cyl(.011,.28),0,0,0,0,.062,-.55,dk,Math.PI/2);
kp(cyl(.014,.22),0,0,0,0,.005,-.79,dk,Math.PI/2);kp(cyl(.03,.012),0,0,0,0,.005,-.9,dk,Math.PI/2);kp(cyl(.022,.06),0,0,0,0,.005,-.95,dk,Math.PI/2);
for(const a of[0,2.094,4.188])kp(0,.01,.012,.05,Math.cos(a)*.026,.005+Math.sin(a)*.026,-.99,dk);
kp(0,.03,.04,.03,0,.045,-.82,dk);mkSights(knG,{st:'kn',ap:1,yt:.112,yb:.0745,yf:.065,zr:-.09,zf:-.82});
knG.userData.mag=[kp(0,.045,.25,.07,0,-.165,-.19,cu,.3),kp(0,.05,.018,.075,0,-.285,-.158,dk2,.3)];
kp(0,.04,.11,.055,0,-.115,-.02,dk2,-.32);kp(0,.012,.012,.1,0,-.075,-.1,dk);
knG.visible=false;knG.position.z=-.12;gun.add(knG);
const _sg=setGun;setGun=function(){_sg();const k=cw().k;vmpG.visible=k=='VMP';knG.visible=k=='AR';if(k=='VMP'){gb.scale.set(.08,.1,.42);gb.position.set(0,0,-.25);gf.position.z=-.62}if(k=='AR'){gb.scale.set(.075,.1,.36);gb.position.set(0,0,-.2);gf.position.z=-1.16}};

/* ===================== raygun.js ===================== */
/* ---------- RayGun: retro sci-fi blaster secondary. One click = one big red beam with splash damage. 20 rounds max. ---------- */
W.CY={n:'Coyote',d:26,r:.085,m:60,sp:.018,rc:1.3,pel:1,au:1,rl:4.2,len:.7,col:0x2e3238};PRI.push('CY');
W.RG={n:'RayGun',d:48,r:.38,m:20,rs:0,sp:.002,rc:3.5,pel:1,au:0,rl:1.6,len:.45,col:0xb02a22,ex:{R:4.4,d:62,imp:0,w:'RG',c:0xff2a2a}};SEC.push('RG');W.CT={n:'1911',d:30,r:.16,m:8,sp:.006,rc:2.2,pel:1,au:0,rl:1.5,len:.32,col:0x1d2128};SEC.push('CT');
const rgG=new THREE.Group(),rm=gb.material,rgSteel=new THREE.MeshLambertMaterial({color:0x9aa0a6}),rgBrass=new THREE.MeshLambertMaterial({color:0xc9a94d}),rgGlow=new THREE.MeshBasicMaterial({color:0xff3030}),rgGauge=new THREE.MeshBasicMaterial({color:0xffb454});
const rp=(g,x,y,z,m,rx,ry,rz,glow)=>{const p=new THREE.Mesh(g,m);p.position.set(x,y,z);p.rotation.set(rx||0,ry||0,rz||0);if(glow)p.userData.glow=1;rgG.add(p);return p},
 rbx=(w,h,d,x,y,z,m,rx)=>{const p=rp(bg,x,y,z,m,rx);p.scale.set(w,h,d)},cy=(a,b,h)=>new THREE.CylinderGeometry(a,b,h,12),tor=(r,t)=>new THREE.TorusGeometry(r,t,6,14),P2=Math.PI/2;
rp(new THREE.SphereGeometry(.075,16,12),0,.015,.03,rm);rbx(.06,.06,.22,0,-.01,-.06,rm);rbx(.018,.05,.16,0,.062,-.1,rm,.15);
rp(cy(.045,.045,.012),-.07,.015,.03,rgGauge,0,0,P2,1);rbx(.004,.03,.004,-.077,.02,.03,rgSteel,0);
rp(cy(.004,.004,.14),-.03,.09,.02,rgBrass,0,0,.6);rp(cy(.004,.004,.15),0,.105,.02,rgBrass,-.35);rp(cy(.004,.004,.14),.03,.09,.02,rgBrass,0,0,-.6);
rp(cy(.032,.032,.22),0,.012,-.22,rgGlow,P2,0,0,1);for(const z of[-.15,-.22,-.29])rp(tor(.043,.008),0,.012,z,rgBrass);
rp(cy(.012,.012,.16),0,.012,-.38,rgSteel,P2);rp(cy(.06,.022,.12),0,.012,-.46,rm,-P2);rp(tor(.058,.005),0,.012,-.515,rgBrass);rp(new THREE.SphereGeometry(.012,8,6),0,.012,-.54,rgGlow,0,0,0,1);
rp(tor(.03,.004),0,.118,-.36,rgBrass);rp(cy(.004,.004,.06),0,.082,-.36,rgBrass);
rbx(.045,.15,.06,0,-.115,.03,rm,-.25);for(let i=0;i<5;i++){const y=-.07-.025*i;rbx(.048,.008,.064,0,y,.03-(y+.115)*.25,rgSteel,-.25)}
rbx(.004,.034,.004,0,.1,-.06,rgSteel);rgG.userData.sight={yt:.138,zr:-.01};rbx(.01,.012,.1,0,-.075,-.1,rgSteel);rbx(.01,.045,.012,0,-.098,-.145,rgSteel);
rgG.visible=false;rgG.position.set(0,.02,.05);gun.add(rgG);
{const cell=new THREE.Mesh(bg,rgGlow),cap=new THREE.Mesh(bg,rgBrass);cell.scale.set(.045,.07,.045);cell.position.set(0,.1,.085);cap.scale.set(.05,.014,.05);cap.position.set(0,.14,.085);cell.userData.glow=cap.userData.glow=1;rgG.add(cell,cap);rgG.userData.mag=[cell,cap]}
const _sg2=setGun;setGun=function(){_sg2();const rg=cw().k=='RG';rgG.visible=rg;gf.material.color.setHex(rg?0xff4040:0xffdd66);if(rg){gb.scale.set(.06,.06,.22);gb.position.set(0,-.01,-.06);gf.position.z=-.6}};
/* red beam + blaster sound */
const bmG=new THREE.CylinderGeometry(1,1,1,10);
function rgBeam(o,d,len,raw){const s=raw?o.clone():o.clone().add(d.clone().multiplyScalar(.7)).add(V(0,-.12,0)),e=o.clone().add(d.clone().multiplyScalar(len)),mid=s.clone().add(e).multiplyScalar(.5),L=s.distanceTo(e),dir=e.clone().sub(s).normalize();
 for(const[r,c,op]of[[.1,0xff1a1a,.55],[.04,0xffd0d0,.95]]){const m=new THREE.Mesh(bmG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op}));m.position.copy(mid);m.scale.set(r,L,r);m.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(m);fx.push({m,l:.16,fade:op,r})}}
function pew(a=1){try{ac=ac||new AudioContext();const t=ac.currentTime,mk=(ty,f0,f1,d,v)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(v*vol*a,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)};mk('sawtooth',1500,120,.28,.12);mk('square',900,80,.22,.06);mk('sine',2400,400,.12,.05)}catch(e){}}

/* ===================== worldgun.js ===================== */
/* ---------- weapons held by bots and other players: 3D model in their hands, muzzle flash, tracers from the barrel, positional shot sounds ---------- */
const WG={AR:[.95,0x3a4a52,1,0xb8651f],SMG:[.6,0x5a4a40,0,0x222222],BR:[.95,0x2f4a3a,1,0x222222],SG:[.9,0x6a5a2a,1,0x222222],VMP:[.65,0x23262b,1,0x222222],MG:[.5,0x1b2027,0,0x222222],CT:[.35,0x1d2128,0,0x222222],MP:[.4,0x3a3a4a,0,0x222222],CY:[1,0x2e3238,1,0x222222],RL:[1.1,0x7a3a2a,1,0x222222],SN:[1.2,0x2a2f4a,1,0x222222],RG:[.55,0xb02a22,0,0xff3030]};
const fMat=new THREE.MeshBasicMaterial({color:0xffe08a}),fMatR=new THREE.MeshBasicMaterial({color:0xff4040}),BOTGUNS=['AR','SMG','BR','SG','VMP','MG','MP','RG','CY','CT'];
/* magazine per weapon: [width, height, depth, y, z (fraction of gun length), tilt, colour]. Light colours so they read against the dark bodies */
const MS={AR:[.05,.2,.075,-.16,.34,.25,0xb8651f],SMG:[.05,.25,.07,-.17,.34,.12,0x7f8a92],BR:[.055,.19,.075,-.15,.36,.2,0x6f7a62],VMP:[.05,.25,.07,-.17,.34,.12,0x30343a],MG:[.045,.15,.065,-.12,.1,-.3,0x9aa2a8],MP:[.05,.21,.065,-.13,.1,-.3,0x8a8f95],SN:[.05,.1,.09,-.1,.3,0,0x6a6f8a]};
/* pump-action shotgun modelled on the reference picture: ventilated rib barrel, magazine tube with end cap, ribbed wooden pump, steel receiver with brown plate, trigger guard, wooden stock. Built along +z (muzzle at z=.9); the pump pieces are returned in userData.pump so they can slide */
function mkSG(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),steel=rm||M(0x555a62),wood=M(0x9a602b),dwood=M(0x5c3a1c),gm=M(0x2b3037),blk=M(0x14171a),rib=M(0x424950),brass=M(0xc9a94d),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.062,.09,.24,0,0,.04,steel);box(.066,.028,.08,0,.02,.09,blk);box(.066,.04,.05,0,-.005,-.03,M(0x7a3f2b));
 box(.04,.04,.78,0,.036,.51,gm);box(.022,.01,.7,0,.061,.5,blk);for(let i=0;i<12;i++)box(.03,.012,.016,0,.066,.2+i*.05,rib);
 box(.05,.05,.024,0,.036,.894,blk);
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,.56,10),M(0x3a4047));t.rotation.x=Math.PI/2;t.position.set(0,-.012,.38);g.add(t);box(.044,.044,.03,0,-.012,.675,blk);
 const pump=[box(.074,.066,.26,0,-.016,.36,wood),box(.076,.07,.02,0,-.016,.49,dwood)];for(const z of[.27,.31,.35,.39,.43])pump.push(box(.078,.012,.012,0,-.016,z,dwood));
 box(.012,.012,.09,0,-.068,.02,gm);box(.012,.034,.012,0,-.05,.062,gm);box(.012,.034,.012,0,-.05,-.025,gm);box(.008,.026,.008,0,-.05,.02,steel);
 box(.052,.08,.15,0,-.035,-.15,wood,-.08);box(.048,.115,.3,0,-.07,-.3,wood,-.14);box(.05,.135,.018,0,-.105,-.46,M(0x2a2018),-.14);box(.01,.02,.016,0,-.135,-.37,M(0xaaaaaa));
 mkSights(g,{st:'bead',ap:0,yt:.098,yb:.066,yf:.066,zr:.23,zf:.885,fmat:brass});g.userData.a={r:[0,-.1,-.06],l:[0,-.075,.36],m:[0,-.1,.08]};g.userData.mags=[];g.userData.pump=pump;return g}
/* Coyote: LMG modelled on the reference picture: blocky muzzle device with two bores, striped shroud, forward handle, big drum magazine and an open-frame stock around an energy tube. Built along +z, muzzle at z=.95 */
function mkCY(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),body=rm||M(0x2e3238),dk=M(0x24282d),md=M(0x3a3f46),lt=M(0x6a6f75),tan=M(0xc9a46a),blk=M(0x0b0b0c),
  box=(w,h,d,x,y,z,m,rx,ry)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;g.add(o);return o},
  cyl=(r,h,x,y,z,m,ax)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);if(ax)o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o};
 box(.1,.12,.44,0,0,.1,body);box(.125,.07,.62,0,.095,.42,md);for(const z of[.28,.46,.64])box(.04,.008,.2,0,.134,z,tan,0,.6);
 box(.1,.09,.5,0,-.012,.55,dk);box(.04,.03,.42,0,-.07,.58,lt);box(.02,.05,.02,0,-.1,.42,lt);box(.02,.05,.02,0,-.1,.6,lt);box(.025,.02,.2,0,-.125,.51,lt);
 box(.15,.15,.16,0,0,.87,md);box(.045,.05,.012,-.035,0,.957,blk);box(.045,.05,.012,.035,0,.957,blk);mkSights(g,{st:'cy',ap:1,yt:.205,yb:.13,yf:.13,zr:.14,zf:.745});
 box(.05,.14,.07,0,-.13,0,dk,.25);box(.012,.012,.1,0,-.085,.12,dk);box(.012,.035,.012,0,-.07,.17,dk);box(.012,.035,.012,0,-.07,-.05,dk);
 box(.03,.03,.38,0,.08,-.3,dk);box(.03,.03,.34,0,-.06,-.28,dk,-.12);box(.035,.2,.03,0,0,-.47,dk);cyl(.02,.3,0,.01,-.3,M(0xd9b0c4),1);
 box(.1,.05,.1,0,-.095,.3,dk);
 const drum=cyl(.085,.2,0,-.19,.28,md),cap=cyl(.075,.025,0,-.3,.298,dk);drum.rotation.x=cap.rotation.x=-.18;
 g.userData.a={r:[0,-.13,0],l:[0,-.115,.51],m:[0,-.19,.28]};g.userData.mags=[drum,cap];return g}
/* 1911: single-stack semi-auto pistol modelled on the reference picture: blued slide with rear serrations, spur hammer, beavertail, checkered wood grips with screws, trigger guard. Built along +z, muzzle at z=.35 */
function mk1911(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),sl=rm||M(0x1d2128),fr=M(0x2a2f36),wood=M(0x7b3f1d),dwood=M(0x5a2c12),blk=M(0x0c0d0f),steel=M(0x8a9098),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.032,.04,.33,0,.036,.17,sl);box(.034,.004,.3,0,.056,.17,blk);for(let i=0;i<6;i++)box(.034,.034,.006,0,.038,.012+i*.014,blk);
 box(.024,.022,.03,0,.03,.345,fr);mkSights(g,{st:'tri',ap:0,yt:.077,yb:.058,yf:.058,zr:.03,zf:.33});
 box(.03,.028,.24,0,.0,.13,fr);box(.034,.01,.1,0,.0,.2,fr);
 box(.03,.1,.052,0,-.07,.0,fr,.26);box(.007,.092,.046,.0185,-.07,.0,wood,.26);box(.007,.092,.046,-.0185,-.07,.0,wood,.26);for(const s of[-1,1])box(.008,.016,.016,s*.0195,-.045,.0,dwood,.26);
 box(.028,.016,.05,0,.018,-.035,fr,-.2);box(.01,.02,.016,0,.054,-.022,sl,.5);
 box(.01,.01,.075,0,-.03,.083,fr);box(.01,.03,.01,0,-.015,.12,fr);box(.006,.02,.008,0,-.018,.063,steel);box(.004,.012,.03,.017,.014,.07,steel);
 const mg=[box(.026,.02,.05,0,-.125,-.012,blk,.26),box(.024,.04,.042,0,-.1,-.004,fr,.26)];
 g.userData.a={r:[0,-.075,.0],l:[0,-.07,.02],m:[0,-.11,-.008]};g.userData.mags=mg;return g}
/* Revolver: 6 inch blued double-action modelled on the reference picture: vented rib barrel with underlug, ramp front sight, fluted cylinder, spur hammer, walnut grips with gold medallion */
function mkRV(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),bl=rm||M(0x1b2027),fr=M(0x242a32),wood=M(0x6a3d1c),dw=M(0x4a2810),blk=M(0x0b0c0e),gold=M(0xd4b24c),orange=M(0xff7a1a),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.026,.032,.34,0,.044,.36,bl);box(.014,.01,.34,0,.066,.36,blk);for(let i=0;i<5;i++)box(.016,.012,.03,0,.07,.24+i*.06,fr);box(.026,.03,.27,0,.013,.34,bl);box(.014,.014,.04,0,.018,.505,blk);
 mkSights(g,{st:'ramp',ap:0,yt:.1,yb:.078,yf:.071,zr:.012,zf:.5,fmat:orange});box(.028,.036,.012,0,.043,.535,fr);
 box(.034,.075,.15,0,.03,.07,fr);box(.03,.016,.16,0,.07,.07,bl);
 const cy=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.06,12),bl);cy.rotation.x=Math.PI/2;cy.position.set(0,.036,.11);g.add(cy);
 for(let i=0;i<6;i++){const a=i/6*6.283,f=box(.007,.012,.062,Math.sin(a)*.037,.036+Math.cos(a)*.037,.11,blk);f.rotation.z=-a}
 box(.01,.04,.018,0,.07,-.035,fr,-.55);box(.006,.03,.014,0,.05,-.02,fr,-.3);
 box(.034,.108,.062,0,-.065,-.042,wood,.3);box(.01,.08,.012,.0,-.07,-.075,bl,.3);for(const s of[-1,1])box(.006,.016,.016,s*.0195,-.05,-.042,gold,.3);for(const s of[-1,1])box(.004,.09,.05,s*.0185,-.07,-.042,dw,.3);
 box(.01,.01,.09,0,-.03,.068,fr);box(.01,.034,.01,0,-.016,.112,fr);box(.006,.022,.008,0,-.012,.05,blk);box(.014,.016,.03,0,.008,.0,fr);
 g.userData.a={r:[0,-.075,-.04],l:[0,-.05,.16],m:[0,.036,.11]};g.userData.mags=[];return g}
/* iron sights: thin, not blocky. ap = rear aperture (two uprights + top and bottom bar, hole in the middle) with a front post inside protective ears;
   otherwise a rear notch (two thin blocks with a gap) with a front blade. yt is the height of the sight line (aperture centre / top of the notch and blade tip),
   yb the surface the rear sight stands on, yf the surface the front sight stands on, zr / zf the positions along the gun. Coordinates are in the group's own space. */
function buildGun(k,rm,g){const[l,c,st]=WG[k]||WG.AR;g=g||new THREE.Group();if(k=='MG')return mkRV(g,rm);if(k=='CT')return mk1911(g,rm);if(k=='SG')return mkSG(g,rm);if(k=='CY')return mkCY(g,rm);if(k=='MVR')return mkMVR(g,rm);if(typeof MODELS!='undefined'&&MODELS[k])return MODELS[k](g,rm);const mags=[],add=(w,h,d,x,y,z,col,rx,isMag)=>{const m=new THREE.Mesh(bg,col==='r'&&rm?rm:new THREE.MeshLambertMaterial({color:col==='r'?c:col}));m.scale.set(w,h,d);m.position.set(x,y,z);if(rx)m.rotation.x=rx;g.add(m);if(isMag)mags.push(m)};
 if(k=='RG'){add(.08,.1,.3,0,0,.15,'r');add(.05,.05,.26,0,.01,.2,0xff3030);add(.1,.1,.09,0,0,.36,'r');add(.045,.14,.06,0,-.11,.06,'r',-.25);add(.14,.14,.06,0,.02,0,'r');
  add(.045,.07,.045,0,.085,.15,0xff3030,0,true);add(.05,.014,.05,0,.125,.15,0xc9a94d,0,true);g.userData.a={r:[0,-.1,.06],l:[0,-.04,.28],m:[0,.1,.15],pd:[0,.24,0],ho:[0,0,0]}}
 else{add(.09,.12,l*.5,0,0,l*.3,'r');add(.05,.025,l*.45,0,.07,l*.3,0x1a1a1a);add(.075,.08,l*.28,0,-.01,l*.66,0x2a2a2a);add(.035,.035,l*.3,0,.01,l*.9,0x141414);
  const ms=MS[k];if(k!='MG'&&k!='MP')add(.04,.12,.06,0,-.11,l*.1,0x222222,-.3);
  if(st){add(.07,.11,l*.26,0,-.015,-l*.08,'r');add(.03,.04,.06,0,.09,l*.2,0x1a1a1a)}if(k=='SN')add(.05,.05,.28,0,.11,l*.35,0x0a0a0a);
  if(k=='RL'){add(.12,.12,.12,0,0,-.02,0x2a2a2a);add(.075,.075,.14,0,0,l*.99,0xc0392b)}
  if(ms){const[mw,mh,md,my,mz,mr,mcl]=ms,z0=l*mz;add(mw,mh,md,0,my,z0,mcl,mr,true);add(mw*1.1,.022,md*1.1,0,my-mh/2*Math.cos(mr),z0-mh/2*Math.sin(mr),0xc9a94d,mr,true)}
  g.userData.a={r:[0,-.12,l*.1],l:[0,-.07,l*.66],m:ms?[0,ms[3],l*ms[4]]:[0,0,-.04]}}
 g.userData.mags=mags;addGunSights(g,k,l);return g}
function mkWorldGun(k){return buildGun(k)}
/* where a held weapon sits on a character: scaled so the distance from the stock (or grip, for pistols) to the foregrip is within the arm's reach, stock in the shoulder pocket for rifles, arms extended for pistols */
function holdFit(g){const bb=new THREE.Box3().setFromObject(g),A=g.userData.a||{},rz=(A.r||[0,0,0])[2],lz=(A.l||[0,0,rz+.4])[2],minz=bb.min.z,len=Math.max(.2,bb.max.z-minz),s=Math.min(1,.62/Math.max(.3,lz-minz),1.0/len),stock=minz<-.18;return{s,gz:stock?.1-minz*s:.46-rz*s,mz:bb.max.z}}
function setHeld(b,k,cm,at){cm=cm||'';const ak=(at||[]).join(',');if(!k||(b.wk==k&&b.hg&&(b.cm||'')==cm&&(b.at||'')==ak))return;if(b.hg)b.m.remove(b.hg);b.wk=k;b.cm=cm;b.at=ak;b.hg=buildGun(k,typeof camoRm=='function'?camoRm(k,cm):undefined);try{b.hold=holdFit(b.hg)}catch(e){b.hold=null}if(at&&at.length&&typeof attApply=='function')try{attApply(b.hg,k,at,1)}catch(e){}b.hg.position.set(.12,1.3,.18);b.m.add(b.hg)}
function muzzle(b){const l=(WG[b.wk]||WG.AR)[0],r=b.m.rotation.y,ox=.12,oz=b.hold?b.hold.gz+b.hold.mz*b.hold.s:.18+l*1.05,s=Math.sin(r),c=Math.cos(r);return V(b.x+ox*c+oz*s,(b.y||0)+1.36-.3*(b.pc||0)-.42*(b.psl||0)-1.05*(b.pp||0)+(b.net?(b.pis||0)*.5:0),b.z-ox*s+oz*c)}
function muzzleFlash(p,k){const m=new THREE.Mesh(sg,k=='RG'?fMatR:fMat);m.scale.setScalar(k=='SG'?.22:.13);m.position.copy(p);S.add(m);fx.push({m,l:.05})}
function otherSnd(k,p){const v=Math.max(0,1-p.distanceTo(C.position)/55);if(v<.06)return;if(k=='RG')return pew(v);noise(k=='SG'?.22:.1,k=='SG'?1800:3500,.3*v);beep(k=='SG'?90:140,.08,'sine',.12*v)}
function remoteShot(b,k,end,col){const mz=muzzle(b),dv=end.clone().sub(mz),L=dv.length();if(L<.1)return;dv.divideScalar(L);if(k=='RG')rgBeam(mz,dv,L,1);else tr(mz,dv,L,col||0xffd27a,.07,1);muzzleFlash(mz,k);otherSnd(k,mz)}
function falloff(w,d){return w.pw||w.k=='RG'?1:Math.max(w.pel>1?.2:.45,1-d/(w.pel>1?18:140))}

/* ===================== anim.js ===================== */
/* ---------- animation + movement: character rig with IK arms, first-person hands, reload animations, mantling, wall jumps ---------- */
const FPA={AR:{r:[0,-.115,-.14],l:[0,-.075,-.62],m:[0,-.2,-.32]},VMP:{r:[0,-.1,-.08],l:[0,-.06,-.38],m:[0,-.2,-.15]},RG:{r:[0,-.095,.08],l:[-.02,-.15,.09],m:[0,-.14,0],pd:[0,.24,0],ho:[0,0,0]}};
const fpG=new THREE.Group();gun.add(fpG);fpG.visible=false;
const eas=t=>t*t*(3-2*t),rlP=()=>rel>0&&cw()?1-rel/Math.max(.3,relT||cw().rl):-1,rlBell=()=>{const p=rlP();return p<0?0:Math.sin(Math.PI*p)};
const rlRot=()=>.42*rlBell(),rlRoll=()=>-.3*rlBell(),rlX=()=>.1*rlBell(),rlY=()=>.03*rlBell()-(P.mt?.12*Math.sin(Math.PI*P.mt.t/P.mt.d):0);
/* two-bone arm: upper arm and forearm groups meshes hang along -y; ik() points them so the hand reaches H */
const cyU=new THREE.CylinderGeometry(1,.82,1,10),cyS=new THREE.CylinderGeometry(1,1,1,10),hemiG=new THREE.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.55);
/* arms: tapered upper arm and forearm with shoulder, elbow and hand (sm sleeve, fm forearm, gm glove/hand) */
function mkArm(parent,L1,L2,sm,gm,th,fm){const up=new THREE.Group(),fo=new THREE.Group(),mk=(g,mt,sx,sy,sz,yy,p)=>{const o=new THREE.Mesh(g,mt);o.scale.set(sx,sy,sz);o.position.set(0,yy,0);o.castShadow=parent!==C;p.add(o)};
 mk(cyU,sm,th*.55,L1,th*.55,-L1/2,up);mk(sg,sm,th*.58,th*.58,th*.58,0,up);mk(cyU,fm||sm,th*.46,L2,th*.46,-L2/2,fo);mk(sg,fm||sm,th*.5,th*.5,th*.5,0,fo);mk(sg,gm,th*.52,th*.64,th*.5,-L2-th*.2,fo);
 parent.add(up,fo);return{up,fo,L1,L2}}
function ik(S0,H0,hint,arm){const L1=arm.L1,L2=arm.L2,d=H0.clone().sub(S0);let dist=d.length();const mx=L1+L2-.003;if(dist>mx){d.multiplyScalar(mx/dist);dist=mx}if(dist<.08)dist=.08;
 const dir=d.clone().normalize(),a=(L1*L1-L2*L2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,L1*L1-a*a)),pr=hint.clone().sub(dir.clone().multiplyScalar(hint.dot(dir)));if(pr.lengthSq()<1e-6)pr.set(0,-1,0);pr.normalize();
 const E=S0.clone().add(dir.clone().multiplyScalar(a)).add(pr.multiplyScalar(h)),dn=V(0,-1,0);
 arm.up.position.copy(S0);arm.up.quaternion.setFromUnitVectors(dn,E.clone().sub(S0).normalize());arm.fo.position.copy(E);arm.fo.quaternion.setFromUnitVectors(dn,H0.clone().sub(E).normalize())}
/* ---------- reload 2.0 ----------
   Each weapon reloads in its own way and the part being loaded really travels with the left hand:
   mag     magazine is pulled out, dropped, a fresh one is fetched from the belt, pushed in and slapped home
   shell   shotgun shells are fetched one at a time and pushed into the port under the receiver, then the pump is racked
   rocket  a rocket is fetched and slid into the rear of the launcher
   Poses are in the local space of the host group (camera-held gun for the player, world gun for bots). fz = -1 / +1 is the gun's forward axis. */
const RLK={CT:'mag',CY:'mag',AR:'mag',SMG:'mag',BR:'mag',VMP:'mag',SN:'mag',MG:'mag',MP:'mag',RG:'mag',SG:'shell',RL:'rocket'};
const mb=m=>m.userData.b0||(m.userData.b0={x:m.position.x,y:m.position.y,z:m.position.z,rx:m.rotation.x});
function toLoc(m,v,host){const q=m.parent&&m.parent!==host?m.parent.quaternion:null;return q?v.clone().applyQuaternion(q.clone().invert()):v.clone()}
function slotC(mags,host){if(mags.c)return mags.c;const c=V(0,0,0);for(const m of mags){const b=mb(m),p=V(b.x,b.y,b.z);if(m.parent&&m.parent!==host){m.parent.updateMatrix();p.applyMatrix4(m.parent.matrix)}c.add(p)}c.divideScalar(Math.max(1,mags.length));mags.c=c;return c}
function rlPose(kind,p,A,fz,n,mags,host,pl){
 const bk=-fz,L0=V(...A.l),M0=mags.length?slotC(mags,host).clone():V(...A.m),o={h:L0.clone(),mo:V(0,0,0),mr:0,mv:1,pv:0,pp:V(0,0,0),pu:V(0,0,bk*(pl||0)),ev:0,cy:0};
 if(p<0){o.h.add(o.pu);return o}
 const Pq=M0.clone().add(V(-.08,-.42,bk*.28));
 if(kind=='mag'){const HO=V(...(A.ho||[0,-.05,0])),D=V(...(A.pd||[0,-.3,0])),Mh=M0.clone().add(HO),Dh=Mh.clone().add(D),Eh=Dh.clone().add(V(-.12,D.y>0?.06:-.1,bk*.04)),carry=h=>{o.h.copy(h);o.mo.copy(h).sub(Mh);o.cy=1};
  if(p<.14)o.h.copy(L0).lerp(Mh,eas(p/.14));
  else if(p<.3)carry(Mh.clone().lerp(Dh,eas((p-.14)/.16)));
  else if(p<.4)carry(Dh.clone().lerp(Eh,eas((p-.3)/.1)));
  else if(p<.58){const t=(p-.4)/.1;o.h.copy(Eh).lerp(Pq,eas((p-.4)/.18));if(t<1){o.mo.copy(Eh).sub(Mh).add(V(-.06*t,-2*t*t,0));o.mr=1.4*t}else o.mv=0}
  else if(p<.66){o.h.copy(Pq);o.mo.copy(Pq).sub(Mh);o.cy=1}
  else if(p<.84)carry(Pq.clone().lerp(Dh,eas((p-.66)/.18)));
  else if(p<.92)carry(Dh.clone().lerp(Mh,eas((p-.84)/.08)));
  else o.h.copy(Mh).lerp(L0,eas((p-.92)/.08));
  o.ev=(p>.3?1:0)+(p>.86?1:0)}
 else if(kind=='shell'){const Mh=M0.clone().add(V(0,-.03,0)),c0=.08,c1=.82,cs=(c1-c0)/n;
  if(p<c0)o.h.copy(L0).lerp(Mh,eas(p/c0));
  else if(p<c1){const x=(p-c0)/cs,c=Math.floor(x),u=x-c;o.ev=c;
   if(u<.28)o.h.copy(Mh).lerp(Pq,eas(u/.28));
   else if(u<.4){o.h.copy(Pq);o.pv=1;o.pp.copy(Pq)}
   else if(u<.75){o.h.copy(Pq).lerp(Mh,eas((u-.4)/.35));o.pv=1;o.pp.copy(o.h)}
   else if(u<.88){o.h.copy(Mh);const t=(u-.75)/.13;o.pp.copy(Mh).add(V(0,.03*t,fz*.05*t));o.pv=t<.8?1:0;o.ev=c+1}
   else{o.h.copy(Mh);o.ev=c+1}
   if(o.pv)o.pp.add(V(0,.02,fz*.03))}
  else{const t=(p-c1)/(1-c1),pl2=t<.35?0:.11*Math.sin(Math.PI*Math.min(1,(t-.35)/.6));o.pu=V(0,0,bk*pl2);o.h.copy(Mh).lerp(L0,t<.3?eas(t/.3):1).add(o.pu);o.ev=n+(t>.6?1:0)}}
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
 else{cyl(.032,.34,0x9aa0a6,0);const n=new THREE.Mesh(new THREE.ConeGeometry(.032,.1,10),M(0xc0392b));n.rotation.x=Math.PI/2;n.position.z=.22;g.add(n);for(let i=0;i<3;i++){const f=new THREE.Mesh(bg,M(0x5a5f66));f.scale.set(.07,.008,.06);f.position.z=-.15;f.rotation.z=i*1.047;g.add(f)}}
 g.rotation.y=fz<0?Math.PI:0;g.userData.kind=kind;g.visible=false;return g}
function propFor(host,kind,fz){let pr=host.userData.prop;if(kind!='shell'&&kind!='rocket'){if(pr)pr.visible=false;return null}
 if(!pr||pr.userData.kind!=kind){if(pr)host.remove(pr);pr=mkProp(kind,fz);host.add(pr);host.userData.prop=pr}return pr}
/* keep the hand inside the arm's reach; whatever it carries (mag, shell, rocket) is shifted by the same amount so it never floats free of the hand */
function clampHand(o,S0,tw,q,R){const d=tw(o.h).sub(S0),L=d.length();if(L<=R)return;const sc=tw(V(1,0,0)).sub(tw(V(0,0,0))).length()||1,dv=d.multiplyScalar((R/L-1)/sc).applyQuaternion(q.clone().invert());o.h.add(dv);if(o.cy)o.mo.add(dv);if(o.pv)o.pp.add(dv)}
function applyRl(o,mags,pump,host,kind,fz){
 for(const m of mags){const b=mb(m),d=toLoc(m,o.mo,host);m.position.set(b.x+d.x,b.y+d.y,b.z+d.z);m.rotation.x=b.rx+o.mr;m.visible=!!o.mv}
 for(const m of pump){const b=mb(m),d=toLoc(m,o.pu,host);m.position.set(b.x+d.x,b.y+d.y,b.z+d.z)}
 const pr=propFor(host,kind,fz);if(pr){pr.visible=!!o.pv;if(o.pv)pr.position.copy(o.pp)}}
/* first-person arms (children of the camera) */
const fpSl=new THREE.MeshLambertMaterial({color:0x34402f}),fpGl=new THREE.MeshLambertMaterial({color:0x151515}),fpArm={r:mkArm(C,.62,.6,fpSl,fpGl,.1),l:mkArm(C,.62,.6,fpSl,fpGl,.1)};
const curAnch=k=>FPA[k]||fpG.userData.a||FPA.AR,curMags=k=>k=='AR'?knG.userData.mag||[]:k=='VMP'?vmpG.userData.mag||[]:k=='RG'?rgG.userData.mag||[]:fpG.userData.mags||[],curPump=k=>k=='SG'?fpG.userData.pump||[]:[];
let pf=1;const _sht=shoot;shoot=function(){const k=cw().k;_sht();if(k=='SG')pf=0};
function hideFP(){for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=false;const pr=gun.userData.prop;if(pr)pr.visible=false}
function fpUpdate(dt){const w=cw(),vis=run&&!P.dead&&!over&&w,k=vis&&w.k;for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=!!vis;if(!vis){const pr=gun.userData.prop;if(pr)pr.visible=false;return}
 if(pf<1)pf=Math.min(1,pf+dt/Math.max(.35,w.r*.9));
 const A=curAnch(k),p=rlP(),R0=V(...A.r),kind=RLK[k]||'mag',mg=curMags(k),pm=curPump(k),pl=k=='SG'&&p<0&&pf<1?.1*Math.sin(Math.PI*cl((pf-.12)/.7,0,1)):0,
  o=rlPose(kind,p,A,-1,cl(w.m-w.mag,1,6),mg,gun,pl);
 if(p>=0){if(o.ev>(P.ev||0))beep(o.ev%2?240:420,.06,'square',.06);P.ev=o.ev}else P.ev=0;
 const q=gun.quaternion,gp=gun.position,tw=a=>a.clone().applyQuaternion(q).add(gp);clampHand(o,V(-.2,-.45,.12),tw,q,1.19);applyRl(o,mg,pm,gun,kind,-1);
 ik(V(.26,-.45,.12),tw(R0),V(.4,-1,.3),fpArm.r);ik(V(-.2,-.45,.12),tw(o.h),V(-.4,-1,.3),fpArm.l)}
/* generic first-person model for weapons without a hand-made model */
const _sg3=setGun;setGun=function(){_sg3();const k=cw().k,sp=k=='AR'||k=='VMP'||k=='RG';gb.visible=sp;fpG.visible=!sp;for(const c of fpG.children.slice())fpG.remove(c);fpG.userData={};fpG.rotation.y=0;fpG.position.z=0;
 if(!sp){const l=WG[k]?WG[k][0]:.6,pz=k=='SG'||k=='CY'||k=='MVR'?-.12:-.14+.1*l;fpG.rotation.y=Math.PI;fpG.position.z=pz;buildGun(k,gb.userData.m0||gb.material,fpG);const a=fpG.userData.a,sgt=fpG.userData.sight,fc=([x,y,z])=>[-x,y,pz-z],fa={r:fc(a.r),l:fc(a.l),m:fc(a.m)};
  fpG.userData={a:fa,mags:fpG.userData.mags||[],pump:fpG.userData.pump||[],sight:sgt?{yt:sgt.yt,zr:pz-sgt.zr}:null};gf.position.z=pz-(k=='SG'?.9:k=='CY'?.95:k=='MVR'?1.0:l*1.05)-.04}
 applyCamo(k)};
/* third-person character: armoured body, legs that walk, two IK arms holding the weapon */
/* a human built from tapered limbs and spheres: head with face, ears and hair or helmet, neck, oval torso, tactical vest, jointed arms and legs, boots.
   children[0] is an invisible key mesh whose material is the uniform colour, so team tinting (children[0].material.color) tints shirt, sleeves and helmet. o.zombie makes a rotting undead variant. */
function mkHuman(m,o){o=o||{};m.rotation.order='YXZ';const L=c=>new THREE.MeshLambertMaterial({color:c}),LB=c=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.28}),pk=a=>a[Math.random()*a.length|0],
 skin=(o.zombie?L:LB)(o.skin!=null?o.skin:pk([0xf7d7ba,0xeab992,0xd6a37c,0xb98059,0x9c6b48])),am=L(o.shirt!=null?o.shirt:0xb5452e),pants=L(o.pants!=null?o.pants:pk([0x3a3f2f,0x2f3238,0x4a4638])),vest=L(0x2b2f26),boots=L(0x1c1a18),hair=(o.zombie?L:LB)(o.hair!=null?o.hair:pk([0x4a3626,0x6a4a30,0x3a3a3a,0x9a7a40,0xb8a46c])),dk=L(0x15171a),zb=!!o.zombie,
 add=(p,g,mt,sx,sy,sz,x,yy,z,rx)=>{const e=new THREE.Mesh(g,mt);e.scale.set(sx,sy,sz);e.position.set(x,yy,z);if(rx)e.rotation.x=rx;e.castShadow=true;p.add(e);return e};
 const key=new THREE.Mesh(bg,am);key.visible=false;m.add(key);
 const sh=new THREE.Group();sh.position.y=1;m.add(sh);
 const hip=[add(m,cyS,pants,.19,.2,.12,0,.96,0),add(m,cyS,dk,.2,.045,.13,0,1.03,0)];add(sh,cyU,am,.23,.58,.145,0,.29,0);
 if(!zb){add(sh,bg,vest,.46,.34,.3,0,.33,0);for(const x of[-.14,0,.14])add(sh,bg,vest,.1,.1,.07,x,.12,.17);add(sh,bg,vest,.34,.3,.07,0,.33,-.17);add(sh,bg,vest,.3,.34,.14,0,.28,-.27)}
 add(sh,cyS,skin,.055,.1,.055,0,.62,0);
 const head=new THREE.Group();head.position.set(0,.68,0);sh.add(head);if(zb){add(head,sg,skin,.105,.125,.115,0,.11,0);add(head,sg,skin,.09,.06,.1,0,.03,.03)}else{add(head,sg,skin,.088,.108,.098,0,.118,0);add(head,sg,skin,.07,.052,.08,0,.042,.022)}
 const eye=zb?new THREE.MeshBasicMaterial({color:o.eye||0xff2a2a}):L(0xf4f4f0);
 for(const sx of[-1,1]){if(zb){add(head,sg,eye,.02,.018,.012,sx*.04,.13,.105);add(head,bg,hair,.045,.01,.012,sx*.04,.165,.1);add(head,sg,skin,.018,.032,.02,sx*.108,.11,0)}
  else{add(head,sg,eye,.012,.007,.005,sx*.034,.128,.091);add(head,sg,dk,.0055,.0055,.004,sx*.034,.128,.094);add(head,bg,hair,.034,.006,.008,sx*.034,.147,.09);add(head,sg,skin,.01,.022,.014,sx*.088,.115,-.004)}}
 if(zb)add(head,bg,skin,.02,.04,.03,0,.1,.12);else{add(head,bg,skin,.013,.03,.02,0,.098,.098);add(head,bg,L(0x7a3b34),.03,.004,.006,0,.056,.1)}
 let jaw=null;if(zb){jaw=new THREE.Group();jaw.position.set(0,.05,.02);head.add(jaw);add(jaw,bg,skin,.11,.04,.12,0,-.02,.05);add(jaw,bg,L(0x3a0c0c),.08,.02,.08,0,0,.05)}
 if(!zb&&(o.helm!=null?o.helm:Math.random()<.7)){add(head,hemiG,am,.108,.118,.118,0,.126,-.002);add(head,bg,dk,.1,.022,.03,0,.155,.098)}else add(head,hemiG,hair,.095,.102,.104,0,.128,-.004);
 const leg=x=>{const l=new THREE.Group(),s=new THREE.Group();l.position.set(x,.98,0);add(l,cyU,pants,.085,.46,.085,0,-.23,0);add(l,sg,pants,.075,.075,.075,0,-.46,0);s.position.set(0,-.46,0);add(s,cyU,pants,.068,.44,.068,0,-.22,0);add(s,cyS,boots,.075,.1,.075,0,-.36,0);add(s,bg,boots,.12,.1,.27,0,-.43,.05);if(!zb)add(s,bg,dk,.1,.12,.05,0,-.02,.07);l.add(s);m.add(l);return[l,s]};
 const[legL,shinL]=leg(-.1),[legR,shinR]=leg(.1),glove=L(0x15151a),gm=zb?skin:glove,fm=zb?skin:am;
 const armR=mkArm(m,.36,.36,am,gm,.12,fm),armL=mkArm(m,.36,.36,am,gm,.12,fm);
 if(zb)for(let k=0;k<5;k++)add(sh,sg,L(0x5a0f0f),.035+Math.random()*.03,.03+Math.random()*.03,.02,(Math.random()-.5)*.3,.1+Math.random()*.4,.13);
 return{hip,legL,legR,shinL,shinR,armR,armL,sh,head,jaw,mat:{skin,am,pants,hair,vest}}}
/* shoulder position follows the leaning / twisting upper body so the arms stay attached */
const shPos=(r,side)=>{const l=r.lean||0,t=r.tw||0;return V(side*.3*Math.cos(t),1+.5*Math.cos(l)+(r.bob||0),.5*Math.sin(l)-side*.3*Math.sin(t))};
const angD=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b)),falls=[];
/* ---------- ragdoll: dead players, bots and zombies get thrown by the hit, tumble, collide with walls, land ON the highest thing under them
   and go limp (floppy spring-driven legs, head and arms). b.rag holds the state; bodyFall() is used for humans, zombies call ragStart() themselves ---------- */
const spr_=(l,tg,k,c,dt)=>{l.v+=(k*(tg-l.a)-c*l.v)*dt;l.a+=l.v*dt},mkL=()=>({a:0,v:0});
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
 const gy=gnd({x:r.x,z:r.z,y:r.y})+.3*Math.abs(Math.sin(r.pit))+(Math.abs(Math.sin(r.pit))<.5?0:0);
 if(r.y<=gy){if(!r.land&&r.vy<-1){r.land=1;for(const k in r.L)r.L[k].v+=(Math.random()-.5)*10;for(const h of r.H){h.vx+=(Math.random()-.5)*9;h.vy+=Math.random()*5;h.vz+=(Math.random()-.5)*9}}
  const bnc=r.vy<-5&&!r.bn;r.y=gy;if(bnc){r.vy=-r.vy*.22;r.bn=1}else r.vy=0;const f=Math.exp(-6*dt);r.vx*=f;r.vz*=f;mv(o,r.vx*dt,r.vz*dt,.4);r.pit+=(r.tg-r.pit)*Math.min(1,dt*12)}
 r.wy*=Math.exp(-2.5*dt);r.wr*=Math.exp(-2.5*dt);m.rotation.y+=r.wy*dt*(Math.abs(r.vx)+Math.abs(r.vz)>.3?1:.2);r.roll+=r.wr*dt;r.roll*=Math.exp(-1.2*dt);
 m.rotation.x=r.pit;m.rotation.z=r.roll;m.position.set(r.x,r.y-(r.sink||0),r.z);
 if(!g)return;const L=r.L,s=Math.sign(r.tg)||1;
 spr_(L.lx,.25,38,5,dt);spr_(L.rx,-.15,38,5,dt);spr_(L.ls,.45*(s>0?1:.5),30,5,dt);spr_(L.rs,.2,30,5,dt);spr_(L.hx,s>0?.5:-.3,34,4.5,dt);spr_(L.hz,.25,30,4,dt);spr_(L.sx,-.08,30,5,dt);spr_(L.lz,.2,30,5,dt);spr_(L.rz,-.22,30,5,dt);
 g.legL.rotation.x=L.lx.a;g.legR.rotation.x=L.rx.a;g.legL.rotation.z=L.lz.a;g.legR.rotation.z=L.rz.a;g.shinL.rotation.x=Math.max(0,L.ls.a);g.shinR.rotation.x=Math.max(0,L.rs.a);
 if(g.head)g.head.rotation.set(L.hx.a,0,L.hz.a);g.sh.rotation.set(L.sx.a,0,0);g.sh.position.y=1;if(g.jaw)g.jaw.rotation.x=.5;
 g.lean=L.sx.a;g.tw=0;g.bob=0;
 for(let i=0;i<2;i++){const sd=i?1:-1,h=r.H[i],tx=sd*.12-h.x*0,ty=-.1,tz=.1;h.vx+=(40*(tx*.0-h.x)-5*h.vx)*dt;h.vy+=(40*(ty*.0-h.y)-5*h.vy)*dt+(-4)*dt;h.vz+=(40*(0-h.z)-5*h.vz)*dt;h.x=Math.max(-.35,Math.min(.35,h.x+h.vx*dt*.1));h.y=Math.max(-.3,Math.min(.2,h.y+h.vy*dt*.1));h.z=Math.max(-.35,Math.min(.35,h.z+h.vz*dt*.1))}
 const sL=shPos(g,-1),sR=shPos(g,1),H=r.H;ik(sR,V(sR.x+.1+H[1].x,sR.y-.6+H[1].y,sR.z+.04+H[1].z),V(.6,-1,-.3),g.armR);ik(sL,V(sL.x-.1+H[0].x,sL.y-.6+H[0].y,sL.z+.04+H[0].z),V(-.6,-1,-.3),g.armL)}
/* killed bots tumble instead of vanishing; zombies start their own in zDamage */
function bodyFall(b,dx,dz){if(b.zom)return;if(dx==null){dx=b.x-P.x;dz=b.z-P.z}ragStart(b,dx,dz);b.fall=0;if(!falls.includes(b))falls.push(b)}
function fallTick(dt){for(let i=falls.length-1;i>=0;i--){const b=falls[i];if(b.fall==null){falls.splice(i,1);continue}b.fall+=dt;ragTick(b,dt);if(b.fall>2.4){b.m.visible=false;ragReset(b);b.fall=null;falls.splice(i,1)}}}
function animBot(b,dt){const r=b.rig,g=b.hg;if(!r)return;const mdx=b.x-(b.px==null?b.x:b.px),mdz=b.z-(b.pz==null?b.z:b.pz),back=b.net&&!b.zom&&b.ry!=null&&(mdx*Math.sin(b.ry)+mdz*Math.cos(b.ry))<-.015;
 const sp=Math.min(9,Math.hypot(b.x-(b.px==null?b.x:b.px),b.z-(b.pz==null?b.z:b.pz))/Math.max(dt,.001)),mvf=Math.min(1,sp/3);b.px=b.x;b.pz=b.z;
 const tgt=b.tyaw!=null?b.tyaw:b.m.rotation.y;if(b.ry==null)b.ry=tgt;b.ry+=angD(tgt,b.ry)*Math.min(1,dt*(b.zom?7:11));b.m.rotation.y=b.ry;
 b.ph=(b.ph||0)+sp*dt*(b.zom?1.05:1.3)*(back?-1:1);const ph=b.ph,s=Math.sin(ph),c=Math.cos(ph),sh=r.sh,id=b.i*1.7,run=sp>3.2,zb=!!b.zom;
 const lean=(zb?(run?.5:.3):.04+.12*mvf)-(b.fl>0?b.fl*1.2:0),twS=-s*(zb?.22:.16)*mvf,bob=Math.abs(c)*.025*mvf;
 sh.rotation.set(lean+(zb?Math.sin(t0*1.6+id)*.05:Math.sin(t0*1.7+id)*.008),twS,zb?s*.12*mvf+Math.sin(t0*.9+id)*.03:Math.sin(t0*1.3+id)*.01);sh.position.y=1+bob;sh.scale.y=1+.006*Math.sin(t0*2+id);r.lean=lean;r.tw=twS;r.bob=bob;
 if(r.head)r.head.rotation.set(zb?.25+Math.sin(t0*2.1+id)*.08:-lean*.6,zb?Math.sin(t0*1.3+id)*.25:0,zb?.2+Math.sin(t0*.8+id)*.1:0);
 const amp=zb?(run?.95:.6):.8;r.legL.rotation.x=s*amp*mvf;r.legR.rotation.x=-s*amp*mvf*(zb?.75:1)-(zb?.1*mvf:0);r.shinL.rotation.x=Math.max(0,c)*(zb?.6:1)*mvf;r.shinR.rotation.x=Math.max(0,-c)*(zb?.4:1)*mvf;r.legL.position.y=r.legR.position.y=.98+Math.abs(c)*.01*mvf;
 /* stance and air poses for other players: crouch, slide, jump (legs tucked), prone / dive (whole body tilts, see netTick), looking up and down */
 r.dr=0;if(!zb&&b.net){const T=b.st||0,tk=Math.min(1,dt*11),up=(k,v)=>{b[k]=(b[k]||0)+(v-(b[k]||0))*tk};up('pc',T==1?1:0);up('psl',T==3?1:0);up('pj',b.aj&&T!=2&&T!=4?1:0);up('pp',T==2||T==4?1:0);up('pis',cl(b.pi||0,-1.2,1.2));
  const pc=b.pc,psl=b.psl,pj=b.pj*(1-pc*.5),w=Math.min(1,pc+psl+pj),dr=.3*pc+.42*psl,mix=(w0,a,bb,j)=>w0*(1-w)+a*pc+bb*psl+j*pj;
  if(w>.01){r.legL.rotation.x=mix(r.legL.rotation.x,-1.0,-1.25,-.6);r.legR.rotation.x=mix(r.legR.rotation.x,-.75,-.85,-.1);r.shinL.rotation.x=mix(r.shinL.rotation.x,1.5,.15,1.05);r.shinR.rotation.x=mix(r.shinR.rotation.x,1.3,1.5,.85)}
  r.dr=dr;if(dr>0||r.hipD){for(const h of r.hip||[]){if(h.userData.y0==null)h.userData.y0=h.position.y;h.position.y=h.userData.y0-dr}r.hipD=dr>.001}
  r.legL.position.y-=dr;r.legR.position.y-=dr;sh.position.y-=dr;r.bob-=dr;sh.rotation.x+=.14*pc-.5*psl+.07*pj-b.pis*.22;if(r.head)r.head.rotation.x+=-b.pis*.55;g&&(g.userData.pis=b.pis)}
 const sL=shPos(r,-1),sR=shPos(r,1);
 if(zb){const sw=Math.sin(t0*3+id)*.07,lg=b.lunge>0?.22:0;if(lg)b.lunge-=dt;const ay=run?s*.3:sw;
  ik(sR,V(sR.x+.02,sR.y-.12+ay,sR.z+.58+lg+(run?.1:0)),V(.6,-1,-.3),r.armR);ik(sL,V(sL.x-.02,sL.y-.12-ay,sL.z+.58+lg),V(-.6,-1,-.3),r.armL);if(r.jaw)r.jaw.rotation.x=.2+.18*Math.sin(t0*5+id)+(lg?.3:0);return}
 if(!g)return;
 const w=W[b.wk]||W.AR,A=g.userData.a||{r:[0,-.1,.1],l:[0,-.05,.5],m:[0,-.15,.3]};let rp=-1;
 if(b.net){if(b.rlOn){b.rlt=(b.rlt||0)+dt;rp=Math.min(1,b.rlt/Math.max(.4,w.rl))}else b.rlt=0}else if(b.rl>0)rp=1-b.rl/Math.max(.4,w.rl);
 const bell=rp<0?0:Math.sin(Math.PI*rp);g.position.set(.12,1.36-(r.dr||0)+Math.abs(s)*.02*mvf-.06*bell,b.hold?b.hold.gz:.18);g.scale.setScalar(b.hold?b.hold.s:1);g.rotation.set(-.5*bell-(b.net?(b.pis||0)*.6:0),0,.3*bell);
 const R0=V(...A.r),kind=RLK[b.wk]||'mag',mg=g.userData.mags||[],o=rlPose(kind,rp,A,1,4,mg,g,0),q=g.quaternion,tw=a=>a.clone().multiplyScalar(g.scale.x).applyQuaternion(q).add(g.position);clampHand(o,sL,tw,q,.7);applyRl(o,mg,g.userData.pump||[],g,kind,1);
 ik(sR,tw(R0),V(.6,-1,-.3),r.armR);ik(sL,tw(o.h),V(-.6,-1,-.3),r.armL)}
/* movement: walk 7, sprint 10.5 with Shift (forward only), smoothed acceleration, mantle ledges while airborne, kick off walls with a fresh jump press */
function phys(dt,f,s,spd){if(P.mt){P.mx=P.mz=0;mantleStep(dt);return}
 const spc=key.Space&&!ST.sj,jp=spc&&!P.jh;P.jh=!!spc;const n=Math.hypot(f,s)||1,cy=Math.cos(yaw),sy=Math.sin(yaw);const ac_=Math.min(1,dt*(P.on?((f||s)?12:16):5));P.mx=(P.mx||0)+((-sy*f+cy*s)/n*spd-(P.mx||0))*ac_;P.mz=(P.mz||0)+((-cy*f-sy*s)/n*spd-(P.mz||0))*ac_;let dx=P.mx*dt,dz=P.mz*dt;
 if(P.wvx||P.wvz){dx+=P.wvx*dt;dz+=P.wvz*dt;const k=Math.exp(-4.5*dt);P.wvx*=k;P.wvz*=k;if(Math.hypot(P.wvx,P.wvz)<.3)P.wvx=P.wvz=0}
 mv(P,dx,dz,.4);
 if(spc&&P.on){P.vy=L.pk.includes('Spring Legs')?9.4:7.6;P.on=0}else if(jp&&!P.on)tryWall();
 P.vy-=20*dt;P.y+=P.vy*dt;const g=gnd(P);if(P.y<=g){P.y=g;P.vy=0;P.on=1;P.wj=0}else P.on=0;
 if(!P.on&&key.KeyW&&P.vy<5&&t0>=(P.mcd||0))tryMantle()}
function tryMantle(){const fx_=-Math.sin(yaw),fz_=-Math.cos(yaw),px=P.x+fx_*.65,pz=P.z+fz_*.65;
 for(const b of bx){const up=b.h-P.y;if(up<.55||up>1.45||(mode=='Zombies'&&b.h>2.6)||(b.y0||0)>P.y+1.2||px<b.x0-.05||px>b.x1+.05||pz<b.z0-.05||pz>b.z1+.05)continue;
  const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,hx=Math.max(0,(b.x1-b.x0)/2-.3),hz=Math.max(0,(b.z1-b.z0)/2-.3),tx=cl(P.x+fx_,cx-hx,cx+hx),tz=cl(P.z+fz_,cz-hz,cz+hz);
  if(bx.some(o=>o!==b&&tx>o.x0-.35&&tx<o.x1+.35&&tz>o.z0-.35&&tz<o.z1+.35&&(o.y0||0)<b.h+1.7&&o.h>b.h+.05))continue;
  P.mt={sx:P.x,sy:P.y,sz:P.z,tx,ty:b.h,tz,t:0,d:.42};P.vy=0;P.wvx=P.wvz=0;beep(300,.1,'triangle',.05);return}}
function mantleStep(dt){const m=P.mt;m.t+=dt;const k=Math.min(1,m.t/m.d),e=eas(Math.min(1,k/.55)),h=eas(Math.max(0,(k-.35)/.65));P.y=m.sy+(m.ty-m.sy)*e;P.x=m.sx+(m.tx-m.sx)*h;P.z=m.sz+(m.tz-m.sz)*h;P.vy=0;P.on=0;
 if(k>=1){P.x=m.tx;P.y=m.ty;P.z=m.tz;P.on=1;P.mt=null;P.mcd=t0+.4;P.wj=0;shake=Math.max(shake,.15)}}
function tryWall(){if(mode=='Zombies'||(P.wj||0)>=3||t0<(P.wcd||0))return;
 for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const qx=P.x+dx*.55,qz=P.z+dz*.55;
  for(const b of bx)if(qx>b.x0&&qx<b.x1&&qz>b.z0&&qz<b.z1&&(b.y0||0)<P.y+1&&b.h>P.y+.9){P.vy=7.2;P.wvx=-dx*7;P.wvz=-dz*7;P.wj=(P.wj||0)+1;P.wcd=t0+.25;shake=Math.max(shake,.2);beep(420,.09,'triangle',.05);return}}}

/* ===================== pvp.js ===================== */
/* ---------- simulated PvP (bots fight each other), Team Deathmatch, Capture the Flag, popups, killstreak panel; solo and private matches ---------- */
let ts={},lastBot=null,ksC='',flags=[],cs={A:0,B:0},myTeam='A',mpTeams={},obText='',fcc=0,zones=[],ds={A:0,B:0},dtk=0,zcc=0;
const teamMode=()=>mode=='Team Deathmatch'||mode=='Capture the Flag'||mode=='Domination'||mode=='Hardpoint',pTeam=()=>teamMode()?myTeam:'p',ally=b=>mode=='Zombies'?!b.zom:teamMode()&&b.team==pTeam(),hl=()=>L.pk.includes('Hardline')?1:0,tmOf=e=>e===P?pTeam():e.team,fl=t=>flags.find(f=>f.team==t),tn=t=>t=='A'?'Blue':'Red';
const hname=()=>netOn?myName:'You',feedAll=t=>{feed(t);if(netOn&&isHost)netSend({t:'feed',s:t})},popAll=(a,b)=>{popup(a,b);if(netOn&&isHost)netSend({t:'pop',a,b})};
function leader(){const c=[{nm:hname(),k:kills,me:1},...bots.map(b=>({nm:b.nm,k:b.k||0}))];return c.reduce((a,b)=>b.k>a.k?b:a)}
function clearFlags(){for(const f of flags){S.remove(f.m);S.remove(f.ring)}flags=[];clearZones()}
let PBOTS=null;const botN=d=>PBOTS==null?d:PBOTS;
function setupBots(){ts={};lastBot=null;clearFlags();cs={A:0,B:0};ds={A:0,B:0};dtk=0;const cli=netOn&&!isHost,mk=(n,team,hue,role)=>{if(cli)return;const b=addBot(60,1);b.team=team;b.nm=n;b.k=0;b.cf=null;b.role=role;b.ox=(Math.random()-.5)*12;b.oz=(Math.random()-.5)*12;b.col=team=='A'?0x62a8ff:0xff5a3a;const c=b.m.children[0].material.color;if(hue!=null)c.setHSL(hue,.6,.42);else c.setHex(team=='A'?0x3d6ad6:0xb5452e);spawn(b)};
 if(mode=='Slayer'||mode=='One in the Chamber')for(let i=0;i<botN(6);i++)mk('Bot '+(i+1),'b'+i,i*.15);
 if(mode=='Time Attack')for(let i=0;i<botN(8);i++)mk('Bot '+(i+1),'b'+i,i*.12);
 if(teamMode()){const hc=t=>Object.values(mpTeams).filter(x=>x==t).length;let nA=netOn?Math.max(0,5-hc('A')):4,nB=netOn?Math.max(0,5-hc('B')):5;if(PBOTS!=null){let cA=hc('A')+(netOn?0:1),cB=hc('B');nA=nB=0;for(let i=0;i<PBOTS;i++){if(cA+nA<=cB+nB)nA++;else nB++}}
  for(let i=0;i<nA;i++)mk((netOn?'Blue ':'Ally ')+(i+1),'A',null,i%2?'def':'atk');for(let i=0;i<nB;i++)mk((netOn?'Red ':'Enemy ')+(i+1),'B',null,i%2?'def':'atk');if(mode=='Capture the Flag')setupFlags();if(mode=='Domination')setupZones();if(mode=='Hardpoint')setupHP()}}
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
  if(e.cf&&OF.st=='home'&&Math.hypot(e.x-OF.hx,e.z-OF.hz)<2.5){cs[tm]++;retFlag(e.cf);e.cf=null;popAll('FLAG CAPTURED',tn(tm)+' team scores');if(e===P)bonusXP(.12)}}
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
  if(o!=z.o){z.o=o;popAll(o?`ZONE ${z.n} CAPTURED`:`ZONE ${z.n} NEUTRALISED`,o?tn(o)+' team':'No one holds it');if(o&&o==pTeam())bonusXP(.02)}
  zoneVis(z)}
 dtk+=dt;while(dtk>=2){dtk-=2;for(const z of zones)if(z.o)ds[z.o]++}
 if(netOn&&isHost){zcc+=dt;if(zcc>.15){zcc=0;netSend({t:'z',ds,z:zones.map(z=>[z.o,+z.cp.toFixed(2)])})}}}
/* ---------- Hardpoint: one scoring zone with a visible perimeter that moves to the next location every 60 seconds. A team scores 1 point per second while at least one of its players is inside
   and nobody from the other team is. First to 250 wins. ---------- */
let hpIdx=0,hpTL=60,hpS=0,hpPos=[];
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
 const st=a&&b?'c':a?'A':b?'B':'';if(st!=z.st){z.st=st;z.o=st=='A'||st=='B'?st:'';hpVis(z);if(st=='A'||st=='B')popAll(st==pTeam()?'HARDPOINT SECURED':'HARDPOINT LOST',tn(st)+' team holds it');else if(st=='c')popAll('HARDPOINT CONTESTED','Both teams inside')}
 z.a=a;z.b=b;hpS+=dt;while(hpS>=1){hpS-=1;if(a&&!b)ds.A++;else if(b&&!a)ds.B++}
 const pre=hpTL;hpTL-=dt;if(Math.floor(pre)!=Math.floor(hpTL)&&hpTL<=5&&hpTL>0)beep(700,.08,'square',.05);
 if(hpTL<=0){hpTL=60;hpPlace(hpIdx+1);popAll('HARDPOINT MOVING','New location marked on the radar')}
 if(netOn&&isHost){zcc+=dt;if(zcc>.15){zcc=0;const q=zones[0];netSend({t:'z',ds,z:[[q.o,0]],hp:{i:hpIdx,x:q.x,z:q.z,tl:+hpTL.toFixed(1),st:q.st}})}}}
/* bots head for the zone that is nearest and not already theirs; defenders also stay on zones their team owns */
function domGoal(b){if(!zones.length)return null;if(b.zi==null||t0>(b.zr||0)){b.zr=t0+3+Math.random()*3;const tm=b.team;b.zi=zones.map((z,i)=>({i,s:Math.hypot(z.x-b.x,z.z-b.z)+(z.o==tm?(b.role=='def'?0:60):0)+Math.random()*25})).sort((p,q)=>p.s-q.s)[0].i}
 const z=zones[b.zi];return[z.x+b.ox*.3,z.z+b.oz*.3]}
function target(b){let best=null,bd=1e9;for(const t of bots){if(t===b||!t.al||t.team==b.team)continue;const d=Math.hypot(t.x-b.x,t.z-b.z);if(d<bd){bd=d;best=t}}
 if(!P.dead&&b.team!=pTeam()&&Math.hypot(P.x-b.x,P.z-b.z)<bd)best=P;return best}
function botHit(t,d,by){takeDmg(t,d);t.fl=.08;if(t.hp<=0){t.al=0;t.dc=(t.dc||0)+1;bodyFall(t);t.rt=2.5;burst(V(t.x,1,t.z),20,0xb5452e,6,.8,.15);by.k=(by.k||0)+1;ts[by.team]=(ts[by.team]||0)+1;feed(`${by.nm} ▸ ${t.nm}`);announce(t,by)}}
function botScoreOnMe(){const b=lastBot;lastBot=null;if(b&&!b.net){b.k=(b.k||0)+1;ts[b.team]=(ts[b.team]||0)+1;feed(`${b.nm} ▸ You`)}}
function updBots(dt){if(netOn&&!isHost)return;for(const b of bots){if(b.net||b.zom)continue;
 if(!b.al){if(b.rt>0&&mode!='Survival'){b.rt-=dt;if(b.rt<=0)spawn(b)}continue}
 if(b.stun>0){b.stun-=dt;continue}
 if(b.sh<b.msh&&t0-b.lh>4)b.sh=Math.min(b.msh,b.sh+40*dt);if(b.rl>0)b.rl-=dt;
 b.ts=(b.ts||0)-dt;if(b.ts<=0||!b.tg||(b.tg===P?P.dead:!b.tg.al)){b.ts=.5;b.tg=target(b)}
 const t=b.tg,g=mode=='Capture the Flag'?ctfGoal(b):mode=='Domination'||mode=='Hardpoint'?domGoal(b):null,td=t?Math.hypot(t.x-b.x,t.z-b.z):1e9,obj=g&&td>=(b.cf?7:20);if(!t&&!g)continue;
 const mt=obj?{x:g[0],z:g[1]}:t,dx=mt.x-b.x,dz=mt.z-b.z,dd=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
 b.ot-=dt;if(b.ot<=0){b.ot=1+Math.random()*1.5;b.off=(Math.random()-.5)*2.2||1}
 const h=obj?ang+b.off*.45:ang+(dd>16?b.off*.3:dd<7?Math.PI+b.off*.3:Math.sign(b.off)*1.4),sp=(obj?4.2:3.4)*Math.min(b.df,1.6),px=b.x,pz=b.z;
 if(obj||dd>14||!navLos(b.x,b.z,mt.x,mt.z)){if(!(obj&&dd<2.5))navMove(b,dt,mt.x,mt.z,sp)}
 else{mv(b,Math.sin(h)*sp*dt,Math.cos(h)*sp*dt,.45);if(Math.hypot(b.x-px,b.z-pz)<sp*dt*.3&&dd>2.5){b.off=(Math.random()<.5?-1:1)*2.5;b.ot=.8}}
 b.m.position.set(b.x,0,b.z);b.m.rotation.y=t?Math.atan2(t.x-b.x,t.z-b.z):ang;b.cd-=dt;
 if(t&&b.cd<=0&&!(b.rl>0)&&td<45){const o=V(b.x,1.5,b.z),tv=V(t.x,(t.y||0)+1.2,t.z).sub(o),D=tv.length();tv.divideScalar(D);
  if(castW(o,tv,D)>=D-.1){const w=W[b.wk]||W.AR;b.am=(b.am==null||b.amk!=b.wk?w.m:b.am)-1;b.amk=b.wk;if(b.am<=0){b.rl=w.rl;b.am=w.m}b.bn=(b.bn||0)-1;b.cd=w.r*(.9+Math.random()*.3)+(b.bn<=0?.45+Math.random()*.7:0);if(b.bn<=0)b.bn=w.au?3+(Math.random()*5|0):1;{const mz=muzzle(b),tp=V(t.x,(t.y||0)+1.2,t.z),ev=tp.clone().sub(mz),L2=ev.length();ev.divideScalar(L2);if(b.wk=='RG')rgBeam(mz,ev,L2,1);else tr(mz,ev,L2,b.col||0xff5a3a,.08,1);muzzleFlash(mz,b.wk);otherSnd(b.wk,mz);if(netOn&&isHost)netSend({t:'bsh',i:b.i,w:b.wk,x:+tp.x.toFixed(1),y:+tp.y.toFixed(1),z:+tp.z.toFixed(1)})}
   const ch=Math.max(.12,.5-td/110)*Math.min(1.3,b.df);let n=0;for(let i=0;i<(w.pel||1);i++)if(Math.random()<ch)n++;if(n){const dm=n*(w.d+(w.ex?w.ex.d*.7:0))*falloff(w,td);if(t===P)hurt(dm*(typeof ST!='undefined'?(ST.prone?.7:ST.crouch?.85:1):1),b);else if(t.net)netSend({t:'hit',to:t.id,d:dm,bot:b.i});else botHit(t,dm,b)}}}}}
function pvpTick(dt){
 if(mode=='Capture the Flag'){ctfTick(dt);const A=fl('A'),B=fl('B'),st=f=>f.st=='home'?'safe':f.st=='dropped'?'dropped':'taken';$('#ob').textContent=`Blue ${cs.A} - ${cs.B} Red  ·  first to 3  ·  Blue flag ${st(A)}  ·  Red flag ${st(B)}`;const w=cs.A>=3?'A':cs.B>=3?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Hardpoint'){hpTick(dt);const z=zones[0];$('#ob').textContent=`Blue ${ds.A} – ${ds.B} Red  ·  first to 250  ·  Hardpoint ${hpIdx+1}/${hpPos.length}  ·  moves in ${Math.max(0,Math.ceil(hpTL))}s  ·  `+(z?z.st=='c'?'CONTESTED':z.st=='A'?'BLUE HOLDING':z.st=='B'?'RED HOLDING':'EMPTY':'');const w=ds.A>=250?'A':ds.B>=250?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Domination'){domTick(dt);$('#ob').textContent=`Blue ${ds.A} – ${ds.B} Red  ·  first to 350  ·  `+zones.map(z=>z.n+' '+(z.o?z.o=='A'?'blue':'red':'open')).join('  ·  ');const w=ds.A>=350?'A':ds.B>=350?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Team Deathmatch'){$('#ob').textContent=`Blue ${ts.A||0}  ·  Red ${ts.B||0}   (first to 50)`;const w=(ts.A||0)>=50?'A':(ts.B||0)>=50?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 const l=leader();$('#ob').textContent=`Slayer  ·  Leader ${l.nm} ${l.k} / 20`;if(l.k>=20)endGame(l.me?'Victory':l.nm+' wins')}
function popup(t,s){const e=document.createElement('div');e.className='pp';e.innerHTML=`<b>${t}</b><span>${s}</span>`;$('#pops').appendChild(e);setTimeout(()=>e.remove(),4300);beep(880,.15,'triangle',.07);setTimeout(()=>beep(1320,.2,'triangle',.06),110)}
function ksHud(){const T=[['UAV',3],['Shield Boost',5],['Airstrike',8]],h=T.map(([n,k])=>{const t=k-hl(),r=q.includes(n),u=ks>=t&&!r;return `<div class="kt ${r?'rdy':u?'used':''}"><b>${n}</b><i>${r?((q.indexOf(n)>=0?'['+(q.indexOf(n)+3)+'] READY':'READY')):u?'USED':Math.min(ks,t)+' / '+t}</i></div>`}).join('');if(h!=ksC){ksC=h;$('#kst').innerHTML=`<small>KILLSTREAKS · ${ks}</small>`+h}}
