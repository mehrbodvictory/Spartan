/* ######## interface.js ######## */
/* ===================== mastery.js ===================== */
/* ---------- Progression: levels 1-55, prestige 1-10, Prestige Master (to 1250), unlocks, weapon mastery, camos ---------- */
var UNL={TEA:38,AR:1,MG:1,SMG:8,BR:16,MP:24,SG:32,'Extended Mag':2,'Compensator':6,'Laser Sight':12,'Fast Hands':18,'Long Barrel':28,'Hollow Point':40,Frag:1,Impact:22,Marathon:4,Scavenger:14,Overshield:26,'Spring Legs':36,'Second Wind':44,'Hardline':50,'Run & Gun':10,'Semtex':18,'Quick Fix':16,VMP:20,RG:30,CY:34,CT:12,MVR:1,TRB:22,TUR:26,SW:21,LT:28,PD:38};
var CATS={Rifles:['AR','MVR','TRB','TUR','BR','VA','OH','SW','PD'],'Close Quarters':['SMG','SG','VMP','BP','KTS','RD','LT'],Sidearms:['CT','MG','MP','RG','HC'],'Power Weapons':['RL','SN','TEA'],Support:['CY']};
var srcK='',curCamo=null,prof=(()=>{try{const p=JSON.parse(localStorage.getItem('sd-prof'));if(p&&p.v==1)return p}catch(e){}return{v:1,lvl:1,xp:0,pres:0,master:0,ml:1,wk:{},camo:{}}})();
var save=()=>{try{localStorage.setItem('sd-prof',JSON.stringify(prof))}catch(e){}},need=()=>prof.master?1500:1500+prof.lvl*10,nm=k=>W[k]?W[k].n:(k.startsWith('sk:')&&typeof STK!='undefined'&&STK[k.slice(3)]?STK[k.slice(3)].n+' (streak)':k),tx={};
/* Prestige rules: going back to level 1 resets the unlocks (camos are never touched). What stays: items that were unlocked permanently with an unlock token (one earned per prestige),
   everything up to level 5 x your prestige number (automatic permanent unlocks), and at Prestige Master everything is permanently unlocked. */
var PAUTO=5;
function permHas(v){return !!(prof.master||(prof.pres>0&&UNL[v]<=PAUTO*prof.pres)||(prof.perm&&prof.perm.includes(v)))}
function unlocked(v){return !UNL[v]||prof.master||prof.all||prof.lvl>=UNL[v]||permHas(v)}
function tokenSpend(v){if(!UNL[v]||unlocked(v)||!(prof.tok>0)||prof.master)return false;const label=v.startsWith('sk:')?(STK[v.slice(3)]?STK[v.slice(3)].n:v):(W[v]?W[v].n:v);if(!confirm(`Spend 1 unlock token to permanently unlock ${label}? It stays unlocked through every future prestige.`))return false;
 prof.perm=prof.perm||[];prof.perm.push(v);prof.tok--;save();showRank();try{ldRender()}catch(e){}return true}
function sanitize(){const u=unlocked;if(!u(L.p))L.p='AR';if(L.s&&!u(L.s))L.s='MG';if(L.g&&!u(L.g))L.g=null;L.pa=L.pa.filter(a=>u(a)&&attachmentFits(L.p,a));L.sa=L.sa.filter(a=>u(a)&&attachmentFits(L.s,a));L.pk=L.pk.filter(u);if(!L.s)L.sa=[]}
function rankTxt(){return prof.master?`Prestige Master ${prof.ml} / 1250 · ${prof.xp}/1500 XP`:`${prof.pres?'Prestige '+prof.pres+' · ':''}${prof.tok>0?prof.tok+(prof.tok>1?' unlock tokens · ':' unlock token · '):''}Level ${prof.lvl}${prof.lvl<55?` · ${prof.xp}/${need()} XP`:' (max) · ready to prestige'}`}
var mUps=[],won=0,mCost=1500;
function giveXP(g){if(prof.master){prof.xp+=g;while(prof.xp>=1500&&prof.ml<1250){prof.xp-=1500;prof.ml++}if(prof.ml>=1250)prof.xp=0}
 else if(prof.lvl<55){prof.xp+=g;while(prof.xp>=need()&&prof.lvl<55){prof.xp-=need();prof.lvl++;const u=[];for(const k in UNL)if(UNL[k]==prof.lvl&&!permHas(k))u.push(nm(k));mUps.push(...u)}if(prof.lvl>=55)prof.xp=0}save()}
