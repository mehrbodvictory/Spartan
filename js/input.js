/* ===================== input.js ===================== */
/* ---------- gamepad controller support (menus and play) and WebXR virtual reality ---------- */
let usingPad=false,gpEdge={},gpT=0,gpSprint=0,gpTrig=0,gpHold=0,gpMenuI=-1,vrMode=0,xrS=null,xrRig=null,rigYaw=0,xrCtl=[],xrGunIn=0,xrSnap=0,xrWrist=null,xrWristT=0;
try{vrMode=+localStorage.getItem('sd-vr')||0}catch(e){}
const gpBtn=(g,i)=>!!(g.buttons[i]&&g.buttons[i].pressed),gpDz=(v,d)=>Math.abs(v)<d?0:(v-Math.sign(v)*d)/(1-d);
function gpGet(){const l=navigator.getGamepads?navigator.getGamepads():[];for(const g of l)if(g&&g.connected&&g.axes.length>=4)return g;return null}
function gpEdgeOf(k,on){const r=on&&!gpEdge[k];gpEdge[k]=on;return r}
const inMatch=()=>run&&!paused&&!over&&!(typeof fin!='undefined'&&fin);
function pausePad(){if(!run||over)return;paused=1;trig=0;gpTrig=0;gpSprint=0;showPause()}
const resumeAny=()=>{if(vrMode&&navigator.xr&&!xrS)$('#resume').click();else resumePad()};
function resumePad(){paused=0;hidePause();try{const p=R.domElement.requestPointerLock&&R.domElement.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
/* menu navigation: D-pad or left stick moves focus, A presses, B goes back / resumes, left/right changes sliders and drop-downs */
function menuNav(g,dt){const vis=e=>e.getClientRects().length>0,box=['#dev','#pause','#end','#home','#menu'].map(s=>document.querySelector(s)).find(c=>c&&vis(c)&&getComputedStyle(c).display!='none');if(!box)return;
 const els=[...box.querySelectorAll('button,select,input')].filter(vis);if(!els.length)return;
 let i=els.indexOf(document.activeElement);if(i<0)i=gpMenuI>=0&&gpMenuI<els.length?gpMenuI:-1;
 gpT-=dt;const up=gpBtn(g,12)||g.axes[1]<-.6,dn=gpBtn(g,13)||g.axes[1]>.6,lf=gpBtn(g,14)||g.axes[0]<-.6,rt=gpBtn(g,15)||g.axes[0]>.6;
 if(!(up||dn||lf||rt))gpT=0;
 if((up||dn||lf||rt)&&gpT<=0){gpT=.22;if(up||dn){i=i<0?0:(i+(dn?1:-1)+els.length)%els.length;els[i].focus();els[i].scrollIntoView({block:'nearest'})}else{const e=els[i<0?0:i];if(e.tagName=='SELECT'){e.selectedIndex=Math.max(0,Math.min(e.options.length-1,e.selectedIndex+(rt?1:-1)));e.dispatchEvent(new Event('change',{bubbles:true}))}else if(e.type=='range'){const st=+e.step||1;e.value=+e.value+(rt?st:-st);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}}}
 gpMenuI=i;
 if(gpEdgeOf('a',gpBtn(g,0))){const e=els[i<0?0:i];if(e.tagName=='INPUT'&&e.type!='range')e.focus();else if(e.id=='resume')resumeAny();else if(e.tagName!='SELECT'&&e.type!='range')e.click()}
 if(gpEdgeOf('b',gpBtn(g,1))){const b=document.querySelector('#back');if(box.id=='pause')resumeAny();else if(b&&vis(b))b.click();else{const t=document.querySelector('#tomenu');if(t&&vis(t))t.click()}}
 if(gpEdgeOf('s',gpBtn(g,9))&&box.id=='pause')resumeAny()}
function padPlay(g,dt){
 const lx=gpDz(g.axes[0],.2),ly=gpDz(g.axes[1],.2),rx=gpDz(g.axes[2],.14),ry=gpDz(g.axes[3],.14);
 key.KeyA=lx<-.2;key.KeyD=lx>.2;key.KeyW=ly<-.2;key.KeyS=ly>.2;
 if(gpEdgeOf('l3',gpBtn(g,10)))gpSprint=!gpSprint;if(!(ly<-.2))gpSprint=0;key.ShiftLeft=!!gpSprint;
 const k=Math.sign,cv=v=>k(v)*Math.pow(Math.abs(v),1.7);yaw-=cv(rx)*dt*3.4*sens*fr;pitch=cl(pitch-cv(ry)*dt*2.5*sens*fr,-1.45,1.45);
 const rt=(g.buttons[7]&&g.buttons[7].value>.35)||false;if(rt&&!gpTrig){gpTrig=1;trig=1;fresh=1}else if(!rt&&gpTrig){gpTrig=0;trig=0}
 key.Space=gpBtn(g,0);
 if(gpEdgeOf('x',gpBtn(g,2)))startRel();if(gpEdgeOf('b',gpBtn(g,1))||gpEdgeOf('r3',gpBtn(g,11)))melee();if(gpEdgeOf('y',gpBtn(g,3)))swap((cur+1)%wp.length);
 if(gpEdgeOf('lb',gpBtn(g,4)))throwG();if(gpEdgeOf('lt',(g.buttons[6]&&g.buttons[6].value>.5)||false))throwG();
 const e=gpBtn(g,5);key.KeyE=e;if(gpEdgeOf('rb',e))useStreak();
 if(gpEdgeOf('dl',gpBtn(g,14)))swap((cur+wp.length-1)%wp.length);if(gpEdgeOf('dr',gpBtn(g,15)))swap((cur+1)%wp.length);if(gpEdgeOf('du',gpBtn(g,12)))swap(0);if(gpEdgeOf('dd',gpBtn(g,13)))swap(Math.min(1,wp.length-1));
 if(gpEdgeOf('st',gpBtn(g,9)))pausePad()}
function inputTick(dt){if(xrS){vrPre(dt);return}
 const g=gpGet();if(!g){if(usingPad&&gpTrig){gpTrig=0;trig=0}return}
 const any=g.buttons.some(b=>b.pressed)||g.axes.some(a=>Math.abs(a)>.5);
 if(!usingPad&&any){usingPad=true;$('#hint').textContent='Controller: left stick move · right stick look · RT shoot · A jump · X reload · B knife · Y swap · LB grenade · RB use · L3 sprint · Start pause'}
 if(!usingPad)return;
 if(inMatch())padPlay(g,dt);
 else{if(gpTrig){gpTrig=0;trig=0}menuNav(g,dt)}}
addEventListener('gamepadconnected',()=>{usingPad=true});
/* ---------------- VR ---------------- */
if(R.xr)xrCtl=[0,1].map(i=>{const c=R.xr.getController(i);c.addEventListener('connected',e=>{c.userData.hand=e.data.handedness;c.userData.gp=e.data.gamepad});c.addEventListener('disconnected',()=>{c.userData.hand=null;c.userData.gp=null});return c});
function vrHand(h){return xrCtl.find(c=>c.userData.hand==h)||null}
function vrPanel(){const c=document.createElement('canvas');c.width=256;c.height=160;const t=new THREE.CanvasTexture(c),m=new THREE.Mesh(new THREE.PlaneGeometry(.16,.1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false}));m.renderOrder=999;m.position.set(0,.03,.08);m.rotation.x=-1.1;return{m,c,g:c.getContext('2d'),t}}
function vrStart(){xrRig=xrRig||(()=>{const r=new THREE.Group();S.add(r);return r})();S.remove(C);xrRig.add(C);rigYaw=yaw;for(const c of xrCtl)xrRig.add(c);
 xrGunIn=0;xrSnap=0;sun.castShadow=false;xrWrist=vrPanel();R.setAnimationLoop(gameFrame)}
function vrEnd(){R.setAnimationLoop(null);xrS=null;if(xrRig){xrRig.remove(C);S.add(C);for(const c of xrCtl)xrRig.remove(c)}C.add(gun);gun.position.set(.2,-.2,-.45);gun.rotation.set(0,0,0);if(xrWrist&&xrWrist.m.parent)xrWrist.m.parent.remove(xrWrist.m);xrWrist=null;sun.castShadow=gfxQ=='high';C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();trig=0;gpTrig=0;for(const k in key)key[k]=false;if(run&&!over&&!paused)pausePad()}
function vrPre(dt){const rh=vrHand('right'),lh=vrHand('left');
 xrRig.position.set(P.x,P.y||0,P.z);xrRig.rotation.y=rigYaw;xrRig.updateMatrixWorld(true);
 if(rh){const m=new THREE.Matrix4().multiplyMatrices(xrRig.matrixWorld,rh.matrix),d=new THREE.Vector3(0,0,-1).transformDirection(m);yaw=Math.atan2(-d.x,-d.z);pitch=cl(Math.asin(Math.max(-1,Math.min(1,d.y))),-1.45,1.45)}
 const gr=rh&&rh.userData.gp,gl=lh&&lh.userData.gp,b=(g,i)=>!!(g&&g.buttons[i]&&g.buttons[i].pressed),v=(g,i)=>g&&g.buttons[i]?g.buttons[i].value:0;
 if(!inMatch()){for(const k in key)key[k]=false;trig=0;gpTrig=0;return}
 const lx=gl?gpDz(gl.axes[2]||0,.25):0,ly=gl?gpDz(gl.axes[3]||0,.25):0;key.KeyA=lx<-.2;key.KeyD=lx>.2;key.KeyW=ly<-.2;key.KeyS=ly>.2;
 if(gl&&gpEdgeOf('lsc',b(gl,3)))gpSprint=!gpSprint;if(!(ly<-.2))gpSprint=0;key.ShiftLeft=!!gpSprint;
 const tx=gr?gr.axes[2]||0:0;if(Math.abs(tx)>.7){if(!xrSnap){rigYaw-=Math.sign(tx)*Math.PI/6;xrSnap=1}}else xrSnap=0;
 const rt=v(gr,0)>.4;if(rt&&!gpTrig){gpTrig=1;trig=1;fresh=1}else if(!rt&&gpTrig){gpTrig=0;trig=0}
 key.Space=b(gr,4);if(gpEdgeOf('vb',b(gr,5)))swap((cur+1)%wp.length);
 const xu=b(gl,4);key.KeyE=xu;if(gpEdgeOf('vx',xu))useStreak();
 if(gpEdgeOf('vlt',v(gl,0)>.5))throwG();if(gpEdgeOf('vlg',v(gl,1)>.5))startRel();if(gpEdgeOf('vrg',v(gr,1)>.6))melee();
 if(gpEdgeOf('vy',b(gl,5))&&xrS)xrS.end().catch(()=>{})}
/* after the game has updated: put the gun in the right hand, hide the camera-attached arms, draw the wrist HUD */
function vrPost(dt){if(!xrS)return;const rh=vrHand('right'),lh=vrHand('left');
 if(rh&&!xrGunIn){rh.add(gun);xrGunIn=1}else if(rh&&gun.parent!==rh)rh.add(gun);
 if(rh){gun.position.set(0,-.025,-.06);gun.rotation.set(0,0,0)}
 if(typeof fpArm!='undefined')for(const a of[fpArm.r,fpArm.l])a.up.visible=a.fo.visible=false;
 if(over||(paused&&!(typeof netOn!='undefined'&&netOn)))xrS.end().catch(()=>{});
 if(lh&&xrWrist){if(xrWrist.m.parent!==lh)lh.add(xrWrist.m);xrWristT-=dt;if(xrWristT<=0){xrWristT=.2;const g=xrWrist.g;g.clearRect(0,0,256,160);g.fillStyle='rgba(8,18,24,.78)';g.fillRect(0,0,256,160);g.fillStyle='#fff';g.font='bold 34px sans-serif';g.fillText($('#am').textContent||'',12,44);
   const bar=(y,col,el)=>{g.fillStyle='rgba(255,255,255,.15)';g.fillRect(12,y,232,14);g.fillStyle=col;g.fillRect(12,y,232*Math.max(0,Math.min(1,parseFloat(el.style.width)/100||0)),14)};bar(62,'#62e0f0',$('#sh'));bar(84,'#6bd66b',$('#hp'));
   g.font='24px sans-serif';g.fillStyle='#ffd27a';g.fillText(mode=='Zombies'?('Round '+($('#zr').textContent||'')+'   '+($('#zpt').textContent||'')):('Kills '+kills),12,128);xrWrist.t.needsUpdate=true}}}
function enterVR(){if(!navigator.xr)return false;navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(s=>{xrS=s;s.addEventListener('end',vrEnd);R.xr.enabled=true;R.xr.setReferenceSpaceType('local-floor');return R.xr.setSession(s)}).then(()=>{if(xrS)vrStart()}).catch(()=>{xrS=null;_lockPtr()});return true}
const _lockPtr=lockPtr;
lockPtr=function(){if(vrMode&&!xrS&&navigator.xr&&run&&!over){enterVR();return}_lockPtr()};
if(navigator.xr&&navigator.xr.isSessionSupported)navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(ok){$('#vrL').style.display='';$('#vrm').value=vrMode;$('#vrm').onchange=e=>{vrMode=+e.target.value;try{localStorage.setItem('sd-vr',vrMode)}catch(_){}}}}).catch(()=>{});
