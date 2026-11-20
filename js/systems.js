/* One rear profile, front guard, tip and hip mark for each weapon. Profiles are in millimetres
   relative to the sightline. The model's mounting coordinates are supplied by its builder. */
const IRON_SIGHTS={
 AR:{rear:[[-25,11],[-17,9],[-11,-9],[11,-9],[17,9],[25,11]],front:[[-14,7],[-12,-7],[12,-7],[14,7]],tip:'wedge',color:0xe66547,hip:[[-13,-5,-8,0,-13,5],[13,-5,8,0,13,5],[0,7,0,12]]},
 SMG:{rear:[[0,16],[11,12],[16,0],[11,-12],[0,-16],[-11,-12],[-16,0],[-11,12],[0,16]],front:[[-14,3],[-8,-8],[8,-8],[14,3]],tip:'pin',color:0xe2e9cd,hip:[[-11,0,-7,0],[11,0,7,0],[-3,-8,0,-10,3,-8]]},
 BR:{rear:[[-24,8],[-12,8],[-12,-8],[12,-8],[12,8],[24,8]],front:[[-18,4],[-18,-10],[18,-10],[18,4]],tip:'blade',color:0xd9e8b2,hip:[[-14,-6,-14,6],[-14,0,-7,0],[14,-6,14,6],[14,0,7,0],[0,7,0,11]]},
 SG:{rear:[[-15,-12],[-7,-12],[0,-5],[7,-12],[15,-12]],front:[[-10,-11],[-5,-7],[5,-7],[10,-11]],tip:'bead',color:0xe6b55b,hip:[[0,-13,10,-9,14,0,10,9,0,13,-10,9,-14,0,-10,-9,0,-13]]},
 MG:{rear:[[-20,6],[-10,6],[-7,-5],[7,-5],[10,6],[20,6]],front:[[-10,-10],[0,-5],[10,-10]],tip:'ramp',color:0xf37d3f,hip:[[-11,-5,-8,-5,-8,5,-11,5],[11,-5,8,-5,8,5,11,5],[0,-9,0,-6]]},
 MP:{rear:[[-16,3],[-16,-11],[16,-11],[16,3]],front:[[-12,-1],[-12,-9],[12,-9],[12,-1]],tip:'fiber',color:0x91dc86,hip:[[-10,-9,-10,6,-6,10],[10,-9,10,6,6,10]]},
 VA:{rear:[[-17,-9],[-17,8],[-9,16],[9,16],[17,8],[17,-9],[9,-16],[-9,-16],[-17,-9]],front:[[-17,5],[-13,10],[-9,-8],[9,-8],[13,10],[17,5]],tip:'diamond',color:0xc7d2aa,hip:[[-12,-7,-8,-7,-8,-5],[12,-7,8,-7,8,-5],[-12,7,-8,7,-8,5],[12,7,8,7,8,5],[0,-13,0,-9]]},
 BP:{rear:[[-24,6],[-19,-11],[19,-11],[24,6]],front:[[-15,0],[-12,-10],[0,-13],[12,-10],[15,0]],tip:'bead',color:0xfda753,hip:[[-14,-6,-8,-12,8,-12,14,-6],[-14,6,-8,12,8,12,14,6],[0,7,0,10]]},
 KTS:{rear:[[-24,5],[-16,11],[-9,-6],[0,-12],[9,-6],[16,11],[24,5]],front:[[-13,8],[-10,-2],[0,-9],[10,-2],[13,8]],tip:'fiber',color:0xb4de65,hip:[[-15,-7,-10,-7,-10,-4],[-15,7,-10,7,-10,4],[15,-7,10,-7,10,-4],[15,7,10,7,10,4],[0,-10,0,-8]]},
 RD:{rear:[[-20,-7],[-15,-17],[15,-17],[20,-7],[20,10],[13,13],[-13,13],[-20,10],[-20,-7]],front:[[-15,-6],[-9,-12],[9,-12],[15,-6]],tip:'crown',color:0xebc58a,hip:[[-15,-4,-12,-8,-7,-8],[15,-4,12,-8,7,-8],[-15,4,-12,8,-7,8],[15,4,12,8,7,8]]},
 HC:{rear:[[-24,8],[-12,8],[-12,-6],[12,-6],[12,8],[24,8]],front:[[-13,-3],[-7,-10],[7,-10],[13,-3]],tip:'brick',color:0xffae66,hip:[[-14,-7,-8,0,-14,7],[14,-7,8,0,14,7],[0,-10,3,-7],[0,-10,-3,-7]]},
 OH:{rear:[[-23,4],[-16,8],[-10,-4],[0,-13],[10,-4],[16,8],[23,4]],front:[[-11,7],[-6,-10],[6,-10],[11,7]],tip:'wedge',color:0xdce6bc,hip:[[0,-13,0,-6],[-10,4,-6,4,-4,6],[10,4,6,4,4,6],[0,9,0,13]]},
 RL:{rear:[[-16,-13],[-16,23],[-8,23],[8,23],[16,23],[16,-13],[-16,-13]],front:[[-17,6],[-12,12],[-6,-8],[6,-8],[12,12],[17,6]],tip:'crown',color:0xf7c34b,hip:[[-13,-13,-13,13],[13,-13,13,13],[-13,-10,-7,-10],[13,-10,7,-10],[-13,10,-7,10],[13,10,7,10],[0,8,0,13]]},
 SN:{rear:[[-17,7],[-11,7],[-8,-7],[8,-7],[11,7],[17,7]],front:[[-11,3],[-7,-11],[7,-11],[11,3]],tip:'needle',color:0xcce5ed,hip:[[0,-13,0,-4],[0,13,0,4],[-13,0,-5,0],[13,0,5,0],[-2,8,2,8]]},
 VMP:{rear:[[-19,-8],[-19,5],[-12,14],[0,18],[12,14],[19,5],[19,-8]],front:[[-18,4],[-13,10],[-10,2],[-9,-11],[9,-11],[10,2],[13,10],[18,4]],tip:'prism',color:0xf8d75e,hip:[[-12,-4,-9,-9,-4,-12],[12,-4,9,-9,4,-12],[0,7,0,11],[-10,4,-7,7],[10,4,7,7]]},
 CY:{rear:[[-30,3],[-22,15],[-15,15],[-15,-12],[15,-12],[15,15],[22,15],[30,3]],front:[[-21,6],[-17,12],[-12,-11],[12,-11],[17,12],[21,6]],tip:'pillar',color:0xa6d966,hip:[[-15,-10,-12,-7,-12,6,-15,10],[15,-10,12,-7,12,6,15,10],[-3,11,3,11],[0,-12,0,-7]]},
 RG:{rear:[[0,22],[15,13],[22,0],[15,-13],[0,-20],[-15,-13],[-22,0],[-15,13],[0,22]],front:[[-19,3],[-14,-12],[0,-17],[14,-12],[19,3]],tip:'orb',color:0xff503b,hip:[[0,-15,12,0,0,15,-12,0,0,-15],[0,-9,0,-6],[0,9,0,6]]},
 CT:{rear:[[-19,4],[-9,4],[-9,-6],[9,-6],[9,4],[19,4]],front:[[-8,-13],[8,-13]],tip:'bead',color:0xf1eee4,hip:[[-11,0,-7,0],[11,0,7,0],[0,5,0,9]]},
 MVR:{rear:[[-15,-10],[-15,9],[-8,15],[8,15],[15,9],[15,-10],[8,-16],[-8,-16],[-15,-10]],front:[[-18,-2],[-14,7],[-9,-10],[9,-10],[14,7],[18,-2]],tip:'blade',color:0xd3be76,hip:[[-13,-9,-13,-3,-8,0,-13,3,-13,9],[13,-9,13,-3,8,0,13,3,13,9]]},
 TUR:{rear:[[-22,11],[-15,14],[-15,-12],[-7,-17],[7,-17],[15,-12],[15,14],[22,11]],front:[[-18,6],[-18,-5],[-12,-11],[12,-11],[18,-5],[18,6]],tip:'prism',color:0x9eced9,hip:[[-10,-7,-6,-10,-4,-10],[10,-7,6,-10,4,-10],[10,7,6,10,4,10],[-10,7,-6,10,-4,10],[0,6,0,9]]},
 TRB:{rear:[[-14,11],[0,17],[14,11],[14,-8],[0,-14],[-14,-8],[-14,11]],front:[[-13,7],[-9,-10],[0,-14],[9,-10],[13,7]],tip:'needle',color:0xe0dfcf,hip:[[-12,-6,-8,-3],[-13,0,-8,0],[-12,6,-8,3],[12,-6,8,-3],[13,0,8,0],[12,6,8,3]]},
 DS:{rear:[[-14,9],[-20,2],[-14,-10],[14,-10],[20,2],[14,9]],front:[[-14,10],[-10,-10],[10,-10],[14,10]],tip:'fork',color:0xe7a658,hip:[[-13,-6,-9,-6,-9,6,-13,6],[13,-6,9,-6,9,6,13,6],[-5,0,-3,0],[5,0,3,0]]},
 TEA:{rear:[[-25,4],[-19,12],[-13,-8],[-7,-15],[7,-15],[13,-8],[19,12],[25,4]],front:[[-18,3],[-13,14],[-9,-12],[9,-12],[13,14],[18,3]],tip:'orb',color:0xffbf57,hip:[[-13,-8,-13,3,-8,9,8,9,13,3,13,-8],[-7,-10,7,-10],[0,9,0,13]]},
 MNG:{rear:[[-26,9],[-22,-8],[-17,-15],[17,-15],[22,-8],[26,9]],front:[[-20,11],[-20,-10],[0,-15],[20,-10],[20,11]],tip:'fork',color:0xe7c591,hip:[[-15,-9,-15,-4],[-15,4,-15,9],[15,-9,15,-4],[15,4,15,9],[-7,11,0,14,7,11],[-7,-11,0,-14,7,-11]]},
 GL:{rear:[[-19,-11],[-19,21],[-12,21],[-12,-5],[12,-5],[12,21],[19,21],[19,-11]],front:[[-16,4],[-10,-6],[0,-11],[10,-6],[16,4]],tip:'diamond',color:0xffd87f,hip:[[-13,-7,-13,7,-7,7],[13,-7,13,7,7,7],[0,4,0,7],[-3,9,3,9],[-5,12,5,12]]},
 FT:{rear:[[-23,13],[-26,5],[-19,-10],[0,-17],[19,-10],[26,5],[23,13]],front:[[-19,1],[-14,-8],[-7,-12],[7,-12],[14,-8],[19,1]],tip:'flame',color:0xff9a4d,hip:[[-15,4,-11,9,-6,10],[15,4,11,9,6,10],[0,-13,-5,-6,-4,-2],[0,-13,5,-6,4,-2]]}
};

function mkSights(g,key,{yt,yb,yf,zr,zf,xt=0}){
 const profile=IRON_SIGHTS[key];
 if(!profile)return;
 const palette=mkSights.palette||(mkSights.palette={
  steel:new THREE.MeshLambertMaterial({color:0x283239}),
  trim:new THREE.MeshLambertMaterial({color:0x535c62}),marks:new Map()
 });
 let mark=palette.marks.get(profile.color);
 if(!mark){mark=new THREE.MeshBasicMaterial({color:profile.color,toneMapped:false});palette.marks.set(profile.color,mark)}
 const mount=new THREE.Group();
 mount.name=key+' iron sights';mount.position.x=xt;mount.userData.ironSights=key;g.add(mount);
 const place=(geo,x,y,z,m,rz=0)=>{
  const part=new THREE.Mesh(geo,m);part.position.set(x,y,z);part.rotation.z=rz;
  part.userData.sightPart=true;if(m===mark)part.userData.glow=true;
  mount.add(part);return part;
 };
 const box=(w,h,d,x,y,z,m=palette.steel,rz=0)=>{
  const part=place(bg,x,y,z,m,rz);part.userData.lxB=1;part.scale.set(w,h,d);
 };
 const trace=(points,z,thickness,depth)=>{
  for(let i=1;i<points.length;i++){
   const [x,y]=points[i-1],[u,v]=points[i],dx=(u-x)*.001,dy=(v-y)*.001;
   box(Math.hypot(dx,dy)+thickness*.7,thickness,depth,(x+u)*.0005,yt+(y+v)*.0005,z,palette.steel,Math.atan2(dy,dx));
  }
 };
 const base=(points,z,y,width)=>{
  const top=yt+Math.min(...points.map(p=>p[1]))*.001;
  box(width,.008,.021,0,y+.003,z,palette.trim);
  if(top>y+.006)box(.013,top-y,.013,0,(top+y)/2,z);
 };
 base(profile.rear,zr,yb,.041);base(profile.front,zf,yf,.028);
 trace(profile.rear,zr,key==='SG'?.003:.0045,.012);
 trace(profile.front,zf,.0036,.011);
 if(key==='RL'||key==='GL')for(const offset of [.015,.007,-.007])for(const side of [-1,1])box(.006,.002,.013,side*.013,yt+offset,zr,palette.trim);
 const h=Math.max(.009,yt-yf-.004);
 box(profile.tip==='pillar'?.006:.0045,h,.007,0,yt-h/2-.002,zf);
 const towardEye=zf>zr?-1:1,markZ=zf+towardEye*.004;
 switch(profile.tip){
  case 'bead': case 'orb':{
   const bead=place(sg,0,yt,markZ,mark);bead.scale.setScalar(profile.tip==='orb'?.0045:.0029);break;
  }
  case 'diamond':box(.005,.005,.004,0,yt,markZ,mark,Math.PI/4);break;
  case 'wedge':case 'prism':case 'flame':case 'needle':{
   const width=profile.tip==='needle'?.0019:profile.tip==='flame'?.0045:.003;
   place(new THREE.ConeGeometry(width,.009,profile.tip==='prism'?4:3),0,yt-.0045,markZ,mark);break;
  }
  case 'fork':for(const side of [-1,1])box(.0022,.008,.004,side*.0028,yt-.004,markZ,mark);break;
  case 'crown':box(.009,.0024,.004,0,yt-.0012,markZ,mark);box(.003,.006,.004,0,yt-.003,markZ,mark);break;
  case 'ramp':box(.005,.009,.005,0,yt-.003,markZ,mark,-.2);break;
  case 'brick':box(.008,.005,.004,0,yt-.0025,markZ,mark);break;
  case 'fiber':box(.003,.008,.004,0,yt-.002,markZ,mark);break;
  default:box(.003,.005,.004,0,yt-.0025,markZ,mark);
 }
 g.userData.sight={xt,yt,zr};
}

const hipReticleCache=new Map();
function setHipReticle(key){
 const el=$('#cx'),profile=IRON_SIGHTS[key];
 if(!el||!profile||el.dataset.weapon===key)return;
 let url=hipReticleCache.get(key);
 if(!url){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=120;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.translate(60,60);ctx.scale(3,3);ctx.strokeStyle=ctx.fillStyle='#fff';ctx.lineWidth=1.45;ctx.lineCap='round';ctx.lineJoin='round';
  for(const path of profile.hip){
   ctx.beginPath();ctx.moveTo(path[0],path[1]);
   for(let i=2;i<path.length;i+=2)ctx.lineTo(path[i],path[i+1]);
   ctx.stroke();
  }
  if(key!=='DS'){ctx.beginPath();ctx.arc(0,0,key==='SN'?.65:1,0,Math.PI*2);ctx.fill()}
  url=canvas.toDataURL();hipReticleCache.set(key,url);
 }
 el.dataset.weapon=key;el.style.setProperty('--reticle','url('+url+')');
}

;
/* ######## systems.js ######## */
/* ===================== juice.js ===================== */
/* ---------- juice: particles, shake, sounds, medals, best scores ---------- */
var pts=[],mc={},sw={x:0,y:0},muz=new THREE.PointLight(0xffc060,0,12);muz.position.set(.2,-.15,-1);C.add(muz);
const burstCapacity=320,burstPool=[],burstMatrix=new THREE.Matrix4(),burstMaterials=new Map();
const burstMesh=R.capabilities.isWebGL2||R.extensions.has('ANGLE_instanced_arrays')?
 new THREE.InstancedMesh(bg,new THREE.MeshBasicMaterial({color:0xffffff}),burstCapacity):null;
if(burstMesh){
 burstMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 burstMesh.setColorAt(0,new THREE.Color(0xffffff));
 burstMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
 burstMesh.count=0;burstMesh.visible=false;burstMesh.frustumCulled=false;S.add(burstMesh);
}
var shake=0,flashL=0,fk=0,streak=0,lastKillT=-9;
function burst(p,n,col,sp,life,sz){
 if(pts.length>=burstCapacity||n<=0)return;
 const color=mc[col]||(mc[col]=new THREE.Color(col));
 for(let i=0;i<n&&pts.length<burstCapacity;i++){
  const part=burstPool.pop()||{p:V(),v:V()};
  part.p.copy(p);part.s=sz*(.5+Math.random());
  part.v.set(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(sp*(.3+Math.random()));
  part.l=part.life=life;part.color=color;
  if(burstMesh){
   burstMesh.setMatrixAt(pts.length,burstMatrix.makeScale(part.s,part.s,part.s).setPosition(part.p));
   burstMesh.setColorAt(pts.length,color);
  }else{
   if(!burstMaterials.has(color))burstMaterials.set(color,new THREE.MeshBasicMaterial({color}));
   const mesh=part.mesh||(part.mesh=new THREE.Mesh(bg));
   mesh.material=burstMaterials.get(color);mesh.position.copy(part.p);mesh.scale.setScalar(part.s);S.add(mesh);
  }
  pts.push(part);
 }
 if(burstMesh){
  burstMesh.count=pts.length;burstMesh.visible=true;
  burstMesh.instanceMatrix.needsUpdate=true;burstMesh.instanceColor.needsUpdate=true;
 }
}
function noise(d,f,v){try{ac=ac||new AudioContext();const n=ac.sampleRate*d,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=f;g.gain.value=v*vol;s.connect(fl).connect(g).connect(PlayerAudio.output(ac));s.start()}catch(e){}}
/* every weapon has its own synthesized shot: n = noise layers [dur, filter, freq, vol, delay, Q, decay], o = tone layers [wave, f0, f1, dur, vol, delay] */
var GS={
 AR:{n:[[.09,'lowpass',4200,.32],[.03,'highpass',3000,.2]],o:[['square',230,90,.07,.1]]},
 MVR:{n:[[.2,'lowpass',2300,.5,0,.7,1.3],[.04,'highpass',2600,.28],[.34,'lowpass',700,.22,.05,.7,2.4]],o:[['sawtooth',150,42,.17,.24],['sine',80,32,.2,.3]]},
 SMG:{n:[[.05,'lowpass',6500,.22],[.02,'highpass',4500,.14]],o:[['triangle',420,200,.04,.1]]},
 BR:{n:[[.14,'lowpass',3000,.42],[.03,'highpass',2400,.3],[.2,'bandpass',900,.16,.04]],o:[['square',140,48,.13,.16],['sine',70,30,.15,.2]]},
 SG:{n:[[.3,'lowpass',1500,.62,0,.7,1.2],[.14,'bandpass',2600,.3,.03],[.35,'lowpass',500,.25,.06,.7,2.2]],o:[['sine',75,32,.28,.34]]},
 MG:{n:[[.22,'lowpass',3800,.5],[.03,'highpass',3200,.35],[.45,'lowpass',900,.22,.05,.7,2.5]],o:[['sine',120,38,.25,.3],['triangle',900,300,.05,.1]]},
 MP:{n:[[.04,'lowpass',5200,.2],[.02,'bandpass',3500,.18,0,3]],o:[['sawtooth',560,250,.04,.12]]},
 SN:{n:[[.07,'highpass',2800,.42],[.7,'lowpass',650,.34,.02,.7,2.8],[.2,'bandpass',1800,.22,.12,1.2,2]],o:[['sine',95,28,.4,.34],['square',1400,300,.04,.1]]},
 RL:{n:[[.7,'lowpass',500,.55,0,.7,1.1],[.5,'bandpass',1300,.2,.1,.8,1.8]],o:[['sawtooth',110,34,.5,.2],['sine',55,26,.45,.3]]},
 VMP:{n:[[.055,'lowpass',2300,.26],[.02,'highpass',5200,.1]],o:[['triangle',320,120,.05,.12],['sine',900,500,.02,.03]]},
 CY:{n:[[.13,'lowpass',2300,.42],[.03,'highpass',2000,.22],[.18,'lowpass',600,.2,.03,.7,2]],o:[['square',105,55,.1,.18],['sine',60,30,.12,.2]]},
 CT:{n:[[.1,'lowpass',4800,.4],[.025,'highpass',3600,.3],[.18,'bandpass',1100,.14,.03]],o:[['square',210,75,.09,.14],['triangle',1600,600,.02,.06,.01]]},
 SW:{n:[[.085,'bandpass',3080,.49],[.16,'lowpass',790,.21,.01]],o:[['triangle',155,57,.11,.1]]},
 LT:{n:[[.057,'bandpass',4200,.45],[.081,'highpass',1190,.19,.009]],o:[['sine',144,86,.066,.08]]},
 PD:{n:[[.14,'lowpass',1450,.62],[.045,'bandpass',2420,.26],[.16,'highpass',1330,.15,.088]],o:[['triangle',133,36,.17,.2]]},
 VA:{n:[[.09,'bandpass',3350,.43],[.18,'lowpass',870,.23,.018]],o:[['triangle',188,63,.13,.12]]},
 BP:{n:[[.28,'lowpass',1300,.63],[.09,'bandpass',2300,.31],[.06,'bandpass',1250,.12,.29],[.035,'highpass',2200,.12,.45]],o:[['sine',69,29,.25,.33]]},
 KTS:{n:[[.19,'lowpass',1880,.6],[.065,'bandpass',2950,.29],[.03,'bandpass',1650,.14,.1]],o:[['sine',91,41,.17,.23]]},
 RD:{n:[[.08,'bandpass',2500,.34],[.035,'highpass',4050,.2]],o:[['triangle',265,118,.062,.12]]},
 HC:{n:[[.2,'lowpass',2100,.57],[.035,'highpass',4050,.32],[.22,'lowpass',615,.16,.045]],o:[['sawtooth',147,42,.13,.18]]},
 OH:{n:[[.045,'highpass',3500,.51],[.33,'lowpass',695,.37,.025],[.17,'bandpass',1850,.2,.045]],o:[['sine',105,32,.21,.27]]},
 MNG:{n:[[.05,'lowpass',5000,.2],[.02,'highpass',3000,.12]],o:[['square',300,160,.04,.08]]},
 GL:{n:[[.25,'lowpass',900,.4],[.1,'bandpass',1800,.2,.03]],o:[['sine',100,40,.25,.3],['square',200,60,.1,.1]]},
 FT:{n:[[.25,'bandpass',1400,.3,0,.5,.6],[.2,'lowpass',500,.25]],o:[['sawtooth',90,60,.2,.08]]}};
function snd(p,a){try{ac=ac||new AudioContext();const t=ac.currentTime,v=(a==null?1:a)*vol;
 for(const n of p.n||[]){const len=Math.max(8,ac.sampleRate*n[0]|0),b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0),ex=n[6]||1.6;for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,ex);
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type=n[1];f.frequency.value=n[2];f.Q.value=n[5]||.7;g.gain.value=n[3]*v;s.connect(f).connect(g).connect(PlayerAudio.output(ac));s.start(t+(n[4]||0))}
 for(const o of p.o||[]){const os=ac.createOscillator(),g=ac.createGain(),dl=o[5]||0;os.type=o[0];os.frequency.setValueAtTime(o[1],t+dl);os.frequency.exponentialRampToValueAtTime(Math.max(20,o[2]),t+dl+o[3]);g.gain.setValueAtTime(o[4]*v,t+dl);g.gain.exponentialRampToValueAtTime(.0001,t+dl+o[3]);os.connect(g).connect(PlayerAudio.output(ac));os.start(t+dl);os.stop(t+dl+o[3]+.03)}}catch(e){}}
function gunSnd(w){if(w.k=='TEA')return;if(w.pap&&typeof papSnd=='function'&&mode=='Zombies'){if(w.k=='RG')pew();return papSnd(w,w.k=='RG')}if(w.k=='RG')return pew();if(GS[w.k])return snd(GS[w.k]);noise(w.pel>1?.22:.1,w.pel>1?1800:3500,.3);beep(w.pel>1?90:140,.08,'sine',.12)}
function msg(t,s){const e=$('#ms');e.textContent=typeof PG!='undefined'?PG.t(t):t;msT=s||2;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
function floatTxt(p,t,c){const q=p.clone().project(C);if(q.z>1)return;const e=document.createElement('div');e.className='ft';e.textContent=t;e.style.cssText=`left:${(q.x*.5+.5)*innerWidth}px;top:${(-q.y*.5+.5)*innerHeight}px;color:${c}`;$('#hud').appendChild(e);setTimeout(()=>e.remove(),800)}
function juiceHit(b,d,head){b.fl=.08;burst(V(b.x,head?1.75:1,b.z),head?9:5,head?0xffd24a:0xffffff,4,.3,.07);floatTxt(V(b.x+(Math.random()-.5)*.6,2.2,b.z),Math.round(d)+(head?'!':''),head?'#ffd24a':'#ffffff')}
function juiceKill(b,head){burst(V(b.x,1,b.z),26,0xb5452e,7,.9,.18);burst(V(b.x,1.4,b.z),8,0x62e0f0,5,.7,.1);shake=Math.max(shake,.3);beep(1200,.12,'triangle',.07);setTimeout(()=>beep(1700,.14,'triangle',.06),70);
 streak=t0-lastKillT<3.5?streak+1:1;lastKillT=t0;const m=['','Headshot!','Double Kill!','Triple Kill!','Overkill!','Killing Spree!'];msg(streak>1?m[Math.min(streak,5)]:head?m[1]:'+1 Kill',1.3)}
function juiceReset(){if(burstMesh){burstMesh.count=0;burstMesh.visible=false}else for(const p of pts)S.remove(p.mesh);burstPool.push(...pts);pts.length=0;streak=0;lastKillT=-9;shake=0;const h=$('#hint');h.style.opacity=1;setTimeout(()=>h.style.opacity=0,11000);msg(practiceSession?'Static and moving targets from 10 to 50 m':MODES[mode]||'First to 15 kills',3)}
function juiceTick(dt){
 shake*=Math.exp(-7*dt);if(shake>.01){C.position.x+=(Math.random()-.5)*shake*shk*.25;C.position.y+=(Math.random()-.5)*shake*shk*.25;C.rotation.z=(Math.random()-.5)*shake*shk*.06}
 fk*=Math.exp(-10*dt);C.fov+=(fovBase*(1-ST.ads*ST.zoom)+fk*4+(P.spr||0)*5-C.fov)*Math.min(1,dt*10);C.updateProjectionMatrix();
 flashL*=Math.exp(-28*dt);muz.intensity=flashL*3;sw.x*=Math.exp(-8*dt);sw.y*=Math.exp(-8*dt);gun.rotation.y=sw.x;gun.rotation.z=sw.x*.5+sw.y*.3+rlRoll();
 $('#cx').style.transform=`scale(${(tg?.85:1)+kick*30})`;if(P.hp<P.mhp*.35&&!P.dead)dmA=Math.max(dmA,.22+.12*Math.sin(t0*6));
 for(const b of bots)if(b.fl>0){b.fl-=dt;for(const c of b.m.children)if(c.material&&c.material.emissive)c.material.emissive.setHex(b.fl>0?0x999999:0)}
 if(pts.length){
  let count=0,compacted=false;
  for(let i=0;i<pts.length;i++){
   const part=pts[i];part.l-=dt;
   if(part.l<=0){if(part.mesh)S.remove(part.mesh);burstPool.push(part);compacted=true;continue}
   part.v.y-=16*dt;part.p.addScaledVector(part.v,dt);
   if(part.p.y<.05){part.p.y=.05;part.v.multiplyScalar(.4);part.v.y=0}
   const scale=part.s*Math.min(1,part.l/part.life*1.6);
   if(burstMesh){
    burstMesh.setMatrixAt(count,burstMatrix.makeScale(scale,scale,scale).setPosition(part.p));
    if(compacted)burstMesh.setColorAt(count,part.color);
   }else{part.mesh.position.copy(part.p);part.mesh.scale.setScalar(scale)}
   pts[count++]=part;
  }
  pts.length=count;
  if(burstMesh){
   burstMesh.count=count;burstMesh.visible=count>0;
   burstMesh.instanceMatrix.needsUpdate=true;
   if(compacted)burstMesh.instanceColor.needsUpdate=true;
  }
 }}
function endGame(t){if(over)return;if(netOn&&isHost&&mode!='Private')mpEnd(t);over=1;run=0;paused=0;won=t=='Victory';document.exitPointerLock&&document.exitPointerLock();const sc=mode=='Slayer'?Math.max(0,3000-Math.round(t0*10)):kills*100+(mode=='Survival'?wave*50:mode=='Zombies'&&zq?zq.r*200:0),k='sd-best-'+mode+sel.map;let best=0,nb='';try{best=+localStorage.getItem(k)||0;if(sc>best){localStorage.setItem(k,sc);nb=' · New best!'}}catch(e){}
 const xp=awardXP();
 passFinishMatch(t);
 if(mode!='Zombies'&&mode!='Survival'){chEv('matches');if(won)chEv('wins')}
 saveCombatRecord(t);clearSquadMarks();arenaSoundCaptions.clear();finStart(t,sc,nb,xp);resetLifeLoadouts()}

/* ===================== features.js ===================== */
/* ---------- Call of Duty x Halo features: melee, radar, killstreaks, power weapons, pickups, XP ranks, kill feed ---------- */
W.RL={n:'Rocket Launcher',d:1,r:1.1,m:2,sp:.002,rc:8,pel:1,au:0,rl:2.5,len:.7,col:0x7a3a2a,ex:{R:7,d:140,imp:0,w:'RL'}};
W.SN={n:'Sniper Rifle',d:110,r:.9,m:4,sp:.0005,rc:6,pel:1,au:0,rl:3,len:.8,col:0x2a2f4a};
var PN={RL:'Rocket Launcher',SN:'Sniper Rifle',OS:'Overshield',HP:'Health',AM:'Ammo'},PC={RL:0xff5a3a,SN:0xb080ff,OS:0x62e0f0,HP:0x7bd86b,AM:0xffd24a},TITLES=['Recruit','Private','Corporal','Sergeant','Lieutenant','Captain','Major','Colonel','General','Spartan'];
var pk=[],ks=0,q=[],uav=0,mxp=0,mn=0,src='';
function featReset(){for(const p of pk)S.remove(p.m);pk=[];ks=0;q=[];uav=0;mxp=0;mUps=[];mCost=need();mn=0;$('#kf').innerHTML='';
 for(const t of mode=='Zombies'||practiceSession?[]:['RL','SN','OS','HP','AM','AM']){const[x,z]=spawnPt(0),m=new THREE.Group(),b=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:PC[t]}));b.scale.setScalar(.6);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,6,8),new THREE.MeshBasicMaterial({color:PC[t],transparent:true,opacity:.18}));beam.position.y=3;m.add(b,beam);m.position.set(x,1,z);S.add(m);pk.push({t,x,z,m,b,on:1,rt:0,col:'#'+PC[t].toString(16).padStart(6,'0')})}}
