/* Stormwatch's engineering rules use integer coordinates on the structural grid. */
var StormwatchEngineering = (() => {
 const CELL = 3.25;
 const QUANTA = 12;
 const ARCHETYPES = ['Wall', 'Floor', 'Ramp', 'Trap', 'Cap'];
 const dimensions = piece => piece === 0 ? 3 : 2;
 const fullMask = piece => (1 << dimensions(piece) ** 2) - 1;
 const present = (mask, bit) => (mask & (1 << bit)) !== 0;
 const rotations = angle => [Math.round(Math.cos(angle)), Math.round(Math.sin(angle))];
 const elements = ['Kinetic', 'Aether', 'Scorch', 'Frost', 'Volt'];
 const advantageous = {Scorch:'Volt', Frost:'Scorch', Volt:'Frost'};
 const materialWeakness = {wood:'Scorch', stone:'Frost', metal:'Volt'};

 function damageFactor(attack, defense) {
  if (defense === 'Kinetic') return 1;
  if (attack === 'Aether') return .75;
  if (attack === 'Kinetic') return .5;
  if (defense === 'Aether') return .75;
  if (advantageous[attack] === defense) return 1;
  return attack === defense ? .67 : .25;
 }
 const structureFactor = (attack, material) => materialWeakness[material] === attack ? 2 : 1;

 function connectedMask(piece, mask) {
  const n = dimensions(piece);
  if (!Number.isInteger(mask) || mask < 1 || mask > fullMask(piece)) return false;
  const first = Math.log2(mask & -mask);
  const todo = [first];
  let seen = 0;
  while (todo.length) {
   const bit = todo.pop();
   if (present(seen, bit)) continue;
   seen |= 1 << bit;
   const x = bit % n, y = Math.floor(bit / n);
   for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
    const a = x + dx, b = y + dy, i = b * n + a;
    if (a >= 0 && a < n && b >= 0 && b < n && present(mask, i) && !present(seen, i)) todo.push(i);
   }
  }
  return seen === mask;
 }

 function patchBounds(piece, bit) {
  const n = dimensions(piece), span = CELL / n;
  const x = bit % n, row = Math.floor(bit / n);
  return { u0:x * span - CELL / 2, u1:(x + 1) * span - CELL / 2,
   v0:row * span - (piece === 0 ? 0 : CELL / 2),
   v1:(row + 1) * span - (piece === 0 ? 0 : CELL / 2) };
 }
 function bitAt(piece, u, v) {
  const n = dimensions(piece);
  const inside = (value, low) => Math.max(0, Math.min(n - 1, Math.floor((value - low) * n / CELL)));
  return n * inside(v, piece === 0 ? 0 : -CELL / 2) + inside(u, -CELL / 2);
 }
 function surfaceHeight(piece, u, v) {
  if (piece === 2) return CELL / 2 - v;
  if (piece === 4) return Math.max(0, CELL / 2 - Math.max(Math.abs(u), Math.abs(v)));
  return 0;
 }
 function contacts(item) {
  const n = dimensions(item.piece), size = QUANTA / n;
  const [c, s] = rotations(item.angle);
  const ox = Math.round(item.x / CELL * QUANTA), oy = item.layer * QUANTA, oz = Math.round(item.z / CELL * QUANTA);
  const result = new Set();
  for (let i = 0; i < n * n; i++) {
   if (!present(item.mask, i)) continue;
   const left = (i % n) * size - QUANTA / 2;
   const bottom = Math.floor(i / n) * size - (item.piece === 0 ? 0 : QUANTA / 2);
   for (let x = 0; x <= size; x++) for (let y = 0; y <= size; y++) {
    if (x > 0 && x < size && y > 0 && y < size) continue;
    const u = left + x, v = bottom + y;
    let ly = v, w = 0;
    if (item.piece !== 0) {
     ly = Math.round(surfaceHeight(item.piece, u / QUANTA * CELL, v / QUANTA * CELL) * QUANTA / CELL);
     w = v;
    }
    result.add((ox + c * u + s * w) + ',' + (oy + ly) + ',' + (oz - s * u + c * w));
   }
  }
  return result;
 }
 const anchored = port => port.split(',')[1] === '0';

 function supportIndex(items) {
  const ports = new Map(), neighbors = new Map(), roots = [];
  for (const item of items) {
   neighbors.set(item, new Set());
   const keys = item.contacts;
   if ([...keys].some(anchored)) roots.push(item);
   const shared = new Map();
   for (const key of keys) {
    const occupants = ports.get(key);
    if (occupants) {
     for (const other of occupants) shared.set(other, (shared.get(other) || 0) + 1);
     occupants.push(item);
    } else ports.set(key, [item]);
   }
   for (const [other, count] of shared) if (count >= 2) {
    neighbors.get(item).add(other);
    neighbors.get(other).add(item);
   }
  }
  const supported = new Set(roots), queue = roots.slice();
  for (let i = 0; i < queue.length; i++) for (const next of neighbors.get(queue[i])) {
   if (supported.has(next)) continue;
   supported.add(next);
   queue.push(next);
  }
  return {ports, supported, neighbors};
 }

 function canSupport(keys, index) {
  const shared = new Map();
  for (const key of keys) {
   if (anchored(key)) return true;
   for (const other of index.ports.get(key) || []) if (index.supported.has(other)) {
    const count = (shared.get(other) || 0) + 1;
    if (count >= 2) return true;
    shared.set(other, count);
   }
  }
  return false;
 }

 const recipes = [
  {name:'Trench Spikes', id:'spikes', mount:'floor', cost:[10,0,6], range:1.55, reload:2.3, charges:18, element:'Kinetic'},
  {name:'Tar Pit', id:'tar', mount:'floor', cost:[8,10,0], range:1.42, reload:3.8, charges:12, element:'Scorch'},
  {name:'Launch Pad', id:'launch', mount:'floor', cost:[4,7,13], range:1.28, reload:4.5, charges:12, element:'Kinetic'},
  {name:'Flame Grill', id:'grill', mount:'floor', cost:[4,10,14], range:1.86, reload:4, charges:12, element:'Scorch'},
  {name:'Dart Volley', id:'darts', mount:'wall', cost:[11,0,11], range:3*CELL, reload:3.6, charges:16, element:'Kinetic'},
  {name:'Cannonade', id:'cannon', mount:'wall', cost:[6,9,19], range:6.6, reload:5.3, charges:10, element:'Kinetic'},
  {name:'Repulsor Piston', id:'piston', mount:'wall', cost:[6,5,15], range:2.32, reload:4.3, charges:13, element:'Kinetic'},
  {name:'Dynamo Grid', id:'dynamo', mount:'wall', cost:[3,8,17], range:2.15, reload:4, charges:13, element:'Volt'},
  {name:'Miasma Diffuser', id:'miasma', mount:'ceiling', cost:[7,10,12], range:2.9, reload:5, charges:12, element:'Aether'},
  {name:'Arc Coil', id:'coil', mount:'ceiling', cost:[2,12,19], range:1.5*CELL, reload:5.6, charges:10, element:'Volt'},
  {name:'Tire Dropper', id:'tires', mount:'ceiling', cost:[6,9,14], range:2.25, reload:6.2, charges:9, element:'Kinetic'},
  {name:'Rime Chandelier', id:'rime', mount:'ceiling', cost:[4,14,9], range:2.6, reload:5.2, charges:13, element:'Frost'},
  {name:'Tow Winch', id:'winch', mount:'wall', cost:[8,4,14], range:6, reload:4.8, charges:14, element:'Kinetic'}
 ];

 return {CELL, ARCHETYPES, dimensions, fullMask, present, connectedMask, patchBounds, bitAt, surfaceHeight,
  contacts, supportIndex, canSupport, elements, damageFactor, structureFactor, recipes};
})();
;

