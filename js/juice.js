/* ---------- juice: particles, shake, sounds, medals, best scores ---------- */
const pts=[],mc={},sw={x:0,y:0},muz=new THREE.PointLight(0xffc060,0,12);muz.position.set(.2,-.15,-1);C.add(muz);
let shake=0,flashL=0,fk=0,streak=0,lastKillT=-9;
function burst(p,n,col,sp,life,sz){for(let i=0;i<n&&pts.length<320;i++){const m=new THREE.Mesh(bg,mc[col]||(mc[col]=new THREE.MeshBasicMaterial({color:col})));const s=sz*(.5+Math.random());m.scale.setScalar(s);m.position.copy(p);S.add(m);
 pts.push({m,v:V(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(sp*(.3+Math.random())),l:life,L:life,s})}}
function noise(d,f,v){try{ac=ac||new AudioContext();const n=ac.sampleRate*d,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=f;g.gain.value=v*vol;s.connect(fl).connect(g).connect(ac.destination);s.start()}catch(e){}}
function gunSnd(w){noise(w.pel>1?.22:.1,w.pel>1?1800:3500,.3);beep(w.pel>1?90:140,.08,'sine',.12)}
function msg(t,s){const e=$('#ms');e.textContent=t;msT=s||2;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
function floatTxt(p,t,c){const q=p.clone().project(C);if(q.z>1)return;const e=document.createElement('div');e.className='ft';e.textContent=t;e.style.cssText=`left:${(q.x*.5+.5)*innerWidth}px;top:${(-q.y*.5+.5)*innerHeight}px;color:${c}`;$('#hud').appendChild(e);setTimeout(()=>e.remove(),800)}
function juiceHit(b,d,head){b.fl=.08;burst(V(b.x,head?1.75:1,b.z),head?9:5,head?0xffd24a:0xffffff,4,.3,.07);floatTxt(V(b.x+(Math.random()-.5)*.6,2.2,b.z),Math.round(d)+(head?'!':''),head?'#ffd24a':'#ffffff')}
function juiceKill(b,head){burst(V(b.x,1,b.z),26,0xb5452e,7,.9,.18);burst(V(b.x,1.4,b.z),8,0x62e0f0,5,.7,.1);shake=Math.max(shake,.3);beep(1200,.12,'triangle',.07);setTimeout(()=>beep(1700,.14,'triangle',.06),70);
 streak=t0-lastKillT<3.5?streak+1:1;lastKillT=t0;const m=['','Headshot!','Double Kill!','Triple Kill!','Overkill!','Killing Spree!'];msg(streak>1?m[Math.min(streak,5)]:head?m[1]:'+1 Kill',1.3)}
function juiceReset(){for(const p of pts)S.remove(p.m);pts.length=0;streak=0;lastKillT=-9;shake=0;const h=$('#hint');h.style.opacity=1;setTimeout(()=>h.style.opacity=0,11000);msg(MODES[mode]||'First to 15 kills',3)}
function juiceTick(dt){
 shake*=Math.exp(-7*dt);if(shake>.01){C.position.x+=(Math.random()-.5)*shake*shk*.25;C.position.y+=(Math.random()-.5)*shake*shk*.25;C.rotation.z=(Math.random()-.5)*shake*shk*.06}
 const mvg=key.ShiftLeft&&(key.KeyW||key.KeyA||key.KeyS||key.KeyD);fk*=Math.exp(-10*dt);C.fov+=(78+(mvg?7:0)+fk*4-C.fov)*Math.min(1,dt*10);C.updateProjectionMatrix();
 flashL*=Math.exp(-28*dt);muz.intensity=flashL*3;sw.x*=Math.exp(-8*dt);sw.y*=Math.exp(-8*dt);gun.rotation.y=sw.x;gun.rotation.z=sw.x*.5+sw.y*.3;
 $('#cx').style.transform=`scale(${(tg?.85:1)+kick*30})`;if(P.hp<35&&!P.dead)dmA=Math.max(dmA,.22+.12*Math.sin(t0*6));
 for(const b of bots)if(b.fl>0){b.fl-=dt;for(const c of b.m.children)c.material.emissive.setHex(b.fl>0?0x999999:0)}
 for(let i=pts.length-1;i>=0;i--){const p=pts[i];p.l-=dt;p.v.y-=16*dt;p.m.position.addScaledVector(p.v,dt);if(p.m.position.y<.05){p.m.position.y=.05;p.v.multiplyScalar(.4);p.v.y=0}p.m.scale.setScalar(p.s*Math.min(1,p.l/p.L*1.6));if(p.l<=0){S.remove(p.m);pts.splice(i,1)}}}
function endGame(t){if(over)return;over=1;run=0;won=t=='Victory';document.exitPointerLock&&document.exitPointerLock();const sc=mode=='Slayer'?Math.max(0,3000-Math.round(t0*10)):kills*100+(mode=='Survival'?wave*50:0),k='sd-best-'+mode+sel.map;let best=0,nb='';try{best=+localStorage.getItem(k)||0;if(sc>best){localStorage.setItem(k,sc);nb=' · New best!'}}catch(e){}
 $('#end').style.display='block';$('#et').innerHTML=`${t}<br><small>${mode} on ${sel.map}<br>${kills} kills · ${deaths} deaths · ${shots?Math.round(hits/shots*100):0}% accuracy<br>Score ${sc}${nb}<br>${awardXP()}</small>`}
