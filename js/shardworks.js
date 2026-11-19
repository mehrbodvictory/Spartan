/* Fixed voxel IDs let a match host synchronize the same structures on every peer. */
const VOXEL_SIZE=.72;
const voxelMaterials={
 clay:{color:0xb96645,hp:48},slate:{color:0x576e7d,hp:75},alloy:{color:0x99b4bc,hp:100},
 paint:{color:0xda9e4a,hp:64},teal:{color:0x489790,hp:64},crystal:{color:0x82c6ae,hp:59}
};
let voxelWorld=null;
const voxelKey=(x,y,z)=>x+':'+y+':'+z;
const quarryRiver=[
 [-32,6],[-26,6.8],[-20,6.6],[-15,4.8],[-10,5.6],[-5,7.6],[0,10],
 [5,11.7],[10,14.1],[15,15.6],[20,15.3],[25,16.3],[32,18]
];
const riverBottom=-2.08,riverSurface=-.31,riverInner=1.07,riverOuter=2.95;
const riverBank=riverOuter-(riverOuter-riverInner)*riverSurface/riverBottom;
const riverBridges=[-23.6,.62,23.6];
const riverSegments=quarryRiver.slice(1).map(([x1,z1],i)=>{
 const [x0,z0]=quarryRiver[i],slope=(z1-z0)/(x1-x0);
 return {x0,x1,z0,slope,offset:z0-slope*x0};
});

