/* ===================== extras.js ===================== */
/* ---------- Twin SMG (dual wield) ----------
   Multiplayer: an attachment on the SMG, "Dual Wield", turns it into two compact SMGs (the weapon becomes 'DS' when the match starts).
   Zombies: its own weapon (wall buy and Mystery Box). Hip fire only. Mouse and keyboard: the fire button alternates the two guns.
   Controller: LEFT trigger fires the LEFT gun, RIGHT trigger fires the RIGHT gun, both together fire both. */
W.DS={n:'Twin SMG',d:21,r:.044,m:60,sp:.034,rc:.62,pel:1,au:1,rl:2.3,len:.4,col:0x33363b,dual:1};
WG.DS=[.55,0x33363b,0,0xffd27a];
GS.DS=GS.SMG;
const ATT_ONLY={'Dual Wield':'SMG'};
A['Dual Wield']={t:'SMG only: wield two SMGs at once. Hip fire only, double the magazine. Controller: left trigger fires the left gun, right trigger the right gun'};
UNL['Dual Wield']=14;
if(typeof CLS!='undefined')CLS.DS='PRIMARY';
const DS={k:[0,0],h:0,L:false,R:false};
/* one compact SMG facing +z, built around its pistol grip at z=0: boxy receiver with a slotted top rail, bolt window with a steel slider, knurled collar and muzzle tube,
   round side lug, textured pistol grip with a collar plate, a long magazine in the grip and a second one hanging under the shroud */
function dsUnit(side,rm,mags){const u=new THREE.Group(),k=gunKit(u,rm),M=k.M,body=rm||M(0x34373c),dk=M(0x14161a),gm=M(0x23262b),steel=M(0x8c9298),rub=M(0x0c0d0f),acc=M(0x4a4e55);
 k.box(.064,.072,.31,0,0,.13,body);k.box(.056,.014,.29,0,.043,.13,gm);k.box(.068,.03,.11,0,.03,.015,body);k.box(.05,.02,.07,0,.05,-.02,gm);
 for(let i=0;i<5;i++)k.box(.05,.011,.013,0,.052,.02+i*.036,dk);
 k.box(.004,.03,.085,side*.033,.012,.1,dk);k.box(.008,.016,.032,side*.034,.014,.115,steel);k.box(.005,.008,.06,side*.034,-.006,.1,steel);
 k.box(.005,.05,.1,side*.033,-.012,.2,gm);for(let i=0;i<3;i++)k.box(.005,.011,.026,side*.034,.03,.2+i*.032,dk,0,0,-.5*side);
 for(const y of[.03,-.02])for(const z of[.04,.21])k.cylY(.005,.008,side*.035,y,z,steel,0,Math.PI/2*side);
 k.box(.074,.088,.13,0,0,.31,gm);k.box(.07,.012,.12,0,.05,.31,dk);for(let i=0;i<4;i++)k.box(.075,.007,.02,0,-.036,.27+i*.03,dk);
 k.cyl(.039,.024,0,.005,.385,acc);for(let i=0;i<10;i++){const a=i/10*6.283;k.box(.012,.012,.026,Math.cos(a)*.04,.005+Math.sin(a)*.04,.385,steel,0,0,a)}
 k.cyl(.0185,.15,0,.006,.47,dk);k.cyl(.022,.022,0,.006,.54,gm);k.cyl(.0125,.012,0,.006,.552,M(0x050506));
 const d=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.018,16),gm);d.rotation.z=Math.PI/2;d.position.set(side*.04,-.012,.345);u.add(d);const d2=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.02,12),dk);d2.rotation.z=Math.PI/2;d2.position.set(side*.045,-.012,.345);u.add(d2);
 k.box(.042,.115,.052,0,-.088,.012,rub,.3);for(let i=0;i<5;i++)k.box(.044,.006,.054,0,-.05-i*.018,.012-i*.0055,dk,.3);k.box(.056,.018,.066,0,-.15,-.01,steel,.3);k.box(.05,.012,.06,0,-.168,-.016,gm,.3);
 mags.push(k.box(.04,.17,.064,0,-.245,-.026,dk,.3));mags.push(k.box(.046,.016,.07,0,-.333,-.05,gm,.3));
 k.box(.006,.034,.1,0,-.05,.115,steel);k.box(.007,.034,.012,0,-.055,.07,steel);k.box(.005,.026,.008,0,-.04,.09,steel);
 mags.push(k.box(.036,.125,.058,0,-.105,.285,dk,.05));mags.push(k.box(.042,.014,.064,0,-.172,.282,gm,.05));
 k.box(.05,.014,.05,0,-.045,.255,gm);
 return u}
