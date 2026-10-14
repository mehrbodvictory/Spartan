/* ---------- simulated PvP (bots fight each other), Team Deathmatch, Capture the Flag, popups, killstreak panel ---------- */
let ts={},lastBot=null,ksC='',flags=[],cs={A:0,B:0};
const teamMode=()=>mode=='Team Deathmatch'||mode=='Capture the Flag',pTeam=()=>teamMode()?'A':'p',ally=b=>teamMode()&&b.team=='A',hl=()=>L.pk.includes('Hardline')?1:0,tmOf=e=>e===P?pTeam():e.team,fl=t=>flags.find(f=>f.team==t),tn=t=>t=='A'?'Blue':'Red';
function clearFlags(){for(const f of flags){S.remove(f.m);S.remove(f.ring)}flags=[]}
function setupBots(){ts={};lastBot=null;clearFlags();cs={A:0,B:0};const mk=(n,team,hue,role)=>{const b=addBot(60,1);b.team=team;b.nm=n;b.k=0;b.cf=null;b.role=role;b.ox=(Math.random()-.5)*12;b.oz=(Math.random()-.5)*12;b.col=team=='A'?0x62a8ff:0xff5a3a;const c=b.m.children[0].material.color;if(hue!=null)c.setHSL(hue,.6,.42);else c.setHex(team=='A'?0x3d6ad6:0xb5452e);spawn(b)};
 if(mode=='Slayer')for(let i=0;i<6;i++)mk('Bot '+(i+1),'b'+i,i*.15);
 if(mode=='Time Attack')for(let i=0;i<8;i++)mk('Bot '+(i+1),'b'+i,i*.12);
 if(teamMode()){for(let i=0;i<4;i++)mk('Ally '+(i+1),'A',null,i%2?'def':'atk');for(let i=0;i<5;i++)mk('Enemy '+(i+1),'B',null,i%2?'def':'atk');if(mode=='Capture the Flag')setupFlags()}}
function freeNear(x,z){for(let r=0;r<40;r+=2)for(let a=0;a<6.3;a+=.7){const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(Math.abs(px)<H-3&&Math.abs(pz)<H-3&&!bx.some(b=>(b.y0||0)<2&&px>b.x0-2&&px<b.x1+2&&pz>b.z0-2&&pz<b.z1+2))return[px,pz]}return[x,z]}
function setupFlags(){const fb=MAPS[sel.map].fb||[[-H*.7,0],[H*.7,0]];flags=['A','B'].map((team,i)=>{const[hx,hz]=freeNear(...fb[i]),col=team=='A'?0x3d6ad6:0xd9432e,m=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,3.4,8),new THREE.MeshLambertMaterial({color:0xdddddd})),cloth=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:col})),ring=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,.05,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.4}));
 pole.position.y=1.7;cloth.scale.set(1.3,.8,.05);cloth.position.set(.7,3,0);m.add(pole,cloth);m.position.set(hx,0,hz);ring.position.set(hx,.05,hz);S.add(m,ring);return{team,hx,hz,x:hx,z:hz,st:'home',by:null,dt:0,m,ring}})}
function retFlag(f,e){f.st='home';f.x=f.hx;f.z=f.hz;f.by=null;feed(`${tn(f.team)} flag returned${e?(e===P?' by you':''):''}`)}
function ctfGoal(b){const tm=b.team,EF=fl(tm=='A'?'B':'A'),OF=fl(tm);if(b.cf)return OF.st=='home'?[OF.hx,OF.hz]:[OF.x,OF.z];
 if(OF.st!='home'&&(b.role=='def'||Math.hypot(OF.x-b.x,OF.z-b.z)<30))return[OF.x,OF.z];
 if(b.role=='atk')return EF.st=='carried'&&tmOf(EF.by)==tm?[OF.hx+b.ox*.5,OF.hz+b.oz*.5]:[EF.x,EF.z];return[OF.hx+b.ox,OF.hz+b.oz]}
function ctfTick(dt){for(const f of flags){if(f.st=='carried'){const e=f.by;if(e===P?P.dead:!e.al){f.st='dropped';f.dt=0;e.cf=null;feed(tn(f.team)+' flag dropped')}else{f.x=e.x;f.z=e.z}}else if(f.st=='dropped'){f.dt+=dt;if(f.dt>15)retFlag(f)}
  f.m.position.set(f.x,0,f.z);f.m.visible=!(f.st=='carried'&&f.by===P)}
 for(const e of[...(P.dead?[]:[P]),...bots.filter(b=>b.al&&!b.net)]){const tm=tmOf(e),OF=fl(tm),EF=fl(tm=='A'?'B':'A');
  if(!e.cf&&EF.st!='carried'&&Math.hypot(e.x-EF.x,e.z-EF.z)<1.8){EF.st='carried';EF.by=e;e.cf=EF;feed(`${e===P?'You':e.nm} took the ${tn(EF.team)} flag`);if(e===P)msg('You have the flag! Bring it home',2.5)}
  if(OF.st=='dropped'&&Math.hypot(e.x-OF.x,e.z-OF.z)<1.8)retFlag(OF,e);
  if(e.cf&&OF.st=='home'&&Math.hypot(e.x-OF.hx,e.z-OF.hz)<2.5){cs[tm]++;retFlag(e.cf);e.cf=null;popup('FLAG CAPTURED',tn(tm)+' team scores');if(e===P){giveXP(200);mxp+=200}}}}
