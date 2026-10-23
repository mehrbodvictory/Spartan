/* ===================== sk_core.js ===================== */
/* ---------- killstreak engine ----------
   SK.objs: things you placed or called in (turrets, drones, crates, helicopters ...). Every object can have hp: enemy bots with a line of sight shoot it down, an EMP disables it.
   SK.rc: remote control / gunner mode: the camera moves to the vehicle or gun, the player body stands still. SK.ea: enemy air support, the target of Flak Guns, PAL turrets, EMP and your gunships.
   Kills made by killstreaks never feed the killstreak counter. In private matches the streaks are local to the player who earned them. */
const SK={got:{},objs:[],q:[],t:0,uavT:0,advT:0,prT:0,cuavT:0,empT:0,flakT:0,rc:null,suit:null,ping:[],pingT:0,ea:[],eaT:70,nok:0,fp:0,trp:0,air:[],bombs:[],fires:[],lines:[],marks:[],heavyBack:null};
const foes=()=>bots.filter(b=>b.al&&!ally(b)&&!b.out);
function skGnd(x,z){let h=0;for(const b of bx)if((b.y0||0)<.4&&b.h<4&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&b.h>h)h=b.h;return h}
function skSpot(maxd){maxd=maxd||7;const o=C.position.clone(),d=aimDir(),t=Math.max(1.2,Math.min(maxd,castW(o,d,maxd)-.5)),x=o.x+d.x*t,z=o.z+d.z*t;return V(x,skGnd(x,z),z)}
function skAimPoint(maxd){const o=C.position.clone(),d=aimDir(),t=Math.min(maxd||90,castW(o,d,maxd||90));return o.add(d.multiplyScalar(t))}
/* damage helpers: streak damage is credited to the player and never touches the player */
function skHurt(b,d,name){src=name;srcK='';SK.nok=1;try{hitBot(b,d,0)}catch(e){}SK.nok=0}
function skBlast(p,R,d,name,quiet){src=name;srcK='';SK.nok=1;try{if(quiet){for(const b of foes()){const D=Math.hypot(b.x-p.x,(b.y||0)+1-p.y,b.z-p.z);if(D<R)hitBot(b,d*(1-.5*D/R),0)}burst(p,7,0xffa040,5,.4,.2)}else boom(p,{R,d,own:1,c:0xff8a30})}catch(e){}SK.nok=0;skHitEA(p,R+2,d)}
function skLine(a,b,col,life){const g=new THREE.BufferGeometry().setFromPoints([a,b]),l=new THREE.Line(g,new THREE.LineBasicMaterial({color:col||0xffe080}));S.add(l);SK.lines.push({l,t:life||.07})}
/* objects */
function skAdd(o){o.m.position.set(o.x,o.y,o.z);S.add(o.m);o.t=o.life||60;SK.objs.push(o);return o}
function skRemove(o,boomFx){const i=SK.objs.indexOf(o);if(i>=0)SK.objs.splice(i,1);S.remove(o.m);if(o.end)try{o.end(o)}catch(e){}if(boomFx){burst(V(o.x,o.y+.5,o.z),26,0xff9a30,7,.8,.3);burst(V(o.x,o.y+.5,o.z),14,0x333333,3,1,.5);noise(.4,500,.2)}}
/* bots shoot streak assets they can see */
function skBotsAttack(o,dt){if(!o.hp||o.inv||SK.empT>0&&o.elec)return;let dmg=0;for(const b of foes()){if(b.stun>0)continue;const d=Math.hypot(b.x-o.x,b.z-o.z);if(d>(o.air?34:30)||!navLos(b.x,b.z,o.x,o.z))continue;let f=1;if(o.shield){const a=Math.atan2(b.x-o.x,b.z-o.z),df=Math.abs(((a-o.face+Math.PI*3)%(Math.PI*2))-Math.PI);f=df>2.3?.12:1}dmg+=(o.air?5:7)*f}
 if(dmg){o.hp-=dmg*dt;if(o.hp<=0){feed('Enemy destroyed your '+(o.n||'streak'));skRemove(o,true)}}}
