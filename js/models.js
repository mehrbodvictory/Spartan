/* ===================== models.js ===================== */
/* ---------- detailed weapon models for the guns that used to be five blocks: KN-115, SMG, Battle Rifle, Machine Pistol, Sniper Rifle, Rocket Launcher and RayGun.
   Every model is built to be seen from any side (both flanks, top, underside, front and back): rounded barrels, trigger guards and triggers, ejection ports, rails,
   vents, stocks with pads, magazines with base plates, charging handles. Camo material rm replaces the body parts. Built along +z, muzzle at about z = length. ---------- */
function gunKit(g,rm){const cache={},M=c=>cache[c]||(cache[c]=new THREE.MeshLambertMaterial({color:c})),E=c=>cache['e'+c]||(cache['e'+c]=new THREE.MeshBasicMaterial({color:c})),
 add=(m,x,y,z,rx,ry,rz)=>{m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m};
 return{M,E,body:rm,
  box:(w,h,d,x,y,z,mat,rx,ry,rz)=>{const m=new THREE.Mesh(bg,mat);m.scale.set(w,h,d);return add(m,x,y,z,rx,ry,rz)},
  cyl:(r,len,x,y,z,mat,rf,seg)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rf==null?r:rf,r,len,seg||14),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  cylY:(r,h,x,y,z,mat,rx,rz,rt)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt==null?r:rt,r,h,12),mat);return add(m,x,y,z,rx,0,rz)},
  cone:(r,len,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,len,10),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  sph:(r,x,y,z,mat,sx,sy,sz)=>{const m=new THREE.Mesh(sg,mat);m.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));return add(m,x,y,z)},
  ring:(r,t,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,16),mat);return add(m,x,y,z)}}}
const MODELS={};
/* ---- KN-115: AK-style rifle: tri-prong muzzle, gas tube, rail handguard, curved copper magazine, angular stock ---- */
MODELS.AR=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x3a4a52),dk=M(0x1b1d21),gm=M(0x2b2e33),cu=M(0xb8651f),steel=M(0x8a9098),teal=k.E(0x3fd0c9),mags=[];
 k.box(.072,.1,.5,0,0,.2,body);k.box(.066,.03,.46,0,.062,.2,gm);k.box(.012,.05,.07,.04,-.01,.18,dk);k.box(.006,.03,.12,.038,.02,.1,steel);k.box(.02,.016,.04,.04,.03,.04,steel);   /* receiver, cover, ejection port, bolt handle */
 k.box(.05,.012,.28,0,.076,.52,gm);for(let i=0;i<8;i++)k.box(.054,.008,.012,0,.084,.4+i*.035,dk);                                                                        /* rail with teeth */
 k.box(.08,.095,.3,0,.0,.62,body);k.box(.082,.02,.3,0,-.052,.62,cu);for(let i=0;i<4;i++){k.box(.084,.012,.03,0,.015,.52+i*.07,dk)}                                 /* handguard + copper accents */
 k.cyl(.016,.4,0,.062,.66,steel);k.cyl(.013,.5,0,.01,.82,dk);k.cyl(.02,.06,0,.01,.7,gm);                                                                         /* gas tube, barrel, gas block */
 k.cyl(.024,.07,0,.01,1.0,gm);for(const a of[0,2.094,4.189])k.cone(.007,.05,Math.cos(a)*.017,.01+Math.sin(a)*.017,1.06,dk);k.cyl(.028,.012,0,.01,.975,cu);               /* tri-prong muzzle */
 k.box(.014,.05,.014,0,.045,.92,dk);k.box(.004,.02,.004,0,.07,.92,teal);                                                                                              /* front sight post */
 for(let i=0;i<4;i++){const y=-.06-i*.045,z=.26+Math.sin(i*.28)*.04+i*.012,m=k.box(.048,.05,.075,0,y,z,cu,.1*i);mags.push(m)}mags.push(k.box(.054,.014,.08,0,-.255,.31,dk,.34));       /* curved copper magazine */
 k.box(.044,.14,.06,0,-.125,.02,dk,.32);k.box(.05,.02,.07,0,-.2,-.03,gm,.32);k.box(.058,.01,.1,0,-.058,.11,gm);k.box(.004,.028,.1,0,-.072,.115,dk);k.box(.01,.03,.012,0,-.075,.14,steel);   /* grip, trigger guard, trigger */
 k.box(.056,.1,.05,0,0,-.075,gm);k.box(.04,.04,.3,0,.03,-.26,body);k.box(.04,.06,.24,0,-.06,-.25,body,.12);k.box(.05,.11,.04,0,-.02,-.4,dk);k.box(.05,.02,.06,0,.045,-.4,gm);k.box(.03,.05,.14,0,-.04,-.16,gm); /* stock */
 g.userData.a={r:[0,-.12,.02],l:[0,-.07,.66],m:[0,-.12,.3]};g.userData.mags=mags;mkSights(g,{st:'kn',ap:1,yt:.112,yb:.0885,yf:.1,zr:.04,zf:.92});return g};
