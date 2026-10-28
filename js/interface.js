/* ######## interface.js ######## */
/* ===================== mastery.js ===================== */
/* ---------- Progression: levels 1-55, prestige 1-10, Prestige Master (to 1250), unlocks, weapon mastery, camos ---------- */
const UNL={AR:1,MG:1,SMG:8,BR:16,MP:24,SG:32,'Extended Mag':2,'Compensator':6,'Laser Sight':12,'Fast Hands':18,'Long Barrel':28,'Hollow Point':40,Frag:1,Impact:22,Marathon:4,Scavenger:14,Overshield:26,'Spring Legs':36,'Second Wind':44,'Hardline':50,'Run & Gun':10,'Semtex':18,'Quick Fix':16,VMP:20,RG:30,CY:34,CT:12,MVR:1,TRB:22,TUR:26};
const CATS={Rifles:['AR','MVR','TRB','TUR','BR'],'Close Quarters':['SMG','SG','VMP'],Sidearms:['CT','MG','MP','RG'],'Power Weapons':['RL','SN'],Support:['CY']};
let srcK='',curCamo=null,prof=(()=>{try{const p=JSON.parse(localStorage.getItem('sd-prof'));if(p&&p.v==1)return p}catch(e){}return{v:1,lvl:1,xp:0,pres:0,master:0,ml:1,wk:{},camo:{}}})();
const save=()=>{try{localStorage.setItem('sd-prof',JSON.stringify(prof))}catch(e){}},need=()=>prof.master?1500:1500+prof.lvl*10,nm=k=>W[k]?W[k].n:(k.startsWith('sk:')&&typeof STK!='undefined'&&STK[k.slice(3)]?STK[k.slice(3)].n+' (streak)':k),tx={};
/* Prestige rules: going back to level 1 resets the unlocks (camos are never touched). What stays: items that were unlocked permanently with an unlock token (one earned per prestige),
   everything up to level 5 x your prestige number (automatic permanent unlocks), and at Prestige Master everything is permanently unlocked. */
const PAUTO=5;
function permHas(v){return !!(prof.master||(prof.pres>0&&UNL[v]<=PAUTO*prof.pres)||(prof.perm&&prof.perm.includes(v)))}
function unlocked(v){return !UNL[v]||prof.master||prof.all||prof.lvl>=UNL[v]||permHas(v)}
function tokenSpend(v){if(!UNL[v]||unlocked(v)||!(prof.tok>0)||prof.master)return false;const label=v.startsWith('sk:')?(STK[v.slice(3)]?STK[v.slice(3)].n:v):(W[v]?W[v].n:v);if(!confirm(`Spend 1 unlock token to permanently unlock ${label}? It stays unlocked through every future prestige.`))return false;
 prof.perm=prof.perm||[];prof.perm.push(v);prof.tok--;save();popup('PERMANENT UNLOCK',label);showRank();try{ldRender()}catch(e){}return true}
function sanitize(){const u=unlocked;if(!u(L.p))L.p='AR';if(L.s&&!u(L.s))L.s='MG';if(L.g&&!u(L.g))L.g=null;L.pa=L.pa.filter(u);L.sa=L.sa.filter(u);L.pk=L.pk.filter(u);if(!L.s)L.sa=[]}
function rankTxt(){return prof.master?`Prestige Master ${prof.ml} / 1250 · ${prof.xp}/1500 XP`:`${prof.pres?'Prestige '+prof.pres+' · ':''}${prof.tok>0?prof.tok+(prof.tok>1?' unlock tokens · ':' unlock token · '):''}Level ${prof.lvl}${prof.lvl<55?` · ${prof.xp}/${need()} XP`:' (max) · ready to prestige'}`}
let mUps=[],won=0,mCost=1500;
function giveXP(g){if(prof.master){prof.xp+=g;while(prof.xp>=1500&&prof.ml<1250){prof.xp-=1500;prof.ml++;popup('PRESTIGE MASTER','Level '+prof.ml)}if(prof.ml>=1250)prof.xp=0}
 else if(prof.lvl<55){prof.xp+=g;while(prof.xp>=need()&&prof.lvl<55){prof.xp-=need();prof.lvl++;const u=[];for(const k in UNL)if(UNL[k]==prof.lvl&&!permHas(k))u.push(nm(k));mUps.push(...u);popup('LEVEL UP','Level '+prof.lvl+(u.length?' · Unlocked '+u.join(', '):prof.lvl>=55?' · Prestige available!':''))}if(prof.lvl>=55)prof.xp=0}save()}
function killXP(head){const x=Math.min(Math.round(mCost*(.06+(head?.03:0)+Math.min(streak,5)*.005)),Math.max(0,2.5*mCost-mxp));mxp+=x;giveXP(x);return x}
function bonusXP(f){const x=Math.min(Math.round(mCost*f),Math.max(0,3*mCost-mxp));mxp+=x;giveXP(x)}
function awardXP(){let b=Math.min(Math.round(mCost*(.5+(won?.5:0))),Math.max(0,3*mCost-mxp));if(mxp+b<mCost)b=mCost-mxp;if(b>0){giveXP(b);mxp+=b}return `+${mxp} XP (${(mxp/mCost).toFixed(1)} levels) · ${rankTxt()}${mUps.length?'<br>Unlocked: '+mUps.join(', '):''}${prof.lvl>=55&&!prof.master?'<br>Open the menu to prestige!':''}`}
function doPrestige(){if(prof.master||prof.lvl<55)return;if(!confirm(prof.pres<10?`Prestige ${prof.pres+1}? You go back to level 1 and your unlocks reset. Camos are kept. You earn 1 permanent unlock token, and everything up to level ${PAUTO*(prof.pres+1)} is unlocked permanently.`:'Become Prestige Master? Everything is unlocked permanently and levels now go up to 1250.'))return;if(prof.pres<10){prof.pres++;prof.tok=(prof.tok|0)+1}else{prof.master=1;prof.ml=1}prof.lvl=1;prof.xp=0;save();showRank();popup(prof.master?'PRESTIGE MASTER':'PRESTIGE '+prof.pres,prof.master?'Everything is unlocked':'+1 permanent unlock token')}
function showRank(){$('#rank').textContent=rankTxt();homeStats();const b=$('#prest');b.style.display=!prof.master&&prof.lvl>=55?'inline-block':'none';b.textContent=prof.pres<10?'Prestige '+(prof.pres+1)+' · +1 unlock token':'Become Prestige Master · unlock everything';sanitize();ui();masteryUI()}
/* weapon mastery: level every 15 kills (max 20), then prestige the weapon (3 times) */
const wd=k=>prof.wk[k]||(prof.wk[k]={k:0,c:0,p:0,z:0}),wlv=k=>Math.min(20,1+Math.floor(wd(k).c/15)),catOf=k=>Object.keys(CATS).find(c=>CATS[c].includes(k));
function camos(k){const w=wd(k),kc=[['Sand','#c8b27a',25],['Moss','#4f7a45',75],['Cobalt','#3d6ad6',150],['Crimson','#c0392b',225],['Violet','#8e44ad',300],['Neon','#29f0a0',375]].map(([n,c,r])=>({n,c,ok:w.k>=r,rq:r+' kills'})),
 pc=[['Ember','#ff7a2a'],['Frost','#8ad8ff'],['Aurora','#7affc8']].map(([n,c],i)=>({n,c,ok:w.p>=i+1,rq:'weapon prestige '+(i+1),pr:1})),
 gold=kc.every(c=>c.ok)&&w.k>=500,dia=(CATS[catOf(k)]||[k]).every(x=>wd(x).k>=500),dm=Object.keys(W).every(x=>wd(x).k>=500);
 return[...kc,...pc,{n:'Gold',c:'#ffc83a',ok:gold,rq:'500 kills',anim:1},{n:'Diamond',c:'#bff4ff',ok:dia,rq:'Gold on every '+catOf(k)+' weapon',anim:1},{n:'Dark Matter',c:'#1a0a2a',ok:dm,rq:'Diamond on every weapon',anim:1}].map(c=>({...c,ok:c.ok||!!prof.all}))}
/* zombies camo track: its own set of camos, earned with zombie kills (and best round). Both tracks can be equipped in either mode. */
function zcamos(k){const w=wd(k),z=w.z||0,zb=prof.zbest||0,
 kc=[['Rotted','#6b7a3a',25],['Bile','#9acd32',75],['Bone','#e3d8b8',150],['Blood','#8a1c1c',225],['Rust','#a5542a',300],['Toxic','#3cff7a',375]].map(([n,c,r])=>({n,c,ok:z>=r,rq:r+' zombie kills',s:'z'})),
 rc=[['Graveyard','#4a5a6a',10],['Wasteland','#b08a4a',15],['Hellscape','#c0301a',20]].map(([n,c,r])=>({n,c,ok:zb>=r,rq:'reach round '+r,s:'z'})),
 inf=kc.every(c=>c.ok)&&z>=500,nec=(CATS[catOf(k)]||[k]).every(x=>(wd(x).z||0)>=500),aby=Object.keys(W).every(x=>(wd(x).z||0)>=500);
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
/* material for a weapon held by another player: their camo by name, shown even if this player has not unlocked it */
const crm={};function camoRm(k,n){if(!n)return;const c=allCamos(k).find(x=>x.n==n);if(!c)return;if(c.anim)return rfMat(c.n);return crm[c.n]||(crm[c.n]=new THREE.MeshLambertMaterial({map:tx[c.n]||(tx[c.n]=camoTex(c.c,c.s)),color:0xffffff}))}
function myCamo(k){const n=prof.camo[k];return n&&allCamos(k).some(x=>x.n==n&&x.ok)?n:''}
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
/* ICE servers: several STUN plus public TURN relays so players behind strict NATs or mobile data still connect */
const PCFG={debug:0,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302','stun:global.stun.twilio.com:3478','stun:stun.cloudflare.com:3478']},
 {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}],iceCandidatePoolSize:4,sdpSemantics:'unified-plan'}};
let hostPid='',hostBye=0,rcTry=0,rcTimer=0;const grace={};
let net=null,myId='',myName='',conns=[],isHost=0,netOn=0,scores={},names={},lastAtk='',nacc=0,bacc=0,oacc=0,pn=0,soloMode=null,maxP=0;
const CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',lobby=t=>$('#lb').textContent=t;
function lobbyList(){$('#plist').innerHTML=Object.entries(names).map(([i,n])=>`<li>${esc(n)}${i==myId?' (you)':''}</li>`).join('');$('#leave').style.display=net?'inline-block':'none'}
function netSend(m){m.id=myId;for(const c of conns)if(c.open)c.send(m)}
function fwd(d,from){for(const c of conns)if(c!==from&&c.open)c.send(d)}
function netClose(){clearTimeout(rcTimer);rcTry=0;for(const k in grace){clearTimeout(grace[k]);delete grace[k]}for(const c of conns)try{if(c.open)c.send({t:'bye',id:myId})}catch(e){}for(const c of conns)try{c.close()}catch(e){}conns=[];if(net)try{net.destroy()}catch(e){}net=null;netOn=0;isHost=0;names={};scores={};document.body.classList.remove('net');$('#hostbox').style.display='none';lobbyList();if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}}
/* a match ended: everybody stays connected and returns to the same lobby; only leaving the lobby disconnects */
function netEnd(){netOn=0;scores={};pn=0;document.body.classList.remove('net');if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}lobbyList();lobby(isHost?'Match over. Everyone is still here. Pick a mode and map, then press Start match.':'Match over. Waiting for the host to start the next one…')}
function hostMatch(){netClose();maxP=app=='zm'?4:0;myName=$('#nm').value||'Host';let c='';for(let i=0;i<5;i++)c+=CH[Math.random()*CH.length|0];lobby('Connecting…');
 net=new Peer('sdrill-'+c,PCFG);net.on('disconnected',()=>{try{net.reconnect()}catch(e){}});net.on('open',id=>{myId=id;isHost=1;names[id]=myName;$('#code').textContent=c;$('#hostbox').style.display='block';lobby('Share this code. Press Start when everyone has joined.');lobbyList()});
 net.on('connection',cn=>reg(cn));net.on('error',e=>lobby('Network error: '+e.type+(e.type=='unavailable-id'?' (try again)':'')))}
