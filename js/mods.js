/* The conversion host is trusted. A pack's files run only inside an opaque-origin frame. */
const conversionFormat = (() => {
 const idPattern = '^[a-z][a-z0-9-]*$';
 const pathPattern = '^[a-zA-Z0-9_@.-]+(?:/[a-zA-Z0-9_@.-]+)*$';
 const id = new RegExp(idPattern);
 const sections=['weapons','maps','playlists','mapPatches'];
 const hasNative=pack=>sections.some(key=>pack?.[key]?.length>0);
 const hasScripts=pack=>pack?.version===3&&Array.isArray(pack.scripts)&&pack.scripts.length>0;
 const hasEngine=pack=>plain(pack?.engine)||hasScripts(pack);
 const hasGame=pack=>typeof pack?.entry==='string'||hasEngine(pack);
 const hasStormfront=pack=>plain(pack?.stormfront);
 const path = new RegExp(pathPattern);
 const text = {type:'string',minLength:1};
 const schema = {
  $schema:'https://json-schema.org/draft/2020-12/schema',title:'Spartan Drill .sdmod v2',
  type:'object',additionalProperties:false,required:['format','version','id','name'],
  dependentRequired:{entry:['files']},
  allOf:[
   {if:{required:['files']},then:{anyOf:[{required:['entry']},{required:['mapPatches']},{required:['engine']}]}},
   {if:{required:['engine']},then:{not:{required:['entry']}}},
   {if:{required:['connections']},then:{anyOf:[{required:['entry','files']},{required:['engine']}]}}
  ],
  anyOf:[{required:['entry','files']},{required:['engine']},{required:['stormfront']},...sections.map(key=>({required:[key],properties:{[key]:{minItems:1}}}))],
  properties:{
   format:{const:'spartan-drill-mod'},version:{const:2},id:{type:'string',pattern:idPattern},name:text,
   ...Object.fromEntries(sections.map(key=>[key,{type:'array'}])),
   stormfront:StormfrontData.schema,author:text,description:text,entry:{type:'string',pattern:pathPattern},
   connections:{type:'array',items:{type:'string',format:'uri'}},
   engine:{
    type:'object',additionalProperties:false,minProperties:1,
    properties:{
     page:{type:'string',pattern:pathPattern},
     replace:{type:'object',propertyNames:{pattern:pathPattern},additionalProperties:{type:['string','null']}},
     patches:{type:'array',maxItems:500,items:{
      type:'object',additionalProperties:false,required:['file','find','replace'],
      properties:{file:{type:'string',pattern:pathPattern},find:{type:'string',minLength:1},replace:{type:'string'},count:{type:'integer',minimum:1,maximum:10000}}
     }},
     order:{type:'array',maxItems:128,uniqueItems:true,items:{type:'string',pattern:pathPattern}},
     scripts:{type:'array',maxItems:128,uniqueItems:true,items:{type:'string',pattern:pathPattern}},
     styles:{type:'array',maxItems:128,uniqueItems:true,items:{type:'string',pattern:pathPattern}}
    }
   },
   files:{
    type:'object',minProperties:1,propertyNames:{pattern:pathPattern},
    additionalProperties:{oneOf:[
     {type:'string'},
     {type:'object',additionalProperties:false,required:['base64','type'],
      properties:{base64:{type:'string',pattern:'^[A-Za-z0-9+/]*={0,2}$'},type:{type:'string',pattern:'^[a-zA-Z0-9!#$&^_.+-]+/[a-zA-Z0-9!#$&^_.+-]+$'}}}
    ]}
   }
  }
 };
 const v3Schema={
  ...schema,title:'Spartan Drill .sdmod v3',
  dependentRequired:{...schema.dependentRequired,scripts:['files'],keybinds:['scripts']},
  allOf:[
   {if:{required:['files']},then:{anyOf:[{required:['entry']},{required:['mapPatches']},{required:['engine']},{required:['scripts']}]}},
   {if:{anyOf:[{required:['engine']},{required:['scripts']}]},then:{not:{required:['entry']}}},
   {if:{required:['connections']},then:{anyOf:[{required:['entry','files']},{required:['engine']},{required:['scripts']}]}}
  ],
  anyOf:[...schema.anyOf,{required:['scripts']}],
  properties:{
   ...schema.properties,version:{const:3},
   scripts:{type:'array',minItems:1,maxItems:64,uniqueItems:true,items:{type:'string',pattern:'^[a-zA-Z0-9_@.-]+(?:/[a-zA-Z0-9_@.-]+)*\\.[mM]?[jJ][sS]$'}},
   keybinds:{type:'object',maxProperties:64,propertyNames:{pattern:idPattern},
    additionalProperties:{type:'object',additionalProperties:false,required:['key'],
     properties:{key:{type:'string',pattern:'^(?:[A-Za-z0-9]|[A-Za-z][A-Za-z0-9]{1,31})$'},label:{...text,maxLength:80}}}}
  }
 };
 const plain = value => value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
 function connections(list=[]){
  if(!Array.isArray(list))throw new Error('connections must be an array of server origins.');
  return [...new Set(list.map(value=>{
   let url;
   try{url=new URL(value)}catch{throw new Error('Invalid connection origin.')}
   const loopback=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
   if(typeof value!=='string'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||
      !(['https:','wss:'].includes(url.protocol)||loopback&&['http:','ws:'].includes(url.protocol))){
    throw new Error('Use an HTTPS or WSS origin in connections. Local development servers can use HTTP or WS.');
   }
   if(url.hostname===location.hostname||/(^|\.)peerjs\.com$/i.test(url.hostname.replace(/\.$/,'')))throw new Error('Use a separate server hostname for conversion connections.');
   return url.origin;
  }))];
 }
 function validPath(value){
  return typeof value==='string'&&path.test(value)&&!value.split('/').some(part=>part==='.'||part==='..');
 }
 function validateEngine(pack){
  const engine=pack.engine;
  if(!plain(engine)||!Object.keys(engine).length||Object.hasOwn(pack,'entry'))throw Error('An engine mod needs an engine object and uses engine.page instead of entry.');
  const rules=schema.properties.engine.properties;
  for(const field of Object.keys(engine))if(!Object.hasOwn(rules,field))throw Error('Unknown engine field '+field+'.');
  if(Object.hasOwn(engine,'page')&&!validPath(engine.page))throw Error('Invalid engine.page path.');
  if(Object.hasOwn(engine,'replace')){
   if(!plain(engine.replace))throw Error('engine.replace must map shipped paths to packaged files or null.');
   for(const [target,source] of Object.entries(engine.replace)){
    if(!validPath(target)||source!==null&&(!validPath(source)||!Object.hasOwn(pack.files||{},source)))throw Error('Invalid engine replacement for '+target+'.');
   }
  }
  for(const field of ['order','scripts','styles']){
   if(!Object.hasOwn(engine,field))continue;
   const list=engine[field];
   if(!Array.isArray(list)||list.length>128||list.some(entry=>!validPath(entry))||new Set(list).size!==list.length)throw Error('engine.'+field+' must contain distinct file paths.');
  }
  if(Object.hasOwn(engine,'patches')){
   const list=engine.patches;
   if(!Array.isArray(list)||list.length>500)throw Error('engine.patches must contain at most 500 text replacements.');
   for(const [i,patch] of list.entries()){
    if(!plain(patch)||Object.keys(patch).some(key=>!['file','find','replace','count'].includes(key))||
      !validPath(patch.file)||typeof patch.find!=='string'||!patch.find||typeof patch.replace!=='string'||
      Object.hasOwn(patch,'count')&&(!Number.isInteger(patch.count)||patch.count<1||patch.count>10000))throw Error('Invalid engine.patches['+i+'].');
   }
  }
 }
 function validate(pack){
  if(!plain(pack)||pack.format!=='spartan-drill-mod'||![2,3].includes(pack.version))throw new Error('Expected a Spartan Drill .sdmod version 2 or 3 pack.');
  const selectedSchema=pack.version===3?v3Schema:schema;
  for(const field of Object.keys(pack))if(!Object.hasOwn(selectedSchema.properties,field))throw new Error('Unknown mod field '+field+'.');
  if(typeof pack.id!=='string'||!id.test(pack.id))throw new Error('Mod id must start with a letter and use lowercase letters, numbers or hyphens.');
  for(const field of ['name','author','description']){
   if(field==='name'||Object.hasOwn(pack,field)){
    if(typeof pack[field]!=='string'||!pack[field].trim())throw new Error(field+' must contain text.');
   }
  }
  for(const key of sections){
   if(Object.hasOwn(pack,key)&&!Array.isArray(pack[key]))throw new Error(key+' must be an array.');
  }
  if(Object.hasOwn(pack,'stormfront'))StormfrontData.applyPacks([pack]);
  if(Object.hasOwn(pack,'engine'))validateEngine(pack);
  if(Object.hasOwn(pack,'scripts')){
   if(Object.hasOwn(pack,'entry'))throw new Error('Top-level scripts run in the game engine and cannot be combined with entry.');
   if(!hasScripts(pack)||pack.scripts.length>64||new Set(pack.scripts).size!==pack.scripts.length||
      !pack.scripts.every(name=>validPath(name)&&/\.m?js$/i.test(name)&&typeof pack.files?.[name]==='string')){
    throw new Error('scripts must list 1–64 distinct packaged JavaScript text files.');
   }
  }
  if(Object.hasOwn(pack,'keybinds')){
   if(!hasScripts(pack)||!plain(pack.keybinds)||Object.keys(pack.keybinds).length>64)throw new Error('keybinds requires top-level scripts and a map of binding IDs.');
   const pattern=new RegExp(v3Schema.properties.keybinds.additionalProperties.properties.key.pattern);
   for(const [name,binding] of Object.entries(pack.keybinds)){
    if(!id.test(name)||!plain(binding)||Object.keys(binding).some(field=>!['key','label'].includes(field))||typeof binding.key!=='string'||!pattern.test(binding.key)||
       Object.hasOwn(binding,'label')&&(typeof binding.label!=='string'||!binding.label.trim()||binding.label.length>80))throw new Error('Invalid keybind '+name+'.');
   }
  }
  if(hasEngine(pack)&&!Object.hasOwn(pack,'files')){connections(pack.connections);return pack}
  if(!['entry','files','connections'].some(key=>Object.hasOwn(pack,key))){
   if(!hasNative(pack)&&!hasStormfront(pack))throw new Error('Add native content, Stormfront content, or a custom game.');
   return pack;
  }
  if(!plain(pack.files))throw new Error('files must be an object keyed by packaged file path.');
  for(const [name,file] of Object.entries(pack.files)){
   if(!path.test(name)||name.split('/').some(part=>part==='.'||part==='..'))throw new Error('Invalid packaged path '+name+'.');
   if(typeof file==='string')continue;
   const mime=/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/;
   const base64=/^[A-Za-z0-9+/]*={0,2}$/;
   if(!plain(file)||Object.keys(file).length!==2||!Object.hasOwn(file,'type')||!Object.hasOwn(file,'base64')||
      typeof file.type!=='string'||!mime.test(file.type)||typeof file.base64!=='string'||file.base64.length%4!==0||!base64.test(file.base64)){
    throw new Error('files.'+name+' must be text or an object with a MIME type and padded Base64 data.');
   }
  }
  if(hasEngine(pack)){connections(pack.connections);return pack}
  if(!hasGame(pack)&&!Object.hasOwn(pack,'entry')&&!Object.hasOwn(pack,'connections')&&pack.mapPatches?.length)return pack;
  if(typeof pack.entry!=='string'||!Object.hasOwn(pack.files,pack.entry)||typeof pack.files[pack.entry]!=='string'){
   throw new Error('entry must name a packaged HTML text file.');
  }
  connections(pack.connections);
  return pack;
 }
 const example = {
  format:'spartan-drill-mod',version:2,id:'apex-loop',name:'Apex Loop',author:'Spartan Drill',
  description:'A fullscreen driving demo, an arena playlist, and a Stormfront operation.',
  stormfront:StormfrontData.example.stormfront,
  playlists:[{id:'apex-arena',name:'Apex Arena',base:'Slayer',map:'Dry Dock',bots:4,scoreLimit:8}],
  entry:'index.html',
  files:{
   'index.html':`<title>Apex Loop</title>
<link rel="stylesheet" href="{{file:race.css}}">
<main>
 <section id="garage">
  <h1>Apex Loop</h1><p>Three laps. Use W or ↑ to accelerate, A/D or ←/→ to steer, and S or ↓ to brake.</p>
  <p id="record"></p><button id="start">Start race</button>
 </section>
 <section id="race" hidden>
  <canvas id="track" width="780" height="520" aria-label="Race track"></canvas>
  <div><strong id="race-status"></strong><button id="leave">Garage</button></div>
  <div id="drive" aria-label="Touch driving controls">
   <button data-key="left">Left</button><button data-key="right">Right</button><button data-key="up">Accelerate</button><button data-key="down">Brake</button>
  </div>
 </section>
</main>
<script type="module" src="{{file:race.js}}"></script>`,
   'race.css':`*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;min-height:100dvh;display:grid;place-items:center;color:#eaf7f4;background:radial-gradient(ellipse at 45% 5%,#234a46,#111c27 70%);font:16px system-ui}
main{width:min(94vw,780px)}
h1{margin:0;font-size:clamp(3rem,11vw,7.5rem);line-height:.9;letter-spacing:-.08em}
#garage{min-height:55vh;display:grid;align-content:center;justify-items:start}#garage p{color:#a9c6c0}
button{padding:.65rem .95rem;border:1px solid #466b61;border-radius:3px;background:#c3f96f;color:#122017;font:700 1rem system-ui;cursor:pointer}
#race{position:fixed;inset:0}
canvas{display:block;width:100%;height:100%;background:#172a28}
#race>div{position:absolute;display:flex;align-items:center;gap:8px}
#race>div:not(#drive){top:max(12px,env(safe-area-inset-top));left:12px;right:12px;justify-content:space-between}
#race-status{padding:.55rem .75rem;background:#131c24dc;border-radius:3px;font-variant-numeric:tabular-nums}
#drive{bottom:max(32px,env(safe-area-inset-bottom));left:10px;right:10px;justify-content:center;touch-action:none;flex-wrap:wrap}
@media(hover:hover) and (pointer:fine){#race #drive{display:none}}`,
   'scene.js':`const tau=Math.PI*2;
export function createScene(canvas,radius,halfWidth){
 const gl=canvas.getContext('webgl',{antialias:true});
 if(!gl)throw new Error('Apex Loop needs WebGL to render the track.');
 function shader(type,source){
  const stage=gl.createShader(type);gl.shaderSource(stage,source);gl.compileShader(stage);
  if(!gl.getShaderParameter(stage,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(stage));
  return stage;
 }
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,\`
  attribute vec3 position,color;
  uniform vec3 eye,right,up,forward,car;
  uniform float aspect;
  varying mediump vec3 paint;
  void main(){
   float s=sin(car.z),c=cos(car.z);
   vec3 p=vec3(c*position.x+s*position.z+car.x,position.y,c*position.z-s*position.x+car.y)-eye;
   float depth=dot(p,forward);
   gl_Position=vec4(dot(p,right)*1.6/aspect,dot(p,up)*1.6,depth*1.001-.2,depth);
   paint=mix(color,vec3(.59,.73,.80),smoothstep(45.,150.,depth));
  }
 \`));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,\`
  precision mediump float;
  varying mediump vec3 paint;
  void main(){gl_FragColor=vec4(paint,1.);}
 \`));
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);
 const position=gl.getAttribLocation(program,'position'),color=gl.getAttribLocation(program,'color');
 gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(color);
 const uniforms=Object.fromEntries(['eye','right','up','forward','car','aspect'].map(key=>[key,gl.getUniformLocation(program,key)]));
 const quad=(mesh,a,b,c,d,paint)=>{for(const p of [a,b,c,a,c,d])mesh.push(...p,...paint)};
 function box(mesh,x,y,z,w,h,d,paint){
  const a=x-w/2,b=x+w/2,f=z-d/2,k=z+d/2,t=y+h;
  const p=[a,y,f],q=[b,y,f],r=[b,y,k],s=[a,y,k],u=[a,t,f],v=[b,t,f],j=[b,t,k],l=[a,t,k];
  const shade=n=>paint.map(channel=>channel*n);
  quad(mesh,u,v,j,l,paint);quad(mesh,p,q,v,u,shade(.61));quad(mesh,q,r,j,v,shade(.75));
  quad(mesh,r,s,l,j,shade(.92));quad(mesh,s,p,u,l,shade(.82));
 }
 const track=[],vehicle=[];
 quad(track,[-180,-.04,-180],[180,-.04,-180],[180,-.04,180],[-180,-.04,180],[.25,.43,.25]);
 function strip(start,end,inside,outside,y,paint){
  const p=(angle,r)=>[Math.cos(angle)*r,y,Math.sin(angle)*r];
  quad(track,p(start,inside),p(start,outside),p(end,outside),p(end,inside),paint);
 }
 for(let i=0;i<144;i++){
  const a=i*tau/144,b=(i+1)*tau/144,inner=radius-halfWidth,outer=radius+halfWidth;
  strip(a,b,inner,outer,.01,i%2?[.25,.27,.29]:[.255,.275,.295]);
  const curb=i%2?[.82,.19,.13]:[.88,.84,.71];
  strip(a,b,inner-.6,inner,.025,curb);strip(a,b,outer,outer+.6,.025,curb);
  if(i%4===0)strip(a,b,radius-.08,radius+.08,.026,[.79,.72,.48]);
 }
 for(let row=0;row<2;row++)for(let i=0;i<12;i++){
  const x=radius-halfWidth+i;
  const z=row*.48-.48;
  quad(track,[x,.035,z],[x+1,.035,z],[x+1,.035,z+.48],[x,.035,z+.48],(i+row)%2?[.12,.13,.16]:[.96,.96,.91]);
 }
 for(const side of [-1,1])box(track,radius+side*(halfWidth+1),0,0,.38,2.8,.38,[.87,.73,.29]);
 box(vehicle,0,.25,0,1.65,.61,3,[.55,.87,.22]);
 box(vehicle,0,.84,-.18,1.23,.52,1.44,[.16,.27,.33]);
 for(const x of [-.85,.85])for(const z of [-.96,.96])box(vehicle,x,.08,z,.33,.48,.68,[.12,.13,.14]);
 for(const x of [-.54,.54])box(vehicle,x,.5,-1.54,.33,.16,.07,[.96,.31,.19]);
 function buffer(vertices){
  const data=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,data);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  return {data,count:vertices.length/6};
 }
 const road=buffer(track),car=buffer(vehicle);
 function draw(mesh,x,z,heading){
  gl.bindBuffer(gl.ARRAY_BUFFER,mesh.data);
  gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(color,3,gl.FLOAT,false,24,12);
  gl.uniform3f(uniforms.car,x,z,heading);gl.drawArrays(gl.TRIANGLES,0,mesh.count);
 }
 return (x,z,heading)=>{
  const pixelRatio=Math.min(window.devicePixelRatio||1,1.5);
  const width=Math.max(1,Math.round(canvas.clientWidth*pixelRatio));
  const height=Math.max(1,Math.round(canvas.clientHeight*pixelRatio));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  const sx=Math.sin(heading),sz=Math.cos(heading),length=Math.hypot(14,3.7),f=14/length,u=3.7/length;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.59,.73,.80,1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(uniforms.aspect,canvas.width/canvas.height);
  gl.uniform3f(uniforms.eye,x-sx*8,4.3,z-sz*8);
  gl.uniform3f(uniforms.right,-sz,0,sx);
  gl.uniform3f(uniforms.up,sx*u,f,sz*u);
  gl.uniform3f(uniforms.forward,sx*f,-u,sz*f);
  draw(road,0,0,0);draw(car,x,z,heading);
 };
}
`,
   'race.js':`import {createScene} from '@mod/scene.js';
const byId=id=>document.getElementById(id);
const garage=byId('garage'),race=byId('race'),canvas=byId('track'),status=byId('race-status');
const keys=new Set(),controls={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right'};
const radius=36,halfWidth=6,tau=2*Math.PI;
const wrap=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));
const saved=await SpartanMod.load().catch(()=>null);
let record=saved?.track==='3d'&&typeof saved.time==='number'?saved.time:null;
const recordText=()=>byId('record').textContent=record===null?'No track record yet':'Track record '+record.toFixed(2)+'s';
recordText();
let draw;
try{draw=createScene(canvas,radius,halfWidth)}
catch(error){byId('record').textContent=error.message;byId('start').disabled=true}
let running=false,frame,last,time,x,z,heading,speed,lap,checkpoint;
addEventListener('keydown',e=>{if(controls[e.code]&&!race.hidden){e.preventDefault();keys.add(controls[e.code])}});
addEventListener('keyup',e=>keys.delete(controls[e.code]));
addEventListener('blur',()=>keys.clear());
for(const b of document.querySelectorAll('#drive button')){
 b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)};
 b.onlostpointercapture=()=>keys.delete(b.dataset.key);
}
function update(now){
 if(!running)return;
 const dt=Math.min(.05,(now-last)/1000);last=now;
 const angle=Math.atan2(z,x),distance=Math.hypot(x,z),onRoad=Math.abs(distance-radius)<halfWidth;
 speed=Math.max(0,Math.min(onRoad?19:8,speed+((keys.has('up')?9:-3)-(keys.has('down')?18:0))*dt));
 const steer=Number(keys.has('left'))-Number(keys.has('right'));
 // When the wheel is released, help the driver follow the curve back toward the center line.
 const tangent=-angle-Math.atan((distance-radius)*.17);
 heading+=speed*(steer*.075+(steer?0:wrap(tangent-heading)*.16))*dt;
 x+=Math.sin(heading)*speed*dt;z+=Math.cos(heading)*speed*dt;
 const next=Math.atan2(z,x),sector=Math.floor(((next+tau)%tau)/(tau/4));
 if(onRoad&&wrap(next-angle)>0&&sector===(checkpoint+1)%4){
  checkpoint=sector;if(sector===0)lap++;
 }
 if(time>0||speed>0)time+=dt;
 status.textContent='Lap '+Math.min(lap+1,3)+' / 3  ·  '+time.toFixed(2)+'s';
 draw(x,z,heading);
 if(lap===3){
  running=false;status.textContent='3 / 3 laps · Finished in '+time.toFixed(2)+'s';
  if(record===null||time<record){record=time;recordText();SpartanMod.save({track:'3d',time}).catch(console.warn)}
 }else frame=requestAnimationFrame(update);
}
byId('start').onclick=()=>{
 if(!draw)return;
 garage.hidden=true;race.hidden=false;keys.clear();
 if(document.fullscreenEnabled&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});
 x=radius;z=0;heading=speed=lap=checkpoint=time=0;last=performance.now();running=true;
 draw(x,z,heading);frame=requestAnimationFrame(update);
};
byId('leave').onclick=()=>{
 running=false;cancelAnimationFrame(frame);race.hidden=true;garage.hidden=false;keys.clear();
 if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
};
`
  }
 };
 function authorSchema(stock,version=3){
  const base=version===2?schema:v3Schema;
  return {...base,properties:{...base.properties,...Object.fromEntries(sections.map(key=>[key,stock.properties[key]]))}};
 }
 return {id,sections,hasNative,hasGame,hasEngine,hasScripts,hasStormfront,connections,authorSchema,example,validate};
})();

