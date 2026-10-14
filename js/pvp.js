/* ---------- simulated PvP: bots fight each other, Team Deathmatch, level-up popups, killstreak panel ---------- */
let ts={},lastBot=null,ksC='';
const pTeam=()=>mode=='Team Deathmatch'?'A':'p',ally=b=>mode=='Team Deathmatch'&&b.team=='A',hl=()=>L.pk.includes('Hardline')?1:0;
function setupBots(){ts={};lastBot=null;const mk=(n,team,hue)=>{const b=addBot(60,1);b.team=team;b.nm=n;b.k=0;b.col=team=='A'?0x62a8ff:0xff5a3a;const c=b.m.children[0].material.color;if(hue!=null)c.setHSL(hue,.6,.42);else c.setHex(team=='A'?0x3d6ad6:0xb5452e)};
 if(mode=='Slayer')for(let i=0;i<6;i++)mk('Bot '+(i+1),'b'+i,i*.15);
 if(mode=='Time Attack')for(let i=0;i<8;i++)mk('Bot '+(i+1),'b'+i,i*.12);
 if(mode=='Team Deathmatch'){for(let i=0;i<4;i++)mk('Ally '+(i+1),'A');for(let i=0;i<5;i++)mk('Enemy '+(i+1),'B')}}
function target(b){let best=null,bd=1e9;for(const t of bots){if(t===b||!t.al||t.net||t.team==b.team)continue;const d=Math.hypot(t.x-b.x,t.z-b.z);if(d<bd){bd=d;best=t}}
 if(!P.dead&&b.team!=pTeam()&&Math.hypot(P.x-b.x,P.z-b.z)<bd)best=P;return best}
function botHit(t,d,by){t.hp-=d;t.fl=.08;if(t.hp<=0){t.al=0;t.m.visible=false;t.rt=2.5;burst(V(t.x,1,t.z),20,0xb5452e,6,.8,.15);by.k=(by.k||0)+1;ts[by.team]=(ts[by.team]||0)+1;feed(`${by.nm} ▸ ${t.nm}`)}}
function botScoreOnMe(){const b=lastBot;lastBot=null;if(b&&!b.net){b.k=(b.k||0)+1;ts[b.team]=(ts[b.team]||0)+1;feed(`${b.nm} ▸ You`)}}
function updBots(dt){for(const b of bots){if(b.net)continue;
 if(!b.al){if(b.rt>0&&mode!='Survival'){b.rt-=dt;if(b.rt<=0)spawn(b)}continue}
 b.ts=(b.ts||0)-dt;if(b.ts<=0||!b.tg||(b.tg===P?P.dead:!b.tg.al)){b.ts=.5;b.tg=target(b)}
 const t=b.tg;if(!t)continue;const dx=t.x-b.x,dz=t.z-b.z,dd=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
 b.ot-=dt;if(b.ot<=0){b.ot=1+Math.random()*1.5;b.off=(Math.random()-.5)*2.2||1}
 const h=ang+(dd>16?b.off*.3:dd<7?Math.PI+b.off*.3:Math.sign(b.off)*1.4),sp=3.4*Math.min(b.df,1.6),px=b.x,pz=b.z;mv(b,Math.sin(h)*sp*dt,Math.cos(h)*sp*dt,.45);
 if(Math.hypot(b.x-px,b.z-pz)<sp*dt*.3&&dd>2){b.off=(Math.random()<.5?-1:1)*2.5;b.ot=.8}
 b.m.position.set(b.x,0,b.z);b.m.rotation.y=ang;b.cd-=dt;
 if(b.cd<=0&&dd<45){const o=V(b.x,1.5,b.z),tv=V(t.x,(t.y||0)+1.2,t.z).sub(o),D=tv.length();tv.divideScalar(D);
  if(castW(o,tv,D)>=D-.1){b.cd=(.55+Math.random()*.5)/Math.min(b.df,1.6);tr(o,tv,D,b.col||0xff5a3a,.08);
   if(Math.random()<Math.max(.12,.45-dd/110)*Math.min(1.3,b.df)){if(t===P)hurt(6,b);else botHit(t,6,b)}}}}}
function pvpTick(){if(mode=='Team Deathmatch'){$('#ob').textContent=`Your team ${ts.A||0}  ·  Enemy team ${ts.B||0}   (first to 50)`;if((ts.A||0)>=50)endGame('Victory');else if((ts.B||0)>=50)endGame('Defeat')}
 else{const top=bots.reduce((a,b)=>(b.k||0)>(a.k||0)?b:a,bots[0]||{k:0,nm:'-'});$('#ob').textContent=`Slayer  You ${kills} · Top bot ${top.k||0} / 20`;if(kills>=20)endGame('Victory');else if((top.k||0)>=20)endGame(top.nm+' wins')}}
function popup(t,s){const e=document.createElement('div');e.className='pp';e.innerHTML=`<b>${t}</b><span>${s}</span>`;$('#pops').appendChild(e);setTimeout(()=>e.remove(),4300);beep(880,.15,'triangle',.07);setTimeout(()=>beep(1320,.2,'triangle',.06),110)}
function ksHud(){const T=[['UAV',3],['Airstrike',5],['Shield Boost',8]],h=T.map(([n,k])=>{const t=k-hl(),r=q.includes(n),u=ks>=t&&!r;return `<div class="kt ${r?'rdy':u?'used':''}"><b>${n}</b><i>${r?(q[0]==n?'[E] READY':'READY'):u?'USED':Math.min(ks,t)+' / '+t}</i></div>`}).join('');if(h!=ksC){ksC=h;$('#kst').innerHTML=`<small>KILLSTREAKS · ${ks}</small>`+h}}
