/* ===================== mastery.js ===================== */
/* ---------- Progression: levels 1-55, prestige 1-10, Prestige Master (to 1250), unlocks, weapon mastery, camos ---------- */
const UNL={AR:1,MG:1,SMG:8,BR:16,MP:24,SG:32,'Extended Mag':2,'Compensator':6,'Laser Sight':12,'Fast Hands':18,'Long Barrel':28,'Hollow Point':40,Frag:1,Impact:22,Marathon:4,Scavenger:14,Overshield:26,'Spring Legs':36,'Second Wind':44,'Hardline':50,'Run & Gun':10,VMP:20,RG:30,CY:34,CT:12};
const CATS={Rifles:['AR','BR'],'Close Quarters':['SMG','SG','VMP'],Sidearms:['CT','MG','MP','RG'],'Power Weapons':['RL','SN'],Support:['CY']};
let srcK='',curCamo=null,prof=(()=>{try{const p=JSON.parse(localStorage.getItem('sd-prof'));if(p&&p.v==1)return p}catch(e){}return{v:1,lvl:1,xp:0,pres:0,master:0,ml:1,wk:{},camo:{}}})();
const save=()=>{try{localStorage.setItem('sd-prof',JSON.stringify(prof))}catch(e){}},need=()=>prof.master?1500:1500+prof.lvl*10,nm=k=>W[k]?W[k].n:k,tx={};
function unlocked(v){return !UNL[v]||prof.pres>0||prof.master||prof.all||prof.lvl>=UNL[v]}
function sanitize(){const u=unlocked;if(!u(L.p))L.p='AR';if(L.s&&!u(L.s))L.s='MG';if(L.g&&!u(L.g))L.g=null;L.pa=L.pa.filter(u);L.sa=L.sa.filter(u);L.pk=L.pk.filter(u);if(!L.s)L.sa=[]}
function rankTxt(){return prof.master?`Prestige Master ${prof.ml} / 1250 · ${prof.xp}/1500 XP`:`${prof.pres?'Prestige '+prof.pres+' · ':''}Level ${prof.lvl}${prof.lvl<55?` · ${prof.xp}/${need()} XP`:' (max) · ready to prestige'}`}
let mUps=[],won=0,mCost=1500;
function giveXP(g){if(prof.master){prof.xp+=g;while(prof.xp>=1500&&prof.ml<1250){prof.xp-=1500;prof.ml++;popup('PRESTIGE MASTER','Level '+prof.ml)}if(prof.ml>=1250)prof.xp=0}
 else if(prof.lvl<55){prof.xp+=g;while(prof.xp>=need()&&prof.lvl<55){prof.xp-=need();prof.lvl++;const u=[];if(!prof.pres)for(const k in UNL)if(UNL[k]==prof.lvl)u.push(nm(k));mUps.push(...u);popup('LEVEL UP','Level '+prof.lvl+(u.length?' · Unlocked '+u.join(', '):prof.lvl>=55?' · Prestige available!':''))}if(prof.lvl>=55)prof.xp=0}save()}
function killXP(head){const x=Math.min(Math.round(mCost*(.06+(head?.03:0)+Math.min(streak,5)*.005)),Math.max(0,2.5*mCost-mxp));mxp+=x;giveXP(x);return x}
function bonusXP(f){const x=Math.min(Math.round(mCost*f),Math.max(0,3*mCost-mxp));mxp+=x;giveXP(x)}
function awardXP(){let b=Math.min(Math.round(mCost*(.5+(won?.5:0))),Math.max(0,3*mCost-mxp));if(mxp+b<mCost)b=mCost-mxp;if(b>0){giveXP(b);mxp+=b}return `+${mxp} XP (${(mxp/mCost).toFixed(1)} levels) · ${rankTxt()}${mUps.length?'<br>Unlocked: '+mUps.join(', '):''}${prof.lvl>=55&&!prof.master?'<br>Open the menu to prestige!':''}`}
function doPrestige(){if(prof.master||prof.lvl<55)return;if(!confirm(prof.pres<10?`Prestige ${prof.pres+1}? You go back to level 1 but keep all unlocks and camos.`:'Become Prestige Master? Levels now go up to 1250.'))return;if(prof.pres<10)prof.pres++;else{prof.master=1;prof.ml=1}prof.lvl=1;prof.xp=0;save();showRank()}
function showRank(){$('#rank').textContent=rankTxt();homeStats();const b=$('#prest');b.style.display=!prof.master&&prof.lvl>=55?'inline-block':'none';b.textContent=prof.pres<10?'Prestige '+(prof.pres+1):'Become Prestige Master';sanitize();ui();masteryUI()}
/* weapon mastery: level every 15 kills (max 20), then prestige the weapon (3 times) */
const wd=k=>prof.wk[k]||(prof.wk[k]={k:0,c:0,p:0,z:0}),wlv=k=>Math.min(20,1+Math.floor(wd(k).c/15)),catOf=k=>Object.keys(CATS).find(c=>CATS[c].includes(k));
function camos(k){const w=wd(k),kc=[['Sand','#c8b27a',25],['Moss','#4f7a45',75],['Cobalt','#3d6ad6',150],['Crimson','#c0392b',225],['Violet','#8e44ad',300],['Neon','#29f0a0',375]].map(([n,c,r])=>({n,c,ok:w.k>=r,rq:r+' kills'})),
 pc=[['Ember','#ff7a2a'],['Frost','#8ad8ff'],['Aurora','#7affc8']].map(([n,c],i)=>({n,c,ok:w.p>=i+1,rq:'weapon prestige '+(i+1),pr:1})),
 gold=kc.every(c=>c.ok)&&w.k>=500,dia=CATS[catOf(k)].every(x=>wd(x).k>=500),dm=Object.keys(W).every(x=>wd(x).k>=500);
 return[...kc,...pc,{n:'Gold',c:'#ffc83a',ok:gold,rq:'500 kills',anim:1},{n:'Diamond',c:'#bff4ff',ok:dia,rq:'Gold on every '+catOf(k)+' weapon',anim:1},{n:'Dark Matter',c:'#1a0a2a',ok:dm,rq:'Diamond on every weapon',anim:1}].map(c=>({...c,ok:c.ok||!!prof.all}))}
/* zombies camo track: its own set of camos, earned with zombie kills (and best round). Both tracks can be equipped in either mode. */
function zcamos(k){const w=wd(k),z=w.z||0,zb=prof.zbest||0,
 kc=[['Rotted','#6b7a3a',25],['Bile','#9acd32',75],['Bone','#e3d8b8',150],['Blood','#8a1c1c',225],['Rust','#a5542a',300],['Toxic','#3cff7a',375]].map(([n,c,r])=>({n,c,ok:z>=r,rq:r+' zombie kills',s:'z'})),
 rc=[['Graveyard','#4a5a6a',10],['Wasteland','#b08a4a',15],['Hellscape','#c0301a',20]].map(([n,c,r])=>({n,c,ok:zb>=r,rq:'reach round '+r,s:'z'})),
 inf=kc.every(c=>c.ok)&&z>=500,nec=CATS[catOf(k)].every(x=>(wd(x).z||0)>=500),aby=Object.keys(W).every(x=>(wd(x).z||0)>=500);
 return[...kc,...rc,{n:'Inferno',c:'#ff6a1a',ok:inf,rq:'500 zombie kills',anim:1},{n:'Necrotic',c:'#3cff9a',ok:nec,rq:'500 zombie kills on every '+catOf(k)+' weapon',anim:1},{n:'Abyss',c:'#14061e',ok:aby,rq:'500 zombie kills on every weapon',anim:1}].map(c=>({...c,ok:c.ok||!!prof.all}))}