/* ---- SMG: compact, ventilated shroud, vertical foregrip, folding wire stock, long stick magazine ---- */
MODELS.SMG=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x5a4a40),dk=M(0x17181b),gm=M(0x2d2f34),steel=M(0x8a9098),mags=[];
 k.box(.07,.095,.34,0,0,.18,body);k.box(.066,.022,.3,0,.056,.18,gm);k.box(.004,.034,.09,.036,.01,.14,dk);k.box(.014,.014,.04,.038,.025,.07,steel);
 k.cyl(.04,.28,0,.005,.48,gm);for(let i=0;i<5;i++){k.box(.082,.012,.02,0,.005,.38+i*.045,dk);k.box(.012,.05,.02,.04,.005,.38+i*.045,dk);k.box(.012,.05,.02,-.04,.005,.38+i*.045,dk)}
 k.cyl(.014,.14,0,.005,.66,dk);k.cyl(.022,.08,0,.005,.7,dk);k.cyl(.026,.02,0,.005,.745,gm);
 k.box(.05,.012,.28,0,.068,.3,gm);k.box(.04,.12,.04,0,-.1,.08,dk,.3);k.box(.045,.02,.05,0,-.165,.04,gm,.3);k.box(.05,.008,.08,0,-.052,.2,gm);k.box(.004,.026,.07,0,-.066,.205,dk);k.box(.01,.026,.01,0,-.068,.225,steel);
 mags.push(k.box(.036,.2,.062,0,-.17,.24,dk,.04));mags.push(k.box(.04,.016,.066,0,-.274,.236,gm,.04));k.box(.03,.09,.036,0,-.082,.42,gm);k.cylY(.016,.07,0,-.12,.4,dk);
 k.box(.014,.014,.2,.025,.01,-.18,steel);k.box(.014,.014,.2,-.025,.01,-.18,steel);k.box(.06,.1,.02,0,-.01,-.29,gm);k.box(.07,.02,.04,0,.05,-.29,dk);k.box(.014,.12,.014,.03,-.03,-.22,steel,.3);k.box(.014,.12,.014,-.03,-.03,-.22,steel,.3);
 g.userData.a={r:[0,-.12,.06],l:[0,-.1,.42],m:[0,-.17,.24]};g.userData.mags=mags;mkSights(g,{st:MODELS._st||'ghost',ap:1,yt:.118,yb:.0785,yf:.0785,zr:.1,zf:.54});return g};
