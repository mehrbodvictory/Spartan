/* Spartan Drill Mod Kit. Packs are validated data. The match runs in a fresh game instance. */
let modRules = {};
const modPlaylists=new Map();
let activeMod=null,modLobbyLoadout=null;
const modModeKey=id=>'mod-mode:'+id;
const modKit = (() => {
 const bases = ['Slayer','Team Deathmatch','Capture the Flag','Domination','Hardpoint','Kill Confirmed','Time Attack','Survival','Zombies','One in the Chamber','Gun Game','Objective Course'];
 const surfaces = ['brick','stucco','plank','concrete','asphalt','grass','shingle','tile','metal','sand','rust','cobble','glass','glow'];
 const weaponBases = ['AR','SMG','BR','SG','MG','MP','VA','BP','KTS','RD','HC','OH','SW','LT','PD','MVR','TRB','TUR','VMP','CT','CY','SN','RG','RL','TEA'];
 const id = {type:'string',pattern:'^[a-z][a-z0-9-]{0,31}$'};
 const text = maxLength => ({type:'string',minLength:1,maxLength,pattern:'^[^\\u0000-\\u001f]+$'});
 const num = (minimum,maximum,type='number') => ({type,minimum,maximum});
 const int = (a,b) => num(a,b,'integer');
 const choice = (...values) => ({enum:values});
 const obj = (properties,required=[]) => ({type:'object',additionalProperties:false,required,properties});
 const arr = (items,minItems,maxItems) => ({type:'array',items,minItems,maxItems});
 const tuple = (...prefixItems) => ({type:'array',prefixItems,minItems:prefixItems.length,maxItems:prefixItems.length});
 const color = {type:'string',pattern:'^#[0-9a-fA-F]{6}$'};
 const at = tuple(num(-96,96),num(-96,96));
 const xyz = tuple(num(-3,3),num(-3,3),num(-3,3));
 const named = {id,name:{...text(60),pattern:"^[^<>&\"'\\u0000-\\u001f]+$"},description:text(240)};
 const weapon = {type:'string',pattern:'^(?:@[a-z][a-z0-9-]{0,31}|[A-Z][A-Z0-9]{0,11})$'};
 const prop = {
  at, size:tuple(num(.1,80),num(.1,36),num(.1,80)), elevation:num(0,32), color,
  material:choice(...surfaces)
 };
 const schema = {
  $schema:'https://json-schema.org/draft/2020-12/schema',title:'Spartan Drill .sdmod v1',
  ...obj({
   format:choice('spartan-drill-mod'),version:choice(1),...named,author:text(60),
   weapons:arr(obj({
    ...named,base:choice(...weaponBases),damage:num(1,300),rpm:int(20,1800),magazine:int(1,150),
    reserves:int(0,30),reloadSeconds:num(.2,12),spread:num(0,.25),recoil:num(0,16),
    pellets:int(1,16),automatic:{type:'boolean'},explosion:obj({radius:num(.5,18),damage:num(1,300)},['radius','damage']),
    color,model:obj({
     parts:arr(obj({shape:choice('box','cylinder','sphere','cone'),at:xyz,size:tuple(num(.005,2),num(.005,2),num(.005,2)),rotation:tuple(num(-6.3,6.3),num(-6.3,6.3),num(-6.3,6.3)),color,magazine:{type:'boolean'}},['shape','at','size','color']),1,96),
     grip:xyz,foregrip:xyz,muzzle:xyz
    },['parts','grip','foregrip','muzzle'])
   },['id','name','base']),0,16),
   maps:arr(obj({
    ...named,kind:choice('arena','zombies'),halfSize:int(14,96),sky:color,ground:color,wall:color,
    surface:choice(...surfaces.slice(0,-2)),night:{type:'boolean'},
    boxes:arr(obj(prop,['at','size','color']),0,340),
    props:arr(obj({...prop,shape:choice('box','cylinder','sphere','cone')},['at','size','color']),0,220),
    lights:arr(obj({at,height:num(.5,30),color,intensity:num(.1,5),radius:num(2,36)},['at','height','color','intensity','radius']),0,8),
    spawns:arr(at,1,32),blueSpawns:arr(at,1,16),redSpawns:arr(at,1,16),
    flags:tuple(at,at),zones:tuple(at,at,at),
    zombieSpawns:arr(obj({at,room:int(0,32)},['at']),1,36),
    doors:arr(obj({at,name:text(40),size:tuple(num(.5,8),num(.5,8)),cost:int(0,25000),rooms:tuple(int(0,32),int(0,32))},['at','name','size','cost','rooms']),0,16),
    stations:arr(obj({at,kind:choice('rev','vit','quick','dbl','stam','mule','crypt','pap','box','wall','ammo'),facing:choice('N','S','E','W'),weapon,cost:int(0,25000)},['at','kind']),0,32)
   },['id','name','kind','halfSize','boxes']),0,8),
   playlists:arr(obj({
    ...named,base:choice(...bases),map:text(60),primary:weapon,secondary:weapon,
    botWeapons:arr(weapon,1,16),weaponLadder:arr(weapon,1,32),bots:int(0,12),scoreLimit:int(1,999),timeSeconds:int(5,3600),
    waveLimit:int(1,100),health:int(1,500),shield:int(0,300),startPoints:int(0,50000),
    infiniteAmmo:{type:'boolean'},
    deathLimit:int(1,50),
    objectives:arr(obj({
     name:text(70),kind:choice('reach','hold','interact','eliminate'),at,radius:num(1.25,14),
     seconds:num(.5,120),count:int(1,100),reward:choice('heal','refill','none')
    },['name','kind']),1,20)
   },['id','name','base','map']),1,24)
  },['format','version','id','name','playlists'])
 };
 const example = {
  format:'spartan-drill-mod',version:1,id:'signal-yard',name:'Signal Yard',author:'Spartan Drill',
  description:'A rain-dark relay station with a custom carbine and three ways to play.',
  weapons:[{id:'relay-carbine',name:'Relay Carbine',base:'MVR',damage:38,rpm:560,magazine:28,reloadSeconds:2,
   color:'#7598a8',model:{grip:[0,-.08,-.08],foregrip:[0,-.08,.38],muzzle:[0,.02,.73],parts:[
    {shape:'box',at:[0,0,.05],size:[.095,.12,.43],color:'#7598a8'},
    {shape:'box',at:[0,.01,.39],size:[.106,.092,.31],color:'#344656'},
    {shape:'cylinder',at:[0,.02,.62],size:[.045,.22,.045],rotation:[1.571,0,0],color:'#263745'},
    {shape:'box',at:[0,.025,.71],size:[.065,.056,.055],color:'#263745'},
    {shape:'box',at:[0,-.13,.12],size:[.069,.18,.1],rotation:[-.19,0,0],color:'#263745',magazine:true},
    {shape:'box',at:[0,-.09,-.09],size:[.055,.13,.075],rotation:[.28,0,0],color:'#23303b'},
    {shape:'box',at:[0,-.015,-.27],size:[.07,.1,.23],color:'#344656'},
    {shape:'box',at:[0,.086,-.11],size:[.048,.038,.035],color:'#263745'},
    {shape:'box',at:[0,.083,.48],size:[.032,.039,.035],color:'#e0aa68'}
   ]}}],
  maps:[{id:'yard',name:'Signal Yard',kind:'arena',halfSize:24,sky:'#586c85',ground:'#61707a',wall:'#566272',surface:'concrete',
   boxes:[
    {at:[0,0],size:[6,4,7],color:'#718092',material:'metal'},
    {at:[-10,-7],size:[6,2.6,2],color:'#a67752',material:'metal'},
    {at:[10,7],size:[6,2.6,2],color:'#a67752',material:'metal'},
    {at:[-9,9],size:[3,1.5,4],color:'#778b93',material:'concrete'},
    {at:[9,-9],size:[3,1.5,4],color:'#778b93',material:'concrete'},
    {at:[0,12],size:[5,2.3,1],color:'#647479',material:'metal'},
    {at:[0,-12],size:[5,2.3,1],color:'#647479',material:'metal'}
   ],props:[{at:[0,0],size:[.55,6,.55],elevation:4,color:'#374e60',shape:'cylinder'},
    {at:[0,0],size:[.95,.35,.95],elevation:10,color:'#f3b462',shape:'sphere',material:'glow'}],
   blueSpawns:[[-17,-7],[-16,5]],redSpawns:[[17,7],[16,-5]],zones:[[-12,0],[0,6],[12,0]]}],
  playlists:[
   {id:'relay-rush',name:'Relay Rush',description:'Six bots. First to eight eliminations or the lead at 75 seconds.',base:'Slayer',map:'@yard',primary:'@relay-carbine',bots:6,scoreLimit:8,timeSeconds:75},
   {id:'relay-control',name:'Relay Control',description:'Fight for three zones with matching carbine loadouts.',base:'Domination',map:'@yard',primary:'@relay-carbine',botWeapons:['@relay-carbine'],bots:7,scoreLimit:60,timeSeconds:150},
   {id:'relay-route',name:'Relay Route',description:'Activate the terminal, then hold the extraction point.',base:'Objective Course',map:'@yard',primary:'@relay-carbine',bots:0,timeSeconds:60,
    objectives:[{name:'Activate the terminal',kind:'interact',at:[-12,0]},{name:'Hold the extraction point',kind:'hold',at:[12,0],seconds:4}]}
  ]
 };
 const fail = (path,reason) => {throw new Error(path+' — '+reason)};
 function check(value,rule,path){
  if(rule.enum){if(!rule.enum.includes(value))fail(path,'use '+rule.enum.join(', '));return}
  if(rule.type==='object'){
   if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)fail(path,'expected an object');
   for(const key of rule.required)if(!hasOwn(value,key))fail(path+'.'+key,'required field');
   for(const key of Object.keys(value)){
    if(!hasOwn(rule.properties,key))fail(path,'unknown field '+key);
    check(value[key],rule.properties[key],path+'.'+key);
   }
  }else if(rule.type==='array'){
   if(!Array.isArray(value)||value.length<rule.minItems||value.length>rule.maxItems)fail(path,'expected '+rule.minItems+'–'+rule.maxItems+' items');
   value.forEach((item,i)=>check(item,rule.prefixItems?.[i]||rule.items,path+'['+i+']'));
  }else if(rule.type==='string'){
   if(typeof value!=='string'||(rule.minLength&&value.trim().length<rule.minLength)||value.length>rule.maxLength||(rule.pattern&&!new RegExp(rule.pattern,'u').test(value)))fail(path,'invalid text or format');
  }else if(rule.type==='boolean'){
   if(typeof value!=='boolean')fail(path,'expected true or false');
  }else if(!Number.isFinite(value)||value<rule.minimum||value>rule.maximum||(rule.type==='integer'&&!Number.isInteger(value))){
   fail(path,'expected '+rule.type+' from '+rule.minimum+' to '+rule.maximum);
  }
 }
 function validate(pack){
  check(pack,schema,'mod');
  const sections = {};
  for(const group of ['weapons','maps','playlists']){
   sections[group]=new Map();
   (pack[group]||[]).forEach((item,i)=>{
    if(sections[group].has(item.id))fail('mod.'+group+'['+i+'].id','duplicate ID '+item.id);
    sections[group].set(item.id,item);
   });
  }
  function checkWeapon(value,path){
   if(value.startsWith('@')? !sections.weapons.has(value.slice(1)): !weaponBases.includes(value))fail(path,'unknown weapon '+value);
  }
  for(const map of sections.maps.values()){
   const path='maps.'+map.id;
   const checkPoint=(point,field,margin=1)=>{
    if(point.some(v=>Math.abs(v)>map.halfSize-margin))fail(path+'.'+field,'position is outside the map');
   };
   for(const field of ['spawns','blueSpawns','redSpawns','flags','zones']){
    for(const point of map[field]||[])checkPoint(point,field,2);
   }
   for(const field of ['boxes','props','lights','doors','stations','zombieSpawns']){
    for(const item of map[field]||[])checkPoint(item.at,field,field==='boxes'||field==='props'?0:2);
   }
   if(map.kind==='zombies'&&(!map.spawns||!map.zombieSpawns?.some(spawn=>!spawn.room)))fail(path,'Zombies maps need a player spawn and at least one zombie spawn in room 0');
   if(map.kind==='arena'&&(map.zombieSpawns||map.doors||map.stations))fail(path,'Zombies fields require kind "zombies"');
   for(const point of [...(map.spawns||[]),...(map.blueSpawns||[]),...(map.redSpawns||[]),...(map.zombieSpawns||[]).map(spawn=>spawn.at)]){
    if(map.boxes.some(box=>(box.elevation||0)<2&&Math.abs(point[0]-box.at[0])<box.size[0]/2+.45&&Math.abs(point[1]-box.at[1])<box.size[2]/2+.45))fail(path,'spawn at '+point.join(', ')+' is blocked by a solid box');
   }
   const singles=new Set();
   for(const station of map.stations||[]){
    if(!['box','wall','ammo'].includes(station.kind)){
     if(singles.has(station.kind))fail(path+'.stations','duplicate '+station.kind+' station');
     singles.add(station.kind);
    }
    if(station.kind==='wall'&&!station.weapon)fail(path+'.stations','wall buys need a weapon');
    if(station.kind!=='wall'&&station.weapon)fail(path+'.stations.weapon','use with wall buys');
    if(station.cost!==undefined&&station.kind!=='wall')fail(path+'.stations.cost','only wall buys support custom prices');
    if(station.weapon)checkWeapon(station.weapon,path+'.stations.weapon');
   }
   const rooms=new Set([0]);
   for(let i=0;i<(map.doors?.length||0);i++){
    for(const {rooms:[a,b]} of map.doors){
     if(rooms.has(a)||rooms.has(b)){rooms.add(a);rooms.add(b)}
    }
   }
   if(map.zombieSpawns?.some(spawn=>!rooms.has(spawn.room||0)))fail(path+'.zombieSpawns','each spawn room must connect to room 0 through doors');
  }
  for(const game of sections.playlists.values()){
   const path='playlists.'+game.id, zombies=game.base==='Zombies';
   const custom=game.map.startsWith('@'),map=custom?sections.maps.get(game.map.slice(1)):hasOwn(MAPS,game.map)&&MAPS[game.map];
   if(!map)fail(path+'.map','unknown map '+game.map);
   if((custom?map.kind==='zombies':!!map.zm)!==zombies)fail(path+'.map','map kind must match the game mode');
   if(game.waveLimit!==undefined&&!zombies&&game.base!=='Survival')fail(path+'.waveLimit','use with Survival or Zombies');
   if(game.scoreLimit!==undefined&&(zombies||['Survival','One in the Chamber','Time Attack','Gun Game','Objective Course'].includes(game.base)))fail(path+'.scoreLimit','use with a score-based mode');
   if(game.startPoints!==undefined&&!zombies)fail(path+'.startPoints','use with Zombies');
   if(game.base==='Objective Course'){
    if(!game.objectives)fail(path+'.objectives','an Objective Course needs at least one objective');
    for(const [index,objective] of game.objectives.entries()){
     const step=path+'.objectives['+index+']';
     if(objective.kind==='eliminate'){
      if(!objective.count||objective.at||objective.radius||objective.seconds||game.bots===0)fail(step,'eliminate needs a count and at least one bot');
     }else{
      if(!objective.at||objective.count||(objective.kind==='hold')!==(objective.seconds!==undefined))fail(step,'use a position and optional radius; hold also needs seconds');
      if(objective.at.some(v=>Math.abs(v)>((custom?map.halfSize:map.H)-2)))fail(step+'.at','position is outside the map');
      if(custom&&map.boxes.some(box=>(box.elevation||0)<2&&Math.abs(objective.at[0]-box.at[0])<box.size[0]/2&&Math.abs(objective.at[1]-box.at[1])<box.size[2]/2))fail(step+'.at','position is inside a solid box');
     }
    }
   }else if(game.objectives||game.deathLimit!==undefined)fail(path,'objectives and deathLimit require Objective Course');
   if(game.weaponLadder&&game.base!=='Gun Game')fail(path+'.weaponLadder','use with Gun Game');
   if(game.base==='Gun Game'&&(game.primary||game.secondary))fail(path,'use weaponLadder to set the Gun Game loadout');
   if(game.base==='One in the Chamber'&&['primary','secondary','botWeapons','infiniteAmmo','health','shield'].some(key=>hasOwn(game,key)))fail(path,'One in the Chamber uses its own fixed weapons, health and ammo');
   if(zombies&&(game.bots!==undefined||game.botWeapons))fail(path,'Zombies uses waves instead of arena bots');
   for(const weapon of [game.primary,game.secondary,...(game.botWeapons||[]),...(game.weaponLadder||[])].filter(Boolean))checkWeapon(weapon,path+'.weapon');
  }
  return pack;
 }
 return {schema,example,validate};
})();

