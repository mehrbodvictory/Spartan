/* ===================== weapons.js ===================== */
/* ---------- MVR-67: full-auto assault rifle (unlocked from the start). Excellent accuracy and range, offset by a slower rate of fire.
   Model built from boxes: bronze receiver and M-LOK handguard, black lower, flip-up sights on a top rail, vented muzzle brake,
   amber magazine and an angular folding-style stock with a cheek riser. Built along +z, muzzle at z=.98 ---------- */
W.MVR={n:'MVR-67',d:33,r:.088,m:30,sp:.008,rc:1.15,pel:1,au:1,rl:2.3,len:.7,col:0x8f6e3e};
PRI.splice(1,0,'MVR');WG.MVR=[1,0x8f6e3e,1,0xffb060];RLK.MVR='mag';BOTGUNS.push('MVR');
function mkMVR(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),tan=rm||M(0x8f6e3e),blk=M(0x15171a),dk=M(0x24272c),gr=M(0x3a3e44),amber=M(0xc8782a),olive=M(0x8a8f3a),steel=M(0x8a9098),
  box=(w,h,d,x,y,z,m,rx,ry)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;g.add(o);return o};
 /* receiver */
 box(.088,.108,.5,0,.002,.15,tan);box(.092,.03,.34,0,.045,.16,dk);box(.07,.07,.34,0,-.07,.1,blk);box(.09,.02,.08,0,-.03,.34,blk);
 box(.012,.05,.07,.048,.0,.32,blk);box(.012,.03,.05,.048,.02,.1,gr);box(.01,.05,.016,-.049,.02,.02,gr);
 /* ejection port and charging handle */
 box(.004,.04,.1,.045,.03,.1,blk);box(.022,.02,.05,0,.062,-.04,gr);box(.01,.03,.014,.05,.0,.04,steel);
 /* handguard with M-LOK slots, vents and a rail */
 box(.082,.098,.44,0,.004,.62,tan);box(.084,.03,.44,0,.044,.62,dk);for(let i=0;i<5;i++){box(.086,.012,.04,0,-.012,.46+i*.075,blk);box(.012,.03,.045,.044,.014,.46+i*.075,blk);box(.012,.03,.045,-.044,.014,.46+i*.075,blk)}
 box(.07,.02,.4,0,-.052,.62,blk);box(.03,.03,.1,0,-.07,.7,dk,0);
 /* top rail with teeth */
 box(.03,.02,.92,0,.074,.42,blk);for(let i=0;i<14;i++)box(.034,.008,.012,0,.086,-.02+i*.066,dk);
 /* barrel, gas block and muzzle brake */
 box(.03,.03,.2,0,.01,.94,dk);box(.045,.045,.05,0,.01,.78,gr);box(.054,.056,.12,0,.01,1.0,blk);for(let i=0;i<3;i++){box(.058,.012,.014,0,.012,.96+i*.035,tan)}box(.02,.02,.012,0,.01,1.066,dk);
 /* flip-up sights: rear with an aperture, front with a post */
 mkSights(g,{st:'ap',ap:1,yt:.138,yb:.086,yf:.086,zr:.0,zf:.77,fmat:olive});
 /* grips */
 box(.046,.15,.06,0,-.15,-.06,blk,.3);box(.05,.02,.07,0,-.225,-.09,dk,.3);box(.012,.1,.05,.026,-.14,-.06,gr,.3);box(.012,.1,.05,-.026,-.14,-.06,gr,.3);
 box(.012,.012,.1,0,-.1,.14,dk);box(.012,.04,.012,0,-.085,.2,dk);box(.012,.04,.012,0,-.085,.08,dk);
 box(.05,.02,.07,0,-.056,.5,gr);box(.034,.06,.1,0,-.09,.52,blk);
 /* amber magazine */
 const mg=[box(.046,.2,.08,0,-.17,.2,amber,.12),box(.05,.02,.088,0,-.275,.188,dk,.12)];
 box(.052,.2,.02,0,-.17,.255,blk,.12);
 /* stock: hinge, skeletal arms, cheek riser and butt pad */
 box(.06,.1,.04,0,0,-.13,dk);box(.04,.025,.26,0,.03,-.28,blk);box(.04,.025,.22,0,-.05,-.26,blk,.12);box(.044,.05,.16,0,.062,-.3,gr);box(.05,.13,.04,0,-.01,-.42,dk);box(.056,.03,.05,0,.062,-.42,blk);
 g.userData.a={r:[0,-.14,-.05],l:[0,-.09,.62],m:[0,-.17,.2]};g.userData.mags=mg;return g}