const modDatabase = (() => {
 let opening;
 function describe(pack){
  const {id,name,version,author,description}=pack;
  const summary={id,name,version,author,description};
  summary.native=conversionFormat.hasNative(pack);
  summary.game=conversionFormat.hasGame(pack);summary.engine=conversionFormat.hasEngine(pack);
  summary.stormfront=conversionFormat.hasStormfront(pack);
  summary.playlists=(pack.playlists||[]).map(({name})=>({name}));
  return summary;
 }
 function database(){
  if(!opening)opening=new Promise((resolve,reject)=>{
   const request=indexedDB.open('spartan-drill-mods',2);
   request.onupgradeneeded=event=>{
    const db=request.result;
    if(event.oldVersion===0){
     db.createObjectStore('packs',{keyPath:'id'});
     db.createObjectStore('saves');
    }
    if(event.oldVersion<2){
     const catalog=db.createObjectStore('catalog',{keyPath:'id'});
     if(event.oldVersion===1){
      const source=request.transaction.objectStore('packs').openCursor();
      source.onsuccess=()=>{
       const cursor=source.result;
       if(!cursor)return;
       catalog.put(describe(cursor.value));cursor.continue();
      };
     }
    }
   };
   request.onsuccess=()=>{
    const db=request.result;
    db.onversionchange=()=>{db.close();opening=null};
    resolve(db);
   };
   request.onerror=()=>reject(request.error);
   request.onblocked=()=>reject(new Error('The mod library is busy in another tab.'));
  }).catch(error=>{opening=null;throw error});
  return opening;
 }
 async function access(stores,mode,action){
  const db=await database();
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(stores,mode),request=action(tx);
   tx.oncomplete=()=>resolve(request.result);
   tx.onabort=()=>reject(tx.error||new Error('Mod storage operation was cancelled.'));
  });
 }
 return {
  describe,
  list:()=>access('catalog','readonly',tx=>tx.objectStore('catalog').getAll()),
  read:id=>access('packs','readonly',tx=>tx.objectStore('packs').get(id)),
  put:pack=>access(['catalog','packs'],'readwrite',tx=>{
   tx.objectStore('catalog').put(describe(pack));
   return tx.objectStore('packs').put(pack);
  }),
  remove:id=>access(['catalog','packs'],'readwrite',tx=>{
   tx.objectStore('catalog').delete(id);
   return tx.objectStore('packs').delete(id);
  }),
  load:id=>access('saves','readonly',tx=>tx.objectStore('saves').get(id)),
  save:(id,data)=>access('saves','readwrite',tx=>tx.objectStore('saves').put(data,id)),
  clear:id=>access('saves','readwrite',tx=>tx.objectStore('saves').delete(id))
 };
})();