function modWeaponKey(id){
 return id?.startsWith('@')?'mod:'+id.slice(1):id;
}
function modColor(value){
 return parseInt(value.slice(1),16);
}
function installModWeapons(weapons){
 const geometries={box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(.5,.5,1,16),
  sphere:new THREE.SphereGeometry(.5,16,10),cone:new THREE.ConeGeometry(.5,1,16)};
 for(const def of weapons){
  const key='mod:'+def.id,base=W[def.base],gun={...base,n:def.name};
  for(const [input,field] of Object.entries({damage:'d',magazine:'m',reserves:'rs',reloadSeconds:'rl',spread:'sp',recoil:'rc',pellets:'pel',automatic:'au'})){
   if(def[input]!==undefined)gun[field]=def[input];
  }
  if(def.rpm)gun.r=60/def.rpm;
  if(def.color)gun.col=modColor(def.color);
  if(def.explosion||gun.ex){
   const explosion=def.explosion;
   gun.ex={...gun.ex,R:explosion?.radius??gun.ex.R,d:explosion?.damage??gun.ex.d,imp:gun.ex?.imp||0,w:key,c:gun.ex?.c||gun.col};
  }
  W[key]=gun;
  WG[key]=[...(WG[def.base]||WG.AR)];WG[key][1]=gun.col;
  if(GS[def.base])GS[key]=GS[def.base];
  RLK[key]=RLK[def.base]||'mag';
  BOTGUNS.push(key);
  (SEC.includes(def.base)?SEC:PRI).push(key);
  CLS[key]=CLS[def.base]||'CUSTOM WEAPON';
  if(def.description)WDS[key]=esc(def.description);
  const model=def.model;
  MODELS[key]=(group,finish)=>{
    if(!model)return modelWeapon(def.base,finish||(def.color?new THREE.MeshLambertMaterial({color:gun.col}):null),group);
   const mags=[];
   for(const part of model.parts){
    const mesh=new THREE.Mesh(geometries[part.shape],finish||new THREE.MeshLambertMaterial({color:modColor(part.color)}));
    mesh.position.set(...part.at);mesh.scale.set(...part.size);
    if(part.rotation)mesh.rotation.set(...part.rotation);
    mesh.castShadow=true;group.add(mesh);
    if(part.magazine)mags.push(mesh);
   }
   group.userData.authored=true;
   group.userData.a={r:model.grip,l:model.foregrip,m:model.muzzle};
   group.userData.barrelExit={x:model.muzzle[0],y:model.muzzle[1],z:model.muzzle[2]};
   group.userData.mags=mags;
   return group;
  };
 }
}
function modMapPreview(def){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
 const ctx=canvas.getContext('2d'),span=def.halfSize*2,scale=280/span,center=[320,180];
 const sky=ctx.createLinearGradient(0,0,640,360);
 sky.addColorStop(0,def.sky||'#8fadc2');sky.addColorStop(1,'#101a23');
 ctx.fillStyle=sky;ctx.fillRect(0,0,640,360);
 ctx.save();ctx.translate(...center);ctx.transform(1,.29,-.54,.69,0,0);ctx.scale(scale,scale);
 ctx.fillStyle=def.ground||'#747874';
 ctx.shadowColor='#070d14bb';ctx.shadowOffsetY=16;ctx.shadowBlur=28;
 ctx.fillRect(-def.halfSize,-def.halfSize,span,span);
 ctx.shadowBlur=ctx.shadowOffsetY=0;
 ctx.strokeStyle=def.wall||'#626d78';ctx.lineWidth=.8;
 ctx.strokeRect(-def.halfSize,-def.halfSize,span,span);
 for(const part of [...def.boxes,...(def.props||[])].sort((a,b)=>a.at[1]-b.at[1])){
  const [x,z]=part.at,[w,h,d]=part.size,y=-((part.elevation||0)+h)*.58;
  ctx.fillStyle='#101a24ab';ctx.fillRect(x-w/2+.6,z-d/2+y+1,w,d+1);
  ctx.fillStyle=part.color;ctx.fillRect(x-w/2,z-d/2+y,w,d);
 }
 ctx.restore();
 return canvas.toDataURL('image/webp',.76);
}
function modPaintMapCards(root){
 for(const card of $$(root+' [data-map-art]')){
  const art=MAPS[card.dataset.mapArt]?.modArt;
  if(art)card.style.setProperty('--map-shot','url("'+art+'")');
  else card.style.removeProperty('--map-shot');
 }
}
function installModMaps(maps){
 const shapes={box:'b',cylinder:'c',sphere:'s',cone:'k'};
 const pieces = part => {
  const [x,z]=part.at,[w,h,d]=part.size,y=part.elevation||0;
  return [x,z,w,d,y+h,y,modColor(part.color)];
 };
 for(const def of maps){
  const boxes=def.boxes.map(box=>[...pieces(box),box.material]);
  const props=(def.props||[]).map(prop=>[...pieces(prop),prop.material==='glow'&&(!prop.shape||prop.shape==='box')?'e':prop.material==='glass'&&(!prop.shape||prop.shape==='box')?'g':shapes[prop.shape||'box'],prop.material]);
  const map={
   d:def.description||((def.kind==='zombies'?'Zombies':'Arena')+' · '+def.halfSize*2+' × '+def.halfSize*2+' m'),modName:def.name,modArt:modMapPreview(def),H:def.halfSize,sky:modColor(def.sky||'#8fadc2'),
   gr:modColor(def.ground||'#747874'),bc:modColor(def.wall||'#626d78'),gt:def.surface||'concrete',
   skyk:def.night?'night':undefined,hemi:def.night?.4:.88,sunI:def.night?.24:.72,
   fb:def.flags,zn:def.zones,modSpawns:{all:def.spawns,A:def.blueSpawns,B:def.redSpawns},
   lights:(def.lights||[]).map(light=>[light.at[0],light.height,light.at[1],modColor(light.color),light.intensity,light.radius]),
   b(){this._v=props;return boxes}
  };
  if(def.kind==='zombies'){
   Object.assign(map,{zm:1,nf:0,day:!def.night,ps:def.spawns[0],
    post(group){
     EST.tm=0;
     EST.pool=Array.from({length:Math.min(4,(def.stations||[]).length)},()=>{
      const L=new THREE.PointLight(0xffffff,0,18,1.6);group.add(L);return {L,s:null};
     });
    },
    zs:def.zombieSpawns.map(spawn=>[...spawn.at,spawn.room||0]),
    dr:(def.doors||[]).map(door=>({x:door.at[0],z:door.at[1],w:door.size[0],d:door.size[1],n:door.name,c:door.cost,a:door.rooms[0],b:door.rooms[1],s:'wood'})),
    modWallCosts:new Map((def.stations||[]).filter(station=>station.kind==='wall'&&station.cost!==undefined).map(station=>[modWeaponKey(station.weapon),station.cost])),
    mc:(def.stations||[]).map(station=>({x:station.at[0],z:station.at[1],t:station.kind,f:(station.facing||'N').toLowerCase(),k:modWeaponKey(station.weapon),c:station.cost??(station.kind==='wall'?1000:500)}))
   });
  }
  MAPS['@'+def.id]=map;
 }
}
let modObjective=null;
function modObjectiveNext(index){
 if(modObjective?.marker){
  const marker=modObjective.marker;mapG.remove(marker);marker.geometry.dispose();marker.material.dispose();
 }
 const step=modRules.objectives[index];
 if(!step){modObjective=null;endGame('Victory');return}
 let marker;
 if(step.at){
  marker=new THREE.Mesh(new THREE.RingGeometry((step.radius??3)*.91,step.radius??3,36),
   new THREE.MeshBasicMaterial({color:0x7beaff,side:THREE.DoubleSide,transparent:true,opacity:.8}));
  marker.rotation.x=-Math.PI/2;marker.position.set(step.at[0],.055,step.at[1]);mapG.add(marker);
 }
 modObjective={step,index,marker,kills,held:0};
}
function modObjectiveTick(dt){
 if(!modObjective)return;
 const {step,index}=modObjective;
 if(modRules.deathLimit&&deaths>=modRules.deathLimit){endGame('Defeat');return}
 const nearby=step.at&&!P.dead&&P.y<2&&Math.hypot(P.x-step.at[0],P.z-step.at[1])<=(step.radius??3);
 if(step.kind==='hold')modObjective.held=nearby?modObjective.held+dt:0;
 const gained=kills-modObjective.kills,seconds=Math.ceil(Math.max(0,(step.seconds||0)-modObjective.held));
 const progress=step.kind==='hold'?(' · '+seconds+'s to hold'):step.kind==='eliminate'?(' · '+gained+'/'+step.count):step.kind==='interact'&&nearby?' · '+ctlKey('use')+' to interact':'';
 const heading=(index+1)+'/'+modRules.objectives.length+' · '+step.name+progress;
 if($('#ob').textContent!==heading)$('#ob').textContent=heading;
 if(step.kind==='reach'?nearby:step.kind==='hold'?seconds===0:step.kind==='eliminate'?gained>=step.count:false)modObjectiveComplete();
}
function modObjectiveComplete(){
 const {step,index}=modObjective;
 if(step.reward==='heal'){P.hp=P.mhp;P.sh=P.msh}
 if(step.reward==='refill'){for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs??4)}rel=0}
 modObjectiveNext(index+1);
}
function modObjectiveInteract(){
 if(!modObjective||P.dead||P.y>=2)return false;
 const {step}=modObjective;
 if(step.kind!=='interact'||Math.hypot(P.x-step.at[0],P.z-step.at[1])>(step.radius??3))return false;
 modObjectiveComplete();return true;
}
function modInitializePlayer(){
 if(mode==='Zombies'){
  zq.pts=modRules.startPoints??zq.pts;
  if(modRules.primary||modRules.secondary){
   wp=[zGunObj(modWeaponKey(modRules.primary)||'CT')];
   if(modRules.secondary)wp.push(zGunObj(modWeaponKey(modRules.secondary)));
   cur=0;setGun();
  }
 }
 P.hp=P.mhp=modRules.health??P.mhp;
 P.sh=P.msh=modRules.shield??P.msh;
 const clock=$('#mod-clock');
 clock.hidden=false;
 clock.textContent='Progression frozen';
 if(modRules.objectives)modObjectiveNext(0);
}

