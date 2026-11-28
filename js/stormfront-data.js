/* Stormfront content, persistence, grid routing, and the versioned mod format. */
const StormfrontData = (() => {
 const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
 const copy = value => JSON.parse(JSON.stringify(value));
 const list = (values, keys) => Object.fromEntries(values.map(([id, ...fields]) => [id, {id, ...Object.fromEntries(keys.map((key, i) => [key, fields[i]]))}]));
 const material = {
  Wood:{hp:180,build:.55,weak:'Fire',colors:['#a97147','#925b35','#6d4935']},
  Stone:{hp:290,build:1.2,weak:'Water',colors:['#ac7867','#85636b','#777684']},
  Metal:{hp:420,build:2.05,weak:'Nature',colors:['#637d80','#46677b','#587e96']}
 };
 const zones = list([
  ['quarrywood','Quarrywood',1,19,'Forest','#5aa38b','#253b39','#94aeca','Copper'],
  ['timbervale','Timbervale',19,46,'Suburbs','#86a9a5','#465d58','#8798b9','Silver'],
  ['mesa-gorge','Mesa Gorge',46,70,'Desert','#cb9963','#754737','#bd8f8d','Malachite'],
  ['obsidian-peaks','Obsidian Peaks',70,145,'Industrial Park','#88a4d5','#334456','#63678e','Obsidian']
 ], ['name','min','max','biome','color','ground','sky','ore']);
 const missions = list([
  ['relay','Relay Defense','Restore power, fortify the relay and repel five assaults.',480,1,'Physical','⌂'],
  ['atlas','Fight the Storm','Activate and defend the ATLAS.',480,1,'Physical','▲'],
  ['data','Retrieve the Data','Shoot down the weather balloon and keep the recorder online.',384,2,'Nature','⌁'],
  ['lightning','Ride the Lightning','Fuel Jett’s van and hold through two ignition cycles.',180,3,'Fire','ϟ'],
  ['repair','Repair the Shelter','Scan for eight repair modules and restore the shelter.',240,4,'Water','✚'],
  ['evacuate','Evacuate the Shelter','Break the opening siege, fortify, then protect the evacuation.',360,5,'Physical','⇥'],
  ['bomb','Deliver the Bomb','Lay a railway, escort the payload and defend the launcher.',240,6,'Fire','◈'],
  ['encampments','Destroy the Encampments','Clear five camps. Four more offer bonus salvage.',1200,1,'Physical','⊗'],
  ['rescue','Rescue the Survivors','Recover six survivors. Hank needs his missing medkit.',1200,2,'Nature','✦'],
  ['radar','Build the Radar Grid','Construct three towers with the exact structural plans.',1200,3,'Water','⌖'],
  ['seal-classic','Seal the Breach','Collect RiftGel and hold the Rift Anchor through a siege.',240,2,'Nature','⛓'],
  ['nests-classic','Clear the Nests','Find and destroy five guarded storm nests.',800,3,'Water','⊚'],
  ['payload-classic','Secure the Payload','Defend the retrieval pod and resupply it with RiftGel.',145,3,'Fire','⇩'],
  ['shield','Storm Shield Defense','Expand a persistent outpost and protect its amplifiers.',90,1,'Physical','⬡']
 ], ['name','brief','seconds','offset','element','icon']);
 const heroes = list([
  ['mara','Mara Flint','Soldier','#bd6249',['War Cry','Shockwave','Scatter Charge'],'Suppressing Fire','Epic'],
  ['bram','Bram Rivet','Constructor','#e4a94f',['Bull Rush','DECOY','Arc Barrage'],'B.A.S.E.','Epic'],
  ['ika','Ika Sable','Ninja','#a578d3',['Dragon Slash','Kunai Storm','Smoke Screen'],'Shadow Stance','Epic'],
  ['ren','Ren Voss','Outlander','#48bbaa',['Phase Shift','T.E.D.D.Y.','Chain Tower'],'Anti-Material Charge','Epic'],
  ['mira','Mira Tern','Soldier','#5371ab',['War Cry','Scatter Charge','Shockwave'],'Deep Reserves','Rare'],
  ['axel','Axel Forge','Constructor','#7fb183',['DECOY','Arc Barrage','Bull Rush'],'Braced Joints','Legendary'],
  ['sol','Sol Aster','Outlander','#dda1a5',['Chain Tower','Phase Shift','T.E.D.D.Y.'],'In the Zone','Legendary'],
  ['lark','Lark Prism','Ninja','#7be4f2',['Smoke Screen','Dragon Slash','Kunai Storm'],'Mantis Leap','Mythic']
 ], ['name','role','color','abilities','perk','rarity']);
 const ability = {
  'War Cry':[35,'buff',0,90],Shockwave:[22,'burst',7,115],'Scatter Charge':[16,'throw',6,130],
  'Bull Rush':[25,'dash',7,90],DECOY:[31,'decoy',7,0],'Arc Barrage':[30,'throw',7,155],
  'Dragon Slash':[16,'dash',6,140],'Kunai Storm':[24,'jump',7,130],'Smoke Screen':[27,'field',6,46],
  'Phase Shift':[9,'phase',8,0],'T.E.D.D.Y.':[46,'turret',17,26],'Chain Tower':[31,'turret',10,39]
 };
 const gadgets = ['Adrenaline Rush','Hover Turret','Banner','Supply Drop','Slow Field','Teleporter','Airstrike','Proximity Mine'];
 const tools = ['Pickaxe damage','Backpack capacity','Homebase Storage capacity','Building repair speed','Building max health'];
 const squadNames = ['EMT Squad','Training Team','Fire Team Alpha','Close Assault Squad','Scouting Party','Gadgeteers','Corps of Engineering','Think Tank'];
 const jobs = ['Doctor','Trainer','Marksman','Tactician','Explorer','Inventor','Engineer','Analyst'];
 const fort = ['Fortitude','Offense','Resistance','Tech'];
 const personalities = ['Pragmatic','Analytical','Curious','Cooperative','Adventurous','Dreamer','Competitive'];
 const sets = ['Trap Durability','Ranged Damage','Shield Regen','Health','Ability Damage'];
 const tiers = ['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
 const rarityColors = ['#9aa5aa','#7edd7c','#6ba7ff','#bc8dff','#ffa253','#ffda5f'];
 const components = ['Planks','Rough Ore','Twine','Mechanical Parts','Mineral Powder','Quartz Crystal','Coal','Batteries','Active Powercells','Copper','Silver','Malachite','Shadowshard','Obsidian','Sunbeam','Brightcore'];
 const weapons = list([
  ['rook','Rook-5','Assault Rifle',34,530,30,'Physical','#399397'],
  ['slate','Slate Breacher','Shotgun',94,88,7,'Physical','#a8795d'],
  ['cinder','Cinder Service','Pistol',52,240,13,'Fire','#e3815f'],
  ['annihilator','Annihilator','Shotgun Pistol',68,136,5,'Physical','#3f4a54'],
  ['wasp','Wasp Needle','SMG',21,850,36,'Nature','#9eb172'],
  ['northstar','Northstar','Sniper Rifle',144,50,6,'Water','#8da5ee'],
  ['hinge','Hinge Bow','Bow',119,68,1,'Nature','#ab8052'],
  ['flare','Magnetar','Explosive Launcher',154,43,3,'Energy','#ddac55'],
  ['edge','Boreal Edge','Sword',72,120,0,'Water','#7badcd'],
  ['pike','Vigil Pike','Spear',94,82,0,'Fire','#be784d'],
  ['harrow','Black Harrow','Scythe',105,68,0,'Nature','#729b70'],
  ['maul','Rivet Maul','Club',96,70,0,'Physical','#a78b69'],
  ['cleaver','Reclaimer','Axe',111,66,0,'Physical','#7f989b'],
  ['spanner','Breaker No. 3','Hardware',125,54,0,'Energy','#898ec1']
 ], ['name','type','damage','rpm','mag','element','color']);
 const traps = list([
  ['gas','Ceiling Gas Trap','ceiling','gas',26,5,26,1.65,'Nature','#b98f62'],
  ['field','Ceiling Electric Field','ceiling','shock',46,5,22,4.6,'Nature','#a681eb'],
  ['drop','Ceiling Drop Trap','ceiling','launch',28,4,18,2.0,'Physical','#737d9c'],
  ['darts','Wall Darts','wall','shot',66,4,25,9.1,'Physical','#d1a579'],
  ['dynamo','Wall Dynamo','wall','shock',108,6,19,2.8,'Nature','#9860bb'],
  ['piston','Wall Launcher','wall','launch',18,5,22,2.8,'Physical','#d58e51'],
  ['broadside','Broadside','wall','ricochet',77,5,24,6.4,'Physical','#b38b59'],
  ['spikes','Wooden Floor Spikes','floor','snare',31,2.5,30,2.2,'Physical','#ac8256'],
  ['freeze','Floor Freeze Trap','floor','freeze',12,5,23,2.1,'Water','#66cfeb'],
  ['launcher','Floor Launcher','floor','launch',18,4,23,2.0,'Physical','#d6a056'],
  ['anti-air','Anti-Air Trap','floor','intercept',0,1,25,8,'Physical','#5f8cba'],
  ['campfire','Cozy Campfire','floor','heal',19,3,30,3.9,'Physical','#f7a455'],
  ['healing','Healing Pad','floor','heal',38,5,18,2.7,'Energy','#62d6a1'],
  ['defender','Defender Pad','floor','defend',27,1.35,160,15,'Physical','#69b7c6']
 ], ['name','mount','behavior','damage','reload','durability','range','element','color']);
 for(const trap of Object.values(traps)){trap.crit=.08;trap.impact=trap.behavior==='launch'?5:0}
 const enemies = list([
  ['basic','Basic Husk','melee',58,2.55,10,'#9cab70',0],
  ['husky','Husky Husk','tank',155,1.65,23,'#9b805f',1],
  ['pitcher','Pitcher','throw',72,2.2,12,'#9dad80',1],
  ['lobber','Lobber','lob',62,1.8,15,'#b686af',2],
  ['sploder','Sploder','explode',112,2.0,65,'#b69f69',3],
  ['hive','Beehive Husk','swarm',106,2.0,8,'#c3a25a',2],
  ['riot','Riot Husky','shield',170,1.55,20,'#8c9ba2',3],
  ['zapper','Zapper','laser',90,2.3,16,'#b9a784',2],
  ['shielder','Shielder','ward',57,2.4,0,'#b195e2',4],
  ['nurse','Nurse Husk','heal',103,2.0,0,'#7dd393',3],
  ['smasher','Smasher','charge',410,2.5,100,'#765cb0',4],
  ['blaster','Blaster','beam',235,1.85,24,'#9185de',4],
  ['taker','Taker','phase',190,3.5,28,'#9c81c9',4],
  ['flinger','Flinger','fling',280,2.1,10,'#916baf',4]
 ], ['name','behavior','hp','speed','damage','color','weight']);
 const llama = [
  {name:'Upgrade Llama',cost:35,pool:['hero','survivor','weapon','trap']},
  {name:'Weapon Llama',cost:55,pool:['weapon','weapon','trap','weapon']},
  {name:'Super People Llama',cost:75,pool:['hero','survivor','hero','survivor']}
 ];
 const abilities=Object.fromEntries(Object.entries(ability).map(([name,[cooldown,behavior,range,damage]])=>[
  name,{id:name,name,cooldown,behavior,range,damage,color:null}
 ]));
 const content = {zones,missions,heroes,weapons,traps,enemies,abilities};
 const matrix = {
  Physical:{Physical:1,Fire:.5,Water:.5,Nature:.5},Energy:{Physical:1,Fire:.75,Water:.75,Nature:.75},
  Fire:{Physical:1,Fire:.67,Water:.25,Nature:1},Water:{Physical:1,Fire:1,Water:.67,Nature:.25},
  Nature:{Physical:1,Fire:.25,Water:1,Nature:.67}
 };
 const elemental = (attack, target) => matrix[attack]?.[target] ?? 1;
 const random = seed => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let mixer = Math.imul(seed ^ seed >>> 15, 1 | seed);
  mixer = mixer + Math.imul(mixer ^ mixer >>> 7, 61 | mixer) ^ mixer;
  return ((mixer ^ mixer >>> 14) >>> 0) / 4294967296;
 };
 const pick = (array,rng) => array[Math.floor(rng()*array.length)];
 const gridKey = (x,z) => x+','+z;
 const tile = 3;
 const radius = 13;
 const steps = [[1,0],[0,1],[-1,0],[0,-1]];
 const within = (x,z) => Math.abs(x)<=radius && Math.abs(z)<=radius;
 const edgeKey = (x,z,dx,dz) => dx<0||dz<0 ? edgeKey(x+dx,z+dz,-dx,-dz) : gridKey(x,z)+(dx?'x':'z');
 const cell = value => Math.round(value/tile);
 const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
 function route(start, goal, wallAt, pass=()=>true) {
  if(start.x===goal.x&&start.z===goal.z)return {};
  const queue=[{...start,d:0}], seen=new Set([gridKey(start.x,start.z)]);
  const dx=goal.x-start.x,dz=goal.z-start.z,den=Math.hypot(dx,dz)||1;
  let breach=null, breachRank=Infinity;
  for(let head=0;head<queue.length;head++){
   const from=queue[head];
   for(const [sx,sz] of steps){
    const x=from.x+sx,z=from.z+sz,k=gridKey(x,z);
    if(!within(x,z)||!pass(x,z)||seen.has(k))continue;
    const lateral=Math.abs((x-start.x)*dz-(z-start.z)*dx)/den;
    if(lateral>3.05)continue;
    const wall=wallAt(edgeKey(from.x,from.z,sx,sz));
    const first=from.first||{x,z};
    if(wall){
     const rank=wall.hp/50+from.d*.4+Math.abs(x-goal.x)+Math.abs(z-goal.z);
     if(rank<breachRank){breachRank=rank;breach={next:from.first,wall:wall.id}};
     continue;
    }
    if(x===goal.x&&z===goal.z)return {next:first};
    seen.add(k);
    queue.push({x,z,d:from.d+1,first});
   }
  }
  return breach||{};
 }
 function freshProfile(){
  const survivors=Array.from({length:32},(_,i)=>({
   id:'crew-'+i,name:(['Ari','Beck','Corin','Dev','Eli','Fin','Gale','Harper','Ivy','June','Kade','Lux','Mo','Nia','Orin','Pax'][i%16])+' '+(['Vale','Cross','Ember','Hale'][Math.floor(i/8)]),
   rarity:tiers[i<8?2:1+i%3],job:i<8?jobs[i]:'',personality:personalities[i%7],set:sets[i%5],value:i<8?7:4+i%3
  }));
  return {
   xp:0,campaignXp:0,quests:[],gold:100,tokens:45,bux:0,evolution:3,upgrade:0,research:40,researchAt:Date.now(),
   lab:[0,0,0,0],hero:'mara',supports:['','','','',''],owned:['mara'],
   gadgets:[gadgets[0],gadgets[1]],team:'',upgrades:{},survivors,squads:squadNames.map(()=>Array(8).fill('')),
   schematics:Object.fromEntries(['rook','edge','spikes'].map(id=>[id,{level:1,element:null,perks:Array(6).fill(0),path:'',copies:1}])),
   selected:'rook',buildKit:{},defender:'Assault',bank:{},backpack:{},collection:{},clears:{},outposts:{},queued:null,parcel:null
  };
 }
 const supportLevels=[2,4,6,9,13],gadgetLevels=[1,5];
 const heroLevels={mara:1,bram:2,ika:4,ren:6};
 const questOrder=[
  ['quarrywood','relay','Light the Relay',280],
  ['quarrywood','atlas','Close the Quarry Rift',260],
  ['quarrywood','rescue','Field Evacuation',320],
  ['quarrywood','shield','Secure Quarrywood',420],
  ['timbervale','data','The Weather Ledger',460],
  ['timbervale','repair','Repair Work',500],
  ['timbervale','shield','Secure Timbervale',560],
  ['mesa-gorge','encampments','Clear the Road',610],
  ['mesa-gorge','bomb','Break Through',680],
  ['mesa-gorge','shield','Secure Mesa Gorge',760],
  ['obsidian-peaks','payload-classic','Ridge Recovery',800],
  ['obsidian-peaks','shield','Secure Obsidian Peaks',900]
 ];
 function campaign(profile){
  let level=1,remaining=Math.max(0,Math.floor(profile.campaignXp||0));
  for(;level<50&&remaining>=155+level*55;level++)remaining-=155+level*55;
  return {level,remaining,next:155+level*55,quest:questOrder.find(([zone,id])=>!profile.quests?.includes(zone+':'+id))};
 }
 const survivorLevel=(squad,slot)=>1+squad*2+(slot?slot*2-1:0);
 const heroLevel=id=>heroLevels[id]??5;
 const weaponSlots=3;
 const capacity=profile=>430+Math.floor((campaign(profile).level-1)/2)*25+(profile.upgrades['Backpack capacity']||0)*100;
 const storage=profile=>700+Math.floor((campaign(profile).level-1)/2)*120+(profile.upgrades['Homebase Storage capacity']||0)*200;
 function fortStats(profile){
  const byId=new Map(profile.survivors.map(card=>[card.id,card]));
  const level=campaign(profile).level,stats=profile.lab.map(value=>1+(level>=3?value:0));
  const bonuses={};
  profile.squads.forEach((slots,i)=>{
   const lead=level>=survivorLevel(i,0)?byId.get(slots[0]):null,stat=Math.floor(i/2),matched={};
   if(lead)stats[stat]+=lead.value*(lead.job===jobs[i]?2:1);
   slots.slice(1).forEach((id,index)=>{
    if(level<survivorLevel(i,index+1))return;
    const card=byId.get(id);
    if(!card)return;
    stats[stat]+=card.value+(lead?.personality===card.personality?3:0);
    matched[card.set]=(matched[card.set]||0)+1;
   });
   for(const [key,count] of Object.entries(matched))bonuses[key]=(bonuses[key]||0)+Math.floor(count/(key==='Trap Durability'?2:3));
  });
  return {stats,bonuses,power:clamp(1+Math.floor((stats.reduce((a,b)=>a+b,0)-4)/4),1,145)};
 }
 function load(key,fallback){
  try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}
 }
 function save(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}
 }
 function claimResearch(profile){
  const units=Math.max(0,Math.floor((Date.now()-profile.researchAt)/60000));
  if(units){profile.research=Math.min(500,profile.research+units*2);profile.researchAt+=units*60000}
 }
 const modID=/^[a-z][a-z0-9-]{0,31}$/;
 const color=/^#[0-9a-f]{6}$/i;
 const modelFields=['shape','at','size','rotation','color','glow'];
 const shapes=['box','sphere','cylinder','cone','octa','torus'];
 const logic={
  zones:{...Object.fromEntries(['name','biome','ore'].map(k=>[k,'text'])),min:[1,145],max:[1,145],color:'color',ground:'color',sky:'color'},
  missions:{name:'text',brief:'text',seconds:[8,1800],offset:[1,50],element:'storm',icon:'text',base:'mission',biome:'text',levels:[1,4],objects:'objects',reward:'rewards',roster:'roster'},
  heroes:{name:'text',role:'role',color:'color',abilities:'abilities',perk:'text',rarity:'rarity',model:'model'},
  weapons:{name:'text',type:'text',damage:[1,2500],rpm:[15,1800],mag:[0,150],element:'element',color:'color',model:'model'},
  traps:{name:'text',mount:'mount',behavior:'trap',damage:[0,2500],reload:[.3,60],durability:[1,250],range:[.5,25],crit:[0,1],impact:[0,20],element:'element',color:'color',model:'model'},
  enemies:{name:'text',behavior:'enemy',hp:[1,20000],speed:[.1,14],damage:[0,500],color:'color',weight:[0,8],model:'model'},
  abilities:{name:'text',behavior:'ability-type',cooldown:[.5,120],range:[0,30],damage:[0,1800],color:'color'}
 };
 const options = {
  role:['Soldier','Constructor','Ninja','Outlander'],rarity:tiers,
  'ability-type':[...new Set(Object.values(abilities).map(v=>v.behavior))],
  element:Object.keys(matrix),storm:['Physical','Fire','Water','Nature'],mission:Object.keys(missions),
  mount:['floor','wall','ceiling'],trap:[...new Set(Object.values(traps).map(v=>v.behavior))],
  enemy:[...new Set(Object.values(enemies).map(v=>v.behavior))]
 };
 const isObject = value => value && Object.getPrototypeOf(value)===Object.prototype;
 function coordinate(value,min,max){return Array.isArray(value)&&value.length===3&&value.every(n=>Number.isFinite(n)&&n>=min&&n<=max)}
 function model(value){
  return Array.isArray(value)&&value.length>0&&value.length<=48&&value.every(part=>isObject(part)&&
   Object.keys(part).every(key=>modelFields.includes(key))&&shapes.includes(part.shape)&&coordinate(part.at,-30,30)&&
   coordinate(part.size,.02,25)&&(!part.rotation||coordinate(part.rotation,-Math.PI*2,Math.PI*2))&&
   color.test(part.color)&&(!Object.hasOwn(part,'glow')||typeof part.glow==='boolean'));
 }
 function valid(value,rule){
  if(Array.isArray(rule))return Number.isFinite(value)&&value>=rule[0]&&value<=rule[1];
  if(rule==='text')return typeof value==='string'&&value.trim().length>0&&value.length<=240&&!/[\u0000-\u001f]/.test(value);
  if(rule==='color')return typeof value==='string'&&color.test(value);
  if(rule==='model')return model(value);
  if(rule==='abilities')return Array.isArray(value)&&value.length===3&&value.every(v=>typeof v==='string'&&(Object.hasOwn(abilities,v)||modID.test(v)));
  if(rule==='roster')return Array.isArray(value)&&value.length>0&&value.length<=28&&value.every(v=>typeof v==='string'&&modID.test(v));
  if(rule==='objects')return Array.isArray(value)&&value.length<=32&&value.every(v=>isObject(v)&&
   Object.keys(v).every(k=>['at','model','salvage'].includes(k))&&coordinate(v.at,-36,36)&&model(v.model)&&
   (!v.salvage||Object.hasOwn(material,v.salvage)));
  if(rule==='rewards')return isObject(value)&&Object.keys(value).every(key=>['xp','gold','tokens','evolution','bux'].includes(key)&&
   Number.isSafeInteger(value[key])&&value[key]>=0&&value[key]<=10000);
  return options[rule]?.includes(value)===true;
 }
 const example={
  format:'spartan-drill-mod',version:2,id:'signal-lost',name:'Signal Lost',
  stormfront:{
  abilities:[{id:'signal-pulse',extends:'Shockwave',name:'Signal Pulse',cooldown:14,damage:145,color:'#63d9b8'}],
  heroes:[{id:'relay-tech',extends:'bram',name:'Relay Tech',abilities:['Bull Rush','DECOY','signal-pulse'],color:'#63d9b8'}],
  enemies:[{id:'signal-husk',extends:'basic',name:'Signal Husk',hp:86,speed:3.2,color:'#63d9b8'}],
  weapons:[{id:'relay-rifle',extends:'rook',name:'Relay Rifle',damage:48,element:'Energy',color:'#63d9b8',
   model:[{shape:'box',at:[0,0,0],size:[.18,.22,.75],color:'#34515f'},{shape:'cylinder',at:[0,0,.32],size:[.07,.07,.38],rotation:[1.57,0,0],color:'#63d9b8',glow:true}]}],
  missions:[{id:'signal-recovery',extends:'atlas',name:'Signal Recovery',brief:'Hold a rebuilt uplink through a short field trial.',seconds:45,roster:['signal-husk'],reward:{gold:90,tokens:20}}]
  }
 };
 function applyPacks(packs){
  const catalog=copy(content),ids=new Set();
  if(packs.length>12)throw Error('Stormfront can enable up to 12 content packs.');
  for(const pack of packs){
   if(!isObject(pack)||pack.format!=='spartan-drill-mod'||![2,3].includes(pack.version)||
    typeof pack.id!=='string'||!modID.test(pack.id)||ids.has(pack.id)||!valid(pack.name,'text')||
    !isObject(pack.stormfront)||Object.keys(pack.stormfront).some(k=>!Object.hasOwn(logic,k)))
    throw Error('The Stormfront section needs a unique Spartan Drill mod ID and valid content sections.');
   ids.add(pack.id);
   let count=0;
   for(const [section,fields] of Object.entries(logic)){
    const entries=Object.hasOwn(pack.stormfront,section)?pack.stormfront[section]:[];
    if(!Array.isArray(entries)||entries.length>32)throw Error('Invalid '+section+' list (up to 32 entries).');
    count+=entries.length;
    for(const entry of entries){
     if(!isObject(entry)||typeof entry.id!=='string'||!modID.test(entry.id)||content[section][entry.id]||
      Object.hasOwn(catalog[section],entry.id)||typeof entry.extends!=='string'||!Object.hasOwn(content[section],entry.extends))
      throw Error('Each '+section+' entry needs a unique id and a built-in extends value.');
     const base=catalog[section][entry.extends];
     const result={...base,id:entry.id};
     if(section==='missions')result.base=base.base||base.id;
     for(const [key,value] of Object.entries(entry)){
      if(key==='extends'||key==='id')continue;
      if(!Object.hasOwn(fields,key)||!valid(value,fields[key]))throw Error('Invalid '+section+' field '+key+' in '+entry.id+'.');
      result[key]=value;
     }
     if(section==='zones'&&result.min>result.max)throw Error('Zone minimum exceeds its maximum.');
     catalog[section][entry.id]=result;
    }
   }
   if(!count)throw Error('Add at least one content entry.');
  }
  for(const hero of Object.values(catalog.heroes))if(hero.abilities.some(id=>!Object.hasOwn(catalog.abilities,id)))throw Error('Unknown ability ID in '+hero.id+'.');
  for(const mission of Object.values(catalog.missions))if(mission.roster?.some(id=>!Object.hasOwn(catalog.enemies,id)))throw Error('Unknown enemy ID in '+mission.id+'.');
  return catalog;
 }
 const schema=(()=>{
  const ranged=(minimum,maximum)=>({type:'number',minimum,maximum});
  const type=name=>({type:name});
  const tuple=(items,count)=>({type:'array',items,minItems:count,maxItems:count});
  const arr=(items,minItems,maxItems)=>({type:'array',items,minItems,maxItems});
  const object=(properties,required=[])=>({type:'object',additionalProperties:false,properties,required});
  const text={type:'string',minLength:1,maxLength:240};
  const hex={type:'string',pattern:'^#[0-9a-fA-F]{6}$'};
  const id={type:'string',pattern:modID.source};
  const modelSchema=arr(object({shape:{enum:shapes},at:tuple(ranged(-30,30),3),size:tuple(ranged(.02,25),3),
   rotation:tuple(ranged(-Math.PI*2,Math.PI*2),3),color:hex,glow:type('boolean')},['shape','at','size','color']),1,48);
  const customRules={text,color:hex,model:modelSchema,
   abilities:tuple({anyOf:[{enum:Object.keys(abilities)},id]},3),roster:arr(id,1,28),
   objects:arr(object({at:tuple(ranged(-36,36),3),model:modelSchema,salvage:{enum:Object.keys(material)}},['at','model']),0,32),
   rewards:object(Object.fromEntries(['xp','gold','tokens','evolution','bux'].map(key=>[key,{type:'integer',minimum:0,maximum:10000}])))};
  const sections=Object.fromEntries(Object.entries(logic).map(([section,fields])=>[section,arr(object({
   id,extends:{enum:Object.keys(content[section])},...Object.fromEntries(Object.entries(fields).map(([key,rule])=>[key,
    Array.isArray(rule)?ranged(...rule):customRules[rule]||{enum:options[rule]}]))
  },['id','extends']),0,32)]));
  return {...object(sections),
   anyOf:Object.keys(sections).map(section=>({required:[section],properties:{[section]:{minItems:1}}}))};
 })();
 function hash(value){
  let h=2166136261;
  const text=JSON.stringify(value);
  for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
  return (h>>>0).toString(36);
 }
 return {clamp,copy,list,material,content,ability,gadgets,tools,squadNames,jobs,fort,personalities,sets,tiers,rarityColors,components,llama,
  elemental,random,pick,gridKey,tile,radius,steps,edgeKey,cell,within,distance,route,freshProfile,fortStats,campaign,survivorLevel,heroLevel,heroLevels,supportLevels,gadgetLevels,weaponSlots,capacity,storage,load,save,claimResearch,example,schema,applyPacks,hash};
})();

