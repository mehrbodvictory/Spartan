/* ---------- weapons ---------- */
const cw=()=>wp[cur];
function setGun(){const w=cw();applyCamo(w.k);gb.scale.set(.07,.09,w.len);gb.position.z=-w.len/2;gf.position.z=-w.len-.05;gun.position.set(.2,-.2,-.45)}
function shoot(){const w=cw();src=W[w.k].n;srcK=w.k;w.mag--;shots++;nf=t0+w.r;const o=C.position.clone(),base=aimDir();let d0=base;const T=findT();
 if(T)d0=base.clone().lerp(T.v,Math.min(.7,.55*AA*(1-T.a/T.cone*.5))).normalize();
 const mvg=(key.KeyW||key.KeyA||key.KeyS||key.KeyD)?1.6:1;
 for(let i=0;i<w.pel;i++){const d=d0.clone().add(V(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(2*w.sp*mvg)).normalize();let tw=castW(o,d,120),bt=1e9,bb=null,hd=0;
  for(const b of bots){if(!b.al||ally(b))continue;const th=rs(o,d,V(b.x,b.y+1.75,b.z),.3),tb=rs(o,d,V(b.x,b.y+.95,b.z),.65),t=Math.min(th,tb);if(t<bt){bt=t;bb=b;hd=th<tb}}
  if(bb&&bt<tw){tw=bt;hitBot(bb,w.d*(hd?2:1)*falloff(w,bt),hd)}else if(tw<119&&i<2)burst(o.clone().add(d.clone().multiplyScalar(tw-.05)),4,0xffd27a,3,.35,.06);
  if(i==0&&netOn)netShot(w.k,o,d,Math.min(tw,120));if(w.ex)boom(o.clone().add(d.clone().multiplyScalar(Math.max(0,Math.min(tw,120)-.3))),w.ex);if(w.k=='RG')rgBeam(o,d,Math.min(tw,120));else if(i==0||w.pel>1&&i<3)tr(o,d,Math.min(tw,w.pw?150:80),w.ex?0xff8040:0xfff0a0)}
 kick+=w.rc*.004;gun.position.z+=.05;gf.visible=true;setTimeout(()=>gf.visible=false,45);gunSnd(w);shake=Math.max(shake,w.rc*.014);flashL=1;fk=Math.max(fk,.6);if(w.mag<=0)startRel()}
function startRel(){const w=cw();if(rel>0||w.mag>=w.m||w.res<=0)return;rel=w.rl}
function swap(i){if(i<0||i>=wp.length||i==cur)return;cur=i;rel=0;setGun()}
function boom(p,g){if(g.w){src=W[g.w].n;srcK=g.w}else{src='Explosive';srcK=''}const m=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:g.c||0xffa040,transparent:true,opacity:.6}));m.position.copy(p);m.scale.setScalar(.5);S.add(m);fx.push({m,l:.35,grow:g.R*3,sph:1});beep(70,.4,'sawtooth',.12);noise(.5,900,.6);burst(p,40,g.c||0xffa040,9,.7,.18);shake=Math.max(shake,Math.min(1.2,14/(1+p.distanceTo(C.position))));flashL=2;
 for(const b of bots){if(!b.al||ally(b))continue;const D=Math.hypot(b.x-p.x,1-p.y,b.z-p.z);if(D<g.R)hitBot(b,g.d*(1-D/g.R),0)}
 const D=Math.hypot(P.x-p.x,P.y+1-p.y,P.z-p.z);if(D<g.R*.8)hurt(g.d*.4*(1-D/g.R))}
function throwG(){if(!L.g||gc<=0||P.dead)return;gc--;const d=aimDir(),m=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:L.g=='Frag'?0x4a7a3a:0x62e0f0}));m.scale.setScalar(.13);S.add(m);grs.push({m,p:C.position.clone(),v:d.multiplyScalar(15).add(V(0,3,0)),t:GR[L.g].fuse,g:GR[L.g]})}