const engineScripts=['stormfront-data','world','systems','net-safety','interface','menus','zombies','mods','streaks']
 .map(name=>'js/'+name+'.js');
const engineFiles=[
 'index.html','style.css',...engineScripts,
 'assets/classic-crossroads.webp','assets/shardworks.webp','assets/stormfront.webp','assets/earth-orbit.js'
];
const engineDependencies=[
 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js'
];

// The trusted conversion host can load a classic script beside conversion.html even when
// a file:// browser blocks fetch() of sibling files. The sandbox only receives its contents.
let bundledEngineSource;
function localEngineSource(){
 if(!bundledEngineSource)bundledEngineSource=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='js/engine-source.js';
  script.onload=()=>{
   const files=window.SD_BUNDLED_ENGINE_SOURCE;
   delete window.SD_BUNDLED_ENGINE_SOURCE;
   script.remove();
   if(!files||typeof files!=='object')reject(Error('The bundled Spartan Drill engine files could not be read.'));
   else resolve(files);
  };
  script.onerror=()=>{
   script.remove();
   reject(Error('Spartan Drill’s engine source bundle is missing. Open the complete game folder.'));
  };
  document.head.append(script);
 }).catch(error=>{bundledEngineSource=null;throw error});
 return bundledEngineSource;
}

