/* PeerJS discovery is shared with the private-match service. A Stormwatch
   party keeps its connections while its host changes operations. */
var StormwatchSquad=(()=>{
 const prefix='sd-stormwatch-';
 const clean=value=>onlineName(value,'Operator');
 function inviteGate(link,identity,host,ready){
  if(!identity){link.on('open',ready);return ()=>true}
  let verified=false,nonce='',pending=false;
  const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
  if(host)link.on('open',()=>{nonce=random();sendPeerPacket(link,{type:'invite-challenge',nonce})});
  return data=>{
   if(verified)return true;
   const proofType=host?'invite-answer':'invite-proof';
   const validNonce=typeof data.nonce==='string'&&/^[0-9a-f]{32}$/.test(data.nonce);
   if(!host&&data.type==='invite-challenge'&&!pending&&validNonce){
    pending=true;nonce=random();
    const binding=privateChannelBinding(link);
    if(!binding){link.close();return false}
    identity.proof('guest',data.nonce+'\n'+binding).then(proof=>{
     if(link.open)sendPeerPacket(link,{type:'invite-answer',nonce,proof});
    }).catch(()=>link.close());
   }else if(data.type===proofType&&nonce&&(!host||!pending&&validNonce)){
    if(host)pending=true;
    const challenge=nonce;nonce='';
    const binding=privateChannelBinding(link);
    if(!binding){link.close();return false}
    Promise.resolve(identity.verify(host?'guest':'host',challenge+'\n'+binding,data.proof)).then(async valid=>{
     if(!valid||!link.open){link.close();return}
     if(host){
      const proof=await identity.proof('host',data.nonce+'\n'+binding);
      if(!link.open)return;
      sendPeerPacket(link,{type:'invite-proof',proof});
     }
     verified=true;ready();
    }).catch(()=>link.close());
   }
   return false;
  };
 }
 function open(name,update){
  let peer=null,host=null,room='',isHost=false,publicRoom=false,starting=false,locked=false,round=0,sequence=0;
  let identity=null;
  const address=code=>identity?.id||prefix+code.toLowerCase();
  let message='Deploy solo or open a squad.',timer=0,search=0,attempt=0,closed=false,queued=null;
  const members=new Map(),removed=new Set(),received=new Map();
  const listeners=new Set();
  function emit(data,from){for(const callback of listeners)callback(data,from)}
  function status(line=message){
   message=line;
   update({room,isHost,publicRoom,message,starting,locked,connected:!!(isHost&&peer?.open||host?.open),
    members:host?.open&&roster?roster:[{id:peer?.id||'local',name,host:isHost},...Array.from(members.values()).filter(m=>m.name).map(m=>({id:m.link.peer,name:m.name}))]});
  }
  let roster=null;
  const stamp=data=>data.type!=='launch'&&data.round===round?{...data,sequence:++sequence}:data;
  function fresh(data,id){
   if(data.round!==round||!Number.isSafeInteger(data.sequence)||data.sequence<=(received.get(id)||0))return false;
   received.set(id,data.sequence);return true;
  }
  function send(data){
   const frame=encodePeerPacket(stamp(data));
   if(frame===null)return;
   if(isHost){for(const {link,name} of members.values())if(name&&link.open)link.send(frame)}
   else if(host?.open)host.send(frame);
  }
  function direct(id,data){const link=members.get(id)?.link;if(link?.open)sendPeerPacket(link,stamp(data))}
  function publish(){
   const list=[{id:peer.id,name,host:true},...Array.from(members.values()).filter(m=>m.name).map(m=>({id:m.link.peer,name:m.name}))];
   send({type:'roster',list,locked});status(list.length+' / 4 in squad'+(locked?' · Locked':''));
  }
  function reset(){
   clearTimeout(timer);clearTimeout(search);timer=search=0;const old=peer;peer=null;host=null;members.clear();roster=null;
   removed.clear();received.clear();identity=null;room='';isHost=false;starting=false;publicRoom=false;locked=false;round=sequence=0;queued=null;
   old?.destroy();
  }
  function leave(){attempt++;reset();status('Deploy solo or open a squad.')}
  function fail(line){reset();status(line)}
  async function peersAvailable(){
   await gameRelayReady;
   if(window.Peer||gameRelayAvailable)return true;
   status('The matchmaking service library could not load. Solo deployment is available.');return false;
  }
  function arm(p,fn,timeout=12500){clearTimeout(timer);timer=setTimeout(()=>{if(peer===p)fn()},timeout)}
  function accept(link,p){
   const previous=members.get(link.peer);
   if(previous&&!previous.link.open){
    members.delete(link.peer);
    previous.link.close();
   }
   if(removed.has(link.peer)||peer!==p||!isHost||locked||starting||members.size>=3||members.has(link.peer)){
    link.on('open',()=>{sendPeerPacket(link,{type:removed.has(link.peer)?'removed':locked?'locked':'busy'});setTimeout(()=>link.close(),300)});return;
   }
   const item={link,name:null};members.set(link.peer,item);
   const hello=setTimeout(()=>{if(!item.name)link.close()},25000);
   const allowed=inviteGate(link,identity,true,()=>{});
   peerPackets(link,'type',d=>{
    if(peer!==p||members.get(link.peer)!==item||!allowed(d))return;
    if(d.type==='hello'&&!item.name&&typeof d.name==='string'){
     if(locked){sendPeerPacket(link,{type:'locked'});setTimeout(()=>link.close(),300);return}
     clearTimeout(hello);item.name=clean(d.name);publish();
     if(queued&&!search)launch(queued);return;
    }
    if(item.name&&starting&&['pose','action','withdraw'].includes(d.type)&&fresh(d,link.peer))emit(d,link.peer);
   },()=>remove(link.peer));
   link.on('close',()=>{
    clearTimeout(hello);if(peer!==p||members.get(link.peer)!==item)return;
    members.delete(link.peer);received.delete(link.peer);emit({type:'left'},link.peer);publish();
   });
   link.on('error',()=>link.close());
  }
  function remove(id){
   const item=members.get(id);
   if(!isHost||!item)return;
   removed.add(id);members.delete(id);
   if(item.link.open)sendPeerPacket(item.link,{type:'removed'});
   emit({type:'left'},id);publish();
   setTimeout(()=>item.link.close(),300);
  }
  function toggleLock(){
   if(!isHost||!peer?.open||publicRoom)return;
   locked=!locked;
   publish();
  }
  function create(code,spec,onTaken){
   isHost=true;publicRoom=!!spec;room=code;status(spec?'Opening a public squad…':'Opening a private squad…');
   const p=peer=createDataPeer(address(code));
   arm(p,()=>fail('Could not register with matchmaking. Try again.'));
   p.on('open',()=>{
    if(peer!==p)return;
    clearTimeout(timer);publish();
    if(spec){
     status('Searching for squadmates…');
     queued=spec;
     search=setTimeout(()=>{
      search=0;
      if(peer!==p||starting)return;
      if([...members.values()].some(m=>m.name))launch(spec);
      else status('Waiting for squadmates in this operation…');
     },11000);
    }
   });
   p.on('connection',link=>accept(link,p));
   p.on('error',error=>{
    if(peer!==p)return;
    if(error.type==='unavailable-id'&&onTaken){reset();onTaken();return}
    fail('Could not open a squad · '+(error.type||'connection error'));
   });
  }
  function connect(code,spec,onMissing){
   room=code;publicRoom=!!spec;status(spec?'Searching for a public squad…':'Joining squad '+code+'…');
   const p=peer=createDataPeer();
   arm(p,()=>fail('The squad did not respond. Check the code and connection.'));
   p.on('open',()=>{
    if(peer!==p)return;
    arm(p,()=>fail('The squad could not verify the connection.'),40000);
    connectRoomPeer(p,address(code),attach,()=>status('Retrying the squad connection…'),
     ()=>fail('Could not connect to the squad after two attempts.'));
   });
   function attach(link){
    host=link;
    const allowed=inviteGate(link,identity,false,()=>{if(peer===p)sendPeerPacket(link,{type:'hello',name:clean(name)})});
    peerPackets(link,'type',d=>{
     if(peer!==p)return;
     if(d.type==='removed'){emit({type:'lost'},link.peer);fail('You were removed from the squad.');return}
     if(d.type==='locked'){fail('The host has locked this squad.');return}
     if(d.type==='busy'){
      if(onMissing){const next=onMissing;reset();next(true)}
      else fail('The squad is full or already deployed.');
      return;
     }
     if(!allowed(d))return;
     if(d.type==='roster'){
      if(!Array.isArray(d.list)||d.list.length<1||d.list.length>4||
         !d.list.every(m=>m&&typeof m.id==='string'&&typeof m.name==='string'))return;
      clearTimeout(timer);roster=d.list;locked=d.locked===true;status(locked?'Squad locked to new players.':'Connected · waiting for the host');return;
     }
     if(d.type==='launch'){
      if(!Number.isSafeInteger(d.round)||d.round<=round||!d.spec||
         typeof d.spec.region!=='string'||typeof d.spec.mission!=='string'||!Number.isInteger(d.spec.seed))return;
      round=d.round;sequence=0;received.clear();starting=true;status('Deploying with squad…');
     }else if(!roster||!starting||!fresh(d,link.peer))return;
     emit(d,link.peer);
    },()=>link.close());
    link.on('close',()=>{if(peer!==p||link.replacing)return;emit({type:'lost'},link.peer);fail('The host disconnected.')});
    link.on('error',()=>{if(peer===p)fail('The squad connection dropped.')});
   }
   p.on('error',error=>{
    if(peer!==p)return;
    if(error.type==='peer-unavailable'&&onMissing){const next=onMissing;reset();next(false);return}
    fail(error.type==='peer-unavailable'?'No squad found with that code.':'Matchmaking error · '+(error.type||'connection failed'));
   });
  }
  async function privateRoom(code,hostRoom){
   leave();
   const token=attempt;
   status(hostRoom?'Opening a private squad…':'Verifying the squad invitation…');
   try{
    const verified=await inviteIdentity('squad',code);
    if(closed||token!==attempt)return;
    identity=verified;
    if(hostRoom)create(code);else connect(code);
   }catch(error){if(!closed&&token===attempt)status(error.message)}
  }
  function launch(spec){
   if(!isHost||!peer?.open||starting)return false;
   clearTimeout(search);search=0;queued=null;starting=true;
   const data={type:'launch',round:++round,spec:{...spec,seed:crypto.getRandomValues(new Uint32Array(1))[0]}};
   sequence=0;received.clear();
   send(data);emit(data,peer.id);status('Squad deployed');return true;
  }
  return {
   get id(){return peer?.id||'local'},get host(){return isHost},get room(){return room},
   get size(){return isHost?1+[...members.values()].filter(m=>m.name).length:roster?.length||1},
   get names(){return isHost?new Map([...members].filter(([,m])=>m.name).map(([id,m])=>[id,m.name])):new Map((roster||[]).map(m=>[m.id,m.name]))},
   subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)},send,direct,launch,leave,status,remove,toggleLock,
   async create(){
    if(!await peersAvailable()||closed)return;
    privateRoom(makeInviteCode(),true);
   },
   async join(value){
    const code=readInviteCode(value);
    if(!code){status('Enter the 12-character squad code.');return}
    if(await peersAvailable()&&!closed)privateRoom(code,false);
   },
   async quick(spec){
    if(!await peersAvailable()||closed)return;
    leave();const token=attempt;
    function find(slot){
     if(closed||attempt!==token)return;
     if(slot>=5){fail('All squads for this operation are deployed. Try again.');return}
     const code='q-'+spec.region+'-'+spec.mission+'-'+Number(!!spec.alert)+'-'+slot;
     connect(code,spec,busy=>{
      if(busy){find(slot+1);return}
      create(code,spec,()=>connect(code,spec,()=>find(slot+1)));
     });
    }
    status('Connecting to matchmaking…');
    try{
     find(0);
    }catch(error){if(!closed&&attempt===token)fail(error.message)}
   },
   returns(){
    if(!starting)return;
    starting=false;
    if(publicRoom)leave();else status(isHost?'Squad ready for another mission':'Connected · waiting for the host');
   },
   close(){closed=true;reset();listeners.clear()}
  };
 }
 return {open};
})();