function riverCenter(x){
 for(const segment of riverSegments)if(x<=segment.x1)return segment.offset+segment.slope*x;
 return quarryRiver[quarryRiver.length-1][1];
}
function riverGround(x,z){
 const offset=Math.min(Math.abs(z-riverCenter(x)),riverOuter);
 return riverBottom*Math.max(0,(riverOuter-Math.max(offset,riverInner))/(riverOuter-riverInner));
}
function riverGroundRay(origin,dir,far){
 let nearest=far;
 if(dir.y<0&&origin.y>=0){
  const ground=-origin.y/dir.y;
  if(ground<nearest&&riverGround(origin.x+dir.x*ground,origin.z+dir.z*ground)>=0)nearest=ground;
 }
 if(origin.y+dir.y*nearest>=0&&origin.y>=0)return nearest;
 if(dir.y<0){
  const floor=(riverBottom-origin.y)/dir.y;
  if(floor>=0&&floor<nearest&&Math.abs(origin.z+dir.z*floor-riverCenter(origin.x+dir.x*floor))<=riverInner)nearest=floor;
 }
 if(nearest<=0)return nearest;
 for(const segment of riverSegments){
  const end=origin.x+dir.x*nearest;
  if(Math.max(origin.x,end)<segment.x0||Math.min(origin.x,end)>segment.x1)continue;
  const from=origin.z-segment.offset-segment.slope*origin.x,to=dir.z-segment.slope*dir.x;
  for(const side of [-1,1]){
   const steep=side*(-riverBottom)/(riverOuter-riverInner),denom=dir.y-steep*to;
   if(denom>=-1e-7)continue;
   const t=(riverBottom+steep*(from-riverInner*side)-origin.y)/denom;
   if(t<0||t>=nearest)continue;
   const x=origin.x+dir.x*t,across=side*(from+to*t);
   if(x>=segment.x0&&x<=segment.x1&&across>=riverInner&&across<=riverOuter)nearest=t;
  }
 }
 return nearest;
}
function riverGroundMesh(){
 const p=[],uv=[],indices=[],bands=[-32,-riverOuter,-riverInner,riverInner,riverOuter,32];
 for(const [x,center] of quarryRiver)for(let k=0;k<bands.length;k++){
  const outside=k===0||k===bands.length-1,z=outside?bands[k]:center+bands[k],y=k===2||k===3?riverBottom:0;
  p.push(x,y,z);uv.push((x+32)/64,(32-z)/64);
 }
 for(let i=0;i<quarryRiver.length-1;i++)for(let k=0;k<bands.length-1;k++){
  const a=i*bands.length+k,b=a+bands.length;
  indices.push(a,a+1,b,b,a+1,b+1);
 }
 const mesh=new THREE.BufferGeometry();
 mesh.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
 mesh.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 mesh.setIndex(indices);mesh.computeVertexNormals();return mesh;
}
function riverAcrossBridge(x,z){
 return riverBridges.some(bridge=>Math.abs(x-bridge)<1.38&&Math.abs(z-riverCenter(bridge))<3.95);
}
function riverObstacles(walls){
 for(const x of riverBridges){
  const z=riverCenter(x);
  walls.push([x,z,2.85,8,.49,.32,0x68817d,'metal']);
  for(const side of [-1,1]){
   walls.push([x,z+side*4.14,2.85,.52,.24,0,0x768078,'concrete']);
   for(const across of [-1,1])walls.push([x+across*1.29,z+side*3.55,.24,.35,.33,0,0x354b50,'metal']);
  }
  for(const side of [-1,1])for(let post=-3;post<=3;post++){
   // The deck is the crossing surface. Railings stay visual so the river stays accessible.
   MAPS.Shardworks._v.push([x+side*1.39,z+post*1.12,.081,.081,1.13,.49,0xc0a666,'b','metal']);
   if(post<3)MAPS.Shardworks._v.push([x+side*1.39,z+(post+.5)*1.12,.06,1.15,1.07,.99,0xd5b87f,'b','metal']);
  }
 }
}
let riverVisual=null,riverOverlay=false;
function riverBanks(root){
 const random=MK.rnd(283),pose=new THREE.Object3D(),tint=new THREE.Color();
 const gravel=new THREE.IcosahedronGeometry(1,0),reed=new THREE.ConeGeometry(1,1,3);
 const material=new THREE.MeshLambertMaterial({color:0xffffff});
 const rocks=new THREE.InstancedMesh(gravel,material,54),reeds=new THREE.InstancedMesh(reed,material,120);
 let stones=0,plants=0;
 for(let i=0;i<54;i++){
  const x=-29+58*random();
  if(riverBridges.some(bridge=>Math.abs(x-bridge)<2.1))continue;
  const z=riverCenter(x)+(i%2?-1:1)*(2.57+random()*.55),bottom=riverGround(x,z);
  pose.position.set(x,bottom+.045,z);pose.scale.set(.17+random()*.25,.09+random()*.18,.14+random()*.22);
  pose.rotation.set(random()*.2,random()*Math.PI,random()*.4);
  pose.updateMatrix();rocks.setMatrixAt(stones,pose.matrix);
  rocks.setColorAt(stones++,tint.setHex(i%3?0x746553:0x998c71));
  if(i%2!==0)continue;
  for(let j=0;j<4;j++){
   const height=.25+random()*.43,dx=(random()-.5)*.31,dz=(random()-.5)*.32;
   pose.position.set(x+dx,bottom+height*.41,z+dz);
   pose.scale.set(.039+random()*.032,height,.045);
   pose.rotation.set(dx*2,random()*Math.PI,dz*1.7);
   pose.updateMatrix();reeds.setMatrixAt(plants,pose.matrix);
   reeds.setColorAt(plants++,tint.setHex(j===0?0x9a8747:0x6e854c));
  }
 }
 rocks.count=stones;reeds.count=plants;
 for(const batch of [rocks,reeds]){
  batch.frustumCulled=false;batch.receiveShadow=true;batch.matrixAutoUpdate=false;root.add(batch);
 }
 root.addEventListener('removed',()=>{
  rocks.dispose?.();reeds.dispose?.();material.dispose();
 });
}
function quarryRidge(root){
 const geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshLambertMaterial({color:0xffffff});
 const ridge=new THREE.InstancedMesh(geometry,material,196),pose=new THREE.Object3D(),tint=new THREE.Color();
 const random=MK.rnd(583),colors=[0x9b8068,0x8c7062,0xb39a78,0x776a5d];
 let count=0;
 function slab(x,z,w,d,y,h,color){
  pose.scale.set(w,h,d);pose.position.set(x,y+h*.5,z);pose.updateMatrix();
  ridge.setMatrixAt(count,pose.matrix);ridge.setColorAt(count++,tint.setHex(color));
 }
 for(const side of [-1,1])for(const axis of [0,1]){
  // Ridge blocks sit outside the play area, behind the barricades.
  for(let i=0;i<11;i++){
   const at=(i-5)*7.8+(random()-.5)*2.7;
   const setback=40+i%2*1.6+random()*5.5,base=7+random()*8;
   const x=axis?side*setback:at,z=axis?at:side*setback;
   slab(x,z,10.5,10.5,-1.1,base,colors[(i+axis)%colors.length]);
   slab(x+1.1,z-.65,8.8,8.2,base-1.3,2.4+random()*2,colors[(i+3)%colors.length]);
   if(i%3!==1)slab(x+.68,z-1.2,6.4,6.1,base+1.1,2+random()*4,colors[(i+2)%colors.length]);
   if(side<0&&i%3===0)slab(x-.8,z-.3,3.7,3.6,base+4.2,2+random()*3,0xc0a486);
  }
 }
 ridge.count=count;ridge.frustumCulled=false;ridge.matrixAutoUpdate=false;root.add(ridge);
 root.addEventListener('removed',()=>{ridge.dispose?.();material.dispose()});
}
function riverDecorate(root){
 const p=[],uv=[],indices=[];
 for(const [i,[x,z]] of quarryRiver.entries()){
  p.push(x,riverSurface,z-riverBank,x,riverSurface,z+riverBank);
  uv.push(0,x,1,x);
  if(i){const b=i*2;indices.push(b-2,b-1,b,b,b-1,b+1)}
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);
 const material=new THREE.ShaderMaterial({
  uniforms:{...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),time:{value:0}},fog:true,
  transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:`
   varying vec2 riverUV;
   varying vec3 point;
   #include <fog_pars_vertex>
   void main(){
    riverUV=uv;point=(modelMatrix*vec4(position,1.)).xyz;
    vec4 mvPosition=modelViewMatrix*vec4(position,1.);
    gl_Position=projectionMatrix*mvPosition;
    #include <fog_vertex>
   }`,
  fragmentShader:`
   uniform float time;
   varying vec2 riverUV;
   varying vec3 point;
   #include <fog_pars_fragment>
   void main(){
    vec2 p=point.xz;float t=time*.75;
    float wave=sin(p.x*2.9+p.y*4.6-t*4.)*.46+
     sin(p.x*6.3-p.y*3.4-t*2.5)*.25+sin(p.x*1.6+p.y*9.1+t*3.1)*.14;
    vec3 normal=normalize(vec3(.16*cos(p.x*2.9+p.y*4.6-t*4.),1.,.17*wave));
    vec3 view=normalize(cameraPosition-point);vec3 light=normalize(vec3(-.5,.7,.33));
    float fresnel=pow(1.-max(0.,dot(view,normal)),3.);
    float sheen=pow(max(0.,dot(reflect(-light,normal),view)),52.);
    float edge=min(riverUV.x,1.-riverUV.x);
    float foam=(1.-smoothstep(.006,.047,edge+wave*.009))*smoothstep(-.47,.3,wave);
    float current=smoothstep(.57,.8,wave+sin(p.x*1.3-t*2.4)*.16)*.21;
    vec3 base=mix(vec3(.035,.29,.31),vec3(.19,.53,.49),smoothstep(-.68,.68,wave));
    vec3 reflected=mix(base,vec3(.52,.69,.71),fresnel*.55);
    vec3 color=mix(reflected,vec3(.73,.92,.88),clamp(foam*.8+current+sheen*.57,0.,1.));
    gl_FragColor=vec4(color,view.y<0.?.63:.73+fresnel*.22+foam*.04);
    #include <fog_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
   }`
 });
 riverBanks(root);
 const river=new THREE.Mesh(geometry,material);
 river.updateMatrix();river.matrixAutoUpdate=false;root.add(river);riverVisual=river;
 root.addEventListener('removed',()=>{if(riverVisual===river)riverVisual=null;material.dispose();riverView(false)});
}
function riverView(underwater){
 if(riverOverlay===underwater)return;
 riverOverlay=underwater;document.body.classList.toggle('quarry-underwater',underwater);
}
function drawQuarryRiverOnMap(ctx,x,z,scale){
 ctx.beginPath();
 for(const [i,[across,center]] of quarryRiver.entries()){
  if(i)ctx.lineTo(x(across),z(center));
  else ctx.moveTo(x(across),z(center));
 }
 ctx.strokeStyle='#326769';ctx.lineWidth=riverBank*2*scale;ctx.stroke();
}
function quarrySwim(dt,f,s){
 const bottom=riverGround(P.x,P.z);
 if(bottom>riverSurface-.34||P.y>riverSurface-.09){
  if(P.swimming)noise(.12,870,.065);
  P.swimming=false;return false;
 }
 if(!P.swimming){
  const impact=Math.min(14,Math.abs(P.vy));
  noise(.23,1250,.08+impact*.006);P.swimming=true;P.swimWake=0;
  burst(V(P.x,riverSurface+.04,P.z),12,0x8acec7,2+impact*.2,.35,.053);
  if(!P.swimHint){P.swimHint=true;msg('Swim forward while looking down to dive. Jump to surface.',3)}
 }
 const n=Math.max(1,Math.hypot(f,s)),cos=Math.cos(yaw),sin=Math.sin(yaw);
 const speed=ST.ads>.4?2.65:3.9,blend=1-Math.exp(-7*dt);
 P.mx+=(speed*(-sin*f+cos*s)/n-P.mx)*blend;
 P.mz+=(speed*(-cos*f-sin*s)/n-P.mz)*blend;
 const here=P.x;
 mv(P,(P.mx+.37)*dt,P.mz*dt,.4);
 const dive=!key.Space&&f>.15&&pitch<-.28;
 const target=riverSurface-(dive?1.88:key.Space?1.18:1.35)+Math.sin(t0*4)*.04;
 const next=riverGround(P.x,P.z);
 P.y=Math.max(next,P.y+(target-P.y)*(1-Math.exp(-8*dt)));
 P.on=false;P.vy=0;P.coy=P.jb=P.jv=P.wvx=P.wvz=0;P.jh=!!key.Space;
 ST.crouch=ST.prone=ST.slide=ST.dive=ST.tac=ST.mount=0;
 P.swimWake-=dt;
 if(P.swimWake<=0&&Math.abs(P.x-here)+Math.abs(P.mz*dt)>.028&&!dive){
  P.swimWake=.35;
  burst(V(P.x,riverSurface+.035,P.z),3,0x9fe2d5,1.5,.21,.041);
  noise(.13,650,.038);
 }
 return true;
}
function quarryBotDepth(bot,dt){
 const bottom=riverGround(bot.x,bot.z);
 const target=riverAcrossBridge(bot.x,bot.z)?.49:Math.max(bottom,riverSurface-1.33);
 bot.y+=(target-bot.y)*Math.min(1,dt*9);
}