const annihilatorStats=Object.freeze({
 n:'Annihilator',d:17,r:.44,m:5,rs:5,sp:.04,rc:4.55,pel:6,au:0,rl:2.27,len:.42,col:0x3f4a54,sidearm:true
});

const annihilatorFinishes=new WeakMap();
function annihilatorFinish(T,type){
 let finishes=annihilatorFinishes.get(T);
 if(!finishes){finishes=new Map();annihilatorFinishes.set(T,finishes)}
 if(finishes.has(type))return finishes.get(type);
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
 const context=canvas.getContext('2d'),image=context.createImageData(128,64);
 let seed=24041;
 const noise=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let y=0;y<64;y++){
  const brush=204+noise()*24;
  for(let x=0;x<128;x++){
   const grey=type==='brushed'?brush+27*noise():
    (Math.cos(x*Math.PI/3)*Math.cos(y*Math.PI/3)>.45?188:243)+10*noise();
   image.data.set([grey,grey,grey,255],(y*128+x)*4);
  }
 }
 context.putImageData(image,0,0);
 const texture=new T.CanvasTexture(canvas);
 texture.wrapS=texture.wrapT=T.RepeatWrapping;
 texture.repeat.set(type==='brushed'?4:14,type==='brushed'?5:12);
 texture.anisotropy=2;finishes.set(type,texture);
 return texture;
}

