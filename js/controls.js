/* ===================== controls.js ===================== */
/* ---------- full control scheme shared by keyboard + mouse, controller and VR: aim down sights, stances (crouch, slide, prone, dive), walk, auto-run, tactical sprint,
   lethal and tactical equipment, field upgrade, armor plates, fire mode, weapon mount, steady aim, ping, night vision, scoreboard and map ---------- */
const ST={ads:0,adsIn:0,ax:0,ay:-.12,az:-.4,zoom:.2,eye:1.65,crouch:0,prone:0,slide:0,dive:0,walk:0,auto:0,tac:0,tacCd:0,lastShift:-9,mount:0,steady:0,nv:0,plates:3,tN:2,field:0,fieldCd:0,fm:{},sj:0,flash:0,sc:0,mapOn:0,sbOn:0,pings:[],qi:0};
function ctlReset(){mvReset();Object.assign(ST,{ads:0,adsIn:0,eye:1.65,crouch:0,prone:0,slide:0,dive:0,walk:0,auto:0,tac:0,tacCd:0,mount:0,steady:0,plates:3,tN:2,field:0,fieldCd:0,sj:0,flash:0});for(const p of ST.pings)S.remove(p.m);ST.pings=[];const e=$('#flash');if(e)e.style.opacity=0}
/* ---------- ADS: put the sight line of the current weapon on the camera axis ---------- */
const _sgC=setGun;setGun=function(){_sgC.apply(this,arguments);const w=cw();if(!w)return;const k=w.k,l=(WG[k]||WG.AR)[0],pz=-.14+.1*l;let s=null,rel_=.22,zm=.2;
 if(k=='AR'){const t=knG.userData.sight;if(t)s={yt:t.yt,zr:t.zr-.12}}else if(k=='VMP')s=vmpG.userData.sight;else if(k=='RG')s=rgG.userData.sight;else if(k=='SN'){s={yt:.11,zr:pz-(l*.35-.14)};rel_=.1}else s=fpG.userData.sight;
 if(['CT','MG','MP'].includes(k))rel_=.3;zm=k=='SN'?.62:k=='RL'?.25:['SMG','VMP','MP'].includes(k)?.16:k=='SG'?.14:['CT','MG'].includes(k)?.12:.22;
 ST.zoom=zm;ST.ax=0;if(s){ST.ay=-s.yt;ST.az=-rel_-s.zr}else{ST.ay=-.1;ST.az=-.4};ST.mount=0};
/* ---------- movement: stances, slide, dive, walk, auto-run, tactical sprint ---------- */
function moveCalc(dt){let f=(key.KeyW?1:0)-(key.KeyS?1:0),s=(key.KeyD?1:0)-(key.KeyA?1:0);if(key.KeyS)ST.auto=0;if(ST.auto&&!key.KeyS)f=1;
 const sh=key.ShiftLeft||key.ShiftRight;let spt=sh&&f>0&&!ST.adsIn&&!ST.prone&&ST.slide<=0&&ST.dive<=0;if(spt&&ST.crouch)ST.crouch=0;
 if(ST.slide>0||ST.dive>0){f=1;s=0;spt=false}
 let spd=7;if(spt)spd=ST.tac>0?10.2:9;else if(ST.slide>0)spd=4+7*(ST.slide/.85);else if(ST.dive>0)spd=2+9*(ST.dive/.5);else if(ST.prone)spd=1.8;else if(ST.crouch)spd=3.8;else if(ST.walk)spd=3.6;
 if(ST.ads>.3&&!ST.slide&&!ST.dive)spd*=1-.35*ST.ads;if(ST.field>0)spd*=1.25;return{f,s,spt,spd}}