MODELS.DS=function(g,rm){const mags=[],units=[];for(const side of[-1,1]){const u=dsUnit(side,rm,mags);u.position.x=side*.105;u.rotation.y=-side*.035;g.add(u);units.push(u)}
 /* units[0] is the gun on the shooter's right (a character facing +z has its right hand on -x) */
 g.userData.a={r:[-.105,-.09,.01],l:[.105,-.09,.01],m:[0,-.17,.0]};g.userData.mags=mags;g.userData.units=units;return g};
/* the guns fire in turn (or the one you chose with the controller triggers); each kicks back on its own */
function dsShot(w){const pad=PG&&PG.on&&(DS.L||DS.R);let h;if(pad&&DS.L!=DS.R)h=DS.L?1:0;else{DS.h^=1;h=DS.h}DS.k[h]=1;gf.position.x=h?-.1:.1;
 if(pad&&DS.L!=DS.R)nf=t0+w.r*2*zfr()}
{const _fu=fpUpdate;fpUpdate=function(dt){const w=cw(),a=fpG.userData&&fpG.userData.a,u=fpG.userData&&fpG.userData.units;
  if(w&&w.dual&&a&&u){if(!a.b0)a.b0={r:a.r.slice(),l:a.l.slice()};for(let i=0;i<2;i++)DS.k[i]=Math.max(0,DS.k[i]-dt*8);
   const kr=DS.k[0],kl=DS.k[1];a.r=[a.b0.r[0],a.b0.r[1],a.b0.r[2]+kr*.04];a.l=[a.b0.l[0],a.b0.l[1],a.b0.l[2]+kl*.04];
   u[0].position.z=-kr*.04;u[1].position.z=-kl*.04;u[0].rotation.x=kr*.1;u[1].rotation.x=kl*.1}
  return _fu.apply(this,arguments)}}

/* ---------- reload foley: every gun reloads with its own sequence of mechanical sounds (release latch, magazine sliding out, the drop, the new magazine sliding in, the seat, bolt or charging handle,
   shells being thumbed in, a pump racking, a drum winding, a rocket tube loading) built from filtered noise and short resonances instead of beeps.
   The player's reload follows the animation, bots and other players play the same sequence at their own distance. ---------- */