function annihilatorReloadMotion(progress){
 const ease=(a,b)=>{const t=Math.min(1,Math.max(0,(progress-a)/(b-a)));return t*t*(3-2*t)};
 return {open:ease(.09,.29)*(1-ease(.79,.96)),eject:ease(.25,.47),insert:ease(.51,.75)};
}

function animateAnnihilatorReload(model,progress){
 const action=model?.userData.breakAction;
 if(!action)return;
 const [barrel,spent,strip]=action;
 if(progress<0){
  if(!model.userData.breechOpen)return;
  model.userData.breechOpen=false;barrel.rotation.x=0;spent.visible=strip.visible=false;return;
 }
 model.userData.breechOpen=true;
 const {open,eject,insert}=annihilatorReloadMotion(progress);
 barrel.rotation.x=.97*open;
 spent.visible=progress>=.25&&progress<.47;
 spent.position.set(-.055*eject,.117+.12*eject-.27*eject*eject,.096-.19*eject);
 spent.rotation.set(-1.45*eject,.52*eject,1.75*eject);
 strip.visible=progress>=.49&&progress<.76;
 strip.position.set(.177*(1-insert),-.284+.397*insert,-.068+.159*insert);
 strip.rotation.set(.45+.52*insert,-.43*(1-insert),.29*(1-insert));
}