function killXP(head){const x=Math.min(Math.round(mCost*(.06+(head?.03:0)+Math.min(streak,5)*.005)),Math.max(0,2.5*mCost-mxp));mxp+=x;giveXP(x);return x}
function bonusXP(f){const x=Math.min(Math.round(mCost*f),Math.max(0,3*mCost-mxp));mxp+=x;giveXP(x)}
function awardXP(){let b=Math.min(Math.round(mCost*(.5+(won?.5:0))),Math.max(0,3*mCost-mxp));if(mxp+b<mCost)b=mCost-mxp;if(b>0){giveXP(b);mxp+=b}return `+${mxp} XP (${(mxp/mCost).toFixed(1)} levels) · ${rankTxt()}${mUps.length?'<br>Unlocked: '+mUps.join(', '):''}${prof.lvl>=55&&!prof.master?'<br>Open the menu to prestige!':''}`}
function doPrestige(){if(prof.master||prof.lvl<55)return;if(!confirm(prof.pres<10?`Prestige ${prof.pres+1}? You go back to level 1 and your unlocks reset. Camos are kept. You earn 1 permanent unlock token, and everything up to level ${PAUTO*(prof.pres+1)} is unlocked permanently.`:'Become Prestige Master? Everything is unlocked permanently and levels now go up to 1250.'))return;if(prof.pres<10){prof.pres++;prof.tok=(prof.tok|0)+1}else{prof.master=1;prof.ml=1}prof.lvl=1;prof.xp=0;save();showRank()}
function showRank(){$('#rank').textContent=rankTxt();homeStats();const b=$('#prest');b.style.display=!prof.master&&prof.lvl>=55?'inline-block':'none';b.textContent=prof.pres<10?'Prestige '+(prof.pres+1)+' · +1 unlock token':'Become Prestige Master · unlock everything';sanitize();ui();masteryUI()}
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
function wkill(k){if(!k||!W[k])return;const before=okSet(),w=wd(k);w.k++;w.c++;save();announceCamoUnlocks(before)}
function wzkill(k){if(!k||!W[k])return;const before=okSet(),w=wd(k);w.z=(w.z||0)+1;save();announceCamoUnlocks(before)}
function zRoundDone(r){if(r<=(prof.zbest||0))return;const before=okSet();prof.zbest=r;save();announceCamoUnlocks(before)}
function wpres(k){const w=wd(k);if(wlv(k)<20||w.p>=3)return;const before=okSet();w.p++;w.c=0;prof.camo[k]=['Ember','Frost','Aurora'][w.p-1];save();masteryUI();announceCamoUnlocks(before)}
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
 if(pap){curCamo=null;return pap}
 const name=myCamo(k);
 curCamo=name?allCamos(k).find(c=>c.n===name)||null:null;
 return camoRm(k,name);
}
/* material for a weapon held by another player: their camo by name, shown even if this player has not unlocked it */
var crm={};function camoRm(k,n){if(!n)return;if(typeof n==='string'&&n.startsWith('pass/'))return passCamoMaterial(k,n);const c=allCamos(k).find(x=>x.n==n);if(!c)return;if(c.anim)return rfMat(c.n);return crm[c.n]||(crm[c.n]=new THREE.MeshLambertMaterial({map:tx[c.n]||(tx[c.n]=camoTex(c.c,c.s)),color:0xffffff}))}
function myCamo(k){const season=passFinish(k);if(season)return season;const n=prof.camo[k];return n&&allCamos(k).some(x=>x.n==n&&x.ok)?n:''}
function camoFx(){for(const n in rfm)rfm[n].uniforms.t.value=performance.now()/1000}
var camoSel=k=>{const o=c=>`<option value="${c.n}" ${prof.camo[k]==c.n?'selected':''}>${c.n}${c.anim?' ✦':''}</option>`,mp=camos(k).filter(c=>c.ok),zm=zcamos(k).filter(c=>c.ok);return `<select data-w="${k}"><option value="">Default camo</option>${mp.length?`<optgroup label="Multiplayer camos">${mp.map(o).join('')}</optgroup>`:''}${zm.length?`<optgroup label="Zombies camos">${zm.map(o).join('')}</optgroup>`:''}</select>`};
function masteryUI(){$('#wm').innerHTML=Object.keys(W).map(k=>{const w=wd(k),nx=camos(k).find(c=>!c.ok&&!c.pr);return `<div class="wr"><span><b>${nm(k)}</b> Lv ${wlv(k)}${w.p?' ★'+w.p:''} · ${w.k} kills</span><span>${camoSel(k)}${wlv(k)==20&&w.p<3?`<button class="btn sm" data-pw="${k}">Prestige weapon</button>`:''}</span><i>${nx?'Next camo: '+nx.n+' ('+nx.rq+')':'All camos unlocked'} · Weapon prestige ${w.p}/3</i></div>`}).join('');zmasteryUI()}
function zmasteryUI(){const e=$('#zwm');if(!e)return;e.innerHTML=Object.keys(W).map(k=>{const w=wd(k),nx=zcamos(k).find(c=>!c.ok);return `<div class="wr"><span><b>${nm(k)}</b> · ${w.z||0} zombie kills</span><span>${camoSel(k)}</span><i>${nx?'Next camo: '+nx.n+' ('+nx.rq+')':'All zombie camos unlocked'}</i></div>`}).join('')}
$('#wm').onchange=$('#zwm').onchange=e=>{const k=e.target.dataset.w;if(k){prof.camo[k]=e.target.value;save()}};$('#wm').onclick=e=>{const k=e.target.dataset.pw;if(k)wpres(k)};
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
 clearTimeout(rcTimer);rcTry=0;for(const k in grace){clearTimeout(grace[k]);delete grace[k]}for(const c of conns)try{if(c.open)sendPeerPacket(c,{t:'bye',id:myId})}catch(e){}for(const c of conns)try{c.close()}catch(e){}conns=[];if(net)try{net.destroy()}catch(e){}net=null;netOn=0;isHost=0;names=Object.create(null);peerLooks.clear();scores={};document.body.classList.remove('net');$('#hostbox').style.display='none';lobbyList();if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}}
