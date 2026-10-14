/* ---------- Progression: levels 1-55, prestige 1-10, Prestige Master (to 1250), unlocks, weapon mastery, camos ---------- */
const UNL={AR:1,MG:1,SMG:8,BR:16,MP:24,SG:32,'Extended Mag':2,'Compensator':6,'Laser Sight':12,'Fast Hands':18,'Long Barrel':28,'Hollow Point':40,Frag:1,Impact:22,Marathon:4,Scavenger:14,Overshield:26,'Spring Legs':36,'Second Wind':44,'Hardline':50,VMP:20};
const CATS={Rifles:['AR','BR'],'Close Quarters':['SMG','SG','VMP'],Sidearms:['MG','MP'],'Power Weapons':['RL','SN']};
let srcK='',curCamo=null,prof=(()=>{try{const p=JSON.parse(localStorage.getItem('sd-prof'));if(p&&p.v==1)return p}catch(e){}return{v:1,lvl:1,xp:0,pres:0,master:0,ml:1,wk:{},camo:{}}})();
const save=()=>{try{localStorage.setItem('sd-prof',JSON.stringify(prof))}catch(e){}},need=()=>prof.master?1500:300+prof.lvl*40,nm=k=>W[k]?W[k].n:k,tx={};
function unlocked(v){return !UNL[v]||prof.pres>0||prof.master||prof.all||prof.lvl>=UNL[v]}
function sanitize(){const u=unlocked;if(!u(L.p))L.p='AR';if(L.s&&!u(L.s))L.s='MG';if(L.g&&!u(L.g))L.g=null;L.pa=L.pa.filter(u);L.sa=L.sa.filter(u);L.pk=L.pk.filter(u);if(!L.s)L.sa=[]}
function rankTxt(){return prof.master?`Prestige Master ${prof.ml} / 1250 · ${prof.xp}/1500 XP`:`${prof.pres?'Prestige '+prof.pres+' · ':''}Level ${prof.lvl}${prof.lvl<55?` · ${prof.xp}/${need()} XP`:' (max) · ready to prestige'}`}
let mUps=[],won=0;
function giveXP(g){if(prof.master){prof.xp+=g;while(prof.xp>=1500&&prof.ml<1250){prof.xp-=1500;prof.ml++;popup('PRESTIGE MASTER','Level '+prof.ml)}if(prof.ml>=1250)prof.xp=0}
 else if(prof.lvl<55){prof.xp+=g;while(prof.xp>=need()&&prof.lvl<55){prof.xp-=need();prof.lvl++;const u=[];if(!prof.pres)for(const k in UNL)if(UNL[k]==prof.lvl)u.push(nm(k));mUps.push(...u);popup('LEVEL UP','Level '+prof.lvl+(u.length?' · Unlocked '+u.join(', '):prof.lvl>=55?' · Prestige available!':''))}if(prof.lvl>=55)prof.xp=0}save()}
function awardXP(){const b=won?500:0;if(b){giveXP(b);mxp+=b}return `+${mxp} XP · ${rankTxt()}${mUps.length?'<br>Unlocked: '+mUps.join(', '):''}${prof.lvl>=55&&!prof.master?'<br>Open the menu to prestige!':''}`}
function doPrestige(){if(prof.master||prof.lvl<55)return;if(!confirm(prof.pres<10?`Prestige ${prof.pres+1}? You go back to level 1 but keep all unlocks and camos.`:'Become Prestige Master? Levels now go up to 1250.'))return;if(prof.pres<10)prof.pres++;else{prof.master=1;prof.ml=1}prof.lvl=1;prof.xp=0;save();showRank()}
function showRank(){$('#rank').textContent=rankTxt();const b=$('#prest');b.style.display=!prof.master&&prof.lvl>=55?'inline-block':'none';b.textContent=prof.pres<10?'Prestige '+(prof.pres+1):'Become Prestige Master';sanitize();ui();masteryUI()}
/* weapon mastery: level every 15 kills (max 20), then prestige the weapon (3 times) */
const wd=k=>prof.wk[k]||(prof.wk[k]={k:0,c:0,p:0}),wlv=k=>Math.min(20,1+Math.floor(wd(k).c/15)),catOf=k=>Object.keys(CATS).find(c=>CATS[c].includes(k));
function camos(k){const w=wd(k),dm=Object.keys(W).every(x=>wd(x).k>=1000),dia=CATS[catOf(k)].every(x=>wd(x).k>=1000);
 return[['Sand','#c8b27a',w.k>=25,'25 kills'],['Moss','#4f7a45',w.k>=75,'75 kills'],['Cobalt','#3d6ad6',w.k>=150,'150 kills'],['Crimson','#c0392b',w.k>=300,'300 kills'],['Violet','#8e44ad',w.k>=500,'500 kills'],['Neon','#29f0a0',w.k>=750,'750 kills'],
 ['Ember','#ff7a2a',w.p>=1,'weapon prestige 1'],['Frost','#8ad8ff',w.p>=2,'weapon prestige 2'],['Aurora','#7affc8',w.p>=3,'weapon prestige 3'],
 ['Gold','#ffc83a',w.k>=100,'100 kills'],['Diamond','#bff4ff',dia,'1000 kills with every '+catOf(k)+' weapon'],['Dark Matter','#1a0a2a',dm,'1000 kills with every weapon']].map(([n,c,ok,rq])=>({n,c,ok:ok||!!prof.all,rq}))}