function modTimeTick(){
 if(!modRules.timeSeconds||mode==='Time Attack')return false;
 const remaining=Math.max(0,Math.ceil(modRules.timeSeconds-t0));
 const clock=$('#mod-clock'),text='Progression frozen · '+remaining+'s left';
 if(clock.textContent!==text)clock.textContent=text;
 if(remaining>0)return false;
 if(modRules.objectives){endGame('Defeat');return true}
 if(teamMode()){
  const scores=mode==='Capture the Flag'?cs:mode==='Kill Confirmed'?kc:mode==='Team Deathmatch'?ts:ds;
  const a=scores.A||0,b=scores.B||0;
  endGame(a===b?'Draw':a>b?'Victory':'Defeat');
 }else if(mode==='Zombies'||mode==='Survival')endGame(P.dead?'Defeat':'Victory');
 else {
  const top=leader(),tied=bots.some(bot=>bot.k===kills);
  endGame(top.me?(tied?'Draw':'Victory'):'Defeat');
 }
 return true;
}

function modRestoreLoadout(){
 if(modLobbyLoadout){L=modLobbyLoadout;modLobbyLoadout=null}
 modObjective=null;
}
function modSelectMode(key){
 const game=modPlaylists.get(key);
 if(!game)return;
 sel.map=game.map;sel.rp=0;
}
function modZombiePlaylist(){
 const game=modPlaylists.get($('#mod-zplaylist').value);
 if(game)selectZMap(game.map);
}
function modInstall(pack){
 activeMod=pack;
 installModWeapons(pack.weapons||[]);
 installModMaps(pack.maps||[]);
 const zombies=$('#mod-zplaylist'),standard=document.createElement('option');
 standard.value='';standard.textContent='Standard Survival';zombies.append(standard);
 for(const game of pack.playlists){
  const key=modModeKey(game.id);
  modPlaylists.set(key,game);
  if(game.base==='Zombies'){
   const option=document.createElement('option');option.value=key;option.textContent=game.name;zombies.append(option);
  }else{
   MODES[key]=game.description||game.name;
   modeLabels[key]=game.name;
  }
 }
 $('#go').textContent='Play local';
 $('#hmp .home-mode > span').textContent='Local arena matches with bots';
 $('#hz .home-mode > span').textContent='Solo survival';
 $('#mod-zops').hidden=zombies.options.length<2;
 zombies.onchange=modZombiePlaylist;
 $('#md').replaceChildren();$('#mp').replaceChildren();
 for(const status of $$('.mod-active-status')){
  status.textContent=pack.name+' active · Offline play · Progression frozen';
  status.hidden=false;
 }
}

