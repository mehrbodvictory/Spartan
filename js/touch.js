/* ---------- mobile touch controls + no-zoom / no-copy protections ---------- */
let isTouch=false;const tc=document.createElement('div');tc.id='tc';$('#hud').appendChild(tc);
const noLock=matchMedia('(hover:none)').matches||!R.domElement.requestPointerLock;
tc.innerHTML='<div id="stick"><i></i></div>'+[['jump','JUMP','right:18px;bottom:22px;width:76px;height:76px'],['reload','RELOAD','right:106px;bottom:22px'],['swap','SWAP','right:106px;bottom:90px'],['nade','NADE','right:30px;bottom:108px'],['ks','STREAK','right:106px;bottom:158px'],['melee','MELEE','right:30px;bottom:176px'],['pause','II','right:10px;top:10px;width:44px;height:44px']].map(([k,t,s])=>`<div class="tb" data-b="${k}" style="${s}">${t}</div>`).join('');
const st={id:null},lk={id:null,x:0,y:0},fi={id:null,x:0,y:0},bt={};
function enableTouch(){if(isTouch)return;isTouch=true;document.body.classList.add('touch');$('#hint').textContent='Left side: look · Right side: shoot · Stick: move · Buttons: jump, reload, grenade, melee'}
if(matchMedia('(pointer:coarse)').matches)enableTouch();
function lockPtr(){if(noLock){paused=0;hidePause();try{const d=document.documentElement;d.requestFullscreen&&d.requestFullscreen().catch(()=>{});screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}else R.domElement.requestPointerLock()}
function stickMove(t){const r=$('#stick').getBoundingClientRect(),R0=r.width/2;let dx=t.clientX-(r.left+R0),dy=t.clientY-(r.top+R0);const m=Math.hypot(dx,dy);if(m>R0){dx*=R0/m;dy*=R0/m}const nx=dx/R0,ny=dy/R0;$('#stick i').style.transform=`translate(${dx}px,${dy}px)`;key.KeyW=ny<-.3;key.KeyS=ny>.3;key.KeyA=nx<-.3;key.KeyD=nx>.3;key.ShiftLeft=Math.hypot(nx,ny)>.95}
function stickEnd(){st.id=null;$('#stick i').style.transform='';key.KeyW=key.KeyS=key.KeyA=key.KeyD=key.ShiftLeft=false}
function look(t,o){const k=.0042*sens*fr;yaw-=(t.clientX-o.x)*k;pitch=cl(pitch-(t.clientY-o.y)*k,-1.45,1.45);o.x=t.clientX;o.y=t.clientY}
function tbDown(k){if(k=='jump')key.Space=1;else if(k=='reload')startRel();else if(k=='nade')throwG();else if(k=='melee')melee();else if(k=='swap')swap((cur+1)%wp.length);else if(k=='ks')useStreak();else if(k=='pause'&&run&&!paused&&!over){paused=1;trig=0;stickEnd();showPause()}}
const live=e=>run&&!paused&&!over&&!(e.target.closest&&e.target.closest('#pause,#end,#menu,#dev'));
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
