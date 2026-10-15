/* ---------- private matches: peer-to-peer (PeerJS). The host runs the bots and game rules; friends join with a 5-letter code. All modes supported. ---------- */
let net=null,myId='',myName='',conns=[],isHost=0,netOn=0,scores={},names={},lastAtk='',nacc=0,bacc=0,oacc=0,pn=0,soloMode=null;
const CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',lobby=t=>$('#lb').textContent=t;
function lobbyList(){$('#plist').innerHTML=Object.entries(names).map(([i,n])=>`<li>${n}${i==myId?' (you)':''}</li>`).join('')}
function netSend(m){m.id=myId;for(const c of conns)if(c.open)c.send(m)}
function fwd(d,from){for(const c of conns)if(c!==from&&c.open)c.send(d)}
function netClose(){for(const c of conns)try{c.close()}catch(e){}conns=[];if(net)try{net.destroy()}catch(e){}net=null;netOn=0;isHost=0;names={};scores={};document.body.classList.remove('net');$('#hostbox').style.display='none';lobbyList();if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}}
function hostMatch(){netClose();myName=$('#nm').value||'Host';let c='';for(let i=0;i<5;i++)c+=CH[Math.random()*CH.length|0];lobby('Connecting…');
 net=new Peer('sdrill-'+c);net.on('open',id=>{myId=id;isHost=1;names[id]=myName;$('#code').textContent=c;$('#hostbox').style.display='block';lobby('Share this code. Press Start when everyone has joined.');lobbyList()});
 net.on('connection',cn=>reg(cn));net.on('error',e=>lobby('Network error: '+e.type+(e.type=='unavailable-id'?' (try again)':'')))}
function joinMatch(){const c=$('#jc').value.trim().toUpperCase();if(c.length<5)return lobby('Enter the 5-letter code');netClose();myName=$('#nm').value||'Guest';lobby('Connecting…');
 net=new Peer();net.on('open',id=>{myId=id;names[id]=myName;reg(net.connect('sdrill-'+c,{reliable:true}))});net.on('error',e=>lobby(e.type=='peer-unavailable'?'No match found with that code':'Network error: '+e.type))}
function reg(cn){cn.on('open',()=>{conns.push(cn);cn.send({t:'hi',id:myId,n:myName});lobby(isHost?'Player joined':'Connected. Waiting for the host to start…')});
 cn.on('data',d=>onMsg(d,cn));cn.on('close',()=>{conns=conns.filter(x=>x!==cn);dropPeer(cn.peer)})}
function dropPeer(id){const i=bots.findIndex(b=>b.net&&b.id==id);if(i>=0){S.remove(bots[i].m);bots.splice(i,1)}if(names[id]&&run)feed(names[id]+' left');delete names[id];lobbyList()}
const nmOf=k=>names[k]||(bots.find(b=>(b.hb||!b.net)&&('b'+b.i)==k)||{}).nm||'?';
/* host-side scoring for kills made by someone other than the host's own hits */
function credit(by){if(!isHost||mode=='Private')return;const kb=by==myId?P:bots.find(b=>(b.net?b.id:'b'+b.i)==by);if(!kb)return;const tm=kb===P?pTeam():kb.team;ts[tm]=(ts[tm]||0)+1;if(kb!==P)kb.k=(kb.k||0)+1}
function announce(t,by){if(netOn&&isHost&&mode!='Private')netSend({t:'dead',v:'b'+t.i,by:by===P?myId:by.net?by.id:'b'+by.i})}
function syncPuppets(l){const ids=new Set(l.map(e=>e[0]));for(let k=bots.length-1;k>=0;k--)if(bots[k].hb&&!ids.has(bots[k].i)){S.remove(bots[k].m);bots.splice(k,1)}
 for(const[i,team,al,x,z,nm,wk,rlo]of l){let b=bots.find(q=>q.hb&&q.i==i);if(!b){b=addBot(1e9,1);b.net=1;b.hb=1;b.i=i;b.id='b'+i;b.x=b.tx=x;b.z=b.tz=z;b.ty=0;b.yaw=0;b.m.children[0].material.color.setHex(team=='A'?0x3d6ad6:team=='B'?0xb5452e:new THREE.Color().setHSL((i*.15)%1,.6,.42).getHex())}
  if(Math.hypot(x-b.tx,z-b.tz)>.05)b.yaw=Math.atan2(x-b.tx,z-b.tz)-Math.PI;b.team=team;b.nm=nm;b.al=al;setHeld(b,wk);b.rlOn=!!rlo;b.tx=x;b.tz=z}}