const allCamos=k=>[...camos(k),...zcamos(k)];
const okSet=()=>{const s=new Set();for(const k in W)for(const c of allCamos(k))if(c.ok)s.add(k+':'+c.n);return s};
function wkill(k){if(!k||!W[k])return;const w=wd(k),b=okSet(),l=wlv(k);w.k++;w.c++;for(const x of okSet())if(!b.has(x)){const[a,c]=x.split(':');popup('CAMO UNLOCKED',`${c} · ${nm(a)}`);feed(`Camo unlocked: ${c} (${nm(a)})`)}
 if(wlv(k)>l)popup('WEAPON LEVEL UP',`${nm(k)} · Level ${wlv(k)}`+(wlv(k)==20?' · Prestige it in the menu':''));save()}
function wzkill(k){if(!k||!W[k])return;const w=wd(k),b=okSet();w.z=(w.z||0)+1;for(const x of okSet())if(!b.has(x)){const[a,c]=x.split(':');popup('CAMO UNLOCKED',`${c} · ${nm(a)}`);feed(`Camo unlocked: ${c} (${nm(a)})`)}save()}
function zRoundDone(r){if(r<=(prof.zbest||0))return;const b=okSet();prof.zbest=r;const n=new Set();for(const x of okSet())if(!b.has(x))n.add(x.split(':')[1]);for(const c of n){popup('CAMO UNLOCKED',c+' · all weapons');feed('Camo unlocked: '+c)}save()}
function wpres(k){const w=wd(k);if(wlv(k)<20||w.p>=3)return;w.p++;w.c=0;popup('WEAPON PRESTIGE',`${nm(k)} · Prestige ${w.p}`);prof.camo[k]=['Ember','Frost','Aurora'][w.p-1];save();masteryUI()}
function camoTex(col,st){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=col;g.fillRect(0,0,64,64);
 if(st=='z'){for(let k=0;k<10;k++){g.fillStyle=`rgba(0,0,0,${.18+Math.random()*.2})`;g.beginPath();g.arc(Math.random()*64,Math.random()*64,3+Math.random()*9,0,7);g.fill()}for(let k=0;k<7;k++){const x=Math.random()*64;g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x,Math.random()*30,1+Math.random()*2,10+Math.random()*30)}for(let k=0;k<30;k++){g.fillStyle='rgba(255,255,255,.28)';g.fillRect(Math.random()*64,Math.random()*64,1.5,1.5)}}
 else for(let k=0;k<16;k++){g.fillStyle=`rgba(${k%2?'0,0,0':'255,255,255'},.22)`;g.beginPath();g.ellipse(Math.random()*64,Math.random()*64,5+Math.random()*10,3+Math.random()*7,Math.random()*3,0,7);g.fill()}return new THREE.CanvasTexture(c)}
/* the final three camos of each track are live shaders: Gold (molten gold), Diamond (prismatic ice), Dark Matter (swirling nebula),
   Inferno (flames and lava cracks), Necrotic (toxic plasma arcs), Abyss (a void with glowing rifts). All are driven by one time uniform. */