function joinMatch(){const c=$('#jc').value.trim().toUpperCase();if(c.length<5)return lobby('Enter the 5-letter code');netClose();myName=$('#nm').value||'Guest';lobby('Connecting…');
 hostBye=0;rcTry=0;hostPid='sdrill-'+c;net=new Peer(undefined,PCFG);net.on('disconnected',()=>{try{net.reconnect()}catch(e){}});net.on('open',id=>{myId=id;names[id]=myName;reg(net.connect(hostPid,{reliable:true,serialization:'json'}))});net.on('error',e=>lobby(e.type=='peer-unavailable'?'No match found with that code':'Network error: '+e.type))}
function reg(cn){cn.last=performance.now();cn.on('open',()=>{cn.last=performance.now();if(grace[cn.peer]){clearTimeout(grace[cn.peer]);delete grace[cn.peer];feed((names[cn.peer]||'Player')+' reconnected')}rcTry=0;if(isHost&&maxP&&conns.length>=maxP-1){cn.send({t:'full'});setTimeout(()=>{try{cn.close()}catch(e){}},400);return}conns.push(cn);cn.send({t:'hi',id:myId,n:myName});lobby(isHost?'Player joined':'Connected. Waiting for the host to start…')});
 cn.on('data',d=>{cn.last=performance.now();if(d&&d.t=='ping'){if(cn.open)cn.send({t:'pong'});return}if(d&&d.t=='pong')return;onMsg(d,cn)});
 cn.on('error',()=>{});cn.on('close',()=>netLost(cn))}
/* a connection ended. Players who say goodbye leave at once; anyone else gets 15 s to come back (flaky wifi, tab switches, ICE hiccups) before their body is removed */
function netLost(cn){conns=conns.filter(x=>x!==cn);
 if(isHost){if(cn.bye){dropPeer(cn.peer);return}if(names[cn.peer]&&!grace[cn.peer]){if(run)feed(names[cn.peer]+' lost connection…');grace[cn.peer]=setTimeout(()=>{delete grace[cn.peer];dropPeer(cn.peer)},15000)}return}
 if(hostBye||!net){if(!conns.length)lobby('The host closed the lobby');return}
 if(netOn||Object.keys(names).length>1)guestRetry()}
function guestRetry(){if(!net||isHost||hostBye)return;if(conns.some(c=>c.open)){rcTry=0;return}if(rcTry++>=12){lobby('Lost connection to the host');if(netOn)setTimeout(()=>endGame('Disconnected'),300);return}
 lobby('Connection lost. Reconnecting… ('+rcTry+'/12)');if(run)msg('Reconnecting…',1.2);try{if(net.disconnected)net.reconnect()}catch(e){}
 try{const c=net.connect(hostPid,{reliable:true,serialization:'json'});reg(c);c.on('open',()=>{lobby('Reconnected');if(run)msg('Reconnected',1.5)})}catch(e){}
 clearTimeout(rcTimer);rcTimer=setTimeout(guestRetry,2500)}
/* heartbeat: keeps NAT mappings open, and any link silent for 25 s is closed so it can be retried */
setInterval(()=>{const n=performance.now();for(const c of conns)if(c.open){try{c.send({t:'ping'})}catch(e){}if(c.last&&n-c.last>25000){try{c.close()}catch(e){}}}},1000);
function dropPeer(id){const i=bots.findIndex(b=>b.net&&b.id==id);if(i>=0){S.remove(bots[i].m);bots.splice(i,1)}if(names[id]&&run)feed(names[id]+' left');delete names[id];lobbyList()}
const nmOf=k=>names[k]||(bots.find(b=>(b.hb||!b.net)&&('b'+b.i)==k)||{}).nm||'?';
/* host-side scoring for kills made by someone other than the host's own hits */
function credit(by){if(!isHost||mode=='Private')return;const kb=by==myId?P:bots.find(b=>(b.net?b.id:'b'+b.i)==by);if(!kb)return;const tm=kb===P?pTeam():kb.team;ts[tm]=(ts[tm]||0)+1;if(kb!==P)kb.k=(kb.k||0)+1}
function announce(t,by){if(netOn&&isHost&&mode!='Private')netSend({t:'dead',v:'b'+t.i,by:by===P?myId:by.net?by.id:'b'+by.i})}
function syncPuppets(l){const ids=new Set(l.map(e=>e[0]));for(let k=bots.length-1;k>=0;k--)if(bots[k].hb&&!ids.has(bots[k].i)){S.remove(bots[k].m);bots.splice(k,1)}
 for(const[i,team,al,x,z,nm,wk,rlo]of l){let b=bots.find(q=>q.hb&&q.i==i);if(!b){b=addBot(1e9,1);b.net=1;b.hb=1;b.i=i;b.id='b'+i;b.x=b.tx=x;b.z=b.tz=z;b.ty=0;b.yaw=0;b.m.children[0].material.color.setHex(team=='A'?0x3d6ad6:team=='B'?0xb5452e:new THREE.Color().setHSL((i*.15)%1,.6,.42).getHex())}
  if(Math.hypot(x-b.tx,z-b.tz)>.05)b.yaw=Math.atan2(x-b.tx,z-b.tz)-Math.PI;b.team=team;b.nm=nm;b.al=al;setHeld(b,wk);b.rlOn=!!rlo;b.tx=x;b.tz=z}}
function onMsg(d,cn){if(isHost&&d.t!='hi'&&d.t!='roster'&&d.t!='bye')fwd(d,cn);
 switch(d.t){
 case'oi':{const b=bots.find(q=>q.net&&q.id==d.out);if(b){b.out=1;b.al=0;b.m.visible=false;feed((names[d.out]||'A player')+' is out')}break}
 case'bye':if(isHost){cn.bye=1;dropPeer(d.id)}else hostBye=1;break;
 case'hi':names[d.id]=d.n;if(isHost){cn.send({t:'roster',r:{...names}});fwd(d,cn)}lobbyList();break;
 case'roster':Object.assign(names,d.r);lobbyList();break;
 case'full':lobby('That lobby is full (4 players)');netClose();break;
 case'start':beginNet(d.map,d.mode,d.teams);break;
 case's':{const b=bots.find(b=>b.net&&b.id==d.id);if(b){b.tx=d.x;b.ty=d.y;b.tz=d.z;b.yaw=d.yaw;if(d.w)setHeld(b,d.w,d.cm,d.at);b.st=d.st||0;b.aj=d.aj||0;b.pi=d.pi||0;b.rlOn=!!d.r;b.zpts=d.p;b.dn=d.dn;if(b.al&&!d.al)burst(V(b.x,1,b.z),16,0x3d6ad6,6,.8,.15);b.al=d.al}break}
 case'hit':if(d.to==myId&&run&&!P.dead){if(!(d.d>=0)||(d.d>300&&!SK.nk))break;d.d=Math.min(d.d,10000);lastAtk=d.bot!=null?'b'+d.bot:d.id;hurt(d.d,bots.find(b=>b.net&&b.id==lastAtk))}break;
 case'bh':if(isHost&&mode!='Private'){const t=bots.find(b=>!b.net&&b.i==d.i&&b.al),by=bots.find(b=>b.net&&b.id==d.id);if(t&&by)botHit(t,d.d,by)}break;
 case'dead':{const by=d.by;if(isHost&&mode=='Kill Confirmed')try{kcNetDeath(d)}catch(e){}if(by!=myId)feed(by?`${nmOf(by)} ▸ ${nmOf(d.v)}`:nmOf(d.v)+' died');
  if(mode=='Private'){if(by)scores[by]=(scores[by]||0)+1}else if(isHost&&by)credit(by);
  if(by==myId&&d.v!=myId){kills++;const b=bots.find(b=>b.net&&b.id==d.v);if(b){featKill(b,0);juiceKill(b,0)}}break}
 case'sh':{const b=bots.find(b=>b.net&&b.id==d.id);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z));break}
 case'bsh':if(!isHost){const b=bots.find(b=>b.hb&&b.i==d.i);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z),b.team=='A'?0x62a8ff:0xff5a3a)}break;
 case'ob':obText=d.s;break;case'chat':chatRecv(d);break;
 case'sko':skNetObjs(d);break;case'skh':skNetHit(d);break;case'skx':skNetFx(d);break;case'nuke':if(d.by!=myId&&run&&!over){if(isHost)NUKE_BY=d.by;skNukeSeq(d.by,0)}break;
 case'kd':case'kg':try{kcNetRecv(d)}catch(e){}break;
 case'z':if(!isHost){ds=d.ds;if(d.hp&&mode=='Hardpoint')hpApply(d.hp);else d.z.forEach((a,k)=>{const z=zones[k];if(!z)return;z.o=a[0];z.cp=a[1]})}break;
 case'b':if(!isHost)syncPuppets(d.l);break;
 case'f':if(!isHost){d.f.forEach((a,i)=>{const f=flags[i];if(!f)return;if(a[3]==myId&&f.byk!=myId)msg('You have the flag! Bring it home',2.5);f.st=a[0];f.x=a[1];f.z=a[2];f.byk=a[3]});if(d.cs)cs=d.cs}break;
 case'feed':if(!isHost)feed(d.s);break;
 case'pop':if(!isHost)popup(d.a,d.b);break;
 case'end':if(!isHost){let w=d.w;if(d.nk&&!teamMode())w=d.nk==myId?'Victory':(names[d.nk]||'A player')+' wins';if(teamMode())w=(w=='Victory')==(myTeam==d.ht)?'Victory':'Defeat';else if(w=='Victory')w=(names[d.id]||'Host')+' wins';netBd=d.bd||null;netSc=d.sc||null;endGame(w)}break;default:if(d.t&&d.t.length>1&&d.t[0]=='z')zNet(d,cn)}}
function addNetBot(id,team){const b=addBot(1e9,1);b.net=1;b.id=id;b.al=0;b.m.visible=false;b.tx=b.ty=b.tz=b.x=b.z=b.yaw=0;b.team=team||id;b.nm=names[id]||'Player';b.k=0;
 b.m.children[0].material.color.setHex(b.team=='A'?0x3d6ad6:b.team=='B'?0xb5452e:new THREE.Color().setHSL((++pn*.17)%1,.6,.45).getHex())}
