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
/* ######## lumen.js ######## */
/* ===================== lumen.js ===================== */
/* ---------- LUMEN: the lighting, material and post-processing engine. It loads right after three.js, before the game.
   1  Materials:   every MeshLambert / MeshPhong material the game asks for becomes a physically based MeshStandardMaterial (metal and polymer guns, matte cloth, shiny skin),
                   lit per pixel, with sky reflections, height fog, world-space dirt variation and optional wind sway.
   2  Textures:    procedural albedo + normal + roughness maps for every surface kind (brick, concrete, asphalt, grass, wood ...), built lazily.
   3  Environment: the sky of each map is baked into a prefiltered reflection / ambient map (PMREM), so metal and glass reflect the real sky.
   4  Sky:         an animated cloud and star dome rides on top of the painted sky.
   5  Models:      LX.bevel() swaps the shared unit cube of small parts for a rounded box of the same world size, so edges catch the light.
   6  Post:        the scene is drawn into an MSAA HDR target, then: dual-filter bloom, sun shafts, chromatic aberration, speed blur, sharpening, grading,
                   filmic shoulder, vignette, grain. Every stage has a fallback: broken shaders or missing GPU features switch the effect off instead of breaking the game.
   Quality (Settings > Graphics): high = everything, med = PBR + shadows but no post-processing, low = the original cheap look. Add ?safe=1 to the address to force low. ---------- */
var LX=window.LX={ver:3,fx:{hit:0,boom:0,shot:0,speed:0,flash:0,dmg:0,heal:0,ca:0,pulse:0,blur:0},ctx:'',frames:0,rbc:{}};
LX.mblur=1;try{LX.mblur=localStorage.getItem('sdrill-mblur')=='0'?0:1}catch(e){}
LX.bright=1;try{LX.bright=Math.max(.6,Math.min(1.6,parseFloat(localStorage.getItem('sdrill-bright'))||1))}catch(e){}
LX.q='high';try{LX.q=localStorage.getItem('sdrill-gfx')||(matchMedia('(pointer:coarse)').matches?'low':'high')}catch(e){}
if(!/^(high|med|low)$/.test(LX.q))LX.q='high';
LX.safe=/[?&]safe=1/.test(location.search);if(LX.safe)LX.q='low';
LX.pbr=LX.q!='low';LX.postOn=LX.q=='high';LX.postDead=false;
LX.U={time:{value:0},fogH:{value:.05},fogD:{value:.012},fogA:{value:.3},wind:{value:1}};
/* Shared sprite textures. Transparent padding keeps the quads invisible even under bloom. */
LX.effectTextures=(()=>{
 let textures;
 const fade=(from,to,value)=>{
  const t=Math.max(0,Math.min(1,(value-from)/(to-from)));
  return t*t*(3-2*t);
 };
 const make=sample=>{
  const size=128,pixels=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=(y*size+x)*4;
   pixels[i]=pixels[i+1]=pixels[i+2]=255;
   pixels[i+3]=Math.round(255*sample((x+.5)*2/size-1,(y+.5)*2/size-1));
  }
  const texture=new THREE.DataTexture(pixels,size,size);
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;
  texture.needsUpdate=true;
  return texture;
 };
 const hash=(x,y,seed)=>{
  const n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1274126177)|0;
  return (Math.imul(n^(n>>>13),1274126177)>>>0)/4294967295;
 };
 const noise=(x,y,seed)=>{
  const ix=Math.floor(x),iy=Math.floor(y),u=fade(0,1,x-ix),v=fade(0,1,y-iy);
  const top=hash(ix,iy,seed)*(1-u)+hash(ix+1,iy,seed)*u;
  const bottom=hash(ix,iy+1,seed)*(1-u)+hash(ix+1,iy+1,seed)*u;
  return top*(1-v)+bottom*v;
 };
 const turbulence=(x,y,seed)=>.57*noise(x,y,seed)+.28*noise(2.1*x,2.1*y,seed+1)+.15*noise(4.3*x,4.3*y,seed+2);
 const smoke=seed=>make((x,y)=>{
  const nx=x+.52*(turbulence(x*2.25,y*2.25,seed+5)-.5);
  const ny=y+.52*(turbulence(x*2.25,y*2.25,seed+13)-.5);
  const billow=1-fade(.02,.99,Math.hypot(nx,ny*1.12));
  const detail=turbulence(nx*3.7,ny*3.7,seed);
  const density=fade(.09,.82,billow*(.46+.86*detail));
  return .88*density*(1-fade(.71,.96,Math.hypot(x,y)));
 });
 return ()=>textures||(textures={
  glow:make((x,y)=>{
   const r2=x*x+y*y;
   return (.76*Math.exp(-16*r2)+.24*Math.exp(-5*r2))*(1-fade(.48,.90,r2));
  }),
  flare:make((x,y)=>{
   const r2=x*x+1.4*y*y;
   return (.78*Math.exp(-27*r2)+.22*Math.exp(-6*r2))*(1-fade(.48,.90,x*x+y*y));
  }),
  smoke:[smoke(31),smoke(53),smoke(89)]
 });
})();
/* per-map look: ex exposure, bl bloom, sat, con contrast, vig vignette, ray sun shafts, rc shaft colour, ts/th shadow/highlight tint, haze (ground fog amount), hz fog height falloff, env reflection strength, cl clouds [cover, opacity, speed, scale, lit, shade], st stars */
LX.FX={
 Blockfort:{ex:1,bl:.5,sat:1.14,con:1.06,vig:.3,ray:.55,rc:[1,.94,.78],ts:[0,.02,.07],th:[.09,.05,0],haze:.28,hz:.05,env:1,cl:[.52,.55,.6,1.6,[1,1,1],[.62,.7,.84]],st:0},
 Pillars:{ex:1.04,bl:.58,sat:1.2,con:1.07,vig:.26,ray:.6,rc:[1,.97,.85],ts:[0,.03,.08],th:[.08,.05,.01],haze:.22,hz:.06,env:1.1,cl:[.62,.35,.45,1.3,[1,1,1],[.7,.78,.92]],st:0},
 Canyon:{thr:.86,ex:.98,bl:.8,sat:1.26,con:1.08,vig:.36,ray:1.05,rc:[1,.62,.34],ts:[.06,.0,.1],th:[.14,.07,-.02],haze:.34,hz:.04,env:1.1,cl:[.5,.6,.7,1.5,[1,.62,.4],[.5,.28,.38]],st:.3},
 Suburbia:{ex:1,bl:.5,sat:1.14,con:1.05,vig:.26,ray:.45,rc:[1,.96,.85],ts:[0,.02,.06],th:[.07,.05,.01],haze:.22,hz:.06,env:1,cl:[.5,.5,.5,1.7,[1,1,1],[.66,.74,.88]],st:0},
 Boomtown:{ex:.97,bl:.62,sat:.98,con:1.05,vig:.34,ray:.35,rc:[1,.78,.45],ts:[.04,.02,0],th:[.1,.06,-.02],haze:.55,hz:.035,env:.9,cl:[.38,.7,1.1,1.2,[.9,.72,.5],[.5,.38,.28]],st:0},
 Rust:{ex:1.05,bl:.7,sat:.94,con:1.09,vig:.28,ray:.55,rc:[1,.92,.72],ts:[.02,.02,.04],th:[.08,.05,0],haze:.3,hz:.045,env:1.1,cl:[.72,.22,.35,1.2,[1,.97,.9],[.8,.76,.7]],st:0},
 Decay:{thr:.9,ex:.96,bl:.38,sat:.78,con:1.1,vig:.42,ray:0,rc:[.8,.9,.8],ts:[0,.04,.03],th:[.0,.04,.02],haze:.5,hz:.04,env:.8,cl:[.3,.85,.35,1.4,[.62,.68,.64],[.3,.35,.34]],st:0},
 'Dry Dock':{ex:1.05,bl:.5,sat:1.2,con:1.08,vig:.32,ray:.95,rc:[1,.72,.45],ts:[0,.03,.08],th:[.1,.05,0],haze:.2,hz:.06,env:1.0,cl:[.5,.55,.55,1.6,[1,.9,.8],[.7,.6,.7]],st:0},
 London:{ex:1.03,bl:.46,sat:1.16,con:1.05,vig:.26,ray:.8,rc:[1,.95,.8],ts:[0,.02,.07],th:[.09,.05,0],haze:.2,hz:.05,env:1.05,cl:[.5,.55,.55,1.6,[1,1,1],[.64,.72,.86]],st:0},
 Shardworks:{ex:1.02,bl:.42,sat:1.15,con:1.07,vig:.24,ray:.46,rc:[1,.86,.67],ts:[0,.025,.043],th:[.08,.045,0],haze:.34,hz:.065,env:1.05,cl:[.64,.46,.42,1.7,[1,.92,.77],[.7,.74,.71]],st:0},
 'Practice Range':{ex:1,bl:.33,sat:1.1,con:1.035,vig:.15,ray:.31,rc:[.99,.97,.88],ts:[0,.025,.065],th:[.035,.038,.008],haze:.16,hz:.048,env:.95,cl:[.62,.38,.34,1.5,[1,1,.98],[.67,.8,.9]],st:0},
 'Hollow Estate':{thr:.68,ex:1.2,bl:.95,sat:1.12,con:1.12,vig:.46,ray:.22,rc:[.55,.65,1],ts:[0,.04,.14],th:[.02,.05,.14],haze:.4,hz:.05,env:1.5,cl:[.56,.5,.3,1.5,[.62,.7,.95],[.1,.13,.22]],st:1}};
LX.FXD={ex:1,bl:.5,sat:1.1,con:1.05,vig:.3,ray:.4,rc:[1,.95,.8],ts:[0,.02,.06],th:[.07,.05,0],haze:.25,hz:.05,env:1,cl:[.5,.5,.5,1.5,[1,1,1],[.66,.74,.88]],st:0};
/* ---------- GLSL building blocks ---------- */
/* Filterable value noise shared by cloud lighting and the world-space surface weathering.
   Bake both channels once so a cloud sample does not recompute three noise octaves. */
LX.noiseTexture=function(){
 if(LX.noise)return LX.noise;
 const size=512,period=32,grid=new Float32Array(period*period),data=new Uint8Array(size*size*4);
 for(let i=0;i<grid.length;i++){
  let hash=Math.imul(i^0x31ad,1597334677);
  hash=Math.imul(hash^(hash>>>16),2246822519);
  grid[i]=((hash^(hash>>>13))>>>0)/4294967295;
 }
 const at=(x,y)=>grid[(x&(period-1))+(y&(period-1))*period];
 const value=(x,y)=>{
  const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;
  const tx=u*u*(3-2*u),ty=v*v*(3-2*v);
  const aa=at(ix,iy),ba=at(ix+1,iy),ab=at(ix,iy+1),bb=at(ix+1,iy+1);
  return (aa+(ba-aa)*tx)*(1-ty)+(ab+(bb-ab)*tx)*ty;
 };
 for(let y=0,i=0;y<size;y++)for(let x=0;x<size;x++,i+=4){
  const px=(x+.5)*period/size,py=(y+.5)*period/size,base=value(px,py);
  data[i]=Math.round(base*255);
  data[i+1]=Math.round((.55*base+.275*value(px*2+17.1,py*2+9.2)+.1375*value(px*4+51.3,py*4+27.6))*255);
  data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size);
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.generateMipmaps=true;texture.needsUpdate=true;
 return LX.noise=texture;
};
LX.NOISE=`uniform sampler2D uLxNoise;
float lxN(vec2 p){return texture2D(uLxNoise,p/32.0).r;}
float lxFbm(vec2 p){return texture2D(uLxNoise,p/32.0).g;}
`;
LX.MACRO=`float lxMv=lxN(vLxWorld.xz*0.045+vLxWorld.y*0.02)*0.78+lxN(vLxWorld.xz*0.31+vLxWorld.y*0.1)*0.34;
// Broad mineral stains and embedded dirt vary hue as well as lightness.
float lxStain=smoothstep(0.28,0.59,lxMv);
diffuseColor.rgb*=(0.82+0.42*lxMv)*mix(vec3(1.045,0.985,0.925),vec3(0.985,1.015,1.045),lxStain);
`;
LX.FOGC=`#if defined(USE_FOG) && !defined(FOG_EXP2)
 float lxFg=smoothstep(fogNear,fogFar,fogDepth);
 float lxHz=(1.0-exp(-fogDepth*uLxFD))*exp(-max(vLxWorld.y,0.0)*uLxFH)*uLxFA;
 gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,clamp(lxFg+lxHz,0.0,1.0));
#else
 #include <fog_fragment>
#endif
`;
LX.SWAY=`float lxS=max(position.y+0.15,0.0);
vec4 lxLocal=vec4(transformed,1.0);
#ifdef USE_INSTANCING
 lxLocal=instanceMatrix*lxLocal;
#endif
vec4 lxW=modelMatrix*lxLocal;
transformed.x+=sin(uLxT*1.6+lxW.x*0.35+lxW.z*0.21)*0.05*lxS*uLxWind;transformed.z+=cos(uLxT*1.3+lxW.z*0.31+lxW.x*0.17)*0.045*lxS*uLxWind;
`;
/* Shader variants share by feature, so differently colored materials can reuse programs. */
LX.localLightChunk=THREE.ShaderChunk.lights_fragment_begin.replace(
 /getPointDirectLightIrradiance\( pointLight, geometry, directLight \);([\s\S]*?)RE_Direct\( directLight, geometry, material, reflectedLight \);/,
 `{
  vec3 toLight=pointLight.position-geometry.position;
  float distanceSquared=dot(toLight,toLight);
  bool facesLight=dot(geometry.normal,toLight)>0.0;
  #ifdef CLEARCOAT
   facesLight=facesLight||dot(geometry.clearcoatNormal,toLight)>0.0;
  #endif
  if(facesLight&&any(notEqual(pointLight.color,vec3(0.0))) &&
     (pointLight.distance<=0.0 || pointLight.decay<=0.0 || distanceSquared<pointLight.distance*pointLight.distance)){
   getPointDirectLightIrradiance( pointLight, geometry, directLight );
   $1
   RE_Direct( directLight, geometry, material, reflectedLight );
  }
 }`
).replace(
 /getDirectionalDirectLightIrradiance\( directionalLight, geometry, directLight \);([\s\S]*?)RE_Direct\( directLight, geometry, material, reflectedLight \);/,
 `{
  getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );
  bool facesLight=dot(geometry.normal,directLight.direction)>0.0;
  #ifdef CLEARCOAT
   facesLight=facesLight||dot(geometry.clearcoatNormal,directLight.direction)>0.0;
  #endif
  if(facesLight){
   $1
   RE_Direct( directLight, geometry, material, reflectedLight );
  }
 }`
);
LX.localLights=function(shader){
 shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',LX.localLightChunk);
};
LX.patch=function(material,flags={}){
 const key='lx'+(flags.macro?'m':'')+(flags.sway?'s':'')+(flags.packed?'p':'');
 material.userData.lxFl=flags;
 material.customProgramCacheKey=()=>LX.patchOff?'lx0':key;
 material.onBeforeCompile=function(shader){
  if(LX.patchOff)return;
  LX.localLights(shader);
  Object.assign(shader.uniforms,{uLxT:LX.U.time,uLxFH:LX.U.fogH,uLxFD:LX.U.fogD,uLxFA:LX.U.fogA,uLxWind:LX.U.wind});
  let vertex='varying vec3 vLxWorld;\nuniform float uLxT;\nuniform float uLxWind;\n'+shader.vertexShader;
  if(flags.sway)vertex=vertex.replace('#include <begin_vertex>','#include <begin_vertex>\n'+LX.SWAY);
  shader.vertexShader=vertex.replace('#include <project_vertex>',`
   vec4 lxWorldPosition=vec4(transformed,1.0);
   #ifdef USE_INSTANCING
    lxWorldPosition=instanceMatrix*lxWorldPosition;
   #endif
   vLxWorld=(modelMatrix*lxWorldPosition).xyz;
   #include <project_vertex>
  `);
  let fragment='varying vec3 vLxWorld;\nuniform float uLxFH;\nuniform float uLxFD;\nuniform float uLxFA;\n'+shader.fragmentShader;
  if(flags.macro){
   shader.uniforms.uLxNoise={value:LX.noiseTexture()};
   fragment=LX.NOISE+fragment.replace('#include <map_fragment>','#include <map_fragment>\n'+LX.MACRO);
  }
  if(flags.packed){
   fragment=fragment.replace('#include <roughnessmap_fragment>',`
    float roughnessFactor=roughness;
    #ifdef USE_NORMALMAP
     vec4 lxSurface=texture2D(normalMap,vUv);
     roughnessFactor*=lxSurface.a;
    #endif
   `).replace('#include <normal_fragment_maps>',THREE.ShaderChunk.normal_fragment_maps.replace(
    /texture2D\( normalMap, vUv \)/g,'lxSurface'));
  }
  shader.fragmentShader=fragment.replace('#include <fog_fragment>',LX.FOGC);
 };
 return material;
};
/* ---------- material upgrade ---------- */
LX.OK=['color','map','emissive','emissiveMap','emissiveIntensity','transparent','opacity','side','fog','vertexColors','flatShading','wireframe','alphaTest','depthWrite','depthTest','visible','blending','normalMap','roughnessMap','metalnessMap','envMap','envMapIntensity','roughness','metalness','normalScale','aoMap','alphaMap','premultipliedAlpha','polygonOffset','polygonOffsetFactor','polygonOffsetUnits','name','toneMapped','dithering'];
LX.classify=function(col,ctx){const c=new THREE.Color(col),h=c.getHSL({}),L=h.l,S=h.s,H=h.h;
 if(ctx=='gun'){
  if(L<.24&&S<.4)return[.46,.5];               /* black polymer and parkerized steel */
  if(S<.24)return[L>.6?.26:.34,.88];           /* bare steel and aluminium */
  if(H>.08&&H<.16&&S>.4&&L>.4)return[.26,.95];  /* brass and gold */
  if(H<.1&&H>.03&&S>.3&&L<.45)return[.58,0];    /* wood */
  if(S>.35)return[.5,.15];                       /* painted metal, tinted polymer */
  return[.55,.35]}
 if(ctx=='char'){if(H>.0&&H<.1&&S>.18&&S<.65&&L>.42)return[.5,0];return[.84,0]}
 return[.78,.03]};
LX.upg=function(p,ph){p=p||{};const o={};for(const k in p)if(LX.OK.includes(k)&&p[k]!==undefined)o[k]=p[k];
 const col=p.color==null?0xffffff:p.color,cam=!!(p.map&&p.map.image&&p.map.image.width===64),cl=cam?[.46,.34]:LX.classify(col,LX.ctx);
 o.roughness=o.roughness!=null?o.roughness:ph&&p.shininess!=null?Math.max(.18,1-Math.min(p.shininess,120)/130):cl[0];o.metalness=o.metalness!=null?o.metalness:cl[1];
 const m=new THREE.MeshStandardMaterial(o);m.envMapIntensity=cam||LX.ctx=='gun'?1.3:LX.ctx=='char'?.55:.65;
 if(p.emissive!=null&&p.emissiveIntensity==null)m.emissiveIntensity=1.15;
 if(m.userData===undefined)m.userData={};return LX.patch(m,{macro:!!p.map&&!LX.ctx})};
if(LX.pbr){const L0=THREE.MeshLambertMaterial;LX.Lambert0=L0;
 THREE.MeshLambertMaterial=function(p){return LX.upg(p,0)};THREE.MeshLambertMaterial.prototype=THREE.MeshStandardMaterial.prototype;
 THREE.MeshPhongMaterial=function(p){return LX.upg(p,1)};THREE.MeshPhongMaterial.prototype=THREE.MeshStandardMaterial.prototype}
/* run fn with a material context so guns get metal, people get cloth and skin */
LX.within=function(ctx,fn){return function(){const o=LX.ctx;LX.ctx=ctx;try{return fn.apply(this,arguments)}finally{LX.ctx=o}}};
/* ---------- rounded boxes for the shared unit cube ---------- */
LX.rb=function(sx,sy,sz,r){const ax=Math.abs(sx),ay=Math.abs(sy),az=Math.abs(sz);r=Math.min(r,.49*Math.min(ax,ay,az));
 const key=[sx,sy,sz,r].map(v=>v.toFixed(3)).join(','),c=LX.rbc[key];if(c)return c;
 const SEG=r<.02?2:3,g=new THREE.BoxGeometry(1,1,1,SEG,SEG,SEG),ps=g.attributes.position,nr=g.attributes.normal,hs=.5/SEG,rx=r/ax,ry=r/ay,rz=r/az,v=new THREE.Vector3(),n=new THREE.Vector3();
 for(let i=0;i<ps.count;i++){v.set(ps.getX(i),ps.getY(i),ps.getZ(i));n.copy(v);n.x-=Math.sign(n.x)*hs;n.y-=Math.sign(n.y)*hs;n.z-=Math.sign(n.z)*hs;n.normalize();
  ps.setXYZ(i,(.5-rx)*Math.sign(v.x)+n.x*rx,(.5-ry)*Math.sign(v.y)+n.y*ry,(.5-rz)*Math.sign(v.z)+n.z*rz);
  n.set(n.x*sx,n.y*sy,n.z*sz).normalize();nr.setXYZ(i,n.x,n.y,n.z)}
 ps.needsUpdate=true;nr.needsUpdate=true;if(Object.keys(LX.rbc).length>900)LX.rbc={};return LX.rbc[key]=g};
LX.bevel=function(root){if(!LX.pbr||!root||typeof bg=='undefined')return root;
 root.traverse(o=>{if(!o.isMesh||o.geometry!==bg||(o.userData&&o.userData.lxB))return;const s=o.scale,m=Math.min(Math.abs(s.x),Math.abs(s.y),Math.abs(s.z));if(m<.014)return;o.geometry=LX.rb(s.x,s.y,s.z,Math.min(.02,.2*m));o.userData.lxB=1});return root};
/* ---------- procedural PBR textures ---------- */
LX.TT={};
LX.tex=function(kind){if(LX.TT[kind])return LX.TT[kind];const N=LX.q=='low'?128:256,t0=performance.now();
 let sd=kind.length*7919+11;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647,perm=new Uint8Array(256);for(let i=0;i<256;i++)perm[i]=i;for(let i=255;i>0;i--){const j=(rnd()*(i+1))|0,t=perm[i];perm[i]=perm[j];perm[j]=t}
 const hs=(x,y,px,py)=>perm[(perm[(((x%px)+px)%px)&255]+((((y%py)+py)%py)&255))&255]/255;
 /* tileable value noise: u,v in 0..1 repeat after one tile, px/py are the lattice cells per tile */
 const nz=(u,v,px,py)=>{const x=u*px,y=v*py,ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const a=hs(ix,iy,px,py),b=hs(ix+1,iy,px,py),c=hs(ix,iy+1,px,py),d=hs(ix+1,iy+1,px,py);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy};
 const fb=(u,v,p,o,py)=>{let s=0,a=.5,q=p,qy=py||p,t=0;for(let i=0;i<(o||4);i++){s+=a*nz(u,v,q,qy);t+=a;a*=.5;q*=2;qy*=2}return s/t};
 const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 const H=new Float32Array(N*N),A=new Uint8ClampedArray(N*N*4),Rg=new Float32Array(N*N),CR=new Float32Array(N*N);
 const crack=(n,len)=>{for(let k=0;k<n;k++){let x=rnd()*N,y=rnd()*N,a=rnd()*6.28;for(let i=0;i<len;i++){a+=(rnd()-.5)*.7;x+=Math.cos(a)*1.3;y+=Math.sin(a)*1.3;const px=((x|0)%N+N)%N,py=((y|0)%N+N)%N;CR[py*N+px]=1;if(i%3==0){CR[((py+1)%N)*N+px]=.5}}}};
 const o={h:0,a:180,r:.8,nrm:1.2};
 const G={
  brick:(u,v,x,y)=>{const R=12,C=5,r=Math.floor(v*R),cu=(((u*C+(r%2?.5:0))%1)+1)%1,cv=(v*R)%1,ci=Math.floor(u*C+(r%2?.5:0)),d=Math.min(Math.min(cu,1-cu)*N/C,Math.min(cv,1-cv)*N/R),face=sm(2.2,5.2,d),rb=hs(ci+7,r+3,256,256),n=fb(u,v,6,4),p=nz(u,v,128,128),soot=fb(u,v,3,2);
   o.h=face*.78+n*.12+p*.07*face;o.a=face?(130+rb*85)*(.86+.28*n)*(.82+.3*soot)-p*18:104+p*46;o.a=o.a*face+(104+p*46)*(1-face);o.r=.9-face*.12+n*.06;o.nrm=2.2},
  stucco:(u,v)=>{const n=fb(u,v,5,5),g=fb(u,v,48,3),st=fb(u*2,v,3,3,1);o.h=.45+.35*n+.2*g;o.a=188+(n-.5)*42+(g-.5)*28-Math.max(0,st-.52)*90;o.r=.88+.08*g;o.nrm=1.2},
  concrete:(u,v,x,y)=>{const n=fb(u,v,6,5),g=nz(u,v,160,160),ag=nz(u,v,40,40),pit=ag>.84?1:0,sx=x%(N/2),sy=y%(N/2),gm=Math.min(Math.min(sx,N/2-1-sx),Math.min(sy,N/2-1-sy)),gr=gm<1.4?1:0,st=fb(u*2,v,3,3,1),tie=(((x%(N/2))-N*.15)**2+((y%(N/2))-N*.15)**2)<4?1:0,c=CR[y*N+x];
   o.h=.55+.2*n+.12*g-pit*.2-gr*.35-tie*.3-c*.35;o.a=172+(n-.5)*34+(g-.5)*30-pit*34-gr*54-tie*50-c*70-Math.max(0,st-.55)*80;o.r=.86+.1*g-c*.1;o.nrm=1.3},
  asphalt:(u,v,x,y)=>{const g=nz(u,v,170,170),ag=nz(u,v,70,70),sp=ag>.86?1:0,n=fb(u,v,4,4),st=fb(u,v,4,3),c=CR[y*N+x];
   o.h=.5+.25*g+sp*.2+.1*n-c*.35;o.a=134+(g-.5)*60+sp*80+(n-.5)*30-c*64-sm(.58,.7,st)*34;o.r=.9-sm(.58,.7,st)*.38-sp*.1;o.nrm=1.5},
  grass:(u,v)=>{const cl=fb(u,v,5,4),b=nz(u,v,230,38),b2=nz(u,v,160,30),dirt=sm(.62,.74,fb(u,v,3,3));o.h=b*.5+b2*.3+cl*.2;o.a=(112+cl*76+(b-.5)*80+(b2-.5)*40)*(1-dirt*.3);o.r=.92;o.nrm=.9},
  plank:(u,v,x,y)=>{const P=8,r=Math.floor(v*P),pv=(v*P)%1,rb=hs(r+9,3,256,256),gap=Math.min(pv,1-pv)*N/P<1.3?1:0,gr=nz(u+rb,v,3,100)*.6+nz(u*2+rb,v,5,60)*.4,seam=Math.abs(((u+rb*.97)%1)-.5)<.004?1:0,kn=Math.hypot(((u*3+rb*5)%1)-.5,(pv-.5)*P*.35)<.1?1:0,nail=(Math.abs(((u+rb*.97)%1)-.04)*N<2.5&&Math.abs(pv-.5)*N/P<5)?1:0;
   o.h=(1-gap)*(.6+gr*.25-seam*.2-kn*.1)+nail*.1;o.a=(gap||seam)?64:(122+rb*92)*(.78+.4*gr)-kn*50+nail*40;o.r=.78+.12*gr;o.nrm=1.4},
  shingle:(u,v,x,y)=>{const R=8,r=Math.floor(v*R),cu=(((u*5+(r%2?.5:0))%1)+1)%1,cv=(v*R)%1,ci=Math.floor(u*5+(r%2?.5:0)),rb=hs(ci+5,r+1,256,256),gx=Math.min(cu,1-cu)*N/5<1.4?1:0,g=nz(u,v,150,150);
   o.h=.25+.7*cv-gx*.3+g*.05;o.a=(118+rb*90)*(.7+.3*cv)*(gx?.5:1)+(g-.5)*30;o.r=.9;o.nrm=2},
  tile:(u,v,x,y)=>{const T=4,cu=(u*T)%1,cv=(v*T)%1,d=Math.min(Math.min(cu,1-cu),Math.min(cv,1-cv))*N/T,face=sm(1.4,3.4,d),ti=Math.floor(u*T)+Math.floor(v*T)*7,rb=hs(ti+3,ti+5,256,256),g=fb(u,v,10,3),c=CR[y*N+x];
   o.h=face*.85+g*.05-c*.2;o.a=face?(186+rb*54)*(.94+.1*g)-c*60:100;o.r=face?.26+g*.18+c*.3:.92;o.nrm=1.1},
  metal:(u,v,x,y)=>{const br=nz(u,v,6,220),n=fb(u,v,5,3),seam=Math.min(((v*2)%1),1-((v*2)%1))*N/2<1.2||Math.min(((u*2)%1),1-((u*2)%1))*N/2<1.2?1:0,rx=((x%(N/8))-N/16),ry=(((y+N/4)%(N/2))-N/4),riv=(Math.abs(rx)<2.4&&Math.abs(Math.abs(ry)-N/4+3)<2.4)?1:0;
   o.h=.55+br*.1+n*.05-seam*.3+riv*.25;o.a=(176+(br-.5)*54+(n-.5)*30)*(seam?.6:1)+riv*30;o.r=.34+br*.2+n*.12;o.nrm=.8},
  sand:(u,v)=>{const w=fb(u,v,3,3),rip=Math.sin((v*14+w*3)*6.283)*.5+.5,g=nz(u,v,210,210);o.h=rip*.5+g*.15+w*.1;o.a=190+(rip-.5)*22+(g-.5)*30+(w-.5)*20;o.r=.95;o.nrm=.8},
  rust:(u,v)=>{const rib=Math.sin(u*22*6.283)*.5+.5,rs=fb(u,v,5,5),ru=sm(.5,.63,rs),stv=nz(u,v,70,3),g=nz(u,v,130,130);o.h=rib*.55+ru*.1+g*.06;o.a=(188-ru*78)*(.88+.2*stv)+(g-.5)*22;o.r=.34+ru*.58;o.nrm=1.5},
  cobble:(u,v,x,y)=>{const K=8,gx=u*K,gy=v*K,ix=Math.floor(gx),iy=Math.floor(gy);let d1=9,d2=9,id=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=ix+i,cy=iy+j,hx=hs(cx,cy,256,256),hy=hs(cx+31,cy+17,256,256),dx=cx+.5+(hx-.5)*.55-gx,dy=cy+.5+(hy-.5)*.55-gy,d=Math.hypot(dx,dy);if(d<d1){d2=d1;d1=d;id=hx*7+hy}else if(d<d2)d2=d}
   const e=d2-d1,f=sm(.02,.2,e),g=nz(u,v,120,120),rb=id%1;o.h=f*(.7+.25*(.5-d1))+g*.06;o.a=f?(138+rb*84)*(.9+.2*g):70;o.r=.9-f*.1;o.nrm=2.4},
  def:(u,v)=>{const n=fb(u,v,6,4);o.h=n;o.a=186+(n-.5)*60;o.r=.8;o.nrm=1}};
 const gen=G[kind]||G.def;if(kind=='concrete'||kind=='asphalt'||kind=='tile')crack(kind=='tile'?3:kind=='asphalt'?5:4,kind=='tile'?60:90);
 let nrm=1;for(let y=0;y<N;y++)for(let x=0;x<N;x++){gen(x/N,y/N,x,y);const i=y*N+x,a=Math.max(0,Math.min(255,o.a));H[i]=o.h;Rg[i]=o.r;A[i*4]=A[i*4+1]=A[i*4+2]=a;A[i*4+3]=255;nrm=o.nrm}
 const mk=(w)=>{const c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N);im.data.set(w);g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,(typeof R!='undefined'&&R.capabilities&&R.capabilities.getMaxAnisotropy?R.capabilities.getMaxAnisotropy():4));return t};
 if(!LX.pbr)return LX.TT[kind]={map:mk(A),ms:performance.now()-t0};
 const NM=new Uint8Array(N*N*4);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,xl=y*N+((x+N-1)%N),xr=y*N+((x+1)%N),yu=((y+N-1)%N)*N+x,yd=((y+1)%N)*N+x,dx=(H[xr]-H[xl])*.5*N/16*nrm,dy=(H[yu]-H[yd])*.5*N/16*nrm,l=Math.hypot(dx,dy,1);
  NM[i*4]=Math.round((-dx/l*.5+.5)*255);
  NM[i*4+1]=Math.round((-dy/l*.5+.5)*255);
  NM[i*4+2]=Math.round((1/l*.5+.5)*255);
  NM[i*4+3]=Math.round(Math.max(0,Math.min(255,Rg[i]*255)));
 }
 const map=mk(A),normalMap=new THREE.DataTexture(NM,N,N);
 normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
 normalMap.magFilter=THREE.LinearFilter;
 normalMap.minFilter=THREE.LinearMipmapLinearFilter;
 normalMap.generateMipmaps=true;
 normalMap.flipY=true;
 normalMap.anisotropy=map.anisotropy;
 normalMap.needsUpdate=true;
 return LX.TT[kind]={map,normalMap,ms:performance.now()-t0};
};
/* A copy with a different repeat for the ground. The owning map releases both copies. */
LX.texRep=function(kind,rx,ry){const b=LX.tex(kind),o={};for(const k of['map','normalMap']){const t=b[k].clone();t.needsUpdate=true;t.repeat.set(rx,ry);o[k]=t}return o};
/* ---------- environment (reflections + sky ambient) ---------- */
LX.setEnv=function(cv){if(!LX.pbr||typeof R=='undefined'||!THREE.PMREMGenerator)return;
 try{const f=document.createElement('canvas');f.width=cv.width;f.height=cv.height;const g=f.getContext('2d');g.translate(f.width,0);g.scale(-1,1);g.drawImage(cv,0,0);
  /* the sky sphere runs the opposite way round to an equirectangular map, hence the mirror above; a little extra punch for reflections */
  const tex=new THREE.CanvasTexture(f);tex.mapping=THREE.EquirectangularReflectionMapping;if(!LX.pm)LX.pm=new THREE.PMREMGenerator(R);
  const rt=LX.pm.fromEquirectangular(tex);tex.dispose();if(LX.envRT)LX.envRT.dispose();LX.envRT=rt;S.environment=rt.texture}catch(e){console.warn('LUMEN env map failed',e)}};