/* enemy air support: a hostile helicopter now and then. Flak Guns stop new ones, EMP / PAL / gunships / rockets bring them down. */
function skEnemyAir(){const m=skModel('achopper');m.scale.setScalar(.8);m.traverse(e=>{if(e.material&&e.material.color)e.material=e.material.clone(),e.material.color.multiplyScalar(.7).add(new THREE.Color(.25,0,0))});const a=Math.random()*6.28;const e={m,x:Math.cos(a)*40,y:17,z:Math.sin(a)*40,hp:230,ang:a,t:60,cd:1};m.position.set(e.x,e.y,e.z);S.add(m);SK.ea.push(e);msg('Enemy chopper inbound',2);beep(180,.4,'sawtooth',.08)}
function skHitEA(p,R,d){for(let i=SK.ea.length-1;i>=0;i--){const e=SK.ea[i];if(Math.hypot(e.x-p.x,e.y-p.y,e.z-p.z)<R+2){e.hp-=d*(SK.nok?1.5:1);if(e.hp<=0)skEaDie(e)}}}
function skEaDie(e){const i=SK.ea.indexOf(e);if(i<0)return;SK.ea.splice(i,1);S.remove(e.m);burst(V(e.x,e.y,e.z),40,0xff9a30,9,1,.4);noise(.6,300,.25);feed('You ▸ Enemy chopper destroyed');if(typeof popup=='function')popup('CHOPPER DOWN','+300')}
function skEaTick(dt){if(!run||mode=='Zombies')return;SK.eaT-=dt;if(SK.eaT<=0){SK.eaT=75+Math.random()*50;if(SK.flakT<=0&&SK.ea.length<1&&foes().length>2)skEnemyAir()}
 for(let i=SK.ea.length-1;i>=0;i--){const e=SK.ea[i];e.t-=dt;if(SK.empT>0){e.hp-=400*dt}if(e.hp<=0){skEaDie(e);continue}if(e.t<=0||SK.flakT>0&&Math.random()<dt*.35){S.remove(e.m);SK.ea.splice(i,1);continue}
  e.ang+=dt*.35;e.x+=(P.x+Math.cos(e.ang)*26-e.x)*Math.min(1,dt*.6);e.z+=(P.z+Math.sin(e.ang)*26-e.z)*Math.min(1,dt*.6);e.y=17+Math.sin(SK.t*.8)*1.2;e.m.position.set(e.x,e.y,e.z);e.m.rotation.y=Math.atan2(P.x-e.x,P.z-e.z);
  e.cd-=dt;if(e.cd<=0&&!P.dead&&Math.hypot(P.x-e.x,P.z-e.z)<44&&navLos(e.x,e.z,P.x,P.z)){e.cd=.7;skLine(V(e.x,e.y-.6,e.z),V(P.x+(Math.random()-.5)*2,1.2,P.z+(Math.random()-.5)*2),0xff6a40,.08);if(Math.random()<.55)hurt(7)}}}
/* the player's own bullets hit enemy air as well */
function skShotAir(){if(!SK.ea.length)return;const o=C.position.clone(),d=aimDir(),w=cw();for(const e of SK.ea){const v=V(e.x-o.x,e.y-o.y,e.z-o.z),t=v.dot(d);if(t<2||t>90)continue;const off=v.clone().sub(d.clone().multiplyScalar(t)).length();if(off<2.4&&castW(o,d,t)>=t-.5){e.hp-=(w?w.d:20)*.7;if(e.hp<=0)skEaDie(e)}}}
/* ---------- radar types ---------- */
function skRadar(dot,pt,c){for(const b of bots){if(!b.al)continue;if(ally(b)){dot(b.x,b.z,'#62e0f0',3);continue}if(b.out)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);let show=d<28;
  if(SK.advT>0)show=true;else if(SK.prT>0&&d<46)show=true;if(!show&&(b.mvs||0)>1.2)show=SK.objs.some(o=>o.id=='motion'&&Math.hypot(b.x-o.x,b.z-o.z)<o.r);
  if(show){dot(b.x,b.z,'#ff5a3a',3);if(SK.advT>0){const p=pt(b.x,b.z),a=b.m?b.m.rotation.y:0,q=pt(b.x+Math.sin(a)*5,b.z+Math.cos(a)*5);if(p&&q&&Math.hypot(p[0]-75,p[1]-75)<70){c.strokeStyle='#ff9a7a';c.lineWidth=1.5;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke()}}}}
 if(SK.uavT>0&&SK.advT<=0){for(const p of SK.ping){const age=SK.t-p.t,a=Math.max(0,1-age/4.2);if(a<=0)continue;c.globalAlpha=a;dot(p.x,p.z,'#ff5a3a',3);c.globalAlpha=1}}
 if(SK.cuavT>0&&!P.dead){}}
/* ---------- remote control / gunner camera ---------- */
function rcStart(r){if(SK.rc)return false;r.t=r.t||25;r.hy=yaw;r.hp=pitch;r.fireT=0;if(r.m&&r.id=='dcvt')S.add(r.m);SK.rc=r;SK.trp=trig;msg(r.hint||'Remote control',2.5);if(typeof haptic=='function')haptic(.3,100,.4,'both');return true}
function rcEnd(why){const r=SK.rc;if(!r)return;SK.rc=null;if(r.m)S.remove(r.m);if(r.end)try{r.end(r)}catch(e){}gun.visible=true;C.rotation.order='YXZ';const e=$('#rcv');if(e)e.style.display='none';if(why)msg(why,1.5)}
function rcTick(dt){const r=SK.rc;if(!r)return;if(P.dead||SK.empT>0&&r.elec){rcEnd(P.dead?'':'Signal lost');return}r.t-=dt;const edge=trig&&!SK.trp;SK.trp=trig;
 /* heading follows where the player looks, limited by the turn rate */
 if(r.turn){const dy=Math.atan2(Math.sin(yaw-r.hy),Math.cos(yaw-r.hy)),dp=cl(pitch+(r.bias||0),-1.5,1.2)-r.hp,mx=r.turn*dt;r.hy+=cl(dy,-mx,mx);r.hp+=cl(dp,-mx,mx)}else{r.hy=yaw;r.hp=pitch}
 try{r.tick(r,dt,edge)}catch(e){rcEnd('Link lost')}if(!SK.rc)return;if(r.t<=0){if(r.expire)r.expire(r);if(SK.rc===r)rcEnd('Out of time')}
 const e=$('#rcv');if(e){e.style.display='block';e.innerHTML=`<b>${r.n||'REMOTE'}</b> <span>${Math.max(0,Math.ceil(r.t))}s</span><small>${r.hint||''}</small>`}}