function giveOS(){if(!P.os)P.msh+=50;P.os=20;P.sh=P.msh}
function grab(p){const t=p.t;p.on=0;p.m.visible=false;p.rt=t=='RL'||t=='SN'?45:25;beep(900,.12,'triangle',.08);msg(PN[t],1.2);
 if(t=='OS')giveOS();else if(t=='HP')P.hp=Math.min(P.mhp,P.hp+30);else if(t=='AM'){for(const w of wp)if(!w.pw){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}}
 else{let i=wp.findIndex(w=>w.k==t);if(i<0){wp.push({k:t,...eff(t,[]),pw:1,mag:0,res:0});i=wp.length-1}const w=wp[i];w.mag=w.m;w.res=w.m*2;cur=i;rel=0;setGun()}}
function feed(t){const e=document.createElement('div');e.textContent=t;$('#kf').prepend(e);while($('#kf').children.length>4)$('#kf').lastChild.remove();setTimeout(()=>e.remove(),4500)}
function featKill(b,head){ks++;if(PK('Quick Fix')&&run&&!P.dead){const heal=P.hp<P.mhp||P.sh<P.msh;P.hp=P.mhp;P.sh=P.msh;if(heal){beep(740,.07,'sine',.07);beep(1100,.1,'sine',.06);const f=$('#flash');if(f){f.style.transition='none';f.style.background='rgba(70,255,140,.35)';f.style.opacity=1;requestAnimationFrame(()=>{f.style.transition='opacity .5s';f.style.opacity=0})}msg('QUICK FIX',1)}}wkill(srcK);const x=killXP(head);feed(`You ▸ ${b.hb?b.nm:b.net?names[b.id]:b.nm||'Grunt'}  [${src}]${head?' ★':''}  +${x}`);
 if(typeof skAward=='function')skAward()}
function useStreak(i){i=i||0;if(mode=='Zombies')return zUse();if(q.length<=i||P.dead)return;const s=q.splice(i,1)[0];beep(500,.2,'sine',.1);
 if(s=='UAV'){uav=20;msg('UAV online',1.5)}else if(s=='Shield Boost'){giveOS();msg('Shield Boost!',1.5)}
 else carpetBomb()}
/* knife: one-shots early zombies, then needs more and more swings as the rounds climb (never fully useless) */
function zMel(b){const r=zq?zq.r:1;if(r<=2)return 9999;const hp=isFinite(b.mhp)&&b.mhp<1e8?b.mhp:zHp(r)*(b.big?3:1),n=Math.min(20,1+(r-2)*.6);return Math.ceil(hp/n)}
function melee(){if(t0<mn||P.dead)return;mn=t0+.55;src='Melee';srcK='';if(typeof katSwing=='function')katSwing();else gun.position.z=-1.05;noise(.12,2200,.25);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));mv(P,f.x*.7,f.z*.7,.4);kick+=.025;shake=Math.max(shake,.25);let n=0;
 for(const b of bots){if(!b.al||ally(b))continue;const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);if(D<3.1&&(dx*f.x+dz*f.z)/D>.2){hitBot(b,mode=='Zombies'?zMel(b):100,0);beep(1400,.06,'square',.05);if(++n>=3)break}}}
function dirInd(b){if(!b)return;lastDir.set(P.x-b.x,0,P.z-b.z).normalize();const r=Math.atan2(b.x-P.x,b.z-P.z)-(yaw+Math.PI),e=$('#di');e.style.transform=`rotate(${r}rad)`;e.style.animation='none';void e.offsetWidth;e.style.animation='di 1s forwards'}
let radarTerrain=null,radarTerrainRevision=-1;
const radarPixelsPerMeter=4;
function drawRadarTerrain(c,scale){
 indexCollisions();
 if(radarTerrainRevision!==collisionRevision){
  radarTerrain||=document.createElement('canvas');
  const m=radarPixelsPerMeter,size=Math.ceil(H*2*m),g=radarTerrain.getContext('2d');
  if(radarTerrain.width!==size||radarTerrain.height!==size)radarTerrain.width=radarTerrain.height=size;
  else g.clearRect(0,0,size,size);
  if(MAPS[sel.map].swim)drawQuarryRiverOnMap(g,x=>(x+H)*m,z=>(z+H)*m,m);
  for(const b of bx){
   if(b.h<=.9||(b.y0||0)>=2.5)continue;
   g.fillStyle=b.h>3?'rgba(150,165,175,.6)':b.h>1.5?'rgba(110,125,135,.55)':'rgba(85,100,110,.5)';
   g.fillRect((b.x0+H)*m,(b.z0+H)*m,(b.x1-b.x0)*m,(b.z1-b.z0)*m);
  }
  radarTerrainRevision=collisionRevision;
 }
 c.save();c.beginPath();c.arc(75,75,72,0,7);c.clip();
 c.translate(75,75);c.rotate(yaw);
 c.drawImage(radarTerrain,-(P.x+H)*scale,-(P.z+H)*scale,H*2*scale,H*2*scale);
 c.restore();
}
function radar(){const c=$('#rd').getContext('2d'),R0=(uav>0||(typeof SK!='undefined'&&(SK.prT>0||SK.advT>0)))?70:28,k=72/R0,s=Math.sin(yaw),co=Math.cos(yaw);c.clearRect(0,0,150,150);c.fillStyle='rgba(8,20,26,.65)';c.beginPath();c.arc(75,75,73,0,7);c.fill();c.strokeStyle=uav>0?'#62e0f0':'#62e0f044';c.beginPath();c.arc(75,75,36,0,7);c.stroke();drawRadarTerrain(c,k);
 const dot=(x,z,col,r)=>{const dx=x-P.x,dz=z-P.z,px=75+(dx*co-dz*s)*k,py=75-(-dx*s-dz*co)*k;if(Math.hypot(px-75,py-75)>70)return;c.fillStyle=col;c.fillRect(px-r,py-r,r*2,r*2)};
 for(const p of pk)if(p.on)dot(p.x,p.z,p.col,2);for(const f of flags)dot(f.x,f.z,f.team=='A'?'#62a8ff':'#ff5a3a',4);for(const z of zones)dot(z.x,z.z,z.o=='A'?'#62a8ff':z.o=='B'?'#ff5a3a':'#cccccc',4);if(typeof kcTags!='undefined')for(const g of kcTags)dot(g.x,g.z,g.red?'#ff3030':'#ffd21a',3);if(typeof skRadar=='function')skRadar(dot,(x,z)=>{const dx=x-P.x,dz=z-P.z;return[75+(dx*co-dz*s)*k,75-(-dx*s-dz*co)*k]},c);else for(const b of bots)if(b.al)dot(b.x,b.z,ally(b)?'#62e0f0':'#ff5a3a',3);for(const mark of ST.pings)dot(mark.m.position.x,mark.m.position.z,mark.color,3);c.fillStyle='#62e0f0';c.beginPath();c.moveTo(75,68);c.lineTo(70,80);c.lineTo(80,80);c.fill()}
function featTick(dt){uav-=dt;if(P.os>0){P.os-=dt;if(P.os<=0){P.msh-=50;P.sh=Math.min(P.sh,P.msh)}}
 for(const p of pk){if(p.on){p.m.rotation.y+=dt*2;p.m.position.y=1+Math.sin(t0*3)*.15;if(!P.dead&&Math.hypot(P.x-p.x,P.z-p.z)<1.3&&P.y<2.5)grab(p)}else{p.rt-=dt;if(p.rt<=0){p.on=1;p.m.visible=true}}}
 const w=cw();if(w&&w.pw&&w.mag<=0&&w.res<=0&&rel<=0){wp.splice(cur,1);cur=0;setGun()}
 ksHud();radar();camoFx()}

/* ===================== vmp.js ===================== */
/* ---------- VMP: very fast SMG with a custom model (long mag, top rail, toothed muzzle drum, gold accents) ---------- */
W.VMP={n:'VMP-X',d:24,r:.042,m:36,sp:.03,rc:.5,pel:1,au:1,rl:1.8,len:.55,col:0x23262b};PRI.push('VMP');
var vmpG=new THREE.Group(),dk=new THREE.MeshLambertMaterial({color:0x15171a}),gd=new THREE.MeshLambertMaterial({color:0xc9a94d});
var bp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;vmpG.add(p);return p};
bp(0,.06,.035,.38,0,.072,-.27,dk);mkSights(vmpG,'VMP',{yt:.125,yb:.09,yf:.09,zr:-.12,zf:-.44});bp(0,.084,.03,.18,0,.03,-.32,gd);
bp(new THREE.CylinderGeometry(.02,.022,.12,10),0,0,0,0,0,-.6,dk,Math.PI/2);bp(new THREE.CylinderGeometry(.05,.05,.07,12),0,0,0,0,0,-.5,dk,Math.PI/2);
bp(0,.06,.11,.2,0,-.01,.1,dk);bp(0,.04,.12,.05,0,-.1,-.08,dk,.25);vmpG.userData.mag=[bp(0,.04,.22,.065,0,-.2,-.15,dk,.12),bp(0,.042,.025,.067,0,-.13,-.15,gd,.12)];

/* ---------- KN-115: original AK-style rifle model (tri-prong muzzle, rail handguard, gas tube, curved copper mag, angular stock) ---------- */
W.AR.n='KN-115';
var knG=new THREE.Group(),dk2=new THREE.MeshLambertMaterial({color:0x2b2e33}),cu=new THREE.MeshLambertMaterial({color:0xb8651f}),tealM=new THREE.MeshLambertMaterial({color:0x3fd0c9});
var kp=(g,w,h,d,x,y,z,m,rx)=>{const p=new THREE.Mesh(g||bg,m);if(!g)p.scale.set(w,h,d);p.position.set(x,y,z);if(rx)p.rotation.x=rx;knG.add(p);return p},cyl=(r,l)=>new THREE.CylinderGeometry(r,r,l,10);
kp(0,.06,.025,.32,0,.062,-.2,dk);kp(0,.078,.012,.2,0,.03,-.2,tealM);
kp(0,.062,.1,.12,0,-.005,.04,dk2);kp(0,.066,.13,.26,0,-.012,.2,dk2);kp(0,.07,.17,.04,0,-.022,.34,dk2);kp(0,.05,.03,.24,0,.07,.18,dk);
kp(0,.085,.085,.3,0,-.005,-.53,dk2);kp(0,.05,.02,.28,0,.05,-.53,dk);kp(0,.07,.035,.24,0,-.07,-.53,dk);kp(cyl(.011,.28),0,0,0,0,.062,-.55,dk,Math.PI/2);
kp(cyl(.014,.22),0,0,0,0,.005,-.79,dk,Math.PI/2);kp(cyl(.03,.012),0,0,0,0,.005,-.9,dk,Math.PI/2);kp(cyl(.022,.06),0,0,0,0,.005,-.95,dk,Math.PI/2);
for(const a of[0,2.094,4.188])kp(0,.01,.012,.05,Math.cos(a)*.026,.005+Math.sin(a)*.026,-.99,dk);
kp(0,.03,.04,.03,0,.045,-.82,dk);mkSights(knG,'AR',{yt:.112,yb:.0745,yf:.065,zr:-.09,zf:-.82});
knG.userData.mag=[kp(0,.045,.25,.07,0,-.165,-.19,cu,.3),kp(0,.05,.018,.075,0,-.285,-.158,dk2,.3)];
kp(0,.04,.11,.055,0,-.115,-.02,dk2,-.32);kp(0,.012,.012,.1,0,-.075,-.1,dk);
knG.position.z=-.12;

/* ===================== raygun.js ===================== */
/* ---------- RayGun: retro sci-fi blaster secondary. One click = one big red beam with splash damage. 20 rounds max. ---------- */
W.CY={n:'Coyote',d:26,r:.085,m:60,sp:.018,rc:1.3,pel:1,au:1,rl:4.2,len:.7,col:0x2e3238};PRI.push('CY');
W.RG={n:'RayGun',d:48,r:.38,m:20,rs:0,sp:.002,rc:3.5,pel:1,au:0,rl:1.6,len:.45,col:0xb02a22,ex:{R:3.2,d:62,imp:0,w:'RG',c:0xff2a14}};SEC.push('RG');W.CT={n:'1911',d:30,r:.16,m:8,sp:.006,rc:2.2,pel:1,au:0,rl:1.5,len:.32,col:0x1d2128};SEC.push('CT');
var rgG=new THREE.Group(),rm=new THREE.MeshLambertMaterial({color:W.RG.col}),rgSteel=new THREE.MeshLambertMaterial({color:0x9aa0a6}),rgBrass=new THREE.MeshLambertMaterial({color:0xc9a94d}),rgGlow=new THREE.MeshBasicMaterial({color:0xff3030}),rgGauge=new THREE.MeshBasicMaterial({color:0xffb454});
var rp=(g,x,y,z,m,rx,ry,rz,glow)=>{const p=new THREE.Mesh(g,m);p.position.set(x,y,z);p.rotation.set(rx||0,ry||0,rz||0);if(glow)p.userData.glow=1;rgG.add(p);return p},
 rbx=(w,h,d,x,y,z,m,rx)=>{const p=rp(bg,x,y,z,m,rx);p.scale.set(w,h,d)},cy=(a,b,h)=>new THREE.CylinderGeometry(a,b,h,12),tor=(r,t)=>new THREE.TorusGeometry(r,t,6,14),P2=Math.PI/2;
rp(new THREE.SphereGeometry(.075,16,12),0,.015,.03,rm);rbx(.06,.06,.22,0,-.01,-.06,rm);rbx(.018,.05,.16,0,.062,-.1,rm,.15);
rp(cy(.045,.045,.012),-.07,.015,.03,rgGauge,0,0,P2,1);rbx(.004,.03,.004,-.077,.02,.03,rgSteel,0);
rp(cy(.004,.004,.09),-.062,.052,.02,rgBrass,0,0,1.05);rp(cy(.004,.004,.09),.062,.052,.02,rgBrass,0,0,-1.05);rp(cy(.0035,.0035,.07),-.04,.088,.0,rgBrass,P2,0,.5);rp(cy(.0035,.0035,.07),.04,.088,.0,rgBrass,P2,0,-.5);
rp(cy(.032,.032,.22),0,.012,-.22,rgGlow,P2,0,0,1);for(const z of[-.15,-.22,-.29])rp(tor(.043,.008),0,.012,z,rgBrass);
rp(cy(.012,.012,.16),0,.012,-.38,rgSteel,P2);rp(cy(.06,.022,.12),0,.012,-.46,rm,-P2);rp(tor(.058,.005),0,.012,-.515,rgBrass);rp(new THREE.SphereGeometry(.012,8,6),0,.012,-.54,rgGlow,0,0,0,1);
rbx(.045,.15,.06,0,-.115,.03,rm,-.25);for(let i=0;i<5;i++){const y=-.07-.025*i;rbx(.048,.008,.064,0,y,.03-(y+.115)*.25,rgSteel,-.25)}
mkSights(rgG,'RG',{yt:.17,yb:.086,yf:.052,zr:.043,zf:-.36});rbx(.01,.012,.1,0,-.075,-.1,rgSteel);rbx(.01,.045,.012,0,-.098,-.145,rgSteel);
rgG.position.set(0,.02,.05);
{const cell=new THREE.Mesh(bg,rgGlow),cap=new THREE.Mesh(bg,rgBrass);cell.scale.set(.045,.07,.045);cell.position.set(0,.1,.085);cap.scale.set(.05,.014,.05);cap.position.set(0,.14,.085);cell.userData.glow=cap.userData.glow=1;rgG.add(cell,cap);rgG.userData.mag=[cell,cap]}
/* red beam + blaster sound */
var bmG=new THREE.CylinderGeometry(1,1,1,10);
function rgBeam(o,d,len,raw){const s=raw?o.clone():o.clone().add(d.clone().multiplyScalar(.7)).add(V(0,-.12,0)),e=o.clone().add(d.clone().multiplyScalar(len)),mid=s.clone().add(e).multiplyScalar(.5),L=s.distanceTo(e),dir=e.clone().sub(s).normalize();
 for(const[r,c,op]of[[.1,0xff1a0a,.6],[.04,0xffe2c8,.95]]){const m=new THREE.Mesh(bmG,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op}));m.position.copy(mid);m.scale.set(r,L,r);m.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(m);fx.push({m,l:.16,fade:op,r})}}
function pew(a=1){try{ac=ac||new AudioContext();const t=ac.currentTime,out=ac.createGain();out.gain.value=vol*a*.6;out.connect(PlayerAudio.output(ac));
 const env=(g,t0,at,pk,hold,dec)=>{g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(pk,t0+at);g.gain.setValueAtTime(pk,t0+at+hold);g.gain.exponentialRampToValueAtTime(.0001,t0+at+hold+dec)},
 nb=pew.nb&&pew.nb.sampleRate==ac.sampleRate?pew.nb:(pew.nb=(()=>{const n=ac.sampleRate*.5|0,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b})());
 /* peh: a soft lip-pop */
 {const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=nb;f.type='bandpass';f.frequency.value=1900;f.Q.value=1.3;env(g,t,.002,.55,0,.045);s.connect(f);f.connect(g);g.connect(out);s.start(t);s.stop(t+.06);
  const o=ac.createOscillator(),og=ac.createGain();o.type='sine';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(150,t+.05);env(og,t,.002,.5,0,.05);o.connect(og);og.connect(out);o.start(t);o.stop(t+.07)}
 /* shoe: a breathy swish that falls from bright to dark */
 {const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=nb;f.type='bandpass';f.Q.value=2.2;f.frequency.setValueAtTime(3400,t+.02);f.frequency.exponentialRampToValueAtTime(1000,t+.22);env(g,t+.02,.03,.34,.03,.17);s.connect(f);f.connect(g);g.connect(out);s.start(t+.02);s.stop(t+.3)}
 /* euw: a sawtooth through two moving formants (oo to ee-oh to oo) while its pitch falls from a shriek to a growl */
 {const t0=t+.05,o=ac.createOscillator(),f1=ac.createBiquadFilter(),f2=ac.createBiquadFilter(),g=ac.createGain(),mix=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(1100,t0);o.frequency.exponentialRampToValueAtTime(420,t0+.12);o.frequency.exponentialRampToValueAtTime(150,t0+.4);
  f1.type='bandpass';f1.Q.value=5;f1.frequency.setValueAtTime(330,t0);f1.frequency.linearRampToValueAtTime(720,t0+.13);f1.frequency.linearRampToValueAtTime(360,t0+.38);
  f2.type='bandpass';f2.Q.value=6;f2.frequency.setValueAtTime(2300,t0);f2.frequency.linearRampToValueAtTime(1000,t0+.16);f2.frequency.linearRampToValueAtTime(760,t0+.38);
  mix.gain.value=1.6;o.connect(f1);o.connect(f2);f1.connect(mix);f2.connect(mix);env(g,t0,.012,.6,.1,.27);mix.connect(g);g.connect(out);o.start(t0);o.stop(t0+.45);
  const b=ac.createOscillator(),bg=ac.createGain();b.type='sine';b.frequency.setValueAtTime(560,t0);b.frequency.exponentialRampToValueAtTime(75,t0+.4);env(bg,t0,.01,.3,.08,.3);b.connect(bg);bg.connect(out);b.start(t0);b.stop(t0+.45);
  const c=ac.createOscillator(),cg=ac.createGain();c.type='triangle';c.frequency.setValueAtTime(3600,t0);c.frequency.exponentialRampToValueAtTime(900,t0+.14);env(cg,t0,.004,.1,0,.14);c.connect(cg);cg.connect(out);c.start(t0);c.stop(t0+.2)}}catch(e){}}

/* ===================== worldgun.js ===================== */
/* ---------- weapons held by bots and other players: 3D model in their hands, muzzle flash, tracers from the barrel, positional shot sounds ---------- */
var WG={AR:[.95,0x3a4a52,1,0xb8651f],SMG:[.6,0x5a4a40,0,0x222222],BR:[.95,0x2f4a3a,1,0x222222],SG:[.9,0x6a5a2a,1,0x222222],VMP:[.65,0x23262b,1,0x222222],MG:[.5,0x1b2027,0,0x222222],CT:[.35,0x1d2128,0,0x222222],MP:[.4,0x3a3a4a,0,0x222222],CY:[1,0x2e3238,1,0x222222],RL:[1.1,0x7a3a2a,1,0x222222],SN:[1.2,0x2a2f4a,1,0x222222],RG:[.55,0xb02a22,0,0xff3030]};
var fMat=new THREE.MeshBasicMaterial({color:0xffe08a}),fMatR=new THREE.MeshBasicMaterial({color:0xff4040}),BOTGUNS=['AR','SMG','BR','SG','VMP','MG','MP','RG','CY','CT'];
Object.assign(WG,{VA:[.94,W.VA.col,1],BP:[.82,W.BP.col,1],KTS:[.76,W.KTS.col,1],RD:[.62,W.RD.col,1],HC:[.42,W.HC.col,0],OH:[1.07,W.OH.col,1]});
BOTGUNS.push('VA','BP','KTS','RD','HC','OH');
/* magazine per weapon: [width, height, depth, y, z (fraction of gun length), tilt, colour]. Light colours so they read against the dark bodies */
/* pump-action shotgun modelled on the reference picture: ventilated rib barrel, magazine tube with end cap, ribbed wooden pump, steel receiver with brown plate, trigger guard, wooden stock. Built along +z (muzzle at z=.9); the pump pieces are returned in userData.pump so they can slide */
function mkSG(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),steel=rm||M(0x555a62),wood=M(0x9a602b),dwood=M(0x5c3a1c),gm=M(0x2b3037),blk=M(0x14171a),rib=M(0x424950),brass=M(0xc9a94d),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.062,.09,.24,0,0,.04,steel);box(.066,.028,.08,0,.02,.09,blk);box(.066,.04,.05,0,-.005,-.03,M(0x7a3f2b));
 box(.04,.04,.78,0,.036,.51,gm);box(.022,.01,.7,0,.061,.5,blk);for(let i=0;i<12;i++)box(.03,.012,.016,0,.066,.2+i*.05,rib);
 box(.05,.05,.024,0,.036,.894,blk);
 const t=new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,.56,10),M(0x3a4047));t.rotation.x=Math.PI/2;t.position.set(0,-.012,.38);g.add(t);box(.044,.044,.03,0,-.012,.675,blk);
 const pump=[box(.074,.066,.26,0,-.016,.36,wood),box(.076,.07,.02,0,-.016,.49,dwood)];for(const z of[.27,.31,.35,.39,.43])pump.push(box(.078,.012,.012,0,-.016,z,dwood));
 box(.012,.012,.09,0,-.068,.02,gm);box(.012,.034,.012,0,-.05,.062,gm);box(.012,.034,.012,0,-.05,-.025,gm);box(.008,.026,.008,0,-.05,.02,steel);
 box(.052,.08,.15,0,-.035,-.15,wood,-.08);box(.048,.115,.3,0,-.07,-.3,wood,-.14);box(.05,.135,.018,0,-.105,-.46,M(0x2a2018),-.14);box(.01,.02,.016,0,-.135,-.37,M(0xaaaaaa));
 mkSights(g,'SG',{yt:.098,yb:.066,yf:.066,zr:.23,zf:.885});g.userData.a={r:[0,-.1,-.06],l:[0,-.075,.36],m:[0,-.1,.08]};g.userData.mags=[];g.userData.pump=pump;return g}
/* Coyote: LMG modelled on the reference picture: blocky muzzle device with two bores, striped shroud, forward handle, big drum magazine and an open-frame stock around an energy tube. Built along +z, muzzle at z=.95 */
function mkCY(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),body=rm||M(0x2e3238),dk=M(0x24282d),md=M(0x3a3f46),lt=M(0x6a6f75),tan=M(0xc9a46a),blk=M(0x0b0b0c),
  box=(w,h,d,x,y,z,m,rx,ry)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;g.add(o);return o},
  cyl=(r,h,x,y,z,m,ax)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);if(ax)o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o};
 box(.1,.12,.44,0,0,.1,body);box(.125,.07,.62,0,.095,.42,md);for(const z of[.28,.46,.64])box(.04,.008,.2,0,.134,z,tan,0,.6);
 box(.1,.09,.5,0,-.012,.55,dk);box(.04,.03,.42,0,-.07,.58,lt);box(.02,.05,.02,0,-.1,.42,lt);box(.02,.05,.02,0,-.1,.6,lt);box(.025,.02,.2,0,-.125,.51,lt);
 box(.15,.15,.16,0,0,.87,md);box(.045,.05,.012,-.035,0,.957,blk);box(.045,.05,.012,.035,0,.957,blk);mkSights(g,'CY',{yt:.205,yb:.13,yf:.13,zr:.14,zf:.745});
 box(.05,.14,.07,0,-.13,0,dk,.25);box(.012,.012,.1,0,-.085,.12,dk);box(.012,.035,.012,0,-.07,.17,dk);box(.012,.035,.012,0,-.07,-.05,dk);
 box(.03,.03,.38,0,.08,-.3,dk);box(.03,.03,.34,0,-.06,-.28,dk,-.12);box(.035,.2,.03,0,0,-.47,dk);cyl(.02,.3,0,.01,-.3,M(0xd9b0c4),1);
 box(.1,.05,.1,0,-.095,.3,dk);
 const drum=cyl(.085,.2,0,-.19,.28,md),cap=cyl(.075,.025,0,-.3,.298,dk);drum.rotation.x=cap.rotation.x=-.18;
 g.userData.a={r:[0,-.13,0],l:[0,-.115,.51],m:[0,-.19,.28]};g.userData.mags=[drum,cap];return g}
/* 1911: single-stack semi-auto pistol modelled on the reference picture: blued slide with rear serrations, spur hammer, beavertail, checkered wood grips with screws, trigger guard. Built along +z, muzzle at z=.35 */
function mk1911(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),sl=rm||M(0x1d2128),fr=M(0x2a2f36),wood=M(0x7b3f1d),dwood=M(0x5a2c12),blk=M(0x0c0d0f),steel=M(0x8a9098),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.032,.04,.33,0,.036,.17,sl);box(.034,.004,.3,0,.056,.17,blk);for(let i=0;i<6;i++)box(.034,.034,.006,0,.038,.012+i*.014,blk);
 box(.024,.022,.03,0,.03,.345,fr);mkSights(g,'CT',{yt:.077,yb:.058,yf:.058,zr:.03,zf:.33});
 box(.03,.028,.24,0,.0,.13,fr);box(.034,.01,.1,0,.0,.2,fr);
 box(.03,.1,.052,0,-.07,.0,fr,.26);box(.007,.092,.046,.0185,-.07,.0,wood,.26);box(.007,.092,.046,-.0185,-.07,.0,wood,.26);for(const s of[-1,1])box(.008,.016,.016,s*.0195,-.045,.0,dwood,.26);
 box(.028,.016,.05,0,.018,-.035,fr,-.2);box(.01,.02,.016,0,.054,-.022,sl,.5);
 box(.01,.01,.075,0,-.03,.083,fr);box(.01,.03,.01,0,-.015,.12,fr);box(.006,.02,.008,0,-.018,.063,steel);box(.004,.012,.03,.017,.014,.07,steel);
 const mg=[box(.026,.02,.05,0,-.125,-.012,blk,.26),box(.024,.04,.042,0,-.1,-.004,fr,.26)];
 g.userData.a={r:[0,-.056,-.004],l:[0,-.103,.008],m:[0,-.11,-.008]};g.userData.mags=mg;return g}