/* ---------- animated clouds + stars on a dome over the painted sky ---------- */
LX.skyMat=function(fx,sd,background){const c=fx.cl,V=a=>new THREE.Color(a[0],a[1],a[2]);
 return new THREE.ShaderMaterial({depthWrite:false,side:THREE.BackSide,fog:false,
  uniforms:{tBackground:{value:background},uLxNoise:{value:LX.noiseTexture()},uT:LX.U.time,uCover:{value:c[0]},uOp:{value:c[1]},uWind:{value:new THREE.Vector2(c[2]*.012,c[2]*.004)},uScale:{value:c[3]},uLit:{value:V(c[4])},uShade:{value:V(c[5])},uSunD:{value:new THREE.Vector3(sd[0],sd[1],sd[2])},uStar:{value:fx.st||0}},
  vertexShader:'varying vec3 vD;varying vec2 vSkyUV;void main(){vD=position;vSkyUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform sampler2D tBackground;varying vec2 vSkyUV;uniform float uT;uniform float uCover;uniform float uOp;uniform float uScale;uniform float uStar;uniform vec2 uWind;uniform vec3 uLit;uniform vec3 uShade;uniform vec3 uSunD;varying vec3 vD;\n'+LX.NOISE+
  `float h3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
void main(){vec3 d=normalize(vD);float up=d.y;
vec3 background=texture2D(tBackground,vSkyUV).rgb;
if(up<=0.015){gl_FragColor=vec4(background,1.0);return;}
vec2 p=d.xz/(up+0.28)*uScale+uWind*uT*60.0;float n=lxFbm(p);float c=smoothstep(uCover-0.12,uCover+0.22,n);
if(c==0.0&&(uStar==0.0||up<=0.05)){gl_FragColor=vec4(background,1.0);return;}
float n2=lxFbm(p+uSunD.xz*0.07/(up+0.3));float lit=clamp(0.52+(n-n2)*5.0,0.0,1.0);
float alongSun=max(dot(d,uSunD),0.0);
float sa=pow(alongSun,6.0);
float silver=pow(alongSun,18.0)*smoothstep(0.05,0.32,c)*(1.0-smoothstep(0.32,0.72,c));
vec3 col=mix(uShade,uLit,lit)+uLit*(sa*0.55*(1.0-c*0.4)+silver*.55);float a=c*uOp*smoothstep(0.015,0.22,up);
float star=0.0;
if(uStar>0.0&&up>0.05){
 vec3 sp=d*300.0;float h=h3(floor(sp));
 if(h>=0.9972){vec2 q=fract(sp.xy+sp.z)-0.5;float tw=0.6+0.4*sin(uT*2.5+h*60.0);star=tw*uStar*smoothstep(0.05,0.3,up)*(1.0-c)*(1.0-smoothstep(0.1,0.5,length(q)));}
}
gl_FragColor=vec4(mix(background,mix(col,vec3(1.0),star),clamp(a+star,0.0,1.0)),1.0);}`})};
/* ---------- the post-processing pipeline ---------- */
LX.GL={};
LX.GL.vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
LX.GL.down=`uniform sampler2D tIn;uniform vec2 uTexel;uniform float uThr;uniform float uKnee;varying vec2 vUv;
vec3 R(vec2 o){return min(texture2D(tIn,vUv+o*uTexel).rgb,vec3(12.0));}
vec3 S(vec2 o){
 vec3 c=R(o);
 #ifdef PREFILTER
  float br=max(max(c.r,c.g),c.b);
  float rq=clamp(br-uThr+uKnee,0.0,2.0*uKnee);
  rq=rq*rq/(4.0*uKnee+0.0001);
  c*=max(rq,br-uThr)/max(br,0.0001);
 #endif
 return c;
}
void main(){
 #ifdef PREFILTER
  vec3 outer=S(vec2(-2.0,2.0))+S(vec2(2.0,2.0))+S(vec2(-2.0,-2.0))+S(vec2(2.0,-2.0));
  vec3 edge=S(vec2(0.0,2.0))+S(vec2(-2.0,0.0))+S(vec2(2.0,0.0))+S(vec2(0.0,-2.0));
  vec3 inner=S(vec2(-1.0,1.0))+S(vec2(1.0,1.0))+S(vec2(-1.0,-1.0))+S(vec2(1.0,-1.0));
  vec3 r=outer*0.03125+edge*0.0625+(inner+S(vec2(0.0)))*0.125;
 #else
  // Filter the already-prefiltered bloom with four bilinear taps.
  vec3 r=(S(vec2(-1.0,1.0))+S(vec2(1.0,1.0))+S(vec2(-1.0,-1.0))+S(vec2(1.0,-1.0)))*0.25;
 #endif
 gl_FragColor=vec4(r,1.0);
}`;
LX.GL.up=`uniform sampler2D tLow;uniform sampler2D tHigh;uniform vec2 uTexel;uniform float uScatter;varying vec2 vUv;
vec3 L(vec2 o){return texture2D(tLow,vUv+o*uTexel).rgb;}
void main(){
 vec3 tent=(L(vec2(-0.5,0.5))+L(vec2(0.5,0.5))+L(vec2(-0.5,-0.5))+L(vec2(0.5,-0.5)))*0.25;
 gl_FragColor=vec4(texture2D(tHigh,vUv).rgb+tent*uScatter,1.0);
}`;
LX.GL.bloom=`uniform sampler2D tBloomPyramid;uniform float uMaxLevel;varying vec2 vUv;
void main(){
 vec3 glow=textureLod(tBloomPyramid,vUv,0.0).rgb;
 glow+=textureLod(tBloomPyramid,vUv,min(1.0,uMaxLevel)).rgb*0.72;
 glow+=textureLod(tBloomPyramid,vUv,min(2.0,uMaxLevel)).rgb*0.5184;
 glow+=textureLod(tBloomPyramid,vUv,min(3.0,uMaxLevel)).rgb*0.373248;
 glow+=textureLod(tBloomPyramid,vUv,min(4.0,uMaxLevel)).rgb*0.268739;
 gl_FragColor=vec4(glow,1.0);
}`;
LX.GL.rays=`uniform sampler2D tScene;uniform vec2 uSun;uniform float uDens;uniform float uDecay;uniform float uThr;varying vec2 vUv;
void main(){vec2 d=(uSun-vUv)*uDens/20.0;vec2 uv=vUv;float ill=1.0;vec3 acc=vec3(0.0);
for(int i=0;i<20;i++){uv+=d;vec3 c=texture2D(tScene,uv).rgb;float l=dot(c,vec3(0.299,0.587,0.114));float m=smoothstep(uThr,uThr+0.3,l);acc+=min(c,vec3(4.0))*m*ill*0.1;ill*=uDecay;}
gl_FragColor=vec4(acc,1.0);}`;
LX.GL.comp=`uniform sampler2D tScene;uniform sampler2D tBloom;uniform sampler2D tRays;uniform vec2 uRes;uniform float uTime;uniform float uExp;uniform float uBloom;uniform float uRay;uniform float uVig;uniform float uGrain;uniform float uCA;uniform float uSharp;uniform float uSpeed;uniform float uDmg;uniform float uHeal;uniform float uFlash;uniform float uPulse;uniform float uSat;uniform float uCon;
uniform vec3 uRayCol;uniform vec3 uTintS;uniform vec3 uTintH;uniform vec3 uFlashCol;varying vec2 vUv;
float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}
vec3 filmic(vec3 x){float a=0.74;vec3 over=max(x-a,vec3(0.0));vec3 r=a+(1.0-a)*(1.0-exp(-over/(1.0-a)));return mix(x,r,step(vec3(a),x));}
void main(){vec2 uv=vUv;vec2 c=uv-0.5;float r2=dot(c,c);float rr=sqrt(r2);vec3 col;vec2 off=c*uCA*(0.3+r2*2.4);
vec3 center=texture2D(tScene,uv).rgb;
vec3 fringe=vec3(texture2D(tScene,uv+off).r-center.r,0.0,texture2D(tScene,uv-off).b-center.b);
col=center;
if(uSpeed>0.002){
 vec2 stepUV=c*uSpeed*.028;
 for(int i=1;i<=5;i++)col+=texture2D(tScene,uv-stepUV*float(i)).rgb;
 col*=1.0/6.0;
}
col+=fringe;
vec2 px=1.0/uRes;vec3 bl=(texture2D(tScene,uv+vec2(px.x,0.0)).rgb+texture2D(tScene,uv-vec2(px.x,0.0)).rgb+texture2D(tScene,uv+vec2(0.0,px.y)).rgb+texture2D(tScene,uv-vec2(0.0,px.y)).rgb)*0.25;
col+=(col-bl)*uSharp;col=max(col,vec3(0.0));
col+=texture2D(tBloom,uv).rgb*uBloom;if(uRay>0.0)col+=texture2D(tRays,uv).rgb*uRay*uRayCol;col+=uFlashCol*uFlash;col*=uExp;
float l=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(l),col,uSat);col=(col-0.5)*uCon+0.5;col+=mix(uTintS,uTintH,smoothstep(0.1,0.9,l))*0.1;col=filmic(max(col,vec3(0.0)));
float lh=dot(col,vec3(0.299,0.587,0.114));col=mix(col,vec3(lh),smoothstep(0.85,1.0,lh)*0.22);
float vg=1.0-smoothstep(0.2,0.85,rr*1.15*(1.0+uPulse));col*=mix(1.0-uVig,1.0,vg);
col=mix(col,col*vec3(1.0,0.34,0.3),uDmg*smoothstep(0.15,0.75,rr*1.4));col+=vec3(0.02,0.1,0.05)*uHeal*smoothstep(0.2,0.8,rr);
float g=h21(uv*uRes+fract(uTime)*91.7)-0.5;col+=g*uGrain;col+=(h21(uv*uRes*1.7+3.1)-0.5)/255.0;
gl_FragColor=vec4(col,1.0);}`;
LX.initPost=function(){if(LX.inited||typeof R=='undefined')return;LX.inited=true;
 try{
  const gl2=R.capabilities.isWebGL2;
  LX.hdr=!!(gl2&&R.extensions.has('EXT_color_buffer_float'));
  LX.msaa=gl2&&!!THREE.WebGLMultisampleRenderTarget?4:0;
  const sh=(f,u,defines={})=>new THREE.ShaderMaterial({defines,uniforms:u,vertexShader:LX.GL.vs,fragmentShader:f,depthTest:false,depthWrite:false});
  const T=()=>({value:null}),V2=()=>({value:new THREE.Vector2()}),F=v=>({value:v}),V3=()=>({value:new THREE.Vector3()});
  LX.mPrefilter=sh(LX.GL.down,{tIn:T(),uTexel:V2(),uThr:F(.8),uKnee:F(.45)},{PREFILTER:1});
  if(gl2)LX.mBloom=sh(LX.GL.bloom,{tBloomPyramid:T(),uMaxLevel:F(4)});
  LX.mDown=sh(LX.GL.down,{tIn:T(),uTexel:V2()});LX.mUp=sh(LX.GL.up,{tLow:T(),tHigh:T(),uTexel:V2(),uScatter:F(.7)});
  LX.mRays=sh(LX.GL.rays,{tScene:T(),uSun:V2(),uDens:F(.95),uDecay:F(.93),uThr:F(.7)});
  LX.mComp=sh(LX.GL.comp,{tScene:T(),tBloom:T(),tRays:T(),uRes:V2(),uTime:F(0),uExp:F(1),uBloom:F(.5),uRay:F(0),uVig:F(.3),uGrain:F(.03),uCA:F(.0015),uSharp:F(.22),uSpeed:F(0),uDmg:F(0),uHeal:F(0),uFlash:F(0),uPulse:F(0),uSat:F(1.1),uCon:F(1.05),uRayCol:V3(),uTintS:V3(),uTintH:V3(),uFlashCol:V3()});
  const triangle=new THREE.BufferGeometry();
  triangle.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
  triangle.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,2,0,0,2],2));
  LX.quad=new THREE.Mesh(triangle,LX.mComp);LX.quad.frustumCulled=false;LX.qs=new THREE.Scene();LX.qs.add(LX.quad);LX.qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  LX.sunV=new THREE.Vector3();LX.mkRT();addEventListener('resize',()=>{if(LX.rtS)LX.mkRT()})}catch(e){LX.fail('init',e)}};
LX.releasePostTargets=function(){
 for(const target of [LX.rtS,...(LX.rtD||[]),...(LX.rtU||[]),LX.rtR,LX.rtBloom])target?.dispose();
 LX.rtS=LX.rtD=LX.rtU=LX.rtR=LX.rtBloom=null;
};
LX.mkRT=function(){try{const sz=new THREE.Vector2();R.getDrawingBufferSize(sz);const w=Math.max(2,sz.x),h=Math.max(2,sz.y);
  const target=(width,height,depth)=>{
   const Target=depth&&LX.msaa?THREE.WebGLMultisampleRenderTarget:THREE.WebGLRenderTarget;
   const rt=new Target(width,height,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,
    format:THREE.RGBAFormat,type:LX.hdr?THREE.HalfFloatType:THREE.UnsignedByteType,
    depthBuffer:depth,stencilBuffer:false});
   if(depth&&LX.msaa)rt.samples=LX.msaa;
   return rt;
  };
  LX.releasePostTargets();
  LX.rtS=target(w,h,true);
  LX.rtD=[];LX.rtU=[];
  let cw=Math.max(2,w>>1),ch=Math.max(2,h>>1);
  if(LX.mBloom&&!LX.mipBloomFailed){
   const pyramid=target(cw,ch,false);
   pyramid.texture.generateMipmaps=true;
   pyramid.texture.minFilter=THREE.LinearMipmapLinearFilter;
   LX.rtD.push(pyramid);
   LX.rtBloom=target(cw,ch,false);
  }else{
   for(let i=0;i<5;i++){
    LX.rtD.push(target(cw,ch,false));
    if(i<4)LX.rtU.push(target(cw,ch,false));
    cw=Math.max(2,cw>>1);ch=Math.max(2,ch>>1);
   }
  }
  LX.rtR=target(Math.max(2,w>>2),Math.max(2,h>>2),false);LX.sw=w;LX.sh=h;LX.mComp.uniforms.uRes.value.set(sz.x,sz.y)}catch(e){LX.fail('targets',e)}};
LX.fail=function(why,e){LX.postDead=true;LX.postOn=false;LX.releasePostTargets();try{console.warn('LUMEN post-processing disabled ('+why+')',e||'')}catch(x){}};
LX.active=function(){return LX.postOn&&!LX.postDead&&LX.inited&&!(R.xr&&R.xr.isPresenting)};
LX.renderPass=function(material,target){
 LX.quad.material=material;
 R.setRenderTarget(target);
 // A single full-screen triangle overwrites the color target, including along the old diagonal.
 const clear=R.autoClear;
 R.autoClear=false;
 try{R.render(LX.qs,LX.qc)}finally{R.autoClear=clear}
};
/* every frame: scene -> HDR target -> bloom chain -> sun shafts -> grade to the screen */
LX.render=function(sc,cam){
 if(LX.postOn&&!LX.inited)LX.initPost();
 if(LX.active()&&!LX.rtS)LX.mkRT();
 if(!LX.active()){R.render(sc,cam);LX.frames++;if(LX.frames==4||LX.frames%240==0)LX.verify();return}
 try{const U=LX.mComp.uniforms,fx=LX.fx,m=LX.mp||LX.FXD,qd=LX.renderPass;
  const sceneTarget=LX.rtS;
  R.setRenderTarget(sceneTarget);
  // Three r128 allocates depth when the target is bound and uses depthBuffer as a blit
  // mask during MSAA resolve. Post-processing only samples color, so skip the depth copy.
  if(sceneTarget.isWebGLMultisampleRenderTarget)sceneTarget.depthBuffer=false;
  try{R.render(sc,cam)}finally{sceneTarget.depthBuffer=true}
  const pre=LX.mPrefilter.uniforms,D=LX.mDown.uniforms,Up=LX.mUp.uniforms,nd=LX.rtD.length;
  pre.tIn.value=LX.rtS.texture;pre.uTexel.value.set(1/LX.sw,1/LX.sh);pre.uThr.value=m.thr||.92;
  qd(LX.mPrefilter,LX.rtD[0]);
  if(LX.rtBloom){
   const B=LX.mBloom.uniforms,pyramid=LX.rtD[0];
   B.tBloomPyramid.value=pyramid.texture;
   B.uMaxLevel.value=Math.min(4,Math.floor(Math.log2(Math.max(pyramid.width,pyramid.height))));
   qd(LX.mBloom,LX.rtBloom);
  }else{
   for(let i=1;i<nd;i++){
    const src=LX.rtD[i-1];D.tIn.value=src.texture;D.uTexel.value.set(1/src.width,1/src.height);qd(LX.mDown,LX.rtD[i]);
   }
   for(let i=nd-2;i>=0;i--){const low=i==nd-2?LX.rtD[i+1]:LX.rtU[i+1];Up.tLow.value=low.texture;Up.tHigh.value=LX.rtD[i].texture;Up.uTexel.value.set(1/low.width,1/low.height);Up.uScatter.value=.72;qd(LX.mUp,LX.rtU[i])}
  }
  /* sun shafts */
  let ray=0;if(m.ray>0&&typeof skyDir=='function'&&typeof C!='undefined'){const d=skyDir(),v=LX.sunV;v.set(C.position.x+d[0]*100,C.position.y+d[1]*100,C.position.z+d[2]*100);v.project(cam);
   if(v.z<1){const e=1-Math.min(1,Math.max(0,(Math.max(Math.abs(v.x),Math.abs(v.y))-.8)/1.2));ray=m.ray*e;if(ray>0){const R_=LX.mRays.uniforms;R_.uSun.value.set(v.x*.5+.5,v.y*.5+.5);R_.tScene.value=LX.rtS.texture;qd(LX.mRays,LX.rtR)}}}
  U.tScene.value=LX.rtS.texture;U.tBloom.value=(LX.rtBloom||LX.rtU[0]).texture;U.tRays.value=LX.rtR.texture;U.uTime.value=LX.U.time.value;
  U.uExp.value=m.ex*LX.bright;U.uBloom.value=m.bl*.5*(1+fx.boom*.9+fx.shot*.15);U.uRay.value=ray*(1+fx.flash*.5);U.uVig.value=m.vig+fx.dmg*.12;U.uGrain.value=(m.gr==null?.03:m.gr);U.uCA.value=.0011+fx.ca*.012+fx.boom*.006+fx.dmg*.004;
  U.uSharp.value=.2;U.uSpeed.value=LX.mblur?Math.min(1,fx.speed+fx.blur):0;U.uDmg.value=Math.min(1,fx.dmg);U.uHeal.value=fx.heal;U.uFlash.value=fx.flash;U.uPulse.value=fx.pulse;U.uSat.value=m.sat*(1-fx.dmg*.2);U.uCon.value=m.con;
  U.uRayCol.value.set(m.rc[0],m.rc[1],m.rc[2]);U.uTintS.value.set(m.ts[0],m.ts[1],m.ts[2]);U.uTintH.value.set(m.th[0],m.th[1],m.th[2]);U.uFlashCol.value.set(1,.97,.9);
  qd(LX.mComp,null);
  LX.frames++;if(LX.frames==4||LX.frames%240==0)LX.verify()}catch(e){R.setRenderTarget(null);LX.fail('render',e);R.render(sc,cam)}};
/* diagnostics: broken shader programs and GL errors switch the offending feature off instead of blanking the game */
LX.verify=function(){try{const ps=(R.info&&R.info.programs)||[],bad=ps.filter(p=>p.diagnostics&&p.diagnostics.runnable===false);
  if(bad.length){
   if(LX.rtBloom){
    const program=R.properties.get(LX.mBloom).currentProgram;
    if(program?.diagnostics?.runnable===false){LX.mipBloomFailed=true;LX.mkRT();return}
   }
   const post=[LX.mPrefilter,LX.mDown,LX.mUp,LX.mRays,LX.mComp].some(m=>{try{const pr=R.properties.get(m),cp=pr&&pr.currentProgram;return cp&&cp.diagnostics&&cp.diagnostics.runnable===false}catch(e){return false}});
   if(post)LX.fail('a post-processing shader failed to compile');
   if(bad.some(p=>p.name==='MeshStandardMaterial'||p.name==='MeshPhysicalMaterial')&&!LX.patchOff){LX.patchOff=true;LX.refresh();console.warn('LUMEN: fog/dirt patch disabled (shader error)')}}
  const gl=R.getContext();let framebufferError=false;
  for(let i=0,error;i<8&&(error=gl.getError());i++){
   framebufferError||=error===gl.INVALID_FRAMEBUFFER_OPERATION;
   if(LX.rtBloom&&error===gl.INVALID_OPERATION){LX.mipBloomFailed=true;framebufferError=true}
  }
  if(framebufferError&&LX.postOn){
   if(LX.rtBloom&&LX.mipBloomFailed)LX.mkRT();
   else if(LX.hdr){LX.hdr=false;LX.mkRT();console.warn('LUMEN: half-float target unsupported, using 8-bit')}
   else LX.fail('framebuffer');
  }
 }catch(e){}};
LX.refresh=function(){try{S.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms)if(m.onBeforeCompile&&m.userData&&m.userData.lxFl){m.needsUpdate=true}})}catch(e){}};
/* ---------- per-map look + per-frame bookkeeping ---------- */
LX.setMap=function(name){const f=LX.FX[name]||LX.FXD;LX.mp=Object.assign({},f);LX.mp.gr=name=='Hollow Estate'?.05:.028;LX.U.fogA.value=f.haze;LX.U.fogH.value=f.hz*(f.haze>.4?.7:1);LX.U.fogD.value=.012+f.haze*.014;return LX.mp};
LX.tick=function(dt){LX.U.time.value+=dt;const f=LX.fx,k=n=>Math.exp(-n*dt);f.hit*=k(9);f.boom*=k(2.6);f.shot*=k(16);f.flash*=k(3.4);f.ca*=k(7);f.dmg*=k(2.4);f.heal*=k(2.2);f.pulse*=k(5);f.blur*=k(4)};
LX.setQuality=function(q){LX.q=q;LX.postOn=q=='high'&&!LX.postDead&&!LX.safe;if(!LX.postOn)LX.releasePostTargets();try{localStorage.setItem('sdrill-gfx',q)}catch(e){}};
/* brightness setting: scales post-processing exposure (or tone-mapping exposure when post-processing is off) */
LX.setBright=function(v){v=Math.max(.6,Math.min(1.6,+v||1));LX.bright=v;try{localStorage.setItem('sdrill-bright',v)}catch(e){}
 if(typeof R!='undefined'&&!LX.active()){const on=Math.abs(v-1)>.01;const tm=on?THREE.LinearToneMapping:THREE.NoToneMapping;if(R.toneMapping!==tm){R.toneMapping=tm;LX.refresh()}R.toneMappingExposure=v}
 for(const id of['br','br2']){const e=document.getElementById(id);if(e)e.value=v}};
LX.initBright=function(){for(const id of['br','br2']){const e=document.getElementById(id);if(e){e.value=LX.bright;e.oninput=()=>LX.setBright(e.value)}}if(Math.abs(LX.bright-1)>.01&&!LX.postOn&&typeof R!='undefined')LX.setBright(LX.bright)};
/* ---------- studio lighting for the weapon / camo / item preview renderers ----------
   Those previews run in their own WebGL contexts (a texture cannot be shared between contexts) with only a hemisphere and two directional lights; metal needs something to reflect or it renders black.
   The first time any renderer other than the main one draws a scene, it gets its own prefiltered studio environment (soft boxes over a grey cyclorama). */
LX.studio=function(){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#d6e4f4');gr.addColorStop(.45,'#a3b0bf');gr.addColorStop(.52,'#707884');gr.addColorStop(1,'#2e343b');g.fillStyle=gr;g.fillRect(0,0,512,256);
 const box=(x,y,w,h,a)=>{const r=g.createRadialGradient(x,y,0,x,y,Math.max(w,h));r.addColorStop(0,'rgba(255,255,255,'+a+')');r.addColorStop(.6,'rgba(255,255,255,'+a*.5+')');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(x-w,y-h,w*2,h*2)};
 box(150,70,64,32,1);box(380,92,44,26,.8);box(40,104,54,22,.5);return c};
LX.envFor=function(r){LX._ev=LX._ev||new WeakMap();let t=LX._ev.get(r);if(t!==undefined)return t;LX._pmBusy=true;
 try{const pm=new THREE.PMREMGenerator(r),tex=new THREE.CanvasTexture(LX.studio());tex.mapping=THREE.EquirectangularReflectionMapping;const rt=pm.fromEquirectangular(tex);tex.dispose();t=rt.texture}catch(e){t=null;console.warn('LUMEN studio env failed',e)}
 LX._pmBusy=false;LX._ev.set(r,t);return t};
if(LX.pbr&&THREE.WebGLRenderer){const r0=THREE.WebGLRenderer.prototype.render;
 THREE.WebGLRenderer.prototype.render=function(sc,cam){if(!LX._pmBusy&&sc&&sc.isScene&&!sc.environment){let main=false;try{main=this===R}catch(e){main=true}if(!main){const e=LX.envFor(this);if(e)sc.environment=e}}return r0.apply(this,arguments)}}

/* ######## core.js ######## */
/* ===================== data.js ===================== */
var $=q=>document.querySelector(q),V=(x,y,z)=>new THREE.Vector3(x,y,z),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasOwn=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
/* ---------- data ---------- */
var W={AR:{n:'KN-115',d:30,r:.075,m:32,sp:.012,rc:1,pel:1,au:1,rl:2,len:.55,col:0x3a4a52},
SMG:{n:'SMG',d:22,r:.055,m:40,sp:.022,rc:.7,pel:1,au:1,rl:1.8,len:.4,col:0x5a4a40},
BR:{n:'Battle Rifle',d:36,r:.24,m:12,sp:.004,rc:2.5,pel:1,au:0,rl:2.2,len:.65,col:0x2f4a3a},
SG:{n:'Shotgun',d:22,r:.62,m:8,sp:.045,rc:5,pel:10,au:0,rl:2.4,len:.5,col:0x555a62},
MG:{n:'Magnum',d:36,r:.26,m:8,sp:.005,rc:3,pel:1,au:0,rl:1.5,len:.5,col:0x1b2027},
MP:{n:'Machine Pistol',d:24,r:.07,m:24,sp:.03,rc:.6,pel:1,au:1,rl:1.4,len:.25,col:0x3a3a4a},
VA:{n:'Vanguard',d:33,r:.10,m:30,sp:.009,rc:1.34,pel:1,au:1,rl:2.27,len:.72,col:0xa49674},
BP:{n:'Breakwater',d:20,r:.82,m:5,sp:.032,rc:5.1,pel:10,au:0,rl:2.9,len:.73,col:0x475f6e,pumpAction:true},
KTS:{n:'Kestrel',d:13,r:.34,m:8,sp:.052,rc:2.85,pel:9,au:0,rl:3.1,len:.65,col:0x627159},
RD:{n:'Rivet',d:25,r:.066,m:48,sp:.029,rc:.91,pel:1,au:1,rl:3.25,len:.57,col:0x664639},
HC:{n:'Monarch',d:60,r:.36,m:7,sp:.012,rc:4.35,pel:1,au:0,rl:1.95,len:.39,col:0x878e98,sidearm:true},
OH:{n:'Outrider',d:94,r:.86,m:1,rs:22,sp:.0019,rc:5.15,pel:1,au:0,rl:1.34,len:.89,col:0xa45f37,singleLoad:true}};
Object.assign(W,{
 SW:{n:'Switchback',d:28,r:.085,m:33,sp:.0085,rc:1.22,pel:1,au:1,rl:2.31,len:.72,col:0x6a6057},
 LT:{n:'Lattice',d:21,r:.061,m:42,sp:.017,rc:.69,pel:1,au:1,rl:2.17,len:.51,col:0x3d6863},
 PD:{n:'Pendulum',d:62,r:.34,m:9,sp:.0024,rc:3.1,pel:1,au:0,rl:2.53,len:.86,col:0x566470}
});
W.TEA={n:'The Brew',d:8,r:.1,m:36,rs:3,sp:.003,rc:.2,pel:1,au:1,rl:2.1,len:.55,col:0xc98a3b,ex:{R:3.2,d:6,imp:0,w:'TEA',c:0xd9953f}};
W.AN={...annihilatorStats};
W.KEY={n:'Keyshooter',d:900,r:.34,m:18,rs:4,sp:.0015,rc:.34,pel:1,au:1,rl:2.15,len:.74,col:0x63dfff,pw:1};
W.ULT={n:'Ultima',d:205,r:.078,m:150,rs:4,sp:.012,rc:.45,pel:1,au:1,rl:2.6,len:1.05,col:0xffb257};
var PRI=['AR','SMG','BR','SG','VA','BP','KTS','RD','OH','SW','LT','PD','TEA'],SEC=['MG','MP','HC','AN'];
function attachmentFits(k,a){return !W[k]?.singleLoad||a!=='Extended Mag'}
var A={'Extended Mag':{m:1.5,t:'+50% magazine'},'Compensator':{rc:.55,t:'Less kick'},'Laser Sight':{sp:.5,t:'Tighter spread'},'Long Barrel':{d:1.12,t:'+12% damage'},'Fast Hands':{rl:.65,t:'Faster reload'},'Hollow Point':{d:1.18,rc:1.25,t:'+18% damage, more kick'},'Quickdraw Grip':{ad:1.9,t:'Aim down sights almost twice as fast'}};
var K={'Marathon':'Move 15% faster','Overshield':'+50 shield','Scavenger':'Kills refill ammo','Spring Legs':'Jump higher','Second Wind':'Shield recharges much faster','Hardline':'Killstreaks need 1 fewer kill','Run & Gun':'Shoot while sprinting','Quick Fix':'Kills instantly restore health and shield'};
var GR={'Frag':{fuse:1.8,R:7,d:110,imp:0,t:'Bounces, 1.8s fuse'},'Impact':{fuse:4,R:5,d:85,imp:1,t:'Explodes on contact'},'Semtex':{fuse:2.6,R:6,d:105,imp:0,stk:1,t:'Sticks to walls, floors and enemies, 2.6s fuse'}};
const modeLabels=Object.create(null);
var MODES={'Slayer':'First to 20 kills.','One in the Chamber':'A pistol with one bullet and three lives. Every hit kills and every kill earns a bullet, melee kills too. Last one standing wins.','Survival':'One life. Endless waves.','Time Attack':'Most kills in 90 seconds.','Team Deathmatch':'First team to 50 kills wins.','Capture the Flag':'Steal the enemy flag and bring it back to your base. First to 3 captures.','Kill Confirmed':'Every fallen fighter drops a tag: grab enemy tags to bank the kill, grab your own side\'s tags to deny theirs. First team to 100 confirms.','Hardpoint':'Hold the rotating zone to score. First team to 250 wins.','Domination':'Hold the three zones. Each zone you own earns points. First team to 350 wins.','Zombies':'Survive endless rounds of the undead. Earn points, open doors, use the mystery box, Pack-a-Punch and perks. Solo.'};
/* open maps have no tall walls: the play area is enclosed by one continuous fence (with an invisible tall collision wall above it) */
function barrierLine(a,x0,z0,x1,z1,seed){const hz=Math.abs(x1-x0)>=Math.abs(z1-z0),L=hz?Math.abs(x1-x0):Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;
 /* one continuous painted fence with a top rail, plus an invisible tall collision wall above it so nobody can mantle, wall jump or squeeze over */
 a.push([cx,cz,hz?L:.3,hz?.3:L,2.3,0,0xd9d3c0,'plank']);a.push([cx,cz,hz?L:.5,hz?.5:L,2.55,2.3,0x8a7d68,'plank']);a.push([cx,cz,hz?L:.5,hz?.5:L,14,0,0,'n'])}
const ROOM_CHALLENGE='The 1 Room Challenge',JUPITER_MAP='Jovian Terminus';
const LEGACY_JUPITER_MAP='Perijove Station';
const currentMapName=name=>name===LEGACY_JUPITER_MAP?JUPITER_MAP:name;
var MAPS={
'Blockfort':{d:'Walled fort with a raised centre',H:28,sky:0x86b6d8,gr:0x55654f,bc:0x8d99a3,b(){const a=[[-4.5,-7,5,1.2,3],[4.5,-7,5,1.2,3],[-4.5,7,5,1.2,3],[4.5,7,5,1.2,3],[-7,-4.5,1.2,5,3],[-7,4.5,1.2,5,3],[7,-4.5,1.2,5,3],[7,4.5,1.2,5,3],[0,0,5,5,1]];for(const s of[-1,1]){a.push([s*18,18,3,3,1.5],[s*18,-18,3,3,1.5],[s*21,0,2,7,1],[0,s*21,7,2,1]);}return a}},
'Pillars':{d:'Open grid of tall cover',H:34,sky:0xc9a27a,gr:0x6b5a48,bc:0xb09878,b(){const a=[];for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){if(i||j)a.push([i*11,j*11,2.2,2.2,5]);if(i<2&&j<2)a.push([i*11+5.5,j*11+5.5,3,1,1]);}return a}},
'Canyon':{d:'Long walls with stepped ledges',H:36,sky:0x6d8fb0,gr:0x4a5a52,bc:0x7a8590,b(){const a=[[-9,-24,2,12,6],[-9,0,2,16,6],[-9,25,2,12,6],[9,-25,2,10,6],[9,-3,2,14,6],[9,22,2,16,6]];for(const s of[-1,1])a.push([s*20,0,3,6,1],[s*23,0,3,6,2],[s*26,0,3,6,3],[s*22,-18,4,4,1.2],[s*22,18,4,4,1.2]);return a}},
'Suburbia':{d:'American suburb: houses, driveways, picket fences, pools and parked cars',H:58,open:1,sky:0x9fd0f0,gr:0x6e9e4c,bc:0xcfc8b8,fb:[[-27,0],[27,0]],zn:[[-27,0],[0,0],[27,0]],
 deco(){const a=[],B=(x,z,w,d,h,y0,c)=>a.push([x,z,w,d,h,y0||0,c]);let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647,pal=[0xe8e2d0,0x9fb7c9,0xd9b9a0,0xb9c9a0],rf=[0x6b4a3a,0x4a4f58,0x7a3b32,0x58606a];
  for(let k=0;k<44;k++){const side=k%4,t=-96+((k/4)|0)*17.5+r()*5,d=68+r()*26,x=side<2?t:(side==2?-d:d),z=side<2?(side==0?-d:d):t,i=(r()*4)|0,w=8+r()*4,dd=7+r()*3,h=3.6+r()*1.2;B(x,z,w,dd,h,0,pal[i]);B(x,z,w+1,dd+1,h+.8,h,rf[i])}
  for(let k=0;k<110;k++){const ang=r()*6.283,d=62+r()*60,x=Math.cos(ang)*d,z=Math.sin(ang)*d;if(Math.abs(x)<60&&Math.abs(z)<60)continue;B(x,z,.5,.5,3,0,0x6b4a2b);B(x,z,3.4,3.4,6,3,0x4f8a3a)}
  for(let k=0;k<14;k++){const t=k/14*6.283;B(Math.cos(t)*150,Math.sin(t)*150,60,60,14+r()*10,0,0x5a7a4a)}return a},
 b(){
 const a=[],vv=(MAPS.Suburbia._v=MAPS.Suburbia._v||[]),B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>vv.push([x,z,w,d,h,y0||0,c,s,t]),pal=[0xe8e2d0,0x9fb7c9,0xd9b9a0,0xb9c9a0],rf=[0x6b4a3a,0x4a4f58,0x7a3b32,0x58606a],wh=0xece8dc,cc=[0xb23a2e,0x2f5f9e,0xd9d4c4,0x3a7a4a];
 /* two crossing streets with sidewalks (flat, walk right over them) */
 B(0,0,116,6.4,.05,0,0x3a3d42);B(0,0,6.4,116,.05,0,0x3a3d42);for(const s of[-1,1]){B(0,s*4.1,116,1.4,.1,0,0xbfbfb6);B(s*4.1,0,1.4,116,.1,0,0xbfbfb6);B(0,s*40,116,6.4,.05,0,0x3a3d42);B(s*40,0,6.4,116,.05,0,0x3a3d42);for(const e of[-1,1]){B(0,s*40+e*4.1,116,1.4,.1,0,0xbfbfb6);B(s*40+e*4.1,0,1.4,116,.1,0,0xbfbfb6)}}
 const car=(x,z,az,len,c,van)=>{const w=1.9;if(van){B(x,z,az?2.3:len,az?len:2.3,2.3,0,c,'metal');V(x,z,az?2.35:len+.05,az?len+.05:2.35,1.9,1.2,0x27333c,'g')}else{B(x,z,az?w:len,az?len:w,1,0,c,'metal');B(x,z,az?w*.9:len*.5,az?len*.5:w*.9,1.65,1,0x27333c,'glass')}
  for(const sx of[-1,1]){for(const sy of[-1,1])V(az?x+sx*(w/2+.02):x+sy*len*.3,az?z+sy*len*.3:z+sx*(w/2+.02),az?.14:.6,az?.6:.14,.5,0,0x111111,'b','metal');V(az?x+sx*.6:x+len/2,az?z+len/2:z+sx*.6,az?.3:.06,az?.06:.3,.7,.45,0xfff2b0,'e');V(az?x+sx*.6:x-len/2,az?z-len/2:z+sx*.6,az?.3:.06,az?.06:.3,.7,.45,0xc02020,'e')}},
  tree=(x,z)=>{B(x,z,.5,.5,3,0,0x6b4a2b,'plank');a.push([x,z,3.6,3.6,6.2,3,0,'n']);V(x,z,3.8,3.8,6.2,2.7,0x3f7d34,'s');V(x+1,z+.5,2.8,2.8,5.4,2.5,0x4a8a3a,'s');V(x-.9,z-.6,2.6,2.6,5.3,2.6,0x3a7230,'s')},
  house=(x,z,w,d,i,fx,fz)=>{const nx=fx||0,nz=fz||0,tx=nz?1:0,tz=nx?1:0,px=x+nx*w/2,pz=z+nz*d/2,L=tx?w:d;
   B(x,z,w,d,3.8,0,pal[i%4],'stucco');B(x,z,w+1,d+1,4.5,3.8,rf[i%4],'shingle');V(x+w*.28,z-d*.2,.9,.9,5.9,3.9,0x8a4a3a,'b','brick');
   B(px+nx*.06,pz+nz*.06,nz?1.2:.12,nz?.12:1.2,2.4,0,0x4a2f20,'plank');B(px+nx*.7,pz+nz*.7,nz?2.2:1.4,nz?1.4:2.2,.35,0,0xaaa8a0);V(px+nx*.15,pz+nz*.15,nz?.3:.1,nz?.1:.3,2.8,2.6,0xffe9a0,'e');
   for(const s of[-1,1]){const o=s*L*.28,wx=px+tx*o+nx*.04,wz=pz+tz*o+nz*.04;B(wx,wz,nz?1.8:.08,nz?.08:1.8,2.7,1.2,0x2a3a4a,'glass');V(wx-nx*.03,wz-nz*.03,nz?2.1:.05,nz?.05:2.1,2.95,1.05,0xf2efe6,'b','plank');V(px+tx*(o+s*1.3)+nx*.05,pz+tz*(o+s*1.3)+nz*.05,nz?.4:.06,nz?.06:.4,2.9,1.1,0x3a5a3a,'b','plank');V(px+tx*o*1.15+nx*1.35,pz+tz*o*1.15+nz*1.35,1.3,1.3,1.3,.1,0x3a6a30,'s')}};
 for(const sx of[-1,1])for(const sz of[-1,1]){const q=(sx>0?1:0)+(sz>0?2:0);
  house(sx*16,sz*12,9,8,q,0,-sz);house(sx*27,sz*12,9,8,q+1,0,-sz);house(sx*16,sz*27,9,8,q+2,-sx,0);
  B(sx*9.3,sz*12.5,4.4,6,2.6,0,pal[q%4]);B(sx*9.3,sz*12.5,4.8,6.4,2.9,2.6,rf[q%4]);B(sx*9.3,sz*9.45,3.4,.12,2.2,0,0xd5d5d0);B(sx*9.3,sz*7.2,3.6,4.8,.06,0,0x8a8a86);car(sx*9.3,sz*7.3,1,4.4,cc[q%4]);
  B(sx*8.5,sz*19.5,7,.2,1.2,0,wh);B(sx*27.5,sz*19.5,13,.2,1.2,0,wh);B(sx*21.5,sz*12,.2,8,1.2,0,wh);B(sx*27,sz*5.4,9.5,.15,1,0,wh);
  tree(sx*19.5,sz*6.4);tree(sx*6.6,sz*21);tree(sx*6.6,sz*31);tree(sx*31.5,sz*6.4);
  B(sx*27,sz*27,8.4,6.4,.06,0,0xb59a70);B(sx*27,sz*27,7,5,.1,0,0x3aa0d0);B(sx*32,sz*32,3,3,2.6,0,0x9a4a3a);B(sx*32,sz*32,3.4,3.4,2.9,2.6,0x58606a)}
 /* outer ring: a street of houses on every side, corner parks, and the car + bollard perimeter */
 for(const s of[-1,1])for(const k of[-36,-24,-12,12,24,36]){house(k,s*49.5,9,8,k/12+s+6,0,-s);house(s*49.5,k,9,8,k/12+s+7,-s,0);B(k,s*43.2,3.2,.15,1,0,wh);B(s*43.2,k,.15,3.2,1,0,wh)}
 for(const sx of[-1,1])for(const sz of[-1,1]){tree(sx*50,sz*50);tree(sx*54.5,sz*45);tree(sx*45,sz*54.5);B(sx*50,sz*46,2.2,.6,.5,0,0x7a5a3a)}
 car(-22,38,0,4.4,0xb23a2e);car(22,-38,0,4.4,0x2f5f9e);car(38,-22,1,4.4,0xd9d4c4);car(-38,22,1,4.4,0x3a7a4a);
 /* street furniture: centre lines, crosswalks, lamp posts, stop signs, hydrants */
 for(let k=-54;k<=54;k+=7)if(Math.abs(k)>7){V(k,0,3,.16,.07,0,0xe8c020,'b','asphalt');V(0,k,.16,3,.07,0,0xe8c020,'b','asphalt');for(const s of[-1,1]){V(k,s*40,3,.16,.07,0,0xe8e8e0,'b','asphalt');V(s*40,k,.16,3,.07,0,0xe8e8e0,'b','asphalt')}}
 for(const sx of[-1,1])for(const sz of[-1,1])for(let k=0;k<4;k++){V(sx*7.2,sz*(.4+k*.8),.5,.55,.07,0,0xf0f0e8,'b','asphalt');V(sz*(.4+k*.8),sx*7.2,.55,.5,.07,0,0xf0f0e8,'b','asphalt');V(sx*5.6,sz*5.6,.12,.12,2.6,0,0x777777,'c');V(sx*5.6,sz*5.5,.7,.06,3.2,2.5,0xc02020,'b','metal')}
 for(const k of[-48,-30,-12,12,30,48])for(const s of[-1,1]){V(k,s*5.6,.16,.16,5,0,0x2a2a2e,'c');V(k,s*5.1,.5,.9,5.14,5,0xfff0c0,'e');V(s*5.6,k,.16,.16,5,0,0x2a2a2e,'c');V(s*5.1,k,.9,.5,5.14,5,0xfff0c0,'e')}
 for(const[x,z]of[[14,5.7],[-14,-5.7],[5.7,-14],[-5.7,14],[38,5.7],[-38,-5.7]])V(x,z,.4,.4,.8,0,0xc03030,'c');
 barrierLine(a,-57.6,-56.6,57.6,-56.6,0);barrierLine(a,-57.6,56.6,57.6,56.6,1);barrierLine(a,-56.6,-57.6,-56.6,57.6,2);barrierLine(a,56.6,-57.6,56.6,57.6,0);
 car(-13,2,0,4.4,0xb23a2e);car(13,-2,0,4.4,0x2f5f9e);car(2,-14,1,4.4,0xd9b13b);car(-2,14,1,4.4,0x3a7a4a);car(-18,-2,0,4.4,0x8a8d93);car(18,2,0,4.6,0xd9d4c4,1);
 return a}}};
