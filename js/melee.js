/* ===================== melee.js ===================== */
/* ---------- melee: tap V = quick weaker strike with the weapon in your hands (rifle butt), hold V = draw the melee weapon picked in your loadout and hit much harder.
   Melee weapons: Katana (two hands on the base of the grip, long reach, cuts up to 3 enemies) and Fists (fast, two punches alternating).
   Also builds the first-person arms: sleeves in the colour of the player character, cuff, gloved hand with palm, knuckle plate, four curled fingers and a thumb. ---------- */
const MEL={Katana:{n:'Katana',d:100,reach:3.1,cnt:3,cd:.55,zf:1,desc:'Two-handed blade. Long reach, can hit several enemies, very high damage when drawn.'},
 Fists:{n:'Fists',d:72,reach:2.4,cnt:1,cd:.4,zf:.55,desc:'Fast alternating punches. Short reach, but the quickest melee.'}};
const MV={down:0,h:0,f:0,draw:0,hold:0},MB={t:0,d:.34},FI={t:0,side:0,d:.3};
const melName=()=>MEL[L.me]?L.me:'Katana';
function mvReset(){MV.down=MV.h=MV.f=MV.hold=0;MV.draw=0;MB.t=0;FI.t=0}
function mvDown(){if(!run||paused||over||P.dead)return;MV.down=1;MV.h=0;MV.f=0}
function mvUp(){if(MV.down&&!MV.f)rifleBash();MV.down=0;MV.hold=0}
/* damage a cone in front of the player. Returns true when something was hit */
function meleeHit(dmg,reach,cnt,zf,cone){const f=V(-Math.sin(yaw),0,-Math.cos(yaw));let hit=0;
 const list=bots.filter(b=>b.al&&!ally(b)).map(b=>{const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);return{b,D,dt:D>0?(dx*f.x+dz*f.z)/D:1}}).filter(o=>o.D<reach&&o.dt>cone&&Math.abs((o.b.y||0)-(P.y||0))<2.2).sort((a,b)=>a.D-b.D);
 for(const o of list){if(hit>=cnt)break;const b=o.b,wk=mode=='Zombies'?(zf<1?Math.max(1,Math.ceil(zMel(b)*zf)):zMel(b)):dmg;hitBot(b,wk,0);beep(1400,.06,'square',.05);if(typeof burst=='function')burst(V(b.x,1.2,b.z),8,0xaa2222,4,.4,.1);hit++}
 return hit}
function meleeLunge(f,s){mv(P,f.x*s,f.z*s,.45)}
/* hold V (and RS click / touch button / VR): the selected melee weapon, strong */
melee=function(){if(t0<mn||P.dead)return;const m=MEL[melName()];mn=t0+m.cd;src='Melee';srcK='';noise(.12,2200,.25);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));
 if(melName()=='Fists'){FI.t=FI.d;FI.side^=1}else if(typeof katSwing=='function')katSwing();
 const n=meleeHit(m.d,m.reach,m.cnt,m.zf,.2);if(n)kick=Math.max(kick,.5);meleeLunge(f,.35)};
/* tap V: butt-stroke with the weapon in your hands, about a third of the damage */
function rifleBash(){if(t0<mn||P.dead||rel>0)return;mn=t0+.42;src='Melee';srcK='';MB.t=MB.d;noise(.08,1800,.2);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));
 const n=meleeHit(40,2.3,1,.3,.35);if(n)kick=Math.max(kick,.3);meleeLunge(f,.2)}
function meleeTick(dt){if(MB.t>0)MB.t-=dt;if(FI.t>0)FI.t-=dt;
 if(MV.down){MV.h+=dt;if(!MV.f&&MV.h>=.2){MV.f=1;MV.hold=1;melee()}}else MV.hold=0;
 if(P.dead||paused||over){MV.down=0;MV.hold=0}
 MV.draw+=((MV.hold?1:0)-MV.draw)*Math.min(1,dt*(MV.hold?11:9));if(MV.draw<.01)MV.draw=0}
const meleeOut=()=>MV.draw>.03||kat.t>0||FI.t>0;
/* weapon strike offsets used by the camera-held gun (see upd) */
const bashP=()=>MB.t>0?Math.sin(Math.PI*(1-MB.t/MB.d)):0;
const bashZ=()=>-.38*bashP(),bashY=()=>.05*bashP(),bashRot=()=>-.55*bashP();