/* Revolver: 6 inch blued double-action modelled on the reference picture: vented rib barrel with underlug, ramp front sight, fluted cylinder, spur hammer, walnut grips with gold medallion */
function mkRV(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),bl=rm||M(0x1b2027),fr=M(0x242a32),wood=M(0x6a3d1c),dw=M(0x4a2810),blk=M(0x0b0c0e),gold=M(0xd4b24c),orange=M(0xff7a1a),
  box=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o};
 box(.026,.032,.34,0,.044,.36,bl);box(.014,.01,.34,0,.066,.36,blk);for(let i=0;i<5;i++)box(.016,.012,.03,0,.07,.24+i*.06,fr);box(.026,.03,.27,0,.013,.34,bl);box(.014,.014,.04,0,.018,.505,blk);
 mkSights(g,'MG',{yt:.1,yb:.078,yf:.071,zr:.012,zf:.5});box(.028,.036,.012,0,.043,.535,fr);
 box(.034,.075,.15,0,.03,.07,fr);box(.03,.016,.16,0,.07,.07,bl);
 const cy=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.06,12),bl);cy.rotation.x=Math.PI/2;cy.position.set(0,.036,.11);g.add(cy);
 for(let i=0;i<6;i++){const a=i/6*6.283,f=box(.007,.012,.062,Math.sin(a)*.037,.036+Math.cos(a)*.037,.11,blk);f.rotation.z=-a}
 box(.01,.04,.018,0,.07,-.035,fr,-.55);box(.006,.03,.014,0,.05,-.02,fr,-.3);
 box(.034,.108,.062,0,-.065,-.042,wood,.3);box(.01,.08,.012,.0,-.07,-.075,bl,.3);for(const s of[-1,1])box(.006,.016,.016,s*.0195,-.05,-.042,gold,.3);for(const s of[-1,1])box(.004,.09,.05,s*.0185,-.07,-.042,dw,.3);
 box(.01,.01,.09,0,-.03,.068,fr);box(.01,.034,.01,0,-.016,.112,fr);box(.006,.022,.008,0,-.012,.05,blk);box(.014,.016,.03,0,.008,.0,fr);
 g.userData.a={r:[0,-.062,-.05],l:[0,-.108,-.04],m:[0,.036,.11]};g.userData.mags=[];return g}
/* iron sights: thin, not blocky. ap = rear aperture (two uprights + top and bottom bar, hole in the middle) with a front post inside protective ears;
   otherwise a rear notch (two thin blocks with a gap) with a front blade. yt is the height of the sight line (aperture centre / top of the notch and blade tip),
   yb the surface the rear sight stands on, yf the surface the front sight stands on, zr / zf the positions along the gun. Coordinates are in the group's own space. */
function modelWeapon(k,finish,g){
 const build=MODELS[k]||({MG:mkRV,CT:mk1911,SG:mkSG,CY:mkCY,MVR:mkMVR})[k]||MODELS.AR;
 return build(g,finish);
}
const weaponTemplates=new Map();
function gunCopy(template){
 const nodes=new Map();
 function copy(original){
  const node=original.isMesh?new THREE.Mesh(original.geometry,original.material):new THREE.Group();
  nodes.set(original,node);
  node.name=original.name;node.position.copy(original.position);node.quaternion.copy(original.quaternion);node.scale.copy(original.scale);
  node.visible=original.visible;node.castShadow=original.castShadow;node.receiveShadow=original.receiveShadow;node.frustumCulled=original.frustumCulled;
  node.userData={...original.userData};
  for(const child of original.children)node.add(copy(child));
  return node;
 }
 const model=copy(template);
 for(const property of ['mags','pump','units'])if(template.userData[property])model.userData[property]=template.userData[property].map(node=>nodes.get(node));
 return model;
}
function buildGun(k,finish,world=false){
 const key=k+'|'+(finish?.uuid||'')+'|'+world;
 let template=weaponTemplates.get(key);
 if(!template){
  template=modelWeapon(k,finish,new THREE.Group());
  const data=template.userData;
  if(!data.authored)weldModel(template);
  data.fit=holdFit(template);
  if(LX.mergeRig&&(world||data.authored)){
   if(data.authored)data.mountBounds=attMuzzle(template,1);
   LX.mergeRig(template,{hip:[...(data.mags||[]),...(data.pump||[])]});
  }
  if(weaponTemplates.size>=100)weaponTemplates.delete(weaponTemplates.keys().next().value);
  weaponTemplates.set(key,template);
 }
 return gunCopy(template);
}
/* where a held weapon sits on a character: scaled so the distance from the stock (or grip, for pistols) to the foregrip is within the arm's reach, stock in the shoulder pocket for rifles, arms extended for pistols */
function holdFit(g){const bb=new THREE.Box3().setFromObject(g),A=g.userData.a||{},rz=(A.r||[0,0,0])[2],lz=(A.l||[0,0,rz+.4])[2],minz=bb.min.z,len=Math.max(.2,bb.max.z-minz),s=Math.min(1,.62/Math.max(.3,lz-minz),1.0/len),stock=minz<-.18;return{s,gz:stock?.1-minz*s:.46-rz*s,mz:bb.max.z}}
function setHeld(b,k,cm,at){cm=typeof cm==='string'?cm:'';at=Array.isArray(at)?at:[];const ak=at.join(','),charm=b.net&&!b.hb?peerLooks.get(b.id)?.charm:'';if(!hasOwn(W,k)||(b.wk==k&&b.hg&&(b.cm||'')==cm&&(b.at||'')==ak&&b.charm===charm))return;if(b.hg)b.m.remove(b.hg);b.wk=k;b.cm=cm;b.at=ak;b.charm=charm;b.hg=buildGun(k,camoRm(k,cm),!(at&&at.length));b.hold=b.hg.userData.fit;if(at&&at.length&&typeof attApply=='function')try{attApply(b.hg,k,at,1)}catch(e){}addPassCharm(b.hg,charm);b.hg.position.set(.12,1.3,.18);b.m.add(b.hg)}
function weaponMuzzleLocal(model){
 const data=model.userData;
 if(data.barrelExit)return data.barrelExit;
 if(!data.muzzleBase){
  const source=data.muzzle||attMuzzle(model,1);
  data.muzzleBase={x:source.x||0,y:Number.isFinite(source.y)?source.y:0,
   z:Number.isFinite(source.z??source.tip)?source.z??source.tip:0};
 }
 return data.muzzleBase;
}
function weaponMuzzleWorld(model,hand=0){
 const barrel=model.userData.units?.[hand]||model;
 const point=weaponMuzzleLocal(barrel);
 barrel.updateWorldMatrix(true,false);
 return barrel.localToWorld(V(point.x,point.y,point.z+.012));
}
function muzzle(b,hand=0,k=b.wk){
 if(b.hg&&b.wk===k)return weaponMuzzleWorld(b.hg,hand);
 const l=(WG[k]||WG.AR)[0],r=b.m.rotation.y,ox=.12,oz=.18+l*1.05,s=Math.sin(r),c=Math.cos(r);
 return V(b.x+ox*c+oz*s,(b.y||0)+1.36-.3*(b.pc||0)-.42*(b.psl||0)-1.05*(b.pp||0),b.z-ox*s+oz*c);
}
function muzzleFlash(p,k){const m=new THREE.Mesh(sg,k=='RG'?fMatR:fMat);m.scale.setScalar(W[k]?.pel>1?.22:.13);m.position.copy(p);S.add(m);fx.push({m,l:.05})}
function otherSnd(k,p){const v=Math.max(0,1-p.distanceTo(C.position)/55);if(v<.06)return;arenaSoundCaption('Gunfire',p.x,p.z);if(k=='RG')return pew(v);if(GS[k])return snd(GS[k],v*.8);noise(k=='SG'?.22:.1,k=='SG'?1800:3500,.3*v);beep(k=='SG'?90:140,.08,'sine',.12*v)}
function remoteShot(b,k,end,col,hand=0){const mz=muzzle(b,hand,k),dv=end.clone().sub(mz),L=dv.length();if(L<.1)return;dv.divideScalar(L);if(k=='RG'){rgBeam(mz,dv,L,1);rgImpact(end)}else if(k=='TEA'&&typeof teaBeam=='function'){teaBeam(mz,dv,L,1);JX.tea&&JX.tea(end,W.TEA.ex)}else tr(mz,dv,L,col||PASS_TRACERS[peerLooks.get(b.id)?.tracer]?.color||0xffd27a,.07,1);muzzleFlash(mz,k);otherSnd(k,mz)}
function falloff(w,d){return w.pw||w.k=='RG'?1:Math.max(w.pel>1?.4:.45,1-d/(w.pel>1?30:140))}

/* ===================== anim.js ===================== */
/* ---------- animation + movement: character rig with IK arms, first-person hands, reload animations, mantling, wall jumps ---------- */
var fpG=new THREE.Group(),fpAnchors=null;gun.add(fpG);fpG.visible=false;
var eas=t=>t*t*(3-2*t),rlP=()=>rel>0&&cw()?1-rel/Math.max(.3,relT||cw().rl):-1,rlBell=()=>{const p=rlP();return p<0?0:Math.sin(Math.PI*p)};
var rlRot=()=>.42*rlBell(),rlRoll=()=>-.3*rlBell(),rlX=()=>.1*rlBell(),rlY=()=>.03*rlBell()-(P.mt?.12*Math.sin(Math.PI*P.mt.t/P.mt.d):0);
/* two-bone arm: upper arm and forearm groups meshes hang along -y; ik() points them so the hand reaches H */
var cyU=new THREE.CylinderGeometry(1,.82,1,10),cyS=new THREE.CylinderGeometry(1,1,1,10),hemiG=new THREE.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.55);
/* arms: tapered upper arm and forearm with shoulder, elbow and hand (sm sleeve, fm forearm, gm glove/hand) */
function mkArm(parent,L1,L2,sm,gm,th,fm){const up=new THREE.Group(),fo=new THREE.Group(),mk=(g,mt,sx,sy,sz,yy,p)=>{const o=new THREE.Mesh(g,mt);o.scale.set(sx,sy,sz);o.position.set(0,yy,0);o.castShadow=parent!==C;p.add(o)};
 mk(cyU,sm,th*.55,L1,th*.55,-L1/2,up);mk(sg,sm,th*.58,th*.58,th*.58,0,up);mk(cyU,fm||sm,th*.46,L2,th*.46,-L2/2,fo);mk(sg,fm||sm,th*.5,th*.5,th*.5,0,fo);mk(sg,gm,th*.52,th*.64,th*.5,-L2-th*.2,fo);
 parent.add(up,fo);return{up,fo,L1,L2}}
const ikDelta=V(),ikDirection=V(),ikPlane=V(),ikElbow=V(),ikAxis=V(),ikDown=V(0,-1,0);
function ik(S0,H0,hint,arm){
 if(arm.hand)arm.hand.quaternion.identity();
 const L1=arm.L1,L2=arm.L2,d=ikDelta.subVectors(H0,S0);
 const raw=d.length(),dist=cl(raw,Math.abs(L1-L2)+.014,L1+L2-.003);
 const dir=raw>.0001?ikDirection.copy(d).multiplyScalar(1/raw):ikDirection.set(0,-1,0);
 const a=(L1*L1-L2*L2+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,L1*L1-a*a));
 const pr=ikPlane.copy(hint).addScaledVector(dir,-hint.dot(dir));
 if(pr.lengthSq()<1e-6)pr.set(1,0,0).addScaledVector(dir,-dir.x);
 const elbow=ikElbow.copy(S0).addScaledVector(dir,a).addScaledVector(pr.normalize(),h);
 arm.up.position.copy(S0);arm.up.quaternion.setFromUnitVectors(ikDown,ikAxis.subVectors(elbow,S0).normalize());
 arm.fo.position.copy(elbow);
 arm.fo.quaternion.setFromUnitVectors(ikDown,ikAxis.copy(S0).addScaledVector(dir,dist).sub(elbow).normalize());
}
/* Align the opening of the hand with the grip, then solve for the wrist at the exact contact point. */
const gripX=V(),gripY=V(),gripZ=V(),gripWrist=V(),gripMatrix=new THREE.Matrix4(),gripTurn=new THREE.Quaternion();
function gripArm(shoulder,point,hint,arm,axis,side){
 if(!arm.hand){ik(shoulder,point,hint,arm);return}
 const x=gripX.copy(axis).normalize();
 const y=gripY.subVectors(shoulder,point).addScaledVector(x,-gripY.dot(x));
 if(y.lengthSq()<.0001)y.copy(hint).addScaledVector(x,-hint.dot(x));
 y.normalize();
 const z=gripZ.crossVectors(x,y);
 if(z.x*side>0){x.negate();z.negate()}
 gripTurn.setFromRotationMatrix(gripMatrix.makeBasis(x,y,z));
 const size=arm.hand.scale.x,wrist=gripWrist.set(0,-.088*size,.03*size).applyQuaternion(gripTurn).negate().add(point);
 ik(shoulder,wrist,hint,arm);
 arm.hand.quaternion.copy(arm.fo.quaternion).invert().multiply(gripTurn);
}
/* ---------- reload 2.0 ----------
   Each weapon reloads in its own way and the part being loaded really travels with the left hand:
   mag     magazine is pulled out, dropped, a fresh one is fetched from the belt, pushed in and slapped home
   shell   shotgun shells are fetched one at a time and pushed into the port under the receiver, then the pump is racked
   rocket  a rocket is fetched and slid into the rear of the launcher
   Poses are in the local space of the host group (camera-held gun for the player, world gun for bots). fz = -1 / +1 is the gun's forward axis. */
var RLK={CT:'mag',CY:'mag',AR:'mag',SMG:'mag',BR:'mag',VMP:'mag',SN:'mag',MG:'mag',MP:'mag',RG:'mag',SG:'shell',RL:'rocket',BP:'shell',KTS:'shell',OH:'round'};
var mb=m=>m.userData.b0||(m.userData.b0={x:m.position.x,y:m.position.y,z:m.position.z,rx:m.rotation.x});
const localTurn=new THREE.Quaternion();
function toLoc(m,v,host){
 const point=v.clone(),chain=[];
 for(let parent=m.parent;parent&&parent!==host;parent=parent.parent)chain.push(parent);
 for(let i=chain.length-1;i>=0;i--){
  const {quaternion,scale}=chain[i];
  point.applyQuaternion(localTurn.copy(quaternion).invert()).divide(scale);
 }
 return point;
}
function slotC(mags,host){
 if(mags.c)return mags.c;
 const center=V();
 for(const m of mags){
  const b=mb(m),point=V(b.x,b.y,b.z);
  for(let parent=m.parent;parent&&parent!==host;parent=parent.parent){
   parent.updateMatrix();point.applyMatrix4(parent.matrix);
  }
  center.add(point);
 }
 return mags.c=center.divideScalar(mags.length);
}
function rlPose(kind,p,A,fz,n,mags,host,pl,cycles){
 const bk=-fz,L0=V(...A.l),o={h:L0.clone(),mo:V(0,0,0),mr:0,mv:1,pv:0,pp:V(0,0,0),pu:V(0,0,bk*(pl||0)),ev:0,cy:0};
 if(p<0){o.h.add(o.pu);return o}
 const M0=mags.length?slotC(mags,host):V(...A.m),Pq=M0.clone().add(V(-.08,-.42,bk*.28));
 if(kind=='mag'){const HO=V(...(A.ho||[0,-.05,0])),D=V(...(A.pd||[0,-.3,0])),Mh=M0.clone().add(HO),Dh=Mh.clone().add(D),Eh=Dh.clone().add(V(-.12,D.y>0?.06:-.1,bk*.04)),carry=h=>{o.h.copy(h);o.mo.copy(h).sub(Mh);o.cy=1};
  if(p<.14)o.h.copy(L0).lerp(Mh,eas(p/.14));
  else if(p<.3)carry(Mh.clone().lerp(Dh,eas((p-.14)/.16)));
  else if(p<.4)carry(Dh.clone().lerp(Eh,eas((p-.3)/.1)));
  else if(p<.58){const t=(p-.4)/.1;o.h.copy(Eh).lerp(Pq,eas((p-.4)/.18));if(t<1){o.mo.copy(Eh).sub(Mh).add(V(-.06*t,-2*t*t,0));o.mr=1.4*t}else o.mv=0}
  else if(p<.66){o.h.copy(Pq);o.mo.copy(Pq).sub(Mh);o.cy=1}
  else if(p<.84)carry(Pq.clone().lerp(Dh,eas((p-.66)/.18)));
  else if(p<.92)carry(Dh.clone().lerp(Mh,eas((p-.84)/.08)));
  else o.h.copy(Mh).lerp(L0,eas((p-.92)/.08));
  o.ev=(p>.3?1:0)+(p>.86?1:0)}
 else if(kind=='shell'){const Mh=M0.clone().add(V(0,-.03,0)),c0=.08,c1=.82,cs=(c1-c0)/n;
  if(p<c0)o.h.copy(L0).lerp(Mh,eas(p/c0));
  else if(p<c1){const x=(p-c0)/cs,c=Math.floor(x),u=x-c;o.ev=c;
   if(u<.28)o.h.copy(Mh).lerp(Pq,eas(u/.28));
   else if(u<.4){o.h.copy(Pq);o.pv=1;o.pp.copy(Pq)}
   else if(u<.75){o.h.copy(Pq).lerp(Mh,eas((u-.4)/.35));o.pv=1;o.pp.copy(o.h)}
   else if(u<.88){o.h.copy(Mh);const t=(u-.75)/.13;o.pp.copy(Mh).add(V(0,.03*t,fz*.05*t));o.pv=t<.8?1:0;o.ev=c+1}
   else{o.h.copy(Mh);o.ev=c+1}
   if(o.pv)o.pp.add(V(0,.02,fz*.03))}
  else{const t=(p-c1)/(1-c1),pl2=!cycles||t<.35?0:.11*Math.sin(Math.PI*Math.min(1,(t-.35)/.6));o.pu=V(0,0,bk*pl2);o.h.copy(Mh).lerp(L0,t<.3?eas(t/.3):1).add(o.pu);o.ev=n}}
 else if(kind==='round'){
  const bolt=M0.clone().add(V(-fz*.04,-.013,bk*.058));
  const slide=eas(cl((p-.08)/.18,0,1))*(1-eas(cl((p-.73)/.18,0,1)));
  o.pu.z=bk*.092*slide;
  if(p<.26)o.h.copy(L0).lerp(bolt,eas(p/.16)).add(o.pu);
  else if(p<.43)o.h.copy(bolt).add(o.pu).lerp(Pq,eas((p-.26)/.17));
  else if(p<.68){o.h.copy(Pq).lerp(M0,eas((p-.43)/.25));o.pp.copy(o.h).add(V(0,.017,fz*.028));o.pv=1}
  else if(p<.91)o.h.copy(M0).lerp(bolt,eas((p-.68)/.13)).add(o.pu);
  else o.h.copy(bolt).lerp(L0,eas((p-.91)/.09));
 }
 else{const Rs=M0.clone().add(V(-.07,-.1,bk*.34)),Rm=M0.clone().add(V(0,0,fz*.2));
  if(p<.15)o.h.copy(L0).lerp(Pq,eas(p/.15));
  else if(p<.3){o.h.copy(Pq);o.pv=1}
  else if(p<.55){o.h.copy(Pq).lerp(Rs,eas((p-.3)/.25));o.pv=1}
  else if(p<.8){const t=eas((p-.55)/.25);o.h.copy(Rs).lerp(Rm,t);o.pv=t<.88?1:0}
  else o.h.copy(Rm).lerp(L0,eas((p-.8)/.2));
  if(o.pv)o.pp.copy(o.h).add(V(0,.02,fz*.16));o.ev=(p>.55?1:0)+(p>.8?1:0)}
 return o}
function mkProp(kind,fz){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),cyl=(r,h,c,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),M(c));m.rotation.x=Math.PI/2;m.position.z=z;g.add(m)};
 if(kind=='shell'){cyl(.02,.075,0xc23b2c,.01);cyl(.0215,.025,0xc9a94d,-.04)}
 else if(kind==='round'){cyl(.01,.057,0xc9a94d,.006);cyl(.012,.009,0xb19042,-.025);cyl(.006,.024,0x9a694c,.044)}
 else{cyl(.032,.34,0x9aa0a6,0);const n=new THREE.Mesh(new THREE.ConeGeometry(.032,.1,10),M(0xc0392b));n.rotation.x=Math.PI/2;n.position.z=.22;g.add(n);for(let i=0;i<3;i++){const f=new THREE.Mesh(bg,M(0x5a5f66));f.scale.set(.07,.008,.06);f.position.z=-.15;f.rotation.z=i*1.047;g.add(f)}}
 g.rotation.y=fz<0?Math.PI:0;g.userData.kind=kind;g.visible=false;return g}
function propFor(host,kind,fz){let pr=host.userData.prop;if(kind!='shell'&&kind!='rocket'&&kind!='round'){if(pr)pr.visible=false;return null}
 if(!pr||pr.userData.kind!=kind){if(pr)host.remove(pr);pr=mkProp(kind,fz);host.add(pr);host.userData.prop=pr}return pr}
/* keep the hand inside the arm's reach; whatever it carries (mag, shell, rocket) is shifted by the same amount so it never floats free of the hand */
function clampHand(o,S0,tw,q,R){const d=tw(o.h).sub(S0),L=d.length();if(L<=R)return;const sc=tw(V(1,0,0)).sub(tw(V(0,0,0))).length()||1,dv=d.multiplyScalar((R/L-1)/sc).applyQuaternion(q.clone().invert());o.h.add(dv);if(o.cy)o.mo.add(dv);if(o.pv)o.pp.add(dv)}
function applyRl(o,mags,pump,host,kind,fz){
 const active=o.pv||o.mr||!o.mv||o.mo.lengthSq()||o.pu.lengthSq();
 const model=host===gun?fpG:host;
 if(!active&&model.userData.restored)return;
 model.userData.restored=!active;
 for(const m of mags){const b=mb(m),d=toLoc(m,o.mo,host);m.position.set(b.x+d.x,b.y+d.y,b.z+d.z);m.rotation.x=b.rx+o.mr;m.visible=!!o.mv}
 if(host===gun){const gm=typeof attFpModel=='function'&&cw()?attFpModel(cw().k):null,G=gm&&gm.children.find(c=>c.userData.att&&c.userData.mg),pv=G&&G.userData.mg;if(pv){const b=pv.userData.mb,d=toLoc({parent:gm},o.mo,host);pv.position.set(b.x+d.x,b.y+d.y,b.z+d.z);pv.rotation.x=o.mr;pv.visible=!!o.mv}}
 for(const m of pump){const b=mb(m),d=toLoc(m,o.pu,host);m.position.set(b.x+d.x,b.y+d.y,b.z+d.z)}
 const pr=propFor(host,kind,fz);if(pr){pr.visible=!!o.pv;if(o.pv)pr.position.copy(o.pp)}}
/* first-person arms (children of the camera) */
var fpSl=new THREE.MeshLambertMaterial({color:0x34402f}),fpGl=new THREE.MeshLambertMaterial({color:0x151515}),fpArm={r:mkArm(C,.62,.6,fpSl,fpGl,.1),l:mkArm(C,.62,.6,fpSl,fpGl,.1)};
var curAnch=()=>fpAnchors,curMags=()=>fpG.userData.mags||[];
var pf=1;var _sht=shoot;shoot=function(){const w=cw();_sht();if(w.k=='SG'||w.pumpAction)pf=0};
function hideFP(){for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=false;const pr=gun.userData.prop;if(pr)pr.visible=false}
function fpUpdate(dt){const w=cw(),vis=run&&!P.dead&&!over&&w,k=vis&&w.k;for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=!!vis;if(!vis){const pr=gun.userData.prop;if(pr)pr.visible=false;return}
 if(pf<1)pf=Math.min(1,pf+dt/Math.max(.35,w.r*.9));
 const A=curAnch(k),p=rlP(),R0=V(...A.r),kind=RLK[k]||'mag',mg=curMags(k),pm=fpG.userData.pump||[],cycles=kind==='shell'&&pm.length>0,
  pl=cycles&&p<0&&pf<1?.1*Math.sin(Math.PI*cl((pf-.12)/.7,0,1)):0,
  o=rlPose(kind,p,A,-1,cl(w.m-w.mag,1,k==='SG'?6:12),mg,gun,pl,cycles);
 if(p>=0){FOL.player(w,k,p,o.ev);P.ev=o.ev}else{P.ev=0;FOL.reset()}
 const q=gun.quaternion,gp=gun.position,tw=a=>a.clone().applyQuaternion(q).add(gp);
 const gy=V(0,1,-.24).applyQuaternion(q),gz=V(0,0,1).applyQuaternion(q),pis=w.sidearm||k==='CT'||k==='MG'||k==='MP'||k==='DS';
 if(p<0&&pis&&k!=='DS')o.h.copy(R0).add(V(-.038,-.044,-.01));
 const shoulder=V(-.2,-.45,.12),normalGrip=tw(p<0?o.h:V(...A.l)),reach=shoulder.distanceTo(normalGrip);
 // The support shoulder rolls forward when a long weapon is carried away from the eye.
 if(reach>1.015)shoulder.lerp(normalGrip,1-1.015/reach);
 clampHand(o,shoulder,tw,q,1.06);applyRl(o,mg,pm,gun,kind,-1);
 if(k==='RG'&&p<0)for(const mag of mg)mag.visible=ST.ads<=.2;
 gripArm(V(.26,-.45,.12),tw(R0),V(.4,-1,.3),fpArm.r,gy,1);
 gripArm(shoulder,tw(o.h),V(-.4,-1,.3),fpArm.l,pis?gy:gz,-1);
}
/* Equip the same geometry used by other players, the arsenal and wall buys. */
setGun=function(){
 const k=cw().k,fit=applyCamo(k),l=WG[k]?.[0]||.6;
 gun.remove(fpG);
 fpG=buildGun(k,fit);fpG.userData.camo=myCamo(k);
 if(mode!=='Zombies')addPassCharm(fpG,passExtra('charm'));
 fpG.rotation.y=Math.PI;
 const pz=fpG.userData.viewOffset??(['SG','CY','MVR'].includes(k)?-.12:-.14+.1*l);
 fpG.position.z=pz;gun.add(fpG);
 const {a}=fpG.userData,flip=([x,y,z])=>[-x,y,-z],position=v=>{const a=flip(v);a[2]+=pz;return a};
 fpAnchors={r:position(a.r),l:position(a.l),m:position(a.m),pd:a.pd&&flip(a.pd),ho:a.ho&&flip(a.ho)};
 gf.material.color.setHex(k==='RG'?0xff4040:0xffdd66);gf.visible=false;
 gun.position.set(.2,-.2,-.45);pf=1;
};
/* third-person character: armoured body, legs that walk, two IK arms holding the weapon */
/* a human built from tapered limbs and spheres: head with face, ears and hair or helmet, neck, oval torso, tactical vest, jointed arms and legs, boots.
   Human characters use the operator roster. Undead have a separate mesh and material palette.
   v2: every limb is BAKED once into a few merged meshes per material (HV.cache, shared by every person), so a detailed soldier costs only a handful of draw calls:
   plate carrier with pouches, radio and hydration pack, belt kit, cargo pants with pockets and a thigh holster, knee pads, laced boots, gloves with knuckle guards and curled fingers, a watch,
   a face with eyes (white, iris, pupil, lids), brows, nose, lips, ears, stubble or beard, three hair styles, a helmet with night-vision mount and goggles, a comms headset and boom mic, shades, face paint.
   Zombies get torn clothes, wounds, exposed ribs, sunken glowing eyes, teeth, a hanging jaw and claws; rig.setGlow(on) lights their eyes and an aura (the Big Ben step of the London easter egg). */
var HV={cache:{},m:{},geo:null,aTex:null};
HV.G=function(){if(HV.geo)return HV.geo;const T=THREE;return HV.geo={bx:new T.BoxGeometry(1,1,1),cy:new T.CylinderGeometry(1,1,1,10),cu:new T.CylinderGeometry(1,.82,1,10),sp:new T.SphereGeometry(1,12,8),ss:new T.SphereGeometry(1,8,5),hm:new T.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.55)}};
HV.merge=function(parts){let nv=0,ni=0;for(const p of parts){nv+=p.g.attributes.position.count;ni+=p.g.index?p.g.index.count:p.g.attributes.position.count}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint16Array(ni),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),nm=new THREE.Matrix3(),v=new THREE.Vector3();let vo=0,io=0;
 for(const p of parts){if(p.q)q.copy(p.q);else{e.set(p.rx,p.ry,p.rz);q.setFromEuler(e)}pos.set(p.x,p.y,p.z);sc.set(p.sx,p.sy,p.sz);m.compose(pos,q,sc);nm.getNormalMatrix(m);const pa=p.g.attributes.position,na=p.g.attributes.normal,ua=p.g.attributes.uv;
  for(let i=0;i<pa.count;i++){v.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(m);P[(vo+i)*3]=v.x;P[(vo+i)*3+1]=v.y;P[(vo+i)*3+2]=v.z;v.set(na.getX(i),na.getY(i),na.getZ(i)).applyMatrix3(nm).normalize();N[(vo+i)*3]=v.x;N[(vo+i)*3+1]=v.y;N[(vo+i)*3+2]=v.z;U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
  if(p.g.index){for(let i=0;i<p.g.index.count;i++)I[io++]=p.g.index.getX(i)+vo}else for(let i=0;i<pa.count;i++)I[io++]=vo+i;vo+=pa.count}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(new THREE.BufferAttribute(I,1));g.computeBoundingSphere();return g};