const FOL=(()=>{let nb=null,last=-1,lastEv=0;
 const cx=()=>{ac=ac||new AudioContext();if(ac.state=='suspended'){try{ac.resume()}catch(e){}}return ac},buf=()=>{if(nb)return nb;const c=cx(),b=c.createBuffer(1,c.sampleRate,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return nb=b};
 /* a burst of filtered noise (optionally sweeping), and a short pitched resonance */
 const nz=(t,dur,type,f,q,v,f2)=>{const c=cx(),s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=buf();s.loop=true;s.playbackRate.value=.7+Math.random()*.6;fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v*vol),t+Math.min(.005,dur/3));g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(c.destination);s.start(t,Math.random()*.5);s.stop(t+dur+.03)};
 const tn=(t,f,f2,dur,type,v)=>{const c=cx(),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v*vol),t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.03)};
 const S={
  tick:(t,v,p)=>{nz(t,.02,'bandpass',4300*p,7,v*.9);tn(t,3000*p,2600*p,.035,'sine',v*.2)},
  latch:(t,v,p)=>{S.tick(t,v*.8,p);S.tick(t+.016,v*.6,p*.85);nz(t+.01,.03,'lowpass',900,1,v*.35)},
  clack:(t,v,p)=>{nz(t,.055,'lowpass',2000*p,.8,v);tn(t,210*p,95*p,.1,'sine',v*.9);S.tick(t+.004,v*.7,p*.9)},
  thud:(t,v,p)=>{nz(t,.1,'lowpass',520,.7,v*.9);tn(t,120*p,52*p,.14,'sine',v);nz(t+.07,.05,'bandpass',1500*p,2,v*.25)},
  slide:(t,v,p,d)=>{d=d||.13;nz(t,d,'bandpass',1000*p,1.1,v*.55,2600*p);nz(t+d*.55,d*.5,'highpass',3500,.7,v*.12)},
  rack:(t,v,p)=>{nz(t,.1,'bandpass',800*p,1.2,v*.6,2100*p);S.tick(t+.07,v*.5,p);S.clack(t+.15,v*1.05,p*.95);S.tick(t+.17,v*.5,p*1.1)},
  plink:(t,v,p)=>{tn(t,2000*p,1500*p,.07,'triangle',v*.45);nz(t,.02,'highpass',3500,.7,v*.5);S.tick(t+.05,v*.35,p*1.2)},
  pump:(t,v,p)=>{nz(t,.13,'bandpass',480*p,1,v*.6,1500*p);S.tick(t+.1,v*.5,p);S.clack(t+.14,v*1.1,p*.8);nz(t+.27,.12,'bandpass',1500*p,1,v*.5,520*p);S.clack(t+.38,v*1.15,p*.75);S.tick(t+.4,v*.5,p)},
  ratchet:(t,v,p,n)=>{for(let i=0;i<(n||5);i++){S.tick(t+i*.032,v*(.55+.12*(i%2)),p*(1+i*.035));nz(t+i*.032,.012,'lowpass',1500,1,v*.2)}},
  whoosh:(t,v,p,d)=>{d=d||.3;nz(t,d,'lowpass',380*p,.8,v*.8,1400*p)},
  chain:(t,v,p)=>{for(let i=0;i<7;i++){nz(t+i*.045,.03,'bandpass',2800*p,3,v*(.3+Math.random()*.2));tn(t+i*.045,1700*p,1500*p,.03,'square',v*.07)}},
  rattle:(t,v,p)=>{for(let i=0;i<6;i++){S.plink(t+i*.037+Math.random()*.015,v*.5,p*(.9+Math.random()*.4))}},
  servo:(t,v,p,d)=>{d=d||.4;const c=cx(),o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain();o.type='sawtooth';o2.type='sine';o.frequency.setValueAtTime(220*p,t);o.frequency.exponentialRampToValueAtTime(980*p,t+d);o2.frequency.setValueAtTime(40,t);o2.frequency.linearRampToValueAtTime(24,t+d);
   const lf=c.createGain();lf.gain.value=.5;o2.connect(lf);lf.connect(g.gain);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v*.22*vol),t+d*.3);g.gain.exponentialRampToValueAtTime(.0001,t+d);const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=2400;o.connect(fl).connect(g).connect(c.destination);o.start(t);o2.start(t);o.stop(t+d+.03);o2.stop(t+d+.03)},
  zap:(t,v,p)=>{tn(t,1800*p,300*p,.16,'sawtooth',v*.25);nz(t,.09,'highpass',3000,.7,v*.5)},
  spool:(t,v,p,d)=>{S.servo(t,v*.7,p,d||.3)},
  cyl:(t,v,p)=>{S.latch(t,v,p);S.slide(t+.03,v*.6,p*1.1,.1)}};
 /* per-weapon sequences: [progress 0..1 through the reload, sound, weight, pitch] (weight scales loudness, pitch the character: small and bright to big and dull) */
 const mag=(o)=>[[.1,'latch',.8,o.p*1.05],[.28,'slide',.8,o.p],[.38,'thud',.55*o.w,o.p],[.64,'slide',.65,o.p*.95],[.84,'clack',1*o.w,o.p],[.93,o.bolt||'rack',1*o.w,o.p*(o.bp||1)]];
 const RFS={AR:mag({p:.82,w:1.05,bp:.9}),SMG:mag({p:1.25,w:.85}),BR:[[.1,'latch',.9,.75],[.26,'slide',.9,.7],[.38,'thud',.8,.75],[.66,'slide',.8,.72],[.84,'clack',1.2,.7],[.93,'rack',1.25,.62]],
  MP:mag({p:1.3,w:.8,bolt:'tick'}),CT:[[.1,'latch',.9,1.1],[.3,'slide',.6,1.2],[.4,'thud',.45,1.2],[.66,'slide',.5,1.15],[.8,'clack',.9,1.15],[.92,'rack',.95,1.1]],
  MG:[[.08,'cyl',1,.9],[.26,'rattle',.9,1.05],[.5,'plink',.55,.95],[.58,'plink',.55,1],[.66,'plink',.55,1.05],[.74,'ratchet',.8,1,4],[.9,'clack',1.15,.85]],
  SN:[[.08,'tick',.9,.7],[.16,'slide',.9,.7,.17],[.38,'thud',.7,.8],[.7,'slide',.7,.8],[.8,'clack',1.1,.75],[.88,'rack',1.15,.7],[.96,'clack',.8,.8]],
  RL:[[.1,'latch',1.1,.7],[.26,'whoosh',.9,.8],[.6,'thud',1.3,.7],[.72,'clack',1.2,.6],[.86,'latch',1.2,.65],[.95,'tick',.6,1.3]],
  RG:[[.12,'tick',.7,.9],[.22,'servo',.8,1],[.55,'plink',.6,.8],[.62,'tick',.8,1.1],[.82,'servo',.9,1.4,.25],[.95,'zap',.7,1]],
  VMP:mag({p:1.1,w:.95}),MVR:mag({p:.95,w:1}),
  TUR:[[.1,'latch',.9,.9],[.24,'ratchet',.9,.8,8],[.4,'slide',.7,.8],[.62,'ratchet',.8,.85,9],[.84,'clack',1.1,.8],[.93,'rack',1,.8]],
  TRB:[[.1,'latch',.8,1],[.26,'slide',.7,1],[.36,'servo',.6,.7,.3],[.62,'slide',.65,1],[.82,'clack',1,.95],[.9,'spool',1,1.2,.3]],
  CY:[[.08,'latch',1.1,.7],[.24,'slide',.9,.65],[.36,'thud',1,.7],[.52,'chain',.9,.9],[.7,'slide',.8,.7],[.84,'clack',1.25,.65],[.93,'rack',1.25,.6]],
  DS:null,SG:[[.9,'pump',1.1,1]]};
 RFS.DS=[...mag({p:1.2,w:.8}).map(e=>e.slice()),...mag({p:1.15,w:.78}).map(e=>[Math.min(.99,e[0]+.07),e[1],e[2]*.9,e[3]*.95,e[4]])];
 const play=(k,e,v,t)=>{const f=S[e[1]];if(f)f(t==null?cx().currentTime:t,.16*v*(e[2]||1),e[3]||1,e[4])};
 return{
  /* the player's reload: sounds fire as the animation passes their moment; shotguns thumb a shell in for every shell the animation loads */
  player(w,k,p,ev){const seq=RFS[k]||RFS.AR;if(p<last-.2)last=-1;if(p<=.001)last=-1;
   if(k=='SG'){if(ev>lastEv){play(k,[0,'plink',.9,1,0],1);nz(cx().currentTime+.02,.05,'bandpass',1400,2,.05*vol)}lastEv=ev}
   for(const e of seq)if(e[0]>last&&e[0]<=p)play(k,e,1);last=p},
  reset(){last=-1;lastEv=0},
  /* bots and other players: the whole sequence scheduled from the moment their reload starts, quieter with distance */
  bot(b,w){try{const d=C.position.distanceTo(b.m?b.m.position:C.position),v=Math.max(0,1-d/38);if(v<.06)return;const seq=RFS[b.wk]||RFS.AR,dur=Math.max(.5,w.rl),t0=cx().currentTime;
   if(b.wk=='SG'){for(let i=0;i<3;i++)S.plink(t0+.3+i*dur*.2,.14*v,1);S.pump(t0+dur*.88,.15*v,1);return}
   for(const e of seq)play(b.wk,e,v,t0+e[0]*dur)}catch(x){}},
  S};
})();