function hostStart(){let m=$('#pmode').value,map=$('#pm').value;PBOTS=Math.max(0,Math.min(12,+($('#pbots')&&$('#pbots').value)));if(isNaN(PBOTS))PBOTS=null;const pick=a=>a[Math.random()*a.length|0];
 if(m=='Zombies'){if(Object.keys(names).length>4)return lobby('Zombies supports up to 4 players');map=Object.keys(MAPS).find(k=>MAPS[k].zm)}
 else{if(m=='?')m=pick(['Private',...Object.keys(MODES).filter(k=>k!='Zombies')]);if(map=='?'||MAPS[map].zm)map=pick(Object.keys(MAPS).filter(k=>!MAPS[k].zm))}
 const tm=m=='Team Deathmatch'||m=='Capture the Flag'||m=='Domination'||m=='Hardpoint'||m=='Kill Confirmed',teams={};Object.keys(names).forEach((id,k)=>teams[id]=m=='Zombies'?'A':tm?(k%2?'B':'A'):id);netSend({t:'start',map,mode:m,teams});beginNet(map,m,teams)}
function beginNet(map,m,teams){if(soloMode==null)soloMode=sel.mode;sel.map=map;sel.mode=m;mpTeams=teams;myTeam=teams[myId]||'A';netOn=1;scores={};pn=0;document.body.classList.add('net');startGame();for(const id in names)if(id!=myId)addNetBot(id,teams[id]);
 if(!isHost){paused=1;$('#pt').textContent='Match ready';$('#pause').style.display='block'}}
function netShot(k,o,d,len){netSend({t:'sh',w:k,x:+(o.x+d.x*len).toFixed(1),y:+(o.y+d.y*len).toFixed(1),z:+(o.z+d.z*len).toFixed(1)})}
function mpEnd(t){netSend({t:'end',w:t,ht:myTeam,nk:NUKE_BY||0,bd:board().map(r=>[r.id,r.nm,r.k,r.d,r.tm]),sc:teamMode()?(mode=='Capture the Flag'?cs:mode=='Domination'||mode=='Hardpoint'?ds:mode=='Kill Confirmed'?kc:{A:ts.A||0,B:ts.B||0}):null})}
function netTick(dt){if(!run)return;nacc+=dt;if(nacc>.066){nacc=0;netSend({t:'s',x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:+yaw.toFixed(2),al:P.dead?0:1,w:cw().k,cm:myCamo(cw().k),at:attsFor(cw().k),r:rel>0?1:0,p:zq?zq.pts:0,dn:zq&&zq.down?1:0,st:ST.slide>0?3:ST.dive>0?4:ST.prone?2:ST.crouch?1:0,aj:P.on?0:1,pi:+pitch.toFixed(2),sp:ST.tac>0||(P.spr||0)>.55?1:0})}
 if(isHost&&mode!='Private'){bacc+=dt;if(bacc>.1){bacc=0;if(mode!='Zombies')netSend({t:'b',l:bots.filter(b=>!b.net).map(b=>[b.i,b.team,b.al?1:0,+b.x.toFixed(1),+b.z.toFixed(1),b.nm,b.wk,b.rl>0?1:0])})}oacc+=dt;if(oacc>.25){oacc=0;netSend({t:'ob',s:$('#ob').textContent})}}
 const k=Math.min(1,dt*12);for(const b of bots)if(b.net){b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,b.y,b.z);b.tyaw=b.yaw+Math.PI;if(!b.al&&b.ry==null)b.m.rotation.y=b.tyaw;const lie=mode=='Zombies'&&!b.al&&b.dn;if(!b.al){b.m.rotation.y=b.tyaw}const pp=b.pp||0,ry_=b.ry==null?b.tyaw:b.ry,sf=lie?0:pp*.85;b.m.rotation.x=lie?-1.5:pp*(b.st==4?1.05:1.45);b.m.position.set(b.x-Math.sin(ry_)*sf,b.y+(lie?.16:pp*(b.st==4?.55:.17)),b.z-Math.cos(ry_)*sf);b.m.visible=!!b.al||!!lie;b.hp=1e9}
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
 $('#pmodeL').style.display=$('#pmL').style.display=zm?'none':'block';$('#pbL').style.display=zm?'none':'block';$('#p-priv h2').textContent=zm?'Zombies co-op (up to 4 players)':'Private match'}
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
function teamTxt(){if(!teamMode())return'';const t=netOn&&!isHost&&netSc?netSc:mode=='Capture the Flag'?cs:mode=='Domination'||mode=='Hardpoint'?ds:mode=='Kill Confirmed'?kc:{A:ts.A||0,B:ts.B||0};return `Blue ${t.A||0} – ${t.B||0} Red`}
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
;
/* ######## nav.js ######## */
/* ===================== nav.js ===================== */
/* ---------- real navigation for zombies and Multiplayer bots ----------
   A 1 unit grid of the whole map where every cell closer than 0.62 to a wall is blocked (agents have radius 0.45), so anything that follows a path of free cells cannot clip a corner.
   Zombies share one Dijkstra flow field per player and follow it with look-ahead; bots run A* with string pulling (the shortest straight-line path through the free cells).
   Both use grid line-of-sight to cut corners safely, and an unstick routine (side step, re-plan, finally snap to the nearest free cell) so nobody stays wedged. */
const NAV={n:0,g:null,r:.62,st:null,gs:null,par:null,stamp:0};
function navBuild(){const n=Math.ceil(H*2),g=new Uint8Array(n*n),r=NAV.r;
 for(const k of bx){if(k.h<=.5||(k.y0||0)>=2)continue;const i0=Math.max(0,Math.floor(k.x0-r+H)),i1=Math.min(n-1,Math.floor(k.x1+r+H)),j0=Math.max(0,Math.floor(k.z0-r+H)),j1=Math.min(n-1,Math.floor(k.z1+r+H));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=i+.5-H,cz=j+.5-H;if(cx>k.x0-r&&cx<k.x1+r&&cz>k.z0-r&&cz<k.z1+r)g[j*n+i]=1}}
 for(let i=0;i<n;i++){g[i]=g[(n-1)*n+i]=g[i*n]=g[i*n+n-1]=1}
 NAV.n=n;NAV.g=g;NAV.st=new Int32Array(n*n);NAV.gs=new Float64Array(n*n);NAV.par=new Int32Array(n*n);NAV.stamp=0;
 /* connected regions of free cells: anything outside the biggest play-area region (a sealed room, a cliff top bots cannot climb to, a gap between objects) is unreachable on foot */
 const comp=new Int32Array(n*n).fill(-1),cnt=[],M=MAPS[sel.map]||{};let cc=0;
 for(let s=0;s<n*n;s++){if(g[s]||comp[s]>=0)continue;let c=0;const stk=[s];comp[s]=cc;while(stk.length){const u=stk.pop(),x0=u%n,y0=(u/n)|0;if(!M.inside||M.inside(x0+.5-H,y0+.5-H))c++;
   for(const[dx,dz]of N8){const x=x0+dx,y=y0+dz;if(x<0||y<0||x>=n||y>=n)continue;const k=y*n+x;if(g[k]||comp[k]>=0)continue;if(dx&&dz&&(g[y0*n+x]||g[y*n+x0]))continue;comp[k]=cc;stk.push(k)}}cnt.push(c);cc++}
 let main=0;cnt.forEach((c,i)=>{if(c>cnt[main])main=i});NAV.comp=comp;NAV.main=main}
/* true when (x,z) is a free spot inside the main walkable region (zombie mode has doors that open later, so everything counts there) */
const navOK=(x,z)=>{const g=NAV.g;if(!g||!NAV.comp||mode=='Zombies')return true;const[i,j]=navCell(x,z),k=j*NAV.n+i;return !g[k]&&NAV.comp[k]==NAV.main};
const navCell=(x,z)=>{const n=NAV.n;return[cl(Math.floor(x+H),0,n-1),cl(Math.floor(z+H),0,n-1)]},navCtr=(i,j)=>[i+.5-H,j+.5-H];
function navSnap(i,j){const n=NAV.n,g=NAV.g;for(let r=1;r<8;r++){let best=null,bd=1e9;for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(Math.max(Math.abs(a),Math.abs(b))!=r)continue;const x=i+a,y=j+b;if(x<0||y<0||x>=n||y>=n||g[y*n+x])continue;const d=a*a+b*b;if(d<bd){bd=d;best=[x,y]}}if(best)return best}return[i,j]}
function navLos(x0,z0,x1,z1){const g=NAV.g;if(!g)return true;const n=NAV.n,d=Math.hypot(x1-x0,z1-z0),st=Math.max(1,Math.ceil(d/.35));for(let s=0;s<=st;s++){const t=s/st;if(t*d<.75)continue;const i=Math.floor(x0+(x1-x0)*t+H),j=Math.floor(z0+(z1-z0)*t+H);if(i<0||j<0||i>=n||j>=n||g[j*n+i])return false}return true}
/* tiny binary heap of (cost, cell) */
function mkHeap(){const k=[],v=[];return{n:()=>k.length,push(c,x){let i=k.length;k.push(c);v.push(x);while(i>0){const p=(i-1)>>1;if(k[p]<=k[i])break;[k[p],k[i]]=[k[i],k[p]];[v[p],v[i]]=[v[i],v[p]];i=p}},
 pop(){const c=k[0],x=v[0],lk=k.pop(),lv=v.pop();if(k.length){k[0]=lk;v[0]=lv;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<k.length&&k[l]<k[m])m=l;if(r<k.length&&k[r]<k[m])m=r;if(m==i)break;[k[m],k[i]]=[k[i],k[m]];[v[m],v[i]]=[v[i],v[m]];i=m}}return[c,x]}}}
const N8=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
/* flow field: distance (in cells) to the target from every reachable cell, -1 if unreachable */
function navFlow(tx,tz){const n=NAV.n,g=NAV.g;if(!g)return null;const d=new Float64Array(n*n).fill(-1);let[si,sj]=navCell(tx,tz);if(g[sj*n+si])[si,sj]=navSnap(si,sj);const h=mkHeap();d[sj*n+si]=0;h.push(0,sj*n+si);
 while(h.n()){const[c,u]=h.pop();if(c>d[u]+1e-4)continue;const x0=u%n,y0=(u/n)|0;for(const[dx,dz,w]of N8){const x=x0+dx,y=y0+dz;if(x<0||y<0||x>=n||y>=n)continue;const k=y*n+x;if(g[k])continue;if(dx&&dz&&(g[y0*n+x]||g[y*n+x0]))continue;const nc=c+w;if(d[k]<0||nc<d[k]){d[k]=nc;h.push(nc,k)}}}
 return d}
/* next point to walk to on a flow field: follow the gradient a few cells, then aim at the farthest of them that is in clear sight */
function navFlowTarget(fl,x,z){const n=NAV.n,g=NAV.g;let[i,j]=navCell(x,z);const pts=[];let cur=fl[j*n+i];
 const best=(i,j,cv)=>{let bi=-1,bj=-1,bv=cv<0?1e9:cv;for(const[dx,dz]of N8){const a=i+dx,b=j+dz;if(a<0||b<0||a>=n||b>=n||g[b*n+a])continue;if(dx&&dz&&(g[j*n+a]||g[b*n+i]))continue;const v=fl[b*n+a];if(v>=0&&v<bv-1e-4){bv=v;bi=a;bj=b}}return bi<0?null:[bi,bj,bv]};
 for(let s=0;s<12;s++){const r=best(i,j,cur);if(!r)break;i=r[0];j=r[1];cur=r[2];pts.push(navCtr(i,j));if(cur<=.01)break}
 if(!pts.length)return null;for(let k=pts.length-1;k>=0;k--)if(navLos(x,z,pts[k][0],pts[k][1]))return pts[k];return pts[0]}