/* a match ended: everybody stays connected and returns to the same lobby; only leaving the lobby disconnects */
function netEnd(){netOn=0;setRoomRound(0);scores={};document.body.classList.remove('net');if(soloMode!=null){sel.mode=soloMode;soloMode=null;ui()}lobbyList();lobby(partyActive?(isHost?'Party ready for another match.':'Waiting for the leader to deploy.'):isHost?'Match over. Everyone is still here. Pick a mode and map, then press Start match.':'Match over. Waiting for the host to start the next one…')}
async function roomAddress(code,party,opening){
 if(window.SD_SPLIT)return 'sdrill-'+code;
 const auth=await inviteIdentity(party?'party':'match',code);
 if(opening!==roomOpening)return '';
 roomAuth=auth;return auth.id;
}
async function hostMatch(localCode,wantsParty=false){
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
 peer.on('disconnected',()=>{if(net===peer)try{peer.reconnect()}catch{}});
 peer.on('open',id=>{
  if(net!==peer)return;
  myId=id;isHost=1;names[id]=myName;$('#code').textContent=code;$('#hostbox').style.display='block';
  lobby(partyActive?'Share this code. The leader controls deployment.':'Share this code. Press Start when everyone has joined.');lobbyList();
 });
 peer.on('connection',link=>{
  if(net===peer&&isHost&&pendingRoomLinks.size<8)reg(link);else link.close();
 });
 peer.on('error',error=>{
  if(net===peer)lobby(error.type==='unavailable-id'?'That room ID is in use. Create a new room.':'Network error: '+error.type);
 });
}
async function joinMatch(value,wantsParty=false){
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
 peer.on('open',id=>{clearTimeout(signalingTimer);if(net===peer){myId=id;names[id]=myName;reg(connectDataPeer(peer,hostPid))}});
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
var bhProof=n=>bhSha([n,BHK.ver,BHK.mode,...bhFns().map(f=>Function.prototype.toString.call(f))].join('\u0001'));
var bhNonce=()=>{try{const a=new Uint32Array(4);crypto.getRandomValues(a);return[...a].join('-')}catch(e){return Math.random()+'-'+Date.now()}};
const resumeProof=(ticket,nonce)=>ticket?bhSha('rejoin\u0001'+nonce+'\u0001'+ticket):Promise.resolve('');
function bhReject(cn,why){cn.blocked=true;try{sendPeerPacket(cn,{t:'bhx',w:why})}catch(e){}if(!isHost)lobby(why);setTimeout(()=>{try{cn.close()}catch(e){}},350)}
function bhStart(cn){
 cn.vf=0;cn.sent=0;cn.theirs=0;cn.mn=bhNonce();
 const auth=cn.auth;
 cn.binding=auth?privateChannelBinding(cn):'';
 if(auth&&!cn.binding)return bhReject(cn,'Could not verify the secure connection.');
 sendPeerPacket(cn,{t:'bh1',v:BHK.ver,m:BHK.mode,n:cn.mn});
}
function bhMsg(d,cn){
 if(d.t==='bhx'){if(!isHost){cn.joinFailure='The room could not verify this connection. Check your code and reload the game.';lobby(cn.joinFailure)}return}
 const role=isHost?'host':'guest',otherRole=isHost?'guest':'host',auth=cn.auth;
 if(d.t==='bh1'){
  if(cn.challenge)return;cn.challenge=true;
  if(d.v!==BHK.ver||d.m!==BHK.mode||typeof d.n!=='string'||!d.n||d.n.length>64){
   bhReject(cn,'Incompatible game version. Reload before joining.');return;
  }
  const challenge=d.n+'\n'+cn.binding;
  Promise.all([bhProof(d.n),resumeProof(isHost?'':roomTicket,d.n),auth?auth.proof(role,challenge):'']).then(([p,resume,invitation])=>{
   if(cn.blocked||!cn.open)return;
   sendPeerPacket(cn,{t:'bh2',p,resume,invitation});cn.sent=1;bhDone(cn);
  }).catch(()=>bhReject(cn,'Could not verify this room.'));
  return;
 }
 if(d.t==='bh2'&&!cn.answer){
  cn.answer=true;
  const ticket=isHost?roomTickets.get(cn.peer):null;
  const challenge=cn.mn+'\n'+cn.binding;
  Promise.all([bhProof(cn.mn),resumeProof(ticket,cn.mn),auth?auth.verify(otherRole,challenge,d.invitation):true]).then(([p,resume,verified])=>{
   if(cn.blocked||!cn.open)return;
   if(d.p===p&&verified){
    cn.reclaimed=ticket&&d.resume===resume?ticket:null;
    cn.theirs=1;bhDone(cn);
   }else bhReject(cn,'Invalid invitation or incompatible game build.');
  }).catch(()=>bhReject(cn,'Could not verify this room.'));
 }
}
function bhDone(cn){
 if(cn.blocked||!cn.open||cn.vf||!(cn.sent&&cn.theirs))return;
 const pending=cn.pq||[];cn.pq=null;cn.vf=1;
 clearTimeout(cn.verifyTimer);pendingRoomLinks.delete(cn);
 if(!regOpen(cn))return;
 for(const message of pending)acceptGamePacket(message,cn);
}
/* ---------- the host vets everything a guest sends before it acts on it or relays it ---------- */
const guestPacketTypes=new Set(['s','hit','bh','dead','sh','chat','mark','sko','skh','skx','nuke','oi','bye','hi','identity',
 'zqb','zqd','zqe','zqh','zqp','zqw','zqr','zqv','zdn','zmainuse','party-sw','party-bench','vox-shots','vox-blast']);
const guestRelayTypes=new Set(['s','hit','dead','sh','sko','skh','skx','nuke','oi','zqv','zdn']);
const hostPacketTypes=new Set([...guestPacketTypes,'roster','start','admitted','removed','full','room-policy','room-denied',
 'b','bsh','o','ob','f','z','kd','kg','feed','pop','end','party-queue','party-return','party-sw-launch','vox-update',
 'zs','zb','zbt','zbs','zbl','zd','zg','zpg','zpu','zpc','zk','zrev','zmainhit','zmainnote','zmaincue','zmainwin']);
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
  v.zd=v.zd.filter(x=>n-x[0]<1000);v.zd.push([n,dm]);
  const hitLimit=sel.map==='London'?90:45;
  if(v.zd.length>hitLimit||v.zd.reduce((a,x)=>a+x[1],0)>60000)return bad();
 }
 else if(t=='s'){
  if(!validNetPose(d))return bad();
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
 if(isHost&&!ticket&&(netOn&&run||partyOperationOpen)){
  sendPeerPacket(cn,{t:'room-denied',w:'A match is in progress. Join after the host returns to the lobby.'});
  cn.blocked=true;setTimeout(()=>cn.close(),350);return false;
 }
 if(isHost&&(ticket&&cn.reclaimed!==ticket||!ticket&&roomLocked)){
  sendPeerPacket(cn,{t:'room-denied',w:ticket?'This connection could not reclaim its seat.':'The host has locked this room.'});
  cn.blocked=true;setTimeout(()=>cn.close(),350);return false;
 }
 if(isHost&&maxP&&(conns.length>=maxP-1||partyActive&&(run||partyOperationOpen)&&!hasOwn(names,cn.peer))){
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
function reg(cn){
 const owner=net;
 cn.last=performance.now();cn.vf=0;cn.auth=roomAuth;
 pendingRoomLinks.add(cn);
 cn.verifyTimer=setTimeout(()=>{
  pendingRoomLinks.delete(cn);
  if(net===owner&&!cn.vf){
   if(!isHost){
    cn.joinFailure=cn.open?'Could not verify the room. Make sure both players are running the same build.':'Could not connect directly. One of the networks may block peer-to-peer connections.';
    if(!netOn&&!window.SD_SPLIT&&!conns.length){failInitialJoin(owner,cn.joinFailure);cn.close();return}
    lobby(cn.joinFailure);
   }
   cn.close();
  }
 },window.SD_SPLIT?12000:25000);
 cn.on('open',()=>{if(net===owner)bhStart(cn);else cn.close()});
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
   cn.joinFailure='The direct connection failed. Check the code and try again.';lobby(cn.joinFailure);
  }
 });
 cn.on('close',()=>{clearTimeout(cn.verifyTimer);pendingRoomLinks.delete(cn);if(net===owner)netLost(cn)});
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
  failInitialJoin(net,cn.joinFailure||'Could not connect to that room. Check the code and try again.');
  return;
 }
 if(partyActive&&partyOperationOpen)partyDispatch({type:'lost'},cn.peer);
 if(netOn||Object.keys(names).length>1)guestRetry()}
