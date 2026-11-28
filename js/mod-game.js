/* Stable .sdmod v3 engine adapter. Loaded only into the opaque conversion frame. */
if(window.SD_SCRIPT_MOD&&window.__sdInstallModGame){
 sdGameRuntime=(()=>{
  'use strict';
  const api=window.SpartanMod;
  const freeze=Object.freeze;
  const subscriptions=new Map(), objects=new Map(), types=new Map(), bindings=new Map();
  const botOptions=new WeakMap(), explicitWeapons=new WeakSet(), pendingSpawns=new Set(), riders=new Map();
  const modelCache=new Map(), actorModels=new WeakMap(), actorMotion=new WeakMap();
  const inputKeys=new Set(), rulesOverrides=new Map();
  const limits={scoreLimit:[1,100000],speed:[.05,10],damageMultiplier:[0,20],
   playerDamageMultiplier:[0,20],botDamageMultiplier:[0,20],vehicleDamageMultiplier:[0,20]};
  const mapKeys=['skyColor','fogColor','fogNear','fogFar','ambient'];
  const defaults={speed:1,damageMultiplier:1,playerDamageMultiplier:1,botDamageMultiplier:1,vehicleDamageMultiplier:1};
  let serial=0,starting=false,active=false,elapsed=0,enabled=true,count=null,behaviour='normal',weaponPool=null;
  let playerTeam=null,gravity=null,daytime=null,mapSettings={},lighting=null,cameraSettings={},navDirty=false;
  let openMenu=null,uiLayers=null,match=null;
  const customCamera=new THREE.PerspectiveCamera();
  customCamera.rotation.order='YXZ';

  function number(value,label,min,max){
   if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(label+' must be between '+min+' and '+max+'.');
   return value;
  }
  function natural(value,label,min,max){
   number(value,label,min,max);
   if(!Number.isInteger(value))throw new TypeError(label+' must be an integer.');
   return value;
  }
  function vec(value,label,min=-10000,max=10000){
   if(!Array.isArray(value)||value.length!==3)throw new TypeError(label+' must be an [x, y, z] array.');
   return Array.from(value,n=>number(n,label,min,max));
  }
  function name(value,label,max=80){
   if(typeof value!=='string'||!value.trim()||value.length>max)throw new TypeError(label+' must be nonempty text up to '+max+' characters.');
   return value;
  }
  function color(value,label){
   if(typeof value==='number')return natural(value,label,0,0xffffff);
   if(typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value))return parseInt(value.slice(1),16);
   throw new TypeError(label+' must be a hex color.');
  }
  function scalar(value,label,fallback,min,max){
   return value===undefined?fallback:number(value,label,min,max);
  }
  function running(){
   if(!active||!run||over)throw new Error('This operation requires an active match.');
  }
  function inMatch(){
   if(!active||!run||over)return false;
   return true;
  }
  function safeCall(fn,...args){
   try{
    const result=fn(...args);
    if(result&&typeof result.then==='function')Promise.resolve(result).catch(error=>console.error('[SpartanMod.game]',error));
    return result;
   }catch(error){console.error('[SpartanMod.game]',error)}
  }
  function on(event,fn){
   if(typeof fn!=='function')throw new TypeError('An event callback must be a function.');
   if(!subscriptions.has(event))subscriptions.set(event,new Set());
   const list=subscriptions.get(event);
   list.add(fn);
   return ()=>list.delete(fn);
  }
  function emit(event,...args){
   for(const fn of [...subscriptions.get(event)||[]])safeCall(fn,...args);
  }

  const eventNames=['Start','Tick','Render','PlayerSpawn','PlayerDeath','BotSpawn','Damage','KeyDown','KeyUp','MatchEnd'];
  const events=freeze(Object.fromEntries(eventNames.map(event=>['on'+event,fn=>on(event,fn)])));

  function actorId(actor){
   if(actor===P)return 'player';
   return actor&&Number.isInteger(actor.i)?'bot:'+actor.i:null;
  }
  function actorById(id){
   if(id==='player')return active?P:null;
   if(typeof id!=='string'||!/^bot:\d+$/.test(id))return null;
   return bots.find(bot=>!bot.net&&actorId(bot)===id)||null;
  }
  const alive=actor=>actor===P?!P.dead:!!actor.al;
  const position=actor=>[actor.x||0,actor.y||0,actor.z||0];
  function velocity(actor){
   const ride=riders.get(actorId(actor));
   const record=ride&&objects.get(ride.id);
   if(record)return record.velocity.slice();
   if(actor===P)return [(P.mx||0)+(P.wvx||0),P.vy||0,(P.mz||0)+(P.wvz||0)];
   const motion=actorMotion.get(actor);
   return motion?.velocity.slice()||[0,0,0];
  }
  function writeActorPosition(actor,pos){
   [actor.x,actor.y,actor.z]=pos;
   if(actor===P){P.mt=null;P.jb=0;P.coy=0;P.on=0}
   else if(actor.m)actor.m.position.set(...pos);
  }
  function snapshot(actor){
   const local=actor===P;
   return freeze({id:actorId(actor),type:local?'player':actor.zom?'zombie':'bot',name:local?hname():actor.nm,
    position:freeze(position(actor)),velocity:freeze(velocity(actor)),health:Math.max(0,actor.hp||0),maxHealth:actor.mhp||0,
    team:local?pTeam():actor.team,model:actorModels.get(actor)?.descriptor??null,alive:alive(actor)});
  }
  function objectSnapshot(record){
   return freeze({id:record.id,type:record.type,name:record.name,position:freeze(record.position.slice()),
    velocity:freeze(record.velocity.slice()),health:record.health,maxHealth:record.maxHealth,team:record.team,
    model:record.descriptor,alive:record.health===null||record.health>0});
  }
  function get(id){
   const record=objects.get(id);
   if(record)return objectSnapshot(record);
   const actor=actorById(id);
   return actor?snapshot(actor):null;
  }
  function matches(entity,filter){
   return (!filter.type||filter.type===entity.type)&&(!filter.team||filter.team===entity.team)&&
    (filter.alive===undefined||filter.alive===entity.alive);
  }
  function list(filter={}){
   if(!active)return [];
   return [snapshot(P),...bots.filter(bot=>!bot.net).map(snapshot),...Array.from(objects.values(),objectSnapshot)]
    .filter(entity=>matches(entity,filter));
  }

  function normalizeModel(value){
   if(value===null||value===undefined)return null;
   if(typeof value!=='object')throw new TypeError('model must describe a primitive or packaged OBJ.');
   const primitive=value.primitive??(value.file?'obj':'box');
   if(!['box','sphere','cylinder','cone','obj'].includes(primitive))throw new TypeError('Unknown model primitive.');
   const descriptor={primitive,size:freeze(vec(value.size??[1,1,1],'model size',.02,100)),
    color:color(value.color??0x8fa4ad,'model color')};
   if(primitive==='obj'){
    const file=name(value.file,'OBJ path',240);
    if(!modelCache.has(file)){
     if(modelCache.size>=32)throw new Error('A mod may load up to 32 OBJ models.');
     const parsed=modObjAsset({files:{[file]:api.readText(file)}},file,api.name);
     modelCache.set(file,parsed.positions);
    }
    descriptor.file=file;
   }
   return freeze(descriptor);
  }
  function makeModel(descriptor){
   const {primitive,size,color:paint,file}=descriptor;
   let geometry;
   switch(primitive){
    case 'sphere':geometry=new THREE.SphereGeometry(.5,20,14);break;
    case 'cylinder':geometry=new THREE.CylinderGeometry(.5,.5,1,16);break;
    case 'cone':geometry=new THREE.ConeGeometry(.5,1,16);break;
    case 'obj':{
     geometry=new THREE.BufferGeometry();
     geometry.setAttribute('position',new THREE.Float32BufferAttribute(modelCache.get(file),3));
     geometry.computeBoundingBox();
     const dimensions=geometry.boundingBox.getSize(new THREE.Vector3());
     geometry.center();
     geometry.scale(1/Math.max(.0001,dimensions.x),1/Math.max(.0001,dimensions.y),1/Math.max(.0001,dimensions.z));
     geometry.computeVertexNormals();
     break;
    }
    default:geometry=new THREE.BoxGeometry(1,1,1);
   }
   const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:paint,roughness:.64,metalness:.16}));
   mesh.scale.set(...size);mesh.castShadow=mesh.receiveShadow=true;
   return mesh;
  }
  function dispose(root){
   if(!root)return;
   root.parent?.remove(root);
   root.traverse(node=>{
    if(!node.isMesh)return;
    node.geometry.dispose();
    node.material.dispose();
   });
  }
  function makeObject(type,pos,options={}){
   if(objects.size>=512)throw new Error('A match supports up to 512 scripted world objects.');
   const id=type+':'+ ++serial;
   const health=options.health===undefined?null:number(options.health,'health',1,1000000);
   return {id,type,name:name(options.name??type,'name'),position:vec(pos,'position'),velocity:[0,0,0],
    health,maxHealth:health,team:name(options.team??'neutral','team',32),descriptor:null,root:null};
  }
  function syncObject(record){
   record.root?.position.set(...record.position);
   if(record.collider){
    const [x,y,z]=record.position,[w,h,d]=record.size;
    Object.assign(record.collider,{x0:x-w/2,x1:x+w/2,y0:y-h/2,h:y+h/2,z0:z-d/2,z1:z+d/2});
    indexedBoxes=null;navDirty=true;
   }
  }
  function addVisual(pos,model,options={},type='model'){
   running();
   const record=makeObject(type,pos,options);
   record.descriptor=normalizeModel(model??{});
   record.root=makeModel(record.descriptor);
   record.root.rotation.y=scalar(options.heading,'heading',0,-10000,10000);
   if(options.velocity)record.velocity=vec(options.velocity,'velocity',-250,250);
   S.add(record.root);objects.set(record.id,record);syncObject(record);
   return record.id;
  }
  function addCollider(pos,size){
   running();
   const record=makeObject('collider',pos);
   record.size=vec(size,'collider size',.025,150);
   record.collider={};bx.push(record.collider);
   objects.set(record.id,record);syncObject(record);
   return record.id;
  }
  function addLight(pos,options={}){
   running();
   const record=makeObject('light',pos);
   record.root=new THREE.PointLight(color(options.color??0xffffff,'light color'),
    scalar(options.intensity,'intensity',1,0,50),scalar(options.distance,'distance',18,.1,300),2);
   S.add(record.root);objects.set(record.id,record);syncObject(record);
   return record.id;
  }
  function replaceActorModel(actor,descriptor){
   const prior=actorModels.get(actor);
   const next=descriptor?makeModel(descriptor):null;
   if(prior)dispose(prior.mesh);
   actorModels.delete(actor);
   if(actor===P){
    if(next){S.add(next);actorModels.set(actor,{descriptor,mesh:next});next.visible=false}
    return;
   }
   if(prior)for(const [child,visible] of prior.visibility)child.visible=visible;
   if(next){
    const visibility=new Map(actor.m.children.map(child=>[child,child.visible]));
    for(const child of visibility.keys())child.visible=false;
    actor.m.add(next);
    next.position.y=descriptor.size[1]/2;
    actorModels.set(actor,{descriptor,mesh:next,visibility});
   }
  }
  function setModel(id,model){
   running();
   const record=objects.get(id);
   if(record){
    if(!['prop','model','vehicle'].includes(record.type))return false;
    const descriptor=normalizeModel(model);
    if(!descriptor&&record.type!=='vehicle')throw new TypeError('A world model needs a descriptor.');
    replaceObjectModel(record,descriptor);
    return true;
   }
   const actor=actorById(id);
   if(!actor)return false;
   replaceActorModel(actor,normalizeModel(model));
   return true;
  }
  function setPosition(id,value){
   running();
   const pos=vec(value,'position'),record=objects.get(id);
   if(record){record.position=pos;syncObject(record);return true}
   const actor=actorById(id);
   if(!actor)return false;
   if(riders.has(id))exit(id);
   writeActorPosition(actor,pos);
   return true;
  }
  function setVelocity(id,value){
   running();
   const v=vec(value,'velocity',-250,250),record=objects.get(id);
   if(record){
    if(record.collider)return false;
    record.velocity=v;
    if(record.type==='vehicle'){
     record.speed=v[0]*Math.sin(record.heading)+v[2]*Math.cos(record.heading);
     record.vertical=v[1];
    }
    return true;
   }
   const actor=actorById(id);
   if(!actor||riders.has(id))return false;
   if(actor===P){[P.mx,P.vy,P.mz]=v;P.wvx=P.wvz=0;return true}
   actorMotion.set(actor,{velocity:v,position:position(actor),manual:true});
   return true;
  }
  function setHealth(id,value){
   running();
   number(value,'health',0,1000000);
   const record=objects.get(id);
   if(record){
    if(record.maxHealth===null)return false;
    record.health=Math.min(record.maxHealth,value);
    if(record.health===0)despawn(id);
    return true;
   }
   const actor=actorById(id);
   if(!actor||!alive(actor))return false;
   actor.hp=Math.min(actor.mhp,value);
   if(actor.hp===0){
    if(actor===P)die();
    else if(actor.zom)removeBot(id);
    else{
     actor.al=0;actor.rt=2.5;
     if(actor.rig)bodyFall(actor);else actor.m.visible=false;
    }
   }
   return true;
  }
  function setMaxHealth(id,value,refill=false){
   running();
   number(value,'max health',1,1000000);
   const record=objects.get(id);
   if(record){
    if(record.maxHealth===null)return false;
    record.maxHealth=value;
    record.health=refill?value:Math.min(value,record.health);
    return true;
   }
   const actor=actorById(id);
   if(!actor||!alive(actor))return false;
   actor.mhp=value;
   actor.hp=refill?value:Math.min(value,actor.hp);
   return true;
  }
  function setTeam(id,value){
   running();
   const team=name(value,'team',32),record=objects.get(id);
   if(record){record.team=team;return true}
   const actor=actorById(id);
   if(!actor)return false;
   if(actor===P){
    if(teamMode()&&!['A','B'].includes(team))throw new TypeError('Team modes use A or B for the local player.');
    playerTeam=team;
   }else{
    actor.team=team;
    if(actor.rig&&['A','B'].includes(team))markOperatorTeam(actor.rig,team);
   }
   return true;
  }

  function weaponKey(value){
   if(typeof value!=='string')throw new TypeError('A weapon must be a stock ID or @custom ID.');
   const k=value.startsWith('@')?'mod:'+value.slice(1):value;
   if(!hasOwn(W,k))throw new TypeError('Unknown weapon '+value+'.');
   return k;
  }
  function parseBehaviour(value){
   if(typeof value!=='function'&&!['normal','passive','idle'].includes(value))throw new TypeError('Unknown bot behaviour.');
   return value;
  }
  function parseWeaponPool(value){
   if(!Array.isArray(value)||!value.length||value.length>32)throw new TypeError('Weapons must be a list of 1–32 weapon IDs.');
   return value.map(weaponKey);
  }
  function spawnBot(type,pos,options={}){
   running();
   if(type==='zombie'&&mode!=='Zombies')throw new Error('Zombie NPCs require a Zombies map.');
   if(bots.filter(b=>!b.net).length>=64)throw new Error('The local NPC limit is 64.');
   const [x,y,z]=vec(pos,'position');
   const hp=options.health===undefined?null:number(options.health,'health',1,1000000);
   const difficulty=scalar(options.difficulty,'difficulty',1,.1,5);
   const team=options.team===undefined?null:name(options.team,'team',32);
   const botName=options.name===undefined?null:name(options.name,'name');
   const setting=options.behaviour===undefined?null:parseBehaviour(options.behaviour);
   const weapon=options.weapon===undefined?null:weaponKey(options.weapon);
   if(!['bot','zombie'].includes(type))throw new TypeError('NPCs must be bots or zombies.');
   const shield=options.shield===undefined?null:number(options.shield,'shield',0,10000);
   const descriptor=normalizeModel(options.model);
   const bot=type==='zombie'?mkZombie(x,z,options.brute===true):addBot(hp??50,difficulty,undefined,true);
   if(type==='bot'){
    bot.team=team??(teamMode()?(pTeam()==='A'?'B':'A'):'e');
    spawn(bot);
    setHeld(bot,weapon??(weaponPool?weaponPool[bot.i%weaponPool.length]:BOTGUNS[bot.i%BOTGUNS.length]));
   }else if(team)bot.team=team;
   if(hp!==null)bot.hp=bot.mhp=hp;
   if(shield!==null)bot.sh=bot.msh=shield;
   if(weapon&&!bot.zom)explicitWeapons.add(bot);
   if(botName)bot.nm=botName;
   if(setting)botOptions.set(bot,setting);
   if(descriptor)replaceActorModel(bot,descriptor);
   if(bot.rig&&['A','B'].includes(bot.team))markOperatorTeam(bot.rig,bot.team);
   writeActorPosition(bot,[x,y,z]);
   if(type==='zombie')bot.rise=0;
   return actorId(bot);
  }
  function removeBot(id){
   const bot=actorById(id);
   if(!bot||bot===P)return false;
   if(riders.has(id))exit(id);
   if(bot.cf){bot.cf.st='dropped';bot.cf.dt=0;bot.cf.by=null;bot.cf=null}
   const model=actorModels.get(bot);
   if(model)dispose(model.mesh);
   S.remove(bot.m);
   bot.al=0;pendingSpawns.delete(bot);
   bots.splice(bots.indexOf(bot),1);
   return true;
  }
  function reconcileBots(){
   if(count===null)return;
   const natives=bots.filter(bot=>!bot.net&&!bot.practice);
   for(const bot of natives.filter(b=>!b.al))removeBot(actorId(bot));
   const living=natives.filter(bot=>bot.al);
   for(const bot of living.slice(count))removeBot(actorId(bot));
   for(let i=living.length;i<count;i++){
    const [x,z]=spawnPt(7);
    const y=MAPS[sel.map].groundHeight?.(x,z)??0;
    spawnBot(mode==='Zombies'?'zombie':'bot',[x,y,z]);
   }
  }
  function setEnabled(value){
   if(typeof value!=='boolean')throw new TypeError('enabled must be a boolean.');
   enabled=value;
  }
  function setCount(value){
   count=value===null?null:natural(value,'count',0,64);
   if(inMatch())reconcileBots();
  }
  const behaviorOf=bot=>botOptions.get(bot)??behaviour;
  function botSpawn(bot){
   actorMotion.delete(bot);
   if(!bot.net)pendingSpawns.add(bot);
  }
  function flushSpawns(){
   const pending=[...pendingSpawns];
   pendingSpawns.clear();
   for(const bot of pending){
    if(!bots.includes(bot)||!bot.al)continue;
    if(weaponPool&&!bot.zom&&!explicitWeapons.has(bot))setHeld(bot,weaponPool[bot.i%weaponPool.length]);
    emit('BotSpawn',snapshot(bot));
   }
  }

  function removeObject(id){
   const record=objects.get(id);
   if(!record)return false;
   if(record.seats)for(const occupant of [...record.seats])if(occupant)exit(occupant);
   if(record.collider){removeCollisionBoxes(new Set([record.collider]));navDirty=true}
   dispose(record.root);objects.delete(id);
   return true;
  }
  function despawn(id){
   running();
   return removeObject(id)||removeBot(id);
  }
  function spawnEntity(type,pos,options={}){
   switch(type){
    case 'bot':case 'zombie':return spawnBot(type,pos,options);
    case 'model':case 'prop':return addVisual(pos,options.model,options,type);
    case 'collider':return addCollider(pos,options.size);
    case 'light':return addLight(pos,options);
    case 'vehicle':return spawnVehicle(options.vehicle,pos,options);
    default:throw new TypeError('Unknown entity type '+type+'.');
   }
  }
  const propertyAccessors={};
  for(const [property,write] of Object.entries({Position:setPosition,Velocity:setVelocity,Health:setHealth,Team:setTeam,Model:setModel})){
   const key=property.toLowerCase();
   propertyAccessors['get'+property]=id=>get(id)?.[key]??null;
   propertyAccessors['set'+property]=write;
  }
  const entities=freeze({spawn:spawnEntity,despawn,list,get,setMaxHealth,...propertyAccessors});
  const botApi=freeze({
   list:()=>list().filter(e=>e.type==='bot'||e.type==='zombie'),
   spawn:(pos,options={})=>spawnBot(options.type??(mode==='Zombies'?'zombie':'bot'),pos,options),
   remove:id=>{running();return removeBot(id)},setEnabled,isEnabled:()=>enabled,setCount,getCount:()=>count,
   setBehaviour(id,value){
    const next=parseBehaviour(value);
    if(id===null){behaviour=next;return true}
    const bot=actorById(id);
    if(!bot||bot===P)return false;
    botOptions.set(bot,next);return true;
   },
   setWeapons(id,value){
    const pool=parseWeaponPool(value);
    if(id===null){weaponPool=pool;for(const bot of bots)if(!bot.net&&!bot.zom&&!explicitWeapons.has(bot))setHeld(bot,pool[bot.i%pool.length]);return true}
    const bot=actorById(id);
    if(!bot||bot===P||bot.zom)return false;
    setHeld(bot,pool[bot.i%pool.length]);explicitWeapons.add(bot);return true;
   }
  });

  function registerVehicle(definition){
   if(typeof definition!=='object'||definition===null)throw new TypeError('A vehicle definition is required.');
   const id=name(definition.id,'vehicle ID',48);
   if(!/^[a-z][a-z0-9-]*$/.test(id)||types.has(id))throw new Error('Invalid or duplicate vehicle ID '+id+'.');
   if(types.size>=64)throw new Error('A mod may register up to 64 vehicles.');
   const input=definition.stats??{};
   const size=freeze(vec(input.size??[1.85,1.3,3.6],'vehicle size',.5,12));
   const maxSeats=natural(input.seats??2,'seats',1,8);
   const stats=freeze({size,seats:maxSeats,health:scalar(input.health,'health',450,1,1000000),
    topSpeed:scalar(input.topSpeed,'top speed',22,1,80),acceleration:scalar(input.acceleration,'acceleration',11,1,80),
    reverseSpeed:scalar(input.reverseSpeed,'reverse speed',7,1,35),steering:scalar(input.steering,'steering',2.35,.1,8),
    traction:scalar(input.traction,'traction',5,.15,20),brake:scalar(input.brake,'brake',18,1,80),
    crashDamage:scalar(input.crashDamage,'crash damage',3,0,40)});
   types.set(id,freeze({id,name:name(definition.name,'vehicle name'),model:normalizeModel(definition.model),stats}));
   return id;
  }
  function vehicleVisual(record){
   if(record.descriptor){
    const mesh=makeModel(record.descriptor);mesh.position.y=record.descriptor.size[1]/2;
    return mesh;
   }
   const model=new THREE.Group(),[w,h,d]=record.definition.stats.size;
   const part=(primitive,size,paint,x,y,z)=>{
    const mesh=makeModel({primitive,size,color:paint});
    mesh.position.set(x,y,z);model.add(mesh);return mesh;
   };
   const bike=w<1.2;
   const paint=record.paint;
   part('box',[w*.84,h*.35,d*.85],paint,0,h*.41,0);
   part('box',[w*.73,h*.35,d*(bike?.28:.47)],0x203745,0,h*.72,-d*.08);
   part('box',[w*.76,h*.10,d*(bike?.28:.44)],paint,0,h*.94,-d*.09);
   for(const axle of [-1,1]){
    for(const side of bike?[0]:[-1,1]){
     const tire=part('cylinder',[h*.54,w*(bike?.34:.19),h*.54],0x131a1e,
      side*w*.46,h*.27,axle*d*.33);
     tire.rotation.z=Math.PI/2;
    }
    part('box',[bike?w*.43:w*.65,h*.11,.06],axle===1?0xe1f9ec:0xe54731,0,h*.42,axle*d*.435);
   }
   return model;
  }
  function replaceObjectModel(record,descriptor){
   const root=record.root;
   if(record.type==='vehicle'){
    record.descriptor=descriptor;
    dispose(record.visual);
    record.visual=vehicleVisual(record);root.add(record.visual);
   }else{
    const mesh=makeModel(descriptor);
    mesh.rotation.copy(root.rotation);S.add(mesh);dispose(root);
    record.root=mesh;record.descriptor=descriptor;
    if(record.collider)record.size=descriptor.size;
    syncObject(record);
   }
  }
  function spawnVehicle(type,pos,options={}){
   running();
   const definition=types.get(type);
   if(!definition)throw new TypeError('Unknown vehicle '+type+'.');
   if([...objects.values()].filter(record=>record.type==='vehicle').length>=32)throw new Error('A match supports up to 32 vehicles.');
   const record=makeObject('vehicle',pos,{...options,name:options.name??definition.name,health:options.health??definition.stats.health});
   record.definition=definition;
   record.descriptor=options.model===undefined?definition.model:normalizeModel(options.model);
   record.heading=scalar(options.heading,'heading',0,-10000,10000);
   record.paint=color(options.color??0xb9612a,'vehicle paint');
   record.seats=Array(definition.stats.seats).fill(null);
   record.size=definition.stats.size;
   record.root=new THREE.Group();
   record.speed=0;record.vertical=0;record.crashAt=-1;
   record.visual=vehicleVisual(record);record.root.add(record.visual);
   record.root.rotation.y=record.heading;syncObject(record);
   S.add(record.root);objects.set(record.id,record);
   return record.id;
  }
  function vehicleSnapshot(record){
   return freeze({...objectSnapshot(record),type:'vehicle',vehicle:record.definition.id,
    heading:record.heading,speed:record.speed,seats:freeze(record.seats.slice())});
  }
  function moveRider(record,actor,seat){
   const [x,y,z]=record.position,[width,height,length]=record.size;
   const side=seat===0?-.22:seat%2?.22:-.22;
   const ahead=seat<=1?.08:-.22-Math.floor((seat-2)/2)*.09;
   const cos=Math.cos(record.heading),sin=Math.sin(record.heading);
   writeActorPosition(actor,[x+side*width*cos+ahead*length*sin,y+height*.48,z-side*width*sin+ahead*length*cos]);
  }
  function enter(id,seat=0,occupant='player'){
   running();
   const record=objects.get(id),actor=actorById(occupant);
   if(!record?.seats||!actor||!alive(actor)||!Number.isInteger(seat)||seat<0||seat>=record.seats.length||
      record.seats[seat]!==null||riders.has(occupant))return false;
   const p=position(actor),r=record.position;
   if(Math.hypot(p[0]-r[0],p[1]-r[1],p[2]-r[2])>Math.max(4,record.size[2]*.7))return false;
   record.seats[seat]=occupant;riders.set(occupant,{id,seat});
   moveRider(record,actor,seat);
   return true;
  }
  function safeExit(record,actor){
   const [x,y,z]=record.position,heading=record.heading;
   for(const angle of [Math.PI/2,-Math.PI/2,Math.PI,0]){
    const direction=heading+angle,dist=(Math.abs(Math.sin(angle))>.5?record.size[0]:record.size[2])*.5+.85;
    const start={x,y:y+.1,z};
    const tx=x+Math.sin(direction)*dist,tz=z+Math.cos(direction)*dist;
    mv(start,tx-x,tz-z,.43);
    if(Math.hypot(start.x-tx,start.z-tz)>.25)continue;
    writeActorPosition(actor,[start.x,gnd(start,y+2),start.z]);
    return;
   }
   writeActorPosition(actor,[x,y+record.size[1],z]);
  }
  function exit(occupant='player'){
   const ride=riders.get(occupant);
   if(!ride)return false;
   riders.delete(occupant);
   const record=objects.get(ride.id),actor=actorById(occupant);
   if(!record)return true;
   record.seats[ride.seat]=null;
   if(actor&&alive(actor))safeExit(record,actor);
   if(actor===P)P.mx=P.mz=P.vy=0;
   return true;
  }
  function interact(){
   if(!inMatch()||paused||P.dead||jupiterIntroActive()||zQuestCutActive())return false;
   if(riders.has('player'))return exit();
   let nearest=null,range=3.2;
   for(const record of objects.values()){
    if(record.type!=='vehicle'||record.seats.every(Boolean))continue;
    const [x,y,z]=record.position,d=Math.hypot(P.x-x,(P.y-y)*1.2,P.z-z);
    if(d<range){range=d;nearest=record}
   }
   return nearest?enter(nearest.id,nearest.seats.indexOf(null)):false;
  }
  function vehicleHit(id,amount,source=null,reason='weapon'){
   const record=objects.get(id);
   if(!record||record.type!=='vehicle')return false;
   const d=damage(record,amount,source,null,reason);
   if(d<=0||objects.get(id)!==record)return false;
   record.health-=d;
   if(record.health>0)return true;
   burst(V(...record.position).add(V(0,.65,0)),34,0xffa646,8,1,.18);
   removeObject(id);
   return true;
  }
  function vehicleBox(record){
   const [w,h,d]=record.size,[x,y,z]=record.position;
   return {x0:-w/2,x1:w/2,z0:-d/2,z1:d/2,y0:0,h,x,y,z};
  }
  function vehicleRay(origin,direction,wall){
   let closest=wall,result=null;
   for(const record of objects.values()){
    if(record.type!=='vehicle'||record.seats.includes('player'))continue;
    const box=vehicleBox(record),cos=Math.cos(record.heading),sin=Math.sin(record.heading);
    const x=origin.x-box.x,z=origin.z-box.z;
    const local=V(x*cos-z*sin,origin.y-box.y,x*sin+z*cos);
    const ray=V(direction.x*cos-direction.z*sin,direction.y,direction.x*sin+direction.z*cos);
    const distance=rb(local,ray,box);
    if(distance<closest){closest=distance;result={id:record.id,distance}}
   }
   return result;
  }
  function vehicleBlast(p,blast){
   for(const record of [...objects.values()]){
    if(record.type!=='vehicle')continue;
    const [x,y,z]=record.position,d=Math.hypot(x-p.x,y+.7-p.y,z-p.z);
    if(d<blast.R)vehicleHit(record.id,blast.d*(1-d/blast.R),P,'explosion');
   }
  }
  function keyVolley(rays,weapon){
   for(const {o,ray,wall} of rays){
    const hit=vehicleRay(o,ray,wall);
    if(hit)vehicleHit(hit.id,weapon.d*zmul(weapon),P,'weapon');
   }
  }
  function axis(positive,negative){return Number(positive.some(code=>key[code]))-Number(negative.some(code=>key[code]))}
  function updateVehicle(record,dt){
   const driver=record.seats[0],isLocal=driver==='player'&&!P.dead;
   const throttle=isLocal?axis(['KeyW','ArrowUp'],['KeyS','ArrowDown']):0;
   const steering=isLocal?axis(['KeyA','ArrowLeft'],['KeyD','ArrowRight']):0;
   const braking=isLocal&&key.Space;
   const stats=record.definition.stats,staying=Math.exp(-dt*(driver?.9:2.9));
   const deceleration=braking?stats.brake:throttle&&Math.sign(record.speed)!==throttle?stats.brake*.8:stats.acceleration;
   if(throttle&&!braking)record.speed=cl(record.speed+throttle*deceleration*dt,-stats.reverseSpeed,stats.topSpeed);
   else if(braking)record.speed-=Math.sign(record.speed)*Math.min(Math.abs(record.speed),deceleration*dt);
   else record.speed*=staying;
   record.heading+=steering*stats.steering*dt*cl(record.speed/4,-1,1)/(1+Math.abs(record.speed)/45);
   const [x,y,z]=record.position,body={x,y,z},direction=V(Math.sin(record.heading),0,Math.cos(record.heading));
   const blend=1-Math.exp(-dt*stats.traction);
   const vx=THREE.MathUtils.lerp(record.velocity[0],direction.x*record.speed,blend);
   const vz=THREE.MathUtils.lerp(record.velocity[2],direction.z*record.speed,blend);
   const halfWidth=stats.size[0]*.48,halfBody=Math.max(0,stats.size[2]*.41-halfWidth*.5);
   mv(body,vx*dt,vz*dt,halfWidth);
   for(const side of [-1,1]){
    const ax=direction.x*halfBody*side,az=direction.z*halfBody*side;
    const end={x:body.x+ax,y:body.y,z:body.z+az};
    mv(end,0,0,halfWidth);
    body.x=end.x-ax;body.z=end.z-az;
   }
   for(const other of objects.values()){
    if(other===record||other.type!=='vehicle'||Math.abs(other.position[1]-y)>stats.size[1])continue;
    const d=Math.hypot(body.x-other.position[0],body.z-other.position[2]);
    if(d<halfWidth+other.size[0]*.48){body.x=x;body.z=z;break}
   }
   const blocked=Math.hypot(body.x-x-vx*dt,body.z-z-vz*dt);
   if(blocked>.035&&blocked>Math.hypot(vx,vz)*dt*.34){
    if(Math.abs(record.speed)>5&&blocked>.09&&elapsed>=record.crashAt){
     record.crashAt=elapsed+.35;
     vehicleHit(record.id,(Math.abs(record.speed)-4)*stats.crashDamage,null,'collision');
     if(!objects.has(record.id))return;
    }
    record.speed*=.38;
   }
   const floor=gnd(body,y+.65);
   record.vertical=Math.max(-50,record.vertical-(gravity??20)*dt);
   body.y=Math.max(floor,y+record.vertical*dt);
   if(body.y===floor)record.vertical=0;
   record.position=[body.x,body.y,body.z];
   record.velocity=[(body.x-x)/dt,record.vertical,(body.z-z)/dt];
   record.root.rotation.y=record.heading;syncObject(record);
   for(const [seat,id] of record.seats.entries()){
    if(!id)continue;
    const actor=actorById(id);
    if(actor&&alive(actor))moveRider(record,actor,seat);
    else exit(id);
   }
  }
  const vehicles=freeze({
   registerVehicle,spawn:spawnVehicle,enter,exit:id=>{running();return exit(id)},
   get:id=>{const record=objects.get(id);return record?.seats?vehicleSnapshot(record):null},
   list:()=>[...objects.values()].filter(record=>record.type==='vehicle').map(vehicleSnapshot),
   types:()=>[...types.values()],getSeat:(id='player')=>{const ride=riders.get(id);return ride?freeze({...ride}):null},
   damage:(id,value)=>{running();return vehicleHit(id,number(value,'damage',0,1000000),null,'script')},
   remove:id=>{running();return objects.get(id)?.seats?removeObject(id):false}
  });
  registerVehicle({id:'sports-car',name:'Sports Car',stats:{size:[1.95,1.24,3.8],topSpeed:30,acceleration:16,health:340}});
  registerVehicle({id:'truck',name:'Utility Truck',stats:{size:[2.3,1.92,4.8],seats:4,topSpeed:18,health:720,acceleration:8}});
  registerVehicle({id:'bike',name:'Motorbike',stats:{size:[.83,1.43,2.35],seats:1,topSpeed:26,acceleration:19,steering:3.15,health:180}});

  function damage(target,amount,source=null,weapon=null,reason='weapon'){
   if(!Number.isFinite(amount)||amount<=0)return 0;
   const type=target===P?'player':target.type==='vehicle'?'vehicle':'bot';
   const multiplier=readRule('damageMultiplier')*readRule(type+'DamageMultiplier');
   let adjusted=amount*multiplier;
   const id=target===P?'player':type==='vehicle'?target.id:actorId(target);
   for(const fn of [...subscriptions.get('Damage')||[]]){
    const result=safeCall(fn,freeze({target:id,source:actorId(source),weapon,reason,amount:adjusted}));
    if(typeof result==='number'&&Number.isFinite(result))adjusted=cl(result,0,1000000);
   }
   return adjusted;
  }
  function damagePlayer(amount,source){
   const ride=riders.get('player');
   if(ride){vehicleHit(ride.id,amount,source,'occupant');return 0}
   return damage(P,amount,source,source?.wk??null,source?'actor':'environment');
  }
  function readRule(field){
   if(!hasOwn(limits,field))throw new TypeError('Unknown rule '+field+'.');
   if(rulesOverrides.has(field))return rulesOverrides.get(field);
   if(field==='scoreLimit')return modRules.scoreLimit??({
    'Capture the Flag':3,Hardpoint:250,Domination:350,'Kill Confirmed':KC_WIN,'Team Deathmatch':50,Slayer:20
   })[mode]??null;
   return defaults[field];
  }
  const rules=freeze({
   get:readRule,
   set(field,value){
    if(!hasOwn(limits,field))throw new TypeError('Unknown rule '+field+'.');
    if(value===null){rulesOverrides.delete(field);return}
    const validate=field==='scoreLimit'?natural:number;
    rulesOverrides.set(field,validate(value,field,...limits[field]));
   },
   list:()=>freeze(Object.fromEntries(Object.keys(limits).map(field=>[field,readRule(field)])))
  });

  function applyLighting(){
   if(!lighting||!active||!run)return;
   const hour=daytime;
   if(hour===null){
    sun.intensity=lighting.sun;hemi.intensity=lighting.hemi;
    if(skyM)skyM.visible=lighting.skyVisible;
   }else{
    const daylight=cl(Math.sin((hour-6)*Math.PI/12),0,1);
    sun.intensity=.08+daylight*lighting.sun;
    hemi.intensity=.19+daylight*.8*lighting.hemi;
    if(skyM)skyM.visible=false;
   }
   if(mapSettings.ambient!==undefined)hemi.intensity=mapSettings.ambient;
   const dayColor=hour===null?null:new THREE.Color(0x080f24).lerp(new THREE.Color(0xa3cce5),cl(Math.sin((hour-6)*Math.PI/12)*1.65,0,1));
   if(S.background?.isColor){
    if(mapSettings.skyColor!==undefined)S.background.setHex(mapSettings.skyColor);
    else if(dayColor)S.background.copy(dayColor);
    else if(lighting.background)S.background.copy(lighting.background);
   }
   if(skyM&&(hour!==null||mapSettings.skyColor!==undefined))skyM.visible=false;
   if(S.fog){
    if(mapSettings.fogColor!==undefined)S.fog.color.setHex(mapSettings.fogColor);
    else if(dayColor)S.fog.color.copy(dayColor);
    else if(lighting.fog)S.fog.color.copy(lighting.fog);
    if(S.fog.isFog){
     S.fog.near=mapSettings.fogNear??lighting.near;
     S.fog.far=mapSettings.fogFar??lighting.far;
    }
   }
  }
  function setMapSettings(settings){
   if(settings===null){mapSettings={};applyLighting();return}
   if(typeof settings!=='object'||Array.isArray(settings))throw new TypeError('Map settings must be an object.');
   const next={...mapSettings};
   for(const [field,value] of Object.entries(settings)){
    if(!mapKeys.includes(field))throw new TypeError('Unknown map setting '+field+'.');
    if(value===null){delete next[field];continue}
    next[field]=field.endsWith('Color')?color(value,field):number(value,field,0,field==='ambient'?8:5000);
   }
   if((next.fogNear??lighting?.near??0)>=(next.fogFar??lighting?.far??300))throw new RangeError('fogFar must be greater than fogNear.');
   mapSettings=next;applyLighting();
  }
  function isAreaClear(pos,size,heading=0){
   running();
   const [x,y,z]=vec(pos,'position'),[w,h,d]=vec(size,'area size',.025,150);
   number(heading,'heading',-10000,10000);
   const c=Math.cos(heading),s=Math.sin(heading),halfX=w/2,halfZ=d/2;
   const boundX=Math.abs(c)*halfX+Math.abs(s)*halfZ,boundZ=Math.abs(s)*halfX+Math.abs(c)*halfZ;
   if(Math.abs(x)+boundX>H||Math.abs(z)+boundZ>H)return false;
   function overlaps(x0,x1,y0,y1,z0,z1){
    if(y+h<=y0+.025||y>=y1-.025||x+boundX<=x0||x-boundX>=x1||z+boundZ<=z0||z-boundZ>=z1)return false;
    const dx=(x0+x1)*.5-x,dz=(z0+z1)*.5-z,ex=(x1-x0)*.5,ez=(z1-z0)*.5;
    return Math.abs(c*dx-s*dz)<halfX+Math.abs(c)*ex+Math.abs(s)*ez&&
     Math.abs(s*dx+c*dz)<halfZ+Math.abs(s)*ex+Math.abs(c)*ez;
   }
   for(const box of bx)if(!box.collisionRemoved&&overlaps(box.x0,box.x1,box.y0||0,box.h,box.z0,box.z1))return false;
   for(const record of objects.values()){
    if(record.type!=='vehicle')continue;
    const [vx,vy,vz]=record.position,[width,height,depth]=record.size;
    const radius=Math.hypot(width,depth)*.5;
    if(overlaps(vx-radius,vx+radius,vy,vy+height,vz-radius,vz+radius))return false;
   }
   return true;
  }
  const world=freeze({
   addCollider,addModel:(pos,model,options)=>addVisual(pos,model,options),addLight,
   addProp(pos,model,options={}){
    const id=addVisual(pos,model,options,'prop');
    if(options.collidable===true){
     const record=objects.get(id);
     record.size=record.descriptor.size;record.collider={};bx.push(record.collider);syncObject(record);
    }
    return id;
   },
   remove:id=>{running();return removeObject(id)},
   removeCollider:id=>{running();return objects.get(id)?.type==='collider'&&removeObject(id)},
   removeLight:id=>{running();return objects.get(id)?.type==='light'&&removeObject(id)},
   removeModel:id=>{running();return objects.get(id)?.type==='model'&&removeObject(id)},
   removeProp:id=>{running();return objects.get(id)?.type==='prop'&&removeObject(id)},
   getGravity:()=>gravity??20,setGravity(value){gravity=value===null?null:number(value,'gravity',0,200)},
   getTimeOfDay:()=>daytime,setTimeOfDay(value){daytime=value===null?null:number(value,'time of day',0,24)%24;applyLighting()},
   getMapSettings:()=>freeze({...mapSettings}),
   setMapSettings,isAreaClear,
   getMap:()=>freeze({id:sel.map,name:MAPS[sel.map]?.modName||sel.map,mode:active?mode:sel.mode,halfSize:H,
    zombies:!!MAPS[sel.map]?.zm}),
   groundHeight(x,z,y=10000){
    running();number(x,'x',-10000,10000);number(z,'z',-10000,10000);number(y,'y',-10000,10000);
    return gnd({x,y,z},y);
   }
  });

  function getInput(){
   return freeze({keys:freeze([...inputKeys]),fire:!!trig,aim:!!ST.adsIn,paused:!!paused,
    pointerLocked:document.pointerLockElement===R.domElement});
  }
  function getWeapons(){
   return wp.map((weapon,index)=>freeze({id:weapon.k,magazine:weapon.mag,reserve:weapon.res,
    maxMagazine:weapon.m,equipped:index===cur,packAPunch:weapon.pap||0}));
  }
  function setWeapons(weapons){
   running();
   if(P.dead)throw new Error('The player must be alive to change weapons.');
   if(!Array.isArray(weapons)||!weapons.length||weapons.length>8)throw new TypeError('Set between 1 and 8 weapons.');
   const next=weapons.map(item=>{
    const k=weaponKey(typeof item==='string'?item:item.id),weapon=zGunObj(k);
    if(typeof item==='string')return weapon;
    if(item.magazine!==undefined)weapon.mag=natural(item.magazine,'magazine',0,weapon.m);
    if(item.reserve!==undefined)weapon.res=natural(item.reserve,'reserve',0,100000);
    return weapon;
   });
   wp=next;cur=0;rel=0;
   if(mode==='Zombies')zq.cap=Math.max(zq.cap,next.length);
   setGun();
   return getWeapons();
  }
  function applyCamera(settings){
   if(settings===null){cameraSettings={};return}
   const next={...cameraSettings};
   for(const field of ['position','target']){
    if(settings[field]!==undefined)next[field]=settings[field]===null?null:vec(settings[field],field);
   }
   if(settings.fov!==undefined)next.fov=settings.fov===null?null:number(settings.fov,'fov',15,140);
   if(settings.yaw!==undefined)yaw=number(settings.yaw,'yaw',-10000,10000);
   if(settings.pitch!==undefined)pitch=number(settings.pitch,'pitch',-1.5,1.5);
   if(next.position&&next.target&&next.position.every((n,i)=>n===next.target[i]))throw new RangeError('Camera position and target must differ.');
   cameraSettings=next;
  }
  let displayedCamera=C;
  const player=freeze({
   id:'player',get:()=>get('player'),
   getPosition:()=>get('player')?.position??null,teleport:pos=>setPosition('player',pos),
   getHealth:()=>get('player')?.health??null,setHealth:value=>setHealth('player',value),
   setMaxHealth:(value,refill)=>setMaxHealth('player',value,refill),
   getWeapons,setWeapons,
   equipWeapon(value){running();const k=weaponKey(value),i=wp.findIndex(w=>w.k===k);if(i<0)return false;swap(i);return true},
   getCamera:()=>freeze({position:freeze(displayedCamera.position.toArray()),yaw,pitch,fov:cameraSettings.fov??displayedCamera.fov}),
   setCamera(settings){running();applyCamera(settings)},
   getInput
  });

  function makeButton(label,callback){
   if(typeof callback!=='function')throw new TypeError('A button needs a callback.');
   const button=document.createElement('button');
   button.type='button';button.textContent=name(label,'button label');button.className='sd-game-button';
   button.addEventListener('pointerdown',event=>event.stopPropagation());
   button.addEventListener('touchstart',event=>event.stopPropagation(),{passive:true});
   button.addEventListener('mousedown',event=>event.stopPropagation());
   button.addEventListener('mouseup',event=>event.stopPropagation());
   button.addEventListener('click',()=>safeCall(callback));
   return button;
  }
  function layers(){
   if(uiLayers)return uiLayers;
   const hud=document.createElement('div'),pause=document.createElement('div'),toast=document.createElement('div');
   hud.className='sd-game-hud';hud.hidden=!inMatch();pause.className='sd-game-pause';toast.className='sd-game-toast';
   toast.hidden=true;toast.setAttribute('role','status');
   document.body.append(hud,toast);
   $('#pause .card').append(pause);
   uiLayers={hud,pause,toast};
   return uiLayers;
  }
  function addButton(location,label,callback){
   const button=makeButton(label,callback);
   layers()[location].append(button);
   return ()=>button.remove();
  }
  function addMenu(options){
   const dialog=document.createElement('dialog');
   dialog.className='sd-game-menu';dialog.setAttribute('aria-label',name(options.title,'menu title'));
   const title=document.createElement('h2'),body=document.createElement('div');
   title.textContent=options.title;body.className='sd-game-menu-items';
   dialog.append(title);
   if(options.description){
    const description=document.createElement('p');description.textContent=name(options.description,'menu description',500);dialog.append(description);
   }
   dialog.append(body,makeButton(options.closeLabel??'Resume game',()=>controller.close()));
   document.body.append(dialog);
   let previouslyPaused=false,removed=false;
   const controller=freeze({
    get isOpen(){return dialog.open},
    open(){
     if(removed||!inMatch()||dialog.open)return false;
     if(openMenu)return false;
     previouslyPaused=!!paused;openMenu=controller;
     paused=1;trig=fresh=0;inputKeys.clear();for(const code in key)key[code]=0;
     dialog.showModal();document.exitPointerLock?.();
     return true;
    },
    close(){
     if(!dialog.open)return false;
     dialog.close();openMenu=null;
     if(!previouslyPaused&&inMatch()){showPause();lockPtr()}
     return true;
    },
    toggle(){return dialog.open?controller.close():controller.open()},
    addButton(label,callback){const button=makeButton(label,callback);body.append(button);return ()=>button.remove()},
    remove(){controller.close();removed=true;dialog.remove()}
   });
   dialog.addEventListener('cancel',event=>{event.preventDefault();controller.close()});
   for(const item of options.items||[])controller.addButton(item.label,item.onClick);
   return controller;
  }
  const declarations=api.engine.keybinds;
  function keyCode(value){
   const keyName=hasOwn(declarations,value)?declarations[value].key:value;
   if(typeof keyName!=='string'||!/^[A-Za-z0-9][A-Za-z0-9]{0,31}$/.test(keyName))throw new TypeError('Use a keybind ID or a KeyboardEvent.code.');
   if(/^[a-z]$/i.test(keyName))return 'Key'+keyName.toUpperCase();
   if(/^\d$/.test(keyName))return 'Digit'+keyName;
   return keyName;
  }
  function addKeybind(value,callback){
   if(typeof callback!=='function')throw new TypeError('A keybind callback must be a function.');
   const code=keyCode(value);
   if(!bindings.has(code))bindings.set(code,new Set());
   const list=bindings.get(code);list.add(callback);
   return ()=>list.delete(callback);
  }
  let toastTimer=0;
  const ui=freeze({
   keybinds:declarations,addMenu,addKeybind,addHudButton:(label,callback)=>addButton('hud',label,callback),
   addPauseMenuEntry:(label,callback)=>addButton('pause',label,callback),
   showToast(message,duration=2.5){
    const text=name(message,'toast',500),ms=number(duration,'duration',.2,60)*1000;
    const toast=layers().toast;
    toast.textContent=text;toast.hidden=false;
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,ms);
   }
  });
  function keyEvent(event,down){
   if(!inMatch()||event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
   const code=event.code;
   if(down)inputKeys.add(code);else inputKeys.delete(code);
   const payload=freeze({code,key:event.key,repeat:!!event.repeat,alt:!!event.altKey,
    ctrl:!!event.ctrlKey,shift:!!event.shiftKey,meta:!!event.metaKey});
   emit(down?'KeyDown':'KeyUp',payload);
   const handlers=bindings.get(code);
   if(handlers?.size){
    event.preventDefault();event.stopImmediatePropagation();
    if(down&&!event.repeat)for(const fn of [...handlers])safeCall(fn,payload);
   }
  }
  addEventListener('keydown',event=>keyEvent(event,true),true);
  addEventListener('keyup',event=>keyEvent(event,false),true);
  addEventListener('blur',()=>inputKeys.clear());

  function context(){return freeze({...match,time:elapsed})}
  function clearWorld(){
   if(active&&!starting)end('Abandoned',0);
   if(openMenu)openMenu.close();
   for(const id of [...objects.keys()])removeObject(id);
   for(const actor of [P,...bots]){
    const model=actorModels.get(actor);
    if(model)dispose(model.mesh);
    actorModels.delete(actor);actorMotion.delete(actor);
   }
   riders.clear();pendingSpawns.clear();inputKeys.clear();navDirty=false;
   if(!starting){active=false;lighting=null}
   if(uiLayers){uiLayers.hud.hidden=true;uiLayers.toast.hidden=true}
  }
  function begin(){
   active=false;starting=true;elapsed=0;playerTeam=null;cameraSettings={};
  }
  function start(){
   starting=false;active=true;match={mode,map:sel.map};
   lighting={sun:sun.intensity,hemi:hemi.intensity,skyVisible:!!skyM?.visible,
    background:S.background?.isColor?S.background.clone():null,fog:S.fog?.color.clone(),
    near:S.fog?.near??0,far:S.fog?.far??300};
   applyLighting();reconcileBots();
   if(uiLayers)uiLayers.hud.hidden=false;
   emit('Start',context());playerSpawn();flushSpawns();
  }
  function playerSpawn(){if(active)emit('PlayerSpawn',snapshot(P))}
  function playerDeath(){
   if(!active)return;
   exit('player');emit('PlayerDeath',snapshot(P));
  }
  function end(result,score){
   if(!active)return;
   if(uiLayers)uiLayers.hud.hidden=true;
   if(openMenu)openMenu.close();
   exit('player');emit('MatchEnd',freeze({...context(),result,score}));
   active=false;
  }
  function updateActorMotion(dt){
   for(const bot of bots){
    if(bot.net||!bot.al||riders.has(actorId(bot)))continue;
    const p=position(bot),last=actorMotion.get(bot);
    const preset=behaviorOf(bot);
    if(last?.manual){
     mv(bot,last.velocity[0]*dt,last.velocity[2]*dt,.43);
     bot.y=Math.max(gnd(bot,bot.y+.1),bot.y+last.velocity[1]*dt);
     bot.m.position.set(bot.x,bot.y,bot.z);last.position=position(bot);
    }else{
     const v=last?p.map((coordinate,i)=>(coordinate-last.position[i])/dt):[0,0,0];
     actorMotion.set(bot,{velocity:v,position:p});
    }
    if(enabled&&typeof preset==='function')safeCall(preset,snapshot(bot),dt);
   }
  }
  function tick(dt){
   if(!active||dt<=0)return;
   elapsed+=dt;
   if(navDirty){
    if(mode==='Zombies')zGrid();else navBuild();
    navDirty=false;
   }
   reconcileBots();flushSpawns();
   emit('Tick',dt,context());
   if(!inMatch())return;
   updateActorMotion(dt);
   for(const record of [...objects.values()]){
    if(record.type==='vehicle')updateVehicle(record,dt);
    else if(record.velocity.some(Boolean)){
     for(let i=0;i<3;i++)record.position[i]+=record.velocity[i]*dt;
     syncObject(record);
    }
   }
  }
  function drive(){
   const ride=riders.get('player');
   if(!ride)return false;
   const record=objects.get(ride.id);
   if(!record)return false;
   P.mx=record.velocity[0];P.mz=record.velocity[2];P.vy=record.vertical;
   P.spr=0;P.on=1;tg=null;
   return true;
  }
  function render(dt){
   if(!inMatch()){displayedCamera=C;return null}
   emit('Render',freeze({...context(),dt,camera:player.getCamera()}));
   const ride=riders.get('player'),record=ride&&objects.get(ride.id);
   const playerModel=actorModels.get(P);
   const usingCamera=!!record||!!cameraSettings.position||!!cameraSettings.target;
   if(playerModel){playerModel.mesh.position.set(P.x,P.y+playerModel.descriptor.size[1]/2,P.z);playerModel.mesh.visible=usingCamera&&!P.dead}
   if(!usingCamera){displayedCamera=C;return null}
   customCamera.position.copy(C.position);customCamera.quaternion.copy(C.quaternion);
   customCamera.fov=C.fov;customCamera.aspect=C.aspect;customCamera.near=C.near;customCamera.far=C.far;
   if(record){
    const [x,y,z]=record.position,length=record.size[2];
    const focus=V(x,y+record.size[1]*.58,z),delta=V(-Math.sin(record.heading)*(length+3),3.3,-Math.cos(record.heading)*(length+3));
    const distance=delta.length();delta.divideScalar(distance);
    const clear=cl(castW(focus,delta,distance)-.25,.2,distance);
    customCamera.position.copy(focus).addScaledVector(delta,clear);
    customCamera.lookAt(focus.clone().add(V(0,.45,0)));
   }
   if(cameraSettings.position)customCamera.position.set(...cameraSettings.position);
   if(cameraSettings.target)customCamera.lookAt(...cameraSettings.target);
   if(cameraSettings.fov!=null)customCamera.fov=cameraSettings.fov;
   customCamera.updateProjectionMatrix();displayedCamera=customCamera;
   return customCamera;
  }

  const exposed=freeze({version:1,events,entities,bots:botApi,player,vehicles,world,rules,ui});
  window.__sdInstallModGame(exposed);
  return freeze({begin,start,tick,render,end,clearWorld,playerSpawn,playerDeath,botSpawn,
   damage,damagePlayer,vehicleRay,vehicleHit,keyVolley,vehicleBlast,drive,interact,
   fov:()=>inMatch()?cameraSettings.fov:null,scoreLimit:()=>rulesOverrides.get('scoreLimit'),speed:()=>readRule('speed'),gravity:()=>gravity,
   team:()=>playerTeam,uiOpen:()=>!!openMenu,aiDisabled:()=>!enabled,
   managedZombies:()=>!enabled||count!==null,managedBots:()=>!enabled||count!==null,
   aiIdle:bot=>riders.has(actorId(bot))||actorMotion.get(bot)?.manual||behaviorOf(bot)==='idle'||typeof behaviorOf(bot)==='function',
   aiPassive:bot=>behaviorOf(bot)==='passive'
  });
 })();
}

if(sdGameRuntime){
 const startScriptedMatch=startGame;
 startGame=function(){
  const result=startScriptedMatch.apply(this,arguments);
  if(run&&!over)sdGameRuntime.start();
  return result;
 };
}
