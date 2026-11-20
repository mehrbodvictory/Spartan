const inviteAlphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const inviteLength=12;
const partyInviteLength=6;
const dataChannelLabel='spartan-data-1';
const peerWireLimit=128*1024;
const wireEncoder=new TextEncoder();
const relayURL=new URL('sd-relay',location.href);
let gameRelayAvailable=false;
const gameRelayReady=typeof AbortController!=='function'||typeof fetch!=='function'||location.protocol==='file:'
 ?Promise.resolve():(()=>{
  const cancel=new AbortController(),timer=setTimeout(()=>cancel.abort(),2500);
  return fetch(relayURL,{cache:'no-store',redirect:'error',signal:cancel.signal})
   .then(response=>{gameRelayAvailable=response.status===204&&response.headers.get('X-Spartan-Relay')==='1'})
   .catch(()=>{}).finally(()=>clearTimeout(timer));
 })();
class RelayEvents{
 constructor(){this.events=new Map()}
 on(name,listener){
  if(!this.events.has(name))this.events.set(name,[]);
  this.events.get(name).push(listener);return this;
 }
 emit(name,value){for(const listener of this.events.get(name)||[])listener(value)}
}
class RelayLink extends RelayEvents{
 constructor(owner,peer){super();this.owner=owner;this.peer=peer;this.open=false;this.relayed=true}
 start(binding){if(!this.open){this.binding=binding;this.open=true;this.emit('open')}}
 send(frame){if(this.open)this.owner.queue({type:'data',peer:this.peer,frame})}
 close(notify=true){
  if(this.owner.links.get(this.peer)!==this)return;
  this.owner.links.delete(this.peer);this.open=false;
  if(notify)this.owner.queue({type:'close',peer:this.peer});
  this.emit('close');
 }
}
class GameRelayPeer extends RelayEvents{
 constructor(id){
  super();this.id=id;this.open=false;this.destroyed=false;this.token='';
  this.links=new Map();this.outbox=[];this.sending=false;this.timer=0;
  this.cancel=new AbortController();
  this.register();
 }
 request(action,body,detached=false){
  const headers={'Content-Type':'application/json'};
  if(this.token)headers['X-Spartan-Session']=this.token;
  return fetch(relayURL.href+'/'+action,{
   method:'POST',headers,body:JSON.stringify(body),cache:'no-store',redirect:'error',
   signal:detached?undefined:this.cancel.signal,keepalive:detached
  });
 }
 async register(){
  try{
   const reply=await this.request('open',this.id,true);
   if(!reply.ok){this.fail(reply.status===409?'unavailable-id':'relay-unavailable');return}
   this.token=await reply.json();
   if(this.destroyed){this.request('leave',null,true).catch(()=>{});return}
   this.open=true;this.emit('open',this.id);this.poll();
  }catch{this.fail('relay-unavailable')}
 }
 async poll(){
  try{
   while(this.open){
    const response=await this.request('poll',null);
    if(!response.ok)throw Error();
    for(const event of await response.json())if(this.open)this.receive(event);
   }
  }catch{this.fail('relay-disconnected')}
 }
 receive({type,peer,frame,binding}){
  let link=this.links.get(peer);
  if(type==='connect'&&!link){
   link=new RelayLink(this,peer);this.links.set(peer,link);
   this.emit('connection',link);
   if(this.links.get(peer)===link)link.start(binding);
  }else if(type==='open'&&link)link.start(binding);
  else if(type==='close')link?.close(false);
  else if(type==='missing')this.emit('error',{type:'peer-unavailable',peer});
  else if(type==='data'&&link?.open)link.emit('data',frame);
 }
 connect(id){
  if(this.links.has(id))return this.links.get(id);
  const link=new RelayLink(this,id);this.links.set(id,link);
  this.queue({type:'connect',peer:id});return link;
 }
 queue(event){
  if(!this.open)return;
  this.outbox.push(event);
  if(this.outbox.length>512){this.fail('relay-overloaded');return}
  if(!this.sending&&!this.timer)this.timer=setTimeout(()=>this.flush(),16);
 }
 async flush(){
  this.timer=0;this.sending=true;
  try{
   while(this.open&&this.outbox.length){
    const batch=[];let bytes=0;
    while(this.outbox.length&&batch.length<100){
     const size=wireEncoder.encode(JSON.stringify(this.outbox[0])).length+1;
     if(batch.length&&bytes+size>600*1024)break;
     bytes+=size;batch.push(this.outbox.shift());
    }
    const response=await this.request('send',batch);
    if(!response.ok)throw Error();
   }
  }catch{this.fail('relay-disconnected')}
  finally{this.sending=false}
 }
 fail(type){
  if(this.destroyed)return;
  this.emit('error',{type});
  this.destroy();
 }
 reconnect(){}
 destroy(){
  if(this.destroyed)return;
  this.destroyed=true;this.open=false;clearTimeout(this.timer);this.cancel.abort();
  if(this.token)this.request('leave',null,true).catch(()=>{});
  for(const link of this.links.values())link.close(false);
  this.outbox.length=0;
 }
}
function directPeerConfig(){
 return {debug:0,secure:true,referrerPolicy:'no-referrer',config:{
  iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'},
   {urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478',
    'turn:eu-0.turn.peerjs.com:3478?transport=tcp','turn:us-0.turn.peerjs.com:3478?transport=tcp'],username:'peerjs',credential:'peerjsp'},
  ],
  iceTransportPolicy:'all',sdpSemantics:'unified-plan'
 }};
}
function allowedPeerOffer(message){
 if(!message||typeof message.type!=='string')return false;
 if(message.type!=='OFFER')return true;
 const offer=message.payload;
 return offer?.type==='data'&&offer.serialization==='raw'&&offer.label===dataChannelLabel;
}
function createDirectPeer(Client,address){
 // PeerJS 1.5.4 chooses a decoder before it emits 'connection'. Reject
 // other offers before that dispatch. The dependency is pinned by SRI.
 if(typeof Client?.prototype._handleMessage!=='function')throw Error('Secure multiplayer transport is unavailable.');
 class DataPeer extends Client{
  _handleMessage(message){if(allowedPeerOffer(message))super._handleMessage(message)}
 }
 // Use an unpredictable client ID so joining does not depend on the
 // separate PeerServer HTTP ID allocation endpoint.
 return new DataPeer(address,directPeerConfig());
}
// Both routes register the same room ID. A guest can change routes without
// making the leader create a second code.
class RoutedRoomPeer extends RelayEvents{
 constructor(id,direct,relay){
  super();this.id=id;this.routes=[direct,relay];
  this.destroyed=false;this.started=false;this.errors=new Map();this.pending=null;this.lastRoute=null;
  for(const route of this.routes){
   route.on('open',()=>{
    console.info('[net] Ready: '+(route===relay?'HTTPS relay':'WebRTC signaling'));
    this.errors.delete(route);
    if(!this.started&&!this.destroyed){this.started=true;this.emit('open',id)}
   });
   route.on('connection',link=>{if(!this.destroyed)this.emit('connection',link);else link.close()});
   route.on('disconnected',()=>{
    if(!this.destroyed)try{route.reconnect()}catch{}
   });
   route.on('error',error=>{
    if(this.destroyed)return;
    console.info('[net] '+(route===relay?'HTTPS relay':'WebRTC')+': '+error.type);
    if(this.pending?.route===route&&error.type==='peer-unavailable'){
     this.pending.unavailable();return;
    }
    if(error.type==='peer-unavailable'||route.open)return;
    this.errors.set(route,error);
    if(this.errors.size===this.routes.length&&!this.open&&!this.pending)this.emit('error',error);
   });
  }
 }
 get open(){return !this.destroyed&&this.routes.some(route=>route.open)}
 connect(id){return new RoutedRoomLink(this,id)}
 reconnect(){
  for(const route of this.routes)if(route.disconnected&&!route.destroyed)try{route.reconnect()}catch{}
 }
 destroy(){
  if(this.destroyed)return;
  this.destroyed=true;this.pending?.close();
  for(const route of this.routes)route.destroy();
 }
}