const ANIM={Gold:0,Diamond:1,'Dark Matter':2,Inferno:3,Necrotic:4,Abyss:5},rfm={};
const CAMO_VS=`varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=-mv.xyz;vP=(modelMatrix*vec4(position,1.0)).xyz-(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;gl_Position=projectionMatrix*mv;}`;
const CAMO_FS=`uniform float t;uniform float k;varying vec3 vN;varying vec3 vV;varying vec3 vP;
float hash(vec3 p){p=fract(p*0.3183099+vec3(0.1,0.2,0.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1.0,0.0,0.0)),f.x),mix(hash(i+vec3(0.0,1.0,0.0)),hash(i+vec3(1.0,1.0,0.0)),f.x),f.y),
 mix(mix(hash(i+vec3(0.0,0.0,1.0)),hash(i+vec3(1.0,0.0,1.0)),f.x),mix(hash(i+vec3(0.0,1.0,1.0)),hash(i+vec3(1.0,1.0,1.0)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=0.5;float s=0.0;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}
vec3 hsv(float h,float s,float v){vec3 c=clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);return v*mix(vec3(1.0),c,s);}
void main(){
 vec3 N=normalize(vN);vec3 V=normalize(vV);
 float nl=0.45+0.55*max(dot(N,normalize(vec3(0.3,0.8,0.6))),0.0);
 float fr=pow(1.0-max(dot(N,V),0.0),3.0);
 vec3 p=vP*7.0;vec3 col=vec3(0.0);
 if(k<0.5){
  float n=fbm(p*1.3+vec3(0.0,t*0.35,0.0));
  float vein=pow(abs(sin(n*9.0+t*1.2)),10.0);
  float band=smoothstep(0.82,1.0,sin((p.x+p.y*0.7+p.z)*2.2-t*2.4));
  float sp=pow(hash(floor(p*26.0)+floor(t*5.0)),24.0);
  col=mix(vec3(0.55,0.32,0.05),vec3(1.0,0.78,0.22),n)*nl;
  col+=vec3(1.0,0.9,0.5)*(vein*0.55+band*0.7)+vec3(1.0)*sp*1.5+vec3(1.0,0.75,0.2)*fr*0.6;
 }else if(k<1.5){
  float n=fbm(p*0.9+vec3(t*0.1,t*0.07,0.0));
  float ch=hash(floor(p*2.2));
  float facet=0.5+0.5*sin(ch*6.28+t*1.6);
  vec3 rb=hsv(fract(n*1.3+p.x*0.25+p.y*0.2+t*0.12),0.55,1.0);
  col=mix(vec3(0.62,0.86,1.0),rb,0.55)*(0.55+0.45*facet)*nl;
  float sp=pow(hash(floor(p*22.0)+floor(t*4.0)),26.0);
  float glint=smoothstep(0.9,1.0,sin((p.x-p.y)*3.0+t*2.0+ch*4.0));
  col+=vec3(1.0)*(sp*1.6+glint*0.6)+vec3(0.6,0.9,1.0)*fr*0.8;
 }else if(k<2.5){
  vec3 q=p*0.9;
  float sw=fbm(q+vec3(cos(t*0.2),sin(t*0.17),t*0.12));
  float sw2=fbm(q*1.8+sw*2.0-vec3(0.0,t*0.25,0.0));
  col=mix(vec3(0.02,0.0,0.06),vec3(0.38,0.08,0.75),pow(sw2,1.6));
  col=mix(col,vec3(0.0,0.9,1.0),pow(sw,5.0)*0.55);
  float arc=pow(max(0.0,sin(sw2*18.0-t*3.0)),14.0);col+=vec3(0.8,0.3,1.0)*arc*0.5;
  float hs=hash(floor(p*30.0));float st=pow(hs,32.0)*(0.5+0.5*sin(t*3.0+hs*6.0));col+=vec3(1.0)*st*1.8;
  col*=0.7+0.3*nl;col+=vec3(0.5,0.1,0.9)*fr*0.9;
 }else if(k<3.5){
  float f=fbm(vec3(p.x*1.4,p.y*1.4-t*1.1,p.z*1.4+t*0.25));
  float f2=fbm(vec3(p.x*2.8,p.y*2.8-t*1.9,p.z*2.8));
  float h=clamp(f*1.2+f2*0.5-0.2,0.0,1.0);
  col=mix(vec3(0.03,0.01,0.01),vec3(0.8,0.1,0.02),smoothstep(0.1,0.5,h));
  col=mix(col,vec3(1.0,0.6,0.1),smoothstep(0.45,0.8,h));
  col=mix(col,vec3(1.0,0.95,0.6),smoothstep(0.8,1.0,h));
  float crack=pow(1.0-abs(noise(p*1.7+vec3(0.0,t*0.2,0.0))*2.0-1.0),8.0);col+=vec3(1.0,0.4,0.05)*crack*0.8;
  float em=pow(hash(floor(vec3(p.x*20.0,p.y*20.0-t*6.0,p.z*20.0))),30.0);col+=vec3(1.0,0.7,0.2)*em*2.0;
  col*=0.65+0.35*nl;col+=vec3(1.0,0.35,0.05)*fr*0.7;
 }else if(k<4.5){
  float pl=sin(p.x*3.0+t*1.4)+sin(p.y*3.2-t*1.1)+sin((p.x+p.z)*2.4+t*0.8)+sin(length(p.xy+vec2(sin(t*0.4),cos(t*0.3)))*4.0-t*2.0);
  float n=fbm(p*1.2+vec3(0.0,0.0,t*0.3));
  col=mix(vec3(0.0,0.06,0.03),vec3(0.1,0.7,0.35),n);
  float arc=pow(1.0-abs(sin(pl*1.6+n*4.0)),10.0);col+=vec3(0.6,1.0,0.8)*arc*0.9;
  float bub=pow(hash(floor(p*14.0+vec3(0.0,t*1.5,0.0))),22.0);col+=vec3(0.7,1.0,0.7)*bub*1.5;
  col*=0.6+0.4*nl;col+=vec3(0.2,1.0,0.5)*fr*0.9;
 }else{
  float a=fbm(p*0.8+vec3(t*0.05,0.0,t*0.04));
  float rift=abs(fbm(p*1.1+a*2.0+vec3(0.0,t*0.2,0.0))-0.5);
  col=vec3(0.01,0.01,0.03)+vec3(0.02,0.04,0.12)*a;
  float glow=0.012/(rift+0.02);col+=vec3(1.0,0.12,0.08)*glow*0.35+vec3(1.0,0.8,0.6)*pow(glow,2.0)*0.02;
  float pulse=0.5+0.5*sin(t*1.5+a*6.0);col+=vec3(0.5,0.0,0.1)*pulse*pow(a,3.0)*0.6;
  float st=pow(hash(floor(p*34.0)),34.0);col+=vec3(0.7,0.8,1.0)*st*1.5;
  col*=0.7+0.3*nl;col+=vec3(0.9,0.1,0.15)*fr*0.8;
 }
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
function rfMat(n){return rfm[n]||(rfm[n]=new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:ANIM[n]}},vertexShader:CAMO_VS,fragmentShader:CAMO_FS}))}
function paintAll(m){for(const g of[gb,vmpG,knG,rgG,fpG])for(const p of g===gb?[gb]:g.children){if(p.userData.glow)continue;if(!p.userData.m0)p.userData.m0=p.material;p.material=m||p.userData.m0}}
function applyCamo(k){const n=prof.camo[k],c=n&&allCamos(k).find(x=>x.n==n&&x.ok);curCamo=c||null;paintAll(c&&c.anim?rfMat(c.n):null);const m=gb.userData.m0;m.emissive.setHex(0);
 if(!c||c.anim){m.map=null;m.color.setHex(W[k].col)}else{m.map=tx[c.n]||(tx[c.n]=camoTex(c.c,c.s));m.color.setHex(0xffffff)}m.needsUpdate=true}
function camoFx(){for(const n in rfm)rfm[n].uniforms.t.value=performance.now()/1000}
const camoSel=k=>{const o=c=>`<option value="${c.n}" ${prof.camo[k]==c.n?'selected':''}>${c.n}${c.anim?' ✦':''}</option>`,mp=camos(k).filter(c=>c.ok),zm=zcamos(k).filter(c=>c.ok);return `<select data-w="${k}"><option value="">Default camo</option>${mp.length?`<optgroup label="Multiplayer camos">${mp.map(o).join('')}</optgroup>`:''}${zm.length?`<optgroup label="Zombies camos">${zm.map(o).join('')}</optgroup>`:''}</select>`};
function masteryUI(){$('#wm').innerHTML=Object.keys(W).map(k=>{const w=wd(k),nx=camos(k).find(c=>!c.ok&&!c.pr);return `<div class="wr"><span><b>${nm(k)}</b> Lv ${wlv(k)}${w.p?' ★'+w.p:''} · ${w.k} kills</span><span>${camoSel(k)}${wlv(k)==20&&w.p<3?`<button class="btn sm" data-pw="${k}">Prestige weapon</button>`:''}</span><i>${nx?'Next camo: '+nx.n+' ('+nx.rq+')':'All camos unlocked'} · Weapon prestige ${w.p}/3</i></div>`}).join('');zmasteryUI()}
function zmasteryUI(){const e=$('#zwm');if(!e)return;e.innerHTML=Object.keys(W).map(k=>{const w=wd(k),nx=zcamos(k).find(c=>!c.ok);return `<div class="wr"><span><b>${nm(k)}</b> · ${w.z||0} zombie kills</span><span>${camoSel(k)}</span><i>${nx?'Next camo: '+nx.n+' ('+nx.rq+')':'All zombie camos unlocked'}</i></div>`}).join('')}
$('#wm').onchange=$('#zwm').onchange=e=>{const k=e.target.dataset.w;if(k){prof.camo[k]=e.target.value;save()}};$('#wm').onclick=e=>{const k=e.target.dataset.pw;if(k)wpres(k)};
$('#prest').onclick=doPrestige;showRank();

/* ===================== deathcam.js ===================== */
/* ---------- third-person death camera with ragdoll body ---------- */
let rag=[],camA=0;const lastDir=V(0,0,0);
function startDeath(){endDeath();camA=yaw;const c=V(P.x,P.y,P.z),cs=Math.cos(yaw),sn=Math.sin(yaw),dir=lastDir.lengthSq()>0?lastDir.clone():V(Math.random()-.5,0,Math.random()-.5).normalize();
 for(const[w,h,d,x,y,col]of[[.5,.56,.3,0,1.33,0x3d6ad6],[.26,.28,.28,0,1.78,0x4a4f57],[.11,.34,.11,-.38,1.4,0x3d6ad6],[.11,.34,.11,.38,1.4,0x3d6ad6],[.09,.32,.09,-.4,1.08,0x151515],[.09,.32,.09,.4,1.08,0x151515],[.19,.44,.21,-.12,.76,0x2a2f35],[.19,.44,.21,.12,.76,0x2a2f35],[.16,.44,.18,-.12,.3,0x2a2f35],[.16,.44,.18,.12,.3,0x2a2f35]]){
  const m=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:col}));m.scale.set(w,h,d);m.position.set(c.x+x*cs,c.y+y,c.z-x*sn);m.rotation.y=yaw;S.add(m);
  rag.push({m,hh:Math.min(w,h,d)/2,v:dir.clone().multiplyScalar(4+Math.random()*3).add(V((Math.random()-.5)*2,4+Math.random()*3,(Math.random()-.5)*2)),av:V((Math.random()-.5)*9,(Math.random()-.5)*5,(Math.random()-.5)*9)})}}
function endDeath(){for(const p of rag)S.remove(p.m);rag=[];gun.visible=true;lastDir.set(0,0,0)}
function deathCam(dt){gun.visible=false;for(const p of rag){p.v.y-=20*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=p.av.x*dt;p.m.rotation.y+=p.av.y*dt;p.m.rotation.z+=p.av.z*dt;
  if(p.m.position.y<p.hh){p.m.position.y=p.hh;p.v.y*=-.25;p.v.x*=.7;p.v.z*=.7;p.av.multiplyScalar(.6)}p.av.multiplyScalar(1-dt*1.2)}
 if(!rag.length)return;const t=rag[0].m.position;camA+=dt*.5;C.position.set(t.x+Math.sin(camA)*4.5,t.y+2.4,t.z+Math.cos(camA)*4.5);C.lookAt(t.x,t.y+.4,t.z)}

/* ===================== net.js ===================== */
/* ---------- private matches: peer-to-peer (PeerJS). The host runs the bots and game rules; friends join with a 5-letter code. All modes supported. ---------- */
let net=null,myId='',myName='',conns=[],isHost=0,netOn=0,scores={},names={},lastAtk='',nacc=0,bacc=0,oacc=0,pn=0,soloMode=null,maxP=0;
const CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',lobby=t=>$('#lb').textContent=t;
function lobbyList(){$('#plist').innerHTML=Object.entries(names).map(([i,n])=>`<li>${esc(n)}${i==myId?' (you)':''}</li>`).join('');$('#leave').style.display=net?'inline-block':'none'}
function netSend(m){m.id=myId;for(const c of conns)if(c.open)c.send(m)}
function fwd(d,from){for(const c of conns)if(c!==from&&c.open)c.send(d)}
function netClose(){for(const c of conns)try{c.close()}catch(e){}conns=[];if(net)try{net.destroy()}catch(e){}net=null;netOn=0;isHost=0;names={};scores={};document.body.classList.remove('net');$('#hostbox').style.display='none';lobbyList();if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}}
/* a match ended: everybody stays connected and returns to the same lobby; only leaving the lobby disconnects */
function netEnd(){netOn=0;scores={};pn=0;document.body.classList.remove('net');if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}lobbyList();lobby(isHost?'Match over. Everyone is still here. Pick a mode and map, then press Start match.':'Match over. Waiting for the host to start the next one…')}
function hostMatch(){netClose();maxP=app=='zm'?4:0;myName=$('#nm').value||'Host';let c='';for(let i=0;i<5;i++)c+=CH[Math.random()*CH.length|0];lobby('Connecting…');
 net=new Peer('sdrill-'+c);net.on('open',id=>{myId=id;isHost=1;names[id]=myName;$('#code').textContent=c;$('#hostbox').style.display='block';lobby('Share this code. Press Start when everyone has joined.');lobbyList()});
 net.on('connection',cn=>reg(cn));net.on('error',e=>lobby('Network error: '+e.type+(e.type=='unavailable-id'?' (try again)':'')))}
function joinMatch(){const c=$('#jc').value.trim().toUpperCase();if(c.length<5)return lobby('Enter the 5-letter code');netClose();myName=$('#nm').value||'Guest';lobby('Connecting…');
 net=new Peer();net.on('open',id=>{myId=id;names[id]=myName;reg(net.connect('sdrill-'+c,{reliable:true}))});net.on('error',e=>lobby(e.type=='peer-unavailable'?'No match found with that code':'Network error: '+e.type))}
function reg(cn){cn.on('open',()=>{if(isHost&&maxP&&conns.length>=maxP-1){cn.send({t:'full'});setTimeout(()=>{try{cn.close()}catch(e){}},400);return}conns.push(cn);cn.send({t:'hi',id:myId,n:myName});lobby(isHost?'Player joined':'Connected. Waiting for the host to start…')});
 cn.on('data',d=>onMsg(d,cn));cn.on('close',()=>{conns=conns.filter(x=>x!==cn);dropPeer(cn.peer);if(!isHost&&!conns.length)lobby('The host closed the lobby')})}
function dropPeer(id){const i=bots.findIndex(b=>b.net&&b.id==id);if(i>=0){S.remove(bots[i].m);bots.splice(i,1)}if(names[id]&&run)feed(names[id]+' left');delete names[id];lobbyList()}
const nmOf=k=>names[k]||(bots.find(b=>(b.hb||!b.net)&&('b'+b.i)==k)||{}).nm||'?';
/* host-side scoring for kills made by someone other than the host's own hits */
function credit(by){if(!isHost||mode=='Private')return;const kb=by==myId?P:bots.find(b=>(b.net?b.id:'b'+b.i)==by);if(!kb)return;const tm=kb===P?pTeam():kb.team;ts[tm]=(ts[tm]||0)+1;if(kb!==P)kb.k=(kb.k||0)+1}
function announce(t,by){if(netOn&&isHost&&mode!='Private')netSend({t:'dead',v:'b'+t.i,by:by===P?myId:by.net?by.id:'b'+by.i})}
function syncPuppets(l){const ids=new Set(l.map(e=>e[0]));for(let k=bots.length-1;k>=0;k--)if(bots[k].hb&&!ids.has(bots[k].i)){S.remove(bots[k].m);bots.splice(k,1)}
 for(const[i,team,al,x,z,nm,wk,rlo]of l){let b=bots.find(q=>q.hb&&q.i==i);if(!b){b=addBot(1e9,1);b.net=1;b.hb=1;b.i=i;b.id='b'+i;b.x=b.tx=x;b.z=b.tz=z;b.ty=0;b.yaw=0;b.m.children[0].material.color.setHex(team=='A'?0x3d6ad6:team=='B'?0xb5452e:new THREE.Color().setHSL((i*.15)%1,.6,.42).getHex())}
  if(Math.hypot(x-b.tx,z-b.tz)>.05)b.yaw=Math.atan2(x-b.tx,z-b.tz)-Math.PI;b.team=team;b.nm=nm;b.al=al;setHeld(b,wk);b.rlOn=!!rlo;b.tx=x;b.tz=z}}
function onMsg(d,cn){if(isHost&&d.t!='hi'&&d.t!='roster')fwd(d,cn);
 switch(d.t){
 case'hi':names[d.id]=d.n;if(isHost){cn.send({t:'roster',r:{...names}});fwd(d,cn)}lobbyList();break;
 case'roster':Object.assign(names,d.r);lobbyList();break;
 case'full':lobby('That lobby is full (4 players)');netClose();break;
 case'start':beginNet(d.map,d.mode,d.teams);break;
 case's':{const b=bots.find(b=>b.net&&b.id==d.id);if(b){b.tx=d.x;b.ty=d.y;b.tz=d.z;b.yaw=d.yaw;if(d.w)setHeld(b,d.w);b.rlOn=!!d.r;b.zpts=d.p;b.dn=d.dn;if(b.al&&!d.al)burst(V(b.x,1,b.z),16,0x3d6ad6,6,.8,.15);b.al=d.al}break}
 case'hit':if(d.to==myId&&run&&!P.dead){lastAtk=d.bot!=null?'b'+d.bot:d.id;hurt(d.d,bots.find(b=>b.net&&b.id==lastAtk))}break;
 case'bh':if(isHost&&mode!='Private'){const t=bots.find(b=>!b.net&&b.i==d.i&&b.al),by=bots.find(b=>b.net&&b.id==d.id);if(t&&by)botHit(t,d.d,by)}break;
 case'dead':{const by=d.by;if(by!=myId)feed(by?`${nmOf(by)} ▸ ${nmOf(d.v)}`:nmOf(d.v)+' died');
  if(mode=='Private'){if(by)scores[by]=(scores[by]||0)+1}else if(isHost&&by)credit(by);
  if(by==myId&&d.v!=myId){kills++;const b=bots.find(b=>b.net&&b.id==d.v);if(b){featKill(b,0);juiceKill(b,0)}}break}
 case'sh':{const b=bots.find(b=>b.net&&b.id==d.id);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z));break}
 case'bsh':if(!isHost){const b=bots.find(b=>b.hb&&b.i==d.i);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z),b.team=='A'?0x62a8ff:0xff5a3a)}break;
 case'ob':obText=d.s;break;
 case'z':if(!isHost){ds=d.ds;d.z.forEach((a,k)=>{const z=zones[k];if(!z)return;z.o=a[0];z.cp=a[1]})}break;
 case'b':if(!isHost)syncPuppets(d.l);break;
 case'f':if(!isHost){d.f.forEach((a,i)=>{const f=flags[i];if(!f)return;if(a[3]==myId&&f.byk!=myId)msg('You have the flag! Bring it home',2.5);f.st=a[0];f.x=a[1];f.z=a[2];f.byk=a[3]});if(d.cs)cs=d.cs}break;
 case'feed':if(!isHost)feed(d.s);break;
 case'pop':if(!isHost)popup(d.a,d.b);break;
 case'end':if(!isHost){let w=d.w;if(teamMode())w=(w=='Victory')==(myTeam==d.ht)?'Victory':'Defeat';else if(w=='Victory')w=(names[d.id]||'Host')+' wins';netBd=d.bd||null;netSc=d.sc||null;endGame(w)}break;default:if(d.t&&d.t.length>1&&d.t[0]=='z')zNet(d,cn)}}
function addNetBot(id,team){const b=addBot(1e9,1);b.net=1;b.id=id;b.al=0;b.m.visible=false;b.tx=b.ty=b.tz=b.x=b.z=b.yaw=0;b.team=team||id;b.nm=names[id]||'Player';b.k=0;
 b.m.children[0].material.color.setHex(b.team=='A'?0x3d6ad6:b.team=='B'?0xb5452e:new THREE.Color().setHSL((++pn*.17)%1,.6,.45).getHex())}
function hostStart(){let m=$('#pmode').value,map=$('#pm').value;const pick=a=>a[Math.random()*a.length|0];
 if(m=='Zombies'){if(Object.keys(names).length>4)return lobby('Zombies supports up to 4 players');map=Object.keys(MAPS).find(k=>MAPS[k].zm)}
 else{if(m=='?')m=pick(['Private',...Object.keys(MODES).filter(k=>k!='Zombies')]);if(map=='?'||MAPS[map].zm)map=pick(Object.keys(MAPS).filter(k=>!MAPS[k].zm))}
 const tm=m=='Team Deathmatch'||m=='Capture the Flag'||m=='Domination',teams={};Object.keys(names).forEach((id,k)=>teams[id]=m=='Zombies'?'A':tm?(k%2?'B':'A'):id);netSend({t:'start',map,mode:m,teams});beginNet(map,m,teams)}
function beginNet(map,m,teams){if(soloMode==null)soloMode=sel.mode;sel.map=map;sel.mode=m;mpTeams=teams;myTeam=teams[myId]||'A';netOn=1;scores={};pn=0;document.body.classList.add('net');startGame();for(const id in names)if(id!=myId)addNetBot(id,teams[id]);
 if(!isHost){paused=1;$('#pt').textContent='Match ready';$('#pause').style.display='block'}}
function netShot(k,o,d,len){netSend({t:'sh',w:k,x:+(o.x+d.x*len).toFixed(1),y:+(o.y+d.y*len).toFixed(1),z:+(o.z+d.z*len).toFixed(1)})}
function mpEnd(t){netSend({t:'end',w:t,ht:myTeam,bd:board().map(r=>[r.id,r.nm,r.k,r.d,r.tm]),sc:teamMode()?(mode=='Capture the Flag'?cs:mode=='Domination'?ds:{A:ts.A||0,B:ts.B||0}):null})}
function netTick(dt){if(!run)return;nacc+=dt;if(nacc>.066){nacc=0;netSend({t:'s',x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:+yaw.toFixed(2),al:P.dead?0:1,w:cw().k,r:rel>0?1:0,p:zq?zq.pts:0,dn:zq&&zq.down?1:0})}
 if(isHost&&mode!='Private'){bacc+=dt;if(bacc>.1){bacc=0;if(mode!='Zombies')netSend({t:'b',l:bots.filter(b=>!b.net).map(b=>[b.i,b.team,b.al?1:0,+b.x.toFixed(1),+b.z.toFixed(1),b.nm,b.wk,b.rl>0?1:0])})}oacc+=dt;if(oacc>.25){oacc=0;netSend({t:'ob',s:$('#ob').textContent})}}
 const k=Math.min(1,dt*12);for(const b of bots)if(b.net){b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,b.y,b.z);b.tyaw=b.yaw+Math.PI;if(!b.al&&b.ry==null)b.m.rotation.y=b.tyaw;const lie=mode=='Zombies'&&!b.al&&b.dn;if(!b.al){b.m.rotation.y=b.tyaw}b.m.rotation.x=lie?-1.5:0;b.m.position.y=lie?.16:0;b.m.visible=!!b.al||!!lie;b.hp=1e9}
 if(!isHost&&mode=='Domination')for(const z of zones)zoneVis(z);
 if(!isHost&&mode=='Capture the Flag')for(const f of flags){f.m.position.set(f.x,0,f.z);f.m.visible=f.byk!=myId}}
function privTick(){const top=Math.max(0,...Object.values(scores));$('#ob').textContent=`Players only · You ${scores[myId]||0} · Top ${top} / 15`;for(const id in scores)if(scores[id]>=15){endGame(id==myId?'Victory':(names[id]||'A player')+' wins');return}}

/* ===================== menu.js ===================== */
/* ---------- main menu, pause menu, dev menu ---------- */
let vol=1,shk=1,ma=0,fovBase=80;const $$=q=>document.querySelectorAll(q);
$('#pmode').innerHTML='<option value="Private">Free-for-all (players only)</option>'+Object.keys(MODES).filter(k=>k!='Zombies').map(k=>`<option>${k}</option>`).join('')+'<option value="?">Random mode</option>';
for(const k in MAPS)if(!MAPS[k].zm)$('#pm').insertAdjacentHTML('beforeend',`<option>${k}</option>`);$('#pm').insertAdjacentHTML('beforeend','<option value="?">Random map</option>');
try{$('#nm').value=localStorage.getItem('sdrill-name')||('Player'+(100+Math.random()*900|0))}catch(e){$('#nm').value='Player'+(100+Math.random()*900|0)}$('#nm').oninput=()=>{try{localStorage.setItem('sdrill-name',$('#nm').value.trim().slice(0,12))}catch(e){}};buildMap();
$$('#nav button[data-p]').forEach(b=>b.onclick=()=>{$$('#nav button').forEach(x=>x.classList.toggle('on',x==b));$$('.pn').forEach(p=>p.classList.toggle('on',p.id=='p-'+b.dataset.p))});$('#nav button').click();
/* two apps: the home screen leads to the Zombies menu or the Multiplayer menu */
let app='mp';
function homeStats(){$('#zbest').textContent='Best round: '+(prof.zbest||0);$('#hzs').textContent='Best round '+(prof.zbest||0);$('#hms').textContent=rankTxt()}
function fillPriv(a){const zm=a=='zm';$('#pmode').innerHTML=zm?'<option value="Zombies">Zombies co-op</option>':('<option value="Private">Free-for-all (players only)</option>'+Object.keys(MODES).filter(k=>k!='Zombies').map(k=>`<option>${k}</option>`).join('')+'<option value="?">Random mode</option>');
 $('#pm').innerHTML=zm?`<option>${Object.keys(MAPS).find(k=>MAPS[k].zm)}</option>`:(Object.keys(MAPS).filter(k=>!MAPS[k].zm).map(k=>`<option>${k}</option>`).join('')+'<option value="?">Random map</option>');
 $('#pmodeL').style.display=$('#pmL').style.display=zm?'none':'block';$('#p-priv h2').textContent=zm?'Zombies co-op (up to 4 players)':'Private match'}
function setApp(a){app=a;fillPriv(a);const m=$('#menu');m.className=a;$('#home').style.display='none';m.style.display='block';
 if(a=='zm'){if(!selKeep)selKeep={mode:sel.mode,map:sel.map,rm:sel.rm,rp:sel.rp};sel.mode='Zombies';sel.rm=sel.rp=0;fixZM()}else restoreSel();
 buildMap();ui();showRank();$('#nav button.'+a).click()}
function goHome(){restoreSel();buildMap();ui();$('#menu').style.display='none';$('#home').style.display='block';showRank()}
$('#gq').value=gfxQ;$('#gq').onchange=e=>setGfx(e.target.value);$('#hz').onclick=()=>setApp('zm');$('#hmp').onclick=()=>setApp('mp');$('#back').onclick=goHome;$('#zgo').onclick=()=>{sel.mode='Zombies';fixZM();startGame()};goHome();
const _sr=showRank;showRank=function(){_sr();$('#xpf').style.width=(prof.master||prof.lvl>=55?100:prof.xp/need()*100)+'%'};showRank();
function menuCam(dt){gfxTick(dt);if(fin){finTick(dt);return}hideFP();ma+=dt*.12;gun.visible=false;C.fov=70;C.updateProjectionMatrix();const r=H*.75;C.position.set(Math.cos(ma)*r,11,Math.sin(ma)*r);C.lookAt(0,1.5,0)}
/* lobby */
$('#leave').onclick=()=>{netClose();lobby('You left the lobby')};$('#host').onclick=hostMatch;$('#join').onclick=joinMatch;$('#startnet').onclick=()=>{if(conns.length<1)return lobby('Waiting for at least one friend to join');hostStart()};
/* pause */
function showPause(){for(const k in key)key[k]=false;trig=0;$('#pt').textContent=typeof netOn!='undefined'&&netOn?'Menu (the match keeps running)':'Paused';$('#aa2').value=String(AA);$('#sn2').value=sens;$('#fv2').value=fovBase;$('#pause').style.display='block'}
function hidePause(){$('#pause').style.display='none';$('#pt').textContent='Paused'}
$('#resume').onclick=()=>lockPtr();
$('#aa2').onchange=e=>{AA=+e.target.value;$('#aa').value=e.target.value;saveSet()};$('#sn2').oninput=e=>{sens=+e.target.value;$('#sn').value=e.target.value;saveSet()};$('#vl').oninput=e=>vol=+e.target.value;$('#sk').oninput=e=>shk=+e.target.value;
$('#exit').onclick=()=>{run=0;over=1;paused=0;document.exitPointerLock&&document.exitPointerLock();hidePause();$('#hud').style.display=$('#end').style.display='none';finStop();hideFP();endDeath();netClose();for(const b of bots)S.remove(b.m);bots=[];for(const g of grs)S.remove(g.m);grs=[];clearFlags();buildMap();$('#menu').style.display='block';showRank()};
/* secret dev menu: click the bottom-left corner 5 times, then type "ohio" */
let hc=0,arm=0,buf='';$('#hot').onclick=()=>{if(++hc>=5){arm=1;buf='';hc=0}};
addEventListener('keydown',e=>{if(!arm||$('#menu').style.display=='none')return;buf=(buf+e.key).toLowerCase().slice(-4);if(buf=='ohio'){arm=0;$('#dev').style.display='flex'}});
$('#dev').onclick=e=>{const d=e.target.dataset.d;if(!d)return;
 if(d=='all')prof.all=1;else if(d=='lvl'){prof.lvl=55;prof.xp=0}else if(d=='master'){prof.pres=10;prof.master=1;prof.ml=1250;prof.xp=0}
 else if(d=='reset'){if(confirm('Delete ALL progress, camos and unlocks?')){try{localStorage.removeItem('sd-prof')}catch(x){}location.reload()}return}
 else{$('#dev').style.display='none';return}save();showRank()};
$('#aa').onchange=saveSet;$('#sn').oninput=saveSet;
fovBase=+$('#fv').value||80;$('#fv').oninput=()=>{fovBase=+$('#fv').value;saveSet()};$('#fv2').oninput=e=>{fovBase=+e.target.value;$('#fv').value=e.target.value;saveSet()};


/* ===================== finale.js ===================== */
/* ---------- match end: everything freezes and blurs, VICTORY / DEFEAT slams in, then the leaderboard, then a podium where players emote, then back to the menu ---------- */
let fin=0,fs='',ft=0,fe=0,podG=null,figs=[],conf=[],fLab=[],netBd=null,netSc=null,finInfo=null;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),EMD=[2.4,2.6,3,2.6],TEAMC={A:'#62a8ff',B:'#ff5a3a'};
/* one row per player: the host's numbers are used by everyone in a networked match */
function board(){const rows=[{id:myId||'me',nm:hname(),k:mode=='Private'?(scores[myId]||0):kills,d:deaths,tm:teamMode()?myTeam:'',me:1}];
 for(const b of bots){if(b.nm=='Grunt'||b.zom)continue;rows.push({id:b.net?b.id:'b'+b.i,nm:b.nm||'Player',k:mode=='Private'?(scores[b.id]||0):(b.k||0),d:b.net?null:(b.dc||0),tm:teamMode()?b.team:'',me:0})}return rows}
function finRows(){const r=netOn&&!isHost&&netBd?netBd.map(([id,nm,k,d,tm])=>({id,nm,k,d,tm,me:id==myId})):board();return r.sort((a,b)=>b.k-a.k||(a.d==null?9e3:a.d)-(b.d==null?9e3:b.d)).slice(0,12)}
function teamTxt(){if(!teamMode())return'';const t=netOn&&!isHost&&netSc?netSc:mode=='Capture the Flag'?cs:mode=='Domination'?ds:{A:ts.A||0,B:ts.B||0};return `Blue ${t.A||0} – ${t.B||0} Red`}
function finStart(t,sc,nb,xp){podClear();fin=1;fs='vic';ft=0;fe=0;const w=t=='Victory',rows=finRows();finInfo={w,rows};
 $('#hud').style.display=$('#pause').style.display=$('#end').style.display='none';
 $('#fvt b').textContent=w?'Victory':'Defeat';$('#fvt span').textContent=t=='Victory'||t=='Defeat'?`${mode} on ${sel.map}`:t;
 const acc=shots?Math.round(hits/shots*100):0,tt=teamTxt();
 $('#fbd').innerHTML=`<h2>${w?'Victory':'Defeat'}</h2><p class="sub">${esc(mode)} on ${esc(sel.map)}${tt?' · '+tt:''}</p><table><thead><tr><th></th><th>Player</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td style="border-left-color:${TEAMC[r.tm]||'transparent'}">${i+1}</td><td>${esc(r.nm)}${r.me?' (you)':''}</td><td>${r.k}</td><td>${r.d==null?'–':r.d}</td></tr>`).join('')}</tbody></table><p class="fs">${kills} kills · ${deaths} deaths · ${acc}% accuracy · Score ${sc}${esc(nb)}</p><p class="fs">${xp}</p><button id="fcont" class="big">Continue</button>`;
 $('#fcont').onclick=()=>{if(fs=='board')finTo('toPod')};
 const F=$('#fin');F.style.display='block';F.className='s-vic '+(w?'win':'lose');
 if(w){beep(523,.18,'triangle',.08);setTimeout(()=>beep(659,.18,'triangle',.08),140);setTimeout(()=>beep(784,.4,'triangle',.08),280)}else{beep(330,.3,'sawtooth',.06);setTimeout(()=>beep(220,.5,'sawtooth',.06),260)}}
