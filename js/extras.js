/* ===================== extras.js ===================== */
/* ---------- Twin SMG (dual wield) ----------
   Multiplayer: an attachment on the SMG, "Dual Wield", turns it into two compact SMGs (the weapon becomes 'DS' when the match starts).
   Zombies: its own weapon (wall buy and Mystery Box). Hip fire only. Mouse and keyboard: the fire button alternates the two guns.
   Controller: LEFT trigger fires the LEFT gun, RIGHT trigger fires the RIGHT gun, both together fire both. */
W.DS={n:'Twin SMG',d:21,r:.044,m:60,sp:.034,rc:.62,pel:1,au:1,rl:2.3,len:.4,col:0x33363b,dual:1};
WG.DS=[.55,0x33363b,0,0xffd27a];
GS.DS=GS.SMG;
var ATT_ONLY={'Dual Wield':'SMG'};
A['Dual Wield']={t:'SMG only: wield two SMGs at once. Hip fire only, double the magazine. Controller: left trigger fires the left gun, right trigger the right gun'};
UNL['Dual Wield']=14;
if(typeof CLS!='undefined')CLS.DS='PRIMARY';
var DS={k:[0,0],h:0,L:false,R:false};
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
 mkSights(u,'DS',{yt:.102,yb:.057,yf:.052,zr:.04,zf:.33});
 u.userData.muzzle={x:0,y:.006,z:.558};return u}
MODELS.DS=function(g,rm){const mags=[],units=[];for(const side of[-1,1]){const u=dsUnit(side,rm,mags);u.position.x=side*.105;u.rotation.y=-side*.035;g.add(u);units.push(u)}
 /* units[0] is the gun on the shooter's right (a character facing +z has its right hand on -x) */
 g.userData.a={r:[-.105,-.09,.01],l:[.105,-.09,.01],m:[0,-.17,.0]};g.userData.mags=mags;g.userData.units=units;return g};
/* the guns fire in turn (or the one you chose with the controller triggers); each kicks back on its own */
function dsShot(w){const pad=PG&&PG.on&&(DS.L||DS.R);let h;if(pad&&DS.L!=DS.R)h=DS.L?1:0;else{DS.h^=1;h=DS.h}DS.k[h]=1;
 if(pad&&DS.L!=DS.R)nf=t0+w.r*2*zfr();return h}
{const _fu=fpUpdate;fpUpdate=function(dt){const w=cw(),a=curAnch(),u=fpG.userData&&fpG.userData.units;
  if(w&&w.dual&&a&&u){if(!a.b0)a.b0={r:a.r.slice(),l:a.l.slice()};for(let i=0;i<2;i++)DS.k[i]=Math.max(0,DS.k[i]-dt*8);
   const kr=DS.k[0],kl=DS.k[1];a.r=[a.b0.r[0],a.b0.r[1],a.b0.r[2]+kr*.04];a.l=[a.b0.l[0],a.b0.l[1],a.b0.l[2]+kl*.04];
   u[0].position.z=-kr*.04;u[1].position.z=-kl*.04;u[0].rotation.x=kr*.1;u[1].rotation.x=kl*.1}
  return _fu.apply(this,arguments)}}

/* ---------- reload sounds ----------
   Every gun reloads with its own sequence, built the way a real gun sounds: nothing here is a pitched tone or a sweep.
   A click or a clack is a burst of noise that excites a few ringing resonances of the material it hits (steel rings high and long, polymer is dull and short, brass casings tinkle, wood knocks).
   Sliding parts are rough filtered noise (stick and slip), drops are low thuds. Each weapon has its own parts, weight, material and order of events:
   a rocking AK magazine, a pistol slap, a revolver's cylinder and rattling casings, a pump's two-part rack, a bolt action, a drum winding, a belt box, a teapot lid and the pour.
   The player's reload follows the animation, bots and other players play the same sequence at their own distance, a little quieter. */
var FOL=(()=>{let nb=null,bus=null,last=-1,lastEv=0;const R=Math.random;
 const cx=()=>{ac=ac||new AudioContext();if(ac.state=='suspended'){try{ac.resume()}catch(e){}}return ac};
 const buf=()=>{if(nb)return nb;const c=cx(),b=c.createBuffer(1,c.sampleRate,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return nb=b};
 /* everything goes through a gentle bus: nothing below 70 Hz, nothing piercing above 6 kHz, a soft compressor so stacked hits never jump out */
 const out=()=>{const c=cx();if(bus&&bus.c===c)return bus.i;const hp=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain();hp.type='highpass';hp.frequency.value=70;lp.type='lowpass';lp.frequency.value=6200;lp.Q.value=.4;g.gain.value=.8;hp.connect(lp);lp.connect(g);g.connect(PlayerAudio.output(c));bus={c,i:hp};return hp};
 /* one resonance: noise through a narrow filter with an instant attack and an exponential decay */
 const mode=(t,f,q,dec,v,type)=>{const c=cx(),s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=buf();s.loop=true;s.playbackRate.value=.8+R()*.4;fl.type=type||'bandpass';fl.frequency.value=f;fl.Q.value=q;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,v*vol),t+.0008);g.gain.exponentialRampToValueAtTime(.0001,t+dec);s.connect(fl);fl.connect(g);g.connect(out());s.start(t,R()*.4);s.stop(t+dec+.03)};
 const MAT={steel:{f:[1500,2600,4300],q:[12,16,20],d:[.055,.04,.025],g:[1,.7,.4]},poly:{f:[700,1300,2100],q:[5,6,7],d:[.03,.022,.014],g:[1,.7,.4]},alloy:{f:[1100,2000,3400],q:[9,12,15],d:[.045,.03,.02],g:[1,.7,.4]},brass:{f:[3000,4400,5800],q:[20,24,28],d:[.07,.05,.035],g:[.8,.6,.4]},wood:{f:[380,720,1200],q:[4,5,6],d:[.04,.03,.02],g:[1,.6,.3]},cer:{f:[2000,3300,4800],q:[28,32,36],d:[.1,.07,.05],g:[1,.7,.5]}};
 const hit=(t,v,p,m)=>{const M=MAT[m||'steel'];mode(t,2500,.8,.004,v*.14,'highpass');mode(t,520*p,1.3,.035,v*.65,'bandpass');for(let i=0;i<3;i++)mode(t,M.f[i]*p*(.97+R()*.06),M.q[i],M.d[i],v*M.g[i]*(i?.8:1))};
 const thud=(t,v,p,d)=>{d=d||.09;mode(t,260*p,.7,d,v*1.1,'lowpass');mode(t,110*p,.6,d*1.4,v*.8,'lowpass')};
 /* a sliding part: rough band-limited noise whose level flutters (stick and slip) while the band moves */
 const scrape=(t,dur,f0,f1,q,v)=>{const c=cx(),s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=buf();s.loop=true;fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f0,t);fl.frequency.linearRampToValueAtTime(f1,t+dur);
  const n=Math.max(8,Math.floor(dur*70)),cv=new Float32Array(n);for(let i=0;i<n;i++)cv[i]=Math.max(.0002,v*vol*(.35+.65*R())*Math.pow(Math.sin(Math.PI*Math.min(1,(i+1)/n)),.5));g.gain.setValueCurveAtTime(cv,t,dur);s.connect(fl);fl.connect(g);g.connect(out());s.start(t,R()*.4);s.stop(t+dur+.03)};
 /* the parts: (time, loudness, pitch, a, b) */
 const S={
  latch:(t,v,p,m)=>{hit(t,v*.8,p,m||'steel');hit(t+.017,v*.45,p*1.15,m||'steel')},
  tick:(t,v,p,m)=>hit(t,v*.6,p,m||'steel'),
  magOut:(t,v,p,d,m)=>{d=d||.14;scrape(t,d,900*p,1900*p,2.2,v*.5);hit(t+d*.9,v*.35,p,m||'steel')},
  magDrop:(t,v,p,m)=>{thud(t,v*.7,p,.08);hit(t+.03,v*.35,p*.85,m||'poly');thud(t+.12,v*.3,p*1.1,.06)},
  magIn:(t,v,p,d,m)=>{d=d||.1;scrape(t,d,1700*p,900*p,2.4,v*.45);hit(t+d,v*.9,p,m||'steel');thud(t+d,v*.5,p,.07)},
  seat:(t,v,p,m)=>{hit(t,v,p,m||'steel');thud(t,v*.7,p,.08)},
  bolt:(t,v,p,m)=>{scrape(t,.11,700*p,1600*p,2,v*.55);hit(t+.11,v*.55,p*.9,m||'steel');scrape(t+.19,.06,1600*p,900*p,2,v*.3);hit(t+.26,v*1.1,p*.8,m||'steel');thud(t+.26,v*.6,p,.09)},
  boltBack:(t,v,p)=>{scrape(t,.2,600*p,1500*p,1.8,v*.6);hit(t+.2,v*.7,p*.85)},
  boltFwd:(t,v,p)=>{scrape(t,.12,1500*p,700*p,1.8,v*.55);hit(t+.12,v*1.1,p*.75);thud(t+.12,v*.6,p,.09)},
  shell:(t,v,p)=>{hit(t,v*.5,p*1.05,'brass');hit(t+.025,v*.35,p,'steel');thud(t+.01,v*.25,p*1.3,.04)},
  pump:(t,v,p)=>{scrape(t,.15,500*p,1300*p,1.8,v*.7);hit(t+.15,v*.7,p*.8);scrape(t+.3,.13,1300*p,600*p,1.8,v*.65);hit(t+.43,v*1.2,p*.75);thud(t+.43,v*.8,p,.1)},
  rattle:(t,v,p,n)=>{for(let i=0;i<(n||6);i++)hit(t+i*.034+R()*.02,v*(.25+R()*.25),p*(.9+R()*.35),'brass')},
  ratchet:(t,v,p,n)=>{n=n||6;let x=t;for(let i=0;i<n;i++){hit(x,v*(.3+.08*(i%2)),p*(1+i*.02),'steel');x+=Math.max(.02,.046-i*.002)}},
  cyl:(t,v,p)=>{hit(t,v*.7,p*1.1);scrape(t+.03,.09,800*p,1500*p,2,v*.4);hit(t+.13,v*.5,p)},
  cylClose:(t,v,p)=>{scrape(t,.08,1500*p,800*p,2,v*.4);hit(t+.08,v*1.1,p*.9);thud(t+.08,v*.5,p,.07)},
  ping:(t,v,p)=>{mode(t,4300*p,60,.45,v*.5);mode(t,6500*p,70,.3,v*.25);hit(t,v*.3,p*1.2)},
  chain:(t,v,p)=>{for(let i=0;i<8;i++)hit(t+i*.04+R()*.015,v*(.2+R()*.2),p*(1+R()*.3),'alloy')},
  rocket:(t,v,p)=>{scrape(t,.34,300*p,900*p,1.5,v*.7);thud(t+.34,v*1.1,p*.7,.14);hit(t+.34,v*.5,p*.6)},
  hum:(t,v,p,d)=>{d=d||.3;scrape(t,d,150*p,170*p,5,v*.45);scrape(t,d,2400*p,1800*p,6,v*.08)},
  spool:(t,v,p,d)=>{scrape(t,d||.3,2600*p,900*p,1.2,v*.35)},
  pour:(t,v,p,d)=>{d=d||.5;scrape(t,d,1100*p,1700*p,1.4,v*.5);for(let i=0;i<10;i++)mode(t+R()*d,1500+R()*1800,16,.025,v*.18)},
  clink:(t,v,p)=>hit(t,v,p,'cer')};
 /* per-weapon sequences: [moment in the reload 0..1, part, loudness, pitch (small and bright high, big and dull low), then the part's own arguments] */
 const mag=(o)=>[[.1,'latch',.85*o.w,o.p*.98,o.m],[.27,'magOut',.8*o.w,o.p,o.d||.14,o.m],[.38,'magDrop',.85*o.w,o.p*1.02,o.m],[.66,'magIn',.8*o.w,o.p,.07,o.m],[.84,'seat',1.05*o.w,o.p*.95,o.m],[.93,o.bolt||'bolt',1*o.w,o.p*.9,o.bm||o.m]];
 const RFS={
  AR:[[.1,'latch',.95,.8],[.27,'magOut',.9,.8,.15],[.38,'magDrop',.9,.85],[.58,'tick',.55,.85],[.67,'magIn',.8,.8,.07],[.84,'seat',1.15,.74],[.92,'bolt',1.15,.72]],
  SMG:mag({p:1.3,w:.62,m:'poly',d:.1,bm:'alloy'}),
  BR:[[.1,'latch',1,.65],[.26,'magOut',1,.65,.2],[.35,'ping',.8,.9],[.42,'magDrop',1,.7],[.66,'magIn',1,.65,.1],[.84,'seat',1.3,.6],[.93,'bolt',1.3,.6]],
  MP:[[.12,'latch',.55,1.45,'poly'],[.3,'magOut',.5,1.45,.08,'poly'],[.4,'magDrop',.5,1.4,'poly'],[.66,'magIn',.55,1.4,.06,'poly'],[.82,'seat',.7,1.4,'poly'],[.92,'tick',.7,1.2,'alloy']],
  CT:[[.1,'latch',.8,1.05],[.28,'magOut',.5,1.1,.07],[.4,'magDrop',.6,1.1],[.64,'magIn',.6,1.1,.06],[.78,'seat',.9,1.05],[.9,'bolt',.75,1.1]],
  MG:[[.08,'cyl',1,.9],[.22,'tick',.8,1],[.27,'tick',.7,.95],[.31,'rattle',1,1.05,6],[.5,'rattle',.8,.95,6],[.62,'ratchet',.7,1,5],[.84,'cylClose',1.2,.85],[.93,'ratchet',.55,1.1,4]],
  SG:[[.9,'pump',1.1,1]],
  SN:[[.06,'latch',.9,.7],[.14,'boltBack',1,.7],[.34,'magOut',.8,.8,.12],[.46,'magDrop',.7,.8],[.66,'magIn',.9,.8,.09],[.8,'boltFwd',1.1,.7],[.9,'seat',.9,.7]],
  RL:[[.1,'latch',1.1,.65],[.26,'rocket',1,.8],[.6,'seat',1.2,.55],[.74,'cylClose',1.1,.6],[.9,'latch',1,.7]],
  RG:[[.1,'latch',.7,1,'alloy'],[.24,'hum',.8,1,.35],[.5,'tick',.6,.9,'alloy'],[.58,'seat',.8,1,'alloy'],[.78,'hum',.9,1.3,.3],[.93,'tick',.7,1.2,'alloy']],
  VMP:mag({p:1.05,w:.85,m:'alloy',bolt:'bolt'}),MVR:mag({p:.9,w:1,m:'steel'}),
  TUR:[[.1,'latch',.9,.9],[.24,'ratchet',.9,.8,9],[.4,'magOut',.7,.85,.12],[.62,'ratchet',.8,.85,10],[.84,'seat',1.1,.8],[.93,'bolt',1,.8]],
  TRB:[[.1,'latch',.8,1,'alloy'],[.26,'magOut',.7,1,.1,'alloy'],[.36,'spool',.6,.8,.3],[.62,'magIn',.7,1,.08,'alloy'],[.82,'seat',1,.95,'alloy'],[.9,'spool',.8,1.2,.3]],
  CY:[[.08,'latch',1.2,.6],[.24,'magOut',1,.6,.18],[.36,'magDrop',1,.65],[.52,'chain',.9,.9],[.7,'magIn',.9,.6,.12],[.84,'seat',1.3,.6],[.93,'bolt',1.3,.55]],
  SW:mag({p:.88,w:1.08,m:'alloy',d:.055,bolt:'boltFwd'}),
  LT:[[.12,'latch',.71,1.2],[.3,'magOut',.65,.88],[.66,'magIn',1.01,.89,.11],[.79,'seat',.98,1.34],[.92,'tick',.7,1.16]],
  PD:mag({p:1.12,w:.8,m:'steel',d:.16,bolt:'boltBack'}),
  VA:mag({p:1.02,w:.9,m:'poly',d:.135,bm:'alloy'}),
  BP:[[.095,'latch',.7,.82],[.88,'pump',1.16,.78]],
  KTS:[[.08,'tick',.8,1.15,'alloy'],[.87,'boltFwd',.9,1.04]],
  RD:[[.1,'latch',1,.66],[.24,'magOut',1,.68,.2],[.37,'ratchet',.6,.78,4],[.63,'magIn',.92,.68,.13],[.83,'seat',1.26,.63],[.94,'tick',.9,.73]],
  HC:mag({p:.83,w:.92,m:'steel',d:.085,bolt:'boltFwd'}),
  OH:[[.08,'latch',.83,.8],[.13,'boltBack',.87,.78],[.62,'shell',.77,1.17],[.73,'boltFwd',.99,.85],[.9,'latch',.84,.91]],
  TEA:[[.1,'clink',.8,.9],[.22,'pour',.9,.9,.5],[.5,'clink',.5,1.1],[.7,'pour',.6,1,.3],[.9,'clink',.9,.85]]};
 RFS.DS=[...mag({p:1.2,w:.6,m:'poly',d:.1,bm:'alloy'}),...mag({p:1.14,w:.58,m:'poly',d:.1,bm:'alloy'}).map(e=>[Math.min(.99,e[0]+.06),...e.slice(1)])];
 const play=(e,v,t)=>{const f=S[e[1]];if(f)f(t==null?cx().currentTime:t,.105*v*(e[2]||1)*(.88+R()*.24),(e[3]||1)*(.97+R()*.06),e[4],e[5])};
 return{
  /* the player's reload: sounds fire as the animation passes their moment; shotguns thumb a shell for every shell the animation loads */
  player(w,k,p,ev){const seq=RFS[k]||RFS.AR;if(p<last-.2||p<=.001)last=-1;
   if(RLK[k]==='shell'){if(ev>lastEv)S.shell(cx().currentTime,.07*(.9+R()*.2),k==='BP'?.89:k==='KTS'?1.12:1);lastEv=ev}
   for(const e of seq)if(e[0]>last&&e[0]<=p)play(e,1);last=p},
  reset(){last=-1;lastEv=0},
  /* bots and other players */
  bot(b,w){try{const d=C.position.distanceTo(b.m?b.m.position:C.position),v=Math.max(0,1-d/38);if(v<.06)return;const dur=Math.max(.5,w.rl),t0=cx().currentTime;
   if(b.wk=='SG'){for(let i=0;i<3;i++)S.shell(t0+.3+i*dur*.2,.1*v,1);S.pump(t0+dur*.88,.15*v,1);return}
   if(RLK[b.wk]==='shell')for(let i=0;i<Math.min(5,w.m);i++)S.shell(t0+(.21+i*.12)*dur,.085*v,b.wk==='BP'?.89:1.12);
   for(const e of RFS[b.wk]||RFS.AR)play(e,v,t0+e[0]*dur)}catch(x){}},
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
   const m0=c.material,mut=rig&&rig.mat&&Object.values(rig.mat).includes(m0),key=mut||!m0.color?m0:'c'+m0.color.getHex()+'|'+(m0.emissive?m0.emissive.getHex():0)+'|'+(m0.roughness||0)+'|'+(m0.metalness||0)+'|'+(m0.transparent?1:0)+'|'+m0.opacity+'|'+(m0.map?.uuid||'')+'|'+(m0.normalMap?.uuid||'')+'|'+(m0.side||0)+'|'+(m0.type||'');let a=by.get(key);if(!a)by.set(key,a=[]);a.push(c)}
  for(const[key,list]of by){if(list.length<2)continue;const m=list[0].material;let nv=0,ni=0;for(const c of list){nv+=c.geometry.attributes.position.count;ni+=c.geometry.index?c.geometry.index.count:c.geometry.attributes.position.count}
   const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;const v=new THREE.Vector3();
   for(const c of list){c.updateMatrix();const gm=c.geometry,pa=gm.attributes.position,na=gm.attributes.normal,ua=gm.attributes.uv;nm.getNormalMatrix(c.matrix);
    for(let i=0;i<pa.count;i++){v.set(pa.getX(i),pa.getY(i),pa.getZ(i)).applyMatrix4(c.matrix);P[(vo+i)*3]=v.x;P[(vo+i)*3+1]=v.y;P[(vo+i)*3+2]=v.z;v.set(na.getX(i),na.getY(i),na.getZ(i)).applyMatrix3(nm).normalize();N[(vo+i)*3]=v.x;N[(vo+i)*3+1]=v.y;N[(vo+i)*3+2]=v.z;U[(vo+i)*2]=ua.getX(i);U[(vo+i)*2+1]=ua.getY(i)}
    if(gm.index){for(let i=0;i<gm.index.count;i++)I[io++]=gm.index.getX(i)+vo}else for(let i=0;i<pa.count;i++)I[io++]=vo+i;vo+=pa.count}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('normal',new THREE.BufferAttribute(N,3));geo.setAttribute('uv',new THREE.BufferAttribute(U,2));geo.setIndex(new THREE.BufferAttribute(I,1));
   const me=new THREE.Mesh(geo,m);me.castShadow=list[0].castShadow;me.receiveShadow=list[0].receiveShadow;me.userData.merged=1;me.frustumCulled=true;
   for(const c of list)g.remove(c);g.add(me)}}}catch(e){try{console.warn('mergeRig skipped',e)}catch(x){}}};
/* characters far away stop casting shadows (their shadow is a few pixels): the flag is refreshed a few times a second */
LX.shadowLOD=function(list,t){if(t-(LX.slT||0)<.3)return;LX.slT=t;const p=C.position;for(const b of list){if(!b.m)continue;const d=Math.hypot(b.x-p.x,b.z-p.z),on=d<26;if(b._sc!==on){b._sc=on;b.m.traverse(o=>{if(o.isMesh&&o.userData.merged!==2)o.castShadow=on})}}};
{const td=Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML'),hud=e=>e.closest&&e.closest('#hud,#zh,#bars,#kst');
 Object.defineProperty(Node.prototype,'textContent',{configurable:true,enumerable:td.enumerable,get:td.get,set(v){if(this.nodeType==1&&hud(this)&&td.get.call(this)===String(v))return;td.set.call(this,v)}});
 Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:ih.enumerable,get:ih.get,set(v){if(hud(this)&&this.__ih===v&&this.childNodes.length===this.__ic)return;ih.set.call(this,v);this.__ih=v;this.__ic=this.childNodes.length}})}

{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);if(typeof bots!='undefined'&&bots.length)LX.shadowLOD(bots,performance.now()/1000)}}

/* bots can use every multiplayer weapon (the sniper, the rocket launcher and the Twin SMG joined the pool; Zombies-only weapons never do) */
for(const k of['SN','RL','DS'])if(!BOTGUNS.includes(k))BOTGUNS.push(k);

/* ===================== three Call of Duty staples =====================
   1  GUN GAME     a new mode: every kill hands you the next weapon, 14 rungs from pistol to Magnum, first to clear the ladder wins
   2  CLAYMORE     lethal equipment: a mine with a laser fan that goes off when an enemy walks in front of it (2 mines, max 4 down)
   3  SMOKE GRENADE equipment: a thick smoke screen for 14 seconds; bots cannot see through it, bullets still pass
   Claymore and Smoke appear in the loadout's lethal slot (E), Gun Game in the mode list. */
var GG={on:0,i:0,lad:['CT','MP','SMG','DS','VMP','AR','TRB','MVR','TUR','BR','SG','CY','SN','MG']};
MODES['Gun Game']='Every kill gives you the next weapon: 14 of them, from a pistol to the Magnum. Finish the ladder to win. Bots fight with their own guns.';
GR.Claymore={fuse:0,R:5.5,d:140,imp:0,mine:1,t:'Place it on the ground: a laser fan sets it off when an enemy walks into it. 2 mines, 4 down at once'};
GR.Smoke={fuse:1.3,R:0,d:0,imp:0,smoke:1,t:'Bursts into a thick smoke screen for 14 seconds. Bots cannot see through it. 2 grenades'};
UNL.Claymore=20;UNL.Smoke=8;
function ggGive(){const k=GG.lad[Math.min(GG.i,GG.lad.length-1)],w={k,...eff(k,[])};w.mag=w.m;w.rs=3;w.res=w.m*3;wp=[w];cur=0;rel=0;MV.eq=0;setGun();$('#ob').textContent=`GUN GAME  ·  weapon ${GG.i+1} / ${GG.lad.length}  ·  ${W[k].n}`}
{const _s=startGame;startGame=function(){const gg=sel.mode=='Gun Game';if(gg)sel.mode='Slayer';/* Gun Game runs on the Slayer rules (spawns, bots, respawns) with the ladder on top */try{_s.apply(this,arguments)}finally{if(gg)sel.mode='Gun Game'}
  GG.on=gg?1:0;CLAY.splice(0).forEach(c=>S.remove(c.g));SMK.splice(0).forEach(s=>s.sp.forEach(p=>S.remove(p)));if(!GG.on)return;GG.i=0;gc=0;ggGive();popup('GUN GAME','Every kill gives you the next weapon. Clear all 14 to win')}}
{const _fk=featKill;featKill=function(){_fk.apply(this,arguments);if(!GG.on||over)return;GG.i++;if(GG.i>=GG.lad.length){endGame('Victory');return}ggGive();popup('WEAPON '+(GG.i+1)+' / '+GG.lad.length,W[GG.lad[GG.i]].n);beep(660,.1,'triangle',.07);setTimeout(()=>beep(990,.15,'triangle',.07),90)}}
{const _rs=respawn;respawn=function(){const r=_rs.apply(this,arguments);if(GG.on)ggGive();return r}}
/* ---- claymores ---- */
var CLAY=[],SMK=[];
function clayPlace(){if(P.dead||gc<=0)return;if(CLAY.filter(c=>!c.dead).length>=4){msg('Four claymores are already down',1.2);return}gc--;const d=aimDir(),yaw=Math.atan2(d.x,d.z),x=P.x+d.x*1.1,z=P.z+d.z*1.1,y=P.y||0,g=new THREE.Group(),
  olive=new THREE.MeshLambertMaterial({color:0x4d5a34}),dk=new THREE.MeshLambertMaterial({color:0x1b1f14}),led=new THREE.MeshBasicMaterial({color:0xff2a1a}),grey=new THREE.MeshLambertMaterial({color:0x9aa09a}),add=(geo,mat,px,py,pz,sx,sy,sz,rx)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.scale.set(sx,sy,sz);if(rx)m.rotation.x=rx;g.add(m);return m};
  add(bg,olive,0,.1,0,.36,.11,.05);add(bg,olive,-.13,.1,.03,.11,.11,.05).rotation.y=.35;add(bg,olive,.13,.1,.03,.11,.11,.05).rotation.y=-.35;add(bg,dk,0,.105,.03,.3,.06,.012);add(bg,grey,0,.16,-.005,.12,.014,.045);add(bg,dk,0,.17,.02,.05,.01,.012);
  for(const sx of[-.15,.15]){const l=add(bg,dk,sx,.04,-.01,.012,.09,.012,.4);l.rotation.z=sx>0?.25:-.25}const lamp=add(sg,led,.0,.152,-.02,.02,.02,.02);
  g.position.set(x,y,z);g.rotation.y=yaw;S.add(g);const fan=[];for(const a of[-.45,0,.45]){const f=new THREE.Mesh(new THREE.PlaneGeometry(.015,5.2),new THREE.MeshBasicMaterial({color:0xff2a1a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));f.rotation.x=-Math.PI/2;f.rotation.z=a;f.position.set(Math.sin(a)*-2.6*-1,.1,2.6*Math.cos(a));f.position.x=Math.sin(a)*2.6;g.add(f);fan.push(f)}
  CLAY.push({g,x,y,z,yaw,t:0,lamp,led,fan,dead:0,own:1});beep(300,.08,'square',.05);setTimeout(()=>beep(450,.08,'square',.05),110);msg('Claymore down · '+gc+' left',1.2)}
function clayTick(dt,t){for(let i=CLAY.length-1;i>=0;i--){const c=CLAY[i];c.t+=dt;const armed=c.t>1.6;c.led.color.setRGB(armed?(Math.sin(c.t*5)>.6?2.6:.35):(Math.sin(c.t*20)>0?2.4:.2),.1,.08);for(const f of c.fan)f.material.opacity=armed?.35+.15*Math.sin(t*8):0;if(c.t<1.6&&Math.floor(c.t*4)!=Math.floor((c.t-dt)*4))beep(500+c.t*200,.03,'square',.03);
   if(!armed)continue;for(const b of bots){if(!b.al||b.net||b.zom||(typeof ally=='function'&&ally(b)))continue;const dx=b.x-c.x,dz=b.z-c.z,dd=Math.hypot(dx,dz);if(dd>5.2||dd<.3||Math.abs((b.y||0)-c.y)>2)continue;let da=Math.atan2(dx,dz)-c.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<.62){clayBlow(c,i);break}}}}
function clayBlow(c,i){c.dead=1;S.remove(c.g);CLAY.splice(i,1);boom(V(c.x,c.y+.3,c.z),{R:5.5,d:140,imp:0,c:0xffa040});beep(120,.2,'sawtooth',.1);burst(V(c.x,c.y+.3,c.z),30,0xffd890,9,.6,.12)}
/* ---- smoke ---- */
function smokeBurst(p){beep(180,.5,'sawtooth',.06);noise(.7,900,.35);if(SMK.length>=3){const o=SMK.shift();o.sp.forEach(q=>S.remove(q))}const {smoke}=LX.effectTextures(),sp=[];for(let i=0;i<26;i++){const m=new THREE.SpriteMaterial({map:smoke[i%smoke.length],rotation:Math.random()*Math.PI*2,transparent:true,depthWrite:false,opacity:0,color:0xc4c8cc}),s=new THREE.Sprite(m);s.position.set(p.x,Math.max(.4,p.y)+.3,p.z);s.userData={a:Math.random()*6.28,r:Math.random(),h:Math.random(),sp:.4+Math.random()*.9,sz:2.2+Math.random()*2.2};s.scale.setScalar(.5);S.add(s);sp.push(s)}SMK.push({x:p.x,y:Math.max(0,p.y),z:p.z,t:0,life:14,r:0,sp})}
function smokeTick(dt){for(let i=SMK.length-1;i>=0;i--){const s=SMK[i];s.t+=dt;const g=Math.min(1,s.t/2.2),fade=s.t>s.life-3?Math.max(0,(s.life-s.t)/3):1;s.r=4.4*(1-Math.pow(1-g,2))*(fade>0?1:0);
   for(const q of s.sp){const u=q.userData;u.a+=dt*.12*u.sp;const rr=s.r*(.25+.75*u.r);q.position.set(s.x+Math.cos(u.a)*rr,s.y+.6+u.h*3.2*g+Math.sin(s.t*.5+u.a)*.15,s.z+Math.sin(u.a)*rr);q.scale.setScalar(u.sz*(.5+.5*g)*1.5);q.material.opacity=.62*fade*Math.min(1,s.t/.5)}
   if(s.t>=s.life){s.sp.forEach(q=>{S.remove(q);q.material.dispose()});SMK.splice(i,1)}}}
