/* ===================== strike.js ===================== */
/* ---------- Airstrike killstreak (8 kills): a bomber crosses the whole map high above you and carpet bombs a long line under its flight path.
   The line goes through the spot you are aiming at, in the direction you are facing, from one edge of the map to the other.
   Your own bombs never hurt you (boom() ignores the player when the blast has own:1) and never hurt teammates. ---------- */
const STR={planes:[],bombs:[],marks:[]};
function mkBomber(){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),body=M(0x555c64),dark=M(0x30343a),wing=M(0x6a7078),red=new THREE.MeshBasicMaterial({color:0xff3a2a}),
 box=(w,h,d,x,y,z,m,rz)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);if(rz)e.rotation.z=rz;e.castShadow=false;g.add(e);return e};
 box(1.7,1.6,11,0,0,0,body);box(1.2,1.2,2.6,0,.1,6.2,body);box(1.5,.9,1.8,0,.55,-3.6,dark);
 box(15,.3,2.8,0,-.15,.6,wing);box(5.4,.22,1.6,0,.1,-5.2,wing);box(.22,2.2,1.6,0,1.3,-5.2,wing);
 for(const x of[-5.2,-2.4,2.4,5.2]){const e=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,2,10),dark);e.rotation.x=Math.PI/2;e.position.set(x,-.25,1.7);g.add(e);const p=box(.12,2.1,.12,x,-.25,2.75,dark);p.userData.prop=1}
 box(.5,.12,.5,-7.3,0,.6,red);box(.5,.12,.5,7.3,0,.6,red);box(2.2,.35,3.8,0,-.95,.2,dark);g.scale.setScalar(1.35);return g}
function carpetBomb(){const o=C.position.clone(),d=aimDir(),t=castW(o,d,90),c=o.clone().add(d.clone().multiplyScalar(Math.min(t,90))),f=V(-Math.sin(yaw),0,-Math.cos(yaw)),
 L=H*1.25,sx=c.x-f.x*L,sz=c.z-f.z*L,ex=c.x+f.x*L,ez=c.z+f.z*L,len=2*L,spd=34,ALT=40;
 msg('Carpet bombing inbound',2);beep(200,.5,'sawtooth',.08);
 /* red warning line on the ground along the run */
 const lg=new THREE.BufferGeometry().setFromPoints([V(sx,.25,sz),V(ex,.25,ez)]),ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xff4a2a}));S.add(ln);STR.marks.push({m:ln,t:2.4});
 const pl=mkBomber();pl.position.set(sx,ALT,sz);pl.rotation.y=Math.atan2(f.x,f.z);S.add(pl);
 STR.planes.push({m:pl,x:sx,z:sz,fx:f.x,fz:f.z,spd,run:0,len,nb:0,acc:0,drone:0,ALT,ox:sx,oz:sz,L:H});noise(1.6,260,.22)}
function bombFall(x,z,ALT,fx,fz){const m=new THREE.Group(),b=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0x2c3036}));b.scale.set(.2,.2,.55);m.add(b);const fin=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:0x7a3a2a}));fin.scale.set(.3,.03,.18);fin.position.z=-.5;m.add(fin);const fin2=fin.clone();fin2.rotation.z=Math.PI/2;m.add(fin2);
 m.position.set(x,ALT-2,z);m.rotation.x=.3;S.add(m);STR.bombs.push({m,x,z,y:ALT-2,vy:0,vx:fx*34,vz:fz*34,tx:x+fx*0,tz:z+fz*0})}
function strikeTick(dt){
 for(let i=STR.marks.length-1;i>=0;i--){const k=STR.marks[i];k.t-=dt;if(k.t<=0){S.remove(k.m);k.m.geometry.dispose();STR.marks.splice(i,1)}}
 for(let i=STR.planes.length-1;i>=0;i--){const p=STR.planes[i];p.run+=p.spd*dt;p.x=p.ox+p.fx*p.run;p.z=p.oz+p.fz*p.run;p.m.position.set(p.x,p.ALT+Math.sin(t0*3)*.15,p.z);p.m.rotation.z=Math.sin(t0*1.7)*.04;
  p.m.traverse(e=>{if(e.userData.prop)e.rotation.z+=dt*40});
  p.drone-=dt;if(p.drone<=0){p.drone=.5;const dd=Math.hypot(p.x-C.position.x,p.z-C.position.z);beep(70+Math.max(0,40-dd*.5),.45,'sawtooth',Math.max(.01,.07*(1-dd/140)))}
  /* release a bomb every .13 s while the plane is inside the map; slight sideways spread so the line is a band */
  if(Math.abs(p.x)<p.L+2&&Math.abs(p.z)<p.L+2){p.acc+=dt;while(p.acc>=.13){p.acc-=.13;const sd=(Math.random()-.5)*5,px=-p.fz,pz=p.fx;bombFall(p.x+px*sd,p.z+pz*sd,p.ALT,p.fx,p.fz)}}
  if(p.run>p.len){S.remove(p.m);STR.planes.splice(i,1)}}
 for(let i=STR.bombs.length-1;i>=0;i--){const b=STR.bombs[i];b.vy-=26*dt;b.y+=b.vy*dt;b.x+=b.vx*dt*Math.max(0,1-b.y/60)*.5;b.z+=b.vz*dt*Math.max(0,1-b.y/60)*.5;b.vx*=Math.exp(-.8*dt);b.vz*=Math.exp(-.8*dt);
  b.m.position.set(b.x,b.y,b.z);b.m.rotation.x=Math.min(1.45,b.m.rotation.x+dt*1.2);
  if(b.y<=.4){S.remove(b.m);STR.bombs.splice(i,1);const p=V(cl(b.x,-H+1,H-1),.3,cl(b.z,-H+1,H-1));boom(p,{R:5,d:140,own:1,c:0xff8a30});if(typeof gfxCrater=='function')gfxCrater(p)}}}
function strikeReset(){for(const p of STR.planes)S.remove(p.m);for(const b of STR.bombs)S.remove(b.m);for(const k of STR.marks)S.remove(k.m);STR.planes=[];STR.bombs=[];STR.marks=[]}
{const _ft=featTick;featTick=function(dt){_ft(dt);strikeTick(dt)};const _fr=featReset;featReset=function(){_fr();strikeReset()}}