if(window.SD_MOD_SESSION){
 const begin=startGame,defaultBots=BOTGUNS.slice(),defaultLadder=GG.lad.slice();
 startGame=function(){
  resetLifeLoadouts();modRestoreLoadout();
  const selected=sel.mode;
  const key=selected==='Zombies'?$('#mod-zplaylist').value:selected;
  modRules=practiceSession?{}:modPlaylists.get(key)||{};
  const rules=modRules;
  if(rules.base&&!practiceSession)sel.mode=rules.objectives?'Slayer':rules.base;
  const pool=rules.botWeapons?.map(modWeaponKey)||[...defaultBots,...(activeMod?.weapons||[]).map(weapon=>'mod:'+weapon.id)];
  BOTGUNS.splice(0,BOTGUNS.length,...pool);
  GG.lad=rules.weaponLadder?.map(modWeaponKey)||defaultLadder;
  if(rules.primary||rules.secondary){
   modLobbyLoadout=L;
   L={...L,p:modWeaponKey(rules.primary)||L.p,s:modWeaponKey(rules.secondary)||L.s,
    pa:rules.primary?[]:L.pa,sa:rules.secondary?[]:L.sa};
  }
  try{return begin.apply(this,arguments)}finally{sel.mode=selected}
 };
}

const modLaunchKey='sd-mod-launch-v1';
function modPageURL(active){
 const url=new URL(location.href);
 url.searchParams.delete('sdMod');
 url.searchParams.set('mods','1');
 if(active)url.searchParams.set('sdMod','1');
 if($('#menu').style.display==='block')url.searchParams.set('modMenu',app);
 return url;
}
function modSetActive(pack){
 if(pack)sessionStorage.setItem(modLaunchKey,JSON.stringify(pack));
 else sessionStorage.removeItem(modLaunchKey);
 location.replace(modPageURL(!!pack));
}