const okSet=()=>{const s=new Set();for(const k in W)for(const c of camos(k))if(c.ok)s.add(k+':'+c.n);return s};
function wkill(k){if(!k||!W[k])return;const w=wd(k),b=okSet(),l=wlv(k);w.k++;w.c++;for(const x of okSet())if(!b.has(x)){const[a,c]=x.split(':');popup('CAMO UNLOCKED',`${c} · ${nm(a)}`);feed(`Camo unlocked: ${c} (${nm(a)})`)}
 if(wlv(k)>l)popup('WEAPON LEVEL UP',`${nm(k)} · Level ${wlv(k)}`+(wlv(k)==20?' · Prestige it in the menu':''));save()}
function wpres(k){const w=wd(k);if(wlv(k)<20||w.p>=3)return;w.p++;w.c=0;popup('WEAPON PRESTIGE',`${nm(k)} · Prestige ${w.p}`);prof.camo[k]=['Ember','Frost','Aurora'][w.p-1];save();masteryUI()}
function camoTex(col){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle=col;g.fillRect(0,0,64,64);for(let i=0;i<16;i++){g.fillStyle=`rgba(${i%2?'0,0,0':'255,255,255'},.22)`;g.beginPath();g.ellipse(Math.random()*64,Math.random()*64,5+Math.random()*10,3+Math.random()*7,Math.random()*3,0,7);g.fill()}return new THREE.CanvasTexture(c)}
function applyCamo(k){const m=gb.material,n=prof.camo[k],c=n&&camos(k).find(x=>x.n==n&&x.ok);m.emissive.setHex(0);curCamo=c||null;
 if(!c){m.map=null;m.color.setHex(W[k].col)}else{m.map=tx[c.n]||(tx[c.n]=camoTex(c.c));m.color.setHex(0xffffff);if(c.n=='Gold')m.emissive.setHex(0x664400)}m.needsUpdate=true}
function camoFx(){if(curCamo&&(curCamo.n=='Diamond'||curCamo.n=='Dark Matter'))gb.material.emissive.setHSL(curCamo.n=='Diamond'?.5:.75,.9,.2+.12*Math.sin(t0*3))}
function masteryUI(){$('#wm').innerHTML=Object.keys(W).map(k=>{const w=wd(k),cs=camos(k),nx=cs.find(c=>!c.ok);return `<div class="wr"><span><b>${nm(k)}</b> Lv ${wlv(k)}${w.p?' ★'+w.p:''} · ${w.k} kills</span><span><select data-w="${k}"><option value="">Default camo</option>${cs.filter(c=>c.ok).map(c=>`<option ${prof.camo[k]==c.n?'selected':''}>${c.n}</option>`).join('')}</select>${wlv(k)==20&&w.p<3?`<button class="btn sm" data-pw="${k}">Prestige weapon</button>`:''}</span><i>${nx?'Next camo: '+nx.n+' ('+nx.rq+')':'All camos unlocked'}</i></div>`}).join('')}
$('#wm').onchange=e=>{const k=e.target.dataset.w;if(k){prof.camo[k]=e.target.value;save()}};$('#wm').onclick=e=>{const k=e.target.dataset.pw;if(k)wpres(k)};$('#prest').onclick=doPrestige;showRank();