/* ---- Battle Rifle: long rounded handguard, flash hider, thumbhole-style stock, straight 20 round magazine, rear leaf sight ---- */
MODELS.BR=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x2f4a3a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),wood=M(0x4a3a2a),mags=[];
 k.box(.078,.108,.46,0,0,.2,body);k.box(.072,.028,.42,0,.06,.2,gm);k.box(.004,.04,.1,.04,.012,.16,dk);k.box(.016,.014,.05,.042,.03,.07,steel);
 k.cyl(.04,.46,0,.002,.68,body);for(let i=0;i<6;i++){k.box(.012,.04,.024,.04,.01,.5+i*.07,dk);k.box(.012,.04,.024,-.04,.01,.5+i*.07,dk)}k.cyl(.043,.02,0,.002,.46,gm);k.cyl(.043,.02,0,.002,.9,gm);
 k.cyl(.015,.22,0,.004,1.0,dk);k.cyl(.024,.12,0,.004,1.08,gm);for(let i=0;i<3;i++)k.box(.054,.008,.018,0,.004,1.04+i*.03,dk);k.cyl(.02,.014,0,.004,1.15,dk);
 k.box(.04,.018,.4,0,.078,.52,gm);k.box(.03,.05,.03,0,.1,.18,gm);k.box(.04,.12,.05,0,-.1,.05,dk,.32);k.box(.05,.02,.06,0,-.165,0,gm,.32);k.box(.008,.03,.1,0,-.07,.14,steel);k.box(.01,.028,.012,0,-.07,.17,steel);
 mags.push(k.box(.04,.15,.1,0,-.13,.24,gm,.05));mags.push(k.box(.044,.016,.104,0,-.215,.236,dk,.05));
 k.box(.06,.12,.05,0,.01,-.02,gm);k.box(.05,.09,.36,0,.0,-.26,wood);k.box(.05,.06,.2,0,-.085,-.16,wood,.05);k.box(.054,.13,.04,0,-.02,-.46,dk);k.box(.044,.04,.15,0,.075,-.28,wood);
 g.userData.a={r:[0,-.12,.04],l:[0,-.07,.68],m:[0,-.13,.24]};g.userData.mags=mags;mkSights(g,{st:'leaf',ap:1,yt:.12,yb:.0885,yf:.0885,zr:.06,zf:.9});return g};
/* ---- Machine Pistol: boxy slide with serrations, short barrel, extended stick magazine, folding stabiliser, small front grip ---- */
MODELS.MP=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x3a3a4a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),mags=[];
 k.box(.052,.07,.34,0,.02,.14,body);k.box(.056,.014,.3,0,.062,.14,gm);for(let i=0;i<6;i++)k.box(.058,.05,.01,0,.025,.03+i*.016,dk);k.box(.004,.03,.08,.027,.03,.15,dk);
 k.box(.044,.04,.28,0,-.034,.17,gm);k.cyl(.012,.1,0,.03,.37,dk);k.cyl(.018,.05,0,.03,.4,gm);
 k.box(.04,.11,.052,0,-.09,.02,dk,.22);k.box(.044,.014,.06,0,-.15,-.01,gm,.22);k.box(.006,.022,.07,0,-.058,.12,dk);k.box(.01,.022,.01,0,-.058,.14,steel);k.box(.03,.014,.065,0,-.04,.075,gm);
 mags.push(k.box(.032,.19,.052,0,-.14,.17,dk,.02));mags.push(k.box(.036,.014,.056,0,-.24,.168,gm,.02));k.box(.024,.07,.03,0,-.07,.3,gm);k.cylY(.014,.05,0,-.1,.28,dk);
 k.box(.012,.012,.14,.02,.03,-.02,steel);k.box(.012,.012,.14,-.02,.03,-.02,steel);k.box(.05,.05,.014,0,.03,-.1,gm);
 g.userData.a={r:[0,-.1,.02],l:[0,-.08,.3],m:[0,-.14,.17]};g.userData.mags=mags;mkSights(g,{st:'u',ap:0,yt:.1,yb:.0765,yf:.0765,zr:.05,zf:.34});return g};