/* bots cannot see through smoke: while the bots think, a ray that crosses a smoke cloud ends there as if it hit a wall (the player's bullets are not affected) */
var BOTPASS=0;{const _ub=updBots;updBots=function(){BOTPASS=1;try{return _ub.apply(this,arguments)}finally{BOTPASS=0}};
 const _cw=castW;castW=function(o,d,max){let r=_cw.apply(this,arguments);if(BOTPASS&&SMK.length)for(const s of SMK){if(s.r<1)continue;const ox=o.x-s.x,oy=o.y-(s.y+1.4),oz=o.z-s.z,b=ox*d.x+oy*d.y+oz*d.z,c=ox*ox+oy*oy+oz*oz-s.r*s.r*.8,h=b*b-c;if(h<0)continue;const tt=-b-Math.sqrt(h);if(tt<r&&(tt>0||c<0))r=Math.max(0,tt)}return r}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);if(run&&!paused){const t=performance.now()/1000;if(CLAY.length)clayTick(dt,t);if(SMK.length)smokeTick(dt)}}}

/* ===================== Call of Duty map tuning (each map keeps its own layout) =====================
   The rules the Call of Duty map designers describe, applied to what each map already is rather than to a template:
   simplicity (loose clutter is thinned out; structures, stairs and walls are never touched), cover in PAIRS on both sides of every objective so fights are head-on,
   a spawn shield in front of each team's base so the base is never in view from the far side of the map, and a measured check that no point on the map sees most of the rest.
   Every number comes from the map's own flags, zones and boxes. */
var MAPTUNE={Blockfort:{thin:4},Pillars:{thin:2},Canyon:{thin:4,wings:1},Suburbia:{thin:2},Boomtown:{thin:1},Rust:{thin:3,axis:'z',wings:1},Decay:{thin:5}};
function mapTune(name,cfg){const M=MAPS[name];if(!M||M.zm)return;const ob=M.b,od=M.deco;
 M.b=function(){const L=ob.call(this),rm=M._rm=[],top=L.filter(e=>e[4]>2.6&&(e[5]||0)<.5&&e[7]!='n'),touch=(e)=>{for(const t of top){if(Math.abs(e[0]-t[0])<(e[2]+t[2])/2+.7&&Math.abs(e[1]-t[1])<(e[3]+t[3])/2+.7)return true}return false};
  const out=[];let i=0;
  for(const e of L){const loose=e[4]<2.4&&e[4]>.3&&(e[5]||0)<.4&&Math.max(e[2],e[3])<5.6&&e[7]!='n'&&Math.abs(e[0])<M.H-2&&Math.abs(e[1])<M.H-2;
   if(loose&&cfg.thin>1&&!touch(e)){i++;if(i%cfg.thin!=0){rm.push([e[0]-e[2]/2-.25,e[1]-e[3]/2-.25,e[0]+e[2]/2+.25,e[1]+e[3]/2+.25]);continue}}out.push(e)}
  /* the map's own cover palette: the most common colour and surface among its low pieces, and among its walls */
  const mode=(f)=>{const c={};let best=null,n=0;for(const e of out){if(!f(e))continue;const k=e[6]+'|'+e[7];c[k]=(c[k]||0)+1;if(c[k]>n){n=c[k];best=e}}return best?[best[6],best[7]]:[0x777777,undefined]},cov=mode(e=>e[4]>.9&&e[4]<1.8&&Math.max(e[2],e[3])<4.6&&(e[5]||0)<.4),wal=mode(e=>e[4]>2.6&&e[4]<12&&(e[5]||0)<.4);
  const free=(x,z,w,d,m,ex)=>{if(Math.abs(x)>M.H-3||Math.abs(z)>M.H-3)return false;ex=ex==null?2.6:ex;for(const p of[...M.zn,...M.fb])if(Math.abs(x-p[0])<w/2+ex&&Math.abs(z-p[1])<d/2+ex)return false;for(const e of out){if(e[7]=='n'||(e[5]||0)>2.2)continue;if(e[4]<.3)continue;if(Math.abs(x-e[0])<(w+e[2])/2+m&&Math.abs(z-e[1])<(d+e[3])/2+m)return false}return true};
  const zax=cfg.axis=='z',add=(x,z,w,d,h,c,m,ex)=>{if(!free(x,z,w,d,m==null?.9:m,ex))return false;out.push([x,z,w,d,h,0,c[0],c[1]]);return true};
  /* paired cover at every Domination point: two pieces either side of the line between the teams, on both its sides */
  for(const[zx,zz]of M.zn)for(const s of[-1,1])for(const t of[-1,1]){const dx=zax?t*4.6:s*4.2,dz=zax?s*4.2:t*4.6;add(zx+dx,zz+dz,zax?1.2:2.5,zax?2.5:1.2,1.25,cov)}
  /* spawn shields: a wall between each team's base and the middle of the map, wide enough to break the line down the centre */
  for(const f of M.fb){const L_=Math.hypot(f[0],f[1])||1,vx=-f[0]/L_,vz=-f[1]/L_,qx=zax?1:0,qz=zax?0:1;let ok=false,sx_=0,sz_=0;for(const k of[6.5,5,8,4.2,9.5,3.4,11,13])for(const l of[0,3.2,-3.2,6,-6,9,-9]){if(ok)break;sx_=f[0]+vx*k+qx*l;sz_=f[1]+vz*k+qz*l;ok=add(sx_,sz_,zax?6.5:1.2,zax?1.2:6.5,3.1,wal,.45,1.9)}(M._tune=M._tune||[]).push(ok);
   /* open maps get wings: two shorter walls either side, a shallow U that closes the base off from the long sightlines */
   if(ok&&cfg.wings)for(const s of[-1,1])add(sx_+vx*2.2+qx*s*6.8,sz_+vz*2.2+qz*s*6.8,zax?4.6:1.2,zax?1.2:4.6,2.8,wal,.45,1.9)}
  /* drop the decorations that stood on thinned pieces */
  if(M._v)M._v=M._v.filter(e=>!(e[4]<2.3&&(e[5]||0)<.6&&rm.some(r=>e[0]>r[0]&&e[0]<r[2]&&e[1]>r[1]&&e[1]<r[3])));
  return out};
 M.deco=function(){const d=od?od.call(this):[],rm=M._rm||[];return d.filter(e=>!(e[4]<2.3&&(e[5]||0)<.6&&rm.some(r=>e[0]>r[0]&&e[0]<r[2]&&e[1]>r[1]&&e[1]<r[3])))}}
for(const k in MAPTUNE)mapTune(k,MAPTUNE[k]);


/* ===================== WEATHER: rain and thunder over Decay =====================
   The rain is ONE draw call: a LineSegments object whose drops fall inside a vertex shader (position = f(time), wrapped around the camera), so it costs no CPU per frame.
   Ground ripples are a second single draw call (animated points). The amount of rain follows the Graphics setting and the frame governor (LX.gTier thins it out).
   Thunder is soft and low (lowpass rumble, never above a whisper of the master volume); lightning briefly lifts the sun, the sky and the post-processing pulse. ===================== */