/* ---------- speed: fewer draw calls, no per-frame HUD rebuilds ----------
   1) Every person (bots, zombies, brutes) is built from dozens of small meshes, and each mesh is drawn twice (once for the shadow): hundreds of calls per character.
      LX.mergeRig fuses all the static pieces of each limb that share a material into ONE mesh (the limbs themselves stay separate groups, so every animation is untouched).
   2) The HUD wrote text and markup into the page every frame even when nothing had changed, which forces the browser to re-layout. Writes of an identical value are now skipped. */
LX.mergeRig=function(root,rig){try{if(!root||!root.isObject3D)return;const keep=new Set((rig&&rig.hip)||[]),nm=new THREE.Matrix3();
 const groups=[];root.traverse(n=>{if(n===root||(n.isObject3D&&!n.isMesh&&n.children&&n.children.length))groups.push(n)});
 for(const g of groups){const by=new Map();
  for(const c of g.children){if(!c.isMesh||!c.visible||keep.has(c)||c.userData.noMerge||!c.geometry||!c.geometry.attributes||!c.geometry.attributes.position||!c.geometry.attributes.normal||!c.geometry.attributes.uv||!c.material||Array.isArray(c.material))continue;
   const m0=c.material,mut=rig&&rig.mat&&Object.values(rig.mat).includes(m0),key=mut||!m0.color?m0:'c'+m0.color.getHex()+'|'+(m0.emissive?m0.emissive.getHex():0)+'|'+(m0.roughness||0)+'|'+(m0.metalness||0)+'|'+(m0.transparent?1:0)+'|'+m0.opacity+'|'+(m0.map?1:0)+(m0.type||'');let a=by.get(key);if(!a)by.set(key,a=[]);a.push(c)}
  for(const[key,list]of by){if(list.length<2)continue;const m=list[0].material;let nv=0,ni=0;for(const c of list){nv+=c.geometry.attributes.position.count;ni+=c.geometry.index?c.geometry.index.count:c.geometry.attributes.position.count}
   const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;const v=new THREE.Vector3();
   for(const c of list){c.updateMatrix();const gm=c.geometry,pa=gm.attributes.position,na=gm.attributes.normal,ua=gm.attributes.uv;nm.getNormalMatrix(c.matrix);
    for(let i=0;i<pa.count;i++){v.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(c.matrix);P[(vo+i)*3]=v.x;P[(vo+i)*3+1]=v.y;P[(vo+i)*3+2]=v.z;v.set(na.getX(i),na.getY(i),na.getZ(i)).applyMatrix3(nm).normalize();N[(vo+i)*3]=v.x;N[(vo+i)*3+1]=v.y;N[(vo+i)*3+2]=v.z;U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
    if(gm.index){for(let i=0;i<gm.index.count;i++)I[io++]=gm.index.getX(i)+vo}else for(let i=0;i<pa.count;i++)I[io++]=vo+i;vo+=pa.count}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('uv',new THREE.BufferAttribute(U,2));geo.setIndex(new THREE.BufferAttribute(I,1));
   const me=new THREE.Mesh(geo,m);me.castShadow=list[0].castShadow;me.receiveShadow=list[0].receiveShadow;me.userData.merged=1;me.frustumCulled=false;
   for(const c of list)g.remove(c);g.add(me)}}}catch(e){try{console.warn('mergeRig skipped',e)}catch(x){}}};
/* characters far away stop casting shadows (their shadow is a few pixels): the flag is refreshed a few times a second */
LX.shadowLOD=function(list,t){if(t-(LX.slT||0)<.3)return;LX.slT=t;const p=C.position;for(const b of list){if(!b.m)continue;const d=Math.hypot(b.x-p.x,b.z-p.z),on=d<26;if(b._sc!==on){b._sc=on;b.m.traverse(o=>{if(o.isMesh&&o.userData.merged!==2)o.castShadow=on})}}};
{const td=Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML'),hud=e=>e.closest&&e.closest('#hud,#zh,#bars,#kst');
 Object.defineProperty(Node.prototype,'textContent',{configurable:true,enumerable:td.enumerable,get:td.get,set(v){if(this.nodeType==1&&hud(this)&&td.get.call(this)===String(v))return;td.set.call(this,v)}});
 Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:ih.enumerable,get:ih.get,set(v){if(hud(this)&&this.__ih===v&&this.childNodes.length===this.__ic)return;ih.set.call(this,v);this.__ih=v;this.__ic=this.childNodes.length}})}