/* ---- Sniper Rifle: heavy barrel with muzzle brake, bolt with ball handle, full length stock with cheek rest, scope with lens caps, folded bipod ---- */
MODELS.SN=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x2a2f4a),dk=M(0x111316),gm=M(0x2b2e33),steel=M(0x8a9098),lens=k.E(0x6ab0ff),mags=[];
 k.box(.07,.1,.5,0,0,.22,body);k.box(.066,.024,.46,0,.06,.22,gm);k.box(.004,.034,.1,.036,.02,.2,dk);k.cyl(.007,.1,.07,.03,.12,steel);k.sph(.018,.07,.03,.06,steel);
 k.cyl(.024,.7,0,.012,.8,dk);k.cyl(.034,.4,0,.012,.52,body);k.cyl(.022,.1,0,.012,1.18,gm);for(let i=0;i<3;i++)k.box(.054,.006,.016,0,.012,1.14+i*.032,dk);k.cyl(.026,.012,0,.012,1.1,gm);
 /* scope on two rings: tube, bells, lens, turrets */
 k.cyl(.027,.34,0,.11,.36,gm);k.cyl(.036,.1,0,.11,.2,gm,.027);k.cyl(.04,.1,0,.11,.52,gm,.027);k.cyl(.033,.006,0,.11,.2,lens);k.cyl(.036,.006,0,.11,.57,lens);k.cylY(.01,.04,0,.14,.36,dk);k.cylY(.01,.04,.034,.11,.36,dk,0,Math.PI/2);
 for(const z of[.26,.46]){k.box(.01,.05,.024,.02,.075,z,gm);k.box(.01,.05,.024,-.02,.075,z,gm);k.box(.05,.012,.024,0,.052,z,dk)}
 k.box(.04,.12,.052,0,-.1,.04,dk,.3);k.box(.05,.018,.06,0,-.165,0,gm,.3);k.box(.008,.03,.1,0,-.066,.16,steel);
 mags.push(k.box(.04,.12,.07,0,-.1,.28,dk,.04));mags.push(k.box(.044,.014,.074,0,-.165,.278,gm,.04));
 k.box(.06,.12,.06,0,.0,-.04,gm);k.box(.05,.11,.4,0,.0,-.28,body);k.box(.04,.04,.24,0,.07,-.27,body);k.box(.06,.16,.04,0,-.02,-.5,dk);k.box(.044,.07,.18,0,-.075,-.2,body,.1);
 for(const s of[-1,1]){k.cylY(.006,.18,s*.04,-.05,.62,steel,.55,s*.18);k.box(.012,.02,.02,s*.036,-.025,.6,dk)}
 g.userData.a={r:[0,-.12,.04],l:[0,-.07,.72],m:[0,-.1,.28]};g.userData.mags=mags;return g};
/* ---- Rocket Launcher: shoulder tube with flared rear, loaded warhead, sights, two grips, vents, strap rings ---- */
MODELS.RL=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x7a3a2a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),red=M(0xc0392b),oli=M(0x4a5030);
 k.cyl(.07,.98,0,0,.42,body);k.cyl(.078,.12,0,0,.0,gm,.1);k.cyl(.1,.06,0,0,-.08,gm,.078);k.cyl(.076,.06,0,0,.92,gm);k.cyl(.065,.02,0,0,.95,dk);
 k.cone(.05,.16,0,0,1.07,red);k.cyl(.05,.12,0,0,.96,oli,.05);for(const a of[0,1.571,3.142,4.712])k.box(.006,.012,.06,Math.cos(a)*.05,Math.sin(a)*.05,.93,gm);
 for(let i=0;i<4;i++)k.ring(.072,.006,0,0,.2+i*.2,steel).rotation.y=0;
 k.box(.1,.04,.18,0,.085,.25,dk);k.box(.03,.05,.02,0,.12,.25,steel);k.cylY(.01,.1,0,.14,.55,dk);k.box(.06,.012,.1,0,.09,.5,gm);
 k.box(.044,.14,.06,0,-.12,.2,dk,.3);k.box(.05,.02,.07,0,-.195,.17,gm,.3);k.box(.006,.03,.1,0,-.085,.27,steel);k.box(.01,.03,.012,0,-.085,.31,steel);
 k.box(.04,.1,.04,0,-.12,.62,dk);k.box(.05,.02,.07,0,-.18,.62,gm);for(let i=0;i<5;i++)k.box(.012,.016,.04,.07,.02,.12+i*.07,dk);
 k.box(.12,.14,.04,0,0,-.12,gm);k.box(.13,.16,.02,0,0,-.16,dk);k.cylY(.016,.03,.07,.05,.4,steel,0,Math.PI/2);k.cylY(.016,.03,-.07,.05,.4,steel,0,Math.PI/2);
 g.userData.a={r:[0,-.12,.2],l:[0,-.11,.62],m:[0,0,-.04]};g.userData.mags=[];mkSights(g,{st:'rl',ap:1,yt:.138,yb:.105,yf:.105,zr:.12,zf:1.0});return g};