MAPS.Shardworks={
 d:'Destructible voxel quarry with loading depots, elevated conveyors, and a river you can swim or cross by bridge.',
 H:32,sky:0xc2c2a6,gr:0x867e70,gt:'concrete',bc:0x4b6972,skyk:'day',day:1,
 hemi:1.05,hemiC:0xe6f7f6,hemiG:0x5e7681,sunI:1.16,sunC:0xffdbac,fogF:122,
 fb:[[-23,22],[23,-22]],zn:[[-17,12],[0,0],[17,-12]],
 groundGeometry:riverGroundMesh,groundHeight:riverGround,groundRay:riverGroundRay,swim:true,
 b(){
  const walls=[],add=(x,z,w,d,h,color,kind='concrete')=>walls.push([x,z,w,d,h,0,color,kind]);
  for(const sign of [-1,1]){
   add(sign*31.7,0,.95,64,8.1,0x4e666f,'metal');add(0,sign*31.7,62.5,.95,8.1,0x4e666f,'metal');
   add(0,sign*23.6,62,3.25,.055,0x44535b,'asphalt');
   const x=sign*23.6,z=riverCenter(x);
   for(const [from,to] of [[-31,z-3.45],[z+3.45,31]])add(x,(from+to)/2,3.25,to-from,.057,0x44535b,'asphalt');
   for(let p=-26;p<=26;p+=4){
    add(p,sign*23.6,1.92,.11,.073,0xd6ae68);
    if(riverGround(sign*23.6,p)===0)add(sign*23.6,p,.11,1.92,.074,0xd6ae68);
   }
  }
  add(0,-2.1,15,11,.045,0x696d68);
  riverObstacles(walls);
  return walls;
 },
 post(root){quarryRidge(root);voxelBuild(root);riverDecorate(root)}
};