/* A* with octile heuristic, then string pulling. Returns waypoints in world coordinates. */
function navPath(sx,sz,tx,tz){const n=NAV.n,g=NAV.g;if(!g)return null;let[si,sj]=navCell(sx,sz),[ti,tj]=navCell(tx,tz);if(g[sj*n+si])[si,sj]=navSnap(si,sj);if(g[tj*n+ti])[ti,tj]=navSnap(ti,tj);
 const s=sj*n+si,t=tj*n+ti,{st,gs,par}=NAV,S=++NAV.stamp,hf=k=>{const dx=Math.abs((k%n)-ti),dz=Math.abs(((k/n)|0)-tj);return Math.max(dx,dz)+.4142*Math.min(dx,dz)},h=mkHeap();
 st[s]=S;gs[s]=0;par[s]=-1;h.push(hf(s),s);let ex=0,bestK=s,bestH=hf(s),done=false;
 while(h.n()&&ex<7000){const[,u]=h.pop();if(u==t){done=true;bestK=t;break}ex++;const hu=hf(u);if(hu<bestH){bestH=hu;bestK=u}const x0=u%n,y0=(u/n)|0;
  for(const[dx,dz,w]of N8){const x=x0+dx,y=y0+dz;if(x<0||y<0||x>=n||y>=n)continue;const k=y*n+x;if(g[k])continue;if(dx&&dz&&(g[y0*n+x]||g[y*n+x0]))continue;const ng=gs[u]+w;if(st[k]!=S||ng<gs[k]){st[k]=S;gs[k]=ng;par[k]=u;h.push(ng+hf(k),k)}}}
 const cells=[];for(let k=bestK;k>=0;k=par[k])cells.push(k);cells.reverse();const pts=cells.map(k=>navCtr(k%n,(k/n)|0));if(done)pts.push([tx,tz]);
 const out=[];let cx=sx,cz=sz,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!navLos(cx,cz,pts[j][0],pts[j][1]))j--;out.push(pts[j]);cx=pts[j][0];cz=pts[j][1];i=j+1}return out}
function navRescue(b){const n=NAV.n,[i,j]=navCell(b.x,b.z);for(let r=1;r<60;r++){let best=null,bd=1e9;for(let a=-r;a<=r;a++)for(let c=-r;c<=r;c++){if(Math.max(Math.abs(a),Math.abs(c))!=r)continue;const x=i+a,y=j+c;if(x<1||y<1||x>=n-1||y>=n-1)continue;const k=y*n+x;if(NAV.g[k]||NAV.comp[k]!=NAV.main)continue;const d=a*a+c*c;if(d<bd){bd=d;best=[x,y]}}if(best){const p=navCtr(best[0],best[1]);b.x=p[0];b.z=p[1];b.np=null;b.nt=0;return}}}
function navUnstick(b){const n=NAV.n,[i,j]=navCell(b.x,b.z),[a,c]=NAV.g[j*n+i]?navSnap(i,j):[i,j],p=navCtr(a,c);b.x+=(p[0]-b.x)*.8;b.z+=(p[1]-b.z)*.8}
/* move an agent one step towards (tx,tz) around obstacles; fl is a flow field for the target (zombies) or omitted (A*). Returns the straight distance left. */
function navMove(b,dt,tx,tz,sp,fl){b.nc=(b.nc||0)-dt;if(b.nc<=0){b.nc=1.2+Math.random();if(!navOK(b.x,b.z)&&NAV.comp)navRescue(b)}const dx=tx-b.x,dz=tz-b.z,D=Math.hypot(dx,dz);let gx=tx,gz=tz;
 if(D>1.4&&!navLos(b.x,b.z,tx,tz)){
  if(fl){const r=navFlowTarget(fl,b.x,b.z);if(r){gx=r[0];gz=r[1]}}
  else{b.nt=(b.nt||0)-dt;if(!b.np||b.nt<=0||Math.hypot(tx-(b.ntx||0),tz-(b.ntz||0))>3){b.np=navPath(b.x,b.z,tx,tz);b.nt=.6+Math.random()*.4;b.ni=0;b.ntx=tx;b.ntz=tz}
   const p=b.np;if(p&&p.length){while(b.ni<p.length-1&&(Math.hypot(p[b.ni][0]-b.x,p[b.ni][1]-b.z)<.9||navLos(b.x,b.z,p[b.ni+1][0],p[b.ni+1][1])))b.ni++;gx=p[b.ni][0];gz=p[b.ni][1]}}}
 b.sk=(b.sk||0)+dt;if(b.sk>=.5){const mvd=Math.hypot(b.x-(b.skx==null?b.x:b.skx),b.z-(b.skz==null?b.z:b.skz));b.skx=b.x;b.skz=b.z;b.sk=0;
  if(D>1.8&&mvd<sp*.5*.25){b.stk=(b.stk||0)+1;b.np=null;b.nt=0;b.esc=.45;b.ea=(Math.random()<.5?1:-1)*(1.1+Math.random()*.6);if(b.stk>=3){navUnstick(b);b.stk=0}}else if(mvd>sp*.5*.5)b.stk=0}
 let ang=Math.atan2(gx-b.x,gz-b.z);if(b.esc>0){b.esc-=dt;ang+=b.ea}
 mv(b,Math.sin(ang)*sp*dt,Math.cos(ang)*sp*dt,.45);b.mva=ang;return D}
const _bm=buildMap;buildMap=function(){const r=_bm.apply(this,arguments);navBuild();return r};
;
/* ######## zombies.js ######## */
/* ===================== zombies.js ===================== */
/* ---------- Zombies: rounds of undead that arrive in waves, points for every shot and kill, locked doors, mystery boxes,
   Pack-a-Punch and soda perk machines. Solo or up to 4 player co-op through a private lobby.
   Co-op: the host simulates every zombie, round and door; guests see the zombies as puppets, report their hits to the host and get
   their kill points back. Points, perks and weapons belong to each player. Teammates revive you by holding E; downed players come back
   at the next round; the run ends when everybody is down. ---------- */
let zq=null,zG=null,zi=[],zdoors=[],zboxes=[],zgr=null,zfls={},zdead=[],zhc='',zbT=0,zsT=0;
const PERKS={vit:{n:'Vitality Cola',c:0xd8332a,cost:2500,t:'+50 max health'},spd:{n:'Quick Fizz',c:0x39c85a,cost:3000,t:'Reload twice as fast'},dbl:{n:'Double Pop',c:0xf0c21e,cost:2000,t:'Double damage, faster fire'},rev:{n:'Revive Soda',c:0x2f7de0,cost:500,t:'Revive yourself once'},stam:{n:'Stamin Fizz',c:0xa04ad8,cost:2000,t:'Run 20% faster and shoot while sprinting'},mule:{n:'Mule Soda',c:0xf08a2a,cost:4000,t:'Carry a third weapon'}};
/* perk hooks used by the weapon code (all neutral outside Zombies) */
const zrl=()=>zq&&mode=='Zombies'&&zq.perks.spd?0.5:1,zfr=()=>zq&&mode=='Zombies'&&zq.perks.dbl?0.75:1,zsm=()=>zq&&mode=='Zombies'&&zq.perks.stam?1.2:1,
 zmul=w=>mode=='Zombies'&&zq?ZW*(w.pm||1)*(zq.perks.dbl&&!w.ex&&w.k!='RG'?2:1):1;
const zHp=r=>{const bs=n=>100+30*(n-1)+5*n*(n-1);return Math.round(r<=10?bs(r):bs(10)*Math.pow(1.07,r-10))},zDm=r=>Math.min(55,18+r*1.3),zAc=r=>Math.max(.7,1.1-r*.015),zTot=r=>Math.min(56,Math.round(5+r*2.4)),ZW=2.2,ZE=3,RGB=3000,FACE={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};
const zMe=()=>netOn?myId:'solo',zCli=()=>netOn&&!isHost;

/* ---------- the zombie map: an abandoned, half-collapsed mansion. Four ruined wings (Foyer, Ballroom, Conservatory, Kitchen) joined by four boarded-up doors.
   Walls are 8 high with no ledges beside them so nobody can climb out; light comes only from lamps, sconces, barrels and a fallen chandelier. ---------- */
