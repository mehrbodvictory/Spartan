/* ---------- weapons held by bots and other players: 3D model in their hands, muzzle flash, tracers from the barrel, positional shot sounds ---------- */
const WG={AR:[.95,0x3a4a52,1,0xb8651f],SMG:[.6,0x5a4a40,0,0x222222],BR:[.95,0x2f4a3a,1,0x222222],SG:[.9,0x6a5a2a,1,0x222222],VMP:[.65,0x23262b,1,0x222222],MG:[.35,0x666e74,0,0x222222],MP:[.4,0x3a3a4a,0,0x222222],RL:[1.1,0x7a3a2a,1,0x222222],SN:[1.2,0x2a2f4a,1,0x222222],RG:[.55,0xb02a22,0,0xff3030]};
const fMat=new THREE.MeshBasicMaterial({color:0xffe08a}),fMatR=new THREE.MeshBasicMaterial({color:0xff4040}),BOTGUNS=['AR','SMG','BR','SG','VMP','MG','MP','RG'];
function buildGun(k,rm,g){const[l,c,st,mc]=WG[k]||WG.AR;g=g||new THREE.Group();const mags=[],add=(w,h,d,x,y,z,col,rx,isMag)=>{const m=new THREE.Mesh(bg,col==='r'&&rm?rm:new THREE.MeshLambertMaterial({color:col==='r'?c:col}));m.scale.set(w,h,d);m.position.set(x,y,z);if(rx)m.rotation.x=rx;g.add(m);if(isMag)mags.push(m)};
 if(k=='RG'){add(.08,.1,.3,0,0,.15,'r');add(.05,.05,.26,0,.01,.2,0xff3030);add(.1,.1,.09,0,0,.36,'r');add(.045,.14,.06,0,-.11,.06,'r',-.25);add(.14,.14,.06,0,.02,0,'r');g.userData.a={r:[0,-.1,.06],l:[0,-.04,.28],m:[0,-.1,.1]}}
 else{add(.09,.12,l*.5,0,0,l*.3,'r');add(.05,.025,l*.45,0,.07,l*.3,0x1a1a1a);add(.075,.08,l*.28,0,-.01,l*.66,0x2a2a2a);add(.035,.035,l*.3,0,.01,l*.9,0x141414);add(.04,.12,.06,0,-.11,l*.1,0x222222,-.3);
  if(st){add(.07,.11,l*.26,0,-.015,-l*.08,'r');add(.03,.04,.06,0,.09,l*.2,0x1a1a1a)}if(k=='SG')add(.06,.05,.2,0,-.05,l*.7,0x3a2a1a);if(k=='SN')add(.05,.05,.28,0,.11,l*.35,0x0a0a0a);
  add(.05,k=='SMG'||k=='VMP'?.2:.15,.07,0,-.14,l*.34,mc,.12,true);g.userData.a={r:[0,-.12,l*.1],l:[0,-.07,l*.66],m:[0,-.18,l*.34]}}
 g.userData.mags=mags;return g}
function mkWorldGun(k){return buildGun(k)}
function setHeld(b,k){if(!k||(b.wk==k&&b.hg))return;if(b.hg)b.m.remove(b.hg);b.wk=k;b.hg=mkWorldGun(k);b.hg.position.set(.12,1.3,.18);b.m.add(b.hg)}
function muzzle(b){const l=(WG[b.wk]||WG.AR)[0],r=b.m.rotation.y,ox=.12,oz=.18+l*1.05,s=Math.sin(r),c=Math.cos(r);return V(b.x+ox*c+oz*s,(b.y||0)+1.33,b.z-ox*s+oz*c)}
function muzzleFlash(p,k){const m=new THREE.Mesh(sg,k=='RG'?fMatR:fMat);m.scale.setScalar(k=='SG'?.22:.13);m.position.copy(p);S.add(m);fx.push({m,l:.05})}
function otherSnd(k,p){const v=Math.max(0,1-p.distanceTo(C.position)/55);if(v<.06)return;if(k=='RG')return pew(v);noise(k=='SG'?.22:.1,k=='SG'?1800:3500,.3*v);beep(k=='SG'?90:140,.08,'sine',.12*v)}
function remoteShot(b,k,end,col){const mz=muzzle(b),dv=end.clone().sub(mz),L=dv.length();if(L<.1)return;dv.divideScalar(L);if(k=='RG')rgBeam(mz,dv,L,1);else tr(mz,dv,L,col||0xffd27a,.07,1);muzzleFlash(mz,k);otherSnd(k,mz)}
function falloff(w,d){return w.pw?1:Math.max(w.pel>1?.2:.45,1-d/(w.pel>1?18:140))}
