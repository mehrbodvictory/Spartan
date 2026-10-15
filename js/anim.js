/* ---------- animation + movement: character rig with IK arms, first-person hands, reload animations, mantling, wall jumps ---------- */
const FPA={AR:{r:[0,-.115,-.14],l:[0,-.075,-.62],m:[0,-.2,-.32]},VMP:{r:[0,-.1,-.08],l:[0,-.06,-.38],m:[0,-.2,-.15]},RG:{r:[0,-.095,.08],l:[-.02,-.15,.09],m:[0,-.14,0]}};
const fpG=new THREE.Group();gun.add(fpG);fpG.visible=false;
const eas=t=>t*t*(3-2*t),rlP=()=>rel>0&&cw()?1-rel/Math.max(.3,cw().rl):-1,rlBell=()=>{const p=rlP();return p<0?0:Math.sin(Math.PI*p)};
const rlRot=()=>-.5*rlBell(),rlRoll=()=>.35*rlBell(),rlY=()=>-.07*rlBell()-(P.mt?.12*Math.sin(Math.PI*P.mt.t/P.mt.d):0);
/* two-bone arm: upper arm and forearm groups meshes hang along -y; ik() points them so the hand reaches H */
function mkArm(parent,L1,L2,sm,gm,th){const up=new THREE.Group(),fo=new THREE.Group(),mk=(mt,w,h,d,y,p)=>{const o=new THREE.Mesh(bg,mt);o.scale.set(w,h,d);o.position.set(0,y,0);p.add(o)};
 mk(sm,th,L1,th,-L1/2,up);mk(sm,th*.85,L2,th*.85,-L2/2,fo);mk(gm,th*1.15,th*1.25,th*1.35,-L2,fo);parent.add(up,fo);return{up,fo,L1,L2}}
function ik(S0,H0,hint,arm){const L1=arm.L1,L2=arm.L2,d=H0.clone().sub(S0);let dist=d.length();const mx=L1+L2-.003;if(dist>mx){d.multiplyScalar(mx/dist);dist=mx}if(dist<.08)dist=.08;
 const dir=d.clone().normalize(),a=(L1*L1-L2*L2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,L1*L1-a*a)),pr=hint.clone().sub(dir.clone().multiplyScalar(hint.dot(dir)));if(pr.lengthSq()<1e-6)pr.set(0,-1,0);pr.normalize();
 const E=S0.clone().add(dir.clone().multiplyScalar(a)).add(pr.multiplyScalar(h)),dn=V(0,-1,0);
 arm.up.position.copy(S0);arm.up.quaternion.setFromUnitVectors(dn,E.clone().sub(S0).normalize());arm.fo.position.copy(E);arm.fo.quaternion.setFromUnitVectors(dn,H0.clone().sub(E).normalize())}
/* reload: left hand to the magwell, mag pulled down and dropped, fresh mag fetched, inserted, hand returns to the handguard */
function rlPose(p,L0,M0){const D=V(0,-.3,0),Q=M0.clone().add(V(-.06,-.42,.26));
 if(p<.2)return{h:L0.clone().lerp(M0,eas(p/.2)),m:0,v:1};
 if(p<.4){const t=eas((p-.2)/.2);return{h:M0.clone().add(D.clone().multiplyScalar(t)),m:-.3*t,v:1}}
 if(p<.55){const t=eas((p-.4)/.15);return{h:M0.clone().add(D).lerp(Q,t),m:-.3,v:t<.45?1:0}}
 if(p<.72){const t=eas((p-.55)/.17);return{h:Q.clone().lerp(M0.clone().add(D),t),m:-.3,v:t>.35?1:0}}
 if(p<.86){const t=eas((p-.72)/.14);return{h:M0.clone().add(D.clone().multiplyScalar(1-t)),m:-.3*(1-t),v:1}}
 return{h:M0.clone().lerp(L0,eas((p-.86)/.14)),m:0,v:1}}
