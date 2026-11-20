const inviteAlphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const inviteLength=12;
const partyInviteLength=6;
const dataChannelLabel='spartan-data-1';
const peerWireLimit=128*1024;
const wireEncoder=new TextEncoder();
function directPeerConfig(){
 return {debug:0,secure:true,referrerPolicy:'no-referrer',config:{
  iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'},
   {urls:['turn:eu-0.turn.peerjs.com:3478','turn:us-0.turn.peerjs.com:3478'],username:'peerjs',credential:'peerjsp'}],
  iceTransportPolicy:'all',sdpSemantics:'unified-plan'
 }};
}
function allowedPeerOffer(message){
 if(!message||typeof message.type!=='string')return false;
 if(message.type!=='OFFER')return true;
 const offer=message.payload;
 return offer?.type==='data'&&offer.serialization==='raw'&&offer.label===dataChannelLabel;
}
function createDataPeer(id){
 const Client=window.Peer;
 // PeerJS 1.5.4 chooses a decoder before it emits 'connection'. Reject
 // other offers before that dispatch. The dependency is pinned by SRI.
 if(typeof Client?.prototype._handleMessage!=='function')throw Error('Secure multiplayer transport is unavailable.');
 class DataPeer extends Client{
  _handleMessage(message){if(allowedPeerOffer(message))super._handleMessage(message)}
 }
 // Use an unpredictable client ID so joining does not depend on the
 // separate PeerServer HTTP ID allocation endpoint.
 const address=id||'sd-client-'+Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
 return new DataPeer(address,directPeerConfig());
}
function connectDataPeer(peer,id){
 return peer.connect(id,{reliable:true,serialization:'raw',label:dataChannelLabel});
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
