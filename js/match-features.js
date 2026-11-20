/* Match records stay with the browser profile and have no effect on progress. */
const combatRecordKey='sd-combat-record';
const recordLimit=30;
const combatDate=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'});
let recordView='mp';
const privateMatchResult=value=>value==='Victory'?'Victory':['Eliminated','Out of lives','You were eliminated'].includes(value)?'Eliminated':'Defeat';
function readCombatRecord(){
 try{
  const stored=JSON.parse(localStorage.getItem(combatRecordKey));
  if(Array.isArray(stored))return stored.filter(row=>row&&typeof row.map==='string'&&
   typeof row.mode==='string'&&typeof row.result==='string'&&Number.isFinite(row.at)&&
   row.at>0&&row.at<=8.64e15&&['kills','deaths','hits','shots','duration'].every(key=>Number.isFinite(row[key])))
   .slice(0,recordLimit).map(row=>({...row,result:privateMatchResult(row.result)}));
 }catch{}
 return [];
}
function saveCombatRecord(result){
 if(practiceSession||result==='Disconnected')return;
 const record={at:Date.now(),map:sel.map,mode,result:privateMatchResult(result),kills,deaths,hits,shots,
  duration:Math.max(0,Math.round(t0)),round:mode==='Zombies'?zq?.r||1:0,
  connection:window.SD_SPLIT?'Split screen':netOn?'Online':'Local'};
 const recent=[record,...readCombatRecord()].slice(0,recordLimit);
 try{localStorage.setItem(combatRecordKey,JSON.stringify(recent))}catch{}
}
function renderCombatRecord(view=recordView){
 recordView=view==='zm'?'zm':'mp';
 for(const button of $$('#record-tabs button'))button.setAttribute('aria-pressed',String(button.dataset.recordFilter===recordView));
 const panel=$('#combat-record'),rows=readCombatRecord().filter(row=>(row.mode==='Zombies')===(recordView==='zm'));
 if(!rows.length){panel.innerHTML='<p class="record-empty">Finish a match in this mode to start your record.</p>';return}
 const stats=rows.reduce((totals,row)=>{
  totals.kills+=row.kills;totals.deaths+=row.deaths;totals.hits+=row.hits;totals.shots+=row.shots;
  if(row.result==='Victory')totals.wins++;
  return totals;
 },{kills:0,deaths:0,hits:0,shots:0,wins:0});
 const accuracy=(hits,shots)=>shots?Math.min(100,Math.round(100*hits/shots))+'%':'—';
 const clock=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
 const summary=[['Recent matches',rows.length],['Kills / deaths',stats.kills+' / '+stats.deaths],['Accuracy',accuracy(stats.hits,stats.shots)]];
 if(recordView==='mp')summary.splice(1,0,['Wins',stats.wins]);
 else summary.splice(1,0,['Best round',Math.max(1,...rows.map(row=>Number(row.round)||1))]);
 panel.innerHTML='<dl class="record-stats">'+summary.map(([name,value])=>'<div><dt>'+name+'</dt><dd>'+value+'</dd></div>').join('')+
  '</dl><p class="record-note">Up to 30 completed matches on this browser.</p><div class="record-scroll"><table class="record-table">'+
  '<thead><tr><th>Match</th><th>Result</th><th>K / D</th><th>Accuracy</th><th>Time</th></tr></thead><tbody>'+
  rows.map(row=>'<tr><td><strong>'+esc(row.map)+'</strong><small>'+esc(row.mode)+' · '+esc(typeof row.connection==='string'?row.connection:'Local')+
   '</small><time>'+combatDate.format(row.at)+'</time></td><td>'+esc(row.result)+(row.mode==='Zombies'?' · Round '+(Number(row.round)||1):'')+
   '</td><td>'+row.kills+' / '+row.deaths+'</td><td>'+accuracy(row.hits,row.shots)+'</td><td>'+clock(row.duration)+'</td></tr>').join('')+
  '</tbody></table></div>';
}
$('#record-tabs').onclick=event=>{
 const button=event.target.closest('[data-record-filter]');
 if(button)renderCombatRecord(button.dataset.recordFilter);
};