var WX={on:0,drops:null,rip:null,fl:0,next:7,pend:[],b0:[.85,.7],bolt:null,bt:0,sn:null,uC:{value:new THREE.Vector3()},uA:{value:1}};
function wxDispose(){for(const o of[WX.drops,WX.rip,WX.bolt]){if(!o)continue;if(o.parent)o.parent.remove(o);try{o.geometry.dispose();o.material.dispose()}catch(e){}}WX.drops=WX.rip=WX.bolt=null;WX.on=0}
function wxInit(M){wxDispose();if(sel.map!='Decay'||!mapG)return;
 const q=LX.q,n=q=='low'?1300:q=='med'?2500:4200,RAD=24,HGT=20;
 const pos=new Float32Array(n*6),sd=new Float32Array(n*4);
 for(let i=0;i<n;i++){const x=Math.random(),y=Math.random(),z=Math.random(),sp=.85+Math.random()*.4,ln=.5+Math.random()*.5;for(let e=0;e<2;e++){const j=(i*2+e);pos[j*3]=x;pos[j*3+1]=y;pos[j*3+2]=z;sd[j*2]=sp;sd[j*2+1]=e*ln}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(sd.subarray(0,n*4),2));
 const vs=`uniform float uT;uniform vec3 uC;attribute vec2 aS;varying float vA;
 void main(){float y=fract(position.y-uT*aS.x*1.15);vec2 u=fract(position.xz-uC.xz/${(RAD*2).toFixed(1)}+.5);vec3 p=vec3(uC.x+(u.x-.5)*${(RAD*2).toFixed(1)},y*${HGT.toFixed(1)}+.05,uC.z+(u.y-.5)*${(RAD*2).toFixed(1)});
 p.xz+=vec2(.09,.035)*(y*${HGT.toFixed(1)});p-=normalize(vec3(-.09,-1.,-.035))*(-aS.y*1.35);
 float dz=length(p.xz-uC.xz);vA=(1.-smoothstep(${(RAD*.45).toFixed(1)},${RAD.toFixed(1)},dz))*smoothstep(.0,.9,y*${HGT.toFixed(1)})*(.28+.22*aS.y);gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
 const fs=`varying float vA;uniform float uA;void main(){gl_FragColor=vec4(.74,.82,.92,vA*uA);}`;
 const mt=new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,fog:false,uniforms:{uT:LX.U.time,uC:WX.uC,uA:WX.uA}});
 const ls=new THREE.LineSegments(g,mt);ls.frustumCulled=false;ls.renderOrder=6;mapG.add(ls);WX.drops=ls;
 /* ripples on the ground */
 const m=q=='low'?90:q=='med'?150:240,rp=new Float32Array(m*3),rs=new Float32Array(m);for(let i=0;i<m;i++){rp[i*3]=Math.random();rp[i*3+1]=0;rp[i*3+2]=Math.random();rs[i]=Math.random()}
 const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(rp,3));g2.setAttribute('aR',new THREE.BufferAttribute(rs,1));
 const vs2=`uniform float uT;uniform vec3 uC;attribute float aR;varying float vA;
 void main(){float ph=fract(uT*.85+aR);vec2 u=fract(position.xz-uC.xz/36.+.5);vec3 p=vec3(uC.x+(u.x-.5)*36.,.06,uC.z+(u.y-.5)*36.);vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(ph*62./max(.5,-mv.z),1.,48.);vA=(1.-ph)*(1.-smoothstep(10.,18.,length(p.xz-uC.xz)))*.55;}`;
 const fs2=`varying float vA;uniform float uA;void main(){float d=length(gl_PointCoord-.5)*2.;float r=smoothstep(.62,.8,d)*(1.-smoothstep(.86,1.,d));gl_FragColor=vec4(.8,.88,.96,r*vA*uA);}`;
 const mt2=new THREE.ShaderMaterial({vertexShader:vs2,fragmentShader:fs2,transparent:true,depthWrite:false,fog:false,uniforms:{uT:LX.U.time,uC:WX.uC,uA:WX.uA}});
 const pt=new THREE.Points(g2,mt2);pt.frustumCulled=false;pt.renderOrder=6;mapG.add(pt);WX.rip=pt;
 WX.on=1;WX.fl=0;WX.next=5+Math.random()*6;WX.pend.length=0;WX.b0=[hemi.intensity,sun.intensity]}
/* the lightning bolt: a jagged line with a couple of forks, shown for a split second */
function wxBolt(){if(WX.bolt){mapG.remove(WX.bolt);WX.bolt.geometry.dispose();WX.bolt.material.dispose();WX.bolt=null}
 const a=Math.random()*6.283,d=70+Math.random()*60,bx=C.position.x+Math.cos(a)*d,bz=C.position.z+Math.sin(a)*d,pts=[];let x=bx,z=bz,y=95;
 const run_=(x0,y0,z0,y1,seg,j)=>{let px=x0,pz=z0;for(let i=0;i<seg;i++){const ny=y0+(y1-y0)*(i+1)/seg,nx=px+(Math.random()-.5)*j,nz=pz+(Math.random()-.5)*j;pts.push(px,y0+(y1-y0)*i/seg,pz,nx,ny,nz);px=nx;pz=nz}return[px,pz]};
 const[ex,ez]=run_(x,95,z,0,16,9);for(let f=0;f<2;f++){const k=30+Math.random()*40;run_(bx+(Math.random()-.5)*12,k,bz+(Math.random()-.5)*12,k-30-Math.random()*20,6,10)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));
 const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xdce8ff,transparent:true,opacity:1,fog:false,depthWrite:false}));l.frustumCulled=false;l.renderOrder=5;mapG.add(l);WX.bolt=l;WX.bt=.2;return d}
function wxThunder(delay,dist){setTimeout(()=>{try{if(!run||!WX.on)return;arenaSoundCaption('Thunder');if(!vol)return;ac=ac||new AudioContext();const c=ac,len=3.2,n=c.sampleRate*len,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);let l=0;
  for(let i=0;i<n;i++){l=l*.985+(Math.random()*2-1)*.06;const t=i/n,env=Math.pow(1-t,1.6)*(.6+.4*Math.sin(t*38+Math.sin(t*9)*3));a[i]=l*env*5}
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(260,c.currentTime);f.frequency.exponentialRampToValueAtTime(70,c.currentTime+len);f.Q.value=.7;
  const gv=Math.min(.12,.1*(1-Math.min(.8,dist/160)));g.gain.setValueAtTime(.0001,c.currentTime);g.gain.linearRampToValueAtTime(gv,c.currentTime+.12);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+len);s.connect(f);f.connect(g);g.connect(PlayerAudio.output(c,'ambience',true));s.start()}catch(e){}},delay)}
function wxSound(on){try{if(!on){if(WX.sn){const g=WX.sn.g;g.gain.setTargetAtTime(0,ac.currentTime,.3);const s=WX.sn.s;setTimeout(()=>{try{s.stop()}catch(e){}},1500);WX.sn=null}return}
 if(WX.sn){WX.sn.g.gain.setTargetAtTime(.028,ac.currentTime,.4);return}ac=ac||new AudioContext();const c=ac,n=c.sampleRate*2,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){p=p*.35+(Math.random()*2-1)*.65;a[i]=p}
 const s=c.createBufferSource(),hp=c.createBiquadFilter(),lp=c.createBiquadFilter(),g=c.createGain();s.buffer=b;s.loop=true;hp.type='highpass';hp.frequency.value=900;lp.type='lowpass';lp.frequency.value=6500;g.gain.value=.0001;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(PlayerAudio.output(c,'ambience',true));s.start();g.gain.setTargetAtTime(.028,c.currentTime,.6);WX.sn={s,g}}catch(e){}}
function wxTick(dt){const live=WX.on&&run&&!paused;if(!WX.on){if(WX.sn)wxSound(false);return}
 WX.uC.value.copy(C.position);WX.uA.value=LX.gTier>=3?.5:LX.gTier>=2?.75:1;
 wxSound(!!live);if(!live)return;
 WX.next-=dt;if(WX.next<=0){WX.next=8+Math.random()*14;WX.fl=1;WX.rep=Math.random()<.6?2:1;const d=wxBolt();wxThunder(300+d*9,d);if(LX.fx)LX.fx.pulse=Math.max(LX.fx.pulse,.5)}
 if(WX.fl>0){WX.fl=Math.max(0,WX.fl-dt*(WX.fl>.45?3:1.8));if(WX.fl<.25&&WX.rep>1){WX.rep--;WX.fl=.85;if(WX.bolt)WX.bt=.14}
  hemi.intensity=WX.b0[0]*(1+WX.fl*1.6);sun.intensity=WX.b0[1]*(1+WX.fl*2.2);if(typeof skyM!='undefined'&&skyM&&skyM.material)skyM.material.color.setScalar(1+WX.fl*.9);if(WX.fl==0){hemi.intensity=WX.b0[0];sun.intensity=WX.b0[1];if(skyM&&skyM.material)skyM.material.color.setScalar(1)}}
 if(WX.bolt){WX.bt-=dt;WX.bolt.material.opacity=Math.max(0,WX.bt*5)*(Math.random()<.3?.4:1);if(WX.bt<=0){mapG.remove(WX.bolt);WX.bolt.geometry.dispose();WX.bolt.material.dispose();WX.bolt=null}}}
{const _gm=gfxMap;gfxMap=function(M,list){const r=_gm.apply(this,arguments);try{wxInit(M)}catch(e){console.warn('weather',e)}return r}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{wxTick(dt)}catch(e){}}}

/* ===================== Zombies without health bars: a blood vignette tells you how hurt you are ===================== */
var ZBV={el:null,last:-1};
function zbvTick(){if(!ZBV.el){const e=document.createElement('div');e.id='zblood';const h=document.getElementById('hud');if(!h)return;h.appendChild(e);ZBV.el=e}
 const on=mode=='Zombies'&&run&&!P.dead,low=on?Math.max(0,Math.min(1,1-(P.hp/P.mhp)/.7)):0,q=Math.round(low*12)/12;if(q!==ZBV.last){ZBV.last=q;ZBV.el.style.opacity=q;ZBV.el.className=q>.6?'crit':''}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{zbvTick()}catch(e){}}}

/* ===================== EQUIPMENT: 5 new lethals and 5 new tacticals =====================
   Lethals  (E, and X with the Danger Zone wildcard): Frag, Impact, Semtex, Claymore + Burn Charge, Throwing Axe, Remote Charge, Wire Mine, Firebomb.
   Tacticals (Q, and X with the Strategist wildcard): Flashbang + Shock Grenade, Smoke Canister, Pulse Grenade, Intercept Pod, Cipher Spike.
   Every item has its own 3D model (also used by the loadout screen), its own thrown arc, its own effect and its own synthesized sounds; nothing is shared between them.
   They work in Multiplayer (against the bots) and in Zombies (against the undead). ===================== */
var EQN={
 Frag:{k:'L',old:1,n:2,t:'A classic fragmentation grenade. 3.5 second fuse.'},
 Impact:{k:'L',old:1,n:2,t:'Explodes the moment it touches an enemy or the ground.'},
 Semtex:{k:'L',old:1,n:2,t:'Sticks to whatever it hits, enemies included.'},
 Claymore:{k:'L',old:1,n:2,t:'A mine with a laser fan that goes off when an enemy walks in front of it. 4 down at once.'},
 'Burn Charge':{k:'L',n:2,t:'Sticks to anything and ignites after a second: a patch of molten fire that burns for 5 seconds. Hold a doorway.'},
 'Throwing Axe':{k:'L',n:3,t:'Silent and deadly: one hit kills. It sticks in walls and floors; walk over it to pick it back up.'},
 'Remote Charge':{k:'L',n:2,t:'Sticks where it lands. Press G (or the lethal key with none left) to set off every planted charge at once. 3 planted at a time.'},
 'Wire Mine':{k:'L',n:2,t:'Place it on a wall or the floor: it strings a laser tripwire and blows when anyone crosses it. 3 down at once.'},
 Firebomb:{k:'L',n:2,t:'A bottle of burning fuel: shatters on impact into a wide, spreading fire for 6 seconds.'},
 Flashbang:{k:'T',old:1,n:2,t:'Blinds and stuns enemies who see it go off.'},
 'Shock Grenade':{k:'T',n:2,t:'A thunderous blast wave: enemies in range are knocked back, staggered and slowed for 4 seconds.'},
 'Smoke Canister':{k:'T',old:1,n:2,t:'A thick smoke screen for 14 seconds. Bots cannot see through it, bullets still pass.'},
 'Pulse Grenade':{k:'T',n:2,t:'An electromagnetic pulse: shorts out every enemy nearby and arcs lightning between them.'},
 'Intercept Pod':{k:'T',n:2,t:'Deploys a ward for 25 seconds. It repels anything that gets close with a thumping pulse and pops incoming grenades.'},
 'Cipher Spike':{k:'T',n:2,t:'Hacks the area: every enemy around it is marked through walls for 12 seconds and takes 25% more damage.'}};
var EQL=Object.keys(EQN).filter(k=>EQN[k].k=='L'),EQT=Object.keys(EQN).filter(k=>EQN[k].k=='T');
Object.assign(UNL,{'Burn Charge':8,'Throwing Axe':14,'Remote Charge':20,'Wire Mine':26,Firebomb:32,'Shock Grenade':6,'Smoke Canister':10,'Pulse Grenade':18,'Intercept Pod':28,'Cipher Spike':38,Flashbang:1});delete UNL.Smoke;
/* ---- models ---- */
function eqModel(id){const M=c=>new THREE.MeshLambertMaterial({color:c}),E=(c,k)=>{const m=new THREE.MeshBasicMaterial({color:c});if(k)m.color.multiplyScalar(k);return m},g=new THREE.Group(),
 cy=(rt,rb,h,x,y,z,m,rx,rz,sg_)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,sg_||14),m);e.position.set(x,y,z);if(rx)e.rotation.x=rx;if(rz)e.rotation.z=rz;g.add(e);return e},
 bx=(w,h,d,x,y,z,m,rx,ry,rz)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);e.rotation.set(rx||0,ry||0,rz||0);g.add(e);return e},
 sp=(r,x,y,z,m,sx,sy,sz)=>{const e=new THREE.Mesh(sg,m);e.scale.set(r*(sx||1),r*(sy||1),r*(sz||1));e.position.set(x,y,z);g.add(e);return e},
 tr=(R,t,x,y,z,m,rx,rz)=>{const e=new THREE.Mesh(new THREE.TorusGeometry(R,t,8,22),m);e.position.set(x,y,z);e.rotation.x=rx==null?Math.PI/2:rx;if(rz)e.rotation.z=rz;g.add(e);return e},
 cn=(r,h,x,y,z,m,rx)=>{const e=new THREE.Mesh(new THREE.ConeGeometry(r,h,12),m);e.position.set(x,y,z);if(rx)e.rotation.x=rx;g.add(e);return e},
 st=M(0x8a9098),dk=M(0x1b1d21),P2=Math.PI/2;
 if(id=='Burn Charge'){const body=M(0x6a6e72),or=M(0xe0701a),cap=M(0x2a2c30);cy(.05,.05,.16,0,0,0,body);cy(.052,.052,.025,0,.03,0,or);cy(.052,.052,.025,0,-.03,0,or);cy(.05,.05,.014,0,.088,0,cap);cy(.05,.05,.014,0,-.088,0,cap);
  for(let i=0;i<8;i++){const a=i/8*6.283;bx(.006,.1,.004,Math.cos(a)*.05,0,Math.sin(a)*.05,dk)}cy(.02,.02,.03,0,.108,0,cap);tr(.022,.0035,.03,.116,0,st,0);cy(.034,.034,.006,0,-.095,0,E(0xff8a2a,1.6));bx(.02,.012,.07,.02,.12,0,st);
  const w=cy(.0025,.0025,.14,-.03,.19,0,M(0x9a3a1a),.4,.6)}
 else if(id=='Throwing Axe'){const wood=M(0x7a5230),wrap=M(0x25282a),head=new THREE.MeshLambertMaterial({color:0x9aa2aa});if(head.metalness!==undefined){head.metalness=.9;head.roughness=.28}
  cy(.014,.017,.34,0,0,0,wood,0,0,10);for(let i=0;i<6;i++)cy(.0185,.0185,.014,0,-.1-i*.02,0,wrap,0,0,10);cy(.021,.021,.02,0,-.185,0,wrap,0,0,10);tr(.014,.003,0,-.2,0,M(0x3a3d30),0);
  bx(.034,.06,.056,0,.14,.0,head);bx(.012,.1,.07,0,.15,.062,head,0,0,0);bx(.011,.09,.008,0,.15,.098,M(0xdfe4ea));bx(.034,.03,.05,0,.115,-.04,head);cn(.011,.06,0,.145,-.065,head,-P2);
  bx(.04,.012,.02,0,.108,0,dk);bx(.02,.02,.02,0,.165,0,dk)}
 else if(id=='Remote Charge'){const o=M(0x55603a),tp=M(0x2a2d2f),w=M(0xc4b27a);bx(.12,.045,.08,0,0,0,o);bx(.122,.01,.082,-.04,0,0,tp);bx(.122,.01,.082,.04,0,0,tp);bx(.04,.01,.04,.0,.027,0,tp);
  sp(.014,0,.04,.02,E(0xff2a1a,2)).userData.led=1;bx(.028,.02,.028,.04,.034,-.015,dk);cy(.003,.003,.1,-.045,.1,-.02,st);sp(.007,-.045,.152,-.02,E(0xff2a1a,1.6));
  for(let i=0;i<3;i++)cy(.004,.004,.1,-.03+i*.03,.02,.04,M([0xc0392b,0x2a6a3a,0xd4b52a][i]),P2,P2);bx(.06,.014,.003,-.01,.003,.041,w)}
 else if(id=='Wire Mine'){const o=M(0x3b422c),lens=E(0xff2218,2.2);bx(.1,.06,.045,0,0,0,o);bx(.104,.01,.049,0,.036,0,dk);bx(.04,.03,.01,0,.0,.026,dk);sp(.016,0,0,.03,lens,1,1,.5);tr(.02,.004,0,0,.03,st,0);
  for(const s of[-1,1]){cy(.004,.001,.06,s*.04,-.05,-.01,st,0,s*.2);bx(.012,.012,.012,s*.04,-.02,-.02,dk)}bx(.02,.012,.02,-.03,.04,0,E(0x2aff6a,1.4));bx(.012,.01,.012,.03,.038,0,E(0xffb020,1.6))}
 else if(id=='Firebomb'){const gl=new THREE.MeshLambertMaterial({color:0x3f7a4a,transparent:true,opacity:.62}),fuel=new THREE.MeshLambertMaterial({color:0xd8902a,transparent:true,opacity:.85}),cloth=M(0xc9b78a);
  cy(.036,.04,.15,0,0,0,gl);cy(.028,.036,.03,0,.088,0,gl);cy(.015,.028,.05,0,.12,0,gl);cy(.016,.016,.03,0,.158,0,gl);cy(.032,.036,.09,0,-.01,0,fuel);sp(.04,0,-.075,0,gl,1,.5,1);cy(.04,.04,.05,0,-.01,0,M(0xe8e0c8));
  cy(.008,.006,.07,0,.17,0,cloth);cn(.016,.07,0,.225,0,E(0xff9a24,2));cn(.01,.045,0,.23,0,E(0xffe28a,2.4));sp(.04,0,.23,0,E(0xff7a1a,.8),1,1.6,1).material.transparent=true}
 else if(id=='Shock Grenade'){const b=M(0x3a4a66),y=M(0xd9b421);cy(.045,.045,.13,0,0,0,b);cy(.047,.047,.02,0,.04,0,y);cy(.047,.047,.02,0,-.04,0,y);cy(.04,.045,.016,0,.073,0,dk);cy(.045,.04,.016,0,-.073,0,dk);
  for(let r=0;r<2;r++)for(let i=0;i<8;i++){const a=i/8*6.283+r*.39;bx(.012,.012,.006,Math.cos(a)*.0455,-.012+r*.036,Math.sin(a)*.0455,dk,0,P2-a,0)}
  cy(.014,.014,.022,0,.092,0,st);bx(.012,.006,.056,.012,.1,0,st);tr(.013,.0024,.034,.094,0,st,0)}
 else if(id=='Smoke Canister'){const b=M(0xc2c6c8),gr=M(0x4f8a4a);cy(.04,.04,.14,0,0,0,b);cy(.042,.042,.024,0,.02,0,gr);cy(.036,.04,.018,0,.08,0,dk);cy(.04,.036,.018,0,-.08,0,dk);
  for(let i=0;i<6;i++){const a=i/6*6.283;bx(.012,.012,.012,Math.cos(a)*.026,.095,Math.sin(a)*.026,dk)}cy(.012,.012,.02,0,.103,0,st);bx(.012,.006,.056,.012,.112,0,st);tr(.012,.0022,.032,.106,0,st,0);for(let i=0;i<5;i++)bx(.006,.01,.004,Math.cos(i*1.25)*.04,-.065,Math.sin(i*1.25)*.04,dk)}
 else if(id=='Pulse Grenade'){const core=E(0x4ab8ff,2),cu=M(0xb8672a);sp(.04,0,0,0,M(0x2a3040));sp(.028,0,0,0,core);for(let i=0;i<3;i++){const t=tr(.047,.0042,0,0,0,cu,i*P2/1.5);t.rotation.y=i*1.047}
  for(let i=0;i<12;i++){const a=i/12*6.283;bx(.004,.008,.006,Math.cos(a)*.0475,Math.sin(a)*.0475,0,E(0x7ad4ff,1.8),0,0,a)}cy(.022,.026,.024,0,.052,0,dk);bx(.012,.006,.05,.012,.07,0,st);tr(.012,.0022,.03,.064,0,st,0)}
 else if(id=='Intercept Pod'){const b=M(0x3a3f45),a=E(0x35e0a0,1.8);cy(.075,.085,.05,0,0,0,b);cy(.06,.075,.014,0,.03,0,M(0x6a7078));for(let i=0;i<6;i++){const an=i/6*6.283;sp(.016,Math.cos(an)*.056,.04,Math.sin(an)*.056,a,1,.7,1);cy(.009,.011,.02,Math.cos(an)*.056,.022,Math.sin(an)*.056,dk)}
  cy(.008,.008,.07,0,.07,0,st);{const dh=cy(.04,.012,.014,0,.108,0,M(0x6a7078),0,0,10);dh.rotation.x=.4;dh.userData.dish=1}sp(.012,0,.118,.012,a);cy(.003,.003,.07,.05,.07,-.03,st);sp(.006,.05,.108,-.03,E(0xff4a2a,1.8));tr(.082,.005,0,-.02,0,M(0x2a2d31),P2)}
 else if(id=='Cipher Spike'){const b=M(0x15171a),gn=E(0x39ff7a,1.8);cn(.03,.12,0,-.04,0,b,Math.PI);cy(.036,.036,.026,0,.03,0,b,0,0,10);for(let r=0;r<3;r++)for(let c=0;c<4;c++)bx(.006,.002,.006,-.012+c*.008,.0445,-.01+r*.008,gn);
  cy(.003,.003,.08,-.02,.08,0,st);cy(.003,.003,.06,.02,.07,0,st);sp(.005,-.02,.122,0,E(0xff3a3a,1.6));sp(.005,.02,.102,0,gn);tr(.04,.003,0,.016,0,M(0x2a6a4a))}
 else return null;
 return g}
/* ---- state, slots ---- */
var EQ={lc:[0,0],tc:[0,0],P:[],FZ:[],MN:[],CH:[],PD:[],RG:[],AR:[],hand:null,hud:null,hk:'',t:0,fsn:null,bt:0};
var hasWC=n=>Array.isArray(L.wc)&&L.wc.includes(n),tacName=i=>i==1?(L.t===undefined?'Flashbang':L.t):L.t2,
 foe=b=>b.al&&!b.net&&(b.zom||!(typeof ally=='function'&&ally(b))),eqC=()=>C.position.clone(),eqN=x=>x&&EQN[x]?EQN[x].n:0;
function eqDmg(b,d,head,name){src=name||'Equipment';srcK='';try{hitBot(b,d,head)}catch(e){}}
function eqSlot(i){if(i==0)return{n:LG(),get c(){return gc},set c(v){gc=v},k:'L'};if(i==2)return{n:tacName(1),get c(){return ST.tN},set c(v){ST.tN=v},k:'T'};
 if(hasWC('Danger Zone')&&L.g2)return{n:L.g2,get c(){return EQ.lc[1]},set c(v){EQ.lc[1]=v},k:'L'};if(hasWC('Strategist')&&L.t2)return{n:L.t2,get c(){return EQ.tc[1]},set c(v){EQ.tc[1]=v},k:'T'};return null}
function eqRefill(){if(EQ.hand){C.remove(EQ.hand.m);EQ.hand=null}const z=mode=='Zombies',a=eqN(LG()),b=eqN(tacName(1));gc=z?Math.max(gc,a):a;ST.tN=z?Math.max(ST.tN,b):b;EQ.lc[1]=hasWC('Danger Zone')?eqN(L.g2):0;EQ.tc[1]=hasWC('Strategist')?eqN(L.t2):0}
function eqInit(){for(const l of[EQ.P,EQ.FZ,EQ.MN,EQ.CH,EQ.PD,EQ.RG,EQ.AR])for(const o of l){try{S.remove(o.m)}catch(e){}}EQ.P=[];EQ.FZ=[];EQ.MN=[];EQ.CH=[];EQ.PD=[];EQ.RG=[];EQ.AR=[];eqRefill()}
/* ---- unique sounds ---- */
var eqS={
 osc(ty,f0,f1,d,g0,lp,dl){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(g0*vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);let n=o;if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(PlayerAudio.output(ac));o.start(t);o.stop(t+d+.03)}catch(e){}},
 nz(d,f0,f1,g0,type,q,dl){try{ac=ac||new AudioContext();const t=ac.currentTime+(dl||0),n=Math.max(64,Math.floor(ac.sampleRate*d)),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(g0*vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(PlayerAudio.output(ac));s.start(t)}catch(e){}},
 throw(){this.nz(.22,500,1400,.07,'bandpass',1.2)},
 axeThrow(){this.nz(.3,350,1100,.1,'bandpass',2);this.osc('sine',300,520,.18,.02)},
 axeHit(){this.osc('sine',150,55,.14,.2);this.nz(.1,900,300,.16,'lowpass');this.osc('sine',1950,1700,.5,.04,5000,.01);this.osc('triangle',2900,2400,.3,.02,6000,.01)},
 stick(){this.osc('sine',180,70,.07,.07);this.nz(.06,3000,900,.06,'highpass')},
 burn(){this.nz(.5,2200,500,.16,'bandpass',.6);this.osc('sine',110,50,.45,.12);this.nz(.9,300,120,.1,'lowpass',.5,.1)},
 glass(){for(let i=0;i<6;i++)this.nz(.09+Math.random()*.1,3000+Math.random()*4000,2500,.07,'bandpass',4,i*.012);this.nz(.45,420,150,.2,'lowpass',.5,.02);this.osc('sine',90,40,.4,.14,0,.02)},
 beepArm(n){for(let i=0;i<(n||2);i++)this.osc('sine',1700+i*260,1700+i*260,.05,.04,0,i*.11)},
 mineArm(){for(let i=0;i<3;i++)this.osc('triangle',700+i*220,700+i*220,.07,.05,0,i*.16)},
 trip(){this.osc('sine',3200,3000,.03,.07);this.osc('sine',600,200,.08,.06,0,.03)},
 shock(){this.osc('sine',95,38,.55,.4);this.nz(.35,1200,150,.28,'lowpass',.6);this.osc('sine',4200,4000,.7,.035,0,.05);this.osc('sine',60,30,.8,.25)},
 pulse(){this.osc('sawtooth',180,2600,.55,.05,5000);for(let i=0;i<7;i++)this.nz(.05,3000+Math.random()*3000,3000,.09,'highpass',1,.5+i*.05+Math.random()*.05);this.osc('sine',80,40,.5,.2,0,.52)},
 deploy(){this.osc('sine',160,420,.28,.035,1800);this.osc('sine',420,380,.08,.03,0,.28);this.nz(.15,2000,800,.06,'bandpass',1.5,.05)},
 ward(){this.osc('sine',230,70,.3,.22);this.nz(.25,900,200,.13,'lowpass',.7)},
 cipher(){for(let i=0;i<8;i++)this.osc('sine',1200+Math.random()*1800,1200+Math.random()*1800,.035,.035,0,i*.045)},
 bang(){this.osc('sine',80,30,.55,.3);this.nz(.4,800,120,.3,'lowpass',.6)}};
/* a roaring fire loop that follows the number of fires burning */
function eqFireSnd(n){try{if(!n&&!EQ.fsn)return;ac=ac||new AudioContext();const c=ac;if(!EQ.fsn){const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=b.getChannelData(0);let p=0;for(let i=0;i<a.length;i++){p=p*.9+(Math.random()*2-1)*.1;a[i]=p*(.55+.45*Math.sin(i/c.sampleRate*38+Math.sin(i/c.sampleRate*11)*4))*3}
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=900;g.gain.value=.0001;s.connect(f);f.connect(g);g.connect(PlayerAudio.output(c));s.start();EQ.fsn={s,g}}
 EQ.fsn.g.gain.setTargetAtTime(n?Math.min(.2,.09+n*.04)*vol:.0001,c.currentTime,.25);if(!n){const o=EQ.fsn;setTimeout(()=>{if(!EQ.FZ.length&&EQ.fsn===o){try{o.s.stop()}catch(e){}EQ.fsn=null}},1500)}}catch(e){}}
/* ---- helpers for visuals ---- */
var eqRing=(p,r0,r1,life,col,op)=>{const m=new THREE.Mesh(EQ.rg||(EQ.rg=new THREE.RingGeometry(.88,1,64)),new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:op}));m.position.copy(p);m.position.y=Math.max(.06,p.y);m.rotation.x=-Math.PI/2;m.scale.setScalar(r0);m.renderOrder=4;S.add(m);EQ.RG.push({m,a:0,L:life,r0,r1,op})},
 eqSp=(p,s0,s1,life,c,op,v,add,tex)=>{try{const H=JX.h;return H.addSp({p,s0,s1,life,c,op,tex:tex||H.flareTex,v,dr:.9,add})}catch(e){}},
 eqFlame=(p,sc)=>{eqSp(p,.25*sc,.7*sc,.5+Math.random()*.3,[3,1.15,.25],.7,V((Math.random()-.5)*.6,1.4+Math.random()*1.2,(Math.random()-.5)*.6))},
 eqArc=(a,b)=>{const pts=[],n=7;for(let i=0;i<=n;i++){const t=i/n,j=i==0||i==n?0:.35;pts.push(a.x+(b.x-a.x)*t+(Math.random()-.5)*j,a.y+(b.y-a.y)*t+(Math.random()-.5)*j,a.z+(b.z-a.z)*t+(Math.random()-.5)*j)}
  const g=new THREE.BufferGeometry();const seg=[];for(let i=0;i<n;i++)seg.push(pts[i*3],pts[i*3+1],pts[i*3+2],pts[i*3+3],pts[i*3+4],pts[i*3+5]);g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(seg),3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x9ad8ff,transparent:true,opacity:1,fog:false}));l.frustumCulled=false;S.add(l);EQ.AR.push({m:l,l:.18})};
/* ---- launching a thrown item ---- */
function eqThrowModel(name,spd,up,opts){const m=eqModel(name);if(!m)return;const d=aimDir(),p=eqC().add(d.clone().multiplyScalar(.55)).add(V(0,-.1,0)),v=d.clone().multiplyScalar(spd).add(V(0,up,0));m.position.copy(p);S.add(m);
 EQ.P.push({n:name,m,p,v,t:0,rest:0,st:0,sb:null,sp:V((Math.random()-.5)*6,(Math.random()-.5)*4,10+Math.random()*6),o:opts||{}});shake=Math.max(shake,.12)}
/* the viewmodel flourish: the item swoops up from the lower right, a short wind-up, then it leaves your hand */
function eqHandAnim(name,delay,fn){try{if(EQ.hand){C.remove(EQ.hand.m)}const m=eqModel(name)||new THREE.Group();m.scale.setScalar(1.1);C.add(m);EQ.hand={m,t:0,d:delay,fn,done:0}}catch(e){fn()}}
function eqUse(slot){if(P.dead||!run||paused)return;const sl=eqSlot(slot);if(!sl||!sl.n)return;const n=sl.n;
 if(n=='Remote Charge'&&sl.c<=0&&EQ.CH.length){eqDetonate();return}
 if(n=='Remote Charge'&&EQ.CH.length>=3){msg('3 charges planted: press G to detonate',1.3);return}
 if(sl.c<=0){msg((n)+': none left',1);return}
 if(sl.k=='T'&&ST.tacCd>0&&slot==2){}
 const def=EQN[n];if(def&&def.old){eqOld(slot,sl,n);return}
 const go=()=>{try{eqLaunchItem(n)}catch(e){console.warn('equipment',e)}};
 if(n=='Wire Mine'){if(!eqMine(sl))return;sl.c--;return}
 sl.c--;eqS.throw();eqHandAnim(n,.2,go);if(typeof haptic=='function')haptic(.35,120,.3,'both')}
/* the original items (Frag, Impact, Semtex, Claymore, Flashbang) go through the old code, with the counters swapped for the second slot */
function eqOld(slot,sl,n){if(sl.k=='L'){const sv=L.g,sg_=gc;if(slot==1){L.g=n;gc=EQ.lc[1]}else{}const r=throwG0();if(slot==1){EQ.lc[1]=gc;gc=sg_;L.g=sv}return r}
 if(n=='Smoke Canister'){sl.c--;eqS.throw();eqHandAnim(n,.18,()=>{const d=aimDir(),p=eqC().add(d.clone().multiplyScalar(.55)),m=eqModel(n);m.position.copy(p);S.add(m);grs.push({m,p,v:d.clone().multiplyScalar(18).add(V(0,3,0)),t:1.3,g:{R:0,d:0,smoke:1,fuse:1.3},bt:0,stuck:0});m.scale.setScalar(1)});return}
 const sv=ST.tN;if(slot==1)ST.tN=EQ.tc[1];actTactical0();if(slot==1){EQ.tc[1]=ST.tN;ST.tN=sv}}
function eqLaunchItem(n){const O={
 'Burn Charge':()=>eqThrowModel(n,15,3,{stk:1,fuse:1.1,kind:'burn'}),
 'Throwing Axe':()=>{eqS.axeThrow();eqThrowModel(n,34,1.4,{axe:1})},
 'Remote Charge':()=>eqThrowModel(n,14,3,{stk:1,kind:'c4'}),
 'Firebomb':()=>eqThrowModel(n,16,3.5,{shatter:1,kind:'fire'}),
 'Shock Grenade':()=>eqThrowModel(n,17,3,{fuse:1.6,kind:'shock'}),
 'Pulse Grenade':()=>eqThrowModel(n,16,3,{fuse:1.4,kind:'pulse'}),
 'Intercept Pod':()=>eqThrowModel(n,13,3,{deploy:1,kind:'pod'}),
 'Cipher Spike':()=>eqThrowModel(n,15,3,{deploy:1,kind:'cipher',stkG:1})};(O[n]||(()=>{}))()}
/* ---- the wire mine is placed, not thrown ---- */
function eqMine(sl){const o=eqC(),d=aimDir(),wl=castW(o,d,3.6);let p,dir;if(wl<3.5){p=o.clone().add(d.clone().multiplyScalar(wl-.08));p.y=Math.max(.2,Math.min(1.6,p.y));dir=V(-d.x,0,-d.z).normalize()}
 else if(d.y<-.12){const t=(.06-o.y)/d.y;if(t>3.6||t<0){msg('Look at a wall or the floor to place it',1.2);return false}p=o.clone().add(d.clone().multiplyScalar(t));p.y=.06;dir=V(d.x,0,d.z).normalize()}else{msg('Look at a wall or the floor to place it',1.2);return false}
 if(EQ.MN.length>=3){const f=EQ.MN.shift();S.remove(f.m);S.remove(f.l)}
 const m=eqModel('Wire Mine');m.position.copy(p);m.rotation.y=Math.atan2(dir.x,dir.z);m.scale.setScalar(1.35);S.add(m);
 const len=Math.min(7,castW(p.clone(),dir,7)),lm=new THREE.Mesh(bmG,new THREE.MeshBasicMaterial({color:0xff2a20,transparent:true,opacity:.0,depthWrite:false,blending:THREE.AdditiveBlending}));lm.scale.set(.007,len,.007);lm.position.copy(p).add(dir.clone().multiplyScalar(len/2));lm.quaternion.setFromUnitVectors(V(0,1,0),dir);S.add(lm);
 EQ.MN.push({m,l:lm,p,dir,len,t:0,own:1});eqS.stick();eqS.mineArm();burst(p.clone(),6,0xffa040,3,.25,.08);msg('WIRE MINE ARMED IN 1.5s',1.2);return true}
/* ---- detonate every planted remote charge ---- */
function eqDetonate(){if(!EQ.CH.length){return}const n=EQ.CH.length;for(const c of EQ.CH.splice(0)){S.remove(c.m);src='Remote Charge';srcK='';boom(c.p.clone(),{R:6.4,d:330,imp:0,c:0xffa040,own:0})}msg('DETONATED '+n+' CHARGE'+(n>1?'S':''),1.2);shake=Math.max(shake,.7);try{LX.fx.pulse=Math.max(LX.fx.pulse,.6)}catch(e){}}
/* ---- fire patches (Burn Charge, Firebomb) ---- */
function eqFire(p,R,dur,dps,big){const z={p:p.clone(),R,t:0,dur,dps,tk:0,em:0,fl:0};p.y=Math.max(.1,p.y);EQ.FZ.push(z);burst(p.clone(),20,0xff8a30,6,.5,.12);eqRing(p,.6,R*1.1,.5,0xff9a3a,.7);try{JX.flash(p.clone().add(V(0,.8,0)),0xff8a30,3,.5,R*5)}catch(e){}shake=Math.max(shake,big?.45:.3)}
/* ---- per-item landing and detonation ---- */
function eqLand(o){const k=o.o.kind,p=o.p;
 if(k=='burn'){}else if(k=='c4'){EQ.CH.push({m:o.m,p:p.clone(),sb:o.sb});eqS.stick();eqS.beepArm(2);msg('PLANTED ('+EQ.CH.length+')',1);o.dead='keep'}
 else if(k=='pod'||k=='cipher'){o.dep=0;o.rest=1}}
function eqBlast(o){const k=o.o.kind,p=o.p.clone();
 if(k=='fire'){eqS.glass();eqFire(p,3.5,6.5,36,1);return 1}
 if(k=='burn'){eqS.burn();eqFire(p,2.4,5,78,0);return 1}
 if(k=='shock'){eqS.shock();eqRing(p,.5,12,.7,0x9ad0ff,.9);eqRing(p,.3,8,.5,0xffffff,.6);burst(p.clone(),24,0xbfe0ff,10,.5,.12);try{JX.flash(p.clone().add(V(0,.5,0)),0x9ad0ff,3.5,.4,40)}catch(e){}
  let n=0;for(const b of bots){if(!foe(b))continue;const dx=b.x-p.x,dz=b.z-p.z,d=Math.hypot(dx,dz);if(d>12)continue;n++;const k_=1-d/12;b.stun=Math.max(b.stun||0,4*(.45+k_*.55));b.kb=(b.kb||0);try{b.x+=dx/(d||1)*k_*2.4;b.z+=dz/(d||1)*k_*2.4;if(b.m)b.m.position.set(b.x,0,b.z)}catch(e){}eqDmg(b,18*k_,0,'Shock Grenade')}
  const d=Math.hypot(P.x-p.x,P.z-p.z);if(d<12){shake=Math.max(shake,1-d/12);try{LX.fx.ca=1;LX.fx.pulse=Math.max(LX.fx.pulse,.9)}catch(e){}}if(n)msg(n+' STAGGERED',1.2);return 1}
 if(k=='pulse'){eqS.pulse();eqRing(p,.5,15,.6,0x5ac8ff,.9);eqRing(p,.3,9,.4,0xffffff,.6);const hit=[];for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-p.x,b.z-p.z)<15){hit.push(b);b.stun=Math.max(b.stun||0,4.5);eqDmg(b,b.zom?40:22,0,'Pulse Grenade')}}
  const pts=[p.clone().add(V(0,.6,0)),...hit.slice(0,7).map(b=>V(b.x,(b.y||0)+1.1,b.z))];for(let i=0;i<pts.length-1;i++){eqArc(pts[i],pts[i+1]);if(i<hit.length)burst(pts[i+1].clone(),8,0x9ad8ff,6,.3,.07)}for(let i=0;i<5;i++)eqArc(p.clone().add(V(0,.6,0)),p.clone().add(V((Math.random()-.5)*8,Math.random()*3,(Math.random()-.5)*8)));
  try{JX.flash(p.clone().add(V(0,.6,0)),0x7ad4ff,4,.45,40)}catch(e){}if(Math.hypot(P.x-p.x,P.z-p.z)<15){try{LX.fx.pulse=1;LX.fx.ca=1}catch(e){}}if(hit.length)msg(hit.length+' SHORTED OUT',1.2);return 1}
 return 0}
/* ---- one frame of everything ---- */
function eqTick(dt){EQ.t+=dt;if(!run||paused){return}
 /* hand animation */
 if(EQ.hand){const h=EQ.hand;h.t+=dt;const u=Math.min(1,h.t/h.d),w=Math.sin(Math.min(1,u*1.2)*Math.PI*.5);h.m.position.set(.28-.16*u,-.4+.18*Math.sin(u*Math.PI)+.14*u,-.34-.16*u);h.m.rotation.set(-1.1*u+.5,.3*u,.9*(1-u));if(h.t>=h.d&&!h.done){h.done=1;try{h.fn()}catch(e){console.warn(e)}C.remove(h.m);EQ.hand=null}}
 /* projectiles */
 for(let i=EQ.P.length-1;i>=0;i--){const o=EQ.P[i];o.t+=dt;if(o.dead){if(o.dead=='keep')EQ.P.splice(i,1);else{S.remove(o.m);EQ.P.splice(i,1)}continue}
  if(o.st){ /* stuck or resting */
   if(o.sb){if(!o.sb.al){o.st=0;o.sb=null;o.v.set(0,0,0)}else{o.p.set(o.sb.x,(o.sb.y||0)+1.1,o.sb.z);o.m.position.copy(o.p)}}
   if(o.st){const k=o.o.kind;
    if(o.o.axe){if(!o.sb&&Math.hypot(P.x-o.p.x,P.z-o.p.z)<1.5&&Math.abs(P.y-o.p.y+1)<2.2){gc=Math.min(gc+1,EQN['Throwing Axe'].n);const sl=eqSlot(0);if(sl&&sl.n!='Throwing Axe'&&EQ.lc[1]!==undefined&&hasWC('Danger Zone')&&L.g2=='Throwing Axe')EQ.lc[1]++;S.remove(o.m);EQ.P.splice(i,1);msg('AXE RECOVERED',1);eqS.stick();continue}
     if(o.t>40){S.remove(o.m);EQ.P.splice(i,1)}continue}
    if(o.o.kind=='burn'){o.fz=(o.fz||0)+dt;o.m.scale.setScalar(1+.12*Math.sin(o.fz*30));if(o.fz>=o.o.fuse){eqBlast(o);S.remove(o.m);EQ.P.splice(i,1);continue}}
    else if(o.o.kind=='pod'||o.o.kind=='cipher'){o.dt=(o.dt||0)+dt;
     if(!o.dep&&o.dt>.5){o.dep=1;o.dt=0;eqS.deploy();if(o.o.kind=='cipher'){eqCipher(o)}else{EQ.PD.push({m:o.m,p:o.p.clone(),t:0,pt:1.5,dish:o.m.children.find(c=>c.userData.dish)});o.dead='keep'}if(o.o.kind=='cipher')o.life=12}
     if(o.dep&&o.o.kind=='cipher'){o.m.rotation.y+=dt*2;o.m.children.forEach((c,ci)=>{});if(o.life!=null){o.life-=dt;if(Math.random()<dt*10)eqSp(o.p.clone().add(V(0,.1,0)),.1,.3,.5,[.4,3,.9],.8,V((Math.random()-.5),1.2,(Math.random()-.5)));if(o.life<=0){S.remove(o.m);EQ.P.splice(i,1)}}}}
    continue}}
  /* flight */
  o.v.y-=(o.o.axe?10:20)*dt;const np=o.p.clone().add(o.v.clone().multiplyScalar(dt));let hitW=false,hitF=false;
  if(np.y<.13){np.y=.13;hitF=true}
  hitW=MAPS[sel.map].boardRay?lockboxEquipmentHit(o.p,np):bx.some(b=>np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y<b.h&&np.y>(b.y0||0));
  /* enemy contact */
  let hb=null;for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-np.x,b.z-np.z)<.75&&np.y<(b.y||0)+2.1&&np.y>(b.y||0)){hb=b;break}}
  const spd=o.v.length();
  if(o.o.axe){o.m.rotation.x+=dt*(hitF||hitW?0:18);
   if(hb){const head=np.y>(hb.y||0)+1.55;eqDmg(hb,head?220:150,head,'Throwing Axe');eqS.axeHit();burst(np.clone(),10,0xb51818,5,.4,.09);msg(head?'HEADSHOT AXE':'AXE HIT',1);o.st=1;o.sb=null;o.p.copy(np);o.dead=1;continue}
   if(hitW||hitF){o.p.copy(hitW?o.p:np);o.v.set(0,0,0);o.st=1;eqS.axeHit();burst(o.p.clone(),6,0xcccccc,3,.25,.07);o.m.rotation.set(hitF?-.4:0,o.m.rotation.y,hitF?0:0);o.m.position.copy(o.p);continue}
   o.m.lookAt(o.p.clone().add(o.v));o.m.rotateX(Math.PI/2);o.m.rotateY(o.t*20)}
  else{o.m.rotation.x+=dt*o.sp.x;o.m.rotation.y+=dt*o.sp.y;o.m.rotation.z+=dt*.5*o.sp.z;
   if(o.o.shatter&&(hitF||hitW||hb)){eqBlast(o);S.remove(o.m);EQ.P.splice(i,1);continue}
   if(o.o.stk){if(hb){o.st=1;o.sb=hb;o.v.set(0,0,0);np.set(hb.x,(hb.y||0)+1.1,hb.z);o.p.copy(np);o.m.position.copy(np);burst(np.clone(),8,0xff5522,3,.3,.1);msg('STUCK!',1);eqLand(o);continue}
    if(hitW||hitF){o.st=1;o.v.set(0,0,0);if(hitW)np.copy(o.p);o.p.copy(np);o.m.position.copy(np);burst(np.clone(),6,0xffa040,3,.25,.08);eqS.stick();eqLand(o);continue}}
   else if(o.o.deploy||o.o.fuse){if(hitF){np.y=.13;o.v.y*=-.3;o.v.x*=.55;o.v.z*=.55;if(Math.abs(o.v.y)<1.2&&Math.hypot(o.v.x,o.v.z)<1.5){if(o.o.deploy){o.st=1;o.v.set(0,0,0);o.p.copy(np);o.m.position.set(np.x,.1,np.z);eqLand(o);continue}}}
    if(hitW){o.v.x*=-.35;o.v.z*=-.35;np.copy(o.p)}
    if(o.o.fuse&&o.t>=o.o.fuse){o.p.copy(np);eqBlast(o);S.remove(o.m);EQ.P.splice(i,1);continue}}}
  o.p.copy(np);o.m.position.copy(np)}
 /* fire patches */
 let burning=0;for(let i=EQ.FZ.length-1;i>=0;i--){const z=EQ.FZ[i];z.t+=dt;z.tk-=dt;z.em-=dt;burning++;const fade=Math.min(1,(z.dur-z.t)/1.2);
  if(z.em<=0){z.em=.045;for(let k=0;k<2;k++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*z.R*.92;eqFlame(z.p.clone().add(V(Math.cos(a)*r,.1,Math.sin(a)*r)),(.7+Math.random()*.7)*fade)}if(Math.random()<.3)eqSp(z.p.clone().add(V((Math.random()-.5)*z.R,.8,(Math.random()-.5)*z.R)),.4,1.4,1.2,[.25,.24,.22],.35,V(0,1,0),false,JX.h.puffTex)}
  z.fl-=dt;if(z.fl<=0){z.fl=.12;try{JX.flash(z.p.clone().add(V(0,.8,0)),0xff8a30,2+Math.random(),.2,z.R*5)}catch(e){}}
  if(z.tk<=0){z.tk=.25;for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-z.p.x,b.z-z.p.z)<z.R&&Math.abs((b.y||0)-z.p.y)<2.4){eqDmg(b,z.dps*.25,0,'Fire');b.burn=2.2}}
   if(!P.dead&&Math.hypot(P.x-z.p.x,P.z-z.p.z)<z.R*.9&&Math.abs(P.y-z.p.y)<1.6){hurt(z.dps*.25*.28,null);if(Math.random()<.4)beep(200,.05,'sawtooth',.03)}}
  if(z.t>=z.dur){EQ.FZ.splice(i,1)}}
 eqFireSnd(burning);
 /* anyone on fire keeps burning for a moment */
 for(const b of bots){if(b.burn>0){b.burn-=dt;b.bt=(b.bt||0)-dt;if(b.bt<=0&&b.al){b.bt=.4;eqDmg(b,10,0,'Fire')}if(b.al&&Math.random()<dt*14)eqFlame(V(b.x+(Math.random()-.5)*.4,(b.y||0)+.6+Math.random()*1.1,b.z+(Math.random()-.5)*.4),.45)}}
 /* wire mines */
 for(let i=EQ.MN.length-1;i>=0;i--){const m=EQ.MN[i];m.t+=dt;const armed=m.t>1.5;m.l.material.opacity=armed?.55+.25*Math.sin(EQ.t*30):(Math.floor(m.t*8)%2?.18:0);
  if(armed){for(const b of bots){if(!foe(b))continue;const rx=b.x-m.p.x,rz=b.z-m.p.z,t=rx*m.dir.x+rz*m.dir.z;if(t<0||t>m.len)continue;if(Math.abs(rx*m.dir.z-rz*m.dir.x)<.5&&(b.y||0)<m.p.y+1.2){eqS.trip();const p=m.p.clone();S.remove(m.m);S.remove(m.l);EQ.MN.splice(i,1);src='Wire Mine';srcK='';boom(p.clone().add(m.dir.clone().multiplyScalar(t*.5)),{R:4.6,d:220,imp:0,c:0xffa040,own:0});break}}}}
 /* remote charges blink */
 for(const c of EQ.CH){if(c.sb){if(!c.sb.al)c.sb=null;else{c.p.set(c.sb.x,(c.sb.y||0)+1.1,c.sb.z);c.m.position.copy(c.p)}}const on=Math.floor(EQ.t*3)%2,led=c.m.children.find(x=>x.userData.led);if(led&&led.material)led.material.color.setRGB(on?2.4:.25,on?.2:0,on?.1:0)}
 /* intercept pods: a thumping ward that repels and pops incoming grenades */
 for(let i=EQ.PD.length-1;i>=0;i--){const d=EQ.PD[i];d.t+=dt;d.pt-=dt;const rise=Math.min(1,d.t/.6);if(d.dish)d.dish.position.y=.108+.04*rise,d.dish.rotation.y+=dt*(2+rise*5);d.m.scale.setScalar(1+.04*Math.sin(d.t*8));
  for(const g of grs){if(g.g&&g.g.R>0&&g.own!==1&&g.p.distanceTo(d.p)<6&&!g.pop){g.pop=1;eqArc(d.p.clone().add(V(0,.3,0)),g.p.clone());burst(g.p.clone(),14,0x6affc8,7,.35,.09);g.t=-1;g.g={...g.g,R:0,d:0}}}
  if(d.pt<=0){let any=0;for(const b of bots){if(!foe(b))continue;const dx=b.x-d.p.x,dz=b.z-d.p.z,dd=Math.hypot(dx,dz);if(dd<4){any=1;b.stun=Math.max(b.stun||0,.9);try{b.x+=dx/(dd||1)*1.6;b.z+=dz/(dd||1)*1.6;if(b.m)b.m.position.set(b.x,0,b.z)}catch(e){}eqDmg(b,b.zom?28:20,0,'Intercept Pod')}}
   if(any){d.pt=1.6;eqS.ward();eqRing(d.p,.4,4.2,.45,0x6affc8,.85);burst(d.p.clone().add(V(0,.3,0)),12,0x6affc8,5,.3,.08);shake=Math.max(shake,.12)}else d.pt=.2}
  if(d.t>25){S.remove(d.m);EQ.PD.splice(i,1)}}
 /* cipher marks */
 for(const b of bots){if(b.cph>0){b.cph-=dt;if(!b.cmk){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:JX.h.flareTex,color:0x39ff7a,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));s.scale.set(.5,.5,1);s.position.set(0,2.35,0);s.renderOrder=9;(b.m||S).add(s);b.cmk=s}b.cmk.visible=b.al;b.cmk.scale.setScalar(.42+.08*Math.sin(EQ.t*9))}
  else if(b.cmk){(b.m||S).remove(b.cmk);b.cmk.material.dispose();b.cmk=null}}
 /* rings and arcs */
 for(let i=EQ.RG.length-1;i>=0;i--){const r=EQ.RG[i];r.a+=dt;const u=r.a/r.L;r.m.scale.setScalar(r.r0+(r.r1-r.r0)*(1-Math.pow(1-u,2.2)));r.m.material.opacity=r.op*(1-u);if(u>=1){S.remove(r.m);r.m.material.dispose();EQ.RG.splice(i,1)}}
 for(let i=EQ.AR.length-1;i>=0;i--){const a=EQ.AR[i];a.l-=dt;a.m.material.opacity=Math.max(0,a.l*6);if(a.l<=0){S.remove(a.m);a.m.geometry.dispose();a.m.material.dispose();EQ.AR.splice(i,1)}}
 eqHud()}
/* the cipher spike hacks everything near it */
function eqCipher(o){const p=o.p.clone();eqS.cipher();eqRing(p,.5,20,.9,0x39ff7a,.8);eqRing(p,.3,14,.7,0xffffff,.5);let n=0;for(const b of bots){if(!foe(b))continue;if(Math.hypot(b.x-p.x,b.z-p.z)<20){b.cph=12;n++;if(b.al)burst(V(b.x,(b.y||0)+1.2,b.z),6,0x39ff7a,3,.3,.06)}}msg(n?'CIPHER: '+n+' MARKED':'CIPHER: nobody in range',1.6);try{LX.fx.pulse=Math.max(LX.fx.pulse,.4)}catch(e){}}
/* marked enemies take 25% more damage */
{const _hb=hitBot;hitBot=function(b,d,head,scale){if(b&&b.cph>0)d*=1.25;return _hb.call(this,b,d,head,scale)}}
/* ---- HUD: lethal [E], second [X], tactical [Q] ---- */
function eqHud(){if(!EQ.hud){const h=document.getElementById('hud');if(!h)return;const e=document.createElement('div');e.id='eqhud';h.appendChild(e);EQ.hud=e}
 const row=(key,sl)=>{if(!sl||!sl.n)return'';const c=sl.c,lab=(typeof ctlKey=='function'?ctlKey(key):key);return `<div class="eq ${c<=0?'out':''}"><kbd>${lab}</kbd><b>${sl.n}</b><i>${'●'.repeat(Math.max(0,Math.min(c,4)))||'—'}</i></div>`};
 const x=eqSlot(1),html=run?row('lethal',eqSlot(0))+row('x',x)+row('tactical',eqSlot(2))+(EQ.CH.length?`<div class="eq det"><kbd>${typeof ctlKey=='function'?ctlKey('det'):'G'}</kbd><b>DETONATE</b><i>${EQ.CH.length}</i></div>`:''):'';
 if(html!==EQ.hk){EQ.hk=html;EQ.hud.innerHTML=html}}

/* ---- wiring: the old keys now go through the equipment system ---- */
for(const k of EQL)if(!GR[k])GR[k]={fuse:1,R:0,d:0,imp:0,t:EQN[k].t};delete GR.Smoke;
{const _s=startGame;startGame=function(){const r=_s.apply(this,arguments);try{eqInit()}catch(e){console.warn('equipment',e)}return r}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{eqTick(dt)}catch(e){console.warn('eqTick',e)}}}
{const _ob=objBuild;objBuild=function(id){const m=eqModel(id);return m||_ob(id)}}
addEventListener('keydown',e=>{if(!e.repeat&&run&&!paused&&!over&&(typeof RB=='function'?RB(e.code):e.code)=='KeyG')eqDetonate()});


/* ===================== prompts that follow your input: the key you actually bound, or the button of the controller you actually use =====================
   Every on-screen prompt (the Zombies buy prompt, hints, popups, the equipment HUD, kbd tags) asks ctlKey(action). With a controller (connected, or chosen in Settings) it is the pad glyph for the pad type
   (Xbox, PlayStation, Nintendo...), otherwise the keyboard key from the Controls section, including rebinds. */
function keyLabel(c){if(!c)return'?';const m={ShiftLeft:'Shift',ShiftRight:'Shift',ControlLeft:'Ctrl',ControlRight:'Ctrl',AltLeft:'Alt',AltRight:'Alt',Space:'Space',Tab:'Tab',Enter:'Enter',Backquote:'`',Minus:'-',Equal:'=',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backslash:'\\',Unbound:'-',Mouse0:'LMB',Mouse1:'MMB',Mouse2:'RMB'};if(m[c])return m[c];return c.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'Num ').replace(/^Arrow/,'')}
function ctlKey(a){if(a=='gum')return(typeof PG!='undefined'&&PG.on)?'D-Pad ←':keyLabel((function(){try{return bindOf('gum')}catch(e){return'KeyJ'}})());const map={tactical:'tact',lethal:'lethal',x:'field',field:'field',det:'det',use:'use',melee:'melee',reload:'reload',crouch:'crouch',jump:'jump',mount:'mount',mode:'fmode',nv:'nv',map:'map',sb:'sb'};
 if(typeof PG!='undefined'&&PG.on){const d=PG.A[a=='x'?'field':a];if(d)return(d.h?'hold ':'')+PG.b(d.b)}
 const id=map[a]||a;try{return keyLabel(bindOf(id))}catch(e){const d={tact:'Q',lethal:'E',field:'X',det:'G',use:'F',melee:'V',reload:'R',crouch:'C',jump:'Space'};return d[id]||id}}


/* ===================== NO 8-BIT SOUNDS, EVER =====================
   Square waves are what makes a game sound like a 1985 arcade. They are gone from the whole game: any oscillator asked to be a square wave becomes a soft triangle, and beep() is rebuilt with a click-free attack,
   a gentle low-pass and a smaller pitch fall, so even the old blips read as clean modern UI sounds instead of chip music. */
{const d=Object.getOwnPropertyDescriptor(OscillatorNode.prototype,'type');if(d&&d.set&&!OscillatorNode.prototype.__ns){OscillatorNode.prototype.__ns=1;Object.defineProperty(OscillatorNode.prototype,'type',{get:d.get,set(v){d.set.call(this,v==='square'?'triangle':v)},configurable:true})}}
beep=function(f,d,ty,v){try{ac=ac||new AudioContext();const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type=ty==='square'||!ty?'triangle':ty;lp.type='lowpass';lp.frequency.value=Math.min(9000,Math.max(900,f*5));
 o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.62),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime((v||.05)*vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(lp);lp.connect(g);g.connect(PlayerAudio.output(ac));o.start(t);o.stop(t+d+.02)}catch(e){}};

/* ===================== PACK-A-PUNCH SHOTS SOUND LIKE SCI-FI =====================
   Every Pack-a-Punched weapon fires through a small sci-fi chain: an FM zap (a sine whose pitch is bent by a second sine), a glassy shimmer, a chest thump, an air whoosh and a feedback echo that gives it a metallic tail.
   Tier I is a bright plasma zap, tier II adds a deep sub and crystal ping, tier III (Void Seraph) adds a falling sub-drop and a rising pre-swell. Speed and weight follow the weapon (pistols snappy, shotguns and launchers heavy, snipers long). Nothing retro: sines, triangles and filtered noise only. */
var PAPS={bus:null};
function papBus(){if(PAPS.bus&&PAPS.bus.c===ac)return PAPS.bus;ac=ac||new AudioContext();const c=ac,inp=c.createGain(),dl=c.createDelay(.5),dl2=c.createDelay(.5),fb=c.createGain(),lp=c.createBiquadFilter(),wet=c.createGain(),g2=c.createGain();
 dl.delayTime.value=.047;dl2.delayTime.value=.083;fb.gain.value=.36;lp.type='lowpass';lp.frequency.value=3600;wet.gain.value=.42;g2.gain.value=.5;inp.connect(PlayerAudio.output(c));inp.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(wet);dl.connect(dl2);dl2.connect(g2);g2.connect(wet);wet.connect(PlayerAudio.output(c));return PAPS.bus={c,inp}}
function papSnd(w,accent){try{const tier=Math.min(3,w.pap||1),b=papBus(),c=b.c,t=c.currentTime,v=vol*(accent?.55:1),heavy=w.pel>1||['SG','RL','SN','LMG'].includes(w.k),dur=Math.max(.1,Math.min(.5,(w.r||.1)*1.7+(heavy?.12:0))),pv=1+(Math.random()-.5)*.06,
  f0=(heavy?430:760)*(tier==1?1:tier==2?.86:.72)*pv,out=b.inp;
 const osc=(ty,fa,fb_,d,g0,dl,lpf)=>{const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(fa,t+dl);o.frequency.exponentialRampToValueAtTime(Math.max(20,fb_),t+dl+d);g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);let n=o;if(lpf){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lpf;o.connect(f);n=f}n.connect(g);g.connect(out);o.start(t+dl);o.stop(t+dl+d+.03);return o};
 const fm=(fc,fe,d,g0,ratio,depth,dl)=>{const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain();car.type='sine';mod.type='sine';car.frequency.setValueAtTime(fc,t+dl);car.frequency.exponentialRampToValueAtTime(Math.max(20,fe),t+dl+d);mod.frequency.setValueAtTime(fc*ratio,t+dl);mod.frequency.exponentialRampToValueAtTime(Math.max(20,fe*ratio),t+dl+d);mg.gain.setValueAtTime(depth,t+dl);mg.gain.exponentialRampToValueAtTime(1,t+dl+d);mod.connect(mg);mg.connect(car.frequency);
  g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);car.connect(g);g.connect(out);car.start(t+dl);mod.start(t+dl);car.stop(t+dl+d+.03);mod.stop(t+dl+d+.03)};
 const nz=(d,fa,fb_,g0,type,q,dl)=>{const n=Math.floor(c.sampleRate*d),bf=c.createBuffer(1,n,c.sampleRate),a=bf.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=bf;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(fa,t+dl);f.frequency.exponentialRampToValueAtTime(Math.max(30,fb_),t+dl+d);g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(g0*v,t+dl+Math.min(.02,d*.3));g.gain.exponentialRampToValueAtTime(.0001,t+dl+d);s.connect(f);f.connect(g);g.connect(out);s.start(t+dl)};
 fm(f0*2.8,f0*.55,dur*.9,.085,1.5,f0*(2.2+tier*.7),tier==3?.05:0);
 osc('triangle',f0*4.02,f0*3.7,dur*1.3,.022,tier==3?.05:0,7000);osc('triangle',f0*4.0,f0*3.62,dur*1.3,.022,tier==3?.05:0,7000);
 osc('sine',heavy?150:200,heavy?40:52,heavy?.3:.15,.11+tier*.03,tier==3?.05:0);
 nz(dur,6500,900,.08,'bandpass',.9,tier==3?.05:0);
 if(tier>=2){osc('sine',f0*7.2,f0*6.6,dur*1.6,.016,.01);osc('sine',heavy?96:130,heavy?32:42,.4,.12,.01)}
 if(tier>=3){nz(.05,400,5200,.06,'highpass',.7,0);osc('sine',70,26,.5,.2,.05);osc('sine',f0*1.01,f0*.5,dur*1.6,.03,.06)}
 if(accent)return}catch(e){}}