async function prepareEngine(pack,status){
 const config=pack.engine||{},virtual=Object.assign(Object.create(null),pack.files||{});
 const runtime='js/mod-game.js',apiStyle='js/mod-game.css',v3=pack.version===3;
 const api=v3&&config.replace?.[runtime]!==null&&(!config.order||conversionFormat.hasScripts(pack)||config.order.includes(runtime));
 const shipped=api?[...engineFiles,runtime,apiStyle]:engineFiles;
 const needed=shipped.filter(path=>!Object.hasOwn(virtual,path)&&!Object.hasOwn(config.replace||{},path));
 if(needed.length)status.textContent='Loading the Spartan Drill engine…';
 const readServed=async path=>{
  const response=await fetch(path,{mode:'same-origin',redirect:'error',cache:'no-cache'});
  if(!response.ok)throw Error('Could not read the shipped '+path+'.');
  const file=await response.blob();
  if(!path.endsWith('.webp'))return file.text();
  return {type:'image/webp',base64:await new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>resolve(String(reader.result).split(',')[1]);
   reader.onerror=()=>reject(reader.error);
   reader.readAsDataURL(file);
  })};
 };
 const readBundled=async()=>{
  if(!needed.length)return [];
  const files=await localEngineSource();
  return needed.map(path=>{
   if(!Object.hasOwn(files,path))throw Error('The installed engine bundle is missing '+path+'.');
   return [path,files[path]];
  });
 };
 const results=location.protocol==='file:'
  ?await readBundled()
  :await Promise.all(needed.map(async path=>[path,await readServed(path)])).catch(readBundled);
 for(const [path,asset] of results)virtual[path]=asset;
 for(const [path,asset] of Object.entries(config.replace||{})){
  if(asset===null)delete virtual[path];else virtual[path]=pack.files[asset];
 }
 for(const [i,edit] of (config.patches||[]).entries()){
  if(typeof virtual[edit.file]!=='string')throw Error('Patch '+(i+1)+' needs a text file at '+edit.file+'.');
  const fragments=virtual[edit.file].split(edit.find),count=fragments.length-1,expected=edit.count??1;
  if(count!==expected)throw Error('Patch '+(i+1)+' in '+edit.file+' expected '+expected+' match(es), found '+count+'.');
  virtual[edit.file]=fragments.join(edit.replace);
 }
 const page=config.page||'index.html',styles=[...(config.styles||[])];
 const scripts=[...(config.order||engineScripts.filter(path=>Object.hasOwn(virtual,path))),...(config.scripts||[])];
 if(api&&!scripts.includes(runtime))scripts.push(runtime);
 if(api&&Object.hasOwn(virtual,apiStyle)&&!styles.includes(apiStyle))styles.push(apiStyle);
 if(typeof virtual[page]!=='string')throw Error('The engine page '+page+' is missing or is not HTML text.');
 if(new Set(scripts).size!==scripts.length)throw Error('A file appears twice in the engine script order.');
 for(const name of [...scripts,...styles]){
  if(typeof virtual[name]!=='string')throw Error('Engine file '+name+' is missing or is not text.');
 }
 return {files:virtual,page,scripts,styles,native:conversionFormat.hasNative(pack),v3};
}