function finTo(s){fs=s;fe=ft;const F=$('#fin'),k=finInfo&&finInfo.w?'win':'lose';F.className=({board:'s-board ',toPod:'s-board blk ',pod:'s-pod ',out:'s-pod blk '})[s]+k}
function finTick(dt){ft+=dt;
 if(fs=='vic'){if(ft>3.3)finTo('board')}
 else if(fs=='board'){if(ft-fe>12)finTo('toPod')}
 else if(fs=='toPod'){if(ft-fe>.55){buildPodium();finTo('pod')}}
 else if(fs=='pod'){podTick(dt);$('#fcd').textContent='Back to the menu in '+Math.max(0,Math.ceil(5-(ft-fe)));if(ft-fe>=5)finTo('out')}
 else if(fs=='out'){podTick(dt);if(ft-fe>.5)toMenu()}}
/* podium stage, built far above the arena so the map never shows */
const numTex=n=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.font='700 100px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#10202a';g.fillText(n,64,70);return new THREE.CanvasTexture(c)};
function buildPodium(){podClear();if(skyM)skyM.visible=false;hemi.intensity=.9;sun.intensity=.7;gun.visible=false;hideFP();flashL=0;muz.intensity=0;C.fov=48;C.rotation.z=0;C.updateProjectionMatrix();
 const BGC=0x0b161c;S.background=new THREE.Color(BGC);S.fog=new THREE.Fog(BGC,18,52);podG=new THREE.Group();podG.position.set(0,300,0);S.add(podG);
 const M=c=>new THREE.MeshLambertMaterial({color:c}),B=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(bg,m);o.scale.set(w,h,d);o.position.set(x,y,z);podG.add(o);return o};
 const fl=new THREE.Mesh(new THREE.CylinderGeometry(11,11,.4,40),M(0x16262e));fl.position.y=-.2;podG.add(fl);
 B(36,12,.5,0,6,-7,M(0x0f1d24));for(let i=-7;i<=7;i++)B(.1,8,.06,i*2.2,5,-6.7,new THREE.MeshBasicMaterial({color:i%2?0x62e0f0:0xffb454,transparent:true,opacity:.3}));
 const SX=[0,-2.5,2.5],SH=[1.5,1.05,.7],SC=[0xd9b13b,0xb8c2c8,0xb8763a];
 const nrow=mode=='Zombies'?Math.min(3,Math.max(1,finInfo.rows.length)):3;
 for(let i=0;i<nrow;i++){B(2.1,SH[i],2.1,SX[i],SH[i]/2,0,M(SC[i]));
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),new THREE.MeshBasicMaterial({map:numTex(i+1),transparent:true}));pl.position.set(SX[i],SH[i]/2,1.06);podG.add(pl);
  const cone=new THREE.Mesh(new THREE.CylinderGeometry(.3,1.3,10,20,1,true),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide}));cone.position.set(SX[i],SH[i]+5.2,0);podG.add(cone)}
 const lt=new THREE.PointLight(0xffe2b0,1.1,40);lt.position.set(0,7,5);podG.add(lt);
 const rows=finInfo.rows.slice(0,3);if(mode!='Zombies')while(rows.length<3)rows.push({id:'f'+rows.length,nm:'Grunt',k:0,d:0,tm:'',me:0});
 const extra=rows.some(r=>r.me)?null:finInfo.rows.find(r=>r.me),col=(r,i)=>r.tm=='A'?0x3d6ad6:r.tm=='B'?0xb5452e:r.me?0x3d6ad6:new THREE.Color().setHSL((i*.19+.05)%1,.6,.42).getHex();
 rows.forEach((r,i)=>mkFig(r,SX[i],SH[i],0,i==1?.3:i==2?-.3:0,col(r,i),i==0));if(extra)mkFig(extra,5.4,0,1.4,-.5,0x3d6ad6,false);
 doEmote(figs[0],1);
 if(mode=='Zombies')zCrowd();
 const cm=[0xffd24a,0x62e0f0,0xff5a3a,0xffffff,0x7bd86b].map(c=>new THREE.MeshBasicMaterial({color:c}));
 for(let i=0;i<80;i++){const m=new THREE.Mesh(bg,cm[i%5]);m.scale.set(.07,.025,.11);m.position.set((Math.random()-.5)*12,Math.random()*10,(Math.random()-.5)*8);podG.add(m);conf.push({m,v:1+Math.random()*1.6,rx:(Math.random()-.5)*8,rz:(Math.random()-.5)*8,sw:Math.random()*6})}
 podTick(0)}
