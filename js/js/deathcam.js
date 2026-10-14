/* ---------- third-person death camera with ragdoll body ---------- */
let rag=[],camA=0;const lastDir=V(0,0,0);
function startDeath(){endDeath();camA=yaw;const c=V(P.x,P.y,P.z),cs=Math.cos(yaw),sn=Math.sin(yaw),dir=lastDir.lengthSq()>0?lastDir.clone():V(Math.random()-.5,0,Math.random()-.5).normalize();
 for(const[w,h,d,x,y,col]of[[.8,1.1,.5,0,.95,0x3d6ad6],[.4,.4,.4,0,1.75,0x2a2f35],[.25,.8,.25,-.55,1,0x3d6ad6],[.25,.8,.25,.55,1,0x3d6ad6],[.3,.8,.3,-.2,.4,0x2a2a3a],[.3,.8,.3,.2,.4,0x2a2a3a]]){
  const m=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:col}));m.scale.set(w,h,d);m.position.set(c.x+x*cs,c.y+y,c.z-x*sn);m.rotation.y=yaw;S.add(m);
  rag.push({m,hh:Math.min(w,h,d)/2,v:dir.clone().multiplyScalar(4+Math.random()*3).add(V((Math.random()-.5)*2,4+Math.random()*3,(Math.random()-.5)*2)),av:V((Math.random()-.5)*9,(Math.random()-.5)*5,(Math.random()-.5)*9)})}}
function endDeath(){for(const p of rag)S.remove(p.m);rag=[];gun.visible=true;lastDir.set(0,0,0)}
function deathCam(dt){gun.visible=false;for(const p of rag){p.v.y-=20*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=p.av.x*dt;p.m.rotation.y+=p.av.y*dt;p.m.rotation.z+=p.av.z*dt;
  if(p.m.position.y<p.hh){p.m.position.y=p.hh;p.v.y*=-.25;p.v.x*=.7;p.v.z*=.7;p.av.multiplyScalar(.6)}p.av.multiplyScalar(1-dt*1.2)}
 if(!rag.length)return;const t=rag[0].m.position;camA+=dt*.5;C.position.set(t.x+Math.sin(camA)*4.5,t.y+2.4,t.z+Math.cos(camA)*4.5);C.lookAt(t.x,t.y+.4,t.z)}
