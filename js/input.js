/* ===================== input.js ===================== */
/* ---------- gamepad + WebXR VR: the same actions as keyboard and mouse (see controls.js), full menu navigation with the controller (spatial focus + on-screen keyboard)
   and menus inside the headset (the DOM menus are mirrored onto a panel you point at with the right controller) ---------- */
let usingPad=false,gpEdge={},gpT=0,gpSprint=0,gpTrig=0,gpMenuI=-1,vrMode=0,xrS=null,xrRig=null,rigYaw=0,xrCtl=[],xrGunIn=0,xrSnap=0,xrWrist=null,xrWristT=0,xrEye=null,gpHS={},gpPend={};
const QUEST=/OculusBrowser|Quest/i.test(navigator.userAgent||'');
try{vrMode=localStorage.getItem('sd-vr');vrMode=vrMode==null?(QUEST?1:0):+vrMode}catch(e){}
const gpBtn=(g,i)=>!!(g.buttons[i]&&g.buttons[i].pressed),gpVal=(g,i)=>g&&g.buttons[i]?g.buttons[i].value:0,gpDz=(v,d)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d);
function gpGet(){const l=navigator.getGamepads?navigator.getGamepads():[];for(const g of l)if(g&&g.connected&&g.axes.length>=4)return g;return null}
const gpEdgeOf=(k,on)=>{const r=on&&!gpEdge[k];gpEdge[k]=on;return r};
/* tap / hold buttons */
function holdBtn(id,on,dt,tap,hold,thr){thr=thr||.35;const h=gpHS[id]||(gpHS[id]={t:0,d:0,on:0});if(on){if(!h.on){h.on=1;h.t=0;h.d=0}h.t+=dt;if(!h.d&&h.t>=thr){h.d=1;hold&&hold()}}else if(h.on){h.on=0;if(!h.d&&tap)tap()}return h.on&&h.d}
const inMatch=()=>run&&!paused&&!over&&!(typeof fin!='undefined'&&fin);
function pausePad(){if(!run||over)return;paused=1;trig=0;gpTrig=0;gpSprint=0;actAds(0);showPause()}
function resumePad(){paused=0;hidePause();if(xrS)return;try{const p=R.domElement.requestPointerLock&&R.domElement.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
const resumeAny=()=>{if(vrMode&&navigator.xr&&!xrS)$('#resume').click();else resumePad()};
/* ---------- shared "both bumpers = field upgrade" logic: single bumper actions fire after a short delay unless the other bumper joins ---------- */
function bumpers(dt,lb,rb,tactical,lethal,field){const e1=gpEdgeOf('bl',lb),e2=gpEdgeOf('br',rb);if((e1||e2)&&lb&&rb){field();gpPend.l=gpPend.r=0;gpPend.combo=1}else{if(e1)gpPend.l=.09;if(e2)gpPend.r=.09}
 if(!lb&&!rb)gpPend.combo=0;for(const k of['l','r'])if(gpPend[k]>0){gpPend[k]-=dt;if(gpPend[k]<=0&&!gpPend.combo)(k=='l'?tactical:lethal)()}}
/* ---------- controller in a match ---------- */
function padPlay(g,dt){const lx=gpDz(g.axes[0],.2),ly=gpDz(g.axes[1],.2),rx=gpDz(g.axes[2],.14),ry=gpDz(g.axes[3],.14);
 key.KeyA=lx<-.2;key.KeyD=lx>.2;key.KeyW=ly<-.2;key.KeyS=ly>.2;if(key.KeyS)ST.auto=0;
 if(gpEdgeOf('l3',gpBtn(g,10))){if(ST.ads>.4)actSteady();else{if(t0-ST.lastShift<.32&&ST.tacCd<=0)ST.tac=4;ST.lastShift=t0;gpSprint=!gpSprint}}if(!(ly<-.2))gpSprint=0;key.ShiftLeft=!!gpSprint;
 const cv=v=>Math.sign(v)*Math.pow(Math.abs(v),1.7);yaw-=cv(rx)*dt*3.4*sens*fr;pitch=cl(pitch-cv(ry)*dt*2.5*sens*fr,-1.45,1.45);
 const lt=gpVal(g,6)>.4;actAds(lt);const rt=gpVal(g,7)>.35;if(rt&&!gpTrig){gpTrig=1;trig=1;fresh=1}else if(!rt&&gpTrig){gpTrig=0;trig=0}
 key.Space=gpBtn(g,0);if(gpEdgeOf('a',key.Space))actJumpPress();
 holdBtn('b',gpBtn(g,1),dt,actCrouch,actProne,.4);
 const xh=holdBtn('x',gpBtn(g,2),dt,startRel,actInteract,.35);key.KeyF=!!xh;
 holdBtn('y',gpBtn(g,3),dt,actSwapNext,actPlate,.5);
 bumpers(dt,gpBtn(g,4),gpBtn(g,5),actTactical,throwG,actField);
 if(gpEdgeOf('r3',gpBtn(g,11))){if(lt)actMount();else melee()}
 if(gpEdgeOf('du',gpBtn(g,12)))actPing();holdBtn('dd',gpBtn(g,13),dt,actInv,actNV,.5);if(gpEdgeOf('dl',gpBtn(g,14)))actFireMode();if(gpEdgeOf('dr',gpBtn(g,15)))useStreak(0);
 const vh=holdBtn('v',gpBtn(g,8),dt,actMap,()=>actSb(1),.3);if(!gpBtn(g,8)&&ST.sbOn&&gpHS.v&&!gpHS.v.on)actSb(0);
 if(gpEdgeOf('st',gpBtn(g,9)))pausePad()}
/* ---------- menus with the controller: spatial focus, A press, B back, left/right changes drop-downs and sliders ---------- */
const vis=e=>e.getClientRects().length>0&&e.getBoundingClientRect().width>1;
function menuBox(){return['#osk','#dev','#pause','#end','#home','#menu'].map(s=>document.querySelector(s)).find(c=>c&&vis(c)&&getComputedStyle(c).display!='none')}
function clickables(box){const out=[];for(const e of box.querySelectorAll('*')){if(!vis(e))continue;const t=e.tagName;if(t=='BUTTON'||t=='SELECT'||t=='INPUT'||t=='TEXTAREA'||e.onclick||getComputedStyle(e).cursor=='pointer')out.push(e)}return out.filter(e=>!out.some(o=>o!==e&&e.contains(o)))}
function spatial(els,cur,dx,dy){const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bs=1e9;for(const e of els){if(e===cur)continue;const q=e.getBoundingClientRect(),vx=q.left+q.width/2-cx,vy=q.top+q.height/2-cy,along=vx*dx+vy*dy;if(along<=2)continue;const s=along+Math.abs(vx*dy-vy*dx)*2.2;if(s<bs){bs=s;best=e}}return best}
function menuAct(el,back){const t=el.tagName;if(t=='SELECT'){el.selectedIndex=(el.selectedIndex+(back?el.options.length-1:1))%el.options.length;el.dispatchEvent(new Event('change',{bubbles:true}))}else if(t=='INPUT'&&el.type=='range'){}else if((t=='INPUT'&&el.type!='checkbox'&&el.type!='range')||t=='TEXTAREA')openOSK(el);else if(el.id=='resume')resumeAny();else el.click()}
function menuNav(g,dt){const box=menuBox();if(!box)return;const els=clickables(box);if(!els.length)return;let cur=els.includes(document.activeElement)?document.activeElement:null;
 if(!cur){cur=els[0];cur.focus()}gpT-=dt;const up=gpBtn(g,12)||g.axes[1]<-.6,dn=gpBtn(g,13)||g.axes[1]>.6,lf=gpBtn(g,14)||g.axes[0]<-.6,rt=gpBtn(g,15)||g.axes[0]>.6;if(!(up||dn||lf||rt))gpT=0;
 if((up||dn||lf||rt)&&gpT<=0){gpT=.2;const isSel=cur.tagName=='SELECT',isRng=cur.type=='range';if((lf||rt)&&(isSel||isRng)){if(isSel){cur.selectedIndex=cl(cur.selectedIndex+(rt?1:-1),0,cur.options.length-1);cur.dispatchEvent(new Event('change',{bubbles:true}))}else{const s=+cur.step||1;cur.value=+cur.value+(rt?s:-s);cur.dispatchEvent(new Event('input',{bubbles:true}));cur.dispatchEvent(new Event('change',{bubbles:true}))}}
  else{const n=spatial(els,cur,lf?-1:rt?1:0,up?-1:dn?1:0);if(n){n.focus();n.scrollIntoView({block:'nearest',inline:'nearest'})}}}
 if(gpEdgeOf('a',gpBtn(g,0)))menuAct(document.activeElement&&els.includes(document.activeElement)?document.activeElement:cur);
 if(gpEdgeOf('b',gpBtn(g,1))){if(box.id=='osk')closeOSK();else if(box.id=='pause')resumeAny();else{const b=$('#back');if(b&&vis(b))b.click();else{const t=$('#tomenu');if(t&&vis(t))t.click()}}}
 if(gpEdgeOf('s',gpBtn(g,9))&&box.id=='pause')resumeAny()}
/* ---------- on-screen keyboard (used by controller and VR for the name and match code boxes) ---------- */
let oskT=null;
function openOSK(inp){const o=$('#osk');if(!o.dataset.b){o.dataset.b=1;const rows=['1234567890','QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];o.innerHTML=rows.map(r=>'<div class="r">'+[...r].map(c=>`<button data-k="${c}">${c}</button>`).join('')+'</div>').join('')+'<div class="r"><button data-k="-">-</button><button data-k=" " style="min-width:200px">space</button><button data-k="⌫">⌫</button><button data-k="OK" style="min-width:90px">Done</button></div>';
  o.onclick=e=>{const b=e.target.closest('button');if(!b||!oskT)return;const k=b.dataset.k;if(k=='OK')return closeOSK();let v=oskT.value;if(k=='⌫')v=v.slice(0,-1);else if(!oskT.maxLength||oskT.maxLength<0||v.length<oskT.maxLength)v+=(oskT.id=='jc'?k:(v.length?k.toLowerCase():k));oskT.value=v;oskT.dispatchEvent(new Event('input',{bubbles:true}));oskT.dispatchEvent(new Event('change',{bubbles:true}))}}
 oskT=inp;o.style.display='block';const f=o.querySelector('button');f&&f.focus()}
function closeOSK(){const o=$('#osk');o.style.display='none';oskT=null}
function inputTick(dt){if(xrS){vrPre(dt);return}
 const g=gpGet();if(!g){if(usingPad&&gpTrig){gpTrig=0;trig=0}return}
 const any=g.buttons.some(b=>b.pressed)||g.axes.some(a=>Math.abs(a)>.5);
 if(!usingPad&&any){usingPad=true;$('#hint').textContent='Controller: LS move · RS look · RT fire · LT aim · A jump · B crouch (hold prone) · X reload (hold use) · Y swap (hold plate) · LB tactical · RB lethal · LB+RB field upgrade · L3 sprint · R3 knife · D-pad ping/fire mode/killstreak · Start pause'}
 if(!usingPad)return;if(inMatch())padPlay(g,dt);else{if(gpTrig){gpTrig=0;trig=0}if(ST.adsIn)actAds(0);menuNav(g,dt)}}
addEventListener('gamepadconnected',()=>{usingPad=true});
/* ---------------- VR ---------------- */
if(R.xr)xrCtl=[0,1].map(i=>{const c=R.xr.getController(i);c.addEventListener('connected',e=>{c.userData.hand=e.data.handedness;c.userData.gp=e.data.gamepad});c.addEventListener('disconnected',()=>{c.userData.hand=null;c.userData.gp=null});return c});
const vrHand=h=>xrCtl.find(c=>c.userData.hand==h)||null;
function vrPanel(){const c=document.createElement('canvas');c.width=256;c.height=160;const t=new THREE.CanvasTexture(c),m=new THREE.Mesh(new THREE.PlaneGeometry(.16,.1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false}));m.renderOrder=999;m.position.set(0,.03,.08);m.rotation.x=-1.1;return{m,c,g:c.getContext('2d'),t}}
/* menu panel: a big canvas that mirrors whatever DOM menu is showing; the right controller is a laser pointer */
let vm=null,vmT=0,vmHover=null,vmLast='',vmLatch=null;
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
 if(!vm.mesh.parent){S.add(vm.mesh);S.add(vm.dot);S.add(vm.ray);vmLast='';vm.placeN=6}
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
const b4=(g,i)=>!!(g&&g.buttons[i]&&g.buttons[i].pressed);
function vrMenuClear(){if(vm){for(const o of[vm.mesh,vm.dot,vm.ray])if(o&&o.parent)o.parent.remove(o);vm.placed=false;vmHover=null}}
function vrStart(){vrMenuClear();xrRig=xrRig||(()=>{const r=new THREE.Group();S.add(r);return r})();S.remove(C);xrRig.add(C);rigYaw=yaw;for(const c of xrCtl)xrRig.add(c);xrGunIn=0;xrSnap=0;sun.castShadow=false;xrWrist=vrPanel();vmLatch=null;R.setAnimationLoop(gameFrame)}
function vrEnd(){R.setAnimationLoop(null);xrS=null;if(xrRig){xrRig.remove(C);S.add(C);for(const c of xrCtl)xrRig.remove(c);if(vm){for(const o of[vm.mesh,vm.dot,vm.ray])if(o.parent)o.parent.remove(o);vm.placed=false}}C.add(gun);gun.position.set(.2,-.2,-.45);gun.rotation.set(0,0,0);if(xrWrist&&xrWrist.m.parent)xrWrist.m.parent.remove(xrWrist.m);xrWrist=null;sun.castShadow=gfxQ=='high';C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();trig=0;gpTrig=0;for(const k in key)key[k]=false;if(run&&!over&&!paused)pausePad()}
function vrPre(dt){const rh=vrHand('right'),lh=vrHand('left'),gr=rh&&rh.userData.gp,gl=lh&&lh.userData.gp;
 if(!inMatch()){ /* menus, pause, podium: the rig floats at the camera the menu uses, controllers become a laser pointer */
  for(const k in key)key[k]=false;trig=0;gpTrig=0;actAds(0);if(!vmLatch||(typeof fin!='undefined'&&fin)||!run){vmLatch=C.position.clone();vmLatch.y=Math.max(0,vmLatch.y-1.6)}
  xrRig.position.copy(vmLatch);xrRig.rotation.y=(typeof fin!='undefined'&&fin)?0:rigYaw;vrMenu(dt,gr,gl);return}
 if(vm&&vm.mesh.parent){vm.mesh.parent.remove(vm.mesh);vm.dot.parent&&vm.dot.parent.remove(vm.dot);vm.ray.parent&&vm.ray.parent.remove(vm.ray);vm.placed=false}vmLatch=null;
 xrRig.position.set(P.x,P.y||0,P.z);xrRig.rotation.y=rigYaw;xrRig.updateMatrixWorld(true);
 if(rh){const m=new THREE.Matrix4().multiplyMatrices(xrRig.matrixWorld,rh.matrix),d=new THREE.Vector3(0,0,-1).transformDirection(m);yaw=Math.atan2(-d.x,-d.z);pitch=cl(Math.asin(Math.max(-1,Math.min(1,d.y))),-1.45,1.45)}
 const lx=gl?gpDz(gl.axes[2]||0,.25):0,ly=gl?gpDz(gl.axes[3]||0,.25):0;key.KeyA=lx<-.2;key.KeyD=lx>.2;key.KeyW=ly<-.2;key.KeyS=ly>.2;if(key.KeyS)ST.auto=0;
 if(gl&&gpEdgeOf('lsc',b4(gl,3))){if(t0-ST.lastShift<.32&&ST.tacCd<=0)ST.tac=4;ST.lastShift=t0;gpSprint=!gpSprint}if(!(ly<-.2))gpSprint=0;key.ShiftLeft=!!gpSprint;
 const tx=gr?gr.axes[2]||0:0,ty=gr?gr.axes[3]||0:0;if(Math.abs(tx)>.7){if(!xrSnap){rigYaw-=Math.sign(tx)*Math.PI/6;xrSnap=1}}else xrSnap=0;
 if(gpEdgeOf('vru',ty<-.8))actPing();if(gpEdgeOf('vrd',ty>.8))actFireMode();
 const rt=gpVal(gr,0)>.4;if(rt&&!gpTrig){gpTrig=1;trig=1;fresh=1}else if(!rt&&gpTrig){gpTrig=0;trig=0}
 key.Space=b4(gr,4);if(gpEdgeOf('va',key.Space))actJumpPress();
 holdBtn('vb',b4(gr,5),dt,actSwapNext,actPlate,.5);holdBtn('vx',b4(gl,4),dt,actCrouch,actProne,.4);
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
   g.font='24px sans-serif';g.fillStyle='#ffd27a';g.fillText(mode=='Zombies'?('Round '+($('#zr').textContent||'')+'   '+($('#zpt').textContent||'')):('Kills '+kills),12,128);xrWrist.t.needsUpdate=true}}
 else if(xrWrist&&xrWrist.m.parent)xrWrist.m.parent.remove(xrWrist.m)}
