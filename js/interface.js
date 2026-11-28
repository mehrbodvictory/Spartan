/* ######## interface.js ######## */
/* ===================== mastery.js ===================== */
/* ---------- Progression: levels 1-55, prestige 1-10, Prestige Master (to 1250), unlocks, weapon mastery, camos ---------- */
var UNL={TEA:38,AR:1,MG:1,SMG:8,BR:16,MP:24,SG:32,'Extended Mag':2,'Compensator':6,'Laser Sight':12,'Fast Hands':18,'Long Barrel':28,'Hollow Point':40,Frag:1,Impact:22,Marathon:4,Scavenger:14,Overshield:26,'Spring Legs':36,'Second Wind':44,'Hardline':50,'Run & Gun':10,'Semtex':18,'Quick Fix':16,VMP:20,RG:30,CY:34,CT:12,MVR:1,TRB:22,TUR:26,SW:21,LT:28,PD:38};
var CATS={Rifles:['AR','MVR','TRB','TUR','BR','VA','OH','SW','PD'],'Close Quarters':['SMG','SG','VMP','BP','KTS','RD','LT'],Sidearms:['CT','MG','MP','RG','HC','AN'],'Power Weapons':['RL','SN','TEA'],Support:['CY']};
var srcK='',prof=(()=>{try{const p=JSON.parse(localStorage.getItem('sd-prof'));if(p&&p.v==1)return p}catch(e){}return{v:1,lvl:1,xp:0,pres:0,master:0,ml:1,wk:{},camo:{}}})();
var save=()=>{try{localStorage.setItem('sd-prof',JSON.stringify(prof))}catch(e){}},need=()=>prof.master?1500:1500+prof.lvl*10,nm=k=>W[k]?W[k].n:(k.startsWith('sk:')&&typeof STK!='undefined'&&STK[k.slice(3)]?STK[k.slice(3)].n+' (streak)':k),tx={};
/* Prestige rules: going back to level 1 resets the unlocks (camos are never touched). What stays: items that were unlocked permanently with an unlock token (one earned per prestige),
   everything up to level 5 x your prestige number (automatic permanent unlocks), and at Prestige Master everything is permanently unlocked. */
var PAUTO=5;
function permHas(v){return !!(prof.master||(prof.pres>0&&UNL[v]<=PAUTO*prof.pres)||(prof.perm&&prof.perm.includes(v)))}
function unlocked(v){return !UNL[v]||prof.master||prof.all||prof.lvl>=UNL[v]||permHas(v)}
function tokenSpend(v){if(window.SD_MOD_SESSION)return false;if(!UNL[v]||unlocked(v)||!(prof.tok>0)||prof.master)return false;const label=v.startsWith('sk:')?(STK[v.slice(3)]?STK[v.slice(3)].n:v):(W[v]?W[v].n:v);if(!confirm(`Spend 1 unlock token to permanently unlock ${label}? It stays unlocked through every future prestige.`))return false;
 prof.perm=prof.perm||[];prof.perm.push(v);prof.tok--;save();showRank();try{ldRender()}catch(e){}return true}
function sanitize(){const u=unlocked;if(!u(L.p))L.p='AR';if(L.s&&!u(L.s))L.s='MG';if(L.g&&!u(L.g))L.g=null;L.pa=L.pa.filter(a=>u(a)&&attachmentFits(L.p,a));L.sa=L.sa.filter(a=>u(a)&&attachmentFits(L.s,a));L.pk=L.pk.filter(u);if(!L.s)L.sa=[]}
function rankTxt(){return prof.master?`Prestige Master ${prof.ml} / 1250 · ${prof.xp}/1500 XP`:`${prof.pres?'Prestige '+prof.pres+' · ':''}${prof.tok>0?prof.tok+(prof.tok>1?' unlock tokens · ':' unlock token · '):''}Level ${prof.lvl}${prof.lvl<55?` · ${prof.xp}/${need()} XP`:' (max) · ready to prestige'}`}
var mUps=[],won=0,mCost=1500;
function giveXP(g){if(window.SD_MOD_SESSION)return;if(prof.master){prof.xp+=g;while(prof.xp>=1500&&prof.ml<1250){prof.xp-=1500;prof.ml++}if(prof.ml>=1250)prof.xp=0}
 else if(prof.lvl<55){prof.xp+=g;while(prof.xp>=need()&&prof.lvl<55){prof.xp-=need();prof.lvl++;const u=[];for(const k in UNL)if(UNL[k]==prof.lvl&&!permHas(k))u.push(nm(k));mUps.push(...u)}if(prof.lvl>=55)prof.xp=0}save()}
function killXP(head){if(window.SD_MOD_SESSION)return 0;const x=Math.min(Math.round(mCost*(.06+(head?.03:0)+Math.min(streak,5)*.005)),Math.max(0,2.5*mCost-mxp));mxp+=x;giveXP(x);return x}
function bonusXP(f){if(window.SD_MOD_SESSION)return;const x=Math.min(Math.round(mCost*f),Math.max(0,3*mCost-mxp));mxp+=x;giveXP(x)}
function awardXP(){if(window.SD_MOD_SESSION)return '';let b=Math.min(Math.round(mCost*(.5+(won?.5:0))),Math.max(0,3*mCost-mxp));if(mxp+b<mCost)b=mCost-mxp;if(b>0){giveXP(b);mxp+=b}return `+${mxp} XP (${(mxp/mCost).toFixed(1)} levels) · ${rankTxt()}${mUps.length?'<br>Unlocked: '+mUps.join(', '):''}${prof.lvl>=55&&!prof.master?'<br>Open the menu to prestige!':''}`}
function doPrestige(){if(window.SD_MOD_SESSION)return;if(prof.master||prof.lvl<55)return;if(!confirm(prof.pres<10?`Prestige ${prof.pres+1}? You go back to level 1 and your unlocks reset. Camos are kept. You earn 1 permanent unlock token, and everything up to level ${PAUTO*(prof.pres+1)} is unlocked permanently.`:'Become Prestige Master? Everything is unlocked permanently and levels now go up to 1250.'))return;if(prof.pres<10){prof.pres++;prof.tok=(prof.tok|0)+1}else{prof.master=1;prof.ml=1}prof.lvl=1;prof.xp=0;save();showRank()}
function showRank(){$('#rank').textContent=rankTxt();homeStats();const b=$('#prest');b.style.display=!prof.master&&prof.lvl>=55?'inline-block':'none';b.textContent=prof.pres<10?'Prestige '+(prof.pres+1)+' · +1 unlock token':'Become Prestige Master · unlock everything';sanitize();ui()}
/* weapon mastery: level every 15 kills (max 20), then prestige the weapon (3 times) */
var wd=k=>prof.wk[k]||(prof.wk[k]={k:0,c:0,p:0,z:0}),wlv=k=>Math.min(20,1+Math.floor(wd(k).c/15)),catOf=k=>Object.keys(CATS).find(c=>CATS[c].includes(k));
const SEASON_WEAPONS=new Set(['SW','LT','PD']);
function masteryPool(pool,key){
 return pool.filter(weapon=>!SEASON_WEAPONS.has(weapon)||weapon===key);
}
function camos(k){const w=wd(k),kc=[['Sand','#c8b27a',25],['Moss','#4f7a45',75],['Cobalt','#3d6ad6',150],['Crimson','#c0392b',225],['Violet','#8e44ad',300],['Neon','#29f0a0',375]].map(([n,c,r])=>({n,c,ok:w.k>=r,rq:r+' kills'})),
 pc=[['Ember','#ff7a2a'],['Frost','#8ad8ff'],['Aurora','#7affc8']].map(([n,c],i)=>({n,c,ok:w.p>=i+1,rq:'weapon prestige '+(i+1),pr:1})),
 gold=kc.every(c=>c.ok)&&w.k>=500,dia=masteryPool(CATS[catOf(k)]||[k],k).every(x=>wd(x).k>=500),dm=masteryPool(Object.keys(W),k).every(x=>wd(x).k>=500);
 const base=[...kc,...pc,{n:'Gold',c:'#ffc83a',ok:gold,rq:'500 kills',anim:1},{n:'Diamond',c:'#bff4ff',ok:dia,rq:'Gold on every '+catOf(k)+' weapon',anim:1},{n:'Dark Matter',c:'#1a0a2a',ok:dm,rq:'Diamond on every weapon',anim:1}],
 gmOk=base.every(c=>c.ok)&&zcamos(k).every(c=>c.ok);
 return[...base,{n:'Grandmaster',c:'#ffd34a',ok:gmOk,rq:'every other camo on this weapon, Multiplayer and Zombies',anim:1,gm:1}].map(c=>({...c,ok:c.ok||!!prof.all}))}
/* zombies camo track: its own set of camos, earned with zombie kills (and best round). Both tracks can be equipped in either mode. */
function zcamos(k){const w=wd(k),z=w.z||0,zb=prof.zbest||0,
 kc=[['Rotted','#6b7a3a',25],['Bile','#9acd32',75],['Bone','#e3d8b8',150],['Blood','#8a1c1c',225],['Rust','#a5542a',300],['Toxic','#3cff7a',375]].map(([n,c,r])=>({n,c,ok:z>=r,rq:r+' zombie kills',s:'z'})),
 rc=[['Graveyard','#4a5a6a',10],['Wasteland','#b08a4a',15],['Hellscape','#c0301a',20]].map(([n,c,r])=>({n,c,ok:zb>=r,rq:'reach round '+r,s:'z'})),
 inf=kc.every(c=>c.ok)&&z>=500,nec=masteryPool(CATS[catOf(k)]||[k],k).every(x=>(wd(x).z||0)>=500),aby=masteryPool(Object.keys(W),k).every(x=>(wd(x).z||0)>=500);
 return[...kc,...rc,{n:'Inferno',c:'#ff6a1a',ok:inf,rq:'500 zombie kills',anim:1},{n:'Necrotic',c:'#3cff9a',ok:nec,rq:'500 zombie kills on every '+catOf(k)+' weapon',anim:1},{n:'Abyss',c:'#14061e',ok:aby,rq:'500 zombie kills on every weapon',anim:1}].map(c=>({...c,ok:c.ok||!!prof.all}))}
var allCamos=k=>[...camos(k),...zcamos(k)];
var okSet=()=>{const s=new Set();for(const k in W)for(const c of allCamos(k))if(c.ok)s.add(k+':'+c.n);return s};
function announceCamoUnlocks(previous){
 const unlocks=new Map();
 for(const entry of okSet()){
  if(previous.has(entry))continue;
  const [weapon,camo]=entry.split(':');
  if(!unlocks.has(camo))unlocks.set(camo,[]);
  unlocks.get(camo).push(weapon);
 }
 if(!unlocks.size)return;
 const detail=Array.from(unlocks,([camo,weapons])=>
  weapons.length===1?camo+' · '+nm(weapons[0]):
  weapons.length===Object.keys(W).length?camo+' · All weapons':
  camo+' · '+weapons.length+' weapons').join(' / ');
 popup(unlocks.size===1?'CAMO UNLOCKED':'CAMOS UNLOCKED',detail);
}
function wkill(k){if(window.SD_MOD_SESSION)return;if(!k||!W[k])return;const before=okSet(),w=wd(k);w.k++;w.c++;save();announceCamoUnlocks(before)}
function wzkill(k){if(window.SD_MOD_SESSION)return;if(!k||!W[k])return;const before=okSet(),w=wd(k);w.z=(w.z||0)+1;save();announceCamoUnlocks(before)}
function zRoundDone(r){if(window.SD_MOD_SESSION)return;if(r<=(prof.zbest||0))return;const before=okSet();prof.zbest=r;save();announceCamoUnlocks(before)}
function wpres(k){if(window.SD_MOD_SESSION)return;const w=wd(k);if(wlv(k)<20||w.p>=3)return;const before=okSet();w.p++;w.c=0;prof.camo[k]=['Ember','Frost','Aurora'][w.p-1];save();announceCamoUnlocks(before)}
function camoTex(col,st){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=col;g.fillRect(0,0,64,64);
 if(st=='z'){for(let k=0;k<10;k++){g.fillStyle=`rgba(0,0,0,${.18+Math.random()*.2})`;g.beginPath();g.arc(Math.random()*64,Math.random()*64,3+Math.random()*9,0,7);g.fill()}for(let k=0;k<7;k++){const x=Math.random()*64;g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x,Math.random()*30,1+Math.random()*2,10+Math.random()*30)}}
 else for(let k=0;k<16;k++){g.fillStyle=`rgba(${k%2?'0,0,0':'255,255,255'},.22)`;g.beginPath();g.ellipse(Math.random()*64,Math.random()*64,5+Math.random()*10,3+Math.random()*7,Math.random()*3,0,7);g.fill()}return new THREE.CanvasTexture(c)}
/* the final three camos of each track are live shaders: Gold (molten gold), Diamond (prismatic ice), Dark Matter (swirling nebula),
   Inferno (flames and lava cracks), Necrotic (toxic plasma arcs), Abyss (a void with glowing rifts). All are driven by one time uniform. */
