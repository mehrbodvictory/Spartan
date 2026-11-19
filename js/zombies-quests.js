function zQuestInteract(q,id,x,z,prompt,apply){
 const r=id==='altar'?2.4:2.05;
 const use=by=>{
  const pl=zPlayers().find(p=>p.id===by);
  if(q!==zq.main||!pl||!prompt()||Math.hypot(x-pl.x,z-pl.z)>r+(pl.me?0:.3)||Math.abs(pl.y)>.95)return;
  const dx=x-pl.x,dz=z-pl.z,d=Math.hypot(dx,dz);
  if(d>.1&&castW(V(pl.x,1.15,pl.z),V(dx/d,0,dz/d),d)<d-.16)return;
  apply(by);
 };
 (q.actions||(q.actions=new Map())).set(id,use);
 zi.push({x,z,r,txt:prompt,cost:()=>0,act:()=>zCli()?netSend({t:'zmainuse',a:id}):use(zMe())});
}
function zQuestProp(q,x,z,kind,index){
 const g=new THREE.Group();
 g.position.set(x,0,z);
 zG.add(g);
 const gold=eM(q.london?0x9a703c:0x66535b,0,.48,.52);
 const base=eM(q.london?0x263036:0x49444e,0,.83,.12);
 const lit=new THREE.MeshBasicMaterial({color:q.def.color});
 let rotor=null;
 if(kind==='paper'){
  const room=q.london?'WESTMINSTER CLOCK WORKS':'HOLLOW ESTATE';
  eMk(g,EG.box,base,0,.47,0,.56,.94,.43);
  eMk(g,EG.box,gold,0,.93,0,.67,.1,.55);
  const plate=eCanvasMat(256,160,(ctx,w,h)=>{
   ctx.fillStyle='#c1af8f';ctx.fillRect(0,0,w,h);
   ctx.strokeStyle='#352a22';ctx.lineWidth=4;ctx.strokeRect(8,8,w-16,h-16);
   ctx.fillStyle='#352a22';ctx.textAlign='center';ctx.font='bold 17px Georgia';
   ctx.fillText(room,w/2,39);
   for(let i=0;i<5;i++)ctx.fillRect(30,60+i*15,165+(i%3)*12,2);
  },true);
  eMk(g,EG.pl,plate,0,1,0,.56,.34,1,-1.28,q.london?.35:0);
 }else if(kind==='relic'){
  if(q.london)eMk(g,EG.cyl,base,0,.47,0,.69,.94,.69);
  rotor=new THREE.Group();rotor.position.y=q.london?1.13:1.09;g.add(rotor);
  eMk(rotor,EG.cyl,gold,0,0,0,.23,.075,.23,Math.PI/2);
  eMk(rotor,EG.cyl,lit,0,0,.046,.095,.032,.095,Math.PI/2);
  for(let i=0;i<8;i++){
   const t=i*Math.PI/4;
   eMk(rotor,EG.box,gold,.23*Math.sin(t),.23*Math.cos(t),0,.065,.095,.075,0,0,-t);
  }
 }else{
  const altar=kind==='altar',w=altar?.88:.62;
  eMk(g,EG.cyl,base,0,.16,0,w,.32,w);
  eMk(g,EG.cyl,base,0,.62,0,w*.67,.72,w*.67);
  eMk(g,EG.cyl,gold,0,.97,0,w,.15,w);
  rotor=new THREE.Group();rotor.position.y=1.17;g.add(rotor);
  if(q.london){
   eMk(rotor,EG.cyl,gold,0,0,0,w*.43,.22,w*.43);
   eMk(rotor,EG.cyl,lit,0,.119,0,w*.28,.018,w*.28);
   for(const side of [-1,1])eMk(g,EG.box,gold,side*w*.34,1.18,0,.082,.4,.18,0,0,side*.23);
  }else{
   eMk(g,EG.cyl,gold,0,1.07,0,w*.79,.08,w*.79);
   eMk(rotor,EG.sph,lit,0,.07,0,.12,.24,.12,0,0,.17);
   eMk(rotor,EG.sph,lit,0,.27,0,.071,.16,.071,0,0,-.37);
  }
 }
 q.props.push({g,kind,index,rotor,lit});
}
function zQuestNotice(q,line){
 msg(line,3.5);
 if(netOn&&isHost)netSend({t:'zmainnote',line});
}
function zQuestCue(q,x,z,big,remote=false){
 burst(V(x,1.1,z),big?35:13,q.def.color,big?6:2.6,big?1.05:.58,.13);
 if(Math.hypot(P.x-x,P.z-z)<28){
  if(big){beep(q.london?83:61,1.15,'triangle',.12);noise(.42,240,.52);shake=Math.max(shake,.56)}
  else beep(q.london?465:330,.25,'triangle',.085);
 }
 if(netOn&&isHost&&!remote)netSend({t:'zmaincue',x,z,big});
}
function zQuestReward(q){
 if(q.rewarded||!q.credit.includes(zMe()))return;
 q.rewarded=true;
 const id=q.def.skin,name=OPERATORS[id].name;
 const first=prof.zquest?.[id]!==true;
 if(first){
  prof.zquest={...prof.zquest,[id]:true};
  save();
 }
 popup(q.def.title.toUpperCase(),first?'Locker reward unlocked · '+name:q.def.boss+' defeated');
 zq.pts+=2500;
 beep(523,.28,'triangle',.1);
 setTimeout(()=>{if(zq?.main===q&&run)beep(784,.62,'triangle',.1)},190);
}
function zQuestClear(q){
 for(const hz of q.hazards.values())zQuestDropHazard(q,hz);
}
function zQuestHazard(q,kind,x,z,r,wind){
 const id=++q.serial;
 const duration=kind==='wave'?1.9:kind==='hex'?3.8:.34;
 const h=zQuestHazardView(q,id,kind,x,z,r,wind,duration);
 h.age=-wind;h.hits=new Set();h.pulse=0;
}
function zQuestHazardView(q,id,kind,x,z,r,wind,duration){
 const g=new THREE.Group();g.position.set(x,.15,z);q.fx.add(g);
 const shape=(geo,opacity,y)=>{
  const mat=new THREE.MeshBasicMaterial({color:q.def.color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
  const m=new THREE.Mesh(geo,mat);m.position.y=y;m.rotation.x=-Math.PI/2;g.add(m);return m;
 };
 const geo=q.hazardGeo||(q.hazardGeo={
  ring:new THREE.RingGeometry(.84,1,48),fill:new THREE.CircleGeometry(1,48),
  beam:new THREE.CylinderGeometry(.025,.96,1,12,1,true)
 });
 const ring=shape(geo.ring,.8,.005),fill=shape(geo.fill,.21,0);
 const flare=kind==='wave'?null:new THREE.Mesh(geo.beam,new THREE.MeshBasicMaterial({
  color:q.def.color,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 }));
 if(flare){flare.position.y=2.15;g.add(flare)}
 const h={id,kind,x,z,r,wind,duration,age:-wind,g,ring,fill,flare};
 q.hazards.set(id,h);return h;
}
function zQuestDropHazard(q,h){
 q.fx.remove(h.g);h.g.traverse(o=>{if(o.isMesh)o.material.dispose()});q.hazards.delete(h.id);
}
function zQuestTouch(q,pl,b,damage){
 if(pl.me){
  if(zq.dash?.t>0)return;
  hurt(damage,b);shake=Math.max(shake,.44);
 }else if(netOn)netSend({t:'zmainhit',to:pl.id,d:damage});
}
function zQuestHazardTick(q,dt,players){
 for(const h of q.hazards.values()){
  const was=h.age;h.age+=dt;
  if(h.age>=h.duration){zQuestDropHazard(q,h);continue}
  const warning=h.age<0,progress=warning?1+h.age/h.wind:h.age/h.duration;
  const wave=h.kind==='wave',radius=wave?(warning?1.25:.85+(h.r-.85)*progress):h.r;
  h.ring.scale.setScalar(radius);
  h.ring.material.opacity=warning?.62+.3*Math.sin(progress*22)**2:wave?.92-.35*progress:.72;
  h.fill.visible=!wave;
  h.fill.scale.setScalar(warning?radius*(.3+.7*progress):radius);
  h.fill.material.opacity=warning?.13+.15*progress:.25*(1-progress)+.1;
  if(h.flare){
   h.flare.scale.set(radius*.66,warning?1:Math.max(.7,4.3*(1-progress)),radius*.66);
   h.flare.material.opacity=warning?0:(h.kind==='hex'?.43:.75)*(1-progress);
  }
  if(was<0&&!warning){
   if(Math.hypot(h.x-P.x,h.z-P.z)<26){noise(wave?.6:.26,wave?165:450,.45);shake=Math.max(shake,.24)}
   burst(V(h.x,.36,h.z),wave?35:23,q.def.color,5,.7,.13);
  }
  if(!players||warning)continue;
  if(h.kind==='hex'&&h.age>=h.pulse){h.pulse+=.78;h.hits.clear()}
  for(const pl of players){
   if(h.hits.has(pl.id))continue;
   const d=Math.hypot(pl.x-h.x,pl.z-h.z);
   let hit=wave?Math.abs(d-radius)<Math.max(.95,dt*12)&&pl.y<.72:d<=radius;
   if(hit&&!wave)hit=pl.y<1.65;
   if(!hit)continue;
   h.hits.add(pl.id);
   zQuestTouch(q,pl,q.actor,wave?32+q.phase*5:h.kind==='hex'?(h.age<.75?28:12):27+q.phase*5);
  }
 }
}

/* Quest progress and encounter decisions belong to the Zombies host. */
const ZMAIN={
 London:{
  skin:'bellwatch',title:'The Thirteenth Hour',boss:'The Bellkeeper',color:0xffba67,
  realm:'The Unwound Belfry',ink:0x18161f,entry:[8,-36],
  dossier:[-5.8,46],relic:[-49,-15],
  trials:[
   {site:'Whitehall',at:[-5,22],round:6,seconds:90,kills:11},
   {site:'Parliament Square',at:[10,-10],round:10,seconds:110,kills:15},
   {site:'Palace Yard',at:[-11,-35],round:15,seconds:145,kills:20}
  ],
  phases:['The Pendulum','The Broken Dial','The Thirteenth Chime']
 },
 'Hollow Estate':{
  skin:'estatewarden',title:'The Last Testament',boss:'The Hollow Steward',color:0xbb9bff,
  realm:'The Court Below',ink:0x130e25,entry:[34,-43.7],
  dossier:[-11.5,30.1],relic:[29,-17.65],
  trials:[
   {site:'Ballroom',at:[5,4],round:6,seconds:90,kills:11},
   {site:'Conservatory',at:[10,-17],round:10,seconds:110,kills:15},
   {site:'Back garden',at:[10,-33],round:15,seconds:145,kills:20}
  ],
  phases:['The Procession','The Grasping Dead','The Last Oath']
 }
};
const ZMAIN_ARENA_X=240,ZMAIN_EDGE=23;
const zQuestActive=()=>!!(zq?.main&&(zq.main.fight||zq.main.trial));
function zQuestInArena(x,z){return Math.abs(x-ZMAIN_ARENA_X)<ZMAIN_EDGE+1&&Math.abs(z)<ZMAIN_EDGE+1}
function zQuestStart(){
 const h=$('#zmain');h.hidden=true;
 const def=ZMAIN[sel.map];if(!def)return;
 const fx=new THREE.Group();zG.add(fx);
 const q=zq.main={def,fx,london:sel.map==='London',step:0,clock:0,serial:0,phase:0,ward:0,warm:0,
  credit:[],fight:false,hazards:new Map(),props:[],roster:{},visit:0,localVisit:0};
 h.style.setProperty('--boss-ink','#'+def.color.toString(16));
 function node(id,at,kind,index,prompt,apply){
  const [x,z]=zFreeSpot(...at);
  zQuestProp(q,x,z,kind,index);
  zQuestInteract(q,id,x,z,prompt,apply);
  return {x,z,art:q.props.at(-1).g};
 }
 node('docket',def.dossier,'paper',0,()=>q.step===0?(q.london?'Read the Westminster docket':'Read the abandoned ledger'):'',()=>{
  q.step=1;
  zQuestNotice(q,q.london?'Restore substation power. Recover the escapement from Westminster Abbey.':'Find the family seal in the master’s study. It is keeping a pair of Nitrogen Fists in stasis.');
 });
 node('relic',def.relic,'relic',0,()=>q.step===1?(q.london?'Recover the escapement':'Break the gauntlet stasis'):'',by=>{
  if(q.london&&!zq.power){zQuestNotice(q,'Restore power at the substation first.');return}
  q.step=2;
  if(!q.london)zQuestGrantFists(by);
  zQuestNotice(q,q.london?'Brew the tower’s weapon. Its steam opens each of the three condensers.':'Dash through the Ballroom oathstone when round 6 begins.');
 });
 if(!q.london)zQuestInteract(q,'fists',q.props[1].g.position.x,q.props[1].g.position.z,
  ()=>q.step>=2&&!q.fight&&!q.won&&zMelKey()!=='Nitrogen Fists'?'Recover Nitrogen Fists':'',zQuestGrantFists);
 if(q.london)zQuestInteract(q,'brew',16,-33,
  ()=>q.step>=2&&!q.fight&&!q.won&&zq.tea&&!wp.some(w=>w.k==='TEA')?'Take a replacement Brew':'',by=>{
   if(by===zMe()){if(!wp.some(w=>w.k==='TEA'))zGive('TEA')}
   else netSend({t:'zmainnote',to:by,tea:true});
  });
 q.nodes=def.trials.map((trial,index)=>({
  ...trial,...node('station'+index,trial.at,'altar',index,()=>q.step===index+2&&!q.trial?
   zq.r<trial.round?'Seal opens on round '+trial.round:q.london?'Vent this condenser with The Brew':'Dash through this seal':'',
   ()=>zQuestNotice(q,q.london?'Aim The Brew at the glowing condenser and fire.':'Draw the Nitrogen Fists and use Aim to dash into the seal.'))
 }));
 q.entry=node('entry',def.entry,'altar',3,()=>q.step===5&&!q.fight&&!q.won?'Open the passage to '+def.realm:'',()=>zQuestBegin(q));
 q.nodes.forEach(n=>{
  const m=new THREE.Mesh(new THREE.RingGeometry(7.7,8,48),new THREE.MeshBasicMaterial({
   color:def.color,transparent:true,opacity:.44,depthWrite:false,side:THREE.DoubleSide
  }));
  m.rotation.x=-Math.PI/2;m.position.set(n.x,.08,n.z);fx.add(m);m.visible=false;n.ring=m;
 });
}
function zQuestGrantFists(by){
 if(by===zMe()){if(zMelKey()!=='Nitrogen Fists')zGiveMel('NF')}
 else netSend({t:'zmainnote',to:by,fists:true});
}
function zQuestStrike(q,by,x,y,z,kind){
 if(!q||q.won||!Number.isFinite(x+y+z))return;
 const pl=zPlayers().find(p=>p.id===by);
 if(!pl||Math.abs(y)>3.5||Math.hypot(pl.x-x,pl.z-z)>(kind==='dash'?4:36))return;
 if(kind!==(q.london?'steam':'dash'))return;
 if(q.fight){
  if(!zQuestInArena(pl.x,pl.z))return;
  q.locks.forEach((lock,i)=>{
   const bit=1<<i;
   if(!(q.ward&bit)||Math.hypot(x-lock.x,z-lock.z)>(q.london?2:1.65))return;
   q.ward&=~bit;zQuestCue(q,lock.x,lock.z,true);
   if(!q.ward){q.next=2;zQuestNotice(q,'The core is exposed. Make it count.')}
  });
  return;
 }
 const n=q.nodes[q.step-2];
 if(!n||q.trial||zq.hound&&!zq.hound.done||zq.r<n.round||Math.hypot(x-n.x,z-n.z)>(q.london?2:1.65))return;
 if(q.london&&(!zq.tea||!zq.power))return;
 q.trial={time:0,kills:0,next:.5,attack:0};
 zQuestCue(q,n.x,n.z,true);
 zQuestNotice(q,'Stay inside the ring and defeat the marked dead.');
}
function zQuestTool(kind,x,y,z){
 const q=zq?.main;
 if(!q||q.won||q.london!==(kind==='steam'))return;
 const n=q.nodes[q.step-2],active=q.fight?q.locks.filter((_,i)=>q.ward&(1<<i)):!q.trial&&n&&zq.r>=n.round?[n]:[];
 if(!active.some(p=>Math.hypot(x-p.x,z-p.z)<2.05))return;
 if(zCli())netSend({t:'zmainuse',kind,x,y,z});
 else zQuestStrike(q,zMe(),x,y,z,kind);
}
function zQuestSteam(origin,direction,length){
 const q=zq?.main;if(!q?.london||q.won)return;
 const active=q.fight?q.locks.filter((_,i)=>q.ward&(1<<i)):[q.nodes[q.step-2]].filter(Boolean);
 for(const n of active){
  const p=V(n.x,1.25,n.z).sub(origin),range=p.dot(direction);
  if(range>0&&range<Math.min(36,length+.1)&&p.addScaledVector(direction,-range).lengthSq()<1.15)
   zQuestTool('steam',n.x,1.25,n.z);
 }
}
function zQuestKill(b){
 const q=zq.main;if(!q?.trial||!b.zquestAdd)return;
 const n=q.nodes[q.step-2];
 if(Math.hypot(b.x-n.x,b.z-n.z)>8.4)return;
 q.trial.kills++;
 burst(V(b.x,.65,b.z),12,q.def.color,2.4,.6,.11);
}
function zQuestRemoveAdds(){
 for(let i=bots.length-1;i>=0;i--){
  const b=bots[i];if(!b.zquestAdd||!b.al)continue;
  S.remove(b.m);bots.splice(i,1);
 }
}
function zQuestTrial(q,dt){
 const n=q.nodes[q.step-2],t=q.trial,players=zPlayers().filter(p=>Math.hypot(p.x-n.x,p.z-n.z)<8.1);
 if(players.length){t.time+=dt;t.empty=0}
 else {t.empty=(t.empty||0)+dt;if(t.empty>14){q.trial=null;zQuestRemoveAdds();zQuestClear(q);zQuestNotice(q,'The ring went cold. Strike the seal or condenser to retry.');return}}
 if(t.time>=n.seconds&&t.kills>=n.kills){
  q.trial=null;q.step++;zQuestRemoveAdds();zQuestClear(q);zQuestCue(q,n.x,n.z,true);
  const next=q.nodes[q.step-2];
  zQuestNotice(q,next?next.site+' is next. The seal opens on round '+next.round+'.':'The passage is ready at '+(q.london?'the Palace Yard service stand.':'the crypt altar.'));
  return;
 }
 t.next-=dt;
 if(t.next>0||!players.length)return;
 t.next=Math.max(2.2,4.2-(q.step-2)*.5);
 if(bots.filter(b=>b.al&&b.zquestAdd).length<7){
  for(let i=0;i<(players.length>1?2:1);i++){
   const a=(t.attack+i*2)*2.39996,[x,z]=zFreeSpot(n.x+Math.cos(a)*6.8,n.z+Math.sin(a)*6.8);
   const distance=Math.hypot(x-n.x,z-n.z);
   if(distance>7.8||distance<3.2||castW(V(n.x,1.3,n.z),V((x-n.x)/distance,0,(z-n.z)/distance),distance)<distance-.12)continue;
   const b=mkZombie(x,z,t.attack%7===6&&q.step>2);
   b.zquestAdd=true;b.riseY=-1.3;b.run=true;b.sp=Math.max(b.sp,3.4);
   b.rig.setGlow?.(true,q.clock);
  }
 }
 if(t.attack%3===2){
  const p=players[t.attack%players.length];
  zQuestHazard(q,q.london?'bolt':'hex',p.x,p.z,q.london?2.25:2.7,1.25);
 }
 t.attack++;
}

function zQuestBelfry(root,stone,dark,brass,light){
 const arch=new THREE.TorusGeometry(4.21,.27,6,36,Math.PI);
 const windowGlass=eCanvasMat(192,256,(c,w,h)=>{
  const sky=c.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#353f59');sky.addColorStop(.71,'#a96e58');sky.addColorStop(1,'#eab182');
  c.fillStyle=sky;c.beginPath();c.arc(w/2,w/2,w/2,Math.PI,0);c.lineTo(w,h);c.lineTo(0,h);c.fill();
  c.strokeStyle='#222331';c.lineWidth=7;
  for(const x of [w*.24,w*.5,w*.76]){c.beginPath();c.moveTo(x,w*.1);c.lineTo(x,h);c.stroke()}
  for(const y of [h*.38,h*.62,h*.8])c.fillRect(0,y,w,2);
 },true);
 const clockFace=eCanvasMat(256,256,(c,w,h)=>{
  c.translate(w/2,h/2);c.fillStyle='#2b2431';c.strokeStyle='#b88054';c.lineWidth=9;
  c.beginPath();c.arc(0,0,113,0,Math.PI*2);c.fill();c.stroke();
  for(let i=0;i<12;i++){
   c.rotate(Math.PI/6);c.fillStyle=i%3?'#c7a276':'#fbca88';c.fillRect(-2,-107,4,i%3?8:15);
  }
  c.fillStyle='#ffd59b';c.rotate(.85);c.fillRect(-3,-91,6,112);c.rotate(-2.27);c.fillRect(-5,-67,10,83);
 },true);
 const wall=eM(0x342c36,0,.85,.12),copper=eM(0x765040,0x110904,.56,.46);
 const backing=new THREE.MeshBasicMaterial({color:0x252234,side:THREE.BackSide});
 eMk(root,new THREE.CylinderGeometry(31,31,30,32,1,true),backing,0,12,0,1,1,1);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,g=new THREE.Group();g.position.set(Math.sin(a)*27,0,Math.cos(a)*27);g.rotation.y=a;
  root.add(g);
  eMk(g,EG.box,wall,0,2.15,.2,21,4.3,2);
  eMk(g,EG.box,stone,0,13.3,.45,21,3.8,1.5);
  for(const side of [-1,1]){
   eMk(g,EG.box,wall,side*6.9,7.7,.2,5.45,8.5,1.55);
   eMk(g,EG.box,brass,side*4.21,6.27,-.52,.47,5.05,.48);
   eMk(g,EG.box,brass,side*7.9,3.6,-3.2,.16,2.4,.16);
   eMk(g,EG.box,copper,side*8.8,5.6,-.8,.21,8,.45);
  }
  eMk(g,EG.pl,windowGlass,0,7.86,-.69,8.42,9.35,1);
  eMk(g,arch,brass,0,8.62,-.72,1,1,1);
  eMk(g,EG.box,brass,0,4.36,-3.2,21,.13,.19);
  eMk(g,EG.box,stone,0,3.54,-2.02,21,.39,2.75);
  for(let rail=-8;rail<=8;rail+=2)eMk(g,EG.box,brass,rail,4.04,-3.2,.079,.76,.079);
  if(i%2===0){
   eMk(g,EG.pl,clockFace,0,9.05,-1.2,7.05,7.05,1);
   eMk(g,EG.tor,brass,0,9.05,-1.17,3.28,3.28,1.4);
  }
 }
 for(let i=0;i<4;i++){
  const a=i*Math.PI*.5+Math.PI*.25,x=Math.sin(a)*17,z=Math.cos(a)*17;
  const bell=new THREE.CylinderGeometry(.58,1.64,1.9,18,1,true);
  eMk(root,EG.cyl,dark,x,16,z,.075,11,.075);
  eMk(root,bell,copper,x,10.4,z,1,1,1,0,a,Math.sin(a)*.14);
  eMk(root,EG.tor,brass,x,9.52,z,1.59,1.59,1.6,Math.PI/2);
  eMk(root,EG.sph,light,x,9.41,z,.22,.26,.22);
 }
}
function zQuestCatacomb(root,stone,dark,edge,light){
 const glow=eM(0x53457e,0x241842,.73,.03),shard=new THREE.OctahedronGeometry(1);
 for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++){
  if(Math.abs(x)+Math.abs(z)===6)continue;
  eMk(root,EG.box,(x+z)%2?stone:dark,x*6.46,.044,z*6.46,6.35,.09,6.35);
 }
 const arch=new THREE.TorusGeometry(4.24,.43,5,29,Math.PI);
 const mist=eCanvasMat(256,256,(c,w,h)=>{
  const f=c.createRadialGradient(w/2,h/2,8,w/2,h/2,w*.49);
  f.addColorStop(0,'#d7c5ffaf');f.addColorStop(.27,'#a17cf577');f.addColorStop(1,'#37235c00');
  c.fillStyle=f;c.fillRect(0,0,w,h);
 },true);
 for(let i=0;i<8;i++){
  const a=i*Math.PI*.25,g=new THREE.Group();
  g.position.set(Math.sin(a)*25,0,Math.cos(a)*25);g.rotation.y=a;root.add(g);
  for(const side of [-1,1]){
   eMk(g,EG.box,dark,side*7.03,3.65,.54,5.19,7.3,2.3,-side*.09,0,side*.08);
   eMk(g,EG.box,edge,side*4.25,2.68,.12,.83,5.37,1.4,.04,0,side*.07);
   for(let k=0;k<4;k++)eMk(g,shard,k%2?glow:stone,side*(5.8+k*.78),.51+k*.27,-.55-k*.14,1.21,2.4,.98,side*.23,k,side*.51);
   eMk(g,shard,light,side*4.66,3.28,-.66,.2,.54,.28);
   eMk(g,EG.box,stone,side*8.1,.31,-.33,4.7,.62,3.8);
  }
  eMk(g,arch,edge,0,5.17,-.13,1,1,1);
  eMk(g,EG.pl,mist,0,4.53,.23,11.1,8.7,1);
  eMk(g,shard,glow,0,8.5,-1.8,1.18,2,1.06,.18,a,.59);
 }
 for(const [x,z] of [[-16,6],[16,6],[-14,-12],[14,-12]]){
  const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  eMk(g,EG.box,dark,0,.36,0,2.6,.72,3.28);
  eMk(g,EG.box,stone,0,.8,0,2.75,.24,3.4);
  eMk(g,EG.box,edge,0,1,0,2.23,.2,2.94);
  eMk(g,shard,light,0,1.12,0,.18,.22,.31);
  zSolid(ZMAIN_ARENA_X+x,z,2.75,3.4,1.1);
 }
}
function zQuestArena(q){
 const root=new THREE.Group();root.position.x=ZMAIN_ARENA_X;q.fx.add(root);root.visible=false;q.arena=root;
 const stone=eM(q.london?0x433e46:0x342b49,0,.82,.1);
 const dark=eM(q.london?0x211d27:0x211b36,0,.82,.32);
 const edge=eM(q.london?0x9a6440:0x746493,0,.51,.45);
 const light=new THREE.MeshBasicMaterial({color:q.def.color});
 const torus=(radius,tube)=>new THREE.TorusGeometry(radius,tube,6,64);
 const disk=new THREE.CylinderGeometry(1,1,1,64);
 const add=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>eMk(root,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz);
 add(EG.box,dark,0,-.29,0,54,.66,54);
 if(q.london){
  add(disk,stone,0,-.105,0,22.5,.33,22.5);
  zQuestBelfry(root,stone,dark,edge,light);
  for(const r of [5,10,15,21])add(torus(r,.09),r===21?light:edge,0,.11,0,1,1,1,Math.PI/2);
 }else{
  zQuestCatacomb(root,stone,dark,edge,light);
  add(torus(5,.066),light,0,.128,0,1,1,1,Math.PI/2);
  add(torus(21,.057),edge,0,.126,0,1,1,1,Math.PI/2);
 }
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,x=Math.sin(a),z=Math.cos(a),h=7+i%4*2;
  if(q.london){
   add(EG.box,edge,x*15,.094,z*15,.1,.05,10,0,a);
   add(EG.box,stone,x*22.6,h/2,z*22.6,1.55,h,1.66,0,a);
   add(EG.box,edge,x*22.5,h,z*22.5,2.42,.47,2.3,0,a);
   add(torus(1.32,.07),light,x*22.3,h+1.4,z*22.3,1,1,1,0,a);
   add(EG.cyl,dark,x*23.1,h+1.3,z*23.1,1.52,.29,1.52,Math.PI/2,a);
  }else{
   add(EG.box,stone,x*22.1,h/2,z*22.1,1.7,h,1.4,-.17,a,(i%3-1)*.18);
   add(EG.box,edge,x*21.3,h*.63,z*21.3,1.3,.38,.7,0,a,.18);
   add(q.shardGeo||=new THREE.OctahedronGeometry(1),light,x*21.15,h*.7,z*21.15,.3,.85,.28,0,a);
  }
 }
 q.skyRotor=new THREE.Group();q.skyRotor.position.y=16;root.add(q.skyRotor);
 if(q.london){
  const teeth=new THREE.CylinderGeometry(1,1,1,12);
  for(const [x,z,r] of [[0,0,12],[-15,8,5],[16,-7,6]]){
   eMk(q.skyRotor,torus(r,.28),edge,x,0,z,1,1,1,Math.PI/2);
   for(let i=0;i<24;i++){
    const a=i*Math.PI/12;eMk(q.skyRotor,EG.box,edge,x+Math.sin(a)*r,0,z+Math.cos(a)*r,.23,.2,1.2,0,a);
   }
   eMk(q.skyRotor,teeth,stone,x,0,z,1.8,.6,1.8);
  }
 }else{
  for(let i=0;i<18;i++){
   const a=i*Math.PI/9,r=13+i%4*2;
   eMk(q.skyRotor,q.shardGeo,stone,Math.sin(a)*r,i%3,Math.cos(a)*r,1.5,3.2,1.6,.25,a,-.45);
   eMk(q.skyRotor,q.shardGeo,light,Math.sin(a)*r,-2.9+i%3,Math.cos(a)*r,.33,.8,.4);
  }
 }
 const skyMat=new THREE.MeshBasicMaterial({color:q.def.ink,side:THREE.BackSide,fog:false});
 const canopy=eMk(root,new THREE.SphereGeometry(72,24,12),skyMat,0,3,0,1,1,1);
 canopy.castShadow=canopy.receiveShadow=false;
 const lumen=new THREE.PointLight(q.def.color,2.15,54,1.6);lumen.position.set(0,11,0);root.add(lumen);
 q.locks=[[-11,-9],[11,-9],[0,12]].map(([x,z],i)=>{
  const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  eMk(g,EG.cyl,dark,0,.52,0,1.05,1.04,1.05);
  eMk(g,EG.cyl,edge,0,1,0,1.1,.22,1.1);
  const gem=eMk(g,new THREE.OctahedronGeometry(1),light,0,1.55,0,.42,.67,.42);
  return {x:x+ZMAIN_ARENA_X,z,g,gem,i};
 });
 eMk(root,EG.cyl,dark,0,.54,19.4,.94,1.08,.94);
 eMk(root,EG.cyl,edge,0,1.12,19.4,1.09,.21,1.09);
 eMk(root,q.shardGeo||new THREE.OctahedronGeometry(1),light,0,1.51,19.4,.3,.47,.3);
 zQuestInteract(q,'arenaAmmo',ZMAIN_ARENA_X,19.4,()=>q.fight?'Resupply · 25s recharge':'',by=>{
  q.supplied ||= new Map();
  if(q.clock<(q.supplied.get(by)||0))return;
  q.supplied.set(by,q.clock+25);
  if(by===zMe())zQuestResupply(q);
  else netSend({t:'zmainnote',to:by,supply:true});
 });
 return root;
}
function zQuestResupply(q){
 for(const w of wp){w.mag=w.m;w.res=Math.max(w.res,w.m*4)}
 if(q.london&&!wp.some(w=>w.k==='TEA'))zGive('TEA');
 if(!q.london&&zMelKey()!=='Nitrogen Fists')zGiveMel('NF');
 msg('Arena supplies replenished',2);
 beep(540,.2,'triangle',.08);
}
function zQuestTeleport(q,visit,fighting,ids){
 if(!ids.includes(zMe())||q.localVisit===visit)return;
 q.localVisit=visit;
 const [x,z]=fighting?[ZMAIN_ARENA_X+(ids.indexOf(zMe())-1.5)*2.3,17]:[q.entry.x,q.entry.z+1.05];
 const [px,pz]=fighting?[x,z]:zFreeSpot(x,z);
 Object.assign(P,{x:px,z:pz,y:0,vy:0,mx:0,mz:0});
 if(fighting){yaw=0;pitch=0}
 zq.dash.t=0;flashL=Math.max(flashL,.85);shake=Math.max(shake,.45);
 popup(fighting?q.def.realm.toUpperCase():(q.won?'RETURN TO THE SURFACE':'THE PASSAGE CLOSED'),
  fighting?q.def.boss:q.def.title);
}
function zQuestBegin(q){
 const players=zPlayers();if(!players.length)return;
 if(zq.hound&&!zq.hound.done){zQuestNotice(q,'Finish the Hellhound round before opening the passage.');return}
 const x=ZMAIN_ARENA_X,z=-5,b=mkZombie(x,z,true);
 zQuestDress(b,q);b.hp=b.mhp=Math.round((q.london?15000:17900)*(1+.52*(players.length-1)));
 q.credit=players.map(p=>p.id);q.phase=0;q.ward=0;q.warm=3;q.next=3.5;q.attack=0;q.fight=true;
 q.visit++;q.fightAt=q.clock;q.supplied=new Map();
 if(!q.arena)zQuestArena(q);
 zQuestTeleport(q,q.visit,true,q.credit);
 if(netOn)netSend({t:'zmainnote',visit:q.visit,fight:true,ids:q.credit});
}
function zQuestDress(b,q){
 b.m.clear();b.rig=null;b.zquestBoss=true;b.nm=q.def.boss;b.m.scale.setScalar(1);b.rise=0;
 const g=new THREE.Group();g.scale.setScalar(q.london?1.37:1.46);b.m.add(g);
 const shell=eM(q.london?0xb17a48:0x898096,0,.48,.52);
 const caseMat=eM(q.london?0x242633:0x31213f,0,.74,.32);
 const core=new THREE.MeshBasicMaterial({color:q.def.color});
 const halo=new THREE.TorusGeometry(1,.062,8,44);
 const gem=new THREE.OctahedronGeometry(1);
 const arms=[];
 let rotor;
 function put(geo,m,x,y,z,sx,sy,sz,rx,ry,rz){return eMk(g,geo,m,x,y,z,sx,sy,sz,rx,ry,rz)}
 if(q.london){
  rotor=new THREE.Group();rotor.position.y=2.95;g.add(rotor);
  eMk(rotor,EG.cyl,caseMat,0,0,0,1.8,.8,1.8,Math.PI/2);
  eMk(rotor,halo,shell,0,0,.53,1.75,1.75,1.5);
  eMk(rotor,halo,core,0,0,.6,1.09,1.09,1);
  eMk(rotor,gem,core,0,0,.64,.48,.48,.38);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6;
   eMk(rotor,EG.box,i%3?caseMat:shell,Math.sin(a)*1.41,Math.cos(a)*1.41,.48,.14,.38,.24,0,0,-a);
   eMk(rotor,EG.box,shell,Math.sin(a)*1.87,Math.cos(a)*1.87,.03,.23,.44,.52,0,0,-a);
  }
  put(EG.box,shell,0,4.85,-.06,.4,.47,.51);
  put(halo,shell,0,2.96,-.63,2.08,2.08,1.25,0,.24,-.18);
  for(const side of [-1,1]){
   put(EG.box,caseMat,side*1.32,3.08,-.53,.24,2.4,.26,.2,0,side*.36);
   put(EG.cyl,shell,side*.91,4.3,-.22,.42,.24,.34,.38,0,side*.52);
  }
  for(const side of [-1,1]){
   const pend=new THREE.Group();pend.position.set(side*1.47,3.38,-.17);g.add(pend);arms.push(pend);
   eMk(pend,EG.box,shell,0,-1.18,0,.18,2.55,.24);
   eMk(pend,new THREE.CylinderGeometry(.3,.73,1.05,12),shell,0,-2.57,0,1,1,1);
   eMk(pend,gem,core,0,-2.58,.23,.25,.32,.22);
  }
 }else{
  put(EG.sph,caseMat,0,2.05,0,.93,1.54,.68,0,0,-.12);
  put(gem,core,0,2.38,.62,.42,.67,.36,0,0,-.13);
  for(let i=0;i<5;i++)for(const side of [-1,1])
   put(EG.cyl,shell,side*(.22+i*.06),1.55+i*.34,.43,.11,1.03,.16,.4,0,-side*.77);
  put(gem,shell,0,3.7,.26,.76,.88,.61,0,0,-.12);
  put(EG.box,caseMat,0,3.65,.75,.86,.33,.18,0,0,-.12);
  for(const side of [-1,1]){
   put(gem,core,side*.27,3.66,.89,.12,.078,.1);
   const root=new THREE.Group();root.position.set(side*.82,2.92,-.03);g.add(root);arms.push(root);
   eMk(root,EG.sph,caseMat,side*.37,-.21,0,.63,.61,.53);
   for(let i=0;i<4;i++){
    eMk(root,gem,shell,side*(.78+i*.16),-.67-i*.22,.31,.22,.69,.27,.18,0,side*.55);
    eMk(root,EG.cyl,caseMat,side*(.35+i*.16),-.27-i*.21,.12,.14,.88,.15,0,0,side*.64);
   }
   for(let i=0;i<3;i++)put(gem,shell,side*(.24+i*.18),4.07+i*.17,-.11,.19,.73,.22,0,0,-side*.55);
   put(gem,caseMat,side*.57,.65,-.15,.4,1.06,.45,.48,0,side*.23);
   for(let i=0;i<4;i++){
    put(gem,caseMat,side*(.9+i*.18),2.81+i*.25,-.59,.32,.72,.17,.14,0,-side*(.56+i*.25));
    put(gem,shell,side*(1.02+i*.185),3.05+i*.24,-.47,.13,.67,.18,.11,0,-side*(.56+i*.25));
   }
  }
  rotor=put(halo,shell,0,3.87,-.56,1.1,1.34,.76);
 }
 const shield=put(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({
  color:q.def.color,transparent:true,opacity:.26,wireframe:true,depthWrite:false
 }),0,2.45,0,2.55,2.78,2.32);
 b.zquestArt={g,arms,rotor,shield,core};q.actor=b;
}
function zQuestHitPoints(b){
 const london=zq.main.london,face=b.tyaw||0,scale=london?1.37:1.46,height=(london?2.95:3.67)*scale;
 const coreOffset=.62*scale;
 return [V(b.x+Math.sin(face)*coreOffset,height,b.z+Math.cos(face)*coreOffset),
  V(b.x,(london?2.84:2.04)*scale,b.z),(london?.61:.63)*scale,(london?1.57:1.25)*scale];
}
function zQuestDamage(b,d,head,by){
 const q=zq.main;if(q?.actor!==b||!q.fight||!Number.isFinite(d)||d<=0||q.ward||q.warm>0)return;
 const p=zPlayers().find(p=>p.id===by);
 if(!p||!zQuestInArena(p.x,p.z)||Math.hypot(p.x-b.x,p.z-b.z)>47)return;
 const floor=q.phase===0?Math.ceil(b.mhp*.68):q.phase===1?Math.ceil(b.mhp*.34):0;
 const weak=head||q.exposed>0,hit=Math.min(d*(weak?1.33:.62),b.mhp*.037,b.hp-floor);
 b.hp-=hit;b.lh=t0;
 if(p.me){hits++;juiceHit(b,Math.round(hit),head);$('#hm').className='on'+(head?' hd':'');hmT=.12}
 if(b.hp<=0){zQuestEnd(q,true);return}
 if(b.hp===floor){
  q.phase++;q.warm=1.6;q.ward=q.phase===1?3:7;q.next=2.45;q.exposed=0;
  zQuestCue(q,b.x,b.z,true);zQuestNotice(q,q.london?'Vent the lit condensers with The Brew.':'Nitro-dash through the lit pillars.');
 }
}
function zQuestEnd(q,won){
 q.won=won;q.fight=false;q.ward=0;q.warm=0;q.visit++;
 if(q.actor){q.actor.al=0;q.actor.atk=0;S.remove(q.actor.m);const i=bots.indexOf(q.actor);if(i>=0)bots.splice(i,1);q.actor=null}
 zQuestClear(q);
 if(won){burst(V(ZMAIN_ARENA_X,3,-4),90,q.def.color,12,1.4,.2);zQuestCue(q,ZMAIN_ARENA_X,-4,true)}
 zQuestTeleport(q,q.visit,false,q.credit);
 if(netOn)netSend({t:'zmainnote',visit:q.visit,fight:false,ids:q.credit,won});
 if(won)zQuestReward(q);
}
function zQuestBossTick(q,dt,players){
 const b=q.actor;
 if(!players.length){
  if(q.clock-q.fightAt>9)zQuestEnd(q,false);
  return;
 }
 q.fightAt=q.clock;q.warm=Math.max(0,q.warm-dt);q.exposed=Math.max(0,(q.exposed||0)-dt);
 const p=players.reduce((a,c)=>Math.hypot(c.x-b.x,c.z-b.z)<Math.hypot(a.x-b.x,a.z-b.z)?c:a);
 const dx=p.x-b.x,dz=p.z-b.z,dist=Math.hypot(dx,dz)||1;
 b.tyaw=Math.atan2(dx,dz);
 if(!q.london&&!q.ward&&q.next>1.25&&dist>3.2)mv(b,dx/dist*dt*(2.1+q.phase*.6),dz/dist*dt*(2.1+q.phase*.6),.8);
 if(q.london){
  b.x=ZMAIN_ARENA_X+Math.sin(q.clock*.34)*(5+q.phase*2);
  b.z=-4+Math.sin(q.clock*.58)*4;
 }
 b.m.position.set(b.x,0,b.z);
 q.next-=dt;
 if(q.next>0||q.warm>0)return;
 const n=q.attack++,phase=q.phase,wind=1.55-phase*.15;
 q.next=(q.london?4.25:4.8)-phase*.45;
 if(q.london){
  if(n%3===0||phase===2&&n%3===1){
   zQuestHazard(q,'wave',b.x,b.z,31,wind);
   if(phase>0)zQuestHazard(q,'wave',b.x,b.z,31,wind+.88);
  }else{
   const horizontal=n%2===0;
   for(let i=-4;i<=4;i++)zQuestHazard(q,'bolt',horizontal?ZMAIN_ARENA_X+i*5.1:p.x,horizontal?p.z:i*5.1,3.05,wind+Math.abs(i)*.10);
   if(phase===2)zQuestHazard(q,'bolt',p.x,p.z,4.1,wind+.75);
  }
 }else{
  for(const pl of players){
   zQuestHazard(q,'hex',pl.x,pl.z,3.3+phase*.33,wind);
   if(phase>0)zQuestHazard(q,'hex',pl.x+Math.sin(n*2.4)*5,pl.z+Math.cos(n*2.4)*5,3.2,wind+.48);
  }
  if(n%2===1||phase===2)zQuestHazard(q,'wave',b.x,b.z,29,wind+.52);
 }
 q.exposed=q.ward?0:2.1;
}
function zQuestHud(q){
 const h=$('#zmain'),visible=q.step>0;
 h.hidden=!visible;
 if(!visible)return;
 const n=q.nodes[q.step-2],t=q.trial;
 const line=q.won?'Quest complete':q.fight?(q.ward?(q.london?'Vent the lit condensers · The Brew':'Shatter the lit pillars · Nitrogen Fists'):q.def.phases[q.phase]):
  q.step===1?(q.london?'Restore power · recover the Abbey escapement':'Recover the family seal · master’s study'):
  t?n.site+' · '+Math.min(t.kills,n.kills)+'/'+n.kills+' kills · '+Math.max(0,Math.ceil(n.seconds-t.time))+'s in ring':
  n?n.site+' · '+(zq.r<n.round?'opens on round '+n.round:q.london?(!zq.tea?'Unlock The Brew':'Vent the condenser with The Brew'):'Dash into the seal'):
  'Open the passage · '+(q.london?'Palace Yard':'Crypt');
 const progress=q.fight?Math.max(0,Math.round(100*(q.actor?.hp/q.actor?.mhp||0))):t?Math.floor(100*Math.min(t.time/n.seconds,t.kills/n.kills,1)):0;
 const key=[q.fight,q.ward>0,!!t,line,progress].join('|');
 if(q.hudKey===key)return;
 q.hudKey=key;
 const track=h.querySelector('.zmain-track');
 h.querySelector('strong').textContent=q.fight?q.def.boss:q.def.title;
 h.querySelector('small').textContent=line;track.hidden=!q.fight&&!t;
 track.setAttribute('aria-label',q.fight?'Boss health':'Ritual progress');
 track.setAttribute('aria-valuenow',progress);track.firstElementChild.style.width=progress+'%';
 h.classList.toggle('warded',!!q.ward);
}
function zQuestTick(dt){
 const q=zq.main;if(!q)return;
 q.clock+=dt;
 {
  const active=q.nodes[q.step-2];
  for(const prop of q.props){
   prop.g.visible=prop.kind==='paper'||(prop.kind==='relic'?!q.london||q.step===1:
    (prop.index===3?q.step===5&&!q.won:prop.index===q.step-2));
   if(prop.rotor){prop.rotor.rotation.y=q.clock*2;prop.rotor.rotation.z=Math.sin(q.clock*3)*.18}
  }
  for(const node of q.nodes)node.ring.visible=node===active&&!!q.trial;
 }
 if(q.arena){
  q.arena.visible=q.fight&&zQuestInArena(P.x,P.z);
  q.skyRotor.rotation.y=q.clock*(q.london?.12:.035);
  for(const lock of q.locks){lock.g.visible=!!(q.ward&(1<<lock.i));lock.gem.rotation.y=q.clock*2.8}
 }
 if(q.fight&&!zCli())zQuestBossTick(q,dt,zPlayers().filter(p=>zQuestInArena(p.x,p.z)));
 if(q.trial&&!zCli())zQuestTrial(q,dt);
 if(q.fight||q.trial)zQuestHazardTick(q,dt,zCli()?null:zPlayers().filter(p=>zQuestInArena(p.x,p.z)===q.fight));
 if(q.fight&&q.actor?.zquestArt){
  const b=q.actor,{g,arms,rotor,shield,core}=b.zquestArt,time=q.clock;
  b.m.rotation.y+=(angD(b.tyaw||0,b.m.rotation.y))*Math.min(1,dt*7);
  g.position.y=Math.sin(time*2)*(q.london?.26:.14);
  if(q.london)rotor.rotation.z=time*(.49+q.phase*.19);
  for(const [i,arm] of arms.entries()){
   arm.rotation.z=Math.sin(time*(q.london?2.7:1.7)+i*1.7)*(.53+q.phase*.13);
   arm.rotation.x=Math.sin(time*2.1+i*2)*.35;
  }
  shield.visible=!!q.ward||q.warm>0;shield.rotation.y=time*.95;
  core.color.setHex(q.def.color).multiplyScalar(1.07+.27*Math.sin(time*5));
 }
 zQuestHud(q);
}
function zQuestPack(q){
 if(!q)return null;
 return {s:q.step,trial:q.trial&&{time:q.trial.time,kills:q.trial.kills},p:q.phase,w:q.ward,i:q.actor?.i,
  hp:q.actor?.hp,max:q.actor?.mhp,warm:q.warm,fight:q.fight,won:q.won,visit:q.visit,ids:q.credit,
  a:[...q.hazards.values()].map(h=>[h.id,h.kind,h.x,h.z,h.r,h.wind,h.duration,+h.age.toFixed(2)])};
}
function zQuestSync(s){
 const q=zq.main;if(!q||!s)return;
 q.step=s.s;q.trial=s.trial;q.phase=s.p;q.ward=s.w;q.warm=s.warm;q.fight=!!s.fight;q.won=!!s.won;q.credit=s.ids;
 if(q.credit.length)zQuestTeleport(q,s.visit,q.fight,q.credit);
 if(q.fight){
  if(!q.arena)zQuestArena(q);
  const actor=bots.find(b=>b.zp&&b.al&&b.i===s.i);
  if(actor){
   if(!actor.zquestBoss)zQuestDress(actor,q);
   q.actor=actor;actor.hp=s.hp;actor.mhp=s.max;
  }
 }else q.actor=null;
 const seen=new Set();
 for(const [id,kind,x,z,r,wind,duration,age] of s.a){
  seen.add(id);const h=q.hazards.get(id)||zQuestHazardView(q,id,kind,x,z,r,wind,duration);
  if(Math.abs(h.age-age)>.24)h.age=age;
 }
 for(const h of q.hazards.values())if(!seen.has(h.id))zQuestDropHazard(q,h);
 if(q.won)zQuestReward(q);
}
function zQuestNet(d,cn){
 const q=zq.main;if(!q||!netOn)return;
 if(isHost){
  if(d.t!=='zmainuse'||cn?.peer!==d.id)return;
  if(d.kind==='steam'||d.kind==='dash')zQuestStrike(q,d.id,d.x,d.y,d.z,d.kind);
  else q.actions.get(d.a)?.(d.id);
  return;
 }
 if(cn?.peer!==hostPid||d.id!==hostPid)return;
 if(d.t==='zmaincue')zQuestCue(q,d.x,d.z,d.big,true);
 if(d.t==='zmainnote'){
  if(d.to===myId){
   if(d.fists)zQuestGrantFists(myId);
   if(d.tea&&!wp.some(w=>w.k==='TEA'))zGive('TEA');
   if(d.supply&&q.fight)zQuestResupply(q);
  }
  if(typeof d.line==='string')msg(d.line,3.5);
  if(Number.isInteger(d.visit)&&Array.isArray(d.ids)){
   q.fight=d.fight;q.won=!!d.won;q.credit=d.ids;
   if(q.fight&&!q.arena)zQuestArena(q);
   zQuestTeleport(q,d.visit,d.fight,d.ids);
   if(q.won)zQuestReward(q);
  }
 }
 if(d.t==='zmainhit'&&d.to===myId&&!P.dead&&d.d>0&&d.d<=50)zQuestTouch(q,{me:1},q.actor,d.d);
}