/* first-person arms (children of the camera) */
const fpSl=new THREE.MeshLambertMaterial({color:0x34402f}),fpGl=new THREE.MeshLambertMaterial({color:0x151515}),fpArm={r:mkArm(C,.62,.6,fpSl,fpGl,.1),l:mkArm(C,.62,.6,fpSl,fpGl,.1)};
const curAnch=k=>FPA[k]||fpG.userData.a||FPA.AR,curMags=k=>k=='AR'?knG.userData.mag||[]:k=='VMP'?vmpG.userData.mag||[]:k=='RG'?[]:fpG.userData.mags||[];
function fpUpdate(dt){const vis=run&&!P.dead&&!over&&cw(),k=vis&&cw().k;for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=!!vis;if(!vis)return;
 const A=curAnch(k),p=rlP(),R0=V(...A.r),L0=V(...A.l),M0=V(...A.m);let lh=L0,mo=0,mvis=1;
 if(p>=0){const o=rlPose(p,L0,M0);lh=o.h;mo=o.m;mvis=o.v;const s1=p>.3,s2=p>.78;if(s1&&!P.s1)beep(240,.05,'square',.05);if(s2&&!P.s2)beep(420,.06,'square',.06);P.s1=s1;P.s2=s2}else P.s1=P.s2=0;
 for(const m of curMags(k)){if(m.userData.y0==null)m.userData.y0=m.position.y;m.position.y=m.userData.y0+mo;m.visible=!!mvis}
 const q=gun.quaternion,gp=gun.position,tw=a=>a.clone().applyQuaternion(q).add(gp);ik(V(.26,-.45,.12),tw(R0),V(.4,-1,.3),fpArm.r);ik(V(-.2,-.45,.12),tw(lh),V(-.4,-1,.3),fpArm.l)}
/* generic first-person model for weapons without a hand-made model */
const _sg3=setGun;setGun=function(){_sg3();const k=cw().k,sp=k=='AR'||k=='VMP'||k=='RG';gb.visible=sp;fpG.visible=!sp;for(const c of fpG.children.slice())fpG.remove(c);fpG.userData={};fpG.rotation.y=0;fpG.position.z=0;
 if(!sp){const l=WG[k]?WG[k][0]:.6;fpG.rotation.y=Math.PI;fpG.position.z=-.14+.1*l;buildGun(k,gb.userData.m0||gb.material,fpG);const mg=fpG.userData.mags;fpG.userData={a:{r:[0,-.12,-.14],l:[0,-.07,-.14-.56*l],m:[0,-.18,-.14-.24*l]},mags:mg};gf.position.z=-.14+.1*l-1.05*l-.04}
 applyCamo(k)};
/* third-person character: armoured body, legs that walk, two IK arms holding the weapon */
function mkHuman(m){const am=new THREE.MeshLambertMaterial({color:0xb5452e}),dk=new THREE.MeshLambertMaterial({color:0x2a2f35}),sk=new THREE.MeshLambertMaterial({color:0x4a4f57}),vis=new THREE.MeshBasicMaterial({color:0x62e0f0}),gl=new THREE.MeshLambertMaterial({color:0x151515}),
 bq=(w,h,d,x,y,z,mt,p)=>{const o=new THREE.Mesh(bg,mt);o.scale.set(w,h,d);o.position.set(x,y,z);(p||m).add(o)};
 bq(.5,.56,.3,0,1.33,0,am);bq(.4,.3,.08,0,1.38,.18,dk);bq(.3,.36,.14,0,1.34,-.22,dk);bq(.42,.16,.26,0,1,0,dk);bq(.26,.28,.28,0,1.78,0,sk);bq(.3,.14,.32,0,1.88,0,am);bq(.22,.07,.06,0,1.78,.16,vis);bq(.2,.14,.28,-.36,1.56,0,am);bq(.2,.14,.28,.36,1.56,0,am);
 const leg=x=>{const l=new THREE.Group(),s=new THREE.Group();l.position.set(x,.98,0);bq(.19,.44,.21,0,-.22,0,dk,l);bq(.17,.12,.06,0,-.2,.12,am,l);s.position.set(0,-.44,0);bq(.16,.44,.18,0,-.22,0,dk,s);bq(.2,.12,.3,0,-.46,.05,gl,s);l.add(s);m.add(l);return[l,s]};
 const[legL,shinL]=leg(-.12),[legR,shinR]=leg(.12);return{legL,legR,shinL,shinR,armR:mkArm(m,.36,.36,am,gl,.12),armL:mkArm(m,.36,.36,am,gl,.12)}}