var ANIM={Gold:0,Diamond:1,'Dark Matter':2,Inferno:3,Necrotic:4,Abyss:5,Grandmaster:6},rfm={};
var CAMO_VS=`varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=-mv.xyz;vP=(modelMatrix*vec4(position,1.0)).xyz-(modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;gl_Position=projectionMatrix*mv;}`;
var CAMO_FS=`uniform float t;uniform float k;varying vec3 vN;varying vec3 vV;varying vec3 vP;
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
  float sp=0.0;
  col=mix(vec3(0.55,0.32,0.05),vec3(1.0,0.78,0.22),n)*nl;
  col+=vec3(1.0,0.9,0.5)*(vein*0.55+band*0.7)+vec3(1.0)*sp*1.5+vec3(1.0,0.75,0.2)*fr*0.6;
 }else if(k<1.5){
  float n=fbm(p*0.9+vec3(t*0.1,t*0.07,0.0));
  float ch=noise(p*1.3);
  float facet=0.5+0.5*sin(ch*6.28+t*1.6);
  vec3 rb=hsv(fract(n*1.3+p.x*0.25+p.y*0.2+t*0.12),0.55,1.0);
  col=mix(vec3(0.62,0.86,1.0),rb,0.55)*(0.55+0.45*facet)*nl;
  float sp=0.0;
  float glint=smoothstep(0.9,1.0,sin((p.x-p.y)*3.0+t*2.0+ch*4.0));
  col+=vec3(1.0)*(sp*1.6+glint*0.6)+vec3(0.6,0.9,1.0)*fr*0.8;
 }else if(k<2.5){
  vec3 q=p*0.9;
  float sw=fbm(q+vec3(cos(t*0.2),sin(t*0.17),t*0.12));
  float sw2=fbm(q*1.8+sw*2.0-vec3(0.0,t*0.25,0.0));
  col=mix(vec3(0.02,0.0,0.06),vec3(0.38,0.08,0.75),pow(sw2,1.6));
  col=mix(col,vec3(0.0,0.9,1.0),pow(sw,5.0)*0.55);
  float arc=pow(max(0.0,sin(sw2*18.0-t*3.0)),14.0);col+=vec3(0.8,0.3,1.0)*arc*0.5;
  float hs=0.0;float st=0.0;
  col*=0.7+0.3*nl;col+=vec3(0.5,0.1,0.9)*fr*0.9;
 }else if(k<3.5){
  float f=fbm(vec3(p.x*1.4,p.y*1.4-t*1.1,p.z*1.4+t*0.25));
  float f2=fbm(vec3(p.x*2.8,p.y*2.8-t*1.9,p.z*2.8));
  float h=clamp(f*1.2+f2*0.5-0.2,0.0,1.0);
  col=mix(vec3(0.03,0.01,0.01),vec3(0.8,0.1,0.02),smoothstep(0.1,0.5,h));
  col=mix(col,vec3(1.0,0.6,0.1),smoothstep(0.45,0.8,h));
  col=mix(col,vec3(1.0,0.95,0.6),smoothstep(0.8,1.0,h));
  float crack=pow(1.0-abs(noise(p*1.7+vec3(0.0,t*0.2,0.0))*2.0-1.0),8.0);col+=vec3(1.0,0.4,0.05)*crack*0.8;
  float em=0.0;
  col*=0.65+0.35*nl;col+=vec3(1.0,0.35,0.05)*fr*0.7;
 }else if(k<4.5){
  float pl=sin(p.x*3.0+t*1.4)+sin(p.y*3.2-t*1.1)+sin((p.x+p.z)*2.4+t*0.8)+sin(length(p.xy+vec2(sin(t*0.4),cos(t*0.3)))*4.0-t*2.0);
  float n=fbm(p*1.2+vec3(0.0,0.0,t*0.3));
  col=mix(vec3(0.0,0.06,0.03),vec3(0.1,0.7,0.35),n);
  float arc=pow(1.0-abs(sin(pl*1.6+n*4.0)),10.0);col+=vec3(0.6,1.0,0.8)*arc*0.9;
  float bub=0.0;
  col*=0.6+0.4*nl;col+=vec3(0.2,1.0,0.5)*fr*0.9;
 }else if(k<5.5){
  float a=fbm(p*0.8+vec3(t*0.05,0.0,t*0.04));
  float rift=abs(fbm(p*1.1+a*2.0+vec3(0.0,t*0.2,0.0))-0.5);
  col=vec3(0.01,0.01,0.03)+vec3(0.02,0.04,0.12)*a;
  float glow=0.012/(rift+0.02);col+=vec3(1.0,0.12,0.08)*glow*0.35+vec3(1.0,0.8,0.6)*pow(glow,2.0)*0.02;
  float pulse=0.5+0.5*sin(t*1.5+a*6.0);col+=vec3(0.5,0.0,0.1)*pulse*pow(a,3.0)*0.6;
  float st=0.0;
  col*=0.7+0.3*nl;col+=vec3(0.9,0.1,0.15)*fr*0.8;
 }else{
  /* GRANDMASTER: obsidian glass under a living opal, molten-gold veins that pulse along the weapon, a cyan crack layer, twinkling stars, a foil sweep and a breathing crown of light on the rim */
  vec3 q=p*0.8;
  float w1=fbm(q+vec3(t*0.07,-t*0.05,t*0.04));
  float w2=fbm(q*1.7+vec3(w1*2.4,w1*2.4,w1*2.4)+vec3(0.0,t*0.16,0.0));
  float opl=dot(N,V)*1.2+w1*1.6+p.y*0.08+t*0.1;
  vec3 opal=hsv(fract(opl),0.65,1.0);
  col=vec3(0.015,0.012,0.03)+opal*0.16*pow(w2,1.3)+vec3(0.35,0.08,0.55)*pow(w1,3.0)*0.55;
  float ridge=1.0-abs(noise(q*2.1+vec3(0.0,t*0.12,0.0))*2.0-1.0);
  float vein=pow(ridge,14.0);
  float flow=0.5+0.5*sin(p.x*1.6+p.z*1.2-t*3.0+w1*5.0);
  col+=mix(vec3(1.0,0.55,0.08),vec3(1.0,0.92,0.55),flow)*vein*(0.9+1.4*flow);
  float ridge2=1.0-abs(noise(q*4.3-vec3(t*0.09,0.0,t*0.07))*2.0-1.0);
  col+=vec3(0.15,0.9,1.0)*pow(ridge2,22.0)*0.55;
  vec3 cell=floor(p*9.0);
  float hh=fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);
  vec3 f3=fract(p*9.0)-vec3(0.5);
  float star=(1.0-smoothstep(0.0,0.17,length(f3)))*step(0.86,hh);
  float tw=0.5+0.5*sin(t*(2.0+hh*5.0)+hh*40.0);
  col+=vec3(1.0,0.95,0.85)*star*tw*2.2;
  float sw=0.5+0.5*sin((p.x+p.y*0.6-p.z*0.5)*1.4-t*1.5);
  col+=hsv(fract(p.x*0.3+t*0.2),0.5,1.0)*pow(sw,26.0)*0.85;
  float br=0.5+0.5*sin(t*1.7);
  col*=0.72+0.28*nl;
  col+=mix(vec3(1.0,0.72,0.2),hsv(fract(t*0.15+fr*0.5),0.6,1.0),0.5)*fr*(1.0+0.6*br);
 }
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
function rfMat(n){return rfm[n]||(rfm[n]=new THREE.ShaderMaterial({uniforms:{t:{value:0},k:{value:ANIM[n]}},vertexShader:CAMO_VS,fragmentShader:CAMO_FS}))}
function applyCamo(k){
 const pap=zPapCamo(k);
 if(pap)return pap;
 const name=myCamo(k);
 return camoRm(k,name);
}
/* material for a weapon held by another player: their camo by name, shown even if this player has not unlocked it */
var crm={};function camoRm(k,n){if(!n)return;if(typeof n==='string'&&n.startsWith('pass/'))return passCamoMaterial(k,n);const c=allCamos(k).find(x=>x.n==n);if(!c)return;if(c.anim)return rfMat(c.n);return crm[c.n]||(crm[c.n]=new THREE.MeshLambertMaterial({map:tx[c.n]||(tx[c.n]=camoTex(c.c,c.s)),color:0xffffff}))}
function myCamo(k){const season=passFinish(k);if(season)return season;const n=prof.camo[k];return n&&allCamos(k).some(x=>x.n==n&&x.ok)?n:''}
function camoFx(){for(const n in rfm)rfm[n].uniforms.t.value=performance.now()/1000}
$('#prest').onclick=doPrestige;showRank();

/* ===================== deathcam.js ===================== */
/* ---------- third-person death camera with ragdoll body ---------- */
let deathActor=null,camA=0;
var lastDir=V(0,0,0);
function startDeath(){
 const impact=lastDir.clone();endDeath();camA=yaw;
 const m=new THREE.Group(),rig=mkHuman(m,{operator:passOperator()});
 m.position.set(P.x,P.y,P.z);m.rotation.y=yaw+Math.PI;S.add(m);
 deathActor={m,rig};
 const direction=impact.lengthSq()>.00001?impact:V(Math.sin(yaw),0,Math.cos(yaw));
 ragStart(deathActor,direction.x,direction.z,2.75);
}
function endDeath(){
 if(deathActor)S.remove(deathActor.m);
 deathActor=null;gun.visible=true;lastDir.set(0,0,0);
}
function deathCam(dt){
 gun.visible=false;
 if(!deathActor)return;
 ragTick(deathActor,dt);
 const t=deathActor.m.position;
 camA+=dt*.5;C.position.set(t.x+Math.sin(camA)*4.5,t.y+2.4,t.z+Math.cos(camA)*4.5);C.lookAt(t.x,t.y+.4,t.z);
}

/* ===================== net.js ===================== */
/* Private rooms use encrypted WebRTC data channels with direct ICE. */
var hostPid='',hostBye=0,rcTry=0,rcTimer=0;var grace=Object.create(null);
var net=null,myId='',myName='',conns=[],isHost=0,netOn=0,scores={},names=Object.create(null),lastAtk='',nacc=0,bacc=0,oacc=0,soloMode=null,maxP=0;
const peerLooks=new Map();
let partyActive=false,partyCode='',partyReady=false,roomOpening=0,roomAuth=null;
const pendingRoomLinks=new Set();
let lastAttackHead=false;
let roomLocked=false,roomTicket='',roomRound=0,latestRoomRound=0,roomSequence=0;
const roomTickets=new Map(),roomReceived=new Map(),recentDamage=new Map();
const roomControlPackets=new Set(['hi','bye','identity','roster','admitted','removed','full','room-policy','room-denied',
 'start','party-queue','party-sw','party-sw-launch']);
function syncRoomLockControls(){
 for(const button of document.querySelectorAll('[data-room-lock]')){
  button.hidden=!(isHost&&net?.open&&!window.SD_SPLIT);
  button.textContent=roomLocked?'Unlock room':'Lock room';
  button.setAttribute('aria-pressed',String(roomLocked));
 }
}
function toggleRoomLock(){
 if(!isHost||!net?.open||window.SD_SPLIT)return;
 roomLocked=!roomLocked;
 netSend({t:'room-policy',locked:roomLocked});
 lobby(roomLocked?'Room locked to new players.':'Room open to players with the code.');
 syncRoomLockControls();
}
for(const button of document.querySelectorAll('[data-room-lock]'))button.onclick=toggleRoomLock;
function setRoomRound(round){
 roomRound=round;roomSequence=0;roomReceived.clear();recentDamage.clear();hitRate=Object.create(null);
 for(const link of conns){
  link.markAfter=0;
  if(link.vt)Object.assign(link.vt,{last:null,dmg:[],zd:[],nk:0,deadAt:null});
 }
}
function gamePacket(data){
 if(roomControlPackets.has(data.t))return data;
 if(!roomRound)return null;
 return {...data,round:roomRound,sequence:++roomSequence};
}
function acceptRoomPacket(data,link){
 if(roomControlPackets.has(data.t))return true;
 if(!netOn||!roomRound||data.round!==roomRound||!Number.isSafeInteger(data.sequence)||
    data.sequence<=(roomReceived.get(link.peer)||0))return false;
 roomReceived.set(link.peer,data.sequence);return true;
}
var lobby=t=>{
 $('#lb').textContent=t;
 if(partyActive)partyStatus(t);
};
function lobbyList(){$('#plist').innerHTML=Object.entries(names).map(([id,nm])=>{
 const row={nm,look:app==='mp'?(id===myId?idrLocal():peerLooks.get(id)):null};
 return `<li>${idrBoardName(row,id===myId?' (you)':'')}</li>`;
 }).join('');
 for(const [index,id] of Object.keys(names).entries())appendPeerRemoval($('#plist').children[index],id);
 updateMatchModeration();syncRoomLockControls();
 $('#leave').style.display=net?'inline-block':'none';lobbyStageRender();if(partyReady)partyStatus()}
var removedPeers=new Set();
function appendPeerRemoval(row,id){
 if(!row||!isHost||id===myId||window.SD_SPLIT||!conns.some(c=>c.peer===id&&c.open&&!c.blocked))return;
 const button=document.createElement('button');
 button.type='button';button.className='btn alt sm';button.textContent='Remove';
 button.setAttribute('aria-label','Remove '+names[id]);
 button.onclick=()=>removeRoomPeer(id);
 row.classList.add('peer-controls');row.append(button);
}
function removeRoomPeer(id){
 if(!isHost||id===myId||window.SD_SPLIT)return;
 const link=conns.find(c=>c.peer===id&&c.open&&!c.blocked);
 if(link)bhKick(link,'removed by the host');
}
function updateMatchModeration(){
 const list=$('#match-moderation');
 if(!list)return;
 list.replaceChildren();
 if(netOn)for(const id of Object.keys(names)){
  const row=document.createElement('li');row.textContent=names[id];
  appendPeerRemoval(row,id);
  if(row.children.length)list.append(row);
 }
 list.hidden=!list.children.length;
}
function broadcastRoster(){
 const looks=Object.fromEntries([[myId,idrLocal()],...peerLooks]);
 netSend({t:'roster',r:{...names},looks});
}
const targetedPackets=new Set(['hit','skh','zk','zqv','zmainhit','zmainnote']);
const packetTarget=data=>targetedPackets.has(data.t)&&typeof data.to==='string'?data.to:null;
function sendRoomPacket(packet,except){
 const target=isHost?packetTarget(packet):null,frame=encodePeerPacket(packet);
 if(frame===null)return;
 for(const link of conns)if(link!==except&&link.vf&&link.open&&!link.blocked&&(!target||link.peer===target))link.send(frame);
}
function rememberDamage(packet){
 if(packet.t!=='hit'||!hasOwn(names,packet.to)||!Number.isFinite(packet.d)||packet.d<=0)return;
 const attacker=Number.isSafeInteger(packet.bot)?'b'+packet.bot:packet.id;
 const sources=recentDamage.get(packet.to)||new Map();
 sources.set(attacker,{head:packet.head===true,at:performance.now()});
 recentDamage.set(packet.to,sources);
}
function netSend(m){
 const packet=gamePacket({...m,id:myId});
 if(!packet)return;
 if(isHost)rememberDamage(packet);
 sendRoomPacket(packet);
}
function sendMatchPacket(link,data){const packet=gamePacket({...data,id:myId});if(packet)sendPeerPacket(link,packet)}
function fwd(d,from){const packet=gamePacket(d);if(packet)sendRoomPacket(packet,from)}
function netClose(){
 roomOpening++;roomAuth=null;
 for(const link of pendingRoomLinks)try{link.close()}catch{}
 pendingRoomLinks.clear();
 if(partyActive)partyClosed();
 removedPeers.clear();
 roomLocked=false;roomTicket='';roomTickets.clear();latestRoomRound=0;setRoomRound(0);
 partyActive=false;partyCode='';
 clearTimeout(rcTimer);rcTry=0;for(const k in grace){clearTimeout(grace[k]);delete grace[k]}for(const c of conns)try{if(c.open)sendPeerPacket(c,{t:'bye',id:myId})}catch(e){}for(const c of conns)try{c.close()}catch(e){}conns=[];if(net)try{net.destroy()}catch(e){}net=null;netOn=0;syncBackgroundMatch();isHost=0;names=Object.create(null);peerLooks.clear();scores={};document.body.classList.remove('net');$('#hostbox').style.display='none';lobbyList();if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}}
/* a match ended: everybody stays connected and returns to the same lobby; only leaving the lobby disconnects */
function netEnd(){netOn=0;syncBackgroundMatch();setRoomRound(0);scores={};document.body.classList.remove('net');if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}lobbyList();lobby(partyActive?(isHost?'Party ready for another match.':'Waiting for the leader to deploy.'):isHost?'Match over. Everyone is still here. Pick a mode and map, then press Start match.':'Match over. Waiting for the host to start the next one…')}
async function roomAddress(code,party,opening){
 if(window.SD_SPLIT)return 'sdrill-'+code;
 await gameRelayReady;
 const auth=await inviteIdentity(party?'party':'match',code);
 if(opening!==roomOpening)return '';
 roomAuth=auth;return auth.id;
}
async function hostMatch(localCode,wantsParty=false){
 if(window.SD_ENGINE_MOD){lobby('Stock online rooms are unavailable in an engine mod.');return}
 if(window.SD_MOD_SESSION)return;
 netClose();partyActive=wantsParty===true;maxP=partyActive||app==='zm'?4:12;
 myName=onlineName($('#nm').value,'Host');
 const opening=roomOpening,code=window.SD_SPLIT?localCode:makeInviteCode(wantsParty?partyInviteLength:inviteLength);
 lobby('Connecting…');
 let peer;
 try{
  const address=await roomAddress(code,partyActive,opening);
  if(opening!==roomOpening)return;
  peer=net=window.SD_SPLIT?new SplitPeer(address):createDataPeer(address);
 }catch(error){if(opening===roomOpening){netClose();if(wantsParty)partyStatus(error.message);else lobby(error.message)}return}
 if(partyActive)partyCode=code;
 const signalingTimer=window.SD_SPLIT?0:setTimeout(()=>{
  if(net===peer&&!peer.open)failInitialJoin(peer,'Could not register with matchmaking. Try creating the room again.');
 },15000);
 peer.on('disconnected',()=>{if(net===peer)try{peer.reconnect()}catch{}});
 peer.on('open',id=>{
  clearTimeout(signalingTimer);
  if(net!==peer)return;
  myId=id;isHost=1;names[id]=myName;$('#code').textContent=code;$('#hostbox').style.display='block';
  lobby(partyActive?'Share this code. The leader controls deployment.':'Share this code. Press Start when everyone has joined.');lobbyList();
 });
 peer.on('connection',link=>{
  if(net===peer&&isHost&&pendingRoomLinks.size<8)reg(link);else link.close();
 });
 peer.on('error',error=>{
  if(net!==peer)return;
  const line=error.type==='unavailable-id'?'That room ID is in use. Create a new room.':'Network error: '+error.type;
  if(!isHost&&!window.SD_SPLIT){clearTimeout(signalingTimer);failInitialJoin(peer,line)}else lobby(line);
 });
}
async function joinMatch(value,wantsParty=false){
 if(window.SD_ENGINE_MOD){lobby('Stock online rooms are unavailable in an engine mod.');return}
 if(window.SD_MOD_SESSION)return;
 const raw=typeof value==='string'?value:$('#jc').value;
 const code=window.SD_SPLIT?raw.trim().toUpperCase():readInviteCode(raw,wantsParty?partyInviteLength:inviteLength);
 if(!code){
  const line=wantsParty?'Enter the six-character party code.':'Enter the 12-character match code.';
  if(wantsParty)partyStatus(line);else lobby(line);
  return;
 }
 netClose();partyActive=wantsParty===true;if(partyActive)partyCode=code;
 myName=onlineName($('#nm').value,'Guest');hostBye=0;rcTry=0;
 const opening=roomOpening;lobby('Connecting…');
 let peer;
 try{
  const address=await roomAddress(code,partyActive,opening);
  if(opening!==roomOpening)return;
  hostPid=address;peer=net=window.SD_SPLIT?new SplitPeer():createDataPeer();
 }catch(error){if(opening===roomOpening){netClose();if(wantsParty)partyStatus(error.message);else lobby(error.message)}return}
 const signalingTimer=setTimeout(()=>{
  if(net===peer&&!peer.open)failInitialJoin(peer,'Could not connect to the matchmaking service. Try joining again.');
 },15000);
 peer.on('disconnected',()=>{if(net===peer)try{peer.reconnect()}catch{}});
 peer.on('open',id=>{
  clearTimeout(signalingTimer);
  if(net!==peer||myId===id&&hasOwn(names,id))return;
  myId=id;names[id]=myName;
  if(window.SD_SPLIT){reg(connectDataPeer(peer,hostPid));return}
  connectRoomPeer(peer,hostPid,reg,link=>{
   clearTimeout(link.verifyTimer);pendingRoomLinks.delete(link);
   lobby('Retrying the connection…');
  },
   ()=>failInitialJoin(peer,'The connection timed out before invite verification started.'));
 });
 peer.on('error',error=>{
  if(net!==peer)return;
  const line=error.type==='peer-unavailable'?'No '+(partyActive?'party':'match')+' found with that code.':'Network error: '+error.type;
  if(!netOn&&!conns.some(link=>link.open)&&!window.SD_SPLIT){clearTimeout(signalingTimer);failInitialJoin(peer,line)}else lobby(line);
 });
}
function failInitialJoin(owner,reason){
 if(net!==owner)return;
 const wasParty=partyActive;
 netClose();lobby(reason);if(wasParty)partyStatus(reason);
}
/* Verify the invitation, transport and compatible game build before admitting a link. */
var BHK={ver:typeof __BUILD!='undefined'?__BUILD:'raw',mode:typeof __MODE!='undefined'?__MODE:'raw'};
var bhFns=()=>[hurt,takeDmg,shoot,eff,hitBot,boom,die,respawn,startGame,featKill,giveXP,wkill,addBot,onMsg,zDamage,zHit,mkHuman,useStreak,skAward];
async function bhSha(s){try{if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}
 let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(h2>>>0).toString(16)+(h1>>>0).toString(16)}
// The HTTPS loader hashes the exact scripts it executes. Use that digest
// for compatibility across browsers and keep the raw development check.
function bhProof(n){
 const fields=[n,BHK.ver,BHK.mode];
 if(BHK.mode==='raw')fields.push(...bhFns().map(f=>Function.prototype.toString.call(f)));
 return bhSha(fields.join('\u0001'));
}
var bhNonce=()=>{try{const a=new Uint32Array(4);crypto.getRandomValues(a);return[...a].join('-')}catch(e){return Math.random()+'-'+Date.now()}};
const resumeProof=(ticket,nonce)=>ticket?bhSha('rejoin\u0001'+nonce+'\u0001'+ticket):Promise.resolve('');
const roomVerificationErrors=Object.freeze({
 build:'Game versions differ. Reload the game on both devices.',
 proof:'The connection opened, but the game build proof did not match.',
 invite:'The connection opened, but the secure invite proof did not match.',
 binding:'The connection opened, but the browser could not verify its secure channel.',
 protocol:'The connection opened, but the room verification message was invalid.',
 detail:'The connection opened, but room verification could not finish.'
});
function bhReject(cn,reason){
 const message=roomVerificationErrors[reason];
 cn.blocked=true;cn.joinFailure=message;
 console.info('[net] Room verification failed: '+reason);
 try{sendPeerPacket(cn,{t:'bhx',reason,w:message})}catch{}
 if(!isHost)lobby(message);
 setTimeout(()=>{try{cn.close()}catch{}},350);
}
function bhStart(cn){
 cn.channelOpened=true;
 console.info('[net] Data channel opened; verifying room');
 cn.vf=0;cn.sent=0;cn.theirs=0;cn.mn=bhNonce();
 const auth=cn.auth;
 cn.authBinding=auth?privateChannelBinding(cn):'';
 if(auth&&!cn.authBinding)return bhReject(cn,'binding');
 sendPeerPacket(cn,{t:'bh1',v:BHK.ver,m:BHK.mode,n:cn.mn});
}
function bhMsg(d,cn){
 if(d.t==='bhx'){
  if(!isHost){
   cn.joinFailure=hasOwn(roomVerificationErrors,d.reason)?roomVerificationErrors[d.reason]:roomVerificationErrors.detail;
   lobby(cn.joinFailure);
  }
  return;
 }
 const role=isHost?'host':'guest',otherRole=isHost?'guest':'host',auth=cn.auth;
 if(d.t==='bh1'){
  if(cn.challenge)return;cn.challenge=true;
  if(d.v!==BHK.ver||d.m!==BHK.mode){bhReject(cn,'build');return}
  if(typeof d.n!=='string'||!d.n||d.n.length>64){bhReject(cn,'protocol');return}
  const challenge=d.n+'\n'+cn.authBinding;
  Promise.all([bhProof(d.n),resumeProof(isHost?'':roomTicket,d.n),auth?auth.proof(role,challenge):'']).then(([p,resume,invitation])=>{
   if(cn.blocked||!cn.open)return;
   sendPeerPacket(cn,{t:'bh2',p,resume,invitation});cn.sent=1;bhDone(cn);
  }).catch(()=>bhReject(cn,'detail'));
  return;
 }
 if(d.t==='bh2'&&!cn.answer){
  cn.answer=true;
  const ticket=isHost?roomTickets.get(cn.peer):null;
  const challenge=cn.mn+'\n'+cn.authBinding;
  Promise.all([bhProof(cn.mn),resumeProof(ticket,cn.mn),auth?auth.verify(otherRole,challenge,d.invitation):true]).then(([p,resume,verified])=>{
   if(cn.blocked||!cn.open)return;
   if(d.p===p&&verified){
    cn.reclaimed=ticket&&d.resume===resume?ticket:null;
    cn.theirs=1;bhDone(cn);
   }else bhReject(cn,d.p!==p?'proof':'invite');
  }).catch(()=>bhReject(cn,'detail'));
 }
}
function bhDone(cn){
 if(cn.blocked||!cn.open||cn.vf||!(cn.sent&&cn.theirs))return;
 const pending=cn.pq||[];cn.pq=null;cn.vf=1;
 console.info('[net] Room verification passed');
 clearTimeout(cn.verifyTimer);pendingRoomLinks.delete(cn);
 if(!regOpen(cn))return;
 for(const message of pending)acceptGamePacket(message,cn);
}
/* ---------- the host vets everything a guest sends before it acts on it or relays it ---------- */
const guestPacketTypes=new Set(['s','hit','bh','dead','sh','chat','mark','sko','skh','skx','nuke','oi','bye','hi','identity',
 'zqb','zqd','zqe','zqh','zqp','zqw','zqr','zqv','zdn','zmainuse','zjp','zkfieldreq','zkpr','party-sw','party-bench','vox-shots','vox-blast']);
const guestRelayTypes=new Set(['s','hit','dead','sh','sko','skh','skx','nuke','oi','zqv','zdn']);
const hostPacketTypes=new Set([...guestPacketTypes,'roster','start','admitted','removed','full','room-policy','room-denied',
 'b','bsh','o','ob','f','z','kd','kg','feed','pop','end','party-queue','party-return','party-sw-launch','vox-update',
 'zs','zb','zbt','zbs','zbl','zd','zg','zpg','zpu','zpc','zk','zrev','zmainhit','zmainnote','zmaincue','zmainwin','zjkit','zjwin','zkfield','zkp']);
const netInteger=(value,max=100000)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
const netPlayerId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value)&&
 value!=='prototype'&&!hasOwn(Object.prototype,value);
const netScore=value=>netInteger(value)?value:0;
const netTeam=value=>value==='A'||value==='B'?value:'';
const netTeamScores=value=>({A:netScore(value?.A),B:netScore(value?.B)});
function teamCanHit(from,to){
 return netPlayerId(to)&&to!==from&&hasOwn(names,to)&&(!teamMode()||mpTeams[from]!==mpTeams[to]);
}
function validNetPose(data){
 return [data.x,data.y,data.z,data.yaw,data.pi].every(Number.isFinite)&&Math.abs(data.x)<1500&&Math.abs(data.z)<1500&&
  data.y>=-8&&data.y<=80&&Math.abs(data.yaw)<15000&&Math.abs(data.pi)<=1.6&&
  (data.al===0||data.al===1)&&netInteger(data.st,4)&&netInteger(data.aj,1)&&
  typeof data.w==='string'&&hasOwn(W,data.w)&&typeof data.cm==='string'&&data.cm.length<=100&&
  Array.isArray(data.at)&&data.at.length<=10&&data.at.every(name=>typeof name==='string'&&name.length<=50);
}
function vettedMatchBoard(rows){
 if(!Array.isArray(rows))return [];
 return rows.slice(0,32).flatMap(row=>{
  if(!Array.isArray(row)||!netPlayerId(row[0]))return [];
  const [id,name,kills,deaths,team,operator]=row;
  return [[id,onlineName(name),netScore(kills),deaths==null?null:netScore(deaths),netTeam(team),operatorId(operator)]];
 });
}
function bhKick(cn,why){
 if(cn.blocked)return;
 cn.blocked=true;cn.bye=true;removedPeers.add(cn.peer);
 const name=names[cn.peer]||'A player';
 conns=conns.filter(c=>c!==cn);
 if(grace[cn.peer]){clearTimeout(grace[cn.peer]);delete grace[cn.peer]}
 if(cn.vf)dropPeer(cn.peer);
 if(cn.vf)lobby(name+' was removed.');
 try{sendPeerPacket(cn,{t:'removed',w:'Removed from the room ('+why+').'})}catch{}
 setTimeout(()=>cn.close(),300);
}
function hostVet(d,cn){if(!guestPacketTypes.has(d.t))return false;const t=d.t,n=performance.now(),v=cn.vt||(cn.vt={w:n,c:0,dmg:[],last:null,nk:0,sko:[],bad:0,zd:[],chat:[],bt:n}),bad=()=>{if(n-v.bt>15000){v.bad=Math.max(0,v.bad-Math.floor((n-v.bt)/15000));v.bt=n}if(++v.bad>=10)bhKick(cn,'sending impossible game data');return false};
 if(n-v.w>1000){v.w=n;v.c=0}if(++v.c>150){if(v.c>700)bhKick(cn,'flooding the match');return false}
 if(d.id!==cn.peer||t==='dead'&&d.v!==cn.peer||t==='oi'&&d.out!==cn.peer)return bad();
 if(!['hi','bye','identity'].includes(t)&&!hasOwn(names,cn.peer))return false;
 if(t[0]==='z'&&mode!=='Zombies')return false;
 if(t.startsWith('party-')&&(!partyActive||d.id!==cn.peer))return false;
 if(t==='hit'||t==='bh'){
  const target=t==='bh'?bots.find(b=>!b.net&&b.i===d.i&&b.al):null;
  if(!run||over||mode==='Zombies'||v.deadAt!=null||!Number.isFinite(d.d)||d.d<=0||d.d>300||
     t==='hit'&&(d.bot!=null||!teamCanHit(cn.peer,d.to))||
     t==='bh'&&(!target||teamMode()&&mpTeams[cn.peer]===target.team))return false;
  v.dmg=v.dmg.filter(entry=>n-entry[0]<1000);v.dmg.push([n,d.d]);
  if(v.dmg.reduce((sum,entry)=>sum+entry[1],0)>760)return bad();
  if(t==='hit')rememberDamage(d);
 }else if(t==='dead'){
  if(!run||over||v.deadAt!=null)return false;
  v.deadAt=n;
  const recent=recentDamage.get(cn.peer)?.get(d.by);
  recentDamage.delete(cn.peer);
  const attributed=mode!=='Zombies'&&recent&&n-recent.at<12000;
  if(!attributed)d.by='';
  d.head=Boolean(attributed&&recent.head);
 }
 else if(t=='zqh'){
  const dm=d.d,Wk=typeof d.k==='string'&&hasOwn(W,d.k)?W[d.k]:null,meleeCap=sel.map==='Hollow Estate'?24000:16000;
  const cap=d.m?meleeCap:Wk?Math.max(Wk.d||0,Wk.ex?Wk.ex.d||0:0)*3*9*2*1.6:0;
  if(!Number.isFinite(dm)||dm<0||(!d.m&&!Wk)||dm>cap)return bad();
  if(d.k==='KEY'&&(sel.map!==JUPITER_MAP||!zq?.jupiter?.owners.has(d.id)||dm>4200))return false;
  if(d.k==='ULT'&&(!zq?.jupiter?.quest?.armed.has(d.id)||dm>1800))return false;
  v.zd=v.zd.filter(x=>n-x[0]<1000);v.zd.push([n,dm]);
  const hitLimit=sel.map==='London'||d.k==='ULT'?90:45;
  if(v.zd.length>hitLimit||v.zd.reduce((a,x)=>a+x[1],0)>60000)return bad();
 }
 else if(t=='s'){
  if(!validNetPose(d))return bad();
  d.ji=sel.map===JUPITER_MAP&&d.ji===1&&t0<15?1:0;
  const x=+d.x,z=+d.z,q=mode==='Zombies'?zq?.main:null;
  const inArena=!!q&&zQuestInArena(x,z),previousArena=!!q&&v.last&&zQuestInArena(v.last.x,v.last.z);
  const credited=!!q?.credit.includes(cn.peer);
  if(!Number.isFinite(x+z+(+d.y))||+d.y<-8||+d.y>80)return bad();
  if(inArena?(!credited||!q.fight):(Math.abs(x)>H+8||Math.abs(z)>H+8))return bad();
  const portal=credited&&v.last&&(inArena&&q.fight&&!previousArena||
   previousArena&&!q.fight&&!inArena&&Math.hypot(x-q.entry.x,z-q.entry.z)<8);
  if(v.deadAt!=null&&d.al===1){
   if(n-v.deadAt<450)return false;
   v.deadAt=null;v.last=null;recentDamage.delete(cn.peer);
  }
  if(!portal&&v.last){const dt=(n-v.last.n)/1000;if(dt>.01&&dt<1.5&&Math.hypot(x-v.last.x,z-v.last.z)/dt>38){v.last.n=n;return bad()}}
  v.last={x,z,n};
 }
 else if(t==='nuke'){const r=board().find(row=>row.id===cn.peer);if(d.by!==cn.peer||!r||r.k<20||v.nk++>0)return bad()}
 else if(t==='sh'||t==='skx'){
  if(![d.x,d.y,d.z].every(value=>Number.isFinite(value)&&Math.abs(value)<1500)||
     t==='sh'&&(typeof d.w!=='string'||!hasOwn(W,d.w)))return bad();
  if(d.w==='KEY'&&(mode!=='Zombies'||sel.map!==JUPITER_MAP||!zq?.jupiter?.owners.has(d.id)))return false;
 }else if(t==='skh'){
  if(!teamCanHit(cn.peer,d.to)||!netInteger(d.u)||!Number.isFinite(d.d)||d.d<=0||d.d>400)return false;
 }else if(t==='zqv'){
  if(!netPlayerId(d.to)||d.to===cn.peer||!hasOwn(names,d.to))return false;
  const giver=bots.find(player=>player.net&&player.id===cn.peer&&player.al);
  const target=d.to===myId?(P.dead&&zq?.down?P:null):bots.find(player=>player.net&&player.id===d.to&&player.dn);
  if(!giver||!target||Math.hypot(giver.x-target.x,giver.y-target.y,giver.z-target.z)>5)return false;
 }
 else if(t=='sko'){v.sko=v.sko.filter(x=>n-x<20000);if(v.sko.length>=8)return false;v.sko.push(n)}
 else if(t=='chat'){v.chat=v.chat.filter(x=>n-x<3000);if(v.chat.length>=4)return false;v.chat.push(n)}
 return true}
var hitRate=Object.create(null);function hitRateOK(id,dm){const n=performance.now(),a=(hitRate[id]=(hitRate[id]||[]).filter(x=>n-x[0]<1000));a.push([n,dm]);return a.reduce((s,x)=>s+x[1],0)<=760}
function regOpen(cn){
 if(!netPlayerId(cn.peer)){bhReject(cn,'Invalid connection identity.');return false}
 if(isHost&&(removedPeers.has(cn.peer)||conns.some(c=>c.peer===cn.peer&&c.open))){
  if(removedPeers.has(cn.peer))sendPeerPacket(cn,{t:'removed',w:'You were removed from this room.'});
  cn.blocked=true;setTimeout(()=>cn.close(),350);return false;
 }
 const ticket=isHost?roomTickets.get(cn.peer):null;
 if(isHost&&!ticket&&netOn&&run){
  sendPeerPacket(cn,{t:'room-denied',w:'A match is in progress. Join after the host returns to the lobby.'});
  cn.blocked=true;setTimeout(()=>cn.close(),350);return false;
 }
 if(isHost&&(ticket&&cn.reclaimed!==ticket||!ticket&&roomLocked)){
  sendPeerPacket(cn,{t:'room-denied',w:ticket?'This connection could not reclaim its seat.':'The host has locked this room.'});
  cn.blocked=true;setTimeout(()=>cn.close(),350);return false;
 }
 if(isHost&&maxP&&(conns.length>=maxP-1||partyActive&&run&&!hasOwn(names,cn.peer))){
  sendPeerPacket(cn,{t:'full'});cn.blocked=true;setTimeout(()=>cn.close(),400);return false;
 }
 cn.last=performance.now();rcTry=0;
 if(grace[cn.peer]){clearTimeout(grace[cn.peer]);delete grace[cn.peer];feed((names[cn.peer]||'Player')+' reconnected')}
 conns.push(cn);
 if(isHost){
  const key=ticket||Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
  roomTickets.set(cn.peer,key);
  sendPeerPacket(cn,{t:'admitted',ticket:key,locked:roomLocked});
 }
 sendPeerPacket(cn,{t:'hi',id:myId,n:myName,look:idrLocal()});
 lobby(isHost?'Player joined':'Connected. Waiting for the host to start…');return true;
}
function acceptGamePacket(data,link){
 if(link.blocked)return;
 try{
  if(!isHost){
   if(link.peer!==hostPid||!hostPacketTypes.has(data.t))return;
   const target=packetTarget(data);
   if(target&&target!==myId||data.t==='s'&&!validNetPose(data))return;
  }
  if(acceptRoomPacket(data,link)&&(!isHost||hostVet(data,link)))onMsg(data,link);
 }catch{}
}
function roomJoinFailure(cn){
 if(cn.joinFailure)return cn.joinFailure;
 if(cn.channelOpened)return 'The connection opened, but room verification did not finish.';
 return 'The connection could not open before invite verification. Network: '+(cn.iceState||'channel never opened')+'.';
}
function reg(cn){
 const owner=net;
 cn.last=performance.now();cn.vf=0;cn.auth=roomAuth;
 pendingRoomLinks.add(cn);
 cn.verifyTimer=setTimeout(()=>{
  pendingRoomLinks.delete(cn);
  if(net===owner&&!cn.vf){
   if(!isHost){
    cn.joinFailure=roomJoinFailure(cn);
    if(!netOn&&!window.SD_SPLIT&&!conns.length){failInitialJoin(owner,cn.joinFailure);cn.close();return}
    lobby(cn.joinFailure);
   }
   cn.close();
  }
 },window.SD_SPLIT?12000:25000);
 cn.on('open',()=>{if(net===owner)bhStart(cn);else cn.close()});
 /* Report why a link died instead of the generic "check the code" message. */
 const watchIce=()=>{
  const pc=cn.peerConnection;if(!pc||cn.iceWatched===pc)return;cn.iceWatched=pc;
  cn.iceState=pc.iceConnectionState;
  pc.addEventListener('iceconnectionstatechange',()=>{
   cn.iceState=pc.iceConnectionState;console.info('[net] ICE '+pc.iceConnectionState);
  });
 };
 watchIce();cn.on('open',watchIce);cn.on('transport',watchIce);
 peerPackets(cn,'t',d=>{
  if(net!==owner||cn.blocked)return;
  cn.last=performance.now();
  if(d.t==='bh1'||d.t==='bh2'||d.t==='bhx'){if(!cn.vf)bhMsg(d,cn);return}
  if(!cn.vf){
   // The remote proof may complete while the local digest is still pending.
   if(cn.answer&&(!isHost||d.t==='hi')){
    const pending=cn.pq||=[];
    if(pending.length<20)pending.push(d);
   }
   return;
  }
  if(d.t==='ping'){if(cn.open)sendPeerPacket(cn,{t:'pong'});return}
  if(d.t!=='pong')acceptGamePacket(d,cn);
 },()=>{
  if(net!==owner)return;
  if(isHost&&cn.vf)bhKick(cn,'too many invalid network messages');
  else cn.close();
 });
 cn.on('error',()=>{
  if(net===owner&&!isHost&&!cn.vf){
   lobby(roomJoinFailure(cn));
  }
 });
 cn.on('close',()=>{clearTimeout(cn.verifyTimer);pendingRoomLinks.delete(cn);if(net===owner&&!cn.replacing)netLost(cn)});
}
/* a connection ended. Players who say goodbye leave at once; anyone else gets 15 s to come back (flaky wifi, tab switches, ICE hiccups) before their body is removed */
function netLost(cn){conns=conns.filter(x=>x!==cn);
 if(isHost){if(cn.blocked)return;if(cn.bye){dropPeer(cn.peer);return}if(cn.vf&&names[cn.peer]&&!grace[cn.peer]){if(run)feed(names[cn.peer]+' lost connection…');grace[cn.peer]=setTimeout(()=>{delete grace[cn.peer];dropPeer(cn.peer)},15000)}else if(cn.vf&&!names[cn.peer])roomTickets.delete(cn.peer);return}
 if(hostBye||!net){
  if(!conns.length){
   if(partyActive){netClose();partyStatus('The leader closed the party.')}
   else lobby('The host closed the lobby');
  }
  return;
 }
 if(!cn.vf&&!netOn&&!conns.length&&Object.keys(names).length<=1&&!window.SD_SPLIT){
  failInitialJoin(net,roomJoinFailure(cn));
  return;
 }
 if(netOn||Object.keys(names).length>1)guestRetry()}
function guestRetry(){
 clearTimeout(rcTimer);
 if(!net||isHost||hostBye)return;
 if(conns.some(c=>c.open)){rcTry=0;return}
 if(pendingRoomLinks.size){rcTimer=setTimeout(guestRetry,2500);return}
 if(rcTry++>=12){lobby('Lost connection to the host');if(netOn)setTimeout(()=>endGame('Disconnected'),300);return}
 lobby('Connection lost. Reconnecting… ('+rcTry+'/12)');if(run)msg('Reconnecting…',1.2);try{if(net.disconnected)net.reconnect()}catch(e){}
 try{const c=connectDataPeer(net,hostPid);if(c)reg(c)}catch(e){}
 rcTimer=setTimeout(guestRetry,2500)
}
/* heartbeat: keeps NAT mappings open, and any link silent for 25 s is closed so it can be retried */
setInterval(()=>{const n=performance.now();for(const c of conns)if(c.open){try{sendPeerPacket(c,{t:'ping'})}catch(e){}if(c.last&&n-c.last>25000){try{c.close()}catch(e){}}}},1000);
function dropPeer(id){roomTickets.delete(id);roomReceived.delete(id);recentDamage.delete(id);const i=bots.findIndex(b=>b.net&&b.id==id);if(i>=0){S.remove(bots[i].m);bots.splice(i,1)}if(!hasOwn(names,id))return;if(run)feed(names[id]+' left');delete names[id];peerLooks.delete(id);if(partyActive)broadcastRoster();lobbyList()}
var nmOf=k=>names[k]||(bots.find(b=>(b.hb||!b.net)&&('b'+b.i)==k)||{}).nm||'?';
/* host-side scoring for kills made by someone other than the host's own hits */
function credit(by){if(!isHost||mode=='Private')return;const kb=by==myId?P:bots.find(b=>(b.net?b.id:'b'+b.i)==by);if(!kb)return;const tm=kb===P?pTeam():kb.team;ts[tm]=(ts[tm]||0)+1;if(kb!==P)kb.k=(kb.k||0)+1}
function announce(t,by,head){if(netOn&&isHost&&mode!='Private')netSend({t:'dead',v:'b'+t.i,by:by===P?myId:by.net?by.id:'b'+by.i,head:!!head})}
function syncPuppets(l){
 const ids=new Set(l.map(row=>row[0]));
 for(let k=bots.length-1;k>=0;k--)if(bots[k].hb&&!ids.has(bots[k].i)){
  S.remove(bots[k].m);bots.splice(k,1);
 }
 const replicas=new Map(bots.filter(b=>b.hb).map(b=>[b.i,b]));
 for(const [i,team,al,x,z,nm,wk,rlo,y=0] of l){
  let b=replicas.get(i);
  if(!b){
   b=addBot(1e9,1,botOperator(i),true);b.net=1;b.hb=1;b.i=i;b.id='b'+i;
   b.x=b.tx=x;b.z=b.tz=z;b.y=b.ty=y;b.yaw=0;markOperatorTeam(b.rig,team);
  }
  if(Math.hypot(x-b.tx,z-b.tz)>.05)b.yaw=Math.atan2(x-b.tx,z-b.tz)-Math.PI;
  b.team=team;b.nm=nm;b.al=al;setHeld(b,wk);b.rlOn=!!rlo;b.tx=x;b.tz=z;b.ty=y;
 }
}
function hostChat(text,channel,sender){
 if(!netOn||!isHost||!hasOwn(names,sender)||typeof text!=='string')return;
 const team=teamMode()?mpTeams[sender]:null;
 const message=text.replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,120);
 if(!message||!['all','team'].includes(channel)||(channel==='team'&&!['A','B'].includes(team)))return;
 const packet=gamePacket({t:'chat',id:sender,m:message,ch:channel,tm:team||''});
 if(!packet)return;
 const frame=encodePeerPacket(packet);
 if(frame===null)return;
 for(const link of conns)if(link.open&&link.vf&&!link.blocked&&link.peer!==sender&&
    (channel==='all'||mpTeams[link.peer]===team))link.send(frame);
 if(sender!==myId&&(channel==='all'||mpTeams[myId]===team))chatRecv(packet);
}
function onMsg(d,cn){
 if(isHost&&guestRelayTypes.has(d.t))fwd(d,cn);
 switch(d.t){
 case'oi':{const b=bots.find(q=>q.net&&q.id==d.out);if(b){b.out=1;b.al=0;b.m.visible=false;feed((names[d.out]||'A player')+' is out')}break}
 case'bye':if(isHost){cn.bye=1;dropPeer(d.id)}else hostBye=1;break;
 case'hi':{
  const id=cn.peer;
  names[id]=onlineName(d.n);
  if(d.look)peerLooks.set(id,idrRead(d.look));
  if(isHost){broadcastRoster();voxelSync(cn)}
  lobbyList();break;
 }
 case'roster':{
  if(!d.r||Array.isArray(d.r)||typeof d.r!=='object')break;
  names=Object.assign(Object.create(null),Object.fromEntries(Object.entries(d.r).slice(0,12)
   .filter(([id])=>netPlayerId(id)).map(([id,name])=>[id,onlineName(name)])));
  peerLooks.clear();
  for(const id of Object.keys(names))if(id!==myId&&hasOwn(d.looks||{},id))peerLooks.set(id,idrRead(d.looks[id]));
  lobbyList();break;
 }
 case'identity':{
  const id=isHost?cn.peer:d.id;
  if(!hasOwn(names,id)||id===myId)break;
  const look=idrRead(d.look);
  peerLooks.set(id,look);
  if(isHost)fwd({t:'identity',id,look},cn);
  lobbyList();break;
 }
 case'full':{
  const party=partyActive;netClose();
  if(party)partyStatus('That party is full or in a match.');else lobby('That lobby is full (4 players)');
  break;
 }
 case'admitted':
  if(!isHost&&cn.peer===hostPid&&typeof d.ticket==='string'&&/^[0-9a-f]{32}$/.test(d.ticket)){
   roomTicket=d.ticket;roomLocked=d.locked===true;syncRoomLockControls();
  }
  break;
 case'room-policy':
  if(!isHost&&cn.peer===hostPid&&typeof d.locked==='boolean'){
   roomLocked=d.locked;lobby(roomLocked?'The host locked the room to new players.':'The host reopened the room.');
  }
  break;
 case'room-denied':{
  if(isHost||cn.peer!==hostPid)break;
  const message=typeof d.w==='string'?d.w.slice(0,100):'This room is locked.';
  hostBye=1;
  if(run||fin)exitNetworkMatch();else netClose();
  lobby(message);partyStatus(message);
  break;
 }
 case'removed':{
  if(isHost||cn.peer!==hostPid)break;
  const party=partyActive,line=typeof d.w==='string'?d.w.slice(0,120):'Removed from the room.';
  hostBye=1;
  if(run||fin)exitNetworkMatch();else netClose();
  if(party)partyStatus(line);else lobby(line);
  break;
 }
 case'vox-update':case'vox-shots':case'vox-blast':voxelNet(d,cn);break;
 case'party-queue':if(partyActive&&!isHost&&cn.peer===hostPid)partyStatus(d.active?'The leader is queuing for '+String(d.mode).slice(0,32)+'.':'Waiting for the leader to deploy.');break;
 case'party-return':if(partyActive&&!isHost&&cn.peer===hostPid&&netOn)exitNetworkMatch(true);break;
 case'party-bench':if(partyActive&&isHost){const b=bots.find(b=>b.net&&b.id===cn.peer);if(b){b.al=0;b.m.visible=false}}break;
 case'start':
  if(!isHost&&cn.peer===hostPid&&Number.isSafeInteger(d.round)&&d.round>latestRoomRound&&
     hasOwn(MAPS,d.map)&&(d.mode==='Private'||hasOwn(MODES,d.mode))&&d.teams&&hasOwn(d.teams,myId)){
   if(partyActive)partyBeforeMatch(d.map,d.mode);
   latestRoomRound=d.round;setRoomRound(d.round);
   beginNet(d.map,d.mode,d.teams);
  }
  break;
 case's':{const b=bots.find(b=>b.net&&b.id==d.id);if(b){b.tx=d.x;b.ty=d.y;b.tz=d.z;if(mode==='Zombies'&&Math.abs(b.x-b.tx)>150){b.x=b.tx;b.y=b.ty;b.z=b.tz}b.yaw=d.yaw;if(d.w)setHeld(b,d.w,d.cm,d.at,mode==='Zombies'&&netInteger(d.ppap,3)?d.ppap:0);b.st=d.st||0;b.aj=d.aj||0;b.em=(d.em|0)>0&&(d.em|0)<=EMLEN.length?(d.em|0)-1:-1;b.pi=d.pi||0;b.rlOn=!!d.r;b.zpts=d.p;b.dn=d.dn;b.ji=d.ji===1;if(b.al&&!d.al)burst(V(b.x,1,b.z),16,0x3d6ad6,6,.8,.15);b.al=d.al}break}
 case'hit':if(d.to==myId&&run&&!P.dead){if(!(d.d>=0)||(d.d>300&&!SK.nk)||(!SK.nk&&!hitRateOK(d.id,d.d)))break;d.d=Math.min(d.d,10000);lastAtk=d.bot!=null?'b'+d.bot:d.id;lastAttackHead=d.head===true;try{hurt(d.d,bots.find(b=>b.net&&b.id==lastAtk))}finally{lastAtk='';lastAttackHead=false}}break;
 case'bh':if(isHost&&mode!='Private'){const t=bots.find(b=>!b.net&&b.i==d.i&&b.al),by=bots.find(b=>b.net&&b.id==d.id);if(t&&by)botHit(t,d.d,by,d.head===true)}break;
 case'dead':{const by=d.by;if(isHost&&mode=='Kill Confirmed')try{kcNetDeath(d)}catch(e){}if(by!=myId)feed(by?`${nmOf(by)} ▸ ${nmOf(d.v)}`:nmOf(d.v)+' died');
  if(mode=='Private'){if(by)scores[by]=(scores[by]||0)+1}else if(isHost&&by)credit(by);
  if(by==myId&&d.v!=myId){kills++;const b=bots.find(b=>b.net&&b.id==d.v);if(b){const head=d.head===true;featKill(b,head);juiceKill(b,head)}}break}
 case'sh':{const b=bots.find(b=>b.net&&b.id==d.id);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z),undefined,d.hand===1?1:0,mode==='Zombies'&&netInteger(d.ppap,3)?d.ppap:0);break}
 case'bsh':if(!isHost){const b=bots.find(b=>b.hb&&b.i==d.i);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z),b.team=='A'?0x62a8ff:0xff5a3a)}break;
 case'ob':if(typeof d.s==='string')obText=d.s.slice(0,180);break;case'chat':if(isHost)hostChat(d.m,d.ch,cn.peer);else if(cn.peer===hostPid)chatRecv(d);break;
 case'mark':if(isHost)shareSquadMark(d.point,cn.peer,cn);else if(cn.peer===hostPid)receiveSquadMark(d);break;
 case'sko':skNetObjs(d);break;case'skh':skNetHit(d);break;case'skx':skNetFx(d);break;case'nuke':if(d.by!=myId&&run&&!over){if(isHost)NUKE_BY=d.by;skNukeSeq(d.by,0)}break;
 case'kd':case'kg':try{kcNetRecv(d)}catch(e){}break;
 case'z':if(!isHost){ds=d.ds;if(d.hp&&mode=='Hardpoint')hpApply(d.hp);else d.z.forEach((a,k)=>{const z=zones[k];if(!z)return;z.o=a[0];z.cp=a[1]})}break;
 case'b':if(!isHost)syncPuppets(d.l);break;
 case'f':if(!isHost){d.f.forEach((a,i)=>{const f=flags[i];if(!f)return;if(a[3]==myId&&f.byk!=myId)msg('You have the flag! Bring it home',2.5);f.st=a[0];f.x=a[1];f.z=a[2];f.byk=a[3]});if(d.cs)cs=d.cs}break;
 case'feed':if(!isHost&&typeof d.s==='string')feed(d.s.slice(0,180));break;
 case'pop':if(!isHost)popup(d.a,d.b);break;
 case'end':if(!isHost&&typeof d.w==='string'&&d.w.length<=100){
  let w=d.w;
  if(teamMode())w=(w==='Victory')===(myTeam===netTeam(d.ht))?'Victory':'Defeat';
  else if(netPlayerId(d.nk))w=d.nk===myId?'Victory':(names[d.nk]||'A player')+' wins';
  else if(w==='Victory'&&mode!=='Zombies')w=(names[d.id]||'Host')+' wins';
  netBd=vettedMatchBoard(d.bd);netSc=d.sc?netTeamScores(d.sc):null;
  if(w==='Victory'&&zq?.jupiter?.quest?.stage===JP.LAUNCH)break;
  endGame(w);
 }break;default:if(d.t&&d.t.length>1&&d.t[0]=='z')zNet(d,cn)}}
function addNetBot(id,team){const b=addBot(1e9,1,peerLooks.get(id)?.operator||'recruit',true);b.net=1;b.id=id;b.al=0;b.m.visible=false;b.tx=b.ty=b.tz=b.x=b.z=b.yaw=0;b.team=team||id;b.nm=names[id]||'Player';b.k=0;
 if(teamMode())markOperatorTeam(b.rig,b.team)}
function hostStart(){let m=$('#pmode').value,map=$('#pm').value;PBOTS=Math.max(0,Math.min(12,+($('#pbots')&&$('#pbots').value)));if(isNaN(PBOTS))PBOTS=null;const pick=a=>a[Math.random()*a.length|0];
 if(m=='Zombies'){if(Object.keys(names).length>4)return lobby('Zombies supports up to 4 players');map=(()=>{const v=$('#pm')&&$('#pm').value;return MAPS[v]&&MAPS[v].zm?v:(MAPS[sel.zmap]&&MAPS[sel.zmap].zm?sel.zmap:Object.keys(MAPS).find(k=>MAPS[k].zm))})()}
 else{if(m=='?'||m!=='Private'&&!hasOwn(MODES,m))m=pick(['Private',...Object.keys(MODES).filter(k=>k!='Zombies')]);if(!hasOwn(MAPS,map)||MAPS[map].zm)map=pick(Object.keys(MAPS).filter(k=>!MAPS[k].zm))}
 startNetworkMatch(map,m,partyActive);
}
function startNetworkMatch(map,m,asParty=false){
 if(!isHost||!net?.open||(asParty&&run))return;
 const team=['Team Deathmatch','Capture the Flag','Domination','Hardpoint','Kill Confirmed'].includes(m),teams={};
 Object.keys(names).forEach((id,k)=>{teams[id]=m==='Zombies'||team&&asParty?'A':team?(k%2?'B':'A'):id});
 if(asParty)partyBeforeMatch(map,m);
 setRoomRound(++latestRoomRound);
 netSend({t:'start',map,mode:m,teams,round:roomRound});beginNet(map,m,teams);
}
function beginNet(map,m,teams){if(window.SD_ENGINE_MOD)return;if(soloMode==null)soloMode=sel.mode;sel.map=map;sel.mode=m;mpTeams=teams;myTeam=teams[myId]||'A';netOn=1;scores={};document.body.classList.add('net');startGame();syncBackgroundMatch();for(const id in names)if(id!=myId)addNetBot(id,teams[id]);
 if(!isHost&&!window.SD_SPLIT){paused=1;showPause();$('#pt').textContent='Match ready'}}
function netShot(k,o,d,len,hand=0){netSend({t:'sh',w:k,hand,ppap:mode==='Zombies'?cw()?.pap||0:0,x:+(o.x+d.x*len).toFixed(1),y:+(o.y+d.y*len).toFixed(1),z:+(o.z+d.z*len).toFixed(1)})}
function mpEnd(t){netSend({t:'end',w:t,ht:myTeam,nk:NUKE_BY||0,bd:board().map(r=>[r.id,r.nm,r.k,r.d,r.tm,r.operator]),sc:teamMode()?(mode=='Capture the Flag'?cs:mode=='Domination'||mode=='Hardpoint'?ds:mode=='Kill Confirmed'?kc:{A:ts.A||0,B:ts.B||0}):null})}
function netTick(dt){if(!run)return;nacc+=dt;if(nacc>.066){nacc=0;netSend({t:'s',x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:+yaw.toFixed(2),al:P.dead?0:1,w:cw().k,cm:fpG.userData.camo||'',at:fpG.userData.attachments||[],r:rel>0?1:0,ppap:mode==='Zombies'?cw()?.pap||0:0,p:zq?zq.pts:0,ji:jupiterIntroActive()?1:0,dn:zq&&zq.down?1:0,st:ST.slide>0?3:ST.dive>0?4:ST.prone?2:ST.crouch?1:0,aj:P.on||P.swimming?0:1,em:EMO.cur?EMO.cur.id+1:0,pi:+pitch.toFixed(2),sp:ST.tac>0||(P.spr||0)>.55?1:0})}
 if(isHost&&mode!='Private'){bacc+=dt;if(bacc>.1){bacc=0;if(mode!='Zombies')netSend({t:'b',l:bots.filter(b=>!b.net).map(b=>[b.i,b.team,b.al?1:0,+b.x.toFixed(1),+b.z.toFixed(1),b.nm,b.wk,b.rl>0?1:0,+b.y.toFixed(2)])})}oacc+=dt;if(oacc>.25){oacc=0;netSend({t:'ob',s:$('#ob').textContent})}}
 const k=Math.min(1,dt*12);for(const b of bots)if(b.net){b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,b.y,b.z);b.tyaw=b.yaw+Math.PI;if(!b.al&&b.ry==null)b.m.rotation.y=b.tyaw;const lie=mode=='Zombies'&&!b.al&&b.dn;if(!b.al){b.m.rotation.y=b.tyaw}const pp=b.pp||0,ry_=b.ry==null?b.tyaw:b.ry,sf=lie?0:pp*.85;b.m.rotation.x=lie?-1.5:pp*(b.st==4?1.05:1.45);b.m.position.set(b.x-Math.sin(ry_)*sf,b.y+(lie?.16:pp*(b.st==4?.55:.17)),b.z-Math.cos(ry_)*sf);b.m.visible=!!b.al||!!lie;b.hp=1e9}
 if(!isHost&&mode=='Domination')for(const z of zones)zoneVis(z);
 if(!isHost&&mode=='Capture the Flag')for(const f of flags){f.m.position.set(f.x,0,f.z);f.m.visible=f.byk!=myId}}
function privTick(){const top=Math.max(0,...Object.values(scores));setObjectiveText(`Players only · You ${scores[myId]||0} · Top ${top} / 15`);for(const id in scores)if(scores[id]>=15){endGame(id==myId?'Victory':(names[id]||'A player')+' wins');return}}

/* ===================== menu.js ===================== */
/* ---------- main menu, pause menu, dev menu ---------- */
var vol=1,shk=1,ma=0,fovBase=80;var $$=q=>document.querySelectorAll(q);
$('#pmode').innerHTML='<option value="Private">Free-for-all (players only)</option>'+Object.keys(MODES).filter(k=>k!='Zombies').map(k=>`<option>${k}</option>`).join('')+'<option value="?">Random mode</option>';
for(const k in MAPS)if(!MAPS[k].zm)$('#pm').insertAdjacentHTML('beforeend',`<option>${k}</option>`);$('#pm').insertAdjacentHTML('beforeend','<option value="?">Random map</option>');
try{$('#nm').value=localStorage.getItem('sdrill-name')||('Player'+(100+Math.random()*900|0))}catch(e){$('#nm').value='Player'+(100+Math.random()*900|0)}
function profileHeading(){
 const name=$('#nm').value.trim()||'Player';
 $('#profile-name').textContent=name;$('#profile-initial').textContent=Array.from(name)[0].toUpperCase();
}
function toggleProfile(open,focus=false){
 $('#prof').hidden=!open;$('#profile-open').setAttribute('aria-expanded',String(open));
 if(focus&&$('#menu').style.display==='block')$(open?'#nm':'#profile-open').focus();
}
$('#nm').oninput=()=>{
 profileHeading();
 try{localStorage.setItem('sdrill-name',$('#nm').value.trim().slice(0,12))}catch(e){}
};
profileHeading();
$('#profile-open').onclick=()=>toggleProfile($('#prof').hidden,true);
document.addEventListener('click',e=>{if(!$('#prof').hidden&&!e.target.closest('#prof,#profile-open,#osk'))toggleProfile(false)});
var app='mp';
const playPanel=()=>app==='zm'?'zplay':'lobby';
function showMenuPanel(page){
 if(window.SD_MOD_SESSION&&page==='priv')return;
 const panel=$('#p-'+page);
 if(!panel)return;
 if(page!=='queue')clearMatchSearch();
 if(page==='play')renderMatchSetup();
 if(page==='record')renderCombatRecord(app);
 const primary={play:playPanel(),record:playPanel(),queue:'lobby',priv:playPanel(),zguide:'zplay',ks:'load',cust:app==='zm'?'cust':'load'}[page]||page;
 $$('#menu .pn').forEach(p=>p.classList.toggle('on',p===panel));
 for(const item of $$('#nav button')){
  const active=item.dataset.p===primary&&item.classList.contains(app);
  item.classList.toggle('on',active);
  if(active)item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');
 }
 $('#settings-open').classList.toggle('on',page==='set');
 panel.scrollTop=0;toggleProfile(false);
}
function openMenuPanel(page,focus=true){
 if(page==='priv'&&partyActive){openGameParty();return}
 if(page==='deployment')page=playPanel();
 const button=$('#nav [data-p="'+page+'"].'+app);
 if(button)button.click();else showMenuPanel(page);
 if(focus&&typeof clickables==='function'){
  const panel=$('#p-'+page),first=panel&&clickables(panel)[0];
  (panel?.querySelector('[data-initial-focus]:not(:disabled)')||first||button)?.focus({preventScroll:true});
 }
}
for(const b of $$('#nav button[data-p]'))b.onclick=()=>{if(b.dataset.p==='priv'&&partyActive)openGameParty();else showMenuPanel(b.dataset.p)};
$('#settings-open').onclick=()=>openMenuPanel('set');
$('#menu').addEventListener('click',e=>{
 const b=e.target.closest('button[data-panel]');
 if(b)openMenuPanel(b.dataset.panel);
});
function menuBack(){
 if(!$('#prof').hidden){toggleProfile(false,true);return}
 const current=$('#menu .pn.on')?.id;
 if(current==='p-queue'){cancelMatchSearch();return}
 if(current==='p-identity'&&$('#p-identity [data-idr-tab="creator"][aria-pressed="true"]')){
  $('#locker-category').value='emblems';$('#locker-category').dispatchEvent(new Event('change',{bubbles:true}));$('#locker-category').focus();return;
 }
 if(current==='p-ks'||current==='p-cust'&&app==='mp'){openMenuPanel('load');return}
 if(current==='p-zplay'||current==='p-lobby'){goHome();return}
 openMenuPanel(playPanel());
}
const zOperations={
 'Hollow Estate':{type:'Mansion',brief:'Descend into the crypt for Crypt Tonic, then fight up close to heal with every melee kill.'},
 London:{type:'City',brief:'Restore power in the substation and use Linebreaker Soda to fire through groups of zombies.'},
 [JUPITER_MAP]:{type:'Jupiter research base',brief:'A research station above Jupiter’s storms.'},
 [ROOM_CHALLENGE]:{type:'Close quarters',brief:'Hold a single room. Use Bolt Brew to reinforce the barricade and make every point count.'}
};
const playlistKinds={
 Slayer:'Free-for-all',
 'One in the Chamber':'Elimination',
 Survival:'Wave survival',
 'Time Attack':'Timed free-for-all',
 'Team Deathmatch':'Team combat',
 'Capture the Flag':'Team objective',
 'Kill Confirmed':'Team objective',
 Hardpoint:'Team objective',
 Domination:'Team objective',
 'Gun Game':'Weapon progression'
};
function renderMatchSetup(){
 const modeKey=sel.rm?'?':sel.mode,mapKey=sel.rp?'?':sel.map;
 const modes=$('#md'),maps=$('#mp');
 if(!modes.childElementCount){
  modes.innerHTML=[...Object.keys(MODES).filter(k=>k!=='Zombies'),'?'].map(k=>{
   const kind=k==='?'?'Any playlist':playlistKinds[k]|| (modeLabels[k]&&modPlaylists.get(k)?.base)||'Multiplayer';
   const mark=k==='?'?'shuffle':kind.startsWith('Team')?'team':kind==='Wave survival'?'wave':'target';
   return `<button class="c playlist-choice" data-a="mode" data-v="${esc(k)}"><span class="playlist-mark" data-kind="${mark}" aria-hidden="true"></span>
    <span><b>${k==='?'?'Random mode':esc(modeLabels[k]||k)}</b><small>${kind}</small></span><span class="setup-check" aria-hidden="true"></span></button>`;
  }).join('');
  maps.innerHTML=[...Object.keys(MAPS).filter(k=>!MAPS[k].zm),'?'].map(k=>`<button class="c map-choice" data-a="map" data-v="${esc(k)}" data-map-art="${esc(k)}">
   <span class="map-choice-art" aria-hidden="true"></span><b>${k==='?'?'Random map':esc(MAPS[k]?.modName||k)}</b><span class="setup-check" aria-hidden="true"></span></button>`).join('');
 }
 for(const b of modes.children)b.setAttribute('aria-pressed',String(b.dataset.v===modeKey));
 const course=modeLabels[modeKey]&&modPlaylists.get(modeKey);
 for(const b of maps.children){
  b.setAttribute('aria-pressed',String(b.dataset.v===mapKey));
  b.disabled=!!course?.objectives&&b.dataset.v!==course.map;
 }
 $('#setup-rule').textContent=modeKey==='?'?'A playlist is picked when the search starts.':MODES[modeKey];
 $('#setup-map').dataset.mapArt=mapKey;
 $('#setup-map-name').textContent=mapKey==='?'?'Random map':MAPS[mapKey].modName||mapKey;
 if(window.SD_MOD_SESSION)modPaintMapCards('#p-play');
 $('#setup-map-note').textContent=mapKey==='?'?'An arena is picked when the search starts.':MAPS[mapKey].d;
}
let matchSearch=null;
function clearMatchSearch(){
 const previous=matchSearch;
 if(previous){clearTimeout(previous.timer);matchSearch=null;if(partyActive&&isHost)netSend({t:'party-queue',active:false})}
 return previous;
}
function cancelMatchSearch(){
 const search=clearMatchSearch();
 if(search)openMenuPanel(search.origin);
}
function showMatchSearchPhase(phase){
 const {mode,map}=matchSearch.choice,ready=phase===2;
 matchSearch.phase=phase;
 const panel=$('#p-queue');
 panel.dataset.phase=phase;
 $('#queue-map').dataset.mapArt=ready?map:sel.rp?'?':sel.map;
 $('#queue-title').textContent=[partyActive?'Preparing a party match':'Preparing your match','Setting up the arena','Ready to deploy'][phase];
 $('#queue-detail').textContent=[
  sel.rm?'Choosing a playlist.':mode+' playlist',
  'Preparing the arena and match rules.',
  'Confirm when you’re ready to deploy.'
 ][phase];
 $('#queue-location').textContent=ready?map:sel.rp?'Random map':sel.map;
 $('#queue-mode').textContent=ready?mode:sel.rm?'Random mode':sel.mode;
 $('#queue-accept').hidden=!ready;
 for(const [index,step] of [...$('#queue-steps').children].entries()){
  step.classList.toggle('done',index<phase);
  if(index===phase)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
 }
}
function beginMatchSearch(){
 if(matchSearch||app!=='mp'||run)return;
 if(net&&!partyActive){openMenuPanel('priv');return}
 if(partyActive&&!isHost){openGameParty();return}
 const choose=keys=>keys[Math.floor(Math.random()*keys.length)];
 const mode=sel.rm?choose(Object.keys(MODES).filter(k=>k!=='Zombies')):sel.mode;
 const map=sel.rp?choose(Object.keys(MAPS).filter(k=>!MAPS[k].zm)):sel.map;
 if(window.SD_MOD_SESSION){
  const playlist=modPlaylists.get(mode);
  Object.assign(sel,{mode,map:playlist&&(playlist.objectives||sel.rm&&!sel.rp)?playlist.map:map});
  saveSet();openMenuPanel('lobby',false);startGame();return;
 }
 if(partyActive)netSend({t:'party-queue',active:true,mode});
 matchSearch={origin:$('#p-play').classList.contains('on')?'play':'lobby',choice:{mode,map},phase:0,timer:0};
 showMenuPanel('queue');showMatchSearchPhase(0);$('#queue-cancel').focus({preventScroll:true});
 matchSearch.timer=setTimeout(()=>{
  showMatchSearchPhase(1);
  matchSearch.timer=setTimeout(()=>{
   showMatchSearchPhase(2);
   beep(660,.115,'triangle',.026);
  },1500+Math.random()*1000);
 },4500+Math.random()*2000);
}
$('#queue-cancel').onclick=cancelMatchSearch;
$('#queue-accept').onclick=()=>{
 if(matchSearch?.phase!==2||run||net&&!partyActive||partyActive&&!isHost)return;
 const {choice}=clearMatchSearch();
 if(partyActive){PBOTS=null;startNetworkMatch(choice.map,choice.mode,true);return}
 Object.assign(sel,choice);saveSet();
 openMenuPanel('lobby',false);
 startGame();
};

function homeStats(){
 const best=prof.zbest||0;
 $('#zbest').textContent=best?'Best round · '+best:'';
 $('#hzs').textContent=best?'Best round '+best:Object.values(MAPS).filter(map=>map.zm).length+' survival maps';$('#hms').textContent=rankTxt();
}
function fillPriv(a){
 const zm=a==='zm',map=$('#pm');
 $('#pmode').innerHTML=zm?'<option value="Zombies">Zombies co-op</option>':('<option value="Private">Free-for-all (players only)</option>'+Object.keys(MODES).filter(k=>k!=='Zombies').map(k=>`<option>${k}</option>`).join('')+'<option value="?">Random mode</option>');
 map.innerHTML=Object.keys(MAPS).filter(k=>!!MAPS[k].zm===zm).map(k=>`<option>${k}</option>`).join('')+(zm?'':'<option value="?">Random map</option>');
 if(zm&&MAPS[sel.zmap]?.zm)map.value=sel.zmap;
 $('#pmodeL').hidden=zm;$('#pbL').hidden=zm;$('#p-priv h2').textContent=zm?'Zombies co-op':'Private match';
}
function setApp(a){
 if(!window.SD_MOD_SESSION&&(a!==app||!net))fillPriv(a);
 app=a;
 const menu=$('#menu');menu.className=a;$('#home').style.display='none';menu.style.display='block';
 if(a==='zm'){
  if(!selKeep)selKeep={mode:sel.mode,map:sel.map,rm:sel.rm,rp:sel.rp};
  sel.mode='Zombies';sel.rm=sel.rp=0;sel.map=sel.zmap||sel.map;fixZM();zMapScreen();
 }else{
  restoreSel();
  if(sel.mode==='Zombies'){sel.mode='Slayer';fixZM()}
 }
 ui();showRank();openMenuPanel(playPanel(),false);
}
function goHome(){
 clearMatchSearch();restoreSel();ui();toggleProfile(false);$('#menu').style.display='none';$('#home').style.display='block';showRank();
}
$('#gq').value=gfxQ;$('#gq').onchange=e=>setGfx(e.target.value);
$('#hz').onclick=()=>setApp('zm');$('#hmp').onclick=()=>setApp('mp');$('#back').onclick=goHome;
$('#zdeploy').onclick=()=>{
 if(!MAPS[sel.zmap]?.zm)return;
 if(partyActive){if(isHost){PBOTS=null;startNetworkMatch(sel.zmap,'Zombies',true)}return}
 sel.mode='Zombies';sel.map=sel.zmap;fixZM();startGame();
};
$('#zmaps').onclick=e=>{const button=e.target.closest('[data-zm]');if(button)selectZMap(button.dataset.zm)};
$('#pm').addEventListener('change',e=>{if(app==='zm')selectZMap(e.target.value)});
zMapScreen();goHome();
var _sr=showRank;showRank=function(){_sr();$('#xpf').style.width=(prof.master||prof.lvl>=55?100:prof.xp/need()*100)+'%'};showRank();
function menuCam(dt){gfxTick(dt);if(fin){finTick(dt);return}hideFP();ma+=dt*.12;gun.visible=false;C.fov=70;C.updateProjectionMatrix();const r=H*.75;C.position.set(Math.cos(ma)*r,11,Math.sin(ma)*r);C.lookAt(0,1.5,0)}
/* lobby */
$('#leave').onclick=()=>{netClose();lobby('You left the lobby')};$('#host').onclick=hostMatch;$('#join').onclick=joinMatch;$('#startnet').onclick=()=>{if(conns.length<1)return lobby('Waiting for at least one friend to join');hostStart()};
/* pause */
function matchIntel(){
 if(mode==='Zombies'){
  if(!zq)return '';
  const price=zPapCost();
  const upgrade=zq.papT>0?'Upgrade in progress':price?'Next Pack-a-Punch · '+Math.max(0,price-zq.pts)+' points needed':'Pack-a-Punch complete';
  return upgrade;
 }
 const rows=board(),mine=rows.find(row=>row.me);
 const place=1+rows.filter(row=>row.k>mine.k).length;
 const next=skSel().map(id=>({id,streak:STK[id]})).filter(({id,streak})=>streak&&!SK.got[id]&&!q.includes(id))
  .sort((a,b)=>a.streak.k-b.streak.k)[0];
 const streak=next?next.streak.n+' · '+Math.max(0,Math.max(1,next.streak.k-hl())-ks)+' kills needed':'All equipped streaks earned';
 return 'Kill rank '+place+' / '+rows.length+' · '+(shots?Math.round(100*hits/shots)+'% accuracy':'No shots fired')+' · '+streak;
}
function showPause(){releaseArenaInput();$('#match-intel').textContent=matchIntel();arenaSoundCaptions.clear();$('#pt').textContent=typeof netOn!='undefined'&&netOn?'Menu (the match keeps running)':'Paused';$('#aa2').value=String(AA);$('#sn2').value=sens;$('#fv2').value=fovBase;updateMatchModeration();syncRoomLockControls();renderNextLifeLoadouts();$('#pause').style.display='block'}
function hidePause(){$('#pause').style.display='none';$('#pt').textContent='Paused'}
$('#resume').onclick=()=>lockPtr();
$('#aa2').onchange=e=>{AA=+e.target.value;$('#aa').value=e.target.value;saveSet()};$('#sn2').oninput=e=>{sens=+e.target.value;$('#sn').value=e.target.value;saveSet()};$('#sk').oninput=e=>shk=+e.target.value;
function exitNetworkMatch(keepParty=false){
 run=0;over=1;paused=0;document.exitPointerLock?.();hidePause();resetLifeLoadouts();clearSquadMarks();arenaSoundCaptions.clear();zQuestResetCinema();
 if(practiceSession){
  delete MAPS[practiceName];sel.map=practiceSession.map;practiceSession=null;mode=sel.mode;
  document.body.classList.remove('practice-range','basic-training');
  $('#practice-reset').hidden=true;
  trainingCoach.hidden=true;
 }
 $('#hud').style.display=$('#end').style.display='none';finStop();hideFP();endDeath();
 if(window.SD_MOD_SESSION)modRestoreLoadout();
 if(keepParty)netEnd();else netClose();
 for(const b of bots)S.remove(b.m);bots=[];
 for(const g of grs)S.remove(g.m);grs=[];
 clearFlags();buildMap();$('#menu').style.display='block';showRank();
 if(keepParty)openMenuPanel(playPanel(),false);
}
$('#exit').onclick=()=>{
 if(window.SD_SPLIT){parent.postMessage('spartan-exit-split',location.origin);return}
 if(partyActive&&netOn)netSend({t:isHost?'party-return':'party-bench'});
 exitNetworkMatch(partyActive);
};
$('#dev').onclick=e=>{const d=e.target.dataset.d;if(!d)return;
 if(d=='all')prof.all=1;else if(d=='lvl'){prof.lvl=55;prof.xp=0}else if(d=='master'){prof.pres=10;prof.master=1;prof.ml=1250;prof.xp=0}
 else if(d=='reset'){if(confirm('Delete ALL progress, camos and unlocks?')){try{localStorage.removeItem('sd-prof')}catch(x){}location.reload()}return}
 else{$('#dev').style.display='none';return}save();showRank()};
$('#aa').onchange=saveSet;$('#sn').oninput=saveSet;
fovBase=+$('#fv').value||80;$('#fv').oninput=()=>{fovBase=+$('#fv').value;saveSet()};$('#fv2').oninput=e=>{fovBase=+e.target.value;$('#fv').value=e.target.value;saveSet()};


/* ===================== finale.js ===================== */
/* ---------- match end: everything freezes and blurs, VICTORY / DEFEAT slams in, then the leaderboard, then a podium where players emote, then back to the menu ---------- */
var fin=0,fs='',ft=0,fe=0,podG=null,figs=[],conf=[],fLab=[],netBd=null,netSc=null,finInfo=null;
var esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),EMD=[2.4,2.6,3,2.6],TEAMC={A:'#62a8ff',B:'#ff5a3a'};
/* one row per player: the host's numbers are used by everyone in a networked match */
function board(){const looks=mode!=='Zombies',rows=[{id:myId||'me',nm:hname(),k:mode=='Private'?(scores[myId]||0):kills,d:deaths,tm:teamMode()?myTeam:'',me:1,operator:passOperator(),look:looks?idrLocal():null}];
 for(const b of bots){if(b.zom||(b.nm=='Grunt'&&(!b.net||b.hb)))continue;rows.push({id:b.net?b.id:'b'+b.i,nm:b.nm||'Player',k:mode=='Private'?(scores[b.id]||0):(b.k||0),d:b.net?null:(b.dc||0),tm:teamMode()?b.team:'',me:0,operator:b.m.userData.operator,look:looks&&b.net&&!b.hb?peerLooks.get(b.id):null})}return rows}
function finRows(){const r=netOn&&!isHost&&netBd?netBd.map(([id,nm,k,d,tm,operator])=>({id,nm,k,d,tm,operator,me:id===myId,look:mode==='Zombies'?null:id===myId?idrLocal():peerLooks.get(id)})):board();return r.sort((a,b)=>b.k-a.k||(a.d==null?9e3:a.d)-(b.d==null?9e3:b.d)).slice(0,12)}
function teamTxt(){if(!teamMode())return'';const t=netOn&&!isHost&&netSc?netSc:mode=='Capture the Flag'?cs:mode=='Domination'||mode=='Hardpoint'?ds:mode=='Kill Confirmed'?kc:ts;return `Blue ${netScore(t?.A)} – ${netScore(t?.B)} Red`}
function finStart(t,sc,nb,xp){if(t==='Victory'&&jovianFinishVictory(sc))return;podClear();fin=1;fs='vic';ft=0;fe=0;const w=t=='Victory',rows=finRows(),modeName=window.SD_MOD_SESSION?(modRules.name||mode):mode,mapName=MAPS[sel.map].modName||sel.map;finInfo={w,rows};
 $('#hud').style.display=$('#pause').style.display=$('#end').style.display='none';
 $('#fvt b').textContent=w?'Victory':'Defeat';$('#fvt span').textContent=t=='Victory'||t=='Defeat'?`${modeName} on ${mapName}`:t;
 const acc=shots?Math.round(hits/shots*100):0,tt=teamTxt();
 $('#fbd').innerHTML=`<h2>${w?'Victory':'Defeat'}</h2><p class="sub">${esc(modeName)} on ${esc(mapName)}${tt?' · '+tt:''}</p><table><thead><tr><th></th><th>Player</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td style="border-left-color:${TEAMC[r.tm]||'transparent'}">${i+1}</td><td>${idrBoardName(r,r.me?' (you)':'')}</td><td>${r.k}</td><td>${r.d==null?'–':r.d}</td></tr>`).join('')}</tbody></table><p class="fs">${kills} kills · ${deaths} deaths · ${acc}% accuracy · Score ${sc}${esc(nb)}</p>${xp?`<p class="fs">${xp}</p>`:''}<button id="fcont" class="big">Continue</button><button id="fskip-board" class="big alt" type="button" aria-keyshortcuts="Escape">Skip podium</button>`;
 $('#fcont').onclick=()=>{if(fs=='board')finTo('toPod')};
 $('#fskip-board').onclick=skipPodium;
 if(t==='Draw'){$('#fvt b').textContent='Draw';$('#fbd h2').textContent='Draw'}
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
var numTex=n=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.font='700 100px Teko,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#10202a';g.fillText(n,64,70);return new THREE.CanvasTexture(c)};
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
 const rows=finInfo.rows.slice(0,3);if(mode!='Zombies')while(rows.length<3)rows.push({id:'f'+rows.length,nm:'Grunt',k:0,d:0,tm:'',me:0,operator:botOperator(rows.length)});
 const extra=rows.some(r=>r.me)?null:finInfo.rows.find(r=>r.me);
 rows.forEach((r,i)=>mkFig(r,SX[i],SH[i],0,i==1?.3:i==2?-.3:0,i===0));
 if(extra)mkFig(extra,5.4,0,1.4,-.5,false);
 doEmote(figs[0],1);
 if(mode=='Zombies')zCrowd();
 const cm=[0xffd24a,0x62e0f0,0xff5a3a,0xffffff,0x7bd86b].map(c=>new THREE.MeshBasicMaterial({color:c}));
 for(let i=0;i<80;i++){const m=new THREE.Mesh(bg,cm[i%5]);m.scale.set(.07,.025,.11);m.position.set((Math.random()-.5)*12,Math.random()*10,(Math.random()-.5)*8);podG.add(m);conf.push({m,v:1+Math.random()*1.6,rx:(Math.random()-.5)*8,rz:(Math.random()-.5)*8,sw:Math.random()*6})}
 podTick(0)}
