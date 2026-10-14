/* ---------- main menu, pause menu, dev menu ---------- */
let vol=1,shk=1,ma=0;const $$=q=>document.querySelectorAll(q);
for(const k in MAPS)$('#pm').insertAdjacentHTML('beforeend',`<option>${k}</option>`);
$('#nm').value='Player'+(100+Math.random()*900|0);buildMap();
$$('#nav button').forEach(b=>b.onclick=()=>{$$('#nav button').forEach(x=>x.classList.toggle('on',x==b));$$('.pn').forEach(p=>p.classList.toggle('on',p.id=='p-'+b.dataset.p))});$('#nav button').click();
const _sr=showRank;showRank=function(){_sr();$('#xpf').style.width=(prof.master||prof.lvl>=55?100:prof.xp/need()*100)+'%'};showRank();
function menuCam(dt){ma+=dt*.12;gun.visible=false;C.fov=70;C.updateProjectionMatrix();const r=H*.75;C.position.set(Math.cos(ma)*r,11,Math.sin(ma)*r);C.lookAt(0,1.5,0)}
/* lobby */
$('#host').onclick=hostMatch;$('#join').onclick=joinMatch;$('#startnet').onclick=()=>{if(conns.length<1)return lobby('Waiting for at least one friend to join');sel.map=$('#pm').value;netSend({t:'start',map:sel.map});startNet()};
/* pause */
function showPause(){$('#aa2').value=String(AA);$('#sn2').value=sens;$('#pause').style.display='block'}
function hidePause(){$('#pause').style.display='none';$('#pt').textContent='Paused'}
$('#resume').onclick=()=>R.domElement.requestPointerLock();
$('#aa2').onchange=e=>{AA=+e.target.value;$('#aa').value=e.target.value};$('#sn2').oninput=e=>{sens=+e.target.value;$('#sn').value=e.target.value};$('#vl').oninput=e=>vol=+e.target.value;$('#sk').oninput=e=>shk=+e.target.value;
$('#exit').onclick=()=>{run=0;over=1;paused=0;document.exitPointerLock();hidePause();$('#hud').style.display=$('#end').style.display='none';endDeath();netClose();for(const b of bots)S.remove(b.m);bots=[];for(const g of grs)S.remove(g.m);grs=[];buildMap();$('#menu').style.display='block';showRank()};
/* secret dev menu: click the bottom-left corner 5 times, then type "ohio" */
let hc=0,arm=0,buf='';$('#hot').onclick=()=>{if(++hc>=5){arm=1;buf='';hc=0}};
addEventListener('keydown',e=>{if(!arm||$('#menu').style.display=='none')return;buf=(buf+e.key).toLowerCase().slice(-4);if(buf=='ohio'){arm=0;$('#dev').style.display='flex'}});
$('#dev').onclick=e=>{const d=e.target.dataset.d;if(!d)return;
 if(d=='all')prof.all=1;else if(d=='lvl'){prof.lvl=55;prof.xp=0}else if(d=='master'){prof.pres=10;prof.master=1;prof.ml=1250;prof.xp=0}
 else if(d=='reset'){if(confirm('Delete ALL progress, camos and unlocks?')){try{localStorage.removeItem('sd-prof')}catch(x){}location.reload()}return}
 else{$('#dev').style.display='none';return}save();showRank()};