function ctlTick(dt){meleeTick(dt);if(P.dead){ST.adsIn=0;ST.ads=0;ST.slide=ST.dive=0}
 const sh=key.ShiftLeft||key.ShiftRight,tg=ST.adsIn&&rel<=0&&!P.dead&&!P.mt?1:0;ST.ads+=(tg-ST.ads)*Math.min(1,dt*(tg?9*((cw()&&cw().ad)||1):12));if(ST.ads<.002)ST.ads=0;
 if(ST.slide>0){ST.slide-=dt;if(ST.slide<=0)ST.crouch=1}if(ST.dive>0){ST.dive-=dt;if(ST.dive<=0)ST.prone=1}
 if(ST.tac>0&&(P.spr||0)>.5){ST.tac-=dt;if(ST.tac<=0)ST.tacCd=6}if(ST.tacCd>0)ST.tacCd-=dt;
 if(ST.field>0)ST.field-=dt;if(ST.fieldCd>0)ST.fieldCd-=dt;if(ST.steady>0)ST.steady-=dt;
 if(ST.mount&&(ST.ads<.5||Math.hypot(P.mx||0,P.mz||0)>1))ST.mount=0;
 const et=ST.slide>0?.8:ST.prone?.55:ST.crouch?1.15:1.65;ST.eye+=(et-ST.eye)*Math.min(1,dt*10);if(!key.Space)ST.sj=0;
 const sc=$('#scope'),w=cw(),scoped=ST.ads>.85&&w&&w.k=='SN';if(sc)sc.style.display=scoped?'block':'none';katTick(dt);gun.scale.setScalar(scoped||meleeOut()?.01:1);
 if(ST.flash>0){ST.flash-=dt;const e=$('#flash');if(e)e.style.opacity=Math.min(1,ST.flash)}
 for(let i=ST.pings.length-1;i>=0;i--){const p=ST.pings[i];p.t-=dt;p.m.position.y=p.y+Math.sin(t0*4)*.15;p.m.rotation.y+=dt*2;if(p.t<=0){S.remove(p.m);ST.pings.splice(i,1)}}
 if(ST.mapOn)drawMap();if(ST.sbOn&&(ST.sbT=(ST.sbT||0)-dt)<=0){ST.sbT=.5;drawSb()}}
/* ---------- actions ---------- */
const sprinting=()=>(P.spr||0)>.55;
function actCrouch(){if(P.dead)return;if(sprinting()&&ST.slide<=0){ST.slide=.85;ST.crouch=0;ST.prone=0;return}ST.prone=0;ST.crouch=ST.crouch?0:1}
function actProne(){if(P.dead)return;if(sprinting()&&ST.dive<=0){ST.dive=.5;ST.crouch=0;ST.prone=0;P.vy=3.5;P.on=0}else{ST.crouch=0;ST.prone=ST.prone?0:1}}
function actJumpPress(){if(ST.crouch||ST.prone){ST.crouch=ST.prone=0;ST.sj=1}}
function actAds(on){ST.adsIn=on?1:0}
function actTactical(){if(P.dead||ST.tN<=0)return;ST.tN--;const d=aimDir(),m=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:0xeeeeee,emissive:0x555555}));m.scale.setScalar(.1);S.add(m);grs.push({m,p:C.position.clone(),v:d.multiplyScalar(14).add(V(0,3,0)),t:1.3,g:{fuse:1.3,R:0,d:0,imp:0,tac:1}});msg('Flashbang · '+ST.tN+' left',1)}
function flashBoom(p){burst(p,40,0xffffff,9,.5,.25);beep(2400,.5,'sine',.08);for(const b of bots){if(!b.al||(typeof ally=='function'&&ally(b)&&b.team!='z')||b.net)continue;const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<18&&navLos(p.x,p.z,b.x,b.z))b.stun=Math.max(b.stun||0,3.5*(1-d/26))}
 const d=Math.hypot(P.x-p.x,P.z-p.z);if(d<22&&!P.dead){const v=V(p.x-C.position.x,p.y-C.position.y,p.z-C.position.z).normalize(),dot=aimDir().dot(v);ST.flash=Math.max(ST.flash,2.4*(1-d/22)*(dot>0?1:.35))}}
