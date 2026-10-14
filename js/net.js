/* ---------- private matches: peer-to-peer over WebRTC (PeerJS), join with a 5-letter code ---------- */
let net=null,myId='',myName='',conns=[],isHost=0,netOn=0,scores={},names={},lastAtk='',nacc=0,pn=0;
const CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',lobby=t=>$('#lb').textContent=t;
function lobbyList(){$('#plist').innerHTML=Object.entries(names).map(([i,n])=>`<li>${n}${i==myId?' (you)':''}</li>`).join('')}
function netSend(m){m.id=myId;for(const c of conns)if(c.open)c.send(m)}
function fwd(d,from){for(const c of conns)if(c!==from&&c.open)c.send(d)}
function netClose(){for(const c of conns)try{c.close()}catch(e){}conns=[];if(net)try{net.destroy()}catch(e){}net=null;netOn=0;isHost=0;names={};scores={};document.body.classList.remove('net');$('#hostbox').style.display='none';lobbyList()}
function hostMatch(){netClose();myName=$('#nm').value||'Host';let c='';for(let i=0;i<5;i++)c+=CH[Math.random()*CH.length|0];lobby('Connecting…');
 net=new Peer('sdrill-'+c);net.on('open',id=>{myId=id;isHost=1;names[id]=myName;$('#code').textContent=c;$('#hostbox').style.display='block';lobby('Share this code. Press Start when everyone has joined.');lobbyList()});
 net.on('connection',cn=>reg(cn));net.on('error',e=>lobby('Network error: '+e.type+(e.type=='unavailable-id'?' (try again)':'')))}
function joinMatch(){const c=$('#jc').value.trim().toUpperCase();if(c.length<5)return lobby('Enter the 5-letter code');netClose();myName=$('#nm').value||'Guest';lobby('Connecting…');
 net=new Peer();net.on('open',id=>{myId=id;names[id]=myName;reg(net.connect('sdrill-'+c,{reliable:true}))});net.on('error',e=>lobby(e.type=='peer-unavailable'?'No match found with that code':'Network error: '+e.type))}
function reg(cn){cn.on('open',()=>{conns.push(cn);cn.send({t:'hi',id:myId,n:myName});lobby(isHost?'Player joined':'Connected. Waiting for the host to start…')});
 cn.on('data',d=>onMsg(d,cn));cn.on('close',()=>{conns=conns.filter(x=>x!==cn);dropPeer(cn.peer)})}
function dropPeer(id){const i=bots.findIndex(b=>b.net&&b.id==id);if(i>=0){S.remove(bots[i].m);bots.splice(i,1)}if(names[id]&&run)feed(names[id]+' left');delete names[id];lobbyList()}
function onMsg(d,cn){if(isHost&&d.t!='hi'&&d.t!='roster')fwd(d,cn);
 if(d.t=='hi'){names[d.id]=d.n;if(isHost){cn.send({t:'roster',r:{...names}});fwd(d,cn)}lobbyList()}
 else if(d.t=='roster'){Object.assign(names,d.r);lobbyList()}
 else if(d.t=='start'){sel.map=d.map;startNet()}
 else if(d.t=='s'){const b=bots.find(b=>b.net&&b.id==d.id);if(b){b.tx=d.x;b.ty=d.y;b.tz=d.z;b.yaw=d.yaw;if(b.al&&!d.al)burst(V(b.x,1,b.z),16,0x3d6ad6,6,.8,.15);b.al=d.al}}
 else if(d.t=='hit'&&d.to==myId&&run&&!P.dead){lastAtk=d.id;hurt(d.d,bots.find(b=>b.net&&b.id==d.id))}
 else if(d.t=='dead'){if(d.by){scores[d.by]=(scores[d.by]||0)+1;feed(`${names[d.by]||'?'} ▸ ${names[d.id]||'?'}`);if(d.by==myId){kills++;const b=bots.find(b=>b.net&&b.id==d.id);if(b){featKill(b,0);juiceKill(b,0)}}}else feed((names[d.id]||'?')+' died')}}
function addNetBot(id){const b=addBot(1e9,1);b.net=1;b.id=id;b.al=0;b.m.visible=false;b.tx=b.ty=b.tz=b.x=b.z=b.yaw=0;b.m.children[0].material.color.setHSL((++pn*.17)%1,.6,.45)}
function startNet(){netOn=1;scores={};pn=0;sel.mode='Private';document.body.classList.add('net');startGame();for(const id in names)if(id!=myId)addNetBot(id);
 if(!isHost){paused=1;$('#pt').textContent='Match ready';$('#pause').style.display='block'}}
function netTick(dt){if(!run)return;nacc+=dt;if(nacc>.066){nacc=0;netSend({t:'s',x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:+yaw.toFixed(2),al:P.dead?0:1})}
 const k=Math.min(1,dt*12);for(const b of bots)if(b.net){b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,b.y,b.z);b.m.rotation.y=b.yaw+Math.PI;b.m.visible=!!b.al;b.hp=1e9}}
function privTick(){const top=Math.max(0,...Object.values(scores));$('#ob').textContent=`Private match · You ${scores[myId]||0} · Top ${top} / 15`;for(const id in scores)if(scores[id]>=15){endGame(id==myId?'Victory':(names[id]||'A player')+' wins');return}}
