/* ---------- VMP: very fast SMG with a custom model (long mag, top rail, toothed muzzle drum, gold accents) ---------- */
W.VMP={n:'VMP-X',d:5,r:.042,m:36,sp:.03,rc:.5,pel:1,au:1,rl:1.8,len:.55,col:0x23262b};PRI.push('VMP');
const vmpG=new THREE.Group(),dk=new THREE.MeshLambertMaterial({color:0x15171a}),gd=new THREE.MeshLambertMaterial({color:0xc9a94d});
const bp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;vmpG.add(p)};
bp(0,.06,.035,.38,0,.072,-.27,dk);bp(0,.02,.04,.02,0,.11,-.12,dk);bp(0,.015,.05,.015,0,.115,-.46,dk);bp(0,.084,.03,.18,0,.03,-.32,gd);
bp(new THREE.CylinderGeometry(.02,.022,.12,10),0,0,0,0,0,-.6,dk,Math.PI/2);bp(new THREE.CylinderGeometry(.05,.05,.07,12),0,0,0,0,0,-.5,dk,Math.PI/2);
bp(0,.06,.11,.2,0,-.01,.1,dk);bp(0,.04,.12,.05,0,-.1,-.08,dk,.25);bp(0,.04,.22,.065,0,-.2,-.15,dk,.12);bp(0,.042,.025,.067,0,-.13,-.15,gd,.12);
vmpG.visible=false;gun.add(vmpG);
/* ---------- KN-115: original AK-style rifle model (tri-prong muzzle, rail handguard, curved copper mag, angular stock) ---------- */
W.AR.n='KN-115';
const knG=new THREE.Group(),dk2=new THREE.MeshLambertMaterial({color:0x2b2e33}),cu=new THREE.MeshLambertMaterial({color:0xb8651f}),tl=new THREE.MeshLambertMaterial({color:0x3fd0c9});
const kp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;knG.add(p)},cyl=(r,l)=>new THREE.CylinderGeometry(r,r,l,10);
kp(0,.06,.025,.3,0,.062,-.22,dk);kp(0,.02,.03,.03,0,.088,-.1,dk);kp(0,.082,.08,.3,0,-.005,-.52,dk2);kp(0,.05,.02,.28,0,.05,-.52,dk);kp(0,.07,.035,.26,0,-.07,-.52,dk);
kp(0,.078,.012,.2,0,.03,-.22,tl);kp(cyl(.014,.3),0,0,0,0,.005,-.82,dk,Math.PI/2);kp(cyl(.022,.08),0,0,0,0,.005,-.98,dk,Math.PI/2);kp(cyl(.03,.014),0,0,0,0,.005,-.92,dk,Math.PI/2);
kp(0,.012,.05,.012,0,.07,-.78,dk);kp(0,.03,.03,.04,0,.045,-.78,dk);kp(0,.045,.17,.07,0,-.135,-.2,cu,.28);kp(0,.045,.14,.07,0,-.255,-.13,cu,.62);
kp(0,.04,.11,.055,0,-.115,-.02,dk2,-.32);kp(0,.06,.12,.26,0,-.01,.16,dk2);kp(0,.064,.17,.04,0,-.02,.31,dk2);kp(0,.062,.03,.2,0,.06,.12,dk);
knG.visible=false;knG.position.z=.08;gun.add(knG);
const _sg=setGun;setGun=function(){_sg();const k=cw().k;vmpG.visible=k=='VMP';knG.visible=k=='AR';if(k=='VMP'){gb.scale.set(.08,.1,.42);gb.position.set(0,0,-.25);gf.position.z=-.62}if(k=='AR'){gb.scale.set(.075,.1,.34);gb.position.set(0,0,-.22);gf.position.z=-1}};