/* Serialized into the frame before any conversion content is read. */
function conversionGuest(){
 'use strict';
 const scriptEnd='</scr'+'ipt>';
 const types={html:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',json:'application/json',
  svg:'image/svg+xml',txt:'text/plain',csv:'text/csv',wgsl:'text/plain',vert:'text/plain',frag:'text/plain'};
 function launch(event){
  if(event.source!==parent||event.data?.type!=='sd-conversion-start'||event.ports.length!==1)return;
  removeEventListener('message',launch);
  const {pack,policy,engine}=event.data,port=event.ports[0],pending=new Map();
  const files=engine?.files||pack.files;
  const urls=new Map(),resolving=new Set(),encoder=new TextEncoder(),decoder=new TextDecoder();
  let serial=0;
  port.onmessage=({data})=>{
   const request=pending.get(data?.id);
   if(!request)return;
   pending.delete(data.id);
   if(data.error)request.reject(new Error(data.error));else request.resolve(data.value);
  };
  function storage(type,value){
   return new Promise((resolve,reject)=>{
    const id=++serial;
    pending.set(id,{resolve,reject});
    try{port.postMessage({type,value,id})}catch(error){pending.delete(id);reject(error)}
   });
  }
  function file(path){
   if(!Object.hasOwn(files,path))throw new Error('Missing packaged file '+path);
   return files[path];
  }
  function localResource(value,owner){
   if(!engine||!value||value.startsWith('#'))return value;
   const base='https://engine-mod.invalid/';
   try{
    const resolved=new URL(value,new URL(owner,base));
    const path=decodeURIComponent(resolved.pathname.slice(1));
    return resolved.origin===new URL(base).origin&&Object.hasOwn(files,path)?url(path):value;
   }catch(error){
    if(error instanceof TypeError||error instanceof URIError)return value;
    throw error;
   }
  }
  const cssLinks=(source,owner)=>source.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/g,(original,double,single,bare)=>{
   const value=(double??single??bare).trim(),href=localResource(value,owner);
   return href===value?original:'url("'+href+'")';
  });
  const tokens=source=>source.replace(/\{\{file:([a-zA-Z0-9_@./-]+)\}\}/g,(_,path)=>url(path));
  const mime=(path,asset)=>typeof asset==='string'?(types[path.split('.').at(-1).toLowerCase()]||'text/plain'):asset.type;
  function bytes(asset){
   if(typeof asset==='string')return encoder.encode(asset);
   return Uint8Array.fromBase64?Uint8Array.fromBase64(asset.base64):Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0));
  }
  function url(path){
   if(urls.has(path))return urls.get(path);
   if(resolving.has(path))throw new Error('Circular file token reference at '+path);
   resolving.add(path);
   try{
    const asset=file(path),type=mime(path,asset);
    const content=type==='text/css'&&typeof asset==='string'?cssLinks(tokens(asset),path):bytes(asset);
    const result=URL.createObjectURL(new Blob([content],{type}));
    urls.set(path,result);
    return result;
   }finally{resolving.delete(path)}
  }
  let startEngine,game;
  if(engine){
   // An opaque frame has no origin storage. Supply a fresh in-memory version for stock UI code only.
   const memory=()=>{
    const entries=new Map();
    return {
     get length(){return entries.size},
     key:i=>Array.from(entries.keys())[i]??null,
     getItem:key=>entries.get(String(key))??null,
     setItem:(key,value)=>entries.set(String(key),String(value)),
     removeItem:key=>entries.delete(String(key)),
     clear:()=>entries.clear()
    };
   };
   for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{value:memory(),configurable:true});
   Object.defineProperty(window,'SD_ENGINE_MOD',{value:true});
   window.SD_MOD_SESSION=engine.native||engine.v3;
   if(engine.v3){
    Object.defineProperty(window,'SD_SCRIPT_MOD',{value:true});
    Object.defineProperty(window,'__sdInstallModGame',{configurable:true,value:api=>{game=api;delete window.__sdInstallModGame}});
   }
   window.SD_SPLIT=null;
   window.__SD_STORAGE=window.localStorage;
   window.__SD_MODE='engine';
   if(engine.native)sessionStorage.setItem('sd-mod-launch-v1',JSON.stringify(pack));
   let started=false;
   startEngine=()=>{
    if(started)return;
    started=true;
    const code='(function(__BUILD,__MODE,localStorage){\n'+engine.scripts.map(name=>file(name)).join('\n;\n')+
     '\n})("engine-mod","engine",window.__SD_STORAGE);\n//# sourceURL=sdmod-engine.js';
    const source=URL.createObjectURL(new Blob([code],{type:'text/javascript'})),script=document.createElement('script');
    script.src=source;
    script.onload=async()=>{
     URL.revokeObjectURL(source);
     const modules=pack.scripts||[];
     if(modules.length)document.body.inert=true;
     dispatchEvent(new Event('sd-ready'));
     try{
      if(modules.length&&!game)throw Error('The engine did not initialize SpartanMod.game.');
      for(const name of modules)await import(url(name));
     }catch(error){
      console.error(error);
      const alert=document.createElement('p');
      alert.setAttribute('role','alert');alert.className='sd-script-error';
      alert.textContent='Could not load mod scripts. '+error.message;document.body.append(alert);
     }finally{if(modules.length)document.body.inert=false}
    };
    script.onerror=()=>{
     URL.revokeObjectURL(source);
     const alert=document.createElement('p');alert.setAttribute('role','alert');alert.textContent='Could not load the engine source.';document.body.append(alert);
    };
    document.body.append(script);
   };
  }
  Object.defineProperty(window,'SpartanMod',{value:Object.freeze({
   id:pack.id,name:pack.name,files:Object.freeze(Object.keys(files)),
   get game(){return game},
   content:{weapons:pack.weapons||[],maps:pack.maps||[],playlists:pack.playlists||[],mapPatches:pack.mapPatches||[]},
   ...engine&&{engine:Object.freeze({start:startEngine,has:path=>Object.hasOwn(files,path),
    keybinds:Object.freeze(Object.fromEntries(Object.entries(pack.keybinds||{}).map(([id,binding])=>[id,Object.freeze({...binding})])))})},
   url,readText:path=>{const asset=file(path);return typeof asset==='string'?asset:decoder.decode(bytes(asset))},
   readBytes:path=>bytes(file(path)),
   load:()=>storage('load'),save:value=>storage('save',value),clearSave:()=>storage('clear')
  })});
  try{
   const imports=Object.fromEntries(Object.keys(files).filter(path=>/\.(m?js)$/i.test(path)).map(path=>['@mod/'+path,url(path)]));
   const importMap=JSON.stringify({imports}).replace(/</g,'\\u003c');
   let html=tokens(file(engine?.page||pack.entry)).replace(/^\s*<!doctype[^>]*>/i,'');
   if(engine){
    const page=new DOMParser().parseFromString(html,'text/html');
    for(const meta of page.querySelectorAll('meta[http-equiv]')){
     if(meta.httpEquiv.toLowerCase()==='content-security-policy')meta.remove();
    }
    const loader=page.querySelector('script#sd-game-loader');
    if(engine.v3)for(const script of page.querySelectorAll('script[src]')){
     if(script.getAttribute('src').includes('/peerjs/'))script.remove();
    }
    if(loader){
     loader.removeAttribute('src');
     loader.textContent='SpartanMod.engine.start()';
    }
    for(const element of page.querySelectorAll('[src],[href],[poster],[style]')){
     for(const attr of ['src','href','poster']){
      if(element.hasAttribute(attr))element.setAttribute(attr,localResource(element.getAttribute(attr),engine.page));
     }
     if(element.hasAttribute('style'))element.setAttribute('style',cssLinks(element.getAttribute('style'),engine.page));
    }
    for(const style of page.querySelectorAll('style'))style.textContent=cssLinks(style.textContent,engine.page);
    for(const file of engine.styles){
     const link=page.createElement('link');link.rel='stylesheet';link.href=url(file);page.head.append(link);
    }
    html=page.documentElement.outerHTML;
   }
   document.open();
   document.write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<meta http-equiv="Content-Security-Policy" content="'+policy+'">'+
    '<meta name="referrer" content="no-referrer"><script type="importmap">'+importMap+scriptEnd+html);
   document.close();
  }catch(error){
   document.body.textContent='Could not load conversion. '+error.message;
  }
 }
 addEventListener('message',launch);
 parent.postMessage({type:'sd-conversion-ready'},'*');
}

async function openConversion(){
 const status=document.querySelector('#conversion-status');
 const frame=document.querySelector('#conversion-frame');
 try{
  const id=location.hash.slice(1);
  if(!conversionFormat.id.test(id))throw new Error('Choose a full conversion from Mods.');
  const pack=conversionFormat.validate(await modDatabase.read(id));
  if(!conversionFormat.hasGame(pack))throw new Error('This mod adds content to Spartan Drill. Enable it from Mods.');
  if(new URLSearchParams(location.search).get('resumeMod')==='1')document.querySelector('#conversion-exit').href='index.html?sdMod=1&mods=1';
  const engine=conversionFormat.hasEngine(pack)?await prepareEngine(pack,status):null;
  const connections=conversionFormat.connections(pack.connections);
  const dependencies=engine?.v3?engineDependencies.slice(0,1):engineDependencies;
  const policy=[
   "default-src 'none'","script-src 'unsafe-inline' 'unsafe-eval' blob: data:"+(engine?' '+dependencies.join(' '):''),
   "style-src 'unsafe-inline' blob: data:","img-src blob: data:","media-src blob: data:",
   "font-src blob: data:","worker-src blob: data:","frame-src blob: data:",
   "connect-src "+["blob:","data:",...connections].join(' '),"base-uri 'none'","form-action 'none'"
  ].join('; ');
  document.title=pack.name+' · Spartan Drill Mods';
  frame.title=pack.name;
  function ready(event){
   if(event.source!==frame.contentWindow||event.origin!=='null'||event.data?.type!=='sd-conversion-ready')return;
   removeEventListener('message',ready);
   const channel=new MessageChannel();
   let saving=false;
   // Only this port can access the save for this pack. The caller supplies no destination or storage key.
   channel.port1.onmessage=async({data})=>{
    if(!data||!Number.isSafeInteger(data.id))return;
    const {id:request,type,value}=data;
    if(!['load','save','clear'].includes(type))return;
    if(saving){channel.port1.postMessage({id:request,error:'Wait for the previous mod save operation.'});return}
    saving=true;
    try{
     const result=type==='load'?await modDatabase.load(id):type==='save'?await modDatabase.save(id,value):await modDatabase.clear(id);
     channel.port1.postMessage({id:request,value:type==='load'?result:undefined});
    }catch(error){channel.port1.postMessage({id:request,error:error.message||'Mod save failed.'})}
    finally{saving=false}
   };
   addEventListener('pagehide',()=>channel.port1.close(),{once:true});
   frame.contentWindow.postMessage({type:'sd-conversion-start',pack,policy,engine},'*',[channel.port2]);
   status.hidden=true;
  }
  addEventListener('message',ready);
  frame.srcdoc='<!doctype html><meta charset="utf-8"><meta name="referrer" content="no-referrer">'+
   '<meta http-equiv="Content-Security-Policy" content="'+policy+'"><body><script>('+conversionGuest.toString()+')()<'+ '/script>';
 }catch(error){status.textContent=error.message}
}

if(document.querySelector('#conversion-frame'))openConversion();