/* the zombie map is only for Zombies, and Zombies only plays on it */
function restoreSel(){if(selKeep){Object.assign(sel,selKeep);selKeep=null}fixZM()}
function fixZM(){const z=Object.keys(MAPS).find(k=>MAPS[k].zm);if(sel.mode=='Zombies'){if(!(MAPS[sel.map]&&MAPS[sel.map].zm)&&z)sel.map=(MAPS[sel.zmap]&&MAPS[sel.zmap].zm)?sel.zmap:z;sel.rp=0}else if(MAPS[sel.map]&&MAPS[sel.map].zm)sel.map='Blockfort'}
/* ---------- state ---------- */
var L={p:'AR',s:'MG',pa:['Extended Mag'],sa:[],g:'Frag',pk:['Scavenger']},sel={mode:'Slayer',map:'Blockfort'};
var menuLoadoutSnapshot=null;
var PRE={'Balanced':{p:'AR',s:'MG',pa:['Extended Mag'],sa:[],g:'Frag',pk:['Scavenger','Marathon']},'Rusher':{p:'SMG',s:'MP',pa:['Compensator','Fast Hands','Extended Mag'],sa:['Fast Hands'],g:'Impact',pk:['Marathon','Spring Legs','Overshield']},'Sharpshooter':{p:'BR',s:'MG',pa:['Long Barrel','Laser Sight','Compensator'],sa:['Hollow Point'],g:'Frag',pk:['Overshield','Scavenger']},'Brawler':{p:'SG',s:'MP',pa:['Extended Mag','Fast Hands','Laser Sight'],sa:[],g:'Impact',pk:['Overshield','Marathon','Scavenger']}},PD={Balanced:'Good at everything',Rusher:'Fast and fires quickly',Sharpshooter:'Accurate, hits hard',Brawler:'Shotgun for close fights'};
var LIM={pa:3,sa:2,pk:3};
var cost=()=>1+(L.s?1:0)+L.pa.length+L.sa.length+(L.g?1:0)+L.pk.length;
var desc=w=>`${Math.round(w.d)}${w.pel>1?'×'+w.pel:''} dmg · ${Math.round(60/w.r)} rpm · ${w.m} rounds`;
function chip(a,v,n,t,on){const lk=typeof unlocked=='function'&&!unlocked(v);return`<button class="c ${on?'on':''}${lk?' lk':''}" data-a="${a}" data-v="${v}"><b>${n}</b><i>${lk?'Unlocks at level '+UNL[v]+(prof.tok>0?' · tap to use a token':''):t}</i></button>`}
function ui(){saveSet()}
document.addEventListener('click',e=>{const b=e.target.closest('.c');if(!b)return;if(b.classList.contains('lk')){if(b.dataset.v&&typeof tokenSpend=='function')tokenSpend(b.dataset.v);return}const a=b.dataset.a,v=b.dataset.v;
 if(a==='mode'||a==='map'){
  const f=a==='mode'?'rm':'rp';
  if(v==='?')sel[f]=1;else{sel[a]=v;sel[f]=0;if(a==='mode'&&window.SD_MOD_SESSION)modSelectMode(v)}
  fixZM();saveSet();renderMatchSetup();
  return;
 }
 if(a=='preset'){L=JSON.parse(JSON.stringify(PRE[v]));sanitize();return ui()}
 const o=JSON.stringify(L);
 if(a=='p'){L.p=v;L.pa=L.pa.filter(k=>attachmentFits(v,k))}else if(a=='s'||a=='g'){L[a]=L[a]==v?null:v;if(a=='s'&&!L.s)L.sa=[]}
 else{const r=L[a],i=r.indexOf(v);if(i>=0)r.splice(i,1);else if(r.length<LIM[a])r.push(v)}
 if(cost()>10){L=JSON.parse(o);ui();const points=$('#loadoutPoints');if(points){points.classList.add('bad');points.textContent='10-point limit reached'}return}
 ui()});
function saveSet(){if(!loadedSet)return;try{localStorage.setItem('sd-load',JSON.stringify({L:menuLoadoutSnapshot||L,sel:{...(selKeep||sel),zmap:sel.zmap},aa:$('#aa').value,sn:$('#sn').value,fv:$('#fv').value}))}catch(e){}}
var loadedSet=0;function loadSet(){try{const sv=JSON.parse(localStorage.getItem('sd-load'));if(sv){if(sv.L&&W[sv.L.p]&&Array.isArray(sv.L.pa)&&Array.isArray(sv.L.sa)&&Array.isArray(sv.L.pk))L=sv.L;if(sv.sel){const savedMap=currentMapName(sv.sel.map);if(MAPS[savedMap])sel.map=savedMap;const savedZ=currentMapName(sv.sel.zmap||sv.sel.map);if(savedZ==='The Lockbox')sel.zmap=ROOM_CHALLENGE;else if(['Hollow Estate','London',ROOM_CHALLENGE,JUPITER_MAP].includes(savedZ))sel.zmap=savedZ;if(MODES[sv.sel.mode])sel.mode=sv.sel.mode;sel.rm=sv.sel.rm?1:0;sel.rp=sv.sel.rp?1:0}if(sv.aa!=null)$('#aa').value=sv.aa;if(sv.sn!=null)$('#sn').value=sv.sn;if(sv.fv!=null)$('#fv').value=sv.fv}}catch(e){}
loadedSet=1;try{if(typeof sanitize=='function')sanitize()}catch(e){}ui()}

/* ===================== boomtown.js ===================== */
/* ---------- Boomtown (large): bat-wing layout traced from the reference mini-map; two enterable two-story houses, cars on the central street ---------- */
(()=>{const S1=1.4,N=40,H0=40*S1,CS=2*H0/N;
const PO=[[-29.25,-16.35],[-11.6,-10.1],[-6.4,-13.1],[.75,-15],[8.6,-12.75],[12,-11.6],[29.25,-16.1],[34.9,-7.3],[37.9,2.25],[11.25,9.75],[6.75,8.85],[6.4,15.6],[-4.9,15.75],[-5.25,9.75],[-10.5,7.9],[-11.25,10.5],[-37.5,1.9],[-33.75,-9.75]].map(([x,z])=>[x*S1,z*S1]);
const inside=(x,z)=>{let c=0;for(let i=0,j=PO.length-1;i<PO.length;j=i++){const[a,b]=PO[i],[p,q]=PO[j];if((b>z)!=(q>z)&&x<(p-a)*(z-b)/(q-b)+a)c=!c}return c};
MAPS.Boomtown={d:'Large bat-wing suburb: two 2-story houses, cars on the central street',H:H0,sky:0xe3c9a0,gr:0xb59d6c,bc:0xc2b48f,fb:[[-37.8,-1.4],[43.4,-2.8]],zn:[[-37.8,-1.4],[3,-3],[43.4,-2.8]],inside,open:1,facade:1,
 deco(){const a=[];let s=11;const r=()=>(s=(s*16807)%2147483647)/2147483647,near=(x,z)=>{for(const[dx,dz]of[[0,0],[7,0],[-7,0],[0,7],[0,-7],[5,5],[-5,5],[5,-5],[-5,-5]])if(inside(x+dx,z+dz))return 1;return 0};
  for(let k=0;k<500&&a.length<280;k++){const x=(r()*2-1)*135,z=(r()*2-1)*135;if(near(x,z))continue;if(r()<.4){const w=7+r()*5,d=6+r()*4,h=3.2+r()*1.6;a.push([x,z,w,d,h,0,[0x8a6a45,0x9a7a55,0x7a5a3a][(r()*3)|0]]);a.push([x,z,w+.8,d+.8,h+.6,h,0x5a3a2a])}else{a.push([x,z,.5,.5,3,0,0x6b4a2b]);a.push([x,z,3.4,3.4,6,3,0x5a8a3a])}}
  for(let k=0;k<12;k++){const t=k/12*6.283;a.push([Math.cos(t)*160,Math.sin(t)*160,70,70,16+r()*10,0,0xa08a5a])}return a},
 b(){
 const a=[],bxr=(x0,x1,z0,z1,top,y0,col)=>a.push([(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,top,y0,col]);
 /* wall along x (hz=1) or z (hz=0) with openings [centre,width,bottom,top] */
 const wall=(hz,cx,cz,len,t,y0,y1,ops,col)=>{const c0=(hz?cx:cz)-len/2;let cur=c0;const add=(s,e,lo,hi)=>{if(e-s<.02||hi-lo<.02)return;const c=(s+e)/2,l=e-s;a.push(hz?[c,cz,l,t,hi,lo,col]:[cx,c,t,l,hi,lo,col])};
  for(const[c,w,b,tp]of ops.slice().sort((p,q)=>p[0]-q[0])){const s=(hz?cx:cz)+c-w/2,e=s+w;add(cur,s,y0,y1);add(s,e,y0,b);add(s,e,tp,y1);cur=e}add(cur,c0+len,y0,y1)};
 /* two-story house; s=+1 when the street is on the +x side, -1 when on the -x side */
 const house=(cx,cz,w,d,s,col,roof)=>{const T=.4,hx=w/2,hz=d/2,xi=cx+s*hx,xo=cx-s*hx,L=(h,x,z,len,y0,y1,ops)=>wall(h,x,z,len,T,y0,y1,ops,col);
  L(0,xi,cz,d,0,3.2,[[-5.5,2,1,2.4],[0,1.9,0,2.5],[5.5,2,1,2.4]]);L(0,xi,cz,d,3.5,6.5,[[-5.5,2.2,4.5,6],[0,2.2,4.5,6],[5.5,2.2,4.5,6]]);
  L(0,xo,cz,d,0,3.2,[[-4,1.9,0,2.5],[4.5,2,1,2.4]]);L(0,xo,cz,d,3.5,6.5,[[-4,2.2,4.5,6],[4.5,2.2,4.5,6]]);
  for(const zz of[cz-hz,cz+hz]){L(1,cx,zz,w,0,3.2,[[0,2,1,2.4]]);L(1,cx,zz,w,3.5,6.5,[[0,2.2,4.5,6]])}
  const xs=xo+s*1.6,zs=cz+hz-.7,zn=zs-6.05;for(let i=0;i<11;i++)bxr(xs-1.1,xs+1.1,zn+.55*i,zn+.55*(i+1),(i+1)*.3,0,0x8a6a45);
  const hx0=xs-1.1,hx1=xs+1.1,hz0=zn,hz1=zs+.3,x0=cx-hx,x1=cx+hx,z0=cz-hz,z1=cz+hz,fl=0x9a948a;
  bxr(x0,hx0,z0,z1,3.5,3.2,fl);bxr(hx1,x1,z0,z1,3.5,3.2,fl);bxr(hx0,hx1,z0,hz0,3.5,3.2,fl);bxr(hx0,hx1,hz1,z1,3.5,3.2,fl);
  bxr(x0,x1,z0,z1,6.8,6.5,roof);bxr(cx-1.7,cx+1.7,cz+1.45,cz+2.55,.9,0,0x6b5b4b);bxr(cx-1,cx+1,cz-2.6,cz-1.4,4.4,3.5,0x5a4a3a)};
 /* cars: lower body + dark cabin (vans are one tall box) */
 const car=(x,z,alongZ,len,col,van)=>{const W=1.9,bw=alongZ?W:len,bd=alongZ?len:W;if(van){a.push([x,z,alongZ?2.3:len,alongZ?len:2.3,2.3,0,col]);return}
  a.push([x,z,bw,bd,1,0,col]);a.push([x,z,alongZ?W*.9:len*.5,alongZ?len*.5:W*.9,1.65,1,0x27333c])};
 for(const[x,z,w,d,h]of[[-31.4,-7.75,5.8,4.3,4],[-26.25,3.9,4.1,4,3.5],[-23.45,-13.5,2.9,2.2,3],[21.9,-12.3,3.35,3.9,3.5],[27.55,4.3,1.9,2.35,3]])a.push([x*S1,z*S1,w*S1,d*S1,h]);
 for(const[x,z]of[[-6,-3],[7,-6],[24,0],[-24,-3]])a.push([x*S1,z*S1,2.6,2.6,1]);
 for(const[x,z,az,l,c,v]of[[2.7,-.3,1,7,0xd9d4c4,1],[-2,8.7,1,4.6,0xb23a2e],[-1.1,-12.3,1,4.6,0x2f5f9e],[1.2,19.5,0,4.6,0xd9b13b],[7,-4,0,4.6,0x3a7a4a],[-6,3,0,4.6,0x8a8d93],[5,13,1,4.6,0xb23a2e],[-4,-7,0,4.6,0xd9b13b]])car(x,z,az,l,c,v);
 house(-18.2,-.7,15,17,1,0x9fc49a,0x6b7a62);house(21.3,-.7,15,17,-1,0xd9c97c,0x7a5a4a);
 /* perimeter along the traced outline: cars and bollards just outside the playable cells */
 const ins=(i,j)=>i>=0&&i<N&&j>=0&&j<N&&inside(-H0+(i+.5)*CS,-H0+(j+.5)*CS);let sd=0;
 for(let j=-1;j<N;j++){let s0=-1,e0=0;for(let i=0;i<=N;i++){const e=i<N&&ins(i,j)!=ins(i,j+1)?(ins(i,j)?1:-1):0;if(s0>=0&&e!=e0){const zz=-H0+(j+1)*CS+e0*.9;barrierLine(a,-H0+s0*CS-.6,zz,-H0+i*CS+.6,zz,sd++);s0=-1}if(e&&s0<0){s0=i;e0=e}}}
 for(let i=-1;i<N;i++){let s0=-1,e0=0;for(let j=0;j<=N;j++){const e=j<N&&ins(i,j)!=ins(i+1,j)?(ins(i,j)?1:-1):0;if(s0>=0&&e!=e0){const xx=-H0+(i+1)*CS+e0*.9;barrierLine(a,xx,-H0+s0*CS-.6,xx,-H0+j*CS+.6,sd++);s0=-1}if(e&&s0<0){s0=j;e0=e}}}
 return a}};
try{const sv=JSON.parse(localStorage.getItem('sd-load'));if(sv&&sv.sel&&(sv.sel.map=='Boomtown'||sv.sel.map=='Nuketown')){sel.map='Boomtown';ui()}}catch(e){}})();

/* ===================== engine.js ===================== */
/* ---------- engine ---------- */
var R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.setSize(innerWidth,innerHeight);document.body.prepend(R.domElement);
var S=new THREE.Scene(),C=new THREE.PerspectiveCamera(78,innerWidth/innerHeight,.03,200);C.rotation.order='YXZ';S.add(C);
var hemi=new THREE.HemisphereLight(0xffffff,0x445566,.85);S.add(hemi);var sun=new THREE.DirectionalLight(0xffffff,.7);sun.position.set(30,50,20);S.add(sun);
addEventListener('resize',()=>{
 R.setSize(innerWidth,innerHeight);
 C.aspect=innerWidth/Math.max(1,innerHeight);
 C.updateProjectionMatrix();
});
function splitCameraFov(fov,aspect){
 if(!window.SD_SPLIT||aspect<=2.35)return fov;
 const radians=Math.PI/360;
 return Math.atan(Math.tan(fov*radians)*2.35/aspect)/radians;
}
var sg=new THREE.SphereGeometry(1,12,8),bg=new THREE.BoxGeometry(1,1,1);
const FP_REST={x:.185,y:-.169,z:-.608};
var gun=new THREE.Group(),gf=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:0xffdd66}));
gf.scale.set(.06,.06,.12);gun.add(gf);C.add(gun);
var sdGameRuntime;
var bobP=0,landD=0,cRoll=0,wasOn=1,selKeep=null,relT=0,mapG,bx=[],H=30,bots=[],fx=[],grs=[],wp=[],cur=0,rel=0,nf=0,P={},yaw=0,pitch=0,kick=0,fr=1,AA=1,sens=1,run=0,paused=0,over=0,mode,t0=0,kills=0,deaths=0,shots=0,hits=0,wave=0,tl=90,gc=0,dmA=0,hmT=0,lastHit=0,tg=null;
var key={},CONE=.06;var trig=0,fresh=0;
const arenaSoundCaptions=PlayerAudio.captions($('#sound-captions'));
function arenaSoundCaption(label,x,z){
 if(!PlayerAudio.captionsOn||!run||paused||over||!P||P.dead)return;
 const dx=x-P.x,dz=z-P.z;
 const angle=Math.atan2(dx*Math.cos(yaw)-dz*Math.sin(yaw),-dx*Math.sin(yaw)-dz*Math.cos(yaw));
 arenaSoundCaptions.show(label,angle);
}
var ac;function beep(f,d,ty,v){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,ac.currentTime);o.frequency.exponentialRampToValueAtTime(f/2,ac.currentTime+d);g.gain.setValueAtTime((v||.05)*vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(g).connect(PlayerAudio.output(ac));o.start();o.stop(ac.currentTime+d)}catch(e){}}
function eff(k,at){const w={...W[k],ad:1};for(const a of at)if(attachmentFits(k,a))for(const p in A[a])if(p!='t')w[p]*=A[a][p];w.m=Math.round(w.m);w.k=k;return w}
/* head and body hit spheres [headPos, bodyPos, headRadius, bodyRadius] that follow the stance of other players (crouch, slide, prone, dive) and the height they are really at */
function hitPts(b){if(b.isKey)return jupiterKeyHitPoints(b);if(b.practice)return[V(b.x,1.72,b.z),V(b.x,1.02,b.z),.18,.39];if(b.zquestBoss)return zQuestHitPoints(b);if(b.vaultPose)return lockboxVaultHitPts(b);const pc=b.pc||0,psl=b.psl||0,pp=b.pp||0,y=b.y||0,ry=b.ry==null?0:b.ry,fx=Math.sin(ry),fz=Math.cos(ry),sc=b.big?1.35:1;/* brutes are modelled 1.35x larger, so their head sits higher and their body is wider */
 const sh=(1-pp),hy=y+((1.75-.34*pc-.62*psl)*sh+.34*pp)*sc,by=y+((.95-.26*pc-.42*psl)*sh+.26*pp)*sc,hf=.8*pp*sc;
 return[V(b.x+fx*hf,hy,b.z+fz*hf),V(b.x,by,b.z),.3*sc,(.65-.3*pp-.08*pc)*sc]}
function buildMap(){sdGameRuntime?.clearWorld();if(mapG){S.remove(mapG);if(typeof gfxDispose=='function')gfxDispose(mapG)}const M=MAPS[sel.map];H=M.H;mapG=new THREE.Group();S.add(mapG);S.background=new THREE.Color(M.sky);S.fog=new THREE.Fog(M.sky,M.fogN??30,M.fogF||(M.open?170:110));bx=[];
 M._v=[];const list=M.b();for(const [x,z,w,d,h,y0=0,,_k] of list)bx.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h,y0,pl:_k=='n'?1:0});
 gfxMap(M,list);if(M.post)M.post(mapG)}
/* Keep movement candidates in map order, and prune long rays with a hierarchy of bounds. */
const collisionCellSize=4,collisionPadding=.5,collisionRowStride=65536,emptyCollisionCell=[];
let indexedBoxes=null,collisionCells,collisionTree,collisionRevision=0,discardedCollisions=0;
function collisionKey(x,z){return Math.floor(z/collisionCellSize)*collisionRowStride+Math.floor(x/collisionCellSize)}
function indexCollisions(){
 if(indexedBoxes===bx)return;
 indexedBoxes=bx;collisionCells=new Map();collisionRevision++;discardedCollisions=0;
 for(let i=0;i<bx.length;i++){
  const b=bx[i],x0=Math.floor((b.x0-collisionPadding)/collisionCellSize),x1=Math.floor((b.x1+collisionPadding)/collisionCellSize),
   z0=Math.floor((b.z0-collisionPadding)/collisionCellSize),z1=Math.floor((b.z1+collisionPadding)/collisionCellSize);
  b.collisionOrder=i;
  for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){
   const key=z*collisionRowStride+x,cell=collisionCells.get(key);
   if(cell)cell.push(b);else collisionCells.set(key,[b]);
  }
 }
 const solid=bx.filter(b=>!b.pl);
 collisionTree=solid.length?collisionBranch(solid):null;
}
function removeCollisionBoxes(removed){
 const previous=bx;
 bx=bx.filter(b=>!removed.has(b));
 if(indexedBoxes!==previous)return;
 // Reuse stable cell order and ray bounds until enough geometry is gone to compact them.
 discardedCollisions+=removed.size;
 if(discardedCollisions*4>=bx.length)return;
 for(const b of removed)b.collisionRemoved=true;
 indexedBoxes=bx;collisionRevision++;
}
function collisionBranch(boxes){
 const node={x0:Infinity,x1:-Infinity,z0:Infinity,z1:-Infinity,y0:Infinity,h:-Infinity};
 for(const b of boxes){
  node.x0=Math.min(node.x0,b.x0);node.x1=Math.max(node.x1,b.x1);
  node.z0=Math.min(node.z0,b.z0);node.z1=Math.max(node.z1,b.z1);
  node.y0=Math.min(node.y0,b.y0||0);node.h=Math.max(node.h,b.h);
 }
 if(boxes.length<=8){node.boxes=boxes;return node}
 const splitX=node.x1-node.x0>=node.z1-node.z0;
 boxes.sort(splitX?(a,b)=>a.x0+a.x1-b.x0-b.x1:(a,b)=>a.z0+a.z1-b.z0-b.z1);
 const mid=boxes.length>>1;
 node.left=collisionBranch(boxes.slice(0,mid));node.right=collisionBranch(boxes.slice(mid));
 return node;
}
function mv(o,dx,dz,r){
 const arena=mode==='Zombies'&&zq?.main?.fight&&zQuestInArena(o.x,o.z);
 o.x+=dx;o.z+=dz;
 indexCollisions();
 let key=collisionKey(o.x,o.z),cell=collisionCells.get(key)||emptyCollisionCell,last=-1;
 const y=o.y||0,wide=r>collisionPadding;
 for(let i=0;i<(wide?bx.length:cell.length);i++){
  const b=wide?bx[i]:cell[i],n=b.collisionOrder;
  if(b.collisionRemoved||n<=last||y>=b.h-.31||y+1.8<=(b.y0||0))continue;
  const left=o.x-(b.x0-r),right=b.x1+r-o.x,back=o.z-(b.z0-r),front=b.z1+r-o.z;
  if(left<=0||right<=0||back<=0||front<=0)continue;
  const nearest=Math.min(left,right,back,front);
  if(nearest===left)o.x=b.x0-r;else if(nearest===right)o.x=b.x1+r;
  else if(nearest===back)o.z=b.z0-r;else o.z=b.z1+r;
  const nextKey=collisionKey(o.x,o.z);
  if(!wide&&nextKey!==key){key=nextKey;cell=collisionCells.get(key)||emptyCollisionCell;last=n;i=-1}
 }
 if(arena){
  o.x=cl(o.x,ZMAIN_ARENA_X-ZMAIN_EDGE+r,ZMAIN_ARENA_X+ZMAIN_EDGE-r);
  o.z=cl(o.z,-ZMAIN_EDGE+r,ZMAIN_EDGE-r);return;
 }
 o.x=cl(o.x,-H+r,H-r);o.z=cl(o.z,-H+r,H-r);
 const room=o===P&&MAPS[sel.map].playerRoom;
 if(room){o.x=cl(o.x,-room+r,room-r);o.z=cl(o.z,-room+r,room-r)}}
function gnd(o,maxHeight=Infinity){
 indexCollisions();
 let g=MAPS[sel.map].groundHeight?.(o.x,o.z)??0;
 for(const b of collisionCells.get(collisionKey(o.x,o.z))||emptyCollisionCell){
  if(b.collisionRemoved)continue;
  if(b.h>g&&b.h<=maxHeight&&b.h<=o.y+.31&&o.x>b.x0-.3&&o.x<b.x1+.3&&o.z>b.z0-.3&&o.z<b.z1+.3)g=b.h;
 }
 return g;
}
function rb(o,d,b){let t0=0,t1=1e9,a,c,e;e=d.x;if(Math.abs(e)<1e-8){if(o.x<b.x0||o.x>b.x1)return 1e9}else{a=(b.x0-o.x)/e;c=(b.x1-o.x)/e;if(a>c){e=a;a=c;c=e}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return 1e9}
 e=d.y;if(Math.abs(e)<1e-8){if(o.y<(b.y0||0)||o.y>b.h)return 1e9}else{a=((b.y0||0)-o.y)/e;c=(b.h-o.y)/e;if(a>c){e=a;a=c;c=e}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return 1e9}
 e=d.z;if(Math.abs(e)<1e-8){if(o.z<b.z0||o.z>b.z1)return 1e9}else{a=(b.z0-o.z)/e;c=(b.z1-o.z)/e;if(a>c){e=a;a=c;c=e}if(a>t0)t0=a;if(c<t1)t1=c;if(t0>t1)return 1e9}return t0}
function castBranch(node,o,d,t){
 if(rb(o,d,node)>=t)return t;
 if(node.boxes){for(const b of node.boxes)if(!b.collisionRemoved)t=Math.min(t,rb(o,d,b));return t}
 t=castBranch(node.left,o,d,t);
 return castBranch(node.right,o,d,t);
}
function castW(o,d,max){const map=MAPS[sel.map];let t=map.groundRay?map.groundRay(o,d,max):d.y<0?Math.min(max,-o.y/d.y):max;indexCollisions();if(collisionTree)t=castBranch(collisionTree,o,d,t);return map.boardRay?map.boardRay(o,d,t):t}
function rs(o,d,c,r){const x=o.x-c.x,y=o.y-c.y,z=o.z-c.z,b=x*d.x+y*d.y+z*d.z,D=b*b-(x*x+y*y+z*z-r*r);if(D<0)return 1e9;const t=-b-Math.sqrt(D);return t>0?t:1e9}
var aimDir=()=>{const p=pitch+kick;return V(-Math.sin(yaw)*Math.cos(p),Math.sin(p),-Math.cos(yaw)*Math.cos(p))};
function findT(){const o=C.position,d=aimDir();let best=null,ba=9;if(AA<=0)return null;for(const b of bots){if(!b.al||ally(b))continue;const v=V(b.x-o.x,(b.y||0)+(b.big?1.5:1.1)-o.y,b.z-o.z),D=v.length();if(D>55)continue;v.divideScalar(D);const a=Math.acos(Math.min(1,v.dot(d))),cone=CONE*AA*(1-D/75);if(a<cone&&a<ba&&castW(o,v,D)>=D-.9){ba=a;best={b,v,a,cone}}}return best}
function tr(o,d,len,col,life,raw){const g=new THREE.BufferGeometry().setFromPoints([raw?o.clone():o.clone().add(d.clone().multiplyScalar(.6)).add(V(0,-.12,0)),o.clone().add(d.clone().multiplyScalar(len))]);const m=new THREE.Line(g,new THREE.LineBasicMaterial({color:col}));S.add(m);fx.push({m,l:life||.06,line:1})}

/* ===================== bots.js ===================== */
/* ---------- bots ---------- */
var botId=0;
function addBot(hp,df,operator,puppet=false){
 const i=botId++,m=new THREE.Group();
 const rig=mkHuman(m,{operator:operator??botOperator(i)});S.add(m);
 const b={i,m,rig,x:0,z:0,y:0,hp:50,mhp:50,sh:50,msh:50,lh:-9,al:0,cd:1,off:1,ot:0,rt:0,df,team:'e',k:0,nm:'Grunt'};
 bots.push(b);if(!puppet){spawn(b);setHeld(b,BOTGUNS[Math.random()*BOTGUNS.length|0])}return b
}
function spawn(b){b.fall=null;if(typeof ragReset=='function')ragReset(b);b.m.rotation.x=0;[b.x,b.z]=spawnPt(18,b.team,b);b.y=gnd({x:b.x,y:0,z:b.z});b.m.position.set(b.x,b.y,b.z);b.hp=b.mhp;b.sh=b.msh;b.lh=-9;b.al=1;b.cd=1+Math.random();b.m.visible=true;sdGameRuntime?.botSpawn(b)}
function takeDmg(b,d,source=P){if(sdGameRuntime){d=sdGameRuntime.damage(b,d,source,source===P?srcK||null:source?.wk??null);if(d<=0)return}b.lh=t0;if(b.sh>0){const a=Math.min(b.sh,d);b.sh-=a;d-=a}b.hp-=d}
function hitBot(b,d,head){if(b.practice)return practiceHit(b,d,head);takeDmg(b,d);hits++;juiceHit(b,d,head);if(b.net){netSend(b.hb?{t:'bh',i:b.i,d,head:!!head}:{t:'hit',to:b.id,d,head:!!head});return}$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(b.hp<=0){b.al=0;b.dc=(b.dc||0)+1;bodyFall(b);b.rt=2.5;kills++;ts[pTeam()]=(ts[pTeam()]||0)+1;announce(b,P,head);juiceKill(b,head);featKill(b,head);if(L.pk.includes('Scavenger')){for(const w of wp)w.res=Math.min(w.res+Math.ceil(w.m*.4),w.m*(w.rs==null?4:w.rs))}}}
function hurt(d,b){if(mode==='Zombies'&&jupiterProtected(zMe()))return;if(P.sp>t0)d*=.15;if(P.dead)return;if(sdGameRuntime){d=sdGameRuntime.damagePlayer(d,b);if(d<=0)return}lastBot=b||null;if(b)dirInd(b);lastHit=t0;dmA=.6;shake=Math.max(shake,.3);if(P.sh>0){const a=Math.min(P.sh,d);P.sh-=a;d-=a}P.hp-=d;beep(120,.1,'sawtooth',.06);if(P.hp<=0)die()}
function die(){P.dead=1;deaths++;ks=0;q.length=0;if(mode!='Zombies')startDeath();const by=lastAtk||(lastBot&&!lastBot.net?'b'+lastBot.i:'');botScoreOnMe();if(netOn){if(isHost&&mode!='Private'&&lastAtk)credit(lastAtk);netSend({t:'dead',v:myId,by,head:lastAttackHead})}lastAtk='';P.rt=2.5;if(mode=='Survival'&&!netOn)setTimeout(()=>endGame('You were eliminated'),2600);if(mode=='Zombies')zDown();sdGameRuntime?.playerDeath()}
function respawn(){endDeath();ctlReset(true);const[x,z]=practiceSession?practiceMap.ps:spawnPt(20,pTeam(),P);P.x=x;P.z=z;P.y=gnd({x,y:0,z});P.on=1;P.vy=P.mx=P.mz=P.wvx=P.wvz=P.jb=P.coy=P.jh=P.jv=P.wj=P.wcd=P.mcd=P.spr=P.sprG=0;P.mt=null;P.hp=P.mhp;P.dead=0;applyNextLifeLoadout();P.sh=P.msh;for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}rel=0;sdGameRuntime?.playerSpawn()}

/* ===================== weapons.js ===================== */
/* ---------- weapons ---------- */
var cw=()=>wp[cur];
var setGun;
/* hits inside shoot() are isolated: an exception in the kill chain can no longer cancel the rest of the shot */
function safeHit(){try{return hitBot.apply(null,arguments)}catch(e){console.error('hit error',e)}}
function keyshooterVolleyRays(origin,dir,tier=0){
 const count=3+2*cl(tier|0,0,3),half=(count-1)/2;
 const right=V(-dir.z,0,dir.x).normalize();
 return Array.from({length:count},(_,i)=>{
  const column=i-half,shift=right.clone().multiplyScalar(column),delta=shift.clone().multiplyScalar(.037);
  const ray=dir.clone().add(delta).normalize();
  const room=column===0?.26:castW(origin,shift.clone().normalize(),.26*Math.abs(column));
  const o=origin.clone().addScaledVector(right,Math.sign(column)*Math.max(0,room-.014));
  return {o,ray,wall:castW(o,ray,75),column,right};
 });
}

function fireKeyshooter(w,origin,dir,muzzle){
 const rays=keyshooterVolleyRays(origin,dir,w.pap),hits=new Map();
 sdGameRuntime?.keyVolley(rays,w);
 if(mode==='Zombies')jupiterQuestVolley(origin,dir,rays);
 for(const {o,ray,wall,column,right} of rays){
  const impacts=[];
  for(const b of bots){
   if(!b.al||ally(b))continue;
   const [head,body,hr,br]=hitPts(b),h=rs(o,ray,head,hr),t=rs(o,ray,body,br);
   if(Math.min(h,t)<wall)impacts.push({b,dist:Math.min(h,t),head:h<t});
  }
  impacts.sort((a,b)=>a.dist-b.dist);
  for(const {b,head} of impacts.slice(0,2)){
   const hit=hits.get(b)||{damage:0,head:false};
   hit.damage+=w.d*zmul(w)*.62*(head?1.65:1);hit.head||=head;
   hits.set(b,hit);
  }
  const start=muzzle.clone().addScaledVector(right,column*.049);
  const end=o.clone().addScaledVector(ray,Math.max(.4,Math.min(wall,impacts[1]?.dist??wall)));
  const travel=end.sub(start),length=travel.length();
  if(length>.1&&travel.dot(ray)>0)jupiterKeyShot(start,travel.normalize(),length,column===0);
 }
 for(const [b,hit] of hits)safeHit(b,Math.min(4200,hit.damage),hit.head);
 if(netOn){
  const center=rays[rays.length>>1];
  netShot('KEY',origin,dir,center.wall);
 }
}