class RoutedRoomLink extends RelayEvents{
 constructor(owner,peer){
  super();this.owner=owner;this.peer=peer;this.link=null;this.route=null;
  this.closed=false;this.timer=0;this.open=false;this.tried=new Set();this.missing=0;
  this.preferredUntil=Date.now()+1000;
  owner.pending=this;queueMicrotask(()=>this.next());
 }
 get peerConnection(){return this.link?.peerConnection}
 get relayed(){return this.link?.relayed}
 get binding(){return this.link?.binding}
 send(frame){if(this.open)this.link.send(frame)}
 next(){
  if(this.closed||this.owner.destroyed)return;
  const {routes,lastRoute}=this.owner;
  const preferred=lastRoute===routes[0]?[routes[1],routes[0]]:routes;
  const remaining=preferred.filter(route=>!this.tried.has(route));
  const route=remaining.find(route=>route.open);
  const first=remaining[0];
  if(!this.tried.size&&route&&route!==first&&!first.destroyed&&!this.owner.errors.has(first)&&Date.now()<this.preferredUntil){
   this.timer=setTimeout(()=>this.next(),100);return;
  }
  if(!route&&remaining.some(candidate=>!candidate.destroyed&&!this.owner.errors.has(candidate))){
   if(!this.waitUntil)this.waitUntil=Date.now()+2500;
   if(Date.now()<this.waitUntil){this.timer=setTimeout(()=>this.next(),100);return}
  }
  if(!route){
   if(this.missing>0&&this.missing===this.tried.size&&remaining.every(candidate=>candidate.destroyed)){
    this.owner.emit('error',{type:'peer-unavailable',peer:this.peer});
   }
   this.close();return;
  }
  this.waitUntil=0;this.route=route;this.tried.add(route);
  console.info('[net] Trying '+(route===routes[1]?'HTTPS relay':'WebRTC'));
  let link;
  try{link=connectDataPeer(route,this.peer)}catch{}
  if(this.closed)return;
  if(!link){this.next();return}
  this.link=link;
  this.emit('transport');
  const retry=()=>{if(this.link===link&&!this.open)this.retry()};
  this.timer=setTimeout(retry,5500);
  link.on('open',()=>{
   if(this.closed||this.link!==link)return;
   clearTimeout(this.timer);this.open=true;this.owner.pending=null;this.owner.lastRoute=route;this.emit('open');
  });
  link.on('data',frame=>{if(this.open&&this.link===link)this.emit('data',frame)});
  link.on('error',retry);
  link.on('close',()=>{if(this.link===link){if(this.open)this.close(false);else retry()}});
 }
 unavailable(){
  if(this.open||this.closed)return;
  this.missing++;this.retry();
 }
 retry(){
  clearTimeout(this.timer);
  const prior=this.link;this.link=null;this.route=null;prior?.close();this.next();
 }
 close(notify=true){
  if(this.closed)return;
  this.closed=true;this.open=false;clearTimeout(this.timer);
  if(this.owner.pending===this)this.owner.pending=null;
  const link=this.link;this.link=null;
  if(notify)link?.close();
  this.emit('close');
 }
}
function createDataPeer(id){
 const address=id||'sd-client-'+Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
 const Client=window.Peer;
 const hasDirect=typeof Client?.prototype._handleMessage==='function';
 if(!hasDirect&&!gameRelayAvailable)throw Error('Secure multiplayer transport is unavailable.');
 const direct=hasDirect?createDirectPeer(Client,address):null;
 if(!gameRelayAvailable)return direct;
 const relay=new GameRelayPeer(address);
 return direct?new RoutedRoomPeer(address,direct,relay):relay;
}
function connectDataPeer(peer,id){
 return peer.connect(id,{reliable:true,serialization:'raw',label:dataChannelLabel});
}
// An ICE negotiation can stall without emitting an error or a close event.
// Try a fresh data channel while retaining the same signaling ID and invite.
function connectRoomPeer(peer,id,attach,retrying,failed){
 let attempts=0;
 function open(){
  const link=connectDataPeer(peer,id);
  if(!link){failed();return}
  const timer=setTimeout(()=>{
   if(peer.destroyed||link.open)return;
   link.replacing=true;
   link.close();
   if(++attempts<2&&peer.open){retrying(link);open()}else failed();
  },15000);
  link.on('open',()=>clearTimeout(timer));
  link.on('close',()=>clearTimeout(timer));
  attach(link);
 }
 open();
}
function encodePeerPacket(data){
 try{
  const frame=JSON.stringify(data);
  if(typeof frame==='string'&&frame.length<=peerWireLimit&&wireEncoder.encode(frame).byteLength<=peerWireLimit)return frame;
 }catch{}
 return null;
}
function sendPeerPacket(link,data){
 if(!link?.open)return;
 const frame=encodePeerPacket(data);
 if(frame!==null)link.send(frame);
}
function makeInviteCode(length=inviteLength){
 return Array.from(crypto.getRandomValues(new Uint8Array(length)),byte=>inviteAlphabet[byte&31]).join('');
}
function readInviteCode(value,length=inviteLength){
 const code=typeof value==='string'?value.toUpperCase().replace(/[\s-]/g,''):'';
 return code.length===length&&[...code].every(letter=>inviteAlphabet.includes(letter))?code:'';
}
function onlineName(value,fallback='Player'){
 return typeof value==='string'&&value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').trim().slice(0,20)||fallback;
}
function privateChannelBinding(link){
 if(link.relayed)return link.binding?'Spartan Drill same-origin relay v1\n'+link.binding:'';
 const connection=link.peerConnection;
 const fingerprint=description=>description?.sdp?.match(/^a=fingerprint:sha-256 ((?:[0-9a-f]{2}:){31}[0-9a-f]{2})\r?$/im)?.[1].toLowerCase();
 const local=fingerprint(connection?.localDescription),remote=fingerprint(connection?.remoteDescription);
 return local&&remote?[local,remote].sort().join('\n'):'';
}
async function inviteIdentity(scope,code){
 const subtle=globalThis.crypto?.subtle;
 if(!subtle)throw Error('Use HTTPS or localhost for online play.');
 const bytes=new TextEncoder(),domain='Spartan Drill private room v1\n'+scope+'\n';
 const route=await subtle.digest('SHA-256',bytes.encode(domain+'route\n'+code));
 const key=await subtle.importKey('raw',bytes.encode(code),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
 const hex=data=>Array.from(new Uint8Array(data),byte=>byte.toString(16).padStart(2,'0')).join('');
 const message=(role,nonce)=>bytes.encode(domain+'auth\n'+role+'\n'+nonce);
 return {
  id:'sd-'+scope+'-'+hex(route).slice(0,36),
  async proof(role,nonce){return hex(await subtle.sign('HMAC',key,message(role,nonce)))},
  verify(role,nonce,proof){
   if(typeof proof!=='string'||!(/^[0-9a-f]{64}$/).test(proof))return false;
   const signature=Uint8Array.from(proof.match(/../g),byte=>parseInt(byte,16));
   return subtle.verify('HMAC',key,signature,message(role,nonce));
  }
 };
}
/* Limit wire frames before JSON.parse, then check the decoded structure.
   The burst allowance leaves room for a reconnect or destruction snapshot. */
function peerPackets(link,field,receive,reject){
 const capacity=280,refill=170,byteCapacity=512*1024,byteRefill=256*1024;
 let tokens=capacity,bytes=byteCapacity,last=performance.now(),strikes=0,lastStrike=last,closed=false;
 link.on('data',frame=>{
  if(closed)return;
  const now=performance.now(),seconds=(now-last)/1000;
  last=now;tokens=Math.min(capacity,tokens+seconds*refill);
  bytes=Math.min(byteCapacity,bytes+seconds*byteRefill);
  if(tokens>=1){
   tokens--;
   const size=typeof frame==='string'&&frame.length<=peerWireLimit?wireEncoder.encode(frame).byteLength:0;
   if(size&&size<=peerWireLimit&&size<=bytes){
    bytes-=size;
    let data;
    try{data=JSON.parse(frame)}catch{}
    if(peerPacketSize(data,field)){receive(data);return}
   }
  }
  if(now-lastStrike>5000)strikes=0;
  lastStrike=now;
  if(++strikes>=24){closed=true;reject()}
 });
}

function peerPacketSize(data,field){
 if(!data||Object.getPrototypeOf(data)!==Object.prototype||
    !Object.prototype.hasOwnProperty.call(data,field)||
    typeof data[field]!=='string'||!data[field]||data[field].length>36)return 0;
 const limit=160*1024;
 let size=0;
 function visit(value,depth){
  if(depth>10)return false;
  if(value==null||typeof value==='boolean')size+=5;
  else if(typeof value==='number'){if(!Number.isFinite(value))return false;size+=12}
  else if(typeof value==='string')size+=value.length*3+3;
  else if(Array.isArray(value)){
   if(value.length>12000)return false;
   size+=2+value.length;
   for(const item of value)if(!visit(item,depth+1))return false;
  }else if(value&&Object.getPrototypeOf(value)===Object.prototype){
   const keys=Object.keys(value);
   if(keys.length>128)return false;
   for(const key of keys){
    if(key==='__proto__'||key==='constructor'||key==='prototype')return false;
    size+=key.length*3+4;
    if(size>limit||!visit(value[key],depth+1))return false;
   }
  }else return false;
  return size<=limit;
 }
 return visit(data,0)?size:0;
}
