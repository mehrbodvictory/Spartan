/* ---------- RayGun: retro sci-fi blaster secondary. One click = one big red beam with splash damage. 20 rounds max. ---------- */
W.RG={n:'RayGun',d:30,r:.38,m:20,rs:0,sp:.002,rc:3.5,pel:1,au:0,rl:1.6,len:.45,col:0xb02a22,ex:{R:3.6,d:45,imp:0,w:'RG',c:0xff2a2a}};SEC.push('RG');
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
rbx(.01,.012,.1,0,-.075,-.1,rgSteel);rbx(.01,.045,.012,0,-.098,-.145,rgSteel);
rgG.visible=false;rgG.position.set(0,.02,.05);gun.add(rgG);
const _sg2=setGun;setGun=function(){_sg2();const rg=cw().k=='RG';rgG.visible=rg;gf.material.color.setHex(rg?0xff4040:0xffdd66);if(rg){gb.scale.set(.06,.06,.22);gb.position.set(0,-.01,-.06);gf.position.z=-.6}};
/* red beam + blaster sound */
const bmG=new THREE.CylinderGeometry(1,1,1,10);
function rgBeam(o,d,len,raw){const s=raw?o.clone():o.clone().add(d.clone().multiplyScalar(.7)).add(V(0,-.12,0)),e=o.clone().add(d.clone().multiplyScalar(len)),mid=s.clone().add(e).multiplyScalar(.5),L=s.distanceTo(e),dir=e.clone().sub(s).normalize();
 for(const[r,c,op]of[[.1,0xff1a1a,.55],[.04,0xffd0d0,.95]]){const m=new THREE.Mesh(bmG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op}));m.position.copy(mid);m.scale.set(r,L,r);m.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(m);fx.push({m,l:.16,fade:op,r})}}
function pew(a=1){try{ac=ac||new AudioContext();const t=ac.currentTime,mk=(ty,f0,f1,d,v)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(v*vol*a,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)};mk('sawtooth',1500,120,.28,.12);mk('square',900,80,.22,.06);mk('sine',2400,400,.12,.05)}catch(e){}}