/* The active life keeps its equipment until the player respawns. */
const nextLifeModes=new Set(['Private','Slayer','Time Attack','Team Deathmatch','Capture the Flag','Kill Confirmed','Hardpoint','Domination']);
let nextLifeSlot=null,activeLifeSlot=null;
function lifeLoadoutAllowed(){return run&&!over&&!practiceSession&&nextLifeModes.has(mode)}
function savedLifeLoadout(index){
 const loadout=index===LSL.cur?(menuLoadoutSnapshot||L):LSL.slots[index]?.L;
 if(!loadout||!PRI.includes(loadout.p)||!Array.isArray(loadout.pa)||
    !Array.isArray(loadout.sa)||!Array.isArray(loadout.pk))return null;
 return loadout;
}
function renderNextLifeLoadouts(){
 const panel=$('#next-loadout'),choices=$('#next-loadout-list');
 panel.hidden=!lifeLoadoutAllowed();
 if(panel.hidden)return;
 const active=activeLifeSlot??LSL.cur,selected=nextLifeSlot??active;
 choices.replaceChildren();
 for(let index=0;index<6;index++){
  const slot=savedLifeLoadout(index);
  if(!slot)continue;
  const button=document.createElement('button'),weapon=document.createElement('span');
  button.type='button';button.className='btn alt';
  button.textContent='Loadout '+(index+1);
  weapon.textContent=W[slot.p].n+(slot.s&&hasOwn(W,slot.s)?' / '+W[slot.s].n:'');
  button.append(weapon);
  button.setAttribute('aria-pressed',String(index===selected));
  if(index===active)button.dataset.active='true';
  button.onclick=()=>{
   if(!lifeLoadoutAllowed())return;
   nextLifeSlot=index===active?null:index;
   renderNextLifeLoadouts();choices.querySelector('[aria-pressed=true]')?.focus();
  };
  choices.append(button);
 }
 $('#next-loadout-status').textContent=nextLifeSlot===null?'Your current loadout is marked Active.':
  'Loadout '+(nextLifeSlot+1)+' will equip when you respawn.';
}
function applyNextLifeLoadout(){
 if(nextLifeSlot===null||!lifeLoadoutAllowed())return;
 const index=nextLifeSlot,slot=savedLifeLoadout(index);
 nextLifeSlot=null;
 if(!slot)return;
 menuLoadoutSnapshot||=L;
 L=JSON.parse(JSON.stringify(slot));
 if(L.s&&!hasOwn(W,L.s))L.s=null;
 sanitize();sanitizeMe();
 activeLifeSlot=index;
 delete P.os;
 P.msh=50+(PK('Overshield')?50:0);
 equipLifeWeapons();eqRefill();
 if($('#pause').style.display==='block')renderNextLifeLoadouts();
 msg('Loadout '+(index+1)+' equipped',1.5);
}
function resetLifeLoadouts(){
 if(menuLoadoutSnapshot){L=menuLoadoutSnapshot;menuLoadoutSnapshot=null}
 nextLifeSlot=activeLifeSlot=null;
 $('#next-loadout').open=false;
}

/* The host only forwards a mark to eligible squadmates. */
let markGeometry=null,lastLocalMark=0;
const markColors=['#ffcf64','#76e7ed'];
const squadMarksAllowed=()=>mode==='Zombies'||teamMode();
function validSquadMark(point){
 if(!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite)||point[1]<-8||point[1]>80)return false;
 const [x,,z]=point;
 return Math.abs(x)<=H+1&&Math.abs(z)<=H+1||mode==='Zombies'&&!!zq?.main?.fight&&zQuestInArena(x,z);
}
function showSquadMark(point,sender){
 const shared=!!sender;
 const mesh=new THREE.Mesh(markGeometry||=new THREE.OctahedronGeometry(.3),
  new THREE.MeshBasicMaterial({color:markColors[Number(shared)],depthTest:false,transparent:true,opacity:.92}));
 mesh.scale.y=1.45;mesh.renderOrder=3;mesh.position.fromArray(point);mesh.position.y+=.55;
 const previous=ST.pings.findIndex(mark=>mark.sender===sender);
 if(previous>=0)removeSquadMark(previous);
 if(ST.pings.length>=5)removeSquadMark(0);
 ST.pings.push({m:mesh,y:mesh.position.y,t:8,sender,color:markColors[Number(shared)]});S.add(mesh);
 msg(shared?(names[sender]||'Squadmate')+' marked a location':'Location marked',1.4);
 beep(shared?700:900,.1,'sine',.045);
}
function removeSquadMark(index){
 const [mark]=ST.pings.splice(index,1);
 if(mark){S.remove(mark.m);mark.m.material.dispose()}
}
function clearSquadMarks(){
 for(let i=ST.pings.length-1;i>=0;i--)removeSquadMark(i);
 lastLocalMark=0;
}
function placeSquadMark(){
 const now=performance.now();
 if(!run||P.dead||over||now-lastLocalMark<550)return;
 lastLocalMark=now;
 const eye=C.position.clone(),direction=aimDir(),distance=castW(eye,direction,120);
 const marker=eye.addScaledVector(direction,distance>=120?35:distance);
 let point=marker.toArray().map(value=>+value.toFixed(2));
 if(!validSquadMark(point)){
  marker.set(cl(marker.x,-H,H),cl(marker.y,-8,80),cl(marker.z,-H,H));
  point=marker.toArray().map(value=>+value.toFixed(2));
 }
 showSquadMark(point,'');
 if(netOn&&squadMarksAllowed()){
  if(isHost)shareSquadMark(point,myId);
  else netSend({t:'mark',point});
 }
}
function shareSquadMark(point,sender,link){
 if(!run||!netOn||!isHost||!squadMarksAllowed()||!hasOwn(names,sender)||!validSquadMark(point))return;
 const team=mpTeams[sender],recipient=id=>mode==='Zombies'||(team==='A'||team==='B')&&mpTeams[id]===team;
 if(link){
  const now=performance.now(),position=link.vt?.last;
  if(now<(link.markAfter||0)||position&&Math.hypot(point[0]-position.x,point[2]-position.z)>124)return;
  link.markAfter=now+760;
 }
 const packet=gamePacket({t:'mark',id:sender,point});
 if(!packet)return;
 for(const peer of conns)if(peer.open&&peer.vf&&!peer.blocked&&peer.peer!==sender&&recipient(peer.peer))sendPeerPacket(peer,packet);
 if(sender!==myId&&recipient(myId))showSquadMark(point,sender);
}
function receiveSquadMark(packet){
 if(!run||over||!squadMarksAllowed()||!hasOwn(names,packet.id)||
    mode!=='Zombies'&&mpTeams[packet.id]!==myTeam||!validSquadMark(packet.point))return;
 showSquadMark(packet.point,packet.id);
}