/* ===================== GAME FEEL: guns that hit back, kills that pay off, zombies that live =====================
   Guns: every shot adds a low chest thump, a short room tail, a puff of muzzle smoke, a flicker of camera roll and a nudge of the viewmodel; every hit and kill has its own confirmation sound and a
   hit-stop (a couple of frames of slow motion) on headshot kills, plus a combo counter with a rising chime for chained kills.
   Movement: coyote time, jump buffering, variable jump height and landings that thud as hard as you fall (patched into phys() and the landing code).
   Zombies: each one has its own voice (formant-synthesised groans, snarls, screams, grunts and death rattles, positioned in the stereo field and muffled by distance), heavy footfalls, an emergence from the ground when it spawns,
   flickering eyes, sudden head twitches, and the world around them breathes (distant moans, wind, creaks, a heartbeat when you are hurt). Everything is sines, filtered sawtooth through formants, and noise: nothing retro. ===================== */
var FL={k0:0,h0:0,combo:0,ct:0,el:null,amb:5,hb:0,vn:0,rt:0,bus:null,lastShot:0,smk:0};
function flBus(){if(FL.bus&&FL.bus.c===ac)return FL.bus;ac=ac||new AudioContext();const c=ac,cp=c.createDynamicsCompressor();cp.threshold.value=-20;cp.ratio.value=4;cp.attack.value=.004;cp.release.value=.2;cp.connect(PlayerAudio.output(c));return FL.bus={c,out:cp}}
function flTone(f0,f1,d,g,dl,ty,lp){try{const{c,out}=flBus(),t=c.currentTime+(dl||0),o=c.createOscillator(),gg=c.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.01,d*.2));gg.gain.exponentialRampToValueAtTime(.0001,t+d);let n=o;if(lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(gg);gg.connect(out);o.start(t);o.stop(t+d+.03)}catch(e){}}
function flNoise(d,f0,f1,g,type,q,dl){try{const{c,out}=flBus(),t=c.currentTime+(dl||0),n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),gg=c.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);gg.gain.setValueAtTime(.0001,t);gg.gain.linearRampToValueAtTime(g*vol,t+Math.min(.015,d*.25));gg.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(gg);gg.connect(out);s.start(t)}catch(e){}}
/* ---- movement ---- */
function feelJump(){flNoise(.14,420,950,.035,'bandpass',1.2);try{fk=Math.max(fk,.25)}catch(e){}}
function feelLand(fv){if(fv<2.2)return;flTone(95,42,.14,Math.min(.24,.05+fv*.013),0,'sine');flNoise(.1,700,200,Math.min(.14,.03+fv*.008),'lowpass',.7);if(fv>3.5)burst(V(P.x,.12,P.z),Math.min(16,4+Math.floor(fv)),0xb8a890,2+fv*.25,.5,.1);if(fv>7){shake=Math.max(shake,Math.min(.7,fv*.04));cRoll+=(Math.random()-.5)*.05;try{LX.fx.pulse=Math.max(LX.fx.pulse,.3)}catch(e){}}}
/* ---- one shot ---- */
function feelShot(){if(P.sp>t0)P.sp=0;const w=cw();if(!w||w.k=='TEA')return;const rc=Math.max(.4,w.rc||1),heavy=w.pel>1||['SG','SN','RL'].includes(w.k);
 flTone(heavy?120:150,heavy?36:46,heavy?.2:.1,(heavy?.13:.075)+Math.min(.05,rc*.008),0,'sine');
 flNoise(heavy?.28:.14,heavy?900:1800,heavy?120:300,heavy?.05:.03,'lowpass',.6,.012);
 gun.position.z+=.012+rc*.005;gun.position.x+=(Math.random()-.5)*.006;cRoll+=(Math.random()-.5)*.012*rc;try{LX.fx.shot=Math.max(LX.fx.shot||0,.6)}catch(e){}
 FL.smk-=1;if(FL.smk<=0){FL.smk=3;try{const H=JX.h,p=C.position.clone().add(aimDir().multiplyScalar(.9)).add(V(.07,-.07,0));H.addSp({p,s0:.08,s1:.34,life:.7,c:[.8,.8,.8],op:.2,tex:H.puffTex,add:false,v:V((Math.random()-.5)*.3,.5,(Math.random()-.5)*.3),dr:.88})}catch(e){}}}
{const _sh=shoot;shoot=function(){const r=_sh.apply(this,arguments);try{feelShot()}catch(e){}return r}}
/* ---- hit and kill confirmation, combo ---- */
function flCombo(n){if(!FL.el){const e=document.createElement('div');e.id='combo';const h=document.getElementById('hud');if(!h)return;h.appendChild(e);FL.el=e}if(n<3){FL.el.className='';return}FL.el.textContent='×'+n;FL.el.className='on';FL.el.style.animation='none';void FL.el.offsetWidth;FL.el.style.animation=''}
function flKill(head){const now=t0;FL.combo=(now-FL.ct<2.6)?FL.combo+1:1;FL.ct=now;const n=Math.min(FL.combo,12),sc=[0,2,4,7,9,12,14,16,19,21,24,26,28][n]||28,f=520*Math.pow(2,sc/12);
 flTone(f,f*.98,.34,.07,0,'sine');flTone(f*1.5,f*1.49,.28,.035,.03,'triangle',6000);flTone(f*2,f*2,.4,.02,.06,'sine');flTone(110,50,.16,.1,0,'sine');
 if(mode!=='Zombies')hitStop(head?.075:.03,head?.12:.25);
 if(head){flNoise(.06,5200,2400,.09,'highpass',.7);flTone(2600,1900,.2,.05,0,'sine');try{LX.fx.pulse=Math.max(LX.fx.pulse,.55)}catch(e){}}
 flCombo(FL.combo);setTimeout(()=>{if(t0-FL.ct>2.4)flCombo(0)},2600)}
function flHit(head){flTone(head?1500:260,head?1100:130,head?.1:.07,head?.05:.06,0,'sine');if(head)flTone(2800,2200,.14,.03,.02,'sine')}
/* master levels for the undead: the sounds are unchanged, only quieter (voices, footfalls, ambience) */
var ZVQ=.36,ZFQ=.5,ZAQ=.6;
/* ---- zombie voices: filtered sawtooth through three formants, per-zombie pitch, panned and muffled by distance ---- */
function zvSay(kind,b,dist){if(FL.vn>=5||!vol)return;try{const{c,out}=flBus(),t=c.currentTime,vp=b.vp||(b.vp=b.big?.55:.78+Math.random()*.55),F0=105*vp;
 const SP={groan:{d:1.1+Math.random()*.8,g:.55,a:1.1,e:.76,v:[[430,800,2400],[700,1100,2500],[350,700,2300]],r:.3,n:.25},
  snarl:{d:.5,g:.6,a:1,e:1.35,v:[[700,1250,2600],[550,1700,2500]],r:.9,n:.5,am:38},
  scream:{d:.9,g:.55,a:2.1,e:1.45,v:[[750,1300,2700],[950,1650,2900]],r:.7,n:.6,am:55},
  grunt:{d:.2,g:.5,a:1.1,e:.8,v:[[450,900,2400]],r:.5,n:.3},
  rattle:{d:1,g:.6,a:1,e:.42,v:[[400,800,2300],[330,700,2300]],r:.8,n:.65,am:14},
  howl:{d:1.6,g:.7,a:.9,e:.55,v:[[350,700,2300],[500,900,2400],[380,760,2300]],r:.35,n:.3}}[kind]||null;if(!SP)return;
 FL.vn++;setTimeout(()=>FL.vn--,SP.d*1000+120);
 const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(F0*SP.a,t);o.frequency.exponentialRampToValueAtTime(F0*SP.e,t+SP.d);
 const vb=c.createOscillator(),vg=c.createGain();vb.frequency.value=4.5+Math.random()*2.5;vg.gain.value=F0*.035;vb.connect(vg);vg.connect(o.frequency);
 const am=c.createGain();am.gain.value=1;if(SP.am){const lf=c.createOscillator(),lg=c.createGain();lf.frequency.value=SP.am;lg.gain.value=SP.r*.45;lf.connect(lg);lg.connect(am.gain);am.gain.value=1-SP.r*.45;lf.start(t);lf.stop(t+SP.d+.1)}
 o.connect(am);const mix=c.createGain();mix.gain.value=1;
 [8,10,12].forEach((q,i)=>{const bp=c.createBiquadFilter(),g=c.createGain();bp.type='bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(SP.v[0][i],t);for(let k=1;k<SP.v.length;k++)bp.frequency.linearRampToValueAtTime(SP.v[k][i],t+SP.d*k/(SP.v.length-1));g.gain.value=[1,.55,.28][i]*1.6;am.connect(bp);bp.connect(g);g.connect(mix)});
 const nb=c.createBuffer(1,Math.floor(c.sampleRate*SP.d),c.sampleRate),na=nb.getChannelData(0);for(let i=0;i<na.length;i++)na[i]=Math.random()*2-1;const ns=c.createBufferSource(),nf=c.createBiquadFilter(),ng=c.createGain();ns.buffer=nb;nf.type='bandpass';nf.frequency.value=SP.v[0][1];nf.Q.value=1.2;ng.gain.value=SP.n*.6;ns.connect(nf);nf.connect(ng);ng.connect(mix);
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(650,5200-dist*150);const env=c.createGain(),gv=SP.g*vol*.5*ZVQ/(1+dist*.11);env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(gv,t+Math.min(.12,SP.d*.25));env.gain.setValueAtTime(gv,t+SP.d*.55);env.gain.exponentialRampToValueAtTime(.0001,t+SP.d);
 let pn=null;if(c.createStereoPanner){pn=c.createStereoPanner();const rx=(b.x-P.x)*Math.cos(yaw)+(b.z-P.z)*-Math.sin(yaw);pn.pan.value=Math.max(-.9,Math.min(.9,rx/Math.max(2,dist)))}
 mix.connect(lp);lp.connect(env);if(pn){env.connect(pn);pn.connect(out)}else env.connect(out);o.start(t);vb.start(t);ns.start(t);o.stop(t+SP.d+.05);vb.stop(t+SP.d+.05)}catch(e){}}
/* ---- the per-frame tick ---- */
function flTick(dt){if(!run||paused)return;
 /* kills and hits you landed */
 if(typeof kills!='undefined'&&kills>FL.k0){const hd=(document.getElementById('hm')||{}).className||'';FL.k0=kills;try{flKill(/hd/.test(hd))}catch(e){}}else if(typeof kills!='undefined'&&kills<FL.k0)FL.k0=kills;
 if(typeof hits!='undefined'){if(hits>FL.h0){const hd=((document.getElementById('hm')||{}).className||'');if(hits-FL.h0<4)flHit(/hd/.test(hd));FL.h0=hits}else if(hits<FL.h0)FL.h0=hits}
 if(mode!='Zombies')return;
 const fwdX=-Math.sin(yaw),fwdZ=-Math.cos(yaw);let steps=0;
 for(const b of bots){if(!b.zom||!b.rig)continue;const d=Math.hypot(b.x-P.x,b.z-P.z);
  if(b.born==null){b.born=t0;b.vt=1+Math.random()*3;if(d<40){burst(V(b.x,.12,b.z),9,0x6b5a44,3,.6,.12);if(Math.random()<.7)zvSay(b.big?'howl':Math.random()<.35?'scream':'groan',b,d)}}
  if(!b.al){if(b.m&&b.m.scale.y!==1)b.m.scale.y=1;continue}
  const u=Math.min(1,(t0-b.born)/.8);if(u<1&&b.m)b.m.scale.y=.55+.45*(1-Math.pow(1-u,3));else if(b.m&&b.m.scale.y!==1)b.m.scale.y=1;
  if(d>34)continue;
  /* voice */
  b.vt-=dt;if(b.vt<=0){b.vt=Math.max(2.5,(8-Math.min(5,(zq?zq.r:1)*.25))*(.6+Math.random()*.8)*(d<10?.6:1));const k=d<7&&Math.random()<.55?'snarl':b.big?'howl':'groan';zvSay(k,b,d)}
  if(d<17&&!b.seen){b.seen=1;if(Math.random()<.65)zvSay(b.sprint||b.fast?'scream':'snarl',b,d)}else if(d>26)b.seen=0;
  /* heavy footfalls */
  if(d<15&&steps<3){const st=Math.floor((b.ph||0)/Math.PI);if(b.fst!=null&&st!==b.fst){steps++;const g=Math.min(.16,.28/(1+d*.4))*(b.big?1.6:1)*ZFQ;flTone(b.big?70:95,b.big?36:50,.1,g,0,'sine');flNoise(.09,900,260,g*.55,'lowpass',.7)}b.fst=st}
  /* flickering eyes, sudden twitches of the head */
  const r=b.rig;if(r.eyeM&&!(r.glowing&&r.glowing())){if(!r.eyeB)r.eyeB=r.eyeM.color.getHex();r.eyeM.color.setHex(r.eyeB).multiplyScalar(.7+.45*Math.abs(Math.sin(t0*7.3+(b.i||0)*3.1)))}
  b.tw=(b.tw||0)*Math.exp(-dt*7);b.tt=(b.tt==null?1+Math.random()*3:b.tt)-dt;if(b.tt<=0){b.tt=1.6+Math.random()*3.5;b.tw=(Math.random()<.5?-1:1)*(.35+Math.random()*.35)}
  if(r.head)r.head.rotation.y+=b.tw,r.head.rotation.z+=b.tw*.4}
 /* the world breathes */
 FL.amb-=dt;if(FL.amb<=0){FL.amb=5+Math.random()*9;const k=Math.random();if(k<.4){const fake={x:P.x+(Math.random()-.5)*60,z:P.z+(Math.random()-.5)*60,vp:.7+Math.random()*.5};zvSay(Math.random()<.2?'howl':'groan',fake,35)}else if(k<.75){flNoise(1.6,300,900,.05*ZAQ,'bandpass',.6);flNoise(1.4,500,200,.03*ZAQ,'lowpass',.5,.4)}else{flTone(210+Math.random()*60,190,.7,.012*ZAQ,0,'triangle',1200);flNoise(.5,2200,900,.02*ZAQ,'bandpass',3,.05)}}
 /* a heartbeat that gets faster the closer you are to dying */
 if(!P.dead&&P.hp<P.mhp*.4){FL.hb-=dt;if(FL.hb<=0){const k=P.hp/(P.mhp*.4);FL.hb=.5+k*.5;flTone(64,46,.15,.2*(1-k*.4),0,'sine');flTone(58,42,.17,.15*(1-k*.4),.16,'sine')}}else FL.hb=0}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{flTick(dt)}catch(e){console.warn('feel',e)}}}
/* zombies grunt when hit and rattle when they die, with a bigger burst of gore */
{const _jh=juiceHit;juiceHit=function(b,d,head){const r=_jh.apply(this,arguments);try{if(b&&b.zom&&mode=='Zombies'&&Math.random()<.4){zvSay('grunt',b,Math.hypot(b.x-P.x,b.z-P.z))}}catch(e){}return r}}
{const _rs=ragStart;ragStart=function(b){const r=_rs.apply(this,arguments);try{if(b&&b.zom&&!b.hound&&!b.rat){b.rat=1;zvSay('rattle',b,Math.hypot(b.x-P.x,b.z-P.z));burst(V(b.x,1,b.z),22,0x7a0a0a,6,.8,.14);burst(V(b.x,.4,b.z),10,0x4a0606,3,1.1,.18)}}catch(e){}return r}}

/* ===================== BOTS THAT PLAY LIKE PEOPLE =====================
   Names: every bot gets a believable gamer tag (animal and word mashups, first names with years, dotted and underscored handles, the odd clan tag, a little leetspeak), unique within a match.
   Once in a long while one of them is Mr Hups Hups (about 1 bot in 65, at most one per match).
   Personality: each bot has its own skill, aggression and reaction time. They no longer see you through walls instantly: they need a moment of clear sight before they fire.
   Movement like a player: they sprint across open ground (and cannot fire while sprinting), slide into a gunfight, crouch to peek, jump when pressured, throw frags, smoke and firebombs and knife you at point blank
   with real arm animations (the same stance poses online players use: crouch, slide, jump).
   Spawns: points are scored against every living enemy (distance and line of sight), spots where players keep dying right after spawning go "hot" for a while and are avoided, and a fresh spawn is protected for a moment. ===================== */
var BHN={a:['Shadow','Ghost','Nova','Viper','Pixel','Blaze','Frost','Rogue','Echo','Titan','Wraith','Dusk','Static','Mochi','Toast','Cobalt','Juno','Kairo','Zephyr','Onyx','Rift','Saber','Comet','Ember','Hazel','Orbit','Pulse','Quill','Raven','Sable','Talon','Umbra','Vex','Wisp','Zinc','Bandit','Cricket','Dingo','Falcon','Gizmo','Husky','Jackal','Koala','Lynx','Moose','Otter','Panda','Rhino','Sloth','Tiger','Walrus','Zebra','Orca','Mango','Pickle','Waffle','Biscuit','Turbo','Hyper','Lunar','Solar'],
 f:['Jess','Mike','Dani','Marcus','Tom','Lena','Sam','Alex','Kai','Noah','Liam','Mia','Zoe','Ben','Cal','Dev','Eli','Finn','Gus','Hal','Ian','Kit','Leo','Max','Ned','Oli','Pip','Rex','Sid','Tess','Vic','Will','Yuri','Zed','Ryan','Chloe','Jake','Nate','Owen','Ruby'],
 w:['sniper','rush','clutch','quick','salty','sweaty','lowkey','daily','official','real','just','its','the','not','big','lil','tiny','sir','dr','chef','iron','dark','neo','alpha'],tg:['RX','NVA','GG','XD','TTV','SQD','WLF','ACE','LOL','FPS']};
var BHS={used:new Set(),hups:0,hot:[],G:[],lines:{kill:['gg','nice','lol','ez','nt','too easy','sit down','clean'],die:['how?','lag','wtf','nice shot','ok ok','cheeky','hacks?','unlucky','bruh','lol ok'],gren:['grenade!','frag out','nade','incoming'],spawn:['rush','push','go go go','cover me']}};
function botNameReset(){BHS.used.clear();BHS.hups=0}
function botName(def,b){const pk=a=>a[Math.random()*a.length|0],n2=()=>String(10+(Math.random()*90|0)),n3=()=>String(100+(Math.random()*900|0)),yr=()=>pk(['0','1','2'])+(Math.random()*10|0),
 leet=s=>Math.random()<.28?s.replace(/a/gi,'4').replace(/e/gi,'3').replace(/o/gi,'0').replace(/i/gi,'1'):s,cap=s=>s[0].toUpperCase()+s.slice(1);
 if(!BHS.hups&&Math.random()<.0155){BHS.hups=1;BHS.used.add('Mr Hups Hups');return 'Mr Hups Hups'}
 for(let i=0;i<30;i++){const a=pk(BHN.a),a2=pk(BHN.a),f=pk(BHN.f),w=pk(BHN.w),p=Math.random();let s;
  if(p<.17)s=a+(Math.random()<.5?n2():n3());else if(p<.29)s=f+'_'+a;else if(p<.35)s='x'+a+'x';else if(p<.45)s=w+cap(a);else if(p<.55)s=f+yr();else if(p<.63)s=a.toLowerCase()+'.'+a2.toLowerCase();
  else if(p<.73)s=a+a2;else if(p<.80)s=a.toLowerCase()+'_'+f.toLowerCase();else if(p<.86)s=leet(a)+n2();else if(p<.92)s=f+cap(a)+(Math.random()<.4?n2():'');else s=pk(['i','im','its'])+cap(f)+(Math.random()<.5?yr():'');
  if(Math.random()<.5)s=s.replace(/_/g,Math.random()<.5?'_':'');if(Math.random()<.08)s=s.toLowerCase();if(Math.random()<.12)s='['+pk(BHN.tg)+'] '+s;s=s.slice(0,17);if(!BHS.used.has(s)){BHS.used.add(s);return s}}
 return def}
/* ---- a little table talk ---- */
function bhSay(b,k,p){if(Math.random()>(p==null?.14:p)||b.net)return;const L=BHS.lines[k];feed(`${b.nm}: ${L[Math.random()*L.length|0]}`)}
/* ---- per-bot state ---- */
function bhInit(b){return b.bh||(b.bh={skill:.75+Math.random()*.5,aggr:Math.random(),react:.28+Math.random()*.5,gcd:5+Math.random()*12,fcd:12+Math.random()*10,mcd:0,sl:0,slcd:0,cr:0,crcd:2+Math.random()*4,jm:0,jcd:2+Math.random()*5,thr:null,mel:0,seeT:0,seeL:false,lt:0,spr:0,wasSpr:0,smk:0})}
/* ---- bot grenades: a small ballistic projectile with its own explosion that hurts the player and the bots on the other team ---- */
function bhThrow(b,item,t){const h=b.bh,from=V(b.x,1.5,b.z),to=V(t.x+(Math.random()-.5)*2,(t.y||0)+.2,t.z+(Math.random()-.5)*2),d=to.clone().sub(from),dist=Math.hypot(d.x,d.z),sp=Math.min(20,Math.max(9,dist*.9)),tt=dist/sp,v=V(d.x/tt,d.y/tt+.5*20*tt,d.z/tt);
 let m;if(item=='Frag'){m=new THREE.Group();const mt=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0x4a7a3a}));mt.scale.setScalar(.06);m.add(mt)}else m=eqModel(item=='Firebomb'?'Firebomb':'Smoke Canister')||new THREE.Group();
 m.position.copy(from);S.add(m);BHS.G.push({m,p:from,v,t:0,b,item,fuse:item=='Frag'?2.1:item=='Smoke'?1.2:9});flTone&&flNoise(.2,500,1400,.05,'bandpass',1.2);if(item=='Frag'&&b.team!=null)bhSay(b,'gren',.5)}