{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);if(typeof bots!='undefined'&&bots.length)LX.shadowLOD(bots,performance.now()/1000)}}

/* ---------- one model per weapon, everywhere ----------
   The KN-115, VMP-X and RayGun you hold in first person are hand-built; bots, other players, the loadout screen and the wall drawings used a different, simpler model.
   Now every one of those places builds a copy of the first-person model, turned to face forward (+z) with the matching hand positions. */
{const cp=o=>{const n=o.isMesh?new THREE.Mesh(o.geometry,o.material):new THREE.Group();n.position.copy(o.position);n.rotation.copy(o.rotation);n.scale.copy(o.scale);n.visible=o.visible;n.castShadow=o.castShadow;n.receiveShadow=o.receiveShadow;for(const c of o.children)n.add(cp(c));return n};
 /* hand positions from FPA, mirrored into the forward-facing model space (x and z flip) */
 const AN={AR:{r:[0,-.115,.14],l:[0,-.075,.62],m:[0,-.2,.32]},VMP:{r:[0,-.1,.08],l:[0,-.06,.38],m:[0,-.2,.15]},RG:{r:[0,-.095,-.08],l:[.02,-.15,-.09],m:[0,-.14,0]}};
 for(const k of['AR','VMP','RG'])MODELS[k]=function(g,rm){const src=k=='AR'?knG:k=='VMP'?vmpG:rgG,A0=[],A1=[];src.traverse(o=>A0.push(o));const c=cp(src);c.traverse(o=>A1.push(o));c.visible=true;
  const mags=(src.userData.mag||[]).map(m=>A1[A0.indexOf(m)]).filter(Boolean),w=new THREE.Group();w.add(c);w.rotation.y=Math.PI;g.add(w);
  g.userData.a=JSON.parse(JSON.stringify(AN[k]));g.userData.mags=mags;if(src.userData.sight)g.userData.sight=src.userData.sight;return g}}

/* bots can use every multiplayer weapon (the sniper, the rocket launcher and the Twin SMG joined the pool; Zombies-only weapons never do) */
for(const k of['SN','RL','DS'])if(!BOTGUNS.includes(k))BOTGUNS.push(k);