/* zombie podium: the survivors on the pedestals, a shambling crowd of the undead closing in from behind and the sides */
var zcr=[];
function zCrowd(){zcr=[];const rd=Math.max(1,typeof zq!='undefined'&&zq?zq.r:6);for(let i=0;i<30;i++){const R=4.8+Math.random()*5.2,ph=(Math.random()*2-1)*1.75,x=R*Math.sin(ph),z=-R*Math.cos(ph)+.5,big=i%9==4,{m,rig}=zModel(rd,big,i);m.position.set(x,0,z);podG.add(m);zcr.push({m,rig,zom:1,i,x,z,tyaw:Math.atan2(-x,2.5-z),ry:Math.atan2(-x,2.5-z)+(Math.random()-.5)*.5,ph:Math.random()*6,big})}}
function zCrowdTick(){const s0=t0;for(const b of zcr){t0=ft+b.i*.37;b.tyaw=b.ry;animBot(b,.016);b.m.position.y=Math.abs(Math.sin(ft*1.6+b.ph))*.035;b.m.rotation.z=Math.sin(ft*1.1+b.ph)*.05}t0=s0}
function mkFig(r,x,y,z,ry,crown){const g=new THREE.Group(),rig=mkHuman(g,{operator:r.operator??r.look?.operator});markOperatorTeam(rig,r.tm);g.position.set(x,y,z);g.rotation.y=ry;
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
var myEmote=i=>{const f=figs.find(x=>x.me);if(f&&fs=='pod')doEmote(f,i)};
$('#fem').onclick=e=>{const b=e.target.closest('button');if(b)myEmote(+b.dataset.e)};
function skipPodium(){
 if(!fin||!['board','toPod','pod'].includes(fs))return false;
 toMenu();
 return true;
}
$('#fskip-pod').onclick=skipPodium;
addEventListener('keydown',event=>{
 if(event.code==='Escape'&&!event.repeat&&skipPodium()){event.preventDefault();return}
 if(fs!=='pod')return;
 const emote=['Digit1','Digit2','Digit3','Digit4'].indexOf(event.code);
 if(emote>=0)myEmote(emote);
});
function podClear(){if(podG){S.remove(podG);podG=null}zcr=[];figs=[];conf=[];fLab=[];$('#fnm').innerHTML=''}
/* a new match or leaving early: drop everything the finale created */
function finStop(){jovianResetPresentation();podClear();fin=0;fs='';netBd=netSc=null;const F=$('#fin');F.style.display='none';F.className=''}
/* podium done: back to the main menu (fades from black) */
function toMenu(){if(window.SD_MOD_SESSION)modRestoreLoadout();if(window.SD_SPLIT){parent.postMessage('spartan-restart-split',location.origin);fs='';return}podClear();fin=0;fs='';netBd=netSc=null;if(net&&(isHost||conns.length))netEnd();else netClose();for(const b of bots)S.remove(b.m);bots=[];for(const g of grs)S.remove(g.m);grs=[];clearFlags();endDeath();buildMap();hideFP();showRank();
 $('#hud').style.display=$('#end').style.display='none';$('#menu').style.display='block';if(partyActive)openMenuPanel(playPanel(),false);else if(net)$('#nav button.'+app+'[data-p="priv"]').click();const F=$('#fin');F.className='blk';void F.offsetWidth;F.className='';setTimeout(()=>{if(!fin)F.style.display='none'},600)}

/* ===================== touch.js ===================== */
/* ---------- mobile touch controls + no-zoom / no-copy protections ---------- */
var isTouch=false;var tc=document.createElement('div');tc.id='tc';$('#hud').appendChild(tc);
var noLock=matchMedia('(hover:none)').matches||!R.domElement.requestPointerLock;
tc.innerHTML='<div id="stick"><i></i></div>'+[['jump','JUMP','right:18px;bottom:22px;width:76px;height:76px'],['reload','RELOAD','right:106px;bottom:22px'],['swap','SWAP','right:106px;bottom:90px'],['nade','NADE','right:30px;bottom:108px'],['ks','STREAK','right:106px;bottom:158px'],['melee','MELEE','right:30px;bottom:176px'],['field','FIELD','right:106px;bottom:226px'],['pause','II','right:10px;top:10px;width:44px;height:44px']].map(([k,t,s])=>`<div class="tb" data-b="${k}" style="${s}"${k==='field'?' hidden':''}>${t}</div>`).join('');
var st={id:null},lk={id:null,x:0,y:0},fi={id:null,x:0,y:0},bt={};
function enableTouch(){if(isTouch)return;isTouch=true;document.body.classList.add('touch');$('#hint').textContent='Left side: look · Right side: shoot · Stick: move · Buttons: jump, reload, grenade, melee'}
if(matchMedia('(pointer:coarse)').matches)enableTouch();
const gameFullscreenButtons=$$('[data-game-fullscreen]');
async function enterGameFullscreen(){
 if(document.fullscreenElement||!document.documentElement.requestFullscreen)return;
 await document.documentElement.requestFullscreen({keyboardLock:'browser',navigationUI:'hide'});
}
function gameFullscreenChanged(){
 const enabled=Boolean(document.fullscreenElement);
 for(const button of gameFullscreenButtons)button.textContent=enabled?'Exit fullscreen':'Fullscreen';
 if(enabled)navigator.keyboard?.lock?.(['Escape'])?.catch(()=>{});
 else navigator.keyboard?.unlock?.();
}
for(const button of gameFullscreenButtons){
 button.hidden=!document.fullscreenEnabled||Boolean(window.SD_SPLIT);
 button.onclick=async()=>{
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else await enterGameFullscreen();
  }catch{button.textContent='Fullscreen unavailable'}
 };
}
document.addEventListener('fullscreenchange',gameFullscreenChanged);
function lockPtr(){
 if(window.SD_SPLIT){paused=0;hidePause();return}
 if(noLock){
  paused=0;hidePause();
  enterGameFullscreen().then(()=>screen.orientation?.lock?.('landscape')).catch(()=>{});
 }else{
  const request=R.domElement.requestPointerLock?.();
  request?.catch?.(()=>{});
 }
}
function stickMove(t){const r=$('#stick').getBoundingClientRect(),R0=r.width/2;let dx=t.clientX-(r.left+R0),dy=t.clientY-(r.top+R0);const m=Math.hypot(dx,dy);if(m>R0){dx*=R0/m;dy*=R0/m}const nx=dx/R0,ny=dy/R0;$('#stick i').style.transform=`translate(${dx}px,${dy}px)`;key.KeyW=ny<-.3;key.KeyS=ny>.3;key.KeyA=nx<-.3;key.KeyD=nx>.3;key.ShiftLeft=ny<-.5&&Math.hypot(nx,ny)>.97;0}
function stickEnd(){st.id=null;$('#stick i').style.transform='';key.KeyW=key.KeyS=key.KeyA=key.KeyD=key.ShiftLeft=false}
function look(t,o){const k=.0042*sens*fr;yaw-=(t.clientX-o.x)*k;pitch=cl(pitch-(t.clientY-o.y)*k,-1.45,1.45);o.x=t.clientX;o.y=t.clientY}
function tbDown(k){if(k=='jump')key.Space=1;else if(k=='reload')startRel();else if(k=='nade')throwG();else if(k=='melee')melee();else if(k=='swap')swap((cur+1)%wp.length);else if(k=='field')actField();else if(k=='ks'){if(mode=='Zombies')key.KeyF=1;useStreak()}else if(k=='pause'&&run&&!paused&&!over){paused=1;trig=0;stickEnd();showPause()}}
var live=e=>run&&!paused&&!over&&!(e.target.closest&&e.target.closest('#pause,#end,#menu,#dev,#home,#mapv,#jovian-dossier-open'));
addEventListener('touchstart',e=>{enableTouch();if(!live(e))return;e.preventDefault();
 for(const t of e.changedTouches){const el=t.target,b=el.closest&&el.closest('.tb');
  if(b){bt[t.identifier]=b;b.classList.add('on');tbDown(b.dataset.b)}
  else if(el.closest&&el.closest('#stick')){st.id=t.identifier;stickMove(t)}
  else if(t.clientX<innerWidth/2){lk.id=t.identifier;lk.x=t.clientX;lk.y=t.clientY}
  else{fi.id=t.identifier;fi.x=t.clientX;fi.y=t.clientY;trig=1;fresh=1}}},{passive:false});