/* bake(key, build): build(a, rod) is called once per key; a(slot, geometry, sx,sy,sz, x,y,z, rx,ry,rz) adds one part, rod(slot, x0,y0,z0, x1,y1,z1, r) adds a thin cylinder between two points */
HV.bake=function(key,build){let c=HV.cache[key];if(c)return c;const by={},up=new THREE.Vector3(0,1,0),d=new THREE.Vector3();
 const a=(s,g,sx,sy,sz,x,y,z,rx,ry,rz)=>{(by[s]||(by[s]=[])).push({g,sx,sy,sz,x,y,z,rx:rx||0,ry:ry||0,rz:rz||0})},
  rod=(s,x0,y0,z0,x1,y1,z1,r)=>{d.set(x1-x0,y1-y0,z1-z0);const L=d.length(),q=new THREE.Quaternion().setFromUnitVectors(up,d.normalize());(by[s]||(by[s]=[])).push({g:HV.G().cy,sx:r,sy:L,sz:r,x:(x0+x1)/2,y:(y0+y1)/2,z:(z0+z1)/2,q})};
 build(a,rod,HV.G());c=HV.cache[key]={};for(const s in by)c[s]=HV.merge(by[s]);return c};
HV.put=function(parent,key,build,M){const c=HV.bake(key,build),out=[];for(const s in c){const e=new THREE.Mesh(c[s],M[s]||M.dk);e.castShadow=true;parent.add(e);out.push(e)}return out};
HV.auraTex=()=>LX.effectTextures().glow;
var hvR=(sx,sy,sz,r)=>(typeof LX!='undefined'&&LX.rb)?LX.rb(sx,sy,sz,r):HV.G().bx;
/* ---- head ---- */
HV.zombieHead=function(a,rod,G){const {bx,sp,ss,hm}=G;
  a('skin',sp,.105,.125,.115,0,.11,0);a('skin',sp,.09,.06,.1,0,.03,.03);
  for(const s of[-1,1]){a('dk',ss,.03,.027,.018,s*.04,.13,.098);a('skin',ss,.018,.032,.02,s*.108,.11,0);a('hair',bx,.05,.012,.014,s*.04,.165,.1,0,0,-s*.25)}
  a('dk',bx,.02,.04,.03,0,.1,.12);a('wound',ss,.034,.024,.012,.07,.07,.085);a('bone',bx,.02,.012,.006,.072,.074,.094);a('blood',ss,.05,.03,.012,-.04,.19,.07,-.4,0,0);
  a('hair',hm,.1,.108,.112,0,.122,-.008);a('skin',ss,.04,.03,.01,-.03,.2,.05,-.5,0,0);for(const s of[-1,1])a('bone',bx,.012,.012,.006,s*.02,.052,.118);
  for(let i=0;i<6;i++)a('bone',bx,.01,.014,.008,(i-2.5)*.016,.066,.116)};
/* ---- torso ---- */
HV.zombieTorso=function(v){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;
 a('am',cu,.235,.34,.15,0,.42,0);a('am',cu,.2,.26,.13,0,.14,0);for(const s of[-1,1])a('am',sp,.088,.088,.088,s*.276,.52,0);a('am',cy,.26,.05,.15,0,.575,0);
 a('skin',cy,.05,.1,.05,0,.63,0);a('am',cy,.066,.03,.06,0,.585,0);
 const R=(i)=>((Math.sin(i*91.7+v.var*13.1)*43758.5)%1+1)%1;
  for(let i=0;i<9;i++)a('am',bx,.035+R(i)*.03,.09+R(i+9)*.12,.012,-.2+i*.05,.0-R(i+3)*.06,.13,0,0,(R(i+5)-.5)*.4);
  a('wound',sp,.075,.09,.02,-.07,.34,.14);for(let i=0;i<3;i++)a('bone',bx,.1-i*.01,.012,.014,-.07,.3+i*.04,.152,0,0,.05);
  a('blood',sp,.06,.05,.016,.1,.2,.13);a('wound',sp,.05,.06,.02,.09,.55,-.1);for(let i=0;i<6;i++)a('skin',ss,.014,.014,.014,0,.1+i*.075,-.13);
  a('blood',sp,.04,.07,.02,.16,.4,.1,0,.6,0);a('bone',bx,.012,.06,.012,.0,.5,-.125,0,0,.2)}};
/* ---- belt kit (moves with the crouch) ---- */
HV.hip=function(v){return(a,rod,G)=>{const{bx,cy}=G;a('pants',cy,.19,.2,.12,0,.96,0);a('dk',cy,.2,.045,.13,0,1.03,0);
 if(!v.zb){a('metal',bx,.035,.032,.012,0,1.03,.131);for(const s of[-1,1])a('vest2',bx,.06,.075,.05,s*.16,1.0,.06);a('vest2',bx,.13,.07,.04,0,1.0,-.125);a('strap',bx,.01,.07,.006,0,.99,.14)}else a('am',bx,.07,.1,.01,.1,1.0,.12,0,0,.5)}};
/* ---- legs: upper (thigh + knee) and lower (shin + boot) ---- */
HV.legU=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;a('pants',cu,.088,.46,.088,0,-.23,0);a('pants',sp,.076,.076,.076,0,-.46,0);
 if(!v.zb){a('pants2',bx,.035,.13,.085,s*.094,-.24,0);a('pants2',bx,.037,.03,.09,s*.095,-.185,0);a('metal',ss,.007,.007,.007,s*.113,-.195,0);a('strap',cy,.092,.02,.092,0,-.38,0);a('metal',bx,.012,.016,.006,0,-.38,.092);
  if(s<0){a('vest2',bx,.04,.19,.08,-.1,-.3,.03);a('dk',bx,.032,.05,.05,-.1,-.2,.03);a('strap',bx,.008,.1,.006,-.1,-.19,.075,0,0,0)}else a('vest2',bx,.04,.1,.08,.1,-.3,0)}
 else{a('wound',ss,.04,.05,.02,s*.07,-.16,.07);a('pants2',bx,.03,.1,.01,s*.05,-.4,.088,0,0,s*.3)}}};
HV.legL=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;
 if(!v.zb||!v.bare){a('pants',cu,.068,.44,.068,0,-.22,0);a('boots',cy,.076,.1,.076,0,-.36,0);a('pants',sp,.078,.05,.078,0,-.31,0);a('boots',hvR(.12,.1,.27,.02),.12,.1,.27,0,-.43,.05);a('boots',ss,.055,.04,.07,0,-.445,.16);a('dk',bx,.126,.028,.29,0,-.475,.05);
  if(!v.zb){for(let i=0;i<3;i++)a('strap',bx,.04,.005,.01,0,-.34-i*.018,.078);a('vest',hvR(.1,.13,.05,.015),.1,.13,.05,0,-.03,.07);a('metal',ss,.006,.006,.006,.022,-.36,.078)}
  else{for(let i=0;i<4;i++)a('pants2',bx,.02,.07,.01,(i-1.5)*.03,-.36,.07,0,0,(i%2?.3:-.3))}}
 else{a('pants',cu,.068,.22,.068,0,-.11,0);for(let i=0;i<5;i++)a('pants',bx,.02,.08,.01,(i-2)*.027,-.24,.066,0,0,(i%2?.4:-.4));a('skin',cu,.055,.22,.055,0,-.33,0);a('skin',hvR(.1,.06,.24,.02),.1,.06,.24,0,-.44,.06);for(let i=0;i<5;i++)a('bone',bx,.014,.014,.03,(i-2)*.02,-.445,.19);a('wound',ss,.03,.04,.012,s*.03,-.28,.05)}}};
/* ---- arms (the group structure is the old one: up at the shoulder, fo at the elbow, both hang along -y) ---- */
HV.armU=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;a('am',cu,.063,.36,.063,0,-.18,0);a('am',sp,.07,.07,.07,0,0,0);
 if(!v.zb)a('patch',bx,.004,.045,.04,s*.064,-.09,0);else{a('wound',ss,.03,.04,.014,0,-.12,.05);for(let i=0;i<3;i++)a('am',bx,.02,.07,.01,(i-1)*.03,-.34,.05,0,0,(i-1)*.2)}}};
HV.armF=function(v,s){return(a,rod,G)=>{const{bx,sp,ss,cy,cu}=G;
 if(!v.zb){a('am',sp,.055,.055,.055,0,0,0);a('vest',cy,.062,.07,.062,0,0,0);a('am',cu,.052,.28,.052,0,-.15,0);a('dk',cy,.046,.035,.046,0,-.29,0);a('glove',cy,.044,.07,.044,0,-.33,0);
  a('strap',bx,.05,.012,.05,0,-.36,0);
  if(s>0){a('dk',cy,.048,.022,.048,0,-.275,0);a('metal',cy,.05,.004,.05,0,-.264,0)}}
 else{a('skin',sp,.055,.055,.055,0,0,0);a('skin',cu,.05,.34,.05,0,-.19,0);for(let i=0;i<3;i++)a('am',bx,.02,.07,.012,(i-1)*.03,-.04,.045,0,0,(i-1)*.25);a('wound',ss,.03,.04,.014,0,-.2,.04);
  a('skin',hvR(.075,.07,.04,.012),.075,.07,.04,0,-.39,0);for(let i=0;i<5;i++){const x=-.03+i*.015;a('skin',bx,.011,.06,.014,x,-.45,.01+Math.abs(i-2)*.004,.0,0,(i-2)*.12);a('bone',bx,.008,.016,.01,x+(i-2)*.003,-.485,.012)}}}};
function mkArm2(parent,v,s,M){
 const up=new THREE.Group(),fo=new THREE.Group();
 const armMaterials=v.style?{...M,am:M.fabric}:M;
 HV.put(up,'au'+(v.zb?'z':'h')+s,HV.armU(v,s),armMaterials);
 HV.put(fo,'af'+(v.zb?'z':'h')+s,HV.armF(v,s),armMaterials);
 let hand;
 if(!v.zb){
  const key='grasp'+s;
  if(!HV[key]){
   HV[key]=mkFpHand(-s,M.glove,M.dk);
   if(LX.mergeRig)LX.mergeRig(HV[key]);
  }
  hand=HV[key].clone();
  hand.scale.setScalar(.71);hand.position.y=-.36;
  fo.add(hand);
 }
 parent.add(up,fo);return{up,fo,L1:.36,L2:.36,hand};
}
function mkHuman(m,o={}){o=o||{};
 if(o.zombie&&mode==='Zombies'&&MAPS[sel.map]?.lockbox)return lockboxZombie(m,o);
 m.rotation.order='YXZ';HV.G();
 const pk=palette=>palette[Math.random()*palette.length|0],zb=!!o.zombie;
 const style=zb?null:operatorId(o.operator);
 const sh_=(n,c)=>HV.m[n]||(HV.m[n]=new THREE.MeshLambertMaterial({color:c}));
 const palette=(name,color)=>sh_(name+'-'+color,color);
 const skin=o.skin??pk([0xf7d7ba,0xeab992,0xd6a37c,0xb98059,0x9c6b48]);
 const M={skin:palette('skin',skin),vest:palette('vest',pk([0x2b2f26,0x23262b,0x3b3a2c,0x2d3433]))};
 if(style){
  Object.assign(M,operatorMaterials(style));
  M.am=M.pants=M.fabric;M.pants2=M.armor;
 }else{
  const pants=o.pants??pk([0x3a3f2f,0x2f3238,0x4a4638]);
  M.pants=palette('pants',pants);
  M.pants2=sh_('pants2-'+pants,new THREE.Color(pants).multiplyScalar(.82).getHex());
  M.am=palette('shirt',o.shirt??0xb5452e);
  M.hair=palette('hair',o.hair??pk([0x4a3626,0x6a4a30,0x3a3a3a,0x9a7a40,0xb8a46c]));
 }
 M.vest2=sh_('vest2',0x23261f);M.boots=sh_('boots',0x1c1a18);M.dk=sh_('dk',0x15171a);M.glove=sh_('glove',0x15151a);M.strap=sh_('strap',0x3a3d33);
 M.metal=sh_('metal',0x9aa0a6);
 M.patch=sh_('patch',0xe8e2d0);M.bone=sh_('bone',0xd8d0b8);M.blood=sh_('blood',0x5a0f0f);M.wound=sh_('wound',0x3a0c0c);
 const eyeM=zb?new THREE.MeshBasicMaterial({color:o.eye||0xff2a2a}):null;if(zb)M.eye=eyeM;
 const v={style,zb,var:zb?Math.random()*3|0:0,bare:zb&&Math.random()<.45};
 const sh=new THREE.Group();sh.position.y=1;m.add(sh);
 const hip=HV.put(m,'hip'+(zb?'z':'h'),HV.hip(v),M);HV.put(sh,style?'operator-torso-'+style:'z-torso-'+v.var,style?operatorTorso(style):HV.zombieTorso(v),M);
 const head=new THREE.Group();head.position.set(0,style&&style!=='recruit'?.602:.68,0);sh.add(head);HV.put(head,style?'operator-head-'+style:'z-head',style?operatorHead(style):HV.zombieHead,M);
 if(zb){const eg=HV.G().ss;for(const s of[-1,1]){const e=new THREE.Mesh(eg,eyeM);e.scale.set(.02,.018,.012);e.position.set(s*.04,.13,.105);head.add(e)}}
 let jaw=null;if(zb){jaw=new THREE.Group();jaw.position.set(0,.05,.02);head.add(jaw);HV.put(jaw,'jaw',(a,rod,G)=>{a('skin',G.bx,.11,.04,.12,0,-.02,.05);a('blood',G.bx,.08,.02,.08,0,0,.05);for(let i=0;i<6;i++)a('bone',G.bx,.01,.014,.008,(i-2.5)*.016,.006,.108)},M)}
 const leg=(x,s)=>{const l=new THREE.Group(),sg_=new THREE.Group();l.position.set(x,.98,0);HV.put(l,'lu'+(zb?'z':'h')+s,HV.legU(v,s),M);sg_.position.set(0,-.46,0);HV.put(sg_,'ll'+(zb?'z'+v.bare:'h')+s,HV.legL(v,s),M);l.add(sg_);m.add(l);return[l,sg_]};
 const[legL,shinL]=leg(-.1,-1),[legR,shinR]=leg(.1,1),armR=mkArm2(m,v,-1,M),armL=mkArm2(m,v,1,M);
 if(style)for(const [side,arm,leg,shin] of [[1,armR,legR,shinR],[-1,armL,legL,shinL]]){
  for(const [part,target] of [['arm',arm.up],['forearm',arm.fo],['leg',leg],['shin',shin]])
   HV.put(target,style+'-'+part+side,operatorGear(style,side,part),M);
 }
 m.userData.operator=style;
 const rig={hip,legL,legR,shinL,shinR,armR,armL,sh,head,jaw,mat:{skin:M.skin,am:M.am,pants:M.pants,hair:M.hair,vest:M.vest},eyeM};
 /* zombies: eyes that can glow yellow with an aura (rig.setGlow), used by the Big Ben step of the London easter egg */
 if(zb){const tx=HV.auraTex(),mk=(sc,op,y,z)=>{const s_=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,color:0xffd21a,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));s_.scale.set(sc,sc,1);s_.position.set(0,y,z);s_.visible=false;s_.userData.op=op;return s_},
  hs=mk(.55,.95,.13,.1),bs=mk(2.3,.3,.95,0);head.add(hs);m.add(bs);const base=eyeM.color.getHex();let gl=0;
  rig.setGlow=(on,t)=>{if(on){if(!gl){gl=1;eyeM.color.setRGB(2.6,2.1,.15);hs.visible=bs.visible=true}const p=.85+.15*Math.sin((t||0)*7);hs.material.opacity=hs.userData.op*p;bs.material.opacity=bs.userData.op*(.8+.2*Math.sin((t||0)*4+1));hs.scale.setScalar(.55*(.95+.1*Math.sin((t||0)*7)))}
   else if(gl){gl=0;eyeM.color.setHex(base);hs.visible=bs.visible=false}};rig.glowing=()=>!!gl}
 return rig}
/* shoulder position follows the leaning / twisting upper body so the arms stay attached */
var shPos=(r,side)=>{const l=r.lean||0,t=r.tw||0;return V(side*.3*Math.cos(t),1+.5*Math.cos(l)+(r.bob||0),.5*Math.sin(l)-side*.3*Math.sin(t))};
var angD=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b)),falls=[];
/* ---------- ragdoll: dead players, bots and zombies get thrown by the hit, tumble, collide with walls, land ON the highest thing under them
   and go limp (floppy spring-driven legs, head and arms). b.rag holds the state; bodyFall() is used for humans, zombies call ragStart() themselves ---------- */
var spr_=(l,tg,k,c,dt)=>{l.v+=(k*(tg-l.a)-c*l.v)*dt;l.a+=l.v*dt},mkL=()=>({a:0,v:0});
function ragStart(b,dx,dz,st){if(b.rag)return;const h=Math.hypot(dx,dz)||1;if(h<.001||isNaN(h)){const q=Math.random()*6.28;dx=Math.sin(q);dz=Math.cos(q)}else{dx/=h;dz/=h}st=st==null?3.2:st;
 const fw=b.m.rotation.y,fwd=dx*Math.sin(fw)+dz*Math.cos(fw)>0.15,sg=fwd?1:-1,R=Math.random,
 r={x:b.m.position.x,y:b.m.position.y||0,z:b.m.position.z,vx:dx*st*(.8+R()*.6),vz:dz*st*(.8+R()*.6),vy:3+R()*1.4,pit:b.m.rotation.x||0,wp:sg*(4.5+R()*3),tg:sg*Math.PI/2,roll:0,wr:(R()-.5)*3,wy:(R()-.5)*5,land:0,t:0,lie:0,
  L:{lx:mkL(),rx:mkL(),ls:mkL(),rs:mkL(),hx:mkL(),hz:mkL(),sx:mkL(),lz:mkL(),rz:mkL()},H:[0,1].map(()=>({x:0,y:0,z:0,vx:(R()-.5)*8,vy:R()*6,vz:(R()-.5)*8}))};
 for(const k in r.L)r.L[k].v=(R()-.5)*9;b.rag=r;b.m.visible=true}
function ragReset(b){if(!b.rag&&b.m.rotation.z===0)return;b.rag=null;b.m.rotation.x=b.m.rotation.z=0;b.m.position.y=0;const g=b.rig;if(g){g.legL.rotation.z=g.legR.rotation.z=0;if(g.head)g.head.rotation.set(0,0,0);g.sh.rotation.set(0,0,0);g.sh.position.y=1}}
function ragTick(b,dt){const r=b.rag;if(!r)return;r.t+=dt;const g=b.rig,m=b.m,o=r;
 const air=r.y>gnd({x:r.x,z:r.z,y:r.y})+.3+.02||r.vy>0;
 if(air||r.t<.05){r.vy-=24*dt;r.y+=r.vy*dt;const px=r.x,pz=r.z;mv(o,r.vx*dt,r.vz*dt,.4);if(Math.abs(o.x-px-r.vx*dt)>1e-4)r.vx*=-.2;if(Math.abs(o.z-pz-r.vz*dt)>1e-4)r.vz*=-.2;
  if(Math.abs(r.pit)<Math.abs(r.tg))r.pit+=r.wp*dt;if(Math.abs(r.pit)>Math.abs(r.tg))r.pit=r.tg}
 const gy=gnd({x:r.x,z:r.z,y:r.y})+.3*Math.abs(Math.sin(r.pit))+(Math.abs(Math.sin(r.pit))<.5?0:0);
 if(r.y<=gy){if(!r.land&&r.vy<-1){r.land=1;for(const k in r.L)r.L[k].v+=(Math.random()-.5)*10;for(const h of r.H){h.vx+=(Math.random()-.5)*9;h.vy+=Math.random()*5;h.vz+=(Math.random()-.5)*9}}
  const bnc=r.vy<-5&&!r.bn;r.y=gy;if(bnc){r.vy=-r.vy*.22;r.bn=1}else r.vy=0;const f=Math.exp(-6*dt);r.vx*=f;r.vz*=f;mv(o,r.vx*dt,r.vz*dt,.4);r.pit+=(r.tg-r.pit)*Math.min(1,dt*12)}
 r.wy*=Math.exp(-2.5*dt);r.wr*=Math.exp(-2.5*dt);m.rotation.y+=r.wy*dt*(Math.abs(r.vx)+Math.abs(r.vz)>.3?1:.2);r.roll+=r.wr*dt;r.roll*=Math.exp(-1.2*dt);
 m.rotation.x=r.pit;m.rotation.z=r.roll;m.position.set(r.x,r.y-(r.sink||0),r.z);
 if(!g)return;const L=r.L,s=Math.sign(r.tg)||1;
 spr_(L.lx,.25,38,5,dt);spr_(L.rx,-.15,38,5,dt);spr_(L.ls,.45*(s>0?1:.5),30,5,dt);spr_(L.rs,.2,30,5,dt);spr_(L.hx,s>0?.5:-.3,34,4.5,dt);spr_(L.hz,.25,30,4,dt);spr_(L.sx,-.08,30,5,dt);spr_(L.lz,.2,30,5,dt);spr_(L.rz,-.22,30,5,dt);
 g.legL.rotation.x=L.lx.a;g.legR.rotation.x=L.rx.a;g.legL.rotation.z=L.lz.a;g.legR.rotation.z=L.rz.a;g.shinL.rotation.x=Math.max(0,L.ls.a);g.shinR.rotation.x=Math.max(0,L.rs.a);
 if(g.head)g.head.rotation.set(L.hx.a,0,L.hz.a);g.sh.rotation.set(L.sx.a,0,0);g.sh.position.y=1;if(g.jaw)g.jaw.rotation.x=.5;
 g.lean=L.sx.a;g.tw=0;g.bob=0;
 for(let i=0;i<2;i++){const sd=i?1:-1,h=r.H[i],tx=sd*.12-h.x*0,ty=-.1,tz=.1;h.vx+=(40*(tx*.0-h.x)-5*h.vx)*dt;h.vy+=(40*(ty*.0-h.y)-5*h.vy)*dt+(-4)*dt;h.vz+=(40*(0-h.z)-5*h.vz)*dt;h.x=Math.max(-.35,Math.min(.35,h.x+h.vx*dt*.1));h.y=Math.max(-.3,Math.min(.2,h.y+h.vy*dt*.1));h.z=Math.max(-.35,Math.min(.35,h.z+h.vz*dt*.1))}
 const sL=shPos(g,-1),sR=shPos(g,1),H=r.H;ik(sR,V(sR.x+.1+H[1].x,sR.y-.6+H[1].y,sR.z+.04+H[1].z),V(.6,-1,-.3),g.armR);ik(sL,V(sL.x-.1+H[0].x,sL.y-.6+H[0].y,sL.z+.04+H[0].z),V(-.6,-1,-.3),g.armL)}
/* killed bots tumble instead of vanishing; zombies start their own in zDamage */
function bodyFall(b,dx,dz){if(b.zom)return;if(dx==null){dx=b.x-P.x;dz=b.z-P.z}ragStart(b,dx,dz);b.fall=0;if(!falls.includes(b))falls.push(b)}
function fallTick(dt){for(let i=falls.length-1;i>=0;i--){const b=falls[i];if(b.fall==null){falls.splice(i,1);continue}b.fall+=dt;ragTick(b,dt);if(b.fall>2.4){b.m.visible=false;ragReset(b);b.fall=null;falls.splice(i,1)}}}
function animBot(b,dt){const r=b.rig,g=b.hg;if(!r)return;const mdx=b.x-(b.px==null?b.x:b.px),mdz=b.z-(b.pz==null?b.z:b.pz),back=b.net&&!b.zom&&b.ry!=null&&(mdx*Math.sin(b.ry)+mdz*Math.cos(b.ry))<-.015;
 const sp=Math.min(9,Math.hypot(b.x-(b.px==null?b.x:b.px),b.z-(b.pz==null?b.z:b.pz))/Math.max(dt,.001)),mvf=Math.min(1,sp/3);b.px=b.x;b.pz=b.z;
 const tgt=b.tyaw!=null?b.tyaw:b.m.rotation.y;if(b.ry==null)b.ry=tgt;b.ry+=angD(tgt,b.ry)*Math.min(1,dt*(b.zom?7:11));b.m.rotation.y=b.ry;
 const swimming=!b.zom&&b.y<-.66&&MAPS[sel.map].swim;
 b.ph=(b.ph||0)+(swimming?3.5+sp:sp*(b.zom?1.05:1.3))*dt*(back?-1:1);
 const ph=b.ph,s=Math.sin(ph),c=Math.cos(ph),sh=r.sh,id=b.i*1.7,run=sp>3.2,zb=!!b.zom;
 const za=zb&&typeof zAtkPose=='function'?zAtkPose(b,dt):null,lean=za?.vault?za.lean:(zb?(run?.5:.3):.04+(swimming?.32:.12)*mvf)-(b.fl>0?b.fl*1.2:0)+(za?za.lean:0),twS=-s*(zb?.22:.16)*mvf+(za?za.tw:0),bob=Math.abs(c)*.025*mvf+(za?za.bob:0);
 sh.rotation.set(lean+(zb?Math.sin(t0*1.6+id)*.05:Math.sin(t0*1.7+id)*.008),twS,zb?s*.12*mvf+Math.sin(t0*.9+id)*.03:Math.sin(t0*1.3+id)*.01);sh.position.y=1+bob;sh.scale.y=1+.006*Math.sin(t0*2+id);r.lean=lean;r.tw=twS;r.bob=bob;
 if(r.head)r.head.rotation.set(zb?.25+Math.sin(t0*2.1+id)*.08:-lean*.6,zb?Math.sin(t0*1.3+id)*.25:0,zb?.2+Math.sin(t0*.8+id)*.1:0);
 if(za&&r.head){r.head.rotation.x+=za.hx;r.head.rotation.y+=za.hy}
 const amp=zb?(run?.95:.6):swimming?.34:.8;
 r.legL.rotation.x=s*amp*mvf;r.legR.rotation.x=-s*amp*mvf*(zb?.75:1)-(zb?.1*mvf:0);
 r.shinL.rotation.x=Math.max(0,c)*(zb?.6:swimming?.5:1)*mvf;
 r.shinR.rotation.x=Math.max(0,-c)*(zb?.4:swimming?.5:1)*mvf;r.legL.position.y=r.legR.position.y=.98+Math.abs(c)*.01*mvf;
 if(za?.vault)lockboxVaultLegs(b,r);
 /* stance and air poses for other players: crouch, slide, jump (legs tucked), prone / dive (whole body tilts, see netTick), looking up and down */
 r.dr=0;if(!zb&&(b.net||b.sa)){const T=b.st||0,tk=Math.min(1,dt*11),up=(k,v)=>{b[k]=(b[k]||0)+(v-(b[k]||0))*tk};up('pc',T==1?1:0);up('psl',T==3?1:0);up('pj',b.aj&&T!=2&&T!=4?1:0);up('pp',T==2||T==4?1:0);up('pis',cl(b.pi||0,-1.2,1.2));
  const pc=b.pc,psl=b.psl,pj=b.pj*(1-pc*.5),w=Math.min(1,pc+psl+pj),dr=.3*pc+.42*psl,mix=(w0,a,bb,j)=>w0*(1-w)+a*pc+bb*psl+j*pj;
  if(w>.01){r.legL.rotation.x=mix(r.legL.rotation.x,-1.0,-1.25,-.6);r.legR.rotation.x=mix(r.legR.rotation.x,-.75,-.85,-.1);r.shinL.rotation.x=mix(r.shinL.rotation.x,1.5,.15,1.05);r.shinR.rotation.x=mix(r.shinR.rotation.x,1.3,1.5,.85)}
  r.dr=dr;if(dr>0||r.hipD){for(const h of r.hip||[]){if(h.userData.y0==null)h.userData.y0=h.position.y;h.position.y=h.userData.y0-dr}r.hipD=dr>.001}
  r.legL.position.y-=dr;r.legR.position.y-=dr;sh.position.y-=dr;r.bob-=dr;sh.rotation.x+=.14*pc-.5*psl+.07*pj-b.pis*.22;if(r.head)r.head.rotation.x+=-b.pis*.55;g&&(g.userData.pis=b.pis)}
 const sL=shPos(r,-1),sR=shPos(r,1);
 if(zb){const sw=Math.sin(t0*3+id)*.07,lg=b.lunge>0?.22:0;if(lg)b.lunge-=dt;const ay=run?s*.3:sw;let aR=[.02,-.12+ay,.58+lg+(run?.1:0)],aL=[-.02,-.12-ay,.58+lg];if(za){aR=za.R;aL=za.L}
  ik(sR,V(sR.x+aR[0],sR.y+aR[1],sR.z+aR[2]),za?V(za.hR[0],za.hR[1],za.hR[2]):V(.6,-1,-.3),r.armR);ik(sL,V(sL.x+aL[0],sL.y+aL[1],sL.z+aL[2]),za?V(za.hL[0],za.hL[1],za.hL[2]):V(-.6,-1,-.3),r.armL);if(r.jaw)r.jaw.rotation.x=za?za.jaw:.2+.18*Math.sin(t0*5+id)+(lg?.3:0);return}
 if(!g)return;
 const w=W[b.wk]||W.AR,A=g.userData.a||{r:[0,-.1,.1],l:[0,-.05,.5],m:[0,-.15,.3]};let rp=-1;
 if(b.net){if(b.rlOn){b.rlt=(b.rlt||0)+dt;rp=Math.min(1,b.rlt/Math.max(.4,w.rl))}else b.rlt=0}else if(b.rl>0)rp=1-b.rl/Math.max(.4,w.rl);
 const bell=rp<0?0:Math.sin(Math.PI*rp);const H3=hold3(b,mvf,run,id);g.position.set(.12+H3[0],1.36+H3[1]-(r.dr||0)+Math.abs(s)*.02*mvf-.06*bell,(b.hold?b.hold.gz:.18)+H3[2]);g.scale.setScalar(b.hold?b.hold.s:1);g.rotation.set(-.5*bell-(b.net?(b.pis||0)*.6:0)+H3[3],H3[4],.3*bell+H3[5]);
 const R0=V(...A.r),kind=RLK[b.wk]||'mag',mg=g.userData.mags||[],pm=g.userData.pump||[],o=rlPose(kind,rp,A,1,4,mg,g,0,pm.length>0),q=g.quaternion,tw=a=>a.clone().multiplyScalar(g.scale.x).applyQuaternion(q).add(g.position);clampHand(o,sL,tw,q,.7);applyRl(o,mg,pm,g,kind,1);
 const pistol=w.sidearm||['CT','MG','MP','DS'].includes(b.wk),grip=V(0,1,.24).applyQuaternion(q);
 if(rp<0&&pistol&&b.wk!=='DS')o.h.copy(R0).add(V(-.038,-.042,.01));
 gripArm(sR,tw(R0),V(.6,-1,-.3),r.armR,grip,1);
 gripArm(sL,tw(o.h),V(-.6,-1,-.3),r.armL,pistol?grip:V(0,0,1).applyQuaternion(q),-1);
}
/* movement: walk 7, sprint 10.5 with Shift (forward only), smoothed acceleration, mantle ledges while airborne, kick off walls with a fresh jump press */
function phys(dt,f,s,spd){const map=MAPS[sel.map],maxHeight=(map.ceilingY??Infinity)-1.85;
 if(P.mt){if(P.mt.ty<=maxHeight){P.mx=P.mz=0;mantleStep(dt);return}P.mt=null}
 if(map.swim&&quarrySwim(dt,f,s))return;
 const spc=key.Space&&!ST.sj,jp=spc&&!P.jh;P.jh=!!spc;P.coy=P.on?.11:Math.max(0,(P.coy||0)-dt);P.jb=jp?.13:Math.max(0,(P.jb||0)-dt);const n=Math.hypot(f,s)||1,cy=Math.cos(yaw),sy=Math.sin(yaw);const ac_=Math.min(1,dt*(P.on?((f||s)?12:16):6.5));P.mx=(P.mx||0)+((-sy*f+cy*s)/n*spd-(P.mx||0))*ac_;P.mz=(P.mz||0)+((-cy*f-sy*s)/n*spd-(P.mz||0))*ac_;let dx=P.mx*dt,dz=P.mz*dt;
 if(P.wvx||P.wvz){dx+=P.wvx*dt;dz+=P.wvz*dt;const k=Math.exp(-4.5*dt);P.wvx*=k;P.wvz*=k;if(Math.hypot(P.wvx,P.wvz)<.3)P.wvx=P.wvz=0}
 mv(P,dx,dz,.4);
 if((spc||P.jb>0)&&(P.on||P.coy>0)&&P.vy<=1.5){P.vy=PK('Spring Legs')?9.4:7.6;P.on=0;P.coy=0;P.jb=0;P.jv=1;if(typeof feelJump=='function')feelJump()}else if(jp&&!P.on)tryWall();
 if(P.jv&&!spc&&!P.on&&P.vy>3.4)P.vy-=P.vy*Math.min(1,dt*9);
 P.vy-=20*dt;P.y+=P.vy*dt;
 if(P.y>maxHeight){P.y=maxHeight;P.vy=Math.min(0,P.vy);P.jb=0;P.coy=0}
 const g=gnd(P,maxHeight);if(P.y<=g){P.lvy=P.vy;P.y=g;P.vy=0;P.on=1;P.wj=0;P.jv=0}else P.on=0;
 if(!P.on&&key.KeyW&&P.vy<5&&t0>=(P.mcd||0))tryMantle(maxHeight)}