/* Rapier world used by Stormwatch only, with Three scene objects as ray hit identities. */
var StormwatchPhysics = (() => {
 const url='https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.18.0/rapier.mjs';
 const integrity='sha384-4JHh+Q2KxP6xi6PRmvlqbPOQKottQzPuBF+maE+hIoFdIOR3hjbjhlbBeODwrKD8';
 let library;
 async function verifiedLibrary(){
  const response=await fetch(url,{integrity,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Could not load Stormwatch physics.');
  const source=URL.createObjectURL(new Blob([await response.arrayBuffer()],{type:'text/javascript'}));
  try{
   const {default:rapier}=await import(source);
   await rapier.init();
   return rapier;
  }finally{URL.revokeObjectURL(source)}
 }
 function load(){
  if(!library)library=verifiedLibrary().catch(error=>{library=null;throw error});
  return library;
 }
 async function create(THREE,terrain,bound){
  const R=await load(),world=new R.World({x:0,y:-18,z:0});
  const character=world.createCharacterController(.021);
  character.enableSnapToGround(.115);
  character.enableAutostep(.21,.30,false);
  character.setMaxSlopeClimbAngle(Math.PI*.30);
  const player=world.createCollider(R.ColliderDesc.capsule(.528,.28).setSensor(true));
  const playerOffset=.835;
  const solid=new Set(),targets=new Map(),colliders=new Map(),moving=new Set();
  const position=new THREE.Vector3(),size=new THREE.Vector3(),rotation=new THREE.Quaternion();
  const step=.8125,parts=Math.round(bound*2/step),width=parts+1;
  const vertices=new Float32Array(width*width*3),triangles=new Uint32Array(parts*parts*6);
  for(let z=0;z<=parts;z++)for(let x=0;x<=parts;x++){
   const u=-bound+x*step,v=-bound+z*step,i=(z*width+x)*3;
   vertices.set([u,terrain(u,v)-.003,v],i);
   if(x<parts&&z<parts){
    const a=z*width+x,b=a+1,c=a+width,d=c+1;
    triangles.set([a,c,b,b,c,d],(z*parts+x)*6);
   }
  }
  const ground=world.createCollider(R.ColliderDesc.trimesh(vertices,triangles));
  solid.add(ground.handle);
  for(const axis of ['x','z'])for(const direction of [-1,1]){
   const edge=world.createCollider(R.ColliderDesc.cuboid(axis==='x'?.3:bound,12,axis==='z'?.3:bound)
    .setTranslation(axis==='x'?bound*direction:0,6,axis==='z'?bound*direction:0));
   solid.add(edge.handle);
  }
  function isSolid(object){
   const entity=object.userData.entity;
   return entity.type!=='enemy'&&(entity.type!=='structure'||entity.piece!==3&&entity.construction<=0);
  }
  function sync(entry){
   const {object,collider,triangle}=entry;
   object.getWorldPosition(position);object.getWorldQuaternion(rotation);
   collider.setTranslation(position);collider.setRotation(rotation);
   if(!triangle){
    object.getWorldScale(size);
    const half={x:Math.abs(size.x)*.5,y:Math.abs(size.y)*.5,z:Math.abs(size.z)*.5};
    collider.setHalfExtents(half);
   }
   const physical=isSolid(object);
   if(physical)solid.add(collider.handle);else solid.delete(collider.handle);
   collider.setSensor(!physical);
  }
  function add(object){
   if(colliders.has(object))return;
   const entity=object.userData.entity,triangle=entity.type==='structure'&&entity.piece===4;
   const desc=triangle?R.ColliderDesc.trimesh(
    new Float32Array(object.geometry.attributes.position.array),new Uint32Array(object.geometry.index.array)):
    R.ColliderDesc.cuboid(.5,.5,.5);
   const collider=world.createCollider(desc),entry={object,collider,triangle};
   colliders.set(object,entry);
   targets.set(collider.handle,object);
   if(entity.type==='enemy')moving.add(entry);
   sync(entry);
  }
  function remove(object){
   const entry=colliders.get(object);
   if(!entry)return;
   colliders.delete(object);targets.delete(entry.collider.handle);solid.delete(entry.collider.handle);
   moving.delete(entry);world.removeCollider(entry.collider,false);
  }
  function update(objects){
   for(const object of objects){
    const entry=colliders.get(object);
    if(entry)sync(entry);
   }
  }
  const allowSolid=collider=>solid.has(collider.handle);
  function move(origin,delta){
   player.setTranslation({x:origin.x,y:origin.y+playerOffset,z:origin.z});
   character.computeColliderMovement(player,delta,undefined,undefined,allowSolid);
   const movement=character.computedMovement();
   const next={x:origin.x+movement.x,y:origin.y+movement.y,z:origin.z+movement.z};
   player.setTranslation({x:next.x,y:next.y+playerOffset,z:next.z});
   return {next,grounded:character.computedGrounded(),delta:movement};
  }
  function query(origin,direction,distance){
   const result=world.castRay(new R.Ray(origin,direction),distance,true,undefined,undefined,undefined,undefined,
    collider=>collider.handle===ground.handle||targets.has(collider.handle));
   if(!result)return null;
   return {object:targets.get(result.collider.handle),distance:result.timeOfImpact,
    point:new THREE.Vector3().copy(origin).addScaledVector(direction,result.timeOfImpact)};
  }
  function enemyVolume(center,half){
   const volume=new Set();
   world.intersectionsWithShape(center,{x:0,y:0,z:0,w:1},new R.Cuboid(half.x,half.y,half.z),collider=>{
    const entity=targets.get(collider.handle)?.userData.entity;
    if(entity?.type==='enemy')volume.add(entity);
    return true;
   },undefined,undefined,undefined,undefined,collider=>targets.get(collider.handle)?.userData.entity?.type==='enemy');
   return volume;
  }
  function ball(origin,velocity,radius,bounce=true){
   const body=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(origin.x,origin.y,origin.z)
    .setLinvel(velocity.x,velocity.y,velocity.z).setCcdEnabled(true).setCanSleep(false));
   world.createCollider(R.ColliderDesc.ball(radius).setRestitution(bounce?.72:0).setFriction(.24)
    .setCollisionGroups((2<<16)|1),body);
   return body;
  }
  function advance(dt){
   for(const entry of moving)sync(entry);
   world.timestep=Math.max(1/240,Math.min(1/25,dt));
   world.step();
  }
  return {add,remove,update,move,query,advance,enemyVolume,ball,
   removeBall:body=>world.removeRigidBody(body),close:()=>world.free()};
 }
 return {create};
})();
;

/* Original Stormwatch operations and Citadel reward rules. */
var StormwatchOperations = (() => {
 const DAY=86400000;
 const missions={
  defense:{name:'Relay Defense',brief:'Recover two power cells, fortify the marked approaches, and launch five assaults from the relay. Surviving defenses are saved after each assault. Returning to a cleared region brings reinforcements.'},
  seal:{name:'Seal the Breach',brief:'Recover three Flux Crystals, fortify the Rift Anchor, and activate it to begin a four-minute siege.'},
  nests:{name:'Clear the Nests',brief:'Track down five Hollow nests, defeat their guardians, and shatter their cores before the storm closes.'},
  payload:{name:'Secure the Payload',brief:'Gather marked Flux and feed the recovery pod to expand its shelter. An empty tank stalls transmission and drains pod integrity.'}
 };
 const rewards={
  defense:{planks:18,gears:8,cells:3},
  seal:{quartz:12,charge:8,cells:3},
  nests:{powder:16,parts:10,charge:4},
  payload:{parts:16,gears:10,cells:4}
 };
 const sectors=['timbervale','ironridge','canyonlands','obsidian'];
 const campaign=[
  {region:'timbervale',mission:'defense',title:'A Light on the Ridge',brief:'Bring Timbervale’s relay back online so stranded survey crews can call for help.',reward:{planks:14,parts:10,powder:6}},
  {region:'timbervale',mission:'payload',title:'The Last Transmission',brief:'Recover the relay’s transmissions from a courier pod before the storm swallows the landing site.',reward:{gears:12,parts:15}},
  {region:'timbervale',mission:'seal',title:'Beyond the Static',brief:'Seal the breach interfering with the relay. The recovered signal opens a path to Ironridge.',reward:{quartz:10,cells:6}},
  {region:'ironridge',mission:'nests',title:'The Foundry Below',brief:'Clear the nests choking the roads around the old foundry.',reward:{powder:20,parts:12}},
  {region:'ironridge',mission:'defense',title:'Hold the Pass',brief:'Raise a second relay under heavier fire to reopen the supply route.',reward:{planks:24,gears:16}},
  {region:'ironridge',mission:'payload',title:'Drawn in Copper',brief:'Extract the foundry’s route survey. Its beacon points to a safe approach to Canyonlands.',reward:{parts:20,cells:8}},
  {region:'canyonlands',mission:'seal',title:'The Hollow Current',brief:'Close the breach feeding the storm through the canyon.',reward:{quartz:18,charge:14}},
  {region:'canyonlands',mission:'nests',title:'Cut the Tethers',brief:'Break the nests drawing energy from the canyon floor before the storm closes in.',reward:{powder:26,gears:18}},
  {region:'canyonlands',mission:'defense',title:'The Long Reach',brief:'Keep the ridge relay alive long enough to chart a route into Obsidian Peaks.',reward:{parts:25,cells:12}},
  {region:'obsidian',mission:'payload',title:'Cold Signal',brief:'Recover the survey team’s final report from a frostbound drop zone.',reward:{parts:30,gears:20}},
  {region:'obsidian',mission:'seal',title:'Where the Storm Begins',brief:'Follow the signal to the high breach and hold the Anchor through the full siege.',reward:{quartz:25,charge:18}},
  {region:'obsidian',mission:'defense',title:'The Northern Line',brief:'Defend the Frostline Relay against Stormbreaker and finish the northern warning network.',reward:{parts:36,cells:18}}
 ].map((chapter,index)=>({...chapter,index,key:chapter.region+'/'+chapter.mission,marks:index%3===2?3:1}));
 function campaignProgress(profile){
  const claimed=profile.campaign?.claimed||{},wins=profile.campaign?.wins||{};
  const active=campaign.find(chapter=>!claimed[chapter.key]);
  const unlocked=sectors.filter((_,index)=>index===0||claimed[campaign[index*3-1].key]);
  return {active,claimed,wins,unlocked,chapters:campaign};
 }
 function fieldMarks(region){
  return sectors.indexOf(region)+1;
 }
 function payout(mission,region){
  if(!Object.hasOwn(rewards,mission)||!sectors.includes(region))return {};
  const rate=1+sectors.indexOf(region)*.35;
  return Object.fromEntries(Object.entries(rewards[mission]).map(([item,count])=>[item,Math.round(count*rate)]));
 }
 function assaultFronts(seed,lanes){
  const compass=[0,2,3,1];
  const shift=(seed>>>0)%compass.length,sign=seed&4?-1:1;
  return lanes.map(lane=>compass[(shift+sign*compass.indexOf(lane)+compass.length)%compass.length]);
 }
 function assaultGroups(wave,fronts,players){
  const groups=[];
  for(let start=0;start<wave.units.length;start+=3){
   const units=wave.units.slice(start,start+3);
   for(let seat=1;seat<players;seat++)units.push(seat===2?'husk':'runner');
   groups.push({lane:fronts[groups.length%fronts.length],units});
  }
  return groups;
 }
 const modifiers=[
  {id:'quick',name:'Quickened Rift',description:'Hollows advance 22% faster. The Citadel pays extra salvage.',bonus:{gears:6,cells:2}},
  {id:'tough',name:'Hardened Brood',description:'Hollows arrive with 28% more health. The Citadel pays extra salvage.',bonus:{parts:10,quartz:4}},
  {id:'surge',name:'Pressure Front',description:'Hollow attacks deal 22% more damage. The Citadel pays extra salvage.',bonus:{powder:10,charge:4}}
 ];
 const daily=[
  {id:'salvage',name:'Salvage Crew',description:'Break 8 resource objects during operations.',metric:'breaks',goal:8,reward:{parts:5,quartz:2}},
  {id:'defender',name:'Rift Sweep',description:'Defeat 20 Hollows during operations.',metric:'kills',goal:20,reward:{powder:7,cells:2}},
  {id:'build',name:'Field Engineer',description:'Place 10 structures or mounted traps.',metric:'builds',goal:10,reward:{planks:8,gears:4}},
  {id:'scout',name:'Supply Sweep',description:'Recover 5 crates or supply caches.',metric:'caches',goal:5,reward:{parts:6,charge:3}},
  {id:'striker',name:'Mission Ready',description:'Complete one operation.',metric:'wins',goal:1,reward:{cells:3,quartz:4}}
 ];
 const weekly={id:'survey',name:'Frontline Survey',description:'Win three different operation types this week.',goal:3,reward:{parts:14,quartz:12,cells:5}};
 const metrics=['breaks','kills','builds','caches','wins'];
 const statline=()=>Object.fromEntries(metrics.map(metric=>[metric,0]));
 const archiveGoals=[
  {goal:6,reward:{planks:10,parts:5}},
  {goal:15,reward:{gears:8,quartz:5}},
  {goal:24,reward:{parts:14,cells:5}},
  {goal:34,reward:{quartz:15,cells:8}}
 ];
 const hollowIds=['husk','runner','spitter','brute','boss','mortar','demolisher','beam','phantasm','catapult','juggernaut'];
 function windows(time){
  const stamp=Math.floor(time/DAY);
  return {day:stamp,week:Math.floor((stamp+3)/7)};
 }
 const choose=(list,index)=>list[(index%list.length+list.length)%list.length];
 function dailyAlert(day){
  const [mission]=choose(Object.entries(missions),day);
  return {...choose(modifiers,day+Math.floor(day/4)),mission};
 }
 function blankOrders(now){
  const {day,week}=windows(now);
  return {day,week,stats:statline(),dailyClaimed:false,weeklyClaimed:false,alertClaimed:false,wins:[],receipts:[]};
 }
 function roll(saved,now){
  const next=blankOrders(now);
  if(!saved)return next;
  if(saved.day===next.day){
   next.stats={...next.stats,...saved.stats};
   next.claimedQuests=[...(saved.claimedQuests||[])];next.dailyClaimed=!!saved.dailyClaimed;next.alertClaimed=!!saved.alertClaimed;next.receipts=[...(saved.receipts||[])];
  }
  if(saved.week===next.week){next.wins=[...(saved.wins||[])];next.weeklyClaimed=!!saved.weeklyClaimed}
  return next;
 }
 function accrue(orders,action){
  const {day,week}=windows(action.started);
  if(day!==orders.day||orders.receipts.includes(action.id))return;
  orders.receipts.push(action.id);
  for(const key of metrics){
   const gain=action.delta[key];
   if(Number.isInteger(gain)&&gain>0)orders.stats[key]=Math.min(99999,orders.stats[key]+gain);
  }
  if(action.delta.wins>0&&week===orders.week&&!orders.wins.includes(action.mission))orders.wins.push(action.mission);
 }
 function board(profile,now){
  const orders=roll(profile.orders,now),contract=choose(daily,orders.day),alert=dailyAlert(orders.day);
  const count=Object.keys(profile.blueprints||{}).filter(key=>!key.startsWith('trap/')).length+
   Object.keys(profile.archive?.hollows||{}).length+Object.keys(profile.archive?.operations||{}).length+
   Object.keys(profile.archive?.traps||{}).length;
  const quests=[contract,choose(daily,orders.day+1),choose(daily,orders.day+3)];
  const claimed=new Set(orders.claimedQuests||[]);
  if(orders.dailyClaimed)claimed.add(contract.id);
  return {orders,alert,contract,quests,claimed,weekly,count,archiveGoals};
 }
 return {missions,windows,statline,dailyAlert,roll,accrue,board,archiveGoals,hollowIds,payout,assaultFronts,assaultGroups,campaignProgress,fieldMarks};
})();
;

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
;

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
;

var StormwatchHub=(()=>{
 function pads(){
  try{return [...navigator.getGamepads()].filter(g=>g?.connected&&g.axes.length>=4)}catch{return []}
 }
 function controllerPad(){
  const assigned=window.SD_SPLIT?.pad;
  return pads().find(g=>assigned==null||g.index===assigned);
 }
 function directionalControl(controls,current,x,y){
  if(!controls.length)return null;
  const index=controls.indexOf(current);
  if(index<0)return controls[0];
  const origin=current.getBoundingClientRect();
  let best=null,score=Infinity;
  for(const item of controls){
   if(item===current)continue;
   const rect=item.getBoundingClientRect(),dx=rect.left+rect.width/2-origin.left-origin.width/2,
    dy=rect.top+rect.height/2-origin.top-origin.height/2;
   const forward=x*dx+y*dy,across=Math.abs(x*dy-y*dx),cost=forward+across*2.6;
   if(forward>4&&cost<score){best=item;score=cost}
  }
  return best||controls[(index+(x+y>0?1:-1)+controls.length)%controls.length];
 }
 function launchLocal(settings,url){
  const [first,second]=pads();if(!second)return;
  url.searchParams.delete('openStormwatch');
  const room=Math.random().toString(36).slice(2,12).padEnd(6,'0');
  for(const [key,value] of Object.entries({...settings,split:room,g1:first.index,g2:second.index}))url.searchParams.set(key,value);
  location.assign(url);
 }
 const world={
  timbervale:{name:'Timbervale',site:'Relay Ridge',floor:1,ceiling:19,pin:[30,45],color:'#638c64',high:'#acc17c',water:'#527774',terrain:'Pine forests and the old relay road'},
  ironridge:{name:'Ironridge',site:'Foundry Pass',floor:19,ceiling:46,pin:[53,29],color:'#8c8d71',high:'#d2bd8d',water:'#516c6e',terrain:'Ironworks along the mountain pass'},
  canyonlands:{name:'Canyonlands',site:'Copper Wash',floor:46,ceiling:70,pin:[67,70],color:'#ac6a4e',high:'#e4ad79',water:'#47767a',terrain:'Dry washes and abandoned mining camps'},
  obsidian:{name:'Obsidian Peaks',site:'Frostline Relay',floor:70,ceiling:140,pin:[78,27],color:'#728aa6',high:'#dae5e4',water:'#4c617c',terrain:'Glacial ridges and isolated research stations'}
 };
 const points=[
  {id:'defense',x:212,y:320,icon:'⬢',tint:'#76ebd0'},
  {id:'seal',x:491,y:197,icon:'◇',tint:'#e4a9ed'},
  {id:'nests',x:747,y:358,icon:'⌾',tint:'#ffaf92'},
  {id:'payload',x:560,y:517,icon:'↓',tint:'#b4d8ff'}
 ];
 const css=`<style>
  :host{color:#edf6f4;font:500 14px system-ui;position:fixed;inset:0;z-index:1001;display:block;background:#111d24}
  :host([hidden]){display:none!important}
  *{box-sizing:border-box}[hidden]{display:none!important}button,input,select{font:inherit;color:inherit}
  button{cursor:pointer;background:#233942;border:1px solid #5c7881;border-radius:5px;padding:.62rem .88rem;font-weight:650}
  button:disabled{opacity:.38;cursor:default}button:not(:disabled):is(:hover,:focus-visible){border-color:#b5ffeb;background:#315760}
  button:focus-visible,select:focus-visible,input:focus-visible,[data-pad-focus]{outline:2px solid #b5ffeb;outline-offset:2px}
  h1,h2,p,ul{margin:0}main{height:100%;display:flex;flex-direction:column}
  header{flex:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:13px clamp(12px,2.4vw,35px);background:#14232b;border-bottom:1px solid #425862}
  h1{font:800 clamp(1.45rem,2.9vw,2.48rem)/1 'Barlow Condensed','Arial Narrow',system-ui;letter-spacing:.045em;text-transform:uppercase}
  nav{display:flex;gap:.38rem;flex-wrap:wrap}nav button{background:transparent;border-color:transparent}nav [aria-current=true]{border-color:#87d7c2;color:#a6f3df;background:#233e48}
  .power{color:#a6f3df;font-weight:750;white-space:nowrap}.small{font-size:.82rem;color:#b6c9cb}.eyebrow{color:#9bd7ca;font-size:.73rem;font-weight:760;letter-spacing:.12em;text-transform:uppercase}
  .panel{min-height:0;overflow:auto;flex:1;padding:clamp(12px,2vw,28px)}
  #map-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(235px,305px);gap:16px}
  #viewport{position:relative;isolation:isolate;overflow:hidden;min-height:330px;border:1px solid #59727b;border-radius:8px;background:#233e4a;touch-action:none}
  #viewport.dragging{cursor:grabbing}canvas,#pins{position:absolute;inset:0;width:100%;height:100%}#pins{pointer-events:none}
  .pin{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;white-space:nowrap;background:#182b34ec;box-shadow:0 7px 14px #14282580;z-index:1}
  .pin[aria-pressed=true]{z-index:2;border-color:var(--signal,#b5ffeb);box-shadow:0 0 0 3px #f8fff22b,0 8px 16px #15292baa}
  .pin.world{display:flex;align-items:center;gap:7px}.pin.world span{color:var(--signal);font-size:1.05rem}
  .pin.node{padding:.22rem .55rem .28rem;color:var(--signal);font-size:1.47rem;min-width:39px;animation:float 2.9s ease-in-out infinite}
  .pin.node::after{content:"";position:absolute;top:100%;left:calc(50% - 1px);width:2px;height:15px;background:linear-gradient(var(--signal),transparent)}
  @keyframes float{50%{margin-top:-5px}}
  .map-tag{position:absolute;top:13px;left:13px;padding:6px 9px;background:#192d37e8;border-radius:4px;pointer-events:none}
  .map-tools{position:absolute;left:12px;bottom:12px;display:flex;gap:5px;z-index:3}
  .map-tools button{padding:.32rem .53rem;background:#172c37f2}
  aside{display:flex;flex-direction:column;gap:14px;align-self:start;background:#182931;border:1px solid #465e67;border-radius:8px;padding:18px}
  aside h2{font-size:1.45rem;line-height:1.1}aside p{line-height:1.5}
  .actions{display:grid;gap:8px}.actions .primary,.primary{background:#94e3cb;color:#122c33;border-color:#a2f2dc;font-weight:800}
  .actions .primary:not(:disabled):hover{background:#c1ffe7}.alert{display:flex;align-items:start;gap:7px}
  #ops{display:grid;gap:4px}#ops button{text-align:left;padding:.5rem;background:#1f323b}#ops button[aria-current=true]{color:#b4f8e6;border-color:#9adacb}
  #squad-panel,#inventory-panel,#citadel-panel,#audio-panel,#campaign-panel{background:radial-gradient(ellipse at 87% 12%,#25454b,#131f27 69%)}
  .stack{max-width:900px;margin:auto;display:grid;gap:16px}.card{background:#182b35;border:1px solid #507078;border-radius:8px;padding:16px;display:grid;gap:12px}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(154px,1fr));gap:8px}.resource{min-height:95px}.resource b{font-size:1.7rem;color:#a6f3df}
  .row{display:flex;gap:7px;flex-wrap:wrap;align-items:center}label.slot{display:grid;gap:5px}
  .audio-control{display:grid;grid-template-columns:minmax(0,1fr) 5ch;gap:6px 12px;align-items:center;padding:11px 0;border-bottom:1px solid #405961}
  .audio-control span{grid-column:1/-1}.audio-control input{width:100%;accent-color:#94e3cb}.audio-control output{text-align:right;font-variant-numeric:tabular-nums}
  .audio-checkbox span{grid-column:1}.audio-checkbox input{justify-self:end;width:19px;height:19px}
  #invite-keys{display:grid;grid-template-columns:repeat(auto-fit,minmax(39px,1fr));gap:4px}
  #invite-keys button{padding:.4rem}
  @media(max-height:540px){
   header{padding:5px 10px;gap:4px}header h1{font-size:1.45rem}nav button{padding:.32rem .52rem}
   .panel{padding:9px}.campaign-hero{min-height:initial;padding:14px}.campaign-hero h2{font-size:2rem}
   #map-panel{grid-template-columns:minmax(0,1fr) minmax(170px,32%);align-items:start;gap:8px}
   #viewport{min-height:190px;height:calc(100dvh - 76px)}
   #map-panel aside{padding:9px;gap:6px}#map-panel aside h2{font-size:1.1rem}
   #map-panel aside button{padding:.35rem .5rem}
  }
  @media(max-height:540px) and (max-width:480px){#map-panel{grid-template-columns:1fr}#viewport{height:180px;min-height:0}}
  #campaign-panel .stack{max-width:1120px}
  .campaign-hero{position:relative;isolation:isolate;overflow:hidden;min-height:300px;grid-template-columns:minmax(0,1fr);gap:14px;align-content:center;padding:clamp(18px,4vw,54px);border-color:#78959a;border-left:4px solid var(--chapter-signal,#addac6);background:#1a2b35;box-shadow:0 18px 32px #08101a8c}
  .campaign-hero #campaign-scene{z-index:-2;position:absolute;width:100%;height:100%;object-fit:cover;object-position:right center}
  .campaign-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#102128 0%,#102128ee 26%,#1021288f 53%,#10212822 100%);z-index:-1}
  .campaign-hero .chapter-copy,.campaign-pay{max-width:min(575px,66%)}
  .campaign-hero .eyebrow{color:var(--chapter-signal,#addac6)}
  .campaign-hero h2{margin:5px 0 9px;font:850 clamp(2.25rem,5.5vw,5.55rem)/.88 'Barlow Condensed','Arial Narrow',system-ui;letter-spacing:-.027em;text-transform:uppercase;text-shadow:0 5px 20px #071016}
  .campaign-hero p{line-height:1.5;color:#edf8ee}.campaign-pay{display:grid;gap:5px;align-content:center;border-top:1px solid #c4eeb765;padding-top:9px}
  .campaign-hero progress,.operation-card progress{width:100%;accent-color:#94e3cb;height:8px}
  .campaign-actions{display:flex;flex-wrap:wrap;gap:7px;grid-column:1/-1}
  .campaign-route{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
  .campaign-region{display:grid;gap:8px;align-content:start;border-top:3px solid var(--sector);min-width:0;position:relative;background:linear-gradient(160deg,#20323a,#14252d)}
  .campaign-region h3{margin:0;font-size:1rem}.campaign-region ul{display:grid;gap:7px;padding:0;list-style:none;line-height:1.45}
  .campaign-region li{display:grid;gap:2px;padding:5px 7px 5px 17px;position:relative;border-left:1px solid #53636c;color:#bccdcd;font-size:.79rem}
  .campaign-region li::before{content:"";position:absolute;left:-4px;top:10px;width:7px;height:7px;background:#637e82;transform:rotate(45deg)}
  .campaign-region li[data-won]::before{background:var(--sector)}
  .campaign-region li[aria-current=step]{border-color:var(--sector);color:#f2fff9;background:#2a444a}
  .campaign-region li[aria-current=step]::before{background:var(--sector);box-shadow:0 0 11px var(--sector);animation:tracking 2.6s ease-out infinite}
  .campaign-region small{color:#a7d9cc}.campaign-foot{min-height:1.1em;color:#b0e9cf}
  #campaign-panel:not([hidden]) .campaign-hero{animation:dispatch-enter .4s cubic-bezier(.2,.7,.3,1) both}
  @keyframes dispatch-enter{from{opacity:0;transform:translateY(9px)}}
  @keyframes tracking{65%{box-shadow:0 0 1px var(--sector)}}
  .citadel-content{display:grid;gap:14px}.citadel-content p,.citadel-content small{line-height:1.5}
  .citadel-rating,.citadel-stock{display:flex;flex-wrap:wrap;align-items:center;gap:9px 14px;padding:12px;background:#192e37;border:1px solid #496873;border-radius:6px}
  .citadel-rating strong,.citadel-stock span{color:#a6f3df}
  .citadel-tabs{display:flex;flex-wrap:wrap;gap:6px}.citadel-tabs [aria-selected=true]{border-color:#87d7c2;color:#a6f3df;background:#233e48}
  .citadel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:10px}
  .citadel-grid fieldset,.operation-card,.citadel-blueprints article{min-width:0;border:1px solid #496873;background:#182b35;border-radius:6px;padding:12px}
  .citadel-select,.operation-card,.citadel-blueprints{display:grid;align-content:start;gap:7px;min-width:0}
  .citadel-select select,.citadel-catalog{width:100%;min-width:0}.operation-card h3,.citadel-blueprints h3{margin:0}
  .citadel-blueprints article{display:grid;gap:8px}.citadel-blueprints .citadel-grid button{min-width:0}
  @media(max-width:840px){.campaign-route{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:520px){.campaign-route{grid-template-columns:1fr}.campaign-hero :is(.chapter-copy,.campaign-pay){max-width:100%}.campaign-hero::before{background:linear-gradient(90deg,#102128f5,#10212885)}}
  input[type=text],select{border:1px solid #618089;background:#101e27;border-radius:4px;padding:.59rem .75rem}
  #code{font-size:1.6rem;color:#a6f3df;letter-spacing:.21em}#members{padding-left:1.2rem;line-height:1.8}
  #status{min-height:1.5em}#citadel-root{max-width:1020px;margin:auto}
  @media(max-width:760px){header{flex-wrap:wrap}nav{order:3;width:100%}aside{padding:12px}.pin.world{font-size:.68rem;padding:.42rem}}
  @media(max-width:760px) and (min-height:541px){#map-panel{grid-template-columns:1fr}#viewport{min-height:clamp(290px,51vh,490px)}}
  @media(prefers-reduced-motion:reduce){.pin.node,#campaign-panel:not([hidden]) .campaign-hero,.campaign-region li[aria-current=step]::before{animation:none}}
 </style>`;
 function mount(options){
  const host=document.createElement('article');host.id='stormwatch-command';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=css+`<main>
   <header><h1>Stormwatch</h1><nav aria-label="Stormwatch">
    <button data-tab="campaign">Campaign</button><button data-tab="map">World Map</button><button data-tab="squad">Squad</button>
    <button data-tab="inventory">Armory</button><button data-tab="citadel">Citadel</button><button data-tab="audio">Audio</button>
   </nav><div class="row"><span id="power" class="power"></span><button id="exit">Mode Select</button></div></header>
   <section id="campaign-panel" class="panel" hidden><div class="stack">
    <article class="card campaign-hero">
     <canvas id="campaign-scene" width="1120" height="425" aria-hidden="true"></canvas>
     <div class="chapter-copy"><span id="chapter-region" class="eyebrow"></span><h2 id="chapter-title">The Northern Line</h2><p id="chapter-brief"></p></div>
     <div class="campaign-pay"><b class="eyebrow" id="chapter-payout-label">Chapter reward</b><p id="chapter-payout" class="small"></p>
      <progress id="campaign-progress" aria-label="Campaign progress"></progress><small id="campaign-count" class="small"></small>
     </div>
     <div class="campaign-actions"><button id="chapter-mission" class="primary">Find operation on map</button><button id="chapter-claim" class="primary" hidden>Claim chapter reward</button><button id="to-quests">Daily quests</button><button id="to-llamas">Supply llamas</button><button id="to-command">Commander training</button><button id="to-research">Citadel research</button></div>
    </article>
    <div id="campaign-route" class="campaign-route"></div><p id="chapter-status" class="small campaign-foot" role="status"></p>
   </div></section>
   <section id="map-panel" class="panel" aria-label="World Map">
    <div id="viewport" tabindex="0" aria-label="Operation map. Use the arrow keys to pan a region.">
     <canvas aria-hidden="true"></canvas><div id="pins"></div>
     <div class="map-tag eyebrow" id="map-name"></div>
     <div class="map-tools" id="tools" hidden>
      <button id="world">World Map</button><button data-pan="-1,0" aria-label="Pan left">←</button>
      <button data-pan="0,-1" aria-label="Pan up">↑</button><button data-pan="0,1" aria-label="Pan down">↓</button>
      <button data-pan="1,0" aria-label="Pan right">→</button>
     </div>
    </div>
    <aside><span class="eyebrow" id="region-name"></span><h2 id="title"></h2><p class="small" id="summary"></p>
     <div id="operation-pay" class="small" hidden><b class="eyebrow">Victory payout</b><p id="pay-detail"></p></div>
     <div id="ops" hidden></div><label class="alert small" id="alert-label" hidden><input id="alert" type="checkbox"><span id="alert-copy"></span></label>
     <div class="actions" id="deploy-actions" hidden>
      <button id="queue" class="primary">Find Squad</button><button id="solo">Deploy Solo</button>
     </div>
     <p id="map-status" role="status" class="small"></p>
    </aside>
   </section>
   <section id="squad-panel" class="panel" hidden><div class="stack">
    <div class="card"><h2>Squad</h2><p id="status" role="status" class="small"></p>
     <button id="local-split" type="button" hidden>Play local split screen</button><p id="local-help" class="small" hidden></p>
     <div class="row" id="room" hidden><strong id="code"></strong><button id="copy">Copy Code</button><button id="room-lock" hidden></button><button id="leave">Leave Squad</button></div>
     <ul id="members"></ul>
     <form class="row" id="join-form"><button id="create" type="button">Create Private Squad</button><input type="text" id="join-code" maxlength="14" aria-label="Squad code" placeholder="XXXX-XXXX-XXXX" autocomplete="off"><button>Join</button></form>
     <div id="invite-keys" aria-label="Squad code keypad" hidden></div>
    </div>
   </div></section>
   <section id="inventory-panel" class="panel" hidden><div class="stack">
    <div class="card" id="pattern-card" hidden><h2>Recovered Patterns</h2><p id="pattern-status" class="small" role="status"></p><div class="cards" id="patterns"></div></div>
    <div class="card"><h2>Stored Salvage</h2><p class="small" id="inventory-status" role="status"></p><div class="cards" id="resources"></div></div>
    <div class="card"><h2>Deployment Loadout</h2><div class="row" id="loadout"></div></div>
    <div class="card"><h2>Blueprints</h2><div class="cards" id="schematics"></div></div>
   </div></section>
   <section id="citadel-panel" class="panel" hidden><div id="citadel-root"><p id="citadel-loading" class="small">Loading Citadel…</p></div></section>
   <section id="audio-panel" class="panel" hidden><div class="stack"><div class="card"><h2>Audio</h2>
    ${PlayerAudio.controls(true)}
   </div></div></section>
  </main>`;
  document.body.append(host);
  const $=id=>root.getElementById(id),cv=$('viewport').querySelector('canvas'),ctx=cv.getContext('2d');
  const unbindAudio=PlayerAudio.bind($('audio-panel'));
  $('exit').textContent=options.local?'Exit split screen':'Mode Select';
  $('local-split').hidden=$('local-help').hidden=!options.split;
  const tabs=[...root.querySelectorAll('[data-tab]')].map(button=>button.dataset.tab);
  const controller=new AbortController(),{signal}=controller;
  const listen=(target,name,fn)=>target.addEventListener(name,fn,{signal});
  let padFocus=null;
  listen(root,'focusin',event=>{
   padFocus?.removeAttribute('data-pad-focus');padFocus=event.target;
   if(options.local)padFocus.setAttribute('data-pad-focus','');
  });
  const ops=StormwatchOperations.missions;
  let account=null,loadError=false,unmountCitadel=null,worldView=true,region='timbervale',mission='defense',tab='campaign',squadState=null;
  let selection=null,animation=0,drag=null,cam={x:480,y:330},aim={...cam},zoom=1,hidden=false,saving=false;
  let citadelView={},claiming=false,licensing=false,paintedSector='',commandAudio=null;
  const model=StormwatchCitadel;
  const profile=()=>account?.snapshot()||model.blank();
  const level=()=>model.rating(profile()).power;
  const alert=()=>StormwatchOperations.board(profile(),Date.now());
  const spec=()=>({region,mission,relaySite:account?.snapshot().relaySites?.[region],alert:$('alert').checked});
  const squad=options.connectSquad?options.connectSquad(updateSquad):StormwatchSquad.open(options.name||'Operator',updateSquad);
  const unsubscribe=squad.subscribe(d=>{
   if(d.type==='launch')start({...d.spec,squad,round:d.round});
  });
  function updateSquad(value){
   squadState=value;
   $('status').textContent=value.message;
   $('map-status').textContent=value.room?value.message:'';
   $('room').hidden=!!options.local||!value.room;
   $('copy').hidden=$('code').hidden=value.publicRoom;
   $('code').textContent=value.room.toUpperCase();
   $('room-lock').hidden=!value.isHost||value.publicRoom;
   $('room-lock').textContent=value.locked?'Unlock room':'Lock room';
   $('room-lock').setAttribute('aria-pressed',String(value.locked));
   $('leave').textContent=options.connectSquad?'Leave Party':'Leave Squad';
   $('join-form').hidden=!!value.room;
   $('members').replaceChildren(...value.members.map(m=>{
    const li=document.createElement('li');li.textContent=m.name+(m.host?' (Host)':'');
    if(!options.local&&value.isHost&&!m.host){
     const button=document.createElement('button');
     button.type='button';button.textContent='Remove';button.setAttribute('aria-label','Remove '+m.name);
     button.onclick=()=>squad.remove(m.id);li.append(' ',button);
    }
    return li;
   }));
   showInfo();
  }
  function allow(id=region){
   return level()>=world[id].floor||StormwatchOperations.campaignProgress(profile()).unlocked.includes(id);
  }
  function select(id){
   const refresh=mission!==id;
   mission=id;selection=points.find(p=>p.id===id);
   if(refresh)$('alert').checked=false;
   setPins();showInfo();
  }
  function setRegion(id){
   region=id;worldView=false;cam={x:480,y:330};aim={...cam};
   $('alert').checked=false;makeRegion();select('defense');queueFrame();
  }
  function showWorld(){
   worldView=true;$('map-name').textContent='World Map';setPins();showInfo();queueFrame();
  }
  function showInfo(){
   const entry=world[region],current=ops[mission],{alert:daily,orders}=alert();
   $('power').textContent='Commander '+model.commander(profile()).level+' · Power '+level();
   $('tools').hidden=worldView;$('ops').hidden=worldView;
   $('region-name').textContent=worldView?'Operations command':entry.name+' · Power '+entry.floor+'–'+entry.ceiling;
   $('title').textContent=worldView?'Choose a region':current.name;
   $('summary').textContent=worldView?'Select a pin to inspect its region and find a mission.':current.brief+(allow()?'':' Unlock through the campaign or reach Power '+entry.floor+'.');
   $('operation-pay').hidden=worldView;
   if(!worldView)$('pay-detail').textContent=model.payoutText(mission,region);
   $('alert-label').hidden=worldView||daily.mission!==mission;
   if(daily.mission!==mission)$('alert').checked=false;
   $('alert-copy').textContent=daily.name+(orders.alertClaimed?' · Reward collected':' · Bonus salvage');
   $('deploy-actions').hidden=worldView;
   const room=squadState?.room,hostReady=squadState?.connected&&squadState?.isHost;
   $('queue').textContent=options.local?(hostReady?'Deploy both players':'Waiting for Player 1'):
    room?(options.connectSquad?'Deploy Party':'Deploy Squad'):'Find Squad';
   $('queue').disabled=mission==='defense'&&!account||!allow()||!!room&&(!hostReady||squadState.starting||squadState.publicRoom);
   $('solo').hidden=!!room;$('solo').disabled=mission==='defense'&&!account||!allow();
   if(!worldView)$('map-name').textContent=entry.site+' / Sector Map';
   for(const b of $('ops').children)b.setAttribute('aria-current',String(b.dataset.id===mission));
  }
  function start(values){
   if(hidden){if(!values.squad||values.squad.host)return;options.clearMission?.()}
   hidden=true;host.hidden=true;cancelAnimationFrame(animation);animation=0;
   options.deploy(values,()=>{
    hidden=false;host.hidden=false;if(values.squad)squad.returns();
    const next=StormwatchOperations.campaignProgress(profile()).active;
    const campaignMission=next&&next.region===values.region&&next.mission===values.mission;
    if(account)account.refresh().then(()=>{showInfo();if(tab==='inventory')inventory();if(tab==='campaign')renderCampaign()}).catch(()=>{});
    setTab(campaignMission?'campaign':'map');queueFrame();
   });
  }
  function setTab(next,view={}){
   if(tab==='citadel'&&next!=='citadel'){unmountCitadel?.();unmountCitadel=null}
   tab=next;
   for(const b of root.querySelectorAll('[data-tab]'))b.setAttribute('aria-current',String(b.dataset.tab===tab));
   for(const id of tabs)$(id+'-panel').hidden=id!==tab;
   if(tab==='map')queueFrame();
   if(tab==='campaign')renderCampaign();
   if(tab==='inventory')inventory();
   if(tab==='citadel'){citadelView=view;mountCitadel()}
  }
  let citadelMounting=false;
  async function mountCitadel(){
   if(unmountCitadel||!account||citadelMounting)return;
   citadelMounting=true;
   try{
    const attach=await account.prepareUI();
    if(signal.aborted||tab!=='citadel')return;
    $('citadel-loading').hidden=true;
    const socket=document.createElement('div');$('citadel-root').append(socket);
    const unmount=attach(socket,citadelView);
    unmountCitadel=()=>{unmount();socket.remove();showInfo()};
   }catch{if(!signal.aborted){$('citadel-loading').hidden=false;$('citadel-loading').textContent='Citadel management could not load.'}}
   finally{citadelMounting=false}
  }
  function tile(title,detail){
   const card=document.createElement('div'),name=document.createElement('span'),value=document.createElement('b');
   card.className='card resource';name.textContent=title;value.textContent=detail;card.append(name,value);return card;
  }
  function campaignScene(id){
   if(id===paintedSector)return;
   paintedSector=id;
   const canvas=$('campaign-scene'),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
   const sector=world[id],rand=randomFrom(28+Object.keys(world).indexOf(id)*1471);
   const sky=c.createLinearGradient(0,0,0,h);
   sky.addColorStop(0,'#11182c');sky.addColorStop(.6,'#3d4562');sky.addColorStop(1,'#17262c');
   c.fillStyle=sky;c.fillRect(0,0,w,h);
   const glow=c.createRadialGradient(858,155,18,858,155,260);
   glow.addColorStop(0,'#b389e774');glow.addColorStop(.5,'#607f9570');glow.addColorStop(1,'#627aa800');
   c.fillStyle=glow;c.fillRect(0,0,w,h);
   c.lineWidth=1;
   for(let i=0;i<17;i++){
    c.strokeStyle=i%4?'#bac2e72c':'#d9deb762';c.beginPath();
    c.ellipse(853,134,90+i*19,20+i*7,-.14,3.1,6.45);c.stroke();
   }
   const ridge=(top,amplitude,fill)=>{
    c.beginPath();c.moveTo(0,h);
    for(let x=0;x<=w+24;x+=22){
     const offset=Math.sin(x*.009+top)*.34+Math.sin(x*.026-top)*.17+rand()*.49;
     c.lineTo(x,top-offset*amplitude);
    }
    c.lineTo(w,h);c.closePath();c.fillStyle=fill;c.fill();
   };
   ridge(310,158,'#47566a');ridge(358,133,'#344554');ridge(402,118,'#233842');
   const sweep=(points,color,width)=>{
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.strokeStyle=color;c.lineWidth=width;c.stroke();
   };
   for(let i=0;i<3;i++){
    const start=960+i*33,points=[[start,-6],[start-31,44],[start-7,45],[start-62,119],[start-47,122],[start-92,186]];
    sweep(points,'#bd94f64a',6);sweep(points,'#dec8f0ad',1.5);
   }
   const silhouette=(points,fill)=>{
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();
   };
   silhouette([[673,425],[714,355],[765,342],[796,307],[854,305],[908,332],[955,328],[1009,371],[1120,393],[1120,425]],'#111e29');
   for(let i=0;i<25;i++){
    const x=652+rand()*461,y=354+rand()*53,size=8+rand()*28;
    const slope=id==='obsidian'?size*.46:size*.31;
    silhouette([[x-slope,y],[x,y-size],[x+slope,y],[x+2,y+3],[x+2,y+8],[x-2,y+8],[x-2,y+2]],i%3?'#172832':'#273e45');
   }
   silhouette([[783,329],[812,259],[859,252],[899,278],[925,342],[876,356]],'#172330');
   silhouette([[800,275],[853,245],[890,276],[845,296]],'#4b535d');
   silhouette([[810,279],[844,289],[844,338],[795,326]],'#253543');
   silhouette([[844,288],[891,276],[912,330],[845,346]],'#202c38');
   for(let i=0;i<4;i++){
    c.fillStyle=i%2?sector.high:'#ffbf7e';
    c.fillRect(857+i*9,301-i*3,5,6);c.fillRect(808+i*7,301+i*2,4,5);
   }
   sweep([[821,268],[835,137],[858,259],[821,268]],'#8a98a0',3);
   sweep([[826,237],[849,216],[829,199],[841,181],[832,164]],'#829195',2);
   sweep([[794,198],[871,198],[835,161],[794,198]],'#819198',3);
   c.shadowColor=sector.high;c.shadowBlur=30;c.fillStyle='#feddad';
   c.beginPath();c.arc(835,137,4.5,0,Math.PI*2);c.fill();
   c.shadowBlur=0;c.strokeStyle=sector.high+'90';c.lineWidth=1;
   for(const r of [20,31,48]){c.beginPath();c.arc(835,137,r,0,Math.PI*2);c.stroke()}
   for(let i=0;i<55;i++){
    const x=610+rand()*506,y=13+rand()*337;
    c.fillStyle=i%3?sector.high+'55':'#fff1b090';c.fillRect(x,y,i%4?1:2,1);
   }
  }
  function renderCampaign(){
   const {active,chapters,claimed,wins,unlocked}=StormwatchOperations.campaignProgress(profile());
   const count=chapters.filter(chapter=>claimed[chapter.key]).length;
   const finished=!active,cleared=!!active&&!!wins[active.key];
   const sector=active?.region||'obsidian';
   campaignScene(sector);
   $('campaign-scene').parentElement.style.setProperty('--chapter-signal',world[sector].high);
   $('chapter-region').textContent=active?'The Northern Line · '+world[active.region].name:'The Northern Line';
   $('chapter-title').textContent=active?.title||'The network is online';
   $('chapter-brief').textContent=active?active.brief:'All four regions are connected. Replay operations, raise your Citadel research, or take on daily alerts.';
   $('chapter-payout-label').textContent=finished?'Campaign progress':'Chapter reward';
   $('chapter-payout').hidden=finished;
   $('chapter-payout').textContent=active?[...Object.entries(active.reward).map(([id,n])=>n+' '+model.components[id]),active.marks+' Field Mark'+(active.marks===1?'':'s')].join(' · '):'';
   $('campaign-progress').max=chapters.length;$('campaign-progress').value=count;
   $('campaign-count').textContent=count+' / '+chapters.length+' chapters completed';
   $('chapter-claim').hidden=!cleared;$('chapter-claim').disabled=claiming||!account;
   $('chapter-mission').hidden=finished||cleared;
   $('chapter-mission').disabled=!active||!allow(active.region);
   $('to-research').textContent='Citadel research · '+(profile().marks||0)+' Marks';
   $('campaign-route').replaceChildren(...Object.entries(world).map(([id,sector])=>{
    const panel=document.createElement('article'),title=document.createElement('h3'),access=document.createElement('small'),list=document.createElement('ul');
    panel.className='card campaign-region';panel.style.setProperty('--sector',sector.high);
    title.textContent=sector.name;
    access.textContent=unlocked.includes(id)?'Campaign clearance':allow(id)?'Open by Power':'Campaign locked';
    for(const chapter of chapters.filter(entry=>entry.region===id)){
     const row=document.createElement('li'),label=document.createElement('strong'),missionName=document.createElement('small');
     label.textContent=chapter.title;
     missionName.textContent=ops[chapter.mission].name+(claimed[chapter.key]?' · Claimed':wins[chapter.key]?' · Victory recorded':'');
     if(active?.key===chapter.key)row.setAttribute('aria-current','step');
     if(wins[chapter.key])row.dataset.won='';
     row.append(label,missionName);list.append(row);
    }
    panel.append(title,access,list);return panel;
   }));
  }
  $('chapter-mission').onclick=()=>{
   const chapter=StormwatchOperations.campaignProgress(profile()).active;
   if(!chapter||!allow(chapter.region))return;
   setRegion(chapter.region);select(chapter.mission);
   aim.x=selection.x;aim.y=selection.y;setTab('map');
   const deploy=$('solo').hidden?$('queue'):$('solo');
   if(deploy.disabled)$('ops').querySelector('[aria-current=true]')?.focus();else deploy.focus();
  };
  $('chapter-claim').onclick=async()=>{
   const {active,unlocked}=StormwatchOperations.campaignProgress(profile());
   if(!account||!active||claiming)return;
   claiming=true;$('chapter-claim').disabled=true;
   try{
    if(!commandAudio&&window.AudioContext)commandAudio=new AudioContext();
    commandAudio?.resume().catch(()=>{});
   }catch{}
   const saved=await account.dispatch({type:'claim-chapter',id:active.key});
   claiming=false;if(signal.aborted)return;
   const opened=StormwatchOperations.campaignProgress(profile()).unlocked.find(id=>!unlocked.includes(id));
   $('chapter-status').textContent=saved?(opened?'Clearance granted for '+world[opened].name+'.':'Chapter reward added to the Citadel.'):'The chapter reward could not be claimed.';
   renderCampaign();showInfo();
   if(saved){
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('campaign-scene').animate?.([{filter:'brightness(1.65)'},{filter:'brightness(1)'}],{duration:520});
    if(commandAudio?.state==='running')for(const [i,pitch] of [392,523,659].entries()){
     const note=commandAudio.createOscillator(),gain=commandAudio.createGain(),start=commandAudio.currentTime+i*.072;
     note.type='triangle';note.frequency.value=pitch;gain.gain.value=.001;
     gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(.052,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.27);
     note.connect(gain).connect(PlayerAudio.output(commandAudio,'effects',true));note.start(start);note.stop(start+.28);
    }
   }
   if(tab==='campaign')($('chapter-claim').hidden?$('chapter-mission').hidden?$('to-research'):$('chapter-mission'):$('chapter-claim')).focus();
  };
  $('to-quests').onclick=()=>setTab('citadel',{panel:'Operations'});
  $('to-llamas').onclick=()=>setTab('citadel',{panel:'Supply Llamas'});
  $('to-command').onclick=()=>setTab('citadel',{panel:'Command'});
  $('to-research').onclick=()=>setTab('citadel',{panel:'Research'});
  function inventory(){
   const save=profile();
   $('inventory-status').textContent=loadError?'Browser storage is unavailable.':account?'Salvage and blueprints carry over between operations.':'Loading saved inventory…';
   $('resources').replaceChildren(...Object.entries(model.components).map(([id,name])=>tile(name,String(save.inventory[id]||0))));
   const patterns=Object.entries(save.patterns||{});
   $('pattern-card').hidden=!patterns.length;
   $('pattern-status').textContent=(save.marks||0)+' Field Marks available · Unlock a blueprint for 1 Field Mark.';
   $('patterns').replaceChildren(...patterns.map(([id,name])=>{
    const card=tile(name,'Unlicensed'),button=document.createElement('button');
    button.textContent='Unlock blueprint';button.disabled=!account||licensing||!(save.marks>0);
    button.onclick=async()=>{
     licensing=true;
     for(const action of $('patterns').querySelectorAll('button'))action.disabled=true;
     const saved=await account.dispatch({type:'license-pattern',id});
     licensing=false;if(signal.aborted)return;
     inventory();if(!saved)$('pattern-status').textContent='Could not unlock the blueprint.';
     else if(tab==='inventory')$('schematics').querySelector('[data-plan="'+id+'"]')?.focus();
    };
    card.append(button);return card;
   }));
   $('schematics').replaceChildren(...Object.entries(save.blueprints).map(([id,b])=>{
    const card=tile(b.name,'Lv. '+b.level),button=document.createElement('button');
    button.dataset.plan=id;button.textContent='Upgrade';button.disabled=!account;
    button.setAttribute('aria-label','Upgrade '+b.name);
    button.onclick=()=>setTab('citadel',{panel:'Blueprints',item:id});card.append(button);
    return card;
   }));
   const weapons=Object.entries(save.blueprints).filter(([id,b])=>b.kind==='weapon'&&options.canEquip?.(id));
   $('loadout').replaceChildren(...[0,1].map(slot=>{
    const wrap=document.createElement('label'),select=document.createElement('select');
    wrap.className='slot';wrap.textContent=slot?'Secondary':'Primary';
    select.add(new Option('Spartan Drill loadout',''));
    for(const [id,b] of weapons)select.add(new Option(b.name,id));
    select.value=save.fieldLoadout?.[slot]||'';select.disabled=!account||saving||!weapons.length;
    select.onchange=async()=>{
     saving=true;const result=await account.dispatch({type:'field-loadout',slot,id:select.value});
     saving=false;if(signal.aborted)return;
     inventory();if(!result)$('inventory-status').textContent='Loadout could not be saved.';
    };
    wrap.append(select);return wrap;
   }));
  }
  for(const [id,op] of Object.entries(ops)){
   const b=document.createElement('button');b.textContent=op.name;b.dataset.id=id;b.onclick=()=>{
    select(id);aim.x=selection.x;aim.y=selection.y;queueFrame();
   };$('ops').append(b);
  }
  root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
  $('world').onclick=showWorld;$('exit').onclick=options.exit;
  $('solo').onclick=()=>{if(allow())start(spec())};
  $('queue').onclick=()=>{
   if(!allow())return;
   if(squad.room){squad.launch(spec());return}
   if(worldView)return;
   squad.quick(spec());setTab('squad');
  };
  $('create').onclick=()=>squad.create();
  $('leave').onclick=()=>squad.leave();
  $('room-lock').onclick=()=>squad.toggleLock();
  $('copy').onclick=async()=>{
   try{await navigator.clipboard.writeText(squad.room.toUpperCase());$('status').textContent='Squad code copied.'}
   catch{$('status').textContent='Share code '+squad.room.toUpperCase()}
  };
  $('join-form').onsubmit=e=>{e.preventDefault();squad.join($('join-code').value)};
  $('local-split').onclick=()=>options.split?.();
  function splitStatus(){
   if(!options.split)return;
   const ready=pads().length>=2;
   $('local-split').disabled=!ready||!!squadState?.room;
   $('local-help').textContent=ready?'Two controllers ready.':'Connect two controllers and press a button on each.';
  }
  const keyPanel=$('invite-keys'),codeInput=$('join-code');
  function closeKeypad(){
   keyPanel.hidden=true;codeInput.focus();
  }
  function showKeypad(){
   keyPanel.hidden=false;keyPanel.firstElementChild.focus();
  }
  for(const char of [...inviteAlphabet,'Delete','Done']){
   const button=document.createElement('button');button.type='button';button.textContent=char;
   button.onclick=()=>{
    if(char==='Done'){closeKeypad();$('join-form').querySelector('button:last-child').focus();return}
    const plain=codeInput.value.replace(/[\s-]/g,'').toUpperCase();
    codeInput.value=(char==='Delete'?plain.slice(0,-1):(plain+char).slice(0,inviteLength)).match(/.{1,4}/g)?.join('-')||'';
   };
   keyPanel.append(button);
  }
  model.open().then(saved=>{
   if(signal.aborted){saved.close();return}
   account=saved;showInfo();if(tab==='inventory')inventory();if(tab==='citadel')mountCitadel();if(tab==='campaign')renderCampaign();
  }).catch(()=>{
   if(signal.aborted)return;
   loadError=true;$('citadel-loading').textContent='Citadel storage is unavailable.';
   $('chapter-status').textContent='Browser storage is unavailable. Campaign progress cannot be saved.';if(tab==='inventory')inventory();
  });
  const chart=document.createElement('canvas'),paint=chart.getContext('2d');
  chart.width=960;chart.height=660;
  const land=[[74,306],[128,242],[105,201],[158,156],[279,160],[316,108],[380,109],[418,62],[522,120],[560,106],[637,132],[699,67],[788,107],[853,177],[819,225],[878,279],[815,344],[846,385],[763,415],[773,490],[686,540],[643,581],[542,564],[483,531],[407,548],[374,508],[319,505],[274,438],[198,441],[157,404],[93,398],[115,351]];
  function trace(c,coords,close=false){
   c.beginPath();coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();
  }
  function randomFrom(seed){
   return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  }
  function grid(c,width,height,gap,color){
   c.beginPath();c.strokeStyle=color;c.lineWidth=1;
   for(let x=0;x<width;x+=gap){c.moveTo(x+.5,0);c.lineTo(x+.5,height)}
   for(let y=0;y<height;y+=gap){c.moveTo(0,y+.5);c.lineTo(width,y+.5)}
   c.stroke();
  }
  function ridge(c,x,y,s,color){
   c.fillStyle='#15232c52';trace(c,[[x+s*.15,y-s*.64],[x-s*.65,y+s*.45],[x+s*.78,y+s*.51]],true);c.fill();
   c.fillStyle=color;trace(c,[[x-s*.08,y-s*.76],[x-s*.73,y+s*.34],[x+s*.5,y+s*.39]],true);c.fill();
   c.fillStyle='#24374066';trace(c,[[x-s*.08,y-s*.76],[x-s*.02,y+s*.36],[x+s*.5,y+s*.39]],true);c.fill();
  }
  function worldChart(){
   const c=paint,r=randomFrom(24);
   c.fillStyle='#335763';c.fillRect(0,0,960,660);grid(c,960,660,40,'#b6d9db22');
   trace(c,land,true);c.strokeStyle='#829d9f';c.lineWidth=12;c.stroke();
   c.fillStyle='#7c9479';c.fill();c.save();c.clip();
   const wash=c.createLinearGradient(150,100,800,530);
   wash.addColorStop(0,'#83a476');wash.addColorStop(.35,'#9cb09a');wash.addColorStop(.66,'#7c8e83');wash.addColorStop(1,'#be8a61');
   c.fillStyle=wash;c.fillRect(0,0,960,660);
   for(let i=0;i<38;i++){
    const x=r()*960,y=r()*660,s=25+r()*105;
    c.strokeStyle=i%2?'#cbd1ad60':'#263f3b4c';c.lineWidth=1.25;
    for(let k=1;k<=3;k++){c.beginPath();c.ellipse(x,y,s*k*.32,s*k*.16,.35,0,Math.PI*2);c.stroke()}
   }
   for(let i=0;i<66;i++){const x=r()*960,y=r()*660;ridge(c,x,y,8+r()*29,y<270?'#d2dbcb':'#a8aa78')}
   c.strokeStyle='#4d7880';c.lineWidth=15;c.beginPath();c.moveTo(722,137);c.bezierCurveTo(633,280,412,180,398,319);c.bezierCurveTo(390,390,491,472,523,562);c.stroke();
   c.strokeStyle='#e0c5939e';c.lineWidth=3;c.setLineDash([7,7]);trace(c,[[285,311],[396,256],[510,191],[730,180],[719,337],[640,467]]);c.stroke();c.setLineDash([]);
   c.restore();
   c.font='700 15px system-ui';c.letterSpacing='3px';c.fillStyle='#c6e2df';c.fillText('WESTERN SEA',103,505);c.fillText('N',887,100);
   trace(c,[[893,108],[893,141]]);c.lineWidth=1;c.strokeStyle='#c6e2df';c.stroke();
  }
  function building(c,x,y,w,h,kind){
   c.fillStyle='#15252a52';c.fillRect(x+6,y+7,w,h);
   c.fillStyle=kind?'#373f48':'#684f42';c.fillRect(x,y,w,h);
   c.fillStyle=kind?'#aebbc0':'#d9a78a';c.fillRect(x+2,y+2,w-4,h*.48);
   c.fillStyle=kind?'#657681':'#9a6c57';c.fillRect(x+2,y+h*.5,w-4,h*.5-2);
   c.fillStyle='#f3dba9';c.fillRect(x+w*.43,y+h-3,4,5);
  }
  function makeRegion(){
   const entry=world[region],c=paint,r=randomFrom(Object.keys(world).indexOf(region)*543+100);
   c.fillStyle=entry.color;c.fillRect(0,0,960,660);
   const bands=[];
   for(let i=0;i<31;i++)bands.push([r()*960,r()*660,37+r()*120]);
   for(const [x,y,s] of bands){
    for(let k=4;k>0;k--){
     c.fillStyle=k%2?'#f4f4d811':'#15243119';c.strokeStyle='#e3e9cf5c';c.lineWidth=1;
     c.beginPath();c.ellipse(x,y,s*k*.24,s*k*.14,.52,0,Math.PI*2);c.fill();c.stroke();
    }
   }
   c.lineJoin='round';c.lineCap='round';
   c.strokeStyle=entry.water;c.lineWidth=35;c.beginPath();c.moveTo(-40,514);c.bezierCurveTo(231,565,248,134,528,112);c.bezierCurveTo(653,81,751,189,985,117);c.stroke();
   c.strokeStyle='#b5d0bd70';c.lineWidth=1.5;c.stroke();
   const road=[[45,370],[153,366],[212,320],[355,292],[446,214],[491,197],[642,240],[747,358],[672,435],[560,517],[406,584],[281,622]];
   trace(c,road);c.strokeStyle='#353c36a6';c.lineWidth=21;c.stroke();
   c.strokeStyle='#d0b894b5';c.lineWidth=14;c.stroke();
   c.strokeStyle='#f8e6bf96';c.lineWidth=1.5;c.setLineDash([9,9]);c.stroke();c.setLineDash([]);
   for(let i=0;i<205;i++){
    const x=r()*960,y=r()*660;
    if(road.some(([a,b])=>Math.hypot(a-x,b-y)<48)||points.some(p=>Math.hypot(p.x-x,p.y-y)<65))continue;
    if(region==='timbervale'||region==='ironridge'){
     c.fillStyle='#253c31';c.beginPath();c.arc(x+2,y+3,3+r()*4,0,Math.PI*2);c.fill();
     c.fillStyle=i%3?'#3d684d':'#8fae6f';c.beginPath();c.arc(x,y,3+r()*5,0,Math.PI*2);c.fill();
    }else ridge(c,x,y,5+r()*15,entry.high);
   }
   for(const [index,p] of points.entries()){
    c.fillStyle='#17252c30';c.fillRect(p.x-49,p.y-25,98,66);
    c.strokeStyle=p.tint+'85';c.strokeRect(p.x-49,p.y-25,98,66);
    if(index===1){c.strokeStyle=p.tint;c.beginPath();c.arc(p.x,p.y+8,23,0,Math.PI*2);c.stroke()}
    for(let k=0;k<5;k++)building(c,p.x+(k%3-1)*29-8,p.y+(k<3?19:-15),12+r()*10,11+r()*9,index!==0);
   }
   grid(c,960,660,48,'#eef4dd39');
  }
  const pins=new Map();
  function setPins(){
   $('pins').replaceChildren();pins.clear();
   const list=worldView?Object.entries(world).map(([id,i])=>({id,...i})):points;
   for(const item of list){
    const button=document.createElement('button');button.className='pin '+(worldView?'world':'node');
    button.style.setProperty('--signal',worldView?item.high:item.tint);
    button.setAttribute('aria-pressed',String(worldView?item.id===region:item.id===mission));
    if(worldView){
     const icon=document.createElement('span');icon.textContent='◆';button.append(icon,item.name);
     button.title=item.terrain+' · Power '+item.floor+'–'+item.ceiling;
     button.onclick=()=>{setRegion(item.id);pins.get('defense')?.focus({preventScroll:true})};
    }else{
     button.textContent=item.icon;button.title=ops[item.id].name;button.setAttribute('aria-label',button.title);
     button.onclick=()=>{select(item.id);pins.get(item.id)?.focus({preventScroll:true})};
    }
    pins.set(item.id,button);$('pins').append(button);
   }
   queueFrame();
  }
  function queueFrame(){if(!animation&&!hidden&&tab==='map')animation=requestAnimationFrame(draw)}
  function draw(){
   animation=0;
   const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
   const ratio=Math.min(devicePixelRatio||1,2),width=Math.round(w*ratio),height=Math.round(h*ratio);
   if(cv.width!==width||cv.height!==height){cv.width=width;cv.height=height}
   ctx.setTransform(ratio,0,0,ratio,0,0);
   const s=Math.min(w/960,h/660);
   zoom=worldView?s:Math.max(w/960,h/660)*1.36;
   const dx=aim.x-cam.x,dy=aim.y-cam.y;
   cam.x+=Math.abs(dx)<.3?dx:dx*.18;cam.y+=Math.abs(dy)<.3?dy:dy*.18;
   const tx=worldView?(w-960*zoom)/2:w/2-cam.x*zoom;
   const ty=worldView?(h-660*zoom)/2:h/2-cam.y*zoom;
   ctx.fillStyle=worldView?'#335763':world[region].color;ctx.fillRect(0,0,w,h);
   ctx.drawImage(worldView?atlas:chart,tx,ty,960*zoom,660*zoom);
   for(const [id,b] of pins){
    const p=worldView?world[id].pin.map((n,i)=>n*.01*(i===0?960:660)):(()=>{const entry=points.find(p=>p.id===id);return [entry.x,entry.y-19]})();
    b.style.left=tx+p[0]*zoom+'px';b.style.top=ty+p[1]*zoom+'px';
   }
   if(Math.abs(dx)+Math.abs(dy)>.5)queueFrame();
  }
  function pan(dx,dy){
   const keep=(n,min,max)=>Math.max(min,Math.min(n,max));
   aim.x=keep(aim.x+dx,147,819);aim.y=keep(aim.y+dy,127,556);queueFrame();
  }
  const view=$('viewport');
  for(const button of root.querySelectorAll('[data-pan]'))button.onclick=()=>pan(...button.dataset.pan.split(',').map(n=>Number(n)*80));
  listen(view,'keydown',e=>{
   if(worldView)return;
   const dir={ArrowLeft:[-65,0],ArrowRight:[65,0],ArrowUp:[0,-65],ArrowDown:[0,65],a:[-65,0],d:[65,0],w:[0,-65],s:[0,65]}[e.key];
   if(dir){e.preventDefault();pan(...dir)}
  });
  listen(view,'pointerdown',e=>{
   if(worldView||e.button!==0||e.composedPath().some(n=>n.tagName==='BUTTON'))return;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY};view.setPointerCapture(e.pointerId);view.classList.add('dragging');
  });
  listen(view,'pointermove',e=>{
   if(drag?.id!==e.pointerId)return;
   pan((drag.x-e.clientX)/zoom,(drag.y-e.clientY)/zoom);drag.x=e.clientX;drag.y=e.clientY;
  });
  listen(view,'lostpointercapture',()=>{drag=null;view.classList.remove('dragging')});
  listen(window,'resize',queueFrame);
  let previousPad=[],previousIndex=-1,stickDirection='';
  const padTimer=setInterval(()=>{
   if(hidden||document.hidden)return;
   if(tab==='squad')splitStatus();
   const pad=controllerPad();
   if(!pad){previousPad=[];previousIndex=-1;stickDirection='';return}
   const buttons=Array.from(pad.buttons,b=>b.pressed),edge=i=>pad.index===previousIndex&&buttons[i]&&!previousPad[i];
   const nintendo=/057e|nintendo|switch|joy-con|wii/i.test(pad.id);
   const [sx,sy]=pad.axes,stick=Math.max(Math.abs(sx),Math.abs(sy))>.58?
    Math.abs(sx)>Math.abs(sy)?sx>0?'right':'left':sy>0?'down':'up':'';
   const direction=edge(12)?'up':edge(13)?'down':edge(14)?'left':edge(15)?'right':stick!==stickDirection?stick:'';
   stickDirection=stick;
   const x=direction==='left'?-1:direction==='right'?1:0,y=direction==='up'?-1:direction==='down'?1:0;
   const control=root.activeElement||(options.local&&padFocus?.getClientRects().length&&!padFocus.disabled?padFocus:null);
   if(control?.matches('select,input[type=range]')&&x){
    if(control.matches('select')){
     const selected=Array.from(control.options).find((item,i)=>!item.disabled&&i===control.selectedIndex+x);
     if(selected){control.value=selected.value;control.dispatchEvent(new Event('change',{bubbles:true}))}
    }else{
     if(x<0)control.stepDown();else control.stepUp();
     control.dispatchEvent(new Event('input',{bubbles:true}));
    }
   }else if(direction){
    const focusable=[...(keyPanel.hidden?root:keyPanel).querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')]
     .filter(e=>e.getClientRects().length&&(!e.classList.contains('pin')||worldView||
      e.getBoundingClientRect().left>=view.getBoundingClientRect().left&&e.getBoundingClientRect().right<=view.getBoundingClientRect().right));
    const next=directionalControl(focusable,control,x,y);
    if(next){
     next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'nearest'});
    }
   }
   if(tab==='map'&&!worldView){
    const panX=pad.axes[2]||0,panY=pad.axes[3]||0;
    if(Math.abs(panX)>.28||Math.abs(panY)>.28)pan(panX*21,panY*21);
   }
   if(edge(nintendo?1:0)){
    if(control===codeInput)showKeypad();
    else if(control?.matches('button,input[type=checkbox]'))control.click();
    else if(!control)root.querySelector('[data-tab='+tab+']').focus();
   }
   if(edge(nintendo?0:1)){
    if(!keyPanel.hidden)closeKeypad();
    else if(!worldView&&tab==='map')showWorld();
   }
   if(keyPanel.hidden&&(edge(4)||edge(5))){
    const index=(tabs.indexOf(tab)+(edge(4)?-1:1)+tabs.length)%tabs.length;
    setTab(tabs[index]);root.querySelector('[data-tab='+tab+']').focus();
   }
   previousPad=buttons;previousIndex=pad.index;
  },50);
  worldChart();const atlas=document.createElement('canvas');atlas.width=960;atlas.height=660;atlas.getContext('2d').drawImage(chart,0,0);
  setTab('campaign');showWorld();squad.status();
  return {close(){
   controller.abort();clearInterval(padTimer);cancelAnimationFrame(animation);unsubscribe();unbindAudio();squad.close();unmountCitadel?.();account?.close();host.remove();
   if(commandAudio){PlayerAudio.release(commandAudio);commandAudio.close()}
  }};
 }
 return {mount,controllerPad,launchLocal,directionalControl};
})();