/* zombie podium: the survivors on the pedestals, a shambling crowd of the undead closing in from behind and the sides */
let zcr=[];
function zCrowd(){zcr=[];const rd=Math.max(1,typeof zq!='undefined'&&zq?zq.r:6);for(let i=0;i<30;i++){const R=4.8+Math.random()*5.2,ph=(Math.random()*2-1)*1.75,x=R*Math.sin(ph),z=-R*Math.cos(ph)+.5,big=i%9==4,{m,rig}=zModel(rd,big);m.position.set(x,0,z);const q=Math.atan2(-x,-z+.0001)+Math.PI;podG.add(m);zcr.push({m,rig,zom:1,i,x,z,tyaw:Math.atan2(-x,2.5-z),ry:Math.atan2(-x,2.5-z)+(Math.random()-.5)*.5,ph:Math.random()*6,big})}}
function zCrowdTick(){const s0=t0;for(const b of zcr){t0=ft+b.i*.37;b.tyaw=b.ry;animBot(b,.016);b.m.position.y=Math.abs(Math.sin(ft*1.6+b.ph))*.035;b.m.rotation.z=Math.sin(ft*1.1+b.ph)*.05}t0=s0}
function mkFig(r,x,y,z,ry,col,crown){const g=new THREE.Group(),rig=mkHuman(g);g.children[0].material.color.setHex(col);g.position.set(x,y,z);g.rotation.y=ry;
 if(crown){const gd=new THREE.MeshLambertMaterial({color:0xffd24a}),cb=(w,h,d,px,py,pz)=>{const o=new THREE.Mesh(bg,gd);o.scale.set(w,h,d);o.position.set(px,py,pz);g.add(o)};cb(.34,.05,.34,0,1.98,0);for(const[px,pz]of[[-.14,-.14],[.14,-.14],[-.14,.14],[.14,.14]])cb(.05,.1,.05,px,2.04,pz)}
 podG.add(g);const f={g,rig,e:null,et:0,ed:2.4,nt:1+Math.random()*2,ph:Math.random()*6,by:y,ry0:ry,me:!!r.me,top:y+2.5,x,z};figs.push(f);
 const d=document.createElement('div');d.className='pl'+(r.me?' me':'');d.innerHTML=`<b>${esc(r.nm)}${r.me?' (you)':''}</b><i>${r.k} kills</i>`;$('#fnm').appendChild(d);fLab.push(d);return f}