function tryMantle(maxHeight=Infinity){const fx_=-Math.sin(yaw),fz_=-Math.cos(yaw),px=P.x+fx_*.65,pz=P.z+fz_*.65;
 indexCollisions();
 for(const b of collisionCells.get(collisionKey(px,pz))||emptyCollisionCell){const up=b.h-P.y;if(b.collisionRemoved||up<.55||up>1.45||b.h>maxHeight||(mode=='Zombies'&&b.h>2.6)||(b.y0||0)>P.y+1.2||px<b.x0-.05||px>b.x1+.05||pz<b.z0-.05||pz>b.z1+.05)continue;
  const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,hx=Math.max(0,(b.x1-b.x0)/2-.3),hz=Math.max(0,(b.z1-b.z0)/2-.3),tx=cl(P.x+fx_,cx-hx,cx+hx),tz=cl(P.z+fz_,cz-hz,cz+hz);
  const room=MAPS[sel.map].playerRoom;if(room&&(Math.abs(tx)>room-.4||Math.abs(tz)>room-.4))continue;
  const ceiling=collisionCells.get(collisionKey(tx,tz))||emptyCollisionCell;
  if(ceiling.some(o=>o!==b&&!o.collisionRemoved&&tx>o.x0-.35&&tx<o.x1+.35&&tz>o.z0-.35&&tz<o.z1+.35&&(o.y0||0)<b.h+1.7&&o.h>b.h+.05))continue;
  P.mt={sx:P.x,sy:P.y,sz:P.z,tx,ty:b.h,tz,t:0,d:.42};P.vy=0;P.wvx=P.wvz=0;beep(300,.1,'triangle',.05);return}}
function mantleStep(dt){const m=P.mt;m.t+=dt;const k=Math.min(1,m.t/m.d),e=eas(Math.min(1,k/.55)),h=eas(Math.max(0,(k-.35)/.65));P.y=m.sy+(m.ty-m.sy)*e;P.x=m.sx+(m.tx-m.sx)*h;P.z=m.sz+(m.tz-m.sz)*h;P.vy=0;P.on=0;
 if(k>=1){P.x=m.tx;P.y=m.ty;P.z=m.tz;P.on=1;P.mt=null;P.mcd=t0+.4;P.wj=0;shake=Math.max(shake,.15)}}
function tryWall(){if(mode=='Zombies'||(P.wj||0)>=3||t0<(P.wcd||0))return;
 indexCollisions();
 for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const qx=P.x+dx*.55,qz=P.z+dz*.55;
  for(const b of collisionCells.get(collisionKey(qx,qz))||emptyCollisionCell){if(!b.collisionRemoved&&qx>b.x0&&qx<b.x1&&qz>b.z0&&qz<b.z1&&(b.y0||0)<P.y+1&&b.h>P.y+.9){P.vy=7.2;P.wvx=-dx*7;P.wvz=-dz*7;P.wj=(P.wj||0)+1;P.wcd=t0+.25;shake=Math.max(shake,.2);beep(420,.09,'triangle',.05);return}}}}

/* ===================== pvp.js ===================== */
/* ---------- simulated PvP (bots fight each other), Team Deathmatch, Capture the Flag, popups, killstreak panel; solo and private matches ---------- */
var ts={},lastBot=null,ksC='',flags=[],cs={A:0,B:0},myTeam='A',mpTeams={},obText='',fcc=0,zones=[],ds={A:0,B:0},dtk=0,zcc=0;
var teamMode=()=>mode=='Team Deathmatch'||mode=='Kill Confirmed'||mode=='Capture the Flag'||mode=='Domination'||mode=='Hardpoint',pTeam=()=>teamMode()?myTeam:'p',ally=b=>mode=='Zombies'?!b.zom:teamMode()&&b.team==pTeam(),hl=()=>PK('Hardline')?1:0,tmOf=e=>e===P?pTeam():e.team,fl=t=>flags.find(f=>f.team==t),tn=t=>t=='A'?'Blue':'Red';
var hname=()=>netOn?myName:'You',feedAll=t=>{feed(t);if(netOn&&isHost)netSend({t:'feed',s:t})},popAll=(a,b)=>{popup(a,b);if(netOn&&isHost)netSend({t:'pop',a,b})};
function leader(){const c=[{nm:hname(),k:kills,me:1},...bots.map(b=>({nm:b.nm,k:b.k||0}))];return c.reduce((a,b)=>b.k>a.k?b:a)}
function clearFlags(){for(const f of flags){S.remove(f.m);S.remove(f.ring)}flags=[];clearZones()}
var PBOTS=null;var botN=d=>PBOTS==null?d:PBOTS;
function setupBots(){if(typeof botNameReset=='function')botNameReset();kcReset();ts={};lastBot=null;clearFlags();cs={A:0,B:0};ds={A:0,B:0};dtk=0;if(practiceSession)return practiceSetup();const cli=netOn&&!isHost,mk=(n,team,role)=>{if(cli)return;const b=addBot(60,1);b.team=team;b.nm=typeof botName=='function'?botName(n,b):n;b.k=0;b.cf=null;b.role=role;b.ox=(Math.random()-.5)*12;b.oz=(Math.random()-.5)*12;if(team==='A'||team==='B')markOperatorTeam(b.rig,team);spawn(b)};
 if(mode=='Slayer'||mode=='One in the Chamber')for(let i=0;i<botN(6);i++)mk((netOn?'Bot ':'Fighter ')+(i+1),'b'+i);
 if(mode=='Time Attack')for(let i=0;i<botN(8);i++)mk((netOn?'Bot ':'Fighter ')+(i+1),'b'+i);
 if(teamMode()){const hc=t=>Object.values(mpTeams).filter(x=>x==t).length;let nA=netOn?Math.max(0,5-hc('A')):4,nB=netOn?Math.max(0,5-hc('B')):5;if(PBOTS!=null){let cA=hc('A')+(netOn?0:1),cB=hc('B');nA=nB=0;for(let i=0;i<PBOTS;i++){if(cA+nA<=cB+nB)nA++;else nB++}}
  for(let i=0;i<nA;i++)mk((netOn?'Blue ':'Ally ')+(i+1),'A',i%2?'def':'atk');for(let i=0;i<nB;i++)mk((netOn?'Red ':'Enemy ')+(i+1),'B',i%2?'def':'atk');if(mode=='Capture the Flag')setupFlags();if(mode=='Domination')setupZones();if(mode=='Hardpoint')setupHP()}}
function freeNear(x,z){for(let r=0;r<40;r+=2)for(let a=0;a<6.3;a+=.7){const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(Math.abs(px)<H-3&&Math.abs(pz)<H-3&&!bx.some(b=>b.h>.5&&(b.y0||0)<2&&px>b.x0-2&&px<b.x1+2&&pz>b.z0-2&&pz<b.z1+2)&&(!MAPS[sel.map].inside||MAPS[sel.map].inside(px,pz))&&(typeof navOK!='function'||navOK(px,pz)))return[px,pz]}return[x,z]}
function setupFlags(){const fb=MAPS[sel.map].fb||[[-H*.7,0],[H*.7,0]];flags=['A','B'].map((team,i)=>{const[hx,hz]=freeNear(...fb[i]),col=team=='A'?0x3d6ad6:0xd9432e,m=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,3.4,8),new THREE.MeshLambertMaterial({color:0xdddddd})),cloth=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:col})),ring=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.05,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.4}));
 pole.position.y=1.7;cloth.scale.set(1.3,.8,.05);cloth.position.set(.7,3,0);m.add(pole,cloth);m.position.set(hx,0,hz);ring.position.set(hx,.05,hz);S.add(m,ring);return{team,hx,hz,x:hx,z:hz,st:'home',by:null,byk:'',dt:0,m,ring}})}
function retFlag(f,e){f.st='home';f.x=f.hx;f.z=f.hz;f.by=null;feedAll(`${tn(f.team)} flag returned${e?' by '+(e===P?hname():e.nm):''}`)}
function ctfGoal(b){const tm=b.team,EF=fl(tm=='A'?'B':'A'),OF=fl(tm);if(b.cf)return OF.st=='home'?[OF.hx,OF.hz]:[OF.x,OF.z];
 if(OF.st!='home'&&(b.role=='def'||Math.hypot(OF.x-b.x,OF.z-b.z)<30))return[OF.x,OF.z];
 if(b.role=='atk')return EF.st=='carried'&&tmOf(EF.by)==tm?[OF.hx+b.ox*.5,OF.hz+b.oz*.5]:[EF.x,EF.z];return[OF.hx+b.ox,OF.hz+b.oz]}
function ctfTick(dt){for(const f of flags){if(f.st=='carried'){const e=f.by;if(e===P?P.dead:!e.al){f.st='dropped';f.dt=0;e.cf=null;feedAll(tn(f.team)+' flag dropped')}else{f.x=e.x;f.z=e.z}}else if(f.st=='dropped'){f.dt+=dt;if(f.dt>15)retFlag(f)}
  f.m.position.set(f.x,0,f.z);f.m.visible=!(f.st=='carried'&&f.by===P)}
 for(const e of[...(P.dead?[]:[P]),...bots.filter(b=>b.al)]){const tm=tmOf(e),OF=fl(tm),EF=fl(tm=='A'?'B':'A');
  if(!e.cf&&EF.st!='carried'&&Math.hypot(e.x-EF.x,e.z-EF.z)<1.8){EF.st='carried';EF.by=e;e.cf=EF;feedAll(`${e===P?hname():e.nm} took the ${tn(EF.team)} flag`);if(e===P)msg('You have the flag! Bring it home',2.5)}
  if(OF.st=='dropped'&&Math.hypot(e.x-OF.x,e.z-OF.z)<1.8)retFlag(OF,e);
  if(e.cf&&OF.st=='home'&&Math.hypot(e.x-OF.hx,e.z-OF.hz)<2.5){cs[tm]++;retFlag(e.cf);e.cf=null;popAll('FLAG CAPTURED',tn(tm)+' team scores');if(e===P)bonusXP(.12)}}
 if(netOn&&isHost){fcc+=dt;if(fcc>.12){fcc=0;netSend({t:'f',cs,f:flags.map(f=>[f.st,+f.x.toFixed(1),+f.z.toFixed(1),f.by?(f.by===P?myId:f.by.net?f.by.id:'b'+f.by.i):''])})}}}
/* ---------- Domination: three zones, hold them to score, first team to 350 ---------- */
function clearZones(){for(const z of zones)S.remove(z.m);zones=[]}
function setupZones(){clearZones();const zp=MAPS[sel.map].zn||[[-H*.62,0],[0,0],[H*.62,0]];
 zones=zp.map(([zx,zz],i)=>{const[x,z]=freeNear(zx,zz),m=new THREE.Group(),R0=5.5,mt=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.28,depthWrite:false}),
  base=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.06,40),mt(0xcccccc)),fill=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.1,40),mt(0xcccccc)),beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,9,10),mt(0xcccccc)),
  cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.font='700 100px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('ABC'[i],64,70);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true}));
  base.position.y=.05;fill.position.y=.07;beam.position.y=4.5;sp.position.y=9.6;sp.scale.set(3,3,1);m.add(base,fill,beam,sp);m.position.set(x,0,z);S.add(m);
  const o={n:'ABC'[i],x,z,r:R0,m,base,fill,beam,o:'',cp:0,a:0,b:0};zoneVis(o);return o})}
function zoneVis(z){const col=z.o=='A'?0x62a8ff:z.o=='B'?0xff5a3a:0xcccccc,s=Math.max(.001,Math.abs(z.cp));z.base.material.color.setHex(col);z.beam.material.color.setHex(col);z.fill.material.color.setHex(z.cp>0?0x62a8ff:0xff5a3a);z.fill.scale.set(s,1,s);z.fill.visible=Math.abs(z.cp)>.01}
function domTick(dt){const ents=[...(P.dead?[]:[P]),...bots.filter(b=>b.al)];
 for(const z of zones){let a=0,b=0;for(const e of ents)if(Math.hypot(e.x-z.x,e.z-z.z)<z.r&&(e.y||0)<4){if(tmOf(e)=='A')a++;else b++}
  z.a=a;z.b=b;if(a&&!b)z.cp=Math.min(1,z.cp+dt*.22*Math.min(a,3));else if(b&&!a)z.cp=Math.max(-1,z.cp-dt*.22*Math.min(b,3));
  let o=z.o;if(z.cp>=1)o='A';else if(z.cp<=-1)o='B';else if((o=='A'&&z.cp<=0)||(o=='B'&&z.cp>=0))o='';
  if(o!=z.o){z.o=o;popAll(o?`ZONE ${z.n} CAPTURED`:`ZONE ${z.n} NEUTRALISED`,o?tn(o)+' team':'No one holds it');if(o&&o==pTeam())bonusXP(.02)}
  zoneVis(z)}
 dtk+=dt;while(dtk>=2){dtk-=2;for(const z of zones)if(z.o)ds[z.o]++}
 if(netOn&&isHost){zcc+=dt;if(zcc>.15){zcc=0;netSend({t:'z',ds,z:zones.map(z=>[z.o,+z.cp.toFixed(2)])})}}}
/* ---------- Hardpoint: one scoring zone with a visible perimeter that moves to the next location every 60 seconds. A team scores 1 point per second while at least one of its players is inside
   and nobody from the other team is. First to 250 wins. ---------- */
var hpIdx=0,hpTL=60,hpS=0,hpPos=[];
function hpMake(x,z,idx){const R0=7,mt=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,depthWrite:false,side:THREE.DoubleSide}),m=new THREE.Group(),
 ring=new THREE.Mesh(new THREE.RingGeometry(R0-.45,R0,64),mt(0xffffff,.9)),base=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.05,48),mt(0xffffff,.16)),wall=new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,2.2,48,1,true),mt(0xffffff,.12)),beam=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,12,10),mt(0xffffff,.3)),
 cv=document.createElement('canvas');cv.width=256;cv.height=96;const g=cv.getContext('2d');g.font='700 70px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('HARDPOINT',128,50);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true}));ring.rotation.x=-Math.PI/2;ring.position.y=.1;base.position.y=.04;wall.position.y=1.1;beam.position.y=6;sp.position.y=13;sp.scale.set(6,2.25,1);m.add(ring,base,wall,beam,sp);m.position.set(x,0,z);S.add(m);
 const o={n:'HP',x,z,r:R0,m,base,fill:ring,beam,wall,ring,o:'',cp:0,a:0,b:0,idx,st:''};hpVis(o);return o}
function hpVis(z){const col=z.st=='A'?0x62a8ff:z.st=='B'?0xff5a3a:z.st=='c'?0xffd24a:0xffffff;for(const k of['ring','base','wall','beam'])z[k].material.color.setHex(col)}
function hpPlace(i){clearZones();hpPos=MAPS[sel.map].zn||[[-H*.62,0],[0,0],[H*.62,0]];hpIdx=i%hpPos.length;const[x,z]=freeNear(hpPos[hpIdx][0],hpPos[hpIdx][1]);zones=[hpMake(x,z,hpIdx)]}
function setupHP(){hpTL=60;hpS=0;hpPlace(Math.random()*3|0)}
function hpApply(h){if(!zones[0]||zones[0].idx!=h.i){clearZones();zones=[hpMake(h.x,h.z,h.i)]}const z=zones[0];z.st=h.st;z.o=h.st=='A'||h.st=='B'?h.st:'';hpTL=h.tl;hpVis(z)}
function hpTick(dt){const z=zones[0];if(!z)return;const ents=[...(P.dead?[]:[P]),...bots.filter(b=>b.al)];let a=0,b=0;for(const e of ents)if(Math.hypot(e.x-z.x,e.z-z.z)<z.r&&(e.y||0)<4){if(tmOf(e)=='A')a++;else b++}
 const st=a&&b?'c':a?'A':b?'B':'';if(st!=z.st){z.st=st;z.o=st=='A'||st=='B'?st:'';hpVis(z);if(st=='A'||st=='B')popAll(st==pTeam()?'HARDPOINT SECURED':'HARDPOINT LOST',tn(st)+' team holds it');else if(st=='c')popAll('HARDPOINT CONTESTED','Both teams inside')}
 z.a=a;z.b=b;hpS+=dt;while(hpS>=1){hpS-=1;if(a&&!b)ds.A++;else if(b&&!a)ds.B++}
 const pre=hpTL;hpTL-=dt;if(Math.floor(pre)!=Math.floor(hpTL)&&hpTL<=5&&hpTL>0)beep(700,.08,'square',.05);
 if(hpTL<=0){hpTL=60;hpPlace(hpIdx+1);popAll('HARDPOINT MOVING','New location marked on the radar')}
 if(netOn&&isHost){zcc+=dt;if(zcc>.15){zcc=0;const q=zones[0];netSend({t:'z',ds,z:[[q.o,0]],hp:{i:hpIdx,x:q.x,z:q.z,tl:+hpTL.toFixed(1),st:q.st}})}}}
/* bots head for the zone that is nearest and not already theirs; defenders also stay on zones their team owns */
function domGoal(b){if(!zones.length)return null;if(b.zi==null||t0>(b.zr||0)){b.zr=t0+3+Math.random()*3;const tm=b.team;b.zi=zones.map((z,i)=>({i,s:Math.hypot(z.x-b.x,z.z-b.z)+(z.o==tm?(b.role=='def'?0:60):0)+Math.random()*25})).sort((p,q)=>p.s-q.s)[0].i}
 const z=zones[b.zi];return[z.x+b.ox*.3,z.z+b.oz*.3]}
function target(b){let best=null,bd=1e9;for(const t of bots){if(t===b||!t.al||t.team==b.team)continue;const d=Math.hypot(t.x-b.x,t.z-b.z);if(d<bd){bd=d;best=t}}
 if(!P.dead&&b.team!=pTeam()&&Math.hypot(P.x-b.x,P.z-b.z)<bd)best=P;return best}
function botHit(t,d,by,head){takeDmg(t,d);t.fl=.08;if(t.hp<=0){t.al=0;t.dc=(t.dc||0)+1;bodyFall(t);t.rt=2.5;burst(V(t.x,1,t.z),20,0xb5452e,6,.8,.15);by.k=(by.k||0)+1;ts[by.team]=(ts[by.team]||0)+1;feed(`${by.nm} ▸ ${t.nm}`);announce(t,by,head)}}
function botScoreOnMe(){const b=lastBot;lastBot=null;if(b&&!b.net){b.k=(b.k||0)+1;ts[b.team]=(ts[b.team]||0)+1;feed(`${b.nm} ▸ You`)}}
function updBots(dt){if(practiceSession||netOn&&!isHost)return;for(const b of bots){if(b.net||b.zom)continue;
 if(!b.al){if(b.rt>0&&mode!='Survival'){b.rt-=dt;if(b.rt<=0)spawn(b)}continue}
 if(b.stun>0){b.stun-=dt;continue}
 if(b.sh<b.msh&&t0-b.lh>4)b.sh=Math.min(b.msh,b.sh+40*dt);if(b.rl>0)b.rl-=dt;
 b.ts=(b.ts||0)-dt;if(b.ts<=0||!b.tg||(b.tg===P?P.dead:!b.tg.al)){b.ts=.5;b.tg=target(b)}
 const t=b.tg,g=mode=='Capture the Flag'?ctfGoal(b):mode=='Domination'||mode=='Hardpoint'?domGoal(b):mode=='Kill Confirmed'?kcGoal(b):null,td=t?Math.hypot(t.x-b.x,t.z-b.z):1e9,obj=g&&td>=(b.cf?7:20);if(!t&&!g)continue;
 const mt=obj?{x:g[0],z:g[1]}:t,dx=mt.x-b.x,dz=mt.z-b.z,dd=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
 b.ot-=dt;if(b.ot<=0){b.ot=1+Math.random()*1.5;b.off=(Math.random()-.5)*2.2||1}
 const h=obj?ang+b.off*.45:ang+(dd>16?b.off*.3:dd<7?Math.PI+b.off*.3:Math.sign(b.off)*1.4),sp=(obj?4.2:3.4)*Math.min(b.df,1.6)*(b.sm||1),px=b.x,pz=b.z;
 if(obj||dd>14||!navLos(b.x,b.z,mt.x,mt.z)){if(!(obj&&dd<2.5))navMove(b,dt,mt.x,mt.z,sp)}
 else{mv(b,Math.sin(h)*sp*dt,Math.cos(h)*sp*dt,.45);if(Math.hypot(b.x-px,b.z-pz)<sp*dt*.3&&dd>2.5){b.off=(Math.random()<.5?-1:1)*2.5;b.ot=.8}}
 if(MAPS[sel.map].swim)quarryBotDepth(b,dt);
 b.m.position.set(b.x,b.y,b.z);b.m.rotation.y=t?Math.atan2(t.x-b.x,t.z-b.z):ang;b.cd-=dt;
 if(t&&b.cd<=0&&!(b.rl>0)&&td<45){const o=V(b.x,b.y+1.5,b.z),tv=V(t.x,(t.y||0)+1.2,t.z).sub(o),D=tv.length();tv.divideScalar(D);
  if(castW(o,tv,D)>=D-.1){const w=W[b.wk]||W.AR;b.am=(b.am==null||b.amk!=b.wk?w.m:b.am)-1;b.amk=b.wk;if(b.am<=0){b.rl=w.rl;b.am=w.m;FOL.bot(b,w)}b.bn=(b.bn||0)-1;b.cd=w.r*(.9+Math.random()*.3)+(b.bn<=0?.45+Math.random()*.7:0);if(b.bn<=0)b.bn=w.burst?w.burst:w.au?3+(Math.random()*5|0):1;{const mz=muzzle(b),tp=V(t.x,(t.y||0)+1.2,t.z),ev=tp.clone().sub(mz),L2=ev.length();ev.divideScalar(L2);if(b.wk=='RG'){rgBeam(mz,ev,L2,1);rgImpact(mz.clone().add(ev.clone().multiplyScalar(L2)))}else{tr(mz,ev,L2,b.team==='A'?0x62a8ff:0xff5a3a,.08,1);if(b.wk=='RL'&&JX.explode)JX.explode(mz.clone().add(ev.clone().multiplyScalar(L2)),W.RL.ex)}muzzleFlash(mz,b.wk);otherSnd(b.wk,mz);if(netOn&&isHost)netSend({t:'bsh',i:b.i,w:b.wk,x:+tp.x.toFixed(1),y:+tp.y.toFixed(1),z:+tp.z.toFixed(1)})}
   const ch=Math.max(.12,.5-td/110)*Math.min(1.3,b.df)*(b.hm||1);let n=0;for(let i=0;i<(w.pel||1);i++)if(Math.random()<ch)n++;if(n){const dm=n*(w.d+(w.ex?w.ex.d*.7:0))*falloff(w,td);if(t===P)hurt(dm*(typeof ST!='undefined'?(ST.prone?.7:ST.crouch?.85:1):1),b);else if(t.net)netSend({t:'hit',to:t.id,d:dm,bot:b.i});else botHit(t,dm,b)}}}}}