;
/* Spartan Drill Mod Kit. Packs are validated data. The match runs in a fresh game instance. */
let modRules = {};
const modPlaylists=new Map();
let activeMod=null,modLobbyLoadout=null;
const modModeKey=id=>'mod-mode:'+id;
const modKit = (() => {
 const bases = ['Slayer','Team Deathmatch','Capture the Flag','Domination','Hardpoint','Kill Confirmed','Time Attack','Survival','Zombies','One in the Chamber','Gun Game','Objective Course'];
 const surfaces = ['brick','stucco','plank','concrete','asphalt','grass','shingle','tile','metal','sand','rust','cobble','glass','glow'];
 const weaponBases = ['AR','SMG','BR','SG','MG','MP','VA','BP','KTS','RD','HC','AN','OH','SW','LT','PD','MVR','TRB','TUR','VMP','CT','CY','SN','RG','RL','TEA'];
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
 const asset=text(160),patchAt=tuple(num(-512,512),num(-512,512));
 const region={at:patchAt,radius:num(.1,512)};
 const mapTexture={file:asset,tileSize:num(.08,120),roughness:num(0,1),metalness:num(0,1)};
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
   mapPatches:arr(obj({
    map:text(60),sky:color,ground:color,wall:color,surface:choice(...surfaces.slice(0,-2)),
    groundTexture:obj(mapTexture,['file']),
    textures:arr(obj({...mapTexture,surface:choice(...surfaces,'flat','foliage','glassL'),...region},['surface','file']),0,48),
    removeBoxes:arr(obj(region,['at','radius']),0,80),removeProps:arr(obj(region,['at','radius']),0,80),
    replaceBoxes:{type:'boolean'},replaceProps:{type:'boolean'},
    boxes:arr(obj({...prop,at:patchAt},['at','size','color']),0,340),
    props:arr(obj({...prop,at:patchAt,shape:choice('box','cylinder','sphere','cone')},['at','size','color']),0,220),
    models:arr(obj({
     file:asset,at:patchAt,elevation:num(-16,72),scale:num(.01,48),rotation:num(-360,360),
     color,texture:asset
    },['file','at']),0,48)
   },['map']),0,24),
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
   },['id','name','base','map']),0,24)
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
  if([2,3].includes(pack?.version)){
   for(const key of conversionFormat.sections){
    if(hasOwn(pack,key))check(pack[key],schema.properties[key],'mod.'+key);
   }
  }else{
   if(hasOwn(pack,'mapPatches'))fail('mod.mapPatches','requires version 2');
   check(pack,schema,'mod');
   if(!pack.playlists.length)fail('mod.playlists','version 1 needs at least one playlist');
  }
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
   const key=currentMapName(game.map),custom=key.startsWith('@'),map=custom?sections.maps.get(key.slice(1)):hasOwn(MAPS,key)&&MAPS[key];
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
  const patched=new Set();
  for(const patch of pack.mapPatches||[]){
   const key=currentMapName(patch.map),label='mapPatches.'+patch.map,map=hasOwn(MAPS,key)&&MAPS[key];
   if(!map||key.startsWith('@')||map.modName)fail(label,'choose a built-in map');
   if(patched.has(key))fail(label,'combine edits to this map in one patch');
   patched.add(key);
   for(const texture of patch.textures||[]){
    if(Boolean(texture.at)!==(texture.radius!==undefined))fail(label+'.textures','provide both at and radius for a local texture');
    modImageAsset(pack,texture.file,label);
   }
   if(patch.groundTexture)modImageAsset(pack,patch.groundTexture.file,label);
   const models=new Set();
   for(const model of patch.models||[]){
    if(!models.has(model.file)){modObjAsset(pack,model.file,label);models.add(model.file)}
    if(model.texture)modImageAsset(pack,model.texture,label);
   }
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
 setObjectiveText(heading);
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
 clock.hidden=!modRules.timeSeconds||mode==='Time Attack';
 clock.textContent='';
 if(modRules.objectives)modObjectiveNext(0);
}