addEventListener('touchmove',e=>{if(e.touches.length>1||live(e))e.preventDefault();if(!run)return;for(const t of e.changedTouches){if(t.identifier==st.id)stickMove(t);else if(t.identifier==lk.id)look(t,lk);else if(t.identifier==fi.id)look(t,fi)}},{passive:false});
var tend=e=>{for(const t of e.changedTouches){if(t.identifier==st.id)stickEnd();if(t.identifier==lk.id)lk.id=null;if(t.identifier==fi.id){fi.id=null;trig=0}const b=bt[t.identifier];if(b){b.classList.remove('on');if(b.dataset.b=='jump')key.Space=0;if(b.dataset.b=='ks')key.KeyF=0;delete bt[t.identifier]}}};
addEventListener('touchend',tend);addEventListener('touchcancel',tend);
/* no zooming */
for(const ev of['gesturestart','gesturechange','gestureend'])document.addEventListener(ev,e=>e.preventDefault());
addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['+','-','=','_','0'].includes(e.key))e.preventDefault()});
var lastTap=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTap<350&&!(e.target.closest&&e.target.closest('input,select,button')))e.preventDefault();lastTap=n},{passive:false});
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
var NAV={n:0,g:null,r:.62,st:null,gs:null,par:null,stamp:0};
function navBuild(){const n=Math.ceil(H*2),g=new Uint8Array(n*n),r=NAV.r;
 const M=MAPS[sel.map]||{},floor=M.navGround?M.groundHeight:null;
 for(const k of bx){const y=floor?floor((k.x0+k.x1)/2,(k.z0+k.z1)/2):0;if(k.h-y<=.5||(k.y0||0)-y>=2)continue;const i0=Math.max(0,Math.floor(k.x0-r+H)),i1=Math.min(n-1,Math.floor(k.x1+r+H)),j0=Math.max(0,Math.floor(k.z0-r+H)),j1=Math.min(n-1,Math.floor(k.z1+r+H));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=i+.5-H,cz=j+.5-H;if(cx>k.x0-r&&cx<k.x1+r&&cz>k.z0-r&&cz<k.z1+r)g[j*n+i]=1}}
 for(let i=0;i<n;i++){g[i]=g[(n-1)*n+i]=g[i*n]=g[i*n+n-1]=1}
 NAV.n=n;NAV.g=g;NAV.st=new Int32Array(n*n);NAV.gs=new Float64Array(n*n);NAV.par=new Int32Array(n*n);NAV.stamp=0;
 /* connected regions of free cells: anything outside the biggest play-area region (a sealed room, a cliff top bots cannot climb to, a gap between objects) is unreachable on foot */
 const comp=new Int32Array(n*n).fill(-1),cnt=[];let cc=0;
 for(let s=0;s<n*n;s++){if(g[s]||comp[s]>=0)continue;let c=0;const stk=[s];comp[s]=cc;while(stk.length){const u=stk.pop(),x0=u%n,y0=(u/n)|0;if(!M.inside||M.inside(x0+.5-H,y0+.5-H))c++;
   for(const[dx,dz]of N8){const x=x0+dx,y=y0+dz;if(x<0||y<0||x>=n||y>=n)continue;const k=y*n+x;if(g[k]||comp[k]>=0)continue;if(dx&&dz&&(g[y0*n+x]||g[y*n+x0]))continue;comp[k]=cc;stk.push(k)}}cnt.push(c);cc++}
 let main=0;cnt.forEach((c,i)=>{if(c>cnt[main])main=i});NAV.comp=comp;NAV.main=main}
/* true when (x,z) is a free spot inside the main walkable region (zombie mode has doors that open later, so everything counts there) */
var navOK=(x,z)=>{const g=NAV.g;if(!g||!NAV.comp||mode=='Zombies')return true;const[i,j]=navCell(x,z),k=j*NAV.n+i;return !g[k]&&NAV.comp[k]==NAV.main};
var navCell=(x,z)=>{const n=NAV.n;return[cl(Math.floor(x+H),0,n-1),cl(Math.floor(z+H),0,n-1)]},navCtr=(i,j)=>[i+.5-H,j+.5-H];
function navSnap(i,j){const n=NAV.n,g=NAV.g;for(let r=1;r<8;r++){let best=null,bd=1e9;for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(Math.max(Math.abs(a),Math.abs(b))!=r)continue;const x=i+a,y=j+b;if(x<0||y<0||x>=n||y>=n||g[y*n+x])continue;const d=a*a+b*b;if(d<bd){bd=d;best=[x,y]}}if(best)return best}return[i,j]}
function navLos(x0,z0,x1,z1){const g=NAV.g;if(!g)return true;const n=NAV.n,d=Math.hypot(x1-x0,z1-z0),st=Math.max(1,Math.ceil(d/.35));for(let s=0;s<=st;s++){const t=s/st;if(t*d<.75)continue;const i=Math.floor(x0+(x1-x0)*t+H),j=Math.floor(z0+(z1-z0)*t+H);if(i<0||j<0||i>=n||j>=n||g[j*n+i])return false}return true}
/* tiny binary heap of (cost, cell) */
function mkHeap(){const k=[],v=[];return{n:()=>k.length,push(c,x){let i=k.length;k.push(c);v.push(x);while(i>0){const p=(i-1)>>1;if(k[p]<=k[i])break;[k[p],k[i]]=[k[i],k[p]];[v[p],v[i]]=[v[i],v[p]];i=p}},
 pop(){const c=k[0],x=v[0],lk=k.pop(),lv=v.pop();if(k.length){k[0]=lk;v[0]=lv;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<k.length&&k[l]<k[m])m=l;if(r<k.length&&k[r]<k[m])m=r;if(m==i)break;[k[m],k[i]]=[k[i],k[m]];[v[m],v[i]]=[v[i],v[m]];i=m}}return[c,x]}}}