function pvpTick(dt){
 if(mode=='Capture the Flag'){ctfTick(dt);const A=fl('A'),B=fl('B'),st=f=>f.st=='home'?'safe':f.st=='dropped'?'dropped':'taken';$('#ob').textContent=`Blue ${cs.A} - ${cs.B} Red  ·  first to 3  ·  Blue flag ${st(A)}  ·  Red flag ${st(B)}`;const w=cs.A>=3?'A':cs.B>=3?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Hardpoint'){hpTick(dt);const z=zones[0];$('#ob').textContent=`Blue ${ds.A} – ${ds.B} Red  ·  first to 250  ·  Hardpoint ${hpIdx+1}/${hpPos.length}  ·  moves in ${Math.max(0,Math.ceil(hpTL))}s  ·  `+(z?z.st=='c'?'CONTESTED':z.st=='A'?'BLUE HOLDING':z.st=='B'?'RED HOLDING':'EMPTY':'');const w=ds.A>=250?'A':ds.B>=250?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Domination'){domTick(dt);$('#ob').textContent=`Blue ${ds.A} – ${ds.B} Red  ·  first to 350  ·  `+zones.map(z=>z.n+' '+(z.o?z.o=='A'?'blue':'red':'open')).join('  ·  ');const w=ds.A>=350?'A':ds.B>=350?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Kill Confirmed'){kcTick(dt);$('#ob').textContent=`Blue ${kc.A} – ${kc.B} Red  ·  first to ${KC_WIN} confirms  ·  tags ${kcTags.length}`;const w=kc.A>=KC_WIN?'A':kc.B>=KC_WIN?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 if(mode=='Team Deathmatch'){$('#ob').textContent=`Blue ${ts.A||0}  ·  Red ${ts.B||0}   (first to 50)`;const w=(ts.A||0)>=50?'A':(ts.B||0)>=50?'B':'';if(w)endGame(w==pTeam()?'Victory':'Defeat');return}
 const l=leader();$('#ob').textContent=`Slayer  ·  Leader ${l.nm} ${l.k} / 20`;if(l.k>=20)endGame(l.me?'Victory':l.nm+' wins')}
function popup(title,detail){
 if(typeof title!=='string'||typeof detail!=='string')return;
 const item=document.createElement('div'),heading=document.createElement('b'),body=document.createElement('span');
 item.className='pp';heading.textContent=title.slice(0,120);
 body.textContent=typeof PG!=='undefined'?PG.t(detail.slice(0,180)):detail.slice(0,180);
 item.append(heading,body);$('#pops').appendChild(item);setTimeout(()=>item.remove(),4300);
 beep(880,.15,'triangle',.07);setTimeout(()=>beep(1320,.2,'triangle',.06),110);
}
function ksHud(){const T=[['UAV',3],['Shield Boost',5],['Airstrike',8]],h=T.map(([n,k])=>{const t=k-hl(),r=q.includes(n),u=ks>=t&&!r;return `<div class="kt ${r?'rdy':u?'used':''}"><b>${n}</b><i>${r?((q.indexOf(n)>=0?'['+(q.indexOf(n)+3)+'] READY':'READY')):u?'USED':Math.min(ks,t)+' / '+t}</i></div>`}).join('');if(h!=ksC){ksC=h;$('#kst').innerHTML=`<small>KILLSTREAKS · ${ks}</small>`+h}}
;
/* ######## weapons.js ######## */
/* ===================== weapons.js ===================== */
/* ---------- MVR-67: full-auto assault rifle (unlocked from the start). Excellent accuracy and range, offset by a slower rate of fire.
   Model built from boxes: bronze receiver and M-LOK handguard, black lower, flip-up sights on a top rail, vented muzzle brake,
   amber magazine and an angular folding-style stock with a cheek riser. Built along +z, muzzle at z=.98 ---------- */
W.MVR={n:'MVR-67',d:40,r:.14,m:24,sp:.005,rc:1.6,pel:1,au:1,rl:2.5,len:.7,col:0x8f6e3e};
PRI.splice(1,0,'MVR');WG.MVR=[1,0x8f6e3e,1,0xffb060];RLK.MVR='mag';BOTGUNS.push('MVR');
function mkMVR(g,rm){const M=c=>new THREE.MeshLambertMaterial({color:c}),tan=rm||M(0x8f6e3e),blk=M(0x15171a),dk=M(0x24272c),gr=M(0x3a3e44),amber=M(0xc8782a),olive=M(0x8a8f3a),steel=M(0x8a9098),
  box=(w,h,d,x,y,z,m,rx,ry)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;g.add(o);return o};
 /* receiver */
 box(.088,.108,.5,0,.002,.15,tan);box(.092,.03,.34,0,.045,.16,dk);box(.07,.07,.34,0,-.07,.1,blk);box(.09,.02,.08,0,-.03,.34,blk);
 box(.012,.05,.07,.048,.0,.32,blk);box(.012,.03,.05,.048,.02,.1,gr);box(.01,.05,.016,-.049,.02,.02,gr);
 /* ejection port and charging handle */
 box(.004,.04,.1,.045,.03,.1,blk);box(.022,.02,.05,0,.062,-.04,gr);box(.01,.03,.014,.05,.0,.04,steel);
 /* handguard with M-LOK slots, vents and a rail */
 box(.082,.098,.44,0,.004,.62,tan);box(.084,.03,.44,0,.044,.62,dk);for(let i=0;i<5;i++){box(.086,.012,.04,0,-.012,.46+i*.075,blk);box(.012,.03,.045,.044,.014,.46+i*.075,blk);box(.012,.03,.045,-.044,.014,.46+i*.075,blk)}
 box(.07,.02,.4,0,-.052,.62,blk);box(.03,.03,.1,0,-.07,.7,dk,0);
 /* top rail with teeth */
 box(.03,.02,.92,0,.074,.42,blk);for(let i=0;i<14;i++)box(.034,.008,.012,0,.086,-.02+i*.066,dk);
 /* barrel, gas block and muzzle brake */
 box(.03,.03,.2,0,.01,.94,dk);box(.045,.045,.05,0,.01,.78,gr);box(.054,.056,.12,0,.01,1.0,blk);for(let i=0;i<3;i++){box(.058,.012,.014,0,.012,.96+i*.035,tan)}box(.02,.02,.012,0,.01,1.066,dk);
 /* flip-up sights: rear with an aperture, front with a post */
 mkSights(g,'MVR',{yt:.138,yb:.086,yf:.086,zr:.0,zf:.77});
 /* grips */
 box(.046,.15,.06,0,-.15,-.06,blk,.3);box(.05,.02,.07,0,-.225,-.09,dk,.3);box(.012,.1,.05,.026,-.14,-.06,gr,.3);box(.012,.1,.05,-.026,-.14,-.06,gr,.3);
 box(.012,.012,.1,0,-.1,.14,dk);box(.012,.04,.012,0,-.085,.2,dk);box(.012,.04,.012,0,-.085,.08,dk);
 box(.05,.02,.07,0,-.056,.5,gr);box(.034,.06,.1,0,-.09,.52,blk);
 /* amber magazine */
 const mg=[box(.046,.2,.08,0,-.17,.2,amber,.12),box(.05,.02,.088,0,-.275,.188,dk,.12)];
 box(.052,.2,.02,0,-.17,.255,blk,.12);
 /* stock: hinge, skeletal arms, cheek riser and butt pad */
 box(.06,.1,.04,0,0,-.13,dk);box(.04,.025,.26,0,.03,-.28,blk);box(.04,.025,.22,0,-.05,-.26,blk,.12);box(.044,.05,.16,0,.062,-.3,gr);box(.05,.13,.04,0,-.01,-.42,dk);box(.056,.03,.05,0,.062,-.42,blk);
 g.userData.a={r:[0,-.14,-.05],l:[0,-.09,.62],m:[0,-.17,.2]};g.userData.mags=mg;return g}
;
/* ######## models.js ######## */
/* ===================== models.js ===================== */
/* ---------- detailed weapon models for the guns that used to be five blocks: KN-115, SMG, Battle Rifle, Machine Pistol, Sniper Rifle, Rocket Launcher and RayGun.
   Every model is built to be seen from any side (both flanks, top, underside, front and back): rounded barrels, trigger guards and triggers, ejection ports, rails,
   vents, stocks with pads, magazines with base plates, charging handles. Camo material rm replaces the body parts. Built along +z, muzzle at about z = length. ---------- */
function gunKit(g,rm){const cache={},M=c=>cache[c]||(cache[c]=new THREE.MeshLambertMaterial({color:c})),E=c=>cache['e'+c]||(cache['e'+c]=new THREE.MeshBasicMaterial({color:c})),
 add=(m,x,y,z,rx,ry,rz)=>{m.position.set(x,y,z);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m};
 return{M,E,body:rm,
  box:(w,h,d,x,y,z,mat,rx,ry,rz)=>{const m=new THREE.Mesh(bg,mat);m.scale.set(w,h,d);return add(m,x,y,z,rx,ry,rz)},
  cyl:(r,len,x,y,z,mat,rf,seg)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rf==null?r:rf,r,len,seg||14),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  cylY:(r,h,x,y,z,mat,rx,rz,rt)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt==null?r:rt,r,h,12),mat);return add(m,x,y,z,rx,0,rz)},
  cone:(r,len,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,len,10),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m},
  sph:(r,x,y,z,mat,sx,sy,sz)=>{const m=new THREE.Mesh(sg,mat);m.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));return add(m,x,y,z)},
  ring:(r,t,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,16),mat);return add(m,x,y,z)}}}
var MODELS={};
MODELS.SMG=function(g,rm,key='SMG'){const k=gunKit(g,rm),M=k.M,body=rm||M(0x5a4a40),dk=M(0x17181b),gm=M(0x2d2f34),steel=M(0x8a9098),mags=[];
 k.box(.07,.095,.34,0,0,.18,body);k.box(.066,.022,.3,0,.056,.18,gm);k.box(.004,.034,.09,.036,.01,.14,dk);k.box(.014,.014,.04,.038,.025,.07,steel);
 k.cyl(.04,.28,0,.005,.48,gm);for(let i=0;i<5;i++){k.box(.082,.012,.02,0,.005,.38+i*.045,dk);k.box(.012,.05,.02,.04,.005,.38+i*.045,dk);k.box(.012,.05,.02,-.04,.005,.38+i*.045,dk)}
 k.cyl(.014,.14,0,.005,.66,dk);k.cyl(.022,.08,0,.005,.7,dk);k.cyl(.026,.02,0,.005,.745,gm);
 k.box(.05,.012,.28,0,.068,.3,gm);k.box(.04,.12,.04,0,-.1,.08,dk,.3);k.box(.045,.02,.05,0,-.165,.04,gm,.3);k.box(.05,.008,.08,0,-.052,.2,gm);k.box(.004,.026,.07,0,-.066,.205,dk);k.box(.01,.026,.01,0,-.068,.225,steel);
 mags.push(k.box(.036,.2,.062,0,-.17,.24,dk,.04));mags.push(k.box(.04,.016,.066,0,-.274,.236,gm,.04));k.box(.03,.09,.036,0,-.082,.42,gm);k.cylY(.016,.07,0,-.12,.4,dk);
 k.box(.014,.014,.2,.025,.01,-.18,steel);k.box(.014,.014,.2,-.025,.01,-.18,steel);k.box(.06,.1,.02,0,-.01,-.29,gm);k.box(.07,.02,.04,0,.05,-.29,dk);k.box(.014,.12,.014,.03,-.03,-.22,steel,.3);k.box(.014,.12,.014,-.03,-.03,-.22,steel,.3);
 g.userData.a={r:[0,-.12,.06],l:[0,-.1,.42],m:[0,-.17,.24]};g.userData.mags=mags;mkSights(g,key,{yt:.118,yb:.0785,yf:.0785,zr:.1,zf:.54});return g};
/* ---- Battle Rifle: long rounded handguard, flash hider, thumbhole-style stock, straight 20 round magazine, rear leaf sight ---- */
MODELS.BR=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x2f4a3a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),wood=M(0x4a3a2a),mags=[];
 k.box(.078,.108,.46,0,0,.2,body);k.box(.072,.028,.42,0,.06,.2,gm);k.box(.004,.04,.1,.04,.012,.16,dk);k.box(.016,.014,.05,.042,.03,.07,steel);
 k.cyl(.04,.46,0,.002,.68,body);for(let i=0;i<6;i++){k.box(.012,.04,.024,.04,.01,.5+i*.07,dk);k.box(.012,.04,.024,-.04,.01,.5+i*.07,dk)}k.cyl(.043,.02,0,.002,.46,gm);k.cyl(.043,.02,0,.002,.9,gm);
 k.cyl(.015,.22,0,.004,1.0,dk);k.cyl(.024,.12,0,.004,1.08,gm);for(let i=0;i<3;i++)k.box(.054,.008,.018,0,.004,1.04+i*.03,dk);k.cyl(.02,.014,0,.004,1.15,dk);
 k.box(.04,.018,.4,0,.078,.52,gm);k.box(.036,.03,.034,0,.075,.18,gm);k.box(.04,.12,.05,0,-.1,.05,dk,.32);k.box(.05,.02,.06,0,-.165,0,gm,.32);k.box(.008,.03,.1,0,-.07,.14,steel);k.box(.01,.028,.012,0,-.07,.17,steel);
 mags.push(k.box(.04,.15,.1,0,-.13,.24,gm,.05));mags.push(k.box(.044,.016,.104,0,-.215,.236,dk,.05));
 k.box(.06,.12,.05,0,.01,-.02,gm);k.box(.05,.09,.36,0,.0,-.26,wood);k.box(.05,.06,.2,0,-.085,-.16,wood,.05);k.box(.054,.13,.04,0,-.02,-.46,dk);k.box(.044,.04,.15,0,.075,-.28,wood);
 k.box(.024,.05,.034,0,.063,.9,gm);k.box(.034,.012,.034,0,.04,.9,dk);
 g.userData.a={r:[0,-.12,.04],l:[0,-.07,.68],m:[0,-.13,.24]};g.userData.mags=mags;mkSights(g,'BR',{yt:.12,yb:.0885,yf:.0885,zr:.06,zf:.9});return g};
/* ---- Machine Pistol: boxy slide with serrations, short barrel, extended stick magazine, folding stabiliser, small front grip ---- */
MODELS.MP=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x3a3a4a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),mags=[];
 k.box(.052,.07,.34,0,.02,.14,body);k.box(.056,.014,.3,0,.062,.14,gm);for(let i=0;i<6;i++)k.box(.058,.05,.01,0,.025,.03+i*.016,dk);k.box(.004,.03,.08,.027,.03,.15,dk);
 k.box(.044,.04,.28,0,-.034,.17,gm);k.cyl(.012,.1,0,.03,.37,dk);k.cyl(.018,.05,0,.03,.4,gm);
 k.box(.04,.11,.052,0,-.09,.02,dk,.22);k.box(.044,.014,.06,0,-.15,-.01,gm,.22);k.box(.006,.022,.07,0,-.058,.12,dk);k.box(.01,.022,.01,0,-.058,.14,steel);k.box(.03,.014,.065,0,-.04,.075,gm);
 mags.push(k.box(.032,.19,.052,0,-.14,.17,dk,.02));mags.push(k.box(.036,.014,.056,0,-.24,.168,gm,.02));k.box(.024,.07,.03,0,-.07,.3,gm);k.cylY(.014,.05,0,-.1,.28,dk);
 k.box(.012,.012,.14,.02,.03,-.02,steel);k.box(.012,.012,.14,-.02,.03,-.02,steel);k.box(.05,.05,.014,0,.03,-.1,gm);
 g.userData.a={r:[0,-.1,.02],l:[0,-.08,.3],m:[0,-.14,.17]};g.userData.mags=mags;mkSights(g,'MP',{yt:.1,yb:.0765,yf:.0765,zr:.05,zf:.34});return g};
/* ---- Sniper Rifle: heavy barrel with muzzle brake, bolt with ball handle, full length stock with cheek rest, scope with lens caps, folded bipod ---- */
MODELS.SN=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x2a2f4a),dk=M(0x111316),gm=M(0x2b2e33),steel=M(0x8a9098),lens=k.E(0x6ab0ff),mags=[];
 k.box(.07,.1,.5,0,0,.22,body);k.box(.066,.024,.46,0,.06,.22,gm);k.box(.004,.034,.1,.036,.02,.2,dk);k.cyl(.007,.1,.07,.03,.12,steel);k.sph(.018,.07,.03,.06,steel);
 k.cyl(.024,.7,0,.012,.8,dk);k.cyl(.034,.4,0,.012,.52,body);k.cyl(.022,.1,0,.012,1.18,gm);for(let i=0;i<3;i++)k.box(.054,.006,.016,0,.012,1.14+i*.032,dk);k.cyl(.026,.012,0,.012,1.1,gm);
 /* scope on two rings: tube, bells, lens, turrets */
 k.cyl(.027,.34,0,.11,.36,gm);k.cyl(.036,.1,0,.11,.2,gm,.027);k.cyl(.04,.1,0,.11,.52,gm,.027);k.cyl(.033,.006,0,.11,.2,lens);k.cyl(.036,.006,0,.11,.57,lens);k.cylY(.01,.04,0,.14,.36,dk);k.cylY(.01,.04,.034,.11,.36,dk,0,Math.PI/2);
 for(const z of[.26,.46]){k.box(.01,.05,.024,.02,.075,z,gm);k.box(.01,.05,.024,-.02,.075,z,gm);k.box(.05,.012,.024,0,.052,z,dk)}
 k.box(.04,.12,.052,0,-.1,.04,dk,.3);k.box(.05,.018,.06,0,-.165,0,gm,.3);k.box(.008,.03,.1,0,-.066,.16,steel);
 mags.push(k.box(.04,.12,.07,0,-.1,.28,dk,.04));mags.push(k.box(.044,.014,.074,0,-.165,.278,gm,.04));
 k.box(.06,.12,.06,0,.0,-.04,gm);k.box(.05,.11,.4,0,.0,-.28,body);k.box(.04,.04,.24,0,.07,-.27,body);k.box(.06,.16,.04,0,-.02,-.5,dk);k.box(.044,.07,.18,0,-.075,-.2,body,.1);
 for(const s of[-1,1]){k.cylY(.006,.18,s*.04,-.05,.62,steel,.55,s*.18);k.box(.012,.02,.02,s*.036,-.025,.6,dk)}
 k.box(.064,.014,.044,.018,.066,.115,gm);k.box(.072,.014,.033,.027,.027,.89,gm);
 mkSights(g,'SN',{xt:.058,yt:.145,yb:.074,yf:.035,zr:.115,zf:.89});
 g.userData.a={r:[0,-.12,.04],l:[0,-.07,.72],m:[0,-.1,.28]};g.userData.mags=mags;return g};
/* ---- Rocket Launcher: shoulder tube with flared rear, loaded warhead, sights, two grips, vents, strap rings ---- */
MODELS.RL=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x7a3a2a),dk=M(0x15171a),gm=M(0x2b2e33),steel=M(0x8a9098),red=M(0xc0392b),oli=M(0x4a5030);
 k.cyl(.07,.98,0,0,.42,body);k.cyl(.078,.12,0,0,.0,gm,.1);k.cyl(.1,.06,0,0,-.08,gm,.078);k.cyl(.076,.06,0,0,.92,gm);k.cyl(.065,.02,0,0,.95,dk);
 k.cone(.05,.16,0,0,1.07,red);k.cyl(.05,.12,0,0,.96,oli,.05);for(const a of[0,1.571,3.142,4.712])k.box(.006,.012,.06,Math.cos(a)*.05,Math.sin(a)*.05,.93,gm);
 for(let i=0;i<4;i++)k.ring(.072,.006,0,0,.2+i*.2,steel).rotation.y=0;
 k.box(.1,.04,.18,0,.085,.25,dk);k.box(.06,.012,.1,0,.09,.5,gm);
 k.box(.044,.14,.06,0,-.12,.2,dk,.3);k.box(.05,.02,.07,0,-.195,.17,gm,.3);k.box(.006,.03,.1,0,-.085,.27,steel);k.box(.01,.03,.012,0,-.085,.31,steel);
 k.box(.04,.1,.04,0,-.12,.62,dk);k.box(.05,.02,.07,0,-.18,.62,gm);for(let i=0;i<5;i++)k.box(.012,.016,.04,.07,.02,.12+i*.07,dk);
 k.box(.12,.14,.04,0,0,-.12,gm);k.box(.13,.16,.02,0,0,-.16,dk);k.cylY(.016,.03,.07,.05,.4,steel,0,Math.PI/2);k.cylY(.016,.03,-.07,.05,.4,steel,0,Math.PI/2);
 g.userData.a={r:[0,-.12,.2],l:[0,-.11,.62],m:[0,0,-.04]};g.userData.mags=[];mkSights(g,'RL',{yt:.154,yb:.102,yf:.059,zr:.177,zf:.91});return g};
/* ---- RayGun: rounded alien pistol, fins, glowing emitter and cell, brass fittings ---- */
/* These three authoring rigs retain the exact surfaces used in the original view model. */
for(const [key,source,size,receiver,anchor,muzzle] of [
 ['AR',knG,[.075,.1,.36],[0,0,-.2],{r:[0,-.115,-.14],l:[0,-.075,-.62],m:[0,-.2,-.32]},[0,0,-1.12]],
 ['VMP',vmpG,[.08,.1,.42],[0,0,-.25],{r:[0,-.1,-.08],l:[0,-.06,-.38],m:[0,-.2,-.15]},[0,0,-.58]],
 ['RG',rgG,[.06,.06,.22],[0,-.01,-.06],{r:[0,-.095,.08],l:[-.02,-.15,.09],m:[0,-.14,0],pd:[0,.24,0],ho:[0,0,0]},[0,0,-.56]]
]){
 const body=new THREE.MeshLambertMaterial({color:W[key].col});
 const flip=([x,y,z])=>[-x,y,-z],rotate=new THREE.Matrix4().makeRotationY(Math.PI);
 MODELS[key]=(g,finish)=>{
  source.updateMatrix();
  const staticPose=new THREE.Matrix4().multiplyMatrices(rotate,source.matrix),copies=new Map();
  for(const part of source.children){
   const m=part.material,keep=part.userData.sightPart||part.userData.glow;
   const mesh=new THREE.Mesh(part.geometry,keep?m:(finish||(m===rm?body:m)));
   part.updateMatrix();
   new THREE.Matrix4().multiplyMatrices(staticPose,part.matrix).decompose(mesh.position,mesh.quaternion,mesh.scale);
   mesh.userData={...part.userData};g.add(mesh);copies.set(part,mesh);
  }
  const base=new THREE.Mesh(bg,finish||body);
  base.position.set(...flip(receiver));base.scale.set(...size);g.add(base);
  const {xt,yt,zr}=source.userData.sight,[x,y,z]=flip(muzzle);
  g.userData.a=Object.fromEntries(Object.entries(anchor).map(([name,value])=>[name,flip(value)]));
  g.userData.mags=source.userData.mag.map(part=>copies.get(part));
  g.userData.sight={xt:-(xt+source.position.x),yt:yt+source.position.y,zr:-(zr+source.position.z)};
  g.userData.muzzle={x,y,z};g.userData.viewOffset=0;
  return g;
 };
}
var weldMat=new THREE.MeshLambertMaterial({color:0x24272c});
function weldModel(g,boxOf){
 if(!boxOf){
  g.updateWorldMatrix(true,true);const inverse=g.matrixWorld.clone().invert(),transform=new THREE.Matrix4(),bounds=new THREE.Box3();
  boxOf=m=>{if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();bounds.copy(m.geometry.boundingBox).applyMatrix4(transform.multiplyMatrices(inverse,m.matrixWorld));return{min:bounds.min.toArray(),max:bounds.max.toArray()}};
 }
 const skip=new Set([...(g.userData.mags||[]),...(g.userData.pump||[])]),ms=[];g.traverse(m=>{if(m.isMesh&&!m.userData.att&&!m.userData.weld&&!skip.has(m))ms.push(m)});const n=ms.length;if(n<2||n>160)return;
 const bs=ms.map(boxOf),par=[...Array(n).keys()],f=i=>par[i]==i?i:(par[i]=f(par[i])),eps=.004,gap=(a,b)=>{let d2=0;for(let k=0;k<3;k++){const d=Math.max(0,a.min[k]-b.max[k],b.min[k]-a.max[k]);d2+=d*d}return Math.sqrt(d2)};
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(gap(bs[i],bs[j])<=eps)par[f(i)]=f(j);
 for(let guard=0;guard<60;guard++){const cnt={};for(let i=0;i<n;i++)cnt[f(i)]=(cnt[f(i)]||0)+1;const roots=Object.keys(cnt);if(roots.length<2)break;const main=+roots.sort((a,b)=>cnt[b]-cnt[a])[0];
  let best=null;for(let i=0;i<n;i++){if(f(i)==main)continue;for(let j=0;j<n;j++){if(f(j)!=main)continue;const d=gap(bs[i],bs[j]);if(!best||d<best.d)best={d,i,j}}}if(!best)break;
  const a=bs[best.i],b=bs[best.j],p=[],q=[];for(let k=0;k<3;k++){const lo=Math.max(a.min[k],b.min[k]),hi=Math.min(a.max[k],b.max[k]);if(lo<=hi){p[k]=q[k]=(lo+hi)/2}else if(a.max[k]<b.min[k]){p[k]=a.max[k];q[k]=b.min[k]}else{p[k]=a.min[k];q[k]=b.max[k]}}
  const th=.018,s=new THREE.Mesh(bg,weldMat);s.userData.weld=1;s.scale.set(Math.abs(p[0]-q[0])+th,Math.abs(p[1]-q[1])+th,Math.abs(p[2]-q[2])+th);s.position.set((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2);g.add(s);par[f(best.i)]=f(best.j)}}
;

/* ===================== TUR-9 "Cyclone": full-auto assault rifle (uses the original turbine model) ===================== */
/* The original TRB-3 model, now the Cyclone: angular gunmetal body, long top rail with a flip-up ring sight and a swept fin at the front, vented handguard, a big round turbine housing with a brass core on both sides
   behind the receiver, a slab stock, an angled magazine on struts and a flash hider. Built along +z, muzzle at about z = .95. Fully automatic, fast and light. */
W.TUR={n:'TUR-9 Cyclone',d:22,r:.068,m:36,sp:.011,rc:.8,pel:1,au:1,rl:2.2,len:.75,col:0x6a6d6f};
PRI.splice(3,0,'TUR');WG.TUR=[.95,0x6a6d6f,1,0xffcc70];RLK.TUR='mag';BOTGUNS.push('TUR');
MODELS.TUR=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x6c6f70),dk=M(0x1d1f22),gr=M(0x3a3d41),steel=M(0x9aa0a6),brass=M(0xb08a3a),blk=M(0x111214),bolt=M(0xc9c4b0);
 /* receiver, handguard and top rail */
 k.box(.078,.1,.5,0,0,.1,body);k.box(.088,.082,.34,0,-.004,.52,body);k.box(.06,.02,.7,0,.06,.24,dk);for(let i=0;i<14;i++)k.box(.062,.007,.016,0,.073,-.08+i*.047,blk);
 /* slanted vents on both sides of the handguard */
 for(const sx of[-1,1])for(let i=0;i<3;i++)k.box(.006,.05,.018,sx*.045,.004,.42+i*.07,blk,0,0,.5);
 /* ejection port, charging slot, side plates */
 k.box(.006,.04,.12,.04,.02,.1,blk);k.box(.006,.03,.09,-.04,.02,.12,gr);k.box(.02,.02,.05,.0,.075,.02,gr);
 /* front fin: a swept blade standing on the rail at the muzzle end of the handguard */
 for(const sx of[-1,1])k.box(.008,.045,.15,sx*.05,.02,.6,body,-.35);k.box(.012,.02,.12,0,.065,.58,gr);
 /* barrel, sleeve and flash hider */
 k.cyl(.016,.24,0,.006,.84,steel);k.cyl(.024,.06,0,.006,.73,gr);k.cyl(.022,.075,0,.006,.955,dk);for(let i=0;i<3;i++)k.cyl(.0235,.006,0,.006,.925+i*.02,steel);
 /* flip-up ring sight at the back, post at the front */
 mkSights(g,'TUR',{yt:.112,yb:.074,yf:.061,zr:-.02,zf:.7});
 /* turbine housing: a big disc seen from either side, brass core, bolts */
 const disc=k.cylY(.07,.108,0,-.02,-.14,body,0,Math.PI/2),core=k.cylY(.04,.116,0,-.02,-.14,brass,0,Math.PI/2);
 for(const sx of[-1,1]){k.cylY(.05,.01,sx*.057,-.02,-.14,gr,0,Math.PI/2);k.cylY(.014,.012,sx*.062,-.02,-.14,steel,0,Math.PI/2);for(let i=0;i<6;i++){const a=i*Math.PI/3;k.cylY(.006,.008,sx*.06,-.02+Math.sin(a)*.059,-.14+Math.cos(a)*.059,bolt,0,Math.PI/2)}}
 /* slab stock with pad */
 k.box(.07,.13,.12,0,.0,-.29,dk);k.box(.076,.15,.03,0,-.005,-.365,blk);k.box(.05,.03,.1,0,.075,-.27,gr);
 /* pistol grip, trigger and guard */
 k.box(.046,.15,.062,0,-.13,.04,dk,.35);k.box(.05,.02,.07,0,-.205,.01,gr,.35);k.box(.01,.04,.012,0,-.07,.12,steel,.2);k.box(.012,.012,.1,0,-.095,.16,dk);k.box(.012,.04,.012,0,-.075,.21,dk);
 /* angled magazine on two struts */
 const mg=[k.box(.044,.21,.082,0,-.19,.3,gr,-.22),k.box(.05,.02,.09,0,-.295,.325,blk,-.22)];k.box(.012,.12,.014,.026,-.1,.22,steel,.5);k.box(.012,.12,.014,-.026,-.1,.22,steel,.5);
 g.userData.a={r:[0,-.13,.04],l:[0,-.05,.55],m:[0,-.19,.3]};g.userData.mags=mg;return g};

/* ===================== TRB-3 "Turbine": 3-round burst assault rifle ===================== */
/* Rebuilt from the reference image: a bullpup in brushed steel. Big rounded carry handle loop over the receiver with the aperture sight in its rear posts, a tall front post on the long barrel,
   a vented muzzle brake, a sawtooth-textured handguard panel on both sides, pistol grip with the magazine BEHIND it, and a slab butt pad. Built along +z, muzzle at about z = 1.0. 3 rounds per trigger pull. */