function jupiterRemoteVolley(origin,dir,distance,tier){
 const count=3+2*cl(tier|0,0,3),half=(count-1)/2,right=V(-dir.z,0,dir.x).normalize();
 for(let column=-half;column<=half;column++){
  const start=origin.clone().addScaledVector(right,column*.049),bolt=dir.clone().addScaledVector(right,column*.037).normalize();
  jupiterKeyShot(start,bolt,distance,column===0);
 }
}

function shoot(){const w=cw();src=W[w.k].n;srcK=w.k;w.mag--;shots++;nf=t0+w.r*zfr();gunSnd(w);/* the shot is heard first, whatever happens to the hit afterwards */const o=(typeof vrOrg=='function'&&vrOrg())||C.position.clone(),base=aimDir();let d0=base;const T=findT();
 if(T)d0=base.clone().lerp(T.v,Math.min(.7,.55*AA*(1-T.a/T.cone*.5))).normalize();
 const hand=w.dual&&typeof dsShot==='function'?dsShot(w):0;
 const muzzle=weaponMuzzleWorld(fpG,hand);
 gf.position.copy(gun.worldToLocal(muzzle.clone()));muz.color.copy(gf.material.color);

 const mvg=((key.KeyW||key.KeyA||key.KeyS||key.KeyD||ST.auto)?1.6:1)*(1-.65*ST.ads)*(ST.mount?.5:1)*(ST.steady>0?.6:1)*(ST.crouch?.8:1)*(ST.prone?.65:1);
 const tea=w.k==='TEA',keyshot=w.k==='KEY',ultima=w.k==='ULT',limit=tea&&mode!=='Zombies'?38:120,voxelHits=voxelActive()?new Map():null;
 const pierce=mode==='Zombies'?zq?.perks.line&&w.k!=='SN'&&!tea:tea;
 if(keyshot){fpG.userData.keyPulse=t0;fireKeyshooter(w,o,d0,muzzle)}
 else for(let i=0;i<w.pel;i++){const d=d0.clone().add(V(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(2*w.sp*mvg)).normalize();const wall=castW(o,d,limit),vehicle=sdGameRuntime?.vehicleRay(o,d,wall);let tw=vehicle?.distance??wall,bt=1e9,bb=null,hd=0;
  let second=null,secondDist=tw;const through=ultima?[]:null;
  for(const b of bots){if(!b.al||ally(b))continue;const hp_=hitPts(b),th=rs(o,d,hp_[0],hp_[2]),tb=rs(o,d,hp_[1],hp_[3]),t=Math.min(th,tb);
   if(through&&t<tw)through.push({b,t,head:th<tb});
   if(t<bt){
    if(pierce&&bt<secondDist){second=bb;secondDist=bt}
    bt=t;bb=b;hd=th<tb;
   }else if(pierce&&t<secondDist){second=b;secondDist=t}
  }
  if(through){
   const count=4;
   through.sort((a,b)=>a.t-b.t);
   for(const hit of through.slice(0,count))safeHit(hit.b,Math.min(4200,w.d*zmul(w)*(hit.head?2:1)),hit.head);
   if(through.length>=count)tw=through[count-1].t;
  }else if(w.k=='SN'){let any=0;for(const b of bots.slice()){if(!b.al||ally(b))continue;const hp_=hitPts(b),th=rs(o,d,hp_[0],hp_[2]),tb=rs(o,d,hp_[1],hp_[3]),t=Math.min(th,tb);if(t<tw){any=1;safeHit(b,w.d*zmul(w)*(th<tb?2:1)*falloff(w,t),th<tb)}}if(!any&&tw<119&&i<2)burst(o.clone().add(d.clone().multiplyScalar(tw-.05)),4,0xffd27a,3,.35,.06)}
  else if(bb&&bt<tw){
   const damage=w.d*zmul(w);
   tw=second?secondDist:bt;
   safeHit(bb,damage*(hd&&w.k!='RG'?2:1)*falloff(w,bt),hd);
   if(second)safeHit(second,damage*falloff(w,secondDist),false,.4);
  }else if(tw<119&&i<2)burst(o.clone().add(d.clone().multiplyScalar(tw-.05)),4,0xffd27a,3,.35,.06);
  if(vehicle&&tw>=vehicle.distance-.001)sdGameRuntime.vehicleHit(vehicle.id,w.d*zmul(w),P);
  if(voxelHits&&tw>=wall-.002&&wall<limit){
   const cell=voxelRay(o,d,wall);
   if(cell)voxelHits.set(cell.i,(voxelHits.get(cell.i)||0)+1);
  }
  const hitRange=Math.min(tw,limit);
  if(i===0&&netOn&&(w.k!=='TEA'||teaNet()))netShot(w.k,o,d,tea?wall:hitRange,hand);
  if(w.ex)boom(o.clone().addScaledVector(d,Math.max(0,hitRange-.3)),w.ex);
  if(w.k==='TEA'){
   teaBeam(o,d,wall);
   if(mode==='Zombies'){zQuestSteam(o,d,wall);teaPierce(o,d,wall,w,hitRange)}
  }else if(i===0||w.pel>1&&i<3){
   const range=w.k==='RG'?hitRange:Math.min(hitRange,w.pw?150:80);
   const travel=o.clone().addScaledVector(d,range).sub(muzzle),distance=travel.length();
   if(distance>.025&&travel.dot(d)>0){
    travel.divideScalar(distance);
    if(w.k==='RG')rgBeam(muzzle,travel,distance,true);
    else tr(muzzle,travel,distance,w.ex?0xff8040:passTracer()||0xfff0a0,undefined,true);
   }
  }
 }
 if(fpG.userData.rotors)fpG.userData.rotors[0].rotation.z+=keyshot?1.17:.67;
 voxelShot(voxelHits,w);
 kick+=w.rc*.0036*(1-.4*ST.ads)*(ST.mount?.4:1);gf.visible=true;muzzleFlashUntil=t0+.035;shake=Math.max(shake,w.rc*.011);flashL=1;fk=Math.max(fk,Math.min(.48,.12+w.rc*.042));if(w.mag<=0)startRel()}
let reloadPlan=null;
function cancelReload(){rel=0;reloadPlan=null}
function startRel(){
 const w=cw();
 if(!w||P.dead||rel>0||w.mag>=w.m||w.res<=0)return;
 const count=Math.min(w.m-w.mag,w.res);
 const kind=RLK[w.k]||'mag',steps=kind==='shell'?Math.min(count,w.k==='SG'?6:12):1;
 reloadPlan={weapon:w,kind,count,steps,loaded:0};
 rel=relT=w.rl*zrl();
}
function tickReload(dt,interrupt){
 const w=cw(),plan=reloadPlan;
 if(!plan||plan.weapon!==w||(interrupt&&w.mag>0)){cancelReload();return}
 rel=Math.max(0,rel-dt);
 const progress=1-rel/relT;
 // Magazine, round, and rocket reloads commit when the replacement is seated.
 const seat=w.k==='AN'?.84:plan.kind==='round'||plan.kind==='rocket'?.8:.91;
 const cycle=(shellLoadEnd-shellLoadStart)/plan.steps;
 const seated=plan.kind==='shell'
  ?cl(Math.floor((progress-shellLoadStart)/cycle+1-shellSeat),0,plan.steps)
  :Number(progress>=seat);
 const total=Math.floor(plan.count*seated/plan.steps);
 const amount=Math.max(0,Math.min(total-plan.loaded,w.m-w.mag,w.res));
 w.mag+=amount;w.res-=amount;plan.loaded+=amount;
 if(rel===0)reloadPlan=null;
}
function swap(i){if(i<0||i>=wp.length||i==cur)return;cur=i;cancelReload();setGun()}
function boom(p,g){if(g.w=='TEA'&&mode=='Zombies'&&!g.zs)g=Object.assign({},g,{d:g.d*7.8,zs:1});if(g.smoke)return smokeBurst(p);if(g.tac)return flashBoom(p);voxelExplosion(p,g);if(g.w){src=W[g.w].n;srcK=g.w}else{src='Explosive';srcK=''}if(g.w=='TEA'){beep(260,.3,'sine',.09);noise(.3,900,.35);burst(p,12,0xd9953f,5,.6,.1);if(typeof teaScald=='function')teaScald(p,g.R);shake=Math.max(shake,Math.min(.45,6/(1+p.distanceTo(C.position))));flashL=Math.max(flashL||0,.5)}else if(g.w=='RG'){if(typeof rgPop=='function')rgPop(1);else{beep(170,.26,'sawtooth',.09);noise(.3,700,.34)}burst(p,22,0xff2a14,7,.7,.12);burst(p,8,0xffe6d0,10,.4,.07);shake=Math.max(shake,Math.min(.55,7/(1+p.distanceTo(C.position))));flashL=Math.max(flashL||0,.7)}else{const m=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:g.c||0xffa040,transparent:true,opacity:.6}));m.position.copy(p);m.scale.setScalar(.5);S.add(m);fx.push({m,l:.35,grow:g.R*3,sph:1});beep(70,.4,'sawtooth',.12);noise(.5,900,.6);burst(p,40,g.c||0xffa040,9,.7,.18);shake=Math.max(shake,Math.min(1.2,14/(1+p.distanceTo(C.position))));flashL=2}
 sdGameRuntime?.vehicleBlast(p,g);
 for(const b of bots){if(!b.al||ally(b))continue;const D=Math.hypot(b.x-p.x,(b.y||0)+1-p.y,b.z-p.z);if(D<g.R)hitBot(b,g.d*(1-D/g.R),0)}
 const D=Math.hypot(P.x-p.x,P.y+1-p.y,P.z-p.z);if(D<g.R*.8&&!g.own)hurt(g.d*.4*(1-D/g.R))}
function throwG(){return typeof eqUse=='function'?eqUse(0):throwG0()}
function throwG0(){const lg=LG();if(!lg||gc<=0||P.dead)return;if(lg=='Claymore'){clayPlace();return}gc--;const d=aimDir(),m=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:lg=='Frag'?0x4a7a3a:lg=='Semtex'?0xd8661c:lg=='Smoke'?0x8a8f96:0x62e0f0}));m.scale.setScalar(.13);if(lg=='Semtex'){const led=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:0xff2200}));led.scale.setScalar(.35);led.position.y=.9;m.add(led);m.userData.led=led;beep(900,.08,'square',.05)}S.add(m);grs.push({m,p:C.position.clone(),v:d.multiplyScalar(15).add(V(0,3,0)),t:GR[lg].fuse,g:GR[lg],bt:0,spin:Math.random()*6})}

/* ===================== game.js ===================== */
/* ---------- game flow ---------- */
function equipLifeWeapons(){
 const loadout=practiceSession?.training?{p:'AR',s:'MG',pa:[],sa:[]}:L;
 const dual=loadout.p==='SMG'&&loadout.pa.includes('Dual Wield'),primary=dual?'DS':loadout.p;
 const primaryAttachments=dual?loadout.pa.filter(item=>item!=='Dual Wield'):loadout.pa;
 wp=[eff(primary,passAttachments(loadout.p,primaryAttachments))];
 if(loadout.s)wp.push(eff(loadout.s,passAttachments(loadout.s,loadout.sa)));
 for(const weapon of wp){weapon.mag=weapon.m;weapon.res=weapon.m*(weapon.rs??4)}
 cur=0;cancelReload();gc=LG()?2:0;setGun();
}
function startGame(){sdGameRuntime?.begin();resetLifeLoadouts();arenaSoundCaptions.clear();if(!practiceSession)fixZM();buildMap();ctlReset();for(const b of bots)S.remove(b.m);bots=[];for(const f of fx)S.remove(f.m);fx=[];for(const g of grs)S.remove(g.m);grs=[];
 sanitize();fovBase=+$('#fv').value||80;AA=+$('#aa').value;sens=+$('#sn').value;mode=practiceSession?practiceName:sel.mode;if(!netOn)myTeam='A';kills=deaths=shots=hits=wave=0;tl=window.SD_MOD_SESSION?(modRules?.timeSeconds??90):90;t0=0;nf=0;trig=0;fresh=0;hmT=0;dmA=0;lastHit=-9;
 BHS.hot.length=0;
 P={x:0,y:0,z:0,vy:0,hp:50,mhp:50,sh:50,msh:50+(PK('Overshield')?50:0),dead:0,on:1};P.sh=P.msh;
 equipLifeWeapons();
 const[x,z]=(practiceSession||mode=='Zombies')&&MAPS[sel.map].ps?MAPS[sel.map].ps:spawnPt(0,pTeam(),P);P.x=x;P.z=z;P.y=gnd({x,y:0,z});yaw=pitch=kick=0;
 setupBots();zStart();
 if(window.SD_MOD_SESSION)modInitializePlayer();
 $('#menu').style.display=$('#end').style.display='none';$('#hud').style.display='block';over=0;paused=0;run=1;juiceReset();featReset();endDeath();gun.visible=true;if(typeof finStop=='function')finStop();lockPtr()}
function modeTick(dt){if(practiceSession)return practiceTick(dt);if(mode=='Private')return privTick();if(netOn&&!isHost){setObjectiveText(obText);if(mode=='Zombies')zcTick(dt);if(mode=='Kill Confirmed')kcTick(dt);return}
 if(window.SD_MOD_SESSION){if(modTimeTick())return;if(modRules.objectives)return modObjectiveTick(dt)}
 if(mode=='Zombies')return zomTick(dt);
 if(mode=='One in the Chamber')return oiTick(dt);
 if(mode=='Slayer'||teamMode())return pvpTick(dt);
 if(mode=='Time Attack'){tl-=dt;const l=leader();setObjectiveText(`Time ${Math.max(0,Math.ceil(tl))}s  ·  ${netOn?'Leader '+l.nm+' '+l.k:'Kills '+kills}`);if(tl<=0)endGame(l.me?'Victory':netOn?l.nm+' wins':'Defeat')}
 else{const live=bots.filter(b=>b.al&&!b.net).length;setObjectiveText(`Wave ${wave}  ·  Kills ${kills}  ·  Enemies ${live}`);if(netOn&&P.dead&&!bots.some(b=>b.net&&b.al))return endGame('You were eliminated');
  if(!live&&!sdGameRuntime?.managedBots()){if(window.SD_MOD_SESSION&&wave>0&&wave>=modRules.waveLimit)return endGame('Victory');bots=bots.filter(b=>{if(b.net)return true;S.remove(b.m);return false});wave++;const n=Math.min(12,2+wave*2);for(let i=0;i<n;i++)addBot(50+wave*6,1+wave*.07);msg('Wave '+wave,2.5);gc=Math.min(gc+1,3)}}}
/* Zombies has its own fixed equipment: the Multiplayer loadout (perks, grenade, melee, attachments) never leaks into it */
var PK=n=>mode!='Zombies'&&L.pk.includes(n),LG=()=>mode=='Zombies'?(L.g||'Frag'):L.g,zomOn=()=>!!run&&mode=='Zombies';var sprF=0;
var rng=()=>PK('Run & Gun')||(mode=='Zombies'&&zq&&!!zq.perks.stam);
const viewMotion={pace:0,side:0,drive:0,air:0,landAge:1,landForce:0};
let muzzleFlashUntil=-1;
function resetViewMotion(){
 Object.assign(viewMotion,{pace:0,side:0,drive:0,air:0,landAge:1,landForce:0,player:null});
 bobP=0;landD=0;cRoll=0;wasOn=1;sprF=0;muzzleFlashUntil=-1;
}
function updateViewMotion(dt,sprint){
 const m=viewMotion,ads=ST.ads||0,velocityX=P.mx||0,velocityZ=P.mz||0;
 const x0=P.x||0,z0=P.z||0;
 const moved=m.player===P?Math.hypot(x0-m.x,z0-m.z)/Math.max(dt,.001):0;
 m.player=P;m.x=x0;m.z=z0;
 const speed=Math.min(Math.hypot(velocityX,velocityZ),moved);
 const ground=P.on&&!P.swimming&&!ST.slide&&!ST.dive;
 const pace=P.dead?0:cl(speed/6,0,1),blend=1-Math.exp(-11*dt);
 const c=Math.cos(yaw),s=Math.sin(yaw);
 m.pace+=((ground?pace:0)-m.pace)*blend;
 m.side+=((P.dead?0:cl((velocityX*c-velocityZ*s)/7,-1,1))-m.side)*blend;
 m.drive+=((P.dead?0:cl((-velocityX*s-velocityZ*c)/7,-1,1))-m.drive)*blend;
 m.air+=((ground||P.swimming?0:cl((P.vy||0)/7,-1,1))-m.air)*(1-Math.exp(-13*dt));
 if(ground)bobP=(bobP+speed*dt*(1.85-.28*sprint))%(Math.PI*2);
 if(ground&&!wasOn){
  const falling=cl(-(P.lvy||0),0,15);
  if(falling>1.8){m.landAge=0;m.landForce=cl(falling/9,.16,1.4);feelLand(falling)}
 }
 wasOn=ground;
 m.landAge+=dt;
 const shock=m.landAge/.065,release=m.landAge/.16;
 landD=m.landForce*(.096*shock*Math.exp(1-shock)-.018*release*release*Math.exp(2-release*2));
 const step=Math.cos(bobP*2),shift=Math.sin(bobP),stride=m.pace;
 cRoll+=(-m.side*.023*(1-.78*ads)-cRoll)*blend;
 if(P.dead){if(mode==='Zombies')zDownCam(dt);else deathCam(dt)}
 else{
  const rise=(step*.008+Math.cos(bobP*4)*.002)*stride*(1+sprint*.58)*(1-ads*.69);
  const rock=shift*stride*.0035*(1-ads*.82);
  C.position.set(P.x+rock*c,P.y+ST.eye+(rise-landD)*shk,P.z-rock*s);
  C.rotation.set(pitch+kick,yaw,(cRoll-shift*stride*.004*(1-ads*.85)+(P.swimming?Math.sin(t0*4)*.017:0))*shk);
 }
 const hip=1-ads,travel=stride*hip,moving=shift*travel,handStep=step*travel;
 const x=FP_REST.x*hip+ST.ax*ads-rlX()-sprint*.076+.015*moving-.023*m.side*hip;
 const y=FP_REST.y*hip+ST.ay*ads+.015*handStep-sprint*.079+rlY()+bashY()+.027*m.air*hip-landD*.33;
 const z=FP_REST.z*hip+ST.az*ads+sprint*(.074+.020*step)-.016*m.drive*hip+bashZ();
 const arms=1-Math.exp(-dt*(sprint>.2?14:19));
 gun.position.x+=(x-gun.position.x)*arms;
 gun.position.y+=(y-gun.position.y)*arms;
 gun.position.z+=(z-gun.position.z)*arms;
 gun.rotation.x=rlRot()+bashRot()-sprint*(.54+.063*step)+.034*handStep+.060*m.air*hip-landD*.70;
 gf.visible=t0<muzzleFlashUntil;
 return [moving,handStep];
}
function upd(dt){t0+=dt;sdGameRuntime?.tick(dt);if(!run)return;if(jupiterIntroActive()){jupiterIntroTick(dt);return}ctlTick(dt);
 if(P.dead){P.rt-=dt;if(P.rt<=0&&mode!='Survival'&&mode!='Zombies')respawn()}
 else if(sdGameRuntime?.drive()){trig=0;fresh=0}
 else if(zQuestCutActive()||jovianInputBlocked()){trig=0;fresh=0;P.mx=P.mz=P.vy=0}
 else{const mi=moveCalc(dt),f=mi.f,s=mi.s,spt=mi.spt;phys(dt,f,s,mi.spd*(PK('Marathon')?1.15:1)*zsm()*(sdGameRuntime?.speed()??1));P.spr=(P.spr||0)+((spt?1:0)-(P.spr||0))*Math.min(1,dt*8);
  tg=findT();fr=(tg?Math.max(.4,1-.4*AA):1)*(1+(aimOptions.ads/100-1)*ST.ads);
  const w=cw();if(window.SD_MOD_SESSION&&modRules.infiniteAmmo){if(w.mag<=0)w.mag=w.m;w.res=w.m*Math.max(1,w.rs??4)}
  if(rel>0)tickReload(dt,spt||trig&&fresh);
  if(rel<=0){
   if(((trig&&((w.au&&!ST.fm[w.k])||fresh))||(BST.n>0&&w.burst))&&t0>=nf&&w.mag>0&&(!spt||rng())){shoot();fresh=0}
   else if(trig&&w.mag<=0&&!(typeof MV!='undefined'&&MV.eq))startRel();
  }
  if(t0-lastHit>(PK('Second Wind')?2:4))P.sh=Math.min(P.msh,P.sh+(PK('Second Wind')?65:40)*dt)}
 kick*=Math.exp(-10*dt);
 const sprint=P.spr||0;
 sprF+=(((trig&&rng()&&sprint>.15&&!P.dead)?1:0)-sprF)*(1-Math.exp(-14*dt));
 const carry=sprint*(1-.9*sprF);
 P.sprG=carry;
 const [sway,step]=updateViewMotion(dt,carry);
 voxelTick(dt);juiceTick(dt);
 gun.rotation.z+=.025*sway-.035*viewMotion.side*(1-ST.ads)-carry*(.24+.048*step);
 gun.rotation.y+=.018*sway+carry*(.27+.033*sway);
 featTick(dt);fpUpdate(dt);updBots(dt);
 for(const b of bots){if(mode!=='Zombies'&&!b.practice)updatePlayerNameplate(b);if(b.al)animBot(b,dt)}
 fallTick(dt);gfxTick(dt);modeTick(dt);
 for(let i=grs.length-1;i>=0;i--){const g=grs[i];g.t-=dt;
  if(g.g.stk){const rate=g.stuck?Math.max(.07,.32*g.t/g.g.fuse):.2;g.bt-=dt;if(g.bt<=0){g.bt=rate;g.blk=!g.blk;if(g.blk&&g.stuck)beep(1900-g.t*180,.03,'square',.03)}const led=g.m.userData.led;if(led)led.material.color.setHex(g.blk?0xffe0a0:0xff2200);g.m.scale.setScalar(.13*(1+(g.blk?.12:0)))
   if(g.stuck){if(g.sb){if(!g.sb.al){g.stuck=0;g.sb=null;g.v.set(0,0,0)}else g.p.set(g.sb.x,(g.sb.y||0)+1.1,g.sb.z)}
    if(g.stuck){g.m.position.copy(g.p);if(g.t<=0){boom(g.p,g.g);S.remove(g.m);grs.splice(i,1)}continue}}}
  g.v.y-=(sdGameRuntime?.gravity()??18)*dt;g.m.rotation.x+=dt*8;g.m.rotation.z+=dt*5;const np=g.p.clone().add(g.v.clone().multiplyScalar(dt));let ex=g.t<=0;
  const terrain=(MAPS[sel.map].groundHeight?.(np.x,np.z)??0)+.13;
  if(np.y<terrain){np.y=terrain;g.v.y*=-.35;g.v.x*=.7;g.v.z*=.7;if(g.g.imp)ex=1;if(g.g.stk){g.stuck=1;g.v.set(0,0,0);burst(np.clone(),6,0xffa040,3,.25,.08)}}
  indexCollisions();
  const local=collisionCells.get(collisionKey(np.x,np.z))||emptyCollisionCell;
  const hitWall=MAPS[sel.map].boardRay?lockboxEquipmentHit(g.p,np):local.some(b=>!b.collisionRemoved&&np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y<b.h&&np.y>(b.y0||0));
  if(hitWall){if(g.g.imp)ex=1;else if(g.g.stk){g.stuck=1;g.v.set(0,0,0);np.copy(g.p);burst(np.clone(),6,0xffa040,3,.25,.08)}else{g.v.x*=-.3;g.v.z*=-.3;np.copy(g.p)}}
  if(g.g.imp)for(const b of bots)if(b.al&&Math.hypot(b.x-np.x,b.z-np.z)<.8&&np.y<2)ex=1;
  if(g.g.stk&&!g.stuck)for(const b of bots)if(b.al&&Math.hypot(b.x-np.x,b.z-np.z)<.7&&np.y<2.1&&np.y>(b.y||0)){g.stuck=1;g.sb=b;g.v.set(0,0,0);np.set(b.x,(b.y||0)+1.1,b.z);burst(np.clone(),8,0xff5522,3,.3,.1);msg('STUCK!',1)}
  g.p.copy(np);g.m.position.copy(np);if(ex){boom(np,g.g);S.remove(g.m);grs.splice(i,1)}}
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.l-=dt;if(f.grow)f.m.scale.addScalar(f.grow*dt);if(f.sph)f.m.material.opacity=Math.max(0,f.l*1.7);if(f.fade){f.m.material.opacity=f.fade*Math.min(1,f.l/.1);f.m.scale.x=f.m.scale.z=f.r*(.5+f.l/.16)}if(f.l<=0){S.remove(f.m);if(f.fade)f.m.material.dispose();if(f.line)f.m.geometry.dispose();fx.splice(i,1)}}
 hmT-=dt;if(hmT<=0&&hudHit.className)hudHit.className='';
 dmA=Math.max(0,dmA-dt*.8);
 const damage=String(dmA);if(hudDamage.style.opacity!==damage)hudDamage.style.opacity=damage;
 const crosshair=tg?'t':'';
 if(hudCrosshair.className!==crosshair)hudCrosshair.className=crosshair;
 const shield=P.msh>0?P.sh/P.msh*100:0,health=Math.max(0,P.hp/P.mhp*100);
 if(shield!==hudShieldValue){hudShieldValue=shield;hudShield.style.width=shield+'%'}
 if(health!==hudHealthValue){hudHealthValue=health;hudHealth.style.width=health+'%'}
 const ammo=P.dead?(mode=='Zombies'?'Downed':'Respawning…'):`${cw().k==='TEA'?teaAm():cw().mag+'<small>'+(rel>0?'Reloading…':'/ '+cw().res)} · ${cw().pn||(mode!=='Zombies'&&passWeaponData(cw().k)?.name)||W[cw().k].n}${mode=='Zombies'&&typeof zAmmoX=='function'?zAmmoX():''}</small>`;
 if(ammoMarkup!==ammo){hudAmmo.innerHTML=ammo;ammoMarkup=ammo}
}
const hudHit=$('#hm'),hudDamage=$('#dm'),hudCrosshair=$('#cx');
const hudShield=$('#sh'),hudHealth=$('#hp'),hudAmmo=$('#am');
const objectiveText=$('#ob');
function setObjectiveText(text){if(objectiveText.textContent!==text)objectiveText.textContent=text}
let ammoMarkup='',hudShieldValue,hudHealthValue;
var clk=new THREE.Clock(),onGameRender=null;
const fpsLimitMin=30,fpsLimitUnlimited=241;
let frameInterval=0,nextFrameAt=0;
function setFrameLimit(value){
 const fps=Number(value);
 frameInterval=Number.isInteger(fps)&&fps>=fpsLimitMin&&fps<fpsLimitUnlimited?1000/fps:0;
 nextFrameAt=0;
}
function frameDue(now){
 if(!frameInterval)return true;
 if(now+.15<nextFrameAt)return false;
 if(!nextFrameAt||now-nextFrameAt>=frameInterval)nextFrameAt=now;
 nextFrameAt+=frameInterval;
 return true;
}
var hsT=0,hsK=1;function hitStop(sec,k){if(typeof netOn!='undefined'&&netOn)return;hsT=Math.max(hsT,sec);hsK=k}
function gameFrame(draw){
 let dt=Math.min(clk.getDelta(),.05);
 if(document.body.classList.contains('sf-embedded')){if(typeof netOn!=='undefined'&&netOn)netTick(dt);return}
 if(hsT>0){hsT-=dt;dt*=hsK;if(hsT<=0)hsK=1}
 if(typeof inputTick==='function')inputTick(dt);
 const scenePane=!run&&typeof studioPane==='function'&&studioPane();
 if(run&&(!paused||(typeof netOn!=='undefined'&&netOn)))upd(dt);
 else if(!run&&!scenePane&&typeof menuCam==='function')menuCam(dt);
 if(typeof netOn!=='undefined'&&netOn)netTick(dt);
 if(typeof vrPost==='function')vrPost(dt);
 if(draw!==false&&!document.hidden){
  const now=performance.now();
  if(!scenePane){
   const cut=run?(jupiterIntroCamera()||jupiterLaunchCamera()||zQuestViewCamera()):null,visible=C.visible;
   const scripted=sdGameRuntime?.render(dt),fov=!cut&&!scripted?sdGameRuntime?.fov():null;
   if(cut||scripted)C.visible=false;
   const originalFov=C.fov;
   if(fov!=null){C.fov=fov;C.updateProjectionMatrix()}
   const flight=typeof jovianFlightScene==='function'?jovianFlightScene():null;
   const victory=typeof jovianVictoryCamera==='function'?jovianVictoryCamera():null;
   try{LX.render(flight||S,cut||scripted||victory||C)}
   finally{
    C.visible=visible;
    if(fov!=null){C.fov=originalFov;C.updateProjectionMatrix()}
   }
   if(onGameRender)onGameRender(now);
  }
  else if(studioFrame(now,scenePane)&&onGameRender)onGameRender(now);
 }
 if(typeof vrAfter==='function')vrAfter();
}
/* the first frame waits for the next animation frame so every file has finished loading (they can all run inside one closure) */
requestAnimationFrame(function loop(now){requestAnimationFrame(loop);if(!(R.xr&&R.xr.isPresenting)&&!document.hidden)gameFrame(frameDue(now))});
// Keep online matches running when the browser suspends requestAnimationFrame.
let backgroundMatchWorker=null,backgroundMatchURL=null;
function syncBackgroundMatch(){
 const active=document.hidden&&typeof netOn!=='undefined'&&netOn;
 if(active&&!backgroundMatchWorker){
  try{
   backgroundMatchURL=URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),25)'],{type:'text/javascript'}));
   backgroundMatchWorker=new Worker(backgroundMatchURL);
   backgroundMatchWorker.onmessage=()=>{
    if(document.hidden&&netOn&&!R.xr?.isPresenting)gameFrame(false);
   };
  }catch{
   if(backgroundMatchURL)URL.revokeObjectURL(backgroundMatchURL);
   backgroundMatchURL=null;
  }
 }else if(!active&&backgroundMatchWorker){
  backgroundMatchWorker.terminate();
  URL.revokeObjectURL(backgroundMatchURL);
  backgroundMatchWorker=backgroundMatchURL=null;
 }
}
document.addEventListener('visibilitychange',()=>{nextFrameAt=0;syncBackgroundMatch()});

/* ===================== input.js ===================== */
/* ---------- input ---------- */
$('#go').onclick=()=>beginMatchSearch();$('#again').onclick=()=>{
 if(window.SD_SPLIT){parent.postMessage('spartan-restart-split',location.origin);return}
 if(!partyActive){startGame();return}
 const map=sel.map,m=mode;
 if(isHost){exitNetworkMatch(true);startNetworkMatch(map,m,true)}
 else{exitNetworkMatch(true);openGameParty()}
};$('#tomenu').onclick=()=>{jovianResetPresentation();if(window.SD_MOD_SESSION)return exitNetworkMatch();if(window.SD_SPLIT){parent.postMessage('spartan-exit-split',location.origin);return}if(partyActive){exitNetworkMatch(true);return}netClose();for(const b of bots)S.remove(b.m);bots=[];clearFlags();buildMap();showRank();$('#end').style.display=$('#hud').style.display='none';$('#menu').style.display='block'};

document.addEventListener('pointerlockchange',()=>{
 if(!run||jovianPointerFree()||sdGameRuntime?.uiOpen())return;
 const locked=document.pointerLockElement===R.domElement;
 if(Boolean(paused)===!locked)return;
 paused=!locked;
 (locked?hidePause:showPause)();
});
addEventListener('mousemove',e=>{if(!run||paused||jupiterIntroActive()||zQuestCutActive()||jovianInputBlocked()||(typeof EMO!='undefined'&&EMO.open))return;const k=.0022*sens*fr;yaw-=e.movementX*k;pitch=cl(pitch-e.movementY*k,-1.45,1.45);sw.x=cl(sw.x-e.movementX*.0012,-.1,.1);sw.y=cl(sw.y-e.movementY*.0012,-.08,.08)});
addEventListener('mousedown',e=>{if(e.button==0&&run&&!paused&&!jovianInputBlocked()){trig=1;fresh=1}});addEventListener('mouseup',e=>{if(e.button==0)trig=0});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(!run||paused)return;if(typeof kbDown=='function')return kbDown(e);if(e.code=='Space')e.preventDefault();if(!key[e.code]){if(e.code=='KeyF')fresh=1;if(e.code=='KeyR')startRel();if(e.code=='Digit1')swap(0);if(e.code=='Digit2')swap(1);if(e.code=='Digit3')swap(mode=='Zombies'?2:wp.findIndex(w=>w.pw));if(e.code=='KeyV')melee();if(e.code=='KeyE')useStreak();if(e.code=='KeyQ')swap((cur+1)%wp.length)}key[e.code]=1});
addEventListener('keyup',e=>key[RB(e.code)]=0);
;
;

/* ######## maps.js ######## */
/* ===================== maps.js ===================== */
/* ---------- shared building toolkit + the map Rust ----------
   Box format: [x,z,w,d,top,y0,colour,texture] (collision + visuals). Visual only (V and deco): [x,z,w,d,top,y0,colour,shape,texture], shape b box, e glow, g glass, s sphere, c cylinder, k cone.
   Open maps have no tall walls. The play area is enclosed by a fence with an invisible wall on top (barrierLine) and the rest of the world is detailed beyond the fence. */
var MK={
 rnd(seed){let s=seed||7;return()=>(s=(s*16807)%2147483647)/2147483647},
 /* wall along x (hz) or z with openings ops=[[offset from centre,width,bottom,top]...] measured from y0 */
 wall(B,hz,cx,cz,len,t,y0,y1,ops,c,k){ops=(ops||[]).slice().sort((p,q)=>p[0]-q[0]);let cur=-len/2;
  const put=(a,b,lo,hi)=>{if(b-a<.03||hi-lo<.03)return;const m=(a+b)/2,l=b-a;B(hz?cx+m:cx,hz?cz:cz+m,hz?l:t,hz?t:l,hi,lo,c,k)};
  for(const[o,w,bt,tp]of ops){put(cur,o-w/2,y0,y1);put(o-w/2,o+w/2,y0,y0+bt);put(o-w/2,o+w/2,y0+tp,y1);cur=o+w/2}put(cur,len/2,y0,y1)},
 /* four walls with doors / windows per side (n = -z, s = +z, w = -x, e = +x) and an optional flat roof */
 room(B,o){const{x,z,w,d,h,y0=0,t=.35,c,k,roof=1,rc,rk,rt=.3,dr={},wn={}}=o,ops=s=>[...(dr[s]||[]).map(([f,wd,ht])=>[f,Math.max(2.4,wd||2.4),0,ht||2.4]),...(wn[s]||[]).map(([f,wd])=>[f,wd||1.2,1.1,2.1])],W=MK.wall;
  W(B,1,x,z-d/2+t/2,w,t,y0,y0+h,ops('n'),c,k);W(B,1,x,z+d/2-t/2,w,t,y0,y0+h,ops('s'),c,k);W(B,0,x-w/2+t/2,z,d-2*t,t,y0,y0+h,ops('w'),c,k);W(B,0,x+w/2-t/2,z,d-2*t,t,y0,y0+h,ops('e'),c,k);
  if(roof)B(x,z,w+.2,d+.2,y0+h+rt,y0+h,rc||c,rk||k)},
 /* stairs: n steps rising .3 each, running in direction dir ('n','s','e','w'), starting at (x,z) = bottom centre */
 stairs(B,x,z,wd,n,dir,c,k,rise=.3,run=.62,y0=0){for(let i=0;i<n;i++){const o=(i+.5)*run,top=y0+rise*(i+1),px=dir=='e'?x+o:dir=='w'?x-o:x,pz=dir=='s'?z+o:dir=='n'?z-o:z,hz=dir=='e'||dir=='w';B(px,pz,hz?run:wd,hz?wd:run,top,y0,c,k)}},
 /* a floor slab with a rectangular hole (hx,hz centre, hw,hd size) so a stairwell can pass through */
 slab(B,x,z,w,d,top,y0,c,k,hole){if(!hole){B(x,z,w,d,top,y0,c,k);return}const[hx,hz,hw,hd]=hole,x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,a=hx-hw/2,b=hx+hw/2,e=hz-hd/2,f=hz+hd/2;
  if(a-x0>.05)B((x0+a)/2,z,a-x0,d,top,y0,c,k);if(x1-b>.05)B((b+x1)/2,z,x1-b,d,top,y0,c,k);if(e-z0>.05)B(hx,(z0+e)/2,hw,e-z0,top,y0,c,k);if(z1-f>.05)B(hx,(f+z1)/2,hw,z1-f,top,y0,c,k)}
};