function guestRetry(){if(!net||isHost||hostBye)return;if(conns.some(c=>c.open)){rcTry=0;return}if(rcTry++>=12){lobby('Lost connection to the host');if(netOn)setTimeout(()=>endGame('Disconnected'),300);return}
 lobby('Connection lost. Reconnecting… ('+rcTry+'/12)');if(run)msg('Reconnecting…',1.2);try{if(net.disconnected)net.reconnect()}catch(e){}
 try{const c=connectDataPeer(net,hostPid);reg(c);c.on('open',()=>{lobby('Reconnected');if(run)msg('Reconnected',1.5)})}catch(e){}
 clearTimeout(rcTimer);rcTimer=setTimeout(guestRetry,2500)}
/* heartbeat: keeps NAT mappings open, and any link silent for 25 s is closed so it can be retried */
setInterval(()=>{const n=performance.now();for(const c of conns)if(c.open){try{sendPeerPacket(c,{t:'ping'})}catch(e){}if(c.last&&n-c.last>25000){try{c.close()}catch(e){}}}},1000);
function dropPeer(id){roomTickets.delete(id);roomReceived.delete(id);recentDamage.delete(id);const i=bots.findIndex(b=>b.net&&b.id==id);if(i>=0){S.remove(bots[i].m);bots.splice(i,1)}if(!hasOwn(names,id))return;if(run)feed(names[id]+' left');delete names[id];peerLooks.delete(id);if(partyActive)partyMemberLeft(id);broadcastRoster();lobbyList()}
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
 case'party-sw-launch':case'party-sw':partyReadStormwatch(d,cn);break;
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
 case's':{const b=bots.find(b=>b.net&&b.id==d.id);if(b){b.tx=d.x;b.ty=d.y;b.tz=d.z;if(mode==='Zombies'&&Math.abs(b.x-b.tx)>150){b.x=b.tx;b.y=b.ty;b.z=b.tz}b.yaw=d.yaw;if(d.w)setHeld(b,d.w,d.cm,d.at);b.st=d.st||0;b.aj=d.aj||0;b.em=(d.em|0)>0&&(d.em|0)<=EMLEN.length?(d.em|0)-1:-1;b.pi=d.pi||0;b.rlOn=!!d.r;b.zpts=d.p;b.dn=d.dn;if(b.al&&!d.al)burst(V(b.x,1,b.z),16,0x3d6ad6,6,.8,.15);b.al=d.al}break}
 case'hit':if(d.to==myId&&run&&!P.dead){if(!(d.d>=0)||(d.d>300&&!SK.nk)||(!SK.nk&&!hitRateOK(d.id,d.d)))break;d.d=Math.min(d.d,10000);lastAtk=d.bot!=null?'b'+d.bot:d.id;lastAttackHead=d.head===true;try{hurt(d.d,bots.find(b=>b.net&&b.id==lastAtk))}finally{lastAtk='';lastAttackHead=false}}break;
 case'bh':if(isHost&&mode!='Private'){const t=bots.find(b=>!b.net&&b.i==d.i&&b.al),by=bots.find(b=>b.net&&b.id==d.id);if(t&&by)botHit(t,d.d,by,d.head===true)}break;
 case'dead':{const by=d.by;if(isHost&&mode=='Kill Confirmed')try{kcNetDeath(d)}catch(e){}if(by!=myId)feed(by?`${nmOf(by)} ▸ ${nmOf(d.v)}`:nmOf(d.v)+' died');
  if(mode=='Private'){if(by)scores[by]=(scores[by]||0)+1}else if(isHost&&by)credit(by);
  if(by==myId&&d.v!=myId){kills++;const b=bots.find(b=>b.net&&b.id==d.v);if(b){const head=d.head===true;featKill(b,head);juiceKill(b,head)}}break}
 case'sh':{const b=bots.find(b=>b.net&&b.id==d.id);if(b&&b.al)remoteShot(b,d.w,V(d.x,d.y,d.z),undefined,d.hand===1?1:0);break}
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
  else if(w==='Victory')w=(names[d.id]||'Host')+' wins';
  netBd=vettedMatchBoard(d.bd);netSc=d.sc?netTeamScores(d.sc):null;endGame(w);
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
function beginNet(map,m,teams){if(soloMode==null)soloMode=sel.mode;sel.map=map;sel.mode=m;mpTeams=teams;myTeam=teams[myId]||'A';netOn=1;scores={};document.body.classList.add('net');startGame();for(const id in names)if(id!=myId)addNetBot(id,teams[id]);
 if(!isHost&&!window.SD_SPLIT){paused=1;showPause();$('#pt').textContent='Match ready'}}