function enterVR(){if(!navigator.xr)return false;navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(s=>{xrS=s;s.addEventListener('end',vrEnd);R.xr.enabled=true;R.xr.setReferenceSpaceType('local-floor');return R.xr.setSession(s)}).then(()=>{if(xrS)vrStart()}).catch(()=>{xrS=null;if(run)_lockPtr()});return true}
const _lockPtr=lockPtr;
lockPtr=function(){if(xrS){paused=0;hidePause();return}if(vrMode&&navigator.xr&&run&&!over){enterVR();return}_lockPtr()};
/* auto VR: where WebXR exists (Quest browser), the whole site opens in VR. Browsers only allow starting VR from a user gesture, so the very first click / trigger pull anywhere on the page does it
   (and the browser's own "enter VR" offer is registered where supported) */
if(navigator.xr&&navigator.xr.isSessionSupported)navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(!ok)return;$('#vrL').style.display='';$('#vrm').value=vrMode;$('#vrm').onchange=e=>{vrMode=+e.target.value;try{localStorage.setItem('sd-vr',vrMode)}catch(_){}};
 try{if(navigator.xr.offerSession)navigator.xr.offerSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(s=>{xrS=s;s.addEventListener('end',vrEnd);R.xr.enabled=true;R.xr.setReferenceSpaceType('local-floor');return R.xr.setSession(s)}).then(()=>{if(xrS)vrStart()}).catch(()=>{})}catch(e){}
 if(vrMode){const sp=document.createElement('div');sp.id='vrsplash';sp.innerHTML='<b>ENTER VR</b><span>Pull the trigger or click anywhere</span>';document.body.appendChild(sp);const go=()=>{sp.remove();if(!xrS)enterVR()};sp.addEventListener('click',go,{once:true});sp.addEventListener('pointerdown',go,{once:true})}}).catch(()=>{});