/* The original builders in core.js are replaced by the modern remakes below. */
(()=>{
 const blockfort=MAPS.Blockfort.b(),pillars=MAPS.Pillars.b(),canyon=MAPS.Canyon.b();
 const edgeX=48,edgeZ=56;
 MAPS['Classic Crossroads']={
  d:'The original Blockfort, Pillars and Canyon interlock in one arena',
  H:58,open:1,sky:0xa8c4cc,gr:0x687956,gt:'grass',fogF:155,
  hemi:.96,hemiG:0x73755b,sunI:.92,sunC:0xffebc9,
  inside:(x,z)=>Math.abs(x)<edgeX-1&&Math.abs(z)<edgeZ-1,
  tb:[-edgeX,-edgeZ,edgeX,edgeZ],
  fb:[[-38,0],[34,24]],zn:[[-20,11],[14,-28],[12,24]],
  b(){
   // Blockfort sits west of the forum. A quarter turn opens Canyon's gaps toward both.
   const a=[
    ...blockfort.map(([x,z,w,d,h])=>[x-20,z,w,d,h,0,0x8d99a3,'brick']),
    ...pillars.map(([x,z,w,d,h])=>[x+14,z-28,w,d,h,0,0xb09878,'concrete']),
    ...canyon.map(([x,z,w,d,h])=>[12-z,24+x,d,w,h,0,0x9c795b,'sand'])
   ];
   const cover=(x,z,w,d,h)=>a.push([x,z,w,d,h,0,0x8a8374,'brick']);
   cover(-32,-33,5,1.4,1.35);
   cover(-25,-43,1.4,4,1.55);
   cover(-15,-28,4,1.4,1.15);
   cover(-33,28,4,1.4,1.35);
   cover(-28,40,1.4,5,1.55);
   cover(38,-5,1.4,4,1.35);
   cover(32,46,4,1.4,1.35);

   const v=this._v=[];
   const ground=(x,z,w,d,h,color,texture)=>v.push([x,z,w,d,h,0,color,'b',texture]);
   ground(14,-28,50,50,.025,0x998d72,'cobble');
   ground(12,26,70,50,.025,0xa78965,'sand');
   ground(-20,0,19,19,.05,0x7c8270,'cobble');
   ground(-5,-12,12,4,.045,0x928972,'cobble');
   ground(-10,11,14,4,.045,0x928972,'cobble');
   ground(3,8,4,42,.04,0x928972,'cobble');

   barrierLine(a,-edgeX,-edgeZ,edgeX,-edgeZ,0);
   barrierLine(a,-edgeX,edgeZ,edgeX,edgeZ,1);
   barrierLine(a,-edgeX,-edgeZ,-edgeX,edgeZ,2);
   barrierLine(a,edgeX,-edgeZ,edgeX,edgeZ,0);
   return a;
  }
 };
})();

/* ===================== RUST ===================== */
/* An abandoned desert oil refinery. Layout traced from the reference top-down map (1 map pixel = .075 m): a central drilling tower with a conveyor stair, a tank farm top right,
   sheds on the left, a pit and low barriers right of centre, a tanker truck and pickup bottom right. Play area 51 x 59 m inside a fence; dunes, a pipeline, a derrick,
   a rail line with train cars, containers, rocks and pylons surround it. */
MAPS.Rust={d:'Desert oil refinery: tower with a conveyor stair, tank farm, sheds and a pit',H:31,open:1,sky:0xdcc79f,gr:0xcdb78a,gt:'sand',bc:0xc4a878,hemi:.95,hemiC:0xfff2d8,hemiG:0x8a7650,sunI:.95,sunC:0xfff0d0,fogF:150,
 fb:[[-6,-27],[6,27]],zn:[[-10,14],[2,-3],[17,-10]],tb:[-25.8,-29.8,25.8,29.8],
 inside:(x,z)=>Math.abs(x)<24&&Math.abs(z)<28,
 lights:[[-2.6,17.2,-5.3,0xff8a30,1.6,46],[-2.6,4,-5,0xffd9a0,.5,14]],
 b(){const a=[],v=MAPS.Rust._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),X=p=>(p-948)*.075,Z=p=>(p-945)*.075,R=(x0,y0,x1,y1)=>[(X(x0)+X(x1))/2,(Z(y0)+Z(y1))/2,(x1-x0)*.075,(y1-y0)*.075],rnd=MK.rnd(11),TAN=0xc9ad7c,RUST=0x8a4a2a,DRUST=0x5a3320,STEEL=0x7a8087,RED=0xa03a2a,WHITE=0xd9d4c4,CONC=0xb5ac98,YEL=0xd7a82a,BLK=0x222426;
  const barrel=(x,z,c)=>{B(x,z,.7,.7,1.05,0,c||RUST,'rust');V(x,z,.74,.74,1.05,0,c||RUST,'c','rust');V(x,z,.78,.78,.08,.5,0x2a2a2a,'c')},
   crate=(x,z,w,d,h,c)=>{B(x,z,w,d,h,0,c||0x9a7a4a,'plank')},
   jersey=(x,z,hz,n)=>{for(let i=0;i<n;i++){const p=(i-(n-1)/2)*3.1,bx=hz?x+p:x,bz=hz?z:z+p;B(bx,bz,hz?3:.7,hz?.7:3,1.05,0,CONC,'concrete');V(bx,bz,hz?2.9:.9,hz?.9:2.9,.5,0,CONC,'b','concrete')}},
   sand=(x,z,w,d)=>{B(x,z,w,d,1.0,0,0xb89a60);V(x,z,w+.1,d+.1,1.1,.55,0xa88a52,'s')},
   container=(x,z,hz,c,h0)=>{const L=6,Wd=2.5,y=h0||0;B(x,z,hz?L:Wd,hz?Wd:L,y+2.6,y,c,'rust');for(let i=-2;i<=2;i++)V(hz?x+i*1.1:x,hz?z:z+i*1.1,hz?.08:Wd+.04,hz?Wd+.04:.08,y+2.55,y+.1,0x00000000+(c==RED?0x7a2a1e:0x4a4a3a),'b')};
  /* ---- ground: tarmac patches, oil stains, tracks and cracks ---- */
  const pad=(x0,y0,x1,y1,c)=>{const r=R(x0,y0,x1,y1);V(r[0],r[1],r[2],r[3],.05,0,c||0x7d7466,'b','concrete')};
  pad(860,800,1100,1100);pad(640,1080,800,1260,0x8a8070);pad(1090,1090,1280,1260,0x8a8070);pad(1100,640,1280,800,0x8f8574);pad(700,640,860,780,0x8a8070);
  for(let i=0;i<26;i++){const x=(rnd()-.5)*46,z=(rnd()-.5)*54;V(x,z,1+rnd()*3.5,1+rnd()*3,.04,0,0x3a2c22,'s')}
  for(let i=0;i<14;i++)V((rnd()-.5)*44,(rnd()-.5)*54,.12,2+rnd()*4,.045,0,0x5a4e3a,'b','concrete');
  for(let i=0;i<30;i++)V((rnd()-.5)*48,(rnd()-.5)*56,.5+rnd()*1.2,.5+rnd()*1.2,.3+rnd()*.3,0,0xbfa574,'s');
  /* ---- the central tower: open bay under a steel deck, a tall body above, and a conveyor stair up the south side ---- */
  const T=R(870,830,960,925),TB=R(897,852,943,903);
  for(const sx of[-1,1])for(const sz of[-1,1]){B(T[0]+sx*(T[2]/2-.45),T[1]+sz*(T[3]/2-.45),.7,.7,3.2,0,RUST,'rust');V(T[0]+sx*(T[2]/2-.45),T[1]+sz*(T[3]/2-.45),.9,.9,3.2,0,DRUST,'b','rust')}
  B(T[0],T[1],.7,.7,3.2,0,RUST,'rust');B(T[0]-2.4,T[1],.6,.6,3.2,0,RUST,'rust');B(T[0]+2.4,T[1],.6,.6,3.2,0,RUST,'rust');
  B(T[0],T[1],T[2],T[3],3.6,3.2,STEEL,'metal');                                   /* deck */
  B(TB[0],TB[1],TB[2],TB[3],14.5,3.6,TAN,'metal');                                 /* tower body */
  V(TB[0],TB[1],TB[2]+.4,TB[3]+.4,9.5,3.6,0x7d8590,'b','metal');V(TB[0],TB[1]+TB[3]/2+.25,3,.1,12.6,6.5,0xf2f0e6,'b','plank');V(TB[0],TB[1]+TB[3]/2+.32,2,.05,11.6,8.0,0xc8362a,'e');
  for(const sx of[-1,1])for(let i=0;i<4;i++){V(TB[0]+sx*(TB[2]/2+.05),TB[1]-1.4+i*1.1,.08,.7,6.6,4.6,0x1b2430,'g');V(TB[0]-1.2+i*.8,TB[1]-TB[3]/2-.05,.5,.08,9.2,5.6,0x1b2430,'g')}
  /* upper section with railings, two tall exhaust stacks with a flame */
  V(TB[0],TB[1],TB[2]-1,TB[3]-1,18,14.5,0x8a8f96,'b','metal');V(TB[0]-.8,TB[1],.9,.9,22,18,0xb9a070,'c','metal');V(TB[0]+.8,TB[1],.9,.9,22,18,0xb9a070,'c','metal');V(TB[0]-.8,TB[1],.5,.5,24.5,22,0xff8a30,'k');V(TB[0]-.8,TB[1],.3,.3,25.5,22.6,0xffd070,'e');
  for(let i=0;i<10;i++){const q=i/10*6.28;V(TB[0]+Math.cos(q)*2.5,TB[1]+Math.sin(q)*2.5,.1,.1,15.6,14.5,0x2a2a2e,'b','metal')}V(TB[0],TB[1]-2.5,5.2,.08,15.5,15.4,0x2a2a2e,'b');V(TB[0],TB[1]+2.5,5.2,.08,15.5,15.4,0x2a2a2e,'b');
  /* catwalk bracing under the deck and a ladder up the west leg */
  for(let i=0;i<8;i++){V(T[0]-T[2]/2+.2,T[1]+T[3]/2-.4-i*.8,.05,.05,.3+i*.4,0,YEL,'b')}
  for(let i=0;i<9;i++)V(T[0]-T[2]/2-.12,T[1]+T[3]/2-.8,.04,.5,.4+i*.38,.3+i*.38,YEL,'b');
  crate(T[0]-1.8,T[1]+1.2,1.4,1.4,1.4);crate(T[0]+2,T[1]-1.6,1.2,1.2,1.1,0x6a5a3a);barrel(T[0]+1.3,T[1]+2,DRUST);barrel(T[0]+.5,T[1]+2.4,0x8a2a1a);barrel(T[0]-2.4,T[1]-1.8,0x2a4a6a);
  B(T[0]+1.8,T[1]+1.5,.9,.9,1.2,0,0x6a6a60,'metal');V(T[0]+1.8,T[1]+1.5,.95,.95,1.25,0,0x6a6a60,'b','metal');
  /* conveyor stair: 12 steps (.3 each) up to a bridge that meets the deck at 3.6 */
  const SX=-1.6;MK.stairs(B,SX,Z(1095),2.4,12,'n',0x8a8f96,'metal',.3,.625);
  B(SX,(Z(995)+Z(925))/2,2.4,Z(995)-Z(925),3.6,3.2,0x8a8f96,'metal');
  for(const sd of[-1,1]){V(SX+sd*1.25,(Z(1095)+Z(925))/2+1.2,.08,Z(1095)-Z(925)-2.4,1.1,0,0x6a6f76,'b','metal');for(let i=0;i<12;i++)V(SX+sd*1.25,Z(1095)-.4-i*.625,.08,.08,.3*(i+1)+1.0,.3*i,0x2a2a2e,'b');V(SX+sd*1.25,(Z(995)+Z(925))/2,.08,Z(995)-Z(925),4.7,4.6,0x2a2a2e,'b')}
  for(let i=0;i<6;i++){V(SX,Z(1095)-1+i*1.2,2.5,.14,.3*(2*i+3)+.02,.3*(2*i+3),0xd7a82a,'b')}
  B(SX-1.0,Z(990),.5,.5,3.2,0,RUST,'rust');B(SX+1.0,Z(990),.5,.5,3.2,0,RUST,'rust');B(SX,Z(935),.5,.5,3.2,0,RUST,'rust');
  V(SX,Z(945),.5,.7,.04,0,0x7a2a1e,'b');
  /* ---- tank farm top right: concrete bund, three tanks, pipes and a ramp ---- */
  const TF=R(1130,640,1250,785);V(TF[0],TF[1],TF[2],TF[3],.35,0,0xa8a08c,'b','concrete');
  for(const[px,py]of[[1172,692],[1218,692],[1195,744]]){const x=X(px),z=Z(py);B(x,z,4.2,4.2,7,0,RUST,'rust');V(x,z,4.4,4.4,7,0,0x8c5030,'c','rust');V(x,z,4.3,4.3,7.7,7,0x6a3a24,'k');V(x,z,4.6,4.6,.2,5.2,DRUST,'c');V(x,z,4.6,4.6,.2,2.4,DRUST,'c');V(x+2.4,z,.25,.25,5.5,.3,0x5a5a60,'c')}
  B(TF[0]-2.8,TF[1]+5.2,6,.4,1.0,0,CONC,'concrete');B(TF[0]+4.5,TF[1]+5.2,5,.4,1.0,0,CONC,'concrete');crate(TF[0]-4,TF[1]+3,1.6,1.6,1.3);barrel(TF[0]+5,TF[1]-1,RED);barrel(TF[0]+5.8,TF[1]-.5,RUST);
  V(TF[0],TF[1]-4,10,.35,2.3,1.9,0x5a5a60,'b','metal');for(let i=-4;i<=4;i+=2)V(TF[0]+i,TF[1]-4,.2,.2,2,0,0x4a4a50,'b');
  /* ---- top left sheds (two) ---- */
  const s1=R(748,683,792,767),s2=R(795,688,830,767);
  MK.room(B,{x:s1[0],z:s1[1],w:s1[2],d:s1[3],h:3.2,c:TAN,k:'rust',rc:DRUST,rk:'metal',dr:{s:[[-.4,1.9]],e:[[.8,1.6]]},wn:{n:[[0,1.2]],w:[[-1.4,1.2]]}});
  MK.room(B,{x:s2[0],z:s2[1],w:s2[2],d:s2[3],h:3.0,c:0xb8997a,k:'rust',rc:DRUST,rk:'metal',dr:{s:[[.4,1.9]],w:[[.8,1.6]]},wn:{n:[[0,1.2]],e:[[-1,1.2]]}});
  crate(s1[0]-.3,s1[1]-1.5,1.3,1.3,1.2);barrel(s2[0]+.6,s2[1]-1.8);barrel(s2[0]-.2,s2[1]-1.6,0x2a4a6a);
  /* ---- big shed bottom left with two doors, windows and crates inside ---- */
  const bs=R(683,1090,773,1183);
  MK.room(B,{x:bs[0],z:bs[1],w:bs[2],d:bs[3],h:3.8,c:0xcfb58a,k:'rust',rc:0x6a4a30,rk:'metal',dr:{n:[[.8,2.2]],e:[[-.5,2.2]],w:[[1.5,1.8]]},wn:{s:[[-1.5,1.4],[1.5,1.4]],n:[[-2,1.2]],e:[[2.1,1.2]]}});
  crate(bs[0]-1.8,bs[1]+1.6,1.6,1.6,1.5);crate(bs[0]-1.8,bs[1]+.1,1.2,1.2,1.1,0x6a5a3a);crate(bs[0]+1.8,bs[1]+2.2,1.3,2,1.0,0x6a5a3a);barrel(bs[0]+2.2,bs[1]-1.8);B(bs[0],bs[1]+.5,1.6,.5,1.0,0,0x555a5e,'metal');
  V(bs[0],bs[1],bs[2]-.6,bs[3]-.6,.06,0,0x6a5a46,'b','plank');V(bs[0]+1,bs[1]-2.9,.9,.9,3.7,3.4,0xffe0a0,'e');
  /* ---- two containers bottom left, a container stack bottom centre ---- */
  const c1=R(673,1185,728,1215),c2=R(673,1218,728,1245);container(c1[0],c1[1],1,RED);container(c2[0],c2[1],1,0x4a5a6a);
  const c3=R(876,1215,958,1275);container(c3[0],c3[1],1,0x6b6a45);container(c3[0]+.6,c3[1]+.2,1,RED,2.6);for(let i=0;i<5;i++)B(c3[0]-3.3+i*.3,c3[1]+1.7+i*.3,.4,.4,.4+i*.1,0,0x6a4a2a);
  MK.stairs(B,c3[0]-3.3,c3[1]+3.3,1,8,'n',0x6a4a2a,'plank',.3,.34);   /* pallet ramp */
  /* ---- right shed, with a loading dock ---- */
  const rs=R(1190,827,1280,960);
  MK.room(B,{x:rs[0],z:rs[1],w:rs[2],d:rs[3],h:3.6,c:0xd1b894,k:'rust',rc:0x5a3a28,rk:'metal',dr:{w:[[-2,2],[3,2]],s:[[1.4,2.2]]},wn:{e:[[-2.5,1.4],[.5,1.4],[3.2,1.4]],n:[[0,1.4]]}});
  B(rs[0]-4.4,rs[1]+1.6,2,6,.9,0,CONC,'concrete');crate(rs[0]+1,rs[1]-2,1.5,1.5,1.5);crate(rs[0]-1.4,rs[1]-2.6,1.2,1.2,1.2,0x6a5a3a);barrel(rs[0]+2,rs[1]+3);barrel(rs[0]+2.8,rs[1]+3.2,0x8a2a1a);
  /* ---- guard shack mid left ---- */
  const gs=R(753,878,805,922);MK.room(B,{x:gs[0],z:gs[1],w:gs[2],d:gs[3],h:2.8,c:0xc4a878,k:'rust',rc:DRUST,rk:'metal',dr:{e:[[0,1.6]]},wn:{n:[[0,1]],s:[[0,1]],w:[[0,1]]}});B(gs[0]-1,gs[1],.8,1.8,.9,0,0x6a5a3a,'plank');
  /* ---- long walls on the left: a lane with two gaps ---- */
  MK.wall(B,0,X(700),(Z(712)+Z(1000))/2,Z(1000)-Z(712),.45,0,2.4,[[-4,2.4,0,2.4],[3,2.4,0,2.4]],CONC,'concrete');
  MK.wall(B,1,(X(700)+X(850))/2,Z(810),X(850)-X(700),.45,0,2.4,[[-4,2.4,0,2.4]],CONC,'concrete');
  for(let i=0;i<7;i++)V(X(700),Z(715)+i*3,.7,.5,2.6,2.4,0x8f8878,'b','concrete');
  /* ---- pit and low walls right of centre ---- */
  const pt=R(1005,1010,1075,1050);B(pt[0],pt[1]+pt[3]/2-.2,pt[2],.4,1.25,0,CONC,'concrete');B(pt[0]-pt[2]/2+.2,pt[1],.4,pt[3],1.25,0,CONC,'concrete');B(pt[0]+pt[2]/2-.2,pt[1],.4,pt[3],1.25,0,CONC,'concrete');
  V(pt[0],pt[1],pt[2]-.8,pt[3]-.8,.06,0,0x2a2118,'b','concrete');crate(pt[0]+.4,pt[1]-.3,1.4,1.4,1.3);barrel(pt[0]-1.4,pt[1]+.2,BLK);B(pt[0]+pt[2]/2+.6,pt[1]+.2,.5,pt[3]+.4,1.0,0,CONC,'concrete');
  /* ---- barrier strip right of centre ---- */
  jersey(X(1075),Z(965),1,4);jersey(X(1130),Z(965),1,2);
  /* ---- tanker truck and pickup bottom right, derelict car upper left ---- */
  B(18,12.4,2.6,2.6,2.9,0,WHITE,'metal');V(18,11.6,2.5,.1,2.4,1.6,0x2a3a4a,'g');V(18,12.4,2.7,2.7,.2,2.9,0x6a6a60,'b','metal');B(18,17.4,2.6,7,2.7,.4,0x9a5a2a,'rust');V(18,17.4,2.7,7.1,2.9,2.7,0x7a4a26,'b','rust');
  for(const sx of[-1,1])for(const zz of[11.8,16,18.5])V(18+sx*1.4,zz,.35,.9,.9,0,BLK,'c');for(const zz of[14,20.7])V(18,zz,2.65,.15,2.7,.4,0x5a3a20,'b');V(18,14.4,.8,.4,3.4,2.9,0x4a4a50,'c');
  B(7.7,19.3,2.2,4.8,1.1,0,0x4a4f52,'metal');B(7.7,18.2,2,1.8,1.85,.9,0x3a3f42,'metal');V(7.7,17.3,1.9,.08,1.75,1.1,0x1a2430,'g');for(const sx of[-1,1])for(const zz of[17.9,20.5])V(7.7+sx*1.05,zz,.3,.7,.7,0,BLK,'c');
  B(-9,-24,2,4.4,1.3,0,0x6a5a4a,'rust');V(-9,-24,1.95,4.3,1.9,1.2,0x4a3f35,'b','rust');B(14,-3,4.4,2,1.3,0,0x3a4a5a,'rust');V(14,-3,3,1.9,1.95,1.2,0x2a3a4a,'b','rust');
  /* ---- scattered cover: barrels, crates, sandbags, jersey barriers, pallets ---- */
  jersey(-4,-13,1,3);jersey(10,-8,0,2);jersey(-8,5,0,2);jersey(-23,3,0,2);jersey(23,-10,0,2);jersey(0,26,1,3);jersey(-22,-23,1,2);
  sand(-1,15,3.4,1);sand(-9,22,1,3.2);sand(13,6,3.2,1);sand(21,22,1,3.2);sand(-12,-5.8,1,3);
  barrel(-6,9.5);barrel(-6.8,9.8,0x2a4a6a);barrel(3,10,0x8a2a1a);barrel(12,-2.5);barrel(-3,-15.8,DRUST);barrel(-1.8,-16.3);barrel(10.5,24,0x2a4a6a);barrel(22,6,RUST);barrel(22.8,6.4,RED);barrel(-21,-8.5,RUST);
  crate(-2,9,1.6,1.6,1.4);crate(8,12,1.4,1.4,1.2,0x6a5a3a);crate(1.5,-12,1.3,1.3,1.2);crate(-15,-9,1.5,1.5,1.5);crate(-14.5,-7.2,1.2,1.2,1.1,0x6a5a3a);crate(10,26,1.5,1.5,1.4);crate(22,-5,1.3,1.3,1.1,0x6a5a3a);crate(-10,26,1.7,1.7,1.5);
  B(-6.3,-12.8,1.5,.8,.9,0,0x7a7a7a,'metal');B(4,-8,.9,.9,1.9,0,0x5a5a60,'metal');B(12,18.5,.6,.6,2.2,0,0x5a5a60,'metal');
  /* ---- pipes on the ground (low, mantle-able), sign posts, lamps, hazard lines, tyres ---- */
  B(-3,-22,7,.7,.7,0,0x6a4a34,'rust');V(-3,-22,7.2,.8,.8,0,0x7a5a40,'b','rust');B(11,-26,.7,6,.7,0,0x6a4a34,'rust');V(11,-26,.8,6.2,.8,0,0x7a5a40,'b','rust');
  for(const[x,z]of[[-12,-10],[4,-25],[14,10],[-6,19],[22,-17],[-20,24]]){V(x,z,.18,.18,5.2,0,0x3a3a3e,'c');V(x+.5,z,1.2,.5,5.4,4.9,0x2a2a2e,'b');V(x+.9,z,.35,.35,5.0,4.8,0xfff0c0,'e')}
  for(const[x,z]of[[-18.8,-5],[17,-2.6],[2,19]]){for(let i=0;i<3;i++)B(x,z,.9,.9,.5+i*.5,0,0x1b1b1c,'c'),V(x,z,1,1,.5+i*.5,i*.5,0x1b1b1c,'c')}
  for(let i=0;i<6;i++){V(-23+i*2.6,26.3,1.2,.18,.06,0,i%2?YEL:BLK,'b')}for(let i=0;i<6;i++)V(23,-26+i*2.6,.18,1.2,.06,0,i%2?YEL:BLK,'b');
  /* ---- the fence ---- */
  barrierLine(a,-25.6,-29.6,25.6,-29.6,0);barrierLine(a,-25.6,29.6,25.6,29.6,1);barrierLine(a,-25.6,-29.6,-25.6,29.6,2);barrierLine(a,25.6,-29.6,25.6,29.6,0);
  return a},
 /* ---- the world beyond the fence ---- */
 deco(){const o=[],rnd=MK.rnd(23),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),RUST=0x8a4a2a,SD=[0xcdb78a,0xc7b080,0xd3bd90,0xbfa874];
  /* dunes in rings, bigger further out, with a pale crest on top */
  for(let r=0;r<150;r++){const q=rnd()*6.283,d=34+rnd()*100,x=Math.cos(q)*d,z=Math.sin(q)*d*1.05;if(Math.abs(x)<28&&Math.abs(z)<32)continue;const w=14+rnd()*30+d*.12,hh=2+rnd()*7+d*.045;V(x,z,w,w*(.6+rnd()*.8),hh-hh*.4,-hh*.8,SD[r&3],'s','sand')}
  for(let i=0;i<12;i++){const q=i/12*6.283+.2;V(Math.cos(q)*125,Math.sin(q)*125,80,60,34,-8,0xc2a874,'s','sand')}
  for(let r=0;r<80;r++){const q=rnd()*6.283,d=30+rnd()*50,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<27.5&&Math.abs(z)<31.5)continue;V(x,z,.6+rnd()*1.6,.5+rnd()*1.4,.5+rnd()*1.1,0,0x8a7a62,'s')}
  /* pipeline along the west side with flanges, supports and a riser */
  for(let i=0;i<6;i++){const z=-52+i*20;V(-34,z+7,2.4,16.4,2.7,.4,0x8a6a4a,'b','rust');V(-34,z-1.5,2.8,.5,2.9,.2,0x5a4a3a,'b');V(-34,z+15,2.8,.5,2.9,.2,0x5a4a3a,'b');for(const dz of[3,11])V(-34,z+dz,.7,.7,.5,0,0x4a3a2a,'b','concrete')}
  V(-34,-60,2.4,2.4,5,.4,0x8a6a4a,'b','rust');V(-34,66,2.4,2.4,5,.4,0x8a6a4a,'b','rust');V(-41,20,2.2,30,2.4,.2,0x7a5a3e,'b','rust');V(-41,36,2.6,.6,2.9,.1,0x4a3a2a,'b');
  /* the derrick: four legs narrowing upward, rings and X braces, crown block and a platform */
  const lat=(x,z,hh,w0)=>{for(let lv=0;lv<10;lv++){const y=lv*hh/10,w=w0*(1-lv*.075),y1=y+hh/10;for(const sx of[-1,1])for(const sz of[-1,1])V(x+sx*w/2,z+sz*w/2,.32,.32,y1,y,0x8a5a3a,'b','rust');V(x,z+w/2,w,.14,y+.2,y,0x7a4a2a,'b');V(x,z-w/2,w,.14,y+.2,y,0x7a4a2a,'b');V(x+w/2,z,.14,w,y+.2,y,0x7a4a2a,'b');V(x-w/2,z,.14,w,y+.2,y,0x7a4a2a,'b');
    for(const sd of[-1,1]){V(x+sd*w*.25,z+w/2,.1,.1,y1,y,0x6a3a22,'b');V(x+sd*w*.25,z-w/2,.1,.1,y1,y,0x6a3a22,'b')}}V(x,z,w0*.4,w0*.4,hh+2.4,hh,0x5a5a60,'b','metal');V(x,z,w0*.8,w0*.8,hh*.62,hh*.6,0x6a6a60,'b','metal')};
  lat(-38,-38,34,7);lat(46,-52,20,4.6);
  /* power pylons on a diagonal, with a catenary of dark cables suggested by thin beams */
  for(let i=0;i<5;i++){const x=-70+i*34,z=60-i*30;lat(x,z,22,3.6);V(x,z,10,.3,21.2,20.6,0x2a2a2e,'b');V(x,z,8,.3,18.5,18,0x2a2a2e,'b')}
  /* the rail line to the east: track, sleepers, tank cars, a locomotive and a boxcar */
  V(40,0,.2,160,.2,0,0x3a3a3e,'b');V(41.6,0,.2,160,.2,0,0x3a3a3e,'b');for(let i=-38;i<38;i++)V(40.8,i*2.1,2.8,.5,.22,0,0x3a2a1e,'b','plank');
  const car=(z,len,c,h)=>{V(40.8,z,2.9,len,h+.6,.7,c,'b','rust');V(40.8,z,2.4,len-1.2,h+1.2,h+.5,0x4a3a2a,'b','rust');for(const dz of[-1,1])for(const dx of[-1,1])V(40.8+dx*1.1,z+dz*len*.32,.4,1.6,.9,0,0x1b1b1c,'c')};
  car(-52,11,0x3a3a3e,2.6);car(-39,11,0x6a2a1e,2.8);car(-26,12,0x2a2a2e,2.4);car(-12,10,0x5a3a22,2.6);car(6,12,0x3a3a3e,2.6);car(24,11,0x6a4a2a,2.8);car(40,12,0x4a4a50,2.6);
  V(40.8,-66,3.4,13,4.6,.7,0x2a2f36,'b','metal');V(40.8,-66,2.8,6,5.6,4.2,0x1b2028,'b');V(40.8,-60.4,3.5,2.2,3.4,.6,0xd7a82a,'b');
  /* shipping containers stacked east and south east beyond the fence */
  for(let i=0;i<6;i++){const c=[0x9a3a2a,0x3a5a6a,0x6b6a45,0x8a5a2a][i&3];V(32,-4+i*6.4,2.7,6.1,2.7,0,c,'b','rust');if(i%2==0)V(32,-4+i*6.4+.5,2.7,6,5.4,2.7,[0x3a5a6a,0x9a3a2a][(i>>1)&1],'b','rust')}
  /* rocky cliff and rubble to the south with scrub and a ruined shed */
  for(let r=0;r<40;r++){const x=(rnd()-.5)*70,z=36+rnd()*18,w=3+rnd()*7;V(x,z,w,w*.8,w*.7,-w*.2,0x8a7a62+((rnd()*20|0)<<8),'s')}
  for(let r=0;r<30;r++){const x=(rnd()-.5)*62,z=33+rnd()*14;V(x,z,.8+rnd(),.8+rnd(),.5+rnd()*.7,0,0x6a6a3a,'s')}
  V(24,40,6,5,3,0,0x9a7a52,'b','rust');V(24,40,6.4,5.4,3.3,3,0x5a3a28,'b','metal');V(-6,45,4,3,2.6,0,0x8a6a4a,'b','rust');
  /* palms near the south east corner and by the fence */
  const palm=(x,z)=>{V(x,z,.35,.35,5,0,0x6a4a2a,'c');for(let i=0;i<7;i++){const q=i/7*6.283;V(x+Math.cos(q)*1.1,z+Math.sin(q)*1.1,2.6,.35,5.4-Math.abs(Math.sin(q))*.2,5,0x4a6a2a,'b')}V(x,z,.7,.7,5.5,4.9,0x3a5a22,'s')};
  palm(36,28);palm(38,31);palm(-30,38);palm(33,-36);for(let i=0;i<8;i++){const q=rnd()*6.283;V(Math.cos(q)*60,Math.sin(q)*60,1.2,1.2,1.4,0,0x6a6a3a,'s')}
  /* fence posts and sagging mesh outside the play wall for atmosphere, warning signs and a gate */
  for(let i=-12;i<=12;i++){V(i*2.1,-30.3,.12,.12,2.6,0,0x6a6a6e,'b');V(i*2.1,30.3,.12,.12,2.6,0,0x6a6a6e,'b')}for(let i=-14;i<=14;i++){V(-26.3,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b');V(26.3,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b')}
  V(0,-30.4,5,.08,2.5,.2,0xc8362a,'b');V(-8,30.4,2.4,.08,1.6,.8,0xe8d040,'b');V(26.4,10,.08,2.4,1.6,.8,0xe8d040,'b');
  /* wrecked vehicle and drums west of the fence, a burnt-out bus on the north side */
  V(-30,-12,4.6,2.2,1.5,0,0x4a3f35,'b','rust');V(-30,-12,2.6,2,2.2,1.2,0x2a2a2e,'b');V(-4,-36,10,2.7,3,.3,0x6a5a3a,'b','rust');V(-4,-36,9.2,2.6,3.4,3,0x4a4a46,'b','metal');
  for(let i=0;i<5;i++)V(-29+i*.8,6+(i%2)*.7,.7,.7,1.05,0,i%2?0x8a2a1a:RUST,'c','rust');
  return o}};
;
/* ######## decay.js ######## */
/* ===================== decay.js ===================== */
/* ---------- Decay: an abandoned downtown, years after everyone left. Completely new layout.
   Boulevard east to west with a dry plaza at the crossing, an avenue north and south. Enterable buildings: Saint Aldric church with a ruined tower, Harlow Court apartments,
   a row of shops with a bank vault, the Meridian Hotel with a collapsed east wing and a rubble ramp to its second floor, a half built office skeleton, a parking deck with ramps,
   a market hall full of stalls, a metro entrance, a gas station with a canopy, a warehouse with a mezzanine and a derailed train on the boulevard.
   The play area is fenced (barrierLine: fence plus an invisible wall) and a whole ruined city continues beyond it. ---------- */
