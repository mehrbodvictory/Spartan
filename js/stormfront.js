/* Share Three.js across the frame so borrowed equipment and field meshes have unique renderer IDs. */
try{
 if(window.parent!==window&&window.parent.SpartanStormfront&&window.parent.THREE)window.THREE=window.parent.THREE;
}catch{}
;
/* Shared by the arena modes. */
var PlayerAudio=(()=>{
 const key='sd-audio-options',options={master:1,effects:1,ambience:1,captions:false};
 try{
  const master=localStorage.getItem('sdrill-vol');
  if(master!==null&&Number.isFinite(Number(master)))options.master=Math.max(0,Math.min(1,Number(master)));
  const saved=JSON.parse(localStorage.getItem(key))||{};
  for(const channel of ['effects','ambience']){
   if(Number.isFinite(saved[channel]))options[channel]=Math.max(0,Math.min(1,saved[channel]));
  }
  options.captions=saved.captions===true;
 }catch{}
 const contexts=new WeakMap(),levels=new Set(),listeners=new Set();
 function set(name,value){
  if(!Object.prototype.hasOwnProperty.call(options,name))return;
  const next=name==='captions'?value===true:Math.max(0,Math.min(1,Number(value)));
  if((name!=='captions'&&!Number.isFinite(next))||options[name]===next)return;
  options[name]=next;
  try{
   if(name==='master')localStorage.setItem('sdrill-vol',String(next));
   else localStorage.setItem(key,JSON.stringify({effects:options.effects,ambience:options.ambience,captions:options.captions}));
  }catch{}
  for(const item of levels){
   if(item.context.state==='closed'){levels.delete(item);continue}
   if(item.channel===name||name==='master'&&item.master){
    item.gain.gain.setTargetAtTime(options[item.channel]*(item.master?options.master:1),item.context.currentTime,.025);
   }
  }
  for(const callback of listeners)callback(name,next);
 }
 function output(context,channel='effects',master=false){
  let buses=contexts.get(context);
  if(!buses){buses=new Map();contexts.set(context,buses)}
  const id=channel+Number(master);
  if(buses.has(id))return buses.get(id);
  const gain=context.createGain();
  gain.gain.value=options[channel]*(master?options.master:1);
  gain.connect(context.destination);buses.set(id,gain);
  levels.add({context,gain,channel,master});
  return gain;
 }
 function release(context){
  for(const item of levels)if(item.context===context)levels.delete(item);
  contexts.delete(context);
 }
 function subscribe(callback){listeners.add(callback);return ()=>listeners.delete(callback)}
 function bind(root){
  const fields=[...root.querySelectorAll('[data-audio-option]')];
  for(const field of fields){
   const name=field.dataset.audioOption;
   const apply=()=>set(name,name==='captions'?field.checked:field.value);
   field.addEventListener('input',apply);
   field.addEventListener('change',apply);
  }
  const update=()=>{
   for(const field of fields){
    const name=field.dataset.audioOption,value=options[name];
    if(name==='captions')field.checked=value;
    else{
     field.value=value;
     const output=field.parentElement.querySelector('output');
     if(output)output.textContent=Math.round(value*100)+'%';
    }
   }
  };
  update();return subscribe(update);
 }
 function controls(master=false){
  const slider=(name,label)=>`<label class="audio-control"><span>${label}</span><input type="range" min="0" max="1" step="0.05" value="1" aria-label="${label}" data-audio-option="${name}"><output aria-hidden="true">100%</output></label>`;
  return (master?slider('master','Master volume'):'')+slider('effects','Sound effects')+slider('ambience','Ambience')+
   '<label class="audio-control audio-checkbox"><span>Sound captions</span><input type="checkbox" data-audio-option="captions"></label>';
 }
 function direction(angle){
  if(!Number.isFinite(angle))return '';
  const sector=((Math.round(angle/(Math.PI/4))%8)+8)%8;
  return ['Ahead','Ahead right','Right','Behind right','Behind','Behind left','Left','Ahead left'][sector];
 }
 function captions(container){
  const rows=new Map();
  function remove(id){
   const item=rows.get(id);if(!item)return;
   clearTimeout(item.timer);item.line.remove();rows.delete(id);
   container.hidden=!rows.size;
  }
  function clear(){for(const id of rows.keys())remove(id)}
  const unsubscribe=subscribe((name,value)=>{if(name==='captions'&&!value)clear()});
  function show(label,angle){
   if(!options.captions||!container.isConnected)return;
   const heading=direction(angle),id=label+'\n'+heading;
   let item=rows.get(id);
   if(!item){
    if(rows.size>=3)remove(rows.keys().next().value);
    const line=document.createElement('div'),text=document.createElement('b');
    text.textContent=label;line.append(text);
    if(heading){const dir=document.createElement('span');dir.textContent=heading;line.append(dir)}
    item={line,timer:0};rows.set(id,item);container.append(line);
   }
   container.hidden=false;
   clearTimeout(item.timer);item.timer=setTimeout(()=>remove(id),1850);
  }
  return {show,clear,close(){unsubscribe();clear()}};
 }
 return {set,output,release,subscribe,bind,controls,captions,get master(){return options.master},get captionsOn(){return options.captions}};
})();

;
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
  const download=new AbortController();
  const deadline=setTimeout(()=>download.abort(),5000);
  let source;
  try{
   const response=await fetch(url,{integrity,credentials:'omit',referrerPolicy:'no-referrer',signal:download.signal});
   if(!response.ok)throw Error('Could not load Stormwatch physics.');
   source=URL.createObjectURL(new Blob([await response.arrayBuffer()],{type:'text/javascript'}));
   const {default:rapier}=await import(source);
   await rapier.init();
   return rapier;
  }finally{
   clearTimeout(deadline);
   if(source)URL.revokeObjectURL(source);
  }
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
  seal:{name:'Seal the Breach',brief:'Recover three RiftGel, fortify the Rift Anchor, and activate it to begin a four-minute siege.'},
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
 const allowedIds=['AR','SMG','BR','SG','MG','MP','VA','BP','KTS','RD','HC','AN','OH','SW','LT','PD','MVR','TRB','TUR','VMP','CY','SN','RL','RG','CT',
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

;
'use strict';
var Stormwatch = (()=>{
const stormwatchMarkup = `<style>
:host {
 display:block;position:fixed;inset:0;z-index:1000;overflow:hidden;
 pointer-events:none;color:#f5f0e8;--ink:#f5f0e8;--soft:#c3b9ae;--accent:#f1be84;
 --panel:#1b1718d9;--line:#f5dab14d;
 --display:"Barlow Condensed","Arial Narrow",Impact,sans-serif;
 font:600 14px/1.4 Inter,system-ui,sans-serif;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
canvas{display:block}
button{font:750 .85rem system-ui;cursor:pointer;border:1px solid var(--line);border-radius:3px;padding:10px 15px;background:#282225;color:var(--ink)}
button:hover,button:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px}
button.primary{background:var(--accent);color:#2a1c17;border-color:var(--accent)}
h1,h2,p{margin:0}
kbd{font:750 .76rem system-ui;padding:.13em .4em;background:#40332c;border-radius:2px}
#hud{position:absolute;inset:0;pointer-events:none;user-select:none}
#field-sound-captions{position:absolute;left:50%;bottom:clamp(116px,21vh,172px);transform:translateX(-50%);display:grid;justify-items:center;gap:4px;width:max-content;max-width:64vw;text-align:center}
#field-sound-captions>div{padding:4px 10px;border:1px solid #ead8c676;background:#171416e8;color:#fff;font:650 13px/1.35 system-ui;border-radius:3px}
[data-pad-focus]{outline:2px solid var(--accent);outline-offset:2px}
#field-audio-settings{display:grid;gap:8px;margin-top:14px;max-width:360px}
#field-audio-settings label{display:grid;grid-template-columns:minmax(0,1fr) 5ch;gap:4px 8px;align-items:center;font:650 13px/1.35 system-ui}
#field-audio-settings label span{grid-column:1/-1}#field-audio-settings input{width:100%;accent-color:var(--accent)}
#field-audio-settings output{text-align:right;font-variant-numeric:tabular-nums}
#field-audio-settings .audio-checkbox span{grid-column:1}#field-audio-settings .audio-checkbox input{justify-self:end;width:18px;height:18px}
#field-audio-settings input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
#operation-rewards{margin-top:12px;padding:9px 12px;border-left:3px solid #9bdbc7;background:#203432;color:#d4f3e7;font:650 13px/1.5 system-ui}
#mission[data-assault=arming] #status{color:#ffe2b4;border-color:#fec78e;background:#613a31;animation:assault-signal .8s ease-in-out alternate infinite}
#mission[data-assault=active] #status{border-color:#db92d9;background:#47284f}
@keyframes assault-signal{to{box-shadow:0 0 18px #ffa36ca8}}
@media(prefers-reduced-motion:reduce){#mission[data-assault=arming] #status{animation:none}}
#vitals{position:absolute;top:22px;left:22px;width:clamp(128px,16vw,225px);display:grid;gap:5px}
.vital{position:relative;height:22px;border:1px solid #ffead295;border-left:3px solid var(--meter);background:#1a1719b9;overflow:hidden}
.vital label{position:absolute;inset:0;display:flex;gap:5px;align-items:center;padding:0 7px;font:800 14px/1 var(--display);text-shadow:0 1px 3px #0f0b0a}
.vital label i{font-style:normal;width:12px;text-align:center}
#shield{--meter:#55bde9}
#health{--meter:#95c96b}
#pulse-vital{--meter:#e9b367}
meter{display:block;width:100%;height:6px;-webkit-appearance:none;appearance:none;border:0;background:none}
meter::-webkit-meter-bar{background:#1b171900;border:0;border-radius:0;height:100%}
meter::-webkit-meter-optimum-value{background:linear-gradient(90deg,var(--meter,#edb877),color-mix(in srgb,var(--meter,#edb877) 45%,#2d2531));border-radius:0}
meter::-moz-meter-bar{background:var(--meter,#edb877)}
.vital meter{height:100%;opacity:.91}
#stash{display:flex;padding:6px 0 0;gap:4px;border-top:1px solid var(--line);margin-top:4px}
#stash span{width:33%;display:grid;justify-items:center;gap:1px;background:#271d1ca8;padding:4px 5px;font:750 17px/.9 var(--display);font-variant-numeric:tabular-nums}
#stash svg{width:25px;height:20px}
#objective{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:min(290px,36vw)}
.objective-line{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 10px;padding:5px 8px;background:#211b1bd2;border:1px solid var(--line)}
.objective-line b{font:750 14px/1 var(--display);text-transform:uppercase;letter-spacing:.075em}
.objective-line small{font:750 13px/1 var(--display);font-variant-numeric:tabular-nums}
.objective-line meter{grid-column:1/-1;background:#ffffff26}
#boss{margin-top:4px;--meter:#f19483}
#mission{position:absolute;top:22px;right:22px;width:clamp(117px,12vw,162px);text-align:right;display:grid;justify-items:stretch;gap:4px}
#radar{justify-self:end;width:min(100%,126px);height:auto;border:1px solid #ffdfb688;border-radius:50%;background:radial-gradient(circle,#362320c7,#171721d8);box-shadow:0 3px 14px #170f1455}
#status{margin-top:3px;background:#211b1bba;border-right:2px solid var(--accent);padding:3px 7px;font:750 17px/1.15 var(--display);text-transform:uppercase;letter-spacing:.06em}
#remaining,#task,#passStatus{font-size:11px;color:#fff3dd;text-shadow:0 1px 3px #1e1513}
#passStatus{color:var(--accent)}
#kit{position:absolute;right:22px;bottom:20px;display:grid;justify-items:end;gap:7px}
#held{font:750 15px/1 var(--display);text-transform:uppercase;letter-spacing:.04em;text-shadow:0 1px 4px #17101b}
#hotbar,#build-strip{display:flex;justify-content:flex-end;gap:4px}
#hotbar{padding-top:5px;border-top:1px solid #ffeece90}
.slot{--slot:#90806a;position:relative;display:grid;place-items:center;width:clamp(44px,5vw,70px);height:clamp(43px,4.7vw,63px);
 padding:4px 3px 10px;background:linear-gradient(153deg,#fff6d419,#1c161bab),var(--slot);border:1px solid #eedab1ae;box-shadow:inset 0 0 0 2px #0f0b1363}
.slot[data-empty="true"] svg{visibility:hidden}
.slot[data-empty="true"]{opacity:.54}
.slot[data-selected="true"],#build-strip .selected{outline:2px solid #fff2d5;outline-offset:1px}
.slot img,.slot svg{width:100%;height:100%;max-height:39px;object-fit:contain;filter:drop-shadow(1px 2px 2px #060503aa)}
.slot img{position:absolute;inset:3px;width:calc(100% - 6px)}.slot img:not([hidden])+svg{opacity:.22}
.slot kbd{position:absolute;bottom:1px;font-size:.58rem;padding:0 3px;background:#161216ad}
#build-strip .slot{background:#1b2a3fda;border-color:#92b2d697;height:44px}
#ammo{float:right;margin-left:10px;color:var(--accent)}
#prompt,#toast,#threat{position:absolute;left:50%;transform:translateX(-50%);width:max-content;max-width:84%;text-align:center}
#prompt{bottom:104px;padding:4px 9px;background:#211b1bcd;border-bottom:1px solid var(--accent);font-size:.77rem}
#toast{bottom:144px;font:750 17px/1.2 var(--display);letter-spacing:.04em;text-shadow:0 2px 4px #241416;color:#ffdbab}
#squad-status{color:#c8ffef;font-size:.73rem;text-shadow:0 2px 3px #081d24;overflow-wrap:anywhere}
#squad-status:empty{display:none}
#seat-label{justify-self:start;padding:1px 6px;border-left:2px solid #81e8ec;background:#172b35eb;color:#e2faff;font:750 11px/1.4 system-ui}
:host([data-local="2"]) #seat-label{border-color:#ffc385;background:#382a24eb;color:#ffe6cc}
#threat{left:22px;bottom:20px;transform:none;color:#ffdcad;text-shadow:0 2px 3px #251719;font-size:.72rem}
#cross{position:absolute;top:50%;left:50%;width:calc(19px + var(--bloom,0px));aspect-ratio:1;transform:translate(-50%,-50%);
 color:#fff8db;filter:drop-shadow(0 1px 2px #1d1826);border:1px solid currentColor;border-radius:50%;transition:width .07s ease-out}
#cross::after{content:"";position:absolute;inset:0;margin:auto;width:3px;height:3px;border-radius:50%;background:currentColor}
#cross[data-hit="yes"]{color:#ffbb7d}
#cross[data-build="yes"]{color:#9adbff}
#harvest{position:absolute;left:50%;top:calc(50% + 25px);transform:translateX(-50%);width:112px;text-align:center;
 background:#282027c9;color:#fff1d8;padding:3px 5px;border-left:2px solid #e2b568;font:750 13px/1.1 var(--display)}
#harvest meter{margin-top:4px;background:#463939;height:4px;--meter:#f0bc73}
#damage{position:absolute;inset:0;box-shadow:inset 0 0 95px 15px #f75654b0;opacity:0}
#screen{position:absolute;inset:0;pointer-events:auto;display:grid;align-items:center;padding:clamp(15px,6vw,93px);overflow:auto;background:linear-gradient(90deg,#1e1616f5,#1b1518c4 34%,transparent 77%)}
#sheet{width:min(515px,100%);padding:24px 0}
#screen:not([data-mode="brief"]){justify-items:center;background:#191417bb}
#screen:not([data-mode="brief"]) #sheet{width:min(455px,100%);padding:24px;background:var(--panel);border-top:2px solid var(--accent)}
.eyebrow{font:800 .69rem Inter,system-ui;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
#screen h1{font:800 clamp(3.2rem,8vw,6.5rem)/.87 var(--display);letter-spacing:.01em;text-transform:uppercase;margin:9px 0 14px}
#screen:not([data-mode="brief"]) h1{font-size:clamp(2.4rem,6vw,3.6rem)}
#summary{color:#e1cebd;font-size:.97rem}
#operation-loading{margin-top:12px;color:#c7e1db;font-size:.85rem}
#guide{margin-top:15px;border-top:1px solid var(--line);padding-top:12px;display:grid;gap:6px;color:#eee0d1;font-size:.76rem}
#guide p{line-height:1.55}
#guide b{color:var(--accent)}
#buttons{display:flex;flex-wrap:wrap;gap:7px;margin-top:17px}
#profile{margin-top:14px}
#screen[data-mode="citadel"] #sheet{width:min(850px,100%);max-height:90vh;overflow:auto;border-color:#74c3bc}
#screen[data-mode="citadel"] #sheet>h1{margin-bottom:8px}
#citadel-root{margin-top:9px}
#region-picker{font:700 .83rem system-ui;background:#252326;color:#f6ede1;border:1px solid var(--line);padding:6px}
.citadel-rating{display:flex;gap:8px 16px;align-items:center;flex-wrap:wrap;padding:8px 11px;background:#274240;border-left:3px solid #a3dfcb}
.citadel-rating strong{font:800 22px/1 var(--display);color:#d2f3de}
.citadel-tabs{display:flex;gap:4px;margin:8px 0}
.citadel-tabs button[aria-selected="true"]{background:#35625a;border-color:#83c8b9}
.citadel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:7px}
.citadel-select{display:grid;gap:3px;color:#c7dfd3;font-size:.68rem}
#citadel-root select{width:100%;min-height:32px;color:#ebf6ec;background:#263635;border:1px solid #729b90;padding:4px}
#citadel-root select:focus-visible{outline:2px solid #e7ba84}
.citadel-grid fieldset{margin:0;border:1px solid #536c69;padding:7px;min-width:0}
.citadel-grid legend{padding:0 3px;font:750 14px var(--display)}
.citadel-stock{display:flex;flex-wrap:wrap;gap:3px 10px;color:#e0c5a0;margin-top:9px;font-size:.70rem}
.citadel-blueprints{display:grid;gap:6px}
.citadel-blueprints article{--rarity:#bfbec5;padding:9px;border-left:2px solid var(--rarity);background:#232d2d}
.citadel-blueprints article[data-rarity="1"]{--rarity:#83c779}.citadel-blueprints article[data-rarity="2"]{--rarity:#78baef}
.citadel-blueprints article[data-rarity="3"]{--rarity:#bf9ceb}.citadel-blueprints article[data-rarity="4"]{--rarity:#f2b178}
.citadel-blueprints article[data-rarity="5"]{--rarity:#f2db7d}
.citadel-blueprints h3{margin:0;color:var(--rarity);font:800 22px var(--display)}
.citadel-blueprints small{display:inline-block;margin:5px;color:#dcc7b2}
.citadel-blueprints button{margin:4px 0;padding:6px;font-size:.72rem}
#citadel-root button:disabled{opacity:.52;cursor:default}
#edit{position:absolute;right:22px;top:30%;width:min(260px,48vw);padding:13px;pointer-events:auto;
 background:#182526f2;border:1px solid #89ced1a6;border-top:2px solid #82d7d8;box-shadow:0 14px 32px #0c171489}
#edit h2{font:800 23px/1 var(--display);text-transform:uppercase;letter-spacing:.05em}
#edit-grid{display:grid;grid-template-columns:repeat(var(--count),minmax(0,1fr));gap:4px;margin:9px 0}
#edit-grid button{padding:0;aspect-ratio:1;border:1px solid #73ada9d1;background:#294344}
#edit-grid button[aria-pressed="true"]{background:linear-gradient(145deg,#82c5bb,#31696d);border-color:#a7dedc}
#edit-grid button:focus-visible{outline-color:#f6c493;z-index:1}
#edit-status{color:#e8c99f;min-height:1.3em;font-size:.74rem}
#edit-actions{display:flex;gap:4px;margin-top:6px}
#edit-actions button{padding:6px;font-size:.73rem}
#trap-picker{width:min(100%,340px);padding:7px 9px;color:#e1f4f0;border:1px solid #79b8b4aa;background:#213033;font:700 .83rem system-ui}
#trap-recipe{color:#bbd0cb;font-size:.75rem}
@media(max-width:680px){#edit{right:8px;top:29%;width:min(176px,46vw)}}
.idr-plate{position:relative;overflow:hidden;display:flex;gap:9px;align-items:center;width:min(320px,100%);height:48px;padding:4px 10px;background:var(--idr-shade);color:var(--idr-ink)}
.idr-card-art{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.idr-badge,.idr-plate-text{position:relative}
.idr-badge{width:34px;height:34px}
.idr-plate-text{display:grid;color:#fff2e7;text-shadow:0 1px 3px #000}
.idr-plate-text small{font-size:.64rem}
@media(max-width:680px){
 #vitals,#mission{top:9px}#vitals,#threat{left:8px}#mission,#kit{right:8px}
 #objective{top:9px;width:29vw}#kit{bottom:11px}
 #mission{width:92px}#radar{width:70px}#status{font-size:14px}
 #vitals{width:115px}.vital{height:18px}.vital label{font-size:12px}
 #prompt{bottom:121px}#toast{bottom:151px}
 #screen h1{font-size:3.6rem}
}

/* Deployment and field readouts share the Citadel's alloy and amber palette. */
:host{--accent:#f5c285;--panel:#142022f2;--line:#91b9b455}
#screen[data-mode="brief"]{
 grid-template-columns:minmax(250px,.83fr) minmax(360px,1.05fr);column-gap:clamp(20px,6vw,110px);
 align-content:center;align-items:center;padding:clamp(23px,5.3vw,100px);
 background:linear-gradient(95deg,#0f191bdc,#0d171980 52%,#10181bbe),linear-gradient(0deg,#10191cee,transparent 40%);
}
#screen[data-mode="brief"] #sheet{width:100%;padding:23px 0;border-block-start:2px solid #f5c285;border-block-end:1px solid #c1dcce42}
#screen[data-mode="brief"][data-hub]{grid-template-columns:minmax(0,560px) 1fr}
#screen[data-mode="brief"] h1{font-size:clamp(3rem,6.05vw,7.4rem);margin:15px 0;line-height:.82}
#operation-title{font:780 clamp(23px,3.3vw,35px)/1 var(--display);color:#cae7db;margin:28px 0 5px;letter-spacing:.022em}
#screen[data-mode="brief"] #summary{max-width:40ch;color:#d8e4db;font-size:clamp(.86rem,1.3vw,1.02rem);line-height:1.52}
#screen[data-mode="brief"] #buttons{margin-top:20px}
#screen[data-mode="brief"] #deploy{min-width:128px;box-shadow:0 4px 0 #956847;color:#1c2220}
#screen[data-mode="brief"] #deploy:disabled{opacity:.56}
#board{
 width:100%;max-width:660px;justify-self:end;border:1px solid #93aea274;border-top:3px solid #9fd1c2;
 padding:clamp(10px,1.9vw,23px);background:#132324eb;box-shadow:0 26px 60px #0a161ba6;
}
.board-head{display:flex;justify-content:space-between;align-items:end;gap:10px;margin-bottom:10px}
.board-head .citadel-select{min-width:min(57%,200px);font:720 .73rem Inter,system-ui}
#board #region-picker{width:100%;background:#223433;border:1px solid #93aea274;color:#eeefe2;margin-top:2px}
#board-power{white-space:nowrap;color:#e6cfab;font:800 18px/1 var(--display)}
.board-map{position:relative;border:1px solid #76ad9f55;background:#182d31;overflow:hidden}
#sector-map{display:block;width:100%;height:clamp(135px,23vh,238px);object-fit:cover}
#map-sector{position:absolute;left:8px;bottom:7px;padding:3px 7px;background:#122223cc;color:#cee6d8;font:750 13px var(--display);letter-spacing:.10em;text-transform:uppercase}
#mission-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px}
.op-option{position:relative;min-height:65px;display:grid;grid-template-columns:31px 1fr;gap:8px;align-items:center;text-align:left;color:#d9e3d9;
 background:#243333;border:1px solid #65857e65;padding:7px;line-height:1.1}
.op-option svg{width:27px;height:27px;color:#86bdb6}
.op-option span{display:grid;gap:4px}
.op-option b{font:770 clamp(13px,1.8vw,20px)/.95 var(--display);letter-spacing:.01em}
.op-option small{font:650 .68rem Inter,system-ui;color:#b3cbc3}
.op-option[aria-pressed="true"]{background:linear-gradient(120deg,#3b6256,#253a35);border-color:#b4d8b8;box-shadow:inset 3px 0 #efc38d}
.op-option[aria-pressed="true"] svg{color:#f2cb9f}
#alert-toggle{display:flex;justify-content:space-between;gap:7px;align-items:center;width:100%;margin-top:8px;padding:7px 9px;text-align:left;background:#3b3026;border-color:#bf8f58a0;color:#f2d7a9}
#alert-toggle[aria-pressed="true"]{background:#684d30;box-shadow:inset 2px 0 #efc58e}
#alert-toggle small{font-size:.65rem;color:#e4ba82}
#alert-detail{font-size:.70rem;color:#edc99e;padding:5px 2px 0;min-height:14px}
.operation-card{display:grid;gap:6px;background:#23383a;border:1px solid #699e9655;border-left:3px solid #94c2ac;padding:10px}
.operation-card h3{margin:0;font:800 20px var(--display);color:#d2eddf}
.operation-card p,.operation-card small{font-size:.72rem;color:#c4d5cc}
.operation-card progress{accent-color:#8fceb2;width:100%}
.operation-card button{justify-self:start;padding:5px 8px}
#fabricator{display:grid;gap:7px;margin-top:3px;padding-top:7px;border-top:1px solid #79b8b472}
#fabricator select{width:min(100%,340px);padding:7px 9px;color:#e1f4f0;border:1px solid #79b8b4aa;background:#213033}
#fabricator small{font-size:.73rem;color:#b7d0c6}
#vitals{gap:5px}
.vital{height:24px;border-radius:3px;background:#16262bd9;border-color:#d7e5dc8a}
.vital label{font-size:15px;text-shadow:0 1px 2px #040b10,0 0 5px #091418}
meter::-webkit-meter-optimum-value{background:linear-gradient(180deg,color-mix(in srgb,var(--meter,#edb877) 74%,white),var(--meter,#edb877) 64%,color-mix(in srgb,var(--meter,#edb877) 74%,#283f40) 67%)}
.slot{background:linear-gradient(150deg,#c1d4c438,#101d24dc),#3b5a63;border-color:#aac1baaa;border-radius:3px}
.slot[data-selected="true"]{border-color:#fff4cc;box-shadow:inset 0 -3px #e3b47a,inset 0 0 0 2px #0f0b1363}
.objective-line,#status{background:#17262bdd;border-color:#c1e1cc66;border-radius:3px}
#mission{gap:4px}
@media(max-width:800px){
 #screen[data-mode="brief"]{grid-template-columns:1fr;align-content:start;gap:14px;padding:16px}
 #screen[data-mode="brief"] #sheet{padding:12px 0}
 #screen[data-mode="brief"] h1{font-size:clamp(2.1rem,7vw,4.9rem);margin:9px 0}
 #operation-title{font-size:1.3rem;margin:12px 0 4px}
 #screen[data-mode="brief"] #buttons{margin-top:9px}
 #board{justify-self:start}
 .op-option{min-height:47px}
 #sector-map{height:118px}
 .vital{height:20px}.vital label{font-size:12px}
}
@media(max-height:540px){
 #screen,#screen[data-mode="brief"]{align-content:start;align-items:start;padding:10px}
 #screen:not([data-mode="brief"]) #sheet,#screen[data-mode="brief"] #sheet{padding:10px 13px}
 #screen:not([data-mode="brief"]) h1,#screen[data-mode="brief"] h1{font-size:2rem;margin:4px 0 8px}
 #screen #buttons{margin-top:8px;gap:5px}#screen button{padding:5px 9px;min-height:30px}
 #screen[data-mode="citadel"] #sheet{max-height:none;overflow:visible}
 #vitals,#objective,#mission{top:7px}
 #vitals{left:8px;width:min(145px,24vw);gap:3px}
 .vital{height:17px}.vital label{font-size:11px;white-space:nowrap;overflow:hidden}
 #stash{padding-top:3px;margin-top:1px;gap:2px}#stash span{display:flex;align-items:center;justify-content:center;padding:2px;font-size:12px}
 #stash svg{width:14px;height:13px}
 #objective{width:min(240px,38vw)}.objective-line{padding:3px 5px;gap:2px 5px}
 #mission{right:8px;width:min(155px,25vw);gap:2px}
 #radar{width:clamp(42px,16vh,72px);height:auto}
 #status{font-size:13px;margin:0;padding:2px 5px}#remaining,#task,#passStatus{font-size:10px;line-height:1.2}
 #squad-status{font-size:10px}
 #kit{right:8px;bottom:8px;gap:3px}#held{font-size:12px}
 #hotbar{padding-top:3px}#hotbar .slot,#build-strip .slot{width:clamp(26px,7vw,38px);height:31px}
 #prompt{bottom:51px;max-width:65%;font-size:11px}#toast{bottom:76px;max-width:66%;font-size:13px}
 #threat{left:8px;bottom:8px;max-width:27%;font-size:10px}
 #field-sound-captions{bottom:98px}
 #edit{top:42%;right:8px;max-width:26vw}
}
#screen[data-mode="pack"]{padding:10px;align-items:center;justify-items:center;background:#09111522}
#screen[data-mode="pack"] #sheet{
 width:min(790px,calc(100% - 24px));max-height:calc(100% - 12px);padding:0;
 display:flex;flex-direction:column;min-height:0;overflow:auto;background:#111c25e8;
 border:1px solid #557582;border-top:3px solid #75a7a9;box-shadow:0 12px 55px #080c17c9;
}
#screen[data-mode="pack"] #sheet>:is(#kicker,#title,#summary,#guide){display:none}
#screen[data-mode="pack"] #buttons{display:none}
#pack{min-height:0;display:flex;flex-direction:column}
.pack-banner{
 display:flex;align-items:center;gap:10px;min-height:47px;padding:6px 10px;
 background:linear-gradient(105deg,#2f686d,#1d414a);border-bottom:1px solid #87b7b4;
}
.pack-badge{
 display:grid;place-items:center;width:34px;height:32px;border:1px solid #9bc6bc;border-bottom-width:3px;
 background:#1a3a45;color:#efffff;font:800 .96rem var(--display);
}
.pack-banner>div{flex:1}
#pack-name{font:800 1.16rem/1 var(--display);letter-spacing:.04em}
#pack-subtitle{display:block;font-size:.68rem;color:#d4e7e6}
#pack-close{padding:5px 10px;color:#e3f4f2;background:#18343f;border-color:#8bbcb9}
.pack-toolbar{
 display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;
 background:#13242e;border-bottom:1px solid #78a2a0;
}
#pack-categories{display:flex;gap:4px;flex-wrap:wrap}
#pack-categories button{
 display:flex;align-items:center;justify-content:center;gap:4px;padding:4px 7px;
 color:#e0f7f4;background:#285254;border:1px solid #608e8f;border-radius:2px;font-size:.68rem;
}
#pack-categories button[aria-pressed=true]{color:#29241b;background:#e3b876;border-color:#f6dba6}
#pack-categories svg{width:20px;height:17px}
#pack-search{
 min-width:0;width:min(180px,29%);height:29px;padding:3px 7px;
 color:#f0f8f8;background:#0e1820;border:1px solid #648c90;border-radius:2px;font:inherit;font-size:.75rem;
}
#pack-search::placeholder{color:#a7bbc5}
.pack-main{display:grid;grid-template-columns:minmax(0,.93fr) minmax(0,1.07fr);min-height:min(365px,49vh)}
.pack-crafting,.pack-contents{min-width:0;min-height:0;display:flex;flex-direction:column}
.pack-crafting{background:#181a20b0;border-right:1px solid #557a82}
.pack-contents{background:#102a32cf}
.pack-heading{
 min-height:31px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 10px;
 background:#1d454c;border-bottom:1px solid #557e81;
}
.pack-heading h2{font:800 .98rem/1 var(--display);letter-spacing:.075em;text-transform:uppercase}
#pack-count{font-size:.67rem;color:#c7dcdf;text-align:right}
.pack-crafting-body{display:grid;align-content:start;gap:5px;overflow:auto;padding:8px 10px}
.pack-craft-row,#fabricator{
 display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:3px 6px;
 padding:5px 6px;background:#26323bb5;border:1px solid #51666b94;
}
.pack-craft-row b{font-size:.78rem}
.pack-craft-row small,#fabrication-cost{font-size:.64rem;color:#cbdcdb}
.pack-craft-row button,#fabricator button,#pack-item-action{
 padding:4px 6px;min-height:0;font-size:.69rem;background:#294e54;border-color:#779c9c;
}
#screen[data-mode="pack"] button:disabled{opacity:.54;cursor:default}
#screen[data-mode="pack"] #fabricator{margin:0}
#screen[data-mode="pack"] :is(#fabrication-picker,#trap-picker){
 width:100%;padding:3px 2px;color:#f6f7ef;background:#182b34;border:1px solid #719097;font-size:.68rem;
}
#fabrication-cost{grid-column:1/-1}
#pack-inspector{
 display:grid;gap:5px;min-height:0;margin:5px 10px 9px;padding:8px;
 color:#e7f1f1;background:#101923f2;border:1px solid #526f79;border-left:3px solid var(--item-tint,#7dadad);
}
#pack-detail-name{font:800 1.13rem/1 var(--display);color:#fff6dc}
#pack-detail-type{font-size:.68rem;color:#c8dbde}
#pack-detail-stats{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1px 8px;margin:0;font-size:.70rem}
#pack-detail-stats dt,#pack-detail-stats dd{margin:0;padding:2px 0;border-bottom:1px solid #64828a49}
#pack-detail-stats dd{text-align:right;color:#fff5dd;font-variant-numeric:tabular-nums}
#pack-item-action{justify-self:start;color:#edf7f7}
#pack-items{
 display:grid;grid-template-columns:repeat(auto-fill,minmax(53px,1fr));align-content:start;gap:5px;
 overflow:auto;min-height:100px;padding:8px 10px;
}
#pack-items .pack-card{
 position:relative;isolation:isolate;display:grid;place-items:center;min-width:0;aspect-ratio:1;min-height:0;padding:3px;
 border:1px solid color-mix(in srgb,var(--item-tint) 56%,#dae7e3);border-radius:2px;
 background:linear-gradient(145deg,color-mix(in srgb,var(--item-tint) 77%,#29333a),color-mix(in srgb,var(--item-tint) 39%,#232c38));
}
#pack-items .pack-card[aria-pressed=true]{outline:1px solid #ffdf9c;outline-offset:1px;z-index:1}
#pack-items .pack-card:hover,#pack-items .pack-card:focus-visible{outline:2px solid #fff0ca;outline-offset:0;z-index:2}
.pack-card :is(img,svg){width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(1px 2px 2px #10181cf0)}
.pack-card img{transform:rotate(-19deg) scale(1.12)}
.pack-card-tag,.pack-card-count{
 position:absolute;z-index:1;padding:0 3px;background:#101a22c9;color:#f9f3e3;font:750 .59rem/1.25 system-ui;
}
.pack-card-tag{top:1px;left:1px}.pack-card-count{bottom:1px;right:1px}
.pack-empty{grid-column:1/-1;color:#c5d9dc;font-size:.78rem;padding:8px 0}
@media(max-width:680px){
 #screen[data-mode="pack"] #sheet{width:100%;max-height:100%}
 #pack-categories button{padding:3px 5px}
 #pack-categories svg{width:15px}
 #pack-items{grid-template-columns:repeat(auto-fill,minmax(43px,1fr));gap:4px;padding:6px}
}
@media(max-width:530px) and (orientation:portrait){
 #screen[data-mode="pack"] #sheet{display:block}
 .pack-toolbar{align-items:stretch;flex-direction:column}
 #pack-search{width:100%}
 .pack-main{display:flex;flex-direction:column-reverse}
 .pack-contents{min-height:160px;max-height:36vh}
 .pack-crafting{border-right:0}
 #pack-inspector{order:-1;margin-bottom:8px}
}
/* Keep the three inventory work areas at fixed sizes when the inspection changes. */
#screen[data-mode="pack"] #sheet{width:min(1150px,100%);height:min(750px,calc(100% - 12px));background:#101e2df5}
#pack{flex:1}
.pack-main{flex:1;min-height:0;grid-template-columns:minmax(150px,.72fr) minmax(205px,1.2fr) minmax(185px,.92fr)}
.pack-inspection{min-width:0;min-height:0;overflow:auto;background:#151f2d;border-left:1px solid #557a82}
#pack-inspector{min-height:165px}
.pack-crafting-body,#pack-items{flex:1;min-height:0}
#pack-schematics{order:-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(71px,1fr));gap:5px}
.pack-schematic{
 display:grid;grid-template-rows:42px auto auto;gap:3px;padding:5px;min-width:0;
 background:linear-gradient(150deg,#3b6171,#203849);text-align:left;border-color:#80a9af;font-size:.64rem;
}
.pack-schematic img,.pack-schematic svg{max-width:100%;width:100%;height:100%;object-fit:contain}
.pack-schematic small{color:#c5d9d5;font-size:.61rem;overflow-wrap:anywhere}
#screen[data-mode="pack"] #fabricator{display:none}
.pack-actions{
 display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:7px 10px;
 background:#192838;border-top:1px solid #698b9b;min-height:43px;
}
.pack-actions button{background:#274859;padding:4px 8px;min-height:0;font-size:.73rem}
#pack-status{margin-right:auto;color:#d7e5eb;font-size:.73rem}
#pack-quantity-wrap{font-size:.7rem;color:#d7e5eb}
#pack-quantity{width:53px;color:#fff;background:#0d1722;border:1px solid #719097;padding:3px 4px}
#pack-items{overscroll-behavior:contain;scrollbar-gutter:stable}
#pack-hotbar{display:flex;align-items:center;gap:4px;padding:5px 8px;border-top:1px solid #557a82;background:#14232e}
#pack-hotbar .slot{width:42px;height:34px}
#pack-hotbar .slot kbd{line-height:1}
#pack-hotbar .slot img{height:23px;transform:rotate(-12deg)}
@media(max-width:700px) and (orientation:portrait){
 #screen[data-mode="pack"] #sheet{height:auto;max-height:100%}
 .pack-main{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.25fr);flex:none}
 .pack-contents,.pack-crafting{min-height:205px;max-height:35vh}
 .pack-inspection{grid-column:1/-1;border-left:0}
 #pack-inspector{min-height:0}
 .pack-actions{position:sticky;bottom:0;z-index:4}
}
</style>
<div id="hud" hidden>
 <div id="field-sound-captions" aria-live="polite" aria-label="Sound captions" hidden></div>
 <section id="vitals" aria-label="Vitals and materials">
  <div id="seat-label" hidden></div>
  <div class="vital" id="shield"><meter id="shield-meter" aria-label="Shield" min="0" max="60" value="60"></meter><label for="shield-meter"><i>◇</i><span id="shield-text"></span></label></div>
  <div class="vital" id="health"><meter id="health-meter" aria-label="Health" min="0" max="100" value="100"></meter><label for="health-meter"><i>✚</i><span id="health-text"></span></label></div>
  <div class="vital" id="pulse-vital"><meter id="pulse-meter" aria-label="Shock pulse charge" min="0" max="24" value="24"></meter><label for="pulse-meter"><i>ϟ</i><span id="pulse-text"></span></label></div>
  <div id="stash">
   <span aria-label="Wood"><svg viewBox="0 0 32 25" aria-hidden="true"><path fill="#a66c46" d="m3 13 19-9 7 3 1 6-20 9-7-3Z"/><path fill="#d9a275" d="m3 13 19-9 7 3-19 9Z"/><path fill="#ecd1a0" d="m3 13 7 3v6l-7-3Z"/><path fill="#9a603c" d="m5 16 3 1v2l-3-1Z"/></svg><b id="wood"></b></span>
   <span aria-label="Stone"><svg viewBox="0 0 32 25" aria-hidden="true"><path fill="#9a98b0" d="m2 19 4-11 12-5 10 6 2 11-12 4Z"/><path fill="#d5cde0" d="m6 8 12-5 10 6-10 7Z"/><path fill="#6c6781" d="m18 16 10-7 2 11-12 4Z"/></svg><b id="stone"></b></span>
   <span aria-label="Metal"><svg viewBox="0 0 32 25" aria-hidden="true"><path fill="#81bed1" d="M4 4h24l-4 5h-5v8h8v5H4v-5h8V9H4Z"/><path fill="#518196" d="m19 9 5-1v7h6l-3 7v-5h-8Z"/><path fill="#c7e4e3" d="M4 4h24l-4 4H4Z"/></svg><b id="metal"></b></span>
  </div>
  <div id="squad-status"></div>
 </section>
 <section id="objective" aria-label="Objective">
  <div class="objective-line"><b id="atlas-name">Signal Relay</b><small id="atlas-text"></small><meter id="atlas-meter" aria-label="Signal Relay integrity" min="0" max="900" value="900"></meter></div>
  <div class="objective-line" id="boss" hidden><b id="boss-name">Stormbreaker</b><small id="boss-text"></small><meter id="boss-meter" aria-label="Stormbreaker health" min="0" max="760" value="760"></meter></div>
 </section>
 <section id="mission" aria-label="Mission">
  <canvas id="radar" width="156" height="156" aria-label="Tactical radar"></canvas>
  <div id="status"></div><div id="remaining"></div><div id="task"></div><div id="passStatus"></div>
 </section>
 <div id="toast" role="status" hidden></div>
 <div id="cross"></div><div id="damage"></div>
 <div id="harvest" hidden><span id="harvest-name"></span>
  <meter id="harvest-meter" aria-label="Resource durability" min="0" value="0"></meter>
 </div>
 <section id="kit" aria-label="Equipment hotbar">
  <div id="build-strip" hidden></div>
  <div id="held"><span id="held-name"></span><span id="ammo"></span></div>
  <div id="hotbar"></div>
 </section>
 <div id="prompt" hidden></div><div id="threat"></div>
 <section id="edit" aria-label="Edit structure" hidden>
  <h2 id="edit-name"></h2>
  <div id="edit-grid"></div><div id="edit-status" role="status"></div>
  <div id="edit-actions"><button id="edit-apply" class="primary">Apply</button><button id="edit-reset">Reset</button><button id="edit-cancel">Cancel</button></div>
 </section>
</div>
<section id="screen" data-mode="brief" aria-labelledby="title">
 <div id="sheet">
  <div id="kicker" class="eyebrow">Relay Ridge · Solo PvE</div>
  <h1 id="title">Stormfront</h1>
  <h2 id="operation-title"></h2>
  <p id="summary">Restore power to the relay and defend it through five assaults.</p>
  <p id="operation-rewards" aria-live="polite" hidden></p>
  <p id="operation-loading" role="status" hidden>Loading operation…</p>
  <div id="profile" hidden></div>
  <div id="citadel-root" hidden></div>
  <div id="pack" hidden>
   <header class="pack-banner">
    <span class="pack-badge" aria-hidden="true">◇</span>
    <div><h2 id="pack-name">Field inventory</h2><small id="pack-subtitle"></small></div>
    <button id="pack-close" type="button" aria-label="Close inventory">Close</button>
   </header>
   <div class="pack-toolbar">
    <div id="pack-categories" role="group" aria-label="Inventory categories"></div>
    <input type="search" id="pack-search" aria-label="Search inventory" placeholder="Search items">
   </div>
   <div class="pack-main">
    <section class="pack-crafting" aria-labelledby="pack-crafting-title">
     <header class="pack-heading"><h2 id="pack-crafting-title">Crafting</h2></header>
     <div class="pack-crafting-body">
      <div class="pack-craft-row" data-pack-recipe="ammo">
       <div><b>Ammo</b><br><small>6 Stone · 4 Metal</small></div>
       <button id="craft" data-action="craft" aria-label="Craft ammo">Craft</button>
      </div>
      <div class="pack-craft-row" data-pack-recipe="traps">
       <select id="trap-picker" aria-label="Trap recipe"></select>
       <button id="traps" data-action="traps">Build trap</button>
       <small id="trap-recipe"></small>
      </div>
      <div id="pack-schematics" data-pack-recipe="weapons"></div>
      <div id="fabricator" hidden>
       <select id="fabrication-picker" aria-label="Weapon to fabricate"></select>
       <button id="fabricate" data-action="fabricate" aria-label="Fabricate weapon">Craft</button>
       <small id="fabrication-cost"></small>
       <button id="field-crate" data-action="field-crate" hidden>Craft and drop weapon</button>
      </div>
      <div class="pack-craft-row" data-pack-recipe="materials">
       <div><b>Building supplies</b><br><small>10 Wood · 10 Stone · 10 Metal</small></div>
       <button id="drop-stock" data-action="drop-stock">Drop bundle</button>
      </div>
      <p class="pack-empty" id="pack-no-recipes" hidden>No recipes available in this section.</p>
     </div>
    </section>
    <section class="pack-contents" aria-labelledby="pack-contents-title">
     <header class="pack-heading"><h2 id="pack-contents-title">Backpack</h2><small id="pack-count"></small></header>
     <div id="pack-items"></div>
     <div id="pack-hotbar" aria-label="Equipped weapons"></div>
    </section>
    <section class="pack-inspection" aria-labelledby="pack-inspect-title">
     <header class="pack-heading"><h2 id="pack-inspect-title">Item details</h2></header>
     <section id="pack-inspector" aria-label="Item details" hidden>
      <h2 id="pack-detail-name"></h2>
      <p id="pack-detail-type"></p>
      <dl id="pack-detail-stats"></dl>
     </section>
    </section>
    </div>
    <footer class="pack-actions">
     <span id="pack-status" role="status"></span>
     <button id="pack-item-action" type="button" hidden></button>
     <label id="pack-quantity-wrap" hidden>Quantity <input id="pack-quantity" type="number" min="1" value="1" aria-label="Drop quantity"></label>
     <button id="pack-drop" type="button" hidden>Drop item</button>
    </footer>
  </div>
  <div id="buttons">
   <button id="deploy" class="primary" data-action="deploy" disabled>Deploy</button>
   <button id="retry" class="primary" data-action="retry" hidden>Run again</button>
   <button id="pass" data-action="pass" hidden>Battle Pass</button>
   <button id="citadel" data-action="citadel" disabled>Citadel</button>
   <button id="citadel-back" data-action="citadelBack" hidden>Back</button>
   <button id="help" data-action="help" aria-expanded="false">Controls</button>
   <button id="field-fullscreen" type="button" hidden>Fullscreen</button>
   <button id="field-audio" data-action="audio" aria-controls="field-audio-settings" aria-expanded="false" hidden>Audio</button>
   <button id="exit" data-action="exit">Mode select</button>
  </div>
  <div id="guide" hidden>
   <p id="controls-fight"></p><p id="controls-build"></p><p id="controls-mission"></p>
  </div>
  <div id="field-audio-settings" hidden>${PlayerAudio.controls(true)}</div>
 </div>
 <section id="board" aria-label="Deployment board">
  <div class="board-head">
   <label class="citadel-select"><span>Region</span><select id="region-picker" aria-label="Stormwatch region"></select></label>
   <div id="board-power"></div>
  </div>
  <div class="board-map">
   <canvas id="sector-map" width="700" height="245" aria-label="Procedural terrain preview"></canvas>
   <span id="map-sector"></span>
  </div>
  <div id="mission-cards" role="group" aria-label="Stormwatch mission"></div>
  <button id="alert-toggle" type="button" aria-pressed="false">
   <span id="alert-name"></span><small id="alert-mode"></small>
  </button>
  <p id="alert-detail"></p>
 </section>
</section>
`;
return {mount(options={}){
const host = document.createElement('article');
host.id = 'stormwatch-mode';
if(options.local)host.dataset.local=String(window.SD_SPLIT.seat);
const surface = host.attachShadow({mode:'open'});
surface.innerHTML = stormwatchMarkup;
document.body.append(host);
const ui = Object.fromEntries([...surface.querySelectorAll('[id]')].map(el => [el.id, el]));
if(options.local){ui['seat-label'].textContent='Player '+window.SD_SPLIT.seat;ui['seat-label'].hidden=false}
const fieldCaptions=PlayerAudio.captions(ui['field-sound-captions']);
const unbindFieldAudio=PlayerAudio.bind(ui['field-audio-settings']);
const embedded = !!options.renderer;
const coop=options.squad;
let coopReady=false,remoteSeat=null,savingResult=false;
const controller = new AbortController();
let render,padFocus=null;
options.onStartupCleanup?.(()=>{
 controller.abort();unbindFieldAudio();fieldCaptions.close();
 if(render&&!embedded){render.dispose();render.forceContextLoss();render.domElement.remove()}
 host.remove();
});
function listen(target,name,handler,settings={}){
 target.addEventListener(name,handler,{...settings,signal:controller.signal});
}
listen(surface,'focusin',event=>{
 padFocus?.removeAttribute('data-pad-focus');padFocus=event.target;
 if(options.local&&event.target!==canvas)padFocus.setAttribute('data-pad-focus','');
});
function fieldFocus(){
 return surface.activeElement||(options.local&&padFocus?.getClientRects().length&&!padFocus.disabled?padFocus:null);
}
function exit(){
 if(savingResult)return;
 if(options.leave)options.leave('exit');
 else location.assign('index.html');
}
ui.exit.textContent = options.hub?'Homebase':embedded?'Mode select':'Spartan Drill';
ui.exit.onclick = exit;
if (!window.THREE) {
 ui.summary.textContent = 'Three.js could not load. Check your connection and reload.';
 return {close:()=>host.remove()};
}

const regions={
 timbervale:{name:'Timbervale',site:'Relay Ridge',floor:1,ceiling:19,woodland:.83,trees:33,relief:1,ground:[.3,.14],sky:[.84,.51,.40,.21,.23,.39],
  haze:0x685066,key:0xffd2a3,mountain:[0x53607b,0x62647f,0x555673,0x6e6885]},
 ironridge:{name:'Ironridge',site:'Foundry Pass',floor:19,ceiling:46,woodland:.55,trees:35,relief:1.15,ground:[.19,.105],sky:[.58,.55,.46,.13,.22,.28],
  haze:0x404b55,key:0xe3c4a3,mountain:[0x4b5a62,0x5b6668,0x69665d,0x5c5053]},
 canyonlands:{name:'Canyonlands',site:'Copper Wash',floor:46,ceiling:70,woodland:.14,trees:35,relief:1.34,ground:[.098,.063],sky:[.94,.60,.35,.26,.23,.36],
  haze:0x905f51,key:0xffc48a,mountain:[0x795455,0x90604e,0x74646b,0x916c57]},
 obsidian:{name:'Obsidian Peaks',site:'Frostline Relay',floor:70,ceiling:140,woodland:.22,trees:31,relief:1.52,ground:[.53,.61],sky:[.40,.51,.67,.11,.12,.27],
  haze:0x455579,key:0xaabde6,mountain:[0x4d5683,0x5f6485,0x555565,0x78879b]}
};
const query=new URLSearchParams(location.search);
const chosenRegion=options.region||(!embedded?query.get('region'):null);
const regionId=Object.hasOwn(regions,chosenRegion)?chosenRegion:'timbervale';
const region=regions[regionId];
const initialMission=options.mission||(!embedded?query.get('mission'):null);
const T = THREE;
let physics=null;
const vec = (x=0,y=0,z=0) => new T.Vector3(x,y,z);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const lerp = (a,b,t) => a+(b-a)*t;
const TAU = Math.PI*2;
const outpostSeed=(0x7325481+Object.keys(regions).indexOf(regionId)*2654435761)>>>0;
const mapSeed=(!initialMission||initialMission==='defense')?outpostSeed:(options.seed??window.crypto.getRandomValues(new Uint32Array(1))[0]);
const objectiveSeed=options.seed??window.crypto.getRandomValues(new Uint32Array(1))[0];
const objectiveSites=[[0,19],[0,-24],[22,-1],[-25,-1],[0,31],[-32,-1]];
const [ox,oz]=objectiveSites[(!initialMission||initialMission==='defense')&&Number.isInteger(options.relaySite)&&objectiveSites[options.relaySite]?options.relaySite:objectiveSeed%objectiveSites.length];
const objectiveDistance=(x,z)=>Math.hypot(x-ox,z-oz);
const districts={
 timbervale:['Pine suburbs','Orchard farms','Ancient forest','River grasslands','Timber market'],
 ironridge:['Foundry terraces','Rail city','Mill allotments','Coalwood forest','Slag meadows'],
 canyonlands:['Adobe suburbs','Mesa trading city','Irrigated farms','Juniper forest','Dry steppe'],
 obsidian:['Alpine village','Summit observatory','Frost farms','Black pine forest','Tundra grasslands']
};
const zoneKind=mapSeed%5,zoneName=districts[regionId][zoneKind];
let seed=mapSeed;
const slopeX=(mapSeed%1024)/287;
const slopeZ=((mapSeed>>>13)%1024)/211;
function rand(){
 seed = (Math.imul(seed,1664525)+1013904223)>>>0;
 return seed/4294967296;
}
const pick = items => items[Math.floor(rand()*items.length)];
const engineering = StormwatchEngineering;
const operations = StormwatchOperations;
const GRID = engineering.CELL, LEVEL = GRID, BOUND = 160, ATLAS_HP = 900, MAX_WAVES = 5;
const ASSAULT_WARNING=4, SEAL_DURATION=240, SEAL_SLICE=SEAL_DURATION/5;
const NEST_DURATION=420, PAYLOAD_PREP=40, PAYLOAD_DURATION=145, PAYLOAD_HP=760;
const nestCrews=[
 ['husk','husk','runner','runner','husk'],
 ['husk','runner','spitter','husk','husk','runner'],
 ['husk','brute','runner','spitter','husk','phantasm','runner'],
 ['runner','demolisher','beam','runner','husk','brute','spitter','husk'],
 ['juggernaut','runner','husk','brute','beam','phantasm','runner','spitter','husk']
];
const materials = [
 {id:'wood',name:'Timber',hp:190,buildTime:.52,color:0xbd875a,frame:0x79472d},
 {id:'stone',name:'Masonry',hp:320,buildTime:.93,color:0xaaa1bd,frame:0x5e5870},
 {id:'metal',name:'Alloy',hp:480,buildTime:1.42,color:0x519ab2,frame:0x263c55}
];
const pieces = engineering.ARCHETYPES;
const portals = [[0,-44-Math.floor(rand()*3)],[-43-Math.floor(rand()*3),-1],
 [43+Math.floor(rand()*3),-1],[0,43+Math.floor(rand()*3)]];
const waves = [
 {name:'Scavengers',lanes:[0],units:['husk','husk','runner','husk','husk','runner','husk','husk','runner']},
 {name:'Cover Breakers',lanes:[1,0],units:['runner','husk','husk','runner','spitter','husk','runner','husk','demolisher','runner','husk','husk']},
 {name:'Crossfire',lanes:[2,1,0],units:['husk','runner','spitter','brute','demolisher','runner','mortar','husk','phantasm','husk','husk','spitter','husk','brute']},
 {name:'Siege Crew',lanes:[3,2,1],units:['runner','beam','runner','brute','husk','catapult','husk','runner','mortar','brute','spitter','phantasm','husk','demolisher','runner','juggernaut']},
 {name:'Stormbreaker',lanes:[0,3,2,1],units:['boss','runner','husk','beam','runner','demolisher','brute','mortar','husk','phantasm','husk','spitter','juggernaut','catapult','husk','brute','runner','mortar','husk']}
];
const assaultLanes=waves.map(wave=>operations.assaultFronts(mapSeed,wave.lanes));
const frontNames=['North','West','East','South'];
const noFronts=[];
let assaultQueue=[],assaultGroup=0,assaultUnit=0;
const husks = {
 husk:{hp:80,speed:2.1,hit:18,scale:1.05,skin:0x9e99a6,suit:0x542e61,eye:0xffb364},
 runner:{hp:55,speed:3.7,hit:13,scale:.88,skin:0xb5a9c2,suit:0x822f62,eye:0xff8589},
 spitter:{hp:105,speed:1.8,hit:19,scale:1.18,skin:0x7fb9a3,suit:0x304a61,eye:0xaaffb9},
 brute:{hp:280,speed:1.55,hit:48,scale:1.53,skin:0x9379a4,suit:0x514263,eye:0xff9877},
 boss:{hp:760,speed:1.34,hit:64,scale:2.0,skin:0x827aa3,suit:0x442f58,eye:0xffc66f},
 mortar:{hp:168,speed:1.4,hit:49,scale:1.07,skin:0x8a879d,suit:0x683f6a,eye:0xff8562},
 demolisher:{hp:148,speed:1.92,hit:68,scale:1.28,skin:0x8d9c98,suit:0x72534d,eye:0xffbd62},
 beam:{hp:129,speed:1.63,hit:26,scale:1.42,skin:0xa5a3cb,suit:0x3d5b62,eye:0x74e1e4},
 phantasm:{hp:95,speed:3.14,hit:26,scale:1.00,skin:0xa499cc,suit:0x504467,eye:0xcda2ff},
 catapult:{hp:230,speed:1.34,hit:39,scale:1.52,skin:0xa5999f,suit:0x60525b,eye:0xf3bd77},
 juggernaut:{hp:411,speed:1.74,hit:51,scale:1.74,skin:0x998477,suit:0x4d4556,eye:0xff8e69}
};
const hollowNames={husk:'Shambler',runner:'Runner',spitter:'Hurler',brute:'Brute',boss:'Stormbreaker',
 mortar:'Mortar',demolisher:'Demolisher',beam:'Beam-Eye',phantasm:'Phantasm',catapult:'Catapult',juggernaut:'Juggernaut'};
const elementColors={Kinetic:0xffd4a0,Aether:0xbfa0ff,Scorch:0xff9058,Frost:0x83d9ec,Volt:0x8ce8a2};
const config = {sensitivity:1,quality:'med',pad:'auto',vibration:true,...options.config};
const scene = new T.Scene();
scene.background = new T.Color(0x596083);
scene.fog = new T.FogExp2(region.haze,.0098);
const camera = new T.PerspectiveCamera(64,1,.06,420);
camera.rotation.order = 'YXZ';
try {
 render = options.renderer || new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
} catch (error) {
 ui.summary.textContent = 'WebGL could not start. Enable hardware acceleration or try a browser with WebGL support.';
 return {close:()=>host.remove()};
}
const oldRenderer = {pixelRatio:render.getPixelRatio(),
 encoding:render.outputEncoding,tone:render.toneMapping,exposure:render.toneMappingExposure,
 shadows:render.shadowMap.enabled,shadowType:render.shadowMap.type,style:render.domElement.getAttribute('style'),tabindex:render.domElement.getAttribute('tabindex')};
render.outputEncoding = T.sRGBEncoding;
render.toneMapping = T.ACESFilmicToneMapping;
render.toneMappingExposure = .92;
const canvas = render.domElement;
if(!embedded)document.body.prepend(canvas);
Object.assign(canvas.style,{position:'fixed',inset:'0',zIndex:'999',touchAction:'none',outline:'none'});
canvas.tabIndex=-1;
const hemi = new T.HemisphereLight(0xacbaff,0x486556,.81);
scene.add(hemi);
const sun = new T.DirectionalLight(region.key,1.47);
sun.position.set(-37,52,21);
sun.castShadow = true;
Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:135});
sun.shadow.mapSize.set(1024,1024);
sun.shadow.normalBias = .05;
sun.shadow.bias = -.0003;
scene.add(sun);

function resize() {
 render.setPixelRatio(config.quality==='low'?1:Math.min(devicePixelRatio,config.quality==='high'?1.5:1.2));
 render.setSize(innerWidth,innerHeight);
 render.shadowMap.enabled = config.quality==='high';
 render.shadowMap.type = T.PCFSoftShadowMap;
 camera.aspect = innerWidth/Math.max(1,innerHeight);
 camera.updateProjectionMatrix();
}
listen(window,'resize',resize);
resize();

const box = new T.BoxGeometry(1,1,1);
const sphere = new T.IcosahedronGeometry(1,1);
const rock = new T.DodecahedronGeometry(1,0);
const cyl = new T.CylinderGeometry(1,1,1,12);
const hex = new T.CylinderGeometry(1,1,1,6);
const cone = new T.ConeGeometry(1,1,7);
const gem = new T.OctahedronGeometry(1);
const tire = new T.CylinderGeometry(1,1,1,12);
const palette = new Map();
function mat(color,glow=0,metalness=0) {
 const key = color+'/'+glow+'/'+metalness;
 if (!palette.has(key)) palette.set(key,new T.MeshStandardMaterial({
  color,emissive:glow,emissiveIntensity:glow?.78:0,metalness,roughness:.8,flatShading:true
 }));
 return palette.get(key);
}
function mesh(group,shape,material,x,y,z,w,h,d,cast=true) {
 const model = new T.Mesh(shape,material);
 model.position.set(x,y,z);model.scale.set(w,h,d);
 model.castShadow=cast;model.receiveShadow=true;
 group.add(model);
 return model;
}
function block(group,material,x,y,z,w,h,d,cast=true) {
 return mesh(group,box,material,x,y,z,w,h,d,cast);
}
function groupAt(parent,x=0,y=0,z=0) {
 const group = new T.Group();
 group.position.set(x,y,z);
 parent.add(group);
 return group;
}
function ring(group,material,radius,thickness,y=0,segments=32) {
 const item = mesh(group,new T.TorusGeometry(radius,thickness,6,segments),material,0,y,0,1,1,1,false);
 item.rotation.x = Math.PI/2;
 return item;
}
const steel=mat(0x28364d,0,0.4);
const trim=mat(0x7291aa,0,.3);
const accent=mat(0x65e9d9,0x35b2aa,.15);
const purple=mat(0xca87ff,0x9354f3,.1);
const orange=mat(0xe0a05b);
const dark=mat(0x192334);
const tires=mat(0x242331);
const glass=mat(0x355163,0,.3);
const portalFx=[];
const props=[];
const builds=new Map();
let supportedBuilds=engineering.supportIndex([]);
const collapsing=[];
const trapShots=[];
const trapRecipes=engineering.recipes;
const structureBatches=new Map();
let structureBatchDirty=true;
const enemies=[];
const bolts=[];
const loot=[];
const effects=[];
const fragments=[];
const fallen=[];
const solidProps=[];
const terrainPads=[];
const shelters=[];
const shotProps=[];
const cracked=new Set();let focusedProp=null;
let obstaclesDirty=true;
const keys=new Set();
const hero={pos:vec(-3,0,11),vy:0,ground:true,yaw:.18,pitch:-.14,hp:100,shield:60,hitAgo:20,reload:0,emote:0,
 maxhp:100,maxShield:60,heat:0,shout:0,rotary:0,tempGun:null,dash:0,extraJump:false,weapon:0,shot:0,swingTime:0,anim:0,bob:0,pulse:0,stacks:[40,30,20],cache:0,repairs:2,sprint:false,aim:false,move:0};
const state={mission:options.expedition?'expedition':Object.hasOwn(operations.missions,initialMission)?initialMission:'defense',modifier:null,
 alertRequested:!!options.alert,started:0,flux:0,siege:0,nestsCleared:0,nest:null,stormRadius:100,phase:'scout',wave:0,prep:0,elapsed:0,waveTime:0,pending:0,takedowns:0,atlas:ATLAS_HP,spawnIn:0,
 building:false,piece:0,material:0,recipe:0,ability:0,edit:null,deployed:false,finished:false,paused:true,screen:'brief',toasted:0,damage:0,hit:0,
 xp:0,tier:options.tier??null,allClear:false,mouse:false,look:'keys',pointerHint:false};
const gear=options.gear;
let citadel=null,unmountCitadel=null;
let profile=StormwatchCitadel.blank(),squad=StormwatchCitadel.rating(profile);
let fieldBag=StormwatchCitadel.emptyBag();
const discoveries=new Map();
const fieldReportId=mapSeed+'-'+Array.from(crypto.getRandomValues(new Uint32Array(2)),n=>n.toString(36)).join('-');
let reportNumber=0,fieldMetrics=operations.statline();
const fieldHollows=new Set(),fieldTraps=new Set();
function fileFieldReport(victory=false){
 if(!citadel||!state.deployed)return;
 if(victory)fieldMetrics.wins=1;
 if(!Object.values(fieldMetrics).some(Boolean)&&!fieldHollows.size&&!fieldTraps.size)return;
 const delta=fieldMetrics,hollows=[...fieldHollows],traps=[...fieldTraps];
 fieldMetrics=operations.statline();fieldHollows.clear();fieldTraps.clear();
 citadel.dispatch({type:'field-report',id:fieldReportId+'-'+(++reportNumber),started:state.started,
  mission:state.mission,modifier:state.modifier?.id,delta,hollows,traps}).then(saved=>{
  if(saved||controller.signal.aborted)return;
  for(const [key,n] of Object.entries(delta))fieldMetrics[key]+=n;
  for(const kind of hollows)fieldHollows.add(kind);for(const kind of traps)fieldTraps.add(kind);
  notice('Field report could not be saved');
 });
}
function collectPart(id,count){
 if(remoteSeat){remoteSeat.bag[id]=(remoteSeat.bag[id]||0)+count;sendGame('feedback',{part:[id,count]},remoteSeat.id);return}
 fieldBag[id]=(fieldBag[id]||0)+count;
 if(inventory&&(['parts','powder','quartz'].includes(id)))inventory.addOre(Math.max(1,Math.floor(count/3)));
}
function bankSalvage(victory,wave){
 persistField();
 fileFieldReport(victory);
 if(options.expedition)return Promise.resolve(true);
 if(!citadel)return Promise.resolve(false);
 const bag=inventory?StormwatchCitadel.emptyBag():fieldBag,found=victory?[...discoveries.values()]:[];
 if(!victory&&!wave&&!Object.values(bag).some(Boolean))return Promise.resolve(true);
 if(!inventory)fieldBag=StormwatchCitadel.emptyBag();if(victory)discoveries.clear();
 const action={type:wave?'debrief':'salvage',bag,discoveries:found,victory,mission:state.mission,
  region:regionId,completionId:fieldReportId,operative:squad.lead.id};
 if(!guest&&state.mission==='defense'&&wave&&mapSeed===outpostSeed){
  action.outpost={layoutVersion:3,seed:mapSeed,started:state.started,rows:packStructures(),cleared:props.flatMap((p,i)=>p.alive?[]:[i])};
 }
 return citadel.dispatch(action).then(saved=>saved||!victory?saved:citadel.dispatch(action)).then(saved=>{
  if(!saved&&!controller.signal.aborted){
   if(!inventory)for(const [key,n] of Object.entries(bag))collectPart(key,n);
   for(const item of found)discoveries.set(item.id,item);
   notice('Citadel salvage could not be saved');
  }
  return saved;
 });
}
const fallbackGun={name:'Assault rifle',stats:{d:30,m:30,au:1,rl:1.5,r:.12,sp:.009,pel:1}};
function armWeapon(weapon,power,element,design=profile.blueprints[weapon.k]){
 const base=weapon.baseStats||weapon.stats,blueprint=StormwatchCitadel.tune(design);
 const research=StormwatchCitadel.fieldResearch(profile);
 const stats={...base,d:base.d*blueprint.boost*(1+(squad.vital.Impact-10)*.005)*(1+.03*research.ordnance),
  m:Math.round(base.m*blueprint.mag),rl:base.rl*blueprint.reload};
 return {...weapon,stats,baseStats:base,power:Math.max(power,Math.round(blueprint.power)),element:element||blueprint.element||'Kinetic',
  blueprint,mag:stats.m,reserve:Math.max(72,stats.m*5)+18*research.logistics};
}
const guns=(gear?gear.weapons:[fallbackGun]).map(weapon=>armWeapon(weapon,12));
const hotbarCapacity=options.weaponSlots??guns.length;
const currentGun=()=>hero.tempGun||guns[hero.weapon];
function openWeaponSlot(){
 const broken=guns.findIndex(gun=>gun.condition===0);
 if(broken>=0&&options.weaponSlots)return broken;
 if(guns.length<hotbarCapacity)return guns.length;
 return guns[hero.weapon]?hero.weapon:0;
}
const inventory=options.inventory;
const fieldStash={planks:'Planks',parts:'Mechanical Parts',powder:'Mineral Powder',gears:'Batteries',quartz:'Quartz Crystal',
 charge:'Coal',cells:'Active Powercells',ore:'Rough Ore',twine:'Twine'};
let nextInventoryWrite=0,looseAmmo=0;
function inventoryBag(){
 const bag={...inventory?.bag,Wood:hero.stacks[0],Stone:hero.stacks[1],Metal:hero.stacks[2],
  Ammo:looseAmmo+guns.reduce((sum,gun)=>sum+gun.reserve,0)};
 for(const [key,name] of Object.entries(fieldStash))if(Object.hasOwn(fieldBag,key))bag[name]=fieldBag[key];
 return bag;
}
function persistField(){
 if(!state.deployed||!inventory)return;
 inventory.save(inventoryBag(),guns,currentGun()?.record?.uid);
}
function loadField(){
 if(!inventory)return;
 hero.stacks=['Wood','Stone','Metal'].map(key=>inventory.bag[key]||0);
 for(const [key,name] of Object.entries(fieldStash))if(Object.hasOwn(fieldBag,key))fieldBag[key]=inventory.bag[name]||0;
 const weaponCount=guns.length,reserve=inventory.bag.Ammo||0;
 looseAmmo=reserve;
 for(const [i,gun] of guns.entries()){
  gun.reserve=Math.min(360,Math.floor(reserve/weaponCount)+(i===0?reserve%weaponCount:0));
  if(gun.record){gun.mag=Math.min(gun.stats.m,gun.record.clip);gun.condition=gun.record.condition;}
  else if(gear){gun.mag=0;gun.condition=0;gun.reserve=0;}
  looseAmmo-=gun.reserve;
 }
}
function restock(amount){
 if(remoteSeat){sendGame('feedback',{ammo:amount},remoteSeat.id);return}
 for(const [index,weapon] of guns.entries()){
  weapon.reserve=Math.min(360,weapon.reserve+Math.ceil(amount*(index===0?1:.56)));
 }
}
const stage = groupAt(scene);
const ray = new T.Raycaster();
const aimDirection = vec(), aimPoint = vec();
let aimed=null, blueprint=null;
const screenVector = new T.Vector2();
let audio=null;
const fieldSoundLabels={pulse:'Energy pulse',hurt:'Taking damage',pickup:'Pickup chime'};
function sound(kind,caption=fieldSoundLabels[kind]) {
 if(remoteSeat)return;
 if(caption&&!state.paused)fieldCaptions.show(caption);
 if (!audio || audio.state!=='running')return;
 const [low,high,duration,volume,type] = {
  rifle:[125,38,.07,.105,'sawtooth'],hit:[565,285,.064,.044,'triangle'],swing:[280,102,.11,.041,'triangle'],
  build:[165,320,.14,.08,'triangle'],chip:[230,150,.075,.045,'square'],wave:[150,330,.42,.1,'triangle'],
  pulse:[225,36,.35,.105,'sine'],hurt:[210,64,.14,.075,'triangle'],pickup:[460,875,.15,.055,'sine'],
  empty:[138,95,.045,.03,'square'],step:[85,48,.058,.013,'triangle'],land:[112,51,.13,.06,'triangle']
 }[kind];
 const oscillator = audio.createOscillator(), gain=audio.createGain(), now=audio.currentTime;
 oscillator.type=type;
 oscillator.frequency.setValueAtTime(low,now);
 oscillator.frequency.exponentialRampToValueAtTime(high,now+duration);
 gain.gain.setValueAtTime(volume,now);
 gain.gain.exponentialRampToValueAtTime(.001,now+duration);
 oscillator.connect(gain).connect(PlayerAudio.output(audio,'effects',true));
 oscillator.start();
 oscillator.stop(now+duration);
}
function fieldShot(key,origin){
 const listener=heroBeforeRemote?.pos||hero.pos;
 const level=origin?Math.max(0,1-origin.distanceTo(listener)/55):1;
 if(level<.065)return;
 if(audio?.state==='running'&&gear?.shot?.(key,audio,PlayerAudio.output(audio,'effects',true),level)){
  fieldCaptions.show('Gunfire');return;
 }
 if(!origin)sound('rifle','Gunfire');
}
function unlockAudio(){
 const Audio = window.AudioContext || window.webkitAudioContext;
 if(!audio&&Audio){
  audio=new Audio();
  const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const wind=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  wind.buffer=buffer;wind.loop=true;filter.type='lowpass';filter.frequency.value=158;
  gain.gain.value=.006;wind.connect(filter).connect(gain).connect(PlayerAudio.output(audio,'ambience',true));wind.start();
  ambient={wind,filter,gain};
 }
 audio?.resume().catch(()=>{});
}

function stormDistance(x,z){return state.mission==='nests'?Math.hypot(x,z):objectiveDistance(x,z)}
function terrainHeight(x,z){
 const roadClearance=Math.min(Math.abs(x)-4.3,Math.abs(z+1)-3.1);
 if(roadClearance<=0)return 0;
 const blend=clamp(roadClearance*.21,0,1);
 const center=clamp((Math.hypot(x,z)-13)/19,0,1);
 const roll=.6+.51*Math.sin(x*.21+slopeX)*Math.cos(z*.18+slopeZ)+.43*Math.sin((x+z)*.13+slopeZ);
 let height=Math.max(0,roll)*blend*(.24+1.72*center*region.relief);
 for(const pad of terrainPads){
  const edge=Math.max(Math.abs(x-pad.x),Math.abs(z-pad.z));
  if(edge<9)height=lerp(pad.y,height,clamp((edge-4.5)/4.5,0,1));
 }
 return height;
}
function terrainTexture(street){
 const image=document.createElement('canvas');image.width=image.height=128;
 const ctx=image.getContext('2d');
 ctx.fillStyle=street?'#bab29e':'#cfc2ad';ctx.fillRect(0,0,128,128);
 for(let i=0;i<480;i++){
  ctx.fillStyle=i%3===0?'#57554a28':i%3===1?'#f6eed841':'#7a836a50';
  const x=rand()*128,y=rand()*128;
  ctx.fillRect(x,y,.5+rand()*4,.75+rand()*2);
 }
 if(street)for(let i=0;i<39;i++){
  ctx.strokeStyle=i%2===0?'#3e373a5c':'#faf0d646';ctx.lineWidth=.5+rand()*.8;
  const x=rand()*128,y=rand()*128;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4,y-3);ctx.lineTo(x+11,y+1);ctx.stroke();
 }
 const texture=new T.CanvasTexture(image);
 texture.wrapS=texture.wrapT=T.RepeatWrapping;
 return texture;
}
function createLandscape(){
 const sky = new T.Mesh(new T.SphereGeometry(355,24,12),new T.ShaderMaterial({
  side:T.BackSide,depthWrite:false,
  uniforms:{horizon:{value:vec(...region.sky.slice(0,3))},zenith:{value:vec(...region.sky.slice(3))}},
  vertexShader:'varying vec3 pos; void main(){pos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec3 pos;uniform vec3 horizon,zenith;
   void main(){
    vec3 dir=normalize(pos);
    float h=clamp(dir.y,0.,1.);
    vec3 sky=mix(horizon,zenith,smoothstep(0.,.60,h));
    float sun=max(0.,dot(dir,normalize(vec3(-.68,.20,-.62))));
    sky+=vec3(.64,.40,.14)*pow(sun,8.);
    sky+=vec3(.58,.35,.18)*smoothstep(.9981,.9994,sun);
    gl_FragColor=vec4(sky,1.);
   }`
 }));
 sky.renderOrder=100;scene.add(sky);
 const plane=new T.PlaneGeometry(370,370,232,232);
 plane.rotateX(-Math.PI/2);
 const pos=plane.attributes.position, colors=[];
 const tint=new T.Color();
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),z=pos.getZ(i),edge=Math.max(0,Math.max(Math.abs(x),Math.abs(z))-BOUND-3);
  const hill=edge*(.19+.15*Math.sin(x*.25)+.1*Math.cos(z*.19));
  pos.setY(i,-.055+hill+terrainHeight(x,z));
  const earth=Math.sin(x*.37+slopeX)+Math.cos(z*.31+slopeZ)+Math.sin((x+z)*.23);
  tint.setHSL(earth>1?region.ground[1]:region.ground[0]+.033*Math.sin(x*.12)*Math.cos(z*.14),.31+rand()*.10,(regionId==='obsidian'?.25:.13)+.028*Math.sin(x*.25+z*.11)+rand()*.03);
  colors.push(tint.r,tint.g,tint.b);
 }
 plane.setAttribute('color',new T.Float32BufferAttribute(colors,3));plane.computeVertexNormals();
 const landTexture=terrainTexture(false);landTexture.repeat.set(60,60);
 const ground=new T.Mesh(plane,new T.MeshStandardMaterial({map:landTexture,vertexColors:true,roughness:1}));
 ground.receiveShadow=true;scene.add(ground);
 for(let i=0;i<39;i++){
  const angle=i/39*TAU,rad=BOUND-6+rand()*19;
  const mountain=mesh(stage,rock,mat(pick(region.mountain)),
   Math.cos(angle)*rad,-3,Math.sin(angle)*rad,9+rand()*9,(7+rand()*17)*region.relief,9+rand()*5,false);
  mountain.rotation.y=rand()*TAU;
 }
 const gravel=mat(0x514841),stripe=mat(0xb19c6d);
 const asphalt=terrainTexture(true);asphalt.repeat.set(3,48);
 const shoulder=terrainTexture(true);shoulder.repeat.set(39,3);
 const road=new T.MeshStandardMaterial({color:0x47424b,map:asphalt,roughness:1});
 const sideRoad=new T.MeshStandardMaterial({color:0x625751,map:shoulder,roughness:1});
 const track=(material,x,z,w,d,y)=>{
  const model=mesh(stage,shadowGeometry,material,x,y,z,w,d,1,false);
  model.rotation.x=-Math.PI/2;
 };
 track(road,0,0,7.15,BOUND*2,-.019);track(sideRoad,0,-1,BOUND*2,5.5,-.012);
 for(const edge of [-1,1]){
  track(gravel,edge*3.62,0,.17,BOUND*2,-.015);
  track(gravel,0,-1+edge*2.79,BOUND*2,.19,-.010);
 }
 for(let i=-BOUND;i<BOUND;i+=5){
  if(Math.abs(i)<5||rand()>.82)continue;
  block(stage,stripe,(rand()-.5)*.06,-.016,i,.079,.012,.97+rand()*.59,false);
 }
 for(let i=0;i<29;i++){
  const z=(rand()-.5)*BOUND*2,x=(rand()-.5)*5.7;
  const repair=mesh(stage,rock,mat(pick([0x45404a,0x575051,0x49484d])),x,-.014,z,.19+rand()*.66,.01,.26+rand()*.41,false);
  repair.rotation.y=rand()*TAU;
 }
 const blades=new T.InstancedMesh(cone,mat(regionId==='obsidian'?0x829aaa:regionId==='canyonlands'?0xb08e65:0x708951),Math.round(980+region.woodland*1200));
 const dummy=new T.Object3D(),color=new T.Color();
 for(let i=0;i<blades.count;i++){
  let x,z;
  do{x=(rand()-.5)*BOUND*2;z=(rand()-.5)*BOUND*2}while(Math.abs(x)<4||Math.abs(z+1)<3.7);
  const height=.14+rand()*.37;
  dummy.position.set(x,terrainHeight(x,z)+height*.37,z);dummy.scale.set(.08+rand()*.11,height,.07+rand()*.09);
  dummy.rotation.set(rand()*.26,rand()*TAU,rand()*.3-.15);dummy.updateMatrix();
  blades.setMatrixAt(i,dummy.matrix);blades.setColorAt(i,color.setHSL(region.ground[0]-.11+rand()*.17,.32,.47+rand()*.33));
 }
 scene.add(blades);
}
function makeRiftDome(){
 const geometry=new T.SphereGeometry(49.7,54,26,0,TAU,0,Math.PI*.51);
 const material=new T.ShaderMaterial({
  transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,
  uniforms:{uTime:{value:0},uPressure:{value:.08}},
  vertexShader:`varying vec3 w; varying vec3 n;
   void main(){w=(modelMatrix*vec4(position,1.)).xyz;n=normalize(position);gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
  fragmentShader:`uniform float uTime,uPressure; varying vec3 w; varying vec3 n;
   void main(){
    float angle=atan(w.z,w.x);
    float fold=sin(angle*29.+sin(w.y*.23-uTime*.7)*2.4);
    float ribbons=smoothstep(.86,.99,fold)*(.58+.42*sin(w.y*.37-uTime*.95));
    float rim=1.-abs(dot(normalize(cameraPosition-w),normalize(n)));
    float top=1.-smoothstep(17.,38.,max(0.,w.y));
    float near=1.-smoothstep(6.,18.,length(cameraPosition-w));
    float opacity=(.018+ribbons*.21+rim*.11)*(top*.72+.28)*(uPressure+.24+near*.64);
    if(w.y<-.15)discard;
    gl_FragColor=vec4(mix(vec3(.34,.16,.59),vec3(.79,.41,1.),ribbons),opacity);
   }`
 });
 const dome=new T.Mesh(geometry,material);
 dome.position.y=-.38;
 dome.renderOrder=2;
 scene.add(dome);
 return dome;
}
const shadowGeometry=new T.PlaneGeometry(1,1);
const shadowTexture=(()=>{
 const image=document.createElement('canvas');image.width=image.height=32;
 const ctx=image.getContext('2d'),gradient=ctx.createRadialGradient(16,16,0,16,16,16);
 gradient.addColorStop(0,'rgba(0,0,0,0.69)');
 gradient.addColorStop(.44,'rgba(0,0,0,0.42)');
 gradient.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
 return new T.CanvasTexture(image);
})();
const shadowMaterial=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
function contactShadow(parent,width,depth){
 const shadow=new T.Mesh(shadowGeometry,shadowMaterial);
 shadow.rotation.x=-Math.PI/2;shadow.scale.set(width,depth,1);shadow.position.y=.018;
 parent.add(shadow);
 return shadow;
}
const trunkGeometry=new T.CylinderGeometry(.56,1,1,8,2);
function logBeam(group,material,from,to,radius){
 const start=vec(...from),end=vec(...to),direction=end.clone().sub(start);
 const center=start.addScaledVector(direction,.5);
 const stem=mesh(group,trunkGeometry,material,center.x,center.y,center.z,radius,direction.length(),radius);
 stem.quaternion.setFromUnitVectors(vec(0,1,0),direction.normalize());
 return stem;
}
function tree(group,size=1,wide=false){
 const bark=mat(pick([0x493934,0x58432e,0x534044])),flecks=mat(0x88644a);
 const colors=regionId==='obsidian'?[0x3e575f,0x6a8791,0x9cb3b9]:regionId==='canyonlands'?
  [0x535c3e,0x6b704d,0x938157]:wide?[0x345c41,0x537342,0x70834a]:[0x294f43,0x355d4e,0x607a54];
 mesh(group,trunkGeometry,bark,0,1.68,0,.31,3.38,.30);
 for(const [sign,lift] of [[-1,0],[1,.42],[-1,.9]]){
  const end=sign*(wide?1.38:.70);
  logBeam(group,bark,[0,1.78+lift,0],[end,2.56+lift,-.33],wide?.155:.087);
  logBeam(group,flecks,[sign*.22,.09,.06],[0,.58,0],.052);
 }
 if(wide){
  for(let i=0;i<6;i++){
   const angle=i/6*TAU+rand()*.25,spread=i<4?1.06:.71;
   const puff=mesh(group,sphere,mat(colors[i%3]),Math.cos(angle)*spread,3.23+(i%3)*.64,Math.sin(angle)*spread,
    1.4+rand()*.5,1.02+rand()*.43,1.16+rand()*.58);
   puff.rotation.set(rand()*.7,rand()*TAU,rand()*.7);
   puff.userData.chip=i===3||i===1;
  }
 }else{
  for(let i=0;i<5;i++){
   const radius=1.65-i*.27;
   const crown=mesh(group,cone,mat(colors[i%3]),(rand()-.5)*.11,2.22+i*.70,0,radius,1.80-i*.17,radius*.95);
   crown.rotation.set((rand()-.5)*.17,i*.83,(rand()-.5)*.18);
   crown.userData.chip=i===0||i===2;
   if(i<3)mesh(group,cone,mat(colors[(i+1)%3]),.32,1.99+i*.69,-radius*.32,radius*.67,.95-i*.12,radius*.59).rotation.set(.26,i*.66,.24);
  }
 }
 group.scale.setScalar(size);
}
function shelter(x,z,yaw,variation){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);group.rotation.y=yaw;
 group.updateWorldMatrix(true,false);
 const wall=mat(({timbervale:[0x81684e,0x57765c,0x955b45],ironridge:[0x795948,0x616875,0x956a54],canyonlands:[0xb27a54,0xc88b61,0xa66c52],obsidian:[0x5a656f,0x536475,0x66616c]})[regionId][variation%3]),beam=mat(0x453835),roof=mat(0x3c5258);
 const flooring=mat(0x69574a),windowGlass=mat(0x2a3d3e),width=GRID*2,depth=GRID*2;
 const alongZ=Math.abs(Math.sin(yaw))>.5;
 block(group,flooring,0,-.034,0,width,.10,depth);
 const toWorld=(lx,lz)=>group.localToWorld(vec(lx,0,lz));
 const building={type:'prop',kind:1,group,x,y,z,top:y+4,height:4,r:width/2,max:26,hp:26,alive:true,yaw,weakIndex:0,chippable:[],walls:[]};
 props.push(building);
 function panel(lx,lz,w,d){
  const top=2.65,world=toWorld(lx,lz),hx=(alongZ?d:w)*.5,hz=(alongZ?w:d)*.5;
  const cover={type:'cover',alive:true,r:Math.hypot(hx,hz),top:y+top,x:world.x,z:world.z,rect:{x:world.x,z:world.z,hx,hz}};
  const segment=block(group,wall,lx,top/2,lz,w,top,d);
  registerHit(segment,building);building.walls.push([segment,cover]);solidProps.push(cover);
  return cover;
 }
 const floorMark=toWorld(0,0);
 const aperture=2.24,wing=(width-aperture)/2,thickness=.23;
 panel(0,-depth/2,width,thickness);
 panel(-width/2,0,thickness,depth);
 panel(width/2,0,thickness,depth);
 for(const side of [-1,1])panel(side*(aperture/2+wing/2),depth/2,wing,thickness);
 block(group,beam,0,2.50,depth/2,width,.32,.34);
 block(group,beam,0,.04,depth/2,width,.092,.32);
 for(const side of [-1,1]){
  const slab=block(group,roof,side*width*.24,3.26,0,width*.58,.263,depth+.62);
  slab.rotation.z=-side*.42;
  for(const x of [side*width*.48,side*aperture*.52]){
   block(group,beam,x,1.27,depth*.5+.045,.135,2.53,.18);
  }
  for(let i=0;i<8;i++){
   block(group,beam,side*(width*.5+.122),1.24,(i-3.5)*depth/8,.024,2.37,.042,false);
  }
  const sideSign=side*(width*.5+.126);
  block(group,beam,sideSign,1.6,1.1,.065,1.02,1.46);
  block(group,windowGlass,sideSign+side*.035,1.6,1.1,.024,.73,1.21);
  block(group,trim,sideSign+side*.054,1.6,1.1,.025,.75,.049);
  const logs=groupAt(group,side*(width*.37),0,depth*.67);
  for(let i=0;i<3;i++)for(let j=-1;j<=1;j++){
   mesh(logs,cyl,mat(0x84634a),j*.248,.125+i*.21,.15,.137,1.23,.137).rotation.x=Math.PI/2;
  }
 }
 block(group,beam,0,1.46,-depth*.5+.38,3.36,.15,.58);
 block(group,beam,0,1.53,-depth*.5+.77,3.36,.085,.036);
 if(zoneKind===1){
  const floors=1+variation;
  for(let level=0;level<floors;level++){
   const h=4.9+level*2.5;
   const shell=block(group,wall,0,h,0,width*.90,2.5,depth*.9);
   registerHit(shell,building);building.extraHits||=[];building.extraHits.push(shell);
   for(const side of [-1,1])for(let bay=-1;bay<=1;bay++)block(group,glass,bay*width*.27,h,side*(depth*.451),width*.17,.95,.04);
  }
 }else if(zoneKind===2){
  for(let row=0;row<4;row++){
   const crop=groupAt(group,width*.7+row*.84,0,0);
   block(crop,mat(0x765538),0,.07,0,.58,.15,6);
   for(let stem=0;stem<6;stem++)mesh(crop,cone,mat(regionId==='obsidian'?0x8aa5ae:0xa7ac58),0,.39,stem-2.5,.29,.75,.29);
  }
 }
 const entrance=toWorld(0,depth/2+.9),inside=toWorld(0,depth/2-1.5),chest=toWorld((variation%2?1:-1)*1.8,-1.65);
 shelters.push({x:floorMark.x,z:floorMark.z,y,yaw,entrance,inside,chest});
}
function boulder(group){
 const surface=mat(pick([0x737083,0x8c8497,0x888491]));
 const body=mesh(group,rock,surface,0,.63,0,1.04,1.11,.95);
 body.rotation.set(.29,rand()*TAU,.22);
 const ledge=mesh(group,rock,mat(0x9993a0),.57,.31,.28,.64,.63,.65);
 ledge.rotation.set(.23,.65,-.28);
 mesh(group,rock,mat(0x62785b),-.41,.53,.53,.31,.17,.23);
}
function wreck(group){
 const paint=mat(pick([0x819b9f,0xb48262,0x7c82af,0x646c83]));
 block(group,dark,0,.42,0,1.55,.33,2.93);
 block(group,paint,0,.64,-.03,1.61,.39,2.94);
 block(group,paint,0,.87,1.04,1.56,.13,.73);
 block(group,glass,0,1.05,-.33,1.39,.42,1.33);
 block(group,paint,0,1.3,-.36,1.49,.12,1.4);
 for(const side of [-1,1]){
  block(group,paint,side*.72,1.05,-.33,.058,.43,.067);
  const windshield=block(group,paint,side*.67,1.05,.34,.07,.46,.07);
  windshield.rotation.x=.27;
  for(const end of [-1,1]){
   const wheel=mesh(group,tire,tires,side*.79,.36,end*.9,.32,.31,.32);
   wheel.rotation.z=Math.PI/2;
   const hub=mesh(group,tire,trim,side*.955,.36,end*.9,.15,.031,.15);
   hub.rotation.z=Math.PI/2;
  }
  block(group,mat(0xe7b980),side*.57,.72,1.47,.29,.126,.035);
  block(group,mat(0x963e4b),side*.57,.73,-1.5,.27,.12,.034);
 }
 block(group,trim,0,.53,1.47,1.56,.085,.075);
 block(group,trim,0,.53,-1.51,1.54,.085,.075);
}
function registerHit(object,entity,target=shotProps){
 object.userData.entity=entity;
 target.push(object);physics?.add(object);
 return object;
}
const invisible=new T.MeshBasicMaterial({visible:false});
function makeProp(kind,x,z){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 const id=materials[kind].id;
 const wide=kind===0&&rand()<.46;
 const prop={type:'prop',kind,group,x,z,y,r:[wide?.57:.49,.99,1.32][kind],
  top:y+[3,1.52,1.38][kind],height:[3,1.52,1.38][kind],hp:[5,7,9][kind],alive:true,wide,
  shake:0,impact:0,weakIndex:0};
 prop.max=prop.hp;
 group.rotation.y=kind===2?(rand()-.5)*.6+Math.PI/2:rand()*TAU;
 if(kind===0)tree(group,1,wide);
 if(kind===1)boulder(group);
 if(kind===2)wreck(group);
 const source=group.children.slice();
 prop.chippable=(kind===0?source.filter(part=>part.userData.chip):kind===1?[source[2],source[1]]:
  source.slice(5).filter(part=>part.geometry===box&&part.scale.x<.64&&part.scale.y<.6));
 contactShadow(group,[2.3,2.8,2.2][kind],[2.8,2.5,3.9][kind]);
 prop.hitbox=registerHit(block(group,invisible,0,prop.height*.5,0,
  kind===2?1.75:prop.r*2,prop.height,kind===2?3:prop.r*2,false),prop);
 prop.id=id;prop.yaw=group.rotation.y;
 props.push(prop);solidProps.push(prop);
}
function batchScenery(items){
 const groups=new Map(),bounds=new T.Box3(),itemBounds=new T.Box3();
 for(const root of items){
  root.updateWorldMatrix(true,true);
  root.traverse(part=>{
   if(!part.isMesh||part.isInstancedMesh||part.material.transparent)return;
   const {matrixWorld,geometry,material}=part;
   const x=matrixWorld.elements[12],z=matrixWorld.elements[14];
   const key=[geometry.id,material.id,part.castShadow,part.receiveShadow,Math.floor(x/36),Math.floor(z/36)].join('/');
   let parts=groups.get(key);
   if(!parts)groups.set(key,parts=[]);
   parts.push(part);
  });
 }
 for(const parts of groups.values()){
  if(parts.length<3)continue;
  const source=parts[0],geometry=source.geometry.clone();
  const batch=new T.InstancedMesh(geometry,source.material,parts.length);
  geometry.computeBoundingBox();bounds.makeEmpty();
  for(let i=0;i<parts.length;i++){
   const part=parts[i];
   batch.setMatrixAt(i,part.matrixWorld);
   bounds.union(itemBounds.copy(geometry.boundingBox).applyMatrix4(part.matrixWorld));
   part.parent.remove(part);
  }
  geometry.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
  batch.castShadow=source.castShadow;batch.receiveShadow=source.receiveShadow;
  batch.frustumCulled=true;batch.matrixAutoUpdate=false;
  scene.add(batch);
 }
}
function makeRidge(){
 const plans=[
  [-16-rand()*5,-19-rand()*6,pick([0,Math.PI/2])],
  [16+rand()*6,-16-rand()*7,pick([0,-Math.PI/2])],
  [14+rand()*9,19+rand()*7,pick([Math.PI,-Math.PI/2])]
 ].map(([x,z,yaw])=>[snapTile(x)+GRID/2,snapTile(z)+GRID/2,yaw]);
 const lots=[8,14,5,2,3][zoneKind];
 const rotation=rand()*TAU;
 for(let i=0;i<lots;i++){
  const a=rotation+i*TAU/lots,r=55+rand()*83;
  const x=snapTile(Math.cos(a)*r),z=snapTile(Math.sin(a)*r);
  plans.push([x,z,pick([0,Math.PI/2,Math.PI,-Math.PI/2])]);
 }
 if(options.expedition?.kind==='bomb'){
  const x=snapTile(ox),z=snapTile(oz);
  for(let i=2;i<=10;i++)terrainPads.push({x,z:z+i*GRID,y:0,rail:true});
 }
 for(const [x,z] of plans)terrainPads.push({x,z,y:Math.min(.35,terrainHeight(x,z))});
 createLandscape();
 const scenery=stage.children.filter(node=>node.isMesh&&!node.isInstancedMesh);
 for(const [x,z,yaw] of plans)shelter(x,z,yaw,Math.floor(rand()*3));
 const nearby=[
  [0,-7,10],[0,7,12],[0,-8,-10],[0,9,-13],[0,-13,18],[0,12,-5],[0,6,16],[0,-12,6],
  [1,-7,15],[1,6,7],[1,-10,-8],[1,9,16],[1,11,-13],[1,-14,1],
  [2,8,4],[2,-11,3],[2,10,-7],[2,-19,-3],[2,24,3],[2,-4,-18]
 ];
  for(const [kind,x,z] of nearby){
  const px=x+(rand()-.5)*1.35,pz=z+(rand()-.5)*1.15;
  if(objectiveDistance(px,pz)>4&&!terrainPads.some(p=>p.rail&&Math.hypot(px-p.x,pz-p.z)<3)&&!shelters.some(obj=>Math.hypot(px-obj.x,pz-obj.z)<7)&&!solidProps.some(obj=>coverAt(obj,px,pz,2)))makeProp(kind,px,pz);
 }
 for(let i=0;i<region.trees*2+[30,16,48,120,24][zoneKind];i++){
  let x,z,attempt=0;
  do{x=Math.round((rand()-.5)*(BOUND*2-6));z=Math.round((rand()-.5)*(BOUND*2-6));attempt++}
  while(attempt<125&&(Math.abs(x)<5||Math.abs(z+1)<4||Math.hypot(x,z)<20||
   portals.some(([px,pz])=>Math.hypot(x-px,z-pz)<6)||terrainPads.some(p=>p.rail&&Math.hypot(x-p.x,z-p.z)<3)||shelters.some(p=>Math.hypot(x-p.x,z-p.z)<7)||solidProps.some(p=>coverAt(p,x,z,2.5))));
  if(attempt<125){
   const kind=zoneKind===1&&i%3===0?2:rand()<region.woodland*(zoneKind===4?.45:1)?0:regionId==='ironridge'&&i%3===0?2:1;
   makeProp(kind,x,z);
  }
 }
 const horizonTrees=Math.round(8+region.woodland*17);
 for(let i=0;i<horizonTrees;i++){
  const angle=i/horizonTrees*TAU+rand()*.13,radius=BOUND+5+rand()*9;
  const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
  const horizon=groupAt(stage,x,terrainHeight(x,z)+.4,z);
  tree(horizon,1.05+rand()*.55,i%4===0);
  scenery.push(horizon);
 }
 batchScenery(scenery);
}

let atlasCore,atlasRing,atlasBeacon,atlasModel,atlasBody,atlasHit;
function makeAtlas(){
 const model=atlasModel=groupAt(stage,ox,0,oz);
 const pad=mat(0x374b61,0,.32);
 contactShadow(model,5.8,5.6);
 mesh(model,hex,dark,0,.1,0,2.15,.2,2.15);
 mesh(model,hex,pad,0,.26,0,1.94,.28,1.94);
 mesh(model,hex,steel,0,.65,0,1.18,.7,1.18);
 mesh(model,hex,trim,0,.98,0,.94,.16,.94);
 atlasBody={type:'atlas',x:ox,z:oz,r:1.91,top:3.65,alive:true};
 solidProps.push(atlasBody);
 atlasHit=registerHit(mesh(model,cyl,invisible,0,1.65,0,1.53,3.3,1.53,false),atlasBody);
 ring(model,accent,1.79,.029,.397,42);
 for(let i=0;i<4;i++){
  const frame=groupAt(model);frame.rotation.y=Math.PI/4+i*Math.PI/2;
  block(frame,pad,0,.33,1.55,.64,.28,.69);
  const strut=block(frame,pad,0,1.35,.99,.29,1.95,.3);
  strut.rotation.x=-.21;
  block(frame,orange,0,.56,1.61,.42,.06,.39);
  block(frame,accent,0,1.91,1.07,.09,.48,.06,false);
 }
 atlasRing=ring(model,accent,1.12,.039,2.34,34);
 const darkCore=groupAt(model,0,2.34,0);
 atlasCore=mesh(darkCore,gem,accent,0,0,0,.58,.94,.58,false);
 atlasBeacon=mesh(model,cyl,new T.MeshBasicMaterial({color:0x61e9db,transparent:true,opacity:.105,depthWrite:false}),0,7,0,.065,9,.065,false);
}
function haloTexture(){
 const image=document.createElement('canvas');image.width=image.height=64;
 const context=image.getContext('2d'),gradient=context.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'#fff');gradient.addColorStop(.19,'#ede1ffb0');
 gradient.addColorStop(.5,'#cab1ff35');gradient.addColorStop(1,'#a271ff00');
 context.fillStyle=gradient;context.fillRect(0,0,64,64);
 return new T.CanvasTexture(image);
}
const haloMap=haloTexture();
const weakTexture=(()=>{
 const image=document.createElement('canvas');image.width=image.height=64;
 const ctx=image.getContext('2d');ctx.lineWidth=6;ctx.strokeStyle='#fdf7b1';
 ctx.beginPath();ctx.arc(32,32,22,0,TAU);ctx.stroke();
 ctx.strokeStyle='#203940';ctx.lineWidth=2;ctx.beginPath();ctx.arc(32,32,18,0,TAU);ctx.stroke();
 ctx.fillStyle='#86e5de';ctx.beginPath();ctx.moveTo(32,22);ctx.lineTo(42,32);ctx.lineTo(32,42);ctx.lineTo(22,32);
 ctx.closePath();ctx.fill();
 return new T.CanvasTexture(image);
})();
const weakMark=new T.Sprite(new T.SpriteMaterial({
 map:weakTexture,transparent:true,depthWrite:false,opacity:.95,depthTest:false
}));
weakMark.visible=false;weakMark.renderOrder=5;weakMark.scale.set(.30,.30,1);scene.add(weakMark);
function glow(group,color,x,y,z,w,h,opacity){
 const material=new T.SpriteMaterial({map:haloMap,color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false});
 const sprite=new T.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(w,h,1);group.add(sprite);
 return sprite;
}
function makePortals(){
 for(let i=0;i<portals.length;i++){
  const [x,z]=portals[i],gate=groupAt(stage,x,terrainHeight(x,z),z);
  gate.rotation.y=Math.atan2(x,z);
  mesh(gate,hex,mat(0x312944),0,.02,0,3.45,.15,3.45,false);
  const flare=glow(gate,0xd49cff,0,2.5,0,9,10,0);
  const rot=groupAt(gate,0,2.67,0);
  const center=mesh(rot,gem,purple,0,0,0,.72,1.75,.18,false);
  center.rotation.z=-.12;
  const arch=ring(rot,purple,1.83,.077,0,28);
  arch.rotation.set(0,0,-.21);arch.scale.set(.77,1.17,1);
  const outer=ring(rot,mat(0x8e62d2,0x7549bc),2.13,.035,0,24);
  outer.rotation.set(.19,.31,.12);outer.scale.set(.85,1.12,1);
  for(const s of [-1,1]){
   const extrusion=mesh(gate,rock,mat(0x66557f),s*2.07,.56,0,.66,.81,.58);
   extrusion.rotation.z=s*.26;
  }
  const survey=mesh(gate,gem,mat(0x6d5c8c,0x38256a),0,.57,0,.38,.72,.36,false);
  const warning=groupAt(gate),light=new T.MeshBasicMaterial({color:0xffbf79,transparent:true,opacity:.61,depthWrite:false});
  mesh(warning,cyl,light,0,5.4,0,.095,10.8,.095,false);
  ring(warning,light,1.48,.046,.13,32);warning.visible=false;
  rot.visible=false;
  portalFx.push({flare,rot,outer,arch,survey,warning,active:false});
 }
}

function cacheModel(group,kind){
 const body=kind==='cache'?mat(0x966b49):mat(0x35667e);
 const light=kind==='cache'?mat(0xf8c875,0xd68a39):accent;
 block(group,dark,0,.35,0,1.18,.65,.91);
 block(group,body,0,.44,0,1.22,.58,.93);
 block(group,body,0,.76,0,1.28,.15,1.01);
 for(const side of [-1,1]){
  block(group,steel,side*.38,.46,.478,.17,.62,.09);
  block(group,trim,side*.38,.832,0,.175,.035,.97);
 }
 block(group,light,0,.59,.494,.23,.145,.074,false);
 return glow(group,kind==='cache'?0xffb95c:0x56eeff,0,.78,0,2.8,2.6,.39);
}
let dropIndex=0;
function addCache(x,z,kind){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 const flare=cacheModel(group,kind);
 const marker=mesh(group,gem,kind==='cache'?mat(0xf8c875,0xd68a39):accent,0,1.37,0,.15,.24,.15,false);
 loot.push({x,y,z,kind,group,flare,marker,active:true});
}

function addChest(shed,index){
 const {x,z}=shed.chest;
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 group.rotation.y=shed.yaw;
 const body=mat(0x856244),strap=mat(0x3a505a),brass=mat(0xffcd8c,0xbe8644);
 block(group,dark,0,.25,0,1.30,.50,1.03);
 block(group,body,0,.29,0,1.22,.43,.97);
 const lid=groupAt(group,0,.53,-.47);
 block(lid,body,0,.025,.47,1.31,.18,1.04);
 for(const side of [-1,1]){
  block(lid,strap,side*.46,.085,.47,.135,.09,1.01);
  block(group,strap,side*.46,.27,.486,.14,.49,.045);
 }
 block(lid,brass,0,-.046,.99,.20,.147,.032,false);
 const flare=glow(group,0xffcc8d,0,.63,0,2.5,2.4,.42);
 const marker=mesh(group,gem,brass,0,1.23,0,.133,.16,.133,false);
 const pool=gear?.loot.filter(item=>!guns.some(gun=>gun.k===item.k))||[];
 const roll=rand(),reward=pool.length?pool[Math.floor(roll*pool.length)]:roll<.23?{k:'AN',name:'Annihilator'}:{k:null,name:'Ridge Carbine'};
 loot.push({x,y,z,group,lid,flare,marker,kind:'chest',active:true,opened:false,reward,
  power:Math.max(20,region.floor+5)+index*3+Math.floor(rand()*6),element:engineering.elements[1+(index+Math.floor(rand()*4))%4],stocks:[24+Math.floor(rand()*21),14+Math.floor(rand()*15),10+Math.floor(rand()*15)]});
}
function availableChest(){
 let closest=null,distance=2.35;
 for(const item of loot){
  if((item.kind!=='chest'&&item.kind!=='weapon')||!item.active||Math.abs(hero.pos.y-item.y)>1.9)continue;
  const range=Math.hypot(hero.pos.x-item.x,hero.pos.z-item.z);
  if(range>=distance)continue;
  if(wallBetween(hero.pos.x,hero.pos.z,item.x,item.z,.025,hero.pos.y+.43))continue;
  if(solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,hero.pos.x,hero.pos.z,item.x,item.z,.015)))continue;
  closest=item;distance=range;
 }
 return closest;
}
function useChest(){
 const chest=availableChest();
 if(!chest)return false;
 if(!chest.opened){
  chest.opened=true;chest.lid.rotation.x=-1.19;fieldMetrics.caches++;
  hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+chest.stocks[i]));
  chest.marker.material=accent;chest.flare.material.color.setHex(0x7ddcde);
  restock(30);collectPart('parts',2+Math.floor(rand()*5));collectPart(pick(['quartz','powder','gears','cells']),1+Math.floor(rand()*4));collectPart('charge',2);
  if(chest.reward.k){
   const found={id:chest.reward.k,name:chest.reward.name};
   if(remoteSeat)sendGame('feedback',{discovery:found},remoteSeat.id);else discoveries.set(found.id,found);
  }
  notice(chest.reward.name+' · P'+chest.power+' '+chest.element+(chest.reward.k&&!profile.blueprints[chest.reward.k]?' · Extract to recover the pattern':''));
 }else{
  const drop={...chest.reward,power:chest.power,element:chest.element};
  if(remoteSeat)sendGame('feedback',{weapon:drop},remoteSeat.id);else equipLoot(drop);
  chest.active=false;if(chest.kind==='weapon')chest.group.visible=false;chest.marker.visible=false;chest.flare.visible=false;
 }
 sound('pickup');rumble(.18,68);
 return true;
}

function equipLoot(drop,design){
 const index=openWeaponSlot();
 const old=guns[index],reserve=old?.reserve||0;
 const weapon=drop.k&&gear?.canForge(drop.k)?gear.weapon(drop.k):drop.k==='AN'?
  {k:'AN',name:annihilatorStats.n,type:'Shotgun Pistol',stats:annihilatorStats,muzzle:actor.annihilatorMuzzle}:{...fallbackGun,name:drop.name};
 persistField();
 const record=inventory&&drop.k?inventory.loot(drop.k):null;
 if(inventory&&!record){weapon.model?.parent?.remove(weapon.model);notice('Backpack weapon rack full.');return}
 if(old?.model){old.model.visible=false;gear.model.remove(old.model)}
 if(record)weapon.record=record;
 guns[index]=armWeapon(weapon,drop.power,drop.element,design);
 if(record){guns[index].condition=record.condition;guns[index].mag=record.clip;guns[index].reserve=reserve;}
 repaintWeaponSlot(index);switchWeapon(index);persistField();
}

function createHero(){
 const root=groupAt(scene),chest=groupAt(root,0,1.12,0);
 const shell=mat(0xa8623e),cloth=mat(0x35495e), visor=mat(0x447e99,0x2a5167,.42);
 block(chest,cloth,0,.07,0,.58,.55,.36);
 block(chest,shell,0,.14,-.13,.5,.36,.21);
 for(const side of [-1,1]){
  block(chest,trim,side*.24,.16,.06,.075,.36,.39);
  block(chest,mat(0x775242),side*.2,-.16,-.2,.15,.15,.12);
 }
 block(chest,dark,0,.072,.235,.41,.44,.18);
 block(chest,mat(0x657b8a),0,.13,.344,.32,.26,.067);
 block(chest,accent,0,.07,.39,.18,.036,.022,false);
 for(const side of [-1,1])block(chest,orange,side*.19,.135,.337,.046,.3,.043);
 const head=groupAt(chest,0,.53,0);
 mesh(head,sphere,shell,0,0,0,.262,.252,.245);
 block(head,visor,0,-.009,-.187,.39,.128,.13);
 block(head,accent,0,-.007,-.257,.322,.023,.012,false);
 for(const side of [-1,1])block(head,dark,side*.235,-.034,0,.053,.146,.152);
 const antenna=block(head,trim,.21,.22,.079,.03,.27,.029);
 antenna.rotation.z=-.17;
 block(head,accent,.23,.35,.079,.036,.055,.035,false);
 const legs=[-1,1].map(side=>{
  const leg=groupAt(root,side*.164,.89,0);
  block(leg,cloth,0,-.21,.002,.24,.42,.24);
  block(leg,dark,0,-.54,.02,.205,.28,.19);
  block(leg,trim,0,-.37,-.103,.19,.125,.109);
  block(leg,dark,0,-.77,-.055,.252,.2,.343);
  block(leg,shell,0,-.742,-.20,.226,.102,.081);
  return leg;
 });
 const arms=[-1,1].map(side=>{
  const arm=groupAt(chest,side*.362,.23,-.035);
  block(arm,shell,0,-.08,0,.20,.25,.24);
  block(arm,cloth,0,-.24,0,.16,.22,.16);
  const fore=groupAt(chest);
  block(fore,cloth,0,-.11,0,.15,.24,.158);
  block(fore,trim,0,-.23,0,.16,.12,.161);
  block(fore,dark,0,-.33,0,.16,.15,.16);
  return {arm,fore,side};
 });
 const held=groupAt(chest,.395,-.033,-.31);
 const rifle=groupAt(held);
 block(rifle,steel,0,0,-.24,.145,.154,.66);
 block(rifle,dark,0,.029,.133,.13,.102,.296);
 block(rifle,trim,0,.005,-.46,.17,.133,.33);
 block(rifle,dark,0,.001,-.746,.067,.07,.3);
 block(rifle,dark,0,-.115,-.27,.097,.197,.149).rotation.x=-.25;
 block(rifle,orange,0,.103,-.214,.10,.074,.151);
 block(rifle,accent,.075,.027,-.343,.01,.036,.139,false);
 const muzzle=groupAt(rifle,0,.012,-.92),flash=glow(muzzle,0xffd898,0,0,0,.64,.64,0);
 const axe=groupAt(held);
 block(axe,mat(0x8b614a),0,-.06,-.382,.074,.078,1.0);
 block(axe,steel,0,-.059,-.83,.119,.119,.27);
 for(const side of [-1,1]){
  const blade=mesh(axe,gem,trim,side*(side===1?.17:.125),-.058,-.817,side===1?.30:.24,.083,.139);
  blade.rotation.y=side*.24;
  block(axe,steel,side*.106,-.014,-.819,.142,.022,.081);
  block(axe,orange,side*.049,-.014,-.817,.023,.035,.067);
 }
 for(let i=0;i<6;i++){
  block(axe,mat(0x343747),0,-.06,.045-i*.023,.08,.084,.016);
  block(axe,mat(0x343747),0,-.06,-.426-i*.017,.079,.083,.012);
 }
 const shadow=contactShadow(root,1.65,1.42);
 return {root,chest,head,legs,arms,held,rifle,axe,muzzle,flash,shadow};
}
const actor=createHero();
if(!gear){
 actor.annihilator=buildAnnihilatorModel(T,groupAt(actor.held,0,-.015,-.105));
 actor.annihilator.rotation.y=Math.PI;
 actor.annihilator.visible=false;
 const exit=actor.annihilator.userData.muzzle;
 actor.annihilatorMuzzle=groupAt(actor.annihilator,exit.x,exit.y,exit.z);
}
if(gear){
 actor.baseModel=gear.model;
 actor.root.add(actor.baseModel);
 for(const model of [actor.chest,...actor.legs])model.visible=false;
 actor.root.add(actor.held);
 actor.held.position.set(.385,1.12,-.34);
 actor.rifle.visible=false;
}
const weaponVisible=()=>!state.building&&hero.emote<=0;
const SWING_DURATION=.62, SWING_CONTACT=.27;
const axeMotion=[
 [0,[-.19,1.24,-.33],[.84,.49,-.31]],
 [.21,[-.19,1.66,-.17],[.49,.86,.07]],
 [.34,[-.12,1.66,-.24],[.36,.85,-.17]],
 [.46,[-.13,1.32,-.36],[.67,-.27,-.69]],
 [.63,[-.16,1.10,-.31],[.80,-.52,-.25]],
 [1,[-.19,1.24,-.33],[.84,.49,-.31]]
];
const axeGrip={right:vec(),left:vec(),axis:vec(),phase:0};
const axeForward=vec(0,0,-1),axeGripOffset=vec();
function poseAxe(step){
 const time=hero.swingTime/SWING_DURATION;
 const next=axeMotion.findIndex(([t])=>t>time);
 const end=next>0?next:axeMotion.length-1;
 const [from,start,direction]=axeMotion[end-1], [to,target,heading]=axeMotion[end];
 const a=clamp((time-from)/(to-from),0,1),mix=a*a*(3-2*a);
 const right=axeGrip.right.set(...start).lerp(axeGripOffset.set(...target),mix);
 right.y+=Math.abs(step)*.043*hero.move;
 const axis=axeGrip.axis.set(...direction).lerp(axeGripOffset.set(...heading),mix).normalize();
 actor.held.quaternion.setFromUnitVectors(axeForward,axis);
 actor.held.position.copy(right).sub(axeGripOffset.set(0,-.06,-.105).applyQuaternion(actor.held.quaternion));
 axeGrip.left.copy(right).addScaledVector(axis,.33);
 axeGrip.phase=hero.swingTime?Math.sin(Math.PI*time):0;
 return axeGrip;
}
function aimFallbackArm(limb,point){
 const {arm,fore,side}=limb;
 const shoulder=arm.position;
 const wrist=point.clone().sub(actor.chest.position),reach=wrist.clone().sub(shoulder);
 const length=Math.min(.69,reach.length()),direction=reach.normalize();
 const hint=vec(side*.54,-1,.05);
 const bend=hint.addScaledVector(direction,-hint.dot(direction)).normalize()
  .multiplyScalar(Math.sqrt(Math.max(0,.345**2-(length*.5)**2)));
 fore.position.copy(shoulder).addScaledVector(direction,length*.5).add(bend);
 arm.quaternion.setFromUnitVectors(vec(0,-1,0),fore.position.clone().sub(shoulder).normalize());
 fore.quaternion.setFromUnitVectors(vec(0,-1,0),wrist.sub(fore.position).normalize());
}
function animHero(dt){
 const motion=hero.ground?hero.move:0;
 hero.bob=(hero.bob+dt*(hero.sprint?13.4:9.0)*motion)%TAU;
 hero.anim=Math.max(0,hero.anim-dt*3.4);
 const bob=Math.sin(hero.bob),step=hero.move*(hero.sprint?.86:.66);
 actor.root.position.copy(hero.pos);
 actor.root.rotation.y=hero.yaw;
 actor.shadow.visible=hero.ground;
 const gun=currentGun(),visible=weaponVisible(),pickaxe=visible&&!gun;
 const brokenOpen=gun?.k==='AN'&&hero.reload>0?1-hero.reload/gun.stats.rl:-1;
 if(gear){for(const weapon of guns)if(weapon.k==='AN')animateAnnihilatorReload(weapon.model,weapon===gun?brokenOpen:-1)}
 else animateAnnihilatorReload(actor.annihilator,brokenOpen);

 let grip;
 if(!gear){
  actor.chest.position.y=1.12+Math.abs(bob)*.052*hero.move;
  actor.chest.rotation.x=hero.sprint?-.115:hero.pitch*.22;
  actor.chest.rotation.y=bob*hero.move*.05;
  actor.head.rotation.x=hero.pitch*.54;
  actor.legs.forEach((leg,i)=>{leg.rotation.x=hero.ground?bob*(i?1:-1)*step:(i?-.36:.48)});
 }
 if(pickaxe){
  if(actor.held.parent!==actor.root)actor.root.add(actor.held);
  grip=poseAxe(bob);
 }
 if(gear){
  for(const weapon of guns)if(weapon.model)weapon.model.visible=visible&&weapon===gun;
  if(hero.tempGun)hero.tempGun.model.visible=visible&&gun===hero.tempGun;
  gear.pose(hero,visible?gun:null,dt,grip);
  if(gun?.muzzle&&actor.flash.parent!==gun.muzzle)gun.muzzle.add(actor.flash);
 }else{
  if(hero.tempGun){
   hero.tempGun.model.visible=visible;
   hero.tempGun.model.position.set(.24,1.31,-.20);hero.tempGun.model.rotation.y=Math.PI;
  }
  if(!pickaxe){
   if(actor.held.parent!==actor.chest)actor.chest.add(actor.held);
   actor.held.position.set(.395,-.033,-.31);
   actor.held.rotation.set(hero.pitch*.58,0,hero.reload>0?-.4:0);
  }
  const left=grip?.right||vec(.02,1.18,-.49);
  const right=grip?.left||vec(.36,1.12,-.28);
  aimFallbackArm(actor.arms[0],left);aimFallbackArm(actor.arms[1],right);
  actor.annihilator.visible=visible&&gun?.k==='AN'&&!hero.tempGun;
  actor.rifle.visible=visible&&!!gun&&!hero.tempGun&&!actor.annihilator.visible;
  const muzzle=actor.annihilator.visible?actor.annihilatorMuzzle:actor.muzzle;
  if(actor.flash.parent!==muzzle)muzzle.add(actor.flash);
 }
 actor.axe.visible=pickaxe;
 actor.flash.material.opacity=visible&&gun&&hero.flash>0?.8:0;
}

function makeHusk(kind,x,z,knownElement){
 const base=husks[kind];
 const stats=state.modifier?.id==='quick'?{...base,speed:base.speed*1.22}:base;
 const root=groupAt(scene,x,terrainHeight(x,z),z),rig=groupAt(root);
 root.scale.setScalar(stats.scale);
 contactShadow(root,1.5,1.34);
 const skin=mat(stats.skin),suit=mat(stats.suit),eye=mat(stats.eye,stats.eye);
 const heavy=['brute','boss','juggernaut','catapult'].includes(kind),width=heavy?.71:.47;
 const chest=groupAt(rig,0,1.17,0);
 block(chest,suit,0,.08,0,width,.63,.35);
 block(chest,dark,0,-.22,0,width*.91,.16,.34);
 for(const side of [-1,1]){
  const pad=mesh(chest,rock,kind==='boss'?purple:suit,side*width*.445,.29,-.005,.17,.21,.19);
  pad.rotation.y=side*.33;
  block(chest,skin,side*.13,.175,-.179,.124,.042,.018);
 }
 const head=groupAt(chest,0,.48,-.111);
 mesh(head,rock,skin,0,.018,0,.238,.255,.236);
 block(head,dark,0,-.063,-.201,.246,.102,.052);
 block(head,skin,0,-.126,-.199,.139,.065,.106);
 for(const side of [-1,1]){
  block(head,eye,side*.089,.05,-.213,.098,.041,.035,false).rotation.z=side*.18;
  if(heavy)mesh(chest,gem,kind==='boss'?purple:eye,side*.31,.43,.04,.118,.33,.133);
 }
 const limbs=[-1,1].map(side=>{
  const arm=groupAt(chest,side*(width*.5+.065),.21,.01);
  block(arm,suit,0,-.125,0,.166,.31,.178);
  block(arm,skin,0,-.337,-.02,.15,.24,.15);
  block(arm,skin,0,-.457,-.063,.157,.092,.182);
  const leg=groupAt(rig,side*width*.267,.92,0);
  block(leg,suit,0,-.214,0,.19,.43,.21);
  block(leg,dark,0,-.57,.006,.161,.34,.16);
  block(leg,dark,0,-.784,-.048,.211,.17,.282);
  return {arm,leg};
 });
 const power=Math.max(region.floor,region.floor+9+(state.wave-1)*4+({husk:0,runner:1,spitter:3,brute:6,boss:13,
  mortar:4,demolisher:4,beam:6,phantasm:4,catapult:7,juggernaut:9})[kind]);
 const element=knownElement||(state.wave<3?'Kinetic':pick(state.wave>=4?engineering.elements.slice(2):['Kinetic','Kinetic','Scorch','Frost','Volt']));
 if(element!=='Kinetic')for(const side of [-1,1])block(chest,mat(elementColors[element],elementColors[element]),
  side*width*.42,.31,-.18,.073,.093,.05,false);
 const max=Math.round((stats.hp+(kind==='boss'?0:(Math.max(1,state.wave)-1)*7))*
  (1+(region.floor-1)*.008)*(state.modifier?.id==='tough'?1.28:1));
 const enemy={netId:++enemySerial,type:'enemy',kind,power,stats,root,rig,chest,head,limbs,x,z,r:heavy?.53:.34,
  active:true,hp:max,max,air:0,vy:0,kx:0,kz:0,snare:0,tar:0,charge:0,chargeIn:1.3,beamFor:0,beamTick:0,element,hitIn:1.15,bob:rand()*TAU,recoil:0,stun:0,stuck:0,yaw:Math.atan2(x,z)};
 enemy.body=registerHit(block(root,invisible,0,.88,0,width+.37,1.44,.64,false),enemy,enemyTargets);
 enemy.skull=registerHit(block(root,invisible,0,1.68,-.1,.49,.51,.48,false),enemy,enemyTargets);
 enemy.skull.userData.head=true;
 if(kind==='demolisher'){
  const cell=mesh(chest,cyl,mat(0xb5704b,0xc37833),0,.084,-.275,.17,.55,.168);
  mesh(chest,cyl,steel,0,.34,-.275,.174,.12,.17);
  enemy.canister=registerHit(block(chest,invisible,0,.084,-.275,.41,.57,.39,false),enemy,enemyTargets);
  enemy.canister.userData.canister=true;cell.rotation.z=.075;
 }
 if(kind==='mortar'){
  const tube=mesh(chest,cyl,mat(0x4b6370,0,.23),.13,.31,.27,.15,.77,.15);
  tube.rotation.x=.28;
 }
 if(kind==='beam')block(head,mat(0x69e5df,0x69e5df),0,.077,-.238,.145,.082,.03,false);
 if(kind==='phantasm'){
  const spirit=glow(root,0xab72ec,0,1.04,.15,1.75,2.8,.38);
  enemy.spirit=spirit;
 }
 if(kind==='boss')enemy.halo=ring(root,purple,.88,.027,.055,22);
 enemies.push(enemy);
 return enemy;
}
const enemyTargets=[];
const structureTargets=[];
const activeWalls=[];
const walkways=[];
function removeTarget(list,target){
 const i=list.indexOf(target);
 if(i!==-1){list.splice(i,1);physics?.remove(target)}
}

const gridHelper = new T.GridHelper(BOUND*2,Math.round(BOUND*2/GRID),0x64bfdf,0x5093b9);
gridHelper.position.y=.011;
gridHelper.material.opacity=.21;gridHelper.material.transparent=true;gridHelper.visible=false;
scene.add(gridHelper);

const ghostSkin=new T.MeshBasicMaterial({color:0x5dbeff,transparent:true,opacity:.21,depthWrite:false});
const ghostOutline=new T.LineBasicMaterial({color:0x9cdeff,transparent:true,opacity:.86,depthWrite:false});
const edgeBox=new T.EdgesGeometry(box);
const structureMaterials=new Map();
function structureSkin(spec){
 if(structureMaterials.has(spec.id))return structureMaterials.get(spec.id);
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=96;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#d9cfc5';ctx.fillRect(0,0,64,96);
 if(spec.id==='wood'){
  for(let i=0;i<43;i++){
   const x=rand()*64,d=(rand()-.5)*14;
   ctx.strokeStyle=i%3?'#7f695345':'#fff8de70';ctx.lineWidth=.5+rand();
   ctx.beginPath();ctx.moveTo(x,-8);ctx.bezierCurveTo(x+d,28,x-d*.7,63,x+d*.3,104);ctx.stroke();
  }
 }else if(spec.id==='stone'){
  for(let y=0;y<96;y+=24){
   ctx.fillStyle='#7a6d726d';ctx.fillRect(0,y,64,2);
   ctx.fillRect(y%48?20:39,y,2,23);
   ctx.fillStyle='#fff3db57';ctx.fillRect(0,y+3,64,1);
  }
 }else{
  for(let i=0;i<30;i++){
   const x=rand()*64,y=rand()*96;
   ctx.fillStyle=i%3?'#5c6a6e51':'#f2f6f291';
   ctx.fillRect(x,y,1,.8+rand()*12);
  }
  for(const x of [6,58])for(const y of [7,85]){
   ctx.fillStyle='#586066';ctx.fillRect(x,y,2,2);
  }
 }
 const map=new T.CanvasTexture(canvas);
 const material=new T.MeshStandardMaterial({color:spec.color,map,roughness:.82,metalness:spec.id==='metal'?.32:0});
 structureMaterials.set(spec.id,material);
 return material;
}
const capPanels=new Map();
function capPanel(bit){
 if(capPanels.has(bit))return capPanels.get(bit);
 const {u0,u1,v0,v1}=engineering.patchBounds(4,bit);
 const top=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(([x,z])=>[x,engineering.surfaceHeight(4,x,z)+.083,z]);
 const corner=top.findIndex(value=>value[1]>.1),opposite=(corner+2)%4;
 const [a,b,c,d]=[corner,(corner+1)%4,opposite,(corner+3)%4];
 const points=top.concat(top.map(([x,y,z])=>[x,y-.162,z]));
 const indices=[a,c,b,a,d,c,a+4,b+4,c+4,a+4,c+4,d+4];
 for(let i=0;i<4;i++){
  const j=(i+1)%4;
  indices.push(i,j+4,j,i,i+4,j+4);
 }
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
 geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(([x,,z])=>[x/GRID+.5,z/GRID+.5]),2));
 geo.setIndex(indices);geo.computeVertexNormals();
 capPanels.set(bit,geo);return geo;
}

function panels(group,item,preview=false){
 const {piece,mask,rank,material}=item;
 const skin=preview?ghostSkin:structureSkin(material);
 const frame=preview?ghostSkin:mat(material.frame);
 const n=engineering.dimensions(piece),solids=[];
 for(let bit=0;bit<n*n;bit++){
  if(!engineering.present(mask,bit))continue;
  const {u0,u1,v0,v1}=engineering.patchBounds(piece,bit);
  const u=(u0+u1)/2,v=(v0+v1)/2;
  let panel,angle=0;
  if(piece===0)panel=block(group,skin,u,v,0,u1-u0-.016,v1-v0-.012,.18+(rank-1)*.07,!preview);
  else if(piece===4)panel=mesh(group,capPanel(bit),skin,0,0,0,1,1,1,!preview);
  else{
   const slope=piece===2;
   angle=slope?Math.atan2(LEVEL,GRID):0;
   panel=block(group,skin,u,engineering.surfaceHeight(piece,u,v)+.065,v,
    u1-u0-.016,.152+(rank-1)*.035,(v1-v0)*(slope?Math.SQRT2:1)-.014,!preview);
   panel.rotation.x=angle;
  }
  solids.push({panel,bit});
  if(preview){
   const wire=new T.LineSegments(piece===4?new T.EdgesGeometry(panel.geometry):edgeBox,ghostOutline);
   wire.position.copy(panel.position);wire.quaternion.copy(panel.quaternion);wire.scale.copy(panel.scale);group.add(wire);
  }else if(piece!==4){
   if(piece===0){
    block(group,frame,u,v1-.042,.12,u1-u0-.016,.042,.065,false);
    if(rank>1)block(group,mat(rank===3?0xbcddda:0x83939e),u,v-.23,.14,(u1-u0)*.72,.074,.075,false);
   }else{
    const brace=block(group,frame,u,panel.position.y+.09,v,.056,.037,panel.scale.z*.9,false);
    brace.rotation.x=angle;
   }
  }
 }
 return solids;
}
function clearGhost(group){
 for(const child of group.children){
  if(child.isLineSegments&&child.geometry!==edgeBox)child.geometry.dispose();
 }
 group.clear();
}
const ghostModels = pieces.map((_,piece)=>{
 const group=groupAt(scene);group.visible=false;
 if(piece===3)block(group,ghostSkin,0,.14,0,GRID-.19,.22,GRID-.19,false);
 else panels(group,{piece,mask:engineering.fullMask(piece),rank:1},true);
 return group;
});
const editGhost=groupAt(scene);
editGhost.visible=false;

const coordinateKey=(type,x,z,layer)=>type+':'+x+':'+z+':'+layer;
const snapTile=n=>Math.round(n/GRID)*GRID;
function rectDistance(x,z,rect){
 return Math.hypot(Math.max(Math.abs(x-rect.x)-rect.hx,0),Math.max(Math.abs(z-rect.z)-rect.hz,0));
}
function planTrap(){
 const recipe=trapRecipes[state.recipe];
 const mounted=aimed?.object.userData.entity;
 if(mounted?.type!=='structure'||mounted.piece===3||aimed.distance>13)return {type:3,reason:'Aim at a friendly '+recipe.mount};
 const wall=recipe.mount==='wall',ceiling=recipe.mount==='ceiling';
 if((wall?mounted.piece!==0:mounted.piece!==1)||(ceiling&&mounted.layer===0))return {type:3,reason:'Requires a friendly '+recipe.mount};
 if(mounted.mask!==engineering.fullMask(mounted.piece))return {type:3,reason:'Requires a complete surface'};
 if(mounted.construction>0)return {type:3,reason:'Surface is under construction'};
 const angle=wall?mounted.angle:0;
 const nx=Math.sin(angle),nz=Math.cos(angle);
 const side=wall&&((hero.pos.x-mounted.x)*nx+(hero.pos.z-mounted.z)*nz)<0?-1:1;
 const x=mounted.x+(wall?nx*.25*side:0),z=mounted.z+(wall?nz*.25*side:0);
 const y=mounted.y+(wall?LEVEL*.5:ceiling?-.19:.18);
 const key=mounted.key+'/trap/'+recipe.mount+(wall?side:'');
 const reason=builds.has(key)?'Surface occupied':builds.size>=110?'Structure limit reached':
  recipe.cost.some((n,i)=>n>hero.stacks[i])?'Need more materials':'';
 return {type:3,key,x,y,z,angle:angle+(side<0?Math.PI:0),recipe,mount:mounted,material:mounted.material,cost:recipe.cost,reason};
}
function planStructure(){
 const type=state.piece;
 if(type===3)return planTrap();
 const dx=-Math.sin(hero.yaw),dz=-Math.cos(hero.yaw);
 const reach=clamp(4.85+hero.pitch*3.3,2.35,7);
 let x=snapTile(hero.pos.x+dx*reach),z=snapTile(hero.pos.z+dz*reach);
 const acrossX=Math.abs(dx)>Math.abs(dz);
 const angle=type===1?0:acrossX?(dx<0?Math.PI/2:-Math.PI/2):(dz<0?0:Math.PI);
 const viewY=hero.pos.y+1.4+Math.tan(hero.pitch)*reach;
 let layer=clamp(Math.floor((viewY+.3)/LEVEL),0,5);
 if(type===0){
  if(acrossX)x+=dx<0?GRID/2:-GRID/2;
  else z+=dz<0?GRID/2:-GRID/2;
 }else if(type===1&&hero.pos.y>LEVEL*.72&&viewY>LEVEL*.65)layer=clamp(Math.round(hero.pos.y/LEVEL),0,5);
 const y=layer*LEVEL,half=GRID/2;
 const rect={x,z,hx:type===0&&acrossX?.155:half,hz:type===0&&!acrossX?.155:half};
 const key=coordinateKey(['wall','floor','ramp','trap','cap'][type],x,z,layer);
 const material=materials[state.material],cost=materials.map(m=>m===material?10:0);
 const mask=engineering.fullMask(type),contacts=engineering.contacts({piece:type,x,z,layer,angle,mask});
 let reason='';
 if(Math.abs(x)>BOUND-half||Math.abs(z)>BOUND-half)reason='Out of bounds';
 else if(state.mission==='payload'&&rectDistance(ox,oz,rect)<1.65)reason='Keep the landing zone clear';
 else if(terrainHeight(x,z)>y+.48)reason='Uneven ground';
 else if(builds.has(key))reason='Already built';
 else if(type!==0&&[1,2,4].some(piece=>piece!==type&&builds.has(coordinateKey(['wall','floor','ramp','trap','cap'][piece],x,z,layer))))reason='Cell is occupied';
 else if(!engineering.canSupport(contacts,supportedBuilds))reason='Needs a grounded connection';
 else if(builds.size>=110)reason='Structure limit reached';
 else if(solidProps.some(p=>p.alive&&y<p.top-.05&&(p.rect?
   Math.abs(p.x-rect.x)<p.rect.hx+rect.hx&&Math.abs(p.z-rect.z)<p.rect.hz+rect.hz:rectDistance(p.x,p.z,rect)<p.r)))reason='Site obstructed';
 else if(type===0&&hero.pos.y+1.7>y&&hero.pos.y<y+LEVEL&&rectDistance(hero.pos.x,hero.pos.z,rect)<.35)reason='Step clear of the wall';
 else if(type===0&&y===0&&enemies.some(e=>e.active&&rectDistance(e.x,e.z,rect)<e.r))reason='Hollow blocking placement';
 else if(cost.some((n,i)=>n>hero.stacks[i]))reason='Need more materials';
 return {x,y,z,type,layer,angle,rect,material,cost,key,mask,contacts,reason};
}
function blueprintPose(model,plan){
 model.position.set(plan.x,plan.y,plan.z);
 model.rotation.set(plan.recipe?.mount==='wall'?Math.PI/2:0,plan.angle,0,'YXZ');
}
function updateBlueprint(){
 gridHelper.visible=state.building||!!state.edit;
 if(blueprint)ghostModels[blueprint.type].visible=false;
 if(!state.building||state.edit){blueprint=null;return}
 blueprint=planStructure();
 if(!Number.isFinite(blueprint.x))return;
 ghostSkin.color.setHex(blueprint.reason?0xf38282:0x5dbeff);
 ghostOutline.color.setHex(blueprint.reason?0xffa49b:0x9cdeff);
 const model=ghostModels[blueprint.type];
 model.visible=true;blueprintPose(model,blueprint);
}
function panelRect(item,bit){
 const {u0,u1,v0,v1}=engineering.patchBounds(0,bit),u=(u0+u1)/2;
 const c=Math.round(Math.cos(item.angle)),s=Math.round(Math.sin(item.angle));
 const span=(u1-u0)*.5,depth=.14+(item.rank-1)*.035;
 return {x:item.x+c*u,z:item.z-s*u,hx:c?span:depth,hz:s?span:depth,bottom:item.y+v0,top:item.y+v1};
}
function rebuildStructure(item){
 structureBatchDirty=true;
 for(const target of item.targets||[])removeTarget(structureTargets,target);
 item.group.clear();
 item.targets=[];item.barriers=[];
 if(item.piece===3){
  item.targets=trapVisual(item).map(model=>registerHit(model,item,structureTargets));
  return;
 }
 for(const {panel,bit} of panels(item.group,item)){
  item.targets.push(registerHit(panel,item,structureTargets));
  if(item.piece===0)item.barriers.push(panelRect(item,bit));
 }
 if(item.piece===0)obstaclesDirty=true;
}
function constructionAppearance(item,remaining){
 if(!remaining){item.group.scale.y=1;return}
 const built=1-remaining/item.material.buildTime;
 item.group.scale.y=.28+.72*clamp(built,0,1);
}
function place(){
 const plan=planStructure();
 if(guest){
  if(plan.reason){notice(plan.reason);return false}
  coopAction('place',{piece:state.piece,material:state.material,recipe:state.recipe,aim:packVector(aimPoint)});
  sound('build');return true;
 }
 if(plan.reason){notice(plan.reason);sound('empty');return false}
 const {type,x,y,z,angle,material,cost,key}=plan;
 const group=groupAt(scene,x,y,z);
 group.rotation.y=angle;
 const hp=type===3?145:material.hp;
 const calibration=plan.recipe?StormwatchCitadel.tune(profile.blueprints['trap/'+plan.recipe.id]):null;
 const item={...plan,group,type:'structure',piece:type,hp,max:hp,rank:1,trapIn:0,
  calibration,life:plan.recipe?Math.round(plan.recipe.charges*calibration.mag):null,
  construction:type===3?0:material.buildTime};
 rebuildStructure(item);
 constructionAppearance(item,item.construction);
 if(type===0)activeWalls.push(item);
 else if(type!==3)walkways.push(item);
 builds.set(key,item);fieldMetrics.builds++;
 if(type!==3)refreshSupport();
 hero.stacks=hero.stacks.map((n,i)=>n-cost[i]);
 addSparks(vec(x,y+.45,z),material?.color??0xf1bd87,11,2.7);
 sound('build');rumble(.11,55);
 return true;
}
function detachStructure(item,fall){
 if(!builds.delete(item.key))return;
 structureBatchDirty=true;item.group.visible=true;
 if(state.edit?.item===item){closeEditor(false);notice('Structure collapsed')}
 for(const target of item.targets)removeTarget(structureTargets,target);
 if(item.piece===0){
  removeTarget(activeWalls,item);obstaclesDirty=true;
 }else removeTarget(walkways,item);
 if(fall)collapsing.push({item,time:0,roll:item.x%3<0?-.72:.72});
 else scene.remove(item.group);
 addSparks(vec(item.x,item.y+.45,item.z),item.material?.color??0xf1bd87,13,3.2);
}
function refreshSupport(){
 const actual=[...builds.values()].filter(item=>item.piece!==3);
 supportedBuilds=engineering.supportIndex(actual);
 for(const item of actual){
  if(!supportedBuilds.supported.has(item))detachStructure(item,true);
 }
 for(const item of builds.values())if(item.piece===3&&
  (!builds.has(item.mount.key)||item.mount.mask!==engineering.fullMask(item.mount.piece)))detachStructure(item,true);
}
function removeStructure(item){
 detachStructure(item,true);
 if(item.piece!==3)refreshSupport();
}
function animateConstruction(dt){
 for(const item of builds.values()){
  if(item.construction<=0)continue;
  item.construction=Math.max(0,item.construction-dt);
  constructionAppearance(item,item.construction);
  physics?.update(item.targets);
  if(item.construction===0){
   structureBatchDirty=true;
   if(item.piece===0)obstaclesDirty=true;
  }
 }
 for(let i=collapsing.length-1;i>=0;i--){
  const collapse=collapsing[i],{item}=collapse;collapse.time+=dt;
  item.group.position.y=item.y-collapse.time**2*8;
  item.group.rotation.z=collapse.roll*collapse.time;
  if(collapse.time>.85){scene.remove(item.group);collapsing.splice(i,1)}
 }
}
function batchStructures(){
 if(!structureBatchDirty)return;
 structureBatchDirty=false;
 const groups=new Map();
 for(const item of builds.values()){
  if(item.construction>0||state.edit?.item===item)continue;
  item.group.updateWorldMatrix(true,true);
  for(const detail of item.group.children){
   if(!detail.isMesh)continue;
   const key=detail.geometry.uuid+'/'+detail.material.uuid;
   if(!groups.has(key))groups.set(key,{geometry:detail.geometry,material:detail.material,transforms:[]});
   groups.get(key).transforms.push(detail.matrixWorld);
  }
  item.group.visible=false;
 }
 for(const [key,batch] of structureBatches){
  if(groups.has(key))continue;
  scene.remove(batch);batch.dispose?.();structureBatches.delete(key);
 }
 for(const [key,group] of groups){
  const {geometry,material,transforms}=group;
  let batch=structureBatches.get(key);
  if(!batch||batch.instanceMatrix.count<transforms.length){
   if(batch){scene.remove(batch);batch.dispose?.()}
   const capacity=2**Math.ceil(Math.log2(transforms.length));
   batch=new T.InstancedMesh(geometry,material,capacity);
   batch.frustumCulled=false;batch.castShadow=true;batch.receiveShadow=true;
   structureBatches.set(key,batch);scene.add(batch);
  }
  transforms.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));
  batch.count=transforms.length;
  batch.instanceMatrix.needsUpdate=true;
 }
}

function segmentRect(x,z,dx,dz,r,padding=0){
 let start=0,end=1;
 for(const [pos,delta,center,half] of [[x,dx,r.x,r.hx+padding],[z,dz,r.z,r.hz+padding]]){
  if(Math.abs(delta)<.00001){
   if(Math.abs(pos-center)>half)return null;
   continue;
  }
  const a=(center-half-pos)/delta,b=(center+half-pos)/delta;
  start=Math.max(start,Math.min(a,b));end=Math.min(end,Math.max(a,b));
  if(start>end)return null;
 }
 return start;
}
function wallBetween(x,z,tx,tz,padding=.22,y=0){
 let first=null,near=Infinity;
 const dx=tx-x,dz=tz-z;
 for(const wall of activeWalls){
  if(wall.construction>0)continue;
  for(const panel of wall.barriers){
   if(y<panel.bottom-.01||y>=panel.top)continue;
   const t=segmentRect(x,z,dx,dz,panel,padding);
   if(t!==null&&t<near){first=wall;near=t}
  }
 }
 return first;
}
function circleBetween(x,z,tx,tz,p,radius){
 const dx=tx-x,dz=tz-z;
 const len=dx*dx+dz*dz;
 const dot=len?clamp(((p.x-x)*dx+(p.z-z)*dz)/len,0,1):0;
 return Math.hypot(x+dx*dot-p.x,z+dz*dot-p.z)<radius;
}
function coverAt(prop,x,z,r=.01){
 return prop.rect?rectDistance(x,z,prop.rect)<r:Math.hypot(x-prop.x,z-prop.z)<prop.r+r;
}
function coverAlong(prop,x,z,tx,tz,r){
 return prop.rect?segmentRect(x,z,tx-x,tz-z,prop.rect,r)!==null:circleBetween(x,z,tx,tz,prop,prop.r+r);
}
function playerBlocked(x,z,y){
 if(Math.abs(x)>BOUND-.35||Math.abs(z)>BOUND-.35)return true;
 for(const p of solidProps){
  if(p.alive&&y<p.top-.03&&coverAt(p,x,z,.28))return true;
 }
 return activeWalls.some(w=>w.construction<=0&&w.barriers.some(panel=>
  y+1.57>panel.bottom+.035&&y<panel.top-.04&&rectDistance(x,z,panel)<.29));
}
function floorAt(x,z,ceiling){
 let highest=terrainHeight(x,z);
 for(const item of walkways){
  const dx=x-item.x,dz=z-item.z;
  if(item.construction>0||Math.abs(dx)>GRID/2+.024||Math.abs(dz)>GRID/2+.024)continue;
  const c=Math.cos(item.angle),s=Math.sin(item.angle);
  const u=dx*c-dz*s,v=dx*s+dz*c,bit=engineering.bitAt(item.piece,u,v);
  if(!engineering.present(item.mask,bit))continue;
  const y=item.y+engineering.surfaceHeight(item.piece,u,v)+.135;
  if(y<=ceiling)highest=Math.max(highest,y);
 }
 return highest;
}

const NAV_STEP=GRID/2,NAV_SIZE=Math.round(2*BOUND/NAV_STEP);
const NAV_ORIGIN=-BOUND+NAV_STEP/2,NAV_COUNT=NAV_SIZE*NAV_SIZE;
const BREACH_COST=Math.round(3*GRID/NAV_STEP);
const navX=index=>index%NAV_SIZE*NAV_STEP+NAV_ORIGIN;
const navZ=index=>Math.floor(index/NAV_SIZE)*NAV_STEP+NAV_ORIGIN;
const navCell=(x,z)=>clamp(Math.round((x-NAV_ORIGIN)/NAV_STEP),0,NAV_SIZE-1)+
 clamp(Math.round((z-NAV_ORIGIN)/NAV_STEP),0,NAV_SIZE-1)*NAV_SIZE;
const distances=new Uint16Array(NAV_COUNT);
const navClosed=new Uint8Array(NAV_COUNT);
function neighbors(index){
 const ix=index%NAV_SIZE,row=Math.floor(index/NAV_SIZE),list=[];
 if(ix>0)list.push(index-1);
 if(ix<NAV_SIZE-1)list.push(index+1);
 if(row>0)list.push(index-NAV_SIZE);
 if(row<NAV_SIZE-1)list.push(index+NAV_SIZE);
 return list;
}
const navEdges=Array.from({length:NAV_COUNT},(_,i)=>neighbors(i));
function refreshRoutes(){
 obstaclesDirty=false;
 const cap=2000,buckets=Array.from({length:cap},()=>[]);
 distances.fill(cap);
 const spatial=new Map(),span=12;
 const nearby=(x,z)=>spatial.get(Math.floor(x/span)+','+Math.floor(z/span))||[];
 for(const prop of solidProps){
  if(!prop.alive)continue;
  const radius=(prop.r||0)+3;
  for(let x=Math.floor((prop.x-radius)/span);x<=Math.floor((prop.x+radius)/span);x++)
   for(let z=Math.floor((prop.z-radius)/span);z<=Math.floor((prop.z+radius)/span);z++){
    const key=x+','+z;
    if(!spatial.has(key))spatial.set(key,[]);
    spatial.get(key).push(prop);
   }
 }
 for(let i=0;i<NAV_COUNT;i++){
  const x=navX(i),z=navZ(i);
  navClosed[i]=nearby(x,z).some(p=>coverAt(p,x,z,.39))?1:0;
  if(!navClosed[i]&&objectiveDistance(x,z)<3.7&&!wallBetween(x,z,ox,oz,.08)){
   distances[i]=0;buckets[0].push(i);
  }
 }
 if(!buckets[0].length){
  for(let i=0;i<NAV_COUNT;i++){
   if(objectiveDistance(navX(i),navZ(i))<3.7&&!navClosed[i]){distances[i]=0;buckets[0].push(i)}
  }
 }
 for(let d=0;d<cap;d++){
  for(const here of buckets[d]){
   if(distances[here]!==d)continue;
   const hx=navX(here),hz=navZ(here);
   for(const next of navEdges[here]){
    if(navClosed[next]||distances[next]<=d+1)continue;
    const x=navX(next),z=navZ(next);
    if(nearby(x,z).some(p=>p!==atlasBody&&Math.abs(p.x-x)<p.r+3&&Math.abs(p.z-z)<p.r+3&&coverAlong(p,x,z,hx,hz,.33)))continue;
    const wall=wallBetween(x,z,hx,hz,.3);
    const cost=d+1+(wall?BREACH_COST:0);
    if(cost<distances[next]){distances[next]=cost;buckets[cost].push(next)}
   }
  }
 }
}
function enemyRoute(enemy){
 const {x,z}=enemy;
 const cell=navCell(x,z);
 let best=null,score=Infinity;
 const primary = navEdges[cell];
 const nearby = [cell,...primary,...primary.flatMap(n=>navEdges[n])];
 for(const i of nearby){
  const nx=navX(i),nz=navZ(i),length=Math.hypot(nx-x,nz-z);
  if(length<.25||length>5.4||distances[i]>=2000||distances[i]>=distances[cell])continue;
  if(solidProps.some(p=>p.alive&&coverAlong(p,x,z,nx,nz,enemy.r*.7)))continue;
  const wall=wallBetween(x,z,nx,nz,enemy.r*.72);
  const value=distances[i]+length*.55+(wall?BREACH_COST:0);
  if(value<score){score=value;best=[nx,nz]}
 }
 if(best)return best;
 if(navClosed[cell]||distances[cell]>=2000){
  for(const i of nearby){
   if(navClosed[i]||distances[i]>=2000)continue;
   const nx=navX(i),nz=navZ(i),length=Math.hypot(nx-x,nz-z);
   if(length<.23||solidProps.some(p=>p.alive&&coverAlong(p,x,z,nx,nz,enemy.r*.45)))continue;
   const value=length+distances[i]*.6;
   if(value<score){score=value;best=[nx,nz]}
  }
 }
 return best||[ox,oz];
}
function groundPos(){
 const f=-Math.sin(hero.yaw),g=-Math.cos(hero.yaw);
 return {f,g};
}
function moveHero(dt,pad){
 let side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+(pad?.side||0);
 let ahead=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)+(pad?.ahead||0);
 const mag=Math.hypot(side,ahead);
 if(mag>1){side/=mag;ahead/=mag}
 const {f,g}=groundPos();
 hero.sprint=!!(keys.has('ShiftLeft')||keys.has('ShiftRight')||pad?.sprint)&&ahead>.2&&!hero.aim;
 const velocity=hero.sprint?8.4:hero.aim?3.2:5.65;
 const surge=hero.dash>0?hero.dashHeading:null,pace=hero.dashKind==='bull'?16.8:19.1;
 const hold=Math.exp(-dt*(hero.ground?17:6.5));
 const tx=surge?surge.x*pace:(f*ahead-g*side)*velocity,tz=surge?surge.z*pace:(g*ahead+f*side)*velocity;
 hero.vx=lerp(tx,hero.vx||0,surge?0:hold);hero.vz=lerp(tz,hero.vz||0,surge?0:hold);
 const dx=hero.vx*dt,dz=hero.vz*dt,pos=hero.pos;
 hero.strafe=lerp(side,hero.strafe||0,Math.exp(-dt*9));
 if(physics){
  hero.move=lerp(hero.move,Math.min(1,mag),Math.min(1,dt*12));
  hero.vy-=dt*18;
  const vertical=hero.vy*dt;
  const result=physics.move(pos,{x:dx,y:vertical,z:dz});
  pos.copy(result.next);hero.ground=result.grounded&&hero.vy<=0;
  if(hero.ground){
   if(hero.vy<-13&&squad.lead.className!=='Shadow')hurtHero(Math.min(65,(Math.abs(hero.vy)-12)**1.3*2.4));
   hero.extraJump=false;
  }
  if(hero.ground||(vertical>0&&result.delta.y<vertical*.66))hero.vy=0;
  return;
 }
 if(!playerBlocked(pos.x+dx,pos.z,pos.y))pos.x+=dx;
 if(!playerBlocked(pos.x,pos.z+dz,pos.y))pos.z+=dz;
 hero.move=lerp(hero.move,Math.min(1,mag),Math.min(1,dt*12));
 const before=pos.y;
 const step=hero.ground&&hero.vy<=0?.32:.022;
 const floor=floorAt(pos.x,pos.z,before+step);
 hero.vy-=dt*18;
 pos.y+=hero.vy*dt;
 if(hero.vy>0){
  for(const item of walkways){
   if(item.piece!==1||item.construction>0||item.y<LEVEL||Math.abs(pos.x-item.x)>GRID/2||Math.abs(pos.z-item.z)>GRID/2||
    !engineering.present(item.mask,engineering.bitAt(1,pos.x-item.x,pos.z-item.z)))continue;
   if(before+1.66<item.y&&pos.y+1.66>=item.y){pos.y=item.y-1.67;hero.vy=0}
  }
 }
 if(pos.y<=floor&&hero.vy<=0){pos.y=floor;hero.ground=true;hero.vy=0}
 else hero.ground=false;
}
function jump(){
 if(!hero.ground){
  if(squad.lead.className!=='Shadow'||hero.extraJump)return;
  hero.extraJump=true;hero.vy=6.9;return;
 }
 hero.ground=false;hero.vy=7.4;
}
const cameraOffset=vec(),cameraTarget=vec(),cameraBoom=vec(),cameraPivot=vec();
let boomFraction=1,kickEnergy=0,groundedLast=true,strideSound=0,ambient=null;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function viewKick(amount){if(!reduceMotion)kickEnergy=Math.min(.33,kickEnergy+amount)}
function fieldFeedback(dt){
 const moving=hero.move>.15&&hero.ground&&hero.hp>0;
 if(hero.ground&&!groundedLast){viewKick(.15);sound('land');addSparks(hero.pos,0xbaba92,7,1.55)}
 groundedLast=hero.ground;
 strideSound-=dt;
 if(moving&&strideSound<=0){strideSound=hero.sprint?.26:.39;sound('step')}
 if(ambient&&audio?.state==='running'){
  const near=clamp((stormDistance(hero.pos.x,hero.pos.z)-state.stormRadius+13)/13,0,1);
  ambient.gain.gain.setTargetAtTime(.006+.02*near+.009*Number(state.phase==='active'),audio.currentTime,.37);
  ambient.filter.frequency.setTargetAtTime(158+near*280,audio.currentTime,.32);
 }
 ui.cross.style.setProperty('--bloom',Math.round(hero.heat*5+hero.move*3)+'px');
}

function cameraTick(dt,brief=false){
 if(brief){
  const time=state.elapsed*.19;
  camera.position.set(-12.8+Math.sin(time)*1.3,5.1,18+Math.sin(time*.61)*1.8);
  camera.lookAt(-5.5,1.3,-5);
  camera.updateMatrixWorld();
  return;
 }
 const width=hero.aim?.64:.79,behind=hero.aim?2.1:2.76;
 const y=hero.yaw;
 cameraPivot.copy(hero.pos).add(cameraOffset.set(0,1.48,0));
 cameraBoom.set(Math.cos(y)*width+Math.sin(y)*behind,.46-hero.pitch*.54,-Math.sin(y)*width+Math.cos(y)*behind);
 let t=1;
 for(const prop of solidProps){
  if(!prop.alive||cameraPivot.y>prop.top)continue;
  const hit=segmentRect(cameraPivot.x,cameraPivot.z,cameraBoom.x,cameraBoom.z,prop.rect||{x:prop.x,z:prop.z,hx:prop.r*.84,hz:prop.r*.84},.12);
  if(hit!==null)t=Math.min(t,Math.max(.11,hit-.06));
 }
 for(const wall of activeWalls){
  if(cameraPivot.y<wall.y||cameraPivot.y>wall.y+LEVEL)continue;
  const hit=wall.barriers.reduce((near,panel)=>{
   if(cameraPivot.y<panel.bottom||cameraPivot.y>panel.top)return near;
   const fraction=segmentRect(cameraPivot.x,cameraPivot.z,cameraBoom.x,cameraBoom.z,panel,.17);
   return fraction===null?near:Math.min(near??1,fraction);
  },null);
  if(hit!==null)t=Math.min(t,Math.max(.08,hit-.07));
 }
 boomFraction=t<boomFraction||dt===0?t:lerp(boomFraction,t,Math.min(1,dt*11));
 camera.position.copy(cameraPivot).addScaledVector(cameraBoom,boomFraction);
 kickEnergy*=Math.exp(-dt*12);
 const bob=reduceMotion?0:(Math.cos(hero.bob*2)*.012+Math.cos(hero.bob*4)*.004)*hero.move*(hero.aim?.44:1);
 camera.position.y+=bob;
 const roll=reduceMotion?0:(hero.strafe||0)*-.019;
 camera.rotation.set(hero.pitch+kickEnergy*.11,y+Math.sin(state.elapsed*31)*kickEnergy*.025,roll);
 const baseFov=hero.aim?55:hero.dash>0?76:hero.sprint?70:64;
 const targetFov=window.SD_SPLIT?splitCameraFov(baseFov,camera.aspect):baseFov;
 camera.fov=lerp(camera.fov,targetFov,dt===0?1:Math.min(1,dt*11));
 camera.updateProjectionMatrix();camera.updateMatrixWorld();
}
function notice(message){
 if(remoteSeat){sendGame('feedback',{line:message},remoteSeat.id);return}
 if(ui.toast.textContent!==message)ui.toast.textContent=message;
 ui.toast.hidden=false;state.toasted=3.1;
 if(!reduceMotion)ui.toast.animate([{opacity:.2,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:190,easing:'ease-out'});
}
function getAim(){
 ray.setFromCamera(screenVector,camera);
 aimDirection.copy(ray.ray.direction);
 ray.far=80;
 if(physics){
  const hit=physics.query(ray.ray.origin,aimDirection,72);
  aimed=hit?.object?hit:null;
  aimPoint.copy(hit?hit.point:ray.ray.at(65,cameraTarget));return;
 }
 const hits=ray.intersectObjects(shotProps.concat(structureTargets,enemyTargets),false);
 const floorT=ray.ray.direction.y<-.0001?-ray.ray.origin.y/ray.ray.direction.y:Infinity;
 aimed=hits.length&&hits[0].distance<=floorT?hits[0]:null;
 aimPoint.copy(aimed?aimed.point:ray.ray.at(Math.min(65,floorT),cameraTarget));
}
function shotFrom(muzzle,point){
 const bullet=vec().subVectors(point,muzzle);
 ray.far=bullet.length()+.24;
 ray.set(muzzle,bullet.normalize());
 if(physics)return physics.query(muzzle,bullet,ray.far);
 return ray.intersectObjects(shotProps.concat(structureTargets,enemyTargets),false)[0]||null;
}

const particleGeo=new T.IcosahedronGeometry(.095,0);
const particleMat=new T.MeshBasicMaterial({color:0xffffff});
const particleField=new T.InstancedMesh(particleGeo,particleMat,110);
particleField.instanceMatrix.setUsage(T.DynamicDrawUsage);particleField.count=0;particleField.frustumCulled=false;
scene.add(particleField);
const particlePose=new T.Object3D(),particleColor=new T.Color();
const particles=[];
function addSparks(pos,color,count,strength=3.8){
 for(let i=0;i<count;i++){
  if(particles.length>=110)particles.shift();
  particles.push({pos:pos.clone(),v:vec((rand()-.5)*strength,(.25+rand()*.68)*strength,(rand()-.5)*strength),
   color,time:.23+rand()*.3,r:.34+rand()*.98});
 }
}
function effect(object,duration,animate){
 scene.add(object);effects.push({object,duration,time:duration,animate});
}
function tracer(a,b,element){
 const color=gear?.tracer??elementColors[element]??0xffdc8e;
 const geometry=new T.BufferGeometry().setFromPoints([a,b]);
 if(!element||element==='Kinetic'){
  const material=new T.LineBasicMaterial({color,transparent:true,opacity:.88,blending:T.AdditiveBlending,depthWrite:false});
  effect(new T.Line(geometry,material),.085,t=>{material.opacity=t*.9});
  return;
 }
 geometry.setAttribute('distanceRatio',new T.Float32BufferAttribute([0,1],1));
 const material=new T.ShaderMaterial({
  transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  uniforms:{tint:{value:new T.Color(color)},phase:{value:1}},
  vertexShader:`attribute float distanceRatio;varying float along;
   void main(){along=distanceRatio;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 tint;uniform float phase;varying float along;
   void main(){float gap=(along-(1.-phase))*.88;float head=exp(-gap*gap);gl_FragColor=vec4(tint*(1.+head*.42),phase*(.29+.69*head));}`
 });
 effect(new T.Line(geometry,material),.145,t=>{material.uniforms.phase.value=t});
}
function animateParticles(dt){
 for(let i=particles.length-1;i>=0;i--){
  const p=particles[i];p.time-=dt;
  if(p.time<=0){particles.splice(i,1);continue}
  p.v.y-=dt*11;p.pos.addScaledVector(p.v,dt);
 }
 for(let i=0;i<particles.length;i++){
  const {pos,color,r,time}=particles[i];
  particlePose.position.copy(pos);particlePose.scale.setScalar(r*Math.min(1,time*5));
  particlePose.updateMatrix();particleField.setMatrixAt(i,particlePose.matrix);
  particleField.setColorAt(i,particleColor.setHex(color));
 }
 particleField.count=particles.length;
 if(particles.length){
  particleField.instanceMatrix.needsUpdate=true;particleField.instanceColor.needsUpdate=true;
 }
 for(let i=effects.length-1;i>=0;i--){
  const item=effects[i];item.time-=dt;
  if(item.time>0)item.animate(item.time/item.duration);
  else{
   scene.remove(item.object);item.object.geometry.dispose();item.object.material.dispose();effects.splice(i,1);
  }
 }
}

const propSurfaceRay=new T.Raycaster();
const propProjection=vec(),propLook=vec();
const crackMaterial=new T.LineBasicMaterial({color:0x36252c,transparent:true,opacity:.83});
const glowCrack=new T.LineBasicMaterial({color:0xddad79,transparent:true,opacity:.5});
function actualSurface(prop,point){
 prop.group.updateWorldMatrix(true,true);
 propLook.copy(point).sub(camera.position).normalize();
 propSurfaceRay.set(camera.position,propLook);
 propSurfaceRay.far=camera.position.distanceTo(point)+3;
 const targets=prop.group.children.filter(part=>part.isMesh&&part.material.visible&&part.geometry!==shadowGeometry);
 return propSurfaceRay.intersectObjects(targets,false)[0]?.point?.clone();
}
function showWeakPoint(prop){
 if(!prop.weak){
  const n=prop.weakIndex;
  const offsets=[[.05,.78],[-.25,.43],[.33,.64],[-.04,.31],[.22,.48]];
  const [side,up]=offsets[n%offsets.length];
  const right=vec().setFromMatrixColumn(camera.matrixWorld,0);
  const target=vec(prop.x,prop.y+Math.max(.37,Math.min(prop.height*.77,up*(prop.kind===0?2.21:1.35))),prop.z)
   .addScaledVector(right,side*prop.r);
  const surface=actualSurface(prop,target)||target;
  surface.addScaledVector(propLook,-.044);
  prop.weak=prop.group.worldToLocal(surface);
 }
 const world=prop.group.localToWorld(propProjection.copy(prop.weak));
 propProjection.copy(world).project(camera);
 if(Math.abs(propProjection.x)>1||Math.abs(propProjection.y)>1||propProjection.z>1)return;
 weakMark.position.copy(prop.weak);prop.group.localToWorld(weakMark.position);
 weakMark.visible=true;
}
function watchWeakPoint(){
 weakMark.visible=false;
 const prop=aimed?.object.userData.entity;
 focusedProp=prop?.type==='prop'&&prop.alive&&aimed.distance<16?prop:null;
 if(!focusedProp||currentGun()||state.building)return;
 if(Math.hypot(hero.pos.x-prop.x,hero.pos.z-prop.z)>3.7+prop.r*.5)return;
 showWeakPoint(prop);
}
function isWeakHit(prop){
 if(!weakMark.visible||focusedProp!==prop||!prop.weak)return false;
 propProjection.copy(weakMark.position).project(camera);
 return Math.hypot(propProjection.x*innerWidth,propProjection.y*innerHeight)<42;
}
function splitTrace(prop,hit){
 const surface=actualSurface(prop,hit)||hit.clone();
 const inward=camera.position.clone().sub(surface).normalize();
 surface.addScaledVector(inward,.034);
 const right=vec().setFromMatrixColumn(camera.matrixWorld,0);
 const up=vec().setFromMatrixColumn(camera.matrixWorld,1);
 const radius=prop.kind===0?.14:prop.kind===1?.27:.22,segments=[],light=[];
 for(let i=0;i<4;i++){
  const sign=i%2===0?-1:1,v=(Math.floor(i/2)-.5)*1.5;
  const joint=surface.clone().addScaledVector(right,sign*radius*.76).addScaledVector(up,v*radius);
  const tip=joint.clone().addScaledVector(right,sign*radius*.63).addScaledVector(up,-v*radius*.51);
  segments.push(prop.group.worldToLocal(surface.clone()),prop.group.worldToLocal(joint.clone()),
   prop.group.worldToLocal(joint.clone()),prop.group.worldToLocal(tip));
  joint.addScaledVector(up,.021);
  light.push(prop.group.worldToLocal(surface.clone().addScaledVector(up,.014)),prop.group.worldToLocal(joint));
 }
 prop.group.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(segments),crackMaterial));
 prop.group.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(light),glowCrack));
}
function wobbleProps(dt){
 for(const prop of cracked){
  if(!prop.alive){cracked.delete(prop);continue}
  prop.shake=Math.max(0,prop.shake-dt);
  const t=1-prop.shake/.35,amplitude=prop.impact*(1-t)*Math.sin(t*16);
  prop.group.rotation.set(amplitude*.71,prop.yaw+amplitude*.21,-amplitude);
  if(!prop.shake)cracked.delete(prop);
 }
}
function breakPart(part,origin,power,scale=1){
 if(!part?.parent||!part.material.visible)return;
 if(fragments.length>=100){
  const old=fragments.shift();scene.remove(old.model);
 }
 part.updateWorldMatrix(true,false);
 const model=new T.Mesh(part.geometry,part.material);
 part.matrixWorld.decompose(model.position,model.quaternion,model.scale);
 model.scale.multiplyScalar(scale);
 model.castShadow=true;model.receiveShadow=true;
 const direction=vec(model.position.x-origin.x,0,model.position.z-origin.z);
 if(direction.lengthSq()<.02)direction.set(rand()-.5,0,rand()-.5);
 direction.normalize().multiplyScalar(power*(.45+rand()));
 direction.y=(.72+rand()*.7)*power;
 scene.add(model);
 fragments.push({model,v:direction,omega:vec((rand()-.5)*7,(rand()-.5)*7,(rand()-.5)*7),life:2.2+rand()*.9});
}
function animateDebris(dt){
 for(let i=fragments.length-1;i>=0;i--){
  const frag=fragments[i];
  frag.life-=dt;
  if(frag.life<=0){scene.remove(frag.model);fragments.splice(i,1);continue}
  const {model,v,omega}=frag;
  v.y-=dt*12;model.position.addScaledVector(v,dt);
  model.rotation.x+=omega.x*dt;model.rotation.y+=omega.y*dt;model.rotation.z+=omega.z*dt;
  const floor=Math.min(.47,.08+model.scale.y*.23);
  if(model.position.y<floor){
   model.position.y=floor;v.y=v.y<-.52?-v.y*.27:0;
   v.x*=.8;v.z*=.8;omega.multiplyScalar(.78);
  }
 }
 for(let i=fallen.length-1;i>=0;i--){
  const tree=fallen[i];tree.age+=dt;
  if(tree.age>3.2){stage.remove(tree.group);fallen.splice(i,1);continue}
  const t=clamp(tree.age/.85,0,1);
  tree.group.quaternion.setFromAxisAngle(tree.axis,1.46*t*t).multiply(tree.yaw);
  if(t===1&&!tree.landed){tree.landed=true;addSparks(tree.group.position.clone().addScaledVector(tree.heading,3.1),0xa18358,11,3)}
 }
}
function breakProp(prop,hit,replay=false){
 if(!replay)fieldMetrics.breaks++;
 prop.alive=false;
 if(prop.walls){for(const target of prop.extraHits||[])removeTarget(shotProps,target);for(const [wall,cover] of prop.walls){removeTarget(shotProps,wall);cover.alive=false}}else removeTarget(shotProps,prop.hitbox);
 obstaclesDirty=true;
 if(prop.kind===0){
  const heading=vec(prop.x-hero.pos.x,0,prop.z-hero.pos.z).normalize();
  fallen.push({group:prop.group,axis:vec(heading.z,0,-heading.x),yaw:prop.group.quaternion.clone(),heading,age:0,landed:false});
  prop.group.remove(prop.hitbox);
 }else{
  for(const part of prop.group.children){
   if(!part.isMesh||part.geometry===shadowGeometry||part===prop.hitbox)continue;
   breakPart(part,hit,prop.kind===1?2.6:3.4,part.scale.length()>2?.73:1);
  }
  stage.remove(prop.group);
 }
}
function damageProp(prop,amount,hit){
 if(!prop.alive)return;
 prop.hp=Math.max(0,prop.hp-amount);
 if(prop.hp>0){
  prop.shake=.35;prop.impact=amount>1?.12:.053;cracked.add(prop);
  splitTrace(prop,hit);
 }
 prop.weak=null;prop.weakIndex++;
 if(amount>1){
  const weak=amount>=4,extra=weak?2:1;
  if(prop.kind===0)collectPart('planks',extra);
  if(prop.kind===1){collectPart('powder',extra);if(weak)collectPart('quartz',1)}
  if(prop.kind===2){collectPart('parts',extra);if(weak)collectPart('gears',1)}
 }
 const reward=amount>1?6+(amount>=4?4:0):3,bonus=prop.hp<=0?[20,23,25][prop.kind]:0;
 hero.stacks[prop.kind]=Math.min(999,hero.stacks[prop.kind]+reward+bonus);
 const color=materials[prop.kind].color;
 addSparks(hit,color,prop.hp<=0?16:5,prop.hp<=0?4:2.7);
 sound('chip');
 if(prop.hp<=0){
  breakProp(prop,hit);
  }else{
  const part=prop.chippable.shift();
  if(part){
   breakPart(part,hit,amount>1?2.8:1.8);prop.group.remove(part);
  }
  const colorChip=mesh(scene,rock,mat(materials[prop.kind].frame),hit.x,hit.y,hit.z,.14,.15,.11,false);
  breakPart(colorChip,vec(hero.pos.x,0,hero.pos.z),2.4);scene.remove(colorChip);
 }
}
function hurtEnemy(enemy,amount,point,head=false){
 if(!enemy.active)return;
 enemy.hp-=amount;enemy.recoil=.22;
 addSparks(point,head?0xffd390:0xc98aff,head?9:5,3.6);
 state.hit=head?.17:.10;
 if(enemy.hp>0)return;
 enemy.active=false;fieldMetrics.kills++;fieldHollows.add(enemy.kind);
 if(enemy.kind==='boss')addSparks(vec(enemy.x,1.3,enemy.z),0xffcb88,26,7.2);
 else addSparks(vec(enemy.x,.98,enemy.z),0xc491ee,11,4.2);
 scene.remove(enemy.root);
 removeTarget(enemyTargets,enemy.body);removeTarget(enemyTargets,enemy.skull);
 if(enemy.canister)removeTarget(enemyTargets,enemy.canister);
 if(enemy.spirit)enemy.spirit.material.dispose();
 state.takedowns++;
 if(enemy.kind==='boss'){collectPart('cells',4);collectPart('charge',7)}
 else if(state.takedowns%4===0)collectPart('charge',1);
 if(state.takedowns%3===0||enemy.kind==='boss')restock(15);
}
function reload(){
 const gun=currentGun();
 if(state.building||!gun||gun.condition===0||gun===hero.tempGun||hero.reload>0||gun.mag===gun.stats.m||gun.reserve===0)return;
 hero.reload=gun.stats.rl;sound('build');
}
function dropSupplies(){
 if(guest){coopAction('drop-stock');return}
 if(hero.stacks.some(n=>n<10)){notice('Bundle needs 10 of each building material');return}
 const spot=safeFieldPoint(hero.pos.x+2.8*Math.sin(hero.yaw),hero.pos.z+2.8*Math.cos(hero.yaw),.5);
 if(!spot||loot.some(item=>item.active&&item.kind==='bundle'&&Math.hypot(item.x-spot.x,item.z-spot.z)<2))return;
 hero.stacks=hero.stacks.map(n=>n-10);addCache(spot.x,spot.z,'bundle');
}
function craftAmmo(){
 if(guest){coopAction('craft');return}
 if(hero.stacks[1]<6||hero.stacks[2]<4){notice('Ammo: 6 Stone + 4 Metal');return}
 if(guns.every(gun=>gun.reserve>=360)){notice('Reserve is full');return}
 hero.stacks[1]-=6;hero.stacks[2]-=4;restock(60);
 sound('pickup');
}
function switchWeapon(index=(hero.weapon+1)%(guns.length+1)){
 if(hero.tempGun){
  hero.tempGun.model.parent?.remove(hero.tempGun.model);hero.tempGun=null;hero.rotary=0;
 }
 if(index<0||index>guns.length)return;
 if(state.building)toggleBuilding();
 if(guns[index]&&looseAmmo){
  const reserve=Math.min(looseAmmo,360-guns[index].reserve);guns[index].reserve+=reserve;looseAmmo-=reserve;
 }
 hero.weapon=index;hero.reload=0;hero.anim=0;hero.shot=.12;hero.emote=0;hero.swingTime=0;
}
let emoteWheel=null;
function playEmote(){
 if(emoteWheel){emoteWheel();return}
 if(!gear||state.building||state.screen!=='play')return;
 mouseFire=mouseAim=mouseLook=false;keys.clear();
 emoteWheel=options.wheel?.(document,emote=>{
  hero.emote=emote.length;hero.emoteId=emote.id;hero.reload=0;hero.swingTime=0;
 },()=>{emoteWheel=null;canvas.focus({preventScroll:true})});
}
function swing(){
 hero.shot=SWING_DURATION;hero.swingTime=.001;
}
function advancePickaxe(dt){
 if(!hero.swingTime)return;
 const before=hero.swingTime;
 hero.swingTime+=dt;
 if(before<.15&&hero.swingTime>=.15)sound('swing');
 if(before<SWING_CONTACT&&hero.swingTime>=SWING_CONTACT)axeImpact();
 if(hero.swingTime>=SWING_DURATION)hero.swingTime=0;
}
function axeImpact(){
 const origin=vec(hero.pos.x,hero.pos.y+1.16,hero.pos.z);
 const aimedNest=aimed?.object.userData.entity;
 if(aimedNest?.walls&&aimedNest.alive&&origin.distanceTo(aimed.point)<3.25){
  if(guest)coopAction('fire',{axe:true,aim:packVector(aimed.point)});else damageProp(aimedNest,2,aimed.point);
  return;
 }
 if(aimedNest?.type==='nest'&&origin.distanceTo(aimed.point)<3.25){
  if(guest)coopAction('fire',{axe:true,aim:packVector(aimed.point)});
  else hurtNest(aimedNest,67,aimed.point);return;
 }
 const {f,g}=groundPos();
 const candidates=[];
 for(const target of [...props,...enemies]){
  if((target.type==='prop'&&!target.alive)||(target.type==='enemy'&&!target.active))continue;
  const dx=target.x-origin.x,dz=target.z-origin.z,length=Math.hypot(dx,dz);
  if(length>2.85+(target.r||0)*.6||length<.01||(dx*f+dz*g)/length<.45||origin.y>terrainHeight(origin.x,origin.z)+3.2)continue;
  if(target.type==='prop'&&origin.y>target.top+.95)continue;
  if(wallBetween(origin.x,origin.z,target.x,target.z,.02,origin.y))continue;
  const point=vec(target.x,target.type==='prop'?Math.min(origin.y,target.top-.16):terrainHeight(target.x,target.z)+1.04,target.z);
  const score=length-(aimed?.object.userData.entity===target?1.1:0);
  candidates.push({target,point,score});
 }
 candidates.sort((a,b)=>a.score-b.score);
 if(!candidates.length)return;
 const {target,point}=candidates[0];
 viewKick(.19);
 if(guest){coopAction('fire',{axe:true,aim:packVector(point)});return}
 if(target.type==='prop'){
  const weak=isWeakHit(target),impact=weak?weakMark.position.clone():aimed?.object.userData.entity===target?aimed.point:point;
  damageProp(target,(weak?4:2)+(inventory?.pickaxe||0),impact);
  if(weak){state.hit=.23;sound('hit')}
 }
 else {hurtEnemy(target,67+(inventory?.pickaxe||0)*8,point);sound('hit')}
 rumble(.19,62);
}
const shotRight=vec(),shotUp=vec();
function attack(){
 if(hero.shot>0||hero.emote>0)return;
 const gun=currentGun();
 if(!gun){swing();return}
 if(hero.reload>0)return;
 if(gun.condition===0){notice('Weapon broken · recraft it from a schematic in the Field Kit');hero.shot=.42;return}
 if(gun.mag<=0){
  reload();
  if(hero.reload===0){notice('Out of ammo');sound('empty','Out of ammo');hero.shot=.36}
  return;
 }
 const {r,pel,sp,d}=gun.stats;
 gun.mag--;if(Number.isFinite(gun.condition)){gun.condition=Math.max(0,gun.condition-.36);if(gun.condition===0){persistField();notice('Weapon broken · use the Field Kit to craft another.')}}
 hero.heat=Math.min(1,hero.heat+.13);hero.shot=Math.max(.058,r*(hero.shout>0?.76:1));hero.flash=.045;hero.anim=.53;
 const muzzle=(gun.muzzle||actor.muzzle).getWorldPosition(vec());
 const direction=groundPos();
 const origin=vec(hero.pos.x+direction.f*.24,hero.pos.y+1.42,hero.pos.z+direction.g*.24);
 viewKick(.09+(gun.stats.pel||1)*.016);
 if(guest){
  coopAction('fire',{aim:packVector(aimPoint),muzzle:packVector(muzzle),damage:d*Math.min(3,(pel||1))*1.24,element:gun.element});
  tracer(muzzle,aimPoint,gun.element);fieldShot(gun.k);rumble(.13,42);return;
 }
 if(coop)sendGame('trace',{from:packVector(muzzle),to:packVector(aimPoint),owner:coop.id,element:gun.element,weapon:gun.k});
 const range=origin.distanceTo(aimPoint),spread=(sp||0)*(hero.aim?.57:1);
 shotRight.setFromMatrixColumn(camera.matrixWorld,0);
 shotUp.setFromMatrixColumn(camera.matrixWorld,1);
 const impacts=new Map();
 for(let i=0;i<(pel||1);i++){
  const point=aimPoint.clone();
  if(i>0||range>20){
   point.addScaledVector(shotRight,(rand()-.5)*range*spread);
   point.addScaledVector(shotUp,(rand()-.5)*range*spread);
  }
  const impact=shotFrom(origin,point),end=impact?.point||point;
  if(i<3)tracer(muzzle,end,gun.element);
  const target=impact?.object?.userData.entity;
  if(!target)continue;
  if(!impacts.has(target))impacts.set(target,{damage:0,head:false,canister:false,end});
  const entry=impacts.get(target),critical=!!impact.object.userData.head;
  const falloff=Math.max(.56,1-impact.distance/(pel>1?54:160));
  const power=target.type==='enemy'?clamp(1+(gun.power-target.power)*.019,.66,1.63):1;
  const crit=rand()<gun.blueprint.crit;
  const core=gun.blueprint.core==='Sustained Fire'?1+.22*hero.heat:1;
  entry.damage+=d*1.28*(critical?1.64:1)*(crit?gun.blueprint.critMulti:1)*falloff*power*core*(hero.shout>0?1.19:1);entry.head||=critical;
  entry.canister||=impact.object.userData.canister;
 }
 for(const [target,{damage,head,canister,end}] of impacts){
  if(target.type==='enemy'){
   if(canister&&target.kind==='demolisher'){detonateHollow(target);continue}
   const dealt=damage*engineering.damageFactor(gun.element,target.element);
   hurtEnemy(target,dealt,end,head);sound('hit');
   if(gun.blueprint.core==='Affliction'&&target.active)
    target.affliction={amount:dealt*.19,element:gun.element,remaining:2.4,next:.6};
   if(gun.blueprint.core==='Headshot Burst'&&head&&!target.active)
    abilityBlast(end,44,2.1,gun.element);
  }
  else if(target.type==='prop')damageProp(target,1,end);
  else if(target.type==='nest')hurtNest(target,damage,end);
  else if(target.type==='balloon')expeditionHit(target);
  else addSparks(end,0xffd08e,4,2.2);
 }
 fieldShot(gun.k);rumble(.13,42);
}
function canEditHere(item,mask){
 if(item.piece!==0)return true;
 const playerOccupies=panel=>hero.pos.y+1.65>panel.bottom&&hero.pos.y<panel.top&&rectDistance(hero.pos.x,hero.pos.z,panel)<.31;
 for(let bit=0;bit<9;bit++){
  if(!engineering.present(mask^item.mask,bit)||!engineering.present(mask,bit))continue;
  const panel=panelRect(item,bit);
  if(playerOccupies(panel)||enemies.some(e=>e.active&&panel.bottom<terrainHeight(e.x,e.z)+1.5&&rectDistance(e.x,e.z,panel)<e.r))return false;
 }
 return true;
}
function renderEdit(){
 const edit=state.edit;if(!edit)return;
 const {item,mask}=edit;
 const valid=engineering.connectedMask(item.piece,mask),clear=valid&&canEditHere(item,mask);
 ui['edit-apply'].disabled=!clear||mask===item.mask;
 for(const cell of ui['edit-grid'].children)cell.setAttribute('aria-pressed',String(engineering.present(mask,+cell.dataset.bit)));
 text(ui['edit-status'],!valid?'Keep a connected surface':!clear?'Edit is obstructed':'');
 clearGhost(editGhost);
 if(mask)panels(editGhost,{piece:item.piece,mask,rank:item.rank},true);
 ghostSkin.color.setHex(clear?0x5dbeff:0xf38282);
 ghostOutline.color.setHex(clear?0x9cdeff:0xffa49b);
 editGhost.position.copy(item.group.position);editGhost.rotation.copy(item.group.rotation);editGhost.visible=true;
}
function openEditor(){
 const item=aimed?.object.userData.entity;
 if(state.edit||state.paused||item?.type!=='structure'||item.piece===3||item.construction>0||aimed.distance>13){
  notice('Aim at a completed structure');return;
 }
 const n=engineering.dimensions(item.piece);
 state.edit={item,mask:item.mask,paint:null};
 state.mouse=false;mouseFire=mouseAim=mouseLook=false;hero.reload=0;hero.swingTime=0;
 keys.clear();if(document.pointerLockElement===canvas)document.exitPointerLock();
 ui.edit.hidden=false;text(ui['edit-name'],'Edit '+pieces[item.piece]);
 const grid=ui['edit-grid'];
 grid.style.setProperty('--count',n);
 grid.replaceChildren();
 for(let row=n-1;row>=0;row--)for(let col=0;col<n;col++){
  const cell=document.createElement('button'),bit=row*n+col;
  cell.type='button';cell.dataset.bit=bit;
  cell.setAttribute('aria-label','Panel '+(bit+1));
  cell.onclick=event=>{if(event.detail===0)togglePanel(bit)};
  grid.append(cell);
 }
 item.group.visible=false;
 structureBatchDirty=true;
 renderEdit();
 grid.firstElementChild.focus({preventScroll:true});
}
function closeEditor(lock){
 if(!state.edit)return;
 const item=state.edit.item;state.edit=null;
 item.group.visible=true;
 structureBatchDirty=true;
 editGhost.visible=false;clearGhost(editGhost);
 ui.edit.hidden=true;
 if(lock)requestMouse();
 else canvas.focus({preventScroll:true});
}
function togglePanel(bit,placePanel){
 if(!state.edit)return;
 const change=1<<bit,mask=state.edit.mask;
 state.edit.mask=placePanel===undefined?mask^change:placePanel?mask|change:mask&~change;
 renderEdit();
}
function applyEdit(lock){
 const edit=state.edit;
 if(!edit||ui['edit-apply'].disabled||!canEditHere(edit.item,edit.mask))return;
 const {item,mask}=edit;
 if(guest){coopAction('edit',{key:item.key,mask});closeEditor(lock);return}
 item.mask=mask;item.contacts=engineering.contacts(item);
 closeEditor(lock);
 rebuildStructure(item);refreshSupport();sound('build');
}
ui['edit-reset'].onclick=()=>{
 if(!state.edit)return;
 state.edit.mask=engineering.fullMask(state.edit.item.piece);renderEdit();
};
ui['edit-cancel'].onclick=()=>closeEditor(state.look==='keys');
ui['edit-apply'].onclick=()=>applyEdit(state.look==='keys');
listen(ui['edit-grid'],'pointerdown',event=>{
 const bit=event.target.dataset.bit;
 if(!state.edit||bit===undefined||event.button!==0)return;
 state.edit.paint=!engineering.present(state.edit.mask,+bit);togglePanel(+bit,state.edit.paint);
});
listen(ui['edit-grid'],'pointerover',event=>{
 const bit=event.target.dataset.bit;
 if(state.edit&&event.buttons&1&&bit!==undefined&&state.edit.paint!==null)togglePanel(+bit,state.edit.paint);
});
listen(window,'pointerup',()=>{if(state.edit)state.edit.paint=null});
function editPad(edge){
 const list=[...ui['edit-grid'].children,...ui['edit-actions'].querySelectorAll('button:not(:disabled)')];
 let index=list.indexOf(fieldFocus());
 const move=edge(14)?-1:edge(15)?1:edge(12)?-engineering.dimensions(state.edit.item.piece):edge(13)?engineering.dimensions(state.edit.item.piece):0;
 if(move)list[(index+move+list.length)%list.length]?.focus({preventScroll:true});
 if(edge(padFamily==='ns'?1:0)){
  const active=fieldFocus();
  if(active?.dataset.bit!==undefined)togglePanel(+active.dataset.bit);
  else if(active===ui['edit-apply'])applyEdit(false);
  else active?.click();
 }
 if(edge(padFamily==='ns'?0:1)||edge(11))closeEditor(false);
 if(edge(2))applyEdit(false);
}
function fortify(){
 if(guest){coopAction('repair',{aim:packVector(aimPoint)});return}
 const item=aimed?.object.userData.entity;
 if(item?.type==='atlas'&&objectiveDistance(hero.pos.x,hero.pos.z)<8.5&&['prep','fuel','payload'].includes(state.phase)){
  const max=state.mission==='payload'?PAYLOAD_HP:ATLAS_HP;
  if(state.atlas===max){notice('Integrity is full');return}
  if(!hero.repairs||hero.stacks[2]<12){notice(hero.repairs?'Repair needs 12 Alloy':'Repair kits used');return}
  hero.repairs--;hero.stacks[2]-=12;state.atlas=Math.min(max,state.atlas+215);
  sound('build');return;
 }
 if(item?.type!=='structure'||aimed.distance>12||item.construction>0){notice('Aim at a completed structure');return}
 if(item.piece===3&&item.life<Math.round(item.recipe.charges*item.calibration.mag)){
  if(hero.stacks[2]<4){notice('Trap refill needs 4 Alloy');return}
  hero.stacks[2]-=4;item.life=Math.min(Math.round(item.recipe.charges*item.calibration.mag),item.life+4);
  sound('build');return;
 }
 const index=materials.indexOf(item.material);
 const upgrade=item.hp>=item.max&&item.piece!==3&&item.rank<3;
 if(item.hp>=item.max&&!upgrade){notice('Already at full strength');return}
 const rate=[.041,.029,.020][item.rank-1];
 const cost=upgrade?8+item.rank*4:Math.max(1,Math.ceil((item.max-item.hp)*rate));
 if(hero.stacks[index]<cost){notice('Need '+cost+' '+item.material.name);return}
 hero.stacks[index]-=cost;
 if(upgrade){
  item.rank++;item.max=Math.round(item.material.hp*[1,1.5,2.15][item.rank-1]);
  rebuildStructure(item);
 }
 item.hp=item.max;
 sound('build');
}
const abilityTables={
 Vanguard:[['Cluster Grenade',17],['Rotary Minigun',32],['Battle Shout',26],['Concussion Blast',24]],
 Architect:[['Aegis Core',28],['Bull Charge',15],['Holodecoy',22],['Plasma Surge',23]],
 Shadow:[['Void Slash',12],['Shuriken Fan',11],['Smoke Veil',25],['Crescent Kick',15]],
 Prospector:[['Seismic Punch',12],['Phase Blink',9],['A.U.T.O. Turret',26],['Shock Tower',22]]
};
const gadgets=[];
const abilityCooldown=[0,0,0,0];
const dashHits=new Set();
const selectedAbility=()=>abilityTables[squad.lead.className][state.ability];
let aegisTiles=new Set();
const operativeForward=()=>vec(-Math.sin(hero.yaw),0,-Math.cos(hero.yaw));
function labelledAbility(index){
 return abilityTables[squad.lead.className][index];
}
function useAbility(index=state.ability){
 if(state.paused||state.edit||state.building)return;
 state.ability=index;
 const [,seconds]=labelledAbility(index);
 if(abilityCooldown[index]>0)return;
 const klass=squad.lead.className;
 const local=klass==='Vanguard'&&(index===1||index===2)||klass==='Architect'&&index===1||klass==='Shadow'&&index===0||klass==='Prospector'&&index===1;
 const moved=guest&&!local?true:performAbility(klass,index);
 if(moved&&guest&&!local){coopAction('ability',{klass,index,aim:packVector(aimPoint)});return}
 if(!moved)return;
 abilityCooldown[index]=seconds;
 sound('pulse');rumble(.48,110);
}
function unitCandidates(origin,range){
 return enemies.filter(enemy=>enemy.active&&origin.distanceToSquared(enemyPoint(enemy,.45))<range*range)
  .sort((a,b)=>origin.distanceToSquared(enemyPoint(a,.45))-origin.distanceToSquared(enemyPoint(b,.45)));
}
function chainAt(origin,targets,force,element){
 for(const enemy of targets){
  if(!enemy.active)continue;
  const point=enemyPoint(enemy,1);
  trapLine(origin,point,elementColors[element]);
  trapDamage(enemy,force,element);
  origin=point;
 }
}
function compactGadget(kind,position,seconds){
 const group=groupAt(scene,position.x,position.y,position.z);
 const tint={aegis:0x80dbc5,decoy:0x97e0e6,turret:0xe9ba8c,tower:0x8acded,smoke:0xa28bc7}[kind];
 const light=mat(tint,tint),base=mat(0x324956);
 if(kind==='decoy'){
  mesh(group,sphere,light,0,1.44,0,.21,.24,.21);
  block(group,light,0,1.04,0,.45,.56,.23);
  for(const side of [-1,1]){
   block(group,light,side*.31,1.06,0,.101,.46,.12);
   block(group,light,side*.14,.43,0,.16,.69,.18);
  }
 }else if(kind!=='smoke'){
  mesh(group,hex,base,0,.14,0,.57,.20,.57);
  mesh(group,cyl,base,0,.42,0,.23,.46,.23);
  if(kind==='turret'){
   for(const x of [-.23,.23]){
    block(group,base,x,.7,.03,.29,.30,.76);
    block(group,light,x,.7,.45,.09,.12,.24);
   }
  }else mesh(group,gem,light,0,.78,0,.22,.32,.22,false);
 }
 const halo=glow(group,tint,0,kind==='smoke'?.65:.66,0,kind==='smoke'?5.1:2.1,kind==='smoke'?3.2:2.1,.54);
 const gadget={kind,group,halo,x:position.x,y:position.y,z:position.z,hp:215,seconds,next:0};
 gadgets.push(gadget);
 return gadget;
}
function projectGadget(distance){
 const start=hero.pos.clone(),forward=operativeForward();
 let reach=0;
 for(let t=.30;t<=distance;t+=.25){
  const x=start.x+forward.x*t,z=start.z+forward.z*t,y=Math.max(start.y,terrainHeight(x,z));
  if(playerBlocked(x,z,y))break;
  reach=t;
 }
 if(reach<.8)return null;
 const point=start.addScaledVector(forward,reach);
 point.y=floorAt(point.x,point.z,point.y+.34);
 return point;
}
function primeDash(mode){
 if(hero.dash>0)return false;
 hero.dash=mode==='bull'?.68:.55;hero.dashKind=mode;
 hero.dashHeading=operativeForward();dashHits.clear();
 return true;
}
function summonRotary(){
 if(hero.rotary>0)return false;
 const model=groupAt(gear?.model||actor.root);
 const body=mat(0x3b4b55,0,.32),metal=mat(0x71808c,0,.38),amber=mat(0xe1ae68,0xc68241);
 block(model,body,0,-.05,.3,.38,.31,.83);
 mesh(model,cyl,metal,0,-.07,.73,.174,.24,.174).rotation.x=Math.PI/2;
 for(let i=0;i<6;i++){
  const angle=i*Math.PI/3;
  const barrel=mesh(model,cyl,metal,Math.cos(angle)*.095,Math.sin(angle)*.095-.07,1.0,.036,.61,.036);
  barrel.rotation.x=Math.PI/2;
 }
 block(model,amber,.201,-.043,.33,.022,.085,.22,false);
 const muzzle=groupAt(model,0,-.07,1.34);
 model.userData.a={r:[0,-.15,.01],l:[0,-.092,.5],m:[0,-.14,.31]};
 model.userData.fit={s:.72,gz:.22,mz:1.34};model.userData.mags=[];
 const stats={d:24,m:125,au:1,r:.052,rl:1.8,pel:1,sp:.037};
 hero.tempGun=armWeapon({k:'rotary',model,muzzle,name:'Rotary Minigun',stats},Math.max(17,squad.power),'Kinetic');
 hero.rotary=9;hero.reload=0;hero.shot=0;hero.swingTime=0;return true;
}
function performAbility(name,index){
 const forward=operativeForward(),center=hero.pos.clone().add(vec(0,.57,0));
 if(name==='Vanguard'){
  if(index===0){
   const velocity=forward.multiplyScalar(11.4);velocity.y=6.4;
   trapProjectile('cluster',center.clone().add(vec(0,.66,0)),velocity,.19,1.05,76,'Scorch');
  }else if(index===1)return summonRotary();
  else if(index===2){
   hero.shout=9;
   addSparks(center,0xf9ce89,33,5.7);
  }else{
   pulse(true);
   for(const e of unitCandidates(center,7.8)){
    const dx=e.x-center.x,dz=e.z-center.z,length=Math.hypot(dx,dz)||1;
    knockHollow(e,dx/length,dz/length,91,1.05);
   }
  }
  return true;
 }
 if(name==='Architect'){
  if(index===0){
   const item=aimed?.object.userData.entity;
   if(item?.type!=='structure'||item.piece===3||item.construction>0||aimed.distance>12){
    notice('Aim at a friendly structure');return false;
   }
   const core=compactGadget('aegis',vec(item.x,item.y+.3,item.z),14);
   core.mount=item;
  }else if(index===1)return primeDash('bull');
  else if(index===2){
   const point=projectGadget(5);
   if(!point)return false;
   compactGadget('decoy',point,12);
  }else chainAt(center,unitCandidates(center,9.5).slice(0,5),96,'Volt');
  return true;
 }
 if(name==='Shadow'){
  if(index===0)return primeDash('void');
  if(index===1){
   const angle=hero.yaw;
   for(let i=-2;i<=2;i++){
    const turn=angle+i*.138;
    trapProjectile('dart',center.clone().add(vec(0,.56,0)),vec(-Math.sin(turn)*22,0,-Math.cos(turn)*22),.13,.52,55,'Aether');
   }
  }else if(index===2){
   const cloud=compactGadget('smoke',hero.pos.clone(),8.4);
   cloud.next=.12;
  }else for(const e of unitCandidates(center,3.35)){
   const vector=vec(e.x-center.x,0,e.z-center.z).normalize();
   if(vector.dot(forward)<-.1)continue;
   trapDamage(e,103,'Kinetic');knockHollow(e,vector.x,vector.z,92,1.1);
  }
  return true;
 }
 if(index===0){
  const targets=props.filter(prop=>prop.alive&&Math.hypot(prop.x-center.x,prop.z-center.z)<4.25&&
   vec(prop.x-center.x,0,prop.z-center.z).normalize().dot(forward)>.06&&
   !wallBetween(center.x,center.z,prop.x,prop.z,.05,center.y));
  if(!targets.length){notice('Aim toward harvestable terrain');return false}
  for(const prop of targets)damageProp(prop,Math.max(prop.max,4),vec(prop.x,Math.min(prop.top,prop.y+.75),prop.z));
 }else if(index===1){
  const point=projectGadget(6.5);
  if(!point)return false;
  addSparks(center,0xc0a0f3,15,3.3);hero.pos.copy(point);hero.vy=0;cameraTick(0);
 }else{
  if(index===2&&!fieldBag.charge){notice('Need a Charge Fragment');return false}
  const point=projectGadget(index===2?4.4:3.6);
  if(!point)return false;
  if(index===2)fieldBag.charge--;
  const gadget=compactGadget(index===2?'turret':'tower',point,index===2?16:7.2);
  gadget.next=.22;
 }
 return true;
}
function updateGadgets(dt){
 for(let i=0;i<abilityCooldown.length;i++)abilityCooldown[i]=Math.max(0,abilityCooldown[i]-dt);
 aegisTiles=new Set();
 if(hero.rotary>0){
  hero.rotary=Math.max(0,hero.rotary-dt);
  if(!hero.rotary||hero.tempGun.mag<=0){
   hero.rotary=0;
   const gun=hero.tempGun;
   gun.model.parent?.remove(gun.model);
   hero.tempGun=null;
  }
 }
 for(let i=gadgets.length-1;i>=0;i--){
  const gadget=gadgets[i];
  gadget.seconds-=dt;gadget.next-=dt;
  if(gadget.seconds<=0||gadget.hp<=0||gadget.mount&&!builds.has(gadget.mount.key)){
   scene.remove(gadget.group);gadget.halo.material.dispose();gadgets.splice(i,1);continue;
  }
  const at=vec(gadget.x,gadget.y+(gadget.kind==='turret'?.7:.46),gadget.z);
  if(gadget.kind==='aegis'){
   const pending=[gadget.mount],component=new Set(pending);
   for(let k=0;k<pending.length;k++)for(const item of supportedBuilds.neighbors.get(pending[k])||[]){
    if(!builds.has(item.key)||component.has(item))continue;
    component.add(item);pending.push(item);
   }
   for(const item of component){
    aegisTiles.add(item);
    if(gadget.next<=0)item.hp=Math.min(item.max,item.hp+7+squad.vital.Aptitude*.07);
   }
   if(gadget.next<=0)gadget.next=1;
  }else if(gadget.next<=0&&gadget.kind==='turret'){
   const target=unitCandidates(at,12).find(e=>!wallBetween(at.x,at.z,e.x,e.z,.035,at.y)&&
    !solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,at.x,at.z,e.x,e.z,.04)));
   if(!target)continue;
   gadget.next=.28;
   gadget.group.rotation.y=Math.atan2(target.x-at.x,target.z-at.z);
   const end=enemyPoint(target,.91);
   for(const side of [-1,1]){
    const port=vec(side*.23,.70,.54).applyAxisAngle(vec(0,1,0),gadget.group.rotation.y).add(gadget.group.position);
    trapLine(port,end,0xf6c68e);
   }
   trapDamage(target,38,'Kinetic');
  }else if(gadget.next<=0&&gadget.kind==='tower'){
   gadget.next=1.45;
   const targets=unitCandidates(at,5.7);
   chainAt(at,targets,62,'Volt');
   for(const target of targets)target.stun=Math.max(target.stun,.96);
  }else if(gadget.next<=0&&gadget.kind==='smoke'){
   gadget.next=.65;
   abilityBlast(at,35,3.75,'Aether');
  }
 }
}
function afterDash(dt){
 if(hero.dash<=0)return;
 for(const enemy of unitCandidates(hero.pos.clone().add(vec(0,.70,0)),1.88)){
  if(dashHits.has(enemy))continue;
  dashHits.add(enemy);
  if(guest){coopAction('dashHit',{enemy:enemy.netId,kind:hero.dashKind});continue}
  trapDamage(enemy,hero.dashKind==='bull'?61:122,hero.dashKind==='bull'?'Kinetic':'Aether');
  knockHollow(enemy,hero.dashHeading.x,hero.dashHeading.z,93,.70);
 }
 hero.dash=Math.max(0,hero.dash-dt);
}
function pulse(ability=false){
 if(!ability&&hero.pulse>0){notice('Shock pulse recharges in '+Math.ceil(hero.pulse)+' s');return}
 if(!ability)hero.pulse=24;
 const y=hero.pos.y+.105;
 const mat=new T.MeshBasicMaterial({color:0x78eee1,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide});
 const wave=new T.Mesh(new T.RingGeometry(.86,1,48),mat);
 wave.position.set(hero.pos.x,y,hero.pos.z);wave.rotation.x=-Math.PI/2;
 effect(wave,.48,t=>{wave.scale.setScalar(.8+(1-t)*7.8);mat.opacity=t*.85});
 for(const enemy of enemies){
  if(!enemy.active||Math.hypot(hero.pos.x-enemy.x,hero.pos.z-enemy.z)>7.8||hero.pos.y>=3.8)continue;
  enemy.stun=enemy.kind==='boss'?.8:2.35;
  hurtEnemy(enemy,enemy.kind==='boss'?63:92,vec(enemy.x,1,enemy.z));
 }
 sound('pulse');rumble(.66,225);
}

function hurtHero(amount){
 if(state.finished||guest||hero.hp<=0)return;
 const shield=Math.min(hero.shield,amount);
 hero.shield-=shield;hero.hp=Math.max(0,hero.hp-(amount-shield));hero.hitAgo=0;
 if(!remoteSeat){state.damage=.7;sound('hurt');rumble(.49,110);viewKick(.22)}
 if(hero.hp<=0){
  if(!coop){finish(false,'You were downed');return}
  if(remoteSeat){remoteSeat.down=true;remoteSeat.updateLabel(true);sendGame('feedback',{line:'Down · Wait for a squadmate'},remoteSeat.id)}
  else notice('Down · Wait for a squadmate');
 }
}
function hurtAtlas(amount){
 if(!atlasBody.alive||state.finished)return;
 state.atlas=Math.max(0,state.atlas-amount);
 if(state.atlas===0)finish(false,state.mission==='payload'?'The recovery pod was lost':state.mission==='seal'?'The Rift Anchor failed':'The Signal Relay went offline');
}
function hurtStructure(item,amount,attacker=null){
 if(aegisTiles.has(item)){
  if(attacker?.active)hurtEnemy(attacker,amount*.24,enemyPoint(attacker,.48));
  amount*=.68;
 }
 item.hp=Math.max(0,item.hp-amount);
 addSparks(vec(item.x,item.y+.8,item.z),item.material.color,3,2);
 if(item.hp===0)removeStructure(item);
}
function blast(origin,force,radius,element,source=null){
 addSparks(origin,elementColors[element],36,9.1);
 sound('pulse');rumble(.54,135);
 for(const item of [...builds.values()]){
  const d=origin.distanceTo(vec(item.x,item.y+(item.piece===0?LEVEL*.45:0),item.z));
  if(d<radius&&builds.has(item.key))hurtStructure(item,force*(1-d/radius)*engineering.structureFactor(element,item.material.id));
 }
 for(const enemy of enemies){
  if(enemy===source||!enemy.active)continue;
  const d=origin.distanceTo(enemyPoint(enemy,.55));
  if(d<radius)hurtEnemy(enemy,force*.92*(1-d/radius)*engineering.damageFactor(element,enemy.element),enemyPoint(enemy,.63));
 }
 const atlas=origin.distanceTo(vec(ox,1.25,oz));
 if(atlas<radius+1.1)hurtAtlas(force*(1-atlas/(radius+1.1)));
 const player=origin.distanceTo(hero.pos.clone().add(vec(0,1.1,0)));
 if(player<radius)hurtHero(force*.95*(1-player/radius));
 if(coop)for(const m of mates.values()){
  const d=origin.distanceTo(m.target.clone().add(vec(0,1.1,0)));
  if(d<radius&&m.ready)damageMate(m,force*.95*(1-d/radius));
 }
}
function detonateHollow(enemy){
 if(!enemy.active)return;
 const origin=enemyPoint(enemy,.75);
 hurtEnemy(enemy,enemy.hp,origin);
 blast(origin,96,5,enemy.element==='Kinetic'?'Scorch':enemy.element,enemy);
}
function castArtillery(enemy){
 const origin=enemyPoint(enemy,1.35);
 const roofs=[...builds.values()].filter(item=>item.piece!==3&&item.layer>=1&&objectiveDistance(item.x,item.z)<7.8);
 roofs.sort((a,b)=>b.y-a.y);
 const roof=roofs[0];
 const end=roof?vec(roof.x,roof.y+.2,roof.z):vec(ox,1.65,oz);
 const air=Math.max(1.5,Math.min(2.8,origin.distanceTo(end)/10));
 const velocity=end.clone().sub(origin).multiplyScalar(1/air);
 velocity.y+=8.75*air;
 const shell=trapProjectile('mortar',origin,velocity,.29,air+.84,enemyDamage(enemy)*1.52,enemy.element==='Kinetic'?'Scorch':enemy.element);
 shell.source=enemy;shell.target=end;shell.arc=air;
}
function tossShambler(catapult,shambler){
 const distance=objectiveDistance(shambler.x,shambler.z),length=Math.max(distance,.01),flight=1.18+distance*.027;
 const from=vec(shambler.x,terrainHeight(shambler.x,shambler.z),shambler.z);
 const end=vec(ox+(shambler.x-ox)/length*2.42,0,oz+(shambler.z-oz)/length*2.42);
 shambler.hurl={from,end,flight,t:0};
 shambler.hitIn=Math.max(shambler.hitIn,flight+.40);
 catapult.hitIn=8.3;
 addSparks(enemyPoint(catapult),0xf5b88d,12,3.6);
}
function castBolt(enemy,target,focus=hero.pos){
 const y=terrainHeight(enemy.x,enemy.z)+1.29*enemy.stats.scale;
 const start=vec(enemy.x,y,enemy.z);
 const group=groupAt(scene,start.x,start.y,start.z);
 mesh(group,gem,mat(0xb3ff9d,0x80ea7c),0,0,0,.145,.17,.145,false);
 const flare=glow(group,0xb2ffb3,0,0,0,1.24,1.24,.55);
 const direction=target==='hero'?vec(focus.x,focus.y+1.04,focus.z):vec(ox,1.48,oz);
 direction.sub(start).normalize().multiplyScalar(9.8);
 bolts.push({group,flare,v:direction,life:2.65,damage:enemyDamage(enemy),element:enemy.element});
}
function moveBolts(dt){
 for(let i=bolts.length-1;i>=0;i--){
  const bolt=bolts[i],pos=bolt.group.position,tx=pos.x+bolt.v.x*dt,tz=pos.z+bolt.v.z*dt;
  const wall=wallBetween(pos.x,pos.z,tx,tz,.07,pos.y);
  bolt.life-=dt;
  let hit=false;
  const mate=coop&&[...mates.values()].find(m=>m.ready&&m.vitals.hp>0&&pos.y>m.target.y&&pos.y<m.target.y+1.82&&Math.hypot(tx-m.target.x,tz-m.target.z)<.5);
  if(wall){hurtStructure(wall,bolt.damage*engineering.structureFactor(bolt.element,wall.material.id));hit=true}
  else if(solidProps.some(p=>p.alive&&p.type==='cover'&&pos.y<p.top&&coverAt(p,tx,tz,.06)))hit=true;
  else if(mate){damageMate(mate,bolt.damage);hit=true}
  else if(hero.hp>0&&pos.y>hero.pos.y&&pos.y<hero.pos.y+1.82&&Math.hypot(tx-hero.pos.x,tz-hero.pos.z)<.48){
   hurtHero(bolt.damage);hit=true;
  }else if(atlasBody.alive&&pos.y>0&&pos.y<atlasBody.top&&objectiveDistance(tx,tz)<1.7){
   hurtAtlas(bolt.damage);hit=true;
  }
  if(hit||bolt.life<=0||pos.y<0){
   if(hit)addSparks(pos,0xa2ed90,5,2.6);
   scene.remove(bolt.group);
   bolt.flare.material.dispose();bolts.splice(i,1);
  }else pos.addScaledVector(bolt.v,dt);
  if(state.finished)return;
 }
}
function addFluxCrystals(){
 const sites=state.mission==='defense'
  ?[[-16,13],[16,-12]]
  :[[-12,12],[14,-9],[-13,-16]];
 for(const [gx,gz] of sites){
  const site=safeFieldPoint(gx+(rand()-.5)*5,gz+(rand()-.5)*4,.8)||safeFieldPoint(gx,gz,.65);
  if(site)addFluxAt(site.x,site.z);
  else addFluxAt(0,gz);
 }
}
function addFluxAt(x,z){
 const y=terrainHeight(x,z),group=groupAt(stage,x,y,z);
 const glowMat=mat(0xa3e4d2,0x6ccfc0,.24);
 mesh(group,rock,steel,0,.16,0,.47,.24,.42);
 mesh(group,gem,glowMat,0,.63,0,.22,.52,.22,false);
 const marker=mesh(group,gem,glowMat,0,1.44,0,.12,.18,.12,false);
 const flare=glow(group,0x98e9d3,0,.7,0,2.8,2.3,.51);
 loot.push({x,y,z,kind:'flux',active:true,group,marker,flare});
}
function activePickups(dt){
 for(const item of loot){
  if(!item.active)continue;
  item.marker.rotation.y+=dt*1.6;
  item.marker.position.y=1.36+Math.sin(state.elapsed*3+item.x)*.21;
  if(guest||hero.hp<=0||(item.kind==='chest'||item.kind==='weapon'))continue;
  if(Math.abs(hero.pos.y-item.y)>1.9||Math.hypot(hero.pos.x-item.x,hero.pos.z-item.z)>1.74||
    wallBetween(hero.pos.x,hero.pos.z,item.x,item.z,.02,hero.pos.y+.42))continue;
  item.active=false;stage.remove(item.group);item.flare.material.dispose();
  if(item.kind==='bundle'){hero.stacks=hero.stacks.map(n=>Math.min(999,n+10))}
  else if(item.kind==='flux'){
   state.flux++;
   if(state.mission==='defense'){
    if(state.flux===2)state.phase='prep';
    if(state.flux===2)notice('Relay powered · Fortify the marked front');
   }else if(state.mission==='seal'&&state.flux===3)notice('Return to the Rift Anchor');
  }else if(item.kind==='cache'){
   hero.cache++;fieldMetrics.caches++;
   hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+[20,15,10][i]));
   restock(36);
  }else{
   fieldMetrics.caches++;
   hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+[30,20,15][i]));
   restock(90);
   hero.hp=Math.min(hero.maxhp,hero.hp+38);hero.shield=Math.min(hero.maxShield,hero.shield+28);
  }
  sound('pickup');
 }
}
const trapFields=[];
function trapVisual(item){
 const {group,recipe}=item,mount=recipe.mount;
 const color={Kinetic:0xb8afb0,Aether:0xbd87df,Scorch:0xef9054,Volt:0x74d9ee,Frost:0x9ceaff}[recipe.element];
 const shell=mat(0x334b55,0,.3),hot=mat(color,color,.18),side=GRID*.69;
 if(recipe.id==='rime'){
  const base=block(group,shell,0,0,0,1.5,.18,1.5);
  for(let i=0;i<6;i++)mesh(group,gem,hot,.55*Math.cos(i*TAU/6),-.38,.55*Math.sin(i*TAU/6),.15,.57,.15);
  return [base];
 }
 if(recipe.id==='winch'){
  const base=block(group,shell,0,0,0,1.7,1,.22);
  const spool=mesh(group,cyl,hot,0,0,.38,.37,1.2,.37);spool.rotation.z=Math.PI/2;
  return [base];
 }
 if(mount==='wall'){
  const base=block(group,shell,0,0,.035,side,GRID*.52,.16);
  for(const s of [-1,1])block(group,hot,s*side*.31,0,.14,.09,GRID*.36,.08);
  for(let i=-1;i<=1;i++){
   const head=mesh(group,cyl,hot,i*.55,0,.16,.13,.29,.13);
   head.rotation.x=Math.PI/2;
  }
  return [base];
 }
 const below=mount==='ceiling',sideY=below?-1:1;
 const base=block(group,shell,0,sideY*.05,0,side,.17,side);
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){
  const detail=mesh(group,recipe.id==='spikes'?cone:hex,hot,i*side*.29,sideY*.23,j*side*.29,.13,.28,.13);
  if(below)detail.rotation.z=Math.PI;
 }
 return [base];
}
function enemyPoint(enemy,height=.9){
 return vec(enemy.x,terrainHeight(enemy.x,enemy.z)+enemy.air+height*enemy.stats.scale,enemy.z);
}
function trapDamage(enemy,force,element,item){
 if(element==='Scorch'){
  for(const trap of builds.values())if(trap.recipe?.id==='tar'&&trap.pool>0&&trap.burning<=0&&
   Math.hypot(trap.x-enemy.x,trap.z-enemy.z)<trap.recipe.range+.38)igniteTar(trap);
 }
 const tune=item?.calibration,alignment=tune?.element||element;
 const critical=tune&&rand()<tune.crit?tune.critMulti:1;
 const amount=force*(tune?.boost??1)*critical*(1+(squad.vital.Aptitude-10)*.005)*engineering.damageFactor(alignment,enemy.element);
 hurtEnemy(enemy,amount,enemyPoint(enemy,.6));
 if(tune?.core==='Affliction'&&enemy.active)enemy.affliction={amount:amount*.18,remaining:2.4,next:.6};
}
function trapLine(a,b,color){
 const geometry=new T.BufferGeometry().setFromPoints([a,b]);
 const material=new T.LineBasicMaterial({color,transparent:true,opacity:.9});
 effect(new T.Line(geometry,material),.19,t=>{material.opacity=t*.92});
}
function trapProjectile(kind,origin,velocity,radius,life,dmg,element){
 const model=mesh(scene,kind==='dart'?gem:kind==='tire'?tire:sphere,
  mat(kind==='dart'?0xffd49c:kind==='tire'?0x27313b:0xe49b6e),
  origin.x,origin.y,origin.z,radius,kind==='dart'?radius*2.6:radius,radius,false);
 if(kind==='tire')model.rotation.z=Math.PI/2;
 if(kind==='dart')model.quaternion.setFromUnitVectors(vec(0,1,0),velocity.clone().normalize());
 const body=kind!=='dart'&&physics?physics.ball(origin,velocity,radius,kind!=='mortar'):null;
 trapShots.push({kind,model,v:velocity,radius,life,dmg,element,hit:new Set(),body});
 return trapShots[trapShots.length-1];
}
function knockHollow(enemy,dx,dz,impulse,stagger=0){
 const stability=enemy.kind==='juggernaut'?99:enemy.kind==='boss'?70:enemy.kind==='brute'?44:22;
 if(impulse<stability&&enemy.stun<=0)return;
 const factor=clamp(impulse/(stability+15),.65,2.1);
 enemy.kx+=dx*factor*5;enemy.kz+=dz*factor*5;
 enemy.stun=Math.max(enemy.stun,stagger);
}
function igniteTar(item){
 item.pool=Math.max(item.pool,3.2);item.burning=Math.max(item.burning,3.2);
 addSparks(vec(item.x,item.y+.24,item.z),0xff914a,12,4.2);
}
function fieldTrap(item,element,seconds,interval,damage){
 const emissive=element==='Scorch'?0xff8b4d:0xba86e6;
 const cloud=glow(scene,emissive,item.x,item.y+(item.recipe.mount==='ceiling'?-1.15:.2),item.z,
  item.recipe.range*1.55,item.recipe.range*.94,.52);
 trapFields.push({x:item.x,z:item.z,y:item.y,range:item.recipe.range,element,seconds,interval,damage,next:0,
  cloud,mount:item.recipe.mount,host:item});
}
function moveTrapFields(dt){
 for(let i=trapFields.length-1;i>=0;i--){
  const field=trapFields[i];field.seconds-=dt;field.next-=dt;
  if(field.seconds<=0){
   scene.remove(field.cloud);field.cloud.material.dispose();trapFields.splice(i,1);continue;
  }
  field.cloud.material.opacity=Math.min(.52,field.seconds*.8);
  if(field.next>0)continue;
  field.next+=field.interval;
  for(const enemy of enemies)if(enemy.active&&withinTrapField(field,enemy))trapDamage(enemy,field.damage,field.element,field.host);
 }
}
function withinTrapField(trap,enemy){
 const ground=terrainHeight(enemy.x,enemy.z)+enemy.air,center=ground+enemy.stats.scale*.72;
 const depth=trap.mount==='ceiling'?trap.y-center:ground-trap.y;
 return Math.hypot(enemy.x-trap.x,enemy.z-trap.z)<trap.range&&
  (trap.mount==='ceiling'?depth>-.25&&depth<GRID*3+.2:Math.abs(depth)<.95);
}
function trapTargets(item){
 const {recipe}=item,nx=Math.sin(item.angle),nz=Math.cos(item.angle);
 const depth=recipe.mount==='ceiling'?GRID*3:recipe.mount==='wall'?2.7:2;
 const center=vec(item.x,item.y-(recipe.mount==='ceiling'?depth*.48:0),item.z);
 const occupants=physics?.enemyVolume(center,{x:recipe.range+1,y:depth*.54+.55,z:recipe.range+1});
 const eligible=[...(occupants||enemies)].filter(enemy=>{
  if(!enemy.active)return false;
  const dx=enemy.x-item.x,dz=enemy.z-item.z;
  if(recipe.mount==='wall'){
   const front=dx*nx+dz*nz,side=Math.abs(dx*nz-dz*nx);
   const waist=enemyPoint(enemy,.88).y;
   return front>.11&&front<recipe.range&&side<GRID*.39&&Math.abs(waist-item.y)<1.28&&
    !wallBetween(item.x,item.z,enemy.x,enemy.z,.018,item.y);
  }
  if(recipe.id==='coil'){
   const depth=item.y-enemyPoint(enemy,.66).y;
   return Math.abs(dx)<recipe.range&&Math.abs(dz)<recipe.range&&depth>-.1&&depth<GRID*3;
  }
  return withinTrapField({x:item.x,y:item.y,z:item.z,range:recipe.range,mount:recipe.mount},enemy);
 });
 return eligible.sort((a,b)=>Math.hypot(a.x-item.x,a.z-item.z)-Math.hypot(b.x-item.x,b.z-item.z));
}
function fireTrap(item,targets){
 const {recipe}=item,head=vec(item.x,item.y,item.z),f=vec(Math.sin(item.angle),0,Math.cos(item.angle));
 const effectColor={Kinetic:0xffd4a0,Aether:0xbf89eb,Scorch:0xff8a50,Volt:0x78d9ff,Frost:0x9ceaff}[recipe.element];
 const primary=targets[0];
 switch(recipe.id){
  case 'rime':
   for(const e of targets){trapLine(head,enemyPoint(e),effectColor);e.snare=Math.max(e.snare,3.5);trapDamage(e,42,recipe.element,item)}
   break;
  case 'winch':
   trapLine(head,enemyPoint(primary),effectColor);
   knockHollow(primary,-f.x,-f.z,70,.48);trapDamage(primary,58,recipe.element,item);
   break;
  case 'spikes':
   for(const e of targets){e.snare=Math.max(e.snare,2.8);trapDamage(e,49,recipe.element,item)}
   break;
  case 'tar':
   item.pool=4.6;item.burning=0;
   for(const e of targets){
    e.tar=Math.max(e.tar,1.65);
    if(e.kind==='juggernaut'){e.charge=0;e.stun=Math.max(e.stun,1.18)}
   }
   break;
  case 'launch':
   for(const e of targets)if(e.kind!=='juggernaut'){
    e.vy=Math.max(e.vy,e.kind==='boss'?5.4:10.6);e.stun=Math.max(e.stun,.28);trapDamage(e,22,recipe.element,item);
   }
   break;
  case 'grill':
   fieldTrap(item,recipe.element,2.9,.54,27);
   break;
  case 'darts':
   for(const offset of [-.61,0,.61]){
    const at=head.clone().addScaledVector(f,.18).add(vec(f.z*offset,0,-f.x*offset));
    trapProjectile('dart',at,f.clone().multiplyScalar(27),.115,recipe.range/27,72,recipe.element).host=item;
   }
   break;
  case 'cannon':{
   const v=f.clone().multiplyScalar(12.8);v.y=2.45;
   trapProjectile('cannon',head.clone().addScaledVector(f,.31),v,.27,3.8,114,recipe.element).host=item;
   break;
  }
  case 'piston':
   for(const e of targets){knockHollow(e,f.x,f.z,76,.57);trapDamage(e,25,recipe.element,item)}
   break;
  case 'dynamo':
   trapLine(head,enemyPoint(primary),effectColor);trapDamage(primary,161,recipe.element,item);break;
  case 'miasma':
   fieldTrap(item,recipe.element,4.8,.6,24);
   break;
  case 'coil':{
   let start=head;
   const remaining=targets.slice();
   while(remaining.length){
    let nearest=0,best=Infinity;
    for(let i=0;i<remaining.length;i++){
     const range=start.distanceToSquared(enemyPoint(remaining[i]));
     if(range<best){nearest=i;best=range}
    }
    const [e]=remaining.splice(nearest,1);
    const point=enemyPoint(e);trapLine(start,point,effectColor);trapDamage(e,82,recipe.element,item);start=point;
   }
   break;
  }
  case 'tires':
   for(const side of [-1,1]){
    const route=vec(side*1.38,-2.8,side*1.18);
    trapProjectile('tire',head.clone().add(vec(side*.51,-.27,0)),route,.31,4.6,77,recipe.element).host=item;
   }
   break;
 }
 addSparks(head,effectColor,13,3.35);
 sound(recipe.element==='Volt'?'pulse':'chip');
}
function trapTerrainAt(x,z,y){
 return floorAt(x,z,y+.13);
}
function hitTrapLine(shot,from,to){
 const {radius,v}=shot;
 for(const enemy of enemies){
  if(!enemy.active||shot.hit.has(enemy)||!circleBetween(from.x,from.z,to.x,to.z,enemy,enemy.r+radius))continue;
  const feet=terrainHeight(enemy.x,enemy.z)+enemy.air;
  if(Math.max(from.y,to.y)<feet-radius||Math.min(from.y,to.y)>feet+1.8*enemy.stats.scale+radius)continue;
  shot.hit.add(enemy);
  if(shot.kind==='tire'){
   enemy.stun=Math.max(enemy.stun,.68);
   const flat=Math.hypot(v.x,v.z)||1;
   knockHollow(enemy,v.x/flat,v.z/flat,61,.68);
  }
  trapDamage(enemy,shot.dmg,shot.element,shot.host);
 }
}
function finishPlayerProjectile(shot,point,index){
 if(shot.kind==='cluster'){
  for(let i=0;i<4;i++){
   const angle=i*Math.PI*.5+.34,spread=vec(Math.cos(angle)*4,2.8,Math.sin(angle)*4);
   trapProjectile('bomblet',point.clone().add(vec(0,.2,0)),spread,.109,.62+i*.10,shot.dmg,shot.element);
  }
 }else abilityBlast(point,shot.dmg,3.55,shot.element);
 removeTrapShot(shot,index);
}
function removeTrapShot(shot,index){
 scene.remove(shot.model);
 if(shot.body)physics?.removeBall(shot.body);
 trapShots.splice(index,1);
}
function updatePhysicalShot(shot,index,dt){
 const {body,model,v}=shot,p=model.position,origin=p.clone(),point=vec().copy(body.translation());
 const speed=body.linvel();
 shot.life-=dt;
 if(shot.kind==='mortar'){
  const touchdown=shot.life<.84||point.distanceTo(shot.target)<.42||
   v.y<-.6&&speed.y>v.y+1.8||
   Math.hypot(v.x,v.z)>3&&Math.hypot(speed.x,speed.z)<Math.hypot(v.x,v.z)*.62;
  if(touchdown){
   blast(point,shot.dmg,5.3,shot.element,shot.source);
   removeTrapShot(shot,index);return;
  }
 }else if(shot.kind==='cluster'||shot.kind==='bomblet'){
  if(shot.life<=0){finishPlayerProjectile(shot,point,index);return}
 }else hitTrapLine(shot,origin,point);
 p.copy(point);v.copy(speed);
 model.rotation.x+=dt*5.7;model.rotation.y+=dt*2.7;
 if(shot.life<=0)removeTrapShot(shot,index);
}
function moveTrapShots(dt){
 for(let i=trapShots.length-1;i>=0;i--){
  const shot=trapShots[i],{model,v,radius}=shot,p=model.position;
  if(shot.body){updatePhysicalShot(shot,i,dt);continue}
  const dart=shot.kind==='dart';
  shot.life-=dt;
  if(!dart)v.y-=dt*(shot.kind==='mortar'?17.5:14.5);
  const nx=p.x+v.x*dt,ny=p.y+v.y*dt,nz=p.z+v.z*dt;
  const hit=(x,z)=>Math.abs(x)>BOUND||Math.abs(z)>BOUND||wallBetween(p.x,p.z,x,z,radius*.7,p.y)||
   solidProps.some(prop=>prop.alive&&p.y<prop.top&&coverAt(prop,x,z,radius));
  const stopX=hit(nx,p.z),stopZ=hit(p.x,nz),diagonal=!stopX&&!stopZ&&hit(nx,nz);
  const tx=stopX||diagonal?p.x:nx,tz=stopZ||diagonal?p.z:nz;
  if(dart&&(stopX||stopZ||diagonal))shot.life=0;
  else{
   if(stopX||diagonal)v.x*=-.87;
   if(stopZ||diagonal)v.z*=-.87;
  }
  let ty=ny;
  const ground=trapTerrainAt(tx,tz,p.y-radius)+radius;
  if(shot.kind==='mortar'&&(stopX||stopZ||diagonal||ty<ground||shot.life<=.80||
    p.distanceTo(shot.target)<.38)){
   blast(vec(tx,Math.max(ty,ground),tz),shot.dmg,5.3,shot.element,shot.source);
   shot.life=0;
  }
  if(ty<ground){
   ty=ground;v.y=Math.max(1.2,-v.y*(shot.kind==='tire'?.78:.70));
   v.x*=.9;v.z*=.9;if(dart)shot.life=0;
  }
  const player=shot.kind==='cluster'||shot.kind==='bomblet';
  if(!player&&shot.kind!=='mortar')hitTrapLine(shot,p,vec(tx,ty,tz));
  p.set(tx,ty,tz);
  if(!dart){model.rotation.x+=dt*5.7;model.rotation.y+=dt*2.7}
  if(shot.life<=0){if(player)finishPlayerProjectile(shot,p.clone(),i);else removeTrapShot(shot,i)}
 }
}
function abilityBlast(origin,force,radius,element='Aether'){
 for(const enemy of enemies){
  if(!enemy.active)continue;
  const point=enemyPoint(enemy,.62),range=point.distanceTo(origin);
  if(range<radius)trapDamage(enemy,force*(1-range/radius)*.78+force*.22,element);
 }
 addSparks(origin,elementColors[element],17,4.1);
}
function trapTick(dt){
 moveTrapShots(dt);moveTrapFields(dt);
 for(const item of builds.values()){
  if(item.piece!==3)continue;
  const recipe=item.recipe;
  item.trapIn=Math.max(0,item.trapIn-dt);
  if(recipe.id==='tar'&&item.pool>0){
   item.pool=Math.max(0,item.pool-dt);item.burning=Math.max(0,item.burning-dt);
   if(item.burning>0&&item.flame!==true){item.flame=true;fieldTrap(item,'Scorch',item.burning,.44,29)}
   if(!item.burning)item.flame=false;
   for(const e of trapTargets(item))if(e.active){
    e.tar=Math.max(e.tar,.24);
    if(e.kind==='juggernaut'&&e.charge>0){e.charge=0;e.stun=Math.max(e.stun,.52)}
   }
  }
  if(item.trapIn>0)continue;
  if(item.life===0){
   if(!item.pool)removeStructure(item);
   continue;
  }
  const targets=trapTargets(item);
  if(!targets.length)continue;
  item.life--;item.trapIn=recipe.reload*item.calibration.reload;fieldTraps.add(recipe.id);
  fireTrap(item,targets);
 }
}
function enemyDamage(enemy){
 return Math.round(enemy.stats.hit*(1+.012*(enemy.power-10))*(state.modifier?.id==='surge'?1.22:1));
}
function strike(enemy,target,wall,mate){
 if(enemy.hitIn>0)return;
 if(enemy.kind==='demolisher'){detonateHollow(enemy);return}
 enemy.hitIn=enemy.kind==='boss'?1.38:enemy.kind==='brute'?1.27:1.12;
 enemy.recoil=.29;
 const damage=enemyDamage(enemy)*(enemy.kind==='juggernaut'&&enemy.charge>0&&target==='wall'?2.7:1);
 if(enemy.kind==='juggernaut'&&enemy.charge>0&&target!=='wall')enemy.charge=0;
 if(target==='hero'){if(mate)damageMate(mate,damage);else hurtHero(damage)}
 if(target==='atlas')hurtAtlas(damage);
 if(target==='wall')hurtStructure(wall,damage*engineering.structureFactor(enemy.element,wall.material.id),enemy);
}
function chaseDecoy(enemy,dt){
 const decoy=gadgets.find(g=>g.kind==='decoy'&&g.hp>0&&Math.hypot(g.x-enemy.x,g.z-enemy.z)<11&&
  !wallBetween(enemy.x,enemy.z,g.x,g.z,.05,.68)&&
  !solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,enemy.x,enemy.z,g.x,g.z,.05)));
 if(!decoy)return null;
 const dx=decoy.x-enemy.x,dz=decoy.z-enemy.z,distance=Math.hypot(dx,dz);
 enemy.yaw=Math.atan2(-dx,-dz);
 if(distance<1.28){
  if(enemy.hitIn<=0){enemy.hitIn=1.05;decoy.hp-=enemyDamage(enemy)}
  return 0;
 }
 const fraction=Math.min(1,enemy.stats.speed*dt/distance);
 enemy.x+=dx*fraction;enemy.z+=dz*fraction;return 1;
}
function seek(enemy,dt){
 const {x,z,stats,r}=enemy;
 const taunt=chaseDecoy(enemy,dt);if(taunt!==null)return taunt;
 const nearest=coop?closestPlayer(x,z):{pos:hero.pos,mate:null};
 const focus=nearest?.pos||hero.pos,mate=nearest?.mate;
 const concealed=gadgets.some(g=>g.kind==='smoke'&&Math.hypot(g.x-focus.x,g.z-focus.z)<3.55);
 const toHero=Math.hypot(x-focus.x,z-focus.z),toAtlas=objectiveDistance(x,z);
 const phasing=enemy.kind==='phantasm';
 const sight=phasing||(!wallBetween(x,z,focus.x,focus.z,.12,.76)&&
  !solidProps.some(p=>p.alive&&p.type==='cover'&&coverAlong(p,x,z,focus.x,focus.z,.06)));
 const alert=({runner:7.5,spitter:12.2,beam:17,phantasm:10,juggernaut:9})[enemy.kind]||4.7;
 const hunt=enemy.hunt===true;
 const focusHero=!!nearest&&(hunt||(!concealed&&sight&&toHero<alert&&(phasing||focus.y-terrainHeight(focus.x,focus.z)<1.3)));
 const lineToAtlas=!phasing&&wallBetween(x,z,ox,oz,.1,.84);
 const target=focusHero?'hero':'atlas';
 let tx=focusHero?focus.x:ox,tz=focusHero?focus.z:oz;
 if(!hunt&&enemy.kind==='mortar'&&toAtlas<24&&toAtlas>4.5){
  enemy.yaw=Math.atan2(x,z);
  if(enemy.hitIn<=0){enemy.hitIn=5.3;enemy.recoil=.29;castArtillery(enemy)}
  return 0;
 }
 if(!hunt&&enemy.kind==='catapult'&&toAtlas<19&&toAtlas>5.6&&enemy.hitIn<=0){
  const ally=enemies.find(e=>e.active&&e.kind==='husk'&&!e.hurl&&Math.hypot(e.x-x,e.z-z)<5.1);
  if(ally){tossShambler(enemy,ally);return 0}
 }
 if(enemy.kind==='beam'){
  if(focusHero&&sight&&enemy.hitIn<=0&&enemy.beamFor<=0){enemy.beamFor=1.63;enemy.beamTick=0;enemy.hitIn=4.4}
  if(enemy.beamFor>0){
   if(!focusHero||!sight){enemy.beamFor=0;return 0}
   enemy.beamFor-=dt;enemy.beamTick-=dt;
   enemy.yaw=Math.atan2(x-focus.x,z-focus.z);
   if(enemy.beamTick<=0){
    enemy.beamTick=.142;
    trapLine(enemyPoint(enemy,1.5),focus.clone().add(vec(0,1.18,0)),elementColors[enemy.element]);
    if(mate)damageMate(mate,enemyDamage(enemy)*.29);else hurtHero(enemyDamage(enemy)*.29);
   }
   return 0;
  }
 }
 if(enemy.kind==='juggernaut'){
  enemy.charge=Math.max(0,enemy.charge-dt);enemy.chargeIn=Math.max(0,enemy.chargeIn-dt);
  if(enemy.chargeIn<=0&&enemy.tar<=0&&(focusHero?toHero:toAtlas)<16){
   enemy.charge=2.55;enemy.chargeIn=7.6;
   addSparks(enemyPoint(enemy,.55),0xeebd8a,13,3.6);
  }
 }
 const ranged=enemy.kind==='spitter';
 if(ranged&&((focusHero&&sight&&toHero<11)||(!hunt&&!lineToAtlas&&toAtlas<11))){
  if(!focusHero){tx=0;tz=0}
  enemy.yaw=Math.atan2(x-tx,z-tz);
  if(enemy.hitIn<=0){enemy.hitIn=2.72;enemy.recoil=.25;castBolt(enemy,focusHero?'hero':'atlas',focus)}
  return 0;
 }
 const range=focusHero?(enemy.kind==='boss'?1.87:enemy.kind==='brute'?1.51:1.09):3.42;
 if((focusHero&&sight&&toHero<=range&&(phasing||focus.y-terrainHeight(x,z)<2.3))||(!focusHero&&!lineToAtlas&&toAtlas<=range)){
  enemy.yaw=Math.atan2(x-tx,z-tz);
  strike(enemy,target,null,mate);
  return 0;
 }
 if(!focusHero&&!phasing)[tx,tz]=enemyRoute(enemy);
 const dx=tx-x,dz=tz-z,len=Math.hypot(dx,dz);
 if(len<.0001)return 0;
 const ux=dx/len,uz=dz/len;
 if(hunt&&toHero<.95&&!sight)return 0;
 const stopDist=dt*stats.speed+r+.32;
 const wall=!phasing&&wallBetween(x,z,x+ux*stopDist,z+uz*stopDist,r*.85,.6);
 enemy.yaw=Math.atan2(-ux,-uz);
 if(wall){strike(enemy,'wall',wall);return 0}
 let pushX=0,pushZ=0;
 for(const other of enemies){
  if(other===enemy||!other.active)continue;
  const ox=x-other.x,oz=z-other.z,dist=Math.hypot(ox,oz),minimum=r+other.r+.34;
  if(dist<.005||dist>minimum)continue;
  const strength=clamp((minimum-dist)/minimum,0,.43)*2;
  pushX+=ox/dist*strength;pushZ+=oz/dist*strength;
 }
 const pace=stats.speed*dt*(enemy.tar>0?.11:enemy.charge>0?3.05:enemy.snare>0?.70:1);
 const clear=(a,b)=>(phasing||!wallBetween(x,z,a,b,r*.66,.57))&&
  !solidProps.some(p=>p.alive&&coverAt(p,a,b,r*.63));
 const nx=x+(ux+clamp(pushX,-.65,.65))*pace,nz=z+(uz+clamp(pushZ,-.65,.65))*pace;
 if(clear(nx,nz)){
  enemy.x=clamp(nx,-BOUND+.5,BOUND-.5);enemy.z=clamp(nz,-BOUND+.5,BOUND-.5);return 1;
 }
 if(clear(x+ux*pace,z+uz*pace)){
  enemy.x+=ux*pace;enemy.z+=uz*pace;return 1;
 }
 const tangent=.79*(enemy.stuck>1.4?-1:1);
 if(clear(x-uz*pace*tangent,z+ux*pace*tangent)){enemy.x-=uz*pace*tangent;enemy.z+=ux*pace*tangent;return .8}
 return 0;
}
function updateHusks(dt){
 if(obstaclesDirty)refreshRoutes();
 for(const enemy of enemies){
  if(!enemy.active)continue;
  enemy.hitIn-=dt;
  if(enemy.affliction){
   const affliction=enemy.affliction;affliction.remaining-=dt;affliction.next-=dt;
   if(affliction.next<=0){affliction.next+=.6;hurtEnemy(enemy,affliction.amount,enemyPoint(enemy,.65))}
   if(affliction.remaining<=0)enemy.affliction=null;
   if(!enemy.active)continue;
  }
  if(enemy.hurl){
   const {from,end,flight}=enemy.hurl;
   enemy.hurl.t+=dt;
   const t=clamp(enemy.hurl.t/flight,0,1),x=lerp(from.x,end.x,t),z=lerp(from.z,end.z,t);
   enemy.x=x;enemy.z=z;
   enemy.air=Math.max(0,lerp(from.y,end.y,t)+Math.sin(t*Math.PI)*6.6-terrainHeight(x,z));
   enemy.root.position.set(x,terrainHeight(x,z)+enemy.air,z);
   if(t>=1){enemy.hurl=null;enemy.air=0;enemy.stun=.29}
   continue;
  }
  enemy.snare=Math.max(0,enemy.snare-dt);enemy.tar=Math.max(0,enemy.tar-dt);
  if(enemy.air>0||enemy.vy>0){
   enemy.vy-=dt*18;enemy.air=Math.max(0,enemy.air+enemy.vy*dt);
   if(!enemy.air)enemy.vy=0;
  }
  if(Math.hypot(enemy.kx,enemy.kz)>.05){
   const x=enemy.x+enemy.kx*dt,z=enemy.z+enemy.kz*dt;
   const y=terrainHeight(enemy.x,enemy.z)+enemy.air+.55;
   if(Math.abs(x)<BOUND&&Math.abs(z)<BOUND&&!wallBetween(enemy.x,enemy.z,x,z,enemy.r*.8,y)&&
     !solidProps.some(p=>p.alive&&p.top>y&&coverAt(p,x,z,enemy.r*.67))){enemy.x=x;enemy.z=z}
   enemy.kx*=Math.max(0,1-dt*5);enemy.kz*=Math.max(0,1-dt*5);
  }
  enemy.recoil=Math.max(0,enemy.recoil-dt);enemy.stun=Math.max(0,enemy.stun-dt);
  const moving=enemy.stun>0||enemy.air>.5?0:seek(enemy,dt);
  enemy.stuck=moving?0:(enemy.stuck+dt)%3.4;
  if(state.finished)return;
  enemy.bob+=dt*(moving?7+enemy.stats.speed:2.9);
  const step=Math.sin(enemy.bob),lift=Math.abs(step),recoil=enemy.recoil;
  enemy.rig.position.y=lift*moving*.058;
  enemy.chest.rotation.x=-.15+(recoil>0?Math.sin(recoil*11)*-.33:0);
  enemy.chest.rotation.z=step*moving*.11;
  enemy.head.rotation.z=.072+step*.045;
  for(let i=0;i<2;i++){
   const {arm,leg}=enemy.limbs[i],sign=i?1:-1;
   leg.rotation.x=step*sign*moving*.71;
   arm.rotation.set(-.57-step*sign*moving*.46-recoil*1.9,0,.18*sign);
  }
  const haunt=enemy.kind==='phantasm'?.34+Math.sin(enemy.bob*.7)*.16:0;
  enemy.root.position.set(enemy.x,terrainHeight(enemy.x,enemy.z)+enemy.air+haunt,enemy.z);
  const facing=enemy.root.rotation.y;
  enemy.root.rotation.y=facing+Math.atan2(Math.sin(enemy.yaw-facing),Math.cos(enemy.yaw-facing))*Math.min(dt*11,1);
 }
}
function plannedFronts(){
 if(expedition&&expStage==='defend')return [0,1,2,3];
 if(state.mission!=='defense'||state.finished)return noFronts;
 return assaultLanes[state.phase==='active'||state.phase==='arming'?state.wave-1:state.wave]||noFronts;
}
function startWave(){
 if(state.phase!=='prep'||state.finished)return;
 const seats=coop?livePlayers().length:1;
 state.wave++;state.waveTime=0;state.phase='arming';state.prep=ASSAULT_WARNING;
 const wave=waves[state.wave-1];
 assaultQueue=operations.assaultGroups(wave,plannedFronts(),seats);
 for(let i=0;i<(state.outpostTier||0);i++){
  assaultQueue.push({lane:plannedFronts()[i%plannedFronts().length],units:[i%2?'brute':'runner','husk']});
 }
 assaultGroup=assaultUnit=0;
 state.pending=assaultQueue.reduce((sum,group)=>sum+group.units.length,0);state.spawnIn=.12;
 notice(wave.name+' · '+plannedFronts().map(lane=>frontNames[lane]).join(' / '));
 sound('wave','Assault incoming');rumble(.43,140);
}
function spawnHusk(){
 const group=assaultQueue[assaultGroup];
 const [x,z]=portals[group.lane];
 const drop=safeFieldPoint(x+(rand()-.5)*2.8,z+(rand()-.5)*2.8,.65);
 makeHusk(group.units[assaultUnit++],drop?.x??x,drop?.z??z);
 addSparks(vec(x,terrainHeight(x,z)+1.4,z),0xaf72ff,9,5.6);
 state.pending--;
 if(assaultUnit===group.units.length){
  assaultGroup++;assaultUnit=0;state.spawnIn=Math.max(3.3,6.8-state.wave*.66);
 }else state.spawnIn=.53;
}
function clearWave(){
 const bonus=hero.cache===3&&!state.allClear;
 if(bonus)state.allClear=true;
 awardWave(bonus);
 bankSalvage(false,true);
 portalFx.forEach(portal=>{portal.active=false});
 for(const bolt of bolts){
  scene.remove(bolt.group);bolt.flare.material.dispose();
 }
 bolts.length=0;enemies.length=0;
 for(let i=trapShots.length-1;i>=0;i--)removeTrapShot(trapShots[i],i);
 for(const field of trapFields){scene.remove(field.cloud);field.cloud.material.dispose()}
 trapFields.length=0;
 if(state.wave===MAX_WAVES){finish(true,'All five assaults repelled');return}
 state.phase='prep';state.prep=0;
 hero.hp=Math.min(hero.maxhp,hero.hp+17);
 hero.shield=Math.max(hero.shield,32);
 for(const gun of guns)gun.reserve=Math.max(48,gun.reserve);
 hero.stacks=hero.stacks.map((n,i)=>Math.min(999,n+[16,12,8][i]));
 const points=[[-5,7],[6,5],[-6,-6],[6,-6]];
 const [x,z]=points[dropIndex++%points.length];
 addCache(x,z,'airdrop');
 notice('Assault repelled · Resupply and prepare for the next front');sound('pickup','Resupply delivered');
}
const nests=[];
let pod=null;
let plannedNests=null;
function turnOffAtlas(){
 atlasModel.visible=false;atlasBody.alive=false;
 removeTarget(shotProps,atlasHit);obstaclesDirty=true;
}
function safeFieldPoint(x,z,clearance){
 for(let i=0;i<33;i++){
  const theta=i*2.39996,offset=i?Math.sqrt(i)*.98:0;
  const a=x+Math.cos(theta)*offset,b=z+Math.sin(theta)*offset;
  if(Math.abs(a)<BOUND-4&&Math.abs(b)<BOUND-4&&!solidProps.some(prop=>prop.alive&&coverAt(prop,a,b,clearance)))return vec(a,terrainHeight(a,b),b);
 }
 return null;
}
function nestSites(){
 if(plannedNests)return plannedNests;
 const twist=(mapSeed%65521)/65521*TAU;
 const fallback=[[-33,-1],[0,-31],[32,-1],[0,35],[-29,25],[26,-27]];
 plannedNests=[];
 for(let i=0;i<nestCrews.length;i++){
  const angle=twist+i*TAU/nestCrews.length,radius=46+((mapSeed>>>(i*5))&31)*2.3;
  const candidate=safeFieldPoint(Math.cos(angle)*radius,Math.sin(angle)*radius,2.6);
  const far=site=>site&&plannedNests.every(other=>other.distanceTo(site)>12);
  const site=far(candidate)?candidate:fallback.map(([x,z])=>safeFieldPoint(x,z,2.6)).find(far);
  if(site)plannedNests.push(site);
 }
 return plannedNests;
}
function prepareNests(){
 turnOffAtlas();
 ui.objective.hidden=true;
 state.phase='hunt';state.huntTime=NEST_DURATION;
 for(const site of nestSites()){
  const {x,y,z}=site,group=groupAt(stage,x,y,z);
  const shell=mat(0x563953,0x1a0c21),vein=mat(0xca97dc,0x7f44ad);
  mesh(group,rock,shell,0,.32,0,1.47,.66,1.53);
  for(let j=0;j<6;j++){
   const turn=j*TAU/6,spine=mesh(group,gem,shell,Math.cos(turn)*1.05,.83,Math.sin(turn)*1.05,.28,.87,.31);
   spine.rotation.z=Math.cos(turn)*.29;
  }
  const gemstone=mesh(group,gem,vein,0,1.13,0,.52,.84,.52,false);
  const shield=ring(group,purple,1.53,.031,.38);
  const haze=glow(group,0xbb73d6,0,1,0,3.2,3.3,.44);
  const max=Math.round(150+region.floor*1.6);
  nests.push({type:'nest',x,y,z,group,gemstone,shield,haze,max,hp:max,active:true,crew:null,remaining:0});
 }
 if(nests.length!==nestCrews.length){finish(false,'The nest survey failed');return}
 notice('Follow the nest signals');
}
function availableNest(){
 if(state.mission!=='nests'||state.nest)return null;
 return nests.find(nest=>nest.active&&Math.abs(hero.pos.y-nest.y)<2.25&&
  Math.hypot(nest.x-hero.pos.x,nest.z-hero.pos.z)<3.35&&
  !wallBetween(hero.pos.x,hero.pos.z,nest.x,nest.z,.05,nest.y+1)&&
  !solidProps.some(prop=>prop.alive&&prop.type==='cover'&&coverAlong(prop,hero.pos.x,hero.pos.z,nest.x,nest.z,.05)));
}
function scanNest(nest){
 state.nest=nest;state.wave=state.nestsCleared+1;
 nest.crew=[...nestCrews[state.nestsCleared]];nest.remaining=nest.crew.length;nest.spawnIn=.20;
 notice('Guardians incoming');sound('wave','Guardians incoming');
}
function missionInteraction(){
 if(expedition)return hero.hp<=0?'':expPrompt();
 if(hero.hp<=0||objectiveDistance(hero.pos.x,hero.pos.z)>4.8||Math.abs(hero.pos.y)>2.25)return '';
 if(state.phase==='drop'&&!state.overclock&&state.flux>0)return 'Overclock landing beacon · 1 Flux · stronger assault · +6 Cells on victory';
 if(state.phase==='payload'&&state.flux>0&&state.podFuel<=80)return 'Feed pod · 1 Flux';
 if(state.mission==='defense'&&state.phase==='prep')return 'Launch assault '+(state.wave+1);
 if(state.mission==='seal'&&state.phase==='fuel'&&state.flux===3)return 'Activate Rift Anchor';
 return '';
}
function searchableWreck(){
 return props.find(p=>p.kind===2&&p.alive&&!p.searched&&Math.abs(hero.pos.y-p.y)<2&&Math.hypot(p.x-hero.pos.x,p.z-hero.pos.z)<2.9);
}
const fieldDrops=new Map(),receivedDrops=new Set();
let pendingDrop=null,dropRequest=0,groundDropId=0;
const buildingStock=['Wood','Stone','Metal'];
function backpackSupply(name){
 if(name==='Ammo')return looseAmmo+guns.reduce((total,gun)=>total+gun.reserve,0);
 const stack=buildingStock.indexOf(name);
 if(stack>=0)return hero.stacks[stack];
 const field=Object.keys(fieldStash).find(key=>fieldStash[key]===name);
 return field?fieldBag[field]||0:inventory?.bag[name]||0;
}
function changeSupply(name,delta){
 const stack=buildingStock.indexOf(name);
 if(stack>=0){hero.stacks[stack]+=delta;return}
 if(name==='Ammo'){
  if(delta>0){
   for(const gun of guns){
    const amount=Math.min(delta,360-gun.reserve);gun.reserve+=amount;delta-=amount;
   }
   looseAmmo+=delta;
  }else{
   let remaining=-delta,loose=Math.min(remaining,looseAmmo);
   looseAmmo-=loose;remaining-=loose;
   for(const gun of guns){
    const amount=Math.min(remaining,gun.reserve);gun.reserve-=amount;remaining-=amount;
   }
  }
  return;
 }
 const field=Object.keys(fieldStash).find(key=>fieldStash[key]===name);
 if(field)fieldBag[field]=(fieldBag[field]||0)+delta;
 else inventory.bag[name]=(inventory.bag[name]||0)+delta;
}
function takeBackpackDrop(entry,count){
 if(entry.drop.uid){
  const slot=guns.findIndex(gun=>gun.record?.uid===entry.drop.uid);
  const item=inventory.take(entry.drop.uid);
  if(!item)return null;
  if(slot>=0)removeDroppedGun(slot);
  return {weapon:item};
 }
 const name=entry.drop.name,available=backpackSupply(name);
 if(!Number.isSafeInteger(count)||count<1||count>available)return null;
 changeSupply(name,-count);return {name,count};
}
function removeDroppedGun(index){
 const removed=guns[index],held=hero.weapon;
 looseAmmo+=removed.reserve;removed.model?.parent?.remove(removed.model);
 guns.splice(index,1);
 for(let i=index;i<guns.length;i++)repaintWeaponSlot(i);
 const empty=toolSlots[guns.length+1].container;
 empty.dataset.empty='true';empty.title='Empty weapon slot '+(guns.length+1);
 empty.setAttribute('aria-label',empty.title);empty.querySelector('img').hidden=true;
 switchWeapon(held===index?Math.min(index,guns.length):held>index?held-1:held);
}
function acceptFieldDrop(payload,refund=false){
 if(payload.weapon){
  if(!inventory.accept(payload.weapon,refund))return false;
 }else{
  const limit=buildingStock.includes(payload.name)?999:99999;
  if(backpackSupply(payload.name)+payload.count>limit)return false;
  changeSupply(payload.name,payload.count);
 }
 persistField();return true;
}
function dropLabel(payload){
 return payload.weapon?gear.itemInfo(payload.weapon.key)?.name||'Weapon':payload.count+' '+payload.name;
}
function dropSpot(){
 if(fieldDrops.size>=64)return null;
 for(const distance of [2.25,2.75,3.15]){
  const p=safeFieldPoint(hero.pos.x+distance*Math.sin(hero.yaw),hero.pos.z+distance*Math.cos(hero.yaw),.32);
  if(p&&Math.abs(p.y-hero.pos.y)<1.4&&![...fieldDrops.values()].some(d=>Math.hypot(d.x-p.x,d.z-p.z)<.45))return p;
 }
 return null;
}
function showFieldDrop(id,x,z,label,weapon,payload){
 const isWeapon=!!weapon;
 const group=groupAt(stage,x,terrainHeight(x,z),z),color=isWeapon?0xe8ac59:0x7ee3d8;
 const fx=mat(color,color,.73),marker=mesh(group,gem,fx,0,.48,0,.21,.26,.21,false);
 if(isWeapon){
  const model=gear?.groundWeapon?.(weapon);
  if(model){model.position.y=.31;group.add(model)}
 }else block(group,steel,0,.18,0,.45,.34,.42,false);
 fieldDrops.set(id,{id,x,z,group,marker,label,isWeapon,weapon,payload});
}
function clearFieldDrop(id){
 const drop=fieldDrops.get(id);
 if(drop){stage.remove(drop.group);fieldDrops.delete(id)}
}
function placeFieldDrop(p,payload){
 showFieldDrop(++groundDropId,p.x,p.z,dropLabel(payload),payload.weapon?.key,payload);
}
function packTransferMessage(message){
 if(state.screen==='pack')text(ui['pack-status'],message);
 else notice(message);
}
function dropBackpackItem(entry,count){
 if(!inventory||pendingDrop||hero.hp<=0)return;
 if(guest&&!coopStarted){packTransferMessage('Wait for the squad link.');return}
 const stack=buildingStock.includes(entry.drop.name);
 const spot=guest?null:dropSpot();
 if(!guest&&!spot){packTransferMessage('There is no room to drop that here.');return}
 if(guest&&stack){
  if(!Number.isSafeInteger(count)||count<1||count>backpackSupply(entry.drop.name))return;
  pendingDrop={request:++dropRequest};
  coopAction('item-drop',{request:dropRequest,payload:{name:entry.drop.name,count}});
 }else{
  persistField();
  const payload=takeBackpackDrop(entry,count);
  if(!payload){packTransferMessage('That quantity is unavailable.');return}
  persistField();
  if(guest){
   pendingDrop={request:++dropRequest,payload};coopAction('item-drop',{request:dropRequest,payload});
  }else placeFieldDrop(spot,payload);
 }
 if(!guest)sound('pickup');
 fillPack();packTransferMessage(guest?'Dropping item…':'Item dropped');
}
function nearbyFieldDrop(){
 let selected=null,distance=2.7;
 for(const drop of fieldDrops.values()){
  const y=drop.group.position.y,range=Math.hypot(hero.pos.x-drop.x,hero.pos.z-drop.z);
  if(drop.taker||range>=distance||Math.abs(hero.pos.y-y)>1.65||
   wallBetween(hero.pos.x,hero.pos.z,drop.x,drop.z,.02,hero.pos.y+.42))continue;
  selected=drop;distance=range;
 }
 return selected;
}
function collectFieldDrop(item){
 if(!inventory)return false;
 if(guest){coopAction('item-pickup',{id:item.id});return true}
 if(remoteSeat){
  const p=item.payload,stack=buildingStock.indexOf(p.name);
  if(stack>=0){
   if(hero.stacks[stack]+p.count>999){sendGame('feedback',{line:'That stack is full.'},remoteSeat.id);return true}
   hero.stacks[stack]+=p.count;clearFieldDrop(item.id);
   sendGame('feedback',{line:'Picked up '+item.label},remoteSeat.id);return true;
  }
  if(remoteSeat.pendingPickup)return true;
  remoteSeat.pendingPickup=item.id;item.taker=remoteSeat.id;
  sendGame('feedback',{itemGrant:{id:item.id,payload:p}},remoteSeat.id);return true;
 }
 if(!acceptFieldDrop(item.payload)){notice('There is no room in your backpack.');return true}
 clearFieldDrop(item.id);notice('Picked up '+item.label);sound('pickup');return true;
}
function hostFieldTransfer(m,d){
 if(d.action==='item-pickup'){
  const item=nearbyFieldDrop();
  if(item?.id===d.id)collectFieldDrop(item);
  return;
 }
 if(!Number.isSafeInteger(d.request)||d.request<1||d.request<=(m.dropRequest||0))return;
 m.dropRequest=d.request;
 const p=inventory?.validateTransfer(d.payload),spot=p&&dropSpot(),stack=buildingStock.indexOf(p?.name);
 const ok=!!spot&&(stack<0||hero.stacks[stack]>=p.count);
 if(ok){
  if(stack>=0)hero.stacks[stack]-=p.count;
  placeFieldDrop(spot,p);
 }
 sendGame('feedback',{dropResult:{request:d.request,ok,stacks:stack>=0?hero.stacks:null}},m.id);
}
function syncFieldDrops(rows){
 const visible=new Set();
 for(const [id,x,z,label,weapon] of rows){
  visible.add(id);
  if(!fieldDrops.has(id))showFieldDrop(id,x,z,label,weapon);
 }
 for(const id of fieldDrops.keys())if(!visible.has(id))clearFieldDrop(id);
}
function receiveFieldTransfer(d){
 if(pendingDrop&&d.dropResult?.request===pendingDrop.request){
  const {ok,stacks}=d.dropResult;
  if(stacks)hero.stacks=stacks;
  if(!ok&&pendingDrop.payload)acceptFieldDrop(pendingDrop.payload,true);
  pendingDrop=null;persistField();fillPack();
  packTransferMessage(ok?'Item dropped':'Could not drop here. Item kept.');
 }
 if(!d.itemGrant||!inventory)return;
 const {id,payload}=d.itemGrant;
 const p=inventory.validateTransfer(payload);
 let accepted=receivedDrops.has(id);
 if(!accepted){
  accepted=!!p&&acceptFieldDrop(p);
  if(accepted){receivedDrops.add(id);clearFieldDrop(id);fillPack();sound('pickup');notice('Picked up '+dropLabel(p))}
  else notice('There is no room in your backpack.');
 }
 sendGame('action',{action:'item-received',id,accepted});
}

function interactField(){
 if(hero.hp<=0)return false;
 if(!guest&&coop&&reviveMate())return true;
 const sharedDrop=nearbyFieldDrop();
 if(sharedDrop&&collectFieldDrop(sharedDrop))return true;
 if(guest){
  const teammate=[...mates.values()].some(m=>m.ready&&m.down&&m.target.distanceTo(hero.pos)<2.65);
  if(teammate||availableNest()||availableChest()||searchableWreck()||((expedition||state.phase==='payload')&&missionInteraction())){coopAction('interact');return true}
  return false;
 }
 if(expedition&&missionInteraction()&&(!coop||coopStarted)&&expeditionInteraction())return true;
 const nest=availableNest();
 if(nest){scanNest(nest);return true}
 if(useChest())return true;
 const wreck=searchableWreck();
 if(wreck){
  wreck.searched=true;fieldMetrics.caches++;
  collectPart(pick(['parts','gears','powder','charge']),2+Math.floor(rand()*5));sound('pickup');return true;
 }

 if(!missionInteraction()||coop&&!coopStarted)return false;
 if(state.phase==='drop'&&!remoteSeat){state.flux--;state.overclock=true;sound('build');return true}
 if(state.phase==='payload'){
  state.flux--;state.podFuel=Math.min(100,state.podFuel+44);
  addSparks(vec(0,1,0),0x98e9d3,22,5);sound('build');return true;
 }
 if(remoteSeat)return false;
 if(state.mission==='defense')startWave();
 else{
  state.phase='seal';state.wave=1;state.spawnIn=.35;
  portalFx.forEach(portal=>{portal.active=true});
  notice('Anchor online · Keep it intact');sound('wave','Anchor online');
 }
 return true;
}
function updateNest(nest,dt){
 nest.gemstone.rotation.y+=dt*.75;
 nest.gemstone.position.y=1.14+Math.sin(state.elapsed*2+nest.x)*.09;
 nest.haze.material.opacity=nest===state.nest?.72:.42;
 if(nest!==state.nest||nest.hit)return;
 nest.spawnIn-=dt;
 if(nest.crew.length&&nest.spawnIn<=0){
  const angle=rand()*TAU,range=3.2+rand()*2.2;
  const site=safeFieldPoint(nest.x+Math.cos(angle)*range,nest.z+Math.sin(angle)*range,.55)||vec(nest.x,nest.y,nest.z);
  const enemy=makeHusk(nest.crew.shift(),site.x,site.z);
  enemy.hunt=true;enemy.nest=nest;
  addSparks(site.clone().add(vec(0,.8,0)),0xcb91e7,11,3.2);
  nest.spawnIn=.79;
 }
 nest.remaining=nest.crew.length+enemies.reduce((n,e)=>n+Number(e.active&&e.nest===nest),0);
 if(nest.remaining===0){
  nest.hit=registerHit(nest.gemstone,nest);
  nest.shield.visible=false;
  notice('Core exposed');sound('pickup');
 }
}
function stageReward(){
 const bonus=hero.cache===3&&!state.allClear;
 if(bonus)state.allClear=true;
 awardWave(bonus);
 bankSalvage(false,true);
}
function hurtNest(nest,damage,point){
 if(state.nest!==nest||!nest.active||!nest.hit||state.finished)return;
 nest.hp=Math.max(0,nest.hp-damage);
 state.hit=.16;addSparks(point,0xd8a4f0,8,4);
 if(nest.hp>0)return;
 removeTarget(shotProps,nest.hit);nest.hit=null;
 nest.active=false;state.nest=null;state.nestsCleared++;
 nest.haze.material.dispose();stage.remove(nest.group);
 collectPart('quartz',2);collectPart('charge',1);restock(32);
 hero.hp=Math.min(hero.maxhp,hero.hp+22);
 state.wave=state.nestsCleared;stageReward();
 if(state.nestsCleared===nests.length){finish(true,'All nests destroyed');return}
 addCache(nest.x,nest.z,'airdrop');
}
function nestTick(dt,realTime){
 state.huntTime=Math.max(0,state.huntTime-realTime);
 if(state.huntTime===0){finish(false,'The hunt window expired');return}
 for(const nest of nests)if(nest.active)updateNest(nest,dt);
 trapTick(dt);updateHusks(dt);
 if(!state.finished)moveBolts(dt);
 for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].active)enemies.splice(i,1);
}
function preparePayload(){
 turnOffAtlas();
 state.phase='drop';state.podFuel=70;state.flux=0;state.overclock=false;
 if(!guest)addFluxCrystals();
 state.atlas=PAYLOAD_HP;state.prep=PAYLOAD_PREP;
 text(ui['atlas-name'],'Recovery pod');
 ui['atlas-meter'].setAttribute('aria-label','Recovery pod integrity');
 const pad=groupAt(stage,ox,0,oz);
 ring(pad,mat(0xe7b98b,0x866341),2.33,.039,.06);
 for(let i=0;i<4;i++){
  const flag=groupAt(pad);flag.rotation.y=i*TAU/4;
  block(flag,orange,0,.02,2.31,.44,.035,.65);
 }
 pod=groupAt(stage,ox,22,oz);
 pod.visible=false;
 mesh(pod,hex,steel,0,.32,0,1.08,.56,1.08);
 mesh(pod,hex,mat(0x826246,0,.44),0,.96,0,.97,1.08,.97);
 mesh(pod,hex,trim,0,1.60,0,1.01,.28,1.01);
 for(let i=0;i<6;i++){
  const rail=groupAt(pod);rail.rotation.y=i*TAU/6;
  block(rail,dark,0,.89,.90,.24,.92,.09);
  block(rail,accent,0,1.06,.96,.11,.42,.031,false);
 }
 notice('Prepare the landing zone');
}
function landPayload(){
 pod.position.y=0;pod.visible=true;
 atlasBody.alive=true;atlasBody.top=1.78;atlasBody.r=1.35;
 atlasHit=registerHit(block(pod,invisible,0,.82,0,1.74,1.65,1.74,false),atlasBody);
 obstaclesDirty=true;
 state.phase='payload';state.wave=1;state.spawnIn=1;
 addSparks(vec(0,.2,0),0xe6ae7b,26,6);
 notice('Pod landed');sound('wave','Pod landed');rumble(.45,135);
}
function payloadTick(dt,realTime){
 if(state.phase==='drop'){
  state.prep=Math.max(0,state.prep-realTime);
  pod.visible=state.prep<4;
  pod.position.y=Math.max(0,state.prep/4)**1.27*22;
  trapTick(dt);
  if(!state.prep)landPayload();
  return;
 }
 state.podFuel=Math.max(0,state.podFuel-realTime*.85);
 if(state.podFuel>0)state.siege=Math.min(PAYLOAD_DURATION,state.siege+realTime);
 else{
  state.atlas=Math.max(0,state.atlas-realTime*7);
  if(state.atlas<=0){finish(false,'The recovery pod lost power');return}
 }
 state.stormRadius=lerp(15,100,state.podFuel/100);
 state.spawnIn-=dt;
 if(state.spawnIn<=0&&enemies.reduce((n,e)=>n+Number(e.active),0)<23){
  const wave=waves[state.wave-1],angle=rand()*TAU,radius=Math.max(18,state.stormRadius*.80);
  const site=safeFieldPoint(Math.cos(angle)*radius,Math.sin(angle)*radius,.55);
  if(site){
   makeHusk(pick(wave.units),site.x,site.z);
   addSparks(site.clone().add(vec(0,1.2,0)),0xc188ee,10,4.2);
  }
  state.spawnIn=Math.max(.86,2.12-state.wave*.20)*(state.overclock?.72:1);
 }
 trapTick(dt);updateHusks(dt);
 if(state.finished)return;
 moveBolts(dt);if(state.finished)return;
 while(state.siege>=state.wave*PAYLOAD_DURATION/MAX_WAVES){
  stageReward();
  if(state.wave===MAX_WAVES){finish(true,'Pod transmission recovered');return}
  const theta=state.wave*2.39;
  addCache(Math.cos(theta)*5.8,Math.sin(theta)*5.8,'airdrop');
  state.wave++;restock(24);
 }
 for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].active)enemies.splice(i,1);
}
function sealTick(dt,realTime){
 if(state.phase==='fuel'){
  trapTick(dt);
  return;
 }
 state.siege=Math.min(SEAL_DURATION,state.siege+realTime);
 state.spawnIn-=dt;
 const wave=waves[state.wave-1];
 if(state.spawnIn<=0&&enemies.reduce((n,e)=>n+Number(e.active),0)<22){
  const kind=pick(wave.units),[x,z]=pick(portals);
  makeHusk(kind,x+(rand()-.5)*2.4,z+(rand()-.5)*2.4);
  state.spawnIn=Math.max(1.18,3.15-state.wave*.32);
 }
 trapTick(dt);updateHusks(dt);
 if(state.finished)return;
 moveBolts(dt);
 if(state.finished)return;
 while(state.siege>=state.wave*SEAL_SLICE){
  const bonus=hero.cache===3&&!state.allClear;
  if(bonus)state.allClear=true;
  awardWave(bonus);
  bankSalvage(false,true);
  if(state.wave===MAX_WAVES){finish(true,'Rift sealed');return}
  state.wave++;
  hero.hp=Math.min(hero.maxhp,hero.hp+13);restock(21);
  const [x,z]=[[-5,7],[6,5],[-6,-6],[6,-6]][dropIndex++%4];
  addCache(x,z,'airdrop');
 }
}
const expedition=options.expedition;
const expeditionSites=[];
let expCart=null;
let expStage='',expRemaining=0,expProgress=0,expWave=0,expSpawn=0,expCounter=0,expBaseline=0,expRound=0,expMedkit=false;
const expKind=expedition?.kind;
const expHunt=['encampments','rescue','radar'].includes(expKind);
const expRandom=StormfrontData.random(objectiveSeed^0x7213);
const expAliases={basic:'husk',husky:'brute',pitcher:'spitter',lobber:'mortar',sploder:'demolisher',hive:'spitter',riot:'juggernaut',zapper:'beam',shielder:'phantasm',nurse:'husk',smasher:'juggernaut',blaster:'beam',taker:'phantasm',flinger:'catapult'};
function fieldSite(type,label,x,z,y){
 const site=safeFieldPoint(x,z,.6)||vec(x,terrainHeight(x,z),z);
 if(type==='rail'||type==='radar')site.set(x,terrainHeight(x,z),z);
 const g=groupAt(stage,site.x,y??site.y,site.z);
 const palette={balloon:0xe9ca80,survivor:0x97e49e,camp:0xca83f2,repair:0x73cbea,rail:0xffb776,radar:0x76d5fa,atlas:0x8ffff1,medkit:0xff9b94};
 const color=palette[type]||0x9ce7d9,metal=mat(color,color,.24);
 if(type==='balloon'){
  mesh(g,sphere,metal,0,.2,0,1.6,1.45,1.6);
  block(g,steel,0,-1.45,0,.73,.52,.77);
  for(const side of [-1,1])block(g,dark,side*.33,-.78,0,.032,1.02,.032).rotation.z=side*.18;
 }else if(type==='survivor'){
  const operative=gear?.teammate?.('recruit');
  if(operative)g.add(operative.model);
  else mesh(g,rock,metal,0,1.07,0,.47,.91,.37);
  ring(g,metal,.79,.05,.04);
 }else if(type==='atlas'){
  mesh(g,hex,steel,0,.14,0,1.83,.27,1.83);
  mesh(g,gem,metal,0,1.24,0,.61,.94,.61,false);
  ring(g,metal,1.26,.033,1.2);
 }else if(type==='rail'||type==='radar'){
  ring(g,metal,1.1,.028,.12);
  if(type==='radar')for(let h=0;h<3;h++)ring(g,metal,1.1,.028,h*LEVEL+.12);
 }else{
  block(g,steel,0,.32,0,.82,.57,.63);
  mesh(g,gem,metal,0,.94,0,.27,.37,.28,false);
  if(type==='camp')mesh(g,cyl,mat(color,color,.37),0,3.1,0,.11,5.5,.11,false);
 }
 const mark={type,label,group:g,x:site.x,z:site.z,y:g.position.y,done:false};
 if(type==='balloon')mark.hit=registerHit(block(g,invisible,0,.2,0,2.9,2.9,2.9,false),mark);
 if(type==='atlas')mark.hit=registerHit(block(g,invisible,0,1,0,1.45,2.3,1.45,false),mark);
 expeditionSites.push(mark);return mark;
}
function completeSite(site){
 site.done=true;site.group.visible=false;
 if(site.hit){removeTarget(shotProps,site.hit);site.hit=null}
 if(site.type==='rail'&&!site.laid){
  site.laid=groupAt(stage,site.x,site.y,site.z);
  for(const x of [-.44,.44])block(site.laid,steel,x,.19,0,.092,.10,GRID);
  for(let i=-2;i<=2;i++)block(site.laid,beam,0,.13,i*.61,1.26,.095,.18);
 }
}
function fieldSiteLocation(index,total,inner=35,spread=42){
 const angle=(objectiveSeed%264)/264*TAU+index/total*TAU,radius=inner+expRandom()*spread;
 return [Math.cos(angle)*radius,Math.sin(angle)*radius];
}
function prepareExpedition(){
 text(ui['atlas-name'],expedition.name);
 state.stormRadius=139;
 expStage='setup';
 for(const object of expedition.objects||[]){
  const [x,y,z]=object.at,g=groupAt(stage,x,terrainHeight(x,z)+y,z);
  const shapes={box:()=>box,cylinder:()=>cyl,sphere:()=>sphere,cone:()=>cone,octa:()=>gem,torus:()=>new T.TorusGeometry(.5,.08,6,18)};
  for(const part of object.model){
   const node=mesh(g,shapes[part.shape](),mat(Number('0x'+part.color.slice(1)),part.glow?Number('0x'+part.color.slice(1)):0),...part.at,...part.size,false);
   if(part.rotation)node.rotation.set(...part.rotation);
  }
 }
 if(expKind==='atlas'){
  for(let i=1;i<(expedition.levels||1);i++)fieldSite('atlas','ATLAS '+(i+1),ox+(i%2?8:-8),oz+(i===3?8:1));
 }
 if(expKind==='atlas'||expKind==='lightning'||expKind==='bomb'){
  const count=expKind==='atlas'?expedition.levels||1:expKind==='bomb'?2:2;
  for(let i=0;i<count+1;i++){const [x,z]=fieldSiteLocation(i,count+1,19,17);addFluxAt(x,z)}
 }
 if(expKind==='data'){atlasModel.visible=false;fieldSite('balloon','Weather balloon',ox,oz,10);expStage='balloon'}
 if(expKind==='repair'){
  for(let i=0;i<8;i++)fieldSite('repair','Repair module',...fieldSiteLocation(i,8));
  for(const site of expeditionSites)site.group.visible=false;
 }
 if(expKind==='evacuate'){expStage='siege';expRemaining=180;expCounter=40;expBaseline=state.takedowns}
 if(expKind==='bomb'){
  for(let i=0;i<9;i++)fieldSite('rail',i===0?'Armory track':'Rail segment',snapTile(ox),snapTile(oz)+(i+2)*GRID);
  expCart=groupAt(stage,0,0,0);
  block(expCart,steel,0,.26,0,1.14,.32,1.51);
  mesh(expCart,cyl,orange,0,.67,0,.35,.85,.35).rotation.x=Math.PI/2;
  for(const x of [-.5,.5])for(const z of [-.5,.5])mesh(expCart,cyl,dark,x,.18,z,.25,.12,.25).rotation.z=Math.PI/2;
  placeExpCart();

  expStage='rail';
 }
 if(expHunt){
  turnOffAtlas();expStage='search';expRemaining=expedition.seconds;
  if(expKind==='encampments')for(let i=0;i<9;i++)fieldSite('camp',i<5?'Encampment '+(i+1):'Bonus camp '+(i-4),...fieldSiteLocation(i,9));
  if(expKind==='rescue'){
   for(let i=0;i<8;i++)fieldSite('survivor',i===0?'Hank':'Survivor '+(i+1),...fieldSiteLocation(i,8,27,35));
   fieldSite('medkit','Hank’s medkit',...fieldSiteLocation(2,5,20,10));
  }
  if(expKind==='radar')for(const [index,z] of [-72,-37,53].entries()){
   const site=fieldSite('radar',['Timber radar','Masonry radar','Alloy radar'][index],0,snapTile(z));
   site.material=materials[index];
  }
 }
 expeditionStatus();
}
function placeExpCart(){
 if(!expCart)return;
 const begin=snapTile(oz)+10*GRID,end=snapTile(oz)+2*GRID;
 const z=expStage==='escort'?lerp(end,begin,expRemaining/28):['fortify','defend'].includes(expStage)?end:begin;
 expCart.position.set(snapTile(ox),terrainHeight(snapTile(ox),z),z);
}
function expNear(){
 return expeditionSites.find(site=>!site.done&&site.group.visible&&['repair','medkit','survivor','camp','rail'].includes(site.type)&&
  Math.abs(hero.pos.y-site.y)<2.35&&Math.hypot(hero.pos.x-site.x,hero.pos.z-site.z)<3.5);
}
function expNeeded(){
 return expKind==='atlas'?(expedition.levels||1):expKind==='lightning'||expKind==='bomb'?1:0;
}
function expPrompt(){
 const point=expNear();
 if(point){
  if(point.type==='rail')return '';
  if(point.type==='camp'&&expProgress>=5)return 'Clear bonus encampment';
  return point.type==='camp'?'Activate '+point.label:point.label;
 }
 if(objectiveDistance(hero.pos.x,hero.pos.z)>4.8||expHunt&&expProgress<5)return '';
 if(expKind==='encampments'&&expProgress>=5)return 'Extract';
 if(expStage==='setup'&&expKind==='repair')return 'Start shelter diagnostics';
 if(expStage==='fortify'||expStage==='setup'||expStage==='refuel')return state.flux>=expNeeded()?'Activate objective':'Need '+expNeeded()+' RiftGel';
 if(expStage==='rail'&&expProgress===9)return state.flux>=1?'Power the bomb cart':'Need 1 RiftGel';
 return '';
}
function expSpawnEnemy(x,z,hunt=false){
 const seen=expedition.roster?.map(id=>expAliases[id]||expedition.enemyBases?.[id]).filter(Boolean);
 const roster=seen?.length?seen:expRound>1?['husk','runner','brute','spitter','demolisher','phantasm']:['husk','runner','husk','spitter','brute'];
 const kind=roster[Math.floor(rand()*roster.length)],position=safeFieldPoint(x+(rand()-.5)*6,z+(rand()-.5)*6,.65);
 const enemy=makeHusk(Object.hasOwn(husks,kind)?kind:'husk',position?.x??x,position?.z??z);
 if(hunt)enemy.hunt=true;
}
function expStartDefense(seconds=expedition.seconds){
 expStage='defend';state.phase='exp-defense';expRemaining=seconds;expRound++;state.wave=expRound;
 expSpawn=.6;portalFx.forEach(p=>p.active=true);sound('wave','Assault incoming');
}
function expeditionInteraction(){
 const point=expNear();
 if(point&&point.type!=='rail'){
  if(point.type==='camp'){
   if(expStage!=='search'||(expeditionSites.indexOf(point)>=5&&expProgress<5))return false;
   expStage='camp';expWave=expeditionSites.indexOf(point)+1;expCounter=7+expProgress;expSpawn=.1;
   return true;
  }
  if(point.type==='survivor'&&point.label==='Hank'&&!expMedkit){notice('Hank: Bring back my medkit.');return true}
  completeSite(point);sound('pickup');
  if(point.type==='medkit'){expMedkit=true;return true}
  expProgress++;
  if(point.type==='repair'&&expProgress>=8){expStage='fortify';expRemaining=0}
  if(point.type==='survivor'&&expProgress>=6)finish(true,'Survivors evacuated');
  return true;
 }
 if(!expPrompt()||objectiveDistance(hero.pos.x,hero.pos.z)>4.8)return false;
 if(expKind==='encampments'&&expProgress>=5){finish(true,'Encampments cleared');return true}
 if(expKind==='repair'&&expStage==='setup'){expStage='scan';expRemaining=190;return true}
 if(expStage==='rail'){if(state.flux<1)return false;state.flux--;expStage='escort';expRemaining=28;expSpawn=1;return true}
 if(!['setup','fortify','refuel'].includes(expStage)||state.flux<expNeeded())return false;
 state.flux-=expNeeded();expStartDefense(expKind==='lightning'&&expRound>0?240:expedition.seconds);return true;
}
function expeditionStatus(){
 const status={
  setup:expKind==='repair'?'Start the diagnostics at the shelter':'Collect RiftGel, fortify, and activate',
  balloon:'Shoot down the weather balloon',search:expKind==='radar'?'Build the marked radar towers':expKind==='rescue'?'Find the stranded survivors':'Clear five encampments',
  fortify:'Fortify and activate the objective',scan:'Recover repair modules',raid:'Repel the repair raid',
  siege:'Stop the opening siege',rail:'Place snapped floors along the marked railway',escort:'Stay with the payload near the launcher',
  camp:'Clear the encampment',refuel:'Deposit more RiftGel',defend:expKind==='data'?'Data files '+Math.min(16,Math.floor((1-expRemaining/expedition.seconds)*16))+' / 16':'Defend the objective'
 };
 const goals={search:expProgress+' / '+(expKind==='radar'?3:expKind==='rescue'?6:5),scan:expProgress+' / 8',rail:expProgress+' / 9',siege:Math.min(40,state.takedowns-expBaseline)+' / 40'};
 text(ui.status,expedition.name);text(ui.remaining,(status[expStage]||'')+(goals[expStage]?' · '+goals[expStage]:''));
 text(ui.task,expRemaining>0?Math.floor(expRemaining/60)+':'+String(Math.ceil(expRemaining)%60).padStart(2,'0'):'RiftGel '+state.flux);
 text(ui.passStatus,'');
}
function expeditionTick(dt,realTime){
 const timed=['search','camp','scan','raid','siege','escort','defend'].includes(expStage)||expKind==='evacuate'&&expStage==='fortify';
 if(timed&&expRemaining>0&&(expStage!=='escort'||livePlayers().some(player=>player.pos.distanceTo(expCart.position)<9)))expRemaining=Math.max(0,expRemaining-realTime);
 placeExpCart();
 if(expKind==='data')state.stormRadius=Math.max(31,139-state.elapsed*.34);
 if(expStage==='scan'){
  for(const site of expeditionSites)if(!site.done&&site.type==='repair')
   site.group.visible=livePlayers().some(player=>Math.hypot(player.pos.x-site.x,player.pos.z-site.z)<13);
  if(!expRemaining){expStage='raid';expRemaining=65;expSpawn=.1}
 }
 if(expStage==='rail'||expKind==='radar'){
  const type=expKind==='radar'?'radar':'rail';
  for(const point of expeditionSites.filter(site=>site.type===type&&!site.done)){
   const floor=builds.get(coordinateKey('floor',point.x,point.z,0));
   const tower=type==='rail'||[0,1,2].every(level=>builds.get(coordinateKey('floor',point.x,point.z,level))?.material===point.material);
   if(floor&&tower){completeSite(point);expProgress++;sound('pickup')}
  }
  if(type==='radar'&&expProgress===3){finish(true,'Radar grid online');return}
 }
 const combat=['siege','raid','defend','camp','escort'].includes(expStage);
 if(combat){
  expSpawn-=dt;
  const limit=coop?18:12;
  if(expSpawn<=0&&enemies.filter(enemy=>enemy.active).length<limit){
   if(expStage==='camp'){
    const point=expeditionSites[expWave-1];
    if(expCounter>0){expCounter--;expSpawnEnemy(point.x,point.z,true);expSpawn=.6}
   }else if(expStage!=='siege'||expCounter>0){
    const [x,z]=expStage==='siege'?[ox+8,oz+8]:portals[Math.floor(rand()*portals.length)];
    if(expStage==='siege')expCounter--;
    expSpawnEnemy(x,z);expSpawn=expStage==='siege'?.48:expStage==='escort'?5:3.65;
   }
  }
 }
 trapTick(dt);updateHusks(dt);moveBolts(dt);
 for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].active)enemies.splice(i,1);
 if(state.finished)return;
 if(expStage==='siege'&&state.takedowns-expBaseline>=40){expStage='fortify';state.atlas=ATLAS_HP;expRemaining=600}
 if(expStage==='camp'&&expCounter===0&&!enemies.length){completeSite(expeditionSites[expWave-1]);expProgress++;expStage='search'}
 if(expKind==='encampments'&&expProgress===9){finish(true,'All encampments cleared');return}
 if(!timed||expRemaining>0)return;
 if(expStage==='fortify'&&expKind==='evacuate'){expStartDefense();return}
 if(expStage==='defend'){
  portalFx.forEach(p=>p.active=false);
  if(expKind==='lightning'&&expRound===1){expStage='refuel';state.phase='expedition';return}
  finish(true,'Objective secured');return;
 }
 if(expStage==='raid'){expStage='recover';for(const point of expeditionSites)if(!point.done)point.group.visible=true;return}
 if(expStage==='escort'){expStage='fortify';notice('Payload delivered. Defend the launcher.');return}
 if(['search','camp','siege'].includes(expStage))finish(expKind==='encampments'&&expProgress>=5,'Mission timer expired');
}
function expeditionHit(target){
 if(target.type!=='balloon'||target.done||expStage!=='balloon')return;
 completeSite(target);atlasModel.visible=true;expStage='fortify';notice('Recorder landed. Fortify the landing zone.');
}

function waveTick(dt,realTime=dt){
 if(expedition){expeditionTick(dt,realTime);return}
 if(state.mission==='nests'){nestTick(dt,realTime);return}
 if(state.mission==='payload'){payloadTick(dt,realTime);return}
 if(state.mission==='seal'){sealTick(dt,realTime);return}
 if(state.phase==='arming'){
  state.prep=Math.max(0,state.prep-realTime);
  if(state.prep>0){trapTick(dt);return}
  state.phase='active';
  for(const lane of plannedFronts())portalFx[lane].active=true;
 }
 if(state.phase!=='active'){trapTick(dt);return}
 state.waveTime+=dt;
 state.spawnIn-=dt;
 if(state.pending>0&&state.spawnIn<=0&&enemies.filter(enemy=>enemy.active).length<24)spawnHusk();
 trapTick(dt);
 updateHusks(dt);
 if(state.finished)return;
 if(state.pending===0&&!enemies.some(e=>e.active)){clearWave();return}
 moveBolts(dt);
}
function animateWorld(dt){
 riftDome.material.uniforms.uTime.value=state.elapsed;
 riftDome.position.set(state.mission==='nests'?0:ox,0,state.mission==='nests'?0:oz);
 const rim=state.stormRadius/49.7;
 riftDome.scale.set(rim,Math.max(.48,rim),rim);
 riftDome.material.uniforms.uPressure.value=['active','seal','payload','hunt','exp-defense'].includes(state.phase)?.26+state.wave*.086:.08;
 atlasCore.rotation.y+=dt*.91;
 atlasCore.position.y=Math.sin(state.elapsed*2)*.147;
 atlasRing.rotation.z+=dt*.48;
 atlasRing.rotation.y=Math.sin(state.elapsed*2)*.31;
 atlasBeacon.material.opacity=(.08+Math.sin(state.elapsed*2.01)*.03)*Math.max(.24,state.atlas/ATLAS_HP);
 const fronts=plannedFronts();
 for(const [index,portal] of portalFx.entries()){
  portal.rot.visible=portal.active;
  portal.survey.visible=!portal.active;
  portal.warning.visible=!portal.active&&fronts.includes(index);
  if(portal.warning.visible)portal.warning.scale.setScalar(.92+Math.sin(state.elapsed*3+index)*.08);
  portal.outer.rotation.y+=dt*.88;
  portal.rot.rotation.z=Math.sin(state.elapsed*2.4)*.18;
  portal.flare.material.opacity=portal.active?.9+Math.sin(state.elapsed*5.2)*.1:.08;
  portal.survey.rotation.y+=dt*.41;
 }
}

const xbox={a:'A',b:'B',x:'X',y:'Y',lb:'LB',rb:'RB',lt:'LT',rt:'RT',view:'View',menu:'Menu',ls:'LS',rs:'RS'};
const families={
 xbox,
 ps:{a:'✕',b:'○',x:'□',y:'△',lb:'L1',rb:'R1',lt:'L2',rt:'R2',view:'Create',menu:'Options',ls:'L3',rs:'R3'},
 ns:{a:'B',b:'A',x:'Y',y:'X',lb:'L',rb:'R',lt:'ZL',rt:'ZR',view:'−',menu:'+',ls:'L-Stick',rs:'R-Stick'},
 ouya:{a:'O',b:'A',x:'U',y:'Y',lb:'L1',rb:'R1',lt:'L2',rt:'R2',view:'System',menu:'Menu',ls:'L3',rs:'R3'}
};
let padInfo=null,padLabels=xbox,padFamily='xbox',lastPad=[],padIndex=-1,padMenuMove=false;
let mouseFire=false,mouseAim=false,mouseLook=false;
function family(gamepad){
 if(families[config.pad])return config.pad;
 const id=gamepad.id.toLowerCase();
 if(/045e|xbox|xinput/.test(id))return 'xbox';
 if(/054c|dualshock|dualsense|playstation|wireless controller/.test(id))return 'ps';
 if(/057e|nintendo|switch|joy-con/.test(id))return 'ns';
 if(/2836|ouya/.test(id))return 'ouya';
 return 'xbox';
}
function boardFocus(current,horizontal,vertical){
 if(state.screen!=='brief')return false;
 const cards=[...missionControls.values()],index=cards.indexOf(current);
 const active=missionControls.get(state.mission);
 let next=null;
 if(index>=0){
  if(horizontal&&index%2+horizontal>=0&&index%2+horizontal<2)next=cards[index+horizontal];
  if(vertical<0)next=index>=2?cards[index-2]:ui['region-picker'];
  if(vertical>0)next=index<2?cards[index+2]:ui['alert-toggle'];
  if(horizontal<0&&index%2===0)next=ui.deploy;
 }else if(current===ui['region-picker']&&vertical>0)next=active;
 else if(current===ui['alert-toggle']&&vertical<0)next=active;
 else if(current===ui.deploy&&(horizontal>0||vertical>0))next=active;
 if(!next)return false;
 next.focus({preventScroll:true});next.scrollIntoView({block:'nearest'});
 return true;
}
function rumble(strength,duration){
 if(remoteSeat)return;
 if(!config.vibration||state.look!=='pad')return;
 try{padInfo?.vibrationActuator?.playEffect('dual-rumble',{duration,strongMagnitude:strength,weakMagnitude:strength*.66}).catch(()=>{})}catch(error){}
}
function pollController(dt){
 if(emoteWheel)return null;
 padInfo=options.local||config.pad!=='kb'?StormwatchHub.controllerPad():null;
 if(!padInfo){
  lastPad=[];padIndex=-1;padMenuMove=false;
  if(state.look==='pad'){state.look='keys';syncBriefing()}
  return null;
 }
 const buttons=Array.from({length:17},(_,i)=>(padInfo.buttons[i]?.value||0)>.36||!!padInfo.buttons[i]?.pressed);
 const samePad=padIndex===padInfo.index;
 const edge=i=>samePad&&buttons[i]&&!lastPad[i];
 const dz=n=>Math.abs(n)>.16?Math.sign(n)*(Math.abs(n)-.16)/.84:0;
 const [side,negativeAhead,rx,ry]=Array.from({length:4},(_,i)=>dz(padInfo.axes[i]||0));
 const type=family(padInfo);
 if((buttons.some(Boolean)||[side,negativeAhead,rx,ry].some(n=>Math.abs(n)>.15))&&(state.look!=='pad'||type!==padFamily)){
  state.look='pad';padFamily=type;padLabels=families[type];syncBriefing();
 }
 if(state.edit){editPad(edge);return padResult()}
 if(state.paused||state.screen==='pack'){
  const confirm=padFamily==='ns'?1:0,back=padFamily==='ns'?0:1;
  const axisMove=Math.abs(side)>.48||Math.abs(negativeAhead)>.48;
  const move=edge(14)||edge(12)?-1:edge(15)||edge(13)?1:axisMove&&!padMenuMove?(Math.abs(side)>.48?Math.sign(side):Math.sign(negativeAhead)):0;
  padMenuMove=axisMove;
  const current=fieldFocus();
  if(move&&boardFocus(current,edge(14)?-1:edge(15)?1:0,edge(12)?-1:edge(13)?1:0))return padResult();
  if(move&&current===ui['trap-picker']&&Math.abs(move)===1&&(edge(14)||edge(15))){
   state.recipe=(state.recipe+move+trapRecipes.length)%trapRecipes.length;updateTrapPicker();
  }else if(move){
   const available=[...ui.screen.querySelectorAll('button:not(:disabled),select:not(:disabled),input[data-audio-option]')].filter(node=>!node.closest('[hidden]'));
   const control=current;
   if(control?.matches('input[type=range]')&&(edge(14)||edge(15))){
    if(edge(14))control.stepDown();else control.stepUp();
    control.dispatchEvent(new Event('input',{bubbles:true}));
    return padResult();
   }
   if(control?.matches('select')&&(edge(14)||edge(15))){
    control.selectedIndex=(control.selectedIndex+move+control.options.length)%control.options.length;
    control.dispatchEvent(new Event('change',{bubbles:true,composed:true}));
    return padResult();
   }
   const x=edge(14)?-1:edge(15)?1:!edge(12)&&!edge(13)&&Math.abs(side)>.48?Math.sign(side):0;
   const next=StormwatchHub.directionalControl(available,control,x,x?0:move);
   if(next){next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'nearest'})}
  }
  if(edge(confirm)){
   const current=fieldFocus(),action=current?.dataset.action;
   if(action)menuAction(action,false);
   else if(current?.matches('button,input[type=checkbox]'))current.click();
  }else if(edge(back)){
   menuAction(state.screen==='citadel'?'citadelBack':state.screen==='pause'||state.screen==='pack'?'deploy':'exit',false);
  }else if(edge(9)&&(state.screen==='pause'||state.screen==='pack')||edge(8)&&state.screen==='pack')menuAction('deploy',false);
 }else if(edge(9))showScreen('pause');
 else{
  const bend=n=>Math.sign(n)*Math.abs(n)**1.55;
  hero.yaw-=bend(rx)*dt*3.05*config.sensitivity;
  hero.pitch=clamp(hero.pitch-bend(ry)*dt*2.38*config.sensitivity,-1.16,.97);
  if(edge(11)){openEditor();return padResult()}
  if(edge(8)){showScreen('pack');return padResult()}
  if(edge(0))jump();
  if(edge(2)&&!interactField())reload();
  if(edge(3))switchWeapon();
  if(edge(4))toggleBuilding();
  if(edge(1))fortify();
  if(edge(5)){if(state.building)fortify();else useAbility()}
  if(!state.building&&edge(14))state.ability=(state.ability+3)%4;
  if(!state.building&&edge(15))state.ability=(state.ability+1)%4;
  if(!state.building&&edge(13))playEmote();
  if(state.building){
   if(edge(6))cycleMaterial();
   if(edge(14))selectPiece(0);
   if(edge(12))selectPiece(1);
   if(edge(15))selectPiece(2);
   if(edge(13))selectPiece(4);
  }else if(edge(12))craftAmmo();
 }
 return padResult();
 function padResult(){
  lastPad=buttons;padIndex=padInfo.index;
  return {side,ahead:-negativeAhead,fire:buttons[7],aim:buttons[6],place:buttons[7]&&!pollController.wasFire,sprint:buttons[10]};
 }
}
pollController.wasFire=false;

function toggleBuilding(){
 state.building=!state.building;
 hero.reload=0;hero.swingTime=0;
 if(state.building)hero.aim=false;
}
function selectPiece(piece){
 if(!state.building)toggleBuilding();
 state.piece=piece;
}
function cycleMaterial(){
 state.material=(state.material+1)%materials.length;
}
function bodyPause(){
 if(state.finished||state.screen==='brief')return;
 showScreen('pause');
}
function requestMouse(){
 if(options.local)return;
 state.look='keys';syncBriefing();
 if(document.pointerLockElement===canvas)return;
 if(!canvas.requestPointerLock){state.pointerHint=true;return}
 try{
  canvas.requestPointerLock()?.catch(()=>{state.pointerHint=true});
 }catch(error){state.pointerHint=true}
}
function deploy(lock){
 unlockAudio();
 if(state.finished)return;
 const savedProfile=citadel?.snapshot()||profile;
 if(!state.deployed&&!options.hub&&!coop&&StormwatchCitadel.rating(savedProfile).power<region.floor&&
   !operations.campaignProgress(savedProfile).unlocked.includes(regionId)){
  ui.summary.textContent=region.name+' requires Power '+region.floor;return;
 }
 if(!state.deployed){
  state.deployed=true;state.started=Date.now();
  if(coop){
   const seat=Math.max(1,[...coop.names.keys()].indexOf(coop.id));
   const x=coop.host?-4.5:2.9,z=coop.host?11:10+2*seat;
   const spawn=safeFieldPoint(x,z,.7);
   if(spawn)hero.pos.copy(spawn);
  }
  const alert=operations.dailyAlert(operations.windows(state.started).day);
  if(state.alertRequested&&alert.mission===state.mission)state.modifier=alert;
  if(expedition){prepareExpedition();state.phase='expedition'}
  if(state.mission==='nests')prepareNests();
  if(state.mission==='payload')preparePayload();
  if(state.finished)return;
  if(state.mission==='seal'){
   state.phase='fuel';if(!guest)addFluxCrystals();text(ui['atlas-name'],'Rift Anchor');
   ui['atlas-meter'].setAttribute('aria-label','Rift Anchor integrity');
  }
  if(state.mission==='defense'&&!guest)addFluxCrystals();
  profile=savedProfile;squad=StormwatchCitadel.rating(profile);
  if(state.mission==='defense'&&!guest){
   const fort=profile.outposts?.[regionId];
   state.outpostTier=options.shield?Math.min(5,options.shield.stage-1):Math.min(5,profile.outpostWins?.[regionId]||0);
   if(fort?.seed===mapSeed){
    for(const index of (fort.layoutVersion===3?fort.cleared:[])){const prop=props[index];if(prop?.alive){prop.hp=0;breakProp(prop,vec(prop.x,prop.y,prop.z),true)}}
    syncBuilds(fort.rows);
   }
  }
  const resilience=StormwatchCitadel.fieldResearch(profile).resilience;
  hero.maxhp=100+(squad.vital.Vitality-10)*2+6*resilience;
  hero.maxShield=60+Math.round((squad.vital.Toughness-10)*1.3)+3*resilience;
  hero.hp=hero.maxhp;hero.shield=hero.maxShield;
  for(let i=0;i<guns.length;i++){
   const key=inventory?null:profile.fieldLoadout?.[i];
   if(key&&gear?.canForge(key)&&profile.blueprints[key]?.kind==='weapon'){
    guns[i].model?.parent?.remove(guns[i].model);guns[i]=gear.weapon(key);repaintWeaponSlot(i);
   }
   guns[i]=armWeapon(guns[i],12);
  }
  loadField();
  if(inventory){hero.maxhp+=inventory.fort[0]*2;hero.maxShield+=inventory.fort[2]*1.4;hero.hp=hero.maxhp;hero.shield=hero.maxShield;}
 }
 state.paused=false;state.screen='play';
 ui.screen.hidden=true;ui.hud.hidden=false;
 if(surface.activeElement instanceof HTMLElement)surface.activeElement.blur();
 canvas.focus({preventScroll:true});
 if(lock)requestMouse();
 cameraTick(0);
}
function menuAction(action,lock){
 if(action==='deploy')deploy(lock);
 if(action==='exit')ui.exit.onclick();
 if(action==='pass')options.leave?.('pass');
 if(action==='citadel'&&citadel)citadel.prepareUI().then(attach=>{
  if(controller.signal.aborted)return;
  showScreen('citadel');unmountCitadel=attach(ui['citadel-root']);
 }).catch(()=>{ui.summary.textContent='Citadel management could not load.'});
 if(action==='citadelBack'){
  unmountCitadel?.();unmountCitadel=null;
  showScreen('brief');
 }
 if(action==='drop-stock'){dropSupplies();fillPack()}
 if(action==='craft'){craftAmmo();fillPack()}
 if(action==='fabricate'||action==='field-crate')fabricateWeapon(lock,action==='field-crate');
 if(action==='traps'){selectPiece(3);deploy(lock)}
 if(action==='retry'){if(options.leave)options.leave('retry',{region:regionId,mission:state.mission,alert:state.alertRequested});else location.reload()}
 if(action==='help'){
  ui.guide.hidden=!ui.guide.hidden;
  ui.help.setAttribute('aria-expanded',String(!ui.guide.hidden));
  syncBriefing();
 }
 if(action==='audio'){
  const panel=ui['field-audio-settings'],button=ui['field-audio'];
  panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
  if(!panel.hidden)panel.querySelector('input').focus();
 }
}
for(const button of [ui.deploy,ui.retry,ui.pass,ui.help,ui.craft,ui['drop-stock'],ui['field-crate'],ui.fabricate,ui.traps,ui.citadel,ui['citadel-back'],ui['field-audio']]){
 button.onclick=event=>menuAction(button.dataset.action,event.detail>0||state.look!=='pad');
}
const fieldFullscreen=ui['field-fullscreen'];
listen(fieldFullscreen,'click',async()=>{
 try{
  if(document.fullscreenElement)await document.exitFullscreen();
  else await document.documentElement.requestFullscreen({keyboardLock:'browser',navigationUI:'hide'});
 }catch{fieldFullscreen.textContent='Fullscreen unavailable'}
});
listen(document,'fullscreenchange',()=>{
 const active=Boolean(document.fullscreenElement);
 fieldFullscreen.textContent=active?'Exit fullscreen':'Fullscreen';
 if(active)navigator.keyboard?.lock?.(['Escape'])?.catch(()=>{});
 else navigator.keyboard?.unlock?.();
});
function focusedButton(){
 const button=state.screen==='result'?ui.retry:state.screen==='citadel'?ui['citadel-back']:state.screen==='pack'?ui['pack-close']:ui.deploy;
 button.focus({preventScroll:true});
}
function syncBriefing(){
 const p=state.look==='pad'?padLabels:null;
 ui['controls-fight'].textContent=p?p.ls+' move · '+p.rs+' look · '+p.a+' jump · '+p.rt+' attack · '+p.y+' swap · '+p.x+' reload':
  'WASD move · Space jump · LMB attack · 1–4 / V equip · R reload';
 ui['controls-build'].textContent=p?p.lb+' build · D-pad pieces · '+p.lt+' material · '+p.rt+' place · '+p.rs+' edit':
  'Q build · 1–4 pieces · T trap · RMB material · B edit · G repair';
 ui['controls-mission'].textContent=p?p.view+' field kit · '+p.x+' interact / reload · '+p.rb+' ability · D-pad ↓ emotes':
  'I / Tab inventory · E emotes · F interact · 5–8 abilities · C craft ammo';
}
const trapPicker=ui['trap-picker'];
for(const [index,recipe] of trapRecipes.entries()){
 const option=document.createElement('option');option.value=index;
 option.textContent=recipe.name+' · '+recipe.mount;trapPicker.append(option);
}
function trapCost(recipe){
 return recipe.cost.map((n,i)=>n?n+' '+materials[i].name:'').filter(Boolean).join(' · ');
}
function updateTrapPicker(){
 const recipe=trapRecipes[state.recipe];trapPicker.value=state.recipe;
 text(ui['trap-recipe'],trapCost(recipe)+' / '+recipe.charges+' charges');
}
trapPicker.onchange=()=>{state.recipe=Number(trapPicker.value);updateTrapPicker()};
const fabricationPicker=ui['fabrication-picker'];
const fabricationBag={parts:5,powder:3,gears:2};
const fabricationStocks=[8,4,10];
function fabricateChoices(){
 if(inventory)return inventory.choices();
 return Object.entries(profile.blueprints).filter(([id,item])=>item.kind==='weapon'&&gear?.canForge(id));
}
function updateFabricator(){
 const available=fabricateChoices(),current=fabricationPicker.value;
 ui.fabricator.hidden=!available.length;ui.fabricate.hidden=!available.length;
 fabricationPicker.replaceChildren(...available.map(([id,item])=>{
  const option=document.createElement('option');option.value=id;option.textContent=item.name;return option;
 }));
 if(available.some(([id])=>id===current))fabricationPicker.value=current;
 const field=Object.entries(fabricationBag).map(([key,n])=>
  fieldBag[key]+'/'+n+' '+StormwatchCitadel.components[key]);
 const stock=fabricationStocks.map((n,i)=>hero.stacks[i]+'/'+n+' '+materials[i].name);
 text(ui['fabrication-cost'],[...field,...stock].join(' · '));
 if(inventory){
  ui['field-crate'].hidden=true;
  text(ui['fabrication-cost'],inventory.cost(fabricationPicker.value));
  ui.fabricate.disabled=!available.length;return;
 }
 ui.fabricate.disabled=!available.length||Object.entries(fabricationBag).some(([key,n])=>fieldBag[key]<n)||
  fabricationStocks.some((n,i)=>hero.stacks[i]<n);
}
function weaponCrate(key,x,z,power,element){
 if(!guest)while(loot.some(l=>l.kind==='weapon'&&l.active&&Math.hypot(l.x-x,l.z-z)<.07))x+=.16;
 addCache(x,z,'weapon');
 const item=loot.at(-1);
 Object.assign(item,{opened:true,reward:{k:key,name:profile.blueprints[key]?.name||key},power,element});
}
function fabricateWeapon(lock,drop=false,key=fabricationPicker.value){
 if(inventory){
  if(drop||state.screen!=='pack'||!gear?.canForge(key))return;
  persistField();
  const bag=inventoryBag(),record=inventory.craft(key,bag);
  if(!record){text(ui['pack-status'],'Missing materials or backpack weapon space.');return}
  const weapon=gear.weapon(key),index=openWeaponSlot();
  const reserve=guns[index]?.reserve||0;
  guns[index]?.model?.parent?.remove(guns[index].model);
  guns[index]=armWeapon({...weapon,record},Math.max(12,region.floor));
  guns[index].mag=record.clip;guns[index].condition=record.condition;
  guns[index].reserve=reserve;
  hero.stacks=['Wood','Stone','Metal'].map(id=>bag[id]||0);
  for(const [id,name] of Object.entries(fieldStash))if(Object.hasOwn(fieldBag,id))fieldBag[id]=bag[name]||0;
  repaintWeaponSlot(index);switchWeapon(index);persistField();fillPack();text(ui['pack-status'],'Crafted '+weapon.name);sound('pickup');return;
 }
 if(state.screen!=='pack'||ui.fabricate.disabled||!fabricateChoices().some(([id])=>id===key))return;
 if(Object.entries(fabricationBag).some(([id,n])=>fieldBag[id]<n)||fabricationStocks.some((n,i)=>hero.stacks[i]<n))return;
 if(guest){coopAction('fabricate',{key,drop});deploy(lock);return}
 for(const [id,n] of Object.entries(fabricationBag))fieldBag[id]-=n;
 hero.stacks=hero.stacks.map((n,i)=>n-fabricationStocks[i]);
 if(drop){
  const design=StormwatchCitadel.tune(profile.blueprints[key]);
  weaponCrate(key,hero.pos.x,hero.pos.z,Math.max(region.floor,Math.round(design.power)),design.element||'Kinetic');
  deploy(lock);return;
 }
 const weapon=gear.weapon(key);
 const index=openWeaponSlot();
 guns[index]?.model?.parent?.remove(guns[index].model);
 guns[index]=armWeapon(weapon,Math.max(12,region.floor));
 repaintWeaponSlot(index);switchWeapon(index);
 deploy(lock);sound('pickup');
}
function equipFieldItem(item){
 if(!gear?.canForge(item.key)||item.condition<=0)return;
 persistField();
 const index=openWeaponSlot();
 const old=guns[index],reserve=old?.reserve||0,weapon=gear.weapon(item.key);
 old?.model?.parent?.remove(old.model);
 guns[index]=armWeapon({...weapon,record:item},Math.max(12,region.floor));
 Object.assign(guns[index],{mag:Math.min(guns[index].stats.m,item.clip),condition:item.condition,reserve});
 repaintWeaponSlot(index);switchWeapon(index);persistField();fillPack();
}
const iconPaths={
 pickaxe:'<path fill="#e2bb89" d="M19 26 45 7l3 4-26 20Z"/><path fill="#9dc5d4" d="M35 9c8-8 19-6 23 3l-6 1-7-4-8 5Z"/>',
 gun:'<path fill="#b5c5cd" d="m4 22 12-6h22l10-5h13v3l-12 2-8 4-7 1-4 8-8 1 3-9-10 1-7 5Z"/><path fill="#dcb483" d="M25 15V12h9v3Z"/>',
 wall:'<path fill="#73acc2" d="m13 9 35-4v23l-35 4Z"/><path fill="#b1d9de" d="m20 9 3-1v22l-3 1Zm15-2 3-1v23l-3 1Z"/>',
 floor:'<path fill="#83b7c9" d="m4 20 26-10 30 8-27 11Z"/><path fill="#d1e4e0" d="m12 17 30 9 4-2-30-9Z"/>',
 ramp:'<path fill="#7bb1ca" d="m8 28 27-21 20 6v15Z"/><path fill="#c0e2e0" d="m14 23 31-6 4-4-26 5Z"/>',
 cap:'<path fill="#83b7c9" d="m6 25 25-19 28 19-26 6Z"/><path fill="#cadfe6" d="m31 6 2 25-27-6Z"/>',
 trap:'<path fill="#60798d" d="m5 22 25-9 29 8-27 10Z"/><path fill="#d7b28d" d="m15 23 4-10 3 9m6-3 5-13 4 11m3 7 6-11 4 9Z"/>'
};
const packCategories=[
 ['all','All','grid'],['weapons','Weapons','gun'],['ammo','Ammo','ammo'],
 ['traps','Traps','trap'],['materials','Crafting Materials','materials']
];
const packArt={
 grid:'<path fill="currentColor" d="M10 5h18v11H10zm26 0h18v11H36zM10 21h18v11H10zm26 0h18v11H36z"/>',
 ammo:'<path fill="#f0dc9c" d="M12 29V13l5-8 5 8v16Zm15 0V9l5-7 5 7v20Zm15 0V14l5-8 5 8v15Z"/><path fill="#a27b4b" d="M12 24h10v6H12zm15 0h10v6H27zm15 0h10v6H42z"/>',
 materials:'<path fill="#b68c62" d="M7 23 39 7l18 9-33 16Z"/><path fill="#e3b57e" d="m7 23 17 9v-6l-17-9Zm17 3 33-16v6L24 32Z"/><path fill="#f0cf9a" d="m7 17 32-16 18 9-33 16Z"/>',
 metal:'<path fill="#647f96" d="M5 22 32 9l26 5v8L30 34 5 29Z"/><path fill="#c5d8dd" d="M5 22 32 9l26 5-28 12Z"/><path fill="#8faab5" d="m30 26 28-12v8L30 34Z"/>',
 stone:'<path fill="#b9a28e" d="m5 24 8-13 18-7 18 7 9 12-14 9H18Z"/><path fill="#8e7e72" d="m13 11 16 8 20-8 9 12-14 9-15-13-11 13L5 24Z"/>',
 component:'<path fill="#7ebdc4" d="m18 3 28 0 12 15-12 15H18L6 18zm4 6-7 9 7 9h20l7-9-7-9z"/><path fill="#e8b787" d="M27 11h10l6 7-6 7H27l-6-7z"/>',
 fiber:'<path fill="#8fc5a2" d="M10 30 19 12l5 9 8-17 6 13 10-9 6 5-6 12-16 7Z"/><path fill="#d9d19e" d="m13 28 14-3L49 9l4 4-22 16-14 4Z"/>'
};
let packCategory='all',packSelection='',packEntries=[],packHover=null;
function packNode(tag,label='',className=''){
 const element=document.createElement(tag);element.textContent=label;element.className=className;return element;
}
function packPicture(kind,src=''){
 if(src){
  const img=document.createElement('img');img.src=src;img.alt='';return img;
 }
 const template=document.createElement('template');
 template.innerHTML='<svg viewBox="0 0 64 36" aria-hidden="true">'+(packArt[kind]||iconPaths[kind])+'</svg>';
 return template.content.firstElementChild;
}
function packWeapon(key,gun,item,slot){
 const stats=gun?.stats,condition=gun?.condition??item?.condition;
 const broken=condition!==undefined&&condition<=0;
 let label='',action;
 if(broken&&inventory&&item){
  label='Recycle';
  action=()=>{
   inventory.recycle(item.uid);
   if(slot!==undefined)gun.record=null;
   persistField();fillPack();
  };
 }else if(slot!==undefined&&hero.weapon!==slot&&!broken){
  label='Equip';action=()=>{switchWeapon(slot);persistField();fillPack()};
 }else if(slot===undefined&&item&&!broken){
  label='Equip';action=()=>equipFieldItem(item);
 }
 const maxCondition=item?.max||100;
 const details=[
  ['Power',gun?.power],['Element',gun?.element],
  ['Base damage',stats&&Math.round(stats.d*10)/10],
  ['Rate of fire',stats?.r&&Math.round(60/stats.r)+' rpm'],
  ['Magazine',stats&&((slot===undefined?item?.clip:gun.mag)??stats.m)+' / '+stats.m],
  ['Reload',stats?.rl&&Number(stats.rl.toFixed(2))+' s'],
  ['Durability',condition===undefined?undefined:broken?'Broken':Math.ceil(condition)+' / '+maxCondition]
 ];
 return {id:item?.uid||'weapon-'+slot,name:item?.name||gun?.name||key,kind:'gun',icon:gun?.icon,
  category:'weapons',type:gun?.type||'Ranged weapon',tint:broken?'#bb6e64':slot===hero.weapon?'#dfb35c':'#b98b57',
  tag:slot===hero.weapon?'Held':slot!==undefined?'Slot '+(slot+1):'',quantity:condition===undefined?'':broken?'!':Math.ceil(condition/maxCondition*100)+'%',
  details,label,action,drop:inventory&&item?{uid:item.uid}:null};
}
function packResource(name,count){
 const ammo=name==='Ammo',kind=ammo?'ammo':name==='Wood'||name==='Planks'?'materials':name==='Stone'||/Ore|Quartz|Copper|Obsidian/.test(name)?'stone':name==='Metal'?'metal':/Twine/.test(name)?'fiber':'component';
 const tint=ammo?'#b3a265':kind==='materials'?'#9b7254':kind==='stone'?'#9a8e87':kind==='fiber'?'#6d987e':'#5c91a5';
 return {id:'resource-'+name,name,kind,tint,category:ammo?'ammo':'materials',type:ammo?'Weapon supplies':'Crafting material',
  quantity:count.toLocaleString(),details:[['Carried',count.toLocaleString()]],drop:inventory&&count>0?{name,count}:null};
}
function buildPackEntries(){
 const carried=inventory?inventoryBag():Object.fromEntries([
  ...materials.map((material,index)=>[material.name,hero.stacks[index]]),
  ...Object.entries(fieldBag).map(([id,n])=>[StormwatchCitadel.components[id]||id,n]),
  ['Ammo',guns.reduce((sum,gun)=>sum+gun.reserve,0)]
 ]);
 const entries=guns.map((gun,index)=>packWeapon(gun.k,gun,gun.record,index));
 const equipped=new Set(guns.map(gun=>gun.record?.uid));
 for(const item of inventory?.list()||[]){
  if(equipped.has(item.uid))continue;
  const meta=gear?.itemInfo?.(item.key);
  const gun=meta?armWeapon(meta,Math.max(12,region.floor)):null;
  entries.push(packWeapon(item.key,gun,item));
 }
 for(const item of citadel?.snapshot()?.backpack||[]){
  if(!gear?.canForge(item.key))continue;
  const meta=gear.itemInfo?.(item.key),design=item.design;
  const gun=meta?armWeapon(meta,region.floor,undefined,design):null;
  entries.push({id:'citadel-'+item.serial,name:design.name,kind:'gun',icon:meta?.icon,category:'weapons',
   tint:'#9f87c1',tag:'Stowed',type:meta?.type||'Stowed weapon',
   details:[['Schematic level',design.level],['Tier',design.tier],['Power',gun?.power]],
   label:'Equip',async action(){
    ui['pack-item-action'].disabled=true;
    if(await citadel.dispatch({type:'unpack-weapon',serial:item.serial})){
     equipLoot({k:item.key,name:design.name,power:StormwatchCitadel.tune(design).power},design);
    }
    if(!controller.signal.aborted)fillPack();
   }});
 }
 for(const [name,count] of Object.entries(carried)){
  if(typeof count==='number'&&(count>0||name==='Ammo'))entries.push(packResource(name,count));
 }
 for(const [index,recipe] of trapRecipes.entries()){
  entries.push({id:'trap-'+index,name:recipe.name,kind:'trap',category:'traps',tint:'#618fa6',tag:'Plan',type:recipe.mount+' trap plan',
   details:[['Materials',trapCost(recipe)],['Charges',recipe.charges]],
   label:'Build trap',action:()=>{
    state.recipe=index;updateTrapPicker();menuAction('traps',state.look==='keys');
   }});
 }
 const load=Object.values(carried).reduce((sum,n)=>sum+(Number(n)||0),0),capacity=inventory?.capacity?.();
 const totals=load.toLocaleString()+(capacity?' / '+capacity.toLocaleString():'')+' supplies';
 return {entries,totals};
}
function inspectPackItem(entry){
 const inspector=ui['pack-inspector'];inspector.hidden=!entry;
 if(!entry)return;
 inspector.style.setProperty('--item-tint',entry.tint);
 text(ui['pack-detail-name'],entry.name);
 text(ui['pack-detail-type'],entry.type+(entry.tag?' · '+entry.tag:''));
 ui['pack-detail-stats'].replaceChildren(...entry.details
  .filter(([,data])=>data!==undefined&&data!==null).flatMap(([label,data])=>[packNode('dt',label),packNode('dd',data)]));

}
function updatePackActions(entry){
 const action=ui['pack-item-action'],drop=ui['pack-drop'],quantity=ui['pack-quantity'];
 action.hidden=!entry?.action;action.disabled=false;action.onclick=entry?.action||null;
 text(action,entry?.label||'');
 drop.hidden=!entry?.drop;drop.disabled=!!pendingDrop;
 ui['pack-quantity-wrap'].hidden=!entry?.drop?.count;
 quantity.max=entry?.drop?.count||1;quantity.value=1;
 drop.onclick=entry?.drop?()=>dropBackpackItem(entry,Number(quantity.value)):null;
}
function renderPackGrid(){
 const query=ui['pack-search'].value.trim().toLowerCase();
 const visible=packEntries.filter(entry=>(packCategory==='all'||entry.category===packCategory)&&
  (!query||(entry.name+' '+entry.type).toLowerCase().includes(query)));
 if(!visible.some(entry=>entry.id===packSelection))packSelection=visible[0]?.id||'';
 const grid=ui['pack-items'],focused=fieldFocus();packHover=null;
 grid.replaceChildren(...visible.map(entry=>{
  const card=packNode('button','','pack-card');card.type='button';card.dataset.packItem=entry.id;
  card.style.setProperty('--item-tint',entry.tint);
  card.setAttribute('aria-label',entry.name+(entry.quantity?' · '+entry.quantity:'')+(entry.tag?' · '+entry.tag:''));
  card.setAttribute('aria-pressed',String(entry.id===packSelection));
  card.append(packPicture(entry.kind,entry.icon));
  if(entry.tag)card.append(packNode('span',entry.tag,'pack-card-tag'));
  if(entry.quantity)card.append(packNode('span',entry.quantity,'pack-card-count'));
  card.onclick=()=>{
   packSelection=entry.id;
   for(const other of grid.children)other.setAttribute('aria-pressed',String(other===card));
   inspectPackItem(entry);updatePackActions(entry);
  };
  card.onpointerenter=event=>{
   if(event.pointerType==='touch')return;
   packHover=card;inspectPackItem(entry);
  };
  card.onpointerleave=()=>{
   if(packHover!==card)return;
   packHover=null;inspectPackItem(visible.find(v=>v.id===packSelection));
  };
  card.onfocus=()=>{
   if(card.matches(':focus-visible'))card.onclick();
  };
  return card;
 }));
 if(!visible.length)grid.append(packNode('p',query?'No matching items.':'Nothing in this section.','pack-empty'));
 const selection=visible.find(entry=>entry.id===packSelection);
 inspectPackItem(selection);updatePackActions(selection);
 if(focused?.dataset.packItem||focused===ui['pack-item-action']&&focused.hidden)
  grid.querySelector('[aria-pressed=true]')?.focus({preventScroll:true});
}
function renderSchematics(){
 ui['pack-schematics'].replaceChildren(...fabricateChoices().map(([key,entry])=>{
  const card=packNode('button','','pack-schematic');card.type='button';
  card.setAttribute('aria-label','Craft '+entry.name);
  const cost=inventory?inventory.cost(key):'5 Parts · 3 Powder · 2 Gears + building supplies';
  card.append(packPicture('gun',gear?.itemInfo?.(key)?.icon),packNode('strong',entry.name),packNode('small',cost));
  card.onclick=()=>fabricateWeapon(state.look==='keys',false,key);
  return card;
 }));
}
function filterPackRecipes(){
 let recipes=0;
 for(const control of ui.pack.querySelectorAll('[data-pack-recipe]')){
  control.hidden=(packCategory!=='all'&&packCategory!==control.dataset.packRecipe)||
   (control===ui['pack-schematics']&&!control.children.length)||(!!inventory&&control.dataset.packRecipe==='materials');
  if(!control.hidden)recipes++;
 }
 ui['pack-no-recipes'].hidden=recipes>0;
}
function renderPackHotbar(){
 ui['pack-hotbar'].replaceChildren(...Array.from({length:hotbarCapacity},(_,index)=>{
  const gun=guns[index],slot=packNode('span','','slot');
  slot.dataset.empty=String(!gun);slot.dataset.selected=String(!!gun&&index===hero.weapon);
  slot.setAttribute('aria-label',gun?.name||'Empty weapon slot '+(index+1));
  slot.append(packPicture('gun',gun?.icon),packNode('kbd',index+2));
  return slot;
 }));
}
function fillPack(){
 if(state.screen!=='pack')return;
 updateTrapPicker();updateFabricator();
 ui['field-crate'].disabled=ui.fabricate.disabled;
 ui['field-crate'].hidden=!!inventory||ui.fabricate.hidden;
 ui['drop-stock'].disabled=hero.stacks.some(n=>n<10);
 ui.craft.disabled=hero.stacks[1]<6||hero.stacks[2]<4||guns.every(gun=>gun.reserve>=360);
 const {entries,totals}=buildPackEntries();packEntries=entries;
 const quantity=packEntries.filter(item=>item.category==='weapons').length;
 text(ui['pack-count'],quantity+' weapons · '+totals);
 text(ui['pack-subtitle'],[gear?.operatorName,zoneName,'Wave '+Math.max(1,state.wave)].filter(Boolean).join(' · '));
 renderSchematics();renderPackHotbar();filterPackRecipes();renderPackGrid();
}
ui['pack-categories'].append(...packCategories.map(([id,label,icon])=>{
 const tab=packNode('button');tab.type='button';tab.dataset.packCategory=id;
 tab.setAttribute('aria-pressed',String(id===packCategory));
 tab.append(packPicture(icon),packNode('span',label));
 tab.onclick=()=>{
  packCategory=id;
  for(const el of ui['pack-categories'].children)el.setAttribute('aria-pressed',String(el===tab));
  filterPackRecipes();renderPackGrid();ui['pack-items'].scrollTop=0;
 };
 return tab;
}));
ui['pack-search'].oninput=()=>{renderPackGrid();ui['pack-items'].scrollTop=0};
ui['pack-close'].onclick=event=>deploy(event.detail>0||state.look==='keys');
const regionPicker=ui['region-picker'];
function updateRegions(){
 const saved=citadel?.snapshot()||profile,power=StormwatchCitadel.rating(saved).power;
 const unlocked=operations.campaignProgress(saved).unlocked;
 regionPicker.replaceChildren(...Object.entries(regions).map(([id,preset])=>{
  const option=document.createElement('option');option.value=id;
  option.disabled=preset.floor>power&&!unlocked.includes(id);
  option.textContent=preset.name+' · '+preset.floor+'–'+preset.ceiling;
  return option;
 }));
 regionPicker.value=regionId;
}
regionPicker.onchange=()=>{
 if(state.deployed||regionPicker.value===regionId)return;
 if(embedded)options.leave('region',{region:regionPicker.value,mission:state.mission,alert:state.alertRequested});
 else{
  const url=new URL(location.href);
  url.searchParams.set('region',regionPicker.value);url.searchParams.set('mission',state.mission);location.assign(url);
 }
};
const boardCopy={
 defense:['5 waves','M5 16h10v11H5zm10-6h10v17H15zm10 6h10v11H25zM5 8h5m22 0h3'],
 seal:['4-minute siege','M20 4 30 16 20 30 10 16zM4 19q6 5 11 0m10 0q5 5 11 0'],
 nests:['5 roaming encounters','M20 5v6m0 12v7M7 17h6m14 0h6M20 11l6 6-6 6-6-6z'],
 payload:['Fuel-powered shelter','M12 14h16v14H12zM5 9l6 5m24-5-6 5M20 2v11m-3-4 3 4 3-4']
};
const missionControls=new Map();
for(const [id,entry] of Object.entries(operations.missions)){
 const [format,path]=boardCopy[id];
 const button=document.createElement('button');
 button.type='button';button.className='op-option';button.dataset.operation=id;
 button.innerHTML='<svg viewBox="0 0 40 34" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="'+path+'"/></svg>'+
  '<span><b></b><small></small></span>';
 button.querySelector('b').textContent=entry.name;button.querySelector('small').textContent=format;
 button.onclick=()=>{
  if(state.deployed)return;
  state.mission=id;
  if(operations.dailyAlert(operations.windows(Date.now()).day).mission!==id)state.alertRequested=false;
  if(!embedded){
   const url=new URL(location.href);url.searchParams.set('mission',id);
   try{history.replaceState(null,'',url)}catch(error){}
  }
  updateMissionBrief();drawSectorMap();
 };
 ui['mission-cards'].append(button);missionControls.set(id,button);
}
ui['alert-toggle'].onclick=()=>{
 if(state.deployed)return;
 const alert=operations.dailyAlert(operations.windows(Date.now()).day);
 if(state.mission!==alert.mission){
  state.mission=alert.mission;state.alertRequested=true;
 }else state.alertRequested=!state.alertRequested;
 updateMissionBrief();drawSectorMap();
};
listen(ui.board,'keydown',event=>{
 const horizontal=event.code==='ArrowLeft'?-1:event.code==='ArrowRight'?1:0;
 const vertical=event.code==='ArrowUp'?-1:event.code==='ArrowDown'?1:0;
 if(boardFocus(surface.activeElement,horizontal,vertical))event.preventDefault();
});
function updateMissionBrief(){
 const active=expedition||operations.missions[state.mission],snapshot=citadel?.snapshot()||profile;
 for(const [id,button] of missionControls)button.setAttribute('aria-pressed',String(id===state.mission));
 text(ui['operation-title'],active.name);text(ui.summary,active.brief);
 text(ui['board-power'],'Power '+StormwatchCitadel.rating(snapshot).power);
 text(ui['map-sector'],zoneName);
 const {alert,orders}=operations.board(snapshot,Date.now());
 const engaged=state.alertRequested&&state.mission===alert.mission;
 text(ui['alert-name'],alert.name);
 text(ui['alert-mode'],engaged?'Alert enabled':orders.alertClaimed?'Reward collected':operations.missions[alert.mission].name);
 const resources=Object.entries(alert.bonus).map(([key,n])=>n+' '+StormwatchCitadel.components[key]).join(' · ');
 text(ui['alert-detail'],engaged?alert.description.split('. ')[0]+' · '+resources:orders.alertClaimed?'':resources);
 ui['alert-toggle'].setAttribute('aria-pressed',String(engaged));
}
function drawSectorMap(){
 const cv=ui['sector-map'],ctx=cv.getContext('2d'),w=cv.width,h=cv.height;
 const px=x=>w*.5+x*2.85,pz=z=>h*.5+z*1.175;
 const color=regionId==='obsidian'?'#2c495e':regionId==='canyonlands'?'#584b41':'#274343';
 ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
 // Shading is sampled from the same height function that drives the terrain mesh and Rapier.
 for(let z=-48;z<=48;z+=2)for(let x=-59;x<=59;x+=2){
  const elevation=terrainHeight(x,z),light=Math.min(.34,elevation*.103+.032);
  ctx.fillStyle='rgba(200,220,182,'+light+')';ctx.fillRect(px(x),pz(z),11.8,5);
 }
 for(const [level,opacity] of [[.23,.19],[.49,.22],[.82,.26],[1.19,.25],[1.62,.18]]){
  ctx.strokeStyle='rgba(225,229,188,'+opacity+')';ctx.lineWidth=1.25;ctx.beginPath();
  for(let z=-48;z<48;z+=4)for(let x=-56;x<56;x+=4){
   const corners=[[x,z],[x+4,z],[x+4,z+4],[x,z+4]],altitudes=corners.map(([a,b])=>terrainHeight(a,b));
   const cross=[];
   for(let i=0;i<4;i++){
    const j=(i+1)%4,a=altitudes[i],b=altitudes[j];
    if((a>=level)===(b>=level))continue;
    const fraction=(level-a)/(b-a);
    cross.push([px(lerp(corners[i][0],corners[j][0],fraction)),pz(lerp(corners[i][1],corners[j][1],fraction))]);
   }
   for(let i=0;i+1<cross.length;i+=2){ctx.moveTo(...cross[i]);ctx.lineTo(...cross[i+1])}
  }
  ctx.stroke();
 }
 ctx.strokeStyle='#b2d2bc42';ctx.lineWidth=1;
 for(let x=-50;x<=50;x+=10){ctx.beginPath();ctx.moveTo(px(x),0);ctx.lineTo(px(x),h);ctx.stroke()}
 for(let z=-40;z<=40;z+=10){ctx.beginPath();ctx.moveTo(0,pz(z));ctx.lineTo(w,pz(z));ctx.stroke()}
 ctx.setLineDash([5,7]);ctx.strokeStyle='#d9dcc587';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(px(0),0);ctx.lineTo(px(0),h);ctx.moveTo(0,pz(-1));ctx.lineTo(w,pz(-1));ctx.stroke();
 ctx.setLineDash([]);ctx.strokeStyle='#d3a8f0aa';
 ctx.beginPath();ctx.ellipse(w*.5,h*.5,100*2.85,100*1.175,0,0,TAU);ctx.stroke();
 for(const shelter of shelters){
  ctx.fillStyle='#bcdbcebb';ctx.fillRect(px(shelter.x)-9,pz(shelter.z)-4,18,8);
 }
 const mark=(x,z,tint,size)=>{
  ctx.fillStyle=tint;ctx.beginPath();ctx.moveTo(px(x),pz(z)-size);ctx.lineTo(px(x)+size,pz(z));
  ctx.lineTo(px(x),pz(z)+size);ctx.lineTo(px(x)-size,pz(z));ctx.closePath();ctx.fill();
 };
 if(state.mission==='nests'){
  for(const site of nestSites())mark(site.x,site.z,'#deb1e9',7);
 }else if(state.mission==='seal'){
  [[-12,12],[14,-9],[-13,-16]].forEach(([x,z])=>mark(x,z,'#a3e6d0',6));mark(0,0,'#fad294',9);
 }else{
  mark(0,0,'#fad294',9);
  for(const [x,z] of portals)mark(x,z,'#c58ee1bb',5);
 }
 ctx.fillStyle='#e7eece';ctx.font='bold 14px system-ui';ctx.fillText('N',w-25,21);
}
updateRegions();
function showScreen(mode){
 if(state.edit)closeEditor(false);
 state.paused=mode!=='pack';state.screen=mode;
 fieldCaptions.clear();
 mouseFire=mouseAim=mouseLook=false;keys.clear();
 if(document.pointerLockElement===canvas)document.exitPointerLock();
 ui.screen.hidden=false;ui.screen.dataset.mode=mode;
 const pack=mode==='pack',citadelPanel=mode==='citadel';
 ui.board.hidden=mode!=='brief'||options.hub;
 ui['operation-title'].hidden=mode!=='brief';
 ui.citadel.hidden=mode!=='brief'||options.hub;
 ui['citadel-back'].hidden=ui['citadel-root'].hidden=!citadelPanel;
 ui.exit.hidden=citadelPanel;
 ui['operation-loading'].hidden=mode!=='brief'||!options.hub;
 ui.pack.hidden=ui.craft.hidden=ui.traps.hidden=!pack;
 ui.fabricate.hidden=ui['field-crate'].hidden=ui['drop-stock'].hidden=!pack;
 ui.guide.hidden=true;ui.help.hidden=mode==='result'||pack||citadelPanel;ui.help.setAttribute('aria-expanded','false');
 fieldFullscreen.hidden=!document.fullscreenEnabled||options.local||mode!=='pause';
 fieldFullscreen.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';
 ui['field-audio'].hidden=mode!=='pause';ui['field-audio'].setAttribute('aria-expanded','false');ui['field-audio-settings'].hidden=true;
 ui.deploy.hidden=mode==='result'||citadelPanel||mode==='brief'&&!!options.hub;
 ui.retry.hidden=mode!=='result';
 ui.pass.hidden=mode!=='result'||!embedded||options.local;
 if(mode==='brief'){
  text(ui.kicker,region.site+' · '+zoneName);text(ui.title,'Stormfront');
  updateMissionBrief();text(ui.deploy,'Deploy');
 }
 if(citadelPanel){
  text(ui.kicker,'Stormfront');text(ui.title,'The Citadel');text(ui.summary,'');
 }
 if(mode==='pause'||pack){
  ui.kicker.textContent=zoneName+' · Wave '+Math.max(1,state.wave);
  ui.title.textContent=pack?'Inventory':'Paused';
  const margin=Math.round(state.stormRadius-stormDistance(hero.pos.x,hero.pos.z));
  const boundary=margin<0?'Return '+(-margin)+' m toward the center':'Storm boundary '+margin+' m away';
  const recharge=Math.max(0,Math.ceil(5.5-hero.hitAgo));
  const shield=hero.hp<=0?'Awaiting revive':hero.shield>=hero.maxShield?'Shield full':recharge?'Shield recharge in '+recharge+'s':'Shield recharging';
  const repairs=Math.min(hero.repairs,Math.floor(hero.stacks[2]/12));
  ui.summary.textContent=[boundary,shield,state.mission==='nests'?'':repairs+' objective repairs available'].filter(Boolean).join(' · ');
  ui.deploy.textContent='Resume';
  if(pack)fillPack();
 }
 focusedButton();
}
let outcome='';
function resultsSummary(){
 const next=state.xp?' '+state.xp+' Battle Pass XP'+(Number.isFinite(state.tier)?' · Tier '+state.tier:'')+'.':'';
 const result=state.mission==='nests'?state.nestsCleared+' / 5 nests':
  Math.round(state.atlas)+' '+(state.mission==='payload'?'pod':state.mission==='seal'?'Anchor':'Relay')+' integrity';
 ui.summary.textContent=outcome+'. '+state.takedowns+' Husks defeated · '+result+'.'+next+(state.campaignXp?' +'+state.campaignXp+' Campaign XP.':'');
}
function awardWave(bonus){
 if(coop&&!guest){
  sendGame('reward',{wave:state.wave,bonus});
  for(const m of mates.values()){
   m.bag=StormwatchCitadel.emptyBag();
   if(m.vitals.hp>0){
    m.vitals.hp=Math.min(m.vitals.maxhp,m.vitals.hp+15);
    m.vitals.shield=Math.max(m.vitals.shield,25);
    sendGame('feedback',{ammo:24},m.id);
   }
  }
 }
 if(!options.award)return;
 const result=options.award(state.wave,bonus);
 if(!result)return;
 state.tier=result.tier;
 state.xp+=result.xp;
 if(!result.saved)notice('Battle Pass XP could not be saved');
}
function finish(win,message,remote=false){
 if(coop&&!guest&&!remote&&!state.finished)sendGame('end',{win,message});
 if(state.finished)return;
 state.finished=true;outcome=message;
 persistField();const sharedResult=options.complete?.(win,state.takedowns);
 if(sharedResult){state.xp+=sharedResult.xp;state.tier=sharedResult.tier;state.campaignXp=sharedResult.campaignXp;}
 const overclockBonus=win&&state.mission==='payload'&&state.overclock;
 if(overclockBonus)collectPart('cells',6);
 savingResult=win;ui.retry.disabled=win;ui.pass.disabled=win;
 const rewards=ui['operation-rewards'];rewards.hidden=!win;
 const patterns=[...discoveries.values()].filter(item=>!Object.hasOwn(profile.blueprints,item.id)).length;
 const payout=(expedition?'Campaign rewards':StormwatchCitadel.payoutText(state.mission,regionId))+(overclockBonus?' · 6 overclock Cells':'')+(patterns?' · '+patterns+' recovered pattern'+(patterns===1?'':'s'):'');
 if(win)text(rewards,'Victory payout · '+payout+' · Saving…');
 bankSalvage(win,false).then(saved=>{
  if(!win||controller.signal.aborted)return;
  savingResult=false;ui.retry.disabled=false;ui.pass.disabled=false;
  text(rewards,saved?'Deposited at the Citadel · '+payout:'Victory payout could not be saved');
  focusedButton();
 });
 if(options.hub){ui.retry.dataset.action='exit';ui.retry.textContent='Return to Homebase';ui.exit.hidden=true;}
 ui.kicker.textContent=region.site+' · Mission report';
 ui.title.textContent=win?(expedition?message:({seal:'Rift sealed',payload:'Payload recovered',nests:'Hunt complete',defense:'Relay secured'})[state.mission]):'Operation failed';
 resultsSummary();
 if(gear?.profile){ui.profile.innerHTML=gear.profile;ui.profile.hidden=false}
 showScreen('result');
 if(options.hub)ui.exit.hidden=true;
}

listen(window,'keydown',event=>{
 const code=event.code;
 if(emoteWheel)return;
 if(state.edit){
  if(['Escape','KeyB','Enter','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'].includes(code))event.preventDefault();
  if(event.repeat)return;
  if(code==='Escape'||code==='KeyB')closeEditor(true);
  else if(code==='Enter')applyEdit(true);
  else if(/^Digit[1-9]$/.test(code)){
   const bit=Number(code.slice(-1))-1,n=engineering.dimensions(state.edit.item.piece);
   if(bit<n*n)togglePanel(bit);
  }
  return;
 }
 if(state.screen==='pack'){
  if((code==='Escape'||code==='KeyI'&&!surface.activeElement?.matches('input,select'))&&!event.repeat){
   event.preventDefault();deploy(state.look==='keys');
  }
  return;
 }
 if(state.paused){
  if(state.screen==='pause'&&code==='KeyI'&&!event.repeat){event.preventDefault();showScreen('pack');return}
  if(state.screen==='citadel'&&code==='Escape'&&!event.repeat){
   event.preventDefault();menuAction('citadelBack',false);return;
  }
  return;
 }
 if(['Space','Tab','KeyI','KeyW','KeyA','KeyS','KeyD'].includes(code))event.preventDefault();
 if(code==='Escape'){event.preventDefault();bodyPause();return}
 if((code==='Tab'||code==='KeyI')&&!event.repeat){showScreen('pack');return}
 keys.add(code);
 if(event.repeat)return;
 if(audio?.state!=='running')unlockAudio();
 state.look='keys';
 if(code==='Space')jump();
 if(code==='KeyQ')toggleBuilding();
 if(code==='KeyR')reload();
 if(code==='KeyF')interactField();
 if(code==='KeyV')switchWeapon();
 if(code==='KeyE')playEmote();
 if(!state.building){
  if(code==='Digit1')switchWeapon(guns.length);
  if(code==='Digit2')switchWeapon(0);
  if(/^Digit[3-4]$/.test(code)){
   const index=Number(code.slice(-1))-2;
   if(guns[index])switchWeapon(index);
  }
 }
 if(code==='KeyC')craftAmmo();
 if(code==='KeyG')fortify();
 if(code==='KeyB')openEditor();
 if(code==='KeyX')useAbility();
 if(/^Digit[5-8]$/.test(code))useAbility(Number(code.slice(-1))-5);
 if(code==='Digit1'&&state.building)selectPiece(0);
 if(code==='Digit2'&&state.building)selectPiece(1);
 if(code==='Digit3'&&state.building)selectPiece(2);
 if(code==='Digit4'&&state.building)selectPiece(4);
 if(code==='KeyT')selectPiece(3);
});
listen(window,'keyup',event=>{keys.delete(event.code)});
listen(window,'blur',()=>{keys.clear();mouseFire=mouseAim=mouseLook=false});
listen(document,'visibilitychange',()=>{if(document.hidden&&state.screen==='play'&&!state.paused)bodyPause()});
listen(document,'pointerlockchange',()=>{
 const locked=document.pointerLockElement===canvas;
 if(locked)state.pointerHint=false;
 if(!locked&&state.mouse&&!state.paused&&state.screen==='play'&&!state.edit&&!emoteWheel&&state.look==='keys')bodyPause();
 state.mouse=locked;
});
listen(document,'pointerlockerror',()=>{state.pointerHint=true});
listen(canvas,'contextmenu',event=>event.preventDefault());
listen(canvas,'wheel',event=>{
 if(state.paused||state.screen==='pack'||state.building)return;
 event.preventDefault();if(hero.shot<.1)switchWeapon();
},{passive:false});
listen(canvas,'mousedown',event=>{
 if(emoteWheel||state.paused||state.screen==='pack'||state.edit)return;
 event.preventDefault();
 state.look='keys';
 unlockAudio();
 if(event.button===2){
  if(state.building)cycleMaterial();
  else mouseAim=true;
  if(!state.mouse)mouseLook=true;
 }
 if(event.button===1&&!state.mouse)mouseLook=true;
 if(event.button!==0)return;
 if(!state.mouse&&!state.pointerHint){requestMouse();return}
 if(state.building)place();
 else mouseFire=true;
});
listen(window,'mouseup',event=>{
 if(event.button===0)mouseFire=false;
 if(event.button===2)mouseAim=false;
 if(event.button===1||event.button===2)mouseLook=false;
});
listen(window,'mousemove',event=>{
 if(emoteWheel||state.paused||state.screen==='pack'||state.edit||(!state.mouse&&!mouseLook))return;
 state.look='keys';
 hero.yaw-=event.movementX*.0026*config.sensitivity;
 hero.pitch=clamp(hero.pitch-event.movementY*.00235*config.sensitivity,-1.16,.97);
});

function text(el,value){
 value=String(value);
 if(el.textContent!==value)el.textContent=value;
}
function meter(id,value,max){
 const level=Math.round(value);
 const bar=ui[id+'-meter'];
 if(bar.max!==max)bar.max=max;
 if(bar.value!==level)bar.value=level;
 text(ui[id+'-text'],level+' / '+max);
}
const radar=ui.radar.getContext('2d');
const RADAR_W=156;
function drawRadar(){
 radar.clearRect(0,0,RADAR_W,RADAR_W);
 const middle=RADAR_W*.5,scale=(middle-5)/BOUND;
 radar.strokeStyle='#9fcaf842';radar.lineWidth=1;
 radar.beginPath();radar.arc(middle,middle,44,0,TAU);
 radar.moveTo(middle-75,middle);radar.lineTo(middle+75,middle);
 radar.moveTo(middle,middle-75);radar.lineTo(middle,middle+75);radar.stroke();
 radar.fillStyle='#a6bada';radar.font='12px system-ui';radar.textAlign='center';radar.fillText('N',middle,14);
 const dot=(x,z,color,r)=>{
  radar.fillStyle=color;radar.beginPath();
  radar.arc(middle+x*scale,middle+z*scale,r,0,TAU);radar.fill();
 };
 if(state.mission!=='nests')dot(ox,oz,'#8bf0d0',4.3);
 for(const point of expeditionSites)if(!point.done&&point.group.visible)dot(point.x,point.z,'#f5cb87',3.4);
 for(const nest of nests)if(nest.active)dot(nest.x,nest.z,nest===state.nest?'#ffc992':'#d58be9',4);
 if(state.mission==='payload'){
  radar.strokeStyle='#d9a8f18a';radar.beginPath();radar.arc(middle+ox*scale,middle+oz*scale,state.stormRadius*scale,0,TAU);radar.stroke();
 }
 const fronts=plannedFronts();
 for(let i=0;i<portals.length&&state.mission!=='nests';i++){
  const [x,z]=portals[i];
  if(fronts.includes(i)){
   radar.strokeStyle=portalFx[i].active?'#dd85fa91':'#ffc786a5';radar.lineWidth=2;
   radar.beginPath();radar.moveTo(middle+x*scale,middle+z*scale);
   radar.lineTo(middle+x*scale*.22,middle+z*scale*.22);radar.stroke();
  }
  dot(x,z,portalFx[i].active?'#dc83ff':fronts.includes(i)?'#ffc786':'#7c6f9e',fronts.includes(i)||portalFx[i].active?5:2.4);
 }
 for(const item of loot)if(item.active){
  const color=item.kind==='flux'?'#c0edd6':item.kind==='cache'?'#fbc477':item.kind==='chest'&&!item.opened?'#df9c69':'#69d6ff';
  dot(item.x,item.z,color,item.kind==='flux'?4.2:item.kind==='chest'?3.2:2.65);
 }
 for(const enemy of enemies)if(enemy.active)dot(enemy.x,enemy.z,enemy.kind==='boss'?'#ffc484':'#ff8495',enemy.kind==='boss'?4.7:2.4);
 radar.save();
 radar.translate(middle+hero.pos.x*scale,middle+hero.pos.z*scale);
 radar.rotate(-hero.yaw);
 radar.fillStyle='#fff';radar.beginPath();radar.moveTo(0,-7);radar.lineTo(5,5);radar.lineTo(0,2);radar.lineTo(-5,5);radar.closePath();radar.fill();
 radar.restore();
}
function slot(parent,label,kind,img=''){
 const container=document.createElement('span');
 container.className='slot';container.title=label;container.setAttribute('aria-label',label);
 container.innerHTML='<img hidden alt=""><svg viewBox="0 0 64 36" aria-hidden="true">'+iconPaths[kind]+'</svg><kbd></kbd>';
 const image=container.querySelector('img');
 if(img){image.src=img;image.hidden=false}
 parent.append(container);
 return {container,key:container.querySelector('kbd')};
}
const toolSlots=[
 slot(ui.hotbar,'Pickaxe','pickaxe'),
 ...Array.from({length:Math.max(hotbarCapacity,guns.length)},(_,index)=>{
  const weapon=guns[index],item=slot(ui.hotbar,weapon?.name||'Empty weapon slot '+(index+1),'gun',weapon?.icon);
  item.container.dataset.empty=String(!weapon);return item;
 })
];
function repaintWeaponSlot(index){
 const weapon=guns[index];
 if(!toolSlots[index+1])toolSlots[index+1]=slot(ui.hotbar,weapon.name,'gun',weapon.icon);
 const element=toolSlots[index+1].container,img=element.querySelector('img');
 element.dataset.empty='false';element.title=weapon.name;element.setAttribute('aria-label',weapon.name);
 img.hidden=!weapon.icon;
 if(weapon.icon)img.src=weapon.icon;
}
const buildSlots=['wall','floor','ramp','trap','cap'].map((kind,i)=>slot(ui['build-strip'],pieces[i],kind));
function updateHUD(){
 const p=state.look==='pad'?padLabels:null;

 const existing=aimed?.object.userData.entity;
 const buildMaterial=materials[state.material];
 const left=enemies.reduce((count,e)=>count+(e.active?1:0),state.pending);
 meter('atlas',state.atlas,state.mission==='payload'?PAYLOAD_HP:ATLAS_HP);meter('health',hero.hp,hero.maxhp);meter('shield',hero.shield,hero.maxShield);
 const [ability,cooldown]=selectedAbility(),remaining=abilityCooldown[state.ability];
 meter('pulse',cooldown-remaining,cooldown);
 text(ui['pulse-text'],ability+(remaining>0?' '+Math.ceil(remaining)+'s':''));
 ui['pulse-meter'].setAttribute('aria-label',ability+' recharge');
 const boss=enemies.find(e=>e.active&&e.kind==='boss');
 ui.objective.hidden=(state.mission==='nests'||expHunt)&&!boss;
 ui['atlas-name'].closest('.objective-line').hidden=state.mission==='nests';
 ui.boss.hidden=!boss;
 if(boss){meter('boss',boss.hp,boss.max);text(ui['boss-name'],'Stormbreaker · P'+boss.power)}
 const time=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
 if(expedition)expeditionStatus();
 else if(state.mission==='nests'){
  text(ui.status,'Nests '+state.nestsCleared+' / '+nests.length);
  const nest=state.nest;
  text(ui.remaining,time(Math.ceil(state.huntTime))+' · '+(nest?(nest.hit?'Shatter the core':nest.remaining+' guarding'):'Find a nest'));
 }else if(state.mission==='payload'){
  const prep=state.phase==='drop';
  text(ui.status,(state.overclock?'Overclocked · ':'')+(prep?'Pod landing':'Recovery '+Math.floor(state.siege/PAYLOAD_DURATION*100)+'%'));
  text(ui.remaining,prep?'Collect marked Flux · '+time(Math.ceil(state.prep)):'Fuel '+Math.ceil(state.podFuel)+'% · '+state.flux+' Flux carried'+(state.podFuel<=25?' · Feed the pod':''));
 }else if(state.mission==='seal'){
  text(ui.status,state.phase==='fuel'?'Fuel the Anchor':'Seal · '+time(Math.ceil(SEAL_DURATION-state.siege)));
  text(ui.remaining,state.phase==='fuel'?(state.flux===3?'Fortify, then activate the Anchor':'RiftGel '+state.flux+' / 3'):'Hold the Anchor');
 }else{
  const planning=state.phase==='prep'||state.phase==='scout';
  if(ui.mission.dataset.assault!==state.phase)ui.mission.dataset.assault=state.phase;
  text(ui.status,state.phase==='scout'?'Restore the Signal Relay':(state.outpostTier?'Siege '+(state.outpostTier+1)+' · ':'')+'Assault '+Math.min(MAX_WAVES,state.wave+Number(planning))+' / '+MAX_WAVES);
  text(ui.remaining,state.phase==='scout'?'Power cells '+state.flux+' / 2 · Mint markers on radar':
   state.phase==='arming'?'Rifts opening in '+Math.ceil(state.prep)+'s':
   state.phase==='active'?left+' Hollows left':guest?'Build defenses · Leader starts the assault':'Build defenses · Start at the relay');
 }
 const fronts=plannedFronts();
 if(!expedition)text(ui.task,fronts.length?'Threat · '+fronts.map(lane=>frontNames[lane]).join(' / '):hero.cache<3?'Caches '+hero.cache+'/3':'');
 if(!expedition)text(ui.passStatus,state.phase==='prep'&&loot.some(item=>item.active&&item.kind==='airdrop')?'Airdrop on radar':'');
 text(ui.wood,hero.stacks[0]);text(ui.stone,hero.stacks[1]);text(ui.metal,hero.stacks[2]);
 const gun=currentGun();
 text(ui['held-name'],state.building?(state.piece===3?trapRecipes[state.recipe].name:buildMaterial.name):gun?gun.name+' · P'+gun.power+(gun.element==='Kinetic'?'':' '+gun.element):'Pickaxe');
 text(ui.ammo,state.building?(state.piece===3?trapRecipes[state.recipe].mount:'10'):(gun?(hero.reload>0?'Reloading':gun.mag+' / '+gun.reserve):''));
 ui['build-strip'].hidden=!state.building;
 for(const [i,item] of toolSlots.entries()){
  const index=i===0?guns.length:i-1;
  const selected=!state.building&&hero.weapon===index&&(i===0||!!guns[index]);
  item.container.dataset.selected=String(selected);
  text(item.key,p?(selected?p.y:''):i+1);
 }
 if(state.building)for(const [i,item] of buildSlots.entries()){
  item.container.classList.toggle('selected',i===state.piece);
  text(item.key,p?['←','↑','→','Kit','↓'][i]:[1,2,3,'T',4][i]);
 }
 let focus='';
 teamHud();
 const nearbyNest=availableNest(),chest=availableChest(),sharedDrop=nearbyFieldDrop();
 const control=missionInteraction();
 if(coop&&[...mates.values()].some(m=>m.ready&&m.down&&m.target.distanceTo(hero.pos)<2.65))focus=(p?p.x:'F')+' · Revive squadmate';
 else if(sharedDrop)focus=(p?p.x:'F')+' · Pick up '+sharedDrop.label;
 else if(nearbyNest)focus=(p?p.x:'F')+' · Scan nest';
 else if(expKind==='radar'){
  const tower=expeditionSites.find(site=>!site.done&&Math.hypot(hero.pos.x-site.x,hero.pos.z-site.z)<8);
  if(tower)focus='Radar plan · '+tower.material.name+' floors on layers 1–3';
 }
 if(!focus&&chest)focus=(p?p.x:'F')+(chest.opened?' · Equip '+chest.reward.name+' · P'+chest.power+' '+chest.element:' · Open chest');
 else if(!focus&&searchableWreck())focus=(p?p.x:'F')+' · Search wreck';
 else if(!focus&&control)focus=guest&&state.phase!=='payload'?'Squad leader · '+control:coop&&!coopStarted?'Waiting for squad link':(p?p.x:'F')+' · '+control;
 else if(!focus&&blueprint?.reason)focus=blueprint.reason;
 else if(!focus&&existing?.type==='structure'&&aimed.distance<12){
  const stats=Math.ceil(existing.hp)+' / '+existing.max;
  focus=existing.piece===3?existing.recipe.name+' · '+existing.life+' charges':
   existing.construction>0?'Constructing '+pieces[existing.piece]:
   (p?p.rs:'B')+' edit · '+(p?p.b:'G')+' reinforce · R'+existing.rank+' '+stats;
 }
 else if(existing?.type==='atlas'&&state.phase==='prep'&&state.atlas<ATLAS_HP&&objectiveDistance(hero.pos.x,hero.pos.z)<8.5)focus=(p?p.b:'G')+' · Repair relay';
 const harvest=focusedProp?.alive?focusedProp:null;
 const husk=existing?.type==='enemy'&&existing.active&&existing.kind!=='boss'?existing:null;
 const core=existing?.type==='nest'&&existing.hit?existing:null;
 ui.harvest.hidden=!harvest&&!husk&&!core;
 if(harvest){
  const name=harvest.kind===0?(harvest.wide?'Oak':'Pine'):harvest.kind===1?'Boulder':'Wreck';
  text(ui['harvest-name'],name+'  '+harvest.hp+'/'+harvest.max);
  ui['harvest-meter'].max=harvest.max;ui['harvest-meter'].value=harvest.hp;
 }else if(core){
  text(ui['harvest-name'],'Nest core');
  ui['harvest-meter'].max=core.max;ui['harvest-meter'].value=core.hp;
 }else if(husk){
  text(ui['harvest-name'],hollowNames[husk.kind]+' · P'+husk.power+(husk.element==='Kinetic'?'':' '+husk.element));
  ui['harvest-meter'].max=husk.max;ui['harvest-meter'].value=husk.hp;
 }
 ui.prompt.hidden=!focus||!!state.edit;
 text(ui.prompt,focus);
 text(ui.threat,state.pointerHint&&state.look==='keys'?'Hold RMB to look':(p?p.view:'I')+' · Field kit');
 drawRadar();
}

text(ui.kicker,region.site+(coop?' · Squad operation':' · Solo operation'));
if(options.hub){
 ui.screen.dataset.hub='';ui.board.hidden=true;ui.citadel.hidden=true;ui.help.hidden=true;
 ui.deploy.hidden=true;ui['operation-loading'].hidden=false;
}
updateMissionBrief();
syncBriefing();
makeRidge();
const riftDome=makeRiftDome();
makeAtlas();
makePortals();
shelters.forEach(addChest);
drawSectorMap();
for(const [x,z] of [[-8.5,21],[17,-11],[-21,-8]]){
 addCache(x+(rand()-.5)*3.4,z+(rand()-.5)*3.4,'cache');
}
cameraTick(0,true);
function deploymentReady(){
 if(controller.signal.aborted)return;
 coopReady=true;ui.deploy.disabled=false;
 if(options.hub||coop){
  try{
   deploy(false);
   if(state.deployed&&state.screen==='play')notice(coop?'Squad uplink · click the field to aim':'Click the field to aim');
  }catch(error){
   console.error('Stormfront deployment',error);
   state.paused=true;ui.screen.hidden=false;
   ui.summary.textContent='The operation could not start. Return to Homebase and try again.';
   ui['operation-loading'].hidden=true;ui.exit.focus({preventScroll:true});
  }
  return;
 }
 if(!surface.activeElement)ui.deploy.focus({preventScroll:true});
}
const fieldProfileReady=StormwatchCitadel.open().then(account=>{
 if(controller.signal.aborted){account.close();return}
 citadel=account;ui.citadel.disabled=false;
 if(!state.deployed){
  profile=account.snapshot();squad=StormwatchCitadel.rating(profile);
  updateRegions();updateMissionBrief();
 }
}).catch(()=>{
 if(!controller.signal.aborted)ui.citadel.title='Citadel storage could not load';
});
let loadExpired=false;
const physicsReady=StormwatchPhysics.create(T,terrainHeight,BOUND).then(engine=>{
 if(controller.signal.aborted||loadExpired){engine.close();return}
 physics=engine;
 for(const object of shotProps)physics.add(object);
 physics.advance(1/60);
}).catch(()=>{
 if(!controller.signal.aborted)ui.summary.textContent='Using local movement and collision.';
});
const fieldReady=Promise.all([physicsReady,fieldProfileReady]);
let loadDeadline;
const loadWindow=new Promise(resolve=>{
 loadDeadline=setTimeout(()=>{loadExpired=true;resolve()},5000);
});
Promise.race([fieldReady,loadWindow]).then(()=>{clearTimeout(loadDeadline);deploymentReady()});
controller.signal.addEventListener('abort',()=>clearTimeout(loadDeadline),{once:true});



/* Host owns the operation. Guests predict their own movement and weapon
   feedback, then interpolate the host's world and squad snapshots. */
const mates=new Map(),replicas=new Map(),remoteProjectiles=[];
const coopFields=['elapsed','phase','wave','prep','siege','flux','stormRadius','atlas','pending','nestsCleared','huntTime','takedowns','podFuel','overclock','outpostTier'];
let netClock=0,enemySerial=0,coopStarted=false,signalTick=0;
const guest=Boolean(coop&&!coop.host);
const nround=options.round;
const packVector=v=>v.toArray().map(n=>Math.round(n*100)/100);
const goodVector=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
function sendGame(type,values={},id){
 const data={type,round:nround,...values};
 if(id)coop.direct(id,data);else coop.send(data);
}
function coopAction(action,values={}){
 if(!guest||!coopStarted||hero.hp<=0)return;
 sendGame('action',{action,...values});
}
function hydrateMate(id,point,operator){
 const position=vec().fromArray(point);
 const look=coop.names.get(id)||'Operator';
 const unit=groupAt(scene,...point),body=groupAt(unit),model=gear?.teammate?.(operator);
 const bright=mat(0x6adac9,0x256e78,.2);
 if(model){body.add(model.model)}
 else{
  mesh(body,rock,bright,0,1.46,0,.215,.22,.2);
  block(body,steel,0,.98,0,.49,.69,.28);
  for(const side of [-1,1]){
   block(body,trim,side*.34,1.05,0,.17,.57,.19);
   block(body,steel,side*.13,.34,0,.2,.69,.26);
  }
 }
 const label=document.createElement('canvas');label.width=256;label.height=64;
 const context=label.getContext('2d');
 function updateLabel(down){
  context.clearRect(0,0,256,64);context.fillStyle=down?'#691f2ded':'#133540e8';context.fillRect(8,9,240,46);
  context.font='700 20px system-ui';context.textAlign='center';context.textBaseline='middle';context.fillStyle='#eafaff';
  context.fillText(down?look+' • DOWN':look,128,33,225);
  sprite.material.map.needsUpdate=true;
 }
 const tag=new T.CanvasTexture(label),sprite=new T.Sprite(new T.SpriteMaterial({map:tag,depthWrite:false}));
 sprite.position.y=2.05;sprite.scale.set(options.local?1.45:2.15,options.local?.36:.54,1);unit.add(sprite);updateLabel(false);
 const mate={id,look,operator,unit,body,model,label:sprite,updateLabel,pos:position,target:position.clone(),angle:0,last:0,active:true,down:false,
  vitals:{hp:100,maxhp:100,shield:60,maxShield:60,hitAgo:20,stacks:[40,30,20],repairs:2,cache:0},cooldown:[0,0,0,0],bag:StormwatchCitadel.emptyBag(),ready:false};
 mates.set(id,mate);return mate;
}
function removeMate(id){
 const m=mates.get(id);if(!m)return;
 if(!guest&&m.pendingPickup)clearFieldDrop(m.pendingPickup);
 if(m.model)m.body.remove(m.model.model);scene.remove(m.unit);m.label.material.map.dispose();m.label.material.dispose();mates.delete(id);
}
function peerLife(m,dt){
 m.pos.lerp(m.target,1-Math.exp(-dt*17));m.unit.position.copy(m.pos);
 m.unit.rotation.y+=Math.atan2(Math.sin(m.angle-m.unit.rotation.y),Math.cos(m.angle-m.unit.rotation.y))*Math.min(1,dt*13);
 const moving=m.target.distanceTo(m.pos)>.07;
 m.body.rotation.z=lerp(m.body.rotation.z,m.down?-1.19:0,Math.min(1,dt*12));
 if(m.model)m.model.pose(m.pos,m.unit.rotation.y,moving,dt,m.heldWeapon);
 else m.body.position.y=m.down?-.18:moving?Math.sin(state.elapsed*13)*.043:0;
}
function withMate(m,work){
 const local={...hero},originalAim=aimed,seat=remoteSeat;
 remoteSeat=m;
 Object.assign(hero,m.vitals,{pos:m.target,yaw:m.angle,pitch:m.pitch||0});
 try{return work()}
 finally{
  for(const key of Object.keys(m.vitals))m.vitals[key]=hero[key];
  Object.assign(hero,local);aimed=originalAim;remoteSeat=seat;
 }
}
function livePlayers(){
 const result=[];
 if(hero.hp>0)result.push({pos:hero.pos,mate:null});
 for(const mate of mates.values())if(mate.ready&&mate.vitals.hp>0)result.push({pos:mate.target,mate});
 return result;
}
function downCheck(){
 if(coop&&!guest&&livePlayers().length===0)finish(false,'The squad was downed');
}
function damageMate(m,amount){withMate(m,()=>hurtHero(amount))}
function closestPlayer(x,z){
 return livePlayers().sort((a,b)=>a.pos.distanceToSquared(vec(x,a.pos.y,z))-b.pos.distanceToSquared(vec(x,b.pos.y,z)))[0];
}
function reviveMate(){
 const nearby=[...mates.values()].find(m=>m.ready&&m.vitals.hp<=0&&m.target.distanceTo(hero.pos)<2.65);
 if(nearby){
  nearby.vitals.hp=Math.min(nearby.vitals.maxhp,48);nearby.vitals.hitAgo=0;nearby.down=false;nearby.updateLabel(false);
  sendGame('feedback',{line:'Revived by a squadmate'},nearby.id);notice(nearby.look+' revived');sound('pickup');return true;
 }
 if(remoteSeat&&heroBeforeRemote?.hp<=0&&heroBeforeRemote.pos.distanceTo(hero.pos)<2.65){
  heroBeforeRemote.hp=48;heroBeforeRemote.hitAgo=0;return true;
 }
 return false;
}
let heroBeforeRemote=null;
function remoteAttack(m,d){
 if(performance.now()<m.fireAt||!goodVector(d.aim))return;
 const origin=m.target.clone().add(vec(0,1.39,0)),end=vec().fromArray(d.aim),length=origin.distanceTo(end);
 if(length<.001||length>97||d.axe&&length>3.7)return;
 m.fireAt=performance.now()+(d.axe?440:55);
 const rayHit=shotFrom(origin,end),target=rayHit?.object?.userData.entity,point=rayHit?.point||end;
 const nozzle=goodVector(d.muzzle)?vec().fromArray(d.muzzle):origin;
 sendGame('trace',{from:packVector(nozzle.distanceTo(origin)<2?nozzle:origin),to:packVector(point),owner:m.id,element:d.element,weapon:d.axe?null:m.heldWeapon});
 if(!d.axe)fieldShot(m.heldWeapon,origin);
 if(!target)return;
 if(target.type==='balloon'){expeditionHit(target);return}
 const element=Object.hasOwn(elementColors,d.element)?d.element:'Kinetic';
 if(target.type==='prop'){
  if(d.axe||length<48)damageProp(target,d.axe?2:1,point);
 }else if(target.type==='enemy'||target.type==='nest'){
  const head=!!rayHit.object.userData.head;
  const amount=d.axe?67:clamp(Number(d.damage)||0,8,185)*(head?1.49:1);
  if(target.type==='enemy')hurtEnemy(target,amount*engineering.damageFactor(element,target.element),point,head);
  else hurtNest(target,amount,point);
  sendGame('feedback',{hit:head?2:1},m.id);
 }
}
function handleAction(m,d){
 if(!m?.ready)return;
 if(d.action==='item-received'){
  const item=fieldDrops.get(m.pendingPickup);
  if(!item||item.id!==d.id)return;
  m.pendingPickup=null;
  if(d.accepted===true)clearFieldDrop(item.id);else item.taker=null;
  return;
 }
 if(m.vitals.hp<=0||state.finished||!coopStarted)return;
 if(d.action==='item-drop'||d.action==='item-pickup'){
  withMate(m,()=>hostFieldTransfer(m,d));return;
 }
 if(!['fire','dashHit'].includes(d.action)&&performance.now()<(m.actionAt||0))return;
 if(!['fire','dashHit'].includes(d.action))m.actionAt=performance.now()+90;
 const local={...hero},oldPiece=state.piece,oldMat=state.material,oldRecipe=state.recipe;
 heroBeforeRemote=local;
 try{withMate(m,()=>{
  if(d.action==='fire'){remoteAttack(m,d);return}
  if(d.action==='interact'){interactField();return}
  if(d.action==='dashHit'){
   const enemy=enemies.find(e=>e.active&&e.netId===d.enemy);
   if(!enemy||enemyPoint(enemy,.45).distanceTo(m.target.clone().add(vec(0,.7,0)))>3.75)return;
   m.dashed ||= new Map();
   if((m.dashed.get(enemy.netId)||0)>state.elapsed)return;
   m.dashed.set(enemy.netId,state.elapsed+7);
   const bull=d.kind==='bull';
   trapDamage(enemy,bull?61:122,bull?'Kinetic':'Aether');
   const heading=operativeForward();knockHollow(enemy,heading.x,heading.z,93,.70);
   return;
  }
  if(d.action==='fabricate'){
   const key=d.key;
   if(!gear?.canForge(key)||Object.entries(fabricationBag).some(([id,n])=>m.bag[id]<n)||
     fabricationStocks.some((n,i)=>hero.stacks[i]<n))return;
   for(const [id,n] of Object.entries(fabricationBag))m.bag[id]-=n;
   hero.stacks=hero.stacks.map((n,i)=>n-fabricationStocks[i]);
   if(d.drop===true)weaponCrate(key,hero.pos.x,hero.pos.z,Math.max(12,region.floor),'Kinetic');
   else sendGame('feedback',{fabricated:key},m.id);return;
  }
  if(d.action==='drop-stock'){dropSupplies();return}
  if(d.action==='craft'){
   if(hero.stacks[1]>=6&&hero.stacks[2]>=4){hero.stacks[1]-=6;hero.stacks[2]-=4;restock(60)}
   return;
  }
  if(goodVector(d.aim)){
   const p=vec().fromArray(d.aim);
   if(p.distanceTo(m.target)<20)aimed=shotFrom(m.target.clone().add(vec(0,1.48,0)),p);
  }
  if(d.action==='place'&&pieces[d.piece]&&materials[d.material]&&trapRecipes[d.recipe]){
   state.piece=d.piece;state.material=d.material;state.recipe=d.recipe;place();return;
  }
  if(d.action==='repair'){fortify();return}
  if(d.action==='edit'){
   const item=builds.get(d.key);
   if(item&&Number.isInteger(d.mask)&&item.group.position.distanceTo(m.target)<10&&
    engineering.connectedMask(item.piece,d.mask)&&canEditHere(item,d.mask)){
    item.mask=d.mask;item.contacts=engineering.contacts(item);rebuildStructure(item);refreshSupport();
   }
   return;
  }
  if(d.action==='ability'&&Number.isInteger(d.index)&&d.index>=0&&d.index<4&&m.cooldown[d.index]<=state.elapsed){
   const klass=Object.hasOwn(abilityTables,d.klass)?d.klass:'Vanguard';
   if((klass==='Vanguard'&&d.index===1)||(klass==='Architect'&&d.index===1)||(klass==='Shadow'&&d.index===0)||(klass==='Prospector'&&d.index===1))return;
   const bag=fieldBag;
   fieldBag=m.bag;
   let used;
   try{used=performAbility(klass,d.index)}finally{fieldBag=bag}
   if(used){
    const cooldown=abilityTables[klass][d.index][1];
    m.cooldown[d.index]=state.elapsed+cooldown;
    sendGame('feedback',{ability:[d.index,cooldown],charge:m.bag.charge},m.id);
   }
  }
 })}finally{
  hero.hp=local.hp;hero.hitAgo=local.hitAgo;heroBeforeRemote=null;
  state.piece=oldPiece;state.material=oldMat;state.recipe=oldRecipe;
 }
}
function syncLoot(list){
 const seen=new Set();
 for(const [kind,x,z,opened,active,weapon,power,element] of list){
  const key=kind+'/'+x+'/'+z;seen.add(key);
  let item=loot.find(l=>l.kind===kind&&(kind==='chest'||l.active)&&Math.hypot(l.x-x,l.z-z)<.065);
  if(!item&&kind==='weapon'&&active&&gear?.canForge(weapon)){weaponCrate(weapon,x,z,power,element);item=loot.at(-1)}
  if(!item&&active&&(kind==='airdrop'||kind==='bundle')){addCache(x,z,kind);item=loot.at(-1)}
  if(!item&&active&&kind==='flux'){addFluxAt(x,z);item=loot.at(-1)}
  if(!item)continue;
  item.active=active;item.group.visible=active||kind==='chest';
  if(kind==='chest'){
   item.opened=opened;item.lid.rotation.x=opened?-1.19:0;
   item.marker.visible=active;item.flare.visible=active;
   if(opened)item.flare.material.color.setHex(0x7ddcde);
  }
 }
 for(const item of loot)if(item.kind!=='chest'&&item.active&&
  !seen.has(item.kind+'/'+Number(item.x.toFixed(3))+'/'+Number(item.z.toFixed(3)))){item.active=false;item.group.visible=false}
}
function packStructures(){return [...builds.values()].map(i=>[i.key,i.piece,i.x,i.y,i.z,i.angle,i.layer,materials.indexOf(i.material),i.mask,i.rank,i.hp,i.max,i.construction,i.mount?.key,i.recipe?.id,i.life])}
function syncBuilds(list){
 const keep=new Set(list.map(row=>row[0]));
 for(const item of builds.values())if(!keep.has(item.key))detachStructure(item,true);
 for(const [key,piece,x,y,z,angle,layer,material,mask,rank,hp,max,construction,mountKey,recipeId,life] of list){
  let item=builds.get(key),rebuild=false;
  if(!item){
   const group=groupAt(scene,x,y,z);group.rotation.y=angle;
   const recipe=trapRecipes.find(r=>r.id===recipeId),mount=builds.get(mountKey);
   if(piece===3&&(!mount||!recipe)){scene.remove(group);continue}
   const rect={x,z,hx:piece===0&&Math.abs(Math.sin(angle))>.5?.155:GRID/2,hz:piece===0&&Math.abs(Math.sin(angle))<.5?.155:GRID/2};
   item={key,piece,type:'structure',x,y,z,angle,layer,material:materials[material],group,rect,recipe,mount,trapIn:0,
    calibration:recipe?StormwatchCitadel.tune(profile.blueprints['trap/'+recipe.id]):null,targets:[]};
   builds.set(key,item);rebuild=true;
   if(piece===0)activeWalls.push(item);else if(piece!==3)walkways.push(item);
  }
  const changed=rebuild||item.mask!==mask||item.rank!==rank,settled=item.construction>0&&construction===0;
  Object.assign(item,{mask,rank,hp,max,construction,life});
  if(changed){item.contacts=engineering.contacts(item);rebuildStructure(item)}
  constructionAppearance(item,construction);
  if(settled){physics?.update(item.targets);structureBatchDirty=true;obstaclesDirty=true}
 }
 refreshSupport();
}
function syncEnemies(list){
 const keep=new Set();
 for(const [id,kind,x,y,z,yaw,hp,max,power,element,recoil] of list){
  keep.add(id);
  let e=replicas.get(id);
  if(!e){
   e=makeHusk(kind,x,z,element);e.netId=id;e.target=vec(x,y,z);e.root.position.copy(e.target);replicas.set(id,e);
   addSparks(vec(x,y+.9,z),0xc086e8,9,3.2);
  }
  e.target.set(x,y,z);Object.assign(e,{x,z,yaw,hp,max,power,element,recoil});
 }
 for(const [id,e] of replicas)if(!keep.has(id)){
  addSparks(e.root.position.clone().add(vec(0,.88,0)),0xc38df0,11,4.2);
  scene.remove(e.root);removeTarget(enemyTargets,e.body);removeTarget(enemyTargets,e.skull);
  if(e.canister)removeTarget(enemyTargets,e.canister);
  e.spirit?.material.dispose();replicas.delete(id);
  const index=enemies.indexOf(e);if(index>=0)enemies.splice(index,1);
 }
}
function syncScene(d){
 if(!coopStarted&&!d.started)return;
 coopStarted=d.started;
 const phase=state.phase;
 for(const [i,k] of coopFields.entries())if(d.state[i]!=null)state[k]=d.state[i];
 if(phase!==state.phase&&state.phase==='arming'){
  const wave=waves[state.wave-1];
  if(wave)notice(wave.name+' · '+plannedFronts().map(lane=>frontNames[lane]).join(' / '));
  sound('wave','Assault incoming');rumble(.43,140);
 }
 if(phase==='active'&&state.phase==='prep'){
  notice('Assault repelled · Resupply and prepare for the next front');sound('pickup','Resupply delivered');
 }
 d.portals.forEach((active,i)=>{portalFx[i].active=active});
 const living=new Set();
 for(const [id,p,yaw,hp,operator,heldWeapon] of d.players){
  if(id===coop.id)continue;
  living.add(id);
  const m=mates.get(id)||hydrateMate(id,p,operator);m.target.fromArray(p);m.angle=yaw;m.heldWeapon=gear?.canForge(heldWeapon)?heldWeapon:null;
  m.vitals.hp=hp;m.ready=true;
  if(m.down!==(hp<=0)){m.down=hp<=0;m.updateLabel(m.down)}
 }
 for(const id of mates.keys())if(!living.has(id))removeMate(id);
 syncBuilds(d.builds);syncEnemies(d.enemies);syncLoot(d.loot);
 syncFieldDrops(d.itemDrops||[]);
 if(expedition&&d.expedition){
  [expStage,expRemaining,expProgress,expBaseline]=d.expedition;
  d.expedition[4].forEach(([done,visible],i)=>{
   const point=expeditionSites[i];if(!point)return;
   if(done&&!point.done)completeSite(point);else point.group.visible=visible;
  });
  if(expKind==='data')atlasModel.visible=expStage!=='balloon';
  placeExpCart();
 }
 for(const [index,hp,searched] of d.props){
  const prop=props[index];if(prop&&searched)prop.searched=true;
  if(!prop?.alive||hp>=prop.hp)continue;
  prop.hp=hp;prop.weak=null;prop.weakIndex++;
  const hit=vec(prop.x,Math.min(prop.top,prop.y+.78),prop.z);
  addSparks(hit,materials[prop.kind].color,hp?4:11,hp?2:4);
  if(!hp)breakProp(prop,hit,true);
  else {prop.shake=.35;prop.impact=.10;cracked.add(prop)}
 }
 if(state.mission==='nests'){
  state.nest=null;
  for(const [index,n] of nests.entries()){
   const packet=d.nests[index];if(!packet)continue;
   const [active,hp,remaining,marked,opened]=packet;
   n.active=n.group.visible=active;n.hp=hp;n.remaining=remaining;if(marked)state.nest=n;
   n.shield.visible=!opened;
   if(opened&&active&&!n.hit)n.hit=registerHit(n.gemstone,n);
   if(!active&&n.hit){removeTarget(shotProps,n.hit);n.hit=null}
  }
 }
 if(state.mission==='payload'){
  pod.visible=state.phase==='payload'||state.prep<4;pod.position.y=Math.max(0,state.prep/4)**1.27*22;
  if(state.phase==='payload'&&!atlasBody.alive){
   atlasBody.alive=true;atlasBody.top=1.78;atlasBody.r=1.35;
   atlasHit=registerHit(block(pod,invisible,0,.82,0,1.74,1.65,1.74,false),atlasBody);
  }
 }
 for(let i=0;i<Math.max(remoteProjectiles.length,d.projectiles.length);i++){
  const p=d.projectiles[i];let item=remoteProjectiles[i];
  if(!p){if(item)item.visible=false;continue}
  if(!item)item=remoteProjectiles[i]=mesh(scene,gem,accent,...p,.18,.2,.18,false);
  item.visible=true;item.position.set(...p);
 }
}
function teamHud(){
 if(!coop)return;
 const rows=[...mates.values()].filter(m=>m.ready).map(m=>m.look+(m.down?' · DOWN':' · '+Math.ceil(m.vitals.hp)+' HP'));
 if(hero.hp<=0)rows.unshift('DOWN · A squadmate can revive you with F');
 text(ui['squad-status'],rows.join('  /  '));
}
function receiveGame(d,id){
 if(d.type==='lost'){if(!state.finished)finish(false,'Connection to the host was lost',true);return}
 if(d.type==='left'){removeMate(id);if(state.deployed)downCheck();return}
 if(d.round!==nround||!state.deployed)return;
 if(!guest){
  if(d.type==='pose'&&goodVector(d.pos)&&d.pos.every((v,i)=>Math.abs(v)<(i===1?32:BOUND+2))&&Number.isFinite(d.yaw+d.pitch)){
   const m=mates.get(id)||hydrateMate(id,d.pos,d.operator);
   m.target.fromArray(d.pos);m.angle=d.yaw;m.heldWeapon=gear?.canForge(d.heldWeapon)?d.heldWeapon:null;m.pitch=clamp(d.pitch,-1.16,1.16);
   if(!m.ready&&Number.isFinite(d.maxhp+d.maxShield)){
    if(inventory&&Array.isArray(d.stacks)&&d.stacks.length===3&&d.stacks.every(n=>Number.isInteger(n)&&n>=0&&n<=999))m.vitals.stacks=d.stacks;
    m.ready=true;m.vitals.hp=m.vitals.maxhp=clamp(d.maxhp,100,250);
    m.vitals.shield=m.vitals.maxShield=clamp(d.maxShield,60,200);
   }
  }else if(d.type==='action')handleAction(mates.get(id),d);
  else if(d.type==='withdraw'){removeMate(id);downCheck()}
  return;
 }
 if(d.type==='scene')syncScene(d);
 if(d.type==='feedback'){
  receiveFieldTransfer(d);
  if(d.line)notice(d.line);
  if(d.hit){state.hit=.21;sound('hit');viewKick(.07)}
  if(d.ammo)restock(d.ammo);
  if(d.part)collectPart(d.part[0],d.part[1]);
  if(d.discovery)discoveries.set(d.discovery.id,d.discovery);
  if(d.weapon)equipLoot(d.weapon);
  if(d.fabricated){
   for(const [id,n] of Object.entries(fabricationBag))fieldBag[id]=Math.max(0,fieldBag[id]-n);
   if(gear?.canForge(d.fabricated))equipLoot({k:d.fabricated,power:Math.max(12,region.floor),element:'Kinetic'});
  }
  if(d.ability&&Number.isInteger(d.ability[0])){
   abilityCooldown[d.ability[0]]=d.ability[1];
   fieldBag.charge=d.charge;sound('pulse');rumble(.46,100);viewKick(.14);
  }
 }
 if(d.type==='vitals'){
  const was=hero.hp;hero.hp=d.hp;hero.shield=d.shield;hero.stacks=d.stacks;hero.cache=d.cache;hero.repairs=d.repairs;
  if(hero.hp<was){state.damage=.66;sound('hurt');viewKick(.24)}
  if(was<=0&&hero.hp>0){notice('Squadmate revived you');sound('pickup')}
 }
 if(d.type==='reward'&&!state.finished){
  const wave=state.wave;state.wave=d.wave;
  awardWave(d.bonus);bankSalvage(false,true);state.wave=wave;
 }
 if(d.type==='end'){
  if(d.hostLeft&&!state.finished)finish(false,'The host returned to command',true);
  else if(!d.hostLeft&&!state.finished)finish(d.win,d.message,true);
 }
 if(d.type==='trace'&&d.owner!==coop.id&&goodVector(d.from)&&goodVector(d.to)){
  const origin=vec().fromArray(d.from);
  tracer(origin,vec().fromArray(d.to),d.element);
  if(d.weapon&&gear?.canForge(d.weapon))fieldShot(d.weapon,origin);
 }
}
function networkTick(dt){
 if(!coop||!state.deployed)return;
 for(const m of mates.values())peerLife(m,dt);
 netClock+=dt;if(netClock<.083)return;netClock=0;
 if(guest){
  if(!state.finished)sendGame('pose',{pos:packVector(hero.pos),yaw:hero.yaw,pitch:hero.pitch,operator:gear?.operator,maxhp:hero.maxhp,maxShield:hero.maxShield,stacks:hero.stacks,heldWeapon:weaponVisible()?currentGun()?.k:null});
  return;
 }
 if(!coopStarted){
  signalTick+=.083;
  coopStarted=coopReady&&([...mates.values()].filter(m=>m.ready).length>=coop.size-1||signalTick>=15);
  }
 const heldWeapon=weaponVisible()?currentGun()?.k:null;
 const enemyRows=enemies.filter(e=>e.active).map(e=>[e.netId,e.kind,...packVector(e.root.position),+e.yaw.toFixed(2),e.hp,e.max,e.power,e.element,e.recoil]);
 sendGame('scene',{
  started:coopStarted,state:coopFields.map(key=>state[key]),portals:portalFx.map(p=>p.active),
  players:[[coop.id,packVector(hero.pos),hero.yaw,hero.hp,gear?.operator,heldWeapon],...[...mates.values()].filter(m=>m.ready).map(m=>[m.id,packVector(m.target),m.angle,m.vitals.hp,m.operator,m.heldWeapon])],
  enemies:enemyRows,
  itemDrops:[...fieldDrops.values()].filter(drop=>!drop.taker).map(drop=>[drop.id,drop.x,drop.z,drop.label,drop.weapon]),
  builds:packStructures(),
  loot:loot.filter(l=>l.active||!['bundle','weapon'].includes(l.kind)).map(l=>[l.kind,+l.x.toFixed(3),+l.z.toFixed(3),!!l.opened,l.active,...(l.kind==='weapon'?[l.reward.k,l.power,l.element]:[])]),
  props:props.flatMap((p,i)=>p.hp<p.max||p.searched?[[i,p.hp,!!p.searched]]:[]),
  expedition:expedition?[expStage,expRemaining,expProgress,expBaseline,expeditionSites.map(p=>[p.done,p.group.visible])]:null,
  nests:nests.map(n=>[n.active,n.hp,n.remaining,n===state.nest,!!n.hit]),
  projectiles:[...bolts.map(b=>b.group),...trapShots.map(s=>s.model)].map(m=>packVector(m.position))
 });
 for(const m of mates.values())if(m.ready)sendGame('vitals',m.vitals,m.id);
}
function hostSquadTick(dt){
 if(!coop||guest)return;
 for(const m of mates.values()){
  if(!m.ready||m.vitals.hp<=0)continue;
  const v=m.vitals;v.hitAgo+=dt;
  if(v.hitAgo>5.5)v.shield=Math.min(v.maxShield,v.shield+dt*11);
  m.storm=Math.max(0,(m.storm||0)-dt);
  if(!m.storm&&['active','seal','payload','hunt','exp-defense'].includes(state.phase)&&stormDistance(m.target.x,m.target.z)>state.stormRadius){
   m.storm=.85;damageMate(m,4+state.wave*2);
  }
  withMate(m,()=>activePickups(0));
 }
}
function animateReplicas(dt){
 for(const e of replicas.values()){
  const moving=e.root.position.distanceTo(e.target)>.09;
  e.root.position.lerp(e.target,1-Math.exp(-dt*20));
  e.root.rotation.y+=Math.atan2(Math.sin(e.yaw-e.root.rotation.y),Math.cos(e.yaw-e.root.rotation.y))*Math.min(dt*12,1);
  e.bob+=dt*(moving?9:3);
  e.rig.position.y=Math.abs(Math.sin(e.bob))*.085;
  e.chest.rotation.x=-.14-(e.recoil>0?.21:0);
  for(const [i,limb] of e.limbs.entries()){
   const step=Math.sin(e.bob+i*Math.PI);
   limb.leg.rotation.x=moving?step*.63:step*.085;
   limb.arm.rotation.x=-.54+(moving?step*.38:0)-e.recoil;
  }
 }
 for(const n of nests)if(n.active){n.gemstone.rotation.y+=dt*.75;n.gemstone.position.y=1.14+Math.sin(state.elapsed*2+n.x)*.09}
}
const unsubscribeCoop=coop?.subscribe(receiveGame);

let last=performance.now(),nextHud=0,renderAfter=0,wasFire=false;
function tick(now){
 if(controller.signal.aborted)return;
 requestAnimationFrame(tick);
 const realTime=Math.max(0,(now-last)/1000),dt=Math.min(realTime,.045);
 last=now;
 const input=pollController(dt),pad=state.screen==='pack'?null:input;
 if(!state.paused){
  state.elapsed+=dt;
  state.stormTick=(state.stormTick||0)-dt;
  if(['active','seal','payload','hunt','exp-defense'].includes(state.phase)&&stormDistance(hero.pos.x,hero.pos.z)>state.stormRadius&&state.stormTick<=0){
   state.stormTick=.85;hurtHero(4+state.wave*2);
  }
  hero.shout=Math.max(0,hero.shout-dt);
  hero.heat=Math.max(0,hero.heat-dt*.95);
  state.damage=Math.max(0,state.damage-dt*2.8);
  state.hit=Math.max(0,state.hit-dt);state.toasted=Math.max(0,state.toasted-dt);
  hero.shot=Math.max(0,hero.shot-dt);hero.flash=Math.max(0,(hero.flash||0)-dt);
  hero.pulse=Math.max(0,hero.pulse-dt);hero.hitAgo+=dt;
  if(!guest&&hero.hp>0&&hero.hitAgo>5.5)hero.shield=Math.min(hero.maxShield,hero.shield+dt*11);
  if(hero.reload>0){
   hero.reload-=dt;
   if(hero.reload<=0){
    const gun=currentGun(),amount=Math.min(gun.stats.m-gun.mag,gun.reserve);
    gun.mag+=amount;gun.reserve-=amount;
   }
  }
  hero.aim=!state.building&&(mouseAim||!!pad?.aim);
  hero.emote=Math.max(0,hero.emote-dt);
  animateConstruction(dt);physics?.advance(dt);updateGadgets(dt);
  if(hero.hp>0){moveHero(dt,state.edit?null:pad);afterDash(dt)}else{hero.move=0;hero.sprint=false}
  if(hero.move>.18)hero.emote=0;
  animHero(dt);cameraTick(dt);
  // Rapier owns its collider transforms. The mesh-ray fallback still needs an up-to-date scene.
  if(!physics)scene.updateMatrixWorld();
  getAim();watchWeakPoint();updateBlueprint();advancePickaxe(dt);
  if(hero.hp>0&&state.building&&!state.edit&&pad?.place)place();
  const fire=mouseFire||!!pad?.fire;
  if(hero.hp>0&&!state.building&&!state.edit&&fire&&(!wasFire||!currentGun()||currentGun().stats.au))attack();
  wasFire=fire;
  activePickups(dt);
  for(const drop of fieldDrops.values()){drop.marker.rotation.y+=dt;drop.marker.position.y=.55+Math.sin(state.elapsed*3+drop.x)*.11}
  animateWorld(dt);animateParticles(dt);animateDebris(dt);wobbleProps(dt);fieldFeedback(dt);
  ui.cross.dataset.hit=state.hit>0?'yes':'no';
  ui.cross.dataset.build=state.building?'yes':'no';
  ui.damage.style.opacity=state.damage;
  if(state.toasted===0)ui.toast.hidden=true;
  if(now>=nextHud){updateHUD();nextHud=now+90}
 }else if(state.screen==='brief'){
  state.elapsed+=dt;
  animHero(dt);cameraTick(dt,true);animateWorld(dt);
 }
 if(!state.finished&&state.deployed){
  if(guest)animateReplicas(dt);
  else if(!state.paused||coopStarted){
   if(!coop||coopStarted){waveTick(dt,Math.min(realTime,.16));hostSquadTick(dt);downCheck()}
  }
  networkTick(dt);
 }
 pollController.wasFire=!!pad?.fire;
 if(inventory&&now>=nextInventoryWrite){nextInventoryWrite=now+8000;persistField()}
 if(now>=renderAfter){
  batchStructures();
  renderAfter=now+(state.paused?29:0);
  render.render(scene,camera);
 }
}
requestAnimationFrame(tick);
return {save:persistField,close(){
 emoteWheel?.();persistField();unsubscribeCoop?.();
 if(coop){
  if(!guest&&!state.finished)sendGame('end',{hostLeft:true});
  if(guest&&!state.finished)sendGame('withdraw');
  for(const id of mates.keys())removeMate(id);
 }
 bankSalvage(false,false);
 unmountCitadel?.();citadel?.close();
 controller.abort();
 if(document.pointerLockElement===canvas)document.exitPointerLock();
 unbindFieldAudio();fieldCaptions.close();
 if(audio){PlayerAudio.release(audio);audio.close()}
 physics?.close();
 actor.baseModel?.parent?.remove(actor.baseModel);
 if(actor.flash.parent)actor.flash.parent.remove(actor.flash);
 actor.flash.material.dispose();
 const geometries=new Set(),materials=new Set();
 scene.traverse(node=>{
  if(node.userData.sfBorrowed)return;
  if(node.geometry)geometries.add(node.geometry);
  if(node.isInstancedMesh)node.dispose();
  if(node.material)materials.add(node.material);
 });
 for(const m of palette.values())materials.add(m);
 for(const m of structureMaterials.values())materials.add(m);
 geometries.forEach(g=>g.dispose());
 materials.forEach(m=>{
  if(m.map&&m.map!==haloMap&&m.map!==shadowTexture&&m.map!==weakTexture)m.map.dispose();
  m.dispose();
 });
 haloMap.dispose();shadowTexture.dispose();weakTexture.dispose();
 if(embedded){
  if(oldRenderer.style===null)canvas.removeAttribute('style');
  else canvas.setAttribute('style',oldRenderer.style);
  if(oldRenderer.tabindex===null)canvas.removeAttribute('tabindex');
  else canvas.setAttribute('tabindex',oldRenderer.tabindex);
  render.outputEncoding=oldRenderer.encoding;
  render.toneMapping=oldRenderer.tone;
  render.toneMappingExposure=oldRenderer.exposure;
  render.shadowMap.enabled=oldRenderer.shadows;
  render.shadowMap.type=oldRenderer.shadowType;
  render.setPixelRatio(oldRenderer.pixelRatio);
  render.setSize(innerWidth,innerHeight);
  render.renderLists.dispose();
 }else{render.dispose();render.forceContextLoss();canvas.remove()}
 host.remove();
}};
}};

})();

;
/* Stormfront runs in its own Three.js scene with a host-authoritative co-op simulation. */
(() => {
'use strict';
const D=StormfrontData, T=window.THREE;
const urlParams=new URLSearchParams(location.search);
let arena=null;
try{if(window.parent!==window)arena=window.parent.SpartanStormfront||null}catch{}
if(!arena&&window.parent===window&&!urlParams.has('standalone')){
 location.replace('index.html?stormfront=1');return;
}
const root=document.querySelector('#sf-root'),stage=document.querySelector('#sf-stage');
const node=(tag,text='',className='')=>{
 const el=document.createElement(tag);el.className=className;el.textContent=text;return el;
};
const button=(text,onClick,opts={})=>{
 const el=node('button',text,opts.className);el.type='button';el.disabled=!!opts.disabled;
 el.addEventListener('click',onClick);return el;
};
const add=(parent,...children)=>{parent.append(...children);return parent};
const control=(label,values,selected,change)=>{
 const select=node('select');select.setAttribute('aria-label',label);
 for(const [key,name] of values){const option=node('option',name);option.value=key;select.append(option)}
 select.value=selected;select.addEventListener('change',()=>change(select.value));return select;
};
const {clamp}=D;
const values=Object.values;
const keys=Object.keys;
const now=()=>performance.now()/1000;
const makeSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const pigment=value=>new T.Color(value).convertSRGBToLinear();
const colors={Physical:'#c7b3fa',Fire:'#ff7659',Water:'#77cfff',Nature:'#95eb9b',Energy:'#51f4eb'};
const officialKey='sf-profile-v1', modeKey='sf-content-v1:';
const gameBuild='stormfront-5';
const classicMissions={relay:'defense','seal-classic':'seal','nests-classic':'nests','payload-classic':'payload'};
const classicRegions={quarrywood:'timbervale',timbervale:'ironridge','mesa-gorge':'canyonlands','obsidian-peaks':'obsidian'};
let arenaGear,scene,camera,renderer,loop,classic,workshop,mode='hub',profile,profileKey,packList,catalog,section='Homebase',subsection='',selectedZone,selectedMission,rooms,notice,veraPage=0;
let soundContext,basePanel='',missionMapObserver;
function sound(freq=400,end=freq,duration=.12,volume=.06,type='triangle'){
 try{
  soundContext??=new (window.AudioContext||window.webkitAudioContext)();
  if(soundContext.state==='suspended')soundContext.resume().catch(()=>{});
  const time=soundContext.currentTime,osc=soundContext.createOscillator(),gain=soundContext.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,time);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),time+duration);
  gain.gain.setValueAtTime(volume,time);gain.gain.exponentialRampToValueAtTime(.001,time+duration);
  osc.connect(gain).connect(soundContext.destination);osc.start();osc.stop(time+duration);
 }catch{}
}
const sharedRemap={rook:'sd-ar',slate:'sd-sg',cinder:'sd-mg',annihilator:'sd-an',wasp:'sd-smg',northstar:'sd-sn',hinge:'sd-pd',flare:'sd-rl',
 edge:'sd-katana',pike:'sd-katana',harrow:'sd-katana',maul:'sd-katana',cleaver:'sd-katana',spanner:'sd-katana'};
const fieldSupplies={Wood:70,Stone:50,Metal:40,Planks:12,'Rough Ore':12,Twine:8,'Mechanical Parts':9,Batteries:6,Copper:5,Ammo:190};
const supplyKeys=[...keys(D.material),...D.components,'Ammo'];
const rackLimit=()=>Math.min(32,6+Math.floor(D.campaign(profile).level/2)*2);
const weaponLimit=32;
function stockKey(){return catalog.weapons['sd-ar']?'sd-ar':'rook'}
function fieldWeapon(id){return catalog.weapons[id]||catalog.weapons[stockKey()]}
function currentLook(key){return key&&key!=='KATANA'&&arena?.look(key)||{camo:'',attachments:[],charm:''}}
function maxDurability(id,card){
 const def=fieldWeapon(id);
 return (def.durability||100)+(card.path==='core'?30:card.path==='beam'?-20:0)+card.perks[2]*10;
}
function craftedWeapon(id,card){
 const max=maxDurability(id,card);
 return {uid:'item-'+Array.from(crypto.getRandomValues(new Uint32Array(2)),n=>n.toString(36)).join('-'),
  id,condition:max,max,clip:fieldWeapon(id).mag,card:D.copy(card)};
}
function recipe(id,card,zone){
 if(id==='Ammo')return {'Rough Ore':1,'Mechanical Parts':1};
 if(catalog.traps[id])return {Planks:1,'Rough Ore':1,Twine:1};
 const ore=card.path==='beam'?(card.level>40?'Sunbeam':'Shadowshard'):card.path==='core'?(card.level>40?'Brightcore':'Obsidian'):zone.ore;
 return {Planks:2,'Mechanical Parts':2,[ore]:1};
}
function payBag(bag,cost){
 if(keys(cost).some(key=>(bag[key]||0)<cost[key]))return false;
 for(const [key,number] of Object.entries(cost))bag[key]-=number;
 return true;
}
function recipeText(cost){return Object.entries(cost).map(([name,n])=>name+' ×'+n).join(' · ')}
function loadProfile(){
 if(!Array.isArray(packList))packList=[];
 try{catalog=D.applyPacks(packList)}
 catch{packList=[];catalog=D.applyPacks([])}
 if(arena){
  arenaGear=arena.gear();
  const custom=Object.fromEntries(Object.entries(catalog.weapons).filter(([id])=>!D.content.weapons[id]));
  catalog.weapons={...Object.fromEntries(arena.arsenal().map(w=>[w.id,w])),...custom};
 }
 const signature=packList;
 profileKey=signature.length?modeKey+D.hash(signature):officialKey;
 profile={...D.freshProfile(),...D.load(profileKey,{})};
 const progress=D.campaign(profile);
 for(const [id,level] of Object.entries(D.heroLevels))if(progress.level>=level&&!profile.owned.includes(id))profile.owned.push(id);
 if(!catalog.heroes[profile.hero]||progress.level<D.heroLevel(profile.hero))profile.hero='mara';
 if(arenaGear&&profile.operator&&!arenaGear.operators.some(([id])=>id===profile.operator))profile.operator=null;
 if(arena&&!profile.sharedArmory){
  for(const [id,sdId] of Object.entries(sharedRemap)){
   if(profile.schematics[id]&&catalog.weapons[sdId]&&!profile.schematics[sdId])profile.schematics[sdId]=profile.schematics[id];
   delete profile.schematics[id];
  }
  for(const key of [arenaGear.primary,arenaGear.secondary,'sd-katana','sd-ar'])if(catalog.weapons[key])profile.schematics[key]??=newSchematic(catalog.weapons[key]);
  profile.selected=catalog.weapons[sharedRemap[profile.selected]]?sharedRemap[profile.selected]:arenaGear.primary;
  if(Array.isArray(profile.items))profile.items=profile.items.map(item=>({...item,id:sharedRemap[item.id]||item.id})).filter(item=>catalog.weapons[item.id]);
  if(Array.isArray(profile.bankWeapons))profile.bankWeapons=profile.bankWeapons.map(item=>({...item,id:sharedRemap[item.id]||item.id})).filter(item=>catalog.weapons[item.id]);
  profile.queued=null;profile.sharedArmory=true;
 }
 if(!catalog.weapons[profile.selected])profile.selected=stockKey();
 
 if(!Array.isArray(profile.items)){
  const starter=[profile.selected,arenaGear?.secondary,arena?'sd-katana':'edge'].filter(id=>catalog.weapons[id]);
  profile.items=[...new Set(starter)].map(id=>craftedWeapon(id,profile.schematics[id]||newSchematic(catalog.weapons[id])));
  for(const [id,n] of Object.entries(fieldSupplies)){
   if(!Object.hasOwn(profile.backpack,id))profile.backpack[id]=n;
  }
 }
 profile.bankWeapons=Array.isArray(profile.bankWeapons)?profile.bankWeapons:[];
 if(!profile.items.some(item=>item.uid===profile.equipped))profile.equipped=profile.items.find(item=>item.id===profile.selected)?.uid||profile.items[0]?.uid||null;
 D.claimResearch(profile);
 selectedZone=Object.hasOwn(catalog.zones,selectedZone)?selectedZone:'quarrywood';
 if(signature.length&&!profile.modWelcome){
  for(const [id,definition] of Object.entries(catalog.weapons))if(!definition.arenaKey&&!D.content.weapons[id])profile.schematics[id]=newSchematic(definition);
  for(const [id,definition] of Object.entries(catalog.traps))if(!D.content.traps[id])profile.schematics[id]=newSchematic(definition);
  for(const id of keys(catalog.heroes))if(!D.content.heroes[id])profile.owned.push(id);
  profile.modWelcome=true;
 }
 persist();
}
function campaignLevel(){return D.campaign(profile).level}
function schematicLevel(id){
 const def=catalog.weapons[id]||catalog.traps[id];
 if(id==='spikes'||id===stockKey()||id==='edge'||id==='sd-katana')return 1;
 if(def?.behavior==='defend')return 5;
 if(def?.type==='Explosive Launcher'||def?.behavior==='intercept')return 7;
 if(def?.mount==='ceiling')return 4;
 return 2;
}
function campaignPayout(zone,id,tier){
 const before=campaignLevel(),progress=D.campaign(profile),quest=progress.quest;
 let earned=90+tier*53;
 if(quest&&quest[0]===zone&&quest[1]===id){
  profile.quests.push(zone+':'+id);earned+=quest[3];
 }
 profile.campaignXp+=earned;
 const after=campaignLevel();profile.upgrade+=Math.max(0,after-before);
 return earned;
}
function persist(){return D.save(profileKey,profile)}
function newSchematic(definition){
 return {level:1,element:definition?.element||null,perks:Array(6).fill(0),path:'',copies:1};
}
function grantSchematic(id){
 const card=profile.schematics[id];
 if(card)card.copies++;
 else profile.schematics[id]=newSchematic(catalog.weapons[id]||catalog.traps[id]);
}
function roomSignature(){return gameBuild+(arena?'-arena':'-standalone')+(packList.length>0?'-'+profileKey:'')}

const geometries=new Map(), materials=new Map();
function geometry(shape){
 if(!geometries.has(shape)){
  const builders={
   box:()=>new T.BoxGeometry(1,1,1),sphere:()=>new T.SphereGeometry(.5,14,10),
   cylinder:()=>new T.CylinderGeometry(.5,.5,1,12),cone:()=>new T.ConeGeometry(.5,1,8),
   octa:()=>new T.OctahedronGeometry(.63),torus:()=>new T.TorusGeometry(.43,.06,6,23),
   ico:()=>new T.IcosahedronGeometry(.6,0),hex:()=>new T.CylinderGeometry(.5,.5,1,6)
  };
  geometries.set(shape,builders[shape]());
 }
 return geometries.get(shape);
}
function material(color,glow=false,alpha=1,metal=false){
 const id=[color,glow,alpha,metal].join('/');
 if(!materials.has(id)){
  materials.set(id,glow?new T.MeshBasicMaterial({color:pigment(color),toneMapped:false,transparent:alpha<1,opacity:alpha,depthWrite:alpha===1}):
   new T.MeshStandardMaterial({color:pigment(color),roughness:metal?.44:.83,metalness:metal?.45:.04,transparent:alpha<1,opacity:alpha,depthWrite:alpha===1}));
 }
 return materials.get(id);
}
function part(group,shape,color,size,at,rotation,opts={}){
 const mesh=new T.Mesh(geometry(shape),material(color,opts.glow,opts.alpha,opts.metal));
 mesh.position.set(...at);mesh.scale.set(...size);if(rotation)mesh.rotation.set(...rotation);
 group.add(mesh);return mesh;
}
const box=(g,c,x,y,z,w,h,d,opts)=>part(g,'box',c,[w,h,d],[x,y,z],null,opts);
const orb=(g,c,x,y,z,w,opts)=>part(g,'sphere',c,[w,w,w],[x,y,z],null,opts);
const lamp=(g,c,x,y,z,w=.11)=>orb(g,c,x,y,z,w,{glow:true});
const ring=(g,c,x,y,z,w,opts)=>part(g,'torus',c,[w,w,w],[x,y,z],[Math.PI/2,0,0],opts);
function group(parent,x=0,y=0,z=0){
 const g=new T.Group();g.position.set(x,y,z);parent?.add(g);return g;
}
function custom(g,model){
 for(const p of model)part(g,p.shape,p.color,p.size,p.at,p.rotation,{glow:p.glow,metal:!p.glow});
 return g;
}
function tube(g,a,b,width,color,glow=false){
 const center=a.clone().add(b).multiplyScalar(.5);
 const mesh=part(g,'cylinder',color,[width,a.distanceTo(b),width],center.toArray(),null,{glow});
 mesh.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());return mesh;
}
function weaponModel(parent,def,look){
 const g=group(parent);
 if(def.arenaKey&&arena){
  const shared=arena.weapon(def.arenaKey,look||currentLook(def.arenaKey));
  if(shared){g.add(shared);return g}
 }
 if(def.id==='annihilator')return buildAnnihilatorModel(T,g);
 if(def.model)return custom(g,def.model);
 const deep='#28313e',band='#869b9c';
 if(!def.mag){
  box(g,deep,0,0,0,.09,.09,.45);
  if(/Sword|Spear|Scythe/.test(def.type)){
   part(g,'octa',def.color,[.12,.065,.72],[0,0,.49],null,{metal:true});
   box(g,band,0,0,.09,.33,.07,.06,{metal:true});
   box(g,colors[def.element],0,.053,.47,.035,.017,.45,{glow:true});
  }else{
   box(g,def.color,0,0,.37,/Axe/.test(def.type)?.48:.28,.18,.27,{metal:true});
   box(g,band,0,.06,.48,.3,.15,.06,{metal:true});
  }
  return g;
 }
 const long=/Sniper|Launcher/.test(def.type),length=long?.93:/Pistol/.test(def.type)?.38:.72;
 if(def.type==='Bow'){
  tube(g,V(-.32,0,0),V(0,.16,.27),.055,def.color);
  tube(g,V(.32,0,0),V(0,.16,.27),.055,def.color);
  tube(g,V(-.32,0,0),V(.32,0,0),.016,'#d6e9dc',true);return g;
 }
 box(g,def.color,0,.03,.07,.23,.24,length,{metal:true});
 box(g,deep,0,.02,-length*.55,.15,.15,.23);
 box(g,deep,0,-.14,0,.12,.23,.19);
 box(g,band,0,.17,.12,.16,.045,length*.7,{metal:true});
 part(g,'cylinder',deep,[long?.18:.085,.32,long?.18:.085],[0,.055,.23+length*.38],[Math.PI/2,0,0]);
 for(const x of [-.12,.12])box(g,colors[def.element],x,.07,length*.12,.018,.038,.18,{glow:true});
 return g;
}
function humanoid(parent,def,kind='hero'){
 const g=group(parent),skin=kind==='hero'?'#b58268':def.color,uniform=kind==='hero'?'#303547':'#454655';
 if(def.model){custom(g,def.model);return {g,animated:false}}
 const torso=group(g,0,1.03,0),legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=group(g,side*.17,.82,0),arm=group(torso,side*.34,.39,0);
  box(leg,uniform,0,-.21,0,.22,.43,.24);
  box(leg,def.color,0,-.38,.065,.23,.19,.18,{metal:true});
  box(leg,'#27313c',0,-.62,.07,.23,.17,.35);
  box(arm,uniform,0,-.23,0,.18,.39,.21);
  box(arm,def.color,0,.02,0,.25,.22,.25,{metal:true});
  orb(arm,skin,0,-.46,.025,.18);
  legs.push(leg);arms.push(arm);
 }
 part(torso,'cylinder',uniform,[.53,.69,.48],[0,.06,0]);
 box(torso,def.color,0,.14,.13,.49,.43,.2,{metal:true});
 box(torso,'#26323c',0,.11,-.23,.41,.58,.23,{metal:true});
 box(torso,kind==='hero'?'#84f4da':'#cb8dfa',0,.22,-.35,.21,.048,.025,{glow:true});
 const helmet=group(torso,0,.55,0);
 part(helmet,'sphere',skin,[.37,.44,.36],[0,0,0]);
 if(kind==='hero'){
  part(helmet,'sphere',def.color,[.43,.29,.43],[0,.13,-.02]);
  box(helmet,'#27333d',0,.06,.16,.38,.12,.1);
  box(helmet,'#b4f8ef',0,.066,.22,.26,.035,.022,{glow:true});
  const gun=weaponModel(torso,fieldWeapon(stockKey()));gun.position.set(.34,.07,.43);
  return {g,legs,arms,torso,gun,animated:true};
 }
 for(const x of [-.077,.077])lamp(helmet,'#ddc9ff',x,.04,.171,.081);
 box(helmet,'#303043',0,-.068,.158,.17,.043,.06);
 return {g,legs,arms,torso,helmet,animated:true};
}
function harvestTool(parent){
 const g=group(parent);
 tube(g,V(0,0,-.37),V(0,0,.67),.074,'#a1794e');
 for(let n=0;n<5;n++)part(g,'cylinder','#4c4c4c',[.087,.055,.087],[0,0,-.24+n*.058],[Math.PI/2,0,0]);
 const tips=[[-.44,-.13,.63],[-.23,.06,.65],[.06,.13,.66],[.29,.02,.64],[.42,-.15,.59]];
 for(let i=1;i<tips.length;i++)tube(g,V(...tips[i-1]),V(...tips[i]),i===1||i===4?.073:.13,'#728c91');
 box(g,'#b58050',0,.02,.59,.15,.21,.16,{metal:true});
 return g;
}
function playerModel(parent,p,harvest){
 const def=catalog.heroes[p.hero],weapon=fieldWeapon(p.weapon);
 if(arena&&!def.model){
  const g=group(parent),rig=arena.operator(g,p.operator||'recruit');
  const gun=harvest?harvestTool(g):weaponModel(g,weapon,p.visual||currentLook(weapon.arenaKey));
  if(harvest)gun.rotation.z=-.25;
  const fit=gun.children[0]?.userData.fit;
  if(fit){gun.scale.setScalar(fit.s);gun.position.set(-.13,1.31,fit.gz)}
  else gun.position.set(-.21,1.27,.4);
  return {g,rig,gun,fit,harvest,shared:true,animated:true};
 }
 const model=humanoid(parent,def);
 if(model.gun){
  model.torso.remove(model.gun);
  model.gun=harvest?harvestTool(model.torso):weaponModel(model.torso,weapon);
  model.gun.position.set(-.34,.07,.43);
 }
 return model;
}
function animateActor(model,phase,speed,aim=false){
 if(!model.animated)return;
 if(model.shared){
  const {rig,gun}=model,wave=Math.sin(phase),pace=Math.min(1,speed/5),swing=wave*.69*pace;
  const height=arena.walk(rig,(phase/TAU)%1,speed);
  for(const piece of rig.hip)piece.position.y=-height;
  rig.sh.rotation.x=(aim?.08:.05)+pace*.09;
  rig.sh.rotation.y=wave*pace*.045;
  rig.head.rotation.x=aim?-.03:Math.sin(phase*.57)*.04;
  rig.sh.position.y=1-height+Math.cos(phase*2)*.012*pace;
  gun.position.y=1.31+Math.sin(phase*2)*.024*pace;
  gun.rotation.x=aim?-.03:.13+Math.abs(swing)*.23;
  const ref=gun.children[0]?.userData.a;
  arena.pose(rig,gun,ref,aim,model.harvest);
  return;
 }
 const swing=Math.sin(phase)*Math.min(.8,speed*.14);
 if(model.husk){
  model.legs[0].rotation.x=swing*1.26;model.legs[1].rotation.x=-swing*.94;
  model.arms[0].rotation.x=-.7-swing*.8;model.arms[1].rotation.x=-.53+swing*.8;
  model.torso.rotation.y=swing*.4;model.torso.rotation.z=swing*.19;
  model.helmet.rotation.z=Math.sin(phase*.61)*.10-.12;
  model.jaw && (model.jaw.rotation.x=Math.abs(swing)*.25);
  return;
 }
 model.legs[0].rotation.x=swing;model.legs[1].rotation.x=-swing;
 model.arms[0].rotation.x=aim?-1.1:-swing;model.arms[1].rotation.x=aim?-.9:swing;
 model.torso.position.y=1.03+Math.abs(Math.sin(phase))*.05*Math.min(1,speed);
 model.gun && (model.gun.rotation.x=aim?-.04:.17+Math.abs(swing)*.25);
}
function robot(parent){
 const g=group(parent);
 orb(g,'#b38755',0,0,0,.75);
 part(g,'cylinder','#495868',[.54,.23,.54],[0,0,.28],[Math.PI/2,0,0],{metal:true});
 lamp(g,'#75fbf1',0,0,.43,.31);
 ring(g,'#7b8998',0,0,0,.91);
 for(const x of [-.4,.4])orb(g,'#92876a',x,0,0,.17);
 tube(g,V(.15,.24,0),V(.26,.52,0),.035,'#6f787a');lamp(g,'#f1c88d',.26,.52,0,.075);
 return g;
}
function worldScene(zone){
 const s=new T.Scene();
 s.background=pigment(zone.sky);s.fog=new T.FogExp2(pigment(zone.sky),.015);
 const hemi=new T.HemisphereLight('#c4dbff','#323455',.88);s.add(hemi);
 const sun=new T.DirectionalLight('#ffdeac',1.5);sun.position.set(-25,24,13);s.add(sun);
 const rim=new T.DirectionalLight('#9082ff',.65);rim.position.set(14,7,-30);s.add(rim);
 return s;
}
function propModel(parent,type,zone,rng){
 const g=group(parent),rock=zone.biome==='Desert'?'#986f50':'#687e82';
 if(type==='tree'){
  const h=2.4+rng()*1.65;
  part(g,'cylinder','#57453a',[.3,h,.3],[0,h/2,0],[.03,0,.07]);
  for(let i=0;i<3;i++)part(g,'cone',new T.Color(zone.color).multiplyScalar(.49+i*.12).getHex(),[2.35-i*.55,1.65,2.35-i*.55],[0,h*.51+i*.66,0],[0,i*.7,0]);
 }else if(type==='rock'){
  for(let i=0;i<3;i++)part(g,'ico',i===1?'#829094':rock,[1.15+i*.25,.83+i*.24,1.07],[i*.5-.46,.46+i*.13,i*.25-.23],[.2,i,.31]);
 }else if(type==='car'){
  box(g,'#444651',0,.48,0,1.36,.52,2.53);box(g,'#779a9d',0,.96,-.22,1.20,.53,1.22,{metal:true});
  box(g,'#343947',0,1.26,-.23,1.24,.11,1.27);box(g,'#815852',0,.74,.91,1.38,.17,.71);
  for(const x of [-.72,.72])for(const z of [-.77,.76])part(g,'cylinder','#2c2d32',[.56,.21,.56],[x,.25,z],[0,0,Math.PI/2]);
  for(const x of [-.44,.44])box(g,'#d8b783',x,.49,1.28,.23,.13,.045,{glow:true});
 }else if(type==='appliance'){
  box(g,'#6e797b',0,.73,0,.85,1.46,.69,{metal:true});
  box(g,'#546263',0,1.08,.36,.74,.57,.06);box(g,'#98a7a6',.27,.87,.41,.07,.6,.07,{metal:true});
 }else{
  box(g,'#604c43',0,.34,0,1,.69,.64);
  box(g,'#987858',0,.7,0,1.02,.11,.65);
  for(const x of [-.39,.39])box(g,'#627276',x,.41,0,.09,.82,.68,{metal:true});
  lamp(g,'#fbc66a',0,.57,.34,.12);
 }
 g.rotation.y=rng()*Math.PI*2;return g;
}
function targetModel(parent,type){
 const g=group(parent);
 part(g,'hex','#3e555c',[2.75,.24,2.75],[0,.12,0],null,{metal:true});
 ring(g,'#73e9ea',0,.27,0,2.6,{glow:true});
 if(type==='lightning'){
  const van=propModel(g,'car',{},D.random(1));van.rotation.y=0;van.position.y=.8;
  for(const x of [-.82,.82]){
   part(g,'cylinder','#a97d53',[.4,1.5,.4],[x,.93,0],[Math.PI/2,0,0],{metal:true});
   lamp(g,'#f6a976',x,.98,-.82,.34);
  }
 }else if(type==='repair'||type==='evacuate'){
  box(g,'#536677',0,1.0,0,2.2,1.44,1.78,{metal:true});
  box(g,'#394959',0,1.7,0,2.38,.2,1.92);
  box(g,'#d7bc7e',0,1.17,.91,.81,.63,.08);
  box(g,'#71efdd',0,1.17,.96,.55,.1,.06,{glow:true});
 }else if(type==='data'){
  box(g,'#485561',0,.65,0,1.15,.92,1.15,{metal:true});
  box(g,'#78e6ec',0,.79,.59,.61,.3,.04,{glow:true});
  tube(g,V(.32,1.1,0),V(.32,1.77,0),.05,'#99aeb0');
 }else{
  for(const x of [-1,1])for(const z of [-1,1]){
   tube(g,V(x,.25,z),V(x*.39,2.18,z*.39),.14,'#7b8992');
   box(g,'#ba9a66',x,.25,z,.39,.22,.39,{metal:true});
  }
  part(g,'octa','#91f8ee',[1.06,1.89,1.06],[0,1.19,0],[0,.41,0],{glow:true});
  ring(g,'#93deda',0,1.36,0,1.83,{glow:true});
  part(g,'cylinder','#50767f',[.73,.26,.73],[0,2.22,0],null,{metal:true});
 }
 return g;
}
function resize(){
 if(!renderer)return;
 const map=scene?.userData.missionMap;
 const layer=map&&renderer.domElement.parentElement,surface=layer&&root.querySelector('.sf-mission-map');
 if(surface){
  const screen=layer.parentElement,layout=surface.closest('.sf-play');
  const bottom=layout.offsetTop+layout.offsetHeight+parseFloat(getComputedStyle(screen).paddingBottom);
  layer.style.height=clamp(bottom,screen.clientHeight,screen.clientHeight*1.75)+'px';
 }
 const width=Math.max(1,layer?.clientWidth||innerWidth),height=Math.max(1,layer?.clientHeight||innerHeight);
 renderer.setSize(width,height,false);
 if(map&&surface?.clientWidth&&surface.clientHeight){
  const canvasRect=layer.getBoundingClientRect(),pinsRect=surface.getBoundingClientRect();
  const offsetX=pinsRect.left-canvasRect.left,offsetY=pinsRect.top-canvasRect.top;
  const centerX=offsetX+pinsRect.width*.5,centerY=offsetY+pinsRect.height*.5;
  const scale=Math.max(16.1/pinsRect.height,24.4/pinsRect.width);
  camera.left=-centerX*scale;camera.right=(width-centerX)*scale;
  camera.top=centerY*scale;camera.bottom=(centerY-height)*scale;
  camera.updateProjectionMatrix();
  positionMissionMarkers(surface,offsetX,offsetY,width,height);map.dirty=true;
 }else if(scene?.userData.regionGlobe){
  const aspect=width/height,halfHeight=Math.max(3.78,2.82/aspect);
  const centerX=aspect>1.25?-.53:0;
  const centerY=aspect<.77?.10:.22;
  camera.left=centerX-halfHeight*aspect;camera.right=centerX+halfHeight*aspect;
  camera.top=centerY+halfHeight;camera.bottom=centerY-halfHeight;
  camera.updateProjectionMatrix();positionRegionPins();scene.userData.redraw=true;
 }else if(camera){
  camera.aspect=width/height;
  camera.zoom=scene?.userData.stations?Math.min(1,camera.aspect/1.44):1;
  camera.updateProjectionMatrix();
 }
 if(scene?.userData.stations){
  scene.userData.redraw=true;scene.userData.positionMarkers=true;
 }
}
function setScene(next,view){
 const sharedGeometry=new Set(geometries.values()),sharedMaterial=new Set(materials.values());
 scene?.traverse(obj=>{
  if(obj.userData.sfBorrowed)return;
  if(obj.isInstancedMesh)obj.dispose();
  if(obj.geometry&&!sharedGeometry.has(obj.geometry))obj.geometry.dispose();
  if(obj.material&&!sharedMaterial.has(obj.material))obj.material.dispose();
 });
 scene=next;camera=view;resize();
}
function terrainHeight(x,z){
 const edge=Math.hypot(x,z)/10;
 return Math.max(-.4,.3+Math.sin(x*.64)*Math.cos(z*.45)*.54+Math.sin(z*.67-x*.3)*.33-edge*.43);
}
function topographicIsland(parent,zone,rng){
 const positions=[],tints=[],corner=(sector,radius)=>{
  const a=sector/24*Math.PI*2;
  const rim=1+(Math.sin(a*5)*.09+Math.cos(a*7)*.06)*Math.min(1,radius/8);
  const x=Math.cos(a)*radius*rim,z=Math.sin(a)*radius*rim;
  return [x,terrainHeight(x,z),z];
 };
 const grass=pigment(zone.color).lerp(pigment(zone.ground),.36),rock=pigment('#404a53');
 const triangle=(a,b,c,color)=>{
  positions.push(...a,...b,...c);for(let i=0;i<3;i++)tints.push(color.r,color.g,color.b);
 };
 for(let i=0;i<24;i++){
  const peak=corner(i,9.7),next=corner(i+1,9.7);
  const lower=[peak[0]*.82,-2.05,peak[2]*.82],lowerNext=[next[0]*.82,-2.05,next[2]*.82];
  triangle(peak,lowerNext,lower,rock.clone().multiplyScalar(.95+rng()*.48));
  triangle(peak,next,lowerNext,rock.clone().multiplyScalar(.68+rng()*.27));
  for(const [ra,rb] of [[0,2.4],[2.4,4.9],[4.9,7.2],[7.2,9.7]]){
   const [a,b,c,d]=[corner(i,ra),corner(i+1,ra),corner(i,rb),corner(i+1,rb)];
   const tint=grass.clone().multiplyScalar(.73+rng()*.48);
   triangle(a,c,d,tint);if(ra)triangle(a,d,b,tint.clone().multiplyScalar(.92+rng()*.14));
  }
 }
 const mesh=new T.BufferGeometry();
 mesh.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 mesh.setAttribute('color',new T.Float32BufferAttribute(tints,3));mesh.computeVertexNormals();
 const stone=new T.MeshStandardMaterial({vertexColors:true,flatShading:true,side:T.DoubleSide});
 parent.add(new T.Mesh(mesh,stone));
}
function renderHubScene(){
 const zone=catalog.zones[selectedZone],rng=D.random(18),s=worldScene(zone);
 s.background=pigment('#131b20');s.fog=new T.FogExp2(pigment('#1f292e'),.009);
 const island=group(s,-.65,-1.2,0);
 topographicIsland(island,zone,rng);
 for(let i=0;i<40;i++){
  const a=rng()*6.28,r=2.6+rng()*6.6,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.abs(x+z*.42)<1.25||Math.hypot(x-4.95,z+3)<2)continue;
  const style=zone.biome==='Desert'?'rock':i%4?'tree':'rock';
  const p=propModel(island,style,zone,rng);p.scale.setScalar(.37+rng()*.33);
  p.position.set(x,terrainHeight(x,z)-.08,z);
 }
 const road=group(island);
 for(let z=-8;z<8;z+=.52){
  const x=z*-.43,at=terrainHeight(x,z);
  box(road,'#8b805a',x,at+.10,z,.98,.095,.57);
  if(Math.round(z*2)%4===0)lamp(road,'#d2c37b',x+.48,at+.24,z,.09);
 }
 for(let i=0;i<18;i++){
  const a=i/18*Math.PI*2,left=i>=5&&i<=11;
  const radius=left?8.9:10.05;
  part(island,'ico',i%3?'#533a72':'#784b83',[3.5+rng()*2,1.7+rng(),2.2+rng()],
   [Math.sin(a)*radius,.78+Math.cos(a)*.5,Math.cos(a)*radius],[0,a,rng()],{alpha:.46});
 }
 const center=targetModel(island,'atlas');center.position.set(.65,terrainHeight(.65,-.7),-.7);center.scale.setScalar(.86);
 for(const [x,z] of [[-1.7,-.4],[1.2,1.27],[-.1,-2.8]]){
  box(island,'#5a6e69',x,terrainHeight(x,z)+.17,z,1.14,.42,.84,{metal:true});
  box(island,'#394f55',x,terrainHeight(x,z)+.42,z,1.25,.12,.92);
  lamp(island,'#efa35e',x,terrainHeight(x,z)+.53,z,.09);
 }
 const mast=group(island,4.95,terrainHeight(4.95,-3),-3);
 for(const dx of [-.56,.56])for(const dz of [-.56,.56])tube(mast,V(dx,0,dz),V(dx*.18,2.82,dz*.18),.12,'#697376');
 for(let i=0;i<4;i++)tube(mast,V(-.4,i*.55,.05),V(.4,i*.55+.45,.05),.065,'#6a7c7d');
 part(mast,'sphere','#a18a68',[.93,.18,.93],[0,2.86,0],[.31,0,.4],{metal:true});
 lamp(mast,'#cbe86c',0,3.1,.04,.14);
 const vera=robot(s);vera.position.set(6.4,4.2,1.8);
 const view=new T.PerspectiveCamera(37,1,.05,130);view.position.set(10.3,13.6,20.5);view.lookAt(1.55,.32,-.1);
 setScene(s,view);s.userData={island,vera,key:'map:'+selectedZone};
}

const stationList=[
 {id:'keeping',x:-1,z:-9.7,title:'Command keep',detail:'Configure your hero and support team',tab:'Command',sub:'Heroes',color:'#c3a9ec'},
 {id:'lab',x:-11.5,z:-4.4,title:'Research lab',detail:'Invest your available research points',tab:'Command',sub:'Research Lab',color:'#83dcf4'},
 {id:'yard',x:-9.4,z:5.5,title:'Construction yard',detail:'Upgrade gadgets and tools',tab:'Command',sub:'Upgrades',color:'#f3c380'},
 {id:'medical',x:-.9,z:8.5,title:'Medical station',detail:'Assign lead and support survivors',tab:'Command',sub:'Survivor Squads',color:'#ffac9a'},
 {id:'depot',x:6.1,z:3.8,title:'Supply depot',detail:'Manage equipment and field supplies',tab:'Armory',sub:'Backpack',color:'#91debd'},
 {id:'relay',x:11.7,z:-6.3,title:'Field radar',detail:'Deploy to a campaign region',tab:'Play',sub:'',color:'#81e8da'},
 {id:'range',x:10.9,z:12.3,title:'Defense academy',detail:'Manage your defenders',tab:'Command',sub:'Defenders',color:'#a9cafa'}
];
const baseAnnexes=[
 {id:'generator',x:-17.6,z:2.5,color:'#677dd0'},
 {id:'dispatch',x:3.8,z:-5.7,color:'#dfa572'},
 {id:'workshop',x:17.1,z:5.9,color:'#cd876f'},
 {id:'outpost',x:-17.2,z:-10.4,color:'#a56b65'},
 {id:'observatory',x:16.5,z:-1.6,color:'#7bb6b3'}
];
const baseSites=[...stationList,...baseAnnexes];
function homebaseHeight(x,z){
 const hills=.46*Math.sin(x*.34+z*.15)*Math.cos(z*.37)+.32*Math.sin(x*.61-z*.34);
 const bluff=2.6*Math.exp(-((x+1)**2/105+(z+11)**2/26));
 const ridge=3*Math.max(0,(Math.abs(x+1)-18)/8)+6.7*Math.max(0,(-z-13)/10);
 const site=baseSites.find(site=>Math.hypot(site.x-x,site.z-z)<2.5);
 if(site){
  const flat=2.6*Math.exp(-((site.x+1)**2/105+(site.z+11)**2/26));
  return T.MathUtils.lerp(flat,hills+bluff+ridge,T.MathUtils.smoothstep(Math.hypot(site.x-x,site.z-z),1.6,2.5));
 }
 return hills+bluff+ridge;
}
function homebasePlaza(parent,x,z,w,d,angle=0){
 const g=group(parent,x,homebaseHeight(x,z),z);g.rotation.y=angle;
 box(g,'#232d48',0,.03,0,w+.20,.26,d+.20);
 box(g,'#52647a',0,.16,0,w,.10,d);
 return g;
}
function homebaseBuilding(parent,x,z,w,h,d,wall,roof){
 const g=group(parent,x,0,z);
 box(g,'#303748',0,.24,0,w+.12,.20,d+.12);
 box(g,wall,0,.33+h/2,0,w,h,d);
 box(g,'#a8b2bd',0,h+.29,0,w+.14,.12,d+.14);
 box(g,roof,0,h+.47,0,w+.25,.23,d+.25);
 for(const side of [-1,1]){
  box(g,'#a3b6ca',side*w*.406,h+.59,.02,.09,.083,d*.93);
  box(g,'#717e8b',side*w*.485,.58,-d*.23,.16,.6,.18);
 }
 box(g,'#526880',w*.22,h+.67,-d*.30,.47,.22,.44);
 box(g,'#92a9b7',w*.22,h+.80,-d*.30,.52,.06,.49);
 for(let vent=-.15;vent<=.15;vent+=.1)box(g,'#384d64',w*.22+vent,h+.835,-d*.30,.039,.019,.36);
 box(g,'#748994',0,.93,d/2+.14,.58,.08,.26);
 box(g,'#f9c587',0,.887,d/2+.18,.35,.033,.025,{glow:true});
 box(g,'#1b253d',0,.62,d/2+.019,.47,.73,.046);
 for(let floor=.92;floor<h+.12;floor+=.66){
  for(let wx=-w*.34;wx<=w*.35;wx+=.54){
   box(g,'#33384b',wx,floor,d/2+.018,.32,.34,.046);
   box(g,'#ffdeb0',wx,floor,d/2+.043,.21,.24,.02,{glow:true});
  }
  for(let wz=-d*.30;wz<=d*.36;wz+=.56){
   box(g,'#edd3a1',-w/2-.025,floor,wz,.032,.24,.22,{glow:true});
   box(g,'#efd49c',w/2+.025,floor,wz,.032,.24,.22,{glow:true});
  }
 }
 for(const corner of [-1,1])box(g,'#acac9f',corner*(w*.5-.13),.55,d*.51,.12,.60,.13);
 return g;
}
function homebaseDish(parent,x,y,z,size,angle){
 const g=group(parent,x,y,z);g.rotation.y=angle;
 part(g,'cylinder','#7d879c',[size*.38,.65,size*.38],[0,.28,0]);
 const bowl=group(g,0,.66,0);bowl.rotation.x=.52;
 part(bowl,'sphere','#99b5d2',[size,.31*size,size],[0,0,0],null,{metal:true});
 ring(bowl,'#aec5d7',0,.02,0,size);
 tube(bowl,V(0,.04,0),V(0,.38*size,0),.09,'#6989ae');
 lamp(bowl,'#ffc583',0,.42*size,0,.14);
 return g;
}
function homebaseTower(parent,x,z,w,h,wall,roof){
 const g=group(parent,x,0,z);
 part(g,'hex',wall,[w,h,w],[0,h/2+.15,0]);
 part(g,'hex','#aeb0a7',[w*1.11,.23,w*1.11],[0,h+.18,0]);
 part(g,'hex',roof,[w*1.06,.42,w*1.06],[0,h+.47,0]);
 for(let y=.76;y<h;y+=.73){
  for(const a of [0,Math.PI/3,-Math.PI/3]){
   const window=group(g,Math.sin(a)*w*.435,y,Math.cos(a)*w*.435);
   window.rotation.y=a;box(window,'#ffe2a6',0,0,0,.17,.26,.04,{glow:true});
  }
 }
 return g;
}
function buildHomebaseSite(parent,site){
 const command=site.id==='keeping',g=homebasePlaza(parent,site.x,site.z,command?6.5:4.1,command?4.1:3.3,(site.x%5)*.083);
 const roof='#536e9b';
 let markerHeight=2;
 switch(site.id){
  case 'keeping':{
   homebaseBuilding(g,.15,-.36,3.20,2.54,2.47,'#9f9b80','#677eac');
   const tower=homebaseTower(g,1.68,-.49,1.82,4.30,'#929982',roof);
   homebaseDish(tower,0,4.98,0,1.70,-.50);
   homebaseTower(g,-1.38,-.66,1.39,3.28,'#9b8e72','#6d7fab');
   const archive=homebaseBuilding(g,-2.20,.42,1.42,2.13,1.59,'#9c5350','#4b70a0');
   part(archive,'cone','#526e99',[1.17,.83,1.17],[0,3.05,0],[0,Math.PI/4,0]);
   tube(archive,V(0,3.32,0),V(0,4.58,0),.056,'#cbd6de');
   box(archive,'#7763ad',-.40,4.30,0,.80,.49,.038);
   box(archive,'#d0d9f9',-.35,4.30,.026,.31,.06,.017);
   const vestibule=homebaseBuilding(g,-1.27,.64,.92,1.32,1.15,'#567a76','#527a9d');
   box(vestibule,'#81dfdb',0,1.14,.622,.40,.15,.03,{glow:true});
   box(g,'#405779',0,.34,1.63,2.35,.30,.43);
   box(g,'#627d94',0,.25,1.92,2.64,.16,.30);
   markerHeight=4.6;
   break;
  }
  case 'medical':{
   homebaseBuilding(g,-.47,.17,1.86,1.38,2.15,'#a65359','#d3dce1');
   const annex=homebaseTower(g,1.11,-.55,1.55,1.34,'#e4c9c0','#899ebb');
   ring(annex,'#85c5ed',0,2.03,0,1.17,{glow:true});
   box(g,'#ac454f',-.47,1.99,.18,.93,.04,.93);
   box(g,'#fff0df',-.47,2.025,.18,.73,.03,.22,{glow:true});
   box(g,'#fff0df',-.47,2.025,.18,.22,.03,.73,{glow:true});
   break;
  }
  case 'yard':{
   homebaseBuilding(g,-.40,.09,2.31,1.27,2.04,'#a88751','#607693');
   for(const x of [-1.52,.75])for(const z of [-.95,1.13])box(g,'#ddae64',x,1.20,z,.13,2.10,.13);
   for(const z of [-.95,1.13]){
    tube(g,V(-1.52,.35,z),V(.75,2.23,z),.092,'#c9a159');
    tube(g,V(-1.52,2.23,z),V(.75,.35,z),.092,'#c9a159');
    tube(g,V(-1.52,2.23,z),V(.75,2.23,z),.13,'#d8b46a');
   }
   tube(g,V(1.16,.21,-.76),V(1.16,3.29,-.76),.16,'#d5ab64');
   tube(g,V(-1.38,3.23,-.76),V(1.66,3.23,-.76),.12,'#d5ab64');
   tube(g,V(-.80,3.23,-.76),V(-.80,2.50,-.76),.034,'#d4c3a2');
   box(g,'#aa7359',-.80,2.46,-.76,.23,.17,.22);
   markerHeight=2.8;
   break;
  }
  case 'lab':
   homebaseBuilding(g,.45,-.13,2.18,1.33,2.52,'#607d9b',roof);
   for(const x of [-1.36,-.83,.88]){
    const y=x>0?2.02:.72;
    part(g,'cylinder','#5d89aa',[.47,1,.47],[x,y,-.45],null,{metal:true});
    ring(g,'#72d8ed',x,y+.51,-.45,.47,{glow:true});
   }
   box(g,'#80d3ee',.11,1.99,.59,.70,.046,1.02,{glow:true});
   markerHeight=2.5;
   break;
  case 'relay':
   homebaseBuilding(g,.50,.15,2.40,1.3,2.12,'#a06c52','#566b8e');
   homebaseTower(g,-1.02,-.39,1.14,2.61,'#6b7e9a','#536c9d');
   homebaseDish(g,-1.02,3.31,-.39,1.27,.8);
   lamp(g,'#f58672',.85,1.93,.35,.15);
   markerHeight=3.1;
   break;
  case 'depot':
   homebaseBuilding(g,.12,-.12,2.69,1.30,2.56,'#634a57','#567aab');
   for(const x of [-.64,.01,.66])box(g,'#b2d6ed',x,1.91,.26,.38,.038,1.02);
   for(const z of [.25,.95])box(g,'#35506f',-1.49,.47,z,.47,.54,.52);
   break;
  case 'range':
   box(g,'#43879f',-.38,.27,-.09,2.55,.15,2.64);
   for(const x of [-1.57,-.38,.81])box(g,'#c0eddf',x,.36,-.09,.024,.016,2.64,{glow:true});
   for(const z of [-1.40,-.09,1.23])box(g,'#c0eddf',-.38,.36,z,2.4,.016,.026,{glow:true});
   homebaseBuilding(g,1.31,-.19,1.05,.69,2.62,'#687f9d','#6a89b6');
   for(const z of [-1.16,1.16])for(const x of [-1.68,.93])lamp(g,'#aeeaff',x,.74,z,.095);
   markerHeight=1.23;
   break;
  case 'generator':
   homebaseTower(g,0,0,2.74,1.20,'#536c93','#657db8');
   part(g,'sphere','#7f9bcc',[2.15,.68,2.15],[0,1.86,0]);
   ring(g,'#88c9ee',0,1.90,0,1.84,{glow:true});
   for(let a=0;a<6;a++){
    const p=group(g,0,0,0);p.rotation.y=a*Math.PI/3;
    box(p,'#93a8c2',0,.80,1.13,.21,1.23,.20);
    lamp(p,'#e1baff',0,1.49,1.12,.12);
   }
   break;
  default:
   homebaseBuilding(g,0,0,2.18,site.id==='outpost'?.76:1.18,2.25,site.color,roof);
   if(site.id==='observatory')homebaseDish(g,.13,1.84,-.19,1.2,1.5);
   else{
    box(g,'#6d8fac',0,1.52,-.94,1.34,.18,.58);
    box(g,'#a7cbec',0,1.57,-.94,1.20,.06,.43);
    box(g,'#bf775c',.84,.50,1.20,.57,.48,.49);
   }
   break;
 }
 const point=group(g,0,markerHeight,0),outline=ring(g,'#a4f2e0',0,.29,0,command?6.1:3.8,{glow:true});
 return {point,outline};
}
function homebasePaths(parent){
 const links=[
  {main:true,knots:[[-3,-9],[-4.6,-6.6],[-4.1,-3.3],[-1,-1.7],[2.5,-2.8],[3.8,-5.7],[1.6,-8.8],[-3,-9]]},
  {knots:[[-4.3,-5.3],[-7.7,-3.7],[-11.5,-4.4],[-14.1,-6.7],[-17.2,-10.4]]},
  {knots:[[-3.1,-2.5],[-6.5,.6],[-8.1,3.6],[-9.4,5.5],[-14,6.8],[-17.6,2.5]]},
  {knots:[[-.6,-1.7],[-1.1,1.4],[.1,5.5],[-.9,8.5],[-.3,10.8],[2.1,14.8],[2.7,20]]},
  {knots:[[2.5,-2.8],[4.2,.8],[6.1,3.8],[7.1,8.6],[10.9,12.3]]},
  {knots:[[3.8,-5.7],[6.3,-4.5],[9.6,-4.6],[11.7,-6.3],[13.5,-4.8],[16.5,-1.6]]},
  {knots:[[6.1,3.8],[9.1,1.4],[12.3,1.8],[15.3,4.5],[17.1,5.9]]}
 ];
 const curves=[];
 for(const {knots,main} of links){
  const curve=new T.CatmullRomCurve3(knots.map(([x,z])=>V(x,0,z)));curves.push(curve);
  const samples=Math.ceil(curve.getLength()*3),positions=[],indices=[];
  for(let i=0;i<=samples;i++){
   const point=curve.getPointAt(i/samples),dir=curve.getTangentAt(i/samples),width=main?.58:.38;
   for(const side of [-1,1]){
    const x=point.x-dir.z*width*side,z=point.z+dir.x*width*side;
    positions.push(x,homebaseHeight(x,z)+.085,z);
   }
   if(i<samples){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3)}
   if(i%(main?10:21)===3){
    const x=point.x+dir.z*(width+.14),z=point.z-dir.x*(width+.14),y=homebaseHeight(x,z);
    box(parent,'#384b63',x,y+.23,z,.058,.47,.058);
    lamp(parent,main?'#ffe1ad':'#91cffa',x,y+.49,z,.12);
   }
  }
  const road=new T.BufferGeometry();
  road.setAttribute('position',new T.Float32BufferAttribute(positions,3));road.setIndex(indices);road.computeVertexNormals();
  const surface=new T.MeshStandardMaterial({color:pigment(main?'#74849c':'#395b93'),side:T.DoubleSide,roughness:.96});
  parent.add(new T.Mesh(road,surface));
 }
 return curves;
}
function homebaseTerrain(parent,rng){
 const terrain=new T.PlaneGeometry(100,116,100,116);terrain.rotateX(-Math.PI/2);
 const position=terrain.attributes.position,tints=[];
 const grass=pigment('#263f36'),fern=pigment('#485437'),stone=pigment('#35466e'),lit=pigment('#8e8363');
 const plazaLights=[[-2.42,-7.4],[3.82,-5.04],[-8.68,5.96],[-.72,9.28],[6.5,4.81],[11.84,-5.76]];
 for(let i=0;i<position.count;i++){
  const x=position.getX(i),z=position.getZ(i)-6,y=homebaseHeight(x,z);
  position.setXYZ(i,x,y,z);
  const tint=grass.clone().lerp(fern,.23+.20*Math.sin(z*.69+x*.55)+.14*Math.cos(x*.91-z*.35));
  tint.lerp(stone,T.MathUtils.smoothstep(y,1.9,4.5)*.88).multiplyScalar(.81+rng()*.28);
  for(const [lx,lz] of plazaLights){
   const distance=(lx-x)**2+(lz-z)**2;
   tint.lerp(lit,.40*Math.exp(-distance/1.9));
  }
  tints.push(tint.r,tint.g,tint.b);
 }
 terrain.setAttribute('color',new T.Float32BufferAttribute(tints,3));terrain.computeVertexNormals();
 parent.add(new T.Mesh(terrain,new T.MeshStandardMaterial({vertexColors:true,flatShading:true})));
}
function batchHubScenery(parent){
 parent.updateMatrixWorld(true);
 const batches=new Map(),shared=new Set(materials.values());
 parent.traverse(mesh=>{
  if(!mesh.isMesh||!shared.has(mesh.material)||!mesh.visible)return;
  if(mesh.material.transparent)return;
  const key=mesh.geometry.id+':'+mesh.material.id;
  if(!batches.has(key))batches.set(key,[]);
  batches.get(key).push(mesh);
 });
 for(const meshes of batches.values()){
  if(meshes.length<3)continue;
  const first=meshes[0],batch=new T.InstancedMesh(first.geometry,first.material,meshes.length);
  meshes.forEach((mesh,i)=>{batch.setMatrixAt(i,mesh.matrixWorld);mesh.parent.remove(mesh)});
  batch.frustumCulled=false;parent.add(batch);
 }
}
function renderHomebaseScene(){
 const s=new T.Scene(),rng=D.random(127),campus=group(s);
 s.background=pigment('#233c6d');s.fog=new T.FogExp2(pigment('#283d70'),.019);
 s.add(new T.HemisphereLight('#648be7','#3b4087',.79));
 const moon=new T.DirectionalLight('#759aff',1.48);moon.position.set(-14,18,-9);s.add(moon);
 const fill=new T.DirectionalLight('#ffd5a8',.39);fill.position.set(1,11,12);s.add(fill);
 for(const [x,z,strength] of [[-1.5,-8,1.9],[3.5,-5.3,1.5],[-9.4,6.2,1.1],[-.5,9,1.2],[12.1,-5.7,1.4]]){
  const light=new T.PointLight('#ffcf8d',strength,4,2);
  light.position.set(x,homebaseHeight(x,z)+1.10,z);s.add(light);
 }
 homebaseTerrain(campus,rng);
 const paths=homebasePaths(campus).flatMap(curve=>curve.getSpacedPoints(36));
 for(let i=0;i<330;i++){
  const x=(rng()-.5)*62,z=rng()*51-27;
  if(baseSites.some(site=>Math.abs(site.x-x)<3&&Math.abs(site.z-z)<2.8)||paths.some(p=>Math.hypot(p.x-x,p.z-z)<1.03))continue;
  const outer=Math.abs(x)>14||z< -11||z>13;
  if(!outer&&rng()>.44)continue;
  const g=group(campus,x,homebaseHeight(x,z),z);
  if(i%4===0||outer&&i%3===0){
   const w=outer?1.1+rng()*2.9:.48+rng()*.73;
   const stratum=['#344267','#41567d','#4e6592'][i%3];
   part(g,'ico',stratum,[w,w*.59,w*.80],[0,w*.10,0],[rng(),rng()*3,.26]);
   part(g,'ico',stratum,[w*.69,w*.37,w*.58],[-w*.36,w*.055,w*.24],[.40,i,.14]);
  }else{
   const h=1.4+rng()*(outer?3:1.03);
   box(g,'#4a4858',0,h*.26,0,.16,h*.51,.16);
   for(let tier=0;tier<3;tier++){
    const w=h*(.72-tier*.175),lean=.045*Math.sin(i);
    part(g,'cone',['#163b38','#214b45','#315956'][tier],[w,h*.56,w*.87],[lean*h*tier,h*(.43+tier*.18),0],[lean,i,lean]);
   }
  }
 }
 const stations=new Map();
 for(const site of baseSites){
  const marker=buildHomebaseSite(campus,site);
  marker.outline.visible=false;
  if(stationList.includes(site))stations.set(site.id,marker);
  else marker.outline.parent.remove(marker.outline);
 }
 batchHubScenery(campus);
 const view=new T.PerspectiveCamera(45,1,.1,140);
 view.position.set(2.7,26,29.5);view.lookAt(0,.6,0);
 s.userData={key:'base',stations};setScene(s,view);
}
function updateBaseMarkers(){
 const base=scene.userData;
 if(base.positionMarkers)camera.updateMatrixWorld();
 for(const button of root.querySelectorAll('[data-station]')){
  const {point,outline}=base.stations.get(button.dataset.station);
  if(base.positionMarkers){
   const projected=point.getWorldPosition(V()).project(camera);
   button.style.left=(projected.x*.5+.5)*100+'%';
   button.style.top=(-projected.y*.5+.5)*100+'%';
  }
  const highlighted=button.matches(':hover,:focus-visible');
  if(outline.visible!==highlighted){outline.visible=highlighted;base.redraw=true}
 }
 base.positionMarkers=false;
}

const missionTileRows=[
 [[0,-7.8],[-5.1,-6.7],[5.1,-6.7],[-9.2,-5.8],[9.2,-5.8]],
 [[-7,-1.6],[-2.4,-2],[2.3,-1.7],[7,-1.6]],
 [[-9,3],[-4.6,2.8],[0,3.15],[4.6,2.8],[9,3]],
 [[-5.9,7.45],[-.15,7.6],[5.65,7.45]]
];
const missionTileGround={
 Forest:['#587832','#293d23'],Suburbs:['#75864a','#50623a'],City:['#66716c','#3e4f42'],
 'Industrial Park':['#626762','#3f4852'],Desert:['#ad784a','#764e34'],
 'Ghost Town':['#a98c5e','#6c583d'],Tropical:['#518353','#2c6258']
};
function missionTileSites(zone,options){
 const tiles=missionTileRows.flat(),shield=options.find(item=>item.id==='shield');
 const items=shield?[shield,...options.filter(item=>item!==shield)]:options;
 return items.slice(0,tiles.length).map((item,i)=>{
  const [x,z]=tiles[i];
  return {id:item.id,x,z,biome:item.id==='shield'?zone.biome:missionBiome(zone,item)};
 });
}
function missionTileHeight(x,z){
 const motif=.27*Math.sin(x*.56+z*.23)+.25*Math.cos(z*.47-x*.18)+.11*Math.sin(x*1.65+z*.93);
 const rim=Math.max(0,Math.hypot(x/12.8,z/10.7)-.88);
 const outer=T.MathUtils.smoothstep(rim,.07,.75);
 const hills=.78*Math.sin(x*.335-z*.112)+1.12*Math.cos(z*.39+x*.31)+.45*Math.sin(x*.82-z*.93);
 return motif-3.1*Math.min(1,rim)**1.15+hills*outer;
}
function missionTileRoad(parent,points,width,color,y){
 const curve=new T.CatmullRomCurve3(points.map(([x,z])=>V(x,0,z))),pos=[],indices=[];
 const steps=Math.max(7,Math.round(curve.getLength()*7));
 for(let i=0;i<=steps;i++){
  const p=curve.getPoint(i/steps),d=curve.getTangent(i/steps);
  for(const side of [-1,1])pos.push(p.x+d.z*width*side,y,p.z-d.x*width*side);
  if(i<steps){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
 }
 const road=new T.BufferGeometry();
 road.setAttribute('position',new T.Float32BufferAttribute(pos,3));road.setIndex(indices);road.computeVertexNormals();
 parent.add(new T.Mesh(road,new T.MeshStandardMaterial({color:pigment(color),side:T.DoubleSide})));
}
function missionMapHouse(parent,x,z,angle,w,h,d,color,roof,gabled=false){
 const g=group(parent,x,0,z);g.rotation.y=angle;
 box(g,color,0,h/2,0,w,h,d);
 if(gabled){
  for(const side of [-1,1]){
   part(g,'box',roof,[w*.61,.065,d+.12],[w*.24*side,h+w*.11,0],[0,0,-side*.48]);
  }
 }else{
  box(g,roof,0,h,.0,w+.11,.11,d+.11);
  box(g,'#89939a',w*.19,h+.075,-d*.18,w*.25,.1,d*.29);
 }
 for(let y=.17;y<h-.05;y+=.25){
  for(const side of [-1,1])box(g,'#b6c0b5',side*w*.24,y,d*.503,.12,.095,.019);
 }
}
function missionMapTree(parent,x,z,size,tropical=false){
 box(parent,'#5e5037',x,size*.25,z,.072,size*.56,.073);
 if(tropical){
  for(let i=0;i<5;i++){
   const a=i*Math.PI*.4;
   part(parent,'sphere','#679357',[size*.60,.12,size*.23],[x+Math.cos(a)*size*.2,size,z+Math.sin(a)*size*.2],[0,-a,.16]);
  }
 }else{
  part(parent,'cone','#426b35',[size*.68,size*.74,size*.65],[x,size*.58,z],[.04,x,0]);
  part(parent,'cone','#6f943f',[size*.54,size*.62,size*.52],[x+.035,size*.83,z],[0,z,.055]);
 }
}
function dressMissionTile(parent,site,rng){
 const palettes=missionTileGround[site.biome]||missionTileGround.Forest;
 const g=group(parent,site.x,missionTileHeight(site.x,site.z),site.z);
 const flat=group(g,0,.11,0);flat.rotation.y=(rng()-.5)*.74;
 if(site.id==='shield'){
  const slab=part(flat,'hex','#536572',[2.2,.17,2.2],[0,.08,0]);
  slab.rotation.y=Math.PI/6;
  const core=targetModel(flat,'atlas');core.scale.setScalar(.54);core.position.y=.16;
  for(const x of [-.94,.94])for(const z of [-.68,.68]){
   box(flat,'#697b94',x,.27,z,.32,.55,.38);
   lamp(flat,'#93ebff',x,.60,z,.13);
  }
  return g;
 }
 const localGround=part(flat,'hex',palettes[0],[3.72,.42,3.62],[0,-.30,0]);
 localGround.rotation.y=Math.PI/6;
 switch(site.biome){
  case 'City':
  case 'Industrial Park':{
   const city=site.biome==='City';
   box(flat,city?'#6f7671':'#6f6960',0,-.085,0,3.18,.19,2.85);
   for(const x of [-1.05,0,1.05]){
    box(flat,'#4e5357',x,.02,0,.15,.037,2.74);
    for(const z of [-1.0,-.47,.07,.61,1.15])box(flat,'#ac9c72',x,.047,z,.025,.009,.11);
   }
   box(flat,'#4e5357',0,.028,-.04,3.17,.036,.21);
   for(const x of [-.76,.78])for(const z of [-.83,.73]){
    if(city){
     missionMapHouse(flat,x-.21,z,0,.33,.7+rng()*.68,.42,'#878d8a','#687e88');
     missionMapHouse(flat,x+.25,z+.03,Math.PI/2,.39,.48+rng()*.76,.55,'#9d9d87','#647279');
    }else{
     missionMapHouse(flat,x,z,Math.PI/2,.88,.40+rng()*.13,.60,'#8d7772','#858a91');
     part(flat,'cylinder','#a8a29f',[.23,.45,.23],[x+.35,.231,z-.39]);
     box(flat,'#ae7a56',x-.45,.09,z+.39,.29,.16,.25);
    }
   }
   break;
  }
  case 'Suburbs':
  case 'Ghost Town':{
   const ghost=site.biome==='Ghost Town',street=ghost?'#a88b63':'#8e8b75';
   const loop=[[-1.5,-.34],[-.6,-.87],[.61,-.93],[1.27,-.56],[1.13,.37],[.29,.85],[-.86,.74],[-1.42,.34],[-1.5,-.34]];
   missionTileRoad(flat,loop,.15,street,.025);
   const houses=[[-1,-.99,.16],[.24,-1.18,.14],[1.1,-.78,.47],[-1.11,.86,-.16],[-.31,.97,-.18],[.65,.84,-.31],[.06,-.22,.28]];
   for(const [i,[x,z,a]] of houses.entries()){
    missionMapHouse(flat,x,z,a,.48,.27+rng()*.17,.52,ghost?'#9e7d58':['#bbad91','#bba493','#a6af94'][i%3],
     ghost?'#775745':['#8e5c56','#667a81','#876c53'][i%3],true);
   }
   for(let i=0;i<5;i++)missionMapTree(flat,(rng()-.5)*2.6,(rng()>.5?1:-1)*(.53+rng()*.46),ghost?.29:.38+rng()*.34);
   break;
  }
  case 'Desert':
   missionTileRoad(flat,[[-1.68,.8],[-.62,.4],[.28,.15],[.60,-.45],[1.53,-.9]],.14,'#d3a374',.02);
   for(const [i,[x,z]] of [[-1.08,-.62],[.94,.51],[.1,-1.07],[.17,.74],[-.57,.88]].entries()){
    const w=.38+rng()*.42,h=.22+rng()*.47;
    part(flat,'hex',i%2?'#a8724d':'#ae764c',[w,h,w*.82],[x,h*.37,z],[.02,i,.06]);
    part(flat,'hex','#c48b57',[w*.83,h*.22,w*.68],[x,h*.88,z],[0,i,0]);
   }
   break;
  default:{
   const tropical=site.biome==='Tropical';
   missionTileRoad(flat,[[-1.52,-.39],[-.66,-.06],[-.2,.63],[.65,.38],[1.43,-.15]],tropical?.21:.105,
    tropical?'#459a9c':'#9a986a',.025);
   for(let i=0;i<18;i++){
    const a=rng()*Math.PI*2,r=.45+rng()*1.23;
    const x=Math.cos(a)*r,z=Math.sin(a)*r*.78;
    if(Math.abs(z-(.44-.22*x*x))<.19)continue;
    missionMapTree(flat,x,z,.35+rng()*.60,tropical);
   }
   for(const [x,z] of [[-.94,.68],[.74,-.54]])part(flat,'ico','#7d8a72',[.5,.33,.50],[x,.086,z],[.3,z,0]);
  }
 }
 return g;
}
function missionMapDome(parent){
 const shell=new T.SphereGeometry(2.22,48,26,0,Math.PI*2,0,Math.PI/2);
 const material=new T.ShaderMaterial({
  side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  vertexShader:`
   varying vec3 surface;
   varying vec3 eye;
   varying vec3 place;
   void main(){
    vec4 p=modelViewMatrix*vec4(position,1.0);
    surface=normalize(normalMatrix*normal);
    eye=normalize(-p.xyz);
    place=position;
    gl_Position=projectionMatrix*p;
   }`,
  fragmentShader:`
   varying vec3 surface;
   varying vec3 eye;
   varying vec3 place;
   void main(){
    float edge=pow(1.0-abs(dot(normalize(surface),normalize(eye))),3.2);
    float lane=smoothstep(.90,1.0,cos(place.y*34.0));
    float lower=1.0-smoothstep(0.0,.18,place.y);
    gl_FragColor=vec4(.20,.78,1.0,.105+edge*.52+lane*.055+lower*.22);
   }`
 });
 const dome=new T.Mesh(shell,material);dome.position.y=.08;dome.renderOrder=2;
 parent.add(dome);
 ring(parent,'#71e5ff',0,.105,0,4.95,{glow:true});
}
function renderMissionScene(zone,key){
 const s=new T.Scene(),terrain=group(s),rng=D.random(zone.min*197+513);
 s.background=pigment('#614476');s.fog=new T.FogExp2(pigment('#5f4a7a'),.008);
 s.add(new T.HemisphereLight('#b9cdfb','#65567b',.93));
 const sun=new T.DirectionalLight('#ffedbd',1.46);sun.position.set(-12,19,9);s.add(sun);
 const fill=new T.DirectionalLight('#9b90ef',.45);fill.position.set(5,6,-11);s.add(fill);
 const sites=missionTileSites(zone,missionOptions());
 const land=new T.PlaneGeometry(86,86,154,154);land.rotateX(-Math.PI/2);
 const v=land.attributes.position,colors=[];
 const stone=pigment('#51445f'),storm=pigment('#554166');
 const terrainTints=sites.map(site=>[site,(missionTileGround[site.biome]||[zone.color,zone.ground]).map(pigment)]);
 const regionTints=(missionTileGround[zone.biome]||[zone.color,zone.ground]).map(pigment);
 for(let i=0;i<v.count;i++){
  const x=v.getX(i),z=v.getZ(i),y=missionTileHeight(x,z);
  v.setY(i,y);
  let closest=12.25,tints=regionTints;
  for(const [site,palette] of terrainTints){
   const distance=(x-site.x)**2+(z-site.z)**2;
   if(distance<closest){closest=distance;tints=palette}
  }
  const variation=.43+.16*Math.sin(x*.8+z)*Math.cos(z*1.3)+.14*Math.cos(x*.45-z*.37);
  const color=regionTints[0].clone().lerp(tints[0],1-T.MathUtils.smoothstep(closest,4,12.25));
  color.lerp(tints[1],variation);
  const edge=T.MathUtils.smoothstep(Math.hypot(x/14,z/11.6),.87,2.65);
  color.lerp(stone,T.MathUtils.smoothstep(-y,.28,2.75)*.57).lerp(storm,edge*.67).multiplyScalar(.84+rng()*.32);
  colors.push(color.r,color.g,color.b);
 }
 land.setAttribute('color',new T.Float32BufferAttribute(colors,3));land.computeVertexNormals();
 terrain.add(new T.Mesh(land,new T.MeshStandardMaterial({vertexColors:true,flatShading:true})));
 for(let i=0;i<630;i++){
  const near=i<275,x=(rng()-.5)*(near?27:81),z=(rng()-.5)*(near?22:70);
  if(sites.some(site=>Math.hypot(x-site.x,z-site.z)<1.95))continue;
  const y=missionTileHeight(x,z),size=.35+rng()*(near?.85:1.61),g=group(terrain,x,y,z);
  const slope=y<-.55&&z<3,rock=zone.biome==='Desert'||slope||i%5===0;
  if(rock){
   const color=y<-.55?(i%3?'#67577b':'#7c627f'):(i%3?'#64706d':'#72665f');
   part(g,'ico',color,[size*1.34,size*.88,size*.96],[0,size*.15,0],[i,.23,i*.31]);
   if(size>1)part(g,'ico',color,[size*.77,size*.51,size*.76],[size*.43,0,-size*.21],[.17,i,.20]);
  }else missionMapTree(g,0,0,size,zone.biome==='Tropical');
 }
 for(let i=0;i<37;i++){
  const a=i*Math.PI*2/37,r=1+rng()*.35;
  part(terrain,'ico',i%3?'#725588':'#8a6398',[4+rng()*4.3,1.1+rng(),2.9+rng()*2],
   [Math.cos(a)*25*r,-1.25+rng()*1.06,Math.sin(a)*22*r],[.19,a,rng()],{alpha:.17});
 }
 const markers=new Map();
 for(const site of sites){
  const tile=dressMissionTile(terrain,site,rng);
  const anchor=group(tile,0,site.id==='shield'?1.22:.78,0);
  if(site.id==='shield')missionMapDome(tile);
  markers.set(site.id,{anchor,tile});
 }
 batchHubScenery(terrain);
 const activeRing=group(s);
 const torus=part(activeRing,'torus','#aef477',[4.15,4.15,.72],[0,0,0],[Math.PI/2,0,0],{glow:true});
 const halo=part(activeRing,'torus','#8beb68',[4.44,4.44,.85],[0,-.005,0],[Math.PI/2,0,0],{glow:true,alpha:.25});
 const view=new T.OrthographicCamera(-1,1,1,-1,.1,130);
 view.position.set(.25,22,21.7);view.lookAt(0,0,-.1);view.updateMatrixWorld();
 s.userData={key,missionMap:{markers,activeRing,torus,halo,active:null,dirty:true}};
 setScene(s,view);
}

const globeSites={
 quarrywood:{xy:[.95,.45],tint:'#9cf17b',glyph:'evergreen'},
 timbervale:{xy:[-1.51,1.60],tint:'#f8d484',glyph:'houses'},
 'mesa-gorge':{xy:[-1.23,-1.30],tint:'#ffab79',glyph:'mesa'},
 'obsidian-peaks':{xy:[1.78,2.05],tint:'#c6b1ff',glyph:'peaks'}
};
const globeRadius=5.2;
function renderRegionGlobe(){
 const s=new T.Scene();
 s.background=new T.Color('#090a20');
 const stars=[],rng=D.random(2872);
 for(let i=0;i<290;i++)stars.push((rng()-.5)*38,(rng()-.5)*23,-7-rng()*7);
 const sky=new T.BufferGeometry();
 sky.setAttribute('position',new T.Float32BufferAttribute(stars,3));
 const starlight=new T.PointsMaterial({color:'#afbee9',size:.046,transparent:true,opacity:.58});
 s.add(new T.Points(sky,starlight));
 const planet=new T.ShaderMaterial({
  vertexShader:`
   varying vec3 localPoint;
   void main(){
    localPoint=normalize(position);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
   }`,
  fragmentShader:`
   varying vec3 localPoint;
   float hash(vec3 p){
    p=fract(p*.3183099+vec3(.11,.53,.29));
    p*=17.0;
    return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
   }
   float noise(vec3 p){
    vec3 a=floor(p),u=fract(p);
    u=u*u*(3.0-2.0*u);
    return mix(mix(mix(hash(a),hash(a+vec3(1,0,0)),u.x),mix(hash(a+vec3(0,1,0)),hash(a+vec3(1,1,0)),u.x),u.y),
               mix(mix(hash(a+vec3(0,0,1)),hash(a+vec3(1,0,1)),u.x),mix(hash(a+vec3(0,1,1)),hash(a+vec3(1,1,1)),u.x),u.y),u.z);
   }
   float detail(vec3 p){
    return noise(p)*.53+noise(p*2.07)*.26+noise(p*4.13)*.14+noise(p*8.30)*.07;
   }
   void main(){
    vec3 p=normalize(localPoint);
    vec2 shore=vec2((p.x+.035)*1.04,(p.y-.09)*1.23);
    float coarse=detail(p*5.9+vec3(6.0,3.0,4.0));
    float elevation=.69-dot(shore,shore)+.93*(coarse-.45);
    float land=smoothstep(.128,.174,elevation);
    float relief=detail(p*25.0+vec3(4.0,2.0,11.0));
    float arid=1.0-smoothstep(.09,.46,length(p.xy-vec2(-.25,-.28)));
    float rock=smoothstep(.60,.86,relief+max(.0,p.y)*.23);
    vec3 sea=mix(vec3(.064,.096,.27),vec3(.16,.17,.40),coarse);
    vec3 grass=mix(vec3(.16,.29,.18),vec3(.42,.48,.25),relief);
    grass=mix(grass,vec3(.57,.39,.23)*(.67+relief*.55),arid*.88);
    grass=mix(grass,vec3(.57,.56,.51),rock*.72);
    vec3 color=mix(sea,grass,land);
    color=mix(color,vec3(.27,.33,.47),smoothstep(.117,.148,elevation)*(1.0-smoothstep(.15,.18,elevation))*.52);
    vec2 curl=p.xy-vec2(.53,.36);
    float distanceToEye=length(curl);
    float phase=atan(curl.y,curl.x)+distanceToEye*4.7;
    float spin=smoothstep(.0,.21,distanceToEye);
    vec3 clouds=vec3(distanceToEye*8.0,cos(phase)*1.65*spin,sin(phase)*1.65*spin+p.z*2.2);
    float bands=detail(clouds*2.3)+.14*spin*sin(distanceToEye*25.0+phase*3.0+detail(p*14.0)*5.0);
    float storm=smoothstep(.31,.86,p.x+p.y*.49)+.29*(1.0-land);
    float cover=smoothstep(.37,.71,bands+min(1.0,storm)*.19)*min(.91,storm+.17);
    vec3 vapor=mix(vec3(.27,.16,.48),vec3(.74,.56,.94),clamp(bands,0.0,1.0));
    color=mix(color,vapor,cover);
    float daylight=clamp(dot(p,normalize(vec3(.63,.65,.48)))*.65+.53,.18,1.0);
    float rim=pow(1.0-clamp(p.z,0.0,1.0),3.25);
    color=color*daylight+rim*mix(vec3(.12,.085,.45),vec3(.40,.24,.63),daylight);
    gl_FragColor=vec4(color,1.0);
   }`
 });
 s.add(new T.Mesh(new T.SphereGeometry(globeRadius,120,88),planet));
 const atmosphere=new T.ShaderMaterial({
  transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.BackSide,
  vertexShader:`
   varying vec3 spherePoint;
   void main(){
    spherePoint=normalize(position);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
   }`,
  fragmentShader:`
   varying vec3 spherePoint;
   void main(){
    vec3 p=normalize(spherePoint);
    float glow=pow(1.0-abs(p.z),7.0);
    vec3 color=mix(vec3(.15,.20,.67),vec3(.58,.35,.89),smoothstep(-.4,1.1,p.x+p.y));
    gl_FragColor=vec4(color,glow*.63);
   }`
 });
 s.add(new T.Mesh(new T.SphereGeometry(globeRadius+.105,96,72),atmosphere));
 const view=new T.OrthographicCamera(-1,1,1,-1,.1,60);
 view.position.z=18;view.updateMatrixWorld();
 s.userData={key:'regions',regionGlobe:true,redraw:true};setScene(s,view);
}
function positionRegionPins(){
 for(const marker of root.querySelectorAll('[data-region-pin]')){
  const [x,y]=globeSites[marker.dataset.regionPin].xy;
  const z=Math.sqrt(globeRadius**2-x*x-y*y);
  const at=V(x,y,z).project(camera);
  marker.style.left=(.5+at.x*.5)*100+'%';
  marker.style.top=(.5-at.y*.5)*100+'%';
 }
}
const regionIconPaths={
 evergreen:'M12 3l4.5 6H14l4.75 6H14v5h-4v-5H5.25L10 9H7.5z',
 houses:'m3 11 5-5 5 5v8H3zm10-1 3-3 5 5v7h-8M6 19v-5h4v5',
 mesa:'M2 19h20M4 19l3-5 2-1 2-6h5l2 6 2 6M9 13h9',
 peaks:'m2 19 6-11 3 5 4-9 7 15zm10-9 3 2 2-2',
 lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zm7 4v3'
};
function regionPinIcon(glyph){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
 path.setAttribute('d',regionIconPaths[glyph]);svg.append(path);return svg;
}
function renderRegionPicker(main,stats){
 const zones=values(catalog.zones),pins=node('div','','sf-region-pins');
 const directory=node('div','','sf-region-directory');
 const details=add(node('aside','','sf-region-details'),node('h2'),node('p'));
 const [title,description]=details.children;
 description.setAttribute('aria-live','polite');
 const action=button('Open region',()=>openRegion(active,stats),{className:'sf-primary'});
 details.append(action);
 let active=selectedZone;
 function preview(id){
  active=id;
  const zone=catalog.zones[id],lock=regionLock(zone,stats);
  title.textContent=zone.name;
  description.textContent=lock||zone.biome+' · PL '+zone.min+'–'+zone.max;
  action.textContent=lock?'Region locked':'Open region';
  action.disabled=!!lock;
  for(const pin of pins.children)pin.classList.toggle('sf-region-active',pin.dataset.regionPin===id);
 }
 for(const zone of zones){
  const site=globeSites[zone.id];
  if(!site)continue;
  const locked=!!regionLock(zone,stats);
  const pin=button('',()=>{preview(zone.id);if(!locked)openRegion(zone.id,stats)},{className:'sf-region-pin'});
  pin.dataset.regionPin=zone.id;pin.dataset.locked=String(locked);
  pin.style.setProperty('--region-tint',site.tint);
  pin.setAttribute('aria-label',zone.name+(locked?' (locked)':''));
  if(locked)pin.setAttribute('aria-disabled','true');
  const icon=add(node('span','','sf-region-symbol'),regionPinIcon(locked?'lock':site.glyph));
  pin.append(icon,node('strong',zone.name,'sf-region-name'));
  pin.addEventListener('pointerenter',()=>preview(zone.id));
  pin.addEventListener('focus',()=>preview(zone.id));
  pins.append(pin);
 }
 const custom=zones.filter(zone=>!globeSites[zone.id]);
 if(custom.length){
  const options=[['','Community regions'],...custom.map(zone=>[zone.id,zone.name+(regionLock(zone,stats)?' (locked)':'')])];
  const picker=control('Community regions',options,custom.some(zone=>zone.id===active)?active:'',id=>{if(id)preview(id)});
  directory.append(picker);
 }
 const screen=add(node('section','','sf-regions'),heading('Campaign map','Choose a region'),pins,directory,details);
 main.append(screen);preview(active);
}

function renderEquipmentScene(kind,key){
 const s=worldScene(catalog.zones[selectedZone]),display=group(s,3,-.3,0);
 s.background=pigment('#141b1e');s.fog=new T.FogExp2(pigment('#141b1e'),.014);
 part(s,'hex','#24333b',[23,.4,20],[0,-.87,0]);
 for(let i=0;i<17;i++){
  const x=i-8;
  box(s,'#384749',x*1.2,-.65,0,.019,.015,16);
  box(s,'#384749',0,-.65,x,21,.015,.019);
 }
 box(display,'#4e5551',0,-.03,0,2.75,.76,2.09,{metal:true});
 box(display,'#586362',0,.39,0,2.81,.16,2.15,{metal:true});
 for(const x of [-1.18,-.95,.95,1.18])box(display,'#cedd85',x,.27,1.062,.09,.09,.019,{glow:true});
 const subject=group(s,3,.55,0);
 if(kind==='hero'){
  const actor=playerModel(subject,{hero:profile.hero,operator:profile.operator||arenaGear?.operator,weapon:profile.selected},false);
  actor.g.scale.setScalar(1.65);actor.g.rotation.y=.43;
  animateActor(actor,0,0);
 }else{
  const weapon=weaponModel(subject,catalog.weapons[profile.selected]);weapon.scale.setScalar(3.2);
  weapon.position.y=.62;weapon.rotation.set(-.13,-1.12,.23);
 }
 const light=new T.PointLight('#bbf7b0',1.05,10);light.position.set(3.8,3.1,3.2);s.add(light);
 const view=new T.PerspectiveCamera(40,1,.05,100);view.position.set(1.1,3.6,8.8);view.lookAt(.5,1.35,0);
 setScene(s,view);s.userData={key,subject};
}

function heading(title,caption){
 const g=node('div','','sf-heading');add(g,node('h1',title),node('p',caption));return g;
}
function info(title,value){
 const g=node('div','','sf-info');return add(g,node('small',title),node('strong',value));
}
function panel(title,...children){return add(node('section','','sf-panel'),node('h2',title),...children)}
function row(...children){return add(node('div','','sf-row'),...children)}
function menuTabs(items,current,change){
 const wrap=node('div','','sf-tabs');
 for(const label of items){
  const b=button(label,()=>change(label));b.setAttribute('aria-pressed',String(label===current));wrap.append(b);
 }
 return wrap;
}
function update(message=''){
 if(message)notice=message;
 persist();renderHub();
}
function switchTab(next,sub=''){basePanel='';section=next;subsection=sub;notice='';renderHub()}
function renderHub(){
 mode='hub';
 const stats=D.fortStats(profile), header=node('header','','sf-header'), brand=node('div','','sf-brand');
 add(brand,node('span','','sf-crest'),add(node('div'),node('strong','STORMFRONT')));
 const nav=node('nav');nav.setAttribute('aria-label','Stormfront');
 for(const tab of ['Homebase','Command','Armory','Loot Llamas','Mods','Play']){
  const b=button(tab,()=>{if(tab==='Mods'){if(arena)arena.mods();else location.assign('index.html?mods=1')}else switchTab(tab)},{className:tab==='Play'?'sf-nav-play':''});if(tab===section)b.setAttribute('aria-current','page');nav.append(b);
 }
 const exit=node('a','×','sf-back sf-exit');exit.href='index.html';exit.target='_top';
 exit.addEventListener('click',e=>{if(arena){e.preventDefault();arena.close()}});exit.setAttribute('aria-label','Return to Spartan Drill');exit.title='Return to Spartan Drill';
 const currency=add(node('div','','sf-wallet'),node('span','⬡','sf-coin'),info('MEHRBOD BUX',arenaGear?.rank.bux??profile.bux));
 const status=add(node('div','','sf-row sf-utility'),info('POWER',stats.power),info('CAMPAIGN',campaignLevel()),currency,
  button('◫',()=>openRegion(regionLock(catalog.zones[selectedZone],stats)?'quarrywood':selectedZone,stats,selectedMission),{className:'sf-social'}),exit);
 status.querySelector('.sf-social').setAttribute('aria-label','Open private squad controls');
 status.querySelector('.sf-social').title='Private squad';
 add(header,brand,nav,status);
 const main=node('div','','sf-screen');
 if(section==='Homebase')renderHomebase(main,stats);
 const choosingRegion=section==='Play'&&(subsection!=='missions'||!!regionLock(catalog.zones[selectedZone],stats));
 if(choosingRegion)renderRegionPicker(main,stats);
 else if(section==='Play')renderPlay(main,stats);
 if(section==='Command')renderCommand(main,stats);
 if(section==='Armory')renderArmory(main);
 if(section==='Loot Llamas'){if(campaignLevel()<3)add(main,heading('Loot Llamas','The X-Ray scanner opens at Campaign Level 3.'));else renderShop(main)}
 
 if(notice){
  const alert=node('p',notice,'sf-notice');alert.setAttribute('role','status');(main.querySelector('.sf-brief')||main).append(alert);
 }
 const display=choosingRegion?'regions':section==='Homebase'?'base':section==='Command'&&subsection==='Heroes'?'hero':section==='Armory'&&subsection==='Schematics'?'weapon':'map';
 main.dataset.display=display;
 const viewKey=choosingRegion?'regions':section==='Play'?'missions:'+selectedZone:display==='map'?'map:'+selectedZone:display==='base'?'base':display==='hero'?'hero:'+profile.hero+':'+(profile.operator||arenaGear?.operator||''):'weapon:'+profile.selected;
 const scrollTop=section==='Play'&&scene?.userData.key===viewKey?root.querySelector('.sf-screen')?.scrollTop:0;
 missionMapObserver?.disconnect();
 root.replaceChildren(header,main);root.className='sf-hub';stage.className='sf-underlay';stage.dataset.display=display;
 const surface=main.querySelector('.sf-mission-map'),layer=main.querySelector('.sf-mission-landscape');
 const canvasHost=layer||stage;
 if(renderer.domElement.parentElement!==canvasHost)canvasHost.prepend(renderer.domElement);
 if(scrollTop)main.scrollTop=scrollTop;
 if(scene?.userData.key!==viewKey){
  if(choosingRegion)renderRegionGlobe();
  else if(surface)renderMissionScene(catalog.zones[selectedZone],viewKey);
  else if(display==='base')renderHomebaseScene();
  else if(display==='map')renderHubScene();
  else renderEquipmentScene(display,viewKey);
 }else if(surface||choosingRegion)resize();
 if(surface){
  missionMapObserver?.observe(surface);missionMapObserver?.observe(layer);
  highlightMissionTile(surface.querySelector('[data-selected=true]'));
 }
 if(display==='base'){
  scene.userData.positionMarkers=true;
  updateBaseMarkers();
 }
}
const veraLog=[
 'The field stations are online. Pick a building to get straight to its controls.',
 'The storm forecast is holding. Head to the field radar when your squad is ready.',
 'Slot survivors by job and personality. A little paperwork can save a very large wall.'
];
function veraPanel(){
 const body=node('p',veraLog[veraPage],'sf-vera-line');
 const footer=add(node('div','','sf-vera-footer'),node('span','⬡  AetherCorp'),
  button('→',()=>{veraPage=(veraPage+1)%veraLog.length;body.textContent=veraLog[veraPage]},{className:'sf-vera-next'}));
 footer.querySelector('button').setAttribute('aria-label','Advance V.E.R.A. field note');
 return add(panel('V.E.R.A. field notes',body,footer),node('span','','sf-vera-tape'));
}
function renderHomebase(main,stats){
 const display=add(node('section','','sf-homebase'),node('h1','Homebase','sf-base-title'));
 const sector=node('div','','sf-station-layer');
 const stationGlyphs={keeping:'◆',lab:'✦',yard:'▨',medical:'✚',depot:'▣',relay:'◈',range:'▴'};
 for(const station of stationList){
  const b=button(stationGlyphs[station.id],()=>switchTab(station.tab,station.sub),{className:'sf-station'});
  b.dataset.station=station.id;b.style.setProperty('--station',station.color);
  b.setAttribute('aria-label',station.title);
  b.append(add(node('small'),node('strong',station.title),node('span',station.detail)));sector.append(b);
 }
 const rank=arenaGear?.rank,level=rank?.level??1+Math.floor(profile.xp/500),progress=node('progress');
 progress.value=rank?.xp??profile.xp%500;progress.max=rank?.xpMax??500;progress.setAttribute('aria-label','Commander experience');
 progress.title=progress.value+' / '+progress.max+' XP';
 const flag=add(node('div','','sf-base-flag'),node('span','','sf-base-insignia'));
 flag.setAttribute('aria-hidden','true');
 const current=D.campaign(profile),quest=current.quest;
 const route=panel('Current operation',node('p',quest?quest[2]:'Campaign route secured'),
  node('p','Campaign Level '+current.level+' · '+current.remaining+' / '+current.next+' XP'),
  button(quest?'Find current operation':'Open World Map',()=>{
   if(quest)openRegion(quest[0],stats,quest[1]);
   else switchTab('Play');
  },{className:'sf-primary'}));
 const commander=panel('Commander record',node('p',progress.value+' / '+progress.max+' Commander XP'),
  ...(rank?[node('p','Battle Pass · Tier '+rank.passTier)]:[]),
  button('Open Command',()=>switchTab('Command','Heroes')));
 const squad=panel('Squad communications',roomPanel()),briefing=veraPanel();
 const trays={commander,operation:route,squad,briefing},triggers=new Map();
 const stack=node('div','','sf-base-trays');
 for(const [id,tray] of Object.entries(trays)){tray.id='sf-base-'+id;stack.append(tray)}
 function showTray(id){
  basePanel=id;
  for(const [name,tray] of Object.entries(trays)){
   tray.hidden=id!==name;triggers.get(name).setAttribute('aria-expanded',String(id===name));
  }
 }
 function trigger(id,label){
  const b=button(label,()=>showTray(basePanel===id?'':id));
  b.setAttribute('aria-controls','sf-base-'+id);triggers.set(id,b);return b;
 }
 const record=add(node('section','','sf-base-level'),node('strong','Commander Level '+level),progress,trigger('commander','Commander record'),flag);
 const dock=add(node('footer','','sf-base-dock'),trigger('operation','Current operation'),
  trigger('squad',rooms?.connected?'Squad · '+rooms.size+'/4':'Private squad'),trigger('briefing','V.E.R.A. notes'));
 display.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&basePanel){
   const opener=triggers.get(basePanel);showTray('');opener.focus();
  }
 });
 showTray(basePanel);
 add(display,sector,record,stack,dock,rosterPanel(stats.power));main.append(display);
}
function rosterPanel(power){
 const count=rooms?.connected?rooms.size:1,roster=node('div','','sf-roster');
 roster.setAttribute('aria-label','Squad lineup');
 for(let i=0;i<4;i++){
  const tile=add(node('div','','sf-seat'),node('span',i===0?'⬡':i<count?'◆':'·'),node('small',i===0?'You':i<count?'Operative '+(i+1):'Open seat'));
  tile.dataset.filled=String(i<count);tile.style.setProperty('--seat',['#87d5b7','#e0a291','#c5db85','#bb9ade'][i]);
  if(i===0)tile.append(node('strong','PL '+power));
  roster.append(tile);
 }
 return roster;
}

const missionMapIcons={
 relay:'M5 20h14M8 20l4-13 4 13M10 13h4m-8-4a8 8 0 0 1 0-5m12 0a8 8 0 0 1 0 5M12 3v2',
 atlas:'M12 3 21 19H3L12 3Zm0 5v7m0 1.7v.4',
 data:'M6 3h9l4 4v14H6V3Zm8 0v5h5M9 12h7m-7 4h6',
 lightning:'M3 7h11v10H3zm11 3h4l3 4v3h-7M8 17a2 2 0 1 0 0 .1m10-.1a2 2 0 1 0 0 .1M9 9l-2 3h3l-2 3',
 repair:'M3 11l9-7 9 7v9H3v-9Zm9 1v6m-3-3h6',
 evacuate:'M3 11l8-7 8 7M5 9v11h9m-4-5h11m-4-4 4 4-4 4',
 bomb:'M9 5h7l3 8v5H5v-4l4-9Zm3 0V3h4M7 21h11m-5-12-2 3h3l-2 3',
 encampments:'M5 18h10M8 17l3-9 4 9M17 5l4 3m-5 2 5-2m-6-3 1 5',
 rescue:'M12 8a2.6 2.6 0 1 0 0-5.2A2.6 2.6 0 0 0 12 8Zm-5 9v-2a5 5 0 0 1 10 0v2m-8 0v4m6-4v4M5 8a2 2 0 0 0 0 4m14-4a2 2 0 0 1 0 4',
 radar:'M4 7a11 11 0 0 0 13 13L4 7Zm6 7 7-8m0 0h.05M16 2a5 5 0 0 1 6 6',
 'seal-classic':'M11 3H5v18h14v-7M15 3l-4 7h5l-4 7 8-9h-5l3-5',
 'nests-classic':'M12 3c3 0 7 7 7 11a7 7 0 1 1-14 0c0-4 4-11 7-11Zm-1 6 2 3-3 3 3 2',
 'payload-classic':'M4 9l8-4 8 4v10l-8 3-8-3V9Zm0 0 8 4 8-4m-8 4v9M12 2v3',
 shield:'M12 3l8 3v6c0 3.8-3.4 7.2-8 9-4.6-1.8-8-5.2-8-9V6l8-3Zm0 5v7m-3-3h6'
};
function missionMarkerIcon(def){
 const official=def.base||def.id,shape=missionMapIcons[official];
 if(!shape||def.icon!==D.content.missions[official]?.icon)return node('span',def.icon);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
 path.setAttribute('d',shape);svg.append(path);
 return svg;
}
function positionMissionMarkers(surface,offsetX,offsetY,width,height){
 const map=scene.userData.missionMap;
 for(const marker of surface.querySelectorAll('[data-mission]')){
  const projected=map.markers.get(marker.dataset.mission).anchor.getWorldPosition(V()).project(camera);
  marker.style.left=((projected.x*.5+.5)*width-offsetX)+'px';
  marker.style.top=((.5-projected.y*.5)*height-offsetY)+'px';
 }
}

function highlightMissionTile(marker){
 const map=scene?.userData.missionMap;
 if(!map)return;
 const active=marker?.dataset.mission;
 const kind=marker?.matches(':hover,:focus-visible')?'preview':marker?.dataset.unlocked==='true'?'selected':'locked';
 if(active===map.active&&kind===map.highlight)return;
 const site=map.markers.get(active);
 map.active=active;map.highlight=kind;map.dirty=true;
 map.activeRing.visible=!!site;
 if(!site)return;
 map.activeRing.position.copy(site.tile.position);map.activeRing.position.y+=.34;
 map.activeRing.scale.setScalar(active==='shield'?1.23:1);
 const tint=kind==='preview'?'#c9ff82':kind==='selected'?'#ffda81':'#aebbdc';
 map.torus.material=material(tint,true);
 map.halo.material=material(tint,true,.30);
}
const baseBiomes=['Forest','Suburbs','City','Industrial Park','Desert','Ghost Town','Tropical'];
function missionOptions(){
 const base=values(catalog.missions),options=[];
 for(const entry of base){
  options.push({id:entry.id,def:entry,label:entry.name,levels:entry.levels||(entry.id==='atlas'?1:undefined)});
  if(entry.id==='atlas')for(let count=2;count<=4;count++)options.push({id:'atlas-'+count,def:entry,label:'Fight the Storm · Category '+count,levels:count});
 }
 return options;
}
function plFor(zone,option){return Math.min(zone.max,zone.min+option.def.offset-1+(option.levels||1)-1)}
function regionLock(zone,stats){
 const campaign=keys(D.content.zones),previous=campaign[campaign.indexOf(zone.id)-1];
 if(previous&&!(profile.clears[previous+':shield']>0))return 'Clear '+catalog.zones[previous].name+' Storm Shield to unlock.';
 if(stats.power<zone.min)return 'Reach Power '+zone.min+' to unlock.';
 return '';
}
function openRegion(id,stats,mission='atlas'){
 const zone=catalog.zones[id];
 if(!zone)return;
 selectedZone=id;
 if(regionLock(zone,stats)){switchTab('Play');return}
 selectedMission=mission;switchTab('Play','missions');
}
function missionAccess(zone,option,stats){
 return !regionLock(zone,stats)&&stats.power>=plFor(zone,option);
}
function missionBiome(zone,item){
 return item.def.biome||(item.id==='atlas'||classicMissions[item.id]?zone.biome:baseBiomes[(Math.max(0,baseBiomes.indexOf(zone.biome))+item.def.offset-1)%baseBiomes.length]);
}
function renderPlay(main,stats){
 const zone=catalog.zones[selectedZone],options=missionOptions();
 let option=options.find(v=>v.id===selectedMission)||options[0];
 const layout=node('div','','sf-play');
 const map=add(node('section','','sf-map'),heading(zone.name,zone.biome+' / Campaign region / PL '+zone.min+'–'+zone.max));
 const zoneTabs=add(node('div','','sf-zones'),button('All regions',()=>switchTab('Play')));
 for(const zoneTab of values(catalog.zones)){
  const lock=regionLock(zoneTab,stats);
  const b=button(zoneTab.name,()=>openRegion(zoneTab.id,stats),{disabled:!!lock});
  if(lock){b.title=lock;b.setAttribute('aria-label',zoneTab.name+' (locked)')}
  if(zone.id===zoneTab.id)b.setAttribute('aria-current','true');zoneTabs.append(b);
 }
 map.append(zoneTabs);
 const grid=node('div','','sf-mission-map'), sidebar=node('aside','','sf-brief'), selectList=node('div','','sf-mission-list');
 const tooltip=node('div','','sf-map-tooltip');tooltip.hidden=true;grid.append(tooltip);
 const sites=new Set(missionTileSites(zone,options).map(site=>site.id));
 const selectedMarker=()=>grid.querySelector('[data-selected=true]');
 let pointed=null,focused=null;
 function preview(){
  const target=pointed||focused;
  highlightMissionTile(target||selectedMarker());
  tooltip.hidden=!target;
  if(!target)return;
  const item=options.find(v=>v.id===target.dataset.mission);
  tooltip.replaceChildren(node('strong',item.label),node('small','PL '+plFor(zone,item)+' · '+missionBiome(zone,item)+' · '+item.def.element),
   node('small','Rewards · XP, Gold, Schematics'));
  tooltip.style.setProperty('--tooltip-x',target.style.left);tooltip.style.top=target.style.top;
  tooltip.dataset.above=String(target.offsetTop>grid.clientHeight*.65);
 }
 const legend=add(node('div','','sf-map-key'),node('span','Open route'),node('span','Storm-locked'),node('span','Selected operation'));
 function details(item){
  const m=item.def, power=plFor(zone,item),ready=missionAccess(zone,item,stats),biome=missionBiome(zone,item);
  const title=node('h2',item.label);
  const solo=button('Deploy solo',()=>{
   solo.textContent='Starting operation…';
   deploy(item,zone,false);
  },{className:'sf-primary',disabled:!ready||!!rooms?.connected});
  const buttons=row(solo,
   button('Deploy squad',()=>deploy(item,zone,true),{disabled:!ready||!rooms?.host||!rooms.connected||rooms.size<2}));
  sidebar.replaceChildren(node('small','MISSION BRIEF','sf-label'),title,node('p',m.brief),
   row(info('BIOME',biome),info('RECOMMENDED PL',power)),
   row(info('STORM',m.element),info('REWARD POOL','XP · Gold · Schematics')),
   buttons, ...(ready?[]:[node('p','Raise Homebase Power and clear the previous region’s Storm Shield to deploy.','sf-muted')]),roomPanel(),
   node('small','OUTPOST · Storm Shield clears '+(profile.clears[zone.id+':shield']||0)+' · Saved pieces '+(profile.outposts[zone.id]?.structures.length||0),'sf-outpost-readout'));
 }
 for(const item of options){
  if(sites.has(item.id)){
   const b=button('',()=>{
    const keyboard=b.matches(':focus-visible');selectedMission=item.id;renderHub();
    if(keyboard)root.querySelector('.sf-mission-marker[data-selected="true"]')?.focus({preventScroll:true});
   },{className:'sf-mission-marker'});
   b.dataset.mission=item.id;b.dataset.unlocked=String(missionAccess(zone,item,stats));b.dataset.selected=String(item.id===option.id);
   b.setAttribute('aria-label',item.label+' · PL '+plFor(zone,item));
   b.setAttribute('aria-pressed',b.dataset.selected);
   b.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){pointed=b;preview()}});
   b.addEventListener('pointerleave',()=>{if(pointed===b){pointed=null;preview()}});
   b.addEventListener('focus',()=>{if(b.matches(':focus-visible')){focused=b;preview()}});
   b.addEventListener('blur',()=>{if(focused===b){focused=null;preview()}});
   b.append(missionMarkerIcon(item.def));grid.append(b);
  }else{
   const b=button(item.label,()=>{selectedMission=item.id;renderHub()});b.setAttribute('aria-pressed',String(item.id===option.id));
   b.title='Recommended PL '+plFor(zone,item);selectList.append(b);
  }
 }
 details(option);
 map.append(grid,legend,rosterPanel(stats.power));if(selectList.children.length)map.append(selectList);
 const landscape=node('div','','sf-mission-landscape');landscape.setAttribute('aria-hidden','true');
 add(main,landscape,add(layout,map,sidebar));
}
function roomPanel(){
 const g=node('section','','sf-room');
 if(rooms?.connected){
  const copyButton=button(rooms.code,()=>navigator.clipboard?.writeText(rooms.code)?.then(()=>{notice='Squad code copied.';renderHub()}).catch(()=>{}));
  copyButton.title='Copy invite code';
  add(g,node('h3',rooms.host?'Private squad':'Joined squad'),row(copyButton,button('Leave',()=>rooms.close('Squad closed.'))),
   node('p',rooms.size+' / 4 operatives · '+(rooms.host?'Choose a mission to deploy.':'The squad leader chooses the mission.')));
 }else{
  const input=node('input');input.placeholder='Invite code';input.maxLength=16;input.setAttribute('aria-label','Squad invite code');
  const join=()=>rooms.open(false,input.value);
  input.addEventListener('keydown',e=>{if(e.key==='Enter')join()});
  add(g,node('h3','Private squad'),row(input,button('Join',join)),button('Create squad',()=>rooms.open(true)));
  if(rooms?.status)g.append(node('p',rooms.status,'sf-muted'));
 }
 return g;
}
function renderCommand(main,stats){
 const tabs=['Heroes','Survivor Squads','Defenders','Research Lab','Upgrades'];
 if(!tabs.includes(subsection))subsection=tabs[0];
 add(main,heading('Command','Configure your field team and Homebase research.'),menuTabs(tabs,subsection,tab=>{subsection=tab;renderHub()}));
 const body=node('div','','sf-card-grid');
 if(subsection==='Heroes'){
  const level=campaignLevel(),hero=catalog.heroes[profile.hero],choices=profile.owned.filter(id=>catalog.heroes[id]&&level>=D.heroLevel(id)).map(id=>[id,catalog.heroes[id].name+' · '+catalog.heroes[id].role]);
  const load=panel('Commander',control('Commander',choices,profile.hero,id=>{
   profile.hero=id;profile.supports=profile.supports.map(v=>v===id?'':v);update();
  }),node('p',hero.perk+' · Commander perk'),node('p',hero.abilities.map(id=>catalog.abilities[id].name).join(' · ')));
  if(arenaGear)load.append(control('Shared Locker operator',arenaGear.operators,profile.operator||arenaGear.operator,id=>{profile.operator=id;update()}));
  const team=panel('Team perk',level<4?node('p','Opens at Campaign Level 4.'):control('Team perk',[['','No team perk'],['Rally Line','Rally Line'],['Last Stand','Last Stand'],['Critical Circuit','Critical Circuit']],profile.team,id=>{profile.team=id;update()}),
   node('p','Rally Line requires 2 Soldiers or Constructors. Last Stand requires 2 Epic Constructors. Critical Circuit requires 2 Epic Ninjas or Outlanders.'));
  const support=panel('Support team');
  for(const [i,id] of profile.supports.entries()){
   if(level<D.supportLevels[i]){support.append(node('p','Slot '+(i+1)+' · Campaign Level '+D.supportLevels[i]));continue}
   const choicesAt=choices.filter(([v])=>v!==profile.hero&&(!profile.supports.includes(v)||v===id));
   add(support,control('Support '+(i+1),[['','Empty support slot'],...choicesAt],id,v=>{profile.supports[i]=v;update()}));
  }
  const gadgets=panel('Gadgets');
  for(const [i,id] of profile.gadgets.entries())gadgets.append(level<D.gadgetLevels[i]?node('p','Slot '+(i+1)+' · Campaign Level '+D.gadgetLevels[i]):control('Gadget '+(i+1),D.gadgets.filter((v,j)=>j<2+level&&(!profile.gadgets.includes(v)||v===id)).map(v=>[v,v]),id,v=>{profile.gadgets[i]=v;update()}));
  add(body,load,team,support,gadgets);
  const briefing=veraPanel();briefing.classList.add('sf-command-vera');main.append(briefing);
 }
 if(subsection==='Survivor Squads'){
  add(main,row(...D.fort.map((stat,i)=>info(stat,stats.stats[i]))),node('p',values(stats.bonuses).some(Boolean)?keys(stats.bonuses).filter(k=>stats.bonuses[k]).map(k=>k+' ×'+stats.bonuses[k]).join(' · '):'Match a lead’s job, then match support personalities and sets.','sf-muted'));
  const assigned=new Set(profile.squads.flat().filter(Boolean));
  for(const [i,name] of D.squadNames.entries()){
   const squad=panel(name,node('p',D.fort[Math.floor(i/2)]+' · Lead job '+D.jobs[i]));
   for(const [slot,id] of profile.squads[i].entries()){
    const threshold=D.survivorLevel(i,slot);
    if(campaignLevel()<threshold){squad.append(node('p',(slot?'Support '+slot:'Lead')+' · Campaign Level '+threshold));continue}
    const choices=profile.survivors.filter(v=>(v.id===id||!assigned.has(v.id))&&(slot===0?!!v.job:!v.job)).map(v=>[v.id,v.name+' · '+(v.job||v.set)+' · '+v.personality]);
    squad.append(control(name+' '+(slot?'support '+slot:'lead'),[['',slot?'Empty support slot':'Empty lead slot'],...choices],id,v=>{profile.squads[i][slot]=v;update()}));
   }
   body.append(squad);
  }
 }
 if(subsection==='Defenders'&&campaignLevel()<5){body.append(panel('Defenders',node('p','Opens at Campaign Level 5.')))}
 if(subsection==='Defenders'&&campaignLevel()>=5){
  body.append(panel('Defender assignment',control('Defender class',['Sniper','Assault','Shotgun','Pistol','Melee'].map(v=>[v,v]),profile.defender,v=>{profile.defender=v;update()}),
   node('p','Craft and deploy a Defender Pad on a floor. Each defender takes an unoccupied co-op seat.')));
 }
 if(subsection==='Research Lab'&&campaignLevel()<3){body.append(panel('Research Lab',node('p','Opens at Campaign Level 3.')))}
 if(subsection==='Research Lab'&&campaignLevel()>=3){
  D.claimResearch(profile);main.append(row(info('RESEARCH POINTS',profile.research),node('p','Research generates 2 points per minute, up to 500.')));
  for(const [i,stat] of D.fort.entries()){
   const meter=node('progress');meter.max=100;meter.value=profile.lab[i];meter.setAttribute('aria-label',stat+' research');
   body.append(panel(stat,meter,node('p',profile.lab[i]+' research levels'),button('Invest 10 Research Points',()=>{
    if(profile.research<10||profile.lab[i]>=100)return;
    profile.research-=10;profile.lab[i]++;update();
   },{disabled:profile.research<10||profile.lab[i]>=100})));
  }
 }
 if(subsection==='Upgrades'){
  main.append(row(info('UPGRADE POINTS',profile.upgrade),info('CAMPAIGN LEVEL',campaignLevel())));
  for(const key of [...D.gadgets,...D.tools]){
   const level=profile.upgrades[key]||0,threshold=2+([ ...D.gadgets,...D.tools].indexOf(key)%5);
   if(campaignLevel()<threshold){body.append(panel(key,node('p','Opens at Campaign Level '+threshold)));continue}
   body.append(panel(key,node('p','Upgrade level '+level+' / 5'),button('Upgrade · 1 point',()=>{
    if(!profile.upgrade||level===5)return;
    profile.upgrades[key]=level+1;profile.upgrade--;update();
   },{disabled:!profile.upgrade||level===5})));
  }
 }
 main.append(body);
}
const evolutionCaps=[10,20,30,40,50];
function conditionLabel(item){
 const percent=Math.round(item.condition/item.max*100);
 const el=node('small',item.condition<=0?'Broken':percent+'% condition','sf-condition');
 el.dataset.broken=String(item.condition<=0);return el;
}
function inventoryList(stock,carried){
 const list=node('div','','sf-inventory-list');
 if(!stock.length)list.append(node('p','No weapons in this inventory.'));
 for(const item of stock){
  const def=fieldWeapon(item.id),itemRow=row(node('strong',def.name),conditionLabel(item));
  if(carried){
   itemRow.append(button(profile.equipped===item.uid?'Equipped':'Equip',()=>{profile.selected=item.id;profile.equipped=item.uid;update()},{
    disabled:profile.equipped===item.uid||item.condition<=0}));
  }
  itemRow.append(button(carried?'Store':'Retrieve',()=>{
   const target=carried?profile.bankWeapons:profile.items;
   if(target.length>=weaponLimit){update('The destination weapon rack is full.');return}
   stock.splice(stock.indexOf(item),1);target.push(item);
   if(profile.equipped===item.uid)profile.equipped=profile.items.find(v=>v.condition>0)?.uid||null;
   update();
  }));
  if(item.condition<=0)itemRow.append(button('Recycle',()=>{stock.splice(stock.indexOf(item),1);if(profile.equipped===item.uid)profile.equipped=null;update()}));
  list.append(itemRow);
 }
 return list;
}
function renderArmory(main){
 const tabs=['Schematics','Backpack','Storage','Collection Book'];
 if(!tabs.includes(subsection))subsection=tabs[0];
 add(main,heading('Armory','Tune schematics, transfer supplies and archive spare cards.'),
  menuTabs(tabs,subsection,tab=>{subsection=tab;renderHub()}),
  row(info('GOLD',profile.gold),info('EVOLUTION MATERIALS',profile.evolution)));
 const body=node('div','','sf-card-grid');
 if(subsection==='Schematics'){
  for(const [id,card] of Object.entries(profile.schematics)){
   const weapon=catalog.weapons[id],def=weapon||catalog.traps[id];
   if(!def)continue;
   const evolve=evolutionCaps.includes(card.level)&&card.level<50;
   const widget=panel(def.name,node('p','Lv '+card.level+' · '+(weapon?weapon.type:def.mount+' trap')+' · '+(card.element||def.element)+' · '+card.copies+' owned'));
   if(campaignLevel()<schematicLevel(id)){widget.append(node('p','Crafting unlocks at Campaign Level '+schematicLevel(id)));body.append(widget);continue}
   widget.append(button(evolve?'Evolve · 3 materials':'Level up · 25 Gold',()=>{
    if(evolve&&profile.evolution>=3){profile.evolution-=3;card.level++}
    else if(!evolve&&profile.gold>=25&&card.level<50){profile.gold-=25;card.level++}
    update();
   },{disabled:card.level>=50||(evolve?profile.evolution<3||!!weapon&&card.level===30&&!card.path:profile.gold<25)}));
   if(weapon){
    const cost=recipe(id,card,catalog.zones[selectedZone]);
    widget.append(node('p',recipeText(cost)),button('Craft in Armory',()=>{
     if(profile.items.length>=rackLimit()){update('Backpack weapon rack is full.');return}
     if(!payBag(profile.backpack,cost)){update('Missing materials · '+recipeText(cost));return}
     const item=craftedWeapon(id,card);profile.items.push(item);profile.equipped=item.uid;profile.selected=id;
     update('Crafted '+def.name+'.');
    },{className:'sf-primary'}));
    if(card.level>=30)widget.append(control('Evolution path for '+def.name,[['','Choose a 4-star material'],['core','Obsidian / Brightcore'],['beam','Shadowshard / Sunbeam']],card.path,v=>{if(v){card.path=v;update()}}));
   }
   if(card.level>=5&&campaignLevel()>=4)widget.append(control('Element for '+def.name,keys(colors).map(v=>[v,v]),card.element||def.element,v=>{card.element=v;update()}));
   const perks=node('div','','sf-perks');
   for(const [i,n] of card.perks.entries()){
    const names=['Damage','Cycle speed','Durability','Critical chance','Impact','Handling'];
    const b=button(names[i]+' '+n,()=>{if(profile.gold>=20&&n<5){profile.gold-=20;card.perks[i]++;update()}},{disabled:n>=5||profile.gold<20||card.level<(i+1)*3||campaignLevel()<3+i});
    perks.append(b);
   }
   widget.append(perks);body.append(widget);
  }
 }
 if(subsection==='Storage'&&campaignLevel()<2)body.append(panel('Homebase Storage',node('p','Opens at Campaign Level 2.')));
 if(subsection==='Backpack'||subsection==='Storage'&&campaignLevel()>=2){
  const source=subsection==='Backpack'?profile.backpack:profile.bank,dest=source===profile.backpack?profile.bank:profile.backpack;
  const capacity=source===profile.backpack?D.capacity(profile):D.storage(profile);
  const transferredCapacity=source===profile.backpack?D.storage(profile):D.capacity(profile);
  main.append(row(info('CAPACITY',values(source).reduce((a,b)=>a+b,0)+' / '+capacity)));
  const items=Object.entries(source).filter(([,amount])=>amount>0);
  const stock=subsection==='Backpack'?profile.items:profile.bankWeapons;
  const ledger=panel(subsection==='Backpack'?'Carried weapons':'Banked weapons',inventoryList(stock,subsection==='Backpack'));
  body.append(ledger);
  if(!items.length)body.append(panel('No loose materials',node('p','Scavenge the field to recover supplies.')));
  for(const [id,amount] of items){
   body.append(panel(catalog.weapons[id]?.name||catalog.traps[id]?.name||id,node('p',amount+' units'),button('Move up to 25',()=>{
    const moved=Math.min(amount,25,transferredCapacity-values(dest).reduce((a,b)=>a+b,0));
    if(moved<=0){notice='Destination storage is full.';renderHub();return}
    source[id]-=moved;dest[id]=(dest[id]||0)+moved;update();
   })));
  }
 }
 if(subsection==='Collection Book'&&campaignLevel()<4)body.append(panel('Collection Book',node('p','Opens at Campaign Level 4.')));
 if(subsection==='Collection Book'&&campaignLevel()>=4){
  const xp=Object.values(profile.collection).reduce((sum,n)=>sum+n,0)*25;
  main.append(row(info('COLLECTION BOOK XP',xp),info('NEXT MILESTONE',(1+Math.floor(xp/100))*100)));
  function archive(id,take){
   const before=Object.values(profile.collection).reduce((a,b)=>a+b,0);
   take();profile.collection[id]=(profile.collection[id]||0)+1;
   if((before+1)%4===0){profile.tokens+=40;profile.evolution+=4}
   update('Card archived.');
  }
  for(const [id,card] of Object.entries(profile.schematics)){
   if(card.copies>1)body.append(panel(catalog.weapons[id]?.name||catalog.traps[id]?.name||id,button('Archive duplicate',()=>archive(id,()=>card.copies--))));
  }
  for(const [id,count] of Object.entries(profile.heroCopies||{})){
   if(count>0)body.append(panel(catalog.heroes[id]?.name||id,button('Archive duplicate',()=>archive(id,()=>profile.heroCopies[id]--))));
  }
  const active=new Set(profile.squads.flat()),seen=new Set();
  for(const survivor of profile.survivors){
   if(!active.has(survivor.id)&&seen.has(survivor.name))body.append(panel(survivor.name,button('Archive duplicate',()=>archive(survivor.id,()=>{profile.survivors=profile.survivors.filter(v=>v.id!==survivor.id)}))));
   seen.add(survivor.name);
  }
  if(!body.children.length)body.append(panel('No spare cards available',node('p','Duplicate cards will appear here as you earn them.')));
 }
 main.append(body);
}
function queueLlama(index){
 const offer=D.llama[index],rng=D.random(makeSeed()),roll=rng(),upgrade=roll<.17?2:roll<.52?1:0;
 const items=offer.pool.map((kind,i)=>{
  let rarity=clamp(1+Math.floor(rng()*4)+(upgrade>0?1:0),0,5);
  if(i===0&&upgrade===2)rarity=4+Math.floor(rng()*2);
  if(kind==='survivor'){
   const name=D.pick(['Voss','Flint','Hale','Ember','Vega','Cross','Stern','Prism'],rng)+' '+D.pick(['Sato','Vale','Aster','Wren','Cruz'],rng);
   return {kind,rarity,id:'llama-'+makeSeed().toString(36),name,job:rng()<.28?D.pick(D.jobs,rng):'',personality:D.pick(D.personalities,rng),set:D.pick(D.sets,rng),value:5+rarity*2};
  }
  const pool=values(kind==='hero'?catalog.heroes:kind==='weapon'?catalog.weapons:catalog.traps);
  const matches=kind==='hero'?pool.filter(card=>D.tiers.indexOf(card.rarity)===rarity):pool;
  const item=D.pick(matches.length?matches:pool,rng);
  if(kind==='hero')rarity=D.tiers.indexOf(item.rarity);
  return {kind,rarity,id:item.id,name:item.name};
 });
 if(upgrade===2&&!items.some(item=>item.rarity>=4)){
  const legendary=values(catalog.heroes).find(hero=>hero.rarity==='Legendary');
  items[0]={kind:'hero',rarity:4,id:legendary.id,name:legendary.name};
 }
 return {index,items,upgrade,tool:Math.floor(rng()*5),hits:0,flips:[],opened:false};
}
function renderShop(main){
 if(!profile.queued){profile.queued=D.llama.map((_,index)=>queueLlama(index));persist()}
 add(main,heading('Loot Llamas','Scan the exact contents before spending earned Storm Tokens.'),row(info('STORM TOKENS',profile.tokens),info('MEHRBOD BUX',arenaGear?.rank.bux??profile.bux)));
 if(profile.parcel)main.append(button('Resume opening',()=>openWorkshop(),{className:'sf-primary'}));
 const grid=node('div','','sf-card-grid');
 for(const [index,offer] of D.llama.entries()){
  const queued=profile.queued[index],card=panel(offer.name,node('small','X-RAY SCAN','sf-label'));
  for(const item of queued.items){
   const line=node('p',item.name+' · '+D.tiers[item.rarity]);line.style.color=D.rarityColors[item.rarity];card.append(line);
  }
  card.append(button('Buy · '+offer.cost+' Storm Tokens',()=>{
   if(profile.parcel||profile.tokens<offer.cost)return;
   const before=D.copy(profile);
   profile.tokens-=offer.cost;profile.parcel=profile.queued[index];profile.queued[index]=queueLlama(index);
   if(!persist()){profile=before;notice='Browser storage could not save this purchase.';renderHub();return}
   openWorkshop();
  },{disabled:!!profile.parcel||profile.tokens<offer.cost,className:'sf-primary'}));
  grid.append(card);
 }
 main.append(grid);
}
function llamaModel(parent,grade){
 const palette=grade===2?['#db922b','#fde192','#ad6223','#fff0ba']:grade===1?['#8f9fab','#d5edf4','#626e87','#f0f3ff']:['#a14b79','#f0ae64','#525ca2','#49a9a1'];
 const g=group(parent,0,1.31,0);
 const damage=group(g);
 for(const side of [-1,1]){
  const chain=[[side*.468,.37,-.32],[side*.468,.18,-.17],[side*.468,.1,-.30],[side*.468,-.08,-.12],[side*.468,-.24,-.34]];
  for(let i=1;i<chain.length;i++)tube(damage,V(...chain[i-1]),V(...chain[i]),.035,'#33252c');
 }
 damage.visible=false;g.userData.damage=damage;
 box(g,palette[0],0,0,0,.81,.87,1.39,{metal:grade>0});
 for(let i=0;i<6;i++)for(const x of [-.42,.42]){
  box(g,palette[i%4],x,.38-i*.139,0,.055,.13,1.41,{metal:grade>0});
  for(let j=0;j<5;j++)box(g,palette[(i+j)%4],x*1.075,.34-i*.139,(j-2)*.27,.048,.07,.21,{metal:grade>0});
 }
 for(const x of [-.27,.27])for(const z of [-.49,.49]){
  box(g,palette[2],x,-.59,z,.22,.4,.24);box(g,palette[1],x,-.81,z,.23,.1,.25);
 }
 box(g,palette[0],0,.47,.5,.46,.9,.5);
 box(g,palette[1],0,.94,.64,.65,.51,.62);box(g,palette[3],0,.81,1.02,.54,.23,.37);
 for(const x of [-.22,.22]){
  box(g,palette[2],x,1.3,.52,.17,.43,.19);
  orb(g,'#1c2333',x,1.01,.94,.13);
  lamp(g,'#fff6dc',x-.02,1.033,.994,.055);
 }
 box(g,palette[2],0,.12,-.82,.19,.23,.39);
 for(let i=0;i<3;i++)ring(g,'#ad8966',0,.08+i*.058,0,1.35);
 return g;
}
function setupWorkshop(){
 const s=new T.Scene();s.background=pigment('#14101a');s.fog=new T.FogExp2(pigment('#1b1115'),.035);
 s.add(new T.HemisphereLight('#ffd3a0','#32233e',.62));
 const light=new T.SpotLight('#ffd6a2',2.1,18,.62,.49,1.4);light.position.set(-2,6,2.1);light.target.position.set(0,1.3,0);s.add(light,light.target);
 box(s,'#554134',0,-.19,0,19,.32,17);
 for(let i=0;i<22;i++){
  box(s,i%2?'#4b3930':'#5e4536',i*.64-7,2.35,-4.5,.61,5,.22);
  box(s,i%2?'#665142':'#584337',i*.64-7,-.012,0,.61,.045,12);
 }
 for(const x of [-5,-2.5,0,2.5,5]){
  box(s,'#372a28',x,4.5,0,.24,.42,13);
  box(s,'#3b2c29',x,2.45,-4.31,.37,5.4,.31);
 }
 for(const x of [-4.2,-3.1,3.4,4.5]){
  const crate=propModel(s,'crate',{},D.random(Math.abs(x)*10));crate.position.set(x,0,-2.4);
  if(x<0){const extra=propModel(s,'crate',{},D.random(17));extra.position.set(x,.79,-2.4)}
 }
 const hanger=group(s,0,3.8,0);
 tube(hanger,V(0,.84,0),V(0,-2.38,0),.071,'#ad8869');
 hanger.rotation.y=.9;
 const parcel=profile.parcel,animal=llamaModel(hanger,parcel.hits>=2?parcel.upgrade:0);
 animal.position.y=-2.49;animal.userData.damage.visible=parcel.hits>0;
 const view=new T.PerspectiveCamera(44,1,.05,50);view.position.set(.05,1.83,6.6);view.lookAt(0,1.61,0);
 const hitter=group(view,1.06,-.7,-2.1);s.add(view);
 const tool=parcel.tool;
 tube(hitter,V(0,-.6,0),V(0,.54,0),.09,tool===3?'#9d6741':'#778a94');
 if(tool===0)box(hitter,'#9eacaf',.12,.56,0,.31,.125,.19,{metal:true});
 if(tool===1){tube(hitter,V(0,.38,0),V(-.21,.63,0),.089,'#a9685d');tube(hitter,V(-.21,.63,0),V(-.33,.62,0),.075,'#a9685d')}
 if(tool===2){box(hitter,'#657382',.04,.54,0,.29,.27,.15,{metal:true});box(hitter,'#231f29',.11,.59,.08,.14,.11,.025)}
 if(tool===3)part(hitter,'cylinder','#c1936e',[.23,.62,.23],[0,.4,0]);
 if(tool===4)part(hitter,'octa','#a6bdcf',[.33,1.13,.14],[0,.52,0],null,{metal:true});
 setScene(s,view);workshop={hanger,animal,hitter,particles:[],lastHit:-100,angle:0,light};
}
function openWorkshop(){
 if(!profile.parcel)return;
 mode='workshop';root.className='sf-workshop';stage.className='';
 setupWorkshop();renderWorkshop();
}
const workshopLines=['Oof! My structural integrity!','You found my weak panel!','Technically I am recyclable.','Please aim away from the fringe.'];
function revealItem(item){
 if(item.kind==='weapon'||item.kind==='trap')grantSchematic(item.id);
 else if(item.kind==='hero'){
  if(profile.owned.includes(item.id)){profile.heroCopies??={};profile.heroCopies[item.id]=(profile.heroCopies[item.id]||0)+1}
  else profile.owned.push(item.id);
 }else if(!profile.survivors.some(card=>card.id===item.id))profile.survivors.push({...item,rarity:D.tiers[item.rarity]});
}
function hitLlama(){
 const parcel=profile.parcel;
 if(!parcel||parcel.hits>=3||now()-workshop.lastHit<.48)return;
 const before=D.copy(profile);
 parcel.hits++;
 if(parcel.hits===3){
  for(const item of parcel.items)revealItem(item);
  parcel.opened=true;
 }
 if(!persist()){profile=before;return}
 workshop.lastHit=now();workshop.angle=.65;workshop.animal.userData.damage.visible=true;
 if(parcel.hits===2&&parcel.upgrade){
  const previous=workshop.animal;
  workshop.hanger.remove(previous);workshop.animal=llamaModel(workshop.hanger,1);workshop.animal.position.y=-2.49;workshop.animal.userData.damage.visible=true;
  if(parcel.upgrade===2)setTimeout(()=>{
   if(mode!=='workshop'||profile.parcel!==parcel||parcel.hits!==2)return;
   workshop.hanger.remove(workshop.animal);workshop.animal=llamaModel(workshop.hanger,2);workshop.animal.position.y=-2.49;workshop.animal.userData.damage.visible=true;
   workshop.light.color.set('#ffcc70');sound(440,900,.48,.085);
  },310);
 }
 const rng=D.random(makeSeed()),count=parcel.hits===3?110:36;
 for(let i=0;i<count;i++){
  const p=box(scene,D.rarityColors[i%6],(rng()-.5)*.6,1.5+rng(),0,.063,.032,.07,{glow:true});
  workshop.particles.push({p,v:V((rng()-.5)*10,1+rng()*4,(rng()-.2)*12),time:.6+rng()});
 }
 sound(130,44,.25,.15,'sawtooth');workshop.quip=D.pick(workshopLines,rng);
 if(parcel.hits===3){workshop.animal.visible=false;setTimeout(()=>{if(mode==='workshop')renderWorkshop()},620)}
 else renderWorkshop();
}
function returnHub(tab=section){workshop=null;root.hidden=false;stage.hidden=false;section=tab;subsection=tab==='Play'?'missions':'';notice='';renderHub()}
function renderWorkshop(){
 const parcel=profile.parcel;
 if(!parcel)return;
 if(parcel.opened){
  workshop.animal.visible=false;
  const table=node('div','','sf-reveal'),cards=node('div','','sf-loot-grid');
  add(table,heading('Reward cards','Flip each card to inspect your loot.'));
  for(const [i,item] of parcel.items.entries()){
   const face=parcel.flips.includes(i),b=button(face?item.name:'◈',()=>{
    if(face)return;
    parcel.flips.push(i);workshop.lastFlip=i;persist();sound(390+i*85,730+i*60,.23,.08);renderWorkshop();
   },{className:'sf-loot-card'});
   if(face&&workshop.lastFlip===i)b.dataset.flipped='true';
   b.style.setProperty('--loot',D.rarityColors[item.rarity]);b.setAttribute('aria-label',face?item.name:'Flip '+D.tiers[item.rarity]+' card');
   b.append(node('small',D.tiers[item.rarity]+(face?' · '+item.kind:'')));
   cards.append(b);
  }
  table.append(cards,button('Return to Homebase',()=>{
   profile.parcel=null;persist();returnHub('Loot Llamas');
  },{className:'sf-primary',disabled:parcel.flips.length<parcel.items.length}));
  root.replaceChildren(table);return;
 }
 const overlay=node('div','','sf-opening');
 const hit=button(['Strike','Strike again','Final strike'][parcel.hits],hitLlama,{className:'sf-primary'});
 const grade=parcel.hits>=2?['Papier-mâché','Silver upgrade','Gold upgrade'][parcel.upgrade]:'Hit '+parcel.hits+' / 3';
 add(overlay,heading(D.llama[parcel.index].name,grade),hit,button('Back to shop',()=>returnHub('Loot Llamas')));
 if(workshop.quip)overlay.append(node('p',workshop.quip,'sf-workshop-quip'));
 root.replaceChildren(overlay);
}
function workshopFrame(dt,time){
 const w=workshop;
 if(!w)return;
 const swing=time-w.lastHit;
 w.hanger.rotation.z=Math.sin(time*2.4)*.042+Math.sin(swing*12)*w.angle*Math.exp(-Math.max(0,swing)*2.8);
 w.hitter.rotation.z=-.25+Math.sin(Math.min(1,Math.max(0,swing)*4)*Math.PI)*2.08;
 w.light.intensity=2.1+Math.max(0,1-swing*2)*.68;
 if(swing>2)w.light.intensity=2.1;
 w.hitter.position.x=1.06-Math.sin(Math.min(1,Math.max(0,swing)*4)*Math.PI)*.95;
 for(const entry of w.particles){
  entry.time-=dt;entry.v.y-=dt*8;entry.p.position.addScaledVector(entry.v,dt);entry.p.rotation.x+=dt*9;
  if(entry.time<=0)scene.remove(entry.p);
 }
 w.particles=w.particles.filter(p=>p.time>0);
}

class SquadRoom {
 constructor(){
  this.peer=null;this.identity=null;this.code='';this.host=false;this.link=null;this.links=new Map();this.connected=false;this.opening=0;this.status='';this.inMission=false;
 }
 get size(){return this.host?1+this.links.size:this.members||2}
 async open(host,entered){
  if(this.connected)return;
  const serial=++this.opening;
  this.peer?.destroy();
  this.status=host?'Creating squad…':'Looking for squad…';renderHub();
  try{
   const code=host?makeInviteCode(12):readInviteCode(entered,12);
   if(!code)throw Error('Enter the 12-character invite code.');
   const identity=await inviteIdentity('stormfront',code);
   await gameRelayReady;if(serial!==this.opening)return;
   this.identity=identity;this.code=code;this.host=host;this.members=2;
   const peer=createDataPeer(host?identity.id:undefined);this.peer=peer;
   this.timeout=setTimeout(()=>{if(serial===this.opening&&!this.connected)this.close('Could not connect to the squad. Verify the code or try again.')},34000);
   peer.on('error',e=>{if(serial===this.opening&&!this.connected&&e?.type!=='peer-unavailable')this.close('Squad transport could not connect.')});
   peer.on('connection',link=>this.attach(link,serial));
   peer.on('open',()=>{
    if(serial!==this.opening)return;
    if(host){clearTimeout(this.timeout);this.connected=true;this.status='';renderHub()}
    else connectRoomPeer(peer,identity.id,link=>this.attach(link,serial),()=>{},()=>{if(!this.connected)this.close('No squad answered that code.')});
   });
  }catch(error){if(serial===this.opening)this.close(error.message)}
 }
 attach(link,serial){
  if(serial!==this.opening||(!this.host&&link.peer!==this.identity.id)){link.close();return}
  const host=this.host,identity=this.identity;
  let nonce='',authenticated=false,challenged=false,verifiedHost=false;
  const timeout=setTimeout(()=>{if(!authenticated)link.close()},10000);
  const answer=async(packet)=>{
   if(serial!==this.opening)return;
   if(!authenticated){
    if(host&&packet.t==='hello'&&typeof packet.nonce==='string'&&/^[0-9a-f]{24}$/.test(packet.nonce)&&!challenged){
     challenged=true;
     if(this.links.size>=3||this.inMission){sendPeerPacket(link,{t:'refuse'});setTimeout(()=>link.close(),250);return}
     const proof=await identity.proof('host',packet.nonce);
     nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
     sendPeerPacket(link,{t:'challenge',nonce,proof,signature:roomSignature()});
    }else if(!host&&packet.t==='challenge'&&!challenged&&typeof packet.nonce==='string'&&/^[0-9a-f]{24}$/.test(packet.nonce)){
     challenged=true;
     if(packet.signature!==roomSignature()){this.close('The host uses a different game build or active mod catalog.');return}
     if(!await identity.verify('host',nonce,packet.proof)){link.close();return}
     verifiedHost=true;
     const proof=await identity.proof('guest',packet.nonce);
     sendPeerPacket(link,{t:'accept',proof,signature:roomSignature()});
    }else if(host&&packet.t==='accept'&&nonce&&packet.signature===roomSignature()){
     if(!await identity.verify('guest',nonce,packet.proof)||this.links.size>=3||this.inMission){link.close();return}
     authenticated=true;clearTimeout(timeout);this.links.set(link.peer,link);
     sendPeerPacket(link,{t:'welcome',size:this.size});
     this.broadcast({t:'members',size:this.size});if(mode==='hub')renderHub();
    }else if(!host&&packet.t==='welcome'&&verifiedHost&&Number.isInteger(packet.size)&&packet.size>=2&&packet.size<=4){
     authenticated=true;this.link=link;this.connected=true;this.members=packet.size;clearTimeout(timeout);clearTimeout(this.timeout);renderHub();
    }else if(!host&&packet.t==='refuse')this.close('The squad is full or already deployed.');
    return;
   }
   if(!host&&packet.t==='members'&&Number.isInteger(packet.size)&&packet.size>=2&&packet.size<=4){this.members=packet.size;if(mode==='hub')renderHub()}
   if(packet.t==='classic'&&classic&&packet.data&&typeof packet.data.type==='string'&&(!host||['pose','action','withdraw'].includes(packet.data.type))){
    for(const fn of this.classicListeners||[])fn(packet.data,host?link.peer:this.identity.id);
   }
   if(!host&&packet.t==='launch'&&mode==='hub'){
    const spec=packet.spec;
    if(!spec||!Object.hasOwn(catalog.missions,spec.id)||!Object.hasOwn(catalog.zones,spec.zone)||
      !Number.isSafeInteger(spec.seed)||!Number.isInteger(spec.levels)||spec.levels<1||spec.levels>4||typeof packet.you!=='string')return;
    this.inMission=true;startClassic(spec,this.classicAdapter(false));
   }
   if(!host&&packet.t==='abort'&&classic){leaveClassic();return}
  };
  peerPackets(link,'t',packet=>{answer(packet).catch(()=>link.close())},()=>link.close());
  const opened=()=>{
   if(!host){
    nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');
    sendPeerPacket(link,{t:'hello',nonce});
   }
  };
  link.on('open',opened);if(link.open)opened();
  link.on('close',()=>{
   clearTimeout(timeout);if(serial!==this.opening||!authenticated)return;
   if(host){
    this.links.delete(link.peer);for(const listener of this.classicListeners||[])listener({type:'left'},link.peer);this.broadcast({t:'members',size:this.size});if(mode==='hub')renderHub();
   }else this.close('The squad leader disconnected.');
  });
 }
 send(packet){sendPeerPacket(this.link,packet)}
 broadcast(packet){for(const link of this.links.values())sendPeerPacket(link,packet)}
 classicAdapter(host){
  const room=this,identity=this.identity.id,id=host?identity:this.peer.id;
  room.classicListeners??=new Set();
  return {id,host,get size(){return room.size},
   get names(){return new Map([[identity,'Leader'],...([...room.links.keys(),id].filter(v=>v!==identity).map(v=>[v,'Operative']))])},
   send(data){if(host)room.broadcast({t:'classic',data});else room.send({t:'classic',data})},
   direct(peer,data){if(host)sendPeerPacket(room.links.get(peer),{t:'classic',data});else room.send({t:'classic',data})},
   subscribe(listener){room.classicListeners.add(listener);return ()=>room.classicListeners.delete(listener)}
  };
 }
 launch(spec){
  this.inMission=true;
  startClassic(spec,this.classicAdapter(true));
  for(const [id,link] of this.links)sendPeerPacket(link,{t:'launch',spec,you:id});
 }
 close(message='',paint=true){
  this.opening++;clearTimeout(this.timeout);this.connected=false;this.inMission=false;
  this.peer?.destroy();this.peer=null;this.link=null;this.links.clear();this.status=message;
  if(classic&&mode==='classic'&&!this.host)leaveClassic();
  if(paint&&mode==='hub')renderHub();
 }
}
function deploy(item,zone,squad){
 try{
  const spec={id:item.def.id,zone:zone.id,levels:Math.round(item.levels||1),
   seed:item.id==='shield'?D.random(D.hash(zone.id).length*3841+zone.min)()*4294967295>>>0:makeSeed(),
   stage:1+(profile.clears[zone.id+':shield']||0)};
  if(squad)rooms.launch(spec);else startClassic(spec);
 }catch(error){recoverOperation(error)}
}
function recoverOperation(error){
 console.error('Stormfront operation startup',error);
 notice='The operation could not start. Please try deploying again.';
 classic=null;rooms.inMission=false;root.hidden=false;stage.hidden=false;renderHub();
}
function startClassic(spec,squad=null){
 let releaseStartup;
 try{
  const zone=catalog.zones[spec.zone],def=catalog.missions[spec.id];
  const usable=profile.items.filter(item=>item&&typeof item.uid==='string'&&Object.hasOwn(catalog.weapons,item.id));
  const selected=usable.find(item=>item.uid===profile.equipped);
  const previousSlots=Array.isArray(profile.fieldSlots)?profile.fieldSlots:[];
  const slotOrder=new Map(previousSlots.map((uid,index)=>[uid,index]));
  const items=usable.sort((a,b)=>Number(b===selected)-Number(a===selected)||Number(b.condition>0)-Number(a.condition>0)||
   (slotOrder.get(a.uid)??D.weaponSlots)-(slotOrder.get(b.uid)??D.weaponSlots))
   .filter(item=>fieldWeapon(item.id).arenaKey&&fieldWeapon(item.id).arenaKey!=='KATANA').slice(0,D.weaponSlots);
  const recorded=items.map(item=>({...D.copy(item),key:fieldWeapon(item.id).arenaKey}));
  const inventory=arena?{
   bag:D.copy(profile.backpack),fort:D.fortStats(profile).stats,capacity:()=>D.capacity(profile),
   list(){return profile.items.flatMap(item=>{
    const def=item&&catalog.weapons[item.id];
    return def?.arenaKey&&def.arenaKey!=='KATANA'?[{...D.copy(item),key:def.arenaKey,name:def.name}]:[];
   })},
   validateTransfer(payload){
    if(!payload||typeof payload!=='object')return null;
    if(!payload.weapon){
     const {name,count}=payload;
     return supplyKeys.includes(name)&&Number.isSafeInteger(count)&&count>=1&&count<=99999?{name,count}:null;
    }
    const {key,condition,clip,card}=payload.weapon;
    const def=typeof key==='string'&&key!=='KATANA'&&catalog.weapons['sd-'+key.toLowerCase()];
    if(!def||def.arenaKey!==key||!card||!Number.isInteger(card.level)||card.level<1||card.level>50||
     !Array.isArray(card.perks)||card.perks.length!==6||!card.perks.every(n=>Number.isInteger(n)&&n>=0&&n<=5)||
     !['','core','beam'].includes(card.path)||card.element!==null&&!Object.hasOwn(colors,card.element)||
     !Number.isInteger(clip)||clip<0||clip>def.mag*3||!Number.isFinite(condition)||condition<0)return null;
    const schematic={level:card.level,perks:[...card.perks],path:card.path,element:card.element,copies:1};
    if(condition>maxDurability(def.id,schematic))return null;
    return {weapon:{key,condition,clip,card:schematic}};
   },
   take(uid){
    const item=profile.items.find(entry=>entry?.uid===uid);
    if(!item)return null;
    const key=catalog.weapons[item.id]?.arenaKey;
    if(!key||key==='KATANA')return null;
    this.recycle(uid);return {key,condition:item.condition,clip:item.clip,card:item.card};
   },
   accept(weapon,refund=false){
    if(!refund&&profile.items.length>=rackLimit())return false;
    const id='sd-'+weapon.key.toLowerCase(),item=craftedWeapon(id,weapon.card);
    Object.assign(item,{condition:weapon.condition,clip:weapon.clip});
    profile.items.push(item);return true;
   },
   addOre(count){this.bag[zone.ore]=(this.bag[zone.ore]||0)+count},

   pickaxe:(profile.upgrades['Pickaxe damage']||0)+Math.floor(campaignLevel()/3)*.18,
   save(bag,guns,equipped){
    if(!bag)return;
    for(const gun of guns){
     if(!gun.record)continue;
     const item=profile.items.find(item=>item.uid===gun.record.uid);
     if(item){item.condition=clamp(gun.condition??item.condition,0,item.max);item.clip=clamp(gun.mag,0,gun.stats.m)}
    }
    profile.fieldSlots=guns.flatMap(gun=>gun.record?[gun.record.uid]:[]);
    if(equipped&&profile.items.some(item=>item.uid===equipped))profile.equipped=equipped;
    profile.backpack=Object.fromEntries(supplyKeys.map(id=>[id,Math.max(0,Math.round(bag[id]||0))]).filter(([,n])=>n>0));
    persist();
   },
   choices(){
    return Object.entries(profile.schematics).flatMap(([id,card])=>{
     const def=catalog.weapons[id];
     return def?.arenaKey&&def.arenaKey!=='KATANA'&&campaignLevel()>=schematicLevel(id)?[[def.arenaKey,{name:def.name}]]:[];
    });
   },
   cost(key){
    const id='sd-'+(key||'').toLowerCase(),card=profile.schematics[id];
    return card?recipeText(recipe(id,card,zone)):'';
   },
   craft(key,bag){
    const id='sd-'+key.toLowerCase(),card=profile.schematics[id];
    if(!card||!catalog.weapons[id]||campaignLevel()<schematicLevel(id)||profile.items.length>=rackLimit()||!payBag(bag,recipe(id,card,zone)))return null;
    const item=craftedWeapon(id,card);profile.items.push(item);this.bag=bag;return {...item,key};
   },
   recycle(uid){
    profile.items=profile.items.filter(item=>item.uid!==uid);
    if(profile.equipped===uid)profile.equipped=null;
    persist();
   },
   loot(key){
    const id='sd-'+key.toLowerCase(),def=catalog.weapons[id];
    if(!def||profile.items.length>=rackLimit())return null;
    const item=craftedWeapon(id,profile.schematics[id]||newSchematic(def));profile.items.push(item);return {...item,key};
   }
  }:null;
  root.hidden=true;stage.hidden=true;mode='classic';
  classic=Stormwatch.mount({region:classicRegions[spec.zone]||'timbervale',mission:classicMissions[spec.id]||(spec.id==='shield'?'defense':'expedition'),
   expedition:!classicMissions[spec.id]&&spec.id!=='shield'?{...def,kind:def.base||def.id,levels:spec.levels,objects:def.objects||[],enemyBases:Object.fromEntries(values(catalog.enemies).map(enemy=>[enemy.id,{tank:'brute',shield:'juggernaut',lob:'mortar',throw:'spitter',explode:'demolisher',phase:'phantasm',beam:'beam',fling:'catapult',charge:'juggernaut'}[enemy.behavior]||'husk']))}:null,
   shield:spec.id==='shield'?{stage:spec.stage}:null,seed:spec.seed,round:spec.seed,
   onStartupCleanup:cleanup=>{releaseStartup=cleanup},
   hub:true,squad,wheel:arena?.wheel,gear:arena?.classicGear(profile.operator||arenaGear?.operator,recorded),inventory,weaponSlots:D.weaponSlots,config:{quality:'med'},leave:leaveClassic,
   complete(win,kills){
    if(!win)return;
    const result={win:true,tier:clamp(1+Math.floor(kills/8),1,6),combat:kills*25};
    const legacy={zone,def,spec,players:new Map(),you:''};
    const before=arenaGear?.rank?.seasonXp||0;
    saveResult(legacy,result);
    return {xp:(arenaGear?.rank?.seasonXp||0)-before,tier:arenaGear?.rank?.passTier,campaignXp:legacy.campaignXp};
   }
  });
  releaseStartup=null;
 }catch(error){
  releaseStartup?.();
  recoverOperation(error);
 }
}
function leaveClassic(){
 const active=classic;classic=null;active?.close();rooms.inMission=false;
 if(rooms.host)rooms.broadcast({t:'abort'});
 returnHub('Play');
}
function saveResult(sim,result){
 if(!result.win)return;
 const tier=result.tier,drop=sim.def.reward||{};
 sim.campaignXp=campaignPayout(sim.zone.id,sim.def.id,tier);
 profile.xp+=drop.xp??(90+tier*82);profile.gold+=drop.gold??(40+tier*22);profile.tokens+=drop.tokens??(12+tier*5);
 profile.evolution+=drop.evolution??(tier+1);profile.bux+=drop.bux??(tier>=4?10:0);
 for(const [id,level] of Object.entries(D.heroLevels))if(campaignLevel()>=level&&!profile.owned.includes(id))profile.owned.push(id);
 if(campaignLevel()>=2&&!profile.schematics.darts)profile.schematics.darts=newSchematic(catalog.traps.darts);
 if(campaignLevel()>=4&&!profile.schematics.gas)profile.schematics.gas=newSchematic(catalog.traps.gas);
 const key=sim.zone.id+':'+sim.def.id;profile.clears[key]=(profile.clears[key]||0)+1;
 const table=keys(catalog.weapons).concat(keys(catalog.traps));
 const rand=D.random(sim.spec.seed^tier);grantSchematic(D.pick(table,rand));
 if(tier>=4)grantSchematic(D.pick(table,rand));
 if(arena&&profileKey===officialKey){
  const id=sim.rewardId||(sim.rewardId=sim.spec.seed+'-'+sim.zone.id+'-'+sim.def.id+'-'+Date.now());
  const rank=arena.earn({id,xp:Math.min(3200,450+tier*210+result.combat*.1),
   seasonXp:Math.min(650,100+tier*62),bux:tier>=4?10:0});
  if(rank){arenaGear.rank=rank;sim.sharedProgress=true;}
 }
 persist();
}
function setupControls(){
 addEventListener('keydown',event=>{
  if(mode==='workshop'&&event.code==='Space'&&event.target===document.body){event.preventDefault();hitLlama()}
  if(mode==='hub'&&section==='Play'&&subsection==='missions'&&event.code==='Escape'){
   event.preventDefault();switchTab('Play');
  }
 });
 addEventListener('pointerdown',event=>{if(mode==='workshop'&&event.target===renderer.domElement)hitLlama()});
 addEventListener('pagehide',()=>{classic?.save?.();rooms?.close('',false)});
}
const gamepadSession={pressed:[],labels:null,device:null,step:0};
function controllerLabels(id){
 if(/playstation|dualshock|dualsense|wireless controller/i.test(id)&&!/xbox/i.test(id))
  return {south:'×',east:'○',west:'□',north:'△',lb:'L1',rb:'R1',rt:'R2',left:'D←',right:'D→',view:'Touch Pad'};
 if(/nintendo|switch|joy-con/i.test(id))
  return {south:'B',east:'A',west:'Y',north:'X',lb:'L',rb:'R',rt:'ZR',left:'D←',right:'D→',view:'−'};
 if(/ouya/i.test(id))
  return {south:'O',east:'A',west:'U',north:'Y',lb:'L1',rb:'R1',rt:'R2',left:'D←',right:'D→',view:'Menu'};
 return {south:'A',east:'B',west:'X',north:'Y',lb:'LB',rb:'RB',rt:'RT',left:'D←',right:'D→',view:'View'};
}
function focusPadMenu(container,dx,dy){
 const targets=[...container.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')]
  .filter(el=>el.getClientRects().length>0);
 if(!targets.length)return;
 const focused=document.activeElement;
 if(!targets.includes(focused)){targets[0].focus();return}
 const center=el=>{const r=el.getBoundingClientRect();return [r.left+r.width*.5,r.top+r.height*.5]};
 const [x,y]=center(focused);
 let best=null,bestCost=Infinity;
 for(const target of targets){
  if(target===focused)continue;
  const [tx,ty]=center(target),length=(tx-x)*dx+(ty-y)*dy,cross=Math.abs((tx-x)*dy-(ty-y)*dx);
  if(length>2&&length+cross*2.35<bestCost){best=target;bestCost=length+cross*2.35}
 }
 (best||targets[(targets.indexOf(focused)+(dx+dy>0?1:targets.length-1))%targets.length]).focus();
}
function pollPad(dt,time){
 let pad;
 try{pad=[...(navigator.getGamepads?.()||[])].find(v=>v?.connected&&v.buttons.length>=9&&v.axes.length>=4)}catch{}
 if(!pad){
   gamepadSession.labels=null;gamepadSession.pressed=[];gamepadSession.device=null;return;
 }
 const pressed=pad.buttons.map(v=>v.pressed||v.value>.55),was=gamepadSession.pressed;
 const hit=i=>pressed[i]&&!was[i];
 gamepadSession.pressed=pressed;
 if(gamepadSession.device!==pad.id){gamepadSession.device=pad.id;gamepadSession.labels=controllerLabels(pad.id)}
 if(mode==='classic')return;
 const snap=(axis,threshold=.18)=>Math.abs(axis)>threshold?axis:0,controls=root;
 if(hit(0)){
  if(controls.contains(document.activeElement)&&document.activeElement.matches('button,a,input'))document.activeElement.click();
  else focusPadMenu(controls,1,0);
 }
 const x=Number(pressed[15]||snap(pad.axes[0],.6)>.6)-Number(pressed[14]||snap(pad.axes[0],.6)<-.6);
 const y=Number(pressed[13]||snap(pad.axes[1],.6)>.6)-Number(pressed[12]||snap(pad.axes[1],.6)<-.6);
 if((x||y)&&time>=gamepadSession.step){
  gamepadSession.step=time+.24;
  if(document.activeElement instanceof HTMLSelectElement&&y){
   const select=document.activeElement;
   select.selectedIndex=clamp(select.selectedIndex+y,0,select.options.length-1);select.dispatchEvent(new Event('change'));
  }else focusPadMenu(controls,x,y);
 }else if(!x&&!y)gamepadSession.step=0;
}
function frame(t){
 const time=t/1000,dt=clamp(time-(loop||time),0,.3);loop=time;
 pollPad(Math.min(.05,dt),time);
 if(mode==='hub'&&scene?.userData.island){
  scene.userData.island.rotation.y=Math.sin(time*.17)*.2;
  scene.userData.vera.position.y=4.2+Math.sin(time*2)*.24;
  scene.userData.vera.rotation.y=time*.4;
 }
 if(mode==='hub'&&scene?.userData.subject)scene.userData.subject.rotation.y=Math.sin(time*.42)*.29;
 if(mode==='workshop')workshopFrame(dt,time);
 if(mode==='hub'&&scene?.userData.stations){
  updateBaseMarkers();
  if(scene.userData.redraw){renderer.render(scene,camera);scene.userData.redraw=false}
 }else if(mode==='hub'&&scene?.userData.regionGlobe){
  if(scene.userData.redraw){renderer.render(scene,camera);scene.userData.redraw=false}
 }else if(mode==='hub'&&scene?.userData.missionMap){
  if(scene.userData.missionMap.dirty){renderer.render(scene,camera);scene.userData.missionMap.dirty=false}
 }else if(mode!=='classic'&&scene&&camera){
  arena?.animateCamos();renderer.render(scene,camera);
 }
 requestAnimationFrame(frame);
}
async function boot(){
 if(!T){root.replaceChildren(node('p','Three.js could not load. Reconnect and reload Stormfront.','sf-boot'));return}
 try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}
 catch{root.replaceChildren(node('p','A WebGL-capable browser is required for Stormfront.','sf-boot'));return}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=T.sRGBEncoding;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
 stage.append(renderer.domElement);
 if(typeof ResizeObserver!=='undefined')missionMapObserver=new ResizeObserver(()=>{if(mode==='hub'&&scene?.userData.missionMap)resize()});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();notice='Graphics context lost. Reload Stormfront if rendering does not recover.'});
 renderer.domElement.addEventListener('webglcontextrestored',resize);
 if(arena)try{packList=D.copy(await arena.packs())}catch{packList=[]}
 rooms=new SquadRoom();loadProfile();renderHub();setupControls();addEventListener('resize',resize);
 requestAnimationFrame(frame);
}
boot();
})();
