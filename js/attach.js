/* ===================== attach.js ===================== */
/* ---------- attachments that really appear on the weapon: Extended Mag (a longer magazine with a base plate), Compensator (vented muzzle brake), Laser Sight (module on the side with a visible red beam),
   Long Barrel (extended barrel with a sleeve), Fast Hands (rubber wraps on the grip and handguard, a thumb rest), Hollow Point (orange tipped rounds showing in the magazine) and
   Quickdraw Grip (angled foregrip). They are added to whichever model is in use (first person, the loadout and customize previews, other players) and follow the weapon. ---------- */
const ATT_MAT={};
function attM(c,e){const k=c+(e?'e':'');return ATT_MAT[k]||(ATT_MAT[k]=e?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}))}
function attsFor(k){return k==L.p?L.pa:k==L.s?L.sa:[]}
/* y of the barrel at the muzzle, measured from the model itself: the mean height of the parts that reach the front */
function attMuzzle(g,dir){const bb=new THREE.Box3().setFromObject(g),tip=dir>0?bb.max.z:bb.min.z;let sy=0,n=0;const tmp=new THREE.Box3();g.traverse(m=>{if(!m.isMesh||m.userData.att)return;tmp.setFromObject(m);const ft=dir>0?tmp.max.z:tmp.min.z;if(Math.abs(ft-tip)<.045&&(tmp.max.x-tmp.min.x)<.12){sy+=(tmp.min.y+tmp.max.y)/2;n++}});return{tip,y:n?sy/n:(bb.min.y+bb.max.y)/2,bb}}
function attRemove(g){for(let i=g.children.length-1;i>=0;i--)if(g.children[i].userData.att)g.remove(g.children[i])}
function attApply(g,k,list,dir){if(!g)return;attRemove(g);if(!list||!list.length)return;dir=dir||1;const A_=g.userData.a||{},mz=attMuzzle(g,dir),G=new THREE.Group();G.userData.att=1;
 const box=(w,h,d,x,y,z,m,rx)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);if(rx)e.rotation.x=rx;e.userData.att=1;G.add(e);return e},
  cyl=(r,len,x,y,z,m,rf)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rf==null?r:rf,r,len,14),m);e.rotation.x=Math.PI/2;e.position.set(x,y,z);e.userData.att=1;G.add(e);return e},
  sph=(r,x,y,z,m)=>{const e=new THREE.Mesh(sg,m);e.scale.setScalar(r);e.position.set(x,y,z);e.userData.att=1;G.add(e);return e},
  mag=A_.m||[0,mz.bb.min.y+.1,(mz.bb.min.z+mz.bb.max.z)/2],grip=A_.r||[0,mz.bb.min.y+.1,0],fore=A_.l||[0,mz.y-.04,mz.tip-dir*.25],dk=attM(0x17181b),gm=attM(0x2d2f34),steel=attM(0x9aa0a8),org=attM(0xd9822b),red=attM(0xff2a20,1);
 let tip=mz.tip;
 if(list.includes('Long Barrel')){cyl(.017,.2,0,mz.y,tip+dir*.1,steel);cyl(.026,.07,0,mz.y,tip+dir*.035,gm);cyl(.022,.012,0,mz.y,tip+dir*.205,dk);tip+=dir*.2}
 if(list.includes('Compensator')){cyl(.027,.085,0,mz.y,tip+dir*.0425,gm);for(let i=0;i<3;i++){box(.03,.008,.012,0,mz.y+.0,tip+dir*(.015+i*.02),dk);cyl(.0285,.006,0,mz.y,tip+dir*(.012+i*.024),steel)}box(.056,.006,.04,0,mz.y+.027,tip+dir*.04,dk);box(.056,.006,.04,0,mz.y-.027,tip+dir*.04,dk)}
 if(list.includes('Extended Mag')){const h=.12;box(.05,h,.082,mag[0],mag[1]-.1-h/2,mag[2]+.004,attM(0x222428),.06*dir);box(.056,.016,.09,mag[0],mag[1]-.1-h-.008,mag[2]+.008,org,.06*dir);for(let i=0;i<3;i++)box(.052,.004,.084,mag[0],mag[1]-.12-i*.034,mag[2]+.006,gm)}
 if(list.includes('Hollow Point')){for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.007,.02,8),org);c.position.set(mag[0]+(i-1.5)*.011,mag[1]+.0,mag[2]+.0);c.userData.att=1;G.add(c)}box(.052,.012,.084,mag[0],mag[1]-.04,mag[2],org);box(.054,.004,.086,mag[0],mag[1]-.06,mag[2],attM(0x3a3a3e))}
 if(list.includes('Laser Sight')){const sx=-.055,sz=fore[2]-dir*.02,sy=fore[1]+.045;box(.024,.03,.07,sx,sy,sz,dk);box(.012,.012,.018,sx,sy,sz+dir*.04,red);box(.03,.008,.05,sx+.004,sy+.018,sz,gm);
  /* faint visible beam */
  const bm=new THREE.Mesh(new THREE.CylinderGeometry(.0016,.0016,14,6),new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.28,depthWrite:false}));bm.rotation.x=Math.PI/2;bm.position.set(sx,sy,sz+dir*7.04);bm.userData.att=1;G.add(bm)}
 if(list.includes('Fast Hands')){const rub=attM(0x0e0f10);box(.06,.07,.075,grip[0],grip[1]-.02,grip[2]+.0,rub);for(let i=0;i<4;i++)box(.064,.004,.078,grip[0],grip[1]-.045+i*.018,grip[2],gm);box(.066,.04,.012,grip[0],grip[1]+.015,grip[2]+dir*.045,gm);
  box(.09,.05,.1,fore[0],fore[1]+.002,fore[2],rub);for(let i=0;i<3;i++)box(.094,.004,.104,fore[0],fore[1]-.018+i*.018,fore[2],gm);box(.02,.03,.04,fore[0]+.05,fore[1]+.01,fore[2]+dir*.02,rub)}
 if(list.includes('Quickdraw Grip')){const x=fore[0],y=fore[1]-.045,z=fore[2];const a=new THREE.Mesh(new THREE.CylinderGeometry(.015,.019,.12,12),dk);a.position.set(x,y-.04,z+dir*.015);a.rotation.x=.32*dir;a.userData.att=1;G.add(a);box(.04,.02,.07,x,y+.01,z,gm);box(.044,.012,.03,x,y-.1,z+dir*.04,org);for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.017,.0025,6,12),gm);r.position.set(x,y-.025-i*.025,z+dir*(.015+i*.008));r.rotation.x=Math.PI/2+.32*dir;r.userData.att=1;G.add(r)}}
 g.add(G)}
/* first-person model currently in use for weapon k (the AR, VMP and RG have hand-built models, everything else uses fpG) */
function attFpModel(k){return k=='AR'?knG:k=='VMP'?vmpG:k=='RG'?rgG:fpG}
function attRefresh(){const w=cw();if(!w)return;const g=attFpModel(w.k);if(!g)return;attApply(g,w.k,attsFor(w.k),(w.k=='AR'||w.k=='VMP'||w.k=='RG')?-1:1)}
{const _sg=setGun;setGun=function(){_sg.apply(this,arguments);try{attRefresh()}catch(e){}}}