/* emotes: 0 wave, 1 cheer, 2 dance, 3 flex. Bots on the podium emote on their own; yours is on the buttons and keys 1 to 4 */
function doEmote(f,i){f.e=i;f.et=0;f.ed=EMD[i];if(f.me)beep([660,520,440,380][i],.1,'triangle',.06)}
function figTick(f,dt){const r=f.rig,g=f.g;
 if(!f.me&&f.e==null){f.nt-=dt;if(f.nt<=0){f.nt=1.5+Math.random()*2.5;doEmote(f,Math.random()*4|0)}}
 let a=0,t=0,e=f.e;if(e!=null){f.et+=dt;t=f.et;if(t>=f.ed){f.e=e=null}else a=Math.min(1,t/.2,(f.ed-t)/.25)}
 let rh=V(.36,.9,.05),lh=V(-.36,.9,.05),hr=V(.6,-1,-.3),hl=V(-.6,-1,-.3),y=Math.sin(ft*2+f.ph)*.012,ry=0,lx=0,sx=0;
 if(e==0){rh.lerp(V(.5+Math.sin(t*9)*.15,2,.1),a);hr=V(.8,-.6,-.2);ry=.2*a}
 else if(e==1){const u=Math.sin(t*11);rh.lerp(V(.46,2.05+u*.1,.04),a);lh.lerp(V(-.46,2.05-u*.1,.04),a);hr=V(.9,-.5,-.2);hl=V(-.9,-.5,-.2);y+=Math.abs(Math.sin(t*6.5))*.3*a;sx=.5*a}
 else if(e==2){const u=Math.sin(t*8);rh.lerp(V(.5,1.45+u*.45,.22),a);lh.lerp(V(-.5,1.45-u*.45,.22),a);ry=Math.sin(t*4)*.55*a;y+=Math.abs(u)*.1*a;lx=u*.6*a}
 else if(e==3){rh.lerp(V(.6,1.95,.02),a);lh.lerp(V(-.6,1.95,.02),a);hr=V(1,-.3,-.1);hl=V(-1,-.3,-.1);y+=Math.sin(t*5)*.015*a;ry=Math.sin(t*3)*.15*a}
 g.position.y=f.by+y;g.rotation.y=f.ry0+ry;r.legL.rotation.x=lx;r.legR.rotation.x=-lx;r.shinL.rotation.x=sx+Math.max(0,-lx)*.8;r.shinR.rotation.x=sx+Math.max(0,lx)*.8;
 ik(V(.3,1.5,0),rh,hr,r.armR);ik(V(-.3,1.5,0),lh,hl,r.armL)}
