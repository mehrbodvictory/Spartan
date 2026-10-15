/* ---------- bots ---------- */
let botId=0;
function addBot(hp,df){const m=new THREE.Group(),rig=mkHuman(m);S.add(m);
 const b={i:botId++,m,rig,x:0,z:0,y:0,hp:50,mhp:50,sh:50,msh:50,lh:-9,al:0,cd:1,off:1,ot:0,rt:0,df,team:'e',k:0,nm:'Grunt'};bots.push(b);spawn(b);setHeld(b,BOTGUNS[Math.random()*BOTGUNS.length|0]);return b}
function spawnPt(minD,team){let x,z;const tm=team&&(mode=='Team Deathmatch'||mode=='Capture the Flag'),lo=tm&&team=='B'?H/3:-H,hi=tm&&team=='A'?-H/3:H;for(let i=0;i<60;i++){x=lo+3+Math.random()*(hi-lo-6);z=(Math.random()*2-1)*(H-3);if(bx.some(b=>x>b.x0-1.2&&x<b.x1+1.2&&z>b.z0-1.2&&z<b.z1+1.2))continue;if(Math.hypot(x-P.x,z-P.z)>=minD)break}return[x,z]}
function spawn(b){[b.x,b.z]=spawnPt(18,b.team);b.hp=b.mhp;b.sh=b.msh;b.lh=-9;b.al=1;b.cd=1+Math.random();b.m.visible=true}
function takeDmg(b,d){b.lh=t0;if(b.sh>0){const a=Math.min(b.sh,d);b.sh-=a;d-=a}b.hp-=d}
function hitBot(b,d,head){takeDmg(b,d);hits++;juiceHit(b,d,head);if(b.net){netSend(b.hb?{t:'bh',i:b.i,d}:{t:'hit',to:b.id,d});return}$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(b.hp<=0){b.al=0;b.m.visible=false;b.rt=2.5;kills++;ts[pTeam()]=(ts[pTeam()]||0)+1;announce(b,P);juiceKill(b,head);featKill(b,head);if(L.pk.includes('Scavenger')){for(const w of wp)w.res=Math.min(w.res+Math.ceil(w.m*.4),w.m*(w.rs==null?4:w.rs))}}}
function hurt(d,b){if(P.dead)return;lastBot=b||null;if(b)dirInd(b);lastHit=t0;dmA=.6;shake=Math.max(shake,.3);if(P.sh>0){const a=Math.min(P.sh,d);P.sh-=a;d-=a}P.hp-=d;beep(120,.1,'sawtooth',.06);if(P.hp<=0)die()}
function die(){P.dead=1;deaths++;ks=0;q.length=0;startDeath();const by=lastAtk||(lastBot&&!lastBot.net?'b'+lastBot.i:'');botScoreOnMe();if(netOn){if(isHost&&mode!='Private'&&lastAtk)credit(lastAtk);netSend({t:'dead',v:myId,by})}lastAtk='';P.rt=2.5;if(mode=='Survival'&&!netOn)setTimeout(()=>endGame('You were eliminated'),2600)}
function respawn(){endDeath();const[x,z]=spawnPt(20,pTeam());P.x=x;P.z=z;P.y=0;P.vy=0;P.hp=P.mhp;P.sh=P.msh;P.dead=0;for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}rel=0}
