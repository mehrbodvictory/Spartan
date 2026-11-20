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
 const panels=['Squad','Specialists','Blueprints','Research','Expeditions','Operations'];
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
  const {orders,contract,weekly,count,archiveGoals}=operations.board(state,Date.now());
  state.orders=orders;
  if(id==='daily'&&!orders.dailyClaimed&&orders.stats[contract.metric]>=contract.goal){
   orders.dailyClaimed=true;grant(state.inventory,contract.reward);
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
 function reduce(prev,action){
  const state=copy(prev),squad=state.squad,entry=state.blueprints[action.id];
  switch(action.type){
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
    if(rank>=researchMax||(state.marks||0)<cost)throw Error('Research is unavailable.');
    state.marks-=cost;state.research[action.id]=rank+1;
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
     state.missions++;
    }
    break;
   default:throw Error('Unknown Citadel action');
  }
  return state;
 }

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
  const vital=Object.fromEntries(stats.map((stat,i)=>[stat,Math.floor(out[i])]));
  const power=clamp(Math.round((out[0]*out[1]*out[2]*out[3])**.25),1,140);
  return {vital,power,lead,synergy,synergyName:squad.synergy};
 }
 function tune(entry){
  if(!entry)return {power:12,boost:1,crit:.045,critMulti:1.35,reload:1,mag:1,element:null,core:null};
  const [crit,multi,reload,mag,element,core]=entry.perks;
  return {power:10+entry.level*.65+(entry.tier-1)*6,boost:1+.012*(entry.level-1)+.065*(entry.tier-1),
   crit:.045+crit*.027,critMulti:1.35+multi*.13,reload:1/(1+reload*.13),mag:1+mag*.10,
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
   const [training,setTraining]=React.useState(0),[scout,setScout]=React.useState(0);
   const [now,setNow]=React.useState(Date.now);
   React.useEffect(()=>{
    const interval=setInterval(()=>setNow(Date.now()),30000);
    return ()=>clearInterval(interval);
   },[]);
   const {vital,power,lead,synergy,synergyName}=rating(profile),squad=profile.squad;
   let content;
   if(panel==='Squad'){
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
    content=h('div',{className:'citadel-grid'},...Object.entries(branches).map(([id,info])=>{
     const rank=research[id],cost=rank+1,maxed=rank===researchMax;
     return h('article',{key:id,className:'operation-card'},h('h3',null,info.name),
      h('p',null,rank?'Rank '+rank+' · '+info.benefit(rank):'Rank 0'),
      h('small',null,maxed?'Maximum rank':'Next rank · '+info.benefit(rank+1)),
      h('button',{disabled:pending||maxed||(profile.marks||0)<cost,onClick:()=>dispatch({type:'research',id})},
       maxed?'Complete':'Research · '+cost+' Field Mark'+(cost===1?'':'s')));
    }));
   }else if(panel==='Operations'){
    const {orders,contract,weekly,alert,count,archiveGoals}=operations.board(profile,now);
    const milestone=archiveGoals[profile.archive?.claimed||0];
    const card=(id,name,description,value,goal,claimed,reward)=>h('article',{key:id,className:'operation-card'},
     h('h3',null,name),h('p',null,description),
     h('progress',{value:Math.min(value,goal),max:goal,'aria-label':name}),
     h('small',null,Math.min(value,goal)+' / '+goal+' · '+describeCost(reward)),
     h('button',{disabled:pending>0||claimed||value<goal,onClick:()=>dispatch({type:'claim-operation',id})},
      claimed?'Claimed':'Claim'));
    content=h('div',{className:'citadel-grid'},
     card('daily',contract.name+' · Daily',contract.description,orders.stats[contract.metric],contract.goal,orders.dailyClaimed,contract.reward),
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
  try{profile=await read(db)}catch(error){db.close();throw error}
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
 return {open,blank,rating,tune,components,emptyBag,classes,payoutText,fieldResearch};
})();