function netShot(k,o,d,len,hand=0){netSend({t:'sh',w:k,hand,x:+(o.x+d.x*len).toFixed(1),y:+(o.y+d.y*len).toFixed(1),z:+(o.z+d.z*len).toFixed(1)})}
function mpEnd(t){netSend({t:'end',w:t,ht:myTeam,nk:NUKE_BY||0,bd:board().map(r=>[r.id,r.nm,r.k,r.d,r.tm,r.operator]),sc:teamMode()?(mode=='Capture the Flag'?cs:mode=='Domination'||mode=='Hardpoint'?ds:mode=='Kill Confirmed'?kc:{A:ts.A||0,B:ts.B||0}):null})}
function netTick(dt){if(!run)return;nacc+=dt;if(nacc>.066){nacc=0;netSend({t:'s',x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:+yaw.toFixed(2),al:P.dead?0:1,w:cw().k,cm:fpG.userData.camo||'',at:fpG.userData.attachments||[],r:rel>0?1:0,p:zq?zq.pts:0,dn:zq&&zq.down?1:0,st:ST.slide>0?3:ST.dive>0?4:ST.prone?2:ST.crouch?1:0,aj:P.on||P.swimming?0:1,em:EMO.cur?EMO.cur.id+1:0,pi:+pitch.toFixed(2),sp:ST.tac>0||(P.spr||0)>.55?1:0})}
 if(isHost&&mode!='Private'){bacc+=dt;if(bacc>.1){bacc=0;if(mode!='Zombies')netSend({t:'b',l:bots.filter(b=>!b.net).map(b=>[b.i,b.team,b.al?1:0,+b.x.toFixed(1),+b.z.toFixed(1),b.nm,b.wk,b.rl>0?1:0,+b.y.toFixed(2)])})}oacc+=dt;if(oacc>.25){oacc=0;netSend({t:'ob',s:$('#ob').textContent})}}
 const k=Math.min(1,dt*12);for(const b of bots)if(b.net){b.x+=(b.tx-b.x)*k;b.y+=(b.ty-b.y)*k;b.z+=(b.tz-b.z)*k;b.m.position.set(b.x,b.y,b.z);b.tyaw=b.yaw+Math.PI;if(!b.al&&b.ry==null)b.m.rotation.y=b.tyaw;const lie=mode=='Zombies'&&!b.al&&b.dn;if(!b.al){b.m.rotation.y=b.tyaw}const pp=b.pp||0,ry_=b.ry==null?b.tyaw:b.ry,sf=lie?0:pp*.85;b.m.rotation.x=lie?-1.5:pp*(b.st==4?1.05:1.45);b.m.position.set(b.x-Math.sin(ry_)*sf,b.y+(lie?.16:pp*(b.st==4?.55:.17)),b.z-Math.cos(ry_)*sf);b.m.visible=!!b.al||!!lie;b.hp=1e9}
 if(!isHost&&mode=='Domination')for(const z of zones)zoneVis(z);
 if(!isHost&&mode=='Capture the Flag')for(const f of flags){f.m.position.set(f.x,0,f.z);f.m.visible=f.byk!=myId}}