W.TRB={n:'TRB-3 Turbine',d:36,r:.055,m:36,sp:.004,rc:.95,pel:1,au:0,burst:3,bd:.14,rl:2.1,len:.75,col:0x9a9ea3};
PRI.splice(2,0,'TRB');WG.TRB=[1,0x9a9ea3,1,0xffcc70];RLK.TRB='mag';BOTGUNS.push('TRB');
MODELS.TRB=function(g,rm){const k=gunKit(g,rm),M=k.M,body=rm||M(0x959a9f),dk=M(0x2a2c2f),blk=M(0x121315),gr=M(0x55595e),steel=M(0xb4b9be),dark2=M(0x3b3e42);
 /* main body: long slab, lower rear block, tapered nose */
 k.box(.084,.1,.62,0,-.012,0,body);k.box(.078,.082,.22,0,-.016,.39,body);k.box(.07,.06,.1,0,-.03,.53,body,.1);k.box(.088,.12,.1,0,-.02,-.3,dk);
 /* ejection housing, rear dark block and charging slot */
 k.box(.09,.07,.14,0,-.05,-.22,dk);k.box(.006,.045,.1,.043,.0,-.1,blk);k.box(.006,.03,.08,-.043,.0,-.1,gr);
 /* carry handle: a rounded loop. Top bar, two sloped corners at each end, a rear post pair holding the aperture and a front post */
 k.box(.05,.028,.5,0,.168,.0,body);k.box(.054,.012,.5,0,.186,.0,gr);
 k.box(.05,.03,.07,0,.15,.27,body,.7);k.box(.05,.03,.07,0,.15,-.27,body,-.7);
 for(const sx of[-1,1]){k.box(.01,.14,.04,sx*.036,.1,.33,body);k.box(.01,.1,.045,sx*.036,.11,.3,body)}k.box(.05,.016,.04,0,.172,.33,body);
 for(const sx of[-1,1]){k.box(.01,.13,.05,sx*.036,.1,-.305,body);k.box(.01,.06,.05,sx*.036,.13,-.28,gr)}
 /* aperture rear sight between the rear posts and a tall front post on the barrel */
 mkSights(g,'TRB',{yt:.098,yb:.052,yf:.046,zr:-.29,zf:.9});
 /* the loop's inner rail and a thin top rail strip */
 k.box(.034,.008,.44,0,.148,.0,blk);
 /* sawtooth textured panel on the lower handguard, both sides */
 for(const sx of[-1,1]){k.box(.008,.04,.3,sx*.043,-.035,.36,gr);for(let i=0;i<7;i++)k.box(.01,.034,.022,sx*.046,-.026,.22+i*.04,blk,0,0,sx*.55)}
 /* rails on the handguard sides */
 k.box(.09,.012,.22,0,.036,.4,gr);for(let i=0;i<5;i++)k.box(.092,.006,.014,0,.045,.3+i*.045,blk);
 /* barrel, gas block, sleeve and a vented muzzle brake */
 k.cyl(.014,.45,0,.028,.78,steel);k.box(.03,.03,.05,0,.026,.55,dk);k.cyl(.022,.06,0,.028,.6,dk);
 k.cyl(.02,.1,0,.028,.955,dk);for(let i=0;i<4;i++)k.cyl(.0215,.006,0,.028,.92+i*.022,steel);for(let i=0;i<3;i++)k.box(.044,.006,.016,0,.028,.93+i*.025,blk);
 /* pistol grip with trigger and guard, magazine behind the grip (bullpup) */
 k.box(.048,.15,.064,0,-.135,.12,dk,.3);k.box(.052,.02,.07,0,-.21,.095,gr,.3);k.box(.01,.045,.012,0,-.075,.19,steel,.15);k.box(.012,.012,.1,0,-.1,.235,dk);k.box(.012,.045,.012,0,-.078,.285,dk);
 const mg=[k.box(.046,.2,.082,0,-.18,-.1,gr,.08),k.box(.052,.02,.09,0,-.285,-.108,blk,.08)];k.box(.05,.04,.1,0,-.08,-.1,dk);
 /* butt pad and cheek riser */
 k.box(.078,.14,.03,0,-.016,-.375,blk);k.box(.05,.03,.12,0,.065,-.26,dk);
 g.userData.a={r:[0,-.135,.12],l:[0,-.03,.42],m:[0,-.18,-.1]};g.userData.mags=mg;return g};
var BST={n:0};

/* Custom hard-surface parts. Station profiles follow the weapon's +Z axis. */
function weaponLoft(stations){
 const contours=stations.map(([z,width,bottom,top,cut=.008])=>{
  const x=width*.5,b=Math.min(cut,x*.8,(top-bottom)*.42);
  return [[-x+b,bottom,z],[x-b,bottom,z],[x,bottom+b,z],[x,top-b,z],
   [x-b,top,z],[-x+b,top,z],[-x,top-b,z],[-x,bottom+b,z]];
 });
 const pos=[],uv=[],idx=[];
 function face(points,coords){
  const start=pos.length/3;
  for(const point of points)pos.push(...point);
  for(const coordinate of coords)uv.push(...coordinate);
  for(let i=1;i<points.length-1;i++)idx.push(start,start+i,start+i+1);
 }
 for(let i=0;i<contours.length-1;i++){
  const a=contours[i],b=contours[i+1];
  for(let j=0;j<8;j++){
   const next=(j+1)%8,u=j/8,v=(j+1)/8;
   face([a[j],a[next],b[next],b[j]],[[a[j][2],u],[a[j][2],v],[b[j][2],v],[b[j][2],u]]);
  }
 }
 for(const contour of [contours[0].slice().reverse(),contours.at(-1)])face(contour,contour.map(([x,y])=>[x,y]));
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setIndex(idx);geometry.computeVertexNormals();
 return geometry;
}
const weaponDecals=new Map();
function weaponDecal(label){
 if(weaponDecals.has(label))return weaponDecals.get(label);
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=64;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#eee5d8';ctx.font='bold 29px monospace';ctx.fillText(label,4,31);
 ctx.fillStyle='#dbab72';
 ctx.fillRect(5,42,25,5);ctx.fillRect(33,42,6,5);
 ctx.fillStyle='#d5d2c7';ctx.font='13px monospace';ctx.fillText('SPARTAN  /  ARMORY',45,49);
 const map=new THREE.CanvasTexture(canvas);map.encoding=THREE.sRGBEncoding;map.anisotropy=2;
 const mat=new THREE.MeshBasicMaterial({map,alphaTest:.4,toneMapped:false});
 weaponDecals.set(label,mat);return mat;
}
const armorTextures=new Map();
function armoryTexture(surface){
 if(armorTextures.has(surface))return armorTextures.get(surface);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d'),image=ctx.createImageData(128,128);
 let seed=3128;
 const random=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
 for(let y=0;y<128;y++){
  const grain=random(),ridge=Math.sin(y*.61+Math.sin(y*.14)*2);
  for(let x=0;x<128;x++){
   const noise=random();
   const shade=surface==='wood'?176+28*ridge+22*grain+noise*23:
    surface==='steel'?185+31*grain+noise*32:203+noise*36+((x+y)%3?0:-13);
   image.data.set([shade,shade,shade,255],(y*128+x)*4);
  }
 }
 ctx.putImageData(image,0,0);
 if(surface==='steel')for(let i=0;i<26;i++){
  ctx.fillStyle=i%2?'#fff4':'#1112';ctx.fillRect(random()*128,random()*128,5+random()*32,1);
 }
 const tex=new THREE.CanvasTexture(canvas);
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(surface==='wood'?3:5,1);
 tex.anisotropy=2;
 armorTextures.set(surface,tex);return tex;
}
function weaponKit(g,finish,paint,alloy=0x69737a){
 const k=gunKit(g),M=(color,roughness,metalness,surface)=>{
  const mat=new THREE.MeshLambertMaterial({color,map:surface?armoryTexture(surface):null});
  if(mat.isMeshStandardMaterial){mat.roughness=roughness;mat.metalness=metalness;mat.envMapIntensity=.52}
  return mat;
 };
 const body=finish||M(paint,.55,.23,'coating'),frame=M(0x343a40,.5,.51,'steel'),steel=M(alloy,.39,.56,'steel');
 const rubber=M(0x202226,.88,.02,'coating'),recess=M(0x11161d,.86,.19),trim=M(0xb99864,.46,.55,'steel');
 const mount=(geometry,material,x=0,y=0,z=0)=>{
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);g.add(mesh);return mesh;
 };
 const solid=(material,...stations)=>mount(weaponLoft(stations),material);
 const tube=(material,x,y,sections,sides=16)=>{
  const geometry=new THREE.LatheGeometry(sections.map(([z,r])=>new THREE.Vector2(r,z)),sides);
  geometry.rotateX(Math.PI/2);
  return mount(geometry,material,x,y);
 };
 const bore=(y,tip,outer,inner,material=frame,length=.065,sides=16)=>{
  const rear=tip-length;
  const shell=tube(material,0,y,[[rear,outer*.79],[rear+.012,outer],[tip-.006,outer],[tip,outer*.85],[tip,inner],
   [tip-.008,inner*.9],[rear,inner*.87]],sides);
  tube(recess,0,y,[[rear+.001,inner*.94],[rear+.001,0]],sides);
  return shell;
 };
 const web=(material,x,width,outline,cutouts=[],bevel=.003)=>{
  const trace=(path,points)=>{
   path.moveTo(...points[0]);
   for(const point of points.slice(1))path.lineTo(...point);
   path.closePath();return path;
  };
  const shape=trace(new THREE.Shape(),outline);
  shape.holes=cutouts.map(points=>trace(new THREE.Path(),points));
  const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:3});
  geo.translate(0,0,-width/2);geo.rotateY(-Math.PI/2);
  return mount(geo,material,x);
 };
 const pin=(x,y,z,r=.005,material=steel)=>k.cylY(r,.004,x,y,z,material,0,Math.PI*.5,r*.89);
 const rod=(material,r,a,b)=>{
  const start=V(...a),end=V(...b),vector=end.clone().sub(start),mesh=mount(new THREE.CylinderGeometry(r,r,vector.length(),10),material);
  mesh.position.copy(start).lerp(end,.5);
  mesh.quaternion.setFromUnitVectors(V(0,1,0),vector.normalize());return mesh;
 };
 const rail=(z0,z1,y,width=.039)=>{
  solid(frame,[z0,width,y-.006,y+.008],[z0+.012,width,y-.009,y+.01],[z1-.012,width,y-.009,y+.01],[z1,width*.8,y-.006,y+.004]);
  for(let z=z0+.022;z<z1-.012;z+=.026)solid(steel,[z-.007,width*.96,y+.006,y+.011,.003],[z+.007,width*.96,y+.006,y+.011,.003]);
 };
 const grip=(z,material=rubber)=>{
  // Cross-sections through the grip, swept back at the heel.
  const geo=weaponLoft([[.033,.041,-.033,.029,.012],[.016,.039,-.033,.028,.012],[-.027,.038,-.026,.036,.012],[-.102,.038,-.011,.051,.013],[-.122,.039,-.006,.06,.013]].reverse());
  geo.rotateX(-Math.PI/2);geo.translate(0,-.058,z);
  const handle=mount(geo,material);
  for(let i=0;i<5;i++){
   const y=-.087-i*.015;
   k.box(.028,.003,.008,0,y,z+.041-i*.002,frame,-.22);
  }
  return handle;
 };
 const guard=(z,y=-.053,length=.124)=>{
  web(frame,0,.016,[[z-.021,y],[z+length,y],[z+length-.005,y-.06],[z+length-.025,y-.079],[z+.005,y-.079],[z-.021,y-.051]],
   [[[z+.006,y-.014],[z+length-.019,y-.014],[z+length-.023,y-.053],[z+length-.036,y-.064],[z+.016,y-.064],[z+.005,y-.045]]],.0025);
  web(steel,0,.009,[[z+.037,y+.003],[z+.052,y+.002],[z+.067,y-.03],[z+.059,y-.043],[z+.05,y-.037],[z+.053,y-.029]],[],.0015);
 };
 const mark=(label,side,y,z,width=.083,height=.026)=>{
  const mesh=mount(new THREE.PlaneGeometry(width,height),weaponDecal(label),side,y,z);
  mesh.rotation.y=Math.sign(side)*Math.PI*.5;
 };
 const moving=(parts,center,name)=>{
  const part=new THREE.Group();part.name=name;part.position.set(...center);g.add(part);
  for(const mesh of parts){mesh.position.sub(part.position);part.add(mesh)}
  return [part];
 };
 g.userData.authored=true;
 return {...k,body,frame,steel,rubber,recess,trim,M,solid,tube,bore,web,pin,rod,rail,grip,guard,mark,moving};
}

MODELS.VA=function(g,finish){
 const k=weaponKit(g,finish,0xa18d6d),{body,frame,steel,rubber,trim,solid,tube,web,pin,rod,rail,grip,guard,mark,moving}=k;
 // A slim action and a separate floating fore-end leave the fluted barrel visible.
 solid(frame,[-.152,.066,-.055,.048],[-.096,.077,-.067,.063],[.11,.083,-.055,.065],[.33,.079,-.073,.061],[.395,.065,-.066,.036]);
 solid(body,[-.129,.074,.012,.051],[-.077,.089,-.013,.071],[.067,.09,-.02,.071],[.101,.091,-.015,.067],[.102,.062,.018,.064],
  [.245,.062,.019,.065],[.246,.087,-.025,.071],[.347,.082,-.023,.063],[.393,.066,-.018,.034]);
 solid(steel,[.102,.079,.006,.039],[.122,.082,-.009,.046],[.218,.082,-.009,.046],[.238,.07,.006,.039]);
 solid(frame,[.316,.057,-.061,-.028],[.41,.067,-.065,-.031],[.65,.055,-.049,-.022],[.727,.044,-.034,-.01]);
 const slots=Array.from({length:4},(_,i)=>{
  const z=.417+i*.065;return [[z,-.024],[z+.043,-.013],[z+.047,.01],[z+.01,.002]];
 });
 for(const side of [-1,1]){
  const x=side*.035;
  web(body,x,.012,[[.324,.049],[.642,.049],[.735,.006],[.687,-.048],[.343,-.053]],slots);
  pin(side*.046,-.034,.376);pin(side*.045,-.031,.668);
 }
 rail(-.1,.644,.072);
 tube(steel,0,.026,[[.236,.025],[.383,.022],[.714,.014],[.887,.014]],18);
 k.bore(.026,.94,.024,.011,frame,.08,12);
 // Adjustable stock with a diagonal brace and a textured shoulder pad.
 solid(frame,[-.43,.055,-.031,.056],[-.4,.064,-.026,.068],[-.28,.061,.008,.074],[-.137,.058,-.018,.051]);
 web(body,0,.044,[[-.438,-.094],[-.428,.02],[-.174,.045],[-.126,-.006],[-.294,-.033],[-.393,-.101]],
  [[[-.398,-.066],[-.386,-.015],[-.222,.024],[-.211,.003],[-.335,-.026]]],.005);
 solid(rubber,[-.477,.053,-.097,.038],[-.467,.071,-.109,.053],[-.429,.068,-.098,.051],[-.416,.059,-.085,.039]);
 rod(trim,.008,[-.026,-.02,-.344],[-.026,.035,-.205]);
 grip(.007);guard(.007);
 const mag=solid(frame,[.145,.053,-.273,-.215],[.176,.056,-.284,-.133],[.217,.06,-.271,-.071],[.269,.058,-.189,-.043],[.296,.048,-.092,-.048]);
 const cap=solid(rubber,[.148,.057,-.28,-.257],[.175,.061,-.291,-.269],[.228,.061,-.282,-.259],[.233,.046,-.276,-.264]);
 const ribs=[];
 for(const side of [-1,1])for(const z of [.181,.203,.23,.25])ribs.push(web(steel,side*.029,.003,[[z,-.25],[z+.007,-.242],[z+.045,-.097],[z+.036,-.098]],[],.001));
 g.userData.mags=moving([mag,cap,...ribs],[0,-.173,.222],'Curved magazine');
 mark('VANGUARD',-.046,.028,-.008,.13,.031);
 mkSights(g,'VA',{yt:.137,yb:.082,yf:.081,zr:-.052,zf:.635});
 g.userData.a={r:[0,-.113,.001],l:[0,-.058,.539],m:[0,-.173,.222]};
 g.userData.muzzle={y:.026,z:.94};return g;
};

MODELS.BP=function(g,finish){
 const k=weaponKit(g,finish,0x516c7b,0x828884),{body,frame,steel,rubber,solid,tube,web,pin,rod,grip,guard,mark,moving}=k;
 const wood=k.M(0x986951,.66,.04,'wood'),edge=k.M(0x4e352e,.73,.07);
 solid(frame,[-.145,.05,-.046,.038],[-.107,.075,-.067,.055],[.042,.08,-.069,.071],[.23,.075,-.051,.063],[.262,.06,-.045,.039]);
 solid(body,[-.132,.074,-.034,.035],[-.085,.09,-.06,.066],[.007,.094,-.06,.076],[.008,.069,-.031,.071],
  [.148,.069,-.026,.068],[.15,.088,-.053,.064],[.22,.075,-.047,.055],[.247,.064,-.033,.034]);
 solid(steel,[.016,.069,.012,.041],[.026,.077,.005,.05],[.154,.078,.005,.05],[.189,.067,.014,.043]);
 web(frame,0,.06,[[-.455,-.129],[-.438,-.025],[-.161,.03],[-.11,.002],[-.134,-.049],[-.332,-.104]],
  [[[-.4,-.092],[-.385,-.052],[-.184,-.004],[-.167,-.017],[-.334,-.073]]]);
 solid(body,[-.419,.051,-.047,.004],[-.39,.059,-.049,.018],[-.272,.053,-.02,.038],[-.234,.038,-.021,.029]);
 solid(rubber,[-.477,.055,-.125,-.026],[-.465,.071,-.138,-.018],[-.44,.07,-.127,-.018],[-.427,.059,-.112,-.031]);
 grip(-.067);guard(-.067,-.056,.125);
 tube(frame,0,.038,[[.133,.026],[.258,.025],[.302,.023],[.746,.02],[.808,.022]],20);
 tube(steel,0,-.023,[[.16,.019],[.691,.018],[.707,.024],[.738,.024],[.748,.02],[.75,0]],16);
 web(frame,0,.017,[[.224,.053],[.77,.049],[.802,.058],[.799,.07],[.235,.076]],
  Array.from({length:7},(_,i)=>{
   const z=.264+i*.075;return [[z,.055],[z+.048,.053],[z+.052,.065],[z+.006,.067]];
  }),.0017);
 k.bore(.038,.824,.025,.016,frame,.075,18);
 const slide=solid(wood,[.258,.062,-.056,-.004,.014],[.285,.084,-.074,.006,.018],[.48,.086,-.074,.006,.02],[.537,.078,-.064,.001,.016],[.56,.062,-.053,-.009,.013]);
 const strips=[];
 for(let i=0;i<7;i++){
  const z=.297+i*.032;
  strips.push(solid(edge,[z,.085,-.075,-.037,.015],[z+.006,.085,-.075,-.038,.015]));
 }
 for(const side of [-1,1])strips.push(rod(frame,.0045,[side*.031,-.018,.178],[side*.034,-.019,.462]));
 g.userData.pump=moving([slide,...strips],[0,-.034,.415],'Pump and action bars');
 for(const side of [-1,1])for(const z of [-.089,.202])pin(side*.045,-.025,z);
 mark('BREAKWATER',-.046,-.008,.046,.104,.027);
 mkSights(g,'BP',{yt:.101,yb:.074,yf:.07,zr:.082,zf:.775});
 g.userData.a={r:[0,-.112,-.067],l:[0,-.074,.407],m:[0,-.051,.151]};
 g.userData.muzzle={y:.038,z:.824};return g;
};

MODELS.KTS=function(g,finish){
 const k=weaponKit(g,finish,0x69715e,0x858a77),{body,frame,steel,rubber,trim,solid,tube,web,pin,rail,grip,guard,mark}=k;
 solid(frame,[-.155,.047,-.058,.034],[-.106,.071,-.075,.062],[.1,.074,-.072,.072],[.258,.067,-.055,.063],[.318,.064,-.038,.041]);
 const port=[[[.042,.003],[.153,.004],[.194,.021],[.169,.042],[.067,.044]]];
 web(body,.036,.013,[[-.134,.029],[-.067,.067],[.19,.073],[.284,.034],[.261,-.064],[-.083,-.069]],port);
 web(body,-.036,.011,[[-.134,.035],[-.095,.041],[.182,.059],[.285,.032],[.261,-.054],[-.082,-.066]]);
 tube(steel,0,.033,[[.015,.023],[.285,.022],[.332,.021],[.706,.021],[.746,.024]],16);
 k.bore(.038,.766,.031,.018,frame,.07,10);
 tube(frame,0,-.033,[[.203,.019],[.596,.019],[.627,.022],[.69,.025],[.707,.022],[.708,0]],14);
 const drilling=Array.from({length:5},(_,i)=>{
  const z=.324+i*.053;return [[z,-.037],[z+.036,-.034],[z+.047,-.016],[z+.01,-.018]];
 });
 for(const side of [-1,1]){
  web(body,side*.032,.013,[[.231,-.012],[.527,.008],[.657,-.02],[.597,-.071],[.265,-.085]],drilling);
  pin(side*.045,-.053,.278);pin(side*.045,-.041,.567);
 }
 solid(rubber,[.26,.059,-.082,-.053],[.334,.074,-.09,-.054],[.547,.062,-.078,-.042],[.61,.042,-.064,-.04]);
 rail(-.085,.286,.071);
 web(frame,0,.041,[[-.435,-.116],[-.405,.017],[-.127,.041],[-.09,.006],[-.165,-.025],[-.369,-.117]],
  [[[-.39,-.08],[-.373,-.021],[-.162,.018],[-.193,-.004]]]);
 solid(body,[-.395,.056,-.021,.037],[-.374,.062,-.02,.046],[-.241,.058,-.012,.053],[-.216,.047,-.01,.047]);
 solid(rubber,[-.454,.047,-.111,.012],[-.447,.068,-.124,.027],[-.421,.071,-.122,.022],[-.408,.053,-.108,.006]);
 grip(-.047);guard(-.047,-.055,.132);pin(.045,-.029,-.085,.009,trim);
 mark('KESTREL',-.044,-.006,.115,.125,.031);
 mkSights(g,'KTS',{yt:.114,yb:.082,yf:.055,zr:-.054,zf:.699});
 g.userData.a={r:[0,-.113,-.047],l:[0,-.087,.43],m:[0,-.066,.131]};
 g.userData.muzzle={y:.038,z:.766};return g;
};

MODELS.RD=function(g,finish){
 const k=weaponKit(g,finish,0x76524a,0x7b7870),{body,frame,steel,recess,trim,solid,tube,web,pin,rail,grip,guard,mark,moving}=k;
 solid(frame,[-.168,.05,-.055,.038],[-.12,.072,-.066,.064],[.02,.082,-.07,.064],[.214,.077,-.066,.058],[.314,.062,-.035,.047],[.36,.053,-.029,.021]);
 solid(body,[-.167,.062,-.044,.036],[-.132,.08,-.051,.066],[.042,.085,-.054,.072],[.043,.061,-.022,.065],
  [.181,.061,-.019,.062],[.183,.08,-.05,.063],[.291,.075,-.034,.061],[.341,.063,-.029,.036]);
 solid(steel,[.048,.077,-.003,.037],[.073,.082,-.012,.046],[.175,.081,-.011,.045],[.195,.067,.007,.034]);
 web(frame,0,.051,[[-.389,-.107],[-.368,.013],[-.158,.034],[-.125,-.01],[-.218,-.039],[-.334,-.106]],
  [[[-.344,-.072],[-.33,-.027],[-.19,.009],[-.181,-.005],[-.269,-.032]]]);
 solid(body,[-.396,.064,-.109,-.012],[-.383,.073,-.117,.016],[-.36,.071,-.113,.022],[-.346,.061,-.098,.007]);
 grip(-.055,body);guard(-.055,-.053,.127);rail(-.112,.31,.072,.033);
 tube(steel,0,.027,[[.233,.026],[.341,.025],[.372,.018],[.51,.015],[.566,.018]],18);
 k.bore(.027,.628,.027,.014,frame,.095,12);
 solid(body,[.272,.052,-.09,-.034],[.32,.068,-.113,-.043],[.37,.074,-.118,-.045],[.478,.063,-.087,-.025],[.508,.048,-.067,-.016]);
 for(const side of [-1,1])for(const z of [.337,.395,.452])pin(side*.035,-.065,z,.005,trim);
 const drum=tube(frame,0,-.156,[[.16,0],[.16,.074],[.17,.091],[.192,.1],[.252,.1],[.267,.091],[.272,.076],[.272,0]],24);
 const cap=tube(trim,0,-.156,[[.25,.095],[.261,.097],[.27,.085],[.276,.081],[.276,.067],[.272,.066]],24);
 const inner=tube(steel,0,-.156,[[.271,0],[.271,.062],[.279,.055],[.282,.027],[.29,.022],[.29,0]],16);
 const collar=solid(recess,[.156,.056,-.106,-.083],[.166,.069,-.105,-.044],[.26,.07,-.107,-.044],[.283,.059,-.095,-.046]);
 const fasteners=[];
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,x=Math.sin(a)*.071,y=-.156+Math.cos(a)*.071;
  fasteners.push(k.box(.006,.019,.006,x,y,.277,frame,0,0,-a));
 }
 g.userData.mags=moving([drum,cap,inner,collar,...fasteners],[0,-.156,.219],'Ringed drum');
 mark('RIPTIDE',-.043,.016,-.027,.10,.027);pin(.046,-.027,.009,.007,trim);
 mkSights(g,'RD',{yt:.112,yb:.082,yf:.052,zr:-.07,zf:.442});
 g.userData.a={r:[0,-.11,-.055],l:[0,-.101,.429],m:[0,-.156,.219]};
 g.userData.muzzle={y:.027,z:.628};return g;
};

MODELS.HC=function(g,finish){
 const k=weaponKit(g,finish,0x89949c,0x9ba3a5),{body,frame,steel,rubber,recess,trim,solid,tube,web,pin,guard,mark,moving}=k;
 // The scalloped slide surrounds a real shoulder at the front of the barrel.
 solid(steel,[-.091,.044,.004,.064],[-.071,.054,.001,.079],[.203,.053,.008,.077],[.335,.047,.006,.066],[.396,.039,.016,.055]);
 solid(body,[-.082,.044,.026,.067],[-.06,.063,.015,.084],[.043,.068,.012,.086],[.05,.058,.018,.081],[.169,.058,.018,.081],
  [.173,.064,.013,.086],[.275,.063,.017,.082],[.34,.06,.023,.072],[.395,.046,.024,.059],[.406,.037,.029,.052]);
 solid(frame,[-.127,.026,-.019,.015,.008],[-.099,.043,-.038,.019],[-.035,.056,-.068,.02],
  [.105,.053,-.051,.013],[.293,.051,-.032,.015],[.355,.038,-.021,.01],[.368,.033,-.01,.01]);
 tube(steel,0,.044,[[.06,.018],[.376,.018],[.4,.023],[.414,.021]],16);
 k.bore(.044,.421,.026,.014,steel,.042,14);
 for(const side of [-1,1]){
  const x=side*.033;
  for(let i=0;i<6;i++){
   const z=-.056+i*.016;
   web(recess,x,.0015,[[z,.03],[z+.006,.03],[z+.017,.073],[z+.011,.075]],[],.0008);
  }
  web(frame,side*.028,.003,[[.235,.037],[.342,.036],[.374,.055],[.259,.06]],
   [[[.255,.04],[.276,.04],[.292,.052],[.27,.053]],[[.299,.04],[.322,.04],[.339,.051],[.315,.053]]],.001);
  web(rubber,side*.024,.007,[[-.112,-.041],[-.029,-.046],[.003,-.072],[-.032,-.161],[-.108,-.183],[-.135,-.152]],[],.004);
  pin(side*.034,-.072,-.067,.007,trim);pin(side*.034,-.143,-.095,.006,trim);
  for(let i=0;i<4;i++)web(steel,side*.032,.001,[[-.113,-.123+i*.016],[-.053,-.113+i*.016],[-.056,-.116+i*.016],[-.113,-.127+i*.016]],[],.001);
 }
 web(frame,0,.017,[[-.142,-.146],[-.113,-.038],[-.02,-.042],[.014,-.064],[-.031,-.167],[-.115,-.184]],[],.007);
 guard(-.023,-.038,.132);
 const mag=solid(steel,[-.128,.033,-.179,-.147],[-.11,.043,-.184,-.092],[-.052,.043,-.175,-.057],[-.027,.04,-.106,-.044]);
 const foot=solid(rubber,[-.133,.04,-.186,-.169],[-.123,.052,-.193,-.17],[-.039,.049,-.176,-.161],[-.027,.033,-.167,-.153]);
 g.userData.mags=moving([mag,foot],[0,-.144,-.065],'Heel release magazine');
 mark('MONARCH',-.034,.049,.226,.102,.026);
 mkSights(g,'HC',{yt:.107,yb:.086,yf:.079,zr:-.034,zf:.278});
 g.userData.a={r:[0,-.096,-.067],l:[0,-.138,-.028],m:[0,-.144,-.065]};
 g.userData.muzzle={y:.044,z:.421};return g;
};