function bhBoom(g){const p=g.p.clone(),b=g.b;
 if(g.item=='Frag'){try{JX.explode&&JX.explode(p,{R:6,d:0,imp:0,c:0xffa040})}catch(e){burst(p,26,0xffa040,8,.6,.14)}burst(p,16,0x333333,5,.9,.2);shake=Math.max(shake,Math.max(0,.7-Math.hypot(P.x-p.x,P.z-p.z)/25));
  const dP=Math.hypot(P.x-p.x,(P.y||0)+1-p.y,P.z-p.z);if(!P.dead&&dP<6&&!(typeof ally=='function'&&b.team===pTeam()&&teamMode()))hurt(Math.round(110*Math.pow(1-dP/6,1.2)),b);
  for(const o of bots){if(!o.al||o===b||o.zom||o.net||(teamMode()&&o.team===b.team))continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<6)botHit(o,Math.round(110*Math.pow(1-d/6,1.2)),b)}}
 else if(g.item=='Firebomb'){eqFire&&eqFire(p,3.2,5,28,0);eqS.glass()}
 else{grs.push({m:new THREE.Group(),p:p.clone(),v:V(0,0,0),t:0,g:{R:0,d:0,smoke:1,fuse:0},bt:0,stuck:1})}}
function bhGrenTick(dt){for(let i=BHS.G.length-1;i>=0;i--){const g=BHS.G[i];g.t+=dt;g.v.y-=20*dt;const np=g.p.clone().add(g.v.clone().multiplyScalar(dt));if(np.y<.13){np.y=.13;g.v.y*=-.32;g.v.x*=.6;g.v.z*=.6}
  for(const b of bx)if(np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y<b.h&&np.y>(b.y0||0)){g.v.x*=-.4;g.v.z*=-.4;np.copy(g.p)}
  g.p.copy(np);g.m.position.copy(np);g.m.rotation.x+=dt*8;g.m.rotation.z+=dt*5;
  if(g.t>=g.fuse||(g.item=='Firebomb'&&np.y<=.14&&g.t>.25)){S.remove(g.m);BHS.G.splice(i,1);bhBoom(g)}}}
/* ---- every frame, before the old bot code runs ---- */
function bhPre(dt){if(!run||paused||mode=='Zombies'||(netOn&&!isHost))return;bhGrenTick(dt);
 for(const b of bots){if(b.zom||b.net)continue;
  if(!b.al){if(b.bhAl){b.bhAl=0;if(b.spT!=null&&t0-b.spT<7)bhHot(b.spX,b.spZ)}b.sm=1;b.hm=1;continue}b.bhAl=1;const h=bhInit(b);
  const t=b.tg,td=t?Math.hypot(t.x-b.x,t.z-b.z):1e9;h.lt-=dt;if(h.lt<=0){h.lt=.16+Math.random()*.1;h.seeL=!!t&&td<55&&navLos(b.x,b.z,t.x,t.z)}
  if(h.seeL)h.seeT+=dt;else h.seeT=Math.max(0,h.seeT-dt*2);
  let sm=1,hm=h.skill,st=0;
  h.slcd-=dt;h.crcd-=dt;h.jcd-=dt;h.gcd-=dt;h.fcd-=dt;h.mcd-=dt;
  /* slide, crouch, jump */
  if(h.sl>0){h.sl-=dt;sm=.55+1.7*(h.sl/.7);st=3;hm*=.55;if(h.sl<=0)h.cr=.5}
  else if(h.cr>0){h.cr-=dt;sm=.6;st=1;hm*=1.12}
  else{
   const hunt=!h.seeL||td>24;
   if(!t||hunt)h.spr=1;else if(td<=22)h.spr=0;
   if(h.spr){sm=1.5;h.wasSpr=1;hm*=.2;b.cd=Math.max(b.cd,.14)}
   else{
    if(h.wasSpr){h.wasSpr=0;if(h.seeL&&td<20&&td>6&&h.slcd<=0&&Math.random()<.3+h.aggr*.4){h.sl=.7;h.slcd=5+Math.random()*4;sm=2.2;st=3}else b.cd=Math.max(b.cd,.18+Math.random()*.2)}
    if(h.seeL&&td>10&&td<32&&h.crcd<=0&&Math.random()<dt*.9){h.cr=.7+Math.random()*.9;h.crcd=4+Math.random()*6}
    if(h.seeL&&td<20&&h.jcd<=0&&Math.random()<dt*(.2+h.aggr*.5)*(b.hp+b.sh<60?2:1)){h.jm=.62;h.jcd=3+Math.random()*5}}}
  if(h.jm>0){h.jm-=dt;hm*=.55;b.aj=1;b.m&&(b.bhY=Math.sin(Math.PI*(1-h.jm/.62))*.95)}else{b.aj=0;b.bhY=0}
  /* reaction time: no shots until it has had a clear look */
  if(h.seeT<h.react)b.cd=Math.max(b.cd,.07);
  /* throwing */
  if(h.thr){h.thr.t+=dt;b.cd=Math.max(b.cd,.1);sm=Math.min(sm,.3);if(h.thr.t>=.42&&!h.thr.done){h.thr.done=1;if(t&&t.al!==0)bhThrow(b,h.thr.item,t)}if(h.thr.t>=.8)h.thr=null}
  else if(t&&h.seeL){
   if(h.gcd<=0&&td>8&&td<30&&Math.random()<dt*.6){h.thr={t:0,item:Math.random()<.65?'Frag':'Firebomb'};h.gcd=16+Math.random()*18}
   else if(h.fcd<=0&&b.hp+b.sh<45&&td<22&&Math.random()<dt*.8){h.thr={t:0,item:'Smoke'};h.fcd=25+Math.random()*20}}
  /* melee at point blank */
  if(h.mel>0){h.mel-=dt;b.cd=Math.max(b.cd,.2);sm=Math.min(sm,.4);if(h.mel<=.26&&!h.melHit){h.melHit=1;if(t&&Math.hypot(t.x-b.x,t.z-b.z)<2.9){flNoise&&flNoise(.12,2600,900,.07,'bandpass',1.5);flTone(160,70,.1,.1,.05,'sine');if(t===P)hurt(72,b);else botHit(t,72,b);burst(V(t.x,1.3,t.z),8,0xb5452e,3,.4,.08)}}if(h.mel<=0)h.melHit=0}
  else if(t&&td<2.4&&h.seeL&&h.mcd<=0&&Math.random()<dt*(1.2+h.aggr*1.5)){h.mel=.5;h.mcd=1.3+Math.random();h.melHit=0;flNoise&&flNoise(.18,700,2200,.05,'bandpass',1.2)}
  if(h.spr&&!h.thr&&!h.mel)st=0;
  b.sm=sm;b.hm=hm;b.st=st;b.sa=1}}
/* ---- every frame, after the old bot code: the jump arc ---- */
function bhPost(){for(const b of bots){if(b.zom||b.net||!b.al||!b.bh||!b.m)continue;if(b.bhY)b.m.position.y=b.bhY}}
{const _u=updBots;updBots=function(dt){try{bhPre(dt)}catch(e){console.warn('bots',e)}_u.apply(this,arguments);try{bhPost()}catch(e){}}}
/* ---- arms: knife swing and grenade throw override the gun hold ---- */
function bhKnife(){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),bl=new THREE.MeshLambertMaterial({color:0xbfc6cc});if(bl.metalness!==undefined){bl.metalness=.9;bl.roughness=.25}
 const a=(w,h,d,x,y,z,m)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);g.add(e)};a(.03,.025,.1,0,0,0,M(0x1b1d21));a(.01,.03,.2,0,.0,.14,bl);a(.006,.02,.08,0,-.006,.24,bl);a(.036,.012,.012,0,0,.1,M(0x6a6e72));return g}
function bhArms(b){const h=b.bh,r=b.rig,g=b.hg;if(!h||!r||!g)return;const doing=h.mel>0||h.thr;g.visible=!doing;
 if(!doing){if(h.knife)h.knife.visible=false;if(h.gren)h.gren.visible=false;return}
 const sR=shPos(r,1),sL=shPos(r,-1);
 if(h.mel>0){if(!h.knife){h.knife=bhKnife();r.armR.fo.add(h.knife);h.knife.position.set(0,-.4,.02);h.knife.rotation.set(Math.PI/2,0,0)}h.knife.visible=true;const u=1-h.mel/.5;let hx,hy,hz;
  if(u<.4){const k=u/.4;hx=.2+.14*k;hy=.1+.28*k;hz=-.05+.0*k}else if(u<.7){const k=(u-.4)/.3;hx=.34-.62*k;hy=.38-.45*k;hz=-.05+.7*k}else{const k=(u-.7)/.3;hx=-.28+.4*k;hy=-.07-.05*k;hz=.65-.45*k}
  ik(sR,V(sR.x+hx,sR.y+hy,sR.z+hz),V(.6,-1,-.3),r.armR);ik(sL,V(sL.x-.1,sL.y-.38,sL.z+.3),V(-.6,-1,-.3),r.armL);r.sh.rotation.y+=(u>.4&&u<.75?-.35:.18)*Math.sin(Math.min(1,u)*Math.PI)}
 else{if(!h.gren){h.gren=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0x4a7a3a}));h.gren.scale.setScalar(.06);r.armR.fo.add(h.gren);h.gren.position.set(0,-.43,.04)}h.gren.visible=h.thr.t<.42;const u=Math.min(1,h.thr.t/.8);let hx,hy,hz;
  if(u<.5){const k=u/.5;hx=.1+.1*k;hy=.15+.4*k;hz=-.1-.2*k}else{const k=Math.min(1,(u-.5)/.25);hx=.2-.1*k;hy=.55-.45*k;hz=-.3+.9*k}
  ik(sR,V(sR.x+hx,sR.y+hy,sR.z+hz),V(.6,-1,-.3),r.armR);ik(sL,V(sL.x-.1,sL.y-.4,sL.z+.25),V(-.6,-1,-.3),r.armL);r.sh.rotation.x+=-.2*Math.sin(u*Math.PI)}}
{const _ab=animBot;animBot=function(b,dt){_ab.apply(this,arguments);if(b.bh&&!b.zom&&!b.net)try{bhArms(b)}catch(e){}}}
/* ---- spawns: scored against every living enemy, hot spots avoided, fresh spawns protected ---- */
function bhHot(x,z){if(x==null)return;BHS.hot.push({x,z,r:24,u:t0+28,d:28});if(BHS.hot.length>12)BHS.hot.shift()}
function spawnPt(minD,team){const M=MAPS[sel.map],tm=team&&teamMode(),lo=tm&&team=='B'?H/3:-H,hi=tm&&team=='A'?-H/3:H,pT=typeof pTeam=='function'?pTeam():null,foes=[],allies=[];
 for(const b of bots){if(!b.al||b.zom)continue;if(b.team===team||(tm&&b.team===team))allies.push(b);else foes.push(b)}
 const meFoe=!P.dead&&!(tm&&pT===team),cand=[];
 for(let i=0;i<220&&cand.length<70;i++){const x=lo+3+Math.random()*(hi-lo-6),z=(Math.random()*2-1)*(H-3);if(M.inside&&!M.inside(x,z)||M.groundHeight?.(x,z)<-.3)continue;if(typeof navOK=='function'&&!navOK(x,z))continue;if(bx.some(b=>b.h>.5&&x>b.x0-1.2&&x<b.x1+1.2&&z>b.z0-1.2&&z<b.z1+1.2))continue;
  let dE=1e9;for(const f of foes){const d=Math.hypot(f.x-x,f.z-z);if(d<dE)dE=d}if(meFoe)dE=Math.min(dE,Math.hypot(P.x-x,P.z-z));if(dE===1e9)dE=70;
  let sc=Math.min(dE,70);if(dE<minD)sc-=250;for(const hs of BHS.hot)if(t0<hs.u&&Math.hypot(hs.x-x,hs.z-z)<hs.r)sc-=110*(hs.u-t0)/hs.d;
  if(tm&&allies.length){let dA=1e9;for(const a of allies){const d=Math.hypot(a.x-x,a.z-z);if(d<dA)dA=d}sc-=Math.abs(dA-20)*.35}
  cand.push([sc+Math.random()*8,x,z])}
 if(!cand.length)return[0,0];cand.sort((a,b)=>b[0]-a[0]);let best=cand[0],bs=-1e9;
 for(const c of cand.slice(0,7)){let los=0;for(const f of foes){if(Math.hypot(f.x-c[1],f.z-c[2])<55&&navLos(f.x,f.z,c[1],c[2]))los++}if(meFoe&&Math.hypot(P.x-c[1],P.z-c[2])<55&&navLos(P.x,P.z,c[1],c[2]))los++;const s=c[0]-los*50;if(s>bs){bs=s;best=c}}
 return[best[1],best[2]]}
{const _sp=spawn;spawn=function(b){_sp.apply(this,arguments);b.spUntil=t0+1.8;b.spT=t0;b.spX=b.x;b.spZ=b.z;b.sm=1;b.hm=1;b.sa=1;b.st=0}}
{const _bh=botHit;botHit=function(t,d,by){if(t&&t.spUntil>t0)return;return _bh.apply(this,arguments)}}
{const _rs=respawn;respawn=function(){const r=_rs.apply(this,arguments);P.sp=t0+2.6;P.spT=t0;P.spX=P.x;P.spZ=P.z;return r}}
{const _d=die;die=function(){if(P.spT!=null&&t0-P.spT<7)bhHot(P.spX,P.spZ);return _d.apply(this,arguments)}}
{const _fk=featKill;featKill=function(b,head){const r=_fk.apply(this,arguments);try{if(b&&!b.zom)bhSay(b,'die',.2)}catch(e){}return r}}
/* a shimmering "spawn shield" cue while the player is protected (their damage is cut by 85%, not blocked) */
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(run&&!P.dead&&P.sp>t0){if(typeof LX.fx!='undefined')LX.fx.pulse=Math.max(LX.fx.pulse,.05);if(!BHS.sh){const e=document.createElement('div');e.id='spawnshield';e.textContent='SPAWN SHIELD';const h=document.getElementById('hud');if(h){h.appendChild(e);BHS.sh=e}}if(BHS.sh)BHS.sh.className='on'}else if(BHS.sh&&BHS.sh.className)BHS.sh.className=''}catch(e){}}}


/* ===================== ROUND CHANGES: short and soft =====================
   The old round change was a buzzy sawtooth pair plus three long bell drones (about two seconds of it, every round). Now: a round that ends is a gentle three-note chime (sines, under a second),
   a round that starts is one low swell with a soft thud and a faint shimmer (brute rounds add a deeper rumble). Nothing sustained, nothing harsh, nothing repeated. */
function roundSnd(kind,br){if(kind=='end'){flTone(523,523,.5,.035,0,'sine');flTone(784,784,.7,.03,.14,'sine');flTone(1046,1046,.8,.012,.28,'sine')}
 else{flTone(74,46,.9,.1,0,'sine');flTone(148,92,.7,.022,0,'sine');flNoise(.8,500,120,.035,'lowpass',.6);flTone(698,698,.8,.01,.05,'sine');if(br){flTone(55,34,1.2,.11,.1,'sine');flNoise(1.1,300,70,.05,'lowpass',.6,.1)}}}

/* ===================== BUYING A PERK: you drink it =====================
   After the purchase the weapon lowers, a hand brings the bottle up (the cap pops with a little hiss), tips it back and gulps it down while the liquid level falls and the screen glows in the perk's colour,
   then the empty bottle is thrown to the floor in front of you, where it clinks, bounces and shatters. About two seconds; you cannot fire during it. The perk itself is applied the moment you pay, as before. */
var ZDR={on:0,t:0,bot:null,liq:null,lastG:-1,bottles:[]};
function zdrBottle(col){const g=new THREE.Group(),M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})),gl=M(0xbfe6d8,{transparent:true,opacity:.42}),liq=M(col,{emissive:col,emissiveIntensity:.55}),lab=M(0xf2efe6),band=M(col,{emissive:col,emissiveIntensity:.25}),cap=M(0xdcdcdc),
 cy=(rt,rb,h,y,m,sg_)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,sg_||14),m);e.position.y=y;g.add(e);return e};
 cy(.03,.03,.11,0,gl);cy(.022,.03,.03,.07,gl);cy(.013,.022,.04,.1,gl);cy(.015,.015,.012,.126,cap,10);const l=cy(.0255,.0255,.098,0,liq);l.geometry.translate(0,.049,0);l.position.y=-.049;cy(.0315,.0315,.04,0,lab);cy(.0318,.0318,.008,.014,band);cy(.0318,.0318,.008,-.014,band);
 g.userData.liq=l;return g}
function zdrStart(k){
 if(ZDR.on||P.dead)return;
 const col=PERKS[k].c,bot=zdrBottle(col);
 ZDR.on=1;ZDR.t=0;ZDR.lastG=-1;ZDR.ex=0;ZDR.col=col;
 ZDR.bot=bot;ZDR.liq=bot.userData.liq;bot.position.set(.33,-.62,-.45);C.add(bot);
 nf=Math.max(nf,t0+2.5);MV.eq=0;MV.draw=0;
 flNoise(.1,4200,2200,.05,'highpass',.7,.35);flTone(1500,900,.05,.03,.38,'sine');flNoise(.22,900,3000,.04,'bandpass',1.2)
}
function zdrDispose(bot){
 if(bot.parent)bot.parent.remove(bot);
 const materials=new Set();
 for(const part of bot.children){part.geometry.dispose();materials.add(part.material)}
 for(const material of materials)material.dispose();
}
function zdrEnd(){
 if(ZDR.bot)zdrDispose(ZDR.bot);
 ZDR.bot=ZDR.liq=null;ZDR.on=0;
 if(!P.dead&&!(zq&&(zq.papT>0||zq.down))&&!(typeof SK!='undefined'&&SK.rc))gun.visible=true;
}
function zdrBottleWorld(){
 const m=ZDR.bot;
 C.updateWorldMatrix(true,false);
 m.getWorldPosition(zdrWorldPosition);m.getWorldQuaternion(zdrWorldRotation);
 S.add(m);m.position.copy(zdrWorldPosition);m.quaternion.copy(zdrWorldRotation);
 const d=aimDir(),rx=Math.cos(yaw),rz=-Math.sin(yaw);
 ZDR.bottles.push({m,col:ZDR.col,v:V(d.x*1.4+rx*.5,-1.2,d.z*1.4+rz*.5),t:0,sp:V(7,3,5)});
 ZDR.bot=ZDR.liq=null;
}
const zdrWorldPosition=V(),zdrWorldRotation=new THREE.Quaternion(),zdrGrip=V(),zdrAxis=V(),zdrShoulder=V(.26,-.45,.12),zdrElbow=V(.4,-1,.3);
/* ---- the bottle shatters when it hits the floor: a layered glass crash, a burst of shards that skitter and settle, and a puddle of cola that spreads and slowly dries ---- */
var ZSH=[];
function zdrShatter(p,col){flNoise(.22,6200,2400,.11,'highpass',.7);flNoise(.5,3800,1500,.06,'bandpass',1.4,.03);for(let k=0;k<8;k++)flTone(2400+Math.random()*3200,1800+Math.random()*1800,.1+Math.random()*.16,.03,k*.026+Math.random()*.03,'sine');flTone(150,70,.14,.1,0,'sine');flNoise(.9,2600,700,.03,'bandpass',.8,.15);
 const q=p.clone();q.y=.1;burst(q,26,0xd8f0e8,4.8,.8,.06);burst(q,20,col,3.4,.8,.07);burst(q,8,0xffffff,6,.4,.035);
 const geo=zdrShatter.g||(zdrShatter.g=new THREE.CircleGeometry(.035,3)),mat=zdrShatter.m||(zdrShatter.m=new THREE.MeshLambertMaterial({color:0xcfeee0,transparent:true,opacity:.8,side:THREE.DoubleSide}));
 for(let i=0;i<16;i++){const m=new THREE.Mesh(geo,mat),a=Math.random()*6.283,sp=1.2+Math.random()*3.2;m.position.set(p.x,.07,p.z);m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);m.scale.setScalar(.6+Math.random()*1.4);S.add(m);ZSH.push({k:0,m,v:V(Math.cos(a)*sp,1.6+Math.random()*2.6,Math.sin(a)*sp),r:V((Math.random()-.5)*16,(Math.random()-.5)*16,(Math.random()-.5)*16),t:0,L:1.8+Math.random()*.9})}
 const pg=zdrShatter.p||(zdrShatter.p=new THREE.CircleGeometry(.5,28)),pm=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}),pu=new THREE.Mesh(pg,pm);pu.rotation.x=-Math.PI/2;pu.position.set(p.x,.014,p.z);pu.scale.setScalar(.15);S.add(pu);ZSH.push({k:1,m:pu,t:0,L:5.5,mat:pm})}
function zshTick(dt){for(let i=ZSH.length-1;i>=0;i--){const s=ZSH[i];s.t+=dt;if(s.k==0){if(s.m.position.y>.02){s.v.y-=16*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.r.x*dt;s.m.rotation.y+=s.r.y*dt;s.m.rotation.z+=s.r.z*dt;if(s.m.position.y<=.02){s.m.position.y=.02;s.m.rotation.set(-Math.PI/2,0,s.m.rotation.z);if(Math.abs(s.v.y)>2.4&&Math.random()<.5)flTone(3600+Math.random()*2400,3000,.05,.012,0,'sine')}}}
  else{const g=Math.min(1,s.t/.35);s.m.scale.setScalar(.15+.95*(1-Math.pow(1-g,3)));s.mat.opacity=.6*Math.min(1,(s.L-s.t)/2.5)}
  if(s.k==0&&s.t>s.L-.4)s.m.scale.multiplyScalar(Math.max(.01,1-dt*3));
  if(s.t>=s.L){S.remove(s.m);if(s.mat)s.mat.dispose();ZSH.splice(i,1)}}}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(ZSH.length)zshTick(dt)}catch(e){}}}
function zdrTick(dt){
 for(let i=ZDR.bottles.length-1;i>=0;i--){const b=ZDR.bottles[i];b.t+=dt;b.v.y-=18*dt;b.m.position.addScaledVector(b.v,dt);b.m.rotation.x+=b.sp.x*dt;b.m.rotation.z+=b.sp.z*dt;
  if(b.m.position.y<.06){zdrShatter(b.m.position,b.col);zdrDispose(b.m);ZDR.bottles.splice(i,1);continue}
  if(b.t>4){zdrDispose(b.m);ZDR.bottles.splice(i,1)}}
 if(!ZDR.on)return;if(P.dead||!run||mode!='Zombies'){zdrEnd();return}
 ZDR.t+=dt;const t=ZDR.t,L=(a,b,u)=>a+(b-a)*cl(u,0,1),E=u=>1-Math.pow(1-cl(u,0,1),3);
 gun.visible=false;hideFP();
 let x,y,z,tilt=0;
 const sip=.65,endSip=1.45,reach=.126;
 const sipY=-.025-reach*Math.cos(1.18),sipZ=-.25-reach*Math.sin(1.18);
 if(t<.3){const u=E(t/.3);x=L(.33,.135,u);y=L(-.62,-.21,u);z=L(-.45,-.4,u)}
 else if(t<sip){const u=E((t-.3)/(sip-.3));x=L(.135,0,u);y=L(-.21,sipY,u);z=L(-.4,sipZ,u);tilt=L(0,1.18,u)}
 else if(t<endSip){
  const gulp=Math.sin((t-sip)*13);
  x=0;tilt=1.18+gulp*.037;y=-.025-reach*Math.cos(tilt);z=-.25-reach*Math.sin(tilt);
  ZDR.liq.scale.y=Math.max(.02,1-(t-sip)/(endSip-sip));ZDR.liq.visible=ZDR.liq.scale.y>.03;
  const gi=Math.floor((t-sip)/.2);if(gi!==ZDR.lastG&&gi<4){ZDR.lastG=gi;flTone(190-gi*12,115,.16,.065,0,'sine');flNoise(.12,520,200,.035,'lowpass',.7);try{LX.fx.heal=Math.max(LX.fx.heal,.35);flashL=Math.max(flashL||0,.4)}catch(e){}}
 }else if(t<1.75){
  const u=E((t-endSip)/.3);x=L(0,.22,u);y=L(sipY,-.23,u);z=L(sipZ,-.42,u);tilt=L(1.18,.1,u);
  ZDR.liq.visible=false;if(t>1.5&&!ZDR.ex){ZDR.ex=1;flNoise(.5,1500,500,.05,'bandpass',.5)}
 }else{
  const u=E((t-1.75)/.35);x=L(.22,.4,u);y=L(-.23,-.72,u);z=L(-.42,-.31,u);tilt=L(.1,-.3,u);
 }
 const arm=fpArm.r;
 arm.up.visible=arm.fo.visible=true;
 zdrGrip.set(x,y,z);zdrAxis.set(0,Math.cos(tilt),Math.sin(tilt));
 gripArm(zdrShoulder,zdrGrip,zdrElbow,arm,zdrAxis,1);
 if(ZDR.bot){
  ZDR.bot.position.copy(zdrGrip);ZDR.bot.rotation.x=tilt;
  if(t>=1.8){ZDR.liq.visible=false;flNoise(.18,600,1800,.05,'bandpass',1.2);zdrBottleWorld()}
 }
 if(t>=2.35)zdrEnd()}
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{zdrTick(dt)}catch(e){console.warn('drink',e)}}}
{const _zs=zStart;zStart=function(){
 if(ZDR.on)zdrEnd();
 for(const bottle of ZDR.bottles)zdrDispose(bottle.m);
 ZDR.bottles.length=0;
 return _zs.apply(this,arguments);
}}
{const _zp=zPerk;zPerk=function(t){const had=zq&&zq.perks&&zq.perks[t],r=_zp.apply(this,arguments);try{if(zq&&zq.perks[t]&&!had)zdrStart(t)}catch(e){}return r}}

/* ===================== CHEWABLES =====================
   Pick five gums in the menu (the CHEWABLES button on the home screen). In Zombies, gumball machines stand around the map: pay, and the machine deals the next gum from a shuffled deck made of exactly your five;
   you see all five before the deck reshuffles. The first draw of a round costs 500, then 1,500, 2,500 and 4,900; the price resets every round. You carry one active gum at a time: drawing replaces it,
   unless the gum fires instantly. Standard, Cosmetic and Community gums are free to use once your level unlocks them; Rare and Ultra-Rare gums are used up from your stored stock when drawn (you earn stock by surviving rounds).
   Types: player-activated (key J / D-pad left), round-based, time-based, event-triggered and cosmetic. */