MAPS['Hollow Estate']={d:'Zombies map: an abandoned, collapsed mansion with four ruined wings, locked doors, perk machines, mystery boxes and Pack-a-Punch',zm:1,H:44,sky:0x141a24,gr:0x2c302a,bc:0x5e584e,ps:[-22,28],skyk:'night',hemi:.62,hemiC:0x8aa0d0,hemiG:0x1a2030,sunI:.3,sunC:0x9fb4ff,fogF:85,gt:'concrete',
 zs:[[-40,40,0],[-8,40,0],[-40,6,0],[40,40,1],[8,40,1],[40,6,1],[-40,-40,2],[-8,-40,2],[-40,-6,2],[40,-40,3],[8,-40,3],[40,-6,3]],
 dr:[{x:0,z:22,w:1.2,d:5,c:1000,a:0,b:1,n:'Ballroom'},{x:-22,z:0,w:5,d:1.2,c:1250,a:0,b:2,n:'Conservatory'},{x:22,z:0,w:5,d:1.2,c:1500,a:1,b:3,n:'Kitchen'},{x:0,z:-22,w:1.2,d:5,c:2000,a:2,b:3,n:'Kitchen'}],
 mc:[{t:'vit',x:-14,z:42,f:'n'},{t:'rev',x:-42,z:22,f:'e'},{t:'dbl',x:42,z:14,f:'w'},{t:'mule',x:14,z:42,f:'n'},{t:'spd',x:-42,z:-14,f:'e'},{t:'stam',x:-14,z:-42,f:'s'},{t:'pap',x:30,z:-42,f:'s'},{t:'box',x:-32,z:4,f:'s'},{t:'box',x:8,z:-4,f:'n'}],
 b(){const M=MAPS['Hollow Estate'],a=[],vv=M._v||(M._v=[]),B=(x,z,w,d,h,y0,c,k)=>a.push([x,z,w,d,h,y0||0,c,k]),V=(x,z,w,d,h,y0,c,s,t)=>vv.push([x,z,w,d,h,y0||0,c,s,t]);
  let sd=17;const r=()=>(sd=(sd*16807)%2147483647)/2147483647,ri=(lo,hi)=>lo+r()*(hi-lo),lights=M.lights=[],wc=0x6e675c,occ=[],keep=[];
  for(const m of M.mc)keep.push([m.x,m.z,4.2]);for(const d of M.dr)keep.push([d.x,d.z,6.5]);for(const s of M.zs)keep.push([s[0],s[1],3.2]);keep.push([M.ps[0],M.ps[1],5]);
  /* tall boundary walls between the wings (8 high, ragged crowns) */
  for(const[x,z,w,d]of[[0,-34.25,1.2,19.5],[0,0,1.2,39],[0,34.25,1.2,19.5],[-34.25,0,19.5,1.2],[0,0,39,1.2],[34.25,0,19.5,1.2]]){B(x,z,w,d,8,0,wc,'brick');const L=Math.max(w,d);for(let t=-L/2+1;t<L/2-1;t+=2.4+r()*2)V(w>d?x+t:x,w>d?z:z+t,w>d?1.4+r():w+.2,w>d?d+.2:1.4+r(),8+.3+r()*1.2,8,0x4a463e,'b','brick')}
  /* the ruined wings */
  const WN=[
   {c:[-22,22],fl:[0x4a3a2c,'plank'],P:[[-18,-9,8,.8],[-14,-18.5,.8,7],[12,-8,.8,10],[16.5,-13,9,.8],[-12,12,.8,10],[-17,7,10,.8]],F:['couch','couch','table','table','piano','bookcase','bookcase','bookcase','bookcase','wardrobe','crate','rubble','rubble','rubble','rubble'],lamp:[6,-6],chan:[-4,14]},
   {c:[22,22],fl:[0x5a5a58,'tile'],P:[[-14,-4,.8,8],[14,6,.8,8],[-9,-8,1.6,1.6,7],[9,-8,1.6,1.6,7],[-9,6,1.6,1.6,7],[9,14,1.6,1.6,7]],F:['couch','couch','table','table','table','piano','crate','crate','rubble','rubble','rubble','rubble','rubble','wardrobe'],chan:[0,2],sconce:[21.85,2,1]},
   {c:[-22,-22],fl:[0x3f5a34,'grass'],P:[[-3,12,10,.8,3.2,'glass'],[14,-6,.8,10,3.2,'glass'],[-16,-2,8,.8],[0,-1,4,4,1],[-8,-8,10,2,.9],[8,5,10,2,.9]],F:['planter','planter','crate','crate','rubble','rubble','rubble','rubble','tree','tree','tree','table'],barrel:[-6,-14],lamp:[0,-1,1],lc:0x9ad0ff},
   {c:[22,-22],fl:[0x6a6c66,'tile'],P:[[-12,-8,.8,8],[-17,-12,10,.8],[14,6,.8,10],[18,1,8,.8],[0,-6,8,2.2,1.1],[-2,3,6,2.2,1.1]],F:['counter','counter','fridge','fridge','table','crate','crate','crate','rubble','rubble','rubble','wardrobe'],lamp:[-3,-6,1.1],barrel:[6,10]}];
  const TY={couch:[2.2,.95,.85,0x6a3a3a,'plank'],table:[2,1.1,.9,0x5a4028,'plank'],bookcase:[2.2,.5,2.3,0x4a3420,'plank'],piano:[1.7,1.3,1.1,0x15171a,'plank'],wardrobe:[1.4,.7,2.1,0x5a4a38,'plank'],crate:[1.1,1.1,1,0x6a5a3a,'plank'],planter:[2.4,1.1,.8,0x4a3a2a,'concrete'],counter:[3,.8,1,0x8a8a84,'tile'],fridge:[.9,.9,2,0xb5b8b4,'metal'],tree:[.6,.6,3.2,0x3a2d22,'plank']};
  const hit=(x,z,w,d,m)=>occ.some(o=>Math.abs(x-o[0])<(w+o[2])/2+m&&Math.abs(z-o[1])<(d+o[3])/2+m),clear=(x,z,rad)=>keep.every(k=>Math.hypot(x-k[0],z-k[1])>k[2]+rad);
  for(const W of WN){const[cx,cz]=W.c,wx=u=>cx+u,wz=v=>cz+v;
   B(cx,cz,43,43,.05,0,W.fl[0],W.fl[1]);
   for(const[u,v,w,d,h,k]of W.P){B(wx(u),wz(v),w,d,h||4.5,0,k=='glass'?0x3a5a54:wc,k||'brick');occ.push([u,v,w,d]);
    if(!k&&!h&&Math.max(w,d)>4){const L=Math.max(w,d);for(let t=-L/2;t<L/2-.5;t+=1.2+r()*1.5)V(w>d?wx(u+t):wx(u),w>d?wz(v):wz(v+t),w>d?1+r()*1.2:w+.1,w>d?d+.1:1+r()*1.2,4.5+.2+r()*.7,4.5,0x4a463e,'b','brick')}}
   /* furniture and rubble scattered on the floor, kept clear of machines, doors, spawns and each other */
   for(const t of W.F){for(let n=0;n<60;n++){const u=ri(-19,19),v=ri(-19,19);let[w,d,h,c,k]=t=='rubble'?[ri(1.4,3.2),ri(1.4,3),ri(.7,1.2),0x6a665c,'concrete']:TY[t];if(r()<.5)[w,d]=[d,w];
     if(!clear(wx(u),wz(v),Math.max(w,d)/2)||hit(u,v,w,d,1.6))continue;occ.push([u,v,w,d]);
     B(wx(u),wz(v),w,d,h,0,c,k);
     if(t=='rubble'){V(wx(u)+ri(-.8,.8),wz(v)+ri(-.8,.8),ri(.5,1),ri(.5,1),h+ri(.1,.4),0,0x7a7468,'b','concrete');V(wx(u)+1.4,wz(v)-.6,.7,1.2,.3,0,0x5a564e,'b','concrete')}
     else if(t=='tree'){V(wx(u),wz(v),2.6,2.6,5,2.6,0x2e3a26,'s');V(wx(u)+.4,wz(v)-.5,1.8,1.8,5.6,3.4,0x26321f,'s')}
     else if(t=='piano')V(wx(u),wz(v),w*.9,d*.9,h+.18,h,0x0c0d0f,'b','plank');
     else if(t=='couch'||t=='table')V(wx(u),wz(v),w*.95,d*.95,h+.12,h,t=='couch'?0x7a4646:0x6a5030,'b','plank');
     break}}
   /* torn rugs, stains and debris, flat on the floor (walkable) */
   for(let k=0;k<7;k++){const u=ri(-18,18),v=ri(-18,18);V(wx(u),wz(v),ri(2.4,4.6),ri(1.8,3.4),.04,.05,[0x5a1a1a,0x1f3a3a,0x4a3a1a][k%3],'b','plank')}
   for(let k=0;k<18;k++){const u=ri(-20,20),v=ri(-20,20);V(wx(u),wz(v),ri(.5,1.6),ri(.5,1.6),.05,.05,0x3a0808,'b','concrete')}
   for(let k=0;k<26;k++){const u=ri(-20,20),v=ri(-20,20);V(wx(u),wz(v),ri(.2,.7),ri(.2,.7),ri(.1,.28),.05,[0x5a554c,0x4a4640,0x6a5a45][k%3],'b','concrete')}
   /* open roof: a few surviving rafters across the sky */
   for(let k=-3;k<=3;k++){const L=ri(14,30);V(wx(0),wz(k*6.5),L,.45,7.9,7.4,0x2a2118,'b','plank');if(k%2)V(wx(k*6.5),wz(0),.45,ri(10,24),7.9,7.4,0x2a2118,'b','plank')}
   /* light sources that are actually part of the room */
   if(W.lamp){const[u,v,y]=[W.lamp[0],W.lamp[1],W.lamp[2]||0],x=wx(u),z=wz(v);V(x,z,.35,.35,y+.1,y,0x2a2a2a,'c');V(x,z,.06,.06,y+1.7,y,0x3a3a3a,'c');V(x,z,.5,.5,y+2.1,y+1.7,W.lc||0xffe0a0,'e');lights.push([x,y+1.9,z,W.lc||0xffc890,1.5,30])}
   if(W.chan){const x=wx(W.chan[0]),z=wz(W.chan[1]);V(x,z,2.6,2.6,.5,0,0x8a6a2a,'c');V(x,z,1.7,1.7,.9,.45,0x6a4a1a,'c');for(let q=0;q<6;q++){const ag=q*1.047;V(x+Math.cos(ag)*1.3,z+Math.sin(ag)*1.3,.18,.18,.62,.5,0xffe4b0,'e')}V(x+2.1,z+.7,.1,1.6,.15,0,0xaab8c0,'g');B(x,z,2.6,2.6,.25,0,0x8a6a2a,'n');lights.push([x,1.4,z,0xffb070,1.8,34])}
   if(W.barrel){const x=wx(W.barrel[0]),z=wz(W.barrel[1]);V(x,z,.95,.95,1,0,0x4a3a30,'c','metal');V(x,z,.7,.7,1.25,1,0xff7a1a,'e');B(x,z,.95,.95,1,0,0x4a3a30,'metal');lights.push([x,1.8,z,0xff8a3a,1.7,28])}
   if(W.sconce){const[u,v,s]=W.sconce,x=wx(u),z=wz(v),dx=s==1?-1:s==0?0:0;V(x,z,.3,.5,3,2.5,0x2a2a2a,'b');V(x+dx*.3,z,.18,.18,3.3,2.95,0xffcf8a,'e');lights.push([x+dx*.8,3.1,z,0xffc080,1.2,22])}}
  return a}};