function skCam(){const r=SK.rc;if(!r)return;gun.visible=false;if(r.m){r.m.position.set(r.x,r.y,r.z);r.m.rotation.set(-r.hp*.6,r.hy+Math.PI,0)}
 const cp=r.cam?r.cam(r):V(r.x,r.y,r.z);C.position.copy(cp);C.rotation.order='YXZ';C.rotation.set(r.camPitch!=null?r.camPitch:r.hp,r.hy,0)}
/* ---------- tick ---------- */
function skTick(dt){SK.t+=dt;for(const k of['uavT','advT','prT','cuavT','empT','flakT'])if(SK[k]>0)SK[k]-=dt;
 if(SK.uavT>0&&SK.advT<=0){SK.pingT-=dt;if(SK.pingT<=0){SK.pingT=4;SK.ping=foes().map(b=>({x:b.x,z:b.z,t:SK.t}))}}
 for(const b of bots){if(!b.al)continue;b.mvs=Math.hypot(b.x-(b._lx==null?b.x:b._lx),b.z-(b._lz==null?b.z:b._lz))/Math.max(dt,.001);b._lx=b.x;b._lz=b.z}
 if(SK.cuavT>0){SK.cj=(SK.cj||0)-dt;if(SK.cj<=0){SK.cj=.45;for(const b of foes())b.cd=Math.max(b.cd||0,.4)}}
 if(SK.empT>0){SK.ej=(SK.ej||0)-dt;if(SK.ej<=0){SK.ej=.3;for(const b of foes())b.stun=Math.max(b.stun||0,.6)}}
 for(let i=SK.objs.length-1;i>=0;i--){const o=SK.objs[i];if(!o)continue;o.t-=dt;if(o.t<=0){skRemove(o,false);continue}if(!(SK.empT>0&&o.elec))try{if(o.tick)o.tick(o,dt)}catch(e){skRemove(o,false);continue}if(o.m)o.m.position.set(o.x,o.y,o.z);skBotsAttack(o,dt)}
 for(let i=SK.lines.length-1;i>=0;i--){const l=SK.lines[i];l.t-=dt;if(l.t<=0){S.remove(l.l);l.l.geometry.dispose();SK.lines.splice(i,1)}}
 skEaTick(dt);rcTick(dt);if(typeof skAirTick=='function')skAirTick(dt);skTickSuit(dt)}
function skTickSuit(dt){const s=SK.suit;if(!s)return;s.t-=dt;if(s.t<=0||P.dead)skEndSuit(P.dead?'':'Suit powered down')}
function skEndSuit(why){const s=SK.suit;if(!s)return;SK.suit=null;P.mhp=s.mhp;P.msh=s.msh;P.hp=Math.min(P.hp,P.mhp);P.sh=Math.min(P.sh,P.msh);if(s.wk)skDropHeavy(s.wk);if(why)msg(why,1.5)}
function skReset(){for(const o of SK.objs.slice())skRemove(o,false);for(const e of SK.ea)S.remove(e.m);SK.ea=[];rcEnd();for(const l of SK.lines)S.remove(l.l);SK.lines=[];if(typeof skAirClear=='function')skAirClear();SK.suit=null;SK.uavT=SK.advT=SK.prT=SK.cuavT=SK.empT=SK.flakT=0;SK.ping=[];SK.eaT=70;SK.q=[];SK.got={};gun.visible=true}
/* hooks */
{const _ft=featTick;featTick=function(dt){_ft.apply(this,arguments);if(mode!='Zombies')skTick(dt)}}
{const _fr=featReset;featReset=function(){_fr.apply(this,arguments);skReset()}}
{const _gt=gfxTick;gfxTick=function(dt){_gt.apply(this,arguments);skCam()}}
{const _mc=moveCalc;moveCalc=function(){const r=_mc.apply(this,arguments);if(SK.rc)return{f:0,s:0,spt:false,spd:0};if(SK.suit)r.spd*=SK.suit.sp;return r}}
{const _sh=shoot;shoot=function(){if(SK.rc)return;_sh.apply(this,arguments);skShotAir()}}
{const _d=die;die=function(){const was=P.dead;_d.apply(this,arguments);if(!was){rcEnd();skEndSuit('');SK.got={}}}}
{const _b=boom;boom=function(p,g){_b.apply(this,arguments);if(!g||!g.tac)skHitEA(p,(g&&g.R)||4,(g&&g.d)||100)}}
{const _fk=featKill;featKill=function(b,h){if(SK.nok)ks--;_fk.apply(this,arguments)}}
{const _sw=swap;swap=function(){if(SK.rc)return;_sw.apply(this,arguments)}}
