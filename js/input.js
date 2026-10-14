/* ---------- input ---------- */
$('#go').onclick=startGame;$('#again').onclick=startGame;$('#tomenu').onclick=()=>{netClose();for(const b of bots)S.remove(b.m);bots=[];clearFlags();buildMap();showRank();$('#end').style.display=$('#hud').style.display='none';$('#menu').style.display='block'};

document.addEventListener('pointerlockchange',()=>{const l=document.pointerLockElement==R.domElement;if(run){paused=!l;(l?hidePause:showPause)()}});
addEventListener('mousemove',e=>{if(!run||paused)return;const k=.0022*sens*fr;yaw-=e.movementX*k;pitch=cl(pitch-e.movementY*k,-1.45,1.45);sw.x=cl(sw.x-e.movementX*.0012,-.1,.1);sw.y=cl(sw.y-e.movementY*.0012,-.08,.08)});
addEventListener('mousedown',e=>{if(e.button==0&&run&&!paused){trig=1;fresh=1}});addEventListener('mouseup',e=>{if(e.button==0)trig=0});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(!run)return;if(e.code=='Space')e.preventDefault();if(!key[e.code]){if(e.code=='KeyF')fresh=1;if(e.code=='KeyR')startRel();if(e.code=='KeyG')throwG();if(e.code=='Digit1')swap(0);if(e.code=='Digit2')swap(1);if(e.code=='Digit3')swap(wp.findIndex(w=>w.pw));if(e.code=='KeyV')melee();if(e.code=='KeyE')useStreak();if(e.code=='KeyQ')swap((cur+1)%wp.length)}key[e.code]=1});
addEventListener('keyup',e=>key[e.code]=0);addEventListener('blur',()=>{for(const k in key)key[k]=0;trig=0});
