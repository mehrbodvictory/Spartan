const $=q=>document.querySelector(q),V=(x,y,z)=>new THREE.Vector3(x,y,z),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
/* ---------- data ---------- */
const W={AR:{n:'Assault Rifle',d:9,r:.09,m:32,sp:.012,rc:1,pel:1,au:1,rl:2,len:.55,col:0x3a4a52},
SMG:{n:'SMG',d:6.5,r:.06,m:40,sp:.022,rc:.7,pel:1,au:1,rl:1.8,len:.4,col:0x5a4a40},
BR:{n:'Battle Rifle',d:30,r:.26,m:12,sp:.004,rc:2.5,pel:1,au:0,rl:2.2,len:.65,col:0x2f4a3a},
SG:{n:'Shotgun',d:11,r:.8,m:6,sp:.06,rc:6,pel:8,au:0,rl:2.8,len:.5,col:0x6a5a2a},
MG:{n:'Magnum',d:26,r:.3,m:8,sp:.005,rc:3,pel:1,au:0,rl:1.5,len:.3,col:0x666e74},
MP:{n:'Machine Pistol',d:5.5,r:.07,m:24,sp:.03,rc:.6,pel:1,au:1,rl:1.4,len:.25,col:0x3a3a4a}};
const PRI=['AR','SMG','BR','SG'],SEC=['MG','MP'];
const A={'Extended Mag':{m:1.5,t:'+50% magazine'},'Compensator':{rc:.55,t:'Less kick'},'Laser Sight':{sp:.5,t:'Tighter spread'},'Long Barrel':{d:1.12,t:'+12% damage'},'Fast Hands':{rl:.65,t:'Faster reload'},'Hollow Point':{d:1.18,rc:1.25,t:'+18% damage, more kick'}};
const K={'Marathon':'Move 15% faster','Overshield':'+50 shield','Scavenger':'Kills refill ammo','Spring Legs':'Jump higher'};
const GR={'Frag':{fuse:1.8,R:7,d:110,imp:0,t:'Bounces, 1.8s fuse'},'Impact':{fuse:4,R:5,d:85,imp:1,t:'Explodes on contact'}};
const MODES={'Slayer':'First to 20 kills. Bots respawn.','Survival':'One life. Endless waves.','Time Attack':'Most kills in 90 seconds.'};
const MAPS={
'Blockfort':{d:'Walled fort with a raised centre',H:28,sky:0x86b6d8,gr:0x55654f,bc:0x8d99a3,b(){const a=[[-4.5,-7,5,1.2,3],[4.5,-7,5,1.2,3],[-4.5,7,5,1.2,3],[4.5,7,5,1.2,3],[-7,-4.5,1.2,5,3],[-7,4.5,1.2,5,3],[7,-4.5,1.2,5,3],[7,4.5,1.2,5,3],[0,0,5,5,1]];for(const s of[-1,1]){a.push([s*18,18,3,3,1.5],[s*18,-18,3,3,1.5],[s*21,0,2,7,1],[0,s*21,7,2,1]);}return a}},
'Pillars':{d:'Open grid of tall cover',H:34,sky:0xc9a27a,gr:0x6b5a48,bc:0xb09878,b(){const a=[];for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){if(i||j)a.push([i*11,j*11,2.2,2.2,5]);if(i<2&&j<2)a.push([i*11+5.5,j*11+5.5,3,1,1]);}return a}},
'Canyon':{d:'Long walls with stepped ledges',H:36,sky:0x6d8fb0,gr:0x4a5a52,bc:0x7a8590,b(){const a=[[-9,-24,2,12,6],[-9,0,2,16,6],[-9,25,2,12,6],[9,-25,2,10,6],[9,-3,2,14,6],[9,22,2,16,6]];for(const s of[-1,1])a.push([s*20,0,3,6,1],[s*23,0,3,6,2],[s*26,0,3,6,3],[s*22,-18,4,4,1.2],[s*22,18,4,4,1.2]);return a}}};
/* ---------- state ---------- */
let L={p:'AR',s:'MG',pa:['Extended Mag'],sa:[],g:'Frag',pk:['Scavenger']},sel={mode:'Slayer',map:'Blockfort'};
const PRE={'Balanced':{p:'AR',s:'MG',pa:['Extended Mag'],sa:[],g:'Frag',pk:['Scavenger','Marathon']},'Rusher':{p:'SMG',s:'MP',pa:['Compensator','Fast Hands','Extended Mag'],sa:['Fast Hands'],g:'Impact',pk:['Marathon','Spring Legs','Overshield']},'Sharpshooter':{p:'BR',s:'MG',pa:['Long Barrel','Laser Sight','Compensator'],sa:['Hollow Point'],g:'Frag',pk:['Overshield','Scavenger']},'Brawler':{p:'SG',s:'MP',pa:['Extended Mag','Fast Hands','Laser Sight'],sa:[],g:'Impact',pk:['Overshield','Marathon','Scavenger']}},PD={Balanced:'Good at everything',Rusher:'Fast and fires quickly',Sharpshooter:'Accurate, hits hard',Brawler:'Shotgun for close fights'};
const LIM={pa:3,sa:2,pk:3};
const cost=()=>1+(L.s?1:0)+L.pa.length+L.sa.length+(L.g?1:0)+L.pk.length;
const desc=w=>`${Math.round(w.d)}${w.pel>1?'×'+w.pel:''} dmg · ${Math.round(60/w.r)} rpm · ${w.m} rounds`;
function chip(a,v,n,t,on){const lk=typeof unlocked=='function'&&!unlocked(v);return`<button class="c ${on?'on':''}${lk?' lk':''}" data-a="${a}" data-v="${v}"><b>${n}</b><i>${lk?'Unlocks at level '+UNL[v]:t}</i></button>`}
function ui(){
 $('#md').innerHTML=Object.keys(MODES).map(k=>chip('mode',k,k,MODES[k],sel.mode==k)).join('');
 $('#mp').innerHTML=Object.keys(MAPS).map(k=>chip('map',k,k,MAPS[k].d,sel.map==k)).join('');
 const at=(a)=>Object.keys(A).map(k=>chip(a,k,k,A[k].t,L[a].includes(k))).join('');
 $('#ld').innerHTML=`<h2>Quick picks (or build your own below)</h2><div class="row">${Object.keys(PRE).map(k=>chip('preset',k,k,PD[k],0)).join('')}</div><h2>Primary weapon</h2><div class="row">${PRI.map(k=>chip('p',k,W[k].n,desc(W[k]),L.p==k)).join('')}</div>
 <h2>Primary attachments (up to 3)</h2><div class="row">${at('pa')}</div>
 <h2>Secondary weapon (optional)</h2><div class="row">${SEC.map(k=>chip('s',k,W[k].n,desc(W[k]),L.s==k)).join('')}</div>
 ${L.s?`<h2>Secondary attachments (up to 2)</h2><div class="row">${at('sa')}</div>`:''}
 <h2>Grenade (optional)</h2><div class="row">${Object.keys(GR).map(k=>chip('g',k,k,GR[k].t,L.g==k)).join('')}</div>
 <h2>Perks (up to 3)</h2><div class="row">${Object.keys(K).map(k=>chip('pk',k,k,K[k],L.pk.includes(k))).join('')}</div>`;
 $('#pts').textContent=cost()+' / 10 points';$('#pts').classList.remove('bad');
}
document.addEventListener('click',e=>{const b=e.target.closest('.c');if(!b||b.classList.contains('lk'))return;const a=b.dataset.a,v=b.dataset.v;
 if(a=='mode'||a=='map'){sel[a]=v;if(a=='map')buildMap();return ui()}
 if(a=='preset'){L=JSON.parse(JSON.stringify(PRE[v]));sanitize();return ui()}
 const o=JSON.stringify(L);
 if(a=='p')L.p=v;else if(a=='s'||a=='g'){L[a]=L[a]==v?null:v;if(a=='s'&&!L.s)L.sa=[]}
 else{const r=L[a],i=r.indexOf(v);if(i>=0)r.splice(i,1);else if(r.length<LIM[a])r.push(v)}
 if(cost()>10){L=JSON.parse(o);ui();$('#pts').classList.add('bad');$('#pts').textContent='10 / 10 points: remove something first';return}
 ui()});
ui();