function target(b){let best=null,bd=1e9;for(const t of bots){if(t===b||!t.al||t.net||t.team==b.team)continue;const d=Math.hypot(t.x-b.x,t.z-b.z);if(d<bd){bd=d;best=t}}
 if(!P.dead&&b.team!=pTeam()&&Math.hypot(P.x-b.x,P.z-b.z)<bd)best=P;return best}
function botHit(t,d,by){t.hp-=d;t.fl=.08;if(t.hp<=0){t.al=0;t.m.visible=false;t.rt=2.5;burst(V(t.x,1,t.z),20,0xb5452e,6,.8,.15);by.k=(by.k||0)+1;ts[by.team]=(ts[by.team]||0)+1;feed(`${by.nm} ▸ ${t.nm}`)}}
function botScoreOnMe(){const b=lastBot;lastBot=null;if(b&&!b.net){b.k=(b.k||0)+1;ts[b.team]=(ts[b.team]||0)+1;feed(`${b.nm} ▸ You`)}}
function updBots(dt){for(const b of bots){if(b.net)continue;
 if(!b.al){if(b.rt>0&&mode!='Survival'){b.rt-=dt;if(b.rt<=0)spawn(b)}continue}
 b.ts=(b.ts||0)-dt;if(b.ts<=0||!b.tg||(b.tg===P?P.dead:!b.tg.al)){b.ts=.5;b.tg=target(b)}
 const t=b.tg,g=mode=='Capture the Flag'?ctfGoal(b):null,td=t?Math.hypot(t.x-b.x,t.z-b.z):1e9,obj=g&&td>=(b.cf?7:20);if(!t&&!g)continue;
 const mt=obj?{x:g[0],z:g[1]}:t,dx=mt.x-b.x,dz=mt.z-b.z,dd=Math.hypot(dx,dz),ang=Math.atan2(dx,dz);
 b.ot-=dt;if(b.ot<=0){b.ot=1+Math.random()*1.5;b.off=(Math.random()-.5)*2.2||1}
 const h=obj?ang+b.off*.45:ang+(dd>16?b.off*.3:dd<7?Math.PI+b.off*.3:Math.sign(b.off)*1.4),sp=(obj?4.2:3.4)*Math.min(b.df,1.6),px=b.x,pz=b.z;
 if(!(obj&&dd<2.5))mv(b,Math.sin(h)*sp*dt,Math.cos(h)*sp*dt,.45);
 if(Math.hypot(b.x-px,b.z-pz)<sp*dt*.3&&dd>2.5){b.off=(Math.random()<.5?-1:1)*2.5;b.ot=.8}
 b.m.position.set(b.x,0,b.z);b.m.rotation.y=t?Math.atan2(t.x-b.x,t.z-b.z):ang;b.cd-=dt;
 if(t&&b.cd<=0&&td<45){const o=V(b.x,1.5,b.z),tv=V(t.x,(t.y||0)+1.2,t.z).sub(o),D=tv.length();tv.divideScalar(D);
  if(castW(o,tv,D)>=D-.1){b.cd=(.55+Math.random()*.5)/Math.min(b.df,1.6);tr(o,tv,D,b.col||0xff5a3a,.08);
   if(Math.random()<Math.max(.12,.45-td/110)*Math.min(1.3,b.df)){if(t===P)hurt(6,b);else botHit(t,6,b)}}}}}
function pvpTick(dt){if(mode=='Capture the Flag'){ctfTick(dt);const A=fl('A'),B=fl('B'),st=f=>f.st=='home'?'safe':f.st=='dropped'?'dropped':'taken';$('#ob').textContent=`Blue ${cs.A} - ${cs.B} Red  ·  first to 3  ·  Your flag: ${st(A)}  ·  Enemy flag: ${B.by===P?'YOU HAVE IT':st(B)}`;if(cs.A>=3)endGame('Victory');else if(cs.B>=3)endGame('Defeat');return}
 if(mode=='Team Deathmatch'){$('#ob').textContent=`Your team ${ts.A||0}  ·  Enemy team ${ts.B||0}   (first to 50)`;if((ts.A||0)>=50)endGame('Victory');else if((ts.B||0)>=50)endGame('Defeat')}
 else{const top=bots.reduce((a,b)=>(b.k||0)>(a.k||0)?b:a,bots[0]||{k:0,nm:'-'});$('#ob').textContent=`Slayer  You ${kills} · Top bot ${top.k||0} / 20`;if(kills>=20)endGame('Victory');else if((top.k||0)>=20)endGame(top.nm+' wins')}}
function popup(t,s){const e=document.createElement('div');e.className='pp';e.innerHTML=`<b>${t}</b><span>${s}</span>`;$('#pops').appendChild(e);setTimeout(()=>e.remove(),4300);beep(880,.15,'triangle',.07);setTimeout(()=>beep(1320,.2,'triangle',.06),110)}
function ksHud(){const T=[['UAV',3],['Airstrike',5],['Shield Boost',8]],h=T.map(([n,k])=>{const t=k-hl(),r=q.includes(n),u=ks>=t&&!r;return `<div class="kt ${r?'rdy':u?'used':''}"><b>${n}</b><i>${r?(q[0]==n?'[E] READY':'READY'):u?'USED':Math.min(ks,t)+' / '+t}</i></div>`}).join('');if(h!=ksC){ksC=h;$('#kst').innerHTML=`<small>KILLSTREAKS · ${ks}</small>`+h}}