function podTick(dt){if(zcr.length)zCrowdTick();C.position.set(Math.sin(ft*.35)*1.6,302.5,9.6);C.lookAt(0,301.5,0);C.updateMatrixWorld();
 for(const c of conf){const p=c.m.position;p.y-=c.v*dt;p.x+=Math.sin(ft*2+c.sw)*.4*dt;c.m.rotation.x+=c.rx*dt;c.m.rotation.z+=c.rz*dt;if(p.y<0){p.y=9+Math.random()*3;p.x=(Math.random()-.5)*12}}
 figs.forEach((f,i)=>{figTick(f,dt);const q=V(f.x,300+f.top,f.z).project(C),l=fLab[i];l.style.left=(q.x*.5+.5)*innerWidth+'px';l.style.top=(-q.y*.5+.5)*innerHeight+'px';l.style.display=q.z<1?'block':'none'})}
const myEmote=i=>{const f=figs.find(x=>x.me);if(f&&fs=='pod')doEmote(f,i)};
$('#fem').onclick=e=>{const b=e.target.closest('button');if(b)myEmote(+b.dataset.e)};
addEventListener('keydown',e=>{if(fs!='pod')return;const i=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(i>=0)myEmote(i)});
function podClear(){if(podG){S.remove(podG);podG=null}zcr=[];figs=[];conf=[];fLab=[];$('#fnm').innerHTML=''}
/* a new match or leaving early: drop everything the finale created */
function finStop(){podClear();fin=0;fs='';netBd=netSc=null;const F=$('#fin');F.style.display='none';F.className=''}
/* podium done: back to the main menu (fades from black) */
function toMenu(){podClear();fin=0;fs='';netBd=netSc=null;if(net&&(isHost||conns.length))netEnd();else netClose();for(const b of bots)S.remove(b.m);bots=[];for(const g of grs)S.remove(g.m);grs=[];clearFlags();endDeath();buildMap();hideFP();showRank();
 $('#hud').style.display=$('#end').style.display='none';$('#menu').style.display='block';if(net)$('#nav button.'+app+'[data-p="priv"]').click();const F=$('#fin');F.className='blk';void F.offsetWidth;F.className='';setTimeout(()=>{if(!fin)F.style.display='none'},600)}