/* ---------- first-person arms ---------- */
const SLV=0x3d6ad6,GLV=0x151515,CUFF=0x24262b;
function mkFpHand(side,gm,gm2){const h=new THREE.Group(),B=(w,hh,d,x,y,z,m,rx,rz)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,hh,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(rz)o.rotation.z=rz;h.add(o);return o},
 S=(r,x,y,z,m,sx,sy,sz)=>{const o=new THREE.Mesh(sg,m);o.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));o.position.set(x,y,z);h.add(o);return o};
 /* palm and back of the hand (the back faces local -z) */
 B(.092,.1,.044,0,-.062,0,gm);B(.086,.082,.014,0,-.06,-.027,gm2);S(.034,0,-.012,0,gm,1.25,.7,.9);
 /* knuckles */
 for(let i=0;i<4;i++)S(.0125,(i-1.5)*.0225,-.118,-.02,gm2);
 /* four curled fingers: proximal block, then the tip folded back towards the palm */
 for(let i=0;i<4;i++){const x=(i-1.5)*.0225,L=[.049,.052,.05,.042][i];B(.02,L,.02,x,-.138,-.004,gm,-.55);B(.019,L*.72,.019,x,-.15,.032,gm,-1.5);S(.0095,x,-.133,.052,gm)}
 /* thumb on the inner side, folded across */
 const sx=side>0?-1:1;B(.024,.06,.022,sx*.055,-.082,.026,gm,-.5,sx*.5);B(.021,.04,.02,sx*.04,-.118,.05,gm,-1.2,sx*.4);
 return h}
function mkFpArm(side){const up=new THREE.Group(),fo=new THREE.Group(),L1=.6,L2=.56,sl=new THREE.MeshLambertMaterial({color:SLV}),sl2=new THREE.MeshLambertMaterial({color:0x2f55b0}),gl=new THREE.MeshLambertMaterial({color:GLV}),gl2=new THREE.MeshLambertMaterial({color:0x2a2c32}),cf=new THREE.MeshLambertMaterial({color:CUFF}),
 mk=(g,m,sx,sy,sz,yy,p,x)=>{const o=new THREE.Mesh(g,m);o.scale.set(sx,sy,sz);o.position.set(x||0,yy,0);p.add(o);return o};
 mk(cyU,sl,.082,L1,.082,-L1/2,up);mk(sg,sl,.092,.092,.092,0,up);mk(cyS,sl2,.088,.03,.088,-L1*.55,up);
 mk(sg,sl,.072,.072,.072,0,fo);mk(cyU,sl,.07,L2,.07,-L2/2,fo);mk(cyS,sl2,.078,.025,.078,-L2*.35,fo);
 mk(cyS,cf,.064,.07,.064,-L2+.012,fo);mk(cyS,sl2,.07,.012,.07,-L2+.05,fo);
 const hand=mkFpHand(side,gl,gl2);hand.position.y=-L2+.0;fo.add(hand);
 for(const o of[up,fo])o.traverse(e=>{e.castShadow=false});C.add(up,fo);return{up,fo,L1,L2}}
for(const s of['r','l']){const o=fpArm[s];C.remove(o.up);C.remove(o.fo);fpArm[s]=mkFpArm(s=='r'?1:-1)}

/* ---------- arm placement while a melee weapon is out ---------- */
const _fpu=fpUpdate;
fpUpdate=function(dt){if(!meleeOut()||!run||P.dead||over){_fpu(dt);return}
 for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=true;const pr=gun.userData.prop;if(pr)pr.visible=false;
 const SR=V(.26,-.45,.12),SL=V(-.2,-.45,.12);
 if(melName()=='Fists'){const sw=Math.sin(t0*1.8)*.012,pk=FI.t>0?Math.sin(Math.PI*cl(1-FI.t/FI.d,0,1)):0,pr_=FI.side?1:0;
  const R=V(.2,-.3+sw,-.5-(pr_?pk*.6:0)),Lh=V(-.2,-.3-sw,-.5-(pr_?0:pk*.6));if(pr_)R.add(V(-.1*pk,.12*pk,0));else Lh.add(V(.1*pk,.12*pk,0));
  const dr=1-MV.draw;R.y-=dr*.4;Lh.y-=dr*.4;ik(SR,R,V(.5,-1,.3),fpArm.r);ik(SL,Lh,V(-.5,-1,.3),fpArm.l);return}
 /* katana: right hand at the pommel end of the grip, left hand just under the guard, both following the blade through every swing */
 katG.updateMatrix();const mt=katG.matrix,Rh=V(0,-.235,0).applyMatrix4(mt),Lh=V(0,-.12,0).applyMatrix4(mt);
 ik(SR,Rh,V(.5,-1,.35),fpArm.r);ik(SL,Lh,V(-.5,-1,.35),fpArm.l)};