var CG={sel:[],stock:{},pool:[],A:null,mach:[],draws:0,ptsL:null,disc:0,inBox:0,inWall:0,ocB:null,hvB:null,trail:[],slip:[],ele:null,arsT:0,fz:[],tk:0,ui:null,hud:null,fxEl:null,rl:0,exp:0,pad:0,refillE:null,duck:new WeakSet(),vint:0};
/* id, name, tier (s standard, r rare, u ultra, c cosmetic, m community), type (rnd rounds, time seconds, act player-activated, evt event, ins instant, cos cosmetic), n (rounds / seconds / charges / triggers), run seconds (act), description, colour, unlock level */
var CHEW=[
['swift','Swift Stance','s','rnd',3,0,'Walk and strafe faster while aiming down sights, and aim in much quicker.',0x4aa8ff,1],
['dex','Tactical Dexterity','s','rnd',3,0,'Faster reloads, quicker equipment throws.',0x45d6c0,2],
['bleed','Extended Bleedout','s','rnd',3,0,'Your downed bleedout timer lasts more than twice as long.',0xe85a5a,3],
['second','Second Chance Respawn','s','evt',2,0,'Down in co-op? You respawn near the end of the round instead of waiting for the next. Lasts 2 rounds.',0xb08af0,5],
['ghost','Ghost Protocol','s','act',2,10,'2 charges. Every enemy ignores you for 10 seconds.',0x9aa6c8,7],
['feed','Direct Feed','s','time',120,0,'2 minutes. Your weapon draws straight from reserve ammo: no reloads.',0xf0c040,9],
['escape','Emergency Escape','s','act',2,0,'2 charges. Teleport to a safe spot on the map and blast nearby enemies away.',0x58e0ff,11],
['blast','Blast Shield','s','rnd',3,0,'Immune to your own and incoming explosive splash damage.',0xff9a3a,13],
['sledge','Sledgehammer Melee','s','time',150,0,'2.5 minutes. Melee strikes hit five times as hard.',0xd0603a,15],
['mobile','Mobile Fire','s','rnd',3,0,'Fire your weapon while sprinting.',0x8ae05a,17],
['graviton','Reverse Graviton','s','rnd',3,0,'Anything you kill is flung toward the ceiling by inverted gravity.',0xb070ff,19],
['alchemy','Alchemical Convertor','s','act',2,60,'2 charges, 60 seconds each. Points you earn become reserve ammo instead of score.',0xe0d060,21],
['retain','Perk Retainer','r','evt',3,0,'Lasts 3 rounds. Keep every perk when you are downed and revived.',0x40c8a0,0],
['thermal','Thermal Burst','r','evt',2,0,'2 triggers. When a zombie hits you, a ring of fire erupts and ignites everything around you.',0xff5a28,0],
['nukedrop','Tactical Nuke Drop','r','act',2,0,'2 charges. Drops a map-clearing nuke power-up in front of you.',0xff3a3a,0],
['overclock','Temporary Overclock','r','act',2,60,'2 charges, 60 seconds each. Your held weapon becomes fully Pack-a-Punched for a minute.',0xb070ff,0],
['discount','Discount Spawner','r','act',3,45,'3 charges. 45 seconds of half-price shopping.',0xffd040,0],
['repair','Structural Repair','r','act',3,0,'3 charges. A Full Restore drops and you are paid for the repairs.',0x6ad08a,0],
['reviver','Team Reviver','r','act',1,0,'1 charge. Instantly revives every downed squad mate, perks intact.',0x40a0ff,0],
['shock','Static Shock','r','evt',5,0,'5 charges. Melee strikes arc chain lightning to nearby zombies.',0x80d8ff,0],
['reroll','Reroll Token','r','act',2,0,'2 charges. Make a Mystery Box that is showing a weapon spin again.',0xf08ad8,0],
['lock','Loot Lock','r','evt',1,0,'1 use. If the Mystery Box would move away, it stays and spins again instead.',0xc0a060,0],
['overcharge','Instant Overcharge','r','evt',1,0,'The next weapon you take from the Mystery Box is fully upgraded.',0xff7a3a,0],
['arsenal','Randomized Arsenal','r','time',300,0,'5 minutes. Every 10 seconds your held weapon becomes a different upgraded gun.',0xff5ac8,0],
['heavy','Heavy Ordnance','r','act',2,25,'2 charges. A cyclone minigun for 25 seconds, then your gun returns.',0xd0d040,0],
['gift','Mystery Gift','r','act',2,0,'2 charges. A random power-up drops at your feet.',0xff8ad0,0],
['bonus','Bonus Upgrade Drop','r','act',1,0,'1 charge. Grants a free perk you do not own yet.',0x70e0ff,0],
['capx','Cap Expander','r','ins',1,0,'Instant. Permanently carry one more weapon.',0xa0e060,0],
['wallup','Wall Upgrade','r','evt',1,0,'The next weapon you buy off a wall is fully upgraded.',0xe0a050,0],
['crowd','Crowd Control','r','act',5,12,'5 charges. Sprinting zombies near you are reduced to a slow crawl.',0x50c0d0,0],
['resupply','Resupply Drop','r','act',1,0,'1 charge. A Max Ammo drops at your feet.',0x40ff70,0],
['stasis','Stasis Gaze','r','act',2,20,'2 charges, 20 seconds each. Anything you look at freezes solid.',0x90f0ff,0],
['dropext','Drop Extender','r','rnd',1,0,'1 round. Power-ups stay on the ground twice as long.',0xe0c060,0],
['slowaura','Slowing Aura','r','time',240,0,'4 minutes. Every zombie shuffles at walking pace.',0x6090ff,0],
['freeze','Temporal Freeze','u','act',1,20,'1 charge, 20 seconds. Every enemy freezes; all damage you deal lands at once when time resumes.',0x60f0ff,0],
['maxup','Max Upgrade Mastery','u','ins',1,0,'Instant. Every perk on the map, yours now.',0xffe060,0],
['refill','Universal Refill','u','time',600,0,'10 minutes. Refill your weapon from anywhere, not just at a wall.',0x60ff90,0],
['precision','Precision Targeting','u','rnd',1,0,'Rest of the round. Every bullet counts as a headshot.',0xff4040,0],
['aura','Aura Revive','u','rnd',3,0,'3 rounds. Go down and you are revived on the spot (once a round), perks kept.',0xfff0a0,0],
['shared','Shared Prosperity','u','time',600,0,'10 minutes. A quarter more points on everything you earn (squad mates share them in co-op).',0xffd050,0],
['skip','Phase Skip','u','act',1,0,'1 charge. The wave ends now, and everyone is paid a bonus.',0xd070ff,0],
['selfrest','Self-Restoration','u','evt',3,0,'3 charges. Get a kill while downed and you stand back up with your perks.',0x70ffb0,0],
['cascade','Drop Cascade','u','rnd',4,0,'4 rounds. Kills drop power-ups far more often.',0xff90ff,0],
['comedy','Audio Comedy','c','cos',0,0,'Enemies die with comedy sound effects.',0xffb040,4],
['squeak','Rubber Squeaks','c','cos',0,0,'Hits make rubber squeaks and every zombie wears a little rubber duck.',0xffe040,10],
['thermalh','Thermal Highlighting','c','act',4,15,'4 charges, 15 seconds. Neon outlines show every enemy through walls.',0x40ffe0,16],
['vintage','Vintage Cinema','c','cos',0,0,'Black and white film grain with projector lines over the screen.',0xc8c8c8,22],
['slippery','Slippery Trail','m','rnd',3,0,'Slide to leave a slick trail: zombies slip, fall and burst apart.',0x60e0a0,23],
['bottomless','Bottomless Clip','m','time',60,0,'60 seconds. Infinite magazine, no ammo used at all.',0xffa040,26],
['infusion','Elemental Infusion','m','act',1,45,'1 charge, 45 seconds. A random shock or fire effect on every bullet.',0xff6ad0,29],
['invuln','Invulnerability Shield','m','time',30,0,'30 seconds. Zombies cannot hurt you.',0x60b0ff,32],
['wealth','Instant Wealth','m','act',1,0,'1 charge. A big pile of points, right now.',0xffd820,35],
['slotunc','Slot Uncapper','m','evt',1,0,'Carry up to eight weapons.',0xa070ff,38],
['pace','Overclocked Pace','m','time',180,0,'3 minutes. You move twice as fast.',0x40ff90,41],
['wonder','Wonder Weapon Guarantee','m','evt',1,0,'The very next Mystery Box spin gives the map\'s top wonder weapon.',0xff5050,44]];
var CGD={};for(const c of CHEW)CGD[c[0]]={id:c[0],n:c[1],tr:c[2],ty:c[3],cnt:c[4],run:c[5],d:c[6],c:c[7],lv:c[8]};
var CGT={s:'STANDARD',r:'RARE',u:'ULTRA-RARE',c:'COSMETIC',m:'COMMUNITY'},CGY={rnd:'ROUNDS',time:'TIMED',act:'ACTIVATE',evt:'EVENT',ins:'INSTANT',cos:'COSMETIC'};
/* ---- the deck ---- */
function chShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
var chCost=()=>[500,1500,2500,4900][Math.min(CG.draws,3)];
/* ======================= CHEWABLES v2: the collection =======================
   Gums are earned by playing and every one is single use. Every 10 rounds of a Zombies run drops 1 to 3 random gums into the collection; a first-time
   player gets a starter pack of standard gums. The pack holds five; the gumball machines roll one of them at random and use it up. */
var CHI={
swift:`<path d="M4 11h15a4 4 0 1 0-4-4"/><path d="M4 17h21a4 4 0 1 1-4 4"/><path d="M4 23h10"/>`,
dex:`<rect x="11" y="5" width="10" height="14" rx="1.5"/><path d="M13 9h6M13 13h6"/><path d="M5 22a11 8 0 0 0 22 0"/><path d="M27 22l-1-4m1 4l-4-1"/>`,
bleed:`<path d="M16 27C6 20 4 12 9 8c3-2 6 0 7 3 1-3 4-5 7-3 5 4 3 12-7 19z"/><path d="M16 12v5l3 2"/>`,
second:`<path d="M16 5a11 11 0 1 1-9 5"/><path d="M5 5l2 6 6-2"/><circle cx="16" cy="16" r="2.6" fill="currentColor"/>`,
ghost:`<path d="M7 27V14a9 9 0 0 1 18 0v13l-3-3-3 3-3-3-3 3-3-3z"/><circle cx="13" cy="14" r="1.6" fill="currentColor"/><circle cx="19" cy="14" r="1.6" fill="currentColor"/>`,
feed:`<path d="M3 21h26"/><rect x="5" y="9" width="4" height="9" rx="2"/><rect x="12" y="9" width="4" height="9" rx="2"/><rect x="19" y="9" width="4" height="9" rx="2"/><path d="M25 12l3 3-3 3"/>`,
escape:`<ellipse cx="21" cy="16" rx="5" ry="11"/><path d="M2 16h14M11 11l5 5-5 5"/>`,
blast:`<path d="M16 4l10 4v8c0 6-4 10-10 12C10 26 6 22 6 16V8z"/><path d="M16 10l2 4 4 1-4 2 1 4-3-3-3 3 1-4-4-2 4-1z"/>`,
sledge:`<rect x="6" y="5" width="15" height="8" rx="1.5" transform="rotate(30 13 9)"/><path d="M15 14L26 27" stroke-width="3.2"/>`,
mobile:`<circle cx="13" cy="6" r="2.4"/><path d="M13 9l-2 8-4 3M11 17l5 3 1 7M13 10l5 2 4-2M9 12l4-1"/><path d="M23 14h6M24 18h5"/>`,
graviton:`<path d="M16 28V6M9 13l7-7 7 7"/><path d="M5 27h7M20 27h7"/><circle cx="16" cy="19" r="2.6"/>`,
alchemy:`<path d="M12 4h8M13 4v8L6 25a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-13V4"/><path d="M9 22h14"/><circle cx="16" cy="25" r="1.3"/>`,
retain:`<path d="M13 3h6v5l2 3v15a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V11l2-3z"/><rect x="13" y="17" width="6" height="6" rx="1"/><path d="M14 17v-2a2 2 0 0 1 4 0v2"/>`,
thermal:`<path d="M16 5c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 2 3 4"/><circle cx="16" cy="17" r="12" stroke-dasharray="3 3"/>`,
nukedrop:`<path d="M7 27h18M11 27v-6a5.5 5.5 0 1 1 10 0v6"/><path d="M16 3v4M9 7l2 3M23 7l-2 3"/>`,
overclock:`<path d="M5 23a11 11 0 1 1 22 0"/><path d="M16 23l5-9"/><path d="M8 14l2 1M24 14l-2 1M16 8v2"/><path d="M12 28h8"/>`,
discount:`<path d="M4 4h12l12 12-12 12L4 16z"/><circle cx="10" cy="10" r="1.8"/><path d="M12 22l8-8"/><circle cx="13" cy="14" r="1.1"/><circle cx="19" cy="21" r="1.1"/>`,
repair:`<path d="M22 4a6 6 0 0 0-5 8L5 24l3 3 12-12a6 6 0 0 0 8-5l-4 3-3-1-1-3z"/>`,
reviver:`<circle cx="16" cy="16" r="12"/><path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z"/>`,
shock:`<path d="M18 3L8 18h7l-2 11 11-17h-8z"/>`,
reroll:`<rect x="5" y="5" width="22" height="22" rx="4"/><circle cx="11" cy="11" r="1.7" fill="currentColor"/><circle cx="21" cy="11" r="1.7" fill="currentColor"/><circle cx="16" cy="16" r="1.7" fill="currentColor"/><circle cx="11" cy="21" r="1.7" fill="currentColor"/><circle cx="21" cy="21" r="1.7" fill="currentColor"/>`,
lock:`<rect x="6" y="14" width="20" height="14" rx="2"/><path d="M10 14V10a6 6 0 0 1 12 0v4"/><circle cx="16" cy="21" r="2"/>`,
overcharge:`<path d="M3 17h15l3-3h6l2 3v4h-6l-2 5h-5l1-5H3z"/><path d="M15 3l-3 5h4l-2 5"/>`,
arsenal:`<path d="M16 4a12 12 0 0 1 10 6"/><path d="M26 4v6h-6"/><path d="M28 19a12 12 0 0 1-12 9"/><path d="M12 28h4v-4"/><path d="M5 21A12 12 0 0 1 7 9"/><path d="M3 13l4-4 4 4"/><rect x="14" y="12" width="4" height="8" rx="2"/>`,
heavy:`<circle cx="16" cy="13" r="8"/><circle cx="16" cy="13" r="1.6" fill="currentColor"/><circle cx="16" cy="8.4" r="1.2"/><circle cx="20.2" cy="11" r="1.2"/><circle cx="20.2" cy="15.6" r="1.2"/><circle cx="16" cy="17.8" r="1.2"/><circle cx="11.8" cy="15.6" r="1.2"/><circle cx="11.8" cy="11" r="1.2"/><path d="M12 24h8l2 5H10z"/>`,
gift:`<rect x="5" y="13" width="22" height="14" rx="1.5"/><rect x="3" y="9" width="26" height="5" rx="1"/><path d="M16 9v18"/><path d="M16 9c-4-6-9-3-6 0M16 9c4-6 9-3 6 0"/>`,
bonus:`<path d="M13 3h6v5l2 3v15a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V11l2-3z"/><path d="M16 14l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z"/>`,
capx:`<rect x="4" y="8" width="10" height="16" rx="2"/><rect x="18" y="8" width="10" height="16" rx="2" stroke-dasharray="3 2"/><path d="M23 13v6M20 16h6"/>`,
wallup:`<rect x="4" y="16" width="24" height="12"/><path d="M4 22h24M12 16v6M20 22v6"/><path d="M16 12V3M12 7l4-4 4 4"/>`,
crowd:`<circle cx="8" cy="9" r="2.5"/><circle cx="16" cy="7" r="2.5"/><circle cx="24" cy="9" r="2.5"/><path d="M4 21v-6a4 4 0 0 1 8 0v6M12 21v-8a4 4 0 0 1 8 0v8M20 21v-6a4 4 0 0 1 8 0v6"/><path d="M5 27h22"/>`,
resupply:`<path d="M5 12a11 10 0 0 1 22 0z"/><path d="M5 12l9 10M27 12l-9 10M16 12v10"/><rect x="11" y="22" width="10" height="7" rx="1"/>`,
stasis:`<path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z"/><path d="M16 12v8M12.5 14l7 4M19.5 14l-7 4"/>`,
dropext:`<path d="M8 4h16M8 28h16M10 4c0 8 12 8 12 0M10 28c0-8 12-8 12 0"/><circle cx="16" cy="25" r="1.2" fill="currentColor"/>`,
slowaura:`<path d="M16 16a2 2 0 1 1 3 1.7 5 5 0 1 1-6.6-5.2 9 9 0 1 1 6.2 14.4"/><path d="M4 28h6"/>`,
freeze:`<path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13"/><path d="M12 5l4 3 4-3M12 27l4-3 4 3"/>`,
maxup:`<path d="M16 3l3.6 7.4 8.1 1.1-5.9 5.7 1.4 8.1L16 21.4 8.8 25.3l1.4-8.1L4.3 11.5l8.1-1.1z"/>`,
refill:`<rect x="11" y="8" width="10" height="17" rx="2"/><path d="M13 12h6"/><path d="M6 8a14 14 0 0 0 0 12M26 8a14 14 0 0 1 0 12"/>`,
precision:`<circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="2.2" fill="currentColor"/><path d="M16 3v6M16 23v6M3 16h6M23 16h6"/>`,
aura:`<ellipse cx="16" cy="6" rx="6" ry="2.5"/><path d="M16 10v15M16 14C10 10 5 12 3 17c3-1 6 0 8 2M16 14c6-4 11-2 13 3-3-1-6 0-8 2"/>`,
shared:`<circle cx="10" cy="16" r="6"/><circle cx="22" cy="16" r="6"/><path d="M13 8l3-3 3 3M13 24l3 3 3-3"/>`,
skip:`<path d="M4 6l11 10L4 26zM16 6l11 10-11 10z"/>`,
selfrest:`<path d="M16 27C6 20 4 12 9 8c3-2 6 0 7 3 1-3 4-5 7-3 5 4 3 12-7 19z"/><path d="M16 12v8M12 16h8"/>`,
cascade:`<path d="M8 3l1.2 3.3 3.3 1.2-3.3 1.2L8 12 6.8 8.7 3.5 7.5l3.3-1.2zM21 10l1.2 3.3 3.3 1.2-3.3 1.2L21 19l-1.2-3.3-3.3-1.2 3.3-1.2zM11 20l1.2 3.3 3.3 1.2-3.3 1.2L11 29l-1.2-3.3-3.3-1.2 3.3-1.2z"/>`,
comedy:`<path d="M5 6h22v10c0 7-5 11-11 11S5 23 5 16z"/><path d="M10 12h3M19 12h3"/><path d="M10 18c2 5 10 5 12 0z"/>`,
squeak:`<path d="M8 23c-3-2-3-7 1-8 0-5 4-8 8-8 3 0 5 2 5 5l5 2-5 2c0 6-4 9-10 9z"/><circle cx="19" cy="11" r="1.1" fill="currentColor"/>`,
thermalh:`<circle cx="16" cy="9" r="4"/><path d="M8 28V18a8 8 0 0 1 16 0v10"/><path d="M3 8l3 3M29 8l-3 3M3 21h3M26 21h3"/>`,
vintage:`<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="9" r="2"/><circle cx="22" cy="19" r="2"/><circle cx="10" cy="19" r="2"/>`,
slippery:`<path d="M5 8c0 13 9 19 22 17-7-2-9-7-10-13-.5-2-1.5-4-4-5z"/>`,
bottomless:`<rect x="9" y="3" width="14" height="26" rx="2"/><path d="M12 16c0-3 4-3 4 0s4 3 4 0-4-3-4 0-4 3-4 0z"/>`,
infusion:`<path d="M12 4c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-5"/><path d="M25 12l-5 8h5l-3 9 8-11h-5z"/>`,
invuln:`<path d="M16 3l11 4v9c0 6-5 10-11 13C10 26 5 22 5 16V7z"/><path d="M10 16l4 4 8-9"/>`,
wealth:`<path d="M11 4h10l-2 5c5 3 7 8 6 13-1 4-5 5-9 5s-8-1-9-5c-1-5 1-10 6-13z"/><path d="M16 14v11M13 17c0-2 6-2 6 0s-6 2-6 4 6 2 6 0"/>`,
slotunc:`<rect x="3" y="6" width="5" height="8" rx="1"/><rect x="10" y="6" width="5" height="8" rx="1"/><rect x="17" y="6" width="5" height="8" rx="1"/><rect x="24" y="6" width="5" height="8" rx="1"/><rect x="3" y="18" width="5" height="8" rx="1"/><rect x="10" y="18" width="5" height="8" rx="1"/><rect x="17" y="18" width="5" height="8" rx="1"/><rect x="24" y="18" width="5" height="8" rx="1" stroke-dasharray="2 2"/>`,
pace:`<path d="M3 8l9 8-9 8M13 8l9 8-9 8M23 8l7 8-7 8"/>`,
wonder:`<path d="M3 18h13l3-4h7l3 3v4h-6l-2 6h-5l1-6H3z"/><path d="M8 4l1.2 2.4 2.6.4-1.9 1.8.5 2.6L8 10l-2.4 1.2.5-2.6L4.2 6.8l2.6-.4z"/>`};
function chIcon(id){return '<svg class="cw-ic" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(CHI[id]||'<circle cx="16" cy="16" r="9"/>')+'</svg>'}
var chHex=c=>'#'+c.toString(16).padStart(6,'0');
var chPrem=id=>false;
CG.own=CG.stock;CG.rt=null;
/* ---- persistence: version 2 stores the collection ("own": how many of each gum is left) and the pack ---- */
/* ======= the collection is sealed to this device =======
   The stored counts carry a MAC made with a NON-EXTRACTABLE HMAC key that lives in IndexedDB (the page can ask it to sign but can never read it), and a save counter kept beside the key.
   Editing the stored counts, forging the old public checksum, or pasting an older copy back in all fail verification at load, and the collection is cleared. */
var DSV={p:null,o:null};
function dsReady(){if(DSV.p)return DSV.p;return DSV.p=(async()=>{try{if(!window.indexedDB||!window.crypto||!crypto.subtle)return null;
 const db=await new Promise((res,rej)=>{const r=indexedDB.open('sd-kv',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}),
  g=k=>new Promise((res,rej)=>{const q=db.transaction('k').objectStore('k').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}),
  p=(k,v)=>new Promise((res,rej)=>{const t=db.transaction('k','readwrite');t.objectStore('k').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)});
 let key=await g('dk'),fresh=0;if(!key){key=await crypto.subtle.generateKey({name:'HMAC',hash:'SHA-256'},false,['sign']);await p('dk',key);await p('dn',0);fresh=1}
 const mac=async s=>[...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 return DSV.o={fresh,get:g,put:p,mac}}catch(e){return null}})()}
var CGP={q:Promise.resolve(),pend:0};
function cgCanon(o,n){return 'gm3|'+n+'|'+Object.keys(o).sort().map(k=>k+':'+(o[k]|0)).join(';')}
function cgPersist(){CGP.pend++;CGP.q=CGP.q.then(async()=>{const ds=await dsReady(),own=Object.assign({},CG.own),sel=CG.sel.slice();let rec;
 if(ds){const n=(+(await ds.get('dn'))||0)+1,k=await ds.mac(cgCanon(own,n));await ds.put('dn',n);rec={v:3,sel,own,n,k}}else rec={v:2,sel,own,k:cgSig(own)};
 try{localStorage.setItem('sd-gum',JSON.stringify(rec))}catch(e){}}).catch(()=>{}).then(()=>{CGP.pend--})}
/* a keyed fingerprint kept in memory only (the page compares it every watcher tick to catch edits made to the live collection) */
function cgSig(o){let s='gm2|zq9|';for(const k of Object.keys(o).sort())s+=k+':'+(o[k]|0)+';';let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
function cgSave(){CG.k=cgSig(CG.own);cgPersist()}
/* keep the pack tidy; the storage is only read once, at start-up (cgBoot) */
function cgLoad(){CG.sel=CG.sel.filter((i,n)=>CGD[i]&&(CG.own[i]||0)>0&&CG.sel.indexOf(i)==n).slice(0,5);if(!CG.sel.length&&CG.ver){for(const t of['s','m','c','r','u'])for(const c of CHEW)if(c[2]==t&&(CG.own[c[0]]||0)>0&&CG.sel.length<5&&!CG.sel.includes(c[0]))CG.sel.push(c[0])}}
async function cgBoot(){const ds=await dsReady();let j=null;try{j=JSON.parse(localStorage.getItem('sd-gum')||'null')}catch(e){}
 const dev=typeof prof!='undefined'&&prof&&prof.dev,fitsK=(o,per,tot)=>{let t=0;if(!o||typeof o!='object')return false;for(const k in o){const v=o[k];if(!CGD[k]||!(v>=0)||v>per||v!==Math.floor(v))return false;t+=v}return t<=tot};
 let own={},sel=[],fresh=false,save=false;CG.tamper=0;
 if(!j)fresh=true;
 else if(j.v==3){if(ds&&!ds.fresh){const dn=+(await ds.get('dn'))||0;if((j.n===dn||j.n===dn-1)&&fitsK(j.own,999,60000)&&j.k===await ds.mac(cgCanon(j.own,j.n))){own=Object.assign({},j.own);sel=j.sel||[]}else CG.tamper=1}else CG.tamper=1}
 else if(j.v>=2){/* the earlier checksum was public, so it is accepted once, for small collections only */if(j.k===cgSig(j.own||{})&&fitsK(j.own,dev?999:20,dev?60000:300)){own=Object.assign({},j.own);sel=j.sel||[];save=true}else CG.tamper=1}
 else{/* the first version: stock plus one copy of each gum reached by level */if(fitsK(j.stock,25,200)){for(const k in j.stock)if(j.stock[k]>0)own[k]=j.stock[k]|0;for(const c of CHEW)if((c[2]=='s'||c[2]=='c'||c[2]=='m')&&c[8]>0&&(prof.lvl||1)>=c[8])own[c[0]]=(own[c[0]]||0)+1;sel=(j.sel||[]).filter(i=>CGD[i]);save=true}else CG.tamper=1}
 if(fresh){/* the starter pack: six random standard gums, two of each */const s=chShuffle(CHEW.filter(c=>c[2]=='s').map(c=>c[0]));for(const id of s.slice(0,6))own[id]=2;save=true}
 CG.own=CG.stock=own;CG.sel=sel.filter(i=>CGD[i]);CG.k=cgSig(own);CG.ver=1;cgLoad();if(save||CG.tamper)cgSave();
 try{const p=document.getElementById('p-chew');if(p&&p.offsetParent!==null)chPanel()}catch(e){}}
function chDeck(){return CG.sel.filter(i=>CGD[i]&&(CG.own[i]||0)>0).slice(0,5)}
/* ---- rewards: every 10 rounds, 1 to 3 random gums ---- */
function gmRoll(n){const wt={s:5,c:3,m:3,r:2,u:1},tot=CHEW.reduce((s,c)=>s+wt[c[2]],0),out=[];for(let i=0;i<n;i++){let r=Math.random()*tot;for(const c of CHEW){r-=wt[c[2]];if(r<=0){out.push(c[0]);break}}}return out}
function chReward(n){const ids=gmRoll(1+(Math.random()*3|0));for(const id of ids){CG.own[id]=Math.min(999,(CG.own[id]||0)+1);if(CG.sel.length<5&&!CG.sel.includes(id))CG.sel.push(id)}cgSave();chRewardUI(ids,n)}
function chRewardUI(ids,n){try{let el=document.getElementById('gmrw');if(el)el.remove();el=document.createElement('div');el.id='gmrw';
 el.innerHTML='<div class="rw-h"><small>ROUND '+n+' REWARD</small><b>CHEWABLES UNLOCKED</b></div><div class="rw-c">'+ids.map((id,i)=>{const d=CGD[id];return `<div class="rw-i t-${d.tr}" style="--c:${chHex(d.c)};--d:${(.25+i*.3).toFixed(2)}s"><span class="cw-ball">${chIcon(id)}</span><b>${d.n}</b><small>${CGT[d.tr]}</small></div>`}).join('')+'</div>';document.body.appendChild(el);
 ids.forEach((id,i)=>setTimeout(()=>{try{chSnd(CGD[id].tr=='u'?'ultra':CGD[id].tr=='r'?'rare':'pop');if(typeof burst=='function'&&typeof V=='function')burst(V(P.x,1.4,P.z),14,CGD[id].c,3,.7,.06)}catch(e){}},350+i*300));
 setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),700)},5200)}catch(e){}}
function chRw(){const z=typeof zq!='undefined'&&zq;if(!run||mode!='Zombies'||!z)return;const t=Math.floor((z.r||0)/10);if(CG.rt==null){CG.rt=t;return}if(t>CG.rt){CG.rt=t;chReward(t*10)}}
/* ---- the machines: placed by rule, validated against the real colliders ---- */
function chPlace(){for(const m of CG.mach){try{m.g.parent&&m.g.parent.remove(m.g);if(m.sol)zUnsolid(m.sol)}catch(e){}}CG.mach=[];const M=MAPS[sel.map];if(!M||!M.zm||mode!='Zombies')return;
 const ps=M.ps||[0,0],zs=M.zs||[],taken=zi.map(i=>[i.x,i.z]);taken.push([ps[0],ps[1]]);
 const clear=(x,z,r)=>{if(Math.abs(x)>M.H-3||Math.abs(z)>M.H-3)return false;for(const b of bx){if((b.h||0)<.3)continue;if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return false}const f=zFreeSpot(x,z);return Math.abs(f[0]-x)<.01&&Math.abs(f[1]-z)<.01},
  far=(x,z,d)=>taken.every(t=>Math.hypot(t[0]-x,t[1]-z)>d);
 /* one machine in the start area, one in a middle zone and one in a far zone: spots are searched on rings around that zone's own spawn points */
 const zones=[...new Set(zs.map(s=>s[2]))].sort((a,b)=>a-b),cen=zn=>{const p=zs.filter(s=>s[2]==zn);return[p.reduce((a,s)=>a+s[0],0)/p.length,p.reduce((a,s)=>a+s[1],0)/p.length]},
  dist=zn=>{const c=cen(zn);return Math.hypot(c[0]-ps[0],c[1]-ps[1])},byD=zones.slice().sort((a,b)=>dist(a)-dist(b)),want=[byD[0],byD[Math.floor(byD.length*.45)],byD[byD.length-2>0?byD.length-2:byD.length-1]].filter((z,i,a)=>z!=null&&a.indexOf(z)==i);
 const spot=zn=>{const pts=zs.filter(s=>s[2]==zn);for(let r=2.4;r<=9;r+=1.2)for(const s of pts)for(let k=0;k<14;k++){const a=k/14*6.283+r,x=s[0]+Math.cos(a)*r,z=s[1]+Math.sin(a)*r;if(zn==byD[0]&&Math.hypot(x-ps[0],z-ps[1])<5)continue;if(clear(x,z,1.15)&&far(x,z,5.5))return[x,z]}return null};
 const place=(fx,fz)=>{const g=chMachine();g.position.set(fx,0,fz);g.rotation.y=Math.atan2(ps[0]-fx,ps[1]-fz);(typeof zG!='undefined'&&zG?zG:S).add(g);let sol=null;try{sol=zSolid(fx,fz,.8,.8,1.9);zGrid()}catch(e){}taken.push([fx,fz]);
  const mc={g,x:fx,z:fz,sol,busy:0,t:0};CG.mach.push(mc);zi.push({x:fx,z:fz,r:2.6,txt:()=>mc.busy?'':'Chewables · roll a gumball ('+chDeck().length+' in your pack)',cost:()=>mc.busy?0:chCost(),act:()=>chDraw(mc)})};
 for(const zn of want){const s=spot(zn);if(s)place(s[0],s[1])}
 if(!CG.mach.length)for(let r=6;r<=20&&!CG.mach.length;r+=2)for(let k=0;k<16&&!CG.mach.length;k++){const a=k/16*6.283,x=ps[0]+Math.cos(a)*r,z=ps[1]+Math.sin(a)*r;if(clear(x,z,1.15)&&far(x,z,4))place(x,z)}}
/* ---- the sign on the front of each machine ---- */
function chSignMat(){if(chSignMat.m)return chSignMat.m;const c=document.createElement('canvas');c.width=256;c.height=48;const g=c.getContext('2d');g.fillStyle='#fff0b0';g.fillRect(0,0,256,48);g.fillStyle='#c02830';for(let i=-2;i<14;i++){g.beginPath();g.moveTo(i*22,0);g.lineTo(i*22+11,0);g.lineTo(i*22-5,48);g.lineTo(i*22-16,48);g.fill()}g.fillStyle='#1c1e22';g.fillRect(30,5,196,38);g.fillStyle='#ffd24a';g.font='700 32px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('CHEWABLES',128,25);
 return chSignMat.m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)})}
