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
 keyring:{n:'Keyring Cola',c:0x41e5fc,cost:2500,t:'Destroyed keys spawn blue allies that hunt yellow keys'},
 bolt:{n:'Bolt Brew',c:0x56c8bf,cost:2500,t:'Rebuilt boards last 50% longer. Rebuild all six to arm a two-second stun'}
};
/* perk hooks used by the weapon code (all neutral outside Zombies) */
var zrl=()=>zq&&mode=='Zombies'&&zq.perks.spd?0.5:1,zfr=()=>zq&&mode=='Zombies'&&zq.perks.dbl?0.75:1,zsm=()=>zq&&mode=='Zombies'&&zq.perks.stam?1.2:1,
 /* per-weapon Zombies damage boost on top of the round scaling: most guns were too weak against the horde, so each gets a modest lift (never more than about a third, shotguns and the Trebuchet-class weapons a bit more) */
 ZB={AR:1.25,SMG:1.35,MP:1.35,MG:1.25,BR:1.3,SG:2,VMP:1.3,DS:1.35,CY:1.2,CT:1.2,MVR:1.2,TRB:2.5,TUR:1.15,TEA:6.9,VA:1.28,BP:2.35,KTS:1.9,RD:1.24,HC:1.5,OH:1.8,SW:1.28,LT:1.34,PD:1.55},zmul=w=>mode=='Zombies'&&zq?ZW*(w.pm||1)*(ZB[w.k]||1)*(zq.perks.dbl&&!w.ex&&w.k!='RG'?2:1):1;
var zHp=r=>{const bs=n=>100+30*(n-1)+5*n*(n-1);return Math.round(r<=10?bs(r):bs(10)*Math.pow(1.07,r-10))},zDm=r=>Math.min(55,18+r*1.3),zAc=r=>Math.max(.7,1.1-r*.015),zTot=r=>Math.min(56,Math.round(5+r*2.4)),ZW=2.2,ZE=3,RGB=3000,FACE={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};
var zMe=()=>netOn?myId:'solo',zCli=()=>netOn&&!isHost;

/* ---------- the arsenal: everything in the weapon table except the streak-only guns and the starter pistol can come out of the box, so a weapon added to the game later shows up here by itself ---------- */
var ZSKIP=['MNG','GL','FT','CT','ULT'],zPoolKeys=()=>Object.keys(W).filter(k=>!ZSKIP.includes(k)&&k!='RG'&&k!='KEY'&&(k!='TEA'||sel.map==='London'&&zq?.tea));
var ZWP={MP:600,MG:800,SG:1000,SMG:1000,DS:1750,AR:1500,VMP:1500,BR:1800,MVR:1800,TRB:2000,TUR:2250,CY:2500,SN:2800,RL:4500,VA:2000,BP:1750,KTS:2050,RD:2100,HC:1400,OH:2400,SW:2175,LT:1950,PD:2450};
var zWallCost=k=>MAPS[sel.map]?.modWallCosts?.get(k)??(ZWP[k]||Math.round(Math.max(1000,Math.min(3000,W[k].d*(1/W[k].r)*8))));
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
 else if(k=='nuke'){add(K.cy,Lm(0x14140e),0,0,0,.34,.03,.34,Math.PI/2);add(K.cy,Lm(0x14140e),0,0,0,.34,.03,.34,Math.PI/2,0,0).position.z=-.02;for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.RingGeometry(.1,.3,18,1,i*Math.PI*2/3+.2,Math.PI/3*1.15),new THREE.MeshBasicMaterial({color:0xffcc20,side:THREE.DoubleSide}));m.position.z=.02;g.add(m);const m2=m.clone();m2.position.z=-.04;g.add(m2)}add(K.sp,Lm(0xffcc20,0xffa010),0,0,.03,.07,.07,.02);add(K.sp,Lm(0xffcc20,0xffa010),0,0,-.05,.07,.07,.02);const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.025,6,30),new THREE.MeshBasicMaterial({color:0xffcc20}));g.add(ring);add(K.cy,Lm(0x3a3a30),0,-.34,0,.1,.18,.1);add(K.cone,Lm(0xb0b0a0),0,-.5,0,.1,.14,.1,Math.PI)}
 else if(k=='fire'){add(K.bx,Lm(0x5a3a1a,0x100804),0,-.15,0,.5,.22,.34);add(K.cy,Lm(0x6a4a24,0x100804),0,-.04,0,.17,.5,.17,0,0,Math.PI/2);for(const x of[-.18,.18])add(K.bx,Lm(0xc9a23a,0x3a2a08),x,-.12,0,.045,.3,.36);add(K.bx,Lm(0xc9a23a,0x3a2a08),0,-.06,.17,.07,.07,.02);const t=zTex(128,128,(x,w,h)=>{x.font='900 120px Teko,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=12;x.strokeStyle='#4a0020';x.strokeText('$',64,70);x.fillStyle='#ff6ab8';x.fillText('$',64,70)});const pm=new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false});add(K.pl,pm,0,.28,0,.4,.4,1);add(K.pl,pm,0,.28,0,.4,.4,1,0,Math.PI/2,0)}
 else{const m=Lm(0xe8f8ff,0x40a8e0);add(K.bx,m,0,0,0,.42,.13,.13);add(K.bx,m,0,0,0,.13,.42,.13);add(K.bx,Lm(0x40c8ff,0x40c8ff),0,0,.07,.3,.06,.02);add(K.bx,Lm(0x40c8ff,0x40c8ff),0,0,.07,.06,.3,.02)}
 return g}
function zPuModel(k){const K=zPuGear(),def=ZPU[k],c=def.c,g=new THREE.Group(),core=new THREE.Group();core.add(zPuIcon(k,c));g.add(core);
 const orb=new THREE.Mesh(K.orb,zPuMat(c,.17));g.add(orb);const ring=new THREE.Mesh(K.ring,zPuMat(c,.8));ring.rotation.x=Math.PI/2.6;g.add(ring);const ring2=new THREE.Mesh(K.ring,zPuMat(0xffffff,.45));ring2.scale.setScalar(.82);ring2.rotation.x=-Math.PI/2.8;ring2.rotation.y=.7;g.add(ring2);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:K.gl,color:c,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(2.6,2.6,1);g.add(halo);
 return{g,core,orb,ring,ring2,halo}}
function zPuOk(x,z){const map=MAPS[sel.map];if(zq.barricade&&z<-3.5||map?.navGround&&!map.inside(x,z))return false;const y=zObjectFloor(x,z);for(const b of bx){if(b.pl)continue;if(x>b.x0-.3&&x<b.x1+.3&&z>b.z0-.3&&z<b.z1+.3&&b.h-y>.9&&(b.y0||0)-y<1.2)return false}return true}
function zPuTry(b){const z=zq;if(!z||zCli())return;z.puKills++;if(z.puCd>0||z.puRound>=4)return;if(Math.random()>.03+.0035*z.puKills)return;
 const pool=Object.keys(ZPU).filter(k=>k!=z.puLast&&!(k=='insta'&&z.pu.insta>0)&&!(k=='dbl'&&z.pu.dbl>0)&&!(k=='fire'&&z.pu.fire>0));let tot=0;for(const k of pool)tot+=ZPU[k].w;let r=Math.random()*tot,k=pool[0];for(const q of pool){r-=ZPU[q].w;if(r<=0){k=q;break}}
 let x=b.x,zz=b.z;if(zq.barricade&&zz<-3.5){x=0;zz=-2.45}if(!zPuOk(x,zz)){let ok=0;for(let i=0;i<10&&!ok;i++){const a=i/10*6.28,d=1+i*.25;if(zPuOk(b.x+Math.cos(a)*d,b.z+Math.sin(a)*d)){x=b.x+Math.cos(a)*d;zz=b.z+Math.sin(a)*d;ok=1}}if(!ok){x=P.x;zz=P.z}}
 z.puKills=0;z.puCd=15;z.puRound++;z.puLast=k;const id=z.puId++;zPuSpawn(id,k,x,zz);if(netOn)netSend({t:'zpu',id,k,x,z:zz})}
function zPuSpawn(id,k,x,z){const m=zPuModel(k),def=ZPU[k],base=zObjectFloor(x,z);m.g.position.set(x,base+.2,z);(zG||S).add(m.g);zq.drops.push({id,k,m,x,z,base,t:0,life:30,y:base+.2,ph:Math.random()*6,sp:0});
 const p=V(x,base+.6,z);burst(p,22,def.c,6,.7,.12);burst(p,8,0xffffff,8,.4,.07);beep(700,.08,'triangle',.06);setTimeout(()=>beep(1050,.1,'triangle',.06),70);const d=Math.hypot(P.x-x,P.z-z);if(d<30)msg(def.n+' dropped',1.2)}
function zPuRemove(d){(zG||S).remove(d.m.g);const i=zq.drops.indexOf(d);if(i>=0)zq.drops.splice(i,1)}
function zPuTick(dt){const z=zq;zNukeTick(dt);if(z.puCd>0)z.puCd-=dt;const pu=z.pu;
 for(const k of['insta','dbl','fire'])if(pu[k]>0){pu[k]-=dt;if(pu[k]<=0){pu[k]=0;beep(300,.25,'sawtooth',.07);setTimeout(()=>beep(200,.3,'sawtooth',.07),120);if(k=='fire')zFireSale(0)}else if(pu[k]<5&&((pu[k]*3)|0)!=((pu[k]*3+dt*3)|0))beep(1200,.03,'square',.03)}
 document.body.classList.toggle('zinsta',pu.insta>0);
 for(let i=z.drops.length-1;i>=0;i--){const d=z.drops[i],m=d.m,c=ZPU[d.k].c;d.t+=dt;d.life-=dt;const u=Math.min(1,d.t/.7),e=1-Math.pow(1-u,3),over=Math.sin(u*Math.PI)*.35;d.y=d.base+.2+(1.15-.2)*e+over;
  m.g.position.set(d.x,d.y+Math.sin(d.t*2.6+d.ph)*.1,d.z);m.core.rotation.y=d.t*2.2;m.core.rotation.z=Math.sin(d.t*1.3)*.12;m.ring.rotation.z=d.t*2.8;m.ring2.rotation.z=-d.t*2.1;const pl=1+Math.sin(d.t*5)*.06;m.orb.scale.setScalar(pl*Math.min(1,d.t*4));m.halo.material.opacity=.6+Math.sin(d.t*6+d.ph)*.18;
  d.sp-=dt;if(d.sp<=0){d.sp=.1;const a=Math.random()*6.28;burst(V(d.x+Math.cos(a)*.5,d.y+Math.random()*.8-.3,d.z+Math.sin(a)*.5),1,c,.8,.7,.07)}
  if(d.life<8){const f=d.life<3?9:4.5;m.g.visible=((d.life*f)|0)%2==0}
  if(d.life<=0){zPuRemove(d);continue}
  if(!zCli()){for(const p of zPlayers()){if(Math.hypot(p.x-d.x,p.z-d.z)<1.35&&Math.abs((p.y||0)+.9-d.y)<2.1){zPuCollect(d,p.id);break}}}}}
function zPuCollect(d,by){zPuRemove(d);zPuApply(d.k,by);if(netOn)netSend({t:'zpc',id:d.id,k:d.k,by})}
function zPuApply(k,by){const z=zq,def=ZPU[k];const c=def.c;const q=V(P.x,1.1,P.z);burst(q,40,c,9,.8,.13);burst(q,16,0xffffff,12,.5,.08);shake=Math.max(shake,.25);LX.fx.pulse=Math.max(LX.fx.pulse,.7);flashL=Math.max(flashL||0,1.2);
 if(k=='ammo'){for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}rel=0;gc=3;[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.12,'triangle',.08),i*70))}
 else if(k=='insta'){z.pu.insta=30;beep(90,.6,'sawtooth',.14);setTimeout(()=>beep(1400,.25,'square',.07),80);setTimeout(()=>beep(700,.3,'square',.07),220);LX.fx.ca=1}
 else if(k=='dbl'){z.pu.dbl=30;[880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>beep(f,.1,'sine',.08),i*55))}
 else if(k=='fire'){z.pu.fire=30;zFireSale(1);[660,880,660,880,1320].forEach((f,i)=>setTimeout(()=>beep(f,.14,'triangle',.08),i*90))}
 else if(k=='heal'){P.hp=P.mhp;P.sh=P.msh;LX.fx.heal=1;[392,523,659].forEach((f,i)=>setTimeout(()=>beep(f,.2,'sine',.08),i*100))}
 else if(k=='nuke'){z.pts+=400;floatTxt(V(P.x,2.4,P.z),'+400','#ffa020');noise(.9,120,.7);beep(55,.9,'sawtooth',.18);setTimeout(()=>beep(40,1.1,'square',.12),200);shake=Math.max(shake,.9);LX.fx.flash=1;LX.fx.boom=1;flashL=3;zNuke()}}
/* the nuke: a shockwave of death rolls outwards from whoever grabbed it. Nobody is paid per kill, everybody gets the flat 400 */
function zNuke(){if(zCli())return;const q=zq.nukeQ=zq.nukeQ||[];for(const b of bots){if(!b.zom||!b.al||b.zp||b.zquestBoss||b.jupiterBoss)continue;q.push({b,t:Math.min(1.1,Math.hypot(b.x-P.x,b.z-P.z)*.032)})}}
function zNukeTick(dt){const q=zq.nukeQ;if(!q||!q.length)return;for(let i=q.length-1;i>=0;i--){const e=q[i];e.t-=dt;if(e.t>0)continue;q.splice(i,1);const b=e.b;if(!b.al)continue;b.al=0;b.atk=0;b.hp=0;zdead.push({b,t:0});const a=Math.random()*6.28;ragStart(b,Math.cos(a)*5,Math.sin(a)*5,9+Math.random()*4);const p=V(b.x,1.1,b.z);burst(p,22,0xffa020,10,.8,.16);burst(p,10,0xff4020,7,.6,.2);burst(p,8,0x222222,5,1.1,.24)}}

/* ---------- small helpers ---------- */
var zTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
function zSprite(txt,col,sz,depth){const c=document.createElement('canvas');c.width=256;c.height=64;const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:!!depth}));s.scale.set(sz*4,sz,1);s.userData={c,t};zSet(s,txt,col);return s}
function zSet(s,txt,col){const g=s.userData.c.getContext('2d');g.clearRect(0,0,256,64);g.font='700 40px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='#000';g.strokeText(txt,128,34);g.fillStyle=col;g.fillText(txt,128,34);s.userData.t.needsUpdate=true}
var hex=c=>'#'+c.toString(16).padStart(6,'0'),zf=m=>{beep(140,.2,'sawtooth',.07);msg(m,1)};
const zObjectFloor=(x,z)=>MAPS[sel.map]?.navGround?MAPS[sel.map].groundHeight(x,z):0;
function zSolid(x,z,w,d,h){const y=zObjectFloor(x,z),b={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h:y+h,y0:y};bx.push(b);indexedBoxes=null;return b}
function zUnsolid(b){const i=bx.indexOf(b);if(i>=0){bx.splice(i,1);indexedBoxes=null}zGrid()}
/* purchase juice: coins fly, a chime rings, the price floats up and the screen pulses */
function zBuyFx(x,y,z,col,txt){const p=V(x,y,z);burst(p,26,col||0xffd24a,6,.7,.1);burst(p,10,0xffffff,9,.4,.06);if(txt)floatTxt(V(x,y+.5,z),txt,'#'+(col||0xffd24a).toString(16).padStart(6,'0'));beep(880,.08,'triangle',.07);setTimeout(()=>beep(1320,.12,'triangle',.07),70);setTimeout(()=>beep(1760,.16,'sine',.05),150);shake=Math.max(shake,.12);flashL=Math.max(flashL||0,.6);if(typeof estBuy=='function')estBuy(x,z)}

/* ---------- weapons the player holds ---------- */
function zGunObj(k){const w={k,...eff(k,[])};w.mag=w.m;w.rs=k=='RG'?3:(w.rs==null?4:w.rs);w.res=w.m*w.rs;return w}
function zGive(k){if(ZMELEE[k])return zGiveMel(k);const w=zGunObj(k),i=wp.findIndex(x=>x.k==k);MV.eq=0;if(i>=0){wp[i]=w;cur=i}else if(wp.length<zq.cap){wp.push(w);cur=wp.length-1}else wp[cur]=w;rel=0;setGun();msg(W[k].n,1.5)}
function zGiveMel(k){const n=ZMELEE[k];zq.mel={k:n,pap:0};zq.dash.cd=0;zq.dash.t=0;zPaintHands();popup(n.toUpperCase(),k=='NF'?'Hold V to draw them. Aim = DASH':'Hold V to draw it');beep(300,.3,'sawtooth',.1);setTimeout(()=>beep(900,.3,'triangle',.1),150);burst(V(P.x,1.2,P.z),30,k=='NF'?0x55ccff:0xffffff,7,.6,.12);shake=Math.max(shake,.4)}
function zPick(by){const own=by==zMe()?wp.map(w=>w.k):[];
 if(sel.map===JUPITER_MAP&&Math.random()<.01)return 'KEY';
 const rareG=Math.random()<.03&&!own.includes('RG'),rareN=Math.random()<.03&&(!zq||zq.mel.k!='Nitrogen Fists')&&!(MAPS[sel.map]&&MAPS[sel.map].nf===0);if(rareG)return 'RG';if(rareN)return 'NF';if(sel.map==='London'&&zq?.tea&&!own.includes('TEA')&&Math.random()<.045)return 'TEA';const pool=zPoolKeys().filter(k=>!own.includes(k));return pool.length?pool[Math.random()*pool.length|0]:'SMG'}
function zPap(w){const B=W[w.k],t=(w.pap||0)+1;w.pap=t;w.pm=t==1?2.2:3.6;if(w.k=='RG')w.pm=t==1?3:6;w.m=Math.round(B.m*(t==1?1.5:2));w.r=B.r*(t==1?.9:.8);w.pn=B.n+(t==1?' PaP':' PaP II');w.mag=w.m;w.res=w.m*w.rs;rel=0;setGun()}
var _zsg=setGun;setGun=function(){_zsg.apply(this,arguments);const w=cw();if(mode==='Zombies'&&w?.pap)gf.material.color.setHex(zPapAccent(w.pap))};

/* Hollow Estate keeps its wood, gilded lacquer and spectral finishes. */
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
 const f=V(-Math.sin(yaw),0,-Math.cos(yaw));for(let i=0;i<3;i++)burst(V(P.x-f.x*.4,.9,P.z-f.z*.4),14,i?0xffffff:0x55ccff,8,.5,.12);if(typeof haptic=='function')haptic(.9,200,.9,'both')}
{const _mc=moveCalc;moveCalc=function(){const r=_mc.apply(this,arguments);if(zq&&mode=='Zombies'&&zq.dash&&zq.dash.t>0&&!P.dead){r.f=1;r.s=0;r.spt=false;r.spd=ZD.sp}return r}}
function zDashTick(dt){const d=zq.dash;if(d.cd>0)d.cd=Math.max(0,d.cd-dt);if(d.t<=0)return;d.t-=dt;zQuestTool('dash',P.x,P.y,P.z);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));
 d.fi=(d.fi||0)-dt;if(d.fi<=0){d.fi=.1;FI.d=.14;FI.t=.14;FI.side^=1}
 burst(V(P.x-f.x*.9,.6+Math.random()*.8,P.z-f.z*.9),3,Math.random()<.5?0x55ccff:0xffffff,3,.35,.1);
 for(const b of bots){if(!b.zom||!b.al||d.hit.has(b.i)||b.rise>0)continue;const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);if(D>ZD.r+(b.big?.5:0)||Math.abs((b.y||0)-(P.y||0))>2.2)continue;
  d.hit.add(b.i);d.n++;src='Melee';srcK='';hitBot(b,Math.round(zMeleeDmg(b,1)*.85),0);if(b.al&&!b.zp){b.stun=1;mv(b,f.x*3.5+(dz>0?.9:-.9)*f.z,f.z*3.5-(dx>0?.9:-.9)*f.x,.45)}
  burst(V(b.x,1.2,b.z),18,0x55ccff,9,.5,.12);burst(V(b.x,1.2,b.z),8,0xffffff,12,.3,.07);beep(1500,.06,'square',.06);noise(.2,700,.35);shake=Math.max(shake,.4);if(typeof haptic=='function')haptic(.7,90,.7,'both');if(typeof nfHit=='function')try{nfHit(1)}catch(e){}}
 if(d.t<=0){d.t=0;LX.fx.pulse=Math.max(LX.fx.pulse,.4);burst(V(P.x,1,P.z),24,0x55ccff,8,.6,.12)}}

/* ---------- ammo: wall buys and crates. Nothing restocks by itself. ---------- */
function zBuyAmmo(wall,pos){const w=cw();if(!w||P.dead)return;const c=zAmmoPrice(w,wall);if(zAmmoFull(w))return zf('Ammo is full');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;
 w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs);rel=0;gc=Math.max(gc,3);if(!wall)gc=3;zBuyFx(pos[0],1.3,pos[1],0x7bf08a,'-'+c)}
function zBuyWall(k,pos){const mel=ZMELEE[k],own=!mel&&wp.find(w=>w.k==k);
 if(own){const c=zAmmoPrice(own,1);if(zAmmoFull(own))return zf('Ammo is full');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;own.mag=own.m;own.res=own.m*(own.rs==null?4:own.rs);rel=0;zBuyFx(pos[0],1.4,pos[1],0x7bf08a,'-'+c);return}
 const c=mel?ZMELCOST[k]:zWallCost(k);if(mel&&zq.mel.k==ZMELEE[k])return zf('You already have it');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;zGive(k);zBuyFx(pos[0],pos[2]??1.4,pos[1],0xffd24a,'-'+c)}
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
  if(mel){zPapMel();popup('PACK-A-PUNCHED',zq.mel.pn+' · '+zPapFinish(zq.mel.pap))}
  else{const w=p.w;if(w&&wp.includes(w)){zPap(w);popup('PACK-A-PUNCHED',(w.pn||W[w.k].n)+' · '+zPapFinish(w.pap))}else popup('PACK-A-PUNCH','The weapon is gone')}
  beep(300,.15,'sawtooth',.1);setTimeout(()=>beep(900,.3,'triangle',.1),120);setTimeout(()=>beep(1500,.4,'sine',.08),260);shake=Math.max(shake,.5);flashL=2;
  const q=V(P.x,1.2,P.z);burst(q,50,0xb070ff,10,.8,.14);burst(q,24,0xffe9a0,12,.6,.08);LX.fx.pulse=Math.max(LX.fx.pulse,.9);LX.fx.flash=Math.max(LX.fx.flash,.35);if(typeof estPap=='function')estPap(0,p)}}

/* ---------- building the level objects: doors, machines, boxes, wall buys and crates are modelled in js/estate.js; this file only holds their rules ---------- */
function zStart(){jovianResetPresentation();zQuestResetCinema();resetTacticalMap();document.body.classList.toggle('zom',mode=='Zombies');$('#zh').style.display=mode=='Zombies'?'flex':'none';$('#zp').textContent='';zhc='';jupiterTouchControl.hidden=true;$('#jupiter-quest').hidden=true;$('#jupiter-waypoint').hidden=true;$('#jupiter-quest').dataset.logUntil=0;
 if(zG&&zG.parent)zG.parent.remove(zG);zG=null;zi=[];zdoors=[];zboxes=[];zdead=[];zfls={};zbT=zsT=0;if(mode!='Zombies'){zq=null;$('#zmain').hidden=true;zHudShow(0);zPaintHands();return}
 const M=MAPS[sel.map];zq={r:0,pts:500,perks:{},cap:2,revBuys:0,revM:null,st:'prep',tm:6,toSpawn:0,spT:0,open:{0:1},fl:0,cur:null,gn:3,brutes:0,down:0,out:0,dnT:0,rvT:0,ad:0,mp:[],pb:{},mel:{k:'Fists',pap:0},dash:{t:0,cd:0,max:6,hit:null},dashH:0,papT:0,pap:null,guts:[],decals:[],elev:{},pu:{insta:0,dbl:0,fire:0},drops:[],puKills:0,puCd:8,puRound:0,puLast:null,puId:1};
 MV.eq=0;wp=[zGunObj(M.starter||'CT')];cur=0;rel=0;gc=2;P.mhp=50;P.hp=50;P.msh=50;P.sh=50;setGun();zPaintHands();
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
 beep(520,.1,'triangle',.08);setTimeout(()=>beep(780,.15,'triangle',.08),90);flashL=Math.max(flashL||0,1);LX.fx.heal=Math.max(LX.fx.heal,.5);if(typeof estPerk=='function')estPerk(t)}
/* the Revive Soda machine runs dry after four purchases (counted across every player) */
function zRevCount(n){zq.revBuys=n;const o=zq.revM;if(n>=4&&o&&!o.o.gone){o.g.visible=false;o.o.gone=1;zUnsolid(o.bxo);setTimeout(()=>msg('The Revive Soda machine is empty',2),1800)}}
/* mystery box rules (the chest, its lid and the floating weapon are in estate.js) */
function zBoxAct(o,i){if(o.st==0){const bc=zBoxCost();if(zq.pts<bc)return zf('Not enough points');if(zCli())return void netSend({t:'zqb',i});zq.pts-=bc;zBoxStart(o,i,zMe())}
 else if(o.st==2&&o.by==zMe()){zGive(o.item);if(zCli())netSend({t:'zqe',i});zBoxEnd(o,i)}}
function zBoxStart(o,i,by){o.st=1;o.t=0;o.cy=0;o.by=by;if(EST.bx&&!EST.bx.fs&&!zCli())EST.bx.uses++;beep(300,.2,'triangle',.08);if(typeof estBoxState=='function')estBoxState(o,1);if(netOn&&isHost)netSend({t:'zbs',i,st:1,by})}
function zBoxEnd(o,i,relocate=true){
 if(relocate&&o.st===2&&!zCli()&&zboxes.length>1&&EST.bx?.loc===i&&!EST.bx.fs&&EST.bx.uses>=EST.bx.thr){
  zBoxMoveStart(o,i);return;
 }
 o.st=0;o.beam.visible=o.lab.visible=false;if(o.fsHide){o.fsHide=0;zFireSaleHide(o)}if(typeof estBoxState=='function')estBoxState(o,0);if(netOn&&isHost)netSend({t:'zbs',i,st:0})}
function zBoxTick(o,i,dt,auth){if(o.st==1){o.t+=dt;o.cy-=dt;o.beam.visible=o.lab.visible=true;if(o.cy<=0){o.cy=.12;const pool=[...zPoolKeys(),'RG',...(sel.map===JUPITER_MAP?['KEY']:[]),...(MAPS[sel.map].nf===0?[]:['NF'])],k=pool[Math.random()*pool.length|0];zSet(o.lab,zItemName(k),'#ffd24a');if(typeof estBoxShow=='function')estBoxShow(o,k);beep(500+Math.random()*300,.05,'square',.03)}
  if(auth&&o.t>3.2){o.item=zPick(o.by);o.st=2;o.t=0;zSet(o.lab,zItemName(o.item),['RG','NF','KEY'].includes(o.item)?'#ff4a4a':'#7bf08a');if(typeof estBoxShow=='function')estBoxShow(o,o.item,1);beep(900,.2,'triangle',.09);if(netOn&&isHost)netSend({t:'zbs',i,st:2,item:o.item,by:o.by})}}
 else if(o.st==2&&auth){o.t+=dt;if(o.t>9)zBoxEnd(o,i)}
 else if(o.st==3){o.t+=dt;if(auth&&o.t>2.6)zBoxRelocate(o,i)}}
function zBoxMoveStart(o,i){o.st=3;o.t=0;zSet(o.lab,'THE BOX IS MOVING!','#ff4a4a');o.beam.visible=o.lab.visible=true;estBoxState(o,0);beep(120,.5,'sawtooth',.1);setTimeout(()=>beep(90,.5,'sawtooth',.1),260);if(netOn&&isHost)netSend({t:'zbs',i,st:3,by:o.by})}
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
function zPlayers(){const a=[];if(!P.dead&&!jupiterIntroActive())a.push({id:zMe(),x:P.x,z:P.z,y:P.y,me:1});if(netOn)for(const b of bots)if(b.net&&!b.hb&&b.al&&!b.ji)a.push({id:b.id,x:b.x,z:b.z,y:b.y||0});return a}

/* ---------- zombies ---------- */
function zModel(r,big,variant=botId){if(sel.map===JUPITER_MAP)return jupiterEnemyModel(big);const m=new THREE.Group(),t=Math.min(3,r/5|0),pk=a=>a[Math.random()*a.length|0],
 rig=mkHuman(m,{zombie:1,big,variant,skin:[0xa9b98a,0xb3b58a,0xa89aa8,0xb27a62][t],shirt:big?0x5a1a14:pk([0x5a6a7a,0x6a5a4a,0x4a5a46,0x7a6a5a,0x3a3a44,0x6a4a4a]),pants:pk([0x2f3340,0x3a3a30,0x4a3f35,0x26282c]),hair:pk([0x1a1410,0x2a2018,0x3a342a]),eye:r>=15?0xff9a2a:0xff2a2a});
 S.add(m);if(big)m.scale.setScalar(1.35);return{m,rig}}
var zOutdoor=(M,x,z)=>(M.outdoor||[]).some(o=>x>o[0]&&x<o[2]&&z>o[1]&&z<o[3]);
function mkZombie(x,z,big){const r=zq.r,{m,rig}=zModel(r,big),hp=Math.round(zHp(r)*(big?3:1)),run=r>=25||(r>=6&&Math.random()<Math.min(.6,(r-5)*.06)),M=MAPS[sel.map],out=zOutdoor(M,x,z),
 b={i:botId++,m,rig,x,z,y:0,hp,mhp:hp,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,big:!!big,nm:big?'Brute':'Zombie',cd:.5,k:0,df:1,dm:Math.min(zDm(r)*(big?1.5:1),big?70:55),ac:zAc(r),run,sp:(Math.min(4.2,1.6+r*.11+Math.random()*.5)+(run?1:0))*(big?.75:1),rise:big?1.3:1,riseD:big?1.3:1,riseY:out?-1.9:0,atk:0,at:0,atd:.7,atype:0};
 if(m.userData.key){jupiterMarkEnemy(b);m.position.set(x,b.y,z);bots.push(b);sdGameRuntime?.botSpawn(b);burst(V(x,b.y+.6,z),10,0xffb92d,4,.5,.08);return b}
 m.position.set(x,b.riseY,z);zGutHand(b);bots.push(b);sdGameRuntime?.botSpawn(b);const p=V(x,.4,z);burst(p,big?34:18,out?0x5a4630:0x8a8478,5,.9,.16);burst(p,6,out?0x3a2a1a:0x555049,3,1.1,.22);if(out)noise(.5,160,.3);else noise(.3,420,.18);return b}
function zPuppet(i,x,z,big,r){const{m,rig}=zModel(r,big,i),b={i,m,rig,x,z,tx:x,tz:z,y:0,hp:1e9,mhp:1e9,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,zp:1,big:!!big,nm:big?'Brute':'Zombie',df:1,k:0,rise:.8,riseD:.8,riseY:0,atk:0,at:0,atd:.65,atype:0};m.position.set(x,0,z);if(m.userData.key)jupiterMarkEnemy(b);else zGutHand(b);bots.push(b);return b}
/* a spawn point is nudged to the nearest free spot so nobody appears inside a table or a statue */
function zFreeSpot(x,z){const g=NAV.g,n=NAV.n;if(!g)return[x,z];const free=(a,b)=>{const i=Math.floor(a+H),j=Math.floor(b+H);return i>0&&j>0&&i<n-1&&j<n-1&&!g[j*n+i]};if(free(x,z))return[x,z];for(let r=.8;r<=6;r+=.6)for(let a=0;a<14;a++){const t=a/14*6.283,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r;if(free(px,pz))return[px,pz]}return[x,z]}
function zSpawn(M,big){if(M.spawn)return M.spawn(big);const open=M.zs.filter(s=>zq.open[s[2]]),pl=zPlayers(),far=open.filter(s=>pl.every(p=>Math.hypot(s[0]-p.x,s[1]-p.z)>12)),s=(far.length?far:open)[Math.random()*(far.length||open.length)|0],[x,z]=zFreeSpot(s[0]+(Math.random()-.5)*3,s[1]+(Math.random()-.5)*3);mkZombie(x,z,big)}
/* damage to a zombie: 10 points per hit, kill 50 (60 explosive), headshot kill 100, melee kill 130; the RayGun kills anything.
   Guests send their hits to the host (zqh) and get the kill points back (zk). */
var _zhb=hitBot;hitBot=function(b,d,head,scale=1){if(b.zom)return zHit(b,d,head,scale);if(mode=='Zombies')return;_zhb(b,d,head)};
function zHit(b,d,head,scale=1){if(!b.al)return;
 if(b.zquestBoss&&(zq.main.ward||zq.main.cut||zq.main.exposed<=0)){if(t0>(zq.main.blockAt||0)){zq.main.blockAt=t0+.2;beep(240,.09,'triangle',.045)}return}const w=wp.find(x=>x.k==srcK),melee=src==='Melee';if(srcK=='RG')d=RGB*(w&&w.pm?w.pm:1)*(b.big?2:1);else if(w&&w.ex)d*=ZE*(w.pm||1);else if(!srcK&&!melee)d*=ZE;
 d*=scale;
 if(b.zp&&b.jupiterBoss&&(srcK==='KEY'||zq.jupiter.quest.cut))return;
 if(b.zp){hits++;juiceHit(b,Math.min(d,9999),head);$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(!melee&&!b.zquestBoss)zGain(10);
  if(melee&&zq.r<=2)d=Math.min(d,zHp(zq.r)*(b.big?3:1));
  netSend({t:'zqh',i:b.i,d,h:head?1:0,k:srcK,m:melee?1:0});return}
 zDamage(b,d,head,zMe(),srcK,melee)}
function zDamage(b,d,head,by,k,mel){if(!b.al)return;if(sdGameRuntime){d=sdGameRuntime.damage(b,d,by===zMe()?P:null,k);if(d<=0)return}if(b.jupiterBoss){jupiterQuestBossDamage(b,d,by,k);return}if(b.zquestBoss){zQuestDamage(b,d,head,by);return}if(zq.pu.insta>0)d=Math.max(d,b.hp+1);b.hp-=d;b.lh=t0;const mine=by==zMe();
 if(mine){hits++;$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04)}juiceHit(b,Math.min(d,9999),head);
 if(b.hp>0){if(mine&&!mel)zGain(10);return}
 b.al=0;b.atk=0;const pt=mel?130:head?100:(k=='RL'||k=='RG'||k==='KEY')?60:50;zdead.push({b,t:0});zQuestKill(b);if(typeof lonKill=='function')lonKill(b);{const kp=mine?P:bots.find(x=>x.net&&x.id==by);ragStart(b,kp?b.x-kp.x:0,kp?b.z-kp.z:0,b.big?2.2:(mel&&zMelKey()=='Nitrogen Fists')?9:(k=='SG'||k=='RL'||k=='RG'?6:3.4))}
 if(mine){kills++;zGain(pt);zCryptHeal(mel);if(b.isKey&&zq.perks.keyring)jupiterEarnCompanion(b,by);floatTxt(V(b.x,2.8,b.z),'+'+(zq.pu.dbl>0?pt*2:pt),'#ffd24a');juiceKill(b,head);wzkill(k);killXP(head)}
 else{const nb=bots.find(x=>x.net&&x.id==by);if(nb)nb.k=(nb.k||0)+1;if(b.isKey)jupiterCreditCompanion(b,by);netSend({t:'zk',to:by,pts:pt,k,m:!!mel,h:head?1:0,ki:b.isKey?b.i:null})}zPuTry(b)}

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
function zStrike(b,pl){if(jupiterProtected(pl.id))return;const dx=pl.x-b.x,dz=pl.z-b.z,D=Math.hypot(dx,dz)||1,reach=1.75*(b.big?1.25:1);if(D>reach||Math.abs(pl.y-(b.y||0))>1.6||b.isKey&&!zSees(b,pl))return;
 if(pl.me){if(zq.dash&&zq.dash.t>0)return;hurt(b.dm,b);mv(P,dx/D*(b.big?.9:.45),dz/D*(b.big?.9:.45),.45);kick+=b.big?.05:.025;shake=Math.max(shake,b.big?.55:.3);LX.fx.dmg=Math.max(LX.fx.dmg,.35);burst(V(P.x,P.y+1.3,P.z),8,b.isKey?0xffba27:0x8a1010,4,.4,.08)}
 else netSend({t:'hit',to:pl.id,d:b.dm,bot:b.i});
 if(b.big){const q=V(b.x+dx/D*1.1,.2,b.z+dz/D*1.1);burst(q,16,0x6a6458,5,.7,.2);noise(.4,140,.45)}else noise(.12,900,.18)}
/* arm and body poses for the attack and for crawling out of the ground, used by animBot (systems.js) */
var zsm_=u=>{u=u<0?0:u>1?1:u;return u*u*(3-2*u)},zlr=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
function zAtkPose(b,dt){if(b.vaultPose)return lockboxVaultPose(b);if(b.tear)return lockboxTearPose(b);const N=[.02,-.12,.58],NL=[-.02,-.12,.58],H1=[.6,-1,-.3],H2=[-.6,-1,-.3];
 if(b.rise>0){const u=1-b.rise/(b.riseD||1),wob=Math.sin(t0*15+b.i)*.1;return{lean:-.35+.55*zsm_(u),tw:Math.sin(t0*9+b.i)*.15,bob:0,hx:-.2,hy:Math.sin(t0*7+b.i)*.3,R:[.2,.5+wob,.14],L:[-.2,.5-wob,.14],hR:[.6,1,-.2],hL:[-.6,1,-.2],jaw:.8}}
 if(b.gutM)b.gutM.visible=!!b.atk&&b.atype==4&&b.at<b.atd*.54;if(!b.atk)return null;const raw=Math.min(1,b.at/b.atd),wu=zsm_(raw/.5),st=zsm_((raw-.5)/.22),rc=zsm_((raw-.72)/.28),w=wu*(1-st),s=st*(1-rc),k=b.big?1.25:1,ty=b.atype;
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
function zSees(b,pl){const f=V(b.x,(b.y||0)+(b.big?2.2:1.5),b.z),t=V(pl.x,(pl.y||0)+1.1,pl.z),d=t.clone().sub(f),L=d.length();if(L<.1)return true;return castW(f,d.multiplyScalar(1/L),L)>=L-.3}
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
function zMove(dt){const zs=bots.filter(b=>b.zom&&b.al&&!b.zquestBoss&&!sdGameRuntime?.aiIdle(b)),pls=zPlayers(),M=MAPS[sel.map];
 const EL=zq.elev;for(const p of pls)EL[p.id]=(p.y||0)>.55?(EL[p.id]||0)+dt:0;
 zq.gutCD=(zq.gutCD||0)-dt;let gutBusy=zq.guts.length;for(const z_ of zs)if(z_.atk&&z_.atype==4)gutBusy++;
 for(const b of zs){
  if(b.rise>0){b.rise-=dt;const u=Math.min(1,1-b.rise/b.riseD),e=1-Math.pow(1-u,2.2);b.m.position.set(b.x,(b.y||0)+b.riseY*(1-e),b.z);if(b.riseY&&Math.random()<dt*20)burst(V(b.x,.15,b.z),1,0x5a4630,2,.4,.12);b.tyaw=b.m.rotation.y;continue}
  if(M.entry&&M.entry(b,dt))continue;
  let pl=null,bd=1e9;for(const p of pls){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<bd){bd=d;pl=p}}if(!pl)continue;
  const reach=1.5*(b.big?1.25:1),stopD=1.05*(b.big?1.2:1);
  const canReach=!b.isKey||bd>=reach||zSees(b,pl);let sps=b.sp;if(b.stun>0){b.stun-=dt;sps*=.15}
  if(b.atk||bd<stopD&&canReach)sps=0;
  navMove(b,dt,pl.x,pl.z,sps,zfls[pl.id]);if(b.isKey)b.y=M.groundHeight(b.x,b.z);b.m.position.set(b.x,b.y||0,b.z);b.tyaw=bd<4||b.atk?Math.atan2(pl.x-b.x,pl.z-b.z):(b.mva==null?b.m.rotation.y:b.mva);
  if(sdGameRuntime?.aiPassive(b)){b.atk=0;continue}
  b.cd-=dt;b.gcd=(b.gcd==null?1+Math.random()*2.5:b.gcd)-dt;const canMelee=canReach&&bd<reach&&Math.abs(pl.y-(b.y||0))<1.4;
  if(b.atk){b.at+=dt;if(b.atype==3&&b.at>b.atd*.3&&b.at<b.atd*.55&&bd>.95){const dx=pl.x-b.x,dz=pl.z-b.z;mv(b,dx/bd*3.4*dt,dz/bd*3.4*dt,.45)}
   if(!b.ahit&&b.at>=b.atd*.52){b.ahit=1;if(b.atype==4)zThrowGut(b,pl);else zStrike(b,pl)}if(b.at>=b.atd){b.atk=0;b.cd=Math.max(.2,b.ac-b.atd)}}
  else if(canMelee&&b.cd<=0&&!(b.stun>0))zAtkStart(b,pl);
  else if(!b.isKey&&!canMelee&&(EL[pl.id]||0)>2.2&&bd>1.1&&bd<17&&b.gcd<=0&&gutBusy<2&&zq.gutCD<=0&&!(b.stun>0)&&zSees(b,pl)){zAtkStart(b,pl,4);gutBusy++;zq.gutCD=1.8+Math.random()*1.8;b.gcd=Math.max(b.gcd,5+Math.random()*3)}
  else if(bd>=reach)b.cd=Math.max(b.cd,.3)}
 /* zombies are solid to each other */
 for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++){const a=zs[i],c=zs[j];if(a.rise>0||c.rise>0||(M.entry&&(!a.entered||!c.entered)))continue;const dx=c.x-a.x,dz=c.z-a.z,R=(a.big||c.big)?1.15:.9,d2=dx*dx+dz*dz;if(d2<R*R&&d2>1e-6){const d=Math.hypot(dx,dz),p=(R-d)*.5/d;mv(a,-dx*p,-dz*p,.45);mv(c,dx*p,dz*p,.45)}}
 zq.gn-=dt;if(zq.gn<=0&&zs.length){zq.gn=2+Math.random()*2;if(M===MAPS[JUPITER_MAP])return;const b=zs[Math.random()*zs.length|0],d=Math.hypot(b.x-P.x,b.z-P.z);if(d<25)beep(70+Math.random()*50,.4,'sawtooth',Math.max(.01,.05-d*.002))}}
/* the player is solid too: zombies cannot be walked through (or walked into) and they shove you when they crowd you; a Nitro dash plows through */
function zPush(dt){if(P.dead||jupiterProtected(zMe())||(zq.dash&&zq.dash.t>0))return;const own=isHost||!netOn;
 for(const b of bots){if(!b.zom||!b.al||b.rise>0||(zq.barricade&&(own?!b.entered:b.z<-3.5)))continue;const R=b.big?1.15:.95,dx=P.x-b.x,dz=P.z-b.z,d=Math.hypot(dx,dz);if(d>=R||Math.abs((b.y||0)-(P.y||0))>1.6)continue;
  const nx=d>.001?dx/d:1,nz=d>.001?dz/d:0,pen=R-d;if(own){mv(P,nx*pen*.65,nz*pen*.65,.45);if(!b.zp)mv(b,-nx*pen*.35,-nz*pen*.35,.45)}else mv(P,nx*pen,nz*pen,.45);
  const vin=-((P.mx||0)*nx+(P.mz||0)*nz);if(vin>0){P.mx=(P.mx||0)+nx*vin;P.mz=(P.mz||0)+nz*vin}}}
function zAnim(dt){for(let i=zdead.length-1;i>=0;i--){const d=zdead[i];d.t+=dt;ragTick(d.b,dt);if(d.t>6&&d.b.rag)d.b.rag.sink=(d.t-6)*1.4;if(d.t>7.2){S.remove(d.b.m);const j=bots.indexOf(d.b);if(j>=0)bots.splice(j,1);zdead.splice(i,1)}}}

/* ---------- round flow ---------- */
/* what a new round does for every player (host and guests): camo check, bring downed players back. Ammo is NOT restocked: buy it at the wall or at an Ammo Crate. */
function zRoundFx(){const z=zq;zRoundDone(z.r);rel=0;if(netOn&&P.dead)zRespawn();
 msg(z.brutes?'Round '+z.r+' · Brutes incoming':'Round '+z.r,3);roundSnd('new',z.brutes);if(typeof estRound=='function')estRound(z.r,z.brutes)}
function zNewRound(){const z=zq;z.r++;z.puRound=0;z.st='run';z.toSpawn=zTot(z.r);z.brutes=z.r%5==0?Math.floor(z.r/5):0;z.spT=.6;zRoundFx();if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:0,br:z.brutes})}
function zEndRound(){const z=zq;if(window.SD_MOD_SESSION&&z.r>=modRules.waveLimit)return endGame('Victory');z.st='prep';z.tm=8;msg('Round '+z.r+' survived',2.5);roundSnd('end');if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:z.tm})}
function zRoundSync(d){const z=zq;if(d.r>z.r){z.r=d.r;z.brutes=d.br||0;zRoundFx()}else if(d.st=='prep'&&z.st!='prep'){msg('Round '+z.r+' survived',2.5);roundSnd('end')}z.st=d.st;z.tm=d.tm;if(d.rm!=null)z.rm=Math.min(999,Math.max(0,d.rm|0))}
/* per-frame work shared by the host and by guests */
function zCommon(dt){const z=zq;if(!P.dead&&t0-lastHit>(z.perks.rev?2:6)&&P.hp<P.mhp)P.hp=Math.min(P.mhp,P.hp+(z.perks.rev?24:12)*dt);
 if(z.down){z.dnT-=dt;if(z.dnT<=0){z.down=0;z.out=1;msg('You bled out. You return next round',3)}}
 if(z.cur&&z.cur.rv&&key.KeyF&&!P.dead){z.rvT+=dt;const rvN=z.perks.rev?1:2;$('#zp').textContent=`Reviving ${z.cur.rv.nm}… ${Math.min(100,Math.round(z.rvT/rvN*100))}%`;if(z.rvT>=rvN){z.rvT=0;netSend({t:'zqv',to:z.cur.rv.id});z.pts+=100;feed('You revived '+z.cur.rv.nm)}}else z.rvT=0;
 if(P.dead&&z.dash.t>0)z.dash.t=0;zDashTick(dt);zPapTick(dt);zPuTick(dt);zPush(dt);zGutTick(dt);zAnim(dt);if(z.jupiter)jupiterTick(dt);zQuestTick(dt);zInteract();if(z.barricade)lockboxHold();zMarkers();zProne();if(typeof estTick=='function')estTick(dt)}
function zomTick(dt){const z=zq;if(!z||mode!='Zombies')return;if(sdGameRuntime?.managedZombies()){if(!sdGameRuntime.aiDisabled())zMove(dt);zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,1));zHud();return}const M=MAPS[sel.map];
 let alive=0;for(const b of bots)if(b.zom&&b.al&&!b.zquestBoss&&!b.zquestAdd)alive++;
 if(!zQuestActive()&&z.st=='prep'){z.tm-=dt;if(z.tm<=0)zNewRound()}
 else if(!zQuestActive()){z.spT-=dt;if(z.toSpawn>0&&z.spT<=0){const room=Math.min(24,6+z.r*2)-alive;if(room>0){const n=Math.min(room,z.toSpawn,2+(z.r>3?1:0)+(z.r>8?1:0));for(let i=0;i<n;i++){const big=z.brutes>0&&(z.toSpawn-i<=z.brutes||Math.random()<.2);if(big)z.brutes--;zSpawn(M,big)}z.toSpawn-=n;z.spT=Math.max(1.2,3.2-z.r*.12)}else z.spT=.4}
  if(z.toSpawn<=0&&alive<=0)zEndRound()}
 z.fl-=dt;if(z.fl<=0&&zgr){z.fl=.35;zfls={};for(const pl of zPlayers())zfls[pl.id]=zFlow(pl)}
 if(!z.main?.fight&&!sdGameRuntime?.aiDisabled())zMove(dt);zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,1));
 if(netOn){zbT+=dt;if(zbT>.1){zbT=0;netSend({t:'zb',bw:z.barricade?.count,brw:z.barricade?.reinforced,bl:(typeof EST!='undefined'&&EST.bx?EST.bx.loc:-1),lo:(typeof lonPack=='function'?lonPack():0),mq:zQuestPack(z.main),jq:jupiterQuestPack(),r:z.r,l:bots.filter(b=>b.zom&&b.al).map(b=>[b.i,+b.x.toFixed(1),+b.z.toFixed(1),b.big?1:0,b.atk?b.atype+1:0,b.tear||0,b.tearY||0,b.crossing||0,b.zquestBoss?[b.tyaw||0,b.rise,b.riseY,b.riseD,b.at,b.atd]:null])})}
  zsT+=dt;if(zsT>.5){zsT=0;netSend({t:'zs',r:z.r,st:z.st,tm:Math.ceil(z.tm),br:z.brutes,rm:z.rm|0})}
  if(!zPlayers().length&&!over){z.ad+=dt;if(z.ad>6)endGame('You reached round '+z.r)}else z.ad=0}
 z.rm=Math.min(999,Math.max(0,(z.hound&&!z.hound.done)?(z.hound.left|0):z.toSpawn+alive));setObjectiveText('');zHud()}
/* lying prone in front of a perk machine pays 100 points, once per machine per match and only to the first player who does it (the host decides in co-op) */
function zProne(){const z=zq;if(!z||P.dead||!ST.prone||!z.mp)return;z.pbq=z.pbq||{};for(const m of z.mp){if(z.pb[m.k]||z.pbq[m.k])continue;const a=FACE[m.f],fx=Math.sin(a),fz=Math.cos(a),dx=P.x-m.x,dz=P.z-m.z,fw=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);
  if(fw>.7&&fw<3.6&&lat<1.8){z.pbq[m.k]=1;if(zCli())netSend({t:'zqp',k:m.k});else zProneGrant(m.k,zMe())}}}
function zProneGrant(k,by){const z=zq,m=z.mp.find(q=>q.k==k);if(!m||z.pb[k])return;z.pb[k]=by;if(by==zMe())zProneGift(k);if(netOn&&isHost)netSend({t:'zpg',k,by})}
/* the classic cash register: a drawer thunk, then two bright bells that ring out */
function zCash(){try{ac=ac||new AudioContext();const t=ac.currentTime,out=ac.createGain();out.gain.value=vol;out.connect(PlayerAudio.output(ac));
 const tn=(ty,f0,f1,t0,d,pk)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t0);if(f1!=f0)o.frequency.exponentialRampToValueAtTime(f1,t0+d);g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(pk,t0+.004);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+d+.02)};
 tn('sine',150,60,t,.09,.22);
 for(const[t0,f]of[[.07,2093],[.2,2794]]){tn('sine',f,f,t+t0,.55,.15);tn('sine',f*2.76,f*2.76,t+t0,.28,.06);tn('triangle',f*1.005,f*1.005,t+t0,.4,.05)}}catch(e){}}
function zProneGift(k){const z=zq;z.pts+=100;zCash();try{if(typeof zGainFx=='function')zGainFx(100)}catch(e){}}
/* guests: the host runs the world, guests move the puppets and handle their own interactions */
function zcTick(dt){const z=zq;if(!z||mode!='Zombies')return;const k=Math.min(1,dt*10);
 for(const b of bots)if(b.zp&&b.al){const ox=b.x,oz=b.z;if(b.rise>0){b.rise-=dt;if(b.zquestBoss)b.m.position.y=b.riseY*Math.max(0,b.rise)/b.riseD;else b.tyaw=b.m.rotation.y;continue}if(b.crossing){lockboxVaultStep(b,Math.min(.999,b.crossing+dt/LOCKBOX_WINDOW.vaultTime));continue}b.x+=(b.tx-b.x)*k;b.z+=(b.tz-b.z)*k;if(b.isKey)b.y=jupiterFloor(b.x,b.z);b.m.position.set(b.x,b.y||0,b.z);if(!b.zquestBoss&&Math.hypot(b.tx-ox,b.tz-oz)>.02)b.tyaw=Math.atan2(b.tx-ox,b.tz-oz);
  if(b.atk){b.at+=dt;if(b.at>=b.atd)b.atk=0}}
 zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,0));zHud()}
function zSync(d){const seen=new Set();for(const[i,x,z,big,ak,tear,tearY,vault,quest]of d.l){seen.add(i);let b=bots.find(q=>q.zp&&q.i==i);if(!b)b=zPuppet(i,x,z,big,d.r);b.tx=x;b.tz=z;b.tear=tear;b.tearY=tearY;if(vault){b.rise=0;lockboxVaultStep(b,b.crossing?Math.max(b.crossing,vault):vault)}else if(b.crossing){b.crossing=0;b.vaultPose=null;b.y=0}if(tear)b.tyaw=0;if(ak&&!b.atk){b.atk=1;b.at=0;b.atd=(ak==5?.8:.65)*(big?1.15:1);b.atype=ak-1}if(quest){[b.tyaw,b.rise,b.riseY,b.riseD,b.at,b.atd]=quest;b.atk=ak>0;b.atype=Math.max(0,ak-1)}}
 for(const b of bots)if(b.zp&&b.al&&!seen.has(b.i)){b.al=0;b.atk=0;zdead.push({b,t:0});ragStart(b,b.x-P.x,b.z-P.z,3)}}
function zInteract(){const z=zq;let best=null,bd=1e9;if(!P.dead&&z.papT<=0){for(const it of zi){const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r&&d<bd&&it.txt()){bd=d;best=it}}
  if(netOn)for(const b of bots)if(b.net&&!b.hb&&!b.al&&b.dn){const d=Math.hypot(P.x-b.x,P.z-b.z);if(d<2.6&&d<bd){bd=d;best={rv:b,txt:()=>PG.t('Hold F to revive '+b.nm),cost:()=>0,act:()=>{}}}}}
 z.cur=best;const e=$('#zp');if(P.dead&&z.down){e.textContent=`DOWN · bleeding out in ${Math.ceil(z.dnT)}s · a teammate can revive you`;e.className='bad';return}
 if(z.papT>0){e.textContent=`Pack-a-Punch · ${z.papT.toFixed(1)}s`;e.className='';return}
 if(best){const c=best.cost();e.textContent=best.rv?best.txt():`[${typeof ctlKey=='function'?ctlKey('use'):'F'}] ${best.txt()}${c?'  ['+c+']':''}`;if(c>z.pts)e.textContent+=' · Need '+(c-z.pts)+' more';e.className=c>z.pts?'bad':''}else{
  const down=netOn&&!P.dead?bots.filter(b=>b.net&&!b.hb&&!b.al&&b.dn):[];
  const distance=b=>Math.hypot(b.x-P.x,b.z-P.z);
  const nearest=down.reduce((a,b)=>!a||distance(b)<distance(a)?b:a,null);
  e.textContent=nearest?'Revive '+nearest.nm+' · '+Math.ceil(distance(nearest))+' m':'';
  e.className=nearest?'bad':'';
 }}
function zUse(){if(!zq||P.dead||over||jovianInputBlocked())return;if(zq.cur)zq.cur.act()}
function zHudInit(){if(!$('#zpus')){const e=document.createElement('div');e.id='zpus';$('#hud').appendChild(e)}if($('#zdash'))return;const d=document.createElement('div');d.id='zdash';d.innerHTML='<svg viewBox="0 0 44 44"><circle class="bg" cx="22" cy="22" r="18"/><circle class="fg" cx="22" cy="22" r="18"/></svg><b>DASH</b><em>AIM</em>';$('#hud').appendChild(d)}
function zHudShow(on){const d=$('#zdash');if(d)d.style.display=on?'block':'none'}
/* what the ammo line shows besides the gun: your melee weapon and, for the Nitrogen Fists, the dash */
function zAmmoX(){if(!zq)return'';const m=zq.mel;return ' · '+(m.pn||m.k)+jupiterFieldStatus()}
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
function zDown(){const z=zq;if(!z)return;jupiterEndField(zMe());P.rt=1e9;const rev=z.perks.rev;z.perks={};P.mhp=window.SD_MOD_SESSION?(modRules.health??50):50;z.cap=2;z.dash.t=0;z.pap=null;z.papT=0;if(wp.length>2){wp.length=2;if(cur>1){cur=1;setGun()}}gun.visible=false;MV.eq=0;
 if(rev){msg('Reviving in 4…',3);setTimeout(()=>{if(run&&mode=='Zombies'&&!over&&P.dead&&!z.out)zRevive()},4000)}
 else if(netOn){z.down=1;z.dnT=45;msg('You are down. Hold on until a teammate revives you',3);netSend({t:'zdn'})}
 else endGame('You reached round '+z.r)}
/* knocked: you lie on the floor (low camera, slow crawl) instead of ragdolling */
function zDownCam(dt){const f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0);if((f||s)&&zq&&!over){const sy=Math.sin(yaw),cy=Math.cos(yaw),n=Math.hypot(f,s)||1;mv(P,(-sy*f+cy*s)/n*1.5*dt,(-cy*f-sy*s)/n*1.5*dt,.4)}
 C.position.set(P.x,.42+Math.sin(t0*2)*.01,P.z);C.rotation.set(Math.max(-.6,Math.min(.4,pitch*.5))-.1,yaw,.18)}
/* every player on their feet sees a marker over a downed teammate */
function zMarkers(){if(!netOn)return;for(const b of bots){if(!b.net||b.hb)continue;const need=!b.al&&b.dn&&!P.dead;if(need&&!b.zmk){b.zmk=zSprite('','#ff5a3a',.8,0);S.add(b.zmk);b.zmt=0}if(!need&&b.zmk){S.remove(b.zmk);b.zmk=null}
  if(b.zmk){b.zmk.position.set(b.x,2.3,b.z);if(t0>b.zmt){b.zmt=t0+.4;zSet(b.zmk,'✚ '+b.nm+' '+Math.round(Math.hypot(P.x-b.x,P.z-b.z))+'m','#ff5a3a')}}}}
function zRevive(){endDeath();P.dead=0;P.hp=P.mhp*.6;P.sh=P.msh;gun.visible=true;rel=0;zq.down=zq.out=0;if(isHost||!netOn)for(const b of bots)if(b.zom&&b.al){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d<7&&d>.01)mv(b,dx/d*(7-d),dz/d*(7-d),.45)}msg('Revived!',2);beep(660,.2,'triangle',.1);sdGameRuntime?.playerSpawn()}
/* a downed or bled-out player returns at the start of the next round with a pistol and bare hands (points are kept) */
function zRespawn(){const z=zq,ps=MAPS[sel.map].ps;endDeath();P.dead=0;z.down=z.out=0;z.perks={};z.cap=2;z.mel={k:'Fists',pap:0};z.dash.cd=0;z.dash.t=0;zPaintHands();P.mhp=50;P.hp=50;P.sh=P.msh;wp=[zGunObj(MAPS[sel.map].starter||'CT')];cur=0;rel=0;gc=Math.max(gc,2);setGun();P.x=ps[0];P.z=ps[1];P.y=0;gun.visible=true;msg('Back in the fight',2);sdGameRuntime?.playerSpawn()}
/* network messages: types starting with z (longer than one letter) are routed here from onMsg */
function zNet(d,cn){const z=zq;if(!z||mode!='Zombies')return;
 switch(d.t){
 case'zjp':case'zjkit':case'zjwin':jupiterQuestNet(d);break;
 case'zmainuse':case'zmaincue':case'zmainnote':case'zmainhit':case'zmainwin':zQuestNet(d,cn);break;
 case'zqh':if(isHost){const b=bots.find(x=>x.zom&&!x.zp&&x.i==d.i&&x.al);if(b)zDamage(b,d.d,d.h,d.id,d.k,d.m)}break;
 case'zqd':if(isHost)zOpenDoor(d.i,d.id);break;
 case'zqp':if(isHost)zProneGrant(d.k,d.id);break;
 case'zpg':if(!isHost&&typeof d.k==='string'&&netPlayerId(d.by)&&z.mp.some(machine=>machine.k===d.k)){
  z.pb[d.k]=d.by;if(d.by===myId)zProneGift(d.k);
 }break;
 case'zqw':if(isHost&&z.barricade)lockboxRepair(bots.find(b=>b.net&&b.al&&b.id==d.id),d.quick===true,d.reinforced===true);break;
 case'zqb':if(isHost&&zboxes[d.i]&&zboxes[d.i].st==0)zBoxStart(zboxes[d.i],d.i,d.id);break;
 case'zqe':if(isHost){const o=zboxes[d.i];if(o&&o.st==2&&o.by==d.id){
  if(o.item==='KEY')z.jupiter?.owners.add(d.id);
  zBoxEnd(o,d.i);
 }}break;
 case'zkpr':if(isHost&&z.jupiter&&netInteger(d.i))jupiterRedeemCompanion(d.id,d.i);break;
 case'zkp':if(!isHost&&z.jupiter&&netPlayerId(d.by)&&netInteger(d.i)&&[d.x,d.z].every(v=>Number.isFinite(v)&&Math.abs(v)<H))jupiterSpawnCompanion(d.by,d.i,d.x,d.z);break;
 case'zkfieldreq':if(isHost)jupiterHostField(d.id);break;
 case'zkfield':if(!isHost&&z.jupiter&&netPlayerId(d.by))jupiterStartField(d.by);break;
 case'zqr':if(isHost){z.revBuys++;zRevCount(z.revBuys);netSend({t:'zrev',n:z.revBuys})}break;
 case'zqv':if(d.to==myId&&P.dead&&z.down)zRevive();break;
 case'zd':if(!isHost){if(d.by==myId&&zdoors[d.i])z.pts-=zdoors[d.i].d.c;zOpenDoor(d.i,d.by)}break;
 case'zbs':if(!isHost){const o=zboxes[d.i];if(!o)break;if(d.st==1){if(d.by==myId)z.pts-=zBoxCost();o.st=1;o.t=0;o.cy=0;o.by=d.by;if(typeof estBoxState=='function')estBoxState(o,1)}else if(d.st==2){o.item=d.item;o.st=2;o.t=0;o.by=d.by;o.beam.visible=o.lab.visible=true;zSet(o.lab,zItemName(d.item),['RG','NF','KEY'].includes(d.item)?'#ff4a4a':'#7bf08a');if(typeof estBoxShow=='function')estBoxShow(o,d.item,1)}else if(d.st==3){o.st=3;o.t=0;zSet(o.lab,'THE BOX IS MOVING!','#ff4a4a');o.beam.visible=o.lab.visible=true;estBoxState(o,0)}else{o.st=0;o.beam.visible=o.lab.visible=false;if(typeof estBoxState=='function')estBoxState(o,0)}}break;
 case'zbl':if(!isHost){estBoxGo(d.i);msg('The Mystery Box has moved',2.8)}break;
 case'zlon':if(isHost&&typeof lonDo=='function')lonDo(d.a);break;
 case'zdn':if(d.id!=myId){const nm=names[d.id]||'A teammate';popup('PLAYER DOWN',nm+' needs a revive!');feed(nm+' is down');beep(260,.25,'sawtooth',.1);setTimeout(()=>beep(200,.3,'sawtooth',.1),220)}break;
 case'zrev':if(!isHost)zRevCount(d.n);break;
 case'zk':if(!isHost&&d.to==myId){zGain(d.pts);zCryptHeal(d.m);if(z.perks.keyring&&netInteger(d.ki))netSend({t:'zkpr',i:d.ki});kills++;wzkill(d.k);killXP(d.h);beep(900,.06,'square',.05)}break;
 case'zb':if(!isHost){if(d.bw!=null)lockboxBoards(d.bw,d.brw);if(d.bl!=null&&d.bl>=0&&typeof EST!='undefined'&&EST.bx&&d.bl!==EST.bx.loc)estBoxGo(d.bl,1);if(typeof lonSync=='function')lonSync(d);zSync(d);zQuestSync(d.mq);jupiterQuestSync(d.jq)}break;
 case'zbt':if(!isHost&&z.barricade)lockboxShockFx();break;
 case'zpu':if(!isHost)zPuSpawn(d.id,d.k,d.x,d.z);break
 case'zpc':if(!isHost){const q=z.drops.find(x=>x.id==d.id);if(q)zPuRemove(q);zPuApply(d.k,d.by)}break
 case'zg':if(!isHost)zGutLaunch(d.x,d.y,d.z,d.vx,d.vy,d.vz,0,0,d.big,1);break
 case'zs':if(!isHost)zRoundSync(d);break}}


/* ---------- FIRE SALE: every Mystery Box location on the map spawns (each one drops in with a flash), and when the sale ends only the box that was there before stays;
   a box that is still spinning when the sale ends finishes its roll first and then disappears. ---------- */
function zFireSaleHide(o){try{burst(V(o.m.x,1,o.m.z),30,0xff4aa0,6,.8,.12);estBoxSet(o,false);o.st=0;o.g.position.y=o.baseY;o.g.rotation.z=0;if(o.beam)o.beam.visible=false;if(o.lab)o.lab.visible=false;if(o.sp)o.sp.I=0}catch(e){}}
function zFireSale(on){if(typeof EST=='undefined'||!EST.bx||zboxes.length<2)return;const B=zboxes;
 if(on){if(EST.bx.fs)return;EST.bx.fs=1;EST.bx.home=EST.bx.loc;B.forEach((o,j)=>{o.fsHide=0;if(!o.on){estBoxSet(o,true);o.drop=1;o.g.position.y=o.baseY+16;burst(V(o.m.x,1.2,o.m.z),34,0xff4aa0,7,.9,.13);burst(V(o.m.x,1.2,o.m.z),14,0xffffff,9,.5,.08)}});
  [880,1100,1320].forEach((f,i)=>setTimeout(()=>beep(f,.12,'triangle',.07),i*90))}
 else{if(!EST.bx.fs)return;EST.bx.fs=0;const h=EST.bx.home;B.forEach((o,j)=>{if(j==h||!o.on)return;if(o.st==0||o.st==3)zFireSaleHide(o);else o.fsHide=1});EST.bx.loc=h>=0?h:EST.bx.loc}}

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
const papMaps={
 'Hollow Estate':{
  style:0,tones:[410,305,177],ratios:[1.7,1.29,1.08],echo:.078,voice:'sine',noise:[4200,510],
  stages:[['Haunted Mahogany',0x351726,0x8c4e37,0xbf65ff],['Gilded Wraith',0x151018,0xdfa840,0x46e4bd],['Void Seraph',0x19121b,0x764133,0xff8c62]]
 },
 London:{
  style:1,tones:[520,672,984],ratios:[2,2.13,2.72],echo:.097,voice:'triangle',noise:[5700,1250],
  stages:[['Foundry Brass',0x28212b,0xbe944b,0xf39244],['Belfry Verdigris',0x123431,0x539a75,0xf6dc8a],['Crown Enamel',0x312245,0x9b79c7,0xffe2a6]]
 },
 [ROOM_CHALLENGE]:{
  style:2,tones:[254,196,331],ratios:[.75,.63,1.75],echo:.037,voice:'sawtooth',noise:[2600,890],
  stages:[['Hazard Plate',0x22281b,0x76874a,0xe5ea64],['Furnace Cast',0x402026,0x9a4f38,0xff8553],['Quench Ceramic',0x26395a,0xb6d4f0,0x72f1fc]]
 },
 [JUPITER_MAP]:{
  style:3,tones:[792,580,467],ratios:[2.41,1.6,2.8],echo:.062,voice:'sine',noise:[7200,1680],
  stages:[['Cloud Runner',0x122d54,0x4f8398,0x83edff],['Io Current',0x46263f,0xd27753,0xffd98e],['Polar Vortex',0x23184a,0x805fd1,0xa1f7f9]]
 }
};
const PAP_MAP_FS=`uniform float t;uniform float tier;uniform float pattern;uniform vec3 shadow;uniform vec3 paint;uniform vec3 energy;
varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){
 vec3 N=normalize(vN),V=normalize(vV),p=vP*vec3(26.0,30.0,34.0);
 float diffuse=.46+.54*max(dot(N,normalize(vec3(.3,.8,.6))),0.0);
 float rim=pow(1.0-max(dot(N,V),0.0),3.4);
 float grain=.5+.5*sin(p.z*2.4+sin(p.x*1.8+p.y)*1.2);
 float body=grain*.22,etch=0.0,phase=0.0;
 if(pattern<1.5){
  vec2 tile=vec2(p.z*.48,p.y*.69+p.x*.5);
  vec2 f=abs(fract(tile+vec2(0.,.5))-.5);
  float curve=abs(length(vec2(f.x*1.4,f.y))-.38);
  etch=1.0-smoothstep(.025,.074,curve);
  if(tier>1.5)etch=max(etch*.71,1.0-smoothstep(.014,.061,abs(f.x-f.y)));
  if(tier>2.5)etch=max(etch,1.0-smoothstep(.032,.068,abs(f.x+f.y-.65)));
  body+=.55*(f.y+.38*f.x);phase=tile.x*.7-tile.y;
 }else if(pattern<2.5){
  float row=p.z*.64-p.y*.31;
  vec2 cell=fract(vec2(row,p.x*.76+p.y*.87));
  float band=step(.59,fract((p.z+p.y*.8)*.22));
  etch=(1.0-smoothstep(.03,.10,min(cell.x,1.0-cell.x)))*step(.15,cell.y);
  if(tier>1.5)etch=max(etch,smoothstep(.88,.98,cell.y)*(1.0-smoothstep(.1,.49,cell.x)));
  if(tier>2.5)etch=max(etch,smoothstep(.79,.95,abs(sin(cell.x*3.14)*sin(cell.y*3.14))));
  body+=.43*mix(band,cell.y,.49);phase=row*.78;
 }else{
  float v=p.z*.72+sin(p.x*.61+p.y*.45+t*.16)*.61+(p.x*.44+p.y*.31)*(tier*.38);
  float curl=sin(v+sin(p.z*.16+p.x*.4)*1.7),whorl=sin(v*1.53+p.y*.77-t*.23);
  etch=smoothstep(.74,.97,whorl);
  if(tier>1.5)etch=max(etch,smoothstep(.9,1.,curl));
  if(tier>2.5)etch=max(etch,smoothstep(.1,.46,curl)*smoothstep(.58,.98,whorl));
  body+=curl*.22+.37;phase=v*.64;
 }
 vec3 base=mix(shadow,paint,clamp(body,.05,.93))*diffuse;
 float pulse=.74+.26*sin(t*(1.25+tier*.52)-phase);
 gl_FragColor=vec4(base+energy*(etch*pulse*(.23+.095*tier)+rim*.31),1.0);
}`;
function papTheme(map=sel.map){
 if(hasOwn(papMaps,map))return papMaps[map];
 const n=Array.from(map||'Zombies').reduce((a,ch)=>(Math.imul(a,31)+ch.charCodeAt(0))>>>0,17),hue=n%360/360;
 const stages=['Etched','Tempered','Charged'].map((name,i)=>{
  const color=(offset,s,l)=>new THREE.Color().setHSL((hue+offset+i*.126)%1,s,l).getHex();
  return [map+' '+name,color(0,.37,.15),color(.13,.5,.44),color(.32,.78,.67)];
 });
 return papMaps[map]={style:1+n%3,tones:[340+n%190,500+n%190,630+n%120],ratios:[1.4,2.4,2.9],
  echo:.048+n%34/1000,voice:'triangle',noise:[5000+n%1900,840+n%440],stages};
}
function zPapMat(t,map=sel.map){
 const tier=cl(t|0,1,3),theme=papTheme(map),[name,shadow,paint,energy]=theme.stages[tier-1],key='pap:'+map+':'+name;
 if(!rfm[key]){
  const uniforms={t:{value:0},k:{value:tier>1?1:0},tier:{value:tier},pattern:{value:theme.style},
   shadow:{value:new THREE.Color(shadow)},paint:{value:new THREE.Color(paint)},energy:{value:new THREE.Color(energy)}};
  rfm[key]=new THREE.ShaderMaterial({uniforms,vertexShader:CAMO_VS,
   fragmentShader:theme.style?PAP_MAP_FS:tier===3?PAP3_FS:PAP_FS});
 }
 return rfm[key];
}
function zPapFinish(t,map=sel.map){return papTheme(map).stages[cl(t|0,1,3)-1][0]}
function zPapAccent(t,map=sel.map){return papTheme(map).stages[cl(t|0,1,3)-1][3]}
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
 if(TSN.fade<.02){if(TSN.root&&TSN.root.visible){TSN.root.visible=false;for(const e of TSN.ar)e.style.opacity=0;for(const[,g]of TSN.gh)g.visible=false}return}
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
function zdTone(f0,f1,d,g,dl,ty){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),o=ac.createOscillator(),gg=ac.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.08,d*.2));gg.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gg);gg.connect(PlayerAudio.output(ac));o.start(t);o.stop(t+d+.05)}catch(e){}}
function zdNoise(d,f0,f1,g,type,q,dl){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=ac.createBufferSource(),f=ac.createBiquadFilter(),gg=ac.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.05,d*.2));gg.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(gg);gg.connect(PlayerAudio.output(ac));s.start(t)}catch(e){}}
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
  const fw2=.55*f;px-=fw[0]*-fw2*.5;pz-=fw[1]*-fw2*.5;vig=zdC(u/3.6,.1,1);gr=zdC(u/3,0,1);bl=zdC((u-1.5)/2.2,0,.7);
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
var HH={mats:null,geo:null,env:0,envT:0,sky:null,fog:null,bolts:[],voice:0,lastBark:0};
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
function hhAnim(b,dt){const u=b.m.userData.hh;if(!u)return;const h=b.hs,s=h.st=='leap'?1:0,ph=h.ph,sp=Math.min(1,Math.hypot((b.x-(b.px==null?b.x:b.px)),(b.z-(b.pz==null?b.z:b.pz)))/Math.max(dt,.001)/9);b.px=b.x;b.pz=b.z;
 u.legs.forEach((l,i)=>{const o=i<2?0:Math.PI*.85,side=i%2?.35:0,a=Math.sin(ph+o+side)*sp;l.up.rotation.x=s?(l.fr?-.9:.9):a*.95;l.lo.rotation.x=s?(l.fr?.7:-.2):Math.max(0,-Math.sin(ph+o+side+.7))*1.25*sp});
 u.body.position.y=s?0:Math.abs(Math.sin(ph))*.07*sp;u.body.rotation.x=s?-.35:Math.sin(ph*2)*.05*sp;u.head.rotation.x=s?.25:Math.sin(ph*2+.6)*.08*sp;h.jawT=(h.jawT||0)-dt;u.jaw.rotation.x=s?.5:h.jawT>0?.7:.18+.15*Math.sin(ph*2)*sp;
 u.tail.rotation.z=Math.sin(t0*14+b.i)*.35;u.tail.rotation.x=-.3+sp*.25;u.flames.forEach((f,i)=>{const k=.85+.3*Math.sin(t0*17+i*1.9+b.i);f.scale.setScalar((i==3?.5:.7)*k);f.material.opacity=.55+.3*k})}
/* ---- death: the hound collapses in a burst of embers ---- */
{const _rs=ragStart;ragStart=function(b){if(b&&b.hound){b.hs.dead=0;burst(V(b.x,.6,b.z),30,0xff7a22,6,.9,.15);burst(V(b.x,.4,b.z),12,0x2a2018,3,1.1,.2);flNoise(.3,1500,200,.12,'lowpass');flTone(110,45,.45,.12,0,'sine');zvSay('rattle',{x:b.x,z:b.z,vp:.6,big:1},Math.hypot(b.x-P.x,b.z-P.z));b.dying=1;b.dyT=0;return}return _rs.apply(this,arguments)}}
function hhDead(b,dt){b.dyT+=dt;const k=Math.min(1,b.dyT/.45),u=b.m.userData.hh;b.m.rotation.z=k*1.45*(b.i%2?1:-1);b.m.position.y=Math.sin(Math.min(1,b.dyT/.2)*Math.PI)*.2;if(u){u.legs.forEach((l,i)=>{l.up.rotation.x=(i%2?.5:-.5)*k;l.lo.rotation.x=.6*k});u.flames.forEach(f=>f.material.opacity=Math.max(0,.8-b.dyT*.8));u.jaw.rotation.x=.6}if(Math.random()<dt*20)burst(V(b.x,.4,b.z),1,0xff7a22,2,.5,.1)}
/* ---- the round: schedule, build-up, spawning, finish ---- */
function hhStartRound(){const z=zq;const n=Math.min(26,6+Math.floor(z.r*.85));z.hound={n,spawned:0,t:0,intro:6.5,done:0,voice:0,left:n,nextT:0,wait:0};z.toSpawn=9999;z.brutes=0;z.nextHound=z.r+6+(Math.random()*3|0);
 HH.envT=1;
 for(const t of[.4,1.9,3.3,4.7]){setTimeout(()=>{if(!zq||!zq.hound||zq.hound.done)return;const a=Math.random()*6.283,d=18+Math.random()*14;hhStrike(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d)},t*1000)}
 for(const t of[1,2.4,3.9,5.2]){setTimeout(()=>{if(zq&&zq.hound&&!zq.hound.done)hhBark(30)},t*1000+300)}}
/* a hound spawn: one of the map's own open spawn points, 12 to 46 metres from the player it is sent after, never outside the arena and never on a blocked cell */
function hhSpot(p){const M=MAPS[sel.map];if(M.entry)return [0,-6];const open=(M.zs||[]).filter(s=>zq.open[s[2]]),pls=zPlayers(),inM=(x,z)=>Math.abs(x)<M.H-2.5&&Math.abs(z)<M.H-2.5;let best=null,bs=-1e9;
 for(let k=0;k<(open.length?open.length:0);k++){const s=open[k],d=Math.hypot(s[0]-p.x,s[1]-p.z);if(d<12||d>46||!inM(s[0],s[1]))continue;let near=1e9;for(const q of pls)near=Math.min(near,Math.hypot(s[0]-q.x,s[1]-q.z));const sc=Math.min(near,30)+Math.random()*14-d*.1;if(sc>bs){bs=sc;best=s}}
 if(!best){for(const s of open)if(inM(s[0],s[1])){best=s;break}}if(!best)return null;
 for(let t=0;t<8;t++){const[x,z]=zFreeSpot(best[0]+(Math.random()-.5)*3,best[1]+(Math.random()-.5)*3);if(inM(x,z)&&NAV.g){const i=Math.floor(x+H),j=Math.floor(z+H);if(i>0&&j>0&&i<NAV.n-1&&j<NAV.n-1&&!NAV.g[j*NAV.n+i])return[x,z]}else if(inM(x,z)&&!NAV.g)return[x,z]}
 return[best[0],best[1]]}
function hhEnv(dt){const z=zq,on=z&&z.hound&&!z.hound.done&&mode=='Zombies';HH.envT=on?1:0;HH.env+=(HH.envT-HH.env)*Math.min(1,dt*(on?.8:.6));const e=HH.env;if(e<.01&&!HH.active)return;HH.active=e>.01;
 try{if(typeof skyM!='undefined'&&skyM&&skyM.material){skyM.material.color.setRGB(1-.45*e,1-.78*e,1-.8*e)}
  if(typeof hemi!='undefined'&&e>.01){hemi.intensity*=(1-.55*e);sun.intensity*=(1-.7*e)}
  const f=S.fog;if(f){if(!HH.fog)HH.fog={far:f.far,near:f.near,c:f.color.getHex()};f.far=HH.fog.far*(1-.6*e);f.near=HH.fog.near*(1-.5*e);f.color.setHex(HH.fog.c).lerp(new THREE.Color(0x3a0c0c),e*.85);if(e<.01){f.far=HH.fog.far;f.near=HH.fog.near;f.color.setHex(HH.fog.c);HH.fog=null}}
  LX.fx.dmg=Math.max(LX.fx.dmg,.1*e)}catch(x){}}
function hhTick(dt){if(sdGameRuntime?.managedZombies())return;for(let i=HH.bolts.length-1;i>=0;i--){const b=HH.bolts[i];b.t-=dt;b.l.material.opacity=Math.max(0,b.t*4)*(Math.random()<.3?.4:1);if(b.t<=0){S.remove(b.l);b.l.geometry.dispose();b.l.material.dispose();HH.bolts.splice(i,1)}}
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
;

/* ######## estate.js ######## */
/* ===================== estate.js ===================== */
/* ---------- The Hollow Estate: an abandoned Victorian mansion for Zombies.
   Nine rooms inside (Foyer, Dining Hall, Parlor, Ballroom, Library, Billiard Room, Kitchen, Study, Conservatory), a front lawn and a back garden with a graveyard and a crypt.
   Everything is hand-built from primitives: thousands of small parts (furniture, books, chandeliers, tombstones...) are baked into a handful of merged meshes per area, so the detail is cheap.
   Animated things (chandeliers, flames, pendulum, fountain, doors, machines, the box, ammo crates, fog, lightning) are live objects ticked from estTick().
   Only the ten or so lights nearest to you are real point lights (a pool that hands lights over smoothly as you walk), the rest are glow sprites. ---------- */
var EST={sd:1,cols:[],dyn:[],spots:[],pool:[],mach:{},fires:[],flames:[],tm:0,lt:{next:9,flash:0},bk:null,pend:[],walls:[],dust:[],lights:null};
var erand=()=>(EST.sd=(EST.sd*16807)%2147483647)/2147483647,eri=(a,b)=>a+erand()*(b-a),epk=a=>a[erand()*a.length|0],esm=u=>{u=u<0?0:u>1?1:u;return u*u*(3-2*u)};

/* ---------- procedural textures (canvas): floors, wallpaper, rugs, paintings, glow ---------- */
var ET={};
function estTx(n){if(ET[n])return ET[n];const t=ESTX[n]();t.wrapS=t.wrapT=THREE.RepeatWrapping;try{t.anisotropy=4}catch(e){}return ET[n]=t}
var eg=(g,fn)=>{g.save();fn();g.restore()};
function eStain(g,w,h,n,a){for(let i=0;i<n;i++){const x=erand()*w,y=erand()*h,r=8+erand()*40,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${a*erand()})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}}
function eCracks(g,w,h,n){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;for(let i=0;i<n;i++){let x=erand()*w,y=erand()*h,a=erand()*6.28;g.beginPath();g.moveTo(x,y);for(let k=0;k<14;k++){a+=(erand()-.5)*1.1;x+=Math.cos(a)*9;y+=Math.sin(a)*9;g.lineTo(x,y)}g.stroke()}}
var ESTX={
 marble:()=>zTex(512,512,(g,w,h)=>{const T=64;for(let j=0;j<8;j++)for(let i=0;i<8;i++){const dk=(i+j)%2;const v=dk?34+erand()*10:205+erand()*24;g.fillStyle=dk?`rgb(${v},${v},${v+4})`:`rgb(${v},${v-6},${v-20})`;g.fillRect(i*T,j*T,T,T);
   g.strokeStyle=dk?'rgba(255,255,255,.1)':'rgba(90,80,70,.28)';g.lineWidth=1.2;for(let k=0;k<3;k++){g.beginPath();let x=i*T+erand()*T,y=j*T;g.moveTo(x,y);for(let s=0;s<6;s++){x+=(erand()-.5)*22;y+=T/6;g.lineTo(x,y)}g.stroke()}}
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=2;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*T,0);g.lineTo(i*T,h);g.moveTo(0,i*T);g.lineTo(w,i*T);g.stroke()}eStain(g,w,h,22,.5);eCracks(g,w,h,5)}),
 parquet:()=>zTex(512,512,(g,w,h)=>{const T=64;for(let j=0;j<8;j++)for(let i=0;i<8;i++){const hz=(i+j)%2,b=[92,58,34];const v=.75+erand()*.5;for(let k=0;k<4;k++){g.fillStyle=`rgb(${b[0]*v|0},${b[1]*v|0},${b[2]*v|0})`;if(hz)g.fillRect(i*T,j*T+k*T/4,T-1,T/4-1);else g.fillRect(i*T+k*T/4,j*T,T/4-1,T-1);
    g.fillStyle='rgba(0,0,0,.18)';if(hz)g.fillRect(i*T+erand()*T,j*T+k*T/4+3,20,1);else g.fillRect(i*T+k*T/4+3,j*T+erand()*T,1,20)}}eStain(g,w,h,34,.45);eCracks(g,w,h,3)}),
 tile:()=>zTex(512,512,(g,w,h)=>{const T=64;for(let j=0;j<8;j++)for(let i=0;i<8;i++){const dk=(i+j)%2,v=dk?70+erand()*14:178+erand()*20;g.fillStyle=dk?`rgb(${v-10},${v+8},${v-6})`:`rgb(${v},${v+4},${v-4})`;g.fillRect(i*T,j*T,T,T)}
  g.strokeStyle='rgba(20,20,20,.55)';g.lineWidth=2;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*T,0);g.lineTo(i*T,h);g.moveTo(0,i*T);g.lineTo(w,i*T);g.stroke()}eStain(g,w,h,40,.6);eCracks(g,w,h,6);g.fillStyle='rgba(90,10,10,.5)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(erand()*w,erand()*h,6+erand()*20,4+erand()*12,erand()*3,0,7);g.fill()}}),
 flag:()=>zTex(512,512,(g,w,h)=>{let y=0;while(y<h){const rh=48+erand()*34;let x=-erand()*60;while(x<w){const rw=70+erand()*70,v=84+erand()*34;g.fillStyle=`rgb(${v},${v},${v+4})`;g.fillRect(x,y,rw,rh);g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=3;g.strokeRect(x,y,rw,rh);x+=rw}y+=rh}eStain(g,w,h,50,.6);eCracks(g,w,h,8);g.fillStyle='rgba(40,70,40,.25)';for(let i=0;i<20;i++)g.fillRect(erand()*w,erand()*h,10+erand()*30,4+erand()*10)}),
 terra:()=>zTex(512,512,(g,w,h)=>{const T=85;for(let j=0;j<7;j++)for(let i=0;i<7;i++){const v=erand();g.fillStyle=`rgb(${150+v*40|0},${78+v*26|0},${48+v*14|0})`;g.fillRect(i*T,j*T,T,T);g.strokeStyle='rgba(20,10,5,.6)';g.lineWidth=3;g.strokeRect(i*T,j*T,T,T)}
  eStain(g,w,h,44,.55);g.fillStyle='rgba(50,90,40,.4)';for(let i=0;i<30;i++)g.fillRect(erand()*w,erand()*h,3+erand()*14,2+erand()*6);eCracks(g,w,h,5)}),
 carpet:()=>zTex(256,256,(g,w,h)=>{g.fillStyle='#5c1a1c';g.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++)eg(g,()=>{g.translate(i*128+64,j*128+64);g.strokeStyle='#b08a3a';g.lineWidth=2;g.beginPath();g.moveTo(0,-44);g.lineTo(44,0);g.lineTo(0,44);g.lineTo(-44,0);g.closePath();g.stroke();g.beginPath();g.arc(0,0,22,0,7);g.stroke();g.fillStyle='#8a2a2a';g.beginPath();g.arc(0,0,9,0,7);g.fill()});
  for(let i=0;i<3000;i++){g.fillStyle=`rgba(${erand()<.5?'0,0,0':'255,200,160'},.05)`;g.fillRect(erand()*w,erand()*h,1.5,1.5)}eStain(g,w,h,10,.5)}),
 wpRed:()=>eWall('#4a1618','#6a2326','#8a5a3a'),wpGreen:()=>eWall('#1d3328','#2a4a38','#8a7a4a'),wpBlue:()=>eWall('#1a2640','#27395c','#9a8a6a'),wpCream:()=>eWall('#6e6652','#857b62','#5a4a32'),
 rugA:()=>eRug('#6a1a1c','#c9a24a','#2a0a0c'),rugB:()=>eRug('#1b2c5a','#d8c08a','#0a1228'),
 web:()=>zTex(128,128,(g,w,h)=>{g.strokeStyle='rgba(235,235,235,.75)';g.lineWidth=1;for(let i=0;i<9;i++){const a=i/8*Math.PI*.5;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*126,Math.sin(a)*126);g.stroke()}for(let r=14;r<126;r+=14+erand()*8){g.beginPath();for(let i=0;i<=8;i++){const a=i/8*Math.PI*.5,k=r*(.86+erand()*.2);g.lineTo(Math.cos(a)*k,Math.sin(a)*k)}g.stroke()}}),
 gold:()=>zTex(64,64,(g,w,h)=>{g.fillStyle='#b8902f';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.fillStyle=`rgba(${erand()<.5?'255,230,150':'60,40,0'},.25)`;g.fillRect(erand()*w,erand()*h,2+erand()*8,1)}})
};
for(let i=0;i<6;i++)ESTX['p'+i]=()=>ePaint(i);
function eWall(a,b,c){return zTex(256,256,(g,w,h)=>{g.fillStyle=a;g.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){g.fillStyle='rgba(255,255,255,.035)';g.fillRect(x,0,14,h)}
 const m=(cx,cy)=>eg(g,()=>{g.translate(cx,cy);g.fillStyle=b;g.beginPath();g.moveTo(0,-34);g.bezierCurveTo(22,-16,22,16,0,34);g.bezierCurveTo(-22,16,-22,-16,0,-34);g.fill();g.fillStyle=c;g.globalAlpha=.5;g.beginPath();g.arc(0,0,6,0,7);g.fill();g.beginPath();g.moveTo(0,-26);g.lineTo(6,-12);g.lineTo(0,-6);g.lineTo(-6,-12);g.closePath();g.fill();g.beginPath();g.moveTo(0,26);g.lineTo(6,12);g.lineTo(0,6);g.lineTo(-6,12);g.closePath();g.fill()});
 for(let i=0;i<2;i++)for(let j=0;j<2;j++){m(i*128+64,j*128+64);m(i*128,j*128+(0))}
 for(let i=0;i<30;i++){const x=erand()*w,y=erand()*h;g.fillStyle=`rgba(${erand()<.5?'0,0,0':'200,190,170'},.1)`;g.fillRect(x,y,2+erand()*20,12+erand()*60)}eStain(g,w,h,12,.5)})}
function eRug(a,b,c){return zTex(256,256,(g,w,h)=>{g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle=a;g.fillRect(10,10,w-20,h-20);g.strokeStyle=b;g.lineWidth=4;g.strokeRect(18,18,w-36,h-36);g.lineWidth=2;g.strokeRect(30,30,w-60,h-60);
 g.translate(w/2,h/2);g.fillStyle=c;g.beginPath();g.moveTo(0,-70);g.lineTo(70,0);g.lineTo(0,70);g.lineTo(-70,0);g.closePath();g.fill();g.strokeStyle=b;g.lineWidth=3;g.stroke();g.fillStyle=b;g.beginPath();g.arc(0,0,26,0,7);g.fill();g.fillStyle=a;g.beginPath();g.arc(0,0,14,0,7);g.fill();
 for(let k=0;k<12;k++){g.save();g.rotate(k*Math.PI/6);g.fillStyle=b;g.fillRect(-2,-110,4,14);g.restore()}g.setTransform(1,0,0,1,0,0);for(let i=0;i<2500;i++){g.fillStyle=`rgba(${erand()<.6?'0,0,0':'255,230,200'},.07)`;g.fillRect(erand()*w,erand()*h,1.5,1.5)}eStain(g,w,h,16,.55)})}
function ePaint(n){return zTex(256,320,(g,w,h)=>{const bg=['#1a1612','#12171c','#1c1418','#14181a','#201a12','#0e1014'][n];g.fillStyle=bg;g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(120,100,70,.25)');gr.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=gr;g.fillRect(0,0,w,h);
 if(n<3||n==5){const sk=['#cdb59a','#b8a090','#c9b8a0'][n%3];g.fillStyle=n==5?'#0c0c10':['#2a2020','#1c2430','#34202a'][n];g.beginPath();g.moveTo(30,h);g.quadraticCurveTo(40,200,100,190);g.lineTo(156,190);g.quadraticCurveTo(216,200,226,h);g.fill();g.fillStyle=sk;g.beginPath();g.ellipse(128,128,38,50,0,0,7);g.fill();g.fillStyle='#1a1210';g.fillRect(100,176,56,16);
  g.fillStyle='rgba(0,0,0,.75)';g.beginPath();g.ellipse(112,122,9,6,0,0,7);g.ellipse(144,122,9,6,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(128,150,10,5,0,0,7);g.fill();g.fillStyle=n==1?'#cfcfd4':'#2a1a10';g.beginPath();g.ellipse(128,86,42,26,0,Math.PI,0);g.fill();
  if(n==5){g.fillStyle='rgba(255,40,40,.9)';g.beginPath();g.arc(112,122,3,0,7);g.arc(144,122,3,0,7);g.fill()}}
 else if(n==3){g.fillStyle='#e8dcb0';g.beginPath();g.arc(180,70,28,0,7);g.fill();g.fillStyle='#10161c';g.beginPath();g.moveTo(0,240);g.quadraticCurveTo(80,170,150,220);g.quadraticCurveTo(210,190,256,230);g.lineTo(256,h);g.lineTo(0,h);g.fill();g.strokeStyle='#05080a';g.lineWidth=5;g.beginPath();g.moveTo(60,260);g.lineTo(60,190);g.moveTo(60,210);g.lineTo(84,186);g.moveTo(60,226);g.lineTo(36,204);g.stroke()}
 else{g.fillStyle='#3a1a14';g.beginPath();g.ellipse(128,230,70,16,0,0,7);g.fill();g.fillStyle='#8a2a1a';for(let i=0;i<5;i++){g.beginPath();g.arc(88+i*20,208-(i%2)*10,12,0,7);g.fill()}g.fillStyle='#3a5a2a';g.beginPath();g.ellipse(160,200,22,10,.5,0,7);g.fill();g.fillStyle='#c8b070';g.fillRect(60,140,8,70);g.fillRect(52,134,24,8)}
 eStain(g,w,h,14,.7);for(let i=0;i<5;i++){g.strokeStyle='rgba(220,210,190,.18)';g.beginPath();g.moveTo(erand()*w,erand()*h);g.lineTo(erand()*w,erand()*h);g.stroke()}})}

/* ---------- materials for baked geometry (vertex coloured so thousands of parts share a handful of materials) ---------- */
var EMC={};
function eMat(cls){if(EMC[cls])return EMC[cls];const R={s:[.92,0],w:[.52,0],m:[.42,.85],g:[.26,1],f:[1,0],c:[.7,.02],gl:[.06,.1],r:[.95,0]}[cls]||[.9,0];let m;
 if(cls=='e')m=new THREE.MeshBasicMaterial({vertexColors:true});
 else if(!LX.pbr)m=new THREE.MeshLambertMaterial({vertexColors:true});
 else m=LX.patch(new THREE.MeshStandardMaterial({vertexColors:true,roughness:R[0],metalness:R[1],envMapIntensity:cls=='m'||cls=='g'?1.35:.7}),{});
 if(cls=='gl'){m.transparent=true;m.opacity=.3;m.depthWrite=false}return EMC[cls]=m}
var ETM={};
function eTexMat(n){if(ETM[n])return ETM[n];const t=estTx(n);let m;
 if(!LX.pbr)m=new THREE.MeshLambertMaterial({map:t,vertexColors:true});else m=LX.patch(new THREE.MeshStandardMaterial({map:t,vertexColors:true,roughness:n=='gold'?.3:.9,metalness:n=='gold'?.9:0,envMapIntensity:.6}),{});
 if(n=='web'){m.transparent=true;m.depthWrite=false;m.side=THREE.DoubleSide}return ETM[n]=m}

/* ---------- the baker: primitives are transformed into world space and merged per area and material ---------- */
var GB=new THREE.BoxGeometry(1,1,1),GP=new THREE.PlaneGeometry(1,1),GCY={},GSP={},GTO={};
var gCy=(rt,rb,seg)=>{const k=rt.toFixed(3)+'_'+rb.toFixed(3)+'_'+seg;return GCY[k]||(GCY[k]=new THREE.CylinderGeometry(rt,rb,1,seg,1))};
var gSp=seg=>GSP[seg]||(GSP[seg]=new THREE.SphereGeometry(1,seg,Math.max(4,seg*.7|0)));
var gTo=(r,seg)=>{const k=r.toFixed(3)+'_'+seg;return GTO[k]||(GTO[k]=new THREE.TorusGeometry(1,r,6,seg))};
function mkBake(random=erand){const acc={},st=[new THREE.Matrix4()],yw=[0],tmp=new THREE.Vector3(),nm=new THREE.Matrix3(),col=new THREE.Color(),Q=new THREE.Quaternion(),E=new THREE.Euler(),Pv=new THREE.Vector3(),Sv=new THREE.Vector3();
 const mat=(x,y,z,sx,sy,sz,rx,ry,rz)=>{E.set(rx||0,ry||0,rz||0,'YXZ');Q.setFromEuler(E);Pv.set(x,y,z);Sv.set(sx,sy,sz);return new THREE.Matrix4().compose(Pv,Q,Sv)};
 const B={area:'x',acc,
  push(x,y,z,ry,rx,rz){const m=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ'));m.setPosition(x,y,z);st.push(st[st.length-1].clone().multiply(m));yw.push((yw[yw.length-1]||0)+(ry||0))},pop(){if(st.length>1){st.pop();yw.pop()}},
  at(x,y,z,ry,fn,rx,rz){B.push(x,y,z,ry,rx,rz);try{fn()}finally{B.pop()}},yaw(){return yw[yw.length-1]||0},
  geo(g,lm,c,cls,tex,su,sv){const key=B.area+'|'+(tex||cls);let a=acc[key];if(!a)a=acc[key]={cls,tex,p:[],n:[],c:[],u:[],i:[]};
   const m=st[st.length-1].clone().multiply(lm);nm.getNormalMatrix(m);const pos=g.attributes.position,nor=g.attributes.normal,uv=g.attributes.uv,base=a.p.length/3;col.set(c);const tn=1+(random()-.5)*.1,r=col.r*tn,gg=col.g*tn,b=col.b*tn;
   for(let i=0;i<pos.count;i++){tmp.fromBufferAttribute(pos,i).applyMatrix4(m);a.p.push(tmp.x,tmp.y,tmp.z);tmp.fromBufferAttribute(nor,i).applyMatrix3(nm).normalize();a.n.push(tmp.x,tmp.y,tmp.z);a.c.push(r,gg,b);a.u.push(uv?uv.getX(i)*(su||1):0,uv?uv.getY(i)*(sv||1):0)}
   const ix=g.index;if(ix)for(let i=0;i<ix.count;i++)a.i.push(base+ix.getX(i));else for(let i=0;i<pos.count;i++)a.i.push(base+i)},
  /* centre-positioned box */
  box(x,y,z,w,h,d,c,cls,ry,rx,rz){B.geo(GB,mat(x,y,z,w,h,d,rx,ry,rz),c,cls||'s')},
  /* box standing on y0 */
  bot(x,y0,z,w,h,d,c,cls,ry){B.geo(GB,mat(x,y0+h/2,z,w,h,d,0,ry,0),c,cls||'s')},
  cyl(x,y0,z,rt,rb,h,c,cls,seg,rx,ry,rz){const mx=Math.max(rt,rb,1e-4);B.geo(gCy(rt/mx,rb/mx,seg||10),mat(x,y0+h/2,z,mx,h,mx,rx,ry,rz),c,cls||'s')},
  /* cylinder between two points (beams, pipes, branches) */
  rod(x0,y0,z0,x1,y1,z1,r0,r1,c,cls,seg){const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz)||1e-3,ry=Math.atan2(dx,dz),rx=Math.acos(dy/L);const mx=Math.max(r0,r1,1e-4);B.geo(gCy(r1/mx,r0/mx,seg||6),mat((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,mx,L,mx,rx,ry,0),c,cls||'w')},
  sph(x,y,z,a,b,d,c,cls,seg){B.geo(gSp(seg||8),mat(x,y,z,a,b,d),c,cls||'s')},
  tor(x,y,z,R,t,c,cls,rx,ry,rz,seg){B.geo(gTo(t/R,seg||14),mat(x,y,z,R,R,R,rx,ry,rz),c,cls||'m')},
  lathe(x,y0,z,pts,c,cls,seg,ry){const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||12);B.geo(g,mat(x,y0,z,1,1,1,0,ry,0),c,cls||'s');g.dispose()},
  ext(shape,depth,x,y,z,c,cls,rx,ry,rz){const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:8});g.translate(0,0,-depth/2);B.geo(g,mat(x,y,z,1,1,1,rx,ry,rz),c,cls||'s');g.dispose()},
  quad(x,y,z,w,h,c,cls,rx,ry,tex,su,sv){B.geo(GP,mat(x,y,z,w,h,1,rx,ry,0),c,cls||'s',tex,su,sv)},
  /* collision footprint of the current local rectangle (rotations are multiples of 90 degrees), added to the map as an invisible solid */
  solid(lx,lz,w,d,h,y0){const m=st[st.length-1],xs=[],zs=[];for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){tmp.set(lx+a*w/2,0,lz+b*d/2).applyMatrix4(m);xs.push(tmp.x);zs.push(tmp.z)}
   const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);EST.cols.push([(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,h,y0||0,0,'n']);return[x0,z0,x1,z1]},
  where(lx,lz){tmp.set(lx,0,lz).applyMatrix4(st[st.length-1]);return[tmp.x,tmp.z]},
  build(g){const out=[];for(const k in acc){const a=acc[k];if(!a.p.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(a.c,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(a.u,2));geo.setIndex(new THREE.BufferAttribute(new Uint32Array(a.i),1));
    const m=new THREE.Mesh(geo,a.tex?eTexMat(a.tex):eMat(a.cls));m.castShadow=m.receiveShadow=a.cls!='e'&&a.cls!='gl'&&!a.tex||a.cls=='r';if(a.cls=='e'||a.cls=='gl'||a.tex=='web'){m.castShadow=false;m.receiveShadow=false}g.add(m);out.push(m)}return out}};
 return B}


/* ---------- glow points (flames, halos), light spots and the live decoration list ---------- */
var EC={wood:0x4a2f1c,dwood:0x2c1b10,lwood:0x6d4a2b,brass:0xb08a3a,iron:0x24262a,stone:0x7a766c,dstone:0x4d4a44,marble:0xcfc8b8,candle:0xe6d9b0,cloth:0xcfc4aa,rust:0x5a3a28,bone:0xd8d0b8,moss:0x35452a,red:0x6a1c24,green:0x2a4632,blue:0x23365a,gold:0xc9a23a,velvet:0x4a1220,black:0x101114};
function eSpot(x,y,z,col,I,dist,fl,ph){EST.spots.push({x,y,z,col,I,d:dist,fl:fl==null?1:fl,ph:ph==null?erand()*50:ph,cur:0,want:0,L:null})}
function ePt(sys,x,y,z,r,g,b,fl){const s=EST.pts?.[sys];if(!s)return;s.p.push(x,y,z);s.c.push(r,g,b);s.f.push(fl==null?1:fl,erand()*50);s.base.push(r,g,b)}
function eFlame(x,y,z,k,light){/* a candle-sized flame: glow + soft halo (+ optionally a real light that is handed over by the pool) */
 ePt('f',x,y,z,1,.62,.26,1);ePt('h',x,y+.05,z,.2*(k||1),.1*(k||1),.04*(k||1),1);if(light)eSpot(x,y+.2,z,0xffa958,light[0],light[1],1)}
function eBig(x,y,z,k,light){/* big fire: fireplace, brazier, torch */
 ePt('F',x,y,z,1,.55,.2,1);ePt('F',x+(erand()-.5)*.2,y+.15,z+(erand()-.5)*.2,1,.7,.3,1);ePt('H',x,y+.3,z,.35*(k||1),.16*(k||1),.05*(k||1),1);EST.fires.push({x,y,z});if(light)eSpot(x,y+.4,z,0xff8a3a,light[0],light[1],1)}
function eHalo(x,y,z,r,g,b,sys){ePt(sys||'H',x,y,z,r,g,b,0)}
function eGlass(x,y,z,w,h,rx,ry,col,o){/* an additive glow quad (moonlight patches, window glow) */const m=new THREE.Mesh(GP,new THREE.MeshBasicMaterial({map:LX.effectTextures().glow,color:col,transparent:true,opacity:o||.3,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.scale.set(w,h,1);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);EST.pend.push(m);return m}

/* ---------- furniture. Local origin = the middle of the base, the front faces +z ---------- */
var FUR={
 chair(c,tilt){c=c||EC.wood;BK.bot(0,.43,0,.5,.07,.5,c,'w');BK.bot(0,.5,.01,.42,.06,.42,EC.red,'f');for(const[x,z]of[[-.21,-.21],[.21,-.21],[-.21,.21],[.21,.21]])BK.cyl(x,0,z,.03,.024,.43,c,'w',6);
  for(const x of[-.21,.21])BK.cyl(x,.5,-.23,.026,.026,.62,c,'w',6);BK.bot(0,.98,-.23,.46,.1,.05,c,'w');for(let i=0;i<3;i++)BK.bot(-.12+i*.12,.58,-.23,.045,.4,.03,c,'w');BK.solid(0,0,.5,.5,.9)},
 stool(c){c=c||EC.wood;BK.cyl(0,.4,0,.2,.2,.07,c,'w',10);BK.sph(0,.46,0,.18,.05,.18,EC.red,'f');for(const a of[0,2.1,4.2])BK.rod(Math.cos(a)*.16,0,Math.sin(a)*.16,Math.cos(a)*.1,.4,Math.sin(a)*.1,.025,.02,c,'w');BK.solid(0,0,.4,.4,.5)},
 table(w,d,h,c,cloth){c=c||EC.wood;BK.bot(0,h-.07,0,w,.07,d,c,'w');BK.bot(0,h-.0,0,w+.04,.012,d+.04,EC.lwood,'w');for(const s of[-1,1]){BK.bot(0,h-.2,s*(d/2-.07),w-.2,.13,.04,c,'w');BK.bot(s*(w/2-.07),h-.2,0,.04,.13,d-.2,c,'w')}
  for(const sx of[-1,1])for(const sz of[-1,1])BK.lathe(sx*(w/2-.09),0,sz*(d/2-.09),[[.05,0],[.06,.04],[.035,.3],[.055,h*.55],[.035,h*.7],[.05,h-.2]],c,'w',8);
  if(cloth){BK.bot(0,h+.012,0,w+.1,.016,d+.1,cloth,'f');for(let i=0;i<7;i++){const L=.25+erand()*.45;BK.bot(-w/2-.05+(i+.5)*(w+.1)/7,h-L,d/2+.05,(w+.1)/7-.01,L,.016,cloth,'f')}for(let i=0;i<4;i++){const L=.2+erand()*.4;BK.bot(-w/2-.05,h-L,-d/2-.05+(i+.5)*(d+.1)/4,.016,L,(d+.1)/4-.01,cloth,'f')}}BK.solid(0,0,w,d,h)},
 couch(w,c){c=c||EC.red;const n=Math.max(2,Math.round(w/.8)),cw=(w-.5)/n;BK.bot(0,.12,0,w,.28,.9,EC.dwood,'w');for(let i=0;i<n;i++){BK.bot(-w/2+.25+(i+.5)*cw,.38,.06,cw-.02,.16,.74,c,'f');BK.sph(-w/2+.25+(i+.5)*cw,.57,-.3,cw*.5,.18,.12,c,'f',7)}
  BK.bot(0,.28,-.38,w,.55,.18,c,'f');BK.sph(0,.84,-.38,w*.5,.07,.12,c,'f',8);for(const s of[-1,1]){BK.bot(s*(w/2-.12),.28,0,.24,.34,.9,c,'f');BK.sph(s*(w/2-.12),.62,.05,.13,.1,.4,c,'f',7);BK.sph(s*(w/2-.12),.42,.45,.12,.12,.12,c,'f',7)}
  for(const sx of[-1,1])for(const sz of[-1,1])BK.cyl(sx*(w/2-.08),0,sz*.38,.04,.025,.1,EC.dwood,'w',6);BK.solid(0,0,w,.95,.9)},
 armchair(c){FUR.couch(1.0,c||EC.green)},
 bed(c){BK.bot(0,.25,0,1.6,.35,2.1,EC.dwood,'w');BK.bot(0,.5,.05,1.5,.2,2.0,EC.cloth,'f');BK.bot(0,.4,-1.05,1.65,1.2,.1,EC.wood,'w');BK.solid(0,0,1.7,2.2,.8)},
 bookcase(w,h,rot){w=w||1.4;h=h||2.4;const d=.38;BK.bot(0,0,0,w,h,.04,EC.dwood,'w');for(const s of[-1,1])BK.bot(s*(w/2-.02),0,d/2-.02,.04,h,d,EC.wood,'w');BK.bot(0,h-.04,d/2-.02,w,.07,d,EC.wood,'w');BK.bot(0,0,d/2-.02,w,.12,d,EC.wood,'w');BK.bot(0,h,d/2-.02,w+.06,.06,d+.06,EC.dwood,'w');
  const cols=[0x5a2a1e,0x7a3a22,0x2a3a5a,0x2a4a32,0x1c1c20,0x6a5a2a,0x4a2a3a,0x8a7a5a,0x3a2a1a],rows=Math.floor((h-.15)/.38);
  for(let r=0;r<rows;r++){const y=.14+r*.38;BK.bot(0,y,d/2-.02,w-.06,.025,d-.04,EC.wood,'w');let x=-w/2+.06;while(x<w/2-.08){if(erand()<.08){x+=.1+erand()*.2;continue}const bw=.025+erand()*.04,bh=.22+erand()*.12,tl=erand()<.06?(erand()-.5)*.5:0;BK.bot(x+bw/2,y+.025,d/2,bw,bh,.24,epk(cols),'f',0);if(tl)BK.box(x+bw/2,y+.025+bh/2,d/2,bw,bh,.24,epk(cols),'f',0,0,tl);x+=bw+.002}}
  BK.solid(0,d/2-.02,w,d,h)},
 wardrobe(){BK.bot(0,0,0,1.3,2.2,.6,EC.wood,'w');BK.bot(0,.05,.31,.6,2.0,.03,EC.dwood,'w');BK.bot(.33,.05,.31,.6,2.0,.03,EC.dwood,'w');BK.sph(-.05,1.1,.34,.03,.03,.03,EC.brass,'g',6);BK.sph(.05,1.1,.34,.03,.03,.03,EC.brass,'g',6);BK.bot(0,2.2,0,1.4,.12,.7,EC.dwood,'w');BK.solid(0,0,1.4,.7,2.3)},
 crate(s){s=s||.8;BK.bot(0,0,0,s,s,s,EC.lwood,'w');for(const y of[.04,s-.1])BK.bot(0,y,0,s+.04,.07,s+.04,EC.wood,'w');for(const x of[-1,1])BK.bot(x*(s/2),0,0,.06,s,s+.02,EC.wood,'w');BK.solid(0,0,s,s,s)},
 barrel(){BK.lathe(0,0,0,[[.3,0],[.36,.1],[.4,.45],[.36,.82],[.3,.9]],EC.wood,'w',12);for(const y of[.14,.44,.76])BK.tor(0,y,0,y==.44?.405:.35,.018,EC.iron,'m',Math.PI/2,0,0,12);BK.solid(0,0,.8,.8,.9)},
 sack(){BK.sph(0,.28,0,.3,.3,.26,0x8a7a58,'f',8);BK.sph(0,.55,0,.12,.1,.1,0x8a7a58,'f',6);BK.solid(0,0,.6,.55,.55)},
 urn(c){BK.lathe(0,0,0,[[.12,0],[.2,.08],[.26,.3],[.18,.52],[.12,.6],[.16,.68]],c||EC.marble,'s',10);BK.tor(.26,.28,0,.02,.04,c||EC.marble,'s',0,0,0);BK.solid(0,0,.5,.5,.7)},
 vase(c){BK.lathe(0,0,0,[[.06,0],[.11,.1],[.14,.28],[.08,.5],[.06,.62],[.1,.72]],c||0x2a4a6a,'c',10)},
 rubble(r){r=r||1;for(let i=0;i<7;i++){const a=erand()*6.28,d=erand()*r*.6;BK.sph(Math.cos(a)*d,.12*erand(),Math.sin(a)*d,.18+erand()*.28,.12+erand()*.18,.16+erand()*.26,erand()<.5?EC.dstone:0x6a5a4a,'s',5)}BK.solid(0,0,r*1.3,r*1.3,.55)},
 beam(len,ry){BK.rod(-len/2,.5+erand()*.6,0,len/2,.1,0,.14,.13,EC.dwood,'w',5)},
 candelabra(h,n,light){h=h||1.3;n=n||5;BK.lathe(0,0,0,[[.16,0],[.18,.03],[.06,.08],[.04,.5],[.07,h*.7],[.03,h*.85]],EC.brass,'g',10);const y=h*.78;
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2,r=n>1?.2:0,x=Math.cos(a)*r,z=Math.sin(a)*r;BK.rod(0,y-.05,0,x,y+.05,z,.012,.01,EC.brass,'g',5);BK.cyl(x,y+.05,z,.03,.03,.04,EC.brass,'g',6);const ch=.1+erand()*.12;BK.cyl(x,y+.09,z,.016,.018,ch,EC.candle,'c',6);const w=BK.where(x,y+.09+ch+.03);eFlame(w[0],w[1],w[2],1,i==0&&light?light:null)}
  BK.solid(0,0,.4,.4,h)},
 candles(n){for(let i=0;i<(n||4);i++){const x=(erand()-.5)*.5,z=(erand()-.5)*.5,h=.06+erand()*.2;BK.cyl(x,0,z,.02,.022,h,EC.candle,'c',6);BK.sph(x,h*.5,z,.03,h*.3,.03,EC.candle,'c',5);const w=BK.where(x,h+.04);eFlame(w[0],w[1]-.02,w[2],.7)}},
 skull(){BK.sph(0,.08,0,.08,.075,.09,EC.bone,'s',7);BK.box(0,.03,.03,.07,.04,.06,EC.bone,'s');BK.sph(-.03,.09,.07,.02,.025,.02,0x080808,'s',5);BK.sph(.03,.09,.07,.02,.025,.02,0x080808,'s',5)},
 bones(){for(let i=0;i<5;i++)BK.rod((erand()-.5)*.5,.03,(erand()-.5)*.5,(erand()-.5)*.5,.04,(erand()-.5)*.5,.018,.018,EC.bone,'s',5);for(let i=0;i<3;i++)BK.at((erand()-.5)*.4,0,(erand()-.5)*.4,erand()*6,()=>FUR.skull())},
 web(s,ry){BK.quad(0,0,0,s,s,0xffffff,'s',0,ry||0,'web',1,1)},
 painting(w,h,tex,ry){const f=.09;BK.at(0,0,0,ry||0,()=>{BK.box(0,0,-.02,w+.2,h+.2,.05,0x241a10,'w');BK.quad(0,0,.01,w,h,0xffffff,'s',0,0,'p'+tex,1,1);for(const[x,y,a,b]of[[0,h/2+f/2,w+.2,f],[0,-h/2-f/2,w+.2,f],[-w/2-f/2,0,f,h+.2],[w/2+f/2,0,f,h+.2]])BK.box(x,y,.01,a,b,.08,EC.gold,'g');
   BK.box(0,h/2+.2,.04,.5,.07,.07,EC.brass,'g');BK.sph(0,h/2+.2,.1,.09,.09,.05,EC.brass,'g',5)})},
 mirror(w,h,ry){BK.at(0,0,0,ry||0,()=>{BK.box(0,0,-.02,w+.3,h+.3,.06,EC.gold,'g');BK.box(0,0,.02,w,h,.02,0x7c8a94,'g');for(let i=0;i<3;i++)BK.rod((erand()-.5)*w,h/2*(erand()-.5)*2,.04,(erand()-.5)*w,h/2*(erand()-.5)*2,.04,.003,.003,0x0a0a0a,'s')})},
 armor(ry){BK.at(0,0,0,ry||0,()=>{BK.bot(0,0,0,.7,.14,.7,EC.dstone,'s');for(const x of[-.11,.11]){BK.bot(x,.14,0,.14,.06,.28,0x4a4c52,'m');BK.cyl(x,.2,-.02,.065,.075,.4,0x6a6c72,'m',8);BK.sph(x,.62,0,.09,.09,.09,0x7a7c82,'m',7);BK.cyl(x,.64,-.02,.08,.07,.42,0x6a6c72,'m',8)}BK.cyl(0,1.05,0,.2,.15,.1,0x5a5c62,'m',8);BK.lathe(0,1.12,0,[[.14,0],[.27,.15],[.28,.38],[.2,.55],[.1,.62]],0x7a7c82,'m',10);BK.box(0,1.45,.2,.28,.12,.04,0x5a5c62,'m');
   for(const s of[-1,1]){BK.sph(s*.34,1.62,0,.12,.1,.12,0x8a8c92,'m',7);BK.rod(s*.38,1.6,0,s*.4,1.15,.15,.06,.05,0x6a6c72,'m');BK.sph(s*.4,1.1,.17,.06,.06,.06,0x50525a,'m',6)}
   BK.cyl(0,1.74,0,.08,.1,.1,0x6a6c72,'m',8);BK.sph(0,1.92,0,.15,.17,.16,0x8a8c92,'m',9);BK.box(0,1.92,.14,.2,.025,.04,0x050505,'s');BK.rod(0,2.05,-.02,0,2.2,-.12,.03,.01,EC.red,'f',5);BK.rod(.42,.1,.15,.42,2.4,.15,.02,.02,0x4a3a28,'w',5);BK.ext(eShape([[0,0],[.08,.2],[0,.45],[-.08,.2]]),.025,.42,2.5,.15,0x9a9ca2,'m');BK.solid(0,0,.7,.7,2.3)})},
 statue(kind,ry){BK.at(0,0,0,ry||0,()=>{const c=EC.marble;BK.bot(0,0,0,1.0,.18,1.0,EC.dstone,'s');BK.bot(0,.18,0,.8,.7,.8,0x8a867a,'s');BK.bot(0,.88,0,.9,.08,.9,EC.dstone,'s');
   BK.lathe(0,.96,0,[[.28,0],[.3,.2],[.22,.7],[.18,.9],[.1,1.0],[.07,1.1]],c,'s',12);BK.sph(0,2.12,.0,.13,.16,.14,c,'s',9);BK.sph(0,2.2,-.02,.14,.1,.15,c,'s',8);
   if(kind=='angel'){for(const s of[-1,1]){BK.ext(eShape([[0,0],[.5,.5],[.95,1.2],[.9,1.7],[.55,1.35],[.3,.8],[.08,.4]].map(p=>[p[0]*s,p[1]])),.04,s*.05,1.2,-.22,c,'s',0,s*.5,0)}BK.rod(.14,1.8,.05,.3,1.5,.35,.05,.04,c,'s');BK.rod(-.14,1.8,.05,-.2,1.9,.35,.05,.04,c,'s')}
   else{BK.rod(.2,1.8,0,.28,1.35,.2,.055,.045,c,'s');BK.rod(-.2,1.8,0,-.28,1.35,.2,.055,.045,c,'s');BK.sph(0,1.5,.27,.12,.12,.12,c,'s',7)}
   BK.sph(.25,.92,.3,.12,.07,.1,0x4a5a34,'s',6);BK.solid(0,0,1,1,2.4)})},
 clock(ry){BK.at(0,0,0,ry||0,()=>{BK.bot(0,0,0,.6,.22,.4,EC.dwood,'w');BK.bot(0,.22,0,.46,1.4,.32,EC.wood,'w');BK.bot(0,1.62,0,.58,.62,.36,EC.dwood,'w');BK.cyl(0,1.9,.19,.22,.22,.02,0xdcd2b0,'s',16,Math.PI/2);BK.tor(0,1.9,.2,.22,.02,EC.brass,'g',0,0,0,16);BK.box(0,1.9,.2,.015,.15,.01,0x101010,'s');BK.box(.05,1.9,.2,.1,.012,.01,0x101010,'s',0,0,.6);
   BK.bot(0,2.24,0,.64,.1,.4,EC.wood,'w');BK.sph(0,2.4,0,.1,.1,.1,EC.brass,'g',7);BK.bot(0,.5,.17,.3,.9,.02,0x2a1c10,'gl');BK.solid(0,0,.6,.4,2.5);const w=BK.where(0,.62),yw=BK.yaw();EST.pendulum=EST.pendulum||[];EST.pendulum.push({x:w[0],y:w[1]+.9,z:w[2],yaw:yw})})},
 fireplace(f){/* facing +z, against the wall at z=-.45 */BK.bot(0,0,0,2.6,.14,1.0,EC.dstone,'s');for(const s of[-1,1]){BK.bot(s*1.0,.14,-.25,.45,1.5,.45,EC.stone,'s');BK.bot(s*1.0,.14,-.0,.52,.12,.12,EC.dstone,'s');BK.sph(s*1.0,1.68,-.02,.3,.1,.3,EC.stone,'s',6)}
  BK.bot(0,1.55,-.25,2.6,.2,.5,EC.stone,'s');BK.bot(0,1.75,-.28,2.9,.1,.58,EC.dstone,'s');BK.bot(0,1.85,-.35,1.8,2.2,.3,EC.stone,'s');BK.bot(0,.14,-.4,1.6,1.4,.1,0x0e0c0a,'s');BK.bot(0,.14,-.32,1.6,.05,.4,EC.iron,'m');
  for(let i=0;i<3;i++)BK.cyl(-.4+i*.4,.22+(i%2)*.1,-.12,.07,.06,.8,0x2a1a10,'w',6,0,0,Math.PI/2);BK.rod(-.7,.14,.02,-.7,.7,.02,.025,.025,EC.iron,'m');BK.rod(.7,.14,.02,.7,.7,.02,.025,.025,EC.iron,'m');
  BK.at(.8,1.95,-.1,0,()=>FUR.candles(3));BK.at(-.8,1.95,-.1,.5,()=>FUR.skull());BK.solid(0,-.2,2.9,1.2,1.9);const w=BK.where(0,.3);eBig(w[0],w[1],w[2],1.4,[2.4,15])},
 piano(){const sh=new THREE.Shape();sh.moveTo(-.7,-1);sh.lineTo(.7,-1);sh.lineTo(.7,.2);sh.bezierCurveTo(.72,.8,.3,1.15,-.2,1.1);sh.bezierCurveTo(-.5,1,-.7,.8,-.7,.4);sh.lineTo(-.7,-1);BK.ext(sh,.2,0,.88,0,EC.black,'g',-Math.PI/2,0,0);
  const sh2=new THREE.Shape();sh2.moveTo(-.66,-.4);sh2.lineTo(.66,-.4);sh2.lineTo(.66,.2);sh2.bezierCurveTo(.68,.76,.3,1.08,-.2,1.04);sh2.bezierCurveTo(-.46,.95,-.66,.78,-.66,.4);sh2.lineTo(-.66,-.4);BK.ext(sh2,.025,0,1.0,0,0x16161a,'g',-Math.PI/2,0,0);BK.rod(.55,1.0,.05,.55,1.28,.05,.012,.012,EC.black,'g');
  BK.bot(0,.9,1.01,1.3,.1,.14,0xeae2cc,'s');for(let i=0;i<26;i++){BK.bot(-.62+i*.0485,.83,1.02,.044,.06,.2,0xeae2cc,'s');if(i%7!=2&&i%7!=6)BK.bot(-.62+i*.0485+.024,.88,.98,.025,.04,.12,0x101010,'s')}
  BK.bot(0,1.0,.72,1.46,.02,.4,0x0a0a0c,'s');BK.rod(0,1.0,.9,0,1.34,.9,.02,.02,EC.black,'g');BK.bot(0,1.14,.9,.5,.3,.03,EC.black,'g');
  for(const[x,z]of[[-.62,.9],[.62,.9],[0,-.9]])BK.lathe(x,0,z,[[.06,0],[.09,.05],[.05,.2],[.07,.6],[.05,.84]],EC.black,'g',8);BK.rod(0,.1,.9,0,.16,.7,.015,.015,EC.brass,'g');BK.sph(-.1,.12,.75,.04,.02,.05,EC.brass,'g',5);BK.sph(.1,.12,.75,.04,.02,.05,EC.brass,'g',5);
  BK.at(0,0,1.9,0,()=>{BK.cyl(0,.4,0,.22,.22,.07,EC.black,'g',10);BK.sph(0,.45,0,.2,.05,.2,EC.velvet,'f',8);for(const[x,z]of[[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]])BK.cyl(x,0,z,.025,.018,.4,EC.black,'g',5)});BK.solid(0,-.1,1.5,2.4,1.0)},
 desk(){FUR.table(1.9,.9,.78,EC.dwood);BK.bot(-.55,.78,.1,.5,.05,.35,0xdad2b8,'s');BK.bot(.5,.78,-.2,.04,.18,.04,EC.brass,'g');BK.bot(.6,.78,.1,.18,.2,.1,0x3a2a18,'f');for(const s of[-1,1])BK.bot(s*.65,.12,0,.5,.55,.7,EC.dwood,'w');FUR.candles(2)},
 billiard(){const L=3.0,W=1.7;BK.bot(0,.74,0,L,.2,W,EC.dwood,'w');BK.bot(0,.93,0,L-.3,.03,W-.3,0x1f5a34,'f');for(const s of[-1,1]){BK.bot(0,.93,s*(W/2-.075),L,.1,.15,EC.wood,'w');BK.bot(s*(L/2-.075),.93,0,.15,.1,W-.3,EC.wood,'w')}
  for(const x of[-1,0,1])for(const z of[-1,1])BK.sph(x*(L/2-.1),.95,z*(W/2-.1),.075,.04,.075,0x050505,'s',6);for(const sx of[-1,1])for(const sz of[-1,1])BK.lathe(sx*(L/2-.2),0,sz*(W/2-.2),[[.11,0],[.15,.08],[.09,.3],[.13,.6],[.17,.74]],EC.dwood,'w',8);
  const cs=[0xe8e0d0,0xd8b020,0x2040c0,0xc02020,0x602090,0xe07020,0x208040,0x601818,0x101010];for(let i=0;i<9;i++)BK.sph(-.6+(i%4)*.11+(i>3?.05:0),.99,(i>3?(i-4)*.11-.2:i*.11-.17),.028,.028,.028,cs[i],'g',6);BK.sph(.9,.99,.1,.028,.028,.028,0xf4f0e0,'g',6);
  BK.rod(1.1,.99,.6,1.6,1.22,.95,.012,.009,0x8a6a3a,'w',5);BK.solid(0,0,L+.2,W+.2,.95)},
 grandChandelierFallen(){BK.tor(0,.35,0,.9,.06,EC.brass,'g',.5,0,.3,14);BK.tor(0,.55,0,.5,.04,EC.brass,'g',.5,0,.3,12);for(let i=0;i<8;i++){const a=i/8*6.28;BK.rod(Math.cos(a)*.9,.3+Math.sin(a)*.2,Math.sin(a)*.9,Math.cos(a)*.9,.6+Math.sin(a)*.2,Math.sin(a)*.9,.012,.012,EC.candle,'c')}for(let i=0;i<24;i++)BK.sph((erand()-.5)*2.4,.04,(erand()-.5)*2.4,.04,.07,.04,0xcfe6f0,'gl',5);BK.rod(0,.4,0,3,2.8,-1,.03,.03,EC.iron,'m');BK.solid(0,0,2.0,2.0,.7)},
 tomb(k,ry){BK.at(0,0,0,ry||0,()=>{const c=epk([0x6e6a62,0x5e5a54,0x7a766c,0x56524c]);BK.bot(0,0,0,.9,.1,.5,EC.dstone,'s');
   if(k==0){BK.bot(0,.1,0,.7,.9,.16,c,'s');BK.cyl(0,.9,0,.35,.35,.16,c,'s',10,Math.PI/2);BK.box(0,.65,.09,.3,.02,.02,0x2a2a28,'s');BK.box(0,.55,.09,.4,.02,.02,0x2a2a28,'s')}
   else if(k==1){BK.bot(0,.1,0,.18,1.3,.14,c,'s');BK.bot(0,.85,0,.7,.16,.14,c,'s')}
   else if(k==2){BK.bot(0,.1,0,.46,.3,.46,c,'s');BK.cyl(0,.4,0,.17,.2,1.2,c,'s',4,0,.78);BK.sph(0,1.65,0,.12,.14,.12,c,'s',6)}
   else{BK.bot(0,.1,0,.8,.55,.2,c,'s');BK.bot(0,.65,0,.62,.14,.2,c,'s');BK.bot(0,.79,0,.4,.12,.2,c,'s')}
   if(erand()<.5)BK.box((erand()-.5)*.4,.015,.45,.5,.03,.6,EC.moss,'f',erand());BK.solid(0,0,.9,.5,k==2?1.6:1)})},
 tree(h){h=h||5+erand()*3;BK.cyl(0,0,0,.14,.4,h*.55,0x2c241c,'w',7);BK.cyl(0,h*.55-.05,0,.1,.14,h*.45,0x2c241c,'w',6);for(let i=0;i<6;i++){const a=i/6*6.28+erand(),y=h*(.5+erand()*.45),L=1.2+erand()*2.2,x=Math.cos(a)*L,z=Math.sin(a)*L,y1=y+.4+erand()*1.4;BK.rod(0,y,0,x,y1,z,.07,.025,0x2c241c,'w',5);for(let k=0;k<2;k++){const b=a+(k?.7:-.7)*erand();BK.rod(x*.6,y+(y1-y)*.6,z*.6,x*.6+Math.cos(b)*L*.5,y1+.5,z*.6+Math.sin(b)*L*.5,.03,.01,0x2c241c,'w',4)}}
  for(let i=0;i<3;i++)BK.rod(0,.1,0,Math.cos(i*2.1)*.7,0,Math.sin(i*2.1)*.7,.12,.03,0x2c241c,'w',5);BK.solid(0,0,.7,.7,3)},
 hedge(w,d,h){h=h||2.9;BK.bot(0,0,0,w,h-.4,d,0x1e3a22,'f');const n=Math.round(w*d/1.2);for(let i=0;i<n;i++)BK.sph((erand()-.5)*w,h-.4+(erand()-.5)*.3,(erand()-.5)*d,.5+erand()*.4,.4,.5+erand()*.4,erand()<.3?0x274a2a:0x1e3a22,'f',6);BK.solid(0,0,w,d,h)},
 lamppost(){BK.lathe(0,0,0,[[.16,0],[.12,.2],[.06,.5],[.05,2.8],[.08,2.95]],EC.iron,'m',8);BK.cyl(0,3,0,.2,.12,.08,EC.iron,'m',6);for(const[x,z]of[[-.15,-.15],[.15,-.15],[-.15,.15],[.15,.15]])BK.cyl(x,3.08,z,.012,.012,.5,EC.iron,'m',4);BK.box(0,3.35,0,.3,.34,.3,0xffd9a0,'e');BK.cyl(0,3.6,0,.02,.26,.2,EC.iron,'m',4);const w=BK.where(0,3.35);eHalo(w[0],w[1],w[2],.5,.34,.14,'H');eSpot(w[0],w[1]-.2,w[2],0xffb870,1.3,16,.8);BK.solid(0,0,.35,.35,3)},
 brazier(){BK.lathe(0,0,0,[[.08,0],[.1,.5],[.3,.8],[.34,.9]],EC.iron,'m',8);for(const a of[0,2.1,4.2])BK.rod(Math.cos(a)*.3,0,Math.sin(a)*.3,Math.cos(a)*.1,.55,Math.sin(a)*.1,.03,.025,EC.iron,'m',5);BK.cyl(0,.84,0,.3,.28,.08,0x2a1008,'s',8);const w=BK.where(0,.95);eBig(w[0],w[1],w[2],1,[1.6,13]);BK.solid(0,0,.7,.7,1)},
 sconce(ry){BK.at(0,0,0,ry||0,()=>{BK.box(0,0,0,.14,.3,.04,EC.brass,'g');BK.rod(0,-.05,.02,0,-.02,.18,.015,.012,EC.brass,'g');BK.cyl(0,-.04,.18,.04,.03,.05,EC.brass,'g',6);BK.cyl(0,-.0,.18,.02,.02,.14,EC.candle,'c',6);const w=BK.where(0,.1,.18);eFlame(w[0],w[1],w[2],1.2,[.9,10])})},
 curtain(w,h,c,ry){BK.at(0,0,0,ry||0,()=>{BK.rod(-w/2-.1,h+.05,0,w/2+.1,h+.05,0,.025,.025,EC.brass,'g');const n=Math.round(w/.22);for(let i=0;i<n;i++){const x=-w/2+(i+.5)*w/n,L=h*(.8+erand()*.2),z=Math.sin(i*1.7)*.06;BK.bot(x,h-L,z,w/n+.01,L,.04,c,'f',0)}})},
 stairs(x0,z0,x1,z1,dir,steps,rise){/* a stair block between two corners, rising towards +x ('e') or -x ('w'); solid, with carpet, balustrade and newels */
  const n=steps||12,rs=rise||.3,sx=(x1-x0)/n,L=z1-z0,cx=(x0+x1)/2,zc=(z0+z1)/2;
  for(let i=0;i<n;i++){const xi=dir=='e'?x0+(i+.5)*sx:x1-(i+.5)*sx,hh=(i+1)*rs;BK.bot(xi,0,zc,sx+.01,hh,L,0x5e584e,'s');BK.bot(xi,hh-.02,zc,sx+.03,.06,L+.06,0x726b60,'s');BK.bot(xi,hh+.04,zc,sx-.04,.02,Math.min(2.6,L*.55),0x5a1a1e,'f')}
  const zr=z1+.04,lo=dir=='e'?x0:x1,hi=dir=='e'?x1:x0;for(let i=0;i<=n;i++){const xi=lo+(hi-lo)*i/n;BK.cyl(xi,i*rs+.04,zr,.022,.022,.9,EC.dwood,'w',6)}
  BK.rod(lo,1.0,zr,hi,n*rs+1.0,zr,.045,.045,EC.dwood,'w',6);for(const[nx,h]of[[lo,0],[hi,n*rs]]){BK.lathe(nx,h,zr,[[.07,0],[.09,.12],[.06,.3],[.07,1.0],[.1,1.05],[.05,1.15]],EC.dwood,'w',8);BK.sph(nx,h+1.2,zr,.08,.08,.08,EC.brass,'g',6)}
  BK.solid(cx,zc,x1-x0,L,n*rs+.3)},
 fountain(){BK.lathe(0,0,0,[[2.6,0],[2.7,.2],[2.6,.7],[2.4,.78],[2.3,.7],[2.3,.2],[0,.2]],EC.dstone,'s',20);BK.cyl(0,.2,0,2.3,2.3,.4,0x1c2e30,'gl',20);BK.lathe(0,0,0,[[.4,.2],[.5,.4],[.3,1.0],[.34,1.4],[1.0,1.5],[1.2,1.65],[.2,1.7]],EC.stone,'s',14);BK.lathe(0,1.6,0,[[.2,0],[.12,.6],[.4,.8],[.46,.9],[.1,.95]],EC.stone,'s',12);BK.cyl(0,2.4,0,.08,.04,.5,EC.stone,'s',6);BK.sph(0,2.95,0,.14,.14,.14,EC.stone,'s',7);BK.solid(0,0,5.2,5.2,1.0)}
};
function eShape(pts){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s}


/* ---------- the plan: nine rooms in a 3x3 grid, a front lawn to the south, a back garden (with the crypt) to the north ---------- */
var ERM={foyer:[-16,14,16,32],dining:[-42,14,-16,32],parlor:[16,14,42,32],ball:[-16,-6,16,14],lib:[-42,-6,-16,14],bill:[16,-6,42,14],kit:[-42,-24,-16,-6],study:[16,-24,42,-6],cons:[-16,-24,16,-6],crypt:[22,-50,46,-37]};
var eInn=k=>{const r=ERM[k],ex=k=='crypt';return[r[0]+(r[0]==-42||ex?.6:.45),r[1]+(r[1]==-24||ex?.6:.45),r[2]-(r[2]==42||ex?.6:.45),r[3]-(r[3]==32||ex?.6:.45)]};
var eRoomAt=(x,z)=>{if(typeof sel!='undefined'&&sel.map=='London')return typeof lonIn=='function'&&lonIn(x,z)?'in':null;for(const k in ERM){const r=ERM[k];if(x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])return k}return null};
var EWP={foyer:'wpRed',dining:'wpGreen',parlor:'wpBlue',ball:'wpCream',lib:'wpGreen',bill:'wpRed',kit:'wpCream',study:'wpBlue'};
var EFL={foyer:['marble',8],dining:['parquet',8],parlor:['carpet',4],ball:['parquet',8],lib:['parquet',8],bill:['carpet',4],kit:['tile',8],study:['carpet',4],cons:['terra',6],crypt:['flag',8]};

/* ---------- the map ---------- */
MAPS['Hollow Estate']={d:'Zombies map: the Hollow Estate, an abandoned Victorian mansion with nine rooms, a front lawn, a back garden with a graveyard and a crypt. Locked doors, perk machines, mystery boxes, wall weapons, ammo crates and Pack-a-Punch',zm:1,H:56,sky:0x141a24,gr:0x1e2a1c,bc:0x5e584e,ps:[0,29.5],skyk:'night',hemi:.62,hemiC:0x8aa0d0,hemiG:0x1a2030,sunI:.3,sunC:0x9fb4ff,fogF:80,gt:'grass',
 outdoor:[[-53,-53,53,-24.6],[-53,32.6,53,53]],links:[[3,5],[3,6],[4,8],[7,8]],lights:[],
 zs:[[-11,22,0],[11,22,0],[-12,29,0],[12,29,0],[-37,18,1],[-21,18,1],[-37,29,1],[-22,26,1],[37,18,2],[21,18,2],[37,29,2],[22,26,2],[-11,9,3],[11,9,3],[-11,-1,3],[11,-1,3],
  [-37,-20,4],[-21,-20,4],[-37,-10,4],[-22,-12,4],[-37,10,5],[-21,10,5],[-37,-1,5],[-21,-2,5],[37,10,6],[21,10,6],[37,-1,6],[21,-2,6],[37,-20,7],[21,-20,7],[37,-10,7],[24,-12,7],[-11,-20,8],[11,-20,8],[-11,-10,8],[11,-10,8],
  [-46,-30,9],[46,-30,9],[0,-48,9],[-30,-49,9],[20,-30,9],[-18,-30,9],[10,-44,9],[30,-45,10],[38,-45,10],[30,-41,10],[38,-41,10],[-44,44,11],[44,44,11],[-22,49,11],[22,49,11],[0,48,11]],
 dr:[{x:-16,z:23,w:.5,d:3.6,c:750,a:0,b:1,n:'Dining Hall',s:'wood'},{x:16,z:23,w:.5,d:3.6,c:750,a:0,b:2,n:'Parlor',s:'wood'},{x:0,z:14,w:4.6,d:.5,c:1250,a:0,b:3,n:'Ballroom',s:'wood'},
  {x:-29,z:14,w:3.6,d:.5,c:1000,a:1,b:5,n:'Library',s:'wood'},{x:29,z:14,w:3.6,d:.5,c:1000,a:2,b:6,n:'Billiard Room',s:'wood'},{x:-29,z:-6,w:3.6,d:.5,c:1250,a:5,b:4,n:'Kitchen',s:'wood'},{x:29,z:-6,w:3.6,d:.5,c:1250,a:6,b:7,n:'Study',s:'wood'},
  {x:0,z:-6,w:4.6,d:.5,c:1750,a:3,b:8,n:'Conservatory',s:'wood'},{x:0,z:32,w:6.2,d:.6,c:2000,a:0,b:11,n:'Front Gate',s:'iron'},{x:0,z:-24,w:5.2,d:.6,c:2250,a:8,b:9,n:'Garden',s:'glass'},
  {x:-29,z:-24,w:3.4,d:.6,c:2000,a:4,b:9,n:'Back Door',s:'wood'},{x:34,z:-37,w:3.6,d:.7,c:2500,a:9,b:10,n:'Crypt',s:'stone'}],
 mc:[{t:'rev',x:-12.2,z:30.85,f:'n'},{t:'vit',x:18.8,z:30.85,f:'n'},{t:'dbl',x:-15.0,z:9.5,f:'e'},{t:'mule',x:-17.1,z:10,f:'w'},{t:'spd',x:-17.1,z:-9.8,f:'w'},
  {t:'crypt',x:44.9,z:-39.2,f:'w'},{t:'pap',x:34,z:-48.7,f:'s'},
  {t:'box',x:-36.2,z:15.0,f:'s'},{t:'box',x:21,z:15.0,f:'s'},{t:'box',x:10,z:-25.4,f:'n'},
  {t:'wall',k:'MP',x:-15.5,z:28.3,f:'e'},{t:'wall',k:'SG',x:-41.35,z:28.5,f:'e'},{t:'wall',k:'SMG',x:41.35,z:28.5,f:'w'},
  {t:'wall',k:'TRB',x:-41.35,z:10.5,f:'e'},{t:'wall',k:'MVR',x:-36.5,z:-23.35,f:'s'},{t:'wall',k:'KT',x:37.5,z:-6.5,f:'n'},
  {t:'wall',k:'SN',x:41.35,z:-20,f:'w'},{t:'wall',k:'CY',x:-9,z:-6.5,f:'n'},{t:'wall',k:'VA',x:-4.5,z:14.49,f:'s'},
  {t:'wall',k:'SW',x:-9.1,z:14.49,f:'s'},{t:'wall',k:'LT',x:41.35,z:19.6,f:'w'},
  {t:'ammo',x:-8,z:30.95,f:'n'},{t:'ammo',x:-40.9,z:18,f:'e'},{t:'ammo',x:15.1,z:9.5,f:'w'},{t:'ammo',x:-39.5,z:-22.9,f:'s'},{t:'ammo',x:17.0,z:-9.5,f:'e'},{t:'ammo',x:40.9,z:10,f:'w'},{t:'ammo',x:-10,z:-25.3,f:'n'},{t:'ammo',x:45.0,z:-44,f:'w'}],
 b(){return estBuild()}};
var _EM=MAPS['Hollow Estate'];_EM.post=g=>estPost(g);

function estBuild(){const M=MAPS['Hollow Estate'],a=[];M._v=[];EST.sd=11;EST.cols=[];EST.dyn=[];EST.spots=[];EST.pend=[];EST.fires=[];EST.mach={};EST.pendulum=[];EST.walls=[];EST.holes=[];
 EST.pts={f:{p:[],c:[],f:[],base:[],size:.34},h:{p:[],c:[],f:[],base:[],size:1.7},F:{p:[],c:[],f:[],base:[],size:.9},H:{p:[],c:[],f:[],base:[],size:3.4},s:{p:[],c:[],f:[],base:[],size:2.4}};
 const B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]);BK=EST.bk=mkBake();
 /* ---- structure ---- */
 const wallRun=(ax,c,a0,a1,t,h,ops,ex,col)=>{ops=ops.slice().sort((p,q)=>p[0]-q[0]);col=col||(ex?0x5b4e47:0x756a5e);const kind=ex?'brick':'stucco';
  const piece=(s,e,y0,y1)=>{if(e-s<.04)return;const len=e-s,mid=(s+e)/2;ax=='x'?B(mid,c,len,t,y1,y0,col,kind):B(c,mid,t,len,y1,y0,col,kind)};
  const nrm=(mid,side)=>ax=='x'?[mid,c+side*(t/2+.9)]:[c+side*(t/2+.9),mid];
  const dress=(s,e,y0,y1,full)=>{/* wallpaper + wainscot on both faces of a plain stretch */if(e-s<.1)return;const mid=(s+e)/2,len=e-s;for(const side of[-1,1]){const[px,pz]=nrm(mid,side),rk=eRoomAt(px,pz);if(!rk)continue;BK.area=rk;const wp=EWP[rk];const off=t/2+.012,ry=ax=='x'?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2),X=ax=='x'?mid:c+side*off,Z=ax=='x'?c+side*off:mid;
    const lo=Math.max(y0,rk=='kit'?1.5:1.3),hi=Math.min(y1,5.5);if(wp&&hi>lo)BK.quad(X,(lo+hi)/2,Z,len,hi-lo,0xffffff,'s',0,ry,wp,len/4,(hi-lo)/4);
    if(y0<.5){const px2=ax=='x'?mid:c+side*(t/2+.03),pz2=ax=='x'?c+side*(t/2+.03):mid,wd=rk=='kit'?0x8a8478:EC.dwood;BK.box(px2,.65,pz2,ax=='x'?len:.06,1.3,ax=='x'?.06:len,wd,rk=='kit'?'s':'w');const rl=.08,pr=t/2+.05;BK.box(ax=='x'?mid:c+side*pr,1.32,ax=='x'?c+side*pr:mid,ax=='x'?len:.1,rl,ax=='x'?.1:len,EC.wood,'w');BK.box(ax=='x'?mid:c+side*pr,.1,ax=='x'?c+side*pr:mid,ax=='x'?len:.1,.2,ax=='x'?.1:len,0x1e140c,'w');
     if(y1>5)BK.box(ax=='x'?mid:c+side*pr,5.4,ax=='x'?c+side*pr:mid,ax=='x'?len:.14,.22,ax=='x'?.14:len,EC.wood,'w')}}};
  const frame=(p,w,top)=>{for(const side of[-1,1]){const[px,pz]=nrm(p,side),rk=eRoomAt(px,pz);BK.area=rk||'x';const pr=t/2+.05;for(const s of[-1,1]){BK.box(ax=='x'?p+s*(w/2+.1):c+side*pr,top/2,ax=='x'?c+side*pr:p+s*(w/2+.1),ax=='x'?.2:.14,top,ax=='x'?.14:.2,EC.dwood,'w')}BK.box(ax=='x'?p:c+side*pr,top+.08,ax=='x'?c+side*pr:p,ax=='x'?w+.5:.16,.2,ax=='x'?.16:w+.5,EC.dwood,'w')}};
  const win=(p,w)=>{/* a boarded-up window: frame, sill, planks with moonlight leaking between them */for(const side of[-1,1]){const[px,pz]=nrm(p,side),rk=eRoomAt(px,pz);BK.area=rk||'x';const pr=t/2+.03,X=ax=='x'?p:c+side*pr,Z=ax=='x'?c+side*pr:p;
    BK.box(X,1.05,Z,ax=='x'?w+.3:.2,.1,ax=='x'?.2:w+.3,EC.dstone,'s');BK.box(X,3.5,Z,ax=='x'?w+.3:.18,.1,ax=='x'?.18:w+.3,EC.dstone,'s');for(const s of[-1,1])BK.box(ax=='x'?p+s*(w/2+.04):X,2.28,ax=='x'?Z:p+s*(w/2+.04),ax=='x'?.1:.14,2.5,ax=='x'?.14:.1,EC.dwood,'w');
    const ry=ax=='x'?(side>0?0:Math.PI):(side>0?Math.PI/2:-Math.PI/2);for(let i=0;i<5;i++){const y=1.25+i*.44+erand()*.05,tl=(erand()-.5)*.1;BK.box(ax=='x'?p+(erand()-.5)*.08:X+side*.02,y,ax=='x'?Z+side*.02:p+(erand()-.5)*.08,ax=='x'?w+.1:.06,.2,ax=='x'?.06:w+.1,epk([0x3a2a1c,0x4a3822,0x2e2216]),'w',0,0,ax=='x'?tl:0)}
    BK.quad(ax=='x'?p:c+side*(t/2-.1),2.28,ax=='x'?c+side*(t/2-.1):p,w,2.3,0x7c93c4,'e',0,ry)}};
  let cur=a0;for(const[p,w,ty]of ops){const s=p-w/2,e=p+w/2;dress(cur,s,0,h);piece(cur,s,0,h);const top=ty=='a'?3.9:ty=='D'?4.7:3.5;piece(s,e,top,h);dress(s,e,top,h);
   if(ty=='w'){piece(s,e,0,1.05);dress(s,e,0,1.05);ax=='x'?B(p,c,w,t*.5,3.5,1.05,0,'n'):B(c,p,t*.5,w,3.5,1.05,0,'n');win(p,w)}else frame(p,w,ty=='D'?4.4:ty=='a'?3.9:3.5);cur=e}
  piece(cur,a1,0,h);dress(cur,a1,0,h)};
 /* exterior walls (8.4 high) */
 const XH=8.4;
 wallRun('x',-24,-42,-16,1.2,XH,[[-37,2.2,'w'],[-29,3.4,'d'],[-22,2.2,'w']],1);wallRun('x',-24,16,42,1.2,XH,[[22,2.2,'w'],[29,2.2,'w'],[36,2.2,'w']],1);
 wallRun('x',32,-42,-8,1.2,XH,[[-37,2.2,'w'],[-29,2.2,'w'],[-22,2.2,'w'],[-13,2.2,'w']],1);wallRun('x',32,8,42,1.2,XH,[[13,2.2,'w'],[22,2.2,'w'],[29,2.2,'w'],[37,2.2,'w']],1);wallRun('x',32,-8,8,1.2,XH,[[0,6.2,'D']],1);
 wallRun('z',-42,-24,32,1.2,XH,[[-17,2.2,'w'],[-11,2.2,'w'],[-2,2.2,'w'],[6,2.2,'w'],[19,2.2,'w'],[26,2.2,'w']],1);wallRun('z',42,-24,32,1.2,XH,[[-17,2.2,'w'],[-11,2.2,'w'],[-2,2.2,'w'],[6,2.2,'w'],[19,2.2,'w'],[26,2.2,'w']],1);
 /* interior walls (5.6 high) */
 const IH=5.6;wallRun('z',-16,-24,32,.9,IH,[[-15,3.4,'a'],[4,3.4,'a'],[23,3.6,'d']]);wallRun('z',16,-24,32,.9,IH,[[-15,3.4,'a'],[4,3.4,'a'],[23,3.6,'d']]);
 wallRun('x',-6,-42,42,.9,IH,[[-29,3.6,'d'],[0,4.6,'d'],[29,3.6,'d']]);wallRun('x',14,-42,42,.9,IH,[[-29,3.6,'d'],[0,4.6,'d'],[29,3.6,'d']]);
 /* the conservatory's north side is glass in an iron frame with the garden door in the middle; its piers are brick */
 {BK.area='cons';const gz=-24,x0=-16,x1=16;for(const[s,e]of[[x0,-2.6],[2.6,x1]]){B((s+e)/2,gz,e-s,.5,4.2,0,0x6a8aa0,'glass');B((s+e)/2,gz,e-s,.5,XH,4.2,0x5b4e47,'brick')}
  for(let x=x0;x<=x1;x+=2.4){if(Math.abs(x)<2.7)continue;BK.box(x,2.1,gz-.1,.12,4.2,.14,EC.iron,'m')}BK.box(-9.3,4.2,gz-.1,13.4,.14,.16,EC.iron,'m');BK.box(9.3,4.2,gz-.1,13.4,.14,.16,EC.iron,'m');BK.box(-9.3,2.1,gz-.1,13.4,.1,.12,EC.iron,'m');BK.box(9.3,2.1,gz-.1,13.4,.1,.12,EC.iron,'m');
  for(const s of[-1,1]){BK.box(s*2.6,2.4,gz-.1,.26,4.8,.3,EC.iron,'m');BK.at(s*2.6,4.8,gz-.1,0,()=>{BK.tor(0,.1,0,.2,.03,EC.iron,'m',0,0,0,8)})}BK.rod(-2.6,4.7,gz-.1,0,5.6,gz-.1,.07,.07,EC.iron,'m');BK.rod(2.6,4.7,gz-.1,0,5.6,gz-.1,.07,.07,EC.iron,'m');B(0,gz,5.2,.5,XH,5.7,0x5b4e47,'brick')}
 /* garden and lawn boundary: stone walls with iron spikes, closed off at the manor corners */
 const PW=(x,z,w,d)=>{B(x,z,w,d,3.4,0,0x5a544c,'brick');B(x,z,w,d,14,3.4,0,'n')};
 PW(0,-52,106,1.4);PW(0,52,106,1.4);PW(-52,0,1.4,106);PW(52,0,1.4,106);for(const s of[-1,1]){PW(s*47.5,-24,10,1.4);PW(s*47.5,32,10,1.4)}
 estOuter();
 /* ---- crypt ---- */
 {const r=ERM.crypt;wallRun('x',r[1],r[0],r[2],1.2,6.4,[],1,0x4c4a46);wallRun('x',r[3],r[0],r[2],1.2,6.4,[[34,3.6,'d']],1,0x4c4a46);wallRun('z',r[0],r[1],r[3],1.2,6.4,[],1,0x4c4a46);wallRun('z',r[2],r[1],r[3],1.2,6.4,[],1,0x4c4a46)}
 for(const k in ERM){BK.area=k;estRoom(k)}
 BK.area='x';estGarden();estLawn();
 for(const c of EST.cols)a.push(c);
 return a}
var BK=null;


/* ---------- exterior: cornice, plinth, pilasters, slate roofs, gables, chimneys, clock tower, front portico, gate pillars ---------- */
function estOuter(){BK.area='roof';const brick=0x5b4e47,slate=0x262a32;
 /* plinth, belt course and cornice around the whole manor, pilasters at the corners */
 for(const[x,z,w,d]of[[0,-24.7,85.4,.4],[0,32.7,85.4,.4],[-42.7,4,.4,57.4],[42.7,4,.4,57.4]]){BK.bot(x,0,z,w,.9,d,0x4a4440,'s');BK.bot(x,4.2,z,w+(w>d?.1:.28),.28,d+(d>w?.1:.28),0x4a4440,'s');BK.bot(x,XH0,z,w+(w>d?.2:.7),.5,d+(d>w?.2:.7),0x4a4440,'s')}
 for(const x of[-42,-28,-16,16,28,42])for(const z of[-24.65,32.65])BK.bot(x,0,z,1.1,8.4,.5,0x544a44,'s');for(const z of[-24,-8,8,22,32])for(const x of[-42.65,42.65])BK.bot(x,0,z,.5,8.4,1.1,0x544a44,'s');
 /* slate roofs: a tall central ridge flanked by two lower wings, gables at both ends */
 const slab=(cx,cy,cz,w,d,rz,col)=>BK.box(cx,cy,cz,w,.3,d,col||slate,'s',0,0,rz);
 const rs=(x,ridge,run,len,zc)=>{const rz=Math.atan2(ridge-XH0,run),W=Math.hypot(run,ridge-XH0);slab(x-run/2,(ridge+XH0)/2+.15,zc,W,len,rz);slab(x+run/2,(ridge+XH0)/2+.15,zc,W,len,-rz);BK.rod(x,ridge+.2,zc-len/2,x,ridge+.2,zc+len/2,.18,.18,0x1c1f26,'m',6)};
 rs(0,12.4,17,57.2,4);rs(-29,11,14.2,57.2,4);rs(29,11,14.2,57.2,4);
 for(const s of[-1,1]){const z=s>0?32.2:-24.2;const tri=eShape([[-17,0],[17,0],[0,4]]);BK.ext(tri,1.0,0,XH0+.25,z,brick,'s');BK.box(0,XH0+1.7,z+s*.55,1.4,1.8,.1,0xffe6a0,'e')}
 /* chimneys with smoke */
 for(const[x,z]of[[-34,-10],[34,-10],[-34,20],[34,20],[0,-2]]){BK.bot(x,10.2,z,1.7,4.2,1.7,0x6a4a3e,'s');BK.bot(x,14.4,z,2.1,.35,2.1,0x4a403a,'s');for(let i=0;i<4;i++)BK.bot(x-.6+(i%2)*1.2,14.75,z-.6+(i>>1)*1.2,.35,.55,.35,0x4a403a,'s');for(let q=0;q<6;q++){EST.pts.s.p.push(x,14.9,z);EST.pts.s.c.push(.5,.5,.55);EST.pts.s.f.push(1,q*1.7+erand());EST.pts.s.base.push(.5,.5,.55)}}
 /* clock tower over the front door */
 BK.bot(0,XH0,28,8,9,7,brick,'s');BK.bot(0,XH0+9,28,8.8,.5,7.8,0x4a4440,'s');for(const s of[-1,1]){BK.cyl(s*3.6,XH0+9.5,28+s*3.2,.5,.5,.2,0x4a4440,'s',4)}
 for(const s of[-1,1]){const z=28+s*3.55;BK.cyl(0,XH0+4.5,z+s*.02,1.8,1.8,.12,0xe8e0c0,'e',20,Math.PI/2);BK.tor(0,XH0+4.5,z+s*.06,1.8,.14,EC.brass,'g',0,0,0,20);for(let i=0;i<12;i++){const a=i/12*6.28;BK.box(Math.sin(a)*1.5,XH0+4.5+Math.cos(a)*1.5,z+s*.08,.1,.28,.04,0x101010,'s',0,0,-a)}BK.box(0,XH0+4.9,z+s*.09,.09,.9,.04,0x101010,'s');BK.box(.35,XH0+4.5,z+s*.09,.7,.09,.04,0x101010,'s',0,0,.4);
  for(const x of[-2.7,2.7])BK.box(x,XH0+6.2,z+s*.04,.9,2.4,.12,0x9fb0d8,'e')}
 BK.cyl(0,XH0+9.5,28,0,5.4,5,slate,'s',4,0,Math.PI/4);BK.rod(0,XH0+14.3,28,0,XH0+17,28,.06,.03,EC.iron,'m');
 /* front portico: four fat columns, a flat roof and three low steps (low enough to walk up) */
 BK.bot(0,0,34.2,14,.15,4,0x6a645c,'s');BK.bot(0,.15,34.7,12,.15,3,0x726b60,'s');BK.bot(0,.3,35.2,10.6,.01,1.6,0x5e584e,'s');
 BK.box(0,6.1,34.8,13,.5,5.6,0x4a4440,'s');BK.box(0,6.55,34.8,13.6,.25,6.1,0x3a3632,'s');
 for(const x of[-5.4,-1.8,1.8,5.4]){BK.lathe(x,.3,36.5,[[.62,0],[.7,.12],[.5,.3],[.46,5.5],[.56,5.6],[.7,5.82]],EC.marble,'s',14);EST.cols.push([x,36.5,1.2,1.2,6,0,0,'n'])}
  /* gate pillars at the south wall */
 for(const x of[-5.2,5.2]){BK.bot(x,0,51.4,1.8,4.6,1.8,0x5a544c,'s');BK.bot(x,4.6,51.4,2.2,.3,2.2,0x4a4440,'s');BK.sph(x,5.2,51.4,.5,.5,.5,0x4a4440,'s',8);eSpot(x,3.5,50.4,0xffb868,1.0,14,.9);eHalo(x,3.9,50.4,.4,.28,.1,'H')}
 for(let x=-4.4;x<=4.4;x+=.35)BK.rod(x,.3,51.5,x,3.6+Math.abs(Math.sin(x*2.8))*.5,51.5,.025,.02,EC.iron,'m',4);BK.rod(-4.4,1.3,51.5,4.4,1.3,51.5,.04,.04,EC.iron,'m');BK.rod(-4.4,3.0,51.5,4.4,3.0,51.5,.04,.04,EC.iron,'m');BK.tor(0,2.2,51.5,.3,.035,EC.iron,'m',0,0,0,12);
 /* iron fence spikes along the boundary wall */
 for(const[x0,z0,x1,z1]of[[-52,-52,52,-52],[-52,52,52,52],[-52,-52,-52,52],[52,-52,52,52]]){const L=Math.hypot(x1-x0,z1-z0),n=Math.floor(L/1.2);for(let i=0;i<=n;i++){const t=i/n;BK.cyl(x0+(x1-x0)*t,3.4,z0+(z1-z0)*t,.04,0,.5,EC.iron,'m',4)}}}
var XH0=8.4;

/* ---------- a room: floor, ceiling (with collapsed sections), then its furniture ---------- */
function estRoom(k){const r=eInn(k),w=r[2]-r[0],d=r[3]-r[1],cx=(r[0]+r[2])/2,cz=(r[1]+r[3])/2,fl=EFL[k];
 BK.quad(cx,.02,cz,w+.3,d+.3,0xffffff,'s',-Math.PI/2,0,fl[0],(w+.3)/fl[1],(d+.3)/fl[1]);
 const HOLES={foyer:[],ball:[[-6,9],[8,-2]],lib:[[-32,-1]],kit:[[-27,-19]],study:[[30,-16]],parlor:[[36,28]],dining:[[-37,28]],bill:[]}[k]||[];
 if(k=='cons')estGlassRoof(r);else if(k=='crypt'){BK.quad(cx,5.6,cz,w,d,0x3a3834,'s',Math.PI/2,0);for(let x=r[0]+2;x<r[2];x+=4)BK.box(x,5.4,cz,.5,.4,d,0x4a4640,'s');for(const x of[r[0]+.3,r[2]-.3])BK.box(x,5.0,cz,.6,.8,d,0x4a4640,'s')}
 else{for(let x=r[0];x<r[2]-.01;x+=4)for(let z=r[1];z<r[3]-.01;z+=4){const x1=Math.min(x+4,r[2]),z1=Math.min(z+4,r[3]),mx=(x+x1)/2,mz=(z+z1)/2;if(HOLES.some(h=>Math.abs(h[0]-mx)<3&&Math.abs(h[1]-mz)<3))continue;BK.quad(mx,5.52,mz,x1-x,z1-z,0x4a4238,'s',Math.PI/2,0)}
  for(let z=r[1]+2;z<r[3];z+=4)if(!HOLES.some(h=>Math.abs(h[1]-z)<2.5))BK.box(cx,5.38,z,w,.3,.3,EC.dwood,'w');
  for(const h of HOLES){estHole(h[0],h[1])}}
 const R=ROOMS[k];if(R)R()}
function estHole(x,z){EST.holes.push({x,z});BK.at(x,0,z,erand()*6,()=>{FUR.rubble(1.8)});for(let i=0;i<3;i++)BK.rod(x+eri(-2,2),eri(.2,.6),z+eri(-2,2),x+eri(-3,3),eri(.4,1.2),z+eri(-3,3),.12,.1,EC.dwood,'w',5);
 BK.quad(x,5.0,z,3.6,3.6,0xdad6c8,'e',Math.PI/2,0);/* the night sky seen through the hole (unlit, so it reads as sky, not ceiling) */
 for(let i=0;i<4;i++)BK.rod(x+eri(-2,2),5.45,z+eri(-2,2),x+eri(-2,2),5.2,z+eri(-2,2),.1,.08,EC.dwood,'w',5)}
function estGlassRoof(r){const cx=(r[0]+r[2])/2,w=r[2]-r[0],rz=Math.atan2(2.2,w/2),W=Math.hypot(w/2,2.2);
 for(const s of[-1,1]){const x=cx+s*w/4;for(let z=r[1];z<r[3]-.01;z+=2.5){if(erand()<.2)continue;BK.box(x,6.7,z+1.25,W,.03,2.4,0x7a9aa8,'gl',0,0,-s*rz)}
  for(let z=r[1];z<=r[3]+.01;z+=2.5)BK.rod(cx+s*.02,7.8,z,cx+s*(w/2),5.6,z,.045,.045,EC.iron,'m',5)}
 BK.rod(cx,7.85,r[1],cx,7.85,r[3],.07,.07,EC.iron,'m',6);for(const s of[-1,1])BK.rod(cx+s*w/2,5.62,r[1],cx+s*w/2,5.62,r[3],.07,.07,EC.iron,'m',6);for(let x=-12;x<=12;x+=6)BK.rod(x,5.6,r[1],x,5.6,r[3],.05,.05,EC.iron,'m',5);
 estHole(-4,-15);estHole(9,-9)}

var at=(x,z,ry,fn)=>BK.at(x,0,z,ry,fn),PI=Math.PI;
var eWeb=(x,y,z,ry)=>BK.at(x,y,z,ry,()=>FUR.web(1.7));
function eCounter(x,z,w,ry){BK.at(x,0,z,ry,()=>{BK.bot(0,0,0,w,.88,.7,0x5a4a3a,'w');BK.bot(0,.88,.02,w+.06,.06,.78,0x8a8478,'s');for(let i=0;i<Math.floor(w/.8);i++)BK.bot(-w/2+.4+i*.8,.1,.36,.7,.7,.02,0x3a2c20,'w');BK.solid(0,0,w,.7,.95)})}
var ROOMS={
 foyer(){BK.quad(0,.035,23,8,10,0xffffff,'s',-PI/2,0,'rugA',1,1);FUR.stairs(-15.45,14.5,-5.0,19.5,'e');FUR.stairs(5.0,14.5,15.45,19.5,'w');
  BK.box(0,3.6,15.95,10.2,.3,3.0,EC.dwood,'w');for(let x=-4.6;x<=4.6;x+=.5)BK.cyl(x,3.75,17.35,.022,.022,.9,EC.dwood,'w',6);BK.rod(-5,4.7,17.4,5,4.7,17.4,.05,.05,EC.dwood,'w');BK.at(0,3.75,15.2,PI,()=>FUR.painting(2.6,1.6,3));
  at(-3.9,15.4,0,()=>FUR.armor());at(3.9,15.4,0,()=>FUR.armor());at(11.5,30.9,PI,()=>FUR.clock());at(-11.5,30.9,PI,()=>FUR.table(1.4,.45,.85,EC.dwood));BK.at(-11.5,2.1,31.3,PI,()=>FUR.mirror(1.2,1.7));
  for(const s of[-1,1]){BK.at(s*6.9,2.9,31.3,PI,()=>FUR.painting(1.5,2.0,s>0?1:2));at(s*4.3,30.6,0,()=>FUR.urn());at(s*6,30.4,0,()=>FUR.candelabra(1.4,5,[.9,9]));BK.at(s*15.5,3.0,26.2,s>0?-PI/2:PI/2,()=>FUR.sconce(0));BK.at(s*15.5,3.0,20.4,s>0?-PI/2:PI/2,()=>FUR.sconce(0))}
  at(0,22.5,0,()=>{FUR.table(1.2,1.2,.82,EC.wood);BK.at(0,.82,0,0,()=>FUR.vase(0x7a2a2a));BK.at(.3,.82,.25,0,()=>FUR.skull())});at(-7,22.8,.5,()=>FUR.rubble(1.1));
  eWeb(-15.2,5.2,31,PI/4);eWeb(15.2,5.2,31,-PI/4);eWeb(-15.2,5.3,14.9,PI*.75);eChand(0,5.45,24,1.5);eChand(-8,5.45,26,.8);eChand(8,5.45,26,.8)},
 dining(){BK.quad(-29,.035,22.5,15,6,0xffffff,'s',-PI/2,0,'rugB',1,1);at(-29,22.5,0,()=>FUR.table(12,2.4,.85,EC.dwood,EC.cloth));
  for(const x of[-33.5,-29,-24.5]){BK.at(x,.87,22.5,0,()=>FUR.candelabra(.85,5,[1,9]));}
  for(let i=0;i<6;i++){const x=-34.5+i*2;for(const s of[-1,1]){const tip=erand()<.2;BK.at(x,0,22.5+s*1.7,s>0?PI:0,()=>FUR.chair(),tip?.6+erand()*.5:0,tip?erand():0);BK.at(x+.1,.88,22.5+s*.75,0,()=>{BK.cyl(0,0,0,.2,.2,.02,0xe8e0d0,'c',12);BK.sph(0,.04,0,.1,.04,.08,epk([0x5a2a1a,0x7a6a2a,0x3a1a1a]),'f',6);BK.lathe(.25,0,.08,[[.03,0],[.015,.03],[.01,.09],[.04,.16]],0xc8d4d8,'gl',7)})}}
  BK.at(-29,.88,22.5,0,()=>{BK.cyl(0,0,0,.5,.5,.03,0xd8d0b8,'c',14);BK.sph(0,.14,0,.34,.13,.22,0x6a3a1c,'f',8);for(let i=0;i<6;i++)BK.sph(-.3+i*.12,.04,.3,.06,.04,.06,0x7a2a1a,'f',5)});
  at(-36.3,22.5,PI/2,()=>FUR.chair(EC.dwood));at(-21.7,22.5,-PI/2,()=>FUR.chair(EC.dwood));
  at(-40.9,23,PI/2,()=>FUR.fireplace());BK.at(-41.1,3.6,23,PI/2,()=>FUR.painting(1.7,1.3,4));
  at(-22,15.0,0,()=>{FUR.table(2.6,.6,.95,EC.dwood);BK.at(0,.95,0,0,()=>FUR.candelabra(.7,3));BK.at(.7,.95,.1,0,()=>FUR.vase(0x2a4a3a))});BK.at(-37,3.0,14.55,0,()=>FUR.painting(1.5,1.9,0));BK.at(-21,3.0,14.55,0,()=>FUR.painting(1.5,1.9,5));
  for(const x of[-37,-29,-22])BK.at(x,0,31.25,PI,()=>FUR.curtain(2.8,3.8,EC.velvet));at(-37,28.5,.3,()=>FUR.rubble(1.4));at(-19.4,17.5,.9,()=>FUR.crate(.7));
  eWeb(-41.1,5.2,14.9,PI/4);eWeb(-16.9,5.2,31,-PI*.75);eChand(-29,5.45,22.5,1.6);eChand(-36,5.45,26,.7);eChand(-22,5.45,18,.7)},
 parlor(){BK.quad(29,.035,23,13,8,0xffffff,'s',-PI/2,0,'rugA',1,1);at(36.8,17.6,0,()=>FUR.piano());at(30,23,PI/2,()=>FUR.couch(3,EC.blue));at(35.5,19.6,-PI/4,()=>FUR.armchair(EC.velvet));at(35.5,26.6,PI*1.25,()=>FUR.armchair(EC.velvet));at(35,23,0,()=>{FUR.table(1.5,.8,.45,EC.dwood);BK.at(0,.45,0,0,()=>FUR.candles(3))});
  at(40.9,23,-PI/2,()=>FUR.fireplace());BK.at(41.1,3.6,23,-PI/2,()=>FUR.painting(1.8,1.3,2));at(41.0,16.8,-PI/2,()=>FUR.bookcase(1.4,2.7));at(41.0,18.25,-PI/2,()=>FUR.bookcase(1.4,2.7));
  for(const x of[22,29,37])BK.at(x,0,31.25,PI,()=>FUR.curtain(2.8,3.8,EC.blue));for(const z of[19,26])BK.at(41.2,0,z,-PI/2,()=>FUR.curtain(2.8,3.8,EC.blue));at(24.5,28.5,0,()=>FUR.table(.9,.9,.75,EC.wood));at(22.5,26.8,.5,()=>FUR.chair());at(26,28,2.4,()=>FUR.chair(),1.2,.3);at(20.5,19,.4,()=>FUR.rubble(1.2));
  BK.at(23,3.1,14.55,0,()=>FUR.painting(1.4,1.8,1));BK.at(35,3.1,14.55,0,()=>FUR.painting(1.4,1.8,3));eWeb(41.1,5.2,31,-PI/4);eWeb(16.9,5.2,14.9,PI/4);eChand(29,5.45,23,1.5);eChand(22,5.45,19,.6)},
 ball(){BK.quad(0,.035,4,10,16,0xffffff,'s',-PI/2,0,'rugB',1,1);for(const x of[-8.5,8.5])for(const z of[-1.5,9.5])at(x,z,0,()=>{BK.lathe(0,0,0,[[.58,0],[.64,.15],[.46,.32],[.42,4.6],[.54,4.72],[.66,5.05]],EC.marble,'s',14);BK.solid(0,0,1.15,1.15,5.5)});
  at(-12.2,-2.6,0,()=>FUR.piano());for(const s of[-1,1]){at(s*14.9,-1.5,s>0?-PI/2:PI/2,()=>FUR.couch(2.6,EC.velvet));at(s*13,12.4,0,()=>FUR.statue(s>0?'angel':'maiden',PI));BK.at(s*13,3.0,-5.5,0,()=>FUR.mirror(1.7,2.6))}
  at(-6,8.5,.6,()=>FUR.grandChandelierFallen());at(3,9,1.2,()=>FUR.rubble(1.0));at(7,2,.2,()=>FUR.beam(5));
  eChand(-7.5,5.45,3,1.7);eChand(7.5,5.45,3,1.7);eChand(0,5.45,10,1.1);eWeb(-15.2,5.2,-5.0,PI/4);eWeb(15.2,5.2,13,-PI*.75);
  for(const x of[-11,11])at(x,12.8,0,()=>FUR.candelabra(1.5,5,[.8,9]))},
 lib(){BK.quad(-29,.035,-1,6,4.4,0xffffff,'s',-PI/2,0,'rugA',1,1);for(let x=-40.4;x<-31.5;x+=1.45)at(x,-5.45,0,()=>FUR.bookcase(1.4,2.8));for(let x=-26.6;x<-17.5;x+=1.45)at(x,-5.45,0,()=>FUR.bookcase(1.4,2.8));
  for(const xr of[-34.4,-24.4])for(let z=3.4;z<10.5;z+=1.45){at(xr,z,PI/2,()=>FUR.bookcase(1.4,2.6));at(xr+.8,z,-PI/2,()=>FUR.bookcase(1.4,2.6))}
  at(-29,-1,0,()=>{FUR.table(2.6,1.1,.82,EC.dwood);BK.at(.6,.82,0,0,()=>{BK.sph(0,.16,0,.15,.15,.15,0x2a5a7a,'g',9);BK.cyl(0,0,0,.05,.08,.06,EC.brass,'g',6)});BK.at(-.6,.82,.1,0,()=>FUR.candelabra(.6,3))});for(const s of[-1,1])at(-29+s*.9,-2.6,0,()=>FUR.chair(EC.wood)),at(-29+s*.9,.7,PI,()=>FUR.chair(EC.wood));
  at(-40.9,2,PI/2,()=>FUR.fireplace());at(-38.6,.2,PI*.8,()=>FUR.armchair(EC.velvet));at(-38.6,3.8,PI*.2,()=>FUR.armchair(EC.velvet));BK.rod(-35,0,-5.0,-35.4,2.7,-5.4,.03,.03,EC.wood,'w');BK.rod(-34.4,0,-5.0,-34.8,2.7,-5.4,.03,.03,EC.wood,'w');for(let y=.3;y<2.6;y+=.3)BK.rod(-35+y*-.14,y,-5.0-y*.13,-34.4+y*-.14,y,-5.0-y*.13,.015,.015,EC.wood,'w',4);
  BK.at(-40.8,3.2,-3.0,PI/2,()=>FUR.painting(1.2,1.6,5));eWeb(-41.1,5.2,-5.0,PI/4);eWeb(-16.9,5.2,13,-PI*.75);eChand(-29,5.45,4,1.2);eChand(-29,5.45,-3,.7)},
 bill(){BK.quad(29,.035,4,10,7,0xffffff,'s',-PI/2,0,'rugB',1,1);at(29,4,0,()=>FUR.billiard());eCounter(40.3,-1.2,6.5,-PI/2);for(let i=0;i<5;i++)at(38.9,-4+i*1.4,0,()=>FUR.stool());for(let i=0;i<6;i++)BK.bot(41.0,1.6,-3.8+i*1.2,.2,.5,.18,[0x2a5a2a,0x5a2a1a,0x7a6a2a][i%3],'gl');
  at(23.6,-3.7,PI*.9,()=>FUR.armchair(EC.green));at(34.4,-3.7,PI*1.1,()=>FUR.armchair(EC.green));at(38.6,-3.2,0,()=>{FUR.table(.9,.7,.7,EC.dwood);BK.at(0,.7,0,0,()=>FUR.candles(2))});BK.at(16.55,2.6,-2,PI/2,()=>{BK.cyl(0,0,0,.28,.28,.05,0x1a1410,'s',18,PI/2);BK.cyl(0,0,.03,.2,.2,.02,0xb02020,'s',18,PI/2);BK.cyl(0,0,.04,.1,.1,.02,0xe8e0c8,'s',18,PI/2);BK.cyl(0,0,.05,.03,.03,.02,0xb02020,'s',10,PI/2)});
  for(const[x,z,ry]of[[25,13.4,PI],[33,13.4,PI]])BK.at(x,3.0,z,ry,()=>{BK.sph(0,0,.2,.28,.24,.36,0x5a3a22,'f',9);BK.sph(0,.3,.5,.14,.14,.22,0x5a3a22,'f',7);for(const s of[-1,1])BK.rod(s*.12,.4,.46,s*.34,.9,.5,.025,.012,0xd8d0b0,'s',4)});
  BK.at(41.0,3.3,6,-PI/2,()=>FUR.painting(1.4,1.7,2));eWeb(16.9,5.2,-5.0,PI/4);eWeb(41.1,5.2,13,-PI*.75);eChand(29,5.45,4,.9);eChand(29,3.4,4,.5)},
 kit(){const wd=-23.0;eCounter(-35.5,wd,9,0);eCounter(-22.5,wd,8,0);BK.at(-39.2,0,-22.9,0,()=>{BK.bot(0,0,0,1.5,.9,.8,EC.iron,'m');for(const[x,z]of[[-.35,-.15],[.35,-.15],[-.35,.2],[.35,.2]])BK.cyl(x,.9,z,.17,.17,.03,0x0a0a0a,'m',10);BK.cyl(0,1.0,-.2,.14,.12,3.2,EC.iron,'m',8);BK.solid(0,0,1.5,.8,1)});
  BK.at(-33.5,.9,wd+.1,0,()=>{BK.bot(0,0,0,1.0,.05,.6,0x9a9488,'m');BK.cyl(.3,.05,-.2,.03,.03,.5,EC.iron,'m',5);BK.rod(.3,.55,-.2,.3,.6,.05,.03,.03,EC.iron,'m',5)});
  at(-29,-15.5,0,()=>{FUR.table(4,1.4,.95,0x6a5a4a);BK.at(-1,.95,0,0,()=>{BK.lathe(0,0,0,[[.18,0],[.2,.1],[.2,.22],[.17,.24]],0x3a3a3e,'m',10)});BK.at(.8,.95,.2,.3,()=>{BK.bot(0,0,0,.35,.02,.14,0xc0c0c8,'m');BK.bot(-.2,0,0,.12,.03,.12,0x3a2a1a,'w')});BK.at(.1,.95,-.2,0,()=>FUR.skull())});
  for(let i=0;i<7;i++)BK.quad(eri(-38,-20),.035,eri(-21,-8),eri(.6,1.8),eri(.5,1.5),0x4a0a0a,'s',-PI/2,erand()*3);
  BK.rod(-36,3.3,-17,-22,3.3,-17,.03,.03,EC.iron,'m',5);for(let i=0;i<6;i++){const x=-35+i*2.4;BK.rod(x,3.3,-17,x,2.95,-17,.01,.01,EC.iron,'m',3);BK.lathe(x,2.62,-17,[[.04,0],[.12,.02],[.14,.18],[.12,.3],[.15,.33]],0x4a4a50,'m',8)}
  for(let i=0;i<4;i++){BK.rod(-40+i*.5,3.6,-9,-40+i*.5,2.9,-9,.01,.01,EC.iron,'m',3);BK.sph(-40+i*.5,2.6,-9,.14,.28,.14,0x7a3a2a,'f',7)}
  at(-40.6,-8.2,0,()=>FUR.barrel());at(-39.5,-8.4,0,()=>FUR.barrel());at(-40.2,-10.4,0,()=>FUR.sack());at(-38,-8.0,.2,()=>FUR.crate(.9));at(-18.2,-22.6,0,()=>FUR.barrel());at(-19.2,-22.6,0,()=>FUR.barrel());at(-17.4,-20.8,0,()=>FUR.crate(.8));at(-19,-18,0,()=>FUR.sack());
  BK.at(-41.0,0,-12,PI/2,()=>{BK.bot(0,0,0,1.0,1.9,.7,0x8a8478,'s');BK.bot(0,.1,.36,.9,.8,.02,0x6a645c,'m');BK.bot(0,1.0,.36,.9,.8,.02,0x6a645c,'m');BK.solid(0,0,1,.7,1.9)});for(const z of[-17,-11])BK.at(-41.2,0,z,PI/2,()=>FUR.curtain(2.4,3.3,0x6a6a5a));
  eWeb(-41.1,5.2,-23.0,PI/4);eWeb(-16.9,5.2,-6.9,-PI*.75);eChand(-29,5.45,-15,.9);eSpot(-30,2.6,-17,0xffcc88,.8,10,.9)},
 study(){BK.quad(29,.035,-14,12,8,0xffffff,'s',-PI/2,0,'rugA',1,1);at(29,-18.8,0,()=>FUR.desk());at(29,-20.3,PI,()=>FUR.armchair(EC.velvet));at(40.9,-15,-PI/2,()=>FUR.fireplace());at(36.5,-15,-PI/2,()=>FUR.couch(2.8,EC.velvet));at(34.5,-11.5,.4,()=>FUR.armchair(EC.velvet));at(34.5,-18.5,PI-.4,()=>FUR.armchair(EC.velvet));
  for(let z=-22.5;z<-17.4;z+=1.45)at(16.95,z,PI/2,()=>FUR.bookcase(1.4,2.8));for(let x=17.5;x<22;x+=1.45)at(x,-22.95,0,()=>FUR.bookcase(1.4,2.8));for(let x=32;x<40;x+=1.45)at(x,-22.95,0,()=>FUR.bookcase(1.4,2.8));
  BK.at(26,0,-9,0,()=>{BK.lathe(0,0,0,[[.2,0],[.06,.1],[.06,.8],[.12,1.0]],EC.brass,'g',8);BK.sph(0,1.2,0,.28,.28,.28,0x2a5a7a,'g',12);BK.tor(0,1.2,0,.34,.02,EC.brass,'g',.4,0,0,14);BK.solid(0,0,.7,.7,1.5)});
  for(const[x,ry]of[[24.5,0],[33.5,0]])BK.at(x,3.2,-23.1,ry,()=>{BK.sph(0,0,.2,.26,.24,.34,0x6a4a2a,'f',9);BK.sph(0,.28,.5,.13,.13,.2,0x6a4a2a,'f',7);for(const s of[-1,1]){BK.rod(s*.1,.38,.48,s*.3,.9,.5,.025,.012,0xd8d0b0,'s',4);BK.rod(s*.3,.9,.5,s*.34,1.3,.4,.02,.01,0xd8d0b0,'s',4)}});
  BK.at(41.0,3.3,-9,-PI/2,()=>FUR.painting(1.3,1.6,0));for(const x of[22,29,36])BK.at(x,0,-23.2,0,()=>FUR.curtain(2.8,3.8,EC.green));at(21,-8,.3,()=>FUR.rubble(1.0));eWeb(41.1,5.2,-23.0,PI/4);eWeb(16.9,5.2,-6.9,-PI/4);eChand(29,5.45,-15,1.2);eSpot(36,2.4,-15,0xffaa66,.9,12,1)},
 cons(){const rg=[[-9,-18],[9,-18],[-9,-11],[9,-11]];at(0,-15,0,()=>{BK.lathe(0,0,0,[[2.2,0],[2.3,.5],[2.0,.55],[1.9,.4],[0,.3]],EC.dstone,'s',18);BK.cyl(0,.3,0,1.9,1.9,.2,0x2a2018,'s',18);BK.rod(0,.5,0,.3,3.5,.2,.14,.06,0x3a2c1c,'w',6);for(let i=0;i<9;i++){const a=i/9*6.28;BK.rod(.3,3.4,.2,.3+Math.cos(a)*2,2.6,.2+Math.sin(a)*2,.04,.015,0x4a4a2a,'w',4);BK.sph(.3+Math.cos(a)*1.2,3.1,.2+Math.sin(a)*1.2,.5,.1,.3,0x3a4a1e,'f',5)}BK.solid(0,0,4.4,4.4,1.0)});
  for(const[x,z]of rg)at(x,z,0,()=>{BK.lathe(0,0,0,[[.4,0],[.5,.5],[.52,.9],[.45,.92]],0x8a4a2e,'s',10);BK.cyl(0,.9,0,.4,.4,.05,0x1a1008,'s',10);for(let i=0;i<10;i++){const a=i/10*6.28;BK.rod(0,.9,0,Math.cos(a)*.9,1.5+erand(),Math.sin(a)*.9,.025,.01,0x4a5a2a,'w',4);BK.sph(Math.cos(a)*.7,1.2+erand()*.4,Math.sin(a)*.7,.35,.1,.2,erand()<.3?0x5a4a2a:0x2a4a1e,'f',5)}BK.solid(0,0,1,1,1.2)});
  for(const s of[-1,1]){at(s*13,-12,0,()=>FUR.table(1.4,.8,.8,EC.iron));at(s*13,-13.4,PI,()=>FUR.chair(EC.iron));at(s*13,-10.6,0,()=>FUR.chair(EC.iron));at(s*13.8,-19,0,()=>FUR.couch(2,0x3a4a3a));at(s*14.6,-8,.3,()=>FUR.urn(0x8a4a2e))}
  for(let x=-12;x<=12;x+=6)eHang(x,6.2,-20,.5);eWeb(-15.2,5.4,-22.9,PI/4);eWeb(15.2,5.4,-6.9,-PI*.75);for(const[x,z]of[[-4,-15],[9,-9]])eGlass(x,.06,z,4.5,4.5,-PI/2,0,0x8aa4ff,.25)},
 crypt(){const r=eInn('crypt');for(const x of[26.5,41.5])for(const z of[-46.5,-43,-39.5])at(x,z,PI/2,()=>{BK.bot(0,0,0,2.4,.7,1.1,0x6a665e,'s');BK.bot(0,.7,0,2.6,.18,1.2,0x7a766c,'s');BK.bot(0,.88,0,2.2,.1,.9,0x62605a,'s');BK.sph(-1.0,1.0,0,.2,.12,.28,EC.bone,'s',6);if(erand()<.5)BK.bot(.3,.98,.2,.5,.04,.1,0x4a2a1a,'w',.3);BK.solid(0,0,2.6,1.2,1.0)});
  for(const x of[r[0]+.12,r[2]-.12])for(let z=-48;z<-38;z+=2){for(const y of[.5,1.7,2.9]){BK.box(x,y+.3,z,.2,.8,1.5,0x2a2824,'s');BK.box(x+(x<30?.1:-.1),y+.3,z,.06,.7,1.4,0x14120f,'s')}}
  for(const[x,z]of[[24,-48],[44.5,-48],[24,-38.5],[44.5,-38.5]])at(x,z,0,()=>FUR.brazier());for(const[x,z,n]of[[29,-47,3],[39,-47,3],[28,-39,4],[40,-39,4],[34,-44,5]])at(x,z,0,()=>FUR.candles(n));for(const[x,z]of[[28.5,-44],[39.6,-42],[34,-40.5],[30,-38.5]])at(x,z,erand()*6,()=>FUR.bones());for(let x=24;x<45;x+=3.2)for(let k=0;k<2;k++)BK.rod(x+eri(-.5,.5),5.4,eri(-49,-38),x+eri(-.3,.3),eri(3.8,4.6),eri(-49,-38),.015,.015,EC.iron,'m',3);
  eWeb(22.8,5.2,-49.2,PI/4);eWeb(45.2,5.2,-38,-PI*.75);eWeb(22.8,5.2,-38,PI*.75);eSpot(34,3.5,-44,0xb070ff,1.4,16,.7);eSpot(34,2.5,-47,0x9a60ff,1.2,12,.8)}
};


/* ---------- the back garden (graveyard, hedge maze, fountain) and the front lawn ---------- */
var eKeep=[];var eFree=(x,z,r)=>{for(const k of eKeep)if(x>k[0]-r&&x<k[2]+r&&z>k[1]-r&&z<k[3]+r)return false;for(const c of EST.cols){if(Math.abs(x-c[0])<c[2]/2+r&&Math.abs(z-c[1])<c[3]/2+r)return false}return true};
function ePath(x0,z0,x1,z1,w,col){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/1.1)),ang=Math.atan2(x1-x0,z1-z0);eKeep.push([Math.min(x0,x1)-w/2,Math.min(z0,z1)-w/2,Math.max(x0,x1)+w/2,Math.max(z0,z1)+w/2]);
 for(let i=0;i<n;i++){const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;for(let j=0;j<Math.max(2,Math.round(w/1.1));j++){const o=(j+.5)/Math.max(2,Math.round(w/1.1))-.5,v=.9+erand()*.2,c=col||0x6a655c;const r=(c>>16&255)*v|0,g=(c>>8&255)*v|0,b=(c&255)*v|0;BK.box(x+Math.cos(ang)*o*w,.03,z-Math.sin(ang)*o*w,1.12,.06,L/n+.06,(r<<16)|(g<<8)|b,'s',ang)}}}
function estGarden(){BK.area='garden';eKeep.length=0;
 ePath(0,-25.4,0,-35.6,3.4);ePath(-29,-25.4,-29,-33,3);ePath(-27,-40,-3.5,-40,3);ePath(3.5,-35.6,34,-35.6,3);ePath(34,-35.6,34,-36.6,3.6);ePath(-3,-35.6,3,-35.6,3);
 at(0,-40,0,()=>FUR.fountain());eKeep.push([-3.5,-43.5,3.5,-36.5]);EST.fountain=[0,-40];
 /* hedge maze to the west: zig-zag rows with 4m gaps */
 const HZ=(z,x0,x1)=>{at((x0+x1)/2,z,0,()=>FUR.hedge(x1-x0,1.7));eKeep.push([x0,z-.9,x1,z+.9])};HZ(-34,-51,-41);HZ(-34,-37,-24);HZ(-40,-47,-31);HZ(-40,-27,-21);HZ(-46,-51,-38);HZ(-46,-34,-24);
 at(-35,-37,0,()=>FUR.statue('maiden',.5));at(-44,-43,0,()=>FUR.statue('angel',1));at(-26,-48,0,()=>FUR.tree(6));at(-48,-37,0,()=>FUR.tree(5));at(-36,-49.5,0,()=>{BK.bot(0,0,0,2.2,.5,.6,EC.dstone,'s');BK.solid(0,0,2.2,.6,.5)});
 at(-8,-31,0,()=>FUR.statue('angel',PI/2));at(8,-31,0,()=>FUR.statue('maiden',-PI/2));
 for(const[x,z]of[[-5.2,-27.5],[5.2,-27.5],[-2.6,-36.6],[2.6,-36.6],[30.5,-33.8],[37.5,-33.8],[-31,-35.4],[-27,-35.4],[-12,-38.4]])at(x,z,0,()=>FUR.lamppost());
 for(const x of[-12,12])at(x,-43,x>0?-PI/2:PI/2,()=>{BK.bot(0,0,0,1.8,.12,.5,EC.dstone,'s');BK.bot(0,.4,-.1,1.8,.1,.4,EC.dstone,'s');for(const s of[-1,1])BK.bot(s*.8,.12,0,.14,.3,.44,EC.dstone,'s');BK.bot(0,.5,-.3,1.8,.5,.1,EC.dstone,'s');BK.solid(0,0,1.8,.5,.9)});
 /* the crypt from outside: a pitched slate roof, a pediment, columns and plaque */
 {const rz=Math.atan2(2,6.75),W=Math.hypot(6.75,2);for(const s of[-1,1])BK.box(34,7.5,-43.5+s*3.4,25,.35,W,0x2a2c32,'s',0,s*rz,0);BK.rod(22,8.5,-43.5,46,8.5,-43.5,.2,.2,0x1c1f26,'m',6);BK.ext(eShape([[-13,0],[13,0],[0,2.3]]),1.1,34,6.3,-36.9,0x58554e,'s');
  for(const x of[28.6,39.4])BK.lathe(x,0,-35.7,[[.5,0],[.56,.12],[.4,.3],[.38,5.2],[.46,5.3],[.56,5.5]],0x7a766c,'s',12);BK.bot(34,5.5,-35.7,13,.6,1.4,0x6a665e,'s');BK.box(34,6.4,-36.4,5,.6,.1,0x2a2820,'s');BK.at(34,6.4,-36.3,0,()=>{BK.box(0,0,0,4.4,.08,.02,0xc9a23a,'g')});
  for(const x of[28.6,39.4])EST.cols.push([x,-35.7,1.1,1.1,5.8,0,0,'n']);for(const x of[26.5,41.5])at(x,-35,0,()=>FUR.brazier());}
 /* graveyard */
 for(let n=0,t=0;n<46&&t<600;t++){const x=eri(3,50),z=eri(-36,-26.5),inCry=x>20&&x<48&&z<-35;if(inCry||!eFree(x,z,1.3))continue;at(x,z,eri(-.25,.25),()=>FUR.tomb(erand()*4|0));n++}
 for(let n=0,t=0;n<24&&t<400;t++){const x=eri(6,50),z=eri(-50,-37.5);if((x>20.5&&x<47.5)||!eFree(x,z,1.5))continue;at(x,z,eri(-.4,.4),()=>FUR.tomb(erand()*4|0));n++}
 for(const[x,z]of[[-47,-27],[-18,-47],[48,-31],[15,-47],[-10,-49],[10,-30],[-40,-30],[50,-48]])at(x,z,0,()=>FUR.tree(5+erand()*3));
 for(let i=0;i<14;i++){const x=eri(-50,50),z=eri(-51,-26);if(eFree(x,z,1.5))at(x,z,erand()*6,()=>FUR.rubble(.7))}
 /* iron fence around the graveyard plot */
 for(let x=2.5;x<=50;x+=.55)BK.rod(x,0,-26.2,x,1.5,-26.2,.02,.015,EC.iron,'m',4);BK.rod(2.5,1.2,-26.2,50,1.2,-26.2,.03,.03,EC.iron,'m',4);BK.rod(2.5,.4,-26.2,50,.4,-26.2,.03,.03,EC.iron,'m',4)}
function estLawn(){BK.area='lawn';ePath(0,50,0,36.6,5.6);ePath(0,37.5,0,36.5,10,0x6a645c);
 for(const s of[-1,1]){at(s*5.4,40,0,()=>FUR.hedge(1.6,5,1.9));at(s*5.4,48,0,()=>FUR.hedge(1.6,5,1.9));at(s*8,38,s>0?PI:0,()=>FUR.statue(s>0?'maiden':'angel',0));at(s*3.4,37,0,()=>FUR.lamppost());at(s*3.4,49,0,()=>FUR.lamppost());at(s*10,36.5,0,()=>FUR.urn())}
 /* a wrecked hearse and a toppled carriage lamp */
 at(-16,43,.5,()=>{BK.bot(0,.5,0,1.9,.9,4.8,0x15161a,'g');BK.bot(0,.4,-2.6,1.8,.6,1.0,0x15161a,'g');BK.bot(0,1.4,.2,1.8,.9,2.8,0x15161a,'g');BK.bot(0,1.45,.2,1.86,.7,2.5,0x3a4a5a,'gl');BK.bot(0,.45,-.3,.5,.5,2.4,0x5a3a22,'w');for(const[x,z]of[[-.95,-1.5],[.95,-1.5],[-.95,1.5]]){BK.tor(x,.45,z,.42,.1,0x0a0a0a,'s',0,PI/2,0,10);BK.tor(x,.45,z,.28,.03,EC.brass,'g',0,PI/2,0,8)}BK.tor(.95,.2,1.5,.42,.1,0x0a0a0a,'s',0,PI/2,.3,10);BK.sph(0,1.9,.2,.1,.1,.1,EC.brass,'g',6);BK.solid(0,0,2.1,5.2,1.9)});
 for(const[x,z]of[[-30,38],[29,41],[-42,47],[41,49],[-24,36.5],[24,46]])at(x,z,0,()=>FUR.tree(5+erand()*3));
 for(let i=0;i<12;i++){const x=eri(-50,50),z=eri(34,50);if(Math.abs(x)>7&&eFree(x,z,1.5))at(x,z,erand()*6,()=>FUR.rubble(.8))}
 for(const s of[-1,1])for(let z=34.5;z<=50;z+=.6)if(Math.abs(z-43)>0)BK.rod(s*49,0,z,s*49,1.4,z,.02,.015,EC.iron,'m',4);
 at(-36,37.5,0,()=>{BK.bot(0,0,0,2.2,.5,.6,EC.dstone,'s');BK.solid(0,0,2.2,.6,.5)});at(34,37.5,0,()=>{BK.bot(0,0,0,2.2,.5,.6,EC.dstone,'s');BK.solid(0,0,2.2,.6,.5)})}

/* ---------- animated decoration: chandeliers sway and flicker, lanterns swing, the clock pendulum swings, the fountain ripples ---------- */
function eChand(x,y,z,s){const g=new THREE.Group(),lb=mkBake();g.position.set(x,y,z); lb.rod(0,0,0,0,-1.1*s,0,.03,.03,EC.iron,'m',5);lb.lathe(0,-1.9*s,0,[[.04,0],[.16*s,.12*s],[.1*s,.35*s],[.2*s,.55*s],[.06*s,.8*s]],EC.brass,'g',10);lb.tor(0,-1.7*s,0,.85*s,.035*s,EC.brass,'g',PI/2,0,0,18);lb.tor(0,-1.45*s,0,.5*s,.03*s,EC.brass,'g',PI/2,0,0,14);
 const n=8;for(let i=0;i<n;i++){const a=i/n*PI*2,c=Math.cos(a),sn=Math.sin(a);lb.rod(0,-1.55*s,0,c*.85*s,-1.7*s,sn*.85*s,.022*s,.018*s,EC.brass,'g',5);lb.cyl(c*.85*s,-1.7*s,sn*.85*s,.04*s,.04*s,.06*s,EC.brass,'g',6);lb.cyl(c*.85*s,-1.64*s,sn*.85*s,.022*s,.024*s,.14*s,EC.candle,'c',6);
  const w=eWor2(g,x,y,z,c*.85*s,-1.46*s,sn*.85*s);eFlame(w[0],w[1],w[2],1.1);for(let k=0;k<3;k++){const aa=a+(k-1)*.14;lb.rod(Math.cos(aa)*.85*s,-1.72*s,Math.sin(aa)*.85*s,Math.cos(aa)*.85*s,-(1.9+erand()*.3)*s,Math.sin(aa)*.85*s,.004,.004,0xcfe6f0,'gl',3);lb.sph(Math.cos(aa)*.85*s,-(1.95+erand()*.3)*s,Math.sin(aa)*.85*s,.03*s,.05*s,.03*s,0xcfe6f0,'gl',5)}}
 lb.build(g);EST.pend.push(g);const w=eWor2(g,x,y,z,0,-1.5*s,0);eSpot(w[0],w[1],w[2],0xffb066,1.5*Math.min(1.4,s),18,1);eHalo(w[0],w[1],w[2],.5*s,.32*s,.12*s,'H');
 const ph=erand()*6;EST.dyn.push({tick(dt,t){g.rotation.z=Math.sin(t*.7+ph)*.025+Math.sin(t*1.9+ph*2)*.008;g.rotation.x=Math.cos(t*.55+ph)*.02;g.rotation.y=t*.06*(ph>3?1:-1)}})}
var eWor2=(g,x,y,z,lx,ly,lz)=>[x+lx,y+ly,z+lz];
function eHang(x,y,z,s){const g=new THREE.Group(),lb=mkBake();g.position.set(x,y,z);lb.rod(0,0,0,0,-.9,0,.02,.02,EC.iron,'m',4);lb.cyl(0,-1.3,0,.22*s*2,.1*s*2,.4*s*2,EC.iron,'m',6);lb.cyl(0,-1.35,0,.17*s*2,.08*s*2,.32*s*2,0xffe3a8,'e',6);lb.cyl(0,-.9,0,0,.28*s*2,.18,EC.iron,'m',6);lb.build(g);EST.pend.push(g);eSpot(x,y-1.2,z,0xffd890,.9,11,.9);eHalo(x,y-1.2,z,.4,.3,.14,'H');const ph=erand()*6;EST.dyn.push({tick(dt,t){g.rotation.z=Math.sin(t*.9+ph)*.05;g.rotation.x=Math.cos(t*.7+ph)*.04}})}

/* ---------- finishing: merged meshes, glow point systems, the pooled lights, the clock pendulum, fountain water, fog, moon shafts ---------- */
function estPost(g){EST.tm=0;EST.bk.build(g);for(const o of EST.pend)g.add(o);EST.pend=[];
 const PT=EST.pts;EST.ptm={};const {glow,smoke:[smoke]}=LX.effectTextures();
 for(const k in PT){const s=PT[k];if(!s.p.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(s.p,3));const col=new THREE.Float32BufferAttribute(s.c.slice(),3);col.setUsage&&col.setUsage(THREE.DynamicDrawUsage);geo.setAttribute('color',col);
  const m=new THREE.Points(geo,new THREE.PointsMaterial({map:k=='s'?smoke:glow,size:s.size,vertexColors:true,transparent:true,depthWrite:false,blending:k=='s'?THREE.NormalBlending:THREE.AdditiveBlending,fog:true,opacity:k=='s'?.35:1}));m.frustumCulled=false;g.add(m);EST.ptm[k]={m,col,s}}
 /* point lights: a pool that follows you (the real lights are expensive, the glow is cheap) */
 EST.pool=[];for(let i=0;i<6;i++){const L=new THREE.PointLight(0xffaa66,0,18,1.6);g.add(L);EST.pool.push({L,s:null})}
 for(const sp of EST.spots){sp.cur=0;sp.want=0;sp.L=null}
 /* clock pendulums */
 EST.pend2=[];for(const p of EST.pendulum||[]){const pg=new THREE.Group(),lb=mkBake();pg.position.set(p.x,p.y,p.z);pg.rotation.order='YXZ';pg.rotation.y=p.yaw;lb.rod(0,0,0,0,-.75,0,.012,.012,EC.brass,'g',4);lb.cyl(0,-.88,0,.1,.1,.03,EC.brass,'g',12,PI/2);lb.build(pg);g.add(pg);EST.dyn.push({tick(dt,t){pg.rotation.z=Math.sin(t*3.1)*.22}})}
 /* fountain water */
 if(EST.fountain){const w=new THREE.Mesh(new THREE.CircleGeometry(2.2,24),new THREE.MeshBasicMaterial({map:glow,color:0x4a6a8a,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));w.rotation.x=-PI/2;w.position.set(EST.fountain[0],.62,EST.fountain[1]);g.add(w);
  const rings=[];for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.9,1,28),new THREE.MeshBasicMaterial({color:0x9ab8d8,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide}));r.rotation.x=-PI/2;r.position.set(EST.fountain[0],.63,EST.fountain[1]);g.add(r);rings.push(r)}
  EST.dyn.push({tick(dt,t){rings.forEach((r,i)=>{const u=((t*.45+i/3)%1);r.scale.setScalar(.3+u*2.1);r.material.opacity=.45*(1-u)});w.material.opacity=.4+Math.sin(t*1.7)*.08}})}
 /* moonlight shafts and floor patches under every collapsed ceiling */
 for(const h of EST.holes){const cone=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.6,5.4,16,1,true),new THREE.MeshBasicMaterial({color:0x8aa4ff,transparent:true,opacity:.07,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));cone.position.set(h.x,2.8,h.z);g.add(cone);eGlass(h.x,.06,h.z,5.2,5.2,-PI/2,0,0x8aa4ff,.4)}
 /* low drifting fog in the garden and on the lawn */
 EST.fog=[];for(let i=0;i<22;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smoke,color:0x8a9ab8,transparent:true,opacity:.22,depthWrite:false}));const gz=i<14;s.position.set(eri(-48,48),eri(.5,1.2),gz?eri(-50,-27):eri(36,50));s.scale.set(eri(8,14),eri(2,3.6),1);g.add(s);EST.fog.push({s,vx:eri(-.25,.25),ph:erand()*6})}
 EST.mapG=g;EST.dyn.push({tick:(dt,t)=>estFlicker(dt,t)})}


/* ===================== live objects: doors, machines, the box, wall buys, ammo crates ===================== */
var EMM={},EG={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,16),cyl8:new THREE.CylinderGeometry(1,1,1,8),sph:new THREE.SphereGeometry(1,14,10),cone:new THREE.ConeGeometry(1,1,12),pl:new THREE.PlaneGeometry(1,1),tor:new THREE.TorusGeometry(1,.06,8,28)};
function eM(col,em,rough,metal){const k=col+'|'+(em||0)+'|'+rough+'|'+metal;if(EMM[k])return EMM[k];let m;if(LX.pbr&&(rough!=null||metal!=null))m=LX.patch(new THREE.MeshStandardMaterial({color:col,emissive:em||0,roughness:rough==null?.7:rough,metalness:metal||0,envMapIntensity:1}),{});else m=new THREE.MeshLambertMaterial({color:col,emissive:em||0});return EMM[k]=m}
function eMk(g,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.scale.set(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=m.receiveShadow=true;g.add(m);return m}
var eBasic=(col,o,add)=>new THREE.MeshBasicMaterial({color:col,transparent:o!=null&&o<1,opacity:o==null?1:o,depthWrite:!(o!=null&&o<1),blending:add?THREE.AdditiveBlending:THREE.NormalBlending,side:THREE.DoubleSide});
function eCanvasMat(w,h,fn,basic){const t=zTex(w,h,fn);return basic?new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false}):new THREE.MeshLambertMaterial({map:t})}
function eSign(txt,col,w,h){const c=hex(col);return eCanvasMat(w||256,h||96,(g,W,H)=>{g.fillStyle='#07070a';g.fillRect(0,0,W,H);const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.4)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.shadowColor=c;g.shadowBlur=14;g.strokeStyle=c;g.lineWidth=4;g.strokeRect(6,6,W-12,H-12);g.font='700 '+(H*.52|0)+'px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(txt.toUpperCase(),W/2,H/2+4);g.shadowBlur=0;g.fillStyle=c;g.globalAlpha=.9;g.fillText(txt.toUpperCase(),W/2,H/2+4)},true)}
THREE.Color.prototype.setGray=function(v){return this.setRGB(v,v,v)};
var eFace=f=>FACE[f]!=null?FACE[f]:0,eFwd=f=>[Math.sin(FACE[f]||0),Math.cos(FACE[f]||0)];
var eSwap=(f,w,d)=>(f=='e'||f=='w')?[d,w]:[w,d];

/* ---------- flattening: the static parts of a live object (a gun on the wall, a machine's cabinet, a door leaf) are merged into one mesh so a lot of detail costs few draw calls.
   Anything animated is flagged userData.dyn and stays separate; transparent, unlit and textured parts are left alone. ---------- */
var EFM={};
function eFlatMat(r,m){const k=r+'|'+m;if(EFM[k])return EFM[k];return EFM[k]=LX.pbr?LX.patch(new THREE.MeshStandardMaterial({vertexColors:true,roughness:r,metalness:m,envMapIntensity:.9}),{}):new THREE.MeshLambertMaterial({vertexColors:true})}
function eRel(mesh,root){let m=new THREE.Matrix4(),t=mesh;while(t&&t!==root){m=new THREE.Matrix4().compose(t.position,new THREE.Quaternion().setFromEuler(t.rotation),t.scale).multiply(m);t=t.parent}return m}
function eFlatten(root,rough,metal){const list=[];const walk=o=>{for(const c of o.children){if(c.userData&&c.userData.dyn)continue;
   if(c.isMesh){const mt=c.material;if(c.visible&&c.geometry&&c.geometry.attributes&&c.geometry.attributes.position&&mt&&!mt.transparent&&!mt.isMeshBasicMaterial&&!mt.map&&!mt.isShaderMaterial&&mt.color)list.push(c)}
   else if(!c.isPoints&&!c.isSprite&&!c.isLight)walk(c)}};walk(root);if(list.length<2)return;
 const P=[],N=[],C=[],I=[],nm=new THREE.Matrix3(),v=new THREE.Vector3();let sh=false;
 for(const c of list){const g=c.geometry,pos=g.attributes.position,nor=g.attributes.normal,m=eRel(c,root),base=P.length/3,col=c.material.color,em=c.material.emissive;nm.getNormalMatrix(m);if(c.castShadow)sh=true;
  const r=Math.min(1,col.r+(em?em.r*.7:0)),gg=Math.min(1,col.g+(em?em.g*.7:0)),b=Math.min(1,col.b+(em?em.b*.7:0));
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(m);P.push(v.x,v.y,v.z);if(nor){v.fromBufferAttribute(nor,i).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z)}else N.push(0,1,0);C.push(r,gg,b)}
  const ix=g.index;if(ix)for(let i=0;i<ix.count;i++)I.push(base+ix.getX(i));else for(let i=0;i<pos.count;i++)I.push(base+i);c.parent.remove(c)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setIndex(new THREE.BufferAttribute(new Uint32Array(I),1));
 const mesh=new THREE.Mesh(geo,eFlatMat(rough,metal));mesh.castShadow=sh;mesh.receiveShadow=true;root.add(mesh)}
EST.objs={doors:[],mach:{},boxes:[],walls:[],crates:[],rings:[],pap:null};
/* a weapon model for displays: built once per weapon, scaled to a fixed length, centred; barrel along x */
var EGUN={};
function eGunModel(k,len){const key=k+'|'+len;if(EGUN[key])return EGUN[key].clone();let g;try{g=k=='NF'?(typeof objBuild=='function'?objBuild('nfists'):null):k=='KT'?(typeof objBuild=='function'?objBuild('katana'):null):buildGun(k)}catch(e){g=null}
 if(!g){g=new THREE.Group();eMk(g,EG.box,eM(0x2a2c30,0,.5,.7),0,0,0,.9,.1,.1)}
 const w=new THREE.Group();w.add(g);const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new THREE.Vector3()),ct=bb.getCenter(new THREE.Vector3()),L=Math.max(sz.x,sz.y,sz.z,.01),sc=len/L;g.position.sub(ct);w.scale.setScalar(sc);
 const o=new THREE.Group();o.add(w);if(sz.z>=sz.x&&k!='KT')w.rotation.y=Math.PI/2;if(k=='KT'&&sz.y>sz.x){w.rotation.z=Math.PI/2}eFlatten(o,.5,.55);EGUN[key]=o;return o.clone()}

/* ---------- doors ---------- */
function estDoor(d,idx){const W=Math.max(d.w,d.d),alongZ=d.d>d.w,H=d.s=='iron'||W>5?4.3:3.4,g=new THREE.Group(),o={d,g,open:0,planks:[],an:0};g.position.set(d.x,zObjectFloor(d.x,d.z),d.z);
 /* the barricade faces the side you buy from: the area that is already open */
 const AC={0:[0,23],1:[-29,23],2:[29,23],3:[0,4],4:[-29,-15],5:[-29,4],6:[29,4],7:[29,-15],8:[0,-15],9:[34,-31],10:[34,-43],11:[0,43]},ac=d.approach||AC[d.a]||[0,0];
 g.rotation.y=alongZ?(ac[0]>=d.x?Math.PI/2:-Math.PI/2):(ac[1]>=d.z?0:Math.PI);
 const wood=eM(0x3a2616,0,.8,0),dw=eM(0x24160c,0,.8,0),iron=eM(0x1c1d20,0,.5,.8),brass=eM(0xb08a3a,0,.3,1);o.piv=[];
 if(d.s=='stone'){const slab=new THREE.Group();eMk(slab,EG.box,eM(0x55524c,0,.9,0),0,H/2,0,W,H,.5);for(let i=0;i<3;i++)eMk(slab,EG.box,eM(0x4a4740,0,.9,0),0,.5+i*1.1,.28,W-.4,.9,.08);const rn=eBasic(0xa070ff,.9,1);for(let i=0;i<7;i++)eMk(slab,EG.box,rn,-1.2+i*.4,H*.55+(i%2)*.4,.34,.06,.35,.02);eMk(slab,EG.tor,iron,0,1.5,.34,.4,.4,.4);eFlatten(slab,.9,.1);g.add(slab);o.slab=slab;o.rune=rn}
 else{for(const s of[-1,1]){const pv=new THREE.Group();pv.position.set(s*W/2,0,0);g.add(pv);o.piv.push({pv,s});const lw=W/2-.02;
   if(d.s=='iron'){for(let i=0;i<9;i++)eMk(pv,EG.cyl8,iron,-s*(.1+i*(lw-.15)/8),H/2,0,.03,H,.03);for(const y of[.4,H/2,H-.4])eMk(pv,EG.box,iron,-s*lw/2,y,0,lw,.07,.07);for(let i=0;i<9;i++)eMk(pv,EG.cone,iron,-s*(.1+i*(lw-.15)/8),H+.1,0,.05,.22,.05);eMk(pv,EG.tor,iron,-s*lw*.85,H*.55,.04,.22,.22,.22)}
   else if(d.s==='airlock'){
    const panel=eM(0x446474,0,.55,.65),stripe=eBasic(0xffb052,1),x=-s*lw/2;
    eMk(pv,EG.box,panel,x,H/2,0,lw,H,.22);
    eMk(pv,EG.box,iron,x,H/2,.13,lw-.18,H-.28,.035);
    for(const y of [.38,1.72,2.95])eMk(pv,EG.box,panel,x,y,.18,lw-.23,.24,.11);
    for(const y of [1.53,1.91])eMk(pv,EG.box,stripe,x,y,.25,lw-.33,.038,.025);
   }
   else if(d.s=='glass'){eMk(pv,EG.box,iron,-s*lw/2,H/2,0,lw,H,.06);eMk(pv,EG.box,eM(0x6a8aa0,0x0a1626,.1,.2),-s*lw/2,H/2,0,lw-.2,H-.2,.03);for(let i=1;i<4;i++)eMk(pv,EG.box,iron,-s*lw/2,i*H/4,.02,lw,.05,.05);eMk(pv,EG.box,iron,-s*lw/2,H/2,.02,.05,H,.05)}
   else{for(let i=0;i<5;i++)eMk(pv,EG.box,i%2?wood:dw,-s*(.18+i*(lw-.2)/4),H/2,0,(lw-.1)/5-.01,H,.16);for(const y of[.5,H-.5])eMk(pv,EG.box,iron,-s*lw/2,y,.1,lw,.14,.03);for(const y of[.5,H-.5])for(let i=0;i<5;i++)eMk(pv,EG.sph,iron,-s*(.2+i*(lw-.4)/4),y,.12,.03,.03,.03);eMk(pv,EG.tor,brass,-s*.28,H*.5,.12,.14,.14,.14);eMk(pv,EG.box,wood,-s*lw/2,H/2,.09,lw-.5,H-1.4,.05)}}}
 for(const q of o.piv)eFlatten(q.pv,.8,.1);
 /* the barricade: planks nailed across, a chain and a padlock; they fly off when the door opens */
 const pm=[eM(0x4a3a24,0,.9,0),eM(0x3a2c1c,0,.9,0),eM(0x544028,0,.9,0)],np=d.s==='stone'||d.s==='airlock'?0:4;for(let i=0;i<np;i++){const y=.55+i*(H-1)/(np-1),pl=new THREE.Group(),sw=W*(.92+erand()*.1);eMk(pl,EG.box,pm[i%3],0,0,0,sw,.26,.07);for(const x of[-sw*.4,0,sw*.4])eMk(pl,EG.sph,eM(0x2a2a2a,0,.4,.9),x,0,.05,.025,.025,.025);pl.position.set(0,y,.3+.02*i);pl.rotation.z=(erand()-.5)*.28;g.add(pl);o.planks.push({m:pl,vx:(erand()-.5)*5,vy:2+erand()*3,vz:2+erand()*3.5,rx:(erand()-.5)*9,rz:(erand()-.5)*9})}
 if(d.s!=='airlock'&&(d.s!='wood'||W>4)){const lk=new THREE.Group();lk.position.set(0,H*.42,.34);for(let i=0;i<5;i++)eMk(lk,EG.tor,iron,-.5+i*.25,H*.03-i*.02,0,.1,.1,.1,0,0,i);eMk(lk,EG.box,brass,0,-H*.02,.02,.2,.26,.1);eMk(lk,EG.tor,brass,0,.18-H*.02,.02,.07,.07,.07);g.add(lk);o.planks.push({m:lk,vx:(erand()-.5)*2,vy:1.5+erand()*2,vz:2+erand()*2,rx:(erand()-.5)*6,rz:(erand()-.5)*6})}
 /* a hand-painted price plate */
 const sg=eSign('LOCKED · '+d.c,0xffc860,256,72);const sgm=eMk(g,EG.pl,sg,0,H+.55,.1,1.7,.5,1);sgm.castShadow=false;o.sign=sgm;
 o.box=zSolid(d.x,d.z,d.w,d.d,H<4?3.5:4.6);zG.add(g);EST.objs.doors.push(o);zDoorRule(o,d,idx);return o}
function estDoorOpen(o){if(o.an>0)return;o.an=.001;const d=o.d;burst(V(d.x,1.2,d.z),34,0x9a9080,5,1.3,.26);burst(V(d.x,2,d.z),14,0x6a5a48,7,.9,.12);noise(.5,200,.4);beep(120,.9,'sawtooth',.06);setTimeout(()=>beep(90,.5,'triangle',.06),500);if(o.sign)o.sign.visible=false;o.g.updateMatrixWorld&&0}
function estDoorTick(o,dt){if(o.an<=0||o.an>=9)return;o.an+=dt;const t=o.an,e=esm(t/1.5),d=o.d;
 for(const q of o.piv)q.pv.rotation.y=-q.s*e*1.75;
 if(o.slab){o.slab.position.y=-3.7*e;if(t<1.5&&Math.random()<dt*30)burst(V(d.x,.2,d.z),1,0x8a8478,2,.6,.2);o.rune.opacity=.9*(1-e)}
 for(const p of o.planks){const m=p.m;if(t<1.4){p.vy-=9*dt;m.position.x+=p.vx*dt;m.position.y+=p.vy*dt;m.position.z+=p.vz*dt;m.rotation.x+=p.rx*dt;m.rotation.z+=p.rz*dt;if(m.position.y<.1){m.position.y=.1;p.vy=Math.abs(p.vy)*.3;p.vx*=.6;p.vz*=.6;p.rx*=.6;p.rz*=.6}}if(t>1.8)m.visible=false}
 if(t>2.4)o.an=9}

/* ---------- perk machines ---------- */
function estPerkMachine(m,t){
 const p=PERKS[t],g=new THREE.Group(),map=MAPS[sel.map],powered=()=>t==='rev'||zPowered();
 g.position.set(m.x,zObjectFloor(m.x,m.z),m.z);g.rotation.y=eFace(m.f);
 const o=perkCabinet(m,t,p,g);
 EST.objs.mach[t]=o;
 if(t==='rev')zq.revM={g,o:{gone:0},bxo:o.bxo};
 zq.mp.push({k:t,x:m.x,z:m.z,f:m.f,n:p.n});
 if(!map.lockbox){
  const [fx,fz]=eFwd(m.f);
  eSpot(m.x+fx*1.1,1.6,m.z+fz*1.1,p.c,1.1,10,.9);
 }
 zi.push({x:m.x,z:m.z,r:map.lockbox?2.25:3.3,
  txt:()=>!g.visible?'':!powered()?'The power is off':zq.perks[t]?p.n+' · equipped':'Buy '+p.n+' · '+p.t,
  cost:()=>zq.perks[t]||!powered()?0:p.cost,act:()=>powered()?zPerk(t):noPower()});
}
function estMachTick(o,dt,t){if(o.g.visible===false)return;const fl=.85+.15*Math.sin(t*11+o.ph)+(Math.random()<.015?-.45:0);o.sign.color.setGray(o.t=='rev'||zPowered()?Math.max(.3,fl):.05);o.rack.position.y=(o.rackY||0)+Math.sin(t*2+o.ph)*.004;
 if(o.buy>0){o.buy-=dt*1.6;const b=Math.max(0,o.buy);o.g.position.x=o.x0+Math.sin(t*70)*.012*b;o.flap.rotation.x=-b*.7;if(o.drop){o.drop.vy-=9*dt;o.drop.m.position.y+=o.drop.vy*dt;o.drop.m.position.z+=o.drop.vz*dt;if(o.drop.m.position.y<.15){o.drop.m.position.y=.15;o.drop.vy=0;o.drop.vz=0}}if(o.buy<=0&&o.drop){o.g.remove(o.drop.m);o.drop=null;o.g.position.x=o.x0}}}
function estPerk(t){const o=EST.objs.mach[t];if(!o)return;o.x0=o.g.position.x;o.buy=1;const b=new THREE.Group(),bc=eM(o.c,new THREE.Color(o.c).multiplyScalar(.5).getHex(),.2,.1);eMk(b,EG.cyl,bc,0,.13,0,.055,.13,.055);eMk(b,EG.cyl,bc,0,.31,0,.024,.05,.024);b.position.set(...(o.dispenser||[0,.55,.55]));b.rotation.x=.2;o.g.add(b);o.drop={m:b,vy:1.5,vz:.6};const[fx,fz]=eFwd(zq.mp.find(q=>q.k==t).f);burst(V(o.g.position.x+fx*.7,1,o.g.position.z+fz*.7),24,o.c,5,.6,.1)}

/* ---------- Pack-a-Punch ---------- */
function estPapMachine(m){if(MAPS[sel.map].lockbox)return lockboxPapMachine(m);const g=new THREE.Group(),f=eFace(m.f),[fx,fz]=eFwd(m.f);g.position.set(m.x,zObjectFloor(m.x,m.z),m.z);g.rotation.y=f;const V1=0xa070ff,iron=eM(0x17181c,0,.45,.85),stone=eM(0x2a2a30,0,.8,.2),vio=eBasic(V1,1),vioS=eBasic(V1,.55,1),brass=eM(0xb08a3a,0,.3,1);const o={g,gears:[],t:0,act:0,m};
 eMk(g,EG.box,stone,0,.25,0,3.0,.5,1.7);eMk(g,EG.box,iron,0,.55,0,2.7,.12,1.5);for(const s of[-1,1]){eMk(g,EG.box,iron,s*1.2,1.7,-.1,.62,2.3,1.1);eMk(g,EG.box,stone,s*1.2,2.95,-.1,.8,.22,1.3);eMk(g,EG.sph,eM(V1,0x4020a0,.2,.3),s*1.2,3.2,-.1,.2,.2,.2);eMk(g,EG.box,vio,s*1.2,1.7,.46,.05,1.9,.012);
  const gear=new THREE.Group();gear.position.set(s*1.55,1.6,.2);eMk(gear,EG.cyl,iron,0,0,0,.62,.1,.62,Math.PI/2);eMk(gear,EG.cyl,brass,0,0,0,.42,.14,.42,Math.PI/2);eMk(gear,EG.cyl,vio,0,0,0,.14,.16,.14,Math.PI/2);for(let i=0;i<14;i++){const a=i/14*6.28;eMk(gear,EG.box,iron,Math.cos(a)*.66,Math.sin(a)*.66,0,.14,.14,.1,0,0,a)}for(let i=0;i<4;i++)eMk(gear,EG.box,iron,0,0,0,1.0,.08,.08,0,0,i*Math.PI/4);gear.userData.dyn=1;g.add(gear);o.gears.push({m:gear,s});
  const g2=new THREE.Group();g2.position.set(s*1.55,2.55,.2);eMk(g2,EG.cyl,iron,0,0,0,.34,.1,.34,Math.PI/2);for(let i=0;i<9;i++){const a=i/9*6.28;eMk(g2,EG.box,iron,Math.cos(a)*.38,Math.sin(a)*.38,0,.1,.1,.1,0,0,a)}g2.userData.dyn=1;g.add(g2);o.gears.push({m:g2,s:-s,k:1.7});for(const y of[.9,2.3])eMk(g,EG.cyl8,brass,s*.8,y,.55,.03,.5,.03,Math.PI/2*0,0,Math.PI/2)}
 eMk(g,EG.box,iron,0,3.18,-.1,2.6,.3,1.1);eMk(g,EG.box,stone,0,3.42,-.1,2.9,.2,1.25);for(let i=0;i<9;i++)eMk(g,EG.box,vio,-1.0+i*.25,3.18,.47,.08,.18+(i%3)*.04,.012);
 eMk(g,EG.box,eM(0x0a0a10,0,.6,.4),0,1.7,-.1,1.7,2.3,.8);o.portal=eMk(g,EG.pl,vioS,0,1.7,.32,1.5,2.1,1);o.portal2=eMk(g,EG.pl,eBasic(0xd0b0ff,.35,1),0,1.7,.34,1.1,1.7,1);
 o.ring=eMk(g,EG.tor,vio,0,1.7,.4,.85,.85,.85);o.ring2=eMk(g,EG.tor,eBasic(0xd0b0ff,.8),0,1.7,.42,.65,.65,.65);o.orb=eMk(g,EG.sph,eBasic(0xe0c8ff,.9,1),0,1.7,.3,.22,.22,.22);
 const sm=eSign('PACK-A-PUNCH',V1,320,84);o.sign=sm;eMk(g,EG.pl,sm,0,3.9,.56,2.4,.6,1);eMk(g,EG.box,iron,0,3.9,.2,2.5,.7,.7);
 /* the pedestal in front where the weapon hovers while it is being upgraded */
 eMk(g,EG.cyl,stone,0,.45,1.45,.55,.45,.55);eMk(g,EG.cyl,iron,0,.7,1.45,.62,.05,.62);o.disc=eMk(g,EG.cyl,vioS,0,.77,1.45,.5,.02,.5);o.beam=eMk(g,EG.cyl,eBasic(V1,.22,1),0,2.6,1.45,.3,1.9,.3);
 o.hov=new THREE.Group();o.hov.userData.dyn=1;o.hov.position.set(0,1.7,1.45);g.add(o.hov);eSpot(m.x+fx*1.2,1.8,m.z+fz*1.2,V1,1.6,13,.8);eSpot(m.x,3.0,m.z,0x8a50ff,1.0,10,.7);eHalo(m.x+fx*.6,1.8,m.z+fz*.6,.3,.16,.55,'H');
 eFlatten(g,.45,.7);const[ww,dd]=eSwap(m.f,3.1,1.8);zSolid(m.x,m.z,ww,dd,3.4);zG.add(g);EST.objs.pap=o;zq.mp.push({k:'pap',x:m.x,z:m.z,f:m.f,n:'Pack-a-Punch'});
 const pos=[m.x+fx*1.5,m.z+fz*1.5];zi.push({x:m.x+fx*.9,z:m.z+fz*.9,r:3.4,txt:()=>zPowered()?zPapTxt():'The power is off',cost:()=>zPowered()?zPapCost():0,act:()=>zPowered()?zPapAct(pos):noPower()})}
function estPap(start,p){const o=EST.objs.pap;if(!o)return;if(start){o.act=1;o.t=0;o.fin=0;while(o.hov.children.length)o.hov.remove(o.hov.children[0]);const k=p.mel?(zq.mel.k=='Nitrogen Fists'?'NF':zq.mel.k=='Katana'?'KT':null):p.w.k;const it=k?eGunModel(k,1.35):new THREE.Group();if(!k){eMk(it,EG.sph,eM(0xe6d0b0,0x201810,.6,0),0,0,0,.28,.2,.22)}o.hov.add(it);o.item=it;o.tier=p.tier}
 else{o.act=0;o.fin=1;o.t=0;burst(V(o.m.x,1.8,o.m.z),30,0xb070ff,8,.9,.14);while(o.hov.children.length)o.hov.remove(o.hov.children[0]);o.item=null}}
function estPapTick(o,dt,t){if(o.rolls)return lockboxPapTick(o,dt,t);const a=o.act?1:0;o.t+=dt;const sp=a?7:1.2;for(const q of o.gears)q.m.rotation.z+=q.s*dt*sp*(q.k||1);
 o.ring.rotation.z+=dt*(a?6:1.3);o.ring2.rotation.z-=dt*(a?9:2);o.ring.rotation.x=Math.sin(t*1.3)*.2;const pu=a?1.2+Math.sin(t*16)*.3:.7+Math.sin(t*2)*.12;o.orb.scale.setScalar(.18+pu*.1);o.portal.material.opacity=.4+(a?.35:.12)*Math.sin(t*(a?18:3));o.portal2.material.opacity=.25+.15*Math.sin(t*5+1);o.beam.material.opacity=a?.45:.14;o.disc.material.opacity=.4+.2*Math.sin(t*4);
 o.sign.color.setGray(.82+.18*Math.sin(t*9)+(Math.random()<.01?-.5:0));if(a){o.g.position.x=o.m.x+Math.sin(t*60)*.006;o.hov.rotation.y+=dt*3.2;o.hov.position.y=1.7+Math.sin(t*3)*.08;if(o.item)o.item.scale.setScalar(1+Math.sin(t*14)*.04)}else o.g.position.x=o.m.x;
 if(o.fin&&o.t>.8)o.fin=0}

/* ---------- Mystery Box ---------- */
function estBox(m,idx){const g=new THREE.Group(),f=eFace(m.f),[fx,fz]=eFwd(m.f);g.position.set(m.x,zObjectFloor(m.x,m.z),m.z);g.rotation.y=f;const wood=eM(0x4a2e18,0,.7,0),dwood=eM(0x2e1c0e,0,.75,0),iron=eM(0x1f2024,0,.4,.85),gold=eM(0xc9a23a,0x3a2a08,.28,1);
 if(!m.lockbox){
 eMk(g,EG.box,dwood,0,.12,0,1.9,.24,1.0);eMk(g,EG.box,wood,0,.52,0,1.84,.6,.94);for(const x of[-.75,0,.75])eMk(g,EG.box,iron,x,.5,0,.12,.68,1.0);for(const y of[.3,.74])eMk(g,EG.box,iron,0,y,.49,1.9,.07,.03);
 for(const s of[-1,1])for(const z of[-1,1]){eMk(g,EG.box,gold,s*.93,.84,z*.47,.1,.12,.1);eMk(g,EG.sph,gold,s*.93,.04,z*.47,.07,.07,.07)}for(const s of[-1,1])eMk(g,EG.tor,iron,s*.96,.55,0,.2,.2,.2,0,Math.PI/2);
 eMk(g,EG.box,eM(0x14120e,0,.5,.6),0,.62,.5,.5,.4,.04);eMk(g,EG.pl,eCanvasMat(64,64,(x,w,h)=>{x.fillStyle='#14120e';x.fillRect(0,0,w,h);x.font='900 56px Teko,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#ffd24a';x.shadowBlur=10;x.fillStyle='#ffd24a';x.fillText('?',32,36)},true),0,.62,.53,.36,.36,1);
 }
 /* the interior (lit gold when open) and the hinged lid */
 const inner=eBasic(0xffd24a,1),o_inner=eMk(g,EG.box,inner,0,.8,0,1.6,.04,.8);o_inner.visible=false;
 const lid=new THREE.Group();lid.userData.dyn=1;lid.position.set(0,.84,-.5);g.add(lid);if(m.lockbox){
  lockboxChest(g,lid);
 }else if(m.rect){
  eMk(lid,EG.box,wood,0,.09,.5,1.92,.18,1.02);
  for(const x of[-.76,.76])eMk(lid,EG.box,iron,x,.19,.5,.13,.04,1.03);
  eMk(lid,EG.box,gold,0,.035,1.025,.26,.14,.055);
 }else{
 const lm=wood.clone();lm.side=THREE.DoubleSide;const arch=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.92,20,1,false,0,Math.PI),lm);arch.rotation.z=Math.PI/2;arch.position.set(0,0,.5);arch.castShadow=true;lid.add(arch);
 for(const s of[-1,1]){const cap=new THREE.Mesh(new THREE.CircleGeometry(.5,18,0,Math.PI),dwood);cap.rotation.y=s*Math.PI/2;cap.position.set(s*.96,0,.5);cap.material.side=THREE.DoubleSide;lid.add(cap)}for(const x of[-.75,0,.75]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.12,20,1,true,0,Math.PI),iron);b.rotation.z=Math.PI/2;b.position.set(x,0,.5);b.material.side=THREE.DoubleSide;lid.add(b)}eMk(lid,EG.box,gold,0,.18,1.02,.3,.2,.06);
 }
 const o={g,lid,baseY:g.position.y,st:0,t:0,cy:0,by:null,item:null,m,fx,fz,ang:0,inner:o_inner};
 o.beam=new THREE.Mesh(new THREE.CylinderGeometry(.55,.9,7,16,1,true),eBasic(0xffd24a,.2,1));o.beam.position.set(0,4.2,0);o.beam.visible=false;g.add(o.beam);o.lab=zSprite('','#ffd24a',.42,1);o.lab.position.set(0,2.7,0);o.lab.visible=false;g.add(o.lab);
 o.wm=new THREE.Group();o.wm.userData.dyn=1;o.wm.position.set(0,1.6,0);g.add(o.wm);o.models={};o.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:LX.effectTextures().glow,color:0xffd24a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));o.halo.scale.set(3,3,1);o.halo.position.set(0,1.6,0);g.add(o.halo);
 o.sp={x:m.x,y:1.4,z:m.z,col:0xffd24a,I:0,d:12,fl:.5,ph:0,cur:0,want:0,L:null};EST.spots.push(o.sp);
 eFlatten(g,.7,.2);const[ww,dd]=eSwap(m.f,2.0,1.1);o.sw=[m.x,m.z,ww,dd];o.on=false;g.visible=false;zG.add(g);zboxes.push(o);EST.objs.boxes.push(o);
 zi.push({x:m.x,z:m.z,r:3.2,txt:()=>!o.on||o.st==3?'':o.st==0?'Mystery Box':o.st==2&&o.by==zMe()?'Take the '+zItemName(o.item):'',cost:()=>o.st==0?zBoxCost():0,act:()=>zBoxAct(o,idx)})}
function estBoxState(o,st){if(st==1){burst(V(o.m.x,1,o.m.z),22,0xffd24a,6,.7,.12);noise(.25,300,.2);beep(160,.4,'triangle',.07)}else if(st==0){while(o.wm.children.length)o.wm.remove(o.wm.children[0]);o.cur=null;noise(.2,200,.2)}}
function estBoxShow(o,k,fin){if(o.cur!==k||fin){while(o.wm.children.length)o.wm.remove(o.wm.children[0]);const it=eGunModel(k,fin?1.4:1.15);o.wm.add(it);o.cur=k}if(fin){burst(V(o.m.x,1.9,o.m.z),26,['RG','NF','KEY'].includes(k)?0xff4a4a:0x7bf08a,6,.7,.12);shake=Math.max(shake,.15)}}
function estBoxTick(o,dt,t){const open=o.st==3?-1.9*Math.max(0,Math.sin(t*26)):o.st>0?-1.9:0,fire=zq.pu&&zq.pu.fire>0;
 if(o.st==3){o.g.rotation.z=Math.sin(t*55)*.05*Math.min(1,o.t*2);o.g.position.y=o.baseY+Math.max(0,Math.sin(t*34))*.06;if(Math.random()<dt*30)burst(V(o.m.x+(Math.random()-.5)*1.4,.8+Math.random()*.6,o.m.z+(Math.random()-.5)*1.4),1,0xff4a4a,2.5,.5,.1)}else if(o.drop>0){o.drop-=dt*1.9;o.g.position.y=o.baseY+Math.max(0,o.drop*o.drop*16);if(o.drop<=0){o.g.position.y=o.baseY;burst(V(o.m.x,.2,o.m.z),34,0xc9a23a,6,.9,.16);burst(V(o.m.x,.1,o.m.z),18,0x8a8070,4,.8,.2);noise(.4,120,.5);beep(70,.3,'sawtooth',.1);shake=Math.max(shake,.45)}}else{o.g.rotation.z=0}o.lid.rotation.x+=(open-o.lid.rotation.x)*Math.min(1,dt*(o.st>0?9:6));const opn=Math.min(1,-o.lid.rotation.x/1.6);o.inner.visible=opn>.1;o.inner.material.color.setHex(fire?0xff6ab8:0xffd24a);
 const tc=fire?0xff6ab8:0xffd24a;o.beam.material.color.setHex(tc);o.halo.material.color.setHex(tc);o.halo.material.opacity=opn*(.55+.15*Math.sin(t*7));o.sp.I=opn*1.9;o.sp.col=tc;
 if(o.st>0){const rise=o.st==2?1.7:1.25+.2*Math.sin(o.t*10);o.wm.position.y+=(rise-o.wm.position.y)*Math.min(1,dt*5);o.wm.rotation.y+=dt*(o.st==2?1.8:6);if(o.st==1&&Math.random()<dt*20)burst(V(o.m.x,1.4,o.m.z),1,tc,2,.5,.08)}else{o.wm.position.y=1.0;o.wm.rotation.y=0}
 if(fire&&o.st==0&&Math.random()<dt*3)burst(V(o.m.x,1.2+Math.random(),o.m.z),1,0xff6ab8,1.5,.8,.08);o.beam.visible=o.st>0||fire}

/* ---------- wall weapons ---------- */
/* ---------- wall buys are chalk drawings on the wall: the outline of the weapon, traced from its own model, with chalk grain, dust and a hand-written name and price.
   They brighten as you come near and puff chalk dust when you buy. ---------- */
function chalkMake(k,cost,mat){const W_=1024,H_=512,cv=document.createElement('canvas');cv.width=W_;cv.height=H_;const x=cv.getContext('2d',{willReadFrequently:true}),tex=new THREE.CanvasTexture(cv);mat.map=tex;mat.needsUpdate=true;
 let sd=0;for(const c of k)sd=(sd*31+c.charCodeAt(0))>>>0;const rn=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
 const grain=()=>{const d=x.getImageData(0,0,W_,H_),a=d.data;for(let i=3;i<a.length;i+=4)if(a[i]){const n=rn();a[i]=n<.1?0:a[i]*(.5+.5*n)}x.putImageData(d,0,0)};
 const finish=()=>{/* hand-written name and price, a wobbly underline, tally marks */
  const nm=(typeof zItemName=='function'?zItemName(k):k).toUpperCase();x.save();x.shadowColor='rgba(255,250,235,.5)';x.shadowBlur=6;x.fillStyle='#f6f1e3';x.strokeStyle='#f6f1e3';x.textAlign='center';x.textBaseline='middle';x.font='700 74px Teko,Impact,sans-serif';x.save();x.translate(W_/2,H_-82);x.rotate(-.012);x.fillText(nm,0,0);x.restore();
  x.font='700 52px Teko,Impact,sans-serif';x.fillText(String(cost),W_/2,H_-30);x.lineWidth=5;x.lineCap='round';x.beginPath();let px=W_/2-250,py=H_-125;x.moveTo(px,py);for(let i=1;i<=18;i++){px=W_/2-250+i*500/18;py=H_-125+Math.sin(i*1.7+k.length)*4+rn()*3;x.lineTo(px,py)}x.stroke();
  x.lineWidth=4;for(let i=0;i<4;i++){const bx=60+i*14;x.beginPath();x.moveTo(bx,H_-70);x.lineTo(bx+rn()*3,H_-30);x.stroke()}x.beginPath();x.moveTo(52,H_-40);x.lineTo(112,H_-62);x.stroke();x.restore();grain();tex.needsUpdate=true};
 const draw=img=>{x.clearRect(0,0,W_,H_);
  if(img){const sw=640,sh=300,t=document.createElement('canvas');t.width=sw;t.height=sh;const c=t.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,sw,sh);const d=c.getImageData(0,0,sw,sh),a=d.data,o=c.createImageData(sw,sh),q=o.data;
   const al=(i,j)=>i<0||j<0||i>=sw||j>=sh?0:a[(j*sw+i)*4+3],lu=(i,j)=>{const p=(Math.max(0,Math.min(sh-1,j))*sw+Math.max(0,Math.min(sw-1,i)))*4;return a[p]*.3+a[p+1]*.59+a[p+2]*.11};
   let x0=sw,x1=0,y0=sh,y1=0;for(let j=1;j<sh-1;j++)for(let i=1;i<sw-1;i++){const p=(j*sw+i)*4;if(a[p+3]<40)continue;const edge=al(i-1,j)<40||al(i+1,j)<40||al(i,j-1)<40||al(i,j+1)<40;let v=0;if(edge)v=255;else{const gx=lu(i+1,j)-lu(i-1,j),gy=lu(i,j+1)-lu(i,j-1);if(Math.abs(gx)+Math.abs(gy)>34)v=170}
     if(v){q[p]=q[p+1]=q[p+2]=255;q[p+3]=v;if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}}
   c.putImageData(o,0,0);const bw=Math.max(40,x1-x0),bh=Math.max(20,y1-y0),s=Math.min(W_*.84/bw,(H_-190)/bh),dw=sw*s,dh=sh*s,ox=W_/2-(x0+bw/2)*s,oy=(H_-190)/2+10-(y0+bh/2)*s;
   x.save();x.shadowColor='rgba(255,250,235,.55)';x.shadowBlur=9;x.globalAlpha=.95;for(const[jx,jy]of[[0,0],[1.6,.8],[-1.2,1.4],[.6,-1.1]])x.drawImage(t,ox+jx,oy+jy,dw,dh);x.restore()}
  else{x.strokeStyle='#f6f1e3';x.lineWidth=6;x.strokeRect(W_*.2,60,W_*.6,200)}
  finish()};
 /* text first, so a wall is never blank; the traced outline follows */
 finish();try{const url=typeof ZMELEE!='undefined'&&ZMELEE[k]?objImg('chalk-'+k,()=>objBuild(k=='NF'?'nfists':'katana')):wImg(k);if(url){const im=new Image();im.onload=()=>draw(im);im.onerror=()=>draw(null);im.src=url}else draw(null)}catch(e){draw(null)}}
function estWall(m){const k=m.k;if(!ZMELEE[k]&&!W[k])return;const g=new THREE.Group(),f=eFace(m.f),[fx,fz]=eFwd(m.f),height=m.y??1.75,scale=m.scale??1;g.position.set(m.x,zObjectFloor(m.x,m.z),m.z);g.rotation.y=f;const o={g,k,m,glow:0,pop:0};
 const cost=ZMELEE[k]?ZMELCOST[k]:zWallCost(k),mat=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:.7,side:THREE.DoubleSide});o.chalk=mat;
 const pl=new THREE.Mesh(EG.pl,mat);pl.position.set(0,height,.03);pl.scale.set(2.3*scale,1.15*scale,1);g.add(pl);
 setTimeout(()=>chalkMake(k,cost,mat),20+(EST.objs.walls.length%12)*45);
 o.sp={x:m.x+fx*.9,y:height+.35,z:m.z+fz*.9,col:0xe8ecff,I:.3,d:5.5,fl:.12,ph:erand()*9,cur:0,want:0,L:null};EST.spots.push(o.sp);
 zG.add(g);EST.objs.walls.push(o);const px=m.x+fx*1.2,pz=m.z+fz*1.2;
 zi.push({x:px,z:pz,r:2.5,txt:()=>{
  if(m.focus){
   const x=m.x+fx*.03-C.position.x,y=height-C.position.y,z=m.z+fz*.03-C.position.z,d=aimDir();
   if(d.x*x+d.y*y+d.z*z<.965*Math.hypot(x,y,z))return '';
  }
  return zWallTxt(k);
 },cost:()=>zWallCostNow(k),act:()=>zBuyWall(k,[m.x+fx*.6,m.z+fz*.6,m.y])})}
function estWallTick(o,dt,t){const near=Math.hypot(P.x-o.m.x,P.z-o.m.z)<7;o.glow+=((near?1:0)-o.glow)*Math.min(1,dt*4);
 o.chalk.opacity=Math.min(1,(.66+.34*o.glow)*(.93+.07*Math.sin(t*2.1+o.m.x*3))+Math.max(0,o.pop)*.3);o.sp.I=.2+.45*o.glow;
 if(o.pop>0){o.pop-=dt*1.6;if(o.pop>.7&&!o.pd){o.pd=1;const[fx,fz]=eFwd(o.m.f);try{burst(V(o.m.x+fx*.25,(o.m.y??1.75)-.05,o.m.z+fz*.25),22,0xf4efe0,2.4,1.1,.06)}catch(e){}}if(o.pop<=0)o.pd=0}}

/* ---------- ONE Mystery Box per map: a random spot every match (never a dead end at the start), and after 20 to 30 completed spins it moves to a new random spot ---------- */
function estBoxSet(o,on){if(o.on===on)return;o.on=on;o.g.visible=on;if(on){o.sol=zSolid(o.sw[0],o.sw[1],o.sw[2],o.sw[3],.95);zGrid()}else if(o.sol){zUnsolid(o.sol);o.sol=null}}
function estBoxThr(){return 20+Math.floor(Math.random()*11)}
function estBoxGo(i,quiet){const B=zboxes;if(!B[i])return;const old=EST.bx&&EST.bx.loc>=0?B[EST.bx.loc]:null;if(!EST.bx)EST.bx={loc:-1,uses:0,thr:estBoxThr()};if(old&&old!==B[i]){burst(V(old.m.x,1,old.m.z),46,0xffd24a,8,1,.14);burst(V(old.m.x,1.4,old.m.z),24,0xff4a4a,5,.9,.12)}
 B.forEach((o,j)=>{estBoxSet(o,j==i);if(j!=i){o.st=0;o.g.position.y=o.baseY;o.g.rotation.z=0;if(o.beam)o.beam.visible=false;if(o.lab)o.lab.visible=false;if(o.sp)o.sp.I=0}});EST.bx.loc=i;EST.bx.uses=0;EST.bx.thr=estBoxThr();if(!quiet){B[i].drop=1;B[i].g.position.y=B[i].baseY+16;beep(900,.25,'triangle',.08);setTimeout(()=>beep(1300,.2,'triangle',.07),130)}}
function estBoxInit(){const B=zboxes;if(!B.length)return;EST.bx={loc:-1,uses:0,thr:estBoxThr()};const sp=(MAPS[sel.map]&&MAPS[sel.map].ps)||[0,0],ord=B.map((o,i)=>i).sort((a,b)=>Math.hypot(B[a].m.x-sp[0],B[a].m.z-sp[1])-Math.hypot(B[b].m.x-sp[0],B[b].m.z-sp[1])),start=ord.filter(i=>B[i].m.startBox),pool=start.length?start:ord.slice(0,Math.max(1,Math.ceil(B.length*2/3)));estBoxGo(pool[Math.random()*pool.length|0],1)}
/* ---------- ammo crates ---------- */
function estCrate(m){const g=new THREE.Group(),f=eFace(m.f),[fx,fz]=eFwd(m.f);g.position.set(m.x,zObjectFloor(m.x,m.z),m.z);g.rotation.y=f;const od=eM(0x4a5628,0,.7,.35),dk=eM(0x2a3318,0,.7,.4),metal=eM(0x2a2c2a,0,.4,.85),brass=eM(0xc9a23a,0x3a2a08,.3,1);const o={g,m,open:0,pulse:0,fx,fz};
 eMk(g,EG.box,od,0,.26,0,.96,.5,.62);for(const x of[-.34,0,.34])eMk(g,EG.box,dk,x,.26,.0,.06,.52,.66);for(const y of[.1,.42])eMk(g,EG.box,dk,0,y,0,1.0,.05,.66);
 for(const s of[-1,1]){eMk(g,EG.box,metal,s*.5,.3,0,.04,.22,.2);eMk(g,EG.tor,metal,s*.5,.3,.0,.08,.08,.08,0,Math.PI/2)}for(const s of[-1,1])eMk(g,EG.box,metal,s*.3,.52,.33,.1,.12,.04);
 eMk(g,EG.pl,eCanvasMat(128,64,(x,w,h)=>{x.fillStyle='#3c4820';x.fillRect(0,0,w,h);x.fillStyle='#e8e6d0';x.font='900 44px Teko,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('AMMO',w/2,h/2+2);x.fillStyle='#e0b020';for(let i=0;i<6;i++)x.fillRect(i*22,0,10,5),x.fillRect(i*22,h-5,10,5)}),0,.28,.325,.7,.34,1);
 const inner=eBasic(0x40ff70,.9,1);o.inner=eMk(g,EG.box,inner,0,.5,0,.8,.02,.5);o.inner.visible=false;
 for(let i=0;i<8;i++){const b=new THREE.Group();b.userData.dyn=1;b.position.set(-.33+i*.095,.5,0);eMk(b,EG.cyl8,brass,0,.07,0,.03,.08,.03);eMk(b,EG.cone,eM(0xb06a2a,0,.4,.7),0,.18,0,.03,.1,.03);b.visible=false;g.add(b);(o.rounds=o.rounds||[]).push(b)}
 const lid=new THREE.Group();lid.userData.dyn=1;lid.position.set(0,.52,-.31);g.add(lid);eMk(lid,EG.box,od,0,.04,.31,1.0,.08,.64);eMk(lid,EG.box,dk,0,.1,.31,.9,.04,.54);for(const x of[-.34,.34])eMk(lid,EG.box,dk,x,.09,.31,.07,.06,.66);eMk(lid,EG.box,metal,0,.08,.62,.3,.1,.05);o.lid=lid;
 eMk(g,EG.box,eBasic(0x40ff70,1),.4,.5,.34,.08,.025,.012);o.led=g.children[g.children.length-1];
 o.sp={x:m.x+fx*.6,y:.9,z:m.z+fz*.6,col:0x6aff8a,I:.5,d:6,fl:.3,ph:erand()*9,cur:0,want:0,L:null};EST.spots.push(o.sp);
 eFlatten(g,.65,.35);const[ww,dd]=eSwap(m.f,1.05,.7);zSolid(m.x,m.z,ww,dd,.6);zG.add(g);EST.objs.crates.push(o);const pos=[m.x+fx*.7,m.z+fz*.7];
 zi.push({x:m.x+fx*.8,z:m.z+fz*.8,r:2.5,txt:()=>{if(P.dead)return'';const w=cw();return w?(zAmmoFull(w)?'Ammo is full':'Ammo for '+(w.pn||W[w.k].n)):''},cost:()=>{const w=cw();return w&&!zAmmoFull(w)?zAmmoPrice(w,0):0},act:()=>{o.pulse=1;zBuyAmmo(0,pos)}})}
function estCrateTick(o,dt,t){const d=Math.hypot(P.x-o.m.x,P.z-o.m.z),op=d<4.2?1:0;o.open+=(op-o.open)*Math.min(1,dt*(op?7:4));let la=-o.open*1.75;if(o.pulse>0){o.pulse-=dt*2;la=-(1.75*(1-Math.min(1,(1-o.pulse)*2)))*(o.pulse>.5?1:o.pulse*2)}o.lid.rotation.x=la;o.inner.visible=o.open>.2;const on=o.open>.5;for(const b of o.rounds)b.visible=on;
 o.sp.I=.45+.9*o.open+(o.pulse>0?1.2:0);o.led.material.color.setHex(o.open>.5?0x40ff70:0x206a30);if(o.pulse>0&&Math.random()<dt*40)burst(V(o.m.x+o.fx*.1,.8,o.m.z+o.fz*.1),2,0xc9a23a,4,.5,.07)}
function estBuy(x,z){const m=new THREE.Mesh(new THREE.RingGeometry(.4,.55,32),new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.rotation.x=-PI/2;m.position.set(x,zObjectFloor(x,z)+.12,z);EST.mapG&&EST.mapG.add(m);EST.objs.rings.push({m,t:0});
 for(const w of EST.objs.walls)if(Math.hypot(w.m.x-x,w.m.z-z)<2.4)w.pop=1}

/* ---------- build everything for a match ---------- */
function estObjects(M){EST.spots=EST.spots.filter(s=>!s.dyn);for(const sl of EST.pool||[]){sl.s=null;if(sl.L)sl.L.intensity=0}for(const s of EST.spots){s.L=null;s.cur=0;s.want=0}const n0=EST.spots.length;EST.objs={doors:[],mach:{},boxes:[],walls:[],crates:[],rings:[],pap:null};M.dr.forEach((d,i)=>estDoor(d,i));
 for(const m of M.mc){if(PERKS[m.t])estPerkMachine(m,m.t);else if(m.t=='pap')estPapMachine(m);else if(m.t=='box')estBox(m,zboxes.length);else if(m.t=='wall')estWall(m);else if(m.t=='ammo')estCrate(m)}estBoxInit();if(M.objs)M.objs(M);for(let i=n0;i<EST.spots.length;i++){const light=EST.spots[i];light.dyn=1;light.y+=zObjectFloor(light.x,light.z)}}

/* ---------- per frame ---------- */
function estTick(dt){const t=EST.tm+=dt,M=MAPS[sel.map];if(!M||!M.zm)return;
 for(const d of EST.dyn)d.tick(dt,t);const O=EST.objs;for(const d of O.doors)estDoorTick(d,dt);for(const k in O.mach)estMachTick(O.mach[k],dt,t);for(const b of O.boxes)if(b.on)estBoxTick(b,dt,t);for(const w of O.walls)estWallTick(w,dt,t);for(const c of O.crates)estCrateTick(c,dt,t);if(O.pap)estPapTick(O.pap,dt,t);
 for(let i=O.rings.length-1;i>=0;i--){const r=O.rings[i];r.t+=dt;const u=r.t/.7;r.m.scale.setScalar(1+u*6);r.m.material.opacity=.7*(1-u);if(u>=1){r.m.parent&&r.m.parent.remove(r.m);r.m.geometry.dispose();O.rings.splice(i,1)}}
 /* the world: indoors is darker than the grounds; storms flash through the boarded windows */
 const inside=sel.map===JUPITER_MAP?false:!M.modName&&!!eRoomAt(P.x,P.z);EST.amb=(EST.amb==null?1:EST.amb);EST.amb+=((inside?.62:1)-EST.amb)*Math.min(1,dt*2.2);
 const lt=EST.lt,dayM=!!M.day;lt.next-=dt;if(dayM)lt.next=Math.max(lt.next,60);if(lt.next<=0){lt.next=9+Math.random()*19;lt.flash=1;lt.rep=Math.random()<.5?2:1;setTimeout(()=>{if(zq){noise(1.6,90,.45);beep(48,1.3,'sawtooth',.09)}},350+Math.random()*1100)}
 if(lt.flash>0){lt.flash=Math.max(0,lt.flash-dt*(lt.flash>.5?2.6:1.6));if(lt.flash<.3&&lt.rep>1){lt.rep--;lt.flash=.9}}
 const base=(M.hemi||.62)*(LX.pbr?.55:1);hemi.intensity=base*EST.amb*(1+lt.flash*(dayM?.25:1.7));sun.intensity=((M.sunI==null?.3:M.sunI)*(LX.pbr?1.2:1))*(1+lt.flash*(dayM?.3:3.2));if(lt.flash>.4)LX.fx.pulse=Math.max(LX.fx.pulse,lt.flash*(dayM?.12:.25));
 if(EST.fog)for(const f of EST.fog){f.s.position.x+=f.vx*dt;if(f.s.position.x>52)f.s.position.x=-52;if(f.s.position.x<-52)f.s.position.x=52;f.s.material.opacity=.14+.1*Math.sin(t*.3+f.ph)}
 /* the pooled lights */
 estLights(dt,t)}
var _estLT=0;
function estLights(dt,t){const sp=EST.spots,pool=EST.pool;if(!pool||!pool.length)return;_estLT-=dt;
 if(_estLT<=0){_estLT=.12;const view=jupiterIntroActive()?zq.jupiter.intro.camera.position:C.position,cx=view.x,cz=view.z;for(const s of sp)s.d2=(s.x-cx)*(s.x-cx)+(s.z-cz)*(s.z-cz)+(s.I>0?0:1e6);const ord=sp.slice().sort((a,b)=>a.d2-b.d2).slice(0,pool.length),set=new Set(ord);
  for(const sl of pool)if(sl.s&&!set.has(sl.s))sl.s.want=0;for(const sl of pool)if(sl.s&&sl.s.cur<.03&&sl.s.want==0){sl.s.L=null;sl.s=null;sl.L.intensity=0}
  for(const s of ord){if(s.L||s.I<=0)continue;const sl=pool.find(q=>!q.s);if(!sl)break;sl.s=s;s.L=sl.L;s.want=1;sl.L.position.set(s.x,s.y,s.z);sl.L.color.setHex(s.col);sl.L.distance=s.d}
  for(const s of ord)if(s.L)s.want=1}
 for(const sl of pool){const s=sl.s;if(!s)continue;s.cur+=(s.want-s.cur)*Math.min(1,dt*5);const fl=1+(Math.sin(t*(7+s.ph%5)+s.ph)*.5+Math.sin(t*13.7+s.ph*2)*.3)*.07*s.fl+(Math.random()<.02?-.12*s.fl:0);sl.L.intensity=Math.max(0,s.I)*s.cur*fl;if(s.col!==sl.c){sl.c=s.col;sl.L.color.setHex(s.col)}}}
/* flame points flicker, chimney smoke rises */
function estFlicker(dt,t){const S_=EST.ptm;if(!S_)return;for(const k in S_){const e=S_[k],s=e.s,n=s.p.length/3,ca=e.col.array;if(k=='s'){const pa=e.m.geometry.attributes.position.array;for(let i=0;i<n;i++){const ph=s.f[i*2+1],u=((t*.22+ph*.17)%1);pa[i*3+1]=s.p[i*3+1]+u*6;pa[i*3]=s.p[i*3]+Math.sin(t*.7+ph)*u*1.4;const f=(1-u)*.55;ca[i*3]=s.base[i*3]*f;ca[i*3+1]=s.base[i*3+1]*f;ca[i*3+2]=s.base[i*3+2]*f}e.m.geometry.attributes.position.needsUpdate=true;e.col.needsUpdate=true;continue}
  const amp=k=='F'?.5:k=='f'?.3:.14;for(let i=0;i<n;i++){const ph=s.f[i*2+1],fl=s.f[i*2],f=fl?1+(Math.sin(t*(9+ph%6)+ph)*.5+Math.sin(t*17+ph*3)*.35)*amp+(Math.random()<.04?-.25*fl:0):1;ca[i*3]=s.base[i*3]*f;ca[i*3+1]=s.base[i*3+1]*f;ca[i*3+2]=s.base[i*3+2]*f}e.col.needsUpdate=true}}
/* a new round: thunder, a low bell, and a red flash when the brutes come */
function estRound(r,br){const dm=MAPS[sel.map]&&MAPS[sel.map].day;EST.lt.flash=dm?.35:1;EST.lt.rep=dm?1:2;EST.lt.next=14+Math.random()*10;if(br){LX.fx.dmg=Math.max(LX.fx.dmg,.35);shake=Math.max(shake,.4)}}

/* the map is built lazily; if the Zombies mode is the saved mode make sure the menu shows the new mansion */
if(typeof sel!=='undefined'&&sel.mode=='Zombies'&&typeof fixZM=='function'){try{fixZM();ui();buildMap()}catch(e){console.warn('estate init',e)}}
;

/* ######## juice.js ######## */
/* ===================== juice.js ===================== */
/* ---------- JUICE: everything that makes the world react. Loads after the game systems and before the anti-cheat in streaks.js, so the functions it extends are wrapped in the same order as everything else.
   - model hooks:  guns get metal / polymer materials, people get cloth and skin, small box parts get rounded edges (see lumen.js)
   - dynamic light: a fixed pool of 3 point lights flashes at muzzles, explosions and kills (the pool never changes size, so shaders never recompile)
   - explosions:   fireball, shockwave ring, rolling smoke, sparks, scorch marks on the ground, camera shake, chromatic kick, lens bloom
   - shooting:     glowing tracers, muzzle flares, ejected shell casings, muzzle smoke, recoil kick in the post-processing
   - feedback:     damage flash, low-health heartbeat, sprint blur, heal glow, kill pulse, hit-marker pop
   - atmosphere:   a per-map cloud of floating dust, pollen, ash, embers or fireflies; waving flags; spinning zone rings
   Everything lives in one function so it adds no globals except JX. Note: inside it `F` is the post-processing state (LX.fx) and `fx` is still the game's own effects array. ---------- */
(function(){
const hi=LX.pbr,V3=THREE.Vector3,JX=window.JX={lights:[],sp:[],rings:[],cas:[],scorch:[]},rnd=(a,b)=>a+Math.random()*(b-a),F=LX.fx,T=()=>LX.U.time.value;
const cv=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
const {glow:glowTex,flare:flareTex,smoke:[puffTex]}=LX.effectTextures();
JX.glowTex=glowTex;
/* ---------- sprite pool: fireballs, flares, smoke, glints ---------- */
function addSp(o){if(JX.sp.length>170)return null;const m=new THREE.SpriteMaterial({map:o.tex||glowTex,transparent:true,depthWrite:false,blending:o.add===false?THREE.NormalBlending:THREE.AdditiveBlending,opacity:o.op==null?1:o.op});m.color.setRGB(o.c[0],o.c[1],o.c[2]);if(o.rot!=null)m.rotation=o.rot;
 const s=new THREE.Sprite(m);s.position.copy(o.p);s.scale.setScalar(o.s0);s.renderOrder=3;S.add(s);JX.sp.push({s,m,a:0,L:o.life,s0:o.s0,s1:o.s1==null?o.s0:o.s1,op:o.op==null?1:o.op,v:o.v||null,g:o.g||0,dr:o.dr==null?1:o.dr,rot:o.vr||0,io:!!o.io});return s}
function ring(p,r0,r1,life,col,op){if(JX.rings.length>8)return;const m=new THREE.Mesh(JX.ringG||(JX.ringG=new THREE.RingGeometry(.86,1,56)),new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:op}));
 m.position.copy(p);m.rotation.x=-Math.PI/2;m.scale.setScalar(r0);m.renderOrder=3;S.add(m);JX.rings.push({m,a:0,L:life,r0,r1,op})}
function scorch(p,r){if(!hi||p.y>1.2)return;const m=new THREE.Mesh(JX.scG||(JX.scG=new THREE.CircleGeometry(1,28)),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
 m.rotation.x=-Math.PI/2;m.position.set(p.x,.035,p.z);m.scale.setScalar(r);S.add(m);JX.scorch.push({m,a:0,L:11});if(JX.scorch.length>10){const o=JX.scorch.shift();S.remove(o.m);o.m.material.dispose()}}
/* ---------- the light pool ---------- */
if(hi)for(let i=0;i<3;i++){const l=new THREE.PointLight(0xffc070,0,16);l.position.set(0,-99,0);S.add(l);JX.lights.push({l,t:0,d:.1,I:0})}
JX.flash=function(p,col,I,life,dist){if(!JX.lights.length)return;let b=JX.lights[0];for(const x of JX.lights)if(x.t<b.t)b=x;b.l.position.copy(p);b.l.color.setHex(col);b.l.distance=dist;b.I=I;b.d=life;b.t=life};
/* ---------- explosions ---------- */
JX.explode=function(p,g){if(!hi)return;const R_=Math.max(3,g&&g.R||6),near=C.position.distanceTo(p),prox=Math.max(0,1-near/(R_*3.2));
 F.boom=Math.min(1,Math.max(F.boom,.25+prox*.9));F.ca=Math.min(1,F.ca+prox*.8);if(near<R_*1.2)F.flash=Math.max(F.flash,.3*prox);
 JX.flash(p,0xffa545,18,.55,R_*4);
 addSp({p:p.clone(),s0:R_*.5,s1:R_*1.9,life:.5,c:[3.2,1.6,.5],op:1});addSp({p:p.clone(),s0:R_*.25,s1:R_*1.1,life:.28,c:[5,4,3],op:1});
 addSp({p:p.clone().add(V(0,R_*.2,0)),s0:R_*.9,s1:R_*2.4,life:.65,c:[1.6,.55,.12],op:.55,tex:flareTex});
 ring(V(p.x,Math.max(.08,p.y),p.z),.6,R_*1.5,.5,0xffcf8a,.9);ring(V(p.x,Math.max(.1,p.y),p.z),.3,R_*.9,.35,0xffffff,.6);
 for(let i=0;i<9;i++){const a=rnd(0,6.28),d=rnd(.1,R_*.35);addSp({p:V(p.x+Math.cos(a)*d,p.y+rnd(0,R_*.3),p.z+Math.sin(a)*d),s0:R_*.35,s1:R_*rnd(1.2,2),life:rnd(1.6,2.6),c:[.2,.2,.21],op:rnd(.28,.45),add:false,tex:puffTex,v:V(rnd(-.5,.5),rnd(.8,1.8),rnd(-.5,.5)),dr:.96,vr:rnd(-.4,.4),rot:rnd(0,6)})}
 for(let i=0;i<14;i++){const a=rnd(0,6.28),sp=rnd(3,10);addSp({p:p.clone(),s0:.22,s1:.02,life:rnd(.5,1.1),c:[3,1.6,.5],op:1,v:V(Math.cos(a)*sp,rnd(2,9),Math.sin(a)*sp),g:-14,dr:.99})}
 scorch(p,R_*.55)};
/* ---------- RayGun ooze: ONE shared effect for the player, bots, other players and zombie co-op (rgImpact). A small, bright, glossy crimson-pink burst, not blood:
   luminous (it blooms), a hot pale core, round gel blobs that arc out and land as glowing puddles that bubble and shrink away, with a few drifting glowing spores. ---------- */
{const gm=[2.3,1.8,1.35].map(k=>{const m=new THREE.MeshBasicMaterial({color:0xff2410});m.color.multiplyScalar(k);return m}),
 hot=(()=>{const m=new THREE.MeshBasicMaterial({color:0xffc8a8});m.color.multiplyScalar(2.2);return m})(),
 pt=cv(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,3,64,64,62);r.addColorStop(0,'rgba(255,205,170,.95)');r.addColorStop(.3,'rgba(255,48,22,.9)');r.addColorStop(.75,'rgba(200,14,6,.6)');r.addColorStop(.93,'rgba(255,90,50,.5)');r.addColorStop(1,'rgba(150,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h)}),
 pm=()=>{const m=new THREE.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false,opacity:.9});m.color.setRGB(1.6,1,1);return m},
 pg_=new THREE.CircleGeometry(1,18);JX.goops=[];JX.puds=[];
 JX.goop=function(p,g){if(!hi)return;const R_=Math.max(2,(g&&g.R)||3.2),near=C.position.distanceTo(p),prox=Math.max(0,1-near/(R_*3.4));
  F.boom=Math.min(1,Math.max(F.boom,.12+prox*.5));F.ca=Math.min(1,F.ca+prox*.35);if(near<R_*1.2)F.flash=Math.max(F.flash,.18*prox);
  JX.flash(p,0xff2a14,12,.4,R_*3.6);
  addSp({p:p.clone(),s0:R_*.28,s1:R_*.95,life:.34,c:[3.2,.2,.1],op:1,tex:flareTex});addSp({p:p.clone(),s0:R_*.14,s1:R_*.55,life:.2,c:[4,2.5,2.1],op:1});
  addSp({p:p.clone().add(V(0,R_*.12,0)),s0:R_*.5,s1:R_*1.2,life:.5,c:[1.5,.1,.05],op:.5,tex:flareTex});
  ring(V(p.x,Math.max(.08,p.y),p.z),.4,R_*1.05,.38,0xff5a3a,.85);ring(V(p.x,Math.max(.1,p.y),p.z),.2,R_*.6,.26,0xffd0de,.6);
  const n=Math.min(JX.goops.length>44?6:20,26);for(let i=0;i<n;i++){const a=rnd(0,6.283),sp=rnd(2,6.5),m=new THREE.Mesh(sg,i%5==0?hot:gm[i%3]),s=rnd(.045,.12);m.scale.set(s,s*rnd(.8,1.25),s);m.position.copy(p);S.add(m);JX.goops.push({m,v:V(Math.cos(a)*sp,rnd(2.2,6.8),Math.sin(a)*sp),s,t:0})}
  for(let i=0;i<7;i++){const a=rnd(0,6.283),d=rnd(.1,R_*.4);addSp({p:V(p.x+Math.cos(a)*d,p.y+rnd(0,.5),p.z+Math.sin(a)*d),s0:.1,s1:.34,life:rnd(.9,1.6),c:[2.6,.45,1],op:.8,tex:glowTex,v:V(rnd(-.4,.4),rnd(.5,1.4),rnd(-.4,.4)),dr:.95})}
  JX.pud(p.x,Math.max(.05,Math.min(p.y,.3)),p.z,R_*.55)};
 /* a glowing gel puddle on the floor: it spreads, bubbles, then shrinks away */
 JX.pud=function(x,y,z,r){if(y>.4&&JX.puds.length>10)return;if(JX.puds.length>16){const o=JX.puds.shift();S.remove(o.m);o.m.material.dispose()}const m=new THREE.Mesh(pg_,pm());m.rotation.x=-Math.PI/2;m.rotation.z=rnd(0,6.28);m.position.set(x,.05+rnd(0,.012),z);m.scale.setScalar(.1);S.add(m);JX.puds.push({m,r:r*rnd(.8,1.15),t:0,b:0})};
 JX.tickG=function(dt){const G=JX.goops;for(let i=G.length-1;i>=0;i--){const o=G[i];o.t+=dt;o.v.y-=17*dt;o.m.position.addScaledVector(o.v,dt);o.m.scale.y=o.s*(1+Math.min(.5,Math.abs(o.v.y)*.05));
   let hit=0;const q=o.m.position;if(q.y<=.06){hit=1}else if(o.t>.12&&typeof bx!='undefined'){for(const b of bx){if(b.pl)continue;if(q.x>b.x0&&q.x<b.x1&&q.z>b.z0&&q.z<b.z1&&q.y<b.h&&q.y>(b.y0||0)){hit=2;break}}}
   if(hit||o.t>2.4){S.remove(o.m);G.splice(i,1);if(hit==1&&Math.random()<.5)JX.pud(q.x,.06,q.z,o.s*rnd(5,9));if(hit&&Math.random()<.3)addSp({p:q.clone(),s0:.08,s1:.3,life:.3,c:[3,.9,1.4],op:.9})}}
  const P_=JX.puds;for(let i=P_.length-1;i>=0;i--){const o=P_[i];o.t+=dt;const u=o.t,g=Math.min(1,u/.22),e=1-Math.pow(1-g,3),sh=u<2.2?1:Math.max(0,1-(u-2.2)/1.1);o.m.scale.setScalar(Math.max(.01,o.r*e*(.85+.15*sh)));o.m.material.opacity=.9*sh*(.88+.12*Math.sin(u*11));
   o.b-=dt;if(o.b<=0&&u<2&&u>.2){o.b=rnd(.12,.3);const a=rnd(0,6.28),d=rnd(0,o.r*.8);addSp({p:V(o.m.position.x+Math.cos(a)*d,.14,o.m.position.z+Math.sin(a)*d),s0:.04,s1:.2,life:.28,c:[3,1.2,1.6],op:.85,v:V(0,.5,0),dr:.9})}
   if(sh<=0){S.remove(o.m);o.m.material.dispose();P_.splice(i,1)}}};
 JX.goopClear=function(){for(const o of JX.goops)S.remove(o.m);for(const o of JX.puds){S.remove(o.m);o.m.material.dispose()}JX.goops.length=JX.puds.length=0};
 /* everyone's RayGun impact: the same visual, plus a squelch that fades with distance (the player's own shot gets its sound from boom) */
 window.rgImpact=function(p){try{JX.goop(p,W.RG.ex);const d=C.position.distanceTo(p),v=Math.max(0,1-d/45);if(v>.05)rgPop(v)}catch(e){}}}
/* ---------- shooting ---------- */
JX.muzzle=function(p,k){if(k=='TEA')return;const d=C.position.distanceTo(p);if(d>70)return;const sg_=k=='SG',rg=k=='RG',col=rg?[3.2,.22,.12]:[3,1.9,.8];
 addSp({p:p.clone(),s0:sg_?.7:.42,s1:sg_?1.2:.7,life:.055,c:col,op:1,tex:flareTex,rot:rnd(0,6.28)});
 if(d<45&&d>2.5)JX.flash(p,rg?0xff2a14:0xffc070,sg_?5:3.2,.075,rg?16:13);
 if(d<30&&!rg)addSp({p:p.clone(),s0:.12,s1:.55,life:rnd(.5,.8),c:[.75,.75,.78],op:.22,add:false,tex:puffTex,v:V(rnd(-.2,.2),rnd(.2,.5),rnd(-.2,.2)),dr:.9,vr:rnd(-.5,.5)})};
JX.tracer=function(o,d,len,col,life,raw){if(!hi||len<1)return;const a=raw?o.clone():o.clone().add(d.clone().multiplyScalar(.6)).add(V(0,-.12,0)),b=o.clone().add(d.clone().multiplyScalar(len)),dv=b.clone().sub(a),L=dv.length();if(L<.3)return;
 const m=new THREE.Mesh(cyHi,new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));m.material.color.multiplyScalar(2.4);
 m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),dv.divideScalar(L));m.scale.set(.012,L,.012);S.add(m);fx.push({m,l:life||.06,fade:.85,r:.012})};
/* shell casings fly out of the ejection port, bounce on the floor and fade */
const brass=hi?new THREE.MeshStandardMaterial({color:0xd2a94a,metalness:1,roughness:.28}):new THREE.MeshLambertMaterial({color:0xd2a94a}),shell=new THREE.MeshLambertMaterial({color:0xc4302a});
JX.casing=function(sh){if(JX.cas.length>38){const o=JX.cas.shift();S.remove(o.m)}const m=new THREE.Mesh(cyHi,sh?shell:brass),p=new V3(.2,-.12,-.42);C.localToWorld(p);m.position.copy(p);
 const r=new V3(1,0,0).applyQuaternion(C.quaternion),f=new V3(0,0,-1).applyQuaternion(C.quaternion);m.scale.set(sh?.011:.0045,sh?.05:.02,sh?.011:.0045);m.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));
 const v=r.multiplyScalar(rnd(1.6,2.8)).add(V(0,rnd(1.4,2.4),0)).add(f.multiplyScalar(rnd(-.3,.8)));S.add(m);JX.cas.push({m,v,a:0,sp:V(rnd(-14,14),rnd(-14,14),rnd(-14,14)),b:0})};
/* ---------- atmosphere: floating motes ---------- */
JX.AMB={Blockfort:{c:[1.5,1.4,1.05],n:300,sz:.011,op:.55,w:[.1,.02,.05],box:[46,11,46],fl:0},Pillars:{c:[1.5,1.5,1.35],n:240,sz:.009,op:.4,w:[.3,.03,.1],box:[50,12,50],fl:0},
 Canyon:{c:[2.2,1.2,.5],n:340,sz:.011,op:.6,w:[.7,.06,.2],box:[50,12,50],fl:.4},Suburbia:{c:[1.5,1.5,1.1],n:240,sz:.01,op:.42,w:[.12,.02,.04],box:[46,10,46],fl:0},
 Boomtown:{c:[1.5,1.05,.6],n:460,sz:.009,op:.6,w:[2.8,.05,.8],box:[48,9,48],fl:0},Rust:{c:[1.6,1.35,.95],n:320,sz:.009,op:.48,w:[1.5,.06,.4],box:[54,10,54],fl:0},
 Decay:{c:[1.1,1.15,1.1],n:420,sz:.01,op:.55,w:[.25,-.5,.1],box:[44,12,44],fl:0},'Hollow Estate':{c:[.7,2.2,.55],n:300,sz:.016,op:1,w:[.05,.03,.04],box:[40,7,40],fl:1}};
JX.setMap=function(name){if(JX.amb){if(JX.amb.parent)JX.amb.parent.remove(JX.amb);JX.amb.geometry.dispose();JX.amb.material.dispose();JX.amb=null}if(!hi)return;const a=JX.AMB[name]||JX.AMB.Blockfort,N=LX.q=='high'?a.n:Math.floor(a.n*.5),pos=new Float32Array(N*3),sd=new Float32Array(N*4);
 for(let i=0;i<N;i++){pos[i*3]=Math.random();pos[i*3+1]=Math.random();pos[i*3+2]=Math.random();sd[i*4]=rnd(.4,1.6);sd[i*4+1]=rnd(.6,1.3);sd[i*4+2]=rnd(.15,.9);sd[i*4+3]=Math.random()}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(sd,4));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,uniforms:{uT:LX.U.time,uCam:{value:new V3()},uBox:{value:new V3(a.box[0],a.box[1],a.box[2])},uWind:{value:new V3(a.w[0],a.w[1],a.w[2])},uSize:{value:a.sz},uPx:{value:innerHeight*.62},uOp:{value:a.op},uFlick:{value:a.fl},uCol:{value:new THREE.Color(a.c[0],a.c[1],a.c[2])}},
  vertexShader:`uniform float uT;uniform float uSize;uniform float uPx;uniform float uFlick;uniform vec3 uCam;uniform vec3 uBox;uniform vec3 uWind;attribute vec4 aS;varying float vA;
void main(){vec3 p=position*uBox;p+=uWind*uT*aS.y;p+=vec3(sin(uT*aS.x+aS.w*6.283),cos(uT*aS.x*0.7+aS.w*3.1)*0.5,cos(uT*aS.x*0.9+aS.w*5.0))*aS.z*2.0;
vec3 q=mod(p-uCam+uBox*0.5,uBox)-uBox*0.5;vec3 w=vec3(uCam.x+q.x,mod(p.y,uBox.y),uCam.z+q.z);vec4 mv=viewMatrix*vec4(w,1.0);gl_Position=projectionMatrix*mv;float d=max(0.4,-mv.z);
gl_PointSize=clamp(uSize*(0.5+aS.z)*uPx/d,1.0,26.0);float edge=1.0-smoothstep(uBox.x*0.32,uBox.x*0.5,length(q.xz));float tw=0.5+0.5*sin(uT*aS.x*3.0+aS.w*40.0);vA=edge*mix(1.0,tw,uFlick)*smoothstep(0.3,2.0,d);}`,
  fragmentShader:`uniform vec3 uCol;uniform float uOp;varying float vA;void main(){float d=length(gl_PointCoord-0.5)*2.0;float a=1.0-smoothstep(0.0,1.0,d);a*=a;gl_FragColor=vec4(uCol,a*vA*uOp);}`});
 JX.amb=new THREE.Points(g,m);JX.amb.frustumCulled=false;JX.amb.renderOrder=2;(typeof mapG!='undefined'&&mapG?mapG:S).add(JX.amb)};
/* ---------- the per-frame update ---------- */
let lastShots=0,lastTot=null,wasDead=0,lowC=-1,ammoC=-1;
JX.tick=function(dt){const t=T();if(JX.tickG)JX.tickG(dt);
 for(const x of JX.lights){if(x.t>0){x.t-=dt;x.l.intensity=x.I*Math.pow(Math.max(0,x.t/x.d),1.4)}else if(x.l.intensity)x.l.intensity=0}
 for(let i=JX.sp.length-1;i>=0;i--){const o=JX.sp[i];o.a+=dt;const k=o.a/o.L;if(k>=1){S.remove(o.s);o.m.dispose();JX.sp.splice(i,1);continue}
  const e=1-Math.pow(1-k,2.2);o.s.scale.setScalar(o.s0+(o.s1-o.s0)*e);o.m.opacity=o.op*(o.io?Math.min(1,k*5)*(1-k):(1-k)*(1-k)*(k<.08?k/.08:1));
  if(o.v){o.s.position.addScaledVector(o.v,dt);o.v.multiplyScalar(Math.pow(o.dr,dt*60));o.v.y+=o.g*dt}if(o.rot)o.m.rotation+=o.rot*dt}
 for(let i=JX.rings.length-1;i>=0;i--){const o=JX.rings[i];o.a+=dt;const k=o.a/o.L;if(k>=1){S.remove(o.m);o.m.material.dispose();JX.rings.splice(i,1);continue}o.m.scale.setScalar(o.r0+(o.r1-o.r0)*(1-Math.pow(1-k,3)));o.m.material.opacity=o.op*(1-k)}
 for(let i=JX.scorch.length-1;i>=0;i--){const o=JX.scorch[i];o.a+=dt;if(o.a>o.L){S.remove(o.m);o.m.material.dispose();JX.scorch.splice(i,1)}else o.m.material.opacity=.5*Math.min(1,(o.L-o.a)/3)}
 for(let i=JX.cas.length-1;i>=0;i--){const o=JX.cas[i];o.a+=dt;o.v.y-=9.8*dt;o.m.position.addScaledVector(o.v,dt);o.m.rotation.x+=o.sp.x*dt;o.m.rotation.y+=o.sp.y*dt;o.m.rotation.z+=o.sp.z*dt;
  if(o.m.position.y<.03){o.m.position.y=.03;if(o.b<3){o.v.y=Math.abs(o.v.y)*.38;o.v.x*=.55;o.v.z*=.55;o.b++;o.sp.multiplyScalar(.5)}else{o.v.set(0,0,0);o.sp.set(0,0,0)}}
  if(o.a>2.6){o.m.scale.multiplyScalar(.88);if(o.a>3.2){S.remove(o.m);JX.cas.splice(i,1)}}}
 if(JX.amb){const u=JX.amb.material.uniforms;u.uCam.value.copy(C.position);u.uPx.value=(innerHeight||720)*.62}
 if(typeof flags!='undefined'&&flags)for(const f of flags){const c=f.m&&f.m.children&&f.m.children[1];if(c){const b=c.userData.bs||(c.userData.bs=c.scale.x);c.rotation.y=Math.sin(t*2.3+(f.x||0)*.3)*.16;c.rotation.z=Math.sin(t*3.1+(f.z||0)*.2)*.05;c.scale.x=b*(1+.05*Math.sin(t*4.7+(f.x||0)))}}
 if(typeof zones!='undefined'&&zones)for(const z of zones){if(z.base)z.base.rotation.y+=dt*.35;if(z.beam){const b=z.beam.userData.bs||(z.beam.userData.bs=z.beam.scale.x||1);z.beam.scale.x=z.beam.scale.z=b*(1+.07*Math.sin(t*3+(z.x||0)))}}
 if(typeof run!='undefined'&&run&&typeof P!='undefined'&&P&&typeof over!='undefined'&&!over){
  /* shots */
  if(typeof shots!='undefined'){if(shots>lastShots&&typeof cw=='function'){const w=cw(),k=w&&w.k,d=(typeof W!='undefined'&&W[k])||{};F.shot=Math.min(1,F.shot+.55);
    if(hi&&k&&!d.ex&&k!='RG'&&!P.dead)JX.casing(d.pel>1)}lastShots=shots}
  /* damage, healing, heartbeat */
  const tot=P.hp+P.sh;if(lastTot!=null&&!P.dead){const dl=tot-lastTot;if(dl<-1.5){F.dmg=Math.min(1,Math.max(F.dmg,.35+(-dl)/70));F.ca=Math.min(1,F.ca+.45+(-dl)/90);F.pulse=Math.max(F.pulse,.1)}else if(dl>6)F.heal=Math.min(1,F.heal+.55)}lastTot=tot;
  const low=!P.dead&&P.hp<P.mhp*.35;if(low){const hb=Math.pow(Math.max(0,Math.sin(t*5.2)),6);F.pulse=Math.max(F.pulse,hb*.07);F.dmg=Math.max(F.dmg,.2+hb*.14)}
  if(P.dead&&!wasDead){F.dmg=1;F.blur=.5;F.ca=1}if(!P.dead&&wasDead){F.flash=Math.max(F.flash,.3);F.ca=.7}wasDead=P.dead;
  /* sprint / fall blur */
  const tgt=(P.spr||0)*.3+(P.vy<-13?.25:0);F.speed+=(tgt-F.speed)*Math.min(1,dt*6);
  /* HUD state classes (written only when they change) */
  if(low!==lowC){lowC=low;const b=document.getElementById('bars');b&&b.classList.toggle('low',low)}
  if(typeof cw=='function'){const w=cw(),lowAmmo=!!(w&&w.mag<=Math.max(1,w.m*.25)&&!P.dead);if(lowAmmo!==ammoC){ammoC=lowAmmo;const a=document.getElementById('am');a&&a.classList.toggle('low',lowAmmo)}}
 }else{F.speed+=(0-F.speed)*Math.min(1,dt*6);lastTot=null;lastShots=typeof shots!='undefined'?shots:0}};
/* ---------- wrap the game functions (none of these are on the anti-cheat list) ---------- */
/* name-based access that also works when the whole game runs inside one closure (nothing here is a global then) */
const SCOPE={get attFpModel(){return attFpModel},set attFpModel(v){attFpModel=v},get boom(){return boom},set boom(v){boom=v},get buildGun(){return buildGun},set buildGun(v){buildGun=v},get buildMap(){return buildMap},set buildMap(v){buildMap=v},get gfxTick(){return gfxTick},set gfxTick(v){gfxTick=v},get juiceHit(){return juiceHit},set juiceHit(v){juiceHit=v},get juiceKill(){return juiceKill},set juiceKill(v){juiceKill=v},get juiceReset(){return juiceReset},set juiceReset(v){juiceReset=v},get mkHuman(){return mkHuman},set mkHuman(v){mkHuman=v},get muzzleFlash(){return muzzleFlash},set muzzleFlash(v){muzzleFlash=v},get setGfx(){return setGfx},set setGfx(v){setGfx=v},get tr(){return tr},set tr(v){tr=v}};
const wrap=(name,fn)=>{try{const o=SCOPE[name];if(typeof o=='function')SCOPE[name]=fn(o);else console.warn('juice: no function '+name)}catch(e){console.warn('juice hook '+name,e)}};
/* models: guns are metal, people are cloth and skin, small boxes get rounded edges */
const ctxWrap=(ctx,pick)=>o=>function(){const old=LX.ctx;LX.ctx=ctx;try{const r=o.apply(this,arguments);LX.bevel(pick(r,arguments));if(ctx=='char'&&LX.mergeRig)LX.mergeRig(pick(r,arguments),r);return r}finally{LX.ctx=old}};
if(hi){wrap('buildGun',ctxWrap('gun',r=>r));wrap('attFpModel',ctxWrap('gun',r=>r&&r.traverse?r:null));wrap('mkHuman',ctxWrap('char',(r,a)=>a[0]))}
/* particles: hot colours glow (the HDR target keeps values above 1, so bloom picks them up) */
if(hi&&typeof mc!='undefined'){for(const[c,k]of[[0xffd24a,2.6],[0xffffff,1.8],[0xffa040,2.6],[0x62e0f0,2.2],[0xffdd66,2.4],[0xffe08a,2.4],[0xff4040,1.8]])if(!mc[c])mc[c]=new THREE.Color(c).multiplyScalar(k)}
wrap('muzzleFlash',o=>function(p,k){const r=o.apply(this,arguments);try{JX.muzzle(p,k)}catch(e){}return r});
wrap('tr',o=>function(a,d,len,col,life,raw){const r=o.apply(this,arguments);try{JX.tracer(a,d,len,col,life,raw)}catch(e){}return r});
wrap('boom',o=>function(p,g){const r=o.apply(this,arguments);try{if(g&&!g.tac){if(g.w=='RG')JX.goop(p,g);else if(g.w=='TEA'&&JX.tea)JX.tea(p,g);else JX.explode(p,g)}else if(g&&g.tac)JX.flash(p,0xffffff,10,.25,24)}catch(e){}return r});
wrap('juiceHit',o=>function(b,d,head){const r=o.apply(this,arguments);try{F.hit=1;F.ca=Math.min(1,F.ca+.12);const h=document.getElementById('hm');if(h){h.style.animation='none';void h.offsetWidth;h.style.animation=''}if(hi&&b)addSp({p:V(b.x,head?1.75:1.1,b.z),s0:.3,s1:head?.9:.55,life:.16,c:head?[3,2.2,.6]:[2.2,2.2,2.2],op:.9})}catch(e){}return r});
wrap('juiceKill',o=>function(b,head){const r=o.apply(this,arguments);try{F.pulse=Math.max(F.pulse,.14);F.ca=Math.min(1,F.ca+.5);if(hi&&b){JX.flash(V(b.x,1.2,b.z),head?0xffd24a:0xff9060,5,.2,10);ring(V(b.x,.1,b.z),.3,2.2,.4,head?0xffd24a:0xff7a50,.7);addSp({p:V(b.x,1.1,b.z),s0:.5,s1:1.5,life:.28,c:[3,1.4,.6],op:.8})}}catch(e){}return r});
wrap('gfxTick',o=>function(dt){o.apply(this,arguments);try{JX.tick(dt)}catch(e){if(!JX.err){JX.err=1;console.warn('juice tick',e)}}});
wrap('buildMap',o=>function(){const r=o.apply(this,arguments);try{JX.setMap(sel.map)}catch(e){console.warn('ambient',e)}return r});
wrap('setGfx',o=>function(q){const r=o.apply(this,arguments);document.body.classList.remove('gfx-high','gfx-med','gfx-low');document.body.classList.add('gfx-'+q);return r});
document.body.classList.add('gfx-'+LX.q);LX.initBright();
/* clear the effects of the last match when a new one starts */
wrap('juiceReset',o=>function(){const r=o.apply(this,arguments);try{if(JX.goopClear)JX.goopClear();for(const a of[JX.sp,JX.rings,JX.scorch,JX.cas])for(const x of a)S.remove(x.m||x.s);JX.sp.length=JX.rings.length=JX.scorch.length=JX.cas.length=0;lastTot=null;wasDead=0;lastShots=typeof shots!='undefined'?shots:0;F.dmg=F.boom=F.flash=F.blur=0}catch(e){}return r});
JX.h={cv,addSp,ring,rnd,hi,flareTex,puffTex,glowTex,F};
})();


/* ===================== RayGun: a shot that feels good =====================
   Sound: a bright but soft chirp (sine, high but rounded off at 7 kHz, never a harsh saw), a glassy triangle sparkle, a mid body that gives it weight, a low thump that punches in the chest,
   a crackle of energy and a ringing tail with a fast tremolo. Every shot is detuned a little so it never sounds machine-gunned.
   Feel: camera kick, a brief aberration and bloom pulse, the gun jumps back, pink energy sparks at the muzzle and a trail of glints along the beam. ===================== */
pew=function(a){a=a==null?1:a;try{ac=ac||new AudioContext();const t=ac.currentTime,v=vol*a,pv=1+(Math.random()-.5)*.08,
 O=(ty,f0,f1,d,g0,lp,dl)=>{dl=dl||0;const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0*pv,t+dl);o.frequency.exponentialRampToValueAtTime(f1*pv,t+dl+d);g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);let n=o;if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(PlayerAudio.output(ac));o.start(t+dl);o.stop(t+dl+d+.03)};
 O('sine',3300,1050,.17,.07,7000);O('triangle',5400,2300,.11,.026,6500);O('sawtooth',720,170,.2,.045,1700);O('sine',170,52,.16,.13);O('sine',1800,2600,.06,.03,6000,.02);
 noise(.07,4200,.09*a);
 const o=ac.createOscillator(),g=ac.createGain(),lf=ac.createOscillator(),lg=ac.createGain();o.type='sine';o.frequency.value=2150*pv;lf.frequency.value=22;lg.gain.value=.011*v;lf.connect(lg);lg.connect(g.gain);
 g.gain.setValueAtTime(.0001,t+.03);g.gain.linearRampToValueAtTime(.024*v,t+.055);g.gain.exponentialRampToValueAtTime(.0001,t+.5);o.connect(g);g.connect(PlayerAudio.output(ac));o.start(t+.03);o.stop(t+.52);lf.start(t);lf.stop(t+.52)}catch(e){}};
/* the splash of a RayGun bolt: a rounded pop, a falling glassy sparkle and a short sizzle */
function rgPop(v){try{ac=ac||new AudioContext();const t=ac.currentTime,vv=vol*v,
 O=(ty,f0,f1,d,g0,lp)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(g0*vv,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+d);let n=o;if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(PlayerAudio.output(ac));o.start(t);o.stop(t+d+.02)};
 O('sine',640,80,.22,.14);O('triangle',2800,700,.26,.05,5200);O('sine',120,45,.28,.12);noise(.22,2000,.2*v);setTimeout(()=>{try{noise(.18,5200,.07*v)}catch(e){}},40)}catch(e){}}
{const _rb=rgBeam;rgBeam=function(o,d,len,raw){_rb.apply(this,arguments);try{
  const H=JX.h,s=raw?o.clone():o.clone().add(d.clone().multiplyScalar(.7)).add(V(0,-.12,0));
  if(H&&H.addSp){H.addSp({p:s.clone(),s0:.3,s1:.8,life:.12,c:[3.2,.2,.1],op:1,tex:H.flareTex});const n=Math.min(9,Math.floor(len/4));for(let i=1;i<=n;i++){const p=s.clone().lerp(o.clone().add(d.clone().multiplyScalar(len)),i/(n+1));H.addSp({p,s0:.1,s1:.42+Math.random()*.2,life:.16+i*.018,c:[3,.2,.1],op:.8,tex:H.flareTex})}
   for(let i=0;i<7;i++){H.addSp({p:s.clone().add(V((Math.random()-.5)*.1,(Math.random()-.5)*.1,(Math.random()-.5)*.1)),s0:.05,s1:.14,life:.3+Math.random()*.2,c:[3,.55,.35],op:.9,v:V((Math.random()-.5)*2.4+d.x*2,(Math.random()-.5)*2.4+d.y*2,(Math.random()-.5)*2.4+d.z*2),dr:.88})}}
  if(!raw){kick+=.012;shake=Math.max(shake,.35);LX.fx.shot=Math.max(LX.fx.shot,.8);LX.fx.ca=Math.max(LX.fx.ca,.5);LX.fx.pulse=Math.max(LX.fx.pulse,.35);gun.position.z+=.05;gun.rotation.x-=.05}}catch(e){}}}
;

/* ===================== extras.js ===================== */
/* ---------- Twin SMG (dual wield) ----------
   Multiplayer: an attachment on the SMG, "Dual Wield", turns it into two compact SMGs (the weapon becomes 'DS' when the match starts).
   Zombies: its own weapon (wall buy and Mystery Box). Hip fire only. Mouse and keyboard: the fire button alternates the two guns.
   Controller: LEFT trigger fires the LEFT gun, RIGHT trigger fires the RIGHT gun, both together fire both. */
W.DS={n:'Twin SMG',d:21,r:.044,m:60,sp:.034,rc:.62,pel:1,au:1,rl:2.3,len:.4,col:0x33363b,dual:1};
WG.DS=[.55,0x33363b,0,0xffd27a];
GS.DS=GS.SMG;
var ATT_ONLY={'Dual Wield':'SMG'};
A['Dual Wield']={t:'SMG only: wield two SMGs at once. Hip fire only, double the magazine. Controller: left trigger fires the left gun, right trigger the right gun'};
UNL['Dual Wield']=14;
if(typeof CLS!='undefined')CLS.DS='PRIMARY';
var DS={k:[0,0],h:0,L:false,R:false};
/* one compact SMG facing +z, built around its pistol grip at z=0: boxy receiver with a slotted top rail, bolt window with a steel slider, knurled collar and muzzle tube,
   round side lug, textured pistol grip with a collar plate, a long magazine in the grip and a second one hanging under the shroud */
function dsUnit(side,rm,mags){const u=new THREE.Group(),k=gunKit(u,rm),M=k.M,body=rm||M(0x34373c),dk=M(0x14161a),gm=M(0x23262b),steel=M(0x8c9298),rub=M(0x0c0d0f),acc=M(0x4a4e55);
 k.box(.064,.072,.31,0,0,.13,body);k.box(.056,.014,.29,0,.043,.13,gm);k.box(.068,.03,.11,0,.03,.015,body);k.box(.05,.02,.07,0,.05,-.02,gm);
 for(let i=0;i<5;i++)k.box(.05,.011,.013,0,.052,.02+i*.036,dk);
 k.box(.004,.03,.085,side*.033,.012,.1,dk);k.box(.008,.016,.032,side*.034,.014,.115,steel);k.box(.005,.008,.06,side*.034,-.006,.1,steel);
 k.box(.005,.05,.1,side*.033,-.012,.2,gm);for(let i=0;i<3;i++)k.box(.005,.011,.026,side*.034,.03,.2+i*.032,dk,0,0,-.5*side);
 for(const y of[.03,-.02])for(const z of[.04,.21])k.cylY(.005,.008,side*.035,y,z,steel,0,Math.PI/2*side);
 k.box(.074,.088,.13,0,0,.31,gm);k.box(.07,.012,.12,0,.05,.31,dk);for(let i=0;i<4;i++)k.box(.075,.007,.02,0,-.036,.27+i*.03,dk);
 k.cyl(.039,.024,0,.005,.385,acc);for(let i=0;i<10;i++){const a=i/10*6.283;k.box(.012,.012,.026,Math.cos(a)*.04,.005+Math.sin(a)*.04,.385,steel,0,0,a)}
 k.cyl(.0185,.15,0,.006,.47,dk);k.cyl(.022,.022,0,.006,.54,gm);k.cyl(.0125,.012,0,.006,.552,M(0x050506));
 const d=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.018,16),gm);d.rotation.z=Math.PI/2;d.position.set(side*.04,-.012,.345);u.add(d);const d2=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.02,12),dk);d2.rotation.z=Math.PI/2;d2.position.set(side*.045,-.012,.345);u.add(d2);
 k.box(.042,.115,.052,0,-.088,.012,rub,.3);for(let i=0;i<5;i++)k.box(.044,.006,.054,0,-.05-i*.018,.012-i*.0055,dk,.3);k.box(.056,.018,.066,0,-.15,-.01,steel,.3);k.box(.05,.012,.06,0,-.168,-.016,gm,.3);
 mags.push(k.box(.04,.17,.064,0,-.245,-.026,dk,.3));mags.push(k.box(.046,.016,.07,0,-.333,-.05,gm,.3));
 k.box(.006,.034,.1,0,-.05,.115,steel);k.box(.007,.034,.012,0,-.055,.07,steel);k.box(.005,.026,.008,0,-.04,.09,steel);
 mags.push(k.box(.036,.125,.058,0,-.105,.285,dk,.05));mags.push(k.box(.042,.014,.064,0,-.172,.282,gm,.05));
 k.box(.05,.014,.05,0,-.045,.255,gm);
 mkSights(u,'DS',{yt:.102,yb:.057,yf:.052,zr:.04,zf:.33});
 u.userData.muzzle={x:0,y:.006,z:.558};return u}
MODELS.DS=function(g,rm){const mags=[],units=[];for(const side of[-1,1]){const u=dsUnit(side,rm,mags);u.position.x=side*.105;u.rotation.y=-side*.035;g.add(u);units.push(u)}
 /* units[0] is the gun on the shooter's right (a character facing +z has its right hand on -x) */
 g.userData.a={r:[-.105,-.09,.01],l:[.105,-.09,.01],m:[0,-.17,.0]};g.userData.mags=mags;g.userData.units=units;return g};
/* the guns fire in turn (or the one you chose with the controller triggers); each kicks back on its own */
function dsShot(w){const pad=PG&&PG.on&&(DS.L||DS.R);let h;if(pad&&DS.L!=DS.R)h=DS.L?1:0;else{DS.h^=1;h=DS.h}DS.k[h]=1;
 if(pad&&DS.L!=DS.R)nf=t0+w.r*2*zfr();return h}
{const _fu=fpUpdate;fpUpdate=function(dt){const w=cw(),a=curAnch(),u=fpG.userData&&fpG.userData.units;
  if(w&&w.dual&&a&&u){if(!a.b0)a.b0={r:a.r.slice(),l:a.l.slice()};for(let i=0;i<2;i++)DS.k[i]=Math.max(0,DS.k[i]-dt*8);
   const kr=DS.k[0],kl=DS.k[1];a.r=[a.b0.r[0],a.b0.r[1],a.b0.r[2]+kr*.04];a.l=[a.b0.l[0],a.b0.l[1],a.b0.l[2]+kl*.04];
   u[0].position.z=-kr*.04;u[1].position.z=-kl*.04;u[0].rotation.x=kr*.1;u[1].rotation.x=kl*.1}
  return _fu.apply(this,arguments)}}

/* ---------- reload sounds ----------
   Every gun reloads with its own sequence, built the way a real gun sounds: nothing here is a pitched tone or a sweep.
   A click or a clack is a burst of noise that excites a few ringing resonances of the material it hits (steel rings high and long, polymer is dull and short, brass casings tinkle, wood knocks).
   Sliding parts are rough filtered noise (stick and slip), drops are low thuds. Each weapon has its own parts, weight, material and order of events:
   a rocking AK magazine, a pistol slap, a revolver's cylinder and rattling casings, a pump's two-part rack, a bolt action, a drum winding, a belt box, a teapot lid and the pour.
   The player's reload follows the animation, bots and other players play the same sequence at their own distance, a little quieter. */
var FOL=(()=>{let nb=null,bus=null,last=-1,lastEv=0;const R=Math.random;
 const cx=()=>{ac=ac||new AudioContext();if(ac.state=='suspended'){try{ac.resume()}catch(e){}}return ac};
 const buf=()=>{if(nb)return nb;const c=cx(),b=c.createBuffer(1,c.sampleRate,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return nb=b};
 /* everything goes through a gentle bus: nothing below 70 Hz, nothing piercing above 6 kHz, a soft compressor so stacked hits never jump out */
 const out=()=>{const c=cx();if(bus&&bus.c===c)return bus.i;const hp=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain();hp.type='highpass';hp.frequency.value=70;lp.type='lowpass';lp.frequency.value=6200;lp.Q.value=.4;g.gain.value=.8;hp.connect(lp);lp.connect(g);g.connect(PlayerAudio.output(c));bus={c,i:hp};return hp};
 /* one resonance: noise through a narrow filter with an instant attack and an exponential decay */
 const mode=(t,f,q,dec,v,type)=>{const c=cx(),s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=buf();s.loop=true;s.playbackRate.value=.8+R()*.4;fl.type=type||'bandpass';fl.frequency.value=f;fl.Q.value=q;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,v*vol),t+.0008);g.gain.exponentialRampToValueAtTime(.0001,t+dec);s.connect(fl);fl.connect(g);g.connect(out());s.start(t,R()*.4);s.stop(t+dec+.03)};
 const MAT={steel:{f:[1500,2600,4300],q:[12,16,20],d:[.055,.04,.025],g:[1,.7,.4]},poly:{f:[700,1300,2100],q:[5,6,7],d:[.03,.022,.014],g:[1,.7,.4]},alloy:{f:[1100,2000,3400],q:[9,12,15],d:[.045,.03,.02],g:[1,.7,.4]},brass:{f:[3000,4400,5800],q:[20,24,28],d:[.07,.05,.035],g:[.8,.6,.4]},wood:{f:[380,720,1200],q:[4,5,6],d:[.04,.03,.02],g:[1,.6,.3]},cer:{f:[2000,3300,4800],q:[28,32,36],d:[.1,.07,.05],g:[1,.7,.5]}};
 const hit=(t,v,p,m)=>{const M=MAT[m||'steel'];mode(t,2500,.8,.004,v*.14,'highpass');mode(t,520*p,1.3,.035,v*.65,'bandpass');for(let i=0;i<3;i++)mode(t,M.f[i]*p*(.97+R()*.06),M.q[i],M.d[i],v*M.g[i]*(i?.8:1))};
 const thud=(t,v,p,d)=>{d=d||.09;mode(t,260*p,.7,d,v*1.1,'lowpass');mode(t,110*p,.6,d*1.4,v*.8,'lowpass')};
 /* a sliding part: rough band-limited noise whose level flutters (stick and slip) while the band moves */
 const scrape=(t,dur,f0,f1,q,v)=>{const c=cx(),s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=buf();s.loop=true;fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f0,t);fl.frequency.linearRampToValueAtTime(f1,t+dur);
  const n=Math.max(8,Math.floor(dur*70)),cv=new Float32Array(n);for(let i=0;i<n;i++)cv[i]=Math.max(.0002,v*vol*(.35+.65*R())*Math.pow(Math.sin(Math.PI*Math.min(1,(i+1)/n)),.5));g.gain.setValueCurveAtTime(cv,t,dur);s.connect(fl);fl.connect(g);g.connect(out());s.start(t,R()*.4);s.stop(t+dur+.03)};
 /* the parts: (time, loudness, pitch, a, b) */
 const S={
  latch:(t,v,p,m)=>{hit(t,v*.8,p,m||'steel');hit(t+.017,v*.45,p*1.15,m||'steel')},
  tick:(t,v,p,m)=>hit(t,v*.6,p,m||'steel'),
  magOut:(t,v,p,d,m)=>{d=d||.14;scrape(t,d,900*p,1900*p,2.2,v*.5);hit(t+d*.9,v*.35,p,m||'steel')},
  magDrop:(t,v,p,m)=>{thud(t,v*.7,p,.08);hit(t+.03,v*.35,p*.85,m||'poly');thud(t+.12,v*.3,p*1.1,.06)},
  magIn:(t,v,p,d,m)=>{d=d||.1;scrape(t,d,1700*p,900*p,2.4,v*.45);hit(t+d,v*.9,p,m||'steel');thud(t+d,v*.5,p,.07)},
  seat:(t,v,p,m)=>{hit(t,v,p,m||'steel');thud(t,v*.7,p,.08)},
  bolt:(t,v,p,m)=>{scrape(t,.11,700*p,1600*p,2,v*.55);hit(t+.11,v*.55,p*.9,m||'steel');scrape(t+.19,.06,1600*p,900*p,2,v*.3);hit(t+.26,v*1.1,p*.8,m||'steel');thud(t+.26,v*.6,p,.09)},
  boltBack:(t,v,p)=>{scrape(t,.2,600*p,1500*p,1.8,v*.6);hit(t+.2,v*.7,p*.85)},
  boltFwd:(t,v,p)=>{scrape(t,.12,1500*p,700*p,1.8,v*.55);hit(t+.12,v*1.1,p*.75);thud(t+.12,v*.6,p,.09)},
  shell:(t,v,p)=>{hit(t,v*.5,p*1.05,'brass');hit(t+.025,v*.35,p,'steel');thud(t+.01,v*.25,p*1.3,.04)},
  pump:(t,v,p)=>{scrape(t,.15,500*p,1300*p,1.8,v*.7);hit(t+.15,v*.7,p*.8);scrape(t+.3,.13,1300*p,600*p,1.8,v*.65);hit(t+.43,v*1.2,p*.75);thud(t+.43,v*.8,p,.1)},
  rattle:(t,v,p,n)=>{for(let i=0;i<(n||6);i++)hit(t+i*.034+R()*.02,v*(.25+R()*.25),p*(.9+R()*.35),'brass')},
  ratchet:(t,v,p,n)=>{n=n||6;let x=t;for(let i=0;i<n;i++){hit(x,v*(.3+.08*(i%2)),p*(1+i*.02),'steel');x+=Math.max(.02,.046-i*.002)}},
  cyl:(t,v,p)=>{hit(t,v*.7,p*1.1);scrape(t+.03,.09,800*p,1500*p,2,v*.4);hit(t+.13,v*.5,p)},
  cylClose:(t,v,p)=>{scrape(t,.08,1500*p,800*p,2,v*.4);hit(t+.08,v*1.1,p*.9);thud(t+.08,v*.5,p,.07)},
  ping:(t,v,p)=>{mode(t,4300*p,60,.45,v*.5);mode(t,6500*p,70,.3,v*.25);hit(t,v*.3,p*1.2)},
  chain:(t,v,p)=>{for(let i=0;i<8;i++)hit(t+i*.04+R()*.015,v*(.2+R()*.2),p*(1+R()*.3),'alloy')},
  rocket:(t,v,p)=>{scrape(t,.34,300*p,900*p,1.5,v*.7);thud(t+.34,v*1.1,p*.7,.14);hit(t+.34,v*.5,p*.6)},
  hum:(t,v,p,d)=>{d=d||.3;scrape(t,d,150*p,170*p,5,v*.45);scrape(t,d,2400*p,1800*p,6,v*.08)},
  spool:(t,v,p,d)=>{scrape(t,d||.3,2600*p,900*p,1.2,v*.35)},
  pour:(t,v,p,d)=>{d=d||.5;scrape(t,d,1100*p,1700*p,1.4,v*.5);for(let i=0;i<10;i++)mode(t+R()*d,1500+R()*1800,16,.025,v*.18)},
  clink:(t,v,p)=>hit(t,v,p,'cer'),
  keys:(t,v,p,count=8,gap=.024)=>{
   for(let i=0;i<count;i++){
    const at=t+i*gap+R()*gap*.47,metal=i%2?'steel':'brass',scale=p*(.76+R()*.42);
    hit(at,v*(.72-.29*i/count),scale,metal);
   }
  }};
 /* per-weapon sequences: [moment in the reload 0..1, part, loudness, pitch (small and bright high, big and dull low), then the part's own arguments] */
 const mag=(o)=>[[.1,'latch',.85*o.w,o.p*.98,o.m],[.27,'magOut',.8*o.w,o.p,o.d||.14,o.m],[.38,'magDrop',.85*o.w,o.p*1.02,o.m],[.66,'magIn',.8*o.w,o.p,.07,o.m],[.84,'seat',1.05*o.w,o.p*.95,o.m],[.93,o.bolt||'bolt',1*o.w,o.p*.9,o.bm||o.m]];
 const RFS={
  AR:[[.1,'latch',.95,.8],[.27,'magOut',.9,.8,.15],[.38,'magDrop',.9,.85],[.58,'tick',.55,.85],[.67,'magIn',.8,.8,.07],[.84,'seat',1.15,.74],[.92,'bolt',1.15,.72]],
  SMG:mag({p:1.3,w:.62,m:'poly',d:.1,bm:'alloy'}),
  BR:[[.1,'latch',1,.65],[.26,'magOut',1,.65,.2],[.35,'ping',.8,.9],[.42,'magDrop',1,.7],[.66,'magIn',1,.65,.1],[.84,'seat',1.3,.6],[.93,'bolt',1.3,.6]],
  MP:[[.12,'latch',.55,1.45,'poly'],[.3,'magOut',.5,1.45,.08,'poly'],[.4,'magDrop',.5,1.4,'poly'],[.66,'magIn',.55,1.4,.06,'poly'],[.82,'seat',.7,1.4,'poly'],[.92,'tick',.7,1.2,'alloy']],
  CT:[[.1,'latch',.8,1.05],[.28,'magOut',.5,1.1,.07],[.4,'magDrop',.6,1.1],[.64,'magIn',.6,1.1,.06],[.78,'seat',.9,1.05],[.9,'bolt',.75,1.1]],
  MG:[[.08,'cyl',1,.9],[.22,'tick',.8,1],[.27,'tick',.7,.95],[.31,'rattle',1,1.05,6],[.5,'rattle',.8,.95,6],[.62,'ratchet',.7,1,5],[.84,'cylClose',1.2,.85],[.93,'ratchet',.55,1.1,4]],
  SG:[[.9,'pump',1.1,1]],
  SN:[[.06,'latch',.9,.7],[.14,'boltBack',1,.7],[.34,'magOut',.8,.8,.12],[.46,'magDrop',.7,.8],[.66,'magIn',.9,.8,.09],[.8,'boltFwd',1.1,.7],[.9,'seat',.9,.7]],
  RL:[[.1,'latch',1.1,.65],[.26,'rocket',1,.8],[.6,'seat',1.2,.55],[.74,'cylClose',1.1,.6],[.9,'latch',1,.7]],
  RG:[[.1,'latch',.7,1,'alloy'],[.24,'hum',.8,1,.35],[.5,'tick',.6,.9,'alloy'],[.58,'seat',.8,1,'alloy'],[.78,'hum',.9,1.3,.3],[.93,'tick',.7,1.2,'alloy']],
  VMP:mag({p:1.05,w:.85,m:'alloy',bolt:'bolt'}),MVR:mag({p:.9,w:1,m:'steel'}),
  TUR:[[.1,'latch',.9,.9],[.24,'ratchet',.9,.8,9],[.4,'magOut',.7,.85,.12],[.62,'ratchet',.8,.85,10],[.84,'seat',1.1,.8],[.93,'bolt',1,.8]],
  TRB:[[.1,'latch',.8,1,'alloy'],[.26,'magOut',.7,1,.1,'alloy'],[.36,'spool',.6,.8,.3],[.62,'magIn',.7,1,.08,'alloy'],[.82,'seat',1,.95,'alloy'],[.9,'spool',.8,1.2,.3]],
  CY:[[.08,'latch',1.2,.6],[.24,'magOut',1,.6,.18],[.36,'magDrop',1,.65],[.52,'chain',.9,.9],[.7,'magIn',.9,.6,.12],[.84,'seat',1.3,.6],[.93,'bolt',1.3,.55]],
  SW:mag({p:.88,w:1.08,m:'alloy',d:.055,bolt:'boltFwd'}),
  LT:[[.12,'latch',.71,1.2],[.3,'magOut',.65,.88],[.66,'magIn',1.01,.89,.11],[.79,'seat',.98,1.34],[.92,'tick',.7,1.16]],
  PD:mag({p:1.12,w:.8,m:'steel',d:.16,bolt:'boltBack'}),
  VA:mag({p:1.02,w:.9,m:'poly',d:.135,bm:'alloy'}),
  BP:[[.095,'latch',.7,.82],[.88,'pump',1.16,.78]],
  KTS:[[.08,'tick',.8,1.15,'alloy'],[.87,'boltFwd',.9,1.04]],
  RD:[[.1,'latch',1,.66],[.24,'magOut',1,.68,.2],[.37,'ratchet',.6,.78,4],[.63,'magIn',.92,.68,.13],[.83,'seat',1.26,.63],[.94,'tick',.9,.73]],
  HC:mag({p:.83,w:.92,m:'steel',d:.085,bolt:'boltFwd'}),
  OH:[[.08,'latch',.83,.8],[.13,'boltBack',.87,.78],[.62,'shell',.77,1.17],[.73,'boltFwd',.99,.85],[.9,'latch',.84,.91]],
  AN:[[.085,'latch',.93,.79,'alloy'],[.18,'boltBack',.7,.78],[.27,'rattle',.91,.85,4],[.52,'latch',.64,.82,'alloy'],[.69,'shell',.74,.91],[.755,'seat',.84,.83,'steel'],[.90,'cylClose',1.08,.72]],
  KEY:[[.09,'latch',.9,1.14,'alloy'],[.34,'keys',.55,1.28,4,.021],[.55,'keys',1.17,1.45,12,.026],[.79,'tick',.74,.89,'steel'],[.91,'seat',.78,1.24,'alloy']],
  TEA:[[.1,'clink',.8,.9],[.22,'pour',.9,.9,.5],[.5,'clink',.5,1.1],[.7,'pour',.6,1,.3],[.9,'clink',.9,.85]]};
 RFS.DS=[...mag({p:1.2,w:.6,m:'poly',d:.1,bm:'alloy'}),...mag({p:1.14,w:.58,m:'poly',d:.1,bm:'alloy'}).map(e=>[Math.min(.99,e[0]+.06),...e.slice(1)])];
 const play=(e,v,t)=>{const f=S[e[1]];if(f)f(t==null?cx().currentTime:t,.105*v*(e[2]||1)*(.88+R()*.24),(e[3]||1)*(.97+R()*.06),e[4],e[5])};
 return{
  /* the player's reload: sounds fire as the animation passes their moment; shotguns thumb a shell for every shell the animation loads */
  player(w,k,p,ev){const seq=RFS[k]||RFS.AR;if(p<last-.2||p<=.001)last=-1;
   if(RLK[k]==='shell'){if(ev>lastEv)S.shell(cx().currentTime,.07*(.9+R()*.2),k==='BP'?.89:k==='KTS'?1.12:1);lastEv=ev}
   for(const e of seq)if(e[0]>last&&e[0]<=p)play(e,1);last=p},
  reset(){last=-1;lastEv=0},
  keyClatter(v,p,count,gap){try{S.keys(cx().currentTime,v,p,count,gap)}catch(e){}},
  /* bots and other players */
  bot(b,w){try{const d=C.position.distanceTo(b.m?b.m.position:C.position),v=Math.max(0,1-d/38);if(v<.06)return;const dur=Math.max(.5,w.rl),t0=cx().currentTime;
   if(b.wk=='SG'){for(let i=0;i<3;i++)S.shell(t0+.3+i*dur*.2,.1*v,1);S.pump(t0+dur*.88,.15*v,1);return}
   if(RLK[b.wk]==='shell')for(let i=0;i<Math.min(5,w.m);i++)S.shell(t0+(.21+i*.12)*dur,.085*v,b.wk==='BP'?.89:1.12);
   for(const e of RFS[b.wk]||RFS.AR)play(e,v,t0+e[0]*dur)}catch(x){}},
  S};
})();

/* ---------- speed: fewer draw calls, no per-frame HUD rebuilds ----------
   1) Every person (bots, zombies, brutes) is built from dozens of small meshes, and each mesh is drawn twice (once for the shadow): hundreds of calls per character.
      LX.mergeRig fuses all the static pieces of each limb that share a material into ONE mesh (the limbs themselves stay separate groups, so every animation is untouched).
   2) The HUD wrote text and markup into the page every frame even when nothing had changed, which forces the browser to re-layout. Writes of an identical value are now skipped. */
LX.mergeRig=function(root,rig){try{if(!root||!root.isObject3D)return;const keep=new Set((rig&&rig.hip)||[]),nm=new THREE.Matrix3();
 const groups=[];root.traverse(n=>{if(n===root||(n.isObject3D&&!n.isMesh&&n.children&&n.children.length))groups.push(n)});
 for(const g of groups){const by=new Map();
  for(const c of g.children){if(!c.isMesh||!c.visible||keep.has(c)||(c.userData.noMerge||c.userData.sightPart||c.userData.glow)||!c.geometry||!c.geometry.attributes||!c.geometry.attributes.position||!c.geometry.attributes.normal||!c.geometry.attributes.uv||!c.material||Array.isArray(c.material))continue;
   const material=c.material;
   // Keep independent transparency ordering, vertex colors and draw state.
   if(!material.visible||material.transparent||material.vertexColors||c.children.length)continue;
   const key=material.id+'/'+c.castShadow+'/'+c.receiveShadow+'/'+c.renderOrder;
   let parts=by.get(key);if(!parts)by.set(key,parts=[]);parts.push(c)
  }
  for(const list of by.values()){if(list.length<2)continue;const m=list[0].material;let nv=0,ni=0;for(const c of list){nv+=c.geometry.attributes.position.count;ni+=c.geometry.index?c.geometry.index.count:c.geometry.attributes.position.count}
   const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;const v=new THREE.Vector3();
   for(const c of list){c.updateMatrix();const gm=c.geometry,pa=gm.attributes.position,na=gm.attributes.normal,ua=gm.attributes.uv;nm.getNormalMatrix(c.matrix);
    for(let i=0;i<pa.count;i++){v.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(c.matrix);P[(vo+i)*3]=v.x;P[(vo+i)*3+1]=v.y;P[(vo+i)*3+2]=v.z;v.set(na.getX(i),na.getY(i),na.getZ(i)).applyMatrix3(nm).normalize();N[(vo+i)*3]=v.x;N[(vo+i)*3+1]=v.y;N[(vo+i)*3+2]=v.z;U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
    if(gm.index){for(let i=0;i<gm.index.count;i++)I[io++]=gm.index.getX(i)+vo}else for(let i=0;i<pa.count;i++)I[io++]=vo+i;vo+=pa.count}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('uv',new THREE.BufferAttribute(U,2));geo.setIndex(new THREE.BufferAttribute(I,1));
   const me=new THREE.Mesh(geo,m);me.castShadow=list[0].castShadow;me.receiveShadow=list[0].receiveShadow;me.renderOrder=list[0].renderOrder;me.userData.merged=1;me.matrixAutoUpdate=false;me.frustumCulled=true;
   for(const c of list)g.remove(c);g.add(me)}}}catch(e){try{console.warn('mergeRig skipped',e)}catch(x){}}};
/* characters far away stop casting shadows (their shadow is a few pixels): the flag is refreshed a few times a second */
LX.shadowLOD=function(list,t){if(t-(LX.slT||0)<.3)return;LX.slT=t;const p=C.position;for(const b of list){if(!b.m)continue;const d=Math.hypot(b.x-p.x,b.z-p.z),on=d<26;if(b._sc!==on){b._sc=on;b.m.traverse(o=>{if(o.isMesh&&o.userData.merged!==2)o.castShadow=on})}}};
{const td=Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML'),hud=e=>e.closest&&e.closest('#hud,#zh,#bars,#kst');
 Object.defineProperty(Node.prototype,'textContent',{configurable:true,enumerable:td.enumerable,get:td.get,set(v){if(this.nodeType==1&&hud(this)&&td.get.call(this)===String(v))return;td.set.call(this,v)}});
 Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:ih.enumerable,get:ih.get,set(v){if(hud(this)&&this.__ih===v&&this.childNodes.length===this.__ic)return;ih.set.call(this,v);this.__ih=v;this.__ic=this.childNodes.length}})}

{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);if(typeof bots!='undefined'&&bots.length)LX.shadowLOD(bots,performance.now()/1000)}}

/* bots can use every multiplayer weapon (the sniper, the rocket launcher and the Twin SMG joined the pool; Zombies-only weapons never do) */
for(const k of['SN','RL','DS'])if(!BOTGUNS.includes(k))BOTGUNS.push(k);

/* ===================== three Call of Duty staples =====================
   1  GUN GAME     a new mode: every kill hands you the next weapon, 14 rungs from pistol to Magnum, first to clear the ladder wins
   2  CLAYMORE     lethal equipment: a mine with a laser fan that goes off when an enemy walks in front of it (2 mines, max 4 down)
   3  SMOKE GRENADE equipment: a thick smoke screen for 14 seconds; bots cannot see through it, bullets still pass
   Claymore and Smoke appear in the loadout's lethal slot (E), Gun Game in the mode list. */
var GG={on:0,i:0,lad:['CT','MP','SMG','DS','VMP','AR','TRB','MVR','TUR','BR','SG','CY','SN','MG']};
MODES['Gun Game']='Every kill gives you the next weapon: 14 of them, from a pistol to the Magnum. Finish the ladder to win. Bots fight with their own guns.';
GR.Claymore={fuse:0,R:5.5,d:140,imp:0,mine:1,t:'Place it on the ground: a laser fan sets it off when an enemy walks into it. 2 mines, 4 down at once'};
GR.Smoke={fuse:1.3,R:0,d:0,imp:0,smoke:1,t:'Bursts into a thick smoke screen for 14 seconds. Bots cannot see through it. 2 grenades'};
UNL.Claymore=20;UNL.Smoke=8;
function ggGive(){const k=GG.lad[Math.min(GG.i,GG.lad.length-1)],w={k,...eff(k,[])};w.mag=w.m;w.rs=3;w.res=w.m*3;wp=[w];cur=0;rel=0;MV.eq=0;setGun();setObjectiveText(`GUN GAME  ·  weapon ${GG.i+1} / ${GG.lad.length}  ·  ${W[k].n}`)}
{const _s=startGame;startGame=function(){const gg=sel.mode=='Gun Game';if(gg)sel.mode='Slayer';/* Gun Game runs on the Slayer rules (spawns, bots, respawns) with the ladder on top */try{_s.apply(this,arguments)}finally{if(gg)sel.mode='Gun Game'}
  GG.on=gg?1:0;CLAY.splice(0).forEach(c=>S.remove(c.g));SMK.splice(0).forEach(s=>s.sp.forEach(p=>S.remove(p)));if(!GG.on)return;GG.i=0;gc=0;ggGive();popup('GUN GAME','Every kill gives you the next weapon. Clear all 14 to win')}}
{const _fk=featKill;featKill=function(){_fk.apply(this,arguments);if(!GG.on||over)return;GG.i++;if(GG.i>=GG.lad.length){endGame('Victory');return}ggGive();popup('WEAPON '+(GG.i+1)+' / '+GG.lad.length,W[GG.lad[GG.i]].n);beep(660,.1,'triangle',.07);setTimeout(()=>beep(990,.15,'triangle',.07),90)}}
{const _rs=respawn;respawn=function(){const r=_rs.apply(this,arguments);if(GG.on)ggGive();return r}}
/* ---- claymores ---- */
var CLAY=[],SMK=[];
function clayPlace(){if(P.dead||gc<=0)return;if(CLAY.filter(c=>!c.dead).length>=4){msg('Four claymores are already down',1.2);return}gc--;const d=aimDir(),yaw=Math.atan2(d.x,d.z),x=P.x+d.x*1.1,z=P.z+d.z*1.1,y=P.y||0,g=new THREE.Group(),
  olive=new THREE.MeshLambertMaterial({color:0x4d5a34}),dk=new THREE.MeshLambertMaterial({color:0x1b1f14}),led=new THREE.MeshBasicMaterial({color:0xff2a1a}),grey=new THREE.MeshLambertMaterial({color:0x9aa09a}),add=(geo,mat,px,py,pz,sx,sy,sz,rx)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.scale.set(sx,sy,sz);if(rx)m.rotation.x=rx;g.add(m);return m};
  add(bg,olive,0,.1,0,.36,.11,.05);add(bg,olive,-.13,.1,.03,.11,.11,.05).rotation.y=.35;add(bg,olive,.13,.1,.03,.11,.11,.05).rotation.y=-.35;add(bg,dk,0,.105,.03,.3,.06,.012);add(bg,grey,0,.16,-.005,.12,.014,.045);add(bg,dk,0,.17,.02,.05,.01,.012);
  for(const sx of[-.15,.15]){const l=add(bg,dk,sx,.04,-.01,.012,.09,.012,.4);l.rotation.z=sx>0?.25:-.25}const lamp=add(sg,led,.0,.152,-.02,.02,.02,.02);
  g.position.set(x,y,z);g.rotation.y=yaw;S.add(g);const fan=[];for(const a of[-.45,0,.45]){const f=new THREE.Mesh(new THREE.PlaneGeometry(.015,5.2),new THREE.MeshBasicMaterial({color:0xff2a1a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));f.rotation.x=-Math.PI/2;f.rotation.z=a;f.position.set(Math.sin(a)*-2.6*-1,.1,2.6*Math.cos(a));f.position.x=Math.sin(a)*2.6;g.add(f);fan.push(f)}
  CLAY.push({g,x,y,z,yaw,t:0,lamp,led,fan,dead:0,own:1});beep(300,.08,'square',.05);setTimeout(()=>beep(450,.08,'square',.05),110);msg('Claymore down · '+gc+' left',1.2)}
function clayTick(dt,t){for(let i=CLAY.length-1;i>=0;i--){const c=CLAY[i];c.t+=dt;const armed=c.t>1.6;c.led.color.setRGB(armed?(Math.sin(c.t*5)>.6?2.6:.35):(Math.sin(c.t*20)>0?2.4:.2),.1,.08);for(const f of c.fan)f.material.opacity=armed?.35+.15*Math.sin(t*8):0;if(c.t<1.6&&Math.floor(c.t*4)!=Math.floor((c.t-dt)*4))beep(500+c.t*200,.03,'square',.03);
   if(!armed)continue;for(const b of bots){if(!b.al||b.net||b.zom||(typeof ally=='function'&&ally(b)))continue;const dx=b.x-c.x,dz=b.z-c.z,dd=Math.hypot(dx,dz);if(dd>5.2||dd<.3||Math.abs((b.y||0)-c.y)>2)continue;let da=Math.atan2(dx,dz)-c.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<.62){clayBlow(c,i);break}}}}
function clayBlow(c,i){c.dead=1;S.remove(c.g);CLAY.splice(i,1);boom(V(c.x,c.y+.3,c.z),{R:5.5,d:140,imp:0,c:0xffa040});beep(120,.2,'sawtooth',.1);burst(V(c.x,c.y+.3,c.z),30,0xffd890,9,.6,.12)}
/* ---- smoke ---- */
function smokeBurst(p){beep(180,.5,'sawtooth',.06);noise(.7,900,.35);if(SMK.length>=3){const o=SMK.shift();o.sp.forEach(q=>S.remove(q))}const {smoke}=LX.effectTextures(),sp=[];for(let i=0;i<26;i++){const m=new THREE.SpriteMaterial({map:smoke[i%smoke.length],rotation:Math.random()*Math.PI*2,transparent:true,depthWrite:false,opacity:0,color:0xc4c8cc}),s=new THREE.Sprite(m);s.position.set(p.x,Math.max(.4,p.y)+.3,p.z);s.userData={a:Math.random()*6.28,r:Math.random(),h:Math.random(),sp:.4+Math.random()*.9,sz:2.2+Math.random()*2.2};s.scale.setScalar(.5);S.add(s);sp.push(s)}SMK.push({x:p.x,y:Math.max(0,p.y),z:p.z,t:0,life:14,r:0,sp})}
function smokeTick(dt){for(let i=SMK.length-1;i>=0;i--){const s=SMK[i];s.t+=dt;const g=Math.min(1,s.t/2.2),fade=s.t>s.life-3?Math.max(0,(s.life-s.t)/3):1;s.r=4.4*(1-Math.pow(1-g,2))*(fade>0?1:0);
   for(const q of s.sp){const u=q.userData;u.a+=dt*.12*u.sp;const rr=s.r*(.25+.75*u.r);q.position.set(s.x+Math.cos(u.a)*rr,s.y+.6+u.h*3.2*g+Math.sin(s.t*.5+u.a)*.15,s.z+Math.sin(u.a)*rr);q.scale.setScalar(u.sz*(.5+.5*g)*1.5);q.material.opacity=.62*fade*Math.min(1,s.t/.5)}
   if(s.t>=s.life){s.sp.forEach(q=>{S.remove(q);q.material.dispose()});SMK.splice(i,1)}}}
/* bots cannot see through smoke: while the bots think, a ray that crosses a smoke cloud ends there as if it hit a wall (the player's bullets are not affected) */
var BOTPASS=0;{const _ub=updBots;updBots=function(){BOTPASS=1;try{return _ub.apply(this,arguments)}finally{BOTPASS=0}};
 const _cw=castW;castW=function(o,d,max){let r=_cw.apply(this,arguments);if(BOTPASS&&SMK.length)for(const s of SMK){if(s.r<1)continue;const ox=o.x-s.x,oy=o.y-(s.y+1.4),oz=o.z-s.z,b=ox*d.x+oy*d.y+oz*d.z,c=ox*ox+oy*oy+oz*oz-s.r*s.r*.8,h=b*b-c;if(h<0)continue;const tt=-b-Math.sqrt(h);if(tt<r&&(tt>0||c<0))r=Math.max(0,tt)}return r}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);if(run&&!paused){const t=performance.now()/1000;if(CLAY.length)clayTick(dt,t);if(SMK.length)smokeTick(dt)}}}

/* ===================== Call of Duty map tuning (each map keeps its own layout) =====================
   The rules the Call of Duty map designers describe, applied to what each map already is rather than to a template:
   simplicity (loose clutter is thinned out; structures, stairs and walls are never touched), cover in PAIRS on both sides of every objective so fights are head-on,
   a spawn shield in front of each team's base so the base is never in view from the far side of the map, and a measured check that no point on the map sees most of the rest.
   Every number comes from the map's own flags, zones and boxes. */
var MAPTUNE={Blockfort:{thin:4},Pillars:{thin:2},Canyon:{thin:4,wings:1},Suburbia:{thin:2},Boomtown:{thin:1},Rust:{thin:3,axis:'z',wings:1},Decay:{thin:5},'Classic Crossroads':{wings:1}};
function mapTune(name,cfg){const M=MAPS[name];if(!M||M.zm)return;const ob=M.b,od=M.deco;
 M.b=function(){const L=ob.call(this),rm=M._rm=[],top=L.filter(e=>e[4]>2.6&&(e[5]||0)<.5&&e[7]!='n'),touch=(e)=>{for(const t of top){if(Math.abs(e[0]-t[0])<(e[2]+t[2])/2+.7&&Math.abs(e[1]-t[1])<(e[3]+t[3])/2+.7)return true}return false};
  const out=[];let i=0;
  for(const e of L){const loose=e[4]<2.4&&e[4]>.3&&(e[5]||0)<.4&&Math.max(e[2],e[3])<5.6&&e[7]!='n'&&Math.abs(e[0])<M.H-2&&Math.abs(e[1])<M.H-2;
   if(loose&&cfg.thin>1&&!touch(e)){i++;if(i%cfg.thin!=0){rm.push([e[0]-e[2]/2-.25,e[1]-e[3]/2-.25,e[0]+e[2]/2+.25,e[1]+e[3]/2+.25]);continue}}out.push(e)}
  /* the map's own cover palette: the most common colour and surface among its low pieces, and among its walls */
  const mode=(f)=>{const c={};let best=null,n=0;for(const e of out){if(!f(e))continue;const k=e[6]+'|'+e[7];c[k]=(c[k]||0)+1;if(c[k]>n){n=c[k];best=e}}return best?[best[6],best[7]]:[0x777777,undefined]},cov=mode(e=>e[4]>.9&&e[4]<1.8&&Math.max(e[2],e[3])<4.6&&(e[5]||0)<.4),wal=mode(e=>e[4]>2.6&&e[4]<12&&(e[5]||0)<.4);
  const free=(x,z,w,d,m,ex)=>{if(Math.abs(x)>M.H-3||Math.abs(z)>M.H-3)return false;ex=ex==null?2.6:ex;for(const p of[...M.zn,...M.fb])if(Math.abs(x-p[0])<w/2+ex&&Math.abs(z-p[1])<d/2+ex)return false;for(const e of out){if(e[7]=='n'||(e[5]||0)>2.2)continue;if(e[4]<.3)continue;if(Math.abs(x-e[0])<(w+e[2])/2+m&&Math.abs(z-e[1])<(d+e[3])/2+m)return false}return true};
  const zax=cfg.axis=='z',add=(x,z,w,d,h,c,m,ex)=>{if(!free(x,z,w,d,m==null?.9:m,ex))return false;out.push([x,z,w,d,h,0,c[0],c[1]]);return true};
  /* paired cover at every Domination point: two pieces either side of the line between the teams, on both its sides */
  for(const[zx,zz]of M.zn)for(const s of[-1,1])for(const t of[-1,1]){const dx=zax?t*4.6:s*4.2,dz=zax?s*4.2:t*4.6;add(zx+dx,zz+dz,zax?1.2:2.5,zax?2.5:1.2,1.25,cov)}
  /* spawn shields: a wall between each team's base and the middle of the map, wide enough to break the line down the centre */
  for(const f of M.fb){const L_=Math.hypot(f[0],f[1])||1,vx=-f[0]/L_,vz=-f[1]/L_,qx=zax?1:0,qz=zax?0:1;let ok=false,sx_=0,sz_=0;for(const k of[6.5,5,8,4.2,9.5,3.4,11,13])for(const l of[0,3.2,-3.2,6,-6,9,-9]){if(ok)break;sx_=f[0]+vx*k+qx*l;sz_=f[1]+vz*k+qz*l;ok=add(sx_,sz_,zax?6.5:1.2,zax?1.2:6.5,3.1,wal,.45,1.9)}(M._tune=M._tune||[]).push(ok);
   /* open maps get wings: two shorter walls either side, a shallow U that closes the base off from the long sightlines */
   if(ok&&cfg.wings)for(const s of[-1,1])add(sx_+vx*2.2+qx*s*6.8,sz_+vz*2.2+qz*s*6.8,zax?4.6:1.2,zax?1.2:4.6,2.8,wal,.45,1.9)}
  /* drop the decorations that stood on thinned pieces */
  if(M._v)M._v=M._v.filter(e=>!(e[4]<2.3&&(e[5]||0)<.6&&rm.some(r=>e[0]>r[0]&&e[0]<r[2]&&e[1]>r[1]&&e[1]<r[3])));
  return out};
 M.deco=function(){const d=od?od.call(this):[],rm=M._rm||[];return d.filter(e=>!(e[4]<2.3&&(e[5]||0)<.6&&rm.some(r=>e[0]>r[0]&&e[0]<r[2]&&e[1]>r[1]&&e[1]<r[3])))}}
for(const k in MAPTUNE)mapTune(k,MAPTUNE[k]);


/* ===================== WEATHER: rain and thunder over Decay =====================
   The rain is ONE draw call: a LineSegments object whose drops fall inside a vertex shader (position = f(time), wrapped around the camera), so it costs no CPU per frame.
   Ground ripples are a second single draw call (animated points). The amount of rain follows the Graphics setting and the frame governor (LX.gTier thins it out).
   Thunder is soft and low (lowpass rumble, never above a whisper of the master volume); lightning briefly lifts the sun, the sky and the post-processing pulse. ===================== */
var WX={on:0,drops:null,rip:null,fl:0,next:7,pend:[],b0:[.85,.7],bolt:null,bt:0,sn:null,uC:{value:new THREE.Vector3()},uA:{value:1}};
function wxDispose(){for(const o of[WX.drops,WX.rip,WX.bolt]){if(!o)continue;if(o.parent)o.parent.remove(o);try{o.geometry.dispose();o.material.dispose()}catch(e){}}WX.drops=WX.rip=WX.bolt=null;WX.on=0}
function wxInit(M){wxDispose();if(sel.map!='Decay'||!mapG)return;
 const q=LX.q,n=q=='low'?1300:q=='med'?2500:4200,RAD=24,HGT=20;
 const pos=new Float32Array(n*6),sd=new Float32Array(n*4);
 for(let i=0;i<n;i++){const x=Math.random(),y=Math.random(),z=Math.random(),sp=.85+Math.random()*.4,ln=.5+Math.random()*.5;for(let e=0;e<2;e++){const j=(i*2+e);pos[j*3]=x;pos[j*3+1]=y;pos[j*3+2]=z;sd[j*2]=sp;sd[j*2+1]=e*ln}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(sd.subarray(0,n*4),2));
 const vs=`uniform float uT;uniform vec3 uC;attribute vec2 aS;varying float vA;
 void main(){float y=fract(position.y-uT*aS.x*1.15);vec2 u=fract(position.xz-uC.xz/${(RAD*2).toFixed(1)}+.5);vec3 p=vec3(uC.x+(u.x-.5)*${(RAD*2).toFixed(1)},y*${HGT.toFixed(1)}+.05,uC.z+(u.y-.5)*${(RAD*2).toFixed(1)});
 p.xz+=vec2(.09,.035)*(y*${HGT.toFixed(1)});p-=normalize(vec3(-.09,-1.,-.035))*(-aS.y*1.35);
 float dz=length(p.xz-uC.xz);vA=(1.-smoothstep(${(RAD*.45).toFixed(1)},${RAD.toFixed(1)},dz))*smoothstep(.0,.9,y*${HGT.toFixed(1)})*(.28+.22*aS.y);gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
 const fs=`varying float vA;uniform float uA;void main(){gl_FragColor=vec4(.74,.82,.92,vA*uA);}`;
 const mt=new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,fog:false,uniforms:{uT:LX.U.time,uC:WX.uC,uA:WX.uA}});
 const ls=new THREE.LineSegments(g,mt);ls.frustumCulled=false;ls.renderOrder=6;mapG.add(ls);WX.drops=ls;
 /* ripples on the ground */
 const m=q=='low'?90:q=='med'?150:240,rp=new Float32Array(m*3),rs=new Float32Array(m);for(let i=0;i<m;i++){rp[i*3]=Math.random();rp[i*3+1]=0;rp[i*3+2]=Math.random();rs[i]=Math.random()}
 const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(rp,3));g2.setAttribute('aR',new THREE.BufferAttribute(rs,1));
 const vs2=`uniform float uT;uniform vec3 uC;attribute float aR;varying float vA;
 void main(){float ph=fract(uT*.85+aR);vec2 u=fract(position.xz-uC.xz/36.+.5);vec3 p=vec3(uC.x+(u.x-.5)*36.,.06,uC.z+(u.y-.5)*36.);vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(ph*62./max(.5,-mv.z),1.,48.);vA=(1.-ph)*(1.-smoothstep(10.,18.,length(p.xz-uC.xz)))*.55;}`;
 const fs2=`varying float vA;uniform float uA;void main(){float d=length(gl_PointCoord-.5)*2.;float r=smoothstep(.62,.8,d)*(1.-smoothstep(.86,1.,d));gl_FragColor=vec4(.8,.88,.96,r*vA*uA);}`;
 const mt2=new THREE.ShaderMaterial({vertexShader:vs2,fragmentShader:fs2,transparent:true,depthWrite:false,fog:false,uniforms:{uT:LX.U.time,uC:WX.uC,uA:WX.uA}});
 const pt=new THREE.Points(g2,mt2);pt.frustumCulled=false;pt.renderOrder=6;mapG.add(pt);WX.rip=pt;
 WX.on=1;WX.fl=0;WX.next=5+Math.random()*6;WX.pend.length=0;WX.b0=[hemi.intensity,sun.intensity]}
/* the lightning bolt: a jagged line with a couple of forks, shown for a split second */
function wxBolt(){if(WX.bolt){mapG.remove(WX.bolt);WX.bolt.geometry.dispose();WX.bolt.material.dispose();WX.bolt=null}
 const a=Math.random()*6.283,d=70+Math.random()*60,bx=C.position.x+Math.cos(a)*d,bz=C.position.z+Math.sin(a)*d,pts=[];let x=bx,z=bz;
 const run_=(x0,y0,z0,y1,seg,j)=>{let px=x0,pz=z0;for(let i=0;i<seg;i++){const ny=y0+(y1-y0)*(i+1)/seg,nx=px+(Math.random()-.5)*j,nz=pz+(Math.random()-.5)*j;pts.push(px,y0+(y1-y0)*i/seg,pz,nx,ny,nz);px=nx;pz=nz}};
 run_(x,95,z,0,16,9);for(let f=0;f<2;f++){const k=30+Math.random()*40;run_(bx+(Math.random()-.5)*12,k,bz+(Math.random()-.5)*12,k-30-Math.random()*20,6,10)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));
 const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xdce8ff,transparent:true,opacity:1,fog:false,depthWrite:false}));l.frustumCulled=false;l.renderOrder=5;mapG.add(l);WX.bolt=l;WX.bt=.2;return d}
function wxThunder(delay,dist){setTimeout(()=>{try{if(!run||!WX.on)return;arenaSoundCaption('Thunder');if(!vol)return;ac=ac||new AudioContext();const c=ac,len=3.2,n=c.sampleRate*len,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);let l=0;
  for(let i=0;i<n;i++){l=l*.985+(Math.random()*2-1)*.06;const t=i/n,env=Math.pow(1-t,1.6)*(.6+.4*Math.sin(t*38+Math.sin(t*9)*3));a[i]=l*env*5}
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(260,c.currentTime);f.frequency.exponentialRampToValueAtTime(70,c.currentTime+len);f.Q.value=.7;
  const gv=Math.min(.12,.1*(1-Math.min(.8,dist/160)));g.gain.setValueAtTime(.0001,c.currentTime);g.gain.linearRampToValueAtTime(gv,c.currentTime+.12);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+len);s.connect(f);f.connect(g);g.connect(PlayerAudio.output(c,'ambience',true));s.start()}catch(e){}},delay)}
function wxSound(on){try{if(!on){if(WX.sn){const g=WX.sn.g;g.gain.setTargetAtTime(0,ac.currentTime,.3);const s=WX.sn.s;setTimeout(()=>{try{s.stop()}catch(e){}},1500);WX.sn=null}return}
 if(WX.sn){WX.sn.g.gain.setTargetAtTime(.028,ac.currentTime,.4);return}ac=ac||new AudioContext();const c=ac,n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){p=p*.35+(Math.random()*2-1)*.65;a[i]=p}
 const s=c.createBufferSource(),hp=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain();s.buffer=b;s.loop=true;hp.type='highpass';hp.frequency.value=900;lp.type='lowpass';lp.frequency.value=6500;g.gain.value=.0001;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(PlayerAudio.output(c,'ambience',true));s.start();g.gain.setTargetAtTime(.028,c.currentTime,.6);WX.sn={s,g}}catch(e){}}
function wxTick(dt){const live=WX.on&&run&&!paused;if(!WX.on){if(WX.sn)wxSound(false);return}
 WX.uC.value.copy(C.position);WX.uA.value=LX.gTier>=3?.5:LX.gTier>=2?.75:1;
 wxSound(!!live);if(!live)return;
 WX.next-=dt;if(WX.next<=0){WX.next=8+Math.random()*14;WX.fl=1;WX.rep=Math.random()<.6?2:1;const d=wxBolt();wxThunder(300+d*9,d);if(LX.fx)LX.fx.pulse=Math.max(LX.fx.pulse,.5)}
 if(WX.fl>0){WX.fl=Math.max(0,WX.fl-dt*(WX.fl>.45?3:1.8));if(WX.fl<.25&&WX.rep>1){WX.rep--;WX.fl=.85;if(WX.bolt)WX.bt=.14}
  hemi.intensity=WX.b0[0]*(1+WX.fl*1.6);sun.intensity=WX.b0[1]*(1+WX.fl*2.2);if(typeof skyM!='undefined'&&skyM&&skyM.material)skyM.material.color.setScalar(1+WX.fl*.9);if(WX.fl==0){hemi.intensity=WX.b0[0];sun.intensity=WX.b0[1];if(skyM&&skyM.material)skyM.material.color.setScalar(1)}}
 if(WX.bolt){WX.bt-=dt;WX.bolt.material.opacity=Math.max(0,WX.bt*5)*(Math.random()<.3?.4:1);if(WX.bt<=0){mapG.remove(WX.bolt);WX.bolt.geometry.dispose();WX.bolt.material.dispose();WX.bolt=null}}}
{const _gm=gfxMap;gfxMap=function(M,list){const r=_gm.apply(this,arguments);try{wxInit(M)}catch(e){console.warn('weather',e)}return r}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{wxTick(dt)}catch(e){}}}

/* ===================== Zombies without health bars: a blood vignette tells you how hurt you are ===================== */
var ZBV={el:null,last:-1};
function zbvTick(){if(!ZBV.el){const e=document.createElement('div');e.id='zblood';const h=document.getElementById('hud');if(!h)return;h.appendChild(e);ZBV.el=e}
 const on=mode=='Zombies'&&run&&!P.dead,low=on?Math.max(0,Math.min(1,1-(P.hp/P.mhp)/.7)):0,q=Math.round(low*12)/12;if(q!==ZBV.last){ZBV.last=q;ZBV.el.style.opacity=q;ZBV.el.className=q>.6?'crit':''}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{zbvTick()}catch(e){}}}

/* ===================== EQUIPMENT: 5 new lethals and 5 new tacticals =====================
   Lethals  (E, and X with the Danger Zone wildcard): Frag, Impact, Semtex, Claymore + Burn Charge, Throwing Axe, Remote Charge, Wire Mine, Firebomb.
   Tacticals (Q, and X with the Strategist wildcard): Flashbang + Shock Grenade, Smoke Canister, Pulse Grenade, Intercept Pod, Cipher Spike.
   Every item has its own 3D model (also used by the loadout screen), its own thrown arc, its own effect and its own synthesized sounds; nothing is shared between them.
   They work in Multiplayer (against the bots) and in Zombies (against the undead). ===================== */
var EQN={
 Frag:{k:'L',old:1,n:2,t:'A classic fragmentation grenade. 3.5 second fuse.'},
 Impact:{k:'L',old:1,n:2,t:'Explodes the moment it touches an enemy or the ground.'},
 Semtex:{k:'L',old:1,n:2,t:'Sticks to whatever it hits, enemies included.'},
 Claymore:{k:'L',old:1,n:2,t:'A mine with a laser fan that goes off when an enemy walks in front of it. 4 down at once.'},
 'Burn Charge':{k:'L',n:2,t:'Sticks to anything and ignites after a second: a patch of molten fire that burns for 5 seconds. Hold a doorway.'},
 'Throwing Axe':{k:'L',n:3,t:'Silent and deadly: one hit kills. It sticks in walls and floors; walk over it to pick it back up.'},
 'Remote Charge':{k:'L',n:2,t:'Sticks where it lands. Press G (or the lethal key with none left) to set off every planted charge at once. 3 planted at a time.'},
 'Wire Mine':{k:'L',n:2,t:'Place it on a wall or the floor: it strings a laser tripwire and blows when anyone crosses it. 3 down at once.'},
 Firebomb:{k:'L',n:2,t:'A bottle of burning fuel: shatters on impact into a wide, spreading fire for 6 seconds.'},
 Flashbang:{k:'T',old:1,n:2,t:'Blinds and stuns enemies who see it go off.'},
 'Shock Grenade':{k:'T',n:2,t:'A thunderous blast wave: enemies in range are knocked back, staggered and slowed for 4 seconds.'},
 'Smoke Canister':{k:'T',old:1,n:2,t:'A thick smoke screen for 14 seconds. Bots cannot see through it, bullets still pass.'},
 'Pulse Grenade':{k:'T',n:2,t:'An electromagnetic pulse: shorts out every enemy nearby and arcs lightning between them.'},
 'Intercept Pod':{k:'T',n:2,t:'Deploys a ward for 25 seconds. It repels anything that gets close with a thumping pulse and pops incoming grenades.'},
 'Cipher Spike':{k:'T',n:2,t:'Hacks the area: every enemy around it is marked through walls for 12 seconds and takes 25% more damage.'}};
var EQL=Object.keys(EQN).filter(k=>EQN[k].k=='L');
Object.assign(UNL,{'Burn Charge':8,'Throwing Axe':14,'Remote Charge':20,'Wire Mine':26,Firebomb:32,'Shock Grenade':6,'Smoke Canister':10,'Pulse Grenade':18,'Intercept Pod':28,'Cipher Spike':38,Flashbang:1});delete UNL.Smoke;
/* ---- models ---- */
function eqModel(id){const M=c=>new THREE.MeshLambertMaterial({color:c}),E=(c,k)=>{const m=new THREE.MeshBasicMaterial({color:c});if(k)m.color.multiplyScalar(k);return m},g=new THREE.Group(),
 cy=(rt,rb,h,x,y,z,m,rx,rz,sg_)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,sg_||14),m);e.position.set(x,y,z);if(rx)e.rotation.x=rx;if(rz)e.rotation.z=rz;g.add(e);return e},
 bx=(w,h,d,x,y,z,m,rx,ry,rz)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);e.rotation.set(rx||0,ry||0,rz||0);g.add(e);return e},
 sp=(r,x,y,z,m,sx,sy,sz)=>{const e=new THREE.Mesh(sg,m);e.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));e.position.set(x,y,z);g.add(e);return e},
 tr=(R,t,x,y,z,m,rx,rz)=>{const e=new THREE.Mesh(new THREE.TorusGeometry(R,t,8,22),m);e.position.set(x,y,z);e.rotation.x=rx==null?Math.PI/2:rx;if(rz)e.rotation.z=rz;g.add(e);return e},
 cn=(r,h,x,y,z,m,rx)=>{const e=new THREE.Mesh(new THREE.ConeGeometry(r,h,12),m);e.position.set(x,y,z);if(rx)e.rotation.x=rx;g.add(e);return e},
 st=M(0x8a9098),dk=M(0x1b1d21),P2=Math.PI/2;
 if(id=='Burn Charge'){const body=M(0x6a6e72),or=M(0xe0701a),cap=M(0x2a2c30);cy(.05,.05,.16,0,0,0,body);cy(.052,.052,.025,0,.03,0,or);cy(.052,.052,.025,0,-.03,0,or);cy(.05,.05,.014,0,.088,0,cap);cy(.05,.05,.014,0,-.088,0,cap);
  for(let i=0;i<8;i++){const a=i/8*6.283;bx(.006,.1,.004,Math.cos(a)*.05,0,Math.sin(a)*.05,dk)}cy(.02,.02,.03,0,.108,0,cap);tr(.022,.0035,.03,.116,0,st,0);cy(.034,.034,.006,0,-.095,0,E(0xff8a2a,1.6));bx(.02,.012,.07,.02,.12,0,st);
  cy(.0025,.0025,.14,-.03,.19,0,M(0x9a3a1a),.4,.6)}
 else if(id=='Throwing Axe'){const wood=M(0x7a5230),wrap=M(0x25282a),head=new THREE.MeshLambertMaterial({color:0x9aa2aa});if(head.metalness!==undefined){head.metalness=.9;head.roughness=.28}
  cy(.014,.017,.34,0,0,0,wood,0,0,10);for(let i=0;i<6;i++)cy(.0185,.0185,.014,0,-.1-i*.02,0,wrap,0,0,10);cy(.021,.021,.02,0,-.185,0,wrap,0,0,10);tr(.014,.003,0,-.2,0,M(0x3a3d30),0);
  bx(.034,.06,.056,0,.14,.0,head);bx(.012,.1,.07,0,.15,.062,head,0,0,0);bx(.011,.09,.008,0,.15,.098,M(0xdfe4ea));bx(.034,.03,.05,0,.115,-.04,head);cn(.011,.06,0,.145,-.065,head,-P2);
  bx(.04,.012,.02,0,.108,0,dk);bx(.02,.02,.02,0,.165,0,dk)}
 else if(id=='Remote Charge'){const o=M(0x55603a),tp=M(0x2a2d2f),w=M(0xc4b27a);bx(.12,.045,.08,0,0,0,o);bx(.122,.01,.082,-.04,0,0,tp);bx(.122,.01,.082,.04,0,0,tp);bx(.04,.01,.04,.0,.027,0,tp);
  sp(.014,0,.04,.02,E(0xff2a1a,2)).userData.led=1;bx(.028,.02,.028,.04,.034,-.015,dk);cy(.003,.003,.1,-.045,.1,-.02,st);sp(.007,-.045,.152,-.02,E(0xff2a1a,1.6));
  for(let i=0;i<3;i++)cy(.004,.004,.1,-.03+i*.03,.02,.04,M([0xc0392b,0x2a6a3a,0xd4b52a][i]),P2,P2);bx(.06,.014,.003,-.01,.003,.041,w)}
 else if(id=='Wire Mine'){const o=M(0x3b422c),lens=E(0xff2218,2.2);bx(.1,.06,.045,0,0,0,o);bx(.104,.01,.049,0,.036,0,dk);bx(.04,.03,.01,0,.0,.026,dk);sp(.016,0,0,.03,lens,1,1,.5);tr(.02,.004,0,0,.03,st,0);
  for(const s of[-1,1]){cy(.004,.001,.06,s*.04,-.05,-.01,st,0,s*.2);bx(.012,.012,.012,s*.04,-.02,-.02,dk)}bx(.02,.012,.02,-.03,.04,0,E(0x2aff6a,1.4));bx(.012,.01,.012,.03,.038,0,E(0xffb020,1.6))}
 else if(id=='Firebomb'){const gl=new THREE.MeshLambertMaterial({color:0x3f7a4a,transparent:true,opacity:.62}),fuel=new THREE.MeshLambertMaterial({color:0xd8902a,transparent:true,opacity:.85}),cloth=M(0xc9b78a);
  cy(.036,.04,.15,0,0,0,gl);cy(.028,.036,.03,0,.088,0,gl);cy(.015,.028,.05,0,.12,0,gl);cy(.016,.016,.03,0,.158,0,gl);cy(.032,.036,.09,0,-.01,0,fuel);sp(.04,0,-.075,0,gl,1,.5,1);cy(.04,.04,.05,0,-.01,0,M(0xe8e0c8));
  cy(.008,.006,.07,0,.17,0,cloth);cn(.016,.07,0,.225,0,E(0xff9a24,2));cn(.01,.045,0,.23,0,E(0xffe28a,2.4));sp(.04,0,.23,0,E(0xff7a1a,.8),1,1.6,1).material.transparent=true}
 else if(id=='Shock Grenade'){const b=M(0x3a4a66),y=M(0xd9b421);cy(.045,.045,.13,0,0,0,b);cy(.047,.047,.02,0,.04,0,y);cy(.047,.047,.02,0,-.04,0,y);cy(.04,.045,.016,0,.073,0,dk);cy(.045,.04,.016,0,-.073,0,dk);
  for(let r=0;r<2;r++)for(let i=0;i<8;i++){const a=i/8*6.283+r*.39;bx(.012,.012,.006,Math.cos(a)*.0455,-.012+r*.036,Math.sin(a)*.0455,dk,0,P2-a,0)}
  cy(.014,.014,.022,0,.092,0,st);bx(.012,.006,.056,.012,.1,0,st);tr(.013,.0024,.034,.094,0,st,0)}
 else if(id=='Smoke Canister'){const b=M(0xc2c6c8),gr=M(0x4f8a4a);cy(.04,.04,.14,0,0,0,b);cy(.042,.042,.024,0,.02,0,gr);cy(.036,.04,.018,0,.08,0,dk);cy(.04,.036,.018,0,-.08,0,dk);
  for(let i=0;i<6;i++){const a=i/6*6.283;bx(.012,.012,.012,Math.cos(a)*.026,.095,Math.sin(a)*.026,dk)}cy(.012,.012,.02,0,.103,0,st);bx(.012,.006,.056,.012,.112,0,st);tr(.012,.0022,.032,.106,0,st,0);for(let i=0;i<5;i++)bx(.006,.01,.004,Math.cos(i*1.25)*.04,-.065,Math.sin(i*1.25)*.04,dk)}
 else if(id=='Pulse Grenade'){const core=E(0x4ab8ff,2),cu=M(0xb8672a);sp(.04,0,0,0,M(0x2a3040));sp(.028,0,0,0,core);for(let i=0;i<3;i++){const t=tr(.047,.0042,0,0,0,cu,i*P2/1.5);t.rotation.y=i*1.047}
  for(let i=0;i<12;i++){const a=i/12*6.283;bx(.004,.008,.006,Math.cos(a)*.0475,Math.sin(a)*.0475,0,E(0x7ad4ff,1.8),0,0,a)}cy(.022,.026,.024,0,.052,0,dk);bx(.012,.006,.05,.012,.07,0,st);tr(.012,.0022,.03,.064,0,st,0)}
 else if(id=='Intercept Pod'){const b=M(0x3a3f45),a=E(0x35e0a0,1.8);cy(.075,.085,.05,0,0,0,b);cy(.06,.075,.014,0,.03,0,M(0x6a7078));for(let i=0;i<6;i++){const an=i/6*6.283;sp(.016,Math.cos(an)*.056,.04,Math.sin(an)*.056,a,1,.7,1);cy(.009,.011,.02,Math.cos(an)*.056,.022,Math.sin(an)*.056,dk)}
  cy(.008,.008,.07,0,.07,0,st);{const dh=cy(.04,.012,.014,0,.108,0,M(0x6a7078),0,0,10);dh.rotation.x=.4;dh.userData.dish=1}sp(.012,0,.118,.012,a);cy(.003,.003,.07,.05,.07,-.03,st);sp(.006,.05,.108,-.03,E(0xff4a2a,1.8));tr(.082,.005,0,-.02,0,M(0x2a2d31),P2)}
 else if(id=='Cipher Spike'){const b=M(0x15171a),gn=E(0x39ff7a,1.8);cn(.03,.12,0,-.04,0,b,Math.PI);cy(.036,.036,.026,0,.03,0,b,0,0,10);for(let r=0;r<3;r++)for(let c=0;c<4;c++)bx(.006,.002,.006,-.012+c*.008,.0445,-.01+r*.008,gn);
  cy(.003,.003,.08,-.02,.08,0,st);cy(.003,.003,.06,.02,.07,0,st);sp(.005,-.02,.122,0,E(0xff3a3a,1.6));sp(.005,.02,.102,0,gn);tr(.04,.003,0,.016,0,M(0x2a6a4a))}
 else return null;
 return g}
/* ---- state, slots ---- */
var EQ={lc:[0,0],tc:[0,0],P:[],FZ:[],MN:[],CH:[],PD:[],RG:[],AR:[],hand:null,hud:null,hk:'',t:0,fsn:null,bt:0};
var hasWC=n=>Array.isArray(L.wc)&&L.wc.includes(n),tacName=i=>i==1?(L.t===undefined?'Flashbang':L.t):L.t2,
 foe=b=>b.al&&!b.net&&(b.zom||!(typeof ally=='function'&&ally(b))),eqC=()=>C.position.clone(),eqN=x=>x&&EQN[x]?EQN[x].n:0;
function eqDmg(b,d,head,name){src=name||'Equipment';srcK='';try{hitBot(b,d,head)}catch(e){}}
function eqSlot(i){if(i==0)return{n:LG(),get c(){return gc},set c(v){gc=v},k:'L'};if(i==2)return{n:tacName(1),get c(){return ST.tN},set c(v){ST.tN=v},k:'T'};
 if(hasWC('Danger Zone')&&L.g2)return{n:L.g2,get c(){return EQ.lc[1]},set c(v){EQ.lc[1]=v},k:'L'};if(hasWC('Strategist')&&L.t2)return{n:L.t2,get c(){return EQ.tc[1]},set c(v){EQ.tc[1]=v},k:'T'};return null}
function eqRefill(){if(EQ.hand){C.remove(EQ.hand.m);EQ.hand=null}const z=mode=='Zombies',a=eqN(LG()),b=eqN(tacName(1));gc=z?Math.max(gc,a):a;ST.tN=z?Math.max(ST.tN,b):b;EQ.lc[1]=hasWC('Danger Zone')?eqN(L.g2):0;EQ.tc[1]=hasWC('Strategist')?eqN(L.t2):0}
function eqInit(){for(const l of[EQ.P,EQ.FZ,EQ.MN,EQ.CH,EQ.PD,EQ.RG,EQ.AR])for(const o of l){try{S.remove(o.m)}catch(e){}}EQ.P=[];EQ.FZ=[];EQ.MN=[];EQ.CH=[];EQ.PD=[];EQ.RG=[];EQ.AR=[];eqRefill()}
/* ---- unique sounds ---- */
var eqS={
 osc(ty,f0,f1,d,g0,lp,dl){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(g0*vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);let n=o;if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(PlayerAudio.output(ac));o.start(t);o.stop(t+d+.03)}catch(e){}},
 nz(d,f0,f1,g0,type,q,dl){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),n=Math.max(64,Math.floor(ac.sampleRate*d)),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(g0*vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(PlayerAudio.output(ac));s.start(t)}catch(e){}},
 throw(){this.nz(.22,500,1400,.07,'bandpass',1.2)},
 axeThrow(){this.nz(.3,350,1100,.1,'bandpass',2);this.osc('sine',300,520,.18,.02)},
 axeHit(){this.osc('sine',150,55,.14,.2);this.nz(.1,900,300,.16,'lowpass');this.osc('sine',1950,1700,.5,.04,5000,.01);this.osc('triangle',2900,2400,.3,.02,6000,.01)},
 stick(){this.osc('sine',180,70,.07,.07);this.nz(.06,3000,900,.06,'highpass')},
 burn(){this.nz(.5,2200,500,.16,'bandpass',.6);this.osc('sine',110,50,.45,.12);this.nz(.9,300,120,.1,'lowpass',.5,.1)},
 glass(){for(let i=0;i<6;i++)this.nz(.09+Math.random()*.1,3000+Math.random()*4000,2500,.07,'bandpass',4,i*.012);this.nz(.45,420,150,.2,'lowpass',.5,.02);this.osc('sine',90,40,.4,.14,0,.02)},
 beepArm(n){for(let i=0;i<(n||2);i++)this.osc('sine',1700+i*260,1700+i*260,.05,.04,0,i*.11)},
 mineArm(){for(let i=0;i<3;i++)this.osc('triangle',700+i*220,700+i*220,.07,.05,0,i*.16)},
 trip(){this.osc('sine',3200,3000,.03,.07);this.osc('sine',600,200,.08,.06,0,.03)},
 shock(){this.osc('sine',95,38,.55,.4);this.nz(.35,1200,150,.28,'lowpass',.6);this.osc('sine',4200,4000,.7,.035,0,.05);this.osc('sine',60,30,.8,.25)},
 pulse(){this.osc('sawtooth',180,2600,.55,.05,5000);for(let i=0;i<7;i++)this.nz(.05,3000+Math.random()*3000,3000,.09,'highpass',1,.5+i*.05+Math.random()*.05);this.osc('sine',80,40,.5,.2,0,.52)},
 deploy(){this.osc('sine',160,420,.28,.035,1800);this.osc('sine',420,380,.08,.03,0,.28);this.nz(.15,2000,800,.06,'bandpass',1.5,.05)},
 ward(){this.osc('sine',230,70,.3,.22);this.nz(.25,900,200,.13,'lowpass',.7)},
 cipher(){for(let i=0;i<8;i++)this.osc('sine',1200+Math.random()*1800,1200+Math.random()*1800,.035,.035,0,i*.045)},
 bang(){this.osc('sine',80,30,.55,.3);this.nz(.4,800,120,.3,'lowpass',.6)}};
/* a roaring fire loop that follows the number of fires burning */
function eqFireSnd(n){try{if(!n&&!EQ.fsn)return;ac=ac||new AudioContext();const c=ac;if(!EQ.fsn){const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=b.getChannelData(0);let p=0;for(let i=0;i<a.length;i++){p=p*.9+(Math.random()*2-1)*.1;a[i]=p*(.55+.45*Math.sin(i/c.sampleRate*38+Math.sin(i/c.sampleRate*11)*4))*3}
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=900;g.gain.value=.0001;s.connect(f);f.connect(g);g.connect(PlayerAudio.output(c));s.start();EQ.fsn={s,g}}
 EQ.fsn.g.gain.setTargetAtTime(n?Math.min(.2,.09+n*.04)*vol:.0001,c.currentTime,.25);if(!n){const o=EQ.fsn;setTimeout(()=>{if(!EQ.FZ.length&&EQ.fsn===o){try{o.s.stop()}catch(e){}EQ.fsn=null}},1500)}}catch(e){}}
/* ---- helpers for visuals ---- */
var eqRing=(p,r0,r1,life,col,op)=>{const m=new THREE.Mesh(EQ.rg||(EQ.rg=new THREE.RingGeometry(.88,1,64)),new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:op}));m.position.copy(p);m.position.y=Math.max(.06,p.y);m.rotation.x=-Math.PI/2;m.scale.setScalar(r0);m.renderOrder=4;S.add(m);EQ.RG.push({m,a:0,L:life,r0,r1,op})},
 eqSp=(p,s0,s1,life,c,op,v,add,tex)=>{try{const H=JX.h;return H.addSp({p,s0,s1,life,c,op,tex:tex||H.flareTex,v,dr:.9,add})}catch(e){}},
 eqFlame=(p,sc)=>{eqSp(p,.25*sc,.7*sc,.5+Math.random()*.3,[3,1.15,.25],.7,V((Math.random()-.5)*.6,1.4+Math.random()*1.2,(Math.random()-.5)*.6))},
 eqArc=(a,b)=>{const pts=[],n=7;for(let i=0;i<=n;i++){const t=i/n,j=i==0||i==n?0:.35;pts.push(a.x+(b.x-a.x)*t+(Math.random()-.5)*j,a.y+(b.y-a.y)*t+(Math.random()-.5)*j,a.z+(b.z-a.z)*t+(Math.random()-.5)*j)}
  const g=new THREE.BufferGeometry();const seg=[];for(let i=0;i<n;i++)seg.push(pts[i*3],pts[i*3+1],pts[i*3+2],pts[i*3+3],pts[i*3+4],pts[i*3+5]);g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(seg),3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x9ad8ff,transparent:true,opacity:1,fog:false}));l.frustumCulled=false;S.add(l);EQ.AR.push({m:l,l:.18})};
/* ---- launching a thrown item ---- */
function eqThrowModel(name,spd,up,opts){const m=eqModel(name);if(!m)return;const d=aimDir(),p=eqC().add(d.clone().multiplyScalar(.55)).add(V(0,-.1,0)),v=d.clone().multiplyScalar(spd).add(V(0,up,0));m.position.copy(p);S.add(m);
 EQ.P.push({n:name,m,p,v,t:0,rest:0,st:0,sb:null,sp:V((Math.random()-.5)*6,(Math.random()-.5)*4,10+Math.random()*6),o:opts||{}});shake=Math.max(shake,.12)}
/* the viewmodel flourish: the item swoops up from the lower right, a short wind-up, then it leaves your hand */
function eqHandAnim(name,delay,fn){try{if(EQ.hand){C.remove(EQ.hand.m)}const m=eqModel(name)||new THREE.Group();m.scale.setScalar(1.1);C.add(m);EQ.hand={m,t:0,d:delay,fn,done:0}}catch(e){fn()}}
function eqUse(slot){if(P.dead||!run||paused)return;const sl=eqSlot(slot);if(!sl||!sl.n)return;const n=sl.n;
 if(n=='Remote Charge'&&sl.c<=0&&EQ.CH.length){eqDetonate();return}
 if(n=='Remote Charge'&&EQ.CH.length>=3){msg('3 charges planted: press G to detonate',1.3);return}
 if(sl.c<=0){msg((n)+': none left',1);return}
 const def=EQN[n];if(def&&def.old){eqOld(slot,sl,n);return}
 const go=()=>{try{eqLaunchItem(n)}catch(e){console.warn('equipment',e)}};
 if(n=='Wire Mine'){if(!eqMine(sl))return;sl.c--;return}
 sl.c--;eqS.throw();eqHandAnim(n,.2,go);if(typeof haptic=='function')haptic(.35,120,.3,'both')}
/* the original items (Frag, Impact, Semtex, Claymore, Flashbang) go through the old code, with the counters swapped for the second slot */
function eqOld(slot,sl,n){if(sl.k=='L'){const sv=L.g,sg_=gc;if(slot==1){L.g=n;gc=EQ.lc[1]}const r=throwG0();if(slot==1){EQ.lc[1]=gc;gc=sg_;L.g=sv}return r}
 if(n=='Smoke Canister'){sl.c--;eqS.throw();eqHandAnim(n,.18,()=>{const d=aimDir(),p=eqC().add(d.clone().multiplyScalar(.55)),m=eqModel(n);m.position.copy(p);S.add(m);grs.push({m,p,v:d.clone().multiplyScalar(18).add(V(0,3,0)),t:1.3,g:{R:0,d:0,smoke:1,fuse:1.3},bt:0,stuck:0});m.scale.setScalar(1)});return}
 const sv=ST.tN;if(slot==1)ST.tN=EQ.tc[1];actTactical0();if(slot==1){EQ.tc[1]=ST.tN;ST.tN=sv}}
function eqLaunchItem(n){const O={
 'Burn Charge':()=>eqThrowModel(n,15,3,{stk:1,fuse:1.1,kind:'burn'}),
 'Throwing Axe':()=>{eqS.axeThrow();eqThrowModel(n,34,1.4,{axe:1})},
 'Remote Charge':()=>eqThrowModel(n,14,3,{stk:1,kind:'c4'}),
 'Firebomb':()=>eqThrowModel(n,16,3.5,{shatter:1,kind:'fire'}),
 'Shock Grenade':()=>eqThrowModel(n,17,3,{fuse:1.6,kind:'shock'}),
 'Pulse Grenade':()=>eqThrowModel(n,16,3,{fuse:1.4,kind:'pulse'}),
 'Intercept Pod':()=>eqThrowModel(n,13,3,{deploy:1,kind:'pod'}),
 'Cipher Spike':()=>eqThrowModel(n,15,3,{deploy:1,kind:'cipher',stkG:1})};(O[n]||(()=>{}))()}
/* ---- the wire mine is placed, not thrown ---- */
function eqMine(sl){const o=eqC(),d=aimDir(),wl=castW(o,d,3.6);let p,dir;if(wl<3.5){p=o.clone().add(d.clone().multiplyScalar(wl-.08));p.y=Math.max(.2,Math.min(1.6,p.y));dir=V(-d.x,0,-d.z).normalize()}
 else if(d.y<-.12){const t=(.06-o.y)/d.y;if(t>3.6||t<0){msg('Look at a wall or the floor to place it',1.2);return false}p=o.clone().add(d.clone().multiplyScalar(t));p.y=.06;dir=V(d.x,0,d.z).normalize()}else{msg('Look at a wall or the floor to place it',1.2);return false}
 if(EQ.MN.length>=3){const f=EQ.MN.shift();S.remove(f.m);S.remove(f.l)}
 const m=eqModel('Wire Mine');m.position.copy(p);m.rotation.y=Math.atan2(dir.x,dir.z);m.scale.setScalar(1.35);S.add(m);
 const len=Math.min(7,castW(p.clone(),dir,7)),lm=new THREE.Mesh(bmG,new THREE.MeshBasicMaterial({color:0xff2a20,transparent:true,opacity:.0,depthWrite:false,blending:THREE.AdditiveBlending}));lm.scale.set(.007,len,.007);lm.position.copy(p).add(dir.clone().multiplyScalar(len/2));lm.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(lm);
 EQ.MN.push({m,l:lm,p,dir,len,t:0,own:1});eqS.stick();eqS.mineArm();burst(p.clone(),6,0xffa040,3,.25,.08);msg('WIRE MINE ARMED IN 1.5s',1.2);return true}
/* ---- detonate every planted remote charge ---- */
function eqDetonate(){if(!EQ.CH.length){return}const n=EQ.CH.length;for(const c of EQ.CH.splice(0)){S.remove(c.m);src='Remote Charge';srcK='';boom(c.p.clone(),{R:6.4,d:330,imp:0,c:0xffa040,own:0})}msg('DETONATED '+n+' CHARGE'+(n>1?'S':''),1.2);shake=Math.max(shake,.7);try{LX.fx.pulse=Math.max(LX.fx.pulse,.6)}catch(e){}}
/* ---- fire patches (Burn Charge, Firebomb) ---- */
function eqFire(p,R,dur,dps,big){const z={p:p.clone(),R,t:0,dur,dps,tk:0,em:0,fl:0};p.y=Math.max(.1,p.y);EQ.FZ.push(z);burst(p.clone(),20,0xff8a30,6,.5,.12);eqRing(p,.6,R*1.1,.5,0xff9a3a,.7);try{JX.flash(p.clone().add(V(0,.8,0)),0xff8a30,3,.5,R*5)}catch(e){}shake=Math.max(shake,big?.45:.3)}
/* ---- per-item landing and detonation ---- */
function eqLand(o){const k=o.o.kind,p=o.p;
 if(k=='c4'){EQ.CH.push({m:o.m,p:p.clone(),sb:o.sb});eqS.stick();eqS.beepArm(2);msg('PLANTED ('+EQ.CH.length+')',1);o.dead='keep'}
 else if(k=='pod'||k=='cipher'){o.dep=0;o.rest=1}}
function eqBlast(o){const k=o.o.kind,p=o.p.clone();
 if(k=='fire'){eqS.glass();eqFire(p,3.5,6.5,36,1);return 1}
 if(k=='burn'){eqS.burn();eqFire(p,2.4,5,78,0);return 1}
 if(k=='shock'){eqS.shock();eqRing(p,.5,12,.7,0x9ad0ff,.9);eqRing(p,.3,8,.5,0xffffff,.6);burst(p.clone(),24,0xbfe0ff,10,.5,.12);try{JX.flash(p.clone().add(V(0,.5,0)),0x9ad0ff,3.5,.4,40)}catch(e){}
  let n=0;for(const b of bots){if(!foe(b))continue;const dx=b.x-p.x,dz=b.z-p.z,d=Math.hypot(dx,dz);if(d>12)continue;n++;const k_=1-d/12;b.stun=Math.max(b.stun||0,4*(.45+k_*.55));b.kb=(b.kb||0);try{b.x+=dx/(d||1)*k_*2.4;b.z+=dz/(d||1)*k_*2.4;if(b.m)b.m.position.set(b.x,0,b.z)}catch(e){}eqDmg(b,18*k_,0,'Shock Grenade')}
  const d=Math.hypot(P.x-p.x,P.z-p.z);if(d<12){shake=Math.max(shake,1-d/12);try{LX.fx.ca=1;LX.fx.pulse=Math.max(LX.fx.pulse,.9)}catch(e){}}if(n)msg(n+' STAGGERED',1.2);return 1}
 if(k=='pulse'){eqS.pulse();eqRing(p,.5,15,.6,0x5ac8ff,.9);eqRing(p,.3,9,.4,0xffffff,.6);const hit=[];for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-p.x,b.z-p.z)<15){hit.push(b);b.stun=Math.max(b.stun||0,4.5);eqDmg(b,b.zom?40:22,0,'Pulse Grenade')}}
  const pts=[p.clone().add(V(0,.6,0)),...hit.slice(0,7).map(b=>V(b.x,(b.y||0)+1.1,b.z))];for(let i=0;i<pts.length-1;i++){eqArc(pts[i],pts[i+1]);if(i<hit.length)burst(pts[i+1].clone(),8,0x9ad8ff,6,.3,.07)}for(let i=0;i<5;i++)eqArc(p.clone().add(V(0,.6,0)),p.clone().add(V((Math.random()-.5)*8,Math.random()*3,(Math.random()-.5)*8)));
  try{JX.flash(p.clone().add(V(0,.6,0)),0x7ad4ff,4,.45,40)}catch(e){}if(Math.hypot(P.x-p.x,P.z-p.z)<15){try{LX.fx.pulse=1;LX.fx.ca=1}catch(e){}}if(hit.length)msg(hit.length+' SHORTED OUT',1.2);return 1}
 return 0}
/* ---- one frame of everything ---- */
function eqTick(dt){EQ.t+=dt;if(!run||paused){return}
 /* hand animation */
 if(EQ.hand){const h=EQ.hand;h.t+=dt;const u=Math.min(1,h.t/h.d);h.m.position.set(.28-.16*u,-.4+.18*Math.sin(u*Math.PI)+.14*u,-.34-.16*u);h.m.rotation.set(-1.1*u+.5,.3*u,.9*(1-u));if(h.t>=h.d&&!h.done){h.done=1;try{h.fn()}catch(e){console.warn(e)}C.remove(h.m);EQ.hand=null}}
 /* projectiles */
 for(let i=EQ.P.length-1;i>=0;i--){const o=EQ.P[i];o.t+=dt;if(o.dead){if(o.dead=='keep')EQ.P.splice(i,1);else{S.remove(o.m);EQ.P.splice(i,1)}continue}
  if(o.st){ /* stuck or resting */
   if(o.sb){if(!o.sb.al){o.st=0;o.sb=null;o.v.set(0,0,0)}else{o.p.set(o.sb.x,(o.sb.y||0)+1.1,o.sb.z);o.m.position.copy(o.p)}}
   if(o.st){    if(o.o.axe){if(!o.sb&&Math.hypot(P.x-o.p.x,P.z-o.p.z)<1.5&&Math.abs(P.y-o.p.y+1)<2.2){gc=Math.min(gc+1,EQN['Throwing Axe'].n);const sl=eqSlot(0);if(sl&&sl.n!='Throwing Axe'&&EQ.lc[1]!==undefined&&hasWC('Danger Zone')&&L.g2=='Throwing Axe')EQ.lc[1]++;S.remove(o.m);EQ.P.splice(i,1);msg('AXE RECOVERED',1);eqS.stick();continue}
     if(o.t>40){S.remove(o.m);EQ.P.splice(i,1)}continue}
    if(o.o.kind=='burn'){o.fz=(o.fz||0)+dt;o.m.scale.setScalar(1+.12*Math.sin(o.fz*30));if(o.fz>=o.o.fuse){eqBlast(o);S.remove(o.m);EQ.P.splice(i,1);continue}}
    else if(o.o.kind=='pod'||o.o.kind=='cipher'){o.dt=(o.dt||0)+dt;
     if(!o.dep&&o.dt>.5){o.dep=1;o.dt=0;eqS.deploy();if(o.o.kind=='cipher'){eqCipher(o)}else{EQ.PD.push({m:o.m,p:o.p.clone(),t:0,pt:1.5,dish:o.m.children.find(c=>c.userData.dish)});o.dead='keep'}if(o.o.kind=='cipher')o.life=12}
     if(o.dep&&o.o.kind=='cipher'){o.m.rotation.y+=dt*2;if(o.life!=null){o.life-=dt;if(Math.random()<dt*10)eqSp(o.p.clone().add(V(0,.1,0)),.1,.3,.5,[.4,3,.9],.8,V((Math.random()-.5),1.2,(Math.random()-.5)));if(o.life<=0){S.remove(o.m);EQ.P.splice(i,1)}}}}
    continue}}
  /* flight */
  o.v.y-=(o.o.axe?10:20)*dt;const np=o.p.clone().add(o.v.clone().multiplyScalar(dt));let hitW=false,hitF=false;
  if(np.y<.13){np.y=.13;hitF=true}
  hitW=MAPS[sel.map].boardRay?lockboxEquipmentHit(o.p,np):bx.some(b=>np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y<b.h&&np.y>(b.y0||0));
  /* enemy contact */
  let hb=null;for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-np.x,b.z-np.z)<.75&&np.y<(b.y||0)+2.1&&np.y>(b.y||0)){hb=b;break}}
    if(o.o.axe){o.m.rotation.x+=dt*(hitF||hitW?0:18);
   if(hb){const head=np.y>(hb.y||0)+1.55;eqDmg(hb,head?220:150,head,'Throwing Axe');eqS.axeHit();burst(np.clone(),10,0xb51818,5,.4,.09);msg(head?'HEADSHOT AXE':'AXE HIT',1);o.st=1;o.sb=null;o.p.copy(np);o.dead=1;continue}
   if(hitW||hitF){o.p.copy(hitW?o.p:np);o.v.set(0,0,0);o.st=1;eqS.axeHit();burst(o.p.clone(),6,0xcccccc,3,.25,.07);o.m.rotation.set(hitF?-.4:0,o.m.rotation.y,0);o.m.position.copy(o.p);continue}
   o.m.lookAt(o.p.clone().add(o.v));o.m.rotateX(Math.PI/2);o.m.rotateY(o.t*20)}
  else{o.m.rotation.x+=dt*o.sp.x;o.m.rotation.y+=dt*o.sp.y;o.m.rotation.z+=dt*.5*o.sp.z;
   if(o.o.shatter&&(hitF||hitW||hb)){eqBlast(o);S.remove(o.m);EQ.P.splice(i,1);continue}
   if(o.o.stk){if(hb){o.st=1;o.sb=hb;o.v.set(0,0,0);np.set(hb.x,(hb.y||0)+1.1,hb.z);o.p.copy(np);o.m.position.copy(np);burst(np.clone(),8,0xff5522,3,.3,.1);msg('STUCK!',1);eqLand(o);continue}
    if(hitW||hitF){o.st=1;o.v.set(0,0,0);if(hitW)np.copy(o.p);o.p.copy(np);o.m.position.copy(np);burst(np.clone(),6,0xffa040,3,.25,.08);eqS.stick();eqLand(o);continue}}
   else if(o.o.deploy||o.o.fuse){if(hitF){np.y=.13;o.v.y*=-.3;o.v.x*=.55;o.v.z*=.55;if(Math.abs(o.v.y)<1.2&&Math.hypot(o.v.x,o.v.z)<1.5){if(o.o.deploy){o.st=1;o.v.set(0,0,0);o.p.copy(np);o.m.position.set(np.x,.1,np.z);eqLand(o);continue}}}
    if(hitW){o.v.x*=-.35;o.v.z*=-.35;np.copy(o.p)}
    if(o.o.fuse&&o.t>=o.o.fuse){o.p.copy(np);eqBlast(o);S.remove(o.m);EQ.P.splice(i,1);continue}}}
  o.p.copy(np);o.m.position.copy(np)}
 /* fire patches */
 let burning=0;for(let i=EQ.FZ.length-1;i>=0;i--){const z=EQ.FZ[i];z.t+=dt;z.tk-=dt;z.em-=dt;burning++;const fade=Math.min(1,(z.dur-z.t)/1.2);
  if(z.em<=0){z.em=.045;for(let k=0;k<2;k++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*z.R*.92;eqFlame(z.p.clone().add(V(Math.cos(a)*r,.1,Math.sin(a)*r)),(.7+Math.random()*.7)*fade)}if(Math.random()<.3)eqSp(z.p.clone().add(V((Math.random()-.5)*z.R,.8,(Math.random()-.5)*z.R)),.4,1.4,1.2,[.25,.24,.22],.35,V(0,1,0),false,JX.h.puffTex)}
  z.fl-=dt;if(z.fl<=0){z.fl=.12;try{JX.flash(z.p.clone().add(V(0,.8,0)),0xff8a30,2+Math.random(),.2,z.R*5)}catch(e){}}
  if(z.tk<=0){z.tk=.25;for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-z.p.x,b.z-z.p.z)<z.R&&Math.abs((b.y||0)-z.p.y)<2.4){eqDmg(b,z.dps*.25,0,'Fire');b.burn=2.2}}
   if(!P.dead&&Math.hypot(P.x-z.p.x,P.z-z.p.z)<z.R*.9&&Math.abs(P.y-z.p.y)<1.6){hurt(z.dps*.25*.28,null);if(Math.random()<.4)beep(200,.05,'sawtooth',.03)}}
  if(z.t>=z.dur){EQ.FZ.splice(i,1)}}
 eqFireSnd(burning);
 /* anyone on fire keeps burning for a moment */
 for(const b of bots){if(b.burn>0){b.burn-=dt;b.bt=(b.bt||0)-dt;if(b.bt<=0&&b.al){b.bt=.4;eqDmg(b,10,0,'Fire')}if(b.al&&Math.random()<dt*14)eqFlame(V(b.x+(Math.random()-.5)*.4,(b.y||0)+.6+Math.random()*1.1,b.z+(Math.random()-.5)*.4),.45)}}
 /* wire mines */
 for(let i=EQ.MN.length-1;i>=0;i--){const m=EQ.MN[i];m.t+=dt;const armed=m.t>1.5;m.l.material.opacity=armed?.55+.25*Math.sin(EQ.t*30):(Math.floor(m.t*8)%2?.18:0);
  if(armed){for(const b of bots){if(!foe(b))continue;const rx=b.x-m.p.x,rz=b.z-m.p.z,t=rx*m.dir.x+rz*m.dir.z;if(t<0||t>m.len)continue;if(Math.abs(rx*m.dir.z-rz*m.dir.x)<.5&&(b.y||0)<m.p.y+1.2){eqS.trip();const p=m.p.clone();S.remove(m.m);S.remove(m.l);EQ.MN.splice(i,1);src='Wire Mine';srcK='';boom(p.clone().add(m.dir.clone().multiplyScalar(t*.5)),{R:4.6,d:220,imp:0,c:0xffa040,own:0});break}}}}
 /* remote charges blink */
 for(const c of EQ.CH){if(c.sb){if(!c.sb.al)c.sb=null;else{c.p.set(c.sb.x,(c.sb.y||0)+1.1,c.sb.z);c.m.position.copy(c.p)}}const on=Math.floor(EQ.t*3)%2,led=c.m.children.find(x=>x.userData.led);if(led&&led.material)led.material.color.setRGB(on?2.4:.25,on?.2:0,on?.1:0)}
 /* intercept pods: a thumping ward that repels and pops incoming grenades */
 for(let i=EQ.PD.length-1;i>=0;i--){const d=EQ.PD[i];d.t+=dt;d.pt-=dt;const rise=Math.min(1,d.t/.6);if(d.dish)d.dish.position.y=.108+.04*rise,d.dish.rotation.y+=dt*(2+rise*5);d.m.scale.setScalar(1+.04*Math.sin(d.t*8));
  for(const g of grs){if(g.g&&g.g.R>0&&g.own!==1&&g.p.distanceTo(d.p)<6&&!g.pop){g.pop=1;eqArc(d.p.clone().add(V(0,.3,0)),g.p.clone());burst(g.p.clone(),14,0x6affc8,7,.35,.09);g.t=-1;g.g={...g.g,R:0,d:0}}}
  if(d.pt<=0){let any=0;for(const b of bots){if(!foe(b))continue;const dx=b.x-d.p.x,dz=b.z-d.p.z,dd=Math.hypot(dx,dz);if(dd<4){any=1;b.stun=Math.max(b.stun||0,.9);try{b.x+=dx/(dd||1)*1.6;b.z+=dz/(dd||1)*1.6;if(b.m)b.m.position.set(b.x,0,b.z)}catch(e){}eqDmg(b,b.zom?28:20,0,'Intercept Pod')}}
   if(any){d.pt=1.6;eqS.ward();eqRing(d.p,.4,4.2,.45,0x6affc8,.85);burst(d.p.clone().add(V(0,.3,0)),12,0x6affc8,5,.3,.08);shake=Math.max(shake,.12)}else d.pt=.2}
  if(d.t>25){S.remove(d.m);EQ.PD.splice(i,1)}}
 /* cipher marks */
 for(const b of bots){if(b.cph>0){b.cph-=dt;if(!b.cmk){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:JX.h.flareTex,color:0x39ff7a,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));s.scale.set(.5,.5,1);s.position.set(0,2.35,0);s.renderOrder=9;(b.m||S).add(s);b.cmk=s}b.cmk.visible=b.al;b.cmk.scale.setScalar(.42+.08*Math.sin(EQ.t*9))}
  else if(b.cmk){(b.m||S).remove(b.cmk);b.cmk.material.dispose();b.cmk=null}}
 /* rings and arcs */
 for(let i=EQ.RG.length-1;i>=0;i--){const r=EQ.RG[i];r.a+=dt;const u=r.a/r.L;r.m.scale.setScalar(r.r0+(r.r1-r.r0)*(1-Math.pow(1-u,2.2)));r.m.material.opacity=r.op*(1-u);if(u>=1){S.remove(r.m);r.m.material.dispose();EQ.RG.splice(i,1)}}
 for(let i=EQ.AR.length-1;i>=0;i--){const a=EQ.AR[i];a.l-=dt;a.m.material.opacity=Math.max(0,a.l*6);if(a.l<=0){S.remove(a.m);a.m.geometry.dispose();a.m.material.dispose();EQ.AR.splice(i,1)}}
 eqHud()}
/* the cipher spike hacks everything near it */
function eqCipher(o){const p=o.p.clone();eqS.cipher();eqRing(p,.5,20,.9,0x39ff7a,.8);eqRing(p,.3,14,.7,0xffffff,.5);let n=0;for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-p.x,b.z-p.z)<20){b.cph=12;n++;if(b.al)burst(V(b.x,(b.y||0)+1.2,b.z),6,0x39ff7a,3,.3,.06)}}msg(n?'CIPHER: '+n+' MARKED':'CIPHER: nobody in range',1.6);try{LX.fx.pulse=Math.max(LX.fx.pulse,.4)}catch(e){}}
/* marked enemies take 25% more damage */
{const _hb=hitBot;hitBot=function(b,d,head,scale){if(b&&b.cph>0)d*=1.25;return _hb.call(this,b,d,head,scale)}}
/* ---- HUD: lethal [E], second [X], tactical [Q] ---- */
function eqHud(){if(!EQ.hud){const h=document.getElementById('hud');if(!h)return;const e=document.createElement('div');e.id='eqhud';h.appendChild(e);EQ.hud=e}
 const row=(key,sl)=>{if(!sl||!sl.n)return'';const c=sl.c,lab=(typeof ctlKey=='function'?ctlKey(key):key);return `<div class="eq ${c<=0?'out':''}"><kbd>${lab}</kbd><b>${sl.n}</b><i>${'●'.repeat(Math.max(0,Math.min(c,4)))||'—'}</i></div>`};
 const x=eqSlot(1),html=run?row('lethal',eqSlot(0))+row('x',x)+row('tactical',eqSlot(2))+(EQ.CH.length?`<div class="eq det"><kbd>${typeof ctlKey=='function'?ctlKey('det'):'G'}</kbd><b>DETONATE</b><i>${EQ.CH.length}</i></div>`:''):'';
 if(html!==EQ.hk){EQ.hk=html;EQ.hud.innerHTML=html}}

/* ---- wiring: the old keys now go through the equipment system ---- */
for(const k of EQL)if(!GR[k])GR[k]={fuse:1,R:0,d:0,imp:0,t:EQN[k].t};delete GR.Smoke;
{const _s=startGame;startGame=function(){const r=_s.apply(this,arguments);try{eqInit()}catch(e){console.warn('equipment',e)}return r}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{eqTick(dt)}catch(e){console.warn('eqTick',e)}}}
{const _ob=objBuild;objBuild=function(id){const m=eqModel(id);return m||_ob(id)}}
addEventListener('keydown',e=>{if(!e.repeat&&run&&!paused&&!over&&(typeof RB=='function'?RB(e.code):e.code)=='KeyG')eqDetonate()});


/* ===================== prompts that follow your input: the key you actually bound, or the button of the controller you actually use =====================
   Every on-screen prompt (the Zombies buy prompt, hints, popups, the equipment HUD, kbd tags) asks ctlKey(action). With a controller (connected, or chosen in Settings) it is the pad glyph for the pad type
   (Xbox, PlayStation, Nintendo...), otherwise the keyboard key from the Controls section, including rebinds. */
function keyLabel(c){if(!c)return'?';const m={ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Ctrl',ControlRight:'Ctrl',AltLeft:'Alt',AltRight:'Alt',Space:'Space',Tab:'Tab',Enter:'Enter',Backquote:'`',Minus:'-',Equal:'=',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backslash:'\\',Unbound:'-',Mouse0:'LMB',Mouse1:'MMB',Mouse2:'RMB'};if(m[c])return m[c];return c.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'Num ').replace(/^Arrow/,'')}
function ctlKey(a){if(a=='gum')return(typeof PG!='undefined'&&PG.on)?'D-Pad ←':keyLabel((function(){try{return bindOf('gum')}catch(e){return'KeyJ'}})());const map={tactical:'tact',lethal:'lethal',x:'field',field:'field',det:'det',use:'use',melee:'melee',reload:'reload',crouch:'crouch',jump:'jump',mount:'mount',mode:'fmode',nv:'nv',map:'map',sb:'sb'};
 if(typeof PG!='undefined'&&PG.on){const d=PG.A[a=='x'?'field':a];if(d)return(d.h?'hold ':'')+PG.b(d.b)}
 const id=map[a]||a;try{return keyLabel(bindOf(id))}catch(e){const d={tact:'Q',lethal:'E',field:'X',det:'G',use:'F',melee:'V',reload:'R',crouch:'C',jump:'Space'};return d[id]||id}}


/* ===================== NO 8-BIT SOUNDS, EVER =====================
   Square waves are what makes a game sound like a 1985 arcade. They are gone from the whole game: any oscillator asked to be a square wave becomes a soft triangle, and beep() is rebuilt with a click-free attack,
   a gentle low-pass and a smaller pitch fall, so even the old blips read as clean modern UI sounds instead of chip music. */
{const d=Object.getOwnPropertyDescriptor(OscillatorNode.prototype,'type');if(d&&d.set&&!OscillatorNode.prototype.__ns){OscillatorNode.prototype.__ns=1;Object.defineProperty(OscillatorNode.prototype,'type',{get:d.get,set(v){d.set.call(this,v==='square'?'triangle':v)},configurable:true})}}
beep=function(f,d,ty,v){try{ac=ac||new AudioContext();const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type=ty==='square'||!ty?'triangle':ty;lp.type='lowpass';lp.frequency.value=Math.min(9000,Math.max(900,f*5));
 o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.62),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime((v||.05)*vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(lp);lp.connect(g);g.connect(PlayerAudio.output(ac));o.start(t);o.stop(t+d+.02)}catch(e){}};

/* ===================== PACK-A-PUNCH SHOTS SOUND LIKE SCI-FI =====================
   Every Pack-a-Punched weapon fires through a small sci-fi chain: an FM zap (a sine whose pitch is bent by a second sine), a glassy shimmer, a chest thump, an air whoosh and a feedback echo that gives it a metallic tail.
   Tier I is a bright plasma zap, tier II adds a deep sub and crystal ping, tier III (Void Seraph) adds a falling sub-drop and a rising pre-swell. Speed and weight follow the weapon (pistols snappy, shotguns and launchers heavy, snipers long). Nothing retro: sines, triangles and filtered noise only. */
var PAPS=new Map();
function papBus(echo){const existing=PAPS.get(echo);if(existing&&existing.c===ac)return existing;ac=ac||new AudioContext();const c=ac,inp=c.createGain(),dl=c.createDelay(.5),dl2=c.createDelay(.5),fb=c.createGain(),lp=c.createBiquadFilter(),wet=c.createGain(),g2=c.createGain();
 dl.delayTime.value=echo;dl2.delayTime.value=echo*1.67;fb.gain.value=.36;lp.type='lowpass';lp.frequency.value=3600;wet.gain.value=.42;g2.gain.value=.5;inp.connect(PlayerAudio.output(c));inp.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(wet);dl.connect(dl2);dl2.connect(g2);g2.connect(wet);wet.connect(PlayerAudio.output(c));const bus={c,inp};PAPS.set(echo,bus);return bus}
function papSnd(w,accent,level=1){if(vol<=0)return;try{
 if(w.k==='KEY')FOL.keyClatter(.13*level,1.54,4,.014);const tier=Math.min(3,w.pap||1),profile=papTheme(),index=tier-1,b=papBus(profile.echo),c=b.c,t=c.currentTime,v=vol*(accent?.55:1)*level,heavy=w.pel>1||['SG','RL','SN','LMG'].includes(w.k),dur=Math.max(.1,Math.min(.5,(w.r||.1)*1.7+(heavy?.12:0))),pv=1+(Math.random()-.5)*.06,
  f0=profile.tones[index]*(heavy?.64:1)*pv,ratio=profile.ratios[index],out=b.inp;
 const osc=(ty,fa,fb_,d,g0,dl,lpf)=>{const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(fa,t+dl);o.frequency.exponentialRampToValueAtTime(Math.max(20,fb_),t+dl+d);g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);let n=o;if(lpf){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lpf;o.connect(f);n=f}n.connect(g);g.connect(out);o.start(t+dl);o.stop(t+dl+d+.03);return o};
 const fm=(fc,fe,d,g0,ratio,depth,dl)=>{const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain();car.type='sine';mod.type='sine';car.frequency.setValueAtTime(fc,t+dl);car.frequency.exponentialRampToValueAtTime(Math.max(20,fe),t+dl+d);mod.frequency.setValueAtTime(fc*ratio,t+dl);mod.frequency.exponentialRampToValueAtTime(Math.max(20,fe*ratio),t+dl+d);mg.gain.setValueAtTime(depth,t+dl);mg.gain.exponentialRampToValueAtTime(1,t+dl+d);mod.connect(mg);mg.connect(car.frequency);
  g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);car.connect(g);g.connect(out);car.start(t+dl);mod.start(t+dl);car.stop(t+dl+d+.03);mod.stop(t+dl+d+.03)};
 const nz=(d,fa,fb_,g0,type,q,dl)=>{const n=Math.floor(c.sampleRate*d),bf=c.createBuffer(1,n,c.sampleRate),a=bf.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=bf;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(fa,t+dl);f.frequency.exponentialRampToValueAtTime(Math.max(30,fb_),t+dl+d);g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+Math.min(.02,d*.3));g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);s.connect(f);f.connect(g);g.connect(out);s.start(t+dl)};
 fm(f0*(2.4+tier*.15),f0*(tier===2?.84:.51),dur*.86,.087,ratio,f0*(1.6+tier*.73),tier===3?.034:0);
 osc(profile.voice,f0*(2.1+ratio),f0*(1.54+ratio),dur*1.3,.027,tier===3?.045:.008,6400);
 osc('sine',f0*(3.5+tier),f0*(2.6+ratio),dur*.96,.022,.012,7000);
 osc('sine',heavy?150:200,heavy?40:52,heavy?.3:.15,.11+tier*.03,tier==3?.05:0);
 nz(dur,profile.noise[0],profile.noise[1],.082,'bandpass',.7+ratio*.31,tier===3?.028:0);
 if(tier>=2){osc('sine',f0*7.2,f0*6.6,dur*1.6,.016,.01);osc('sine',heavy?96:130,heavy?32:42,.4,.12,.01)}
 if(tier>=3){nz(.05,400,5200,.06,'highpass',.7,0);osc('sine',70,26,.5,.2,.05);osc('sine',f0*1.01,f0*.5,dur*1.6,.03,.06)}
 }catch(e){}}

/* ===================== GAME FEEL: guns that hit back, kills that pay off, zombies that live =====================
   Guns: every shot adds a low chest thump, a short room tail, a puff of muzzle smoke, a flicker of camera roll and a nudge of the viewmodel; every hit and kill has its own confirmation sound and a
   hit-stop (a couple of frames of slow motion) on headshot kills, plus a combo counter with a rising chime for chained kills.
   Movement: coyote time, jump buffering, variable jump height and landings that thud as hard as you fall (patched into phys() and the landing code).
   Zombies: each one has its own voice (formant-synthesised groans, snarls, screams, grunts and death rattles, positioned in the stereo field and muffled by distance), heavy footfalls, an emergence from the ground when it spawns,
   flickering eyes, sudden head twitches, and the world around them breathes (distant moans, wind, creaks, a heartbeat when you are hurt). Everything is sines, filtered sawtooth through formants, and noise: nothing retro. ===================== */
var FL={k0:0,h0:0,combo:0,ct:0,el:null,amb:5,hb:0,vn:0,rt:0,bus:null,lastShot:0,smk:0};
function flBus(){if(FL.bus&&FL.bus.c===ac)return FL.bus;ac=ac||new AudioContext();const c=ac,cp=c.createDynamicsCompressor();cp.threshold.value=-20;cp.ratio.value=4;cp.attack.value=.004;cp.release.value=.2;cp.connect(PlayerAudio.output(c));return FL.bus={c,out:cp}}
function flTone(f0,f1,d,g,dl,ty,lp){try{const{c,out}=flBus(),t=c.currentTime+(dl||0),o=c.createOscillator(),gg=c.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.01,d*.2));gg.gain.exponentialRampToValueAtTime(.0001,t+d);let n=o;if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(gg);gg.connect(out);o.start(t);o.stop(t+d+.03)}catch(e){}}
function flNoise(d,f0,f1,g,type,q,dl){try{const{c,out}=flBus(),t=c.currentTime+(dl||0),n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),gg=c.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.015,d*.25));gg.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(gg);gg.connect(out);s.start(t)}catch(e){}}
/* ---- movement ---- */
function feelJump(){flNoise(.14,420,950,.035,'bandpass',1.2);try{fk=Math.max(fk,.25)}catch(e){}}
function feelLand(fv){if(fv<2.2)return;flTone(95,42,.14,Math.min(.24,.05+fv*.013),0,'sine');flNoise(.1,700,200,Math.min(.14,.03+fv*.008),'lowpass',.7);if(fv>3.5)burst(V(P.x,P.y+.10,P.z),Math.min(16,4+Math.floor(fv)),0xb8a890,2+fv*.25,.5,.1);if(fv>7){shake=Math.max(shake,Math.min(.7,fv*.04));cRoll+=(Math.random()-.5)*.05;try{LX.fx.pulse=Math.max(LX.fx.pulse,.3)}catch(e){}}}
/* ---- one shot ---- */
function feelShot(){if(P.sp>t0)P.sp=0;const w=cw();if(!w||w.k=='TEA')return;const rc=Math.max(.4,w.rc||1),heavy=w.pel>1||['SG','SN','RL'].includes(w.k);
 flTone(heavy?120:150,heavy?36:46,heavy?.2:.1,(heavy?.13:.075)+Math.min(.05,rc*.008),0,'sine');
 flNoise(heavy?.28:.14,heavy?900:1800,heavy?120:300,heavy?.05:.03,'lowpass',.6,.012);
 try{LX.fx.shot=Math.max(LX.fx.shot||0,.6)}catch(e){}
 FL.smk-=1;if(FL.smk<=0){FL.smk=3;try{const H=JX.h,p=C.position.clone().add(aimDir().multiplyScalar(.9)).add(V(.07,-.07,0));H.addSp({p,s0:.08,s1:.34,life:.7,c:[.8,.8,.8],op:.2,tex:H.puffTex,add:false,v:V((Math.random()-.5)*.3,.5,(Math.random()-.5)*.3),dr:.88})}catch(e){}}}
{const _sh=shoot;shoot=function(){const w=cw(),before=w?.mag,r=_sh.apply(this,arguments);if(w&&w.mag<before)feelShot();return r}}
/* ---- hit and kill confirmation, combo ---- */
function flCombo(n){if(!FL.el){const e=document.createElement('div');e.id='combo';const h=document.getElementById('hud');if(!h)return;h.appendChild(e);FL.el=e}if(n<3){FL.el.className='';return}FL.el.textContent='×'+n;FL.el.className='on';FL.el.style.animation='none';void FL.el.offsetWidth;FL.el.style.animation=''}
function flKill(head){const now=t0;FL.combo=(now-FL.ct<2.6)?FL.combo+1:1;FL.ct=now;const n=Math.min(FL.combo,12),sc=[0,2,4,7,9,12,14,16,19,21,24,26,28][n]||28,f=520*Math.pow(2,sc/12);
 flTone(f,f*.98,.34,.07,0,'sine');flTone(f*1.5,f*1.49,.28,.035,.03,'triangle',6000);flTone(f*2,f*2,.4,.02,.06,'sine');flTone(110,50,.16,.1,0,'sine');
 if(mode!=='Zombies')hitStop(head?.075:.03,head?.12:.25);
 if(head){flNoise(.06,5200,2400,.09,'highpass',.7);flTone(2600,1900,.2,.05,0,'sine');try{LX.fx.pulse=Math.max(LX.fx.pulse,.55)}catch(e){}}
 flCombo(FL.combo);setTimeout(()=>{if(t0-FL.ct>2.4)flCombo(0)},2600)}
function flHit(head){flTone(head?1500:260,head?1100:130,head?.1:.07,head?.05:.06,0,'sine');if(head)flTone(2800,2200,.14,.03,.02,'sine')}
/* master levels for the undead: the sounds are unchanged, only quieter (voices, footfalls, ambience) */
var ZVQ=.36,ZFQ=.5,ZAQ=.6;
/* ---- zombie voices: filtered sawtooth through three formants, per-zombie pitch, panned and muffled by distance ---- */
function zvSay(kind,b,dist){if(FL.vn>=5||!vol)return;try{const{c,out}=flBus(),t=c.currentTime,vp=b.vp||(b.vp=b.big?.55:.78+Math.random()*.55),F0=105*vp;
 const SP={groan:{d:1.1+Math.random()*.8,g:.55,a:1.1,e:.76,v:[[430,800,2400],[700,1100,2500],[350,700,2300]],r:.3,n:.25},
  snarl:{d:.5,g:.6,a:1,e:1.35,v:[[700,1250,2600],[550,1700,2500]],r:.9,n:.5,am:38},
  scream:{d:.9,g:.55,a:2.1,e:1.45,v:[[750,1300,2700],[950,1650,2900]],r:.7,n:.6,am:55},
  grunt:{d:.2,g:.5,a:1.1,e:.8,v:[[450,900,2400]],r:.5,n:.3},
  rattle:{d:1,g:.6,a:1,e:.42,v:[[400,800,2300],[330,700,2300]],r:.8,n:.65,am:14},
  howl:{d:1.6,g:.7,a:.9,e:.55,v:[[350,700,2300],[500,900,2400],[380,760,2300]],r:.35,n:.3}}[kind]||null;if(!SP)return;
 FL.vn++;setTimeout(()=>FL.vn--,SP.d*1000+120);
 const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(F0*SP.a,t);o.frequency.exponentialRampToValueAtTime(F0*SP.e,t+SP.d);
 const vb=c.createOscillator(),vg=c.createGain();vb.frequency.value=4.5+Math.random()*2.5;vg.gain.value=F0*.035;vb.connect(vg);vg.connect(o.frequency);
 const am=c.createGain();am.gain.value=1;if(SP.am){const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=SP.am;lg.gain.value=SP.r*.45;lf.connect(lg);lg.connect(am.gain);am.gain.value=1-SP.r*.45;lf.start(t);lf.stop(t+SP.d+.1)}
 o.connect(am);const mix=c.createGain();mix.gain.value=1;
 [8,10,12].forEach((q,i)=>{const bp=c.createBiquadFilter(),g=c.createGain();bp.type='bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(SP.v[0][i],t);for(let k=1;k<SP.v.length;k++)bp.frequency.linearRampToValueAtTime(SP.v[k][i],t+SP.d*k/(SP.v.length-1));g.gain.value=[1,.55,.28][i]*1.6;am.connect(bp);bp.connect(g);g.connect(mix)});
 const nb=c.createBuffer(1,Math.floor(c.sampleRate*SP.d),c.sampleRate),na=nb.getChannelData(0);for(let i=0;i<na.length;i++)na[i]=Math.random()*2-1;const ns=c.createBufferSource(),nf=c.createBiquadFilter(),ng=c.createGain();ns.buffer=nb;nf.type='bandpass';nf.frequency.value=SP.v[0][1];nf.Q.value=1.2;ng.gain.value=SP.n*.6;ns.connect(nf);nf.connect(ng);ng.connect(mix);
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(650,5200-dist*150);const env=c.createGain(),gv=SP.g*vol*.5*ZVQ/(1+dist*.11);env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(gv,t+Math.min(.12,SP.d*.25));env.gain.setValueAtTime(gv,t+SP.d*.55);env.gain.exponentialRampToValueAtTime(.0001,t+SP.d);
 let pn=null;if(c.createStereoPanner){pn=c.createStereoPanner();const rx=(b.x-P.x)*Math.cos(yaw)+(b.z-P.z)*-Math.sin(yaw);pn.pan.value=Math.max(-.9,Math.min(.9,rx/Math.max(2,dist)))}
 mix.connect(lp);lp.connect(env);if(pn){env.connect(pn);pn.connect(out)}else env.connect(out);o.start(t);vb.start(t);ns.start(t);o.stop(t+SP.d+.05);vb.stop(t+SP.d+.05)}catch(e){}}
/* ---- the per-frame tick ---- */
function flTick(dt){if(!run||paused)return;
 /* kills and hits you landed */
 if(typeof kills!='undefined'&&kills>FL.k0){const hd=(document.getElementById('hm')||{}).className||'';FL.k0=kills;try{flKill(/hd/.test(hd))}catch(e){}}else if(typeof kills!='undefined'&&kills<FL.k0)FL.k0=kills;
 if(typeof hits!='undefined'){if(hits>FL.h0){const hd=((document.getElementById('hm')||{}).className||'');if(hits-FL.h0<4)flHit(/hd/.test(hd));FL.h0=hits}else if(hits<FL.h0)FL.h0=hits}
 if(mode!='Zombies')return;
 let steps=0;
 for(const b of bots){if(!b.zom||!b.rig)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);
  if(b.born==null){b.born=t0;b.vt=1+Math.random()*3;if(d<40){burst(V(b.x,.12,b.z),9,0x6b5a44,3,.6,.12);if(Math.random()<.7)zvSay(b.big?'howl':Math.random()<.35?'scream':'groan',b,d)}}
  if(!b.al){if(b.m&&b.m.scale.y!==1)b.m.scale.y=1;continue}
  const u=Math.min(1,(t0-b.born)/.8);if(u<1&&b.m)b.m.scale.y=.55+.45*(1-Math.pow(1-u,3));else if(b.m&&b.m.scale.y!==1)b.m.scale.y=1;
  if(d>34)continue;
  /* voice */
  b.vt-=dt;if(b.vt<=0){b.vt=Math.max(2.5,(8-Math.min(5,(zq?zq.r:1)*.25))*(.6+Math.random()*.8)*(d<10?.6:1));const k=d<7&&Math.random()<.55?'snarl':b.big?'howl':'groan';zvSay(k,b,d)}
  if(d<17&&!b.seen){b.seen=1;if(Math.random()<.65)zvSay(b.sprint||b.fast?'scream':'snarl',b,d)}else if(d>26)b.seen=0;
  /* heavy footfalls */
  if(d<15&&steps<3){const st=Math.floor((b.ph||0)/Math.PI);if(b.fst!=null&&st!==b.fst){steps++;const g=Math.min(.16,.28/(1+d*.4))*(b.big?1.6:1)*ZFQ;flTone(b.big?70:95,b.big?36:50,.1,g,0,'sine');flNoise(.09,900,260,g*.55,'lowpass',.7)}b.fst=st}
  /* flickering eyes, sudden twitches of the head */
  const r=b.rig;if(r.eyeM&&!(r.glowing&&r.glowing())){if(!r.eyeB)r.eyeB=r.eyeM.color.getHex();r.eyeM.color.setHex(r.eyeB).multiplyScalar(.7+.45*Math.abs(Math.sin(t0*7.3+(b.i||0)*3.1)))}
  b.tw=(b.tw||0)*Math.exp(-dt*7);b.tt=(b.tt==null?1+Math.random()*3:b.tt)-dt;if(b.tt<=0){b.tt=1.6+Math.random()*3.5;b.tw=(Math.random()<.5?-1:1)*(.35+Math.random()*.35)}
  if(r.head)r.head.rotation.y+=b.tw,r.head.rotation.z+=b.tw*.4}
 /* the world breathes */
 FL.amb-=dt;if(FL.amb<=0){FL.amb=5+Math.random()*9;const k=Math.random();if(k<.4){const fake={x:P.x+(Math.random()-.5)*60,z:P.z+(Math.random()-.5)*60,vp:.7+Math.random()*.5};zvSay(Math.random()<.2?'howl':'groan',fake,35)}else if(k<.75){flNoise(1.6,300,900,.05*ZAQ,'bandpass',.6);flNoise(1.4,500,200,.03*ZAQ,'lowpass',.5,.4)}else{flTone(210+Math.random()*60,190,.7,.012*ZAQ,0,'triangle',1200);flNoise(.5,2200,900,.02*ZAQ,'bandpass',3,.05)}}
 /* a heartbeat that gets faster the closer you are to dying */
 if(!P.dead&&P.hp<P.mhp*.4){FL.hb-=dt;if(FL.hb<=0){const k=P.hp/(P.mhp*.4);FL.hb=.5+k*.5;flTone(64,46,.15,.2*(1-k*.4),0,'sine');flTone(58,42,.17,.15*(1-k*.4),.16,'sine')}}else FL.hb=0}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{flTick(dt)}catch(e){console.warn('feel',e)}}}
/* zombies grunt when hit and rattle when they die, with a bigger burst of gore */
{const _jh=juiceHit;juiceHit=function(b,d,head){const r=_jh.apply(this,arguments);try{if(b&&b.zom&&mode=='Zombies'&&Math.random()<.4){zvSay('grunt',b,Math.hypot(b.x-P.x,b.z-P.z))}}catch(e){}return r}}
{const _rs=ragStart;ragStart=function(b){const r=_rs.apply(this,arguments);try{if(b&&b.zom&&!b.hound&&!b.rat){b.rat=1;zvSay('rattle',b,Math.hypot(b.x-P.x,b.z-P.z));burst(V(b.x,1,b.z),22,0x7a0a0a,6,.8,.14);burst(V(b.x,.4,b.z),10,0x4a0606,3,1.1,.18)}}catch(e){}return r}}

/* ===================== BOTS THAT PLAY LIKE PEOPLE =====================
   Names: every bot gets a believable gamer tag (animal and word mashups, first names with years, dotted and underscored handles, the odd clan tag, a little leetspeak), unique within a match.
   Once in a long while one of them is Mr Hups Hups (about 1 bot in 65, at most one per match).
   Personality: each bot has its own skill, aggression and reaction time. They no longer see you through walls instantly: they need a moment of clear sight before they fire.
   Movement like a player: they sprint across open ground (and cannot fire while sprinting), slide into a gunfight, crouch to peek, jump when pressured, throw frags, smoke and firebombs and knife you at point blank
   with real arm animations (the same stance poses online players use: crouch, slide, jump).
   Spawns: points are scored against every living enemy (distance and line of sight), spots where players keep dying right after spawning go "hot" for a while and are avoided, and a fresh spawn is protected for a moment. ===================== */
var BHN={a:['Shadow','Ghost','Nova','Viper','Pixel','Blaze','Frost','Rogue','Echo','Titan','Wraith','Dusk','Static','Mochi','Toast','Cobalt','Juno','Kairo','Zephyr','Onyx','Rift','Saber','Comet','Ember','Hazel','Orbit','Pulse','Quill','Raven','Sable','Talon','Umbra','Vex','Wisp','Zinc','Bandit','Cricket','Dingo','Falcon','Gizmo','Husky','Jackal','Koala','Lynx','Moose','Otter','Panda','Rhino','Sloth','Tiger','Walrus','Zebra','Orca','Mango','Pickle','Waffle','Biscuit','Turbo','Hyper','Lunar','Solar'],
 f:['Jess','Mike','Dani','Marcus','Tom','Lena','Sam','Alex','Kai','Noah','Liam','Mia','Zoe','Ben','Cal','Dev','Eli','Finn','Gus','Hal','Ian','Kit','Leo','Max','Ned','Oli','Pip','Rex','Sid','Tess','Vic','Will','Yuri','Zed','Ryan','Chloe','Jake','Nate','Owen','Ruby'],
 w:['sniper','rush','clutch','quick','salty','sweaty','lowkey','daily','official','real','just','its','the','not','big','lil','tiny','sir','dr','chef','iron','dark','neo','alpha'],tg:['RX','NVA','GG','XD','TTV','SQD','WLF','ACE','LOL','FPS']};
var BHS={used:new Set(),hups:0,hot:[],G:[],lines:{kill:['gg','nice','lol','ez','nt','too easy','sit down','clean'],die:['how?','lag','wtf','nice shot','ok ok','cheeky','hacks?','unlucky','bruh','lol ok'],gren:['grenade!','frag out','nade','incoming'],spawn:['rush','push','go go go','cover me']}};
function botNameReset(){BHS.used.clear();BHS.hups=0}
function botName(def,b){const pk=a=>a[Math.random()*a.length|0],n2=()=>String(10+(Math.random()*90|0)),n3=()=>String(100+(Math.random()*900|0)),yr=()=>pk(['0','1','2'])+(Math.random()*10|0),
 leet=s=>Math.random()<.28?s.replace(/a/gi,'4').replace(/e/gi,'3').replace(/o/gi,'0').replace(/i/gi,'1'):s,cap=s=>s[0].toUpperCase()+s.slice(1);
 if(!BHS.hups&&Math.random()<.0155){BHS.hups=1;BHS.used.add('Mr Hups Hups');return 'Mr Hups Hups'}
 for(let i=0;i<30;i++){const a=pk(BHN.a),a2=pk(BHN.a),f=pk(BHN.f),w=pk(BHN.w),p=Math.random();let s;
  if(p<.17)s=a+(Math.random()<.5?n2():n3());else if(p<.29)s=f+'_'+a;else if(p<.35)s='x'+a+'x';else if(p<.45)s=w+cap(a);else if(p<.55)s=f+yr();else if(p<.63)s=a.toLowerCase()+'.'+a2.toLowerCase();
  else if(p<.73)s=a+a2;else if(p<.80)s=a.toLowerCase()+'_'+f.toLowerCase();else if(p<.86)s=leet(a)+n2();else if(p<.92)s=f+cap(a)+(Math.random()<.4?n2():'');else s=pk(['i','im','its'])+cap(f)+(Math.random()<.5?yr():'');
  if(Math.random()<.5)s=s.replace(/_/g,Math.random()<.5?'_':'');if(Math.random()<.08)s=s.toLowerCase();if(Math.random()<.12)s='['+pk(BHN.tg)+'] '+s;s=s.slice(0,17);if(!BHS.used.has(s)){BHS.used.add(s);return s}}
 return def}
/* ---- a little table talk ---- */
function bhSay(b,k,p){if(Math.random()>(p==null?.14:p)||b.net)return;const L=BHS.lines[k];feed(`${b.nm}: ${L[Math.random()*L.length|0]}`)}
/* ---- per-bot state ---- */
function bhInit(b){return b.bh||(b.bh={skill:.75+Math.random()*.5,aggr:Math.random(),react:.28+Math.random()*.5,gcd:5+Math.random()*12,fcd:12+Math.random()*10,mcd:0,sl:0,slcd:0,cr:0,crcd:2+Math.random()*4,jm:0,jcd:2+Math.random()*5,thr:null,mel:0,seeT:0,seeL:false,lt:0,spr:0,wasSpr:0,smk:0})}
/* ---- bot grenades: a small ballistic projectile with its own explosion that hurts the player and the bots on the other team ---- */
function bhThrow(b,item,t){const from=V(b.x,1.5,b.z),to=V(t.x+(Math.random()-.5)*2,(t.y||0)+.2,t.z+(Math.random()-.5)*2),d=to.clone().sub(from),dist=Math.hypot(d.x,d.z),sp=Math.min(20,Math.max(9,dist*.9)),tt=dist/sp,v=V(d.x/tt,d.y/tt+.5*20*tt,d.z/tt);
 let m;if(item=='Frag'){m=new THREE.Group();const mt=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0x4a7a3a}));mt.scale.setScalar(.06);m.add(mt)}else m=eqModel(item=='Firebomb'?'Firebomb':'Smoke Canister')||new THREE.Group();
 m.position.copy(from);S.add(m);BHS.G.push({m,p:from,v,t:0,b,item,fuse:item=='Frag'?2.1:item=='Smoke'?1.2:9});flTone&&flNoise(.2,500,1400,.05,'bandpass',1.2);if(item=='Frag'&&b.team!=null)bhSay(b,'gren',.5)}
function bhBoom(g){const p=g.p.clone(),b=g.b;
 if(g.item=='Frag'){try{JX.explode&&JX.explode(p,{R:6,d:0,imp:0,c:0xffa040})}catch(e){burst(p,26,0xffa040,8,.6,.14)}burst(p,16,0x333333,5,.9,.2);shake=Math.max(shake,Math.max(0,.7-Math.hypot(P.x-p.x,P.z-p.z)/25));
  const dP=Math.hypot(P.x-p.x,(P.y||0)+1-p.y,P.z-p.z);if(!P.dead&&dP<6&&!(typeof ally=='function'&&b.team===pTeam()&&teamMode()))hurt(Math.round(110*Math.pow(1-dP/6,1.2)),b);
  for(const o of bots){if(!o.al||o===b||o.zom||o.net||(teamMode()&&o.team===b.team))continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<6)botHit(o,Math.round(110*Math.pow(1-d/6,1.2)),b)}}
 else if(g.item=='Firebomb'){eqFire&&eqFire(p,3.2,5,28,0);eqS.glass()}
 else{grs.push({m:new THREE.Group(),p:p.clone(),v:V(0,0,0),t:0,g:{R:0,d:0,smoke:1,fuse:0},bt:0,stuck:1})}}
function bhGrenTick(dt){for(let i=BHS.G.length-1;i>=0;i--){const g=BHS.G[i];g.t+=dt;g.v.y-=20*dt;const np=g.p.clone().add(g.v.clone().multiplyScalar(dt));if(np.y<.13){np.y=.13;g.v.y*=-.32;g.v.x*=.6;g.v.z*=.6}
  for(const b of bx)if(np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y<b.h&&np.y>(b.y0||0)){g.v.x*=-.4;g.v.z*=-.4;np.copy(g.p)}
  g.p.copy(np);g.m.position.copy(np);g.m.rotation.x+=dt*8;g.m.rotation.z+=dt*5;
  if(g.t>=g.fuse||(g.item=='Firebomb'&&np.y<=.14&&g.t>.25)){S.remove(g.m);BHS.G.splice(i,1);bhBoom(g)}}}
/* ---- every frame, before the old bot code runs ---- */
function bhPre(dt){if(!run||paused||mode=='Zombies'||(netOn&&!isHost))return;bhGrenTick(dt);
 for(const b of bots){if(b.zom||b.net)continue;
  if(!b.al){if(b.bhAl){b.bhAl=0;if(b.spT!=null&&t0-b.spT<7)bhHot(b.spX,b.spZ)}b.sm=1;b.hm=1;continue}b.bhAl=1;const h=bhInit(b);
  const t=b.tg,td=t?Math.hypot(t.x-b.x,t.z-b.z):1e9;h.lt-=dt;if(h.lt<=0){h.lt=.16+Math.random()*.1;h.seeL=!!t&&td<55&&navLos(b.x,b.z,t.x,t.z)}
  if(h.seeL)h.seeT+=dt;else h.seeT=Math.max(0,h.seeT-dt*2);
  let sm=1,hm=h.skill,st=0;
  h.slcd-=dt;h.crcd-=dt;h.jcd-=dt;h.gcd-=dt;h.fcd-=dt;h.mcd-=dt;
  /* slide, crouch, jump */
  if(h.sl>0){h.sl-=dt;sm=.55+1.7*(h.sl/.7);st=3;hm*=.55;if(h.sl<=0)h.cr=.5}
  else if(h.cr>0){h.cr-=dt;sm=.6;st=1;hm*=1.12}
  else{
   const hunt=!h.seeL||td>24;
   if(!t||hunt)h.spr=1;else if(td<=22)h.spr=0;
   if(h.spr){sm=1.5;h.wasSpr=1;hm*=.2;b.cd=Math.max(b.cd,.14)}
   else{
    if(h.wasSpr){h.wasSpr=0;if(h.seeL&&td<20&&td>6&&h.slcd<=0&&Math.random()<.3+h.aggr*.4){h.sl=.7;h.slcd=5+Math.random()*4;sm=2.2;st=3}else b.cd=Math.max(b.cd,.18+Math.random()*.2)}
    if(h.seeL&&td>10&&td<32&&h.crcd<=0&&Math.random()<dt*.9){h.cr=.7+Math.random()*.9;h.crcd=4+Math.random()*6}
    if(h.seeL&&td<20&&h.jcd<=0&&Math.random()<dt*(.2+h.aggr*.5)*(b.hp+b.sh<60?2:1)){h.jm=.62;h.jcd=3+Math.random()*5}}}
  if(h.jm>0){h.jm-=dt;hm*=.55;b.aj=1;b.m&&(b.bhY=Math.sin(Math.PI*(1-h.jm/.62))*.95)}else{b.aj=0;b.bhY=0}
  /* reaction time: no shots until it has had a clear look */
  if(h.seeT<h.react)b.cd=Math.max(b.cd,.07);
  /* throwing */
  if(h.thr){h.thr.t+=dt;b.cd=Math.max(b.cd,.1);sm=Math.min(sm,.3);if(h.thr.t>=.42&&!h.thr.done){h.thr.done=1;if(t&&t.al!==0)bhThrow(b,h.thr.item,t)}if(h.thr.t>=.8)h.thr=null}
  else if(t&&h.seeL){
   if(h.gcd<=0&&td>8&&td<30&&Math.random()<dt*.6){h.thr={t:0,item:Math.random()<.65?'Frag':'Firebomb'};h.gcd=16+Math.random()*18}
   else if(h.fcd<=0&&b.hp+b.sh<45&&td<22&&Math.random()<dt*.8){h.thr={t:0,item:'Smoke'};h.fcd=25+Math.random()*20}}
  /* melee at point blank */
  if(h.mel>0){h.mel-=dt;b.cd=Math.max(b.cd,.2);sm=Math.min(sm,.4);if(h.mel<=.26&&!h.melHit){h.melHit=1;if(t&&Math.hypot(t.x-b.x,t.z-b.z)<2.9){flNoise&&flNoise(.12,2600,900,.07,'bandpass',1.5);flTone(160,70,.1,.1,.05,'sine');if(t===P)hurt(72,b);else botHit(t,72,b);burst(V(t.x,1.3,t.z),8,0xb5452e,3,.4,.08)}}if(h.mel<=0)h.melHit=0}
  else if(t&&td<2.4&&h.seeL&&h.mcd<=0&&Math.random()<dt*(1.2+h.aggr*1.5)){h.mel=.5;h.mcd=1.3+Math.random();h.melHit=0;flNoise&&flNoise(.18,700,2200,.05,'bandpass',1.2)}
  if(h.spr&&!h.thr&&!h.mel)st=0;
  b.sm=sm;b.hm=hm;b.st=st;b.sa=1}}
/* ---- every frame, after the old bot code: the jump arc ---- */
function bhPost(){for(const b of bots){if(b.zom||b.net||!b.al||!b.bh||!b.m)continue;if(b.bhY)b.m.position.y=b.bhY}}
{const _u=updBots;updBots=function(dt){try{bhPre(dt)}catch(e){console.warn('bots',e)}_u.apply(this,arguments);try{bhPost()}catch(e){}}}
/* ---- arms: knife swing and grenade throw override the gun hold ---- */
function bhKnife(){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),bl=new THREE.MeshLambertMaterial({color:0xbfc6cc});if(bl.metalness!==undefined){bl.metalness=.9;bl.roughness=.25}
 const a=(w,h,d,x,y,z,m)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);g.add(e)};a(.03,.025,.1,0,0,0,M(0x1b1d21));a(.01,.03,.2,0,.0,.14,bl);a(.006,.02,.08,0,-.006,.24,bl);a(.036,.012,.012,0,0,.1,M(0x6a6e72));return g}
function bhArms(b){const h=b.bh,r=b.rig,g=b.hg;if(!h||!r||!g)return;const doing=h.mel>0||h.thr;g.visible=!doing;
 if(!doing){if(h.knife)h.knife.visible=false;if(h.gren)h.gren.visible=false;return}
 const sR=shPos(r,1),sL=shPos(r,-1);
 if(h.mel>0){if(!h.knife){h.knife=bhKnife();r.armR.fo.add(h.knife);h.knife.position.set(0,-.4,.02);h.knife.rotation.set(Math.PI/2,0,0)}h.knife.visible=true;const u=1-h.mel/.5;let hx,hy,hz;
  if(u<.4){const k=u/.4;hx=.2+.14*k;hy=.1+.28*k;hz=-.05+.0*k}else if(u<.7){const k=(u-.4)/.3;hx=.34-.62*k;hy=.38-.45*k;hz=-.05+.7*k}else{const k=(u-.7)/.3;hx=-.28+.4*k;hy=-.07-.05*k;hz=.65-.45*k}
  ik(sR,V(sR.x+hx,sR.y+hy,sR.z+hz),V(.6,-1,-.3),r.armR);ik(sL,V(sL.x-.1,sL.y-.38,sL.z+.3),V(-.6,-1,-.3),r.armL);r.sh.rotation.y+=(u>.4&&u<.75?-.35:.18)*Math.sin(Math.min(1,u)*Math.PI)}
 else{if(!h.gren){h.gren=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0x4a7a3a}));h.gren.scale.setScalar(.06);r.armR.fo.add(h.gren);h.gren.position.set(0,-.43,.04)}h.gren.visible=h.thr.t<.42;const u=Math.min(1,h.thr.t/.8);let hx,hy,hz;
  if(u<.5){const k=u/.5;hx=.1+.1*k;hy=.15+.4*k;hz=-.1-.2*k}else{const k=Math.min(1,(u-.5)/.25);hx=.2-.1*k;hy=.55-.45*k;hz=-.3+.9*k}
  ik(sR,V(sR.x+hx,sR.y+hy,sR.z+hz),V(.6,-1,-.3),r.armR);ik(sL,V(sL.x-.1,sL.y-.4,sL.z+.25),V(-.6,-1,-.3),r.armL);r.sh.rotation.x+=-.2*Math.sin(u*Math.PI)}}
{const _ab=animBot;animBot=function(b,dt){_ab.apply(this,arguments);if(b.bh&&!b.zom&&!b.net)try{bhArms(b)}catch(e){}}}
/* ---- spawns: scored against every living enemy, hot spots avoided, fresh spawns protected ---- */
function bhHot(x,z){if(x==null)return;BHS.hot.push({x,z,r:24,u:t0+28,d:28});if(BHS.hot.length>12)BHS.hot.shift()}
function spawnPt(minDistance,team,actor){
 const map=MAPS[sel.map],teams=teamMode()&&(team==='A'||team==='B');
 const authored=map.modSpawns?.[teams?team:'all']||map.modSpawns?.all;
 const present=bots.filter(bot=>bot!==actor&&bot.al&&!bot.zom&&!bot.out);
 if(P!==actor&&!P.dead&&Number.isFinite(P.x))present.push(P);
 const friends=[],enemies=[];
 for(const fighter of present)(teams&&tmOf(fighter)===team?friends:enemies).push(fighter);
 const origin=V(),direction=V();
 let best=null,bestScore=-Infinity;
 const score=(x,z,useNav)=>{
  if(map.inside&&!map.inside(x,z)||map.groundHeight?.(x,z)<-.3||
     useNav&&!navOK(x,z))return false;
  const floor=gnd({x,y:0,z});
  if(bx.some(box=>!box.collisionRemoved&&box.h>floor+.24&&(box.y0||0)<floor+1.75&&
      x>box.x0-.7&&x<box.x1+.7&&z>box.z0-.7&&z<box.z1+.7))return false;
  let nearest=70,pressure=0,friendDistance=Infinity,space=Infinity;
  for(const enemy of enemies){
   const distance=Math.hypot(enemy.x-x,enemy.z-z);
   nearest=Math.min(nearest,distance);space=Math.min(space,distance);
   if(distance>55)continue;
   origin.set(enemy.x,(enemy.y||0)+1.45,enemy.z);
   direction.set(x,floor+1.3,z).sub(origin);
   const length=direction.length();
   if(length<.1||castW(origin,direction.multiplyScalar(1/length),length)>=length-.15){
    pressure+=(1-distance/65)*52;
   }
  }
  for(const friend of friends){
   const distance=Math.hypot(friend.x-x,friend.z-z);
   friendDistance=Math.min(friendDistance,distance);space=Math.min(space,distance);
  }
  let value=nearest-pressure-Math.max(0,minDistance-nearest)*4;
  if(space<3)value-=(3-space)*110;
  if(Number.isFinite(friendDistance))value-=Math.abs(friendDistance-17)*.34;
  if(teams&&(team==='A'?x<-H/3:x>H/3))value+=13;
  if(minDistance>0)for(const hot of BHS.hot){
   if(t0<hot.u&&Math.hypot(hot.x-x,hot.z-z)<hot.r)value-=70*(hot.u-t0)/hot.d;
  }
  value+=Math.random()*4;
  if(value>bestScore){bestScore=value;best=[x,z]}
  return true;
 };
 if(authored?.length){
  for(const [x,z] of authored)score(x,z,false);
  return best||authored[0];
 }
 for(let i=0,count=0;i<200&&count<64;i++){
  const home=teams&&i%3!==0,span=H-3;
  const x=home?(team==='A'?-1:1)*(H/3+Math.random()*(span-H/3)):Math.random()*2*span-span;
  const z=Math.random()*2*span-span;
  if(score(x,z,true))count++;
 }
 if(best)return best;
 // A crowded or narrow map can reject every random sample. Search the interior.
 for(let x=-H+2;x<H-1;x+=2)for(let z=-H+2;z<H-1;z+=2)score(x,z,false);
 return best||map.ps||[0,0];
}
{const _sp=spawn;spawn=function(b){_sp.apply(this,arguments);b.spUntil=t0+1.8;b.spT=t0;b.spX=b.x;b.spZ=b.z;b.sm=1;b.hm=1;b.sa=1;b.st=0}}
{const _bh=botHit;botHit=function(t,d,by){if(t&&t.spUntil>t0)return;return _bh.apply(this,arguments)}}
{const _rs=respawn;respawn=function(){const r=_rs.apply(this,arguments);P.sp=t0+2.6;P.spT=t0;P.spX=P.x;P.spZ=P.z;return r}}
{const _d=die;die=function(){if(P.spT!=null&&t0-P.spT<7)bhHot(P.spX,P.spZ);return _d.apply(this,arguments)}}
{const _fk=featKill;featKill=function(b,head){const r=_fk.apply(this,arguments);try{if(b&&!b.zom)bhSay(b,'die',.2)}catch(e){}return r}}
/* a shimmering "spawn shield" cue while the player is protected (their damage is cut by 85%, not blocked) */
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(run&&!P.dead&&P.sp>t0){if(typeof LX.fx!='undefined')LX.fx.pulse=Math.max(LX.fx.pulse,.05);if(!BHS.sh){const e=document.createElement('div');e.id='spawnshield';e.textContent='SPAWN SHIELD';const h=document.getElementById('hud');if(h){h.appendChild(e);BHS.sh=e}}if(BHS.sh)BHS.sh.className='on'}else if(BHS.sh&&BHS.sh.className)BHS.sh.className=''}catch(e){}}}


/* ===================== ROUND CHANGES: short and soft =====================
   The old round change was a buzzy sawtooth pair plus three long bell drones (about two seconds of it, every round). Now: a round that ends is a gentle three-note chime (sines, under a second),
   a round that starts is one low swell with a soft thud and a faint shimmer (brute rounds add a deeper rumble). Nothing sustained, nothing harsh, nothing repeated. */
function roundSnd(kind,br){if(kind=='end'){flTone(523,523,.5,.035,0,'sine');flTone(784,784,.7,.03,.14,'sine');flTone(1046,1046,.8,.012,.28,'sine')}
 else{flTone(74,46,.9,.1,0,'sine');flTone(148,92,.7,.022,0,'sine');flNoise(.8,500,120,.035,'lowpass',.6);flTone(698,698,.8,.01,.05,'sine');if(br){flTone(55,34,1.2,.11,.1,'sine');flNoise(1.1,300,70,.05,'lowpass',.6,.1)}}}

/* ===================== BUYING A PERK: you drink it =====================
   After the purchase the weapon lowers, a hand brings the bottle up (the cap pops with a little hiss), tips it back and gulps it down while the liquid level falls and the screen glows in the perk's colour,
   then the empty bottle is thrown to the floor in front of you, where it clinks, bounces and shatters. About two seconds; you cannot fire during it. The perk itself is applied the moment you pay, as before. */
var ZDR={on:0,t:0,bot:null,liq:null,lastG:-1,bottles:[]};
function zdrBottle(col){const g=new THREE.Group(),M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})),gl=M(0xbfe6d8,{transparent:true,opacity:.42}),liq=M(col,{emissive:col,emissiveIntensity:.55}),lab=M(0xf2efe6),band=M(col,{emissive:col,emissiveIntensity:.25}),cap=M(0xdcdcdc),
 cy=(rt,rb,h,y,m,sg_)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,sg_||14),m);e.position.y=y;g.add(e);return e};
 cy(.03,.03,.11,0,gl);cy(.022,.03,.03,.07,gl);cy(.013,.022,.04,.1,gl);cy(.015,.015,.012,.126,cap,10);const l=cy(.0255,.0255,.098,0,liq);l.geometry.translate(0,.049,0);l.position.y=-.049;cy(.0315,.0315,.04,0,lab);cy(.0318,.0318,.008,.014,band);cy(.0318,.0318,.008,-.014,band);
 g.userData.liq=l;return g}
function zdrStart(k){
 if(ZDR.on||P.dead)return;
 const col=PERKS[k].c,bot=zdrBottle(col);
 ZDR.on=1;ZDR.t=0;ZDR.lastG=-1;ZDR.ex=0;ZDR.col=col;
 ZDR.bot=bot;ZDR.liq=bot.userData.liq;bot.position.set(.33,-.62,-.45);C.add(bot);
 nf=Math.max(nf,t0+2.5);MV.eq=0;MV.draw=0;
 flNoise(.1,4200,2200,.05,'highpass',.7,.35);flTone(1500,900,.05,.03,.38,'sine');flNoise(.22,900,3000,.04,'bandpass',1.2)
}
function zdrDispose(bot){
 if(bot.parent)bot.parent.remove(bot);
 const materials=new Set();
 for(const part of bot.children){part.geometry.dispose();materials.add(part.material)}
 for(const material of materials)material.dispose();
}
function zdrEnd(){
 if(ZDR.bot)zdrDispose(ZDR.bot);
 ZDR.bot=ZDR.liq=null;ZDR.on=0;
 if(!P.dead&&!(zq&&(zq.papT>0||zq.down))&&!(typeof SK!='undefined'&&SK.rc))gun.visible=true;
}
function zdrBottleWorld(){
 const m=ZDR.bot;
 C.updateWorldMatrix(true,false);
 m.getWorldPosition(zdrWorldPosition);m.getWorldQuaternion(zdrWorldRotation);
 S.add(m);m.position.copy(zdrWorldPosition);m.quaternion.copy(zdrWorldRotation);
 const d=aimDir(),rx=Math.cos(yaw),rz=-Math.sin(yaw);
 ZDR.bottles.push({m,col:ZDR.col,v:V(d.x*1.4+rx*.5,-1.2,d.z*1.4+rz*.5),t:0,sp:V(7,3,5)});
 ZDR.bot=ZDR.liq=null;
}
const zdrWorldPosition=V(),zdrWorldRotation=new THREE.Quaternion(),zdrGrip=V(),zdrAxis=V(),zdrShoulder=V(.26,-.45,.12),zdrElbow=V(.4,-1,.3);
/* ---- the bottle shatters when it hits the floor: a layered glass crash, a burst of shards that skitter and settle, and a puddle of cola that spreads and slowly dries ---- */
var ZSH=[];
function zdrShatter(p,col){flNoise(.22,6200,2400,.11,'highpass',.7);flNoise(.5,3800,1500,.06,'bandpass',1.4,.03);for(let k=0;k<8;k++)flTone(2400+Math.random()*3200,1800+Math.random()*1800,.1+Math.random()*.16,.03,k*.026+Math.random()*.03,'sine');flTone(150,70,.14,.1,0,'sine');flNoise(.9,2600,700,.03,'bandpass',.8,.15);
 const q=p.clone();q.y=.1;burst(q,26,0xd8f0e8,4.8,.8,.06);burst(q,20,col,3.4,.8,.07);burst(q,8,0xffffff,6,.4,.035);
 const geo=zdrShatter.g||(zdrShatter.g=new THREE.CircleGeometry(.035,3)),mat=zdrShatter.m||(zdrShatter.m=new THREE.MeshLambertMaterial({color:0xcfeee0,transparent:true,opacity:.8,side:THREE.DoubleSide}));
 for(let i=0;i<16;i++){const m=new THREE.Mesh(geo,mat),a=Math.random()*6.283,sp=1.2+Math.random()*3.2;m.position.set(p.x,.07,p.z);m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);m.scale.setScalar(.6+Math.random()*1.4);S.add(m);ZSH.push({k:0,m,v:V(Math.cos(a)*sp,1.6+Math.random()*2.6,Math.sin(a)*sp),r:V((Math.random()-.5)*16,(Math.random()-.5)*16,(Math.random()-.5)*16),t:0,L:1.8+Math.random()*.9})}
 const pg=zdrShatter.p||(zdrShatter.p=new THREE.CircleGeometry(.5,28)),pm=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}),pu=new THREE.Mesh(pg,pm);pu.rotation.x=-Math.PI/2;pu.position.set(p.x,.014,p.z);pu.scale.setScalar(.15);S.add(pu);ZSH.push({k:1,m:pu,t:0,L:5.5,mat:pm})}
function zshTick(dt){for(let i=ZSH.length-1;i>=0;i--){const s=ZSH[i];s.t+=dt;if(s.k==0){if(s.m.position.y>.02){s.v.y-=16*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.r.x*dt;s.m.rotation.y+=s.r.y*dt;s.m.rotation.z+=s.r.z*dt;if(s.m.position.y<=.02){s.m.position.y=.02;s.m.rotation.set(-Math.PI/2,0,s.m.rotation.z);if(Math.abs(s.v.y)>2.4&&Math.random()<.5)flTone(3600+Math.random()*2400,3000,.05,.012,0,'sine')}}}
  else{const g=Math.min(1,s.t/.35);s.m.scale.setScalar(.15+.95*(1-Math.pow(1-g,3)));s.mat.opacity=.6*Math.min(1,(s.L-s.t)/2.5)}
  if(s.k==0&&s.t>s.L-.4)s.m.scale.multiplyScalar(Math.max(.01,1-dt*3));
  if(s.t>=s.L){S.remove(s.m);if(s.mat)s.mat.dispose();ZSH.splice(i,1)}}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(ZSH.length)zshTick(dt)}catch(e){}}}
function zdrTick(dt){
 for(let i=ZDR.bottles.length-1;i>=0;i--){const b=ZDR.bottles[i];b.t+=dt;b.v.y-=18*dt;b.m.position.addScaledVector(b.v,dt);b.m.rotation.x+=b.sp.x*dt;b.m.rotation.z+=b.sp.z*dt;
  if(b.m.position.y<.06){zdrShatter(b.m.position,b.col);zdrDispose(b.m);ZDR.bottles.splice(i,1);continue}
  if(b.t>4){zdrDispose(b.m);ZDR.bottles.splice(i,1)}}
 if(!ZDR.on)return;if(P.dead||!run||mode!='Zombies'){zdrEnd();return}
 ZDR.t+=dt;const t=ZDR.t,L=(a,b,u)=>a+(b-a)*cl(u,0,1),E=u=>1-Math.pow(1-cl(u,0,1),3);
 gun.visible=false;hideFP();
 let x,y,z,tilt=0;
 const sip=.65,endSip=1.45,reach=.126;
 const sipY=-.025-reach*Math.cos(1.18),sipZ=-.25-reach*Math.sin(1.18);
 if(t<.3){const u=E(t/.3);x=L(.33,.135,u);y=L(-.62,-.21,u);z=L(-.45,-.4,u)}
 else if(t<sip){const u=E((t-.3)/(sip-.3));x=L(.135,0,u);y=L(-.21,sipY,u);z=L(-.4,sipZ,u);tilt=L(0,1.18,u)}
 else if(t<endSip){
  const gulp=Math.sin((t-sip)*13);
  x=0;tilt=1.18+gulp*.037;y=-.025-reach*Math.cos(tilt);z=-.25-reach*Math.sin(tilt);
  ZDR.liq.scale.y=Math.max(.02,1-(t-sip)/(endSip-sip));ZDR.liq.visible=ZDR.liq.scale.y>.03;
  const gi=Math.floor((t-sip)/.2);if(gi!==ZDR.lastG&&gi<4){ZDR.lastG=gi;flTone(190-gi*12,115,.16,.065,0,'sine');flNoise(.12,520,200,.035,'lowpass',.7);try{LX.fx.heal=Math.max(LX.fx.heal,.35);flashL=Math.max(flashL||0,.4)}catch(e){}}
 }else if(t<1.75){
  const u=E((t-endSip)/.3);x=L(0,.22,u);y=L(sipY,-.23,u);z=L(sipZ,-.42,u);tilt=L(1.18,.1,u);
  ZDR.liq.visible=false;if(t>1.5&&!ZDR.ex){ZDR.ex=1;flNoise(.5,1500,500,.05,'bandpass',.5)}
 }else{
  const u=E((t-1.75)/.35);x=L(.22,.4,u);y=L(-.23,-.72,u);z=L(-.42,-.31,u);tilt=L(.1,-.3,u);
 }
 const arm=fpArm.r;
 arm.up.visible=arm.fo.visible=true;
 zdrGrip.set(x,y,z);zdrAxis.set(0,Math.cos(tilt),Math.sin(tilt));
 gripArm(zdrShoulder,zdrGrip,zdrElbow,arm,zdrAxis,1);
 if(ZDR.bot){
  ZDR.bot.position.copy(zdrGrip);ZDR.bot.rotation.x=tilt;
  if(t>=1.8){ZDR.liq.visible=false;flNoise(.18,600,1800,.05,'bandpass',1.2);zdrBottleWorld()}
 }
 if(t>=2.35)zdrEnd()}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{zdrTick(dt)}catch(e){console.warn('drink',e)}}}
{const _zs=zStart;zStart=function(){
 if(ZDR.on)zdrEnd();
 for(const bottle of ZDR.bottles)zdrDispose(bottle.m);
 ZDR.bottles.length=0;
 return _zs.apply(this,arguments);
}}
{const _zp=zPerk;zPerk=function(t){const had=zq&&zq.perks&&zq.perks[t],r=_zp.apply(this,arguments);try{if(zq&&zq.perks[t]&&!had)zdrStart(t)}catch(e){}return r}}

/* ===================== CHEWABLES =====================
   Pick five gums in the menu (the CHEWABLES button on the home screen). In Zombies, gumball machines stand around the map: pay, and the machine deals the next gum from a shuffled deck made of exactly your five;
   you see all five before the deck reshuffles. The first draw of a round costs 500, then 1,500, 2,500 and 4,900; the price resets every round. You carry one active gum at a time: drawing replaces it,
   unless the gum fires instantly. Standard, Cosmetic and Community gums are free to use once your level unlocks them; Rare and Ultra-Rare gums are used up from your stored stock when drawn (you earn stock by surviving rounds).
   Types: player-activated (key J / D-pad left), round-based, time-based, event-triggered and cosmetic. */
var CG={sel:[],stock:{},pool:[],A:null,mach:[],draws:0,ptsL:null,disc:0,inBox:0,inWall:0,ocB:null,hvB:null,trail:[],slip:[],ele:null,arsT:0,fz:[],tk:0,ui:null,hud:null,fxEl:null,rl:0,exp:0,pad:0,refillE:null,duck:new WeakSet(),vint:0};
/* id, name, tier (s standard, r rare, u ultra, c cosmetic, m community), type (rnd rounds, time seconds, act player-activated, evt event, ins instant, cos cosmetic), n (rounds / seconds / charges / triggers), run seconds (act), description, colour, unlock level */
var CHEW=[
['swift','Swift Stance','s','rnd',3,0,'Walk and strafe faster while aiming down sights, and aim in much quicker.',0x4aa8ff,1],
['dex','Tactical Dexterity','s','rnd',3,0,'Faster reloads, quicker equipment throws.',0x45d6c0,2],
['bleed','Extended Bleedout','s','rnd',3,0,'Your downed bleedout timer lasts more than twice as long.',0xe85a5a,3],
['second','Second Chance Respawn','s','evt',2,0,'Down in co-op? You respawn near the end of the round instead of waiting for the next. Lasts 2 rounds.',0xb08af0,5],
['ghost','Ghost Protocol','s','act',2,10,'2 charges. Every enemy ignores you for 10 seconds.',0x9aa6c8,7],
['feed','Direct Feed','s','time',120,0,'2 minutes. Your weapon draws straight from reserve ammo: no reloads.',0xf0c040,9],
['escape','Emergency Escape','s','act',2,0,'2 charges. Teleport to a safe spot on the map and blast nearby enemies away.',0x58e0ff,11],
['blast','Blast Shield','s','rnd',3,0,'Immune to your own and incoming explosive splash damage.',0xff9a3a,13],
['sledge','Sledgehammer Melee','s','time',150,0,'2.5 minutes. Melee strikes hit five times as hard.',0xd0603a,15],
['mobile','Mobile Fire','s','rnd',3,0,'Fire your weapon while sprinting.',0x8ae05a,17],
['graviton','Reverse Graviton','s','rnd',3,0,'Anything you kill is flung toward the ceiling by inverted gravity.',0xb070ff,19],
['alchemy','Alchemical Convertor','s','act',2,60,'2 charges, 60 seconds each. Points you earn become reserve ammo instead of score.',0xe0d060,21],
['retain','Perk Retainer','r','evt',3,0,'Lasts 3 rounds. Keep every perk when you are downed and revived.',0x40c8a0,0],
['thermal','Thermal Burst','r','evt',2,0,'2 triggers. When a zombie hits you, a ring of fire erupts and ignites everything around you.',0xff5a28,0],
['nukedrop','Tactical Nuke Drop','r','act',2,0,'2 charges. Drops a map-clearing nuke power-up in front of you.',0xff3a3a,0],
['overclock','Temporary Overclock','r','act',2,60,'2 charges, 60 seconds each. Your held weapon becomes fully Pack-a-Punched for a minute.',0xb070ff,0],
['discount','Discount Spawner','r','act',3,45,'3 charges. 45 seconds of half-price shopping.',0xffd040,0],
['repair','Structural Repair','r','act',3,0,'3 charges. A Full Restore drops and you are paid for the repairs.',0x6ad08a,0],
['reviver','Team Reviver','r','act',1,0,'1 charge. Instantly revives every downed squad mate, perks intact.',0x40a0ff,0],
['shock','Static Shock','r','evt',5,0,'5 charges. Melee strikes arc chain lightning to nearby zombies.',0x80d8ff,0],
['reroll','Reroll Token','r','act',2,0,'2 charges. Make a Mystery Box that is showing a weapon spin again.',0xf08ad8,0],
['lock','Loot Lock','r','evt',1,0,'1 use. If the Mystery Box would move away, it stays and spins again instead.',0xc0a060,0],
['overcharge','Instant Overcharge','r','evt',1,0,'The next weapon you take from the Mystery Box is fully upgraded.',0xff7a3a,0],
['arsenal','Randomized Arsenal','r','time',300,0,'5 minutes. Every 10 seconds your held weapon becomes a different upgraded gun.',0xff5ac8,0],
['heavy','Heavy Ordnance','r','act',2,25,'2 charges. A cyclone minigun for 25 seconds, then your gun returns.',0xd0d040,0],
['gift','Mystery Gift','r','act',2,0,'2 charges. A random power-up drops at your feet.',0xff8ad0,0],
['bonus','Bonus Upgrade Drop','r','act',1,0,'1 charge. Grants a free perk you do not own yet.',0x70e0ff,0],
['capx','Cap Expander','r','ins',1,0,'Instant. Permanently carry one more weapon.',0xa0e060,0],
['wallup','Wall Upgrade','r','evt',1,0,'The next weapon you buy off a wall is fully upgraded.',0xe0a050,0],
['crowd','Crowd Control','r','act',5,12,'5 charges. Sprinting zombies near you are reduced to a slow crawl.',0x50c0d0,0],
['resupply','Resupply Drop','r','act',1,0,'1 charge. A Max Ammo drops at your feet.',0x40ff70,0],
['stasis','Stasis Gaze','r','act',2,20,'2 charges, 20 seconds each. Anything you look at freezes solid.',0x90f0ff,0],
['dropext','Drop Extender','r','rnd',1,0,'1 round. Power-ups stay on the ground twice as long.',0xe0c060,0],
['slowaura','Slowing Aura','r','time',240,0,'4 minutes. Every zombie shuffles at walking pace.',0x6090ff,0],
['freeze','Temporal Freeze','u','act',1,20,'1 charge, 20 seconds. Every enemy freezes; all damage you deal lands at once when time resumes.',0x60f0ff,0],
['maxup','Max Upgrade Mastery','u','ins',1,0,'Instant. Every perk on the map, yours now.',0xffe060,0],
['refill','Universal Refill','u','time',600,0,'10 minutes. Refill your weapon from anywhere, not just at a wall.',0x60ff90,0],
['precision','Precision Targeting','u','rnd',1,0,'Rest of the round. Every bullet counts as a headshot.',0xff4040,0],
['aura','Aura Revive','u','rnd',3,0,'3 rounds. Go down and you are revived on the spot (once a round), perks kept.',0xfff0a0,0],
['shared','Shared Prosperity','u','time',600,0,'10 minutes. A quarter more points on everything you earn (squad mates share them in co-op).',0xffd050,0],
['skip','Phase Skip','u','act',1,0,'1 charge. The wave ends now, and everyone is paid a bonus.',0xd070ff,0],
['selfrest','Self-Restoration','u','evt',3,0,'3 charges. Get a kill while downed and you stand back up with your perks.',0x70ffb0,0],
['cascade','Drop Cascade','u','rnd',4,0,'4 rounds. Kills drop power-ups far more often.',0xff90ff,0],
['comedy','Audio Comedy','c','cos',0,0,'Enemies die with comedy sound effects.',0xffb040,4],
['squeak','Rubber Squeaks','c','cos',0,0,'Hits make rubber squeaks and every zombie wears a little rubber duck.',0xffe040,10],
['thermalh','Thermal Highlighting','c','act',4,15,'4 charges, 15 seconds. Neon outlines show every enemy through walls.',0x40ffe0,16],
['vintage','Vintage Cinema','c','cos',0,0,'Black and white film grain with projector lines over the screen.',0xc8c8c8,22],
['slippery','Slippery Trail','m','rnd',3,0,'Slide to leave a slick trail: zombies slip, fall and burst apart.',0x60e0a0,23],
['bottomless','Bottomless Clip','m','time',60,0,'60 seconds. Infinite magazine, no ammo used at all.',0xffa040,26],
['infusion','Elemental Infusion','m','act',1,45,'1 charge, 45 seconds. A random shock or fire effect on every bullet.',0xff6ad0,29],
['invuln','Invulnerability Shield','m','time',30,0,'30 seconds. Zombies cannot hurt you.',0x60b0ff,32],
['wealth','Instant Wealth','m','act',1,0,'1 charge. A big pile of points, right now.',0xffd820,35],
['slotunc','Slot Uncapper','m','evt',1,0,'Carry up to eight weapons.',0xa070ff,38],
['pace','Overclocked Pace','m','time',180,0,'3 minutes. You move twice as fast.',0x40ff90,41],
['wonder','Wonder Weapon Guarantee','m','evt',1,0,'The very next Mystery Box spin gives the map\'s top wonder weapon.',0xff5050,44]];
var CGD={};for(const c of CHEW)CGD[c[0]]={id:c[0],n:c[1],tr:c[2],ty:c[3],cnt:c[4],run:c[5],d:c[6],c:c[7],lv:c[8]};
var CGT={s:'STANDARD',r:'RARE',u:'ULTRA-RARE',c:'COSMETIC',m:'COMMUNITY'},CGY={rnd:'ROUNDS',time:'TIMED',act:'ACTIVATE',evt:'EVENT',ins:'INSTANT',cos:'COSMETIC'};
/* ---- the deck ---- */
function chShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
var chCost=()=>[500,1500,2500,4900][Math.min(CG.draws,3)];
/* ======================= CHEWABLES v2: the collection =======================
   Gums are earned by playing and every one is single use. Every 10 rounds of a Zombies run drops 1 to 3 random gums into the collection; a first-time
   player gets a starter pack of standard gums. The pack holds five; the gumball machines roll one of them at random and use it up. */
var CHI={
swift:`<path d="M4 11h15a4 4 0 1 0-4-4"/><path d="M4 17h21a4 4 0 1 1-4 4"/><path d="M4 23h10"/>`,
dex:`<rect x="11" y="5" width="10" height="14" rx="1.5"/><path d="M13 9h6M13 13h6"/><path d="M5 22a11 8 0 0 0 22 0"/><path d="M27 22l-1-4m1 4l-4-1"/>`,
bleed:`<path d="M16 27C6 20 4 12 9 8c3-2 6 0 7 3 1-3 4-5 7-3 5 4 3 12-7 19z"/><path d="M16 12v5l3 2"/>`,
second:`<path d="M16 5a11 11 0 1 1-9 5"/><path d="M5 5l2 6 6-2"/><circle cx="16" cy="16" r="2.6" fill="currentColor"/>`,
ghost:`<path d="M7 27V14a9 9 0 0 1 18 0v13l-3-3-3 3-3-3-3 3-3-3z"/><circle cx="13" cy="14" r="1.6" fill="currentColor"/><circle cx="19" cy="14" r="1.6" fill="currentColor"/>`,
feed:`<path d="M3 21h26"/><rect x="5" y="9" width="4" height="9" rx="2"/><rect x="12" y="9" width="4" height="9" rx="2"/><rect x="19" y="9" width="4" height="9" rx="2"/><path d="M25 12l3 3-3 3"/>`,
escape:`<ellipse cx="21" cy="16" rx="5" ry="11"/><path d="M2 16h14M11 11l5 5-5 5"/>`,
blast:`<path d="M16 4l10 4v8c0 6-4 10-10 12C10 26 6 22 6 16V8z"/><path d="M16 10l2 4 4 1-4 2 1 4-3-3-3 3 1-4-4-2 4-1z"/>`,
sledge:`<rect x="6" y="5" width="15" height="8" rx="1.5" transform="rotate(30 13 9)"/><path d="M15 14L26 27" stroke-width="3.2"/>`,
mobile:`<circle cx="13" cy="6" r="2.4"/><path d="M13 9l-2 8-4 3M11 17l5 3 1 7M13 10l5 2 4-2M9 12l4-1"/><path d="M23 14h6M24 18h5"/>`,
graviton:`<path d="M16 28V6M9 13l7-7 7 7"/><path d="M5 27h7M20 27h7"/><circle cx="16" cy="19" r="2.6"/>`,
alchemy:`<path d="M12 4h8M13 4v8L6 25a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-13V4"/><path d="M9 22h14"/><circle cx="16" cy="25" r="1.3"/>`,
retain:`<path d="M13 3h6v5l2 3v15a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V11l2-3z"/><rect x="13" y="17" width="6" height="6" rx="1"/><path d="M14 17v-2a2 2 0 0 1 4 0v2"/>`,
thermal:`<path d="M16 5c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 2 3 4"/><circle cx="16" cy="17" r="12" stroke-dasharray="3 3"/>`,
nukedrop:`<path d="M7 27h18M11 27v-6a5.5 5.5 0 1 1 10 0v6"/><path d="M16 3v4M9 7l2 3M23 7l-2 3"/>`,
overclock:`<path d="M5 23a11 11 0 1 1 22 0"/><path d="M16 23l5-9"/><path d="M8 14l2 1M24 14l-2 1M16 8v2"/><path d="M12 28h8"/>`,
discount:`<path d="M4 4h12l12 12-12 12L4 16z"/><circle cx="10" cy="10" r="1.8"/><path d="M12 22l8-8"/><circle cx="13" cy="14" r="1.1"/><circle cx="19" cy="21" r="1.1"/>`,
repair:`<path d="M22 4a6 6 0 0 0-5 8L5 24l3 3 12-12a6 6 0 0 0 8-5l-4 3-3-1-1-3z"/>`,
reviver:`<circle cx="16" cy="16" r="12"/><path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z"/>`,
shock:`<path d="M18 3L8 18h7l-2 11 11-17h-8z"/>`,
reroll:`<rect x="5" y="5" width="22" height="22" rx="4"/><circle cx="11" cy="11" r="1.7" fill="currentColor"/><circle cx="21" cy="11" r="1.7" fill="currentColor"/><circle cx="16" cy="16" r="1.7" fill="currentColor"/><circle cx="11" cy="21" r="1.7" fill="currentColor"/><circle cx="21" cy="21" r="1.7" fill="currentColor"/>`,
lock:`<rect x="6" y="14" width="20" height="14" rx="2"/><path d="M10 14V10a6 6 0 0 1 12 0v4"/><circle cx="16" cy="21" r="2"/>`,
overcharge:`<path d="M3 17h15l3-3h6l2 3v4h-6l-2 5h-5l1-5H3z"/><path d="M15 3l-3 5h4l-2 5"/>`,
arsenal:`<path d="M16 4a12 12 0 0 1 10 6"/><path d="M26 4v6h-6"/><path d="M28 19a12 12 0 0 1-12 9"/><path d="M12 28h4v-4"/><path d="M5 21A12 12 0 0 1 7 9"/><path d="M3 13l4-4 4 4"/><rect x="14" y="12" width="4" height="8" rx="2"/>`,
heavy:`<circle cx="16" cy="13" r="8"/><circle cx="16" cy="13" r="1.6" fill="currentColor"/><circle cx="16" cy="8.4" r="1.2"/><circle cx="20.2" cy="11" r="1.2"/><circle cx="20.2" cy="15.6" r="1.2"/><circle cx="16" cy="17.8" r="1.2"/><circle cx="11.8" cy="15.6" r="1.2"/><circle cx="11.8" cy="11" r="1.2"/><path d="M12 24h8l2 5H10z"/>`,
gift:`<rect x="5" y="13" width="22" height="14" rx="1.5"/><rect x="3" y="9" width="26" height="5" rx="1"/><path d="M16 9v18"/><path d="M16 9c-4-6-9-3-6 0M16 9c4-6 9-3 6 0"/>`,
bonus:`<path d="M13 3h6v5l2 3v15a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V11l2-3z"/><path d="M16 14l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z"/>`,
capx:`<rect x="4" y="8" width="10" height="16" rx="2"/><rect x="18" y="8" width="10" height="16" rx="2" stroke-dasharray="3 2"/><path d="M23 13v6M20 16h6"/>`,
wallup:`<rect x="4" y="16" width="24" height="12"/><path d="M4 22h24M12 16v6M20 22v6"/><path d="M16 12V3M12 7l4-4 4 4"/>`,
crowd:`<circle cx="8" cy="9" r="2.5"/><circle cx="16" cy="7" r="2.5"/><circle cx="24" cy="9" r="2.5"/><path d="M4 21v-6a4 4 0 0 1 8 0v6M12 21v-8a4 4 0 0 1 8 0v8M20 21v-6a4 4 0 0 1 8 0v6"/><path d="M5 27h22"/>`,
resupply:`<path d="M5 12a11 10 0 0 1 22 0z"/><path d="M5 12l9 10M27 12l-9 10M16 12v10"/><rect x="11" y="22" width="10" height="7" rx="1"/>`,
stasis:`<path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z"/><path d="M16 12v8M12.5 14l7 4M19.5 14l-7 4"/>`,
dropext:`<path d="M8 4h16M8 28h16M10 4c0 8 12 8 12 0M10 28c0-8 12-8 12 0"/><circle cx="16" cy="25" r="1.2" fill="currentColor"/>`,
slowaura:`<path d="M16 16a2 2 0 1 1 3 1.7 5 5 0 1 1-6.6-5.2 9 9 0 1 1 6.2 14.4"/><path d="M4 28h6"/>`,
freeze:`<path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13"/><path d="M12 5l4 3 4-3M12 27l4-3 4 3"/>`,
maxup:`<path d="M16 3l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8.1L16 21.4 8.8 25.3l1.4-8.1L4.3 11.5l8.1-1.1z"/>`,
refill:`<rect x="11" y="8" width="10" height="17" rx="2"/><path d="M13 12h6"/><path d="M6 8a14 14 0 0 0 0 12M26 8a14 14 0 0 1 0 12"/>`,
precision:`<circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="2.2" fill="currentColor"/><path d="M16 3v6M16 23v6M3 16h6M23 16h6"/>`,
aura:`<ellipse cx="16" cy="6" rx="6" ry="2.5"/><path d="M16 10v15M16 14C10 10 5 12 3 17c3-1 6 0 8 2M16 14c6-4 11-2 13 3-3-1-6 0-8 2"/>`,
shared:`<circle cx="10" cy="16" r="6"/><circle cx="22" cy="16" r="6"/><path d="M13 8l3-3 3 3M13 24l3 3 3-3"/>`,
skip:`<path d="M4 6l11 10L4 26zM16 6l11 10-11 10z"/>`,
selfrest:`<path d="M16 27C6 20 4 12 9 8c3-2 6 0 7 3 1-3 4-5 7-3 5 4 3 12-7 19z"/><path d="M16 12v8M12 16h8"/>`,
cascade:`<path d="M8 3l1.2 3.3 3.3 1.2-3.3 1.2L8 12 6.8 8.7 3.5 7.5l3.3-1.2zM21 10l1.2 3.3 3.3 1.2-3.3 1.2L21 19l-1.2-3.3-3.3-1.2 3.3-1.2zM11 20l1.2 3.3 3.3 1.2-3.3 1.2L11 29l-1.2-3.3-3.3-1.2 3.3-1.2z"/>`,
comedy:`<path d="M5 6h22v10c0 7-5 11-11 11S5 23 5 16z"/><path d="M10 12h3M19 12h3"/><path d="M10 18c2 5 10 5 12 0z"/>`,
squeak:`<path d="M8 23c-3-2-3-7 1-8 0-5 4-8 8-8 3 0 5 2 5 5l5 2-5 2c0 6-4 9-10 9z"/><circle cx="19" cy="11" r="1.1" fill="currentColor"/>`,
thermalh:`<circle cx="16" cy="9" r="4"/><path d="M8 28V18a8 8 0 0 1 16 0v10"/><path d="M3 8l3 3M29 8l-3 3M3 21h3M26 21h3"/>`,
vintage:`<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="9" r="2"/><circle cx="22" cy="19" r="2"/><circle cx="10" cy="19" r="2"/>`,
slippery:`<path d="M5 8c0 13 9 19 22 17-7-2-9-7-10-13-.5-2-1.5-4-4-5z"/>`,
bottomless:`<rect x="9" y="3" width="14" height="26" rx="2"/><path d="M12 16c0-3 4-3 4 0s4 3 4 0-4-3-4 0-4 3-4 0z"/>`,
infusion:`<path d="M12 4c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-5"/><path d="M25 12l-5 8h5l-3 9 8-11h-5z"/>`,
invuln:`<path d="M16 3l11 4v9c0 6-5 10-11 13C10 26 5 22 5 16V7z"/><path d="M10 16l4 4 8-9"/>`,
wealth:`<path d="M11 4h10l-2 5c5 3 7 8 6 13-1 4-5 5-9 5s-8-1-9-5c-1-5 1-10 6-13z"/><path d="M16 14v11M13 17c0-2 6-2 6 0s-6 2-6 4 6 2 6 0"/>`,
slotunc:`<rect x="3" y="6" width="5" height="8" rx="1"/><rect x="10" y="6" width="5" height="8" rx="1"/><rect x="17" y="6" width="5" height="8" rx="1"/><rect x="24" y="6" width="5" height="8" rx="1"/><rect x="3" y="18" width="5" height="8" rx="1"/><rect x="10" y="18" width="5" height="8" rx="1"/><rect x="17" y="18" width="5" height="8" rx="1"/><rect x="24" y="18" width="5" height="8" rx="1" stroke-dasharray="2 2"/>`,
pace:`<path d="M3 8l9 8-9 8M13 8l9 8-9 8M23 8l7 8-7 8"/>`,
wonder:`<path d="M3 18h13l3-4h7l3 3v4h-6l-2 6h-5l1-6H3z"/><path d="M8 4l1.2 2.4 2.6.4-1.9 1.8.5 2.6L8 10l-2.4 1.2.5-2.6L4.2 6.8l2.6-.4z"/>`};
function chIcon(id){return '<svg class="cw-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(CHI[id]||'<circle cx="16" cy="16" r="9"/>')+'</svg>'}
var chHex=c=>'#'+c.toString(16).padStart(6,'0');
var chPrem=id=>false;
CG.own=CG.stock;CG.rt=null;
/* ---- persistence: version 2 stores the collection ("own": how many of each gum is left) and the pack ---- */
/* ======= the collection is sealed to this device =======
   The stored counts carry a MAC made with a NON-EXTRACTABLE HMAC key that lives in IndexedDB (the page can ask it to sign but can never read it), and a save counter kept beside the key.
   Editing the stored counts, forging the old public checksum, or pasting an older copy back in all fail verification at load, and the collection is cleared. */
var DSV={p:null,o:null};
function dsReady(){if(window.SD_MOD_SESSION)return Promise.resolve(null);if(DSV.p)return DSV.p;return DSV.p=(async()=>{try{if(!window.indexedDB||!window.crypto||!crypto.subtle)return null;
 const db=await new Promise((res,rej)=>{const r=indexedDB.open('sd-kv',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}),
  g=k=>new Promise((res,rej)=>{const q=db.transaction('k').objectStore('k').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}),
  p=(k,v)=>new Promise((res,rej)=>{const t=db.transaction('k','readwrite');t.objectStore('k').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)});
 let key=await g('dk'),fresh=0;if(!key){key=await crypto.subtle.generateKey({name:'HMAC',hash:'SHA-256'},false,['sign']);await p('dk',key);await p('dn',0);fresh=1}
 const mac=async s=>[...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 return DSV.o={fresh,get:g,put:p,mac}}catch(e){return null}})()}
var CGP={q:Promise.resolve(),pend:0};
function cgCanon(o,n){return 'gm3|'+n+'|'+Object.keys(o).sort().map(k=>k+':'+(o[k]|0)).join(';')}
function cgPersist(){CGP.pend++;CGP.q=CGP.q.then(async()=>{const ds=await dsReady(),own=Object.assign({},CG.own),sel=CG.sel.slice();let rec;
 if(ds){const n=(+(await ds.get('dn'))||0)+1,k=await ds.mac(cgCanon(own,n));await ds.put('dn',n);rec={v:3,sel,own,n,k}}else rec={v:2,sel,own,k:cgSig(own)};
 try{localStorage.setItem('sd-gum',JSON.stringify(rec))}catch(e){}}).catch(()=>{}).then(()=>{CGP.pend--})}
/* a keyed fingerprint kept in memory only (the page compares it every watcher tick to catch edits made to the live collection) */
function cgSig(o){let s='gm2|zq9|';for(const k of Object.keys(o).sort())s+=k+':'+(o[k]|0)+';';let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
function cgSave(){CG.k=cgSig(CG.own);cgPersist()}
/* keep the pack tidy; the storage is only read once, at start-up (cgBoot) */
function cgLoad(){CG.sel=CG.sel.filter((i,n)=>CGD[i]&&(CG.own[i]||0)>0&&CG.sel.indexOf(i)==n).slice(0,5);if(!CG.sel.length&&CG.ver){for(const t of['s','m','c','r','u'])for(const c of CHEW)if(c[2]==t&&(CG.own[c[0]]||0)>0&&CG.sel.length<5&&!CG.sel.includes(c[0]))CG.sel.push(c[0])}}
async function cgBoot(){const ds=await dsReady();let j=null;try{j=JSON.parse(localStorage.getItem('sd-gum')||'null')}catch(e){}
 const dev=typeof prof!='undefined'&&prof&&prof.dev,fitsK=(o,per,tot)=>{let t=0;if(!o||typeof o!='object')return false;for(const k in o){const v=o[k];if(!CGD[k]||!(v>=0)||v>per||v!==Math.floor(v))return false;t+=v}return t<=tot};
 let own={},sel=[],fresh=false,save=false;CG.tamper=0;
 if(!j)fresh=true;
 else if(j.v==3){if(ds&&!ds.fresh){const dn=+(await ds.get('dn'))||0;if((j.n===dn||j.n===dn-1)&&fitsK(j.own,999,60000)&&j.k===await ds.mac(cgCanon(j.own,j.n))){own=Object.assign({},j.own);sel=j.sel||[]}else CG.tamper=1}else CG.tamper=1}
 else if(j.v>=2){/* the earlier checksum was public, so it is accepted once, for small collections only */if(j.k===cgSig(j.own||{})&&fitsK(j.own,dev?999:20,dev?60000:300)){own=Object.assign({},j.own);sel=j.sel||[];save=true}else CG.tamper=1}
 else{/* the first version: stock plus one copy of each gum reached by level */if(fitsK(j.stock,25,200)){for(const k in j.stock)if(j.stock[k]>0)own[k]=j.stock[k]|0;for(const c of CHEW)if((c[2]=='s'||c[2]=='c'||c[2]=='m')&&c[8]>0&&(prof.lvl||1)>=c[8])own[c[0]]=(own[c[0]]||0)+1;sel=(j.sel||[]).filter(i=>CGD[i]);save=true}else CG.tamper=1}
 if(fresh){/* the starter pack: six random standard gums, two of each */const s=chShuffle(CHEW.filter(c=>c[2]=='s').map(c=>c[0]));for(const id of s.slice(0,6))own[id]=2;save=true}
 CG.own=CG.stock=own;CG.sel=sel.filter(i=>CGD[i]);CG.k=cgSig(own);CG.ver=1;cgLoad();if(save||CG.tamper)cgSave();
 try{const p=document.getElementById('p-chew');if(p&&p.offsetParent!==null)chPanel()}catch(e){}}
function chDeck(){return CG.sel.filter(i=>CGD[i]&&(CG.own[i]||0)>0).slice(0,5)}
/* ---- rewards: every 10 rounds, 1 to 3 random gums ---- */
function gmRoll(n){const wt={s:5,c:3,m:3,r:2,u:1},tot=CHEW.reduce((s,c)=>s+wt[c[2]],0),out=[];for(let i=0;i<n;i++){let r=Math.random()*tot;for(const c of CHEW){r-=wt[c[2]];if(r<=0){out.push(c[0]);break}}}return out}
function chReward(n){if(window.SD_MOD_SESSION)return;const ids=gmRoll(1+(Math.random()*3|0));for(const id of ids){CG.own[id]=Math.min(999,(CG.own[id]||0)+1);if(CG.sel.length<5&&!CG.sel.includes(id))CG.sel.push(id)}cgSave();chRewardUI(ids,n)}
function chRewardUI(ids,n){try{let el=document.getElementById('gmrw');if(el)el.remove();el=document.createElement('div');el.id='gmrw';
 el.innerHTML='<div class="rw-h"><small>ROUND '+n+' REWARD</small><b>CHEWABLES UNLOCKED</b></div><div class="rw-c">'+ids.map((id,i)=>{const d=CGD[id];return `<div class="rw-i t-${d.tr}" style="--c:${chHex(d.c)};--d:${(.25+i*.3).toFixed(2)}s"><span class="cw-ball">${chIcon(id)}</span><b>${d.n}</b><small>${CGT[d.tr]}</small></div>`}).join('')+'</div>';document.body.appendChild(el);
 ids.forEach((id,i)=>setTimeout(()=>{try{chSnd(CGD[id].tr=='u'?'ultra':CGD[id].tr=='r'?'rare':'pop');if(typeof burst=='function'&&typeof V=='function')burst(V(P.x,1.4,P.z),14,CGD[id].c,3,.7,.06)}catch(e){}},350+i*300));
 setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),700)},5200)}catch(e){}}
function chRw(){const z=typeof zq!='undefined'&&zq;if(!run||mode!='Zombies'||!z)return;const t=Math.floor((z.r||0)/10);if(CG.rt==null){CG.rt=t;return}if(t>CG.rt){CG.rt=t;chReward(t*10)}}
/* ---- the machines: placed by rule, validated against the real colliders ---- */
function chPlace(){for(const m of CG.mach){try{m.g.parent&&m.g.parent.remove(m.g);if(m.sol)zUnsolid(m.sol)}catch(e){}}CG.mach=[];const M=MAPS[sel.map];if(!M||!M.zm||mode!='Zombies')return;
 const ps=M.ps||[0,0],zs=M.zs||[],taken=zi.map(i=>[i.x,i.z]);taken.push([ps[0],ps[1]]);
 const clear=(x,z,r)=>{if(Math.abs(x)>M.H-3||Math.abs(z)>M.H-3)return false;for(const b of bx){if((b.h||0)<.3)continue;if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return false}const f=zFreeSpot(x,z);return Math.abs(f[0]-x)<.01&&Math.abs(f[1]-z)<.01},
  far=(x,z,d)=>taken.every(t=>Math.hypot(t[0]-x,t[1]-z)>d);
 /* one machine in the start area, one in a middle zone and one in a far zone: spots are searched on rings around that zone's own spawn points */
 const zones=[...new Set(zs.map(s=>s[2]))].sort((a,b)=>a-b),cen=zn=>{const p=zs.filter(s=>s[2]==zn);return[p.reduce((a,s)=>a+s[0],0)/p.length,p.reduce((a,s)=>a+s[1],0)/p.length]},
  dist=zn=>{const c=cen(zn);return Math.hypot(c[0]-ps[0],c[1]-ps[1])},byD=zones.slice().sort((a,b)=>dist(a)-dist(b)),want=[byD[0],byD[Math.floor(byD.length*.45)],byD[byD.length-2>0?byD.length-2:byD.length-1]].filter((z,i,a)=>z!=null&&a.indexOf(z)==i);
 const spot=zn=>{const pts=zs.filter(s=>s[2]==zn);for(let r=2.4;r<=9;r+=1.2)for(const s of pts)for(let k=0;k<14;k++){const a=k/14*6.283+r,x=s[0]+Math.cos(a)*r,z=s[1]+Math.sin(a)*r;if(zn==byD[0]&&Math.hypot(x-ps[0],z-ps[1])<5)continue;if(clear(x,z,1.15)&&far(x,z,5.5))return[x,z]}return null};
 const place=(fx,fz)=>{const g=chMachine();g.position.set(fx,0,fz);g.rotation.y=Math.atan2(ps[0]-fx,ps[1]-fz);(typeof zG!='undefined'&&zG?zG:S).add(g);let sol=null;try{sol=zSolid(fx,fz,.8,.8,1.9);zGrid()}catch(e){}taken.push([fx,fz]);
  const mc={g,x:fx,z:fz,sol,busy:0,t:0};CG.mach.push(mc);zi.push({x:fx,z:fz,r:2.6,txt:()=>mc.busy?'':'Chewables · roll a gumball ('+chDeck().length+' in your pack)',cost:()=>mc.busy?0:chCost(),act:()=>chDraw(mc)})};
 for(const zn of want){const s=spot(zn);if(s)place(s[0],s[1])}
 if(!CG.mach.length)for(let r=6;r<=20&&!CG.mach.length;r+=2)for(let k=0;k<16&&!CG.mach.length;k++){const a=k/16*6.283,x=ps[0]+Math.cos(a)*r,z=ps[1]+Math.sin(a)*r;if(clear(x,z,1.15)&&far(x,z,4))place(x,z)}}
/* ---- the sign on the front of each machine ---- */
function chSignMat(){if(chSignMat.m)return chSignMat.m;const c=document.createElement('canvas');c.width=256;c.height=48;const g=c.getContext('2d');g.fillStyle='#fff0b0';g.fillRect(0,0,256,48);g.fillStyle='#c02830';for(let i=-2;i<14;i++){g.beginPath();g.moveTo(i*22,0);g.lineTo(i*22+11,0);g.lineTo(i*22-5,48);g.lineTo(i*22-16,48);g.fill()}g.fillStyle='#1c1e22';g.fillRect(30,5,196,38);g.fillStyle='#ffd24a';g.font='700 32px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('CHEWABLES',128,25);
 return chSignMat.m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)})}
/* ======================= the Chewables page (Zombies menu) ======================= */
var CHF='own',CHSEL=null,CHMSG='';
function chPanel(){const el=document.getElementById('p-chew');if(!el)return;const active=document.activeElement,own=CG.own,tot=Object.values(own).reduce((a,b)=>a+b,0),kinds=Object.keys(own).filter(k=>own[k]>0).length,sel=CG.sel.filter(i=>own[i]>0),
  f=CHF,list=CHEW.filter(c=>f=='all'||(f=='own'?own[c[0]]>0:c[2]==f));
 if(!CHSEL||!CGD[CHSEL])CHSEL=sel[0]||(CHEW.find(c=>own[c[0]]>0)||CHEW[0])[0];const cd=CGD[CHSEL],have=own[CHSEL]||0,eq=sel.includes(CHSEL),focus=el.contains(active)&&Object.keys(active.dataset).find(key=>['e','f','t','u'].includes(key)),gs=el.querySelector('.cw-grid'),sc=gs?gs.scrollTop:0;
 const ball=(id,k)=>`<span class="cw-ball ${k||''}">${chIcon(id)}</span>`,fl=[['all','All'],['own','Owned'],['s','Standard'],['m','Community'],['c','Cosmetic'],['r','Rare'],['u','Ultra-rare']];
 let h=`<div class="cw">${CG.tamper?'<div class="cw-warn"><b>Collection cleared</b><span>The saved Chewables did not match this device, so they were removed.</span></div>':''}${CG.ver?'':'<div class="cw-warn"><b>Loading</b><span>Checking your collection…</span></div>'}<header class="panel-head cw-hd"><h2>Chewables</h2><p class="sub">${kinds} of ${CHEW.length} collected · ${tot} uses left</p></header>
 <div class="cw-pk"><h3>Your pack <small>${sel.length} / 5 equipped</small></h3><div class="cw-slots">`;
 for(let i=0;i<5;i++){const id=sel[i],d=id&&CGD[id];h+=d?`<button class="cw-s on t-${d.tr}" data-u="${id}" style="--c:${chHex(d.c)}" title="Take out of the pack">${ball(id)}<b>${d.n}</b><small>×${own[id]} · ${CGT[d.tr]}</small><em>${i+1}</em></button>`:`<div class="cw-s"><span class="cw-ball empty">+</span><b>Empty slot</b><em>${i+1}</em></div>`}
 h+=`</div></div><div class="cw-main"><div class="cw-col"><div class="cw-fl">${fl.map(([k,n])=>`<button data-f="${k}" class="${f==k?'on':''}">${n}</button>`).join('')}</div><div class="cw-grid">`;
 for(const c of list){const id=c[0],d=CGD[id],n=own[id]||0;h+=`<button class="cw-t t-${d.tr}${n?'':' lock'}${sel.includes(id)?' eq':''}${id==CHSEL?' sel':''}" data-t="${id}" style="--c:${chHex(d.c)}">${ball(id)}<b>${d.n}</b><small>${n?CGT[d.tr]:'Not found yet'}</small>${n?`<em>×${n}</em>`:''}${sel.includes(id)?'<u>PACK</u>':''}</button>`}
 if(!list.length)h+='<p class="cw-none">Nothing here yet. Chewables drop at the end of every tenth round.</p>';
 h+=`</div></div><aside class="cw-dt t-${cd.tr}" style="--c:${chHex(cd.c)}"><div class="cw-big">${ball(CHSEL,'sample')}</div><small class="cw-tr">${CGT[cd.tr]} · ${CGY[cd.ty]}</small><h3>${cd.n}</h3><p>${cd.d}</p>
 <div class="cw-hv">${have?`<b>×${have}</b><span>left in your collection</span>`:`<b>0</b><span>not found yet · earn it by surviving rounds</span>`}</div>
 <button class="cw-eq${eq?' on':''}" data-e="${CHSEL}" ${have?'':'disabled'}>${have?(eq?'Take out of pack':'Add to pack'):'Not in your collection'}</button><div class="cw-msg">${CHMSG}</div>
 <div class="cw-info"><b>How you get them</b><span>Survive 10 rounds in a Zombies run and 1 to 3 random Chewables drop into your collection. Every gumball you roll uses one up.</span></div></aside></div></div>`;
 el.innerHTML=h;const g2=el.querySelector('.cw-grid');if(g2)g2.scrollTop=sc;if(focus)(el.querySelector('[data-'+focus+'="'+active.dataset[focus]+'"]:not(:disabled)')||el.querySelector('.cw-t.sel'))?.focus({preventScroll:true})}
function chEquip(id){const own=CG.own;CHMSG='';if(!(own[id]>0)){CHMSG='You have not found this one yet.'}else if(CG.sel.includes(id))CG.sel=CG.sel.filter(i=>i!==id);else if(CG.sel.length>=5)CHMSG='Your pack is full. Take one out first.';else{CG.sel.push(id)}CG.sel=CG.sel.filter(i=>own[i]>0);cgSave();chPanel()}
{const el=document.getElementById('p-chew'),nb=document.querySelector('#nav button[data-p=chew]');
 if(el){el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.f){CHF=b.dataset.f;chPanel()}else if(b.dataset.t){CHSEL=b.dataset.t;CHMSG='';chPanel()}else if(b.dataset.u){CHSEL=b.dataset.u;chEquip(b.dataset.u)}else if(b.dataset.e&&!b.disabled)chEquip(b.dataset.e)});
  /* keyboard and controller: arrows move over the grid, Enter adds or removes the gum under the cursor */
  el.addEventListener('keydown',e=>{const t=e.target.closest&&e.target.closest('.cw-t');if(!t)return;const ts=[...el.querySelectorAll('.cw-t')],i=ts.indexOf(t);let n=null;
   if(e.key=='ArrowRight')n=ts[i+1];else if(e.key=='ArrowLeft')n=ts[i-1];else if(e.key=='ArrowDown'||e.key=='ArrowUp'){const r=t.getBoundingClientRect(),dir=e.key=='ArrowDown'?1:-1;let best=1e9;for(const o of ts){const q=o.getBoundingClientRect(),dy=(q.top-r.top)*dir;if(dy<8)continue;const sc=dy*3+Math.abs(q.left-r.left);if(sc<best){best=sc;n=o}}}
   else if(e.key=='Enter'){e.preventDefault();CHSEL=t.dataset.t;chEquip(CHSEL);return}
   if(n){e.preventDefault();CHSEL=n.dataset.t;CHMSG='';chPanel();const f=el.querySelector('.cw-t.sel');if(f){f.focus();f.scrollIntoView({block:'nearest'})}}})}
 if(nb)nb.addEventListener('click',()=>{cgLoad();CHSEL=null;CHMSG='';setTimeout(chPanel,0)})}

cgBoot();
/* ---- sounds: soft sines only; the chime climbs with the rarity ---- */
function chSnd(k){if(k=='coin'){flTone(1800,1200,.08,.05,0,'sine');flTone(2400,1700,.06,.03,.03,'sine');flNoise(.05,3000,1500,.04,'highpass',.7)}
 else if(k=='crank'){for(let i=0;i<6;i++){flNoise(.03,2200+i*80,1400,.045,'bandpass',2,i*.07);flTone(220-i*6,180,.05,.03,i*.07,'sine')}}
 else if(k=='roll'){flNoise(.5,500,260,.07,'bandpass',.8);flTone(120,80,.4,.05,0,'sine')}
 else if(k=='drop'){flTone(300,200,.1,.08,0,'sine');flTone(600,420,.08,.04,.1,'sine');flNoise(.05,1500,700,.05,'bandpass',1.4,.02)}
 else if(k=='pop'){const f=[523,659,784];f.forEach((x,i)=>flTone(x,x,.5,.05,i*.07,'sine'))}
 else if(k=='rare'){const f=[523,659,784,1046];f.forEach((x,i)=>{flTone(x,x,.7,.05,i*.07,'sine');flTone(x*2,x*2,.5,.015,i*.07,'sine')})}
 else if(k=='ultra'){const f=[523,659,784,1046,1318,1568];f.forEach((x,i)=>{flTone(x,x,.9,.05,i*.06,'sine');flTone(x*2,x*2,.7,.02,i*.06,'triangle',6000)});flNoise(.8,2000,7000,.04,'bandpass',.6,.1)}
 else if(k=='dud'){flTone(300,160,.4,.06,0,'sine')}}
/* ---- the gumball machine: red cast base, chrome neck, glass globe full of coloured gumballs, a crank and a chute ---- */
function chMachine(){const T=THREE,g=new T.Group(),G=HV.G(),L=c=>new T.MeshLambertMaterial({color:c}),metal=new T.MeshLambertMaterial({color:0xd8dce0});if(metal.metalness!==undefined){metal.metalness=.9;metal.roughness=.25}
 const red=L(0xc02830),dk=L(0x1c1e22),glass=new T.MeshLambertMaterial({color:0xcfe8ff,transparent:true,opacity:.22}),cap=L(0xe8c030),
 cy=(rt,rb,h,x,y,z,m,sg_)=>{const e=new T.Mesh(new T.CylinderGeometry(rt,rb,h,sg_||18),m);e.position.set(x,y,z);g.add(e);return e},
 sp=(r,x,y,z,m,sy)=>{const e=new T.Mesh(new T.SphereGeometry(1,16,12),m);e.scale.set(r,r*(sy||1),r);e.position.set(x,y,z);g.add(e);return e};
 cy(.38,.42,.08,0,.04,0,dk);cy(.3,.36,.55,0,.35,0,red);cy(.31,.31,.05,0,.2,0,metal);cy(.31,.31,.05,0,.55,0,metal);cy(.14,.2,.18,0,.68,0,metal);cy(.2,.14,.06,0,.78,0,metal);
 const globe=new T.Group();globe.position.y=1.12;g.add(globe);const gm=new T.Mesh(new T.SphereGeometry(.42,28,20),glass);globe.add(gm);const rim=new T.Mesh(new T.TorusGeometry(.4,.03,8,32),metal);rim.rotation.x=Math.PI/2;rim.position.y=-.28;globe.add(rim);
 const cols=[0xff4a5a,0x4ac8ff,0xffd84a,0x6aff7a,0xff8ad8,0xff9a3a],parts={};for(let i=0;i<cols.length;i++)parts[i]=[];const R=MK.rnd(5);
 for(let i=0;i<130;i++){let x,y,z;do{x=(R()*2-1)*.36;y=(R()*2-1)*.36;z=(R()*2-1)*.36}while(x*x+y*y+z*z>.1296||y>.2-Math.abs(x)*.05&&y>.15);parts[i%6].push({g:G.sp,sx:.056,sy:.056,sz:.056,x,y:y-.05,z,rx:0,ry:0,rz:0})}
 for(const i in parts){const m=new T.Mesh(HV.merge(parts[i]),new T.MeshLambertMaterial({color:cols[i],emissive:cols[i],emissiveIntensity:.18}));globe.add(m)}
 g.userData.gum=globe;
 cy(.31,.31,.06,0,1.57,0,metal);cy(.36,.28,.12,0,1.65,0,red);cy(.04,.04,.12,0,1.74,0,metal);sp(.07,0,1.81,0,cap);
 const plate=new T.Mesh(G.bx,L(0xf0ecdc));plate.scale.set(.34,.2,.03);plate.position.set(0,.5,.33);g.add(plate);const slot=new T.Mesh(G.bx,dk);slot.scale.set(.02,.1,.02);slot.position.set(-.06,.54,.35);g.add(slot);
 const knob=new T.Group();knob.position.set(.07,.5,.355);g.add(knob);const kc=new T.Mesh(new T.CylinderGeometry(.075,.075,.04,16),metal);kc.rotation.x=Math.PI/2;knob.add(kc);const kb=new T.Mesh(G.bx,metal);kb.scale.set(.15,.035,.03);kb.position.z=.03;knob.add(kb);g.userData.knob=knob;
 const chute=new T.Mesh(G.bx,dk);chute.scale.set(.22,.14,.05);chute.position.set(0,.24,.34);g.add(chute);const flap=new T.Mesh(G.bx,metal);flap.scale.set(.2,.12,.015);flap.position.set(0,.24,.37);g.add(flap);g.userData.flap=flap;
 const lab=new T.Mesh(G.bx,chSignMat());lab.scale.set(.52,.1,.012);lab.position.set(0,.33,.315);lab.rotation.x=-.12;g.add(lab);
 for(const s of[-1,1])cy(.04,.05,.1,s*.3,0,.2,dk);
 const bulb=new T.Sprite(new T.SpriteMaterial({map:HV.auraTex(),color:0xffd070,transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending,fog:false}));bulb.scale.set(2.3,2.3,1);bulb.position.set(0,1.2,0);g.add(bulb);g.userData.bulb=bulb;
 const ring=new T.Mesh(new T.RingGeometry(.6,.82,40),new T.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;g.add(ring);g.userData.ring=ring;
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
/* ---- drawing a gum ---- */
function chDraw(mc){if(mc.busy||P.dead||mode!='Zombies')return;if(!CG.ver){msg('Chewables are loading…',1.6);return}const c=chCost();if(zq.pts<c)return zf('Not enough points');
 CG.pool=CG.pool.filter(i=>(CG.own[i]||0)>0);if(!CG.pool.length)CG.pool=chShuffle(chDeck());if(!CG.pool.length){msg('Your pack is empty · pick Chewables in the Zombies menu',2.8);chSnd('dud');return}const id=CG.pool.pop();CG.own[id]--;if(CG.own[id]<=0)delete CG.own[id];cgSave();zq.pts-=c;CG.draws++;mc.busy=1;mc.t=0;mc.id=id;mc.ph=0;chSnd('coin');mc.knobFx=1;
 setTimeout(()=>chSnd('crank'),260);setTimeout(()=>chSnd('roll'),1050);setTimeout(()=>{chSnd('drop');mc.ph=2},1550);
 mc.id=id}
function chMachTick(dt){for(const mc of CG.mach){const u=mc.g.userData;if(u.gum)u.gum.rotation.y+=dt*(mc.busy?5:.35);if(u.bulb)u.bulb.material.opacity=.4+.12*Math.sin(t0*3+mc.x);if(u.ring)u.ring.material.opacity=.22+.16*Math.sin(t0*2.2+mc.x);
  if(!mc.busy)continue;mc.t+=dt;const t=mc.t;
  if(t<1.1){u.knob.rotation.z=-Math.PI*2*(Math.min(1,(t-.25)/.8))*(t>.25?1:0);u.gum.rotation.y+=dt*10;if(Math.random()<dt*14)burst(V(mc.x,1.1,mc.z),1,CGD[mc.id].c,1.4,.5,.05)}
  else if(t<1.6){u.flap.rotation.x=-.9*Math.min(1,(t-1.1)/.2)}
  if(t>=1.55&&!mc.ball){const col=CGD[mc.id].c,b=new THREE.Mesh(new THREE.SphereGeometry(.07,14,10),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.6)}));b.position.set(mc.x+Math.sin(mc.g.rotation.y)*.4,.25,mc.z+Math.cos(mc.g.rotation.y)*.4);S.add(b);mc.ball={m:b,vy:-.5,p:V(b.position.x,b.position.y,b.position.z),bn:0}}
  if(mc.ball){const bl=mc.ball;bl.vy-=14*dt;bl.m.position.y+=bl.vy*dt;bl.m.position.x+=Math.sin(mc.g.rotation.y)*dt*.6;bl.m.position.z+=Math.cos(mc.g.rotation.y)*dt*.6;if(bl.m.position.y<.07){bl.m.position.y=.07;bl.vy=bl.bn>=3?0:Math.abs(bl.vy)*.45;bl.bn++;if(bl.bn<=4)flTone(900+bl.bn*200,800,.06,.03,0,'sine')}
   if(t>2.5&&!mc.off){mc.off=1;const p=V(bl.m.position.x,.2,bl.m.position.z);burst(p,22,CGD[mc.id].c,5,.8,.09);burst(p,8,0xffffff,7,.4,.05);try{JX.flash(p,CGD[mc.id].c,3,.5,18)}catch(e){}u.flap.rotation.x=0;u.knob.rotation.z=0;chOffer(mc)}
   if(mc.off){bl.m.scale.setScalar(1+.12*Math.sin(t0*6))}}}}
/* ---- state helpers ---- */
var gmLive=A=>{if(!A)return false;const t=A.d.ty;if(t=='rnd')return A.left>0;if(t=='time')return A.t>0;if(t=='act')return A.ch>0||A.run>0;if(t=='evt')return(A.id=='second'||A.id=='retain')?A.left>0:A.ch>0;return false},gmOn=id=>!!(CG.A&&CG.A.id==id&&gmLive(CG.A)),gmRun=id=>!!(CG.A&&CG.A.id==id&&CG.A.run>0),zs_=()=>bots.filter(b=>b.zom&&b.al&&!b.zp);
function chStart(id){const d=CGD[id],A={id,d,left:0,t:0,ch:0,run:0,data:{}};if(d.ty=='rnd')A.left=d.cnt;else if(d.ty=='time')A.t=d.cnt;else if(d.ty=='act')A.ch=d.cnt;else if(d.ty=='evt'){if(id=='second'||id=='retain')A.left=d.cnt;else A.ch=d.cnt}
 if(id=='slotunc')zq.cap=Math.max(zq.cap,8);if(id=='infusion')A.data.ele=Math.random()<.5?'shock':'fire';return A}
function chEnd(A){if(!A)return;try{const id=A.id;if(id=='overclock'&&CG.ocB){const o=CG.ocB;CG.ocB=null;if(wp[o.i]&&wp[o.i].k==o.b.k){wp[o.i]=Object.assign({},o.b);setGun()}}
 if(id=='heavy'&&CG.hvB){const o=CG.hvB;CG.hvB=null;if(wp[o.i]){wp[o.i]=Object.assign({},o.b);setGun()}}
 if(id=='freeze')chThaw();if(id=='swift'){for(const w of wp)if(w.adB){w.ad=w.adB;w.adB=null}}if(id=='thermalh')CG.th=0;
 A.run=0}catch(e){}}
function chInstant(id){if(id=='capx'){zq.cap++;msg('One more weapon slot',2)}else if(id=='maxup'){const p=zq.pts;zq.pts=1e6;for(const k of zAvailablePerks()){try{zPerk(k)}catch(e){}}zq.pts=p;msg('Every perk, yours',2)}try{LX.fx.heal=1}catch(e){}}
function chReveal(id){const d=CGD[id];if(chPrem(id)){if((CG.stock[id]||0)<=0){msg(d.n+' crumbles: out of stock',2);chSnd('dud');return}CG.stock[id]--;cgSave()}
 chSnd(d.tr=='u'?'ultra':d.tr=='r'?'rare':'pop');
 if(d.ty=='cos'){CG.cos[id]=1;msg(d.n+' · '+CGT[d.tr],2);return}
 if(d.ty=='ins'){msg(d.n,2);chInstant(id);return}
 if(CG.A&&gmLive(CG.A))msg('Swapped '+CG.A.d.n+' for '+d.n,2);else msg(d.n+' · '+CGY[d.ty],2);chEnd(CG.A);CG.A=chStart(id)}
CG.cos={};
/* ---- using a player-activated gum (key J, D-pad left) ---- */
function chUse(){const A=CG.A;if(!A||P.dead||!run||paused||mode!='Zombies'||!gmLive(A)||A.d.ty!='act'||A.run>0&&A.d.run>0)return;const id=A.id,z=zq,ok=x=>{if(x===false)return;A.ch--;if(A.d.run>0)A.run=A.d.run;chSnd('pop');if(A.ch<=0&&!(A.run>0))setTimeout(()=>{if(CG.A===A&&!gmLive(A))CG.A=null},300)},fwd=aimDir();
 const spot=(k)=>{const x=P.x+fwd.x*1.8,zz=P.z+fwd.z*1.8,[fx,fz]=zFreeSpot(x,zz);zPuSpawn(z.puId++,k,fx,fz)};
 switch(id){
  case'ghost':case'stasis':case'freeze':case'crowd':case'thermalh':case'alchemy':case'overclock':case'heavy':case'discount':case'infusion':
   if(id=='overclock'){const i=cur,w=wp[i];if(!w||w.k=='Fists')return msg('Hold a gun first',1.4);CG.ocB={i,b:{...w}};for(let n=0;n<3;n++)if((w.pap||0)<3)zPap(w);setGun();rel=0}
   if(id=='heavy'){const i=cur,w=wp[i];CG.hvB={i,b:{...w}};const hw=zGunObj('CY');hw.pap=2;hw.pm=3.6;hw.pn='Cyclone Minigun';wp[i]=hw;cur=i;setGun();rel=0}
   if(id=='crowd'){let n=0;for(const b of zs_())if(Math.hypot(b.x-P.x,b.z-P.z)<16){b.crawlT=12;n++;burst(V(b.x,1,b.z),6,0x50c0d0,3,.4,.06)}msg(n?n+' zombies slowed to a crawl':'Nothing nearby',1.5)}
   if(id=='discount'){CG.disc=45;CG.ptsL=zq.pts;msg('Half-price for 45 seconds',2)}
   if(id=='thermalh'){CG.th=15}
   if(id=='freeze'){CG.fzOn=1;CG.fz=[]}
   if(id=='ghost'){burst(V(P.x,1,P.z),24,0x9aa6c8,3,.8,.1)}
   return ok();
  case'escape':{let best=null,bs=-1;for(let i=0;i<48;i++){const a=Math.random()*6.283,d=12+Math.random()*MAPS[sel.map].H*.8,[x,zz]=zFreeSpot(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d);if(Math.abs(x)>MAPS[sel.map].H-4||Math.abs(zz)>MAPS[sel.map].H-4)continue;let md=1e9;for(const b of zs_())md=Math.min(md,Math.hypot(b.x-x,b.z-zz));if(md>bs){bs=md;best=[x,zz]}}
   if(!best)return false;const ox=P.x,oz=P.z;for(const b of zs_()){const dx=b.x-ox,dz=b.z-oz,d=Math.hypot(dx,dz);if(d<7){b.stun=Math.max(b.stun||0,2);try{b.x+=dx/(d||1)*4;b.z+=dz/(d||1)*4}catch(e){}}}
   burst(V(ox,1,oz),40,0x58e0ff,8,.7,.12);P.x=best[0];P.z=best[1];burst(V(P.x,1,P.z),40,0x58e0ff,8,.7,.12);eqRing(V(ox,.1,oz),.5,7,.5,0x58e0ff,.8);eqRing(V(P.x,.1,P.z),.5,5,.5,0x58e0ff,.8);flTone(300,1400,.35,.06,0,'sine');shake=Math.max(shake,.6);try{LX.fx.pulse=1}catch(e){}return ok()}
  case'nukedrop':spot('nuke');return ok();case'resupply':spot('ammo');return ok();
  case'gift':spot(['ammo','insta','dbl','nuke','heal','fire'][Math.random()*6|0]);return ok();
  case'repair':spot('heal');z.pts+=500;msg('Repaired · +500',1.6);return ok();
  case'bonus':{const available=zAvailablePerks();if(!available.length){msg('No perks available',1.6);return false}const k=available[Math.random()*available.length|0],p=z.pts;z.pts=1e6;zPerk(k);z.pts=p;return ok()}
  case'wealth':z.pts+=15000;burst(V(P.x,1.4,P.z),30,0xffd820,5,.8,.1);msg('+15,000',1.8);return ok();
  case'reviver':{let n=0;for(const b of bots)if(b.net&&b.dn){n++;try{netSend({t:'zqv',to:b.id});if(isHost)zNet({t:'zqv',to:b.id,id:myId})}catch(e){}}if(!n){msg('Nobody is down',1.4);return false}msg('Squad revived',2);return ok()}
  case'reroll':{let done=0;for(let i=0;i<zboxes.length;i++){const o=zboxes[i];if(o.on&&o.st==2){zBoxEnd(o,i,false);zBoxStart(o,i,zMe());done=1;break}}if(!done){msg('Use it while a Mystery Box shows a weapon',2);return false}return ok()}
  case'skip':{for(const b of zs_())zDamage(b,9e9,0,zMe(),'',false);z.toSpawn=0;z.pts+=2000;try{if(z.hound)z.hound.done=1}catch(e){}msg('PHASE SKIP · +2,000',2);burst(V(P.x,1,P.z),50,0xd070ff,10,1,.14);return ok()}
 }}
/* ---- every frame ---- */
function chTick(dt){chMachTick(dt);chRw();chBubTick(dt);chHud();chFx();if(!run||paused||mode!='Zombies'||!zq||P.dead&&!(zq.down))return;const z=zq,A=CG.A,live=gmLive(A),w=cw();CG.tk+=dt;
 if(A){if(A.d.ty=='time'&&A.t>0){A.t-=dt;if(A.t<=0){chEnd(A);msg(A.d.n+' ended',1.4)}}if(A.run>0){A.run-=dt;if(A.run<=0){chEnd(A);if(!gmLive(A))CG.A=null}}}
 if(CG.th>0){CG.th-=dt;if(CG.th<=0)CG.th=0}
 /* gamepad: D-pad left */
 try{const gp=navigator.getGamepads?navigator.getGamepads():[];let pr=0;for(const g of gp)if(g&&g.buttons[14]&&g.buttons[14].pressed)pr=1;if(pr&&!CG.pad)chUse();CG.pad=pr}catch(e){}
 if(live&&w){switch(A.id){
  case'swift':if(!w.adB)w.adB=w.ad||1;w.ad=w.adB*1.9;break;
  case'feed':if(w.mag<w.m&&w.res>0){const tk=Math.min(w.m-w.mag,w.res);w.mag+=tk;w.res-=tk}rel=0;break;
  case'bottomless':w.mag=w.m;rel=0;break;
  case'ghost':if(A.run>0)for(const b of zs_())b.stun=Math.max(b.stun||0,.25);break;
  case'stasis':if(A.run>0){const f=aimDir();for(const b of zs_()){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz)||1;if(d<40&&(dx*f.x+dz*f.z)/d>.82&&navLos(P.x,P.z,b.x,b.z)){b.stun=Math.max(b.stun||0,.3);if(Math.random()<dt*6)burst(V(b.x,1,b.z),1,0x90f0ff,1,.5,.06)}}}break;
  case'freeze':if(A.run>0)for(const b of zs_())b.stun=Math.max(b.stun||0,.3);break;
  case'alchemy':if(A.run>0&&CG.ptsL!=null){const d=z.pts-CG.ptsL;if(d>0){z.pts-=d;w.res=Math.min(w.m*10,w.res+d*.06)}}break;
  case'discount':if(A.run>0&&CG.ptsL!=null){const d=CG.ptsL-z.pts;if(d>=80){z.pts+=Math.floor(d*.5);burst(V(P.x,1.5,P.z),8,0xffd040,3,.6,.08)}}break;
  case'shared':if(CG.ptsL!=null){const d=z.pts-CG.ptsL;if(d>0&&d<5000)z.pts+=Math.floor(d*.25)}break;
  case'arsenal':CG.arsT-=dt;if(CG.arsT<=0){CG.arsT=10;const ks=Object.keys(ZWP).filter(k=>k!='TEA'&&k!=w.k);const k=ks[Math.random()*ks.length|0];zGive(k);const nw=wp[cur];if(nw){zPap(nw);zPap(nw);setGun()}burst(V(P.x,1.3,P.z),20,0xff5ac8,5,.6,.08)}break;
  case'slotunc':z.cap=Math.max(z.cap,8);break;
  case'selfrest':break;
  case'dropext':for(const d of z.drops)if(!d.ext){d.ext=1;d.life*=2}break;
  case'slippery':{const sl=ST.slide>0;CG.tr=(CG.tr||0)-dt;if(sl&&CG.tr<=0){CG.tr=.1;CG.trail.push({x:P.x,z:P.z,t:7,m:null})}break}}}
 /* the slick trail: zombies that touch it slip, fall and burst apart */
 for(let i=CG.trail.length-1;i>=0;i--){const t=CG.trail[i];t.t-=dt;if(!t.m){const m=new THREE.Mesh(new THREE.CircleGeometry(.7,14),new THREE.MeshBasicMaterial({color:0x60e0a0,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;m.position.set(t.x,.04,t.z);S.add(m);t.m=m}t.m.material.opacity=Math.min(.35,t.t*.1);
  for(const b of zs_()){if(b.slip||b.hound)continue;if(Math.hypot(b.x-t.x,b.z-t.z)<.85){b.slip=1;b.stun=3;CG.slip.push({b,t:.9})}}if(t.t<=0){S.remove(t.m);t.m.geometry.dispose();t.m.material.dispose();CG.trail.splice(i,1)}}
 for(let i=CG.slip.length-1;i>=0;i--){const s=CG.slip[i];s.t-=dt;if(s.b.m)s.b.m.rotation.x=Math.min(1.4,(1-s.t/.9)*1.4);if(s.t<=0){const b=s.b;CG.slip.splice(i,1);if(!b.al)continue;const p=V(b.x,.6,b.z);burst(p,34,0x60e0a0,7,.8,.14);burst(p,14,0xffffff,8,.5,.08);flNoise(.25,1800,200,.12,'lowpass');flTone(90,40,.4,.14,0,'sine');for(const o of zs_())if(o!==b&&Math.hypot(o.x-b.x,o.z-b.z)<3.2)zDamage(o,200+z.r*30,0,zMe(),'',false);zDamage(b,9e9,0,zMe(),'',false);if(b.m)b.m.rotation.x=0}}
 /* temporal freeze ends: everything you dealt lands at once */
 if(CG.fzOn&&!(gmRun('freeze')))chThaw();
 /* reverse graviton: the dead rise */
 for(const b of bots){if(b.grv){b.grv.t+=dt;b.m.position.y=(b.y||0)+b.grv.t*b.grv.vy+b.grv.t*b.grv.t*1.5;b.m.rotation.x+=dt*b.grv.sp;b.m.rotation.z+=dt*b.grv.sp*.6;if(b.grv.t>3&&b.m.visible){b.m.visible=false;burst(V(b.m.position.x,b.m.position.y,b.m.position.z),20,0xb070ff,5,.8,.1)}}}
 /* crawling zombies, ducks, the vintage grain */
 for(const b of zs_()){if(b.crawlT>0){b.crawlT-=dt}if(CG.cos.squeak&&!CG.duck.has(b)&&b.rig){CG.duck.add(b);const d=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({color:0xffe040,emissive:0xaa8800,emissiveIntensity:.3}));d.scale.set(.1,.085,.1);d.position.set(0,.3,0);const bk=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff8a1a}));bk.scale.set(.06,.02,.05);bk.position.set(0,-.01,.1);d.add(bk);b.rig.head.add(d)}}
 /* the kills: comedy sounds */
 if(typeof kills!='undefined'){if(kills>CG.k0){if(CG.cos.comedy)chComedy();CG.k0=kills;}else CG.k0=kills}
 /* stored stock: events that need the player to be downed */
 if(A&&A.id=='selfrest'&&gmLive(A)&&P.dead&&z.down&&netOn&&typeof kills!='undefined'&&kills>CG.k1){A.ch--;zRespawn()}CG.k1=typeof kills!='undefined'?kills:0;
 CG.ptsL=z.pts}
CG.k0=0;CG.k1=0;
function chThaw(){CG.fzOn=0;for(const o of CG.fz){if(o.b.al&&o.d>0)zDamage(o.b,o.d,0,zMe(),'',false)}CG.fz=[];try{LX.fx.pulse=1;flNoise(.4,3000,300,.1,'lowpass');flTone(300,60,.5,.12,0,'sine')}catch(e){}}
function chComedy(){const k=Math.random()*5|0;if(k==0){flTone(900,300,.6,.07,0,'sine')}else if(k==1){flTone(180,420,.15,.08,0,'triangle',1200);flTone(420,200,.2,.07,.12,'triangle',1200)}else if(k==2){flTone(300,300,.25,.07,0,'sawtooth',900);flTone(260,260,.2,.06,.2,'sawtooth',900)}else if(k==3){for(let i=0;i<4;i++)flTone(500+i*140,520+i*140,.07,.06,i*.07,'sine')}else{flTone(1400,500,.25,.06,0,'sine');flTone(200,90,.3,.08,.2,'sine')}}
function chSqueak(){flTone(1700,2400,.09,.07,0,'sine');flTone(2400,1500,.1,.05,.07,'sine')}
/* ---- the hooks ---- */
{const _s=zsm;zsm=()=>_s()*(gmOn('swift')&&ST.ads>.4?1.4:1)*(gmOn('pace')?2:1)}
{const _r=zrl;zrl=()=>_r()*(gmOn('dex')?.65:1)}
{const _g=rng;rng=()=>_g()||gmOn('mobile')}
{const _m=zMeleeStats;zMeleeStats=function(m){const s=_m.apply(this,arguments);if(gmOn('sledge'))s.d=(s.d||m.d)*5;return s}}
{const _h=hurt;hurt=function(d,b){if(mode=='Zombies'){if(gmOn('blast')&&CG.exp)return;if(gmRun&&gmOn('invuln')&&b&&b.zom)return;if(gmOn('thermal')&&b&&b.zom&&!CG.thB){CG.thB=1;CG.A.ch--;const p=V(P.x,.2,P.z);eqFire(p,3.6,4,50,1);for(const o of zs_()){if(Math.hypot(o.x-P.x,o.z-P.z)<4.5){o.burn=3;o.stun=Math.max(o.stun||0,.7)}}setTimeout(()=>{CG.thB=0},400)}}return _h.apply(this,arguments)}}
{const _b=boom;boom=function(){CG.exp=1;try{return _b.apply(this,arguments)}finally{CG.exp=0}}}
{const _zd=zDamage;zDamage=function(b,d,head,by,k,mel){if(CG.fzOn&&b&&b.zom&&!b.hound&&!b.dead){let o=CG.fz.find(x=>x.b===b);if(!o){o={b,d:0};CG.fz.push(o)}o.d+=d;if(by==zMe()){hits++;$('#hm').className='on';hmT=.12}return}
  const r=_zd.apply(this,arguments);try{if(by==zMe()&&b){if(mel&&gmOn('shock')&&CG.A.ch>0){CG.A.ch--;let n=0;let prev=V(b.x,1.2,b.z);for(const o of zs_()){if(o===b||n>=4)continue;if(Math.hypot(o.x-b.x,o.z-b.z)<6){n++;const q=V(o.x,1.2,o.z);eqArc(prev,q);prev=q;_zd.call(this,o,Math.max(30,d*.5),0,by,'',false)}}flTone(2400,300,.2,.06,0,'sine');flNoise(.12,4000,1500,.06,'highpass',.8)}
   if(!mel&&k&&gmOn('infusion')&&CG.A.run>0){const e=CG.A.data.ele;if(e=='shock'&&Math.random()<.5){let n=0;let prev=V(b.x,1.2,b.z);for(const o of zs_()){if(o===b||n>=2)continue;if(Math.hypot(o.x-b.x,o.z-b.z)<5){n++;const q=V(o.x,1.2,o.z);eqArc(prev,q);prev=q;_zd.call(this,o,Math.max(20,d*.3),0,by,'',false)}}}else if(e=='fire'){b.burn=3;if(!b.al&&!b.fx_){b.fx_=1;burst(V(b.x,1,b.z),24,0xff7a22,7,.7,.12);for(const o of zs_())if(Math.hypot(o.x-b.x,o.z-b.z)<3)_zd.call(this,o,150+zq.r*20,0,by,'',false)}}}}}catch(e){}return r}}
{const _zh=zHit;zHit=function(b,d,head,scale=1){if(scale===1&&gmOn('precision')){head=true}return _zh.call(this,b,d,head,scale)}}
{const _pt=zPuTry;zPuTry=function(b){if(gmOn('cascade')){for(let i=0;i<3;i++){zq.puRound=0;_pt.call(this,b)}}return _pt.apply(this,arguments)}}
{const _pk=zPick;zPick=function(by){if(gmOn('wonder')&&by==zMe()&&CG.A){CG.A.ch=0;CG.A=null;return sel.map===JUPITER_MAP?'KEY':zq.tea||sel.map=='London'?'TEA':'RG'}return _pk.apply(this,arguments)}}
{const _dn=zDown;zDown=function(){const z=zq;if(z&&gmOn('aura')&&!CG.auraUsed){CG.auraUsed=1;endDeath();P.dead=0;P.hp=P.mhp;P.sh=P.msh;z.down=0;P.rt=0;P.fall=null;msg('AURA REVIVE',2.2);burst(V(P.x,1,P.z),50,0xfff0a0,9,1,.14);eqRing(V(P.x,.1,P.z),.5,7,.6,0xfff0a0,.8);flTone(523,1046,.7,.08,0,'sine');flTone(784,1568,.7,.05,.1,'sine');try{LX.fx.pulse=1;LX.fx.heal=1}catch(e){}return}
  const snap=z?{...z.perks}:null,keep=z&&gmOn('retain'),r=_dn.apply(this,arguments);if(z&&keep&&snap){z.perks=snap;P.mhp=snap.vit?100:50;msg('Perks kept',1.6)}if(z&&z.down&&gmOn('bleed'))z.dnT=(z.dnT||45)*2.2;return r}}
{const _rs=zRespawn;zRespawn=function(){const z=zq,snap=z?{...z.perks}:null,keep=z&&(gmOn('retain')||gmOn('selfrest')||gmOn('second')&&false),r=_rs.apply(this,arguments);if(z&&keep&&snap){z.perks=snap;P.mhp=snap.vit?100:50;P.hp=P.mhp}return r}}
{const _mv=zMove;zMove=function(dt){const sv=[];const slow=gmOn('slowaura');for(const b of zs_()){if(slow||b.crawlT>0){sv.push([b,b.sp]);b.sp=Math.min(b.sp||1,b.crawlT>0?.9:1.15)}}try{return _mv.apply(this,arguments)}finally{for(const[b,s]of sv)b.sp=s}}}
{const _nr=zNewRound;zNewRound=function(){const r=_nr.apply(this,arguments);try{CG.draws=0;CG.auraUsed=0;const A=CG.A;if(A){if(A.d.ty=='rnd'||A.id=='second'||A.id=='retain'){A.left--;if(A.left<=0){chEnd(A);msg(A.d.n+' ended',1.4)}}}}catch(e){}return r}}
{const _rg=ragStart;ragStart=function(b){const r=_rg.apply(this,arguments);try{if(b&&b.zom&&!b.hound&&gmOn('graviton')){b.grv={t:0,vy:3+Math.random()*3,sp:2+Math.random()*3}}}catch(e){}return r}}
{const _ba=zBoxAct;zBoxAct=function(o,i){CG.inBox=1;try{return _ba.apply(this,arguments)}finally{CG.inBox=0}}}
{const _bw=zBuyWall;zBuyWall=function(k,pos){CG.inWall=1;try{return _bw.apply(this,arguments)}finally{CG.inWall=0}}}
{const _gv=zGive;zGive=function(k){const r=_gv.apply(this,arguments);try{if((CG.inBox&&gmOn('overcharge'))||(CG.inWall&&gmOn('wallup'))){const w=wp[cur];if(w&&w.k==k){CG.A.ch--;for(let n=0;n<3;n++)if((w.pap||0)<3)zPap(w);setGun();burst(V(P.x,1.3,P.z),30,0xff7a3a,6,.8,.1);msg('Fully upgraded',1.6)}}}catch(e){}return r}}
{const _mm=zBoxMoveStart;zBoxMoveStart=function(o,i){if(gmOn('lock')){CG.A.ch--;msg('LOOT LOCK: the box stays',2);try{EST.bx.uses=0}catch(e){}zBoxEnd(o,i);zBoxStart(o,i,o.by);return}return _mm.apply(this,arguments)}}
{const _ha=eqHandAnim;eqHandAnim=function(n,d,f){return _ha.call(this,n,gmOn('dex')?d*.6:d,f)}}
{const _jh=juiceHit;juiceHit=function(b,d,head){const r=_jh.apply(this,arguments);try{if(CG.cos.squeak&&b&&b.zom)chSqueak()}catch(e){}return r}}
{const _zs=zStart;zStart=function(){const r=_zs.apply(this,arguments);try{cgLoad();CG.A=null;CG.cos={};CG.draws=0;CG.pool=[];CG.trail.length=0;CG.slip.length=0;CG.fz=[];CG.fzOn=0;CG.th=0;CG.ocB=CG.hvB=null;CG.ptsL=null;CG.auraUsed=0;CG.rt=null;CG.pend=null;chAskUI(null);chBubKill();chPlace()}catch(e){console.warn('chewables',e)}return r}}
/* ---- the always-visible gum card, the effect overlay, the interaction for Universal Refill ---- */
function chHud(){if(!CG.hud){const h=document.getElementById('hud');if(!h)return;const e=document.createElement('div');e.id='gumhud';h.appendChild(e);CG.hud=e}
 const A=CG.A,live=run&&mode=='Zombies'&&A&&gmLive(A),id=live?A.id:'';
 if(id!==CG.hid){CG.hid=id;if(live){const d=A.d;CG.hud.innerHTML=`<svg class="gmr" viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="29"/><circle class="fg" cx="32" cy="32" r="29" stroke-dasharray="182.2" stroke-dashoffset="0"/></svg><i style="--c:${chHex(d.c)}">${chIcon(id)}</i>${d.ty=='act'?`<em>${ctlKey('gum')}</em>`:''}`;CG.hud.style.setProperty('--c',chHex(d.c));CG.hud.className='on';CG.hfg=CG.hud.querySelector('.fg')}else{CG.hud.innerHTML='';CG.hud.className='';CG.hfg=null}}
 if(live&&CG.hfg){const d=A.d,n=d.cnt||1,f=d.ty=='rnd'?A.left/n:d.ty=='time'?A.t/n:d.ty=='act'?(A.run>0&&d.run?A.run/d.run:A.ch/n):((A.id=='second'||A.id=='retain')?A.left/n:A.ch/n);CG.hfg.style.strokeDashoffset=(182.2*(1-Math.max(0,Math.min(1,f)))).toFixed(1);CG.hud.classList.toggle('run',A.run>0)}}
/* ---- after the drop: take the gum or leave it (leaving it puts it back in your collection), then flip it into your mouth and blow a bubble ---- */
function chOffer(mc){CG.pend={id:mc.id,mc,t:0};chSnd('rare');chAskUI(mc.id)}
function chAskUI(id){let e=document.getElementById('gmask');if(!e){e=document.createElement('div');e.id='gmask';document.body.appendChild(e)}
 if(!id){e.className='';return}const d=CGD[id];e.style.setProperty('--c',chHex(d.c));
 e.innerHTML=`<span class="cw-ball">${chIcon(id)}</span><div class="gq"><small>${CGT[d.tr]} · ${CGY[d.ty]}</small><b>${d.n}</b><p>${d.d}</p></div><div class="gk"><kbd>${ctlKey('use')}</kbd><span>Chew it</span><kbd>${typeof usingPad!='undefined'&&usingPad?'B':'X'}</kbd><span>Leave it</span></div>`;e.className='on t-'+d.tr}
function chPendEnd(mc){if(mc.ball){S.remove(mc.ball.m);mc.ball=null}mc.off=0;mc.busy=0;chAskUI(null)}
function chAccept(){const p=CG.pend;if(!p)return;CG.pend=null;chPendEnd(p.mc);CG.bub={id:p.id,t:0,on:0,chew:0}}
function chDecline(loud){const p=CG.pend;if(!p)return;CG.pend=null;CG.own[p.id]=Math.min(999,(CG.own[p.id]||0)+1);cgSave();if(loud){flTone(520,330,.12,.05,0,'triangle');try{burst(V(p.mc.x,.2,p.mc.z),10,0x9aa4ae,2,.5,.05)}catch(e){}}chPendEnd(p.mc)}
function chBubKill(){const B=CG.bub;if(!B)return;for(const k of['toss','bub']){if(B[k]){C.remove(B[k])}}CG.bub=null;try{if(!P.dead)gun.visible=true}catch(e){}}
function chBubTick(dt){
 const pd=CG.pend;if(pd){pd.t+=dt;if(P.dead||!run||pd.t>20||Math.hypot(P.x-pd.mc.x,P.z-pd.mc.z)>7)chDecline(0);else{const g=typeof gpGet=='function'?gpGet():null,a=!!(g&&g.buttons[0]&&g.buttons[0].pressed),b2=!!(g&&g.buttons[1]&&g.buttons[1].pressed);if(a&&!CG.pa)chAccept();else if(b2&&!CG.pb)chDecline(1);CG.pa=a;CG.pb=b2}}
 const B=CG.bub;if(!B)return;const d=CGD[B.id],col=d.c;
 if(P.dead||!run||mode!='Zombies'){CG.own[B.id]=Math.min(999,(CG.own[B.id]||0)+1);cgSave();chBubKill();return}
 if(!B.on){B.on=1;B.toss=new THREE.Mesh(new THREE.SphereGeometry(.035,14,10),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.5)}));C.add(B.toss);
  const bm=new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:.62,shininess:140,specular:0xffffff,emissive:col,emissiveIntensity:.2,side:THREE.DoubleSide,depthWrite:false});B.bub=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),bm);
  const hl=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false}));hl.position.set(-.45,.5,.62);B.bub.add(hl);B.bub.visible=false;C.add(B.bub);flNoise(.16,500,2400,.05,'bandpass',1.4)}
 B.t+=dt;const t=B.t;gun.visible=false;try{hideFP()}catch(e){}nf=Math.max(nf,t0+.1);
 if(t<.6){const u=t/.6,w=1-u,A_=[.26,-.30,-.42],Bc=[.16,.34,-.38],E=[0,-.07,-.1];B.toss.position.set(w*w*A_[0]+2*u*w*Bc[0]+u*u*E[0],w*w*A_[1]+2*u*w*Bc[1]+u*u*E[1],w*w*A_[2]+2*u*w*Bc[2]+u*u*E[2]);B.toss.scale.setScalar(1+.35*Math.sin(u*Math.PI))}
 else if(B.toss){C.remove(B.toss);B.toss=null;flTone(520,300,.07,.06,0,'sine');flNoise(.05,1500,800,.05,'lowpass',1)}
 if(t>.62&&t<1.7&&t-B.chew>.2){B.chew=t;flNoise(.05,2600,1400,.04,'bandpass',2);flTone(230+Math.random()*40,160,.05,.035,0,'sine');shake=Math.max(shake,.06)}
 if(t>=1.7&&!B.blow){B.blow=1;B.bub.visible=true;flNoise(1.1,900,3400,.035,'bandpass',1.2);flTone(300,980,1.1,.014,0,'sine')}
 if(B.blow){const u=Math.min(1,(t-1.7)/1.15),e=u*u*(3-2*u),r=.02+.3*e,wob=Math.sin(t*17)*.035*e;B.bub.position.set(0,-.11+.04*e,-.4);B.bub.scale.set(r*(1+wob),r*(1-wob),r);B.bub.material.opacity=.62-.22*e;if(u>.6)shake=Math.max(shake,.05*u)}
 if(t>=2.9){const f=aimDir();try{burst(V(C.position.x+f.x*.7,C.position.y+f.y*.7-.1,C.position.z+f.z*.7),30,col,3.2,.6,.045);burst(V(C.position.x+f.x*.7,C.position.y+f.y*.7-.1,C.position.z+f.z*.7),10,0xffffff,5,.35,.03)}catch(e){}
  flNoise(.05,6200,3200,.13,'highpass');flTone(900,190,.07,.1,0,'sine');flNoise(.2,2600,800,.05,'bandpass',1);chSplat(col);chBubKill();chReveal(B.id)}}
function chSplat(col){let e=document.getElementById('gmsplat');if(!e){e=document.createElement('div');e.id='gmsplat';document.body.appendChild(e)}e.style.setProperty('--c',chHex(col));e.className='';void e.offsetWidth;e.className='on'}
addEventListener('keydown',e=>{if(!CG.pend||e.repeat||!run||paused)return;const k=typeof RB=='function'?RB(e.code):e.code;if(k=='KeyF'){e.stopImmediatePropagation();e.preventDefault();chAccept()}else if(k=='KeyX'){e.stopImmediatePropagation();e.preventDefault();chDecline(1)}},true);
function chFx(){if(!CG.fxEl){const e=document.createElement('div');e.id='gmfx';document.body.appendChild(e);CG.fxEl=e}const on=run&&mode=='Zombies';let c='';if(on){if(gmRun('ghost'))c+=' g-ghost';if(gmRun('freeze')||CG.fzOn)c+=' g-freeze';if(gmRun('stasis'))c+=' g-stasis';if(CG.cos.vintage)c+=' g-vint';if(CG.th>0)c+=' g-th';if(CG.disc>0||gmRun('discount'))c+=' g-disc'}if(CG.fxEl.className!==c)CG.fxEl.className=c}
addEventListener('keydown',e=>{if(!e.repeat&&run&&!paused&&!over&&mode=='Zombies'&&(typeof RB=='function'?RB(e.code):e.code)=='KeyJ')chUse()});
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{chTick(dt)}catch(e){console.warn('chewables tick',e)}}}
/* Universal Refill: a refill point that follows you around while the gum is active */
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(mode=='Zombies'&&zq&&gmOn('refill')){if(!CG.refillE){CG.refillE={x:0,z:0,r:2.6,txt:()=>'Refill ammo from anywhere',cost:()=>cw()&&cw().res<cw().m*cw().rs?600:0,act:()=>{const w=cw();if(zq.pts<600)return zf('Not enough points');zq.pts-=600;w.res=w.m*w.rs;w.mag=w.m;burst(V(P.x,1.2,P.z),20,0x60ff90,5,.6,.08);flTone(600,1200,.2,.06,0,'sine')}};zi.push(CG.refillE)}const f=aimDir();CG.refillE.x=P.x-f.x*2;CG.refillE.z=P.z-f.z*2}else if(CG.refillE){const j=zi.indexOf(CG.refillE);if(j>=0)zi.splice(j,1);CG.refillE=null}}catch(e){}}}
/* ---- the gum picker: the CHEWABLES button on the home screen ---- */

/* ======================= EMOTES =======================
   Hold the emote key (K, or D-pad down) for a radial wheel, move the mouse (or right stick) to a slot, let go. You swing out into a third-person view, your weapon lowers, and your
   character plays the emote. Moving, firing, jumping or taking damage ends it. Other players see it: the emote id travels in the normal player-state message. */
var EMN=['Wave','Cheer','Dance','Flex','Salute','Clap','Shrug','Spin'],EMLEN=[2.6,3,7,3,2.2,3,2.2,1.6],
 EMI=[`<path d="M9 17V8a2 2 0 0 1 4 0v6M13 14V6a2 2 0 0 1 4 0v8M17 14V8a2 2 0 0 1 4 0v9c0 7-4 11-9 11-4 0-6-2-8-6l-1-6a2 2 0 0 1 3-1z"/>`,
 `<circle cx="16" cy="9" r="3"/><path d="M16 12v9M7 4l9 8 9-8M12 29l4-8 4 8"/>`,
 `<path d="M12 24V8l14-3v16"/><circle cx="9" cy="24" r="3"/><circle cx="23" cy="21" r="3"/>`,
 `<path d="M5 23c0-8 5-14 12-14 4 0 6 3 6 6 0 4-4 4-4 9"/><path d="M10 29h12"/>`,
 `<circle cx="14" cy="15" r="5"/><path d="M19 11l9-5M5 29v-6a9 9 0 0 1 18 0v6"/>`,
 `<path d="M12 6L6 15a3 3 0 0 0 5 3M20 6l6 9a3 3 0 0 1-5 3M12 21l4 6 4-6"/>`,
 `<circle cx="16" cy="8" r="3"/><path d="M3 21l9-5h8l9 5M16 11v14M10 29l6-3 6 3"/>`,
 `<path d="M26 16a10 10 0 1 1-4-8"/><path d="M26 4v6h-6"/>`],
 EMO={open:0,sel:-1,vx:0,vy:0,cur:null,av:null,pad:0};
for(const {name,length,path} of Object.values(PASS_EMOTES)){EMN.push(name);EMLEN.push(length);EMI.push(path)}
/* one pose for any rig: the same IK convention as the podium figures (shoulders at +-0.3, 1.5; hands are targets; hints bend the elbows) */
function emoPose(rig,e,t,dur){const a=eas(Math.min(1,t/.23,Math.max(0,(dur-t)/.29)));let rh=V(.36,.9,.05),lh=V(-.36,.9,.05),hr=V(.6,-1,-.3),hl=V(-.6,-1,-.3),y=0,ry=0,lx=0,lz=0,sx=0;
 switch(e){
 case 0:rh.lerp(V(.5+Math.sin(t*9)*.15,2,.1),a);hr=V(.8,-.6,-.2);ry=.25*a;break;
 case 1:{const u=Math.sin(t*11);rh.lerp(V(.46,2.05+u*.1,.04),a);lh.lerp(V(-.46,2.05-u*.1,.04),a);hr=V(.9,-.5,-.2);hl=V(-.9,-.5,-.2);y+=Math.abs(Math.sin(t*6.5))*.3*a;sx=.5*a;break}
 case 2:{const ph=Math.floor(t/2.2)%3,u=Math.sin(t*8),w=Math.sin(t*4);
  if(ph==0){rh.lerp(V(.5,1.5+u*.45,.22),a);lh.lerp(V(-.5,1.5-u*.45,.22),a);ry=w*.55*a;y+=Math.abs(u)*.1*a;lx=u*.6*a}
  else if(ph==1){rh.lerp(V(.62,1.95+u*.12,.1),a);lh.lerp(V(-.3,1.1,.3),a);ry=w*.7*a;y+=Math.abs(u)*.14*a;lx=u*.55*a;lz=w*.12*a}
  else{rh.lerp(V(.45+w*.15,1.2+Math.abs(u)*.5,.3),a);lh.lerp(V(-.45+w*.15,1.2+Math.abs(Math.sin(t*8+1.6))*.5,.3),a);ry=Math.sin(t*2)*.9*a;y+=Math.abs(u)*.12*a;lx=u*.5*a;sx=Math.max(0,-u)*.4*a}break}
 case 3:rh.lerp(V(.6,1.95,.02),a);lh.lerp(V(-.6,1.95,.02),a);hr=V(1,-.3,-.1);hl=V(-1,-.3,-.1);y+=Math.sin(t*5)*.015*a;ry=Math.sin(t*3)*.15*a;break;
 case 4:rh.lerp(V(.12,1.78,.28),a);hr=V(.9,-.2,-.3);ry=.1*a;break;
 case 5:{const c=Math.abs(Math.sin(t*10));rh.lerp(V(.1+.2*c,1.3,.4),a);lh.lerp(V(-.1-.2*c,1.3,.4),a);hr=V(.6,-.8,.2);hl=V(-.6,-.8,.2);y+=c*.02*a;break}
 case 6:rh.lerp(V(.75,1.35+Math.sin(t*6)*.04,.2),a);lh.lerp(V(-.75,1.35+Math.sin(t*6)*.04,.2),a);hr=V(1,-.4,.4);hl=V(-1,-.4,.4);y-=.03*a;break;
 case 7:{rh.lerp(V(.9,1.45,.05),a);lh.lerp(V(-.9,1.45,.05),a);hr=V(1,-.3,0);hl=V(-1,-.3,0);const k=Math.min(1,t/Math.max(.1,dur-.15));ry=k*k*(3-2*k)*Math.PI*4;lx=Math.sin(t*14)*.3*a;break}
 case 8:{const d=Math.sin(Math.PI*t/dur);rh.lerp(V(.31,1.43,.57),d);lh.lerp(V(-.32,.76,.45),d);y=-d*.22;sx=d*.75;lx=d*.4;break}
 case 9:{const f=Math.sin(t*4.5);rh.lerp(V(.73,1.73+.09*f,.45),a);lh.lerp(V(-.12,1.17,.25),a);ry=.34*a;break}
 case 10:{const f=Math.sin(Math.PI*Math.min(1,t/dur));rh.lerp(V(.57*f,1.35+.61*f,.45),a);lh.lerp(V(-.57*f,1.35+.61*f,.45),a);y=Math.max(0,Math.sin(t*5))*f*.14;sx=.2*f;break}
 }
 rig.legL.rotation.x=lx;rig.legR.rotation.x=-lx;rig.legL.rotation.z=lz;rig.legR.rotation.z=-lz;rig.shinL.rotation.x=sx+Math.max(0,-lx)*.8;rig.shinR.rotation.x=sx+Math.max(0,lx)*.8;
 const wave=Math.sin(t*5),attention=Math.sin(t*2.8+.6);
 rig.sh.position.y=1-Math.max(0,-y)*.19;
 rig.sh.rotation.set((sx*.12+.023*wave)*a,cl(ry*.18,-.30,.30)*a,(lz*.4+attention*.032)*a);
 rig.head.rotation.set(-rig.sh.rotation.x*.55,rig.sh.rotation.y*.4,-rig.sh.rotation.z*.48);
 ik(shPos(rig,1),rh,hr,rig.armR);ik(shPos(rig,-1),lh,hl,rig.armL);return{y,ry}}
/* other players: their rig poses from the id in their state message, and their gun is lowered while they do it */
function emoBot(b,dt){if(b._eid!==b.em){b._eid=b.em;b._et=0}b._et+=dt;const dur=EMLEN[b.em]||3,o=emoPose(b.rig,b.em,b._et%(dur+.0001),dur);b.m.position.y=(b.y||0)+o.y;if(b.ry!=null)b.m.rotation.y=b.ry+o.ry;if(b.hg)b.hg.visible=false}
{const _ab=animBot;animBot=function(b,dt){const r=_ab.apply(this,arguments);try{if(b&&b.rig&&b.net){if(b.em>=0)emoBot(b,dt);else if(b._eid>=0){b._eid=-1;if(b.rig.legL){b.rig.legL.rotation.z=0;b.rig.legR.rotation.z=0}}}}catch(e){}return r}}
function renderSharedEmoteWheel(doc,last){
 let wheel=doc.getElementById('emw');
 if(!wheel){
  wheel=doc.createElement('div');wheel.id='emw';
  wheel.innerHTML='<div class="ring"></div>'+Array.from({length:8},(_,i)=>`<div class="sl" data-i="${i}" style="--a:${i*45}deg"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg><b></b><em>${i+1}</em></div>`).join('')+'<div class="ct"><small>EMOTE</small><b id="emn">Move to choose</b></div>';
  doc.body.appendChild(wheel);
 }
 for(const slot of wheel.querySelectorAll('.sl')){
  const index=Number(slot.dataset.i),id=index===7?last:index;
  slot.querySelector('svg').innerHTML=EMI[id];slot.querySelector('b').textContent=EMN[id];
 }
 wheel.classList.add('on');return wheel;
}
function emoWheel(show){
 if(show){renderSharedEmoteWheel(document,passEmote());emoShow()}
 else document.getElementById('emw')?.classList.remove('on');
}
function emoShow(){const w=document.getElementById('emw');if(!w)return;for(const s of w.querySelectorAll('.sl'))s.classList.toggle('on',+s.dataset.i==EMO.sel);const n=w.querySelector('#emn');if(n)n.textContent=EMO.sel>=0?EMN[EMO.sel===7?passEmote():EMO.sel]:'Move to choose'}
function emoPick(){const L=Math.hypot(EMO.vx,EMO.vy);if(L<26){if(EMO.sel!=-1){EMO.sel=-1;emoShow()}return}const ang=(Math.atan2(EMO.vx,-EMO.vy)+6.2832)%6.2832,s=Math.floor(ang/.7854+.5)%8;if(s!=EMO.sel){EMO.sel=s;emoShow();flTone(1500+s*60,1400,.03,.025,0,'sine')}}
function emoOpen(){if(EMO.open||!run||paused||over||P.dead||document.getElementById('chatbox')&&document.activeElement&&document.activeElement.tagName=='INPUT')return;EMO.open=1;EMO.sel=-1;EMO.vx=EMO.vy=0;emoWheel(true)}
function emoClose(play){if(!EMO.open)return;EMO.open=0;emoWheel(false);if(play&&EMO.sel>=0)emoStart(EMO.sel===7?passEmote():EMO.sel)}
function emoStart(id){if(!run||P.dead||paused)return;const idOp=passOperator();if(!EMO.av||EMO.av.operator!==idOp){if(EMO.av)S.remove(EMO.av.g);const g=new THREE.Group(),rig=mkHuman(g,idOp?{operator:idOp}:undefined);if(teamMode())markOperatorTeam(rig,myTeam);g.visible=false;S.add(g);EMO.av={g,rig,operator:idOp}}
 EMO.cur={id,t:0,dur:EMLEN[id],hp:P.hp,nb:0,sw:0};EMO.av.g.visible=true;flNoise(.18,400,1800,.04,'bandpass',1.2);flTone(380,620,.14,.04,0,'triangle')}
function emoEnd(){const c=EMO.cur;EMO.cur=null;if(EMO.av){EMO.av.g.visible=false;EMO.av.rig.legL.rotation.z=0;EMO.av.rig.legR.rotation.z=0}if(c){try{if(!P.dead)gun.visible=true}catch(e){}}}
/* before the frame is drawn: the wheel's controller input, the third-person camera and the character's pose */
function emoCam(dt){
 try{const g=typeof gpGet=='function'?gpGet():null;if(g&&g.buttons&&g.buttons[13]){const d=!!g.buttons[13].pressed;if(d&&!EMO.pad)emoOpen();if(!d&&EMO.pad)emoClose(true);EMO.pad=d;if(EMO.open&&g.axes&&(Math.abs(g.axes[2])>.3||Math.abs(g.axes[3])>.3)){EMO.vx=g.axes[2]*90;EMO.vy=g.axes[3]*90;emoPick()}}}catch(e){}
 if(EMO.open&&(!run||paused||P.dead||over)){EMO.open=0;emoWheel(false)}
 const c=EMO.cur;if(!c)return;
 if(!run||paused||P.dead||over||trig||!P.on||Math.hypot(P.mx||0,P.mz||0)>.7||P.hp<c.hp-.5||EMO.open){emoEnd();return}
 c.t+=dt;if(c.t>=c.dur){emoEnd();return}
 const av=EMO.av,o=emoPose(av.rig,c.id,c.t,c.dur);av.g.position.set(P.x,P.y+o.y,P.z);av.g.rotation.y=yaw+Math.PI+o.ry;av.g.visible=true;
 const k=Math.min(1,c.t/.6),e=k*k*(3-2*k),phi=yaw+2.6*e,sx=Math.sin(phi),sz=Math.cos(phi);let cx=P.x,cz=P.z;
 for(let i=0;i<7;i++){const q={x:cx,y:P.y+1,z:cz};mv(q,sx*.4,sz*.4,.28);if(Math.hypot(q.x-(cx+sx*.4),q.z-(cz+sz*.4))>.03)break;cx=q.x;cz=q.z}
 C.position.set(cx,P.y+1.5+.15*e,cz);C.lookAt(P.x,P.y+1.1,P.z);
 gun.visible=false;try{hideFP()}catch(x){}nf=Math.max(nf,t0+.1);
 if(c.id==2&&c.t>=c.nb){c.nb+=.4545;flTone(110,52,.14,.1,0,'sine');if(Math.round(c.t/.4545)%2)flNoise(.05,6000,4000,.03,'highpass',1)}}
{const _t=LX.tick;LX.tick=function(dt){try{emoCam(dt)}catch(e){console.warn('emote',e)}return _t.call(this,dt)}}
addEventListener('keydown',e=>{if(e.repeat||!run||paused||over||P.dead)return;const t=document.activeElement&&document.activeElement.tagName;if(t=='INPUT'||t=='TEXTAREA')return;const k=typeof RB=='function'?RB(e.code):e.code;
 if(k=='KeyK')emoOpen();else if(EMO.open&&/^Digit[1-8]$/.test(e.code)){e.stopImmediatePropagation();e.preventDefault();EMO.sel=+e.code.slice(5)-1;emoShow()}},true);
addEventListener('keyup',e=>{const k=typeof RB=='function'?RB(e.code):e.code;if(k=='KeyK'&&EMO.open)emoClose(true)},true);
addEventListener('mousemove',e=>{if(!EMO.open)return;EMO.vx+=e.movementX||0;EMO.vy+=e.movementY||0;const L=Math.hypot(EMO.vx,EMO.vy);if(L>90){EMO.vx*=90/L;EMO.vy*=90/L}emoPick()},true);
;

/* ===================== london.js ===================== */
/* ---------- Zombies map 2: WESTMINSTER, LONDON. Big Ben stands over the Palace Yard; the power is OFF until you find the substation switch; its own weapon, The Brew (a teapot blaster that fires scalding tea),
   is unlocked by the Great British Brew easter egg. No Nitrogen Fists on this map: it keeps the RayGun and the Katana. ---------- */

/* ---------- The Brew: a Victorian steam-powered tea cannon. It fires a thick beam of scalding tea that goes right through a line of zombies, then splashes and slows everything it touches.
   In Multiplayer it unlocks in the primary loadout at level 38. In Zombies it is earned through the London Brew quest. ---------- */
/* a held beam: it fires every 0.1 s while the trigger is down (36 ticks of heat, then it vents). Zombies applies its own direct and splash damage multipliers */
ZWP.TEA=3250;
/* ---------- the beam ----------
   Hold fire: a continuous jet of scalding tea. It is ONE persistent beam (three meshes that follow your aim every frame), not a new beam per shot. Heat is the magazine:
   every tick of the beam heats the boiler, it cools by itself when you let go, and if it runs dry the boiler OVERHEATS: steam vents and you cannot fire until it has vented (the reload).
   Everything on the line takes damage every tick (up to 6 zombies), the end of the beam splashes and scalds. Other players see the beam too (one short message every 0.1 s). */
var TB={hold:0,fire:0,ms:[],snd:null,splT:0,dropT:0,steamT:0,ns:0,over:0,was:0,bar:null,lastBar:'',t:0};
function teaMake(){if(TB.ms.length)return;for(const[r,c,op,k]of[[.2,0x6a3a14,.2,1],[.11,0xc98a3b,.55,1.3],[.045,0xffe0b0,.95,2.2]]){const mt=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false});mt.color.multiplyScalar(k);const m=new THREE.Mesh(bmG,mt);m.visible=false;m.frustumCulled=false;S.add(m);TB.ms.push({m,r,op,k})}}
function teaNet(){if(t0-TB.ns>.085||t0<TB.ns){TB.ns=t0;return true}return false}
/* the player's own beam: called once per tick of the gun; remote shots (raw) are a short one-shot beam */
/* steam and droplets get their own textures: pure white RGB with only the alpha varying, built as raw data (a canvas stores premultiplied colour and leaves coloured noise on soft edges) */
function teaTexs(){if(teaTexs.c)return teaTexs.c;const N=128,hs=(x,y,q)=>{const v=Math.sin(x*127.1+y*311.7+q*74.7)*43758.5453;return v-Math.floor(v)},
 vn=(x,y,q)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return(hs(xi,yi,q)*(1-u)+hs(xi+1,yi,q)*u)*(1-v)+(hs(xi,yi+1,q)*(1-u)+hs(xi+1,yi+1,q)*u)*v},
 mk=f=>{const d=new Uint8Array(N*N*4);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+.5)/N*2-1,v=(y+.5)/N*2-1,r=Math.sqrt(u*u+v*v),a=r>=1?0:f(r,x,y),i=(y*N+x)*4;d[i]=d[i+1]=d[i+2]=255;d[i+3]=Math.max(0,Math.min(255,Math.round(a*255)))}
  const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;return t};
 return teaTexs.c={steam:mk((r,x,y)=>{const e=1-r,fall=e*e*(3-2*e),n=.55*vn(x/22,y/22,1)+.3*vn(x/11,y/11,2)+.15*vn(x/5.5,y/5.5,3);return fall*(.5+.8*n)*.9}),drop:mk(r=>Math.pow(1-r,2.2))}}
function teaBeam(o,d,len,raw){if(!raw){TB.hold=.15;TB.fire=.16;return}
 const s=o.clone(),e=o.clone().add(d.clone().multiplyScalar(len)),mid=s.clone().add(e).multiplyScalar(.5),L=s.distanceTo(e),dir=e.clone().sub(s).normalize();
 for(const[r,c,op,k]of[[.2,0x6a3a14,.2,1],[.11,0xc98a3b,.55,1.3],[.045,0xffe0b0,.95,2.2]]){const mt=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op});mt.color.multiplyScalar(k);const m=new THREE.Mesh(bmG,mt);m.position.copy(mid);m.scale.set(r,L,r);m.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(m);fx.push({m,l:.2,fade:op,r})}
 try{for(let i=0;i<3;i++)JX.h.addSp({p:s.clone().lerp(e,Math.random()*Math.min(1,10/L)),s0:.3,s1:1.1,life:.9,c:[1,1,1],op:.3,tex:teaTexs().steam,add:false,v:V(0,.5,0),dr:.9})}catch(x){}}
/* every zombie close to the beam takes a scalding hit each tick (the first one is hit by the shot itself); the end of the beam splashes everything around it */
function teaPierce(o,d,len,w,first){if(typeof bots=='undefined')return;const hits=[],dm=Math.round(w.d*.8*(typeof zmul=='function'?zmul(w):1));
 for(const b of bots){if(!b.zom||!b.al)continue;const vx=b.x-o.x,vy=(b.y||0)+1-o.y,vz=b.z-o.z,t=vx*d.x+vy*d.y+vz*d.z;if(t<1||t>len)continue;const px=vx-d.x*t,py=vy-d.y*t,pz=vz-d.z*t;if(Math.hypot(px,py,pz)>(b.big?1.7:1.15))continue;if(Math.abs(t-first)<1)continue;hits.push([t,b])}
 hits.sort((a,b)=>a[0]-b[0]);for(const[,b]of hits.slice(0,5)){hitBot(b,dm,0);b.stun=Math.max(b.stun||0,.5)}
 if(t0-TB.splT>.12){TB.splT=t0;const e=o.clone().add(d.clone().multiplyScalar(Math.min(len,first+.1)));for(const b of bots){if(!b.zom||!b.al)continue;if(Math.hypot(b.x-e.x,(b.y||0)+1-e.y,b.z-e.z)<2.4){hitBot(b,Math.round(dm*.45),0);b.stun=Math.max(b.stun||0,.9)}}}}
/* per frame: the persistent beam, the heat bar, steam, overheating, cooling and the hissing / boiling sound */
function teaTick(dt){const w=(typeof wp!='undefined'&&wp&&wp[cur])?wp[cur]:null,tea=!!w&&w.k=='TEA'&&run&&!P.dead;TB.t+=dt;
 if(!TB.bar&&typeof document!='undefined'){const e=document.createElement('div');e.id='teaheat';e.innerHTML='<i></i><b>THE BREW</b>';const h=document.getElementById('hud');if(h){h.appendChild(e);TB.bar=e}}
 if(!tea){for(const q of TB.ms)q.m.visible=false;if(TB.bar&&TB.lastBar!=='off'){TB.bar.style.display='none';TB.lastBar='off'}teaSound(0,0);TB.hold=0;TB.over=0;return}
 teaMake();w.res=Math.max(w.res,w.m*3);const heat=1-Math.max(0,w.mag)/w.m,venting=rel>0;
 if(TB.hold>0)TB.hold-=dt;if(TB.fire>0)TB.fire-=dt;
 /* cooling: the boiler rests when you stop; during the vent it refills at the reload */
 if(TB.hold<=0&&!venting&&w.mag<w.m)w.mag=Math.min(w.m,w.mag+dt*(w.m*.26));
 const o=(typeof vrOrg=='function'&&vrOrg())||C.position.clone(),d=aimDir(),on=TB.hold>0&&!venting;
 if(on){const limit=mode==='Zombies'?120:38,wl=castW(o,d,limit),s=weaponMuzzleWorld(fpG),e=o.clone().addScaledVector(d,wl),mid=s.clone().add(e).multiplyScalar(.5),L=Math.max(.2,s.distanceTo(e)),dir=e.clone().sub(s).normalize(),fl=1+.12*Math.sin(TB.t*47)+.06*Math.sin(TB.t*23);
  TB.ms.forEach((q,i)=>{q.m.visible=true;q.m.position.copy(mid);q.m.scale.set(q.r*fl*(i==0?1+heat*.5:1),L,q.r*fl*(i==0?1+heat*.5:1));q.m.quaternion.setFromUnitVectors(V(0,1,0),dir);q.m.material.opacity=q.op*(.88+.12*Math.sin(TB.t*31+i));if(i==2)q.m.material.color.setRGB(2.2,2.2-heat*1.1,2.2-heat*1.9)});
  TB.dropT-=dt;if(TB.dropT<=0){TB.dropT=.07;try{const H=JX.h;for(let i=0;i<2;i++){const p=s.clone().lerp(e,Math.random()*Math.min(1,14/L));H.addSp({p,s0:.07,s1:.2,life:.4,c:[2.2,1.3,.5],op:.9,tex:teaTexs().drop,v:V((Math.random()-.5)*1.4,Math.random()*1.4,(Math.random()-.5)*1.4),dr:.9})}H.addSp({p:s.clone().lerp(e,Math.random()*Math.min(1,10/L)),s0:.3,s1:1.1,life:.8,c:[1,1,1],op:.26,tex:teaTexs().steam,add:false,v:V(0,.6,0),dr:.9})}catch(x){}}
  if(t0-TB.splT>.2&&wl<119){try{JX.tea&&JX.tea(e,{R:2.4})}catch(x){}}
  kick+=.0012;shake=Math.max(shake,.05+heat*.12);LX.fx.pulse=Math.max(LX.fx.pulse,.1+heat*.15)}
 else for(const q of TB.ms)q.m.visible=false;
 /* steam from the boiler when it runs hot, a big hiss when it overheats */
 if((heat>.62&&TB.hold>0)||venting){TB.steamT-=dt;if(TB.steamT<=0){TB.steamT=venting?.05:.12;try{const H=JX.h,p=C.position.clone().add(aimDir().multiplyScalar(.5)).add(V(.1,-.05+(Math.random()-.3)*.1,0));H.addSp({p,s0:.15,s1:venting?1.4:.8,life:venting?1.1:.7,c:[1,1,1],op:venting?.45:.3,tex:teaTexs().steam,add:false,v:V((Math.random()-.5)*.8,.9+Math.random()*.9,(Math.random()-.5)*.8),dr:.9})}catch(x){}}}
 if(venting&&!TB.was){TB.was=1;teaVent();shake=Math.max(shake,.5);popup&&0}if(!venting)TB.was=0;
 teaSound(on?1:0,heat);
 if(TB.bar){const pc=Math.round(heat*100);const key=venting?'v'+Math.round(rel*5):pc+'';if(TB.lastBar!==key){TB.lastBar=key;TB.bar.style.display='block';const i=TB.bar.firstChild;i.style.width=(venting?100:pc)+'%';TB.bar.className=venting?'vent':heat>.75?'hot':'';TB.bar.lastChild.textContent=venting?'VENTING…':heat>.75?'OVERHEATING':'THE BREW'}}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{teaTick(dt)}catch(e){}}}
/* HUD line for the ammo counter: heat instead of rounds */
function teaAm(){const w=cw(),h=Math.round((1-Math.max(0,w.mag)/w.m)*100);return `${rel>0?'VENT':h+'%'}<small>${rel>0?'Venting steam…':'Heat'}`}
/* sound: a pressurised hiss, a rolling boil under it and a thin whistle that climbs as the boiler heats; stops softly */
function teaSound(on,heat){try{if(!on&&!TB.snd)return;ac=ac||new AudioContext();const c=ac;
 if(!TB.snd){const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=nb.getChannelData(0);let p=0;for(let i=0;i<a.length;i++){p=p*.4+(Math.random()*2-1)*.6;a[i]=p}
  const mkN=(type,f,q)=>{const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=nb;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.value=.0001;s.connect(fl);fl.connect(g);g.connect(PlayerAudio.output(c));s.start();return{s,fl,g}},
  hiss=mkN('bandpass',3000,.7),boil=mkN('lowpass',260,.8),wh=c.createOscillator(),wg=c.createGain();wh.type='sine';wh.frequency.value=1700;wg.gain.value=.0001;wh.connect(wg);wg.connect(PlayerAudio.output(c));wh.start();TB.snd={hiss,boil,wh,wg}}
 const S_=TB.snd,t=c.currentTime,v=on?vol:0;S_.hiss.g.gain.setTargetAtTime(on?.055*v:.0001,t,.05);S_.boil.g.gain.setTargetAtTime(on?.16*v:.0001,t,.08);S_.hiss.fl.frequency.setTargetAtTime(2600+heat*1800,t,.1);S_.boil.fl.frequency.setTargetAtTime(220+Math.sin(TB.t*9)*40,t,.05);
 S_.wh.frequency.setTargetAtTime(1500+heat*1400,t,.1);S_.wg.gain.setTargetAtTime(on&&heat>.45?.014*v*Math.min(1,(heat-.45)*3):.0001,t,.08)}catch(e){}}
/* the overheat: a long hiss and a falling whistle */
function teaVent(){try{ac=ac||new AudioContext();const c=ac,t=c.currentTime,n=c.sampleRate*1.4,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.3);
 const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='highpass';f.frequency.value=1800;g.gain.setValueAtTime(.16*vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+1.4);s.connect(f);f.connect(g);g.connect(PlayerAudio.output(c));s.start();
 const o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.setValueAtTime(2300,t);o.frequency.exponentialRampToValueAtTime(900,t+.9);og.gain.setValueAtTime(.035*vol,t);og.gain.exponentialRampToValueAtTime(.0001,t+.9);o.connect(og);og.connect(PlayerAudio.output(c));o.start(t);o.stop(t+.95)}catch(e){}}
/* tea splash: amber droplets, drifting steam and a puddle that steams away (same idea as the RayGun ooze, a different look) */
{const{cv,addSp,rnd,F,hi}=JX.h,dm=[1.9,1.4,1].map(k=>{const m=new THREE.MeshBasicMaterial({color:0xd9953f});m.color.multiplyScalar(k);return m}),
 pt=cv(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,3,64,64,62);r.addColorStop(0,'rgba(240,190,110,.95)');r.addColorStop(.5,'rgba(170,95,35,.85)');r.addColorStop(.9,'rgba(120,60,20,.5)');r.addColorStop(1,'rgba(90,40,10,0)');g.fillStyle=r;g.fillRect(0,0,w,h)}),
 pg_=new THREE.CircleGeometry(1,18);JX.teas=[];JX.tpuds=[];
 JX.tea=function(p,g){if(!hi)return;const R_=Math.max(2,(g&&g.R)||2.6),near=C.position.distanceTo(p),prox=Math.max(0,1-near/(R_*3.4));F.boom=Math.min(1,Math.max(F.boom,.1+prox*.35));JX.flash(p,0xffb060,7,.3,R_*3);
  addSp({p:p.clone(),s0:R_*.2,s1:R_*.8,life:.28,c:[2.2,1.2,.45],op:.9,tex:teaTexs().drop});
  for(let i=0;i<6;i++)addSp({p:V(p.x+rnd(-.5,.5),p.y+rnd(.1,.6),p.z+rnd(-.5,.5)),s0:.5,s1:1.9,life:rnd(1.3,2.2),c:[1,1,1],op:.38,tex:teaTexs().steam,add:false,v:V(rnd(-.2,.2),rnd(.7,1.5),rnd(-.2,.2)),dr:.9});
  const n=Math.min(JX.teas.length>40?5:16,22);for(let i=0;i<n;i++){const a=rnd(0,6.283),sp=rnd(2,5.5),m=new THREE.Mesh(sg,dm[i%3]),s=rnd(.04,.1);m.scale.set(s,s*rnd(.9,1.3),s);m.position.copy(p);S.add(m);JX.teas.push({m,v:V(Math.cos(a)*sp,rnd(2,6),Math.sin(a)*sp),s,t:0})}
  if(JX.tpuds.length>12){const o=JX.tpuds.shift();S.remove(o.m);o.m.material.dispose()}const m=new THREE.Mesh(pg_,(()=>{const q=new THREE.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false,opacity:.85});q.color.setRGB(1.2,1,.9);return q})());m.rotation.x=-Math.PI/2;m.position.set(p.x,.05,p.z);m.scale.setScalar(.1);S.add(m);JX.tpuds.push({m,r:R_*.5,t:0,b:0})};
 const _tk=JX.tickG;JX.tickG=function(dt){if(_tk)_tk(dt);const G=JX.teas;for(let i=G.length-1;i>=0;i--){const o=G[i];o.t+=dt;o.v.y-=16*dt;o.m.position.addScaledVector(o.v,dt);if(o.m.position.y<=.06||o.t>2){S.remove(o.m);G.splice(i,1)}}
  const P_=JX.tpuds;for(let i=P_.length-1;i>=0;i--){const o=P_[i];o.t+=dt;const u=o.t,e=1-Math.pow(1-Math.min(1,u/.25),3),sh=u<3?1:Math.max(0,1-(u-3)/1.2);o.m.scale.setScalar(Math.max(.01,o.r*e*(.85+.15*sh)));o.m.material.opacity=.85*sh;o.b-=dt;if(o.b<=0&&u<3){o.b=rnd(.2,.4);addSp({p:V(o.m.position.x+rnd(-o.r,o.r)*.6,.15,o.m.position.z+rnd(-o.r,o.r)*.6),s0:.2,s1:.9,life:1.1,c:[1,1,1],op:.3,tex:teaTexs().steam,add:false,v:V(0,.8,0),dr:.9})}if(sh<=0){S.remove(o.m);o.m.material.dispose();P_.splice(i,1)}}};
 const _gc=JX.goopClear;JX.goopClear=function(){if(_gc)_gc();for(const o of JX.teas)S.remove(o.m);for(const o of JX.tpuds){S.remove(o.m);o.m.material.dispose()}JX.teas.length=JX.tpuds.length=0}}
/* the splash lands: scalded zombies are slowed hard for a few seconds (the explosion damage itself is dealt by boom) */
function teaScald(p,R){if(typeof bots=='undefined')return;for(const b of bots){if(!b.zom||!b.al)continue;if(Math.hypot(b.x-p.x,b.z-p.z)<R)b.stun=Math.max(b.stun||0,2.4)}}

/* ===================== the map ===================== */
MAPS.London={d:'Zombies map: Westminster, London. Big Ben over the Palace Yard, a Tube station, Parliament Square, the Abbey, a pub, a bunker and a dead substation: the power is off until you find the switch. Own weapon: The Brew',
 zm:1,H:56,open:1,facade:1,day:1,sky:0xc4dcf0,gr:0x4a4c52,gt:'asphalt',bc:0x9a8c70,ps:[0,46],skyk:'day',hemi:1.05,hemiC:0xe4eeff,hemiG:0x8a8576,sunI:1.2,sunC:0xfff0d2,fogF:300,power:1,nf:0,
 outdoor:[[-8,8,8,40],[-30,-30,30,8],[-30,-42,30,-30]],links:[],lights:[],
 zs:[[-4,44,0],[4,44,0],[-5,48,0],[5,48,0],
  [0,30,1],[0,18,1],[-3,13,1],[4,22,1],[3,35,1],
  [-18,-6,2],[18,-6,2],[-20,-22,2],[20,-22,2],[-4,-27,2],[4,-27,2],[-10,2,2],[10,2,2],
  [14,20,3],[24,31,3],[24,18,3],
  [-39,-5,4],[-44,-20,4],[-36,-24,4],[-45,-12,4],
  [36,-14,5],[42,-22,5],[38,-12,5],
  [-24,28,6],[-14,32,6],[-24,34,6],
  [-20,-37,7],[0,-38,7],[-26,-34,7],[24,-33,7]],
 dr:[{x:0,z:40,w:6,d:.5,c:750,a:0,b:1,n:'Station Gate',s:'iron'},{x:0,z:8,w:16,d:.5,c:1000,a:1,b:2,n:'Whitehall Barricade',s:'iron'},{x:8,z:24,w:.5,d:4,c:750,a:1,b:3,n:'The Red Lion',s:'wood'},
  {x:-30,z:-15,w:.5,d:4.6,c:1250,a:2,b:4,n:'Abbey Doors',s:'stone'},{x:30,z:-18,w:.5,d:4,c:1500,a:2,b:5,n:'Substation',s:'iron'},{x:-8,z:30,w:.5,d:4,c:2250,a:1,b:6,n:'War Rooms Bunker',s:'stone'},
  {x:0,z:-30,w:8,d:.6,c:2000,a:2,b:7,n:'Palace Gates',s:'iron'}],
 mc:[{t:'rev',x:-7.2,z:46,f:'e'},{t:'vit',x:-7.2,z:14,f:'e'},{t:'spd',x:-29.2,z:-36,f:'e'},{t:'stam',x:29.2,z:2,f:'w'},
  {t:'line',x:38.4,z:-25.25,f:'s'},{t:'pap',x:-27.4,z:30,f:'e'},
  {t:'box',x:7.3,z:35,f:'w'},{t:'box',x:-29,z:-5,f:'e'},{t:'box',x:27.3,z:17,f:'w'},{t:'box',x:-28,z:-33,f:'e'},
  {t:'wall',k:'MG',x:-7.4,z:43,f:'e'},{t:'wall',k:'DS',x:-7.4,z:19,f:'e'},{t:'wall',k:'AR',x:7.4,z:12,f:'w'},
  {t:'wall',k:'BR',x:-29.4,z:-21,f:'e'},{t:'wall',k:'VMP',x:27.4,z:22,f:'w'},{t:'wall',k:'TUR',x:29.4,z:-4,f:'w'},
  {t:'wall',k:'RL',x:-27.4,z:34,f:'e'},{t:'wall',k:'RD',x:-27.66,z:36,f:'e'},{t:'wall',k:'PD',x:-53.56,z:-18.5,f:'e'},
  {t:'ammo',x:-7.3,z:50,f:'e'},{t:'ammo',x:7.3,z:30,f:'w'},{t:'ammo',x:-29.2,z:-2,f:'e'},{t:'ammo',x:28,z:-29.2,f:'s'},{t:'ammo',x:-12,z:-41.2,f:'s'},{t:'ammo',x:-8.8,z:34,f:'w'},{t:'ammo',x:27.2,z:32,f:'w'}],
 b(){return lonBuild()}};
MAPS.London.post=g=>{estPost(g);jovianLondonWreck(g)};
/* the pooled lights, flicker and storm of the zombies pipeline belong to this map too; only the indoor test is its own */
MAPS.London.rooms=[[-8,40,8,56],[-30,22,-8,38],[8,14,28,34],[-54,-30,-30,0],[30,-26,46,-10]];
var lonIn=(x,z)=>MAPS.London.rooms.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]);

/* ---------- building the street ---------- */
function lonBuild(M=MAPS.London){const a=[],vv=M._v=[];EST.sd=23;EST.cols=[];EST.dyn=[];EST.spots=[];EST.pend=[];EST.fires=[];EST.mach={};EST.pendulum=[];EST.walls=[];EST.holes=[];
 EST.pts={f:{p:[],c:[],f:[],base:[],size:.34},h:{p:[],c:[],f:[],base:[],size:1.7},F:{p:[],c:[],f:[],base:[],size:.9},H:{p:[],c:[],f:[],base:[],size:3.4},s:{p:[],c:[],f:[],base:[],size:2.4}};
 const bk=EST.bk=mkBake(),PI_=Math.PI,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V_=(x,z,w,d,h,y0,c,sh,tex)=>vv.push([x,z,w,d,h,y0||0,c,sh,tex]),
  R=(x0,z0,x1,z1,h,c,k,y0)=>B((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,h,y0,c,k),col=(x,z,w,d,h)=>B(x,z,w,d,h,0,0,'n');
 /* a walled room with gaps for doors: gaps = [side,centre,width] */
 const room=(x0,z0,x1,z1,h,t,gaps,c,k)=>{const seg=(side,fixed,from,to)=>{const gs=gaps.filter(g=>g[0]==side).map(g=>[g[1]-g[2]/2,g[1]+g[2]/2]).sort((p,q)=>p[0]-q[0]);let cur=from;
   const add=(u0,u1)=>{if(u1-u0<.05)return;(side=='n'||side=='s')?R(u0,fixed-t/2,u1,fixed+t/2,h,c,k):R(fixed-t/2,u0,fixed+t/2,u1,h,c,k)};for(const g of gs){add(cur,g[0]);cur=g[1]}add(cur,to)};
  seg('n',z0,x0-t/2,x1+t/2);seg('s',z1,x0-t/2,x1+t/2);seg('w',x0,z0+t/2,z1-t/2);seg('e',x1,z0+t/2,z1-t/2)};
 const STN=0xb3a47a,DST=0x8f8260,GLD=0xc9a23a,RED=0xb3121b,IRN=0x1c1d20,lamp=(x,z,ry)=>{bk.at(x,0,z,ry||0,()=>{bk.cyl(0,0,0,.13,.17,.3,IRN,'m',8);bk.rod(0,.3,0,0,4.6,0,.06,.045,IRN,'m',6);bk.rod(0,4.5,0,.7,4.8,0,.04,.03,IRN,'m',5);bk.cyl(.7,4.5,0,.16,.1,.3,IRN,'m',6);bk.cyl(.7,4.52,0,.12,.09,.26,0xffe3a8,'e',6)});col(x,z,.4,.4,4);const w=bk.where(.7,0);eSpot(w[0],4.3,w[1],0xffc880,1.05,13,.9,erand()*9);eHalo(w[0],4.4,w[1],.5,.36,.16,'H')};
 const phone=(x,z,ry)=>{bk.at(x,0,z,ry,()=>{bk.bot(0,0,0,1,.3,1,RED,'m');for(const[sx,sz]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]])bk.bot(sx,.3,sz,.1,2,.1,RED,'m');bk.bot(0,2.3,0,1.1,.16,1.1,RED,'m');bk.cyl(0,2.46,0,.1,.5,.18,RED,'m',10);bk.bot(0,2.46,.45,.7,.05,.05,0xf4efe0,'e');bk.box(0,1.2,.47,.8,1.6,.04,0xffe8b0,'gl');bk.box(0,1.2,-.47,.8,1.6,.04,0xffe8b0,'gl');bk.box(-.47,1.2,0,.04,1.6,.8,0xffe8b0,'gl');bk.box(.47,1.2,0,.04,1.6,.8,0xffe8b0,'gl');bk.bot(0,.1,-.2,.3,.9,.3,0x2a2a2a,'m')});col(x,z,1.1,1.1,2.6)};
 const sand=(x,z,len,ry)=>{bk.at(x,0,z,ry||0,()=>{for(let r=0;r<3;r++)for(let i=0;i<Math.floor(len/.7);i++)bk.bot(-len/2+.35+i*.7+(r%2)*.3,r*.34,0,.66,.32,.45+erand()*.05,[0xb7a47a,0xa79568,0xc2b085][(i+r)%3],'f',erand()*.2)});if(Math.abs(Math.sin(ry||0))>.7)col(x,z,.8,len,1.1);else col(x,z,len,.8,1.1)};
 const bus=(x,z,ry)=>{bk.at(x,0,z,ry,()=>{bk.bot(0,.5,0,2.6,1.8,9.6,RED,'m');bk.bot(0,2.3,0,2.5,1.8,9.4,RED,'m');bk.bot(0,4.1,0,2.5,.12,9.4,0x8a0e15,'m');bk.bot(0,.3,0,2.3,.3,9.2,0x2a2a2d,'m');for(let i=0;i<7;i++){bk.box(1.27,2.9,-4+i*1.35,.04,.95,1.0,0x1b2230,'gl');bk.box(-1.27,2.9,-4+i*1.35,.04,.95,1.0,0x1b2230,'gl');bk.box(1.27,1.3,-3.6+i*1.5,.04,.8,1.1,0x1b2230,'gl');bk.box(-1.27,1.3,-3.6+i*1.5,.04,.8,1.1,0x1b2230,'gl')}
   for(const sz of[-3.2,3.2])for(const sx of[-1.3,1.3])bk.cyl(sx,.45,sz,.5,.5,.3,0x0e0e10,'m',12,0,0,PI_/2);bk.bot(0,3.05,4.81,1.8,.4,.04,0xffb040,'e');bk.bot(0,.9,4.81,1.9,.5,.04,0xf4efe0,'e');bk.bot(1.3,1.2,-4.78,.04,2.2,.04,0xd9d9d9,'m')});
  const rot=Math.abs(Math.sin(ry))>.7;col(x,z,rot?9.8:2.8,rot?2.8:9.8,4.3)};
 const taxi=(x,z,ry,c)=>{bk.at(x,0,z,ry,()=>{bk.bot(0,.35,0,1.9,.8,4.4,c,'m');bk.bot(0,1.1,-.2,1.7,.75,2.4,c,'m');bk.box(0,1.5,-.2,1.62,.5,2.2,0x1b2230,'gl');bk.bot(0,1.85,-.2,.8,.2,.4,0xffe8b0,'e');for(const sz of[-1.4,1.4])for(const sx of[-.9,.9])bk.cyl(sx,.32,sz,.33,.33,.22,0x0e0e10,'m',10,0,0,PI_/2)});const rot=Math.abs(Math.sin(ry))>.7;col(x,z,rot?4.6:2.1,rot?2.1:4.6,1.9)};
 const tree=(x,z)=>{bk.at(x,0,z,erand()*6,()=>{bk.cyl(0,0,0,.28,.4,3.4,0x4a4036,'w',8);for(let i=0;i<5;i++){const an=i/5*6.28+erand(),l=1.8+erand()*1.3;bk.rod(0,3.1,0,Math.cos(an)*l,5.2+erand()*1.6,Math.sin(an)*l,.13,.04,0x4a4036,'w',5)}});col(x,z,.8,.8,6)};
 const statue=(x,z,ry)=>{bk.at(x,0,z,ry,()=>{bk.bot(0,0,0,2.4,.5,2.4,DST,'s');bk.bot(0,.5,0,1.8,2.2,1.8,STN,'s');bk.bot(0,2.7,0,2.1,.3,2.1,DST,'s');bk.cyl(0,3,0,.38,.5,1.5,0x2f4a3c,'g',10);bk.sph(0,4.75,0,.3,.34,.3,0x2f4a3c,'g',10);bk.rod(-.3,4.3,0,-.9,3.4,.2,.1,.08,0x2f4a3c,'g',5);bk.rod(.3,4.3,0,.8,3.5,-.2,.1,.08,0x2f4a3c,'g',5);bk.cyl(0,3,0,.5,.6,.1,0x2f4a3c,'g',10)});col(x,z,2.4,2.4,5)};
 const bench=(x,z,ry)=>{bk.at(x,0,z,ry,()=>{bk.bot(0,.45,0,1.8,.08,.5,0x4a2f1c,'w');bk.bot(0,.8,-.22,1.8,.5,.06,0x4a2f1c,'w');for(const s of[-.8,.8])bk.bot(s,0,0,.08,.45,.45,IRN,'m')});const rot=Math.abs(Math.sin(ry))>.7;col(x,z,rot?.6:1.8,rot?1.8:.6,.9)};
 /* ---- the ground-level world ---- */
 V_(0,0,112,112,.02,0,0x2c2e34,'b','asphalt');
 V_(0,-17,34,26,.1,0,0x35432b,'b','grass');                                 /* Parliament Square garden */
 for(const x of[-28,28])V_(x,-14,4,30,.08,0,0x6f6a62,'b','concrete');       /* pavements */
 V_(0,24,16,32,.04,0,0x3a3c42,'b','asphalt');V_(0,-36,60,12,.05,0,0x6b6458,'b','cobble');/* Palace Yard cobbles */
 /* masses: the streets are walled in so the playable world is exactly the streets, the square, the yard and the interiors */
 R(-56,8,-30,56,12,0x6f6048,'brick');R(30,-10,47.5,56,12,0x6f6048,'brick');R(-56,-56,30,-42,16,0xb9ab84,'stucco');R(30,-56,47.5,-26,14,0x7a6a58,'brick');R(-56,-42,-30,-30,12,0xa39a7e,'stucco');R(-56,0,-30,8,10,0x6f6048,'brick');
 R(46,-26,47.5,-10,6,0x59595a,'concrete');R(47.5,-56,56,56,3,0x7a766c,'stone');
 /* terraces, hall, pub, bunker */
 R(-30,8,-8,22,10,0x7b6a52,'brick');R(-30,38,-8,56,10,0x7b6a52,'brick');R(8,8,30,14,9,0x7a5a46,'brick');R(8,34,30,56,10,0x7a5a46,'brick');R(28,14,30,34,6,0x7a5a46,'brick');
 room(-8,40,8,54,5.6,.6,[['n',0,6]],0xcfd2d6,'tile');
 for(const [x,z,w,d] of jovianTubeRoofSections())V_(x,z,w,d,6.2,5.6,0x3a3d42,'b','concrete');
 col(JOVIAN_CRASH.x,JOVIAN_CRASH.z,3.55,3.2,2.9);V_(0,47,16,14,.03,0,0x8a8f95,'b','tile');
 room(8,14,28,34,5.2,.6,[['w',24,4]],0x6b4a34,'brick');V_(18,24,21,21,5.8,5.2,0x3a2f28,'b','shingle');V_(18,24,19.5,19.5,.03,0,0x4a3322,'b','plank');
 room(-28,22,-8,38,4.6,.6,[['e',30,4]],0x6d6e70,'concrete');V_(-18,30,21,17,5.2,4.6,0x2f3033,'b','concrete');V_(-18,30,19.5,15.5,.03,0,0x55575a,'b','concrete');
 room(-54,-30,-30,0,17,.8,[['e',-15,4.6]],0xa39a7e,'stucco');V_(-42,-15,25,31,17.6,17,0x39424a,'b','shingle');V_(-42,-15,23,29,.03,0,0x6a655a,'b','tile');
 room(30,-26,46,-10,6,.6,[['w',-18,4]],0x5b5d60,'concrete');V_(38,-18,17,17,6.5,6,0x2a2b2e,'b','concrete');V_(38,-18,15.5,15.5,.03,0,0x4a4c50,'b','concrete');
 /* the Palace Yard fence: iron railings with the gate in the middle */
 R(-30,-30.3,-4,-29.7,3.2,IRN,'metal');R(4,-30.3,30,-29.7,3.2,IRN,'metal');
 /* Big Ben stands in the yard, built into the Palace */
 const TX=16,TZ=-38;col(TX,TZ,8.8,8.8,60);
 bk.at(TX,0,TZ,0,()=>{const S=STN,D=DST;bk.bot(0,0,0,9.4,2,9.4,D,'s');bk.bot(0,2,0,8.2,32,8.2,S,'s');
  for(const sx of[-1,1])for(const sz of[-1,1]){bk.bot(sx*4.3,0,sz*4.3,1,36,1,D,'s');bk.cyl(sx*4.3,36,sz*4.3,0,.6,3.4,D,'s',8)}
  for(const y of[12,22,32]){bk.bot(0,y,0,8.9,.5,8.9,D,'s')}
  for(let f=0;f<4;f++)bk.at(0,0,0,f*PI_/2,()=>{for(const px of[-2.2,0,2.2]){bk.bot(px,4,4.12,1.5,6,.14,0x6f6448,'s');bk.bot(px,11,4.12,1.5,9,.14,0x6f6448,'s');bk.bot(px,24,4.12,1.5,7,.14,0x6f6448,'s');bk.bot(px,6,4.2,.5,2.4,.1,0x1b1d22,'gl');bk.bot(px,13.5,4.2,.5,3,.1,0x1b1d22,'gl');bk.bot(px,26,4.2,.5,2.4,.1,0xffd890,'e')}});
  bk.bot(0,34,0,10.6,2,10.6,D,'s');bk.bot(0,36,0,9.4,10.4,9.4,0x5d574c,'s');bk.bot(0,46.2,0,10.6,.9,10.6,D,'s');
  for(let f=0;f<4;f++)bk.at(0,0,0,f*PI_/2,()=>{bk.cyl(0,41.2-.06,4.78,3.55,3.55,.12,0xf3ead0,'e',32,PI_/2);bk.tor(0,41.2,4.8,3.6,.2,GLD,'g',0,0,0,32);for(let h=0;h<12;h++){const an=h/12*6.283,r=2.95;bk.bot(Math.sin(an)*r,41.2+Math.cos(an)*r-.18,4.86,.2,h%3?.34:.5,.06,0x23201a,'m',-an)}
   bk.rod(0,41.2,4.9,.2,43.9,4.9,.09,.05,0x23201a,'m',4);bk.rod(0,41.2,4.95,1.9,42.4,4.95,.07,.04,0x23201a,'m',4);bk.sph(0,41.2,4.95,.22,.22,.1,GLD,'g',8);bk.bot(0,44.9,4.9,2.4,.5,.1,GLD,'g');for(const px of[-3.6,3.6])bk.cyl(px,36,4.85,.18,.18,10.4,GLD,'g',6)});
  bk.bot(0,47.1,0,9.4,.5,9.4,D,'s');for(const sx of[-1,1])for(const sz of[-1,1])bk.bot(sx*3.9,47.6,sz*3.9,1.2,7.2,1.2,S,'s');bk.bot(0,47.6,0,6.8,7.2,6.8,0x14151a,'gl');bk.lathe(0,48.6,0,[[.2,0],[1.1,.2],[1.5,.9],[1.3,2.2],[.5,2.6],[.15,2.7]],GLD,'g',12);
  bk.bot(0,54.8,0,10,.5,10,D,'s');bk.cyl(0,55.3,0,.3,6.6,9.4,0x3d4a52,'m',4,0,PI_/4,0);for(let i=0;i<4;i++)bk.rod(Math.cos(i*PI_/2+PI_/4)*4.6,55.3,Math.sin(i*PI_/2+PI_/4)*4.6,0,64.6,0,.1,.05,GLD,'g',4);bk.rod(0,64.6,0,0,68.2,0,.14,.03,GLD,'g',6);bk.sph(0,64.8,0,.35,.4,.35,GLD,'g',8);
  bk.cyl(0,43,0,0,0,0,0,'s',3);
  for(const sx of[-1,1])for(const sz of[-1,1]){bk.cyl(sx*5,46.9,sz*5,0,.55,3,D,'s',6)}});
 /* the Palace of Westminster: bays of pilasters, windows and pinnacles along its face; Victoria Tower at the far end */
 for(let x=-54;x<=24;x+=6){bk.bot(x,0,-41.7,1.1,16,.7,DST,'s');bk.cyl(x,16,-41.5,0,.6,3.2,DST,'s',6);for(const[y,h]of[[3,4.2],[9,4.2]]){bk.bot(x+3,y,-41.8,1.9,h,.2,0x2a2c30,'gl');bk.bot(x+3,y,-41.75,2.3,.3,.3,DST,'s');if(erand()<.6)bk.bot(x+3,y+.3,-41.7,1.5,h-.8,.1,0xffd890,'e')}bk.bot(x+3,13.6,-41.7,2.4,1.6,.3,0x9a8c68,'s')}
 R(-54,-50,-46,-42,46,0xb4a67e,'stucco');bk.at(-50,0,-46,0,()=>{for(const sx of[-1,1])for(const sz of[-1,1])bk.cyl(sx*3.9,40,sz*3.9,0,.7,5.5,DST,'s',6);bk.bot(0,44.2,0,8.6,.6,8.6,DST,'s');bk.cyl(0,44.8,0,.3,4,6,0x3d4a52,'m',4,0,PI_/4,0)});
 /* the Abbey: pillars, an altar with candles, stained glass */
 for(const x of[-36,-42,-48])for(const z of[-22,-8]){R(x-.6,z-.6,x+.6,z+.6,15,0x8a8478,'stone');bk.bot(x,0,z,1.5,.5,1.5,DST,'s');bk.bot(x,14.5,z,1.5,.5,1.5,DST,'s')}
 R(-53.6,-18,-51,-12,1.2,0x6a655a,'stone');for(const z of[-17,-15,-13])eFlame(-52.3,1.5,z,1,1);
 for(const[z,c]of[[-26,0x3a5fd0],[-14,0xd03a3a],[-4,0xd0a63a]]){if(z!=-14)V_(-30.2,z,.1,2.6,9,3,c,'e');V_(-53.7,z,.1,2.6,9,3,c,'e');eSpot(-34,7,z,c,.9,14,.5,erand()*9)}V_(-30.2,-7.6,.1,2.6,9,3,0xd03a3a,'e');
 V_(-42,-29.7,2.6,.1,9,3,0x3aa05a,'e');V_(-42,-.3,2.6,.1,9,3,0x6a3ad0,'e');
 /* pub furniture */
 R(12,15,25,16.4,1.1,0x4a2f1c,'plank');for(const[x,z]of[[15,29],[20,21],[21,28]]){R(x-.8,z-.8,x+.8,z+.8,1,0x5a3a22,'plank')}for(const[x,z]of[[10.4,32.6],[26.6,15.6]]){bk.cyl(x,0,z,.45,.45,1,0x6a4a2a,'w',10);col(x,z,.9,.9,1)}
 for(const[x,z]of[[13,25],[18,25],[17,32],[24,24]])eSpot(x,3.9,z,0xffb866,.85,10,.8,erand()*9);
 /* the Tube station: ticket barriers and machines */
 R(-7.6,43,-2.4,43.5,1.1,0x6b6f76,'metal');R(2.4,43,7.6,43.5,1.1,0x6b6f76,'metal');eSpot(0,5,46,0xcfe0ff,1.15,15,.95,.3);eSpot(0,5,52,0xcfe0ff,1,13,.9,.8);bk.tor(0,3.6,40.35,.8,.12,RED,'m',0,0,0,24);bk.bot(0,3.3,40.4,2.4,.28,.12,0x1c3f94,'e');
 /* ---- the Tube station, built out: a platform with a yellow edge, a track bed with rails and sleepers, a lit train waiting at the platform, tunnel mouths, tiled pilasters, steel ceiling beams with strip lights, benches, ad boxes and a ticket machine. The spawn points (+-4,44) (+-5,48) and the gate route stay clear. ---- */
 {const TRN=0xc9ccd2,GRY=0x8a8d92,DK=0x1d1e22,WIN=0xffe6b4;
  col(0,52.15,15.4,3.1,6);
  bk.bot(0,0,52.15,15.4,.06,3.1,0x35322d,'s');for(let x=-7.3;x<=7.4;x+=.62)bk.bot(x,.05,52.15,.22,.08,2.5,0x4a3a2a,'w');
  bk.bot(0,.12,51.43,15.4,.14,.1,0x9a9da2,'m');bk.bot(0,.12,52.87,15.4,.14,.1,0x9a9da2,'m');bk.bot(0,.09,50.98,15.4,.06,.08,0x6a5a3a,'m');
  bk.bot(0,.005,50.3,15.4,.025,.55,0xe8c11c,'s');bk.bot(0,.006,50.02,15.4,.024,.08,0xf4f2ea,'s');
  /* the train: silver body, red doors, a blue stripe, lit windows, a dark cab at the east end with headlights */
  bk.bot(0,.2,52.15,12.6,.3,2.2,DK,'m');bk.bot(0,.45,52.15,13,3.0,2.7,TRN,'m');bk.bot(0,3.45,52.15,13,.15,2.5,GRY,'m');
  for(const x of[-4.2,-1.4,1.4,4.2])bk.bot(x,3.55,52.15,.9,.12,.8,GRY,'m');
  bk.bot(0,.95,50.77,13,.18,.03,0x1c3f94,'m');
  for(const x of[-5.2,-2.6,0,2.6,5.2])bk.bot(x,1.75,50.77,1.6,.95,.04,WIN,'e');
  for(const x of[-3.9,-1.3,1.3,3.9]){bk.bot(x,.6,50.76,1.1,2.5,.05,RED,'m');bk.bot(x,1.5,50.73,.8,1.0,.03,WIN,'e');bk.bot(x,.6,50.72,.04,2.5,.03,DK,'m')}
  bk.bot(6.55,.5,52.15,.12,2.8,2.4,0x15161a,'m');bk.bot(6.62,.9,51.5,.05,.25,.4,0xfff4cc,'e');bk.bot(6.62,.9,52.8,.05,.25,.4,0xfff4cc,'e');bk.bot(-6.55,.5,52.15,.12,2.8,2.4,0x15161a,'m');
  eSpot(0,2.6,50.2,0xffe2b0,.75,9,.9,1.1);
  /* the tunnel mouths on the end walls */
  for(const sx of[-1,1]){bk.bot(sx*7.66,0,52.15,.05,3.9,3.3,0x07080a,'s');bk.bot(sx*7.62,3.9,52.15,.12,.45,3.9,GRY,'s');bk.bot(sx*7.62,0,50.4,.12,3.9,.3,GRY,'s');bk.bot(sx*7.62,0,53.9-.3,.12,3.9,.3,GRY,'s')}
  /* walls: tiled pilasters with a red band, and ad light-boxes */
  for(const z of[42,46,50])for(const sx of[-1,1]){bk.bot(sx*7.5,0,z,.4,5.4,.5,0xc9c2ae,'s');bk.bot(sx*7.3,1.35,z,.05,.22,.54,RED,'m')}
  for(const[x,c]of[[-6.2,0x2a6fd0],[-4.2,0xe8742a],[4.2,0xb03aa8],[6.2,0x2aa86a]]){bk.bot(x,1.3,40.34,1.4,1.9,.05,0x1c1d20,'m');bk.bot(x,1.38,40.3,1.24,1.74,.05,c,'e')}
  for(const[z,c]of[[44,0xd8c02a],[48.2,0x2a9ad8]]){bk.bot(7.62,1.3,z,.05,1.9,1.4,0x1c1d20,'m');bk.bot(7.58,1.38,z,.05,1.74,1.24,c,'e');bk.bot(-7.62,1.3,z,.05,1.9,1.4,0x1c1d20,'m');bk.bot(-7.58,1.38,z,.05,1.74,1.24,c==0xd8c02a?0xd8402a:0x9a3ad8,'e')}
  /* ceiling: steel beams with long strip lights between them */
  for(let z=41;z<=52.6;z+=2){
   for(const [x,w] of jovianTubeBeamSections(z,.3,15.4))bk.bot(x,5.05,z,w,.4,.3,0x5c6066,'m');
   for(const [x,w] of jovianTubeBeamSections(z+1,.4,11))bk.bot(x,4.97,z+1,w,.07,.4,0xeaf6ff,'e');
  }
  /* benches, bins, a ticket machine */
  for(const sx of[-1,1]){const x=sx*6.9,z=46.3;bk.bot(x,.45,z,.7,.07,2.2,0x3a2a1c,'w');bk.bot(x,0,z-.9,.6,.45,.12,DK,'m');bk.bot(x,0,z+.9,.6,.45,.12,DK,'m');col(x,z,.8,2.3,.9);bk.cyl(sx*5.3,0,41.3,.28,.28,.8,0x2a2f35,'m',10);col(sx*5.3,41.3,.6,.6,.8)}
  bk.bot(-7.1,0,41.6,.8,2,1.2,0x1c3f94,'m');bk.bot(-6.69,.5,41.6,.04,1.3,.9,0xaee4ff,'e');col(-7.1,41.6,.9,1.3,2);
 }
 /* substation: transformers, pipes, hazard stripes */
 for(const[x,z]of[[34,-22],[34,-14],[41,-13]]){R(x-1.4,z-1.4,x+1.4,z+1.4,3.4,0x4a5058,'metal');bk.cyl(x-.8,3.4,z,.18,.18,.8,0xcfd2d6,'m',6);bk.cyl(x+.8,3.4,z,.18,.18,.8,0xcfd2d6,'m',6)}
 for(let i=0;i<10;i++)bk.bot(31+i*1.5,.02,-18+.1,.7,.01,.5,i%2?0xd7b92a:0x1c1d20,'f');eSpot(36,5,-18,0xff8a40,.8,12,.7,1);
 /* street furniture */
 for(const[x,z]of[[-7,36],[7,36],[7,16],[-7,12],[-20,3],[20,3],[-26,-24],[26,-24],[-12,-30.8],[12,-30.8],[-22,-35],[0,-35],[-7,-3],[7,-3],[-24,-9],[24,-9]])lamp(x,z,x<0?0:PI_);
 phone(-5.4,10,0);phone(5.4,10,0);phone(24,-12,PI_);phone(-24,6,0);phone(0,-5,PI_/2);phone(27,-27,PI_);
 sand(-4.6,10.4,6,0);sand(4.6,10.4,6,0);sand(-12,-28.2,6,0);sand(12,-28.2,6,0);bus(-3.2,26,0.1);bus(-18,-2,PI_/2);bus(36.6,0,0);taxi(4,32,.3,0x1a1c22);taxi(18,4,PI_/2,0x1a1c22);taxi(-14,2,2.5,0x1a1c22);taxi(10,-26,.2,0x1a1c22);
 for(const[x,z]of[[-12,-8],[12,-8],[-12,-18],[12,-18],[-3,-12],[3,-12],[-22,-18],[22,-20]])tree(x,z);
 for(const[x,z,ry]of[[-5.4,-4.4,0],[5.4,-4.4,0],[-5.4,-19.5,PI_],[5.4,-19.5,PI_]])bench(x,z,ry);
 statue(-8,-8,0);statue(8,-8,PI_);statue(0,-24,PI_/2);
 /* Thames: water beyond the embankment wall with the bridge and the Eye on the far bank */
 V_(52,0,8.5,112,.05,0,0x14283a,'b','asphalt');V_(52,0,8.5,112,.07,.05,0x2a566e,'g');
 for(let i=0;i<=24;i++){const an=i/24*PI_*2;V_(84+Math.sin(an)*26,34+(-Math.cos(an))*0+0,.6,.6,26+Math.cos(an)*24,0,0xe8eef8,'e')}
 for(let i=0;i<12;i++){const an=i/12*6.283;V_(84,20,.5,.5,26+Math.cos(an)*24,0,0xd7dde8,'e')}
 V_(50,-6,6,10,.5,0,0x3a3c42,'b','concrete');for(let i=0;i<4;i++)V_(50,-10.5+i*3,5,.3,1.6,.5,0x24262a,'b','metal');
 /* sodium haze over the Palace Yard and the glow from Big Ben's dials */
 eSpot(TX-6,18,TZ+7,0xffe0a0,1.3,26,.9,2);eSpot(TX,40,TZ+9,0xffe8b8,1.1,40,.95,4);eSpot(-4,6,-36,0xffd890,.9,20,.9,5);
 return a.concat(EST.cols)}

/* ===================== the power ===================== */
/* power only matters on maps that say so (London). Revive Soda in the spawn room runs off an emergency generator, so a solo player can always buy their self-revive */
function zPowered(){const M=MAPS[sel.map];return !(M&&M.power)||!!(typeof zq!='undefined'&&zq&&zq.power)}
function noPower(){beep(110,.18,'square',.08);msg('The power is off. Find the switch in the substation',1.8)}
function lonMachFx(on){const O=EST.objs,list=[],skip=new Set();for(const k in O.mach){if(k=='rev')continue;list.push(O.mach[k].g);skip.add(O.mach[k].sign)}if(O.pap)list.push(O.pap.g);const f=on?1:.07;
 for(const g of list)g.traverse(o=>{if(!o.isMesh&&!o.isSprite)return;let m=o.material;if(!m||Array.isArray(m)||!m.color||skip.has(m))return;if(!o.userData.pc){m=o.material=m.clone();o.userData.pc=m.color.clone();if(m.emissive)o.userData.pe=m.emissive.clone()}
  m.color.copy(o.userData.pc).multiplyScalar(m.isMeshBasicMaterial||m.isSpriteMaterial?f:on?1:.4);if(m.emissive&&o.userData.pe)m.emissive.copy(o.userData.pe).multiplyScalar(f)})}
var LONEGG={got:[0,0,0],boil:0,kills:0,done:0,tt:0,items:[]};
function lonPowerOn(quiet){if(zq.power)return;zq.power=1;lonMachFx(true);const lv=EST.lon&&EST.lon.lever;if(lv){lv.on=1}
 if(!quiet){EST.lt.flash=1;EST.lt.rep=3;LX.fx.pulse=Math.max(LX.fx.pulse,.5);shake=Math.max(shake,.5);noise(1.2,200,.5);beep(60,1.2,'sawtooth',.14);[392,523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,.5,'triangle',.07),300+i*140));
  for(const k in EST.objs.mach){const o=EST.objs.mach[k];burst(V(o.g.position.x,1.6,o.g.position.z),22,0xfff0b0,6,.8,.12)}if(EST.objs.pap)burst(V(EST.objs.pap.g.position.x,1.6,EST.objs.pap.g.position.z),30,0xa070ff,6,.8,.14);
  popup('POWER RESTORED','Perk machines and Pack-a-Punch are live. Something is whistling in the pub…')}}
/* ===================== the easter egg: The Great British Brew =====================
   1 restore the power  2 find the kettle (the pub), the tea tin (the Abbey altar) and a teacup (the Tube station)  3 take them to the foot of Big Ben and brew:
   hold out in the Palace Yard for 70 seconds and put down 16 zombies near the tower. The tea blaster, The Brew, is yours, and it joins the Mystery Box. */
function lonAct(a){if(netOn&&!isHost){netSend({t:'zlon',a,by:zMe()});return}lonDo(a)}
function lonDo(a){if(a=='power'){if(zq.power)return;lonPowerOn();return}if(!zq.power)return;const E=LONEGG;
 if(a.startsWith('item')){const i=+a[4];if(E.got[i])return;E.got[i]=1;lonItemFx(i);const n=E.got.reduce((s,v)=>s+v,0);msg(n<3?`Found the ${['kettle','tea tin','teacup'][i]} · tea set ${n}/3`:'The tea set is complete. Take it to Big Ben',2.4);if(n==3)popup('THE TEA SET','Bring it to the foot of Big Ben, in the Palace Yard');return}
 if(a=='brew'){if(E.done||E.boil>0||E.got.some(v=>!v))return;E.boil=70;E.kills=0;E.tt=0;popup('THE KETTLE IS ON','Only zombies with glowing yellow eyes inside the golden circle count: 16 kills in 70 seconds');beep(220,.6,'sine',.1);return}}
function lonItemFx(i){const it=LONEGG.items[i];if(it){it.g.visible=false;burst(V(it.x,it.y,it.z),18,0xfff0b0,3,.8,.08)}beep(660,.2,'triangle',.08);setTimeout(()=>beep(880,.25,'triangle',.07),110)}
function lonKill(b){const E=LONEGG;if(E.boil>0&&Math.hypot(b.x-16,b.z+38)<18)E.kills++}
function lonFinish(){const E=LONEGG;E.boil=0;E.done=1;zq.tea=1;burst(V(16,2,-33),50,0xffd890,7,1.4,.14);EST.lt.flash=1;[196,147,98,196].forEach((f,i)=>setTimeout(()=>{beep(f,1.2,'sine',.12);beep(f*2,.9,'triangle',.05)},i*520));popup('TIME FOR TEA','You unlocked The Brew. It is also in the Mystery Box now');lonGiveTea()}
function lonGiveTea(){if(zq.teaGot)return;zq.teaGot=1;zGive('TEA')}
/* items, the power switch and the tower door are built once the zombies pipeline has made the doors, machines and boxes */
MAPS.London.objs=function(M){const E=LONEGG;try{lonStn()}catch(e){console.warn('station',e)}E.got=[0,0,0];E.boil=0;E.kills=0;E.done=0;E.items=[];zq.power=0;zq.tea=0;zq.teaGot=0;
 /* machines start dark */
 lonMachFx(false);for(const s of EST.spots)if(Math.hypot(s.x,s.z)>0){for(const m of M.mc)if(m.t&&m.t!='rev'&&m.t!='wall'&&m.t!='ammo'&&m.t!='box'&&Math.hypot(s.x-m.x,s.z-m.z)<3.2){s.pw=1}}
 /* the power switch */
 {const g=new THREE.Group(),f=eFace('w');g.position.set(45.1,0,-18);g.rotation.y=f;const cab=eM(0x2a2d31,0,.5,.7),yel=eM(0xd7b92a,0,.6,.2),red=eM(0xc4261d,0,.4,.3),brass=eM(0xb08a3a,0,.3,1);
  eMk(g,EG.box,cab,0,1.4,0,2.6,2.8,.9);eMk(g,EG.box,yel,0,2.62,.46,2.6,.16,.02);eMk(g,EG.box,eM(0x16181b,0,.6,.4),0,1.5,.47,1.9,1.5,.06);
  const lamp=eBasic(0xc41a14,1);eMk(g,EG.cyl,lamp,-.7,2.1,.52,.1,.04,.1,PI/2);const lamp2=eBasic(0x16c43a,.15);eMk(g,EG.cyl,lamp2,.7,2.1,.52,.1,.04,.1,PI/2);
  const lev=new THREE.Group();lev.position.set(0,1.5,.52);g.add(lev);eMk(lev,EG.cyl,brass,0,0,0,.14,.1,.14,PI/2);eMk(lev,EG.box,eM(0xcfd2d6,0,.3,.9),0,.55,0,.07,1.1,.07);eMk(lev,EG.sph,red,0,1.15,0,.17,.17,.17);
  eMk(g,EG.pl,eCanvasMat(256,64,(x,w,h)=>{x.fillStyle='#d7b92a';x.fillRect(0,0,w,h);x.fillStyle='#111';x.font='700 38px Teko,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('MAIN POWER · DANGER',w/2,h/2+2)}),0,.55,.47,1.6,.4,1);
  zG.add(g);const o=EST.lon={lever:{g,lev,lamp,lamp2,on:0,a:-.9}};lev.rotation.z=-.9;col2(45.1,-18,.9,2.6,2.8);
  zi.push({x:44.0,z:-18,r:2.8,txt:()=>zq.power?'':'Throw the main power switch',cost:()=>0,act:()=>lonAct('power')});
  EST.dyn.push({tick(dt,t){const L=o.lever,tg=L.on?.9:-.9;L.a+=(tg-L.a)*Math.min(1,dt*(L.on?9:3));L.lev.rotation.z=L.a;L.lamp.color.setRGB(L.on?.1:1.6+.4*Math.sin(t*6),.1,.1);L.lamp2.color.setRGB(.1,L.on?1.6:.15,.1);
   for(const s of EST.spots)if(s.pw){if(!zq.power){if(s.I>0){s.I0=s.I;s.I=0}}else if(s.I0){s.I=s.I0;s.I0=0}}
   lonEggTick(dt,t)}})}
 /* the tea set: three small glowing props */
 const mk=(i,x,y,z,build)=>{const g=new THREE.Group();g.position.set(x,y,z);build(g);const h=new THREE.Mesh(EG.sph,eBasic(0xffd890,.14,1));h.scale.setScalar(.5);g.add(h);zG.add(g);const it={g,x,y,z,h};E.items[i]=it;
  zi.push({x,z,r:2.4,txt:()=>!zq.power||E.got[i]?'':['Take the kettle','Take the tea tin','Take the teacup'][i],cost:()=>0,act:()=>lonAct('item'+i)})};
 mk(0,13,1.1,15.7,g=>{const w=eM(0xcfd2d6,0,.25,.9),bl=eM(0x15171a,0,.6,.4);eMk(g,EG.cyl,w,0,.12,0,.14,.2,.14);eMk(g,EG.cyl,w,0,.26,0,.1,.04,.1);eMk(g,EG.sph,bl,0,.3,0,.03,.03,.03);eMk(g,EG.cyl,w,.17,.17,0,.03,.14,.03,0,0,-1);eMk(g,EG.box,bl,-.15,.2,0,.02,.15,.03)});
 mk(1,-52.3,1.3,-11.3,g=>{eMk(g,EG.cyl,eM(0x9c1a1a,0,.4,.6),0,.1,0,.1,.2,.1);eMk(g,EG.cyl,eM(0xc9a23a,0,.3,.9),0,.21,0,.105,.03,.105);eMk(g,EG.cyl,eM(0xf0e8d0,0,.7,0),0,.1,0,.102,.1,.102)});
 mk(2,3.4,1.05,44.3,g=>{const p=eM(0xf2ece0,0,.4,.1);eMk(g,EG.cyl,p,0,.06,0,.08,.1,.08);eMk(g,EG.cyl,eM(0x2b4f9e,0,.4,.1),0,.12,0,.082,.012,.082);eMk(g,EG.cyl,eM(0xb5651d,0,.3,0),0,.115,0,.07,.01,.07);eMk(g,EG.cyl,p,.1,.07,0,.03,.07,.01,PI/2)});
 /* the tower door and a ring on the ground while the tea brews */
 {const ring=new THREE.Mesh(new THREE.RingGeometry(17.7,18.15,72),new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(16,.09,-38);zG.add(ring);E.ring=ring;
  zi.push({x:16,z:-33,r:3.4,txt:()=>!zq.power||E.done||E.boil>0?'':E.got.some(v=>!v)?'The tower door is shut':'Put the kettle on',cost:()=>0,act:()=>{if(E.got.some(v=>!v)){msg('You need the whole tea set first',1.8);return}lonAct('brew')}})}
 /* the HUD line for the brew */
 let h=document.getElementById('egg');if(!h){h=document.createElement('div');h.id='egg';document.getElementById('hud').appendChild(h)}E.hud=h};
var col2=(x,z,w,d,h)=>{zSolid(x,z,w,d,h)};
function lonEggTick(dt,t){const E=LONEGG;for(const it of E.items){if(!it||!it.g.visible)continue;it.g.position.y=it.y+Math.sin(t*2+it.x)*.04;it.g.rotation.y+=dt*.8;it.h.material.opacity=(zq.power?.2:.07)+.08*Math.sin(t*3+it.z)}
 if(E.hud){const on=E.boil>0;E.hud.style.display=on?'block':'none';if(on)E.hud.textContent=`THE BREW  ·  ${Math.min(16,E.kills)} / 16 kills  ·  ${Math.ceil(E.boil)}s`}
 if(E.ring){const on=E.boil>0;E.ring.material.opacity=on?.28+.12*Math.sin(t*4):0}
 /* the Big Ben step: a zombie inside the circle has glowing yellow eyes and a yellow aura, and only those count; step out of the circle and the glow goes out */
 {const on=E.boil>0;if(on||E.gl){E.gl=0;for(const b of bots){if(!b.zom||!b.rig||!b.rig.setGlow)continue;const g=on&&b.al&&Math.hypot(b.x-16,b.z+38)<18;if(g)E.gl=1;b.rig.setGlow(g,t)}}}
 if(E.boil>0&&(!netOn||isHost)){E.boil-=dt;E.tt+=dt;if(E.tt>2.4){E.tt=0;const al=bots.filter(b=>b.zom&&b.al).length;if(al<22&&zq.open[7])zSpawn(MAPS.London,false)}
  if(E.kills>=16)lonFinish();else if(E.boil<=0){E.boil=0;popup('THE TEA WENT COLD','Try again: the tea set is still yours');}}
 if(zq.tea&&!zq.teaGot&&LONEGG.done)lonGiveTea()}
/* Big Ben chimes with every new round (the zombies pipeline already rings its own bell: this adds the hour) */
{const _rf=zRoundFx;zRoundFx=function(){const r=_rf.apply(this,arguments);if(sel.map=='London'&&zq){const n=Math.min(8,zq.r);setTimeout(()=>{for(let i=0;i<n;i++)setTimeout(()=>{if(run&&mode=='Zombies'){beep(98,1.6,'sine',.12);beep(196,1.2,'triangle',.04);beep(392,.8,'sine',.02)}},i*1500)},3800)}return r}}
/* co-op: the host shares the power and the brew; guests copy it */
function lonPack(){const E=LONEGG;return typeof zq!='undefined'&&zq?[zq.power?1:0,E.got[0]|E.got[1]<<1|E.got[2]<<2,E.done?1:0,Math.round(E.boil),E.kills,zq.tea?1:0]:0}
function lonSync(d){if(!d.lo||sel.map!='London')return;const[p,g,dn,bo,k,t]=d.lo,E=LONEGG;if(p&&!zq.power)lonPowerOn();for(let i=0;i<3;i++){const h=(g>>i)&1;if(h&&!E.got[i]){E.got[i]=1;lonItemFx(i)}}if(t)zq.tea=1;E.boil=bo;E.kills=k;if(dn&&!E.done){E.done=1;zq.tea=1;lonGiveTea()}}
/* every map is registered now: build the Zombies map screen */
if(typeof zMapScreen=='function')zMapScreen();

/* ---------- the Tube station: signs, the departure board and the sound of trains ---------- */
var LST={bd:null,t:0,nx:25,mins:[2,5]};
function lonStn(g=zG||S,state=LST){const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);return{t,c}},
 pl=(t,w,h,x,y,z,ry,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.position.set(x,y,z);m.rotation.y=ry||0;if(rx)m.rotation.x=rx;g.add(m);return m},
 name=cv(512,96,(c,w,h)=>{c.fillStyle='#f4f2ea';c.fillRect(0,0,w,h);c.fillStyle='#b3121b';c.fillRect(0,6,w,6);c.fillRect(0,h-12,w,6);c.fillStyle='#1c3f94';c.fillRect(0,26,w,44);c.fillStyle='#fff';c.font='700 46px Teko,Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('WESTMINSTER',w/2,49)});
 for(const[x,z,ry]of[[-5.2,40.33,0],[5.2,40.33,0],[7.64,44.9,-Math.PI/2],[-7.64,44.9,Math.PI/2]])pl(name.t,3.2,.6,x,3.3,z,ry);
 const exit=cv(512,96,(c,w,h)=>{c.fillStyle='#16a34a';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='700 52px Teko,Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('WAY OUT  ▲',w/2,50)});pl(exit.t,2.4,.45,0,4.5,40.33,0);
 const gap=cv(512,64,(c,w,h)=>{c.fillStyle='#f6d21c';c.font='700 54px Teko,Impact,sans-serif';c.textAlign='center';c.textBaseline='middle';c.letterSpacing='8px';c.fillText('MIND THE GAP',w/2,34)});for(const x of[-3.2,3.2])pl(gap.t,3.6,.45,x,.04,49.6,0,-Math.PI/2);
 const bd=cv(512,160,()=>{});state.bd=bd;state.bm=pl(bd.t,2.6,.8,7.64,3.9,48.6,-Math.PI/2);state.t=0;state.nx=20+Math.random()*10;state.mins=[2,5];lonBoard(true,state)}
function lonBoard(force,state=LST){const b=state.bd;if(!b)return;const c=b.c.getContext('2d'),w=512,h=160;c.fillStyle='#08090b';c.fillRect(0,0,w,h);c.fillStyle='#ffb020';c.font='700 38px Teko,Impact,sans-serif';c.textBaseline='middle';c.textAlign='left';
 const rows=[['1','Stratford',state.mins[0]],['2','Morden',state.mins[1]]];rows.forEach((r,i)=>{const y=40+i*56;c.fillText(r[0]+'   '+r[1],24,y);c.textAlign='right';c.fillText(r[2]<=0?'DUE':r[2]+' min',w-24,y);c.textAlign='left'});
 c.fillStyle='#ffffff14';for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1);b.t.needsUpdate=true}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(mode=='Zombies'&&sel.map=='London'&&LST.bd&&run&&!paused){LST.t+=dt;if(LST.t>=1){LST.t=0;LST.mins[0]=LST.mins[0]<=0?4+(Math.random()*3|0):LST.mins[0]-(Math.random()<.25?1:0);LST.mins[1]=LST.mins[1]<=0?5+(Math.random()*4|0):LST.mins[1]-(Math.random()<.2?1:0);lonBoard()}
 LST.nx-=dt;if(LST.nx<=0){LST.nx=38+Math.random()*30;const d=Math.hypot(P.x,P.z-46);if(d<46){const g=Math.max(.15,1-d/46);flNoise(4.2,200,55,.07*g,'lowpass',.5,.35);flTone(62,48,3.6,.05*g,.2,'triangle',300);setTimeout(()=>flNoise(1.1,3200,900,.025*g,'bandpass',2,0),2600);shake=Math.max(shake,.12*g);LX.fx.pulse=Math.max(LX.fx.pulse,.1*g)}}}}catch(e){}}}
;

function zQuestInteract(q,id,x,z,prompt,apply){
 const r=id==='altar'?2.4:2.05;
 const use=by=>{
  const pl=zPlayers().find(p=>p.id===by);
  if(q!==zq.main||!pl||!prompt()||Math.hypot(x-pl.x,z-pl.z)>r+(pl.me?0:.3)||Math.abs(pl.y)>.95)return;
  const dx=x-pl.x,dz=z-pl.z,d=Math.hypot(dx,dz);
  if(d>.1&&castW(V(pl.x,1.15,pl.z),V(dx/d,0,dz/d),d)<d-.16)return;
  apply(by);
 };
 (q.actions||(q.actions=new Map())).set(id,use);
 zi.push({x,z,r,txt:prompt,cost:()=>0,act:()=>zCli()?netSend({t:'zmainuse',a:id}):use(zMe())});
}
function zQuestProp(q,x,z,kind,index){
 const g=new THREE.Group();
 g.position.set(x,0,z);
 zG.add(g);
 const gold=eM(q.london?0x9a703c:0x66535b,0,.48,.52);
 const base=eM(q.london?0x263036:0x49444e,0,.83,.12);
 const lit=new THREE.MeshBasicMaterial({color:q.def.color});
 let rotor=null;
 if(kind==='paper'){
  const room=q.london?'WESTMINSTER CLOCK WORKS':'HOLLOW ESTATE';
  eMk(g,EG.box,base,0,.47,0,.56,.94,.43);
  eMk(g,EG.box,gold,0,.93,0,.67,.1,.55);
  const plate=eCanvasMat(256,160,(ctx,w,h)=>{
   ctx.fillStyle='#c1af8f';ctx.fillRect(0,0,w,h);
   ctx.strokeStyle='#352a22';ctx.lineWidth=4;ctx.strokeRect(8,8,w-16,h-16);
   ctx.fillStyle='#352a22';ctx.textAlign='center';ctx.font='bold 17px Georgia';
   ctx.fillText(room,w/2,39);
   for(let i=0;i<5;i++)ctx.fillRect(30,60+i*15,165+(i%3)*12,2);
  },true);
  eMk(g,EG.pl,plate,0,1,0,.56,.34,1,-1.28,q.london?.35:0);
 }else if(kind==='relic'){
  if(q.london)eMk(g,EG.cyl,base,0,.47,0,.69,.94,.69);
  rotor=new THREE.Group();rotor.position.y=q.london?1.13:1.09;g.add(rotor);
  eMk(rotor,EG.cyl,gold,0,0,0,.23,.075,.23,Math.PI/2);
  eMk(rotor,EG.cyl,lit,0,0,.046,.095,.032,.095,Math.PI/2);
  for(let i=0;i<8;i++){
   const t=i*Math.PI/4;
   eMk(rotor,EG.box,gold,.23*Math.sin(t),.23*Math.cos(t),0,.065,.095,.075,0,0,-t);
  }
 }else{
  const altar=kind==='altar',w=altar?.88:.62;
  eMk(g,EG.cyl,base,0,.16,0,w,.32,w);
  eMk(g,EG.cyl,base,0,.62,0,w*.67,.72,w*.67);
  eMk(g,EG.cyl,gold,0,.97,0,w,.15,w);
  rotor=new THREE.Group();rotor.position.y=1.17;g.add(rotor);
  if(q.london){
   eMk(rotor,EG.cyl,gold,0,0,0,w*.43,.22,w*.43);
   eMk(rotor,EG.cyl,lit,0,.119,0,w*.28,.018,w*.28);
   for(const side of [-1,1])eMk(g,EG.box,gold,side*w*.34,1.18,0,.082,.4,.18,0,0,side*.23);
  }else{
   eMk(g,EG.cyl,gold,0,1.07,0,w*.79,.08,w*.79);
   eMk(rotor,EG.sph,lit,0,.07,0,.12,.24,.12,0,0,.17);
   eMk(rotor,EG.sph,lit,0,.27,0,.071,.16,.071,0,0,-.37);
  }
 }
 q.props.push({g,kind,index,rotor,lit});
}
function zQuestNotice(q,line){
 msg(line,3.5);
 if(netOn&&isHost)netSend({t:'zmainnote',line});
}
function zQuestCue(q,x,z,big,remote=false){
 burst(V(x,1.1,z),big?35:13,q.def.color,big?6:2.6,big?1.05:.58,.13);
 if(Math.hypot(P.x-x,P.z-z)<28){
  if(big){beep(q.london?83:61,1.15,'triangle',.12);noise(.42,240,.52);shake=Math.max(shake,.56)}
  else beep(q.london?465:330,.25,'triangle',.085);
 }
 if(netOn&&isHost&&!remote)netSend({t:'zmaincue',x,z,big});
}
function zQuestReward(q){
 if(q.rewarded||!q.credit.includes(zMe()))return;
 q.rewarded=true;
 const id=q.def.skin,name=OPERATORS[id].name;
 const first=!window.SD_MOD_SESSION&&prof.zquest?.[id]!==true;
 if(first){
  prof.zquest={...prof.zquest,[id]:true};
  save();
 }
 popup(q.def.title.toUpperCase(),first?'Locker reward unlocked · '+name:q.def.boss+' defeated');
 zq.pts+=2500;
 beep(523,.28,'triangle',.1);
 setTimeout(()=>{if(zq?.main===q&&run)beep(784,.62,'triangle',.1)},190);
}
function zQuestClear(q){
 for(const hz of q.hazards.values())zQuestDropHazard(q,hz);
}
function zQuestHazard(q,kind,x,z,r,wind){
 const id=++q.serial;
 const duration=kind==='wave'?1.9:kind==='hex'?3.8:.34;
 const h=zQuestHazardView(q,id,kind,x,z,r,wind,duration);
 h.age=-wind;h.hits=new Set();h.pulse=0;
}
function zQuestHazardView(q,id,kind,x,z,r,wind,duration){
 const g=new THREE.Group();g.position.set(x,.15,z);q.fx.add(g);
 const shape=(geo,opacity,y)=>{
  const mat=new THREE.MeshBasicMaterial({color:q.def.color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
  const m=new THREE.Mesh(geo,mat);m.position.y=y;m.rotation.x=-Math.PI/2;g.add(m);return m;
 };
 const geo=q.hazardGeo||(q.hazardGeo={
  ring:new THREE.RingGeometry(.84,1,48),fill:new THREE.CircleGeometry(1,48),
  beam:new THREE.CylinderGeometry(.025,.96,1,12,1,true)
 });
 const ring=shape(geo.ring,.8,.005),fill=shape(geo.fill,.21,0);
 const flare=kind==='wave'?null:new THREE.Mesh(geo.beam,new THREE.MeshBasicMaterial({
  color:q.def.color,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 }));
 if(flare){flare.position.y=2.15;g.add(flare)}
 const h={id,kind,x,z,r,wind,duration,age:-wind,g,ring,fill,flare};
 q.hazards.set(id,h);return h;
}
function zQuestDropHazard(q,h){
 q.fx.remove(h.g);h.g.traverse(o=>{if(o.isMesh)o.material.dispose()});q.hazards.delete(h.id);
}
function zQuestTouch(q,pl,b,damage){
 if(pl.me){
  if(zq.dash?.t>0)return;
  hurt(damage,b);shake=Math.max(shake,.44);
 }else if(netOn)netSend({t:'zmainhit',to:pl.id,d:damage});
}
function zQuestHazardTick(q,dt,players){
 for(const h of q.hazards.values()){
  const was=h.age;h.age+=dt;
  if(h.age>=h.duration){zQuestDropHazard(q,h);continue}
  const warning=h.age<0,progress=warning?1+h.age/h.wind:h.age/h.duration;
  const wave=h.kind==='wave',radius=wave?(warning?1.25:.85+(h.r-.85)*progress):h.r;
  h.ring.scale.setScalar(radius);
  h.ring.material.opacity=warning?.62+.3*Math.sin(progress*22)**2:wave?.92-.35*progress:.72;
  h.fill.visible=!wave;
  h.fill.scale.setScalar(warning?radius*(.3+.7*progress):radius);
  h.fill.material.opacity=warning?.13+.15*progress:.25*(1-progress)+.1;
  if(h.flare){
   h.flare.scale.set(radius*.66,warning?1:Math.max(.7,4.3*(1-progress)),radius*.66);
   h.flare.material.opacity=warning?0:(h.kind==='hex'?.43:.75)*(1-progress);
  }
  if(was<0&&!warning){
   if(Math.hypot(h.x-P.x,h.z-P.z)<26){noise(wave?.6:.26,wave?165:450,.45);shake=Math.max(shake,.24)}
   burst(V(h.x,.36,h.z),wave?35:23,q.def.color,5,.7,.13);
  }
  if(!players||warning)continue;
  if(h.kind==='hex'&&h.age>=h.pulse){h.pulse+=.78;h.hits.clear()}
  for(const pl of players){
   if(h.hits.has(pl.id))continue;
   const d=Math.hypot(pl.x-h.x,pl.z-h.z);
   let hit=wave?Math.abs(d-radius)<Math.max(.95,dt*12)&&pl.y<.72:d<=radius;
   if(hit&&!wave)hit=pl.y<1.65;
   if(!hit)continue;
   h.hits.add(pl.id);
   const damage=q.fight?(wave?37+q.phase*5:h.kind==='hex'?(h.age<.75?34+q.phase*4:13):32+q.phase*5):
    (wave?32:h.kind==='hex'?(h.age<.75?28:12):27);
   zQuestTouch(q,pl,q.actor,damage);
  }
 }
}

/* Quest progress and encounter decisions belong to the Zombies host. */
const ZMAIN={
 London:{
  skin:'bellwatch',title:'The Thirteenth Hour',boss:'The Bellkeeper',color:0xffba67,
  realm:'The Unwound Belfry',ink:0x18161f,entry:[8,-36],
  dossier:[-5.8,46],relic:[-49,-15],
  trials:[
   {site:'Whitehall',at:[-5,22],round:6,seconds:90,kills:11},
   {site:'Parliament Square',at:[10,-10],round:10,seconds:110,kills:15},
   {site:'Palace Yard',at:[-11,-35],round:15,seconds:145,kills:20}
  ],
  phases:['The Pendulum','The Broken Dial','The Thirteenth Chime']
 },
 'Hollow Estate':{
  skin:'estatewarden',title:'The Last Testament',boss:'The Hollow Steward',color:0xbb9bff,
  realm:'The Court Below',ink:0x130e25,entry:[34,-43.7],
  dossier:[-11.5,30.1],relic:[29,-17.65],
  trials:[
   {site:'Ballroom',at:[5,4],round:6,seconds:90,kills:11},
   {site:'Conservatory',at:[10,-17],round:10,seconds:110,kills:15},
   {site:'Back garden',at:[10,-33],round:15,seconds:145,kills:20}
  ],
  phases:['The Procession','The Grasping Dead','The Last Oath']
 }
};
const ZMAIN_ARENA_X=240,ZMAIN_EDGE=23;
const ZMAIN_PHASE_END=[1,.68,.34,0],ZMAIN_OPENINGS=[4,4,5];
const ZMAIN_CUT_TIME={arrival:5.8,final:2.9,victory:4.3};
const zQuestCutActive=()=>mode==='Zombies'&&!!zq?.main?.cut&&zQuestInArena(P.x,P.z);
const zQuestActive=()=>jupiterFinaleActive()||!!(zq?.main&&(zq.main.fight||zq.main.trial));
function zQuestInArena(x,z){return Math.abs(x-ZMAIN_ARENA_X)<ZMAIN_EDGE+1&&Math.abs(z)<ZMAIN_EDGE+1}
function zQuestCinema(q,kind,left=ZMAIN_CUT_TIME[kind]){
 if(!Object.hasOwn(ZMAIN_CUT_TIME,kind))return;
 q.cut={kind,until:q.clock+cl(left,0,ZMAIN_CUT_TIME[kind])};
 if(zQuestCutActive()){zq.dash.t=0;trig=fresh=0}
}
function zQuestCinemaView(q){
 const active=zQuestCutActive(),el=$('#zcinema'),kind=active?q.cut.kind:'';
 if((el.dataset.scene||'')===kind)return;
 el.dataset.scene=kind;el.hidden=!active;
 document.body.classList.toggle('zquest-cinematic',active);
 if(!active)return;
 const box=el.firstElementChild,[label,title,caption]=box.children;
 el.style.setProperty('--chapter-ink','#'+q.def.color.toString(16));
 label.textContent=q.def.realm;
 title.textContent=kind==='arrival'?q.def.boss:kind==='final'?q.def.phases[2]:q.london?'Silence at Last':'The Oath Is Broken';
 caption.textContent=kind==='arrival'?(q.london?'The clock strikes beyond its final hour.':'Something beneath the estate answers.'):
  kind==='final'?(q.london?'The gears lose their rhythm.':'The court rises with its keeper.'):
   q.london?'The bells fall silent above London.':'The passage back to the estate opens.';
}
function zQuestViewCamera(){
 if(!zQuestCutActive()||xrS)return null;
 const q=zq.main,kind=q.cut.kind,actor=q.actor,cut=q.camera||=new THREE.PerspectiveCamera(46,C.aspect,.08,140);
 q.reducedMotion??=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const t=q.reducedMotion?.68:cl(1-(q.cut.until-q.clock)/ZMAIN_CUT_TIME[kind],0,1);
 const eased=t*t*(3-2*t),arrival=kind==='arrival',victory=kind==='victory';
 const angle=(q.london?-.66:.72)+(q.london?1:-1)*eased*(arrival?1.16:.87);
 const radius=arrival?21-9*eased:victory?9+8*eased:11+3*eased;
 const x=actor?.x??ZMAIN_ARENA_X,z=actor?.z??-5;
 cut.position.set(cl(x+Math.sin(angle)*radius,ZMAIN_ARENA_X-23,ZMAIN_ARENA_X+23),
  arrival?(q.london?8.6-4.7*eased:3.1+3.5*eased):victory?4+5*eased:6.35,
  cl(z+Math.cos(angle)*radius,-23,23));
 cut.lookAt(x,arrival?3.75:kind==='final'?3.35:1.8,z);
 if(cut.aspect!==C.aspect){cut.aspect=C.aspect;cut.updateProjectionMatrix()}
 cut.updateMatrixWorld();
 return cut;
}
function zQuestResetCinema(){
 jupiterHideIntro();
 $('#zcinema').hidden=true;$('#zcinema').dataset.scene='';
 document.body.classList.remove('zquest-cinematic');
}
function zQuestStart(){
 const h=$('#zmain');h.hidden=true;
 const def=ZMAIN[sel.map];if(!def)return;
 const fx=new THREE.Group();zG.add(fx);
 const q=zq.main={def,fx,london:sel.map==='London',step:0,clock:0,serial:0,phase:0,ward:0,warm:0,
  credit:[],fight:false,hazards:new Map(),props:[],roster:{},visit:0,localVisit:0};
 h.style.setProperty('--boss-ink','#'+def.color.toString(16));
 function node(id,at,kind,index,prompt,apply){
  const [x,z]=zFreeSpot(...at);
  zQuestProp(q,x,z,kind,index);
  zQuestInteract(q,id,x,z,prompt,apply);
  return {x,z,art:q.props.at(-1).g};
 }
 node('docket',def.dossier,'paper',0,()=>q.step===0?(q.london?'Read the Westminster docket':'Read the abandoned ledger'):'',()=>{
  q.step=1;
  zQuestNotice(q,q.london?'Restore substation power. Recover the escapement from Westminster Abbey.':'Find the family seal in the master’s study. It is keeping a pair of Nitrogen Fists in stasis.');
 });
 node('relic',def.relic,'relic',0,()=>q.step===1?(q.london?'Recover the escapement':'Break the gauntlet stasis'):'',by=>{
  if(q.london&&!zq.power){zQuestNotice(q,'Restore power at the substation first.');return}
  q.step=2;
  if(!q.london)zQuestGrantFists(by);
  zQuestNotice(q,q.london?'Brew the tower’s weapon. Its steam opens each of the three condensers.':'Dash through the Ballroom oathstone when round 6 begins.');
 });
 if(!q.london)zQuestInteract(q,'fists',q.props[1].g.position.x,q.props[1].g.position.z,
  ()=>q.step>=2&&!q.fight&&!q.won&&zMelKey()!=='Nitrogen Fists'?'Recover Nitrogen Fists':'',zQuestGrantFists);
 if(q.london)zQuestInteract(q,'brew',16,-33,
  ()=>q.step>=2&&!q.fight&&!q.won&&zq.tea&&!wp.some(w=>w.k==='TEA')?'Take a replacement Brew':'',by=>{
   if(by===zMe()){if(!wp.some(w=>w.k==='TEA'))zGive('TEA')}
   else netSend({t:'zmainnote',to:by,tea:true});
  });
 q.nodes=def.trials.map((trial,index)=>({
  ...trial,...node('station'+index,trial.at,'altar',index,()=>q.step===index+2&&!q.trial?
   zq.r<trial.round?'Seal opens on round '+trial.round:q.london?'Vent this condenser with The Brew':'Dash through this seal':'',
   ()=>zQuestNotice(q,q.london?'Aim The Brew at the glowing condenser and fire.':'Draw the Nitrogen Fists and use Aim to dash into the seal.'))
 }));
 q.entry=node('entry',def.entry,'altar',3,()=>q.step===5&&!q.fight&&!q.won?'Open the passage to '+def.realm:'',()=>zQuestBegin(q));
 q.nodes.forEach(n=>{
  const m=new THREE.Mesh(new THREE.RingGeometry(7.7,8,48),new THREE.MeshBasicMaterial({
   color:def.color,transparent:true,opacity:.44,depthWrite:false,side:THREE.DoubleSide
  }));
  m.rotation.x=-Math.PI/2;m.position.set(n.x,.08,n.z);fx.add(m);m.visible=false;n.ring=m;
 });
}
function zQuestGrantFists(by){
 if(by===zMe()){if(zMelKey()!=='Nitrogen Fists')zGiveMel('NF')}
 else netSend({t:'zmainnote',to:by,fists:true});
}
function zQuestStrike(q,by,x,y,z,kind){
 if(!q||q.won||!Number.isFinite(x+y+z))return;
 const pl=zPlayers().find(p=>p.id===by);
 if(!pl||Math.abs(y)>3.5||Math.hypot(pl.x-x,pl.z-z)>(kind==='dash'?4:36))return;
 if(kind!==(q.london?'steam':'dash'))return;
 if(q.fight){
  if(q.cut)return;
  if(!zQuestInArena(pl.x,pl.z))return;
  q.locks.forEach((lock,i)=>{
   const bit=1<<i;
   if(!(q.ward&bit)||Math.hypot(x-lock.x,z-lock.z)>(q.london?2:1.65))return;
   q.ward&=~bit;zQuestCue(q,lock.x,lock.z,true);
   if(!q.ward){q.readyAt=Math.max(q.readyAt,q.clock+.6);zQuestNotice(q,'Ward shattered. Dodge the next attack for an opening.')}
  });
  return;
 }
 const n=q.nodes[q.step-2];
 if(!n||q.trial||zq.hound&&!zq.hound.done||zq.r<n.round||Math.hypot(x-n.x,z-n.z)>(q.london?2:1.65))return;
 if(q.london&&(!zq.tea||!zq.power))return;
 q.trial={time:0,kills:0,next:.5,attack:0};
 zQuestCue(q,n.x,n.z,true);
 zQuestNotice(q,'Stay inside the ring and defeat the marked dead.');
}
function zQuestTool(kind,x,y,z){
 const q=zq?.main;
 if(!q||q.won||q.london!==(kind==='steam'))return;
 const n=q.nodes[q.step-2],active=q.fight?q.locks.filter((_,i)=>q.ward&(1<<i)):!q.trial&&n&&zq.r>=n.round?[n]:[];
 if(!active.some(p=>Math.hypot(x-p.x,z-p.z)<2.05))return;
 if(zCli())netSend({t:'zmainuse',kind,x,y,z});
 else zQuestStrike(q,zMe(),x,y,z,kind);
}
function zQuestSteam(origin,direction,length){
 const q=zq?.main;if(!q?.london||q.won)return;
 const active=q.fight?q.locks.filter((_,i)=>q.ward&(1<<i)):[q.nodes[q.step-2]].filter(Boolean);
 for(const n of active){
  const p=V(n.x,1.25,n.z).sub(origin),range=p.dot(direction);
  if(range>0&&range<Math.min(36,length+.1)&&p.addScaledVector(direction,-range).lengthSq()<1.15)
   zQuestTool('steam',n.x,1.25,n.z);
 }
}
function zQuestKill(b){
 const q=zq.main;if(!q?.trial||!b.zquestAdd)return;
 const n=q.nodes[q.step-2];
 if(Math.hypot(b.x-n.x,b.z-n.z)>8.4)return;
 q.trial.kills++;
 burst(V(b.x,.65,b.z),12,q.def.color,2.4,.6,.11);
}
function zQuestRemoveAdds(){
 for(let i=bots.length-1;i>=0;i--){
  const b=bots[i];if(!b.zquestAdd||!b.al)continue;
  S.remove(b.m);bots.splice(i,1);
 }
}
function zQuestTrial(q,dt){
 const n=q.nodes[q.step-2],t=q.trial,players=zPlayers().filter(p=>Math.hypot(p.x-n.x,p.z-n.z)<8.1);
 if(players.length){t.time+=dt;t.empty=0}
 else {t.empty=(t.empty||0)+dt;if(t.empty>14){q.trial=null;zQuestRemoveAdds();zQuestClear(q);zQuestNotice(q,'The ring went cold. Strike the seal or condenser to retry.');return}}
 if(t.time>=n.seconds&&t.kills>=n.kills){
  q.trial=null;q.step++;zQuestRemoveAdds();zQuestClear(q);zQuestCue(q,n.x,n.z,true);
  const next=q.nodes[q.step-2];
  zQuestNotice(q,next?next.site+' is next. The seal opens on round '+next.round+'.':'The passage is ready at '+(q.london?'the Palace Yard service stand.':'the crypt altar.'));
  return;
 }
 t.next-=dt;
 if(t.next>0||!players.length)return;
 t.next=Math.max(2.2,4.2-(q.step-2)*.5);
 if(bots.filter(b=>b.al&&b.zquestAdd).length<7){
  for(let i=0;i<(players.length>1?2:1);i++){
   const a=(t.attack+i*2)*2.39996,[x,z]=zFreeSpot(n.x+Math.cos(a)*6.8,n.z+Math.sin(a)*6.8);
   const distance=Math.hypot(x-n.x,z-n.z);
   if(distance>7.8||distance<3.2||castW(V(n.x,1.3,n.z),V((x-n.x)/distance,0,(z-n.z)/distance),distance)<distance-.12)continue;
   const b=mkZombie(x,z,t.attack%7===6&&q.step>2);
   b.zquestAdd=true;b.riseY=-1.3;b.run=true;b.sp=Math.max(b.sp,3.4);
   b.rig.setGlow?.(true,q.clock);
  }
 }
 if(t.attack%3===2){
  const p=players[t.attack%players.length];
  zQuestHazard(q,q.london?'bolt':'hex',p.x,p.z,q.london?2.25:2.7,1.25);
 }
 t.attack++;
}

function zQuestBelfry(root,stone,dark,brass,light){
 const arch=new THREE.TorusGeometry(4.21,.27,6,36,Math.PI);
 const windowGlass=eCanvasMat(192,256,(c,w,h)=>{
  const sky=c.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#353f59');sky.addColorStop(.71,'#a96e58');sky.addColorStop(1,'#eab182');
  c.fillStyle=sky;c.beginPath();c.arc(w/2,w/2,w/2,Math.PI,0);c.lineTo(w,h);c.lineTo(0,h);c.fill();
  c.strokeStyle='#222331';c.lineWidth=7;
  for(const x of [w*.24,w*.5,w*.76]){c.beginPath();c.moveTo(x,w*.1);c.lineTo(x,h);c.stroke()}
  for(const y of [h*.38,h*.62,h*.8])c.fillRect(0,y,w,2);
 },true);
 const clockFace=eCanvasMat(256,256,(c,w,h)=>{
  c.translate(w/2,h/2);c.fillStyle='#2b2431';c.strokeStyle='#b88054';c.lineWidth=9;
  c.beginPath();c.arc(0,0,113,0,Math.PI*2);c.fill();c.stroke();
  for(let i=0;i<12;i++){
   c.rotate(Math.PI/6);c.fillStyle=i%3?'#c7a276':'#fbca88';c.fillRect(-2,-107,4,i%3?8:15);
  }
  c.fillStyle='#ffd59b';c.rotate(.85);c.fillRect(-3,-91,6,112);c.rotate(-2.27);c.fillRect(-5,-67,10,83);
 },true);
 const wall=eM(0x342c36,0,.85,.12),copper=eM(0x765040,0x110904,.56,.46);
 const backing=new THREE.MeshBasicMaterial({color:0x252234,side:THREE.BackSide});
 eMk(root,new THREE.CylinderGeometry(31,31,30,32,1,true),backing,0,12,0,1,1,1);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,g=new THREE.Group();g.position.set(Math.sin(a)*27,0,Math.cos(a)*27);g.rotation.y=a;
  root.add(g);
  eMk(g,EG.box,wall,0,2.15,.2,21,4.3,2);
  eMk(g,EG.box,stone,0,13.3,.45,21,3.8,1.5);
  for(const side of [-1,1]){
   eMk(g,EG.box,wall,side*6.9,7.7,.2,5.45,8.5,1.55);
   eMk(g,EG.box,brass,side*4.21,6.27,-.52,.47,5.05,.48);
   eMk(g,EG.box,brass,side*7.9,3.6,-3.2,.16,2.4,.16);
   eMk(g,EG.box,copper,side*8.8,5.6,-.8,.21,8,.45);
  }
  eMk(g,EG.pl,windowGlass,0,7.86,-.69,8.42,9.35,1);
  eMk(g,arch,brass,0,8.62,-.72,1,1,1);
  eMk(g,EG.box,brass,0,4.36,-3.2,21,.13,.19);
  eMk(g,EG.box,stone,0,3.54,-2.02,21,.39,2.75);
  for(let rail=-8;rail<=8;rail+=2)eMk(g,EG.box,brass,rail,4.04,-3.2,.079,.76,.079);
  if(i%2===0){
   eMk(g,EG.pl,clockFace,0,9.05,-1.2,7.05,7.05,1);
   eMk(g,EG.tor,brass,0,9.05,-1.17,3.28,3.28,1.4);
  }
 }
 for(let i=0;i<4;i++){
  const a=i*Math.PI*.5+Math.PI*.25,x=Math.sin(a)*17,z=Math.cos(a)*17;
  const bell=new THREE.CylinderGeometry(.58,1.64,1.9,18,1,true);
  eMk(root,EG.cyl,dark,x,16,z,.075,11,.075);
  eMk(root,bell,copper,x,10.4,z,1,1,1,0,a,Math.sin(a)*.14);
  eMk(root,EG.tor,brass,x,9.52,z,1.59,1.59,1.6,Math.PI/2);
  eMk(root,EG.sph,light,x,9.41,z,.22,.26,.22);
 }
}
function zQuestCatacomb(root,stone,dark,edge,light){
 const glow=eM(0x53457e,0x241842,.73,.03),shard=new THREE.OctahedronGeometry(1);
 for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++){
  if(Math.abs(x)+Math.abs(z)===6)continue;
  eMk(root,EG.box,(x+z)%2?stone:dark,x*6.46,.044,z*6.46,6.35,.09,6.35);
 }
 const arch=new THREE.TorusGeometry(4.24,.43,5,29,Math.PI);
 const mist=eCanvasMat(256,256,(c,w,h)=>{
  const f=c.createRadialGradient(w/2,h/2,8,w/2,h/2,w*.49);
  f.addColorStop(0,'#d7c5ffaf');f.addColorStop(.27,'#a17cf577');f.addColorStop(1,'#37235c00');
  c.fillStyle=f;c.fillRect(0,0,w,h);
 },true);
 for(let i=0;i<8;i++){
  const a=i*Math.PI*.25,g=new THREE.Group();
  g.position.set(Math.sin(a)*25,0,Math.cos(a)*25);g.rotation.y=a;root.add(g);
  for(const side of [-1,1]){
   eMk(g,EG.box,dark,side*7.03,3.65,.54,5.19,7.3,2.3,-side*.09,0,side*.08);
   eMk(g,EG.box,edge,side*4.25,2.68,.12,.83,5.37,1.4,.04,0,side*.07);
   for(let k=0;k<4;k++)eMk(g,shard,k%2?glow:stone,side*(5.8+k*.78),.51+k*.27,-.55-k*.14,1.21,2.4,.98,side*.23,k,side*.51);
   eMk(g,shard,light,side*4.66,3.28,-.66,.2,.54,.28);
   eMk(g,EG.box,stone,side*8.1,.31,-.33,4.7,.62,3.8);
  }
  eMk(g,arch,edge,0,5.17,-.13,1,1,1);
  eMk(g,EG.pl,mist,0,4.53,.23,11.1,8.7,1);
  eMk(g,shard,glow,0,8.5,-1.8,1.18,2,1.06,.18,a,.59);
 }
 for(const [x,z] of [[-16,6],[16,6],[-14,-12],[14,-12]]){
  const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  eMk(g,EG.box,dark,0,.36,0,2.6,.72,3.28);
  eMk(g,EG.box,stone,0,.8,0,2.75,.24,3.4);
  eMk(g,EG.box,edge,0,1,0,2.23,.2,2.94);
  eMk(g,shard,light,0,1.12,0,.18,.22,.31);
  zSolid(ZMAIN_ARENA_X+x,z,2.75,3.4,1.1);
 }
}
function zQuestArena(q){
 const root=new THREE.Group();root.position.x=ZMAIN_ARENA_X;q.fx.add(root);root.visible=false;q.arena=root;
 const stone=eM(q.london?0x433e46:0x342b49,0,.82,.1);
 const dark=eM(q.london?0x211d27:0x211b36,0,.82,.32);
 const edge=eM(q.london?0x9a6440:0x746493,0,.51,.45);
 const light=new THREE.MeshBasicMaterial({color:q.def.color});
 const torus=(radius,tube)=>new THREE.TorusGeometry(radius,tube,6,64);
 const disk=new THREE.CylinderGeometry(1,1,1,64);
 const add=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>eMk(root,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz);
 add(EG.box,dark,0,-.29,0,54,.66,54);
 if(q.london){
  add(disk,stone,0,-.105,0,22.5,.33,22.5);
  zQuestBelfry(root,stone,dark,edge,light);
  for(const r of [5,10,15,21])add(torus(r,.09),r===21?light:edge,0,.11,0,1,1,1,Math.PI/2);
 }else{
  zQuestCatacomb(root,stone,dark,edge,light);
  add(torus(5,.066),light,0,.128,0,1,1,1,Math.PI/2);
  add(torus(21,.057),edge,0,.126,0,1,1,1,Math.PI/2);
 }
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,x=Math.sin(a),z=Math.cos(a),h=7+i%4*2;
  if(q.london){
   add(EG.box,edge,x*15,.094,z*15,.1,.05,10,0,a);
   add(EG.box,stone,x*22.6,h/2,z*22.6,1.55,h,1.66,0,a);
   add(EG.box,edge,x*22.5,h,z*22.5,2.42,.47,2.3,0,a);
   add(torus(1.32,.07),light,x*22.3,h+1.4,z*22.3,1,1,1,0,a);
   add(EG.cyl,dark,x*23.1,h+1.3,z*23.1,1.52,.29,1.52,Math.PI/2,a);
  }else{
   add(EG.box,stone,x*22.1,h/2,z*22.1,1.7,h,1.4,-.17,a,(i%3-1)*.18);
   add(EG.box,edge,x*21.3,h*.63,z*21.3,1.3,.38,.7,0,a,.18);
   add(q.shardGeo||=new THREE.OctahedronGeometry(1),light,x*21.15,h*.7,z*21.15,.3,.85,.28,0,a);
  }
 }
 q.skyRotor=new THREE.Group();q.skyRotor.position.y=16;root.add(q.skyRotor);
 if(q.london){
  const teeth=new THREE.CylinderGeometry(1,1,1,12);
  for(const [x,z,r] of [[0,0,12],[-15,8,5],[16,-7,6]]){
   eMk(q.skyRotor,torus(r,.28),edge,x,0,z,1,1,1,Math.PI/2);
   for(let i=0;i<24;i++){
    const a=i*Math.PI/12;eMk(q.skyRotor,EG.box,edge,x+Math.sin(a)*r,0,z+Math.cos(a)*r,.23,.2,1.2,0,a);
   }
   eMk(q.skyRotor,teeth,stone,x,0,z,1.8,.6,1.8);
  }
 }else{
  for(let i=0;i<18;i++){
   const a=i*Math.PI/9,r=13+i%4*2;
   eMk(q.skyRotor,q.shardGeo,stone,Math.sin(a)*r,i%3,Math.cos(a)*r,1.5,3.2,1.6,.25,a,-.45);
   eMk(q.skyRotor,q.shardGeo,light,Math.sin(a)*r,-2.9+i%3,Math.cos(a)*r,.33,.8,.4);
  }
 }
 const skyMat=new THREE.MeshBasicMaterial({color:q.def.ink,side:THREE.BackSide,fog:false});
 const canopy=eMk(root,new THREE.SphereGeometry(72,24,12),skyMat,0,3,0,1,1,1);
 canopy.castShadow=canopy.receiveShadow=false;
 const lumen=new THREE.PointLight(q.def.color,2.15,54,1.6);lumen.position.set(0,11,0);root.add(lumen);
 q.locks=[[-11,-9],[11,-9],[0,12]].map(([x,z],i)=>{
  const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  eMk(g,EG.cyl,dark,0,.52,0,1.05,1.04,1.05);
  eMk(g,EG.cyl,edge,0,1,0,1.1,.22,1.1);
  const gem=eMk(g,new THREE.OctahedronGeometry(1),light,0,1.55,0,.42,.67,.42);
  return {x:x+ZMAIN_ARENA_X,z,g,gem,i};
 });
 eMk(root,EG.cyl,dark,0,.54,19.4,.94,1.08,.94);
 eMk(root,EG.cyl,edge,0,1.12,19.4,1.09,.21,1.09);
 eMk(root,q.shardGeo||new THREE.OctahedronGeometry(1),light,0,1.51,19.4,.3,.47,.3);
 zQuestInteract(q,'arenaAmmo',ZMAIN_ARENA_X,19.4,()=>q.fight?'Resupply · 25s recharge':'',by=>{
  if(q.cut)return;
  q.supplied ||= new Map();
  if(q.clock<(q.supplied.get(by)||0))return;
  q.supplied.set(by,q.clock+25);
  if(by===zMe())zQuestResupply(q);
  else netSend({t:'zmainnote',to:by,supply:true});
 });
 return root;
}
function zQuestResupply(q){
 for(const w of wp){w.mag=w.m;w.res=Math.max(w.res,w.m*4)}
 if(q.london&&!wp.some(w=>w.k==='TEA'))zGive('TEA');
 if(!q.london&&zMelKey()!=='Nitrogen Fists')zGiveMel('NF');
 msg('Arena supplies replenished',2);
 beep(540,.2,'triangle',.08);
}
function zQuestTeleport(q,visit,fighting,ids){
 if(!ids.includes(zMe())||q.localVisit===visit)return;
 q.localVisit=visit;
 const [x,z]=fighting?[ZMAIN_ARENA_X+(ids.indexOf(zMe())-1.5)*2.3,17]:[q.entry.x,q.entry.z+1.05];
 const [px,pz]=fighting?[x,z]:zFreeSpot(x,z);
 Object.assign(P,{x:px,z:pz,y:0,vy:0,mx:0,mz:0});
 if(fighting){yaw=0;pitch=0}
 zq.dash.t=0;flashL=Math.max(flashL,.85);shake=Math.max(shake,.45);
 popup(fighting?q.def.realm.toUpperCase():(q.won?'RETURN TO THE SURFACE':'THE PASSAGE CLOSED'),
  fighting?q.def.boss:q.def.title);
}
function zQuestBegin(q){
 const players=zPlayers();if(!players.length)return;
 if(zq.hound&&!zq.hound.done){zQuestNotice(q,'Finish the Hellhound round before opening the passage.');return}
 const x=ZMAIN_ARENA_X,z=-5,b=mkZombie(x,z,true);
 zQuestDress(b,q);b.hp=b.mhp=Math.round((q.london?21500:24600)*(1+.55*(players.length-1)));
 q.credit=players.map(p=>p.id);q.phase=0;q.ward=q.london?1:4;q.warm=.8;q.next=2.65;q.attack=0;q.fight=true;
 q.exposed=q.openIn=q.breaks=0;q.readyAt=q.clock;
 q.visit++;q.fightAt=q.clock;q.supplied=new Map();
 if(!q.arena)zQuestArena(q);
 zQuestTeleport(q,q.visit,true,q.credit);
 zQuestCinema(q,'arrival');
 if(netOn)netSend({t:'zmainnote',visit:q.visit,fight:true,ids:q.credit});
}
function zQuestDress(b,q){
 b.m.clear();b.rig=null;b.zquestBoss=true;b.nm=q.def.boss;b.m.scale.setScalar(1);b.rise=0;
 const g=new THREE.Group();g.scale.setScalar(q.london?1.37:1.46);b.m.add(g);
 const shell=eM(q.london?0xb17a48:0x898096,0,.48,.52);
 const caseMat=eM(q.london?0x242633:0x31213f,0,.74,.32);
 const core=new THREE.MeshBasicMaterial({color:q.def.color});
 const halo=new THREE.TorusGeometry(1,.062,8,44);
 const gem=new THREE.OctahedronGeometry(1);
 const arms=[];
 let rotor;
 function put(geo,m,x,y,z,sx,sy,sz,rx,ry,rz){return eMk(g,geo,m,x,y,z,sx,sy,sz,rx,ry,rz)}
 if(q.london){
  rotor=new THREE.Group();rotor.position.y=2.95;g.add(rotor);
  eMk(rotor,EG.cyl,caseMat,0,0,0,1.8,.8,1.8,Math.PI/2);
  eMk(rotor,halo,shell,0,0,.53,1.75,1.75,1.5);
  eMk(rotor,halo,core,0,0,.6,1.09,1.09,1);
  eMk(rotor,gem,core,0,0,.64,.48,.48,.38);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6;
   eMk(rotor,EG.box,i%3?caseMat:shell,Math.sin(a)*1.41,Math.cos(a)*1.41,.48,.14,.38,.24,0,0,-a);
   eMk(rotor,EG.box,shell,Math.sin(a)*1.87,Math.cos(a)*1.87,.03,.23,.44,.52,0,0,-a);
  }
  put(EG.box,shell,0,4.85,-.06,.4,.47,.51);
  put(halo,shell,0,2.96,-.63,2.08,2.08,1.25,0,.24,-.18);
  for(const side of [-1,1]){
   put(EG.box,caseMat,side*1.32,3.08,-.53,.24,2.4,.26,.2,0,side*.36);
   put(EG.cyl,shell,side*.91,4.3,-.22,.42,.24,.34,.38,0,side*.52);
  }
  for(const side of [-1,1]){
   const pend=new THREE.Group();pend.position.set(side*1.47,3.38,-.17);g.add(pend);arms.push(pend);
   eMk(pend,EG.box,shell,0,-1.18,0,.18,2.55,.24);
   eMk(pend,new THREE.CylinderGeometry(.3,.73,1.05,12),shell,0,-2.57,0,1,1,1);
   eMk(pend,gem,core,0,-2.58,.23,.25,.32,.22);
  }
 }else{
  put(EG.sph,caseMat,0,2.05,0,.93,1.54,.68,0,0,-.12);
  put(gem,core,0,2.38,.62,.42,.67,.36,0,0,-.13);
  for(let i=0;i<5;i++)for(const side of [-1,1])
   put(EG.cyl,shell,side*(.22+i*.06),1.55+i*.34,.43,.11,1.03,.16,.4,0,-side*.77);
  put(gem,shell,0,3.7,.26,.76,.88,.61,0,0,-.12);
  put(EG.box,caseMat,0,3.65,.75,.86,.33,.18,0,0,-.12);
  for(const side of [-1,1]){
   put(gem,core,side*.27,3.66,.89,.12,.078,.1);
   const root=new THREE.Group();root.position.set(side*.82,2.92,-.03);g.add(root);arms.push(root);
   eMk(root,EG.sph,caseMat,side*.37,-.21,0,.63,.61,.53);
   for(let i=0;i<4;i++){
    eMk(root,gem,shell,side*(.78+i*.16),-.67-i*.22,.31,.22,.69,.27,.18,0,side*.55);
    eMk(root,EG.cyl,caseMat,side*(.35+i*.16),-.27-i*.21,.12,.14,.88,.15,0,0,side*.64);
   }
   for(let i=0;i<3;i++)put(gem,shell,side*(.24+i*.18),4.07+i*.17,-.11,.19,.73,.22,0,0,-side*.55);
   put(gem,caseMat,side*.57,.65,-.15,.4,1.06,.45,.48,0,side*.23);
   for(let i=0;i<4;i++){
    put(gem,caseMat,side*(.9+i*.18),2.81+i*.25,-.59,.32,.72,.17,.14,0,-side*(.56+i*.25));
    put(gem,shell,side*(1.02+i*.185),3.05+i*.24,-.47,.13,.67,.18,.11,0,-side*(.56+i*.25));
   }
  }
  rotor=put(halo,shell,0,3.87,-.56,1.1,1.34,.76);
 }
 const shield=put(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({
  color:q.def.color,transparent:true,opacity:.26,wireframe:true,depthWrite:false
 }),0,2.45,0,2.55,2.78,2.32);
 const focus=put(halo,new THREE.MeshBasicMaterial({color:0xffedc6}),0,q.london?2.95:3.67,.93,.72,.72,.7);
 focus.visible=false;b.zquestArt={g,arms,rotor,shield,core,focus};q.actor=b;
}
function zQuestHitPoints(b){
 const london=zq.main.london,face=b.tyaw||0,scale=london?1.37:1.46,height=(london?2.95:3.67)*scale;
 const coreOffset=.82*scale,lift=b.zquestArt?.g.position.y||0;
 return [V(b.x+Math.sin(face)*coreOffset,height+lift,b.z+Math.cos(face)*coreOffset),
  V(b.x,(london?2.84:2.04)*scale+lift,b.z),(london?.61:.63)*scale,(london?1.10:1.25)*scale];
}
function zQuestDamage(b,d,head,by){
 const q=zq.main;if(q?.actor!==b||!q.fight||!Number.isFinite(d)||d<=0||q.ward||q.cut||q.exposed<=0)return;
 const p=zPlayers().find(p=>p.id===by);
 if(!p||!zQuestInArena(p.x,p.z)||Math.hypot(p.x-b.x,p.z-b.z)>47)return;
 const start=ZMAIN_PHASE_END[q.phase],end=ZMAIN_PHASE_END[q.phase+1],count=ZMAIN_OPENINGS[q.phase];
 const floor=Math.round(b.mhp*(start-(start-end)*(q.breaks+1)/count));
 const hit=Math.min(d*(head?1.16:.44),b.mhp*.023,b.hp-floor);
 b.hp-=hit;b.lh=t0;
 if(p.me){hits++;juiceHit(b,Math.round(hit),head);$('#hm').className='on'+(head?' hd':'');hmT=.12}
 if(b.hp>floor+.000001)return;
 b.hp=floor;
 q.exposed=0;q.breaks++;q.readyAt=Math.max(q.readyAt,q.clock+5.6);
 if(b.hp<=0){
  zQuestClear(q);zQuestCinema(q,'victory');zQuestCue(q,b.x,b.z,true);
  return;
 }
 if(q.breaks<count)return;
 q.phase++;q.breaks=0;q.warm=1.3;q.ward=q.phase===1?(q.london?6:3):7;q.next=2.65;q.openIn=0;
 zQuestClear(q);zQuestCue(q,b.x,b.z,true);
 if(q.phase===2)zQuestCinema(q,'final');
 zQuestNotice(q,q.london?'Vent the lit condensers with The Brew.':'Nitro-dash through the lit pillars.');
}
function zQuestEnd(q,won){
 q.won=won;q.fight=false;q.cut=null;q.ward=0;q.warm=0;q.visit++;
 if(q.actor){q.actor.al=0;q.actor.atk=0;S.remove(q.actor.m);const i=bots.indexOf(q.actor);if(i>=0)bots.splice(i,1);q.actor=null}
 zQuestClear(q);
 if(won){burst(V(ZMAIN_ARENA_X,3,-4),90,q.def.color,12,1.4,.2);zQuestCue(q,ZMAIN_ARENA_X,-4,true)}
 zQuestTeleport(q,q.visit,false,q.credit);
 if(netOn)netSend({t:'zmainnote',visit:q.visit,fight:false,ids:q.credit,won});
 if(won)zQuestReward(q);
}
function zQuestBossTick(q,dt,players){
 const b=q.actor;
 if(!players.length){
  if(q.clock-q.fightAt>9)zQuestEnd(q,false);
  return;
 }
 q.fightAt=q.clock;q.warm=Math.max(0,q.warm-dt);q.exposed=Math.max(0,(q.exposed||0)-dt);
 if(q.openIn>0){
  q.openIn=Math.max(0,q.openIn-dt);
  if(q.openIn===0&&!q.ward){
   q.exposed=q.phase===2?5.2:6.1;q.readyAt=q.clock+(q.phase===2?9.6:11.5);
   zQuestCue(q,b.x,b.z,false);
  }
 }
 const p=players.reduce((a,c)=>Math.hypot(c.x-b.x,c.z-b.z)<Math.hypot(a.x-b.x,a.z-b.z)?c:a);
 const dx=p.x-b.x,dz=p.z-b.z,dist=Math.hypot(dx,dz)||1;
 b.tyaw=Math.atan2(dx,dz);
 if(!q.london&&!q.ward&&q.next>1.25&&dist>3.2)mv(b,dx/dist*dt*(2.1+q.phase*.6),dz/dist*dt*(2.1+q.phase*.6),.8);
 if(q.london){
  b.x=ZMAIN_ARENA_X+Math.sin(q.clock*.34)*(5+q.phase*2);
  b.z=-4+Math.sin(q.clock*.58)*4;
 }
 b.m.position.set(b.x,0,b.z);
 q.next-=dt;
 if(q.next>0||q.warm>0)return;
 const n=q.attack++,phase=q.phase,wind=1.69-phase*.14;
 q.next=(q.london?4.43:4.95)-phase*.48;
 if(q.london){
  if(n%3===0||phase===2&&n%3===1){
   zQuestHazard(q,'wave',b.x,b.z,31,wind);
   if(phase>0)zQuestHazard(q,'wave',b.x,b.z,31,wind+.88);
  }else{
   const horizontal=n%2===0;
   for(let i=-4;i<=4;i++)zQuestHazard(q,'bolt',horizontal?ZMAIN_ARENA_X+i*5.1:p.x,horizontal?p.z:i*5.1,3.05,wind+Math.abs(i)*.10);
   if(phase===2){
    for(const along of [-2,0,2])zQuestHazard(q,'bolt',horizontal?p.x:p.x+along*3,horizontal?p.z+along*3:p.z,3.55,wind+.89+Math.abs(along)*.15);
   }
  }
 }else{
  for(const pl of players){
   zQuestHazard(q,'hex',pl.x,pl.z,3.3+phase*.33,wind);
   if(phase>0)zQuestHazard(q,'hex',pl.x+Math.sin(n*2.4)*5,pl.z+Math.cos(n*2.4)*5,3.2,wind+.48);
  }
  if(n%2===1||phase===2)zQuestHazard(q,'wave',b.x,b.z,29,wind+.52);
  if(phase>0&&n%3===1){
   for(const side of [-1,1])zQuestHazard(q,'bolt',p.x+side*7,p.z-3,3.2,wind+1.04);
  }
 }
 if(!q.ward&&!q.exposed&&!q.openIn&&q.clock>=q.readyAt)q.openIn=wind+1.17;
}
function zQuestHud(q){
 const h=$('#zmain'),visible=q.step>0;
 h.hidden=!visible;
 if(!visible)return;
 const n=q.nodes[q.step-2],t=q.trial;
 const line=q.won?'Quest complete':q.fight?(q.ward?(q.london?'Vent the lit condensers with The Brew':'Dash through the lit pillars'):
  q.exposed>0?'Core exposed · '+Math.ceil(q.exposed)+'s · '+(q.breaks+1)+'/'+ZMAIN_OPENINGS[q.phase]:
   q.def.phases[q.phase]+' · Dodge to expose the core'):
  q.step===1?(q.london?'Restore power · recover the Abbey escapement':'Recover the family seal · master’s study'):
  t?n.site+' · '+Math.min(t.kills,n.kills)+'/'+n.kills+' kills · '+Math.max(0,Math.ceil(n.seconds-t.time))+'s in ring':
  n?n.site+' · '+(zq.r<n.round?'opens on round '+n.round:q.london?(!zq.tea?'Unlock The Brew':'Vent the condenser with The Brew'):'Dash into the seal'):
  'Open the passage · '+(q.london?'Palace Yard':'Crypt');
 const progress=q.fight?Math.max(0,Math.round(100*(q.actor?.hp/q.actor?.mhp||0))):t?Math.floor(100*Math.min(t.time/n.seconds,t.kills/n.kills,1)):0;
 const key=[q.fight,q.ward>0,!!t,line,progress].join('|');
 if(q.hudKey===key)return;
 q.hudKey=key;
 const track=h.querySelector('.zmain-track');
 h.querySelector('strong').textContent=q.fight?q.def.boss:q.def.title;
 h.querySelector('small').textContent=line;track.hidden=!q.fight&&!t;
 track.setAttribute('aria-label',q.fight?'Boss health':'Ritual progress');
 track.setAttribute('aria-valuenow',progress);track.firstElementChild.style.width=progress+'%';
 h.classList.toggle('warded',q.fight&&q.exposed<=0);
}
function zQuestTick(dt){
 const q=zq.main;if(!q)return;
 q.clock+=dt;
 if(q.cut&&q.clock>=q.cut.until){
  const won=q.cut.kind==='victory';q.cut=null;
  if(won&&!zCli())zQuestEnd(q,true);
 }
 {
  const active=q.nodes[q.step-2];
  for(const prop of q.props){
   prop.g.visible=prop.kind==='paper'||(prop.kind==='relic'?!q.london||q.step===1:
    (prop.index===3?q.step===5&&!q.won:prop.index===q.step-2));
   if(prop.rotor){prop.rotor.rotation.y=q.clock*2;prop.rotor.rotation.z=Math.sin(q.clock*3)*.18}
  }
  for(const node of q.nodes)node.ring.visible=node===active&&!!q.trial;
 }
 if(q.arena){
  q.arena.visible=q.fight&&zQuestInArena(P.x,P.z);
  q.skyRotor.rotation.y=q.clock*(q.london?.12:.035);
  for(const lock of q.locks){lock.g.visible=!!(q.ward&(1<<lock.i));lock.gem.rotation.y=q.clock*2.8}
 }
 if(q.fight&&!q.cut&&!zCli()&&!sdGameRuntime?.aiDisabled())zQuestBossTick(q,dt,zPlayers().filter(p=>zQuestInArena(p.x,p.z)));
 if(q.trial&&!zCli()&&!sdGameRuntime?.aiDisabled())zQuestTrial(q,dt);
 if(q.fight||q.trial)zQuestHazardTick(q,dt,zCli()?null:zPlayers().filter(p=>zQuestInArena(p.x,p.z)===q.fight));
 if(q.fight&&q.actor?.zquestArt){
  const b=q.actor,{g,arms,rotor,shield,core,focus}=b.zquestArt,time=q.clock;
  b.m.rotation.y+=(angD(b.tyaw||0,b.m.rotation.y))*Math.min(1,dt*7);
  const collapse=q.cut?.kind==='victory'?cl(1-(q.cut.until-time)/ZMAIN_CUT_TIME.victory,0,1):0;
  g.position.y=Math.sin(time*2)*(q.london?.26:.14)-collapse*2.7;
  g.rotation.z=collapse*(q.london?.42:-.6);
  if(q.london)rotor.rotation.z=time*(.49+q.phase*.19);
  for(const [i,arm] of arms.entries()){
   arm.rotation.z=Math.sin(time*(q.london?2.7:1.7)+i*1.7)*(.53+q.phase*.13);
   arm.rotation.x=Math.sin(time*2.1+i*2)*.35;
  }
  shield.visible=q.exposed<=0&&!collapse;shield.rotation.y=time*.95;
  shield.material.opacity=q.ward?.38:.19+.09*Math.sin(time*5);
  focus.visible=q.exposed>0;
  core.color.setHex(q.def.color).multiplyScalar((q.exposed>0?1.62:1.07)+.27*Math.sin(time*5)-collapse*.68);
 }
 zQuestCinemaView(q);
 zQuestHud(q);
}
function zQuestPack(q){
 if(!q)return null;
 return {s:q.step,trial:q.trial&&{time:q.trial.time,kills:q.trial.kills},p:q.phase,w:q.ward,i:q.actor?.i,
  hp:q.actor?.hp,max:q.actor?.mhp,warm:q.warm,fight:q.fight,won:q.won,visit:q.visit,ids:q.credit,
  e:q.exposed||0,b:q.breaks||0,cut:q.cut?.kind,left:q.cut?Math.max(0,q.cut.until-q.clock):0,
  a:[...q.hazards.values()].map(h=>[h.id,h.kind,h.x,h.z,h.r,h.wind,h.duration,+h.age.toFixed(2)])};
}
function zQuestSync(s){
 const q=zq.main;if(!q||!s)return;
 q.step=s.s;q.trial=s.trial;q.phase=s.p;q.ward=s.w;q.warm=s.warm;q.fight=!!s.fight;q.won=!!s.won;q.credit=s.ids;
 q.exposed=s.e||0;q.breaks=s.b||0;
 if(s.cut&&Number.isFinite(s.left))zQuestCinema(q,s.cut,s.left);else q.cut=null;
 if(q.credit.length)zQuestTeleport(q,s.visit,q.fight,q.credit);
 if(q.fight){
  if(!q.arena)zQuestArena(q);
  const actor=bots.find(b=>b.zp&&b.al&&b.i===s.i);
  if(actor){
   if(!actor.zquestBoss)zQuestDress(actor,q);
   q.actor=actor;actor.hp=s.hp;actor.mhp=s.max;
  }
 }else q.actor=null;
 const seen=new Set();
 for(const [id,kind,x,z,r,wind,duration,age] of s.a){
  seen.add(id);const h=q.hazards.get(id)||zQuestHazardView(q,id,kind,x,z,r,wind,duration);
  if(Math.abs(h.age-age)>.24)h.age=age;
 }
 for(const h of q.hazards.values())if(!seen.has(h.id))zQuestDropHazard(q,h);
 if(q.won)zQuestReward(q);
}
function zQuestNet(d,cn){
 const q=zq.main;if(!q||!netOn)return;
 if(isHost){
  if(d.t!=='zmainuse'||cn?.peer!==d.id)return;
  if(d.kind==='steam'||d.kind==='dash')zQuestStrike(q,d.id,d.x,d.y,d.z,d.kind);
  else q.actions.get(d.a)?.(d.id);
  return;
 }
 if(cn?.peer!==hostPid||d.id!==hostPid)return;
 if(d.t==='zmaincue')zQuestCue(q,d.x,d.z,d.big,true);
 if(d.t==='zmainnote'){
  if(d.to===myId){
   if(d.fists)zQuestGrantFists(myId);
   if(d.tea&&!wp.some(w=>w.k==='TEA'))zGive('TEA');
   if(d.supply&&q.fight)zQuestResupply(q);
  }
  if(typeof d.line==='string')msg(d.line,3.5);
  if(Number.isInteger(d.visit)&&Array.isArray(d.ids)){
   q.fight=d.fight;q.won=!!d.won;q.credit=d.ids;
   if(q.fight&&!q.arena)zQuestArena(q);
   if(q.fight&&q.localVisit!==d.visit)zQuestCinema(q,'arrival');else if(!q.fight)q.cut=null;
   zQuestTeleport(q,d.visit,d.fight,d.ids);
   if(q.won)zQuestReward(q);
  }
 }
 if(d.t==='zmainhit'&&d.to===myId&&!P.dead&&d.d>0&&d.d<=50)zQuestTouch(q,{me:1},q.actor,d.d);
}
;

/* Articulated undead for The 1 Room Challenge. */
const LOCKBOX_FABRIC={
 undead:[0x6b554b,0x515e63,0x756951],
 skin:[0xaaa58c,0x969c8c,0xb4a394]
};
const LOCKBOX_TEXTURES={},LOCKBOX_MATERIALS={};

function lockboxFabric(name){
 if(LOCKBOX_TEXTURES[name])return LOCKBOX_TEXTURES[name];
 const worn=name==='worn',leather=name==='leather';
 const map=zTex(128,128,(g,w,h)=>{
  let seed=919;
  const rand=()=>(seed=seed*16807%2147483647)/2147483647;
  const pixels=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const weave=leather?0:((x%3===0?1:-.3)+(y%3===0?1:-.3))*8;
   const grain=Math.sin(x*.16+y*.21)*5+Math.sin(x*.34-y*.13)*6;
   const p=(x+y*w)*4,value=224+weave+grain+(rand()-.5)*29;
   pixels.data[p]=pixels.data[p+1]=pixels.data[p+2]=value;pixels.data[p+3]=255;
  }
  g.putImageData(pixels,0,0);
  for(let i=0;i<22;i++){
   const x=rand()*w,y=rand()*h,r=6+rand()*19,stain=g.createRadialGradient(x,y,0,x,y,r);
   stain.addColorStop(0,worn?'rgba(57,34,28,.32)':'rgba(44,40,31,.15)');
   stain.addColorStop(1,'rgba(44,40,31,0)');
   g.fillStyle=stain;g.fillRect(x-r,y-r,r*2,r*2);
  }
 });
 map.encoding=THREE.sRGBEncoding;
 return LOCKBOX_TEXTURES[name]=map;
}

/* Cheekbones, brow and eye sockets are built into the head surface. */
function lockboxSkull(){
 const rings=[[.055,.048,.051,.026],[.076,.077,.071,.016],[.105,.083,.089,.011],[.137,.088,.101,.005],
  [.166,.103,.103,0],[.194,.097,.101,-.004],[.222,.072,.08,-.008],[.248,.028,.036,-.01],[.253,0,0,-.01]];
 const pos=[],uv=[],ix=[],cols=32;
 const bump=(x,y,cx,cy,w,h)=>Math.exp(-(((x-cx)/w)**2+((y-cy)/h)**2));
 for(let j=0;j<rings.length;j++){
  const [y,rx,rz,zc]=rings[j];
  for(let i=0;i<=cols;i++){
   const a=(i/cols-.5)*Math.PI*2,x=rx*Math.sin(a),f=Math.max(0,Math.cos(a))**2,u=Math.abs(x);
   const planes=.015*bump(u,y,.065,.111,.028,.026)+.014*bump(u,y,.04,.173,.039,.022)
    -.028*bump(u,y,.038,.143,.027,.021)
    -.023*bump(u,y,.066,.083,.022,.028);
   pos.push(x,y,zc+rz*Math.cos(a)+f*planes);uv.push(i/cols,j/(rings.length-1));
   if(j<rings.length-1&&i<cols){const k=j*(cols+1)+i;ix.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1)}
  }
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(ix);g.computeVertexNormals();return g;
}

function lockboxFace(v,a,rod,G){
 const {sp,ss,hm}=G;
 a('skin',lockboxSkull(),1,1,1,0,0,0);
 for(const s of[-1,1]){
  a('skin',ss,.015,.028,.018,s*.095,.115,-.004,0,0,-s*.24);
  a('shade',ss,.025,.014,.007,s*.04,.142,.091,0,s*.27,-s*.12);
  a('eye',ss,.013,.006,.006,s*.04,.143,.098,0,s*.2,0);
  a('iris',ss,.0038,.005,.0025,s*.04,.143,.103);
  rod('shade',s*.022,.165,.102,s*.06,.159,.094,.004);
 }
 a('skin',ss,.014,.034,.019,0,.132,.106,-.39);
 a('skin',ss,.016,.012,.022,.003,.106,.116);
 for(const s of[-1,1])a('shade',ss,.005,.003,.005,s*.007,.101,.13);
  a('mouth',sp,.056,.022,.021,0,.066,.089);
  const scar=v.var%2?1:-1;
  a('shade',ss,.023,.032,.009,scar*.067,.092,.082,0,scar*.42,scar*.32);
  for(let i=0;i<5;i++){
   if(i===v.var)continue;
   const x=(i-2)*.015;
   a('bone',ss,.006,.011+(i%2)*.002,.006,x,.065,.109-Math.abs(x)*.35,0,0,x*4);
  }
  if(v.var!==1)a('hair',hm,.105,.103,.106,-.006,.172,-.014,0,0,.09);
  rod('shade',scar*.062,.186,.083,scar*.078,.166,.073,.0029);
}

function lockboxClothes(v,a,rod,G){
 const {ss}=G;
  HV.zombieTorso(v)(a,rod,G);
  for(const s of[-1,1]){
   a('under',ss,.076,.113,.016,s*.058,.449,.151,0,s*.42,s*.27);
   rod('seam',s*.042,.551,.13,s*.084,.38,.153,.008);
   for(let i=0;i<3;i++)rod('seam',s*(.052+i*.016),.389,.158,s*(.052+i*.016),.36-i*.009,.151,.0028);
  }
  a('shade',ss,.026,.044,.008,.016,.594,.055,0,.25,-.2);
}

function lockboxZombieMaterials(kind){
 if(LOCKBOX_MATERIALS[kind])return LOCKBOX_MATERIALS[kind];
 const cloth=lockboxFabric('worn'),leather=lockboxFabric('leather');
 const mat=(color,map)=>new THREE.MeshLambertMaterial(map?{color,map}:{color});
 return LOCKBOX_MATERIALS[kind]={
  am:mat(LOCKBOX_FABRIC.undead[kind],cloth),skin:mat(LOCKBOX_FABRIC.skin[kind]),
  under:mat(0xa89983,cloth),seam:mat(0x504035),shade:mat(0x51423a),mouth:mat(0x281b1a),
  hair:mat(0x393027),eye:mat(0xd9d5b9),iris:mat(0x797464),bone:mat(0xd2bea0),
  pants:mat(0x45423e,cloth),pants2:mat(0x625b4b,cloth),boots:mat(0x38312a,leather),
  dk:mat(0x292623),wound:mat(0x574039),blood:mat(0x643b33)
 };
}

function lockboxZombie(m,o){
 const kind=o.variant==null?Math.random()*3|0:o.variant%3;
 const M=lockboxZombieMaterials(kind),v={zb:true,var:kind,bare:kind===1},id='lockbox-z'+kind;
 m.rotation.order='YXZ';
 const sh=new THREE.Group(),head=new THREE.Group();sh.position.y=1;head.position.y=.68;sh.add(head);m.add(sh);
 const hip=HV.put(m,id+'hip',HV.hip(v),M);
 HV.put(sh,id+'torso',(a,rod,G)=>lockboxClothes(v,a,rod,G),M);
 HV.put(head,id+'head',(a,rod,G)=>lockboxFace(v,a,rod,G),M);
 const jaw=new THREE.Group();jaw.position.set(0,.051,.023);head.add(jaw);
 HV.put(jaw,id+'jaw',(a,rod,G)=>{
  a('skin',G.sp,.072,.033,.065,0,-.016,.034);
  a('mouth',G.ss,.057,.013,.055,0,.001,.038);
  for(let i=0;i<5;i++)a('bone',G.ss,.006,.009,.008,(i-2)*.014,.005,.089-Math.abs(i-2)*.005);
 },M);
 const leg=side=>{
  const upper=new THREE.Group(),shin=new THREE.Group();upper.position.set(side*.1,.98,0);shin.position.y=-.46;
  upper.add(shin);m.add(upper);
  HV.put(upper,id+'thigh'+side,HV.legU(v,side),M);
  HV.put(shin,id+'shin'+side,HV.legL({...v,bare:v.bare&&side===1},side),M);
  return [upper,shin];
 };
 const [legL,shinL]=leg(-1),[legR,shinR]=leg(1),armR=mkArm2(m,v,-1,M),armL=mkArm2(m,v,1,M);
 return {hip,legL,legR,shinL,shinR,armR,armL,sh,head,jaw,mat:M};
}
;

/* ---------- The 1 Room Challenge ---------- */
const LOCKBOX_CEILING=3.7;
const LOCKBOX_WINDOW={z:-3.7,approach:-4.30,inside:-2.5,boards:6,repairTime:.8,vaultTime:1.15};

MAPS[ROOM_CHALLENGE]={
 d:'Zombies map: One room, one boardable window, exclusive Bolt Brew and a fixed Mystery Box.',
 zm:1,lockbox:true,noHounds:true,playerRoom:3.5,ceilingY:LOCKBOX_CEILING,skySeed:10760,boardRay:lockboxBoardRay,H:8,open:1,sky:0x253441,gr:0x777c80,bc:0x62727a,gt:'concrete',
 hemi:1.1,hemiC:0xe2eeff,hemiG:0x797b80,sunI:.35,ps:[0,.6],dr:[],zs:[[0,-6,0]],
 lights:[[0,3.25,1.25,0xffdfaf,1.5,9],[0,2.62,-2.4,0xffe9cf,1.1,5],
         [0,2.9,-5.5,0xa9bdd8,1.25,7]],
 mc:[
  {t:'vit',x:-2.88,z:-1.52,f:'e'},{t:'spd',x:-2.88,z:.19,f:'e'},{t:'dbl',x:-2.88,z:1.85,f:'e'},
  {t:'rev',x:2.88,z:-1.85,f:'w'},{t:'ammo',x:2.88,z:0,f:'w'},
  {t:'pap',x:-2.3,z:-2.99,f:'s'},{t:'bolt',x:-1.13,z:2.88,f:'n'},{t:'box',x:1.13,z:2.88,f:'n',rect:true,lockbox:true},
  {t:'wall',k:'HC',x:-3.47,z:-2.05,f:'e',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'BP',x:-3.47,z:1.64,f:'e',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'OH',x:3.47,z:-2.05,f:'w',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'KTS',x:3.47,z:1.64,f:'w',y:3.09,scale:.67,focus:true},
  {t:'wall',k:'MP',x:0,z:3.47,f:'n',y:3.15,scale:.65,focus:true}
 ],
 b(){
  return [
   [-3.7,0,.4,7.8,3.7,0,0x59646b,'concrete'],[3.7,0,.4,7.8,3.7,0,0x59646b,'concrete'],
   [0,3.7,7,.4,3.7,0,0x59646b,'concrete'],
   [-2.32,-3.7,2.36,.4,3.7,0,0x59646b,'concrete'],[2.32,-3.7,2.36,.4,3.7,0,0x59646b,'concrete'],
   [0,-3.7,2.28,.4,.75,0,0x59646b,'concrete'],[0,-3.7,2.28,.4,3.7,2.75,0x59646b,'concrete'],
   [0,0,7.8,7.8,3.95,LOCKBOX_CEILING,0x47545d,'concrete']
  ];
 },
 post(g){
  EST.dyn=[];EST.spots=[];EST.pool=[];EST.fog=[];EST.pts={H:{p:[],c:[],f:[],base:[]}};
  EST.mapG=g;EST.tm=0;EST.amb=1;EST.lt={next:60,flash:0,rep:0};
  const trim=eM(0x28333b,0,.48,.65),light=eBasic(0xffe6ba,1);
  eMk(g,EG.box,trim,0,3.59,1.25,2.4,.22,.36);
  eMk(g,EG.box,light,0,3.47,1.25,2.14,.045,.22);
  const z=LOCKBOX_WINDOW.z;
  for(const x of[-1.14,1.14])eMk(g,EG.box,trim,x,1.75,z,.13,2.12,.49);
  for(const y of[.75,2.75])eMk(g,EG.box,trim,0,y,z,2.4,.12,.52);
  eMk(g,EG.pl,eSign(ROOM_CHALLENGE,0xffc677,576,96),0,3.22,z+.22,2.88,.48,1);
 },
 objs(){
  const z=LOCKBOX_WINDOW.z;
  const wood=lockboxWood(0xc2956d),edge=eM(0x634731,0,.8,0),bolt=eM(0x293237,0,.5,.55),strap=eM(0x78908f,0,.46,.65);
  const meshes=Array.from({length:LOCKBOX_WINDOW.boards},(_,i)=>{
   const board=new THREE.Group();
   const slot=[5,0,4,1,3,2][i];
   const y=[.89,1.16,1.43,1.94,2.24,2.59][slot];
   const tilt=[-.06,.08,-.05,.095,-.074,.047][slot];
   const width=[2.34,2.4,2.38,2.46,2.32,2.45][slot],height=[.14,.19,.16,.18,.16,.15][slot];
   const depth=.1,x=[-.022,.056,-.038,.018,.032,-.044][slot],mountedZ=z+.19+(slot%2)*.046;
   board.userData={x,y,z:mountedZ,tilt,cos:Math.cos(tilt),sin:Math.sin(tilt),width,height,depth};
   eMk(board,EG.box,wood,0,0,0,width,height,depth);
   eMk(board,EG.box,edge,0,-height/2+.014,.053,width-.04,.022,.016);
   for(const n of[-1.04,1.04])eMk(board,EG.box,bolt,n,0,.062,.042,.042,.022);
   const braces=new THREE.Group();
   for(const x of [-.8,.8])eMk(braces,EG.box,strap,x,0,.06,.13,height+.025,.05);
   braces.visible=false;
   board.userData.braces=braces;
   board.add(braces);
   board.position.set(x,y,mountedZ);
   board.rotation.z=tilt;
   zG.add(board);
   return board;
  });
  const w=zq.barricade={count:meshes.length,reinforced:0,meshes,nextTear:0,nextRepair:0,nextRequest:0,shockArmed:false};
  zi.push({x:0,z,r:1.95,hold:true,
   txt:()=>w.count<w.meshes.length?'Hold to rebuild window · '+w.count+'/6':'Window boarded · 6/6',
   cost:()=>0,act:()=>{}
  });
  EST.dyn.push({tick:lockboxBoardTick});
 },
 spawn(big){
  mkZombie((Math.random()-.5)*3,-6-Math.random(),big);
 },
 entry:lockboxEntry
};

function lockboxBoards(count,reinforced=zq.barricade?.reinforced){
 const w=zq.barricade;
 if(!w)return;
 reinforced&=(1<<count)-1;
 if(w.count===count&&w.reinforced===reinforced)return;
 const old=w.count;
 w.count=count;
 w.reinforced=reinforced;
 for(let i=0;i<count;i++)w.meshes[i].userData.braces.visible=!!(reinforced&(1<<i));
 for(let i=Math.min(old,count);i<Math.max(old,count);i++){
  const board=w.meshes[i];
  board.userData.motion=i<count?'rise':'fall';
  board.userData.age=0;
  board.visible=true;
  if(i<count){
   board.position.set((i%2?1:-1)*.45,.2,LOCKBOX_WINDOW.z+1);
   board.rotation.set(.8,0,(i%2?1:-1)*.4);
  }
 }
 noise(count>old?.12:.22,count>old?650:330,.2);
}

function lockboxBoardTick(dt){
 const w=zq.barricade;
 for(const board of w.meshes){
  const d=board.userData;
  if(!d.motion)continue;
  d.age+=dt;
  const u=Math.min(1,d.age/(d.motion==='rise'?.36:.55)),s=zsm_(u);
  if(d.motion==='rise'){
   const side=w.meshes.indexOf(board)%2?1:-1;
   board.position.set(side*.45*(1-s)+d.x*s,.2+(d.y-.2)*s+Math.sin(u*Math.PI)*.35,LOCKBOX_WINDOW.z+1+(d.z-LOCKBOX_WINDOW.z-1)*s);
   board.rotation.set(.8*(1-s),0,side*.4*(1-s)+d.tilt*s);
  }else{
   board.position.set(d.x+.65*u,d.y+.5*u-2.1*u*u,d.z-1.3*u);
   board.rotation.set(u*2.3,u*.45,d.tilt+u*1.7);
  }
  if(u===1){board.visible=d.motion==='rise';d.motion=null}
 }
}

function lockboxRepair(player,quick,reinforced){
 const w=zq.barricade;
 if(!w||!player||(w.climber?.al&&w.climber.crossing)||t0<w.nextRepair||w.count===w.meshes.length||
    Math.hypot(player.x,player.z-LOCKBOX_WINDOW.z)>=1.95)return false;
 w.nextRepair=t0+lockboxRepairTime(quick);
 lockboxBoards(w.count+1,w.reinforced|(reinforced?1<<w.count:0));
 if(w.count===w.meshes.length&&(w.reinforced&1))w.shockArmed=true;
 return true;
}
function lockboxRepairTime(quick){return LOCKBOX_WINDOW.repairTime*(quick?.5:1)}

function lockboxHold(){
 const w=zq.barricade;
 if(!w||!zq.cur?.hold||P.dead||!key.KeyF||w.count===w.meshes.length)return;
 const quick=!!zq.perks.spd,reinforced=!!zq.perks.bolt;
 if(zCli()){
  if(t0<w.nextRequest)return;
  w.nextRequest=t0+lockboxRepairTime(quick);
  netSend({t:'zqw',quick,reinforced});
 }else lockboxRepair(P,quick,reinforced);
}

function lockboxTearPose(b){
 if(!b.tear)return null;
 const u=Math.min(1,b.tear),reach=zsm_(u/.45),pull=zsm_((u-.45)/.4);
 const y=b.tearY??.25;
 return {lean:.28*reach-.5*pull,tw:.18*pull,bob:-.12*reach,hx:-.34*reach,hy:0,
  R:[.1,y,.3+.38*reach-.52*pull],L:[-.1,y+.07,.32+.34*reach-.49*pull],
  hR:[.6,-1,-.3],hL:[-.6,-1,-.3],jaw:.25+.5*pull};
}

function lockboxShock(){
 zq.barricade.shockArmed=false;
 for(const zombie of bots){
  if(zombie.zom&&zombie.al&&!zombie.entered&&!zombie.crossing&&
     Math.hypot(zombie.x,zombie.z-LOCKBOX_WINDOW.z)<4){
   zombie.stun=Math.max(zombie.stun||0,2);
  }
 }
 lockboxShockFx();
 if(netOn)netSend({t:'zbt'});
}
function lockboxShockFx(){
 const at=V(0,1.4,LOCKBOX_WINDOW.z);
 burst(at,24,0x77e9ff,6,.46,.064);
 JX.h.addSp({p:at,s0:.6,s1:2.8,life:.28,c:[.4,1.5,2.2],op:.85});
 beep(125,.28,'sawtooth',.09);
 msg('Bolt Brew · Window discharge',1.5);
}

function lockboxEntry(b,dt){
 const w=zq.barricade,entry=LOCKBOX_WINDOW;
 if(b.entered)return false;
 if(b.crossing){
  lockboxVaultStep(b,Math.min(1,b.crossing+dt/entry.vaultTime));
  if(b.crossing===1){
   b.entered=true;b.crossing=0;b.vaultPose=null;b.y=0;
   w.nextTear=t0+.24;
   burst(V(0,.12,entry.inside),6,0x918372,2,.26,.055);
  }
  return true;
 }
 if(b.tear){
  const reinforced=!b.tore&&w.count>0&&(w.reinforced&(1<<(w.count-1)));
  b.tear+=dt/(reinforced?1.08:.72);
  if(b.tear>=.76&&!b.tore){
   b.tore=true;
   if(w.count)lockboxBoards(w.count-1);
   if(reinforced&&!w.count&&w.shockArmed)lockboxShock();
   burst(V(0,1.45,entry.z),10,0xb7986b,3,.5,.065);
  }
  if(b.tear>=1)b.tear=0;
  return true;
 }
 let rank=0;
 for(const other of bots){
  if(other.zom&&other.al&&other.i<b.i&&!other.crossing&&!other.entered)rank++;
 }
 const row=Math.floor((rank-1)/7),lane=(rank-1)%7;
 const x=rank?Math.ceil(lane/2)*(lane%2?-1:1)*.9:0;
 const target=rank?-5.18-row*.74:entry.approach;
 const dx=x-b.x,dz=target-b.z,d=Math.hypot(dx,dz);
 const step=Math.min(d,b.sp*dt*(b.stun>0?.15:1));
 b.stun=Math.max(0,(b.stun||0)-dt);
 if(d>0){
  b.x+=dx*step/d;
  b.z=step===d?target:b.z+dz*step/d;
  b.tyaw=Math.atan2(dx,dz);
 }
 b.m.position.set(b.x,0,b.z);
 if(!rank&&!(w.climber?.al&&w.climber.crossing)&&d<.08&&t0>=w.nextTear&&!(b.stun>0)){
  if(w.count){
   w.nextTear=t0+.95;
   b.tear=.01;b.tore=false;
   b.tearY=cl((w.meshes[w.count-1].userData.y/(b.big?1.35:1))-1.45,-.52,.42);
   b.tyaw=0;
  }else{
   w.climber=b;
   lockboxVaultStep(b,.001);
  }
 }
 return true;
}

zMapScreen();

function perkCabinet(m,t,p,g){
 const iron=eM(0x252c29,0,.58,.46),brass=eM(0xb5a584,0,.42,.55),cream=eM(0xcfc2a1,0,.54,.12);
 const enamel=eM(new THREE.Color(p.c).multiplyScalar(.72).getHex(),0,.46,.24);
 const glass=eBasic(p.c,.48),light=eBasic(p.c,1);
 const box=(mat,x,y,z,w,h,d,r=.035)=>eMk(g,hvR(w,h,d,r),mat,x,y,z,w,h,d);
 const cyl=(mat,x,y,z,r,h,rx=0)=>eMk(g,EG.cyl,mat,x,y,z,r,h,r,rx);
 const front=(mat,x,y,z,w,h)=>eMk(g,EG.pl,mat,x,y,z,w,h,1);
 const sign=eSign(p.n,p.c);
 const rack=new THREE.Group();rack.userData.dyn=true;g.add(rack);
 let badge,dock;
 switch(t){
  case 'vit': { // A wall of enamel first-aid drawers.
   box(enamel,0,1.24,-.04,1.37,2.36,.9,.13);
   box(cream,0,1.49,.419,1.15,1.17,.08,.09);
   box(enamel,0,1.62,.476,.52,.13,.03);box(enamel,0,1.62,.477,.13,.52,.031);
   for(const y of [.32,.63]){
    box(cream,0,y,.421,.92,.235,.06);
    box(brass,0,y,.47,.39,.049,.07);
   }
   badge=[0,2.23,.424,1.13,.30];dock=[0,.91,.48];
   break;
  }
  case 'spd': { // A narrow chrome tower with a finned accelerator.
   box(iron,0,.13,0,1.27,.22,1.0);
   box(enamel,0,1.32,-.12,.82,2.48,.69,.09);
   for(const x of [-.46,.46]){
    cyl(brass,x,1.26,.03,.07,2.04);
    box(iron,x,1.69,.19,.24,.76,.38,.055);
    for(let i=0;i<6;i++)box(brass,x,1.39+i*.116,.4,.25,.028,.055);
   }
   for(let i=0;i<4;i++)box(light,0,1.08+i*.22,.249,.46-i*.075,.064,.019);
   badge=[0,2.37,.27,1.02,.30];dock=[0,.65,.28];
   break;
  }
  case 'dbl': { // Two soda drums on a low service stand.
   box(iron,0,.48,-.04,1.44,.87,.91,.07);
   for(const x of [-.36,.36]){
    cyl(enamel,x,1.42,-.05,.33,1.03);
    for(const y of [.96,1.62,1.92])cyl(brass,x,y,-.05,.341,.065);
    cyl(iron,x,2,-.05,.1,.14);cyl(light,x,2.10,-.05,.046,.08);
   }
   box(iron,0,1.17,.34,1.31,.35,.19);
   badge=[0,1.18,.442,1.18,.27];dock=[0,.64,.48];
   break;
  }
  case 'rev': { // An upright with a round viewing port.
   box(enamel,0,1.23,-.03,1.29,2.36,.88,.085);
   cyl(iron,0,1.54,.44,.51,.13,Math.PI/2);
   cyl(brass,0,1.54,.52,.451,.052,Math.PI/2);
   cyl(iron,0,1.54,.56,.407,.05,Math.PI/2);
   cyl(glass,0,1.54,.60,.387,.015,Math.PI/2);
   for(const [x,y,w,a] of [[-.21,1.53,.18,0],[-.069,1.575,.14,.88],[.024,1.57,.19,-1.0],[.152,1.52,.18,.3]])
    eMk(rack,EG.box,cream,x,y,.619,w,.03,.013,0,0,a);
   badge=[0,2.21,.42,1.1,.28];dock=[0,.74,.47];
   break;
  }
  case 'stam': { // Fuel-pump silhouette, meter and hose.
   box(enamel,0,1.17,-.11,.86,2.18,.74,.11);
   box(iron,0,.16,0,1.29,.23,1.02);
   cyl(brass,0,2.34,-.12,.33,.17,Math.PI/2);
   cyl(cream,0,2.34,-.018,.258,.024,Math.PI/2);
   eMk(rack,EG.box,iron,.012,2.39,.015,.026,.16,.018,0,0,-.57);
   eMk(g,EG.tor,iron,.54,1.02,.123,.18,.66,.14);
   eMk(g,EG.box,brass,.58,1.56,.25,.11,.30,.108,0,0,-.33);
   for(const y of [.83,.97,1.11])box(brass,0,y,.27,.54,.031,.028);
   badge=[0,1.87,.272,.86,.28];dock=[0,.54,.28];
   break;
  }
  case 'mule': { // A squat tool chest with a cubby and drawer pulls.
   for(const x of [-.61,.61])box(iron,x,.45,0,.12,.87,.98);
   box(enamel,0,.87,-.035,1.45,1.35,.84,.04);
   box(iron,0,1.57,.002,1.52,.13,1.04);
   for(const y of [.43,.72]){
    box(brass,-.21,y,.416,.8,.21,.078);
    box(iron,-.21,y,.47,.28,.043,.055);
   }
   for(const [x,y,w] of [[-.42,1.76,.44],[.25,1.74,.55],[.18,2.02,.44]]){
    box(iron,x,y,0,w,.26,.59);
    box(enamel,x,y+.071,.324,w*.93,.053,.052);
   }
   badge=[0,1.21,.423,1.20,.28];dock=[.43,.74,.46];
   break;
  }
  case 'bolt': { // Riveted housing around an exposed hydraulic press.
   box(iron,0,.26,-.03,1.18,.47,1.04,.12);
   box(enamel,0,1.32,-.29,1.18,1.69,.45,.08);
   box(enamel,0,2.21,0,1.28,.39,.91,.08);
   for(const x of [-.51,.51]){
    box(iron,x,1.31,.10,.20,1.55,.68);
    for(const y of [.66,1.91])eMk(g,EG.cyl8,brass,x,y,.46,.059,.045,.059,Math.PI/2);
   }
   cyl(brass,0,1.63,.17,.23,.70);
   cyl(cream,0,1.19,.17,.097,.47);
   box(iron,0,.94,.17,.65,.09,.48);
   box(light,0,.79,.43,.33,.045,.024);
   badge=[0,2.23,.466,1.12,.27];dock=[0,.56,.5];
   break;
  }
  case 'keyring': {
   box(iron,0,.25,0,1.3,.44,1.03,.1);
   box(enamel,0,1.35,-.1,1.14,1.95,.72,.1);
   box(iron,0,1.51,.29,1.03,1.24,.17);
   for(const x of [-.36,.36]){
    cyl(cream,x,1.52,.41,.095,.86);
    for(const y of [1.15,1.34,1.7,1.89])cyl(light,x,y,.41,.115,.038);
   }
   const coil=eMk(g,EG.tor,light,0,1.53,.47,.34,.34,.34);
   coil.rotation.y=.12;
   badge=[0,2.25,.32,1.15,.28];dock=[0,.65,.31];
   break;
  }
  case 'crypt': { // Cemetery stonework around a stained-glass reliquary.
   box(iron,0,.22,-.04,1.45,.43,1.05,.065);
   box(enamel,0,1.23,-.05,1.23,1.71,.84,.065);
   for(const x of [-.57,.57]){
    box(cream,x,1.19,.365,.12,1.63,.17);
    box(brass,x,1.86,.399,.16,.07,.14);
   }
   box(cream,0,2.19,-.05,1.08,.32,.8,.055);
   eMk(g,EG.cyl8,brass,0,1.47,.413,.39,.05,.39,Math.PI/2);
   eMk(g,EG.cyl8,glass,0,1.47,.451,.34,.024,.34,Math.PI/2);
   for(const x of [-.15,0,.15])box(iron,x,1.47,.474,.027,x===0?.64:.51,.024);
   box(brass,0,1.47,.478,.64,.026,.022);
   badge=[0,2.21,.371,1.09,.25];dock=[0,.62,.41];
   break;
  }
  case 'line': { // Substation switchgear with paired insulators and an analog meter.
   box(iron,0,.22,0,1.31,.42,1.03,.055);
   box(enamel,0,1.22,-.03,1.24,1.64,.91,.07);
   box(iron,0,1.32,.455,1.05,1.13,.13,.065);
   for(const x of [-.37,.37]){
    cyl(cream,x,2.12,-.10,.085,.30);
    for(const y of [2.15,2.25,2.35])cyl(brass,x,y,-.10,.135,.045);
    box(light,x,1.4,.53,.075,.21,.023);
   }
   eMk(g,EG.cyl,cream,0,1.46,.53,.25,.054,.25,Math.PI/2);
   eMk(g,EG.box,iron,.015,1.51,.566,.033,.19,.022,0,0,-.66);
   for(const y of [.93,1.01,1.09])box(brass,0,y,.531,.78,.024,.03);
   badge=[0,1.96,.432,1.07,.25];dock=[0,.60,.465];
   break;
  }
 }
 front(sign,...badge);
 const [x,y,z]=dock;
 box(iron,x,y,z,.36,.23,.06);
 const flap=eMk(g,EG.box,brass,x,y+.084,z+.047,.29,.046,.072);
 flap.userData.dyn=true;
 front(eSign(String(p.cost),p.c,128,56),x,y-.17,z+.037,.39,.14);
 const [width,depth]=eSwap(m.f,1.65,1.15),bxo=zSolid(m.x,m.z,width,depth,2.59);
 eFlatten(g,.52,.26);zG.add(g);
 return {g,t,ph:erand()*6,sign,rack,flap,bxo,c:p.c,x0:m.x,dispenser:[x,y,z+.10]};
}

/* Stained timber, corner irons and a stencilled mark on the rectangular lid. */
const LOCKBOX_WOOD={};
function lockboxWood(color){
 if(!LOCKBOX_WOOD.grain){
  const grain=zTex(256,128,(g,w,h)=>{
   g.fillStyle='#d0b89e';g.fillRect(0,0,w,h);
   for(let i=0;i<104;i++){
    const y=i*h/104,f=.8+(i%7)*.29;
    g.strokeStyle=i%4?'rgba(47,26,15,.17)':'rgba(255,237,204,.34)';
    g.beginPath();g.moveTo(0,y);g.bezierCurveTo(65,y+Math.sin(i*7)*f,175,y+Math.cos(i*11)*f,w,y);
    g.stroke();
   }
   for(const [x,y] of [[89,35],[205,92]]){
    g.strokeStyle='rgba(48,32,20,.2)';
    for(let k=1;k<6;k++){g.beginPath();g.ellipse(x,y,k*3.5,k*1.33,-.03,0,2*Math.PI);g.stroke()}
   }
  });
  grain.encoding=THREE.sRGBEncoding;LOCKBOX_WOOD.grain=grain;
 }
 return LOCKBOX_WOOD[color]||(LOCKBOX_WOOD[color]=new THREE.MeshLambertMaterial({color,map:LOCKBOX_WOOD.grain}));
}

function lockboxChest(g,lid){
 const timber=lockboxWood(0x8e654a),rim=eM(0x303934,0,.58,.66),brass=eM(0xb28b52,0,.44,.75);
 eMk(g,EG.box,rim,0,.13,0,1.94,.18,1.02);
 for(const s of [-1,1]){
  for(const y of [.28,.445,.61,.775])eMk(g,EG.box,timber,0,y,s*.455,1.85,.16,.09);
  eMk(g,EG.box,timber,s*.89,.529,0,.088,.64,.94);
  const handle=eMk(g,EG.tor,brass,s*.962,.542,0,.125,.086,.125,0,Math.PI/2);
  handle.castShadow=false;
  for(const x of [-.77,.77]){
   eMk(g,EG.box,rim,x,.535,s*.507,.12,.613,.047);
   for(const y of [.31,.74])eMk(g,EG.sph,brass,x,y,s*.541,.025,.025,.017);
  }
  eMk(g,EG.box,rim,0,.846,s*.47,1.92,.069,.098);
 }
 eMk(g,EG.box,rim,0,.71,.511,.32,.22,.085);
 eMk(g,EG.box,brass,0,.718,.565,.142,.168,.048);
 eMk(g,EG.box,rim,0,.713,.594,.039,.058,.012);
 for(const x of [-.77,.77]){
  eMk(lid,EG.box,rim,x,.128,.51,.14,.083,1.03);
  eMk(lid,EG.cyl,brass,x,.027,.005,.045,.218,.045,0,0,Math.PI/2);
 }
 eMk(lid,hvR(1.94,.146,1.022,.035),timber,0,.073,.51,1.94,.146,1.022);
 const marks=eCanvasMat(256,112,(c,w,h)=>{
  c.textAlign='center';c.textBaseline='middle';c.font='bold 85px Georgia';
  c.shadowColor='#e9a844';c.shadowBlur=17;c.fillStyle='#f9d78a';
  for(const x of [72,184])c.fillText('?',x,h*.48);
 },true);
 eMk(lid,EG.pl,marks,0,.15,.51,1.16,.67,1,-Math.PI/2).castShadow=false;
}

/* Boards block only the space their timber occupies. Use the same swept
   collision for pellets and thrown equipment, with clearance for the grenade. */
function lockboxBoardRay(o,d,limit,r=0){
 const w=zq?.barricade;
 if(!w||Math.abs(d.z)<1e-8)return limit;
 for(let i=0;i<w.count;i++){
  const board=w.meshes[i].userData;
  if(board.motion)continue;
  const x=o.x-board.x,y=o.y-board.y,{cos,sin}=board;
  const origin={x:x*cos+y*sin,y:y*cos-x*sin,z:o.z-board.z};
  const dir={x:d.x*cos+d.y*sin,y:d.y*cos-d.x*sin,z:d.z};
  const halfW=board.width/2+r,halfH=board.height/2+r,halfD=board.depth/2+r;
  limit=Math.min(limit,rb(origin,dir,{x0:-halfW,x1:halfW,y0:-halfH,h:halfH,z0:-halfD,z1:halfD}));
 }
 return limit;
}

function lockboxEquipmentHit(from,to){
 const d=to.clone().sub(from),r=.055;
 if(lockboxBoardRay(from,d,2,r)<=1)return true;
 return bx.some(b=>rb(from,d,{x0:b.x0-r,x1:b.x1+r,y0:b.y0-r,h:b.h+r,z0:b.z0-r,z1:b.z1+r})<=1);
}

/* Time, root depth and lift, torso lean, then right and left ankle targets.
   The trailing foot stays raised until it clears the inside edge of the frame. */
const LOCKBOX_VAULT=[
 [0,-4.30,0,.30,-4.23,.03,-4.41,.03],
 [.16,-4.49,-.09,.49,-4.45,.16,-4.65,.04],
 [.28,-4.43,.39,.86,-4.18,.97,-4.47,.56],
 [.34,-4.23,.36,.95,-3.81,1.00,-4.40,.61],
 [.53,-3.79,.49,1.16,-3.39,1.08,-4.11,1.05],
 [.70,-3.29,.39,.98,-3.02,.52,-3.69,1.03],
 [.85,-2.91,.11,.59,-2.67,.08,-3.10,.85],
 [1,-2.50,0,.30,-2.44,.04,-2.70,.04]
];

function lockboxVaultStep(b,u){
 const next=LOCKBOX_VAULT.findIndex(frame=>frame[0]>=u),end=LOCKBOX_VAULT[Math.max(1,next)],start=LOCKBOX_VAULT[Math.max(0,next-1)];
 const f=zsm_((u-start[0])/(end[0]-start[0]));
 const [,z,lift,lean,rz,ry,lz,ly]=start.map((v,i)=>v+(end[i]-v)*f);
 b.crossing=u;b.x=0;b.z=z;b.y=lift;b.tyaw=0;
 b.vaultPose={lean,rz,ry,lz,ly};
 b.m.position.set(b.x,b.y,b.z);
 b.m.rotation.y=b.ry=0;
}

function lockboxVaultPose(b){
 const u=b.crossing,{lean}=b.vaultPose,sc=b.big?1.35:1;
 const brace=zsm_(u/.19)*(1-zsm_((u-.49)/.25));
 const push=zsm_((u-.55)/.31)*(1-zsm_((u-.86)/.14));
 const y=(.96-b.y)/sc-1-.5*Math.cos(lean),z=(-3.66-b.z)/sc-.5*Math.sin(lean);
 return {vault:true,lean,tw:.12*push,bob:0,hx:-.23*brace,hy:0,
  R:[.08*brace,-.12*(1-brace)+y*brace,.55*(1-brace)+z*brace],
  L:[-.08*brace,-.12*(1-brace)+y*brace,.56*(1-brace)+z*brace],
  hR:[.6,-1,-.3],hL:[-.6,-1,-.3],jaw:.25+.35*push};
}

function lockboxVaultLegs(b,r){
 const {rz,ry,lz,ly}=b.vaultPose,sc=b.big?1.35:1;
 for(const [thigh,shin,z,y] of [[r.legR,r.shinR,rz,ry],[r.legL,r.shinL,lz,ly]]){
  const dy=.98-(y-b.y)/sc,dz=(z-b.z)/sc;
  const bend=Math.acos(Math.min(1,Math.hypot(dy,dz)/.92));
  thigh.position.y=.98;
  thigh.rotation.x=-Math.atan2(dz,dy)-bend;
  shin.rotation.x=2*bend;
 }
}

function lockboxVaultHitPts(b){
 const {lean}=b.vaultPose,s=b.big?1.35:1;
 return [V(b.x,b.y+(1+.80*Math.cos(lean))*s,b.z+.80*Math.sin(lean)*s),
         V(b.x,b.y+(1+.24*Math.cos(lean))*s,b.z+.24*Math.sin(lean)*s),.22*s,.42*s];
}

/* A compact, two-roller workshop press with its own enamel marquee. */
function lockboxPapMachine(m){
 const g=new THREE.Group();g.position.set(m.x,zObjectFloor(m.x,m.z),m.z);g.rotation.y=eFace(m.f);
 const teal=eM(0x4a8882,0,.61,.44),steel=eM(0x9aada8,0,.35,.68);
 const dark=eM(0x202623,0,.66,.30),copper=eM(0xaa7247,0,.53,.53),ivory=eM(0xd9c9a2,0,.58,.10);
 const metal=(mat,x,y,z,w,h,d,r=.035)=>eMk(g,hvR(w,h,d,r),mat,x,y,z,w,h,d);
 metal(dark,0,.28,-.03,1.92,.38,.92,.11);
 for(const x of [-.83,.83]){
  eMk(g,EG.box,steel,x,.17,.05,.14,.35,.64,-.18,0,x*.24);
  metal(teal,x,1.06,-.02,.39,1.51,.87,.12);
  metal(steel,x,1.10,.448,.33,1.45,.07,.035);
 }
 metal(dark,0,1.13,-.33,1.39,1.28,.23);
 metal(teal,0,.63,.09,1.62,.41,.81,.09);
 metal(steel,0,.848,.152,1.53,.07,.76);
 metal(teal,0,1.71,-.02,1.58,.35,.88,.12);
 metal(steel,0,1.54,.43,1.60,.077,.104);
 for(let i=0;i<9;i++){
  eMk(g,EG.box,dark,-.56+i*.14,.624,.506,.085,.037,.025,0,0,-.31);
 }
 const rolls=[];
 for(const y of [1.026,1.38]){
  const spindle=new THREE.Group();spindle.position.set(0,y,.12);spindle.userData.dyn=true;g.add(spindle);
  eMk(spindle,EG.cyl,steel,0,0,0,.145,1.36,.145,0,0,Math.PI/2);
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5;
   eMk(spindle,EG.box,copper,0,Math.sin(a)*.145,Math.cos(a)*.145,1.16,.046,.025,-a);
  }
  rolls.push(spindle);
 }
 for(const x of [-.55,.58])metal(steel,x,2.05,-.17,.13,.54,.21,.027);
 metal(dark,0,2.44,-.12,2.07,.54,.48,.105);
 metal(teal,0,2.46,.11,2.0,.47,.107,.092);
 const sign=eCanvasMat(512,124,(c,w,h)=>{
  c.fillStyle='#decda5';c.fillRect(0,0,w,h);
  c.fillStyle='#ad5940';c.fillRect(0,15,22,h-30);
  c.fillStyle='#37645b';c.fillRect(w-39,15,39,h-30);
  c.strokeStyle='#6d6f48';c.lineWidth=3;c.strokeRect(8,8,w-16,h-16);
  c.font='bold 51px Georgia';c.fillStyle='#243a35';c.textAlign='center';c.textBaseline='middle';
  c.fillText('PACK-A-PUNCH',w*.48,h*.52);
 },true);
 eMk(g,EG.pl,sign,0,2.46,.167,1.86,.385,1).castShadow=false;
 metal(ivory,.77,1.88,.411,.28,.19,.078,.045);
 const dial=eMk(g,EG.cyl,dark,.77,1.88,.458,.066,.027,.066,Math.PI/2);dial.castShadow=false;
 const channel=eBasic(0xffce79,.24,1);
 eMk(g,EG.pl,channel,0,1.184,.441,1.22,.28,1).castShadow=false;
 const hov=new THREE.Group();hov.position.set(0,1.18,.69);hov.userData.dyn=true;g.add(hov);
 eFlatten(g,.58,.48);
 const [w,d]=eSwap(m.f,2.08,1.03);
 zSolid(m.x,m.z,w,d,2.68);zG.add(g);
 EST.objs.pap={g,m,rolls,hov,sign,channel,t:0,act:0};
 zq.mp.push({k:'pap',x:m.x,z:m.z,f:m.f,n:'Pack-a-Punch'});
 const pos=[m.x,m.z+.71];
 zi.push({x:pos[0],z:pos[1],r:1.42,txt:()=>zPapTxt(),cost:()=>zPapCost(),act:()=>zPapAct(pos)});
}

function lockboxPapTick(o,dt,t){
 o.t+=dt;
 const speed=o.act?9:.4;
 o.rolls.forEach((roller,i)=>roller.rotation.x+=dt*speed*(i?1:-1));
 o.channel.opacity=o.act?.38+.18*Math.sin(t*17):.09;
 o.sign.color.setGray(.88+.10*Math.sin(t*5));
 if(o.item){
  o.hov.position.y=1.20+Math.sin(t*4)*.06;
  o.hov.rotation.y+=dt*2;
 }
 if(o.fin&&o.t>.8)o.fin=0;
}

if(sel.mode==='Zombies'&&sel.zmap===ROOM_CHALLENGE){sel.map=ROOM_CHALLENGE;buildMap();ui()}
;

const practiceName='Practice Range';
let practiceSession=null;

const aimOptions={ads:55,color:'#f8f8ed',size:100};
try{
 const saved=JSON.parse(localStorage.getItem('sd-aim-options'))||{};
 if(Number.isFinite(saved.ads))aimOptions.ads=cl(saved.ads,25,150);
 if(Number.isFinite(saved.size))aimOptions.size=cl(saved.size,50,200);
 if(typeof saved.color==='string'&&/^#[a-f0-9]{6}$/i.test(saved.color))aimOptions.color=saved.color;
}catch{}
function applyAimOptions(){
 const reticle=$('#cx');
 reticle.style.setProperty('--crosshair-color',aimOptions.color);
 reticle.style.setProperty('--crosshair-size',aimOptions.size/100);
 for(const field of $$('[data-aim-option]'))field.value=aimOptions[field.dataset.aimOption];
 for(const output of $$('[data-aim-value]'))output.value=aimOptions[output.dataset.aimValue]+'%';
}
for(const field of $$('[data-aim-option]'))field.oninput=()=>{
 aimOptions[field.dataset.aimOption]=field.type==='range'?Number(field.value):field.value;
 applyAimOptions();
 try{localStorage.setItem('sd-aim-options',JSON.stringify(aimOptions))}catch{}
};
applyAimOptions();

const practiceMap={
 H:34,ps:[0,26],sky:0xb4d1dc,gr:0x666b61,gt:'concrete',bc:0x657474,day:1,skyk:'day',fogF:110,
 hemi:1.05,hemiC:0xe7f3f2,sunC:0xffefcf,sunI:1.08,
 inside:(x,z)=>Math.abs(x)<21&&z>-33&&z<32,
 b(){
  const walls=[[-21,0,.85,66,4.7,0,0x53666a,'metal'],[21,0,.85,66,4.7,0,0x53666a,'metal'],
   [0,-33,43,1.4,6,0,0x333f42,'metal'],[0,32,43,.85,4.7,0,0x53666a,'metal']];
  for(const side of [-1,1]){
   walls.push([side*17,27,6,9,3.5,0,0x4c5d62,'metal']);
   for(const z of [-20,-3,14])walls.push([side*17,z,3,2,1.4,0,0x72705e,'concrete']);
   for(const x of [6,12,18])for(const z of [-24,-4,16,26])
    walls.push([side*x,z,.07,5,.02,0,0xb9a76a,'concrete']);
  }
  for(const z of [-24,-4,16,26])walls.push([0,z,36,.09,.022,0,0xd9bd66,'concrete']);
  return walls;
 }
};

function startPractice(guided=false){
 if(run||netOn||window.SD_SPLIT)return;
 if(net||partyActive){
  $('#practice-note').textContent='Leave the online lobby or party to practice solo.';
  return;
 }
 $('#practice-note').textContent='';
 practiceSession={map:sel.map,targets:0,headshots:0,training:guided?{step:0}:null};
 document.body.classList.add('practice-range');
 document.body.classList.toggle('basic-training',guided);
 MAPS[practiceName]=practiceMap;sel.map=practiceName;startGame();
 const reset=$('#practice-reset');
 reset.textContent=guided?'Restart training':'Reset targets and ammo';
 reset.hidden=false;
 if(guided)renderTraining();
}
$('#practice-start').onclick=()=>startPractice();
$('#training-start').onclick=()=>startPractice(true);
$('#practice-reset').onclick=()=>{
 if(!practiceSession)return;
 practiceSession.targets=practiceSession.headshots=0;shots=hits=0;rel=0;
 for(const b of bots){b.hp=b.mhp;b.al=1;b.m.visible=true;b.flash=0;b.rt=0}
 for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs??4)}
 if(practiceSession.training){
  [P.x,P.z]=practiceMap.ps;
  P.y=P.vy=P.mx=P.mz=0;yaw=pitch=kick=0;
  ctlReset();equipLifeWeapons();
  practiceSession.training={step:0};renderTraining();
 }else{gc=LG()?2:0;setGun()}
 lockPtr();
};

const trainingCoach=$('#training-coach');
const trainingTitles=['Get moving','Clear a target','Reload','Switch weapons','Land a sidearm hit','Training complete'];
const trainingDrills=trainingTitles.length-1;
const trainingKey='sd-training-complete';
function trainingComplete(){
 try{return localStorage.getItem(trainingKey)==='1'}catch{return false}
}
function trainingControls(){
 if(xrS)return ['Left stick','Right trigger','Right grip','B'];
 if(PG.on)return [PG.b('ls'),PG.b('rt'),PG.l('reload'),PG.l('swap')];
 if(isTouch)return ['Move stick','Fire area on the right','Reload','Swap'];
 return [['fwd','left','back','right'].map(action=>keyName(bindOf(action))).join(' / '),'Left mouse button',keyName(bindOf('reload')),keyName(bindOf('next'))];
}
function renderTraining(){
 const training=practiceSession.training,[move,fire,reload,swap]=trainingControls();
 const hints=[
  'Move a few steps from the starting line. · '+move,
  'Aim at an orange target and fire short bursts until it drops. · '+fire,
  'Fire once if the magazine is full, then reload. · '+reload,
  'Equip your Magnum sidearm. · '+swap,
  'Hit an orange target with the Magnum. · '+fire,
  'Keep practicing or exit from the pause menu.'
 ];
 trainingCoach.hidden=false;
 trainingCoach.children[0].textContent=training.step===trainingDrills?'All drills cleared':'Basic training · '+(training.step+1)+' / '+trainingDrills;
 trainingCoach.children[1].textContent=trainingTitles[training.step];
 trainingCoach.children[2].textContent=hints[training.step];
 training.input=xrS?'xr':PG.on?PG.type:isTouch?'touch':'mouse';
}
function advanceTraining(training){
 training.step++;
 training.targets=practiceSession.targets;
 training.hits=hits;
 if(training.step===trainingDrills){
  try{localStorage.setItem(trainingKey,'1')}catch{}
  beep(880,.22,'triangle',.07);
 }
 renderTraining();
}
function trainingTick(training){
 switch(training.step){
  case 0:
   if(Math.hypot(P.x-practiceMap.ps[0],P.z-practiceMap.ps[1])>=3)advanceTraining(training);
   break;
  case 1:
   if(practiceSession.targets>training.targets)advanceTraining(training);
   break;
  case 2:{
   const weapon=cw();
   if(rel>0){
    training.reloadWeapon=weapon;training.reloadMagazine=weapon.mag;
   }else if(training.reloadWeapon){
    if(training.reloadWeapon===weapon&&weapon.mag>training.reloadMagazine)advanceTraining(training);
    training.reloadWeapon=null;
   }
   break;
  }
  case 3:
   if(cw().k==='MG')advanceTraining(training);
   break;
  case 4:
   if(cw().k==='MG'&&hits>training.hits)advanceTraining(training);
   else if(cw().k!=='MG')training.hits=hits;
 }
 if(training.input!==(xrS?'xr':PG.on?PG.type:isTouch?'touch':'mouse'))renderTraining();
}

function practiceSetup(){
 const materials={
  stand:new THREE.MeshLambertMaterial({color:0x343e45}),
  shell:new THREE.MeshLambertMaterial({color:0xf6a944}),
  plate:new THREE.MeshLambertMaterial({color:0x38505d}),
  light:new THREE.MeshBasicMaterial({color:0xffe5a0})
 };
 mapG.addEventListener('removed',()=>{for(const material of Object.values(materials))material.dispose()});
 for(const [x,z,travel,speed] of [[0,16,0,0],[-5,5,0,0],[7,0,3,1.65],[-10,-9,2,.95],[0,-15,4,1.45],[11,-21,2,1.1],[-8,-24,0,0]]){
  const b=addBot(85,1,null,true);
  b.m.clear();mapG.add(b.m);
  b.practice=true;b.rig=null;b.hp=b.mhp=85;b.sh=b.msh=0;b.al=1;
  b.x=b.startX=x;b.z=z;b.travel=travel;b.speed=speed;b.flash=0;b.rt=0;b.nm='Target';
  const box=(name,w,h,d,y)=>{
   const piece=new THREE.Mesh(bg,materials[name]);
   piece.scale.set(w,h,d);piece.position.y=y;b.m.add(piece);return piece;
  };
  box('stand',.62,.1,.55,.05);box('stand',.17,.73,.16,.39);
  box('plate',.65,.73,.25,.98);box('shell',.48,.56,.12,1.02).position.z=.139;
  box('stand',.14,.13,.13,1.42);box('plate',.37,.33,.24,1.69);
  box('shell',.265,.215,.056,1.73).position.z=.128;
  b.lead=box('light',.31,.038,.07,1.15);b.lead.position.z=.209;
 }
}

function practiceHit(b,damage,head){
 takeDmg(b,damage);hits++;b.flash=.13;
 $('#hm').className='on'+(head?' hd':'');hmT=.12;
 if(head)practiceSession.headshots++;
 beep(head?1050:650,.065,'square',.055);
 if(b.hp>0)return;
 b.al=0;b.rt=1.15;practiceSession.targets++;
 burst(V(b.x,head?1.69:1,b.z),12,0xffbd64,4,.4,.064);
}

function practiceTick(dt){
 for(const b of bots){
  b.flash=Math.max(0,b.flash-dt);
  if(b.al)b.x=b.startX+Math.sin(t0*b.speed)*b.travel;
  else if((b.rt-=dt)<=0){b.hp=b.mhp;b.al=1}
  b.lead.visible=b.al&&b.flash<=0;
  b.m.position.set(b.x,0,b.z);
  b.m.rotation.x=b.al?0:-Math.min(1.3,(1.15-b.rt)*7);
 }
 for(const w of wp)w.res=w.m*(w.rs??4);
 if(practiceSession.training)trainingTick(practiceSession.training);
 const percentage=shots?Math.min(100,Math.round(hits/shots*100)):0;
 const stats='Practice Range · '+practiceSession.targets+' cleared · '+practiceSession.headshots+' head hits · '+percentage+'% accuracy';
 setObjectiveText(stats);
}
;

/* Match records stay with the browser profile and have no effect on progress. */
const combatRecordKey='sd-combat-record';
const recordLimit=30;
const combatDate=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'});
let recordView='mp';
const privateMatchResult=value=>value==='Victory'?'Victory':['Eliminated','Out of lives','You were eliminated'].includes(value)?'Eliminated':'Defeat';
function readCombatRecord(){
 try{
  const stored=JSON.parse(localStorage.getItem(combatRecordKey));
  if(Array.isArray(stored))return stored.filter(row=>row&&typeof row.map==='string'&&
   typeof row.mode==='string'&&typeof row.result==='string'&&Number.isFinite(row.at)&&
   row.at>0&&row.at<=8.64e15&&['kills','deaths','hits','shots','duration'].every(key=>Number.isFinite(row[key])))
   .slice(0,recordLimit).map(row=>({...row,map:currentMapName(row.map),result:privateMatchResult(row.result)}));
 }catch{}
 return [];
}
function saveCombatRecord(result){
 if(window.SD_MOD_SESSION||practiceSession||result==='Disconnected')return;
 const record={at:Date.now(),map:sel.map,mode,result:privateMatchResult(result),kills,deaths,hits,shots,
  duration:Math.max(0,Math.round(t0)),round:mode==='Zombies'?zq?.r||1:0,
  connection:window.SD_SPLIT?'Split screen':netOn?'Online':'Local'};
 const recent=[record,...readCombatRecord()].slice(0,recordLimit);
 try{localStorage.setItem(combatRecordKey,JSON.stringify(recent))}catch{}
}
function renderCombatRecord(view=recordView){
 recordView=view==='zm'?'zm':'mp';
 for(const button of $$('#record-tabs button'))button.setAttribute('aria-pressed',String(button.dataset.recordFilter===recordView));
 const panel=$('#combat-record'),rows=readCombatRecord().filter(row=>(row.mode==='Zombies')===(recordView==='zm'));
 if(!rows.length){panel.innerHTML='<p class="record-empty">Finish a match in this mode to start your record.</p>';return}
 const stats=rows.reduce((totals,row)=>{
  totals.kills+=row.kills;totals.deaths+=row.deaths;totals.hits+=row.hits;totals.shots+=row.shots;
  if(row.result==='Victory')totals.wins++;
  return totals;
 },{kills:0,deaths:0,hits:0,shots:0,wins:0});
 const accuracy=(hits,shots)=>shots?Math.min(100,Math.round(100*hits/shots))+'%':'—';
 const clock=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
 const summary=[['Recent matches',rows.length],['Kills / deaths',stats.kills+' / '+stats.deaths],['Accuracy',accuracy(stats.hits,stats.shots)]];
 if(recordView==='mp')summary.splice(1,0,['Wins',stats.wins]);
 else summary.splice(1,0,['Best round',Math.max(1,...rows.map(row=>Number(row.round)||1))]);
 panel.innerHTML='<dl class="record-stats">'+summary.map(([name,value])=>'<div><dt>'+name+'</dt><dd>'+value+'</dd></div>').join('')+
  '</dl><p class="record-note">Up to 30 completed matches on this browser.</p><div class="record-scroll"><table class="record-table">'+
  '<thead><tr><th>Match</th><th>Result</th><th>K / D</th><th>Accuracy</th><th>Time</th></tr></thead><tbody>'+
  rows.map(row=>'<tr><td><strong>'+esc(row.map)+'</strong><small>'+esc(row.mode)+' · '+esc(typeof row.connection==='string'?row.connection:'Local')+
   '</small><time>'+combatDate.format(row.at)+'</time></td><td>'+esc(row.result)+(row.mode==='Zombies'?' · Round '+(Number(row.round)||1):'')+
   '</td><td>'+row.kills+' / '+row.deaths+'</td><td>'+accuracy(row.hits,row.shots)+'</td><td>'+clock(row.duration)+'</td></tr>').join('')+
  '</tbody></table></div>';
}
$('#record-tabs').onclick=event=>{
 const button=event.target.closest('[data-record-filter]');
 if(button)renderCombatRecord(button.dataset.recordFilter);
};

/* The active life keeps its equipment until the player respawns. */
const nextLifeModes=new Set(['Private','Slayer','Time Attack','Team Deathmatch','Capture the Flag','Kill Confirmed','Hardpoint','Domination']);
let nextLifeSlot=null,activeLifeSlot=null;
function lifeLoadoutAllowed(){return run&&!over&&!practiceSession&&nextLifeModes.has(mode)}
function savedLifeLoadout(index){
 const loadout=index===LSL.cur?(menuLoadoutSnapshot||L):LSL.slots[index]?.L;
 if(!loadout||!PRI.includes(loadout.p)||!Array.isArray(loadout.pa)||
    !Array.isArray(loadout.sa)||!Array.isArray(loadout.pk))return null;
 return loadout;
}
function renderNextLifeLoadouts(){
 const panel=$('#next-loadout'),choices=$('#next-loadout-list');
 panel.hidden=!lifeLoadoutAllowed();
 if(panel.hidden)return;
 const active=activeLifeSlot??LSL.cur,selected=nextLifeSlot??active;
 choices.replaceChildren();
 for(let index=0;index<6;index++){
  const slot=savedLifeLoadout(index);
  if(!slot)continue;
  const button=document.createElement('button'),weapon=document.createElement('span');
  button.type='button';button.className='btn alt';
  button.textContent='Loadout '+(index+1);
  weapon.textContent=W[slot.p].n+(slot.s&&hasOwn(W,slot.s)?' / '+W[slot.s].n:'');
  button.append(weapon);
  button.setAttribute('aria-pressed',String(index===selected));
  if(index===active)button.dataset.active='true';
  button.onclick=()=>{
   if(!lifeLoadoutAllowed())return;
   nextLifeSlot=index===active?null:index;
   renderNextLifeLoadouts();choices.querySelector('[aria-pressed=true]')?.focus();
  };
  choices.append(button);
 }
 $('#next-loadout-status').textContent=nextLifeSlot===null?'Your current loadout is marked Active.':
  'Loadout '+(nextLifeSlot+1)+' will equip when you respawn.';
}
function applyNextLifeLoadout(){
 if(nextLifeSlot===null||!lifeLoadoutAllowed())return;
 const index=nextLifeSlot,slot=savedLifeLoadout(index);
 nextLifeSlot=null;
 if(!slot)return;
 menuLoadoutSnapshot||=L;
 L=JSON.parse(JSON.stringify(slot));
 if(L.s&&!hasOwn(W,L.s))L.s=null;
 sanitize();sanitizeMe();
 activeLifeSlot=index;
 delete P.os;
 P.msh=50+(PK('Overshield')?50:0);
 equipLifeWeapons();eqRefill();
 if($('#pause').style.display==='block')renderNextLifeLoadouts();
 msg('Loadout '+(index+1)+' equipped',1.5);
}
function resetLifeLoadouts(){
 if(menuLoadoutSnapshot){L=menuLoadoutSnapshot;menuLoadoutSnapshot=null}
 nextLifeSlot=activeLifeSlot=null;
 $('#next-loadout').open=false;
}

/* The host only forwards a mark to eligible squadmates. */
let markGeometry=null,lastLocalMark=0;
const markColors=['#ffcf64','#76e7ed'];
const squadMarksAllowed=()=>mode==='Zombies'||teamMode();
function validSquadMark(point){
 if(!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite)||point[1]<-8||point[1]>80)return false;
 const [x,,z]=point;
 return Math.abs(x)<=H+1&&Math.abs(z)<=H+1||mode==='Zombies'&&!!zq?.main?.fight&&zQuestInArena(x,z);
}
function showSquadMark(point,sender){
 const shared=!!sender;
 const mesh=new THREE.Mesh(markGeometry||=new THREE.OctahedronGeometry(.3),
  new THREE.MeshBasicMaterial({color:markColors[Number(shared)],depthTest:false,transparent:true,opacity:.92}));
 mesh.scale.y=1.45;mesh.renderOrder=3;mesh.position.fromArray(point);mesh.position.y+=.55;
 const previous=ST.pings.findIndex(mark=>mark.sender===sender);
 if(previous>=0)removeSquadMark(previous);
 if(ST.pings.length>=5)removeSquadMark(0);
 ST.pings.push({m:mesh,y:mesh.position.y,t:8,sender,color:markColors[Number(shared)]});S.add(mesh);
 msg(shared?(names[sender]||'Squadmate')+' marked a location':'Location marked',1.4);
 beep(shared?700:900,.1,'sine',.045);
}
function removeSquadMark(index){
 const [mark]=ST.pings.splice(index,1);
 if(mark){S.remove(mark.m);mark.m.material.dispose()}
}
function clearSquadMarks(){
 for(let i=ST.pings.length-1;i>=0;i--)removeSquadMark(i);
 lastLocalMark=0;
}
function placeSquadMark(){
 const now=performance.now();
 if(!run||P.dead||over||now-lastLocalMark<550)return;
 lastLocalMark=now;
 const eye=C.position.clone(),direction=aimDir(),distance=castW(eye,direction,120);
 const marker=eye.addScaledVector(direction,distance>=120?35:distance);
 let point=marker.toArray().map(value=>+value.toFixed(2));
 if(!validSquadMark(point)){
  marker.set(cl(marker.x,-H,H),cl(marker.y,-8,80),cl(marker.z,-H,H));
  point=marker.toArray().map(value=>+value.toFixed(2));
 }
 showSquadMark(point,'');
 if(netOn&&squadMarksAllowed()){
  if(isHost)shareSquadMark(point,myId);
  else netSend({t:'mark',point});
 }
}
function shareSquadMark(point,sender,link){
 if(!run||!netOn||!isHost||!squadMarksAllowed()||!hasOwn(names,sender)||!validSquadMark(point))return;
 const team=mpTeams[sender],recipient=id=>mode==='Zombies'||(team==='A'||team==='B')&&mpTeams[id]===team;
 if(link){
  const now=performance.now(),position=link.vt?.last;
  if(now<(link.markAfter||0)||position&&Math.hypot(point[0]-position.x,point[2]-position.z)>124)return;
  link.markAfter=now+760;
 }
 const packet=gamePacket({t:'mark',id:sender,point});
 if(!packet)return;
 for(const peer of conns)if(peer.open&&peer.vf&&!peer.blocked&&peer.peer!==sender&&recipient(peer.peer))sendPeerPacket(peer,packet);
 if(sender!==myId&&recipient(myId))showSquadMark(point,sender);
}
function receiveSquadMark(packet){
 if(!run||over||!squadMarksAllowed()||!hasOwn(names,packet.id)||
    mode!=='Zombies'&&mpTeams[packet.id]!==myTeam||!validSquadMark(packet.point))return;
 showSquadMark(packet.point,packet.id);
}

/* ---------- Jovian Terminus ---------- */
const JUPITER_FIELD_TIME=15;
const JUPITER_FIELD_RECHARGE=60;
const jupiterTouchControl=tc.querySelector('[data-b="field"]');
const JUPITER_CELL=5.5;
const jupiterRooms={
 A:{id:0,name:'Freight Intake',wall:0x536172,deck:0x333f48,light:0x8cdcff,roof:6.2},
 H:{id:1,name:'Hydroponics',wall:0x476661,deck:0x304b46,light:0xa4ffb4,roof:5.6},
 C:{id:2,name:'Cargo Handling',wall:0x6c5845,deck:0x4a3b33,light:0xffb86e,roof:7.1},
 R:{id:3,name:'Storm Chamber',wall:0x58505c,deck:0x423746,light:0xff886f,roof:10.4},
 T:{id:4,name:'Turbine Gallery',wall:0x60554a,deck:0x443b34,light:0xffa257,roof:5.4},
 M:{id:5,name:'Service Spine',wall:0x585c74,deck:0x3c3e50,light:0xaac0ff,roof:4.3},
 O:{id:6,name:'Observation',wall:0x637683,deck:0x3b545d,light:0x91f0ff,roof:7.4},
 Q:{id:7,name:'Quarantine',wall:0x514e68,deck:0x38354b,light:0xd9b8ff,roof:5.5}
};
// Each row specifies contiguous compartments by column. Unlisted cells are outside the pressure hull.
const jupiterBands=[
 [[4,8,'O']],[[3,9,'O']],[[1,3,'M'],[4,8,'O'],[9,11,'Q']],[[1,3,'M'],[4,6,'O'],[7,11,'Q']],
 [[0,3,'M'],[4,8,'R'],[9,11,'Q']],[[0,2,'M'],[3,9,'R'],[10,12,'Q']],[[0,2,'H'],[3,8,'R'],[9,12,'Q']],
 [[0,2,'H'],[3,9,'R'],[10,12,'T']],[[0,3,'H'],[4,8,'R'],[9,12,'T']],[[1,4,'H'],[5,7,'R'],[8,11,'T']],
 [[1,3,'H'],[4,7,'A'],[8,11,'C']],[[1,3,'H'],[4,7,'A'],[8,11,'C']],
 [[1,8,'A'],[9,11,'C']],[[1,11,'A']],[[2,10,'A']]
];
const jupiterCells=jupiterBands.flatMap((bands,row)=>bands.flatMap(([from,to,room])=>
 Array.from({length:to-from+1},(_,i)=>({row,col:from+i,room,x:(from+i-6)*JUPITER_CELL,z:(row-7)*JUPITER_CELL}))));
const jupiterCellById=new Map(jupiterCells.map(cell=>[cell.row*16+cell.col,cell]));
const jupiterCell=(row,col)=>col>=0&&col<13?jupiterCellById.get(row*16+col):undefined;
const jupiterAt=(x,z)=>jupiterCell(Math.floor(z/JUPITER_CELL+7.5),Math.floor(x/JUPITER_CELL+6.5));

function jupiterFloor(x,z){
 const fade=cl((19.25-z)/16.5,0,1);
 return (2.45*cl((-x-13.75)/16.5,0,1)-2.15*cl((x-13.75)/16.5,0,1))*fade;
}
function jupiterFloorRay(o,d,max){
 if(Math.min(o.y,o.y+d.y*max)>2.45)return max;
 let prev=0;
 if(o.y<=jupiterFloor(o.x,o.z))return d.y<0?0:max;
 for(let next=Math.min(1.2,max);next>prev;next=Math.min(max,next+1.2)){
  if(o.y+d.y*next<=jupiterFloor(o.x+d.x*next,o.z+d.z*next)){
   let lo=prev,hi=next;
   for(let i=0;i<8;i++){
    const t=(lo+hi)/2;
    if(o.y+d.y*t>jupiterFloor(o.x+d.x*t,o.z+d.z*t))lo=t;else hi=t;
   }
   return hi;
  }
  prev=next;
 }
 return max;
}
const jupiterDoorRoutes=[
 [11,4,0,-1,750],[11,7,0,1,750],
 [8,3,0,1,1100],[10,10,-1,0,1000],[8,9,0,-1,1150],
 [7,10,-1,0,1250],[6,1,-1,0,1000],[5,2,0,1,850],
 [2,3,0,1,1250],[4,6,-1,0,1500],[5,9,0,1,1250],[3,7,0,-1,1250],
 [10,6,-1,0,2500]
];
const jupiterAirlocks=jupiterDoorRoutes.map(([row,col,dz,dx,c])=>{
 const from=jupiterCell(row,col),to=jupiterCell(row+dz,col+dx);
 return {x:from.x+dx*JUPITER_CELL/2,z:from.z+dz*JUPITER_CELL/2,w:dx?.56:3.85,d:dz?.56:3.85,
  a:jupiterRooms[from.room].id,b:jupiterRooms[to.room].id,n:jupiterRooms[to.room].name+' Airlock',c,s:'airlock',
  approach:[from.x,from.z],colour:jupiterRooms[to.room].light};
});
const jupiterCover=[
 // Central chamber shell and its offset service stations.
 ['R',0,-4.8,6.3,7.4,6.4,'core'],['R',-8.4,3.2,2.7,3.8,1.35,'console'],['R',8.8,-11,2.8,4.4,1.45,'console'],
 ['A',-20.5,34.7,3.4,2.2,1.42,'crate'],['A',21,34.2,2.6,2.2,1.24,'crate'],['A',-.7,22.7,3.2,1.7,1.25,'console'],
 ['H',-27.5,13.1,3,8,1.3,'grow'],['H',-23,2.8,3.2,5.8,1.42,'grow'],
 ['C',18,24.5,5,2.9,2.4,'crate'],['C',17,16.5,2.8,3.4,1.63,'crate'],
 ['T',29,7.3,4.1,4.7,2.8,'turbine'],['T',20.5,10,2.7,1.9,1.1,'console'],
 ['M',-27.5,-18,3.3,3.2,1.65,'pipe'],['M',-17,-24,2.2,2.6,1.25,'console'],
 ['O',-2,-30,6.2,2.6,1.04,'scope'],['O',11,-30.8,2.1,2.5,1.32,'console'],
 ['Q',25,-14.4,4.5,4.3,1.5,'pod'],['Q',18.1,-28.5,3.3,2.1,1.3,'pod']
];
const jupiterWalls=[];
for(const cell of jupiterCells){
 for(const [dz,dx] of [[-1,0],[0,-1],[1,0],[0,1]]){
  const next=jupiterCell(cell.row+dz,cell.col+dx);
  if(next&&(next.room===cell.room||dz<0||dx<0))continue;
  const x=cell.x+dx*JUPITER_CELL/2,z=cell.z+dz*JUPITER_CELL/2;
  const door=jupiterAirlocks.find(d=>d.x===x&&d.z===z);
  const window=!next&&((cell.room==='O'&&dz===-1)||(cell.room==='A'&&dz===1&&Math.abs(x)<16)||
   (cell.room==='T'&&dx===1)||(cell.room==='H'&&dx===-1&&cell.row%2===0));
  jupiterWalls.push({cell,next,x,z,dx,dz,door,window});
 }
}
function jupiterSpawn(big){
 const all=MAPS[JUPITER_MAP].zs.filter(spot=>zq.open[spot[2]]),players=zPlayers();
 const distant=all.filter(([x,z])=>players.every(p=>Math.hypot(x-p.x,z-p.z)>12));
 const candidates=distant.length?distant:all;
 const [x,z,id]=candidates[Math.floor(Math.random()*candidates.length)];
 for(let i=0;i<5;i++){
  const dx=(Math.random()-.5)*2.2,dz=(Math.random()-.5)*2.2,px=x+dx,pz=z+dz;
  const room=jupiterRooms[jupiterAt(px,pz)?.room],[nx,nz]=navCell(px,pz);
  if(room?.id===id&&!NAV.g[nz*NAV.n+nx])return mkZombie(px,pz,big);
 }
 const [px,pz]=zFreeSpot(x,z);
 return mkZombie(px,pz,big);
}
function jupiterGroundGeometry(){
 const pos=[],uv=[],colors=[],indices=[];
 const add=(x0,z0,x1,z1,color)=>{
  const i=pos.length/3;
  for(const [x,z] of [[x0,z0],[x1,z0],[x1,z1],[x0,z1]]){
   pos.push(x,jupiterFloor(x,z),z);uv.push(x/88+.5,z/88+.5);colors.push(color.r,color.g,color.b);
  }
  indices.push(i,i+2,i+1,i,i+3,i+2);
 };
 for(const {x,z,room,row,col} of jupiterCells){
  const color=new THREE.Color(jupiterRooms[room].deck).lerp(new THREE.Color(0xb4bbc4),.32+.03*((row+col*2)%3));
  for(const dx of [-2.75,0])for(const dz of [-2.75,0])add(x+dx,z+dz,x+dx+2.75,z+dz+2.75,color);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);
 geometry.computeVertexNormals();return geometry;
}
MAPS[JUPITER_MAP]={
 d:'Zombies map: A research station above Jupiter’s storms.',
 zm:1,noHounds:true,nf:0,day:true,H:44,open:1,ps:[2.7,36],starter:'AN',skySeed:11714,
 sky:0x9b5d4a,gr:0xaab7c4,bc:0x4d5863,gt:'metal',fogN:42,fogF:133,
 groundSpan:88,groundVertexColors:true,hemi:1.04,hemiC:0xc8d9ee,hemiG:0x716068,sunI:.72,sunC:0xffcc9a,
 navGround:true,inside:(x,z)=>Boolean(jupiterAt(x,z)),groundHeight:jupiterFloor,
 groundGeometry:jupiterGroundGeometry,groundRay:jupiterFloorRay,
 spawn:jupiterSpawn,
 zs:[
  [-21,33,0],[-8,29,0],[13,29,0],[21,37,0],[0,18,0],[-9,23,0],
  [-31,7,1],[-22,-1,1],[-14,10,1],[-23,24,1],
  [15,19,2],[25,20,2],[21,27,2],
  [-12,-13,3],[11,-16,3],[-9,6,3],[7,9,3],[12,-3,3],
  [24,3,4],[15.5,10,4],[26.5,11.2,4],
  [-30,-13,5],[-22,-30,5],[-30,-22,5],
  [0,-37,6],[-8,-31,6],[6.8,-33,6],
  [27,-9,7],[21,-19,7],[11,-21,7],[25,-27,7]
 ],dr:jupiterAirlocks,
 mc:[
  {t:'rev',x:-5.5,z:40.1,f:'n'},{t:'ammo',x:7.6,z:40.1,f:'n'},
  {t:'wall',k:'AN',x:0,z:40.91,f:'n',y:2.09},
  {t:'box',x:-18.6,z:38.3,f:'n',rect:true,startBox:true},{t:'box',x:18,z:38.3,f:'n',rect:true,startBox:true},
  {t:'wall',k:'SG',x:-29,z:10.7,f:'e',y:1.06},{t:'keyring',x:-28.3,z:17.1,f:'s'},
  {t:'vit',x:25.7,z:24.9,f:'w'},{t:'wall',k:'OH',x:20.56,z:24.6,f:'e',y:1.65},
  {t:'spd',x:-14.7,z:-16.5,f:'e'},{t:'ammo',x:5.9,z:7.7,f:'n'},
  {t:'dbl',x:27.4,z:-.1,f:'s'},{t:'box',x:23.2,z:5.6,f:'s',rect:true},
  {t:'wall',k:'TUR',x:-30.25,z:-18.1,f:'w',y:1.2},{t:'box',x:-30,z:-26.2,f:'e',rect:true},
  {t:'pap',x:-6.9,z:-36.1,f:'s'},{t:'mule',x:9.0,z:-36.6,f:'s'},
  {t:'box',x:18.6,z:-25.7,f:'s',rect:true},{t:'box',x:6.8,z:-28.1,f:'s',rect:true}
 ],
 b(){
  const solid=[];
  for(const [id,x,z,w,d,h] of jupiterCover){
   const y=jupiterFloor(x,z);solid.push([x,z,w,d,y+h,y-.12,jupiterRooms[id].wall,'invisible']);
  }
  for(const {x,z,dx,dz,door,cell,next} of jupiterWalls){
   const y=jupiterFloor(x,z),height=Math.max(jupiterRooms[cell.room].roof,next?jupiterRooms[next.room].roof:0)+y+.4;
   const box=(along,width,top,bottom)=>solid.push([x+dz*along,z+dx*along,dx?.46:width,dz?.46:width,top,bottom,0,'invisible']);
   if(door){
    const wing=(JUPITER_CELL-3.85)/2;
    for(const side of [-1,1])box(side*(JUPITER_CELL-wing)/2,wing+.04,height,y-1);
    box(0,3.87,height,y+3.46);
   }else box(0,JUPITER_CELL+.10,height,y-1);
  }
  for(const {x,z,room} of jupiterCells){
   const y=jupiterFloor(x,z)+jupiterRooms[room].roof;
   for(const [sx,sz,w,d] of jovianRoofSections(x,z,JUPITER_CELL+.018))solid.push([sx,sz,w,d,y+.36,y,0,'invisible']);
  }
  return solid;
 },
 post:jupiterDeck,
 objs(){
  zq.jupiter={fields:new Map(),ready:new Map(),owners:new Set(),shots:[],companions:[],killCredit:new Map()};
  jupiterQuestStart();
  jupiterStartIntro();
 }
};
SKY_SUN[JUPITER_MAP]=[-.65,.32,-.69];

function jupiterSky(c,w,h,gradient,stars,glow,wrap,random){
 gradient([[0,'#080e1e'],[.22,'#20243d'],[.37,'#643e53'],[.48,'#d08b69'],
           [.54,'#ffc393'],[.63,'#a54639'],[.77,'#6f3646'],[1,'#241b35']]);
 stars(390,.75);
 const tau=2*Math.PI;
 const palette=['#e8b08a','#b9674e','#f6c7a3','#844751','#d29577','#ae5f51'];
 for(let i=0;i<100;i++){
  const center=h*(.452+i*.475/100),phase=random()*tau,thickness=2+random()*6;
  c.beginPath();
  for(let x=0;x<=w;x+=4){
   const a=x/w*tau;
   const y=center+8*Math.sin(a*2+phase)+4*Math.cos(a*7-phase)+2*Math.sin(a*17+phase);
   if(x===0)c.moveTo(x,y);else c.lineTo(x,y);
  }
  c.lineWidth=thickness;c.strokeStyle=palette[i%palette.length];c.globalAlpha=.14+random()*.28;c.stroke();
 }
 c.globalAlpha=1;
 const stormX=w*.765,stormY=h*.555;
 wrap(stormX,150,x=>{
  c.save();c.translate(x,stormY);c.rotate(-.055);c.scale(1,.32);
  const eye=c.createRadialGradient(-19,0,8,0,0,104);
  eye.addColorStop(0,'#e6a67a');eye.addColorStop(.37,'#ac4c37');eye.addColorStop(.65,'#c75e43');
  eye.addColorStop(.84,'#e7a680');eye.addColorStop(1,'rgba(226,137,96,0)');
  c.fillStyle=eye;c.fillRect(-106,-106,212,212);
  for(let i=0;i<6;i++){
   c.beginPath();c.ellipse(0,0,23+i*11,17+i*10,i*.12,.35+i*.27,5.2+i*.18);
   c.lineWidth=2.8;c.strokeStyle=i%2?'rgba(254,205,164,.27)':'rgba(120,44,45,.24)';c.stroke();
  }
  c.restore();
 });
 glow(w*.12,h*.324,92,[[0,'#fff6df'],[.022,'#fff6df'],[.085,'rgba(255,202,147,.42)'],[1,'rgba(255,154,111,0)']]);
 c.save();c.translate(w*.72,h*.276);
 const moon=c.createLinearGradient(-17,-9,17,17);
 moon.addColorStop(0,'#fee8b6');moon.addColorStop(.55,'#bc946b');moon.addColorStop(1,'#332d40');
 c.fillStyle=moon;c.beginPath();c.arc(0,0,17,0,tau);c.fill();c.clip();
 for(let i=0;i<21;i++){
  c.fillStyle=i%2?'rgba(99,62,40,.21)':'rgba(255,218,177,.23)';
  c.beginPath();c.ellipse((random()-.5)*30,(random()-.5)*30,2+random()*5,1+random()*2,.45,0,tau);c.fill();
 }
 c.restore();
}

function jupiterDeck(g){
 EST.sd=281;EST.dyn=[];EST.spots=[];EST.fog=[];EST.ptm=null;
 EST.mapG=g;EST.tm=0;EST.amb=1;EST.lt={next:60,flash:0,rep:0};
 EST.pool=Array.from({length:5},()=>{const L=new THREE.PointLight(0xffffff,0,15,1.65);g.add(L);return {L,s:null}});
 const dark=eM(0x25303b,0,.57,.58),steel=eM(0x75808c,0,.45,.62);
 const black=eM(0x121b25,0,.68,.46),copper=eM(0xb2794f,0,.56,.53);
 const glass=new THREE.MeshBasicMaterial({color:0x8cd7eb,transparent:true,opacity:.095,side:THREE.DoubleSide,depthWrite:false});
 const tint={},signal={},rooms={};
 for(const [id,room] of Object.entries(jupiterRooms)){
  tint[id]=eM(room.wall,0,.62,.34);signal[id]=eBasic(room.light,1);
  rooms[id]=new THREE.Group();g.add(rooms[id]);
 }
 const roof=new THREE.Group();roof.userData.jupiterCeiling=true;g.add(roof);
 const block=(root,mat,x,y,z,w,h,d,rz=0)=>eMk(root,EG.box,mat,x,y,z,w,h,d,0,0,rz);
 const pipe=(root,mat,x,y,z,r,h,axis=0)=>eMk(root,EG.cyl,mat,x,y,z,r,h,r,axis);
 const sign=(root,text,color,x,y,z,rotation=0,width=3.65)=>{
  const plaque=eMk(root,EG.pl,eSign(text,color,600,112),x,y,z,width,.68,1,0,rotation);
  plaque.castShadow=false;plaque.userData.mapResources=[plaque.material.map];return plaque;
 };
 const line=(root,mat,x,z,length,wide=.09,axis=false,y=.017)=>{
  const w=axis?length:wide,d=axis?wide:length;
  const mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat);
  const points=[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]];
  mesh.geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flatMap(([x,z])=>[x,jupiterFloor(x,z)+y,z]),3));
  mesh.geometry.setIndex([0,2,1,0,3,2]);mesh.geometry.computeVertexNormals();root.add(mesh);
 };
 for(const cell of jupiterCells){
  const {x,z,room,row,col}=cell,y=jupiterFloor(x,z)+jupiterRooms[room].roof;
  const sections=jovianRoofSections(x,z,JUPITER_CELL+.015);
  for(const [sx,sz,w,d] of sections)block(roof,dark,sx,y+.17,sz,w,.34,d);
  if((row+col)%2===0&&sections.length===1&&sections[0][2]>5.4&&sections[0][3]>5.4){
   const root=rooms[room];
   block(root,black,x,y-.12,z,4.5,.24,.39);
   block(root,signal[room],x,y-.253,z,3.85,.055,.13).castShadow=false;
   for(const side of [-1,1])block(root,steel,x+side*2.16,y-.22,z,.21,.23,.51);
  }
  if((col+row*2)%3!==0)line(rooms[room],tint[room],x-2.13,z,4.98,.18);
 }
 for(const {x,z,dx,dz,window,door,cell,next} of jupiterWalls){
  const root=rooms[cell.room],panel=new THREE.Group(),y=jupiterFloor(x,z);
  const h=Math.max(jupiterRooms[cell.room].roof,next?jupiterRooms[next.room].roof:0);
  panel.position.set(x,y,z);panel.rotation.y=dx?Math.PI/2:0;root.add(panel);
  const width=JUPITER_CELL+.045;
  const stripeId=next?.room||cell.room;
  const beam=(mat,lx,ly,w,ey,d=.56)=>block(panel,mat,lx,ly,0,w,ey,d);
  beam(black,0,-.32,width,.9,.6);
  if(door){
   for(const side of [-1,1]){
    beam(dark,side*2.37,h/2,.87,h,.75);
    beam(steel,side*1.99,2.05,.20,4.09,.82);
    beam(signal[stripeId],side*2.02,2.02,.05,1.1,.851).castShadow=false;
   }
   beam(dark,0,(h+3.46)/2,3.95,h-3.46,.66);
   beam(signal[stripeId],0,3.84,3.45,.075,.76).castShadow=false;
   const inside=door.approach;
   const forward=dx?Math.sign(inside[0]-x):Math.sign(inside[1]-z);
   sign(panel,jupiterRooms[Object.keys(jupiterRooms).find(id=>jupiterRooms[id].id===door.b)].name,door.colour,0,4.63,forward*.43,forward>0?0:Math.PI,3.45);
   if(!dx)line(root,signal[stripeId],x,z+.61,3.42,.055,true);
   else line(root,signal[stripeId],x+.61,z,3.42,.055);
   continue;
  }
  if(window){
   beam(dark,0,.54,width,1.1,.66);
   beam(tint[cell.room],0,h-.73,width,1.46,.75);
   for(const side of [-1,1])beam(steel,side*2.6,(h-.25)/2,.31,h+.3,.70);
   const pane=new THREE.Mesh(new THREE.PlaneGeometry(5.05,h-2.56),glass);
   pane.position.y=(h-.36)/2;panel.add(pane);pane.userData.mapResources=[];
   beam(signal[cell.room],0,1.06,width-.41,.055,.735).castShadow=false;
   beam(steel,0,1.38,width-.25,.07,.73);
  }else{
   beam(tint[cell.room],0,h/2,width,h);
   beam(dark,0,.5,width,.73,.66);
   beam(steel,0,h-1.07,width,.23,.68);
   for(const side of [-1,1]){
    const separator=block(panel,dark,side*2.18,h*.49,0,.16,h*.92,.71);
    separator.rotation.z=side*.06;
   }
   if((cell.row+cell.col)%2===0)beam(signal[cell.room],.05,2.36,2.3,.06,.70).castShadow=false;
   if((cell.row+cell.col)%3===0)for(let i=0;i<7;i++)beam(black,-1.14+i*.38,.57,.083,.34,.687);
  }
 }
 for(const [id,x,z,w,d,h,type] of jupiterCover){
  if(type==='core')continue;
  const root=rooms[id],y=jupiterFloor(x,z),lit=signal[id];
  block(root,black,x,y+h*.36,z,w,h*.72,d);
  block(root,tint[id],x,y+h*.76,z,w*.94,h*.46,d*.94);
  if(type==='grow'){
   for(const dz of [-d*.3,0,d*.3]){
    block(root,steel,x,y+h*.93,z+dz,w*.87,.16,d*.22);
    for(const dx of [-.78,-.30,.28,.78]){
     const leaf=new THREE.Group();leaf.position.set(x+dx,y+h,z+dz);root.add(leaf);
     pipe(leaf,black,0,.13,0,.1,.26);
     for(let i=0;i<4;i++){
      const a=i*1.7+dz;
      eMk(leaf,EG.sph,eM(0x52926e,0x152a1e,.67,.1),.17*Math.cos(a),.27+i*.052,.15*Math.sin(a),.13,.36,.085,0,a,.54);
     }
    }
    block(root,lit,x,y+h*.79,z+dz,w*.99,.055,d*.23).castShadow=false;
   }
  }else if(type==='pod'){
   for(const dx of [-w*.24,w*.24]){
    pipe(root,steel,x+dx,y+h,z,.68,.34);
    pipe(root,eBasic(0xb69cff,.18),x+dx,y+h+.62,z,.61,1.14);
    pipe(root,dark,x+dx,y+h+1.22,z,.70,.18);
    const sample=jupiterKeyMesh(0xffb938,0x673e08);
    sample.scale.setScalar(.43);sample.position.set(x+dx,y+h+.62,z);root.add(sample);
   }
  }else if(type==='pipe'){
   for(const dx of [-.73,0,.73]){
    pipe(root,copper,x+dx,y+h,z,.28,d*.95,Math.PI/2);
    pipe(root,steel,x+dx,y+h,z+.88,.35,.13,Math.PI/2);
   }
  }else{
   for(const side of [-1,1]){
    block(root,dark,x+side*w*.42,y+h*.48,z,w*.13,h*.92,d+.12);
    block(root,lit,x+side*w*.29,y+h*.78,z+d*.503,w*.23,.055,.067).castShadow=false;
   }
   if(type==='console'||type==='scope'){
    block(root,steel,x,y+h,z,w*.93,.13,d*.92);
    for(const dx of [-w*.22,w*.22]){
     const screen=block(root,lit,x+dx,y+h+.19,z+.06,w*.32,.27,.045);
     screen.rotation.x=-.46;screen.castShadow=false;
    }
   }
   if(type==='crate')for(const dz of [-d*.43,d*.43])block(root,steel,x,y+h,z+dz,w+.09,.13,.21);
  }
 }
 // The chamber's contaminated gas is visible through a suspended, animated magnetic cage.
 const chamber=rooms.R,unit=new THREE.Group();unit.position.set(0,0,-4.8);chamber.add(unit);
 for(const y of [.48,5.35,6.25])pipe(unit,y===5.35?steel:dark,0,y,0,3.13,y===.48?.96:.68);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,x=2.76*Math.cos(a),z=3.1*Math.sin(a);
  block(unit,steel,x,3,z,.23,5.72,.23);
  block(unit,signal.R,x,3.82,z,.079,1.48,.081).castShadow=false;
 }
 const pressure=new THREE.Mesh(new THREE.SphereGeometry(2.05,36,22),new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:`varying vec3 q;void main(){q=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float time;varying vec3 q;
   void main(){vec3 p=normalize(q);float a=atan(p.z,p.x);float lat=p.y+.16*sin(a*2.+time*.39)+.11*sin(p.x*7.+p.y*5.-time*.55);
    float sw=sin(lat*18.+sin(a*4.+lat*9.)*.8+time*.7),rim=pow(1.-abs(p.z),2.);
    vec3 c=mix(vec3(.36,.09,.17),vec3(1.,.61,.27),.5+.5*sw);
    gl_FragColor=vec4(c+vec3(.32,.12,.05)*rim,1.);}`
 }));
 pressure.position.set(0,3.07,0);pressure.scale.y=.94;pressure.material.toneMapped=false;unit.add(pressure);
 const field=new THREE.Group();field.position.y=3.03;unit.add(field);
 for(const [r,x,y] of [[2.46,1.1,.12],[2.29,-.69,.68]]){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.046,8,68),signal.R);
  ring.rotation.set(x,y,0);field.add(ring);
 }
 EST.dyn.push({tick(dt,t){pressure.material.uniforms.time.value=t;field.rotation.y=t*.33;field.rotation.z=Math.sin(t*.55)*.21}});
 // Turbine vanes and the freight crane are encountered from different approaches.
 const fan=new THREE.Group(),fanY=jupiterFloor(29,7.3)+1.46;
 fan.position.set(29,fanY,4.88);rooms.T.add(fan);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(1.26,.095,10,38),steel);fan.add(rim);
 const blades=new THREE.Group();fan.add(blades);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  block(blades,i%2?steel:copper,.62*Math.sin(a),.62*Math.cos(a),.035,.28,1.21,.09,-a+.33);
 }
 EST.dyn.push({tick(dt,t){blades.rotation.z=t*2.1}});
 const crane=new THREE.Group(),craneY=jupiterFloor(19,22)+6.0;
 crane.position.set(19,craneY,22);rooms.C.add(crane);
 block(crane,steel,0,0,0,9.8,.48,.48);
 block(crane,dark,0,-.34,0,1.1,.51,1.35);
 block(crane,signal.C,0,-.62,.61,.68,.075,.10);
 const hook=new THREE.Group();crane.add(hook);
 block(hook,copper,0,-1.35,0,.082,1.84,.082);
 block(hook,steel,0,-2.27,0,.46,.24,.48);
 EST.dyn.push({tick(dt,t){hook.position.x=Math.sin(t*.45)*2.6}});
 // Freight intake overhead docking cradle. Its grab arms leave the floor clear for the chase.
 const intake=rooms.A,hoist=new THREE.Group();hoist.position.set(-11,4.76,25.7);intake.add(hoist);
 for(const x of [-2.9,2.9]){
  block(hoist,steel,x,.41,0,.26,.42,7.4);
  block(hoist,dark,x,.66,0,.69,.25,7.8);
  for(const z of [-2.85,2.85]){
   block(hoist,black,x,-.34,z,.76,1.63,.85,.32*Math.sign(z));
   block(hoist,signal.A,x,-.83,z+.23,.22,.11,.46).castShadow=false;
  }
 }
 pipe(hoist,steel,0,.26,0,.77,3.44,Math.PI/2);
 pipe(hoist,black,0,.26,2,.66,.82,Math.PI/2);
 for(const z of [-1.45,1.37])pipe(hoist,copper,0,.26,z,.84,.19,Math.PI/2);
 const freightRing=new THREE.Mesh(new THREE.TorusGeometry(1.3,.11,8,32),signal.C);
 freightRing.position.set(0,-.28,0);freightRing.rotation.x=Math.PI/2;freightRing.scale.set(1,1,1);hoist.add(freightRing);
 line(intake,signal.H,-8.3,29.4,7.65,.11,true);
 line(intake,signal.C,4.35,29.4,5.7,.11,true);
 line(intake,signal.H,-12.1,27.1,4.5,.11);
 line(intake,signal.C,7.19,26,6.8,.11);
 // Canopy manifolds illuminate Hydroponics and give the row a recognizable ceiling.
 for(const [x,z,span] of [[-27.5,13.1,7.9],[-23,2.8,5.72]]){
  const root=rooms.H,y=jupiterFloor(x,z)+3.12;
  block(root,black,x,y,z,3.11,.24,span);
  for(const side of [-1,1]){
   block(root,signal.H,x+side*1.09,y-.145,z,.073,.063,span-.34).castShadow=false;
   pipe(root,copper,x+side*1.39,y+.27,z,.093,span,Math.PI/2);
   block(root,steel,x+side*1.20,y+.8,z,.18,1.5,.23);
  }
 }
 for(const [x,z,length] of [[-30,-19,13],[-24,-16.5,6.2]]){
  const y=jupiterFloor(x,z)+2.85;
  for(const side of [-1,1]){
   pipe(rooms.M,side===1?copper:steel,x+side*.35,y,z,.19,length,Math.PI/2);
   for(const offset of [-length*.33,0,length*.33])pipe(rooms.M,black,x+side*.35,y,z+offset,.25,.13,Math.PI/2);
  }
 }
 // The observatory has a working instrument table and an upper set of window shutters.
 const scope=new THREE.Group();scope.position.set(-2,1.46,-30);rooms.O.add(scope);
 const readout=new THREE.Mesh(new THREE.SphereGeometry(.63,24,14),new THREE.MeshBasicMaterial({
  color:0x92eaff,wireframe:true,transparent:true,opacity:.61,depthWrite:false
 }));
 scope.add(readout);
 const orbit=new THREE.Mesh(new THREE.TorusGeometry(.94,.026,6,38),signal.O);
 orbit.rotation.set(1.28,0,.23);scope.add(orbit);
 for(const x of [-10.9,-5.5,0,5.5,10.9]){
  block(rooms.O,dark,x,5.22,-37.9,4.82,.38,.58);
  for(let i=0;i<5;i++){
   const shutter=block(rooms.O,i%2?dark:steel,x,5.32+i*.17,-38.26,4.64,.08,.57);
   shutter.rotation.x=-.33;
  }
  block(rooms.O,signal.O,x,5.07,-37.6,4.16,.046,.096).castShadow=false;
 }
 EST.dyn.push({tick(dt,t){readout.rotation.y=t*.41;orbit.rotation.y=t*.29}});
 // Isolation markings and ducts frame the two routes through the pressure chamber.
 for(const [x,z,axis,length] of [[0,1.2,true,8.9],[0,-10.6,true,8.9],[-4.5,-4.7,false,11.1],[4.5,-4.7,false,11.1]]){
  line(rooms.R,signal.R,x,z,length,.065,axis,.029);
  if(axis){
   for(let i=0;i<9;i++)line(rooms.R,copper,x-3.8+i*.95,z+.20,.30,.18,true,.03);
  }
 }
 for(const side of [-1,1]){
  const y=9.15,z=-4.8+side*1.37;
  const duct=pipe(rooms.R,steel,0,y,z,.31,12.2,0);duct.rotation.z=Math.PI/2;
  pipe(rooms.R,dark,0,7.48,z,.46,2.55);
  block(rooms.R,signal.R,0,8.38,z,1.14,.071,.41).castShadow=false;
 }
 const lighting=[
  ['A',-15,30.5,3.6,1.5],['A',6,33,4.1,1.7],['A',1.7,23.5,3.8,1.3],
  ['H',-25,12,3.4,2.25],['H',-23,1,3.4,1.8],['C',19,22,4.4,2.3],
  ['R',-6,-5,3.4,1.8],['R',7,-4,4.1,2.3],['R',2,5,4.1,2.0],
  ['T',25,7,3.2,2.1],['M',-25,-22,3.1,2.05],['Q',20,-20,3.6,2.55],
  ['O',0,-32,4.6,2.4],['O',10,-27,5.2,1.8]
 ];
 for(const [id,x,z,y,power] of lighting)eSpot(x,jupiterFloor(x,z)+y,z,jupiterRooms[id].light,power,13,.22);
 for(const root of Object.values(rooms))eFlatten(root,.59,.35);
 eFlatten(roof,.68,.3);
}

let jupiterKeyGeometry;
function jupiterKeyMesh(color,emissive){
 if(!jupiterKeyGeometry){
  const shape=new THREE.Shape();
  for(let i=0;i<=24;i++){
   const a=(-55+290*i/24)*Math.PI/180,x=.41*Math.cos(a),y=.54+.41*Math.sin(a);
   if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);
  }
  for(const [x,y] of [[-.127,.18],[-.127,-.84],[0,-.96],[.23,-.91],[.23,-.77],[.07,-.77],
                       [.07,-.64],[.26,-.64],[.26,-.49],[.096,-.49],[.096,-.35],[.193,-.35],[.193,.16]])shape.lineTo(x,y);
  shape.closePath();
  const hole=new THREE.Path();
  hole.absarc(0,.54,.212,0,Math.PI*2,true);shape.holes.push(hole);
  jupiterKeyGeometry=new THREE.ExtrudeGeometry(shape,{depth:.125,bevelEnabled:true,bevelThickness:.032,bevelSize:.034,bevelSegments:1,curveSegments:16});
  jupiterKeyGeometry.translate(0,0,-.0625);
 }
 return new THREE.Mesh(jupiterKeyGeometry,eM(color,emissive,.34,.57));
}

function jupiterEnemyModel(big){
 const m=new THREE.Group(),key=jupiterKeyMesh(big?0xffa221:0xffda39,big?0x8a3203:0x513205);
 jupiterKeyFace(key,true);
 key.scale.setScalar(big?1.27:.96);
 key.position.y=1.24;
 m.userData.key=key;
 m.add(key);S.add(m);
 return {m,rig:null};
}

function jupiterMarkEnemy(b){
 b.isKey=true;b.y=jupiterFloor(b.x,b.z);b.m.position.y=b.y;b.nm=b.big?'Heavy Yellow Key':'Yellow Key';
 b.rise=b.riseD=.52;b.riseY=0;
}

function jupiterKeyHitPoints(b){
 const key=b.m.userData.key,s=key.scale.x;
 return [V(b.x,b.y+key.position.y+.47*s,b.z),V(b.x,b.y+key.position.y-.3*s,b.z),.43*s,.54*s];
}

function jupiterKeyShot(origin,dir,distance,flash=true){
 const state=zq?.jupiter;
 if(!state)return;
 let shot=state.shots.find(s=>!s.mesh.visible);
 if(!shot){
  if(state.shots.length>=96)return;
  const mesh=jupiterKeyMesh(0x9aeafa,0x2c92e5);
  const wake=new THREE.Mesh(keyBoltWake.geometry,keyBoltWake.material);
  wake.position.y=-1.16;mesh.add(wake);
  mesh.scale.setScalar(.285);mesh.frustumCulled=false;zG.add(mesh);
  shot={mesh,origin:V(),dir:V()};state.shots.push(shot);
 }
 shot.origin.copy(origin);shot.dir.copy(dir);shot.distance=Math.min(120,distance);shot.travel=0;
 shot.mesh.position.copy(origin);shot.mesh.visible=true;
 shot.mesh.quaternion.setFromUnitVectors(jupiterForward,dir);
 if(flash)burst(origin,6,0x75e8ff,5,.15,.055);
}
const jupiterForward=V(0,1,0);
const keyBoltWake={
 geometry:new THREE.ConeGeometry(.105,1.3,6).rotateZ(Math.PI),
 material:new THREE.MeshBasicMaterial({color:0x569dff,opacity:.27,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})
};


// Baker's evacuation route. Only the host advances the shared objectives.
const JP={SIGNAL:0,LOGS:1,PROTOTYPE:2,RELAYS:3,CORE:4,RETURN:5,CHAMBER:6,BOSS:7,ESCAPE:8,LAUNCH:9};
const jupiterCrewLogs=[
 ['hLog','IShowSpeed','Hydroponics',-23.7,13.8,'They came through the grow beds. The prototype fires a spread of our own keys. Get it out.'],
 ['mLog','Joe Bartolozzi','Service Spine',-26.1,-25.1,'Mateo put three stations on the launch circuit. The middle relay needs all three contacts hit together. Line up from the marked deck plate.'],
 ['oLog','KreekCraft','Observation',3,-34.7,'Dodge the floor discharges and shoot when the crown turns blue. Conventional weapons hit hardest during that opening.'],
 ['qLog','Mateo “O. Algo”','Quarantine',21.6,-22.4,'Core is iced down in quarantine. If the launch rail comes back online, Baker can still get the last pod out.']
];
const jupiterQuestRelays=[
 ['hRelay','Hydroponics',-21.7,8.5,'bolt'],['rRelay','Storm Chamber',-5.6,-1.8,'row'],['tRelay','Turbine Gallery',25.8,5.8,'bolt']
];
const jupiterQuestBossName='The King Key';
const jovianBossPhases=[
 {name:'Crown Pulse',delay:6.2,tell:1.55,radius:3.1,spread:0,open:2.7,damage:28,armor:.78},
 {name:'Crosscut',delay:5.55,tell:1.34,radius:2.45,spread:4.4,open:2.6,damage:32,armor:.7},
 {name:'Redline',delay:4.75,tell:1.17,radius:2.85,spread:4.8,open:2.25,damage:35,armor:.64}
];
const jovianBossPhase=hp=>hp>66?0:hp>33?1:2;
const JOVIAN_CAL_CYCLE=1.75;
const jupiterCalibration=[
 ['tuneA','Induction phase',-25.7,-28.2,.60,1.08],
 ['tuneB','Frequency lock',3.2,-27.9,1.00,1.37],
 ['tuneC','Field compression',-26.6,-9.9,.32,.63]
];
const jupiterKeyParts=[
 ['spine','Induction Spine','Hydroponics',-18.7,19.5],['matrix','Blue Key Matrix','Quarantine',24.6,-22.7]
];

function jupiterQuestStart(){
 const q=zq.jupiter.quest={stage:JP.SIGNAL,logs:0,parts:0,cal:-1,calTime:0,relay:0,carrier:'',boss:null,bossId:null,hp:100,
  spawnIn:0,attackIn:4,hazard:null,launch:0,repairer:'',wires:0,cut:null,cutSerial:0,nodes:Object.create(null),message:null,noticeId:0,funds:0};
 const root=new THREE.Group();
 zG.add(root);
 const arrow=new THREE.Shape();
 arrow.moveTo(-.19,-.15);arrow.lineTo(0,.18);arrow.lineTo(.19,-.15);arrow.lineTo(0,-.065);arrow.closePath();
 const trails=new THREE.InstancedMesh(new THREE.ShapeGeometry(arrow),zPuMat(0x69e8ff,.86),48);
 trails.instanceMatrix.setUsage(THREE.DynamicDrawUsage);trails.count=0;trails.frustumCulled=false;root.add(trails);
 q.route={mesh:trails,item:new THREE.Object3D(),point:V(),goal:null,points:[],next:0,key:''};
 const plate=eM(0x344659,0,.57,.63),black=eM(0x111923,0,.56,.51);
 const cold=eM(0x69e4ff,0x226787,.34,.46),hot=eM(0xffa459,0x672916,.42,.47);
 const box=(parent,color,w,h,d,x,y,z)=>{
  const mesh=new THREE.Mesh(bg,color);
  mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);
  return mesh;
 };
 function node(id,x,z,label,kind){
  const group=new THREE.Group(),y=jupiterFloor(x,z);
  group.position.set(x,y,z);root.add(group);
  // The world marker is a small, lit diamond mounted above the device.
  const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.15),cold);
  beacon.position.y=kind==='pod'?3.8:1.66;group.add(beacon);
  let feature;
  if(kind==='pod'){
   group.position.z+=1.74;
   zSolid(x,z+1.91,2.12,1.8,3.1);
   Object.assign(group.userData,jovianBuildPod(group,{hot,cold}));
   q.hatch=jovianBuildHatch(root,x,y,z+1.74);
   feature=group.userData.hatch;
  }else{
   box(group,black,kind==='rack'?1.34:.68,.14,.63,0,.12,0);
   box(group,plate,kind==='rack'?1.21:.47,.79,.41,0,.57,0);
   box(group,black,kind==='rack'?1.29:.81,.22,.52,0,1.03,0).rotation.x=-.24;
   feature=kind==='relay'||kind==='core'?new THREE.Mesh(new THREE.OctahedronGeometry(kind==='relay'?.36:.27),hot):box(group,hot,.54,.055,.23,0,1.16,-.01);
   if(!feature.parent){feature.position.y=1.28;group.add(feature)}
   if(kind==='part'){
    if(id==='spine'){
     const coil=new THREE.Mesh(new THREE.TorusGeometry(.17,.053,8,18),cold);
     coil.position.y=.24;feature.add(coil);
    }else{
     const sample=jupiterKeyMesh(0x51bdff,0x125d9e);sample.scale.setScalar(.23);sample.position.y=.28;
     feature.add(sample);
    }
   }
   if(kind==='rack'){
    const weapon=buildGun('KEY');weapon.rotation.y=Math.PI/2;
    weapon.scale.setScalar(.85);weapon.position.set(0,1.31,0);group.add(weapon);
    q.nodes[id+'Weapon']=weapon;
   }
  }
  q.nodes[id]={id,x,z,y,label,kind,group,beacon,feature,cold,hot};
  if(kind!=='relay')zi.push({x,z,r:kind==='pod'?2.9:2.05,txt:()=>jupiterQuestPrompt(q,id),cost:()=>0,act:()=>jupiterQuestRequest(id)});
 }
 node('signal',-3.1,35.5,'Distress terminal','console');
 jupiterCrewLogs.forEach(([id,speaker,,x,z])=>node(id,x,z,speaker+'’s crew log','console'));
 jupiterKeyParts.forEach(([id,name,,x,z])=>node(id,x,z,name,'part'));
 node('prototype',-20.7,-15.7,'Keyshooter workbench','rack');
 jupiterCalibration.forEach(([id,label,x,z])=>node(id,x,z,label,'console'));
 jupiterQuestRelays.forEach(([id,room,x,z])=>node(id,x,z,room+' relay','relay'));
 const relay=q.nodes.rRelay,standX=relay.x,standZ=relay.z+4.03;
 const pad=new THREE.Mesh(new THREE.RingGeometry(.48,.55,22),zPuMat(0x7fefff,.81));
 pad.rotation.x=-Math.PI/2;pad.position.set(standX,jupiterFloor(standX,standZ)+.063,standZ);root.add(pad);
 pad.visible=false;q.relayPad={mesh:pad,x:standX,y:jupiterFloor(standX,standZ),z:standZ,label:'Volley position'};
 relay.contacts=[-.414,0,.414].map((offset,i)=>{
  if(i===1)return relay.feature;
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.205),hot);
  crystal.position.set(offset,1.28,0);relay.group.add(crystal);return crystal;
 });
 relay.feature.scale.setScalar(.65);
 node('core',19.6,-19.1,'Flight core','core');
 node('return',23,8.8,'Launch grid socket','console');
 node('breaker',8.4,4.1,'Storm Chamber control','console');
 node('release',-4.2,24.6,'Yard pressure release','console');
 node('pod',3.5,36.36,'Escape pod','pod');
}

function jupiterQuestPrompt(q,id){
 const stage=q.stage;
 if(id==='signal'&&stage===JP.SIGNAL)return 'Answer Baker’s distress call';
 const part=jupiterKeyParts.findIndex(row=>row[0]===id);
 if(part>=0&&stage>=JP.LOGS&&stage<=JP.PROTOTYPE&&!(q.parts&(1<<part)))return 'Recover the '+q.nodes[id].label;
 const log=jupiterCrewLogs.findIndex(row=>row[0]===id);
 if(log>=0&&stage===JP.LOGS&&!(q.logs&(1<<log)))return 'Recover '+q.nodes[id].label;
 if(id==='prototype'&&stage>=JP.PROTOTYPE&&stage<JP.LAUNCH){
  const keyshooter=wp.find(w=>w.k==='KEY');
  if(stage===JP.PROTOTYPE){
   if(q.parts!==3)return 'Inspect the Keyshooter workbench';
   if(q.cal<0)return 'Install the parts and start calibration';
   return q.cal>=jupiterCalibration.length?'Assemble the Keyshooter':'';
  }
  if(!keyshooter)return 'Take the Keyshooter';
  if(keyshooter.mag+keyshooter.res<keyshooter.m)return 'Rearm the Keyshooter';
 }
 if(stage===JP.PROTOTYPE&&jupiterCalibration[q.cal]?.[0]===id)return 'Lock '+q.nodes[id].label;
 if(id==='core'&&stage===JP.CORE)return 'Recover the flight core';
 if(id==='return'&&stage===JP.RETURN&&q.carrier===zMe())return 'Socket the flight core';
 if(id==='breaker'&&stage===JP.CHAMBER)return 'Open the King Key’s chamber';
 if(id==='breaker'&&stage===JP.BOSS)return 'Refill conventional ammunition';
 if(id==='release'&&stage===JP.ESCAPE&&!q.released)return 'Equalize the launch yard';
 if(id==='pod'&&stage===JP.ESCAPE&&q.released){
  if(q.wires===JOVIAN_ALL_WIRES)return 'Board the escape pod';
  return q.repairer?'':'Repair the escape pod';
 }
 return '';
}

function jupiterQuestRequest(id){
 if(zCli())netSend({t:'zjp',a:'use',n:id});
 else jupiterQuestUse(id,zMe());
}

function jupiterQuestNotice(q,title,line,shot){
 if(shot)jovianCue(q,shot,title,line);
 q.message=[++q.noticeId,title,line];
 jupiterQuestCaption(q.message);
}

function jupiterQuestCaption(note){
 const h=$('#jupiter-quest'),title=h.querySelector('.jupiter-log strong'),text=h.querySelector('.jupiter-log span');
 title.textContent=note[1];text.textContent=note[2];
 h.dataset.logUntil=t0+8;
 for(let i=0;i<5;i++)flTone(230,221,.052,.09,.104*i,'triangle');
}

function jupiterQuestIssue(by,item){
 const state=zq.jupiter;
 if(item==='KEY')state.owners.add(by);
 if(by===zMe())jupiterQuestEquip(item);
 else netSend({t:'zjkit',to:by,k:item});
}

function jupiterQuestEquip(item){
 const owned=wp.find(w=>w.k===item);
 if(owned){
  owned.mag=owned.m;owned.res=owned.m*W[item].rs;
  return;
 }
 if(item==='AMMO'){for(const weapon of wp)if(weapon.k!=='KEY')weapon.res=Math.max(weapon.res,weapon.m*(weapon.rs??W[weapon.k]?.rs??4));return}
 zGive(item);
}

function jupiterQuestFunds(q,total){
 const earned=total-q.funds;
 if(earned<=0)return;
 q.funds=total;zq.pts+=earned;zGainFx(earned);
}

function jupiterQuestUse(id,by){
 const q=zq?.jupiter?.quest,node=q?.nodes[id],p=zPlayers().find(player=>player.id===by);
 if(!node||!p||!run||over||q.cut||q.repairer===by||Math.hypot(p.x-node.x,p.z-node.z)>(id==='pod'?3.25:2.55)||
    Math.abs(p.y-node.y)>1.8||!navLos(p.x,p.z,node.x,node.z))return;
 if(id==='signal'&&q.stage===JP.SIGNAL){
  q.stage=JP.LOGS;
  jupiterQuestNotice(q,'Commander Case D. Baker','The keys cut the launch grid. Pull the four crew logs. I’m pinned down outside the only working pod.','signal');
  jupiterQuestFunds(q,q.funds+800);
  return;
 }
 const log=jupiterCrewLogs.findIndex(row=>row[0]===id);
 if(log>=0&&q.stage===JP.LOGS&&!(q.logs&(1<<log))){
  q.logs|=1<<log;jupiterQuestFunds(q,q.funds+1000);
  if(q.logs===15)q.stage=JP.PROTOTYPE;
  jupiterQuestNotice(q,jupiterCrewLogs[log][1],jupiterCrewLogs[log][5]);
  return;
 }
 const part=jupiterKeyParts.findIndex(row=>row[0]===id);
 if(part>=0&&q.stage>=JP.LOGS&&q.stage<=JP.PROTOTYPE&&!(q.parts&(1<<part))){
  q.parts|=1<<part;
  jupiterQuestNotice(q,q.nodes[id].label+' recovered',q.parts===3?'Both components recovered. Take them to the Service Spine workbench for calibration.':'The second component is in '+jupiterKeyParts[1-part][2]+'.');
  return;
 }
 if(q.stage===JP.PROTOTYPE&&jupiterCalibration[q.cal]?.[0]===id){
  if(!jupiterCalibrationTuned(q,by===zMe()?0:.14)){
   if(t0>=(q.calFeedbackAt||0)){
    q.calFeedbackAt=t0+.8;
    jupiterQuestNotice(q,'Signal unstable','Use the console when the cursor enters the lit band.');
    jupiterQuestAdd(q,false);
   }
   return;
  }
  q.cal++;q.calTime=0;q.calFeedbackAt=0;
  jupiterQuestNotice(q,q.nodes[id].label+' locked',q.cal===jupiterCalibration.length?'Return to the workbench to finish assembling the Keyshooter.':'Move to the next console. The pulse is drawing in keys.');
  for(let i=0;i<6;i++)jupiterQuestAdd(q,i===5);
  return;
 }
 if(id==='prototype'&&q.stage>=JP.PROTOTYPE&&q.stage<JP.LAUNCH){
  if(q.stage===JP.PROTOTYPE){
   if(q.parts!==3){
    jupiterQuestNotice(q,'Keyshooter blueprint','Install the Induction Spine from Hydroponics and the Blue Key Matrix from Quarantine.');
    return;
   }
   if(q.cal<0){
    q.cal=0;q.calTime=0;
    jupiterQuestNotice(q,'Calibration started','Lock each console inside the cyan timing band. The parts are sending out a pulse.');
    for(let i=0;i<7;i++)jupiterQuestAdd(q,i===6);
    return;
   }
   if(q.cal<jupiterCalibration.length)return;
  }
  jupiterQuestIssue(by,'KEY');
  if(q.stage===JP.PROTOTYPE){
   q.stage=JP.RELAYS;
   q.message=null;
   jovianCue(q,'craft','','');
  }
  return;
 }
 if(id==='core'&&q.stage===JP.CORE){
  q.carrier=by;q.stage=JP.RETURN;
  for(const door of [4,5,10])zOpenDoor(door,null);
  jupiterQuestNotice(q,'Core temperature rising','Carry the core to the Turbine Gallery socket. The keys can hear it.','core');
  for(let i=0;i<6;i++)jupiterQuestAdd(q,false);
  return;
 }
 if(id==='return'&&q.stage===JP.RETURN&&q.carrier===by){
  q.carrier='';q.stage=JP.CHAMBER;
  for(const door of [1,3,12])zOpenDoor(door,null);
  jupiterQuestNotice(q,'Launch grid online','The King Key controls the yard. Prepare your weapons, then open the Storm Chamber.','return');
  return;
 }
 if(id==='breaker'&&q.stage===JP.CHAMBER){jupiterQuestBeginBoss(q);return}
 if(id==='breaker'&&q.stage===JP.BOSS){jupiterQuestIssue(by,'AMMO');return}
 if(id==='release'&&q.stage===JP.ESCAPE&&!q.released){
  q.released=true;
  jupiterQuestNotice(q,'Commander Case D. Baker','Yard pressure is stable. The escape pod has a severed harness. Reconnect its wires before boarding.');
  jupiterQuestAdd(q,true);jupiterQuestAdd(q,true);
  return;
 }
 if(id==='pod'&&q.stage===JP.ESCAPE&&q.released){
  if(q.wires!==JOVIAN_ALL_WIRES){if(!q.repairer)q.repairer=by;return}
  jovianStartLaunch(q);
 }
}

function jupiterVolleyHits(rays,target,radius,range){
 return rays.filter(({o,ray,wall})=>rs(o,ray,target,radius)<Math.min(wall,range));
}

function jupiterQuestVolley(origin,dir,rays){
 const q=zq?.jupiter?.quest;
 if(!q||q.cut)return;
 if(q.stage===JP.RELAYS){
  const relay=jupiterQuestRelays[q.relay],node=q.nodes[relay[0]];
  if(!jupiterRelayAccepts(relay,node,rays))return;
  if(zCli())netSend({t:'zjp',a:'relay',n:node.id,o:origin.toArray(),v:dir.toArray()});
  else jupiterQuestRelayOnline(q,node);
 }
}

function jupiterRelayAccepts(relay,node,rays){
 if(relay[4]!=='row')return jupiterVolleyHits(rays,V(node.x,node.y+1.28,node.z),.48,23).length>0;
 const contacts=node.contacts.map(c=>jupiterVolleyHits(rays,V(node.x+c.position.x,node.y+1.28,node.z),.231,11));
 return contacts[0].some(a=>contacts[1].some(b=>a!==b&&contacts[2].some(c=>c!==a&&c!==b)));
}

function jupiterQuestRelayOnline(q,node){
 q.relay++;
 burst(V(node.x,node.y+1.28,node.z),26,0x63dfff,5,.8,.13);
 flTone(370,920,.25,.16,0,'triangle');
 if(q.relay<jupiterQuestRelays.length){
  const next=jupiterQuestRelays[q.relay];
  jupiterQuestNotice(q,'Relay online',next[1]+' is next. '+(next[4]==='row'?'Hit all three contacts with one horizontal volley.':'Fire a key into its crystal.'));
 }else{
  q.stage=JP.CORE;
  jupiterQuestNotice(q,'Launch circuit repaired','Recover the flight core in Quarantine. The turbine socket will come online once it’s installed.');
 }
}

function jupiterQuestMarkBoss(b){
 if(b.jupiterBoss)return;
 b.jupiterBoss=true;b.nm=jupiterQuestBossName;
 const key=b.m.userData.key;
 b.jupiterCape=jovianDressKing(key);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.54,.033,8,30),zPuMat(0x61e4ff,.85));
 ring.position.y=1.04;ring.rotation.x=Math.PI/2;ring.visible=false;key.add(ring);
 b.jupiterCrown=ring;
}

function jupiterQuestBeginBoss(q){
 const [x,z]=zFreeSpot(7.6,-2.6),b=mkZombie(x,z,true);
 jupiterQuestMarkBoss(b);
 b.hp=b.mhp=110000*(1+.55*Math.max(0,zPlayers().length-1));b.dm=30;b.sp=2.42;
 q.boss=b;q.bossId=b.i;q.stage=JP.BOSS;q.spawnIn=2;q.attackIn=4.6;q.blueIn=5;q.blueSerial=0;
 q.expose=0;q.attackSerial=0;q.phase=0;
 q.damageBudget=new Map();
 jupiterQuestNotice(q,jupiterQuestBossName,'Jump or move clear of the rings. When his crown turns blue, hit him with conventional weapons.','king');
 for(let i=0;i<7;i++)jupiterQuestAdd(q,i===6);
}

function jupiterQuestBossDamage(b,damage,by,weapon){
 const q=zq.jupiter.quest;
 if(q.stage!==JP.BOSS||q.cut||!Number.isFinite(damage)||damage<=0)return;
 if(weapon==='KEY'){
  if(by===zMe()&&t0>(q.blockAt||0)){q.blockAt=t0+.65;beep(190,.086,'triangle',.055)}
  return;
 }
 const phase=jovianBossPhases[q.phase],exposed=q.expose>0;
 // Keep stacked burst damage bounded per player, with a higher ceiling during openings.
 const last=q.damageBudget.get(by);
 const reserve=last?Math.min(5400,last.reserve+(exposed?4200:2700)*Math.max(0,t0-last.time)):5400;
 const landed=Math.min(damage*(exposed?1.85:phase.armor),reserve);
 q.damageBudget.set(by,{reserve:reserve-landed,time:t0});
 if(landed<=0)return;
 b.hp=Math.max(0,b.hp-landed);b.lh=t0;q.hp=100*b.hp/b.mhp;
 juiceHit(b,Math.min(landed,390),false);
 if(by===zMe()){hits++;$('#hm').className='on';hmT=.12}
 if(b.hp>0){
  const next=jovianBossPhase(q.hp);
  if(next!==q.phase){
   q.phase=next;
   b.sp=2.42+next*.3;
   jupiterQuestNotice(q,jovianBossPhases[next].name,next===1?'The crown now fires a line of three pulses. Move off the line.':
    'The pulses come faster and sweep toward the crown. Keep moving.');
  }
  return;
 }
 b.al=0;b.atk=0;b.m.visible=false;q.boss=null;
 jupiterClearHazard(q);
 q.stage=JP.ESCAPE;q.spawnIn=.8;
 burst(V(b.x,b.y+2.2,b.z),62,0xffbc58,11,2,.22);
 shake=Math.max(shake,.65);flNoise(.58,1280,75,.42,'lowpass');
 jovianCue(q,'fallen',jupiterQuestBossName,'The crown has fallen. Equalize the Freight Intake yard and get to the pod.',b);
 for(let i=0;i<9;i++)jupiterQuestAdd(q,i%5===0,i<5?0:undefined);
}

function jupiterQuestAdd(q,big,priority){
 if(sdGameRuntime?.managedZombies())return;
 const players=zPlayers(),spawns=MAPS[JUPITER_MAP].zs;
 if(!players.length)return;
 const origin=players[0];
 const distance=([x,z])=>Math.hypot(x-origin.x,z-origin.z);
 const nearby=spawns.filter(spot=>zq.open[spot[2]]&&(priority===undefined?distance(spot)>6&&distance(spot)<24:spot[2]===priority)&&
  players.every(p=>Math.hypot(p.x-spot[0],p.z-spot[1])>4.3));
 const limit=q.stage===JP.BOSS?14:q.stage===JP.ESCAPE?28:24;
 if(bots.filter(b=>b.al&&b.isKey).length>=limit)return;
 const spot=nearby.length?nearby[Math.random()*nearby.length|0]:null;
 const b=spot?mkZombie(...zFreeSpot(spot[0]+(Math.random()-.5)*2,spot[1]+(Math.random()-.5)*2),big):jupiterSpawn(big);
 if(!b)return;
 b.sp=Math.max(b.sp,big?2.42:3.24);
 if(q.stage>=JP.BOSS){b.hp=b.mhp=big?650:245;b.dm=big?26:17}
}

function jupiterClearHazard(q){
 if(!q.hazard)return;
 for(const ring of q.hazard.rings){ring.parent?.remove(ring);ring.geometry.dispose();ring.material.dispose()}
 q.hazard=null;
}
function jupiterQuestHazard(q,dt){
 const hazard=q.hazard;
 if(!hazard)return;
 hazard.time-=dt;
 for(const ring of hazard.rings)ring.material.opacity=.58+.35*Math.sin((1-hazard.time/hazard.phase.tell)*Math.PI*.65);
 if(hazard.time>0)return;
 jupiterClearHazard(q);
 for(const [x,z] of hazard.spots)burst(V(x,jupiterFloor(x,z)+.25,z),23,0xffad59,7,.9,.15);
 if(zCli()||q.stage!==JP.BOSS)return;
 q.expose=Math.max(q.expose,hazard.phase.open);
 flTone(510,890,.24,.11,0,'triangle');
 for(const p of zPlayers()){
  if(jupiterProtected(p.id)||p.y-jupiterFloor(p.x,p.z)>.7||
     !hazard.spots.some(([x,z])=>Math.hypot(p.x-x,p.z-z)<hazard.phase.radius))continue;
  if(p.me)hurt(hazard.phase.damage,q.boss);
  else netSend({t:'hit',to:p.id,d:hazard.phase.damage,bot:q.bossId});
 }
}
function jupiterQuestMakeHazard(q,id,index,spots,time){
 if(q.hazard?.id===id)return;
 jupiterClearHazard(q);
 const phase=jovianBossPhases[index],rings=spots.map(([x,z])=>{
  const ring=new THREE.Mesh(new THREE.RingGeometry(phase.radius-.18,phase.radius,40),zPuMat(index===2?0xff4937:0xff882e,.72));
  ring.rotation.x=-Math.PI/2;ring.position.set(x,jupiterFloor(x,z)+.05,z);zG.add(ring);
  return ring;
 });
 q.hazard={id,index,phase,spots,rings,time};
 flTone(125,240+index*70,.39,.12,0,'sawtooth');
}
function jovianBossAttack(q){
 const players=zPlayers(),phase=jovianBossPhases[q.phase],key=q.boss;
 if(!players.length||!key||q.hazard)return;
 const target=players[q.attackSerial%players.length],spots=[[target.x,target.z]];
 if(phase.spread){
  const line=V(target.x-key.x,0,target.z-key.z);
  if(line.lengthSq()<.01)line.set(0,0,1);else line.normalize();
  const x=q.phase===1?-line.z:line.x,z=q.phase===1?line.x:line.z;
  for(const side of [-1,1]){
   const px=target.x+x*side*phase.spread,pz=target.z+z*side*phase.spread;
   if(jupiterAt(px,pz)&&navLos(target.x,target.z,px,pz))spots.push([px,pz]);
  }
 }
 jupiterQuestMakeHazard(q,++q.attackSerial,q.phase,spots,phase.tell);
}

function jupiterFinaleActive(){
 return (zq?.jupiter?.quest?.stage??0)>=JP.BOSS;
}

function jupiterQuestTick(dt){
 const q=zq.jupiter.quest;
 if(!q)return;
 if(!q.cut&&q.stage===JP.PROTOTYPE&&q.cal>=0&&q.cal<jupiterCalibration.length)q.calTime=(q.calTime+dt)%JOVIAN_CAL_CYCLE;
 jovianPresentationTick(q,dt);
 if(over)return;
 if(!zCli()&&!q.cut){
  if(q.stage===JP.RETURN&&!zPlayers().some(p=>p.id===q.carrier)){
   q.carrier='';q.stage=JP.CORE;
  }
  if(q.stage===JP.BOSS||q.stage===JP.ESCAPE){
   q.spawnIn-=dt;
   if(q.spawnIn<=0){
    q.spawnIn=q.stage===JP.ESCAPE?1.1:3.2;
    for(let i=0;i<(q.stage===JP.ESCAPE?3:1);i++)jupiterQuestAdd(q,Math.random()<.14,q.stage===JP.ESCAPE&&i<2?0:undefined);
   }
   q.attackIn-=dt;
   if(q.stage===JP.BOSS){
    q.expose=Math.max(0,q.expose-dt);
    q.blueIn-=dt;
    if(q.blueIn<=0){
     const king=q.boss,nearby=zPlayers().find(p=>Math.hypot(p.x-king.x,p.z-king.z)<19);
     if(nearby){
      q.blueIn=18;
      for(const side of [-1,1]){
       const [x,z]=zFreeSpot(king.x+side*2.1,king.z+1.45);
       jupiterEarnCompanion({i:90000+(q.blueSerial++%9000),x,z},nearby.id);
      }
     }else q.blueIn=1.5;
    }
   }
   if(q.stage===JP.BOSS&&q.attackIn<=0){
    q.attackIn=jovianBossPhases[q.phase].delay;
    if(!sdGameRuntime?.aiDisabled())jovianBossAttack(q);
   }
  }
 }
 jupiterQuestHazard(q,dt);
 jupiterQuestHud(q);
}

function jupiterLaunchCamera(){
 return xrS?null:jovianView();
}

function jupiterQuestApproach(target,px,pz){
 const n=NAV.n,g=NAV.g;
 const cell=(x,z)=>{const [i,j]=navCell(x,z);return j*n+i};
 const [sx,sz]=zFreeSpot(px,pz),from=NAV.comp[cell(sx,sz)];
 const [tx,tz]=zFreeSpot(target.x,target.z);
 const distance=Math.hypot(px-tx,pz-tz);
 if(NAV.comp[cell(tx,tz)]===from&&!g[cell(tx,tz)])return {...target,x:tx,z:tz,score:distance};
 const room=jupiterRooms[jupiterAt(tx,tz)?.room]?.id;
 if(room==null)return null;
 // Score both sides of each airlock by remaining doors to the destination.
 const costs=new Array(8).fill(Infinity),checked=new Set();
 costs[room]=0;
 for(let i=0;i<8;i++){
  const next=costs.reduce((a,b,j)=>!checked.has(j)&&(a<0||b<costs[a])?j:a,-1);
  if(next<0||!Number.isFinite(costs[next]))break;
  checked.add(next);
  for(const o of zdoors){
   const d=o.d,far=d.a===next?d.b:d.b===next?d.a:-1;
   if(far>=0)costs[far]=Math.min(costs[far],costs[next]+(o.open?4:14+d.c/140));
  }
 }
 let best=null;
 for(const [index,o] of zdoors.entries()){
  if(o.open)continue;
  const d=o.d,[,,dz,dx]=jupiterDoorRoutes[index]||[];
  if(!Number.isFinite(dx))continue;
  for(const side of [-1,1]){
   const [x,z]=zFreeSpot(d.x+dx*2.3*side,d.z+dz*2.3*side);
   const k=cell(x,z),far=side===-1?d.b:d.a;
   if(g[k]||NAV.comp[k]!==from||!Number.isFinite(costs[far]))continue;
   const score=12+Math.hypot(px-x,pz-z)+costs[far]+d.c/140+.16*distance;
   if(!best||score<best.score)best={x,z,y:jupiterFloor(x,z),label:d.n+' · '+d.c,score,door:true};
  }
 }
 return best;
}

function jupiterQuestBreadcrumbs(q,goal){
 const route=q.route,mesh=route.mesh;
 mesh.count=0;route.points=[];
 if(!goal)return;
 const path=navPath(P.x,P.z,goal.x,goal.z);
 if(!path?.length)return;
 route.points=path;
 const item=route.item,spacing=1.32,max=48;
 let x=P.x,z=P.z,carry=.73;
 for(const [nx,nz] of path){
  if(!navLos(x,z,nx,nz)){x=nx;z=nz;continue}
  const dx=nx-x,dz=nz-z,length=Math.hypot(dx,dz);
  for(;carry<length&&mesh.count<max;carry+=spacing){
   const a=x+dx*carry/length,b=z+dz*carry/length;
   item.position.set(a,jupiterFloor(a,b)+.072,b);
   item.rotation.set(-Math.PI/2,0,Math.atan2(-dx,-dz));
   item.updateMatrix();mesh.setMatrixAt(mesh.count++,item.matrix);
  }
  if(mesh.count===max)break;
  carry-=length;x=nx;z=nz;
 }
 mesh.instanceMatrix.needsUpdate=true;
}

function jupiterQuestWaypoint(q,targets){
 const marker=$('#jupiter-waypoint'),route=q.route;
 if(P.dead||!targets.length||jupiterIntroActive()||jovianInputBlocked()||xrS){
  marker.hidden=true;route.mesh.count=0;route.goal=null;route.key='';return;
 }
 const key=targets.map(node=>node.label).join('|'),position=targets[0];
 if(t0>=route.next||route.grid!==NAV.g||route.key!==key){
  route.next=t0+.32;route.grid=NAV.g;route.key=key;
  const options=targets.map(target=>jupiterQuestApproach(target,P.x,P.z)).filter(Boolean);
  route.goal=options.sort((a,b)=>a.score-b.score)[0]||null;
  jupiterQuestBreadcrumbs(q,route.goal);
 }
 const goal=route.goal||position,world=route.point.set(goal.x,goal.y+(goal.tall?2.5:1.86),goal.z);
 C.updateMatrixWorld(true);
 const camera=world.applyMatrix4(C.matrixWorldInverse),front=camera.z<0;
 camera.z=-Math.max(.09,Math.abs(camera.z));camera.applyMatrix4(C.projectionMatrix);
 const edge=Math.abs(camera.x)>.77||Math.abs(camera.y)>.68||!front;
 const scale=edge?Math.min(.77/Math.max(.02,Math.abs(camera.x)),.68/Math.max(.02,Math.abs(camera.y)),1):1;
 const vx=camera.x*scale,vy=camera.y*scale;
 marker.hidden=false;marker.classList.toggle('route-airlock',!!goal.door);
 marker.classList.toggle('route-edge',edge);
 marker.style.left=(50+vx*50)+'%';marker.style.top=(50-vy*50)+'%';
 marker.style.setProperty('--heading',Math.atan2(camera.x,camera.y)+'rad');
 const text=goal.label+' · '+Math.ceil(Math.hypot(goal.x-P.x,goal.z-P.z))+' m';
 if(marker.lastElementChild.textContent!==text)marker.lastElementChild.textContent=text;
}

function jupiterCalibrationTuned(q,delay=0){
 const band=jupiterCalibration[q.cal];
 return !!band&&q.calTime>=band[4]&&q.calTime<=band[5]+delay;
}

const jovianMissionSteps=[
 ['Answer the distress call',JP.LOGS],['Recover four crew logs',JP.PROTOTYPE],
 ['Build the Keyshooter',JP.RELAYS],['Power the three relays',JP.CORE],
 ['Install the flight core',JP.CHAMBER],['Open the Storm Chamber',JP.BOSS],
 ['Defeat the King Key',JP.ESCAPE],['Repair and board the pod',JP.LAUNCH]
];
let jovianDeckPlan;
function drawJovianDossier(){
 const q=jovianQuest();
 if(!q)return;
 if(P.dead||jovianInputBlocked()){
  closeJovianDossier();
  return;
 }
 const canvas=$('#mapc'),c=canvas.getContext('2d'),w=canvas.width;
 const scale=(w-56)/(15*JUPITER_CELL),x=v=>w/2+v*scale,z=v=>w/2+v*scale;
 if(!jovianDeckPlan){
  const base=jovianDeckPlan=document.createElement('canvas');base.width=base.height=w;
  const ctx=base.getContext('2d'),size=JUPITER_CELL*scale;
  ctx.fillStyle='#0a131c';ctx.fillRect(0,0,w,w);
  for(const cell of jupiterCells){
   ctx.fillStyle='#'+jupiterRooms[cell.room].deck.toString(16);
   ctx.fillRect(x(cell.x)-size/2,z(cell.z)-size/2,size+.6,size+.6);
  }
  ctx.lineWidth=1.5;ctx.strokeStyle='#8a9a9d';
  for(const wall of jupiterWalls){
   const dx=wall.dz*size/2,dz=wall.dx*size/2,cx=x(wall.x),cz=z(wall.z);
   ctx.beginPath();ctx.moveTo(cx-dx,cz-dz);ctx.lineTo(cx+dx,cz+dz);ctx.stroke();
  }
  ctx.textAlign='center';ctx.font='700 16px system-ui';ctx.fillStyle='#f4e5c8';
  for(const [id,room] of Object.entries(jupiterRooms)){
   const cells=jupiterCells.filter(cell=>cell.room===id);
   const cx=cells.reduce((sum,cell)=>sum+cell.x,0)/cells.length;
   const cz=cells.reduce((sum,cell)=>sum+cell.z,0)/cells.length;
   ctx.fillText(room.name,x(cx),z(cz),116);
  }
  ctx.textAlign='left';ctx.font='700 13px system-ui';ctx.fillStyle='#849da7';
  ctx.fillText('N ↑',22,24);
 }
 const now=performance.now();
 if(!q.dossierDrawAt||now-q.dossierDrawAt>=90){
  q.dossierDrawAt=now;
  c.drawImage(jovianDeckPlan,0,0);
  c.lineWidth=5;c.lineCap='round';
  for(const [index,door] of zdoors.entries()){
   const route=jupiterDoorRoutes[index];
   if(!route)continue;
   const [,,dz,dx]=route,cx=x(door.d.x),cz=z(door.d.z);
   c.strokeStyle=door.open?'#82b9a4':'#dfac66';c.beginPath();
   c.moveTo(cx-dz*8,cz-dx*8);c.lineTo(cx+dz*8,cz+dx*8);c.stroke();
  }
  const goal=q.route.goal;
  if(q.route.points.length){
   c.lineWidth=2.5;c.strokeStyle='#93ebec';c.setLineDash([5,5]);c.beginPath();c.moveTo(x(P.x),z(P.z));
   for(const [px,pz] of q.route.points)c.lineTo(x(px),z(pz));
   c.stroke();c.setLineDash([]);
  }
  if(goal){c.save();c.translate(x(goal.x),z(goal.z));c.rotate(Math.PI/4);
   c.fillStyle=goal.door?'#ffd087':'#81e7ed';c.fillRect(-5,-5,10,10);c.restore()}
  c.save();c.translate(x(P.x),z(P.z));c.rotate(-yaw);c.fillStyle='#fff';
  c.beginPath();c.moveTo(0,-10);c.lineTo(7,6);c.lineTo(0,3);c.lineTo(-7,6);c.closePath();c.fill();c.restore();
 }
 const detail=$('#jovian-dossier-objective'),objective=q.detail||'Follow the deck marker to Baker’s terminal.';
 if(detail.textContent!==objective)detail.textContent=objective;
 const state=q.stage+':'+q.logs;
 if(q.dossierState!==state){
  q.dossierState=state;
  const checklist=$('#jovian-dossier-checklist');checklist.replaceChildren();
  let active=false;
  for(const [label,stage] of jovianMissionSteps){
   const step=document.createElement('li');step.textContent=label;
   if(q.stage>=stage)step.className='complete';
   else if(!active){step.setAttribute('aria-current','step');active=true}
   checklist.append(step);
  }
  const logs=$('#jovian-dossier-logs');logs.replaceChildren();
  for(const [i,[,speaker,room,,,line]] of jupiterCrewLogs.entries()){
   const row=document.createElement('p'),caption=document.createElement('b');
   const recovered=Boolean(q.logs&(1<<i));
   caption.textContent=recovered?speaker+' · '+room:room;
   row.append(caption,document.createTextNode(' — '+(recovered?line:'Signal unread')));
   logs.append(row);
  }
 }
 const key=$('#jovian-dossier-key'),help='Cyan route · Amber airlock · '+(isTouch?'Tap Close':ctlKey('map')+' to close');
 if(key.textContent!==help)key.textContent=help;
}

function closeJovianDossier(){
 if(ST.mapOn&&$('#mapv').classList.contains('jovian-map'))resetTacticalMap();
}

function jupiterQuestHud(q){
 const hud=$('#jupiter-quest'),objective=hud.querySelector('.jupiter-objective'),stage=q.stage;
 const missing=jupiterKeyParts.filter((row,i)=>!(q.parts&(1<<i))),calibration=jupiterCalibration[q.cal];
 const activeRelay=jupiterQuestRelays[q.relay],logs=jupiterCrewLogs.filter((row,i)=>!(q.logs&(1<<i))).map(row=>row[2]);
 let title='Baker’s Last Flight',detail='';
 switch(stage){
 case JP.SIGNAL:detail='Answer the distress terminal in Freight Intake';break;
 case JP.LOGS:detail=(jupiterCrewLogs.length-logs.length)+'/4 crew logs recovered · '+logs[0];break;
 case JP.PROTOTYPE:
  detail=missing.length?'Recover '+missing.map(([,name,room])=>name+' · '+room).join(' / '):
   calibration?'Tune '+calibration[1]+' · '+(q.cal+1)+' / 3':
   q.cal<0?'Install the parts at the Service Spine workbench':'Return to the workbench to assemble the Keyshooter';
  break;
 case JP.RELAYS:detail=activeRelay[1]+' · '+(activeRelay[4]==='row'?'Hit all three contacts with one volley':'Shoot the crystal with the Keyshooter');break;
 case JP.CORE:detail='Recover the flight core in Quarantine';break;
 case JP.RETURN:detail=q.carrier===zMe()?'Bring the flight core to the Turbine Gallery':'Escort the flight core to the Turbine Gallery';break;
 case JP.CHAMBER:detail='Prepare your weapons and open the Storm Chamber';break;
 case JP.BOSS:detail='Defeat the King Key with conventional weapons';break;
 case JP.ESCAPE:detail=!q.released?'Reach the Freight Intake pressure release':q.wires===JOVIAN_ALL_WIRES?'Board the repaired escape pod':'Repair the escape pod wiring';break;
 case JP.LAUNCH:title='Escape pod away';break;
 }
 q.detail=detail;
 const target=stage===JP.SIGNAL?'signal':stage===JP.PROTOTYPE&&!missing.length?(calibration?.[0]||'prototype'):stage===JP.RELAYS?activeRelay[0]:
  stage===JP.CORE?'core':stage===JP.RETURN?'return':stage===JP.CHAMBER?'breaker':
  stage===JP.ESCAPE?(q.released?'pod':'release'):'';
 q.relayPad.mesh.visible=stage===JP.RELAYS&&activeRelay?.[4]==='row';
 const targets=target?[q.relayPad.mesh.visible&&Math.hypot(P.x-q.relayPad.x,P.z-q.relayPad.z)>1.35?q.relayPad:q.nodes[target]]:stage===JP.LOGS?
  jupiterCrewLogs.filter((row,i)=>!(q.logs&(1<<i))).map(([id])=>q.nodes[id]):
  stage===JP.PROTOTYPE?missing.map(([id])=>q.nodes[id]):
  stage===JP.BOSS&&q.boss?[{x:q.boss.x,y:q.boss.y,z:q.boss.z,label:jupiterQuestBossName,tall:true}]:[];
 jupiterQuestWaypoint(q,targets);
 const gauge=hud.querySelector('.jupiter-calibration'),tuning=stage===JP.PROTOTYPE&&!!calibration&&
  Math.hypot(P.x-q.nodes[calibration[0]].x,P.z-q.nodes[calibration[0]].z)<3.65;
 gauge.hidden=!tuning;
 if(tuning){
  gauge.style.setProperty('--cursor',100*q.calTime/JOVIAN_CAL_CYCLE+'%');
  if(gauge.dataset.step!==String(q.cal)){
   gauge.dataset.step=q.cal;
   gauge.style.setProperty('--band-start',100*calibration[4]/JOVIAN_CAL_CYCLE+'%');
   gauge.style.setProperty('--band-end',100*calibration[5]/JOVIAN_CAL_CYCLE+'%');
  }
  gauge.classList.toggle('jupiter-in-band',jupiterCalibrationTuned(q));
 }
 for(const node of Object.values(q.nodes)){
  if(node.isObject3D){
   node.visible=q.cut?.id==='craft'?q.cut.left>1.86:stage>=JP.RELAYS&&!wp.some(weapon=>weapon.k==='KEY');
   continue;
  }
  node.beacon.visible=node.id===target||stage===JP.LOGS&&jupiterCrewLogs.some(([id],i)=>id===node.id&&!(q.logs&(1<<i)))||
   stage>=JP.LOGS&&stage<=JP.PROTOTYPE&&missing.some(([id])=>id===node.id)||
   stage===JP.BOSS&&node.id==='breaker';
  if(node.beacon.visible){node.beacon.rotation.y=t0*2.1;node.beacon.position.y=(node.kind==='pod'?3.77:1.76)+.13*Math.sin(t0*3.5)}
  if(node.kind==='pod'){
   const {thrust}=node.group.userData,age=stage===JP.LAUNCH?JOVIAN_FLIGHT-q.launch:0;
   const lift=Math.max(0,age-3.1);
   const open=stage===JP.LAUNCH?(age<2.7?1-cl((age-1.9)/.8,0,1):0):Number(q.wires===JOVIAN_ALL_WIRES);
   node.feature.rotation.y+=(-1.62*open-node.feature.rotation.y)*.18;
   node.group.position.y=node.y+lift*lift*3.2;
   node.group.visible=age<6.35;
   thrust.visible=age>=2.92;
   thrust.scale.set(1+.13*Math.sin(t0*41),1+.15*Math.sin(t0*29),1);
   for(const [i,door] of q.hatch.entries())door.position.x=(i?1:-1)*(1+cl((age-2.1)/.9,0,1)*2.1);
  }else{
   const live=node.beacon.visible||node.kind==='relay'&&jupiterQuestRelays.findIndex(([id])=>id===node.id)<q.relay;
   node.feature.material=live?node.cold:node.hot;
   if(node.kind==='relay'){
    node.feature.rotation.y=t0*(live?3:.8);
    if(node.contacts)for(const contact of node.contacts)contact.material=live?node.cold:node.hot;
   }
   if(node.id==='core')node.feature.visible=stage<=JP.CORE;
   if(node.kind==='part')node.feature.visible=missing.some(([id])=>id===node.id);
  }
 }
 hud.hidden=false;
 if(objective.dataset.title!==title){objective.dataset.title=title;objective.querySelector('strong').textContent=title}
 if(objective.dataset.detail!==detail){objective.dataset.detail=detail;objective.querySelector('span').textContent=detail}
 const log=hud.querySelector('.jupiter-log');
 log.hidden=t0>Number(hud.dataset.logUntil||0)||!q.message;
 const strip=$('#zmain');
 strip.hidden=stage!==JP.BOSS;
 if(stage!==JP.BOSS)return;
 const exposed=q.expose>0,phase=jovianBossPhases[q.phase];
 const key=[Math.round(q.hp*10),q.phase,exposed,!!q.hazard].join(':');
 if(q.hud===key)return;
 q.hud=key;strip.style.setProperty('--boss-ink',exposed?'#7ddaff':'#ffbb54');
 strip.classList.remove('warded');
 strip.querySelector('strong').textContent=jupiterQuestBossName;
 strip.querySelector('small').textContent=q.hazard?'Floor discharge · jump or move':exposed?'Crown exposed · fire now':phase.name+' · use conventional weapons';
 strip.querySelector('i').style.width=q.hp+'%';
 strip.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',Math.round(q.hp));
}

function jupiterQuestReward(credit){
 const q=zq?.jupiter?.quest;
 if(!q||q.rewarded||!credit.includes(zMe()))return;
 q.rewarded=true;
 const fresh=!window.SD_MOD_SESSION&&!prof.zquest?.keywarden;
 if(fresh){prof.zquest={...prof.zquest,keywarden:true};save()}
 popup('JOVIAN TERMINUS EVACUATED',fresh?'Operator unlocked · Keywarden':'Baker’s Last Flight complete');
}

function jupiterQuestPack(){
 const q=zq?.jupiter?.quest;
 if(!q)return null;
 return {s:q.stage,l:q.logs,k:q.parts,r:q.relay,a:q.cal+1,u:q.calTime,c:q.carrier,b:q.bossId,h:Math.round(q.hp),
  y:!!q.released,f:q.funds,t:Math.max(0,q.launch),m:q.message,ex:q.expose||0,
  w:q.hazard?[q.hazard.id,q.hazard.index,q.hazard.time,q.hazard.spots]:null,
  tech:q.repairer,wires:q.wires,cut:q.cut&&[q.cut.serial,q.cut.id,q.cut.title,q.cut.line,q.cut.left,...q.cut.at]};
}

function jupiterQuestSync(data){
 const q=zq?.jupiter?.quest;
 if(!q||!data||!netInteger(data.s,JP.LAUNCH)||!netInteger(data.l,15)||!netInteger(data.r,3)||
  !netInteger(data.h,100)||!netInteger(data.k,3)||!netInteger(data.a,4))return;
 q.stage=data.s;q.logs=data.l;q.parts=data.k;q.relay=data.r;q.cal=data.a-1;
 if(Number.isFinite(data.u))q.calTime=cl(data.u,0,JOVIAN_CAL_CYCLE);q.carrier=netPlayerId(data.c)?data.c:'';
 if(netInteger(data.f,4800))jupiterQuestFunds(q,data.f);
 q.hp=data.h;q.released=data.y===true;
 if(netInteger(data.wires,JOVIAN_ALL_WIRES))q.wires=data.wires;
 q.repairer=netPlayerId(data.tech)?data.tech:'';
 if(q.stage===JP.LAUNCH&&Number.isFinite(data.t)){
  const left=cl(data.t,0,JOVIAN_FLIGHT);
  // Keep playing the final shot if the last host packet arrives just before impact.
  if(!q.flightStarted){q.launch=left;q.flightStarted=true}
  else q.launch=Math.min(q.launch,left+.14);
 }
 jovianSyncCue(q,data.cut);
 if(q.stage===JP.BOSS&&netInteger(data.b)){
  q.boss=bots.find(b=>b.zp&&b.i===data.b);
  if(q.boss)jupiterQuestMarkBoss(q.boss);
 }
 if(data.m===null)q.message=null;
 if(Array.isArray(data.m)&&netInteger(data.m[0])&&data.m[0]!==q.message?.[0]&&
    typeof data.m[1]==='string'&&data.m[1].length<100&&typeof data.m[2]==='string'&&data.m[2].length<240){
  q.message=data.m;jupiterQuestCaption(data.m);
 }
 q.phase=jovianBossPhase(q.hp);
 q.expose=Number.isFinite(data.ex)?cl(data.ex,0,3):0;
 const hazard=data.w;
 if(q.stage!==JP.BOSS||hazard===null)jupiterClearHazard(q);
 else if(Array.isArray(hazard)&&hazard.length===4){
  const [id,index,left,spots]=hazard;
  if(netInteger(id)&&netInteger(index,2)&&Number.isFinite(left)&&left>.06&&Array.isArray(spots)&&
     spots.length>0&&spots.length<=3&&spots.every(point=>Array.isArray(point)&&point.length===2&&point.every(Number.isFinite)&&jupiterAt(...point))){
   if(q.hazard?.id===id)q.hazard.time=Math.min(q.hazard.time,left+.12);
   else if(id>(q.syncedHazard||0)){
    q.syncedHazard=id;
    jupiterQuestMakeHazard(q,id,index,spots,Math.min(left,jovianBossPhases[index].tell));
   }
  }
 }
}

function jupiterQuestNet(d){
 const q=zq?.jupiter?.quest;
 if(!q)return;
 if(d.t==='zjkit'&&!isHost&&d.to===myId&&['KEY','AMMO'].includes(d.k)){
  if(d.recharge===true&&d.k==='KEY')zq.jupiter.ready.set(myId,0);
  else jupiterQuestEquip(d.k);
  return;
 }
 if(d.t==='zjwin'&&!isHost&&Array.isArray(d.credit)&&d.credit.length<=8){
  jupiterQuestReward(d.credit);return;
 }
 if(!isHost||d.t!=='zjp'||typeof d.n!=='string'||!hasOwn(q.nodes,d.n))return;
 if(d.a==='use'){jupiterQuestUse(d.n,d.id);return}
 if(d.n==='pod'&&(d.a==='wire'||d.a==='cancel')){jovianRepairAction(q,d.id,d.a,d.wire);return}
 if(d.a!=='relay'||q.cut||!zq.jupiter.owners.has(d.id)||
    ![d.o,d.v].every(a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite)))return;
 const player=bots.find(b=>b.net&&b.al&&b.id===d.id&&b.wk==='KEY'),origin=V(...d.o),dir=V(...d.v);
 if(!player||Math.hypot(origin.x-player.x,origin.z-player.z)>2.8||Math.abs(origin.y-player.y-1.5)>1.8||
    Math.abs(dir.length()-1)>.03)return;
 const rays=keyshooterVolleyRays(origin,dir);
 if(d.a==='relay'&&q.stage===JP.RELAYS){
  const relay=jupiterQuestRelays[q.relay],node=q.nodes[relay[0]];
  if(node.id===d.n&&jupiterRelayAccepts(relay,node,rays))jupiterQuestRelayOnline(q,node);
 }
}

function jupiterTick(dt){
 const state=zq.jupiter;
 jupiterQuestTick(dt);
 jupiterTouchControl.hidden=P.dead||cw()?.k!=='KEY';
 if(!sdGameRuntime?.aiDisabled())jupiterTickCompanions(dt);
 for(const b of bots){
  if(!b.isKey||!b.al)continue;
  b.y=jupiterFloor(b.x,b.z);b.m.position.y=b.y;
  const key=b.m.userData.key,wind=b.atk?Math.sin(Math.PI*Math.min(1,b.at/b.atd)):0;
  const wave=t0*4+b.i*1.75;
  if(b.jupiterCape)b.jupiterCape.rotation.x=-.09+Math.sin(wave)*.11-wind*.25;
  if(b.jupiterCrown){
   b.jupiterCrown.visible=state.quest?.expose>0;
   b.jupiterCrown.scale.setScalar(1+.11*Math.sin(t0*14));
  }
  key.position.y=(b.jupiterBoss?2.25:b.big?1.56:1.17)+.13*Math.sin(wave)+.19*wind;
  b.ry=(b.ry||0)+angD(b.tyaw||0,b.ry||0)*Math.min(1,dt*9);
  key.rotation.set(wind*.84+.18*Math.cos(wave),b.ry+.29*Math.sin(wave*.65),.18*Math.sin(wave));
  key.userData.mouth.scale.y=.027+.054*wind;
  if(b.rise>0)key.position.y-=.65*b.rise/b.riseD;
 }
 for(const shot of state.shots){
  if(!shot.mesh.visible)continue;
  shot.travel+=67*dt;
  shot.mesh.position.copy(shot.origin).addScaledVector(shot.dir,Math.min(shot.distance,shot.travel));
  shot.mesh.rotateY(dt*23);
  if(shot.travel>=shot.distance){
   shot.mesh.visible=false;
   burst(shot.mesh.position,9,0x7beaff,4,.28,.07);
  }
 }
 for(const [id,field] of state.fields){
  const player=id===zMe()?(!P.dead&&P):bots.find(b=>b.net&&b.al&&b.id===id);
  field.time-=dt;
  if(field.time<=0||!player){jupiterEndField(id);continue}
  jupiterAnimateField(field,player);
 }
}

function jupiterProtected(id){
 const state=zq?.jupiter;
 const q=state?.quest;
 return q?.stage===JP.LAUNCH||!!q?.cut||(!!q?.repairer&&q.repairer===id)||(state?.fields.get(id)?.time||0)>0;
}

function jupiterFieldStatus(){
 const state=zq.jupiter,holding=cw()?.k==='KEY';
 const field=state?.fields.get(zMe());
 const cooldown=Math.max(0,Math.ceil((state?.ready.get(zMe())||0)-t0));
 if(field)return ' · Forcefield '+Math.ceil(field.time)+'s';
 if(!holding)return '';
 return cooldown?' · Recharging '+cooldown+'s':' · ['+ctlKey('field')+'] Shield';
}

function jupiterUseField(){
 if(!zq?.jupiter||MV.eq||zq.papT>0||over)return;
 const wait=(zq.jupiter.ready.get(zMe())||0)-t0;
 if(wait>0)return zf('Forcefield recharging · '+Math.ceil(wait)+'s');
 if(zCli())netSend({t:'zkfieldreq'});
 else jupiterHostField(zMe());
}

function jupiterHostField(id){
 const state=zq.jupiter;
 if(!state||!run||over||(state.ready.get(id)||0)>t0||id===zMe()&&(P.dead||cw()?.k!=='KEY'))return;
 if(id!==zMe()){
  const player=bots.find(b=>b.net&&b.al&&b.id===id);
  if(!player||!state.owners.has(id)||player.wk!=='KEY')return;
 }
 jupiterStartField(id);
 if(netOn)netSend({t:'zkfield',by:id});
}

function jupiterStartField(id){
 const state=zq.jupiter;
 if(state.fields.has(id))return;
 const group=new THREE.Group();
 const here=id===zMe()?P:bots.find(b=>b.net&&b.id===id);
 if(!here)return;
 group.position.set(here.x,(here.y||0)+1.1,here.z);
 const shell=new THREE.Mesh(new THREE.SphereGeometry(2.65,28,16),new THREE.ShaderMaterial({
  uniforms:{phase:{value:0}},
  vertexShader:`varying vec3 pos;
   void main(){pos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`varying vec3 pos;uniform float phase;
   void main(){
    vec3 n=normalize(pos);
    float lat=acos(clamp(n.y,-1.0,1.0));
    float scan=pow(max(0.0,sin(lat*27.0-phase*5.0)),23.0);
    float seam=pow(abs(sin(atan(n.z,n.x)*11.0+lat*2.0)),48.0)*pow(sin(lat),4.0);
    float pulse=pow(max(0.0,sin(lat*4.0+phase*4.5)),14.0);
    gl_FragColor=vec4(0.18,0.58,1.0,0.024+scan*0.16+seam*0.14+pulse*0.10);
   }`,
  side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
 }));
 group.add(shell);
 for(const height of [-.98,.54]){
  const loop=new THREE.Mesh(new THREE.TorusGeometry(Math.sqrt(2.65**2-height**2),.025,6,64),zPuMat(0x4faeff,.61));
  loop.rotation.x=Math.PI/2;loop.position.y=height;group.add(loop);
 }
 zG.add(group);
 state.fields.set(id,{group,shell,time:JUPITER_FIELD_TIME});
 state.ready.set(id,t0+JUPITER_FIELD_RECHARGE);
 if(id===zMe()){
  msg('Keyshooter forcefield · 15 seconds',2.2);
  flTone(240,880,.45,.14,0,'sine');flNoise(.34,1600,500,.14,'bandpass',1.2);
 }
}

function jupiterAnimateField(field,player){
 field.group.position.set(player.x,(player.y||0)+1.07,player.z);
 field.shell.material.uniforms.phase.value=JUPITER_FIELD_TIME-field.time;
}

function jupiterEndField(id){
 const state=zq?.jupiter,field=state?.fields.get(id);
 if(!field)return;
 field.group.parent?.remove(field.group);
 for(const mesh of field.group.children.slice(0,3)){mesh.geometry.dispose();mesh.material.dispose()}
 state.fields.delete(id);
}

WG.KEY=[.74,0x39565e,1,0x10151f];
RLK.KEY='keyPour';
function keyshooterSound(volume=1){
 flNoise(.041,2330,630,.32*volume,'bandpass',1.45);
 flTone(181,79,.087,.14*volume,0,'sine');
 FOL.keyClatter(.27*volume,1.82,4,.016);
}
function keyshooterReloadPose(model,progress){
 const [hatch,bucket,stream]=model.userData.keyReload,A=model.userData.a,p=Math.max(0,progress);
 const loading=progress>=0;
 const pulse=cl(1-(t0-(model.userData.keyPulse??-4))*7.4,0,1);
 const [chamber,aperture,loader,...lamps]=model.userData.keyGlow;
 chamber.scale.setScalar(.66+.16*Math.sin(t0*6.1)+pulse*.79);
 aperture.visible=pulse>.07;aperture.scale.setScalar(.37+pulse*1.12);
 loader.visible=p>.27&&p<.89;loader.scale.setScalar(.72+.15*Math.sin(t0*31));
 for(const [i,lamp] of lamps.entries()){
  const waves=Math.sin(t0*8.4-i*.58)*.14;
  lamp.scale.setScalar(1+waves+pulse*.23);
  lamp.visible=!loading||i<2||p>.77;
 }
 const ramp=(start,end)=>eas(cl((p-start)/(end-start),0,1));
 const open=ramp(.06,.22)*(1-ramp(.80,.94));
 hatch.rotation.z=-2.16*open;
 bucket.visible=p>=.34&&p<.91;
 bucket.scale.setScalar(bucket.visible?1:.001);
 stream.visible=p>=.55&&p<.78;
 const down=V(.151,-.274,-.069),over=V(.112,.218,.151),out=V(.242,.077,.083);
 const tilt=ramp(.5,.59)*(1-ramp(.73,.83));
 if(p<.52)bucket.position.copy(down).lerp(over,ramp(.34,.52));
 else if(p<.73)bucket.position.copy(over);
 else if(p<.81)bucket.position.copy(over).lerp(out,ramp(.73,.81));
 else bucket.position.copy(out).lerp(down,ramp(.81,.91));
 bucket.rotation.set(-.21*tilt,0,1.37*tilt);
 const grip=V(.073,.045,.008).applyQuaternion(bucket.quaternion).add(bucket.position);
 const spout=V(-.024,.049,.008).applyQuaternion(bucket.quaternion).add(bucket.position);
 const lip=V(0,.068,.149);
 for(const [i,key] of stream.children.entries()){
  const fall=cl((p-.554-i*.012)/.103,0,1);
  key.visible=stream.visible&&fall>0&&fall<1;
  if(!key.visible)continue;
  key.position.copy(spout).lerp(lip,fall);
  key.position.x+=(i%3-1)*.032*Math.sin(Math.PI*fall);
  key.position.z+=(i%4-1.5)*.017*Math.sin(Math.PI*fall);
  key.position.y+=.039*Math.sin(Math.PI*fall);
  key.rotation.set(i*.86+fall*6,i*.69+fall*5.4,fall*7);
 }
 const contents=bucket.getObjectByName('Contents');
 if(contents)for(const [i,key] of contents.children.entries())key.visible=p<.558+i*.024;
 const r=V(...A.r),rest=V(...A.l),side=V(.135,-.026,.305),l=rest.clone();
 if(p<.14)l.lerp(side,ramp(0,.14));
 else if(p<.34)l.copy(side).lerp(grip,ramp(.14,.34));
 else if(p<=.91)l.copy(grip);
 else l.copy(grip).lerp(rest,ramp(.91,1));
 const axis=V(.17,.55,.81).lerp(V(.36,1,.11),ramp(.1,.34)*(1-ramp(.91,1)));
 return {r,l,rightAxis:V(0,1,.24),axis};
}

function keyshooterHopper(g,k,metal,brass,ink){
 const center=V(0,.066,.148),hatch=new THREE.Group(),bucket=new THREE.Group(),stream=new THREE.Group();
 hatch.position.set(.034,.065,.148);hatch.name='Key hopper lid';g.add(hatch);
 const make=(parent,geometry,mat,x,y,z)=>{
  const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 };
 const lip=make(g,new THREE.TorusGeometry(.033,.0045,8,24),brass,...center.toArray());
 lip.rotation.x=-Math.PI/2;lip.scale.y=1.24;
 const bore=make(g,new THREE.CircleGeometry(.031,20),ink,0,.059,.148);
 bore.rotation.x=-Math.PI/2;bore.scale.y=1.23;
 const lid=make(hatch,new THREE.CylinderGeometry(.034,.035,.009,24),metal,-.034,0,0);
 lid.scale.z=1.23;
 const stripe=make(hatch,new THREE.BoxGeometry(.035,.004,.006),k.E(0x87f7ff),-.035,.005,.013);
 stripe.rotation.y=.18;
 for(const z of [-.02,.019])k.cyl(.004,.014,.035,.064,.148+z,brass);
 bucket.name='Bucket of keys';bucket.visible=false;bucket.scale.setScalar(.001);g.add(bucket);
 const liner=new THREE.MeshLambertMaterial({color:0x71828a,side:THREE.DoubleSide});
 make(bucket,new THREE.CylinderGeometry(.065,.046,.09,14,1,true),liner,0,0,0);
 make(bucket,new THREE.CylinderGeometry(.047,.045,.008,14),metal,0,-.044,0);
 for(const [height,r] of [[.044,.065],[-.03,.049]]){
  const ring=make(bucket,new THREE.TorusGeometry(r,.004,7,20),brass,0,height,0);
  ring.rotation.x=Math.PI/2;
 }
 const handle=make(bucket,new THREE.TorusGeometry(.065,.004,8,20,Math.PI*1.21),metal,.011,.026,0);
 handle.rotation.z=-.28;
 const contents=new THREE.Group();contents.name='Contents';bucket.add(contents);
 for(let i=0;i<6;i++){
  const key=jupiterKeyMesh(i%2?0xeac05b:0xa9c7ce,0x2e2110);
  key.scale.setScalar(.024);key.position.set((i%3-1)*.025,.013+(i%2)*.013,(i<3?-1:1)*.018);
  key.rotation.set(1.2+i*.49,i,0);contents.add(key);
 }
 stream.name='Falling keys';stream.visible=false;g.add(stream);
 for(let i=0;i<9;i++){
  const key=jupiterKeyMesh(i%2?0xebb951:0xa1d1dc,0x58340a);
  key.scale.setScalar(.021);key.visible=false;stream.add(key);
 }
 g.userData.keyReload=[hatch,bucket,stream];
}
let keyHaloGeometry;
function keyHalo(parent,color,opacity,x,y,z,w,h){
 keyHaloGeometry||=new THREE.PlaneGeometry(1,1);
 const texture=new THREE.ShaderMaterial({
  uniforms:{ink:{value:new THREE.Color(color)},power:{value:opacity}},
  vertexShader:`varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform vec3 ink;uniform float power;varying vec2 uv0;
   void main(){float d=length((uv0-.5)*2.0);float halo=1.0-smoothstep(.04,1.0,d);gl_FragColor=vec4(ink,halo*halo*power);}`,
  transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 });
 const halo=new THREE.Group();halo.position.set(x,y,z);parent.add(halo);
 for(const [rx,ry] of [[0,0],[0,Math.PI/2],[Math.PI/2,0]]){
  const plane=new THREE.Mesh(keyHaloGeometry,texture);
  plane.rotation.set(rx,ry,0);plane.scale.set(w,h,1);halo.add(plane);
 }
 return halo;
}
MODELS.KEY=function(g,finish){
 const k=weaponKit(g,finish,0x33595c,0x809b9f);
 const {body,frame,steel,rubber,recess,trim,solid,tube,bore,web,pin,rod,grip,guard,moving}=k;
 const blue=k.E(0x47d9ff),white=k.E(0xa5f8ff),darkBlue=k.M(0x367998);
 const bright=new THREE.MeshBasicMaterial({color:new THREE.Color(0x59e7ff).multiplyScalar(1.8),toneMapped:false});
 const lamps=[];
 // The receiver is swept around the charged chamber, leaving the rails and crystal exposed.
 solid(frame,[-.129,.035,-.036,.031],[-.101,.058,-.039,.039],[.035,.078,-.04,.048],
  [.116,.076,-.041,.053],[.226,.065,-.035,.033],[.318,.041,-.032,.005],[.341,.029,-.024,-.001]);
 solid(body,[-.103,.04,.015,.038],[-.054,.073,.006,.053],[.035,.084,.01,.056],
  [.09,.087,.012,.052],[.119,.079,.001,.042],[.153,.052,-.007,.022]);
 solid(body,[.229,.062,-.029,.043],[.288,.071,-.019,.05],[.337,.067,-.013,.047],
  [.409,.049,-.008,.039],[.443,.035,.001,.026]);
 for(const side of [-1,1]){
  const x=side*.036;
  web(steel,x,.009,[[.042,.032],[.112,.05],[.228,.05],[.276,.02],[.261,.002],[.168,.038],[.11,.034],[.056,.016]]);
  web(body,side*.035,.01,[[.357,.038],[.424,.046],[.681,.025],[.694,.010],[.639,-.012],[.503,-.001],[.43,-.013],[.379,-.027]],
   [[[.444,.025],[.577,.025],[.643,.014],[.61,.006],[.497,.012],[.438,.005]]]);
  rod(white,.0038,[side*.034,.029,.386],[side*.021,.032,.655]);
  rod(trim,.0032,[side*.036,-.023,.367],[side*.024,-.011,.617]);
  pin(x,.024,.285,.006,trim);pin(x,.017,.027,.005,steel);
  for(let i=0;i<4;i++){
   const lamp=new THREE.Mesh(new THREE.CylinderGeometry(.0037,.0037,.018,8),bright);
   lamp.position.set(side*(.039-i*.0038),.029-i*.003,.408+i*.063);
   lamp.rotation.x=Math.PI/2;g.add(lamp);lamps.push(lamp);
  }
  k.box(.008,.014,.026,side*.043,.012,.078,blue,0,.18);
 }
 const core=k.ring(.040,.0035,0,.027,.169,trim),gate=k.ring(.036,.003,0,.027,.214,steel);
 const spindle=new THREE.Mesh(new THREE.IcosahedronGeometry(.031,0),blue);
 spindle.position.set(0,.027,.176);spindle.scale.set(.71,.71,2.2);g.add(spindle);
 const vanes=[];
 for(const side of [-1,1]){
  const bar=rod(white,.004,[side*.024,.033,.15],[side*.023,.026,.208]);vanes.push(bar);
 }
 const rotor=moving([spindle,...vanes],[0,.027,.184],'Blue-key chamber');
 core.name='Induction collar';gate.name='Focusing collar';g.userData.rotors=rotor;
 tube(recess,0,.023,[[.23,.018],[.31,.019],[.61,.011]],16);
 tube(white,0,.023,[[.345,.011],[.606,.0098]],12);
 bore(.023,.695,.022,.013,steel,.07,18);
 const collar=k.ring(.024,.003,0,.023,.667,blue);collar.name='Discharge aperture';
 grip(-.064,rubber);guard(-.038,-.041,.114);
 rod(frame,.009,[0,-.028,-.106],[0,-.071,-.223]);
 rod(steel,.008,[0,.012,-.094],[0,-.023,-.214]);
 solid(rubber,[-.23,.033,-.074,-.018],[-.205,.043,-.077,-.008],[-.194,.031,-.065,-.02]);
 tube(darkBlue,0,-.039,[[.069,.016],[.095,.028],[.186,.027],[.213,.02]],14);
 k.ring(.025,.005,0,-.039,.099,steel);k.ring(.023,.004,0,-.039,.178,trim);
 for(const side of [-1,1])rod(blue,.003,[side*.025,-.051,.099],[side*.023,-.051,.187]);
 keyshooterHopper(g,k,steel,trim,recess);
 const chamber=keyHalo(g,0x33d4ff,.63,0,.043,.177,.18,.23);
 const aperture=keyHalo(g,0x61dcff,.87,0,.024,.713,.20,.19);
 const hopper=keyHalo(g,0x66e5ff,.73,0,.074,.149,.19,.18);
 aperture.visible=hopper.visible=false;
 g.userData.keyGlow=[chamber,aperture,hopper,...lamps];
 mkSights(g,'KEY',{yt:.075,yb:.058,yf:.052,zr:-.066,zf:.563});
 g.userData.a={r:[-.018,-.112,-.05],l:[.036,-.06,.303],m:[0,.066,.148]};
 g.userData.muzzle={x:0,y:.023,z:.695};
 return g;
};

function jupiterKeyFace(key,hostile){
 let template=jupiterFaceTemplates.get(hostile);
 if(!template){
  template=jupiterBuildFace(hostile);
  jupiterFaceTemplates.set(hostile,template);
 }
 const face=template.clone();
 key.add(face);
 key.userData.mouth=face.getObjectByName('mouth');
}
const jupiterFaceTemplates=new Map();

function jupiterBuildFace(hostile){
 const face=new THREE.Group(),ink=eBasic(0x172038,1),white=eBasic(hostile?0xfff4b4:0xd9fbff,1);
 const surround=eM(hostile?0xb98125:0x167bd6,hostile?0x452400:0x04385d,.46,.43);
 for(const side of [-1,1]){
  eMk(face,EG.box,surround,side*.139,.575,.106,.175,.185,.056,0,0,side*.14);
  eMk(face,EG.sph,white,side*.139,.595,.139,.083,.093,.034);
  eMk(face,EG.sph,ink,side*.139+(hostile?-side*.016:.016),.58,.168,.043,.056,.017);
  eMk(face,EG.sph,white,side*.139+.007,.607,.184,.012,.012,.009);
  const brow=eMk(face,EG.box,ink,side*.139,.679,.163,.167,.034,.045,0,0,side*(hostile?.32:.14));
  brow.userData.dyn=true;
 }
 const mouth=eMk(face,EG.sph,ink,0,.39,.145,hostile?.09:.078,.034,.026,0,0,hostile?-.25:.12);
 mouth.name='mouth';mouth.userData.dyn=true;
 eMk(face,EG.box,surround,0,.453,.087,.36,.034,.065);
 eFlatten(face,.5,.2);
 return face;
}

function jupiterCreditCompanion(enemy,by){
 const credits=zq.jupiter.killCredit;
 credits.set(enemy.i,{by,x:enemy.x,z:enemy.z,time:t0});
 if(credits.size>96)credits.delete(credits.keys().next().value);
}

function jupiterRedeemCompanion(by,id){
 const state=zq.jupiter,credit=state.killCredit.get(id);
 if(!credit||credit.by!==by||t0-credit.time>4||!bots.some(b=>b.net&&b.al&&b.id===by))return;
 state.killCredit.delete(id);
 jupiterEarnCompanion({i:id,x:credit.x,z:credit.z},by);
}

function jupiterEarnCompanion(enemy,by){
 jupiterSpawnCompanion(by,enemy.i,enemy.x,enemy.z);
 if(netOn)netSend({t:'zkp',by,i:enemy.i,x:enemy.x,z:enemy.z});
}

function jupiterSpawnCompanion(by,id,x,z){
 const group=zq.jupiter.companions;
 if(group.some(key=>key.id===id))return;
 const owned=group.filter(key=>key.by===by);
 if(owned.length>=6)jupiterRemoveCompanion(owned[0]);
 const mesh=jupiterKeyMesh(0x43b9ff,0x075baf);
 jupiterKeyFace(mesh,false);
 mesh.scale.setScalar(.38);mesh.position.set(x,jupiterFloor(x,z)+1,z);zG.add(mesh);
 group.push({by,id,mesh,time:12,attack:.25,seek:0,target:null});
 burst(mesh.position,12,0x48c8ff,4,.5,.075);
}

function jupiterRemoveCompanion(key){
 const group=zq.jupiter.companions;
 key.mesh.parent?.remove(key.mesh);
 const index=group.indexOf(key);
 if(index>=0)group.splice(index,1);
}

function jupiterTickCompanions(dt){
 for(const key of zq.jupiter.companions.slice()){
  if(!key.mesh.parent)continue;
  const owner=key.by===zMe()?(!P.dead&&P):bots.find(b=>b.net&&b.al&&b.id===key.by);
  key.time-=dt;key.seek-=dt;key.attack-=dt;
  if(!owner||key.time<=0){jupiterRemoveCompanion(key);continue}
  const pos=key.mesh.position;
  if(key.seek<=0){
   key.seek=.3;
   let nearest=null,range=10;
   for(const enemy of bots){
    if(!enemy.isKey||!enemy.al)continue;
    const d=Math.hypot(enemy.x-pos.x,enemy.z-pos.z);
    if(d<range&&Math.hypot(enemy.x-owner.x,enemy.z-owner.z)<14&&navLos(pos.x,pos.z,enemy.x,enemy.z)){
     range=d;nearest=enemy;
    }
   }
   const king=zq.jupiter.quest.boss;
   key.target=king?.al&&Math.hypot(king.x-owner.x,king.z-owner.z)<21&&navLos(pos.x,pos.z,king.x,king.z)?king:nearest;
  }
  const enemy=key.target?.al?key.target:null,a=t0*2.9+key.id*2.4;
  const x=enemy?enemy.x:owner.x+Math.cos(a)*1.55,z=enemy?enemy.z:owner.z+Math.sin(a)*1.55;
  const dx=x-pos.x,dz=z-pos.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*(enemy?12:9));
  if(d>.01){pos.x+=dx/d*step;pos.z+=dz/d*step}
  const height=enemy?enemy.y+enemy.m.userData.key.position.y:(owner.y||0)+1.35;
  pos.y+=(height+.2*Math.sin(a*2)-pos.y)*Math.min(1,dt*10);
  key.mesh.rotation.set(enemy?.95:.12,enemy?Math.atan2(dx,dz):a,t0*1.8+key.id);
  if(enemy&&d<.9&&key.attack<=0){
   key.attack=.92;
   burst(pos,9,0x62ccff,4,.25,.06);
   if(!zCli()){
    if(enemy.jupiterBoss){
     // Blue keys batter the crown and interrupt a swing. Their blows leave his health intact.
     if(t0>=(enemy.nextBlueStagger||0)){
      enemy.nextBlueStagger=t0+2.6;enemy.stun=.46;
      const quest=zq.jupiter.quest;
      if(quest?.stage===JP.BOSS)quest.expose=Math.max(quest.expose,1.15);
      if(enemy.atk&&!enemy.ahit){enemy.atk=0;enemy.cd=.55}
     }
    }else zDamage(enemy,115+zHp(zq.r)*.20,false,key.by,'',false);
   }
  }
 }
}

const JUPITER_INTRO_DURATION=8.25,JUPITER_SKIP_DURATION=.85,JUPITER_IMPACT=4.83;
const jupiterIntroActive=()=>mode==='Zombies'&&Boolean(zq?.jupiter?.intro);
let jupiterSkipHeld=false,jupiterSkipPointer=null;
const jupiterIntroElement=()=>$('#jupiter-intro');

function jupiterStartIntro(){
 const group=new THREE.Group(),man=new THREE.Group(),rig=mkHuman(man,{operator:'ranger'});
 group.add(man);
 const actor={m:man,rig,x:-16,z:30.4,y:0,i:0,ry:Math.PI/2,tyaw:Math.PI/2};
 const pack=Array.from({length:9},(_,i)=>{
  const key=jupiterKeyMesh(i===0?0xffad20:0xffda39,0x613b06);
  jupiterKeyFace(key,true);key.scale.setScalar(i===0?.92:.67+i%3*.085);group.add(key);return key;
 });
 zG.add(group);
 const intro={group,actor,pack,camera:new THREE.PerspectiveCamera(51,C.aspect,.05,200),
  age:0,hold:0,step:0,syllable:0,hit:0,finished:false,bodyBounds:new THREE.Box3(),
  reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
 zq.jupiter.intro=intro;
 const el=jupiterIntroElement();
 el.hidden=false;el.style.setProperty('--skip',0);el.style.setProperty('--blackout',0);
 el.querySelector('.jupiter-dialogue').hidden=true;
 document.body.classList.add('jupiter-cinematic');
 jupiterIntroPose(intro,0);
}

function jupiterIntroCamera(){
 if(!jupiterIntroActive()||xrS)return null;
 const camera=zq.jupiter.intro.camera;
 if(camera.aspect!==C.aspect){camera.aspect=C.aspect;camera.updateProjectionMatrix()}
 return camera;
}

function jupiterHideIntro(){
 const el=jupiterIntroElement();
 if(el)el.hidden=true;
 jupiterSkipHeld=false;jupiterSkipPointer=null;
 document.body.classList.remove('jupiter-cinematic');
}

function jupiterFinishIntro(){
 const intro=zq.jupiter.intro;
 if(!intro)return;
 intro.group.parent?.remove(intro.group);
 zq.jupiter.intro=null;
 if(!zCli())zq.tm=1.45;
 trig=fresh=0;
 for(const k of Object.keys(key))key[k]=0;
 jupiterHideIntro();
}

function jupiterIntroPose(intro,dt){
 const {actor,pack,camera,age,reducedMotion}=intro,crash=Math.max(0,age-JUPITER_IMPACT);
 const runTime=Math.min(age,JUPITER_IMPACT),stride=runTime*5.25;
 actor.x=-14.6+stride;actor.z=30.4+.24*Math.sin(runTime*1.1);
 if(crash>0){
  actor.x+=1.1*Math.min(1,crash*1.55);
  actor.z+=.9*Math.min(1,crash*1.38);
 }
 actor.m.position.x=actor.x;actor.m.position.z=actor.z;
 if(crash<=0){
  animBot(actor,Math.max(dt,.001));
  actor.rig.head.rotation.y=age>1.12&&age<3.65?-.7:.20*Math.sin(age*3.1);
  actor.m.position.y=0;
 }else if(!intro.finished){
  const fall=Math.min(1,crash/.6);
  actor.m.rotation.z=-1.49*Math.sin(fall*Math.PI/2);
  actor.m.rotation.x=.20*Math.sin(crash*9)*Math.exp(-1.5*crash);
  actor.m.position.y=.06+.35*Math.sin(fall*Math.PI);
  actor.rig.head.rotation.z=.16+Math.sin(crash*16)*.2*Math.exp(-2.4*crash);
  for(const [index,leg] of [actor.rig.legL,actor.rig.legR].entries()){
   leg.rotation.x=(index%2?-1:1)*(.38+Math.sin(crash*(11+index))*1.18*Math.exp(-1.7*crash));
  }
  for(const [side,arm] of [[1,actor.rig.armR],[-1,actor.rig.armL]]){
   const shoulder=shPos(actor.rig,side);
   const brace=Math.sin(Math.min(1,crash/.48)*Math.PI);
   const reach=.19+brace*.27;
   ik(shoulder,V(side*(.24+brace*.19),shoulder.y-.31+brace*.16,shoulder.z+reach),V(side*.6,-.72,.1),arm);
  }
  // The fall rotates the whole rig. Ground its lowest mesh after the pose is applied.
  intro.bodyBounds.setFromObject(actor.m);
  actor.m.position.y+=Math.max(0,.035-intro.bodyBounds.min.y);
  if(crash>=2)intro.finished=true;
 }
 for(const [i,mesh] of pack.entries()){
  const a=age*2.75+i*2.4,closing=Math.max(0,(age-3.75)*4.2);
  if(crash<=0){
   mesh.position.set(actor.x-Math.max(.7,5.25+i*.65-closing*(i===0?1.14:.76)),1.14+.37*Math.sin(a),actor.z+(i-4)*.48+.29*Math.sin(a*1.2));
   mesh.rotation.set(.63+.22*Math.sin(a),Math.PI/2+a*.36,Math.sin(a)*.24);
  }else{
   const attack=Math.pow(Math.max(0,Math.sin(crash*9-i*.97)),3);
   const reach=(i===0?1.25:1.85)+.22*(i%3)-attack*.93;
   mesh.position.set(actor.x+Math.cos(a)*reach,.55+.75*(1-attack)+.31*Math.sin(a*2),actor.z+Math.sin(a)*reach);
   mesh.rotation.set(.29+attack*1.22,-a+Math.PI*.5,.42*Math.sin(a));
  }
  mesh.userData.mouth.scale.y=.024+.022*Math.abs(Math.sin(age*8+i));
 }
 const jolt=reducedMotion?0:crash>0?.20*Math.sin(crash*31)*Math.exp(-crash*3):.028*Math.sin(age*16);
 if(age<2.8){
  camera.position.set(actor.x+4.8,1.87+jolt,actor.z+4.75);
  camera.lookAt(actor.x-.95,1.2,actor.z-.1);
 }else if(age<JUPITER_IMPACT){
  camera.position.set(actor.x+5.25,2.5+jolt,actor.z+2.84);
  camera.lookAt(actor.x-1.17,1.38,actor.z);
 }else{
  camera.position.set(actor.x-3.7-crash*.45,2.45+jolt,actor.z+4.25+crash*.52);
  camera.lookAt(actor.x+.36,.52,actor.z);
 }
 camera.updateMatrixWorld();
}

function jupiterIntroTick(dt){
 const intro=zq.jupiter.intro,el=jupiterIntroElement();
 intro.age+=dt;
 const pad=typeof gpGet==='function'?gpGet():null;
 const held=jupiterSkipHeld||jupiterSkipPointer!==null||Boolean(pad?.buttons[0]?.pressed);
 intro.hold=held?intro.hold+dt:0;
 el.style.setProperty('--skip',Math.min(1,intro.hold/JUPITER_SKIP_DURATION));
 if(intro.hold>=JUPITER_SKIP_DURATION||intro.age>=JUPITER_INTRO_DURATION){jupiterFinishIntro();return}
 const caption=intro.age>=1.13&&intro.age<3.78;
 el.querySelector('.jupiter-dialogue').hidden=!caption;
 el.querySelector('.jupiter-location').hidden=intro.age>1.65;
 el.classList.toggle('jupiter-impact',intro.age>=JUPITER_IMPACT&&intro.age<JUPITER_IMPACT+.17);
 el.style.setProperty('--blackout',Math.max(0,(intro.age-7.2)/(JUPITER_INTRO_DURATION-7.2)));
 const label=pad?'Hold '+PG.t('A')+' to skip':isTouch?'Hold to skip':'Hold Enter to skip';
 const prompt=el.querySelector('.jupiter-skip span');
 if(prompt.textContent!==label)prompt.textContent=label;
 jupiterIntroPose(intro,dt);
 if(intro.age<JUPITER_IMPACT){
  if(intro.age>=intro.step){intro.step=intro.age+.19;flNoise(.095,980,260,.16,'bandpass',1.7)}
  if(caption&&intro.age>=intro.syllable){
   intro.syllable=intro.age+.145;
   flTone(198,194,.066,.12,0,'triangle');
  }
 }else if(intro.hit<4&&intro.age>=JUPITER_IMPACT+intro.hit*.34){
  const {actor}=intro;
  burst(V(actor.x+.25,.64,actor.z),intro.hit===0?24:11,0x9a2931,5.2,.47,.085);
  burst(V(actor.x,.71,actor.z),12,0xffbe42,4.3,.35,.075);
  flNoise(.22,1500,180,.27,'bandpass',1.55);
  flTone(145,36,.19,.13,0,'sine');
  intro.hit++;
 }
 estTick(dt);juiceTick(dt);gfxTick(dt);
 if(skyM)skyM.position.copy(intro.camera.position);
}

addEventListener('keydown',event=>{
 if(!jupiterIntroActive()||paused||!['Enter','NumpadEnter'].includes(event.code))return;
 event.preventDefault();event.stopImmediatePropagation();
 jupiterSkipHeld=true;
},true);
addEventListener('keyup',event=>{
 if(['Enter','NumpadEnter'].includes(event.code))jupiterSkipHeld=false;
},true);
addEventListener('blur',()=>{jupiterSkipHeld=false;jupiterSkipPointer=null});
const jupiterSkipButton=jupiterIntroElement().querySelector('.jupiter-skip');
jupiterSkipButton.addEventListener('pointerdown',event=>{
 event.preventDefault();
 jupiterSkipPointer=event.pointerId;jupiterSkipButton.setPointerCapture(event.pointerId);
});
for(const type of ['pointerup','pointercancel','lostpointercapture']){
 jupiterSkipButton.addEventListener(type,()=>{jupiterSkipPointer=null});
}


/* ---------- Jovian Terminus evacuation and the London crash site ---------- */
const JOVIAN_FLIGHT=24;
const JOVIAN_WIRES=[
 ['Power','#a86046'],['Ignition','#c2a155'],['Guidance','#687f94'],['Telemetry','#859466'],['Ground','#9a7f9d']
];
const JOVIAN_ALL_WIRES=(1<<JOVIAN_WIRES.length)-1;
const JOVIAN_SOCKET_ORDER=[3,0,4,2,1];
const JOVIAN_CRASH={x:3.2,z:47,rx:2.45,rz:2.5};
const JOVIAN_HATCH={x:3.5,z:38.1,rx:2,rz:1.83};

function jovianQuest(){return mode==='Zombies'?zq?.jupiter?.quest:null}
function jovianBox(root,mat,x,y,z,w,h,d){
 const mesh=new THREE.Mesh(bg,mat);
 mesh.position.set(x,y,z);
 mesh.scale.set(w,h,d);
 mesh.castShadow=true;
 mesh.receiveShadow=true;
 root.add(mesh);
 return mesh;
}

function jovianRoofCut(x,z,w,d,hole){
 const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2;
 const x0=Math.max(a,hole.x-hole.rx),x1=Math.min(b,hole.x+hole.rx);
 const z0=Math.max(c,hole.z-hole.rz),z1=Math.min(e,hole.z+hole.rz);
 if(x0>=x1||z0>=z1)return [[x,z,w,d]];
 return [[a,c,x0,e],[x1,c,b,e],[x0,c,x1,z0],[x0,z1,x1,e]]
  .filter(([l,t,r,v])=>r-l>.001&&v-t>.001)
  .map(([l,t,r,v])=>[(l+r)/2,(t+v)/2,r-l,v-t]);
}
function jovianRoofSections(x,z,w){return jovianRoofCut(x,z,w,w,JOVIAN_HATCH)}
function jovianTubeRoofSections(){return jovianRoofCut(0,47,17,15,JOVIAN_CRASH)}
function jovianTubeBeamSections(z,d,w){return jovianRoofCut(0,z,w,d,JOVIAN_CRASH).map(([x,,w])=>[x,w])}

function jovianBuildHatch(root,x,y,z){
 const steel=eM(0x596577,0,.48,.58),light=eBasic(0xff9f51,1),pads=[];
 for(const side of [-1,1]){
  const leaf=new THREE.Group();
  leaf.position.set(side,6.29,0);
  jovianBox(leaf,steel,0,0,0,2,.28,3.66);
  for(const rail of [-1,1])jovianBox(leaf,light,0,-.15,rail*1.62,1.72,.045,.071);
  pads.push(leaf);
 }
 const collar=new THREE.Group();
 collar.position.set(x,y,z);collar.add(...pads);root.add(collar);
 for(const side of [-1,1])jovianBox(collar,steel,0,6.0,side*1.94,4.2,.36,.23);
 return pads;
}

function jovianPodMarkings(root){
 const material=eCanvasMat(512,192,(ctx,w,h)=>{
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#24211d';ctx.textBaseline='middle';ctx.textAlign='center';
  ctx.font='800 83px monospace';ctx.fillText('JT–07',w/2,78);
  ctx.fillRect(79,126,354,3);
  ctx.font='700 28px monospace';ctx.fillText('RESCUE / PRESSURISED',w/2,152);
 },true);
 const plate=new THREE.Mesh(new THREE.PlaneGeometry(.89,.335),material);
 plate.userData.mapResources=[material.map];
 plate.position.set(0,1.51,1.145);root.add(plate);
}

function jovianBuildPod(root,{hot,cold}={}){
 const shell=eM(0xb4b5a9,0,.43,.55),panel=eM(0x8b8e87,0,.55,.43);
 const pale=eM(0xd2cec0,0,.56,.30),steel=eM(0x4f534f,0,.53,.58);
 const graphite=eM(0x222524,0,.83,.24),tile=eM(0x323330,0,.90,.13);
 const orange=eM(0x8d4934,0x1d0b06,.62,.31),fastener=eM(0x64655f,0,.48,.71);
 const glass=eM(0x121f22,0x101715,.19,.51),insulation=eM(0x806348,0,.80,.21);
 hot??=eBasic(0xc89e67,1);
 cold??=eBasic(0xa7c3b9,1);
 const cylinder=(top,bottom,h,y,mat,segments=32,start=0,arc=Math.PI*2)=>{
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,h,segments,1,false,start,arc),mat);
  mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
  return mesh;
 };
 const ring=(radius,tube,y,mat)=>{
  const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,7,42),mat);
  mesh.position.y=y;mesh.rotation.x=Math.PI/2;root.add(mesh);return mesh;
 };
 cylinder(1.02,1.07,.36,2.47,shell);
 cylinder(1.07,1.325,1.75,1.415,shell,30,Math.PI+.48,2*Math.PI-.96);
 cylinder(1.325,1.36,.23,.425,shell);
 cylinder(.83,1.02,.51,2.91,pale);
 cylinder(.59,.83,.39,3.36,panel);
 cylinder(.38,.59,.22,3.665,graphite);
 cylinder(.29,.38,.11,3.817,steel);
 cylinder(1.36,1.51,.31,.314,tile);
 cylinder(1.51,1.46,.14,.104,graphite);
 cylinder(.83,.63,.25,-.105,graphite);
 cylinder(.59,.67,.24,-.20,steel);
 cylinder(.38,.51,.19,-.254,graphite);
 ring(1.425,.024,.174,fastener);
 ring(1.322,.022,.514,graphite);
 ring(1.065,.018,2.55,graphite);
 ring(.815,.036,3.135,graphite);
 ring(.39,.032,3.769,steel);
 ring(.434,.056,-.35,fastener);
 ring(.322,.037,-.357,hot);
 // The overlapping heat-shield tiles taper into the ceramic skirt.
 for(let i=0;i<28;i++){
  const angle=i*Math.PI/14;
  const skirt=new THREE.Group();skirt.position.set(Math.sin(angle)*1.416,.295,Math.cos(angle)*1.416);
  skirt.rotation.y=angle;root.add(skirt);
  const segment=jovianBox(skirt,i%7===0?graphite:tile,0,0,.028,.27,.234,.063);
  segment.rotation.x=-.36;
  jovianBox(skirt,fastener,.078,-.066,.067,.022,.020,.009);
 }
 for(let i=0;i<8;i++){
  const a=(i+.5)*Math.PI/4;
  const bay=new THREE.Group();bay.rotation.y=a;root.add(bay);
  const seam=jovianBox(bay,steel,0,1.55,1.211,.033,1.99,.031);
  seam.rotation.x=-.143;
  for(const y of [.68,.85,2.32,2.49]){
   const r=1.36-(y-.31)*.145;
   const head=new THREE.Mesh(new THREE.CylinderGeometry(.033,.033,.017,6),fastener);
   head.rotation.x=Math.PI/2;head.position.set(0,y,r+.013);bay.add(head);
  }
  if(i%2===0){
   const radiator=jovianBox(bay,graphite,-.19,1.07,1.28,.25,.69,.028);
   radiator.rotation.x=-.143;
   for(let fin=0;fin<6;fin++)jovianBox(bay,steel,-.19,.799+fin*.102,1.324-fin*.014,.20,.023,.038);
  }
  const thruster=new THREE.Group();thruster.position.set(0,2.98,.915);
  thruster.rotation.x=-.39;bay.add(thruster);
  const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.125,.15,.11,14,1,true),steel);
  nozzle.rotation.x=Math.PI/2;thruster.add(nozzle);
  const opening=new THREE.Mesh(new THREE.CircleGeometry(.117,16),graphite);
  opening.position.z=.059;thruster.add(opening);
 }
 for(const side of [-1,1]){
  const lug=jovianBox(root,graphite,side*1.181,.75,-.2,.29,.63,.45);
  lug.rotation.z=side*.24;
  jovianBox(root,orange,side*1.25,.72,-.448,.16,.39,.049).rotation.z=side*.24;
  const harness=jovianBox(root,insulation,side*.98,1.11,-.79,.15,.75,.12);
  harness.rotation.z=-side*.15;
 }
 jovianPodMarkings(root);
 const hatch=new THREE.Group();
 hatch.position.set(-.53,0,-1.20);root.add(hatch);

 // The entry has an open pressure bulkhead and a shallow, lit cabin behind it.
 for(const [y,w] of [[.52,1.22],[2.38,1.13]])jovianBox(root,graphite,0,y,-1.08,w,.17,.24);
 jovianBox(root,graphite,0,1.44,.77,1.16,1.84,.10);
 jovianBox(root,panel,0,.61,0,1.27,.19,1.79);
 jovianBox(root,steel,0,1.95,.6,1.02,.31,.32);
 jovianBox(root,cold,0,1.95,.436,.44,.105,.032);
 for(const side of [-1,1]){
  jovianBox(root,insulation,side*.64,1.48,-.048,.11,1.42,1.14);
  jovianBox(root,fastener,side*.58,1.76,-.062,.066,.055,.99);
 }

 for(const side of [-1,1]){
  jovianBox(root,fastener,side*.596,1.44,-1.200,.095,1.90,.085);
  for(const y of [.76,2.13])jovianBox(root,steel,side*.596,y,-1.257,.059,.18,.036);
 }
 jovianBox(hatch,graphite,.53,1.43,.005,1.11,1.82,.113);
 jovianBox(hatch,pale,.53,1.43,-.066,1.025,1.74,.09);
 jovianBox(hatch,panel,.53,1.00,-.122,.88,.63,.024);
 jovianBox(hatch,orange,.53,2.216,-.13,.98,.159,.033);
 for(const side of [-1,1]){
  for(const y of [.70,.84,1.92,2.06])jovianBox(hatch,fastener,.53+side*.444,y,-.132,.031,.032,.022);
 }
 const window=new THREE.Mesh(new THREE.CylinderGeometry(.245,.265,.150,12),steel);
 window.rotation.x=Math.PI/2;window.position.set(.516,1.695,-.146);hatch.add(window);
 const pane=new THREE.Mesh(new THREE.SphereGeometry(.206,24,14),glass);
 pane.position.set(.516,1.695,-.213);pane.scale.set(1,.93,.11);hatch.add(pane);
 jovianBox(hatch,graphite,.516,1.696,-.235,.37,.037,.019);
 jovianBox(hatch,cold,.46,1.709,-.246,.21,.013,.01);
 jovianBox(hatch,graphite,.82,1.23,-.139,.15,.355,.045);
 jovianBox(hatch,orange,.82,1.24,-.191,.061,.211,.063).rotation.z=-.19;
 jovianBox(hatch,hot,.27,1.22,-.143,.047,.047,.026);

 const thrust=jovianPlume(.48,4.6,false);
 thrust.position.y=-.39;root.add(thrust);
 const heat=jovianPlume(1.38,5.3,true);
 heat.position.y=3.44;heat.rotation.z=Math.PI;root.add(heat);
 return {hatch,thrust,heat};
}

function jovianPlume(radius,length,heat){
 const shape=new THREE.LatheGeometry([
  V(0,0,0),V(radius,0,0),V(radius*.84,-length*.18,0),
  V(radius*.56,-length*.48,0),V(radius*.24,-length*.79,0),V(0,-length,0)
 ],32);
 const material=new THREE.ShaderMaterial({
  uniforms:{length:{value:length},radius:{value:radius},time:LX.U.time,
   core:{value:new THREE.Color(heat?0xffc390:0xf2fbff)},edge:{value:new THREE.Color(heat?0xd44e23:0xb2bcdf)}},
  vertexShader:`
   varying vec3 point;
   varying vec3 normalView,viewDir;
   void main(){
    point=position;
    vec4 p=modelViewMatrix*vec4(point,1.);
    normalView=normalize(normalMatrix*normal);viewDir=normalize(-p.xyz);
    gl_Position=projectionMatrix*p;
   }`,
  fragmentShader:`
   uniform float length,radius,time;
   uniform vec3 core,edge;
   varying vec3 point,normalView,viewDir;
   void main(){
    float t=clamp(-point.y/length,0.,1.);
    float facing=pow(abs(dot(normalize(normalView),normalize(viewDir))),.78);
    float ripples=.79+.21*sin(t*39.-time*25.+sin(point.x/radius*12.+time*11.)*1.6);
    float density=(1.-t)*facing*ripples;
    gl_FragColor=vec4(mix(core,edge,smoothstep(.10,.82,t+1.-facing))*1.15,density*.76);
   }`,
  transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 });
 const plume=new THREE.Mesh(shape,material);
 plume.visible=false;plume.userData.mapResources=[];
 return plume;
}

function jovianDressKing(key){
 key.scale.setScalar(2.08);
 const gold=eM(0xffbf34,0x522000,.39,.52),ruby=eM(0xb3193d,0x4d061d,.42,.42);
 const trim=eM(0xffd983,0x2c1600,.49,.45);
 const crown=new THREE.Group();
 crown.position.y=.98;key.add(crown);
 const crownBand=new THREE.Mesh(new THREE.CylinderGeometry(.415,.34,.21,10,1,true),gold.clone());
 crownBand.material.side=THREE.DoubleSide;crown.add(crownBand);
 for(let i=0;i<10;i++){
  const angle=i*Math.PI/5,spike=new THREE.Mesh(new THREE.ConeGeometry(.13,i%2?.22:.33,4),gold);
  spike.position.set(Math.cos(angle)*.375,i%2?.17:.22,Math.sin(angle)*.375);
  spike.rotation.y=-angle;spike.castShadow=true;crown.add(spike);
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.067),ruby);
  gem.position.set(Math.cos(angle)*.41,.01,Math.sin(angle)*.41);crown.add(gem);
 }
 const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(.115),ruby);
 jewel.position.set(0,.12,.44);crown.add(jewel);

 const cape=new THREE.Group(),shape=new THREE.Shape();
 cape.position.set(0,.39,-.16);key.add(cape);
 shape.moveTo(-.33,.05);shape.quadraticCurveTo(-.48,-.43,-.68,-1.29);
 shape.quadraticCurveTo(0,-1.58,.68,-1.29);shape.quadraticCurveTo(.48,-.43,.33,.05);
 shape.closePath();
 const fabric=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:0x951234,side:THREE.DoubleSide,roughness:.87}));
 fabric.rotation.x=.24;fabric.castShadow=true;cape.add(fabric);
 for(const side of [-1,1]){
  const clasp=new THREE.Mesh(new THREE.SphereGeometry(.123,12,8),trim);
  clasp.position.set(side*.315,.38,.06);key.add(clasp);
  const shoulder=new THREE.Mesh(new THREE.BoxGeometry(.32,.15,.31),gold);
  shoulder.position.set(side*.426,.335,-.076);shoulder.rotation.z=side*.23;key.add(shoulder);
 }
 const edge=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(shape.getPoints(26).map(p=>V(p.x,p.y,.009))),
  new THREE.LineBasicMaterial({color:0xffc95a}));
 edge.rotation.x=.24;cape.add(edge);
 return cape;
}

function jovianDebris(root){
 const {x,z,rx,rz}=JOVIAN_CRASH;
 const steel=eM(0x515763,0,.84,.23),tile=eM(0x918d83,0,.93,.14),char=eM(0x252327,0x23110a,.94,.1);
 for(const side of [-1,1]){
  for(let i=0;i<9;i++){
   const s=(i-4)/4,depth=.19+.45*Math.abs(Math.cos(i*4.1));
   const geo=new THREE.BufferGeometry().setFromPoints([V(-.28,0,0),V(.28,0,0),V(.08,-.12,depth)]);
   geo.computeVertexNormals();
   for(const axis of [0,1]){
    const shard=new THREE.Mesh(geo,(i%3?steel:tile));
    if(axis){shard.position.set(x+side*rx,5.63,z+s*(rz-.2));shard.rotation.y=side===1?-Math.PI/2:Math.PI/2}
    else{shard.position.set(x+s*(rx-.16),5.66,z+side*rz);shard.rotation.y=side===1?Math.PI:0}
    shard.castShadow=true;root.add(shard);
   }
  }
  jovianBox(root,steel,x+side*1.92,5.04,z-2.23,.13,1.07,.13).rotation.z=side*.36;
 }
 for(let i=0;i<27;i++){
  const a=i*2.39996,r=.76+(i%12)*.134;
  const fragment=jovianBox(root,i%4?tile:steel,x+Math.sin(a)*r,.055+(i%3)*.024,z+Math.cos(a)*r,.07+i%4*.09,.06+i%3*.045,.12+i%5*.065);
  fragment.rotation.set(i*.13,i*2.1,i*.17);
 }
 const scorch=new THREE.Mesh(new THREE.CircleGeometry(1.87,20),char);
 scorch.position.set(x,.036,z);scorch.rotation.x=-Math.PI/2;root.add(scorch);
}

function jovianLondonWreck(root){
 const wreck=new THREE.Group(),pod=new THREE.Group(),debris=new THREE.Group();
 const parts=jovianBuildPod(pod);
 pod.position.set(JOVIAN_CRASH.x,.59,JOVIAN_CRASH.z);
 pod.rotation.set(-.23,.27,-.58);parts.hatch.rotation.y=-1.37;
 wreck.add(pod,debris);jovianDebris(debris);root.add(wreck);
 const beacon=new THREE.PointLight(0xff5d33,.65,5,1.7);
 beacon.position.set(JOVIAN_CRASH.x+.45,1.08,JOVIAN_CRASH.z-.43);wreck.add(beacon);
 return {wreck,pod,parts,beacon,debris};
}

const jovianCinema=document.createElement('section');
jovianCinema.id='jovian-cinema';jovianCinema.hidden=true;
jovianCinema.innerHTML='<div class="jovian-letterbox"></div><div class="jovian-subtitles"><strong></strong><span></span></div>';
document.body.append(jovianCinema);
const jovianRepair=document.createElement('section');
jovianRepair.id='jovian-repair';jovianRepair.hidden=true;
jovianRepair.setAttribute('role','dialog');
jovianRepair.setAttribute('aria-labelledby','jovian-repair-title');
jovianRepair.innerHTML=`
 <div class="jovian-terminal">
  <div class="jovian-terminal-head"><h2 id="jovian-repair-title">Escape pod wiring</h2><output aria-live="polite"></output></div>
  <p>Drag each wire to the socket with its matching label.</p>
  <div class="jovian-harness">
   <div class="jovian-plugs"></div>
   <svg class="jovian-wires" aria-hidden="true" preserveAspectRatio="none"></svg>
   <div class="jovian-sockets"></div>
  </div>
  <div class="jovian-terminal-foot">
   <span role="status">Repair shield active</span><button type="button" class="jovian-return">Close panel</button>
  </div>
 </div>`;
document.body.append(jovianRepair);
const jovianHarness=jovianRepair.querySelector('.jovian-harness');
const jovianWireSvg=jovianRepair.querySelector('svg');
const jovianRepairButton=jovianRepair.querySelector('.jovian-return');
const jovianRepairStatus=jovianRepair.querySelector('[role=status]');
const jovianPlugs=[],jovianSockets=[];
let jovianDrag=null,jovianSelection=-1,jovianPending=-1,jovianPendingUntil=0,jovianWaitingForResume=false,jovianResumeTimer=0;
let jovianRepairMask=-1;
function jovianConnector(index,side){
 const [label,color]=JOVIAN_WIRES[index],button=document.createElement('button');
 button.type='button';button.dataset.wire=index;button.style.setProperty('--wire',color);
 button.innerHTML='<i></i><span></span>';button.lastElementChild.textContent=label;
 button.setAttribute('aria-label',label+(side==='plug'?' wire':' socket'));
 return button;
}
for(const [i] of JOVIAN_WIRES.entries()){
 const button=jovianConnector(i,'plug');jovianPlugs.push(button);
 jovianRepair.querySelector('.jovian-plugs').append(button);
 button.addEventListener('pointerdown',event=>{
  if(event.button!==0||jovianPending>=0||jovianDrag)return;
  button.setPointerCapture(event.pointerId);
  jovianDrag={i,id:event.pointerId,x:event.clientX,y:event.clientY};jovianSelection=i;
  jovianDrawWires();
 });
 button.addEventListener('pointermove',event=>{
  if(jovianDrag?.id!==event.pointerId)return;
  Object.assign(jovianDrag,{x:event.clientX,y:event.clientY});jovianDrawWires();
 });
 button.addEventListener('pointerup',event=>{
  if(jovianDrag?.id!==event.pointerId)return;
  const socket=document.elementFromPoint(event.clientX,event.clientY)?.closest('.jovian-sockets button');
  jovianDrag=null;
  if(socket)jovianConnect(Number(socket.dataset.wire));
  jovianDrawWires();
 });
 button.addEventListener('lostpointercapture',()=>{
  if(jovianDrag?.i===i){jovianDrag=null;jovianDrawWires()}
 });
 button.addEventListener('click',()=>{if(jovianPending<0){jovianSelection=i;jovianDrawWires()}});
}
for(const i of JOVIAN_SOCKET_ORDER){
 const button=jovianConnector(i,'socket');jovianSockets[i]=button;
 jovianRepair.querySelector('.jovian-sockets').append(button);
 button.addEventListener('click',()=>jovianConnect(i));
}
function jovianDrawWires(){
 if(jovianRepair.hidden)return;
 const q=jovianQuest(),area=jovianHarness.getBoundingClientRect();
 if(!q||!area.width||!area.height)return;
 const point=button=>{
  const rect=button.firstElementChild.getBoundingClientRect();
  return [rect.left+rect.width/2-area.left,rect.top+rect.height/2-area.top];
 };
 jovianWireSvg.setAttribute('viewBox',`0 0 ${area.width} ${area.height}`);
 jovianWireSvg.replaceChildren();
 for(const [i,[,color]] of JOVIAN_WIRES.entries()){
  const linked=Boolean(q.wires&(1<<i));
  jovianPlugs[i].classList.toggle('selected',jovianSelection===i||jovianPending===i);
  jovianPlugs[i].disabled=jovianSockets[i].disabled=linked;
  if(!linked&&jovianDrag?.i!==i)continue;
  const [x,y]=point(jovianPlugs[i]);
  const [x1,y1]=linked?point(jovianSockets[i]):[jovianDrag.x-area.left,jovianDrag.y-area.top];
  const curve=document.createElementNS('http://www.w3.org/2000/svg','path'),bend=(x1-x)*.44;
  curve.setAttribute('d',`M ${x} ${y} C ${x+bend} ${y}, ${x1-bend} ${y1}, ${x1} ${y1}`);
  const jacket=curve.cloneNode();
  jacket.setAttribute('class','jovian-cable-jacket');
  curve.setAttribute('stroke',color);jovianWireSvg.append(jacket,curve);
 }
}
addEventListener('resize',jovianDrawWires);

function jovianRepairAction(q,by,action,wire){
 if(q.stage!==JP.ESCAPE||q.repairer!==by)return;
 if(action==='cancel'){q.repairer='';return}
 const pod=q.nodes.pod,p=zPlayers().find(player=>player.id===by);
 if(!p||Math.hypot(p.x-pod.x,p.z-pod.z)>3.25||!netInteger(wire,JOVIAN_WIRES.length-1)||q.wires&(1<<wire))return;
 q.wires|=1<<wire;
 // Keep the repair shield up until the technician leaves the panel.
}
function jovianSendRepair(action,wire){
 if(zCli())netSend({t:'zjp',a:action,n:'pod',wire});
 else jovianRepairAction(jovianQuest(),zMe(),action,wire);
}
function jovianConnect(socket){
 const q=jovianQuest();
 if(!q||q.repairer!==zMe()||jovianPending>=0||jovianSelection<0)return;
 if(socket!==jovianSelection){
  jovianRepairStatus.textContent='Socket mismatch. Choose the matching label.';
  beep(165,.09,'triangle',.055);return;
 }
 jovianPending=socket;jovianPendingUntil=t0+1.5;jovianSelection=-1;
 jovianSendRepair('wire',socket);
}
function jovianRepairLockFailed(){
 if(!jovianWaitingForResume)return;
 jovianCloseRepair(true);
 if(run&&!over){paused=1;showPause()}
}
function jovianCloseRepair(force=false){
 if(jovianRepair.hidden)return;
 const q=jovianQuest();
 // Obtain the game cursor again while the button press still provides user activation.
 if(!force&&!window.SD_SPLIT&&!noLock&&document.pointerLockElement!==R.domElement){
  if(jovianWaitingForResume)return;
  jovianWaitingForResume=true;
  try{
   R.domElement.requestPointerLock()?.catch(jovianRepairLockFailed);
   jovianResumeTimer=setTimeout(jovianRepairLockFailed,1100);
  }catch{jovianRepairLockFailed()}
  return;
 }
 if(q?.repairer===zMe()){q.localRepairClosed=true;jovianSendRepair('cancel')}
 clearTimeout(jovianResumeTimer);
 jovianWaitingForResume=false;jovianRepair.hidden=true;
 jovianDrag=null;jovianSelection=jovianPending=-1;trig=fresh=0;
}
jovianRepairButton.addEventListener('click',()=>jovianCloseRepair());
document.addEventListener('pointerlockchange',()=>{
 if(jovianWaitingForResume&&document.pointerLockElement===R.domElement)jovianCloseRepair();
});
document.addEventListener('pointerlockerror',jovianRepairLockFailed);
jovianRepair.addEventListener('keydown',event=>{
 event.stopPropagation();
 if(event.code==='Escape'){event.preventDefault();jovianCloseRepair()}
});
jovianRepair.addEventListener('mousedown',event=>event.stopPropagation());

function jovianPointerFree(){return !jovianRepair.hidden}
function jovianInputBlocked(){
 const q=jovianQuest();
 return !!q&&(!!q.cut||q.stage===JP.LAUNCH||q.repairer===zMe()||jovianPointerFree());
}

function jovianRepairTick(q){
 if(!zCli()&&q.repairer&&!zPlayers().some(p=>p.id===q.repairer))q.repairer='';
 const here=q.repairer===zMe()&&q.stage===JP.ESCAPE&&!P.dead;
 if(!here){
  if(!jovianRepair.hidden){
   if(document.pointerLockElement===R.domElement||window.SD_SPLIT||noLock)jovianRepair.hidden=true;
   else {
    jovianRepairButton.textContent='Resume';
    jovianRepairStatus.textContent='Repair station released.';
   }
  }
  q.localRepairClosed=false;
  return;
 }
 if(jovianRepair.hidden){
  // Closing in co-op takes one host update to acknowledge.
  if(q.localRepairClosed)return;
  jovianRepair.hidden=false;jovianRepairMask=-1;
  trig=fresh=0;zq.dash.t=0;
  if(document.pointerLockElement)document.exitPointerLock();
  jovianPlugs.find((_,i)=>!(q.wires&(1<<i)))?.focus();
 }
 if(q.wires!==jovianRepairMask){
  if(jovianRepairMask!==-1)beep(520+(jovianPending+1)*74,.11,'triangle',.085);
  jovianRepairMask=q.wires;jovianPending=-1;
  const connected=JOVIAN_WIRES.filter((_,i)=>q.wires&(1<<i)).length,finished=q.wires===JOVIAN_ALL_WIRES;
  jovianRepair.querySelector('output').textContent=connected+' / '+JOVIAN_WIRES.length;
  jovianRepairStatus.textContent=finished?'Flight systems online.':'Repair shield active';
  jovianRepairButton.textContent=finished?'Return to the pod':'Close panel';
  jovianDrawWires();
  if(finished)jovianRepairButton.focus();
 }
 if(jovianPending>=0&&t0>=jovianPendingUntil){jovianPending=-1;jovianDrawWires()}
}

function jovianOperator(root){
 const model=new THREE.Group(),rig=mkHuman(model,{operator:passOperator()});
 root.add(model);
 return {model,rig};
}

function jovianPoseOperator(actor,{phase=0,speed=0,reach=0,crouch=0,carry=false}={}){
 const {rig}=actor,step=Math.sin(phase*Math.PI*2)*Math.min(1,speed/2.2);
 const height=operatorWalk(rig,phase,speed);
 rig.sh.position.y=1-height-crouch*.21;
 rig.sh.rotation.set(crouch*.26+speed*.035,-step*.092,step*.038);
 rig.head.rotation.set(crouch*.13,-rig.sh.rotation.y*.55,-rig.sh.rotation.z*.6);
 for(const piece of rig.hip)piece.position.y=-height-crouch*.21;
 for(const [leg,shin] of [[rig.legL,rig.shinL],[rig.legR,rig.shinR]]){
  leg.position.y-=crouch*.21;
  leg.rotation.x-=crouch*.49;shin.rotation.x+=crouch*.89;
 }
 for(const [arm,side] of [[rig.armR,1],[rig.armL,-1]]){
  const shoulder=shPos(rig,side);
  const hand=carry?V(side*.19,1.17,.42):V(side*.32,.823-crouch*.10+(reach&&side===1?.29:0),.045+side*step*.22+(reach&&side===1?.35:0));
  ik(shoulder,hand,V(side*.61,-.76,-.33),arm);
 }
}

function jovianCraftEquipment(actor){
 const {model}=actor,hammer=new THREE.Group();
 const grip=eM(0x62402c,0,.78,.14),iron=eM(0x474842,0,.52,.61),face=eM(0x99978d,0,.42,.62);
 jovianBox(hammer,grip,0,.09,0,.067,.66,.061);
 jovianBox(hammer,iron,.008,.393,0,.305,.128,.119);
 for(const side of [-1,1])jovianBox(hammer,face,side*.159,.393,0,.033,.106,.11);
 model.add(hammer);
 const keyshooter=buildGun('KEY');
 keyshooter.scale.setScalar(.73);model.add(keyshooter);
 const dust=Array.from({length:14},()=>{
  const material=new THREE.SpriteMaterial({
   map:LX.effectTextures().smoke[0],color:0xb8a391,transparent:true,depthWrite:false,opacity:0
  });
  const puff=new THREE.Sprite(material);
  puff.visible=false;zG.add(puff);return puff;
 });
 return {hammer,keyshooter,dust,impact:-1};
}

function jovianAnimateCraft(q,actor,age){
 const {x,y,z}=q.nodes.prototype,craft=actor.craft??=jovianCraftEquipment(actor);
 const {rig,model}=actor,lifting=eas(cl((age-2.95)/.82,0,1));
 const contact=.80,interval=.88,last=Math.min(2,Math.floor((age-contact)/interval));
 const cycle=age%interval/interval;
 const load=eas(cl((cycle-.05)/.55,0,1)),drive=eas(cl((cycle-.63)/.28,0,1));
 const raised=load*(1-drive);
 model.position.set(x-.90-lifting*.19,y,z+.31+lifting*.23);
 model.rotation.y=Math.atan2(x-model.position.x,z-model.position.z)-lifting*.17;
 jovianPoseOperator(actor,{crouch:.33-.22*lifting-.24*raised,carry:lifting>.56});
 rig.sh.rotation.y=raised*.22-drive*.13;
 rig.head.rotation.x=.09+drive*.24-lifting*.18;
 craft.hammer.visible=age<2.77;
 craft.keyshooter.visible=lifting>.22;
 q.nodes.prototypeWeapon.visible=!craft.keyshooter.visible;
 if(craft.hammer.visible){
  const head=V(.013+.185*raised,1.37+.59*raised+.10*drive,.85-.63*raised+.04*drive);
  const axis=V(.26*raised,.40+.58*raised,.90-1.18*raised).normalize();
  const h=craft.hammer;
  h.quaternion.setFromUnitVectors(V(0,1,0),axis);
  h.position.copy(head).sub(V(.008,.393,0).applyQuaternion(h.quaternion));
  gripArm(shPos(rig,1),h.position.clone().addScaledVector(axis,.05),V(.72,-.65,-.28),rig.armR,axis,1);
  ik(shPos(rig,-1),V(-.25,1.29-.06*raised,.57),V(-.57,-.74,-.30),rig.armL);
 }else if(craft.keyshooter.visible){
  const gun=craft.keyshooter;
  gun.position.set(.045,1.17+.16*lifting,.48);
  gun.rotation.set(.26-lifting*.49,-.38+lifting*.20,-.29+lifting*.22);
  gun.updateMatrix();
  const grip=anchor=>V(...anchor).applyMatrix4(gun.matrix);
  const anchors=gun.userData.a;
  gripArm(shPos(rig,1),grip(anchors.r),V(.68,-.72,-.25),rig.armR,V(0,1,.22).applyQuaternion(gun.quaternion),1);
  gripArm(shPos(rig,-1),grip(anchors.l),V(-.67,-.72,-.27),rig.armL,V(0,0,1).applyQuaternion(gun.quaternion),-1);
 }
 if(last>craft.impact){
  craft.impact=last;
  flNoise(.19,3300,510,.28,'bandpass');flTone(215,101,.10,.13,0,'triangle');
 }
 const dustAge=last<0?3:age-contact-last*interval;
 for(const [i,puff] of craft.dust.entries()){
  const drift=i*2.4,spread=.12+dustAge*(.43+(i%5)*.18);
  puff.visible=dustAge<1.24;
  puff.position.set(x+Math.sin(drift)*spread,y+1.33+dustAge*.54+(i%3)*.088,z+Math.cos(drift)*spread);
  puff.scale.setScalar(.26+(i%6)*.05+dustAge*(.76+(i%5)*.19));
  puff.material.opacity=Math.max(0,1-dustAge*.83)*(.33+(i%4)*.076);
 }
}

function jovianClearOperator(q){
 const actor=q?.actor;
 if(!actor)return;
 actor.model.visible=false;
 if(actor.craft){
  actor.craft.hammer.visible=actor.craft.keyshooter.visible=false;
  for(const puff of actor.craft.dust)puff.visible=false;
 }
}

function jovianShotOperator(q,camera,aim,age){
 const actor=q.actor??=jovianOperator(zG);
 actor.model.visible=true;
 if(q.cut.id==='craft'){
  jovianAnimateCraft(q,actor,age);
  return actor.model.position;
 }
 const direction=camera.position.clone().sub(aim).setY(0).normalize();
 const offset=V(direction.x*.72-direction.z*.68,0,direction.z*.72+direction.x*.68);
 if(q.cut.id==='king'||q.cut.id==='fallen')offset.multiplyScalar(1.95);
 const x=aim.x+offset.x,z=aim.z+offset.z;
 actor.model.position.set(x,jupiterFloor(x,z),z);
 actor.model.rotation.y=Math.atan2(aim.x-x,aim.z-z)+.11*Math.sin(age*1.8);
 const device=!['king','fallen','core'].includes(q.cut.id);
 jovianPoseOperator(actor,{reach:device?-.75-.19*Math.sin(age*2.3):0,crouch:device?.15:.04});
 return actor.model.position;
}

const JOVIAN_SHOTS={
 signal:[3.2,3,2.3,2.8,1.05],craft:[5.1,1.75,1.94,3.8,1.32],
 core:[3.45,2.5,2.25,2.55,1.25],return:[3.5,-2.1,2.44,2.9,1.14],
 king:[4.7,3.45,2.66,-5.2,2.3],fallen:[3.7,-3.75,2.06,-3.4,1.5]
};

function jovianCue(q,id,title,line,actor){
 const node=actor||(id==='king'?q.boss:q.nodes[id==='craft'?'prototype':id]);
 if(!node)return;
 q.cut={serial:++q.cutSerial,id,title,line,left:JOVIAN_SHOTS[id][0],at:[node.x,node.y,node.z]};
 trig=fresh=0;zq.dash.t=0;
}
function jovianSyncCue(q,cut){
 if(!Array.isArray(cut)||cut.length!==8)return;
 const [serial,id,title,line,left,...at]=cut;
 if(!netInteger(serial)||serial<=q.cutSerial||!hasOwn(JOVIAN_SHOTS,id)||
    typeof title!=='string'||title.length>100||typeof line!=='string'||line.length>240||
    ![left,...at].every(Number.isFinite)||left<=.05)return;
 q.cutSerial=serial;
 q.cut={serial,id,title,line,at,left:Math.min(left,JOVIAN_SHOTS[id][0])};
}
function jovianSubtitle(title,line,flash=0){
 const box=jovianCinema.lastElementChild;
 if(box.firstElementChild.textContent!==title)box.firstElementChild.textContent=title;
 if(box.lastElementChild.textContent!==line)box.lastElementChild.textContent=line;
 box.hidden=!title&&!line;
 jovianCinema.style.setProperty('--impact',flash);
}
function jovianSetCutUI(on){
 if(on)closeJovianDossier();
 jovianCinema.hidden=!on;
 document.body.classList.toggle('jovian-cinematic',on);
}
function jovianView(){
 const q=jovianQuest();
 if(!q?.cut&&q?.stage!==JP.LAUNCH)return null;
 q.camera??=new THREE.PerspectiveCamera(53,C.aspect,.075,620);
 const camera=q.camera;
 if(camera.aspect!==C.aspect){camera.aspect=C.aspect;camera.updateProjectionMatrix()}
 if(q.stage===JP.LAUNCH)return jovianFlightCamera(q,camera);
 const {id,at,left}=q.cut,[duration,dx,dy,dz,lookY]=JOVIAN_SHOTS[id];
 const age=1-left/duration,[x,y,z]=at;
 const offset=V(dx*(1-age*.24),dy-age*.42,dz*(1-age*.26));
 // Clip the camera boom to the visible side of walls around the device.
 const aim=V(x,y+lookY,z),ray=offset.clone().add(V(0,-lookY,0)),length=ray.length();
 const clear=castW(aim,ray.normalize(),length);
 camera.position.copy(aim).addScaledVector(ray,Math.max(.83,Math.min(length,clear-.21)));
 const actor=jovianShotOperator(q,camera,aim,duration-left);
 aim.x+=(actor.x-aim.x)*(id==='craft'?.47:.24);
 aim.z+=(actor.z-aim.z)*(id==='craft'?.47:.24);
 camera.lookAt(aim);
 camera.updateMatrixWorld();
 return camera;
}

function jovianStartLaunch(q){
 q.stage=JP.LAUNCH;q.launch=JOVIAN_FLIGHT;q.flightStarted=true;q.cut=null;
 jovianEarthMap();
 q.credit=zPlayers().map(player=>player.id);
 trig=fresh=0;zq.dash.t=0;
}
function jovianPresentationTick(q,dt){
 jovianRepairTick(q);
 if(q.stage===JP.LAUNCH){
  q.flightStarted=true;
  q.launch=Math.max(0,q.launch-dt);
  jovianSetCutUI(true);
  if(q.launch<=0){
   if(!zCli()){
    jupiterQuestReward(q.credit);
    if(netOn)netSend({t:'zjwin',credit:q.credit});
   }
   endGame('Victory');
  }
  return;
 }
 const cut=q.cut;
 if(cut){
  jovianSubtitle(cut.title,cut.line);
  cut.left-=dt;if(cut.left<=0){q.cut=null;jovianClearOperator(q)}
 }
 jovianSetCutUI(!!q.cut);
}

// Blue Marble surface and MODIS cloud imagery, NASA Earth Observatory / Reto Stöckli.
let jovianOrbitTexture;
function jovianEarthMap(){
 if(jovianOrbitTexture)return jovianOrbitTexture;
 const texture=jovianOrbitTexture=new THREE.Texture();
 texture.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());
 // The image is embedded in a lazy script so WebGL can upload it in file:// builds.
 const path='assets/earth-orbit.js',mod=window.SpartanMod,asset=document.createElement('script');
 asset.src=mod?.engine?.has(path)?mod.url(path):path;
 asset.addEventListener('load',()=>{
  const image=new Image();
  image.onload=()=>{texture.image=image;texture.needsUpdate=true};
  image.src=asset.earthOrbitImage;
  asset.remove();
 },{once:true});
 asset.addEventListener('error',()=>asset.remove(),{once:true});
 document.body.append(asset);
 return texture;
}

function jovianEarth(){
 const surface=new THREE.Mesh(new THREE.SphereGeometry(17,128,80),new THREE.ShaderMaterial({
  uniforms:{atlas:{value:jovianEarthMap()},sundirection:{value:V(-.48,.51,.85).normalize()},drift:{value:0}},
  vertexShader:`
   varying vec2 coordinates;
   varying vec3 normalWorld, worldPoint;
   void main(){
    coordinates=uv;
    normalWorld=normalize(mat3(modelMatrix)*normal);
    worldPoint=(modelMatrix*vec4(position,1.0)).xyz;
    gl_Position=projectionMatrix*viewMatrix*vec4(worldPoint,1.0);
   }`,
  fragmentShader:`
   uniform sampler2D atlas;
   uniform vec3 sundirection;
   uniform float drift;
   varying vec2 coordinates;
   varying vec3 normalWorld,worldPoint;
   vec2 surfaceUV(vec2 uv){return vec2(fract(uv.x),.5005+uv.y*.499);}
   vec2 cloudUV(vec2 uv){return vec2(fract(uv.x+drift),.0005+uv.y*.499);}
   void main(){
    vec3 n=normalize(normalWorld);
    vec3 v=normalize(cameraPosition-worldPoint);
    float light=dot(n,sundirection);
    float day=smoothstep(-.16,.16,light);
    float shadow=smoothstep(.23,.74,texture2D(atlas,cloudUV(coordinates+vec2(.0015,-.0009))).r);
    vec3 ground=pow(texture2D(atlas,surfaceUV(coordinates)).rgb,vec3(1.40));
    ground*=1.12-.34*shadow;
    float cloud=smoothstep(.10,.94,texture2D(atlas,cloudUV(coordinates)).r);
    vec3 color=mix(ground,vec3(.74,.80,.87),cloud*.88);
    float scatter=pow(1.-max(0.,dot(n,v)),3.1);
    color=color*(.09+day*(.34+max(light,0.)*.86));
    color+=vec3(.055,.12,.235)*scatter*day;
    gl_FragColor=vec4(color,1.);
    #include <encodings_fragment>
   }`
 }));
 surface.material.toneMapped=false;
 surface.userData.mapResources=[];
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(17.41,120,60),new THREE.ShaderMaterial({
  side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec3 v; varying vec3 n; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);v=normalize(-p.xyz);n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}',
  fragmentShader:'varying vec3 v; varying vec3 n; void main(){gl_FragColor=vec4(.23,.54,.93,pow(1.0-abs(dot(normalize(v),normalize(n))),5.0)*.44);}'
 }));
 atmosphere.userData.mapResources=[];
 surface.add(atmosphere);return surface;
}

function jovianStars(scene){
 const coords=[],colors=[];
 for(let i=0;i<1450;i++){
  const y=Math.sin(i*89.73),a=i*2.39996,r=220*Math.sqrt(1-y*y),v=.38+(i%17)/34;
  coords.push(r*Math.sin(a),y*220,r*Math.cos(a));colors.push(v*.75,v*.87,v);
 }
 const positions=new THREE.BufferGeometry();
 positions.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
 positions.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 scene.add(new THREE.Points(positions,new THREE.PointsMaterial({vertexColors:true,size:1.55,sizeAttenuation:false})));
}

function jovianBuildLondonFilm(){
 const london={...MAPS.London},station=new THREE.Scene(),root=new THREE.Group();
 const sky=makeMapSky(london,'London');
 station.background=new THREE.Color(london.sky);
 station.fog=new THREE.Fog(london.sky,32,250);
 station.add(root,sky,new THREE.HemisphereLight(london.hemiC,london.hemiG,.70));
 const daylight=new THREE.DirectionalLight(london.sunC,.96);
 daylight.position.set(14,28,17);station.add(daylight);
 // Build the actual playable London geometry into a detached scene. Estate state on
 // Jupiter stays with the live match while the London geometry and station signs are built.
 const activeEstate=EST;
 try{
  EST={...activeEstate,flames:[],pend2:[],fog:[],fountain:null};
  const boxes=lonBuild(london);
  gfxMapGeometry(london,boxes,root,'London');
  estPost(root);
  lonStn(root,{mins:[2,5]});
 }finally{EST=activeEstate}
 const crash=jovianLondonWreck(root);
 const interior=new THREE.PointLight(0xffe2be,.72,12,1.55);
 interior.position.set(-2.1,4.51,48.3);station.add(interior);
 const daylightBreach=new THREE.PointLight(0xc5e0ff,.85,13,1.65);
 daylightBreach.position.set(JOVIAN_CRASH.x,5.7,JOVIAN_CRASH.z);station.add(daylightBreach);
 const roof=[];
 for(const [i,[dx,dz]] of [[-1,-1],[-1,1],[1,-1],[1,1]].entries()){
  const block=jovianBox(root,gMat('concrete',0x3a3d42),JOVIAN_CRASH.x+dx*JOVIAN_CRASH.rx/2,5.88,
   JOVIAN_CRASH.z+dz*JOVIAN_CRASH.rz/2,JOVIAN_CRASH.rx,.52,JOVIAN_CRASH.rz);
  roof.push({block,original:block.position.clone(),dx,dz,i});
 }
 return {station,sky,crash,roof};
}

function jovianFlightWorld(){
 const space=new THREE.Scene();
 space.background=new THREE.Color(0x050a16);
 space.add(new THREE.HemisphereLight(0xc2eaff,0x281c41,1.35));
 const sunLight=new THREE.DirectionalLight(0xffe1ba,2.2);
 sunLight.position.set(-18,12,15);space.add(sunLight);
 jovianStars(space);
 const earth=jovianEarth();earth.position.set(9,5,-55);space.add(earth);
 const ship=new THREE.Group(),parts=jovianBuildPod(ship);ship.scale.setScalar(.65);space.add(ship);
 const shipLight=new THREE.PointLight(0xff893b,1.2,9,2);shipLight.position.set(0,2.7,-1);ship.add(shipLight);
 const {station,sky,crash,roof}=jovianBuildLondonFilm();
 const smokeMat=new THREE.SpriteMaterial({
  color:0x736257,map:LX.effectTextures().smoke[0],transparent:true,opacity:.26,depthWrite:false
 });
 const sparkMat=new THREE.MeshBasicMaterial({color:0xffb760});
 const sparkGeo=new THREE.IcosahedronGeometry(.055,0);
 const smoke=[],sparks=[];
 for(let i=0;i<12;i++){const puff=new THREE.Sprite(smokeMat.clone());smoke.push(puff);station.add(puff)}
 for(let i=0;i<22;i++){const spark=new THREE.Mesh(sparkGeo,sparkMat);sparks.push(spark);station.add(spark)}
 const boardActor=jovianOperator(zG),arrivalActor=jovianOperator(station);
 return {space,earth,ship,parts,station,sky,crash,roof,smoke,sparks,boardActor,arrivalActor,scene:null,sound:-1};
}

function jovianFlightCamera(q,camera){
 const age=JOVIAN_FLIGHT-q.launch,pod=q.nodes.pod.group,world=q.flight??=jovianFlightWorld();
 const {space,earth,ship,parts,boardActor,arrivalActor,station,sky,crash,roof,smoke,sparks}=world;
 const boarding=boardActor.model;
 world.scene=null;boarding.visible=age<2.12;arrivalActor.model.visible=false;
 let title,line,shot,flash=0;
 if(age<2.6){
  shot=0;title='Freight Intake';line='Baker: Strap in. I’m sealing the hatch.';
  const stride=cl(age/1.9,0,1);
  boarding.position.set(pod.position.x-.38+stride*.27,.05,pod.position.z-4.15+stride*3.87);
  boarding.rotation.y=0;
  const walkSpeed=2.35*(1-eas(cl((age-1.51)/.39,0,1)));
  jovianPoseOperator(boardActor,{phase:(stride*3.87/operatorStride(2.35))%1,speed:walkSpeed,crouch:cl((stride-.76)*3.2,0,.56)});
  camera.position.set(pod.position.x-3.45+stride*.48,1.72+stride*.25,pod.position.z-5.21+stride*.62);
  camera.lookAt(pod.position.x-.18,1.7,pod.position.z-1.05);
 }else if(age<6.35){
  shot=1;title='Jovian Terminus';line='Baker: Launch rail clear. Full thrust.';
  const climb=age-2.6;
  if(climb<1.55){
   camera.position.set(pod.position.x-3.25,1.4+climb*1.13,pod.position.z-4.2);
   camera.lookAt(pod.position.x,Math.min(6.3,pod.position.y+1.75),pod.position.z-.25);
  }else{
   camera.position.set(pod.position.x+6.65+climb*.66,7.8+(climb-1.55)*4.8,pod.position.z-8.4);
   camera.lookAt(pod.position.x,Math.min(26,pod.position.y+1.2),pod.position.z);
  }
 }else if(age<13.6){
  shot=2;title='Earth transfer';line='Baker: Guidance has Earth. I’ve plotted a path over London.';
  const travel=(age-6.35)/7.25;
  world.scene=space;earth.position.set(8.5,3.8,-62);earth.scale.setScalar(1);
  earth.rotation.set(.19,-1.40+travel*.30,-.24);
  earth.material.uniforms.drift.value=travel*.004;
  ship.position.set(-3.7+travel*6.3,-.52+travel*2.4,-8.1-travel*20);
  ship.rotation.set(-.47,-.2+travel*.21,-1.03+travel*.25);
  parts.thrust.visible=true;parts.heat.visible=false;
  parts.thrust.scale.set(.92,1.52+.2*Math.sin(age*23),.92);
  camera.position.set(-7.9+travel*5.8,2.2+travel*1.1,2.2-travel*11.2);
  camera.lookAt(2.0+travel*3.6,.7,-25-travel*17);
 }else if(age<16.45){
  shot=3;title='Earth re-entry';line='Baker: We’re coming in too fast. Brace for impact!';
  const travel=(age-13.6)/2.85;
  world.scene=space;earth.position.set(3,-19,-34);earth.scale.setScalar(1.67);earth.rotation.set(.26,-1.11,-.24);
  ship.position.set(-1.9+travel*2.9,3.8-travel*6.6,-10-travel*8.6);
  ship.rotation.set(2.7,.32,1.18+travel*.32);
  parts.thrust.visible=false;parts.heat.visible=true;parts.heat.scale.set(1.05,1.2+.19*Math.sin(age*28),1.05);
  camera.position.set(-6.5+travel*1.7,3.5,3.1-travel*4.1);
  camera.lookAt(1,-1,-20);
  flash=.1+.11*Math.abs(Math.sin(age*20));
 }else{
  const {x,z}=JOVIAN_CRASH,impact=age-19.04,breakAge=age-18.55;
  world.scene=station;crash.wreck.visible=true;
  crash.debris.visible=breakAge>=0;
  if(breakAge>=0&&!world.breached){world.breached=true;flNoise(.40,1940,180,.33,'lowpass')}
  for(const {block,original,dx,dz,i} of roof){
   const t=Math.max(0,breakAge);
   block.visible=t<1.3;
   block.position.copy(original).add(V(dx*t*(1.2+i*.32),t*.55-t*t*4.4,dz*t*(1.1+i*.28)));
   block.rotation.set(t*dz*(1.7+i*.49),t*dx*.51,t*dx*(1.4+i*.2));
  }
  for(const [i,object] of smoke.entries()){
   const life=Math.max(0,impact)*(.66+i%4*.11),angle=i*2.4;
   object.visible=impact>0;
   object.position.set(x+Math.sin(angle)*(.22+life*.19),.5+life*.91+i%4*.31,z+Math.cos(angle)*(.25+life*.16));
   object.scale.setScalar(.16+(i%6)*.1+life*.16);
   object.material.opacity=(.25-(i%3)*.023)*Math.max(.08,1-life*.12);
  }
  for(const [i,object] of sparks.entries()){
   const a=i*2.4,d=Math.max(0,impact),speed=2.4+i%9*.34;
   object.visible=impact>0&&impact<.95;
   object.position.set(x+Math.sin(a)*d*speed,.21+d*(4.7+i%5*.42)-d*d*4,z+Math.cos(a)*d*speed);
  }
  if(age<18.3){
   shot=4;title='Westminster, London';line='Baker: The station roof. Hold on!';
   const t=(age-16.45)/1.85;
   crash.pod.position.set(x+3.2*(1-t),28-19*t,z-3.5*(1-t));
   crash.pod.rotation.set(2.55,.4,-.54);
   crash.parts.heat.visible=true;crash.parts.thrust.visible=false;
   camera.position.set(-18-t*2.1,22-t*4,67-t*3.2);
   camera.lookAt(10,13-t*3,25+t*8);
  }else if(impact<0){
   shot=5;title='Westminster Underground';line='';
   const t=(age-18.3)/.74;
   crash.pod.position.set(x-.25*(1-t),8.4-7.81*t,z);
   crash.pod.rotation.set(2.55*(1-t)-.23*t,.27,-.58);
   crash.parts.heat.visible=true;
   camera.position.set(-3.7,1.84,42.18);
   camera.lookAt(x,2.95,z);
  }else{
   shot=6;title='Westminster Underground';line='Baker: We made it. Get clear of the pod.';
   const settle=cl(impact/1.3,0,1),jolt=Math.sin(impact*54)*.25*Math.exp(-impact*5.4);
   crash.pod.position.set(x,.59,z);
   crash.pod.rotation.set(-.23+jolt*.22,.27,-.58+jolt*.28);
   crash.parts.hatch.rotation.y=-1.37*cl((impact-.62)/.8,0,1);
   crash.parts.heat.visible=false;
   camera.position.set(-4.8+settle*.42,1.82+jolt,43.1+Math.min(.94,impact*.23));
   camera.lookAt(x-.67,2.32,z-.95);
   const exit=cl((impact-1.47)/2.15,0,1),arrived=arrivalActor.model;
   arrived.visible=exit>.06;
   arrived.position.set(x-.48-exit*2.1,.03,z-.68-exit*.7);
   arrived.rotation.y=-1.83+exit*.55;
   jovianPoseOperator(arrivalActor,{phase:(exit*2.22/operatorStride(.97))%1,speed:Math.sin(exit*Math.PI)**.46*1.25,crouch:.56-.49*exit});
   flash=Math.max(0,1-impact*3.4)*.82;
  }
 }
 if(world.sound!==shot){
  world.sound=shot;
  if(shot===1||shot===3)flNoise(1.42,790,62,.30,'lowpass');
  if(shot===2)flTone(98,147,.78,.07,0,'triangle');
  if(shot===6){flNoise(.93,1150,62,.52,'lowpass');flTone(101,34,.72,.16,0,'sine')}
 }
 if(world.scene===station)sky.position.copy(camera.position);
 jovianSubtitle(title,line,flash);
 camera.updateMatrixWorld();return camera;
}

let jovianVictory=null;
function jovianFlightScene(){return jovianVictory?.scene||(run?jovianQuest()?.flight?.scene:null)}
function jovianVictoryCamera(){return jovianVictory?.camera||null}
function jovianFinishVictory(score){
 const q=jovianQuest();
 if(q?.stage!==JP.LAUNCH)return false;
 const camera=q.camera||new THREE.PerspectiveCamera(53,C.aspect,.075,620);
 jovianFlightCamera(q,camera);
 jovianVictory={scene:q.flight.station,camera};
 jovianSetCutUI(false);
 $('#hud').style.display=$('#pause').style.display=$('#fin').style.display='none';
 const end=$('#end');end.classList.add('jovian-victory');end.style.display='flex';
 document.body.classList.add('jovian-results');
 $('#et').innerHTML=`<p class="jovian-arrival">WESTMINSTER UNDERGROUND · LONDON</p>
  <h1>VICTORY</h1><p class="jovian-complete">Baker’s Last Flight complete</p>
  <dl><div><dt>Round</dt><dd>${zq.r}</dd></div><div><dt>Kills</dt><dd>${kills}</dd></div><div><dt>Score</dt><dd>${score}</dd></div></dl>`;
 beep(523,.21,'triangle',.085);
 setTimeout(()=>beep(659,.21,'triangle',.085),150);
 setTimeout(()=>beep(784,.48,'triangle',.10),315);
 return true;
}
function jovianResetPresentation(){
 closeJovianDossier();
 const quest=zq?.jupiter?.quest,flight=quest?.flight;
 jovianClearOperator(quest);
 if(flight){
  flight.boardActor.model.parent?.remove(flight.boardActor.model);
  gfxDispose(flight.space);
  gfxDispose(flight.station);
  quest.flight=null;
 }
 jovianSetCutUI(false);
 document.body.classList.remove('jovian-results');
 jovianRepair.hidden=true;
 clearTimeout(jovianResumeTimer);
 jovianWaitingForResume=false;jovianDrag=null;jovianPending=jovianSelection=-1;jovianRepairMask=-1;
 const end=$('#end');
 if(end.classList.contains('jovian-victory')){
  end.classList.remove('jovian-victory');
  end.style.display='none';
  $('#et').replaceChildren();
 }
 jovianVictory=null;
}