var N8=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
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
var _bm=buildMap;buildMap=function(){const r=_bm.apply(this,arguments);navBuild();return r};
;
/* ######## zombies.js ######## (the Zombies mode now lives in js/zombies.js and js/estate.js) */
fixZM();ui();buildMap();
loadSet();
addEventListener('pagehide',saveSet);addEventListener('beforeunload',saveSet);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveSet()});
/* audio: resume the shared context whenever the tab comes back or the browser suspended it */
var audioKick=()=>{try{if(ac&&ac.state!='running')ac.resume().catch(()=>{})}catch(e){}};
document.addEventListener('visibilitychange',audioKick);addEventListener('focus',audioKick);addEventListener('pageshow',audioKick);for(const ev of['pointerdown','keydown','touchstart'])addEventListener(ev,audioKick,true);setInterval(()=>{if(!document.hidden)audioKick()},700);
;
/* Map selection and deployment are separate, so selecting a map also works from co-op setup. */
function selectZMap(key,persist=true){
 if(!MAPS[key]?.zm)return;
 const info=zOperations[key],feature=$('#z-feature');
 if(persist)sel.zmap=key;
 if(app==='zm'&&!run)sel.map=key;
 if(app==='zm'&&[...$('#pm').options].some(option=>option.value===key))$('#pm').value=key;
 feature.dataset.mapArt=key;
 $('#z-location').textContent=MAPS[key].modName||key;
 if(window.SD_MOD_SESSION&&typeof modPaintMapCards==='function')modPaintMapCards('#p-zplay');
 $('#z-description').textContent=info?.brief||MAPS[key].d.replace(/^Zombies map: /,'');
 for(const card of $$('#zmaps [data-zm]'))card.setAttribute('aria-pressed',String(card.dataset.zm===key));
 if(persist)saveSet();
}
function zMapScreen(){
 const maps=Object.keys(MAPS).filter(k=>MAPS[k].zm);
 $('#zdeploy').disabled=!maps.length;
 $('#zmaps').innerHTML=maps.map(k=>{
  const info=zOperations[k],name=MAPS[k].modName||k;
  return `<button class="zmap" data-zm="${k}" data-map-art="${k}"><span class="map-thumb" aria-hidden="true"></span><span class="map-label"><b>${esc(name)}</b><small>${info?.type||''}</small></span><span class="map-mark" aria-hidden="true"></span></button>`;
 }).join('');
 if(maps.length)selectZMap(maps.includes(sel.zmap)?sel.zmap:maps[0],!sel.zmap);
}
;

/* ######## controls.js ######## */
/* ===================== controls.js ===================== */
/* ---------- full control scheme shared by keyboard + mouse, controller and VR: aim down sights, stances (crouch, slide, prone, dive), walk, auto-run, tactical sprint,
   lethal and tactical equipment, field upgrade, armor plates, fire mode, weapon mount, steady aim, ping, night vision, scoreboard and map ---------- */
var ST={ads:0,adsIn:0,ax:0,ay:-.12,az:-.4,zoom:.2,eye:1.65,crouch:0,prone:0,slide:0,dive:0,walk:0,auto:0,tac:0,tacCd:0,lastShift:-9,mount:0,steady:0,nv:0,tN:2,field:0,fieldCd:0,fm:{},sj:0,flash:0,sc:0,mapOn:0,sbOn:0,pings:[],qi:0};
function ctlReset(keepPings=false){mvReset();resetViewMotion();Object.assign(ST,{ads:0,adsIn:0,eye:1.65,crouch:0,prone:0,slide:0,dive:0,walk:0,auto:0,tac:0,tacCd:0,mount:0,steady:0,tN:2,field:0,fieldCd:0,sj:0,flash:0});hudCrosshair.hidden=false;if(!keepPings)clearSquadMarks();const e=$('#flash');if(e)e.style.opacity=0}
/* ---------- ADS: put the sight line of the current weapon on the camera axis ---------- */
function alignWeaponSight(w){
 const k=w.k,scope=k==='SN'&&!ST.sniperIrons,raw=fpG.userData.sight;
 let sight=raw&&{xt:-raw.xt,yt:raw.yt,zr:fpG.position.z-raw.zr};
 if(scope)sight={xt:0,yt:.11,zr:fpG.position.z-.21};
 const pistol=w.sidearm||['CT','MG','MP'].includes(k),distance=scope?.1:pistol?.3:.22;
 ST.zoom=scope?.62:k==='SN'||w.singleLoad?.36:k==='RL'?.25:['SMG','VMP','MP','RD'].includes(k)?.16:w.pel>1?.14:pistol?.12:.22;
 ST.ax=-(sight?.xt||0);ST.ay=sight?-sight.yt:-.1;ST.az=sight?-distance-sight.zr:-.4;ST.mount=0;
}
var _sgC=setGun;setGun=function(){_sgC.apply(this,arguments);const w=cw();if(w)alignWeaponSight(w)};
/* ---------- movement: stances, slide, dive, walk, auto-run, tactical sprint ---------- */
function moveCalc(dt){let f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0);if(key.KeyS)ST.auto=0;if(ST.auto&&!key.KeyS)f=1;
 const sh=key.ShiftLeft||key.ShiftRight;let spt=!P.swimming&&sh&&f>0&&!ST.adsIn&&!ST.prone&&ST.slide<=0&&ST.dive<=0;if(spt&&ST.crouch)ST.crouch=0;
 if(ST.slide>0||ST.dive>0){f=1;s=0;spt=false}
 let spd=7;if(spt)spd=ST.tac>0?10.2:9;else if(ST.slide>0)spd=4+7*(ST.slide/.85);else if(ST.dive>0)spd=2+9*(ST.dive/.5);else if(ST.prone)spd=1.8;else if(ST.crouch)spd=3.8;else if(ST.walk)spd=3.6;
 if(ST.ads>.3&&!ST.slide&&!ST.dive)spd*=1-.35*ST.ads;if(ST.field>0)spd*=1.25;return{f,s,spt,spd}}
function ctlTick(dt){meleeTick(dt);if(P.dead){ST.adsIn=0;ST.ads=0;ST.slide=ST.dive=0}
 const tg=ST.adsIn&&rel<=0&&!P.dead&&!P.mt?1:0;ST.ads+=(tg-ST.ads)*Math.min(1,dt*(tg?9*((cw()&&cw().ad)||1):12));if(ST.ads<.002)ST.ads=0;
 const hideCrosshair=!!tg||ST.ads>.05;
 if(hudCrosshair.hidden!==hideCrosshair)hudCrosshair.hidden=hideCrosshair;
 if(ST.slide>0){ST.slide-=dt;if(ST.slide<=0)ST.crouch=1}if(ST.dive>0){ST.dive-=dt;if(ST.dive<=0)ST.prone=1}
 if(ST.tac>0&&(P.spr||0)>.5){ST.tac-=dt;if(ST.tac<=0)ST.tacCd=6}if(ST.tacCd>0)ST.tacCd-=dt;
 if(ST.field>0)ST.field-=dt;if(ST.fieldCd>0)ST.fieldCd-=dt;if(ST.steady>0)ST.steady-=dt;
 if(ST.mount&&(ST.ads<.5||Math.hypot(P.mx||0,P.mz||0)>1))ST.mount=0;
 const et=ST.slide>0?.8:ST.prone?.55:ST.crouch?1.15:1.65;ST.eye+=(et-ST.eye)*Math.min(1,dt*10);if(!key.Space)ST.sj=0;
 const sc=$('#scope'),w=cw(),scoped=ST.ads>.85&&w&&w.k==='SN'&&!ST.sniperIrons;if(sc)sc.style.display=scoped?'block':'none';katTick(dt);gun.scale.setScalar(scoped||meleeOut()?.01:1);
 if(ST.flash>0){ST.flash-=dt;const e=$('#flash');if(e)e.style.opacity=Math.min(1,ST.flash)}
 for(let i=ST.pings.length-1;i>=0;i--){const p=ST.pings[i];p.t-=dt;p.m.position.y=p.y+Math.sin(t0*4)*.15;p.m.rotation.y+=dt*2;if(p.t<=0)removeSquadMark(i)}
 if(ST.mapOn)drawMap();if(ST.sbOn&&(ST.sbT=(ST.sbT||0)-dt)<=0){ST.sbT=.5;drawSb()}}
/* ---------- actions ---------- */
var sprinting=()=>(P.spr||0)>.55;
function actCrouch(){if(P.dead)return;if(sprinting()&&ST.slide<=0){ST.slide=.85;ST.crouch=0;ST.prone=0;return}ST.prone=0;ST.crouch=ST.crouch?0:1}
function actProne(){if(P.dead)return;if(sprinting()&&ST.dive<=0){ST.dive=.5;ST.crouch=0;ST.prone=0;P.vy=3.5;P.on=0}else{ST.crouch=0;ST.prone=ST.prone?0:1}}
function actJumpPress(){if(ST.crouch||ST.prone){ST.crouch=ST.prone=0;ST.sj=1}}
function actAds(on){if(on&&typeof cw=='function'&&cw()&&cw().dual&&!(typeof MV!='undefined'&&MV.eq))on=0;ST.adsIn=on?1:0;if(typeof zDashIn=='function')zDashIn(on)}
function actTactical(){return typeof eqUse=='function'?eqUse(2):actTactical0()}
function actTactical0(){if(P.dead||ST.tN<=0)return;ST.tN--;const d=aimDir(),m=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0xeeeeee,emissive:0x555555}));m.scale.setScalar(.1);S.add(m);grs.push({m,p:C.position.clone(),v:d.multiplyScalar(14).add(V(0,3,0)),t:1.3,g:{fuse:1.3,R:0,d:0,imp:0,tac:1}});msg('Flashbang · '+ST.tN+' left',1)}
function flashBoom(p){burst(p,40,0xffffff,9,.5,.25);beep(2400,.5,'sine',.08);for(const b of bots){if(!b.al||(typeof ally=='function'&&ally(b)&&b.team!='z')||b.net)continue;const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<18&&navLos(p.x,p.z,b.x,b.z))b.stun=Math.max(b.stun||0,3.5*(1-d/26))}
 const d=Math.hypot(P.x-p.x,P.z-p.z);if(d<22&&!P.dead){const v=V(p.x-C.position.x,p.y-C.position.y,p.z-C.position.z).normalize(),dot=aimDir().dot(v);ST.flash=Math.max(ST.flash,2.4*(1-d/22)*(dot>0?1:.35))}}
/* X: the second equipment slot (Danger Zone: a second lethal, Strategist: a second tactical). The old Adrenaline field upgrade is gone. */
function actField(){if(P.dead)return;if(mode==='Zombies'&&cw()?.k==='KEY')return jupiterUseField();if(typeof eqUse=='function')eqUse(1)}
function actFireMode(){const w=cw();if(!w)return;
 if(w.k==='SN'){ST.sniperIrons=!ST.sniperIrons;alignWeaponSight(w);msg(ST.sniperIrons?'Backup iron sights':'Scope',1);return}
 if(!w.au){msg(w.n+(w.burst?': 3-round burst':': semi-auto only'),1);return}ST.fm[w.k]=ST.fm[w.k]?0:1;msg(w.n+': '+(ST.fm[w.k]?'Single':'Auto'),1)}
