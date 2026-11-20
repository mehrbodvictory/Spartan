/* The party stays on the existing verified peer connection while each mode
   owns its match state. Only the leader can issue a deployment. */
const partyDialog=$('#game-party'),partySubscribers=new Set(),partyUpdates=new Set();
let partyOperation=0,partyOperationOpen=false,partyLine='',partySequence=0;
const partyReceived=new Map();
function resetPartyTraffic(){partySequence=0;partyReceived.clear()}
const stampPartyPacket=payload=>({...payload,sequence:++partySequence});
function partyLeader(){return isHost?myId:hostPid}
function partyStatus(line){
 if(typeof line==='string')partyLine=line;
 const count=Object.keys(names).length;
 const linked=!!(partyActive&&net?.open&&(isHost||conns.some(c=>c.vf&&c.open)));
 const host=isHost===1;
 const status=linked?(partyLine||(host?'Pick a mode and deploy when your party is ready.':'Waiting for the leader to deploy.')):(partyLine||'Create a party or join with a friend’s code.');
 $('#party-status').textContent=status;
 $('#party-connected').hidden=!(partyActive&&net);
 $('#party-join-form').hidden=!!(partyActive&&net);
 $('#party-code').textContent=partyCode;
 $('#party-members').replaceChildren(...Object.entries(names).map(([id,name])=>{
  const li=document.createElement('li');
  li.textContent=name+(id===partyLeader()?' (Leader)':'')+(id===myId?' · You':'');
  appendPeerRemoval(li,id);return li;
 }));
 for(const button of $$('.party-open')){
  button.dataset.linked=String(linked);
  button.setAttribute('aria-label',linked?'Party · '+count+' / 4':'Party');
  if(button.closest('#home'))button.textContent=linked?'Party · '+count+'/4':'Party';
 }
 $('#zdeploy').textContent=!partyActive?'Deploy solo':isHost?'Deploy party':'Waiting for leader';
 $('#zdeploy').disabled=!!(partyActive&&!isHost);
 for(const update of partyUpdates)update({
  room:partyActive?partyCode:'',isHost:host,publicRoom:false,connected:linked,starting:partyOperationOpen,locked:roomLocked,message:status,
  members:Object.entries(names).map(([id,name])=>({id,name,host:id===partyLeader()}))
 });
}
function openGameParty(){
 if(window.SD_SPLIT||run)return;
 partyStatus();
 if(!partyDialog.open)partyDialog.showModal();
}
for(const button of $$('.party-open')){
 button.disabled=!!window.SD_SPLIT;button.onclick=openGameParty;
}
$('#party-close').onclick=()=>partyDialog.close();
$('#party-create').onclick=()=>{if(!window.Peer){partyStatus('Matchmaking could not load. Reload the game to retry.');return}hostMatch(null,true)};
$('#party-join-form').onsubmit=event=>{
 event.preventDefault();
 if(!window.Peer){partyStatus('Matchmaking could not load. Reload the game to retry.');return}
 joinMatch($('#party-join-code').value,true);
};
$('#party-leave').onclick=()=>{netClose();partyStatus('You left the party.')};
$('#party-copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(partyCode);partyStatus('Party code copied.')}
 catch{partyStatus('Share code '+partyCode+'.')}
};
function partyClosed(){
 if(partyOperationOpen)partyDispatch({type:'lost'},partyLeader());
 partyOperationOpen=false;partyOperation=0;partyLine='';resetPartyTraffic();
}
function partyMemberLeft(id){partyReceived.delete(id);partyDispatch({type:'left'},id)}
function partyDispatch(payload,id){for(const listener of partySubscribers)listener(payload,id)}
function partyBeforeMatch(map,kind){
 partyDialog.close();
 if(stormwatchHub)stormwatchGoHome(false);
 partyOperationOpen=false;
 if(run||fin)exitNetworkMatch(true);
 setApp(kind==='Zombies'?'zm':'mp');
 if(kind==='Zombies')sel.zmap=map;
}
function partyStartStormwatch(spec){
 if(!partyActive||!isHost||!net?.open||run||partyOperationOpen)return false;
 const payload={type:'launch',round:++partyOperation,spec:{...spec,seed:crypto.getRandomValues(new Uint32Array(1))[0]}};
 partyDialog.close();partyOperationOpen=true;resetPartyTraffic();
 netSend({t:'party-sw-launch',payload});
 partyDispatch(payload,myId);partyStatus('Deploying the party into Stormwatch.');return true;
}
function partyReadStormwatch(d,cn){
 if(!partyActive||!cn.vf||!d.payload||typeof d.payload.type!=='string')return;
 const payload=d.payload;
 if(d.t==='party-sw-launch'){
  if(isHost||cn.peer!==hostPid||d.id!==hostPid||!Number.isInteger(payload.round)||payload.round<=partyOperation)return;
  const spec=payload.spec;
  if(payload.type!=='launch'||!spec||!['timbervale','ironridge','canyonlands','obsidian'].includes(spec.region)||
   !hasOwn(StormwatchOperations.missions,spec.mission)||!Number.isInteger(spec.seed))return;
  partyOperation=payload.round;partyOperationOpen=true;partyDialog.close();resetPartyTraffic();
  if(run||fin)exitNetworkMatch(true);
  if(!stormwatchHub)stormwatchOpen();
  partyDispatch(payload,hostPid);partyStatus('Deploying the party into Stormwatch.');return;
 }
 if(d.t!=='party-sw'||payload.round!==partyOperation||!partyOperationOpen&&payload.type!=='end'||
    !Number.isSafeInteger(payload.sequence)||payload.sequence<=(partyReceived.get(cn.peer)||0))return;
 if(isHost?!['pose','action','withdraw'].includes(payload.type):cn.peer!==hostPid||d.id!==hostPid)return;
 partyReceived.set(cn.peer,payload.sequence);partyDispatch(payload,cn.peer);
}
function partyStormwatchAdapter(update){
 const localListeners=new Set();
 partyUpdates.add(update);
 return {
  get id(){return myId},get host(){return !!isHost},get room(){return partyActive?partyCode:''},
  get size(){return Object.keys(names).length||1},get names(){return new Map(Object.entries(names))},
  status(){partyStatus()},
  subscribe(fn){partySubscribers.add(fn);localListeners.add(fn);return ()=>{partySubscribers.delete(fn);localListeners.delete(fn)}},
  send(payload){netSend({t:'party-sw',payload:stampPartyPacket(payload)})},
  direct(id,payload){sendPeerPacket(conns.find(c=>c.peer===id&&c.vf&&c.open),{t:'party-sw',id:myId,payload:stampPartyPacket(payload)})},
  launch:partyStartStormwatch,
  create:openGameParty,join:openGameParty,quick:openGameParty,remove:removeRoomPeer,toggleLock:toggleRoomLock,
  leave(){netClose();stormwatchGoHome(false);stormwatchOpen()},
  returns(){partyOperationOpen=false;partyStatus(isHost?'Pick another operation or game mode.':'Waiting for the leader to deploy.')},
  close(){partyUpdates.delete(update);for(const fn of localListeners)partySubscribers.delete(fn);localListeners.clear()}
 };
}
partyReady=true;partyStatus();