function modTimeTick(){
 if(!modRules.timeSeconds||mode==='Time Attack')return false;
 const remaining=Math.max(0,Math.ceil(modRules.timeSeconds-t0));
 const clock=$('#mod-clock'),text=remaining+'s left';
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
 installMapPatches(pack);
 const zombies=$('#mod-zplaylist'),standard=document.createElement('option');
 standard.value='';standard.textContent='Standard Survival';zombies.append(standard);
 for(const game of pack.playlists||[]){
  const key=modModeKey(game.id);
  const map=currentMapName(game.map);
  modPlaylists.set(key,map===game.map?game:{...game,map});
  if(game.base==='Zombies'){
   const option=document.createElement('option');option.value=key;option.textContent=game.name;zombies.append(option);
  }else{
   MODES[key]=game.description||game.name;
   modeLabels[key]=game.name;
  }
 }
 if(conversionFormat.hasGame(pack)){
  for(const button of $$('.mod-play')){
   button.textContent='Play '+pack.name;
   button.onclick=()=>launchModGame(pack);
   button.hidden=false;
  }
 }
 $('#go').textContent='Play local';
 $('#hmp .home-mode > span').textContent='Local arena matches with bots';
 $('#hz .home-mode > span').textContent='Solo survival';
 $('#mod-zops').hidden=zombies.options.length<2;
 zombies.onchange=modZombiePlaylist;
 $('#md').replaceChildren();$('#mp').replaceChildren();
 for(const status of $$('.mod-active-status')){
  status.textContent='Mods loaded';
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

const stormfrontModKey='sd-stormfront-enabled';
function stormfrontModIds(){
 try{return JSON.parse(localStorage.getItem(stormfrontModKey)||'[]').filter(id=>typeof id==='string').slice(0,12)}catch{return []}
}
async function stormfrontMods(){
 const files=await Promise.all(stormfrontModIds().map(id=>modDatabase.read(id)));
 return files.filter(pack=>conversionFormat.hasStormfront(pack));
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
function modSetActive(pack,persisted){
 if(pack)sessionStorage.setItem(modLaunchKey,JSON.stringify(persisted?pack.id:pack));
 else sessionStorage.removeItem(modLaunchKey);
 location.replace(modPageURL(!!pack));
}

function validateInstalledMod(pack){
 if([2,3].includes(pack?.version))conversionFormat.validate(pack);
 return modKit.validate(pack);
}
function launchModGame(pack){
 const launch=new URL('conversion.html',location.href);
 launch.hash=pack.id;
 if(activeMod)launch.searchParams.set('resumeMod','1');
 location.assign(launch);
}
async function modLibraryUI(){
 const panel=$('#mods-panel'),list=$('#mods-library'),status=$('#mods-status'),zone=$('#mods-drop'),input=$('#mods-file');
 const storageKey='sd-mod-library-v1',library=new Map(),persisted=new Set();
 let importing=false,canPersist=true;
 const note=message=>{status.textContent=message};
 const button=(label,action)=>{
  const item=document.createElement('button');item.type='button';item.className='btn alt';item.textContent=label;item.onclick=action;return item;
 };
 const download=(name,value)=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const open=()=>{render();panel.showModal();$('#mods-browse').focus()};
 for(const button of $$('.mods-open'))button.onclick=open;
 $('#mods-close').onclick=()=>panel.close();
 const url=new URL(location.href);
 if(url.searchParams.get('mods')==='1'){
  const backTo=url.searchParams.get('modMenu');
  if(backTo==='mp'||backTo==='zm')setApp(backTo);
  url.searchParams.delete('mods');url.searchParams.delete('modMenu');
  try{history.replaceState(null,'',url)}catch{}
  open();note('Loading installed mods…');
 }
 $('#mods-browse').disabled=$('#mods-example').disabled=true;
 try{
  const saved=await modDatabase.list();
  for(const pack of saved){library.set(pack.id,pack);persisted.add(pack.id)}
 }catch{canPersist=false}
 try{
  const legacy=JSON.parse((window.SD_MOD_LIBRARY?window.SD_MOD_LIBRARY.read():localStorage.getItem(storageKey))||'[]');
  for(const pack of (Array.isArray(legacy)?legacy:[])){
   if(library.has(pack?.id))continue;
   try{modKit.validate(pack)}catch{continue}
   if(canPersist){await modDatabase.put(pack);persisted.add(pack.id)}
   library.set(pack.id,canPersist?modDatabase.describe(pack):pack);
  }
  if(canPersist){if(window.SD_MOD_LIBRARY)window.SD_MOD_LIBRARY.clear();else localStorage.removeItem(storageKey)}
 }catch{}
 if(activeMod&&!library.has(activeMod.id))library.set(activeMod.id,activeMod);
 if(panel.open){render();note('');$('#mods-browse').focus()}
 $('#mods-browse').disabled=$('#mods-example').disabled=false;
 function render(){
  list.replaceChildren();
  if(!library.size){const empty=document.createElement('p');empty.textContent='No mods installed.';list.append(empty);return}
  for(const pack of library.values()){
   const card=document.createElement('article'),header=document.createElement('header'),name=document.createElement('h3'),description=document.createElement('p');
   name.textContent=pack.name;description.textContent=[pack.author,pack.description].filter(Boolean).join(' · ');
   const game=pack.game??(conversionFormat.hasGame(pack)||pack.version===2&&pack.native===undefined&&!conversionFormat.hasNative(pack));
   const native=pack.native??conversionFormat.hasNative(pack),enabled=activeMod?.id===pack.id;
   const storm=pack.stormfront===true||conversionFormat.hasStormfront(pack),stormEnabled=stormfrontModIds().includes(pack.id);
   header.append(name);
   if(native)header.append(button(enabled?'Disable':'Enable',()=>activate(enabled?null:pack)));
   if(storm)header.append(button(stormEnabled?'Disable Stormfront':'Enable Stormfront',async()=>{
    try{
     const ids=stormfrontModIds().filter(id=>id!==pack.id);
     if(!stormEnabled)ids.push(pack.id);
     const packs=await Promise.all(ids.map(id=>modDatabase.read(id)));
     if(packs.some(data=>!data))throw Error('Install the pack before enabling it.');
     StormfrontData.applyPacks(packs);
     localStorage.setItem(stormfrontModKey,JSON.stringify(ids));render();
     note('Stormfront content '+(stormEnabled?'disabled.':'enabled. Open Stormfront to deploy.'));
    }catch(error){note(error.message)}
   }));
   if(game)header.append(button('Launch',()=>activate(pack,true)));
   header.append(button('Export',async()=>{
     try{
      const payload=persisted.has(pack.id)?await modDatabase.read(pack.id):pack;
      if(!payload)throw new Error('This pack is no longer installed.');
      download(pack.id+'.sdmod',payload);
     }catch(error){note('Could not export this mod. '+error.message)}
    }));
   if(!enabled&&!stormEnabled)header.append(button('Remove',async()=>{
    if(!confirm('Remove '+pack.name+' from the mod library?'))return;
    try{
     if(persisted.has(pack.id))await modDatabase.remove(pack.id);
     persisted.delete(pack.id);library.delete(pack.id);render();
     note('Removed '+pack.name+'.');$('#mods-browse').focus();
    }catch(error){note('Could not remove this mod. '+error.message)}
   }));
   card.append(header);if(description.textContent)card.append(description);
   const content=document.createElement('p');
   content.textContent=[...(pack.playlists||[]).map(playlist=>playlist.name),pack.engine?'Engine mod':game?'Custom game':'',storm?'Stormfront':''].filter(Boolean).join(' · ');
   if(content.textContent)card.append(content);
   list.append(card);
  }
 }
 async function add(pack){
  validateInstalledMod(pack);
  const previous=library.get(pack.id);
  if(previous&&!confirm('Replace the installed mod with ID "'+pack.id+'"?'))return;
  let stored=false;
  try{
   if(canPersist){await modDatabase.put(pack);persisted.add(pack.id);stored=true}
  }catch(error){
   if(conversionFormat.hasGame(pack)||conversionFormat.hasStormfront(pack)||persisted.has(pack.id))throw new Error('Could not store this mod. '+error.message);
  }
  if(!stored&&(conversionFormat.hasGame(pack)||conversionFormat.hasStormfront(pack)))throw new Error('Browser storage is unavailable. Enable site storage to install this mod.');
  library.set(pack.id,stored?modDatabase.describe(pack):pack);render();
  if(activeMod?.id===pack.id){activate(conversionFormat.hasNative(pack)?pack:null);return}
  note((previous?'Updated ':'Installed ')+pack.name+(stored?'.':'. Available for this visit because browser storage is unavailable.'));
 }
 async function importFile(files){
  if(importing||!files.length)return;
  if(files.length!==1){note('Drop one .sdmod file at a time.');return}
  const file=files[0];
  if(!/\.sdmod$/i.test(file.name)){note('Choose a file ending in .sdmod.');return}
  importing=true;note('Reading '+file.name+'…');
  try{
   let pack;
   const raw=await file.text();
   try{pack=JSON.parse(raw)}catch{throw new Error('Invalid JSON. Check for trailing commas or Markdown code fences.')}
   await add(pack);
  }catch(error){note(error.message)}finally{importing=false}
 }
 function activate(pack,launch=false){
  if(partyActive||net||netOn){note('Leave your online lobby or party before starting a mod.');return}
  try{
   if(launch)launchModGame(pack);
   else modSetActive(pack,pack&&persisted.has(pack.id));
  }catch{note('Browser session storage is unavailable. Allow site storage to enable a mod.')}
 }
 $('#mods-browse').onclick=()=>input.click();
 input.onchange=()=>{importFile(input.files);input.value=''};
 panel.addEventListener('dragover',event=>{
  if(event.dataTransfer.types.includes('Files')){event.preventDefault();event.dataTransfer.dropEffect='copy';zone.classList.add('dragging')}
 });
 panel.addEventListener('dragleave',event=>{if(!panel.contains(event.relatedTarget))zone.classList.remove('dragging')});
 panel.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('dragging');importFile(event.dataTransfer.files)});
 const schema=conversionFormat.authorSchema(modKit.schema),example=conversionFormat.example;
 $('#mods-example').onclick=async()=>{try{await add(example)}catch(error){note(error.message)}};
 $('#mods-template').onclick=()=>download(example.id+'.sdmod',example);
 $('#mods-schema').onclick=()=>download('spartan-drill-mod-v3.schema.json',schema);
 $('#mods-prompt').onclick=async()=>{
  const prompt=[
   'Create one Spartan Drill .sdmod v3 file for my idea. Return a downloadable file containing only JSON, or raw JSON if you cannot create files.',
   'Use only the parts the idea needs. Top-level weapons, maps, and playlists add content to the regular Spartan Drill menus. Use @id for custom weapon and map references. Arena boxes use size [width,height,depth], at [x,z], and optional elevation. Keep spawns clear. Zombies maps need a player spawn and a zombie spawn in room 0.',
   'Use mapPatches to edit built-in maps directly from their normal menus. Paint the ground with groundTexture, or paint existing surfaces with textures. Optional at [x,z] and radius restrict a surface texture to an area. Remove existing boxes and decorative props using removeBoxes and removeProps regions. Add boxes, primitive props, or packaged OBJ models. Models are visual, so add boxes for collision. Package PNG, JPEG, or WebP textures as {base64,type} entries in files and OBJ geometry as text.',
   'To extend Stormfront, add a stormfront object containing mission, enemy, hero, ability, trap, weapon, or zone definitions from the schema. Use the same .sdmod library.',
   'Supply entry and files if the mod needs its own menus, renderer, rules, controls, or gameplay. entry names the HTML file. files maps paths to UTF-8 strings or {base64,type} objects. A pack can combine these files with native content.',
   'Use {{file:path}} in HTML and CSS, SpartanMod.url(path) in JS, and @mod/path.js in ES module imports. SpartanMod.readText(path) and readBytes(path) access files. SpartanMod.content contains this pack’s weapons, maps, playlists, and map patches. Use await SpartanMod.load(), save(value), or clearSave() for the mod save. Optional connections permits declared external HTTPS/WSS origins. The server must accept Origin: null.',
   'Built-in maps: '+Object.entries(MAPS).filter(([key,map])=>key!=='Practice Range'&&!map.modName).map(([key,map])=>key+(map.zm?' (Zombies)':'')).join(', '),
   'For Multiplayer and Zombies scripting use top-level scripts listing packaged JavaScript modules in load order. Read docs/modding-api.md and docs/spartan-mod.d.ts for SpartanMod.game. Optional keybinds declares IDs and default key codes used with game.ui.addKeybind. Scripting runs only when Launch opens the isolated copy.',
   'For source-level Multiplayer and Zombies changes use engine. Choose game files in engine.replace (null removes a file), apply exact text edits with engine.patches, append engine.scripts and engine.styles, or supply an engine.order to replace the script load order. Packaged files can also shadow shipped paths. Keep the script id sd-game-loader in an edited index.html to start the assembled engine, or call SpartanMod.engine.start() from your own page. All code runs in an isolated copy of the game with no access to stock progression or stock online lobbies.',
   'SCHEMA\n'+JSON.stringify(schema,null,2),
   'EXAMPLE\n'+JSON.stringify({...example,version:3},null,2)
  ].join('\n\n');
  const fallback=$('#mods-prompt-text');
  try{await navigator.clipboard.writeText(prompt);fallback.hidden=true;note('Prompt copied. Paste it into an AI chat with your mod idea.')}
  catch{fallback.value=prompt;fallback.hidden=false;fallback.focus();fallback.select();note('Copy the selected prompt and paste it into an AI chat with your mod idea.')}
 };
}

addEventListener('sd-ready',async()=>{
 if(window.SD_SPLIT||window.SD_ENGINE_MOD&&!window.SD_MOD_SESSION)return;
 if(window.SD_SCRIPT_MOD){
  document.body.classList.add('mod-session','script-mod-session');
  for(const [selector,text] of [['#go','Play local'],['#hmp .home-mode > span','Local arena matches with bots'],['#hz .home-mode > span','Solo survival']]){
   const label=$(selector);
   if(label)label.textContent=text;
  }
 }
 if(window.SD_MOD_SESSION&&(!window.SD_SCRIPT_MOD||sessionStorage.getItem(modLaunchKey))){
  try{
   const ticket=JSON.parse(sessionStorage.getItem(modLaunchKey)||'null');
   const pack=typeof ticket==='string'?await modDatabase.read(ticket):ticket;
   validateInstalledMod(pack);
   if(!conversionFormat.hasNative(pack))throw new Error('This mod has no content to enable in Spartan Drill.');
   modInstall(pack);
  }catch(error){console.error('Could not enable the mod',error);location.replace(modPageURL(false));return}
 }
 if(!window.SD_ENGINE_MOD)await modLibraryUI();
});


/* Native map edits use packaged data and the stock map's usual entry points. */
function modImageAsset(pack,path,label){
 const asset=pack.files&&hasOwn(pack.files,path)&&pack.files[path];
 if(!asset||!['image/png','image/jpeg','image/webp'].includes(asset.type)||
    !asset.base64||asset.base64.length>2800000){
  throw new Error(label+' needs a packaged PNG, JPEG, or WebP image under 2 MB at '+path+'.');
 }
 return asset;
}

function modObjAsset(pack,path,label){
 const source=pack.files&&hasOwn(pack.files,path)&&pack.files[path];
 if(typeof source!=='string'||source.length>1800000||!/\.obj$/i.test(path)){
  throw new Error(label+' needs a packaged OBJ text file under 1.8 MB at '+path+'.');
 }
 const points=[],texcoords=[],positions=[],uv=[];
 const invalid=()=>{throw new Error(label+' has invalid OBJ geometry in '+path+'.')};
 const index=(text,length,optional=false)=>{
  if(optional&&!text)return -1;
  const n=Number(text),i=n>0?n-1:length+n;
  if(!Number.isSafeInteger(n)||n===0||i<0||i>=length)invalid();
  return i;
 };
 for(const line of source.split(/\r?\n/)){
  const trim=line.split('#',1)[0].trim();
  if(!trim)continue;
  const [type,...fields]=trim.split(/\s+/);
  if(type==='v'||type==='vt'){
   const count=type==='v'?3:2,values=fields.slice(0,count).map(Number);
   if(values.length!==count||values.some(n=>!Number.isFinite(n)||Math.abs(n)>1e5))invalid();
   (type==='v'?points:texcoords).push(values);
  }else if(type==='f'){
   if(fields.length<3||fields.length>64)invalid();
   const face=fields.map(part=>{
    const [vertex,texture]=part.split('/');
    return [index(vertex,points.length),index(texture,texcoords.length,true)];
   });
   for(let k=1;k<face.length-1;k++){
    for(const [v,t] of [face[0],face[k],face[k+1]]){
     positions.push(...points[v]);uv.push(...(texcoords[t]||[0,0]));
    }
   }
   if(positions.length>270000)throw new Error(label+' exceeds 30,000 OBJ triangles in '+path+'.');
  }
 }
 if(!positions.length)invalid();
 return {positions,uv};
}

function modTexture(pack,path){
 const {type,base64}=modImageAsset(pack,path,pack.name);
 const texture=new THREE.TextureLoader().load('data:'+type+';base64,'+base64);
 texture.encoding=THREE.sRGBEncoding;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.anisotropy=Math.min(4,R.capabilities.getMaxAnisotropy());
 return texture;
}

function modPaintMaterial(surface,color,vertexColors){
 const id=color+'/'+vertexColors;
 let material=surface.materials.get(id);
 if(!material){
  const common={color,map:surface.texture,vertexColors};
  material=LX.pbr
    ?LX.patch(new THREE.MeshStandardMaterial({...common,roughness:surface.roughness??.85,metalness:surface.metalness??0}))
    :new THREE.MeshLambertMaterial(common);
  surface.materials.set(id,material);
 }
 return material;
}

function modPaintAt(patch,surface,x,z){
 const edits=patch.textures.get(surface);
 if(!edits)return null;
 let fallback=null;
 for(let i=edits.length-1;i>=0;i--){
  const item=edits[i];
  if(item.at&&Math.hypot(x-item.at[0],z-item.at[1])<=item.radius)return item;
  if(!item.at&&!fallback)fallback=item;
 }
 return fallback;
}

function modPatchPart(part,visual){
 const [x,z]=part.at,[w,h,d]=part.size,y=part.elevation||0,color=modColor(part.color);
 if(!visual)return [x,z,w,d,y+h,y,color,part.material];
 const shape={box:'b',cylinder:'c',sphere:'s',cone:'k'}[part.shape||'box'];
 const kind=shape==='b'&&part.material==='glow'?'e':shape==='b'&&part.material==='glass'?'g':shape;
 return [x,z,w,d,y+h,y,color,kind,part.material];
}

function installMapPatches(pack){
 for(const patch of pack.mapPatches||[]){
  const map=MAPS[currentMapName(patch.map)],build=map.b,deco=map.deco;
  const excludes=regions=>item=>!(regions||[]).some(region=>Math.hypot(item[0]-region.at[0],item[1]-region.at[1])<=region.radius);
  const allowedBoxes=excludes(patch.removeBoxes),allowedProps=excludes(patch.removeProps);
  const boxes=(patch.boxes||[]).map(part=>modPatchPart(part,false));
  const props=(patch.props||[]).map(part=>modPatchPart(part,true));
  const paint=(style,id)=>({...style,id,texture:modTexture(pack,style.file),materials:new Map()});
  const textures=new Map();
  for(const [id,style] of (patch.textures||[]).entries()){
   const items=textures.get(style.surface)||[];
   items.push(paint(style,id));
   textures.set(style.surface,items);
  }
  const objFiles=new Map();
  const models=(patch.models||[]).map(model=>{
   let data=objFiles.get(model.file);
   if(!data){data=modObjAsset(pack,model.file,patch.map);objFiles.set(model.file,data)}
   return {...model,data,paint:model.texture?paint({file:model.texture},model.file):null};
  });
  map.modMapPatch={textures,ground:patch.groundTexture?paint(patch.groundTexture,'ground'):null,models};
  if(patch.sky)map.sky=modColor(patch.sky);
  if(patch.ground)map.gr=modColor(patch.ground);
  if(patch.wall)map.bc=modColor(patch.wall);
  if(patch.surface)map.gt=patch.surface;
  if(patch.replaceProps){map.deco=null;map.facade=false}
  else if(deco&&patch.removeProps?.length)map.deco=function(){return deco.call(this).filter(allowedProps)};
  if(patch.replaceBoxes||patch.replaceProps||boxes.length||props.length||patch.removeBoxes?.length||patch.removeProps?.length){
   map.b=function(){
    const stock=build.call(this)||[];
    this._v=[...(patch.replaceProps?[]:(this._v||[]).filter(allowedProps)),...props];
    return [...(patch.replaceBoxes?[]:stock.filter(allowedBoxes)),...boxes];
   };
  }
 }
}

function modBuildMapModels(patch,root){
 for(const model of patch.models){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(model.data.positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(model.data.uv,2));
  geometry.computeVertexNormals();
  const color=model.color?modColor(model.color):0xffffff;
  const material=model.paint?modPaintMaterial(model.paint,color,false):
   LX.pbr?new THREE.MeshStandardMaterial({color,roughness:.82}):new THREE.MeshLambertMaterial({color});
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(model.at[0],model.elevation||0,model.at[1]);
  mesh.scale.setScalar(model.scale||1);mesh.rotation.y=(model.rotation||0)*Math.PI/180;
  mesh.castShadow=mesh.receiveShadow=true;
  if(!model.paint)mesh.userData.mapResources=[];
  root.add(mesh);
 }
}