/* ======================= the Chewables page (Zombies menu) ======================= */
var CHF='own',CHSEL=null,CHMSG='';
function chPanel(){const el=document.getElementById('p-chew');if(!el)return;const active=document.activeElement,own=CG.own,tot=Object.values(own).reduce((a,b)=>a+b,0),kinds=Object.keys(own).filter(k=>own[k]>0).length,sel=CG.sel.filter(i=>own[i]>0),
  f=CHF,list=CHEW.filter(c=>f=='all'||(f=='own'?own[c[0]]>0:c[2]==f));
 if(!CHSEL||!CGD[CHSEL])CHSEL=sel[0]||(CHEW.find(c=>own[c[0]]>0)||CHEW[0])[0];const cd=CGD[CHSEL],have=own[CHSEL]||0,eq=sel.includes(CHSEL),focus=el.contains(active)&&Object.keys(active.dataset).find(key=>['e','f','t','u'].includes(key)),gs=el.querySelector('.cw-grid'),sc=gs?gs.scrollTop:0;
 const ball=(id,k)=>`<span class="cw-ball ${k||''}">${chIcon(id)}</span>`,fl=[['all','All'],['own','Owned'],['s','Standard'],['m','Community'],['c','Cosmetic'],['r','Rare'],['u','Ultra-rare']];
 let h=`<div class="cw">${CG.tamper?'<div class="cw-warn"><b>Collection cleared</b><span>The saved Chewables did not match this device, so they were removed.</span></div>':''}${CG.ver?'':'<div class="cw-warn"><b>Loading</b><span>Checking your collection…</span></div>'}<header class="panel-head cw-hd"><h2>Chewables</h2><p class="sub">${kinds} of ${CHEW.length} collected · ${tot} uses left</p></header>
 <div class="cw-pk"><h3>Your pack <small>${sel.length} / 5 equipped</small></h3><div class="cw-slots">`;
 for(let i=0;i<5;i++){const id=sel[i],d=id&&CGD[id];h+=d?`<button class="cw-s on t-${d.tr}" data-u="${id}" style="--c:${chHex(d.c)}" title="Take out of the pack">${ball(id)}<b>${d.n}</b><small>×${own[id]} · ${CGT[d.tr]}</small><em>${i+1}</em></button>`:`<div class="cw-s"><span class="cw-ball empty">+</span><b>Empty slot</b><em>${i+1}</em></div>`}
 h+=`</div></div><div class="cw-main"><div class="cw-col"><div class="cw-fl">${fl.map(([k,n])=>`<button data-f="${k}" class="${f==k?'on':''}">${n}</button>`).join('')}</div><div class="cw-grid">`;
 for(const c of list){const id=c[0],d=CGD[id],n=own[id]||0;h+=`<button class="cw-t t-${d.tr}${n?'':' lock'}${sel.includes(id)?' eq':''}${id==CHSEL?' sel':''}" data-t="${id}" style="--c:${chHex(d.c)}">${ball(id)}<b>${d.n}</b><small>${n?CGT[d.tr]:'Not found yet'}</small>${n?`<em>×${n}</em>`:''}${sel.includes(id)?'<u>PACK</u>':''}</button>`}
 if(!list.length)h+='<p class="cw-none">Nothing here yet. Chewables drop at the end of every tenth round.</p>';
 h+=`</div></div><aside class="cw-dt t-${cd.tr}" style="--c:${chHex(cd.c)}"><div class="cw-big">${ball(CHSEL,'sample')}</div><small class="cw-tr">${CGT[cd.tr]} · ${CGY[cd.ty]}</small><h3>${cd.n}</h3><p>${cd.d}</p>
 <div class="cw-hv">${have?`<b>×${have}</b><span>left in your collection</span>`:`<b>0</b><span>not found yet · earn it by surviving rounds</span>`}</div>
 <button class="cw-eq${eq?' on':''}" data-e="${CHSEL}" ${have?'':'disabled'}>${have?(eq?'Take out of pack':'Add to pack'):'Not in your collection'}</button><div class="cw-msg">${CHMSG}</div>
 <div class="cw-info"><b>How you get them</b><span>Survive 10 rounds in a Zombies run and 1 to 3 random Chewables drop into your collection. Every gumball you roll uses one up.</span></div></aside></div></div>`;
 el.innerHTML=h;const g2=el.querySelector('.cw-grid');if(g2)g2.scrollTop=sc;if(focus)(el.querySelector('[data-'+focus+'="'+active.dataset[focus]+'"]:not(:disabled)')||el.querySelector('.cw-t.sel'))?.focus({preventScroll:true})}
function chEquip(id){const own=CG.own;CHMSG='';if(!(own[id]>0)){CHMSG='You have not found this one yet.'}else if(CG.sel.includes(id))CG.sel=CG.sel.filter(i=>i!==id);else if(CG.sel.length>=5)CHMSG='Your pack is full. Take one out first.';else{CG.sel.push(id)}CG.sel=CG.sel.filter(i=>own[i]>0);cgSave();chPanel()}
{const el=document.getElementById('p-chew'),nb=document.querySelector('#nav button[data-p=chew]');
 if(el){el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.f){CHF=b.dataset.f;chPanel()}else if(b.dataset.t){CHSEL=b.dataset.t;CHMSG='';chPanel()}else if(b.dataset.u){CHSEL=b.dataset.u;chEquip(b.dataset.u)}else if(b.dataset.e&&!b.disabled)chEquip(b.dataset.e)});
  /* keyboard and controller: arrows move over the grid, Enter adds or removes the gum under the cursor */
  el.addEventListener('keydown',e=>{const t=e.target.closest&&e.target.closest('.cw-t');if(!t)return;const ts=[...el.querySelectorAll('.cw-t')],i=ts.indexOf(t);let n=null;
   if(e.key=='ArrowRight')n=ts[i+1];else if(e.key=='ArrowLeft')n=ts[i-1];else if(e.key=='ArrowDown'||e.key=='ArrowUp'){const r=t.getBoundingClientRect(),dir=e.key=='ArrowDown'?1:-1;let best=1e9;for(const o of ts){const q=o.getBoundingClientRect(),dy=(q.top-r.top)*dir;if(dy<8)continue;const sc=dy*3+Math.abs(q.left-r.left);if(sc<best){best=sc;n=o}}}
   else if(e.key=='Enter'){e.preventDefault();CHSEL=t.dataset.t;chEquip(CHSEL);return}
   if(n){e.preventDefault();CHSEL=n.dataset.t;CHMSG='';chPanel();const f=el.querySelector('.cw-t.sel');if(f){f.focus();f.scrollIntoView({block:'nearest'})}}})}
 if(nb)nb.addEventListener('click',()=>{cgLoad();CHSEL=null;CHMSG='';setTimeout(chPanel,0)})}

cgBoot();
/* ---- sounds: soft sines only; the chime climbs with the rarity ---- */
function chSnd(k){if(k=='coin'){flTone(1800,1200,.08,.05,0,'sine');flTone(2400,1700,.06,.03,.03,'sine');flNoise(.05,3000,1500,.04,'highpass',.7)}
 else if(k=='crank'){for(let i=0;i<6;i++){flNoise(.03,2200+i*80,1400,.045,'bandpass',2,i*.07);flTone(220-i*6,180,.05,.03,i*.07,'sine')}}
 else if(k=='roll'){flNoise(.5,500,260,.07,'bandpass',.8);flTone(120,80,.4,.05,0,'sine')}
 else if(k=='drop'){flTone(300,200,.1,.08,0,'sine');flTone(600,420,.08,.04,.1,'sine');flNoise(.05,1500,700,.05,'bandpass',1.4,.02)}
 else if(k=='pop'){const f=[523,659,784];f.forEach((x,i)=>flTone(x,x,.5,.05,i*.07,'sine'))}
 else if(k=='rare'){const f=[523,659,784,1046];f.forEach((x,i)=>{flTone(x,x,.7,.05,i*.07,'sine');flTone(x*2,x*2,.5,.015,i*.07,'sine')})}
 else if(k=='ultra'){const f=[523,659,784,1046,1318,1568];f.forEach((x,i)=>{flTone(x,x,.9,.05,i*.06,'sine');flTone(x*2,x*2,.7,.02,i*.06,'triangle',6000)});flNoise(.8,2000,7000,.04,'bandpass',.6,.1)}
 else if(k=='dud'){flTone(300,160,.4,.06,0,'sine')}}
/* ---- the gumball machine: red cast base, chrome neck, glass globe full of coloured gumballs, a crank and a chute ---- */
function chMachine(){const T=THREE,g=new T.Group(),G=HV.G(),L=c=>new T.MeshLambertMaterial({color:c}),metal=new T.MeshLambertMaterial({color:0xd8dce0});if(metal.metalness!==undefined){metal.metalness=.9;metal.roughness=.25}
 const red=L(0xc02830),dk=L(0x1c1e22),glass=new T.MeshLambertMaterial({color:0xcfe8ff,transparent:true,opacity:.22}),cap=L(0xe8c030),
 cy=(rt,rb,h,x,y,z,m,sg_)=>{const e=new T.Mesh(new T.CylinderGeometry(rt,rb,h,sg_||18),m);e.position.set(x,y,z);g.add(e);return e},
 sp=(r,x,y,z,m,sy)=>{const e=new T.Mesh(new T.SphereGeometry(1,16,12),m);e.scale.set(r,r*(sy||1),r);e.position.set(x,y,z);g.add(e);return e};
 cy(.38,.42,.08,0,.04,0,dk);cy(.3,.36,.55,0,.35,0,red);cy(.31,.31,.05,0,.2,0,metal);cy(.31,.31,.05,0,.55,0,metal);cy(.14,.2,.18,0,.68,0,metal);cy(.2,.14,.06,0,.78,0,metal);
 const globe=new T.Group();globe.position.y=1.12;g.add(globe);const gm=new T.Mesh(new T.SphereGeometry(.42,28,20),glass);globe.add(gm);const rim=new T.Mesh(new T.TorusGeometry(.4,.03,8,32),metal);rim.rotation.x=Math.PI/2;rim.position.y=-.28;globe.add(rim);
 const cols=[0xff4a5a,0x4ac8ff,0xffd84a,0x6aff7a,0xff8ad8,0xff9a3a],parts={};for(let i=0;i<cols.length;i++)parts[i]=[];const R=MK.rnd(5);
 for(let i=0;i<130;i++){let x,y,z;do{x=(R()*2-1)*.36;y=(R()*2-1)*.36;z=(R()*2-1)*.36}while(x*x+y*y+z*z>.1296||y>.2-Math.abs(x)*.05&&y>.15);parts[i%6].push({g:G.sp,sx:.056,sy:.056,sz:.056,x,y:y-.05,z,rx:0,ry:0,rz:0})}
 for(const i in parts){const m=new T.Mesh(HV.merge(parts[i]),new T.MeshLambertMaterial({color:cols[i],emissive:cols[i],emissiveIntensity:.18}));globe.add(m)}
 g.userData.gum=globe;
 cy(.31,.31,.06,0,1.57,0,metal);cy(.36,.28,.12,0,1.65,0,red);cy(.04,.04,.12,0,1.74,0,metal);sp(.07,0,1.81,0,cap);
 const plate=new T.Mesh(G.bx,L(0xf0ecdc));plate.scale.set(.34,.2,.03);plate.position.set(0,.5,.33);g.add(plate);const slot=new T.Mesh(G.bx,dk);slot.scale.set(.02,.1,.02);slot.position.set(-.06,.54,.35);g.add(slot);
 const knob=new T.Group();knob.position.set(.07,.5,.355);g.add(knob);const kc=new T.Mesh(new T.CylinderGeometry(.075,.075,.04,16),metal);kc.rotation.x=Math.PI/2;knob.add(kc);const kb=new T.Mesh(G.bx,metal);kb.scale.set(.15,.035,.03);kb.position.z=.03;knob.add(kb);g.userData.knob=knob;
 const chute=new T.Mesh(G.bx,dk);chute.scale.set(.22,.14,.05);chute.position.set(0,.24,.34);g.add(chute);const flap=new T.Mesh(G.bx,metal);flap.scale.set(.2,.12,.015);flap.position.set(0,.24,.37);g.add(flap);g.userData.flap=flap;
 const lab=new T.Mesh(G.bx,chSignMat());lab.scale.set(.52,.1,.012);lab.position.set(0,.33,.315);lab.rotation.x=-.12;g.add(lab);
 for(const s of[-1,1])cy(.04,.05,.1,s*.3,0,.2,dk);
 const bulb=new T.Sprite(new T.SpriteMaterial({map:HV.auraTex(),color:0xffd070,transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending,fog:false}));bulb.scale.set(2.3,2.3,1);bulb.position.set(0,1.2,0);g.add(bulb);g.userData.bulb=bulb;
 const ring=new T.Mesh(new T.RingGeometry(.6,.82,40),new T.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;g.add(ring);g.userData.ring=ring;
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
/* ---- drawing a gum ---- */
function chDraw(mc){if(mc.busy||P.dead||mode!='Zombies')return;if(!CG.ver){msg('Chewables are loading…',1.6);return}const c=chCost();if(zq.pts<c)return zf('Not enough points');
 CG.pool=CG.pool.filter(i=>(CG.own[i]||0)>0);if(!CG.pool.length)CG.pool=chShuffle(chDeck());if(!CG.pool.length){msg('Your pack is empty · pick Chewables in the Zombies menu',2.8);chSnd('dud');return}const id=CG.pool.pop();CG.own[id]--;if(CG.own[id]<=0)delete CG.own[id];cgSave();zq.pts-=c;CG.draws++;mc.busy=1;mc.t=0;mc.id=id;mc.ph=0;chSnd('coin');mc.knobFx=1;
 setTimeout(()=>chSnd('crank'),260);setTimeout(()=>chSnd('roll'),1050);setTimeout(()=>{chSnd('drop');mc.ph=2},1550);
 mc.id=id}
function chMachTick(dt){for(const mc of CG.mach){const u=mc.g.userData;if(u.gum)u.gum.rotation.y+=dt*(mc.busy?5:.35);if(u.bulb)u.bulb.material.opacity=.4+.12*Math.sin(t0*3+mc.x);if(u.ring)u.ring.material.opacity=.22+.16*Math.sin(t0*2.2+mc.x);
  if(!mc.busy)continue;mc.t+=dt;const t=mc.t;
  if(t<1.1){u.knob.rotation.z=-Math.PI*2*(Math.min(1,(t-.25)/.8))*(t>.25?1:0);u.gum.rotation.y+=dt*10;if(Math.random()<dt*14)burst(V(mc.x,1.1,mc.z),1,CGD[mc.id].c,1.4,.5,.05)}
  else if(t<1.6){u.flap.rotation.x=-.9*Math.min(1,(t-1.1)/.2)}
  if(t>=1.55&&!mc.ball){const col=CGD[mc.id].c,b=new THREE.Mesh(new THREE.SphereGeometry(.07,14,10),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.6)}));b.position.set(mc.x+Math.sin(mc.g.rotation.y)*.4,.25,mc.z+Math.cos(mc.g.rotation.y)*.4);S.add(b);mc.ball={m:b,vy:-.5,p:V(b.position.x,b.position.y,b.position.z),bn:0}}
  if(mc.ball){const bl=mc.ball;bl.vy-=14*dt;bl.m.position.y+=bl.vy*dt;bl.m.position.x+=Math.sin(mc.g.rotation.y)*dt*.6;bl.m.position.z+=Math.cos(mc.g.rotation.y)*dt*.6;if(bl.m.position.y<.07){bl.m.position.y=.07;bl.vy=bl.bn>=3?0:Math.abs(bl.vy)*.45;bl.bn++;if(bl.bn<=4)flTone(900+bl.bn*200,800,.06,.03,0,'sine')}
   if(t>2.5&&!mc.off){mc.off=1;const p=V(bl.m.position.x,.2,bl.m.position.z);burst(p,22,CGD[mc.id].c,5,.8,.09);burst(p,8,0xffffff,7,.4,.05);try{JX.flash(p,CGD[mc.id].c,3,.5,18)}catch(e){}u.flap.rotation.x=0;u.knob.rotation.z=0;chOffer(mc)}
   if(mc.off){bl.m.scale.setScalar(1+.12*Math.sin(t0*6))}}}}
/* ---- state helpers ---- */
var gmLive=A=>{if(!A)return false;const t=A.d.ty;if(t=='rnd')return A.left>0;if(t=='time')return A.t>0;if(t=='act')return A.ch>0||A.run>0;if(t=='evt')return(A.id=='second'||A.id=='retain')?A.left>0:A.ch>0;return false},
 gmOn=id=>!!(CG.A&&CG.A.id==id&&gmLive(CG.A)),gmRun=id=>!!(CG.A&&CG.A.id==id&&CG.A.run>0),zs_=()=>bots.filter(b=>b.zom&&b.al&&!b.zp),me_=()=>({x:P.x,z:P.z});
function chStart(id){const d=CGD[id],A={id,d,left:0,t:0,ch:0,run:0,data:{}};if(d.ty=='rnd')A.left=d.cnt;else if(d.ty=='time')A.t=d.cnt;else if(d.ty=='act')A.ch=d.cnt;else if(d.ty=='evt'){if(id=='second'||id=='retain')A.left=d.cnt;else A.ch=d.cnt}
 if(id=='slotunc')zq.cap=Math.max(zq.cap,8);if(id=='infusion')A.data.ele=Math.random()<.5?'shock':'fire';return A}
function chEnd(A){if(!A)return;try{const id=A.id;if(id=='overclock'&&CG.ocB){const o=CG.ocB;CG.ocB=null;if(wp[o.i]&&wp[o.i].k==o.b.k){wp[o.i]=Object.assign({},o.b);setGun()}}
 if(id=='heavy'&&CG.hvB){const o=CG.hvB;CG.hvB=null;if(wp[o.i]){wp[o.i]=Object.assign({},o.b);setGun()}}
 if(id=='freeze')chThaw();if(id=='swift'){for(const w of wp)if(w.adB){w.ad=w.adB;w.adB=null}}if(id=='thermalh')CG.th=0;
 A.run=0}catch(e){}}
function chInstant(id){if(id=='capx'){zq.cap++;msg('One more weapon slot',2)}else if(id=='maxup'){const p=zq.pts;zq.pts=1e6;for(const k of zAvailablePerks()){try{zPerk(k)}catch(e){}}zq.pts=p;msg('Every perk, yours',2)}try{LX.fx.heal=1}catch(e){}}
function chReveal(id){const d=CGD[id];if(chPrem(id)){if((CG.stock[id]||0)<=0){msg(d.n+' crumbles: out of stock',2);chSnd('dud');return}CG.stock[id]--;cgSave()}
 chSnd(d.tr=='u'?'ultra':d.tr=='r'?'rare':'pop');
 if(d.ty=='cos'){CG.cos[id]=1;msg(d.n+' · '+CGT[d.tr],2);return}
 if(d.ty=='ins'){msg(d.n,2);chInstant(id);return}
 if(CG.A&&gmLive(CG.A))msg('Swapped '+CG.A.d.n+' for '+d.n,2);else msg(d.n+' · '+CGY[d.ty],2);chEnd(CG.A);CG.A=chStart(id)}
CG.cos={};
/* ---- using a player-activated gum (key J, D-pad left) ---- */
function chUse(){const A=CG.A;if(!A||P.dead||!run||paused||mode!='Zombies'||!gmLive(A)||A.d.ty!='act'||A.run>0&&A.d.run>0)return;const id=A.id,z=zq,ok=x=>{if(x===false)return;A.ch--;if(A.d.run>0)A.run=A.d.run;chSnd('pop');if(A.ch<=0&&!(A.run>0))setTimeout(()=>{if(CG.A===A&&!gmLive(A))CG.A=null},300)},fwd=aimDir();
 const spot=(k)=>{const x=P.x+fwd.x*1.8,zz=P.z+fwd.z*1.8,[fx,fz]=zFreeSpot(x,zz);zPuSpawn(z.puId++,k,fx,fz)};
 switch(id){
  case'ghost':case'stasis':case'freeze':case'crowd':case'thermalh':case'alchemy':case'overclock':case'heavy':case'discount':case'infusion':
   if(id=='overclock'){const i=cur,w=wp[i];if(!w||w.k=='Fists')return msg('Hold a gun first',1.4);CG.ocB={i,b:{...w}};for(let n=0;n<3;n++)if((w.pap||0)<3)zPap(w);setGun();rel=0}
   if(id=='heavy'){const i=cur,w=wp[i];CG.hvB={i,b:{...w}};const hw=zGunObj('CY');hw.pap=2;hw.pm=3.6;hw.pn='Cyclone Minigun';wp[i]=hw;cur=i;setGun();rel=0}
   if(id=='crowd'){let n=0;for(const b of zs_())if(Math.hypot(b.x-P.x,b.z-P.z)<16){b.crawlT=12;n++;burst(V(b.x,1,b.z),6,0x50c0d0,3,.4,.06)}msg(n?n+' zombies slowed to a crawl':'Nothing nearby',1.5)}
   if(id=='discount'){CG.disc=45;CG.ptsL=zq.pts;msg('Half-price for 45 seconds',2)}
   if(id=='thermalh'){CG.th=15}
   if(id=='freeze'){CG.fzOn=1;CG.fz=[]}
   if(id=='ghost'){burst(V(P.x,1,P.z),24,0x9aa6c8,3,.8,.1)}
   return ok();
  case'escape':{let best=null,bs=-1;for(let i=0;i<48;i++){const a=Math.random()*6.283,d=12+Math.random()*MAPS[sel.map].H*.8,[x,zz]=zFreeSpot(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d);if(Math.abs(x)>MAPS[sel.map].H-4||Math.abs(zz)>MAPS[sel.map].H-4)continue;let md=1e9;for(const b of zs_())md=Math.min(md,Math.hypot(b.x-x,b.z-zz));if(md>bs){bs=md;best=[x,zz]}}
   if(!best)return false;const ox=P.x,oz=P.z;for(const b of zs_()){const dx=b.x-ox,dz=b.z-oz,d=Math.hypot(dx,dz);if(d<7){b.stun=Math.max(b.stun||0,2);try{b.x+=dx/(d||1)*4;b.z+=dz/(d||1)*4}catch(e){}}}
   burst(V(ox,1,oz),40,0x58e0ff,8,.7,.12);P.x=best[0];P.z=best[1];burst(V(P.x,1,P.z),40,0x58e0ff,8,.7,.12);eqRing(V(ox,.1,oz),.5,7,.5,0x58e0ff,.8);eqRing(V(P.x,.1,P.z),.5,5,.5,0x58e0ff,.8);flTone(300,1400,.35,.06,0,'sine');shake=Math.max(shake,.6);try{LX.fx.pulse=1}catch(e){}return ok()}
  case'nukedrop':spot('nuke');return ok();case'resupply':spot('ammo');return ok();
  case'gift':spot(['ammo','insta','dbl','nuke','heal','fire'][Math.random()*6|0]);return ok();
  case'repair':spot('heal');z.pts+=500;msg('Repaired · +500',1.6);return ok();
  case'bonus':{const available=zAvailablePerks();if(!available.length){msg('No perks available',1.6);return false}const k=available[Math.random()*available.length|0],p=z.pts;z.pts=1e6;zPerk(k);z.pts=p;return ok()}
  case'wealth':z.pts+=15000;burst(V(P.x,1.4,P.z),30,0xffd820,5,.8,.1);msg('+15,000',1.8);return ok();
  case'reviver':{let n=0;for(const b of bots)if(b.net&&b.dn){n++;try{netSend({t:'zqv',to:b.id});if(isHost)zNet({t:'zqv',to:b.id,id:myId})}catch(e){}}if(!n){msg('Nobody is down',1.4);return false}msg('Squad revived',2);return ok()}
  case'reroll':{let done=0;for(let i=0;i<zboxes.length;i++){const o=zboxes[i];if(o.on&&o.st==2){zBoxEnd(o,i);zBoxStart(o,i,zMe());done=1;break}}if(!done){msg('Use it while a Mystery Box shows a weapon',2);return false}return ok()}
  case'skip':{for(const b of zs_())zDamage(b,9e9,0,zMe(),'',false);z.toSpawn=0;z.pts+=2000;try{if(z.hound)z.hound.done=1}catch(e){}msg('PHASE SKIP · +2,000',2);burst(V(P.x,1,P.z),50,0xd070ff,10,1,.14);return ok()}
 }}
/* ---- every frame ---- */
function chTick(dt){chMachTick(dt);chRw();chBubTick(dt);chHud();chFx();if(!run||paused||mode!='Zombies'||!zq||P.dead&&!(zq.down))return;const z=zq,A=CG.A,live=gmLive(A),w=cw();CG.tk+=dt;
 if(A){if(A.d.ty=='time'&&A.t>0){A.t-=dt;if(A.t<=0){chEnd(A);msg(A.d.n+' ended',1.4)}}if(A.run>0){A.run-=dt;if(A.run<=0){chEnd(A);if(!gmLive(A))CG.A=null}}}
 if(CG.th>0){CG.th-=dt;if(CG.th<=0)CG.th=0}
 /* gamepad: D-pad left */
 try{const gp=navigator.getGamepads?navigator.getGamepads():[];let pr=0;for(const g of gp)if(g&&g.buttons[14]&&g.buttons[14].pressed)pr=1;if(pr&&!CG.pad)chUse();CG.pad=pr}catch(e){}
 if(live&&w){switch(A.id){
  case'swift':if(!w.adB)w.adB=w.ad||1;w.ad=w.adB*1.9;break;
  case'feed':if(w.mag<w.m&&w.res>0){const tk=Math.min(w.m-w.mag,w.res);w.mag+=tk;w.res-=tk}rel=0;break;
  case'bottomless':w.mag=w.m;rel=0;break;
  case'ghost':if(A.run>0)for(const b of zs_())b.stun=Math.max(b.stun||0,.25);break;
  case'stasis':if(A.run>0){const f=aimDir();for(const b of zs_()){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz)||1;if(d<40&&(dx*f.x+dz*f.z)/d>.82&&navLos(P.x,P.z,b.x,b.z)){b.stun=Math.max(b.stun||0,.3);if(Math.random()<dt*6)burst(V(b.x,1,b.z),1,0x90f0ff,1,.5,.06)}}}break;
  case'freeze':if(A.run>0)for(const b of zs_())b.stun=Math.max(b.stun||0,.3);break;
  case'alchemy':if(A.run>0&&CG.ptsL!=null){const d=z.pts-CG.ptsL;if(d>0){z.pts-=d;w.res=Math.min(w.m*10,w.res+d*.06)}}break;
  case'discount':if(A.run>0&&CG.ptsL!=null){const d=CG.ptsL-z.pts;if(d>=80){z.pts+=Math.floor(d*.5);burst(V(P.x,1.5,P.z),8,0xffd040,3,.6,.08)}}break;
  case'shared':if(CG.ptsL!=null){const d=z.pts-CG.ptsL;if(d>0&&d<5000)z.pts+=Math.floor(d*.25)}break;
  case'arsenal':CG.arsT-=dt;if(CG.arsT<=0){CG.arsT=10;const ks=Object.keys(ZWP).filter(k=>k!='TEA'&&k!=w.k);const k=ks[Math.random()*ks.length|0];zGive(k);const nw=wp[cur];if(nw){zPap(nw);zPap(nw);setGun()}burst(V(P.x,1.3,P.z),20,0xff5ac8,5,.6,.08)}break;
  case'slotunc':z.cap=Math.max(z.cap,8);break;
  case'selfrest':break;
  case'dropext':for(const d of z.drops)if(!d.ext){d.ext=1;d.life*=2}break;
  case'slippery':{const sl=ST.slide>0;CG.tr=(CG.tr||0)-dt;if(sl&&CG.tr<=0){CG.tr=.1;CG.trail.push({x:P.x,z:P.z,t:7,m:null})}break}}}
 /* the slick trail: zombies that touch it slip, fall and burst apart */
 for(let i=CG.trail.length-1;i>=0;i--){const t=CG.trail[i];t.t-=dt;if(!t.m){const m=new THREE.Mesh(new THREE.CircleGeometry(.7,14),new THREE.MeshBasicMaterial({color:0x60e0a0,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;m.position.set(t.x,.04,t.z);S.add(m);t.m=m}t.m.material.opacity=Math.min(.35,t.t*.1);
  for(const b of zs_()){if(b.slip||b.hound)continue;if(Math.hypot(b.x-t.x,b.z-t.z)<.85){b.slip=1;b.stun=3;CG.slip.push({b,t:.9})}}if(t.t<=0){S.remove(t.m);t.m.geometry.dispose();t.m.material.dispose();CG.trail.splice(i,1)}}
 for(let i=CG.slip.length-1;i>=0;i--){const s=CG.slip[i];s.t-=dt;if(s.b.m)s.b.m.rotation.x=Math.min(1.4,(1-s.t/.9)*1.4);if(s.t<=0){const b=s.b;CG.slip.splice(i,1);if(!b.al)continue;const p=V(b.x,.6,b.z);burst(p,34,0x60e0a0,7,.8,.14);burst(p,14,0xffffff,8,.5,.08);flNoise(.25,1800,200,.12,'lowpass');flTone(90,40,.4,.14,0,'sine');for(const o of zs_())if(o!==b&&Math.hypot(o.x-b.x,o.z-b.z)<3.2)zDamage(o,200+z.r*30,0,zMe(),'',false);zDamage(b,9e9,0,zMe(),'',false);if(b.m)b.m.rotation.x=0}}
 /* temporal freeze ends: everything you dealt lands at once */
 if(CG.fzOn&&!(gmRun('freeze')))chThaw();
 /* reverse graviton: the dead rise */
 for(const b of bots){if(b.grv){b.grv.t+=dt;b.m.position.y=(b.y||0)+b.grv.t*b.grv.vy+b.grv.t*b.grv.t*1.5;b.m.rotation.x+=dt*b.grv.sp;b.m.rotation.z+=dt*b.grv.sp*.6;if(b.grv.t>3&&b.m.visible){b.m.visible=false;burst(V(b.m.position.x,b.m.position.y,b.m.position.z),20,0xb070ff,5,.8,.1)}}}
 /* crawling zombies, ducks, the vintage grain */
 for(const b of zs_()){if(b.crawlT>0){b.crawlT-=dt}if(CG.cos.squeak&&!CG.duck.has(b)&&b.rig){CG.duck.add(b);const d=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({color:0xffe040,emissive:0xaa8800,emissiveIntensity:.3}));d.scale.set(.1,.085,.1);d.position.set(0,.3,0);const bk=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff8a1a}));bk.scale.set(.06,.02,.05);bk.position.set(0,-.01,.1);d.add(bk);b.rig.head.add(d)}}
 /* the kills: comedy sounds */
 if(typeof kills!='undefined'){if(kills>CG.k0){if(CG.cos.comedy)chComedy();CG.k0=kills;if(!P.dead||false){}}else CG.k0=kills}
 /* stored stock: events that need the player to be downed */
 if(A&&A.id=='selfrest'&&gmLive(A)&&P.dead&&z.down&&netOn&&typeof kills!='undefined'&&kills>CG.k1){A.ch--;zRespawn()}CG.k1=typeof kills!='undefined'?kills:0;
 CG.ptsL=z.pts}