function buildAnnihilatorModel(T,g,finish){
 const metal=(color,roughness,metalness,map)=>new T.MeshStandardMaterial({color,roughness,metalness,map:map||null});
 const brushed=annihilatorFinish(T,'brushed');
 const steel=metal(0x7f9097,.40,.59,brushed);
 const frame=metal(0x343f45,.48,.50,brushed);
 const barrelFinish=finish||metal(0x515e63,.41,.56,brushed);
 const black=metal(0x161d22,.64,.25);
 const copper=metal(0xa47649,.40,.64,brushed);
 const grip=metal(0x3f3431,.78,.06,annihilatorFinish(T,'stipple'));
 const shellRed=metal(0x7b382e,.56,.15);
 const sightDot=new T.MeshBasicMaterial({color:0xe5c996});
 const unitBox=new T.BoxGeometry(1,1,1);
 const mesh=(group,geo,material,x=0,y=0,z=0)=>{
  const part=new T.Mesh(geo,material);part.position.set(x,y,z);part.castShadow=true;group.add(part);return part;
 };
 const block=(group,material,x,y,z,w,h,d)=>{
  const part=mesh(group,unitBox,material,x,y,z);part.scale.set(w,h,d);return part;
 };
 const axle=(group,material,x,y,z,r,depth)=>{
  const part=mesh(group,new T.CylinderGeometry(r,r,depth,20),material,x,y,z);part.rotation.z=Math.PI/2;return part;
 };
 const sweep=(group,material,path,r)=>{
  const curve=new T.CatmullRomCurve3(path.map(point=>new T.Vector3(...point)));
  return mesh(group,new T.TubeGeometry(curve,26,r,9,false),material);
 };
 // Each ring lists its position, centre, and half-widths. The bevel flattens the side faces.
 function housing(group,material,stations,vertical=false,bevel=.56){
  const positions=[],uv=[],indices=[],sides=16;
  const round=value=>Math.sign(value)*Math.pow(Math.abs(value),bevel);
  for(const [i,[along,center,wide,tall]] of stations.entries())for(let j=0;j<=sides;j++){
   const a=j/sides*Math.PI*2,x=wide*round(Math.cos(a)),side=center+tall*round(Math.sin(a));
   positions.push(...(vertical?[x,along,side]:[x,side,along]));uv.push(j/sides,i/(stations.length-1));
   if(i&&j){
    const n=i*(sides+1)+j,k=n-sides-1;
    indices.push(...(vertical?[k-1,n,k,k-1,n-1,n]:[k-1,k,n,k-1,n,n-1]));
   }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  return mesh(group,geo,material);
 }
 function bore(group,material,y,z,inner,outer,reverse=false){
  const profile=[new T.Vector2(inner,0),new T.Vector2(inner,.014),new T.Vector2(outer-.003,.014),
   new T.Vector2(outer,.011),new T.Vector2(outer,0)];
  const part=mesh(group,new T.LatheGeometry(profile,24),material,0,y,z);
  part.rotation.x=reverse?Math.PI/2:-Math.PI/2;
  const shadow=mesh(group,new T.CircleGeometry(inner*.992,24),black,0,y,z+(reverse?.011:-.011));
  if(reverse)shadow.rotation.y=Math.PI;
 }
 housing(g,frame,[[-.139,.017,.001,.001],[-.126,.012,.020,.039],[-.095,.004,.033,.053],
  [.044,-.003,.040,.057],[.128,-.011,.043,.050],[.173,-.012,.032,.044],[.193,-.012,.002,.002]]);
 housing(g,grip,[[-.217,-.113,.001,.002],[-.209,-.113,.025,.041],[-.192,-.108,.029,.046],
  [-.150,-.095,.031,.044],[-.108,-.078,.028,.038],[-.073,-.062,.024,.033],[-.050,-.057,.012,.018],
  [-.043,-.057,.001,.002]],true,.72);
 housing(g,black,[[-.216,-.114,.002,.002],[-.212,-.114,.026,.040],[-.198,-.112,.028,.044],[-.195,-.112,.002,.002]],true);
 sweep(g,frame,[[0,-.046,-.029],[0,-.080,-.005],[0,-.112,.033],[0,-.113,.088],[0,-.090,.130],[0,-.047,.139]],.008);
 sweep(g,copper,[[0,-.038,.044],[0,-.054,.054],[0,-.069,.044],[0,-.083,.040]],.005);
 for(const side of [-1,1]){
  axle(g,black,side*.042,-.013,.152,.023,.009);
  axle(g,steel,side*.046,-.013,.152,.016,.009);
  axle(g,copper,side*.051,-.013,.152,.007,.004);
  axle(g,steel,side*.037,.018,-.074,.005,.005);
  sweep(g,copper,[[side*.034,-.008,-.094],[side*.039,-.007,-.068],[side*.043,-.007,.043],[side*.045,-.012,.092]],.0019);
  for(let i=0;i<6;i++){
   const y=-.113-i*.013,x=side*(.029+.0015*Math.sin(i*.6)),z=-.081-i*.0036;
   sweep(g,black,[[x,y-.007,z-.029],[x+side*.002,y,z],[x,y+.007,z+.022]],.0017);
  }
  const latch=block(g,steel,side*.036,.035,-.074,.011,.017,.045);latch.rotation.x=-.17;
  for(let i=0;i<4;i++)block(g,black,side*.042,.036,-.086+i*.007,.002,.011,.002);
 }
 const barrel=new T.Group();barrel.name='Break-action barrel';barrel.position.set(0,-.012,.152);g.add(barrel);
 // Two dark bores sit inside a single stepped shroud with a raised sight rib.
 housing(barrel,barrelFinish,[[-.099,.036,.034,.044],[-.078,.035,.038,.047],
  [-.021,.034,.040,.048],[.009,.036,.036,.043],[.045,.036,.032,.039],
  [.191,.036,.030,.037],[.244,.036,.035,.038],[.290,.036,.037,.042],[.301,.036,.037,.042]]);
 housing(barrel,steel,[[.280,.036,.036,.041],[.294,.036,.039,.043],[.303,.036,.039,.043],[.310,.036,.036,.040]]);
 const muzzlePlate=new T.Shape();
 muzzlePlate.moveTo(-.035,.009);muzzlePlate.lineTo(-.025,-.004);muzzlePlate.lineTo(.025,-.004);
 muzzlePlate.lineTo(.035,.009);muzzlePlate.lineTo(.035,.062);muzzlePlate.lineTo(.024,.075);
 muzzlePlate.lineTo(-.024,.075);muzzlePlate.lineTo(-.035,.062);muzzlePlate.closePath();
 const bores=[[.054,.017,.022],[.014,.014,.019]];
 for(const [y,inner] of bores){
  const opening=new T.Path();opening.absarc(0,y,inner,0,Math.PI*2,true);
  muzzlePlate.holes.push(opening);
 }
 mesh(barrel,new T.ShapeGeometry(muzzlePlate,24),steel,0,0,.310);
 for(const [y,inner,outer] of bores){
  bore(barrel,black,y,.310,inner,outer);
  bore(barrel,steel,y,-.099,inner,outer,true);
 }
 for(const side of [-1,1]){
  sweep(barrel,black,[[side*.037,.036,-.071],[side*.040,.036,-.020],[side*.035,.036,.027],
   [side*.031,.036,.115],[side*.033,.036,.236],[side*.037,.036,.279]],.0024);
  for(let i=0;i<5;i++){
   const slot=block(barrel,black,side*.032,.055,.051+i*.034,.003,.009,.019);slot.rotation.x=.28;
  }
  block(barrel,copper,side*.036,.014,.262,.004,.012,.026);
 }
 housing(barrel,black,[[-.042,.075,.018,.007],[.019,.080,.017,.007],[.215,.079,.014,.006],[.275,.080,.012,.006]]);
 block(barrel,black,0,.089,.258,.010,.020,.021);
 block(barrel,sightDot,0,.096,.246,.005,.007,.004);
 block(g,black,0,.060,-.094,.047,.015,.031);
 for(const side of [-1,1]){
  block(g,steel,side*.017,.075,-.094,.012,.020,.028);
  block(g,sightDot,side*.017,.077,-.109,.0035,.004,.001);
 }
 function shells(name,spent){
  const group=new T.Group();group.name=name;group.visible=false;g.add(group);
  for(let i=0;i<(spent?3:5);i++){
   const x=(i-(spent?1:2))*.019;
   const round=mesh(group,new T.CylinderGeometry(.0078,.0078,.041,12),spent?frame:shellRed,x,0,.025);round.rotation.x=Math.PI/2;
   const cap=mesh(group,new T.CylinderGeometry(.009,.009,.008,12),copper,x,0,.003);cap.rotation.x=Math.PI/2;
  }
  if(!spent)block(group,steel,0,-.010,.008,.103,.010,.028);
  return group;
 }
 g.userData.authored=true;
 g.userData.a={r:[-.028,-.118,-.084],l:[.037,-.168,-.087],m:[0,.063,.064]};
 g.userData.breakAction=[barrel,shells('Spent shells',true),shells('Fresh shell strip',false)];
 g.userData.sight={xt:0,yt:.084,zr:-.108};
 g.userData.muzzle={x:0,y:.042,z:.476};
 return g;
}
