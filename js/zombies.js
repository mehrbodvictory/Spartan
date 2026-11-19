/* ######## zombies.js ######## */
/* ===================== zombies.js ===================== */
/* ---------- Zombies: rounds of undead that arrive in waves, points for every shot and kill, locked doors, mystery boxes, wall weapons, ammo crates,
   Pack-a-Punch (guns AND melee) and soda perk machines. Solo or up to 4 player co-op through a private lobby.
   The mode has its own fixed equipment: a 1911, bare Fists, 2 frags and 2 flashbangs, no perks and no attachments. Nothing from the Multiplayer loadout carries over.
   Ammo can be bought at the wall or at an Ammo Crate, or replenished by Max Ammo.
   Co-op: the host simulates every zombie, round and door; guests see the zombies as puppets, report their hits to the host and get their kill points back.
   Points, perks, weapons and wall purchases belong to each player; doors, boxes and the Revive Soda stock are shared. Teammates revive you by holding F.
   The map itself (the Hollow Estate mansion, its props, machines and animation) is in js/estate.js. ---------- */
var zq=null,zG=null,zi=[],zdoors=[],zboxes=[],zgr=null,zfls={},zFlowCache=new Map(),zdead=[],zhc='',zbT=0,zsT=0;
var PERKS={
 vit:{n:'Vitality Cola',c:0xd8332a,cost:2500,t:'+50 max health'},
 spd:{n:'Quick Fizz',c:0x39c85a,cost:3000,t:'Reload and rebuild window boards twice as fast'},
 dbl:{n:'Double Pop',c:0xf0c21e,cost:2000,t:'Double damage, faster fire'},
 rev:{n:'Revive Soda',c:0x2f7de0,cost:500,t:'Self-revive once, revive teammates twice as fast, and heal faster'},
 stam:{n:'Stamin Fizz',c:0xa04ad8,cost:2000,t:'Run 20% faster and shoot while sprinting'},
 mule:{n:'Mule Soda',c:0xf08a2a,cost:4000,t:'Carry a third weapon'},
 crypt:{n:'Crypt Tonic',c:0xb793e5,cost:2750,t:'+50% melee damage. Melee kills heal 25 HP (3s cooldown)'},
 line:{n:'Linebreaker Soda',c:0xffc658,cost:2250,t:'Shots pierce a second zombie for 40% damage'},
 bolt:{n:'Bolt Brew',c:0x56c8bf,cost:2500,t:'Rebuilt boards last 50% longer. Rebuild all six to arm a two-second stun'}
};
/* perk hooks used by the weapon code (all neutral outside Zombies) */
var zrl=()=>zq&&mode=='Zombies'&&zq.perks.spd?0.5:1,zfr=()=>zq&&mode=='Zombies'&&zq.perks.dbl?0.75:1,zsm=()=>zq&&mode=='Zombies'&&zq.perks.stam?1.2:1,
 /* per-weapon Zombies damage boost on top of the round scaling: most guns were too weak against the horde, so each gets a modest lift (never more than about a third, shotguns and the Trebuchet-class weapons a bit more) */
 ZB={AR:1.25,SMG:1.35,MP:1.35,MG:1.25,BR:1.3,SG:2,VMP:1.3,DS:1.35,CY:1.2,CT:1.2,MVR:1.2,TRB:2.5,TUR:1.15,TEA:6.9,VA:1.28,BP:2.35,KTS:1.9,RD:1.24,HC:1.5,OH:1.8,SW:1.28,LT:1.34,PD:1.55},zmul=w=>mode=='Zombies'&&zq?ZW*(w.pm||1)*(ZB[w.k]||1)*(zq.perks.dbl&&!w.ex&&w.k!='RG'?2:1):1;
var zHp=r=>{const bs=n=>100+30*(n-1)+5*n*(n-1);return Math.round(r<=10?bs(r):bs(10)*Math.pow(1.07,r-10))},zDm=r=>Math.min(55,18+r*1.3),zAc=r=>Math.max(.7,1.1-r*.015),zTot=r=>Math.min(56,Math.round(5+r*2.4)),ZW=2.2,ZE=3,RGB=3000,FACE={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};
var zMe=()=>netOn?myId:'solo',zCli=()=>netOn&&!isHost;

/* ---------- the arsenal: everything in the weapon table except the streak-only guns and the starter pistol can come out of the box, so a weapon added to the game later shows up here by itself ---------- */
var ZSKIP=['MNG','GL','FT','CT'],zPoolKeys=()=>Object.keys(W).filter(k=>!ZSKIP.includes(k)&&k!='RG'&&(k!='TEA'||sel.map==='London'&&zq?.tea));
var ZWP={MP:600,MG:800,SG:1000,SMG:1000,DS:1750,AR:1500,VMP:1500,BR:1800,MVR:1800,TRB:2000,TUR:2250,CY:2500,SN:2800,RL:4500,VA:2000,BP:1750,KTS:2050,RD:2100,HC:1400,OH:2400,SW:2175,LT:1950,PD:2450};
var zWallCost=k=>ZWP[k]||Math.round(Math.max(1000,Math.min(3000,W[k].d*(1/W[k].r)*8)));
var ZMELEE={NF:'Nitrogen Fists',KT:'Katana'},ZMELCOST={KT:1500};
var zItemName=k=>ZMELEE[k]||(W[k]?W[k].n:k);
var zAmmoTier=w=>[500,2000,4000][Math.min(2,w.pap||0)];
var zAmmoFull=w=>w.mag>=w.m&&w.res>=w.m*(w.rs==null?4:w.rs);
var zAmmoPrice=(w,wall)=>(w.pap||0)>0?zAmmoTier(w):wall?Math.max(250,Math.round(zWallCost(w.k)/2)):zAmmoTier(w);


/* ---------- power-ups: zombies drop glowing pickups when they die. Walk into one to take it (in co-op it helps everybody).
   Max Ammo (all weapons and frags refilled), Insta-Kill (30s: any hit kills), Double Points (30s), Nuke (every zombie dies, +400 points for everyone),
   Fire Sale (30s: the Mystery Box costs 10) and Full Restore (health and shield maxed).
   Drop rate: about 3% per kill, climbing by 0.35% for every kill without a drop (so roughly one drop per 12 to 16 kills), never closer than 15s apart and at most 4 a round.
   The host rolls the drops and decides who picked them up; every client applies the effect to itself. Drops vanish after 30s (they blink for the last 8). ---------- */
var ZPU={ammo:{n:'MAX AMMO',s:'All weapons refilled',c:0x40ff70,w:22,i:'A'},insta:{n:'INSTA-KILL',s:'Every hit kills for 30 seconds',c:0xff3040,w:22,i:'☠'},dbl:{n:'DOUBLE POINTS',s:'Double points for 30 seconds',c:0xffd040,w:22,i:'2X'},
 nuke:{n:'NUKE',s:'Every zombie dies · +400 points',c:0xffa020,w:12,i:'☢'},fire:{n:'FIRE SALE',s:'Mystery Box costs 10 for 30 seconds',c:0xff4aa0,w:8,i:'$'},heal:{n:'FULL RESTORE',s:'Health and shield maxed',c:0x4ac8ff,w:10,i:'+'}};
var zBoxCost=()=>zq&&zq.pu&&zq.pu.fire>0?10:950,zGain=n=>{zq.pts+=zq.pu&&zq.pu.dbl>0?n*2:n};
var zPuKit=null;
function zPuGear(){if(zPuKit)return zPuKit;const gl=LX.effectTextures().glow;
 return zPuKit={gl,orb:new THREE.SphereGeometry(.52,20,14),ring:new THREE.TorusGeometry(.66,.02,6,44),beam:new THREE.CylinderGeometry(.14,.46,9,16,1,true),disc:new THREE.CircleGeometry(1.15,24),bx:new THREE.BoxGeometry(1,1,1),sp:new THREE.SphereGeometry(1,12,9),cy:new THREE.CylinderGeometry(1,1,1,12),cone:new THREE.ConeGeometry(1,1,10),pl:new THREE.PlaneGeometry(1,1)}}