CG.k0=0;CG.k1=0;
function chThaw(){CG.fzOn=0;for(const o of CG.fz){if(o.b.al&&o.d>0)zDamage(o.b,o.d,0,zMe(),'',false)}CG.fz=[];try{LX.fx.pulse=1;flNoise(.4,3000,300,.1,'lowpass');flTone(300,60,.5,.12,0,'sine')}catch(e){}}
function chComedy(){const k=Math.random()*5|0;if(k==0){flTone(900,300,.6,.07,0,'sine')}else if(k==1){flTone(180,420,.15,.08,0,'triangle',1200);flTone(420,200,.2,.07,.12,'triangle',1200)}else if(k==2){flTone(300,300,.25,.07,0,'sawtooth',900);flTone(260,260,.2,.06,.2,'sawtooth',900)}else if(k==3){for(let i=0;i<4;i++)flTone(500+i*140,520+i*140,.07,.06,i*.07,'sine')}else{flTone(1400,500,.25,.06,0,'sine');flTone(200,90,.3,.08,.2,'sine')}}
function chSqueak(){flTone(1700,2400,.09,.07,0,'sine');flTone(2400,1500,.1,.05,.07,'sine')}
/* ---- the hooks ---- */
{const _s=zsm;zsm=()=>_s()*(gmOn('swift')&&ST.ads>.4?1.4:1)*(gmOn('pace')?2:1)}
{const _r=zrl;zrl=()=>_r()*(gmOn('dex')?.65:1)}
{const _g=rng;rng=()=>_g()||gmOn('mobile')}
{const _m=zMeleeStats;zMeleeStats=function(m){const s=_m.apply(this,arguments);if(gmOn('sledge'))s.d=(s.d||m.d)*5;return s}}
{const _h=hurt;hurt=function(d,b){if(mode=='Zombies'){if(gmOn('blast')&&CG.exp)return;if(gmRun&&gmOn('invuln')&&b&&b.zom)return;if(gmOn('thermal')&&b&&b.zom&&!CG.thB){CG.thB=1;CG.A.ch--;const p=V(P.x,.2,P.z);eqFire(p,3.6,4,50,1);for(const o of zs_()){if(Math.hypot(o.x-P.x,o.z-P.z)<4.5){o.burn=3;o.stun=Math.max(o.stun||0,.7)}}setTimeout(()=>{CG.thB=0},400)}}return _h.apply(this,arguments)}}
{const _b=boom;boom=function(){CG.exp=1;try{return _b.apply(this,arguments)}finally{CG.exp=0}}}
{const _zd=zDamage;zDamage=function(b,d,head,by,k,mel){if(CG.fzOn&&b&&b.zom&&!b.hound&&!b.dead){let o=CG.fz.find(x=>x.b===b);if(!o){o={b,d:0};CG.fz.push(o)}o.d+=d;if(by==zMe()){hits++;$('#hm').className='on';hmT=.12}return}
  const r=_zd.apply(this,arguments);try{if(by==zMe()&&b){if(mel&&gmOn('shock')&&CG.A.ch>0){CG.A.ch--;let n=0;let prev=V(b.x,1.2,b.z);for(const o of zs_()){if(o===b||n>=4)continue;if(Math.hypot(o.x-b.x,o.z-b.z)<6){n++;const q=V(o.x,1.2,o.z);eqArc(prev,q);prev=q;_zd.call(this,o,Math.max(30,d*.5),0,by,'',false)}}flTone(2400,300,.2,.06,0,'sine');flNoise(.12,4000,1500,.06,'highpass',.8)}
   if(!mel&&k&&gmOn('infusion')&&CG.A.run>0){const e=CG.A.data.ele;if(e=='shock'&&Math.random()<.5){let n=0;let prev=V(b.x,1.2,b.z);for(const o of zs_()){if(o===b||n>=2)continue;if(Math.hypot(o.x-b.x,o.z-b.z)<5){n++;const q=V(o.x,1.2,o.z);eqArc(prev,q);prev=q;_zd.call(this,o,Math.max(20,d*.3),0,by,'',false)}}}else if(e=='fire'){b.burn=3;if(!b.al&&!b.fx_){b.fx_=1;burst(V(b.x,1,b.z),24,0xff7a22,7,.7,.12);for(const o of zs_())if(Math.hypot(o.x-b.x,o.z-b.z)<3)_zd.call(this,o,150+zq.r*20,0,by,'',false)}}}}}catch(e){}return r}}
{const _zh=zHit;zHit=function(b,d,head,scale=1){if(scale===1&&gmOn('precision')){head=true}return _zh.call(this,b,d,head,scale)}}
{const _pt=zPuTry;zPuTry=function(b){if(gmOn('cascade')){for(let i=0;i<3;i++){zq.puRound=0;_pt.call(this,b)}}return _pt.apply(this,arguments)}}
{const _pk=zPick;zPick=function(by){if(gmOn('wonder')&&by==zMe()&&CG.A){CG.A.ch=0;CG.A=null;return zq.tea||sel.map=='London'?'TEA':'RG'}return _pk.apply(this,arguments)}}
{const _dn=zDown;zDown=function(){const z=zq;if(z&&gmOn('aura')&&!CG.auraUsed){CG.auraUsed=1;endDeath();P.dead=0;P.hp=P.mhp;P.sh=P.msh;z.down=0;P.rt=0;P.fall=null;msg('AURA REVIVE',2.2);burst(V(P.x,1,P.z),50,0xfff0a0,9,1,.14);eqRing(V(P.x,.1,P.z),.5,7,.6,0xfff0a0,.8);flTone(523,1046,.7,.08,0,'sine');flTone(784,1568,.7,.05,.1,'sine');try{LX.fx.pulse=1;LX.fx.heal=1}catch(e){}return}
  const snap=z?{...z.perks}:null,keep=z&&gmOn('retain'),r=_dn.apply(this,arguments);if(z&&keep&&snap){z.perks=snap;P.mhp=snap.vit?100:50;msg('Perks kept',1.6)}if(z&&z.down&&gmOn('bleed'))z.dnT=(z.dnT||45)*2.2;return r}}
{const _rs=zRespawn;zRespawn=function(){const z=zq,snap=z?{...z.perks}:null,keep=z&&(gmOn('retain')||gmOn('selfrest')||gmOn('second')&&false),r=_rs.apply(this,arguments);if(z&&keep&&snap){z.perks=snap;P.mhp=snap.vit?100:50;P.hp=P.mhp}return r}}
{const _mv=zMove;zMove=function(dt){const sv=[];const slow=gmOn('slowaura');for(const b of zs_()){if(slow||b.crawlT>0){sv.push([b,b.sp]);b.sp=Math.min(b.sp||1,b.crawlT>0?.9:1.15)}}try{return _mv.apply(this,arguments)}finally{for(const[b,s]of sv)b.sp=s}}}
{const _nr=zNewRound;zNewRound=function(){const r=_nr.apply(this,arguments);try{CG.draws=0;CG.auraUsed=0;const A=CG.A;if(A){if(A.d.ty=='rnd'||A.id=='second'||A.id=='retain'){A.left--;if(A.left<=0){chEnd(A);msg(A.d.n+' ended',1.4)}}}}catch(e){}return r}}
{const _rg=ragStart;ragStart=function(b){const r=_rg.apply(this,arguments);try{if(b&&b.zom&&!b.hound&&gmOn('graviton')){b.grv={t:0,vy:3+Math.random()*3,sp:2+Math.random()*3}}}catch(e){}return r}}
{const _ba=zBoxAct;zBoxAct=function(o,i){CG.inBox=1;try{return _ba.apply(this,arguments)}finally{CG.inBox=0}}}
{const _bw=zBuyWall;zBuyWall=function(k,pos){CG.inWall=1;try{return _bw.apply(this,arguments)}finally{CG.inWall=0}}}
{const _gv=zGive;zGive=function(k){const r=_gv.apply(this,arguments);try{if((CG.inBox&&gmOn('overcharge'))||(CG.inWall&&gmOn('wallup'))){const w=wp[cur];if(w&&w.k==k){CG.A.ch--;for(let n=0;n<3;n++)if((w.pap||0)<3)zPap(w);setGun();burst(V(P.x,1.3,P.z),30,0xff7a3a,6,.8,.1);msg('Fully upgraded',1.6)}}}catch(e){}return r}}
{const _mm=zBoxMoveStart;zBoxMoveStart=function(o,i){if(gmOn('lock')){CG.A.ch--;msg('LOOT LOCK: the box stays',2);try{EST.bx.uses=0}catch(e){}zBoxEnd(o,i);zBoxStart(o,i,o.by);return}return _mm.apply(this,arguments)}}
{const _ha=eqHandAnim;eqHandAnim=function(n,d,f){return _ha.call(this,n,gmOn('dex')?d*.6:d,f)}}
{const _jh=juiceHit;juiceHit=function(b,d,head){const r=_jh.apply(this,arguments);try{if(CG.cos.squeak&&b&&b.zom)chSqueak()}catch(e){}return r}}
{const _zs=zStart;zStart=function(){const r=_zs.apply(this,arguments);try{cgLoad();CG.A=null;CG.cos={};CG.draws=0;CG.pool=[];CG.trail.length=0;CG.slip.length=0;CG.fz=[];CG.fzOn=0;CG.th=0;CG.ocB=CG.hvB=null;CG.ptsL=null;CG.auraUsed=0;CG.rt=null;CG.pend=null;chAskUI(null);chBubKill();chPlace()}catch(e){console.warn('chewables',e)}return r}}
/* ---- the always-visible gum card, the effect overlay, the interaction for Universal Refill ---- */
function chHud(){if(!CG.hud){const h=document.getElementById('hud');if(!h)return;const e=document.createElement('div');e.id='gumhud';h.appendChild(e);CG.hud=e}
 const A=CG.A,live=run&&mode=='Zombies'&&A&&gmLive(A),id=live?A.id:'';
 if(id!==CG.hid){CG.hid=id;if(live){const d=A.d;CG.hud.innerHTML=`<svg class="gmr" viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="29"/><circle class="fg" cx="32" cy="32" r="29" stroke-dasharray="182.2" stroke-dashoffset="0"/></svg><i style="--c:${chHex(d.c)}">${chIcon(id)}</i>${d.ty=='act'?`<em>${ctlKey('gum')}</em>`:''}`;CG.hud.style.setProperty('--c',chHex(d.c));CG.hud.className='on';CG.hfg=CG.hud.querySelector('.fg')}else{CG.hud.innerHTML='';CG.hud.className='';CG.hfg=null}}
 if(live&&CG.hfg){const d=A.d,n=d.cnt||1,f=d.ty=='rnd'?A.left/n:d.ty=='time'?A.t/n:d.ty=='act'?(A.run>0&&d.run?A.run/d.run:A.ch/n):((A.id=='second'||A.id=='retain')?A.left/n:A.ch/n);CG.hfg.style.strokeDashoffset=(182.2*(1-Math.max(0,Math.min(1,f)))).toFixed(1);CG.hud.classList.toggle('run',A.run>0)}}
/* ---- after the drop: take the gum or leave it (leaving it puts it back in your collection), then flip it into your mouth and blow a bubble ---- */
function chOffer(mc){CG.pend={id:mc.id,mc,t:0};chSnd('rare');chAskUI(mc.id)}
function chAskUI(id){let e=document.getElementById('gmask');if(!e){e=document.createElement('div');e.id='gmask';document.body.appendChild(e)}
 if(!id){e.className='';return}const d=CGD[id];e.style.setProperty('--c',chHex(d.c));
 e.innerHTML=`<span class="cw-ball">${chIcon(id)}</span><div class="gq"><small>${CGT[d.tr]} · ${CGY[d.ty]}</small><b>${d.n}</b><p>${d.d}</p></div><div class="gk"><kbd>${ctlKey('use')}</kbd><span>Chew it</span><kbd>${typeof usingPad!='undefined'&&usingPad?'B':'X'}</kbd><span>Leave it</span></div>`;e.className='on t-'+d.tr}
function chPendEnd(mc){if(mc.ball){S.remove(mc.ball.m);mc.ball=null}mc.off=0;mc.busy=0;chAskUI(null)}
function chAccept(){const p=CG.pend;if(!p)return;CG.pend=null;chPendEnd(p.mc);CG.bub={id:p.id,t:0,on:0,chew:0}}
function chDecline(loud){const p=CG.pend;if(!p)return;CG.pend=null;CG.own[p.id]=Math.min(999,(CG.own[p.id]||0)+1);cgSave();if(loud){flTone(520,330,.12,.05,0,'triangle');try{burst(V(p.mc.x,.2,p.mc.z),10,0x9aa4ae,2,.5,.05)}catch(e){}}chPendEnd(p.mc)}
function chBubKill(){const B=CG.bub;if(!B)return;for(const k of['toss','bub']){if(B[k]){C.remove(B[k])}}CG.bub=null;try{if(!P.dead)gun.visible=true}catch(e){}}
function chBubTick(dt){
 const pd=CG.pend;if(pd){pd.t+=dt;if(P.dead||!run||pd.t>20||Math.hypot(P.x-pd.mc.x,P.z-pd.mc.z)>7)chDecline(0);else{const g=typeof gpGet=='function'?gpGet():null,a=!!(g&&g.buttons[0]&&g.buttons[0].pressed),b2=!!(g&&g.buttons[1]&&g.buttons[1].pressed);if(a&&!CG.pa)chAccept();else if(b2&&!CG.pb)chDecline(1);CG.pa=a;CG.pb=b2}}
 const B=CG.bub;if(!B)return;const d=CGD[B.id],col=d.c;
 if(P.dead||!run||mode!='Zombies'){CG.own[B.id]=Math.min(999,(CG.own[B.id]||0)+1);cgSave();chBubKill();return}
 if(!B.on){B.on=1;B.toss=new THREE.Mesh(new THREE.SphereGeometry(.035,14,10),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.5)}));C.add(B.toss);
  const bm=new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:.62,shininess:140,specular:0xffffff,emissive:col,emissiveIntensity:.2,side:THREE.DoubleSide,depthWrite:false});B.bub=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),bm);
  const hl=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false}));hl.position.set(-.45,.5,.62);B.bub.add(hl);B.bub.visible=false;C.add(B.bub);flNoise(.16,500,2400,.05,'bandpass',1.4)}
 B.t+=dt;const t=B.t;gun.visible=false;try{hideFP()}catch(e){}nf=Math.max(nf,t0+.1);
 if(t<.6){const u=t/.6,w=1-u,A_=[.26,-.30,-.42],Bc=[.16,.34,-.38],E=[0,-.07,-.1];B.toss.position.set(w*w*A_[0]+2*u*w*Bc[0]+u*u*E[0],w*w*A_[1]+2*u*w*Bc[1]+u*u*E[1],w*w*A_[2]+2*u*w*Bc[2]+u*u*E[2]);B.toss.scale.setScalar(1+.35*Math.sin(u*Math.PI))}
 else if(B.toss){C.remove(B.toss);B.toss=null;flTone(520,300,.07,.06,0,'sine');flNoise(.05,1500,800,.05,'lowpass',1)}
 if(t>.62&&t<1.7&&t-B.chew>.2){B.chew=t;flNoise(.05,2600,1400,.04,'bandpass',2);flTone(230+Math.random()*40,160,.05,.035,0,'sine');shake=Math.max(shake,.06)}
 if(t>=1.7&&!B.blow){B.blow=1;B.bub.visible=true;flNoise(1.1,900,3400,.035,'bandpass',1.2);flTone(300,980,1.1,.014,0,'sine')}
 if(B.blow){const u=Math.min(1,(t-1.7)/1.15),e=u*u*(3-2*u),r=.02+.3*e,wob=Math.sin(t*17)*.035*e;B.bub.position.set(0,-.11+.04*e,-.4);B.bub.scale.set(r*(1+wob),r*(1-wob),r);B.bub.material.opacity=.62-.22*e;if(u>.6)shake=Math.max(shake,.05*u)}
 if(t>=2.9){const f=aimDir();try{burst(V(C.position.x+f.x*.7,C.position.y+f.y*.7-.1,C.position.z+f.z*.7),30,col,3.2,.6,.045);burst(V(C.position.x+f.x*.7,C.position.y+f.y*.7-.1,C.position.z+f.z*.7),10,0xffffff,5,.35,.03)}catch(e){}
  flNoise(.05,6200,3200,.13,'highpass');flTone(900,190,.07,.1,0,'sine');flNoise(.2,2600,800,.05,'bandpass',1);chSplat(col);chBubKill();chReveal(B.id)}}
function chSplat(col){let e=document.getElementById('gmsplat');if(!e){e=document.createElement('div');e.id='gmsplat';document.body.appendChild(e)}e.style.setProperty('--c',chHex(col));e.className='';void e.offsetWidth;e.className='on'}
addEventListener('keydown',e=>{if(!CG.pend||e.repeat||!run||paused)return;const k=typeof RB=='function'?RB(e.code):e.code;if(k=='KeyF'){e.stopImmediatePropagation();e.preventDefault();chAccept()}else if(k=='KeyX'){e.stopImmediatePropagation();e.preventDefault();chDecline(1)}},true);
function chFx(){if(!CG.fxEl){const e=document.createElement('div');e.id='gmfx';document.body.appendChild(e);CG.fxEl=e}const on=run&&mode=='Zombies';let c='';if(on){if(gmRun('ghost'))c+=' g-ghost';if(gmRun('freeze')||CG.fzOn)c+=' g-freeze';if(gmRun('stasis'))c+=' g-stasis';if(CG.cos.vintage)c+=' g-vint';if(CG.th>0)c+=' g-th';if(CG.disc>0||gmRun('discount'))c+=' g-disc'}if(CG.fxEl.className!==c)CG.fxEl.className=c}
addEventListener('keydown',e=>{if(!e.repeat&&run&&!paused&&!over&&mode=='Zombies'&&(typeof RB=='function'?RB(e.code):e.code)=='KeyJ')chUse()});
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{chTick(dt)}catch(e){console.warn('chewables tick',e)}}}
/* Universal Refill: a refill point that follows you around while the gum is active */
{const _t=LX.tick;LX.tick=function(dt){_t.call(this,dt);try{if(mode=='Zombies'&&zq&&gmOn('refill')){if(!CG.refillE){CG.refillE={x:0,z:0,r:2.6,txt:()=>'Refill ammo from anywhere',cost:()=>cw()&&cw().res<cw().m*cw().rs?600:0,act:()=>{const w=cw();if(zq.pts<600)return zf('Not enough points');zq.pts-=600;w.res=w.m*w.rs;w.mag=w.m;burst(V(P.x,1.2,P.z),20,0x60ff90,5,.6,.08);flTone(600,1200,.2,.06,0,'sine')}};zi.push(CG.refillE)}const f=aimDir();CG.refillE.x=P.x-f.x*2;CG.refillE.z=P.z-f.z*2}else if(CG.refillE){const j=zi.indexOf(CG.refillE);if(j>=0)zi.splice(j,1);CG.refillE=null}}catch(e){}}}
/* ---- the gum picker: the CHEWABLES button on the home screen ---- */

/* ======================= EMOTES =======================
   Hold the emote key (K, or D-pad down) for a radial wheel, move the mouse (or right stick) to a slot, let go. You swing out into a third-person view, your weapon lowers, and your
   character plays the emote. Moving, firing, jumping or taking damage ends it. Other players see it: the emote id travels in the normal player-state message. */
var EMN=['Wave','Cheer','Dance','Flex','Salute','Clap','Shrug','Spin'],EMLEN=[2.6,3,7,3,2.2,3,2.2,1.6],
 EMI=[`<path d="M9 17V8a2 2 0 0 1 4 0v6M13 14V6a2 2 0 0 1 4 0v8M17 14V8a2 2 0 0 1 4 0v9c0 7-4 11-9 11-4 0-6-2-8-6l-1-6a2 2 0 0 1 3-1z"/>`,
 `<circle cx="16" cy="9" r="3"/><path d="M16 12v9M7 4l9 8 9-8M12 29l4-8 4 8"/>`,
 `<path d="M12 24V8l14-3v16"/><circle cx="9" cy="24" r="3"/><circle cx="23" cy="21" r="3"/>`,
 `<path d="M5 23c0-8 5-14 12-14 4 0 6 3 6 6 0 4-4 4-4 9"/><path d="M10 29h12"/>`,
 `<circle cx="14" cy="15" r="5"/><path d="M19 11l9-5M5 29v-6a9 9 0 0 1 18 0v6"/>`,
 `<path d="M12 6L6 15a3 3 0 0 0 5 3M20 6l6 9a3 3 0 0 1-5 3M12 21l4 6 4-6"/>`,
 `<circle cx="16" cy="8" r="3"/><path d="M3 21l9-5h8l9 5M16 11v14M10 29l6-3 6 3"/>`,
 `<path d="M26 16a10 10 0 1 1-4-8"/><path d="M26 4v6h-6"/>`],
 EMO={open:0,sel:-1,vx:0,vy:0,cur:null,av:null,pad:0};
for(const {name,length,path} of Object.values(PASS_EMOTES)){EMN.push(name);EMLEN.push(length);EMI.push(path)}
/* one pose for any rig: the same IK convention as the podium figures (shoulders at +-0.3, 1.5; hands are targets; hints bend the elbows) */
function emoPose(rig,e,t,dur){const a=Math.min(1,t/.2,Math.max(0,(dur-t)/.25));let rh=V(.36,.9,.05),lh=V(-.36,.9,.05),hr=V(.6,-1,-.3),hl=V(-.6,-1,-.3),y=0,ry=0,lx=0,lz=0,sx=0;
 switch(e){
 case 0:rh.lerp(V(.5+Math.sin(t*9)*.15,2,.1),a);hr=V(.8,-.6,-.2);ry=.25*a;break;
 case 1:{const u=Math.sin(t*11);rh.lerp(V(.46,2.05+u*.1,.04),a);lh.lerp(V(-.46,2.05-u*.1,.04),a);hr=V(.9,-.5,-.2);hl=V(-.9,-.5,-.2);y+=Math.abs(Math.sin(t*6.5))*.3*a;sx=.5*a;break}
 case 2:{const ph=Math.floor(t/2.2)%3,u=Math.sin(t*8),w=Math.sin(t*4);
  if(ph==0){rh.lerp(V(.5,1.5+u*.45,.22),a);lh.lerp(V(-.5,1.5-u*.45,.22),a);ry=w*.55*a;y+=Math.abs(u)*.1*a;lx=u*.6*a}
  else if(ph==1){rh.lerp(V(.62,1.95+u*.12,.1),a);lh.lerp(V(-.3,1.1,.3),a);ry=w*.7*a;y+=Math.abs(u)*.14*a;lx=u*.55*a;lz=w*.12*a}
  else{rh.lerp(V(.45+w*.15,1.2+Math.abs(u)*.5,.3),a);lh.lerp(V(-.45+w*.15,1.2+Math.abs(Math.sin(t*8+1.6))*.5,.3),a);ry=Math.sin(t*2)*.9*a;y+=Math.abs(u)*.12*a;lx=u*.5*a;sx=Math.max(0,-u)*.4*a}break}
 case 3:rh.lerp(V(.6,1.95,.02),a);lh.lerp(V(-.6,1.95,.02),a);hr=V(1,-.3,-.1);hl=V(-1,-.3,-.1);y+=Math.sin(t*5)*.015*a;ry=Math.sin(t*3)*.15*a;break;
 case 4:rh.lerp(V(.12,1.78,.28),a);hr=V(.9,-.2,-.3);ry=.1*a;break;
 case 5:{const c=Math.abs(Math.sin(t*10));rh.lerp(V(.1+.2*c,1.3,.4),a);lh.lerp(V(-.1-.2*c,1.3,.4),a);hr=V(.6,-.8,.2);hl=V(-.6,-.8,.2);y+=c*.02*a;break}
 case 6:rh.lerp(V(.75,1.35+Math.sin(t*6)*.04,.2),a);lh.lerp(V(-.75,1.35+Math.sin(t*6)*.04,.2),a);hr=V(1,-.4,.4);hl=V(-1,-.4,.4);y-=.03*a;break;
 case 7:{rh.lerp(V(.9,1.45,.05),a);lh.lerp(V(-.9,1.45,.05),a);hr=V(1,-.3,0);hl=V(-1,-.3,0);const k=Math.min(1,t/Math.max(.1,dur-.15));ry=k*k*(3-2*k)*Math.PI*4;lx=Math.sin(t*14)*.3*a;break}
 case 8:{const d=Math.sin(Math.PI*t/dur);rh.lerp(V(.31,1.43,.57),d);lh.lerp(V(-.32,.76,.45),d);y=-d*.22;sx=d*.75;lx=d*.4;break}
 case 9:{const f=Math.sin(t*4.5);rh.lerp(V(.73,1.73+.09*f,.45),a);lh.lerp(V(-.12,1.17,.25),a);ry=.34*a;break}
 case 10:{const f=Math.sin(Math.PI*Math.min(1,t/dur));rh.lerp(V(.57*f,1.35+.61*f,.45),a);lh.lerp(V(-.57*f,1.35+.61*f,.45),a);y=Math.max(0,Math.sin(t*5))*f*.14;sx=.2*f;break}
 }
 rig.legL.rotation.x=lx;rig.legR.rotation.x=-lx;rig.legL.rotation.z=lz;rig.legR.rotation.z=-lz;rig.shinL.rotation.x=sx+Math.max(0,-lx)*.8;rig.shinR.rotation.x=sx+Math.max(0,lx)*.8;
 ik(V(.3,1.5,0),rh,hr,rig.armR);ik(V(-.3,1.5,0),lh,hl,rig.armL);return{y,ry}}
/* other players: their rig poses from the id in their state message, and their gun is lowered while they do it */
function emoBot(b,dt){if(b._eid!==b.em){b._eid=b.em;b._et=0}b._et+=dt;const dur=EMLEN[b.em]||3,o=emoPose(b.rig,b.em,b._et%(dur+.0001),dur);b.m.position.y=(b.y||0)+o.y;if(b.ry!=null)b.m.rotation.y=b.ry+o.ry;if(b.hg)b.hg.visible=false}
{const _ab=animBot;animBot=function(b,dt){const r=_ab.apply(this,arguments);try{if(b&&b.rig&&b.net){if(b.em>=0)emoBot(b,dt);else if(b._eid>=0){b._eid=-1;if(b.rig.legL){b.rig.legL.rotation.z=0;b.rig.legR.rotation.z=0}}}}catch(e){}return r}}
function emoWheel(show){let w=document.getElementById('emw');if(!w){w=document.createElement('div');w.id='emw';w.innerHTML='<div class="ring"></div>'+Array.from({length:8},(_,i)=>`<div class="sl" data-i="${i}" style="--a:${i*45}deg"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg><b></b><em>${i+1}</em></div>`).join('')+'<div class="ct"><small>EMOTE</small><b id="emn">Move to choose</b></div>';document.body.appendChild(w)}
 w.classList.toggle('on',!!show);if(show){
  for(const slot of w.querySelectorAll('.sl')){
   const i=+slot.dataset.i,id=i===7?passEmote():i;
   slot.querySelector('svg').innerHTML=EMI[id];slot.querySelector('b').textContent=EMN[id];
  }
  emoShow();
 }}
function emoShow(){const w=document.getElementById('emw');if(!w)return;for(const s of w.querySelectorAll('.sl'))s.classList.toggle('on',+s.dataset.i==EMO.sel);const n=w.querySelector('#emn');if(n)n.textContent=EMO.sel>=0?EMN[EMO.sel===7?passEmote():EMO.sel]:'Move to choose'}
function emoPick(){const L=Math.hypot(EMO.vx,EMO.vy);if(L<26){if(EMO.sel!=-1){EMO.sel=-1;emoShow()}return}const ang=(Math.atan2(EMO.vx,-EMO.vy)+6.2832)%6.2832,s=Math.floor(ang/.7854+.5)%8;if(s!=EMO.sel){EMO.sel=s;emoShow();flTone(1500+s*60,1400,.03,.025,0,'sine')}}
function emoOpen(){if(EMO.open||!run||paused||over||P.dead||document.getElementById('chatbox')&&document.activeElement&&document.activeElement.tagName=='INPUT')return;EMO.open=1;EMO.sel=-1;EMO.vx=EMO.vy=0;emoWheel(true)}
function emoClose(play){if(!EMO.open)return;EMO.open=0;emoWheel(false);if(play&&EMO.sel>=0)emoStart(EMO.sel===7?passEmote():EMO.sel)}
function emoStart(id){if(!run||P.dead||paused)return;const idOp=passOperator();if(!EMO.av||EMO.av.operator!==idOp){if(EMO.av)S.remove(EMO.av.g);const g=new THREE.Group(),rig=mkHuman(g,idOp?{operator:idOp}:undefined);if(teamMode())markOperatorTeam(rig,myTeam);g.visible=false;S.add(g);EMO.av={g,rig,operator:idOp}}
 EMO.cur={id,t:0,dur:EMLEN[id],hp:P.hp,nb:0,sw:0};EMO.av.g.visible=true;flNoise(.18,400,1800,.04,'bandpass',1.2);flTone(380,620,.14,.04,0,'triangle')}
function emoEnd(){const c=EMO.cur;EMO.cur=null;if(EMO.av){EMO.av.g.visible=false;EMO.av.rig.legL.rotation.z=0;EMO.av.rig.legR.rotation.z=0}if(c){try{if(!P.dead)gun.visible=true}catch(e){}}}
/* before the frame is drawn: the wheel's controller input, the third-person camera and the character's pose */
function emoCam(dt){
 try{const g=typeof gpGet=='function'?gpGet():null;if(g&&g.buttons&&g.buttons[13]){const d=!!g.buttons[13].pressed;if(d&&!EMO.pad)emoOpen();if(!d&&EMO.pad)emoClose(true);EMO.pad=d;if(EMO.open&&g.axes&&(Math.abs(g.axes[2])>.3||Math.abs(g.axes[3])>.3)){EMO.vx=g.axes[2]*90;EMO.vy=g.axes[3]*90;emoPick()}}}catch(e){}
 if(EMO.open&&(!run||paused||P.dead||over)){EMO.open=0;emoWheel(false)}
 const c=EMO.cur;if(!c)return;
 if(!run||paused||P.dead||over||trig||!P.on||Math.hypot(P.mx||0,P.mz||0)>.7||P.hp<c.hp-.5||EMO.open){emoEnd();return}
 c.t+=dt;if(c.t>=c.dur){emoEnd();return}
 const av=EMO.av,o=emoPose(av.rig,c.id,c.t,c.dur);av.g.position.set(P.x,P.y+o.y,P.z);av.g.rotation.y=yaw+Math.PI+o.ry;av.g.visible=true;
 const k=Math.min(1,c.t/.6),e=k*k*(3-2*k),phi=yaw+2.6*e,sx=Math.sin(phi),sz=Math.cos(phi);let cx=P.x,cz=P.z;
 for(let i=0;i<7;i++){const q={x:cx,y:P.y+1,z:cz};mv(q,sx*.4,sz*.4,.28);if(Math.hypot(q.x-(cx+sx*.4),q.z-(cz+sz*.4))>.03)break;cx=q.x;cz=q.z}
 C.position.set(cx,P.y+1.5+.15*e,cz);C.lookAt(P.x,P.y+1.1,P.z);
 gun.visible=false;try{hideFP()}catch(x){}nf=Math.max(nf,t0+.1);
 if(c.id==2&&c.t>=c.nb){c.nb+=.4545;flTone(110,52,.14,.1,0,'sine');if(Math.round(c.t/.4545)%2)flNoise(.05,6000,4000,.03,'highpass',1)}}
{const _t=LX.tick;LX.tick=function(dt){try{emoCam(dt)}catch(e){console.warn('emote',e)}return _t.call(this,dt)}}
addEventListener('keydown',e=>{if(e.repeat||!run||paused||over||P.dead)return;const t=document.activeElement&&document.activeElement.tagName;if(t=='INPUT'||t=='TEXTAREA')return;const k=typeof RB=='function'?RB(e.code):e.code;
 if(k=='KeyK')emoOpen();else if(EMO.open&&/^Digit[1-8]$/.test(e.code)){e.stopImmediatePropagation();e.preventDefault();EMO.sel=+e.code.slice(5)-1;emoShow()}},true);
addEventListener('keyup',e=>{const k=typeof RB=='function'?RB(e.code):e.code;if(k=='KeyK'&&EMO.open)emoClose(true)},true);
addEventListener('mousemove',e=>{if(!EMO.open)return;EMO.vx+=e.movementX||0;EMO.vy+=e.movementY||0;const L=Math.hypot(EMO.vx,EMO.vy);if(L>90){EMO.vx*=90/L;EMO.vy*=90/L}emoPick()},true);
