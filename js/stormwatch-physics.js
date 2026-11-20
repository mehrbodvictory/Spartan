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