var zPuMat=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
function zPuIcon(k,c){const K=zPuGear(),g=new THREE.Group(),Lm=(col,em)=>new THREE.MeshLambertMaterial({color:col,emissive:em==null?0:em}),
 add=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.scale.set(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m};
 if(k=='ammo'){add(K.bx,Lm(0x4a5a2a,0x0a1004),0,-.12,0,.56,.28,.38);add(K.bx,Lm(0x2e3a1a),0,.03,0,.6,.04,.42);for(const x of[-.26,.26])add(K.bx,Lm(0x2a2a22),x,-.12,0,.04,.3,.4);for(let i=0;i<6;i++){const x=-.23+i*.092;add(K.cy,Lm(0xc9a23a,0x3a2a08),x,.18,0,.032,.17,.032);add(K.cone,Lm(0xb06a2a,0x2a1004),x,.32,0,.032,.11,.032)}add(K.bx,Lm(0x40ff70,0x40ff70),0,-.12,.196,.3,.07,.01);add(K.bx,Lm(0x40ff70,0x40ff70),0,-.12,-.196,.3,.07,.01);add(K.bx,Lm(0x9a9a8a),0,.05,.215,.1,.04,.02)}
 else if(k=='insta'){const bone=Lm(0xe4dcc4,0x201c14);add(K.sp,bone,0,.06,0,.22,.2,.23);add(K.sp,bone,0,-.07,.06,.15,.1,.13);add(K.bx,bone,0,-.17,.04,.17,.07,.15);for(const s of[-1,1]){add(K.sp,Lm(0x050505),s*.075,.04,.19,.06,.07,.04);add(K.sp,Lm(0xff2030,0xff2030),s*.075,.04,.215,.025,.025,.02)}add(K.cone,Lm(0x050505),0,-.03,.21,.03,.06,.025,Math.PI);for(let i=0;i<6;i++)add(K.bx,Lm(0xf4efe0),-.065+i*.026,-.19,.115,.022,.04,.02);add(K.cy,bone,-.3,-.12,0,.03,.34,.03,0,0,.9);add(K.cy,bone,.3,-.12,0,.03,.34,.03,0,0,-.9);add(K.sp,bone,-.4,.04,0,.05,.05,.05);add(K.sp,bone,.4,.04,0,.05,.05,.05)}
 else if(k=='dbl'){const t=zTex(256,160,(x,w,h)=>{x.font='900 130px Teko,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=14;x.strokeStyle='#5a3a00';x.strokeText('2X',128,86);const gr=x.createLinearGradient(0,20,0,150);gr.addColorStop(0,'#fff6b0');gr.addColorStop(1,'#ffb000');x.fillStyle=gr;x.fillText('2X',128,86)});const pm=new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false});add(K.pl,pm,0,.05,0,.82,.5,1);add(K.pl,pm,0,.05,0,.82,.5,1,0,Math.PI/2,0);for(const[a,y]of[[0,-.26],[2.1,-.3],[4.2,-.22]])add(K.cy,Lm(0xe0b020,0x5a3a00),Math.cos(a)*.26,y,Math.sin(a)*.26,.12,.025,.12,.5,a,0)}
 else if(k=='nuke'){add(K.cy,Lm(0x14140e),0,0,0,.34,.03,.34,Math.PI/2);add(K.cy,Lm(0x14140e),0,0,0,.34,.03,.34,Math.PI/2,0,0).position.z=-.02;const y=Lm(0xffcc20,0xffa010);for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.1,.3,18,1,i*Math.PI*2/3+.2,Math.PI/3*1.15),new THREE.MeshBasicMaterial({color:0xffcc20,side:THREE.DoubleSide}));m.position.z=.02;g.add(m);const m2=m.clone();m2.position.z=-.04;g.add(m2)}add(K.sp,Lm(0xffcc20,0xffa010),0,0,.03,.07,.07,.02);add(K.sp,Lm(0xffcc20,0xffa010),0,0,-.05,.07,.07,.02);const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.025,6,30),new THREE.MeshBasicMaterial({color:0xffcc20}));g.add(ring);add(K.cy,Lm(0x3a3a30),0,-.34,0,.1,.18,.1);add(K.cone,Lm(0xb0b0a0),0,-.5,0,.1,.14,.1,Math.PI)}
 else if(k=='fire'){add(K.bx,Lm(0x5a3a1a,0x100804),0,-.15,0,.5,.22,.34);add(K.cy,Lm(0x6a4a24,0x100804),0,-.04,0,.17,.5,.17,0,0,Math.PI/2);for(const x of[-.18,.18])add(K.bx,Lm(0xc9a23a,0x3a2a08),x,-.12,0,.045,.3,.36);add(K.bx,Lm(0xc9a23a,0x3a2a08),0,-.06,.17,.07,.07,.02);const t=zTex(128,128,(x,w,h)=>{x.font='900 120px Teko,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=12;x.strokeStyle='#4a0020';x.strokeText('$',64,70);x.fillStyle='#ff6ab8';x.fillText('$',64,70)});const pm=new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false});add(K.pl,pm,0,.28,0,.4,.4,1);add(K.pl,pm,0,.28,0,.4,.4,1,0,Math.PI/2,0)}
 else{const m=Lm(0xe8f8ff,0x40a8e0);add(K.bx,m,0,0,0,.42,.13,.13);add(K.bx,m,0,0,0,.13,.42,.13);add(K.bx,Lm(0x40c8ff,0x40c8ff),0,0,.07,.3,.06,.02);add(K.bx,Lm(0x40c8ff,0x40c8ff),0,0,.07,.06,.3,.02)}
 return g}
function zPuModel(k){const K=zPuGear(),def=ZPU[k],c=def.c,g=new THREE.Group(),core=new THREE.Group();core.add(zPuIcon(k,c));g.add(core);
 const orb=new THREE.Mesh(K.orb,zPuMat(c,.17));g.add(orb);const ring=new THREE.Mesh(K.ring,zPuMat(c,.8));ring.rotation.x=Math.PI/2.6;g.add(ring);const ring2=new THREE.Mesh(K.ring,zPuMat(0xffffff,.45));ring2.scale.setScalar(.82);ring2.rotation.x=-Math.PI/2.8;ring2.rotation.y=.7;g.add(ring2);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:K.gl,color:c,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(2.6,2.6,1);g.add(halo);
 return{g,core,orb,ring,ring2,halo}}
function zPuOk(x,z){if(zq.barricade&&z<-3.5)return false;for(const b of bx){if(b.pl)continue;if(x>b.x0-.3&&x<b.x1+.3&&z>b.z0-.3&&z<b.z1+.3&&b.h>.9&&(b.y0||0)<1.2)return false}return true}
function zPuTry(b){const z=zq;if(!z||zCli())return;z.puKills++;if(z.puCd>0||z.puRound>=4)return;if(Math.random()>.03+.0035*z.puKills)return;
 const pool=Object.keys(ZPU).filter(k=>k!=z.puLast&&!(k=='insta'&&z.pu.insta>0)&&!(k=='dbl'&&z.pu.dbl>0)&&!(k=='fire'&&z.pu.fire>0));let tot=0;for(const k of pool)tot+=ZPU[k].w;let r=Math.random()*tot,k=pool[0];for(const q of pool){r-=ZPU[q].w;if(r<=0){k=q;break}}
 let x=b.x,zz=b.z;if(zq.barricade&&zz<-3.5){x=0;zz=-2.45}if(!zPuOk(x,zz)){let ok=0;for(let i=0;i<10&&!ok;i++){const a=i/10*6.28,d=1+i*.25;if(zPuOk(b.x+Math.cos(a)*d,b.z+Math.sin(a)*d)){x=b.x+Math.cos(a)*d;zz=b.z+Math.sin(a)*d;ok=1}}if(!ok){x=P.x;zz=P.z}}
 z.puKills=0;z.puCd=15;z.puRound++;z.puLast=k;const id=z.puId++;zPuSpawn(id,k,x,zz);if(netOn)netSend({t:'zpu',id,k,x,z:zz})}
function zPuSpawn(id,k,x,z){const m=zPuModel(k),def=ZPU[k];m.g.position.set(x,.2,z);(zG||S).add(m.g);zq.drops.push({id,k,m,x,z,t:0,life:30,y:.2,ph:Math.random()*6,sp:0});
 const p=V(x,.6,z);burst(p,22,def.c,6,.7,.12);burst(p,8,0xffffff,8,.4,.07);beep(700,.08,'triangle',.06);setTimeout(()=>beep(1050,.1,'triangle',.06),70);const d=Math.hypot(P.x-x,P.z-z);if(d<30)msg(def.n+' dropped',1.2)}
function zPuRemove(d){(zG||S).remove(d.m.g);const i=zq.drops.indexOf(d);if(i>=0)zq.drops.splice(i,1)}
function zPuTick(dt){const z=zq;zNukeTick(dt);if(z.puCd>0)z.puCd-=dt;const pu=z.pu;
 for(const k of['insta','dbl','fire'])if(pu[k]>0){pu[k]-=dt;if(pu[k]<=0){pu[k]=0;beep(300,.25,'sawtooth',.07);setTimeout(()=>beep(200,.3,'sawtooth',.07),120);if(k=='fire')zFireSale(0)}else if(pu[k]<5&&((pu[k]*3)|0)!=((pu[k]*3+dt*3)|0))beep(1200,.03,'square',.03)}
 document.body.classList.toggle('zinsta',pu.insta>0);
 for(let i=z.drops.length-1;i>=0;i--){const d=z.drops[i],m=d.m,c=ZPU[d.k].c;d.t+=dt;d.life-=dt;const u=Math.min(1,d.t/.7),e=1-Math.pow(1-u,3),over=Math.sin(u*Math.PI)*.35;d.y=.2+(1.15-.2)*e+over;
  m.g.position.set(d.x,d.y+Math.sin(d.t*2.6+d.ph)*.1,d.z);m.core.rotation.y=d.t*2.2;m.core.rotation.z=Math.sin(d.t*1.3)*.12;m.ring.rotation.z=d.t*2.8;m.ring2.rotation.z=-d.t*2.1;const pl=1+Math.sin(d.t*5)*.06;m.orb.scale.setScalar(pl*Math.min(1,d.t*4));m.halo.material.opacity=.6+Math.sin(d.t*6+d.ph)*.18;
  d.sp-=dt;if(d.sp<=0){d.sp=.1;const a=Math.random()*6.28;burst(V(d.x+Math.cos(a)*.5,d.y+Math.random()*.8-.3,d.z+Math.sin(a)*.5),1,c,.8,.7,.07)}
  if(d.life<8){const f=d.life<3?9:4.5;m.g.visible=((d.life*f)|0)%2==0}
  if(d.life<=0){zPuRemove(d);continue}
  if(!zCli()){for(const p of zPlayers()){if(Math.hypot(p.x-d.x,p.z-d.z)<1.35&&Math.abs((p.y||0)+.9-d.y)<2.1){zPuCollect(d,p.id);break}}}}}
function zPuCollect(d,by){zPuRemove(d);zPuApply(d.k,by);if(netOn)netSend({t:'zpc',id:d.id,k:d.k,by})}
function zPuApply(k,by){const z=zq,def=ZPU[k],mine=by==zMe(),who=mine?'':' · '+((names&&names[by])||'a teammate');const c=def.c;const q=V(P.x,1.1,P.z);burst(q,40,c,9,.8,.13);burst(q,16,0xffffff,12,.5,.08);shake=Math.max(shake,.25);LX.fx.pulse=Math.max(LX.fx.pulse,.7);flashL=Math.max(flashL||0,1.2);
 if(k=='ammo'){for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}rel=0;gc=3;[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.12,'triangle',.08),i*70))}
 else if(k=='insta'){z.pu.insta=30;beep(90,.6,'sawtooth',.14);setTimeout(()=>beep(1400,.25,'square',.07),80);setTimeout(()=>beep(700,.3,'square',.07),220);LX.fx.ca=1}
 else if(k=='dbl'){z.pu.dbl=30;[880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine',.08),i*55))}
 else if(k=='fire'){z.pu.fire=30;zFireSale(1);[660,880,660,880,1320].forEach((f,i)=>setTimeout(()=>beep(f,.14,'triangle',.08),i*90))}
 else if(k=='heal'){P.hp=P.mhp;P.sh=P.msh;LX.fx.heal=1;[392,523,659].forEach((f,i)=>setTimeout(()=>beep(f,.2,'sine',.08),i*100))}
 else if(k=='nuke'){z.pts+=400;floatTxt(V(P.x,2.4,P.z),'+400','#ffa020');noise(.9,120,.7);beep(55,.9,'sawtooth',.18);setTimeout(()=>beep(40,1.1,'square',.12),200);shake=Math.max(shake,.9);LX.fx.flash=1;LX.fx.boom=1;flashL=3;zNuke()}}
/* the nuke: a shockwave of death rolls outwards from whoever grabbed it. Nobody is paid per kill, everybody gets the flat 400 */
function zNuke(){if(zCli())return;const q=zq.nukeQ=zq.nukeQ||[];for(const b of bots){if(!b.zom||!b.al||b.zp||b.zquestBoss)continue;q.push({b,t:Math.min(1.1,Math.hypot(b.x-P.x,b.z-P.z)*.032)})}}
function zNukeTick(dt){const q=zq.nukeQ;if(!q||!q.length)return;for(let i=q.length-1;i>=0;i--){const e=q[i];e.t-=dt;if(e.t>0)continue;q.splice(i,1);const b=e.b;if(!b.al)continue;b.al=0;b.atk=0;b.hp=0;zdead.push({b,t:0});const a=Math.random()*6.28;ragStart(b,Math.cos(a)*5,Math.sin(a)*5,9+Math.random()*4);const p=V(b.x,1.1,b.z);burst(p,22,0xffa020,10,.8,.16);burst(p,10,0xff4020,7,.6,.2);burst(p,8,0x222222,5,1.1,.24)}}

/* ---------- small helpers ---------- */
var zTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
function zSprite(txt,col,sz,depth){const c=document.createElement('canvas');c.width=256;c.height=64;const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:!!depth}));s.scale.set(sz*4,sz,1);s.userData={c,t};zSet(s,txt,col);return s}
function zSet(s,txt,col){const g=s.userData.c.getContext('2d');g.clearRect(0,0,256,64);g.font='700 40px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='#000';g.strokeText(txt,128,34);g.fillStyle=col;g.fillText(txt,128,34);s.userData.t.needsUpdate=true}
var hex=c=>'#'+c.toString(16).padStart(6,'0'),zf=m=>{beep(140,.2,'sawtooth',.07);msg(m,1)};
function zSolid(x,z,w,d,h){const b={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h,y0:0};bx.push(b);indexedBoxes=null;return b}
function zUnsolid(b){const i=bx.indexOf(b);if(i>=0){bx.splice(i,1);indexedBoxes=null}zGrid()}
/* purchase juice: coins fly, a chime rings, the price floats up and the screen pulses */
function zBuyFx(x,y,z,col,txt){const p=V(x,y,z);burst(p,26,col||0xffd24a,6,.7,.1);burst(p,10,0xffffff,9,.4,.06);if(txt)floatTxt(V(x,y+.5,z),txt,'#'+(col||0xffd24a).toString(16).padStart(6,'0'));beep(880,.08,'triangle',.07);setTimeout(()=>beep(1320,.12,'triangle',.07),70);setTimeout(()=>beep(1760,.16,'sine',.05),150);shake=Math.max(shake,.12);flashL=Math.max(flashL||0,.6);if(typeof estBuy=='function')estBuy(x,z)}

/* ---------- weapons the player holds ---------- */
function zGunObj(k){const w={k,...eff(k,[])};w.mag=w.m;w.rs=k=='RG'?3:(w.rs==null?4:w.rs);w.res=w.m*w.rs;return w}
function zGive(k){if(ZMELEE[k])return zGiveMel(k);const w=zGunObj(k),i=wp.findIndex(x=>x.k==k);MV.eq=0;if(i>=0){wp[i]=w;cur=i}else if(wp.length<zq.cap){wp.push(w);cur=wp.length-1}else wp[cur]=w;rel=0;setGun();msg(W[k].n,1.5)}
function zGiveMel(k){const n=ZMELEE[k];zq.mel={k:n,pap:0};zq.dash.cd=0;zq.dash.t=0;zPaintHands();popup(n.toUpperCase(),k=='NF'?'Hold V to draw them. Aim = DASH':'Hold V to draw it');beep(300,.3,'sawtooth',.1);setTimeout(()=>beep(900,.3,'triangle',.1),150);burst(V(P.x,1.2,P.z),30,k=='NF'?0x55ccff:0xffffff,7,.6,.12);shake=Math.max(shake,.4)}
function zPick(by){const own=by==zMe()?wp.map(w=>w.k):[],rareG=Math.random()<.03&&!own.includes('RG'),rareN=Math.random()<.03&&(!zq||zq.mel.k!='Nitrogen Fists')&&!(MAPS[sel.map]&&MAPS[sel.map].nf===0);if(rareG)return 'RG';if(rareN)return 'NF';if(sel.map==='London'&&zq?.tea&&!own.includes('TEA')&&Math.random()<.045)return 'TEA';const pool=zPoolKeys().filter(k=>!own.includes(k));return pool.length?pool[Math.random()*pool.length|0]:'SMG'}
function zPap(w){const B=W[w.k],t=(w.pap||0)+1;w.pap=t;w.pm=t==1?2.2:3.6;if(w.k=='RG')w.pm=t==1?3:6;w.m=Math.round(B.m*(t==1?1.5:2));w.r=B.r*(t==1?.9:.8);w.pn=B.n+(t==1?' PaP':' PaP II');w.mag=w.m;w.res=w.m*w.rs;rel=0;setGun()}
var _zsg=setGun;setGun=function(){_zsg.apply(this,arguments);gf.material.color.setHex(mode=='Zombies'&&cw()&&cw().pap?0xc080ff:0xffdd66)};

/* ---------- Pack-a-Punch camos: unique to the Hollow Estate. Tier I is Haunted Mahogany (polished wood with pulsing violet runes), tier II is Gilded Wraith (black lacquer, gold filigree, drifting spectral fog).
   They are live shaders, applied to the weapon when it comes out of the machine, and they do not touch your Multiplayer camo choices. ---------- */
var PAP_FS=`uniform float t;uniform float k;varying vec3 vN;varying vec3 vV;varying vec3 vP;
float hash(vec3 p){p=fract(p*0.3183099+vec3(0.1,0.2,0.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1.0,0.0,0.0)),f.x),mix(hash(i+vec3(0.0,1.0,0.0)),hash(i+vec3(1.0,1.0,0.0)),f.x),f.y),
 mix(mix(hash(i+vec3(0.0,0.0,1.0)),hash(i+vec3(1.0,0.0,1.0)),f.x),mix(hash(i+vec3(0.0,1.0,1.0)),hash(i+vec3(1.0,1.0,1.0)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=0.5;float s=0.0;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
void main(){
 vec3 N=normalize(vN);vec3 V=normalize(vV);
 float nl=0.45+0.55*max(dot(N,normalize(vec3(0.3,0.8,0.6))),0.0);
 float fr=pow(1.0-max(dot(N,V),0.0),3.0);
 vec3 p=vP*7.0;vec3 col=vec3(0.0);
 if(k<0.5){
  float gr=fbm(vec3(p.x*0.7,p.y*5.5,p.z*0.7));
  float ring=0.5+0.5*sin(gr*24.0+p.x*1.5);
  vec3 wood=mix(vec3(0.20,0.06,0.035),vec3(0.52,0.20,0.09),ring*0.8+gr*0.3);
  float vr=smoothstep(0.35,0.9,sin(p.z*1.1+gr*3.0)*0.5+0.5);wood*=0.75+0.35*vr;
  float vein=abs(fbm(p*0.55+vec3(0.0,t*0.12,t*0.05))-0.5);
  float glow=0.018/(vein+0.02);
  float pulse=0.55+0.45*sin(t*1.8+p.x*0.6);
  col=wood*nl*(0.9+0.4*pow(1.0-max(dot(N,V),0.0),1.5));
  col+=vec3(0.55,0.15,1.0)*glow*0.34*pulse+vec3(0.9,0.6,1.0)*pow(glow,2.0)*0.015;
  float sp=0.0;
  col+=vec3(0.45,0.12,0.9)*fr*0.8;
 }else{
  float fil=abs(sin((p.x+sin(p.y*1.7+p.z*0.9)*0.9)*3.2))*abs(sin((p.z+cos(p.y*1.3)*0.8)*3.0));
  float line=smoothstep(0.1,0.0,fil-0.04);
  float leaf=smoothstep(0.55,0.5,abs(sin(p.x*5.0+p.y*3.0)*cos(p.z*4.5-p.y*2.0)));
  vec3 base=vec3(0.015,0.015,0.02)+vec3(0.02,0.03,0.05)*fbm(p*0.7);
  vec3 gold=mix(vec3(0.55,0.36,0.08),vec3(1.0,0.84,0.38),0.5+0.5*sin(p.y*3.0+t*1.2));
  float fog=fbm(p*0.9+vec3(t*0.18,-t*0.1,t*0.12));
  col=base+gold*(line*0.95+leaf*0.35)*nl;
  col+=vec3(0.1,0.7,0.65)*pow(fog,2.2)*0.55;
  float em=0.0;
  col+=vec3(0.9,0.7,0.25)*fr*0.7+vec3(0.1,0.8,0.7)*fr*fr*0.5;
 }
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
var PAPC=['Haunted Mahogany','Gilded Wraith'];
function zPapMat(t){const n=PAPC[Math.min(2,t)-1];if(!rfm[n])rfm[n]=new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:t>1?1:0}},vertexShader:CAMO_VS,fragmentShader:PAP_FS});return rfm[n]}
function zPapCamo(k){const w=typeof cw=='function'?cw():null;return zomOn()&&w&&w.k==k&&w.pap?zPapMat(w.pap):null}
/* the bare hands (and Nitrogen gauntlets) pick up the same camo once the melee weapon is Pack-a-Punched */
function zPaintHands(){
 const tier=mode==='Zombies'?zq?.mel?.pap||0:0;
 for(const arm of Object.values(fpArm))for(const item of arm.hand.children){
  if(item===arm.active?.glove)continue;
  item.traverse(mesh=>{
   if(!mesh.isMesh)return;
   mesh.userData.m0||=mesh.material;
   mesh.material=tier?zPapMat(tier):mesh.userData.m0;
  });
 }
}

/* ---------- melee: Fists by default, Nitrogen Fists from the box, a Katana off the wall. All of them can be Pack-a-Punched (tier I and II). ---------- */
var zMelKey=()=>zq&&zq.mel?zq.mel.k:'Fists';
function zMeleeStats(m){const t=zq.mel.pap||0,s={...m};if(!t)return s;s.reach=m.reach+.3*t;s.cnt=m.cnt+t;s.cd=m.cd*(1-.14*t);return s}
function zMeleeDmg(b,zf){
 const m=zq.mel,tier=[1,2.4,5][m.pap||0],boost=zq.perks.crypt?1.5:1;
 if(m.k==='Nitrogen Fists')return Math.round(3200*tier*boost/(b.big?1.6:1));
 return Math.max(1,Math.ceil(zMel(b)*zf*tier*boost));
}
function zQuickMelee(){if(!zq||zq.papT>0)return;melee()}
var _zme=melee;melee=function(){if(zq&&zq.papT>0)return;return _zme.apply(this,arguments)};
{const _sh=shoot;shoot=function(){if(zq&&mode=='Zombies'&&zq.papT>0)return;return _sh.apply(this,arguments)}}
{const _sr=startRel;startRel=function(){if(zq&&mode=='Zombies'&&zq.papT>0)return;return _sr.apply(this,arguments)}}
function zPapMel(){const m=zq.mel,t=(m.pap||0)+1;m.pap=t;m.pn=m.k+(t==1?' PaP':' PaP II');zPaintHands()}

/* ---------- Nitrogen Fists dash: press the aim button while the gauntlets are drawn. A rocket-driven lunge along your view that smashes everything in the way,
   then a cooldown (shorter once Pack-a-Punched). You cannot be hurt while dashing. ---------- */
var ZD={sp:27,dur:.3,r:1.75};
function zDashIn(on){if(!zq)return;if(!on){zq.dashH=0;return}if(zq.dashH)return;zq.dashH=1;
 if(!zomOn()||zMelKey()!='Nitrogen Fists'||!MV.eq||P.dead||over||paused||zq.papT>0||zq.dash.t>0)return;
 const d=zq.dash;if(d.cd>0){beep(220,.07,'square',.05);msg('Dash recharging '+d.cd.toFixed(1)+'s',.7);return}zDash()}
function zDash(){const d=zq.dash,t=zq.mel.pap||0;d.t=ZD.dur;d.cd=[6,4.5,3.2][t];d.max=d.cd;d.hit=new Set();d.n=0;if(typeof nfStrike=='function')nfStrike();
 noise(.5,500,.5);beep(120,.35,'sawtooth',.12);beep(90,.5,'square',.08);fk=Math.max(fk,2.4);shake=Math.max(shake,.55);LX.fx.speed=1;LX.fx.ca=1;LX.fx.pulse=Math.max(LX.fx.pulse,.6);
 const f=V(-Math.sin(yaw),0,-Math.cos(yaw));for(let i=0;i<3;i++)burst(V(P.x-f.x*.4,.9,P.z-f.z*.4),14,i?0xffffff:0x55ccff,8,.5,.12);if(typeof haptic=='function')haptic(.9,200,.9,'both');popup('NITRO DASH','Smash through them')}
{const _mc=moveCalc;moveCalc=function(){const r=_mc.apply(this,arguments);if(zq&&mode=='Zombies'&&zq.dash&&zq.dash.t>0&&!P.dead){r.f=1;r.s=0;r.spt=false;r.spd=ZD.sp}return r}}
function zDashTick(dt){const d=zq.dash;if(d.cd>0)d.cd=Math.max(0,d.cd-dt);if(d.t<=0)return;d.t-=dt;zQuestTool('dash',P.x,P.y,P.z);const f=V(-Math.sin(yaw),0,-Math.cos(yaw)),pap=zq.mel.pap||0;
 d.fi=(d.fi||0)-dt;if(d.fi<=0){d.fi=.1;FI.d=.14;FI.t=.14;FI.side^=1}
 burst(V(P.x-f.x*.9,.6+Math.random()*.8,P.z-f.z*.9),3,Math.random()<.5?0x55ccff:0xffffff,3,.35,.1);
 for(const b of bots){if(!b.zom||!b.al||d.hit.has(b.i)||b.rise>0)continue;const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);if(D>ZD.r+(b.big?.5:0)||Math.abs((b.y||0)-(P.y||0))>2.2)continue;
  d.hit.add(b.i);d.n++;src='Melee';srcK='';hitBot(b,Math.round(zMeleeDmg(b,1)*.85),0);if(b.al&&!b.zp){b.stun=1;mv(b,f.x*3.5+(dz>0?.9:-.9)*f.z,f.z*3.5-(dx>0?.9:-.9)*f.x,.45)}
  burst(V(b.x,1.2,b.z),18,0x55ccff,9,.5,.12);burst(V(b.x,1.2,b.z),8,0xffffff,12,.3,.07);beep(1500,.06,'square',.06);noise(.2,700,.35);shake=Math.max(shake,.4);if(typeof haptic=='function')haptic(.7,90,.7,'both');if(typeof nfHit=='function')try{nfHit(1)}catch(e){}}
 if(d.t<=0){d.t=0;LX.fx.pulse=Math.max(LX.fx.pulse,.4);burst(V(P.x,1,P.z),24,0x55ccff,8,.6,.12);if(d.n>1)popup('DASH x'+d.n,'Nitrogen Fists')}}

/* ---------- ammo: wall buys and crates. Nothing restocks by itself. ---------- */
function zBuyAmmo(wall,pos){const w=cw();if(!w||P.dead)return;const c=zAmmoPrice(w,wall);if(zAmmoFull(w))return zf('Ammo is full');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;
 w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs);rel=0;gc=Math.max(gc,3);if(!wall)gc=3;zBuyFx(pos[0],1.3,pos[1],0x7bf08a,'-'+c);popup('AMMO',(w.pn||W[w.k].n)+' · refilled'+(wall?'':' · frags restocked'))}
function zBuyWall(k,pos){const mel=ZMELEE[k],own=!mel&&wp.find(w=>w.k==k);
 if(own){const c=zAmmoPrice(own,1);if(zAmmoFull(own))return zf('Ammo is full');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;own.mag=own.m;own.res=own.m*(own.rs==null?4:own.rs);rel=0;zBuyFx(pos[0],1.4,pos[1],0x7bf08a,'-'+c);popup('AMMO',(own.pn||W[k].n)+' · refilled');return}
 const c=mel?ZMELCOST[k]:zWallCost(k);if(mel&&zq.mel.k==ZMELEE[k])return zf('You already have it');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;zGive(k);zBuyFx(pos[0],pos[2]??1.4,pos[1],0xffd24a,'-'+c);popup('WEAPON BOUGHT',zItemName(k))}
function zWallTxt(k){const mel=ZMELEE[k],own=!mel&&wp.find(w=>w.k==k);if(own)return zAmmoFull(own)?'':'Ammo for '+(own.pn||W[k].n);if(mel&&zq.mel.k==ZMELEE[k])return '';return 'Buy the '+zItemName(k)+(mel?' (melee)':'')}
function zWallCostNow(k){const mel=ZMELEE[k],own=!mel&&wp.find(w=>w.k==k);return own?(zAmmoFull(own)?0:zAmmoPrice(own,1)):mel?ZMELCOST[k]:zWallCost(k)}

/* ---------- Pack-a-Punch: takes 3 seconds, the machine works on the weapon (you cannot fire or swing meanwhile) and it comes out with a map-specific camo ---------- */
function zPapTarget(){return MV.eq?'mel':'gun'}
function zPapTxt(){const k=zPapTarget();if(zq.papT>0)return 'Pack-a-Punch is working…';if(k=='mel'){const m=zq.mel,t=m.pap||0;return t>=2?'Melee fully upgraded':'Pack-a-Punch the '+(m.pn||m.k)}const w=cw(),t=w.pap||0;return t>=2?'Weapon fully upgraded':'Pack-a-Punch the '+(w.pn||W[w.k].n)+'  (draw your melee with V to upgrade it instead)'}
function zPapCost(){if(zq.papT>0)return 0;const k=zPapTarget(),t=k=='mel'?zq.mel.pap||0:cw().pap||0;return [5000,10000][t]||0}
function zPapAct(pos){if(zq.papT>0)return;const k=zPapTarget(),mel=k=='mel',t=mel?zq.mel.pap||0:cw().pap||0,c=[5000,10000][t];if(!c)return zf('Already fully upgraded');if(zq.pts<c)return zf('Not enough points');
 zq.pts-=c;const tg=mel?null:cw();zq.pap={t:0,dur:3,mel,w:tg,tier:t+1,pos};zq.papT=3;MV.eq=0;gun.visible=false;zBuyFx(pos[0],1.8,pos[1],0xb070ff,'-'+c);beep(200,.6,'sawtooth',.1);if(typeof estPap=='function')estPap(1,zq.pap)}
function zPapTick(dt){const p=zq.pap;if(!p)return;p.t+=dt;zq.papT=Math.max(0,p.dur-p.t);gun.visible=false;
 if(Math.random()<dt*14)burst(V(p.pos[0]+(Math.random()-.5)*1.2,1+Math.random()*1.6,p.pos[1]+(Math.random()-.5)*1.2),2,Math.random()<.5?0xb070ff:0x55aaff,3,.5,.08);
 if(p.t>=p.dur){zq.pap=null;zq.papT=0;gun.visible=true;const mel=p.mel;
  if(mel){zPapMel();popup('PACK-A-PUNCHED',zq.mel.pn+' · '+PAPC[(zq.mel.pap||1)-1])}
  else{const w=p.w;if(w&&wp.includes(w)){zPap(w);popup('PACK-A-PUNCHED',(w.pn||W[w.k].n)+' · '+PAPC[w.pap-1])}else popup('PACK-A-PUNCH','The weapon is gone')}
  beep(300,.15,'sawtooth',.1);setTimeout(()=>beep(900,.3,'triangle',.1),120);setTimeout(()=>beep(1500,.4,'sine',.08),260);shake=Math.max(shake,.5);flashL=2;
  const q=V(P.x,1.2,P.z);burst(q,50,0xb070ff,10,.8,.14);burst(q,24,0xffe9a0,12,.6,.08);LX.fx.pulse=Math.max(LX.fx.pulse,.9);LX.fx.flash=Math.max(LX.fx.flash,.35);if(typeof estPap=='function')estPap(0,p)}}

/* ---------- building the level objects: doors, machines, boxes, wall buys and crates are modelled in js/estate.js; this file only holds their rules ---------- */
function zStart(){document.body.classList.toggle('zom',mode=='Zombies');$('#zh').style.display=mode=='Zombies'?'flex':'none';$('#zp').textContent='';zhc='';
 if(zG&&zG.parent)zG.parent.remove(zG);zG=null;zi=[];zdoors=[];zboxes=[];zdead=[];zfls={};zbT=zsT=0;if(mode!='Zombies'){zq=null;$('#zmain').hidden=true;zHudShow(0);zPaintHands();return}
 const M=MAPS[sel.map];zq={r:0,pts:500,perks:{},cap:2,revBuys:0,revM:null,st:'prep',tm:6,toSpawn:0,spT:0,open:{0:1},fl:0,cur:null,gn:3,brutes:0,down:0,out:0,dnT:0,rvT:0,ad:0,mp:[],pb:{},mel:{k:'Fists',pap:0},dash:{t:0,cd:0,max:6,hit:null},dashH:0,papT:0,pap:null,guts:[],decals:[],elev:{},pu:{insta:0,dbl:0,fire:0},drops:[],puKills:0,puCd:8,puRound:0,puLast:null,puId:1};
 MV.eq=0;wp=[zGunObj('CT')];cur=0;rel=0;gc=2;P.mhp=50;P.hp=50;P.msh=50;P.sh=50;setGun();zPaintHands();
 if(netOn){const k=Object.keys(names).sort().indexOf(myId);P.x+=(k%2?1.6:-1.6);P.z+=(k>1?1.6:0)}
 zG=new THREE.Group();mapG.add(zG);if(typeof estObjects=='function')estObjects(M);zGrid();zHudInit();zQuestStart();document.body.classList.remove('zinsta')}
/* doors: the model, hinges and the opening animation are built in estate.js (estDoor); the rules are here */
function zDoorRule(o,d,idx){zdoors.push(o);zi.push({x:d.x,z:d.z,r:3.6,txt:()=>o.open?'':'Open the '+d.n,cost:()=>o.open?0:d.c,act:()=>{if(o.open)return;if(zq.pts<d.c)return zf('Not enough points');if(zCli())return void netSend({t:'zqd',i:idx});zq.pts-=d.c;zOpenDoor(idx,zMe())}})}
function zOpenDoor(i,by){const o=zdoors[i];if(!o||o.open)return;o.open=1;zUnsolid(o.box);const M=MAPS[sel.map];zq.open[o.d.a]=zq.open[o.d.b]=1;for(let n=0;n<3;n++)for(const[p,q]of M.links||[])if(zq.open[p]||zq.open[q])zq.open[p]=zq.open[q]=1;zq.fl=0;
 beep(200,.4,'sawtooth',.09);noise(.6,300,.5);shake=Math.max(shake,.45);msg(o.d.n+' unlocked',1.8);if(typeof estDoorOpen=='function')estDoorOpen(o);if(netOn&&isHost)netSend({t:'zd',i,by})}
function zAvailablePerks(){return zq.mp.map(machine=>machine.k).filter(k=>!zq.perks[k]&&(k!=='rev'||zq.revBuys<4))}
function zPerk(t){if(!zq.mp.some(machine=>machine.k===t))return;const p=PERKS[t];if(zq.perks[t])return zf('You already have '+p.n);if(t=='rev'&&zq.revBuys>=4)return zf('Out of stock');if(zq.pts<p.cost)return zf('Not enough points');zq.pts-=p.cost;zq.perks[t]=1;
 if(t=='vit'){P.mhp=100;P.hp=100}if(t=='mule')zq.cap=3;
 if(t==='crypt')zq.nextCryptHeal=0;
 if(t=='rev'){if(zCli())netSend({t:'zqr'});else{zq.revBuys++;zRevCount(zq.revBuys);if(netOn)netSend({t:'zrev',n:zq.revBuys})}}
 beep(520,.1,'triangle',.08);setTimeout(()=>beep(780,.15,'triangle',.08),90);popup(p.n.toUpperCase(),p.t);flashL=Math.max(flashL||0,1);LX.fx.heal=Math.max(LX.fx.heal,.5);if(typeof estPerk=='function')estPerk(t)}
/* the Revive Soda machine runs dry after four purchases (counted across every player) */
function zRevCount(n){zq.revBuys=n;const o=zq.revM;if(n>=4&&o&&!o.o.gone){o.g.visible=false;o.o.gone=1;zUnsolid(o.bxo);setTimeout(()=>msg('The Revive Soda machine is empty',2),1800)}}
/* mystery box rules (the chest, its lid and the floating weapon are in estate.js) */
function zBoxAct(o,i){if(o.st==0){const bc=zBoxCost();if(zq.pts<bc)return zf('Not enough points');if(zCli())return void netSend({t:'zqb',i});zq.pts-=bc;zBoxStart(o,i,zMe())}
 else if(o.st==2&&o.by==zMe()){zGive(o.item);if(zCli())netSend({t:'zqe',i});zBoxEnd(o,i)}}
function zBoxStart(o,i,by){o.st=1;o.t=0;o.cy=0;o.by=by;if(typeof EST!='undefined'&&EST.bx&&(!netOn||isHost))EST.bx.uses++;beep(300,.2,'triangle',.08);if(typeof estBoxState=='function')estBoxState(o,1);if(netOn&&isHost)netSend({t:'zbs',i,st:1,by})}
function zBoxEnd(o,i){o.st=0;o.beam.visible=o.lab.visible=false;if(o.fsHide){o.fsHide=0;zFireSaleHide(o)}if(typeof estBoxState=='function')estBoxState(o,0);if(netOn&&isHost)netSend({t:'zbs',i,st:0})}
function zBoxTick(o,i,dt,auth){if(o.st==1){o.t+=dt;o.cy-=dt;o.beam.visible=o.lab.visible=true;if(o.cy<=0){o.cy=.12;const pool=[...zPoolKeys(),'RG',...(MAPS[sel.map].nf===0?[]:['NF'])],k=pool[Math.random()*pool.length|0];zSet(o.lab,zItemName(k),'#ffd24a');if(typeof estBoxShow=='function')estBoxShow(o,k);beep(500+Math.random()*300,.05,'square',.03)}
  if(auth&&o.t>3.2&&typeof EST!='undefined'&&EST.bx&&!EST.bx.fs&&EST.bx.uses>=EST.bx.thr&&zboxes.length>1){zBoxMoveStart(o,i);return}
  if(auth&&o.t>3.2){o.item=zPick(o.by);o.st=2;o.t=0;zSet(o.lab,zItemName(o.item),o.item=='RG'||o.item=='NF'?'#ff4a4a':'#7bf08a');if(typeof estBoxShow=='function')estBoxShow(o,o.item,1);beep(900,.2,'triangle',.09);if(netOn&&isHost)netSend({t:'zbs',i,st:2,item:o.item,by:o.by})}}
 else if(o.st==2&&auth){o.t+=dt;if(o.t>9)zBoxEnd(o,i)}
 else if(o.st==3){o.t+=dt;if(auth&&o.t>2.6)zBoxRelocate(o,i)}}
function zBoxMoveStart(o,i){o.st=3;o.t=0;zSet(o.lab,'THE BOX IS MOVING!','#ff4a4a');o.beam.visible=o.lab.visible=true;if(o.by==zMe())zq.pts+=zBoxCost();beep(120,.5,'sawtooth',.1);setTimeout(()=>beep(90,.5,'sawtooth',.1),260);if(netOn&&isHost)netSend({t:'zbs',i,st:3,by:o.by})}
function zBoxRelocate(o,i){const c=zboxes.map((_,j)=>j).filter(j=>j!=i),j=c[Math.random()*c.length|0];o.st=0;o.beam.visible=o.lab.visible=false;estBoxGo(j);msg('The Mystery Box has moved',2.8);if(netOn&&isHost)netSend({t:'zbl',i:j})}

/* ---------- navigation: a coarse grid and a flow field towards each player ---------- */
function zGrid(){navBuild();zgr=NAV;zFlowCache.clear()}
function zFlow(pl){
 const [x,z]=navCell(pl.x,pl.z), cell=z*NAV.n+x, cached=zFlowCache.get(pl.id);
 if(cached&&cached.cell===cell&&cached.grid===NAV.g)return cached.field;
 const field=navFlow(pl.x,pl.z);
 zFlowCache.set(pl.id,{cell,grid:NAV.g,field});
 return field;
}
/* everyone the zombies can attack: the host and every connected player who is on their feet */
function zPlayers(){const a=[];if(!P.dead)a.push({id:zMe(),x:P.x,z:P.z,y:P.y,me:1});if(netOn)for(const b of bots)if(b.net&&!b.hb&&b.al)a.push({id:b.id,x:b.x,z:b.z,y:b.y||0});return a}

/* ---------- zombies ---------- */
function zModel(r,big,variant=botId){const m=new THREE.Group(),t=Math.min(3,r/5|0),pk=a=>a[Math.random()*a.length|0],
 rig=mkHuman(m,{zombie:1,big,variant,skin:[0xa9b98a,0xb3b58a,0xa89aa8,0xb27a62][t],shirt:big?0x5a1a14:pk([0x5a6a7a,0x6a5a4a,0x4a5a46,0x7a6a5a,0x3a3a44,0x6a4a4a]),pants:pk([0x2f3340,0x3a3a30,0x4a3f35,0x26282c]),hair:pk([0x1a1410,0x2a2018,0x3a342a]),eye:r>=15?0xff9a2a:0xff2a2a});
 S.add(m);if(big)m.scale.setScalar(1.35);return{m,rig}}
var zOutdoor=(M,x,z)=>(M.outdoor||[]).some(o=>x>o[0]&&x<o[2]&&z>o[1]&&z<o[3]);
function mkZombie(x,z,big){const r=zq.r,{m,rig}=zModel(r,big),hp=Math.round(zHp(r)*(big?3:1)),run=r>=25||(r>=6&&Math.random()<Math.min(.6,(r-5)*.06)),M=MAPS[sel.map],out=zOutdoor(M,x,z),
 b={i:botId++,m,rig,x,z,y:0,hp,mhp:hp,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,big:!!big,nm:big?'Brute':'Zombie',cd:.5,k:0,df:1,dm:Math.min(zDm(r)*(big?1.5:1),big?70:55),ac:zAc(r),run,sp:(Math.min(4.2,1.6+r*.11+Math.random()*.5)+(run?1:0))*(big?.75:1),rise:big?1.3:1,riseD:big?1.3:1,riseY:out?-1.9:0,atk:0,at:0,atd:.7,atype:0};
 m.position.set(x,b.riseY,z);zGutHand(b);bots.push(b);const p=V(x,.4,z);burst(p,big?34:18,out?0x5a4630:0x8a8478,5,.9,.16);burst(p,6,out?0x3a2a1a:0x555049,3,1.1,.22);if(out)noise(.5,160,.3);else noise(.3,420,.18);return b}
function zPuppet(i,x,z,big,r){const{m,rig}=zModel(r,big,i),b={i,m,rig,x,z,tx:x,tz:z,y:0,hp:1e9,mhp:1e9,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,zp:1,big:!!big,nm:big?'Brute':'Zombie',df:1,k:0,rise:.8,riseD:.8,riseY:0,atk:0,at:0,atd:.65,atype:0};m.position.set(x,0,z);zGutHand(b);bots.push(b);return b}
/* a spawn point is nudged to the nearest free spot so nobody appears inside a table or a statue */
function zFreeSpot(x,z){const g=NAV.g,n=NAV.n;if(!g)return[x,z];const free=(a,b)=>{const i=Math.floor(a+H),j=Math.floor(b+H);return i>0&&j>0&&i<n-1&&j<n-1&&!g[j*n+i]};if(free(x,z))return[x,z];for(let r=.8;r<=6;r+=.6)for(let a=0;a<14;a++){const t=a/14*6.283,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r;if(free(px,pz))return[px,pz]}return[x,z]}
function zSpawn(M,big){if(M.spawn)return M.spawn(big);const open=M.zs.filter(s=>zq.open[s[2]]),pl=zPlayers(),far=open.filter(s=>pl.every(p=>Math.hypot(s[0]-p.x,s[1]-p.z)>12)),s=(far.length?far:open)[Math.random()*(far.length||open.length)|0],[x,z]=zFreeSpot(s[0]+(Math.random()-.5)*3,s[1]+(Math.random()-.5)*3);mkZombie(x,z,big)}
/* damage to a zombie: 10 points per hit, kill 50 (60 explosive), headshot kill 100, melee kill 130; the RayGun kills anything.
   Guests send their hits to the host (zqh) and get the kill points back (zk). */
var _zhb=hitBot;hitBot=function(b,d,head,scale=1){if(b.zom)return zHit(b,d,head,scale);if(mode=='Zombies')return;_zhb(b,d,head)};
function zHit(b,d,head,scale=1){if(!b.al)return;
 if(b.zp&&b.zquestBoss&&(zq.main.ward||zq.main.warm>0)){if(t0>(zq.main.blockAt||0)){zq.main.blockAt=t0+.2;beep(240,.09,'triangle',.045)}return}const w=wp.find(x=>x.k==srcK),melee=src==='Melee';if(srcK=='RG')d=RGB*(w&&w.pm?w.pm:1)*(b.big?2:1);else if(w&&w.ex)d*=ZE*(w.pm||1);else if(!srcK&&!melee)d*=ZE;
 d*=scale;
 if(b.zp){hits++;juiceHit(b,Math.min(d,9999),head);$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(!melee&&!b.zquestBoss)zGain(10);
  if(melee&&zq.r<=2)d=Math.min(d,zHp(zq.r)*(b.big?3:1));
  netSend({t:'zqh',i:b.i,d,h:head?1:0,k:srcK,m:melee?1:0});return}
 zDamage(b,d,head,zMe(),srcK,melee)}
function zDamage(b,d,head,by,k,mel){if(!b.al)return;if(b.zquestBoss){zQuestDamage(b,d,head,by);return}if(zq.pu.insta>0)d=Math.max(d,b.hp+1);b.hp-=d;b.lh=t0;const mine=by==zMe();
 if(mine){hits++;$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04)}juiceHit(b,Math.min(d,9999),head);
 if(b.hp>0){if(mine&&!mel)zGain(10);return}
 b.al=0;b.atk=0;const pt=mel?130:head?100:(k=='RL'||k=='RG')?60:50;zdead.push({b,t:0});zQuestKill(b);if(typeof lonKill=='function')lonKill(b);{const kp=mine?P:bots.find(x=>x.net&&x.id==by);ragStart(b,kp?b.x-kp.x:0,kp?b.z-kp.z:0,b.big?2.2:(mel&&zMelKey()=='Nitrogen Fists')?9:(k=='SG'||k=='RL'||k=='RG'?6:3.4))}
 if(mine){kills++;zGain(pt);zCryptHeal(mel);floatTxt(V(b.x,2.8,b.z),'+'+(zq.pu.dbl>0?pt*2:pt),'#ffd24a');juiceKill(b,head);wzkill(k);killXP(head)}
 else{const nb=bots.find(x=>x.net&&x.id==by);if(nb)nb.k=(nb.k||0)+1;netSend({t:'zk',to:by,pts:pt,k,m:!!mel,h:head?1:0})}zPuTry(b)}

function zCryptHeal(melee){
 if(!melee||!zq.perks.crypt||P.dead||P.hp>=P.mhp||t0<zq.nextCryptHeal)return;
 P.hp=Math.min(P.mhp,P.hp+25);
 zq.nextCryptHeal=t0+3;
 LX.fx.heal=Math.max(LX.fx.heal,.65);
}

/* ---------- zombie attacks: a zombie walks up, stops at arm's length and plants its feet, winds up (arms rise, torso leans back), strikes (slam, claw swipe or lunge) and only then does the damage land.
   Four attack types: 0 overhead slam, 1 right claw, 2 left claw, 3 lunge bite (runners). Brutes always slam and shake the ground. ---------- */
function zAtkStart(b,pl,ty){b.atk=1;b.at=0;b.ahit=0;b.atd=Math.min(.85,Math.max(.5,b.ac*.75))*(b.big?1.15:1);b.atype=ty!=null?ty:b.big?0:b.run?(Math.random()<.6?3:Math.random()<.5?1:2):(Math.random()*3|0);if(b.atype==4){b.atd=.8*(b.big?1.15:1);b.gcd=Math.max(2.4,4.6-zq.r*.06)+Math.random()*1.2}
 const d=Math.hypot(pl.x-b.x,pl.z-b.z);if(d<14)beep(80+Math.random()*60,.3,'sawtooth',Math.max(.01,.06-d*.004))}
function zStrike(b,pl){const dx=pl.x-b.x,dz=pl.z-b.z,D=Math.hypot(dx,dz)||1,reach=1.75*(b.big?1.25:1);if(D>reach||Math.abs(pl.y)>1.6)return;
 if(pl.me){if(zq.dash&&zq.dash.t>0)return;hurt(b.dm,b);mv(P,dx/D*(b.big?.9:.45),dz/D*(b.big?.9:.45),.45);kick+=b.big?.05:.025;shake=Math.max(shake,b.big?.55:.3);LX.fx.dmg=Math.max(LX.fx.dmg,.35);burst(V(P.x,1.3,P.z),8,0x8a1010,4,.4,.08)}
 else netSend({t:'hit',to:pl.id,d:b.dm,bot:b.i});
 if(b.big){const q=V(b.x+dx/D*1.1,.2,b.z+dz/D*1.1);burst(q,16,0x6a6458,5,.7,.2);noise(.4,140,.45)}else noise(.12,900,.18)}
/* arm and body poses for the attack and for crawling out of the ground, used by animBot (systems.js) */
var zsm_=u=>{u=u<0?0:u>1?1:u;return u*u*(3-2*u)},zlr=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
function zAtkPose(b,dt){if(b.vaultPose)return lockboxVaultPose(b);if(b.tear)return lockboxTearPose(b);const N=[.02,-.12,.58],NL=[-.02,-.12,.58],H1=[.6,-1,-.3],H2=[-.6,-1,-.3];
 if(b.rise>0){const u=1-b.rise/(b.riseD||1),wob=Math.sin(t0*15+b.i)*.1;return{lean:-.35+.55*zsm_(u),tw:Math.sin(t0*9+b.i)*.15,bob:0,hx:-.2,hy:Math.sin(t0*7+b.i)*.3,R:[.2,.5+wob,.14],L:[-.2,.5-wob,.14],hR:[.6,1,-.2],hL:[-.6,1,-.2],jaw:.8}}
 if(b.gutM)b.gutM.visible=!!b.atk&&b.atype==4&&b.at<b.atd*.54;if(!b.atk)return null;const p=zsm_(b.at/b.atd>1?1:b.at/b.atd),raw=Math.min(1,b.at/b.atd),wu=zsm_(raw/.5),st=zsm_((raw-.5)/.22),rc=zsm_((raw-.72)/.28),w=wu*(1-st),s=st*(1-rc),k=b.big?1.25:1,ty=b.atype;
 const mix=(a,wi,sr)=>zlr(zlr(zlr(a,wi,wu),sr,st),a,rc);let R,L,lean,tw,hx,jaw,bob;
 if(ty==0){R=mix(N,[.14,.58*k,.1],[.1,-.55,.5]);L=mix(NL,[-.14,.58*k,.1],[-.1,-.55,.5]);lean=-.3*w+.55*s;tw=0;hx=-.3*w+.4*s;jaw=.2+.8*w*(1-st*.8);bob=-.06*s*k}
 else if(ty==4){R=mix(N,[.42,.6,-.3],[-.08,.12,.66]);L=mix(NL,[-.08,-.38,.32],[-.14,-.1,.5]);lean=-.4*w+.5*s;tw=.5*w-.35*s;hx=-.45*w+.4*s;jaw=.25+.95*(w+s*.5);bob=-.04*s}
 else if(ty==3){R=mix(N,[.2,-.3,.2],[.4,-.05,.65]);L=mix(NL,[-.2,-.3,.2],[-.4,-.05,.65]);lean=-.22*w+.8*s;tw=0;hx=-.2*w+.55*s;jaw=.2+.95*(w*.6+s);bob=-.07*s}
 else{const sd=ty==1?1:-1,wi=[.55*sd,.08,.1],sr=[-.5*sd,-.2,.58];const A=mix(ty==1?N:NL,wi,sr),G=mix(ty==1?NL:N,[(ty==1?-.1:.1),-.2,.38],[(ty==1?-.12:.12),-.15,.5]);R=ty==1?A:G;L=ty==1?G:A;lean=.12*w+.3*s;tw=(.55*w-.6*s)*sd;hx=.1*s;jaw=.3+.6*s;bob=-.03*s}
 return{lean,tw,bob,hx,hy:tw*.4,R,L,hR:H1,hL:H2,jaw}}

/* ---------- guts: a player who stands somewhere zombies cannot walk to (a table, a ledge, a crate) for more than a couple of seconds gets bombarded.
   Every zombie that cannot melee them and can see them rips out a handful of gut and lobs it in an arc. A hit does exactly what that zombie's normal attack does,
   so perching is never a way to be safe. At most 4 chunks are in the air at once. The host simulates the hit, guests just see the chunks fly. ---------- */
var zGutKit=null;
var zGutGear=()=>zGutKit||(zGutKit={g:new THREE.SphereGeometry(1,8,6),m:[new THREE.MeshLambertMaterial({color:0x8a1d2a,emissive:0x2a0508}),new THREE.MeshLambertMaterial({color:0x5c2a4a,emissive:0x1a0818}),new THREE.MeshLambertMaterial({color:0x6e7a2e,emissive:0x141a06})],dm:new THREE.MeshBasicMaterial({color:0x5a0c14,transparent:true,opacity:.8,depthWrite:false}),dg:new THREE.CircleGeometry(1,10)});
function zGutMesh(sz){const g=new THREE.Group(),K=zGutGear();for(let i=0;i<3;i++){const m=new THREE.Mesh(K.g,K.m[i]);m.scale.set(sz*(1.15-i*.2),sz*(.8+i*.15),sz*(1.3-i*.25));m.position.set((i-1)*sz*.75,(i%2)*sz*.4,(i-1)*sz*.3);g.add(m)}return g}
function zGutHand(b){const a=b.rig&&b.rig.armR;if(!a||!a.fo)return;const m=zGutMesh(.07);m.position.set(0,-(a.L2||.3),0);m.visible=false;a.fo.add(m);b.gutM=m}
function zSees(b,pl){const f=V(b.x,b.big?2.2:1.5,b.z),t=V(pl.x,(pl.y||0)+1.1,pl.z),d=t.clone().sub(f),L=d.length();if(L<.1)return true;return castW(f,d.multiplyScalar(1/L),L)>=L-.3}
function zThrowGut(b,pl){if(!zq)return;const ry=b.m.rotation.y,from=V(b.x+Math.sin(ry)*.45,b.big?2.5:1.6,b.z+Math.cos(ry)*.45),to=V(pl.x,(pl.y||0)+1.1,pl.z);if(pl.me){to.x+=(P.mx||0)*.22;to.z+=(P.mz||0)*.22}
 const dx=to.x-from.x,dz=to.z-from.z,dy=to.y-from.y,hd=Math.hypot(dx,dz)||1,T=Math.max(.3,hd/15),G=11,vx=dx/T,vz=dz/T,vy=(dy+.5*G*T*T)/T;
 zGutLaunch(from.x,from.y,from.z,vx,vy,vz,b.dm,b.i,b.big,0);if(netOn&&isHost)netSend({t:'zg',x:from.x,y:from.y,z:from.z,vx,vy,vz,big:b.big?1:0});
 beep(150+Math.random()*60,.3,'sawtooth',.08);noise(.25,450,.3);burst(from,6,0x8a1d2a,3,.4,.08)}
function zGutLaunch(x,y,z,vx,vy,vz,dm,bi,big,vis){const sz=big?.2:.13,m=zGutMesh(sz);m.position.set(x,y,z);(zG||S).add(m);zq.guts.push({m,x,y,z,sx:x,sz:z,vx,vy,vz,dm,bi,big,vis,t:0,sz_:sz})}
function zGutSplat(x,y,z,ground,big){const q=V(x,y,z);burst(q,big?32:20,0x8a1d2a,5.5,.7,.12);burst(q,big?12:8,0x6e7a2e,4,.6,.09);burst(q,6,0x5c2a4a,3,.8,.14);noise(.18,280,.3);beep(90,.15,'sawtooth',.05);
 if(ground&&zq.decals){const K=zGutGear(),d=zq.decals;let e;if(d.length>=22){e=d.shift();e.m.visible=true}else{e={m:new THREE.Mesh(K.dg,K.dm.clone())};e.m.rotation.x=-Math.PI/2;(zG||S).add(e.m)}
  const s=(big?1.1:.65)*(.8+Math.random()*.5);e.m.scale.set(s,s*(.7+Math.random()*.5),1);e.m.rotation.z=Math.random()*6.28;e.m.position.set(x,.045+Math.random()*.01,z);e.t=0;e.m.material.opacity=.8;d.push(e)}}
function zGore(){const e=$('#zgore');if(!e)return;e.style.transition='none';e.style.opacity='1';e.style.backgroundPosition=(Math.random()*100|0)+'% '+(Math.random()*100|0)+'%';void e.offsetWidth;e.style.transition='opacity 1.1s ease-out';e.style.opacity='0'}
function zGutTick(dt){const G=11,gs=zq.guts;
 for(let i=gs.length-1;i>=0;i--){const g=gs[i];g.t+=dt;g.vy-=G*dt;const nx=g.x+g.vx*dt,ny=g.y+g.vy*dt,nz=g.z+g.vz*dt;g.m.rotation.x+=dt*9;g.m.rotation.z+=dt*7;
  let hit=0,vic=null;
  if(!g.vis)for(const p of zPlayers()){if(Math.abs(nx-p.x)<.55&&Math.abs(nz-p.z)<.55&&ny>(p.y||0)+.05&&ny<(p.y||0)+1.9){hit=2;vic=p;break}}
  if(!hit){if(ny<=.05)hit=1;else for(const b of bx){if(b.pl)continue;if(nx>b.x0&&nx<b.x1&&nz>b.z0&&nz<b.z1&&ny<b.h&&ny>b.y0){hit=3;break}}}
  if(!hit&&g.t>4)hit=1;
  if(hit){gs.splice(i,1);(zG||S).remove(g.m);zGutSplat(nx,Math.max(.1,ny),nz,hit==1,g.big);
   if(hit==2&&vic){const src_=bots.find(q=>q.i==g.bi)||{x:g.sx,z:g.sz,i:g.bi,nm:'Zombie',zom:1};
    if(vic.me){if(!(zq.dash&&zq.dash.t>0)){hurt(g.dm,src_);kick+=.03;shake=Math.max(shake,.4);LX.fx.dmg=Math.max(LX.fx.dmg,.4);zGore()}}
    else netSend({t:'hit',to:vic.id,d:g.dm,bot:g.bi})}
   continue}
  g.x=nx;g.y=ny;g.z=nz;g.m.position.set(nx,ny,nz);if(Math.random()<dt*30)burst(V(nx,ny,nz),1,0x8a1d2a,1.2,.35,.07)}
 for(const d of zq.decals){d.t+=dt;if(d.t>8)d.m.material.opacity=Math.max(0,.8*(1-(d.t-8)/6));if(d.t>14)d.m.visible=false}}

/* ---------- movement: zombies stop at arm's length instead of walking into you, nobody can stand inside anybody, and attacks are animated ---------- */
function zMove(dt){const zs=bots.filter(b=>b.zom&&b.al&&!b.zquestBoss),pls=zPlayers(),M=MAPS[sel.map];
 const EL=zq.elev;for(const p of pls)EL[p.id]=(p.y||0)>.55?(EL[p.id]||0)+dt:0;
 zq.gutCD=(zq.gutCD||0)-dt;let gutBusy=zq.guts.length;for(const z_ of zs)if(z_.atk&&z_.atype==4)gutBusy++;
 for(const b of zs){
  if(b.rise>0){b.rise-=dt;const u=Math.min(1,1-b.rise/b.riseD),e=1-Math.pow(1-u,2.2);b.m.position.set(b.x,b.riseY*(1-e),b.z);if(b.riseY&&Math.random()<dt*20)burst(V(b.x,.15,b.z),1,0x5a4630,2,.4,.12);b.tyaw=b.m.rotation.y;continue}
  if(M.entry&&M.entry(b,dt))continue;
  let pl=null,bd=1e9;for(const p of pls){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<bd){bd=d;pl=p}}if(!pl)continue;
  const reach=1.5*(b.big?1.25:1),stopD=1.05*(b.big?1.2:1);let sps=b.sp;if(b.stun>0){b.stun-=dt;sps*=.15}
  if(b.atk||bd<stopD)sps=0;
  const D=navMove(b,dt,pl.x,pl.z,sps,zfls[pl.id]);b.m.position.set(b.x,0,b.z);b.tyaw=bd<4||b.atk?Math.atan2(pl.x-b.x,pl.z-b.z):(b.mva==null?b.m.rotation.y:b.mva);
  b.cd-=dt;b.gcd=(b.gcd==null?1+Math.random()*2.5:b.gcd)-dt;const canMelee=bd<reach&&Math.abs(pl.y)<1.4;
  if(b.atk){b.at+=dt;if(b.atype==3&&b.at>b.atd*.3&&b.at<b.atd*.55&&bd>.95){const dx=pl.x-b.x,dz=pl.z-b.z;mv(b,dx/bd*3.4*dt,dz/bd*3.4*dt,.45)}
   if(!b.ahit&&b.at>=b.atd*.52){b.ahit=1;if(b.atype==4)zThrowGut(b,pl);else zStrike(b,pl)}if(b.at>=b.atd){b.atk=0;b.cd=Math.max(.2,b.ac-b.atd)}}
  else if(canMelee&&b.cd<=0&&!(b.stun>0))zAtkStart(b,pl);
  else if(!canMelee&&(EL[pl.id]||0)>2.2&&bd>1.1&&bd<17&&b.gcd<=0&&gutBusy<2&&zq.gutCD<=0&&!(b.stun>0)&&zSees(b,pl)){zAtkStart(b,pl,4);gutBusy++;zq.gutCD=1.8+Math.random()*1.8;b.gcd=Math.max(b.gcd,5+Math.random()*3)}
  else if(bd>=reach)b.cd=Math.max(b.cd,.3)}
 /* zombies are solid to each other */
 for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++){const a=zs[i],c=zs[j];if(a.rise>0||c.rise>0||(M.entry&&(!a.entered||!c.entered)))continue;const dx=c.x-a.x,dz=c.z-a.z,R=(a.big||c.big)?1.15:.9,d2=dx*dx+dz*dz;if(d2<R*R&&d2>1e-6){const d=Math.hypot(dx,dz),p=(R-d)*.5/d;mv(a,-dx*p,-dz*p,.45);mv(c,dx*p,dz*p,.45)}}
 zq.gn-=dt;if(zq.gn<=0&&zs.length){zq.gn=2+Math.random()*2;const b=zs[Math.random()*zs.length|0],d=Math.hypot(b.x-P.x,b.z-P.z);if(d<25)beep(70+Math.random()*50,.4,'sawtooth',Math.max(.01,.05-d*.002))}}
/* the player is solid too: zombies cannot be walked through (or walked into) and they shove you when they crowd you; a Nitro dash plows through */
function zPush(dt){if(P.dead||(zq.dash&&zq.dash.t>0))return;const own=isHost||!netOn;
 for(const b of bots){if(!b.zom||!b.al||b.rise>0||(zq.barricade&&(own?!b.entered:b.z<-3.5)))continue;const R=b.big?1.15:.95,dx=P.x-b.x,dz=P.z-b.z,d=Math.hypot(dx,dz);if(d>=R||Math.abs((b.y||0)-(P.y||0))>1.6)continue;
  const nx=d>.001?dx/d:1,nz=d>.001?dz/d:0,pen=R-d;if(own){mv(P,nx*pen*.65,nz*pen*.65,.45);if(!b.zp)mv(b,-nx*pen*.35,-nz*pen*.35,.45)}else mv(P,nx*pen,nz*pen,.45);
  const vin=-((P.mx||0)*nx+(P.mz||0)*nz);if(vin>0){P.mx=(P.mx||0)+nx*vin;P.mz=(P.mz||0)+nz*vin}}}
function zAnim(dt){for(let i=zdead.length-1;i>=0;i--){const d=zdead[i];d.t+=dt;ragTick(d.b,dt);if(d.t>6&&d.b.rag)d.b.rag.sink=(d.t-6)*1.4;if(d.t>7.2){S.remove(d.b.m);const j=bots.indexOf(d.b);if(j>=0)bots.splice(j,1);zdead.splice(i,1)}}}

/* ---------- round flow ---------- */
/* what a new round does for every player (host and guests): camo check, bring downed players back. Ammo is NOT restocked: buy it at the wall or at an Ammo Crate. */
function zRoundFx(){const z=zq;zRoundDone(z.r);rel=0;if(netOn&&P.dead)zRespawn();
 msg(z.brutes?'Round '+z.r+' · Brutes incoming':'Round '+z.r,3);roundSnd('new',z.brutes);if(typeof estRound=='function')estRound(z.r,z.brutes)}
function zNewRound(){const z=zq;z.r++;z.puRound=0;z.st='run';z.toSpawn=zTot(z.r);z.brutes=z.r%5==0?Math.floor(z.r/5):0;z.spT=.6;zRoundFx();if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:0,br:z.brutes})}
function zEndRound(){const z=zq;z.st='prep';z.tm=8;msg('Round '+z.r+' survived',2.5);roundSnd('end');if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:z.tm})}
function zRoundSync(d){const z=zq;if(d.r>z.r){z.r=d.r;z.brutes=d.br||0;zRoundFx()}else if(d.st=='prep'&&z.st!='prep'){msg('Round '+z.r+' survived',2.5);roundSnd('end')}z.st=d.st;z.tm=d.tm;if(d.rm!=null)z.rm=Math.min(999,Math.max(0,d.rm|0))}
/* per-frame work shared by the host and by guests */
function zCommon(dt){const z=zq;if(!P.dead&&t0-lastHit>(z.perks.rev?2:6)&&P.hp<P.mhp)P.hp=Math.min(P.mhp,P.hp+(z.perks.rev?24:12)*dt);
 if(z.down){z.dnT-=dt;if(z.dnT<=0){z.down=0;z.out=1;msg('You bled out. You return next round',3)}}
 if(z.cur&&z.cur.rv&&key.KeyF&&!P.dead){z.rvT+=dt;const rvN=z.perks.rev?1:2;$('#zp').textContent=`Reviving ${z.cur.rv.nm}… ${Math.min(100,Math.round(z.rvT/rvN*100))}%`;if(z.rvT>=rvN){z.rvT=0;netSend({t:'zqv',to:z.cur.rv.id});z.pts+=100;feed('You revived '+z.cur.rv.nm)}}else z.rvT=0;
 if(P.dead&&z.dash.t>0)z.dash.t=0;zDashTick(dt);zPapTick(dt);zPuTick(dt);zPush(dt);zGutTick(dt);zAnim(dt);zQuestTick(dt);zInteract();if(z.barricade)lockboxHold();zMarkers();zProne();if(typeof estTick=='function')estTick(dt)}
function zomTick(dt){const z=zq;if(!z||mode!='Zombies')return;const M=MAPS[sel.map];
 let alive=0;for(const b of bots)if(b.zom&&b.al&&!b.zquestBoss&&!b.zquestAdd)alive++;
 if(!zQuestActive()&&z.st=='prep'){z.tm-=dt;if(z.tm<=0)zNewRound()}
 else if(!zQuestActive()){z.spT-=dt;if(z.toSpawn>0&&z.spT<=0){const room=Math.min(24,6+z.r*2)-alive;if(room>0){const n=Math.min(room,z.toSpawn,2+(z.r>3?1:0)+(z.r>8?1:0));for(let i=0;i<n;i++){const big=z.brutes>0&&(z.toSpawn-i<=z.brutes||Math.random()<.2);if(big)z.brutes--;zSpawn(M,big)}z.toSpawn-=n;z.spT=Math.max(1.2,3.2-z.r*.12)}else z.spT=.4}
  if(z.toSpawn<=0&&alive<=0)zEndRound()}
 z.fl-=dt;if(z.fl<=0&&zgr){z.fl=.35;zfls={};for(const pl of zPlayers())zfls[pl.id]=zFlow(pl)}
 if(!z.main?.fight)zMove(dt);zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,1));
 if(netOn){zbT+=dt;if(zbT>.1){zbT=0;netSend({t:'zb',bw:z.barricade?.count,brw:z.barricade?.reinforced,bl:(typeof EST!='undefined'&&EST.bx?EST.bx.loc:-1),lo:(typeof lonPack=='function'?lonPack():0),mq:zQuestPack(z.main),r:z.r,l:bots.filter(b=>b.zom&&b.al).map(b=>[b.i,+b.x.toFixed(1),+b.z.toFixed(1),b.big?1:0,b.atk?b.atype+1:0,b.tear||0,b.tearY||0,b.crossing||0,b.zquestBoss?[b.tyaw||0,b.rise,b.riseY,b.riseD,b.at,b.atd]:null])})}
  zsT+=dt;if(zsT>.5){zsT=0;netSend({t:'zs',r:z.r,st:z.st,tm:Math.ceil(z.tm),br:z.brutes,rm:z.rm|0})}
  if(!zPlayers().length&&!over){z.ad+=dt;if(z.ad>6)endGame('You reached round '+z.r)}else z.ad=0}
 z.rm=Math.min(999,Math.max(0,(z.hound&&!z.hound.done)?(z.hound.left|0):z.toSpawn+alive));$('#ob').textContent='';zHud()}
/* lying prone in front of a perk machine pays 100 points, once per machine per match and only to the first player who does it (the host decides in co-op) */
function zProne(){const z=zq;if(!z||P.dead||!ST.prone||!z.mp)return;z.pbq=z.pbq||{};for(const m of z.mp){if(z.pb[m.k]||z.pbq[m.k])continue;const a=FACE[m.f],fx=Math.sin(a),fz=Math.cos(a),dx=P.x-m.x,dz=P.z-m.z,fw=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);
  if(fw>.7&&fw<3.6&&lat<1.8){z.pbq[m.k]=1;if(zCli())netSend({t:'zqp',k:m.k});else zProneGrant(m.k,zMe())}}}
function zProneGrant(k,by){const z=zq,m=z.mp.find(q=>q.k==k);if(!m||z.pb[k])return;z.pb[k]=by;if(by==zMe())zProneGift(k);if(netOn&&isHost)netSend({t:'zpg',k,by})}
/* the classic cash register: a drawer thunk, then two bright bells that ring out */
function zCash(){try{ac=ac||new AudioContext();const t=ac.currentTime,out=ac.createGain();out.gain.value=vol;out.connect(ac.destination);
 const tn=(ty,f0,f1,t0,d,pk)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t0);if(f1!=f0)o.frequency.exponentialRampToValueAtTime(f1,t0+d);g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(pk,t0+.004);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+d+.02)};
 tn('sine',150,60,t,.09,.22);
 for(const[t0,f]of[[.07,2093],[.2,2794]]){tn('sine',f,f,t+t0,.55,.15);tn('sine',f*2.76,f*2.76,t+t0,.28,.06);tn('triangle',f*1.005,f*1.005,t+t0,.4,.05)}}catch(e){}}
function zProneGift(k){const z=zq;z.pts+=100;zCash();try{if(typeof zGainFx=='function')zGainFx(100)}catch(e){}}
/* guests: the host runs the world, guests move the puppets and handle their own interactions */
function zcTick(dt){const z=zq;if(!z||mode!='Zombies')return;const k=Math.min(1,dt*10);
 for(const b of bots)if(b.zp&&b.al){const ox=b.x,oz=b.z;if(b.rise>0){b.rise-=dt;if(b.zquestBoss)b.m.position.y=b.riseY*Math.max(0,b.rise)/b.riseD;else b.tyaw=b.m.rotation.y;continue}if(b.crossing){lockboxVaultStep(b,Math.min(.999,b.crossing+dt/LOCKBOX_WINDOW.vaultTime));continue}b.x+=(b.tx-b.x)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,0,b.z);if(!b.zquestBoss&&Math.hypot(b.tx-ox,b.tz-oz)>.02)b.tyaw=Math.atan2(b.tx-ox,b.tz-oz);
  if(b.atk){b.at+=dt;if(b.at>=b.atd)b.atk=0}}
 zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,0));zHud()}
function zSync(d){const seen=new Set();for(const[i,x,z,big,ak,tear,tearY,vault,quest]of d.l){seen.add(i);let b=bots.find(q=>q.zp&&q.i==i);if(!b)b=zPuppet(i,x,z,big,d.r);b.tx=x;b.tz=z;b.tear=tear;b.tearY=tearY;if(vault){b.rise=0;lockboxVaultStep(b,b.crossing?Math.max(b.crossing,vault):vault)}else if(b.crossing){b.crossing=0;b.vaultPose=null;b.y=0}if(tear)b.tyaw=0;if(ak&&!b.atk){b.atk=1;b.at=0;b.atd=(ak==5?.8:.65)*(big?1.15:1);b.atype=ak-1}if(quest){[b.tyaw,b.rise,b.riseY,b.riseD,b.at,b.atd]=quest;b.atk=ak>0;b.atype=Math.max(0,ak-1)}}
 for(const b of bots)if(b.zp&&b.al&&!seen.has(b.i)){b.al=0;b.atk=0;zdead.push({b,t:0});ragStart(b,b.x-P.x,b.z-P.z,3)}}
function zInteract(){const z=zq;let best=null,bd=1e9;if(!P.dead&&z.papT<=0){for(const it of zi){const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r&&d<bd&&it.txt()){bd=d;best=it}}
  if(netOn)for(const b of bots)if(b.net&&!b.hb&&!b.al&&b.dn){const d=Math.hypot(P.x-b.x,P.z-b.z);if(d<2.6&&d<bd){bd=d;best={rv:b,txt:()=>PG.t('Hold F to revive '+b.nm),cost:()=>0,act:()=>{}}}}}
 z.cur=best;const e=$('#zp');if(P.dead&&z.down){e.textContent=`DOWN · bleeding out in ${Math.ceil(z.dnT)}s · a teammate can revive you`;e.className='bad';return}
 if(z.papT>0){e.textContent=`Pack-a-Punch · ${z.papT.toFixed(1)}s`;e.className='';return}
 if(best){const c=best.cost();e.textContent=best.rv?best.txt():`[${typeof ctlKey=='function'?ctlKey('use'):'F'}] ${best.txt()}${c?'  ['+c+']':''}`;e.className=c>z.pts?'bad':''}else{e.textContent='';e.className=''}}
function zUse(){if(!zq||P.dead||over)return;if(zq.cur)zq.cur.act()}
function zHudInit(){if(!$('#zpus')){const e=document.createElement('div');e.id='zpus';$('#hud').appendChild(e)}if($('#zdash'))return;const d=document.createElement('div');d.id='zdash';d.innerHTML='<svg viewBox="0 0 44 44"><circle class="bg" cx="22" cy="22" r="18"/><circle class="fg" cx="22" cy="22" r="18"/></svg><b>DASH</b><em>AIM</em>';$('#hud').appendChild(d)}
function zHudShow(on){const d=$('#zdash');if(d)d.style.display=on?'block':'none'}
/* what the ammo line shows besides the gun: your melee weapon and, for the Nitrogen Fists, the dash */
function zAmmoX(){if(!zq)return'';const m=zq.mel;return ' · '+(m.pn||m.k)}
const timedPowerups=['insta','dbl','fire'],powerupHud={};
function zPuHud(){
 const el=$('#zpus');if(!el)return;
 for(const k of timedPowerups){
  const t=zq.pu[k];let node=powerupHud[k];
  if(t<=0){if(node?.p.parentNode)node.p.remove();continue}
  if(!node){
   const p=document.createElement('div'),def=ZPU[k];
   p.className='pu';p.style.setProperty('--c',hex(def.c));
   p.innerHTML='<span>'+def.i+'</span><b></b><i></i>';
   powerupHud[k]=node={p,time:p.querySelector('b'),bar:p.querySelector('i'),seconds:-1};
  }
  if(!node.p.parentNode){
   const following=timedPowerups.slice(timedPowerups.indexOf(k)+1).find(next=>powerupHud[next]?.p.parentNode===el);
   el.insertBefore(node.p,following?powerupHud[following].p:null);
  }
  const seconds=Math.ceil(t);
  if(node.seconds!==seconds){node.seconds=seconds;node.time.textContent=seconds}
  node.p.classList.toggle('lo',t<6);
  node.bar.style.width=Math.min(100,t/30*100)+'%';
 }
}
/* zombies left: one plain white number at the top of the screen (Settings > Zombies left counter), only while a round is running */
function zRem(n){let e=$('#zrem');if(!e){e=document.createElement('div');e.id='zrem';$('#hud').appendChild(e)}const on=typeof OPT=='undefined'||OPT.zrem!==0,s=on&&zq&&zq.st=='run'&&n>0&&!zq.out?String(n):'';if(e._s!==s){const grow=e._s&&s&&+s<+e._s;e._s=s;e.textContent=s;e.className=s?'on':'';if(grow){e.classList.remove('tk');void e.offsetWidth;e.classList.add('tk')}}}
function zHud(){zRem(zq&&zq.rm);zPuHud();const z=zq,ic=Object.keys(z.perks).filter(k=>z.perks[k]).map(k=>`<i style="background:${hex(PERKS[k].c)}">${PERKS[k].n[0]}</i>`).join(''),tm=netOn?bots.filter(b=>b.net&&!b.hb).map(b=>`${esc(b.nm)} ${b.zpts|0}${b.al?'':b.dn?' ✚':' ✖'}`).join('<br>'):'',k=z.r+'|'+z.pts+'|'+ic+'|'+tm+'|'+(z.down?1:0);
 const dd=$('#zdash');if(dd){const nitro=z.mel.k=='Nitrogen Fists';dd.style.display=nitro?'block':'none';if(nitro){const d=z.dash,u=d.cd>0?d.cd/(d.max||6):0;dd.classList.toggle('rdy',d.cd<=0);dd.classList.toggle('act',d.t>0);dd.querySelector('.fg').style.strokeDashoffset=String(113*u);dd.querySelector('em').textContent=d.cd>0?d.cd.toFixed(1)+'s':MV.eq?'AIM':'V'}}
 if(k==zhc)return;zhc=k;$('#zr').textContent=z.r||'';$('#zpt').textContent=z.pts+(z.down?' · DOWN':'');$('#zpk').innerHTML=ic;$('#zt').innerHTML=tm}
/* downed: Revive Soda brings you back by yourself, a teammate can revive you (co-op), otherwise the run ends */
function zDown(){const z=zq;if(!z)return;P.rt=1e9;const rev=z.perks.rev;z.perks={};P.mhp=50;z.cap=2;z.dash.t=0;z.pap=null;z.papT=0;if(wp.length>2){wp.length=2;if(cur>1){cur=1;setGun()}}gun.visible=false;MV.eq=0;
 if(rev){msg('Reviving in 4…',3);setTimeout(()=>{if(run&&mode=='Zombies'&&!over&&P.dead&&!z.out)zRevive()},4000)}
 else if(netOn){z.down=1;z.dnT=45;msg('You are down. Hold on until a teammate revives you',3);netSend({t:'zdn'})}
 else endGame('You reached round '+z.r)}
/* knocked: you lie on the floor (low camera, slow crawl) instead of ragdolling */
function zDownCam(dt){const f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0);if((f||s)&&zq&&!over){const sy=Math.sin(yaw),cy=Math.cos(yaw),n=Math.hypot(f,s)||1;mv(P,(-sy*f+cy*s)/n*1.5*dt,(-cy*f-sy*s)/n*1.5*dt,.4)}
 C.position.set(P.x,.42+Math.sin(t0*2)*.01,P.z);C.rotation.set(Math.max(-.6,Math.min(.4,pitch*.5))-.1,yaw,.18)}
/* every player on their feet sees a marker over a downed teammate */
function zMarkers(){if(!netOn)return;for(const b of bots){if(!b.net||b.hb)continue;const need=!b.al&&b.dn&&!P.dead;if(need&&!b.zmk){b.zmk=zSprite('','#ff5a3a',.8,0);S.add(b.zmk);b.zmt=0}if(!need&&b.zmk){S.remove(b.zmk);b.zmk=null}
  if(b.zmk){b.zmk.position.set(b.x,2.3,b.z);if(t0>b.zmt){b.zmt=t0+.4;zSet(b.zmk,'✚ '+b.nm+' '+Math.round(Math.hypot(P.x-b.x,P.z-b.z))+'m','#ff5a3a')}}}}
function zRevive(){endDeath();P.dead=0;P.hp=P.mhp*.6;P.sh=P.msh;gun.visible=true;rel=0;zq.down=zq.out=0;if(isHost||!netOn)for(const b of bots)if(b.zom&&b.al){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d<7&&d>.01)mv(b,dx/d*(7-d),dz/d*(7-d),.45)}msg('Revived!',2);beep(660,.2,'triangle',.1)}
/* a downed or bled-out player returns at the start of the next round with a pistol and bare hands (points are kept) */
function zRespawn(){const z=zq,ps=MAPS[sel.map].ps;endDeath();P.dead=0;z.down=z.out=0;z.perks={};z.cap=2;z.mel={k:'Fists',pap:0};z.dash.cd=0;z.dash.t=0;zPaintHands();P.mhp=50;P.hp=50;P.sh=P.msh;wp=[zGunObj('CT')];cur=0;rel=0;gc=Math.max(gc,2);setGun();P.x=ps[0];P.z=ps[1];P.y=0;gun.visible=true;msg('Back in the fight',2)}
/* network messages: types starting with z (longer than one letter) are routed here from onMsg */
function zNet(d,cn){const z=zq;if(!z||mode!='Zombies')return;
 switch(d.t){
 case'zmainuse':case'zmaincue':case'zmainnote':case'zmainhit':case'zmainwin':zQuestNet(d,cn);break;
 case'zqh':if(isHost){const b=bots.find(x=>x.zom&&!x.zp&&x.i==d.i&&x.al);if(b)zDamage(b,d.d,d.h,d.id,d.k,d.m)}break;
 case'zqd':if(isHost)zOpenDoor(d.i,d.id);break;
 case'zqp':if(isHost)zProneGrant(d.k,d.id);break;
 case'zpg':if(!isHost){z.pb[d.k]=d.by;if(d.by==myId)zProneGift(d.k)}break;
 case'zqw':if(isHost&&z.barricade)lockboxRepair(bots.find(b=>b.net&&b.al&&b.id==d.id),d.quick===true,d.reinforced===true);break;
 case'zqb':if(isHost&&zboxes[d.i]&&zboxes[d.i].st==0)zBoxStart(zboxes[d.i],d.i,d.id);break;
 case'zqe':if(isHost){const o=zboxes[d.i];if(o&&o.st==2&&o.by==d.id)zBoxEnd(o,d.i)}break;
 case'zqr':if(isHost){z.revBuys++;zRevCount(z.revBuys);netSend({t:'zrev',n:z.revBuys})}break;
 case'zqv':if(d.to==myId&&P.dead&&z.down)zRevive();break;
 case'zd':if(!isHost){if(d.by==myId&&zdoors[d.i])z.pts-=zdoors[d.i].d.c;zOpenDoor(d.i,d.by)}break;
 case'zbs':if(!isHost){const o=zboxes[d.i];if(!o)break;if(d.st==1){if(d.by==myId)z.pts-=zBoxCost();o.st=1;o.t=0;o.cy=0;o.by=d.by;if(typeof estBoxState=='function')estBoxState(o,1)}else if(d.st==2){o.item=d.item;o.st=2;o.t=0;o.by=d.by;o.beam.visible=o.lab.visible=true;zSet(o.lab,zItemName(d.item),d.item=='RG'||d.item=='NF'?'#ff4a4a':'#7bf08a');if(typeof estBoxShow=='function')estBoxShow(o,d.item,1)}else if(d.st==3){o.st=3;o.t=0;zSet(o.lab,'THE BOX IS MOVING!','#ff4a4a');o.beam.visible=o.lab.visible=true;if(d.by==myId)z.pts+=zBoxCost()}else{o.st=0;o.beam.visible=o.lab.visible=false;if(typeof estBoxState=='function')estBoxState(o,0)}}break;
 case'zbl':if(!isHost){estBoxGo(d.i);msg('The Mystery Box has moved',2.8)}break;
 case'zlon':if(isHost&&typeof lonDo=='function')lonDo(d.a);break;
 case'zdn':if(d.id!=myId){const nm=names[d.id]||'A teammate';popup('PLAYER DOWN',nm+' needs a revive!');feed(nm+' is down');beep(260,.25,'sawtooth',.1);setTimeout(()=>beep(200,.3,'sawtooth',.1),220)}break;
 case'zrev':if(!isHost)zRevCount(d.n);break;
 case'zk':if(!isHost&&d.to==myId){zGain(d.pts);zCryptHeal(d.m);kills++;wzkill(d.k);killXP(d.h);beep(900,.06,'square',.05)}break;
 case'zb':if(!isHost){if(d.bw!=null)lockboxBoards(d.bw,d.brw);if(d.bl!=null&&d.bl>=0&&typeof EST!='undefined'&&EST.bx&&d.bl!==EST.bx.loc)estBoxGo(d.bl,1);if(typeof lonSync=='function')lonSync(d);zSync(d);zQuestSync(d.mq)}break;
 case'zbt':if(!isHost&&z.barricade)lockboxShockFx();break;
 case'zpu':if(!isHost)zPuSpawn(d.id,d.k,d.x,d.z);break
 case'zpc':if(!isHost){const q=z.drops.find(x=>x.id==d.id);if(q)zPuRemove(q);zPuApply(d.k,d.by)}break
 case'zg':if(!isHost)zGutLaunch(d.x,d.y,d.z,d.vx,d.vy,d.vz,0,0,d.big,1);break
 case'zs':if(!isHost)zRoundSync(d);break}}


/* ---------- FIRE SALE: every Mystery Box location on the map spawns (each one drops in with a flash), and when the sale ends only the box that was there before stays;
   a box that is still spinning when the sale ends finishes its roll first and then disappears. ---------- */
function zFireSaleHide(o){try{burst(V(o.m.x,1,o.m.z),30,0xff4aa0,6,.8,.12);estBoxSet(o,false);o.st=0;o.g.position.y=0;o.g.rotation.z=0;if(o.beam)o.beam.visible=false;if(o.lab)o.lab.visible=false;if(o.sp)o.sp.I=0}catch(e){}}
function zFireSale(on){if(typeof EST=='undefined'||!EST.bx||zboxes.length<2)return;const B=zboxes;
 if(on){if(EST.bx.fs)return;EST.bx.fs=1;EST.bx.home=EST.bx.loc;B.forEach((o,j)=>{o.fsHide=0;if(!o.on){estBoxSet(o,true);o.drop=1;o.g.position.y=16;burst(V(o.m.x,1.2,o.m.z),34,0xff4aa0,7,.9,.13);burst(V(o.m.x,1.2,o.m.z),14,0xffffff,9,.5,.08)}});
  [880,1100,1320].forEach((f,i)=>setTimeout(()=>beep(f,.12,'triangle',.07),i*90))}
 else{if(!EST.bx.fs)return;EST.bx.fs=0;const h=EST.bx.home;B.forEach((o,j)=>{if(j==h||!o.on)return;if(o.st==0||o.st==3)zFireSaleHide(o);else o.fsHide=1});EST.bx.loc=h>=0?h:EST.bx.loc;EST.bx.uses=0}}

/* ===================== PACK-A-PUNCH TIER III: 20,000 points =====================
   Void Seraph: black obsidian with white-hot cracks and an oil-slick rim. Big stats, and THREAT SENSE while the weapon is in your hands:
   zombies you cannot see are outlined in red: the ones behind walls get a glowing red silhouette (an outline with a see-through middle), and the ones outside your view get a small red chevron at the edge of the screen
   pointing the way. Subtle on purpose: nearest few only, soft pulse, nothing at all when the weapon is not held. ===================== */
var PAP3_FS=`uniform float t;varying vec3 vN;varying vec3 vV;varying vec3 vP;
float h3(vec3 p){p=fract(p*0.3183099+vec3(0.1,0.2,0.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(h3(i),h3(i+vec3(1.,0.,0.)),f.x),mix(h3(i+vec3(0.,1.,0.)),h3(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(h3(i+vec3(0.,0.,1.)),h3(i+vec3(1.,0.,1.)),f.x),mix(h3(i+vec3(0.,1.,1.)),h3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float f3(vec3 p){float a=0.5,s=0.0;for(int i=0;i<4;i++){s+=a*n3(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
void main(){vec3 N=normalize(vN);vec3 V=normalize(vV);float fr=pow(1.0-max(dot(N,V),0.0),2.6);
 float c=1.0-smoothstep(0.0,0.045,abs(f3(vP*8.0+vec3(0.0,t*0.12,0.0))-0.5));float c2=1.0-smoothstep(0.0,0.03,abs(f3(vP*15.0-t*0.1)-0.5));
 float pulse=0.75+0.25*sin(t*2.6+vP.x*7.0+vP.y*5.0);vec3 core=mix(vec3(1.0,0.12,0.06),vec3(1.0,0.86,0.62),c*c)*(c+0.55*c2)*pulse*1.7;
 vec3 iri=0.5+0.5*cos(6.2831*(fr*1.1+vec3(0.0,0.33,0.67)+t*0.04));vec3 base=vec3(0.02,0.018,0.026)+0.05*fr;
 vec3 H=normalize(V+normalize(vec3(0.3,0.8,0.5)));float sp=pow(max(dot(N,H),0.0),56.0);
 gl_FragColor=vec4(base+core+iri*fr*0.6+sp*vec3(0.9,0.85,0.95)*0.55,1.0);}`;
PAPC.push('Void Seraph');
zPapMat=function(t){const n=PAPC[Math.min(3,t)-1];if(!rfm[n])rfm[n]=new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:t>1?1:0}},vertexShader:CAMO_VS,fragmentShader:t>=3?PAP3_FS:PAP_FS});return rfm[n]};
zPap=function(w){
 const B=W[w.k],t=(w.pap||0)+1;
 w.pap=t;w.pm=t==1?2.2:t==2?3.6:5.4;if(w.k=='RG')w.pm=t==1?3:t==2?6:9;
 if(B.singleLoad){w.m=1;w.rs=B.rs+6*t;w.rl=B.rl*(1-.15*t)}else w.m=Math.round(B.m*(t==1?1.5:t==2?2:2.6));
 w.r=B.r*(t==1?.9:t==2?.8:.72);w.pn=B.n+(t==1?' PaP':t==2?' PaP II':' PaP III');
 w.mag=w.m;w.res=w.m*w.rs;rel=0;setGun();
};
zPapMel=function(){const m=zq.mel,t=(m.pap||0)+1;m.pap=t;m.pn=m.k+(t==1?' PaP':t==2?' PaP II':' PaP III');zPaintHands()};
zMeleeStats=function(m){const t=zq.mel.pap||0,s={...m};if(!t)return s;s.reach=m.reach+.3*t;s.cnt=m.cnt+t;s.cd=m.cd*(1-.14*t);return s};
zPapTxt=function(){const k=zPapTarget();if(zq.papT>0)return 'Pack-a-Punch is working…';if(k=='mel'){const m=zq.mel,t=m.pap||0;return t>=3?'Melee fully upgraded':'Pack-a-Punch the '+(m.pn||m.k)+(t==2?' (tier III)':'')}const w=cw(),t=w.pap||0;return t>=3?'Weapon fully upgraded':'Pack-a-Punch the '+(w.pn||W[w.k].n)+(t==2?' to tier III: Threat Sense':'')+'  (draw your melee with V to upgrade it instead)'};
zPapCost=function(){if(zq.papT>0)return 0;const k=zPapTarget(),t=k=='mel'?zq.mel.pap||0:cw().pap||0;return [5000,10000,20000][t]||0};
zPapAct=function(pos){if(zq.papT>0)return;const k=zPapTarget(),mel=k=='mel',t=mel?zq.mel.pap||0:cw().pap||0,c=[5000,10000,20000][t];if(!c)return zf('Already fully upgraded');if(zq.pts<c)return zf('Not enough points');
 zq.pts-=c;const tg=mel?null:cw();zq.pap={t:0,dur:3,mel,w:tg,tier:t+1,pos};zq.papT=3;MV.eq=0;gun.visible=false;zBuyFx(pos[0],1.8,pos[1],t==2?0xff3a30:0xb070ff,'-'+c);beep(200,.6,'sawtooth',.1);if(typeof estPap=='function')estPap(1,zq.pap)};
{const _s=setGun;setGun=function(){_s.apply(this,arguments);const w=cw();if(mode=='Zombies'&&w&&w.pap>=3)gf.material.color.setHex(0xff5a40)}}

/* ---- Threat Sense ---- */
var TSN={geo:null,mat:null,gh:new Map(),ar:[],root:null,t:0,chk:0,fade:0};
function tsHeld(){if(mode!='Zombies'||!zq||P.dead||!run||paused)return false;if(typeof CG!='undefined'&&CG.th>0)return true;if(typeof MV!='undefined'&&MV.eq)return zq.mel&&(zq.mel.pap||0)>=3;const w=cw();return !!w&&(w.pap||0)>=3}
function tsMake(){if(TSN.geo)return;const G=HV.G(),parts=[],a=(g,sx,sy,sz,x,y,z,rx)=>parts.push({g,sx,sy,sz,x,y,z,rx:rx||0,ry:0,rz:0});
 a(G.sp,.12,.14,.13,0,1.78,.02);a(G.cu,.24,.58,.15,0,1.38,0);a(G.cu,.2,.3,.13,0,.98,0);a(G.cu,.095,.9,.095,-.11,.5,0);a(G.cu,.095,.9,.095,.11,.5,.04);a(G.cu,.06,.62,.06,-.3,1.4,.22,1.3);a(G.cu,.06,.62,.06,.3,1.4,.24,1.3);
 TSN.geo=HV.merge(parts);{const hp=[],h=(g,sx,sy,sz,x,y,z,rx)=>hp.push({g,sx,sy,sz,x,y,z,rx:rx||0,ry:0,rz:0});/* a four-legged silhouette that matches the hound model (it faces +z) */
  h(G.sp,.2,.22,.3,0,.58,.18);h(G.sp,.18,.2,.26,0,.55,-.2);h(G.cu,.15,.3,.14,0,.57,0,Math.PI/2);h(G.sp,.1,.09,.12,0,.74,.66);h(G.bx,.075,.06,.17,0,.7,.79);h(G.cu,.03,.34,.03,0,.64,-.44,-.9);for(const s of[-1,1]){h(G.cu,.05,.45,.05,s*.12,.23,.34);h(G.cu,.05,.45,.05,s*.12,.23,-.28)}TSN.hgeo=HV.merge(hp)}TSN.mat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uA:{value:1},uC:{value:new THREE.Vector3(1,.1,.07)}},
  vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 vN;uniform float uA;uniform vec3 uC;void main(){float r=pow(1.-abs(vN.z),2.2);gl_FragColor=vec4(uC,(.07+.8*r)*uA);}'});
 TSN.root=new THREE.Group();S.add(TSN.root);
 for(let i=0;i<6;i++){const e=document.createElement('div');e.className='tsa';e.innerHTML='<i></i>';document.body.appendChild(e);TSN.ar.push(e)}}
function tsTick(dt){const on=tsHeld();TSN.fade+=((on?1:0)-TSN.fade)*Math.min(1,dt*(on?4:8));
 if(TSN.fade<.02){if(TSN.root&&TSN.root.visible){TSN.root.visible=false;for(const e of TSN.ar)e.style.opacity=0;for(const[b,g]of TSN.gh)g.visible=false}return}
 tsMake();TSN.root.visible=true;TSN.t+=dt;TSN.chk-=dt;
 const cand=[];for(const b of bots){if(!b.zom||!b.al)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);if(d>26)continue;cand.push([d,b])}cand.sort((x,y)=>x[0]-y[0]);
 const near=cand.slice(0,10),fwdX=-Math.sin(yaw),fwdZ=-Math.cos(yaw),rtX=Math.cos(yaw),rtZ=-Math.sin(yaw),used=new Set(),arrows=[];
 const W_=innerWidth,H_=innerHeight,R=Math.min(W_,H_)*.36;
 for(const[d,b]of near){
  if(TSN.chk<=0||b.tsL==null){b.tsL=navLos(P.x,P.z,b.x,b.z)}
  const v=V(b.x,(b.y||0)+1,b.z).project(C),off=v.z>1||Math.abs(v.x)>1.02||Math.abs(v.y)>1.02;
  if(!b.tsL||(typeof CG!='undefined'&&CG.th>0)){let g=TSN.gh.get(b);if(!g){g=new THREE.Mesh(b.hound?TSN.hgeo:TSN.geo,TSN.mat);g.frustumCulled=false;g.renderOrder=40;TSN.root.add(g);TSN.gh.set(b,g)}
   g.visible=true;g.position.set(b.x,b.y||0,b.z);g.rotation.y=b.ry||0;const s=b.hound?1.65:b.big?1.28:1;g.scale.set(s,s*(1+.012*Math.sin(TSN.t*3+b.i)),s);used.add(b)}
  if(off&&arrows.length<6)arrows.push([d,b])}
 if(TSN.chk<=0)TSN.chk=.16;
 for(const[b,g]of TSN.gh)if(!used.has(b)||!b.al){g.visible=false;if(!b.al||!bots.includes(b)){TSN.root.remove(g);TSN.gh.delete(b)}}
 TSN.mat.uniforms.uA.value=TSN.fade*(.7+.3*Math.sin(TSN.t*3.2));{const th=typeof CG!='undefined'&&CG.th>0;TSN.mat.uniforms.uC.value.set(th?.1+.9*Math.abs(Math.sin(TSN.t*2)):1,th?1-.8*Math.abs(Math.sin(TSN.t*2)):.1,th?.9:.07)}
 for(let i=0;i<6;i++){const e=TSN.ar[i],a=arrows[i];if(!a){e.style.opacity=0;continue}const[d,b]=a,dx=b.x-P.x,dz=b.z-P.z,fx=dx*fwdX+dz*fwdZ,rx=dx*rtX+dz*rtZ,ang=Math.atan2(rx,fx),op=Math.max(.22,Math.min(.85,1.05-d/24))*TSN.fade*(.8+.2*Math.sin(TSN.t*(4+10/(1+d*.3))+i));
  e.style.opacity=op;e.style.transform=`translate(${W_/2+Math.sin(ang)*R}px,${H_/2-Math.cos(ang)*R*.82}px) rotate(${ang}rad) scale(${1.15-Math.min(.5,d/40)})`}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{tsTick(dt)}catch(e){console.warn('threat sense',e)}}}

/* ===================== DEATH SEQUENCES: five different ways to die in Zombies =====================
   When the last life goes, the run does not just cut: it plays one of five cinematics, chosen by what killed you (and never the same twice in a row):
   MAULED (a crowd drags you down: the camera is yanked to the floor, claw marks and blood hit the screen), CRUSHED (a Brute smashes you across the room: the camera flies, spins and bounces),
   DRAGGED UNDER (grabbed from behind and pulled across the floor), BLED OUT (your knees give, you fall, the heartbeat slows and flat-lines in grey) and ASCENDED (late in a long run: your spirit leaves your body and the camera rises and
   orbits the corpse among the dead). Each has its own sound design (soft sines and noise, nothing retro) and its own title, then the run ends. ===================== */
var ZX={on:0,u:0,dur:5,kind:'',last:'',cb:null,el:null,pp:{x:0,z:0},body:null,tm:0,hb:0,dir:[0,0],spawn:0,ev:[]};
function zdEl(){if(ZX.el)return ZX.el;const e=document.createElement('div');e.id='zdeath';e.innerHTML='<div class="zd-v"></div><div class="zd-fx"></div><div class="zd-b top"></div><div class="zd-b bot"></div><div class="zd-t"><small></small><b></b><i></i></div>';document.body.appendChild(e);return ZX.el=e}
var zdE=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3),zdC=(x,a,b)=>Math.max(a,Math.min(b,x)),zdL=(a,b,t)=>a+(b-a)*t;
function zdPick(){const lb=lastBot&&lastBot.zom?lastBot:null;let near=0;for(const b of bots)if(b.zom&&b.al&&Math.hypot(b.x-P.x,b.z-P.z)<4.5)near++;let k;
 if(lb&&lb.big)k='crush';else if(lb){const dx=lb.x-P.x,dz=lb.z-P.z,dot=(dx*-Math.sin(yaw)+dz*-Math.cos(yaw))/(Math.hypot(dx,dz)||1);k=dot<-.3&&near<5?'drag':near>=4?'maul':null}
 if(!k)k=zq&&zq.r>=12&&Math.random()<.55?'spirit':Math.random()<.5?'collapse':'maul';
 if(k==ZX.last){const o=['maul','crush','drag','collapse','spirit'].filter(x=>x!=k&&(x!='spirit'||(zq&&zq.r>=8)));k=o[Math.random()*o.length|0]}return k}
var ZDI={maul:['MAULED','The horde tears you down',4.9],crush:['CRUSHED','Thrown like a rag doll',4.7],drag:['DRAGGED UNDER','Pulled into the dark',5.2],collapse:['BLED OUT','Your legs give out',5.6],spirit:['ASCENDED','The Estate keeps your body',7]};
/* sound: all of it is sine, triangle and filtered noise */
function zdTone(f0,f1,d,g,dl,ty){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),o=ac.createOscillator(),gg=ac.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.08,d*.2));gg.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gg);gg.connect(ac.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
function zdNoise(d,f0,f1,g,type,q,dl){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=ac.createBufferSource(),f=ac.createBiquadFilter(),gg=ac.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.05,d*.2));gg.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(gg);gg.connect(ac.destination);s.start(t)}catch(e){}}
function zdHeart(g){zdTone(70,48,.16,g,0);zdTone(62,44,.18,g*.8,.17)}
function zdStart(kind){ZX.on=1;ZX.u=0;ZX.kind=kind;ZX.dur=ZDI[kind][2];ZX.last=kind;ZX.tm=0;ZX.hb=0;ZX.ev=[];ZX.spawn=0;ZX.pp.x=P.x;ZX.pp.z=P.z;ZX.pp.y=P.y||0;ZX.yaw0=yaw;ZX.pitch0=pitch;ZX.eye0=Math.max(1.1,ST.eye||1.65);
 const lb=lastBot&&lastBot.zom?lastBot:null;let dx=lb?P.x-lb.x:Math.sin(yaw),dz=lb?P.z-lb.z:Math.cos(yaw);const n=Math.hypot(dx,dz)||1;ZX.dir=[dx/n,dz/n];
 const e=zdEl();e.className='on k-'+kind;e.querySelector('.zd-fx').innerHTML='';e.querySelector('small').textContent='ROUND '+(zq?zq.r:'');e.querySelector('b').textContent=ZDI[kind][0];e.querySelector('i').textContent=ZDI[kind][1];e.style.setProperty('--a','0');e.style.setProperty('--g','0');e.style.setProperty('--bl','0');
 document.body.classList.add('zdying');gun.visible=false;try{LX.fx.pulse=1;LX.fx.ca=1}catch(x){}shake=Math.max(shake,.9);
 if(kind=='maul'){zdNoise(.5,2400,500,.3,'bandpass',1.2);zdTone(120,60,.5,.25);for(let i=0;i<4;i++)zdNoise(.3,900+i*200,300,.12,'lowpass',.8,.15+i*.28);for(let i=0;i<3;i++)zdTone(110+i*35,70+i*20,.55,.06,.1+i*.3)}
 else if(kind=='crush'){zdTone(90,30,.7,.4);zdNoise(.35,1800,200,.35,'lowpass',.7);zdTone(3600,3500,2.8,.02,.1)}
 else if(kind=='drag'){zdNoise(.4,1400,300,.25,'lowpass',.8);zdTone(100,60,.5,.2)}
 else if(kind=='collapse'){zdNoise(.2,900,200,.2,'lowpass');zdHeart(.3)}
 else{zdNoise(.25,1200,200,.22,'lowpass');zdHeart(.28)}}
/* the camera and screen for each kind, called once a frame while ZX.on */
function zdCam(dt){const z=ZX;z.u+=dt;const u=z.u,k=z.kind,e=zdEl(),fw=[-Math.sin(z.yaw0),-Math.cos(z.yaw0)];let y=z.eye0,pit=z.pitch0,roll=0,yw=z.yaw0,px=z.pp.x,pz=z.pp.z,vig=0,gr=0,bl=0,sh=0;
 const evt=(t,f)=>{if(u>=t&&!z.ev.includes(t)){z.ev.push(t);f()}},claw=()=>{const fx=e.querySelector('.zd-fx');for(let i=0;i<3;i++){const c=document.createElement('i');c.className='cl';c.style.cssText=`left:${10+Math.random()*70}%;top:${5+Math.random()*60}%;transform:rotate(${-25+Math.random()*50}deg);--d:${i*50}ms`;fx.appendChild(c)}},
  blot=()=>{const fx=e.querySelector('.zd-fx');const c=document.createElement('i');c.className='bt';const s=90+Math.random()*220;c.style.cssText=`left:${Math.random()*95}%;top:${Math.random()*90}%;width:${s}px;height:${s}px`;fx.appendChild(c)};
 if(k=='maul'){const a=zdE(u/.9);y=zdL(z.eye0,.3,a)+Math.max(0,Math.sin(u*9))*.03*(1-a);pit=zdL(z.pitch0,.95,a)+Math.sin(u*17)*.04*(1-zdC(u/2.5,0,1));roll=zdL(0,1.12,a)+Math.sin(u*13)*.05*(1-a);px-=fw[0]*.9*a;pz-=fw[1]*.9*a;vig=zdC(u/3.6,.25,1);sh=.35*(1-zdC(u/3,0,1));
  for(const t of[.12,.4,.75,1.2,1.7,2.3])evt(t,()=>{claw();blot();zdNoise(.18,1800,500,.14,'bandpass',1.4);zdTone(150,70,.25,.1);shake=Math.max(shake,.4);try{LX.fx.pulse=.7}catch(x){}});
  evt(.05,()=>{for(const b of bots)if(b.zom&&b.al&&Math.hypot(b.x-P.x,b.z-P.z)<6)b.lunge=.4});evt(1.5,()=>{for(const b of bots)if(b.zom&&b.al&&Math.hypot(b.x-P.x,b.z-P.z)<6)b.lunge=.4});bl=zdC(u/1.6,0,1)}
 else if(k=='crush'){const T=.62,a=zdC(u/T,0,1);const sp=7.6*(1-Math.exp(-u*2.3));const ddx=z.dir[0]*sp*dt*3.2*Math.exp(-u*1.5),ddz=z.dir[1]*sp*dt*3.2*Math.exp(-u*1.5);mv(z.pp,ddx,ddz,.35);px=z.pp.x;pz=z.pp.z;
  y=u<T?z.eye0+1.1*Math.sin(Math.PI*a)-.3*a:.3+Math.abs(Math.cos((u-T)*7))*.5*Math.exp(-(u-T)*3.4);pit=u<T?zdL(z.pitch0,-1.2,a):zdL(-1.2,.35,zdE((u-T)/1.3));roll=zdL(0,1.9,zdE(u/.9));
  evt(T,()=>{shake=1.1;zdNoise(.4,1400,150,.35,'lowpass');zdTone(70,28,.6,.35);burst(V(P.x,.2,P.z),26,0xb8a890,5,.7,.14);try{LX.fx.flash=.4}catch(x){}});evt(.05,()=>{for(let i=0;i<3;i++)blot()});vig=zdC((u-.3)/3,0,1)*.9;gr=zdC((u-1)/3,0,.5);yw=z.yaw0+Math.sin(u*3)*.1*Math.exp(-u)}
 else if(k=='drag'){const sp=.5+u*1.15,dd=dt*sp*1.4;mv(z.pp,-fw[0]*dd,-fw[1]*dd,.35);px=z.pp.x;pz=z.pp.z;y=zdL(z.eye0,.34,zdE(u/.5))+.035*Math.sin(u*9);pit=zdL(z.pitch0,.62,zdE(u/.7))+.08*Math.sin(u*2.1);roll=.2+.22*Math.sin(u*3.4);yw=z.yaw0+Math.sin(u*1.7)*.28;vig=zdC(u/4,.15,1);sh=.18;
  if(Math.random()<dt*14)burst(V(px+(Math.random()-.5)*.5,.12,pz+(Math.random()-.5)*.5),1,0xb8a890,1.8,.5,.09);zdE(0);evt(.1,()=>{zdNoise(1.6,900,300,.16,'lowpass',.8);zdTone(100,60,.5,.2)});evt(.9,()=>{claw();zdNoise(.2,1800,600,.12)});evt(2.1,blot);bl=zdC((u-1)/2,0,1)}
 else if(k=='collapse'){const a=zdE(u/1.3),f=zdE((u-1.3)/.55);y=u<1.3?zdL(z.eye0,.86,a):zdL(.86,.25,f)+(u>1.9?Math.exp(-(u-1.9)*6)*Math.abs(Math.sin((u-1.9)*10))*.07:0)+Math.sin(u*1.4)*.005;pit=u<1.3?zdL(z.pitch0,z.pitch0+.3,a)+Math.sin(u*3)*.03:zdL(z.pitch0+.3,-.78,f);roll=u<1.3?zdL(0,.14,a)+Math.sin(u*5)*.015*(1-a):zdL(.14,.4,f);
  const f0=zdC(u/1.9,0,1);const fw2=.55*f;px-=fw[0]*-fw2*.5;pz-=fw[1]*-fw2*.5;vig=zdC(u/3.6,.1,1);gr=zdC(u/3,0,1);bl=zdC((u-1.5)/2.2,0,.7);
  evt(1.9,()=>{shake=.8;zdNoise(.3,700,120,.3,'lowpass');zdTone(60,30,.5,.3)});
  z.hb-=dt;if(u<3.9&&z.hb<=0){zdHeart(.2*(1-u/5));z.hb=zdL(.7,1.7,u/3.9)}evt(3.9,()=>{zdTone(520,520,1.5,.05)})}
 else{ /* spirit */
  const T=1.7,a=zdE(u/T);if(u<T){y=zdL(z.eye0,.26,zdE(u/1.3));pit=zdL(z.pitch0,-.7,zdE((u-.5)/1.2));roll=zdL(0,.35,a);gr=0;vig=.5;z.hb-=dt;if(z.hb<=0){zdHeart(.24);z.hb=.9}
   evt(.9,()=>{shake=.7;zdTone(60,30,.5,.3)})}
  else{if(!z.body){const g=new THREE.Group();g.position.set(P.x,0,P.z);try{mkHuman(g,{operator:passOperator()})}catch(x){}const m=new THREE.Group();m.add(g);g.rotation.x=-Math.PI/2;g.position.y=.22;m.position.set(P.x,0,P.z);m.rotation.y=z.yaw0;S.add(m);z.body=m;burst(V(P.x,.4,P.z),40,0xbfe8ff,2.5,1.6,.1);zdTone(330,330,3,.03,0);zdTone(495,495,3,.025,.2);zdTone(660,660,3,.02,.4);zdTone(220,220,4,.03,0);zdNoise(2.8,600,2400,.05,'bandpass',.5)}
   const w=zdC((u-T)/(z.dur-T),0,1),R=zdL(.9,5.6,zdE(w)),H=zdL(.5,6.4,zdE(w)),an=z.yaw0+Math.PI+(u-T)*.55;px=P.x+Math.sin(an)*R;pz=P.z+Math.cos(an)*R;y=H;
   const dx=P.x-px,dz=P.z-pz,dh=Math.hypot(dx,dz);yw=Math.atan2(-dx,-dz);pit=-Math.atan2(H-.3,dh);roll=0;vig=zdC(.35+w*.55,0,1);gr=.25+w*.3;
   z.spawn-=dt;if(z.spawn<=0){z.spawn=.07;burst(V(P.x+(Math.random()-.5)*.5,.4,P.z+(Math.random()-.5)*.5),1,Math.random()<.5?0xbfe8ff:0xffffff,1.4+Math.random(),1.6,.09)}
   z.orb=1}}
 if(z.body&&k!='spirit'){}
 C.position.set(px,y+Math.sin(u*24)*sh*.02,pz);C.rotation.set(pit+(Math.random()-.5)*sh*.03,yw+(Math.random()-.5)*sh*.02,roll);
 if(k=='spirit'&&u>=1.7){C.lookAt(P.x,.3,P.z)}
 const fade=u>z.dur-.7?zdC((u-(z.dur-.7))/.7,0,1):0,ta=zdC((u-.9)/.8,0,1)*(1-fade);
 e.style.setProperty('--a',vig.toFixed(3));e.style.setProperty('--g',gr.toFixed(3));e.style.setProperty('--bl',(bl*3).toFixed(2));e.style.setProperty('--f',fade.toFixed(3));e.style.setProperty('--t',ta.toFixed(3));
 if(u>=z.dur){const cb=z.cb;z.on=0;z.cb=null;if(cb)cb()}}
function zdReset(){ZX.on=0;ZX.cb=null;if(ZX.body){S.remove(ZX.body);ZX.body=null}if(ZX.el)ZX.el.className='';document.body.classList.remove('zdying')}
/* hook in: the downed camera hands over to the sequence, and the end of the run waits for it */
{const _dc=zDownCam;zDownCam=function(dt){if(ZX.on)return zdCam(dt);return _dc.apply(this,arguments)}}
{const _eg=endGame;endGame=function(t){if(mode=='Zombies'&&run&&!over&&!ZX.on&&!ZX.skip&&P.dead){ZX.cb=()=>{ZX.skip=1;try{_eg(t)}finally{ZX.skip=0;zdReset()}};zdStart(zdPick());return}return _eg(t)}}
{const _zs=zStart;zStart=function(){zdReset();return _zs.apply(this,arguments)}}

/* ===================== CINDER HOUND ROUNDS =====================
   Every 6 to 8 rounds the Estate turns: fog thickens, the sky goes dark and red, lightning cracks and a deep voice calls the pack. Then hounds burn into the world where lightning strikes the ground near you:
   fast, low, fragile, they cut off your path and leap. No normal zombies spawn in a hound round, it ends the moment the last hound dies, and that last one drops Max Ammo for everybody.
   (Single player and the host only: they are not replicated to guests yet, so co-op games skip the hound rounds.) ===================== */
var HH={mats:null,geo:null,env:0,envT:0,sky:null,fog:null,sub:null,bolts:[],voice:0,lastBark:0};
function hhMats(){if(HH.mats)return HH.mats;const L=c=>new THREE.MeshLambertMaterial({color:c}),B=(c,k)=>{const m=new THREE.MeshBasicMaterial({color:c});if(k)m.color.multiplyScalar(k);return m};return HH.mats={fur:L(0x1b1818),fur2:L(0x2c2423),dk:L(0x0c0b0b),ember:B(0xff6a1a,2.2),teeth:L(0xe8e2d0),tongue:L(0x8a1c22),nose:L(0x070707),eye:B(0xffb020,2.6)}}
function hhPart(parent,key,build){return HV.put(parent,'hh_'+key,build,hhMats())}
function hhModel(){const G=HV.G(),T=THREE,cone=HH.cone||(HH.cone=new T.ConeGeometry(1,1,6)),g=new T.Group(),body=new T.Group(),head=new T.Group(),jaw=new T.Group(),tail=new T.Group();g.add(body);
 hhPart(body,'body',(a,rod)=>{const{sp,bx,cu}=G;a('fur',sp,.2,.22,.3,0,.58,.18);a('fur',sp,.18,.2,.26,0,.55,-.2);a('fur',cu,.15,.3,.14,0,.57,0,Math.PI/2);for(let i=0;i<7;i++){a('fur2',cone,.045,.1,.05,0,.77-Math.abs(i-3)*.006,.34-i*.1);a('ember',cone,.02,.05,.02,0,.84-Math.abs(i-3)*.006,.34-i*.1)}
  rod('fur',0,.62,.36,0,.74,.58,.085);for(const s of[-1,1]){a('ember',bx,.012,.14,.2,s*.12,.58,.18,0,0,s*.1);a('ember',bx,.012,.1,.16,s*.1,.55,-.18,0,0,s*.1);a('fur2',sp,.075,.1,.1,s*.15,.5,.34)}});
 head.position.set(0,.74,.66);body.add(head);hhPart(head,'head',(a)=>{const{sp,ss,bx}=G;a('fur',sp,.1,.09,.12,0,0,0);a('fur',bx,.075,.06,.17,0,-.04,.13);a('nose',ss,.03,.022,.03,0,-.015,.225);a('fur2',bx,.1,.025,.06,0,.06,.06,-.2);
  for(const s of[-1,1]){a('eye',ss,.022,.018,.014,s*.05,.04,.1);a('fur',cone,.035,.12,.03,s*.06,.14,-.02,.2,0,s*.25);a('ember',ss,.012,.012,.012,s*.045,-.02,.215);a('dk',bx,.012,.03,.1,s*.04,-.07,.15)}
  for(let i=0;i<5;i++)for(const s of[-1,1])a('teeth',cone,.008,.03,.008,s*(.018+i*.0045)*(i?1:0),-.075,.1+i*.025,Math.PI)});
 jaw.position.set(0,-.045,.04);head.add(jaw);hhPart(jaw,'jaw',(a)=>{const{bx}=G;a('fur',bx,.06,.03,.15,0,-.02,.1);a('tongue',bx,.04,.012,.1,0,-.002,.1);for(let i=0;i<5;i++)for(const s of[-1,1])a('teeth',cone,.008,.03,.008,s*(.016+i*.004)*(i?1:0),.016,.06+i*.025)});
 tail.position.set(0,.62,-.42);body.add(tail);hhPart(tail,'tail',(a,rod)=>{rod('fur',0,0,0,0,.14,-.2,.035);rod('fur2',0,.14,-.2,0,.3,-.26,.025);a('ember',G.ss,.03,.05,.03,0,.32,-.27)});
 const legs=[];for(const[x,z,fr]of[[-.14,.3,1],[.14,.3,1],[-.14,-.3,0],[.14,-.3,0]]){const up=new T.Group(),lo=new T.Group();up.position.set(x,.5,z);body.add(up);lo.position.set(0,-.26,0);up.add(lo);
  hhPart(up,'leg'+(fr?'f':'r'),(a)=>{const{cu}=G;a('fur',cu,.06,.28,.06,0,-.13,0,fr?-.1:.25);a('fur2',cu,.075,.14,.075,0,-.03,0)});hhPart(lo,'paw'+(fr?'f':'r'),(a)=>{const{cu,bx}=G;a('fur',cu,.04,.26,.04,0,-.13,fr?.02:-.04,fr?.15:-.2);a('fur2',bx,.07,.04,.12,0,-.255,.04);for(let i=-1;i<=1;i++)a('teeth',cone,.008,.03,.008,i*.022,-.26,.11,Math.PI/2)});legs.push({up,lo,fr});}
 const flames=[];for(const[x,y,z,s]of[[0,.9,.3,.7],[0,.88,-.05,.8],[0,.85,-.3,.6],[0,.4,.72,.5]]){const sp_=new T.Sprite(new T.SpriteMaterial({map:(JX.h&&JX.h.flareTex)||null,color:0xff7a22,transparent:true,opacity:.85,depthWrite:false,blending:T.AdditiveBlending,fog:false}));sp_.position.set(x,y,z);sp_.scale.set(s,s,1);body.add(sp_);flames.push(sp_)}
 g.userData.hh={body,head,jaw,tail,legs,flames};g.scale.setScalar(1.65);g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
/* ---- the hit volumes of a hound: a low head and a long body ---- */
{const _hp=hitPts;hitPts=function(b){if(!b.hound)return _hp(b);const ry=b.ry==null?0:b.ry,fx=Math.sin(ry),fz=Math.cos(ry),y=b.y||0;return[V(b.x+fx*.7,y+.78,b.z+fz*.7),V(b.x,y+.58,b.z),.26,.46]}}
/* ---- spawning a hound out of a lightning strike ---- */
function hhStrike(x,z){const top=V(x+(Math.random()-.5)*8,60,z+(Math.random()-.5)*8),pts=[];let px=top.x,pz=top.z;for(let i=0;i<14;i++){const ny=60-60*(i+1)/14,nx=i==13?x:px+(Math.random()-.5)*5,nz=i==13?z:pz+(Math.random()-.5)*5;pts.push(px,60-60*i/14,pz,nx,ny,nz);px=nx;pz=nz}
 const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));const l=new THREE.LineSegments(gm,new THREE.LineBasicMaterial({color:0xffe0c0,transparent:true,opacity:1,fog:false,depthWrite:false}));l.frustumCulled=false;S.add(l);HH.bolts.push({l,t:.28});
 burst(V(x,.3,z),40,0xff7a22,9,.9,.18);burst(V(x,.2,z),24,0xffe0a0,12,.5,.1);burst(V(x,.1,z),16,0x2a2018,5,1.2,.25);try{JX.flash(V(x,1.2,z),0xffa050,6,.5,40);LX.fx.pulse=Math.max(LX.fx.pulse,.6);EST.lt.flash=Math.max(EST.lt.flash,.7)}catch(e){}
 const d=Math.hypot(x-P.x,z-P.z);flNoise(.5,2400,200,Math.min(.2,.12+.3/(1+d*.1)),'lowpass',.7);flTone(60,34,.6,.18,0,'sine');flNoise(.2,5000,2500,.08,'highpass',.7)}
function hhSpawn(x,z){const z_=zq,r=z_.r,hp=Math.round(zHp(r)*.38)+50;
 /* made through mkZombie so the game's own bot registry knows it, then given the body and brain of a hound */
 const b=mkZombie(x,z,0);if(b.m&&b.m.parent)b.m.parent.remove(b.m);const m=hhModel();m.position.set(x,0,z);(typeof zG!='undefined'&&zG?zG:S).add(m);
 Object.assign(b,{m,rig:null,x,z,y:0,hp,mhp:hp,sh:0,msh:0,hound:1,nm:'Cinder Hound',big:0,run:1,sp:Math.min(7.6,5.6+r*.05),dm:Math.round(24+r*1.2),ac:1,vp:.6,rise:0,riseD:0,riseY:0,ry:0,tyaw:0,
  hs:{ph:0,st:'rush',t:0,cd:1.4+Math.random()*.6,leap:0,vy:0,bite:0,stuck:0,lx:x,lz:z,spawnT:.45,side:Math.random()<.5?-1:1}});
 hhStrike(x,z);const pl=zPlayers()[0];if(pl)zvSay('howl',{x,z,vp:.6,big:1},Math.hypot(x-pl.x,z-pl.z));return b}
/* ---- hound AI: it runs at where you are GOING, not where you are; at close range it leaps; it bites when it lands or when you are adjacent ---- */
function hhAI(b,dt){if(b.stun>0){b.stun-=dt;b.m.position.set(b.x,b.y,b.z);return}const h=b.hs,pls=zPlayers().filter(p=>!(p.me&&P.dead)),M=MAPS[sel.map];let pl=null,bd=1e9;for(const p of pls){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<bd){bd=d;pl=p}}
 if(h.spawnT>0){h.spawnT-=dt;b.m.position.set(b.x,0,b.z);b.m.scale.setScalar(1.65*(.4+.6*(1-h.spawnT/.45)));return}b.m.scale.setScalar(1.65);if(!pl)return;
 if(M.entry&&M.entry(b,dt)){b.ry=b.tyaw;b.m.rotation.y=b.ry;h.ph+=dt*b.sp*1.5;return}
 h.t+=dt;h.cd-=dt;h.bite-=dt;const vx=pl.me?(P.mx||0):0,vz=pl.me?(P.mz||0):0,lead=Math.min(.7,bd/14),tx=pl.x+vx*lead,tz=pl.z+vz*lead,dx=tx-b.x,dz=tz-b.z,D=Math.hypot(dx,dz)||1,ry=Math.atan2(dx,dz);
 let face=ry;const ox=b.x,oz=b.z;
 /* the zombies' own pathfinding (the flow field to the player), only bigger and slower; no leaps: it closes in and bites */
 if(D>2.1){navMove(b,dt,pl.x,pl.z,b.sp*(D>16?1.06:1),zfls[pl.id]);if(b.mva!=null&&D>3.5)face=b.mva}
 else if(h.bite<=0&&Math.abs((pl.y||0))<1.7){h.bite=.9;if(pl.me&&!(zq.dash&&zq.dash.t>0)){hurt(Math.round(b.dm*.8),b);kick+=.04;shake=Math.max(shake,.4);LX.fx.dmg=Math.max(LX.fx.dmg,.35);burst(V(P.x,1.2,P.z),8,0x8a1010,3,.3,.07)}b.hs.jawT=.25;flNoise(.12,1200,400,.09,'lowpass')}
 b.y=0;b.ry=b.ry+angD(face,b.ry)*Math.min(1,dt*10);b.tyaw=b.ry;b.m.rotation.y=b.ry;b.m.position.set(b.x,0,b.z);h.ph+=Math.hypot(b.x-ox,b.z-oz)*1.5;
 if(Math.random()<dt*.5&&t0-HH.lastBark>.5){HH.lastBark=t0;hhBark(bd)}}
function hhBark(d){flNoise(.1,700,1100,.1/(1+d*.08),'bandpass',1.6);flTone(300,160,.12,.08/(1+d*.07),0,'sine');flNoise(.1,800,500,.07/(1+d*.08),'bandpass',1.6,.18);flTone(280,150,.12,.07/(1+d*.07),.18,'sine')}
/* ---- the body animation: a gallop, a leap pose, a bite ---- */
function hhAnim(b,dt){const u=b.m.userData.hh;if(!u)return;const h=b.hs,s=h.st=='leap'?1:0,ph=h.ph,sw=Math.sin(ph),sp=Math.min(1,Math.hypot((b.x-(b.px==null?b.x:b.px)),(b.z-(b.pz==null?b.z:b.pz)))/Math.max(dt,.001)/9);b.px=b.x;b.pz=b.z;
 u.legs.forEach((l,i)=>{const o=i<2?0:Math.PI*.85,side=i%2?.35:0,a=Math.sin(ph+o+side)*sp;l.up.rotation.x=s?(l.fr?-.9:.9):a*.95;l.lo.rotation.x=s?(l.fr?.7:-.2):Math.max(0,-Math.sin(ph+o+side+.7))*1.25*sp});
 u.body.position.y=s?0:Math.abs(Math.sin(ph))*.07*sp;u.body.rotation.x=s?-.35:Math.sin(ph*2)*.05*sp;u.head.rotation.x=s?.25:Math.sin(ph*2+.6)*.08*sp;h.jawT=(h.jawT||0)-dt;u.jaw.rotation.x=s?.5:h.jawT>0?.7:.18+.15*Math.sin(ph*2)*sp;
 u.tail.rotation.z=Math.sin(t0*14+b.i)*.35;u.tail.rotation.x=-.3+sp*.25;u.flames.forEach((f,i)=>{const k=.85+.3*Math.sin(t0*17+i*1.9+b.i);f.scale.setScalar((i==3?.5:.7)*k);f.material.opacity=.55+.3*k})}
/* ---- death: the hound collapses in a burst of embers ---- */
{const _rs=ragStart;ragStart=function(b){if(b&&b.hound){b.hs.dead=0;burst(V(b.x,.6,b.z),30,0xff7a22,6,.9,.15);burst(V(b.x,.4,b.z),12,0x2a2018,3,1.1,.2);flNoise(.3,1500,200,.12,'lowpass');flTone(110,45,.45,.12,0,'sine');zvSay('rattle',{x:b.x,z:b.z,vp:.6,big:1},Math.hypot(b.x-P.x,b.z-P.z));b.dying=1;b.dyT=0;return}return _rs.apply(this,arguments)}}
function hhDead(b,dt){b.dyT+=dt;const k=Math.min(1,b.dyT/.45),u=b.m.userData.hh;b.m.rotation.z=k*1.45*(b.i%2?1:-1);b.m.position.y=Math.sin(Math.min(1,b.dyT/.2)*Math.PI)*.2;if(u){u.legs.forEach((l,i)=>{l.up.rotation.x=(i%2?.5:-.5)*k;l.lo.rotation.x=.6*k});u.flames.forEach(f=>f.material.opacity=Math.max(0,.8-b.dyT*.8));u.jaw.rotation.x=.6}if(Math.random()<dt*20)burst(V(b.x,.4,b.z),1,0xff7a22,2,.5,.1)}
/* ---- the round: schedule, build-up, spawning, finish ---- */
function hhStartRound(){const z=zq;const n=Math.min(26,6+Math.floor(z.r*.85)+(zq.cap>2?0:0));z.hound={n,spawned:0,t:0,intro:6.5,done:0,voice:0,left:n,nextT:0,wait:0};z.toSpawn=9999;z.brutes=0;z.nextHound=z.r+6+(Math.random()*3|0);
 HH.envT=1;
 for(const t of[.4,1.9,3.3,4.7]){setTimeout(()=>{if(!zq||!zq.hound||zq.hound.done)return;const a=Math.random()*6.283,d=18+Math.random()*14;hhStrike(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d)},t*1000)}
 for(const t of[1,2.4,3.9,5.2]){setTimeout(()=>{if(zq&&zq.hound&&!zq.hound.done)hhBark(30)},t*1000+300)}}
/* a hound spawn: one of the map's own open spawn points, 12 to 46 metres from the player it is sent after, never outside the arena and never on a blocked cell */
function hhSpot(p){const M=MAPS[sel.map];if(M.entry)return [0,-6];const open=(M.zs||[]).filter(s=>zq.open[s[2]]),pls=zPlayers(),inM=(x,z)=>Math.abs(x)<M.H-2.5&&Math.abs(z)<M.H-2.5;let best=null,bs=-1e9;
 for(let k=0;k<(open.length?open.length:0);k++){const s=open[k],d=Math.hypot(s[0]-p.x,s[1]-p.z);if(d<12||d>46||!inM(s[0],s[1]))continue;let near=1e9;for(const q of pls)near=Math.min(near,Math.hypot(s[0]-q.x,s[1]-q.z));const sc=Math.min(near,30)+Math.random()*14-d*.1;if(sc>bs){bs=sc;best=s}}
 if(!best){for(const s of open)if(inM(s[0],s[1])){best=s;break}}if(!best)return null;
 for(let t=0;t<8;t++){const[x,z]=zFreeSpot(best[0]+(Math.random()-.5)*3,best[1]+(Math.random()-.5)*3);if(inM(x,z)&&NAV.g){const i=Math.floor(x+H),j=Math.floor(z+H);if(i>0&&j>0&&i<NAV.n-1&&j<NAV.n-1&&!NAV.g[j*NAV.n+i])return[x,z]}else if(inM(x,z)&&!NAV.g)return[x,z]}
 return[best[0],best[1]]}
function hhSub(txt,delay,dur){if(!HH.sub){const e=document.createElement('div');e.id='hsub';document.body.appendChild(e);HH.sub=e}setTimeout(()=>{HH.sub.textContent=txt;HH.sub.className='on';setTimeout(()=>{HH.sub.className=''},dur*1000)},delay*1000)}
function hhEnv(dt){const z=zq,on=z&&z.hound&&!z.hound.done&&mode=='Zombies';HH.envT=on?1:0;HH.env+=(HH.envT-HH.env)*Math.min(1,dt*(on?.8:.6));const e=HH.env;if(e<.01&&!HH.active)return;HH.active=e>.01;
 try{if(typeof skyM!='undefined'&&skyM&&skyM.material){skyM.material.color.setRGB(1-.45*e,1-.78*e,1-.8*e)}
  if(typeof hemi!='undefined'&&e>.01){hemi.intensity*=(1-.55*e);sun.intensity*=(1-.7*e)}
  const f=S.fog;if(f){if(!HH.fog)HH.fog={far:f.far,near:f.near,c:f.color.getHex()};f.far=HH.fog.far*(1-.6*e);f.near=HH.fog.near*(1-.5*e);f.color.setHex(HH.fog.c).lerp(new THREE.Color(0x3a0c0c),e*.85);if(e<.01){f.far=HH.fog.far;f.near=HH.fog.near;f.color.setHex(HH.fog.c);HH.fog=null}}
  LX.fx.dmg=Math.max(LX.fx.dmg,.1*e)}catch(x){}}
function hhTick(dt){for(let i=HH.bolts.length-1;i>=0;i--){const b=HH.bolts[i];b.t-=dt;b.l.material.opacity=Math.max(0,b.t*4)*(Math.random()<.3?.4:1);if(b.t<=0){S.remove(b.l);b.l.geometry.dispose();b.l.material.dispose();HH.bolts.splice(i,1)}}
 hhEnv(dt);if(!run||paused||mode!='Zombies'||!zq)return;const z=zq,H_=z.hound;
 for(const b of bots){if(!b.hound)continue;if(b.al){hhAI(b,dt);hhAnim(b,dt)}else if(b.dying)hhDead(b,dt)}
 if(!H_||H_.done||zCli())return;
 /* the round manager */
 z.toSpawn=9999;H_.t+=dt;const alive=bots.filter(b=>b.hound&&b.al).length;H_.left=alive+(H_.n-H_.spawned);
 if(H_.t>H_.intro&&H_.spawned<H_.n){H_.nextT-=dt;if(H_.nextT<=0&&alive<10){const pls=zPlayers(),p=pls[Math.random()*pls.length|0];if(p){const sp=hhSpot(p);if(sp){hhSpawn(sp[0],sp[1]);H_.spawned++}}H_.nextT=Math.max(.7,1.8-z.r*.03)+Math.random()*.7}}
 if(H_.spawned>=H_.n&&alive==0){H_.done=1;z.toSpawn=0}
 }
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{hhTick(dt)}catch(e){console.warn('hounds',e)}}}
/* hooks: the schedule, no normal spawns, no hound movement by the human zombie AI, and the last hound drops Max Ammo */
{const _zs=zStart;zStart=function(){const r=_zs.apply(this,arguments);try{zq.nextHound=6+(Math.random()*3|0);zq.hound=null;HH.env=0;HH.fog=null;for(const b of bots)if(b.hound){try{S.remove(b.m)}catch(e){}}}catch(e){}return r}}
{const _nr=zNewRound;zNewRound=function(){const r=_nr.apply(this,arguments);try{if(!netOn&&!MAPS[sel.map].noHounds&&zq.r>=zq.nextHound)hhStartRound();else zq.hound=null}catch(e){console.warn('hound round',e)}return r}}
{const _sp=zSpawn;zSpawn=function(){if(zq&&zq.hound&&!zq.hound.done)return;return _sp.apply(this,arguments)}}
{const _mv=zMove;zMove=function(dt){const hs=bots.filter(b=>b.hound&&b.al);for(const b of hs)b.zom=0;try{return _mv.apply(this,arguments)}finally{for(const b of hs)b.zom=1}}}
{const _pt=zPuTry;zPuTry=function(b){if(b&&b.hound){const z=zq,H_=z.hound;if(H_&&H_.spawned>=H_.n&&bots.filter(x=>x.hound&&x.al&&x!==b).length==0&&!H_.dropped){H_.dropped=1;let x=b.x,zz=b.z;if(!zPuOk(x,zz)){x=P.x;zz=P.z}const id=z.puId++;zPuSpawn(id,'ammo',x,zz);burst(V(x,.8,zz),30,0x40ff70,7,.9,.14)}return}return _pt.apply(this,arguments)}}

/* a +100 style gain that rises from the points counter: no banner, just the number */
function zGainFx(n){try{const e=$('#zpt');if(!e)return;const r=e.getBoundingClientRect(),d=document.createElement('div');d.className='zgain';d.textContent='+'+n;d.style.left=Math.round(r.left+r.width/2)+'px';d.style.top=Math.round(r.top)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1100)}catch(x){}}