/* ---------- small helpers ---------- */
const zTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
function zSprite(txt,col,sz,depth){const c=document.createElement('canvas');c.width=256;c.height=64;const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:!!depth}));s.scale.set(sz*4,sz,1);s.userData={c,t};zSet(s,txt,col);return s}
function zSet(s,txt,col){const g=s.userData.c.getContext('2d');g.clearRect(0,0,256,64);g.font='700 40px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='#000';g.strokeText(txt,128,34);g.fillStyle=col;g.fillText(txt,128,34);s.userData.t.needsUpdate=true}
const hex=c=>'#'+c.toString(16).padStart(6,'0'),zf=m=>{beep(140,.2,'sawtooth',.07);msg(m,1)};
function zSolid(x,z,w,d,h){const b={x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h,y0:0};bx.push(b);return b}
function zUnsolid(b){const i=bx.indexOf(b);if(i>=0)bx.splice(i,1);zGrid()}

/* ---------- weapons the player holds ---------- */
function zGunObj(k){const w={k,...eff(k,[])};w.mag=w.m;w.rs=k=='RG'?3:(w.rs==null?4:w.rs);w.res=w.m*w.rs;return w}
function zGive(k){const w=zGunObj(k),i=wp.findIndex(x=>x.k==k);if(i>=0){wp[i]=w;cur=i}else if(wp.length<zq.cap){wp.push(w);cur=wp.length-1}else wp[cur]=w;rel=0;setGun();msg(W[k].n,1.5)}
function zPick(by){const own=by==zMe()?wp.map(w=>w.k):[];if(Math.random()<.03&&!own.includes('RG'))return 'RG';const pool=['AR','SMG','BR','SG','MP','VMP','SN','RL','CY','MG'].filter(k=>!own.includes(k));return pool.length?pool[Math.random()*pool.length|0]:'SMG'}
function zPap(w){const B=W[w.k],t=(w.pap||0)+1;w.pap=t;w.pm=t==1?2.2:3.6;if(w.k=='RG')w.pm=t==1?3:6;w.m=Math.round(B.m*(t==1?1.5:2));w.r=B.r*(t==1?.9:.8);w.pn=B.n+(t==1?' PaP':' PaP II');w.mag=w.m;w.res=w.m*w.rs;rel=0;setGun()}
const _zsg=setGun;setGun=function(){_zsg();gf.material.color.setHex(mode=='Zombies'&&cw().pap?0xc080ff:0xffdd66)};

/* ---------- building the level objects: doors, machines, boxes ---------- */
function zStart(){document.body.classList.toggle('zom',mode=='Zombies');$('#zh').style.display=mode=='Zombies'?'block':'none';$('#zp').textContent='';zhc='';
 if(zG&&zG.parent)zG.parent.remove(zG);zG=null;zi=[];zdoors=[];zboxes=[];zdead=[];zfls={};zbT=zsT=0;if(mode!='Zombies'){zq=null;return}
 const M=MAPS[sel.map];zq={r:0,pts:500,perks:{},cap:2,revBuys:0,revM:null,st:'prep',tm:6,toSpawn:0,spT:0,open:{0:1},fl:0,cur:null,gn:3,brutes:0,down:0,out:0,dnT:0,rvT:0,ad:0,mp:[],pb:{}};
 wp=[zGunObj('CT')];cur=0;rel=0;gc=L.g?2:0;P.mhp=50;P.hp=50;setGun();
 if(netOn){const k=Object.keys(names).sort().indexOf(myId);P.x+=(k%2?1.6:-1.6);P.z+=(k>1?1.6:0)}
 zG=new THREE.Group();mapG.add(zG);M.dr.forEach((d,i)=>zDoor(d,i));for(const m of M.mc){if(m.t=='box')zMakeBox(m);else zMachine(m)}zGrid()}
function zDoor(d,idx){const m=new THREE.Group(),body=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:0x5b4636}));body.scale.set(d.w,8,d.d);body.position.y=4;m.add(body);
 const sg_=new THREE.MeshBasicMaterial({map:zTex(256,64,(g,w,h)=>{g.fillStyle='#1b1410';g.fillRect(0,0,w,h);g.fillStyle='#ffd24a';g.font='700 40px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('DOOR  '+d.c,w/2,h/2+2)})}),thin=d.d<d.w;
 for(const s of[1,-1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),sg_);if(thin){p.position.set(0,2.3,s*(d.d/2+.03));p.rotation.y=s>0?0:Math.PI}else{p.position.set(s*(d.w/2+.03),2.3,0);p.rotation.y=s>0?Math.PI/2:-Math.PI/2}m.add(p)}
 m.position.set(d.x,0,d.z);zG.add(m);const o={d,m,box:zSolid(d.x,d.z,d.w,d.d,8),open:0};zdoors.push(o);
 zi.push({x:d.x,z:d.z,r:3.4,txt:()=>o.open?'':'Open door to the '+d.n,cost:()=>o.open?0:d.c,act:()=>{if(o.open)return;if(zq.pts<d.c)return zf('Not enough points');if(zCli())return void netSend({t:'zqd',i:idx});zq.pts-=d.c;zOpenDoor(idx,zMe())}})}
function zOpenDoor(i,by){const o=zdoors[i];if(!o||o.open)return;o.open=1;o.sink=1;zUnsolid(o.box);zq.open[o.d.a]=zq.open[o.d.b]=1;zq.fl=0;beep(200,.4,'sawtooth',.09);msg(o.d.n+' unlocked',1.8);if(netOn&&isHost)netSend({t:'zd',i,by})}
function zFace(p){return zTex(128,192,(g,w,h)=>{const col=hex(p.c);g.fillStyle='#14181c';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,col);gr.addColorStop(1,'#050505');g.fillStyle=gr;g.fillRect(6,6,w-12,h-12);
 g.fillStyle='#e9eef1';g.fillRect(36,28,56,86);g.fillStyle=col;g.fillRect(36,56,56,32);g.fillStyle='#bfc7cc';g.fillRect(36,22,56,8);g.fillRect(36,112,56,6);
 g.fillStyle='#fff';g.font='700 28px Teko,Impact,sans-serif';g.textAlign='center';const wd=p.n.toUpperCase().split(' ');g.fillText(wd[0],w/2,150);g.fillText(wd[1]||'',w/2,177)})}
function zMachine(m){const pap=m.t=='pap',p=pap?{n:'Pack-a-Punch',c:0x7a3ad8,cost:0}:PERKS[m.t],g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),
  Bm=(w,h,d,x,y,z,mt)=>{const o=new THREE.Mesh(bg,mt);o.scale.set(w,h,d);o.position.set(x,y,z);g.add(o);return o},W_=pap?2.6:1.4,Hh=pap?2.8:2.4,D_=pap?1.4:1;
 Bm(W_,Hh,D_,0,Hh/2,0,M(pap?0x1d2540:0x2b2f35));Bm(W_+.1,.12,D_+.1,0,Hh+.02,0,M(p.c));
 const face=new THREE.Mesh(new THREE.PlaneGeometry(W_-.2,Hh-.55),new THREE.MeshBasicMaterial({map:pap?zTex(256,192,(c,w,h)=>{c.fillStyle='#120a22';c.fillRect(0,0,w,h);const gr=c.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#7a3ad8');gr.addColorStop(1,'#2a6ad8');c.fillStyle=gr;c.fillRect(8,8,w-16,h-16);c.fillStyle='#fff';c.textAlign='center';c.font='700 52px Teko,Impact,sans-serif';c.fillText('PACK-A',w/2,76);c.fillText('A-PUNCH',w/2,128);c.font='600 22px Rajdhani,sans-serif';c.fillText('UPGRADE YOUR WEAPON',w/2,166)}):zFace(p)}));
 face.position.set(0,Hh/2+.1,D_/2+.01);g.add(face);const lb=zSprite(p.n,'#ffffff',.5,1);lb.position.y=Hh+.8;g.add(lb);
 if(pap){const bm=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,9,12),new THREE.MeshBasicMaterial({color:0x8a4aff,transparent:true,opacity:.18,depthWrite:false}));bm.position.y=Hh+4.5;g.add(bm)}
 g.position.set(m.x,0,m.z);g.rotation.y=FACE[m.f];zG.add(g);const side=m.f=='e'||m.f=='w',bxo=zSolid(m.x,m.z,side?D_:W_,side?W_:D_,Hh);
 if(pap){zi.push({x:m.x,z:m.z,r:3.4,txt:()=>{const w=cw(),t=w.pap||0;return t>=2?'Weapon fully upgraded':'Pack-a-Punch the '+(w.pn||W[w.k].n)},cost:()=>[5000,10000][cw().pap||0]||0,act:()=>{const w=cw(),c=[5000,10000][w.pap||0];if(!c)return zf('Already fully upgraded');if(zq.pts<c)return zf('Not enough points');zq.pts-=c;zPap(w);beep(300,.15,'sawtooth',.09);setTimeout(()=>beep(900,.3,'triangle',.09),120);msg('Pack-a-Punched!',2)}})}
 else{zq.mp.push({k:zq.mp.length,x:m.x,z:m.z,f:m.f,n:p.n});const o={gone:0};if(m.t=='rev')zq.revM={g,bxo,o};zi.push({x:m.x,z:m.z,r:2.6,txt:()=>o.gone?'':zq.perks[m.t]?'':p.n+': '+p.t,cost:()=>o.gone||zq.perks[m.t]?0:p.cost,act:()=>zPerk(m.t)})}}
function zPerk(t){const p=PERKS[t];if(zq.perks[t])return zf('You already have '+p.n);if(t=='rev'&&zq.revBuys>=4)return zf('Out of stock');if(zq.pts<p.cost)return zf('Not enough points');zq.pts-=p.cost;zq.perks[t]=1;
 if(t=='vit'){P.mhp=100;P.hp=100}if(t=='mule')zq.cap=3;
 if(t=='rev'){if(zCli())netSend({t:'zqr'});else{zq.revBuys++;zRevCount(zq.revBuys);if(netOn)netSend({t:'zrev',n:zq.revBuys})}}
 beep(520,.1,'triangle',.08);setTimeout(()=>beep(780,.15,'triangle',.08),90);msg(p.n+': '+p.t,2)}
/* the Revive Soda machine runs dry after four purchases (counted across every player) */
function zRevCount(n){zq.revBuys=n;const o=zq.revM;if(n>=4&&o&&!o.o.gone){o.g.visible=false;o.o.gone=1;zUnsolid(o.bxo);setTimeout(()=>msg('The Revive Soda machine is empty',2),1800)}}
function zMakeBox(m){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),Bm=(w,h,d,x,y,z,mt)=>{const o=new THREE.Mesh(bg,mt);o.scale.set(w,h,d);o.position.set(x,y,z);g.add(o)};
 Bm(1.8,.8,.9,0,.4,0,M(0x6b4a2b));Bm(1.85,.24,.95,0,.92,0,M(0x4a3320));Bm(.12,.84,.96,-.55,.42,0,M(0xd9b13b));Bm(.12,.84,.96,.55,.42,0,M(0xd9b13b));Bm(.22,.22,.06,0,.75,.46,M(0xffd24a));
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,8,12),new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.2,depthWrite:false})),lab=zSprite('?','#ffd24a',.6);beam.position.y=4.5;beam.visible=false;lab.position.y=2.4;lab.visible=false;g.add(beam,lab);
 g.position.set(m.x,0,m.z);g.rotation.y=FACE[m.f];zG.add(g);const side=m.f=='e'||m.f=='w';zSolid(m.x,m.z,side?.9:1.8,side?1.8:.9,.9);
 const idx=zboxes.length,o={st:0,t:0,cy:0,item:null,by:'',beam,lab};zboxes.push(o);
 zi.push({x:m.x,z:m.z,r:2.8,txt:()=>o.st==0?'Mystery Box':o.st==2&&o.by==zMe()?'Take the '+W[o.item].n:'',cost:()=>o.st==0?950:0,act:()=>zBoxAct(o,idx)})}
function zBoxAct(o,i){if(o.st==0){if(zq.pts<950)return zf('Not enough points');if(zCli())return void netSend({t:'zqb',i});zq.pts-=950;zBoxStart(o,i,zMe())}
 else if(o.st==2&&o.by==zMe()){zGive(o.item);if(zCli())netSend({t:'zqe',i});zBoxEnd(o,i)}}
function zBoxStart(o,i,by){o.st=1;o.t=0;o.cy=0;o.by=by;beep(300,.2,'triangle',.08);if(netOn&&isHost)netSend({t:'zbs',i,st:1,by})}
function zBoxEnd(o,i){o.st=0;o.beam.visible=o.lab.visible=false;if(netOn&&isHost)netSend({t:'zbs',i,st:0})}
function zBoxTick(o,i,dt,auth){if(o.st==1){o.t+=dt;o.cy-=dt;o.beam.visible=o.lab.visible=true;if(o.cy<=0){o.cy=.12;zSet(o.lab,['KN-115','SMG','Battle Rifle','Shotgun','Magnum','Machine Pistol','VMP-X','Sniper Rifle','Rocket Launcher','Coyote'][Math.random()*10|0],'#ffd24a');beep(500+Math.random()*300,.05,'square',.03)}
  if(auth&&o.t>3.2){o.item=zPick(o.by);o.st=2;o.t=0;zSet(o.lab,W[o.item].n,o.item=='RG'?'#ff4a4a':'#7bf08a');beep(900,.2,'triangle',.09);if(netOn&&isHost)netSend({t:'zbs',i,st:2,item:o.item,by:o.by})}}
 else if(o.st==2&&auth){o.t+=dt;if(o.t>9)zBoxEnd(o,i)}}