function modLibraryUI(){
 const panel=$('#mods-panel'),list=$('#mods-library'),status=$('#mods-status'),zone=$('#mods-drop'),input=$('#mods-file');
 const limit=384*1024,storageKey='sd-mod-library-v1';
 const library=new Map();
 let importing=false;
 const note=message=>{status.textContent=message};
 const button=(label,action)=>{
  const item=document.createElement('button');item.type='button';item.className='btn alt';item.textContent=label;item.onclick=action;return item;
 };
 const download=(name,value)=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const save=()=>{
  try{const value=JSON.stringify([...library.values()]);if(window.SD_MOD_LIBRARY)window.SD_MOD_LIBRARY.write(value);else localStorage.setItem(storageKey,value);return true}
  catch{return false}
 };
 try{
  const saved=JSON.parse((window.SD_MOD_LIBRARY?window.SD_MOD_LIBRARY.read():localStorage.getItem(storageKey))||'[]');
  for(const pack of (Array.isArray(saved)?saved.slice(0,6):[])){
   try{modKit.validate(pack);library.set(pack.id,pack)}catch{}
  }
 }catch{}
 if(activeMod&&!library.has(activeMod.id))library.set(activeMod.id,activeMod);
 function render(){
  list.replaceChildren();
  if(!library.size){const empty=document.createElement('p');empty.textContent='No mods installed.';list.append(empty);return}
  for(const pack of library.values()){
   const card=document.createElement('article'),header=document.createElement('header'),name=document.createElement('h3'),description=document.createElement('p');
   name.textContent=pack.name;description.textContent=[pack.author,pack.description].filter(Boolean).join(' · ');
   const enabled=activeMod?.id===pack.id;
   header.append(name,button(enabled?'Disable':'Enable',()=>activate(enabled?null:pack)),
    button('Export',()=>download(pack.id+'.sdmod',pack)));
   if(!enabled)header.append(button('Remove',()=>{
    library.delete(pack.id);const saved=save();render();
    note(saved?'Removed '+pack.name+'.':'Removed for this visit. Browser storage is unavailable.');
    $('#mods-browse').focus();
   }));
   card.append(header);if(description.textContent)card.append(description);
   const content=document.createElement('p');
   content.textContent=(enabled?'Enabled · ':'')+pack.playlists.map(playlist=>playlist.name).join(' · ');
   card.append(content);
   list.append(card);
  }
 }
 function add(pack){
  modKit.validate(pack);
  const replacing=library.has(pack.id);
  if(replacing&&JSON.stringify(library.get(pack.id))===JSON.stringify(pack)){note(pack.name+' is already installed.');return}
  if(replacing&&!confirm('Replace the installed mod with ID "'+pack.id+'"?'))return;
  if(!replacing&&library.size>=6)throw new Error('The library holds six mods. Remove one before adding another.');
  library.set(pack.id,pack);const saved=save();render();
  if(activeMod?.id===pack.id){activate(pack);return}
  note((replacing?'Updated ':'Installed ')+pack.name+(saved?'.':'. Available for this visit because browser storage is unavailable.'));
 }
 async function importFile(files){
  if(importing||!files.length)return;
  if(files.length!==1){note('Drop one .sdmod file at a time.');return}
  const file=files[0];
  if(!/\.sdmod$/i.test(file.name)){note('Choose a file ending in .sdmod.');return}
  if(file.size>limit){note('This file exceeds the 384 KiB mod limit.');return}
  importing=true;
  try{
   let pack;
   const raw=await file.text();
   try{pack=JSON.parse(raw)}catch{throw new Error('Invalid JSON. Check for trailing commas or Markdown code fences.')}
   add(pack);
  }catch(error){note(error.message)}finally{importing=false}
 }
 function activate(pack){
  if(partyActive||net||netOn){note('Leave your online lobby or party before enabling a mod.');return}
  try{modSetActive(pack)}
  catch{note('Browser session storage is unavailable. Allow site storage to enable a mod.')}
 }
 const open=()=>{render();panel.showModal();$('#mods-browse').focus()};
 for(const button of $$('.mods-open'))button.onclick=open;
 $('#mods-close').onclick=()=>panel.close();
 const url=new URL(location.href);
 if(url.searchParams.get('mods')==='1'){
  const backTo=url.searchParams.get('modMenu');
  if(backTo==='mp'||backTo==='zm')setApp(backTo);
  url.searchParams.delete('mods');url.searchParams.delete('modMenu');
  try{history.replaceState(null,'',url)}catch{}
  open();
 }
 $('#mods-browse').onclick=()=>input.click();
 input.onchange=()=>{importFile(input.files);input.value=''};
 panel.addEventListener('dragover',event=>{
  if(event.dataTransfer.types.includes('Files')){event.preventDefault();event.dataTransfer.dropEffect='copy';zone.classList.add('dragging')}
 });
 panel.addEventListener('dragleave',event=>{if(!panel.contains(event.relatedTarget))zone.classList.remove('dragging')});
 panel.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('dragging');importFile(event.dataTransfer.files)});
 $('#mods-example').onclick=()=>{try{add(modKit.example)}catch(error){note(error.message)}};
 $('#mods-template').onclick=()=>download('signal-yard.sdmod',modKit.example);
 $('#mods-schema').onclick=()=>download('spartan-drill-mod-v1.schema.json',modKit.schema);
 $('#mods-prompt').onclick=async()=>{
  const prompt=[
   'Create one Spartan Drill mod from my idea using the official .sdmod v1 JSON format.',
   'Return a downloadable .sdmod file containing only JSON, or raw JSON if you cannot create files. Use the schema and example below. Ask me what to make if I have not described my idea.',
   'Use @id for custom weapon/map references. Built-in map names are listed below. Add at least one playlist. Arena maps use boxes with size [width,height,depth], at [x,z], and optional elevation. Keep starts clear. Zombies maps need a player spawn and a zombie spawn in room 0. Use authored geometry for weapon models with muzzle pointing toward +Z. Use scoreLimit for score modes, waveLimit for Zombies or Survival, and timeSeconds for timed matches. Choose Objective Course to make a new game with ordered reach, hold, interact, and eliminate steps. Stay below 384 KiB.',
   'Built-in maps: '+Object.entries(MAPS).filter(([key,map])=>key!=='Practice Range'&&!map.modName).map(([key,map])=>key+(map.zm?' (Zombies)':'')).join(', '),
   'SCHEMA\n'+JSON.stringify(modKit.schema,null,2),
   'EXAMPLE\n'+JSON.stringify(modKit.example,null,2)
  ].join('\n\n');
  const fallback=$('#mods-prompt-text');
  try{await navigator.clipboard.writeText(prompt);fallback.hidden=true;note('Prompt copied. Paste it into an AI chat with your mod idea.')}
  catch{fallback.value=prompt;fallback.hidden=false;fallback.focus();fallback.select();note('Copy the selected prompt and paste it into an AI chat with your mod idea.')}
 };
}

addEventListener('sd-ready',()=>{
 if(window.SD_SPLIT)return;
 if(window.SD_MOD_SESSION){
  try{modInstall(modKit.validate(JSON.parse(sessionStorage.getItem(modLaunchKey)||'null')))}
  catch(error){console.error('Could not enable the mod',error);location.replace(modPageURL(false));return}
 }
 modLibraryUI();
});