MAPS.Decay={d:'Abandoned downtown: ruined hotel, church, market hall, parking deck and a derailed train',H:52,open:1,sky:0x9aa5a3,gr:0x6a6a62,gt:'concrete',bc:0x9a968a,hemi:.8,hemiC:0xdfe6e4,hemiG:0x4a4a42,sunI:.5,sunC:0xf0ece0,fogF:125,
 fb:[[-38,1],[42,-2]],zn:[[-24,1],[-1,9],[24,-9]],tb:[-46,-46,46,46],
 inside:(x,z)=>Math.abs(x)<44&&Math.abs(z)<44,
 lights:[[18,5,-27,0xff3a2a,1.3,22],[-34,6,-30,0xa0c0ff,.9,22],[38,5,-10,0xffd080,1.0,24],[38,6,26,0xffe0b0,1.1,28],[-31,5,18,0xffd8a0,1.0,26],[-12,2.5,1,0xff7a3a,1.0,16],[16,4,-8,0xffb060,.7,16]],
 b(){const a=[],v=MAPS.Decay._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(5),CONC=0xa8a498,DCON=0x7d7a70,BRK=0x8a5a48,PLS=0xb9b09a,GRN=0x4a6a3a,DG=0x35502e,WOOD=0x6a5a44,BLK=0x1f2022,GLS=0x2a3a42;
  const pick=a_=>a_[rnd()*a_.length|0];
  /* ---------- props ---------- */
  const car=(x,z,hz,c,burnt)=>{const L=4.4,Wd=1.9,l=hz?L:Wd,d=hz?Wd:L;B(x,z,l,d,.95,0,burnt?0x2a2420:c,'concrete');B(x,z,hz?2.4:Wd-.1,hz?Wd-.1:2.4,1.5,.9,burnt?0x1b1816:c,'concrete');V(x,z,hz?2.2:Wd,hz?Wd:2.2,1.46,1.0,GLS,'g');for(const sx of[-1,1])for(const sz of[-1,1])V(x+(hz?sx*1.4:sz*.9),z+(hz?sz*.9:sx*1.4),.7,.7,.7,0,BLK,'c');if(burnt)V(x,z,l*.9,d*.9,1.0,.9,0x3a1a0c,'b','rust')},
   rub=(x,z,r,n,mx)=>{for(let i=0;i<n;i++){const q=rnd()*6.28,dd=rnd()*r,w=.7+rnd()*1.9,h=.3+rnd()*(mx||1.1);B(x+Math.cos(q)*dd,z+Math.sin(q)*dd,w,.7+rnd()*1.6,h,0,pick([CONC,DCON,BRK,PLS]),'concrete')}for(let i=0;i<n*2;i++){const q=rnd()*6.28,dd=rnd()*r*1.1;V(x+Math.cos(q)*dd,z+Math.sin(q)*dd,.3+rnd()*.9,.3+rnd()*.8,.25+rnd()*.4,0,pick([CONC,DCON,0x5a5448]),'s')}},
   tree=(x,z)=>{B(x,z,.5,.5,3.4,0,0x4a3f35,'plank');V(x,z,.7,.7,3.4,0,0x3a3028,'c');for(let i=0;i<6;i++){const q=i*1.05+rnd();V(x+Math.cos(q)*.9,z+Math.sin(q)*.9,1.8,.12,3.2+rnd()*1.4,3+rnd(),0x3a3028,'b')}},
   lamp=(x,z,bent)=>{V(x,z,.16,.16,5.4,0,0x3a3d40,'c');V(x+(bent?-.9:.7),z,1.6,.2,5.5,5.3,0x3a3d40,'b');if(!bent)V(x+1.4,z,.4,.25,5.3,5.15,0xd8d0a8,'e')},
   bench=(x,z,hz)=>{B(x,z,hz?1.8:.5,hz?.5:1.8,.5,0,WOOD,'plank');V(x+(hz?0:-.25),z+(hz?-.25:0),hz?1.8:.1,hz?.1:1.8,.95,.5,WOOD,'b','plank')},
   dump=(x,z,hz,c)=>{B(x,z,hz?2.2:1.2,hz?1.2:2.2,1.3,0,c||0x3a5a3a,'metal');V(x,z,hz?2.3:1.3,hz?1.3:2.3,1.38,1.3,0x2a2a2a,'b')},
   sand=(x,z,hz,L)=>{B(x,z,hz?L:1,hz?1:L,1.0,0,0xa8946a);V(x,z,hz?L+.1:1.1,hz?1.1:L+.1,1.1,.6,0x9a8660,'s')},
   jers=(x,z,hz,n)=>{for(let i=0;i<n;i++){const p=(i-(n-1)/2)*3.1,bx=hz?x+p:x,bz=hz?z:z+p;B(bx,bz,hz?3:.7,hz?.7:3,1.05,0,0xb5b0a2,'concrete')}},
   vine=(x,z,hz,L,h)=>{for(let i=0;i<Math.max(2,L/1.3|0);i++){const o=-L/2+rnd()*L,hh=1+rnd()*(h||5);V(hz?x+o:x,hz?z:z+o,hz?.5+rnd()*.7:.12,hz?.12:.5+rnd()*.7,hh,0,pick([GRN,DG,0x5a7a3a]),'b','grass')}},
   graf=(x,z,hz,L)=>{for(let i=0;i<3;i++){const o=(rnd()-.5)*L*.7;V(hz?x+o:x,hz?z:z+o,hz?.5+rnd()*1.5:.06,hz?.06:.5+rnd()*1.5,1.2+rnd()*1.2,.8,pick([0xc8362a,0x2a7ac8,0xe8c020,0x40c060,0xe8e8e8]),'b')}};
  const ops=(L,skip,lo,hi,step)=>{const r=[];for(let o=-L/2+2;o<L/2-1.3;o+=step||3.4){if(skip.some(([s,w])=>Math.abs(o-s)<Math.max(2.4,w)/2+1.1))continue;if(rnd()<.14)continue;r.push([o,1.3,lo,hi])}return r};
  /* generic building: walls per floor with windows, doors on the ground floor, floor slabs with stairwell holes, stairs, flat roof. o.col collapses the east end */
  const bld=o=>{const{x,z,w,d,fl=2,fh=3.6,t=.4,c=CONC,k='stucco',dr={},wlo=.9,whi=2.4,roof=1,rc=DCON,col=null,nowin=0,gl=0}=o,S=['n','s','w','e'],pos=s=>s=='n'?[x,z-d/2+t/2,1]:s=='s'?[x,z+d/2-t/2,1]:s=='w'?[x-w/2+t/2,z,0]:[x+w/2-t/2,z,0];
   for(let f=0;f<fl;f++){const y0=f*fh;for(const s of S){if(col&&col.side==s&&f>=col.wall)continue;const[px,pz,hz]=pos(s),len=hz?w:d-2*t,dd=(dr[s]||[]).filter(()=>f==0).map(([o,wd,ht])=>[o,Math.max(2.4,wd||2.4),0,ht||2.5]);
      const wn=nowin?[]:ops(len,(dr[s]||[]).map(([o,wd])=>[o,wd||1.8]),wlo,whi,3.4);MK.wall(B,hz,px,pz,len,t,y0,y0+fh,[...dd,...wn],c,k)}}
   /* floors */
   const stw=1.7,run=Math.ceil(fh/.3)*.55;
   for(let f=1;f<=fl;f++){const y=f*fh,last=f==fl;if(last&&!roof)continue;let sx=x,sw=w-2*t,sz=z,sd=d-2*t;if(col&&f>=col.slab){const dp=col.depth;sw-=dp;sx-=dp/2}
          if(!last||roof){const fl_=f-1,flight=(fl_%2==0)?'n':'s',zz=flight=='n'?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;
      MK.slab(B,sx,sz,sw,sd,y,y-.35,rc,'concrete',f-1>=0&&f<=fl&&!last?[x0+run/2,zz,run+.4,stw+.3]:null);if(f==fl)B(x,z,w+.3,d+.3,y+.3,y,rc,'concrete')}}
   /* stair flights: floor 0->1 along the north wall rising east, 1->2 along the south wall, ... (the hole above each flight is cut in the slab) */
   for(let f=0;f<fl-1;f++){const flight=(f%2==0)?'n':'s',zz=flight=='n'?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;MK.stairs(B,x0,zz,stw,Math.ceil(fh/.3),'e',DCON,'concrete',fh/Math.ceil(fh/.3),.55,f*fh)}
   /* weathering */
   for(const s of S){const[,,hz]=pos(s),len=hz?w:d;if(rnd()<.8)vine(hz?x:x+(s=='e'?1:-1)*(w/2+.1),hz?z+(s=='s'?1:-1)*(d/2+.1):z,hz,len*.8,fl*fh-1);if(rnd()<.4)graf(hz?x:x+(s=='e'?1:-1)*(w/2+.06),hz?z+(s=='s'?1:-1)*(d/2+.06):z,hz,len)}
   V(x,z,w-1,d-1,fl*fh+.7,fl*fh+.3,0x4a4a44,'b','concrete');for(let i=0;i<4;i++)V(x+(rnd()-.5)*w*.7,z+(rnd()-.5)*d*.7,.9+rnd()*1.3,.9+rnd()*1.3,fl*fh+1.1+rnd()*.8,fl*fh+.3,pick([0x5a5448,0x6a665a]),'b','concrete');
   if(gl)for(const s of S){const[px,pz,hz]=pos(s);for(let i=0;i<6;i++){const o=(rnd()-.5)*(hz?w:d)*.8;V(hz?x+o:px,hz?pz:z+o,hz?.7:.05,hz?.05:.7,.5,.0,0x8aa0a8,'g')}}};
  /* ====================== STREETS, GROUND ====================== */
  V(0,1,100,10,.06,0,0x4a4b4a,'b','asphalt');V(-1,-25,10,42,.06,0,0x4a4b4a,'b','asphalt');V(-1,27,10,42,.06,0,0x4a4b4a,'b','asphalt');
  for(const s of[-1,1])for(const[xx,zz,w,d]of[[0,1+s*5.6,100,2.2],[-1+s*5.6,-25,2.2,42],[-1+s*5.6,27,2.2,42]])V(xx,zz,w,d,.14,0,0x8a8678,'b','concrete');
  for(let i=-46;i<46;i+=5){V(i,1,2.6,.18,.07,0,0xd8c030,'b');V(-1,i<-4?i:i+8,.18,2.6,.07,0,0xd8c030,'b')}
  for(let i=0;i<5;i++){V(-1.6+i*.8,-4.6,.45,1.4,.07,0,0xe0e0d8,'b');V(-1.6+i*.8,6.6,.45,1.4,.07,0,0xe0e0d8,'b')}
  for(let i=0;i<28;i++){const x=(rnd()-.5)*88,z=(rnd()-.5)*88;V(x,z,2+rnd()*5,1+rnd()*4,.09,0,pick([GRN,DG,0x5a6a3a]),'b','grass')}
  for(let i=0;i<40;i++)V((rnd()-.5)*90,(rnd()-.5)*90,.14,2+rnd()*6,.075,0,0x2a2a2a,'b');
  for(let i=0;i<10;i++){const x=(rnd()-.5)*80,z=(rnd()-.5)*80;V(x,z,.8,.8,.08,0,0x1b1b1b,'c')}
  /* ====================== PLAZA ====================== */
  const fx=-1,fz=1;for(const s of[-1,1]){B(fx,fz+s*2.6,5.4,.5,.9,0,0x9a9688,'concrete');B(fx+s*2.6,fz,.5,5.4,.9,0,0x9a9688,'concrete')}B(fx,fz,1.2,1.2,2.6,0,0x8a8678,'concrete');V(fx,fz,1.6,1.6,.5,0,0x7a7a70,'c');V(fx,fz,4.4,4.4,.08,.1,0x3a4a38,'b','grass');V(fx,fz+1.6,.3,.3,3,2.6,0x6a6a60,'b');
  for(const[x,z,h]of[[3.5,-3,1],[-5.5,5.2,1],[3.8,5.3,1]])bench(x,z,h);tree(-4.4,-1.8);tree(2.6,4);rub(-6.6,3.8,2,4,.9);
  /* overturned bus */
  MK.room(B,{x:-15,z:1.2,w:10.6,d:2.8,h:2.7,c:0xb8a030,k:'rust',rc:0x8a7a24,rk:'rust',t:.2,dr:{n:[[-1.2,1.3,2.3]],s:[[2.4,1.3,2.3]]},wn:{n:[[-3.6,1.2],[1,1.2],[3.6,1.2]],s:[[-4.2,1.2],[-1.2,1.2],[4.2,1.2]]}});for(let i=0;i<4;i++)B(-18+i*2,1.2,.4,2,.7,0,0x4a3f35,'plank');
  /* news kiosk, bus shelter, phone booth, hydrants */
  B(-8,-3,2.4,1.6,2.4,0,0x6a2a2a,'rust');V(-8,-3,2.6,1.8,2.9,2.4,0x4a4a44,'b','metal');V(-8,-2.1,2,.06,2.1,1.2,GLS,'g');B(7,-3.5,3.6,.4,2.5,0,0x4a5a6a,'metal');B(8.7,-2.7,.2,1.4,2.5,0,0x4a5a6a,'metal');V(7,-2.5,3.8,1.8,2.7,2.5,0x3a4a5a,'b','metal');
  for(const[x,z]of[[-9,6.8],[9,6.8],[4.6,-4.8],[-6.4,-4.8]])V(x,z,.4,.4,.8,0,0xb03030,'c');
  /* ====================== CHURCH ====================== */
  const chx=-36,chz=-33;
  bld({x:chx,z:chz,w:16,d:20,fl:1,fh:9,t:.55,c:0x9a968a,k:'concrete',dr:{s:[[3,2.8,4.2]],e:[[-5,2.4,3.4]],w:[[2,2.2,3]]},wlo:2.2,whi:7,roof:0,nowin:0,gl:1});
  B(chx+4,chz-1,8.5,.2,.1,0,0x000000,'n');B(chx,chz-22.5+12.5+0,1,1,.1,0,0,'n');
  for(const z of[-6,-2.5,1,4.5])for(const s of[-1,1])B(chx+s*3.4,chz+z,2.6,.7,.95,0,WOOD,'plank');
  B(chx,chz-8.4,4.4,1.4,1.2,0,0x8a8678,'concrete');B(chx,chz-9.4,1,1,2.2,0,0x8a8678,'concrete');V(chx,chz-9.6,3.2,.2,6.8,3,0x4a2a24,'b');rub(chx-1,chz+3,3,7,1.2);
  /* roof: two broken slabs and trusses */
  B(chx-5,chz,6,20.4,9.4,9,0x5a5448,'concrete');B(chx+6,chz-6,4,8,9.4,9,0x5a5448,'concrete');for(let i=0;i<8;i++){V(chx,chz-9+i*2.6,16,.3,10.4,9.2,0x3a2f26,'b','plank')}
  /* bell tower, ruined */
  B(chx-6,chz-9,4.8,4.8,20,0,0x8a867a,'concrete');V(chx-6,chz-9,3.4,3.4,24,20,0x7a766a,'b','concrete');V(chx-6,chz-9,.9,.9,29,24,0x5a5448,'k');V(chx-6,chz-6.5,2.4,.1,17,12,0x1b1b1b,'b');V(chx-6,chz-6.5,1.6,.1,17,12.8,0x050505,'b');
  V(chx+8.1,chz,.2,5,7.5,4,0xc89a30,'g');V(chx+8.1,chz,.15,3.5,9.2,7.7,0x2a7ac8,'g');for(let i=0;i<5;i++)V(chx+8.15,chz-6+i*3,.2,1.2,7.4,2.6,0x1a1a1c,'g');
  /* ====================== HARLOW COURT (apartments) ====================== */
  bld({x:-17,z:-33,w:16,d:18,fl:3,fh:3.4,dr:{s:[[0,2.4,2.6]],w:[[4,1.8,2.5]],n:[[-4,1.8,2.5]]},c:BRK,k:'brick',rc:0x6a5a4a,col:{side:'e',wall:2,slab:2,depth:5}});
  rub(-8,-30,4,10,1.4);rub(-9.5,-37,2.5,5,.9);V(-17,-24.1,2.4,.2,3.6,3.4,0xc89a30,'g');
  /* ====================== SHOP ROW NORTH (z -20 .. -6) ====================== */
  for(const[,sx,wd,cl]of[[0,-39.5,9,0xa89a7a],[1,-29.5,9,0x9a8a8a],[2,-19.5,9,0x8a96a0],[3,-10.5,8,0xb0a088]])
   bld({x:sx,z:-13,w:wd,d:14,fl:2,fh:3.6,c:cl,k:'stucco',dr:{s:[[0,3.4,2.8]],n:[[-1.5,1.8,2.4]]},wlo:1.1,whi:2.5,rc:0x5a5448,gl:1});
  /* bank vault in the third shop */
  MK.room(B,{x:-19.5,z:-17.8,w:4,d:3.6,h:3,t:.6,c:0x6a6a70,k:'metal',roof:0,dr:{s:[[1.2,1.4,2.4]]}});V(-19.5,-15.9,1.5,.1,2.4,.2,0x8a8a92,'c','metal');B(-24,-8,.1,.1,.1,0,0,'n');
  /* ====================== HOTEL ====================== */
  bld({x:18,z:-30,w:20,d:24,fl:4,fh:3.6,c:0xb0a894,k:'stucco',dr:{s:[[-3,4.4,3.2],[5,1.8,2.5]],n:[[0,1.8,2.5]],w:[[-4,1.8,2.5]]},wlo:1,whi:2.6,rc:0x5a564c,col:{side:'e',wall:2,slab:2,depth:7},gl:1});
  /* rubble ramp up the east face to the first floor (12 steps of .3) */
  MK.stairs(B,29.2,-18.2,3.4,12,'n',DCON,'concrete',.3,.5,0);rub(31,-21,3,6,1.2);rub(25,-26,3,5,.9);
  /* lobby: desk, pillars, a fallen chandelier, lounge furniture; second floor rooms */
  B(14,-23,6,.9,1.15,0,0x4a3a2e,'plank');for(const px of[11,17,24])B(px,-26,.8,.8,3.6,0,0x9a968a,'concrete');V(20,-27,1.6,1.6,.6,.0,0xc8a040,'s');B(14,-34,4.2,.7,.5,0,0x6a2a2a,'plank');B(22,-33,3.6,1.1,.5,0,0x4a3a5a,'plank');
  for(let i=0;i<4;i++){B(12+i*2.8,-38.5,2.2,.12,3.4,0,0x6a5a46,'plank')}B(16.5,-32,1.7,1.7,3.6,0,0x5a5a62,'metal');B(16.5,-32,1.7,1.7,7.2,3.6,0x5a5a62,'metal');
  V(18,-18.1,6,.12,4,3.3,0xc8362a,'e');V(18,-18.1,5.6,.1,3.8,3.4,0x1b1b1c,'b');
  /* ====================== OFFICE SKELETON ====================== */
  const ox=38.5,oz=-35;for(let f=0;f<3;f++){const y=f*3.8;if(f>0){MK.slab(B,ox,oz,11,14,y,y-.4,0x8a867a,'concrete',f==1?[ox+3,oz-4.5,4.4,4.2]:[ox-3,oz+3,4,4])}}
  for(const px of[-4.6,0,4.6])for(const pz of[-6,-1.6,2.8,6.4])B(ox+px,oz+pz,.8,.8,11.4,0,0x8a867a,'concrete');B(ox+3.8,oz-5,3,3,11.4,0,0x7a766a,'concrete');MK.stairs(B,ox-5.2,oz-5.4,1.7,13,'e',DCON,'concrete',3.8/13,.55,0);MK.stairs(B,ox-5.2,oz+5.4,1.7,13,'e',DCON,'concrete',3.8/13,.55,3.8);
  MK.wall(B,1,ox,oz+6.9,11,.3,0,3.8,[[-3,3.2,0,2.6]],0x9a968a,'concrete');MK.wall(B,0,ox-5.6,oz,10,.3,3.8,7.6,[[0,4,.9,2.4]],0x9a968a,'concrete');
  for(let i=0;i<8;i++)V(ox-5+i*1.4,oz-6.8,.05,.05,12.5,11.4,0x5a3a2a,'b');V(ox,oz,12,15,11.5,11.4,0x2a2a2a,'b');rub(ox,oz+8.5,3,6,1.1);V(ox+1,oz+3,2.4,2.4,12.6,11.4,0xd7a82a,'b');
  /* ====================== PARKING DECK ====================== */
  const px0=38,pz0=-13;for(let f=1;f<3;f++)MK.slab(B,px0,pz0,14,20,f*3.2,f*3.2-.35,0x8a867a,'concrete',[px0-4.5,pz0+7.8,5.5,3.8]);
  for(const cx of[-5.5,0,5.5])for(const cz of[-8,-2.6,2.8,8])B(px0+cx,pz0+cz,.7,.7,6.4,0,0x8a867a,'concrete');
  for(let f=0;f<3;f++){const y=f*3.2;for(const s of[-1,1]){B(px0,pz0+s*9.8,14,.3,y+1.1,y,0x9a968a,'concrete');B(px0+s*6.8,pz0,.3,20,y+1.1,y,0x9a968a,'concrete')}}
  MK.stairs(B,px0-4.5-3.2,pz0+7.8,3.4,11,'e',DCON,'concrete',3.2/11,.58,0);MK.stairs(B,px0+5,pz0+7.8,3.2,11,'w',DCON,'concrete',3.2/11,.58,3.2);
  car(px0-2,pz0-4,1,0x4a5a6a,0);car(px0+2.5,pz0-4,1,0x6a2a2a,1);car(px0-2,pz0+1,1,0x9a9a8a,0);car(px0+1,pz0-4,0,0x2a4a2a,1);
  for(let f=1;f<3;f++){car(px0-3.5,pz0-5,1,pick([0x6a2a2a,0x4a5a6a,0x9a9a8a]),f==2);car(px0+2,pz0+2,1,0x3a3a3a,1)}
  /* ====================== MARKET HALL ====================== */
  const mx=-31,mz=18;bld({x:mx,z:mz,w:26,d:16,fl:1,fh:6,t:.45,c:0x9a8a6a,k:'stucco',dr:{n:[[-9,3.2,4],[0,3.2,4],[9,3.2,4]],e:[[-3,2.2,3]],w:[[-4,2.2,3]]},wlo:2.4,whi:4.8,roof:1,rc:0x5a4a38});
  for(let r=0;r<4;r++)for(let c=0;c<5;c++){if((r+c)%7==3)continue;const x=mx-9+c*4.6,z=mz-4.6+r*3.1;B(x,z,2.4,1.1,1.05,0,WOOD,'plank');V(x,z,2.9,1.8,2.6,2.1,pick([0xb8402a,0x2a6a8a,0xc89a30,0x4a8a4a,0x8a4a8a]),'b');V(x-1,z,.08,.08,2.1,0,0x3a3a3a,'b');V(x+1,z,.08,.08,2.1,0,0x3a3a3a,'b')}
  rub(mx+4,mz+4,3,8,1.3);V(mx,mz,26,16,6.4,6,0x3a3a34,'b');
  /* metro entrance */
  MK.room(B,{x:-11,z:13,w:6,d:7,h:3.4,c:0x6a7078,k:'concrete',rc:0x4a4e54,dr:{n:[[0,2.6,2.8]]},wn:{}});B(-11,12.6,4.6,2,1.9,0,0x4a4a4a,'concrete');V(-11,9.4,5.6,.2,4.2,3.0,0xff4a30,'e');V(-11,9.3,5.2,.12,4,3.2,0x1b1b1c,'b');
  /* ====================== SHOPS SOUTH ====================== */
  for(const[sx,cl]of[[-38.5,0x9a8a7a],[-26.5,0x8a9a90],[-14.5,0xa89a8a]])bld({x:sx,z:37,w:11,d:12,fl:2,fh:3.6,c:cl,k:'stucco',dr:{n:[[0,3.4,2.8]],s:[[-3,1.8,2.4]]},rc:0x5a5448,gl:1});
  /* ====================== GAS STATION ====================== */
  MK.room(B,{x:12,z:24,w:8,d:6,h:3.2,c:0xb8b0a0,k:'stucco',rc:0x5a5448,dr:{e:[[-.8,1.8,2.5]],n:[[2,1.8,2.5]]},wn:{s:[[-2,1.2],[2,1.2]],n:[[-2,1.2]]}});B(12,22.8,5.6,.7,1.1,0,0x4a4a44,'metal');
  for(const sx of[0,1])for(const sz of[0,1])B(20.4+sx*7.2,13+sz*8,.7,.7,4.4,0,0x9a968a,'concrete');B(24,17,10,11.4,4.75,4.4,0xb03a2a,'metal');V(24,17,10.4,11.8,4.9,4.75,0xd8d0c0,'b','metal');
  for(const z of[14,20])for(const x of[21.2,26.8]){B(x,z,.6,1.2,1.3,0,0xb03a2a,'metal');V(x,z,.7,1.3,1.5,1.3,0x2a2a2a,'b')}car(24,16.5,0,0x3a5a7a,1);car(30,28,1,0x2a2a2a,1);V(31,10.5,.5,.5,10,0,0x3a3a3e,'c');V(31,10.5,3.2,.4,12.4,9,0xe8c020,'e');
  /* ====================== WAREHOUSE ====================== */
  const wx=38,wz=26;bld({x:wx,z:wz,w:14,d:30,fl:1,fh:8,t:.45,c:0x6a7078,k:'metal',dr:{w:[[-8,4,4.2],[6,4,4.2]],s:[[0,2.2,3]]},wlo:5.5,whi:7,roof:1,rc:0x4a4e54});
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){if(c==1)continue;B(wx+1.5+r*2.6,wz-11+c*5.4,.9,4.6,3.6,0,0x8a5a2a,'metal');V(wx+1.5+r*2.6,wz-11+c*5.4,1,4.7,3.7,3.6,0x6a4a2a,'b')}
  B(wx+5.2,wz,2.6,24,4.3,4,0x5a5e64,'metal');MK.stairs(B,wx+3.8,wz+11.6,1.6,14,'n',DCON,'concrete',4/14,.58,0);B(wx-4,wz-8,2.4,6,2.6,0,0x9a3a2a,'rust');B(wx-4,wz+6,2.4,6,2.6,0,0x3a5a6a,'rust');B(wx-3,wz-12.5,1.3,2.4,1.7,0,0xc8a030,'metal');
  /* ====================== DERAILED TRAIN ====================== */
  const trainCar=(x0,len,c)=>{MK.room(B,{x:x0+len/2,z:1,w:len,d:3.2,h:3.6,c,k:'rust',rc:0x3a3a3e,rk:'metal',t:.25,dr:{n:[[-2.5,1.5,2.6],[2.5,1.5,2.6]],s:[[0,1.5,2.6]]},wn:{n:[[-5,1.2],[0,1.2],[5,1.2]],s:[[-5,1.2],[-2.5,1.2],[2.5,1.2],[5,1.2]]}});for(let i=0;i<5;i++)B(x0+1.6+i*2,.1,1.1,.5,.6,0,0x4a3a2e,'plank');V(x0+len/2,1,len,3.4,.7,.6,0x1b1b1b,'b')};
  trainCar(10,11.6,0x5a6a7a);trainCar(22.4,11.6,0x7a4a3a);MK.room(B,{x:37.2,z:1,w:6.4,d:3.4,h:3.8,c:0x2a3a4a,k:'metal',rc:0x2a2a2e,t:.3,dr:{w:[[0,1.5,2.6]]},wn:{n:[[1,1.4]],s:[[1,1.4]]}});V(37.2,1,6.4,3.5,4.5,3.8,0x1a1a1c,'b');
  /* ====================== STREET LIFE: cars, wrecks, barricades, trees, lamps, trash ====================== */
  car(-33,-2.2,1,0x6a2a2a,0);car(-28,3.8,1,0x2a4a6a,1);car(-22,-2,1,0x8a8a7a,0);car(-5,-1.8,1,0x3a3a3a,1);car(6,3.8,1,0x5a2a2a,0);car(40,3.8,1,0x4a4a3a,1);car(-1.6,-12,0,0x6a6a2a,0);car(.4,-22,0,0x2a2a2a,1);car(-2,-33,0,0x5a3a2a,0);car(-1.2,15,0,0x4a5a3a,1);car(-2,24,0,0x7a2a2a,0);car(.2,35,0,0x2a3a5a,1);
  car(-6.6,-30,0,0x8a8a6a,0);car(4.3,-38,0,0x3a3a3a,1);car(-8,28,1,0x3a5a3a,1);car(4,32,1,0x6a6a6a,0);car(-44,10,0,0x4a4a4a,1);
  jers(-9.5,-4.6,1,2);jers(7.5,6.6,1,2);jers(-4.4,-18.5,1,1);jers(2.6,-18.5,1,1);jers(-4.4,20.5,1,1);jers(2.6,20.5,1,1);sand(-4,-6,1,5);sand(6,8.4,1,6);sand(-6.2,12,0,5);sand(4.2,-14,0,5);
  for(const[x,z]of[[-42,-2],[-35,-5.6],[-24,-5.8],[-12,-5.8],[10,-5.5],[27,-5.7],[41,-5.6],[-42,8],[-26,8.2],[10,8.4],[34,8.4],[-8,22],[-8,-24],[7,-8],[7,28],[-8,36]])tree(x,z);
  for(const[x,z,b]of[[-42,-4.6,0],[-30,-4.6,1],[-18,-4.6,0],[-6.8,-4.6,0],[6.4,-4.6,1],[20,-4.6,0],[34,-4.6,0],[-42,7,0],[-30,7,1],[-12,7,0],[6.4,7,0],[20,7,1],[34,7,0],[-6.4,-18,0],[4.4,-26,1],[-6.4,26,0],[4.4,18,0]])lamp(x,z,b);
  for(const[x,z,h,c]of[[-6.9,-9,0,0x3a5a3a],[-6.9,-30,0,0x3a5a3a],[6,-19.6,1,0x2a4a6a],[4.6,29,0,0x3a5a3a],[-20,6.8,1,0x2a4a6a],[-44,-7,0,0x5a3a2a],[-9,24,1,0x3a5a3a],[30,7,1,0x5a3a2a]])dump(x,z,h,c);
  for(let i=0;i<10;i++){const x=(rnd()-.5)*84,z=(rnd()-.5)*84;if(!a.some(b=>b[4]>.4&&b[5]<1&&x>b[0]-b[2]/2-1.2&&x<b[0]+b[2]/2+1.2&&z>b[1]-b[3]/2-1.2&&z<b[1]+b[3]/2+1.2))rub(x,z,2,4+(i&3),.8)}
  for(const[x,z]of[[-1,-8],[-1,-27],[-1,12],[-1,30],[-20,1],[22,-1]])rub(x,z,2.4,5,.7);
  for(let i=0;i<8;i++){const x=-42+rnd()*84,z=-4+rnd()*10;V(x,z,.6,.5,.3,0,pick([0xc8c8c0,0x8a8a80,0x7a5a3a]),'b')}
  /* fence around the play area, then the city continues */
  const F=45.8;barrierLine(a,-F,-F,F,-F,0);barrierLine(a,-F,F,F,F,1);barrierLine(a,-F,-F,-F,F,2);barrierLine(a,F,-F,F,F,0);
  return a},
 /* ---------- the ruined city beyond the fence ---------- */
 deco(){const o=[],rnd=MK.rnd(41),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=a=>a[rnd()*a.length|0],GL=0x1c2a34,W=[0x8a867a,0x7a7a74,0x9a9488,0x6f7068,0x8c8274];
  /* ruined towers in rings: window grids with missing panes, ragged tops, rebar, balconies */
  const tower=(x,z,w,d,h,c)=>{V(x,z,w,d,h,0,c,'b','concrete');const rows=Math.floor(h/3.4),cols=Math.max(2,Math.floor(w/2.6)),cd=Math.max(2,Math.floor(d/2.6));
   for(let r=1;r<rows;r++){for(let i=0;i<cols;i++){if(rnd()<.18)continue;const px=x-w/2+(i+.5)*w/cols;V(px,z+d/2+.05,1.4,.1,r*3.4+2.3,r*3.4+.8,rnd()<.2?0x0a0a0c:GL,'g');if(rnd()<.45)V(px,z-d/2-.05,1.4,.1,r*3.4+2.3,r*3.4+.8,GL,'g')}
     for(let i=0;i<cd;i++){if(rnd()<.2)continue;const pz=z-d/2+(i+.5)*d/cd;V(x+w/2+.05,pz,.1,1.4,r*3.4+2.3,r*3.4+.8,GL,'g');if(rnd()<.4)V(x-w/2-.05,pz,.1,1.4,r*3.4+2.3,r*3.4+.8,GL,'g')}
     if(rnd()<.3)V(x,z+d/2+.5,w*.8,1,r*3.4+.2,r*3.4,0x6a665a,'b','concrete')}
   for(let i=0;i<4;i++)V(x+(rnd()-.5)*w*.8,z+(rnd()-.5)*d*.8,w*.3,d*.3,h+1+rnd()*3.5,h,c,'b','concrete');for(let i=0;i<5;i++)V(x+(rnd()-.5)*w,z+(rnd()-.5)*d,.08,.08,h+1.6+rnd()*2,h,0x6a3a24,'b');
   if(rnd()<.5){V(x+w/2,z,w*.15,d*.6,h*.6,h*.3,0x0a0a0c,'b')}for(let i=0;i<3;i++)V(x+(rnd()-.5)*w,z+d/2+.04,.5+rnd()*1.4,.05,h*.9,rnd()*h*.7,pick([GRN_,DG_]),'b','grass')};
  const GRN_=0x4a6a3a,DG_=0x35502e;
  for(let i=0;i<30;i++){const q=i/30*6.283+rnd()*.15,d=62+rnd()*45,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<50&&Math.abs(z)<50)continue;tower(x,z,9+rnd()*10,9+rnd()*10,16+rnd()*48,pick(W))}
  for(let i=0;i<22;i++){const q=rnd()*6.283,d=52+rnd()*22,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<49&&Math.abs(z)<49)continue;tower(x,z,7+rnd()*8,7+rnd()*8,6+rnd()*14,pick(W))}
  /* rubble fields between the towers and the fence, overgrown with grass and dead trees */
  for(let i=0;i<130;i++){const x=(rnd()-.5)*140,z=(rnd()-.5)*140;if(Math.abs(x)<48&&Math.abs(z)<48)continue;const r=1+rnd()*3.5;V(x,z,r*1.6,r*1.3,r*.5,0,pick([0x7a766a,0x6a665a,0x8a8478,0x5a5448]),'s')}
  for(let i=0;i<50;i++){const x=(rnd()-.5)*130,z=(rnd()-.5)*130;if(Math.abs(x)<48&&Math.abs(z)<48)continue;V(x,z,3+rnd()*7,2+rnd()*5,.12,0,pick([GRN_,DG_,0x5a6a3a]),'b','grass')}
  const dt=(x,z)=>{V(x,z,.6,.6,5,0,0x3a3028,'c');for(let i=0;i<5;i++){const q=i*1.3+rnd();V(x+Math.cos(q)*1.2,z+Math.sin(q)*1.2,2.2,.14,4.6+rnd()*2,4+rnd(),0x3a3028,'b')}};
  for(let i=0;i<40;i++){const x=(rnd()-.5)*130,z=(rnd()-.5)*130;if(Math.abs(x)<49&&Math.abs(z)<49)continue;dt(x,z)}
  /* elevated highway on pillars north of the city with a collapsed span */
  for(let i=-6;i<=6;i++){V(i*14,-62,2.2,2.2,9,0,0x7a766a,'b','concrete');if(i!=2&&i!=3)V(i*14+7,-62,12,9,10.4,9,0x6a665a,'b','concrete');V(i*14+7,-62,12.2,.5,11.4,10.4,0x8a867a,'b','concrete');V(i*14+7,-57.6,12.2,.4,11.2,10.4,0x6a665a,'b')}
  V(34,-62,7,8,5,0,0x5a5448,'s');V(37,-60,6,7,4,0,0x6a665a,'s');V(30.4,-62,5,7,10,9.2,0x6a665a,'b','concrete');
  /* train gantry crane and a water tower to the south, billboard to the west */
  V(-30,70,1.4,1.4,34,0,0x8a5a2a,'b','rust');V(-30,70,1.4,1.4,34,0,0x8a5a2a,'b','rust');V(-10,70,1.4,1.4,34,0,0x8a5a2a,'b','rust');V(-20,70,22,1.6,34,32.4,0x8a5a2a,'b','rust');V(-20,70,1,1,32,26,0x5a5a60,'b');V(-20,70,3,2.4,26,23,0x4a4a44,'b','metal');
  for(const sx of[-1,1])for(const sz of[-1,1])V(60+sx*3,-4+sz*3,.5,.5,16,0,0x5a4a3a,'b','rust');V(60,-4,9.4,9.4,22,16,0x6a5a4a,'c','rust');V(60,-4,9.6,9.6,.5,16,0x3a2a22,'c');V(60,-4,9.8,9.8,24.5,22,0x5a4a3a,'k');
  V(-58,-12,.6,.6,10,0,0x4a4a4a,'b');V(-58,12,.6,.6,10,0,0x4a4a4a,'b');V(-58,0,.5,26,16,9.6,0x2a3a4a,'b');V(-58.4,0,.1,22,15,10.4,0x4a6a8a,'b');V(-58.5,-6,.1,3,13,11,0xc8362a,'b');V(-58.5,5,.1,6,12.5,11.5,0xe8c020,'b');
  /* the continuation of the streets beyond the fence, wrecks in them, a bus, bridge pieces and smoke columns */
  V(0,-80,10,70,.06,0,0x4a4b4a,'b','asphalt');V(0,80,10,70,.06,0,0x4a4b4a,'b','asphalt');V(-80,1,70,10,.06,0,0x4a4b4a,'b','asphalt');V(80,1,70,10,.06,0,0x4a4b4a,'b','asphalt');
  for(let i=0;i<22;i++){const t=i%4,d=52+rnd()*30,s=(rnd()<.5?-1:1),x=t==0?(rnd()-.5)*5:t==1?(rnd()-.5)*5:s*d,z=t==0?s*d:t==1?-s*d:1+(rnd()-.5)*5;V(x,z,t<2?1.9:4.4,t<2?4.4:1.9,1.2,0,pick([0x3a3a3a,0x5a2a2a,0x3a4a5a,0x4a4a3a]),'b','rust');V(x,z,t<2?1.7:2.2,t<2?2.2:1.7,1.8,1.1,0x1f2a30,'b')}
  V(-70,40,14,3,3.4,0,0x9a8a30,'b','rust');V(-70,40,13,2.8,3.8,3.4,0x8a7a24,'b','rust');V(60,-30,3,13,3,0,0x2a4a6a,'b','rust');
  for(let i=0;i<4;i++){const x=(rnd()-.5)*140,z=(rnd()-.5)*140;if(Math.abs(x)<60&&Math.abs(z)<60)continue;for(let k=0;k<8;k++)V(x+Math.sin(k)*.5,z+Math.cos(k*2)*.5,2+k*.6,2+k*.6,10+k*8,6+k*8,0x555a58,'s')}
  /* a ring of the playable area's own streets: guard rail posts and warning tape outside the fence */
  for(let i=-22;i<=22;i++){V(i*2.1,-46.7,.12,.12,2.6,0,0x6a6a6e,'b');V(i*2.1,46.7,.12,.12,2.6,0,0x6a6a6e,'b');V(-46.7,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b');V(46.7,i*2.1,.12,.12,2.6,0,0x6a6a6e,'b')}
  for(const[x,z,hz]of[[0,-46.9,1],[20,46.9,1],[-46.9,-12,0],[46.9,18,0]])V(x,z,hz?5:.08,hz?.08:5,2.5,.2,0xe8d040,'b');
  return o}};
;
/* ######## maps2.js ######## */
/* ===================== maps2.js ===================== */
/* ---------- Blockfort, Pillars and Canyon, rebuilt from scratch as detailed, lived-in places (they replace the old simple versions):
   Blockfort: a medieval castle with a keep, gatehouse, barracks, chapel, smithy, stables and market, with a countryside around it.
   Pillars:   a ruined Roman forum with colonnades, an amphitheatre, a temple, baths, a triumphal arch and cypress hills.
   Canyon:    a winding mining gorge with a trestle bridge, a mill, a mine tunnel, a water tower, rail carts, saloon and ledges you can climb. ---------- */