/* ---------- navigation: a coarse grid and a breadth-first flow field towards each player ---------- */
function zGrid(){navBuild();zgr=NAV}
function zFlow(pl){return navFlow(pl.x,pl.z)}
/* everyone the zombies can attack: the host and every connected player who is on their feet */
function zPlayers(){const a=[];if(!P.dead)a.push({id:zMe(),x:P.x,z:P.z,y:P.y,me:1});if(netOn)for(const b of bots)if(b.net&&!b.hb&&b.al)a.push({id:b.id,x:b.x,z:b.z,y:b.y||0});return a}

/* ---------- zombies ---------- */
function zModel(r,big){const m=new THREE.Group(),t=Math.min(3,r/5|0),pk=a=>a[Math.random()*a.length|0],
 rig=mkHuman(m,{zombie:1,skin:[0xa9b98a,0xb3b58a,0xa89aa8,0xb27a62][t],shirt:big?0x5a1a14:pk([0x5a6a7a,0x6a5a4a,0x4a5a46,0x7a6a5a,0x3a3a44,0x6a4a4a]),pants:pk([0x2f3340,0x3a3a30,0x4a3f35,0x26282c]),hair:pk([0x1a1410,0x2a2018,0x3a342a]),eye:r>=15?0xff9a2a:0xff2a2a});
 S.add(m);if(big)m.scale.setScalar(1.35);return{m,rig}}
function mkZombie(x,z,big){const r=zq.r,{m,rig}=zModel(r,big),hp=Math.round(zHp(r)*(big?3:1)),run=r>=25||(r>=6&&Math.random()<Math.min(.6,(r-5)*.06)),
 b={i:botId++,m,rig,x,z,y:0,hp,mhp:hp,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,big:!!big,nm:big?'Brute':'Zombie',cd:.5,k:0,df:1,dm:Math.min(zDm(r)*(big?1.5:1),big?70:55),ac:zAc(r),sp:(Math.min(4.2,1.6+r*.11+Math.random()*.5)+(run?1:0))*(big?.75:1)};
 m.position.set(x,0,z);bots.push(b);burst(V(x,1,z),big?30:14,big?0xaa3a2a:0x6a9a4a,5,.7,.14);return b}
function zPuppet(i,x,z,big,r){const{m,rig}=zModel(r,big),b={i,m,rig,x,z,tx:x,tz:z,y:0,hp:1e9,mhp:1e9,sh:0,msh:0,lh:-9,al:1,team:'z',zom:1,zp:1,big:!!big,nm:big?'Brute':'Zombie',df:1,k:0};m.position.set(x,0,z);bots.push(b);return b}
function zSpawn(M,big){const open=M.zs.filter(s=>zq.open[s[2]]),pl=zPlayers(),far=open.filter(s=>pl.every(p=>Math.hypot(s[0]-p.x,s[1]-p.z)>16)),s=(far.length?far:open)[Math.random()*(far.length||open.length)|0];mkZombie(s[0]+(Math.random()-.5)*3,s[1]+(Math.random()-.5)*3,big)}
/* damage to a zombie: 10 points per hit, kill 50 (60 explosive), headshot kill 100, melee kill 130; the RayGun kills anything.
   Guests send their hits to the host (zqh) and get the kill points back (zk). */
const _zhb=hitBot;hitBot=function(b,d,head){if(b.zom)return zHit(b,d,head);if(mode=='Zombies')return;_zhb(b,d,head)};
function zHit(b,d,head){if(!b.al)return;const w=wp.find(x=>x.k==srcK);if(srcK=='RG')d=RGB*(w&&w.pm?w.pm:1)*(b.big?2:1);else if(w&&w.ex)d*=ZE*(w.pm||1);else if(!srcK&&src!='Melee')d*=ZE;
 if(b.zp){hits++;juiceHit(b,Math.min(d,9999),head);$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04);if(src!='Melee')zq.pts+=10;netSend({t:'zqh',i:b.i,d,h:head?1:0,k:srcK,m:src=='Melee'?1:0});return}
 zDamage(b,d,head,zMe(),srcK,src=='Melee')}
function zDamage(b,d,head,by,k,mel){if(!b.al)return;b.hp-=d;b.lh=t0;const mine=by==zMe();
 if(mine){hits++;$('#hm').className='on'+(head?' hd':'');hmT=.12;beep(head?900:600,.05,'square',.04)}juiceHit(b,Math.min(d,9999),head);
 if(b.hp>0){if(mine&&!mel)zq.pts+=10;return}
 b.al=0;const pt=mel?130:head?100:(k=='RL'||k=='RG')?60:50;zdead.push({b,t:0});{const kp=mine?P:bots.find(x=>x.net&&x.id==by);ragStart(b,kp?b.x-kp.x:0,kp?b.z-kp.z:0,b.big?2.2:(k=='SG'||k=='RL'||k=='RG'?6:3.4))}
 if(mine){kills++;zq.pts+=pt;floatTxt(V(b.x,2.8,b.z),'+'+pt,'#ffd24a');juiceKill(b,head);wzkill(k);killXP(head)}
 else{const nb=bots.find(x=>x.net&&x.id==by);if(nb)nb.k=(nb.k||0)+1;netSend({t:'zk',to:by,pts:pt,k,h:head?1:0})}}
function zMove(dt){const zs=bots.filter(b=>b.zom&&b.al),pls=zPlayers();
 for(const b of zs){let pl=null,bd=1e9;for(const p of pls){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<bd){bd=d;pl=p}}if(!pl)continue;
  let sps=b.sp;if(b.stun>0){b.stun-=dt;sps*=.15}const D=navMove(b,dt,pl.x,pl.z,sps,zfls[pl.id]);b.m.position.set(b.x,0,b.z);b.tyaw=D<4?Math.atan2(pl.x-b.x,pl.z-b.z):(b.mva==null?b.m.rotation.y:b.mva);
  b.cd-=dt;if(D<1.5*(b.big?1.3:1)&&Math.abs(pl.y)<1.4){if(b.cd<=0){b.cd=b.ac;b.lunge=.3;if(pl.me)hurt(b.dm,b);else netSend({t:'hit',to:pl.id,d:b.dm,bot:b.i})}}else b.cd=Math.max(b.cd,.35)}
 for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++){const a=zs[i],c=zs[j],dx=c.x-a.x,dz=c.z-a.z,d=Math.hypot(dx,dz);if(d<.8&&d>.001){const p=(.8-d)*.5/d;mv(a,-dx*p,-dz*p,.45);mv(c,dx*p,dz*p,.45)}}
 zq.gn-=dt;if(zq.gn<=0&&zs.length){zq.gn=2+Math.random()*2;const b=zs[Math.random()*zs.length|0],d=Math.hypot(b.x-P.x,b.z-P.z);if(d<25)beep(70+Math.random()*50,.4,'sawtooth',Math.max(.01,.05-d*.002))}}
function zAnim(dt){for(let i=zdead.length-1;i>=0;i--){const d=zdead[i];d.t+=dt;ragTick(d.b,dt);if(d.t>6&&d.b.rag)d.b.rag.sink=(d.t-6)*1.4;if(d.t>7.2){S.remove(d.b.m);const j=bots.indexOf(d.b);if(j>=0)bots.splice(j,1);zdead.splice(i,1)}}
 for(const o of zdoors)if(o.sink){o.m.position.y-=dt*6;if(o.m.position.y<-5){zG.remove(o.m);o.sink=0}}}

/* ---------- round flow ---------- */
/* what a new round does for every player (host and guests): restock ammo, camo check, bring downed players back */
function zRoundFx(){const z=zq;zRoundDone(z.r);for(const w of wp){w.mag=w.m;w.res=w.m*(w.rs==null?4:w.rs)}if(L.g)gc=Math.min(3,gc+1);rel=0;if(netOn&&P.dead)zRespawn();
 msg(z.brutes?'Round '+z.r+' · Brutes incoming':'Round '+z.r,3);beep(110,.5,'sawtooth',.1);setTimeout(()=>beep(80,.6,'sawtooth',.1),250)}
function zNewRound(){const z=zq;z.r++;z.st='run';z.toSpawn=zTot(z.r);z.brutes=z.r%5==0?Math.floor(z.r/5):0;z.spT=.6;zRoundFx();if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:0,br:z.brutes})}
function zEndRound(){const z=zq;z.st='prep';z.tm=8;msg('Round '+z.r+' survived',2.5);beep(660,.2,'triangle',.08);setTimeout(()=>beep(880,.3,'triangle',.08),180);if(netOn)netSend({t:'zs',r:z.r,st:z.st,tm:z.tm})}
function zRoundSync(d){const z=zq;if(d.r>z.r){z.r=d.r;z.brutes=d.br||0;zRoundFx()}else if(d.st=='prep'&&z.st!='prep'){msg('Round '+z.r+' survived',2.5);beep(660,.2,'triangle',.08)}z.st=d.st;z.tm=d.tm}
/* per-frame work shared by the host and by guests */
function zCommon(dt){const z=zq;if(!P.dead&&t0-lastHit>6&&P.hp<P.mhp)P.hp=Math.min(P.mhp,P.hp+12*dt);
 if(z.down){z.dnT-=dt;if(z.dnT<=0){z.down=0;z.out=1;msg('You bled out. You return next round',3)}}
 if(z.cur&&z.cur.rv&&key.KeyF&&!P.dead){z.rvT+=dt;$('#zp').textContent=`Reviving ${z.cur.rv.nm}… ${Math.min(100,Math.round(z.rvT/2*100))}%`;if(z.rvT>=2){z.rvT=0;netSend({t:'zqv',to:z.cur.rv.id});z.pts+=100;feed('You revived '+z.cur.rv.nm)}}else z.rvT=0;
 zAnim(dt);zInteract();zMarkers();zProne()}
function zomTick(dt){const z=zq;if(!z||mode!='Zombies')return;const M=MAPS[sel.map];
 let alive=0;for(const b of bots)if(b.zom&&b.al)alive++;
 if(z.st=='prep'){z.tm-=dt;if(z.tm<=0)zNewRound()}
 else{z.spT-=dt;if(z.toSpawn>0&&z.spT<=0){const room=Math.min(24,6+z.r*2)-alive;if(room>0){const n=Math.min(room,z.toSpawn,2+(z.r>3?1:0)+(z.r>8?1:0));for(let i=0;i<n;i++){const big=z.brutes>0&&(z.toSpawn-i<=z.brutes||Math.random()<.2);if(big)z.brutes--;zSpawn(M,big)}z.toSpawn-=n;z.spT=Math.max(1.2,3.2-z.r*.12)}else z.spT=.4}
  if(z.toSpawn<=0&&alive<=0)zEndRound()}
 z.fl-=dt;if(z.fl<=0&&zgr){z.fl=.35;zfls={};for(const pl of zPlayers())zfls[pl.id]=zFlow(pl)}
 zMove(dt);zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,1));
 if(netOn){zbT+=dt;if(zbT>.1){zbT=0;netSend({t:'zb',r:z.r,l:bots.filter(b=>b.zom&&b.al).map(b=>[b.i,+b.x.toFixed(1),+b.z.toFixed(1),b.big?1:0])})}
  zsT+=dt;if(zsT>.5){zsT=0;netSend({t:'zs',r:z.r,st:z.st,tm:Math.ceil(z.tm),br:z.brutes})}
  if(!zPlayers().length&&!over){z.ad+=dt;if(z.ad>6)endGame('You reached round '+z.r)}else z.ad=0}
 $('#ob').textContent=z.st=='prep'?(z.r?`Round ${z.r} survived  ·  next round in ${Math.ceil(z.tm)}`:`Get ready  ·  first round in ${Math.ceil(z.tm)}`):`Round ${z.r}  ·  Zombies left ${z.toSpawn+alive}`;zHud()}