MODELS.OH=function(g,finish){
 const k=weaponKit(g,finish,0x94674b,0x81908d),{frame,steel,rubber,trim,solid,tube,web,pin,rod,mark,moving}=k;
 const body=finish||k.M(0x986949,.68,.05,'wood');
 // Raised cheek comb and sculpted wrist form one continuous stock.
 solid(body,[-.48,.055,-.129,.004,.013],[-.43,.067,-.132,.016,.017],[-.326,.066,-.103,.037,.017],[-.278,.068,-.082,.041,.021],
  [-.181,.061,-.062,.032,.018],[-.086,.045,-.086,.022,.017],[-.024,.049,-.102,.016,.018],
  [.08,.061,-.084,.014,.022],[.168,.068,-.063,.011,.024],[.385,.063,-.068,.012,.022],[.533,.057,-.06,.015,.02],
  [.62,.044,-.048,.008,.016],[.657,.033,-.035,.002,.013]);
 solid(rubber,[-.488,.059,-.129,.004],[-.479,.068,-.137,.009],[-.451,.063,-.127,.011]);
 solid(frame,[-.35,.065,.015,.037,.011],[-.318,.071,.003,.052,.014],[-.225,.069,-.001,.055,.013],[-.189,.046,.008,.039,.012]);
 tube(steel,0,.035,[[-.078,.023],[.036,.033],[.243,.034],[.325,.027],[.43,.019],[.65,.016],[1.031,.013]],18);
 solid(frame,[.043,.06,-.013,.054],[.095,.063,-.017,.064],[.26,.063,-.017,.063],[.303,.052,-.001,.047]);
 web(body,.027,.003,[[-.127,-.008],[-.029,-.022],[.006,-.061],[-.039,-.081],[-.109,-.046]],[],.002);
 k.bore(.035,1.072,.019,.009,frame,.074,14);
 for(const side of [-1,1]){
  web(frame,side*.029,.004,[[.259,.004],[.51,.006],[.575,-.011],[.54,-.041],[.288,-.048]],
   [[ [.328,-.019],[.495,-.012],[.507,-.022],[.346,-.035] ]],.002);
  for(const z of [.277,.538])pin(side*.035,-.025,z,.005,trim);
 }
 k.guard(-.023,-.045,.129);
 // The bolt handle and polished carrier travel together on each reload.
 const cylinder=tube(steel,0,.038,[[.052,.017],[.052,.025],[.091,.025],[.103,.03],[.157,.03],[.163,.022],[.235,.021],[.237,0]],16);
 const handle=rod(steel,.007,[.018,.036,.109],[.056,.015,.106]);
 const stem=rod(steel,.007,[.056,.015,.106],[.076,-.014,.09]);
 const knob=k.sph(.014,.076,-.014,.09,frame,.97,1,1.15);
 g.userData.pump=moving([cylinder,handle,stem,knob],[0,.038,.14],'Bolt carrier and handle');
 mark('OUTRIDER',-.035,-.012,.199,.119,.027);
 mkSights(g,'OH',{yt:.103,yb:.064,yf:.051,zr:.295,zf:.976});
 g.userData.a={r:[0,-.076,-.032],l:[0,-.066,.486],m:[.023,.066,.181]};
 g.userData.muzzle={y:.035,z:1.072};return g;
};

/* Distinct operator meshes share the animation rig, hitboxes and materials within each kit. */
const OPERATORS={
 recruit:{name:'Field Scout',tone:0x424a40,plate:0x686d58,trim:0xbc9e71,optic:0x526a63},
 breaker:{name:'Bulwark',tone:0x24252a,plate:0x424953,trim:0xf3a344,optic:0x973c30},
 peregrine:{name:'Peregrine',tone:0x535043,plate:0x77745e,trim:0xb1a47b,optic:0x556354},
 lantern:{name:'Lantern',tone:0x69483c,plate:0xc87a3e,trim:0xf6be69,optic:0x686666},
 surveyor:{name:'Surveyor',tone:0x365151,plate:0x645948,trim:0xa6cd9d,optic:0x958343},
 crosswind:{name:'Crosswind',tone:0x514b5d,plate:0x756a70,trim:0xc9a5de,optic:0x479692},
 machinist:{name:'Machinist',tone:0x43403d,plate:0x696e75,trim:0xf0cf74,optic:0x915629},
 meridian:{name:'Meridian Apex',tone:0x2b313d,plate:0xa7a7a2,trim:0xba9160,optic:0x4bbab7},
 bellwatch:{name:'Belfry Sentinel',tone:0x253346,plate:0x444d56,trim:0xcf9552,optic:0x83c6c8},
 estatewarden:{name:'Estate Warden',tone:0x4a273b,plate:0x356466,trim:0xbaaba2,optic:0xc9a4ff}
};
const ZQUEST_OPERATORS={bellwatch:'London',estatewarden:'Hollow Estate'};
function operatorId(value){return typeof value==='string'&&hasOwn(OPERATORS,value)?value:'recruit'}
const botOperators=Object.keys(OPERATORS);
function botOperator(index){return botOperators[index%botOperators.length]}

let uniformWeave=null;
function operatorWeave(){
 if(uniformWeave)return uniformWeave;
 const side=16,pixels=new Uint8Array(side*side*4);
 for(let y=0;y<side;y++)for(let x=0;x<side;x++){
  const n=(x+y*side)*4,thread=212+((x+y)%2)*17+((x*9+y*11)%12);
  pixels.set([thread,thread,thread,255],n);
 }
 uniformWeave=new THREE.DataTexture(pixels,side,side,THREE.RGBAFormat);
 uniformWeave.wrapS=uniformWeave.wrapT=THREE.RepeatWrapping;
 uniformWeave.repeat.set(3,3);uniformWeave.minFilter=uniformWeave.magFilter=THREE.LinearFilter;
 uniformWeave.needsUpdate=true;
 return uniformWeave;
}
/* Operator builders are loaded after the shared rig. */

/* Original modular weapons. The attachment mounts, reload parts and grip points use this geometry in every view. */
Object.assign(IRON_SIGHTS,{
 SW:{rear:[[-20,10],[-15,-14],[15,-14],[20,10]],front:[[-17,4],[-9,-9],[9,-9],[17,4]],tip:'fork',color:0xffc986,hip:[[-13,-7,-8,-2,-8,2,-13,7],[13,-7,8,-2,8,2,13,7]]},
 LT:{rear:[[-20,8],[-13,16],[13,16],[20,8],[13,-13],[-13,-13],[-20,8]],front:[[-16,7],[-9,-11],[9,-11],[16,7]],tip:'fiber',color:0xa2f5cd,hip:[[-11,-8,-7,-8,-7,-5],[11,-8,7,-8,7,-5],[-11,8,-7,8,-7,5],[11,8,7,8,7,5]]},
 PD:{rear:[[-25,11],[-17,-10],[0,-16],[17,-10],[25,11]],front:[[-15,6],[-10,-8],[0,-12],[10,-8],[15,6]],tip:'brass',color:0xeda966,hip:[[-15,0,-9,0],[15,0,9,0],[0,-13,-5,-9,0,-5,5,-9,0,-13],[0,8,0,13]]}
});
Object.assign(WG,{SW:[.85,W.SW.col,1],LT:[.61,W.LT.col,1],PD:[.98,W.PD.col,1]});
BOTGUNS.push('SW','LT','PD');

MODELS.SW=function(g,finish){
 const k=weaponKit(g,finish,0x927a5f,0x747d80),{body,frame,steel,rubber,recess,solid,tube,web,pin,rail,grip,guard,mark,moving}=k;
 const seal=k.M(0x51524f,.67,.1),witness=k.M(0xc88b55,.45,.42);
 // A stepped ceramic shell wraps a steel receiver. The step in the shell is the ejection recess.
 solid(frame,[-.361,.068,-.064,.052],[-.324,.078,-.091,.078],[-.169,.087,-.078,.081],[-.013,.08,-.059,.068],
  [.109,.083,-.054,.069],[.204,.077,-.062,.061],[.29,.063,-.048,.047]);
 solid(body,[-.342,.076,-.071,.051],[-.29,.105,-.092,.088],[-.18,.105,-.079,.092],[-.133,.099,-.074,.092],
  [-.124,.081,-.062,.074],[.014,.081,-.056,.075],[.023,.098,-.063,.085],[.154,.096,-.057,.078],[.222,.076,-.047,.061]);
 solid(steel,[-.151,.09,.016,.048],[-.119,.096,.008,.058],[-.017,.095,.008,.055],[.012,.08,.016,.044]);
 web(recess,.045,.003,[[-.119,.025],[-.022,.024],[-.014,.037],[-.099,.045]],[],.0018);
 solid(rubber,[-.386,.062,-.064,.032],[-.38,.081,-.085,.049],[-.35,.093,-.105,.072],[-.33,.096,-.103,.075],[-.318,.09,-.084,.059]);
 solid(seal,[-.318,.094,.045,.077],[-.286,.107,.059,.096],[-.161,.106,.059,.093],[-.123,.091,.06,.082]);
 const cooling=Array.from({length:4},(_,i)=>{
  const z=.245+i*.076;return [[z,-.009],[z+.037,-.008],[z+.052,.024],[z+.016,.028]];
 });
 for(const side of [-1,1]){
  web(body,side*.034,.012,[[.162,.049],[.271,.058],[.518,.063],[.61,.034],[.617,-.018],[.559,-.046],[.189,-.06]],cooling,.003);
  web(seal,side*.038,.006,[[.196,-.028],[.218,-.046],[.543,-.036],[.574,-.027],[.552,-.014],[.225,-.018]],[],.003);
  pin(side*.049,-.014,.181,.006,steel);pin(side*.045,-.026,.549,.005,witness);
  web(seal,side*.052,.002,[[-.31,-.042],[-.29,-.063],[-.192,-.052],[-.166,-.038],[-.181,-.031],[-.282,-.044]],[],.0015);
  web(witness,side*.053,.001,[[-.287,-.014],[-.246,-.013],[-.239,-.009],[-.284,-.01]],[],.001);
  for(const z of [-.302,-.215])pin(side*.053,-.028,z,.004);
 }
 solid(rubber,[.179,.06,-.058,-.028],[.276,.064,-.065,-.027],[.402,.075,-.067,-.024],[.548,.062,-.051,-.021],[.595,.053,-.041,-.018]);
 tube(steel,0,.025,[[.137,.027],[.205,.026],[.262,.018],[.584,.015],[.652,.019]],18);
 k.bore(.025,.722,.032,.013,frame,.093,12);
 tube(steel,0,.025,[[.66,.032],[.664,.033],[.673,.033],[.678,.032]],12);
 rail(-.16,.573,.086,.043);
 grip(.075);guard(.075,-.055,.129);
 const mag=solid(frame,[-.225,.051,-.164,-.07],[-.202,.057,-.205,-.075],[-.164,.06,-.21,-.066],[-.122,.056,-.19,-.057],[-.103,.047,-.075,-.056]);
 const cap=solid(seal,[-.208,.051,-.205,-.186],[-.197,.064,-.217,-.191],[-.142,.064,-.213,-.185],[-.12,.053,-.199,-.181]);
 const wells=[];
 for(const side of [-1,1]){
  wells.push(web(recess,side*.029,.002,[[-.185,-.188],[-.16,-.189],[-.145,-.1],[-.176,-.105]],[],.002));
  for(let i=0;i<3;i++)wells.push(k.box(.003,.013,.024,side*.032,-.16+i*.018,-.168+i*.002,witness,-.15));
 }
 g.userData.mags=moving([mag,cap,...wells],[0,-.147,-.163],'Rear-feed magazine');
 mark('SWITCHBACK',-.053,.013,-.223,.118,.031);
 mkSights(g,'SW',{yt:.14,yb:.098,yf:.088,zr:-.116,zf:.559});
 g.userData.a={r:[0,-.114,.072],l:[0,-.064,.365],m:[0,-.147,-.163]};
 g.userData.muzzle={x:0,y:.025,z:.722};return g;
};

MODELS.LT=function(g,finish){
 const k=weaponKit(g,finish,0x406e63,0x8e9f9a),{body,frame,steel,rubber,recess,trim,solid,tube,web,pin,rod,rail,grip,guard,mark,moving}=k;
 const polymer=k.M(0x355052,.64,.2),amber=k.M(0xcca776,.53,.44);
 // Two compact channels carry the barrel and the detachable cassette above it.
 solid(frame,[-.192,.061,-.04,.035],[-.13,.074,-.06,.063],[.02,.078,-.073,.065],[.173,.068,-.058,.058],
  [.274,.061,-.043,.053],[.313,.053,-.036,.045],[.357,.054,-.031,.037]);
 for(const side of [-1,1]){
  web(body,side*.029,.011,[[.132,.034],[.344,.052],[.393,.021],[.369,-.031],[.253,-.067],[.156,-.06]],
   [[[.176,.014],[.237,.028],[.274,.026],[.231,-.024],[.192,-.03]],
    [[.268,-.021],[.311,.027],[.346,.031],[.353,.013],[.306,-.023],[.276,-.041]]],.003);
  pin(side*.04,-.05,.168,.006,steel);pin(side*.04,-.018,.37,.005,trim);
  rod(steel,.006,[side*.027,.028,-.11],[side*.03,.028,-.282]);
  rod(frame,.011,[side*.028,-.049,-.121],[side*.032,-.036,-.271]);
 }
 solid(body,[-.142,.075,-.045,.04],[-.117,.087,-.055,.062],[-.02,.086,-.068,.066],[.143,.075,-.058,.057],[.17,.07,-.047,.048]);
 solid(rubber,[-.32,.051,-.063,.048],[-.309,.071,-.073,.063],[-.28,.075,-.06,.058],[-.258,.055,-.049,.049]);
 solid(polymer,[.161,.054,-.064,-.025],[.211,.065,-.07,-.027],[.293,.065,-.068,-.028],[.35,.041,-.048,-.021]);
 for(const side of [-1,1]){
  web(polymer,side*.042,.004,[[-.107,.018],[-.069,.053],[.122,.047],[.134,.028],[.103,.004],[-.097,-.005]],[],.002);
  for(let i=0;i<4;i++){
   const z=.025+i*.022;web(recess,side*.045,.001,[[z,.021],[z+.005,.019],[z+.016,.032],[z+.011,.034]],[],.001);
  }
 }
 grip(.032);guard(.032,-.059,.1);
 tube(steel,0,.022,[[.138,.028],[.229,.023],[.332,.017],[.438,.015]],16);
 k.bore(.022,.49,.027,.012,frame,.081,10);
 tube(amber,0,.022,[[.421,.025],[.423,.03],[.432,.03],[.433,.028]],10);
 const shell=solid(polymer,[-.069,.04,.071,.104],[-.051,.058,.063,.119],[-.007,.059,.067,.121],[.199,.059,.064,.117],[.241,.05,.068,.107],[.261,.045,.077,.098]);
 const end=solid(steel,[-.064,.055,.064,.104],[-.052,.063,.06,.115],[-.024,.066,.063,.119],[-.012,.058,.067,.116]);
 const cassette=[shell,end];
 for(const side of [-1,1]){
  cassette.push(web(recess,side*.03,.003,[[.043,.082],[.217,.082],[.231,.101],[.055,.106]],[],.0015));
  for(let i=0;i<7;i++){
   const z=.059+i*.021;
   cassette.push(k.box(.003,.013,.013,side*.033,.094,z,i===0?steel:amber,.4));
  }
 }
 g.userData.mags=moving(cassette,[0,.09,.112],'Top-mounted cassette');
 rail(-.192,-.08,.085,.034);
 solid(frame,[.269,.04,.042,.067],[.29,.049,.052,.078],[.355,.043,.042,.074]);
 mark('LATTICE',-.046,.022,-.04,.091,.025);
 mkSights(g,'LT',{yt:.155,yb:.096,yf:.073,zr:-.142,zf:.345});
 g.userData.a={r:[0,-.116,.027],l:[0,-.068,.263],m:[0,.09,.112],pd:[0,.18,.02],ho:[0,.037,0]};
 g.userData.muzzle={x:0,y:.022,z:.49};return g;
};

MODELS.PD=function(g,finish){
 const k=weaponKit(g,finish,0x546981,0x788a96),{body,frame,steel,rubber,recess,trim,solid,tube,web,pin,rod,rail,grip,guard,mark,moving}=k;
 const copper=k.M(0xb47753,.43,.61);
 // Thicker around the chamber, then necked down to the floating barrel and thin fore-end.
 solid(frame,[-.207,.061,-.02,.051],[-.166,.078,-.033,.066],[.037,.086,-.051,.072],[.21,.087,-.06,.067],
  [.27,.078,-.052,.057],[.313,.058,-.027,.048]);
 solid(body,[-.187,.073,-.018,.056],[-.129,.091,-.031,.079],[-.002,.091,-.037,.085],[.095,.093,-.042,.082],
  [.096,.062,-.008,.077],[.214,.062,-.014,.075],[.217,.085,-.037,.073],[.264,.077,-.032,.063],[.305,.056,-.012,.051]);
 solid(steel,[.097,.077,.008,.061],[.124,.089,.001,.068],[.186,.089,.002,.068],[.213,.078,.01,.057]);
 rod(steel,.006,[.042,.042,.177],[.065,.046,.153]);
 k.sph(.012,.065,.046,.153,rubber,1.2,.91,1);
 solid(frame,[.262,.044,-.053,-.014],[.315,.054,-.058,-.023],[.478,.056,-.061,-.031],[.622,.047,-.048,-.023],[.68,.046,-.029,-.013]);
 const slots=Array.from({length:4},(_,i)=>{
  const z=.327+i*.073;return [[z,0],[z+.047,-.004],[z+.055,.022],[z+.012,.028]];
 });
 for(const side of [-1,1]){
  web(body,side*.026,.011,[[.276,.05],[.459,.062],[.598,.058],[.692,.029],[.673,-.022],[.318,-.057]],slots,.003);
  pin(side*.04,-.039,.319,.005,trim);pin(side*.034,-.017,.653,.005,steel);
  web(recess,side*.044,.002,[[-.115,-.017],[-.101,-.024],[.06,-.021],[.078,-.013],[.067,-.008],[-.105,-.008]],[],.0015);
  pin(side*.047,.024,-.133,.006,copper);
 }
 tube(steel,0,.028,[[.126,.032],[.281,.03],[.344,.022],[.424,.02],[.64,.017],[.754,.016]],20);
 k.bore(.028,.79,.032,.013,frame,.096,12);
 for(const [z,r] of [[.704,.03],[.725,.032],[.748,.032]])tube(copper,0,.028,[[z,r-.002],[z+.003,r],[z+.007,r],[z+.009,r-.001]],12);
 rail(-.165,.351,.084,.041);
 rail(.53,.665,.052,.038);
 // A skeleton with an adjustable cheek rest and exposed hinge at the shoulder.
 web(frame,0,.033,[[-.371,-.116],[-.357,.02],[-.208,.053],[-.133,.022],[-.158,-.026],[-.235,-.065],[-.329,-.113]],
  [[[-.335,-.075],[-.315,.011],[-.184,.02],[-.201,-.015],[-.253,-.042]]],.004);
 for(const side of [-1,1]){
  rod(steel,.005,[side*.018,-.082,-.328],[side*.02,.012,-.199]);
  pin(side*.024,-.023,-.334,.011,copper);
 }
 solid(rubber,[-.397,.056,-.116,-.014],[-.386,.075,-.124,.014],[-.357,.079,-.119,.023],[-.342,.067,-.098,.021]);
 solid(body,[-.348,.061,.011,.042],[-.325,.076,.014,.061],[-.215,.077,.027,.069],[-.193,.053,.033,.059]);
 grip(-.016);guard(-.016,-.053,.131);
 const mag=solid(frame,[.086,.042,-.138,-.072],[.11,.052,-.162,-.052],[.186,.055,-.158,-.043],[.226,.046,-.104,-.037]);
 const cap=solid(steel,[.094,.042,-.154,-.134],[.115,.061,-.173,-.146],[.198,.063,-.167,-.145],[.217,.046,-.149,-.134]);
 const foot=solid(rubber,[.111,.059,-.176,-.167],[.191,.063,-.17,-.159]);
 g.userData.mags=moving([mag,cap,foot],[0,-.113,.153],'Short magazine');
 mark('PENDULUM',-.047,.022,.026,.112,.029);
 mkSights(g,'PD',{yt:.142,yb:.095,yf:.064,zr:-.126,zf:.601});
 g.userData.a={r:[0,-.115,-.021],l:[0,-.061,.426],m:[0,-.113,.153]};
 g.userData.muzzle={x:0,y:.028,z:.79};return g;
};

/* Cosmetic mounts are separate from the shared weapon geometry and never change collision or handling. */
const passCharmTemplates=new Map();
function passCharmModel(id){
 if(passCharmTemplates.has(id))return gunCopy(passCharmTemplates.get(id));
 const g=new THREE.Group(),c=PASS_CHARMS[id]?.color;
 if(!c)return g;
 const {M,E,box,ring,cylY}=gunKit(g),gold=M(c),metal=M(0x4d585d),dark=M(0x202423);
 ring(.01,.0024,0,0,0,metal);
 box(.005,.024,.006,0,-.022,0,metal);
 switch(id){
  case 'key':
   ring(.013,.003,0,-.035,0,gold);
   box(.009,.037,.009,0,-.062,0,gold);
   box(.016,.007,.009,.006,-.072,0,gold);
   box(.02,.007,.009,.006,-.08,0,gold);
   break;
  case 'gyro':
   ring(.021,.004,0,-.052,0,gold);
   ring(.015,.003,0,-.052,0,metal).rotation.y=Math.PI*.47;
   const axis=cylY(.004,.039,0,-.052,0,gold);
   axis.rotation.z=.57;
   break;
  case 'lantern':
   box(.028,.037,.026,0,-.055,0,dark);
   box(.017,.023,.029,0,-.055,0,E(c));
   for(const side of [-1,1])box(.031,.005,.03,0,-.055+side*.017,0,gold);
   break;
  case 'crown':{
   ring(.023,.003,0,-.055,0,gold);
   ring(.023,.003,0,-.055,0,metal).rotation.y=1.5;
   const core=new THREE.Mesh(new THREE.OctahedronGeometry(.017,0),E(0x76e6db));
   core.scale.set(.7,1.28,.7);core.position.y=-.055;g.add(core);
   for(const side of [-1,1])box(.006,.033,.011,side*.015,-.055,0,gold,0,side*.39);
   break;
  }
  case 'prism':{
   const point=new THREE.Mesh(new THREE.OctahedronGeometry(.022,0),gold);
   point.scale.set(.65,1,.61);point.position.y=-.055;point.rotation.z=.21;g.add(point);
   ring(.019,.0025,0,-.055,0,metal).rotation.y=.73;
   break;
  }
 }
 g.userData.charm=true;
 g.traverse(node=>{node.userData.charm=true;node.castShadow=false});
 passCharmTemplates.set(id,g);
 return gunCopy(g);
}
function addPassCharm(model,id){
 if(!id)return;
 const charm=passCharmModel(id),hold=model.userData.a.r;
 charm.position.set(.063,.012,hold[2]+.13);
 model.add(charm);
}

WG.TEA=[.6,0xb8733a,0,0xffb040];
GS.TEA={n:[[.3,'bandpass',1200,.4,0,.9,1.8],[.2,'lowpass',520,.35,.04],[.06,'highpass',4800,.12]],o:[['sine',170,70,.2,.3]]};
RLK.TEA='mag';
/* the model: riveted copper boiler with a teapot lid on top, brass bands, a pressure gauge, a glowing sight-glass tube, a curved brass spout-nozzle with a glowing amber mouth, copper pipes,
   a mahogany stock with a brass butt plate, a leather pistol grip, and a teacup on a saucer as the magazine */
MODELS.TEA=function(g,rm){const k=gunKit(g,rm),M=k.M,E=k.E,cop=rm||M(0xb8733a),brass=M(0xc9a23a),mah=M(0x4a2616),leather=M(0x1d130c),por=M(0xf4efe4),blue=M(0x2b4f9e),dk=M(0x15171a),gun=M(0x2a2d31),steel=M(0x8a9098),amb=E(0xffa530),cream=E(0xfff0c8),mags=[];
 /* boiler: a long copper drum with domed ends, three brass bands and a ring of rivets on each */
 k.cyl(.088,.42,0,.15,.2,cop,.088,22);k.sph(.088,0,.15,.41,cop,1,1,.6);k.sph(.088,0,.15,-.01,cop,1,1,.6);
 for(const z of[.06,.2,.34]){k.cyl(.093,.022,0,.15,z,brass,.093,22);for(let i=0;i<10;i++){const a=i/10*6.283;k.sph(.007,Math.cos(a)*.094,.15+Math.sin(a)*.094,z,steel)}}
 /* the teapot lid on top of the boiler: filler neck, porcelain dome, gold knob, a tiny whistle */
 k.cylY(.05,.03,0,.245,.2,brass);k.cylY(.04,.02,0,.265,.2,por);k.sph(.045,0,.275,.2,por,1,.62,1);k.sph(.014,0,.31,.2,brass);k.cylY(.011,.05,.045,.28,.13,brass);k.sph(.014,.045,.31,.13,brass);
 for(let i=0;i<8;i++){const a=i/8*6.283;k.box(.008,.012,.008,Math.cos(a)*.052,.262,.2+Math.sin(a)*.052,blue)}
 /* pressure gauge on the left, with an emissive face and a needle */
 k.cylY(.045,.02,.1,.15,.13,brass,0,Math.PI/2);k.cylY(.037,.022,.104,.15,.13,cream,0,Math.PI/2);k.box(.003,.03,.003,.109,.152,.13,dk,.9);for(let i=0;i<7;i++){const a=-1.2+i*.4;k.box(.002,.008,.002,.11,.15+Math.cos(a)*.032,.13+Math.sin(a)*.032,dk,a)}k.sph(.007,.11,.15,.13,brass);
 /* sight-glass tube with glowing tea and brass fittings */
 k.cylY(.011,.13,-.098,.14,.3,amb);k.cylY(.016,.02,-.098,.2,.3,brass);k.cylY(.016,.02,-.098,.08,.3,brass);k.cylY(.007,.02,-.092,.2,.3,brass,0,Math.PI/2);k.cylY(.007,.02,-.092,.08,.3,brass,0,Math.PI/2);
 /* frame under the boiler, trigger group, leather pistol grip with a brass backstrap */
 k.box(.072,.07,.32,0,.035,.2,gun);k.box(.06,.012,.28,0,.075,.2,steel);k.box(.1,.03,.1,0,.0,.06,gun);
 k.box(.046,.125,.058,0,-.072,.075,leather,.32);k.box(.012,.12,.06,.0,-.07,.045,brass,.32);k.box(.05,.016,.07,0,-.14,.055,brass,.32);
 k.box(.006,.032,.1,0,-.005,.13,steel);k.box(.007,.034,.012,0,-.012,.095,steel);k.box(.005,.026,.008,0,-.003,.12,steel);
 /* mahogany stock, brass butt plate and a small crest */
 k.box(.056,.1,.2,0,.045,-.13,mah);k.box(.056,.085,.12,0,.02,-.26,mah,-.14);k.box(.058,.11,.014,0,.0,-.332,brass,-.14);k.box(.058,.014,.2,0,.098,-.13,brass);k.box(.003,.05,.05,.029,.04,-.13,blue);k.box(.004,.03,.03,.0305,.04,-.13,brass);
 /* the nozzle: a curved teapot spout in tapering copper and brass sections, a heat sleeve and a glowing amber mouth */
 k.cyl(.052,.1,0,.15,.47,cop,.042,18);k.cyl(.042,.14,0,.152,.59,cop,.034,16);k.cyl(.034,.14,0,.158,.72,brass,.03,14);k.cyl(.03,.1,0,.166,.84,brass,.034,14);
 k.cyl(.046,.016,0,.168,.9,brass,.052,14);k.cyl(.036,.02,0,.168,.912,E(0xffb040),.036,14);k.cyl(.022,.025,0,.168,.92,dk,.022,10);
 for(let i=0;i<8;i++){const a=i/8*6.283;k.box(.007,.007,.05,Math.cos(a)*.044,.152+Math.sin(a)*.044,.62,dk)}
 /* copper pipes from the boiler to the nozzle, with elbows, and a valve wheel */
 for(const s of[-1,1]){k.cyl(.008,.34,s*.062,.2,.55,cop);k.sph(.012,s*.062,.2,.38,brass);k.sph(.012,s*.062,.2,.72,brass);k.cylY(.008,.04,s*.062,.18,.38,cop)}
 k.ring(.026,.005,0,.215,.4,brass);for(let i=0;i<4;i++){const a=i*Math.PI/2;k.box(.004,.05,.004,0,.215,.4,brass,0,0,a)}k.cyl(.007,.04,0,.215,.38,brass);
 /* teacup magazine on its saucer, with a blue band, a gold rim, tea inside and a handle */
 mags.push(k.cylY(.034,.075,0,-.02,.3,por,0,0,.054),k.cylY(.078,.012,0,-.06,.3,por),k.cylY(.056,.012,0,.005,.3,blue),k.cylY(.055,.004,0,.026,.3,brass),k.cylY(.047,.004,0,.021,.3,E(0xb5651d)),k.ring(.022,.006,.063,-.012,.3,por));
 k.box(.052,.016,.052,0,.018,.3,gun);
 /* a lamp that shows the cannon is hot */
 k.sph(.01,0,.083,.44,amb);
 k.box(.047,.012,.03,.085,.207,.09,brass);k.box(.085,.014,.027,.069,.219,.52,brass);
 mkSights(g,'TEA',{xt:.104,yt:.258,yb:.213,yf:.225,zr:.09,zf:.52});
 g.userData.a={r:[0,-.07,.075],l:[0,-.02,.36],m:[0,-.05,.3]};g.userData.mags=mags;g.userData.muzzle={x:0,y:.168,z:.933};return g};