/* multi storey building: walls with windows per floor, door gaps on the ground floor, slabs with a stairwell hole, stairs between floors, roof slab */
function multi(B,o){const{x,z,w,d,fl=2,fh=3.6,t=.45,c,k='stucco',rc,rk,dr={},wn={},roof=1,wlo=1.1,whi=2.4,step=3.4}=o,S=['n','s','w','e'],
 pos=s=>s=='n'?[x,z-d/2+t/2,1,w]:s=='s'?[x,z+d/2-t/2,1,w]:s=='w'?[x-w/2+t/2,z,0,d-2*t]:[x+w/2-t/2,z,0,d-2*t];
 for(let f=0;f<fl;f++){const y0=f*fh;for(const s of S){const[px,pz,hz,len]=pos(s),dd=f==0?(dr[s]||[]).map(([q,wd,ht])=>[q,Math.max(2.4,wd||2.4),0,ht||2.5]):[],ww=[];if(wn[s]!==0){for(let q=-len/2+2;q<len/2-1.3;q+=step){if((dr[s]||[]).some(([a,b])=>f==0&&Math.abs(q-a)<Math.max(2.4,b||2.4)/2+1.1))continue;ww.push([q,1.2,wlo,whi])}}MK.wall(B,hz,px,pz,len,t,y0,y0+fh,[...dd,...ww],c,k)}}
 const stw=1.7,n=Math.ceil(fh/.3),run=n*.55;
 for(let f=1;f<=fl;f++){const y=f*fh,fl_=f-1,north=fl_%2==0,zz=north?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;if(f<fl)MK.slab(B,x,z,w-2*t,d-2*t,y,y-.35,rc||c,'concrete',[x0+run/2,zz,run+.4,stw+.3]);else if(roof)B(x,z,w+.3,d+.3,y+.3,y-.1,rc||c,rk||'concrete')}
 for(let f=0;f<fl-1;f++){const north=f%2==0,zz=north?z-d/2+t+stw/2+.1:z+d/2-t-stw/2-.1,x0=x-w/2+t+.3;MK.stairs(B,x0,zz,stw,n,'e',rc||c,'concrete',fh/n,.55,f*fh)}}
var EDGE=(a,x0,z0,x1,z1,h,c,k,t=1.2)=>{const hz=Math.abs(x1-x0)>=Math.abs(z1-z0),L=hz?Math.abs(x1-x0):Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;a.push([cx,cz,hz?L:t,hz?t:L,h,0,c,k]);a.push([cx,cz,hz?L:t,hz?t:L,14,0,0,'n'])};

/* =============================== BLOCKFORT =============================== */
MAPS.Blockfort={d:'Medieval castle: keep, gatehouse, barracks, chapel, smithy, stables and a market court',H:40,open:1,sky:0x9ec9ea,gr:0x5f7f48,gt:'grass',bc:0x9a958a,hemi:.9,hemiC:0xf4f8ff,hemiG:0x4a5a3a,sunI:.95,sunC:0xfff4dc,fogF:140,
 fb:[[-27,5],[26,0]],zn:[[-21,8],[0,-9],[21,9]],tb:[-35,-30,35,30],inside:(x,z)=>Math.abs(x)<32&&Math.abs(z)<27.5,
 lights:[[-24,2.6,17,0xff7a2a,1.5,16],[18,5,-6,0xffc070,.9,18],[-20,5,-12,0xffc070,.9,18],[0,3.6,26,0xffa040,1.0,14],[0,3.6,-26.5,0xffa040,.8,14],[26,4.5,12,0xffd9a0,.8,14]],
 b(){const a=[],v=MAPS.Blockfort._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(3),pick=q=>q[rnd()*q.length|0],
  STN=0x9a958a,DST=0x7a766c,WD=0x6a4a30,RF=[0x8a3a2a,0x6a4a3a,0x5a5a60],COL=[0xb83a2a,0x2a5aa8,0xd8a020,0x3a8a4a,0x7a3a8a];
  const barrel=(x,z)=>{B(x,z,.8,.8,1.1,0,WD,'plank');V(x,z,.85,.85,1.1,0,WD,'c','plank');V(x,z,.9,.9,.1,.3,0x2a2a2a,'c');V(x,z,.9,.9,.1,.8,0x2a2a2a,'c')},
   crate=(x,z,s)=>{B(x,z,s,s,s*.9,0,0x8a6a3a,'plank')},hay=(x,z)=>{B(x,z,1.5,1,.9,0,0xc8a850,'plank');V(x,z,1.6,1.1,.95,0,0xd8b860,'b','plank')},
   torch=(x,z,h=2.4)=>{V(x,z,.12,.12,h,0,WD,'c');V(x,z,.3,.3,h+.5,h,0xff8a30,'e');V(x,z,.15,.15,h+.9,h+.4,0xffd060,'k')},
   banner=(x,z,hz,c,h=4.4)=>{V(x,z,.14,.14,h+.9,0,WD,'c');V(x+(hz?0:.34),z+(hz?.34:0),hz?.9:.06,hz?.06:.9,h,h-2,c,'b')},
   tree=(x,z,s=1)=>{B(x,z,.7,.7,2.4*s,0,0x5a4030,'plank');V(x,z,.8,.8,2.6*s,0,0x5a4030,'c');V(x,z,4*s,4*s,5.4*s,1.8*s,0x3f7a34,'s');V(x+.8,z+.6,3*s,3*s,6*s,3*s,0x4f8a3c,'s')},
   stall=(x,z,c)=>{B(x,z,2.6,1.1,1.0,0,WD,'plank');for(const s of[-1,1])V(x+s*1.2,z-.4,.1,.1,2.4,0,WD,'b');V(x,z-.1,2.9,1.8,2.7,2.35,c,'b');V(x,z,2.2,.9,1.18,1,pick(COL),'b'),V(x-.5,z,.4,.4,1.3,1,0xc83a2a,'s'),V(x+.5,z,.4,.4,1.3,1,0xe0c040,'s')},
   dummy=(x,z)=>{V(x,z,.14,.14,1.8,0,WD,'c');V(x,z,.8,.14,1.5,1.3,WD,'b');V(x,z,.4,.4,2.1,1.7,0xc8b080,'s');B(x,z,.4,.4,1.8,0,WD,'plank')},
   cart=(x,z,hz)=>{B(x,z,hz?2.6:1.6,hz?1.6:2.6,.9,.4,WD,'plank');for(const s of[-1,1])V(x+(hz?0:s*.9),z+(hz?s*.9:0),hz?1:.14,hz?.14:1,1,0,0x3a2a1a,'c');V(x,z,hz?2.4:1.4,hz?1.4:2.4,1.2,.9,0xc8a850,'b','plank')};
  /* ground: cobbled courts, dirt tracks, grass tufts, puddles */
  V(0,0,62,52,.07,0,0x8a8070,'b','cobble');V(0,27.5,8,6,.08,0,0x6a5a46,'b','concrete');V(0,36,6,18,.06,0,0x7a6a50,'b','concrete');V(36,-3,16,6,.06,0,0x7a6a50,'b','concrete');
  for(let i=0;i<30;i++)V((rnd()-.5)*58,(rnd()-.5)*48,.8+rnd()*2,.8+rnd()*2,.08,0,pick([0x4a6a3a,0x5a7a40]),'b','grass');for(let i=0;i<8;i++)V((rnd()-.5)*50,(rnd()-.5)*40,1.5+rnd(),1+rnd(),.075,0,0x4a5a68,'s');
  /* curtain wall: stone, 4 m high, with four gates; crenellations, buttresses and a wall walk on the inside of the north and west walls */
  const wallLine=(x0,z0,x1,z1,gaps)=>{const hz=z0==z1,L=hz?x1-x0:z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;MK.wall(B,hz,cx,cz,L,1.4,0,4.2,gaps.map(g=>[g[0],g[1],0,g[2]||4.2]),STN,'brick');
   B(cx,cz,hz?L:1.4,hz?1.4:L,14,0,0,'n');for(let q=-L/2+1;q<L/2;q+=2.2){if(gaps.some(g=>Math.abs(q-g[0])<g[1]/2+.6))continue;V(hz?cx+q:cx,hz?cz:cz+q,hz?1.1:1.5,hz?1.5:1.1,5.0,4.2,STN,'b','brick')}for(let q=-L/2+3;q<L/2;q+=7){if(gaps.some(g=>Math.abs(q-g[0])<g[1]/2+1.2))continue;V(hz?cx+q:cx,hz?cz:cz+q,hz?1.2:2.4,hz?2.4:1.2,3.6,0,DST,'b','brick')}};
  wallLine(-33,-28,33,-28,[[-13,2.6],[10,0.01]]);wallLine(-33,28,33,28,[[0,6]]);wallLine(-33,-28,-33,28,[[11.5,2.8]]);wallLine(33,-28,33,28,[[0,5.2]]);
  /* gate arches and gate towers */
  B(0,28,6.4,1.4,8.4,5.2,STN,'brick');for(const s of[-1,1]){multi(B,{x:s*6.6,z:25.8,w:5,d:5,fl:2,fh:4,c:STN,k:'brick',rc:DST,dr:{n:[[0,1.8,2.5]]},wn:{s:0,w:0,e:0}});V(s*3.2,28.9,.3,.3,4.4,1.1,0x3a3a3e,'b','metal')}for(let i=-3;i<=3;i++)V(i*.8,28.8,.1,.1,5,0,0x2a2a2e,'b');V(0,28.8,6,.1,5.2,5,0x2a2a2e,'b');
  B(33,0,1.4,5.4,7.6,4.6,STN,'brick');for(const s of[-1,1])multi(B,{x:30.6,z:s*5.8,w:5,d:5,fl:2,fh:4,c:STN,k:'brick',rc:DST,dr:{w:[[0,1.8,2.5]]},wn:{e:0,n:0,s:0}});
  /* corner towers (two floors, stair, walkable roof with crenels) */
  for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*31,z=sz*26;multi(B,{x,z,w:7,d:7,fl:2,fh:4.2,c:DST,k:'brick',rc:STN,dr:{[sz>0?'n':'s']:[[0,1.8,2.5]]},wn:{}});for(let i=0;i<8;i++)V(x+(i<4?-3.4+i*2.27:(i%2?3.4:-3.4)),z+(i<4?(i%2?3.4:-3.4):-3.4+(i-4)*2.27),1,1,9.4,8.7,DST,'b','brick');V(x,z,.4,.4,12,8.7,WD,'c');V(x+.8,z,1.5,.06,11.8,10.6,COL[(sx+sz+2)%5],'b')}
  /* wall walks: platform behind the north and west walls, reached by stairs at the corners */
  B(-4,-26,50,2.6,3.4,3.0,0x8a7a5a,'plank');MK.stairs(B,-29,-26,1.8,10,'e',STN,'concrete',.3,.6,0);B(-31.4,-8,2.6,36,3.4,3.0,0x8a7a5a,'plank');MK.stairs(B,-31.4,17,1.8,10,'n',STN,'concrete',.3,.6,0);
  /* keep: raised on a stepped plinth, three floors, battlements */
  const kx=20,kz=-14;for(let i=0;i<3;i++)B(kx,kz,22-i*1.4,18-i*1.4,.28*(i+1),0,STN,'concrete');multi(B,{x:kx,z:kz,w:15,d:12,fl:3,fh:4,c:STN,k:'brick',rc:DST,dr:{s:[[-2,2.8,3.4],[4,1.8,2.5]],w:[[0,1.8,2.5]]},wn:{},wlo:1.6,whi:3});
  for(let i=0;i<14;i++)V(kx-7.5+i*1.15,kz-6,.9,.5,13.8,13.1,DST,'b','brick');for(let i=0;i<14;i++)V(kx-7.5+i*1.15,kz+6,.9,.5,13.8,13.1,DST,'b','brick');V(kx,kz,3,.2,15,12,0xb83a2a,'b');banner(kx+8,kz+3,0,0xb83a2a,10);banner(kx-8,kz-3,0,0x2a5aa8,10);B(kx-2,kz,2,5,1.1,0,WD,'plank');B(kx+3,kz+1,1.4,1.4,1.0,0,WD,'plank');
  /* barracks (west), second barracks, great hall with a long table */
  multi(B,{x:-21,z:-17,w:14,d:8,fl:2,fh:3.6,c:0xa89a7a,k:'stucco',rc:RF[0],rk:'shingle',dr:{s:[[-3,1.8,2.5],[3,1.8,2.5]]}});multi(B,{x:-21,z:-6,w:14,d:7,fl:2,fh:3.6,c:0xa8987a,k:'stucco',rc:RF[1],rk:'shingle',dr:{n:[[-2,1.8,2.5]],s:[[3,1.8,2.5]]}});
  for(let i=0;i<4;i++){B(-25+i*3.3,-17,.9,2,.6,0,WD,'plank')}B(-21,-6,8,1.1,.95,0,WD,'plank');V(-21,-6,8.4,1.4,.1,.95,0x6a5a48,'b','plank');
  /* chapel with bell cote */
  multi(B,{x:22,z:14,w:9,d:13,fl:1,fh:6.4,c:0xb0a890,k:'stucco',rc:RF[2],rk:'shingle',dr:{n:[[0,2.4,3.6]]},wlo:2.2,whi:5});B(22,19.5,1.2,.7,1.0,0,STN,'concrete');for(let i=0;i<3;i++){B(19.4,15+i*1.6,1.6,.6,.8,0,WD,'plank');B(24.6,15+i*1.6,1.6,.6,.8,0,WD,'plank')}V(22,8,1,1,10,7.6,STN,'b','brick');V(22,8,.5,.5,9.6,8.4,0xc8a030,'s');V(22,7.4,.3,.3,12,10,0xc0c0c0,'b');
  /* smithy with a glowing forge, open front, anvil and weapon racks */
  B(-24,17,9,.4,3,0,WD,'plank');B(-28.3,19.5,.4,5.6,3,0,WD,'plank');B(-19.7,19.5,.4,5.6,3,0,WD,'plank');B(-24,19.5,9.4,6.4,3.4,3,RF[0],'shingle');B(-27,20.5,2.2,1.6,1.1,0,0x5a5650,'brick');V(-27,20.5,1.4,.8,1.1,1.0,0xff5a20,'e');B(-23,20,.9,.6,.9,0,0x2a2a2e,'metal');B(-21,21,.8,.8,.7,0,0x4a4a4a,'concrete');V(-24,17.3,.1,2,2.4,.8,0x6a6a70,'b','metal');
  /* stables: roof on posts, stall dividers and hay */
  B(-5,18.5,15,5.6,3.6,3.2,RF[1],'shingle');for(let i=0;i<6;i++){B(-11.5+i*2.5,16,.3,.3,3.2,0,WD,'plank');B(-11.5+i*2.5,21,.3,.3,3.2,0,WD,'plank')}for(let i=1;i<5;i++)B(-11.5+i*2.5,19.8,.12,3.2,1.2,0,WD,'plank');B(-5,22,15,.3,1.6,0,WD,'plank');hay(-9,20.6);hay(-4,20.8);hay(1,20.4);
  /* market court: stalls, a well, carts, barrels, hay, a fountain-plinth in the centre */
  const wx=0,wz=-4;for(const s of[-1,1]){B(wx+s*1.6,wz,.5,3.4,1.0,0,STN,'concrete');B(wx,wz+s*1.6,3.4,.5,1.0,0,STN,'concrete')}V(wx,wz,2.6,2.6,.1,.1,0x2a4a68,'b');V(wx-1.6,wz-1.6,.2,.2,3.4,0,WD,'b');V(wx+1.6,wz-1.6,.2,.2,3.4,0,WD,'b');V(wx,wz-1.6,3.6,.2,3.6,3.2,WD,'b');V(wx,wz,3.8,2.6,3.9,3.5,RF[0],'b','shingle');
  for(let i=0;i<4;i++)B(wx,wz,9-i*1.4,9-i*1.4,.2*(i+1),0,0x8a8576,'concrete');
  stall(-8,2,COL[0]);stall(-4,5,COL[1]);stall(4,5,COL[2]);stall(8,2,COL[3]);stall(-9,-8,COL[4]);stall(9,-8,COL[1]);cart(-12,3,1);cart(12,4,0);cart(-3,-12,1);
  for(const[x,z]of[[-12,-11],[12,-12],[-6,9],[6,9],[-2,-12.8],[3.4,-12],[26,6],[-26,10],[-14,12]])barrel(x,z);for(const[x,z,s]of[[-13,9,1.2],[13,9.6,1.3],[28,-12,1.4],[-28,-12,1.2],[3,13,1.4],[-8,-12,1.1]])crate(x,z,s);for(const[x,z]of[[-12,6.5],[-13.5,6],[10,-10],[11.5,-10.6],[27,3],[-4.5,22.5]])hay(x,z);
  dummy(-12,-22);dummy(-9,-22);dummy(-6,-22);for(const x of[-14,-10,-6]){B(x,-26,1.6,.5,1.8,0,0xc8a850,'plank');V(x,-25.7,1.4,.08,1.7,.4,0xc83a2a,'c')}
  for(const[x,z]of[[-8,9],[8,9],[-16,-1],[16,-1],[0,-17],[11,-3],[-11,-4],[-27,-24],[27,24],[5,22],[-5,14]])torch(x,z);banner(-6,-6,1,COL[0]);banner(6,-6,1,COL[1]);banner(-3,26.6,1,COL[0],5);banner(3,26.6,1,COL[1],5);banner(-27,0,0,COL[3]);banner(27,-12,0,COL[4]);
  for(const[x,z,s]of[[-27,12,1],[-30,-14,1.1],[27,22,1],[10,-24,.9],[-14,24,1],[28,-22,1]])tree(x,z,s);
  /* a moat-like ditch outside the wall is just visual (grass banks); a few cats on walls would be cute but cost polys */
  return a},
 deco(){const o=[],rnd=MK.rnd(61),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0];
  /* countryside: rolling hills, a forest in rings, fields, a river with a bridge, a windmill, a camp with siege engines, distant mountains */
  for(let i=0;i<90;i++){const q=rnd()*6.283,d=40+rnd()*100,x=Math.cos(q)*d*1.15,z=Math.sin(q)*d;if(Math.abs(x)<36&&Math.abs(z)<32)continue;const w=14+rnd()*34,h=3+rnd()*9;V(x,z,w,w*(.6+rnd()*.6),h*.6,-h*.5,pick([0x5f8a48,0x6a9a50,0x557a40,0x7a9a58]),'s','grass')}
  for(let i=0;i<10;i++){const q=i/10*6.283+.3;V(Math.cos(q)*140,Math.sin(q)*130,110,70,42,-10,pick([0x6a7a8a,0x7a8a9a,0x5a6a7a]),'s')}
  for(let i=0;i<150;i++){const q=rnd()*6.283,d=40+rnd()*60,x=Math.cos(q)*d*1.1,z=Math.sin(q)*d;if(Math.abs(x)<35&&Math.abs(z)<31)continue;if(x>-6&&x<6&&z>30)continue;const s=.8+rnd()*1.2;V(x,z,.5*s,.5*s,2*s,0,0x5a4030,'c');V(x,z,3.4*s,3.4*s,6*s,1.4*s,pick([0x2f6a2c,0x3f7a34,0x2a5a2a]),'k')}
  for(let i=0;i<12;i++){const x=-70+i*14,z=-52+((i*7)%3)*3;V(x,z,12,16,.12,0,pick([0xc8b050,0x8aa04a,0x6a8a3a]),'b','grass');for(let k=0;k<6;k++)V(x-5+k*2,z,.15,15,.5,0,0xb89a3a,'b')}
  V(0,52,8,50,.1,0,0x7a6a50,'b','concrete');V(-60,12,10,150,.14,-.02,0x3a6a98,'b');V(-60,12,10.3,150,.1,0,0x6a8aa8,'g');for(let i=0;i<4;i++)V(-60,6+i*1.2,14,1.8,1.6+.4,1.2,0x7a7a72,'b','concrete');V(-60,2,14,.6,2.2,1.5,0x6a4a30,'b','plank');
  V(48,32,.9,.9,12,0,0x8a7a60,'c');V(48,32,5,5,10,0,0xcaba98,'k');for(let k=0;k<4;k++){const q=k*1.5708;V(48+Math.cos(q)*4,32,.5,8,16,8,0xe8dcc0,'b');V(48,32+Math.sin(q)*4,8,.5,16,8.2,0xe8dcc0,'b')}
  for(let i=0;i<7;i++){const x=-58+i*3.4,z=-42+(i%2)*3;V(x,z,3.2,3.2,2.6,0,pick([0xd8d0b8,0xb8a888,0xc8483a]),'b');V(x,z,3.4,3.4,3.8,2.6,pick([0xb83a2a,0x2a5aa8]),'k')}V(-52,-48,6,3,3,.6,0x6a4a30,'b','plank');V(-52,-48,.4,.4,6,3,0x6a4a30,'c');V(-54,-48,7,.4,6.4,5.8,0x6a4a30,'b','plank');V(-48,-47,4,2,.6,.3,0x6a4a30,'b','plank');
  for(let i=0;i<14;i++){V(-38+i*5.6,-33,2.6,2,.5,0,0x6a6a62,'s');V(-38+i*5.6,33,2.4,2,.5,0,0x6a6a62,'s')}
  for(let i=-6;i<=6;i++){V(i*5.5,-34.6,3.2,1.3,4.2,0,0x6a655c,'b','brick');V(i*5.5,34.6,3.2,1.3,4.2,0,0x6a655c,'b','brick')}for(let i=-5;i<=5;i++){V(-37,i*5.5,1.3,3.2,4.2,0,0x6a655c,'b','brick');V(37,i*5.5,1.3,3.2,4.2,0,0x6a655c,'b','brick')}
  return o}};

/* =============================== PILLARS =============================== */
MAPS.Pillars={d:'Ruined Roman forum: colonnades, amphitheatre, temple, baths and a triumphal arch',H:44,open:1,sky:0xa8cdee,gr:0x93885e,gt:'cobble',bc:0xe0d9c6,hemi:1,hemiC:0xfff6e4,hemiG:0x8a7a52,sunI:1,sunC:0xfff0d0,fogF:150,
 fb:[[-31,0],[31,0]],zn:[[-24,-2],[0,12],[24,3]],tb:[-38,-34,38,34],inside:(x,z)=>Math.abs(x)<36&&Math.abs(z)<32,
 lights:[[0,6,-2,0xffe8c0,.5,40]],
 b(){const a=[],v=MAPS.Pillars._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(9),pick=q=>q[rnd()*q.length|0],
  MAR=0xe4ddcb,DM=0xc9c0a8,OLD=0xb0a68c,BRK=0x9a5a40,GRS=0x5a7a3a,PINK=0xd8a89a;
  const col=(x,z,h,full=1,w=1.7)=>{B(x,z,w+.5,w+.5,.5,0,DM,'concrete');B(x,z,w,w,h,.5,MAR,'concrete');V(x,z,w+.2,w+.2,h,.5,MAR,'c','concrete');for(let i=0;i<3;i++)V(x,z,w+.14,w+.14,h*.2+i*h*.3,h*.1+i*h*.3,0xc8c0a8,'c');if(full){B(x,z,w+.7,w+.7,h+.7,h,DM,'concrete');V(x,z,w+1,w+1,h+.9,h+.4,MAR,'b','concrete')}else{V(x+.4,z+.2,w*.8,w*.7,.5+rnd()*.5,0,DM,'s')}},
   beam=(x,z,hz,L,y)=>{B(x,z,hz?L:1.5,hz?1.5:L,y+1,y,MAR,'concrete');V(x,z,hz?L:1.6,hz?1.6:L,y+1.25,y+.9,DM,'b','concrete')},
   fallen=(x,z,hz,L)=>{B(x,z,hz?L:1.6,hz?1.6:L,1.45,0,MAR,'concrete');V(x,z,hz?L:1.5,hz?1.5:L,1.5,.1,MAR,'c','concrete');V(x+(hz?L/2:0),z+(hz?0:L/2),1.8,1.8,.4,0,DM,'b')},
   plinth=(x,z,s,h,c)=>{B(x,z,s,s,h,0,DM,'concrete');V(x,z,s*.6,s*.6,h+2.4,h,c||MAR,'s','concrete');V(x,z,s*.3,s*.3,h+3.1,h+1.8,c||MAR,'s')},
   cypress=(x,z,s=1)=>{B(x,z,.8,.8,2*s,0,0x4a3a2a,'plank');V(x,z,2.2*s,2.2*s,8*s,.8,0x2a5a2e,'k')},olive=(x,z)=>{B(x,z,.7,.7,2.2,0,0x6a5a42,'plank');V(x,z,.8,.8,2.4,0,0x6a5a42,'c');V(x,z,4,4,4.4,2,0x6a8a5a,'s');V(x+.9,z-.5,3,3,4.8,2.6,0x7a9a68,'s')},
   steps=(x,z,w,d,n,dir,c)=>MK.stairs(B,x,z,dir=='e'||dir=='w'?d:w,n,dir,c||MAR,'concrete',.3,.7),
   ivy=(x,z,hz,L,h)=>{for(let i=0;i<Math.max(3,L/1.1|0);i++)V(hz?x-L/2+rnd()*L:x,hz?z:z-L/2+rnd()*L,hz?.6+rnd():.12,hz?.12:.6+rnd(),.6+rnd()*h,0,pick([GRS,0x3a5a2a,0x6a8a3a]),'b','grass')};
  /* ground: tile mosaics, grass in the cracks, fallen leaves, a dry river bed of pale sand to the south */
  V(0,0,76,64,.07,0,0xa89c80,'b','cobble');for(let i=0;i<34;i++)V((rnd()-.5)*72,(rnd()-.5)*60,2+rnd()*5,1.5+rnd()*4,.09,0,pick([GRS,0x6a8a3a,0x4a6a2e]),'b','grass');V(0,0,60,6.4,.1,0,0xc9bf9e,'b','concrete');V(0,0,8,60,.1,0,0xc9bf9e,'b','concrete');
  for(let i=0;i<20;i++)V((rnd()-.5)*60,(rnd()-.5)*50,2,2,.11,0,pick([0x8a4a3a,0x4a6a8a,0xc8b080]),'b','concrete');
  /* the avenue: two colonnades with a stone entablature on top (walk beneath), some columns broken */
  for(let i=-5;i<=5;i++)for(const s of[-1,1]){const x=i*5.8,br=(i*7+s*3)%11==0;col(x,s*9.5,br?2.4+rnd()*1.5:8,!br);if(!br&&i<5)beam(x+2.9,s*9.5,1,4.1,8.7)}
  /* amphitheatre in the middle: stepped rings around a raised stage, with four stair ramps and a ring of pillars */
  for(let i=0;i<5;i++){const r=20-i*2.6;MK.wall(B,1,0,-r*.72,r*2*.9,1.2,0,.35+i*.3,[[0,4,0,5]],OLD,'concrete');MK.wall(B,1,0,r*.72,r*2*.9,1.2,0,.35+i*.3,[[0,4,0,5]],OLD,'concrete')}
  for(let i=0;i<3;i++)B(0,-2,16-i*2.2,10-i*1.4,.28*(i+1),0,0xd0c6aa,'concrete');B(0,-2,10,5,1.3,.3,0xe0d6ba,'concrete');
  for(const[x,z]of[[-4.4,-4.2],[4.4,-4.2],[-4.4,.2],[4.4,.2]])col(x,z,4.6,1,1.2);V(0,-2,8,3.6,1.34,1.3,0xb0302a,'b');plinth(0,3.4,2.2,.8,0xc8b078);
  /* temple to the north: stylobate steps, six front columns, cella with a door, fallen roof, statue inside */
  const tx=-4,tz=-26;for(let i=0;i<3;i++)B(tx,tz,22-i*1.4,13-i*1.2,.3*(i+1),0,MAR,'concrete');MK.room(B,{x:tx,z:tz-1,w:11,d:9,h:7.4,t:.7,y0:.9,c:MAR,k:'concrete',roof:0,dr:{s:[[0,3,4.6]]},wn:{}});
  for(let i=0;i<6;i++)col(tx-8.8+i*3.52,tz+4.7,i==2?3.6:8,i!=2);for(const s of[-1,1])for(let i=0;i<2;i++)col(tx+s*9.8,tz-1+i*5,8,1);beam(tx,tz+4.7,1,19,9.7);B(tx,tz-1,5,3,8.9,8.3,DM,'concrete');plinth(tx,tz-3,2.6,.9+.4,0xe8e0cc);fallen(tx+6,tz+8.5,1,6);fallen(tx-9,tz+10.6,1,4);V(tx,tz+6,19,.5,11.8,9.7,DM,'b','concrete');
  /* baths in the south: sunken pool shown as a rim and water, arcaded hall on both sides */
  const bx=3,bz=24;B(bx,bz,15,.7,1,0,MAR,'concrete');B(bx,bz+6.4,15,.7,1,0,MAR,'concrete');B(bx-7.2,bz+3.2,.7,6.4,1,0,MAR,'concrete');B(bx+7.2,bz+3.2,.7,6.4,1,0,MAR,'concrete');V(bx,bz+3.2,14,5.8,.7,.1,0x4a9ab8,'g');
  for(const s of[-1,1]){MK.wall(B,0,bx+s*11,bz+3,16,.9,0,5.6,[[-4.6,2.8,0,3.6],[0,2.8,0,3.6],[4.6,2.8,0,3.6]],PINK,'stucco');B(bx+s*11,bz+3,1.2,16.4,6.1,5.6,DM,'concrete');for(let i=0;i<3;i++)V(bx+s*(11+.5),bz-2.3+i*4.6+3,.2,2.6,4.8,3.4,0x2a2a2a,'b')}
  B(bx,bz+9,28,.9,5.6,0,PINK,'stucco');for(let i=0;i<5;i++)V(bx-10+i*5,bz+8.4,2.4,.2,3.6,.1,0x2a2a2a,'b');
  /* stoas: long covered halls east and west with doorways */
  for(const s of[-1,1])MK.room(B,{x:s*28,z:-18,w:6,d:20,h:5.4,t:.6,c:OLD,k:'concrete',rc:BRK,rk:'shingle',dr:{w:[[-5,2.6,3.6],[5,2.6,3.6]],e:[[-5,2.6,3.6],[5,2.6,3.6]],n:[[0,2.4,3]]},wn:{[s>0?'e':'w']:[[-6,1.4],[0,1.4],[6,1.4]]}});
  /* triumphal arch at the east end of the avenue: two piers and a lintel high enough to walk under */
  for(const s of[-1,1]){B(33.5,s*3.6,5,3.2,10,0,MAR,'concrete');V(33.5,s*3.6,5.4,3.6,10.2,7,DM,'b','concrete')}B(33.5,0,5,10.4,11.4,7.4,MAR,'concrete');V(33.5,0,5.4,10.8,12,11.2,DM,'b','concrete');V(33.5,0,2,3,13.6,12,0xc8a24a,'b');for(const s of[-1,1])steps(30.4,s*3.6,1,3.2,3,'e');
  /* statues on plinths, fountains, fallen columns, broken walls, benches of stone, cypress and olive groves */
  for(const[x,z]of[[-14,-3],[14,-3],[-14,3],[14,3],[-26,16],[26,16],[-24,-30],[18,-30]])plinth(x,z,2.4,1.3);
  for(const[x,z]of[[-20,-1],[20,2]]){B(x,z,4.4,4.4,.9,0,MAR,'concrete');V(x,z,3.6,3.6,.3,.7,0x4a9ab8,'g');B(x,z,.8,.8,2.8,0,MAR,'concrete')}
  fallen(-14,13,1,6);fallen(-23,-12,0,6.5);fallen(12,-13,1,5.5);fallen(25,12,0,6);fallen(-30,9,1,5);fallen(8,12,0,5);fallen(19,23,1,6);
  for(const[x,z,w,d]of[[-12,17,5,.8],[-29,-6,.8,6],[28,9,.8,7],[15,-11,5,.8],[-20,13,.8,5],[-8,-12,.8,4.5],[22,-8,.8,4]]){B(x,z,w,d,1.2+rnd()*1.2,0,OLD,'concrete');ivy(x,z,w>d,Math.max(w,d),1.8)}
  for(const[x,z,h]of[[-16,10.5,1],[16,10.5,1],[-16,-10.5,1],[16,-10.5,1],[-8,16,0],[8,18,0]])B(x,z,h?2.2:.6,h?.6:2.2,.55,0,MAR,'concrete');
  for(const[x,z]of[[-32,-25],[-32,-12],[-32,24],[32,-26],[32,22],[10,-33],[-14,-33],[-34,6],[34,10],[-18,28],[24,28]])cypress(x,z,1+rnd()*.4);for(const[x,z]of[[-23,24],[-27,22],[-26,28],[24,-27],[28,-24],[22,-30],[-10,29],[14,30]])olive(x,z);
  /* the edge of the site: an old low wall covered in ivy with an invisible barrier above it */
  EDGE(a,-37,-33,37,-33,2.2,OLD,'concrete',1.1);EDGE(a,-37,33,37,33,2.2,OLD,'concrete',1.1);EDGE(a,-37,-33,-37,33,2.2,OLD,'concrete',1.1);EDGE(a,37,-33,37,33,2.2,OLD,'concrete',1.1);
  for(let i=-18;i<=18;i++){ivy(i*2,-33,1,2,2);ivy(i*2,33,1,2,2)}for(let i=-15;i<=15;i++){ivy(-37,i*2.1,0,2,2);ivy(37,i*2.1,0,2,2)}for(let i=-17;i<=17;i++){V(i*2.2,-33,1.3,1.4,2.7,2.2,OLD,'b','concrete');V(i*2.2,33,1.3,1.4,2.7,2.2,OLD,'b','concrete')}
  return a},
 deco(){const o=[],rnd=MK.rnd(77),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0];
  /* hills with terraces and vineyards, an aqueduct, villas with red roofs, cypress rows, a coast line to the south and mountains */
  for(let i=0;i<100;i++){const q=rnd()*6.283,d=44+rnd()*90,x=Math.cos(q)*d*1.15,z=Math.sin(q)*d;if(Math.abs(x)<38&&Math.abs(z)<35)continue;const w=14+rnd()*34,h=3+rnd()*10;V(x,z,w,w*(.6+rnd()*.7),h*.6,-h*.5,pick([0x8a9a5a,0x7a8a50,0x9aa868,0x6a7a48]),'s','grass')}
  for(let i=0;i<10;i++){const q=i/10*6.283+.1;V(Math.cos(q)*150,Math.sin(q)*140,110,80,50,-12,pick([0x8a8a9a,0x9a9aaa,0x7a7a8a]),'s')}
  for(let i=-8;i<=8;i++){V(i*7,-62,2.6,2.6,14,0,0xcbbf9e,'b','concrete');if(i<8){V(i*7+3.5,-62,4.4,2.2,12,0,0x1a1a1a,'b');V(i*7+3.5,-62,7,2.8,15.6,12.2,0xcbbf9e,'b','concrete')}V(i*7,-62,2.8,3,15.8,14,0xdacdac,'b','concrete')}
  for(let i=0;i<16;i++){const x=-70+i*9.4,z=48+rnd()*10;V(x,z,6,6,4,0,pick([0xe8dcc0,0xd8c8a8]),'b','stucco');V(x,z,6.6,6.6,5.6,4,0xb8503a,'k');for(let k=0;k<3;k++)V(x-2+k*2,z+3.05,.9,.1,3,1.4,0x2a3a4a,'g')}
  for(let i=0;i<8;i++){const x=-80+i*21;for(let k=0;k<18;k++)V(x+k*1.1,-48,.8,.8,3.4,0,0x3a5a2e,'c');V(x+10,-42,22,4,.12,0,pick([0x8aa04a,0x6a8a3a]),'b','grass');for(let k=0;k<10;k++)V(x+k*2.2,-42,.15,4,.5,0,0x7a6a3a,'b')}
  V(0,100,300,50,.2,-.1,0x3a7aa8,'b');V(0,100,300,50,.1,0,0x6aa8d0,'g');for(let i=0;i<9;i++)V(-60+i*18,86+(i%2)*3,9,3,2,0,0x8a7a62,'s');
  for(let i=0;i<60;i++){const q=rnd()*6.283,d=40+rnd()*60,x=Math.cos(q)*d*1.15,z=Math.sin(q)*d;if(Math.abs(x)<38&&Math.abs(z)<35)continue;V(x,z,2.2,2.2,8,.8,0x2a5a2e,'k');V(x,z,.7,.7,1,0,0x4a3a2a,'c')}
  for(let i=0;i<12;i++){const x=(rnd()-.5)*120,z=(rnd()-.5)*110;if(Math.abs(x)<38&&Math.abs(z)<35)continue;V(x,z,1.7,1.7,7,.4,0xe4ddcb,'c','concrete');V(x,z,2.4,2.4,7.6,7,0xc9c0a8,'b','concrete')}
  return o}};