/* ---- RayGun: rounded alien pistol, fins, glowing emitter and cell, brass fittings ---- */
MODELS.RG=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0xb02a22),dk=M(0x2a1a18),brass=M(0xc9a94d),glow=k.E(0xff3030),glow2=k.E(0xffb060),steel=M(0xaaaaaa),mags=[];
 k.sph(.07,0,0,.12,body,1.1,1,1.8);k.cyl(.045,.3,0,.01,.28,body,.032);k.cyl(.055,.07,0,.01,.12,brass);k.cyl(.058,.02,0,.01,.18,dk);k.cyl(.036,.1,0,.01,.46,brass,.045);k.cyl(.04,.03,0,.01,.52,glow2,.046);k.ring(.06,.01,0,.01,.5,brass).rotation.y=0;
 for(const a of[0,1.571,3.142,4.712]){k.box(.01,.06,.12,Math.cos(a)*.052,.01+Math.sin(a)*.052,.3,body,0,0,a);k.box(.012,.02,.05,Math.cos(a)*.062,.01+Math.sin(a)*.062,.4,brass,0,0,a)}
 k.cyl(.02,.2,0,.012,.3,glow,.016);for(let i=0;i<4;i++)k.ring(.04+i*.004,.005,0,.01,.22+i*.05,glow2);
 k.box(.046,.14,.06,0,-.11,.04,body,-.25);k.box(.05,.02,.07,0,-.18,.02,brass,-.25);k.box(.006,.03,.08,0,-.064,.12,dk);k.box(.01,.03,.012,0,-.064,.14,brass);k.sph(.02,0,-.2,.0,glow);
 mags.push(k.cylY(.024,.07,0,.092,.15,glow,0,0));mags.push(k.cylY(.027,.014,0,.13,.15,brass));k.sph(.05,0,.1,.15,body,1,.5,1.3);k.cyl(.03,.05,0,.1,-.03,brass);k.box(.14,.1,.04,0,.02,-.06,body);
 g.userData.a={r:[0,-.1,.06],l:[0,-.04,.28],m:[0,.1,.15],pd:[0,.24,0],ho:[0,0,0]};g.userData.mags=mags;return g};


/* ---- VMP-X: the SMG frame in black with gold plates, a fat round muzzle device and the hooded sights of its first-person model ---- */
MODELS.VMP=function(g,rm){MODELS._st='vmp';const k=gunKit(g,rm),gold=k.M(0xc9a94d);MODELS.SMG(g,rm||k.M(0x23262b));MODELS._st=0;
 k.box(.074,.03,.16,0,.035,.34,gold);k.box(.074,.02,.12,0,-.04,.16,gold);k.cyl(.034,.1,0,.005,.8,k.M(0x15171a));k.cyl(.038,.012,0,.005,.76,gold);k.cyl(.03,.012,0,.005,.85,gold);return g};