function privTick(){const top=Math.max(0,...Object.values(scores));$('#ob').textContent=`Players only · You ${scores[myId]||0} · Top ${top} / 15`;for(const id in scores)if(scores[id]>=15){endGame(id==myId?'Victory':(names[id]||'A player')+' wins');return}}

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
 const panel=$('#p-'+page);
 if(!panel)return;
 if(page!=='queue')clearMatchSearch();
 if(page==='play')renderMatchSetup();
 if(page==='record')renderCombatRecord(app);
 const primary={play:playPanel(),record:playPanel(),queue:'lobby',priv:playPanel(),zguide:'zplay',ks:'load',mast:'load',cust:app==='zm'?'cust':'load'}[page]||page;
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
   const kind=k==='?'?'Any playlist':playlistKinds[k]||'Multiplayer';
   const mark=k==='?'?'shuffle':kind.startsWith('Team')?'team':kind==='Wave survival'?'wave':'target';
   return `<button class="c playlist-choice" data-a="mode" data-v="${esc(k)}"><span class="playlist-mark" data-kind="${mark}" aria-hidden="true"></span>
    <span><b>${k==='?'?'Random mode':esc(k)}</b><small>${kind}</small></span><span class="setup-check" aria-hidden="true"></span></button>`;
  }).join('');
  maps.innerHTML=[...Object.keys(MAPS).filter(k=>!MAPS[k].zm),'?'].map(k=>`<button class="c map-choice" data-a="map" data-v="${esc(k)}" data-map-art="${esc(k)}">
   <span class="map-choice-art" aria-hidden="true"></span><b>${k==='?'?'Random map':esc(k)}</b><span class="setup-check" aria-hidden="true"></span></button>`).join('');
 }
 for(const b of modes.children)b.setAttribute('aria-pressed',String(b.dataset.v===modeKey));
 for(const b of maps.children)b.setAttribute('aria-pressed',String(b.dataset.v===mapKey));
 $('#setup-rule').textContent=modeKey==='?'?'A playlist is picked when the search starts.':MODES[modeKey];
 $('#setup-map').dataset.mapArt=mapKey;
 $('#setup-map-name').textContent=mapKey==='?'?'Random map':mapKey;
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
 $('#hzs').textContent=best?'Best round '+best:'3 survival maps';$('#hms').textContent=rankTxt();
}
function fillPriv(a){
 const zm=a==='zm',map=$('#pm');
 $('#pmode').innerHTML=zm?'<option value="Zombies">Zombies co-op</option>':('<option value="Private">Free-for-all (players only)</option>'+Object.keys(MODES).filter(k=>k!=='Zombies').map(k=>`<option>${k}</option>`).join('')+'<option value="?">Random mode</option>');
 map.innerHTML=Object.keys(MAPS).filter(k=>!!MAPS[k].zm===zm).map(k=>`<option>${k}</option>`).join('')+(zm?'':'<option value="?">Random map</option>');
 if(zm&&MAPS[sel.zmap]?.zm)map.value=sel.zmap;
 $('#pmodeL').hidden=zm;$('#pbL').hidden=zm;$('#p-priv h2').textContent=zm?'Zombies co-op':'Private match';
}
function setApp(a){
 if(a!==app||!net)fillPriv(a);
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
function showPause(){$('#match-intel').textContent=matchIntel();for(const k in key)key[k]=false;trig=0;arenaSoundCaptions.clear();$('#pt').textContent=typeof netOn!='undefined'&&netOn?'Menu (the match keeps running)':'Paused';$('#aa2').value=String(AA);$('#sn2').value=sens;$('#fv2').value=fovBase;updateMatchModeration();syncRoomLockControls();renderNextLifeLoadouts();$('#pause').style.display='block'}
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
 if(keepParty)netEnd();else netClose();
 for(const b of bots)S.remove(b.m);bots=[];
 for(const g of grs)S.remove(g.m);grs=[];
 clearFlags();buildMap();$('#menu').style.display='block';showRank();
 if(keepParty)openMenuPanel(playPanel(),false);
}
$('#exit').onclick=()=>{
 if(window.SD_SPLIT){parent.postMessage('stormwatch-exit-split',location.origin);return}
 if(partyActive&&netOn)netSend({t:isHost?'party-return':'party-bench'});
 exitNetworkMatch(partyActive);
};
/* the old corner-click dev panel can no longer be opened */
var hc=0,arm=0,buf='';
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
function finStart(t,sc,nb,xp){podClear();fin=1;fs='vic';ft=0;fe=0;const w=t=='Victory',rows=finRows();finInfo={w,rows};
 $('#hud').style.display=$('#pause').style.display=$('#end').style.display='none';
 $('#fvt b').textContent=w?'Victory':'Defeat';$('#fvt span').textContent=t=='Victory'||t=='Defeat'?`${mode} on ${sel.map}`:t;
 const acc=shots?Math.round(hits/shots*100):0,tt=teamTxt();
 $('#fbd').innerHTML=`<h2>${w?'Victory':'Defeat'}</h2><p class="sub">${esc(mode)} on ${esc(sel.map)}${tt?' · '+tt:''}</p><table><thead><tr><th></th><th>Player</th><th>Kills</th><th>Deaths</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td style="border-left-color:${TEAMC[r.tm]||'transparent'}">${i+1}</td><td>${idrBoardName(r,r.me?' (you)':'')}</td><td>${r.k}</td><td>${r.d==null?'–':r.d}</td></tr>`).join('')}</tbody></table><p class="fs">${kills} kills · ${deaths} deaths · ${acc}% accuracy · Score ${sc}${esc(nb)}</p><p class="fs">${xp}</p><button id="fcont" class="big">Continue</button>`;
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
function zCrowd(){zcr=[];const rd=Math.max(1,typeof zq!='undefined'&&zq?zq.r:6);for(let i=0;i<30;i++){const R=4.8+Math.random()*5.2,ph=(Math.random()*2-1)*1.75,x=R*Math.sin(ph),z=-R*Math.cos(ph)+.5,big=i%9==4,{m,rig}=zModel(rd,big,i);m.position.set(x,0,z);const q=Math.atan2(-x,-z+.0001)+Math.PI;podG.add(m);zcr.push({m,rig,zom:1,i,x,z,tyaw:Math.atan2(-x,2.5-z),ry:Math.atan2(-x,2.5-z)+(Math.random()-.5)*.5,ph:Math.random()*6,big})}}
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
addEventListener('keydown',e=>{if(fs!='pod')return;const i=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(i>=0)myEmote(i)});
function podClear(){if(podG){S.remove(podG);podG=null}zcr=[];figs=[];conf=[];fLab=[];$('#fnm').innerHTML=''}
/* a new match or leaving early: drop everything the finale created */
function finStop(){podClear();fin=0;fs='';netBd=netSc=null;const F=$('#fin');F.style.display='none';F.className=''}
/* podium done: back to the main menu (fades from black) */
function toMenu(){if(window.SD_SPLIT){parent.postMessage('spartan-restart-split',location.origin);fs='';return}podClear();fin=0;fs='';netBd=netSc=null;if(net&&(isHost||conns.length))netEnd();else netClose();for(const b of bots)S.remove(b.m);bots=[];for(const g of grs)S.remove(g.m);grs=[];clearFlags();endDeath();buildMap();hideFP();showRank();
 $('#hud').style.display=$('#end').style.display='none';$('#menu').style.display='block';if(partyActive)openMenuPanel(playPanel(),false);else if(net)$('#nav button.'+app+'[data-p="priv"]').click();const F=$('#fin');F.className='blk';void F.offsetWidth;F.className='';setTimeout(()=>{if(!fin)F.style.display='none'},600)}

/* ===================== touch.js ===================== */
/* ---------- mobile touch controls + no-zoom / no-copy protections ---------- */
var isTouch=false;var tc=document.createElement('div');tc.id='tc';$('#hud').appendChild(tc);
var noLock=matchMedia('(hover:none)').matches||!R.domElement.requestPointerLock;
tc.innerHTML='<div id="stick"><i></i></div>'+[['jump','JUMP','right:18px;bottom:22px;width:76px;height:76px'],['reload','RELOAD','right:106px;bottom:22px'],['swap','SWAP','right:106px;bottom:90px'],['nade','NADE','right:30px;bottom:108px'],['ks','STREAK','right:106px;bottom:158px'],['melee','MELEE','right:30px;bottom:176px'],['pause','II','right:10px;top:10px;width:44px;height:44px']].map(([k,t,s])=>`<div class="tb" data-b="${k}" style="${s}">${t}</div>`).join('');
var st={id:null},lk={id:null,x:0,y:0},fi={id:null,x:0,y:0},bt={};
function enableTouch(){if(isTouch)return;isTouch=true;document.body.classList.add('touch');$('#hint').textContent='Left side: look · Right side: shoot · Stick: move · Buttons: jump, reload, grenade, melee'}
if(matchMedia('(pointer:coarse)').matches)enableTouch();
function lockPtr(){if(window.SD_SPLIT){paused=0;hidePause();return}if(noLock){paused=0;hidePause();try{const d=document.documentElement;d.requestFullscreen&&d.requestFullscreen().catch(()=>{});screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}else{const request=R.domElement.requestPointerLock?.();request?.catch?.(()=>{})}}
function stickMove(t){const r=$('#stick').getBoundingClientRect(),R0=r.width/2;let dx=t.clientX-(r.left+R0),dy=t.clientY-(r.top+R0);const m=Math.hypot(dx,dy);if(m>R0){dx*=R0/m;dy*=R0/m}const nx=dx/R0,ny=dy/R0;$('#stick i').style.transform=`translate(${dx}px,${dy}px)`;key.KeyW=ny<-.3;key.KeyS=ny>.3;key.KeyA=nx<-.3;key.KeyD=nx>.3;key.ShiftLeft=ny<-.5&&Math.hypot(nx,ny)>.97;0}
function stickEnd(){st.id=null;$('#stick i').style.transform='';key.KeyW=key.KeyS=key.KeyA=key.KeyD=key.ShiftLeft=false}
function look(t,o){const k=.0042*sens*fr;yaw-=(t.clientX-o.x)*k;pitch=cl(pitch-(t.clientY-o.y)*k,-1.45,1.45);o.x=t.clientX;o.y=t.clientY}
function tbDown(k){if(k=='jump')key.Space=1;else if(k=='reload')startRel();else if(k=='nade')throwG();else if(k=='melee')melee();else if(k=='swap')swap((cur+1)%wp.length);else if(k=='ks'){if(mode=='Zombies')key.KeyF=1;useStreak()}else if(k=='pause'&&run&&!paused&&!over){paused=1;trig=0;stickEnd();showPause()}}
var live=e=>run&&!paused&&!over&&!(e.target.closest&&e.target.closest('#pause,#end,#menu,#dev,#home'));
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
 $('#z-location').textContent=key;$('#z-description').textContent=info?.brief||MAPS[key].d.replace(/^Zombies map: /,'');
 for(const card of $$('#zmaps [data-zm]'))card.setAttribute('aria-pressed',String(card.dataset.zm===key));
 if(persist)saveSet();
}
function zMapScreen(){
 const maps=Object.keys(MAPS).filter(k=>MAPS[k].zm);
 $('#zdeploy').disabled=!maps.length;
 $('#zmaps').innerHTML=maps.map(k=>{
  const info=zOperations[k];
  return `<button class="zmap" data-zm="${k}" data-map-art="${k}"><span class="map-thumb" aria-hidden="true"></span><span class="map-label"><b>${k}</b><small>${info?.type||''}</small></span><span class="map-mark" aria-hidden="true"></span></button>`;
 }).join('');
 if(maps.length)selectZMap(maps.includes(sel.zmap)?sel.zmap:maps[0],!sel.zmap);
}