/* ===================== touch.js ===================== */
/* ---------- mobile touch controls + no-zoom / no-copy protections ---------- */
let isTouch=false;const tc=document.createElement('div');tc.id='tc';$('#hud').appendChild(tc);
const noLock=matchMedia('(hover:none)').matches||!R.domElement.requestPointerLock;
tc.innerHTML='<div id="stick"><i></i></div>'+[['jump','JUMP','right:18px;bottom:22px;width:76px;height:76px'],['reload','RELOAD','right:106px;bottom:22px'],['swap','SWAP','right:106px;bottom:90px'],['nade','NADE','right:30px;bottom:108px'],['ks','STREAK','right:106px;bottom:158px'],['melee','MELEE','right:30px;bottom:176px'],['pause','II','right:10px;top:10px;width:44px;height:44px']].map(([k,t,s])=>`<div class="tb" data-b="${k}" style="${s}">${t}</div>`).join('');
const st={id:null},lk={id:null,x:0,y:0},fi={id:null,x:0,y:0},bt={};
function enableTouch(){if(isTouch)return;isTouch=true;document.body.classList.add('touch');$('#hint').textContent='Left side: look · Right side: shoot · Stick: move · Buttons: jump, reload, grenade, melee'}
if(matchMedia('(pointer:coarse)').matches)enableTouch();
function lockPtr(){if(noLock){paused=0;hidePause();try{const d=document.documentElement;d.requestFullscreen&&d.requestFullscreen().catch(()=>{});screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}else R.domElement.requestPointerLock()}
function stickMove(t){const r=$('#stick').getBoundingClientRect(),R0=r.width/2;let dx=t.clientX-(r.left+R0),dy=t.clientY-(r.top+R0);const m=Math.hypot(dx,dy);if(m>R0){dx*=R0/m;dy*=R0/m}const nx=dx/R0,ny=dy/R0;$('#stick i').style.transform=`translate(${dx}px,${dy}px)`;key.KeyW=ny<-.3;key.KeyS=ny>.3;key.KeyA=nx<-.3;key.KeyD=nx>.3;key.ShiftLeft=ny<-.5&&Math.hypot(nx,ny)>.97;0}
function stickEnd(){st.id=null;$('#stick i').style.transform='';key.KeyW=key.KeyS=key.KeyA=key.KeyD=key.ShiftLeft=false}
function look(t,o){const k=.0042*sens*fr;yaw-=(t.clientX-o.x)*k;pitch=cl(pitch-(t.clientY-o.y)*k,-1.45,1.45);o.x=t.clientX;o.y=t.clientY}
function tbDown(k){if(k=='jump')key.Space=1;else if(k=='reload')startRel();else if(k=='nade')throwG();else if(k=='melee')melee();else if(k=='swap')swap((cur+1)%wp.length);else if(k=='ks')useStreak();else if(k=='pause'&&run&&!paused&&!over){paused=1;trig=0;stickEnd();showPause()}}
const live=e=>run&&!paused&&!over&&!(e.target.closest&&e.target.closest('#pause,#end,#menu,#dev,#home'));
addEventListener('touchstart',e=>{enableTouch();if(!live(e))return;e.preventDefault();
 for(const t of e.changedTouches){const el=t.target,b=el.closest&&el.closest('.tb');
  if(b){bt[t.identifier]=b;b.classList.add('on');tbDown(b.dataset.b)}
  else if(el.closest&&el.closest('#stick')){st.id=t.identifier;stickMove(t)}
  else if(t.clientX<innerWidth/2){lk.id=t.identifier;lk.x=t.clientX;lk.y=t.clientY}
  else{fi.id=t.identifier;fi.x=t.clientX;fi.y=t.clientY;trig=1;fresh=1}}},{passive:false});
addEventListener('touchmove',e=>{if(e.touches.length>1||live(e))e.preventDefault();if(!run)return;for(const t of e.changedTouches){if(t.identifier==st.id)stickMove(t);else if(t.identifier==lk.id)look(t,lk);else if(t.identifier==fi.id)look(t,fi)}},{passive:false});
const tend=e=>{for(const t of e.changedTouches){if(t.identifier==st.id)stickEnd();if(t.identifier==lk.id)lk.id=null;if(t.identifier==fi.id){fi.id=null;trig=0}const b=bt[t.identifier];if(b){b.classList.remove('on');if(b.dataset.b=='jump')key.Space=0;delete bt[t.identifier]}}};
addEventListener('touchend',tend);addEventListener('touchcancel',tend);
/* no zooming */
for(const ev of['gesturestart','gesturechange','gestureend'])document.addEventListener(ev,e=>e.preventDefault());
addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','-','=','_','0'].includes(e.key))e.preventDefault()});
let lastTap=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTap<350&&!(e.target.closest&&e.target.closest('input,select,button')))e.preventDefault();lastTap=n},{passive:false});
/* no copying / selecting text (inputs stay usable) */
document.addEventListener('selectstart',e=>{if(!(e.target.closest&&e.target.closest('input')))e.preventDefault()});
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('copy',e=>{if(!document.activeElement||document.activeElement.tagName!='INPUT')e.preventDefault()});
