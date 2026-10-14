/* ---------- game flow ---------- */
function startGame(){buildMap();for(const b of bots)S.remove(b.m);bots=[];for(const f of fx)S.remove(f.m);fx=[];for(const g of grs)S.remove(g.m);grs=[];
 sanitize();AA=+$('#aa').value;sens=+$('#sn').value;mode=sel.mode;kills=deaths=shots=hits=wave=0;tl=90;t0=0;nf=0;trig=0;fresh=0;hmT=0;msT=0;dmA=0;lastHit=-9;
 P={x:0,y:0,z:0,vy:0,hp:100,sh:100,msh:100+(L.pk.includes('Overshield')?50:0),dead:0,on:1};P.sh=P.msh;
 wp=[{k:L.p,...eff(L.p,L.pa)}];if(L.s)wp.push({k:L.s,...eff(L.s,L.sa)});for(const w of wp){w.mag=w.m;w.res=w.m*4}cur=0;rel=0;gc=L.g?2:0;setGun();
 const[x,z]=spawnPt(0);P.x=x;P.z=z;yaw=pitch=kick=0;
 setupBots();
 $('#menu').style.display=$('#end').style.display='none';$('#hud').style.display='block';over=0;paused=0;run=1;juiceReset();featReset();endDeath();gun.visible=true;R.domElement.requestPointerLock()}
function modeTick(dt){if(mode=='Private')return privTick();if(mode=='Slayer'||mode=='Team Deathmatch')return pvpTick();
 if(mode=='Time Attack'){tl-=dt;$('#ob').textContent=`Time ${Math.max(0,Math.ceil(tl))}s  Kills ${kills}`;if(tl<=0)endGame("Time's up")}
 else{$('#ob').textContent=`Wave ${wave}  Kills ${kills}  Enemies ${bots.filter(b=>b.al).length}`;if(!bots.some(b=>b.al)){for(const b of bots)S.remove(b.m);bots=[];wave++;const n=Math.min(12,2+wave*2);for(let i=0;i<n;i++)addBot(50+wave*6,1+wave*.07);msg('Wave '+wave,2.5);gc=Math.min(gc+1,3)}}}
function upd(dt){t0+=dt;
 if(P.dead){P.rt-=dt;if(P.rt<=0&&mode!='Survival')respawn()}
 else{const f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0),n=Math.hypot(f,s)||1,spd=6*(key.ShiftLeft?1.45:1)*(L.pk.includes('Marathon')?1.15:1);
  mv(P,(-Math.sin(yaw)*f+Math.cos(yaw)*s)/n*spd*dt,(-Math.cos(yaw)*f-Math.sin(yaw)*s)/n*spd*dt,.4);
  if(key.Space&&P.on){P.vy=L.pk.includes('Spring Legs')?9.4:7.6;P.on=0}
  P.vy-=20*dt;P.y+=P.vy*dt;const g=gnd(P);if(P.y<=g){P.y=g;P.vy=0;P.on=1}else P.on=0;
  tg=findT();fr=tg?Math.max(.4,1-.4*AA):1;
  const w=cw();if(rel>0){rel-=dt;if(rel<=0){const tk=Math.min(w.m-w.mag,w.res);w.mag+=tk;w.res-=tk}}
  else if((trig||key.KeyF)&&(w.au||fresh)&&t0>=nf&&w.mag>0){shoot();fresh=0}else if(trig&&w.mag<=0)startRel();
  if(t0-lastHit>(L.pk.includes('Second Wind')?2:4))P.sh=Math.min(P.msh,P.sh+(L.pk.includes('Second Wind')?65:40)*dt)}
 kick*=Math.exp(-9*dt);if(P.dead)deathCam(dt);else{C.position.set(P.x,P.y+1.65,P.z);C.rotation.set(pitch+kick,yaw,0)}
 gun.position.x+=(.2-gun.position.x)*10*dt;gun.position.y=-.2+Math.sin(t0*9)*(P.on&&(key.KeyW||key.KeyS||key.KeyA||key.KeyD)?.008:0);gun.position.z+=(-.45-gun.position.z)*12*dt;gun.rotation.x+=((rel>0?-.7:0)-gun.rotation.x)*10*dt;
 juiceTick(dt);featTick(dt);updBots(dt);modeTick(dt);
 for(let i=grs.length-1;i>=0;i--){const g=grs[i];g.t-=dt;g.v.y-=18*dt;const np=g.p.clone().add(g.v.clone().multiplyScalar(dt));let ex=g.t<=0;
  if(np.y<.13){np.y=.13;g.v.y*=-.35;g.v.x*=.7;g.v.z*=.7;if(g.g.imp)ex=1}
  for(const b of bx)if(np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y<b.h){if(g.g.imp)ex=1;else{g.v.x*=-.3;g.v.z*=-.3;np.copy(g.p)}}
  if(g.g.imp)for(const b of bots)if(b.al&&Math.hypot(b.x-np.x,b.z-np.z)<.8&&np.y<2)ex=1;
  g.p.copy(np);g.m.position.copy(np);if(ex){boom(np,g.g);S.remove(g.m);grs.splice(i,1)}}
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.l-=dt;if(f.grow)f.m.scale.addScalar(f.grow*dt);if(f.sph)f.m.material.opacity=Math.max(0,f.l*1.7);if(f.l<=0){S.remove(f.m);if(f.line)f.m.geometry.dispose();fx.splice(i,1)}}
 hmT-=dt;if(hmT<=0)$('#hm').className='';msT-=dt;if(msT<=0)$('#ms').textContent='';dmA=Math.max(0,dmA-dt*.8);$('#dm').style.opacity=dmA;
 $('#cx').className=tg?'t':'';$('#sh').style.width=P.sh/P.msh*100+'%';$('#hp').style.width=Math.max(0,P.hp)+'%';
 $('#am').innerHTML=P.dead?'Respawning…':`${cw().mag}<small>${rel>0?'Reloading…':'/ '+cw().res} · ${W[cw().k].n}${L.g?' · Grenades '+gc:''}</small>`}
const clk=new THREE.Clock();
(function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);if(run&&!paused)upd(dt);else if(!run&&typeof menuCam=='function')menuCam(dt);if(typeof netOn!='undefined'&&netOn)netTick(dt);R.render(S,C)})();