function actMount(){if(ST.ads<.5){return}ST.mount=ST.mount?0:1;msg(ST.mount?'Weapon mounted':'Mount released',1)}
function actSteady(){if(ST.ads>.5){ST.steady=3;msg('Steady aim',.8)}}
function actPing(){placeSquadMark()}
function actNV(){ST.nv=!ST.nv;R.domElement.style.filter=ST.nv?'brightness(1.9) contrast(1.15) saturate(.4) sepia(1) hue-rotate(65deg)':'';const e=$('#nvo');if(e)e.style.display=ST.nv?'block':'none';msg('Night vision '+(ST.nv?'on':'off'),.8)}
function actInv(){const w=wp.map(x=>x.n).join(' · ');msg(`${w}  |  Frags ${gc}  Flash ${ST.tN}`,2.5)}
function actInteract(){if(sdGameRuntime?.interact())return;if(window.SD_MOD_SESSION&&modObjectiveInteract())return;if(mode=='Zombies')zUse()}
function actSwapNext(){if(wp.length>1)swap((cur+1)%wp.length)}function actSwapPrev(){if(wp.length>1)swap((cur+wp.length-1)%wp.length)}
function actSb(on){ST.sbOn=on;const e=$('#sbd');e.style.display=on?'block':'none';if(on){ST.sbT=0;drawSb()}}
function actMap(){
 const jovian=mode==='Zombies'&&sel.map===JUPITER_MAP&&jovianQuest();
 if(mode==='Zombies'&&(!jovian||jupiterIntroActive()||jovianInputBlocked()||P.dead))return;
 ST.mapOn=!ST.mapOn;
 const map=$('#mapv');
 map.classList.toggle('jovian-map',!!jovian);
 $('#jovian-dossier').hidden=!jovian;
 map.style.display=ST.mapOn?(jovian?'grid':'block'):'none';
 if(ST.mapOn)drawMap();
}
$('#jovian-dossier-open').onclick=actMap;
$('#jovian-dossier-close').onclick=actMap;
let sbMarkup='';
function drawSb(){const rows=finRows(),e=$('#sbd'),team=teamTxt();
 const markup='<h3>Scoreboard</h3><table><thead><tr><th></th><th>Player</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>'+rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td>${idrBoardName(r)}</td><td>${r.k}</td><td>${r.d==null?'–':r.d}</td></tr>`).join('')+'</tbody></table>'+(team?`<p>${team}</p>`:'');
 if(markup!==sbMarkup){e.innerHTML=markup;sbMarkup=markup}}
/* ---------- Arena tactical map ---------- */
let tacticalBase=null,tacticalRevision=-1;
function resetTacticalMap(){
 ST.mapOn=0;$('#mapv').style.display='none';$('#mapv').classList.remove('jovian-map');$('#jovian-dossier').hidden=true;
 tacticalBase=null;tacticalRevision=-1;
 const canvas=$('#mapc');canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
}
function drawMapBase(c,W,M,X,Z,k){
 const tb=M.tb||[-H,-H,H,H];
 /* tactical map: dark satellite-style ground, a red scan-line band just outside the play area, a white outline, buildings as lit blocks */
 c.clearRect(0,0,W,W);const bg_=c.createRadialGradient(W/2,W/2,W*.08,W/2,W/2,W*.78);bg_.addColorStop(0,'#2b2b2d');bg_.addColorStop(1,'#09090a');c.fillStyle=bg_;c.fillRect(0,0,W,W);
 let sd=17;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;c.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<70;i++)c.fillRect(rn()*W,rn()*W,4+rn()*22,2+rn()*10);c.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<40;i++)c.fillRect(rn()*W,rn()*W,8+rn()*30,4+rn()*14);
 const x0=X(tb[0]),z0=Z(tb[1]),x1=X(tb[2]),z1=Z(tb[3]);
 c.save();c.beginPath();c.rect(x0-W*.05,z0-W*.05,x1-x0+W*.1,z1-z0+W*.1);c.rect(x0,z0,x1-x0,z1-z0);c.clip('evenodd');c.fillStyle='rgba(255,30,30,.12)';c.fillRect(0,0,W,W);c.fillStyle='rgba(255,45,45,.6)';for(let y=0;y<W;y+=4)c.fillRect(0,y,W,1.3);c.restore();
 c.fillStyle='#202022';c.fillRect(x0,z0,x1-x0,z1-z0);c.fillStyle='rgba(255,255,255,.03)';for(let i=0;i<120;i++)c.fillRect(x0+rn()*(x1-x0),z0+rn()*(z1-z0),2+rn()*8,2+rn()*5);
 if(M.swim)drawQuarryRiverOnMap(c,X,Z,k);
 const rect=b=>[X(b.x0),Z(b.z0),Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k)];
 for(const b of bx){if(b.h<=.3||b.h>=13.9)continue;const hi=(b.y0||0)>=2,r=rect(b);if(hi){c.fillStyle='rgba(150,150,156,.45)';c.fillRect(...r);continue}
  if(b.h>3){c.fillStyle='#6f6f73';c.fillRect(...r);c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1;c.strokeRect(r[0]+.5,r[1]+.5,r[2],r[3])}else if(b.h>1.2){c.fillStyle='#4e4e52';c.fillRect(...r);c.strokeStyle='rgba(200,200,200,.55)';c.lineWidth=1;c.strokeRect(r[0]+.5,r[1]+.5,r[2],r[3])}else{c.fillStyle='#3a3a3d';c.fillRect(...r)}}
 c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(x0,z0,x1-x0,z1-z0);
 /* targeting-screen decoration */
 c.strokeStyle='rgba(255,60,60,.8)';c.lineWidth=2;const br=22,m=8;for(const[bx_,by_,sx,sy]of[[m,m,1,1],[W-m,m,-1,1],[m,W-m,1,-1],[W-m,W-m,-1,-1]]){c.beginPath();c.moveTo(bx_,by_+sy*br);c.lineTo(bx_,by_);c.lineTo(bx_+sx*br,by_);c.stroke()}
 c.fillStyle='rgba(255,70,70,.85)';c.font='12px monospace';c.fillText('25.06',W*.58,18);c.fillText('55.77',10,W*.34);c.fillText('23.5',W-48,W*.62);c.beginPath();c.moveTo(W-52,24);c.lineTo(W-44,16);c.lineTo(W-36,24);c.lineTo(W-44,32);c.closePath();c.stroke();c.fillStyle='rgba(255,255,255,.8)';c.fillText('N',W/2-3,16);
}
function drawMap(){
 if(mode==='Zombies'){if(sel.map===JUPITER_MAP)drawJovianDossier();return}
 const cv=$('#mapc'),c=cv.getContext('2d'),W=cv.width,M=MAPS[sel.map],k=W/(2*H);
 const X=x=>(x+H)*k,Z=z=>(z+H)*k;
 indexCollisions();
 if(!tacticalBase)tacticalBase=document.createElement('canvas');
 if(tacticalBase.width!==W||tacticalBase.height!==W){
  tacticalBase.width=tacticalBase.height=W;tacticalRevision=-1;
 }
 if(tacticalRevision!==collisionRevision){
  drawMapBase(tacticalBase.getContext('2d'),W,M,X,Z,k);tacticalRevision=collisionRevision;
 }
 c.drawImage(tacticalBase,0,0);
 const dot=(x,z,col,r)=>{c.fillStyle=col;c.beginPath();c.arc(X(x),Z(z),r,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=1;c.stroke()};
 for(const z of zones)dot(z.x,z.z,z.o=='A'?'#62a8ff':z.o=='B'?'#ff5a3a':'#ddd',Math.max(6,(z.r||5)*k));for(const f of flags)dot(f.x,f.z,f.team=='A'?'#62a8ff':'#ff5a3a',6);
 for(const b of bots)if(b.al&&(ally(b)||uav>0))dot(b.x,b.z,ally(b)?'#62e0f0':'#ff5a3a',4);
 for(const mark of ST.pings)dot(mark.m.position.x,mark.m.position.z,mark.color,6);
 /* you: the arrow points where you look (world forward is (-sin yaw, -cos yaw); the arrow tip is drawn pointing up, so it is rotated by -yaw) */
 c.save();c.translate(X(P.x),Z(P.z));c.rotate(-yaw);c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-10);c.lineTo(-6.5,8);c.lineTo(0,4);c.lineTo(6.5,8);c.closePath();c.fill();c.stroke();c.restore()}
/* ---------- keyboard + mouse ---------- */
function kbDown(e){if(jupiterIntroActive())return;const c=RB(e.code);if(['Space','Tab','AltLeft','F1','F3','F6','ControlLeft'].includes(c)||c.startsWith('Arrow'))e.preventDefault();key[c]=1;
 if(jovianInputBlocked()||zQuestCutActive()&&!['F1','F3','F6','KeyO'].includes(c)){key[c]=0;return}
 switch(c){
  case'Space':actJumpPress();break;
  case'ShiftLeft':if(!e.repeat){if(t0-ST.lastShift<.32&&ST.tacCd<=0)ST.tac=4;ST.lastShift=t0}break;
  case'KeyC':if(!e.repeat)actCrouch();break;case'ControlLeft':if(!e.repeat)actProne();break;case'AltLeft':ST.walk=1;break;
  case'KeyH':if(!e.repeat)ST.auto=ST.auto?0:1;break;
  case'KeyR':startRel();break;case'KeyV':if(!e.repeat)mvDown();break;case'KeyY':if(!e.repeat&&typeof actInspect=='function')actInspect();break;case'KeyE':if(!e.repeat)throwG();break;case'KeyQ':if(!e.repeat)actTactical();break;
  case'KeyF':if(!e.repeat)actInteract();break;case'KeyT':if(!e.repeat)actMount();break;case'KeyB':if(!e.repeat)actFireMode();break;
  case'KeyX':if(!e.repeat)actField();break;
  case'Digit1':actSwapNext();break;case'Digit2':actSwapPrev();break;
  case'Digit3':useStreak(0);break;case'Digit4':useStreak(1);break;case'Digit5':useStreak(2);break;case'Digit6':useStreak(3);break;
  case'Tab':if(!e.repeat)actSb(1);break;case'KeyM':case'CapsLock':if(!e.repeat)actMap();break;case'KeyN':if(!e.repeat)actNV();break;
  case'F1':case'F3':case'F6':case'KeyO':paused=1;trig=0;showPause();if(document.exitPointerLock)document.exitPointerLock();break}}
addEventListener('keyup',e=>{const c=RB(e.code);if(c=='KeyV')mvUp();if(c=='Tab'){actSb(0)}if(c=='AltLeft')ST.walk=0});
addEventListener('mousedown',e=>{if(!run||paused||over)return;if(e.button==2){actAds(1)}else if(e.button==1){e.preventDefault();actPing()}else if(e.button==3){e.preventDefault();mvDown()}else if(e.button==4){e.preventDefault();actMount()}});
addEventListener('mouseup',e=>{if(e.button==2)actAds(0);if(e.button==3)mvUp()});
addEventListener('wheel',e=>{if(!run||paused||over||jupiterIntroActive())return;if(e.deltaY>0)actSwapNext();else if(e.deltaY<0)actSwapPrev()},{passive:true});
addEventListener('keydown',event=>{
 if(!run||over||jovianPointerFree()||event.code!=='Escape'||event.defaultPrevented)return;
 event.preventDefault();
 if(event.repeat||paused)return;
 pausePad();
 if(document.pointerLockElement===R.domElement)document.exitPointerLock?.();
});
/* menu hot keys while no match is running */
addEventListener('keydown',e=>{
 if(run||$('#mods-panel').open||$('#menu').style.display!=='block')return;
 switch(e.code){
  case 'Escape':if(!e.defaultPrevented){e.preventDefault();menuBack()}break;
  case 'F1':e.preventDefault();goHome();break;
  case 'F3':e.preventDefault();openMenuPanel('set');break;
  case 'F6':e.preventDefault();openMenuPanel(app==='zm'?'cust':'load');break;
  case 'KeyO':if(!e.target.closest('input,textarea,select,[contenteditable]'))openMenuPanel('priv');break;
 }
});

/* ---------- Katana: the melee weapon. Hand-built model: single-edged curved blade with a raised ridge line, fuller grooves, a wavy temper line and a pointed tip, gold collar and washers,
   an iron guard with gold studs, a cord-wrapped grip over ray skin with a diamond wrap and ornaments, a gold collar and pommel cap and a red tassel ---------- */
var kat={t:0};
function buildKatana(){const g=new THREE.Group(),L=.7,w=.034,t=.0075,sori=.03,ph=(c,s)=>new THREE.MeshPhongMaterial({color:c,shininess:s,specular:0xffffff}),
 steel=ph(0xcfd6de,140),ridge=ph(0xe4eaf0,200),temper=ph(0xf8fbff,220),groove=new THREE.MeshLambertMaterial({color:0x4a525c}),gold=ph(0xc9a94d,70),iron=ph(0x2a2a30,40),white=new THREE.MeshLambertMaterial({color:0xe6e0d0}),wrap=new THREE.MeshLambertMaterial({color:0x14161a}),red=new THREE.MeshLambertMaterial({color:0x8a1414}),
 cv=y=>sori*Math.pow(y/L,2),N=16,
 ext=(pts,m,th)=>{const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const e=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false}),m);e.position.z=-th/2;return e},
 edge=y=>cv(y)+w*(1-.07*(y/L));
 const body=[[0,0]];for(let i=1;i<=N;i++){const y=L*i/N;body.push([cv(y),y])}body.push([cv(L)+w*.5,L+.048],[edge(L)-.004,L-.014]);for(let i=N;i>=0;i--){const y=L*i/N;body.push([edge(y),y])}
 const blade=new THREE.Group();blade.add(ext(body,steel,t));
 const rg=[];for(let i=0;i<=N;i++){const y=.01+(L-.1)*i/N;rg.push([cv(y)+w*.36,y])}for(let i=N;i>=0;i--){const y=.01+(L-.1)*i/N;rg.push([cv(y)+w*.4,y])}blade.add(ext(rg,ridge,t*1.3));
 {const gr=[];for(let i=0;i<=8;i++){const y=.07+(L-.2)*i/8;gr.push([cv(y)+.007,y])}for(let i=8;i>=0;i--){const y=.07+(L-.2)*i/8;gr.push([cv(y)+.013,y])}blade.add(ext(gr,groove,t*1.06))}
 const hm=[];for(let i=0;i<=40;i++){const y=.03+(L-.02)*i/40;hm.push([edge(y)-w*.42-.004*Math.sin(y*85)-.003*Math.sin(y*37),y])}for(let i=40;i>=0;i--){const y=.03+(L-.02)*i/40;hm.push([edge(y)-.0008,y])}blade.add(ext(hm,temper,t*1.04));
 blade.position.x=-w/2;g.add(blade);
 const cyl=(r1,r2,h,m,y,sz)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,18),m);e.position.y=y;e.scale.z=sz||1;g.add(e);return e},bx_=(a,b,c,m,x,y,z,rx,ry,rz)=>{const e=new THREE.Mesh(bg,m);e.scale.set(a,b,c);e.position.set(x,y,z);e.rotation.set(rx||0,ry||0,rz||0);g.add(e);return e};
 bx_(w+.006,.022,t+.009,gold,0,.009,0);bx_(w+.012,.004,t+.012,gold,0,.021,0);cyl(.0305,.0305,.004,gold,-.003,1.1).scale.x=1.4;cyl(.0305,.0305,.004,gold,-.0095,1.1).scale.x=1.4;
 cyl(.054,.054,.006,iron,-.015,1);const rim=new THREE.Mesh(new THREE.TorusGeometry(.054,.0035,8,32),iron);rim.rotation.x=Math.PI/2;rim.position.y=-.015;g.add(rim);const inner=new THREE.Mesh(new THREE.TorusGeometry(.038,.0016,6,32),gold);inner.rotation.x=Math.PI/2;inner.position.y=-.0115;g.add(inner);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const s=new THREE.Mesh(new THREE.SphereGeometry(.0055,8,6),gold);s.position.set(Math.cos(a)*.044,-.0115,Math.sin(a)*.044);g.add(s)}
 cyl(.0195,.0195,.016,gold,-.027,.8);
 cyl(.0165,.0155,.27,white,-.165,.8);
 for(let i=0;i<11;i++)cyl(.0172,.0172,.011,wrap,-.044-i*.0215,.8);
 for(let i=0;i<10;i++){for(const sd of[1,-1]){bx_(.0032,.03,.0035,wrap,-.0035,-.052-i*.0215,sd*.0142,0,0,.62);bx_(.0032,.03,.0035,wrap,.0035,-.052-i*.0215,sd*.0142,0,0,-.62)}}
 for(const sd of[1,-1]){bx_(.012,.017,.004,gold,0,-.1,sd*.0148);bx_(.012,.017,.004,gold,0,-.176,sd*.0148);bx_(.006,.008,.0045,gold,0,-.1,sd*.0148)}
 cyl(.0188,.0178,.016,gold,-.3,.8);cyl(.0085,.0085,.018,iron,-.3,.8);const kn=new THREE.Mesh(new THREE.SphereGeometry(.007,8,6),red);kn.position.set(0,-.31,.012);g.add(kn);bx_(.006,.05,.004,red,0,-.338,.012,0,0,.1);bx_(.005,.04,.004,red,.004,-.34,.012,0,0,-.12);
 g.visible=false;return g}
var katG=buildKatana();C.add(katG);
const katReady={p:0,x:.172,y:-.108,z:-.62,rx:-1.00,ry:.12,rz:-.62};
const katMotion=[
 katReady,
 {p:.24,x:.31,y:.044,z:-.45,rx:-.83,ry:.39,rz:-1.38},
 {p:.43,x:.08,y:-.078,z:-.77,rx:-1.35,ry:-.12,rz:.26},
 {p:.55,x:-.24,y:-.205,z:-.68,rx:-1.28,ry:-.38,rz:1.26},
 {p:.67,x:-.20,y:-.247,z:-.59,rx:-1.08,ry:-.24,rz:1.03},
 {...katReady,p:1}
];
function katSwing(){kat.t=.5;kat.hit=0}
function katTick(dt){
 if(xrS||ST.nvv){katG.visible=false;return}
 katG.visible=kat.t>0||(MV.draw>.03&&melName()==='Katana');
 if(!katG.visible)return;
 if(kat.t>0){
  kat.t=Math.max(0,kat.t-dt);
  const phase=1-kat.t/.5;
  const end=katMotion.findIndex(p=>p.p>=phase&&p.p>0);
  const start=katMotion[end-1],target=katMotion[end];
  const u=cl((phase-start.p)/(target.p-start.p),0,1);
  const weight=phase>.24&&phase<.55?u:eas(u);
  const move=key=>start[key]+(target[key]-start[key])*weight;
  katG.position.set(move('x'),move('y'),move('z'));
  katG.rotation.set(move('rx'),move('ry'),move('rz'));
 }else{
  const draw=eas(MV.draw),late=1-draw,wave=Math.sin(t0*1.7),stride=Math.sin(bobP)*viewMotion.pace;
  katG.position.set(katReady.x+late*.15+stride*.008,katReady.y-late*.45+wave*.009,katReady.z+late*.12);
  katG.rotation.set(katReady.rx-late*.55+wave*.015,katReady.ry+late*.40,katReady.rz+late*.71+stride*.017);
 }
}
;
/* ######## input.js ######## */
/* ===================== input.js ===================== */
/* ---------- gamepad + WebXR VR: the same actions as keyboard and mouse (see controls.js), full menu navigation with the controller (spatial focus + on-screen keyboard)
   and menus inside the headset (the DOM menus are mirrored onto a panel you point at with the right controller) ---------- */
var usingPad=false,gpEdge={},gpT=0,gpSprint=0,gpTrig=0,vrMode=0,xrS=null,xrRig=null,rigYaw=0,xrCtl=[],xrGunIn=0,xrSnap=0,xrWrist=null,xrWristT=0,xrEye=null,gpHS={},gpPend={};
var QUEST=/OculusBrowser|Quest/i.test(navigator.userAgent||'');
try{vrMode=localStorage.getItem('sd-vr');vrMode=vrMode==null?(QUEST?1:0):+vrMode}catch(e){}
var gpBtn=(g,i)=>!!(g.buttons[i]&&g.buttons[i].pressed),gpVal=(g,i)=>g&&g.buttons[i]?g.buttons[i].value:0,gpDz=(v,d)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d);
function gpGet(){const l=navigator.getGamepads?navigator.getGamepads():[];if(window.SD_SPLIT){const g=l[window.SD_SPLIT.pad];return g?.connected?g:null}for(const g of l)if(g&&g.connected&&g.axes.length>=4)return g;return null}
var gpEdgeOf=(k,on)=>{const r=on&&!gpEdge[k];gpEdge[k]=on;return r};
/* tap / hold buttons */
function holdBtn(id,on,dt,tap,hold,thr){thr=thr||.35;const h=gpHS[id]||(gpHS[id]={t:0,d:0,on:0});if(on){if(!h.on){h.on=1;h.t=0;h.d=0}h.t+=dt;if(!h.d&&h.t>=thr){h.d=1;hold&&hold()}}else if(h.on){h.on=0;if(!h.d&&tap)tap()}return h.on&&h.d}
var inMatch=()=>run&&!paused&&!over&&!(typeof fin!='undefined'&&fin);
function pausePad(){if(!run||over)return;paused=1;trig=0;gpTrig=0;gpSprint=0;actAds(0);showPause()}
function resumePad(){paused=0;hidePause();if(xrS||window.SD_SPLIT)return;try{const p=R.domElement.requestPointerLock&&R.domElement.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
var resumeAny=()=>{if(vrMode&&navigator.xr&&!xrS)$('#resume').click();else resumePad()};
/* ---------- shared "both bumpers = field upgrade" logic: single bumper actions fire after a short delay unless the other bumper joins ---------- */
function bumpers(dt,lb,rb,tactical,lethal,field){const e1=gpEdgeOf('bl',lb),e2=gpEdgeOf('br',rb);if((e1||e2)&&lb&&rb){field();gpPend.l=gpPend.r=0;gpPend.combo=1}else{if(e1)gpPend.l=.09;if(e2)gpPend.r=.09}
 if(!lb&&!rb)gpPend.combo=0;for(const k of['l','r'])if(gpPend[k]>0){gpPend[k]-=dt;if(gpPend[k]<=0&&!gpPend.combo)(k=='l'?tactical:lethal)()}}
/* ---------- controller in a match ---------- */
function padPlay(g,dt){const lx=gpDz(g.axes[0],.2),ly=gpDz(g.axes[1],.2),rx=gpDz(g.axes[2],.14),ry=gpDz(g.axes[3],.14);
 key.KeyA=lx<-.2;key.KeyD=lx>.2;key.KeyW=ly<-.2;key.KeyS=ly>.2;if(key.KeyS)ST.auto=0;
 {const l3=gpBtn(g,10);if(gpEdgeOf('l3',l3)){if(ST.ads>.4)actSteady();else{if(t0-ST.lastShift<.32&&ST.tacCd<=0)ST.tac=4;ST.lastShift=t0}}gpSprint=(l3&&ST.ads<=.4)?1:0}key.ShiftLeft=!!gpSprint;
 const cv=v=>Math.sign(v)*Math.pow(Math.abs(v),1.7);yaw-=cv(rx)*dt*3.4*sens*fr;pitch=cl(pitch-cv(ry)*dt*2.5*sens*fr,-1.45,1.45);
 const dw=cw()&&cw().dual&&!MV.eq,lt0=gpVal(g,6)>.4,lt=dw?false:lt0;DS.L=dw&&lt0;DS.R=dw&&gpVal(g,7)>.35;actAds(lt);const rt=dw?(DS.L||DS.R):gpVal(g,7)>.35;if(rt&&!gpTrig){gpTrig=1;trig=1;fresh=1}else if(!rt&&gpTrig){gpTrig=0;trig=0}
 key.Space=gpBtn(g,0);if(gpEdgeOf('a',key.Space))actJumpPress();
 holdBtn('b',gpBtn(g,1),dt,actCrouch,actProne,.4);
 const xh=holdBtn('x',gpBtn(g,2),dt,startRel,actInteract,.35);key.KeyF=!!xh;
 holdBtn('y',gpBtn(g,3),dt,actSwapNext,null,.5);
 bumpers(dt,gpBtn(g,4),gpBtn(g,5),actTactical,throwG,actField);
 {const r3=gpBtn(g,11);if(r3&&!PG.r3){if(lt)actMount();else mvDown()}else if(!r3&&PG.r3&&MV.down)mvUp();PG.r3=r3}
 if(gpEdgeOf('du',gpBtn(g,12)))actPing();holdBtn('dd',gpBtn(g,13),dt,actInv,actNV,.5);if(gpEdgeOf('dl',gpBtn(g,14)))actFireMode();if(gpEdgeOf('dr',gpBtn(g,15)))useStreak(0);
 holdBtn('v',gpBtn(g,8),dt,actMap,()=>actSb(1),.3);if(!gpBtn(g,8)&&ST.sbOn&&gpHS.v&&!gpHS.v.on)actSb(0);
 if(gpEdgeOf('st',gpBtn(g,9)))pausePad()}
/* ---------- menus with the controller: spatial focus, A press, B back, left/right changes drop-downs and sliders ---------- */
var vis=e=>e.getClientRects().length>0&&e.getBoundingClientRect().width>1;
function menuBox(){return['#osk','#mods-panel[open]','#game-party[open]','#dev','#pause','#end','#fin.s-board:not(.blk) #fbd','#home','#menu'].map(s=>document.querySelector(s)).find(c=>c&&vis(c)&&getComputedStyle(c).display!='none')}
function clickables(box){
 const scope=box.id==='menu'?['.menu-header','#menu .pn.on'].map($).filter(Boolean):[box];
 return scope.flatMap(node=>[...node.querySelectorAll('button,select,input,textarea,a[href],summary,[role="button"]')]
  .filter(e=>!e.disabled&&!e.closest('[hidden]')&&vis(e)));
}
function spatial(els,cur,dx,dy){const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bs=1e9;for(const e of els){if(e===cur)continue;const q=e.getBoundingClientRect(),vx=q.left+q.width/2-cx,vy=q.top+q.height/2-cy,along=vx*dx+vy*dy;if(along<=2)continue;const s=along+Math.abs(vx*dy-vy*dx)*2.2;if(s<bs){bs=s;best=e}}return best}
function menuAct(el,back){const t=el.tagName;if(t=='SELECT'){el.selectedIndex=(el.selectedIndex+(back?el.options.length-1:1))%el.options.length;el.dispatchEvent(new Event('change',{bubbles:true}))}else if(t=='INPUT'&&el.type=='range'){}else if((t=='INPUT'&&el.type!='checkbox'&&el.type!='range')||t=='TEXTAREA'&&!el.readOnly)openOSK(el);else if(el.id=='resume')resumeAny();else el.click()}
let splitMenuFocus=null;
if(window.SD_SPLIT)addEventListener('focusin',event=>{
 splitMenuFocus?.removeAttribute('data-split-focus');splitMenuFocus=event.target;
 splitMenuFocus.setAttribute('data-split-focus','');
});
function menuNav(g,dt){
 const skipPressed=gpEdgeOf('fin-skip',gpBtn(g,9));
 if(fin){
  if(skipPressed&&skipPodium())return;
  if(fs==='pod'){
   for(let i=0;i<4;i++)if(gpEdgeOf('fe'+i,gpBtn(g,i)))myEmote(i);
   return;
  }
  if(fs!=='board')return;
 }
 const box=menuBox();if(!box)return;
 const OK=PG.type=='ns'?1:0,BK=PG.type=='ns'?0:1;/* Nintendo layout: the right-hand button (A) confirms, the bottom one (B) goes back */
 const up=gpBtn(g,12)||g.axes[1]<-.6,dn=gpBtn(g,13)||g.axes[1]>.6,lf=gpBtn(g,14)||g.axes[0]<-.6,rt=gpBtn(g,15)||g.axes[0]>.6;
 const enabled=el=>el&&box.contains(el)&&el!==box&&!el.disabled&&!el.closest('[hidden]')&&vis(el);
 const focused=enabled(document.activeElement)?document.activeElement:splitMenuFocus;
 let cur=enabled(focused)?focused:null;
 const els=!cur||up||dn||lf||rt?clickables(box):[cur];
 if(!els.length)return;
 if(!cur){cur=els.find(e=>e.matches('#resume,[data-initial-focus],#zdeploy'))||els[0];cur.focus()}gpT-=dt;
 if(!(up||dn||lf||rt)){gpT=0;PG.rep=0}
 if((up||dn||lf||rt)&&gpT<=0){PG.rep=(PG.rep||0)+1;gpT=PG.rep>5?.06:.2;const isSel=cur.tagName=='SELECT',isRng=cur.type=='range';
  if((lf||rt)&&(isSel||isRng)){if(isSel){cur.selectedIndex=cl(cur.selectedIndex+(rt?1:-1),0,cur.options.length-1);cur.dispatchEvent(new Event('change',{bubbles:true}))}else{const s=(+cur.step||1)*(PG.rep>5?3:1);cur.value=+cur.value+(rt?s:-s);cur.dispatchEvent(new Event('input',{bubbles:true}));cur.dispatchEvent(new Event('change',{bubbles:true}))}}
  else{let n=spatial(els,cur,lf?-1:rt?1:0,up?-1:dn?1:0);
   /* nothing lies in that direction: fall back to the next or previous control in page order, so nothing is ever out of reach */
   if(!n){const i=els.indexOf(cur);n=els[(i+((dn||rt)?1:-1)+els.length)%els.length]}
   if(n){n.focus();n.scrollIntoView({block:'nearest',inline:'nearest'})}}}
 /* LB / RB: previous / next loadout slot, or previous / next main menu tab */
 {const lb=gpEdgeOf('mlb',gpBtn(g,4)),rb=gpEdgeOf('mrb',gpBtn(g,5));if((lb||rb)&&box.id!='osk'){const tabs=[...box.querySelectorAll('.lo-tabs .lt')].filter(vis),nav=box.id=='menu'?[...document.querySelectorAll('#nav button')].filter(b=>vis(b)&&b.id!='back'):[],list=tabs.length?tabs:nav;
   if(list.length){let i=list.findIndex(b=>b.classList.contains('on')||b.classList.contains('act')||b.classList.contains('sel'));if(i<0)i=list.indexOf(document.activeElement);if(i<0)i=PG.tabI||0;i=(i+(rb?1:-1)+list.length)%list.length;PG.tabI=i;list[i].click();if(!tabs.length&&vis(list[i]))list[i].focus()}}}
 if(box.id=='osk'){const k=c=>{const b=box.querySelector('[data-k="'+c+'"]');b&&b.click()};if(gpEdgeOf('ox',gpBtn(g,2)))k('⌫');if(gpEdgeOf('oy',gpBtn(g,3)))k(' ');if(gpEdgeOf('os',gpBtn(g,9)))k('OK')}
 if(gpEdgeOf('a',gpBtn(g,OK)))menuAct(document.activeElement&&els.includes(document.activeElement)?document.activeElement:cur);
 if(gpEdgeOf('b',gpBtn(g,BK))){if(box.id=='osk')closeOSK();else if(box.id==='game-party'||box.id==='mods-panel')box.close();else if(box.id=='pause')resumeAny();else if(box.id==='menu')menuBack();else{const t=$('#tomenu');if(t&&vis(t))t.click()}}
 if(gpEdgeOf('st',gpBtn(g,9))&&box.id=='pause')resumeAny()}
/* ---------- on-screen keyboard (used by controller and VR for the name and match code boxes) ---------- */
var oskT=null;
function openOSK(inp){const o=$('#osk');if(!o.dataset.b){o.dataset.b=1;const rows=['1234567890','QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];o.innerHTML=rows.map(r=>'<div class="r">'+[...r].map(c=>`<button data-k="${c}">${c}</button>`).join('')+'</div>').join('')+'<div class="r"><button data-k="-">-</button><button data-k=" " style="min-width:200px">space</button><button data-k="⌫">⌫</button><button data-k="OK" style="min-width:90px">Done</button></div>';
  o.onclick=e=>{const b=e.target.closest('button');if(!b||!oskT)return;const k=b.dataset.k;if(k=='OK')return closeOSK();let v=oskT.value;if(k=='⌫')v=v.slice(0,-1);else if(!oskT.maxLength||oskT.maxLength<0||v.length<oskT.maxLength)v+=(oskT.matches('#jc,#party-join-code')?k:(v.length?k.toLowerCase():k));oskT.value=v;oskT.dispatchEvent(new Event('input',{bubbles:true}));oskT.dispatchEvent(new Event('change',{bubbles:true}))}}
 const dialog=inp.closest('dialog[open]');if(dialog)dialog.append(o);
 oskT=inp;o.style.display='block';const f=o.querySelector('button');f&&f.focus()}
function closeOSK(){const o=$('#osk');o.style.display='none';if(o.parentElement!==document.body)document.body.append(o);if(oskT&&vis(oskT))oskT.focus({preventScroll:true});oskT=null}
function inputTick(dt){if(document.hidden||run&&jupiterIntroActive())return;if(xrS){vrPre(dt);return}
 const g=gpGet();if(!g){
  if(window.SD_SPLIT){
   for(const k of ['KeyW','KeyA','KeyS','KeyD','ShiftLeft','Space','KeyF'])key[k]=false;
   gpTrig=trig=0;if(ST.adsIn)actAds(0);
  }else if(usingPad&&gpTrig){gpTrig=0;trig=0}
  return;
 }
 const any=g.buttons.some(b=>b.pressed)||g.axes.some(a=>Math.abs(a)>.5);
 PG.sync(g,any);if(window.SD_SPLIT&&!usingPad)PG.setOn(true);
 if(!usingPad)return;if(inMatch())padPlay(g,dt);else{if(gpTrig){gpTrig=0;trig=0}if(ST.adsIn)actAds(0);menuNav(g,dt)}}
addEventListener('gamepadconnected',e=>{if(!window.SD_SPLIT||e.gamepad.index===window.SD_SPLIT.pad)PG.sync(e.gamepad,true)});
addEventListener('gamepaddisconnected',()=>{
 if(gpGet())return;
 if(usingPad)releaseArenaInput();
 PG.setOn(false);
});

function releaseArenaInput(){
 for(const code in key)key[code]=false;
 trig=fresh=gpTrig=gpSprint=0;
 gpHS={};gpPend={};
 if(typeof DS!=='undefined')DS.L=DS.R=false;
 if(typeof MV!=='undefined')MV.down=0;
 ST.auto=ST.walk=0;
 actAds(0);
 if(ST.sbOn)actSb(0);
 if(st.id!==null)stickEnd();
 lk.id=fi.id=null;
 for(const button of Object.values(bt))button.classList.remove('on');
 bt={};
}
addEventListener('blur',releaseArenaInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseArenaInput()});
/* ---------------- VR ---------------- */
if(R.xr)xrCtl=[0,1].map(i=>{const c=R.xr.getController(i);c.addEventListener('connected',e=>{c.userData.hand=e.data.handedness;c.userData.gp=e.data.gamepad});c.addEventListener('disconnected',()=>{c.userData.hand=null;c.userData.gp=null});return c});
var vrHand=h=>xrCtl.find(c=>c.userData.hand==h)||null;
function vrPanel(){const c=document.createElement('canvas');c.width=256;c.height=160;const t=new THREE.CanvasTexture(c),m=new THREE.Mesh(new THREE.PlaneGeometry(.16,.1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false}));m.renderOrder=999;m.position.set(0,.03,.08);m.rotation.x=-1.1;return{m,c,g:c.getContext('2d'),t}}
/* menu panel: a big canvas that mirrors whatever DOM menu is showing; the right controller is a laser pointer */
var vm=null,vmT=0,vmHover=null,vmLatch=null;
function vrMenuInit(){const cv=document.createElement('canvas');cv.width=1280;cv.height=Math.round(1280*innerHeight/innerWidth);const tex=new THREE.CanvasTexture(cv),w=2.0,h=w*innerHeight/innerWidth,mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthTest:false}));mesh.renderOrder=900;
 const dot=new THREE.Mesh(new THREE.SphereGeometry(.012,8,8),new THREE.MeshBasicMaterial({color:0x62e0f0,depthTest:false}));dot.renderOrder=999;const ray=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,1,6),new THREE.MeshBasicMaterial({color:0x62e0f0,depthTest:false}));ray.renderOrder=999;
 vm={cv,c:cv.getContext('2d'),tex,mesh,dot,ray,w,h,ray_:new THREE.Raycaster(),placed:false}}
function vrMenuPlace(){const cam=R.xr.getCamera(C);cam.updateMatrixWorld(true);const p=new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld),d=new THREE.Vector3(0,0,-1).transformDirection(cam.matrixWorld);d.y=0;if(d.length()<.1)d.set(0,0,-1);d.normalize();
 /* 1.5 m in front of the eyes, centred on eye height; the plane's front (+z) is turned towards the player */
 vm.mesh.position.set(p.x+d.x*1.5,p.y-.05,p.z+d.z*1.5);vm.mesh.rotation.set(0,Math.atan2(p.x-vm.mesh.position.x,p.z-vm.mesh.position.z),0);vm.mesh.updateMatrixWorld(true);vm.placed=true}
function wrapText(c,t,x,y,mw,lh){const ws=t.split(/\s+/);let l='';for(const w of ws){const n=l?l+' '+w:w;if(c.measureText(n).width>mw&&l){c.fillText(l,x,y);y+=lh;l=w}else l=n}if(l)c.fillText(l,x,y);return y}
function vrMirror(box){const c=vm.c,sc=vm.cv.width/innerWidth;c.clearRect(0,0,vm.cv.width,vm.cv.height);c.fillStyle='rgba(6,14,20,.94)';c.fillRect(0,0,vm.cv.width,vm.cv.height);
 for(const e of[box,...box.querySelectorAll('*')]){if(!vis(e))continue;const r=e.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;const cs=getComputedStyle(e);if(cs.visibility=='hidden'||cs.opacity==0)continue;const x=r.left*sc,y=r.top*sc,w=r.width*sc,h=r.height*sc;
  const bg=cs.backgroundColor;if(bg&&!/rgba?\(0, 0, 0, 0\)|transparent/.test(bg)){c.fillStyle=bg;c.fillRect(x,y,w,h)}
  if(parseFloat(cs.borderTopWidth)>0&&cs.borderTopStyle!='none'){c.strokeStyle=cs.borderTopColor;c.lineWidth=Math.max(1,parseFloat(cs.borderTopWidth)*sc);c.strokeRect(x,y,w,h)}
  if(e===vmHover&&(e.tagName=='BUTTON'||e.onclick||cs.cursor=='pointer'||e.tagName=='SELECT'||e.tagName=='INPUT')){c.strokeStyle='#62e0f0';c.lineWidth=3;c.strokeRect(x-1,y-1,w+2,h+2)}
  let txt='';if(e.tagName=='SELECT')txt=e.options[e.selectedIndex]?e.options[e.selectedIndex].text:'';else if(e.tagName=='INPUT'&&e.type=='range'){const f=(e.value-e.min)/(e.max-e.min);c.fillStyle='#345';c.fillRect(x,y+h/2-3,w,6);c.fillStyle='#62e0f0';c.fillRect(x,y+h/2-3,w*f,6);c.fillRect(x+w*f-5,y+h/2-9,10,18)}else if(e.tagName=='INPUT'||e.tagName=='TEXTAREA')txt=e.value||e.placeholder;else txt=[...e.childNodes].filter(n=>n.nodeType==3).map(n=>n.textContent.trim()).filter(Boolean).join(' ');
  if(txt){const fs=Math.max(10,parseFloat(cs.fontSize)*sc);c.font=`${cs.fontWeight>=600?'700':'500'} ${fs}px Rajdhani,Teko,sans-serif`;c.fillStyle=cs.color;c.textBaseline='top';if(cs.textTransform=='uppercase')txt=txt.toUpperCase();
   const ctr=cs.textAlign=='center'||e.tagName=='BUTTON'||e.tagName=='SELECT'||(cs.display.includes('flex')&&cs.justifyContent=='center');c.textAlign=ctr?'center':'left';const tx=ctr?x+w/2:x+parseFloat(cs.paddingLeft)*sc;
   if(e.tagName=='BUTTON'||e.tagName=='SELECT'||e.tagName=='INPUT'){c.textBaseline='middle';c.fillText(txt,tx,y+h/2,w)}else wrapText(c,txt,tx,y+parseFloat(cs.paddingTop)*sc,Math.max(20,w-parseFloat(cs.paddingLeft)*sc*2),fs*1.15)}}
 vm.tex.needsUpdate=true}
function vrMenu(dt,gr,gl){const box=menuBox();if(!vm)vrMenuInit();const rh=vrHand('right')||vrHand('left');
 if(!box){if(vm.mesh.parent)vm.mesh.parent.remove(vm.mesh);for(const o of[vm.dot,vm.ray])if(o.parent)o.parent.remove(o);vm.placed=false;return}
 if(!vm.mesh.parent){S.add(vm.mesh);S.add(vm.dot);S.add(vm.ray);vm.placeN=6}
 if(!vm.placed||vm.placeN-->0)vrMenuPlace();vmT-=dt;
 let hit=null;if(rh){xrRig.updateMatrixWorld(true);const m=new THREE.Matrix4().multiplyMatrices(xrRig.matrixWorld,rh.matrix),o=new THREE.Vector3().setFromMatrixPosition(m),d=new THREE.Vector3(0,0,-1).transformDirection(m);vm.ray_.set(o,d);vm.mesh.updateMatrixWorld(true);const h=vm.ray_.intersectObject(vm.mesh)[0];
  vm.ray.position.copy(o).addScaledVector(d,(h?h.distance:3)/2);vm.ray.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);vm.ray.scale.set(1,h?h.distance:3,1);
  if(h){hit=h;vm.dot.visible=true;vm.dot.position.copy(h.point)}else vm.dot.visible=false}
 let px=-1,py=-1,el=null;if(hit){px=hit.uv.x*innerWidth;py=(1-hit.uv.y)*innerHeight;el=document.elementFromPoint(px,py);el=el&&(el.closest('button,select,input,textarea,label,[onclick]')||(getComputedStyle(el).cursor=='pointer'?el:el.closest('*')))}
 if(el!==vmHover){vmHover=el;vmT=0}
 const trg=gpVal(gr,0)>.5||gpVal(gl,0)>.5,grip=gpVal(gr,1)>.5;
 if(gpEdgeOf('vmt',trg)&&el&&box.contains(el)){if(el.tagName=='INPUT'&&el.type=='range'){const r=el.getBoundingClientRect(),f=cl((px-r.left)/r.width,0,1),s=+el.step||1;el.value=Math.round((+el.min+(el.max-el.min)*f)/s)*s;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}else menuAct(el,false)}
 if(gpEdgeOf('vmg',grip)&&el&&el.tagName=='SELECT')menuAct(el,true);
 const sy=gr?gpDz(gr.axes[3]||0,.25):0;if(sy){let s=el;while(s&&s!==document.body){if(s.scrollHeight>s.clientHeight+4&&/auto|scroll/.test(getComputedStyle(s).overflowY)){s.scrollTop+=sy*500*dt;break}s=s.parentElement}}
 if(gpEdgeOf('vmb',b4(gl,5)||b4(gr,5))){if(box.id=='osk')closeOSK();else if(box.id=='pause')resumeAny();else{const b=$('#back');if(b&&vis(b))b.click()}}
 if(vmT<=0){vmT=.25;vrMirror(box)}}
var b4=(g,i)=>!!(g&&g.buttons[i]&&g.buttons[i].pressed);
function vrMenuClear(){if(vm){for(const o of[vm.mesh,vm.dot,vm.ray])if(o&&o.parent)o.parent.remove(o);vm.placed=false;vmHover=null}}
function vrStart(){vrMenuClear();xrRig=xrRig||(()=>{const r=new THREE.Group();S.add(r);return r})();S.remove(C);xrRig.add(C);rigYaw=yaw;for(const c of xrCtl)xrRig.add(c);xrGunIn=0;xrSnap=0;sun.castShadow=false;xrWrist=vrPanel();vmLatch=null;R.setAnimationLoop(gameFrame)}
function vrEnd(){R.setAnimationLoop(null);xrS=null;if(xrRig){xrRig.remove(C);S.add(C);for(const c of xrCtl)xrRig.remove(c);if(vm){for(const o of[vm.mesh,vm.dot,vm.ray])if(o.parent)o.parent.remove(o);vm.placed=false}}C.add(gun);gun.position.copy(FP_REST);gun.rotation.set(0,0,0);if(xrWrist&&xrWrist.m.parent)xrWrist.m.parent.remove(xrWrist.m);xrWrist=null;sun.castShadow=gfxQ=='high';C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();trig=0;gpTrig=0;for(const k in key)key[k]=false;if(run&&!over&&!paused)pausePad()}
function vrPre(dt){const rh=vrHand('right'),lh=vrHand('left'),gr=rh&&rh.userData.gp,gl=lh&&lh.userData.gp;
 if(!inMatch()){ /* menus, pause, podium: the rig floats at the camera the menu uses, controllers become a laser pointer */
  for(const k in key)key[k]=false;trig=0;gpTrig=0;actAds(0);const _fin=typeof fin!='undefined'&&fin,_kind=_fin?2:run?1:0;
  /* main menu: stand still at a fixed aerial spot facing the arena (the desktop menu camera orbits, which in VR made the player drift away from the menu panel); podium: follow the podium camera; pause: stay where the match was */
  if(!vmLatch||_fin||vmLatch.k!==_kind){if(_kind==0){const r=H*.75;vmLatch=new THREE.Vector3(Math.cos(ma)*r,Math.max(0,11-1.6),Math.sin(ma)*r);vmLatch.face=Math.atan2(vmLatch.x,vmLatch.z)}else{vmLatch=C.position.clone();vmLatch.y=Math.max(0,vmLatch.y-1.6);vmLatch.face=null}vmLatch.k=_kind;if(vm)vm.placed=false}
  xrRig.position.copy(vmLatch);xrRig.rotation.y=_fin?0:(vmLatch.face!=null?vmLatch.face:rigYaw);vrMenu(dt,gr,gl);return}
 if(vm&&vm.mesh.parent){vm.mesh.parent.remove(vm.mesh);vm.dot.parent&&vm.dot.parent.remove(vm.dot);vm.ray.parent&&vm.ray.parent.remove(vm.ray);vm.placed=false}vmLatch=null;
 xrRig.position.set(P.x,P.y||0,P.z);xrRig.rotation.y=rigYaw;xrRig.updateMatrixWorld(true);
 if(rh){const m=new THREE.Matrix4().multiplyMatrices(xrRig.matrixWorld,rh.matrix),d=new THREE.Vector3(0,0,-1).transformDirection(m);yaw=Math.atan2(-d.x,-d.z);pitch=cl(Math.asin(Math.max(-1,Math.min(1,d.y))),-1.45,1.45)}
 const lx=gl?gpDz(gl.axes[2]||0,.25):0,ly=gl?gpDz(gl.axes[3]||0,.25):0;key.KeyA=lx<-.2;key.KeyD=lx>.2;key.KeyW=ly<-.2;key.KeyS=ly>.2;if(key.KeyS)ST.auto=0;
 {const lsc=!!gl&&!!b4(gl,3);if(gpEdgeOf('lsc',lsc)){if(t0-ST.lastShift<.32&&ST.tacCd<=0)ST.tac=4;ST.lastShift=t0}gpSprint=lsc?1:0}key.ShiftLeft=!!gpSprint;
 const tx=gr?gr.axes[2]||0:0,ty=gr?gr.axes[3]||0:0;if(Math.abs(tx)>.7){if(!xrSnap){rigYaw-=Math.sign(tx)*Math.PI/6;xrSnap=1}}else xrSnap=0;
 if(gpEdgeOf('vru',ty<-.8))actPing();if(gpEdgeOf('vrd',ty>.8))actFireMode();
 const rt=gpVal(gr,0)>.4;if(rt&&!gpTrig){gpTrig=1;trig=1;fresh=1}else if(!rt&&gpTrig){gpTrig=0;trig=0}
 key.Space=b4(gr,4);if(gpEdgeOf('va',key.Space))actJumpPress();
 holdBtn('vb',b4(gr,5),dt,actSwapNext,null,.5);holdBtn('vx',b4(gl,4),dt,actCrouch,actProne,.4);
 const rg=gpVal(gr,1)>.6,lg=gpVal(gl,1)>.6,xh=holdBtn('vrg',rg&&!lg,dt,startRel,actInteract,.35);key.KeyF=!!xh;if(gpEdgeOf('vfld',rg&&lg))actField();else if(lg&&!rg)if(gpEdgeOf('vlg',lg))actTactical();
 if(gpEdgeOf('vlt',gpVal(gl,0)>.5))throwG();if(gpEdgeOf('vrs',b4(gr,3)))melee();
 if(gpEdgeOf('vy',b4(gl,5)))pausePad()}
/* after the game has updated: put the gun in the right hand, hide the camera-attached arms, draw the wrist HUD */
function vrAfter(){if(xrS&&xrEye)C.position.copy(xrEye)}
function vrOrg(){if(!xrS||!inMatch())return null;const rh=vrHand('right');if(!rh||!xrRig)return null;xrRig.updateMatrixWorld(true);const m=new THREE.Matrix4().multiplyMatrices(xrRig.matrixWorld,rh.matrix),p=new THREE.Vector3().setFromMatrixPosition(m);return p.add(aimDir().multiplyScalar(.12))}
function vrPost(dt){if(!xrS)return;xrEye=C.position.clone();const rh=vrHand('right'),lh=vrHand('left');
 if(rh&&!xrGunIn){rh.add(gun);xrGunIn=1}else if(rh&&gun.parent!==rh)rh.add(gun);
 if(rh){const _w=cw(),_A=_w&&typeof curAnch=='function'?curAnch(_w.k):null;/* the weapon's right-hand grip point sits exactly on the controller */if(_A&&_A.r)gun.position.set(-_A.r[0],-_A.r[1],-_A.r[2]);else gun.position.set(0,-.025,-.06);gun.rotation.set(0,0,0);gun.visible=inMatch()}
 if(typeof fpArm!='undefined')for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=false;
 if(lh&&xrWrist&&inMatch()){if(xrWrist.m.parent!==lh)lh.add(xrWrist.m);xrWristT-=dt;if(xrWristT<=0){xrWristT=.2;const g=xrWrist.g;g.clearRect(0,0,256,160);g.fillStyle='rgba(8,18,24,.78)';g.fillRect(0,0,256,160);g.fillStyle='#fff';g.font='bold 34px sans-serif';g.fillText($('#am').textContent||'',12,44);
   const bar=(y,col,el)=>{g.fillStyle='rgba(255,255,255,.15)';g.fillRect(12,y,232,14);g.fillStyle=col;g.fillRect(12,y,232*Math.max(0,Math.min(1,parseFloat(el.style.width)/100||0)),14)};bar(62,'#62e0f0',$('#sh'));bar(84,'#6bd66b',$('#hp'));
   g.font='24px sans-serif';g.fillStyle='#ffd27a';
   if(practiceSession?.training){
    g.fillText(trainingCoach.children[1].textContent,12,124,232);
    g.font='13px sans-serif';g.fillText(trainingCoach.children[2].textContent,12,147,232);
   }else g.fillText(mode=='Zombies'?('Round '+($('#zr').textContent||'')+'   '+($('#zpt').textContent||'')):('Kills '+kills),12,128);
   xrWrist.t.needsUpdate=true}}
 else if(xrWrist&&xrWrist.m.parent)xrWrist.m.parent.remove(xrWrist.m)}
function enterVR(){if(!navigator.xr)return false;navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(s=>{xrS=s;s.addEventListener('end',vrEnd);R.xr.enabled=true;R.xr.setReferenceSpaceType('local-floor');return R.xr.setSession(s)}).then(()=>{if(xrS)vrStart()}).catch(()=>{xrS=null;if(run)_lockPtr()});return true}
var _lockPtr=lockPtr;
lockPtr=function(){if(window.SD_SPLIT)return _lockPtr();if(xrS){paused=0;hidePause();return}if(vrMode&&navigator.xr&&run&&!over){enterVR();return}_lockPtr()};
/* auto VR: where WebXR exists (Quest browser), the whole site opens in VR. Browsers only allow starting VR from a user gesture, so the very first click / trigger pull anywhere on the page does it
   (and the browser's own "enter VR" offer is registered where supported) */
if(navigator.xr&&navigator.xr.isSessionSupported)navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(!ok)return;$('#vrL').style.display='';$('#vrm').value=vrMode;$('#vrm').onchange=e=>{vrMode=+e.target.value;try{localStorage.setItem('sd-vr',vrMode)}catch(_){}};
 try{if(navigator.xr.offerSession)navigator.xr.offerSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(s=>{xrS=s;s.addEventListener('end',vrEnd);R.xr.enabled=true;R.xr.setReferenceSpaceType('local-floor');return R.xr.setSession(s)}).then(()=>{if(xrS)vrStart()}).catch(()=>{})}catch(e){}
 if(vrMode){const sp=document.createElement('div');sp.id='vrsplash';sp.innerHTML='<b>ENTER VR</b><span>Pull the trigger or click anywhere</span>';document.body.appendChild(sp);const go=()=>{sp.remove();if(!xrS)enterVR()};sp.addEventListener('click',go,{once:true});sp.addEventListener('pointerdown',go,{once:true})}}).catch(()=>{});
;
/* ######## melee.js ######## */
/* ===================== melee.js ===================== */
/* ---------- melee: tap V = quick weaker strike with the weapon in your hands (rifle butt), hold V = draw the melee weapon picked in your loadout and hit much harder.
   Melee weapons: Katana (two hands on the base of the grip, long reach, cuts up to 3 enemies) and Fists (fast, two punches alternating).
   Also builds the first-person arms: sleeves in the colour of the player character, cuff, gloved hand with palm, knuckle plate, four curled fingers and a thumb. ---------- */
var MEL={Katana:{n:'Katana',d:100,reach:3.1,cnt:3,cd:.55,zf:1,desc:'Two-handed blade. Long reach, can hit several enemies, very high damage when drawn.'},
 Fists:{n:'Fists',d:72,reach:2.4,cnt:1,cd:.4,zf:.55,desc:'Fast alternating punches. Short reach, but the quickest melee.'},
 'Nitrogen Fists':{n:'Nitrogen Fists',d:96,reach:2.8,cnt:2,cd:.36,zf:.85,desc:'Rocket-assisted gauntlets. Every strike is a thruster-driven forward slash that hits two enemies and gets louder and faster the longer you keep swinging.'}};
var MV={down:0,h:0,f:0,draw:0,hold:0,eq:0,flair:0},MB={t:0,d:.34},FI={t:0,side:0,d:.3};
var melName=()=>zomOn()?zMelKey():(MEL[L.me]?L.me:'Katana');
function mvReset(){MV.down=MV.h=MV.f=MV.hold=MV.eq=MV.flair=0;MV.draw=0;MB.t=0;FI.t=0}
/* V: tap = quick strike with the weapon in your hands (or put the melee weapon away if it is out), hold = whip the melee weapon out; it then stays in your hands like any weapon and the fire button swings it */
function mvDown(){if(!run||paused||over||P.dead)return;MV.down=1;MV.h=0;MV.f=0}
function mvUp(){if(MV.down&&!MV.f){if(MV.eq)MV.eq=0;else if(zomOn())zQuickMelee();else rifleBash()}MV.down=0}
function meleeDraw(){MV.eq=1;MV.flair=.6;noise(.14,2600,.22);beep(1500,.06,'triangle',.05);if(typeof haptic=='function')haptic(.4,90,.5,'right')}
/* damage a cone in front of the player. Returns true when something was hit */
function meleeHit(dmg,reach,cnt,zf,cone){const f=V(-Math.sin(yaw),0,-Math.cos(yaw));let hit=0;
 const list=bots.filter(b=>b.al&&!ally(b)).map(b=>{const dx=b.x-P.x,dz=b.z-P.z,D=Math.hypot(dx,dz);return{b,D,dt:D>0?(dx*f.x+dz*f.z)/D:1}}).filter(o=>o.D<reach&&o.dt>cone&&Math.abs((o.b.y||0)-(P.y||0))<2.2).sort((a,b)=>a.D-b.D);
 for(const o of list){if(hit>=cnt)break;const b=o.b,wk=mode=='Zombies'?zMeleeDmg(b,zf):dmg;hitBot(b,wk,0);beep(1400,.06,'square',.05);if(typeof burst=='function')burst(V(b.x,1.2,b.z),8,0xaa2222,4,.4,.1);hit++}
 return hit}
function meleeLunge(f,s){mv(P,f.x*s,f.z*s,.45)}
/* hold V (and RS click / touch button / VR): the selected melee weapon, strong */
melee=function(){if(t0<mn||P.dead)return;const m=zomOn()?zMeleeStats(MEL[melName()]):MEL[melName()];mn=t0+m.cd;src='Melee';srcK='';noise(.12,2200,.25);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));
 const nitro=melName()=='Nitrogen Fists';if(melName()=='Fists'||nitro){FI.d=nitro?.27:.3;FI.t=FI.d;FI.side^=1}else if(typeof katSwing=='function')katSwing();
 if(nitro)nfStrike();
 const n=meleeHit(m.d,m.reach,m.cnt,m.zf,.2);if(n){kick=Math.max(kick,nitro?.046:.028);shake=Math.max(shake,nitro?.42:.27)};meleeLunge(f,nitro?.6:.35);if(nitro&&n)nfImpact(f,n)};
/* tap V: butt-stroke with the weapon in your hands, about a third of the damage */
function rifleBash(){if(t0<mn||P.dead||rel>0)return;mn=t0+.42;src='Melee';srcK='';MB.t=MB.d;noise(.08,1800,.2);const f=V(-Math.sin(yaw),0,-Math.cos(yaw));
 const n=meleeHit(40,2.3,1,.3,.35);if(n){kick=Math.max(kick,.034);shake=Math.max(shake,.31)};meleeLunge(f,.2)}
function meleeTick(dt){if(MB.t>0)MB.t-=dt;if(FI.t>0)FI.t-=dt;if(MV.flair>0)MV.flair-=dt;
 if(MV.down){MV.h+=dt;if(!MV.f&&MV.h>=.2){MV.f=1;if(!MV.eq)meleeDraw()}}
 if(P.dead||paused||over){MV.down=0;MV.eq=0}
 if(MV.eq){ST.adsIn=0;if(trig&&!P.dead&&t0>=mn)melee()}
 MV.hold=MV.eq;MV.draw+=((MV.eq?1:0)-MV.draw)*Math.min(1,dt*(MV.eq?11:9));if(MV.draw<.01)MV.draw=0}
var meleeOut=()=>MV.draw>.03||kat.t>0||FI.t>0;
/* weapon strike offsets used by the camera-held gun (see upd) */
function strikeCurve(phase){
 const drive=eas(cl((phase-.12)/.23,0,1)),recovery=eas(cl((phase-.37)/.63,0,1));
 const coil=Math.sin(Math.PI*cl(phase/.29,0,1))*(1-drive);
 return drive*(1-recovery)-coil*.24;
}
var bashP=()=>MB.t>0?strikeCurve(1-MB.t/MB.d):0;
var bashZ=()=>-.38*bashP(),bashY=()=>.05*bashP(),bashRot=()=>-.55*bashP();

/* ---------- first-person arms ---------- */
function mkFpHand(side,glove,pad,trigger=false,thread=pad,skin=null){
 const model=new THREE.Group();
 const materials={palm:glove,trim:pad,stitch:thread,finger:skin||glove};
 HV.put(model,'anatomical-glove-'+side+'-'+trigger+'-'+!!skin,operatorGlove(side,trigger,!!skin),materials);
 return model;
}
function mkFpArm(side){
 const up=new THREE.Group(),fo=new THREE.Group(),hand=new THREE.Group(),L1=.6,L2=.56;
 hand.position.y=-L2;fo.add(hand);C.add(up,fo);
 return {up,fo,L1,L2,hand,side,firstPerson:true,kits:new Map(),active:null};
}
function fpEquipOperator(){
 const id=passOperator();
 for(const arm of Object.values(fpArm)){
  if(arm.active?.id===id)continue;
  let kit=arm.kits.get(id);
  if(!kit){
   const M=operatorMaterials(id),upper=new THREE.Group(),fore=new THREE.Group();
   const keyed=id==='keywarden';
   const glove=keyed?new THREE.Group():id==='meridian'?meridianGlove(arm.side,arm.side===1,M):
    mkFpHand(arm.side,M.stitch,M.armor,arm.side===1,M.fabric);
   const segments=[['arm',upper,arm.L1],['forearm',fore,arm.L2]];
   if(keyed)segments.push(['hand',glove,0]);
   for(const [part,target,length] of segments){
    const meshes=HV.put(target,'view-'+id+part+arm.side,operatorViewGear(id,arm.side,part,length),M);
    for(const mesh of meshes)mesh.castShadow=false;
   }
   kit={id,upper,fore,glove};arm.kits.set(id,kit);
  }
  if(arm.active){
   arm.up.remove(arm.active.upper);arm.fo.remove(arm.active.fore);arm.hand.remove(arm.active.glove);
  }
  arm.up.add(kit.upper);arm.fo.add(kit.fore);arm.hand.add(kit.glove);arm.active=kit;
 }
}
fpArm={r:mkFpArm(1),l:mkFpArm(-1)};

/* ---------- arm placement while a melee weapon is out ---------- */
var _fpu=fpUpdate;
fpUpdate=function(dt){if(run&&!P.dead&&!over)fpEquipOperator();if(!meleeOut()||!run||P.dead||over){_fpu(dt);return}
 for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=true;const pr=gun.userData.prop;if(pr)pr.visible=false;
 const SR=fpShoulder(1),SL=fpShoulder(-1);
 if(melName()=='Fists'||melName()=='Nitrogen Fists'){const nitro=melName()=='Nitrogen Fists',sw=Math.sin(t0*1.8)*.012,pk=FI.t>0?strikeCurve(cl(1-FI.t/FI.d,0,1)):0,pr_=FI.side?1:0;
  const R=V(.2,-.3+sw,-.5-(pr_?pk*.6:0)),Lh=V(-.2,-.3-sw,-.5-(pr_?0:pk*.6));if(pr_)R.add(V(-.105*pk,.105*pk,0));else Lh.add(V(.105*pk,.105*pk,0));
  if(nitro){/* a rocket-driven diagonal slash: starts low and wide, whips across and forward, hand rising through the strike */const u=FI.t>0?cl(1-FI.t/FI.d,0,1):0,e=1-Math.pow(1-u,2.6),sl=Math.sin(Math.PI*e);if(FI.t>0){const a=pr_?R:Lh,sd=pr_?1:-1;a.set(sd*(.42-.62*e),-.52+.46*e+sl*.06,-.42-.78*sl)}else{R.x+=Math.sin(t0*2.3)*.006;Lh.x-=Math.sin(t0*2.1)*.006}}
  const dr=1-Math.max(MV.draw,FI.t>0?1:0);R.y-=dr*.4;Lh.y-=dr*.4;ik(SR,R,V(.5,-1,.3),fpArm.r);ik(SL,Lh,V(-.5,-1,.3),fpArm.l);return}
 /* katana: right hand at the pommel end of the grip, left hand just under the guard, both following the blade through every swing */
 katG.updateMatrix();const mt=katG.matrix,Rh=V(0,-.235,0).applyMatrix4(mt),Lh=V(0,-.12,0).applyMatrix4(mt);
 const ka=V(0,1,0).transformDirection(mt);gripArm(SR,Rh,V(.5,-1,.35),fpArm.r,ka,1);gripArm(SL,Lh,V(-.5,-1,.35),fpArm.l,ka,-1)};

/* nothing fires, reloads or swaps while the melee weapon is out: reload (R) or a weapon switch puts it away */
{const _sh=shoot;shoot=function(){if(MV.eq)return;_sh.apply(this,arguments)}}
{const _sr=startRel;startRel=function(){if(MV.eq){MV.eq=0;return}_sr.apply(this,arguments)}}
{const _sw=swap;swap=function(){MV.eq=0;_sw.apply(this,arguments)}}
;
/* ######## attach.js ######## */
/* ===================== attach.js ===================== */
/* ---------- attachments that really appear on the weapon: Extended Mag (a longer magazine with a base plate), Compensator (vented muzzle brake), Laser Sight (module on the side with a visible red beam),
   Long Barrel (extended barrel with a sleeve), Fast Hands (rubber wraps on the grip and handguard, a thumb rest), Hollow Point (orange tipped rounds showing in the magazine) and
   Quickdraw Grip (angled foregrip). They are added to whichever model is in use (first person, the loadout and customize previews, other players) and follow the weapon. ---------- */
var ATT_MAT={};
function attM(c,e){const k=c+(e?'e':'');return ATT_MAT[k]||(ATT_MAT[k]=e?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}))}
function attsFor(k){return zomOn()?[]:passAttachments(k,k===L.p?L.pa:k===L.s?L.sa:[])}
/* y of the barrel at the muzzle, measured from the model itself: the mean height of the parts that reach the front */
function attMuzzle(g,dir){
 if(dir===1&&g.userData.mountBounds)return g.userData.mountBounds;
 g.updateMatrixWorld(true);const inv=g.matrixWorld.clone().invert(),bb=new THREE.Box3(),tmp=new THREE.Box3(),mm=new THREE.Matrix4(),parts=[];
 /* everything is measured in the weapon's own space (not world space), so it is right in first person, in previews and on other players */
 g.traverse(m=>{if(!m.isMesh||m.userData.att||m.userData.charm||!m.visible)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();tmp.copy(m.geometry.boundingBox).applyMatrix4(mm.multiplyMatrices(inv,m.matrixWorld));if(!isFinite(tmp.min.x)||!isFinite(tmp.max.x))return;bb.union(tmp);parts.push(tmp.clone())});
 if(bb.isEmpty())bb.set(new THREE.Vector3(-.03,-.1,-.3),new THREE.Vector3(.03,.1,.3));
 const muzzle=dir===1&&g.userData.muzzle;
 if(muzzle)return {tip:muzzle.z,y:muzzle.y,bb,parts};
 const tip=dir>0?bb.max.z:bb.min.z;let sy=0,n=0;for(const p of parts){const ft=dir>0?p.max.z:p.min.z;if(Math.abs(ft-tip)<.045&&(p.max.x-p.min.x)<.12){sy+=(p.min.y+p.max.y)/2;n++}}return{tip,y:n?sy/n:(bb.min.y+bb.max.y)/2,bb,parts}}
function attMagGrp(G,mag){if(G.userData.mg)return G.userData.mg;const p=new THREE.Group();p.position.set(mag[0],mag[1],mag[2]);p.userData.att=1;p.userData.mb={x:mag[0],y:mag[1],z:mag[2]};G.add(p);G.userData.mg=p;return p}
function attRemove(g){delete g.userData.barrelExit;for(let i=g.children.length-1;i>=0;i--)if(g.children[i].userData.att)g.remove(g.children[i])}
function attApply(g,k,list,dir){if(!g)return;attRemove(g);if(!list||!list.length)return;list=list.filter(a=>attachmentFits(k,a));if(!list.length)return;dir=dir||1;const A_=g.userData.a||{};
 const mz=attMuzzle(g,dir),G=new THREE.Group(),PT=mz.parts;G.userData.att=1;
 /* measurements taken from the real model so attachments sit on it instead of floating: the parts that cover a given z near the centre line */
 const cov=(z,tol)=>PT.filter(p=>p.min.z-tol<=z&&p.max.z+tol>=z&&Math.abs((p.min.x+p.max.x)/2)<.08&&(p.max.x-p.min.x)<.16),
  lowY=(z,t,d)=>{const c=cov(z,t);return c.length?Math.min(...c.map(p=>p.min.y)):d},topY=(z,t,d)=>{const c=cov(z,t);return c.length?Math.max(...c.map(p=>p.max.y)):d},
  halfW=(z,t,d)=>{const c=cov(z,t);return c.length?Math.max(...c.map(p=>Math.max(p.max.x,-p.min.x))):d};
 let TG=G;/* TG: where new parts go. Magazine attachments go into a pivot that rides on the magazine (see attMagGrp) */const tgAdd=e=>{TG.add(e);if(TG!==G)e.position.sub(TG.position)},box=(w,h,d,x,y,z,m,rx)=>{const e=new THREE.Mesh(bg,m);e.scale.set(w,h,d);e.position.set(x,y,z);if(rx)e.rotation.x=rx;e.userData.att=1;tgAdd(e);return e},cyl=(r,len,x,y,z,m,rf)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(rf==null?r:rf,r,len,14),m);e.rotation.x=Math.PI/2;e.position.set(x,y,z);e.userData.att=1;tgAdd(e);return e},mag=A_.m||[0,mz.bb.min.y+.1,(mz.bb.min.z+mz.bb.max.z)/2],grip=A_.r||[0,mz.bb.min.y+.1,0],fore=A_.l||[0,mz.y-.04,mz.tip-dir*.25],dk=attM(0x17181b),gm=attM(0x2d2f34),steel=attM(0x9aa0a8),org=attM(0xd9822b),red=attM(0xff2a20,1);
 let tip=mz.tip;
 if(list.includes('Long Barrel')){cyl(.017,.2,0,mz.y,tip+dir*.1,steel);cyl(.026,.07,0,mz.y,tip+dir*.035,gm);cyl(.022,.012,0,mz.y,tip+dir*.205,dk);tip+=dir*.21}
 if(list.includes('Compensator')){cyl(.027,.085,0,mz.y,tip+dir*.0425,gm);for(let i=0;i<3;i++){box(.03,.008,.012,0,mz.y+.0,tip+dir*(.015+i*.02),dk);cyl(.0285,.006,0,mz.y,tip+dir*(.012+i*.024),steel)}box(.056,.006,.04,0,mz.y+.027,tip+dir*.04,dk);box(.056,.006,.04,0,mz.y-.027,tip+dir*.04,dk);tip+=dir*.085}
 if(list.includes('Extended Mag')){TG=attMagGrp(G,mag);const h=.12,mb=lowY(mag[2],.03,mag[1]-.1),mw=Math.max(.045,Math.min(.07,halfW(mag[2],.03,.025)*2+.004));box(mw,h,.082,mag[0],mb-h/2+.012,mag[2]+.004,attM(0x222428),.06*dir);box(mw+.006,.016,.09,mag[0],mb-h+.004,mag[2]+.008,org,.06*dir);for(let i=0;i<3;i++)box(mw+.002,.004,.084,mag[0],mb-.02-i*.034,mag[2]+.006,gm);TG=G}
 if(list.includes('Hollow Point')){TG=attMagGrp(G,mag);const mb=lowY(mag[2],.03,mag[1]-.1),mw=Math.max(.045,Math.min(.07,halfW(mag[2],.03,.025)*2+.004)),my=mb+.03;box(mw,.012,.084,mag[0],my,mag[2],org);box(mw+.002,.004,.086,mag[0],my-.02,mag[2],attM(0x3a3a3e));for(let i=0;i<4;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.006,.016,8),org);c.position.set(mag[0]+(i-1.5)*.009,my+.012,mag[2]);c.userData.att=1;tgAdd(c)}TG=G}
 if(list.includes('Laser Sight')){const sz=fore[2]-dir*.02,hw=halfW(sz,.04,.035),sx=-(hw+.014),lo=lowY(sz,.04,fore[1]-.03),hi=topY(sz,.04,fore[1]+.03),sy=(lo+hi)/2;box(.024,.03,.07,sx,sy,sz,dk);box(.012,.012,.018,sx,sy,sz+dir*.04,red);box(.03,.008,.05,sx+.004,sy+.018,sz,gm);
  /* faint visible beam */
  const bm=new THREE.Mesh(new THREE.CylinderGeometry(.0016,.0016,14,6),new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.28,depthWrite:false}));bm.rotation.x=Math.PI/2;bm.position.set(sx,sy,sz+dir*7.04);bm.userData.att=1;bm.userData.laserBeam=true;G.add(bm)}
 if(list.includes('Fast Hands')){const rub=attM(0x0e0f10);box(.06,.07,.075,grip[0],grip[1]-.02,grip[2]+.0,rub);for(let i=0;i<4;i++)box(.064,.004,.078,grip[0],grip[1]-.045+i*.018,grip[2],gm);box(.066,.04,.012,grip[0],grip[1]+.015,grip[2]+dir*.045,gm);
  {const hw=halfW(fore[2],.04,.04),lo=lowY(fore[2],.04,fore[1]-.025),hi=topY(fore[2],.04,fore[1]+.025),cy=(lo+hi)/2,hh=Math.max(.03,hi-lo)+.01;box(hw*2+.012,hh,.1,fore[0],cy,fore[2],rub);for(let i=0;i<3;i++)box(hw*2+.016,.004,.104,fore[0],lo+.008+i*(hh-.016)/2,fore[2],gm);box(.02,.03,.04,fore[0]+hw+.012,cy,fore[2]+dir*.02,rub)}}
 if(list.includes('Quickdraw Grip')){const x=fore[0],z=fore[2],y=lowY(z,.04,fore[1]-.03)-.012;const a=new THREE.Mesh(new THREE.CylinderGeometry(.015,.019,.12,12),dk);a.position.set(x,y-.04,z+dir*.015);a.rotation.x=.32*dir;a.userData.att=1;G.add(a);box(.04,.02,.07,x,y+.01,z,gm);box(.044,.012,.03,x,y-.1,z+dir*.04,org);for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.017,.0025,6,12),gm);r.position.set(x,y-.025-i*.025,z+dir*(.015+i*.008));r.rotation.x=Math.PI/2+.32*dir;r.userData.att=1;G.add(r)}}
 if(dir===1&&(list.includes('Long Barrel')||list.includes('Compensator')))g.userData.barrelExit={x:0,y:mz.y,z:tip};
 g.add(G)}
function attFpModel(){return fpG}
function attRefresh(){const w=cw();if(w){const parts=attsFor(w.k);fpG.userData.attachments=parts;attApply(fpG,w.k,parts,1)}}
{const _sg=setGun;setGun=function(){_sg.apply(this,arguments);try{attRefresh()}catch(e){}}}
;

/* ---------- Nitrogen Fists: rocket gauntlets with spiked knuckle plates, side thrusters with blue flames, a glowing coolant canister and a swept blade fin. Modelled in hand space (wrist at the origin, fingers towards -y, palm towards +z). ---------- */
function mkNitroFist(side){const g=new THREE.Group(),M=c=>new THREE.MeshLambertMaterial({color:c}),
 B=(w,h,d,x,y,z,m,rx,ry,rz)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);g.add(o);return o},
 C=(rt,rb,h,x,y,z,m,rx,rz,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),m);o.position.set(x,y,z);o.rotation.set(rx||0,0,rz||0);g.add(o);return o};
 const tan=M(0x8d805c),tan2=M(0x6c6246),stl=M(0x9aa1a8),stl2=M(0x585e64),dk=M(0x24272b),glow=new THREE.MeshBasicMaterial({color:0x37b8ff}),pale=new THREE.MeshBasicMaterial({color:0xd6f5ff}),glass=new THREE.MeshBasicMaterial({color:0x2a86ff,transparent:true,opacity:.5});
 /* cuff and body */
 C(.064,.072,.075,0,.025,0,tan2,0,0,14);C(.068,.068,.014,0,.065,0,stl2,0,0,14);B(.118,.15,.128,0,-.088,-.004,tan);B(.124,.05,.138,0,-.02,-.004,tan2);B(.1,.1,.03,0,-.07,.066,tan2);B(.09,.14,.014,0,-.08,-.07,stl2);
 for(const sx of[-1,1])for(let i=0;i<3;i++)C(.007,.007,.012,sx*.05,-.04-i*.04,-.074,stl,Math.PI/2,0,8);
 for(let i=0;i<4;i++)B(.12,.006,.131,0,-.045-i*.032,-.004,dk);
 /* knuckle plate with ridges and four glowing spikes */
 B(.136,.062,.146,0,-.18,-.004,stl);B(.142,.014,.152,0,-.15,-.004,stl2);B(.13,.012,.14,0,-.212,-.004,stl2);
 for(let i=0;i<4;i++){const x=(i-1.5)*.032;B(.027,.048,.034,x,-.2,-.034,stl);C(.018,.018,.012,x,-.232,-.034,dk,0,0,8);const sp=new THREE.Mesh(new THREE.ConeGeometry(.0175,.13,6),glow);sp.position.set(x,-.305,-.034);sp.rotation.x=Math.PI;g.add(sp);const tip=new THREE.Mesh(new THREE.ConeGeometry(.007,.04,6),pale);tip.position.set(x,-.38,-.034);tip.rotation.x=Math.PI;g.add(tip)}
 B(.14,.008,.016,0,-.152,-.08,glow);
 /* thrusters */
 const fl=[];for(const sx of[-1,1]){const x=sx*.092;C(.032,.032,.14,x,-.07,-.018,stl);C(.036,.036,.018,x,-.12,-.018,stl2);C(.036,.036,.018,x,-.025,-.018,stl2);C(.034,.034,.03,x,-.072,-.018,dk);C(.04,.026,.055,x,.04,-.018,dk);C(.032,.032,.008,x,.068,-.018,glow);for(let i=0;i<5;i++)B(.012,.004,.02,x+sx*.026,-.12+i*.012,-.018,dk);
  const pv=new THREE.Group();pv.position.set(x,.072,-.018);const outer=new THREE.Mesh(new THREE.ConeGeometry(.031,.22,10),new THREE.MeshBasicMaterial({color:0x2d9bff,transparent:true,opacity:.7,depthWrite:false})),inner=new THREE.Mesh(new THREE.ConeGeometry(.017,.14,8),new THREE.MeshBasicMaterial({color:0xe8fbff,transparent:true,opacity:.95,depthWrite:false}));outer.position.y=.11;inner.position.y=.07;pv.scale.y=.5;pv.add(outer,inner);g.add(pv);fl.push({p:pv,ph:Math.random()*6.28})}
 /* coolant canister on the palm side */
 C(.034,.034,.09,0,-.012,.076,glass,0,0,14);C(.038,.038,.014,0,.036,.076,stl2,0,0,14);C(.038,.038,.014,0,-.06,.076,stl2,0,0,14);const core=new THREE.Mesh(sg,glow);core.scale.setScalar(.022);core.position.set(0,-.012,.076);g.add(core);for(const a of[0,2.1,4.2])B(.006,.092,.006,Math.cos(a)*.036,-.012,.076+Math.sin(a)*.036,stl2);
 /* swept blade fin on the outer side */
 B(.008,.17,.07,side*.098,-.15,.01,stl,0,0,side*.28);B(.008,.07,.05,side*.118,-.245,.01,stl,0,0,side*.5);B(.012,.05,.05,side*.092,-.075,.01,stl2);
 g.userData={fl,core};return g}
var NF={rev:0,last:-9,boost:0,out:0,al:0,idle:null,rt:0};
function nfBus(){ac=ac||new AudioContext();if(!NF.bus){const c=ac.createDynamicsCompressor();c.threshold.value=-24;c.knee.value=12;c.ratio.value=10;c.attack.value=.003;c.release.value=.15;c.connect(PlayerAudio.output(ac));NF.bus=c;const n=ac.sampleRate*1,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;NF.nb=b}return NF.bus}
/* engine: a saw and a square through a rising low-pass with a cylinder-like tremolo, plus an exhaust whoosh; every strike in a chain starts higher and chugs faster */
function nfEngine(rev){try{const bus=nfBus(),t=ac.currentTime,v=vol*.55;if(v<=0)return;const f0=58+rev*14,dur=.3,o=ac.createOscillator(),o2=ac.createOscillator(),lp=ac.createBiquadFilter(),am=ac.createGain(),g=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain();
 o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*(2.3+rev*.14),t+dur*.8);o2.frequency.setValueAtTime(f0*.5,t);o2.frequency.exponentialRampToValueAtTime(f0*1.15,t+dur*.8);
 lp.type='lowpass';lp.Q.value=2.2;lp.frequency.setValueAtTime(340,t);lp.frequency.exponentialRampToValueAtTime(1200+rev*170,t+dur*.7);
 am.gain.value=.62;lfo.frequency.value=24+rev*5.5;lg.gain.value=.38;lfo.connect(lg).connect(am.gain);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07*v,t+.035);g.gain.exponentialRampToValueAtTime(.0001,t+dur+.08);
 o.connect(lp);o2.connect(lp);lp.connect(am).connect(g).connect(bus);for(const x of[o,o2,lfo]){x.start(t);x.stop(t+dur+.1)}
 const s=ac.createBufferSource(),bp=ac.createBiquadFilter(),ng=ac.createGain();s.buffer=NF.nb;bp.type='bandpass';bp.Q.value=.9;bp.frequency.setValueAtTime(450+rev*60,t);bp.frequency.exponentialRampToValueAtTime(2300+rev*220,t+.2);ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(.05*v,t+.03);ng.gain.exponentialRampToValueAtTime(.0001,t+.26);s.connect(bp).connect(ng).connect(bus);s.start(t,Math.random()*.5);s.stop(t+.3)}catch(e){}}
/* demolishing hit: a sub drop, a gated crunch, two inharmonic metal clanks and a few falling bits of rubble */
function nfHit(n){try{const bus=nfBus(),t=ac.currentTime,v=vol*.55;if(v<=0)return;const sub=ac.createOscillator(),sg_=ac.createGain();sub.type='sine';sub.frequency.setValueAtTime(130,t);sub.frequency.exponentialRampToValueAtTime(36,t+.24);sg_.gain.setValueAtTime(.0001,t);sg_.gain.exponentialRampToValueAtTime(.12*v,t+.012);sg_.gain.exponentialRampToValueAtTime(.0001,t+.28);sub.connect(sg_).connect(bus);sub.start(t);sub.stop(t+.3);
 const s=ac.createBufferSource(),bp=ac.createBiquadFilter(),cg=ac.createGain();s.buffer=NF.nb;bp.type='bandpass';bp.frequency.value=1100;bp.Q.value=.7;cg.gain.setValueAtTime(.0001,t);for(let i=0;i<7;i++){const a=t+i*.022;cg.gain.setValueAtTime(.075*v*(1-i*.11),a);cg.gain.exponentialRampToValueAtTime(.006,a+.016)}cg.gain.exponentialRampToValueAtTime(.0001,t+.2);s.connect(bp).connect(cg).connect(bus);s.start(t,Math.random()*.5);s.stop(t+.22);
 for(const[f,d]of[[412,.12],[689,.09]]){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f*(.96+Math.random()*.08);g.gain.setValueAtTime(.03*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(bus);o.start(t);o.stop(t+d+.02)}
 for(let i=0;i<(n>1?5:3);i++){const a=t+.12+Math.random()*.25,r=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();r.buffer=NF.nb;f.type='highpass';f.frequency.value=2500+Math.random()*2500;g.gain.setValueAtTime(.022*v,a);g.gain.exponentialRampToValueAtTime(.0001,a+.04);r.connect(f).connect(g).connect(bus);r.start(a,Math.random()*.5);r.stop(a+.05)}}catch(e){}}
function nfIdle(on){try{if(on&&!NF.idle&&vol>0){const bus=nfBus(),t=ac.currentTime,o=ac.createOscillator(),lp=ac.createBiquadFilter(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();o.type='sawtooth';o.frequency.value=47;lp.type='lowpass';lp.frequency.value=170;l.frequency.value=9;lg.gain.value=3;l.connect(lg).connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.012*vol,t+.3);o.connect(lp).connect(g).connect(bus);o.start();l.start();NF.idle={o,l,g}}
 else if(!on&&NF.idle){const t=ac.currentTime,i=NF.idle;NF.idle=null;i.g.gain.cancelScheduledValues(t);i.g.gain.setValueAtTime(i.g.gain.value,t);i.g.gain.linearRampToValueAtTime(.0001,t+.2);i.o.stop(t+.25);i.l.stop(t+.25)}}catch(e){}}
function nfStrike(){NF.rev=t0-NF.last>1.4?0:Math.min(6,NF.rev+1);NF.last=t0;NF.boost=1;nfEngine(NF.rev);kick=Math.max(kick,.4)}
function nfImpact(f,n){setTimeout(()=>{nfHit(n);const q=V(P.x+f.x*1.7,1.25,P.z+f.z*1.7);burst(q,22,0x55ccff,9,.5,.1);burst(q,12,0xffffff,12,.35,.07);burst(q,10,0x555a60,6,.8,.2);shake=Math.max(shake,.5);const fl=$('#flash');if(fl){fl.style.transition='none';fl.style.background='rgba(120,200,255,.25)';fl.style.opacity=1;requestAnimationFrame(()=>{fl.style.transition='opacity .25s';fl.style.opacity=0})}if(typeof haptic=='function')haptic(.7,90,.6,'both')},55)}
/* attach the gauntlets to the first-person hands and animate them */
{const gnt={};const _fx=fpUpdate;fpUpdate=function(dt){_fx.apply(this,arguments);try{const on=melName()=='Nitrogen Fists'&&run&&!P.dead&&!over&&MV.draw>.03&&!(typeof SK!='undefined'&&SK.rc);
  for(const[k,a,s]of[['r',fpArm.r,1],['l',fpArm.l,-1]]){if(!a.hand)continue;if(!gnt[k]){gnt[k]=mkNitroFist(s);a.hand.add(gnt[k]);gnt[k].visible=false}const g=gnt[k];g.visible=on;
   for(const ch of a.hand.children)if(ch!==g)ch.visible=!on;
   if(on){const u=g.userData,chain=Math.min(1,NF.rev/5),sp=Math.hypot(P.mx||0,P.mz||0)/7;NF.boost=Math.max(0,NF.boost-dt*3.2);const inten=.5+NF.boost*1.5+chain*.35+sp*.2;
    for(const f of u.fl){const fl=inten*(.78+.28*Math.sin(t0*46+f.ph)+.12*Math.sin(t0*83+f.ph*2));f.p.scale.set(.8+NF.boost*.5,Math.max(.25,fl),.8+NF.boost*.5)}u.core.scale.setScalar(.022+Math.sin(t0*5+(s>0?0:1.5))*.004+NF.boost*.012)}}
  if(on!==!!NF.out){NF.out=on?1:0;nfIdle(on);if(on){NF.rev=0;beep(90,.2,'sawtooth',.03)}}
  if(on&&FI.t>0&&NF.al<=0){NF.al=.035;const a=FI.side?fpArm.r.hand:fpArm.l.hand;if(a){const p=new THREE.Vector3();a.getWorldPosition(p);burst(p,2,0x59cdff,3,.22,.05)}}NF.al-=dt}catch(e){}}}

/* ===================== pads.js ===================== */
/* ---------- controller prompts: every on-screen button hint shows the buttons printed on YOUR controller (Xbox, PlayStation, Nintendo or Ouya).
   The type is read from the gamepad id (Settings can force one). The same physical buttons do the same jobs on every pad; only the names and symbols change.
   Nintendo pads also swap confirm and back in the menus (the right-hand button confirms), like every Nintendo game. Hints in the HUD, the menus and the help lists all follow. ---------- */
var PG={on:false,type:'xbox',pref:'auto',tabI:0,rep:0,r3:false,dirty:1,h0:null,
 L:{xbox:{a:'A',b:'B',x:'X',y:'Y',lb:'LB',rb:'RB',lt:'LT',rt:'RT',view:'View',menu:'Menu',ls:'LS',rs:'RS',name:'Xbox'},
  ps:{a:'✕',b:'○',x:'□',y:'△',lb:'L1',rb:'R1',lt:'L2',rt:'R2',view:'Create',menu:'Options',ls:'L3',rs:'R3',name:'PlayStation'},
  ns:{a:'B',b:'A',x:'Y',y:'X',lb:'L',rb:'R',lt:'ZL',rt:'ZR',view:'−',menu:'+',ls:'L-Stick',rs:'R-Stick',name:'Nintendo'},
  ouya:{a:'O',b:'A',x:'U',y:'Y',lb:'L1',rb:'R1',lt:'L2',rt:'R2',view:'System',menu:'Menu',ls:'L3',rs:'R3',name:'Ouya'}},
 /* what each job is bound to (same on every pad): b = button, h = it needs a hold */
 A:{use:{b:'x',h:1},melee:{b:'rs'},reload:{b:'x'},tactical:{b:'lb'},lethal:{b:'rb'},det:{b:'rb'},field:{b:'lb+rb'},crouch:{b:'b'},prone:{b:'b',h:1},jump:{b:'a'},sprint:{b:'ls'},fire:{b:'rt'},aim:{b:'lt'},swap:{b:'y'},ks:{b:'dright'},ping:{b:'dup'},mode:{b:'dleft'},nv:{b:'ddown',h:1},map:{b:'view'},sb:{b:'view',h:1},pause:{b:'menu'},mount:{b:'lt+rs'}},
 KBM:{F:'use',V:'melee',R:'reload',Q:'tactical',E:'lethal',G:'det',X:'field',C:'crouch',Space:'jump',T:'mount',B:'mode',N:'nv',M:'map',Tab:'sb',MMB:'ping',Esc:'pause'},
 detect(g){const id=((g&&g.id)||'').toLowerCase();if(/ouya|2836/.test(id))return'ouya';if(/054c|dualshock|dualsense|playstation|ps[345]|sony|wireless controller/.test(id))return'ps';if(/057e|nintendo|switch|pro controller|joy-?con|wii/.test(id))return'ns';return'xbox'},
 b(s){const l=PG.L[PG.type],d={dup:'D-pad ↑',ddown:'D-pad ↓',dleft:'D-pad ←',dright:'D-pad →'};return s.split('+').map(x=>d[x]||l[x]||x).join(' + ')},
 /* the label of one job, e.g. PG.l('use') = "hold □" on PlayStation */
 l(a){const d=PG.A[a];return d?(d.h?'hold ':'')+PG.b(d.b):a},
 ok(){return PG.L[PG.type][PG.type=='ns'?'b':'a']},back(){return PG.L[PG.type][PG.type=='ns'?'a':'b']},
 /* "Press F to open" -> "Hold □ to open" (only the known key words are touched) */
 t(s){if(typeof s!='string')return s;return s.replace(/\b(Press|Hold|Tap|press|hold|tap) (F|V|R|E|Q|X|C|T|B|N|G)\b/g,(m,v,k)=>{const a=PG.KBM[k],d=a&&PG.A[a];if(PG.on){if(!d)return m;const hold=d.h||/^[Hh]old/.test(v);return(hold?(v[0]=='h'?'hold ':'Hold '):v+' ')+PG.b(d.b)}return v+' '+(typeof ctlKey=='function'&&a?ctlKey(a):k)})},
 hint(){const l=PG.L[PG.type];return `${l.name} controller: ${l.ls} move · ${l.rs} look · ${l.rt} fire · ${l.lt} aim · ${PG.b('a')} jump · ${PG.b('b')} crouch (hold prone) · ${PG.b('x')} reload (hold use / buy / revive) · ${PG.b('y')} swap · ${l.lb} tactical · ${l.rb} lethal · ${l.lb}+${l.rb} second equipment (X) · ${l.ls} sprint · ${l.rs} melee (hold: draw it) · D-pad ↑ ping · D-pad ← fire mode · D-pad → killstreak · ${PG.b('view')} arena map · ${PG.b('menu')} pause`},
 help(){const l=PG.L[PG.type],k=(a,t)=>`<span><kbd class="pg">${a}</kbd> ${t}</span>`;return [k(l.ls,'move'),k(l.rs,'look'),k(l.ls+' held','sprint (click twice: tactical sprint, or steady aim while aiming)'),k(l.rs+' click','tap: melee strike · hold: draw your melee weapon (Nitrogen Fists: then aim = DASH) · '+l.lt+' + '+l.rs+' weapon mount'),k(l.lt,'aim'),k(l.rt,'fire'),k(l.lb,'tactical'),k(l.rb,'lethal'),k(l.lb+' + '+l.rb,'second equipment (Danger Zone lethal or Strategist tactical) · '+l.rb+' with none left detonates remote charges'),
  k(PG.b('a'),'jump / stand / mantle'),k(PG.b('b'),'crouch / slide, hold: prone / dive'),k(PG.b('x'),'reload, hold: interact / buy / revive'),k(PG.b('y'),'swap weapon'),k('D-pad ↑','ping'),k('D-pad ↓','inventory, hold: night vision'),k('D-pad ←','fire mode'),k('D-pad →','killstreak'),k(PG.b('view'),'arena map, hold: scoreboard'),k(PG.b('menu'),'pause'),
  k('D-pad / stick','menus: move'),k(PG.ok(),'menus: press'),k(PG.back(),'menus: back'),k(l.lb+' / '+l.rb,'menus: previous / next tab or loadout slot'),k(PG.b('x')+' / '+PG.b('y'),'on-screen keyboard: backspace / space')].join('')},
 setOn(on){if(on===PG.on)return;PG.on=on;usingPad=on;PG.dirty=1;PG.refresh()},
 sync(g,any){if(g){const t=PG.pref=='auto'||PG.pref=='kb'?PG.detect(g):PG.pref;if(t!==PG.type){PG.type=t;PG.dirty=1}}if(any&&!PG.on&&PG.pref!='kb'){PG.on=true;usingPad=true;PG.dirty=1}if(PG.dirty)PG.refresh()},
 refresh(){PG.dirty=0;if(PG.busy)return;PG.busy=1;try{const h=$('#hint');if(h){if(PG.h0==null)PG.h0=h.textContent;const w=PG.on?PG.hint():PG.h0;if(h.textContent!==w)h.textContent=w}
  for(const k of document.querySelectorAll('kbd')){if(k.closest('[data-pgskip]'))continue;const o=k.dataset.k0!=null?k.dataset.k0:(k.dataset.k0=k.textContent);let t=o;if(PG.on){const a=PG.KBM[o];if(a&&PG.A[a])t=PG.b(PG.A[a].b);else if(o=='LB'||o=='RB')t=PG.L[PG.type][o.toLowerCase()]}else{const a=PG.KBM[o];if(a&&typeof ctlKey=='function')t=ctlKey(a)}if(k.textContent!==t)k.textContent=t;k.classList.toggle('pg',PG.on&&t!==o)}
  if(PG.ctlB){const w=PG.on?PG.L[PG.type].name:'';PG.ctlH.textContent='Controller'+(w?' · '+w:'');const hh=PG.help();if(PG.ctlB.dataset.t!==hh){PG.ctlB.dataset.t=hh;PG.ctlB.innerHTML=hh}}
  const s=$('#pgs');if(s&&s.value!==PG.pref)s.value=PG.pref}finally{PG.busy=0;if(PG.mo)PG.mo.takeRecords()}},
 init(){const h=$('#hint');if(h)PG.h0=h.textContent;for(const e of document.querySelectorAll('#p-set h2')){const n=e.nextElementSibling;if(!n)continue;if(/Keyboard|VR/.test(e.textContent))n.dataset.pgskip=1;if(/^Controller/.test(e.textContent)){PG.ctlH=e;PG.ctlB=n;n.dataset.pgskip=1}}
  try{const p=localStorage.getItem('sd-pad');if(p&&(p=='auto'||p=='kb'||PG.L[p]))PG.pref=p}catch(e){}
  const s=$('#pgs');if(s){s.value=PG.pref;s.addEventListener('change',()=>{PG.pref=s.value;try{localStorage.setItem('sd-pad',PG.pref)}catch(e){}const g=gpGet();PG.type=PG.pref=='auto'||PG.pref=='kb'?(g?PG.detect(g):PG.type):PG.pref;PG.dirty=1;PG.applyPref();PG.refresh()})}
  /* menus and panels re-render themselves: translate their hints again whenever they change */
  let tm=0;PG.mo=new MutationObserver(()=>{if(PG.busy||tm)return;tm=setTimeout(()=>{tm=0;PG.refresh()},80)});PG.mo.observe(document.body,{childList:true,subtree:true});
  /* back to keyboard and mouse: the hints switch back too */
  const off=()=>{if(!window.SD_SPLIT&&PG.on&&PG.pref=='auto')PG.setOn(false)};addEventListener('keydown',e=>{if(e.isTrusted)off()},true);addEventListener('mousedown',off,true);let mx=0;addEventListener('mousemove',e=>{mx+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0);if(mx>40){mx=0;off()}else setTimeout(()=>{mx=0},400)},true);
  const g=gpGet();if(g){PG.type=PG.pref=='auto'||PG.pref=='kb'?PG.detect(g):PG.pref}PG.applyPref();PG.refresh();
  /* some browsers only announce a pad after its first button press: look for one every second (not while the keyboard or mouse is in use) */
  let lastIn=0;for(const ev of['keydown','mousedown','mousemove'])addEventListener(ev,()=>{lastIn=performance.now()},true);setInterval(()=>{if(PG.pref!='auto'||PG.on)return;const gg=gpGet();if(gg&&performance.now()-lastIn>2500){PG.type=PG.detect(gg);PG.on=true;usingPad=true;PG.dirty=1;PG.refresh()}},1000)},
 applyPref(){if(PG.pref=='kb'){if(PG.on)PG.setOn(false)}else if(PG.pref!='auto'){PG.type=PG.pref;if(!PG.on){PG.on=true;usingPad=true;PG.dirty=1}}}};
PG.init();