/* lying prone in front of a perk machine pays 100 points, once per machine per match and only to the first player who does it (the host decides in co-op) */
function zProne(){const z=zq;if(!z||P.dead||!ST.prone||!z.mp)return;z.pbq=z.pbq||{};for(const m of z.mp){if(z.pb[m.k]||z.pbq[m.k])continue;const a=FACE[m.f],fx=Math.sin(a),fz=Math.cos(a),dx=P.x-m.x,dz=P.z-m.z,fw=dx*fx+dz*fz,lat=Math.abs(dx*fz-dz*fx);
  if(fw>.7&&fw<3.6&&lat<1.8){z.pbq[m.k]=1;if(zCli())netSend({t:'zqp',k:m.k});else zProneGrant(m.k,zMe())}}}
function zProneGrant(k,by){const z=zq,m=z.mp[k];if(!m||z.pb[k])return;z.pb[k]=by;if(by==zMe())zProneGift(k);if(netOn&&isHost)netSend({t:'zpg',k,by})}
function zProneGift(k){const z=zq,m=z.mp[k];z.pts+=100;msg('+100 · '+(m?m.n:'perk machine')+' secret',2.2);beep(1000,.1,'triangle',.07);setTimeout(()=>beep(1500,.12,'triangle',.06),90)}
/* guests: the host runs the world, guests move the puppets and handle their own interactions */
function zcTick(dt){const z=zq;if(!z||mode!='Zombies')return;const k=Math.min(1,dt*10);
 for(const b of bots)if(b.zp&&b.al){const ox=b.x,oz=b.z;b.x+=(b.tx-b.x)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,0,b.z);if(Math.hypot(b.tx-ox,b.tz-oz)>.02)b.tyaw=Math.atan2(b.tx-ox,b.tz-oz)}
 zCommon(dt);zboxes.forEach((o,i)=>zBoxTick(o,i,dt,0));zHud()}
function zSync(d){const seen=new Set();for(const[i,x,z,big]of d.l){seen.add(i);let b=bots.find(q=>q.zp&&q.i==i);if(!b)b=zPuppet(i,x,z,big,d.r);b.tx=x;b.tz=z}
 for(const b of bots)if(b.zp&&b.al&&!seen.has(b.i)){b.al=0;zdead.push({b,t:0});ragStart(b,b.x-P.x,b.z-P.z,3)}}
function zInteract(){const z=zq;let best=null,bd=1e9;if(!P.dead){for(const it of zi){const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r&&d<bd&&it.txt()){bd=d;best=it}}
  if(netOn)for(const b of bots)if(b.net&&!b.hb&&!b.al&&b.dn){const d=Math.hypot(P.x-b.x,P.z-b.z);if(d<2.6&&d<bd){bd=d;best={rv:b,txt:()=>'Hold F to revive '+b.nm,cost:()=>0,act:()=>{}}}}}
 z.cur=best;const e=$('#zp');if(P.dead&&z.down){e.textContent=`DOWN · bleeding out in ${Math.ceil(z.dnT)}s · a teammate can revive you`;e.className='bad';return}if(best){const c=best.cost();e.textContent=best.rv?best.txt():`[F] ${best.txt()}${c?'  ['+c+']':''}`;e.className=c>z.pts?'bad':''}else{e.textContent='';e.className=''}}
function zUse(){if(!zq||P.dead||over)return;if(zq.cur)zq.cur.act()}
function zHud(){const z=zq,ic=Object.keys(z.perks).filter(k=>z.perks[k]).map(k=>`<i style="background:${hex(PERKS[k].c)}">${PERKS[k].n[0]}</i>`).join(''),tm=netOn?bots.filter(b=>b.net&&!b.hb).map(b=>`${esc(b.nm)} ${b.zpts|0}${b.al?'':b.dn?' ✚':' ✖'}`).join('<br>'):'',k=z.r+'|'+z.pts+'|'+ic+'|'+tm+'|'+(z.down?1:0);if(k==zhc)return;zhc=k;$('#zr').textContent=z.r||'';$('#zpt').textContent=z.pts+(z.down?' · DOWN':'');$('#zpk').innerHTML=ic;$('#zt').innerHTML=tm}
/* downed: Revive Soda brings you back by yourself, a teammate can revive you (co-op), otherwise the run ends */
function zDown(){const z=zq;if(!z)return;P.rt=1e9;const rev=z.perks.rev;z.perks={};P.mhp=50;z.cap=2;if(wp.length>2){wp.length=2;if(cur>1){cur=1;setGun()}}gun.visible=false;
 if(rev){msg('Reviving in 4…',3);setTimeout(()=>{if(run&&mode=='Zombies'&&!over&&P.dead&&!z.out)zRevive()},4000)}
 else if(netOn){z.down=1;z.dnT=45;msg('You are down. Hold on until a teammate revives you',3);netSend({t:'zdn'})}
 else setTimeout(()=>{if(mode=='Zombies')endGame('You reached round '+z.r)},2600)}
/* knocked: you lie on the floor (low camera, slow crawl) instead of ragdolling */
function zDownCam(dt){const f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0);if((f||s)&&zq&&!over){const sy=Math.sin(yaw),cy=Math.cos(yaw),n=Math.hypot(f,s)||1;mv(P,(-sy*f+cy*s)/n*1.5*dt,(-cy*f-sy*s)/n*1.5*dt,.4)}
 C.position.set(P.x,.42+Math.sin(t0*2)*.01,P.z);C.rotation.set(Math.max(-.6,Math.min(.4,pitch*.5))-.1,yaw,.18)}
/* every player on their feet sees a marker over a downed teammate */
function zMarkers(){if(!netOn)return;for(const b of bots){if(!b.net||b.hb)continue;const need=!b.al&&b.dn&&!P.dead;if(need&&!b.zmk){b.zmk=zSprite('','#ff5a3a',.8,0);S.add(b.zmk);b.zmt=0}if(!need&&b.zmk){S.remove(b.zmk);b.zmk=null}
  if(b.zmk){b.zmk.position.set(b.x,2.3,b.z);if(t0>b.zmt){b.zmt=t0+.4;zSet(b.zmk,'✚ '+b.nm+' '+Math.round(Math.hypot(P.x-b.x,P.z-b.z))+'m','#ff5a3a')}}}}
function zRevive(){endDeath();P.dead=0;P.hp=P.mhp*.6;P.sh=P.msh;gun.visible=true;rel=0;zq.down=zq.out=0;if(isHost||!netOn)for(const b of bots)if(b.zom&&b.al){const dx=b.x-P.x,dz=b.z-P.z,d=Math.hypot(dx,dz);if(d<7&&d>.01)mv(b,dx/d*(7-d),dz/d*(7-d),.45)}msg('Revived!',2);beep(660,.2,'triangle',.1)}
/* a downed or bled-out player returns at the start of the next round with a pistol (points are kept) */
function zRespawn(){const z=zq,ps=MAPS[sel.map].ps;endDeath();P.dead=0;z.down=z.out=0;z.perks={};z.cap=2;P.mhp=50;P.hp=50;P.sh=P.msh;wp=[zGunObj('CT')];cur=0;rel=0;setGun();P.x=ps[0];P.z=ps[1];P.y=0;gun.visible=true;msg('Back in the fight',2)}
/* network messages: types starting with z (longer than one letter) are routed here from onMsg */
function zNet(d){const z=zq;if(!z||mode!='Zombies')return;
 switch(d.t){
 case'zqh':if(isHost){const b=bots.find(x=>x.zom&&!x.zp&&x.i==d.i&&x.al);if(b)zDamage(b,d.d,d.h,d.id,d.k,d.m)}break;
 case'zqd':if(isHost)zOpenDoor(d.i,d.id);break;
 case'zqp':if(isHost)zProneGrant(d.k,d.id);break;
 case'zpg':if(!isHost){z.pb[d.k]=d.by;if(d.by==myId)zProneGift(d.k)}break;
 case'zqb':if(isHost&&zboxes[d.i]&&zboxes[d.i].st==0)zBoxStart(zboxes[d.i],d.i,d.id);break;
 case'zqe':if(isHost){const o=zboxes[d.i];if(o&&o.st==2&&o.by==d.id)zBoxEnd(o,d.i)}break;
 case'zqr':if(isHost){z.revBuys++;zRevCount(z.revBuys);netSend({t:'zrev',n:z.revBuys})}break;
 case'zqv':if(d.to==myId&&P.dead&&z.down)zRevive();break;
 case'zd':if(!isHost){if(d.by==myId&&zdoors[d.i])z.pts-=zdoors[d.i].d.c;zOpenDoor(d.i,d.by)}break;
 case'zbs':if(!isHost){const o=zboxes[d.i];if(!o)break;if(d.st==1){if(d.by==myId)z.pts-=950;o.st=1;o.t=0;o.cy=0;o.by=d.by}else if(d.st==2){o.item=d.item;o.st=2;o.t=0;o.by=d.by;o.beam.visible=o.lab.visible=true;zSet(o.lab,W[d.item].n,d.item=='RG'?'#ff4a4a':'#7bf08a')}else{o.st=0;o.beam.visible=o.lab.visible=false}}break;
 case'zdn':if(d.id!=myId){const nm=names[d.id]||'A teammate';popup('PLAYER DOWN',nm+' needs a revive!');feed(nm+' is down');beep(260,.25,'sawtooth',.1);setTimeout(()=>beep(200,.3,'sawtooth',.1),220)}break;
 case'zrev':if(!isHost)zRevCount(d.n);break;
 case'zk':if(!isHost&&d.to==myId){z.pts+=d.pts;kills++;wzkill(d.k);killXP(d.h);beep(900,.06,'square',.05)}break;
 case'zb':if(!isHost)zSync(d);break;
 case'zs':if(!isHost)zRoundSync(d);break}}
fixZM();ui();buildMap();
loadSet();
addEventListener('pagehide',saveSet);addEventListener('beforeunload',saveSet);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveSet()});
/* audio: resume the shared context whenever the tab comes back or the browser suspended it */
const audioKick=()=>{try{if(ac&&ac.state!='running')ac.resume().catch(()=>{})}catch(e){}};
document.addEventListener('visibilitychange',audioKick);addEventListener('focus',audioKick);addEventListener('pageshow',audioKick);for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,audioKick,true);setInterval(()=>{if(!document.hidden)audioKick()},700);
;