function actField(){if(P.dead)return;if(ST.fieldCd>0){msg('Field upgrade recharging '+Math.ceil(ST.fieldCd)+'s',1);return}ST.field=6;ST.fieldCd=45;P.sh=P.msh;msg('ADRENALINE: faster, shield restored',1.5);beep(500,.2,'sine',.06)}
function actPlate(){if(P.dead)return;if(ST.plates<=0||(P.sh>=P.msh&&P.hp>=P.mhp)){msg(ST.plates<=0?'No armor plates':'Already full',1);return}ST.plates--;P.sh=Math.min(P.msh,P.sh+50);P.hp=Math.min(P.mhp,P.hp+15);msg('Armor plate · '+ST.plates+' left',1);beep(300,.15,'triangle',.06)}
function actFireMode(){const w=cw();if(!w)return;if(!w.au){msg(w.n+': semi-auto only',1);return}ST.fm[w.k]=ST.fm[w.k]?0:1;msg(w.n+': '+(ST.fm[w.k]?'Single':'Auto'),1)}
function actMount(){if(ST.ads<.5){return}ST.mount=ST.mount?0:1;msg(ST.mount?'Weapon mounted':'Mount released',1)}
function actSteady(){if(ST.ads>.5){ST.steady=3;msg('Steady aim',.8)}}
function actPing(){const o=C.position.clone(),d=aimDir(),t=castW(o,d,120),p=o.add(d.multiplyScalar(Math.min(t,120)));const m=new THREE.Mesh(new THREE.OctahedronGeometry(.3),new THREE.MeshBasicMaterial({color:0xffd24a}));m.scale.y=1.6;m.position.copy(p);m.position.y+=.8;S.add(m);ST.pings.push({m,y:m.position.y,t:8});if(ST.pings.length>3){const q=ST.pings.shift();S.remove(q.m)}msg('Ping placed',.8);beep(900,.1,'sine',.05)}
function actNV(){ST.nv=!ST.nv;R.domElement.style.filter=ST.nv?'brightness(1.9) contrast(1.15) saturate(.4) sepia(1) hue-rotate(65deg)':'';const e=$('#nvo');if(e)e.style.display=ST.nv?'block':'none';msg('Night vision '+(ST.nv?'on':'off'),.8)}
function actInv(){const w=wp.map(x=>x.n).join(' · ');msg(`${w}  |  Frags ${gc}  Flash ${ST.tN}  Plates ${ST.plates}`,2.5)}
function actInteract(){if(mode=='Zombies')zUse()}
function actSwapNext(){if(wp.length>1)swap((cur+1)%wp.length)}function actSwapPrev(){if(wp.length>1)swap((cur+wp.length-1)%wp.length)}
function actSb(on){ST.sbOn=on;const e=$('#sbd');e.style.display=on?'block':'none';if(on){ST.sbT=0;drawSb()}}
function actMap(){ST.mapOn=!ST.mapOn;const e=$('#mapv');e.style.display=ST.mapOn?'block':'none';if(ST.mapOn)drawMap()}
function drawSb(){const rows=finRows(),e=$('#sbd');e.innerHTML='<h3>Scoreboard</h3><table>'+rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td>${r.nm}</td><td>${r.k}</td><td>${r.d==null?'-':r.d}</td></tr>`).join('')+'</table>'+(typeof teamTxt=='function'?`<p>${teamTxt()}</p>`:'')}
/* ---------- map: top-down view of every wall and object, with allies, objectives and zombie-mode machines ---------- */
function drawMap(){const cv=$('#mapc'),c=cv.getContext('2d'),W=cv.width,M=MAPS[sel.map]||{},k=W/(2*H),tb=M.tb||[-H,-H,H,H],X=x=>(x+H)*k,Z=z=>(z+H)*k;
 /* tactical map: dark satellite-style ground, a red scan-line band just outside the play area, a white outline, buildings as lit blocks */
 c.clearRect(0,0,W,W);const bg_=c.createRadialGradient(W/2,W/2,W*.08,W/2,W/2,W*.78);bg_.addColorStop(0,'#2b2b2d');bg_.addColorStop(1,'#09090a');c.fillStyle=bg_;c.fillRect(0,0,W,W);
 let sd=17;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;c.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<70;i++)c.fillRect(rn()*W,rn()*W,4+rn()*22,2+rn()*10);c.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<40;i++)c.fillRect(rn()*W,rn()*W,8+rn()*30,4+rn()*14);
 const x0=X(tb[0]),z0=Z(tb[1]),x1=X(tb[2]),z1=Z(tb[3]);
 c.save();c.beginPath();c.rect(x0-W*.05,z0-W*.05,x1-x0+W*.1,z1-z0+W*.1);c.rect(x0,z0,x1-x0,z1-z0);c.clip('evenodd');c.fillStyle='rgba(255,30,30,.12)';c.fillRect(0,0,W,W);c.fillStyle='rgba(255,45,45,.6)';for(let y=0;y<W;y+=4)c.fillRect(0,y,W,1.3);c.restore();
 c.fillStyle='#202022';c.fillRect(x0,z0,x1-x0,z1-z0);c.fillStyle='rgba(255,255,255,.03)';for(let i=0;i<120;i++)c.fillRect(x0+rn()*(x1-x0),z0+rn()*(z1-z0),2+rn()*8,2+rn()*5);
 const rect=b=>[X(b.x0),Z(b.z0),Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k)];
 for(const b of bx){if(b.h<=.3||b.h>=13.9)continue;const hi=(b.y0||0)>=2,r=rect(b);if(hi){c.fillStyle='rgba(150,150,156,.45)';c.fillRect(...r);continue}
  if(b.h>3){c.fillStyle='#6f6f73';c.fillRect(...r);c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1;c.strokeRect(r[0]+.5,r[1]+.5,r[2],r[3])}else if(b.h>1.2){c.fillStyle='#4e4e52';c.fillRect(...r);c.strokeStyle='rgba(200,200,200,.55)';c.lineWidth=1;c.strokeRect(r[0]+.5,r[1]+.5,r[2],r[3])}else{c.fillStyle='#3a3a3d';c.fillRect(...r)}}
 c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(x0,z0,x1-x0,z1-z0);
 /* targeting-screen decoration */
 c.strokeStyle='rgba(255,60,60,.8)';c.lineWidth=2;const br=22,m=8;for(const[bx_,by_,sx,sy]of[[m,m,1,1],[W-m,m,-1,1],[m,W-m,1,-1],[W-m,W-m,-1,-1]]){c.beginPath();c.moveTo(bx_,by_+sy*br);c.lineTo(bx_,by_);c.lineTo(bx_+sx*br,by_);c.stroke()}
 c.fillStyle='rgba(255,70,70,.85)';c.font='12px monospace';c.fillText('25.06',W*.58,18);c.fillText('55.77',10,W*.34);c.fillText('23.5',W-48,W*.62);c.beginPath();c.moveTo(W-52,24);c.lineTo(W-44,16);c.lineTo(W-36,24);c.lineTo(W-44,32);c.closePath();c.stroke();c.fillStyle='rgba(255,255,255,.8)';c.fillText('N',W/2-3,16);
 const dot=(x,z,col,r)=>{c.fillStyle=col;c.beginPath();c.arc(X(x),Z(z),r,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=1;c.stroke()};
 for(const z of zones)dot(z.x,z.z,z.o=='A'?'#62a8ff':z.o=='B'?'#ff5a3a':'#ddd',Math.max(6,(z.r||5)*k));for(const f of flags)dot(f.x,f.z,f.team=='A'?'#62a8ff':'#ff5a3a',6);
 if(mode=='Zombies'&&typeof zdoors!='undefined'){for(const d of zdoors)if(!d.sink)dot(d.x||d.o&&d.o.x||0,d.z||d.o&&d.o.z||0,'#ffb454',4)}
 for(const b of bots)if(b.al&&(ally(b)||uav>0))dot(b.x,b.z,ally(b)?'#62e0f0':'#ff5a3a',4);
 /* you: the arrow points where you look (world forward is (-sin yaw, -cos yaw); the arrow tip is drawn pointing up, so it is rotated by -yaw) */
 c.save();c.translate(X(P.x),Z(P.z));c.rotate(-yaw);c.fillStyle='#fff';c.strokeStyle='#000';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-10);c.lineTo(-6.5,8);c.lineTo(0,4);c.lineTo(6.5,8);c.closePath();c.fill();c.stroke();c.restore()}
/* ---------- keyboard + mouse ---------- */
function kbDown(e){const c=e.code;if(['Space','Tab','AltLeft','F1','F3','F6','ControlLeft'].includes(c)||c.startsWith('Arrow'))e.preventDefault();key[c]=1;
 switch(c){
  case'Space':actJumpPress();break;
  case'ShiftLeft':if(!e.repeat){if(t0-ST.lastShift<.32&&ST.tacCd<=0)ST.tac=4;ST.lastShift=t0}break;
  case'KeyC':if(!e.repeat)actCrouch();break;case'ControlLeft':if(!e.repeat)actProne();break;case'AltLeft':ST.walk=1;break;
  case'KeyH':if(!e.repeat)ST.auto=ST.auto?0:1;break;
  case'KeyR':startRel();break;case'KeyV':if(!e.repeat)mvDown();break;case'KeyE':if(!e.repeat)throwG();break;case'KeyQ':if(!e.repeat)actTactical();break;
  case'KeyF':if(!e.repeat)actInteract();break;case'KeyT':if(!e.repeat)actMount();break;case'KeyB':if(!e.repeat)actFireMode();break;
  case'KeyX':if(!e.repeat)actField();break;case'KeyG':if(!e.repeat)actPlate();break;
  case'Digit1':actSwapNext();break;case'Digit2':actSwapPrev();break;
  case'Digit3':useStreak(0);break;case'Digit4':useStreak(1);break;case'Digit5':useStreak(2);break;case'Digit6':useStreak(3);break;
  case'Tab':if(!e.repeat)actSb(1);break;case'KeyM':case'CapsLock':if(!e.repeat)actMap();break;case'KeyN':if(!e.repeat)actNV();break;
  case'F1':case'F3':case'F6':case'KeyO':paused=1;trig=0;showPause();if(document.exitPointerLock)document.exitPointerLock();break}}
addEventListener('keyup',e=>{if(e.code=='KeyV')mvUp();if(e.code=='Tab'){actSb(0)}if(e.code=='AltLeft')ST.walk=0});
addEventListener('mousedown',e=>{if(!run||paused||over)return;if(e.button==2){actAds(1)}else if(e.button==1){e.preventDefault();actPing()}else if(e.button==3){e.preventDefault();mvDown()}else if(e.button==4){e.preventDefault();actMount()}});
addEventListener('mouseup',e=>{if(e.button==2)actAds(0);if(e.button==3)mvUp()});
addEventListener('wheel',e=>{if(!run||paused||over)return;if(e.deltaY>0)actSwapNext();else if(e.deltaY<0)actSwapPrev()},{passive:true});
/* menu hot keys while no match is running */
addEventListener('keydown',e=>{if(run)return;const nav=p=>{const b=document.querySelector(`#nav button[data-p="${p}"]`);if(b&&b.offsetParent!==null||b)b.click()};
 if(e.code=='F1'){e.preventDefault();const h=$('#hbtns');if(typeof showHome=='function')showHome()}else if(e.code=='F3'){e.preventDefault();nav('set')}else if(e.code=='F6'){e.preventDefault();nav('load')}else if(e.code=='KeyO'&&document.activeElement.tagName!='INPUT'){nav('priv')}});

