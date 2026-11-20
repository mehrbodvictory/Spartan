/* Citadel persistence is intentionally separate from Spartan Drill's season and locker keys. */
var StormwatchCitadel = (() => {
 const cdn='https://cdn.jsdelivr.net/npm/';
 const reactFile=cdn+'react@18.3.1/umd/react.production.min.js';
 const domFile=cdn+'react-dom@18.3.1/umd/react-dom.production.min.js';
 const reactIntegrity='sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z';
 const domIntegrity='sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1';
 const elements=['Kinetic','Aether','Scorch','Frost','Volt'];
 const stats=['Vitality','Impact','Toughness','Aptitude'];
 const departments=['Field Medicine','Armory','Shieldworks','Engineering','Rescue','Recon','Sentinel','Research'];
 const personalities=['Focused','Bold','Patient','Pragmatic'];
 const sets=['Fortified','Expedition','Resonant'];
 const components={
  gears:'Gears',planks:'Planks',quartz:'Rough Quartz',parts:'Mechanical Parts',powder:'Mineral Powder',cells:'Core Cells',charge:'Charge Fragments'
 };
 const heroNames=['Stroud','Rook','Hale','Morrow','Kite','Vesper','Silt','Voss','Tern','Lark','Talon','Ash'];
 const classes=['Vanguard','Architect','Shadow','Prospector'];
 const operatives=Object.fromEntries(heroNames.map((name,i)=>[i,{
  id:i,name,className:classes[i%4],stars:1+Math.floor(i/4),stat:stats[[1,2,0,3][i%4]],
  passive:[4,4,5,5][i%4]
 }]));
 const specialistNames=['Ames','Baird','Chen','Daro','Eaton','Fisk','Gage','Holt','Ives','Jiya','Ko','Leto',
  'Mills','Neve','Okafor','Pike','Quinn','Rae','Sato','Tess','Uri','Vale','Wren','Yara'];
 const specialists=specialistNames.map((name,i)=>({id:i,name,personality:personalities[i%4],
  set:sets[Math.floor(i/2)%3],stars:1+Math.floor(i/8),level:1+i%5}));
 const perkNames=['Crit rating','Crit damage','Reload speed','Magazine','Element','Core'];
 const corePerks=['Affliction','Headshot Burst','Sustained Fire'];
 const rarity=['Standard','Uncommon','Rare','Epic','Legendary','Relic'];
 const starterBlueprints={AR:'KN-115',MG:'Magnum'};
 for(const recipe of StormwatchEngineering.recipes)starterBlueprints['trap/'+recipe.id]=recipe.name;
 const defaultBlueprint=(name,kind)=>({name,kind,level:1,tier:1,perks:[0,0,0,0,0,0]});
 const emptyBag=()=>Object.fromEntries(Object.keys(components).map(key=>[key,0]));
 const branches={
  resilience:{name:'Resilience',benefit:rank=>'+'+(rank*6)+' max health · +'+(rank*3)+' max shield'},
  logistics:{name:'Logistics',benefit:rank=>'+'+(rank*18)+' reserve rounds per weapon on deployment'},
  ordnance:{name:'Ordnance',benefit:rank=>'+'+(rank*3)+'% weapon damage'}
 };
 const researchMax=5;
 const fieldResearch=profile=>Object.fromEntries(Object.keys(branches).map(id=>[id,profile.research?.[id]||0]));
 const serviceMilestones=[1,2,4,7,11];
 function service(profile,id){
  const wins=profile.service?.[id]||0,rank=serviceMilestones.filter(goal=>wins>=goal).length;
  return {wins,rank,next:serviceMilestones[rank]};
 }
 const payoutText=(mission,region)=>[...Object.entries(StormwatchOperations.payout(mission,region))
  .map(([id,n])=>n+' '+components[id]),marksText(StormwatchOperations.fieldMarks(region))].join(' · ');
 const marksText=n=>n+' Field Mark'+(n===1?'':'s');
 const blank=()=>({version:1,inventory:{...emptyBag(),planks:15,parts:12,cells:2,charge:4},
  blueprints:Object.fromEntries(Object.entries(starterBlueprints).map(([id,name])=>
   [id,defaultBlueprint(name,id.startsWith('trap/')?'trap':'weapon')])),
  squad:{lead:0,supports:[1,2,3,4,8],synergy:'Expedition',departments:Array.from({length:8},(_,i)=>[i,-1,-1])},
  specialistRanks:{},missions:0,waves:0});
 const copy=value=>JSON.parse(JSON.stringify(value));
 const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
 const tierOf=blueprint=>blueprint.level===50?5:blueprint.tier-1;
 const allowedIds=['AR','SMG','BR','SG','MG','MP','VA','BP','KTS','RD','HC','OH','SW','LT','PD','MVR','TRB','TUR','VMP','CY','SN','RL','RG','CT',
  ...StormwatchEngineering.recipes.map(r=>'trap/'+r.id)];
 const panels=['Squad','Specialists','Blueprints','Research','Expeditions','Operations','Supply Llamas','Quartermaster','Design Archive','Loadout Presets','Command','Frontier'];
 const routes={
  timber:{name:'Survey Timbervale',region:'timbervale',minutes:8,trait:'Focused',reward:{planks:12,parts:6}},
  foundry:{name:'Strip the Foundry',region:'ironridge',minutes:18,trait:'Pragmatic',reward:{gears:12,parts:10}},
  quarry:{name:'Sample the Gorge',region:'canyonlands',minutes:25,trait:'Patient',reward:{quartz:14,powder:14}},
  summit:{name:'Reach the Frostline',region:'obsidian',minutes:32,trait:'Bold',reward:{cells:9,charge:12}}
 };
 const operations=StormwatchOperations;
 const recipes=['planks','powder','gears','parts','quartz','cells'];
 const scripts=new Map();
 let services=null;

 function loadScript(url,global,integrity){
  if(window[global])return Promise.resolve(window[global]);
  if(scripts.has(url))return scripts.get(url);
  const promise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=url;script.integrity=integrity;
   script.crossOrigin='anonymous';script.referrerPolicy='no-referrer';
   script.onload=()=>window[global]?resolve(window[global]):reject(Error(global+' failed to start'));
   script.onerror=()=>{scripts.delete(url);script.remove();reject(Error(global+' could not load'))};
   document.head.append(script);
  });
  scripts.set(url,promise);return promise;
 }
 async function libraries(){
  if(!services)services=loadScript(reactFile,'React',reactIntegrity).then(async React=>({
   React,ReactDOM:await loadScript(domFile,'ReactDOM',domIntegrity)
  })).catch(error=>{services=null;throw error});
  return services;
 }
 function openDB(){
  return new Promise((resolve,reject)=>{
   const operation=indexedDB.open('stormwatch-citadel',1);
   operation.onupgradeneeded=()=>operation.result.createObjectStore('profiles');
   operation.onsuccess=()=>resolve(operation.result);operation.onerror=()=>reject(operation.error);
   operation.onblocked=()=>reject(Error('Citadel storage is busy'));
  });
 }
 const profileKey=window.SD_SPLIT?.app==='sw'&&window.SD_SPLIT.seat===2?'citadel-local-player-2':'citadel';
 function read(db){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('profiles','readonly'),request=tx.objectStore('profiles').get(profileKey);
   request.onsuccess=()=>resolve(request.result||blank());request.onerror=()=>reject(request.error);
  });
 }
 function commit(db,action){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('profiles','readwrite'),collection=tx.objectStore('profiles');
   let next,problem;
   const request=collection.get(profileKey);
   request.onsuccess=()=>{
    try{
     next=reduce(request.result||blank(),action);collection.put(next,profileKey);
    }catch(error){problem=error;tx.abort()}
   };
   tx.oncomplete=()=>resolve(next);tx.onabort=()=>reject(problem||tx.error);
   tx.onerror=()=>reject(tx.error);
  });
 }
 function spend(bag,cost){
  for(const [key,n] of Object.entries(cost))if((bag[key]||0)<n)throw Error('Need '+n+' '+components[key]);
  for(const [key,n] of Object.entries(cost))bag[key]-=n;
 }
 function grant(bag,reward){
  for(const [key,n] of Object.entries(reward))bag[key]=clamp((bag[key]||0)+n,0,99999);
 }
 function fileReport(state,action){
  if(!Object.hasOwn(operations.missions,action.mission)||!Number.isFinite(action.started)||
   typeof action.id!=='string'||!action.delta)return;
  state.orders=operations.roll(state.orders,Date.now());
  if(state.orders.receipts.includes(action.id))return;
  operations.accrue(state.orders,action);
  if(state.orders.receipts.includes(action.id))fieldBadges(state,action);
  const archive=state.archive||={hollows:{},operations:{},traps:{},claimed:0};
  for(const id of action.hollows||[])if(operations.hollowIds.includes(id))archive.hollows[id]=true;
  for(const id of action.traps||[])if(StormwatchEngineering.recipes.some(recipe=>recipe.id===id))archive.traps[id]=true;
  if(action.delta.wins!==1)return;
  archive.operations[action.mission]=true;
  const alert=operations.dailyAlert(state.orders.day);
  if(!state.orders.alertClaimed&&operations.windows(action.started).day===state.orders.day&&
   action.mission===alert.mission&&action.modifier===alert.id){
   state.orders.alertClaimed=true;grant(state.inventory,alert.bonus);
  }
 }
 function claimOperation(state,id){
  const {orders,contract,quests,claimed,weekly,count,archiveGoals}=operations.board(state,Date.now());
  const quest=quests.find(q=>id===q.id||id==='daily'&&q.id===contract.id);
  state.orders=orders;
  if(quest&&!claimed.has(quest.id)&&orders.stats[quest.metric]>=quest.goal){
   orders.claimedQuests=[...claimed,quest.id];if(quest.id===contract.id)orders.dailyClaimed=true;
   state.llamas=(state.llamas??1)+1;grant(state.inventory,quest.reward);
  }else if(id==='weekly'&&!orders.weeklyClaimed&&orders.wins.length>=weekly.goal){
   orders.weeklyClaimed=true;grant(state.inventory,weekly.reward);
  }else if(id==='archive'){
   const archive=state.archive||={hollows:{},operations:{},traps:{},claimed:0};
   const milestone=archiveGoals[archive.claimed];
   if(!milestone||count<milestone.goal)throw Error('Field Index reward is unavailable');
   archive.claimed++;grant(state.inventory,milestone.reward);
  }else throw Error('Contract reward is unavailable');
 }
 function levelCost(entry){
  return entry.kind==='trap'?{planks:1+Math.floor(entry.level/3),parts:1+entry.tier}:
   {powder:1+Math.floor(entry.level/4),parts:1+entry.tier};
 }
 const evolutionCost=entry=>({quartz:entry.tier*3,cells:entry.tier*2,...(entry.kind==='trap'?{charge:entry.tier}:{})});
 const recalibrationCost=slot=>({[recipes[slot]]:slot>=4?3:4});
 const member=(profile,id)=>specialists[id]?{...specialists[id],...profile.specialistRanks?.[id]}:null;
 const trainingCost=person=>person.level>=person.stars*10?{quartz:4*person.stars,cells:person.stars*2}:
  {powder:1+Math.floor(person.level/7),gears:1+person.stars};
 const availableForExpedition=(state,id)=>member(state,id)&&!state.squad.departments.some(slots=>slots.includes(id));
 function expeditionTerms(route,person){
  const expertise=person?.personality===route.trait;
  const minutes=Math.ceil(route.minutes*Math.max(.55,1-(person?.level||1)*.006-(expertise ? .17 : 0)));
  return {minutes,reward:Object.fromEntries(Object.entries(route.reward).map(([key,n])=>[key,Math.ceil(n*(expertise?1.25:1))]))};
 }
 const llamaLoads=[
  {name:'Armorer',cargo:{parts:16,powder:10,gears:6},weapon:'SMG',label:'Submachine gun'},
  {name:'Pathfinder',cargo:{charge:8,quartz:9,cells:4},weapon:'BR',label:'Battle rifle'},
  {name:'Fortifier',cargo:{planks:20,gears:10,parts:8},weapon:'SG',label:'Shotgun'}
 ];
 function nextLlama(profile){return llamaLoads[(profile.llamasOpened||0)%llamaLoads.length]}
 const labInterval=30*60000;
 function labStock(state,now){return Math.min(8,Math.max(0,Math.floor((now-(state.labStart??now))/labInterval)))}
 const offers=[
  {name:'Survey kit',cost:1,reward:{quartz:8,charge:5}},
  {name:'Fabrication kit',cost:1,reward:{parts:14,gears:8}},
  {name:'Reactor kit',cost:2,reward:{cells:8,powder:10}}
 ];
 function offerToday(now){const day=operations.windows(now).day;return {day,...offers[day%offers.length]}}
 const seasonLength=28*86400000;
 const voucherWeapons={MVR:'MVR-67',SG:'Shotgun',BR:'Battle rifle',SMG:'Submachine gun',RL:'Rocket launcher'};
 function frontier(profile,now){
  const season=Math.floor(now/seasonLength);
  return profile.frontier?.season===season?profile.frontier:{season,xp:0};
 }
 const badgeGoals={kills:30,builds:12,breaks:10};
 function fieldBadges(state,action){
  const run=action.id.replace(/-\d+$/,'');
  if(!run)return;
  const log=state.badgeRuns||={};
  const record=log[run]||={stats:{},earned:{}};
  for(const [metric,goal] of Object.entries(badgeGoals)){
   const delta=action.delta[metric];
   if(Number.isSafeInteger(delta)&&delta>0)record.stats[metric]=(record.stats[metric]||0)+delta;
   if(record.stats[metric]>=goal&&!record.earned[metric]){
    record.earned[metric]=true;
    const totals=state.badges||={};totals[metric]=(totals[metric]||0)+1;
    grant(state.inventory,{charge:2});
   }
  }
  const keys=Object.keys(log);if(keys.length>32)delete log[keys[0]];
 }
 function storageSlots(profile){
  return 24+4*['timbervale','ironridge','canyonlands','obsidian'].reduce((total,id)=>total+Math.min(5,profile.outpostWins?.[id]||0),0);
 }
 function reduce(prev,action){
  const state=copy(prev),squad=state.squad,entry=state.blueprints[action.id];
  switch(action.type){
   case 'initialize-outposts':{
    state.relaySites||={};
    for(const region of ['timbervale','ironridge','canyonlands','obsidian']){
     if(!Number.isInteger(state.relaySites[region]))state.relaySites[region]=crypto.getRandomValues(new Uint32Array(1))[0]%6;
    }
    for(const recipe of StormwatchEngineering.recipes){
     const key='trap/'+recipe.id;
     state.blueprints[key]||=defaultBlueprint(recipe.name,'trap');
    }
    break;
   }
   case 'stock-weapon':{
    if(entry?.kind!=='weapon'||(state.backpack||[]).length>=storageSlots(state))throw Error('Weapon unavailable or backpack full');
    spend(state.inventory,{parts:5,powder:3,gears:2});
    (state.backpack||=[]).push({serial:state.nextItem=(state.nextItem||0)+1,key:action.id,design:copy(entry)});
    break;
   }
   case 'unpack-weapon':{
    const index=(state.backpack||[]).findIndex(item=>item.serial===action.serial);
    if(index<0)throw Error('Weapon already removed');
    state.backpack.splice(index,1);break;
   }
   case 'redeem-voucher':{
    if(!(state.vouchers>0)||!Object.hasOwn(voucherWeapons,action.id)||entry)throw Error('Design unavailable');
    state.vouchers--;state.blueprints[action.id]=defaultBlueprint(voucherWeapons[action.id],'weapon');
    if(state.patterns)delete state.patterns[action.id];break;
   }
   case 'supercharge':{
    if(!(state.chargers>0)||!entry||entry.level!==50||(entry.chargeRank||0)>=5)throw Error('Requires a level 50 schematic and a supercharger');
    state.chargers--;entry.chargeRank=(entry.chargeRank||0)+1;break;
   }
   case 'flux-refine':{
    if(!entry||(entry.quality||0)>=4)throw Error('Schematic refinement unavailable');
    spend(state.inventory,{quartz:5*((entry.quality||0)+1),cells:2*((entry.quality||0)+1)});
    entry.quality=(entry.quality||0)+1;break;
   }
   case 'command-training':{
    const ranks=state.commandTraining||={},rank=ranks[action.id]||0;
    if(!stats.includes(action.id)||commander(state).points<1||rank>=20)throw Error('Command upgrade unavailable');
    ranks[action.id]=rank+1;break;
   }
   case 'train-hero':{
    if(!Object.hasOwn(operatives,action.id))throw Error('Unknown operative');
    const records=state.heroTraining||={},record=records[action.id]||={level:1,tier:1};
    if(record.level>=50)throw Error('Operative is fully trained');
    if(record.level===record.tier*10){
     spend(state.inventory,{quartz:record.tier*4,cells:record.tier*3});record.tier++;
    }else{
     const cost=heroCost(record);
     if((state.heroXP||0)<cost)throw Error('More operative XP needed');
     state.heroXP-=cost;record.level++;
    }
    break;
   }
   case 'commission-lab':
    if(state.labStart!=null)throw Error('Laboratory already running');
    state.labStart=Date.now();break;
   case 'collect-lab':{
    const now=Date.now(),points=labStock(state,now);
    if(!points)throw Error('Research is still in progress');
    state.labStart=points===8?now:state.labStart+points*labInterval;
    state.researchCredits=(state.researchCredits||0)+points;break;
   }
   case 'buy-stock':{
    const offer=offerToday(Date.now());
    if(action.day!==offer.day||state.stockDay===offer.day||(state.marks||0)<offer.cost)throw Error('Supply offer unavailable');
    state.stockDay=offer.day;state.marks-=offer.cost;grant(state.inventory,offer.reward);break;
   }
   case 'archive-design':{
    if(!entry||!allowedIds.includes(action.id)||state.catalog?.includes(action.id))throw Error('Design unavailable');
    spend(state.inventory,{parts:3});(state.catalog||=[]).push(action.id);
    if(state.catalog.length%3===0)state.llamas=(state.llamas??1)+1;
    break;
   }
   case 'save-preset':
   case 'equip-preset':{
    if(![0,1,2].includes(action.slot))throw Error('Unknown preset');
    const presets=state.presets||={};
    if(action.type==='save-preset')presets[action.slot]={lead:squad.lead,supports:[...squad.supports],synergy:squad.synergy,weapons:[...(state.fieldLoadout||['',''])]};
    else{
     const preset=presets[action.slot];if(!preset)throw Error('Preset is empty');
     squad.lead=preset.lead;squad.supports=[...preset.supports];squad.synergy=preset.synergy;state.fieldLoadout=[...preset.weapons];
    }
    break;
   }
   case 'open-llama':{
    const serial=state.llamasOpened||0;
    if(action.serial!==serial||(state.llamas??1)<1)throw Error('Supply llama unavailable');
    const load=nextLlama(state);
    grant(state.inventory,load.cargo);
    if(state.blueprints[load.weapon])state.marks=(state.marks||0)+1;
    else{state.blueprints[load.weapon]=defaultBlueprint(load.label,'weapon');if(state.patterns)delete state.patterns[load.weapon]}
    state.llamas=(state.llamas??1)-1;state.llamasOpened=serial+1;
    break;
   }
   case 'field-report':fileReport(state,action);break;
   case 'claim-operation':claimOperation(state,action.id);break;
   case 'claim-chapter':{
    const {active,wins}=operations.campaignProgress(state);
    if(!active||action.id!==active.key||!wins[active.key])throw Error('Complete the current campaign operation first.');
    state.campaign.claimed[active.key]=true;
    grant(state.inventory,active.reward);
    state.marks=(state.marks||0)+active.marks;
    break;
   }
   case 'research':{
    if(!Object.hasOwn(branches,action.id))throw Error('Unknown research branch.');
    state.research ||= {};
    const rank=state.research[action.id]||0,cost=rank+1;
    const credits=Math.min(state.researchCredits||0,cost);
    if(rank>=researchMax||(state.marks||0)<cost-credits)throw Error('Research is unavailable.');
    state.researchCredits=(state.researchCredits||0)-credits;state.marks=(state.marks||0)-(cost-credits);state.research[action.id]=rank+1;
    break;
   }
   case 'license-pattern':{
    const pattern=state.patterns?.[action.id];
    if(!allowedIds.includes(action.id)||!pattern||entry||(state.marks||0)<1)throw Error('Blueprint is unavailable.');
    state.marks--;
    state.blueprints[action.id]=defaultBlueprint(pattern,action.id.startsWith('trap/')?'trap':'weapon');
    delete state.patterns[action.id];
    break;
   }
   case 'dispatch-expedition':{
    const route=Object.hasOwn(routes,action.id)?routes[action.id]:null;
    if(!route||state.expedition||!availableForExpedition(state,action.specialist)||
      !operations.campaignProgress(state).unlocked.includes(route.region))throw Error('Expedition is unavailable.');
    const {minutes,reward}=expeditionTerms(route,member(state,action.specialist));
    state.expedition={route:action.id,specialist:action.specialist,arrives:Date.now()+minutes*60000,reward};
    break;
   }
   case 'collect-expedition':{
    const expedition=state.expedition;
    if(!expedition||Date.now()<expedition.arrives)throw Error('The expedition is still in the field.');
    grant(state.inventory,expedition.reward);delete state.expedition;
    break;
   }
   case 'field-loadout':{
    if(![0,1].includes(action.slot)||action.id!==''&&entry?.kind!=='weapon')throw Error('Invalid loadout slot');
    state.fieldLoadout ||= ['',''];state.fieldLoadout[action.slot]=action.id;
    break;
   }
   case 'lead':
    if(!operatives[action.id])throw Error('Invalid operative');
    if(squad.supports.includes(action.id))squad.supports[squad.supports.indexOf(action.id)]=squad.lead;
    squad.lead=action.id;break;
   case 'support':{
    const slot=action.slot;
    if(!operatives[action.id]||action.id===squad.lead||slot<0||slot>=5)throw Error('Choose another operative');
    const previous=squad.supports.indexOf(action.id);
    if(previous!==-1)squad.supports[previous]=squad.supports[slot];
    squad.supports[slot]=action.id;break;
   }
   case 'specialist':{
    const {dept,slot,id}=action;
    if(dept<0||dept>=8||slot<0||slot>=3||(id!==-1&&!specialists[id]))throw Error('Invalid assignment');
    if(id===state.expedition?.specialist)throw Error('This specialist is away on an expedition.');
    for(const assignments of squad.departments)for(let j=0;j<3;j++)if(id!==-1&&assignments[j]===id)assignments[j]=-1;
    squad.departments[dept][slot]=id;break;
   }
   case 'synergy':
    if(!['Expedition','Veteran Link','Field Repair'].includes(action.id))throw Error('Unknown module');
    squad.synergy=action.id;break;
   case 'train':{
    const person=member(state,action.id);
    if(!person||person.level>=50)throw Error('Specialist is fully trained');
    spend(state.inventory,trainingCost(person));
    const promotes=person.level>=person.stars*10;
    state.specialistRanks ||= {};
    state.specialistRanks[action.id]={level:person.level+(promotes?0:1),stars:person.stars+(promotes?1:0)};
    break;
   }
   case 'blueprint':
    if(!entry||entry.level>=50||entry.level>=entry.tier*10)throw Error('Evolve this blueprint first');
    spend(state.inventory,levelCost(entry));entry.level++;break;
   case 'evolve':
    if(!entry||entry.tier>=5||entry.level!==entry.tier*10)throw Error('Reach the tier level cap first');
    spend(state.inventory,evolutionCost(entry));entry.tier++;break;
   case 'recalibrate':{
    const slot=action.slot,limit=slot===4?elements.length:slot===5?corePerks.length:6;
    if(!entry||!Number.isInteger(slot)||slot<0||slot>5)throw Error('Invalid perk slot');
    if(entry.tier*2+2<=slot+1)throw Error('Evolve to access this slot');
    spend(state.inventory,recalibrationCost(slot));entry.perks[slot]=(entry.perks[slot]+1)%limit;break;
   }
   case 'salvage':
   case 'debrief':
    if(action.victory&&state.completions?.includes(action.completionId))break;
    if(action.outpost&&action.mission==='defense'&&operations.fieldMarks(action.region)){
     const forts=state.outposts||={};
     if(!forts[action.region]||forts[action.region].started<=action.outpost.started)forts[action.region]=action.outpost;
    }
    for(const key of Object.keys(components)){
     const quantity=action.bag[key];
     if(Number.isInteger(quantity)&&quantity>0)state.inventory[key]=clamp(state.inventory[key]+quantity,0,99999);
    }
    if(action.type==='debrief')state.waves++;
    if(action.victory){
     const marks=operations.fieldMarks(action.region);
     if(!marks||!Object.hasOwn(operations.missions,action.mission)||typeof action.completionId!=='string')throw Error('Unknown operation.');
     state.completions=[...(state.completions||[]).slice(-127),action.completionId];
     state.campaign ||= {wins:{},claimed:{}};
     state.campaign.wins[action.region+'/'+action.mission]=true;
     if(action.mission==='defense'){
      const wins=state.outpostWins||={};wins[action.region]=(wins[action.region]||0)+1;
     }
     state.marks=(state.marks||0)+marks;
     if(Object.hasOwn(operatives,action.operative)){
      state.service ||= {};
      state.service[action.operative]=(state.service[action.operative]||0)+1;
     }
     state.patterns ||= {};
     for(const item of action.discoveries){
      if(!allowedIds.includes(item.id)||Object.hasOwn(state.blueprints,item.id))continue;
      state.patterns[item.id]=String(item.name).slice(0,48);
     }
     grant(state.inventory,operations.payout(action.mission,action.region));
     const season=frontier(state,Date.now()),before=Math.floor(season.xp/300);
     season.xp+=100*marks;state.frontier=season;
     for(let rank=before+1;rank<=Math.floor(season.xp/300);rank++){
      if(rank%2===1)state.vouchers=(state.vouchers||0)+1;
      else state.chargers=(state.chargers||0)+1;
     }
     state.heroXP=(state.heroXP||0)+120*marks;
     state.missions++;
    }
    break;
   default:throw Error('Unknown Citadel action');
  }
  return state;
 }

 function commander(profile){
  const xp=(profile.missions||0)*240+(profile.waves||0)*40;
  let level=1,remaining=xp;
  while(level<100&&remaining>=level*80){remaining-=level*80;level++}
  const spent=Object.values(profile.commandTraining||{}).reduce((sum,n)=>sum+n,0);
  return {level,xp,remaining,next:level*80,points:level-1-spent};
 }
 function heroRecord(profile,id){return profile.heroTraining?.[id]||{level:1,tier:1}}
 function heroCost(record){return 40+record.level*10}
 function rating(profile){
  const out=[10,10,10,10],squad=profile.squad,lead=operatives[squad.lead]||operatives[0];
  for(const [dept,assignments] of squad.departments.entries()){
   const members=assignments.map(id=>member(profile,id)).filter(Boolean);
   if(!members.length)continue;
   const commander=member(profile,assignments[0]);
   const base=members.reduce((sum,m)=>sum+(m.level+m.stars*3)*(commander?.personality===m.personality?1.20:1),0);
   const counts=new Map();
   for(const m of members)counts.set(m.set,(counts.get(m.set)||0)+1);
   const bonuses=[...counts.values()].reduce((sum,n)=>sum+Math.floor(n/2)*.12,0);
   out[dept%4]+=base*(1+bonuses)*.46;
  }
  out[stats.indexOf(lead.stat)]+=lead.stars*2+4+service(profile,lead.id).rank*2;
  for(const id of squad.supports){
   const card=operatives[id];
   if(card)out[stats.indexOf(card.stat)]+=card.passive*card.stars*.55;
  }
  const members=[lead,...squad.supports.map(id=>operatives[id]).filter(Boolean)];
  const synergy=squad.synergy==='Expedition'?members.some(o=>o.className==='Prospector'):
   squad.synergy==='Veteran Link'?members.filter(o=>o.stars>=3).length>=3:
   members.filter(o=>o.className==='Architect').length>=2;
  if(synergy){
   if(squad.synergy==='Expedition')out[3]+=5;
   if(squad.synergy==='Veteran Link'){out[0]+=8;out[1]+=8}
   if(squad.synergy==='Field Repair')out[2]+=11;
  }
  for(const [i,stat] of stats.entries())out[i]+=(profile.commandTraining?.[stat]||0)*2;
  out[stats.indexOf(lead.stat)]+=(heroRecord(profile,lead.id).level-1)*.8;
  for(const id of squad.supports){const card=operatives[id];if(card)out[stats.indexOf(card.stat)]+=(heroRecord(profile,id).level-1)*.2}
  const vital=Object.fromEntries(stats.map((stat,i)=>[stat,Math.floor(out[i])]));
  const power=clamp(Math.round((out[0]*out[1]*out[2]*out[3])**.25),1,140);
  return {vital,power,lead,synergy,synergyName:squad.synergy};
 }
 function tune(entry){
  if(!entry)return {power:12,boost:1,crit:.045,critMulti:1.35,reload:1,mag:1,element:null,core:null};
  const [crit,multi,reload,mag,element,core]=entry.perks;
  const level=entry.level+2*(entry.chargeRank||0);
  return {power:10+level*.65+(entry.tier-1)*6,boost:1+.012*(level-1)+.065*(entry.tier-1),
   crit:.045+crit*.027+(entry.quality||0)*.02,critMulti:1.35+multi*.13,reload:1/(1+reload*.13),mag:1+mag*.10,
   element:element?elements[element]:null,core:entry.tier>=3?corePerks[core]:null};
 }
 const describeCost=cost=>Object.entries(cost).map(([key,n])=>n+' '+components[key]).join(' · ');
 function mountUI(lib,element,store,dispatch,initial){
  const {React,ReactDOM}=lib,h=React.createElement,root=ReactDOM.createRoot(element);
  const select=(label,value,values,change)=>{
   const action=event=>change(Number(event.target.value));
   return h('label',{className:'citadel-select'},h('span',null,label),h('select',{value,onChange:action,'aria-label':label},
    values.map(item=>h('option',{key:item.id,value:item.id},item.name))));
  };
  function App(){
   const {profile,pending,notice}=React.useSyncExternalStore(store.subscribe,store.getState);
   const [panel,setPanel]=React.useState(initial.panel||panels[0]),[selected,pickBlueprint]=React.useState(initial.item||'AR');
   const [trainee,setTrainee]=React.useState(0),[training,setTraining]=React.useState(0),[scout,setScout]=React.useState(0);
   const [now,setNow]=React.useState(Date.now);
   React.useEffect(()=>{
    const interval=setInterval(()=>setNow(Date.now()),30000);
    return ()=>clearInterval(interval);
   },[]);
   const {vital,power,lead,synergy,synergyName}=rating(profile),squad=profile.squad;
   let content;
   if(panel==='Frontier'){
    const season=frontier(profile,now),rank=Math.floor(season.xp/300);
    const entries=Object.entries(profile.blueprints),id=profile.blueprints[selected]?selected:entries[0][0],bp=profile.blueprints[id];
    const quality=bp.quality||0,cost={quartz:(quality+1)*5,cells:(quality+1)*2};
    content=h('div',{className:'citadel-grid'},
     h('article',{className:'operation-card'},h('h3',null,'Frontier season · Rank '+rank),
      h('progress',{max:300,value:season.xp%300,'aria-label':'Season XP'}),
      h('p',null,season.xp%300+' / 300 XP · Next reward: '+(rank%2?'supercharger':'weapon voucher')),
      h('small',null,'Victories grant 100 seasonal XP per regional Field Mark. Rank resets '+new Date((season.season+1)*seasonLength).toISOString().slice(0,10)+' UTC. Earned rewards carry over.')),
     h('article',{className:'operation-card'},h('h3',null,'Weapon research · '+(profile.vouchers||0)+' vouchers'),
      ...Object.entries(voucherWeapons).map(([key,name])=>h('button',{key,disabled:pending||!profile.vouchers||!!profile.blueprints[key],
       onClick:()=>dispatch({type:'redeem-voucher',id:key})},name+(profile.blueprints[key]?' · Owned':'')))),
     h('article',{className:'operation-card'},h('h3',null,'Schematic workshop'),
      h('select',{value:id,'aria-label':'Workshop schematic',onChange:e=>pickBlueprint(e.target.value)},entries.map(([key,v])=>h('option',{key,value:key},v.name))),
      h('p',null,'Refinement '+quality+' / 4 · +2 percentage points of critical chance per rank'),
      h('button',{disabled:pending||quality>=4||profile.inventory.quartz<cost.quartz||profile.inventory.cells<cost.cells,onClick:()=>dispatch({type:'flux-refine',id})},'Refine · '+describeCost(cost)),
      h('p',null,'Supercharge '+(bp.chargeRank||0)+' / 5 · Adds two effective levels per charge after level 50'),
      h('button',{disabled:pending||!profile.chargers||bp.level!==50||(bp.chargeRank||0)>=5,onClick:()=>dispatch({type:'supercharge',id})},'Apply supercharger · '+(profile.chargers||0)+' available')),
     h('article',{className:'operation-card'},h('h3',null,'Mission badges'),h('p',null,'Earn 2 Charge Fragments per badge, once per operation.'),
      ...Object.entries(badgeGoals).map(([metric,goal])=>h('p',{key:metric},goal+' '+metric+' · '+(profile.badges?.[metric]||0)+' badges earned'))));
   }else if(panel==='Command'){
    const track=commander(profile),record=heroRecord(profile,trainee),promote=record.level===record.tier*10;
    content=h('div',{className:'citadel-grid'},
     h('article',{className:'operation-card'},h('h3',null,'Commander level '+track.level),
      h('progress',{max:track.next,value:track.level===100?track.next:track.remaining,'aria-label':'Commander XP'}),
      h('p',null,track.xp+' lifetime XP · '+track.points+' training points'),
      h('small',null,'Earn 40 XP per banked wave and 240 XP per victory. Each level grants one training point.')),
     ...stats.map(stat=>h('button',{key:stat,disabled:pending||track.points<1||(profile.commandTraining?.[stat]||0)>=20,
      onClick:()=>dispatch({type:'command-training',id:stat})},stat+' · Rank '+(profile.commandTraining?.[stat]||0)+' / 20 · Train +2')),
     h('article',{className:'operation-card'},select('Operative training',trainee,Object.values(operatives),setTrainee),
      h('p',null,'Level '+record.level+' · Tier '+record.tier+' · '+(profile.heroXP||0)+' operative XP'),
      h('small',null,'Victories earn operative XP. Training improves the operative’s stat in lead and support slots.'),
      h('button',{disabled:pending||record.level>=50||(!promote&&(profile.heroXP||0)<heroCost(record))||(promote&&(profile.inventory.cells<record.tier*3||profile.inventory.quartz<record.tier*4)),
       onClick:()=>dispatch({type:'train-hero',id:trainee})},record.level>=50?'Fully trained':promote?'Promote · '+record.tier*3+' Cells + '+record.tier*4+' Quartz':'Train · '+heroCost(record)+' XP')));
   }else if(panel==='Squad'){
    const cards=Object.values(operatives);
    const candidate=card=>{
     const {rank}=service(profile,card.id);
     return {id:card.id,name:card.name+' · '+card.className+' · '+card.stars+'★'+(rank?' · Rank '+rank:'')};
    };
    const leadService=service(profile,lead.id);
    content=h('div',{className:'citadel-grid'},
     select('Lead operative',lead.id,cards.map(candidate),id=>dispatch({type:'lead',id})),
     h('article',{className:'operation-card'},h('h3',null,lead.name+' · Service rank '+leadService.rank),
      h('p',null,'Lead bonus · +'+(leadService.rank*2)+' '+lead.stat),
      h('small',null,leadService.next?leadService.wins+' / '+leadService.next+' victories as lead for next rank':'Maximum service rank')),
     ...squad.supports.map((id,slot)=>select('Support '+(slot+1),id,cards.filter(c=>c.id!==lead.id).map(candidate),id=>dispatch({type:'support',id,slot}))),
     h('label',{className:'citadel-select'},h('span',null,'Synergy'),h('select',{value:synergyName,
      onChange:event=>dispatch({type:'synergy',id:event.target.value}),'aria-label':'Synergy module'},
     ...['Expedition','Veteran Link','Field Repair'].map(name=>h('option',{key:name},name)))),
     h('p',null,synergy?'Module online':{
      Expedition:'Include a Prospector', 'Veteran Link':'Include three 3★ operatives', 'Field Repair':'Include two Architects'
     }[synergyName]));
   }else if(panel==='Specialists'){
    const names=specialists.map(({id})=>{
     const m=member(profile,id);
     return {id,name:m.name+' · '+m.personality+' · '+m.set+' · '+m.stars+'★'};
    });
    const person=member(profile,training);
    const teams=h('div',{className:'citadel-grid'},...squad.departments.map((team,dept)=>h('fieldset',{key:dept},
     h('legend',null,departments[dept]+' · '+stats[dept%4]),
     ...team.map((id,slot)=>select(slot===0?'Lead':'Specialist '+slot,id,[{id:-1,name:'Vacant'},...names.filter(person=>person.id!==profile.expedition?.specialist)],
      id=>dispatch({type:'specialist',dept,slot,id}))))));
    content=h(React.Fragment,null,h('div',{className:'citadel-grid'},
     select('Training roster',training,names,setTraining),
     h('div',null,h('button',{disabled:pending||person.level>=50,onClick:()=>dispatch({type:'train',id:training})},
      person.level>=person.stars*10&&person.level<50?'Promote':'Train'),
     h('p',null,person.level<50?'Level '+person.level+' · '+describeCost(trainingCost(person)):'Max level'))),teams);
   }else if(panel==='Expeditions'){
    const away=profile.expedition;
    if(away){
     const waiting=Math.max(0,Math.ceil((away.arrives-now)/60000));
     content=h('article',{className:'operation-card'},h('h3',null,routes[away.route].name),
      h('p',null,member(profile,away.specialist).name+(waiting?' · '+waiting+' min remaining':' returned to the Citadel')),
      h('small',null,describeCost(away.reward)),
      h('button',{disabled:pending||waiting>0,onClick:()=>dispatch({type:'collect-expedition'})},waiting?'In the field':'Collect salvage'));
    }else{
     const available=specialists.filter(person=>availableForExpedition(profile,person.id)).map(person=>member(profile,person.id));
     const candidate=available.find(person=>person.id===scout)||available[0];
     const unlocked=operations.campaignProgress(profile).unlocked;
     content=h(React.Fragment,null,h('p',null,'Send an unassigned specialist to gather materials. Matching the route’s specialty improves the haul and reduces travel time.'),
      candidate?select('Field specialist',candidate.id,available.map(person=>({...person,name:person.name+' · '+person.personality+' · Lv. '+person.level})),setScout):
       h('p',null,'Free a specialist from a department to start an expedition.'),
      h('div',{className:'citadel-grid'},...Object.entries(routes).map(([id,route])=>{
       const open=unlocked.includes(route.region),{minutes,reward}=expeditionTerms(route,candidate);
       return h('article',{key:id,className:'operation-card'},h('h3',null,route.name),
        h('p',null,route.trait+' specialty · '+minutes+' min'),h('small',null,describeCost(reward)),
        h('button',{disabled:pending||!open||!candidate,onClick:()=>dispatch({type:'dispatch-expedition',id,specialist:candidate.id})},
         open?'Dispatch':'Requires campaign clearance'));
      })));
    }
   }else if(panel==='Research'){
    const research=fieldResearch(profile);
    const credits=profile.researchCredits||0,stock=labStock(profile,now),started=profile.labStart!=null;
    content=h('div',{className:'citadel-grid'},h('article',{className:'operation-card'},h('h3',null,'Research laboratory'),
     h('p',null,'Generates one research credit every 30 minutes, including while away. Capacity 8.'),
     h('small',null,credits+' credits available · Credits are spent before Field Marks.'),
     h('button',{disabled:pending||started&&!stock,onClick:()=>dispatch({type:started?'collect-lab':'commission-lab'})},started?'Collect '+stock+' / 8':'Commission laboratory')),
     ...Object.entries(branches).map(([id,info])=>{
     const rank=research[id],cost=rank+1,maxed=rank===researchMax;
     return h('article',{key:id,className:'operation-card'},h('h3',null,info.name),
      h('p',null,rank?'Rank '+rank+' · '+info.benefit(rank):'Rank 0'),
      h('small',null,maxed?'Maximum rank':'Next rank · '+info.benefit(rank+1)),
      h('button',{disabled:pending||maxed||(profile.marks||0)+credits<cost,onClick:()=>dispatch({type:'research',id})},
       maxed?'Complete':'Research · '+Math.min(cost,credits)+' credits + '+marksText(Math.max(0,cost-credits))));
    }));
   }else if(panel==='Quartermaster'){
    const offer=offerToday(now),bought=profile.stockDay===offer.day;
    content=h('article',{className:'operation-card'},h('h3',null,offer.name),h('p',null,describeCost(offer.reward)),
     h('small',null,'Supply shipment rotates daily at 00:00 UTC.'),
     h('button',{disabled:pending||bought||(profile.marks||0)<offer.cost,onClick:()=>dispatch({type:'buy-stock',day:offer.day})},bought?'Purchased':'Buy · '+marksText(offer.cost)));
   }else if(panel==='Design Archive'){
    const catalog=profile.catalog||[];
    content=h('div',{className:'citadel-grid'},h('p',null,catalog.length+' designs filed · Every third entry earns a supply llama.'),
     ...Object.entries(profile.blueprints).map(([id,bp])=>h('button',{key:id,disabled:pending||catalog.includes(id)||profile.inventory.parts<3,
      onClick:()=>dispatch({type:'archive-design',id})},bp.name+(catalog.includes(id)?' · Filed':' · File copy for 3 parts'))));
   }else if(panel==='Loadout Presets'){
    content=h('div',{className:'citadel-grid'},...[0,1,2].map(slot=>{
     const preset=profile.presets?.[slot];
     return h('article',{key:slot,className:'operation-card'},h('h3',null,'Deployment '+(slot+1)),
      h('p',null,preset?[operatives[preset.lead].name,preset.synergy,...preset.weapons.map(id=>profile.blueprints[id]?.name||'Default weapon')].join(' · '):'Empty'),
      h('button',{disabled:pending,onClick:()=>dispatch({type:'save-preset',slot})},preset?'Replace with current loadout':'Save current loadout'),
      h('button',{disabled:pending||!preset,onClick:()=>dispatch({type:'equip-preset',slot})},'Equip'));
    }));
   }else if(panel==='Supply Llamas'){
    const load=nextLlama(profile),count=profile.llamas??1;
    const prize=profile.blueprints[load.weapon]?'1 Field Mark':load.label+' blueprint';
    content=h('article',{className:'operation-card'},h('h3',null,'🦙 '+load.name+' supply llama'),
     h('p',null,describeCost(load.cargo)+' · '+prize),
     h('button',{disabled:pending>0||!count,onClick:()=>dispatch({type:'open-llama',serial:profile.llamasOpened||0})},'Open llama · '+count+' available'),
     h('p',null,'Earn one llama for each daily quest you claim.'));
   }else if(panel==='Operations'){
    const {orders,quests,claimed,weekly,alert,count,archiveGoals}=operations.board(profile,now);
    const milestone=archiveGoals[profile.archive?.claimed||0];
    const card=(id,name,description,value,goal,claimed,reward)=>h('article',{key:id,className:'operation-card'},
     h('h3',null,name),h('p',null,description),
     h('progress',{value:Math.min(value,goal),max:goal,'aria-label':name}),
     h('small',null,Math.min(value,goal)+' / '+goal+' · '+describeCost(reward)),
     h('button',{disabled:pending>0||claimed||value<goal,onClick:()=>dispatch({type:'claim-operation',id})},
      claimed?'Claimed':'Claim'));
    content=h('div',{className:'citadel-grid'},
     ...quests.map(q=>card(q.id,q.name+' · Daily quest',q.description+' Earn a supply llama.',orders.stats[q.metric],q.goal,claimed.has(q.id),q.reward)),
     card('weekly',weekly.name+' · Weekly',weekly.description,orders.wins.length,weekly.goal,orders.weeklyClaimed,weekly.reward),
     h('article',{className:'operation-card'},h('h3',null,alert.name),
      h('p',null,operations.missions[alert.mission].name+' · '+alert.description),
      h('small',null,orders.alertClaimed?'Reward collected':describeCost(alert.bonus))),
     milestone?card('archive','Field Index','Record weapon designs, traps, Hollow species, and operation wins.',
      count,milestone.goal,false,milestone.reward):
      h('article',{className:'operation-card'},h('h3',null,'Field Index'),h('p',null,count+' entries · Rewards complete')));
   }else{
    const entries=Object.entries(profile.blueprints);
    const bp=profile.blueprints[selected]||entries[0][1],id=profile.blueprints[selected]?selected:entries[0][0];
    const atCap=bp.level===bp.tier*10,ready=atCap&&bp.tier<5;
    content=h('div',{className:'citadel-blueprints'},
     h('select',{className:'citadel-catalog',value:id,onChange:event=>pickBlueprint(event.target.value),'aria-label':'Blueprint'},
      entries.map(([name,item])=>h('option',{key:name,value:name},item.name))),
     h('article',{'data-rarity':tierOf(bp)},h('h3',null,bp.name),
      h('p',null,rarity[tierOf(bp)]+' · Level '+bp.level+' / 50 · Evolution '+bp.tier),
      h('button',{disabled:pending||bp.level>=50,
       onClick:()=>dispatch({type:ready?'evolve':'blueprint',id})},ready?'Evolve':'Level up'),
      bp.kind==='weapon'&&h('button',{disabled:pending||(profile.backpack||[]).length>=storageSlots(profile)||profile.inventory.parts<5||profile.inventory.powder<3||profile.inventory.gears<2,onClick:()=>dispatch({type:'stock-weapon',id})},'Craft for backpack · 5 Parts, 3 Powder, 2 Gears'),
      bp.kind==='weapon'&&h('small',null,(profile.backpack||[]).filter(item=>item.key===id).length+' stored · Backpack '+(profile.backpack||[]).length+' / '+storageSlots(profile)+' · +4 slots per regional defense victory, up to five per region'),
      h('small',null,bp.level<50?describeCost(ready?evolutionCost(bp):levelCost(bp)):'Max level'),
      h('div',{className:'citadel-grid'},
       ...perkNames.map((name,slot)=>{
        const value=slot===4?elements[bp.perks[slot]]:slot===5?corePerks[bp.perks[slot]]:'Rank '+(bp.perks[slot]+1);
        return h('button',{key:name,disabled:pending||bp.tier*2+2<=slot+1,
         title:describeCost(recalibrationCost(slot)),onClick:()=>dispatch({type:'recalibrate',id,slot})},name+' · '+value);
       }))));
   }
   return h('div',{className:'citadel-content'},
    h('div',{className:'citadel-rating'},h('strong',null,'Power '+power),h('small',null,marksText(profile.marks||0)),
     ...stats.map(stat=>h('small',{key:stat},stat+' '+vital[stat]))),
    h('div',{className:'citadel-tabs',role:'tablist'},...panels.map(name=>
     h('button',{key:name,role:'tab','aria-selected':panel===name,onClick:()=>setPanel(name)},name))),
    content,
    h('p',{className:'citadel-stock'},...Object.keys(components).map(key=>
     h('span',{key},components[key]+' '+profile.inventory[key]))),
    h('p',{role:'status'},notice||''));
  }
  root.render(h(App));return ()=>root.unmount();
 }

 async function open(){
  const db=await openDB();
  let profile;
  try{profile=await commit(db,{type:'initialize-outposts'})}catch(error){db.close();throw error}
  let value={profile,pending:0,notice:''};
  const listeners=new Set();
  const store={
   getState:()=>value,
   setState(fn){value={...value,...(typeof fn==='function'?fn(value):fn)};for(const f of listeners)f(value)},
   subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)}
  };
  let tail=Promise.resolve(),closed=false;
  function dispatch(action){
   if(closed)return Promise.resolve(false);
   store.setState(s=>({pending:s.pending+1}));
   const pending=tail.then(()=>commit(db,action)).then(next=>{
    store.setState({profile:next,notice:''});return true;
   }).catch(error=>{store.setState({notice:error.message||'Save failed'});return false})
    .finally(()=>store.setState(s=>({pending:s.pending-1})));
   tail=pending;return pending;
  }
  return {snapshot:()=>store.getState().profile,
   async prepareUI(){const lib=await libraries();return (node,initial={})=>mountUI(lib,node,store,dispatch,initial)},
   async refresh(){await tail;if(!closed)store.setState({profile:await read(db)})},
   dispatch,
   close(){closed=true;tail.finally(()=>db.close())}};
 }
 return {open,blank,rating,commander,tune,components,emptyBag,classes,payoutText,fieldResearch};
})();