/* =============================== CANYON =============================== */
MAPS.Canyon={d:'Mining gorge: trestle bridge, mill, mine tunnel, water tower, rail carts and climbable ledges',H:44,open:1,sky:0xe0a070,gr:0xb4693e,gt:'sand',bc:0xb9774c,hemi:.85,hemiC:0xffc8a0,hemiG:0x8a4a3a,sunI:1.05,sunC:0xffb070,fogF:150,
 fb:[[-33,8],[33,-6]],zn:[[-26,6],[0,-2],[27,-4]],tb:[-44,-44,44,44],inside:(x,z)=>Math.abs(x)<40&&Math.abs(z)<40,
 lights:[[30,3.6,-18,0xffa040,1.2,16],[-6,3.2,-12,0xffd9a0,.9,16],[22,2.5,-30,0xffa040,1,14],[-20,3,16,0xffc070,.9,16]],
 b(){const a=[],v=MAPS.Canyon._v,B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),rnd=MK.rnd(17),pick=q=>q[rnd()*q.length|0],RK=[0xb9774c,0xa8683e,0xc98858,0x9a5a38,0xd09868],WD=0x7a5a3a,WDL=0x9a7a52,RS=0x8a4a2a;
  const rock=(x,z,w,d,h,y0)=>{B(x,z,w,d,h,y0||0,pick(RK),'sand');const s=Math.min(w,d);for(let i=0;i<3;i++)V(x+(rnd()-.5)*w*.8,z+(rnd()-.5)*d*.8,s*.5,s*.4,h+.2+rnd()*.5,h-.4,pick(RK),'s','sand')},
   /* a terraced cliff: n ledges stepping away from the canyon floor, each one .3 up from the last for the first few so they can be climbed */
   cliff=(x0,z0,len,hz,dir,steps)=>{for(let i=0;i<steps.length;i++){const[off,wd,h]=steps[i],px=hz?x0+len/2:x0+dir*(off+wd/2),pz=hz?z0+dir*(off+wd/2):z0+len/2;rock(px,pz,hz?len:wd,hz?wd:len,h)}},
   cactus=(x,z)=>{B(x,z,.6,.6,2.4,0,0x4a7a3a,'plank');V(x,z,.7,.7,2.5,0,0x4a7a3a,'c');V(x-.6,z,.6,.3,1.9,1.5,0x4a7a3a,'c');V(x+.6,z,.6,.3,1.5,1.1,0x4a7a3a,'c')},
   boulder=(x,z,r)=>{B(x,z,r,r,r*.7,0,pick(RK),'sand');V(x,z,r*1.1,r*1.05,r*.8,0,pick(RK),'s','sand')},
   barrel=(x,z,c)=>{B(x,z,.8,.8,1.1,0,c||WD,'plank');V(x,z,.85,.85,1.1,0,c||WD,'c','plank');V(x,z,.9,.9,.1,.5,0x2a2a2a,'c')},crate=(x,z,s)=>B(x,z,s,s,s*.9,0,0x9a7a4a,'plank'),
   dead=(x,z)=>{B(x,z,.5,.5,2.6,0,0x5a4a3a,'plank');V(x,z,.5,.5,3,0,0x5a4a3a,'c');for(let i=0;i<4;i++){const q=i*1.6+rnd();V(x+Math.cos(q)*.8,z+Math.sin(q)*.8,1.8,.12,2.6+rnd()*1.2,2.2+rnd(),0x4a3a2a,'b')}},
   cart=(x,z,hz,full)=>{B(x,z,hz?2.6:1.5,hz?1.5:2.6,1.15,.3,0x5a5a60,'metal');V(x,z,hz?2.7:1.6,hz?1.6:2.7,1.2,1.0,0x3a3a3e,'b','metal');if(full)V(x,z,hz?2.3:1.2,hz?1.2:2.3,1.5,1.1,0x2a2a2e,'s');for(const s of[-1,1])V(x+(hz?s*.9:0),z+(hz?0:s*.9),.5,.5,.5,0,0x1b1b1c,'c')},
   shack=(x,z,w,d,fl,dr)=>multi(B,{x,z,w,d,fl,fh:3.4,c:WDL,k:'plank',rc:0x6a4a30,rk:'plank',dr,step:3,wlo:1.1,whi:2.2});
  /* ground: wheel ruts, railway, scrub, dry riverbed in pale sand */
  V(0,0,92,92,.06,0,0xb4693e,'b','sand');V(-2,2,80,10,.07,0,0xd0a870,'b','sand');V(14,-12,10,50,.07,0,0xd0a870,'b','sand');V(-22,18,30,8,.07,0,0xd0a870,'b','sand');
  for(let i=0;i<36;i++){const x=(rnd()-.5)*86,z=(rnd()-.5)*86;V(x,z,1+rnd()*3,.8+rnd()*2,.08,0,pick([0x8a9a4a,0x6a7a3a,0xa0a050]),'b','grass')}
  V(-1,-9,80,.2,.12,0,0x4a4a4e,'b');V(-1,-7.6,80,.2,.12,0,0x4a4a4e,'b');for(let i=-19;i<=19;i++)V(-1+i*2.1,-8.3,.5,2.2,.14,0,0x5a3a22,'b','plank');
  /* canyon walls: terraced on the north and south with climbable ledges and rock tops; east and west are wide cliff masses with gaps */
  const N=[[0,3,.3],[3,3,.6],[6,3,.9],[9,3,1.2],[12,4,3.4],[16,4,5.4],[20,5,8.6]],M=[[0,3,.3],[3,3,.6],[6,3,.9],[9,4,3],[13,4,5],[17,6,9]];
  cliff(-40,-40,28,1,1,N.map(([o,w,h])=>[o,w,h]));cliff(12,-40,28,1,1,N.map(([o,w,h])=>[o+(0),w,h*(1+(rnd()<.5?0:.2))]));cliff(-40,40,34,1,-1,M);cliff(-2,40,42,1,-1,M);
  rock(-40,-24,6,28,10);rock(-40,24,6,28,11);rock(40,-26,6,26,10);rock(40,18,6,34,10);rock(-37,0,4,10,4);rock(37,-4,4,8,3);rock(-34.5,-6,3,5,2);
  /* gaps in the south cliff form two side canyons; a pair of ledges lets you climb out of the north side onto a mesa shelf */
  B(-24,-31,12,4,4.6,0,pick(RK),'sand');B(-10,-33,10,5,6.2,0,pick(RK),'sand');MK.stairs(B,-20,-27,3,15,'n',pick(RK),'sand',.3,.6,0);rock(-4,-35,8,4,6.8);
  /* mine tunnel through the east cliff: timber frames and a roof high above the rails */
  const mx=34,mz=-18;B(mx,mz-4.5,14,4,3,0,pick(RK),'sand');B(mx,mz+4.5,14,4,3,0,pick(RK),'sand');B(mx,mz,14,5,14,3.6,pick(RK),'sand');B(mx+2,mz,10,5.2,14,3.6,pick(RK),'sand');for(let i=0;i<5;i++){V(mx-5.5+i*2.8,mz-2.4,.5,.5,3.4,0,WD,'b','plank');V(mx-5.5+i*2.8,mz+2.4,.5,.5,3.4,0,WD,'b','plank');V(mx-5.5+i*2.8,mz,.5,5.2,3.7,3.3,WD,'b','plank')}
  V(mx,mz,12,2,.14,0,0x4a4a4e,'b');for(let i=0;i<8;i++)V(mx-5+i*1.5,mz,.4,2.4,.15,0,0x5a3a22,'b','plank');V(mx,mz-1.6,8,.9,1.2,.1,0x2a2a2e,'s');B(mx-3,mz+1.6,1.4,1.2,1.0,0,0x5a5a60,'metal');V(mx-6.6,mz,.1,3,3,.2,0xffd9a0,'e');
  /* water tower on legs with a tank (walk under it); stairs up to a catwalk */
  const wt=[-14,-16];for(const sx of[-1,1])for(const sz of[-1,1]){B(wt[0]+sx*2.4,wt[1]+sz*2.4,.6,.6,8,0,WD,'plank')}B(wt[0],wt[1],6.2,6.2,8.4,8,WD,'plank');V(wt[0],wt[1],6,6,13,8.4,0x7a5a3a,'c','plank');V(wt[0],wt[1],6.3,6.3,14.4,13,0x5a3a22,'k');for(let i=0;i<4;i++)V(wt[0],wt[1],6.1,6.1,.25,9+i*1.2,0x3a3a3a,'c');MK.stairs(B,wt[0]-3.4,wt[1]+3.4,1.4,26,'n',WD,'plank',.31,.45,0);for(const[dx,dz]of[[-2.4,0],[2.4,0],[0,-2.4],[0,2.4]])V(wt[0]+dx,wt[1]+dz,dx?.1:4.8,dx?4.8:.1,6.5,.4,0x4a3a2a,'b');
  /* ore mill: three floors with a hopper, a chute and a big wheel */
  multi(B,{x:-4,z:-17,w:12,d:9,fl:3,fh:3.8,c:0x8a7a62,k:'plank',rc:0x5a4a38,rk:'plank',dr:{s:[[-2,2.6,3.2]],e:[[0,1.8,2.6]]},step:3.4});V(-4,-12.3,10,1,12,3,0x5a4a38,'b','plank');V(-10.4,-17,.5,5,5.4,.5,0x4a3a2a,'c','plank');V(-10.4,-17,.4,8,7,3,RS,'c','rust');B(-4,-23.6,3,3,7,0,WD,'plank');V(-4,-23.6,3.4,3.4,9,7,RS,'k','rust');V(1.2,-13.5,3,.6,2.4,.2,0x4a3a2a,'b','plank');
  /* saloon and boarding house with covered porch, hotel and bank facades along the main street */
  multi(B,{x:-22,z:-2,w:14,d:9,fl:2,fh:3.6,c:0xa86a46,k:'plank',rc:0x6a4a30,rk:'plank',dr:{s:[[-3,2.4,2.8],[3,1.8,2.5]],n:[[0,1.8,2.5]]},step:3.4});B(-22,3.5,14.6,2.6,3.2,3,0x6a4a30,'plank');for(let i=0;i<5;i++)B(-28+i*3,4.6,.3,.3,3,0,WD,'plank');V(-22,-6.6,10,.1,5.4,4.4,0xe8d4a0,'b','plank');B(-22,-5,5,.1,5.2,3.8,0,'n');
  multi(B,{x:-8,z:3,w:9,d:8,fl:2,fh:3.6,c:0x9a8a6a,k:'plank',rc:0x5a4a38,rk:'plank',dr:{n:[[-1,2.4,2.8]],e:[[0,1.8,2.5]]}});shack(10,-24,7,6,1,{s:[[0,1.8,2.5]]});shack(-30,24,8,6,1,{n:[[0,1.8,2.5]],e:[[0,1.8,2.5]]});shack(8,22,7,7,2,{w:[[0,1.8,2.5]],n:[[2,1.8,2.5]]});shack(24,12,6,5,1,{w:[[0,1.8,2.5]]});
  MK.room(B,{x:-34,z:-24,w:3.4,d:3.4,h:2.6,c:0x6a4a30,k:'plank',rc:0x4a3a28,dr:{e:[[0,1.2,2.2]]},wn:{}});V(-34,-24,3.8,3.8,3.5,2.6,0xc8362a,'b');
  /* trestle bridge across the gulch at height 5: timber legs, a deck with rails, stairs up at both ends */
  const bz=-30,b0=-32,b1=6;for(let x=b0;x<=b1;x+=4)for(const s of[-1,1]){B(x,bz+s*1.5,.7,.7,4.6,0,WD,'plank');V(x,bz+s*1.5,.9,.9,4.7,0,0x5a3a22,'b','plank')}for(let x=b0+2;x<b1;x+=4){V(x,bz,.3,3.4,3.8,.8,WDL,'b');V(x,bz,.2,4,3.2,2.6,0x5a3a22,'b')}B((b0+b1)/2,bz,b1-b0+2,3.6,5,4.6,WDL,'plank');for(const s of[-1,1])for(let x=b0;x<=b1;x+=2)V(x,bz+s*1.7,.12,.12,6.1,5,0x4a3a2a,'b');for(const s of[-1,1])V((b0+b1)/2,bz+s*1.7,b1-b0+2,.1,6,5.9,0x4a3a2a,'b');
  MK.stairs(B,b0-1.8,bz,3.2,16,'e',WDL,'plank',.2875,.62,0);MK.stairs(B,b1+1.8,bz,3.2,16,'w',WDL,'plank',.2875,.62,0);
  /* corral, cart track, cargo stacks, dynamite shed, windmill and plenty of scatter */
  for(let i=0;i<6;i++){B(18+i*2.2,28,.2,.2,1.5,0,WD,'plank');B(18+i*2.2,36,.2,.2,1.5,0,WD,'plank')}for(let i=0;i<4;i++){B(18+i*2.2+1.1,28,2.2,.1,1.2,.5,WD,'plank');B(18+i*2.2+1.1,36,2.2,.1,1.2,.5,WD,'plank')}
  for(const[x,z,h,f]of[[6,-8.3,1,1],[10,-8.3,1,0],[14,-8.3,1,1],[-12,-8.3,1,0],[24,-8.3,1,1]])cart(x,z,h,f);
  for(const[x,z]of[[-10,10],[-6,14],[10,12],[20,2],[26,-10],[2,18],[-18,24],[16,-30],[-26,12],[30,20],[22,-22],[0,-24]])boulder(x,z,1.6+rnd()*1.8);
  for(const[x,z]of[[-30,10],[-16,8],[6,6],[28,6],[32,-8],[-8,22],[14,30],[-34,18],[24,-34],[4,-14],[-20,-14]])cactus(x,z);for(const[x,z]of[[-27,-12],[12,-14],[26,24],[-14,30],[30,-26]])dead(x,z);
  for(const[x,z]of[[-28,-6],[-27,-6.9],[-27.8,-7.8],[6,12],[6.9,12.6],[12,-22],[12.8,-22.8],[24,20],[-16,22],[-15,22.8]])barrel(x,z,pick([WD,RS,0x2a4a6a]));for(const[x,z,s]of[[-1,12,1.4],[1,12.6,1.2],[2.2,-3,1.5],[-12,6,1.4],[22,8,1.3],[-6,-4,1.2],[8,-18,1.4],[28,-10,1.5]])crate(x,z,s);
  for(const[x,z]of[[-24,-8],[-12,12],[16,6],[30,-14],[-34,12]]){V(x,z,.14,.14,3.6,0,WD,'c');V(x,z,1.4,.08,3.5,2.8,0xe8d4a0,'b','plank');V(x,z,.3,.3,3.9,3.6,0xffc060,'e')}
  /* the railroad ends in buffers; a small signal; a mine office with a safe */
  B(-40.5,-8.3,1.6,3.2,1.6,0,0x5a5a60,'metal');for(const x of[-30,-6,18,36])V(x,-10.4,.14,.14,3.2,0,0x3a3a3e,'c'),V(x,-10.4,.7,.1,3.2,2.6,0x8a2a1a,'b');
  return a},
 deco(){const o=[],rnd=MK.rnd(33),V=(x,z,w,d,h,y0,c,s,t)=>o.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0],RK=[0xb9774c,0xa8683e,0xc98858,0x9a5a38,0xd09868,0x8a4a30];
  /* the gorge continues: huge terraced mesas on every side, spires, arches, a distant river and desert scrub, vultures, wind-carved ridges */
  for(let i=0;i<60;i++){const q=rnd()*6.283,d=52+rnd()*95,x=Math.cos(q)*d*1.1,z=Math.sin(q)*d;if(Math.abs(x)<44&&Math.abs(z)<44)continue;const w=10+rnd()*30,h=10+rnd()*34;V(x,z,w,w*(.7+rnd()*.6),h,0,pick(RK),'b','sand');V(x,z,w*.78,w*.7,h+h*.3,h,pick(RK),'b','sand');V(x,z,w*.5,w*.5,h*1.5,h*1.3,pick(RK),'b','sand')}
  for(let i=0;i<26;i++){const q=rnd()*6.283,d=48+rnd()*60,x=Math.cos(q)*d,z=Math.sin(q)*d;if(Math.abs(x)<44&&Math.abs(z)<44)continue;V(x,z,3+rnd()*3,3+rnd()*3,12+rnd()*18,0,pick(RK),'c','sand');V(x,z,5,5,13+rnd()*19,11,pick(RK),'s','sand')}
  for(let i=0;i<8;i++){const x=-60+i*16,z=-62;V(x,z,3,3,14,0,pick(RK),'b','sand');V(x+4,z,3,3,14,0,pick(RK),'b','sand');V(x+2,z,9,3.4,17,14,pick(RK),'b','sand')}
  for(let i=0;i<90;i++){const q=rnd()*6.283,d=40+rnd()*80,x=Math.cos(q)*d*1.1,z=Math.sin(q)*d;if(Math.abs(x)<44&&Math.abs(z)<44)continue;V(x,z,.8,.8,1.6+rnd()*1.2,0,0x4a7a3a,'c')}
  V(0,100,300,40,.2,-.1,0x3a7aa8,'b');for(let i=0;i<6;i++)V(-50+i*20,-80,.3,.3,34+i*3,28,0x1a1a1a,'s');
  for(let i=-8;i<=8;i++){V(-1+i*5,-52.6,.5,.5,3.8,0,0x6a5a42,'b','plank')}for(let i=0;i<5;i++)V(-46+i*22,-54,4,2,.8,0,0x5a5a60,'b','metal');
  V(-58,-8,24,.14,.2,0,0x3a3a3e,'b');V(-58,-6.6,24,.14,.2,0,0x3a3a3e,'b');
  return o}};
;
/* ######## lanes.js ######## */
/* ===================== lanes.js ===================== */
/* ---------- the three lane layout ----------
   Every multiplayer map is built as three main pathways running from one team's side to the other: a north lane, a middle lane and a south lane. Long dividers (shipping containers, wrecks,
   stone walls, ruined walls, rock ridges, hedges, adobe walls, depending on the map) separate the lanes, with crossover gaps every so often so players can rotate between lanes. Each lane
   also gets its own tint on the ground so it reads at a glance. Dividers are only placed where nothing already stands, so the map's own buildings act as divider pieces too.
   The Hollow Estate zombies map is a survival layout and is not divided. ---------- */
var LANES={
 Rust:{zs:[-10,10],x:[-20,20],style:'container',seg:6,gap:4.4,col:[0x9a3a2a,0x3a5a6a,0x6b6a45,0x8a5a2a],tint:[0x8a7a5a,0x9a8660,0x7a7258]},
 Decay:{zs:[-15,16],x:[-40,40],style:'wreck',seg:8,gap:4.6,col:[0x6a6a2a,0x3a4a5a,0x5a2a2a,0x4a4a4a],tint:[0x5a5a52,0x4e4e4a,0x56564c]},
 Blockfort:{zs:[-9.5,9.5],x:[-27,27],style:'stone',seg:8,gap:4.4,col:[0x9a958a],tint:[0x6a6a60,0x7a7468,0x6a6a60]},
 Pillars:{zs:[-11,11],x:[-31,31],style:'ruin',seg:7,gap:4.6,col:[0xd0c8b0,0xc0b69c],tint:[0xb0a688,0xc2b894,0xb0a688]},
 Canyon:{zs:[-6,8.5],x:[-34,34],style:'rock',seg:8,gap:5,col:[0xb9774c,0xa8683e,0xc98858],tint:[0xc08a58,0xd0a070,0xb87a4a]},
 Suburbia:{zs:[-19,19],x:[-45,45],style:'hedge',seg:9,gap:5,col:[0x3f7a34],tint:[0x5a8a46,0x66954e,0x5a8a46]},
 Boomtown:{zs:[-8,8],x:[-44,44],style:'adobe',seg:9,gap:5,col:[0xc2a878,0xb8996a],tint:[0xb59d6c,0xc0a878,0xb59d6c]}};
MK.lanes=function(a,v,name){const C_=LANES[name];if(!C_)return;const rnd=MK.rnd(name.length*31+7),B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V_=(x,z,w,d,h,y0,c,s,t)=>v.push([x,z,w,d,h,y0||0,c,s||'b',t]),pick=q=>q[rnd()*q.length|0];
 const free=(x,z,w,d,m)=>!a.some(b=>b[4]>.5&&(b[5]||0)<2&&Math.abs(x-b[0])<(w+b[2])/2+m&&Math.abs(z-b[1])<(d+b[3])/2+m);
 const M=MAPS[name],hx=M.H||40;
 /* ground tint ribbons: one per lane */
 const zb=[-hx,C_.zs[0],C_.zs[1],hx],ext=C_.x[1]*1.15;for(let i=0;i<3;i++){const z0=Math.max(zb[i],-(M.H-4)),z1=Math.min(zb[i+1],M.H-4);V_(0,(z0+z1)/2,ext*2,z1-z0-.6,.045,0,C_.tint[i],'b','concrete')}
 const piece=(x,z,len,zi)=>{const c=pick(C_.col);
  if(C_.style=='container'){B(x,z,len,2.5,2.6,0,c,'rust');for(let i=-2;i<=2;i++)V_(x+i*1.15,z,.08,2.56,2.55,.1,0x2a2a2a,'b');if(rnd()<.4)V_(x,z,len-.4,2.4,2.7,2.6,pick(C_.col),'b','rust')}
  else if(C_.style=='wreck'){B(x,z,len,2.8,2.8,0,c,'rust');V_(x,z,len-.3,2.9,3.0,2.8,0x2a2a2e,'b','metal');for(let i=-3;i<=3;i++)V_(x+i*1.1,z+1.42,.9,.05,2.4,1.4,0x1a2a32,'g');B(x+len/2+.9,z+.2,1.8,.8,1.05,0,0xb5b0a2,'concrete')}
  else if(C_.style=='stone'){B(x,z,len,1.3,3.6,0,c,'brick');for(let i=-len/2+.6;i<len/2;i+=1.5)V_(x+i,z,.9,1.5,4.3,3.6,c,'b','brick');V_(x,z-.8,len,.2,.9,0,0x4a4a44,'b','concrete')}
  else if(C_.style=='ruin'){B(x,z,len,1.2,2.6+rnd()*1.6,0,pick(C_.col),'concrete');for(let i=0;i<5;i++)V_(x+(rnd()-.5)*len,z+(rnd()>.5?.65:-.65),.5+rnd(),.1,.8+rnd()*2.4,0,pick([0x4f7a3a,0x3a5a2a,0x6a8a3a]),'b','grass')}
  else if(C_.style=='rock'){B(x,z,len,3.2,3.4+rnd()*1.6,0,c,'sand');for(let i=0;i<3;i++)V_(x+(rnd()-.5)*len*.8,z+(rnd()-.5)*2,2.4,2,4.6+rnd()*1.2,2,pick(C_.col),'s','sand')}
  else if(C_.style=='hedge'){B(x,z,len,1.4,2.2,0,0x3f7a34,'grass');V_(x,z,len+.2,1.6,2.35,1.4,0x4f8a3c,'b','grass');for(let i=0;i<6;i++)V_(x+(rnd()-.5)*len,z+(rnd()-.5)*1.2,.6,.6,2.5,2,pick([0xe8c030,0xd84a6a,0xffffff]),'s')}
  else{B(x,z,len,1.2,3,0,c,'stucco');V_(x,z,len+.1,1.4,3.3,3,0x9a8460,'b','concrete');for(let i=-len/2+1.2;i<len/2;i+=3)V_(x+i,z-.65,.9,.05,2.2,.9,0x5a3a22,'b')}};
 for(let k=0;k<2;k++){const z=C_.zs[k],step=C_.seg+C_.gap*2.4;let x=C_.x[0]+(k?step*.5:0);/* isolated blocks (a container stack, a wreck, a wall stub, a ruin) with wide open ground between them: the lanes are three routes you can walk through, not walls */while(x+C_.seg<=C_.x[1]){const len=C_.seg*(.8+.4*rnd()),cx=x+len/2,jz=z+(rnd()-.5)*.8;if(free(cx,jz,len,2.2,1.0))piece(cx,jz,len,k);x+=step}}}
for(const n of Object.keys(LANES)){const M=MAPS[n];if(!M||!M.b)continue;const _b=M.b;M.b=function(){const a=_b.apply(this,arguments);this._v=this._v||[];MK.lanes(a,this._v,n);return a}}
;

/* ===================== DRY DOCK =====================
   The smallest map in the game: a 34 x 34 m shipyard at golden hour. A ship's hull sits on keel blocks in the middle: a tunnel runs underneath it from end to end and a railed deck runs on top, with stairs up at both ends
   (and crate steps onto the container roofs in the corners). Each corner is a different container stack, a control hut on stilts overlooks the north east, and a gantry crane and a ring of bollards frame the quay.
   Everything is within a sprint of everything else: it is built for fast, close fights. ===================== */
MAPS['Dry Dock']={d:'Tiny shipyard at golden hour: a hull on blocks with a tunnel under it and a deck on top, container stacks and a control hut. The smallest map',H:17,open:1,sky:0xf2b27a,gr:0x6a6a68,gt:'concrete',bc:0x9a8f80,hemi:.9,hemiC:0xffe2c0,hemiG:0x5a5048,sunI:1.05,sunC:0xffc890,fogF:120,
 fb:[[-12.6,-2.4],[12.6,-2.4]],zn:[[-6.15,-8.9],[1.85,10.1],[9.85,-5.15]],inside:(x,z)=>Math.abs(x)<14.6&&Math.abs(z)<14.6,
 lights:[[0,1.5,0,0xffb870,.8,9],[-9,5.4,-10.5,0xffb060,1.3,26],[9.5,5.4,10.5,0xffb060,1.3,26],[0,5,0,0xffe0b0,.6,18],[10.5,3.6,-10.5,0xfff0c0,.9,12]],
 b(){const a=[],vv=(MAPS['Dry Dock']._v=MAPS['Dry Dock']._v||[]);vv.length=0;const B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>vv.push([x,z,w,d,h,y0||0,c,s||'b',t]),RED=0xa83a2c,BLUE=0x2f5f9e,GRN=0x3a7a4a,ORG=0xd08a2a,GRY=0x7a8087,YEL=0xd7b02a,HULL=0x46607a,DECK=0x8a7a60,WOOD=0x7a5a3a,CONC=0x9a968a;
  /* the hull: keel blocks, two side plates (a tunnel between them), the deck, a bow and a stern, rails with gaps, stairs at both ends */
  for(let i=-4;i<=4;i++){B(i*2.1,-3.1,.7,.7,.7,0,WOOD,'plank');B(i*2.1,3.1,.7,.7,.7,0,WOOD,'plank')}
  /* the side plates have two doorways each (between the keel blocks, 1.4 m wide) so the tunnel under the hull can be entered; before, it was sealed */
  for(const s of[-1,1])for(const[x0,x1]of[[-9.1,-5.95],[-4.55,4.55],[5.95,9.1]]){B((x0+x1)/2,s*3.1,x1-x0,.45,2,.7,HULL,'metal');B((x0+x1)/2,s*3.1,x1-x0+.1,.12,2.05,.65,0x2a3a4a,'metal')}
  B(0,0,18.6,7,2.4,2,DECK,'plank');
  B(-9.35,0,.5,6.2,1.8,.7,HULL,'metal');B(9.35,0,.5,6.2,1.8,.7,HULL,'metal');
  for(const[rx,rz,rw,rd]of[[-6.4,-3.2,5.2,.14],[3.6,-3.2,9.6,.14],[-3.2,3.2,9.6,.14],[6.8,3.2,4.4,.14],[-9.2,-1,.14,4.2],[-9.2,2.4,.14,1.6],[9.2,-2.4,.14,1.6],[9.2,1,.14,4.2]])B(rx,rz,rw,rd,3.3,2.4,0xc8c2b0,'metal');
  MK.stairs(B,-9.3,0,2.6,8,'w',0x6a655a,'metal',.3,.55,0);MK.stairs(B,9.3,0,2.6,8,'e',0x6a655a,'metal',.3,.55,0);
  B(-3.4,1.7,1.8,1,3.4,2.4,0x6a4a2a,'plank');B(3.8,-1.5,1,1.8,3.4,2.4,0x6a4a2a,'plank');B(0.4,-2.4,.9,.9,3.2,2.4,RED,'metal');
  V(-2.2,0,1.4,1.4,6.4,2.4,0x555a60,'c','metal');V(-2.2,0,1.7,1.7,.3,6.2,0x2a2c30,'c');V(6.2,0,2.6,1.6,3.6,2.4,0xcfc9b6,'b','stucco');V(6.2,0,2.7,1.7,.2,6,0x6a4a3a,'b');
  for(let i=-8;i<=8;i++)V(i*1.1,-3.62,.18,.06,.5,-.1,0x2a3a4a,'b');
  V(0,-3.5,18.4,.06,.25,.9,0x9a2a20,'b','metal');V(0,3.5,18.4,.06,.25,.9,0x9a2a20,'b','metal');
  /* four corners, four different container stacks; crate steps up to each stack's roof */
  const C=(x,z,w,d,c,y0)=>{B(x,z,w,d,(y0||0)+2.4,y0||0,c,'metal');for(const s of[-.42,-.14,.14,.42]){V(x+(w>d?w*s:0),z+(w>d?0:d*s),w>d?.05:w+.06,w>d?d+.06:.05,2.3,(y0||0)+.06,0x00000030,'b')}};
  /* north west: two containers in an L, steps on the north side */
  C(-10.2,-11.6,6,2.4,RED);C(-13,-8.4,2.4,6,BLUE);B(-7,-12.8,1.3,1.3,.8,0,WOOD,'plank');B(-7,-11.4,1.3,1.3,1.6,0,WOOD,'plank');B(-8.4,-9.6,1.2,1.2,.8,0,WOOD,'plank');
  /* south west: a gap you can run through, one container stacked on another */
  C(-11.5,10.5,2.4,6,GRN);C(-8.2,12.6,6,2.4,ORG);C(-8.2,12.6,6,2.4,GRY,2.4);B(-12.8,7,1.3,1.3,.8,0,WOOD,'plank');B(-11.4,6.3,1.3,1.3,1.6,0,WOOD,'plank');
  /* south east: three short containers in a row facing the deck */
  for(let i=0;i<3;i++)C(11.8,6.2+i*2.7,2.4,2.4,[ORG,RED,BLUE][i]);B(9.2,7.2,1.2,1.2,.8,0,WOOD,'plank');B(9.2,8.4,1.2,1.2,1.6,0,WOOD,'plank');
  /* north east: the control hut on stilts, stairs up on its west side, crates beneath */
  for(const[px,pz]of[[8.6,-12.1],[12.4,-12.1],[8.6,-8.9],[12.4,-8.9]])B(px,pz,.4,.4,2.6,0,0x6a655a,'metal');
  MK.room(B,{x:10.5,z:-10.5,w:4.4,d:3.6,h:2.5,y0:2.6,c:0xc9c2b0,k:'stucco',roof:1,rc:0x6a4a3a,rk:'shingle',dr:{w:[[0,1.2,2.2]]},wn:{n:[[-.9,1.2],[1,1]],e:[[0,1.4]],s:[[0,1.6]]}});
  B(10.5,-10.5,4.4,3.6,2.6,2.2,0x555a60,'plank');
  MK.stairs(B,3.8,-10.5,1.6,8,'e',0x6a655a,'metal',.325,.55,0);B(10.5,-10.5,.8,.8,3.0,2.6,0x3a3c40,'metal');
  B(6.4,-6.6,1.6,1.6,1.2,0,WOOD,'plank');B(7.6,-5.4,1.2,1.2,.8,0,WOOD,'plank');B(13,-6,1.3,3.2,1.3,0,GRN,'metal');
  /* low cover around the deck so the middle has places to hide */
  B(-4.8,-6.4,1.6,1.1,1.1,0,WOOD,'plank');B(4.2,6.6,1.6,1.1,1.1,0,WOOD,'plank');B(-5.6,6.2,1.2,1.2,.9,0,GRY,'metal');B(5.8,-7,1.2,1.2,.9,0,GRY,'metal');B(0,-9.4,3.2,.6,1,0,CONC,'concrete');B(0,9.6,.6,3.2,1,0,CONC,'concrete');
  /* a forklift parked by the stern stairs */
  B(-12.4,3.2,2.4,1.2,1.1,0,YEL,'metal');V(-12.4,3.2,1.2,1.1,1.6,1.1,0x2a2c30,'b');V(-13.9,3.2,.2,.9,2.2,0,0x6a6a6e,'b');V(-11.6,2.6,.3,.3,.8,.05,0x111111,'c');V(-11.6,3.8,.3,.3,.8,.05,0x111111,'c');
  /* ---- dressing outside the play area: quay edge, bollards, the gantry crane, distant stacks ---- */
  for(let i=-8;i<=8;i++){V(i*2,-16.2,.16,.16,1,0,0x2a2a2a,'c');V(i*2,16.2,.16,.16,1,0,0x2a2a2a,'c');V(-16.2,i*2,.16,.16,1,0,0x2a2a2a,'c');V(16.2,i*2,.16,.16,1,0,0x2a2a2a,'c')}
  for(const s of[-1,1]){V(s*15.4,-15.6,1,1,13,0,YEL,'b','metal');V(s*15.4,15.6,1,1,13,0,YEL,'b','metal')}V(0,-15.6,31,1.1,1.1,13,YEL,'b','metal');V(0,15.6,31,1.1,1.1,13,YEL,'b','metal');V(-4,-15.6,2.4,1.4,1.4,11.6,0x2a2c30,'b');V(5,15.6,2.4,1.4,1.4,11.6,0x2a2c30,'b');
  for(let i=0;i<7;i++){const c=[RED,BLUE,GRN,ORG,GRY][i%5];V(-30+i*2.6,-22,2.4,6,2.4,0,c,'b','metal');V(-29.5+i*2.7,-22,2.4,6,2.4,2.4,[GRN,ORG,RED,GRY,BLUE][i%5],'b','metal')}
  for(let i=0;i<5;i++)V(24+i*2.6,24,2.4,6,2.4,0,[BLUE,RED,ORG,GRN,GRY][i%5],'b','metal');
  V(0,-30,60,30,.04,-.2,0x2f5f7a,'b');V(0,34,60,26,.04,-.2,0x2f5f7a,'b');
  return a}};
;

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
 const debris=new THREE.InstancedMesh(geometry,material,84);
 debris.setColorAt(0,new THREE.Color(0xffffff));debris.count=0;
 debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage);debris.frustumCulled=false;root.add(debris);
 const pose=new THREE.Object3D(),tint=new THREE.Color(),sectors=new Map(),bounds=new THREE.Box3();
 for(const block of blocks){
  const key=Math.floor(block.x/16)+':'+Math.floor(block.z/16);
  let sector=sectors.get(key);
  if(!sector)sectors.set(key,sector={blocks:[],mesh:null});
  block.sector=sector;block.slot=sector.blocks.length;sector.blocks.push(block);
 }
 for(const sector of sectors.values()){
  const batchGeometry=geometry.clone(),mesh=new THREE.InstancedMesh(batchGeometry,material,sector.blocks.length);
  bounds.makeEmpty();
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.castShadow=mesh.receiveShadow=mesh.frustumCulled=true;
  for(const block of sector.blocks){
   pose.position.set((block.x+.5)*VOXEL_SIZE,(block.y+.5)*VOXEL_SIZE,(block.z+.5)*VOXEL_SIZE);
   pose.updateMatrix();mesh.setMatrixAt(block.slot,pose.matrix);
   bounds.expandByPoint(pose.position);
   const shade=.87+((Math.imul(block.i+7,139)>>>0)%27)*.009;
   mesh.setColorAt(block.slot,tint.setHex(block.color).multiplyScalar(shade));
  }
  batchGeometry.boundingSphere=bounds.expandByScalar(.353).getBoundingSphere(new THREE.Sphere());
  sector.mesh=mesh;root.add(mesh);
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
 voxelWorld={root,blocks,cells,debris,pose,tint,support,swapMatrix:new THREE.Matrix4(),removed:new Set(),chips:[],navAt:0,dirty:false};
 root.addEventListener('removed',()=>{
  if(voxelWorld?.root===root)voxelWorld=null;
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
 const {mesh}=b.sector;
 mesh.setColorAt(b.slot,field.tint.setHex(b.color).multiplyScalar(.55+.4*b.hp/voxelMaterials[b.type].hp));
 mesh.instanceColor.needsUpdate=true;
}
function voxelRemove(field,ids,visual=true){
 if(!ids.length)return;
 const dead=new Set();
 for(const i of ids){
  const b=field.blocks[i];if(!b?.alive)continue;
  b.alive=false;field.cells.delete(b.key);field.removed.add(i);dead.add(b.bounds);
  const {mesh,blocks}=b.sector,last=blocks.pop();
  // Keep instance slots dense as blocks are destroyed. Network IDs stay tied to blocks.
  if(last!==b){
   mesh.getMatrixAt(last.slot,field.swapMatrix);mesh.setMatrixAt(b.slot,field.swapMatrix);
   mesh.getColorAt(last.slot,field.tint);mesh.setColorAt(b.slot,field.tint);
   blocks[b.slot]=last;last.slot=b.slot;
   mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
  }
  mesh.count=blocks.length;
  if(visual)voxelChip(field,b,5.8);
 }
 if(!dead.size)return;
 removeCollisionBoxes(dead);
 field.dirty=true;
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