/* ---------- Katana: the melee weapon. Hand-built model: single-edged curved blade with a raised ridge line, fuller grooves, a wavy temper line and a pointed tip, gold collar and washers,
   an iron guard with gold studs, a cord-wrapped grip over ray skin with a diamond wrap and ornaments, a gold collar and pommel cap and a red tassel ---------- */
const kat={t:0};
function buildKatana(){const g=new THREE.Group(),L=.7,w=.034,t=.0075,sori=.03,ph=(c,s)=>new THREE.MeshPhongMaterial({color:c,shininess:s,specular:0xffffff}),
 steel=ph(0xcfd6de,140),ridge=ph(0xe4eaf0,200),temper=ph(0xf8fbff,220),groove=new THREE.MeshLambertMaterial({color:0x4a525c}),gold=ph(0xc9a94d,70),iron=ph(0x2a2a30,40),white=new THREE.MeshLambertMaterial({color:0xe6e0d0}),wrap=new THREE.MeshLambertMaterial({color:0x14161a}),red=new THREE.MeshLambertMaterial({color:0x8a1414}),
 cv=y=>sori*Math.pow(y/L,2),N=16,
 ext=(pts,m,th)=>{const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const e=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false}),m);e.position.z=-th/2;return e},
 edge=y=>cv(y)+w*(1-.07*(y/L));
 const body=[[0,0]];for(let i=1;i<=N;i++){const y=L*i/N;body.push([cv(y),y])}body.push([cv(L)+w*.5,L+.048],[edge(L)-.004,L-.014]);for(let i=N;i>=0;i--){const y=L*i/N;body.push([edge(y),y])}
 const blade=new THREE.Group();blade.add(ext(body,steel,t));
 const rg=[];for(let i=0;i<=N;i++){const y=.01+(L-.1)*i/N;rg.push([cv(y)+w*.36,y])}for(let i=N;i>=0;i--){const y=.01+(L-.1)*i/N;rg.push([cv(y)+w*.4,y])}blade.add(ext(rg,ridge,t*1.3));
 for(const s of[0]){const gr=[];for(let i=0;i<=8;i++){const y=.07+(L-.2)*i/8;gr.push([cv(y)+.007,y])}for(let i=8;i>=0;i--){const y=.07+(L-.2)*i/8;gr.push([cv(y)+.013,y])}blade.add(ext(gr,groove,t*1.06))}
 const hm=[];for(let i=0;i<=40;i++){const y=.03+(L-.02)*i/40;hm.push([edge(y)-w*.42-.004*Math.sin(y*85)-.003*Math.sin(y*37),y])}for(let i=40;i>=0;i--){const y=.03+(L-.02)*i/40;hm.push([edge(y)-.0008,y])}blade.add(ext(hm,temper,t*1.04));
 blade.position.x=-w/2;g.add(blade);
 const cyl=(r1,r2,h,m,y,sz)=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,18),m);e.position.y=y;e.scale.z=sz||1;g.add(e);return e},bx_=(a,b,c,m,x,y,z,rx,ry,rz)=>{const e=new THREE.Mesh(bg,m);e.scale.set(a,b,c);e.position.set(x,y,z);e.rotation.set(rx||0,ry||0,rz||0);g.add(e);return e};
 bx_(w+.006,.022,t+.009,gold,0,.009,0);bx_(w+.012,.004,t+.012,gold,0,.021,0);cyl(.0305,.0305,.004,gold,-.003,1.1).scale.x=1.4;cyl(.0305,.0305,.004,gold,-.0095,1.1).scale.x=1.4;
 const tsuba=cyl(.054,.054,.006,iron,-.015,1);const rim=new THREE.Mesh(new THREE.TorusGeometry(.054,.0035,8,32),iron);rim.rotation.x=Math.PI/2;rim.position.y=-.015;g.add(rim);const inner=new THREE.Mesh(new THREE.TorusGeometry(.038,.0016,6,32),gold);inner.rotation.x=Math.PI/2;inner.position.y=-.0115;g.add(inner);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const s=new THREE.Mesh(new THREE.SphereGeometry(.0055,8,6),gold);s.position.set(Math.cos(a)*.044,-.0115,Math.sin(a)*.044);g.add(s)}
 cyl(.0195,.0195,.016,gold,-.027,.8);
 cyl(.0165,.0155,.27,white,-.165,.8);
 for(let i=0;i<11;i++)cyl(.0172,.0172,.011,wrap,-.044-i*.0215,.8);
 for(let i=0;i<10;i++){for(const sd of[1,-1]){bx_(.0032,.03,.0035,wrap,-.0035,-.052-i*.0215,sd*.0142,0,0,.62);bx_(.0032,.03,.0035,wrap,.0035,-.052-i*.0215,sd*.0142,0,0,-.62)}}
 for(const sd of[1,-1]){bx_(.012,.017,.004,gold,0,-.1,sd*.0148);bx_(.012,.017,.004,gold,0,-.176,sd*.0148);bx_(.006,.008,.0045,gold,0,-.1,sd*.0148)}
 cyl(.0188,.0178,.016,gold,-.3,.8);cyl(.0085,.0085,.018,iron,-.3,.8);const kn=new THREE.Mesh(new THREE.SphereGeometry(.007,8,6),red);kn.position.set(0,-.31,.012);g.add(kn);bx_(.006,.05,.004,red,0,-.338,.012,0,0,.1);bx_(.005,.04,.004,red,.004,-.34,.012,0,0,-.12);
 g.visible=false;return g}
