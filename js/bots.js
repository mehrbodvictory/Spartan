/* ---------- bots ---------- */
function addBot(hp,df){const m=new THREE.Group(),mat=c=>new THREE.MeshLambertMaterial({color:c}),part=(w,h,d,x,y,z,c)=>{const p=new THREE.Mesh(bg,mat(c));p.scale.set(w,h,d);p.position.set(x,y,z);m.add(p)};
 part(.8,1.1,.5,0,.95,0,0xb5452e);part(.6,.5,.4,0,.25,0,0x3a2a2a);part(.4,.4,.4,0,1.75,0,0x2a2f35);part(.3,.12,.05,0,1.78,.21,0x62e0f0);part(.12,.12,.5,.35,1.05,.4,0x222222);S.add(m);
 const b={m,x:0,z:0,y:0,hp,mhp:hp,al:0,cd:1,off:1,ot:0,rt:0,df,team:'e',k:0,nm:'Grunt'};bots.push(b);spawn(b);return b}
function spawnPt(minD){let x,z;for(let i=0;i<40;i++){x=(Math.random()*2-1)*(H-3);z=(Math.random()*2-1)*(H-3);if(bx.some(b=>x>b.x0-1.2&&x<b.x1+1.2&&z>b.z0-1.2&&z<b.z1+1.2))continue;if(Math.hypot(x-P.x,z-P.z)>=minD)break}return[x,z]}
function spawn(b){[b.x,b.z]=spawnPt(18);b.hp=b.mhp;b.al=1;b.cd=1+Math.random();b.m.visible=true}
function hitBot(b,d,head){b.hp-=d;hits++;juiceHit(b,d,head);if(b.net){netSend({t:'hit',to:b.id,d});return}$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(b.hp<=0){b.al=0;b.m.visible=false;b.rt=2.5;kills++;ts[pTeam()]=(ts[pTeam()]||0)+1;juiceKill(b,head);featKill(b,head);if(L.pk.includes('Scavenger')){for(const w of wp)w.res=Math.min(w.res+Math.ceil(w.m*.4),w.m*4)}}}
function hurt(d,b){if(P.dead)return;lastBot=b||null;if(b)dirInd(b);lastHit=t0;dmA=.6;shake=Math.max(shake,.3);if(P.sh>0){const a=Math.min(P.sh,d);P.sh-=a;d-=a}P.hp-=d;beep(120,.1,'sawtooth',.06);if(P.hp<=0)die()}
function die(){P.dead=1;deaths++;ks=0;q.length=0;startDeath();botScoreOnMe();if(netOn)netSend({t:'dead',by:lastAtk});lastAtk='';P.rt=2.5;if(mode=='Survival')setTimeout(()=>endGame('You were eliminated'),2600)}
function respawn(){endDeath();const[x,z]=spawnPt(20);P.x=x;P.z=z;P.y=0;P.vy=0;P.hp=100;P.sh=P.msh;P.dead=0;for(const w of wp){w.mag=w.m;w.res=w.m*4}rel=0}