function animBot(b,dt){const r=b.rig,g=b.hg;if(!r)return;const sp=Math.min(9,Math.hypot(b.x-(b.px==null?b.x:b.px),b.z-(b.pz==null?b.z:b.pz))/Math.max(dt,.001)),mvf=Math.min(1,sp/3);b.px=b.x;b.pz=b.z;
 b.ph=(b.ph||0)+sp*dt*1.4;const sw_=Math.sin(b.ph)*.75*mvf;r.legL.rotation.x=sw_;r.legR.rotation.x=-sw_;r.shinL.rotation.x=Math.max(0,-sw_)*1.1;r.shinR.rotation.x=Math.max(0,sw_)*1.1;if(!g)return;
 const w=W[b.wk]||W.AR,A=g.userData.a||{r:[0,-.1,.1],l:[0,-.05,.5],m:[0,-.15,.3]};let rp=-1;
 if(b.net){if(b.rlOn){b.rlt=(b.rlt||0)+dt;rp=Math.min(1,b.rlt/Math.max(.4,w.rl))}else b.rlt=0}else if(b.rl>0)rp=1-b.rl/Math.max(.4,w.rl);
 const bell=rp<0?0:Math.sin(Math.PI*rp);g.position.set(.12,1.3+Math.abs(Math.sin(b.ph))*.02*mvf-.06*bell,.18);g.rotation.set(-.5*bell,0,.3*bell);
 const R0=V(...A.r),L0=V(...A.l),M0=V(...A.m);let lh=L0,mo=0,mvis=1;if(rp>=0){const o=rlPose(rp,L0,M0);lh=o.h;mo=o.m;mvis=o.v}
 for(const m of g.userData.mags||[]){if(m.userData.y0==null)m.userData.y0=m.position.y;m.position.y=m.userData.y0+mo;m.visible=!!mvis}
 const q=g.quaternion,tw=a=>a.clone().applyQuaternion(q).add(g.position);ik(V(.3,1.5,0),tw(R0),V(.6,-1,-.3),r.armR);ik(V(-.3,1.5,0),tw(lh),V(-.6,-1,-.3),r.armL)}
/* movement: walking is 50% faster than before (no sprint), mantle ledges while airborne, kick off walls with a fresh jump press */
function phys(dt,f,s,spd){if(P.mt){mantleStep(dt);return}
 const jp=key.Space&&!P.jh;P.jh=!!key.Space;const n=Math.hypot(f,s)||1,cy=Math.cos(yaw),sy=Math.sin(yaw);let dx=(-sy*f+cy*s)/n*spd*dt,dz=(-cy*f-sy*s)/n*spd*dt;
 if(P.wvx||P.wvz){dx+=P.wvx*dt;dz+=P.wvz*dt;const k=Math.exp(-4.5*dt);P.wvx*=k;P.wvz*=k;if(Math.hypot(P.wvx,P.wvz)<.3)P.wvx=P.wvz=0}
 mv(P,dx,dz,.4);
 if(key.Space&&P.on){P.vy=L.pk.includes('Spring Legs')?9.4:7.6;P.on=0}else if(jp&&!P.on)tryWall();
 P.vy-=20*dt;P.y+=P.vy*dt;const g=gnd(P);if(P.y<=g){P.y=g;P.vy=0;P.on=1;P.wj=0}else P.on=0;
 if(!P.on&&key.KeyW&&P.vy<5&&t0>=(P.mcd||0))tryMantle()}
function tryMantle(){const fx_=-Math.sin(yaw),fz_=-Math.cos(yaw),px=P.x+fx_*.65,pz=P.z+fz_*.65;
 for(const b of bx){const up=b.h-P.y;if(up<.55||up>1.45||(b.y0||0)>P.y+1.2||px<b.x0-.05||px>b.x1+.05||pz<b.z0-.05||pz>b.z1+.05)continue;
  const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,hx=Math.max(0,(b.x1-b.x0)/2-.3),hz=Math.max(0,(b.z1-b.z0)/2-.3),tx=cl(P.x+fx_,cx-hx,cx+hx),tz=cl(P.z+fz_,cz-hz,cz+hz);
  if(bx.some(o=>o!==b&&tx>o.x0-.35&&tx<o.x1+.35&&tz>o.z0-.35&&tz<o.z1+.35&&(o.y0||0)<b.h+1.7&&o.h>b.h+.05))continue;
  P.mt={sx:P.x,sy:P.y,sz:P.z,tx,ty:b.h,tz,t:0,d:.42};P.vy=0;P.wvx=P.wvz=0;beep(300,.1,'triangle',.05);return}}
function mantleStep(dt){const m=P.mt;m.t+=dt;const k=Math.min(1,m.t/m.d),e=eas(Math.min(1,k/.55)),h=eas(Math.max(0,(k-.35)/.65));P.y=m.sy+(m.ty-m.sy)*e;P.x=m.sx+(m.tx-m.sx)*h;P.z=m.sz+(m.tz-m.sz)*h;P.vy=0;P.on=0;
 if(k>=1){P.x=m.tx;P.y=m.ty;P.z=m.tz;P.on=1;P.mt=null;P.mcd=t0+.4;P.wj=0;shake=Math.max(shake,.15)}}
function tryWall(){if((P.wj||0)>=3||t0<(P.wcd||0))return;
 for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const qx=P.x+dx*.55,qz=P.z+dz*.55;
  for(const b of bx)if(qx>b.x0&&qx<b.x1&&qz>b.z0&&qz<b.z1&&(b.y0||0)<P.y+1&&b.h>P.y+.9){P.vy=7.2;P.wvx=-dx*7;P.wvz=-dz*7;P.wj=(P.wj||0)+1;P.wcd=t0+.25;shake=Math.max(shake,.2);beep(420,.09,'triangle',.05);return}}}
