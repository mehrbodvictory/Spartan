/* ---------- VMP: very fast SMG with a custom model (long mag, top rail, toothed muzzle drum, gold accents) ---------- */
W.VMP={n:'VMP',d:5,r:.042,m:36,sp:.03,rc:.5,pel:1,au:1,rl:1.8,len:.55,col:0x23262b};PRI.push('VMP');
const vmpG=new THREE.Group(),dk=new THREE.MeshLambertMaterial({color:0x15171a}),gd=new THREE.MeshLambertMaterial({color:0xc9a94d});
const bp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;vmpG.add(p)};
bp(0,.06,.035,.38,0,.072,-.27,dk);bp(0,.02,.04,.02,0,.11,-.12,dk);bp(0,.015,.05,.015,0,.115,-.46,dk);bp(0,.084,.03,.18,0,.03,-.32,gd);
bp(new THREE.CylinderGeometry(.02,.022,.12,10),0,0,0,0,0,-.6,dk,Math.PI/2);bp(new THREE.CylinderGeometry(.05,.05,.07,12),0,0,0,0,0,-.5,dk,Math.PI/2);
bp(0,.06,.11,.2,0,-.01,.1,dk);bp(0,.04,.12,.05,0,-.1,-.08,dk,.25);bp(0,.04,.22,.065,0,-.2,-.15,dk,.12);bp(0,.042,.025,.067,0,-.13,-.15,gd,.12);
vmpG.visible=false;gun.add(vmpG);
const _sg=setGun;setGun=function(){_sg();const v=cw().k=='VMP';vmpG.visible=v;if(v){gb.scale.set(.08,.1,.42);gb.position.set(0,0,-.25);gf.position.z=-.62}};