function voxelBuild(root){
 const cells=new Map(),blocks=[];
 function put(x,y,z,type){
  const key=voxelKey(x,y,z);if(cells.has(key))return;
  const size=VOXEL_SIZE;
  if(riverGround((x+.5)*size,(z+.5)*size)<-.04)return;
  const mat=voxelMaterials[type],i=blocks.length;
  const bounds={x0:x*size,x1:(x+1)*size,y0:y*size,h:(y+1)*size,z0:z*size,z1:(z+1)*size};
  const block={i,x,y,z,key,bounds,type,hp:mat.hp,color:mat.color,alive:true};
  cells.set(key,block);blocks.push(block);bx.push(bounds);
 }
 function fill(x0,x1,y0,y1,z0,z1,type){
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)put(x,y,z,type);
 }
 for(const sign of [-1,1]){
  const l=sign===-1?-26:15,r=l+11,near=sign===-1?-16:6,far=near+10;
  const color=sign===-1?'paint':'teal';
  for(let x=l;x<=r;x++)for(let y=0;y<8;y++)for(let z=near;z<=far;z++){
   const side=x===l||x===r,front=z===near||z===far;
   const door=Math.abs(x-(l+5))<2&&y<4,window=y>=3&&y<=5&&z>near+2&&z<far-1;
   if(front&&!door||side&&!window||y===7&&x%3!==0&&z>near&&z<far)
    put(x,y,z,y===6||y===0?color:y===7?'alloy':(x+y+z)%4===0?'slate':'clay');
  }
  const u=sign===-1?-27:20,t=sign===-1?15:-23;
  fill(u,u+6,0,2,t,t+5,'slate');fill(u+1,u+5,3,5,t+1,t+4,color);fill(u+2,u+4,6,7,t+2,t+3,'alloy');
  const tx=sign===-1?-6:6,zz=sign===-1?15:-16;
  for(const k of [tx,tx+3]){
   fill(k,k+1,0,6,zz,zz+1,'slate');fill(k,k+1,0,6,zz+5,zz+6,'slate');
  }
  fill(tx,tx+4,7,7,zz,zz+6,'alloy');
  fill(tx,tx+4,8,8,zz,zz,color);fill(tx,tx+4,8,8,zz+6,zz+6,color);
  for(let step=0;step<7;step++)fill(tx+1,tx+3,0,step,zz+step-7,zz+step-7,step%3===0?color:'slate');
 }
 // Four gates lead into the central ore washer.
 for(let x=-6;x<=5;x++)for(let z=-6;z<=5;z++)for(let y=0;y<=10;y++){
  const edgeX=x===-6||x===5,edgeZ=z===-6||z===5;
  const gateX=edgeX&&z>=-2&&z<2,gateZ=edgeZ&&x>=-2&&x<2;
  const ring=(edgeX||edgeZ)&&y<=8&&(y>=5||(!gateX&&!gateZ));
  if(ring||y>=9&&Math.abs(x+.5)+Math.abs(z+.5)<(y===9?12:9))
   put(x,y,z,y===5||y>=9?'alloy':(x+y+z)%5===0?'paint':'slate');
 }
 for(let y=11;y<=16;y++){
  const width=y<14?3:2;
  for(let x=-width;x<width;x++)for(let z=-width;z<width;z++)
   if(Math.abs(x+.5)+Math.abs(z+.5)<=width+(y%2?.25:1))put(x,y,z,y%3?'crystal':'teal');
 }
 for(const [x,z] of [[-16,-33],[17,29],[-37,-3],[32,3],[-10,29],[8,-32]]){
  fill(x,x+3,0,1,z,z+3,'clay');fill(x+1,x+2,2,3,z+1,z+2,'paint');
 }
 for(const turn of [false,true]){
  const accent=turn?'teal':'paint';
  // Mirror both coordinates to give each team the same approaches.
  function build(x0,x1,y0,y1,z0,z1,type){
   if(turn)fill(-x1-1,-x0-1,y0,y1,-z1-1,-z0-1,type);
   else fill(x0,x1,y0,y1,z0,z1,type);
  }
  // Raised conveyor with open passages below and a stair at each end.
  for(const x of [12,26])for(const z of [-9,-5]){
   build(x,x+1,0,2,z,z+1,'slate');
   build(x,x+1,3,3,z,z+1,accent);
   build(x,x+1,4,4,z,z+1,'slate');
  }
  build(12,27,5,5,-9,-4,'alloy');
  for(let x=13;x<27;x+=3){
   build(x,x+1,6,6,-9,-9,accent);build(x,x+1,6,6,-4,-4,accent);
  }
  for(let step=0;step<5;step++){
   build(7+step,7+step,0,step,-8,-5,step===4?accent:'slate');
   build(32-step,32-step,0,step,-8,-5,step===4?accent:'slate');
  }
  // Loading shed with three open doors and a broken roofline.
  for(let x=5;x<=15;x++)for(let z=24;z<=34;z++){
   const end=z===24||z===34,flank=x===5||x===15;
   const doorway=end&&x>=9&&x<=11||x===5&&z>=27&&z<=30;
   if(end||flank)build(x,x,doorway?4:0,6,z,z,(x+z)%3?accent:'slate');
   if(x<=8||x>=12||z%4===0)build(x,x,7,7,z,z,'alloy');
  }
  build(12,14,0,1,27,30,'clay');
  build(13,14,2,2,28,29,'slate');
  // Stagger short walls with wide gaps so the perimeter stays traversable.
  for(const [x,z,w,d] of [[33,-16,5,2],[29,-24,2,6],[21,-31,6,2],[13,-22,2,6],[7,17,4,2],[27,22,4,2]]){
   build(x,x+w-1,0,1,z,z+d-1,'clay');
   build(x,x+w-1,2,2,z,z+d-1,accent);
  }
  for(let step=0;step<4;step++){
   build(38+step,38+step,0,step,1,12,'slate');
   build(38+step,38+step,0,step+1,-step,0,'slate');
  }
 }
 const geometry=new THREE.BoxGeometry(.705,.705,.705);
 const material=new THREE.MeshLambertMaterial({color:0xffffff,map:gTex('concrete')});
 const mesh=new THREE.InstancedMesh(geometry,material,blocks.length);
 mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.castShadow=mesh.receiveShadow=true;
 const debris=new THREE.InstancedMesh(geometry,material,84);
 debris.setColorAt(0,new THREE.Color(0xffffff));debris.count=0;debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage);debris.frustumCulled=false;root.add(mesh,debris);
 const pose=new THREE.Object3D(),tint=new THREE.Color();
 for(const b of blocks){
  pose.position.set((b.x+.5)*VOXEL_SIZE,(b.y+.5)*VOXEL_SIZE,(b.z+.5)*VOXEL_SIZE);
  pose.updateMatrix();mesh.setMatrixAt(b.i,pose.matrix);
  const shade=.87+((Math.imul(b.i+7,139)>>>0)%27)*.009;
  mesh.setColorAt(b.i,tint.setHex(b.color).multiplyScalar(shade));
 }
 const links=new Int32Array(blocks.length*6).fill(-1),ground=[];
 for(const b of blocks){
  if(!b.y)ground.push(b.i);
  for(const [slot,[dx,dy,dz]] of voxelNeighbors.entries()){
   const adjacent=cells.get(voxelKey(b.x+dx,b.y+dy,b.z+dz));
   if(adjacent)links[b.i*6+slot]=adjacent.i;
  }
 }
 const support={links,ground,queue:new Int32Array(blocks.length),visited:new Uint32Array(blocks.length),stamp:0};
 voxelWorld={root,blocks,cells,mesh,debris,pose,tint,support,removed:new Set(),chips:[],navAt:0,dirty:false};
 root.addEventListener('removed',()=>{
  if(voxelWorld?.root===root)voxelWorld=null;
  for(const batch of [mesh,debris])batch.dispose?.();
  material.dispose();
 });
}
function voxelActive(){return voxelWorld?.root===mapG&&voxelWorld}
function voxelRay(o,d,range){
 const field=voxelActive();if(!field)return null;
 const p=o.clone().addScaledVector(d,range+.025),size=VOXEL_SIZE;
 return field.cells.get(voxelKey(Math.floor(p.x/size),Math.floor(p.y/size),Math.floor(p.z/size)))||null;
}
function voxelChip(field,b,force){
 for(let i=0;i<2&&field.chips.length<84;i++){
  field.chips.push({x:(b.x+.5)*VOXEL_SIZE,y:(b.y+.5)*VOXEL_SIZE,z:(b.z+.5)*VOXEL_SIZE,
   vx:(Math.random()-.5)*force,vy:1.5+Math.random()*force,vz:(Math.random()-.5)*force,
   spin:(Math.random()-.5)*8,scale:.22+Math.random()*.37,t:.55+Math.random()*.45,color:b.color});
 }
}
function voxelShowDamage(field,b){
 field.mesh.setColorAt(b.i,field.tint.setHex(b.color).multiplyScalar(.55+.4*b.hp/voxelMaterials[b.type].hp));
 field.mesh.instanceColor.needsUpdate=true;
}
function voxelRemove(field,ids,visual=true){
 if(!ids.length)return;
 const zero=new THREE.Matrix4().makeScale(0,0,0),dead=new Set();
 for(const i of ids){
  const b=field.blocks[i];if(!b?.alive)continue;
  b.alive=false;field.cells.delete(b.key);field.removed.add(i);dead.add(b.bounds);
  field.mesh.setMatrixAt(i,zero);
  if(visual)voxelChip(field,b,5.8);
 }
 if(!dead.size)return;
 bx=bx.filter(bound=>!dead.has(bound));
 field.mesh.instanceMatrix.needsUpdate=true;field.dirty=true;
}
const voxelNeighbors=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
function voxelUnsupported(field){
 const {blocks,support}=field,{links,ground,queue,visited}=support,stamp=++support.stamp;
 let size=0;
 for(const id of ground)if(blocks[id].alive){visited[id]=stamp;queue[size++]=id}
 for(let i=0;i<size;i++){
  const at=queue[i]*6;
  for(let slot=at;slot<at+6;slot++){
   const id=links[slot];
   if(id<0||visited[id]===stamp||!blocks[id].alive)continue;
   visited[id]=stamp;queue[size++]=id;
  }
 }
 if(size===field.cells.size)return [];
 const unsupported=[];
 for(const b of blocks)if(b.alive&&visited[b.i]!==stamp)unsupported.push(b.i);
 return unsupported;
}
function voxelApply(field,hits,force=6){
 const lost=[];
 for(const [id,amount] of hits){
  const b=field.blocks[id];if(!b?.alive||amount<=0)continue;
  b.hp=Math.max(0,b.hp-amount);
  if(b.hp===0)lost.push(id);
  else{voxelShowDamage(field,b);voxelChip(field,b,force*.35)}
 }
 if(lost.length){
  voxelRemove(field,lost);
  const unstable=voxelUnsupported(field);voxelRemove(field,unstable);lost.push(...unstable);
 }
 if(netOn&&isHost&&(hits.length||lost.length))
  netSend({t:'vox-update',gone:lost,damage:hits.flatMap(([id])=>field.blocks[id]?.alive?[[id,field.blocks[id].hp]]:[])});
}
const voxelImpact=w=>w.k==='TEA'?9:Math.max(6,w.d*.87);
function voxelShot(hits,w){
 const field=voxelActive();if(!field||!hits?.size)return;
 const list=[...hits];
 if(netOn&&!isHost){netSend({t:'vox-shots',w:w.k,hits:list});return}
 voxelApply(field,list.map(([id,count])=>[id,voxelImpact(w)*count]),3);
}
function voxelExplosion(p,g){
 const field=voxelActive();
 if(!field||g.w==='TEA'||g.R<.75||g.d<=0||!Number.isFinite(p.x+p.y+p.z+g.R+g.d))return;
 const radius=Math.min(8,g.R),force=Math.min(245,g.d);
 if(netOn&&!isHost){netSend({t:'vox-blast',x:p.x,y:p.y,z:p.z,r:radius,f:force});return}
 const cells=[],size=VOXEL_SIZE,n=Math.ceil(radius/size);
 const [x,y,z]=[p.x,p.y,p.z].map(v=>Math.floor(v/size));
 for(let dx=-n;dx<=n;dx++)for(let dz=-n;dz<=n;dz++)for(let dy=Math.max(-y,-n);dy<=n;dy++){
  const b=field.cells.get(voxelKey(x+dx,y+dy,z+dz));if(!b)continue;
  const distance=Math.hypot((b.x+.5)*size-p.x,(b.y+.5)*size-p.y,(b.z+.5)*size-p.z);
  if(distance<radius)cells.push([b.i,force*(1-distance/(radius*1.36))]);
 }
 voxelApply(field,cells);
}
function voxelNet(d,cn){
 const field=voxelActive();if(!field||!netOn||!cn?.vf)return;
 if(!isHost){
  if(d.t!=='vox-update'||cn.peer!==hostPid||d.id!==hostPid||!Array.isArray(d.gone)||!Array.isArray(d.damage))return;
  voxelRemove(field,d.gone,!d.full);
  for(const [id,hp] of d.damage){
   const b=field.blocks[id];if(!b?.alive||!Number.isFinite(hp)||hp>=b.hp||hp<=0)continue;
   b.hp=hp;voxelShowDamage(field,b);if(!d.full)voxelChip(field,b,1.7);
  }
  return;
 }
 const player=bots.find(b=>b.net&&b.al&&b.id===cn.peer);if(!player)return;
 const eye=V(player.x,(player.y||0)+1.45,player.z),now=performance.now();
 if(d.t==='vox-shots'&&hasOwn(W,d.w)&&Array.isArray(d.hits)&&d.hits.length<=12){
  const weapon=W[d.w];let count=0;const hits=[];
  if(now<(cn.voxNext||0))return;cn.voxNext=now+Math.max(28,weapon.r*550);
  for(const item of d.hits){
   if(!Array.isArray(item))return;
   const [id,pellets]=item,b=field.blocks[id];
   if(!Number.isInteger(id)||!Number.isInteger(pellets)||pellets<1)return;
   count+=pellets;if(count>weapon.pel)return;
   if(!b?.alive)continue;
   const target=V((b.x+.5)*VOXEL_SIZE,(b.y+.5)*VOXEL_SIZE,(b.z+.5)*VOXEL_SIZE),dir=target.clone().sub(eye),range=dir.length();
   if(range<.1||range>(d.w==='TEA'?39:122))continue;
   dir.divideScalar(range);
   if(castW(eye,dir,range)<range-1.02)continue;
   hits.push([id,voxelImpact({k:d.w,d:weapon.d})*pellets]);
  }
  voxelApply(field,hits,3);
 }else if(d.t==='vox-blast'){
  if(now<(cn.voxBlast||0)||![d.x,d.y,d.z,d.r,d.f].every(Number.isFinite))return;
  const point=V(d.x,d.y,d.z);
  if(Math.abs(point.x)>H||Math.abs(point.z)>H||Math.abs(point.y)>25||point.distanceTo(eye)>120)return;
  cn.voxBlast=now+190;voxelExplosion(point,{R:cl(d.r,.75,8),d:cl(d.f,0,190)});
 }
}
function voxelSync(link){
 const field=voxelActive();if(!field||!netOn||!isHost||!link?.open)return;
 sendMatchPacket(link,{t:'vox-update',gone:[...field.removed],full:true,
  damage:field.blocks.filter(b=>b.alive&&b.hp<voxelMaterials[b.type].hp).map(b=>[b.i,b.hp])});
}
function voxelTick(dt){
 const field=voxelActive();if(!field)return;
 if(riverVisual){
  riverVisual.material.uniforms.time.value=gt_;
  riverView(run&&!P.dead&&C.position.y<riverSurface&&riverGround(C.position.x,C.position.z)<riverSurface);
 }
 field.navAt-=dt;
 if(field.dirty&&field.navAt<=0){field.dirty=false;field.navAt=.26;navBuild()}
 if(!field.chips.length){field.debris.count=0;return}
 const {chips,pose,tint,debris}=field;
 for(let i=chips.length-1;i>=0;i--){
  chips[i].t-=dt;if(chips[i].t<=0)chips.splice(i,1);
 }
 for(const [i,c] of chips.entries()){
  c.vy-=17*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;
  if(c.y<.13){c.y=.13;c.vy=Math.abs(c.vy)*.21;c.vx*=.72;c.vz*=.72}
  pose.position.set(c.x,c.y,c.z);pose.rotation.set(c.t*c.spin,c.t*c.spin*.74,c.t*c.spin*1.25);
  pose.scale.setScalar(c.scale*Math.min(1,c.t*5));pose.updateMatrix();
  debris.setMatrixAt(i,pose.matrix);debris.setColorAt(i,tint.setHex(c.color));
 }
 debris.count=chips.length;debris.instanceMatrix.needsUpdate=true;
 if(debris.instanceColor)debris.instanceColor.needsUpdate=true;
}
