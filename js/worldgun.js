/* ---------- weapons held by bots and other players: 3D model in their hands, muzzle flash, tracers from the barrel, positional shot sounds ---------- */
const WG={AR:[.95,0x3a4a52,1,0xb8651f],SMG:[.6,0x5a4a40,0,0x222222],BR:[.95,0x2f4a3a,1,0x222222],SG:[.9,0x6a5a2a,1,0x222222],VMP:[.65,0x23262b,1,0x222222],MG:[.35,0x666e74,0,0x222222],MP:[.4,0x3a3a4a,0,0x222222],RL:[1.1,0x7a3a2a,1,0x222222],SN:[1.2,0x2a2f4a,1,0x222222],RG:[.55,0xb02a22,0,0xff3030]};
const fMat=new THREE.MeshBasicMaterial({color:0xffe08a}),fMatR=new THREE.MeshBasicMaterial({color:0xff4040}),BOTGUNS=['AR','SMG','BR','SG','VMP','MG','MP','RG'];
function mkWorldGun(k){const[l,c,st,mc]=WG[k]||WG.AR,g=new THREE.Group(),add=(w,h,d,x,y,z,col,rx)=>{const m=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:col}));m.scale.set(w,h,d);m.position.set(x,y,z);if(rx)m.rotation.x=rx;g.add(m)};
 add(.09,.12,l*.5,0,0,l*.3,c);add(.04,.04,l*.55,0,.02,l*.72,0x1a1a1a);add(.05,.14,.07,0,-.12,l*.22,mc,.15);if(st)add(.07,.11,l*.25,0,-.01,-.04,c);if(k=='RG')add(.06,.06,.2,0,0,l*.35,0xff3030);return g}
function setHeld(b,k){if(!k||(b.wk==k&&b.hg))return;if(b.hg)b.m.remove(b.hg);b.wk=k;b.hg=mkWorldGun(k);b.hg.position.set(.3,1.08,.22);b.m.add(b.hg)}
function muzzle(b){const l=(WG[b.wk]||WG.AR)[0],r=b.m.rotation.y,ox=.3,oz=.22+l*.95,s=Math.sin(r),c=Math.cos(r);return V(b.x+ox*c+oz*s,(b.y||0)+1.1,b.z-ox*s+oz*c)}
function muzzleFlash(p,k){const m=new THREE.Mesh(sg,k=='RG'?fMatR:fMat);m.scale.setScalar(k=='SG'?.22:.13);m.position.copy(p);S.add(m);fx.push({m,l:.05})}
function otherSnd(k,p){const v=Math.max(0,1-p.distanceTo(C.position)/55);if(v<.06)return;if(k=='RG')return pew(v);noise(k=='SG'?.22:.1,k=='SG'?1800:3500,.3*v);beep(k=='SG'?90:140,.08,'sine',.12*v)}
function remoteShot(b,k,end,col){const mz=muzzle(b),dv=end.clone().sub(mz),L=dv.length();if(L<.1)return;dv.divideScalar(L);if(k=='RG')rgBeam(mz,dv,L,1);else tr(mz,dv,L,col||0xffd27a,.07,1);muzzleFlash(mz,k);otherSnd(k,mz)}
function falloff(w,d){return w.pw?1:Math.max(w.pel>1?.2:.45,1-d/(w.pel>1?18:140))}