function onMsg(d,cn){if(isHost&&d.t!='hi'&&d.t!='roster')fwd(d,cn);
 switch(d.t){
 case'hi':names[d.id]=d.n;if(isHost){cn.send({t:'roster',r:{...names}});fwd(d,cn)}lobbyList();break;
 case'roster':Object.assign(names,d.r);lobbyList();break;
 case'start':beginNet(d.map,d.mode,d.teams);break;
 case's':{const b=bots.find(b=>b.net&&b.id==d.id);if(b){b.tx=d.x;b.ty=d.y;b.tz=d.z;b.yaw=d.yaw;if(d.w)setHeld(b,d.w);b.rlOn=!!d.r;if(b.al&&!d.al)burst(V(b.x,1,b.z),16,0x3d6ad6,6,.8,.15);b.al=d.al}break}
 case'hit':if(d.to==myId&&run&&!P.dead){lastAtk=d.bot!=null?'b'+d.bot:d.id;hurt(d.d,bots.find(b=>b.net&&b.id==lastAtk))}break;
 case'bh':if(isHost&&mode!='Private'){const t=bots.find(b=>!b.net&&b.i==d.i&&b.al),by=bots.find(b=>b.net&&b.id==d.id);if(t&&by)botHit(t,d.d,by)}break;
 case'dead':{const by=d.by;if(by!=myId)feed(by?`${nmOf(by)} ▸ ${nmOf(d.v)}`:nmOf(d.v)+' died');
  if(mode=='Private'){if(by)scores[by]=(scores[by]||0)+1}else if(isHost&&by)credit(by);
  if(by==myId&&d.v!=myId){kills++;const b=bots.find(b=>b.net&&b.id==d.v);if(b){featKill(b,0);juiceKill(b,0)}}break}
 case'sh':{const b=bots.find(b=>b.net&&b.id==d.id);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z));break}
 case'bsh':if(!isHost){const b=bots.find(b=>b.hb&&b.i==d.i);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z),b.team=='A'?0x62a8ff:0xff5a3a)}break;
 case'ob':obText=d.s;break;
 case'b':if(!isHost)syncPuppets(d.l);break;
 case'f':if(!isHost){d.f.forEach((a,i)=>{const f=flags[i];if(!f)return;if(a[3]==myId&&f.byk!=myId)msg('You have the flag! Bring it home',2.5);f.st=a[0];f.x=a[1];f.z=a[2];f.byk=a[3]});if(d.cs)cs=d.cs}break;
 case'feed':if(!isHost)feed(d.s);break;
 case'pop':if(!isHost)popup(d.a,d.b);break;
 case'end':if(!isHost){let w=d.w;if(teamMode())w=(w=='Victory')==(myTeam==d.ht)?'Victory':'Defeat';else if(w=='Victory')w=(names[d.id]||'Host')+' wins';endGame(w)}break}}
function addNetBot(id,team){const b=addBot(1e9,1);b.net=1;b.id=id;b.al=0;b.m.visible=false;b.tx=b.ty=b.tz=b.x=b.z=b.yaw=0;b.team=team||id;b.nm=names[id]||'Player';b.k=0;
 b.m.children[0].material.color.setHex(b.team=='A'?0x3d6ad6:b.team=='B'?0xb5452e:new THREE.Color().setHSL((++pn*.17)%1,.6,.45).getHex())}
function hostStart(){const m=$('#pmode').value,tm=m=='Team Deathmatch'||m=='Capture the Flag',teams={};Object.keys(names).forEach((id,i)=>teams[id]=tm?(i%2?'B':'A'):id);const map=$('#pm').value;netSend({t:'start',map,mode:m,teams});beginNet(map,m,teams)}
function beginNet(map,m,teams){if(soloMode==null)soloMode=sel.mode;sel.map=map;sel.mode=m;mpTeams=teams;myTeam=teams[myId]||'A';netOn=1;scores={};pn=0;document.body.classList.add('net');startGame();for(const id in names)if(id!=myId)addNetBot(id,teams[id]);
 if(!isHost){paused=1;$('#pt').textContent='Match ready';$('#pause').style.display='block'}}
function netShot(k,o,d,len){netSend({t:'sh',w:k,x:+(o.x+d.x*len).toFixed(1),y:+(o.y+d.y*len).toFixed(1),z:+(o.z+d.z*len).toFixed(1)})}
function mpEnd(t){netSend({t:'end',w:t,ht:myTeam})}
function netTick(dt){if(!run)return;nacc+=dt;if(nacc>.066){nacc=0;netSend({t:'s',x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:+yaw.toFixed(2),al:P.dead?0:1,w:cw().k,r:rel>0?1:0})}
 if(isHost&&mode!='Private'){bacc+=dt;if(bacc>.1){bacc=0;netSend({t:'b',l:bots.filter(b=>!b.net).map(b=>[b.i,b.team,b.al?1:0,+b.x.toFixed(1),+b.z.toFixed(1),b.nm,b.wk,b.rl>0?1:0])})}oacc+=dt;if(oacc>.25){oacc=0;netSend({t:'ob',s:$('#ob').textContent})}}
 const k=Math.min(1,dt*12);for(const b of bots)if(b.net){b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,b.y,b.z);b.m.rotation.y=b.yaw+Math.PI;b.m.visible=!!b.al;b.hp=1e9}
 if(!isHost&&mode=='Capture the Flag')for(const f of flags){f.m.position.set(f.x,0,f.z);f.m.visible=f.byk!=myId}}
function privTick(){const top=Math.max(0,...Object.values(scores));$('#ob').textContent=`Players only · You ${scores[myId]||0} · Top ${top} / 15`;for(const id in scores)if(scores[id]>=15){endGame(id==myId?'Victory':(names[id]||'A player')+' wins');return}}