const katG=buildKatana();C.add(katG);
const KF=[{p:0,x:.3,y:-.18,z:-.5,rx:-1.2,rz:-.95,ry:.25},{p:.22,x:.42,y:.12,z:-.42,rx:-1.0,rz:-1.55,ry:.45},{p:.55,x:-.32,y:-.22,z:-.78,rx:-1.25,rz:1.35,ry:-.35},{p:1,x:-.16,y:-.55,z:-.5,rx:-.9,rz:.9,ry:0}];
function katSwing(){kat.t=.5;kat.hit=0}
function katTick(dt){if(xrS||ST.nvv){katG.visible=false;return}if(kat.t>0){kat.t-=dt;const p=cl(1-Math.max(0,kat.t)/.5,0,1);let a=KF[0],b=KF[1];for(let i=0;i<KF.length-1;i++)if(p>=KF[i].p){a=KF[i];b=KF[i+1]}let u=cl((p-a.p)/(b.p-a.p),0,1);u=u*u*(3-2*u);const L=k=>a[k]+(b[k]-a[k])*u;katG.visible=true;katG.position.set(L('x'),L('y'),L('z'));katG.rotation.set(L('rx'),L('ry'),L('rz'))}
 else if(MV.draw>.03&&melName()=='Katana'){const d=1-MV.draw,sw=Math.sin(t0*1.6)*.01;katG.visible=true;katG.position.set(.26-d*.1,-.2-d*.5+sw,-.5);katG.rotation.set(-1.2,.25,-.95+d*.5)}else katG.visible=false}
