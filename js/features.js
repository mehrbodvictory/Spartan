/* ---------- Call of Duty x Halo features: melee, radar, killstreaks, power weapons, pickups, XP ranks, kill feed ---------- */
W.RL={n:'Rocket Launcher',d:1,r:1.1,m:2,sp:.002,rc:8,pel:1,au:0,rl:2.5,len:.7,col:0x7a3a2a,ex:{R:7,d:140,imp:0,w:'RL'}};
W.SN={n:'Sniper Rifle',d:95,r:.9,m:4,sp:.0005,rc:6,pel:1,au:0,rl:3,len:.8,col:0x2a2f4a};
const PN={RL:'Rocket Launcher',SN:'Sniper Rifle',OS:'Overshield',HP:'Health',AM:'Ammo'},PC={RL:0xff5a3a,SN:0xb080ff,OS:0x62e0f0,HP:0x7bd86b,AM:0xffd24a},TITLES=['Recruit','Private','Corporal','Sergeant','Lieutenant','Captain','Major','Colonel','General','Spartan'];
let pk=[],ks=0,q=[],uav=0,mxp=0,mn=0,src='';
function featReset(){for(const p of pk)S.remove(p.m);pk=[];ks=0;q=[];uav=0;mxp=0;mUps=[];mn=0;$('#kf').innerHTML='';
 for(const t of['RL','SN','OS','HP','AM','AM']){const[x,z]=spawnPt(0),m=new THREE.Group(),b=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:PC[t]}));b.scale.setScalar(.6);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,6,8),new THREE.MeshBasicMaterial({color:PC[t],transparent:true,opacity:.18}));beam.position.y=3;m.add(b,beam);m.position.set(x,1,z);S.add(m);pk.push({t,x,z,m,b,on:1,rt:0,col:'#'+PC[t].toString(16).padStart(6,'0')})}}
function giveOS(){if(!P.os)P.msh+=50;P.os=20;P.sh=P.msh}
function grab(p){const t=p.t;p.on=0;p.m.visible=false;p.rt=t=='RL'||t=='SN'?45:25;beep(900,.12,'triangle',.08);msg(PN[t],1.2);
 if(t=='OS')giveOS();else if(t=='HP')P.hp=Math.min(100,P.hp+50);else if(t=='AM'){for(const w of wp)if(!w.pw){w.mag=w.m;w.res=w.m*4}}
 else{let i=wp.findIndex(w=>w.k==t);if(i<0){wp.push({k:t,...eff(t,[]),pw:1,mag:0,res:0});i=wp.length-1}const w=wp[i];w.mag=w.m;w.res=w.m*2;cur=i;rel=0;setGun()}}
function feed(t){const e=document.createElement('div');e.textContent=t;$('#kf').prepend(e);while($('#kf').children.length>4)$('#kf').lastChild.remove();setTimeout(()=>e.remove(),4500)}
function featKill(b,head){ks++;wkill(srcK);const x=100+(head?50:0)+Math.min(streak,5)*10;mxp+=x;giveXP(x);feed(`You ▸ ${b.net?names[b.id]:'Grunt'}  [${src}]${head?' ★':''}  +${x}`);
 if(ks==3-hl()){q.push('UAV');msg('UAV ready: press E',2)}if(ks==5-hl()){q.push('Airstrike');msg('Airstrike ready: press E',2)}if(ks==8-hl()){q.push('Shield Boost');msg('Shield Boost ready: press E',2)}}
function useStreak(){if(!q.length||P.dead)return;const s=q.shift();beep(500,.2,'sine',.1);
 if(s=='UAV'){uav=20;msg('UAV online',1.5)}else if(s=='Shield Boost'){giveOS();msg('Shield Boost!',1.5)}
 else{const o=C.position.clone(),d=aimDir(),t=castW(o,d,90),c=o.clone().add(d.multiplyScalar(t));msg('Airstrike inbound',1.5);for(let i=0;i<8;i++)setTimeout(()=>{if(!run)return;const p=V(c.x+(Math.random()-.5)*14,.3,c.z+(Math.random()-.5)*14);tr(V(p.x,45,p.z),V(0,-1,0),45,0xffa040,.25);boom(p,{R:6,d:150})},1200+i*260)}}
function melee(){if(t0<mn||P.dead)return;mn=t0+.6;src='Melee';srcK='';gun.position.z=-1.05;noise(.08,1200,.25);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));mv(P,f.x*.9,f.z*.9,.4);kick+=.03;shake=Math.max(shake,.3);
 for(const b of bots){if(!b.al||ally(b))continue;const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);if(D<2.6&&(dx*f.x+dz*f.z)/D>.3){hitBot(b,75,0);break}}}
function dirInd(b){if(!b)return;lastDir.set(P.x-b.x,0,P.z-b.z).normalize();const r=Math.atan2(b.x-P.x,b.z-P.z)-(yaw+Math.PI),e=$('#di');e.style.transform=`rotate(${r}rad)`;e.style.animation='none';void e.offsetWidth;e.style.animation='di 1s forwards'}
function radar(){const c=$('#rd').getContext('2d'),R0=uav>0?70:28,k=72/R0,s=Math.sin(yaw),co=Math.cos(yaw);c.clearRect(0,0,150,150);c.fillStyle='rgba(8,20,26,.65)';c.beginPath();c.arc(75,75,73,0,7);c.fill();c.strokeStyle=uav>0?'#62e0f0':'#62e0f044';c.beginPath();c.arc(75,75,36,0,7);c.stroke();
 const dot=(x,z,col,r)=>{const dx=x-P.x,dz=z-P.z,px=75+(dx*co-dz*s)*k,py=75-(-dx*s-dz*co)*k;if(Math.hypot(px-75,py-75)>70)return;c.fillStyle=col;c.fillRect(px-r,py-r,r*2,r*2)};
 for(const p of pk)if(p.on)dot(p.x,p.z,p.col,2);for(const f of flags)dot(f.x,f.z,f.team=='A'?'#62a8ff':'#ff5a3a',4);for(const b of bots)if(b.al)dot(b.x,b.z,ally(b)?'#62e0f0':'#ff5a3a',3);c.fillStyle='#62e0f0';c.beginPath();c.moveTo(75,68);c.lineTo(70,80);c.lineTo(80,80);c.fill()}
function featTick(dt){uav-=dt;if(P.os>0){P.os-=dt;if(P.os<=0){P.msh-=50;P.sh=Math.min(P.sh,P.msh)}}
 for(const p of pk){if(p.on){p.m.rotation.y+=dt*2;p.m.position.y=1+Math.sin(t0*3)*.15;if(!P.dead&&Math.hypot(P.x-p.x,P.z-p.z)<1.3&&P.y<2.5)grab(p)}else{p.rt-=dt;if(p.rt<=0){p.on=1;p.m.visible=true}}}
 const w=cw();if(w&&w.pw&&w.mag<=0&&w.res<=0&&rel<=0){wp.splice(cur,1);cur=0;setGun()}
 ksHud();radar();camoFx()}
